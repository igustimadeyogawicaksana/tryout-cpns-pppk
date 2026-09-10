import { db } from '$lib/server/db';
import { questionService } from '$lib/server/question-service';
import { requireAdmin } from '$lib/server/access';
export function load({ locals, url }: { locals: App.Locals; url: URL }) {
  requireAdmin(locals);
  const search = (url.searchParams.get('q') || '').slice(0, 100),
    status = url.searchParams.get('status') || '';
  const service = questionService(db);
  return { rows: service.list(search, status), stats: service.stats(), search, status };
}
