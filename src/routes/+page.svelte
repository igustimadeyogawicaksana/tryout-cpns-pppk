<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data } = $props();
</script>

<svelte:head
  ><title>Ruang Tryout · Persiapan CPNS & PPPK</title><meta
    name="description"
    content="Ruang persiapan tryout CPNS dan PPPK. Jelajahi jalur latihan dan ketersediaan paket."
  /></svelte:head
>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <section class="hero">
    <div>
      <p class="eyebrow">LANGKAH KECIL. PERSIAPAN LEBIH TERARAH.</p>
      <h1>Siapkan langkahmu.<br /><span>Bangun percaya diri.</span></h1>
      <p class="intro">
        Temukan jalur latihan CPNS dan PPPK yang sesuai dengan tujuanmu. Mulai dengan mengenal
        materi dan paket yang tersedia.
      </p>
      <div class="actions">
        <a class="button" href="/paket">Lihat paket tryout ↗</a><a
          class="button secondary"
          href={data.user ? '/dashboard' : '/login'}
          >{data.user ? 'Dashboard saya' : 'Masuk akun'}</a
        >
      </div>
    </div>
    <aside class="path-card">
      <p class="eyebrow">PETA PERSIAPAN</p>
      <h2>Satu langkah<br />setiap hari.</h2>
      <ol>
        <li><strong>Pilih jalur</strong><span>CPNS atau PPPK</span></li>
        <li><strong>Kenali materi</strong><span>Sesuaikan dengan jenis seleksi</span></li>
        <li><strong>Latihan bertahap</strong><span>Paket latihan sedang disiapkan</span></li>
      </ol>
      <span class="pill">Edisi awal · Paket segera hadir</span>
    </aside>
  </section>
  <section>
    <p class="eyebrow">TENTUKAN TUJUANMU</p>
    <h2>Dua jalur, persiapan yang berbeda.</h2>
    <div class="cards">
      <article class="participant-card">
        <span class="pill">CPNS</span>
        <h2>Persiapan SKD</h2>
        <p>
          Kenali materi TWK, TIU, dan TKP. Komposisi paket akan ditampilkan bersama tahun dan
          dokumen acuannya.
        </p>
        <a href="/paket?jenis=CPNS">Lihat jalur CPNS →</a>
      </article>
      <article class="participant-card">
        <span class="pill">PPPK</span>
        <h2>Latihan sesuai jabatan</h2>
        <p>
          Persiapan dipisahkan berdasarkan jenis seleksi dan formasi agar materi latihan tetap
          relevan.
        </p>
        <a href="/paket?jenis=PPPK">Lihat jalur PPPK →</a>
      </article>
    </div>
  </section>
  <p class="muted">
    Target persiapan 2027. Acuan resmi 2027 belum terverifikasi; informasi paket akan menyebutkan
    tahun referensi secara jelas.
  </p>
</ParticipantShell>

<style>
  .hero {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 48px;
    align-items: center;
    margin: 12px 0 72px;
  }
  .hero h1 span {
    color: #247358;
  }
  .intro {
    font-size: 1.1rem;
    max-width: 570px;
    margin-bottom: 28px;
  }
  .path-card {
    padding: 36px;
    border-radius: 24px;
    background: #e4f1e9;
    border: 1px solid #c4dfd0;
    transform: rotate(1deg);
  }
  .path-card h2 {
    font-size: 2rem;
    line-height: 1.2;
  }
  .path-card ol {
    padding-left: 24px;
    display: grid;
    gap: 20px;
    margin: 24px 0 32px;
  }
  .path-card li span {
    display: block;
    color: #526b60;
    font-size: 0.9rem;
  }
  @media (max-width: 800px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 28px;
      margin-bottom: 48px;
    }
    .path-card {
      transform: none;
      padding: 24px;
    }
  }
</style>
