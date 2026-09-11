import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { examService } from '$lib/server/exam-service';
export const load: PageServerLoad = ({ url }) => ({
  packages: examService(db).list(),
  kind: ['CPNS', 'PPPK'].includes(url.searchParams.get('jenis') || '')
    ? url.searchParams.get('jenis')!
    : 'Semua'
});
