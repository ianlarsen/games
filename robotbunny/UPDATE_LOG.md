# Update Log

## 2026-04-05

### Mobile Screen Sizing Fixes

**Time:** April 5, 2026

#### 1. Canvas placement — `#wrap` CSS & `fit()` function
- Added `@media (max-width: 768px), (pointer: coarse)` rule to `#wrap` giving it `padding-top: 40px` and `padding-bottom: 180px` (`box-sizing: border-box`) so the canvas centers in the usable space between the HUD and the on-screen controls.
- Updated `fit()` in the inline `<script>`: replaced the old single `reservedBottom = 220` with `reservedTop = 40` and `reservedBottom = 180`, lowered the `availableH` floor from 220 to 80, and capped mobile `maxH` at 560 (down from 600) to match the canvas's intrinsic height.

#### 2. Start / landing screen — compact landscape layout
- Added `@media (max-height: 480px)` rule targeting `.start-screen`, `.start-title`, `.start-button`, `#start-bunny-canvas`, and `.leaderboard`.
- In landscape on a phone (viewport ~375 px tall) the bunny sprite shrinks to 55×55 px, the title to 26 px, the button to 18 px with reduced padding, and the leaderboard gets a 110 px max-height with scroll, preventing overflow without scrolling the start screen.

#### 3. In-canvas overlay text scaling — game over, level complete, boss intro
- Introduced a display-pixel scale factor `ovS = canvas.height / canvas.clientHeight` computed each draw frame from the canvas's actual CSS rendered height.
- Helper `opx(n)` converts a nominal CSS pixel size to the equivalent canvas pixel size; `oY(off)` positions text correctly relative to canvas centre at any scale.
- All fixed pixel font sizes replaced with `opx()` equivalents:
  - "GAME OVER" / "LEVEL COMPLETE!" headlines: `opx(36)` (was 50 px)
  - Sub-headings and CTA text: `opx(16)`–`opx(18)` (was 20 px)
  - Contract / badge detail lines: `opx(13)`–`opx(15)` (was 14–17 px)
  - Share / action-key lines: `opx(11)`–`opx(12)` (was 12–13 px)
  - Boss intro: `opx(52)` (was 80 px)
- Vertical offsets similarly scaled through `oY()` so lines remain evenly spaced regardless of display size.
