/* Dot-to-Dot T-Rex (v2) */

const LEVEL = {
  imageSrc: "assets/images/trex.png",
  viewBox: [1000, 1000],
  dots: [
    { x: 513, y: 101 },  // 1 - top of head/first spike
    { x: 623, y: 61 },   // 2 - top spike
    { x: 862, y: 128 },  // 3 - back spike
    { x: 891, y: 329 },  // 4 - back of neck
    { x: 748, y: 342 },  // 5 - shoulder
    { x: 690, y: 403 },  // 6 - upper back
    { x: 775, y: 411 },  // 7 - middle back
    { x: 813, y: 409 },  // 8 - lower back
    { x: 860, y: 443 },  // 9 - tail start
    { x: 904, y: 488 },  // 10 - tail high point
    { x: 864, y: 528 },  // 11 - tail curve
    { x: 777, y: 577 },  // 12 - tail middle
    { x: 697, y: 649 },  // 13 - tail lower
    { x: 719, y: 714 },  // 14 - tail bottom
    { x: 697, y: 772 },  // 15 - tail end curve
    { x: 654, y: 823 },  // 16 - back foot top
    { x: 755, y: 895 },  // 17 - back foot bottom
    { x: 690, y: 913 },  // 18 - foot toe
    { x: 542, y: 893 },  // 19 - under belly
    { x: 415, y: 846 },  // 20 - front foot
    { x: 500, y: 890 },  // 21 - front foot bottom
    { x: 307, y: 790 },  // 22 - belly front
    { x: 265, y: 559 },  // 23 - chest
    { x: 397, y: 434 },  // 24 - arm/shoulder
    { x: 415, y: 273 },  // 25 - neck to close
  ],
};

let state = {
  expected: 1,
  points: [],
  poly: null,
  audioCtx: null,
  started: false,
  finished: false,
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  const svg = document.getElementById("board");
  svg.setAttribute("viewBox", "0 0 1000 1000");
  setBoardTo80vh();
  window.addEventListener("resize", setBoardTo80vh);
  window.addEventListener("orientationchange", setBoardTo80vh);

  const dotsGroup = document.getElementById("dots");
  const path = document.getElementById("path");
  state.poly = path;
  updateProgress();

  renderDots();
  setActiveDot(1);

  document.getElementById("resetBtn").addEventListener("click", resetGame, { passive: true });
}

function renderDots() {
  const dotsGroup = document.getElementById("dots");
  while (dotsGroup.firstChild) dotsGroup.removeChild(dotsGroup.firstChild);
  
  LEVEL.dots.forEach((pt, i) => {
    const g = el("g", { class: "dot", "data-index": i + 1 });
    const ring = el("circle", { class: "ring", cx: pt.x, cy: pt.y, r: 0 });
    const visual = el("circle", { class: "visual", cx: pt.x, cy: pt.y, r: 9 });
    const hit = el("circle", { class: "hit", cx: pt.x, cy: pt.y, r: 30 });
    const label = el("text", { x: pt.x + 14, y: pt.y - 14, "text-anchor": "start", "dominant-baseline": "central" });
    label.textContent = i + 1;
    
    g.appendChild(ring);
    g.appendChild(visual);
    g.appendChild(hit);
    g.appendChild(label);
    dotsGroup.appendChild(g);
    
    g.addEventListener("pointerdown", onDotPointer);
  });
}

function onDotPointer(e) {
  e.preventDefault();
  const g = e.currentTarget;
  const index = Number(g.getAttribute("data-index"));
  ensureAudio();

  if (state.finished) return;

  if (index === state.expected) {
    goodTap(index);
  } else {
    badTap(g);
  }
}

function goodTap(index) {
  const pt = LEVEL.dots[index - 1];

  if (!state.started) {
    state.started = true;
    state.points = [`${pt.x},${pt.y}`];
  } else {
    state.points.push(`${pt.x},${pt.y}`);
    state.poly.setAttribute("points", state.points.join(" "));
  }

  ding();

  state.expected++;
  updateProgress();

  clearActiveDot();
  if (state.expected <= LEVEL.dots.length) {
    setActiveDot(state.expected);
  } else {
    win();
  }
}

function badTap(g) {
  buzz();
  if ("vibrate" in navigator) navigator.vibrate(25);
  g.classList.add("wrong");
  setTimeout(() => g.classList.remove("wrong"), 200);
}

function win() {
  state.finished = true;
  chime();
  document.getElementById("completedImage").classList.add("revealed");
}

function resetGame() {
  state = { 
    expected: 1, 
    points: [], 
    poly: state.poly, 
    audioCtx: state.audioCtx, 
    started: false, 
    finished: false 
  };
  state.poly.setAttribute("points", "");
  document.getElementById("completedImage").classList.remove("revealed");
  document.querySelectorAll(".dot").forEach((g) => g.classList.remove("wrong", "active"));
  setActiveDot(1);
  updateProgress();
}

function ensureAudio() {
  if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function tone({ freq = 440, type = "sine", duration = 0.1, gain = 0.06, when = 0 }) {
  if (!state.audioCtx) return;
  const ctx = state.audioCtx;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.stop(t0 + duration + 0.02);
}

function ding() {
  tone({ freq: 880, duration: 0.07, gain: 0.055 });
  tone({ freq: 1320, duration: 0.09, gain: 0.05, when: 0.06 });
}

function buzz() {
  tone({ freq: 220, type: "sawtooth", duration: 0.08, gain: 0.06 });
  tone({ freq: 160, type: "square", duration: 0.08, gain: 0.05, when: 0.06 });
}

function chime() {
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  freqs.forEach((f, i) => tone({ freq: f, duration: 0.18, gain: 0.06, when: i * 0.12 }));
}

function setActiveDot(n) {
  const g = document.querySelector(`.dot[data-index="${n}"]`);
  if (!g) return;
  if (g.parentNode) g.parentNode.appendChild(g);
  g.classList.add("active");
  const ring = g.querySelector(".ring");
  if (ring) ring.setAttribute("r", "16");
  const hit = g.querySelector(".hit");
  if (hit) hit.setAttribute("r", "36");
}

function clearActiveDot() {
  const g = document.querySelector(`.dot.active`);
  if (!g) return;
  g.classList.remove("active");
  const ring = g.querySelector(".ring");
  if (ring) ring.setAttribute("r", "0");
  const hit = g.querySelector(".hit");
  if (hit) hit.setAttribute("r", "30");
}

function updateProgress() {
  const total = LEVEL.dots.length;
  const current = Math.min(state.expected, total);
  const el = document.getElementById("progress");
  if (el) el.textContent = `${current} / ${total}`;
}

function el(tag, attrs = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  return node;
}

function setBoardTo80vh() {
  const visualH = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
  const H = Math.max(0, visualH) * 0.8;
  const W = window.innerWidth * 0.95;
  const size = Math.min(H, W);
  document.documentElement.style.setProperty("--board-size", size + "px");
}