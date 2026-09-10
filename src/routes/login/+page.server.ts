import { redirect } from '@sveltejs/kit';
import { googleEnabled } from '$lib/server/auth';
export function load({ locals }: { locals: App.Locals }) {
  if (locals.user) redirect(303, locals.isAdmin ? '/admin/questions' : '/dashboard');
  return { googleEnabled };
}
