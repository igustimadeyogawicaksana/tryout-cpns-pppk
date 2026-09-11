<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Ranking paket · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <h1>Ranking paket</h1>
  <p>
    Skor total tertinggi; nilai sama mendapat peringkat sama. Hanya peserta platform yang bersedia
    tampil. Maksimal 100 baris teratas.
  </p>
  <p>
    {data.count} peserta dinilai dan tampil · diperbarui {new Date(data.updatedAt).toISOString()}
  </p>
  <p>
    Ranking sementara. Penutupan: {new Date(data.cohort.endsAt).toISOString()}. Ini bukan peringkat
    seleksi resmi.
  </p>
  {#if data.mine}<p class="notice">
      Posisi saya: {data.mine.rank} · Skor {data.mine.total}/{data.mine.maximum}
    </p>{/if}
  {#if data.visible}<form method="POST" action="?/hide">
      <button class="button secondary">Sembunyikan saya dari ranking</button>
    </form>{:else}<p>Alias dan skor Anda tidak ditampilkan.</p>{/if}
  <ol class="board">
    {#each data.entries as entry}<li>
        <strong>#{entry.rank} {entry.alias}{entry.mine ? ' (Anda)' : ''}</strong><span
          >{entry.total} / {entry.maximum}</span
        >
      </li>{:else}<li>Belum ada hasil yang ditampilkan.</li>{/each}
  </ol>
  <a href="/dashboard">Kembali ke dashboard</a>
</ParticipantShell>

<style>
  .board {
    list-style: none;
    padding: 0;
  }
  .board li {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #dde4e9;
    overflow-wrap: anywhere;
  }
</style>
