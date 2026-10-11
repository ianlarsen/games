# Robot Bunny Easy

Separate Phaser/Vite edition based on ../robotbunny. The original is untouched.

## Run

Use Node.js 20.19+ or 22.12+. Run npm install, then npm run dev.
Open http://localhost:5174. Use npm run build (or npm run build:local) and
npm run preview to check the self-contained dist output. Serve dist over HTTP;
the source page is a Vite entry point, not a standalone file to double-click.

## Easy rules

- No health loss, death, knockback, or fall penalty. Continuous ground catches jumps;
  a defensive recovery also handles an unexpected out-of-world fall.
- Touching enemies destroys them. Boss contact removes one HP every 0.35 seconds.
- Each laser aims at the closest active enemy or boss, even before the boss wakes.
  Without a target it fires in the facing direction. Lasers travel in that direction
  rather than homing after launch; normal terrain collisions still apply.
- Wide platforms, small gaps, a stepping platform, full-height tap jumps, double jump,
  coyote time, input buffering, and horizontal landing assistance ease platforming.
  Begin a jump while moving toward a platform to enable assistance; pressing the
  opposite direction cancels it. Dash and manual jumps remain available.
- Keyboard: A/D or arrows, Space/W/Up to jump, X to fire, Shift to dash, Escape to pause.
  Touch controls support simultaneous movement, jumping and firing.
- Sound toggle enables copied effects and music after a user gesture. Easy scores
  use a separate browser storage key.

Source lives in phaser/src: scenes manage gameplay; game/easyMode.js contains aim and
landing helpers, course.js supplies platforms, and music.js/fileSounds.js handle audio.
Assets are copied locally and into dist; no dependency on the original game at runtime.
Run npm test for regression checks.

Images and sounds live in public/images and public/sounds. Vite serves them during
development and copies them into dist automatically.
