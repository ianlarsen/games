# Spacedash

A small Phaser playground. Collect eight shards and reach the portal on the right.

## Run on Windows

Double-click **Start Game.bat**, then open **http://localhost:8000** in your browser. Keep the server window open. Stop it with Ctrl+C.

Or open PowerShell and run:

```powershell
Set-Location -LiteralPath 'C:\Users\ianla\Documents\games\spacedash'
node server.cjs 8000
```

Then open http://localhost:8000. If port 8000 is occupied, use 8001 in both the command and browser address. Node.js is required for this launcher and is already available on this laptop; no npm installation is needed. The game itself only requires a browser.

## Controls

- A/D or left/right arrows: move
- Space, W, or up arrow: jump; press again for a double jump
- Shift or K: dash (short cooldown); dashing through drones destroys them
- J: shoot (hold for repeat shots)
- P: pause, R: restart, M: toggle sound
- Onscreen buttons also support touch/pointer input

## iPhone

Open the GitHub Pages address ending in `/spacedash/` in Safari and tap Start playing. Hold Left/Right with one thumb while tapping Jump or Dash with the other. Tap Jump twice for a double jump; hold Fire for repeat shots. Dash displays its cooldown. Pause, Restart, and Sound are always accessible above the game.

Portrait shows a closer view of the world; landscape reveals more of the course. The layout follows Safari's visible height and respects the notch/home-indicator safe areas. The game pauses when you switch apps or leave the tab; tap Resume on return. All held controls are cleared on pause or pointer cancellation. Sound resumes from a tap after interruption.

Optional: Safari's Share menu → Add to Home Screen opens the game with less browser chrome. An internet connection is still needed to load the game; this is not an offline app. No fullscreen or orientation-lock API is required.

The renderer retains a fixed vertical world size, caps its drawing size, and limits live burst particles to 80. Jump input has a brief landing buffer and grace period after leaving a ledge. Controls prevent scrolling and long-press menus without disabling page zoom globally.

## Verification

Pointer-state tests cover simultaneous move/jump/fire, releasing one finger without releasing another, repeated jump taps, and clearing inputs after interruption. Browser layout checks cover small and large phone sizes and rotation. These checks do not replace testing on actual iPhone Safari, especially safe-area behavior, simultaneous touches, audio after calls/app switching, and sustained performance.

Three shields per run. Hazards return you to a nearby floor checkpoint, retaining shards. Losing all shields starts a new run. Leaving the browser window pauses the game.

## Features and limits

Pinned local Phaser 4.2.1; Arcade collision physics, an animated robot, tweened shards, a moving platform, projectiles, drones, parallax, a following/shaking camera, procedural particle bursts, and synthesized Web Audio sounds. All art is original and generated at runtime; no external asset requests or build dependencies. Sound starts after interaction, as required by browsers. This demo uses simple rectangle collision shapes, not Matter's joints or complex rigid bodies.

For GitHub Pages, keep this folder at `spacedash/` in the games repository. Its index.html, css/, and js/ use only relative runtime paths. Start Game.bat and server.cjs are only for local use. No build step is required.
