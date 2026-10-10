# Clay’s Study Atlas

A dependency-free static study app for AP World History, Trade Networks 1200–1450. The question bank contains **70 stable learning questions / objectives** across 10 topics: **64 automatically graded** and **6 written, self-assessed**. Original worksheets, PDFs, and decks are authoring inputs and must not be published with the app.

## Launch locally

Open a terminal in this folder and run:

```text
node server.js
```

Visit `http://127.0.0.1:4173/`. Node 22 or later is recommended for the test runner. No installation or runtime dependencies are needed. Opening `index.html` with `file://` is not supported because module loading, content fetching, IndexedDB behavior and service workers require HTTP. `Launch Study Atlas.cmd` starts the local server and opens the browser if Node is on PATH.

## Clay’s guide

Start in Today. Choose the recommended 8–12 minute session or a shorter session in Practice. Answer from memory before opening notes. Matching requires all rows correct. Location questions use lettered coordinate points with ordinary radio controls, so no dragging is required. Written answers use a model answer and rubric for self-review.

Pause & save preserves the encounter and draft. Resume brings back the same question. Hints, revealed answers, and supported retries help you learn but cannot earn mastery. Reviewing the Explore notes during an unfinished encounter marks it assisted. If you use notes outside the app, choose Hint / source notes to record that assistance honestly.

Mastery means **three consecutive unassisted first-try successes on three separate study days, at least 20 hours apart**. Only the first encounter for a question on a study day can qualify. Opening a new encounter, refreshing, changing modes, or answering a wording variant does not create another opportunity. An eligible wrong first response resets the streak. A later lapse moves a mastered item to Needs refresh while preserving lifetime achievements and mastery dates. Mastered items still receive maintenance reviews.

The initial exam is **October 18, 2026**, with **America/New_York** study days. The first use date anchors initial coverage. For an October 10 start, new material is prioritized over October 10–12; spaced reviews continue through October 16; October 17 offers all-objective review in manageable blocks; October 18 offers a short optional warm-up. Missing days increase the estimated workload. A late start or error may make mastery before the test impossible, and the app says so honestly. Dates and timezone can be edited for future tests.

XP rewards practice and is capped to one reward per question per study day. It does not measure knowledge. Earned achievements persist after lapses. The weekly consistency goal asks for any three days in the last seven. Sound starts off; enable or mute quiet tones in Settings.

Progress belongs to this browser/device and **does not synchronize**. Export backups regularly. Import validates a backup and asks before replacing progress. Reset also asks for confirmation. Browser cleanup, private browsing or storage removal can erase local data.

## Content and source coverage

`data/unit.json` is the reviewed bank and concise notes. `COVERAGE.md` maps source claims and both supplied city-reading questions to stable IDs. The third supplied WHP reading is included, not just the two files named in the older build prompt. Factual authority is the supplied class material. No external historical caveats were added. Source-specific questions preserve different caravan figures and date ranges.

The 5-page city scan and 8-page WHP reading were rendered and visually inspected. The 17-slide deck was read via slide and notes XML, with every embedded image inspected. There were no speaker notes. PowerPoint rendering was not performed. The linked video, missing Mongols homework, and absent primary-source documents are excluded. The class HIPPO definition uses O = Organization, including outside information and connection to an argument.

## Modules and storage

- `js/engine.js`: encounter eligibility, progress, spacing, deadline plan, session selection, readiness statistics.
- `js/grading.js`: normalized factual answers, reviewed synonyms, opted-in one-edit spelling tolerance, all-or-nothing matching, exact choice keys.
- `js/storage.js`: project-namespaced IndexedDB, atomic read-modify-write, validated import/export, temporary mode warning.
- `js/achievements.js`: preserved achievements and forgiving weekly goal.
- `js/audio.js`: opt-in Web Audio cues, conservative volume, no overlapping pileups.
- `js/map.js`: original coordinate map and schematic progress connections.
- `js/ui.js`: semantic HTML screens and keyboard/touch controls.

The whole learner state is stored in one IndexedDB object under database `clay-trade-routes-v1`. Single read-modify-write transactions serialize attempts and session updates across tabs. Encounter creation reserves a local day before an answer. Attempts distinguish first response, assistance, eligibility, retry, timestamp, mode, variant, content version and question version. Clock rollback and timezone changes block easy duplicate wins. This is a learning tool, not a tamper-proof exam system.

Opening and abandoning the first encounter for a day consumes that day’s opportunity. A persisted encounter can resume and submit its first response if it is still the same study day; an encounter crossing midnight records practice only. All exposures block the next qualifying encounter for at least 20 hours. Suggested next gaps are 1 day, 3 days, then 7-day maintenance, with longer maintenance after successful review. Exam preparation can shorten future gaps to roughly 1 day. Editable gaps never change the 20-hour or three-day mastery rule.

Question versions define answer semantics. Increment a question’s version when its accepted answer changes, not just when editing punctuation. Reconciliation resets current readiness and records a reassessment reason while preserving lifetime mastery, last study day and exposure time. Stable IDs survive wording variants. Imports preserve compatible IDs and reject unknown IDs, unsafe keys, malformed records, duplicate attempt tokens and invalid settings. Later source additions should extend this versioned content format, without rewriting the grading or spacing engine.

## Content import contract

See `CONTENT_SCHEMA.md`. Before publishing any content edit, run `npm run validate` and inspect all new sources, accepted answers and distractors. `node tests/validate.js` works without npm. Content import is an authoring process, not a learner UI upload feature. Do not infer accuracy from passing structural validation alone.

## Tests

```text
npm test
npm run validate
```

The engine tests inject timestamps and cover separate eligible successes, wrong/correct retries, hints, reveals, variants, same-day mode changes, day reservation, refresh/resume, double submission, lapse, missed days, late starts, insufficient time, timezone/clock changes, grading, export/import and semantic content changes. Browser QA covers IndexedDB persistence, cross-tab atomicity, offline reload, waiting-worker update, audio opt-in/mute, keyboard answers, matching, location tasks and saved drafts.

`VALIDATION.md` records tests actually performed and remaining real-device checks. `tests/browser-qa.cjs` can rerun browser QA when Playwright is installed. Set `PLAYWRIGHT_MODULE` to a module path if needed, `QA_CHROME` to a browser executable, and `QA_URL` to the serving URL. It temporarily modifies the development service worker for the update test, restores it in a `finally` block, and writes private screenshots under `qa/`. Never run it against production files while learners are using the same server. Screenshots are not required runtime assets.

## Static hosting and offline updates

Host the **app files only** under `Clay/AP World History/` in `ianlarsen/games`. All essential resources and the manifest use relative paths, so the app supports a repository subdirectory containing spaces. No CDN, accounts, backend, telemetry, secrets or paid services are required. Preserve existing repository hosting configuration.

The service worker caches an entire version of the essential shell and content atomically. It does not activate updates in the middle of an answer. A waiting update appears in Settings and is activated only after the current saved session is finished. Increment the cache version in `sw.js` whenever essential files or content change, then deploy the complete release together. Existing users continue reading their cached release until they choose the update. Progress is kept in IndexedDB, independently of caches.

Offline works **after the first successful online load**. A fresh offline visit cannot load uncached files. PWA installation depends on browser support and secure hosting (localhost is accepted for development). Actual iOS/Android installation and screen-reader reading remain real-device checks.

The app’s icon and coordinate diagrams are original. Coordinate points are approximate modern city positions. Links are schematic and never claim to trace precise caravan or sea routes. No source-file illustrations are republished.
