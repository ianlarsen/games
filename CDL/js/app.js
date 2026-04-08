'use strict';
/**
 * CDL Study Tool — app.js
 * View rendering + all UI logic.
 * Modes: smart | quiz | test | daily | blitz | streak | wheel | domain
 */

// ── State ─────────────────────────────────────────────────────────────────

let _user       = null;
let _cardStates = [];
let _badges     = [];

// Session state
let _session = {
  mode:         null,
  questions:    [],
  idx:          0,
  correct:      0,
  answered:     false,
  streakCount:  0,
  blitzScore:   0,
  blitzTimer:   null,
  nemesisDefeatedThisSession: false,
};

// ── Screen helpers ────────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function $(id) { return document.getElementById(id); }

// ── Boot ──────────────────────────────────────────────────────────────────

async function boot() {
  showScreen('loading');
  try {
    _user       = await initStorage();
    _cardStates = await getAllCardStates();
    _badges     = await getEarnedBadges();
    await updateLoginStreak();
    renderHome();
    showScreen('home');
  } catch (err) {
    console.error('Boot failed:', err);
    document.querySelector('.app-subtitle').textContent = 'Failed to load. Please refresh.';
  }
}

// ── Login streak ──────────────────────────────────────────────────────────

async function updateLoginStreak() {
  const today = todayDateString();
  if (_user.lastLoginDate === today) return; // already logged today

  const yesterday = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  if (_user.lastLoginDate === yesterday) {
    _user.loginStreak = (_user.loginStreak || 0) + 1;
  } else {
    _user.loginStreak = 1;
  }
  _user.lastLoginDate = today;
  await saveUser(_user);
}

// ── Dark mode ─────────────────────────────────────────────────────────────

function applyDarkMode(dark) {
  document.body.classList.toggle('dark', dark);
  $('btn-dark-toggle').textContent = dark ? '☀️' : '🌙';
}

// ── Home screen ───────────────────────────────────────────────────────────

function renderHome() {
  applyDarkMode(_user.settings?.dark !== false);
  Sound.setEnabled(_user.settings?.sound !== false);

  // Stats bar
  $('home-streak').textContent  = _user.loginStreak  || 0;
  $('home-xp').textContent      = _user.xp            || 0;
  $('home-mastery').textContent = calcMastery(_cardStates) + '%';

  // High scores
  $('hs-blitz').textContent  = 'Best: ' + (_user.gameStats?.blitzHighScore  || 0);
  $('hs-streak').textContent = 'Best: ' + (_user.gameStats?.streakRunBest   || 0);

  // Daily challenge card
  const today = todayDateString();
  const done  = _user.dailyChallengeDate === today && _user.dailyChallengeComplete;
  const card  = $('daily-challenge-card');
  card.classList.toggle('completed', done);
  const badge = $('daily-status-badge');
  badge.textContent  = done ? '✓ DONE' : 'NEW';
  badge.classList.toggle('done', done);
  $('btn-daily').textContent = done ? 'Review Challenge' : 'Start Today\'s Challenge';

  // Domain progress
  const list = $('domain-progress-list');
  list.innerHTML = '';
  for (const [key, d] of Object.entries(DOMAINS)) {
    const pct = calcMastery(_cardStates, key);
    const row = document.createElement('div');
    row.className = 'domain-row';
    row.innerHTML = `
      <div class="domain-dot" style="background:${d.color}"></div>
      <span class="domain-label">${d.label}</span>
      <div class="domain-bar-track"><div class="domain-bar-fill" style="width:${pct}%;background:${d.color}"></div></div>
      <span class="domain-pct">${pct}%</span>
    `;
    list.appendChild(row);
  }

  // Badge shelf
  renderBadgeShelf();
}

function renderBadgeShelf() {
  const earnedIds = new Set(_badges.map(b => b.badgeId));
  const shelf = $('badge-shelf');
  shelf.innerHTML = '';
  for (const def of BADGE_DEFS) {
    const item = document.createElement('div');
    item.className = 'badge-item' + (earnedIds.has(def.id) ? ' earned' : '');
    item.innerHTML = `
      <div class="badge-emoji">${def.emoji}</div>
      <span class="badge-name">${def.name}</span>
    `;
    item.title = def.desc;
    shelf.appendChild(item);
  }
  const total   = BADGE_DEFS.length;
  const earned  = earnedIds.size;
  $('badge-count').textContent = `${earned}/${total}`;
}

