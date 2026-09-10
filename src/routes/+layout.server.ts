export function load({ locals }: { locals: App.Locals }) {
  return { user: locals.user ? { name: locals.user.name } : null, isAdmin: locals.isAdmin };
}
