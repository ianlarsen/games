
<script lang="ts">
  import { onMount } from 'svelte';
  export let src: string;
  export let alt: string = '';
  export let width: number = 640;
  export let height: number = 360;
  export let label: string = 'Missing Image';
  export let category: 'portrait'|'background'|'icon'|'event' = 'background';

  let resolvedSrc = '';
  let errored = false;

  function makePlaceholderURL(text: string, w: number, h: number, cat: string){
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    // palette per category
    const palettes: Record<string, [string,string]> = {
      portrait: ['#233043','#3a4c68'],
      background: ['#2a2c34','#1b1d24'],
      icon: ['#2f3a2f','#1b261b'],
      event: ['#3b2f2f','#251b1b']
    };
    const [bg, fg] = palettes[cat] ?? ['#2a2c34','#1b1d24'];
    // background
    ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
    // diagonal hatch
    ctx.strokeStyle = fg; ctx.lineWidth = 2;
    for(let i=-h;i<w;i+=16){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+h,h); ctx.stroke(); }
    // frame
    ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 4;
    ctx.strokeRect(2,2,w-4,h-4);
    // text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${Math.max(14, Math.floor(w*0.05))}px system-ui,Segoe UI,Roboto`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = [text, '— placeholder —'];
    const y0 = h/2 - 14;
    lines.forEach((ln,idx)=> ctx.fillText(ln, w/2, y0 + idx*28));
    return canvas.toDataURL('image/png');
  }

  onMount(() => {
    if (!src) {
      errored = true;
      resolvedSrc = makePlaceholderURL(label, width, height, category);
      return;
    }
    const test = new Image();
    test.onload = () => { resolvedSrc = src; };
    test.onerror = () => {
      errored = true;
      resolvedSrc = makePlaceholderURL(label, width, height, category);
    };
    test.src = src;
  });
</script>

<img {alt} {width} {height} {src}={resolvedSrc} class:placeholder={errored} />

<style>
  img.placeholder {
    filter: saturate(0.9) contrast(1.05);
  }
</style>
