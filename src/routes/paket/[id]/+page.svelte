<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data, form } = $props();
</script>

<svelte:head><title>{data.package.title} · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}
  ><a href="/paket">← Semua paket</a>
  <p class="eyebrow">{data.package.examType} · LATIHAN GRATIS</p>
  <h1>{data.package.title}</h1>
  <section class="participant-card">
    <h2>{data.package.count} soal · {data.package.durationMinutes} menit</h2>
    <p>Target {data.package.targetYear}. {data.package.formation}</p>
    <p>{data.package.reference}</p>
    {#each data.package.products as product}
      <div class="notice"><strong>{product.title}</strong> · Rp {product.priceIdr.toLocaleString('id-ID')} · akses {product.accessDays} hari{#if data.user}<form method="POST" action="?/buy" style="margin-top:12px"><input type="hidden" name="productId" value={product.id} /><button class="button">Beli dan bayar manual</button></form>{:else}<p>Login untuk membeli.</p>{/if}</div>
    {/each}
    <ul>
      {#each Object.entries(data.package.quotas).filter(([, n]) => n > 0) as [sub, n]}<li>
          {sub}: {n} soal
        </li>{/each}
    </ul>
    <p>
      Setiap percobaan disimpan sebagai sesi terpisah. Sesi yang sedang berjalan dapat dilanjutkan;
      setelah selesai, tombol ini membuat sesi baru agar latihan bisa diulang. Waktu mulai berjalan
      setelah tombol ditekan. {data.cohort
        ? 'Pembahasan kompetisi tersedia setelah periode ditutup.'
        : 'Hasil dan pembahasan tersedia sesudah selesai; latihan ini tidak masuk ranking.'}
    </p>
    {#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
    <form method="POST">
      {#if data.cohort}
        <p>
          Kompetisi gratis ditutup {new Date(data.cohort.endsAt).toISOString()}. Sisa waktu hingga
          penutupan dapat lebih pendek dari durasi paket. Skor sama mendapat peringkat sama; ranking
          hanya peserta platform yang bersedia tampil.
        </p>
        <label
          >Alias publik<input
            name="alias"
            minlength="3"
            maxlength="30"
            placeholder="Contoh: Pelajar27"
            required
          /></label
        >
        <label
          ><input style="width:auto" type="checkbox" name="visible" /> Saya bersedia alias, skor dan provinsi
          saat mulai tampil dalam ranking paket ini.</label
        >
        <p>
          Jangan gunakan nama lengkap atau email. Atur provinsi di menu Profil sebelum mulai.
          Persetujuan bisa dicabut dari halaman ranking.
        </p>
        <a href={'/ranking/' + data.package.id}>Lihat ranking / sembunyikan alias</a>
      {/if}
      <button class="button"
        >{data.user ? 'Mulai / ulangi latihan' : 'Login untuk mengerjakan'}</button
      >
    </form>
  </section></ParticipantShell
>
