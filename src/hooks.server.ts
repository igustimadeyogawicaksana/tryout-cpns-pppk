import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { adminUsers } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { building } from '$app/environment';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;
  event.locals.session = null;
  event.locals.isAdmin = false;
  if (!building) {
    const current = await auth.api.getSession({ headers: event.request.headers });
    if (current) {
      event.locals.user = current.user;
      event.locals.session = current.session;
      event.locals.isAdmin = Boolean(
        db.select().from(adminUsers).where(eq(adminUsers.userId, current.user.id)).get()
      );
    }
  }
  const response = await svelteKitHandler({ event, resolve, auth, building });
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  if (
    event.locals.user ||
    event.url.pathname.startsWith('/admin') ||
    event.url.pathname.startsWith('/api/auth') ||
    event.url.pathname === '/account'
  )
    response.headers.set('Cache-Control', 'private, no-store');
  return response;
};
