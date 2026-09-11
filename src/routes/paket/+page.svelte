<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Paket tryout · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <p class="eyebrow">PILIH JALUR LATIHAN</p>
  <h1>Paket tryout.</h1>
  <p class="muted">
    Temukan latihan sesuai jenis seleksi. Detail materi, durasi, dan tahun acuan akan tersedia di
    setiap paket.
  </p>
  <nav class="filters" aria-label="Filter jenis seleksi">
    {#each ['Semua', 'CPNS', 'PPPK'] as kind}<a
        class:active={data.kind === kind}
        aria-current={data.kind === kind ? 'page' : undefined}
        href={kind === 'Semua' ? '/paket' : '/paket?jenis=' + kind}>{kind}</a
      >{/each}
  </nav>
  <div class="cards">
    {#each data.packages.filter((p) => data.kind === 'Semua' || p.examType === data.kind) as p}<article
        class="participant-card"
      >
        <span class="pill">{p.examType} · Gratis</span>
        <h2>{p.title}</h2>
        <p>{p.durationMinutes} menit · Target {p.targetYear}</p>
        <p>{p.reference}</p>
        <a class="button secondary" href={'/paket/' + p.id}>Detail paket</a>
      </article>{/each}
  </div>
  {#if !data.packages.some((p) => data.kind === 'Semua' || p.examType === data.kind)}<section
      class="participant-card empty"
    >
      <span class="pill">SEDANG DISIAPKAN</span>
      <h2>Belum ada paket {data.kind === 'Semua' ? '' : data.kind} yang tersedia.</h2>
      <p>Bank soal sedang disusun dan ditinjau. Paket akan muncul setelah siap digunakan.</p>
      <a class="button secondary" href="/">Kembali ke beranda</a>
    </section>{/if}
</ParticipantShell>

<style>
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 28px 0;
  }
  .filters a {
    padding: 12px 24px;
    border: 1px solid #ccd9df;
    border-radius: 30px;
    text-decoration: none;
    background: white;
  }
  .filters a.active {
    background: #102b46;
    color: white;
  }
  .empty {
    text-align: center;
    padding: 64px 24px !important;
  }
  .empty p {
    max-width: 500px;
    margin: 0 auto 24px;
  }
</style>
