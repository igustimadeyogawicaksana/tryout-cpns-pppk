import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { db } from '$lib/server/db';
import { paymentService } from '$lib/server/payment-service';
import { DomainError } from '$lib/server/question-service';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) return json({ error: 'Silakan login.' }, { status: 401 });
  try {
    const body = await request.json();
    const orderId = paymentService(db).createManualOrder(String(body.productId || ''), locals.user.id, String(body.idempotencyKey || randomUUID()));
    return json({ orderId, mode: 'manual', status: 'pending' }, { status: 201 });
  } catch (e) {
    if (e instanceof DomainError) return json({ error: e.message }, { status: e.status });
    return json({ error: 'Pesanan gagal dibuat.' }, { status: 400 });
  }
};

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) return json({ error: 'Silakan login.' }, { status: 401 });
  try {
    const body = await request.json();
    const service = paymentService(db);
    if (body.action === 'review') {
      if (!locals.isAdmin) return json({ error: 'Akses pengelola diperlukan.' }, { status: 403 });
      return json(service.reviewManualPayment(String(body.paymentId || ''), locals.user.id, body.approved === true, String(body.note || '')));
    }
    return json({ eventId: service.submitManualProof(String(body.orderId || ''), locals.user.id, String(body.reference || '')) }, { status: 201 });
  } catch (e) {
    if (e instanceof DomainError) return json({ error: e.message }, { status: e.status });
    return json({ error: 'Permintaan pembayaran gagal diproses.' }, { status: 400 });
  }
};