// ── Wheel ─────────────────────────────────────────────────────────────────

let _wheelSpinning = false;

function initWheel() {
  const canvas  = $('wheel-canvas');
  const ctx     = canvas.getContext('2d');
  const keys    = Object.keys(DOMAINS);
  const slice   = (Math.PI * 2) / keys.length;
  let angle     = 0;

  function drawWheel(rotation) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r  = cx - 4;
    keys.forEach((key, i) => {
      const start = rotation + i * slice;
      const end   = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = DOMAINS[key].color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.min(11, 200 / keys.length)}px sans-serif`;
      const label = DOMAINS[key].label.split(' ')[0];
      ctx.fillText(label, r - 10, 4);
      ctx.restore();
    });
  }

  drawWheel(0);

  $('btn-spin').addEventListener('click', () => {
    if (_wheelSpinning) return;
    _wheelSpinning = true;
    $('wheel-result').textContent = '';
    $('btn-spin').disabled = true;

    const targetIdx  = Math.floor(Math.random() * keys.length);
    const totalSpins = (5 + Math.random() * 5) * Math.PI * 2;
    const targetAngle = totalSpins + (Math.PI * 2 - (targetIdx * slice + slice / 2));
    const duration   = 3000;
    const start      = performance.now();
    let lastAngle    = 0;

    function animate(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      lastAngle      = eased * targetAngle;
      drawWheel(lastAngle);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        _wheelSpinning = false;
        $('btn-spin').disabled = false;
        const domainKey = keys[targetIdx];
        $('wheel-result').textContent = '🎡 ' + DOMAINS[domainKey].label + '!';
        setTimeout(() => startSession('quiz', domainKey), 1200);
      }
    }
    requestAnimationFrame(animate);
  });
}

// ── Start Session ─────────────────────────────────────────────────────────

function startSession(mode, domain = null) {
  _session = {
    mode,
    domain,
    questions:    getQuestionsForMode(mode, _cardStates, domain),
    idx:          0,
    correct:      0,
    answered:     false,
    streakCount:  0,
    blitzScore:   0,
    blitzTimer:   null,
    nemesisDefeatedThisSession: false,
    sessionCardStates: {},
  };

  // Label
  const labels = {
    smart:  'Smart Review',
    quiz:   'Quick Quiz',
    test:   'Practice Test',
    daily:  'Daily Challenge',
    blitz:  '60-Second Blitz',
    streak: 'Endless Streak',
  };
  $('study-mode-label').textContent = domain
    ? (DOMAINS[domain]?.label || 'Domain Study')
    : (labels[mode] || 'Study');

  // Streak banner
  const showStreak = mode === 'streak';
  $('streak-score-banner').style.display = showStreak ? 'block' : 'none';

  // Timer
  const showTimer = mode === 'blitz';
  $('session-timer-display').style.display = showTimer ? 'block' : 'none';

  showScreen('study');

  if (mode === 'blitz') startBlitzTimer();
  renderQuestion();
}

// ── Blitz Timer ───────────────────────────────────────────────────────────

function startBlitzTimer() {
  let timeLeft = 60;
  $('session-timer-display').textContent = '1:00';

  _session.blitzTimer = setInterval(() => {
    timeLeft--;
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    $('session-timer-display').textContent = `${m}:${String(s).padStart(2,'0')}`;

    if (timeLeft <= 10) $('session-timer-display').style.color = 'var(--error)';
    if (timeLeft <= 0) {
      clearInterval(_session.blitzTimer);
      endSession();
    }
  }, 1000);
}

// ── Render Question ───────────────────────────────────────────────────────

function renderQuestion() {
  const q = _session.questions[_session.idx];
  if (!q) { endSession(); return; }

  const cs     = _cardStates.find(c => c.questionId === q.id) || defaultCardState(q.id);
  const nemesis = isNemesis(cs);

  // Progress bar
  const total = _session.mode === 'streak' ? _session.questions.length : _session.questions.length;
  const pct   = (_session.idx / Math.max(total, 1)) * 100;
  $('session-progress-bar').style.width = pct + '%';

  const modeLabel = _session.mode === 'streak'
    ? `Q ${_session.idx + 1}`
    : `Q ${_session.idx + 1} / ${_session.questions.length}`;
  $('session-qnum').textContent  = modeLabel;
  $('session-score').textContent = `✓ ${_session.correct}`;

  $('nemesis-banner').style.display = nemesis ? 'block' : 'none';
  if (_session.mode === 'streak') {
    $('streak-counter').textContent = _session.streakCount;
  }

  $('question-domain-tag').textContent = DOMAINS[q.domain]?.label || q.domain;
  $('question-domain-tag').style.color = DOMAINS[q.domain]?.color || '';
  $('question-text').textContent       = q.q;

  // Options
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const optList = $('options-list');
  optList.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span>${escapeHtml(opt)}`;
    btn.addEventListener('click', () => handleAnswer(i, q, nemesis));
    optList.appendChild(btn);
  });

  // Feedback bar hidden
  $('feedback-bar').style.display = 'none';
  $('feedback-bar').className     = 'feedback-bar';
  _session.answered = false;
}

