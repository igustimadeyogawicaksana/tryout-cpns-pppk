<script lang="ts">
  import { authClient } from '$lib/auth-client';
  import { page } from '$app/state';
  let { data, children } = $props();
</script>

<div class="workspace">
  <aside class="sidebar">
    <a class="brand" href="/admin/questions"
      ><span class="brand-mark">r.</span><span>ruang<span class="brand-light">tryout</span></span
      ></a
    >
    <p class="nav-caption">RUANG PENGELOLA</p>
    <nav aria-label="Navigasi utama">
      <a class:nav-active={page.url.pathname.startsWith('/admin/packages')} href="/admin/packages"
        >Paket tryout</a
      >
      <a class:nav-active={page.url.pathname.startsWith('/admin/payments')} href="/admin/payments"
        >Pembayaran</a
      >
      <a class:nav-active={page.url.pathname.startsWith('/admin/products')} href="/admin/products"
        >Produk</a
      >
      <a class:nav-active={page.url.pathname.startsWith('/admin/questions')} href="/admin/questions"
        ><span aria-hidden="true">▤</span> Bank soal
        <span class="nav-arrow" aria-hidden="true">↗</span></a
      >
    </nav>
    <div class="sidebar-note">
      <span class="pill subtle">MVP · Tahap 1</span>
      <p>Bangun bank soal yang siap ditinjau.</p>
      <small>Susun soal terbit menjadi paket latihan. Ranking menyusul.</small>
    </div>
    <div class="sidebar-account">
      <span class="avatar">{data.user?.name?.slice(0, 1) || 'P'}</span>
      <div><strong>{data.user?.name}</strong><small>Pengelola</small></div>
      <button
        class="text-button"
        aria-label="Keluar"
        onclick={async () => {
          await authClient.signOut();
          window.location.href = '/login';
        }}>Keluar</button
      >
    </div>
  </aside>
  <div class="workspace-body">
    <header class="topbar">
      <span
        >Konten / <strong
          >{page.url.pathname.startsWith('/admin/packages') ? 'Paket tryout' : 'Bank soal'}</strong
        ></span
      ><span class="topbar-meta">CPNS & PPPK</span>
    </header>
    <main id="main" class="main-content">{@render children()}</main>
    <footer class="workspace-footer">Ruang Tryout <span>Simulasi latihan independen</span></footer>
  </div>
</div>
