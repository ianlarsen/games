# Robot Bunny Engagement Upgrade Plan

Date: 2026-04-01
Scope: Make the game more engaging, more replayable, and less trivially easy while preserving fairness.

## 1. Product Goals

1. Increase challenge quality, not just difficulty spikes.
2. Increase replayability through meaningful run choices.
3. Increase retention through short-term and long-term progression goals.
4. Keep controls responsive and deaths understandable.

## 2. Current Diagnosis (from shipped build)

1. Life economy is too generous, reducing tension.
2. Mid-run decision depth is low, reducing variety and mastery expression.
3. Enemy and boss pressure patterns repeat too quickly.
4. Meta progression has limited build identity.
5. Combo and score systems provide weak strategic incentive.

## 3. Engagement Design Principles (Research-backed)

1. Flow balance: challenge should rise with demonstrated skill.
2. SDT motivation: support autonomy, competence, relatedness.
3. MDA consistency: mechanics must produce desired emotional dynamics.
4. Fair-hard design: high challenge with clear telegraphs and strong control fidelity.
5. Feedback loops: immediate micro feedback plus medium and long horizon goals.

## 4. Success Metrics (Target)

1. Median run length: +25% within 4 weeks.
2. Boss 1 clear rate: stable or +5%.
3. Boss 2 clear rate: -5% to -15% initially (intended challenge tightening), then recover with mastery.
4. Distinct build usage rate: at least 4 viable archetypes, each >= 15% share.
5. Session return rate after defeat: +15%.
6. Rage quit proxy (exit within 30s after death): -20%.

## 5. Priority Backlog

## P0: Difficulty and Fairness Rebalance (Week 1)

1. Life economy rebalance.
- Heart spawn chance: 0.08 -> 0.025.
- Coin extra-life threshold: 127 -> 220.
- Extra life from coins uses soft cap per level: max +2 from coin conversion.
- Keep heart pickups rewarding, but add a per-level cap: max +2 lives from hearts.

2. Smarter scaling.
- Enemy base health scaling start earlier: level/4 -> level/3.
- Add enemy speed scalar by level: +3% per level after level 2.
- Increase platform risk gradually: wider gaps after level 3 with smaller variance spikes.

3. Fairness tech.
- Add jump buffer: 120 ms.
- Add coyote time: 100 ms.
- Add brief landing forgiveness for chained jumps.

4. Telegraph and readability.
- Boss and tank fireball windup indicator: 250-400 ms visual cue.
- Distinct hit flash and warning audio before major attacks.

Acceptance criteria:
- Average lives at death drops by 1 to 2 without reducing perceived fairness.
- No increase in unavoidable-death reports in playtests.

## P1: Mid-Run Strategic Choice Layer (Week 2)

1. Segment perk choices (pick 1 of 3 every 2 segments).
- Mobility perk options.
- Weapon behavior options.
- Economy/risk options.

2. Initial 6 perks for MVP.
- Thruster Boots: +10% air control, -5% max HP.
- Overclocked Blaster: +25% laser speed, +15% cooldown.
- Shield Capacitor: +1 hit shield every 40s, -10% move speed.
- Magnet Core: coin pull radius +40%, enemies +5% speed.
- Adrenal Loop: combo decay slower by 35%, incoming damage +1 on hit.
- Precision Lens: weak-point hits +2 score and stagger bonus.

3. Build identity display in HUD.
- Show active perks and tradeoffs clearly.

Acceptance criteria:
- At least 3 distinct perk paths used by testers in 10 runs.
- Testers can explain their build decision in one sentence.

## P2: Encounter Variety (Week 3)

1. Enemy synergy packs.
- Pack A: Shield Walker + Flyer.
- Pack B: Sniper + Hopper.
- Pack C: Tank + fast melee pressure.

2. Biome modifiers (1 each to start).
- Crater: lower traction zones.
- Low G: periodic high-jump windows.
- Ruins: crumble platforms.
- Caverns: low visibility pockets with glow cues.

3. Boss phase behavior diversification.
- Add one positional denial move.
- Add one anti-camping move.
- Keep phase transitions telegraphed.

Acceptance criteria:
- Encounter variety score in playtest survey >= 4/5.
- No single stationary strategy dominates bosses.

## P3: Meta Progression and Retention Systems (Week 4)

1. Upgrade tree branches.
- Mobility branch.
- Weapon branch.
- Economy branch.
- Survival branch.

2. Challenge contracts.
- Daily mission (quick objective).
- Weekly mission (boss or biome objective).
- Reward with cosmetic unlocks plus modest economy currency.

3. Milestone mastery.
- Biome badges.
- Boss streak badges.
- No-hit and speed badges.

Acceptance criteria:
- Players set at least one self-selected next-run goal after game over.
- Repeat session intent score >= 4/5.

## 6. Concrete Implementation Sequence (Next 10 Working Days)

Day 1
1. Implement life economy tuning constants.
2. Add level-scoped heart and coin life gain caps.
3. Add analytics counters for death context.

Day 2
1. Implement coyote time and jump buffer.
2. Add fireball windup telegraph visuals.
3. Add warning SFX routing.

