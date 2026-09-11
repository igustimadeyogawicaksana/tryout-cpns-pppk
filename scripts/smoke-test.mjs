import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep, basename } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { testQuestionApi } from './test-question-api.mjs';
import { testExamHttp } from './test-exam-http.mjs';
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
  AUTH_MAIL_MODE: 'test',
  AUTH_MAIL_TEST_DIR: join(temp, 'mail'),
  GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'test-only-not-a-real-google-secret'
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
  const social = await fetch(origin + '/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({
      provider: 'google',
      callbackURL: '/account',
      newUserCallbackURL: '/dashboard',
      errorCallbackURL: '/login?oauth_error=1',
      disableRedirect: true
    })
  });
  assert.equal(social.status, 200, await social.clone().text());
  const socialBody = await social.json();
  const googleUrl = new URL(socialBody.url);
  assert.equal(googleUrl.hostname, 'accounts.google.com');
  assert.equal(googleUrl.searchParams.get('client_id'), env.GOOGLE_CLIENT_ID);
  assert.equal(googleUrl.searchParams.get('redirect_uri'), origin + '/api/auth/callback/google');
  assert.ok(googleUrl.searchParams.get('state'));
  assert.ok(!socialBody.url.includes(env.GOOGLE_CLIENT_SECRET));
  const untrustedCallback = await fetch(origin + '/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({
      provider: 'google',
      callbackURL: 'https://attacker.invalid/',
      disableRedirect: true
    })
  });
  assert.ok(untrustedCallback.status >= 400);
  console.log(
    'Google OAuth initiation: authorization URL, callback, state, secret exclusion and untrusted redirect rejection passed (no live Google request).'
  );
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
  for (const path of ['/', '/paket', '/paket?jenis=CPNS', '/paket?jenis=PPPK']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.ok(!(await response.text()).includes('correct_option_code'));
  }
  assert.equal((await fetch(origin + '/dashboard', { redirect: 'manual' })).status, 303);
  for (const [sessionCookie, destination] of [
    [cookie, '/admin/questions'],
    [participantCookie, '/dashboard']
  ]) {
    for (const path of ['/account', '/login']) {
      const response = await fetch(origin + path, {
        headers: { Cookie: sessionCookie },
        redirect: 'manual'
      });
      assert.equal(response.status, 303);
      assert.equal(response.headers.get('location'), destination);
    }
  }
  const dashboard = await fetch(origin + '/dashboard', { headers: { Cookie: participantCookie } });
  assert.equal(dashboard.status, 200);
  assert.match(dashboard.headers.get('cache-control'), /no-store/);
  assert.match(await dashboard.text(), /Belum ada riwayat ujian/);
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
  const tryUrl = origin + location + '/try';
  assert.equal((await fetch(tryUrl, { redirect: 'manual' })).status, 303);
  assert.equal((await fetch(tryUrl, { headers: { Cookie: participantCookie } })).status, 403);
  const preview = await fetch(tryUrl, { headers: { Cookie: cookie } });
  const previewHtml = await preview.text();
  assert.equal(preview.status, 200);
  assert.ok(!previewHtml.includes('correct_option_code'), 'Preview must not expose answer keys');
  assert.ok(
    !previewHtml.includes(source.questions[0].explanation_md),
    'Preview must not expose explanation'
  );
  const checkAnswer = (choice, revision = '1', sessionCookie = cookie) =>
    fetch(tryUrl, {
      method: 'POST',
      redirect: 'manual',
      headers: { Cookie: sessionCookie, Origin: origin, Accept: 'text/html' },
      body: new URLSearchParams({ choice, revision })
    });
  assert.equal((await checkAnswer('C', '1', participantCookie)).status, 403);
  assert.equal((await checkAnswer('C', '1', '')).status, 303);
  assert.equal((await checkAnswer('Z')).status, 400);
  assert.equal((await checkAnswer('C', '999')).status, 409);
  for (const [choice, score] of [
    ['C', 5],
    ['A', 0],
    ['blank', 0]
  ]) {
    const checked = await checkAnswer(choice);
    assert.equal(checked.status, 200);
    const html = await checked.text();
    assert.match(html, new RegExp(`Skor ${score} / 5`));
    assert.ok(html.includes(source.questions[0].explanation_md));
  }
  console.log(
    'Question try: hidden key/explanation, correct/wrong/blank scoring, invalid choice, stale revision and admin access passed.'
  );
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
  assert.equal(publicSignup.status, 200, await publicSignup.clone().text());
  assert.ok(!publicSignup.headers.get('set-cookie')?.includes('session_token'));
  const emails = () =>
    readdirSync(env.AUTH_MAIL_TEST_DIR).map((f) =>
      JSON.parse(readFileSync(join(env.AUTH_MAIL_TEST_DIR, f), 'utf8'))
    );
  const verificationMail = emails().find(
    (m) => m.to === 'new@smoke.test' && m.subject.startsWith('Verifikasi')
  );
  assert.ok(verificationMail);
  const verified = await fetch(verificationMail.url, { redirect: 'manual' });
  assert.equal(verified.status, 302);
  const newCookie = await login('new@smoke.test');
  assert.equal(
    (await fetch(origin + '/admin/questions', { headers: { Cookie: newCookie } })).status,
    403
  );
  const resetRequest = await fetch(origin + '/api/auth/request-password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ email: 'new@smoke.test', redirectTo: '/login?mode=reset' })
  });
  assert.equal(resetRequest.status, 200);
  const resetMail = emails().find(
    (m) => m.to === 'new@smoke.test' && m.subject.startsWith('Atur ulang')
  );
  assert.ok(resetMail);
  const resetRedirect = await fetch(resetMail.url, { redirect: 'manual' });
  const resetUrl = new URL(resetRedirect.headers.get('location'), origin);
  const reset = await fetch(origin + '/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({
      token: resetUrl.searchParams.get('token'),
      newPassword: password + 'changed'
    })
  });
  assert.equal(reset.status, 200, await reset.clone().text());
  assert.equal(
    (await fetch(origin + '/dashboard', { headers: { Cookie: newCookie }, redirect: 'manual' }))
      .status,
    303
  );
  console.log(
    'Email registration, verification, participant permissions, password reset and session revocation passed using private test outbox.'
  );
  await testQuestionApi({
    origin,
    apiToken,
    cookie,
    participantCookie,
    databasePath: env.DATABASE_PATH,
    actor: env.QUESTIONS_API_USER_ID
  });
  await testExamHttp({ origin, cookie, participantCookie, databasePath: env.DATABASE_PATH });
  console.log('HTTP smoke: authentication, question API and participant exams passed.');
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
