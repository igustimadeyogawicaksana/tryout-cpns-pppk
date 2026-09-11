import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { examService } from '$lib/server/exam-service';
export const load: PageServerLoad = ({ locals, setHeaders }) => {
  if (!locals.user) redirect(303, '/login');
  setHeaders({ 'Cache-Control': 'private, no-store' });
  return {
    name: locals.user.name,
    emailVerified: locals.user.emailVerified,
    history: examService(db).history(locals.user.id)
  };
};