// ── Handle Answer ─────────────────────────────────────────────────────────

async function handleAnswer(chosenIdx, q, wasNemesis) {
  if (_session.answered) return;
  _session.answered = true;

  const correct = chosenIdx === q.answer;
  const cs      = _cardStates.find(c => c.questionId === q.id) || defaultCardState(q.id);
  const prevBox = cs.box;
  const updated = updateCardAfterAnswer(cs, correct);

  // Save card state
  await saveCardState(updated);
  const idx = _cardStates.findIndex(c => c.questionId === q.id);
  if (idx >= 0) _cardStates[idx] = updated; else _cardStates.push(updated);

  // XP
  const xp = xpForAnswer(correct, prevBox);
  if (xp > 0) {
    _user.xp = (_user.xp || 0) + xp;
    await saveUser(_user);
  }

  // Level-up sound (box promoted)
  if (correct && updated.box > prevBox) Sound.levelUp();
  else if (correct) Sound.correct();
  else Sound.incorrect();

  if (correct) { _session.correct++; }

  // Streak mode
  if (_session.mode === 'streak') {
    if (correct) {
      _session.streakCount++;
      $('streak-counter').textContent = _session.streakCount;
    } else {
      endSession();
      return;
    }
  }

  // Blitz mode
  if (_session.mode === 'blitz') {
    if (correct) _session.blitzScore++;
    // auto-next quickly
  }

  // Nemesis defeat
  if (wasNemesis && correct) _session.nemesisDefeatedThisSession = true;

  // Highlight options
  const optBtns = $('options-list').querySelectorAll('.option-btn');
  optBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer)  btn.classList.add('correct');
    if (i === chosenIdx && !correct) btn.classList.add('wrong');
  });

  // Feedback bar
  const fb = $('feedback-bar');
  fb.style.display = 'flex';
  fb.classList.add(correct ? 'correct-fb' : 'wrong-fb');
  $('feedback-icon').textContent = correct ? '✅' : '❌';

  const showRationale = _user.settings?.rationale !== false && q.rationale;
  $('feedback-msg').textContent = showRationale
    ? (correct ? '✓ Correct! ' : '✗ Incorrect. ') + q.rationale
    : (correct ? 'Correct!' : `Incorrect. Correct answer: ${q.options[q.answer]}`);

  // Blitz: auto-advance after short delay
  if (_session.mode === 'blitz') {
    setTimeout(() => advance(), 600);
  }
}

function advance() {
  _session.idx++;
  if (_session.mode !== 'streak' && _session.idx >= _session.questions.length) {
    endSession();
  } else if (_session.mode === 'streak' && _session.idx >= _session.questions.length) {
    // Ran out of questions — shuffle more
    const extras = getQuestionsForMode('streak', _cardStates, _session.domain);
    _session.questions = [..._session.questions, ...extras];
    renderQuestion();
  } else {
    renderQuestion();
  }
}

