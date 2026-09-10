import { error, fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/access';
import { db } from '$lib/server/db';
import { questionService, DomainError } from '$lib/server/question-service';
import { readinessIssues, scoreAnswer } from '$lib/question-input';
import type { Actions, PageServerLoad } from './$types';

function getQuestion(id: string) {
  try {
    return questionService(db).get(id);
  } catch (e) {
    if (e instanceof DomainError) error(e.status, e.message);
    throw e;
  }
}
export const load: PageServerLoad = ({ locals, params }) => {
  requireAdmin(locals);
  const row = getQuestion(params.id);
  // Explicit projection: no keys, scores, explanation or original content in page data.
  return {
    question: {
      id: row.id,
      revision: row.revision,
      version: row.version,
      code: row.content.external_key,
      subtest: row.content.subtest_code,
      prompt: row.content.prompt_md,
      options: row.content.options.map((o) => ({ code: o.code, text: o.text_md })),
      ready: readinessIssues(row.content).length === 0
    }
  };
};
export const actions: Actions = {
  default: async ({ locals, params, request }) => {
    requireAdmin(locals);
    const form = await request.formData();
    const row = getQuestion(params.id);
    if (Number(form.get('revision')) !== row.revision)
      return fail(409, {
        error: 'Soal berubah sejak dibuka. Muat ulang halaman sebelum mencoba lagi.'
      });
    if (readinessIssues(row.content).length)
      return fail(422, {
        error: 'Lengkapi soal, bobot, pembahasan dan sumber di editor terlebih dahulu.'
      });
    const choice = form.get('choice');
    if (
      typeof choice !== 'string' ||
      (choice !== 'blank' && !row.content.options.some((o) => o.code === choice))
    )
      return fail(400, { error: 'Pilih salah satu jawaban atau opsi kosong.' });
    const q = row.content;
    const options = q.options.map((o) => ({
      code: o.code,
      text: o.text_md,
      score: scoreAnswer(q, o.code)
    }));
    const maximum = Math.max(q.score_blank, ...options.map((o) => o.score));
    return {
      result: {
        choice: choice === 'blank' ? null : choice,
        score: scoreAnswer(q, choice === 'blank' ? null : choice),
        maximum,
        weighted: q.scoring_mode === 'weighted_options',
        best: options.filter((o) => o.score === maximum).map((o) => o.code),
        options,
        explanation: q.explanation_md
      }
    };
  }
};
