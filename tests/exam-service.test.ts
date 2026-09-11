import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { examService } from '../src/lib/server/exam-service';
import { questionService } from '../src/lib/server/question-service';
import { user, questionVersions, examPackages, examAttempts } from '../src/lib/server/schema';
import { subtests, parseBatch } from '../src/lib/question-input';
import { eq } from 'drizzle-orm';
function fixture() {
  const { db, sqlite } = openDatabase(':memory:');
  migrateDatabase(db);
  for (const id of ['admin', 'student', 'other', 'unverified'])
    db.insert(user)
      .values({
        id,
        name: id,
        email: id + '@test.invalid',
        emailVerified: id !== 'unverified',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .run();
  let time = 1000;
  const svc = examService(db, () => time);
  const qs = questionService(db);
  const versions = parseBatch(
    readFileSync('examples/question-bank-import.json', 'utf8')
  ).questions.map((q) => {
    const id = qs.create(q, 'admin');
    qs.transition(id, 1, 'in_review', 'admin', '', false);
    qs.transition(id, 2, 'approved', 'admin', '', true);
    qs.transition(id, 3, 'published', 'admin', '', false);
    return id;
  });
  const input = {
    title: 'Test practice',
    examType: 'CPNS',
    formation: '',
    targetYear: 2027,
    reference: 'Latihan sintetis tanpa klaim resmi',
    durationMinutes: 1,
    quotas: Object.fromEntries(subtests.map((s) => [s, ['TIU', 'TKP'].includes(s) ? 1 : 0])),
    versionIds: versions
  };
  return { db, sqlite, svc, qs, input, versions, setTime: (n: number) => (time = n) };
}
test('packages enforce quotas and immutable delivery; retries, ownership and grading', () => {
  const f = fixture();
  try {
    assert.throws(() =>
      f.svc.create({ ...f.input, quotas: { ...f.input.quotas, TIU: 2 } }, 'admin')
    );
    assert.equal(f.db.select().from(examPackages).all().length, 0);
    const p = f.svc.create(f.input, 'admin');
    assert.throws(() => f.svc.start(p, 'student'));
    f.svc.publish(p, 'admin');
    assert.throws(() => f.svc.start(p, 'unverified'), /Verifikasi/);
    const id = f.svc.start(p, 'student');
    assert.equal(f.svc.start(p, 'student'), id);
    assert.equal(f.db.select().from(examAttempts).all().length, 1);
    assert.throws(() => f.svc.view(id, 'other'));
    const view = f.svc.view(id, 'student');
    assert.ok(!JSON.stringify(view).includes('explanation'));
    assert.ok(!JSON.stringify(view).includes('correct_option_code'));
    const a = view.items[0],
      b = view.items[1];
    assert.throws(() => f.svc.save(id, 'student', a.id, b.options[0].id, 1));
    f.svc.save(id, 'student', a.id, a.options.find((o) => o.code === 'C')!.id, 1);
    assert.throws(() => f.svc.save(id, 'student', a.id, null, 1), /tab lain/);
    f.svc.save(id, 'student', b.id, b.options.find((o) => o.code === 'A')!.id, 2);
    const result = f.svc.submit(id, 'student');
    assert.equal(result.result?.total, 10);
    assert.deepEqual(f.svc.submit(id, 'student'), result);
    assert.throws(() => f.svc.save(id, 'student', a.id, null, 3));
    f.db
      .update(questionVersions)
      .set({ content: { ...f.qs.get(f.versions[0]).content, prompt_md: 'changed source' } })
      .where(eq(questionVersions.id, f.versions[0]))
      .run();
    assert.notEqual(f.svc.view(id, 'student').items[0].prompt, 'changed source');
  } finally {
    f.sqlite.close();
  }
});
test('deadline finalizes abandoned sessions and rejects late saves', () => {
  const f = fixture();
  try {
    const p = f.svc.create(f.input, 'admin');
    f.svc.publish(p, 'admin');
    const id = f.svc.start(p, 'student');
    f.setTime(61000);
    f.svc.expire();
    const view = f.svc.view(id, 'student');
    assert.equal(view.attempt.status, 'scored');
    assert.equal(view.attempt.endedReason, 'deadline');
    assert.equal(view.attempt.result?.total, 0);
    assert.equal(view.attempt.finishedAt, 61000);
    assert.throws(() =>
      f.svc.save(id, 'student', view.items[0].id, view.items[0].options[0].id, 1)
    );
    f.svc.expire();
    assert.equal(f.svc.start(p, 'student'), id);
  } finally {
    f.sqlite.close();
  }
});
