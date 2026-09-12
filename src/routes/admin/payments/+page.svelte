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
    <p>Status: <strong>{row.payment.status}</strong> · Bukti: {row.proof ? 'diterima' : 'belum ada'}</p>
    {#if row.proof}<p>Pengirim: <strong>{row.proof.senderName}</strong> · Nominal Rp {row.proof.amountIdr.toLocaleString('id-ID')} · Dibayar {new Date(row.proof.paidAt).toLocaleString('id-ID')} · Referensi: {row.proof.reference}</p>{/if}
    {#if row.payment.status === 'review_required' && row.proof?.status === 'pending'}
      <form method="POST" action="?/review" class="actions">
        <input type="hidden" name="paymentId" value={row.payment.id} />
        <input name="note" placeholder="Catatan opsional" />
        <button class="button" name="approved" value="true">Setujui</button>
        <button class="button secondary" name="approved" value="false">Tolak</button>
      </form>
    {/if}
    {#if row.payment.status === 'succeeded' && row.proof?.status === 'approved'}
      <form method="POST" action="?/revoke" class="actions"><input type="hidden" name="paymentId" value={row.payment.id} /><input name="reason" minlength="5" maxlength="500" placeholder="Alasan pencabutan akses" required /><button class="button secondary">Cabut akses</button></form>
    {/if}
  </section>
{:else}<p>Belum ada pembayaran masuk.</p>{/each}
