Z & S ASSET PACK

OPTION A: Extract the ZIP, then double-click Install-Zands.cmd to copy new files into the target folder and open the preview. Existing files are skipped, never overwritten.

OPTION B: Extract the CONTENTS of this folder into:
C:\Users\ianla\Documents\games\zands

assets should be directly under zands. Open asset-preview.html to inspect the artwork and play audio. index.html is intentionally reserved for the future game. No playable app is included yet.

All SVG graphics are original code-drawn artwork; no emoji, stock images, external fonts, or network dependencies. Logo is the approved generated illustration. Vector characters are new simplified renditions rather than exact crops of the logo. Music is original synthesized instrumental audio. Nine 20-bar loops, WAV and OGG versions, plus effects and four pattern tones. Music is arranged with periodic tails for WAV looping; use decoded audio buffers for reliable loops.

Coloring pages: inline the SVG for per-region tap fill, using data-colorable and region IDs. Background regions can also be filled. Puzzle pictures: rasterize SVG to canvas and cut into a 4x4 grid. Track geometry includes connector positions and path centerlines; physics is not included. Tangram targets include exact per-piece vertices; reflection is not required.

Audio should begin only after a user tap. Music and effects need separate controls. Use low background music volume, especially in Pattern Beats. All audio is mono 22050Hz, 16-bit PCM WAV; music also available in OGG.

Source generation script: tools/build_assets.py (Python + NumPy + FFmpeg). asset-manifest.json lists all assets and hashes.
