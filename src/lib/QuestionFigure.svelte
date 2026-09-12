<script lang="ts">
  let { text }: { text: string } = $props();
  const glyphs: Record<string, string> = {
    '↑':'panah atas', '→':'panah kanan', '↓':'panah bawah', '←':'panah kiri',
    '↗':'panah kanan atas', '↘':'panah kanan bawah', '↙':'panah kiri bawah', '↖':'panah kiri atas',
    '○':'lingkaran kosong', '●':'lingkaran penuh', '△':'segitiga', '□':'persegi kosong', '■':'persegi penuh',
    '◇':'belah ketupat', '☆':'bintang', '▱':'jajargenjang', '└':'sudut atas kanan', '┌':'sudut kanan bawah',
    '┐':'sudut bawah kiri', '┘':'sudut kiri atas', '┼':'silang'
  };
  const angles: Record<string, number> = {'↑':0,'↗':45,'→':90,'↘':135,'↓':180,'↙':225,'←':270,'↖':315};
  const corners: Record<string, number> = {'└':0,'┌':90,'┐':180,'┘':270};
  const parts = $derived(text.split(/([↑→↓←↗↘↙↖○●△□■◇☆▱└┌┐┘┼]+)/u));
</script>

<span class="figure-text">
  {#each parts as part}{#if [...part].length && [...part].every(c => glyphs[c])}<span class="figure-group">{#each [...part] as symbol}
    <svg viewBox="0 0 64 64" role="img" aria-label={glyphs[symbol]}>
      <title>{glyphs[symbol]}</title>
      <g fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="miter" stroke-linecap="square">
        {#if symbol in angles}<path transform={`rotate(${angles[symbol]} 32 32)`} d="M32 51V13 M18 27L32 13L46 27" />
        {:else if symbol === '○' || symbol === '●'}<circle cx="32" cy="32" r="20" fill={symbol === '●' ? 'currentColor' : 'none'} />
        {:else if symbol === '□' || symbol === '■'}<rect x="12" y="12" width="40" height="40" fill={symbol === '■' ? 'currentColor' : 'none'} />
        {:else if symbol === '△'}<path d="M32 9L55 52H9Z" />
        {:else if symbol === '◇'}<path d="M32 7L53 32L32 57L11 32Z" />
        {:else if symbol === '☆'}<path d="M32 7L39 24L57 25L43 37L47 55L32 45L17 55L21 37L7 25L25 24Z" />
        {:else if symbol === '▱'}<path d="M23 14H57L41 50H7Z" />
        {:else if symbol in corners}<path transform={`rotate(${corners[symbol]} 32 32)`} d="M16 12V48H52" />
        {:else if symbol === '┼'}<path d="M32 10V54M10 32H54" />{/if}
      </g>
    </svg>
  {/each}</span>{:else}{part}{/if}{/each}
</span>

<style>
  .figure-text { white-space:pre-wrap; line-height:1.8; }
  .figure-group { display:inline-flex; vertical-align:middle; flex-wrap:wrap; max-width:100%; gap:3px; padding:4px; margin:3px; border:1px solid #dce5e8; border-radius:6px; background:white; color:#111; }
  svg { width:44px; height:44px; flex:none; }
  @media(min-width:761px) { svg { width:52px; height:52px; } }
</style>
