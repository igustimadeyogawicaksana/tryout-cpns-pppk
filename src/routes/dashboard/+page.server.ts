import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { account } from '$lib/server/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { examService } from '$lib/server/exam-service';
export const load: PageServerLoad = ({ locals, setHeaders }) => {
  if (!locals.user) redirect(303, '/login');
  setHeaders({ 'Cache-Control': 'private, no-store' });
  return {
    name: locals.user.name,
    hasPassword: Boolean(
      db
        .select({ id: account.id })
        .from(account)
        .where(and(eq(account.userId, locals.user.id), eq(account.providerId, 'credential')))
        .get()
    ),
    emailVerified: locals.user.emailVerified,
    history: examService(db).history(locals.user.id)
  };
};

export const actions: Actions = {
  setPassword: async ({ locals, request }) => {
    if (!locals.user) redirect(303, '/login');
    if (!locals.user.emailVerified) return fail(403, { passwordError: 'Verifikasi email dahulu.' });
    const fields = await request.formData();
    const password = fields.get('password');
    if (typeof password !== 'string' || password.length < 12 || password.length > 128)
      return fail(400, { passwordError: 'Gunakan password sepanjang 12–128 karakter.' });
    if (password !== fields.get('confirmation'))
      return fail(400, { passwordError: 'Konfirmasi password belum sama.' });
    try {
      await auth.api.setPassword({ headers: request.headers, body: { newPassword: password } });
      return {
        passwordSuccess:
          'Password berhasil dibuat. Anda sekarang bisa masuk dengan email akun ini dan password baru, atau tetap menggunakan Google.'
      };
    } catch {
      return fail(400, {
        passwordError:
          'Password belum dapat dibuat. Jika sudah punya password, gunakan Lupa password. Jika sesi sudah lama, keluar lalu masuk kembali dengan Google.'
      });
    }
  }
};
