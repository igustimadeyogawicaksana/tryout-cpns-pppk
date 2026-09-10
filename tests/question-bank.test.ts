import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { questionService } from '../src/lib/server/question-service';
import { parseBatch, scoreAnswer } from '../src/lib/question-input';
import { user, questions, auditLog, questionVersions } from '../src/lib/server/schema';
import { eq } from 'drizzle-orm';
const raw = readFileSync('examples/question-bank-import.json', 'utf8');
function fixture() {
  const { db, sqlite } = openDatabase(':memory:');
  migrateDatabase(db);
  db.insert(user)
    .values({
      id: 'admin',
      email: 'admin@test.example',
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .run();
  return { db, sqlite, service: questionService(db) };
}
test('single correct, weighted and blank scoring use stable codes', () => {
  const [tiu, tkp] = parseBatch(raw).questions;
  assert.equal(scoreAnswer(tiu, 'C'), 5);
  assert.equal(scoreAnswer(tiu, 'A'), 0);
  assert.equal(scoreAnswer(tiu, null), 0);
  assert.equal(scoreAnswer(tkp, 'A'), 5);
  assert.equal(scoreAnswer(tkp, 'E'), 1);
  assert.equal(scoreAnswer(tkp, null), 0);
  assert.throws(() => scoreAnswer(tiu, 'Z'));
});
test('invalid import rejects duplicates, missing weighted scores and oversize payloads', () => {
  const batch = JSON.parse(raw);
  batch.questions.push(batch.questions[0]);
  assert.throws(() => parseBatch(JSON.stringify(batch)), /duplikat/);
  const missing = JSON.parse(raw);
  delete missing.questions[1].options[0].score;
  assert.throws(() => parseBatch(JSON.stringify(missing)), /bobot/i);
  assert.throws(() => parseBatch(' '.repeat(2_000_001)), /2 MB/);
});
test('import preview is read-only, commit is idempotent, changed batch key contents rejected', () => {
  const { db, sqlite, service } = fixture();
  try {
    const preview = service.preview(raw);
    assert.equal(db.select().from(questions).all().length, 0);
    assert.deepEqual(service.import(raw, preview.hash, 'admin'), { count: 2, repeated: false });
    assert.deepEqual(service.import(raw, preview.hash, 'admin'), { count: 2, repeated: true });
    assert.equal(db.select().from(questions).all().length, 2);
    const changed = JSON.parse(raw);
    changed.questions[0].prompt_md += ' changed';
    assert.throws(() => service.preview(JSON.stringify(changed)), /isi berbeda/);
    assert.throws(() => service.import(raw, 'wronghash', 'admin'), /preview/);
  } finally {
    sqlite.close();
  }
});
test('failed import rolls back questions and audit records', () => {
  const { db, sqlite, service } = fixture();
  try {
    const preview = service.preview(raw);
    assert.throws(() => service.import(raw, preview.hash, 'nonexistent-admin'), /FOREIGN KEY/);
    assert.equal(db.select().from(questions).all().length, 0);
    assert.equal(db.select().from(auditLog).all().length, 0);
  } finally {
    sqlite.close();
  }
});
test('stale draft edits rejected; publication immutable; new revision preserves old question', () => {
  const { db, sqlite, service } = fixture();
  try {
    const content = parseBatch(raw).questions[0],
      id = service.create(content, 'admin');
    service.save(id, 1, { ...content, prompt_md: 'Pertanyaan direvisi' }, 'admin');
    assert.throws(() => service.save(id, 1, content, 'admin'), /tab lain/);
    service.transition(id, 2, 'in_review', 'admin', '', false);
    assert.throws(() => service.transition(id, 3, 'approved', 'admin', '', false), /Konfirmasikan/);
    service.transition(id, 3, 'approved', 'admin', '', true);
    service.transition(id, 4, 'published', 'admin', '', false);
    assert.throws(() => service.save(id, 5, content, 'admin'), /draft/);
    const next = service.revise(id, 'admin', 'Perjelas bahasa');
    service.save(next, 1, content, 'admin');
    assert.equal(service.get(id).content.prompt_md, 'Pertanyaan direvisi');
    assert.equal(service.get(next).version, 2);
    assert.throws(() => service.revise(id, 'admin', 'retry'), /lebih baru/);
    assert.equal(
      db
        .select()
        .from(questionVersions)
        .where(eq(questionVersions.questionId, service.get(id).questionId))
        .all().length,
      2
    );
  } finally {
    sqlite.close();
  }
});
test('incomplete drafts may save but cannot enter review; code cannot be overwritten', () => {
  const { sqlite, service } = fixture();
  try {
    const content = { ...parseBatch(raw).questions[0], prompt_md: '' },
      id = service.create(content, 'admin');
    assert.throws(() => service.transition(id, 1, 'in_review', 'admin', '', false), /Pertanyaan/);
    assert.throws(() => service.create(content, 'admin'), /sudah dipakai/);
    assert.throws(
      () => service.save(id, 1, { ...content, external_key: 'NEW-ID' }, 'admin'),
      /tidak boleh diganti/
    );
    assert.throws(
      () => service.transition(id, 1, 'published', 'admin', '', true),
      /tidak diizinkan/
    );
  } finally {
    sqlite.close();
  }
});
