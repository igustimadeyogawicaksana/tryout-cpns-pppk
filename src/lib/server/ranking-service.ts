import { randomUUID } from 'node:crypto';
import { and, eq, desc, sql } from 'drizzle-orm';
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
  rankingSnapshotEntries
} from './schema';
import { examService } from './exam-service';
import { DomainError } from './question-service';
import { validProvince } from '../provinces';

export function rankingService(db: AppDatabase, now = Date.now) {
  const cohortFor = (packageId: string) =>
    db.select().from(rankingCohorts).where(eq(rankingCohorts.packageId, packageId)).get();
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
      const snapshot = db.select().from(rankingSnapshots).where(eq(rankingSnapshots.cohortId, c.id)).get();
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
        const liveRows = () => db
          .select({
            userId: rankingMembers.userId,
            alias: rankingMembers.alias,
            province: rankingMembers.province,
            total: sql<number>`json_extract(${examAttempts.result}, '$.total')`,
            maximum: sql<number>`json_extract(${examAttempts.result}, '$.maximum')`
          })
          .from(rankingMembers)
          .innerJoin(
            examAttempts,
            and(
              eq(examAttempts.userId, rankingMembers.userId),
              eq(examAttempts.packageId, packageId)
            )
          )
          .where(
            and(
              eq(rankingMembers.cohortId, c.id),
              eq(rankingMembers.visible, true),
              eq(examAttempts.status, 'scored'),
              sql`NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = ${rankingMembers.userId})`
            )
          )
          .all();
        let snapshot = db.select().from(rankingSnapshots).where(eq(rankingSnapshots.cohortId, c.id)).get();
        if (!snapshot && now() >= c.endsAt) {
          const snapshotId = randomUUID(), generatedAt = now();
          db.insert(rankingSnapshots).values({ id: snapshotId, cohortId: c.id, generatedAt }).run();
          for (const row of liveRows()) db.insert(rankingSnapshotEntries).values({ id: randomUUID(), snapshotId, userId: row.userId, alias: row.alias, province: row.province, total: row.total, maximum: row.maximum, visible: true }).run();
          snapshot = { id: snapshotId, cohortId: c.id, generatedAt };
          db.insert(auditLog).values({ id: randomUUID(), actorId: actor, action: 'ranking.snapshot', entityId: c.id, note: 'Snapshot ranking final total-v1 dibuat', createdAt: generatedAt }).run();
        }
        const rows = snapshot
          ? db.select({ userId: rankingSnapshotEntries.userId, alias: rankingSnapshotEntries.alias, province: rankingSnapshotEntries.province, total: rankingSnapshotEntries.total, maximum: rankingSnapshotEntries.maximum }).from(rankingSnapshotEntries).where(and(eq(rankingSnapshotEntries.snapshotId, snapshot.id), eq(rankingSnapshotEntries.visible, true), province ? eq(rankingSnapshotEntries.province, province) : undefined)).orderBy(desc(rankingSnapshotEntries.total), rankingSnapshotEntries.alias, rankingSnapshotEntries.userId).all()
          : liveRows().filter((row) => !province || row.province === province).sort((a, b) => b.total - a.total || a.alias.localeCompare(b.alias) || a.userId.localeCompare(b.userId));
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
          updatedAt: snapshot?.generatedAt ?? now()
        };
      }, { behavior: 'immediate' });
    }
  };
}
