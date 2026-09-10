import { randomUUID, createHash } from 'node:crypto';
import { and, eq, desc, like, or, sql } from 'drizzle-orm';
import type { AppDatabase } from './database';
import { questions, questionVersions, importBatches, auditLog } from './schema';
import {
  draftSchema,
  parseBatch,
  readinessIssues,
  type QuestionInput,
  type EditorialStatus
} from '../question-input';

export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}
export function questionService(db: AppDatabase) {
  function audit(actorId: string, action: string, entityId: string, note = '') {
    db.insert(auditLog)
      .values({ id: randomUUID(), actorId, action, entityId, note, createdAt: Date.now() })
      .run();
  }
  function insertQuestion(content: QuestionInput, actorId: string) {
    const id = randomUUID(),
      versionId = randomUUID(),
      now = Date.now();
    db.insert(questions).values({ id, externalKey: content.external_key, createdAt: now }).run();
    db.insert(questionVersions)
      .values({
        id: versionId,
        questionId: id,
        version: 1,
        revision: 1,
        status: 'draft',
        content,
        examType: content.exam_type,
        subtestCode: content.subtest_code,
        topicCode: content.topic_code,
        createdAt: now,
        updatedAt: now
      })
      .run();
    audit(actorId, 'question.create', versionId);
    return versionId;
  }
  const service = {
    list(search = '', status = '') {
      const filters = [
        sql`${questionVersions.version} = (SELECT MAX(v.version) FROM question_versions v WHERE v.question_id = ${questionVersions.questionId})`
      ];
      if (search)
        filters.push(
          or(
            like(questions.externalKey, `%${search}%`),
            like(questionVersions.content, `%${search}%`)
          )!
        );
      if (['draft', 'in_review', 'approved', 'published', 'archived'].includes(status))
        filters.push(eq(questionVersions.status, status as EditorialStatus));
      return db
        .select({
          id: questionVersions.id,
          externalKey: questions.externalKey,
          status: questionVersions.status,
          version: questionVersions.version,
          content: questionVersions.content,
          updatedAt: questionVersions.updatedAt
        })
        .from(questionVersions)
        .innerJoin(questions, eq(questions.id, questionVersions.questionId))
        .where(and(...filters))
        .orderBy(desc(questionVersions.updatedAt))
        .limit(100)
        .all();
    },
    stats() {
      return db
        .select({ status: questionVersions.status, count: sql<number>`count(*)` })
        .from(questionVersions)
        .where(
          sql`${questionVersions.version} = (SELECT MAX(v.version) FROM question_versions v WHERE v.question_id = ${questionVersions.questionId})`
        )
        .groupBy(questionVersions.status)
        .all();
    },
    get(id: string) {
      const row = db.select().from(questionVersions).where(eq(questionVersions.id, id)).get();
      if (!row) throw new DomainError('Soal tidak ditemukan.', 404);
      return row;
    },
    history(questionId: string) {
      return db
        .select({
          id: questionVersions.id,
          version: questionVersions.version,
          status: questionVersions.status,
          changeNote: questionVersions.changeNote
        })
        .from(questionVersions)
        .where(eq(questionVersions.questionId, questionId))
        .orderBy(desc(questionVersions.version))
        .all();
    },
    create(input: unknown, actor: string) {
      const parsed = draftSchema.safeParse(input);
      if (!parsed.success)
        throw new DomainError(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        );
      return db.transaction(
        () => {
          if (
            db
              .select()
              .from(questions)
              .where(eq(questions.externalKey, parsed.data.external_key))
              .get()
          )
            throw new DomainError(
              'Kode soal sudah dipakai. Gunakan kode lain atau revisi soal lama.',
              409
            );
          return insertQuestion(parsed.data, actor);
        },
        { behavior: 'immediate' }
      );
    },
    save(id: string, revision: number, input: unknown, actor: string) {
      const parsed = draftSchema.safeParse(input);
      if (!parsed.success)
        throw new DomainError(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        );
      db.transaction(
        () => {
          const row = service.get(id);
          if (row.status !== 'draft') throw new DomainError('Hanya draft yang dapat diedit.', 409);
          if (row.revision !== revision)
            throw new DomainError(
              'Soal telah berubah di tab lain. Muat ulang sebelum menyimpan.',
              409
            );
          if (parsed.data.external_key !== row.content.external_key)
            throw new DomainError('Kode soal tidak boleh diganti setelah dibuat.');
          db.update(questionVersions)
            .set({
              content: parsed.data,
              examType: parsed.data.exam_type,
              subtestCode: parsed.data.subtest_code,
              topicCode: parsed.data.topic_code,
              revision: revision + 1,
              updatedAt: Date.now()
            })
            .where(eq(questionVersions.id, id))
            .run();
          audit(actor, 'question.save', id);
        },
        { behavior: 'immediate' }
      );
    },
    transition(
      id: string,
      revision: number,
      next: EditorialStatus,
      actor: string,
      note: string,
      checked: boolean
    ) {
      db.transaction(
        () => {
          const row = service.get(id);
          if (row.revision !== revision)
            throw new DomainError('Versi berubah. Muat ulang halaman.', 409);
          const allowed: Record<EditorialStatus, EditorialStatus[]> = {
            draft: ['in_review'],
            in_review: ['draft', 'approved'],
            approved: ['draft', 'published'],
            published: ['archived'],
            archived: []
          };
          if (!allowed[row.status].includes(next))
            throw new DomainError('Perubahan status tidak diizinkan.', 409);
          if (['in_review', 'approved', 'published'].includes(next)) {
            const issues = readinessIssues(row.content);
            if (issues.length) throw new DomainError(issues.join('\n'));
          }
          if (next === 'approved' && !checked)
            throw new DomainError(
              'Konfirmasikan pemeriksaan isi, bobot, bahasa dan hak penggunaan.'
            );
          if (['draft', 'archived'].includes(next) && !note.trim())
            throw new DomainError('Alasan wajib diisi.');
          db.update(questionVersions)
            .set({ status: next, revision: revision + 1, updatedAt: Date.now() })
            .where(eq(questionVersions.id, id))
            .run();
          audit(actor, `question.${next}`, id, note.slice(0, 2000));
        },
        { behavior: 'immediate' }
      );
    },
    revise(id: string, actor: string, note: string) {
      if (!note.trim()) throw new DomainError('Tuliskan alasan revisi.');
      return db.transaction(
        () => {
          const row = service.get(id);
          if (!['published', 'archived'].includes(row.status))
            throw new DomainError('Revisi baru hanya dibuat dari versi terbit atau arsip.', 409);
          const latest = service.history(row.questionId)[0];
          if (latest.id !== id)
            throw new DomainError(
              'Versi yang lebih baru sudah tersedia. Buka versi tersebut.',
              409
            );
          const newId = randomUUID(),
            now = Date.now();
          db.insert(questionVersions)
            .values({
              ...row,
              id: newId,
              version: row.version + 1,
              revision: 1,
              status: 'draft',
              changeNote: note.trim().slice(0, 2000),
              createdAt: now,
              updatedAt: now
            })
            .run();
          audit(actor, 'question.revise', newId, note.slice(0, 2000));
          return newId;
        },
        { behavior: 'immediate' }
      );
    },
    preview(raw: string) {
      const batch = parseBatch(raw),
        hash = createHash('sha256').update(JSON.stringify(batch)).digest('hex');
      const old = db
        .select()
        .from(importBatches)
        .where(eq(importBatches.batchKey, batch.batch_key))
        .get();
      if (old) {
        if (old.hash !== hash)
          throw new DomainError('Kode batch sudah dipakai dengan isi berbeda.', 409);
        return { batch, hash, alreadyImported: true };
      }
      const duplicate = batch.questions.filter((q) =>
        db
          .select({ id: questions.id })
          .from(questions)
          .where(eq(questions.externalKey, q.external_key))
          .get()
      );
      if (duplicate.length)
        throw new DomainError(
          `Kode sudah ada: ${duplicate.map((q) => q.external_key).join(', ')}. Buat revisi melalui halaman soal.`,
          409
        );
      return { batch, hash, alreadyImported: false };
    },
    import(raw: string, expectedHash: string, actor: string) {
      const preview = service.preview(raw);
      if (preview.hash !== expectedHash)
        throw new DomainError('Isi berubah setelah preview. Periksa ulang berkas.', 409);
      return db.transaction(
        () => {
          const old = db
            .select()
            .from(importBatches)
            .where(eq(importBatches.batchKey, preview.batch.batch_key))
            .get();
          if (old) {
            if (old.hash !== preview.hash)
              throw new DomainError('Kode batch sudah dipakai dengan isi berbeda.', 409);
            return { count: old.count, repeated: true };
          }
          if (
            preview.batch.questions.some((q) =>
              db.select().from(questions).where(eq(questions.externalKey, q.external_key)).get()
            )
          )
            throw new DomainError('Salah satu kode telah dipakai. Ulangi preview.', 409);
          preview.batch.questions.forEach((q) => insertQuestion(q, actor));
          db.insert(importBatches)
            .values({
              batchKey: preview.batch.batch_key,
              hash: preview.hash,
              count: preview.batch.questions.length,
              actorId: actor,
              createdAt: Date.now()
            })
            .run();
          audit(
            actor,
            'question.import',
            preview.batch.batch_key,
            `${preview.batch.questions.length} soal`
          );
          return { count: preview.batch.questions.length, repeated: false };
        },
        { behavior: 'immediate' }
      );
    }
  };
  return service;
}
