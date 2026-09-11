<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import ParticipantShell from '$lib/ParticipantShell.svelte';
  let { data, form } = $props();
  let index = $state(0),
    saving = $state(false),
    error = $state(''),
    saved = $state('Jawaban tersimpan dimuat dari server.');
  let answers = $state<Record<string, string>>(untrack(() => ({ ...data.attempt.answers }))),
    revision = $state(untrack(() => data.attempt.revision));
  let pending = $state<{ itemId: string; optionId: string | null } | null>(null);
  let remaining = $state(
    untrack(() => Math.max(0, Math.ceil((data.attempt.deadlineAt - data.serverNow) / 1000)))
  );
  let confirmSubmit = $state(false);
  const item = $derived(data.items[index]);
  onMount(() => {
    const start = performance.now();
    const seconds = Math.max(0, (data.attempt.deadlineAt - data.serverNow) / 1000);
    const timer = setInterval(() => {
      remaining = Math.max(0, Math.ceil(seconds - (performance.now() - start) / 1000));
      if (remaining === 0 && data.attempt.status === 'in_progress') {
        clearInterval(timer);
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(timer);
  });
  async function save(itemId: string, optionId: string | null) {
    saving = true;
    error = '';
    pending = { itemId, optionId };
    if (optionId === null) delete answers[itemId];
    else answers[itemId] = optionId;
    try {
      const response = await fetch('/ujian/' + data.attempt.id + '/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, optionId, revision })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan.');
      revision = result.revision;
      pending = null;
      saved = 'Jawaban tersimpan.';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Koneksi terputus. Jawaban belum tersimpan.';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head><title>{data.package.title} · Latihan</title></svelte:head>
<ParticipantShell user={data.user} isAdmin={data.isAdmin}>
  <a href="/dashboard">← Dashboard</a>
  <h1>{data.attempt.status === 'scored' ? 'Hasil latihan' : 'Ruang latihan'}</h1>
  <h2>{data.package.title}</h2>
  {#if form?.error}<p class="notice error">{form.error}</p>{/if}
  {#if data.attempt.status === 'scored'}
    <section class="participant-card">
      <h2>Skor {data.attempt.result?.total} / {data.attempt.result?.maximum}</h2>
      <p>
        {data.attempt.endedReason === 'deadline'
          ? 'Waktu habis. Jawaban terakhir yang tersimpan telah dinilai.'
          : 'Latihan telah diselesaikan.'}
      </p>
      <ul>
        {#each Object.entries(data.attempt.result?.subscores || {}) as [sub, value]}<li>
            {sub}: {value.score} / {value.maximum}
          </li>{/each}
      </ul>
      <p>Hasil latihan pribadi; bukan penetapan kelulusan seleksi atau ranking kompetitif.</p>
    </section>
    {#each data.items as q}<section class="participant-card result">
        <h3>{q.position + 1}. {q.prompt}</h3>
        <ul>
          {#each q.options as o}<li>
              {o.code}. {o.text} — {o.score} poin {data.attempt.answers[q.id] === o.id
                ? '(jawaban Anda)'
                : ''}
            </li>{/each}
        </ul>
        {#if !data.attempt.answers[q.id]}<p>Jawaban kosong: {q.blankScore} poin.</p>{/if}
        <h4>Pembahasan</h4>
        <p class="question-text">{q.explanation}</p>
      </section>{/each}
  {:else}
    <p class="notice">
      Sisa waktu <strong
        >{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</strong
      >
      · {Object.keys(answers).length}/{data.items.length} terjawab
    </p>
    <p role="status">{saving ? 'Menyimpan jawaban…' : saved}</p>
    {#if error}<p class="notice error" role="alert">
        {error}
        {#if pending}<button
            onclick={() => pending && save(pending.itemId, pending.optionId)}
            disabled={saving}>Coba simpan lagi</button
          >{/if}
        <a data-sveltekit-reload href={'/ujian/' + data.attempt.id}>Muat ulang jawaban server</a>
      </p>{/if}
    <nav class="numbers" aria-label="Nomor soal">
      {#each data.items as q, i}<button
          class:answered={Boolean(answers[q.id])}
          aria-current={index === i ? 'step' : undefined}
          disabled={saving || !!pending}
          onclick={() => (index = i)}>{i + 1}</button
        >{/each}
    </nav>
    {#if item}<section class="participant-card">
        <p>{item.subtest} · Soal {index + 1}/{data.items.length}</p>
        <h2 class="question-text">{item.prompt}</h2>
        <fieldset disabled={saving || !!pending || remaining === 0}>
          <legend>Pilih jawaban (tersimpan otomatis)</legend>{#each item.options as o}<label
              class="choice"
              ><input
                type="radio"
                name={item.id}
                checked={answers[item.id] === o.id}
                onchange={() => save(item.id, o.id)}
              /><span>{o.code}. {o.text}</span></label
            >{/each}<button class="button secondary" onclick={() => save(item.id, null)}
            >Kosongkan jawaban</button
          >
        </fieldset>
      </section>{/if}
    <div class="actions">
      <button
        class="button secondary"
        disabled={index === 0 || saving || !!pending}
        onclick={() => index--}>Sebelumnya</button
      ><button
        class="button secondary"
        disabled={index === data.items.length - 1 || saving || !!pending}
        onclick={() => index++}>Berikutnya</button
      >
    </div>
    <section class="participant-card result">
      <label class="choice"
        ><input type="checkbox" bind:checked={confirmSubmit} /><span
          >Saya sudah memeriksa jawaban dan ingin mengakhiri latihan.</span
        ></label
      >
      <form method="POST">
        <button class="button" disabled={!confirmSubmit || saving || !!pending}
          >Selesai dan lihat hasil</button
        >
      </form>
    </section>
  {/if}</ParticipantShell
>

<style>
  .numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 20px 0;
  }
  .numbers button {
    min-width: 44px;
    min-height: 44px;
    background: white;
    border: 1px solid #cad6df;
    border-radius: 8px;
  }
  .numbers button.answered {
    background: #d6f3e5;
  }
  .numbers button[aria-current] {
    outline: 3px solid #185ee3;
  }
  .choice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 0;
  }
  .choice input {
    width: auto;
    margin-top: 4px;
  }
  .question-text {
    white-space: pre-wrap;
    line-height: 1.6;
  }
  .actions,
  .result {
    margin-top: 24px;
  }
  fieldset {
    border: 0;
    padding: 0;
    min-width: 0;
  }
  .choice span {
    white-space: pre-wrap;
  }
</style>
