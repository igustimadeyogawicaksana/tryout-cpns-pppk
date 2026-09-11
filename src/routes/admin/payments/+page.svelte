<script lang="ts">
  let { data, form } = $props();
</script>
<svelte:head><title>Pembayaran · Admin</title></svelte:head>
<h1>Pembayaran manual</h1>
{#if form?.success}<p class="notice success">{form.success}</p>{/if}
{#each data.payments as row}
  <section class="participant-card">
    <h2>{row.order.productTitle}</h2>
    <p>{row.participant.email} · Rp {row.payment.amountIdr.toLocaleString('id-ID')}</p>
    <p>Status: <strong>{row.payment.status}</strong> · Bukti: {row.event?.payloadHash ? 'diterima' : 'belum ada'}</p>
    {#if row.payment.status === 'review_required'}
      <form method="POST" action="?/review" class="actions">
        <input type="hidden" name="paymentId" value={row.payment.id} />
        <input name="note" placeholder="Catatan opsional" />
        <button class="button" name="approved" value="true">Setujui</button>
        <button class="button secondary" name="approved" value="false">Tolak</button>
      </form>
    {/if}
  </section>
{:else}<p>Belum ada pembayaran masuk.</p>{/each}
