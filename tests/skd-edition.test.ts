import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { buildQuestions, validateQuestions, installEdition } from '../scripts/content/skd-edition';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { user, adminUsers, examItems, examOptions, examAttempts, questionVersions, examPackages } from '../src/lib/server/schema';
import { questionService } from '../src/lib/server/question-service';
import { examService } from '../src/lib/server/exam-service';
import { subtests } from '../src/lib/question-input';

test('SKD content rejects number-only duplicates and validates per-option TKP rationale', () => {
  const content = buildQuestions();
  const duplicate = structuredClone(content);
  duplicate[1].prompt_md = duplicate[0].prompt_md + ' (Latihan 99)';
  assert.throws(() => validateQuestions(duplicate), /Repeated content/);
  const broken = structuredClone(content);
  broken[65].options[0].score = 5;
  broken[65].options[1].score = 5;
  assert.throws(() => validateQuestions(broken));
  assert.equal(content.filter(q => q.topic_code.startsWith('FIGURAL')).length, 10);
  // Independently checked numeric answers, in authored order (not option letters).
  const expected = ['Rp204.000', '9 hari', '40', '90', '2 jam 30 menit', '9', '17/12', '63', '42', '2/5', '38 cm', '25%', '2 jam', '8 km', '30'];
  expected.forEach((answer, i) => {
    const q = content[i + 30];
    assert.equal(q.options.find(o => o.code === q.correct_option_code)!.text_md, answer);
  });
});

test('new SKD edition preserves old sessions; delivered choices grade 550, 45 and 0', () => {
  const { db, sqlite } = openDatabase(':memory:');
  migrateDatabase(db);
  try {
    for (const id of ['admin', 'student']) db.insert(user).values({ id, name: id, email: `${id}@test.invalid`, emailVerified: true, createdAt: new Date(), updatedAt: new Date() }).run();
    db.insert(adminUsers).values({ userId: 'admin', createdAt: Date.now() }).run();
    const content = buildQuestions(), bank = questionService(db), exams = examService(db);
    const version = bank.create(content[0], 'admin');
    for (const next of ['in_review', 'approved', 'published'] as const) bank.transition(version, bank.get(version).revision, next, 'admin', '', next === 'approved');
    const oldPackage = exams.create({ title: 'Old trial fixture', examType: 'CPNS', formation: '', targetYear: 2027, reference: 'Old fixture to preserve', durationMinutes: 100, quotas: Object.fromEntries(subtests.map(s => [s, s === 'TWK' ? 1 : 0])), versionIds: [version] }, 'admin');
    exams.publish(oldPackage, 'admin');
    const oldAttempt = exams.start(oldPackage, 'student');
    exams.submit(oldAttempt, 'student');
    const oldItems = db.select().from(examItems).all();
    const oldOptions = db.select().from(examOptions).all();
    const oldResult = db.select().from(examAttempts).all();
    const oldContent = bank.get(version).content;
    assert.throws(() => installEdition(db, 'student'), /administrator/);
    const installed = installEdition(db, 'admin');
    assert.equal(installed.repeated, false);
    assert.deepEqual(db.select().from(examItems).where(eq(examItems.packageId, oldPackage)).all(), oldItems);
    assert.deepEqual(db.select().from(examOptions).all().filter(o => oldOptions.some(v => v.id === o.id)), oldOptions);
    assert.deepEqual(db.select().from(examAttempts).all(), oldResult);
    assert.deepEqual(bank.get(version).content, oldContent);
    assert.equal(exams.getPackage(oldPackage).status, 'archived');
    assert.deepEqual(installEdition(db, 'admin'), { ...installed, repeated: true });
    assert.equal(db.select().from(examPackages).all().length, 2);
    assert.equal(db.select().from(questionVersions).all().length, 111);
    for (const mode of ['best', 'worst', 'blank'] as const) {
      const id = exams.start(installed.packageId, 'student');
      const view = exams.view(id, 'student');
      assert.equal(view.items.length, 110);
      let revision = view.attempt.revision;
      for (const item of view.items) {
        const q = content[item.position];
        assert.equal(item.prompt, q.prompt_md);
        for (const o of item.options) {
          assert.equal(o.text, q.options.find(v => v.code === o.code)!.text_md);
          assert.ok(!('score' in o));
        }
        if (mode === 'blank') continue;
        const target = q.scoring_mode === 'weighted_options'
          ? q.options.find(o => o.score === (mode === 'best' ? 5 : 1))!
          : q.options.find(o => mode === 'best' ? o.code === q.correct_option_code : o.code !== q.correct_option_code)!;
        const selected = item.options.find(o => o.code === target.code)!;
        revision = exams.save(id, 'student', item.id, selected.id, revision).revision;
      }
      const result = exams.submit(id, 'student').result!;
      assert.equal(result.maximum, 550);
      assert.equal(result.total, mode === 'best' ? 550 : mode === 'worst' ? 45 : 0);
      assert.deepEqual(Object.fromEntries(Object.entries(result.subscores).map(([s, v]) => [s, v.maximum])), { TWK: 150, TIU: 175, TKP: 225 });
      for (const item of exams.view(id, 'student').items) assert.equal(item.explanation, content[item.position].explanation_md);
    }
  } finally { sqlite.close(); }
});
