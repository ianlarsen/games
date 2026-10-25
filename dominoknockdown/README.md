# Domino Knockdown

A touch-first 3D domino game on a wooden floor, with classic black dominoes and white dots, made with HTML, CSS, JavaScript, and a locally bundled Three.js renderer. No build step or runtime CDN is needed.

## Play

1. Draw one continuous path with a finger, Apple Pencil, or mouse. Lift and continue from the end ring. Or choose one of five **Preset paths**: The spiral, The switchback, Nested circuit, The garden maze, and Ribbon run. The four complex presets include long alternating lanes, a rectangular spiral, a winding maze, and nine waves joined into a continuous route. Choosing a preset replaces the current path.
2. Press **Ready** to place the dominoes, then **Go** to start the cascade.
3. **Ride along** travels just ahead of the fall and looks backward. **Overhead** watches the whole tabletop.
4. **Stop** resets the chain. After a full cascade, **Replay** runs it again, **Edit path** returns to drawing, and **Clear** starts over.

Undo removes the latest drawing stroke. Paths cannot cross, double back sharply, or leave the drawing area marked on the floor. The path and sound/view preferences save locally when browser storage is available. The first version allows up to 360 dominoes. Domino falls are deterministic animations, not a rigid-body physics simulation, so a supported path completes reliably.

**Gentle motion** selects a stationary overhead camera and a slower fall. It defaults on when the device requests reduced motion. Sound starts only after a user gesture and can be muted. Multi-touch does not interrupt an active stroke. Rotation preserves the path, and backgrounding pauses the cascade without advancing it offscreen.

## Serve

Serve this folder through HTTP or HTTPS; JavaScript modules cannot run from a `file://` URL. For example, from the repository root:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080/dominoknockdown/`. For iPad, use the host computer's LAN address or the deployed HTTPS URL. All assets live under this folder, so it also works as a GitHub Pages subdirectory. The repository's existing root landing page is left intact.

## Development

No dependencies need installing. With Node.js available:

```sh
cd dominoknockdown
npm run check
npm test
```

The renderer uses instanced domino meshes, shared geometry/textures, one shadow-casting light, a bounded domino count, and a capped device pixel ratio. Intended for current Safari on iPad with WebGL 2, and current Chrome/Safari desktop browsers. Device emulation is useful for layout and touch checks; final frame rate and sound behavior should also be checked on a physical iPad before an App Store release.

## Files

- `index.html` / `style.css`: responsive game interface and accessible controls.
- `game.js`: scene, input, cascade, camera, sound, and local saving.
- `path.js`: smoothing, spacing, and path validation.
- `path.test.mjs`: geometry and domino budget tests.
- `vendor/three.module.js`: Three.js r170, MIT licensed; see `vendor/THREE-LICENSE.txt`.

Game source is covered by the repository's license; Three.js retains its separate MIT license.
