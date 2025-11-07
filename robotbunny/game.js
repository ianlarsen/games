// Main Game Orchestration
import { MusicEngine } from './music-engine.js';
import { ThreatSystem } from './threat-system.js';
import { SegmentGenerator } from './segment-generator.js';
import { MetaProgression } from './meta-progression.js';
import { BossSystem } from './boss-system.js';
import { Player } from './player.js';
import { rand, randInt, clamp, rectsOverlap, roundRect, createParticles } from './utils.js';

export class Game {
  constructor(canvas, ctx, configs) {
    this.canvas = canvas;
    this.ctx = ctx;

    // Load configurations
    this.levelConfig = configs.levelConfig;
    this.musicPatterns = configs.musicPatterns;
    this.biomeConfig = configs.biomeConfig;

    // Initialize systems
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicEngine = new MusicEngine(this.audioCtx, this.musicPatterns, this.biomeConfig);
    this.threatSystem = new ThreatSystem(this.levelConfig);
    this.segmentGenerator = new SegmentGenerator(this.levelConfig, this.threatSystem);
    this.metaProgression = new MetaProgression(this.levelConfig);
    this.bossSystem = new BossSystem(this.levelConfig, this.threatSystem);

    // Game constants
    this.GROUND_Y = canvas.height - 80;
    this.gravity = 2200;
    this.jumpVel = -950;
    this.moveSpeed = 250;
    this.maxVelX = 350;

    // Game state
    this.time = 0;
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.pauseTab = 'info';
    this.camera = { x: 0, y: 0 };
    this.shake = { x: 0, y: 0, intensity: 0 };

    // Biome
    this.currentBiomeId = 'crater';
    this.currentBiome = this.biomeConfig.biomes[this.currentBiomeId];
    this.biomeRotationIndex = 0;

    // Player
    this.player = new Player(100, this.GROUND_Y - 72, 48, 64, this.levelConfig, this.metaProgression);

    // Game entities
    this.lasers = [];
    this.particles = [];
    this.segments = [];
    this.currentSegmentIndex = 0;
    this.nextSegmentX = 0;

    // Background
    this.bgLayers = [
      { elements: [], speed: 0.1, color: this.currentBiome.colors.stars[0] },
      { elements: [], speed: 0.3, color: this.currentBiome.colors.stars[1] },
      { elements: [], speed: 0.5, color: this.currentBiome.colors.stars[2] }
    ];

    // Input
    this.keys = {};
    this.touchButtons = {
      left: false,
      right: false,
      jump: false,
      shoot: false,
      dash: false,
      shield: false
    };
    this.wantShoot = false;
    this.wantDash = false;
    this.wantShield = false;

    // UI
    this.notifications = [];
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    ('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0);

    this.soundEnabled = true;

    // Skins
    this.skins = [
      { id: 'default', name: 'Classic', cost: 0, body: '#aeb7c4', shadow: '#738096', accent: '#7be2ff' },
      { id: 'gold', name: 'Golden', cost: 50, body: '#FFD700', shadow: '#DAA520', accent: '#FFF8DC' },
      { id: 'red', name: 'Crimson', cost: 75, body: '#DC143C', shadow: '#8B0000', accent: '#FFB6C1' }
    ];
    this.currentSkin = localStorage.getItem('rb_moon_skin') || 'default';
    this.unlockedSkins = JSON.parse(localStorage.getItem('rb_moon_unlocked_skins') || '["default"]');

    this.initBackground();
    this.loadInitialSegments();
    this.musicEngine.initMusic();
    this.musicEngine.setMusicBiome(this.currentBiomeId);
    this.musicEngine.startMusic(this.currentBiome.bpmRange[0]);
  }

  initBackground() {
    for (const layer of this.bgLayers) {
      layer.elements = [];
      const count = layer.speed < 0.3 ? 80 : (layer.speed < 0.5 ? 50 : 30);
      for (let i = 0; i < count; i++) {
        layer.elements.push({
          x: rand(0, 4000),
          y: rand(0, this.GROUND_Y - 50),
          size: layer.speed < 0.3 ? rand(1, 2) : (layer.speed < 0.5 ? rand(2, 3) : rand(3, 4)),
          twinkle: rand(0, Math.PI * 2),
          twinkleSpeed: rand(1, 3)
        });
      }
    }
  }

  loadInitialSegments() {
    // Load first 3 segments
    for (let i = 0; i < 3; i++) {
      this.loadNextSegment();
    }
  }

  loadNextSegment() {
    const segment = this.segmentGenerator.generateSegment(this.currentSegmentIndex, this.GROUND_Y);
    segment.startX = this.nextSegmentX;

    // Add ground platform
    segment.platforms.push({
      x: segment.startX,
      y: this.GROUND_Y + 40,
      w: segment.width,
      h: 200,
      type: 'ground'
    });

    // Adjust all positions relative to segment start
    for (const plat of segment.platforms) {
      if (plat.type !== 'ground') {
        plat.x += segment.startX;
      }
    }

    for (const enemy of segment.enemies) {
      enemy.x += segment.startX;
    }

    for (const coin of segment.coins) {
      coin.x += segment.startX;
    }

    for (const powerup of segment.powerups) {
      powerup.x += segment.startX;
    }

    // Check for boss spawn
    if (this.bossSystem.shouldSpawnBoss()) {
      const boss = this.bossSystem.spawnBoss(segment.startX + segment.width / 2, this.GROUND_Y - 100);
      segment.boss = boss;
    }

    this.segments.push(segment);
    this.nextSegmentX += segment.width;
    this.currentSegmentIndex++;
  }

  unloadOldSegments() {
    // Remove segments that are far behind the camera
    while (this.segments.length > 0 && this.segments[0].startX + this.segments[0].width < this.camera.x - 500) {
      this.segments.shift();
    }
  }

  update(dt) {
    if (this.gameOver || this.paused) return;

    this.time += dt;

    // Update threat system
    this.threatSystem.updateThreat(dt);

    const enemiesNearby = this.getAllEnemies().filter(e =>
      Math.abs(e.x - this.player.x) < 300
    ).length;

    this.threatSystem.updateHeat({
      enemiesNearby,
      playerHealth: this.player.lives / 5,
      comboActive: this.player.getCombo() > 5
    });

    // Update music intensity
    const intensity = this.threatSystem.getIntensity();
    this.musicEngine.setMusicIntensity(intensity);
    this.musicEngine.updateCombo(this.player.getCombo());

    // Update player
    const { speedMultiplier } = this.player.update(dt, this.keys, this.touchButtons);

    // Player movement
    const moveLeft = this.keys.ArrowLeft || this.touchButtons.left;
    const moveRight = this.keys.ArrowRight || this.touchButtons.right;
    const wantJump = this.keys.Space || this.keys.ArrowUp || this.touchButtons.jump;

    if (moveLeft) {
      this.player.vx -= this.moveSpeed * dt * 8 * speedMultiplier;
      this.player.facing = -1;
    }
    if (moveRight) {
      this.player.vx += this.moveSpeed * dt * 8 * speedMultiplier;
      this.player.facing = 1;
    }

    if (!moveLeft && !moveRight) {
      this.player.vx *= 0.85;
    }

    this.player.vx = clamp(this.player.vx, -this.maxVelX, this.maxVelX);

    if (wantJump && this.player.onGround) {
      this.player.vy = this.jumpVel;
      this.player.onGround = false;
      this.player.resetJumps();
      this.playSound('jump');
      createParticles(this.particles, this.player.x + this.player.w / 2, this.player.y + this.player.h, '#7be2ff', 6);
    } else if (wantJump && !this.player.onGround) {
      if (this.player.attemptDoubleJump(this.jumpVel * 0.8)) {
        this.playSound('jump');
        createParticles(this.particles, this.player.x + this.player.w / 2, this.player.y + this.player.h, '#7be2ff', 6);
      }
    }

    // Dash ability
    if (this.wantDash) {
      if (this.player.attemptDash()) {
        this.playSound('dash');
        createParticles(this.particles, this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#ffff55', 12);
      }
      this.wantDash = false;
    }

    // Shield ability
    if (this.wantShield) {
      if (this.player.activateShield()) {
        this.playSound('shield');
      }
      this.wantShield = false;
    }

    // Shooting
    if (this.wantShoot && this.player.shootCooldown <= 0) {
      this.lasers.push({
        x: this.player.x + (this.player.facing > 0 ? this.player.w : 0),
        y: this.player.y + this.player.h / 2 - 2,
        w: 20, h: 4,
        vx: this.player.facing * 500,
        dir: this.player.facing
      });
      this.player.shootCooldown = 0.3;
      this.playSound('shoot');
      createParticles(this.particles, this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.player.facing > 0 ? '#ff3333' : '#3333ff', 4);
    }
    this.wantShoot = false;

    // Physics
    this.player.vy += this.gravity * dt;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    // Collision with platforms
    this.player.onGround = false;
    for (const segment of this.segments) {
      for (const plat of segment.platforms) {
        if (rectsOverlap(this.player.x, this.player.y, this.player.w, this.player.h, plat.x, plat.y, plat.w, plat.h)) {
          if (this.player.vy > 0 && this.player.y + this.player.h - this.player.vy * dt < plat.y + 10) {
            this.player.y = plat.y - this.player.h;
            this.player.vy = 0;
            this.player.onGround = true;
            this.player.resetJumps();
          } else if (this.player.vy < 0 && this.player.y - this.player.vy * dt > plat.y + plat.h - 10) {
            this.player.y = plat.y + plat.h;
            this.player.vy = 0;
          }
        }
      }
    }

    // Fall death
    if (this.player.y > this.canvas.height + 100) {
      this.onPlayerDeath();
    }

    // Update camera
    this.camera.x = this.player.x - this.canvas.width / 3;
    this.camera.x = Math.max(0, this.camera.x);

    // Update threat system distance
    this.threatSystem.addDistance(this.player.vx * dt);

    // Load new segments
    if (this.player.x > this.nextSegmentX - this.canvas.width * 2) {
      this.loadNextSegment();
      this.threatSystem.onSegmentComplete();
      this.metaProgression.onSegmentComplete();
      this.rotateBiome();
    }

    // Unload old segments
    this.unloadOldSegments();

    // Update game entities
    this.updateLasers(dt);
    this.updateEnemies(dt);
    this.updateCoins(dt);
    this.updatePowerups(dt);
    this.updateBoss(dt);
    this.updateParticles(dt);

    // Update screen shake
    this.shake.intensity = Math.max(0, this.shake.intensity - dt * 10);
    this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
    this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
  }

  updateLasers(dt) {
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.x += laser.vx * dt;

      if (laser.x < this.camera.x - 100 || laser.x > this.camera.x + this.canvas.width + 100) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Check enemy hits
      for (const enemy of this.getAllEnemies()) {
        if (rectsOverlap(laser.x, laser.y, laser.w, laser.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
          enemy.health--;
          this.lasers.splice(i, 1);
          createParticles(this.particles, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#ff5555', 10);
          this.playSound('hit');
          this.score += 10;
          this.player.incrementCombo();
          this.metaProgression.onEnemyKilled();

          if (enemy.health <= 0) {
            this.onEnemyKilled(enemy);
          }
          break;
        }
      }

      // Check boss hits
      const boss = this.bossSystem.getActiveBoss();
      if (boss && rectsOverlap(laser.x, laser.y, laser.w, laser.h, boss.x, boss.y, boss.w, boss.h)) {
        const result = this.bossSystem.onBossHit(boss, 1);
        this.lasers.splice(i, 1);
        createParticles(this.particles, boss.x + boss.w / 2, boss.y + boss.h / 2, '#ff5555', 15);
        this.playSound('hit');
        this.score += 50;

        if (result.defeated) {
          this.onBossDefeated(result.reward);
        } else if (result.phaseChange) {
          this.musicEngine.queueStinger('bossPhase');
          this.musicEngine.scheduleKeyModulation(3, 2);
        }
        break;
      }
    }
  }

  updateEnemies(dt) {
    for (const enemy of this.getAllEnemies()) {
      this.updateEnemy(enemy, dt);

      // Check player collision
      if (!this.player.invincible && rectsOverlap(this.player.x, this.player.y, this.player.w, this.player.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
        if (this.player.vy > 0 && this.player.y + this.player.h * 0.6 < enemy.y + enemy.h / 2) {
          // Stomp
          enemy.health--;
          this.player.vy = this.jumpVel * 0.6;
          createParticles(this.particles, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#FFD700', 12);
          this.playSound('stomp');
          this.score += 100;
          this.player.incrementCombo();
          this.metaProgression.onEnemyKilled();

          if (enemy.health <= 0) {
            this.onEnemyKilled(enemy);
          }
        } else {
          // Take damage
          this.onPlayerHit();
        }
      }
    }
  }

  updateEnemy(enemy, dt) {
    // Similar to original enemy AI logic
    enemy.animTimer += dt;

    if (enemy.type === 'hopper') {
      enemy.jumpTimer -= dt;
      if (enemy.jumpTimer <= 0 && enemy.vy === 0) {
        enemy.vy = -600;
        enemy.jumpTimer = rand(1.5, 3.0);
      }
      enemy.vy += this.gravity * dt;
      enemy.y += enemy.vy * dt;
      enemy.x += enemy.dir * enemy.vx * dt;
    } else if (enemy.type === 'walker') {
      enemy.x += enemy.dir * enemy.vx * dt;
      enemy.rotateAngle += 0.15 * enemy.dir;
    } else if (enemy.type === 'flyer') {
      enemy.x += enemy.dir * enemy.vx * dt;
      enemy.bobT += 0.08;
      enemy.flapTimer += 0.2;
    }
  }

  updateCoins(dt) {
    const magnetRadius = this.player.getMagnetRadius() + (this.player.hasPowerup('coinMagnet') ? 150 : 0);

    for (const segment of this.segments) {
      for (let i = segment.coins.length - 1; i >= 0; i--) {
        const coin = segment.coins[i];
        coin.sparkleT += dt * 8;

        // Magnet effect
        if (magnetRadius > 0) {
          const dx = this.player.x + this.player.w / 2 - coin.x;
          const dy = this.player.y + this.player.h / 2 - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < magnetRadius) {
            coin.x += (dx / dist) * 300 * dt;
            coin.y += (dy / dist) * 300 * dt;
          }
        }

        // Collection
        if (rectsOverlap(this.player.x, this.player.y, this.player.w, this.player.h, coin.x - coin.size, coin.y - coin.size, coin.size * 2, coin.size * 2)) {
          segment.coins.splice(i, 1);
          this.metaProgression.addCoins(1);
          this.metaProgression.onCoinCollected();
          this.score += 10;
          createParticles(this.particles, coin.x, coin.y, '#FFD700', 8);
          this.playSound('coin');
        }
      }
    }
  }

  updatePowerups(dt) {
    for (const segment of this.segments) {
      for (let i = segment.powerups.length - 1; i >= 0; i--) {
        const powerup = segment.powerups[i];
        powerup.bobT += dt * 3;

        if (rectsOverlap(this.player.x, this.player.y, this.player.w, this.player.h, powerup.x - powerup.w / 2, powerup.y - powerup.h / 2, powerup.w, powerup.h)) {
          segment.powerups.splice(i, 1);
          this.player.applyPowerup(powerup.type, powerup.duration);
          createParticles(this.particles, powerup.x, powerup.y, powerup.color, 12);
          this.playSound('powerup');
        }
      }
    }
  }

  updateBoss(dt) {
    const boss = this.bossSystem.getActiveBoss();
    if (!boss) return;

    this.bossSystem.updateBossAI(boss, dt, this.player);

    // Check boss collision
    if (!this.player.invincible && rectsOverlap(this.player.x, this.player.y, this.player.w, this.player.h, boss.x, boss.y, boss.w, boss.h)) {
      this.onPlayerHit();
    }

    // Check boss projectiles
    for (let i = boss.projectiles.length - 1; i >= 0; i--) {
      const proj = boss.projectiles[i];

      if (rectsOverlap(this.player.x, this.player.y, this.player.w, this.player.h, proj.x, proj.y, proj.w, proj.h)) {
        boss.projectiles.splice(i, 1);
        this.onPlayerHit();
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += this.gravity * 0.5 * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  getAllEnemies() {
    const enemies = [];
    for (const segment of this.segments) {
      enemies.push(...segment.enemies);
    }
    return enemies;
  }

  onEnemyKilled(enemy) {
    // Remove enemy
    for (const segment of this.segments) {
      const index = segment.enemies.indexOf(enemy);
      if (index !== -1) {
        segment.enemies.splice(index, 1);
        break;
      }
    }

    this.score += 50;
    createParticles(this.particles, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#FFD700', 20);
  }

  onBossDefeated(reward) {
    this.metaProgression.addCoins(reward.coins);
    this.metaProgression.addMoonFragments(reward.fragments);
    this.metaProgression.onBossKilled();
    this.score += 1000;

    createParticles(this.particles, this.bossSystem.getActiveBoss().x + 60, this.bossSystem.getActiveBoss().y + 50, '#FFD700', 50);
    this.playSound('levelComplete');
    this.addNotification('Boss Defeated!', `+${reward.coins} coins, +${reward.fragments} fragments`, 4.0);

    this.bossSystem.clearBoss();
  }

  onPlayerHit() {
    const result = this.player.takeDamage();

    if (result.damaged) {
      this.playSound('hit');
      this.shake.intensity = 15;
      this.musicEngine.queueStinger('hit');
      createParticles(this.particles, this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#ff5555', 20);

      if (result.livesRemaining <= 0) {
        this.gameOver = true;
        this.musicEngine.stopMusic();
      }
    } else if (result.shieldHit) {
      this.playSound('shield');
      createParticles(this.particles, this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#7be2ff', 12);
    }
  }

  onPlayerDeath() {
    this.player.takeDamage();
    if (this.player.lives <= 0) {
      this.gameOver = true;
      this.musicEngine.stopMusic();
    } else {
      // Respawn
      this.player.x = this.camera.x + 100;
      this.player.y = this.GROUND_Y - this.player.h - 20;
      this.player.vx = 0;
      this.player.vy = 0;
    }
  }

  rotateBiome() {
    const biomeIds = Object.keys(this.biomeConfig.biomes);
    this.biomeRotationIndex = (this.biomeRotationIndex + 1) % biomeIds.length;
    this.currentBiomeId = biomeIds[this.biomeRotationIndex];
    this.currentBiome = this.biomeConfig.biomes[this.currentBiomeId];
    this.musicEngine.setMusicBiome(this.currentBiomeId);

    // Update background colors
    for (let i = 0; i < this.bgLayers.length; i++) {
      this.bgLayers[i].color = this.currentBiome.colors.stars[i];
    }
  }

  addNotification(title, message, duration) {
    this.notifications.push({
      title,
      message,
      duration,
      time: 0
    });
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    // Delegate to music engine for sound effects
    if (type === 'jump' || type === 'shoot' || type === 'coin' || type === 'hit' || type === 'stomp' || type === 'levelComplete') {
      // Use simple sound effects (can expand later)
      this.musicEngine.queueStinger(type);
    }
  }

  // Drawing methods would go here...
  // (Simplified for brevity - would include drawBackground, drawPlayer, drawEnemy, etc.)
}