// ── End Session ───────────────────────────────────────────────────────────

async function endSession() {
  if (_session.blitzTimer) clearInterval(_session.blitzTimer);

  const total   = _session.mode === 'streak' ? _session.streakCount : _session.correct + (_session.idx - _session.correct);
  const correct = _session.mode === 'streak' ? _session.streakCount : _session.correct;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Save session
  await saveSession({ mode: _session.mode, correct, total, xp: _user.xp });

  // Daily challenge
  if (_session.mode === 'daily') {
    _user.dailyChallengeDate     = todayDateString();
    _user.dailyChallengeComplete = true;
    _user.dailyChallengesCompleted = (_user.dailyChallengesCompleted || 0) + 1;
    await saveUser(_user);
  }

  // Blitz high score
  if (_session.mode === 'blitz') {
    const prev = _user.gameStats?.blitzHighScore || 0;
    if (_session.blitzScore > prev) {
      _user.gameStats.blitzHighScore = _session.blitzScore;
      await saveUser(_user);
    }
  }

  // Streak run best
  if (_session.mode === 'streak') {
    const prev = _user.gameStats?.streakRunBest || 0;
    if (_session.streakCount > prev) {
      _user.gameStats.streakRunBest = _session.streakCount;
      await saveUser(_user);
    }
  }

  // Badge check
  const newBadgeIds = await checkAndAwardBadges({
    user:              _user,
    cardStates:        _cardStates,
    sessionCorrect:    correct,
    sessionTotal:      total,
    isNemesisDefeated: _session.nemesisDefeatedThisSession,
    earnedBadges:      _badges,
  });
  _badges = await getEarnedBadges();

  // Results screen
  showScreen('results');

  const circle = document.querySelector('.results-score-circle');
  circle.style.setProperty('--pct', pct + '%');
  $('results-pct').textContent  = pct + '%';
  $('res-correct').textContent  = correct;
  $('res-wrong').textContent    = Math.max(0, total - correct);
  $('res-xp').textContent       = '+' + (pct > 0 ? correct * 10 : 0);

  // New badges
  const newBadgesSection = $('new-badges-section');
  const newBadgesList    = $('new-badges-list');
  newBadgesList.innerHTML = '';
  if (newBadgeIds.length > 0) {
    newBadgesSection.style.display = 'block';
    for (const bid of newBadgeIds) {
      const def = BADGE_DEFS.find(b => b.id === bid);
      if (!def) continue;
      const item = document.createElement('div');
      item.className = 'badge-item earned';
      item.innerHTML = `<div class="badge-emoji">${def.emoji}</div><span class="badge-name">${def.name}</span>`;
      newBadgesList.appendChild(item);
    }
    Sound.badge();
    // Show modal for the first new badge
    const firstDef = BADGE_DEFS.find(b => b.id === newBadgeIds[0]);
    if (firstDef) showBadgeModal(firstDef);
  } else {
    newBadgesSection.style.display = 'none';
    Sound.sessionComplete();
  }
}

// ── Badge Modal ───────────────────────────────────────────────────────────

function showBadgeModal(def) {
  $('badge-modal-icon').textContent = def.emoji;
  $('badge-modal-name').textContent = def.name;
  $('badge-modal-desc').textContent = def.desc;
  $('badge-modal').style.display    = 'flex';
}

// ── Settings ──────────────────────────────────────────────────────────────

function initSettings() {
  const soundToggle     = $('setting-sound');
  const darkToggle      = $('setting-dark');
  const rationaleToggle = $('setting-rationale');

  soundToggle.checked     = _user.settings?.sound     !== false;
  darkToggle.checked      = _user.settings?.dark      !== false;
  rationaleToggle.checked = _user.settings?.rationale !== false;

  soundToggle.addEventListener('change', async () => {
    _user.settings.sound = soundToggle.checked;
    Sound.setEnabled(soundToggle.checked);
    await saveUser(_user);
  });
  darkToggle.addEventListener('change', async () => {
    _user.settings.dark = darkToggle.checked;
    applyDarkMode(darkToggle.checked);
    await saveUser(_user);
  });
  rationaleToggle.addEventListener('change', async () => {
    _user.settings.rationale = rationaleToggle.checked;
    await saveUser(_user);
  });

  $('btn-reset').addEventListener('click', async () => {
    if (!confirm('Reset ALL progress? This cannot be undone.')) return;
    _user       = await resetAllProgress();
    _cardStates = await getAllCardStates();
    _badges     = await getEarnedBadges();
    renderHome();
    showScreen('home');
  });

  $('settings-q-count').textContent = QUESTIONS.length;
}

