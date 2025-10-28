// Optional global BGM + SFX. Put audio files in /audio
const audioBase = 'audio/';

// Background loop (optional — include bgm_loop.ogg or .mp3)
export const BGM = new Audio(audioBase + 'bgm_loop.ogg');
BGM.loop = true;
BGM.volume = 0.35;
window.addEventListener('pointerdown', () => BGM.play().catch(()=>{}), { once: true });

// One-shot SFX map (add your own)
const SFX = {
  ding: audioBase + 'microwave_ding.wav',
  crossbow: audioBase + 'crossbow.wav',
  horde: audioBase + 'zombie_horde.wav',
  roomba: audioBase + 'roomba.wav',
};

export function playSfx(key, vol = 0.7) {
  const src = SFX[key];
  if (!src) return;
  const a = new Audio(src);
  a.volume = vol;
  a.play().catch(()=>{});
}

// make available to scene data without importing in every file
window.playSfx = playSfx;
