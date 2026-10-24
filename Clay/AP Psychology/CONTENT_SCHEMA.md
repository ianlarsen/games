# Content schema, version 1

`data/unit.json` must contain `schemaVersion`, `contentVersion`, `unit`, `sources`, `topics`, `summaries`, `terms`, and `questions`.

`unit` has stable `id`, human-readable `title`, initial ISO `exam` date, and IANA `timezone`. `sources` contains exact local authoring filenames. `topics` names the allowed topic groups. `summaries` maps each topic to a concise source-grounded paragraph. `terms` maps terms to definitions.

Each question requires:

- `id`: globally unique stable string. Never reuse for a different objective.
- `version`: positive integer. Increment for changed answer semantics; preserve for equivalent wording edits.
- `unit`, `topic`, `tags`, `objective`, `prompt` and `difficulty` (1–3).
- `format`: `choice`, `recall`, `match`, `map`, or `written`.
- `correct`: exact choice value, canonical factual answer, mapping of row keys to values, or written model answer.
- `explanation`: concise feedback preserving the source’s expected answer.
- `sources`: one or more `{file, location, section}` objects, with exact filename and slide/page locator.
- `basis`: `source` for stated facts, `synthesis` for reasoning linking source claims.
- `variants`: equivalent prompt strings sharing this ID and answer semantics.

For `choice` and `map`, provide `choices` containing the correct value exactly once. Shuffle presentation, never keys. Choice questions also have `distractorFeedback` keyed by each incorrect value.

For `recall`, provide reviewed `acceptedAnswers`. Normalization covers Unicode compatibility, case, surrounding whitespace, collapsed whitespace, and dash variants. Set `typoTolerance: true` only for reviewed terms where one edit on a response of at least seven characters is safe. Short city/country names such as Mali do not use fuzzy grading. An `unordered` array instead requires every listed item exactly once in a comma/semicolon-separated response.

For `match`, `correct` maps each row label to one exact answer. All rows must be correct for mastery; no partial mastery credit. Presentation uses selects for both touch and keyboard and preserves randomized option order in the encounter.

For `written`, provide `rubric` with explicit criteria and a model in `correct`. Grading returns null and the user self-reviews. These never enter automatically verified mastery totals.

Run `node tests/validate.js` after imports and source review. The validator rejects duplicate IDs, unknown topics/sources, missing locators and keys, invalid choices, missing rubrics and non-working accepted answers, and requires a coverage mapping for every question. A new unit may change the expected count in the validator. Manually check historical claims, ambiguity, respectful language and distractor quality.

Progress schema 1 is described by `blankState()` and `validateImport()` in `js/engine.js` and `js/storage.js`. The export includes settings, question progress, full attempt history, encounters, pending session, issues, achievements, reward caps, and clock/spacing safeguards. Imports are a deliberate replacement, not a silent merge.