// ── Domain selector ───────────────────────────────────────────────────────

function renderDomainSelector() {
  const list = $('domain-btn-list');
  list.innerHTML = '';
  for (const [key, d] of Object.entries(DOMAINS)) {
    const count = QUESTIONS.filter(q => q.domain === key).length;
    const btn   = document.createElement('button');
    btn.className = 'domain-select-btn';
    btn.innerHTML = `
      <div class="domain-swatch" style="background:${d.color}"></div>
      <span class="domain-select-name">${d.label}</span>
      <span class="domain-select-count">${count} questions</span>
    `;
    btn.addEventListener('click', () => startSession('quiz', key));
    list.appendChild(btn);
  }
}

// ── Event Bindings ────────────────────────────────────────────────────────

function bindEvents() {
  // Home study mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'domain') {
        renderDomainSelector();
        showScreen('domain-select');
      } else {
        startSession(mode);
      }
    });
  });

  // Arcade buttons
  document.querySelectorAll('.arcade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (mode === 'wheel') {
        showScreen('wheel');
      } else {
        startSession(mode);
      }
    });
  });

  // Daily challenge
  $('btn-daily').addEventListener('click', () => {
    const today = todayDateString();
    const done  = _user.dailyChallengeDate === today && _user.dailyChallengeComplete;
    if (done) {
      // Replay review mode using daily questions
      const qs = getDailyChallenge();
      _session = {
        mode: 'daily', domain: null,
        questions: qs, idx: 0, correct: 0, answered: false,
        streakCount: 0, blitzScore: 0, blitzTimer: null,
        nemesisDefeatedThisSession: false,
      };
      $('study-mode-label').textContent = 'Daily Challenge (Review)';
      $('streak-score-banner').style.display = 'none';
      $('session-timer-display').style.display = 'none';
      showScreen('study');
      renderQuestion();
    } else {
      startDailyChallenge();
    }
  });

  // Next button in study
  $('btn-next').addEventListener('click', () => advance());

  // Results buttons
  $('btn-results-home').addEventListener('click', () => {
    renderHome();
    showScreen('home');
  });
  $('btn-play-again').addEventListener('click', () => {
    startSession(_session.mode, _session.domain);
  });

  // Badge modal close
  $('badge-modal-close').addEventListener('click', () => {
    $('badge-modal').style.display = 'none';
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target || 'home';
      if (target === 'home') {
        renderHome();
        showScreen('home');
      } else {
        showScreen(target);
      }
    });
  });

  // Settings button
  $('btn-settings').addEventListener('click', () => {
    initSettings();
    showScreen('settings');
  });

  // Dark mode toggle
  $('btn-dark-toggle').addEventListener('click', async () => {
    _user.settings = _user.settings || {};
    _user.settings.dark = !(_user.settings.dark !== false);
    applyDarkMode(_user.settings.dark);
    await saveUser(_user);
  });
}

// ── Daily Challenge launcher ──────────────────────────────────────────────

function startDailyChallenge() {
  const qs = getDailyChallenge();
  _session = {
    mode: 'daily', domain: null,
    questions: qs, idx: 0, correct: 0, answered: false,
    streakCount: 0, blitzScore: 0, blitzTimer: null,
    nemesisDefeatedThisSession: false,
  };
  $('study-mode-label').textContent = 'Daily Challenge';
  $('streak-score-banner').style.display = 'none';
  $('session-timer-display').style.display = 'none';
  showScreen('study');
  renderQuestion();
}

// ── Utility ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Init ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  initWheel();
  boot();
});
