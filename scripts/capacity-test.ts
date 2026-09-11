import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { cpus, freemem, totalmem } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { examService } from '../src/lib/server/exam-service';
import { rankingService } from '../src/lib/server/ranking-service';
import {
  adminUsers,
  examItems,
  examOptions,
  examPackages,
  questionVersions,
  questions,
  user
} from '../src/lib/server/schema';
import type { QuestionInput } from '../src/lib/question-input';

// Default is the release baseline. Stress levels are opt-in because 300 did not
// complete within the local 10-minute observation window on 2026-09-11.
const levels = (process.env.CAPACITY_LEVELS || '50,100')
  .split(',')
  .map(Number)
  .filter((n) => Number.isSafeInteger(n) && n > 0);
const answerCount = 110;
const outputDir = join(process.cwd(), '.local', 'capacity');
mkdirSync(outputDir, { recursive: true });

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)] ?? 0;
}
function stats(values: number[]) {
  return {
    count: values.length,
    averageMs: values.reduce((a, b) => a + b, 0) / Math.max(1, values.length),
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95),
    p99Ms: percentile(values, 0.99),
    maxMs: Math.max(0, ...values)
  };
}
function question(position: number): QuestionInput {
  const subtest = position < 30 ? 'TWK' : position < 65 ? 'TIU' : 'TKP';
  const weighted = subtest === 'TKP';
  return {
    external_key: `CAP-${position + 1}`,
    exam_type: 'CPNS',
    subtest_code: subtest,
    formation_code: null,
    topic_code: `capacity-${subtest.toLowerCase()}`,
    difficulty: 'medium',
    prompt_md: `Pertanyaan sintetis uji kapasitas nomor ${position + 1}`,
    scoring_mode: weighted ? 'weighted_options' : 'single_correct',
    options: ['A', 'B', 'C', 'D', 'E'].map((code, index) => ({
      code: code as 'A' | 'B' | 'C' | 'D' | 'E',
      text_md: `Pilihan ${code} untuk nomor ${position + 1}`,
      ...(weighted ? { score: 5 - index } : {})
    })),
    ...(weighted ? {} : { correct_option_code: 'A' as const, score_correct: 5, score_wrong: 0 }),
    score_blank: 0,
    explanation_md: 'Konten sintetis khusus benchmark, bukan materi belajar.',
    shuffle_options: true,
    assets: [],
    source_note: 'Dibuat lokal untuk benchmark DATA-002',
    rights_basis: 'Konten sintetis buatan aplikasi'
  };
}

