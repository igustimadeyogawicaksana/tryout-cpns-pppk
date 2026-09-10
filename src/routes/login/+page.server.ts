import { redirect } from '@sveltejs/kit';
import { googleEnabled } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ locals, url }) => {
  if (locals.user) redirect(303, locals.isAdmin ? '/admin/questions' : '/dashboard');
  return { googleEnabled, oauthError: url.searchParams.has('oauth_error') };
};
