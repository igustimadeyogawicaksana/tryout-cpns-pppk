import { redirect } from '@sveltejs/kit';
import { googleEnabled } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { mailEnabled, localMail } from '$lib/server/auth-mail';
export const load: PageServerLoad = ({ locals, url, setHeaders }) => {
  setHeaders({'Cache-Control':'private, no-store'});
  const requested = url.searchParams.get('mode') || 'login';
  const mode = ['login', 'register', 'forgot', 'reset', 'verify'].includes(requested)
    ? requested
    : 'login';
  if (locals.user && !['reset', 'verify'].includes(mode))
    redirect(303, locals.isAdmin ? '/admin/questions' : '/dashboard');
  return {
    googleEnabled,
    mailEnabled,
    localMail: Boolean(localMail),
    mode,
    token: mode === 'reset' ? url.searchParams.get('token') || '' : '',
    oauthError: url.searchParams.has('oauth_error'),
    invalidLink: url.searchParams.has('error')
  };
};
