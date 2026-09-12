<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import GoogleLogo from '$lib/GoogleLogo.svelte';
  import PasswordField from '$lib/PasswordField.svelte';
  import { tick } from 'svelte';
  import Icon from '$lib/Icon.svelte';
  let { data } = $props();
  let email = $state(''),
    password = $state(''),
    confirmation = $state(''),
    name = $state('');
  let error = $state(''),
    message = $state(''),
    busy = $state(false);
  const titles: Record<string, string> = {
    login: 'Masuk ke akun',
    register: 'Daftar dengan email',
    forgot: 'Lupa password',
    reset: 'Buat password baru',
    verify: 'Verifikasi email'
  };
  $effect(() => {
    data.mode;
    error = '';
    message = '';
    password = '';
    confirmation = '';
  });
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    message = '';
    if (['register', 'reset'].includes(data.mode) && password !== confirmation) {
      error = 'Konfirmasi password belum sama.';
      return;
    }
    busy = true;
    try {
      if (data.mode === 'login') {
        const result = await authClient.signIn.email({ email, password });
        if (result.error)
          error =
            result.error.status === 429
              ? 'Terlalu banyak percobaan. Tunggu satu menit lalu coba lagi.'
              : 'Email atau password belum cocok. Jika sebelumnya memakai Google, masuk dengan Google lalu pilih Buat password di dashboard. Jika lupa password, gunakan tautan pemulihan.';
        else window.location.href = '/account';
      } else if (data.mode === 'register') {
        const result = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: '/login'
        });
        if (result.error)
          error = 'Pendaftaran belum berhasil. Periksa data atau coba kembali nanti.';
        else {
          message =
            'Permintaan pendaftaran berhasil diproses. Untuk email baru, akun dan password sudah dibuat; silakan masuk. Jika email ini sudah terdaftar, password lama tetap berlaku. Akun Google perlu membuat password dari dashboard setelah masuk dengan Google.';
          password = '';
          confirmation = '';
        }
      } else if (data.mode === 'forgot') {
        await authClient.requestPasswordReset({ email, redirectTo: '/login?mode=reset' });
        message =
          'Jika akun tersedia, instruksi pengaturan password akan dikirim. Periksa kotak masuk Anda.';
      } else if (data.mode === 'verify') {
        await authClient.sendVerificationEmail({ email, callbackURL: '/login' });
        message =
          'Jika akun memerlukan verifikasi, tautannya akan dikirim. Periksa kotak masuk Anda.';
      } else {
        const result = await authClient.resetPassword({ newPassword: password, token: data.token });
        if (result.error)
          error = 'Tautan tidak valid atau kedaluwarsa. Minta tautan baru melalui Lupa password.';
        else {
          message = 'Password berhasil diubah. Silakan masuk kembali.';
          password = '';
          confirmation = '';
        }
      }
    } catch {
      error = 'Koneksi terganggu atau email belum dapat dikirim. Coba kembali nanti.';
    } finally {
      busy = false;
      await tick();
      document
        .getElementById('auth-feedback')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      error = 'Tidak dapat terhubung ke Google.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>{titles[data.mode]} · Ruang Tryout</title></svelte:head>
<main id="main" class="login-shell">
  <section class="login-story">
    <a class="brand" href="/"
      ><span class="brand-mark">r.</span><span>ruang<span class="brand-light">tryout</span></span
      ></a
    >
    <div>
      <p class="eyebrow">RUANG PERSIAPANMU</p>
      <h1>Langkah kecil.<br />Persiapan yang<br /><em>lebih berarti.</em></h1>
      <p>Satu akun untuk menyiapkan langkah belajar CPNS dan PPPK.</p>
      <ul class="trust-list"><li><Icon name="check" size={17} />Paket tersusun dan ditinjau</li><li><Icon name="check" size={17} />Progres tersimpan di akun</li><li><Icon name="check" size={17} />Tampilan ujian yang terarah</li></ul>
    </div>
    <p class="story-foot">CPNS & PPPK <span>Persiapan · Edisi awal</span></p>
  </section>
  <section class="login-panel">
    <div class="login-card">
      <p class="eyebrow">SELAMAT DATANG</p>
      <h2>{titles[data.mode]}</h2>
      {#if data.oauthError || data.invalidLink}<p class="notice error" role="alert">
          Tautan atau proses login belum berhasil. Silakan coba lagi.
        </p>{/if}
      {#if error}<p id="auth-feedback" class="notice error" role="alert">{error}</p>{/if}
      {#if message}<div id="auth-feedback" class="notice success" role="status">
          <p>{message}</p>
          {#if data.mode === 'register' || data.mode === 'reset'}<a class="button" href="/login"
              >Lanjut ke login</a
            >{/if}
        </div>{/if}
      {#if ['login', 'register'].includes(data.mode)}
        <button
          class="button secondary full google"
          disabled={busy || !data.googleEnabled}
          onclick={googleLogin}><GoogleLogo />Lanjutkan dengan Google</button
        >
        {#if !data.googleEnabled}<p class="login-note">Login Google belum diaktifkan.</p>{/if}
        <p class="divider">atau gunakan email</p>
      {/if}
      {#if data.mode !== 'login' && !data.mailEnabled}<p class="notice">
          Layanan email belum diaktifkan oleh pengelola.
        </p>{/if}
      {#if data.mode !== 'login' && data.localMail}<p class="notice info-notice">
          <Icon name="info" size={19} /> <span>Mode pengujian lokal: email belum dikirim ke kotak masuk. Akun baru tetap bisa login;
          verifikasi diperlukan sebelum mulai ujian.
          </span></p>{/if}
      <form onsubmit={submit} class="stack">
        {#if data.mode === 'register'}<label
            >Nama<input autocomplete="name" bind:value={name} required maxlength="100" /></label
          >{/if}
        {#if data.mode !== 'reset'}<label
            >Email<input
              type="email"
              autocomplete="username"
              bind:value={email}
              required
              maxlength="254"
            /></label
          >{/if}
        {#if ['login', 'register', 'reset'].includes(data.mode)}
          <PasswordField
            bind:value={password}
            autocomplete={data.mode === 'login' ? 'current-password' : 'new-password'}
            minlength={data.mode === 'login' ? 1 : 12}
          />
        {/if}
        {#if ['register', 'reset'].includes(data.mode)}
          <p class="muted">Gunakan 12–128 karakter.</p>
          <PasswordField
            bind:value={confirmation}
            label="Konfirmasi password"
            name="confirmation"
          />
        {/if}
        <button
          class="button"
          disabled={busy ||
            (data.mode !== 'login' && !data.mailEnabled) ||
            (data.mode === 'reset' && !data.token)}
          >{busy
            ? 'Memproses…'
            : data.mode === 'login'
              ? 'Masuk'
              : data.mode === 'register'
                ? 'Buat akun peserta'
                : data.mode === 'reset'
                  ? 'Simpan password'
                  : 'Kirim tautan'}</button
        >
      </form>
      <nav class="auth-links" aria-label="Pilihan akun">
        {#if data.mode === 'login'}<a href="/login?mode=register">Belum punya akun? Daftar</a><a
            href="/login?mode=forgot">Lupa password?</a
          >
        {:else}<a href="/login">Kembali ke login</a>{/if}
        {#if data.mode !== 'verify'}<a href="/login?mode=verify">Kirim ulang verifikasi email</a
          >{/if}
      </nav>
    </div>
  </section>
</main>

<style>
  .google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: white;
    color: #1f1f1f;
    font-family: Arial, sans-serif;
  }
  .divider {
    text-align: center;
    color: #667789;
    margin: 24px 0;
  }
  .auth-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin-top: 20px;
  }
  .auth-links a {
    padding: 8px 0;
    font-size: 0.9rem;
    min-height: 44px;
  }
  .trust-list { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 12px; color: #dbeafe; font-size: .9rem; }
  .trust-list li { display: flex; align-items: center; gap: 10px; }
  .trust-list :global(svg) { color: #6ee7b7; }
  .info-notice { display: flex; align-items: flex-start; gap: 10px; }
  .info-notice :global(svg) { flex: 0 0 auto; margin-top: 3px; color: var(--color-primary); }
</style>
