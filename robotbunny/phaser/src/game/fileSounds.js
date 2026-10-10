// Bundled file:// pages use media elements, avoiding fetch/XHR restrictions.
export class FileSounds {
  constructor(baseURL, makeAudio = () => new Audio()) {
    this.baseURL = baseURL;
    this.makeAudio = makeAudio;
    this.pools = new Map();
  }
  play(key, volume) {
    let pool = this.pools.get(key);
    if (!pool) {
      pool = Array.from({ length: 2 }, () => {
        const audio = this.makeAudio();
        audio.preload = 'none';
        audio.src = new URL(key + '.mp3', this.baseURL).href;
        return audio;
      });
      this.pools.set(key, pool);
    }
    const audio = pool.find(item => item.paused || item.ended);
    if (!audio) return;
    audio.volume = volume;
    try { audio.currentTime = 0; } catch {}
    audio.play()?.catch(() => {});
  }
  stop() { for (const pool of this.pools.values()) for (const audio of pool) audio.pause(); }
  destroy() {
    this.stop();
    for (const pool of this.pools.values()) for (const audio of pool) {
      audio.removeAttribute('src');
      audio.load();
    }
    this.pools.clear();
  }
}
