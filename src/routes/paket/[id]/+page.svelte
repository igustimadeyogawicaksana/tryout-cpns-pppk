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
    <ul>
      {#each Object.entries(data.package.quotas).filter(([, n]) => n > 0) as [sub, n]}<li>
          {sub}: {n} soal
        </li>{/each}
    </ul>
    <p>
      Satu sesi per akun untuk edisi ini. Sesi dapat dilanjutkan dengan waktu yang tersisa. Waktu
      mulai berjalan setelah tombol ditekan; hasil dan pembahasan tersedia sesudah selesai. Latihan
      ini belum masuk ranking kompetitif.
    </p>
    {#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
    <form method="POST">
      <button class="button"
        >{data.user ? 'Mulai / lanjutkan latihan' : 'Login untuk mengerjakan'}</button
      >
    </form>
  </section></ParticipantShell
>
