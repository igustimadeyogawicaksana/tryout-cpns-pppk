import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { orders, payments, paymentEvents, user } from '$lib/server/schema';
import { paymentService } from '$lib/server/payment-service';
import { actionError } from '$lib/server/form-utils';

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user || !locals.isAdmin) redirect(303, '/login');
  return { payments: db.select({ payment: payments, order: orders, participant: user, event: paymentEvents }).from(payments).innerJoin(orders, eq(orders.id, payments.orderId)).innerJoin(user, eq(user.id, orders.userId)).leftJoin(paymentEvents, eq(paymentEvents.paymentId, payments.id)).orderBy(desc(payments.createdAt)).all() };
};
export const actions: Actions = {
  review: async ({ locals, request }) => {
    if (!locals.user || !locals.isAdmin) redirect(303, '/login');
    const fields = await request.formData();
    try { paymentService(db).reviewManualPayment(String(fields.get('paymentId')), locals.user.id, fields.get('approved') === 'true', String(fields.get('note') || '')); return { success: 'Status pembayaran diperbarui.' }; } catch (e) { return actionError(e); }
  }
};
