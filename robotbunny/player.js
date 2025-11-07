// Player with Abilities
import { clamp } from './utils.js';

export class Player {
  constructor(x, y, w, h, config, metaProgression) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;

    this.config = config;
    this.metaProgression = metaProgression;

    // Combat
    this.shootCooldown = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.lives = 3;

    // Animation
    this.animState = 'idle'; // idle, walk, jump
    this.animFrame = 0;
    this.animTimer = 0;

    // Abilities
    this.abilities = {
      dash: {
        active: false,
        cooldown: 0,
        timer: 0
      },
      doubleJump: {
        jumpsRemaining: 1,
        used: false
      },
      shield: {
        active: false,
        cooldown: 0,
        timer: 0,
        hitsRemaining: 0
      },
      magnet: {
        active: false // Passive when unlocked
      }
    };

    // Powerup effects
    this.powerups = {
      coinMagnet: 0,
      invincibility: 0,
      speedBoost: 0
    };

    this.combo = 0;
    this.comboTimer = 0;
  }

  hasAbility(abilityId) {
    return this.metaProgression.hasAbility(abilityId);
  }

  update(dt, keys, touchButtons) {
    // Update timers
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      this.invincible = this.invincibleTimer > 0;
    }

    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    // Update ability cooldowns
    for (const key in this.abilities) {
      if (this.abilities[key].cooldown > 0) {
        this.abilities[key].cooldown -= dt;
      }
      if (this.abilities[key].timer > 0) {
        this.abilities[key].timer -= dt;
        if (this.abilities[key].timer <= 0) {
          this.abilities[key].active = false;
        }
      }
    }

    // Update powerups
    for (const key in this.powerups) {
      if (this.powerups[key] > 0) {
        this.powerups[key] -= dt;
      }
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    // Update animation
    if (this.onGround) {
      if (Math.abs(this.vx) > 50) {
        this.animState = 'walk';
        this.animTimer += dt * Math.abs(this.vx) / 100;
        this.animFrame = this.animTimer % 1;
      } else {
        this.animState = 'idle';
        this.animFrame = 0;
      }
    } else {
      this.animState = 'jump';
    }

    // Update passive abilities
    if (this.hasAbility('magnet')) {
      this.abilities.magnet.active = true;
    }

    // Speed boost effect
    const speedMultiplier = this.powerups.speedBoost > 0 ? 1.5 : 1;

    return { speedMultiplier };
  }

  attemptDash() {
    if (!this.hasAbility('dash')) return false;
    if (this.abilities.dash.cooldown > 0) return false;
    if (this.abilities.dash.active) return false;

    const abilityConfig = this.config.abilities.dash;
    this.abilities.dash.active = true;
    this.abilities.dash.timer = abilityConfig.duration;
    this.abilities.dash.cooldown = abilityConfig.cooldown;

    // Apply dash velocity
    this.vx = this.facing * (abilityConfig.distance / abilityConfig.duration);
    this.invincible = true;
    this.invincibleTimer = abilityConfig.duration;

    return true;
  }

  attemptDoubleJump(jumpVel) {
    if (!this.hasAbility('double_jump')) return false;
    if (this.onGround) return false;
    if (this.abilities.doubleJump.jumpsRemaining <= 0) return false;

    this.vy = jumpVel;
    this.abilities.doubleJump.jumpsRemaining--;

    return true;
  }

  resetJumps() {
    const maxJumps = this.hasAbility('double_jump') ? this.config.abilities.double_jump.maxJumps : 1;
    this.abilities.doubleJump.jumpsRemaining = maxJumps;
  }

  activateShield() {
    if (!this.hasAbility('shield')) return false;
    if (this.abilities.shield.cooldown > 0) return false;
    if (this.abilities.shield.active) return false;

    const abilityConfig = this.config.abilities.shield;
    this.abilities.shield.active = true;
    this.abilities.shield.timer = abilityConfig.duration;
    this.abilities.shield.cooldown = abilityConfig.cooldown;
    this.abilities.shield.hitsRemaining = abilityConfig.maxHits;

    return true;
  }

  onShieldHit() {
    if (!this.abilities.shield.active) return false;

    this.abilities.shield.hitsRemaining--;

    if (this.abilities.shield.hitsRemaining <= 0) {
      this.abilities.shield.active = false;
      this.abilities.shield.timer = 0;
    }

    return true; // Hit was blocked
  }

  getMagnetRadius() {
    if (!this.abilities.magnet.active) return 0;
    return this.config.abilities.magnet.radius;
  }

  applyPowerup(type, duration) {
    switch (type) {
      case 'coin_magnet':
        this.powerups.coinMagnet = duration;
        break;
      case 'invincibility':
        this.powerups.invincibility = duration;
        this.invincible = true;
        break;
      case 'speed_boost':
        this.powerups.speedBoost = duration;
        break;
      case 'health':
        this.lives = Math.min(5, this.lives + 1);
        break;
    }
  }

  hasPowerup(type) {
    return this.powerups[type] > 0;
  }

  incrementCombo() {
    this.combo++;
    this.comboTimer = 3.0; // Reset combo timer
  }

  getCombo() {
    return this.combo;
  }

  takeDamage() {
    // Check shield first
    if (this.abilities.shield.active) {
      if (this.onShieldHit()) {
        return { damaged: false, shieldHit: true };
      }
    }

    // Check invincibility
    if (this.invincible || this.powerups.invincibility > 0) {
      return { damaged: false, invincible: true };
    }

    this.lives--;
    this.invincible = true;
    this.invincibleTimer = 2.0;
    this.combo = 0;

    return { damaged: true, livesRemaining: this.lives };
  }

  getAbilityCooldowns() {
    return {
      dash: this.abilities.dash.cooldown,
      shield: this.abilities.shield.cooldown
    };
  }

  getAbilityStates() {
    return {
      dashActive: this.abilities.dash.active,
      shieldActive: this.abilities.shield.active,
      shieldHits: this.abilities.shield.hitsRemaining,
      jumpsRemaining: this.abilities.doubleJump.jumpsRemaining,
      magnetActive: this.abilities.magnet.active
    };
  }
}
