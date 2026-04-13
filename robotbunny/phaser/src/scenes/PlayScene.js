      // Spawn a simple boss projectile (modular for future expansion)
      spawnBossProjectile() {
        if (!this.bossProjectiles) {
          this.bossProjectiles = this.physics.add.group({ maxSize: 8 });
          // Player hit by boss projectile
          this.physics.add.overlap(this.player, this.bossProjectiles, this.handleBossProjectileHit, null, this);
        }
        let proj = this.bossProjectiles.get(this.boss.x, this.boss.y + 20, 'coin'); // Use coin sprite as placeholder
        if (!proj) return;
        proj.setActive(true);
        proj.setVisible(true);
        proj.setDisplaySize(24, 24);
        proj.body.allowGravity = false;
        // Aim at player
        const dx = this.player.x - this.boss.x;
        const dy = this.player.y - this.boss.y;
        const mag = Math.sqrt(dx * dx + dy * dy);
        const speed = 260;
        proj.body.velocity.x = (dx / mag) * speed;
        proj.body.velocity.y = (dy / mag) * speed;
        // Feedback: flash or shake can be added here
      }

      // Handle player hit by boss projectile
      handleBossProjectileHit(player, proj) {
        if (this.playerState.invulnerabilityTimer > 0) return;
        proj.setActive(false);
        proj.setVisible(false);
        this.lives = Math.max(0, this.lives - 1);
        this.playerState.invulnerabilityTimer = 800;
        // Player hit feedback (not excessive)
        if (!player.isHit) {
          player.isHit = true;
          this.tweens.add({
            targets: player,
            scaleY: 0.82,
            scaleX: 1.18,
            duration: 80,
            yoyo: true,
            onComplete: () => { player.isHit = false; },
            ease: 'Quad.easeOut',
          });
          player.setTint(0xff7777);
          this.time.delayedCall(120, () => player.clearTint());
        }
        player.setVelocity(-180, -360);
        this.updateHud();
        if (this.lives === 0) {
          this.showGameOverOverlay();
        }
      }
    // Offscreen platform cleanup (remove platforms far behind player)
    for (const platform of this.platforms.getChildren()) {
      if (!platform.active) continue;
      if (platform.x < this.cameras.main.worldView.x - 300) {
        platform.setActive(false);
        platform.setVisible(false);
      }
    }
    // TODO: If segment content becomes more complex, consider pooling/cleanup for segment objects as well.
import Phaser from 'phaser';

