
export function loadWithFallback(src: string, label = 'Missing', w = 640, h = 360, category: 'portrait'|'background'|'icon'|'event'='background'): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      const palettes: Record<string, [string,string]> = {
        portrait: ['#233043','#3a4c68'],
        background: ['#2a2c34','#1b1d24'],
        icon: ['#2f3a2f','#1b261b'],
        event: ['#3b2f2f','#251b1b']
      };
      const [bg, fg] = palettes[category] ?? ['#2a2c34','#1b1d24'];
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle = fg; ctx.lineWidth = 2;
      for(let i=-h;i<w;i+=16){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+h,h); ctx.stroke(); }
      ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 4; ctx.strokeRect(2,2,w-4,h-4);
      ctx.fillStyle = '#e2e8f0'; ctx.font = `bold ${Math.max(14, Math.floor(w*0.05))}px system-ui,Segoe UI,Roboto`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, w/2, h/2 - 14);
      ctx.fillText('— placeholder —', w/2, h/2 + 14);
      const ph = new Image();
      ph.onload = () => resolve(ph);
      ph.src = canvas.toDataURL('image/png');
    };
    img.src = src;
  });
}
