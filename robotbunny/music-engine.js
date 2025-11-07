// Dynamic Music Engine
export class MusicEngine {
  constructor(audioCtx, musicPatterns, biomeConfig) {
    this.audioCtx = audioCtx;
    this.musicPatterns = musicPatterns;
    this.biomeConfig = biomeConfig;

    this.isPlaying = false;
    this.currentBiome = null;
    this.intensity = 0; // 0-1
    this.bpm = 100;
    this.beatDuration = 0.6; // seconds per beat
    this.currentBeat = 0;
    this.scheduleAheadTime = 0.15; // seconds
    this.lookahead = 25; // ms
    this.nextNoteTime = 0;
    this.timerID = null;

    this.activeLayers = new Set();
    this.nodes = [];
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);
    this.masterGain.gain.value = 0.3;

    // FX Bus
    this.compressor = this.audioCtx.createDynamicsCompressor();
    this.compressor.threshold.value = this.musicPatterns.fx_bus.compression.threshold;
    this.compressor.ratio.value = this.musicPatterns.fx_bus.compression.ratio;
    this.compressor.attack.value = this.musicPatterns.fx_bus.compression.attack;
    this.compressor.release.value = this.musicPatterns.fx_bus.compression.release;
    this.compressor.connect(this.masterGain);

    // Reverb (simplified convolver)
    this.reverbGain = this.audioCtx.createGain();
    this.reverbGain.gain.value = this.musicPatterns.fx_bus.reverb.mix;
    this.reverbGain.connect(this.compressor);

    this.dryGain = this.audioCtx.createGain();
    this.dryGain.gain.value = 1 - this.musicPatterns.fx_bus.reverb.mix;
    this.dryGain.connect(this.compressor);

