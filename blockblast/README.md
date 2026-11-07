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

The public sources do **not** specify a stable exact scoring formula, full piece distribution, adaptive difficulty, per-version combo thresholds, all Adventure levels, or event schedules. Those cannot honestly be called identical. This edition uses a conservative set of 33 connected Classic shapes and board-aware selection. Every new hand on a playable board has at least one legal sequence that uses all three pieces, accounting for line clears. Choosing different placements can still leave no legal move. Scoring is one point per placed cell, plus `10 × lines² × combo` for a clear, plus 300 for clearing the whole board. These are explicit recreation choices. Daily/live events, proprietary skins, advertising revives, and commercial features are not reproduced.

## Development

No build or package installation is needed:

```sh
python3 -m http.server 8000
# Open http://localhost:8000/blockblast/ when serving the repository root.
node blockblast/tests/engine.test.cjs
```

`engine.js` contains pure rules and deterministic random state. `game.js` handles canvas rendering, input, audio, dialogs, and local persistence. `sw.js` caches only this folder's files and leaves sibling games alone. Bump the cache version and revise the asset list when changing shipped resources. Updates take effect when old game tabs close and the new worker activates.

Tests cover simultaneous intersecting clears, collision/bounds checks, tray replacement, combos, no-move detection, Adventure win/loss, save validation, seeded generation, and 100 simulated games. Manual browser verification covers mobile layouts, mouse dragging, tap-style and keyboard placement, resume, restart, settings, and offline reload. iPad portrait and landscape viewport checks are included. Real-device iPad/Android touch and Safari testing have not been performed. On iPad, open the game in Safari and use Share → Add to Home Screen; an Apple touch icon and standalone layout are provided.

### Piece catalog correction

The deal pool is restricted to connected Classic pieces: singles, straight bars (2–5), 2×2 and 3×3 squares, 2×3 rectangles, small and large corners, L/J, T, and S/Z pieces in the explicitly listed orientations. No disconnected diagonal or generated/custom pieces are dealt. This is a familiar Classic subset, not a claim to enumerate every shape in every app version. [Version-scoped Android observations](https://blockblast.co/faq#does-a-diagonal-block-in-the-original-app-need-an-empty-rectangle) report diagonals in some versions; their removal here is a conservative choice, not proof they never appear in the original.

Old saves automatically retain their board, score, combo, level, and used tray slots. Only retired diagonal pieces are replaced with connected pieces; if no same-size connected piece fits, a single block preserves a playable option. The offline cache version is bumped for the update.

### Board-aware piece generation

Each new hand is planned against the current board. The dealer simulates three legal placements, clearing complete rows and columns between them, and then shuffles those three shapes into the tray. It prefers opportunities to clear lines and Adventure gems, followed by placements that help finish existing rows/columns. Random selection among similarly useful options and a repeat penalty retain variety. It uses only the existing connected Classic catalog.

All three pieces have a geometrically legal sequence at deal time; not every order or placement is safe, and Adventure move limits still apply. An initially dimmed piece can become usable after another piece clears space. Existing trays and saved progress are retained; the improved dealer applies at the next refill or new round. This is an independently designed helpful dealer, not a claim about the original app's private algorithm.

Dealer validation adds independent array-based replay on 300 mixed-density boards, a one-gap board requiring clears before larger pieces fit, fragmented boards, immediate clear opportunities, deterministic generation, and piece variety. The complete regression suite now has 20 tests.
