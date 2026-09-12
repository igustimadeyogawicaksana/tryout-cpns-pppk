<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  import PasswordField from '$lib/PasswordField.svelte';
  import { enhance } from '$app/forms';
  import Icon from '$lib/Icon.svelte';
  let { data, form } = $props();
</script>

<svelte:head><title>Dashboard saya · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <p class="eyebrow">RUANG BELAJARMU</p>
  <h1>Halo, {data.name}.</h1>
  <p class="muted">Persiapan dimulai dari langkah yang terarah.</p>
  <div class="stats">
    <article><span class="icon-badge blue"><Icon name="clock" size={20} /></span><strong>{data.history.filter((entry) => entry.attempt.status === 'in_progress').length}</strong><small>Sesi berjalan</small></article>
    <article><span class="icon-badge teal"><Icon name="flame" size={20} /></span><strong>{data.history.length}</strong><small>Total latihan</small></article>
    <article><span class="icon-badge coral"><Icon name="award" size={20} /></span><strong>{data.history.find((entry) => entry.attempt.status === 'scored')?.attempt.result?.total ?? '—'}</strong><small>Skor terakhir</small></article>
  </div>
  {#if form?.passwordSuccess}<p class="notice success" role="status">{form.passwordSuccess}</p>{/if}
  {#if form?.passwordError}<p class="notice error" role="alert">{form.passwordError}</p>{/if}
  {#if !data.hasPassword}<section class="participant-card">
      <h2>Masuk juga dengan email dan password</h2>
      <p>
        Akun Anda belum memiliki password. Buat password untuk email akun ini; login Google tetap
        tersedia.
      </p>
      <form method="POST" action="?/setPassword" use:enhance class="stack">
        <PasswordField />
        <PasswordField label="Konfirmasi password" name="confirmation" />
        <p class="muted">Gunakan 12–128 karakter.</p>
        <button class="button">Buat password</button>
      </form>
    </section>{/if}
  {#if data.history.length}<section class="participant-card training-card">
      <h2 class="section-title"><Icon name="chart" size={22} />Latihan saya</h2>
      {#each data.history as entry}<div class="history-item">
          <div class="history-head"><strong>{entry.package.title}</strong><span class="status-pill">{entry.attempt.status === 'scored' ? 'Selesai' : 'Berjalan'}</span></div>
          {#if entry.attempt.status === 'scored'}<div class="progress" aria-label={`Skor ${entry.attempt.result?.total} dari ${entry.attempt.result?.maximum}`}><span style={`width:${Math.max(0, Math.min(100, ((entry.attempt.result?.total ?? 0) / (entry.attempt.result?.maximum || 1)) * 100))}%`}></span></div>{/if}
          <div class="history-foot"><span>{entry.attempt.status === 'scored' ? `Skor ${entry.attempt.result?.total} dari ${entry.attempt.result?.maximum}` : 'Jawaban tersimpan'}</span><a href={'/ujian/' + entry.attempt.id}>{entry.attempt.status === 'scored' ? 'Lihat hasil →' : 'Lanjutkan →'}</a></div>
        </div>{/each}
    </section>{/if}
  {#if !data.emailVerified && !data.isAdmin}<p class="notice">
      Verifikasi email sebelum mulai ujian. <a href="/login?mode=verify">Kirim tautan verifikasi</a>
    </p>{/if}
  <nav class="quick-grid" aria-label="Akses cepat">
    <a href="/paket"><Icon name="target" size={21} /><span>Paket tryout</span></a>
    <a href="#purchases"><Icon name="package" size={21} /><span>Pembelian saya</span></a>
    <a href="/profil"><Icon name="user" size={21} /><span>Profil saya</span></a>
  </nav>
  <section id="purchases" class="participant-card">
    <h2>Pembelian saya</h2>
    <p>Buka pesanan untuk melihat status, mengirim bukti, atau melanjutkan ke paket yang dibeli. Menampilkan hingga 50 pesanan terbaru.</p>
    {#each data.purchases as purchase}
      <div class="history-item">
        <div class="history-head"><strong>{purchase.title}</strong><span class="status-pill">{({ pending: 'Menunggu pembayaran', review_required: 'Perlu ditinjau', paid: 'Dibayar', expired: 'Kedaluwarsa', cancelled: 'Dibatalkan', refunded: 'Dikembalikan', partially_refunded: 'Dikembalikan sebagian' } as Record<string, string>)[purchase.status] ?? purchase.status}</span></div>
        <div class="history-foot"><span>Rp {purchase.amount.toLocaleString('id-ID')}</span><a href={'/pembayaran/' + purchase.id}>Buka pesanan &rarr;</a></div>
      </div>
    {:else}<p class="muted">Belum ada pembelian. Pilih paket untuk melihat pilihan yang tersedia.</p>{/each}
  </section>
  <div class="cards next-grid">
    <section class="participant-card next-card">
      <span class="icon-badge amber"><Icon name="package" size={20} /></span><div><h2>Pilih latihan berikutnya</h2><p>Jelajahi paket CPNS dan PPPK yang telah diterbitkan pengelola.</p></div><a class="button" href="/paket">Jelajahi paket</a>
    </section>
    {#if !data.history.length}<section class="participant-card">
        <span class="pill icon-pill"><Icon name="chart" size={15} />HASIL LATIHAN</span>
        <h2>Belum ada riwayat ujian</h2>
        <p>Setelah menyelesaikan latihan, hasil dan pembahasannya dapat dibuka dari halaman ini.</p>
      </section>{/if}
  </div>
  {#if data.isAdmin}<div class="notice">
      Anda masuk sebagai pengelola. <a href="/admin/questions">Buka bank soal →</a>
    </div>{/if}
</ParticipantShell>

<style>
  .section-title, .icon-pill { display: flex; align-items: center; gap: 9px; }
  .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin:30px 0; }
  .stats article { background:white; border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm); }
  .stats strong,.stats small { display:block; }
  .stats strong { font-size:1.4rem; margin:16px 0 3px; }
  .stats small { color:var(--color-muted); }
  .history-item { padding: 16px 0; border-bottom: 1px solid var(--color-border); color: var(--color-body); }
  .history-head,.history-foot { display:flex; justify-content:space-between; align-items:center; gap:14px; }
  .history-foot { margin-top:10px; font-size:.85rem; }
  .status-pill { padding:5px 9px; border-radius:999px; background:var(--color-teal-bg); color:var(--color-teal-fg); font-size:.72rem; font-weight:650; }
  .progress { height: 9px; margin-top: 12px; overflow: hidden; border-radius: 999px; background: #e2e8f0; }
  .progress span { display: block; height: 100%; border-radius: inherit; background: var(--color-accent); transition: width 350ms ease; }
  .quick-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin:24px 0; }
  .quick-grid a { display:grid; gap:11px; padding:18px; background:white; border:1px solid var(--color-border); border-radius:var(--radius-md); color:var(--color-body); }
  .quick-grid a:hover { border-color:var(--color-primary); color:var(--color-primary); }
  .next-grid { grid-template-columns:1fr !important; }
  .next-card { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:18px; }
  .next-card h2,.next-card p { margin:0; }
  .next-card p { margin-top:4px; }
  @media(max-width:650px){ .stats{grid-template-columns:1fr 1fr;} .quick-grid{grid-template-columns:1fr 1fr;} .next-card{grid-template-columns:auto 1fr;} .next-card .button{grid-column:1/-1;} }
</style>
