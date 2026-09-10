<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  let busy = $state(false);
</script>

<svelte:head><title>Coba {data.question.code} · Ruang Tryout</title></svelte:head>
<a class="back-link" href={'/admin/questions/' + data.question.id}>← Kembali ke editor</a>
<div class="page-heading">
  <div>
    <p class="eyebrow">
      {data.question.subtest} / {data.question.code} / VERSI {data.question.version}
    </p>
    <h1>Coba soal<span class="accent-dot">.</span></h1>
    <p class="muted">
      Simulasi pengelola. Jawaban tidak disimpan sebagai hasil ujian atau ranking.
    </p>
  </div>
</div>
{#if form?.error}<div class="notice error" role="alert">{form.error}</div>{/if}
{#if !data.question.ready}<div class="notice">
    Soal belum lengkap. Lengkapi melalui editor sebelum mencoba penilaian.
  </div>{/if}
<section class="panel form-panel">
  <h2>Pertanyaan</h2>
  <p class="question-text">{data.question.prompt || 'Pertanyaan belum diisi.'}</p>
  <form
    method="POST"
    class="stack"
    use:enhance={() => {
      busy = true;
      return async ({ update }) => {
        try {
          await update({ reset: false });
        } finally {
          busy = false;
        }
      };
    }}
  >
    <input type="hidden" name="revision" value={data.question.revision} />
    <fieldset disabled={busy || !data.question.ready || !!form?.result}>
      <legend>Pilih jawaban</legend>
      {#each data.question.options as option}
        <label class="try-option"
          ><input type="radio" name="choice" value={option.code} required />
          <span><strong>{option.code}.</strong> {option.text}</span></label
        >
      {/each}
      <label class="try-option"
        ><input type="radio" name="choice" value="blank" required />
        <span>Kosongkan jawaban</span></label
      >
    </fieldset>
    {#if !form?.result}<button class="button" disabled={busy || !data.question.ready}
        >{busy ? 'Memeriksa…' : 'Periksa jawaban'}</button
      >{/if}
  </form>
</section>
{#if form?.result}
  <section class="panel form-panel" aria-live="polite">
    <p class="eyebrow">HASIL SIMULASI</p>
    <h2>Skor {form.result.score} / {form.result.maximum}</h2>
    <p>Jawaban Anda: <strong>{form.result.choice || 'Kosong'}</strong>.</p>
    <p>
      {form.result.weighted ? 'Pilihan dengan bobot tertinggi' : 'Kunci jawaban'}:
      <strong>{form.result.best.join(', ')}</strong>
    </p>
    {#if form.result.weighted}
      <ul>
        {#each form.result.options as option}<li>{option.code}: {option.score} poin</li>{/each}
      </ul>
    {/if}
    <h3>Pembahasan</h3>
    <p class="question-text">{form.result.explanation}</p>
    <a
      class="button secondary"
      data-sveltekit-reload
      href={'/admin/questions/' + data.question.id + '/try'}>Coba lagi</a
    >
  </section>
{/if}

<style>
  .question-text {
    white-space: pre-wrap;
    line-height: 1.8;
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
  legend {
    font-weight: 600;
    margin-bottom: 12px;
  }
  .try-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    margin: 8px 0;
    border: 1px solid #dce3e9;
    border-radius: 10px;
    cursor: pointer;
  }
  .try-option input {
    width: auto;
    margin-top: 4px;
  }
  .try-option span {
    white-space: pre-wrap;
  }
  .try-option:has(input:checked) {
    background: #eaf8f1;
    border-color: #328263;
  }
  section + section {
    margin-top: 24px;
  }
</style>
