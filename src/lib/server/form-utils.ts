import { fail } from '@sveltejs/kit';
import { DomainError } from './question-service';
export function actionError(e: unknown) {
  if (e instanceof DomainError) return fail(e.status, { error: e.message });
  if (e instanceof SyntaxError) return fail(400, { error: 'Data formulir tidak valid.' });
  throw e;
}
export function formRevision(data: FormData): number {
  const value = Number(data.get('revision'));
  if (!Number.isInteger(value) || value < 1)
    throw new DomainError('Revision tidak valid. Muat ulang halaman.');
  return value;
}
export function formPayload(data: FormData): unknown {
  const raw = data.get('payload');
  if (typeof raw !== 'string' || raw.length > 200000)
    throw new DomainError('Data soal tidak valid atau terlalu besar.');
  return JSON.parse(raw);
}
