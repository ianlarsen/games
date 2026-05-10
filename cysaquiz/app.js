/**
 * CySA+ Study Tool — spaced repetition (Leitner-style), IndexedDB persistence,
 * session-based streaks, and multiple study modes.
 */

(() => {
  const DB_NAME = 'cysaStudyTool';
  const DB_VERSION = 2;
  const SETTINGS_KEY = 'settings';
  const LEGACY_PROGRESS_KEY = 'cysaQuizProgress';
  const MIGRATION_FLAG_KEY = 'cysaStudyToolLegacyMigrated';
  const GAMIFICATION_KEY = 'gamification';

  const DAY_MS = 86400000;
  /** Days until next review after landing in box k (1–6). CDL-style cadence. */
  const BOX_INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14, 6: 30 };

  /** Question `number` fields with assets under images/q{N}.png */
  const QUESTION_IMAGE_IDS = new Set([
    3, 6, 8, 30, 66, 79, 80, 89, 120, 121, 122, 123, 124, 132, 150, 151, 173, 188, 199, 213, 278,
    283, 295, 318, 319, 324, 325, 388, 404
  ]);

  const defaultSettings = () => ({
    theme: 'light',
    fontScale: 1,
    sessionSize: 20,
    rationaleDelay: true,
    practiceSkipSRS: false,
    category: 'general',
    soundEnabled: true
  });

  /** @type {HTMLElement | null} */
  const mainEl = document.getElementById('app-main');

  const state = {
    route: 'home',
    allQuestions: [],
    settings: defaultSettings(),
    cardsCache: new Map(),
    /** Active quiz session */
    session: null,
    /** Current question index in session */
    qIndex: 0,
    /** Answers collected */
    answers: [],
    /** After submit: pending feedback before advancing */
    feedback: null,
    gamification: null,
    blitzTimerId: null
  };

  function questionId(q) {
    return String(q.number);
  }

  function questionHasFigure(q) {
    const n = Number(q.number);
    return Number.isFinite(n) && Number.isInteger(n) && QUESTION_IMAGE_IDS.has(n);
  }

  function appendQuestionFigure(parent, q) {
    if (!questionHasFigure(q)) return;
    const n = Number(q.number);
    const fig = document.createElement('figure');
    fig.className = 'question-figure';
    const img = document.createElement('img');
    img.src = `images/q${n}.png`;
    img.alt = 'Diagram or tool output for this question';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => {
      fig.remove();
    });
    fig.appendChild(img);
    parent.appendChild(fig);
  }

  function isPbqWithoutChoices(q) {
    return !Array.isArray(q.options) || q.options.length === 0;
  }

  function masteryThreshold(question) {
    const ans = String(question.answer || '').trim();
    if (!ans) return 1;
    return ans.split(',').map((s) => s.trim()).filter(Boolean).length;
  }

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function normalizeAnswers(question, letters) {
    const correct = String(question.answer || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .sort();
    const user = letters.map((s) => String(s).trim()).sort();
    return {
      correct,
      user,
      isCorrect: JSON.stringify(correct) === JSON.stringify(user)
    };
  }

  function isNemesis(card) {
    if (!card) return false;
    const attempts = card.attempts || 0;
    const correctAnswers = card.correctAnswers || 0;
    return attempts - correctAnswers >= 3;
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#111827');
  }

  function applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', String(scale || 1));
  }

  // --- Gamification (XP, badges, arcade, audio) ---

  function defaultGamification() {
    return {
      xp: 0,
      lifetimeSessions: 0,
      badges: {},
      streakCount: 0,
      lastStreakDay: null,
      freezeCharges: 1,
      freezeWeekKey: '',
      dailyBonusDate: null,
      blitzHigh: 0,
      endlessHigh: 0,
      blitzScores: [],
      endlessScores: []
    };
  }

  async function loadGamification(db) {
    const row = await idbGet(db, 'kv', GAMIFICATION_KEY);
    return { ...defaultGamification(), ...(row || {}) };
  }

  async function saveGamification(db, g) {
    await idbPutKeyed(db, 'kv', GAMIFICATION_KEY, g);
    state.gamification = g;
  }

  function calendarDayKey(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  function calendarDaysBetween(aKey, bKey) {
    const [ay, am, ad] = aKey.split('-').map(Number);
    const [by, bm, bd] = bKey.split('-').map(Number);
    const da = new Date(ay, am, ad);
    const db = new Date(by, bm, bd);
    return Math.round((db - da) / DAY_MS);
  }

  function isoWeekKey(ts = Date.now()) {
    const d = new Date(ts);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - day);
    const y = d.getFullYear();
    const z = new Date(y, 0, 1);
    const w = Math.ceil(((d - z) / DAY_MS + z.getDay() + 1) / 7);
    return `${y}-W${String(w).padStart(2, '0')}`;
  }

  function maybeGrantWeeklyFreeze(g) {
    const wk = isoWeekKey();
    if (g.freezeWeekKey !== wk) {
      g.freezeWeekKey = wk;
      g.freezeCharges = Math.min((g.freezeCharges || 0) + 1, 2);
    }
  }

  function updateStreakOnSessionComplete(g) {
    const today = calendarDayKey();
    if (g.lastStreakDay === today) return;
    const last = g.lastStreakDay;
    if (!last) {
      g.lastStreakDay = today;
      g.streakCount = 1;
      return;
    }
    const diff = calendarDaysBetween(last, today);
    if (diff === 1) {
      g.streakCount = (g.streakCount || 0) + 1;
    } else if (diff === 2 && (g.freezeCharges || 0) > 0) {
      g.freezeCharges--;
      g.streakCount = (g.streakCount || 0) + 1;
    } else if (diff > 1) {
      g.streakCount = 1;
    }
    g.lastStreakDay = today;
  }

  function xpThresholdForLevel(level) {
    return Math.floor(200 + (level - 1) * 220 + Math.pow(level - 1, 1.8) * 15);
  }

  function levelFromXp(xp) {
    let level = 1;
    let spent = 0;
    while (spent + xpThresholdForLevel(level) <= xp) {
      spent += xpThresholdForLevel(level);
      level++;
    }
    const need = xpThresholdForLevel(level);
    const prog = need ? ((xp - spent) / need) * 100 : 100;
    const titles = [
      'Trainee',
      'Analyst I',
      'Analyst II',
      'Senior analyst',
      'Principal hunter',
      'SOC lead',
      'Incident commander'
    ];
    const title = titles[Math.min(level - 1, titles.length - 1)];
    return { level, title, spent, need, progress: Math.min(100, Math.max(0, prog)) };
  }

  function seededShuffle(arr, seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    let state = h >>> 0;
    const rnd = () => {
      state = Math.imul(state + 0x6d2b79f5, 1) >>> 0;
      return (state & 0xffffff) / 0xffffff;
    };
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function dailyChallengeSeed() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function mcqOnlyPool(questions) {
    return questions.filter((q) => !isPbqWithoutChoices(q) && String(q.answer || '').trim());
  }

  function pickDailyQuestions(pool, n = 5) {
    const usable = mcqOnlyPool(pool);
    if (!usable.length) return [];
    const seed = dailyChallengeSeed() + '|' + state.settings.category;
    const shuffled = seededShuffle(usable, seed);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  let audioCtx = null;
  function playSound(kind) {
    if (!state.settings.soundEnabled) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      if (kind === 'correct') {
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        o.start(now);
        o.stop(now + 0.16);
      } else if (kind === 'wrong') {
        o.type = 'square';
        o.frequency.value = 140;
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        o.start(now);
        o.stop(now + 0.23);
      } else if (kind === 'badge') {
        o.frequency.value = 523;
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        o.start(now);
        o.stop(now + 0.36);
      } else if (kind === 'streak') {
        o.frequency.value = 660;
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o.start(now);
        o.stop(now + 0.13);
      }
    } catch {
      /* ignore */
    }
  }

  function showToast(text, isBadge = false) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = `toast${isBadge ? ' badge-toast' : ''}`;
    t.textContent = text;
    stack.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.35s ease';
      setTimeout(() => t.remove(), 380);
    }, 2800);
  }

  function triggerConfetti() {
    const root = document.getElementById('confetti-root');
    if (!root) return;
    root.innerHTML = '';
    root.classList.add('active');
    const colors = ['#22d3ee', '#22c55e', '#facc15', '#f43f5e', '#a78bfa'];
    for (let i = 0; i < 48; i++) {
      const s = document.createElement('span');
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = '-8px';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = `${Math.random() * 0.4}s`;
      root.appendChild(s);
    }
    setTimeout(() => {
      root.classList.remove('active');
      root.innerHTML = '';
    }, 2400);
  }

  function pushTopScore(arr, value, max = 5) {
    if (!Array.isArray(arr)) return;
    arr.push({ v: value, t: Date.now() });
    arr.sort((a, b) => b.v - a.v);
    arr.length = Math.min(arr.length, max);
  }

  const BADGE_DEFS = [
    { id: 'rookie', emoji: '📋', title: 'Case opened', desc: 'Finish any session.', check: (c) => c.lifetimeSessions >= 1 },
    { id: 'xp500', emoji: '⚡', title: 'Voltage up', desc: 'Reach 500 XP.', check: (c) => c.xp >= 500 },
    { id: 'xp2k', emoji: '🎯', title: 'Sharp eye', desc: 'Reach 2000 XP.', check: (c) => c.xp >= 2000 },
    { id: 'streak7', emoji: '🔥', title: 'Week warrior', desc: '7-day streak.', check: (c) => c.streakCount >= 7 },
    { id: 'streak30', emoji: '🏆', title: 'Unstoppable', desc: '30-day streak.', check: (c) => c.streakCount >= 30 },
    { id: 'perfect', emoji: '💎', title: 'Flawless case', desc: 'Perfect graded session.', check: (c) => c.sessionPerfect },
    { id: 'nemesis', emoji: '⚔️', title: 'Nemesis down', desc: 'Correct a nemesis card.', check: (c) => c.nemesisBeat },
    { id: 'daily', emoji: '📅', title: 'Daily op', desc: 'Complete daily challenge.', check: (c) => c.dailyDone },
    { id: 'blitz15', emoji: '⏱️', title: 'Blitz runner', desc: '15+ correct in blitz.', check: (c) => c.blitzHigh >= 15 },
    { id: 'blitz28', emoji: '🚀', title: 'Blitz ace', desc: '28+ correct in blitz.', check: (c) => c.blitzHigh >= 28 },
    { id: 'endless8', emoji: '🧠', title: 'Iron focus', desc: '8+ endless streak.', check: (c) => c.endlessHigh >= 8 },
    { id: 'endless15', emoji: '👑', title: 'Legend run', desc: '15+ endless streak.', check: (c) => c.endlessHigh >= 15 },
    { id: 'mastery50', emoji: '📊', title: 'Half mastery', desc: '50%+ mastery (pool).', check: (c) => c.masteryPct >= 50 },
    { id: 'sessions25', emoji: '🗂️', title: 'Archivist', desc: 'Close 25 sessions.', check: (c) => c.lifetimeSessions >= 25 }
  ];

  function unlockBadges(g, ctx) {
    const unlocked = [];
    const now = Date.now();
    if (!g.badges) g.badges = {};
    for (const b of BADGE_DEFS) {
      if (g.badges[b.id]) continue;
      if (b.check(ctx)) {
        g.badges[b.id] = now;
        unlocked.push(b);
      }
    }
    return unlocked;
  }

  async function hydrateGamification(db) {
    state.gamification = await loadGamification(db);
    maybeGrantWeeklyFreeze(state.gamification);
    await saveGamification(db, state.gamification);
  }

  function useStreakFreezeFromHome() {
    void (async () => {
      const db = await ensureDb();
      const g = await loadGamification(db);
      maybeGrantWeeklyFreeze(g);
      if ((g.freezeCharges || 0) < 1) {
        showToast('No streak freezes available.');
        return;
      }
      const today = calendarDayKey();
      const last = g.lastStreakDay;
      if (!last) {
        showToast('Start a streak first.');
        return;
      }
      const diff = calendarDaysBetween(last, today);
      if (diff === 1 || diff === 0) {
        showToast('Streak is already safe today.');
        return;
      }
      if (diff === 2) {
        g.freezeCharges--;
        g.lastStreakDay = today;
        g.streakCount = (g.streakCount || 0) + 1;
        await saveGamification(db, g);
        playSound('streak');
        showToast('Freeze used — streak preserved!');
        navigate('home');
        return;
      }
      showToast('Freeze only bridges one missed day.');
    })();
  }

  // --- IndexedDB ---

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = (event) => {
        const db = req.result;
        const from = event.oldVersion;
        if (from < 1) {
          db.createObjectStore('kv');
          db.createObjectStore('cards', { keyPath: 'id' });
          db.createObjectStore('sessions', { autoIncrement: true });
        }
        if (from < 2 && db.objectStoreNames.contains('kv')) {
          db.deleteObjectStore('kv');
          db.createObjectStore('kv');
        }
      };
      req.onsuccess = () => resolve(req.result);
    });
  }

  async function idbGet(db, storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }

  async function idbPut(db, storeName, value) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(storeName).put(value);
    });
  }

  async function idbPutKeyed(db, storeName, key, value) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(storeName).put(value, key);
    });
  }

  async function loadAllCards(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cards', 'readonly');
      const req = tx.objectStore('cards').getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const map = new Map();
        for (const row of req.result || []) {
          map.set(row.id, row);
        }
        resolve(map);
      };
    });
  }

  async function saveCard(db, card) {
    await idbPut(db, 'cards', card);
    state.cardsCache.set(card.id, card);
  }

  async function loadSettings(db) {
    const row = await idbGet(db, 'kv', SETTINGS_KEY);
    return { ...defaultSettings(), ...(row || {}) };
  }

  async function saveSettings(db, s) {
    await idbPutKeyed(db, 'kv', SETTINGS_KEY, s);
  }

  async function logSession(db, rec) {
    await idbPut(db, 'sessions', rec);
  }

  async function loadSessions(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sessions', 'readonly');
      const req = tx.objectStore('sessions').getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result || []);
    });
  }

  async function migrateLegacyIfNeeded(db, questions) {
    if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;
    let raw = null;
    try {
      raw = localStorage.getItem(LEGACY_PROGRESS_KEY);
    } catch {
      return;
    }
    if (!raw) {
      localStorage.setItem(MIGRATION_FLAG_KEY, '1');
      return;
    }
    let legacy = {};
    try {
      legacy = JSON.parse(raw);
    } catch {
      localStorage.setItem(MIGRATION_FLAG_KEY, '1');
      return;
    }
    const now = Date.now();
    for (const q of questions) {
      const id = questionId(q);
      const entry = legacy[id];
      if (!entry) continue;
      const threshold = masteryThreshold(q);
      const attempts = entry.attempts || 0;
      const correctCount = entry.correctCount || 0;
      let card;
      if (correctCount >= threshold) {
        card = {
          id,
          box: 6,
          nextReview: now + BOX_INTERVAL_DAYS[6] * DAY_MS,
          attempts,
          correctAnswers: correctCount
        };
      } else if (attempts > 0) {
        const box = Math.min(5, Math.max(1, correctCount + 1));
        card = {
          id,
          box,
          nextReview: now + BOX_INTERVAL_DAYS[box] * DAY_MS,
          attempts,
          correctAnswers: correctCount
        };
      }
      if (card) await idbPut(db, 'cards', card);
    }
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  }

  /** Leitner grade: returns new card row */
  function gradeCard(prev, correct) {
    const attempts = (prev?.attempts || 0) + 1;
    const correctAnswers = (prev?.correctAnswers || 0) + (correct ? 1 : 0);
    const now = Date.now();

    if (!correct) {
      const box = 1;
      return {
        id: prev?.id,
        box,
        nextReview: now + BOX_INTERVAL_DAYS[1] * DAY_MS,
        attempts,
        correctAnswers
      };
    }

    let box = prev?.box ?? 0;
    if (box <= 0) box = 2;
    else if (box >= 6) box = 6;
    else box += 1;

    const intervalDays = BOX_INTERVAL_DAYS[box];
    return {
      id: prev?.id,
      box,
      nextReview: now + intervalDays * DAY_MS,
      attempts,
      correctAnswers
    };
  }

  function filterByCategory(questions, cat) {
    if (cat === 'acronym') return questions.filter((q) => q.category === 'acronym');
    if (cat === 'general') return questions.filter((q) => q.category === 'general');
    return questions;
  }

  /**
   * Smart session: due reviews first (most overdue), then unseen/new, fill remainder with random non-mastered.
   */
  function buildSmartSession(questions, cardsMap, sessionSize) {
    const now = Date.now();
    const due = [];
    const unseen = [];
    const backlog = [];

    for (const q of questions) {
      const id = questionId(q);
      const c = cardsMap.get(id);
      if (c && c.box >= 6 && c.nextReview > now) continue;

      if (!c) {
        unseen.push(q);
        continue;
      }
      if (c.nextReview <= now) {
        due.push({ q, overdue: now - c.nextReview });
      } else if (c.box < 6) {
        backlog.push(q);
      }
    }

    due.sort((a, b) => b.overdue - a.overdue);
    const dueQs = due.map((d) => d.q);
    const pickDue = shuffle(dueQs);
    const pickNew = shuffle(unseen);
    const session = [];
    const seen = new Set();

    for (const q of pickDue) {
      if (session.length >= sessionSize) break;
      session.push(q);
      seen.add(questionId(q));
    }
    for (const q of pickNew) {
      if (session.length >= sessionSize) break;
      const id = questionId(q);
      if (seen.has(id)) continue;
      session.push(q);
      seen.add(id);
    }
    const filler = shuffle(backlog.filter((q) => !seen.has(questionId(q))));
    for (const q of filler) {
      if (session.length >= sessionSize) break;
      session.push(q);
      seen.add(questionId(q));
    }
    return session;
  }

  function buildRandomSession(questions, count) {
    const pool = shuffle(questions);
    return pool.slice(0, Math.min(count, pool.length));
  }

  /** Streak: consecutive local calendar days with at least one completed session */
  function calcStreak(sessions) {
    if (!sessions.length) return 0;
    const days = new Set(
      sessions.map((s) => {
        const d = new Date(s.endedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
    let streak = 0;
    const today = new Date();
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayKey = (dt) => `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function aggregateStats(questions, cardsMap, category) {
    const list = filterByCategory(questions, category);
    const now = Date.now();
    let total = list.length;
    let mastered = 0;
    let due = 0;
    let unseen = 0;

    for (const q of list) {
      const id = questionId(q);
      const c = cardsMap.get(id);
      if (!c) {
        unseen++;
        continue;
      }
      if (c.box >= 6 && c.nextReview > now) mastered++;
      if (c.nextReview <= now) due++;
    }

    const touched = total - unseen;
    const masteryPct = touched ? Math.round((mastered / touched) * 100) : 0;
    return { total, mastered, due, unseen, masteryPct };
  }

  /** @type {IDBDatabase | null} */
  let dbInstance = null;

  async function ensureDb() {
    if (!dbInstance) dbInstance = await openDb();
    return dbInstance;
  }

  async function refreshCardsCache() {
    const db = await ensureDb();
    state.cardsCache = await loadAllCards(db);
  }

  function setRoute(route) {
    state.route = route;
    document.querySelectorAll('.bottom-nav .nav-btn').forEach((btn) => {
      const r = btn.getAttribute('data-route');
      const active = r === route;
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function navigate(route) {
    setRoute(route);
    if (route === 'home') return renderHome();
    if (route === 'study') return renderStudyLobby();
    if (route === 'progress') return renderProgress();
    if (route === 'settings') return renderSettings();
    renderHome();
  }

  function emptyMain() {
    if (!mainEl) return;
    mainEl.innerHTML = '';
  }

  async function renderHome() {
    emptyMain();
    await refreshCardsCache();
    const db = await ensureDb();
    state.gamification = await loadGamification(db);
    maybeGrantWeeklyFreeze(state.gamification);
    await saveGamification(db, state.gamification);

    const cat = state.settings.category;
    const stats = aggregateStats(state.allQuestions, state.cardsCache, cat);
    const sessions = await loadSessions(db);
    const sessionStreak = calcStreak(sessions);
    const g = state.gamification;
    const lv = levelFromXp(g.xp || 0);
    const streakShow = Math.max(g.streakCount || 0, sessionStreak);
    const dailyDone = g.dailyBonusDate === calendarDayKey();

    const hero = document.createElement('section');
    hero.className = 'panel hero';
    hero.innerHTML = `
      <h2 class="panel-title">Ops desk</h2>
      <div class="xp-panel">
        <div class="xp-row">
          <span class="rank-title">${lv.title} · Lvl ${lv.level}</span>
          <span class="muted small">${g.xp || 0} XP</span>
        </div>
        <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${lv.progress}%"></div></div>
        <div class="freeze-row">
          <span class="muted small">Streak freezes: <strong>${g.freezeCharges ?? 0}</strong></span>
          <button type="button" class="btn secondary small-btn" id="cta-freeze">Use freeze</button>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-chip"><span class="stat-value">${stats.due}</span><span class="stat-label">Due now</span></div>
        <div class="stat-chip"><span class="stat-value">${stats.unseen}</span><span class="stat-label">New</span></div>
        <div class="stat-chip accent"><span class="stat-value">${stats.masteryPct}%</span><span class="stat-label">Mastery*</span></div>
        <div class="stat-chip"><span class="stat-value">${streakShow}</span><span class="stat-label">Streak</span></div>
      </div>
      <p class="muted small">*Among questions you have attempted at least once (current pool filter).</p>
      <p class="muted small">${dailyDone ? '✓ Daily op bonus claimed today — run again for practice.' : 'Daily op: seeded challenge — bonus XP on first completion today.'}</p>
      <div class="hero-actions">
        <button type="button" class="btn primary large" id="cta-smart">Smart Review (${Math.min(state.settings.sessionSize, stats.total)}) cards</button>
        <button type="button" class="btn ghost" id="cta-quiz">Quick quiz (10)</button>
        <button type="button" class="btn secondary" id="cta-daily">Daily op (5)</button>
        <button type="button" class="btn secondary" id="cta-blitz">60s blitz</button>
        <button type="button" class="btn secondary" id="cta-endless">Endless run</button>
      </div>
    `;

    const summary = document.createElement('section');
    summary.className = 'panel';
    summary.innerHTML = `
      <h2 class="panel-title">Pool summary</h2>
      <ul class="kv-list">
        <li><span>Total in filter</span><strong>${stats.total}</strong></li>
        <li><span>Mastered (box 6, not due)</span><strong>${stats.mastered}</strong></li>
        <li><span>Remaining to first mastery</span><strong>${stats.total - stats.mastered}</strong></li>
      </ul>
      <p class="muted small">Spaced repetition uses six Leitner boxes with review intervals of roughly 0, 1, 3, 7, 14, and 30 days.</p>
    `;

    mainEl.appendChild(hero);
    mainEl.appendChild(summary);

    hero.querySelector('#cta-smart').addEventListener('click', () => startSmartReview());
    hero.querySelector('#cta-quiz').addEventListener('click', () => startQuickQuiz(10));
    hero.querySelector('#cta-daily').addEventListener('click', () => void startDailyChallenge());
    hero.querySelector('#cta-blitz').addEventListener('click', () => void startBlitz());
    hero.querySelector('#cta-endless').addEventListener('click', () => void startEndless());
    hero.querySelector('#cta-freeze').addEventListener('click', () => useStreakFreezeFromHome());
  }

  async function renderStudyLobby() {
    emptyMain();
    await refreshCardsCache();
    const cat = state.settings.category;
    const stats = aggregateStats(state.allQuestions, state.cardsCache, cat);
    const pool = filterByCategory(state.allQuestions, cat);

    const wrap = document.createElement('div');
    wrap.className = 'stack';

    const modes = document.createElement('section');
    modes.className = 'panel';
    modes.innerHTML = `
      <h2 class="panel-title">Study modes</h2>
      <p class="muted">Sessions respect your pool filter in Settings (<strong>${cat}</strong>). Due reviews are prioritized in Smart Review.</p>
      <div class="mode-grid">
        <article class="mode-card">
          <h3>Smart Review</h3>
          <p class="muted small">Due cards first (most overdue), then new questions, up to your session size.</p>
          <button type="button" class="btn primary" id="mode-smart">Start (${Math.min(state.settings.sessionSize, pool.length)})</button>
        </article>
        <article class="mode-card">
          <h3>Quick quiz</h3>
          <p class="muted small">Ten random questions from the pool. Toggle “practice-only” in Settings to skip SRS updates.</p>
          <button type="button" class="btn secondary" id="mode-quick">Start (10)</button>
        </article>
        <article class="mode-card">
          <h3>Practice test</h3>
          <p class="muted small">Larger random set for endurance (${Math.min(50, pool.length)} max).</p>
          <button type="button" class="btn secondary" id="mode-practice">Start (${Math.min(50, pool.length)})</button>
        </article>
      </div>
      <h3 class="panel-subtitle" style="margin-top:1rem">Arcade & daily</h3>
      <div class="arcade-grid">
        <article class="arcade-card">
          <h3>Daily op</h3>
          <p class="muted small">Same seeded 5 questions all day. Bonus XP on first completion today.</p>
          <button type="button" class="btn primary" id="arc-daily">Start daily op</button>
        </article>
        <article class="arcade-card">
          <h3>60s blitz</h3>
          <p class="muted small">Answer fast — score is how many you get right before time runs out.</p>
          <button type="button" class="btn secondary" id="arc-blitz">Start blitz</button>
        </article>
        <article class="arcade-card">
          <h3>Endless run</h3>
          <p class="muted small">One wrong answer ends the run. Beat your best streak.</p>
          <button type="button" class="btn secondary" id="arc-endless">Start endless</button>
        </article>
      </div>
    `;

    const tip = document.createElement('section');
    tip.className = 'panel subtle';
    tip.innerHTML = `
      <h3 class="panel-subtitle">Tips</h3>
      <ul class="bullet-list">
        <li>Questions tagged as <strong>nemesis</strong> have enough misses versus successes that they deserve extra care.</li>
        <li>Use Settings to reveal rationales right after you grade each card or only on the results screen.</li>
        <li>Streaks count completed sessions per calendar day (local time).</li>
      </ul>
    `;

    wrap.appendChild(modes);
    wrap.appendChild(tip);
    mainEl.appendChild(wrap);

    modes.querySelector('#mode-smart').addEventListener('click', () => startSmartReview());
    modes.querySelector('#mode-quick').addEventListener('click', () => startQuickQuiz(10));
    modes.querySelector('#mode-practice').addEventListener('click', () =>
      startPractice(Math.min(50, pool.length))
    );
    modes.querySelector('#arc-daily').addEventListener('click', () => void startDailyChallenge());
    modes.querySelector('#arc-blitz').addEventListener('click', () => void startBlitz());
    modes.querySelector('#arc-endless').addEventListener('click', () => void startEndless());
  }

  async function renderProgress() {
    emptyMain();
    await refreshCardsCache();
    const cat = state.settings.category;
    const stats = aggregateStats(state.allQuestions, state.cardsCache, cat);
    const sessions = await loadSessions(await ensureDb());
    const streak = calcStreak(sessions);
    const sorted = sessions.slice().sort((a, b) => b.endedAt - a.endedAt);
    const recent = sorted.slice(0, 12);

    let nemesisCount = 0;
    const pool = filterByCategory(state.allQuestions, cat);
    for (const q of pool) {
      const c = state.cardsCache.get(questionId(q));
      if (isNemesis(c)) nemesisCount++;
    }

    const section = document.createElement('section');
    section.className = 'panel';
    section.innerHTML = `
      <h2 class="panel-title">Progress</h2>
      <div class="hero-stats">
        <div class="stat-chip"><span class="stat-value">${sessions.length}</span><span class="stat-label">Sessions</span></div>
        <div class="stat-chip"><span class="stat-value">${streak}</span><span class="stat-label">Streak</span></div>
        <div class="stat-chip warn"><span class="stat-value">${nemesisCount}</span><span class="stat-label">Nemesis*</span></div>
        <div class="stat-chip accent"><span class="stat-value">${stats.masteryPct}%</span><span class="stat-label">Mastery</span></div>
      </div>
      <p class="muted small">*Nemesis: at least three more incorrect attempts than correct attempts on a question.</p>
      <h3 class="panel-subtitle">Recent sessions</h3>
    `;

    const table = document.createElement('div');
    table.className = 'session-table-wrap';
    if (!recent.length) {
      table.innerHTML = '<p class="muted">Complete a session to see history here.</p>';
    } else {
      const rows = recent
        .map(
          (s) => `
        <div class="session-row">
          <span>${new Date(s.endedAt).toLocaleString()}</span>
          <span class="badge">${s.mode}</span>
          <span><strong>${s.correct}</strong> / ${s.total}</span>
          <span class="muted">${s.updatedSRS ? 'SRS on' : 'Practice'}</span>
        </div>`
        )
        .join('');
      table.innerHTML = `<div class="session-table">${rows}</div>`;
    }

    mainEl.appendChild(section);
    section.appendChild(table);

    const dbp = await ensureDb();
    const gb = await loadGamification(dbp);
    const gs = Math.max(gb.streakCount || 0, streak);

    const badgesPanel = document.createElement('section');
    badgesPanel.className = 'panel';
    badgesPanel.innerHTML = `<h3 class="panel-subtitle">Badge shelf</h3><p class="muted small">${gb.xp || 0} XP · Best blitz ${gb.blitzHigh || 0} · Best endless ${gb.endlessHigh || 0} · Ops streak ${gs}</p>`;
    const grid = document.createElement('div');
    grid.className = 'badge-grid';
    for (const b of BADGE_DEFS) {
      const earned = !!(gb.badges && gb.badges[b.id]);
      const tile = document.createElement('div');
      tile.className = `badge-tile${earned ? ' earned' : ''}`;
      tile.innerHTML = `<span class="emoji">${b.emoji}</span><strong>${b.title}</strong><div>${b.desc}</div>`;
      grid.appendChild(tile);
    }
    badgesPanel.appendChild(grid);
    mainEl.appendChild(badgesPanel);

    const lb = document.createElement('section');
    lb.className = 'panel';
    const blitzTop = (gb.blitzScores || []).map((x, i) => `<div class="leader-row"><span>Blitz #${i + 1}</span><strong>${x.v}</strong></div>`).join('');
    const endTop = (gb.endlessScores || []).map((x, i) => `<div class="leader-row"><span>Endless #${i + 1}</span><strong>${x.v}</strong></div>`).join('');
    lb.innerHTML = `
      <h3 class="panel-subtitle">Local leaderboard (this device)</h3>
      <p class="muted small">Top blitz scores (correct in 60s) and endless streaks.</p>
      <div class="leader-list">${blitzTop || '<p class="muted">No blitz scores yet.</p>'}</div>
      <div class="leader-list" style="margin-top:0.75rem">${endTop || '<p class="muted">No endless runs yet.</p>'}</div>
    `;
    mainEl.appendChild(lb);
  }

  async function renderSettings() {
    emptyMain();
    const s = state.settings;
    const section = document.createElement('section');
    section.className = 'panel';
    section.innerHTML = `
      <h2 class="panel-title">Settings</h2>
      <div class="form-stack">
        <label class="field">
          <span>Question pool</span>
          <select id="set-category">
            <option value="general">General</option>
            <option value="acronym">Acronyms</option>
            <option value="both">Both</option>
          </select>
        </label>
        <label class="field">
          <span>Theme</span>
          <select id="set-theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label class="field">
          <span>Font size</span>
          <input type="range" id="set-font" min="0.85" max="1.25" step="0.05" value="${s.fontScale}" />
        </label>
        <label class="field">
          <span>Smart Review session size</span>
          <input type="number" id="set-session" min="5" max="80" value="${s.sessionSize}" />
        </label>
        <label class="toggle">
          <input type="checkbox" id="set-rationale" ${s.rationaleDelay ? '' : 'checked'} />
          <span>Show rationale immediately after each question</span>
        </label>
        <label class="toggle">
          <input type="checkbox" id="set-practice" ${s.practiceSkipSRS ? 'checked' : ''} />
          <span>Practice-only for Quick / Practice tests (skip SRS updates)</span>
        </label>
        <label class="toggle">
          <input type="checkbox" id="set-sound" ${s.soundEnabled !== false ? 'checked' : ''} />
          <span>Sound effects (XP, badges, answers)</span>
        </label>
        <div class="danger-zone">
          <h3 class="panel-subtitle">Data</h3>
          <p class="muted small">Clears spaced repetition state, session history, and settings on this device.</p>
          <button type="button" class="btn danger" id="btn-reset">Reset all progress</button>
        </div>
      </div>
    `;
    mainEl.appendChild(section);

    section.querySelector('#set-category').value = s.category;
    section.querySelector('#set-theme').value = s.theme;

    section.querySelector('#set-category').addEventListener('change', async (e) => {
      state.settings.category = e.target.value;
      await saveSettings(await ensureDb(), state.settings);
    });
    section.querySelector('#set-theme').addEventListener('change', async (e) => {
      state.settings.theme = e.target.value;
      applyTheme(state.settings.theme);
      await saveSettings(await ensureDb(), state.settings);
    });
    section.querySelector('#set-font').addEventListener('input', async (e) => {
      state.settings.fontScale = parseFloat(e.target.value);
      applyFontScale(state.settings.fontScale);
      await saveSettings(await ensureDb(), state.settings);
    });
    section.querySelector('#set-session').addEventListener('change', async (e) => {
      let n = parseInt(e.target.value, 10);
      if (Number.isNaN(n)) n = 20;
      state.settings.sessionSize = Math.min(80, Math.max(5, n));
      e.target.value = state.settings.sessionSize;
      await saveSettings(await ensureDb(), state.settings);
    });
    section.querySelector('#set-rationale').addEventListener('change', async (e) => {
      state.settings.rationaleDelay = !e.target.checked;
      await saveSettings(await ensureDb(), state.settings);
    });
    section.querySelector('#set-practice').addEventListener('change', async (e) => {
      state.settings.practiceSkipSRS = e.target.checked;
      await saveSettings(await ensureDb(), state.settings);
    });
    section.querySelector('#set-sound').addEventListener('change', async (e) => {
      state.settings.soundEnabled = e.target.checked;
      await saveSettings(await ensureDb(), state.settings);
    });

    section.querySelector('#btn-reset').addEventListener('click', async () => {
      if (!confirm('Reset all saved progress, sessions, and settings on this device?')) return;
      await resetAllData();
      await bootstrapSettings();
      navigate('home');
    });
  }

  async function resetAllData() {
    const db = await ensureDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['cards', 'sessions', 'kv'], 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore('cards').clear();
      tx.objectStore('sessions').clear();
      tx.objectStore('kv').clear();
    });
    try {
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
      localStorage.removeItem(MIGRATION_FLAG_KEY);
    } catch {
      /* ignore */
    }
    state.cardsCache = new Map();
  }

  async function bootstrapSettings() {
    const db = await ensureDb();
    state.settings = await loadSettings(db);
    applyTheme(state.settings.theme);
    applyFontScale(state.settings.fontScale);
    await saveSettings(db, state.settings);
  }

  async function startSmartReview() {
    await refreshCardsCache();
    const pool = filterByCategory(state.allQuestions, state.settings.category);
    const session = buildSmartSession(pool, state.cardsCache, state.settings.sessionSize);
    if (!session.length) {
      alert('Nothing to review right now. Try widening your pool or resetting filters.');
      return;
    }
    beginSession(session, { mode: 'smart', affectsSRS: true });
  }

  async function startQuickQuiz(n) {
    await refreshCardsCache();
    const pool = filterByCategory(state.allQuestions, state.settings.category);
    const session = buildRandomSession(pool, n);
    if (!session.length) {
      alert('No questions available for this pool.');
      return;
    }
    const affectsSRS = !state.settings.practiceSkipSRS;
    beginSession(session, { mode: 'quick', affectsSRS });
  }

  async function startPractice(n) {
    await refreshCardsCache();
    const pool = filterByCategory(state.allQuestions, state.settings.category);
    const session = buildRandomSession(pool, n);
    if (!session.length) {
      alert('No questions available for this pool.');
      return;
    }
    const affectsSRS = !state.settings.practiceSkipSRS;
    beginSession(session, { mode: 'practice', affectsSRS });
  }

  async function startDailyChallenge() {
    await refreshCardsCache();
    const pool = filterByCategory(state.allQuestions, state.settings.category);
    const qs = pickDailyQuestions(pool, 5);
    if (qs.length < 3) {
      alert('Not enough multiple-choice items in this pool for a daily run.');
      return;
    }
    beginSession(qs, { mode: 'daily', affectsSRS: false });
  }

  async function startBlitz() {
    await refreshCardsCache();
    const pool = mcqOnlyPool(filterByCategory(state.allQuestions, state.settings.category));
    if (pool.length < 5) {
      alert('Not enough questions for blitz.');
      return;
    }
    const shuffled = shuffle(pool).slice(0, Math.min(90, pool.length));
    beginSession(shuffled, { mode: 'blitz', affectsSRS: false });
  }

  async function startEndless() {
    await refreshCardsCache();
    const pool = mcqOnlyPool(filterByCategory(state.allQuestions, state.settings.category));
    if (!pool.length) {
      alert('No eligible questions.');
      return;
    }
    const shuffled = shuffle(pool).slice(0, Math.min(120, pool.length));
    beginSession(shuffled, { mode: 'endless', affectsSRS: false });
  }

  function modeLabel(mode) {
    const map = {
      smart: 'Smart review',
      quick: 'Quick quiz',
      practice: 'Practice test',
      daily: 'Daily op',
      blitz: '60s blitz',
      endless: 'Endless'
    };
    return map[mode] || mode;
  }

  function beginSession(questions, meta) {
    hideNav(true);
    if (state.blitzTimerId) {
      clearInterval(state.blitzTimerId);
      state.blitzTimerId = null;
    }
    state.session = { questions, meta, startedAt: Date.now() };
    state.qIndex = 0;
    state.answers = [];
    state.feedback = null;

    if (meta.mode === 'blitz') {
      state.session.blitzEndsAt = Date.now() + 60000;
      state.blitzTimerId = setInterval(() => {
        if (!state.session || state.session.meta.mode !== 'blitz') {
          clearInterval(state.blitzTimerId);
          state.blitzTimerId = null;
          return;
        }
        const el = document.getElementById('blitz-timer');
        const left = Math.max(0, Math.ceil((state.session.blitzEndsAt - Date.now()) / 1000));
        if (el) el.textContent = String(left);
        document.querySelector('.blitz-bar')?.classList.toggle('danger', left <= 10);
        if (Date.now() >= state.session.blitzEndsAt) {
          clearInterval(state.blitzTimerId);
          state.blitzTimerId = null;
          void finishSession();
        }
      }, 250);
    }

    renderQuestionView();
  }

  function hideNav(hidden) {
    document.querySelector('.bottom-nav')?.classList.toggle('hidden', hidden);
    document.querySelector('.site-footer')?.classList.toggle('hidden', hidden);
  }

  function renderQuestionView() {
    emptyMain();
    const session = state.session;
    if (!session) return navigate('home');

    if (session.meta.mode === 'blitz' && session.blitzEndsAt && Date.now() >= session.blitzEndsAt) {
      void finishSession();
      return;
    }

    const total = session.questions.length;
    const idx = state.qIndex;
    const q = session.questions[idx];
    const id = questionId(q);
    const card = state.cardsCache.get(id);
    const nemesis = isNemesis(card);

    const wrap = document.createElement('div');
    wrap.className = 'quiz-layout';

    const header = document.createElement('div');
    header.className = 'quiz-header-row';
    const completed = state.feedback ? idx + 1 : idx;
    const pct = Math.round((completed / total) * 100);
    header.innerHTML = `
      <button type="button" class="btn text" id="btn-abort">Exit</button>
      <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="muted small">${idx + 1}/${total}</span>
    `;

    const cardEl = document.createElement('section');
    cardEl.className = 'panel question-panel';

    const badges = document.createElement('div');
    badges.className = 'chip-row';
    badges.innerHTML = `
      <span class="chip">${q.category === 'acronym' ? 'Acronym' : 'General'}</span>
      ${nemesis ? '<span class="chip danger">Nemesis</span>' : ''}
      <span class="chip subtle">${modeLabel(session.meta.mode)} · ${session.meta.affectsSRS ? 'SRS on' : 'Practice'}</span>
    `;

    const stem = document.createElement('p');
    stem.className = 'question-text';
    stem.textContent = q.question;

    cardEl.appendChild(badges);
    cardEl.appendChild(stem);
    appendQuestionFigure(cardEl, q);

    const answerParts = String(q.answer || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isMulti = answerParts.length > 1;

    let feedbackEl = null;
    const actions = document.createElement('div');
    actions.className = 'quiz-actions';

    if (isPbqWithoutChoices(q)) {
      const note = document.createElement('p');
      note.className = 'muted small';
      note.textContent =
        'Performance-based item: no answer choices in this bank. Review the diagram, then continue (not scored, does not affect SRS).';
      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'btn primary';
      skipBtn.id = 'btn-pbq-continue';
      skipBtn.textContent = idx >= total - 1 ? 'View results' : 'Continue';
      actions.appendChild(skipBtn);
      cardEl.appendChild(note);
      cardEl.appendChild(actions);
    } else {
      const list = document.createElement('ul');
      list.className = `options ${isMulti ? 'multi' : ''}`;
      const groupName = `q-${id}-${idx}`;
      q.options.forEach((opt) => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        input.type = isMulti ? 'checkbox' : 'radio';
        input.name = groupName;
        input.value = opt.letter;
        const oid = `${groupName}-opt-${opt.letter}`;
        input.id = oid;
        const label = document.createElement('label');
        label.setAttribute('for', oid);
        label.textContent = `${opt.letter}. ${opt.text}`;
        li.appendChild(input);
        li.appendChild(label);
        list.appendChild(li);
      });

      if (state.feedback) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-panel ${state.feedback.isCorrect ? 'ok' : 'bad'}`;
        feedbackEl.innerHTML = `
        <strong>${state.feedback.isCorrect ? 'Correct' : 'Incorrect'}</strong>
        <p class="feedback-rationale">${escapeHtml(q.explanation || 'No explanation provided.')}</p>
        <button type="button" class="btn primary" id="btn-next">${idx >= total - 1 ? 'View results' : 'Next question'}</button>
      `;
      } else {
        actions.innerHTML = `<button type="button" class="btn primary" id="btn-submit">Check answer</button>`;
      }

      cardEl.appendChild(list);
      if (feedbackEl) cardEl.appendChild(feedbackEl);
      else cardEl.appendChild(actions);
    }

    wrap.appendChild(header);
    if (session.meta.mode === 'blitz') {
      const bar = document.createElement('div');
      bar.className = 'blitz-bar';
      const left = Math.max(0, Math.ceil(((session.blitzEndsAt || 0) - Date.now()) / 1000));
      bar.innerHTML = `⚡ Blitz · <span id="blitz-timer">${left}</span>s`;
      if (left <= 10) bar.classList.add('danger');
      wrap.appendChild(bar);
    }
    wrap.appendChild(cardEl);
    mainEl.appendChild(wrap);

    header.querySelector('#btn-abort').addEventListener('click', async () => {
      if (confirm('End this session early? Progress for this session will be lost.')) {
        if (state.blitzTimerId) {
          clearInterval(state.blitzTimerId);
          state.blitzTimerId = null;
        }
        state.session = null;
        state.feedback = null;
        hideNav(false);
        navigate('study');
      }
    });

    if (isPbqWithoutChoices(q)) {
      actions.querySelector('#btn-pbq-continue').addEventListener('click', async () => {
        state.answers.push({
          question: q,
          selected: [],
          isCorrect: false,
          graded: false
        });
        if (idx >= total - 1) await finishSession();
        else {
          state.qIndex++;
          renderQuestionView();
        }
      });
    } else if (feedbackEl) {
      feedbackEl.querySelector('#btn-next').addEventListener('click', () => {
        void advanceQuestion(q);
      });
    } else {
      const list = cardEl.querySelector('ul.options');
      actions.querySelector('#btn-submit').addEventListener('click', () => {
        void submitAnswer(q, list);
      });
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function submitAnswer(q, list) {
    const session = state.session;
    if (!session) return;

    const selected = [];
    list.querySelectorAll('input').forEach((inp) => {
      if (inp.checked) selected.push(inp.value);
    });
    if (!selected.length) {
      alert('Select at least one answer.');
      return;
    }
    const { isCorrect } = normalizeAnswers(q, selected);

    if (session.meta.mode === 'blitz') {
      state.answers.push({ question: q, selected, isCorrect, graded: true });
      playSound(isCorrect ? 'correct' : 'wrong');
      if (session.blitzEndsAt && Date.now() >= session.blitzEndsAt) {
        await finishSession();
        return;
      }
      if (state.qIndex >= session.questions.length - 1) {
        await finishSession();
        return;
      }
      state.qIndex++;
      renderQuestionView();
      return;
    }

    if (session.meta.mode === 'endless' && !isCorrect) {
      state.answers.push({ question: q, selected, isCorrect, graded: true });
      playSound('wrong');
      await finishSession();
      return;
    }

    const instant = !state.settings.rationaleDelay || session.meta.mode === 'daily';
    if (instant) {
      state.answers.push({ question: q, selected, isCorrect, graded: true });
      playSound(isCorrect ? 'correct' : 'wrong');
      state.feedback = null;
      await advanceAfterAnswer();
      return;
    }

    state.feedback = { isCorrect, selected };
    renderQuestionView();
  }

  async function advanceAfterAnswer() {
    const session = state.session;
    if (!session) return;
    if (state.qIndex >= session.questions.length - 1) {
      await finishSession();
      return;
    }
    state.qIndex++;
    renderQuestionView();
  }

  async function advanceQuestion(q) {
    const session = state.session;
    if (!session) return;

    if (state.feedback) {
      const wasWrong = !state.feedback.isCorrect;
      state.answers.push({
        question: q,
        selected: state.feedback.selected,
        isCorrect: state.feedback.isCorrect,
        graded: true
      });
      playSound(state.feedback.isCorrect ? 'correct' : 'wrong');
      state.feedback = null;

      if (session.meta.mode === 'endless' && wasWrong) {
        await finishSession();
        return;
      }
    }

    if (state.qIndex >= session.questions.length - 1) {
      await finishSession();
      return;
    }
    state.qIndex++;
    renderQuestionView();
  }

  async function processGamificationAfterSession(sessionMeta, correct, gradedTotal, answers, cardsSnapshot) {
    const db = await ensureDb();
    const g = await loadGamification(db);
    maybeGrantWeeklyFreeze(g);
    g.lifetimeSessions = (g.lifetimeSessions || 0) + 1;

    let xpGain = 0;
    for (const row of answers) {
      if (row.graded === false) continue;
      const id = questionId(row.question);
      const before = cardsSnapshot.get(id);
      const nem = isNemesis(before);
      if (row.isCorrect) xpGain += 12 + (nem ? 10 : 0);
      else xpGain += 2;
    }

    const sessionPerfect = gradedTotal > 0 && correct === gradedTotal;
    if (sessionPerfect) xpGain += 22;

    if (sessionMeta.mode === 'daily' && gradedTotal > 0) {
      const today = calendarDayKey();
      if (g.dailyBonusDate !== today) {
        g.dailyBonusDate = today;
        xpGain += 24 + (sessionPerfect ? 26 : 0);
      }
    }

    let nemesisBeat = false;
    for (const row of answers) {
      if (row.graded === false) continue;
      const id = questionId(row.question);
      const before = cardsSnapshot.get(id);
      if (row.isCorrect && isNemesis(before)) nemesisBeat = true;
    }

    g.xp = (g.xp || 0) + xpGain;
    updateStreakOnSessionComplete(g);

    if (sessionMeta.mode === 'blitz') {
      const score = answers.filter((a) => a.graded !== false && a.isCorrect).length;
      g.blitzHigh = Math.max(g.blitzHigh || 0, score);
      pushTopScore(g.blitzScores, score);
    }
    if (sessionMeta.mode === 'endless') {
      const streak = answers.filter((a) => a.graded !== false && a.isCorrect).length;
      g.endlessHigh = Math.max(g.endlessHigh || 0, streak);
      pushTopScore(g.endlessScores, streak);
    }

    const cat = state.settings.category;
    const stats = aggregateStats(state.allQuestions, state.cardsCache, cat);

    const ctx = {
      lifetimeSessions: g.lifetimeSessions,
      xp: g.xp,
      streakCount: g.streakCount,
      sessionPerfect,
      nemesisBeat,
      dailyDone: sessionMeta.mode === 'daily' && gradedTotal > 0,
      blitzHigh: g.blitzHigh,
      endlessHigh: g.endlessHigh,
      masteryPct: stats.masteryPct
    };

    const newBadges = unlockBadges(g, ctx);
    await saveGamification(db, g);

    return {
      xpGain,
      newBadges,
      sessionPerfect,
      streak: g.streakCount,
      nemesisBeat
    };
  }

  async function finishSession() {
    const session = state.session;
    if (!session) return;

    if (state.blitzTimerId) {
      clearInterval(state.blitzTimerId);
      state.blitzTimerId = null;
    }

    const cardsSnapshot = new Map(state.cardsCache);
    const db = await ensureDb();
    let correct = 0;
    let gradedTotal = 0;
    for (const row of state.answers) {
      if (row.graded === false) continue;
      gradedTotal++;
      if (row.isCorrect) correct++;
      if (session.meta.affectsSRS) {
        const id = questionId(row.question);
        const prev = state.cardsCache.get(id) || { id };
        const graded = gradeCard(prev, row.isCorrect);
        graded.id = id;
        await saveCard(db, graded);
      }
    }

    await logSession(db, {
      endedAt: Date.now(),
      mode: session.meta.mode,
      correct,
      total: gradedTotal,
      updatedSRS: session.meta.affectsSRS
    });

    const affectsSRS = session.meta.affectsSRS;
    const answersCopy = state.answers.slice();
    const metaCopy = session.meta;

    hideNav(false);
    state.session = null;
    state.answers = [];

    let fancy = {
      xpGain: 0,
      newBadges: [],
      sessionPerfect: false,
      streak: state.gamification?.streakCount ?? 0,
      nemesisBeat: false
    };
    try {
      fancy = await processGamificationAfterSession(metaCopy, correct, gradedTotal, answersCopy, cardsSnapshot);
    } catch (e) {
      console.warn(e);
    }

    renderResults(correct, gradedTotal, answersCopy, affectsSRS, fancy);
  }

  function renderResults(correct, gradedTotal, answers, affectsSRS, fancy) {
    emptyMain();
    const pct = gradedTotal ? Math.round((correct / gradedTotal) * 100) : 0;
    const pbqOnly = answers.filter((r) => r.graded === false).length;
    const srsCopy = affectsSRS
      ? 'Spaced repetition schedules were updated for each graded question.'
      : 'Practice mode: schedules were not changed for this run.';
    const summary = document.createElement('section');
    summary.className = `panel results-hero${fancy.sessionPerfect && gradedTotal > 0 ? ' celebrate' : ''}`;
    const scoreLine =
      gradedTotal > 0
        ? `${correct} / ${gradedTotal} graded correct (${pct}%)`
        : 'No graded multiple-choice items in this session.';
    const pbqLine = pbqOnly ? `<p class="muted small">${pbqOnly} reference item(s) (not scored).</p>` : '';
    const xpLine =
      fancy.xpGain > 0
        ? `<p class="results-score" style="font-size:1.1rem">+${fancy.xpGain} XP · Streak ${fancy.streak} days</p>`
        : '';
    summary.innerHTML = `
      <h2 class="panel-title">Case closed</h2>
      <p class="results-score">${scoreLine}</p>
      ${xpLine}
      ${pbqLine}
      <p class="muted small">${srsCopy}</p>
    `;

    if (fancy.sessionPerfect && gradedTotal > 0) {
      triggerConfetti();
      playSound('badge');
    }
    for (const b of fancy.newBadges || []) {
      playSound('badge');
      showToast(`Badge: ${b.title}`, true);
    }
    if (fancy.nemesisBeat) showToast('Nemesis neutralized.');

    const list = document.createElement('div');
    list.className = 'results-list';

    answers.forEach((row, i) => {
      const { question: q, selected, isCorrect, graded } = row;
      const item = document.createElement('article');
      const isRef = graded === false;
      item.className = `result-item ${isRef ? 'ref' : isCorrect ? 'ok' : 'bad'}`;
      const hdr = document.createElement('header');
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = String(i + 1);
      const status = document.createElement('strong');
      status.textContent = isRef ? 'Reference' : isCorrect ? 'Correct' : 'Incorrect';
      hdr.appendChild(badge);
      hdr.appendChild(status);
      item.appendChild(hdr);
      const pq = document.createElement('p');
      pq.className = 'question-text';
      pq.textContent = q.question;
      item.appendChild(pq);
      appendQuestionFigure(item, q);
      if (!isRef) {
        const { correct: corr } = normalizeAnswers(q, selected);
        const ans = document.createElement('p');
        ans.className = 'muted small';
        ans.textContent = `Yours: ${selected.join(', ')} · Correct: ${corr.join(', ')}`;
        item.appendChild(ans);
      }
      const rat = document.createElement('div');
      rat.className = 'rationale';
      rat.textContent = q.explanation || '';
      item.appendChild(rat);
      list.appendChild(item);
    });

    const footer = document.createElement('div');
    footer.className = 'results-footer';
    footer.innerHTML = `<button type="button" class="btn primary" id="btn-done">Back home</button>`;

    mainEl.appendChild(summary);
    mainEl.appendChild(list);
    mainEl.appendChild(footer);

    footer.querySelector('#btn-done').addEventListener('click', () => navigate('home'));
  }

  async function loadQuestions() {
    const [general, acronym] = await Promise.all([
      fetch('quiz_data.json').then((r) => r.json()),
      fetch('acronym_data.json')
        .then((r) => r.json())
        .catch(() => [])
    ]);
    general.forEach((q) => {
      if (!q.category) q.category = 'general';
    });
    acronym.forEach((q) => {
      q.category = 'acronym';
    });
    state.allQuestions = [...general, ...acronym];
  }

  function bindNav() {
    document.querySelectorAll('.bottom-nav .nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        if (route) navigate(route);
      });
    });
  }

  window.addEventListener('DOMContentLoaded', async () => {
    try {
      bindNav();
      await loadQuestions();
      const db = await ensureDb();
      await migrateLegacyIfNeeded(db, state.allQuestions);
      await bootstrapSettings();
      await hydrateGamification(db);
      await refreshCardsCache();
      navigate('home');
    } catch (e) {
      console.error(e);
      if (mainEl) {
        mainEl.innerHTML =
          '<section class="panel"><p>Could not start the app. Open via a local server or GitHub Pages so JSON files load.</p></section>';
      }
    }
  });
})();
