# Validation record

Performed October 10, 2026 with Node’s test runner and headless Chrome through Playwright, using an HTTP development server.

## Passed

- 27 injected-clock automated tests for mastery, spacing, attempts, schedule selection, deadline adjustment, grading, progress serialization/import and semantic content updates.
- 70 unique learning questions with keys, accepted answers, rubrics, source filenames and page/slide locators, and a coverage mapping for every objective. 64 automatic factual objectives and 6 written self-assessed objectives.
- HTTP browser render at phone 390×844, tablet 820×1180, laptop 1440×1000 in light and dark themes. All six layouts visually inspected. No horizontal page overflow at these sizes.
- Saved theme persistence, reduced-motion browser emulation, sound off by default, opt-in tone activation and mute, accessible keyboard radio selection, touch-compatible native controls, visible focus, semantic labels and feedback announcements.
- Real browser matching, all-or-nothing scoring, hidden city names during assessed coordinate tasks, factual recall, writing model/rubric self-review.
- IndexedDB answer and draft persistence through reload, paused session resume, day reservation, guarded double-click submissions, and cross-tab simultaneous submission saving exactly one attempt.
- Locally stored unclear-question report, backup download, deliberate reset, UI import of the saved backup, and retained rubric checks.
- Service worker cached shell and question bank loaded offline after initial caching. A changed development worker waited for activation and retained progress after the completed session and reload.
- JavaScript syntax checks, no browser page errors in the exercised flows.

## Scope and remaining checks

The original files were inspected as described in COVERAGE.md. The slide deck was not opened or rendered in PowerPoint. Ordinary text extraction was empty for the city scan, so rendered page inspection was used.

Browser emulation is not a physical device test. Actual iPhone/iPad/Android install prompts, Safari behavior, audible tone loudness, and VoiceOver/NVDA reading should be checked on the devices Clay uses. No paid AI grading, remote storage synchronization, or historical scholarly fact-check is part of this build.

The coordinate map is an original educational diagram with approximate points. It is not a precise route map. Source figures that differ are preserved with source-specific questions. Class claims remain test authority.

A subdirectory HTTP serving check and hosted URL verification are recorded separately below when publishing finishes. New releases must increment the service-worker cache version and deploy all essential assets together.

## Subdirectory hosting check

Passed with the app served under `/games/Clay/AP World History/`: relative assets, the service-worker scope, cached offline reload, and a comprehensive queue of all 70 distinct objectives. The existing GitHub Pages root returned HTTP 200 before publishing.
