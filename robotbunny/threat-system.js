// Threat Level Scaling System
export class ThreatSystem {
  constructor(config) {
    this.config = config;
    this.threatLevel = 0;
    this.heat = 0; // Combat intensity tracker
    this.segmentsCompleted = 0;
    this.distance = 0;
    this.threatIncreaseRate = 0.5; // TL increase per segment
  }

  updateThreat(dt) {
    // Threat level increases gradually with distance
    // Heat affects short-term intensity
    this.heat = Math.max(0, this.heat - dt * 0.5);
  }

  updateHeat(combatActivity) {
    // Combat activity increases heat temporarily
    // combatActivity: { enemiesNearby, playerHealth, comboActive }
    let heatIncrease = 0;

    if (combatActivity.enemiesNearby > 2) {
      heatIncrease += 0.2;
    }

    if (combatActivity.playerHealth < 0.3) {
      heatIncrease += 0.1;
    }

    if (combatActivity.comboActive) {
      heatIncrease += 0.15;
    }

    this.heat = Math.min(1, this.heat + heatIncrease);
  }

  onSegmentComplete() {
    this.segmentsCompleted++;
    this.threatLevel += this.threatIncreaseRate;

    // Threat increases faster at higher levels (exponential curve)
    if (this.segmentsCompleted % 5 === 0) {
      this.threatIncreaseRate = Math.min(1.5, this.threatIncreaseRate * 1.1);
    }
  }

  getIntensity() {
    // Combines threat level and heat for music intensity
    // Returns 0-1
    const tlIntensity = Math.min(1, this.threatLevel / 30);
    return Math.min(1, tlIntensity * 0.7 + this.heat * 0.3);
  }

  getScaledGapMax() {
    const base = this.config.segment.baseGapMax;
    return base + this.threatLevel * this.config.segment.gapScaling;
  }

  getScaledDyMax() {
    const base = this.config.segment.baseDyMax;
    const scaled = base + this.threatLevel * this.config.segment.dyScaling;
    return Math.min(this.config.segment.dyClampMax, scaled);
  }

  getEnemyBudget() {
    const base = this.config.segment.baseEnemyBudget;
    return Math.floor(base + this.threatLevel * this.config.segment.enemyBudgetScaling);
  }

  scaleEnemyStats(enemy) {
    const enemyConfig = this.config.enemyTypes[enemy.type];
    if (!enemyConfig) return enemy;

    // Scale health
    enemy.maxHealth = enemyConfig.baseHealth + Math.floor(this.threatLevel / enemyConfig.healthScaling);
    enemy.health = enemy.maxHealth;

    // Scale speed
    enemy.vx = enemyConfig.baseSpeed * (1 + this.threatLevel * enemyConfig.speedScaling);

    return enemy;
  }

  shouldSpawnBoss() {
    const config = this.config.boss;
    const interval = this.segmentsCompleted % config.spawnInterval.max;
    return interval >= config.spawnInterval.min && interval <= config.spawnInterval.max;
  }

  getBossPhase() {
    return Math.floor(this.threatLevel / this.config.boss.phaseThreshold);
  }

  getAvailableEnemyTypes() {
    // Returns enemy types available at current threat level
    return Object.entries(this.config.enemyTypes)
      .filter(([_, cfg]) => this.threatLevel >= cfg.minThreatLevel)
      .map(([id, cfg]) => ({ id, ...cfg }));
  }

  getThreatLevel() {
    return this.threatLevel;
  }

  setThreatLevel(level) {
    this.threatLevel = Math.max(0, level);
  }

  getDistance() {
    return this.distance;
  }

  addDistance(amount) {
    this.distance += amount;
  }
}
