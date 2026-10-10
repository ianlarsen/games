# Robot Bunny

The original game remains at index.html, including its upgrades, badges and saved progress. The new Phaser edition lives at engine/index.html and is linked from the original start screen. It uses the original artwork and sounds, with separate best-score storage. It is a playable alternate edition; the original perk/shop systems have not been ported.

## Play locally on Windows

In PowerShell:

```powershell
cd "C:\Users\ianla\Documents\games\robotbunny"
node serve.mjs
```

Open http://localhost:8000/engine/ for Phaser, or http://localhost:8000/ for the original. Node.js is available on this laptop. No npm installation is required to play the committed build. Keep the server running; Ctrl+C stops it.

For an iPhone on the same Wi-Fi, find the laptop’s IPv4 address with ipconfig and open http://YOUR-IP:8000/engine/ in Safari. Windows Firewall may need to allow Node.js on your private network. GitHub Pages also works at https://ianlarsen.github.io/games/robotbunny/engine/ without the laptop running.

## Edit and rebuild

Install Node.js 22.12+ (or 20.19+). Then npm ci, npm run dev. Open the address Vite prints. npm run build generates engine/, using relative URLs and the existing ../images/, ../sounds/ and ../biome-config.json. Upload the whole robotbunny folder to static hosting. Existing docs/, experimental src/ and native iOS projects are preserved. Canonical Phaser source is phaser/src/.

Phaser is pinned to 3.90.0. Arcade Physics runs at 60 fixed steps per second. Controller and enemy/boss simulation run on physics steps; drawing, camera smoothing and visual-only squash run independently. Projectiles have bounded pools and disabled bodies when recycled. Course bounds derive from the generated course, and platforms use one-way collisions. Jump buffering, coyote time, variable jump height, double jump, dash, held fire, boss telegraphs, two boss phases and progressing sectors are included.

Keyboard: A/D or arrows move; Space/W/Up jump; X fires; Shift dashes; Escape pauses; Enter starts/resumes/continues. Touch controls support simultaneous fingers with pointer capture. Sound defaults off; toggle it after tapping. Hidden/backgrounded runs pause and release all inputs. Restart is always available, including after losing.

Browser limitations: audio requires a user gesture; iOS may suspend it when backgrounded. This is not an offline app or an App Store build. GPU speed, Safari power-saving and thermal limits can still reduce displayed frame rate. Fixed steps keep normal 30/60/120 Hz play consistent, but cannot make a severely stalled browser run at full speed. The original edition now also uses a bounded 60 Hz simulation instead of frame-dependent updates; excess time during long stalls is discarded to avoid a catch-up freeze.

## iPhone performance and bundled app compatibility

Both editions now avoid downloading every long music track before play. The original also loads planet backgrounds as levels need them and releases previous planet references. Its render loop caps drawing near 60 Hz on ProMotion displays, while the simulation stays at 60 Hz; HUD updates run at 10 Hz. Sound decoding avoids duplicate pending work, releases compressed copies after decoding, caps simultaneous effects, and disconnects finished audio nodes. The original uses a visible Resume screen after focus loss, backgrounding or pause, and stops audio during that interruption. Its existing upgrades and save keys are preserved.

Phaser uses two background images sharing one texture instead of a world-sized TileSprite, streams long music only after sound is enabled, skips muted effects, and reuses at most two sound instances per effect. Effects and particles remain bounded. The canvas is capped at 1280 by 560 design pixels and does not multiply its size by the iPhone's device pixel ratio. WebGL canvas multisampling is disabled while artwork keeps smooth texture filtering. Rendering targets 60 Hz with a 61 Hz scheduling limit to tolerate normal 60 Hz timing jitter; Arcade Physics remains fixed at 60 Hz. Tiny viewport changes are coalesced before reallocating the canvas. Reduced-motion preferences disable shake and reduce particles.

The production build is now a deferred classic script with biome data included in it. This avoids ES-module and JSON-request restrictions in a bundled file page. On file:// pages, Phaser uses Canvas rendering, direct image elements and bounded HTML audio effects instead of XHR/Web Audio loading. The web build continues to use automatic WebGL selection and Phaser Web Audio effects. The same code pauses on backgrounding and requires an explicit Resume action.

The existing Swift wrapper still loads www/index.html (the original edition). To use Phaser in that wrapper, load the index resource from the www/engine subdirectory and include engine/, images/ and sounds/ in www/, retaining their paths. Neither node_modules/ nor the development source is needed in the app bundle. The Phaser page hides links to the original edition when opened from a bundled file. Changing the entry point does not port the original upgrade/perk systems. These packaging changes are prepared and checked structurally, but WKWebView playback, offline loading, long sessions and memory use must be verified on an actual iPhone/TestFlight build. Windows cannot run Xcode or the iOS simulator.

After npm run build, run node scripts/verify-mobile.mjs to check lazy startup, audio lifecycle and pool limits, simulation/draw timing at 30/60/120 Hz, and the deferred classic-script output.
