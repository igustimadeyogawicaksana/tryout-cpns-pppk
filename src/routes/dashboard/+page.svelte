<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Dashboard saya · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <p class="eyebrow">RUANG BELAJARMU</p>
  <h1>Halo, {data.name}.</h1>
  <p class="muted">Persiapan dimulai dari langkah yang terarah.</p>
  <div class="cards">
    <section class="participant-card">
      <span class="pill">PAKET SAYA</span>
      <h2>Ruang latihan sedang disiapkan</h2>
      <p>
        Paket yang bisa dikerjakan nantinya tersedia di sini. Saat ini belum ada paket yang dibuka.
      </p>
      <a class="button" href="/paket">Jelajahi paket</a>
    </section>
    <section class="participant-card">
      <span class="pill">HASIL LATIHAN</span>
      <h2>Belum ada riwayat ujian</h2>
      <p>
        Setelah fitur ujian tersedia, hasil dan pembahasan latihan akan dapat dilihat dari halaman
        ini.
      </p>
    </section>
  </div>
  {#if data.isAdmin}<div class="notice">
      Anda masuk sebagai pengelola. <a href="/admin/questions">Buka bank soal →</a>
    </div>{/if}
</ParticipantShell>
