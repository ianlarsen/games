/* ============================================================
   NBCOT PREP — Sound Effects
   Lightweight audio utility. Sounds are loaded lazily on first
   play and cached for subsequent calls.
   ============================================================ */

const Sound = (() => {

  const FILES = {
    'correct':          'assets/audio/correct.mp3',
    'incorrect':        'assets/audio/incorrect.mp3',
    'badge':            'assets/audio/badge.mp3',
    'session-complete': 'assets/audio/session-complete.mp3',
    'level-up':         'assets/audio/level-up.mp3',
  };

  let _enabled = true;
  const _cache = {};

  function setEnabled(val) {
    _enabled = !!val;
  }

  function play(name) {
    if (!_enabled) return;
    const src = FILES[name];
    if (!src) return;
    try {
      if (!_cache[name]) {
        _cache[name] = new Audio(src);
      }
      const audio = _cache[name];
      audio.currentTime = 0;
      audio.play().catch(() => {}); // silently ignore autoplay restrictions
    } catch (e) {
      // ignore errors on devices without audio support
    }
  }

  return { play, setEnabled };

})();
