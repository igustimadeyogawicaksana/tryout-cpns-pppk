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
      else window.location.href = '/admin/questions';
    } catch {
      error = 'Koneksi terganggu. Silakan coba kembali.';
    } finally {
      busy = false;
    }
  }
  async function googleLogin() {
    busy = true;
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/admin/questions'
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
  ><title>Masuk pengelola · Ruang Tryout</title><meta
    name="description"
    content="Kelola bank soal dan pembahasan tryout CPNS dan PPPK."
  /></svelte:head
>
<main id="main" class="login-shell">
  <section class="login-story">
    <a class="brand" href="/"
      ><span class="brand-mark">r.</span><span>ruang<span class="brand-light">tryout</span></span
      ></a
    >
    <div>
      <p class="eyebrow">RUANG KERJA PENGELOLA</p>
      <h1>Soal yang baik.<br />Persiapan yang<br /><em>lebih berarti.</em></h1>
      <p>Susun soal, tinjau pembahasan, dan jaga kualitas setiap paket latihan.</p>
    </div>
    <p class="story-foot">CPNS & PPPK <span>Bank soal · Edisi awal</span></p>
  </section>
  <section class="login-panel">
    <div class="login-card">
      <p class="eyebrow">SELAMAT DATANG KEMBALI</p>
      <h2>Masuk ke ruang kerja</h2>
      <p class="muted">Gunakan akun pengelola yang sudah disiapkan.</p>
      {#if data.denied}<div class="notice error" role="alert">
          Akun ini belum memiliki akses pengelola. <button
            class="text-button"
            onclick={async () => {
              await authClient.signOut();
              window.location.reload();
            }}>Keluar dari akun</button
          >
        </div>{/if}
      {#if error}<div class="notice error" role="alert">{error}</div>{/if}
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
          >{busy ? 'Memeriksa akun…' : 'Masuk ke ruang kerja'}
          <span aria-hidden="true">↗</span></button
        >
      </form>
      {#if data.googleEnabled}<button
          class="button secondary full"
          disabled={busy}
          onclick={googleLogin}>Lanjutkan dengan Google</button
        >{/if}
      <p class="login-note">
        Akses khusus pengelola. Hubungi pemilik proyek jika belum memiliki akun.
      </p>
    </div>
  </section>
</main>
