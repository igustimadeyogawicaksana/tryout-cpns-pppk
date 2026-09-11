import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { examService } from '$lib/server/exam-service';
import { DomainError } from '$lib/server/question-service';
import { actionError } from '$lib/server/form-utils';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = ({ params }) => {
  try {
    return { package: examService(db).details(params.id) };
  } catch (e) {
    if (e instanceof DomainError) error(e.status, e.message);
    throw e;
  }
};
export const actions: Actions = {
  default: ({ locals, params }) => {
    if (!locals.user) redirect(303, '/login');
    let id: string;
    try {
      id = examService(db).start(params.id, locals.user.id);
    } catch (e) {
      return actionError(e);
    }
    redirect(303, '/ujian/' + id);
  }
};
