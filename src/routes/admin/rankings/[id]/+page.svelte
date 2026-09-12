<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
</script>

<svelte:head><title>Audit ranking · Ruang Tryout</title></svelte:head>
<div class="page-heading">
  <div>
    <p class="eyebrow">KOREKSI HASIL</p>
    <h1>Audit ranking.</h1>
    <p class="muted">Aturan {data.cohort.policy} · ditutup {new Date(data.cohort.endsAt).toLocaleString('id-ID')}</p>
  </div>
  <a class="button secondary" href={'/ranking/' + data.cohort.packageId}>Lihat ranking</a>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

<section class="panel form-panel">
  <h2>Hasil peserta</h2>
  <p>Setiap koreksi wajib memiliki alasan. Nilai lama disimpan dan ranking final dibuat sebagai generasi baru.</p>
  {#each data.attempts as row}
    <details class="result-row">
      <summary><strong>{row.member.alias}</strong> · {row.participant.email} · {row.attempt.result?.total}/{row.attempt.result?.maximum} · revisi {row.attempt.resultRevision}</summary>
      {#if row.attempt.result}
        <form method="POST" action="?/correct" use:enhance class="stack">
          <input type="hidden" name="attemptId" value={row.attempt.id} />
          <input type="hidden" name="resultRevision" value={row.attempt.resultRevision} />
          <div class="field-grid">
            {#each Object.entries(row.attempt.result.subscores) as [code, score]}
              <label>{code}<input name={'score_' + code} type="number" min="0" max={score.maximum} value={score.score} required /> <small>Maksimum {score.maximum}</small></label>
            {/each}
          </div>
          <label>Alasan koreksi<textarea name="reason" minlength="10" maxlength="500" required placeholder="Contoh: Kunci soal TIU nomor 12 dibatalkan setelah audit."></textarea></label>
          <button class="button">Simpan koreksi & buat generasi baru</button>
        </form>
      {/if}
    </details>
  {:else}<p>Belum ada hasil peserta yang dapat dikoreksi.</p>{/each}
</section>

<section class="panel form-panel history">
  <h2>Generasi ranking</h2>
  {#each data.snapshots as snapshot}
    <p><strong>Generasi {snapshot.generation}</strong> · {snapshot.policy} · {snapshot.reason} · {new Date(snapshot.generatedAt).toLocaleString('id-ID')}</p>
  {:else}<p>Snapshot pertama dibuat saat ranking dibuka setelah penutupan.</p>{/each}
</section>

<section class="panel form-panel history">
  <h2>Riwayat koreksi</h2>
  {#each data.corrections as item}
    <article>
      <strong>Revisi {item.fromRevision} → {item.toRevision}</strong>
      <span>{item.policy} · {new Date(item.createdAt).toLocaleString('id-ID')}</span>
      <p>{item.reason}</p>
      <small>Nilai {item.previousResult.total}/{item.previousResult.maximum} menjadi {item.correctedResult.total}/{item.correctedResult.maximum}</small>
    </article>
  {:else}<p>Belum ada koreksi.</p>{/each}
</section>

<style>
  section + section { margin-top: 24px; }
  .result-row { padding: 16px 0; border-bottom: 1px solid #dde4e9; }
  .result-row summary { cursor: pointer; overflow-wrap: anywhere; }
  .result-row form { margin-top: 18px; }
  .history article { padding: 16px 0; border-bottom: 1px solid #dde4e9; }
  .history span { display: block; color: #607080; margin-top: 4px; }
</style>
