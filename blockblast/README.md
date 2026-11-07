# Block Blast — ad-free browser edition

Play: https://ianlarsen.github.io/games/blockblast/

A self-contained, independently implemented block puzzle for phones, tablets, and desktop browsers. No ads, purchases, analytics, accounts, external assets, or runtime dependencies. All new code is confined to this folder; the repository landing page and other games are unchanged.

## Play

- Drag a piece from the three-piece tray onto the 8×8 board. On touchscreens, the dragged piece floats above your finger.
- Or tap a piece, then tap the square for its **top-left bounding corner**. Keyboard: **1 / 2 / 3**, arrow keys, **Enter**; Escape deselects.
- Pieces have fixed orientations. Fill a row or column with any colors to clear it. Crossing lines clear simultaneously. Remaining blocks do not fall.
- Place all three pieces to receive another hand. A piece that cannot fit is dimmed; another piece might clear space for it. A round ends when no remaining piece fits.
- **Classic:** endless play with a sparse Android-style opening board, saved best score, and combos. A combo increases on each clearing move and resets after a whole three-piece hand clears nothing.
- **Adventure:** original deterministic gem-collection levels. Clear gem-bearing lines within the move allowance. Progression and the current Classic and Adventure rounds save separately on the device.
- Settings toggle synthesized sounds and vibration. Restart asks before discarding a round.

Open the link once online to cache the game. Subsequent visits can work offline after the service worker finishes installing. Use the browser's Add to Home Screen option for convenient access. Storage is local to the browser/device; clearing browser data removes progress. If storage is unavailable, the game still plays without persistence.

## Fidelity and research

This is a recreation of the core gameplay, **not a pixel-identical copy of Hungry Studio's application**. The code, cube artwork, audio, and Adventure layouts are newly created. There is no copied APK, proprietary code, logo, audio recording, or extracted level data.

Research checked on November 7, 2026:

- [Official Android listing](https://play.google.com/store/apps/details?id=com.block.juggle): HungryStudio's Block Blast, package `com.block.juggle`; 8×8 board, dragged colorful blocks, full row/column clears, combinations, personal bests, offline single-player play, daily goals, and ads/in-app purchases.
- [Official game website](https://www.blockblast.com/): identifies the developer, drag-and-drop puzzle loop, and classic/adventure experiences.
- [Player reports on Android versus iPhone](https://www.reddit.com/r/blockblast/comments/1ev07g2/android_vs_iphone_classic_mode/): describe Android prefilled boards and differences in combo behavior. These are player observations, not an official rules specification.
- [Player strategy discussion](https://www.reddit.com/r/blockblast/comments/1hl87zk/block_blast_ultimate_high_score_guide/): three-piece hands, large squares, L pieces, long straight pieces, and preserving space. This is secondary evidence.

The public sources do **not** specify a stable exact scoring formula, full piece distribution, adaptive difficulty, per-version combo thresholds, all Adventure levels, or event schedules. Those cannot honestly be called identical. This edition uses 35 fixed shapes, uniform selection, and ensures at least one piece in a new hand fits. It does not guarantee all three will fit. Scoring is one point per placed cell, plus `10 × lines² × combo` for a clear, plus 300 for clearing the whole board. These are explicit recreation choices. Daily/live events, proprietary skins, advertising revives, and commercial features are not reproduced.

## Development

No build or package installation is needed:

```sh
python3 -m http.server 8000
# Open http://localhost:8000/blockblast/ when serving the repository root.
node blockblast/tests/engine.test.cjs
```

`engine.js` contains pure rules and deterministic random state. `game.js` handles canvas rendering, input, audio, dialogs, and local persistence. `sw.js` caches only this folder's files and leaves sibling games alone. Bump the cache version and revise the asset list when changing shipped resources. Updates take effect when old game tabs close and the new worker activates.

Tests cover simultaneous intersecting clears, collision/bounds checks, tray replacement, combos, no-move detection, Adventure win/loss, save validation, seeded generation, and 100 simulated games. Manual browser verification covers mobile layouts, mouse dragging, tap-style and keyboard placement, resume, restart, settings, and offline reload. iPad portrait and landscape viewport checks are included. Real-device iPad/Android touch and Safari testing have not been performed. On iPad, open the game in Safari and use Share → Add to Home Screen; an Apple touch icon and standalone layout are provided.
