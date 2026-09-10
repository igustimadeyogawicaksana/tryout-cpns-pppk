<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head><title>Halaman tidak tersedia · Ruang Tryout</title></svelte:head>
<main id="main" class="error-page">
  <p class="eyebrow">RUANG TRYOUT / {page.status}</p>
  <h1>Halaman belum bisa dibuka.</h1>
  <p>{page.error?.message}</p>
  <a class="button" href="/">Kembali ke beranda</a>
</main>
