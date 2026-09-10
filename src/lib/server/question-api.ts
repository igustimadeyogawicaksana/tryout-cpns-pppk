import { createHash, timingSafeEqual } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { AppDatabase } from './database';
import { adminUsers, auditLog, questions, questionVersions } from './schema';
import { questionService, DomainError } from './question-service';
import { parseBatch } from '../question-input';
import { randomUUID } from 'node:crypto';

type Configuration = Record<string, string | undefined>;
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
let windowStart = 0,
  requests = 0;

async function readBody(request: Request) {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
  )
    throw new ApiError(415, 'unsupported_media_type', 'Gunakan Content-Type: application/json.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'invalid_json', 'Body JSON wajib diisi.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      // Drain without retaining oversized bodies: cancel() destroys Node's request
      // socket before the caller can receive the 413 response. Adapter caps at 4 MB.
      if (size <= 2_000_000) chunks.push(value);
    }
    if (size > 2_000_000) throw new ApiError(413, 'payload_too_large', 'Body maksimal 2 MB.');
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      throw new ApiError(400, 'invalid_json', 'JSON tidak terbaca.');
    }
  } catch (e) {
    if (e instanceof Error && 'status' in e && e.status === 413)
      throw new ApiError(413, 'payload_too_large', 'Ukuran body melampaui batas unggahan server.');
    throw e;
  } finally {
    reader.releaseLock();
  }
}

export async function uploadQuestions(
  request: Request,
  db: AppDatabase,
  config: Configuration,
  batchMode: boolean
) {
  try {
    const digest = config.QUESTIONS_API_TOKEN_SHA256 || '';
    const actor = config.QUESTIONS_API_USER_ID || '';
    if (!/^[a-f0-9]{64}$/.test(digest) || !actor)
      throw new ApiError(503, 'api_not_configured', 'API unggah soal belum dikonfigurasi.');
    const header = request.headers.get('authorization') || '';
    const token = /^Bearer ([A-Za-z0-9_-]{43,128})$/i.exec(header)?.[1];
    if (!token || !timingSafeEqual(Buffer.from(hash(token), 'hex'), Buffer.from(digest, 'hex')))
      throw new ApiError(401, 'unauthorized', 'Token API tidak valid.');
    if (!db.select().from(adminUsers).where(eq(adminUsers.userId, actor)).get())
      throw new ApiError(403, 'admin_required', 'Pemilik token bukan pengelola aktif.');
    // Single-instance MVP: only authenticated requests consume this fixed-size limiter.
    if (Date.now() - windowStart >= 60_000) {
      windowStart = Date.now();
      requests = 0;
    }
    if (++requests > 60)
      throw new ApiError(429, 'rate_limited', 'Maksimal 60 permintaan per menit.');
    const key = request.headers.get('idempotency-key') || '';
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(key))
      throw new ApiError(
        400,
        'invalid_idempotency_key',
        'Idempotency-Key wajib: 8–128 huruf, angka, - atau _.'
      );
    const input = await readBody(request);
    if (
      batchMode &&
      (!input ||
        typeof input !== 'object' ||
        Array.isArray(input) ||
        Object.keys(input).some((k) => k !== 'questions') ||
        !Array.isArray(input.questions))
    )
      throw new ApiError(
        422,
        'validation_failed',
        'Body batch harus berupa objek dengan array questions.'
      );
    const batchKey = `api-${hash(actor + ':' + key)}`;
    let batch;
    try {
      batch = parseBatch(
        JSON.stringify({
          schema_version: 1,
          batch_key: batchKey,
          questions: batchMode ? input.questions : [input]
        })
      );
    } catch (e) {
      throw new ApiError(
        422,
        'validation_failed',
        e instanceof Error ? e.message : 'Data soal tidak valid.'
      );
    }
    const service = questionService(db);
    const raw = JSON.stringify(batch);
    const result = db.transaction(
      () => {
        const preview = service.preview(raw);
        const imported = service.import(raw, preview.hash, actor);
        if (!imported.repeated)
          db.insert(auditLog)
            .values({
              id: randomUUID(),
              actorId: actor,
              action: 'question.api_upload',
              entityId: batchKey,
              note: `${imported.count} draft melalui API`,
              createdAt: Date.now()
            })
            .run();
        const items = batch.questions.map((q) => {
          const row = db
            .select({ questionId: questions.id, versionId: questionVersions.id })
            .from(questions)
            .innerJoin(questionVersions, eq(questionVersions.questionId, questions.id))
            .where(and(eq(questions.externalKey, q.external_key), eq(questionVersions.version, 1)))
            .get()!;
          return {
            external_key: q.external_key,
            question_id: row.questionId,
            version_id: row.versionId,
            admin_url: `/admin/questions/${row.versionId}`
          };
        });
        return { ...imported, items };
      },
      { behavior: 'immediate' }
    );
    return json(
      { ...result, batch_key: batchKey, initial_status: 'draft' },
      { status: result.repeated ? 200 : 201, headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    const known = e instanceof ApiError || e instanceof DomainError;
    const status = known ? e.status : 500;
    const code =
      e instanceof ApiError
        ? e.code
        : e instanceof DomainError
          ? status === 409
            ? 'conflict'
            : 'validation_failed'
          : 'internal_error';
    return json(
      {
        error: {
          code,
          message: known
            ? e.message
            : 'Gagal menyimpan soal. Ulangi dengan Idempotency-Key yang sama.'
        }
      },
      {
        status,
        headers: {
          'Cache-Control': 'private, no-store',
          ...(status === 401 ? { 'WWW-Authenticate': 'Bearer' } : {}),
          ...(status === 429 ? { 'Retry-After': '60' } : {})
        }
      }
    );
  }
}
