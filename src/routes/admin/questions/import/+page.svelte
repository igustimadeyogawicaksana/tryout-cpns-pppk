<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
  let busy = $state(false);
</script>

<svelte:head><title>Impor soal · Ruang Tryout</title></svelte:head>
<a class="back-link" href="/admin/questions">← Bank soal</a>
<div class="page-heading">
  <div>
    <p class="eyebrow">TAMBAHKAN SEKALIGUS</p>
    <h1>Impor bank soal<span class="accent-dot">.</span></h1>
    <p class="muted">Periksa isi berkas terlebih dahulu. Soal baru selalu masuk sebagai draft.</p>
  </div>
  <a class="button secondary" href="/admin/questions/import/example">Unduh contoh JSON</a>
</div>
{#if form?.error}<div class="notice error" role="alert">{form.error}</div>{/if}
{#if form?.success}<div class="notice success" role="status">
    {form.success} <a href="/admin/questions">Buka bank soal →</a>
  </div>{/if}
<div class="editor-grid">
  <section class="panel form-panel">
    <p class="section-number">01 / PILIH BERKAS</p>
    <h2>Unggah JSON</h2>
    <form
      method="POST"
      enctype="multipart/form-data"
      class="stack"
      use:enhance={() => {
        busy = true;
        return async ({ update }) => {
          await update({ reset: false });
          busy = false;
        };
      }}
    >
      <label class="upload-box"
        >Berkas bank soal<input
          name="file"
          type="file"
          accept=".json,application/json"
          required
        /><span>Maksimal 100 soal · 2 MB · Tanpa gambar</span></label
      ><button class="button" disabled={busy}>{busy ? 'Memeriksa…' : 'Periksa berkas'}</button>
    </form>
  </section>
  <aside class="panel form-panel">
    <h2>Sebelum mengimpor</h2>
    <ol class="instruction-list">
      <li>Gunakan kode soal dan kode batch yang unik.</li>
      <li>Lengkapi opsi, bobot, pembahasan dan sumber.</li>
      <li>Periksa ringkasan, lalu konfirmasikan impor.</li>
    </ol>
    <p class="muted">Jika ada kesalahan, seluruh batch ditahan. Soal lama tidak ditimpa.</p>
  </aside>
</div>
{#if form?.preview}<section class="panel form-panel">
    <p class="section-number">02 / HASIL PEMERIKSAAN</p>
    <h2>{form.preview.batch.questions.length} soal siap diperiksa</h2>
    <p class="muted">Batch: {form.preview.batch.batch_key}</p>
    {#if form.preview.alreadyImported}<div class="notice">
        Batch ini sudah pernah diimpor. Konfirmasi ulang tidak membuat soal ganda.
      </div>{/if}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Kode</th><th>Pertanyaan</th><th>Subtes</th></tr></thead><tbody
          >{#each form.preview.batch.questions as q}<tr
              ><td class="code">{q.external_key}</td><td>{q.prompt_md}</td><td>{q.subtest_code}</td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>
    <form method="POST" use:enhance>
      <input type="hidden" name="raw" value={form.raw} /><input
        type="hidden"
        name="hash"
        value={form.preview.hash}
      /><input type="hidden" name="intent" value="confirm" /><button class="button"
        >Konfirmasi impor ke draft</button
      >
    </form>
  </section>{/if}
