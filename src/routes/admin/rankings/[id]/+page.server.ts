import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/access';
import { actionError } from '$lib/server/form-utils';
import { rankingService } from '$lib/server/ranking-service';
import { DomainError } from '$lib/server/question-service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params, setHeaders }) => {
  requireAdmin(locals);
  setHeaders({ 'Cache-Control': 'private, no-store' });
  try {
    return rankingService(db).correctionCandidates(params.id);
  } catch (cause) {
    if (cause instanceof DomainError) error(cause.status, cause.message);
    throw cause;
  }
};

export const actions: Actions = {
  correct: async ({ locals, params, request }) => {
    const actor = requireAdmin(locals);
    const form = await request.formData();
    try {
      const service = rankingService(db);
      const attemptId = String(form.get('attemptId'));
      const candidate = service
        .correctionCandidates(params.id)
        .attempts.find(({ attempt }) => attempt.id === attemptId);
      if (!candidate?.attempt.result) throw new DomainError('Hasil ujian tidak ditemukan.', 404);
      const subscores = Object.fromEntries(
        Object.entries(candidate.attempt.result.subscores).map(([code, current]) => [
          code,
          { score: Number(form.get(`score_${code}`)), maximum: current.maximum }
        ])
      );
      const result = await service.correct(
        attemptId,
        actor,
        Number(form.get('resultRevision')),
        {
          total: Object.values(subscores).reduce((sum, item) => sum + item.score, 0),
          maximum: candidate.attempt.result.maximum,
          subscores
        },
        String(form.get('reason') || '')
      );
      return { success: `Koreksi tersimpan. Ranking final generasi ${result.generation} dibuat.` };
    } catch (cause) {
      return actionError(cause);
    }
  }
};
