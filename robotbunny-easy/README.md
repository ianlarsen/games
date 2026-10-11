# Robot Bunny Easy

[Play on iPhone or desktop](https://ianlarsen.github.io/games/robotbunny-easy/)

The main page uses the original Robot Bunny game, including its artwork, ten planets,
bosses, music, joystick, touch controls, coins, upgrades and mobile performance fixes.
Rotate your iPhone to landscape and tap to start. The player cannot be hurt, touching
an enemy damages it, and each jump guides the bunny onto the next platform in the
direction of travel (or the facing direction when standing still). Lasers auto-aim.
Lava and projectiles cannot end your run; a safety floor catches falls.
Easy mode saves are separate from the original game. The original remains untouched.

All 43 original images and 22 sounds are copied into public/images and public/sounds.
The root index.html is ready to play on GitHub Pages without installing anything.
easy-mode.js isolates assisted jumps and aiming from the original rendering code.

The future Phaser/Vite edition remains in phaser/src and has a committed playable
build at engine/index.html. Run npm install, npm test and npm run build to rebuild
engine/. Vite development uses npm run dev on port 5174. To test the main original
edition locally, run node serve.mjs and visit http://localhost:5176/.
