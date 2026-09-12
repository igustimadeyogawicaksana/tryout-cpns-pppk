import { createHash, randomUUID } from 'node:crypto';
import { and, eq, isNull, lt } from 'drizzle-orm';
import type { AppDatabase } from './database';
import {
  accessGrants,
  examPackages,
  orderPackages,
  orders,
  paymentEvents,
  payments,
  productPackages,
  products,
  manualPaymentProofs,
  auditLog
} from './schema';
import { DomainError } from './question-service';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export function paymentService(db: AppDatabase, now: () => number = Date.now) {
  const expireOrder = (orderId: string) => {
    const row = db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (row && ['pending', 'review_required'].includes(row.status) && now() >= row.expiresAt) {
      db.transaction(() => {
        db.update(orders).set({ status: 'expired' }).where(eq(orders.id, orderId)).run();
        db.update(payments).set({ status: 'expired', updatedAt: now() }).where(eq(payments.orderId, orderId)).run();
      }, { behavior: 'immediate' });
      return true;
    }
    return false;
  };
  return {
    expirePending() {
      const due = db.select({ id: orders.id }).from(orders).where(and(lt(orders.expiresAt, now()), eq(orders.status, 'pending'))).all();
      const reviewDue = db.select({ id: orders.id }).from(orders).where(and(lt(orders.expiresAt, now()), eq(orders.status, 'review_required'))).all();
      for (const row of [...due, ...reviewDue]) expireOrder(row.id);
      return due.length + reviewDue.length;
    },
    order(id: string, actor: string) {
      expireOrder(id);
      const row = db.select().from(orders).where(and(eq(orders.id, id), eq(orders.userId, actor))).get();
      if (!row) throw new DomainError('Pesanan tidak ditemukan.', 404);
      const payment = db.select().from(payments).where(eq(payments.orderId, id)).get();
      return { order: row, payment };
    },
    createManualOrder(productId: string, actor: string, idempotencyKey: string) {
      if (!idempotencyKey.trim()) throw new DomainError('Idempotency key wajib diisi.');
      const product = db.select().from(products).where(and(eq(products.id, productId), eq(products.active, true))).get();
      if (!product) throw new DomainError('Produk tidak tersedia.', 404);
      const existing = db.select().from(orders).where(and(eq(orders.userId, actor), eq(orders.idempotencyKey, idempotencyKey))).get();
      if (existing) return existing.id;
      const links = db.select().from(productPackages).where(eq(productPackages.productId, productId)).all();
      if (!links.length) throw new DomainError('Produk belum memiliki paket.', 409);
      const time = now();
      const orderId = randomUUID();
      db.transaction(() => {
        db.insert(orders).values({
          id: orderId, userId: actor, productId, productTitle: product.title,
          amountIdr: product.priceIdr, accessDays: product.accessDays, idempotencyKey,
          requestHash: hash(`${productId}:${product.priceIdr}:${product.accessDays}`),
          createdAt: time, expiresAt: time + 24 * 60 * 60 * 1000
        }).run();
        for (const link of links) db.insert(orderPackages).values({ id: randomUUID(), orderId, packageId: link.packageId }).run();
        db.insert(payments).values({
          id: randomUUID(), orderId, provider: 'manual', environment: 'production', merchantAccount: 'manual-config',
          idempotencyKey: `manual:${orderId}`, amountIdr: product.priceIdr, createdAt: time, updatedAt: time, status: 'pending'
        }).run();
      }, { behavior: 'immediate' });
      return orderId;
    },
    submitManualProof(orderId: string, actor: string, input: string | { reference: string; senderName: string; amountIdr: number; paidAt: number }) {
      if (expireOrder(orderId)) throw new DomainError('Pesanan sudah kedaluwarsa. Buat pesanan baru.', 409);
      const order = db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, actor))).get();
      if (!order) throw new DomainError('Pesanan tidak ditemukan.', 404);
      if (order.status !== 'pending' && order.status !== 'review_required') throw new DomainError('Pesanan tidak menerima bukti baru.', 409);
      const payment = db.select().from(payments).where(eq(payments.orderId, orderId)).get();
      if (!payment) throw new DomainError('Pembayaran tidak ditemukan.', 404);
      const proof = typeof input === 'string' ? { reference: input, senderName: 'Tidak dicantumkan', amountIdr: order.amountIdr, paidAt: now() } : input;
      const reference = proof.reference.trim(), senderName = proof.senderName.trim();
      if (reference.length < 3 || reference.length > 200) throw new DomainError('Referensi bukti harus 3–200 karakter.');
      if (senderName.length < 2 || senderName.length > 100) throw new DomainError('Nama pengirim harus 2–100 karakter.');
      if (!Number.isSafeInteger(proof.amountIdr) || proof.amountIdr !== order.amountIdr) throw new DomainError('Nominal bukti harus sama dengan nominal pesanan.');
      if (!Number.isSafeInteger(proof.paidAt) || proof.paidAt > now() + 5 * 60000 || proof.paidAt < order.createdAt - 7 * 86400000) throw new DomainError('Waktu pembayaran tidak valid.');
      const eventKey = `manual-proof:${orderId}:${hash(reference).slice(0, 16)}`;
      const existing = db.select().from(paymentEvents).where(and(eq(paymentEvents.provider, 'manual'), eq(paymentEvents.eventKey, eventKey))).get();
      if (existing) return existing.id;
      if (db.select().from(manualPaymentProofs).where(and(eq(manualPaymentProofs.paymentId, payment.id), eq(manualPaymentProofs.status, 'pending'))).get()) throw new DomainError('Bukti sebelumnya masih menunggu verifikasi.', 409);
      const eventId = randomUUID();
      const time = now();
      db.transaction(() => {
        db.insert(manualPaymentProofs).values({ id: randomUUID(), paymentId: payment.id, submittedBy: actor, reference, senderName, amountIdr: proof.amountIdr, paidAt: proof.paidAt, createdAt: time }).run();
        db.insert(paymentEvents).values({ id: eventId, provider: 'manual', environment: 'production', merchantAccount: 'manual-config', eventKey, paymentId: payment.id, payloadHash: hash(reference.trim()), receivedAt: time, status: 'received' }).run();
        db.update(payments).set({ status: 'review_required', updatedAt: time }).where(eq(payments.id, payment.id)).run();
        db.update(orders).set({ status: 'review_required' }).where(eq(orders.id, orderId)).run();
      }, { behavior: 'immediate' });
      return eventId;
    },
    reviewManualPayment(paymentId: string, adminId: string, approved: boolean, note = '') {
      const payment = db.select().from(payments).where(eq(payments.id, paymentId)).get();
      if (!payment) throw new DomainError('Pembayaran tidak ditemukan.', 404);
      const order = db.select().from(orders).where(eq(orders.id, payment.orderId)).get()!;
      if (expireOrder(order.id)) throw new DomainError('Pesanan sudah kedaluwarsa dan tidak dapat disetujui.', 409);
      if (payment.status === 'succeeded' && approved) return { orderId: order.id, approved, reviewedBy: adminId };
      if (!approved && note.trim().length < 3) throw new DomainError('Alasan penolakan minimal 3 karakter.');
      const event = db.select().from(paymentEvents).where(and(eq(paymentEvents.paymentId, paymentId), eq(paymentEvents.status, 'received'))).get();
      if (!event) throw new DomainError('Belum ada bukti pembayaran.', 409);
      const proof = db.select().from(manualPaymentProofs).where(and(eq(manualPaymentProofs.paymentId, paymentId), eq(manualPaymentProofs.status, 'pending'))).get();
      if (!proof) throw new DomainError('Detail bukti pembayaran tidak ditemukan.', 409);
      const time = now();
      db.transaction(() => {
        db.update(paymentEvents).set({ verified: approved, status: approved ? 'processed' : 'failed', processedAt: time, errorCode: approved ? null : (note || 'Bukti tidak cocok') }).where(eq(paymentEvents.id, event.id)).run();
        db.update(manualPaymentProofs).set({ status: approved ? 'approved' : 'rejected', reviewNote: note.trim() || null, reviewedBy: adminId, reviewedAt: time }).where(eq(manualPaymentProofs.id, proof.id)).run();
        db.update(payments).set({ status: approved ? 'succeeded' : 'pending', updatedAt: time, settledAt: approved ? time : null }).where(eq(payments.id, paymentId)).run();
        db.update(orders).set({ status: approved ? 'paid' : 'pending', paidAt: approved ? time : null }).where(eq(orders.id, order.id)).run();
        if (approved) {
          for (const link of db.select().from(orderPackages).where(eq(orderPackages.orderId, order.id)).all()) {
            db.insert(accessGrants).values({ id: randomUUID(), orderPackageId: link.id, startsAt: time, expiresAt: time + order.accessDays * 86400000, createdAt: time }).run();
          }
        }
        db.insert(auditLog).values({ id: randomUUID(), actorId: adminId, action: approved ? 'payment.approve' : 'payment.reject', entityId: paymentId, note: note.trim() || `Bukti ${proof.reference} diverifikasi`, createdAt: time }).run();
      }, { behavior: 'immediate' });
      return { orderId: order.id, approved, reviewedBy: adminId };
    },
    revokeAccess(paymentId: string, adminId: string, reason: string) {
      const note = reason.trim();
      if (note.length < 5 || note.length > 500) throw new DomainError('Alasan pencabutan harus 5–500 karakter.');
      const payment = db.select().from(payments).where(eq(payments.id, paymentId)).get();
      if (!payment || payment.status !== 'succeeded') throw new DomainError('Pembayaran berhasil tidak ditemukan.', 404);
      const links = db.select().from(orderPackages).where(eq(orderPackages.orderId, payment.orderId)).all();
      const time = now();
      db.transaction(() => {
        for (const link of links) db.update(accessGrants).set({ revokedAt: time, revokeReason: note }).where(and(eq(accessGrants.orderPackageId, link.id), isNull(accessGrants.revokedAt))).run();
        db.insert(auditLog).values({ id: randomUUID(), actorId: adminId, action: 'access.revoke', entityId: paymentId, note, createdAt: time }).run();
      }, { behavior: 'immediate' });
      return { paymentId, revokedAt: time };
    }
  };
}
