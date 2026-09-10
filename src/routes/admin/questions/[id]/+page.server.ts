import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/access';
import { questionService, DomainError } from '$lib/server/question-service';
import { actionError, formPayload, formRevision } from '$lib/server/form-utils';
import { readinessIssues, type EditorialStatus } from '$lib/question-input';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, params }) => {
  requireAdmin(locals);
  try {
    const service = questionService(db),
      row = service.get(params.id);
    return { row, issues: readinessIssues(row.content), history: service.history(row.questionId) };
  } catch (e) {
    if (e instanceof DomainError) error(e.status, e.message);
    throw e;
  }
};
export const actions: Actions = {
  save: async ({ locals, request, params }) => {
    const actor = requireAdmin(locals),
      data = await request.formData();
    try {
      questionService(db).save(params.id, formRevision(data), formPayload(data), actor);
      return { success: 'Draft berhasil disimpan.' };
    } catch (e) {
      return actionError(e);
    }
  },
  transition: async ({ locals, request, params }) => {
    const actor = requireAdmin(locals),
      data = await request.formData();
    try {
      questionService(db).transition(
        params.id,
        formRevision(data),
        String(data.get('next')) as EditorialStatus,
        actor,
        String(data.get('note') || ''),
        data.get('checked') === 'on'
      );
      return { success: 'Status soal diperbarui.' };
    } catch (e) {
      return actionError(e);
    }
  },
  revise: async ({ locals, request, params }) => {
    const actor = requireAdmin(locals),
      data = await request.formData();
    let id: string;
    try {
      id = questionService(db).revise(params.id, actor, String(data.get('note') || ''));
    } catch (e) {
      return actionError(e);
    }
    redirect(303, '/admin/questions/' + id);
  }
};