Day 3
1. Tune enemy scaling formulas.
2. Tune gap and platform generation risk curves.
3. Run balancing pass and collect baseline telemetry.

Day 4 ✅ COMPLETE
1. Implement perk system data model.
2. Add perk selection UI overlay.
3. Add 3 perks first (Mobility, Weapon, Survival).

Day 5 ✅ COMPLETE
1. Add remaining 3 perks.
2. Add HUD build summary.
3. Add perk pickup and persistence logic for run duration.

Day 6 ✅ COMPLETE
1. Implement first enemy synergy pack (Pack A: Shield Walker + Flyer).
2. Add spawn budgeting constraints (SEGMENT_ENEMY_BUDGET = 8).
3. Add debug toggles (window.rbForceEncounterPack, window.rbDebugEncounters).

Day 7 ✅ COMPLETE
1. Add remaining synergy packs (Pack B: Hopper anchor→Sniper 2 platforms ahead; Pack C: Heavy Walker anchor→Fast Hopper next platform).
2. Add biome modifiers for two biomes: Crater (lower traction 0.80) and LowG (periodic 4s low-gravity windows every 10s, 0.45× gravity, ↑ LOW GRAVITY indicator).
3. Readability pass: sniper has scope, barrel, dashed targeting line on windup; heavy walker has spike crown; sniper shots are distinct purple circles.

Day 8 ✅ COMPLETE
1. Add remaining biome modifiers: Ruins (20% of elevated platforms crumble after 0.55s of standing — shimmy warning then fall) and Caverns (3.5s darkness pulses every 8s with player halo glow cue).
2. New boss phase move: ground_slam — activates once at ≤50% health: 0.5s expanding orange ring telegraph, boss jumps, slams down, fires left+right shockwave fireballs, screen shake.
3. Anti-camping: boss tracks player horizontal zone; after 2.8s without moving CAMP_ZONE_W px the boss switches to a 195 px/s rush speed until the player repositions.

Day 9 ✅ COMPLETE
1. Implement daily contract MVP: deterministic daily seed from Date.toDateString() → hashed to CONTRACT_POOL index. Pool of 8 contracts (reach_level, kill_enemies, boss_kill, deathless, score types). Stored in localStorage rb_contract_v1 with date+completed flag. Run-tracking vars enemiesKilledThisRun, bossesKilledThisRun, livesLostThisRun, livesLostThisLevel wired to kill/loseLife paths. checkContractProgress() called at boss kill, enemy kill loop, completeLevel, and every updatePlaying tick.
2. Add reward payout and UI: CONTRACT_REWARD_COINS = 50 added to totalCoins + saveProgress() on completion. In-game canvas HUD shows small bottom-right "CONTRACT: [progress]" label (gold when complete). levelComplete screen shows gold "✓ CONTRACT: [label] +50 coins" or gray progress text. gameOver screen shows contract result row. contractJustCompletedThisRun flag clears each startNextLevel.
3. Add one mastery badge track: Boss Slayer badge — Bronze ★ (1 boss), Silver ★★ (5), Gold ★★★ (10) cumulative across all runs stored in localStorage rb_badges_v1. checkBossSlayerBadge() called on game over. New tier notification shown on levelComplete and gameOver screens as "★ BADGE: Boss Slayer [tier] unlocked!".

Day 10
1. Regression test and rebalance.
2. Compare KPIs vs baseline.
3. Ship patch notes with rationale and known follow-ups.

## 7. Instrumentation Events to Add

1. run_start
2. run_end with death_cause, level_reached, lives_remaining, active_perks
3. boss_enter and boss_defeat
4. perk_offered and perk_selected
5. hit_taken with source and player_state
6. quit_after_death flag
7. segment_complete time and damage_taken

## 8. Playtest Protocol

1. 8-12 testers, mixed skill levels.
2. 5 runs each over two sessions.
3. Survey after each run:
- Challenge fairness (1-5)
- Build meaningfulness (1-5)
- Variety (1-5)
- Intent to replay now (1-5)
4. Watch for two anti-goals:
- Cheap deaths increasing.
- Dominant strategy forming.

## 9. Risks and Mitigations

1. Risk: Difficulty overshoots and frustrates casual players.
- Mitigation: Optional assist toggles and gradual threat ramp.

2. Risk: Perks introduce balance exploits.
- Mitigation: hard constraints on stacked multipliers and telemetry review.

3. Risk: Added systems reduce clarity.
- Mitigation: concise UI language and progressive reveal.

## 10. Patch Structure Recommendation

Patch 2.1 (Fair Challenge)
1. Life economy rebalance.
2. Control forgiveness improvements.
3. Telegraph/readability improvements.

Patch 2.2 (Build Variety)
1. Perk choices and HUD build identity.
2. First synergy encounters.

Patch 2.3 (Endgame Hook)
1. Biome modifiers.
2. Boss phase variety.
3. Daily contracts and first mastery badges.

## 11. Definition of Done for Upgrade Initiative

1. Players describe runs as challenging but fair.
2. Players report meaningful decisions each run.
3. Players can name their chosen build style.
4. Retention and replay metrics improve for two consecutive patches.
