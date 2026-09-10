import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = ({ locals }) => {
  return { user: locals.user ? { name: locals.user.name } : null, isAdmin: locals.isAdmin };
};
