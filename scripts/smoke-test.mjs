import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep, basename } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { testQuestionApi } from './test-question-api.mjs';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';

// Disposable database and random credentials: never touch the operator's database.
const temp = mkdtempSync(join(tmpdir(), 'tryout-smoke-'));
const port = 5198,
  origin = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString('base64url');
const apiToken = randomBytes(32).toString('base64url');
const env = {
  ...process.env,
  NODE_ENV: 'production',
  HOST: '127.0.0.1',
  PORT: String(port),
  BODY_SIZE_LIMIT: '4M',
  ORIGIN: origin,
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: randomBytes(48).toString('hex'),
  DATABASE_PATH: join(temp, 'test.sqlite'),
  ADMIN_PASSWORD: password,
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: ''
};
let server;
function seed(email) {
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', 'scripts/create-admin.ts', email, 'Test operator'],
    { env, encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
}
try {
  seed('admin@smoke.test');
  seed('participant@smoke.test');
  const database = new Database(env.DATABASE_PATH);
  env.QUESTIONS_API_TOKEN_SHA256 = createHash('sha256').update(apiToken).digest('hex');
  env.QUESTIONS_API_USER_ID = database
    .prepare('SELECT id FROM user WHERE email = ?')
    .get('admin@smoke.test').id;
  database
    .prepare('DELETE FROM admin_users WHERE user_id = (SELECT id FROM user WHERE email = ?)')
    .run('participant@smoke.test');
  database.close();
  server = spawn(process.execPath, ['build/index.js'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  server.stdout.on('data', (chunk) => {
    logs += chunk;
  });
  server.stderr.on('data', (chunk) => {
    logs += chunk;
  });
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error('Test server exited: ' + logs);
    try {
      if ((await fetch(origin + '/health')).ok) {
        ready = true;
        break;
      }
    } catch {
      /* startup */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Test server did not become ready');
  const anonymous = await fetch(origin + '/admin/questions', { redirect: 'manual' });
  assert.equal(anonymous.status, 303);
  assert.equal(anonymous.headers.get('location'), '/login');
  const anonymousPost = await fetch(origin + '/admin/questions/new?/save', {
    method: 'POST',
    redirect: 'manual',
    headers: { Origin: origin, Accept: 'text/html' },
    body: new URLSearchParams({ payload: '{}' })
  });
  assert.equal(anonymousPost.status, 303);
  const login = async (email) => {
    const response = await fetch(origin + '/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ email, password })
    });
    assert.equal(response.status, 200, 'Login failed: ' + (await response.clone().text()));
    const cookies = response.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    assert.ok(cookies);
    return cookies;
  };
  const cookie = await login('admin@smoke.test');
  const participantCookie = await login('participant@smoke.test');
  assert.equal(
    (await fetch(origin + '/admin/questions', { headers: { Cookie: participantCookie } })).status,
    403
  );
  assert.equal(
    (
      await fetch(origin + '/admin/questions/import/example', {
        headers: { Cookie: participantCookie }
      })
    ).status,
    403
  );
  const list = await fetch(origin + '/admin/questions', { headers: { Cookie: cookie } });
  assert.equal(list.status, 200);
  assert.match(await list.text(), /Mulai dari satu soal/);
  const source = JSON.parse(readFileSync('examples/question-bank-import.json', 'utf8'));
  source.questions[0].external_key = 'HTTP-TIU-001';
  const create = await fetch(origin + '/admin/questions/new?/save', {
    method: 'POST',
    redirect: 'manual',
    headers: { Cookie: cookie, Origin: origin, Accept: 'text/html' },
    body: new URLSearchParams({ payload: JSON.stringify(source.questions[0]) })
  });
  assert.equal(create.status, 303, 'Create failed: ' + (await create.clone().text()));
  const location = create.headers.get('location');
  assert.ok(location?.startsWith('/admin/questions/'));
  const detail = await fetch(origin + location, { headers: { Cookie: cookie } });
  assert.equal(detail.status, 200);
  assert.match(await detail.text(), /HTTP-TIU-001/);
  const crossSite = await fetch(origin + '/admin/questions/new?/save', {
    method: 'POST',
    redirect: 'manual',
    headers: { Cookie: cookie, Origin: 'https://attacker.invalid' },
    body: new URLSearchParams({ payload: JSON.stringify(source.questions[1]) })
  });
  assert.equal(crossSite.status, 403);
  const publicSignup = await fetch(origin + '/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: 'new@smoke.test', name: 'Nobody', password })
  });
  assert.ok(publicSignup.status >= 400, 'Public signup must stay disabled');
  await testQuestionApi({
    origin,
    apiToken,
    cookie,
    participantCookie,
    databasePath: env.DATABASE_PATH,
    actor: env.QUESTIONS_API_USER_ID
  });
  console.log(
    'HTTP smoke: login, admin-only reads/writes, draft persistence, disabled signup and cross-site protection passed.'
  );
} finally {
  if (server && server.exitCode === null) {
    server.kill();
    await new Promise((resolve) => server.once('exit', resolve));
  }
  // Verify the resolved temporary target before recursive removal, especially on Windows.
  assert.ok(
    resolve(temp).startsWith(resolve(tmpdir()) + sep) && basename(temp).startsWith('tryout-smoke-')
  );
  rmSync(temp, { recursive: true, force: true });
}
