import { redirect } from '@sveltejs/kit';
import { googleEnabled } from '$lib/server/auth';
export function load({ locals }: { locals: App.Locals }) {
  if (locals.user && locals.isAdmin) redirect(303, '/admin/questions');
  return { googleEnabled, denied: Boolean(locals.user && !locals.isAdmin) };
}
