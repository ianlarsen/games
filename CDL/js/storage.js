'use strict';
/**
 * CDL Study Tool — storage.js
 * IndexedDB abstraction layer
 * DB name : cdl_study_db
 * Stores  : user | cardStates | sessions | badges
 */

const DB_NAME    = 'cdl_study_db';
const DB_VERSION = 1;

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cardStates')) {
        db.createObjectStore('cardStates', { keyPath: 'questionId' });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const ss = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        ss.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('badges')) {
        db.createObjectStore('badges', { keyPath: 'badgeId' });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = (e) => reject(e.target.error);
  });
}

function tx(storeName, mode = 'readonly') {
  return _db.transaction(storeName, mode).objectStore(storeName);
}

function dbGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = tx(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

function dbPut(store, value) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

function dbGetAll(store) {
  return new Promise((resolve, reject) => {
    const req = tx(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

function dbClear(store) {
  return new Promise((resolve, reject) => {
    const req = tx(store, 'readwrite').clear();
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

// ── Default data shapes ───────────────────────────────────────────────────

function defaultUser() {
  return {
    id: 'profile',
    name: 'Driver',
    xp: 0,
    loginStreak: 0,
    lastLoginDate: null,
    dailyChallengeDate: null,
    dailyChallengeComplete: false,
    gameStats: {
      blitzHighScore: 0,
      streakRunBest: 0,
    },
    settings: {
      sound: true,
      dark: true,
      rationale: true,
    },
  };
}

function defaultCardState(questionId) {
  return {
    questionId,
    box: 1,
    attempts: 0,
    correctCount: 0,
    lastReview: null,
  };
}

// ── Public API ────────────────────────────────────────────────────────────

async function initStorage() {
  await openDB();

  // Seed user record if missing
  let user = await dbGet('user', 'profile');
  if (!user) {
    user = defaultUser();
    await dbPut('user', user);
  }

  // Seed card states for any new questions
  const existingStates = await dbGetAll('cardStates');
  const existingIds    = new Set(existingStates.map(s => s.questionId));
  for (const q of QUESTIONS) {
    if (!existingIds.has(q.id)) {
      await dbPut('cardStates', defaultCardState(q.id));
    }
  }

  return user;
}

async function getUser() {
  return dbGet('user', 'profile');
}

async function saveUser(user) {
  return dbPut('user', user);
}

async function getCardState(questionId) {
  const cs = await dbGet('cardStates', questionId);
  return cs || defaultCardState(questionId);
}

async function saveCardState(state) {
  return dbPut('cardStates', state);
}

async function getAllCardStates() {
  return dbGetAll('cardStates');
}

async function saveSession(sessionData) {
  return dbPut('sessions', { ...sessionData, date: Date.now() });
}

async function getAllSessions() {
  return dbGetAll('sessions');
}

async function getEarnedBadges() {
  return dbGetAll('badges');
}

async function awardBadge(badgeId) {
  const existing = await dbGet('badges', badgeId);
  if (existing) return false; // already earned
  await dbPut('badges', { badgeId, earnedAt: Date.now() });
  return true;
}

async function resetAllProgress() {
  await dbClear('cardStates');
  await dbClear('sessions');
  await dbClear('badges');
  const fresh = defaultUser();
  await dbPut('user', fresh);
  // Re-seed card states
  for (const q of QUESTIONS) {
    await dbPut('cardStates', defaultCardState(q.id));
  }
  return fresh;
}
