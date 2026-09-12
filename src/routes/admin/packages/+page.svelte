<script lang="ts">
  import { enhance } from '$app/forms';
  import { subtests } from '$lib/question-input';
  let { data, form } = $props();
  let kind = $state('CPNS');
</script>

<svelte:head><title>Kelola paket · Ruang Tryout</title></svelte:head>
<div class="page-heading">
  <div>
    <p class="eyebrow">SUSUN LATIHAN</p>
    <h1>Paket tryout.</h1>
    <p class="muted">
      Edisi latihan gratis. Isi paket dibekukan saat dibuat; perubahan membutuhkan paket baru.
    </p>
  </div>
  <a class="button secondary" href="/paket">Lihat katalog</a>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}{#if form?.success}<p
    class="notice success"
  >
    {form.success}
  </p>{/if}
<section class="panel form-panel">
  <h2>Buat paket</h2>
  <p>Simpan sebagai draft terlebih dahulu, lalu periksa informasi sebelum menerbitkan.</p>
  <form method="POST" action="?/create" use:enhance class="stack">
    <label>Judul<input name="title" required minlength="3" maxlength="150" /></label>
    <div class="field-grid">
      <label
        >Jenis<select name="examType" bind:value={kind}
          ><option>CPNS</option><option>PPPK</option></select
        ></label
      ><label
        >Formasi (wajib PPPK)<input
          name="formation"
          required={kind === 'PPPK'}
          maxlength="120"
        /></label
      ><label
        >Tahun target<input
          name="targetYear"
          type="number"
          value="2027"
          min="2020"
          max="2100"
          required
        /></label
      ><label
        >Durasi menit<input
          name="durationMinutes"
          type="number"
          min="1"
          max="240"
          value="10"
          required
        /></label
      >
    </div>
    <label
      >Tahun acuan, sumber dan catatan kurikulum<textarea
        name="reference"
        required
        minlength="10"
        maxlength="2000"
        placeholder="Contoh: Latihan mandiri persiapan 2027; acuan 2027 belum terverifikasi. Sebutkan dokumen historis jika digunakan."
      ></textarea></label
    >
    <fieldset>
      <legend>Jumlah soal per subtes</legend>
      <div class="field-grid">
        {#each subtests as s}<label
            >{s}<input name={s} type="number" min="0" max="200" value="0" required /></label
          >{/each}
      </div>
    </fieldset>
    <fieldset>
      <legend>Pilih soal terbit (maksimal 200, urutan sesuai daftar)</legend>
      {#each data.questions.filter((q) => q.type === kind) as q}<label class="question-choice"
          ><input type="checkbox" name="versionIds" value={q.id} /><span
            ><strong>{q.code} · {q.subtest}</strong><br />{q.prompt}{#if q.formation}<br />Formasi: {q.formation}{/if}</span
          ></label
        >{/each}
      {#if !data.questions.some((q) => q.type === kind)}<p>
          Belum ada soal terbit untuk jenis ini. Selesaikan review di bank soal dahulu.
        </p>{/if}
    </fieldset>
    <button class="button">Simpan draft paket</button>
  </form>
</section>
<section class="panel form-panel">
  <h2>Edisi paket</h2>
  {#each data.packages as p}<article class="package">
      <h3>{p.title}</h3>
      <p>{p.examType} · {p.durationMinutes} menit · Target {p.targetYear} · {p.status}</p>
      <p>{p.reference}</p>
      {#if p.status === 'published'}<details>
          <summary>Aktifkan ranking kompetitif</summary>
          <p>
            Hanya untuk edisi baru yang belum pernah dikerjakan. Satu periode per paket. Penutupan
            tidak dapat diubah; semua sesi berakhir paling lambat pada waktu tersebut.
          </p>
          <form method="POST" action="?/competition" use:enhance class="stack">
            <input type="hidden" name="id" value={p.id} />
            <label
              >Waktu penutupan (ISO, sertakan zona waktu)<input
                name="endsAt"
                placeholder="2027-01-20T20:00:00+08:00"
                required
                pattern=".*(Z|[+-][0-9]{2}:[0-9]{2})"
              /></label
            >
            <button class="button secondary">Aktifkan kompetisi gratis</button>
          </form>
        </details>{/if}
      <p>
        {Object.entries(p.quotas)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' · ')}
      </p>
      {#if p.status === 'draft'}<form method="POST" action="?/publish" use:enhance>
          <input type="hidden" name="id" value={p.id} /><button class="button secondary"
            >Terbitkan latihan gratis</button
          >
        </form>{:else if p.status === 'published'}<a href={'/paket/' + p.id}>Buka detail paket →</a
        >{/if}
      {#if p.cohort}<p><a href={'/admin/rankings/' + p.id}>Audit hasil & generasi ranking →</a></p>{/if}
      {#if p.status !== 'archived'}<details>
          <summary>Arsipkan paket</summary>
          <p>
            Paket akan hilang dari katalog dan tidak menerima peserta baru. Sesi yang sudah dimulai
            serta hasil tetap tersedia. Untuk menerbitkan lagi, buat edisi baru.
          </p>
          <form method="POST" action="?/archive" use:enhance class="stack">
            <input type="hidden" name="id" value={p.id} />
            <label
              >Alasan arsip<textarea name="reason" required minlength="10" maxlength="500"
              ></textarea></label
            >
            <button class="button secondary">Arsipkan paket ini</button>
          </form>
        </details>{/if}
    </article>{:else}<p>Belum ada paket.</p>{/each}
</section>

<style>
  .question-choice {
    display: flex;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid #dde4e9;
  }
  .question-choice input {
    width: auto;
    flex-shrink: 0;
  }
  .package {
    padding: 20px 0;
    border-bottom: 1px solid #dde4e9;
  }
  fieldset {
    border: 1px solid #dde4e9;
    border-radius: 10px;
    min-width: 0;
  }
  section + section {
    margin-top: 24px;
  }
</style>
