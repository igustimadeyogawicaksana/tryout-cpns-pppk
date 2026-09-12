import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { completeSchema, scoreAnswer, subtests, type QuestionInput } from '../../src/lib/question-input';
import type { AppDatabase } from '../../src/lib/server/database';
import { adminUsers, auditLog, examItems, examOptions, questionVersions, questions } from '../../src/lib/server/schema';
import { examService } from '../../src/lib/server/exam-service';
import { questionService } from '../../src/lib/server/question-service';
import { twk, tiu, makeSingle } from './skd-reviewed';
import { tkp, makeTkp } from './skd-tkp';

export function normalizedPrompt(text: string) {
  return text.normalize('NFKC').toLocaleLowerCase('id').replace(/\(latihan\s*\d+\)/g, '').replace(/\bnomor\s*\d+\b/g, '').replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
}
export function validateQuestions(content: QuestionInput[]) {
  assert.equal(content.length, 110);
  const prompts = new Set<string>();
  for (const q of content) {
    const parsed = completeSchema.safeParse(q);
    assert.ok(parsed.success, `${q.external_key}: ${parsed.success ? '' : parsed.error.message}`);
    const normalized = normalizedPrompt(q.prompt_md);
    assert.ok(!prompts.has(normalized), `Repeated content: ${q.external_key}`);
    prompts.add(normalized);
    assert.ok(!/soal sintetis|latihan antarmuka|situasi .+ nomor \d/i.test(q.prompt_md));
    assert.equal(new Set(q.options.map(o => o.text_md.trim().toLowerCase())).size, 5);
    assert.equal(scoreAnswer(q, null), 0);
    if (q.subtest_code === 'TKP') {
      assert.deepEqual(q.options.map(o => o.score).sort(), [1, 2, 3, 4, 5]);
      assert.equal(q.correct_option_code, undefined);
      for (const o of q.options) assert.ok(q.explanation_md.includes(`Nilai ${o.score}: “${o.text_md}”`));
    } else assert.equal(q.options.filter(o => scoreAnswer(q, o.code) === 5).length, 1);
  }
  for (const [sub, count] of [['TWK', 30], ['TIU', 35], ['TKP', 45]] as const)
    assert.equal(content.filter(q => q.subtest_code === sub).length, count);
}
export function buildQuestions() {
  const content = [...twk.map((q, i) => makeSingle('TWK', q, i)), ...tiu.map((q, i) => makeSingle('TIU', q, i + 30)), ...tkp.map((q, i) => makeTkp(q, i + 65))];
  validateQuestions(content);
  return content;
}
export function installEdition(db: AppDatabase, actor: string) {
  const content = buildQuestions();
  const digest = createHash('sha256').update(JSON.stringify(content)).digest('hex');
  assert.ok(db.select().from(adminUsers).where(eq(adminUsers.userId, actor)).get(), 'Local administrator required');
  return db.transaction(() => {
    const existing = db.select().from(auditLog).where(and(eq(auditLog.action, 'content.edition.install'), eq(auditLog.note, digest))).get();
    if (existing) return { packageId: existing.entityId, repeated: true };
    const bank = questionService(db), exams = examService(db);
    const oldVersionIds = new Set<string>();
    const versionIds = content.map(q => {
      const identity = db.select().from(questions).where(eq(questions.externalKey, q.external_key)).get();
      let id: string;
      if (identity) {
        const latest = db.select().from(questionVersions).where(eq(questionVersions.questionId, identity.id)).orderBy(desc(questionVersions.version)).get()!;
        assert.ok(['published', 'archived'].includes(latest.status), `Unfinished editorial revision: ${q.external_key}`);
        for (const old of db.select().from(questionVersions).where(eq(questionVersions.questionId, identity.id)).all()) {
          oldVersionIds.add(old.id);
          if (old.status === 'published') bank.transition(old.id, old.revision, 'archived', actor, 'Konten trial berulang dan opsi ujian tidak sinkron; diganti edisi baru.', false);
        }
        id = bank.revise(latest.id, actor, 'Butir ditulis ulang per subtes; tidak menimpa isi versi dan hasil lama.');
        bank.save(id, 1, q, actor);
      } else id = bank.create(q, actor);
      for (const next of ['in_review', 'approved', 'published'] as const)
        bank.transition(id, bank.get(id).revision, next, actor, 'Pemeriksaan konten oleh asisten untuk latihan lokal; tinjauan manusia masih diperlukan sebelum produksi.', next === 'approved');
      return id;
    });
    const oldPackages = new Set(db.select().from(examItems).all().filter(i => oldVersionIds.has(i.versionId)).map(i => i.packageId));
    for (const id of oldPackages) exams.archive(id, actor, 'Paket trial bermasalah diganti edisi baru; sesi dan hasil lama dipertahankan.');
    const packageId = exams.create({
      title: 'Latihan SKD CPNS — Edisi Perbaikan Isi (110 Soal)', examType: 'CPNS', formation: '', targetYear: 2027,
      reference: 'Latihan orisinal lokal, 30 TWK / 35 TIU / 45 TKP. Acuan struktur TA 2024 (KepmenPANRB 321/2024). Bukan soal resmi 2027; rubrik TKP latihan dan tinjauan editor manusia belum dilakukan.',
      durationMinutes: 100, quotas: Object.fromEntries(subtests.map(s => [s, s === 'TWK' ? 30 : s === 'TIU' ? 35 : s === 'TKP' ? 45 : 0])), versionIds
    }, actor);
    const items = db.select().from(examItems).where(eq(examItems.packageId, packageId)).all();
    assert.equal(items.length, 110);
    for (const item of items) {
      const options = db.select().from(examOptions).where(eq(examOptions.itemId, item.id)).all();
      assert.equal(options.length, 5);
      for (const o of options) {
        assert.equal(o.text, item.content.options.find(v => v.code === o.code)!.text_md);
        assert.equal(o.score, scoreAnswer(item.content, o.code));
      }
    }
    exams.publish(packageId, actor);
    db.insert(auditLog).values({ id: randomUUID(), actorId: actor, action: 'content.edition.install', entityId: packageId, note: digest, createdAt: Date.now() }).run();
    return { packageId, repeated: false };
  }, { behavior: 'immediate' });
}
