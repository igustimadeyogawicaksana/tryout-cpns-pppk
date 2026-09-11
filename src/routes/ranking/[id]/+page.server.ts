import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { rankingService } from '$lib/server/ranking-service';
import { DomainError } from '$lib/server/question-service';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = ({ locals, params, setHeaders, url }) => {
  if (!locals.user) redirect(303, '/login');
  setHeaders({ 'Cache-Control': 'private, no-store' });
  try {
    return rankingService(db).board(
      params.id,
      locals.user.id,
      Number(url.searchParams.get('page') || 1)
    );
  } catch (e) {
    if (e instanceof DomainError) error(e.status, e.message);
    throw e;
  }
};
export const actions: Actions = {
  hide: ({ locals, params }) => {
    if (!locals.user) redirect(303, '/login');
    rankingService(db).hide(params.id, locals.user.id);
    redirect(303, '/ranking/' + params.id);
  }
};
