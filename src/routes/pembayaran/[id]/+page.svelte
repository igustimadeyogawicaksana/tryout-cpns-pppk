<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<svelte:head><title>Pembayaran {data.order.productTitle} · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <a href="/dashboard">← Dashboard</a>
  <p class="eyebrow">PEMBAYARAN MANUAL</p>
  <h1>{data.order.productTitle}</h1>
  <section class="participant-card">
    <p>Nomor pesanan: <strong>{data.order.id}</strong></p>
    <h2>Rp {data.order.amountIdr.toLocaleString('id-ID')}</h2>
    <p>Status: <strong>{data.order.status}</strong></p>
    <hr />
    <h3>{data.instructions.name}</h3>
    <p>{data.instructions.bank}</p>
    <p><strong>{data.instructions.account}</strong>{data.instructions.holder ? ` · ${data.instructions.holder}` : ''}</p>
    <p class="muted">Bayar sesuai nominal pesanan, lalu masukkan referensi transaksi atau nama pengirim di bawah. Akses dibuka setelah verifikasi pengelola.</p>
    {#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}
    {#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
    {#if data.order.status === 'pending' || data.order.status === 'review_required'}
      <form method="POST" action="?/proof" use:enhance class="stack">
        <label>Referensi bukti pembayaran<input name="reference" minlength="3" maxlength="200" placeholder="Contoh: BCA 123456 / nama pengirim" required /></label>
        <button class="button">Kirim bukti pembayaran</button>
      </form>
    {:else if data.order.status === 'paid'}
      <p class="notice success">Pembayaran disetujui. Paket sudah dapat digunakan.</p>
    {/if}
  </section>
</ParticipantShell>
