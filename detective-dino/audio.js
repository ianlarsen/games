// Detective Dino - Audio System

const AudioManager = {
  // Audio elements
  bgMusic: null,
  sfxClick: null,
  sfxClue: null,
  sfxCorrect: null,
  sfxWrong: null,
  sfxWin: null,

  // Audio unlocked flag (needed for mobile browsers)
  audioUnlocked: false,

  // Initialize audio system
  init() {
    this.bgMusic = document.getElementById('bg-music');
    this.sfxClick = document.getElementById('sfx-click');
    this.sfxClue = document.getElementById('sfx-clue');
    this.sfxCorrect = document.getElementById('sfx-correct');
    this.sfxWrong = document.getElementById('sfx-wrong');
    this.sfxWin = document.getElementById('sfx-win');

    // Set volume levels
    if (this.bgMusic) this.bgMusic.volume = 0.3;
    if (this.sfxClick) this.sfxClick.volume = 0.5;
    if (this.sfxClue) this.sfxClue.volume = 0.6;
    if (this.sfxCorrect) this.sfxCorrect.volume = 0.7;
    if (this.sfxWrong) this.sfxWrong.volume = 0.6;
    if (this.sfxWin) this.sfxWin.volume = 0.8;

    // Unlock audio on first user interaction
    document.addEventListener('click', () => this.unlockAudio(), { once: true });
    document.addEventListener('touchstart', () => this.unlockAudio(), { once: true });
  },

  // Unlock audio (required for mobile browsers)
  unlockAudio() {
    if (this.audioUnlocked) return;

    const sounds = [this.sfxClick, this.sfxClue, this.sfxCorrect, this.sfxWrong, this.sfxWin];
    sounds.forEach(sound => {
      if (sound) {
        sound.play().then(() => {
          sound.pause();
          sound.currentTime = 0;
        }).catch(() => {});
      }
    });

    this.audioUnlocked = true;
    console.log('Audio unlocked!');
  },

  // Play background music
  playMusic() {
    if (this.bgMusic) {
      // Try to play, and unlock audio if needed
      this.bgMusic.play().then(() => {
        console.log('Music started successfully!');
      }).catch(err => {
        console.log('Music autoplay prevented, will retry:', err);
        // Retry after a short delay
        setTimeout(() => {
          if (this.bgMusic) {
            this.bgMusic.play().catch(e => console.log('Music retry failed:', e));
          }
        }, 100);
      });
    }
  },

  // Stop background music
  stopMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  },

  // Play click sound
  playClick() {
    this.playSound(this.sfxClick);
  },

  // Play clue found sound
  playClue() {
    this.playSound(this.sfxClue);
  },

  // Play correct sound
  playCorrect() {
    this.playSound(this.sfxCorrect);
  },

  // Play wrong sound
  playWrong() {
    this.playSound(this.sfxWrong);
  },

  // Play win sound
  playWin() {
    this.playSound(this.sfxWin);
  },

  // Generic play sound function
  playSound(soundElement) {
    if (soundElement && this.audioUnlocked) {
      soundElement.currentTime = 0;
      soundElement.play().catch(err => {
        console.log('Sound play failed:', err);
      });
    }
  },

  // Create simple beep sounds using Web Audio API (fallback if no audio files)
  createBeep(frequency, duration, type = 'sine') {
    if (!this.audioUnlocked) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (err) {
      console.log('Web Audio API not supported');
    }
  },

  // Play fun sound effects using Web Audio API
  playClickBeep() {
    this.createBeep(800, 0.1);
  },

  playClueBeep() {
    this.createBeep(1200, 0.3);
    setTimeout(() => this.createBeep(1400, 0.2), 100);
  },

  playCorrectBeep() {
    this.createBeep(800, 0.15);
    setTimeout(() => this.createBeep(1000, 0.15), 150);
    setTimeout(() => this.createBeep(1200, 0.3), 300);
  },

  playWrongBeep() {
    this.createBeep(400, 0.2);
    setTimeout(() => this.createBeep(300, 0.3), 200);
  },

  playWinBeep() {
    this.createBeep(800, 0.2);
    setTimeout(() => this.createBeep(1000, 0.2), 200);
    setTimeout(() => this.createBeep(1200, 0.2), 400);
    setTimeout(() => this.createBeep(1500, 0.4), 600);
  }
};

// Initialize audio system when page loads
document.addEventListener('DOMContentLoaded', () => {
  AudioManager.init();
});

// Make AudioManager available globally
window.AudioManager = AudioManager;
