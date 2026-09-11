import { requireAdmin } from '$lib/server/access';
import { db } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import { payments } from '$lib/server/schema';
export function load({ locals }: { locals: App.Locals }) {
  requireAdmin(locals);
  return { pendingPayments: db.select({ count: sql<number>`count(*)` }).from(payments).where(eq(payments.status, 'review_required')).get()?.count ?? 0 };
}
