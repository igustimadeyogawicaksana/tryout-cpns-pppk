<script lang="ts">
  let { data, form } = $props();
</script>
<svelte:head><title>Produk · Admin</title></svelte:head>
<h1>Produk berbayar</h1>
<p class="muted">Buat produk dan hubungkan ke paket terbit untuk menerima pembayaran manual.</p>
{#if form?.success}<p class="notice success">{form.success}</p>{/if}
{#if form?.error}<p class="notice error">{form.error}</p>{/if}
<section class="participant-card">
  <h2>Tambah produk</h2>
  <form method="POST" action="?/create" class="stack">
    <label>Nama produk<input name="title" placeholder="Tryout SKD CPNS" required /></label>
    <label>Harga (rupiah)<input name="priceIdr" type="number" min="0" step="1000" required /></label>
    <label>Masa akses (hari)<input name="accessDays" type="number" min="1" max="3650" value="30" required /></label>
    <label>Paket tryout<select name="packageId" required><option value="">Pilih paket</option>{#each data.packages as p}<option value={p.id}>{p.title}</option>{/each}</select></label>
    <button class="button">Buat produk aktif</button>
  </form>
</section>
{#each data.products as product}
  <section class="participant-card"><h2>{product.title}</h2><p>Rp {product.priceIdr.toLocaleString('id-ID')} · {product.accessDays} hari · {product.active ? 'Aktif' : 'Nonaktif'}</p></section>
{:else}<p>Belum ada produk.</p>{/each}
