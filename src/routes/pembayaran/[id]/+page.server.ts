import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { paymentService } from '$lib/server/payment-service';
import { DomainError } from '$lib/server/question-service';
import { actionError } from '$lib/server/form-utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  if (!locals.user) redirect(303, '/login');
  try {
    const data = paymentService(db).order(params.id, locals.user.id);
    return { ...data, instructions: { name: process.env.PAYMENT_DISPLAY_NAME || 'Transfer manual Ruang Tryout', bank: process.env.PAYMENT_BANK_NAME || 'Bank/QRIS belum dikonfigurasi', account: process.env.PAYMENT_BANK_ACCOUNT || 'Hubungi pengelola untuk nomor pembayaran', holder: process.env.PAYMENT_BANK_HOLDER || '' } };
  } catch (e) {
    if (e instanceof DomainError) error(e.status, e.message);
    throw e;
  }
};

export const actions: Actions = {
  proof: async ({ locals, params, request }) => {
    if (!locals.user) redirect(303, '/login');
    const fields = await request.formData();
    try {
      paymentService(db).submitManualProof(params.id, locals.user.id, String(fields.get('reference') || ''));
      return { success: 'Bukti pembayaran sudah dikirim dan menunggu verifikasi pengelola.' };
    } catch (e) {
      return actionError(e);
    }
  }
};
