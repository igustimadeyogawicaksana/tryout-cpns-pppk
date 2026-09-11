import { randomUUID } from 'node:crypto';
import { and, eq, lte, asc, desc } from 'drizzle-orm';
import { z } from 'zod';
import type { AppDatabase } from './database';
import {
  examPackages,
  examItems,
  examOptions,
  examAttempts,
  user,
  adminUsers,
  questionVersions,
  auditLog
} from './schema';
import { DomainError } from './question-service';
import { readinessIssues, scoreAnswer, subtests } from '../question-input';

const packageInput = z.object({
  title: z.string().trim().min(3).max(150),
  examType: z.enum(['CPNS', 'PPPK']),
  formation: z.string().trim().max(120),
  targetYear: z.number().int().min(2020).max(2100),
  reference: z.string().trim().min(10).max(2000),
  durationMinutes: z.number().int().min(1).max(240),
  quotas: z.record(z.enum(subtests), z.number().int().min(0).max(200)),
  versionIds: z.array(z.string().uuid()).min(1).max(200)
});
export function examService(db: AppDatabase, now: () => number = Date.now) {
  function items(id: string) {
    return db
      .select()
      .from(examItems)
      .where(eq(examItems.packageId, id))
      .orderBy(asc(examItems.position))
      .all();
  }
  function options(id: string) {
    return db
      .select()
      .from(examOptions)
      .where(eq(examOptions.itemId, id))
      .orderBy(asc(examOptions.code))
      .all();
  }
  function getPackage(id: string) {
    const p = db.select().from(examPackages).where(eq(examPackages.id, id)).get();
    if (!p) throw new DomainError('Paket tidak ditemukan.', 404);
    return p;
  }
  function attempt(id: string, actor: string) {
    const row = db
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.id, id), eq(examAttempts.userId, actor)))
      .get();
    if (!row) throw new DomainError('Sesi tidak ditemukan.', 404);
    return row;
  }
  function finalize(id: string, reason: string) {
    const row = db.select().from(examAttempts).where(eq(examAttempts.id, id)).get()!;
    if (row.status === 'scored') return row;
    const result = {
      total: 0,
      maximum: 0,
      subscores: {} as Record<string, { score: number; maximum: number }>
    };
    for (const item of items(row.packageId)) {
      const opts = options(item.id);
      const score =
        opts.find((o) => o.id === row.answers[item.id])?.score ?? item.content.score_blank;
      const maximum = Math.max(item.content.score_blank, ...opts.map((o) => o.score));
      const sub = (result.subscores[item.content.subtest_code] ||= { score: 0, maximum: 0 });
      sub.score += score;
      sub.maximum += maximum;
      result.total += score;
      result.maximum += maximum;
    }
    db.update(examAttempts)
      .set({
        status: 'scored',
        result,
        endedReason: reason,
        finishedAt: Math.min(now(), row.deadlineAt),
        revision: row.revision + 1
      })
      .where(eq(examAttempts.id, id))
      .run();
    return db.select().from(examAttempts).where(eq(examAttempts.id, id)).get()!;
  }
  const service = {
    list(admin = false) {
      return db
        .select()
        .from(examPackages)
        .where(admin ? undefined : eq(examPackages.status, 'published'))
        .orderBy(desc(examPackages.createdAt))
        .all();
    },
    publishedQuestions() {
      return db
        .select()
        .from(questionVersions)
        .where(eq(questionVersions.status, 'published'))
        .orderBy(desc(questionVersions.updatedAt))
        .all();
    },
    getPackage,
    details(id: string, admin = false) {
      const p = getPackage(id);
      if (!admin && p.status !== 'published') throw new DomainError('Paket tidak tersedia.', 404);
      return { ...p, count: items(id).length };
    },
    create(input: unknown, actor: string) {
      const parsed = packageInput.safeParse(input);
      if (!parsed.success)
        throw new DomainError(
          parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
        );
      const data = parsed.data;
      return db.transaction(
        () => {
          if (new Set(data.versionIds).size !== data.versionIds.length)
            throw new DomainError('Soal duplikat dalam paket.');
          const rows = data.versionIds.map((id) =>
            db.select().from(questionVersions).where(eq(questionVersions.id, id)).get()
          );
          if (
            rows.some(
              (row) =>
                !row ||
                row.status !== 'published' ||
                row.examType !== data.examType ||
                readinessIssues(row.content).length
            )
          )
            throw new DomainError(
              'Pilih hanya soal terbit dan lengkap dengan jenis seleksi yang sama.'
            );
          if (new Set(rows.map((r) => r!.questionId)).size !== rows.length)
            throw new DomainError('Dua versi dari soal yang sama tidak boleh masuk satu paket.');
          if (
            data.examType === 'PPPK' &&
            (!data.formation ||
              rows.some(
                (r) => r!.content.formation_code && r!.content.formation_code !== data.formation
              ))
          )
            throw new DomainError('Formasi PPPK wajib diisi dan harus sesuai soal.');
          for (const sub of subtests)
            if (rows.filter((r) => r!.subtestCode === sub).length !== data.quotas[sub])
              throw new DomainError(`Kuota ${sub} tidak sesuai jumlah soal terpilih.`);
          const id = randomUUID();
          const { versionIds, ...p } = data;
          db.insert(examPackages)
            .values({ ...p, id, createdAt: now() })
            .run();
          rows.forEach((row, position) => {
            const itemId = randomUUID();
            const q = row!.content;
            db.insert(examItems)
              .values({ id: itemId, packageId: id, versionId: row!.id, position, content: q })
              .run();
            q.options.forEach((o) =>
              db
                .insert(examOptions)
                .values({
                  id: randomUUID(),
                  itemId,
                  code: o.code,
                  text: o.text_md,
                  score: scoreAnswer(q, o.code)
                })
                .run()
            );
          });
          db.insert(auditLog)
            .values({
              id: randomUUID(),
              actorId: actor,
              action: 'package.create',
              entityId: id,
              note: 'Edisi latihan gratis; isi dibekukan',
              createdAt: now()
            })
            .run();
          return id;
        },
        { behavior: 'immediate' }
      );
    },
    publish(id: string, actor: string) {
      db.transaction(
        () => {
          const p = getPackage(id);
          if (p.status !== 'draft')
            throw new DomainError('Hanya draft paket dapat diterbitkan.', 409);
          if (
            items(id).some(
              (i) =>
                db.select().from(questionVersions).where(eq(questionVersions.id, i.versionId)).get()
                  ?.status !== 'published'
            )
          )
            throw new DomainError('Ada soal yang sudah diarsipkan. Susun edisi paket baru.');
          db.update(examPackages).set({ status: 'published' }).where(eq(examPackages.id, id)).run();
          db.insert(auditLog)
            .values({
              id: randomUUID(),
              actorId: actor,
              action: 'package.publish',
              entityId: id,
              note: 'Latihan gratis; bukan simulasi resmi 2027',
              createdAt: now()
            })
            .run();
        },
        { behavior: 'immediate' }
      );
    },
    archive(id: string, actor: string, reason: string) {
      const note = reason.trim();
      if (note.length < 10 || note.length > 500)
        throw new DomainError('Isi alasan arsip sepanjang 10–500 karakter.');
      db.transaction(
        () => {
          const p = getPackage(id);
          if (p.status === 'archived') return;
          db.update(examPackages).set({ status: 'archived' }).where(eq(examPackages.id, id)).run();
          db.insert(auditLog)
            .values({
              id: randomUUID(),
              actorId: actor,
              action: 'package.archive',
              entityId: id,
              note,
              createdAt: now()
            })
            .run();
        },
        { behavior: 'immediate' }
      );
    },
    start(id: string, actor: string) {
      const participant = db.select().from(user).where(eq(user.id, actor)).get();
      if (!participant) throw new DomainError('Silakan login.', 401);
      if (
        !participant.emailVerified &&
        !db.select().from(adminUsers).where(eq(adminUsers.userId, actor)).get()
      )
        throw new DomainError('Verifikasi email sebelum mulai ujian.', 403);
      return db.transaction(
        () => {
          const p = getPackage(id);
          if (p.status !== 'published') throw new DomainError('Paket belum tersedia.', 404);
          const old = db
            .select()
            .from(examAttempts)
            .where(and(eq(examAttempts.packageId, id), eq(examAttempts.userId, actor)))
            .get();
          if (old) return old.id;
          const attemptId = randomUUID(),
            time = now();
          db.insert(examAttempts)
            .values({
              id: attemptId,
              packageId: id,
              userId: actor,
              startedAt: time,
              deadlineAt: time + p.durationMinutes * 60000,
              answers: {}
            })
            .run();
          return attemptId;
        },
        { behavior: 'immediate' }
      );
    },
    expire() {
      const due = db
        .select({ id: examAttempts.id })
        .from(examAttempts)
        .where(and(eq(examAttempts.status, 'in_progress'), lte(examAttempts.deadlineAt, now())))
        .limit(100)
        .all();
      for (const row of due)
        db.transaction(() => finalize(row.id, 'deadline'), { behavior: 'immediate' });
    },
    view(id: string, actor: string) {
      let row = attempt(id, actor);
      if (row.status === 'in_progress' && now() >= row.deadlineAt)
        row = db.transaction(() => finalize(id, 'deadline'), { behavior: 'immediate' });
      return {
        attempt: row,
        package: getPackage(row.packageId),
        serverNow: now(),
        items: items(row.packageId).map((i) => ({
          id: i.id,
          position: i.position,
          subtest: i.content.subtest_code,
          prompt: i.content.prompt_md,
          options: options(i.id).map((o) => ({
            id: o.id,
            code: o.code,
            text: o.text,
            ...(row.status === 'scored' ? { score: o.score } : {})
          })),
          ...(row.status === 'scored'
            ? { explanation: i.content.explanation_md, blankScore: i.content.score_blank }
            : {})
        }))
      };
    },
    save(id: string, actor: string, itemId: string, optionId: string | null, revision: number) {
      const before = attempt(id, actor);
      if (before.status === 'in_progress' && now() >= before.deadlineAt)
        db.transaction(() => finalize(id, 'deadline'), { behavior: 'immediate' });
      return db.transaction(
        () => {
          const row = attempt(id, actor);
          if (row.status !== 'in_progress' || now() >= row.deadlineAt)
            throw new DomainError('Ujian sudah selesai.', 409);
          if (row.revision !== revision)
            throw new DomainError(
              'Jawaban berubah di tab lain. Muat ulang untuk mengambil jawaban tersimpan.',
              409
            );
          if (
            !items(row.packageId).some((i) => i.id === itemId) ||
            (optionId !== null && !options(itemId).some((o) => o.id === optionId))
          )
            throw new DomainError('Pilihan tidak termasuk soal pada sesi ini.');
          const answers = { ...row.answers };
          if (optionId === null) delete answers[itemId];
          else answers[itemId] = optionId;
          db.update(examAttempts)
            .set({ answers, revision: row.revision + 1 })
            .where(eq(examAttempts.id, id))
            .run();
          return { revision: row.revision + 1 };
        },
        { behavior: 'immediate' }
      );
    },
    submit(id: string, actor: string) {
      return db.transaction(
        () => {
          const row = attempt(id, actor);
          return finalize(id, now() >= row.deadlineAt ? 'deadline' : 'manual');
        },
        { behavior: 'immediate' }
      );
    },
    history(actor: string) {
      service.expire();
      return db
        .select({ attempt: examAttempts, package: examPackages })
        .from(examAttempts)
        .innerJoin(examPackages, eq(examPackages.id, examAttempts.packageId))
        .where(eq(examAttempts.userId, actor))
        .orderBy(desc(examAttempts.startedAt))
        .all();
    }
  };
  return service;
}
