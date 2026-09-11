import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/access';
import { examService } from '$lib/server/exam-service';
import { actionError } from '$lib/server/form-utils';
import { subtests } from '$lib/question-input';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals }) => {
  requireAdmin(locals);
  const s = examService(db);
  return {
    packages: s.list(true),
    questions: s
      .publishedQuestions()
      .map((q) => ({
        id: q.id,
        code: q.content.external_key,
        subtest: q.subtestCode,
        type: q.examType,
        formation: q.content.formation_code,
        prompt: q.content.prompt_md
      }))
  };
};
export const actions: Actions = {
  create: async ({ locals, request }) => {
    const actor = requireAdmin(locals);
    const f = await request.formData();
    let id: string;
    try {
      id = examService(db).create(
        {
          title: String(f.get('title')),
          examType: String(f.get('examType')),
          formation: String(f.get('formation') || ''),
          targetYear: Number(f.get('targetYear')),
          reference: String(f.get('reference')),
          durationMinutes: Number(f.get('durationMinutes')),
          quotas: Object.fromEntries(subtests.map((s) => [s, Number(f.get(s) || 0)])),
          versionIds: f.getAll('versionIds')
        },
        actor
      );
    } catch (e) {
      return actionError(e);
    }
    redirect(303, '/admin/packages?created=' + id);
  },
  publish: async ({ locals, request }) => {
    const actor = requireAdmin(locals);
    try {
      examService(db).publish(String((await request.formData()).get('id')), actor);
      return { success: 'Paket diterbitkan sebagai latihan gratis.' };
    } catch (e) {
      return actionError(e);
    }
  }
};
