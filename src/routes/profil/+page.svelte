<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  import { provinces } from '$lib/provinces';
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<svelte:head><title>Profil saya · Ruang Tryout</title></svelte:head>
<ParticipantShell
  user={data.user ? { ...data.user, name: data.profile.name } : null}
  isAdmin={data.isAdmin}
>
  <h1>Profil saya</h1>
  {#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}
  {#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
  <form method="POST" use:enhance class="participant-card stack">
    <label
      >Nama tampilan<input
        name="name"
        value={data.profile.name}
        required
        minlength="2"
        maxlength="100"
        autocomplete="name"
      /></label
    >
    <label
      >Provinsi domisili (opsional)<select name="province" value={data.profile.province}
        ><option value="">Tidak diisi</option>{#each provinces as p}<option value={p.id}
            >{p.name}</option
          >{/each}</select
      ></label
    >
    <p>
      Provinsi adalah keterangan dari Anda, tanpa pemeriksaan lokasi. Provinsi disimpan saat mulai
      kompetisi dan tidak berubah pada sesi tersebut. Tanpa provinsi, Anda tetap dapat mengikuti
      ranking umum.
    </p>
    <p>
      Nama profil bukan alias publik ranking. Persetujuan menampilkan alias, skor dan provinsi
      dipilih sebelum mulai kompetisi.
    </p>
    <button class="button">Simpan profil</button>
  </form>
</ParticipantShell>
