import { requireAdmin } from '$lib/server/access';
import example from '../../../../../../examples/question-bank-import.json';
export function GET({ locals }: { locals: App.Locals }) {
  requireAdmin(locals);
  return new Response(JSON.stringify(example, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="contoh-bank-soal.json"'
    }
  });
}
