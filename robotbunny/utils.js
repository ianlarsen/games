// Utility functions
export function rand(a, b) {
  return a + Math.random() * (b - a);
}

export function randInt(a, b) {
  return Math.floor(rand(a, b + 1));
}

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
}

export function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

export function createParticles(particles, x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
    const speed = rand(100, 250);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(50, 150),
      life: 1.0,
      decay: rand(1.5, 2.5),
      size: rand(3, 7),
      color
    });
  }
}

export function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function pickWeighted(items, weightKey = 'weight') {
  const total = items.reduce((sum, item) => sum + item[weightKey], 0);
  let random = Math.random() * total;

  for (const item of items) {
    random -= item[weightKey];
    if (random <= 0) return item;
  }

  return items[items.length - 1];
}
