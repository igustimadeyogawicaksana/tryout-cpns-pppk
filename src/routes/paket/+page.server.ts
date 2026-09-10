import type { PageServerLoad } from './$types';
export const load: PageServerLoad = ({ url }) => ({
  kind: ['CPNS', 'PPPK'].includes(url.searchParams.get('jenis') || '')
    ? url.searchParams.get('jenis')!
    : 'Semua'
});
