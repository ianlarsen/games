// Stream long music instead of keeping a decoded PCM buffer in Web Audio memory.
export class Music {
  constructor(url, makeAudio = () => new Audio()) {
    this.audio = makeAudio();
    this.audio.preload = 'none';
    this.audio.loop = true;
    this.audio.volume = 0.2;
    this.url = url;
    this.enabled = false;
    this.active = false;
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    this.sync();
  }
  setActive(active) {
    this.active = active;
    this.sync();
  }
  sync() {
    if (!this.enabled || !this.active) {
      this.audio.pause();
      return;
    }
    if (!this.audio.src) this.audio.src = this.url;
    // iOS can reject playback during interruptions. Retry on the next user gesture.
    const playback = this.audio.play();
    playback?.catch(() => {});
  }
  destroy() {
    this.active = false;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
  }
}
