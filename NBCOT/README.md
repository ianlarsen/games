# OT Study Tool — NBCOT Exam Prep

A gamified spaced-repetition flashcard app for the NBCOT (National Board for Certification in Occupational Therapy) exam. Built with vanilla JavaScript, IndexedDB, and a Leitner SRS engine. Capacitor-ready for iOS/Android packaging.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Architecture](#architecture)
3. [Study Modes](#study-modes)
4. [Gamification Features](#gamification-features)
5. [Badges](#badges)
6. [Asset Inventory](#asset-inventory)
7. [Deferred Feature: Boss Battles](#deferred-feature-boss-battles)
8. [Planned Improvements](#planned-improvements)

---

## App Overview

| Detail | Value |
|---|---|
| **Name** | OT Study Tool |
| **Purpose** | NBCOT board exam prep |
| **Content Expert** | Ruby Cai M.S. OTR/L |
| **Tech Stack** | Vanilla JS, HTML5, CSS3, IndexedDB |
| **Build Step** | None — open `index.html` directly |
| **Mobile Target** | Capacitor (iOS + Android) |
| **Questions (current)** | 75 |
| **Questions (planned)** | 5,000+ |

---

## Architecture

### File Load Order
```
index.html
 └── js/data.js        → Question bank (QUESTIONS array)
 └── js/storage.js     → IndexedDB abstraction layer
 └── js/engine.js      → Leitner SRS logic, badge checks
 └── js/sound.js       → Audio playback
 └── js/app.js         → View rendering + all UI logic
 └── css/styles.css    → All styles (mobile-first, dark mode)
```

### Directory Structure
```
OT_Study_Tool/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   ├── storage.js
│   ├── engine.js
│   ├── sound.js
│   └── app.js
└── assets/
    ├── icon.svg
    ├── NBCOT_app_icon.png
    ├── NBCOT_splash.png
    ├── splash.svg
    ├── audio/          ← see Asset Inventory
    └── badges/         ← see Asset Inventory
```

### Data Storage (IndexedDB — `nbcot_study_db`)
| Store | Contents |
|---|---|
| `user` | Profile, settings, daily challenge state, game stats |
| `cardStates` | Per-question Leitner box, attempts, correctCount, lastReview |
| `sessions` | Completed session history |
| `badges` | Earned badge IDs with timestamps |

### Design Tokens
| Property | Value |
|---|---|
| Primary | `#2563EB` |
| Accent / Gold | `#F59E0B` |
| Success | `#059669` |
| Error | `#DC2626` |
| Max content width | `480px` |
| Dark mode | `.dark` class on `<body>` |

### Domain Colours
| Domain Key | Label | Colour |
|---|---|---|
| `evaluation` | Evaluation | `#6366F1` |
| `foundations` | Foundations | `#0EA5E9` |
| `intervention` | Intervention | `#10B981` |
| `pediatrics` | Pediatrics | `#F59E0B` |
| `mental_health` | Mental Health | `#8B5CF6` |
| `professional` | Professional | `#F43F5E` |

---

## Study Modes

### Core Modes
| Mode | Description |
|---|---|
| **Smart Review** | Leitner SRS — surfaces cards due today based on box interval |
| **Quick Quiz** | 10 random questions, no SRS tracking |
| **Practice Test** | 50-question timed exam simulation |
| **Study by Domain** | Filter any of the above to one domain |

### Leitner SRS System (5-Box)
Cards start in Box 1. Correct answers promote to the next box; wrong answers demote to Box 1.

| Box | Review Interval |
|---|---|
| 1 | Every session (0 days) |
| 2 | 1 day |
| 3 | 3 days |
| 4 | 7 days |
| 5 | 14 days |
| Mastered | 30 days |

### Gamification Modes (added in Session 2)
| Mode | Description |
|---|---|
| **Daily Challenge** | 6 questions (one per domain), resets daily. Seeded PRNG so every user on the same date gets the same questions. |
| **60-Second Blitz** | Score as many correct answers as possible in 60 seconds. SVG ring countdown timer, animated feedback, personal high score tracking. |
| **Endless Streak Run** | Answer questions until you get one wrong. Tracks current streak and personal best. |
| **Spin the Domain Wheel** | SVG pie wheel with 6 coloured slices. CSS cubic-bezier spin animation, lands on a domain and starts a 10-question session. |

### Nemesis Questions (added in Session 2)
Any question where `(attempts − correctCount) ≥ 3` is automatically flagged as a **Nemesis Question** across all study modes. A pulsing purple banner is shown above the question. Defeating a Nemesis question for the first time awards the *Nemesis Slayer* badge.

---

## Gamification Features

| Feature | Where | Notes |
|---|---|---|
| Leitner SRS | All study modes | 5-box promotion/demotion |
| Daily login streak | Home screen | Tracked via session history |
| Daily Challenge | Home card | Amber card → green when complete |
| Nemesis flagging | All study sessions | Auto-detected, no user action needed |
| Personal high scores | Blitz, Streak Run | Stored in `gameStats` in user object |
| 15 Achievement badges | Earned throughout | See Badges section |
| Arcade Modes | Study Lobby | 3 accessible from home |

---

## Badges

All badge images live in `assets/badges/` at **128×128px PNG**.

| File | Badge Name | Earn Condition |
|---|---|---|
| `first_question.png` ✅ | First Step | Answer your first question |
| `streak_3.png` ✅ | 3-Day Streak | Study 3 days in a row |
| `streak_7.png` ✅ | Week Warrior | Study 7 days in a row |
| `streak_14.png` ✅ | Fortnight Focus | Study 14 days in a row |
| `mastery_25.png` ✅ | Quarter Way | 25% overall mastery |
| `mastery_50.png` ✅ | Halfway There | 50% overall mastery |
| `mastery_75.png` ✅ | Almost Ready | 75% overall mastery |
| `mastery_100.png` ✅ | NBCOT Ready! | 100% overall mastery |
| `perfect_session.png` ✅ | Perfect Session | 100% correct in a session |
| `domain_1.png` ✅ | Eval Expert | 100% mastery in Evaluation |
| `domain_2.png` ✅ | Knowledge Base | 100% mastery in Foundations |
| `daily_7.png` ❌ **MISSING** | Daily Devotee | Complete 7 Daily Challenges |
| `blitz_20.png` ❌ **MISSING** | Speed Demon | Score 20+ in a 60-Second Blitz |
| `streak_10.png` ❌ **MISSING** | On a Roll | Reach a 10-correct Streak Run |
| `nemesis_slayer.png` ❌ **MISSING** | Nemesis Slayer | Defeat your first Nemesis question |

### Missing Badge Generation Prompts

Use these prompts with an AI image generator (e.g. DALL·E, Midjourney, or Stable Diffusion) at **128×128px**, flat/icon style, transparent background:

**`daily_7.png` — Daily Devotee**
> "Flat icon badge: a gold calendar page with a flame or star inside, indicating a 7-day streak. Clean, minimal, bold colours. Transparent background. 128x128px."

**`blitz_20.png` — Speed Demon**
> "Flat icon badge: a lightning bolt with a stopwatch or timer overlay, in fiery orange-gold tones. Conveys speed. Clean, minimal. Transparent background. 128x128px."

**`streak_10.png` — On a Roll**
> "Flat icon badge: a golden bowling ball with motion streaks or a chain of ten stars. Conveys momentum. Clean, minimal. Transparent background. 128x128px."

**`nemesis_slayer.png` — Nemesis Slayer**
> "Flat icon badge: a purple skull or monster with a red 'X' or sword crossing through it. Slightly menacing but cartoonish. Clean, minimal. Transparent background. 128x128px."

---

## Asset Inventory

### Audio Files — `assets/audio/`
All 5 audio files are present. ✅

| File | Trigger | Description |
|---|---|---|
| `correct.mp3` ✅ | Correct answer | Short positive chime |
| `incorrect.mp3` ✅ | Wrong answer | Short negative buzz |
| `badge.mp3` ✅ | Badge earned | Fanfare / unlock sound |
| `session-complete.mp3` ✅ | Session finished | Triumphant completion sound |
| `level-up.mp3` ✅ | Card promotes a Leitner box | Ascending tone |

### App Icon / Splash Assets — `assets/`
| File | Use |
|---|---|
| `icon.svg` | SVG app icon (inline use in HTML) |
| `NBCOT_app_icon.png` | Native app icon (Capacitor) |
| `NBCOT_splash.png` | Splash screen (Capacitor) |
| `splash.svg` | SVG splash (web fallback) |

---

## Deferred Feature: Boss Battles

Designed but deferred — too complex to add without a large question bank.

### Concept
Each of the 6 domains has a named "domain boss." When a user reaches ~60% mastery in a domain, that domain's boss is unlocked. The boss fight is a special timed session where wrong answers deal damage to the user (using hearts/lives). Defeating the boss awards a permanent trophy badge.

### Domain Bosses (proposed names)
| Domain | Boss Name |
|---|---|
| Evaluation | The Assessor |
| Foundations | The Theorist |
| Intervention | The Practitioner |
| Pediatrics | The Pediatric Pro |
| Mental Health | The Mindkeeper |
| Professional | The Board |

### Mechanics
- Boss has HP (e.g. 10 wrong answers kills the player)
- Player has 3 hearts; each wrong answer costs one heart
- Defeating a boss awards a unique domain boss badge (permanent, one-time)
- Boss fight is not repeatable once won — trophy displayed on profile

### Why Deferred
- Requires meaningful question depth per domain (current: ~12 per domain)
- Boss fight needs balanced question difficulty curve
- Revisit when question bank reaches ~500+ per domain

---

## Planned Improvements

### Content
- [ ] Expand question bank to 5,000+ questions across all 6 domains
- [ ] Add question explanations / rationale for each answer
- [ ] Add image-based questions (anatomical diagrams, equipment photos)

### Features
- [ ] Boss Battle mode (see Deferred section above)
- [ ] Cloud sync / account login so progress persists across devices
- [ ] Social: share streak / badge achievements
- [ ] Exam Readiness Score — weighted prediction based on SRS performance
- [ ] Onboarding tutorial / first-run walkthrough

### Technical
- [ ] Capacitor build pipeline documentation
- [ ] iOS App Store submission checklist
- [ ] Android Play Store submission checklist
- [ ] Offline-first PWA manifest for web installs

---

## Session History

| Session | Work Done |
|---|---|
| **Session 1** | Core app: Leitner SRS engine, 6 domains, 75 questions, IndexedDB storage, badge system (11 badges), sound system, mobile CSS |
| **Session 2** | Gamification research (SDT theory, operant conditioning, flow theory). Added: Daily Challenge, 60-Second Blitz, Endless Streak Run, Spin the Domain Wheel, Nemesis Questions, 4 new badges |
