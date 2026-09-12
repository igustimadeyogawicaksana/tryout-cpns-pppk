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
      <div class="hero-stats" aria-label="Ringkasan latihan"><span><strong>110</strong> soal</span><span><strong>100</strong> menit</span><span><strong>Gratis</strong> untuk mencoba</span></div>
    </div>
    <aside class="product-visual" aria-label="Contoh tampilan soal">
      <div class="visual-orbit"></div><span class="float-check"><Icon name="check" size={20} /></span><span class="float-letter">A</span>
      <div class="question-mockup">
        <div class="mock-head"><span>Soal 18 dari 110</span><strong>82:14</strong></div>
        <div class="mock-line wide"></div><div class="mock-line"></div>
        <div class="mock-choice"><b>A</b><i></i></div><div class="mock-choice selected"><b>B</b><i></i></div><div class="mock-choice"><b>C</b><i></i></div>
        <div class="mock-progress"><span></span></div>
      </div>
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
  .hero-stats { display:flex; margin-top:30px; color:var(--color-body); font-size:.8rem; }
  .hero-stats span { padding:0 18px; border-right:1px solid var(--color-border); }
  .hero-stats span:first-child { padding-left:0; }
  .hero-stats span:last-child { border:0; }
  .hero-stats strong { display:block; color:var(--color-ink); font-size:1rem; }
  .product-visual { min-height:390px; position:relative; display:grid; place-items:center; }
  .visual-orbit { position:absolute; width:330px; height:330px; border-radius:50%; background:rgba(16,185,129,.14); }
  .question-mockup { width:min(350px,86%); background:white; border:1px solid var(--color-border-strong); border-radius:var(--radius-lg); padding:22px; box-shadow:var(--shadow-md); position:relative; transform:rotate(1.5deg); }
  .mock-head { display:flex; justify-content:space-between; color:var(--color-muted); font-size:.72rem; margin-bottom:24px; }
  .mock-head strong { color:var(--color-primary); }
  .mock-line { width:72%; height:7px; background:#e2e8f0; border-radius:99px; margin:9px 0; }
  .mock-line.wide { width:95%; }
  .mock-choice { display:flex; align-items:center; gap:12px; border:1px solid var(--color-border); border-radius:8px; padding:9px; margin-top:10px; }
  .mock-choice b { width:25px; height:25px; display:grid; place-items:center; border:1px solid var(--color-border-strong); border-radius:50%; font-size:.7rem; }
  .mock-choice i { height:6px; width:72%; background:#e2e8f0; border-radius:99px; }
  .mock-choice.selected { background:#eff6ff; border-color:var(--color-primary); }
  .mock-choice.selected b { background:var(--color-primary); border-color:var(--color-primary); color:white; }
  .mock-progress { height:6px; background:#e2e8f0; border-radius:99px; margin-top:20px; overflow:hidden; }
  .mock-progress span { display:block; width:42%; height:100%; background:var(--color-accent); }
  .float-check,.float-letter { position:absolute; z-index:2; display:grid; place-items:center; width:48px; height:48px; border-radius:50%; background:white; box-shadow:var(--shadow-md); }
  .float-check { color:var(--color-teal-fg); top:30px; right:20px; }
  .float-letter { color:var(--color-primary); font-weight:700; bottom:40px; left:18px; }
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
    .product-visual { min-height:340px; }
    .why-grid { grid-template-columns:1fr; gap:18px; }
  }
  @media (max-width:500px) { .hero-stats span { padding:0 10px; } .question-mockup { width:88%; } }
</style>
