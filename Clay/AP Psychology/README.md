# Clay’s Psychology Lab

AP Psychology study practice for the **October 28, 2026** test, with America/New_York study days. Built from the visible content of four supplied screenshots. Includes 60 stable objectives: 57 automatically graded and three self-assessed explanations, across four topics. This does not claim full AP Unit 1 coverage.

Live URL after deployment: https://ianlarsen.github.io/games/Clay/AP%20Psychology/

Run `node server.js` and visit http://127.0.0.1:4173/ (or set PORT). No dependencies. Use HTTP, not file://. Run `npm test` and `npm run validate`.

Today prioritizes new material and due reviews, estimates workload, and adapts to the saved exam date. October 27 offers a comprehensive check in ten-question blocks; October 28 offers an optional warm-up. Practice includes short sessions, topic practice, application challenges, matching, typed recall, and rubric-based writing. Explore includes notes, terms, a messenger comparison, and labeled scientific clarifications. See SOURCES.md and COVERAGE.md.

Mastery requires three consecutive unassisted first-try successes on separate study days at least 20 hours apart. Hints, reveals, retries, same-day repeats and self-assessed writing do not earn mastery. Dates do not guarantee readiness. XP rewards effort. Pausing saves the current answer and session. Repeated mistakes feed Trouble Spots. Wrong answers after mastery require refreshing while preserving past achievements.

Progress is stored locally in a separate `clay-psychology-v1` IndexedDB database. It does not synchronize across devices or affect World History progress. Export/import from Settings to back up or move progress. Sound is off by default. Light/dark themes follow system settings unless changed. Offline use works after a successful online load. Install support depends on the browser. Service-worker cache names are isolated from World History; updates wait until a saved session is complete.

Publish app files only. Do not upload original screenshots, private learner data, or QA artifacts. Increment the cache version when changing runtime files. Original Study Atlas engine and layout are adapted from the adjacent AP World History app. New content uses stable `psy-` IDs and compatible versioned content records; semantic answer changes require a question version increment.
