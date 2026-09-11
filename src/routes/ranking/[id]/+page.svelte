<script lang="ts">
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Ranking paket · Ruang Tryout</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <h1>Ranking paket</h1>
  <p>
    Skor total tertinggi; nilai sama mendapat peringkat sama. Hanya peserta platform yang bersedia
    tampil. Daftar ditampilkan 20 peserta per halaman.
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
      {#if data.minePage !== data.page}<a href={'?page=' + data.minePage}>Buka halaman saya</a>{/if}
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
  <nav class="pagination" aria-label="Halaman ranking">
    {#if data.page > 1}<a class="button secondary" href={'?page=' + (data.page - 1)}>Sebelumnya</a
      >{/if}
    <span>Halaman {data.page} dari {data.pages}</span>
    {#if data.page < data.pages}<a class="button secondary" href={'?page=' + (data.page + 1)}
        >Berikutnya</a
      >{/if}
  </nav>
  <a href="/dashboard">Kembali ke dashboard</a>
</ParticipantShell>

<style>
  .pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin: 24px 0;
  }
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
