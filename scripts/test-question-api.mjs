import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Database from 'better-sqlite3';

export async function testQuestionApi({
  origin,
  apiToken,
  cookie,
  participantCookie,
  databasePath,
  actor
}) {
  const templates = JSON.parse(
    readFileSync('examples/question-bank-import.json', 'utf8')
  ).questions;
  const one = { ...templates[0], external_key: 'API-TIU-001' };
  const send = (body, key = 'test-api-0001', batch = false, headers = {}) =>
    fetch(origin + '/api/admin/questions' + (batch ? '/batch' : ''), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
        'Idempotency-Key': key,
        ...headers
      },
      body: JSON.stringify(body)
    });
  for (const suffix of ['', '/batch']) {
    assert.equal(
      (
        await fetch(origin + '/api/admin/questions' + suffix, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}'
        })
      ).status,
      401
    );
  }
  assert.equal((await send(one, undefined, false, { Authorization: 'Bearer wrong' })).status, 401);
  for (const Cookie of [cookie, participantCookie])
    assert.equal((await send(one, undefined, false, { Authorization: '', Cookie })).status, 401);
  assert.equal((await send(one, '', false)).status, 400);
  assert.equal(
    (await send(one, undefined, false, { 'Content-Type': 'application/octet-stream' })).status,
    415
  );
  assert.equal((await send({ ...one, status: 'published' })).status, 422);
  assert.equal((await send({ ...one, options: [] })).status, 422);
  const malformed = await fetch(origin + '/api/admin/questions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'malformed-001'
    },
    body: '{'
  });
  assert.equal(malformed.status, 400);
  assert.equal((await send({ ...one, prompt_md: 'x'.repeat(2_000_001) })).status, 413);
  const created = await send(one);
  assert.equal(created.status, 201, await created.clone().text());
  const first = await created.json();
  assert.equal(first.initial_status, 'draft');
  assert.equal(first.items.length, 1);
  assert.equal(
    (await fetch(origin + first.items[0].admin_url, { headers: { Cookie: cookie } })).status,
    200
  );
  const retry = await send(one);
  assert.equal(retry.status, 200);
  assert.deepEqual((await retry.json()).items, first.items);
  assert.equal((await send({ ...one, prompt_md: 'Changed' })).status, 409);
  assert.equal((await send(one, 'different-key')).status, 409);
  const two = { ...templates[1], external_key: 'API-TKP-002' };
  assert.equal(
    (
      await send(
        { questions: [two, { ...one, external_key: 'API-BAD', options: [] }] },
        'invalid-batch',
        true
      )
    ).status,
    422
  );
  assert.equal((await send({ questions: [two, one] }, 'conflict-batch', true)).status, 409);
  const validBatch = { questions: [two, { ...one, external_key: 'API-TIU-003' }] };
  const concurrent = await Promise.all([
    send(validBatch, 'valid-batch', true),
    send(validBatch, 'valid-batch', true)
  ]);
  assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 201]);
  assert.equal((await send({ questions: [two, two] }, 'dupe-batch', true)).status, 422);
  assert.equal((await send({ questions: [] }, 'empty-batch', true)).status, 422);
  assert.equal((await send({ questions: Array(101).fill(two) }, 'large-batch', true)).status, 422);
  const db = new Database(databasePath);
  try {
    assert.equal(
      db.prepare("SELECT count(*) n FROM questions WHERE external_key LIKE 'API-%'").get().n,
      3
    );
    assert.equal(
      db
        .prepare(
          "SELECT count(*) n FROM question_versions WHERE json_extract(content,'$.external_key') LIKE 'API-%' AND status='draft'"
        )
        .get().n,
      3
    );
    assert.equal(
      db.prepare("SELECT count(*) n FROM audit_log WHERE action='question.api_upload'").get().n,
      2
    );
    assert.equal(
      db.prepare("SELECT count(*) n FROM questions WHERE external_key='API-BAD'").get().n,
      0
    );
    db.prepare('DELETE FROM admin_users WHERE user_id=?').run(actor);
    assert.equal((await send({ ...one, external_key: 'REVOKED-001' }, 'revoked-key')).status, 403);
    db.prepare('INSERT INTO admin_users(user_id,created_at) VALUES(?,?)').run(actor, Date.now());
  } finally {
    db.close();
  }
  console.log(
    'Question API: bearer auth, validation, size limit, atomic batches, concurrent retries, draft status, audit and admin revocation passed.'
  );
}
