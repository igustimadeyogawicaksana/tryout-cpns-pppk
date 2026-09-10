<script lang="ts">
  import { authClient } from '$lib/auth-client';
  let { data } = $props();
  let email = $state(''),
    password = $state(''),
    error = $state(''),
    busy = $state(false);
  async function login(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    error = '';
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error)
        error =
          'Email atau password tidak cocok, atau percobaan masuk terlalu sering. Silakan coba kembali.';
      else window.location.href = '/account';
    } catch {
      error = 'Koneksi terganggu. Silakan coba kembali.';
    } finally {
      busy = false;
    }
  }
  async function googleLogin() {
    busy = true;
    error = '';
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/account',
        newUserCallbackURL: '/dashboard',
        errorCallbackURL: '/login?oauth_error=1'
      });
      if (result.error) error = 'Login Google belum berhasil.';
    } catch {
      error = 'Tidak dapat terhubung ke layanan login.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head
  ><title>Masuk · Ruang Tryout</title><meta
    name="description"
    content="Masuk ke akun Ruang Tryout CPNS dan PPPK."
  /></svelte:head
>
<main id="main" class="login-shell">
  <section class="login-story">
    <a class="brand" href="/"
      ><span class="brand-mark">r.</span><span>ruang<span class="brand-light">tryout</span></span
      ></a
    >
    <div>
      <p class="eyebrow">RUANG PERSIAPANMU</p>
      <h1>Langkah kecil.<br />Persiapan yang<br /><em>lebih berarti.</em></h1>
      <p>Masuk dan siapkan langkah belajar untuk tujuan seleksimu.</p>
    </div>
    <p class="story-foot">CPNS & PPPK <span>Persiapan · Edisi awal</span></p>
  </section>
  <section class="login-panel">
    <div class="login-card">
      <p class="eyebrow">SELAMAT DATANG KEMBALI</p>
      <h2>Masuk atau daftar</h2>
      <p class="muted">
        Gunakan Google untuk mulai belajar. Akun peserta dibuat saat pertama kali masuk.
      </p>
      {#if data.oauthError}<div class="notice error" role="alert">
          Proses Google belum selesai atau akses dibatalkan. Silakan coba lagi.
        </div>{/if}
      {#if error}<div class="notice error" role="alert">{error}</div>{/if}
      <button
        class="button secondary full"
        disabled={busy || !data.googleEnabled}
        onclick={googleLogin}>Lanjutkan dengan Google</button
      >
      {#if !data.googleEnabled}<p class="login-note">
          Pendaftaran Google belum diaktifkan oleh pengelola.
        </p>{/if}
      <details class="email-login">
        <summary>Masuk dengan email dan password yang sudah ada</summary>
        <form onsubmit={login} class="stack">
          <label
            >Email<input
              type="email"
              autocomplete="username"
              bind:value={email}
              required
              placeholder="nama@domain.id"
            /></label
          >
          <label
            >Password<input
              type="password"
              autocomplete="current-password"
              bind:value={password}
              required
            /></label
          >
          <button class="button" disabled={busy}
            >{busy ? 'Memeriksa akun…' : 'Masuk ke akun'}
            <span aria-hidden="true">↗</span></button
          >
        </form>
      </details>
      <p class="login-note">
        Pendaftaran peserta menggunakan Google. Login password tersedia untuk akun yang sudah
        disiapkan, termasuk pengelola.
      </p>
    </div>
  </section>
</main>

<style>
  .email-login {
    margin-top: 24px;
  }
  .email-login summary {
    cursor: pointer;
    padding: 12px 0;
    line-height: 1.5;
  }
  .email-login form {
    margin-top: 16px;
  }
</style>