function runLevel(participants: number) {
  const dbPath = join(outputDir, `capacity-${participants}.sqlite`);
  for (const suffix of ['', '-wal', '-shm']) rmSync(dbPath + suffix, { force: true });
  const { db, sqlite } = openDatabase(dbPath);
  migrateDatabase(db);
  const now = Date.now();
  const adminId = 'capacity-admin';
  const packageId = randomUUID();
  const setupStarted = performance.now();
  try {
    db.insert(user).values({ id: adminId, name: 'Capacity Admin', email: 'capacity-admin@test.invalid', emailVerified: true, createdAt: new Date(now), updatedAt: new Date(now) }).run();
    db.insert(adminUsers).values({ userId: adminId, createdAt: now }).run();
    const actors = Array.from({ length: participants }, (_, i) => `capacity-user-${i + 1}`);
    sqlite.transaction(() => {
      for (const [i, id] of actors.entries()) db.insert(user).values({ id, name: `Capacity ${i + 1}`, email: `${id}@test.invalid`, emailVerified: true, createdAt: new Date(now), updatedAt: new Date(now) }).run();
      db.insert(examPackages).values({ id: packageId, title: `Capacity ${participants}`, examType: 'CPNS', formation: '', targetYear: 2027, reference: 'Uji kapasitas sintetis; acuan aturan TA 2024', durationMinutes: 100, quotas: { TWK: 30, TIU: 35, TKP: 45 }, status: 'published', createdAt: now }).run();
      for (let position = 0; position < answerCount; position++) {
        const q = question(position), questionId = randomUUID(), versionId = randomUUID(), itemId = randomUUID();
        db.insert(questions).values({ id: questionId, externalKey: `${participants}-${q.external_key}`, createdAt: now }).run();
        db.insert(questionVersions).values({ id: versionId, questionId, version: 1, revision: 1, status: 'published', examType: 'CPNS', subtestCode: q.subtest_code, topicCode: q.topic_code, content: q, createdAt: now, updatedAt: now }).run();
        db.insert(examItems).values({ id: itemId, packageId, versionId, position, content: q }).run();
        for (const option of q.options) db.insert(examOptions).values({ id: randomUUID(), itemId, code: option.code, text: option.text_md, score: q.scoring_mode === 'weighted_options' ? option.score! : option.code === q.correct_option_code ? q.score_correct! : q.score_wrong! }).run();
      }
    })();
    const svc = examService(db, () => now);
    const ranking = rankingService(db, () => now);
    ranking.create(packageId, now + 7_200_000, adminId);
    const starts: number[] = [], saves: number[] = [], submits: number[] = [];
    const attempts = actors.map((actor, index) => {
      const before = performance.now();
      const id = ranking.join(packageId, actor, `Peserta ${index + 1}`, true);
      starts.push(performance.now() - before);
      return id;
    });
    const view = svc.view(attempts[0], actors[0]);
    const selected = view.items.map((item) => [item.id, item.options[0].id] as const);
    const revisions = Array(participants).fill(1);
    let errors = 0;
    // Round-robin represents active sessions sharing one synchronous Node/SQLite writer.
    for (const [itemId, optionId] of selected) {
      for (let i = 0; i < participants; i++) {
        const before = performance.now();
        try {
          const result = svc.save(attempts[i], actors[i], itemId, optionId, revisions[i]);
          revisions[i] = result.revision;
        } catch { errors++; }
        saves.push(performance.now() - before);
      }
    }
    for (let i = 0; i < participants; i++) {
      const before = performance.now();
      try { svc.submit(attempts[i], actors[i]); } catch { errors++; }
      submits.push(performance.now() - before);
    }
    const boardStarted = performance.now();
    const board = ranking.board(packageId, actors[0]);
    const rankingMs = performance.now() - boardStarted;
    sqlite.pragma('wal_checkpoint(TRUNCATE)');
    const integrity = sqlite.pragma('integrity_check', { simple: true });
    return {
      participants,
      questions: answerCount,
      saveRequests: saves.length,
      setupMs: performance.now() - setupStarted,
      start: stats(starts),
      save: stats(saves),
      submit: stats(submits),
      rankingMs,
      rankingCount: board.count,
      errors,
      integrity,
      databaseBytes: statSync(dbPath).size,
      rssBytes: process.memoryUsage().rss
    };
  } finally { sqlite.close(); }
}

const startedAt = new Date().toISOString();
const results = [];
for (const level of levels) {
  const result = runLevel(level);
  results.push(result);
  console.log(`${level}: save p95=${result.save.p95Ms.toFixed(2)} ms; submit p95=${result.submit.p95Ms.toFixed(2)} ms; errors=${result.errors}`);
}
const report = {
  startedAt,
  finishedAt: new Date().toISOString(),
  environment: { platform: process.platform, release: process.version, cpu: cpus()[0]?.model, logicalCpu: cpus().length, totalMemoryBytes: totalmem(), freeMemoryBytesAtEnd: freemem(), sqlite: 'better-sqlite3; WAL; synchronous=FULL; busy_timeout=3000', execution: 'local single Node process, direct service calls, round-robin active sessions; excludes HTTP/network/auth/TLS' },
  targets: { initialConcurrent: [50, 100], stressConcurrent: [300, 500], saveP95Ms: 500, submitP95Ms: 2000, maxErrorRate: 0.001 },
  results
};
writeFileSync(join(outputDir, 'latest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Hasil mentah: ${join(outputDir, 'latest.json')}`);
