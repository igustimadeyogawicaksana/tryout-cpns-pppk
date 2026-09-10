<script lang="ts">
  import { enhance } from '$app/forms';
  import { untrack } from 'svelte';
  import { subtests, type QuestionInput } from '$lib/question-input';
  let {
    initial,
    revision = 1,
    existing = false,
    action = '?/save',
    error = ''
  }: {
    initial: QuestionInput;
    revision?: number;
    existing?: boolean;
    action?: string;
    error?: string;
  } = $props();
  let q = $state<QuestionInput>(untrack(() => JSON.parse(JSON.stringify(initial))));
  let busy = $state(false);
  $effect(() => {
    q = JSON.parse(JSON.stringify(initial));
  });
  const difficultyLabels = { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit' };
</script>

<form
  method="POST"
  {action}
  use:enhance={() => {
    busy = true;
    return async ({ update }) => {
      await update({ reset: false });
      busy = false;
    };
  }}
>
  <input type="hidden" name="payload" value={JSON.stringify(q)} /><input
    type="hidden"
    name="revision"
    value={revision}
  />
  {#if error}<div class="notice error" role="alert">{error}</div>{/if}
  <div class="editor-grid">
    <div class="editor-main">
      <section class="panel form-panel">
        <p class="section-number">01 / IDENTITAS SOAL</p>
        <h2>Klasifikasi</h2>
        <div class="field-grid">
          <label
            >Kode soal <span class="required">*</span><input
              bind:value={q.external_key}
              readonly={existing}
              required
              placeholder="TIU-ARIT-001"
              maxlength="80"
            /></label
          >
          <label
            >Jenis ujian<select
              bind:value={q.exam_type}
              onchange={() => {
                q.subtest_code = q.exam_type === 'CPNS' ? 'TIU' : 'TEKNIS';
              }}><option>CPNS</option><option>PPPK</option></select
            ></label
          >
          <label
            >Subtes<select
              bind:value={q.subtest_code}
              onchange={() => {
                if (q.subtest_code === 'TKP') q.scoring_mode = 'weighted_options';
              }}
              >{#each subtests.filter((s) => (q.exam_type === 'CPNS') === ['TWK', 'TIU', 'TKP'].includes(s)) as s}<option
                  >{s}</option
                >{/each}</select
            ></label
          >
          <label
            >Topik<input
              bind:value={q.topic_code}
              placeholder="Contoh: ARITMETIKA"
              maxlength="120"
            /></label
          >
          <label
            >Kesulitan<select bind:value={q.difficulty}
              >{#each Object.entries(difficultyLabels) as [value, label]}<option {value}
                  >{label}</option
                >{/each}</select
            ></label
          >
          {#if q.exam_type === 'PPPK'}<label
              >Formasi / bidang<input
                value={q.formation_code || ''}
                oninput={(e) => (q.formation_code = e.currentTarget.value || null)}
                placeholder="Wajib untuk kompetensi teknis"
              /></label
            >{/if}
        </div>
      </section>
      <section class="panel form-panel">
        <p class="section-number">02 / ISI & JAWABAN</p>
        <h2>Pertanyaan</h2>
        <label
          ><span class="sr-only">Teks pertanyaan</span><textarea
            rows="6"
            bind:value={q.prompt_md}
            placeholder="Tuliskan pertanyaan di sini…"></textarea></label
        >
        <p class="field-help">
          Teks disimpan apa adanya. Tampilan kaya, gambar dan rumus menyusul.
        </p>
        <div class="field-grid">
          <label
            >Metode penilaian<select bind:value={q.scoring_mode}
              ><option value="single_correct">Satu jawaban benar</option><option
                value="weighted_options">Bobot tiap opsi</option
              ></select
            ></label
          >{#if q.scoring_mode === 'single_correct'}<label
              >Kunci jawaban<select bind:value={q.correct_option_code}
                >{#each ['A', 'B', 'C', 'D', 'E'] as code}<option>{code}</option>{/each}</select
              ></label
            >{/if}
        </div>
        <div class="options-editor">
          {#each q.options as option, i}<div class="option-row">
              <span class="option-letter">{option.code}</span><label class="option-text"
                ><span class="sr-only">Teks opsi {option.code}</span><textarea
                  rows="2"
                  bind:value={q.options[i].text_md}
                  placeholder={'Isi pilihan ' + option.code}></textarea></label
              >{#if q.scoring_mode === 'weighted_options'}<label class="weight"
                  >Bobot<input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    bind:value={q.options[i].score}
                  /></label
                >{/if}
            </div>{/each}
        </div>
        <div class="field-grid three">
          {#if q.scoring_mode === 'single_correct'}<label
              >Nilai benar<input
                type="number"
                min="0"
                max="100"
                step="1"
                bind:value={q.score_correct}
              /></label
            ><label
              >Nilai salah<input
                type="number"
                min="0"
                max="100"
                step="1"
                bind:value={q.score_wrong}
              /></label
            >{/if}<label
            >Nilai kosong<input
              type="number"
              min="0"
              max="100"
              step="1"
              bind:value={q.score_blank}
            /></label
          >
        </div>
        <label class="checkbox"
          ><input type="checkbox" bind:checked={q.shuffle_options} /> Izinkan pengacakan urutan opsi</label
        >
      </section>
      <section class="panel form-panel">
        <p class="section-number">03 / PEMBAHASAN</p>
        <h2>Jelaskan alasan jawabannya</h2>
        <label
          ><span class="sr-only">Pembahasan</span><textarea
            rows="6"
            bind:value={q.explanation_md}
            placeholder="Jelaskan langkah penyelesaian dan alasan pemilihan jawaban…"
          ></textarea></label
        >
      </section>
    </div>
    <aside class="editor-aside">
      <section class="panel form-panel">
        <p class="section-number">CATATAN EDITORIAL</p>
        <h2>Sumber & penggunaan</h2>
        <label
          >Sumber soal<textarea
            rows="3"
            bind:value={q.source_note}
            placeholder="Karya sendiri atau referensi yang digunakan"></textarea></label
        ><label
          >Dasar hak penggunaan<textarea
            rows="3"
            bind:value={q.rights_basis}
            placeholder="Karya sendiri, izin tertulis, atau lisensi"></textarea></label
        >
        <p class="field-help">Parafrase tidak otomatis memberikan hak penggunaan.</p>
        <hr />
        <p class="muted">
          Draft boleh belum lengkap. Seluruh isi, opsi, bobot dan pembahasan harus lengkap sebelum
          review.
        </p>
        <button class="button full" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan draft'}</button
        ><a class="cancel-link" href="/admin/questions">Kembali ke bank soal</a>
      </section>
    </aside>
  </div>
</form>
