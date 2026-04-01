# Robot Bunny Platformer — Moon Edition (Endless)

## Version 2.0 - Endless Mode Update

Transform from a fixed 3-level platformer into an infinite, self-scaling platformer with dynamic music and procedural generation.

## 🎮 Features

### Endless Progression
- **Procedural Generation**: Infinite segments with varied chunk types (safe, traversal, challenge, treasure, hazard)
- **Threat Level Scaling**: Difficulty automatically scales with distance and performance
- **Dynamic Biomes**: Rotate through 4 unique biomes (Lunar Crater, Low Gravity Zone, Ancient Ruins, Deep Caverns)
- **Boss Encounters**: Epic boss battles every 6-8 segments with phase-based mechanics

### Meta Progression
- **Persistent Coins**: Coins now carry between runs, including game-over runs
- **Looping Progression**: Complete levels, fight bosses, and cycle through 10-level loops
- **Stat Tracking**: High score and highest level are saved in LocalStorage

### Dynamic Music Engine
- **Multi-Stem System**: 8 independent audio layers (melody, bass, chords, arp, percussion, FX)
- **Intensity Mapping**: Music adapts to threat level and combat activity
- **Biome-Specific Scales**:
  - Crater: D Dorian
  - Low G: A Lydian
  - Ruins: E Phrygian Dominant
  - Caverns: C Aeolian
- **Dynamic BPM**: Tempo increases from 92-132 based on intensity
- **Musical Transitions**: Stingers for key events (hits, boss phases, combo milestones)
- **Web Audio API**: Precise scheduling with 25ms lookahead

### Advanced Enemy System
- **Scaled Stats**: Enemy health and speed increase with threat level
- **Enemy Variety**:
  - Hopper: Bouncing enemies
  - Walker: Rolling ground enemies
  - Flyer: Airborne enemies (TL 3+)
  - Tank: High health enemies (TL 8+)
  - Sniper: Ranged enemies (TL 12+)

### Boss System
- **Phase-Based Combat**: Bosses gain new abilities as they lose health
- **Multiple Attacks**:
  - Charge: Rush towards player
  - Projectile Spread: Fire multiple projectiles
  - Ground Pound: Area attack (TL 10+)
- **Scaling Rewards**: Higher threat levels = better boss rewards

## 📁 Architecture

### Current Runtime Build
- **`index.html`**: Primary shipped game runtime (canvas renderer, loop, input, audio, enemies, bosses)
- **`boss-system.js`** and **`game.js`**: Experimental modular systems not currently wired into the shipped page

### Configuration Files (JSON)

#### `biome-config.json`
Defines visual themes and musical characteristics for each biome:
- Colors (background, platforms, stars)
- Musical scale and root frequency
- Scale intervals
- BPM range

#### `music-patterns.json`
Defines the music engine configuration:
- Stem definitions (instruments and their synthesis parameters)
- Musical patterns (note sequences, rhythms)
- Intensity layer mappings
- Stinger definitions
- FX bus configuration (reverb, compression, sidechain)

#### `level-config.json`
Defines procedural generation parameters:
- Segment dimensions and scaling rules
- Chunk type definitions and transitions
- Enemy types and spawn rules
- Powerup configurations
- Boss mechanics
- Ability definitions
- Progression formulas

## 🎹 Controls

### Keyboard
- **Arrow Keys / A,D**: Move left/right
- **Space / ↑ / W**: Jump
- **X**: Shoot laser
- **Q**: Cycle performance mode (Low / Balanced / High)
- **ESC**: Pause
- **R**: Restart (when game over)

### Mobile
- **Touch Buttons**: On-screen controls for movement, jumping, and shooting
- **Perf HUD Button**: Tap the performance chip to cycle Low / Balanced / High
- **Tap Canvas**: Start game, continue after level complete, restart after game over

### Diagnostics
- **Live FPS Meter**: Displays smoothed frame rate in the HUD to help tune performance mode

## 🔧 How It Works

### Procedural Generation
1. **Segment Generator** creates new level chunks based on threat level
2. **Chunk Types** determine platform density, enemy count, and rewards
3. **Transition Rules** ensure variety while maintaining flow
4. **Scaling Parameters** increase difficulty organically

### Music System
1. **Scheduler** uses Web Audio API with 150ms lookahead
2. **Stems** are independently scheduled based on intensity
3. **Intensity** calculated from threat level (70%) and combat heat (30%)
4. **Layers** activate progressively:
   - Low (0-33%): Bass + Chords
   - Mid (33-66%): + Melody + Hi-hats
   - High (66-100%): + Snare + Arp + Kick + FX
5. **Combo Milestone** (10+) adds counter-melody

### Threat System
1. **Threat Level** increases by 0.5 per segment completed
2. **Heat** tracks short-term combat intensity
3. **Combined Intensity** drives music and visual feedback
4. **Scaling Formulas** applied to gaps, vertical delta, enemy stats

### Meta Progression
1. **XP Gains**: Coins (10), Enemies (50), Bosses (500), Segments (100)
2. **Level Formula**: `baseXP * (level ^ 1.5)` - logarithmic scaling
3. **Persistent Storage**: LocalStorage saves coins, fragments, abilities, XP
4. **Ability Unlocks**: Level gates ensure progression curve

## 🚀 Running the Game

Simply open `index.html` in a modern web browser.

**Requirements**:
- Modern browser with Canvas and Audio support
- Web Audio API support
- LocalStorage enabled

## 📊 Statistics Tracked

- Distance traveled (meters)
- Enemies defeated
- Bosses defeated
- Coins collected
- Highest combo
- High score
- Highest level reached

## 🎨 Biome Themes

### 🌑 Lunar Crater
Dark, classic moon surface with D Dorian scale. Starting biome with moderate challenge.

### 🎈 Low Gravity Zone
Lighter atmosphere with extended jump physics. A Lydian scale gives an uplifting feel.

### 🏛️ Ancient Ruins
Mysterious abandoned structures with E Phrygian Dominant scale for exotic tension.

### 🕳️ Deep Caverns
Darkest theme with narrow passages. C Aeolian (natural minor) for haunting atmosphere.

## 🔮 Future Enhancements

Potential additions:
- More ability upgrades
- Leaderboards
- Daily challenges
- Achievement system expansion
- Additional enemy types
- Power-up variety
- Boss attack patterns
- Multiplayer co-op mode

## 📝 Credits

- **Original Game**: Robot Bunny Platformer — Moon Edition
- **Endless Mode Design**: Based on modern roguelike progression systems
- **Music Engine**: Web Audio API with procedural composition
- **Procedural Generation**: Inspired by Spelunky and Celeste

---

**Version**: 2.0.0
**Last Updated**: 2025-11-06
**License**: MIT
