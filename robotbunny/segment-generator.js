// Procedural Segment Generation
import { rand, randInt, seededRandom, pickWeighted } from './utils.js';

export class SegmentGenerator {
  constructor(config, threatSystem) {
    this.config = config;
    this.threatSystem = threatSystem;
    this.lastChunkType = 'safe';
    this.segmentSeed = 0;
  }

  generateSegment(seed, groundY) {
    this.segmentSeed = seed;
    const threatLevel = this.threatSystem.getThreatLevel();

    const segment = {
      id: seed,
      startX: 0,
      width: randInt(this.config.segment.widthRange[0], this.config.segment.widthRange[1]),
      platforms: [],
      enemies: [],
      coins: [],
      powerups: [],
      chunkType: this.pickNextChunk()
    };

    const chunkConfig = this.config.chunkTypes[segment.chunkType];

    // Generate platforms
    this.generatePlatforms(segment, chunkConfig, groundY);

    // Spawn enemies
    this.spawnEnemies(segment, chunkConfig);

    // Place coins
    this.placeCoins(segment, chunkConfig, groundY);

    // Roll for powerups
    this.rollPowerupDrops(segment, chunkConfig);

    return segment;
  }

  pickNextChunk() {
    const prevChunk = this.config.chunkTypes[this.lastChunkType];
    const possibleNext = prevChunk.nextChunks;

    // Weighted random based on threat level
    // Higher threat = more challenges
    const tl = this.threatSystem.getThreatLevel();
    const weights = possibleNext.map(chunkId => {
      if (chunkId === 'challenge' || chunkId === 'hazard') {
        return 0.5 + tl * 0.05;
      } else if (chunkId === 'safe') {
        return Math.max(0.2, 1 - tl * 0.03);
      } else {
        return 0.7;
      }
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < possibleNext.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        this.lastChunkType = possibleNext[i];
        return possibleNext[i];
      }
    }

    this.lastChunkType = possibleNext[0];
    return possibleNext[0];
  }

  generatePlatforms(segment, chunkConfig, groundY) {
    const gapMax = this.threatSystem.getScaledGapMax();
    const dyMax = this.threatSystem.getScaledDyMax();
    const density = chunkConfig.platformDensity;
    const gapDiff = chunkConfig.gapDifficulty;

    let currentX = 150;
    let currentY = groundY - 100;

    while (currentX < segment.width - 200) {
      const gap = rand(80, gapMax * gapDiff);
      const dy = rand(-dyMax, dyMax);
      const platformW = randInt(80, 150);
      const platformH = 20;

      currentX += gap;
      currentY += dy;

      // Clamp Y position
      currentY = Math.max(groundY - 400, Math.min(groundY - 80, currentY));

      if (Math.random() < density) {
        segment.platforms.push({
          x: currentX,
          y: currentY,
          w: platformW,
          h: platformH,
          type: 'platform'
        });
      }

      currentX += platformW;
    }
  }

  spawnEnemies(segment, chunkConfig) {
    const budget = this.threatSystem.getEnemyBudget() * chunkConfig.enemyMultiplier;
    const availableTypes = this.threatSystem.getAvailableEnemyTypes();

    let spentBudget = 0;

    while (spentBudget < budget && availableTypes.length > 0) {
      const enemyType = pickWeighted(availableTypes);
      const cost = 1; // Each enemy costs 1 budget

      if (spentBudget + cost > budget) break;

      // Pick a random platform or ground position
      const platform = segment.platforms[randInt(0, segment.platforms.length - 1)];
      if (!platform) break;

      const enemy = {
        type: enemyType.id,
        x: platform.x + rand(10, platform.w - enemyType.size.w - 10),
        y: platform.y - enemyType.size.h,
        w: enemyType.size.w,
        h: enemyType.size.h,
        vx: enemyType.baseSpeed,
        vy: 0,
        health: enemyType.baseHealth,
        dir: Math.random() > 0.5 ? 1 : -1,
        animTimer: 0,
        rotateAngle: 0,
        bobT: rand(0, Math.PI * 2),
        flapTimer: 0,
        jumpTimer: enemyType.id === 'hopper' ? rand(1, 3) : 0,
        shootTimer: enemyType.shootInterval || 0
      };

      this.threatSystem.scaleEnemyStats(enemy);
      segment.enemies.push(enemy);

      spentBudget += cost;
    }
  }

  placeCoins(segment, chunkConfig, groundY) {
    const coinCount = Math.floor(segment.platforms.length * 0.3 * chunkConfig.coinMultiplier);

    for (let i = 0; i < coinCount; i++) {
      const platform = segment.platforms[randInt(0, segment.platforms.length - 1)];
      if (!platform) continue;

      // Place coin above platform
      const coinX = platform.x + rand(20, platform.w - 40);
      const coinY = platform.y - rand(30, 60);

      segment.coins.push({
        x: coinX,
        y: coinY,
        size: 14,
        sparkleT: rand(0, Math.PI * 2)
      });
    }

    // Add coin clusters for treasure chunks
    if (chunkConfig.id === 'treasure') {
      const clusterCount = randInt(2, 4);
      for (let c = 0; c < clusterCount; c++) {
        const platform = segment.platforms[randInt(0, segment.platforms.length - 1)];
        if (!platform) continue;

        const clusterX = platform.x + platform.w / 2;
        const clusterY = platform.y - 80;

        for (let i = 0; i < 5; i++) {
          segment.coins.push({
            x: clusterX + (i - 2) * 30,
            y: clusterY + Math.abs(i - 2) * -15,
            size: 14,
            sparkleT: rand(0, Math.PI * 2)
          });
        }
      }
    }
  }

  rollPowerupDrops(segment, chunkConfig) {
    const powerupTypes = this.config.powerups.types;

    for (const powerupType of powerupTypes) {
      if (Math.random() < powerupType.dropChance * 0.3) {
        const platform = segment.platforms[randInt(0, segment.platforms.length - 1)];
        if (!platform) continue;

        segment.powerups.push({
          type: powerupType.id,
          x: platform.x + platform.w / 2,
          y: platform.y - 40,
          w: 24,
          h: 24,
          icon: powerupType.icon,
          color: powerupType.color,
          duration: powerupType.duration || 0,
          bobT: rand(0, Math.PI * 2)
        });
      }
    }
  }
}
