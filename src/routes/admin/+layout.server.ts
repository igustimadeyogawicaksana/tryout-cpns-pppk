import { requireAdmin } from '$lib/server/access';
export function load({ locals }: { locals: App.Locals }) {
  requireAdmin(locals);
  return {};
}
