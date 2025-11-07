// Boss System
import { rand, randInt } from './utils.js';

export class BossSystem {
  constructor(config, threatSystem) {
    this.config = config;
    this.threatSystem = threatSystem;
    this.activeBoss = null;
    this.segmentsSinceLastBoss = 0;
  }

  shouldSpawnBoss() {
    this.segmentsSinceLastBoss++;

    const interval = this.config.boss.spawnInterval;
    return this.segmentsSinceLastBoss >= interval.min &&
           this.segmentsSinceLastBoss <= interval.max;
  }

  spawnBoss(x, y) {
    const tl = this.threatSystem.getThreatLevel();
    const phase = this.threatSystem.getBossPhase();

    const boss = {
      type: 'boss',
      x,
      y,
      w: this.config.boss.size.w,
      h: this.config.boss.size.h,
      maxHealth: Math.floor(this.config.boss.baseHealth * Math.pow(this.config.boss.healthScaling, tl / 10)),
      health: 0, // Set after calculation
      vx: this.config.boss.baseSpeed * (1 + tl * this.config.boss.speedScaling),
      vy: 0,
      phase: phase,
      dir: 1,
      state: 'idle', // idle, charging, attacking, hurt
      stateTimer: 0,
      attackCooldowns: {},
      currentAttack: null,
      attackTimer: 0,
      telegraphTimer: 0,
      hitFlash: 0,
      animTimer: 0,
      targetX: x,
      projectiles: []
    };

    boss.health = boss.maxHealth;

    // Initialize attack cooldowns
    for (const attack of this.config.boss.attacks) {
      boss.attackCooldowns[attack.id] = 0;
    }

    this.activeBoss = boss;
    this.segmentsSinceLastBoss = 0;

    return boss;
  }

  updateBossAI(boss, dt, player) {
    if (!boss || boss.health <= 0) return;

    boss.animTimer += dt;
    boss.stateTimer += dt;

    // Update attack cooldowns
    for (const key in boss.attackCooldowns) {
      if (boss.attackCooldowns[key] > 0) {
        boss.attackCooldowns[key] -= dt;
      }
    }

    // Flash effect
    if (boss.hitFlash > 0) {
      boss.hitFlash -= dt * 5;
    }

    switch (boss.state) {
      case 'idle':
        this.bossIdleBehavior(boss, player);
        break;

      case 'charging':
        this.bossChargeBehavior(boss, player, dt);
        break;

      case 'attacking':
        this.bossAttackBehavior(boss, player, dt);
        break;

      case 'hurt':
        if (boss.stateTimer > 0.5) {
          boss.state = 'idle';
          boss.stateTimer = 0;
        }
        break;
    }

    // Update boss projectiles
    for (let i = boss.projectiles.length - 1; i >= 0; i--) {
      const proj = boss.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      if (proj.life <= 0) {
        boss.projectiles.splice(i, 1);
      }
    }
  }

  bossIdleBehavior(boss, player) {
    // Pick an available attack
    const availableAttacks = this.getAvailableAttacks(boss);

    if (availableAttacks.length > 0 && boss.stateTimer > 1.0) {
      const attack = availableAttacks[randInt(0, availableAttacks.length - 1)];
      this.startBossAttack(boss, attack);
    }

    // Move towards player
    if (boss.x < player.x - 200) {
      boss.dir = 1;
      boss.x += boss.vx * 0.3 * 0.016;
    } else if (boss.x > player.x + 200) {
      boss.dir = -1;
      boss.x -= boss.vx * 0.3 * 0.016;
    }
  }

  bossChargeBehavior(boss, player, dt) {
    // Telegraph/charge up attack
    boss.telegraphTimer += dt;

    if (boss.telegraphTimer >= boss.currentAttack.telegraphTime) {
      boss.state = 'attacking';
      boss.attackTimer = 0;
      boss.telegraphTimer = 0;
    }
  }

  bossAttackBehavior(boss, player, dt) {
    boss.attackTimer += dt;

    const attack = boss.currentAttack;

    switch (attack.id) {
      case 'charge':
        // Rush towards player
        boss.x += boss.dir * boss.vx * dt;

        if (boss.attackTimer > 2.0) {
          this.endBossAttack(boss, attack);
        }
        break;

      case 'projectile_spread':
        if (boss.attackTimer === 0 || (boss.attackTimer > 0.1 && boss.projectiles.length < attack.count)) {
          this.fireProjectileSpread(boss, player, attack.count);
        }

        if (boss.attackTimer > 1.5) {
          this.endBossAttack(boss, attack);
        }
        break;

      case 'ground_pound':
        if (boss.attackTimer < 0.5) {
          // Jump up
          boss.y -= 200 * dt;
        } else if (boss.attackTimer < 1.0) {
          // Fall down
          boss.y += 400 * dt;
        } else {
          this.endBossAttack(boss, attack);
        }
        break;
    }
  }

  getAvailableAttacks(boss) {
    const tl = this.threatSystem.getThreatLevel();

    return this.config.boss.attacks.filter(attack => {
      const onCooldown = boss.attackCooldowns[attack.id] > 0;
      const meetsLevel = !attack.minThreatLevel || tl >= attack.minThreatLevel;
      return !onCooldown && meetsLevel;
    });
  }

  startBossAttack(boss, attack) {
    boss.currentAttack = attack;
    boss.state = 'charging';
    boss.telegraphTimer = 0;
    boss.stateTimer = 0;

    // Face player
    boss.dir = boss.x < boss.targetX ? 1 : -1;
  }

  endBossAttack(boss, attack) {
    boss.state = 'idle';
    boss.stateTimer = 0;
    boss.attackTimer = 0;
    boss.currentAttack = null;
    boss.attackCooldowns[attack.id] = attack.cooldown;
  }

  fireProjectileSpread(boss, player, count) {
    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
    const spreadAngle = Math.PI / 4;

    for (let i = 0; i < count; i++) {
      const angle = angleToPlayer - spreadAngle / 2 + (spreadAngle * i) / (count - 1);
      const speed = 300;

      boss.projectiles.push({
        x: boss.x + boss.w / 2,
        y: boss.y + boss.h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 16,
        h: 16,
        life: 5.0,
        color: '#ff5555'
      });
    }
  }

  onBossHit(boss, damage) {
    boss.health -= damage;
    boss.hitFlash = 1.0;

    if (boss.health <= 0) {
      return this.onBossDefeated(boss);
    }

    // Check for phase change
    const prevPhase = boss.phase;
    const newPhase = this.calculatePhase(boss);

    if (newPhase > prevPhase) {
      boss.phase = newPhase;
      return { phaseChange: true, newPhase };
    }

    return { defeated: false };
  }

  calculatePhase(boss) {
    const healthPercent = boss.health / boss.maxHealth;
    if (healthPercent > 0.66) return 0;
    if (healthPercent > 0.33) return 1;
    return 2;
  }

  onBossDefeated(boss) {
    this.activeBoss = null;
    return {
      defeated: true,
      reward: {
        xp: 500 + this.threatSystem.getThreatLevel() * 50,
        coins: 100 + this.threatSystem.getThreatLevel() * 10,
        fragments: 5
      }
    };
  }

  getActiveBoss() {
    return this.activeBoss;
  }

  clearBoss() {
    this.activeBoss = null;
  }
}
