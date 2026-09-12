import { randomUUID } from 'node:crypto';
import { and, eq, desc, ne, sql } from 'drizzle-orm';
import type { AppDatabase } from './database';
import {
  rankingCohorts,
  rankingMembers,
  examPackages,
  examAttempts,
  adminUsers,
  auditLog,
  participantProfiles,
  rankingSnapshots,
  rankingSnapshotEntries,
  resultCorrections,
  user
} from './schema';
import { examService } from './exam-service';
import { DomainError } from './question-service';
import { validProvince } from '../provinces';

export function rankingService(db: AppDatabase, now = Date.now) {
  const cohortFor = (packageId: string) =>
    db.select().from(rankingCohorts).where(eq(rankingCohorts.packageId, packageId)).get();
  const scoredRows = (cohort: typeof rankingCohorts.$inferSelect) =>
    db.select({
      userId: rankingMembers.userId,
      alias: rankingMembers.alias,
      province: rankingMembers.province,
      visible: rankingMembers.visible,
      total: sql<number>`json_extract(${examAttempts.result}, '$.total')`,
      maximum: sql<number>`json_extract(${examAttempts.result}, '$.maximum')`
    }).from(rankingMembers).innerJoin(examAttempts, and(eq(examAttempts.userId, rankingMembers.userId), eq(examAttempts.packageId, cohort.packageId))).where(and(eq(rankingMembers.cohortId, cohort.id), eq(examAttempts.status, 'scored'), eq(examAttempts.scoringPolicy, cohort.policy), sql`NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = ${rankingMembers.userId})`)).all();
  const liveRows = (cohort: typeof rankingCohorts.$inferSelect) =>
    scoredRows(cohort).filter((row) => row.visible);
  const generateSnapshot = (cohort: typeof rankingCohorts.$inferSelect, actor: string, reason: string) => {
    const mixed = db.select({ id: examAttempts.id }).from(examAttempts).innerJoin(rankingMembers, and(eq(rankingMembers.userId, examAttempts.userId), eq(rankingMembers.cohortId, cohort.id))).where(and(eq(examAttempts.packageId, cohort.packageId), eq(examAttempts.status, 'scored'), ne(examAttempts.scoringPolicy, cohort.policy))).get();
    if (mixed) throw new DomainError('Cohort berisi hasil dengan aturan penilaian berbeda.', 409);
    const latest = db.select().from(rankingSnapshots).where(eq(rankingSnapshots.cohortId, cohort.id)).orderBy(desc(rankingSnapshots.generation)).get();
    const generation = (latest?.generation ?? 0) + 1, snapshotId = randomUUID(), generatedAt = now();
    db.insert(rankingSnapshots).values({ id: snapshotId, cohortId: cohort.id, generation, policy: cohort.policy, reason, generatedAt }).run();
    const scores = new Map(scoredRows(cohort).map((row) => [row.userId, row]));
    const rows = latest
      ? db.select().from(rankingSnapshotEntries).where(eq(rankingSnapshotEntries.snapshotId, latest.id)).all().map((entry) => ({ ...entry, ...(scores.get(entry.userId) ? { total: scores.get(entry.userId)!.total, maximum: scores.get(entry.userId)!.maximum } : {}) }))
      : liveRows(cohort);
    for (const row of rows) db.insert(rankingSnapshotEntries).values({ id: randomUUID(), snapshotId, userId: row.userId, alias: row.alias, province: row.province, total: row.total, maximum: row.maximum, visible: row.visible }).run();
    db.insert(auditLog).values({ id: randomUUID(), actorId: actor, action: 'ranking.snapshot', entityId: cohort.id, note: `Generasi ${generation}; ${cohort.policy}; ${reason}`, createdAt: generatedAt }).run();
    return db.select().from(rankingSnapshots).where(eq(rankingSnapshots.id, snapshotId)).get()!;
  };
  return {
    cohortFor,
    create(packageId: string, endsAt: number, actor: string) {
      if (!Number.isSafeInteger(endsAt) || endsAt <= now())
        throw new DomainError('Waktu penutupan harus di masa depan.');
      return db.transaction(
        () => {
          const p = db.select().from(examPackages).where(eq(examPackages.id, packageId)).get();
          if (!p || p.status !== 'published') throw new DomainError('Pilih paket terbit.');
          if (cohortFor(packageId)) throw new DomainError('Paket sudah memiliki periode ranking.');
          if (db.select().from(examAttempts).where(eq(examAttempts.packageId, packageId)).get())
            throw new DomainError(
              'Paket yang sudah pernah dikerjakan tidak dapat dijadikan kompetisi. Buat edisi baru.'
            );
          const id = randomUUID();
          db.insert(rankingCohorts).values({ id, packageId, endsAt, createdAt: now() }).run();
          db.insert(auditLog)
            .values({
              id: randomUUID(),
              actorId: actor,
              action: 'ranking.create',
              entityId: id,
              note: 'Kompetisi gratis; total-v1; pembahasan setelah penutupan',
              createdAt: now()
            })
            .run();
          return id;
        },
        { behavior: 'immediate' }
      );
    },
    join(packageId: string, actor: string, alias: string, visible: boolean) {
      return db.transaction(
        () => {
          const c = cohortFor(packageId);
          if (!c) throw new DomainError('Periode ranking tidak ditemukan.', 404);
          if (db.select().from(adminUsers).where(eq(adminUsers.userId, actor)).get())
            throw new DomainError('Akun pengelola tidak mengikuti kompetisi.', 403);
          const existing = db
            .select()
            .from(rankingMembers)
            .where(and(eq(rankingMembers.cohortId, c.id), eq(rankingMembers.userId, actor)))
            .get();
          if (!existing) {
            if (now() >= c.endsAt) throw new DomainError('Periode sudah ditutup.', 409);
            if (!/^[\p{L}\p{N} _-]{3,30}$/u.test(alias.trim()))
              throw new DomainError(
                'Alias harus 3–30 karakter: huruf, angka, spasi, _ atau -. Jangan memakai email atau nama lengkap.'
              );
            db.insert(rankingMembers)
              .values({
                id: randomUUID(),
                cohortId: c.id,
                userId: actor,
                alias: alias.trim(),
                province:
                  db
                    .select()
                    .from(participantProfiles)
                    .where(eq(participantProfiles.userId, actor))
                    .get()?.province ?? null,
                visible
              })
              .run();
          }
          return examService(db, now).start(packageId, actor);
        },
        { behavior: 'immediate' }
      );
    },
    hide(packageId: string, actor: string) {
      const c = cohortFor(packageId);
      if (!c) throw new DomainError('Periode tidak ditemukan.', 404);
      db.update(rankingMembers)
        .set({ visible: false })
        .where(and(eq(rankingMembers.cohortId, c.id), eq(rankingMembers.userId, actor)))
        .run();
      const snapshot = db.select().from(rankingSnapshots).where(eq(rankingSnapshots.cohortId, c.id)).orderBy(desc(rankingSnapshots.generation)).get();
      if (snapshot) db.update(rankingSnapshotEntries).set({ visible: false }).where(and(eq(rankingSnapshotEntries.snapshotId, snapshot.id), eq(rankingSnapshotEntries.userId, actor))).run();
    },
    board(packageId: string, actor: string, requestedPage = 1, province = '') {
      if (!validProvince(province)) throw new DomainError('Provinsi tidak valid.');
      examService(db, now).expire();
      return db.transaction(() => {
        const c = cohortFor(packageId);
        if (!c) throw new DomainError('Periode tidak ditemukan.', 404);
        const membership = db
          .select()
          .from(rankingMembers)
          .where(and(eq(rankingMembers.cohortId, c.id), eq(rankingMembers.userId, actor)))
          .get();
        const admin = db.select().from(adminUsers).where(eq(adminUsers.userId, actor)).get();
        if (!membership && !admin)
          throw new DomainError('Ikuti kompetisi dahulu untuk melihat ranking.', 403);
        let snapshot = db.select().from(rankingSnapshots).where(eq(rankingSnapshots.cohortId, c.id)).orderBy(desc(rankingSnapshots.generation)).get();
        if (!snapshot && now() >= c.endsAt) {
          snapshot = generateSnapshot(c, actor, 'Penutupan cohort');
        }
        const rows = snapshot
          ? db.select({ userId: rankingSnapshotEntries.userId, alias: rankingSnapshotEntries.alias, province: rankingSnapshotEntries.province, total: rankingSnapshotEntries.total, maximum: rankingSnapshotEntries.maximum }).from(rankingSnapshotEntries).where(and(eq(rankingSnapshotEntries.snapshotId, snapshot.id), eq(rankingSnapshotEntries.visible, true), province ? eq(rankingSnapshotEntries.province, province) : undefined)).orderBy(desc(rankingSnapshotEntries.total), rankingSnapshotEntries.alias, rankingSnapshotEntries.userId).all()
          : liveRows(c).filter((row) => !province || row.province === province).sort((a, b) => b.total - a.total || a.alias.localeCompare(b.alias) || a.userId.localeCompare(b.userId));
        let rank = 0,
          previous: number | undefined;
        const ranked = rows.map((r, index) => {
          if (r.total !== previous) rank = index + 1;
          previous = r.total;
          return {
            alias: r.alias,
            rank,
            total: r.total,
            maximum: r.maximum,
            mine: r.userId === actor
          };
        });
        const pageSize = 20;
        const pages = Math.max(1, Math.ceil(ranked.length / pageSize));
        const page = Number.isSafeInteger(requestedPage)
          ? Math.min(pages, Math.max(1, requestedPage))
          : 1;
        const mineIndex = ranked.findIndex((r) => r.mine);
        return {
          page,
          pages,
          pageSize,
          minePage: mineIndex < 0 ? null : Math.floor(mineIndex / pageSize) + 1,
          province,
          cohort: c,
          count: ranked.length,
          entries: ranked.slice((page - 1) * pageSize, page * pageSize),
          mine: ranked.find((r) => r.mine) ?? null,
          visible: membership?.visible ?? false,
          updatedAt: snapshot?.generatedAt ?? now(),
          generation: snapshot?.generation ?? null,
          policy: snapshot?.policy ?? c.policy
        };
      }, { behavior: 'immediate' });
    },
    correctionCandidates(packageId: string) {
      const c = cohortFor(packageId);
      if (!c) throw new DomainError('Periode ranking tidak ditemukan.', 404);
      return {
        cohort: c,
        attempts: db.select({ attempt: examAttempts, member: rankingMembers, participant: user }).from(examAttempts).innerJoin(rankingMembers, and(eq(rankingMembers.userId, examAttempts.userId), eq(rankingMembers.cohortId, c.id))).innerJoin(user, eq(user.id, examAttempts.userId)).where(and(eq(examAttempts.packageId, packageId), eq(examAttempts.status, 'scored'))).all(),
        corrections: db.select().from(resultCorrections).where(eq(resultCorrections.cohortId, c.id)).orderBy(desc(resultCorrections.createdAt)).all(),
        snapshots: db.select().from(rankingSnapshots).where(eq(rankingSnapshots.cohortId, c.id)).orderBy(desc(rankingSnapshots.generation)).all()
      };
    },
    correct(attemptId: string, actor: string, expectedRevision: number, correctedResult: { total: number; maximum: number; subscores: Record<string, { score: number; maximum: number }> }, reason: string) {
      const admin = db.select().from(adminUsers).where(eq(adminUsers.userId, actor)).get();
      if (!admin) throw new DomainError('Akses pengelola diperlukan.', 403);
      const attempt = db.select().from(examAttempts).where(eq(examAttempts.id, attemptId)).get();
      if (!attempt || attempt.status !== 'scored' || !attempt.result) throw new DomainError('Hasil ujian tidak ditemukan.', 404);
      const cohort = cohortFor(attempt.packageId);
      if (!cohort) throw new DomainError('Hasil bukan bagian cohort ranking.', 409);
      if (now() < cohort.endsAt) throw new DomainError('Koreksi ranking dilakukan setelah cohort ditutup.', 409);
      if (attempt.scoringPolicy !== cohort.policy) throw new DomainError('Aturan hasil tidak sama dengan aturan cohort.', 409);
      if (attempt.resultRevision !== expectedRevision) throw new DomainError('Hasil sudah dikoreksi admin lain. Muat ulang halaman.', 409);
      const note = reason.trim();
      if (note.length < 10 || note.length > 500) throw new DomainError('Alasan koreksi harus 10–500 karakter.');
      const keys = Object.keys(attempt.result.subscores).sort();
      if (correctedResult.maximum !== attempt.result.maximum || Object.keys(correctedResult.subscores).sort().join('|') !== keys.join('|')) throw new DomainError('Struktur dan nilai maksimum hasil tidak boleh diubah.');
      for (const key of keys) { const before = attempt.result.subscores[key], after = correctedResult.subscores[key]; if (!Number.isSafeInteger(after.score) || after.score < 0 || after.score > before.maximum || after.maximum !== before.maximum) throw new DomainError(`Nilai ${key} tidak valid.`); }
      const total = keys.reduce((sum, key) => sum + correctedResult.subscores[key].score, 0);
      if (correctedResult.total !== total || total < 0 || total > correctedResult.maximum) throw new DomainError('Total koreksi harus sama dengan jumlah subskor.');
      return db.transaction(() => {
        const fresh = db.select().from(examAttempts).where(eq(examAttempts.id, attemptId)).get()!;
        if (fresh.resultRevision !== expectedRevision || fresh.scoringPolicy !== cohort.policy) throw new DomainError('Hasil atau aturan penilaian sudah berubah. Muat ulang halaman.', 409);
        const correctionId = randomUUID(), time = now();
        db.insert(resultCorrections).values({ id: correctionId, attemptId, cohortId: cohort.id, fromRevision: expectedRevision, toRevision: expectedRevision + 1, policy: cohort.policy, previousResult: attempt.result!, correctedResult, reason: note, actorId: actor, createdAt: time }).run();
        db.update(examAttempts).set({ result: correctedResult, resultRevision: expectedRevision + 1 }).where(eq(examAttempts.id, attemptId)).run();
        const snapshot = generateSnapshot(cohort, actor, `Koreksi ${correctionId}`);
        db.insert(auditLog).values({ id: randomUUID(), actorId: actor, action: 'result.correct', entityId: attemptId, note: `${expectedRevision}→${expectedRevision + 1}; ${note}; snapshot ${snapshot.generation}`, createdAt: time }).run();
        return { correctionId, generation: snapshot.generation };
      }, { behavior: 'immediate' });
    }
  };
}
