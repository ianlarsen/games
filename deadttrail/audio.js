// Optional global BGM + SFX. Put audio files in /sounds
const audioBase = 'sounds/';

// Background loop
export const BGM = new Audio(audioBase + 'main_theme.mp3');
BGM.loop = true;
BGM.volume = 0.3;
window.addEventListener('pointerdown', () => BGM.play().catch(()=>{}), { once: true });
// Also try on any click/interaction
window.addEventListener('click', () => BGM.play().catch(()=>{}), { once: true });

// One-shot SFX map
const SFX = {
  ding: audioBase + 'microwave_ding.wav',
  crossbow: audioBase + 'crossbow.wav',
  horde: audioBase + 'zombie_horde.wav',
  roomba: audioBase + 'roomba.wav',
  dead: audioBase + 'dead.mp3',
  flip: audioBase + 'flip.mp3',
  zombie: audioBase + 'zombie.mp3',
};

// Ambient loops
const AMBIENT = {
  forest: audioBase + 'forest_walking.mp3',
};

let currentAmbient = null;

export function playAmbient(key, vol = 0.3) {
  const src = AMBIENT[key];
  if (!src) return;

  // Stop current ambient if different
  if (currentAmbient && currentAmbient.src !== src) {
    currentAmbient.pause();
    currentAmbient.currentTime = 0;
  }

  // Start new ambient
  if (!currentAmbient || currentAmbient.src !== src) {
    currentAmbient = new Audio(src);
    currentAmbient.loop = true;
    currentAmbient.volume = vol;
    currentAmbient.play().catch(() => {});
  }
}

export function stopAmbient() {
  if (currentAmbient) {
    currentAmbient.pause();
    currentAmbient.currentTime = 0;
    currentAmbient = null;
  }
}

window.playAmbient = playAmbient;
window.stopAmbient = stopAmbient;

export function playSfx(key, vol = 0.7) {
  const src = SFX[key];
  if (!src) return;
  const a = new Audio(src);
  a.volume = vol;
  a.play().catch(()=>{});
}

// make available to scene data without importing in every file
window.playSfx = playSfx;
