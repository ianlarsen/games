# Phaser Migration Plan

Date: 2026-04-12

## Current Project Audit

1. The shipped browser game lives in [index.html](index.html) as one large canvas runtime with inline CSS, input, audio, rendering, and progression logic.
2. [game.js](game.js) and [boss-system.js](boss-system.js) are modular experiments, but they are not wired into the live page and reference additional modules that are not present in this workspace.
3. Assets are already organized well enough for migration: `images/`, `images/ui/`, and `sounds/` can be preserved as-is.
4. The current runtime already targets a 960x560 playfield, pixel-art rendering, localStorage saves, mobile controls, and performance presets. Those should remain migration anchors.
5. iOS packaging currently assumes relative web paths remain stable, so the migration should preserve `images/...` and `sounds/...` URLs.

## Migration Strategy

1. Establish a Phaser baseline in a separate source tree.
   Keep the legacy runtime intact while the new engine takes shape.
2. Port core loop responsibilities into Phaser scenes and services.
   Use Phaser for game loop, camera, physics, asset loading, and scene lifecycle.
3. Preserve current feel first.
   Match gravity, jump strength, world size, camera framing, and asset usage before adding new systems.
4. Move systems in this order:
   - Player movement and camera
   - Platforms, coins, enemies, and laser combat
   - HUD and start flow
   - Procedural segment generation
   - Bosses and biome rotation
   - Audio, meta progression, and save data
5. Keep the GitHub Pages artifact deterministic.
   Build into `docs/` so Pages can serve the generated app directly from the main branch.

## Recommended Phaser Architecture

1. `phaser/src/scenes/BootScene.js`
   Asset preloading, loading UI, config fetches.
2. `phaser/src/scenes/PlayScene.js`
   Minimum viable side-scroller loop with Arcade Physics.
3. `phaser/src/game/createGame.js`
   Central Phaser config, scaling, and scene registration.
4. Future extraction targets:
   - `systems/player-controller.js`
   - `systems/segment-generator.js`
   - `systems/audio-manager.js`
   - `systems/save-data.js`
   - `entities/enemy-factory.js`

## GitHub Pages Workflow

1. Develop with `npm run dev`.
2. Build with `npm run build`.
3. Commit the generated `docs/` folder.
4. In GitHub Pages settings, serve from the `main` branch and `/docs` folder.

## Vite Base Path

1. Local development should use `/`.
2. GitHub Pages project sites should use `/robotbunny/`.
3. This repo uses `.env.pages` so `npm run build` automatically builds with the Pages base path.
4. If the repository name changes, update `VITE_BASE_PATH` in `.env.pages`.

## Minimum Viable Scope Added In This Pass

1. Phaser + Vite workspace scaffold
2. GitHub Pages-ready `docs/` build output target
3. Static copy of existing assets and biome config during build
4. One playable Phaser scene with:
   - side-scrolling camera
   - player movement and jump
   - coins, simple enemies, and lasers
   - keyboard and touch controls
   - biome-backed background color

## Next Porting Steps

1. Match current player movement more closely: coyote time, jump buffering, double jump, dash, shield.
2. Replace fixed level layout with segment generation driven by config.
3. Port the current HUD and start screen.
4. Reintroduce music and SFX through Phaser's audio pipeline or a dedicated Web Audio service.
5. Port boss encounters and performance mode controls.
