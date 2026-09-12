import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase, migrateDatabase } from '../src/lib/server/database';
import { paymentService } from '../src/lib/server/payment-service';
import { user, adminUsers, examPackages, products, productPackages, payments, orders, accessGrants, auditLog } from '../src/lib/server/schema';
import { eq } from 'drizzle-orm';

test('manual payment audits proof, expires orders and revokes access', () => {
  const { db, sqlite } = openDatabase(':memory:'); migrateDatabase(db); let time = 1000;
  try {
    for (const id of ['admin', 'buyer']) db.insert(user).values({ id, name: id, email: `${id}@test.invalid`, emailVerified: true, createdAt: new Date(), updatedAt: new Date() }).run();
    db.insert(adminUsers).values({ userId: 'admin', createdAt: 1 }).run();
    db.insert(examPackages).values({ id: 'package', title: 'Package', examType: 'CPNS', formation: '', targetYear: 2027, reference: 'Synthetic reference', durationMinutes: 10, quotas: {}, status: 'published', createdAt: 1 }).run();
    db.insert(products).values({ id: 'product', title: 'Product', priceIdr: 25000, accessDays: 30, active: true, createdAt: 1 }).run();
    db.insert(productPackages).values({ id: 'link', productId: 'product', packageId: 'package' }).run();
    const service = paymentService(db, () => time); const orderId = service.createManualOrder('product', 'buyer', 'buy-1');
    assert.throws(() => service.submitManualProof(orderId, 'buyer', { reference: 'REF-1', senderName: 'Buyer', amountIdr: 24000, paidAt: time }), /Nominal/);
    service.submitManualProof(orderId, 'buyer', { reference: 'REF-1', senderName: 'Buyer', amountIdr: 25000, paidAt: time });
    const payment = db.select().from(payments).where(eq(payments.orderId, orderId)).get()!;
    service.reviewManualPayment(payment.id, 'admin', true, 'Mutasi cocok');
    assert.equal(db.select().from(accessGrants).all().length, 1);
    assert.equal(db.select().from(auditLog).where(eq(auditLog.action, 'payment.approve')).all().length, 1);
    service.revokeAccess(payment.id, 'admin', 'Refund disetujui');
    assert.equal(db.select().from(accessGrants).get()!.revokeReason, 'Refund disetujui');
    const late = service.createManualOrder('product', 'buyer', 'buy-2'); time += 86400001;
    assert.throws(() => service.submitManualProof(late, 'buyer', { reference: 'REF-2', senderName: 'Buyer', amountIdr: 25000, paidAt: time }), /kedaluwarsa/);
    assert.equal(db.select().from(orders).where(eq(orders.id, late)).get()!.status, 'expired');
  } finally { sqlite.close(); }
});
