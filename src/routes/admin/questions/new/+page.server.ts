import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/access';
import { questionService } from '$lib/server/question-service';
import { actionError, formPayload } from '$lib/server/form-utils';
import type { Actions } from './$types';
export const actions: Actions = {
  save: async ({ locals, request }) => {
    const actor = requireAdmin(locals);
    let id: string;
    try {
      id = questionService(db).create(formPayload(await request.formData()), actor);
    } catch (e) {
      return actionError(e);
    }
    redirect(303, '/admin/questions/' + id);
  }
};
