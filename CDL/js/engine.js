'use strict';
/**
 * CDL Study Tool — engine.js
 * Leitner SRS logic, badge definitions, and badge-check logic.
 */

// ── Leitner Intervals (days) ──────────────────────────────────────────────
const LEITNER_INTERVALS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14, 6: 30 };

function isDue(cardState) {
  const interval = LEITNER_INTERVALS[cardState.box] || 0;
  if (interval === 0) return true;
  if (!cardState.lastReview) return true;
  const daysSince = (Date.now() - cardState.lastReview) / 86400000;
  return daysSince >= interval;
}

function promoteCard(cardState) {
  const next = Math.min(cardState.box + 1, 6);
  return { ...cardState, box: next, lastReview: Date.now() };
}

function demoteCard(cardState) {
  return { ...cardState, box: 1, lastReview: Date.now() };
}

function updateCardAfterAnswer(cardState, correct) {
  const updated = {
    ...cardState,
    attempts:      cardState.attempts + 1,
    correctCount:  cardState.correctCount + (correct ? 1 : 0),
    lastReview:    Date.now(),
  };
  return correct ? promoteCard(updated) : demoteCard(updated);
}

function isNemesis(cardState) {
  return (cardState.attempts - cardState.correctCount) >= 3;
}

// ── Card Selection ────────────────────────────────────────────────────────

function getDueCards(cardStates, domain = null) {
  let cards = cardStates.filter(cs => isDue(cs));
  if (domain) cards = cards.filter(cs => {
    const q = QUESTIONS.find(q => q.id === cs.questionId);
    return q && q.domain === domain;
  });
  return cards;
}

