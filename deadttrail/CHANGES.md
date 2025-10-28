# Dead Trail Game - Story Flow Improvements

## Changes Made

### Fixed Dead Ends
**Problem:** Many character interactions had `target: null`, creating dead ends where players couldn't progress.

**Solution:** All character interactions now either:
- Advance the story to the next scene
- Offer meaningful choices with consequences
- Lead to death scenarios if players make poor decisions

### Scenes Updated:

#### 1. **office_start**
- John: Can skip ahead to forest or investigate microwave
- Jamaal: Can leave immediately or search more
- Filing Cabinet: Now contains a prison map, can advance story

#### 2. **zombie_surprise**
- All characters (John, Jamaal, zombie_rob) now have escape options
- Multiple paths to forest_escape

#### 3. **forest_escape**
- Added John and Jamaal interactions about approaching prison

#### 4. **prison_approach**
- NEW CHOICE: Hostile approach now leads to death
- Character interactions guide player decisions

#### 5. **prison_standoff**
- Added John and Jamaal strategic dialogue

#### 6. **prison_interior_welcome**
- Rick: Can now insult him → death
- Carol: Advances to prison_yard_clash
- Daryl: Being cocky → death

#### 7. **prison_yard_clash**
- Dave: Both paranoid/trusting paths advance story
- Mac: Both choices advance story
- Ed: Letting him joke → death_ed_escalation
- Daryl: Apologizing advances story
- Vending machine: Added interaction

#### 8. **breakroom_discovery**
- Ian: Ignoring warning → death
- Justin: Testing armor → death
- Maggie: Being disrespectful → death
- All positive interactions advance to walker_outbreak

#### 9. **walker_outbreak**
- NEW CHOICE: Running away → death
- Rick: Fighting alone → death
- Added zombie interactions

#### 10. **cliffhanger_ending**
- Added Ian and zombie3 interactions for atmosphere

---

## New Death Scenarios (8 Total)

1. **death_hostile_approach** - Threaten prison guards
2. **death_insulted_rick** - Disrespect Rick or Daryl
3. **death_ed_escalation** - Let Ed's joke escalate
4. **death_ignored_warning** - Ignore Ian's ghost warning
5. **death_armor_failure** - Trust Justin's experimental armor
6. **death_maggie_betrayal** - Insult Maggie/Glenn
7. **death_ran_from_fight** - Flee during walker outbreak
8. **death_fought_alone** - Try to be a solo hero

---

## Story Flow Summary

**Main Path:**
office_start → zombie_surprise → forest_escape → prison_approach → 
prison_standoff → prison_interior_welcome → prison_yard_clash → 
breakroom_discovery → walker_outbreak → cliffhanger_ending → [loops back]

**Death Branches:** 9 total ways to die (including original game_over_fight)

**Interactive Elements:** Every character and object now has meaningful interactions

---

## Result
- ✅ No more dead ends (except intentional flavor text)
- ✅ Multiple death scenarios for player consequences  
- ✅ Character interactions advance story or provide context
- ✅ Branching paths with meaningful choices
