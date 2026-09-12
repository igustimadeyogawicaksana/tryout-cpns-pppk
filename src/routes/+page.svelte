<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  import Icon from '$lib/Icon.svelte';
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
    <aside class="start-panel" aria-labelledby="start-title">
      <p class="eyebrow">Mulai dari tujuanmu</p>
      <h2 id="start-title">Mau latihan apa hari ini?</h2>
      <p>Pilih jalur untuk melihat paket, komposisi soal, dan masa aksesnya.</p>
      <a class="path-link" href="/paket?jenis=CPNS"><span class="icon-badge blue"><Icon name="target" size={22} /></span><span><strong>Latihan CPNS</strong><small>Persiapan TWK, TIU, dan TKP</small></span><span aria-hidden="true">→</span></a>
      <a class="path-link" href="/paket?jenis=PPPK"><span class="icon-badge coral"><Icon name="book" size={22} /></span><span><strong>Latihan PPPK</strong><small>Materi sesuai jenis seleksi dan formasi</small></span><span aria-hidden="true">→</span></a>
      <a class="resume-link" href={data.user ? '/dashboard' : '/login'}>{data.user ? 'Lanjutkan latihan dari dashboard →' : 'Sudah punya akun? Masuk →'}</a>
    </aside>
  </section>
  <section class="why">
    <p class="eyebrow">KENAPA RUANGTRYOUT</p>
    <h2>Latihan yang mudah dipahami.</h2>
    <div class="why-grid">
      <article><span class="icon-badge blue"><Icon name="monitor" size={20} /></span><h3>Tampilan familiar</h3><p>Berlatih dengan susunan layar yang terarah dan mudah diikuti.</p></article>
      <article><span class="icon-badge teal"><Icon name="chart" size={20} /></span><h3>Hasil langsung terbaca</h3><p>Lihat ringkasan nilai dan progres latihan dari akunmu.</p></article>
      <article><span class="icon-badge amber"><Icon name="users" size={20} /></span><h3>Ranking sesama peserta</h3><p>Bandingkan hasil dalam periode latihan yang sama.</p></article>
    </div>
  </section>
  <section class="goals">
    <p class="eyebrow">TENTUKAN TUJUANMU</p>
    <h2>Dua jalur, persiapan yang berbeda.</h2>
    <div class="cards">
      <article class="participant-card cpns-goal">
        <span class="icon-badge blue"><Icon name="target" size={22} /></span>
        <h2>Persiapan SKD</h2>
        <p>
          Kenali materi TWK, TIU, dan TKP. Komposisi paket akan ditampilkan bersama tahun dan
          dokumen acuannya.
        </p>
        <a href="/paket?jenis=CPNS">Lihat jalur CPNS →</a>
      </article>
      <article class="participant-card pppk-goal">
        <span class="icon-badge coral"><Icon name="book" size={22} /></span>
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
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
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
  .hero h1 { font-size:clamp(2.4rem, 4.8vw, 3.6rem); font-weight:750; line-height:1.12; }
  .start-panel { min-width:0; padding:30px; background:white; border:1px solid var(--color-border); border-radius:20px; box-shadow:var(--shadow-sm); }
  .start-panel h2 { font-size:1.65rem; line-height:1.3; }
  .path-link { display:flex; align-items:center; gap:14px; padding:18px 0; border-bottom:1px solid var(--color-border); min-height:80px; }
  .path-link > span:nth-child(2) { flex:1; min-width:0; }
  .path-link strong,.path-link small { display:block; }
  .path-link strong { font-size:1.1rem; }
  .path-link small { margin-top:5px; font-size:.9rem; color:var(--color-body); }
  .path-link:hover,.resume-link:hover { color:var(--color-primary); }
  .resume-link { display:block; margin-top:22px; font-weight:600; line-height:1.6; }
  .why h2,.goals > h2 { font-size:clamp(1.6rem,3vw,2rem); }
  .why { margin:0 0 64px; }
  .why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; margin-top:28px; }
  .why-grid article { border-top:1px solid var(--color-border); padding-top:22px; }
  .why-grid h3 { margin:14px 0 6px; }
  .why-grid p { font-size:.9rem; }
  .goals .participant-card { box-shadow:none; }
  .cpns-goal { background:var(--color-blue-bg) !important; border-color:#c9deef !important; }
  .pppk-goal { background:#fff1ec !important; border-color:#efc9ba !important; }
  @media (max-width: 800px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 28px;
      margin-bottom: 48px;
    }
    .start-panel { padding:24px; }
    .why-grid { grid-template-columns:1fr; gap:18px; }
  }
  @media (max-width:500px) { .hero .actions { flex-direction:column; } .start-panel { padding:20px; } }
</style>
