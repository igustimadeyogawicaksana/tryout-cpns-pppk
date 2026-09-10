<script lang="ts">
  import { enhance } from '$app/forms';
  import QuestionForm from '$lib/QuestionForm.svelte';
  import { statusLabels } from '$lib/question-input';
  let { data, form } = $props();
</script>

<svelte:head><title>{data.row.content.external_key} · Ruang Tryout</title></svelte:head>
<a class="back-link" href="/admin/questions">← Bank soal</a>
<div class="page-heading">
  <div>
    <p class="eyebrow">{data.row.content.external_key} / VERSI {data.row.version}</p>
    <h1>
      {data.row.status === 'draft' ? 'Sempurnakan soal' : 'Tinjau soal'}<span class="accent-dot"
        >.</span
      >
    </h1>
  </div>
  <span class={'pill status-' + data.row.status}>{statusLabels[data.row.status]}</span>
</div>
{#if form?.success}<div class="notice success" role="status">{form.success}</div>{/if}
{#if form?.error}<div class="notice error" role="alert">{form.error}</div>{/if}
<div class="workflow panel">
  <div>
    <strong>Alur penerbitan</strong>
    <p class="muted">Draft → Review → Disetujui → Terbit</p>
  </div>
  <div class="workflow-actions">
    {#if data.row.status === 'draft'}<form method="POST" action="?/transition" use:enhance>
        <input type="hidden" name="revision" value={data.row.revision} /><input
          type="hidden"
          name="next"
          value="in_review"
        /><button class="button secondary" disabled={data.issues.length > 0}>Ajukan review</button>
      </form>
    {:else if data.row.status === 'in_review'}<form
        method="POST"
        action="?/transition"
        use:enhance
        class="stack"
      >
        <input type="hidden" name="revision" value={data.row.revision} /><input
          type="hidden"
          name="next"
          value="approved"
        /><label class="checkbox"
          ><input type="checkbox" name="checked" required /> Isi, bobot, bahasa dan hak penggunaan telah
          diperiksa.</label
        ><button class="button">Setujui soal</button>
      </form>
    {:else if data.row.status === 'approved'}<form method="POST" action="?/transition" use:enhance>
        <input type="hidden" name="revision" value={data.row.revision} /><input
          type="hidden"
          name="next"
          value="published"
        /><button class="button">Terbitkan versi {data.row.version}</button>
      </form>{/if}
  </div>
</div>
{#if data.row.status === 'draft' && data.issues.length}<details class="notice">
    <summary>{data.issues.length} hal perlu dilengkapi sebelum review</summary>
    <ul>
      {#each data.issues as issue}<li>{issue}</li>{/each}
    </ul>
  </details>{/if}
{#if data.row.status === 'draft'}<QuestionForm
    initial={data.row.content}
    revision={data.row.revision}
    existing
  />
{:else}<div class="editor-grid">
    <section class="panel form-panel">
      <p class="section-number">PREVIEW PENGELOLA · KUNCI TERLIHAT</p>
      <div class="preview-tags">
        <span class="pill subtle">{data.row.subtestCode}</span><span class="muted"
          >{data.row.topicCode}</span
        >
      </div>
      <h2 class="question-preview">{data.row.content.prompt_md}</h2>
      <div class="preview-options">
        {#each data.row.content.options as option}<div
            class:correct={data.row.content.correct_option_code === option.code &&
              data.row.content.scoring_mode === 'single_correct'}
          >
            <span class="option-letter">{option.code}</span>
            <p>{option.text_md}</p>
            {#if data.row.content.scoring_mode === 'weighted_options'}<span class="pill subtle"
                >{option.score} poin</span
              >{:else if data.row.content.correct_option_code === option.code}<span class="pill"
                >Kunci</span
              >{/if}
          </div>{/each}
      </div>
      <hr />
      <h3>Pembahasan</h3>
      <p class="preserve">{data.row.content.explanation_md}</p>
      <hr />
      <h3>Sumber & hak penggunaan</h3>
      <p class="preserve muted">
        {data.row.content.source_note}<br />{data.row.content.rights_basis}
      </p>
    </section>
    <aside>
      {#if ['in_review', 'approved'].includes(data.row.status)}<form
          class="panel form-panel stack"
          method="POST"
          action="?/transition"
          use:enhance
        >
          <h2>Perlu perbaikan?</h2>
          <input type="hidden" name="revision" value={data.row.revision} /><input
            type="hidden"
            name="next"
            value="draft"
          /><label
            >Catatan perbaikan<textarea name="note" required maxlength="2000" rows="3"
            ></textarea></label
          ><button class="button secondary">Kembalikan ke draft</button>
        </form>{/if}
      {#if ['published', 'archived'].includes(data.row.status)}<form
          class="panel form-panel stack"
          method="POST"
          action="?/revise"
          use:enhance
        >
          <h2>Buat revisi baru</h2>
          <p class="muted">
            Versi ini tetap tersimpan. Perubahan dikerjakan pada draft versi berikutnya.
          </p>
          <label
            >Alasan revisi<textarea name="note" required maxlength="2000" rows="3"
            ></textarea></label
          ><button class="button secondary">Buat versi berikutnya</button>
        </form>{/if}
      {#if data.row.status === 'published'}<form
          class="panel form-panel stack"
          method="POST"
          action="?/transition"
          use:enhance
        >
          <h2>Arsipkan versi</h2>
          <input type="hidden" name="revision" value={data.row.revision} /><input
            type="hidden"
            name="next"
            value="archived"
          /><label
            >Alasan pengarsipan<textarea name="note" required maxlength="2000" rows="2"
            ></textarea></label
          ><button class="button secondary">Arsipkan</button>
        </form>{/if}
    </aside>
  </div>{/if}
<section class="panel form-panel">
  <h2>Riwayat versi</h2>
  <div class="version-list">
    {#each data.history as version}<a href={'/admin/questions/' + version.id}
        ><strong>Versi {version.version}</strong><span class={'pill status-' + version.status}
          >{statusLabels[version.status]}</span
        ><span class="muted">{version.changeNote || 'Versi awal'}</span></a
      >{/each}
  </div>
</section>
