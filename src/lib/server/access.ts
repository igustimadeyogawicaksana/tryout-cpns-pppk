import { error, redirect } from '@sveltejs/kit';
export function requireAdmin(locals: App.Locals): string {
  if (!locals.user) redirect(303, '/login');
  if (!locals.isAdmin) error(403, 'Akun ini tidak memiliki akses pengelola.');
  return locals.user.id;
}
