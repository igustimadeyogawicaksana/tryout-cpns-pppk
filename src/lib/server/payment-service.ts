import { createHash, randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { AppDatabase } from './database';
import {
  accessGrants,
  examPackages,
  orderPackages,
  orders,
  paymentEvents,
  payments,
  productPackages,
  products
} from './schema';
import { DomainError } from './question-service';

const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export function paymentService(db: AppDatabase, now: () => number = Date.now) {
  return {
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
    submitManualProof(orderId: string, actor: string, reference: string) {
      const order = db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, actor))).get();
      if (!order) throw new DomainError('Pesanan tidak ditemukan.', 404);
      if (order.status !== 'pending' && order.status !== 'review_required') throw new DomainError('Pesanan tidak menerima bukti baru.', 409);
      const payment = db.select().from(payments).where(eq(payments.orderId, orderId)).get();
      if (!payment) throw new DomainError('Pembayaran tidak ditemukan.', 404);
      const eventKey = `manual-proof:${orderId}:${hash(reference.trim()).slice(0, 16)}`;
      const existing = db.select().from(paymentEvents).where(and(eq(paymentEvents.provider, 'manual'), eq(paymentEvents.eventKey, eventKey))).get();
      if (existing) return existing.id;
      const eventId = randomUUID();
      const time = now();
      db.transaction(() => {
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
      const event = db.select().from(paymentEvents).where(and(eq(paymentEvents.paymentId, paymentId), eq(paymentEvents.status, 'received'))).get();
      if (!event) throw new DomainError('Belum ada bukti pembayaran.', 409);
      const time = now();
      db.transaction(() => {
        db.update(paymentEvents).set({ verified: approved, status: approved ? 'processed' : 'failed', processedAt: time, errorCode: approved ? null : (note || 'Bukti tidak cocok') }).where(eq(paymentEvents.id, event.id)).run();
        db.update(payments).set({ status: approved ? 'succeeded' : 'failed', updatedAt: time, settledAt: approved ? time : null }).where(eq(payments.id, paymentId)).run();
        db.update(orders).set({ status: approved ? 'paid' : 'cancelled', paidAt: approved ? time : null }).where(eq(orders.id, order.id)).run();
        if (approved) {
          for (const link of db.select().from(orderPackages).where(eq(orderPackages.orderId, order.id)).all()) {
            db.insert(accessGrants).values({ id: randomUUID(), orderPackageId: link.id, startsAt: time, expiresAt: time + order.accessDays * 86400000, createdAt: time }).run();
          }
        }
      }, { behavior: 'immediate' });
      return { orderId: order.id, approved, reviewedBy: adminId };
    }
  };
}