const WORLD_WIDTH = 3600;
const GROUND_Y = 520;
const PLAYER_SPEED = 250;
const PLAYER_JUMP = -950;
const LASER_SPEED = 640;
const MAX_PLAYER_SPEED_X = 350;
const COYOTE_TIME_MS = 150;
const JUMP_BUFFER_MS = 180;
const LANDING_FORGIVENESS_MS = 80;
const AIR_CONTROL_MULTIPLIER = 0.85;
const DASH_SPEED = 540;
const DASH_DURATION_MS = 120;
const DASH_COOLDOWN_MS = 550;
const PLAYER_INVULNERABLE_MS = 800;
const MAX_AIR_JUMPS = 1;

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
    this.lastShotAt = 0;
  }

  init(data) {
    this.biomeConfig = data.biomeConfig;
    this.controlState = this.game.registry.get('controlState');
    this.score = 0;
    this.coinsCollected = 0;
    this.lives = 5;
    this.playerState = {
      wasGrounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      landingForgivenessTimer: 0,
      airJumpsRemaining: MAX_AIR_JUMPS,
      dashCooldownTimer: 0,
      dashTimer: 0,
      dashDirection: 1,
      dashAvailable: true,
      dashTintActive: false,
      invulnerabilityTimer: 0
    };
    this.levelIndex = data.levelIndex || 1; // Initialize level index
    this.resetAllState(); // Reset all state on init
  }

  create() {
    const craterBiome = this.biomeConfig?.biomes?.crater;
    const colors = craterBiome?.colors;
    this.cameras.main.setBackgroundColor(colors?.bg || '#000000');

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, 560);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 560);

    this.background = this.add.tileSprite(480, 280, 960, 560, 'background')
      .setScrollFactor(0)
      .setAlpha(0.35);

    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    // Use pooling for enemies and lasers
    this.enemies = this.physics.add.group({ maxSize: 32, runChildUpdate: true });
    this.lasers = this.physics.add.group({ allowGravity: false, maxSize: 32, runChildUpdate: true });

    this.createLaserTexture();
    this.buildLevel();
    this.spawnPlayer();
    this.spawnHud();
    this.bindInput();
    this.configureCollisions();
  }

  createLaserTexture() {
    if (this.textures.exists('laser')) {
      return;
    }

    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x7be2ff, 1);
    graphics.fillRect(0, 0, 20, 4);
    graphics.generateTexture('laser', 20, 4);
    graphics.destroy();
  }

  buildLevel() {
    // Level-bounded procedural generation
    this.levelIndex = this.levelIndex || 1;
    this.segments = [];
    this.currentSegmentIndex = 0;
    this.nextSegmentX = 0;
    this.segmentsPerLevel = 10; // Can be tuned per level
    this.levelComplete = false;
    // Generate first N segments for this level
    for (let i = 0; i < this.segmentsPerLevel; i++) {
      this.loadNextSegment();
    }
  }

  loadNextSegment() {
    // Parameters for MVP variety
    const segmentWidth = 900 + Math.floor(Math.random() * 220);
    const startX = this.nextSegmentX;
    const groundY = GROUND_Y;
    const platformCount = 4 + Math.floor(Math.random() * 3);
    const minGap = 120, maxGap = 260;
    const minPlatY = 260, maxPlatY = 440;

    // Ground
    this.createGroundSection(startX + segmentWidth / 2, 540, segmentWidth / 500, 2.4);

    // Platforms and coins
    let platX = startX + 180;
    for (let i = 0; i < platformCount; i++) {
      const platY = minPlatY + Math.random() * (maxPlatY - minPlatY);
      this.createPlatform(platX, platY);
      this.spawnCoin(platX, platY - 56);
      platX += minGap + Math.random() * (maxGap - minGap);
    }

    // Enemies (MVP: 1-2 per segment)
    const enemyCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < enemyCount; i++) {
      const ex = startX + 300 + Math.random() * (segmentWidth - 400);
      const ey = groundY - 40 - Math.random() * 120;
      this.spawnEnemy(ex, ey, 60 + Math.random() * 40);
    }

    this.nextSegmentX += segmentWidth;
    this.currentSegmentIndex++;
  }

  createGroundSection(x, y, scaleX, scaleY) {
    this.platforms.create(x, y, 'ground')
      .setOrigin(0.5, 0.5)
      .setScale(scaleX, scaleY)
      .refreshBody();
  }

  createPlatform(x, y) {
    this.platforms.create(x, y, 'platform')
      .setOrigin(0.5, 0.5)
      .setScale(1.2, 1)
      .refreshBody();
  }

  spawnCoin(x, y) {
    const coin = this.coins.create(x, y, 'coin');
    coin.setDisplaySize(20, 20);
    coin.setCircle(10);
    coin.setActive(true);
    coin.setVisible(true);
  }

  spawnEnemy(x, y, speed) {
    // 50% walker, 50% hopper
    const isHopper = Math.random() < 0.5;
    const spriteKey = isHopper ? 'hopper' : 'hopper'; // Use same sprite for now
    let enemy = this.enemies.get(x, y, spriteKey);
    if (!enemy) return; // Pool exhausted
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setDisplaySize(34, 34);
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 0);
    if (isHopper) {
      enemy.setData('type', 'hopper');
      enemy.setData('jumpTimer', 0.5 + Math.random() * 1.5);
      enemy.setData('vy', 0);
      enemy.setVelocityX(0);
    } else {
      enemy.setData('type', 'walker');
      const dir = Math.random() < 0.5 ? -1 : 1;
      enemy.setData('dir', dir);
      enemy.setVelocityX(dir * (60 + Math.random() * 40));
    }
    enemy.setData('patrolSpeed', speed);
    // Animation state
    enemy.isSquashing = false;
    enemy.idleTween = null;
    // Subtle idle animation (breathe)
    enemy.idleTween = this.tweens.add({
      targets: enemy,
      scaleY: { from: 1, to: 1.04 },
      scaleX: { from: 1, to: 0.98 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  spawnPlayer() {
    this.player = this.physics.add.sprite(100, GROUND_Y - 72, 'player');
    this.player.setScale(1);
    this.player.y = GROUND_Y - 72;
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(350, 1400);
    this.player.body.setSize(this.player.width * 0.62, this.player.height * 0.92);
    this.player.body.setOffset(this.player.width * 0.19, this.player.height * 0.08);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    // Animation state
    this.player.isSquashing = false;
    this.player.isRecoiling = false;
    this.player.idleTween = null;
    // Subtle idle animation (breathe)
    this.player.idleTween = this.tweens.add({
      targets: this.player,
      scaleY: { from: 1, to: 1.04 },
      scaleX: { from: 1, to: 0.98 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  spawnHud() {
    const textStyle = {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#e4eefb',
      stroke: '#08101c',
      strokeThickness: 4
    };

    this.hudScore = this.add.text(16, 14, 'Score: 0', textStyle).setScrollFactor(0);
    this.hudCoins = this.add.text(16, 40, 'Coins: 0', textStyle).setScrollFactor(0);
    this.hudLives = this.add.text(16, 66, 'Lives: 5', textStyle).setScrollFactor(0);
    this.hudAbility = this.add.text(16, 92, 'Air Jump: ready  Dash: ready', textStyle).setScrollFactor(0);
    this.hudHint = this.add.text(944, 14, 'X/F shoot  C/Shift dash', textStyle)
      .setOrigin(1, 0)
      .setScrollFactor(0);
  }

  bindInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  configureCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemyWithLaser, null, this);
  }

  collectCoin(_player, coin) {
    coin.destroy();
    this.coinsCollected += 1;
    this.score += 50;
    this.updateHud();
  }

  hitEnemy(player, enemy) {
    if (!player.active || !enemy.active) {
      return;
    }

    if (this.playerState.invulnerabilityTimer > 0) {
      return;
    }

    if (player.body.velocity.y > 100 && player.y < enemy.y) {
      // Enemy hit feedback: squash and tint
      if (!enemy.isSquashing) {
        enemy.isSquashing = true;
        this.tweens.add({
          targets: enemy,
          scaleY: 0.7,
          scaleX: 1.25,
          duration: 80,
          yoyo: true,
          onComplete: () => { enemy.isSquashing = false; },
          ease: 'Quad.easeOut',
        });
        enemy.setTint(0xfff16b);
        this.time.delayedCall(100, () => enemy.clearTint());
      }
      enemy.destroy();
      player.setVelocityY(PLAYER_JUMP * 0.45);
      this.score += 100;
      this.updateHud();
      return;
    }
    // Player hit feedback (not excessive)
    if (!player.isHit) {
      player.isHit = true;
      this.tweens.add({
        targets: player,
        scaleY: 0.82,
        scaleX: 1.18,
        duration: 80,
        yoyo: true,
        onComplete: () => { player.isHit = false; },
        ease: 'Quad.easeOut',
      });
      player.setTint(0xff7777);
      this.time.delayedCall(120, () => player.clearTint());
    }
    }

    this.lives = Math.max(0, this.lives - 1);
    this.playerState.invulnerabilityTimer = PLAYER_INVULNERABLE_MS;
    this.updateHud();
    player.setTint(0xff7777);
    player.setVelocity(-180, -360);
    this.time.delayedCall(PLAYER_INVULNERABLE_MS, () => {
      if (player.active) {
        player.clearTint();
      }
    });

    if (this.lives === 0) {
      this.scene.restart({ biomeConfig: this.biomeConfig });
    }
  }

  hitEnemyWithLaser(laser, enemy) {
    laser.destroy();
    // Enemy hit feedback: squash and tint
    if (!enemy.isSquashing) {
      enemy.isSquashing = true;
      this.tweens.add({
        targets: enemy,
        scaleY: 0.7,
        scaleX: 1.25,
        duration: 80,
        yoyo: true,
        onComplete: () => { enemy.isSquashing = false; },
        ease: 'Quad.easeOut',
      });
      enemy.setTint(0xff5555);
      this.time.delayedCall(100, () => enemy.clearTint());
    }
    enemy.destroy();
    this.score += 125;
    this.updateHud();
  }

  fireLaser() {
    const direction = this.player.flipX ? -1 : 1;
    let laser = this.lasers.get(
      this.player.x + direction * 26,
      this.player.y - 4,
      'laser'
    );
    if (!laser) return; // Pool exhausted
    laser.setActive(true);
    laser.setVisible(true);
    laser.body.allowGravity = false;
    laser.setVelocityX(direction * LASER_SPEED);
    laser.setCollideWorldBounds(false);
    // Recoil animation
    if (!this.player.isRecoiling) {
      this.player.isRecoiling = true;
      this.tweens.add({
        targets: this.player,
        x: this.player.x - direction * 8,
        duration: 60,
        yoyo: true,
        onComplete: () => { this.player.isRecoiling = false; },
        ease: 'Quad.easeOut',
      });
    }
  }

  updateHud() {
    this.hudScore.setText(`Score: ${this.score}`);
    this.hudCoins.setText(`Coins: ${this.coinsCollected}`);
    this.hudLives.setText(`Lives: ${this.lives}`);
    this.hudAbility.setText(
      `Air Jump: ${this.playerState.airJumpsRemaining > 0 ? 'ready' : 'spent'}  Dash: ${this.playerState.dashAvailable ? 'ready' : 'cooling'}`
    );
  }

  queueJump() {
    this.playerState.jumpBufferTimer = JUMP_BUFFER_MS;
  }

  performJump(velocityY) {
    this.player.setVelocityY(velocityY);
    this.playerState.jumpBufferTimer = 0;
    this.playerState.coyoteTimer = 0;
    this.playerState.landingForgivenessTimer = 0;
    // Squash/stretch for jump
    if (!this.player.isSquashing) {
      this.player.isSquashing = true;
      this.tweens.add({
        targets: this.player,
        scaleY: 0.82,
        scaleX: 1.18,
        duration: 80,
        yoyo: true,
        onComplete: () => { this.player.isSquashing = false; },
        ease: 'Quad.easeOut',
      });
    }
  }

  tryConsumeJump() {
    if (this.playerState.jumpBufferTimer <= 0) {
      return;
    }

    const canGroundJump = this.player.body.blocked.down ||
      this.playerState.coyoteTimer > 0 ||
      this.playerState.landingForgivenessTimer > 0;

    // Pre-jump squash
    if (canGroundJump && !this.player.isSquashing) {
      this.player.isSquashing = true;
      this.tweens.add({
        targets: this.player,
        scaleY: 1.22,
        scaleX: 0.78,
        duration: 70,
        yoyo: true,
        onComplete: () => {
          this.player.isSquashing = false;
          this.performJump(PLAYER_JUMP);
        },
        ease: 'Quad.easeOut',
      });
      this.playerState.jumpBufferTimer = 0;
      return;
    }

    if (this.playerState.airJumpsRemaining > 0) {
      this.playerState.airJumpsRemaining -= 1;
      // Pre-jump squash for air jump
      if (!this.player.isSquashing) {
        this.player.isSquashing = true;
        this.tweens.add({
          targets: this.player,
          scaleY: 1.12,
          scaleX: 0.88,
          duration: 60,
          yoyo: true,
          onComplete: () => {
            this.player.isSquashing = false;
            this.performJump(PLAYER_JUMP * 0.86);
          },
          ease: 'Quad.easeOut',
        });
        this.playerState.jumpBufferTimer = 0;
        return;
      }
    }
  }

  tryStartDash() {
    if (!this.playerState.dashAvailable || this.playerState.dashCooldownTimer > 0 || this.playerState.dashTimer > 0) {
      return;
    }

    const facingDirection = this.player.flipX ? -1 : 1;
    const moveDirection = this.controlState.left ? -1 : (this.controlState.right ? 1 : facingDirection);

    this.playerState.dashAvailable = false;
    this.playerState.dashCooldownTimer = DASH_COOLDOWN_MS;
    this.playerState.dashTimer = DASH_DURATION_MS;
    this.playerState.dashDirection = moveDirection;
    this.playerState.dashTintActive = true;
    this.player.body.allowGravity = false;
    this.player.setTint(0xffd86b);
  }

  update(_time, delta) {
    // Upward stretch during jump
    if (!this.player.body.blocked.down && this.player.body.velocity.y < -80 && !this.player.isSquashing) {
      this.tweens.add({
        targets: this.player,
        scaleY: 1.12,
        scaleX: 0.92,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }
    // Run bob (subtle vertical motion)
    const isRunning = (this.player.body.blocked.down && Math.abs(this.player.body.velocity.x) > 40);
    if (isRunning && !this.player.isRunBobbing) {
      this.player.isRunBobbing = true;
      this.player.runBobTween = this.tweens.add({
        targets: this.player,
        y: '+=4',
        duration: 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (!isRunning && this.player.isRunBobbing) {
      this.player.isRunBobbing = false;
      if (this.player.runBobTween) {
        this.player.runBobTween.stop();
        this.player.runBobTween = null;
      }
      // Only reset y if not in a tween
      if (!this.tweens.isTweening(this.player)) {
        this.player.y = Math.round(this.player.y);
      }
    }
    // Squash/stretch for landing
    if (this.player.body.blocked.down && !this.player.wasGrounded) {
      if (!this.player.isSquashing) {
        this.player.isSquashing = true;
        this.tweens.add({
          targets: this.player,
          scaleY: 1.18,
          scaleX: 0.82,
          duration: 80,
          yoyo: true,
          onComplete: () => { this.player.isSquashing = false; },
          ease: 'Quad.easeOut',
        });
      }
    }
    const dt = delta / 1000;
    const pointerLeft = this.controlState.left;
    const pointerRight = this.controlState.right;
    const pointerJump = this.controlState.jumpQueued;
    const pointerShoot = this.controlState.shootQueued;
    const pointerDash = this.controlState.dashQueued;

    this.playerState.coyoteTimer = Math.max(0, this.playerState.coyoteTimer - delta);
    this.playerState.jumpBufferTimer = Math.max(0, this.playerState.jumpBufferTimer - delta);
    this.playerState.landingForgivenessTimer = Math.max(0, this.playerState.landingForgivenessTimer - delta);
    this.playerState.dashCooldownTimer = Math.max(0, this.playerState.dashCooldownTimer - delta);
    this.playerState.invulnerabilityTimer = Math.max(0, this.playerState.invulnerabilityTimer - delta);

    const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;
    if (isGrounded) {
      this.playerState.coyoteTimer = COYOTE_TIME_MS;
      if (!this.playerState.wasGrounded) {
        this.playerState.landingForgivenessTimer = LANDING_FORGIVENESS_MS;
        this.playerState.airJumpsRemaining = MAX_AIR_JUMPS;
        this.playerState.dashAvailable = true;
      }
    }
    this.playerState.wasGrounded = isGrounded;

    const moveLeft = this.cursors.left.isDown || this.keyA.isDown || pointerLeft;
    const moveRight = this.cursors.right.isDown || this.keyD.isDown || pointerRight;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      pointerJump;
    const shootPressed = Phaser.Input.Keyboard.JustDown(this.keyX) ||
      Phaser.Input.Keyboard.JustDown(this.keyF) ||
      pointerShoot;
    const dashPressed = Phaser.Input.Keyboard.JustDown(this.keyShift) ||
      Phaser.Input.Keyboard.JustDown(this.keyC) ||
      pointerDash;

    if (jumpPressed) {
      this.queueJump();
      this.controlState.jumpQueued = false;
    }

    if (dashPressed) {
      this.tryStartDash();
      this.controlState.dashQueued = false;
    }

    if (this.playerState.dashTimer > 0) {
      this.playerState.dashTimer = Math.max(0, this.playerState.dashTimer - delta);
      this.player.setVelocity(DASH_SPEED * this.playerState.dashDirection, 0);
      if (this.playerState.dashTimer === 0) {
        this.player.body.allowGravity = true;
        this.playerState.dashTintActive = false;
        if (this.playerState.invulnerabilityTimer <= 0) {
          this.player.clearTint();
        }
      }
    } else {
      const airControl = isGrounded ? 1 : AIR_CONTROL_MULTIPLIER;
      const acceleration = PLAYER_SPEED * airControl * dt * 8;

      if (moveLeft) {
        this.player.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x - acceleration, -MAX_PLAYER_SPEED_X, MAX_PLAYER_SPEED_X));
        this.player.setFlipX(true);
      } else if (moveRight) {
        this.player.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x + acceleration, -MAX_PLAYER_SPEED_X, MAX_PLAYER_SPEED_X));
        this.player.setFlipX(false);
      } else if (isGrounded) {
        this.player.setVelocityX(this.player.body.velocity.x * 0.86);
      }
    }

    this.tryConsumeJump();

    // Level-bounded: trigger boss or level complete when player passes last segment
          // Advance to next level after short delay
          this.time.delayedCall(1800, () => {
            this.advanceToNextLevel();
          });
    // Boss transition: after last segment, trigger boss encounter
    if (!this.levelComplete && !this.bossTriggered && this.player.x > this.nextSegmentX - 960) {
      this.bossTriggered = true;
      this.startBossEncounter();
    }

    // If boss is active, update boss logic
    if (this.bossActive && this.boss) {
      // === Boss Movement Pattern ===
      if (!this.levelComplete) {
        // Boss moves horizontally between two points
        const leftBound = this.nextSegmentX - 700;
        const rightBound = this.nextSegmentX - 260;
        if (!this.boss.getData('dir')) this.boss.setData('dir', 1);
        let dir = this.boss.getData('dir');
        this.boss.x += dir * 2.2;
        if (this.boss.x < leftBound) { this.boss.x = leftBound; this.boss.setData('dir', 1); }
        if (this.boss.x > rightBound) { this.boss.x = rightBound; this.boss.setData('dir', -1); }
        // === Boss Projectile Attack ===
        if (!this.boss.getData('attackTimer')) this.boss.setData('attackTimer', 0);
        let attackTimer = this.boss.getData('attackTimer') - (this.game.loop.delta / 1000);
        if (attackTimer <= 0) {
          // Telegraph: boss flashes yellow before firing
          if (!this.boss.getData('telegraphing')) {
            this.boss.setTint(0xffd86b);
            this.boss.setData('telegraphing', true);
            this.boss.setData('attackTimer', 0.5); // Telegraph for 0.5s
          } else {
            this.boss.clearTint();
            this.boss.setData('telegraphing', false);
            this.boss.setData('attackTimer', 2.2); // Cooldown before next attack
            this.spawnBossProjectile();
          }
        } else {
          this.boss.setData('attackTimer', attackTimer);
        }
        // Update boss HUD position
        if (this.bossHud) this.bossHud.setPosition(this.boss.x, this.boss.y - 60);
      }
      // === Boss Projectiles Update & Cleanup ===
      if (this.bossProjectiles) {
        for (const proj of this.bossProjectiles.getChildren()) {
          if (!proj.active) continue;
          proj.x += proj.body.velocity.x * (this.game.loop.delta / 1000);
          // Offscreen cleanup
          if (proj.x < this.cameras.main.worldView.x - 100 || proj.x > this.cameras.main.worldView.right + 100) {
            proj.setActive(false);
            proj.setVisible(false);
          }
        }
      }
    }

    // If player dies during boss, trigger game over
    if (this.bossActive && this.lives <= 0 && !this.levelComplete) {
      this.showGameOverOverlay();
    }
  // Start the boss encounter after the last segment
  startBossEncounter() {
    // Freeze normal enemies and clean up projectiles
    this.enemies.clear(true, true);
    this.lasers.clear(true, true);
    // Spawn placeholder boss (replace with real boss logic later)
    this.bossActive = true;
    this.boss = this.physics.add.sprite(this.nextSegmentX - 480, GROUND_Y - 100, 'hopper');
    this.boss.setDisplaySize(80, 80);
    this.boss.setCollideWorldBounds(true);
    this.boss.setImmovable(true);
    this.boss.setData('health', 12); // Placeholder boss health
    // Collide player with boss
    this.physics.add.collider(this.player, this.boss, this.handleBossPlayerCollision, null, this);
    // Lasers damage boss
    this.physics.add.overlap(this.lasers, this.boss, this.handleBossLaserHit, null, this);
    // Add boss health HUD (simple text for now)
    this.bossHud = this.add.text(this.boss.x, this.boss.y - 60, 'Boss HP: 12', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#ffd86b',
      stroke: '#08101c',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  // Handle player collision with boss (placeholder: player takes damage)
  handleBossPlayerCollision(player, boss) {
    if (this.playerState.invulnerabilityTimer > 0) return;
    this.lives = Math.max(0, this.lives - 1);
    this.playerState.invulnerabilityTimer = 800;
    player.setTint(0xff7777);
    player.setVelocity(-180, -360);
    this.updateHud();
    if (this.lives === 0) {
      this.showGameOverOverlay();
    }
  }

  // Handle laser hitting boss (placeholder: boss takes damage, dies at 0)
  handleBossLaserHit(laser, boss) {
    laser.setActive(false);
    laser.setVisible(false);
    // Hit feedback: boss flashes red
    boss.setTint(0xff5555);
    this.time.delayedCall(120, () => boss.clearTint());
    let hp = boss.getData('health') - 1;
    boss.setData('health', hp);
    if (this.bossHud) this.bossHud.setText('Boss HP: ' + hp);
    if (hp <= 0) {
      this.bossDefeated();
    }
  }

  // On boss defeat, trigger level complete
  bossDefeated() {
    // Defeat feedback: boss flashes, then explodes (placeholder)
    if (this.boss) {
      this.boss.setTint(0xffffff);
      this.time.delayedCall(200, () => {
        if (this.boss) {
          this.boss.destroy();
          this.boss = null;
        }
        // Optionally: add explosion effect here
        if (this.bossHud) {
          this.bossHud.destroy();
          this.bossHud = null;
        }
        this.bossActive = false;
        this.showLevelCompleteOverlay();
      });
    } else {
      this.bossActive = false;
      this.showLevelCompleteOverlay();
    }
  }

  // Show game over overlay and freeze gameplay
  showGameOverOverlay() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.physics.pause();
    this.input.keyboard.enabled = false;
    this.input.enabled = false;
    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }
    if (this.bossHud) {
      this.bossHud.destroy();
      this.bossHud = null;
    }
    this.lasers.clear(true, true);
    this.enemies.clear(true, true);
    // --- Animation fix: stop all player tweens and reset transforms ---
    if (this.player) {
      this.tweens.killTweensOf(this.player);
      this.player.setScale(1);
      this.player.y = GROUND_Y - 72;
    }
    // --- Animation fix: stop all player tweens and reset transforms ---
    if (this.player) {
      this.tweens.killTweensOf(this.player);
      this.player.setScale(1);
      this.player.y = GROUND_Y - 72;
    }
    // Optionally: destroy or pause moving platforms/particles here
    if (!this.gameOverText) {
      this.gameOverText = this.add.text(this.player.x, 200, 'GAME OVER', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '48px',
        color: '#ff5555',
        stroke: '#08101c',
        strokeThickness: 6
      }).setOrigin(0.5);
    }
  }

  showLevelCompleteOverlay() {
    if (this.levelComplete) return; // Prevent duplicate overlays
    this.levelComplete = true;
    // Freeze gameplay: stop player, enemies, lasers, input
    this.physics.pause();
    this.input.keyboard.enabled = false;
    this.input.enabled = false;
    // Destroy all lasers
    this.lasers.clear(true, true);
    // Destroy all enemies
    this.enemies.clear(true, true);
    // Optionally: destroy or pause moving platforms/particles here
      this.levelIndex = data.levelIndex || 1; // Initialize level index
      this.resetAllState(); // Reset all state on init
    // Show overlay
    if (!this.levelCompleteText) {
      this.levelCompleteText = this.add.text(this.player.x, 200, 'LEVEL COMPLETE!', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '48px',
        color: '#ffd86b',
        stroke: '#08101c',
        strokeThickness: 6
      }).setOrigin(0.5);
    }
  }

    this.lastShotAt += delta;
    if (shootPressed && this.lastShotAt >= 220) {
      this.fireLaser();
      this.lastShotAt = 0;
    }
    this.controlState.shootQueued = false;

    for (const enemy of this.enemies.getChildren()) {
      if (!enemy.active) continue;
      // Offscreen cleanup
      if (enemy.x < this.cameras.main.worldView.x - 200) {
        enemy.setActive(false);
        enemy.setVisible(false);
        continue;
      }
      const type = enemy.getData('type');
      if (type === 'hopper') {
        // Hopper: jump periodically if on ground
        let jumpTimer = enemy.getData('jumpTimer') - dt;
        if (jumpTimer <= 0 && enemy.body.blocked.down) {
          enemy.setVelocityY(-600);
          jumpTimer = 1.5 + Math.random();
        }
        enemy.setData('jumpTimer', jumpTimer);
      } else if (type === 'walker') {
        // Walker: patrol left/right, flip on wall
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          const dir = enemy.body.blocked.left ? 1 : -1;
          enemy.setData('dir', dir);
          enemy.setVelocityX(dir * (60 + Math.random() * 40));
          enemy.toggleFlipX();
        }
      }
    }

    for (const laser of this.lasers.getChildren()) {
      if (!laser.active) continue;
      if (laser.x < this.cameras.main.worldView.x - 60 || laser.x > this.cameras.main.worldView.right + 60) {
        laser.setActive(false);
        laser.setVisible(false);
      }
    }
    // Offscreen coin cleanup
    for (const coin of this.coins.getChildren()) {
      if (!coin.active) continue;
      if (coin.x < this.cameras.main.worldView.x - 200) {
        coin.setActive(false);
        coin.setVisible(false);
      }
    }

    this.background.tilePositionX = this.cameras.main.scrollX * 0.15;

    if (this.playerState.invulnerabilityTimer > 0 && this.playerState.dashTimer === 0) {
      this.player.setAlpha(this.playerState.invulnerabilityTimer % 160 < 80 ? 0.45 : 1);
    } else {
      this.player.setAlpha(1);
      if (!this.playerState.dashTintActive) {
        this.player.clearTint();
      }
    }

    if (this.player.y > 700) {
      this.scene.restart({ biomeConfig: this.biomeConfig });
    }
  }
}
