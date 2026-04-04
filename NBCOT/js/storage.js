// ============================================================
//  NBCOT PREP — IndexedDB Storage Layer
//  Handles all persistent data: user profile, card states,
//  session logs, and badges.
// ============================================================

const Storage = (() => {
  const DB_NAME    = 'NbcotPrepDB';
  const DB_VERSION = 1;
  let db = null;

  // ── Open / initialise the database ─────────────────────────
  function init() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = e => {
        const database = e.target.result;

        if (!database.objectStoreNames.contains('user')) {
          database.createObjectStore('user', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('cardStates')) {
          database.createObjectStore('cardStates', { keyPath: 'questionId' });
        }
        if (!database.objectStoreNames.contains('sessions')) {
          database.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        }
        if (!database.objectStoreNames.contains('badges')) {
          database.createObjectStore('badges', { keyPath: 'id' });
        }
      };

      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror   = e => reject(e.target.error);
    });
  }

  // ── Generic helpers ─────────────────────────────────────────
  function tx(storeName, mode = 'readonly') {
    return db.transaction([storeName], mode).objectStore(storeName);
  }

  function promisify(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    });
  }

  function getAll(storeName) {
    return promisify(tx(storeName).getAll());
  }

  function getOne(storeName, key) {
    return promisify(tx(storeName).get(key));
  }

  function put(storeName, value) {
    return promisify(tx(storeName, 'readwrite').put(value));
  }

  function remove(storeName, key) {
    return promisify(tx(storeName, 'readwrite').delete(key));
  }

  function clearStore(storeName) {
    return promisify(tx(storeName, 'readwrite').clear());
  }

  // ── User profile ─────────────────────────────────────────────
  async function getUser() {
    return getOne('user', 'profile');
  }

  async function saveUser(userData) {
    return put('user', { ...userData, id: 'profile' });
  }

  // ── Card states (Leitner progress per question) ───────────────
  async function getCardState(questionId) {
    return getOne('cardStates', questionId);
  }

  async function saveCardState(state) {
    return put('cardStates', state);
  }

  async function getAllCardStates() {
    const rows = await getAll('cardStates');
    // Convert array to map keyed by questionId for fast lookup
    const map = {};
    rows.forEach(r => { map[r.questionId] = r; });
    return map;
  }

  async function saveAllCardStates(cardStatesMap) {
    const store = db.transaction(['cardStates'], 'readwrite').objectStore('cardStates');
    const promises = Object.values(cardStatesMap).map(state =>
      promisify(store.put(state))
    );
    return Promise.all(promises);
  }

  // ── Session logs ──────────────────────────────────────────────
  async function logSession(sessionData) {
    return put('sessions', sessionData);
  }

  async function getSessionLogs() {
    return getAll('sessions');
  }

  // ── Badges ────────────────────────────────────────────────────
  async function getBadges() {
    return getAll('badges');
  }

  async function awardBadge(badge) {
    // badge: { id, name, description, icon, earnedAt }
    const existing = await getOne('badges', badge.id);
    if (!existing) {
      return put('badges', badge);
    }
    return existing;
  }

  // ── Nuclear option — wipe everything ─────────────────────────
  async function clearAll() {
    await clearStore('user');
    await clearStore('cardStates');
    await clearStore('sessions');
    await clearStore('badges');
  }

  // ── Settings (stored in user object) ─────────────────────────
  async function getSettings() {
    const user = await getUser();
    return (user && user.settings) ? user.settings : getDefaultSettings();
  }

  function getDefaultSettings() {
    return {
      theme:       'light',
      fontSize:    'medium',
      dailyGoal:   20,
      sessionSize: 20,
      notifications: true,
      soundEnabled: true,
    };
  }

  async function saveSettings(settings) {
    const user = await getUser() || { id: 'profile' };
    return saveUser({ ...user, settings });
  }

  return {
    init,
    getUser,
    saveUser,
    getCardState,
    saveCardState,
    getAllCardStates,
    saveAllCardStates,
    logSession,
    getSessionLogs,
    getBadges,
    awardBadge,
    clearAll,
    getSettings,
    saveSettings,
    getDefaultSettings,
  };
})();
