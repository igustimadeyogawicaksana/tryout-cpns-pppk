import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { examService } from '$lib/server/exam-service';
import { DomainError } from '$lib/server/question-service';
import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({ locals, params, request, url }) => {
  if (!locals.user) return json({ error: 'Silakan login kembali.' }, { status: 401 });
  if (request.headers.get('origin') !== url.origin)
    return json({ error: 'Origin tidak diizinkan.' }, { status: 403 });
  try {
    const text = await request.text();
    if (text.length > 2000) return json({ error: 'Data terlalu besar.' }, { status: 413 });
    const input = JSON.parse(text);
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      typeof input.itemId !== 'string' ||
      (input.optionId !== null && typeof input.optionId !== 'string') ||
      !Number.isInteger(input.revision)
    )
      return json({ error: 'Jawaban tidak valid.' }, { status: 400 });
    return json(
      examService(db).save(params.id, locals.user.id, input.itemId, input.optionId, input.revision)
    );
  } catch (e) {
    if (e instanceof DomainError) return json({ error: e.message }, { status: e.status });
    if (e instanceof SyntaxError) return json({ error: 'Data tidak valid.' }, { status: 400 });
    throw e;
  }
};
