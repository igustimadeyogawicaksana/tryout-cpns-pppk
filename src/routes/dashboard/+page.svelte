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
  {#if data.history.length}<section class="participant-card">
      <h2 class="section-title"><Icon name="chart" size={22} />Latihan saya</h2>
      {#each data.history as entry}<div class="history-item">
          <strong>{entry.package.title}</strong> · {entry.attempt.status === 'scored'
            ? `Skor ${entry.attempt.result?.total} / ${entry.attempt.result?.maximum}`
            : 'Sedang dikerjakan'} ·
          <a href={'/ujian/' + entry.attempt.id}
            >{entry.attempt.status === 'scored' ? 'Lihat hasil' : 'Lanjutkan'}</a
          >
          {#if entry.attempt.status === 'scored'}<div class="progress" aria-label={`Skor ${entry.attempt.result?.total} dari ${entry.attempt.result?.maximum}`}><span style={`width:${Math.max(0, Math.min(100, ((entry.attempt.result?.total ?? 0) / (entry.attempt.result?.maximum || 1)) * 100))}%`}></span></div>{/if}
        </div>{/each}
    </section>{/if}
  {#if !data.emailVerified && !data.isAdmin}<p class="notice">
      Verifikasi email sebelum mulai ujian. <a href="/login?mode=verify">Kirim tautan verifikasi</a>
    </p>{/if}
  <div class="cards">
    <section class="participant-card">
      <span class="pill icon-pill"><Icon name="package" size={15} />PAKET SAYA</span>
      <h2>Pilih latihan berikutnya</h2>
      <p>Jelajahi paket CPNS dan PPPK yang telah diterbitkan pengelola.</p>
      <a class="button" href="/paket">Jelajahi paket</a>
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
  .history-item { padding: 16px 0; border-bottom: 1px solid var(--color-border); color: var(--color-body); }
  .progress { height: 9px; margin-top: 12px; overflow: hidden; border-radius: 999px; background: #e2e8f0; }
  .progress span { display: block; height: 100%; border-radius: inherit; background: var(--gradient-accent); transition: width 350ms ease; }
</style>