function randomSample(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function getQuestionsForMode(mode, cardStates, domain = null) {
  const allQ = domain ? QUESTIONS.filter(q => q.domain === domain) : QUESTIONS;

  if (mode === 'smart') {
    const due = getDueCards(cardStates, domain);
    const dueIds = new Set(due.map(cs => cs.questionId));
    const dueQ   = allQ.filter(q => dueIds.has(q.id));
    return dueQ.length > 0 ? dueQ : randomSample(allQ, Math.min(10, allQ.length));
  }

  if (mode === 'quiz')  return randomSample(allQ, Math.min(10,  allQ.length));
  if (mode === 'test')  return randomSample(allQ, Math.min(50,  allQ.length));
  if (mode === 'blitz') return randomSample(allQ, Math.min(100, allQ.length));
  if (mode === 'streak') return randomSample(allQ, allQ.length); // infinite shuffle
  return randomSample(allQ, Math.min(10, allQ.length));
}

// ── Daily Challenge (seeded PRNG) ─────────────────────────────────────────

function seededRng(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getDailyChallenge() {
  const rng = seededRng(todaySeed());
  const domainKeys = Object.keys(DOMAINS);
  const result = [];
  for (const dk of domainKeys) {
    const pool = QUESTIONS.filter(q => q.domain === dk);
    if (pool.length === 0) continue;
    const idx = Math.floor(rng() * pool.length);
    result.push(pool[idx]);
  }
  return result;
}

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Mastery Calculation ───────────────────────────────────────────────────

function calcMastery(cardStates, domain = null) {
  const qs = domain ? QUESTIONS.filter(q => q.domain === domain) : QUESTIONS;
  if (qs.length === 0) return 0;
  const masteredCount = qs.filter(q => {
    const cs = cardStates.find(c => c.questionId === q.id);
    return cs && cs.box >= 5;
  }).length;
  return Math.round((masteredCount / qs.length) * 100);
}

// ── XP Awards ────────────────────────────────────────────────────────────

function xpForAnswer(correct, cardBox) {
  if (!correct) return 0;
  return 10 + (cardBox - 1) * 5; // 10 xp base, +5 per box level
}

// ── Badge Definitions ─────────────────────────────────────────────────────

const BADGE_DEFS = [
  { id: 'first_question',  name: 'First Step',      emoji: '🚀', desc: 'Answered your first question',         file: 'first_question.png'  },
  { id: 'streak_3',        name: '3-Day Streak',     emoji: '🔥', desc: 'Studied 3 days in a row',             file: 'streak_3.png'        },
  { id: 'streak_7',        name: 'Week Warrior',     emoji: '📅', desc: 'Studied 7 days in a row',             file: 'streak_7.png'        },
  { id: 'streak_14',       name: 'Fortnight Focus',  emoji: '🏅', desc: 'Studied 14 days in a row',            file: 'streak_14.png'       },
  { id: 'mastery_25',      name: 'Quarter Way',      emoji: '📊', desc: '25% overall mastery',                 file: 'mastery_25.png'      },
  { id: 'mastery_50',      name: 'Halfway There',    emoji: '🎯', desc: '50% overall mastery',                 file: 'mastery_50.png'      },
  { id: 'mastery_75',      name: 'Almost Ready',     emoji: '⭐', desc: '75% overall mastery',                 file: 'mastery_75.png'      },
  { id: 'mastery_100',     name: 'CDL Ready!',       emoji: '🏆', desc: '100% overall mastery',               file: 'mastery_100.png'     },
  { id: 'perfect_session', name: 'Perfect Session',  emoji: '💯', desc: '100% correct in a session',          file: 'perfect_session.png' },
  { id: 'domain_1',        name: 'General Expert',   emoji: '🚛', desc: 'Mastered General Knowledge',         file: 'domain_1.png'        },
  { id: 'domain_2',        name: 'Brake Master',     emoji: '🛑', desc: 'Mastered Air Brakes',                file: 'domain_2.png'        },
  { id: 'daily_7',         name: 'Daily Devotee',    emoji: '📆', desc: 'Completed 7 Daily Challenges',       file: 'daily_7.png'         },
  { id: 'blitz_20',        name: 'Speed Demon',      emoji: '⚡', desc: 'Scored 20+ in a 60-Second Blitz',   file: 'blitz_20.png'        },
  { id: 'streak_10',       name: 'On a Roll',        emoji: '🎳', desc: 'Reached a 10-question Streak Run',  file: 'streak_10.png'       },
  { id: 'nemesis_slayer',  name: 'Nemesis Slayer',   emoji: '☠️', desc: 'Defeated your first Nemesis question', file: 'nemesis_slayer.png' },
];

/**
 * After a session, check which badges should be awarded.
 * Returns array of newly earned badge IDs.
 */
async function checkAndAwardBadges(context) {
  const {
    user, cardStates, sessionCorrect, sessionTotal,
    isNemesisDefeated, earnedBadges,
  } = context;

  const earnedIds   = new Set(earnedBadges.map(b => b.badgeId));
  const newlyEarned = [];

  async function tryAward(id) {
    if (earnedIds.has(id)) return;
    const isNew = await awardBadge(id);
    if (isNew) { earnedIds.add(id); newlyEarned.push(id); }
  }

  // First question ever
  const totalAttempts = cardStates.reduce((s, c) => s + c.attempts, 0);
  if (totalAttempts >= 1) await tryAward('first_question');

  // Login streaks
  if (user.loginStreak >= 3)  await tryAward('streak_3');
  if (user.loginStreak >= 7)  await tryAward('streak_7');
  if (user.loginStreak >= 14) await tryAward('streak_14');

  // Mastery thresholds
  const overallMastery = calcMastery(cardStates);
  if (overallMastery >= 25)  await tryAward('mastery_25');
  if (overallMastery >= 50)  await tryAward('mastery_50');
  if (overallMastery >= 75)  await tryAward('mastery_75');
  if (overallMastery >= 100) await tryAward('mastery_100');

  // Perfect session
  if (sessionTotal > 0 && sessionCorrect === sessionTotal) await tryAward('perfect_session');

  // Domain mastery
  if (calcMastery(cardStates, 'general')    === 100) await tryAward('domain_1');
  if (calcMastery(cardStates, 'air_brakes') === 100) await tryAward('domain_2');

  // Nemesis slayer
  if (isNemesisDefeated) await tryAward('nemesis_slayer');

  // Daily challenge count (stored in user.dailyChallengesCompleted)
  if ((user.dailyChallengesCompleted || 0) >= 7) await tryAward('daily_7');

  // Blitz high score
  if ((user.gameStats?.blitzHighScore || 0) >= 20) await tryAward('blitz_20');

  // Streak run best
  if ((user.gameStats?.streakRunBest || 0) >= 10) await tryAward('streak_10');

  return newlyEarned;
}
