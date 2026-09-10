<script lang="ts">
  import { statusLabels } from '$lib/question-input';
  let { data } = $props();
  const count = (status: string) =>
    data.stats.find((s: { status: string; count: number }) => s.status === status)?.count || 0;
</script>

<svelte:head><title>Bank soal · Ruang Tryout</title></svelte:head>
<div class="page-heading">
  <div>
    <p class="eyebrow">KONTEN LATIHAN</p>
    <h1>Bank soal<span class="accent-dot">.</span></h1>
    <p class="muted">Satu ruang untuk menyusun, meninjau, dan menerbitkan soal.</p>
  </div>
  <div class="actions">
    <a class="button secondary" href="/admin/questions/import">Impor JSON</a><a
      class="button"
      href="/admin/questions/new"><span aria-hidden="true">＋</span> Tambah soal</a
    >
  </div>
</div>
<div class="stats-grid">
  <div class="stat">
    <span>Seluruh soal</span><strong
      >{data.stats.reduce((n: number, s: { count: number }) => n + s.count, 0)}</strong
    ><small>Versi terbaru setiap soal</small>
  </div>
  <div class="stat">
    <span>Dalam penyusunan</span><strong>{count('draft')}</strong><small
      >Lengkapi isi dan pembahasan</small
    >
  </div>
  <div class="stat">
    <span>Menunggu review</span><strong>{count('in_review')}</strong><small
      >Periksa kualitas dan bobot</small
    >
  </div>
  <div class="stat highlight">
    <span>Soal terbit</span><strong>{count('published')}</strong><small
      >Siap untuk penyusunan paket</small
    >
  </div>
</div>
<section class="panel">
  <div class="panel-heading">
    <div>
      <h2>Koleksi soal</h2>
      <p class="muted">Maksimal 100 hasil terbaru. Gunakan pencarian untuk mempersempit.</p>
    </div>
  </div>
  <form method="GET" class="filter-bar">
    <label class="search-field"
      ><span class="sr-only">Cari soal</span><input
        name="q"
        value={data.search}
        placeholder="Cari kode, topik, atau isi soal…"
      /></label
    ><label
      ><span class="sr-only">Status</span><select name="status" value={data.status}
        ><option value="">Semua status</option
        >{#each Object.entries(statusLabels) as [key, label]}<option value={key}>{label}</option
          >{/each}</select
      ></label
    ><button class="button secondary">Cari</button>{#if data.search || data.status}<a
        class="text-button"
        href="/admin/questions">Reset</a
      >{/if}
  </form>
  {#if data.rows.length}
    <div class="table-wrap">
      <table>
        <thead
          ><tr
            ><th>Soal</th><th>Kategori</th><th>Status</th><th>Versi</th><th
              ><span class="sr-only">Aksi</span></th
            ></tr
          ></thead
        ><tbody
          >{#each data.rows as row}<tr
              ><td
                ><a class="question-link" href={'/admin/questions/' + row.id}
                  >{row.content.prompt_md || 'Pertanyaan belum diisi'}</a
                ><small class="code"
                  >{row.externalKey} · {row.content.topic_code || 'Belum ada topik'}</small
                ></td
              ><td
                ><span class="pill subtle">{row.content.subtest_code}</span><small
                  >{row.content.exam_type}</small
                ></td
              ><td><span class={'pill status-' + row.status}>{statusLabels[row.status]}</span></td
              ><td class="muted">v{row.version}</td><td
                ><a
                  class="row-link"
                  href={'/admin/questions/' + row.id}
                  aria-label={'Buka ' + row.externalKey}>Buka ↗</a
                ></td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>
  {:else}<div class="empty-state">
      <div class="empty-icon" aria-hidden="true">▤</div>
      <h3>
        {data.search || data.status
          ? 'Belum ada soal yang cocok'
          : 'Mulai dari satu soal yang baik'}
      </h3>
      <p>
        {data.search || data.status
          ? 'Coba kata kunci atau status lainnya.'
          : 'Tambahkan soal pertama, atau impor kumpulan soal yang sudah disiapkan. Semua soal baru tersimpan sebagai draft.'}
      </p>
      <a class="button secondary" href="/admin/questions/new"
        >Tulis soal pertama <span aria-hidden="true">↗</span></a
      >
    </div>{/if}
</section>
<div class="info-strip">
  <strong>Draft → Review → Terbit</strong><span
    >Soal yang sudah terbit disimpan sebagai versi tetap. Koreksi dilakukan lewat versi baru.</span
  >
</div>
