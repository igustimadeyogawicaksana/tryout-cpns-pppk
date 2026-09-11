import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { examService } from '../src/lib/server/exam-service';
import { questionService } from '../src/lib/server/question-service';
import { rankingService } from '../src/lib/server/ranking-service';
import { adminUsers, rankingMembers } from '../src/lib/server/schema';
import {
  user,
  questionVersions,
  examPackages,
  examAttempts,
  auditLog
} from '../src/lib/server/schema';
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
test('competition isolation, hidden review, tie ranking and immediate opt-out', () => {
  const f = fixture();
  try {
    let time = 1000;
    const ranking = rankingService(f.db, () => time);
    f.db.insert(adminUsers).values({ userId: 'admin', createdAt: time }).run();
    for (const id of ['third', 'fourth'])
      f.db
        .insert(user)
        .values({
          id,
          name: id,
          email: id + '@test.invalid',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .run();
    const p = f.svc.create(f.input, 'admin');
    f.svc.publish(p, 'admin');
    ranking.create(p, 30000, 'admin');
    assert.throws(() => ranking.create(p, 40000, 'admin'));
    assert.throws(() => ranking.join(p, 'admin', 'Operator', true));
    assert.throws(() => ranking.join(p, 'unverified', 'Unverified', true));
    assert.equal(f.db.select().from(rankingMembers).all().length, 0);
    assert.throws(() => f.svc.start(p, 'student'));
    assert.throws(() => ranking.board(p, 'student'));
    const actors = ['student', 'other', 'third', 'fourth'];
    for (const [index, actor] of actors.entries()) {
      const id = ranking.join(p, actor, 'Alias' + index, true);
      assert.equal(ranking.join(p, actor, 'Ignored', false), id);
      assert.equal(f.svc.view(id, actor).attempt.deadlineAt, 30000);
      f.svc.submit(id, actor);
      const review = f.svc.view(id, actor);
      assert.equal(review.reviewAvailable, false);
      assert.ok(!JSON.stringify(review.items).includes('explanation'));
      assert.ok(review.items.every((q) => q.options.every((o) => !('score' in o))));
      // Controlled scored fixtures to exercise tied and zero totals independently of grading tests.
      f.db
        .update(examAttempts)
        .set({ result: { total: [10, 5, 5, 0][index], maximum: 10, subscores: {} } })
        .where(eq(examAttempts.id, id))
        .run();
    }
    const board = ranking.board(p, 'other');
    assert.deepEqual(
      board.entries.map((r) => r.rank),
      [1, 2, 2, 4]
    );
    assert.equal(board.mine?.rank, 2);
    assert.ok(!JSON.stringify(board).includes('@test.invalid'));
    ranking.hide(p, 'student');
    assert.deepEqual(
      ranking.board(p, 'other').entries.map((r) => r.rank),
      [1, 1, 3]
    );
    assert.ok(!ranking.board(p, 'other').entries.some((r) => r.alias === 'Alias0'));
    for (let i = 0; i < 20; i++) {
      const actor = 'extra' + i;
      f.db
        .insert(user)
        .values({
          id: actor,
          name: actor,
          email: actor + '@test.invalid',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .run();
      f.svc.submit(ranking.join(p, actor, 'Extra' + i, true), actor);
    }
    const secondPage = ranking.board(p, 'other', 2);
    assert.equal(secondPage.count, 23);
    assert.equal(secondPage.entries.length, 3);
    assert.ok(secondPage.entries.every((r) => r.rank === 3));
    assert.equal(secondPage.mine?.rank, 1);
    assert.equal(secondPage.minePage, 1);
    assert.equal(ranking.board(p, 'other', 999).page, 2);
    assert.equal(ranking.board(p, 'other', NaN).page, 1);
    assert.equal(ranking.board(p, 'other', -1).page, 1);
    assert.equal(ranking.board(p, 'other', 1).entries.length, 20);
    const practice = f.svc.create(f.input, 'admin');
    f.svc.publish(practice, 'admin');
    f.svc.start(practice, 'student');
    assert.throws(() => ranking.create(practice, 40000, 'admin'));
    time = 30000;
    f.setTime(time);
    const attempt = f.svc.history('other').find((h) => h.package.id === p)!.attempt.id;
    assert.equal(f.svc.view(attempt, 'other').reviewAvailable, true);
  } finally {
    f.sqlite.close();
  }
});
test('archiving hides packages and blocks new starts without removing sessions or results', () => {
  const f = fixture();
  try {
    const p = f.svc.create(f.input, 'admin');
    f.svc.publish(p, 'admin');
    const attempt = f.svc.start(p, 'student');
    assert.throws(() => f.svc.archive(p, 'admin', 'short'));
    assert.equal(f.svc.list().length, 1);
    f.svc.archive(p, 'admin', 'Edisi latihan sudah ditutup');
    f.svc.archive(p, 'admin', 'Edisi latihan sudah ditutup');
    assert.equal(f.svc.list().length, 0);
    assert.equal(f.svc.list(true)[0].status, 'archived');
    assert.throws(() => f.svc.details(p));
    assert.throws(() => f.svc.start(p, 'other'));
    assert.throws(() => f.svc.publish(p, 'admin'));
    const view = f.svc.view(attempt, 'student');
    f.svc.save(attempt, 'student', view.items[0].id, view.items[0].options[0].id, 1);
    f.svc.submit(attempt, 'student');
    assert.equal(f.svc.history('student')[0].attempt.status, 'scored');
    assert.equal(
      f.db.select().from(auditLog).where(eq(auditLog.action, 'package.archive')).all().length,
      1
    );
  } finally {
    f.sqlite.close();
  }
});
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