    this.combo = 0;
  }

  initMusic() {
    console.log('Music Engine initialized');
  }

  setMusicBiome(biomeId) {
    this.currentBiome = this.biomeConfig.biomes[biomeId];
    if (this.currentBiome) {
      this.bpm = this.currentBiome.bpmRange[0];
      this.updateBPM();
    }
  }

  updateBPM() {
    this.beatDuration = 60.0 / this.bpm;
  }

  startMusic(bpm) {
    if (this.isPlaying) return;

    this.bpm = bpm || this.bpm;
    this.updateBPM();
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioCtx.currentTime;

    this.scheduler();
  }

  stopMusic() {
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }

    // Stop all active nodes
    for (const node of this.nodes) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    }
    this.nodes = [];
  }

  setMusicIntensity(value) {
    this.intensity = Math.max(0, Math.min(1, value));

    // Update BPM based on intensity
    if (this.currentBiome) {
      const [minBpm, maxBpm] = this.currentBiome.bpmRange;
      this.bpm = minBpm + (maxBpm - minBpm) * this.intensity;
      this.updateBPM();
    }

    // Update active layers based on intensity
    this.updateLayers();
  }

  updateLayers() {
    const patterns = this.musicPatterns.intensityLayers;

    if (this.intensity < 0.33) {
      this.activeLayers = new Set(patterns.low);
    } else if (this.intensity < 0.66) {
      this.activeLayers = new Set(patterns.mid);
    } else {
      this.activeLayers = new Set(patterns.high);
    }

    // Add counter melody on combo
    if (this.combo >= 10) {
      this.activeLayers.add('arp');
    }
  }

  queueStinger(type) {
    const stinger = this.musicPatterns.stingers[type];
    if (!stinger) return;

    const now = this.audioCtx.currentTime;

    for (let i = 0; i < stinger.notes.length; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = stinger.type;
      osc.frequency.value = stinger.notes[i];

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + stinger.durations[i]);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(now);
      osc.stop(now + stinger.durations[i]);

      this.nodes.push(osc);
    }
  }

  scheduleKeyModulation(semitones, barsFromNow) {
    // Implement key modulation for boss phases
    // This would shift all future notes by semitones
    console.log(`Key modulation scheduled: +${semitones} semitones in ${barsFromNow} bars`);
  }

  scheduler() {
    if (!this.isPlaying) return;

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextNote();
    }

    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  nextNote() {
    this.nextNoteTime += this.beatDuration;
    this.currentBeat = (this.currentBeat + 1) % 4;
  }

  scheduleNote(beat, time) {
    // Schedule bass
    if (this.activeLayers.has('bass')) {
      this.playBass(beat, time);
    }

    // Schedule chords
    if (this.activeLayers.has('chords')) {
      this.playChords(beat, time);
    }

    // Schedule melody
    if (this.activeLayers.has('melody')) {
      this.playMelody(beat, time);
    }

    // Schedule arp
    if (this.activeLayers.has('arp')) {
      this.playArp(beat, time);
    }

    // Schedule percussion
    if (this.activeLayers.has('perc_k')) {
      this.playKick(beat, time);
    }
    if (this.activeLayers.has('perc_h')) {
      this.playHihat(beat, time);
    }
    if (this.activeLayers.has('perc_s')) {
      this.playSnare(beat, time);
    }
  }

  getFrequency(scaleDegree) {
    if (!this.currentBiome) return 440;

    const octave = Math.floor(scaleDegree / 7);
    const degree = scaleDegree % 7;
    const semitones = this.currentBiome.scaleIntervals[degree];

    return this.currentBiome.musicRoot * Math.pow(2, (octave * 12 + semitones) / 12);
  }

  playBass(beat, time) {
    const pattern = this.musicPatterns.patterns.bass;
    const index = pattern.beats.indexOf(beat);
    if (index === -1) return;

    const freq = this.getFrequency(pattern.scale_degrees[index] - 14); // 2 octaves down
    const duration = pattern.durations[index] * this.beatDuration;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 180 + this.intensity * 220;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.dryGain);

    osc.start(time);
    osc.stop(time + duration);

    this.nodes.push(osc);
  }

  playChords(beat, time) {
    const pattern = this.musicPatterns.patterns.chords;
    const index = pattern.beats.indexOf(beat);
    if (index === -1) return;

    const chordDegrees = pattern.chord_degrees[index];
    const duration = pattern.durations[index] * this.beatDuration;

    for (const degree of chordDegrees) {
      const freq = this.getFrequency(degree);

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = 800 + this.intensity * 400;
      filter.Q.value = 1;

      gain.gain.setValueAtTime(0.04, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.dryGain);

      osc.start(time);
      osc.stop(time + duration);

      this.nodes.push(osc);
    }
  }

  playMelody(beat, time) {
    const pattern = this.musicPatterns.patterns.melody;
    const index = pattern.beats.indexOf(beat);
    if (index === -1) return;

    const freq = this.getFrequency(pattern.scale_degrees[index] + 7); // 1 octave up
    const duration = pattern.durations[index] * this.beatDuration;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;
    osc.detune.value = 5;

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.dryGain);

    osc.start(time);
    osc.stop(time + duration);

    this.nodes.push(osc);
  }

  playArp(beat, time) {
    const pattern = this.musicPatterns.patterns.arp;
    const subBeat = (this.currentBeat * 2 + Math.floor((time - this.nextNoteTime + this.beatDuration) / (this.beatDuration / 2))) % 8;
    const index = pattern.beats.findIndex(b => Math.abs(b - subBeat / 2) < 0.01);
    if (index === -1) return;

    const freq = this.getFrequency(pattern.scale_degrees[index] + 14); // 2 octaves up
    const duration = pattern.durations[index] * this.beatDuration;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.dryGain);

    osc.start(time);
    osc.stop(time + duration);

    this.nodes.push(osc);
  }

  playKick(beat, time) {
    const pattern = this.musicPatterns.patterns.kick;
    if (!pattern.beats.includes(beat)) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.3);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.3);

    this.nodes.push(osc);
  }

  playHihat(beat, time) {
    const pattern = this.musicPatterns.patterns.hihat;
    if (!pattern.beats.includes(beat)) return;

    // White noise for hihat
    const bufferSize = this.audioCtx.sampleRate * 0.05;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(time);
    noise.stop(time + 0.05);

    this.nodes.push(noise);
  }

  playSnare(beat, time) {
    const pattern = this.musicPatterns.patterns.snare;
    if (!pattern.beats.includes(beat)) return;

    // Tone component
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(180, time + 0.15);

    oscGain.gain.setValueAtTime(0.15, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.15);

    // Noise component
    const bufferSize = this.audioCtx.sampleRate * 0.15;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;

    const noiseGain = this.audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.15, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.compressor);

    noise.start(time);
    noise.stop(time + 0.15);

    this.nodes.push(osc, noise);
  }

  setStemActive(stem, active) {
    if (active) {
      this.activeLayers.add(stem);
    } else {
      this.activeLayers.delete(stem);
    }
  }

  updateCombo(combo) {
    this.combo = combo;
    if (combo >= 10) {
      this.setStemActive('arp', true);
    } else {
      this.setStemActive('arp', false);
    }
  }
}
