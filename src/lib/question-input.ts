import { z } from 'zod';

export const subtests = [
  'TWK',
  'TIU',
  'TKP',
  'TEKNIS',
  'MANAJERIAL',
  'SOSIAL_KULTURAL',
  'WAWANCARA'
] as const;
export const statuses = ['draft', 'in_review', 'approved', 'published', 'archived'] as const;
export type EditorialStatus = (typeof statuses)[number];
export const statusLabels: Record<EditorialStatus, string> = {
  draft: 'Draft',
  in_review: 'Dalam review',
  approved: 'Disetujui',
  published: 'Terbit',
  archived: 'Diarsipkan'
};
const score = z.number().int().min(0).max(100);
export const draftSchema = z
  .object({
    external_key: z
      .string()
      .trim()
      .min(1, 'Kode soal wajib diisi.')
      .max(80)
      .regex(/^[A-Za-z0-9_-]+$/, 'Gunakan huruf, angka, tanda - atau _.'),
    exam_type: z.enum(['CPNS', 'PPPK']),
    subtest_code: z.enum(subtests),
    formation_code: z.string().trim().max(120).nullable().default(null),
    topic_code: z.string().trim().max(120).default(''),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    prompt_md: z.string().max(20000).default(''),
    scoring_mode: z.enum(['single_correct', 'weighted_options']),
    options: z
      .array(
        z
          .object({
            code: z.enum(['A', 'B', 'C', 'D', 'E']),
            text_md: z.string().max(5000),
            score: score.optional()
          })
          .strict()
      )
      .length(5),
    correct_option_code: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
    score_correct: score.optional(),
    score_wrong: score.optional(),
    score_blank: score.default(0),
    explanation_md: z.string().max(20000).default(''),
    shuffle_options: z.boolean().default(true),
    assets: z.array(z.never()).max(0, 'Unggahan gambar belum tersedia pada tahap ini.').default([]),
    source_note: z.string().max(2000).default(''),
    rights_basis: z.string().max(500).default('')
  })
  .strict()
  .superRefine((q, ctx) => {
    if (new Set(q.options.map((o) => o.code)).size !== 5)
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Kode opsi A–E harus unik.' });
    if ((q.exam_type === 'CPNS') !== ['TWK', 'TIU', 'TKP'].includes(q.subtest_code))
      ctx.addIssue({
        code: 'custom',
        path: ['subtest_code'],
        message: 'Subtes tidak sesuai jenis ujian.'
      });
  });
export type QuestionInput = z.infer<typeof draftSchema>;
export function readinessIssues(q: QuestionInput): string[] {
  const issues: string[] = [];
  if (!q.prompt_md.trim()) issues.push('Pertanyaan belum diisi.');
  if (!q.topic_code.trim()) issues.push('Topik belum diisi.');
  if (!q.explanation_md.trim()) issues.push('Pembahasan belum diisi.');
  if (!q.source_note.trim() || !q.rights_basis.trim())
    issues.push('Sumber dan dasar hak penggunaan wajib diisi.');
  if (q.exam_type === 'PPPK' && q.subtest_code === 'TEKNIS' && !q.formation_code?.trim())
    issues.push('Formasi wajib untuk PPPK teknis.');
  q.options.forEach((o) => {
    if (!o.text_md.trim()) issues.push(`Teks opsi ${o.code} belum diisi.`);
  });
  if (new Set(q.options.map((o) => o.text_md.trim().toLocaleLowerCase('id'))).size !== 5)
    issues.push('Teks opsi harus berbeda.');
  if (q.scoring_mode === 'single_correct') {
    if (!q.correct_option_code || !q.options.some((o) => o.code === q.correct_option_code))
      issues.push('Pilih satu kunci jawaban.');
    if (q.score_correct === undefined || q.score_wrong === undefined)
      issues.push('Isi nilai benar dan salah.');
    else if (q.score_correct <= q.score_wrong || q.score_correct < q.score_blank)
      issues.push(
        'Nilai benar harus lebih besar dari nilai salah dan tidak lebih kecil dari kosong.'
      );
  } else {
    if (q.options.some((o) => o.score === undefined)) issues.push('Isi bobot semua opsi.');
    if (q.options.every((o) => (o.score ?? 0) === 0))
      issues.push('Setidaknya satu opsi harus memiliki bobot positif.');
  }
  if (q.subtest_code === 'TKP' && q.scoring_mode !== 'weighted_options')
    issues.push('TKP memakai bobot tiap opsi.');
  return issues;
}
export const completeSchema = draftSchema.superRefine((q, ctx) => {
  readinessIssues(q).forEach((message) => ctx.addIssue({ code: 'custom', message }));
});
export const batchSchema = z
  .object({
    schema_version: z.literal(1),
    batch_key: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[A-Za-z0-9_-]+$/),
    questions: z.array(completeSchema).min(1).max(100)
  })
  .strict()
  .superRefine((b, ctx) => {
    const keys = new Set<string>();
    b.questions.forEach((q, i) => {
      if (keys.has(q.external_key))
        ctx.addIssue({
          code: 'custom',
          path: ['questions', i, 'external_key'],
          message: 'Kode soal duplikat dalam berkas.'
        });
      keys.add(q.external_key);
    });
  });
export type QuestionBatch = z.infer<typeof batchSchema>;
export function parseBatch(raw: string): QuestionBatch {
  if (new TextEncoder().encode(raw).length > 2_000_000) throw new Error('Berkas maksimal 2 MB.');
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    throw new Error('JSON tidak terbaca. Periksa koma, tanda kutip dan kurung.');
  }
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      parsed.error.issues
        .slice(0, 15)
        .map((i) => `${i.path.join('.') || 'Soal'}: ${i.message}`)
        .join('\n')
    );
  return parsed.data;
}
export function blankQuestion(): QuestionInput {
  return {
    external_key: '',
    exam_type: 'CPNS',
    subtest_code: 'TIU',
    formation_code: null,
    topic_code: '',
    difficulty: 'medium',
    prompt_md: '',
    scoring_mode: 'single_correct',
    options: (['A', 'B', 'C', 'D', 'E'] as const).map((code) => ({ code, text_md: '' })),
    correct_option_code: 'A',
    score_correct: 5,
    score_wrong: 0,
    score_blank: 0,
    explanation_md: '',
    shuffle_options: true,
    assets: [],
    source_note: '',
    rights_basis: ''
  };
}
export function scoreAnswer(q: QuestionInput, code: string | null): number {
  if (code === null) return q.score_blank;
  const option = q.options.find((o) => o.code === code);
  if (!option) throw new Error('Pilihan tidak termasuk soal.');
  return q.scoring_mode === 'weighted_options'
    ? option.score!
    : code === q.correct_option_code
      ? q.score_correct!
      : q.score_wrong!;
}
