import './styles.css';
import { createGame } from './game/createGame.js';
import { Music } from './game/music.js';

const controls = { left: false, right: false, jump: false, shoot: false, jumpQueued: false, dashQueued: false };
const el = id => document.getElementById(id);
const overlay = el('overlay');
let soundEnabled = false;
let ready = false, paused = false, won = false, playing = false, failed = false;
const keyboard = new Set(), pointers = new Map();
const bindings = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyX: 'shoot', ShiftLeft: 'dash', ShiftRight: 'dash' };
const buttons = [...document.querySelectorAll('[data-control]')];
function sync() {
  for (const key of ['left', 'right', 'jump', 'shoot']) controls[key] = false;
  for (const code of keyboard) if (bindings[code] in controls) controls[bindings[code]] = true;
  for (const key of pointers.values()) if (key in controls) controls[key] = true;
  for (const button of buttons) button.classList.toggle('pressed', !!controls[button.dataset.control]);
}
function clear() {
  keyboard.clear(); pointers.clear();
  for (const key of Object.keys(controls)) controls[key] = false;
  for (const button of buttons) button.classList.remove('pressed');
}
window.addEventListener('keydown', event => {
  const key = bindings[event.code];
  if (key || event.code === 'Escape') event.preventDefault();
  if (event.repeat) return;
  if (event.code === 'Escape') { togglePause(); return; }
  if (event.code === 'Enter' && ready && !overlay.hidden) { el('play').click(); return; }
  if (!key || !playing || paused) return;
  keyboard.add(event.code);
  if (key === 'jump' || key === 'dash') controls[key + 'Queued'] = true;
  sync();
});
window.addEventListener('keyup', event => { keyboard.delete(event.code); sync(); });
for (const button of buttons) {
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (!playing || paused) return;
    button.setPointerCapture(event.pointerId);
    const key = button.dataset.control;
    pointers.set(event.pointerId, key);
    if (key === 'jump' || key === 'dash') controls[key + 'Queued'] = true;
    sync();
  });
  const release = event => { pointers.delete(event.pointerId); sync(); };
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(name, release);
}
const game = createGame({ parent: 'game-root', controlState: controls });
game.sound.mute = true;
game.sound.pauseOnBlur = false; // Resume only from our visible Resume button.
const music = new Music(new URL('./sounds/level1.mp3', document.baseURI).href);
function show(title, message, label) {
  el('title').textContent = title; el('message').textContent = message;
  el('play').textContent = label; overlay.hidden = false;
}
function resumeAudio() { game.sound.context?.resume()?.catch(() => {}); }
game.events.on('loading', progress => { if (!ready) el('message').textContent = 'Loading the moon… ' + progress + '%'; });
game.events.on('load-failed', names => {
  failed = true; el('play').disabled = false;
  show('Assets unavailable', 'Could not load ' + names.join(', ') + '. Check your connection, then retry.', 'Retry');
});
game.events.on('ready', () => {
  ready = true; el('hud').textContent = 'Ready for launch';
  el('play').disabled = false; el('practice').disabled = false;
  show('Robot Bunny · Easy', 'You’re invincible! Collect coins, enjoy assisted jumps, and hold Fire to aim at the nearest enemy.', 'Start run');
  game.canvas.addEventListener('webglcontextlost', interrupt);
  resize();
});
game.events.on('playing', () => {
  playing = true; paused = false; won = false; clear(); overlay.hidden = true;
  el('pause').textContent = 'Pause'; el('practice').hidden = true;
});
game.events.on('hud', hud => {
  const text = 'Sector ' + hud.level + ' · Score ' + hud.score + ' · Invincible' + ' · ' + hud.progress + '%' + (hud.boss !== null ? ' · Boss ' + hud.boss : '');
  if (el('hud').textContent !== text) el('hud').textContent = text;
});
game.events.on('finished', data => {
  playing = false; won = data.won; clear(); music.setActive(false);
  show(data.title, data.message, data.label); el('practice').hidden = false;
});
function start(practice = false, next = false) {
  if (!ready) return;
  clear(); paused = false; resumeAudio(); music.setActive(true);
  const scene = game.scene.getScene('play');
  const data = next ? { level: scene.level + 1, score: scene.score } : { practice };
  game.scene.stop('start');
  if (game.scene.isActive('play') || game.scene.isPaused('play')) game.scene.stop('play');
  game.scene.start('play', data);
}
el('play').addEventListener('click', () => { if (failed) { location.reload(); return; } if (paused) { togglePause(); return; } start(false, won); });
el('practice').addEventListener('click', () => start(true));
el('restart').addEventListener('click', () => start());
function togglePause() {
  if (!playing) return;
  clear(); paused = !paused; el('pause').textContent = paused ? 'Resume' : 'Pause';
  if (paused) {
    game.scene.pause('play'); game.sound.stopAll(); music.setActive(false);
    game.sound.context?.suspend()?.catch(() => {});
    show('Paused', 'Your run is safe. Resume when you’re ready.', 'Resume'); el('practice').hidden = true;
  } else {
    resumeAudio(); music.setActive(true); game.scene.resume('play'); overlay.hidden = true;
  }
}
el('pause').addEventListener('click', togglePause);
el('sound').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  game.sound.mute = !soundEnabled;
  el('sound').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  if (!soundEnabled) { game.sound.stopAll(); game.scene.getScene('play').fileSfx?.stop(); }
  else resumeAudio();
  music.setEnabled(soundEnabled);
});
function interrupt() { clear(); if (playing && !paused) togglePause(); music.setActive(false); }
window.addEventListener('blur', interrupt);
window.addEventListener('pagehide', interrupt);
window.addEventListener('rb:background', interrupt);
document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); });
window.addEventListener('pageshow', clear);
// Preserve CSS scaling and avoid repeatedly reallocating the canvas for tiny toolbar changes.
function resize() {
  const rect = el('game-root').getBoundingClientRect();
  if (rect.height <= 0) return;
  const width = Math.max(280, Math.min(1280, Math.round(560 * rect.width / rect.height / 8) * 8));
  if (game.scale.gameSize.width !== width) game.scale.setGameSize(width, 560);
}
let resizeTimer;
new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 80); }).observe(el('game-root'));


// Export for browser integration checks without adding a global debug interface.
export { game };
