# Z & S Play

Six touch-friendly games for Zion and Samaria. Open **index.html** to play.
The approved logo is unchanged. Core play uses only files in this folder.

- **Paint Studio:** eight new coloring scenes, free painting, named artist colors,
  brush sizes, eraser, fill, undo/redo, saved artwork, and downloads.
- **Picture Remix:** exactly 4 × 4 tiles; any two positions can swap. Every scene
  has 16 distinct tile images. Winning requires each tile in its original position.
- **Match Quest:** animals, space, food; six, eight, or twelve pairs.
- **Number Quest:** three levels, arithmetic, comparison, patterns, ordering,
  and an optional timer.
- **Pattern Beats:** four gentle musical tones and a growing memory sequence.
- **Shape Builder:** Cat, Fish, Swan, Cottage, Tall House, Sailboat, and Harbor
  Sailboat. All seven pieces retain exact tangram geometry. Drop a piece near its
  matching space and it turns and clicks into place, or select it and tap its space.

The blue **Main screen** button is always visible. On narrow screens **Audio**
opens independent music and effects controls. Music starts after a tap.

## Saving and tablets

Choose Zion or Samaria to keep artwork, scores, and stickers separate. These
save in the browser on the current device and address. Clearing browser data
removes them. Tap a saved artwork to download it; the gallery has twelve slots.

For consistent saving on Fire/Silk, serve the folder at a stable address on your
home network or a static website. Local file viewing differs between tablet
versions. Browser testing covers touch and 360, 390, 600, and 1100 pixel layouts;
physical Fire-tablet testing is still needed.

## Artwork and music

The eight coloring and remix scenes are editable SVG artwork: Treehouse Trail,
Turtle Reef, Rocket Launch, Sunflower Cottage, Sailboat Bay, Dinosaur Valley,
Fox Garden, and Unicorn Meadow. Coloring regions have unique fillable IDs.

Seven original 24-bar arrangements use softer piano/guitar/bell synthesis, bass,
warm pads, brushed percussion, varied voicings, stereo ambience, and gentle
mastering. Runtime music is 44.1 kHz stereo MP3. Pattern tones and key effects
have also been softened. Earlier pack assets remain as legacy resources;
Balance Dash and Marble Lab are removed from the playable app.

## Optional authoring tools

Core play needs no packages. `tools/create_scene_art.py`,
`tools/create_tangrams.py`, and `tools/compose_music.py` generate the revised
assets. Music generation needs NumPy and imageio-ffmpeg. Run
`tools/refresh_game_data.py` after editing assets to update the local data bundle
and checksums. The older `build_assets.py` belongs to the initial pack and should
not be used to regenerate this edition.

`tests/smoke.cjs` runs browser checks using Playwright against a locally served
copy. Set ZANDS_QA_URL to its address; BROWSER_CHANNEL can select an installed
browser. The tests do not need accounts or external services.
