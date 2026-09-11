import { fail, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { examPackages, productPackages, products } from '$lib/server/schema';

export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user || !locals.isAdmin) redirect(303, '/login');
  return { products: db.select().from(products).orderBy(desc(products.createdAt)).all(), packages: db.select().from(examPackages).where(eq(examPackages.status, 'published')).all() };
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    if (!locals.user || !locals.isAdmin) redirect(303, '/login');
    const fields = await request.formData();
    const title = String(fields.get('title') || '').trim();
    const priceIdr = Number(fields.get('priceIdr'));
    const accessDays = Number(fields.get('accessDays'));
    const packageId = String(fields.get('packageId') || '');
    if (title.length < 3 || !Number.isInteger(priceIdr) || priceIdr < 0 || !Number.isInteger(accessDays) || accessDays < 1 || !packageId)
      return fail(400, { error: 'Isi nama, harga, masa akses, dan paket dengan benar.' });
    const packageRow = db.select().from(examPackages).where(eq(examPackages.id, packageId)).get();
    if (!packageRow || packageRow.status !== 'published') return fail(400, { error: 'Paket belum terbit.' });
    const id = randomUUID();
    db.transaction(() => {
      db.insert(products).values({ id, title, priceIdr, accessDays, active: true, createdAt: Date.now() }).run();
      db.insert(productPackages).values({ id: randomUUID(), productId: id, packageId }).run();
    }, { behavior: 'immediate' });
    return { success: 'Produk berhasil dibuat dan diaktifkan.' };
  }
};
