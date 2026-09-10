<script lang="ts">
  import QuestionForm from '$lib/QuestionForm.svelte';
  import { blankQuestion } from '$lib/question-input';
  let { form } = $props();
  const initial = blankQuestion();
</script>

<svelte:head><title>Tambah soal · Ruang Tryout</title></svelte:head>
<a class="back-link" href="/admin/questions">← Bank soal</a>
<div class="page-heading">
  <div>
    <p class="eyebrow">DRAFT BARU</p>
    <h1>Susun soal<span class="accent-dot">.</span></h1>
    <p class="muted">Mulai dari pertanyaan, lalu lengkapi opsi dan pembahasannya.</p>
  </div>
</div>
<QuestionForm {initial} error={form?.error} />
