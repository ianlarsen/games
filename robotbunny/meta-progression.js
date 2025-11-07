// Meta Progression System - XP, Leveling, Abilities
export class MetaProgression {
  constructor(config) {
    this.config = config;

    // Load from localStorage
    this.xp = parseInt(localStorage.getItem('rb_moon_xp') || '0');
    this.level = parseInt(localStorage.getItem('rb_moon_level') || '1');
    this.coins = parseInt(localStorage.getItem('rb_moon_coins') || '0');
    this.moonFragments = parseInt(localStorage.getItem('rb_moon_fragments') || '0');

    this.unlockedAbilities = JSON.parse(localStorage.getItem('rb_moon_abilities') || '[]');
    this.abilityUpgrades = JSON.parse(localStorage.getItem('rb_moon_ability_upgrades') || '{}');

    this.sessionXP = 0;
    this.xpForNextLevel = this.calculateXPForLevel(this.level + 1);
  }

  gainXP(amount) {
    this.xp += amount;
    this.sessionXP += amount;
    this.checkLevelUp();
    this.save();
  }

  calculateXPForLevel(level) {
    // Formula: baseXP * (level ^ exponent)
    return Math.floor(this.config.progression.baseXP * Math.pow(level, this.config.progression.exponent));
  }

  checkLevelUp() {
    while (this.xp >= this.xpForNextLevel) {
      this.level++;
      this.xp -= this.xpForNextLevel;
      this.xpForNextLevel = this.calculateXPForLevel(this.level + 1);
      this.onLevelUp();
    }
  }

  onLevelUp() {
    console.log(`Level Up! Now level ${this.level}`);
    // Award coins or fragments on level up
    this.coins += 10 * this.level;
    this.moonFragments += Math.floor(this.level / 5);
    this.save();

    return {
      level: this.level,
      reward: {
        coins: 10 * this.level,
        fragments: Math.floor(this.level / 5)
      }
    };
  }

  getProgress() {
    return {
      level: this.level,
      xp: this.xp,
      xpForNextLevel: this.xpForNextLevel,
      progress: this.xp / this.xpForNextLevel,
      coins: this.coins,
      moonFragments: this.moonFragments
    };
  }

  getAvailableAbilities() {
    // Returns abilities that can be unlocked at current level
    return Object.entries(this.config.abilities)
      .map(([id, cfg]) => ({ id, ...cfg }))
      .filter(ability => this.level >= ability.unlockLevel);
  }

  hasAbility(abilityId) {
    return this.unlockedAbilities.includes(abilityId);
  }

  unlockAbility(abilityId) {
    const ability = this.config.abilities[abilityId];
    if (!ability) return false;

    if (this.level < ability.unlockLevel) {
      return { success: false, reason: 'Level too low' };
    }

    if (this.hasAbility(abilityId)) {
      return { success: false, reason: 'Already unlocked' };
    }

    if (this.coins < ability.cost) {
      return { success: false, reason: 'Not enough coins' };
    }

    this.coins -= ability.cost;
    this.unlockedAbilities.push(abilityId);
    this.abilityUpgrades[abilityId] = 0;
    this.save();

    return { success: true };
  }

  upgradeAbility(abilityId) {
    if (!this.hasAbility(abilityId)) return { success: false, reason: 'Not unlocked' };

    const currentLevel = this.abilityUpgrades[abilityId] || 0;
    const upgradeCost = 50 * Math.pow(2, currentLevel);

    if (this.coins < upgradeCost) {
      return { success: false, reason: 'Not enough coins' };
    }

    this.coins -= upgradeCost;
    this.abilityUpgrades[abilityId] = currentLevel + 1;
    this.save();

    return { success: true, newLevel: currentLevel + 1 };
  }

  getAbilityLevel(abilityId) {
    return this.abilityUpgrades[abilityId] || 0;
  }

  // Award XP for various actions
  onCoinCollected() {
    this.gainXP(this.config.progression.xpPerCoin);
  }

  onEnemyKilled() {
    this.gainXP(this.config.progression.xpPerEnemyKill);
  }

  onBossKilled() {
    this.gainXP(this.config.progression.xpPerBossKill);
  }

  onSegmentComplete() {
    this.gainXP(this.config.progression.xpPerSegmentComplete);
  }

  addCoins(amount) {
    this.coins += amount;
    this.save();
  }

  addMoonFragments(amount) {
    this.moonFragments += amount;
    this.save();
  }

  save() {
    localStorage.setItem('rb_moon_xp', this.xp.toString());
    localStorage.setItem('rb_moon_level', this.level.toString());
    localStorage.setItem('rb_moon_coins', this.coins.toString());
    localStorage.setItem('rb_moon_fragments', this.moonFragments.toString());
    localStorage.setItem('rb_moon_abilities', JSON.stringify(this.unlockedAbilities));
    localStorage.setItem('rb_moon_ability_upgrades', JSON.stringify(this.abilityUpgrades));
  }

  reset() {
    this.xp = 0;
    this.level = 1;
    this.sessionXP = 0;
    this.xpForNextLevel = this.calculateXPForLevel(2);
    this.save();
  }
}
