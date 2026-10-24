# Psychology Lab validation — October 24, 2026

- 30 Node regression tests passed, covering grading, spacing, hints/retries, separate-day mastery, deadline planning, clock/timezone safeguards, draft/encounter state, backup validation, and isolated Psychology identity.
- Content validator passed for all 60 stable objectives, answer keys, choices, reviewed alternatives, source locators, and coverage entries. 57 automatically graded objectives and three self-assessed writing prompts.
- Computer Use in Chrome: desktop layout; choice and typed-answer submission; qualifying 1/3 feedback; typed draft persisted after pause/reload/resume; notes marked an unfinished encounter assisted; matching rows selected and graded correctly; reveals and session completion; writing model answer and rubric self-review; exam/timezone settings; dark appearance; waiting service-worker update applied with progress preserved.
- Computer Use: responsive 400 px phone-width layout inspected visually. Chrome DevTools Offline mode enabled, page reloaded successfully with saved XP and home content; normal network conditions restored afterward.
- Local server tested at /games/Clay/AP%20Psychology/ to match the deployment subdirectory containing a space.
- Original screenshot contents manually reviewed. Ambiguous GABA cell excluded; scientific clarifications documented in SOURCES.md. Screenshots and learner progress are not published.

Still requires real-device verification: iOS/Android installation, touchscreen use on physical phones, and screen-reader reading. Cross-tab atomicity and actual backup file-picker round trips were not re-exercised for this release; the inherited storage logic has unit-level validation.
