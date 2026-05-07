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

  const DAY_MS = 86400000;
  /** Days until next review after landing in box k (1–6). CDL-style cadence. */
  const BOX_INTERVAL_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14, 6: 30 };

  const defaultSettings = () => ({
    theme: 'light',
    fontScale: 1,
    sessionSize: 20,
    rationaleDelay: true,
    practiceSkipSRS: false,
    category: 'general'
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
    feedback: null
  };

  function questionId(q) {
    return String(q.number);
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
    const cat = state.settings.category;
    const stats = aggregateStats(state.allQuestions, state.cardsCache, cat);
    const sessions = await loadSessions(await ensureDb());
    const streak = calcStreak(sessions);

    const hero = document.createElement('section');
    hero.className = 'panel hero';
    hero.innerHTML = `
      <h2 class="panel-title">Today</h2>
      <div class="hero-stats">
        <div class="stat-chip"><span class="stat-value">${stats.due}</span><span class="stat-label">Due now</span></div>
        <div class="stat-chip"><span class="stat-value">${stats.unseen}</span><span class="stat-label">New</span></div>
        <div class="stat-chip accent"><span class="stat-value">${stats.masteryPct}%</span><span class="stat-label">Mastery*</span></div>
        <div class="stat-chip"><span class="stat-value">${streak}</span><span class="stat-label">Day streak</span></div>
      </div>
      <p class="muted small">*Among questions you have attempted at least once (current pool filter).</p>
      <div class="hero-actions">
        <button type="button" class="btn primary large" id="cta-smart">Smart Review (${Math.min(state.settings.sessionSize, stats.total)}) cards</button>
        <button type="button" class="btn ghost" id="cta-quiz">Quick quiz (10)</button>
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

  function beginSession(questions, meta) {
    hideNav(true);
    state.session = { questions, meta, startedAt: Date.now() };
    state.qIndex = 0;
    state.answers = [];
    state.feedback = null;
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
      <span class="chip subtle">${session.meta.mode} · ${session.meta.affectsSRS ? 'SRS on' : 'Practice'}</span>
    `;

    const stem = document.createElement('p');
    stem.className = 'question-text';
    stem.textContent = q.question;

    const answerParts = String(q.answer || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const isMulti = answerParts.length > 1;

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

    const actions = document.createElement('div');
    actions.className = 'quiz-actions';

    let feedbackEl = null;
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

    cardEl.appendChild(badges);
    cardEl.appendChild(stem);
    cardEl.appendChild(list);
    if (feedbackEl) cardEl.appendChild(feedbackEl);
    else cardEl.appendChild(actions);

    wrap.appendChild(header);
    wrap.appendChild(cardEl);
    mainEl.appendChild(wrap);

    header.querySelector('#btn-abort').addEventListener('click', async () => {
      if (confirm('End this session early? Progress for this session will be lost.')) {
        state.session = null;
        state.feedback = null;
        hideNav(false);
        navigate('study');
      }
    });

    if (feedbackEl) {
      feedbackEl.querySelector('#btn-next').addEventListener('click', () => {
        void advanceQuestion(q);
      });
    } else {
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
    const selected = [];
    list.querySelectorAll('input').forEach((inp) => {
      if (inp.checked) selected.push(inp.value);
    });
    if (!selected.length) {
      alert('Select at least one answer.');
      return;
    }
    const { isCorrect } = normalizeAnswers(q, selected);

    if (!state.settings.rationaleDelay) {
      state.answers.push({ question: q, selected, isCorrect });
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
      state.answers.push({
        question: q,
        selected: state.feedback.selected,
        isCorrect: state.feedback.isCorrect
      });
      state.feedback = null;
    }

    if (state.qIndex >= session.questions.length - 1) {
      await finishSession();
      return;
    }
    state.qIndex++;
    renderQuestionView();
  }

  async function finishSession() {
    const session = state.session;
    if (!session) return;

    const db = await ensureDb();
    let correct = 0;
    for (const row of state.answers) {
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
      total: state.answers.length,
      updatedSRS: session.meta.affectsSRS
    });

    const affectsSRS = session.meta.affectsSRS;
    hideNav(false);
    state.session = null;
    renderResults(correct, state.answers, affectsSRS);
    state.answers = [];
  }

  function renderResults(correct, answers, affectsSRS) {
    emptyMain();
    const pct = answers.length ? Math.round((correct / answers.length) * 100) : 0;
    const srsCopy = affectsSRS
      ? 'Spaced repetition schedules were updated for each graded question.'
      : 'Practice mode: schedules were not changed for this run.';
    const summary = document.createElement('section');
    summary.className = 'panel results-hero';
    summary.innerHTML = `
      <h2 class="panel-title">Session complete</h2>
      <p class="results-score">${correct} / ${answers.length} correct (${pct}%)</p>
      <p class="muted small">${srsCopy}</p>
    `;

    const list = document.createElement('div');
    list.className = 'results-list';

    answers.forEach((row, i) => {
      const { question: q, selected, isCorrect } = row;
      const { correct: corr } = normalizeAnswers(q, selected);
      const item = document.createElement('article');
      item.className = `result-item ${isCorrect ? 'ok' : 'bad'}`;
      item.innerHTML = `
        <header><span class="badge">${i + 1}</span><strong>${isCorrect ? 'Correct' : 'Incorrect'}</strong></header>
        <p class="question-text">${escapeHtml(q.question)}</p>
        <p class="muted small">Yours: <strong>${selected.join(', ')}</strong> · Correct: <strong>${corr.join(', ')}</strong></p>
        <div class="rationale">${escapeHtml(q.explanation || '')}</div>
      `;
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
