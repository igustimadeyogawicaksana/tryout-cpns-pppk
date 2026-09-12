<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  import Icon from '$lib/Icon.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Paket tryout · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <p class="eyebrow">Pilih jalur latihan</p>
  <h1>Paket tryout.</h1>
  <p class="muted">
    Temukan latihan sesuai jenis seleksi. Detail materi, durasi, dan tahun acuan akan tersedia di
    setiap paket.
  </p>
  <nav class="filters" aria-label="Filter jenis seleksi">
    {#each ['Semua', 'CPNS', 'PPPK'] as kind}<a
        class:active={data.kind === kind}
        aria-current={data.kind === kind ? 'page' : undefined}
        href={kind === 'Semua' ? '/paket' : '/paket?jenis=' + kind}>{#if kind === 'CPNS'}<Icon name="target" size={15} />{:else if kind === 'PPPK'}<Icon name="book" size={15} />{/if}{kind}</a
      >{/each}
  </nav>
  <div class="cards">
    {#each data.packages.filter((p) => data.kind === 'Semua' || p.examType === data.kind) as p}<article
        class="participant-card package-card {p.examType.toLowerCase()}"
      >
        <div class="card-top"><span class="icon-badge {p.examType === 'CPNS' ? 'blue' : 'coral'}"><Icon name={p.examType === 'CPNS' ? 'target' : 'book'} size={20} /></span><span class="pill free">Gratis</span></div>
        <h2>{p.title}</h2>
        <p class="meta"><span><Icon name="list" size={17} />{Object.values(p.quotas).reduce((sum, count) => sum + count, 0)} soal</span><span><Icon name="clock" size={17} />{p.durationMinutes} menit</span><span><Icon name="calendar" size={17} />{p.targetYear}</span></p>
        <p>{p.reference}</p>
        <a class="button secondary full" href={'/paket/' + p.id}>Lihat detail</a>
      </article>{/each}
  </div>
  {#if !data.packages.some((p) => data.kind === 'Semua' || p.examType === data.kind)}<section
      class="participant-card empty"
    >
      <span class="pill">Segera</span>
      <h2>Belum ada paket {data.kind === 'Semua' ? '' : data.kind} yang tersedia.</h2>
      <p>Bank soal sedang disusun dan ditinjau. Paket akan muncul setelah siap digunakan.</p>
      <button class="button secondary" disabled>Segera hadir</button>
    </section>{/if}
  <aside class="catalog-info"><span class="icon-badge amber"><Icon name="info" size={20} /></span><p>Informasi harga dan masa akses ditampilkan pada setiap detail paket sebelum pembelian.</p></aside>
</ParticipantShell>

<style>
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 28px 0;
  }
  .filters a {
    display:inline-flex;
    align-items:center;
    gap:7px;
    padding: 12px 24px;
    border: 1px solid #ccd9df;
    border-radius: 30px;
    text-decoration: none;
    background: white;
    transition: transform 150ms ease, box-shadow 150ms ease, color 150ms ease;
  }
  .filters a.active {
    background: var(--color-primary);
    color: white;
    border-color: transparent;
    box-shadow: var(--shadow-md);
  }
  .filters a:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
  .package-card { display:flex; flex-direction:column; }
  .package-card .button { margin-top:auto; }
  .card-top { display:flex; align-items:center; justify-content:space-between; }
  .free { background:var(--color-teal-bg); color:var(--color-teal-fg); }
  .meta { display: flex; flex-wrap: wrap; gap: 16px; }
  .meta span { display: inline-flex; align-items: center; gap: 6px; }
  .empty {
    text-align: center;
    padding: 64px 24px !important;
    border-style:dashed !important;
  }
  .catalog-info { display:flex; align-items:center; gap:14px; padding:18px; border:1px solid var(--color-border); border-radius:var(--radius-md); background:white; }
  .catalog-info p { margin:0; font-size:.9rem; }
  .empty p {
    max-width: 500px;
    margin: 0 auto 24px;
  }
</style>
