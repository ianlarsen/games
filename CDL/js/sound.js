'use strict';
/**
 * CDL Study Tool — sound.js
 * Web Audio API–based sound engine (no external files required for fallback).
 * If audio files exist in assets/audio/, they will be used preferentially.
 * Falls back to synthesized tones so the app works even without audio assets.
 */

let _audioCtx = null;
let _soundEnabled = true;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function setSoundEnabled(val) { _soundEnabled = val; }

// ── Synthesized fallback sounds ────────────────────────────────────────────

function playTone(frequency, duration, type = 'sine', gainVal = 0.3, delay = 0) {
  if (!_soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch (_) { /* audio not available */ }
}

function synthCorrect() {
  playTone(523, 0.12, 'sine', 0.3, 0.00); // C5
  playTone(659, 0.12, 'sine', 0.3, 0.10); // E5
  playTone(784, 0.18, 'sine', 0.3, 0.20); // G5
}

function synthIncorrect() {
  playTone(300, 0.15, 'sawtooth', 0.25, 0.00);
  playTone(220, 0.20, 'sawtooth', 0.2,  0.15);
}

function synthBadge() {
  [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.15, 'sine', 0.3, i * 0.1));
}

function synthSessionComplete() {
  [392, 523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.18, 'sine', 0.3, i * 0.09));
}

function synthLevelUp() {
  playTone(440, 0.1,  'triangle', 0.3, 0.00);
  playTone(554, 0.1,  'triangle', 0.3, 0.10);
  playTone(659, 0.15, 'triangle', 0.3, 0.20);
}

// ── File-based audio cache ─────────────────────────────────────────────────

const _audioCache = {};
const AUDIO_FILES = {
  correct:          'assets/audio/correct.mp3',
  incorrect:        'assets/audio/incorrect.mp3',
  badge:            'assets/audio/badge.mp3',
  sessionComplete:  'assets/audio/session-complete.mp3',
  levelUp:          'assets/audio/level-up.mp3',
};

function _loadAudio(key) {
  if (_audioCache[key]) return _audioCache[key];
  const audio = new Audio(AUDIO_FILES[key]);
  audio.preload = 'auto';
  _audioCache[key] = audio;
  return audio;
}

function _playFile(key, fallback) {
  if (!_soundEnabled) return;
  try {
    const audio = _loadAudio(key);
    audio.currentTime = 0;
    const p = audio.play();
    if (p) p.catch(() => fallback());
  } catch (_) {
    fallback();
  }
}

// ── Public API ────────────────────────────────────────────────────────────

const Sound = {
  correct()         { _playFile('correct',         synthCorrect);         },
  incorrect()       { _playFile('incorrect',        synthIncorrect);       },
  badge()           { _playFile('badge',            synthBadge);           },
  sessionComplete() { _playFile('sessionComplete',  synthSessionComplete); },
  levelUp()         { _playFile('levelUp',          synthLevelUp);         },
  setEnabled(v)     { setSoundEnabled(v); },
};
