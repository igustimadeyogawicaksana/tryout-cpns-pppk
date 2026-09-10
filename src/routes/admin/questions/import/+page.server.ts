import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/access';
import { questionService, DomainError } from '$lib/server/question-service';
import type { Actions } from './$types';
export const actions: Actions = {
  default: async ({ locals, request }) => {
    const actor = requireAdmin(locals);
    const data = await request.formData();
    let raw = String(data.get('raw') || '');
    const file = data.get('file');
    if (file instanceof File && file.size > 0) {
      if (file.size > 2_000_000) return fail(400, { error: 'Berkas maksimal 2 MB.' });
      raw = await file.text();
    }
    try {
      const service = questionService(db);
      if (data.get('intent') === 'confirm') {
        const result = service.import(raw, String(data.get('hash') || ''), actor);
        return {
          success: result.repeated
            ? `${result.count} soal sudah diimpor sebelumnya. Tidak ada duplikasi.`
            : `${result.count} soal berhasil masuk sebagai draft.`
        };
      }
      const preview = service.preview(raw);
      return {
        preview: {
          hash: preview.hash,
          alreadyImported: preview.alreadyImported,
          batch: preview.batch
        },
        raw
      };
    } catch (e) {
      if (e instanceof DomainError) return fail(e.status, { error: e.message });
      if (e instanceof Error && !('code' in e)) return fail(400, { error: e.message });
      throw e;
    }
  }
};
