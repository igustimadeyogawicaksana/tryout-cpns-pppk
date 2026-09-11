<script lang="ts">
  import { page } from '$app/state';
  import { authClient } from '$lib/auth-client';
  import type { Snippet } from 'svelte';
  let {
    user,
    isAdmin = false,
    children
  }: { user: { name: string } | null; isAdmin?: boolean; children: Snippet } = $props();
  let signingOut = $state(false),
    message = $state('');
  async function logout() {
    signingOut = true;
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error();
      window.location.href = '/';
    } catch {
      message = 'Belum berhasil keluar. Coba lagi.';
      signingOut = false;
    }
  }
</script>

<div class="participant">
  <header class="site-header">
    <a class="site-brand" href="/" aria-label="Ruang Tryout beranda"
      ><span class="brand-mark">r.</span> ruang<span>tryout</span></a
    >
    <nav aria-label="Navigasi peserta">
      <a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}>Beranda</a>
      <a href="/paket" aria-current={page.url.pathname === '/paket' ? 'page' : undefined}
        >Paket tryout</a
      >
      {#if user}<a
          href="/dashboard"
          aria-current={page.url.pathname === '/dashboard' ? 'page' : undefined}>Dashboard</a
        ><a href="/profil" aria-current={page.url.pathname === '/profil' ? 'page' : undefined}
          >Profil</a
        >{/if}
    </nav>
    <div class="account-actions">
      {#if isAdmin}<a href="/admin/questions">Pengelola ↗</a>{/if}
      {#if user}<button onclick={logout} disabled={signingOut}
          >{signingOut ? 'Keluar…' : 'Keluar'}</button
        >
      {:else}<a class="button" href="/login">Masuk</a>{/if}
    </div>
  </header>
  {#if message}<p role="alert" class="notice error">{message}</p>{/if}
  <main id="main" class="site-main">{@render children()}</main>
  <footer class="site-footer">
    <strong>Ruang Tryout</strong><span
      >Latihan independen CPNS & PPPK. Tidak berafiliasi dengan BKN atau PANRB.</span
    ><a href="/paket">Jelajahi paket</a>
  </footer>
</div>

<style>
  .participant {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #f8faf9;
  }
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px max(20px, calc((100vw - 1160px) / 2));
    background: white;
    border-bottom: 1px solid #e0e7ed;
  }
  .site-brand {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 1.25rem;
    font-weight: 750;
    text-decoration: none;
  }
  .site-brand > span:last-child {
    font-weight: 400;
    margin-left: -6px;
  }
  nav,
  .account-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
  nav a,
  .account-actions > a:not(.button),
  .account-actions button {
    padding: 12px 4px;
    text-decoration: none;
    font-weight: 600;
    min-height: 44px;
  }
  nav a[aria-current] {
    color: #185ee3;
    box-shadow: inset 0 -2px #185ee3;
  }
  .account-actions button {
    border: 0;
    background: transparent;
    color: inherit;
  }
  .site-main {
    width: min(1160px, 100%);
    margin: 0 auto;
    padding: 48px 24px 72px;
    flex: 1;
    min-width: 0;
  }
  .site-footer {
    border-top: 1px solid #e0e7ed;
    padding: 28px max(24px, calc((100vw - 1112px) / 2));
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    font-size: 0.85rem;
    color: #516679;
  }
  .site-footer span {
    flex: 1;
    min-width: 180px;
  }
  :global(.participant h1) {
    font-size: clamp(2rem, 5.5vw, 4rem);
    line-height: 1.12;
    letter-spacing: -0.04em;
    margin: 16px 0 24px;
  }
  :global(.participant .cards) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    margin: 28px 0;
  }
  :global(.participant .participant-card) {
    border: 1px solid #dce5e8;
    border-radius: 18px;
    padding: 28px;
    background: white;
    min-width: 0;
  }
  :global(.participant p) {
    line-height: 1.7;
  }
  :global(.participant .participant-card h2) {
    margin-top: 12px;
  }
  :global(.participant a:focus-visible),
  :global(.participant button:focus-visible) {
    outline: 3px solid #185ee3;
    outline-offset: 4px;
  }
  @media (max-width: 700px) {
    .site-header {
      gap: 10px;
      padding: 14px 16px;
    }
    nav {
      order: 3;
      width: 100%;
      gap: 20px;
    }
    .site-main {
      padding: 28px 16px 48px;
    }
    :global(.participant .cards) {
      grid-template-columns: 1fr;
    }
    .site-footer {
      padding: 24px 16px;
    }
    .account-actions {
      gap: 8px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.participant *) {
      scroll-behavior: auto;
      transition: none;
    }
  }
</style>
