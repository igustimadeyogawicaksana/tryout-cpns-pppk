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
      <p>Hasil pada platform ini bukan penetapan kelulusan seleksi resmi.</p>
    </section>
    {#if !data.reviewAvailable}<p class="notice">
        {data.paid && !data.accessActive
          ? 'Masa akses paket sudah berakhir atau dicabut. Ringkasan hasil tetap tersedia; aktifkan akses untuk membuka pembahasan.'
          : 'Pembahasan dan nilai pilihan akan tersedia setelah periode kompetisi ditutup.'}
      </p>{/if}
    {#if data.competitive}<a href={'/ranking/' + data.package.id}
        >Lihat ranking / pengaturan tampil</a
      >{:else}<a class="button" href={'/paket/' + data.package.id}>Ulangi latihan</a>{/if}
    {#if data.reviewAvailable}{#each data.items as q}<section class="participant-card result">
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
        </section>{/each}{/if}
  {:else}
    <section class="exam-shell" aria-label="Ruang ujian">
      <header class="exam-topbar">
        <div><span class="exam-kicker">TRYOUT CPNS</span><strong>{data.package.title}</strong></div>
        <div class="exam-status"><span role="status">{saving ? 'Menyimpan…' : saved}</span><strong class:warning={remaining < 60} class="exam-timer" aria-label="Sisa waktu">
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </strong></div>
      </header>
      <div class="exam-layout">
        <section class="exam-question-panel">
          <div class="exam-question-meta"><span>{item?.subtest} · Soal {index + 1} dari {data.items.length}</span><span>{Object.keys(answers).length} terjawab</span></div>
          {#if error}<p class="notice error" role="alert">
            {error}
            {#if pending}<button onclick={() => pending && save(pending.itemId, pending.optionId)} disabled={saving}>Coba simpan lagi</button>{/if}
            <a data-sveltekit-reload href={'/ujian/' + data.attempt.id}>Muat ulang jawaban server</a>
          </p>{/if}
          {#if item}<h2 class="question-text">{item.prompt}</h2>
            <fieldset disabled={saving || !!pending || remaining === 0}>
              <legend>Pilih salah satu jawaban</legend>
              {#each item.options as o}<label class="choice cat-choice">
                <input type="radio" name={item.id} checked={answers[item.id] === o.id} onchange={() => save(item.id, o.id)} />
                <span class="choice-code">{o.code}</span><span>{o.text}</span>
              </label>{/each}
              <button class="button secondary clear-choice" onclick={() => save(item.id, null)}>Kosongkan jawaban</button>
            </fieldset>{/if}
          <div class="exam-actions">
            <button class="button secondary" disabled={index === 0 || saving || !!pending} onclick={() => index--}>← Sebelumnya</button>
            <button class="button" disabled={index === data.items.length - 1 || saving || !!pending} onclick={() => index++}>Berikutnya →</button>
          </div>
        </section>
        <aside class="exam-nav-panel" aria-label="Navigasi soal">
          <h3>Navigasi soal</h3>
          <p class="exam-nav-help">Hijau berarti sudah dijawab. Pilih nomor untuk berpindah.</p>
          <nav class="numbers" aria-label="Nomor soal">
            {#each data.items as q, i}<button class:answered={Boolean(answers[q.id])} aria-current={index === i ? 'step' : undefined} disabled={saving || !!pending} onclick={() => (index = i)}>{i + 1}</button>{/each}
          </nav>
          <div class="exam-legend"><span class="legend-dot answered-dot"></span>Terjawab <span class="legend-dot"></span>Belum dijawab</div>
          <div class="exam-progress"><span>Progress</span><strong>{Object.keys(answers).length}/{data.items.length}</strong><div><i style={`width:${(Object.keys(answers).length / data.items.length) * 100}%`}></i></div></div>
          <label class="submit-check"><input type="checkbox" bind:checked={confirmSubmit} /> Saya sudah memeriksa jawaban.</label>
          <form method="POST"><button class="button full" disabled={!confirmSubmit || saving || !!pending}>Selesai dan lihat hasil</button></form>
        </aside>
      </div>
    </section>
  {/if}</ParticipantShell
>

<style>
  .numbers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 18px 0;
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
  .exam-shell { margin-top: 18px; }
  .exam-topbar { display:flex; justify-content:space-between; align-items:center; gap:18px; background:#102b46; color:white; padding:18px 22px; border-radius:12px 12px 0 0; }
  .exam-topbar strong { display:block; margin-top:4px; font-size:1.05rem; }
  .exam-kicker { color:#a9dfca; font-size:.72rem; letter-spacing:.12em; font-weight:700; }
  .exam-status { display:flex; align-items:center; gap:18px; color:#d9e6ef; font-size:.82rem; }
  .exam-timer { color:white; background:#25435d; border:1px solid #6c879d; border-radius:7px; padding:9px 14px; font-variant-numeric:tabular-nums; font-size:1.15rem; }
  .exam-timer.warning { background:#9b3b32; }
  .exam-layout { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:18px; background:#eef3f6; padding:18px; border-radius:0 0 12px 12px; }
  .exam-question-panel, .exam-nav-panel { background:white; border:1px solid #dce5e8; border-radius:10px; padding:24px; }
  .exam-question-meta { display:flex; justify-content:space-between; gap:10px; color:#5c7082; font-size:.84rem; border-bottom:1px solid #e0e7ed; padding-bottom:16px; }
  .exam-question-panel .question-text { font-size:1.2rem; margin:24px 0; }
  .cat-choice { border:1px solid #dce5e8; border-radius:8px; margin:10px 0; padding:13px 14px; align-items:center; cursor:pointer; transition:border-color 150ms ease, box-shadow 150ms ease, background 150ms ease; }
  .cat-choice:hover { border-color:#93c5fd; box-shadow:var(--shadow-sm); }
  .cat-choice:has(input:checked) { border-color:var(--color-primary); background:#eff6ff; box-shadow:0 0 0 1px var(--color-primary); }
  .choice-code { display:grid; place-items:center; width:28px; height:28px; border:1px solid #9fb2c1; border-radius:50%; font-weight:700; color:#35536b; flex:0 0 auto; }
  .cat-choice input { position:absolute; width:1px; height:1px; min-height:0; opacity:0; pointer-events:none; }
  .cat-choice:has(input:focus-visible) { outline:3px solid #93c5fd; outline-offset:2px; }
  .cat-choice input:checked + .choice-code { background:var(--color-primary); color:white; border-color:var(--color-primary); }
  .clear-choice { margin-top:8px; }
  .exam-actions { display:flex; justify-content:space-between; gap:12px; margin-top:26px; padding-top:18px; border-top:1px solid #e0e7ed; }
  .exam-nav-panel h3 { margin:0 0 8px; }
  .exam-nav-help { color:#5c7082; font-size:.84rem; line-height:1.5; }
  .exam-nav-panel .numbers button { min-width:38px; min-height:38px; }
  .exam-legend { display:flex; align-items:center; flex-wrap:wrap; gap:6px; color:#5c7082; font-size:.76rem; }
  .legend-dot { width:10px; height:10px; border-radius:50%; background:#dce5e8; display:inline-block; margin-left:6px; }
  .answered-dot { background:#d6f3e5; }
  .exam-progress { margin:24px 0; color:#5c7082; font-size:.82rem; }
  .exam-progress strong { float:right; color:#18324b; }
  .exam-progress div { clear:both; height:8px; background:#e7edf1; border-radius:99px; overflow:hidden; margin-top:8px; }
  .exam-progress i { display:block; height:100%; background:#2e9b71; border-radius:99px; }
  .submit-check { display:flex; gap:8px; align-items:flex-start; font-size:.84rem; margin-bottom:14px; }
  .submit-check input { width:auto; min-height:auto; margin-top:3px; }
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
  @media (max-width: 760px) {
    .exam-layout { grid-template-columns:1fr; padding:10px; }
    .exam-nav-panel { order:-1; }
    .exam-topbar { align-items:flex-start; flex-direction:column; padding:16px; }
    .exam-status { width:100%; justify-content:space-between; }
    .exam-question-panel, .exam-nav-panel { padding:18px; }
  }
</style>
