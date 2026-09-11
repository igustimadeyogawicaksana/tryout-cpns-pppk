import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { profileService } from '$lib/server/profile-service';
import { actionError } from '$lib/server/form-utils';
import type { PageServerLoad, Actions } from './$types';
export const load: PageServerLoad = ({ locals }) => {
  if (!locals.user) redirect(303, '/login');
  return { profile: profileService(db).get(locals.user.id) };
};
export const actions: Actions = {
  default: async ({ locals, request }) => {
    if (!locals.user) redirect(303, '/login');
    const f = await request.formData();
    try {
      profileService(db).save(
        locals.user.id,
        String(f.get('name') || ''),
        String(f.get('province') || '')
      );
      return {
        success:
          'Profil tersimpan. Provinsi baru digunakan untuk kompetisi yang Anda mulai setelah perubahan ini.'
      };
    } catch (e) {
      return actionError(e);
    }
  }
};
