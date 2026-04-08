// ============================================================
//  NBCOT PREP — Learning Engine
//  Leitner spaced-repetition + mastery scoring + badge tracking
// ============================================================

const Engine = (() => {

  // ── Leitner box intervals (days until next review) ──────────
  const BOX_INTERVALS = [0, 1, 3, 7, 14, 30]; // index = box (0 = new/never seen)

  function getBoxInterval(box) {
    return BOX_INTERVALS[Math.min(box, BOX_INTERVALS.length - 1)];
  }

  // ── Create a fresh card state for a new question ─────────────
  function newCardState(questionId) {
    return {
      questionId,
      box:         0,          // 0 = never seen; 1–5 = Leitner boxes
      nextReview:  Date.now(), // due immediately
      masteryPct:  0,
      attempts:    0,
      correctCount: 0,
      lastSeen:    null,
    };
  }

  // ── Is a card due for review right now? ──────────────────────
  function isDue(state) {
    if (!state) return true; // never studied = always due
    return Date.now() >= state.nextReview;
  }

  // ── Grade a card after the user answers ──────────────────────
  // Returns an updated cardState
  function gradeCard(state, isCorrect) {
    const now = Date.now();
    let box = state.box;

    if (isCorrect) {
      box = Math.min(box + 1, 5); // advance (max box 5)
    } else {
      box = 1; // reset to box 1
    }

    const daysUntilNext = getBoxInterval(box);
    const nextReview    = now + daysUntilNext * 86400000; // ms per day

    const attempts    = state.attempts + 1;
    const correctCount = state.correctCount + (isCorrect ? 1 : 0);
    const masteryPct  = Math.round(((box - 1) / 4) * 100);

    return {
      ...state,
      box,
      nextReview,
      masteryPct: Math.max(0, masteryPct),
      attempts,
      correctCount,
      lastSeen: now,
    };
  }

  // ── Build a study session question list ──────────────────────
  // Returns array of question objects (from QUESTIONS) ready to study.
  // Prioritises: (1) due cards, (2) new cards, up to maxCards.
  function buildSession(cardStatesMap, questions, maxCards = 20) {
    const now = Date.now();
    const due  = [];
    const newQ = [];

    questions.forEach(q => {
      const state = cardStatesMap[q.id];
      if (!state || state.box === 0) {
        newQ.push(q);
      } else if (now >= state.nextReview) {
        due.push(q);
      }
    });

    // Sort due by most overdue first
    due.sort((a, b) => {
      const sa = cardStatesMap[a.id];
      const sb = cardStatesMap[b.id];
      return (sa ? sa.nextReview : 0) - (sb ? sb.nextReview : 0);
    });
    shuffle(due); // randomise within due group

    // Combine: due first, then new
    const combined = [...due, ...newQ].slice(0, maxCards);

    return combined;
  }

  // ── Build a practice test session (fixed domain + difficulty) ─
  function buildTestSession(questions, optDomain = null, count = 50) {
    let pool = optDomain
      ? questions.filter(q => q.domain === optDomain)
      : [...questions];

    shuffle(pool);
    return pool.slice(0, Math.min(count, pool.length));
  }

  // ── Build a daily challenge session (deterministic per calendar day) ──
  // dateKey: 'YYYY-MM-DD' string — same key always returns the same questions.
  function buildDailyChallenge(questions, dateKey) {
    let seed = 0;
    for (let i = 0; i < dateKey.length; i++) seed += dateKey.charCodeAt(i);
    function nextInt(max) {
      seed = (seed * 9301 + 49297) % 233280;
      return Math.floor((seed / 233280) * max);
    }
    const domainIds = ['evaluation', 'foundations', 'intervention', 'pediatrics', 'mental_health', 'professional'];
    const result = [];
    domainIds.forEach(domainId => {
      const pool = questions.filter(q => q.domain === domainId);
      if (pool.length > 0) result.push(pool[nextInt(pool.length)]);
    });
    return result;
  }

  // ── Calculate per-domain and overall mastery ─────────────────
  function calcMastery(cardStatesMap, questions) {
    const domainTotals   = {};
    const domainMastered = {};

    questions.forEach(q => {
      if (!domainTotals[q.domain]) {
        domainTotals[q.domain]   = 0;
        domainMastered[q.domain] = 0;
      }
      domainTotals[q.domain]++;

      const state = cardStatesMap[q.id];
      if (state && state.box > 0) {
        domainMastered[q.domain] += state.masteryPct;
      }
    });

    const domainMastery = {};
    let totalPct = 0;
    let domainCount = 0;

    Object.keys(domainTotals).forEach(d => {
      const avg = domainTotals[d] > 0
        ? Math.round(domainMastered[d] / domainTotals[d])
        : 0;
      domainMastery[d] = avg;
      totalPct += avg;
      domainCount++;
    });

    const overall = domainCount > 0 ? Math.round(totalPct / domainCount) : 0;
    return { overall, byDomain: domainMastery };
  }

  // ── How many cards are due today ──────────────────────────────
  function getDueCount(cardStatesMap, questions) {
    const now = Date.now();
    return questions.filter(q => {
      const s = cardStatesMap[q.id];
      return !s || s.box === 0 || now >= s.nextReview;
    }).length;
  }

  // ── Streak calculation ────────────────────────────────────────
  function calcStreak(sessionLogs) {
    if (!sessionLogs || sessionLogs.length === 0) return 0;

    const dayMs = 86400000;
    const toDay = ts => Math.floor(ts / dayMs);

    const studyDays = [...new Set(sessionLogs.map(s => toDay(s.startedAt)))].sort().reverse();
    const todayNum  = toDay(Date.now());

    // Walk backward from today counting consecutive days
    let streak = 0;
    let expected = todayNum;

    for (const day of studyDays) {
      if (day === expected || day === expected - 1) {
        if (day === expected || (streak === 0 && day === todayNum - 1)) {
          streak++;
          expected = day - 1;
        } else {
          break;
        }
      } else if (day < expected) {
        break;
      }
    }

    return streak;
  }

  // ── Badge definitions and earning logic ──────────────────────
  const BADGE_DEFS = [
    { id: 'first_question', name: 'First Step',     icon: '', img: 'assets/badges/first_question.png', description: 'Answered your first question'                        },
    { id: 'streak_3',       name: '3-Day Streak',   icon: '', img: 'assets/badges/streak_3.png',       description: 'Studied 3 days in a row'                             },
    { id: 'streak_7',       name: 'Week Warrior',   icon: '', img: 'assets/badges/streak_7.png',       description: 'Studied 7 days in a row'                             },
    { id: 'streak_14',      name: 'Fortnight Focus',icon: '', img: 'assets/badges/streak_14.png',      description: 'Studied 14 days in a row'                            },
    { id: 'mastery_25',     name: 'Quarter Way',    icon: '', img: 'assets/badges/mastery_25.png',     description: 'Reached 25% overall mastery'                         },
    { id: 'mastery_50',     name: 'Halfway There',  icon: '', img: 'assets/badges/mastery_50.png',     description: 'Reached 50% overall mastery'                         },
    { id: 'mastery_75',     name: 'Almost Ready',   icon: '', img: 'assets/badges/mastery_75.png',     description: 'Reached 75% overall mastery'                         },
    { id: 'mastery_100',    name: 'NBCOT Ready!',   icon: '', img: 'assets/badges/mastery_100.png',    description: 'Reached 100% overall mastery'                        },
    { id: 'perfect_session',name: 'Perfect Session',icon: '', img: 'assets/badges/perfect_session.png',description: 'Answered all questions correctly in a session'       },
    { id: 'domain_1',       name: 'Eval Expert',    icon: '', img: 'assets/badges/domain_1.png',       description: 'Mastered the Evaluation & Assessment domain'         },
    { id: 'domain_2',       name: 'Knowledge Base', icon: '', img: 'assets/badges/domain_2.png',       description: 'Mastered the Foundational Knowledge domain'          },
    { id: 'daily_7',        name: 'Daily Devotee',  icon: '🔥', img: 'assets/badges/daily_7.png',      description: 'Completed 7 Daily Challenges'                        },
    { id: 'blitz_20',       name: 'Speed Demon',    icon: '⚡', img: 'assets/badges/blitz_20.png',     description: 'Scored 20+ in a 60-Second Blitz'                     },
    { id: 'streak_10',      name: 'On a Roll',      icon: '🎯', img: 'assets/badges/streak_10.png',    description: '10 correct answers in a row (Streak Run)'            },
    { id: 'nemesis_slayer', name: 'Nemesis Slayer', icon: '💀', img: 'assets/badges/nemesis_slayer.png',description: 'Defeated your first Nemesis question'                },
  ];

  function checkNewBadges(stats, existingBadges) {
    const earned     = new Set(existingBadges.map(b => b.id));
    const newBadges  = [];
    const now        = Date.now();

    const add = id => {
      if (!earned.has(id)) {
        const def = BADGE_DEFS.find(b => b.id === id);
        if (def) newBadges.push({ ...def, earnedAt: now });
      }
    };

    const {
      totalAnswered = 0,
      masteredCount = 0,
      streak = 0,
      overall = 0,
      byDomain = {},
      lastSessionPerfect = false,
      dailyChallengeTotal = 0,
      blitzHighScore = 0,
      streakRunBest = 0,
      nemesisDefeated = false,
    } = stats;

    if (totalAnswered >= 1)    add('first_question');

    if (streak >= 3)  add('streak_3');
    if (streak >= 7)  add('streak_7');
    if (streak >= 14) add('streak_14');

    if (overall >= 25)  add('mastery_25');
    if (overall >= 50)  add('mastery_50');
    if (overall >= 75)  add('mastery_75');
    if (overall >= 100) add('mastery_100');

    if (lastSessionPerfect) add('perfect_session');

    if ((byDomain.evaluation  || 0) >= 100) add('domain_1');
    if ((byDomain.foundations || 0) >= 100) add('domain_2');
    if (dailyChallengeTotal >= 7)  add('daily_7');
    if (blitzHighScore >= 20)       add('blitz_20');
    if (streakRunBest >= 10)        add('streak_10');
    if (nemesisDefeated)            add('nemesis_slayer');

    return newBadges;
  }

  // ── Nemesis detection ─────────────────────────────────────────
  // A question is a nemesis if it has been answered incorrectly 3+ times
  // and the last attempt was also wrong.
  function isNemesis(cardState) {
    if (!cardState) return false;
    const wrong = (cardState.attempts || 0) - (cardState.correctCount || 0);
    return wrong >= 3;
  }

  // ── Utility ───────────────────────────────────────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return {
    newCardState,
    isDue,
    gradeCard,
    buildSession,
    buildTestSession,
    buildDailyChallenge,
    calcMastery,
    getDueCount,
    calcStreak,
    checkNewBadges,
    isNemesis,
    shuffle,
    BADGE_DEFS,
  };
})();
