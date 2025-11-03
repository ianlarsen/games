// Detective Dino - Dynamic Mystery System Example
// This shows how to structure mysteries so ANY suspect can be guilty

const mysteriesData = {
  // Mystery 1: Missing Cookies (your current mystery, expanded)
  missing_cookies: {
    title: "The Missing Cookie Case",
    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Someone stole all the cookies from the cookie jar! 🍪 We need to find out who did it!",
      choices: [{ text: "Let's investigate! 🔍", action: "start" }]
    },

    // Define locations for this mystery
    locations: ['kitchen', 'backyard', 'living_room', 'park'],

    // Each suspect has their own unique clue set and confession
    suspects: {
      bunny: {
        // Clues that appear when BUNNY is guilty
        clues: {
          kitchen: {
            id: "carrot_shaped_prints",
            name: "Carrot-Shaped Prints",
            image: "carrot_prints.png",
            position: { bottom: "10%", left: "40%" },
            description: "Strange carrot-shaped prints near the jar! How ironic! 🥕"
          },
          backyard: {
            id: "bunny_fur_trail",
            name: "White Fur",
            image: "bunny_fur_white.png",
            position: { bottom: "15%", left: "50%" },
            description: "You found white bunny fur leading to the garden!"
          },
          living_room: {
            id: "cookie_crumbs_couch",
            name: "Cookie Crumbs",
            image: "cookie_crumbs.png",
            position: { bottom: "10%", left: "20%" },
            description: "Cookie crumbs on the floor leading outside!"
          },
          park: {
            id: "hidden_cookies_garden",
            name: "Hidden Cookies",
            image: "cookies_with_carrots.png",
            position: { bottom: "12%", left: "75%" },
            description: "Cookies hidden in the garden next to carrots! 🍪🥕"
          }
        },
        // Confession dialogue when caught
        confession: "Okay, okay! I couldn't resist! They smelled like carrots! I'm sorry! 😢",
        // Alibi dialogue (before enough clues)
        alibi: "Hi Detective! I love carrots, not cookies! 🥕 I was eating carrots all day!"
      },

      cat: {
        clues: {
          kitchen: {
            id: "cat_fur_jar",
            name: "Orange Cat Fur",
            image: "cat_fur_orange.png",
            position: { bottom: "50%", left: "25%" },
            description: "Orange cat fur stuck to the cookie jar! 🐱"
          },
          backyard: {
            id: "cat_paw_prints",
            name: "Cat Paw Prints",
            image: "cat_paw_print.png",
            position: { bottom: "10%", left: "50%" },
            description: "Cat paw prints heading back inside!"
          },
          living_room: {
            id: "cookies_under_cushion",
            name: "Hidden Cookies",
            image: "cushion_cookies.png",
            position: { bottom: "25%", left: "65%" },
            description: "Cookies hidden under the couch cushion! 🍪"
          },
          park: {
            id: "cat_fish_bones",
            name: "Fish Bones",
            image: "fish_bones.png",
            position: { bottom: "10%", left: "40%" },
            description: "Wait... fish bones? Cat was here recently!"
          }
        },
        confession: "Meow... okay fine! I wanted to try them! Fish is boring sometimes! 😿",
        alibi: "Meow! I was taking a nap on the couch all day! 😺 Cookies make me sleepy."
      },

      dog: {
        clues: {
          kitchen: {
            id: "large_muddy_paws",
            name: "Large Muddy Paws",
            image: "dog_paw_large.png",
            position: { bottom: "10%", left: "40%" },
            description: "Large muddy paw prints! These are from Dog! 🐾"
          },
          backyard: {
            id: "cookie_crumbs_yard",
            name: "Cookie Crumbs",
            image: "cookie_crumbs.png",
            position: { bottom: "10%", left: "50%" },
            description: "Cookie crumbs scattered in the backyard!"
          },
          living_room: {
            id: "dog_drool",
            name: "Drool Puddle",
            image: "drool_puddle.png",
            position: { bottom: "10%", left: "30%" },
            description: "A puddle of drool! Dog was drooling over something tasty!"
          },
          park: {
            id: "buried_cookies",
            name: "Buried Cookies",
            image: "buried_cookies.png",
            position: { bottom: "12%", left: "70%" },
            description: "Cookies buried in the garden! Dog must have buried them! 🦴"
          }
        },
        confession: "Woof... I'm sorry! I buried them for later! They smelled so good! 🐕",
        alibi: "Woof! I was playing with my ball all day! 🎾 I don't even like cookies!"
      },

      mouse: {
        clues: {
          kitchen: {
            id: "tiny_paw_print",
            name: "Tiny Paw Print",
            image: "paw_print.png",
            position: { bottom: "10%", left: "40%" },
            description: "A tiny paw print! Much smaller than everyone else's!"
          },
          backyard: {
            id: "small_footprints",
            name: "Small Footprints",
            image: "small_footprints.png",
            position: { bottom: "10%", left: "50%" },
            description: "Tiny footprints leading toward the park!"
          },
          living_room: {
            id: "cookie_crumbs_trail",
            name: "Cookie Crumbs Trail",
            image: "cookie_crumbs.png",
            position: { bottom: "10%", left: "20%" },
            description: "A trail of cookie crumbs toward the door!"
          },
          park: {
            id: "hidden_cookies_flowers",
            name: "Hidden Cookies",
            image: "hidden_cookies.png",
            position: { bottom: "12%", left: "75%" },
            description: "Cookies hidden behind flowers with tiny mouse bites! 🐭"
          }
        },
        confession: "Squeak! I'm sorry! I was so hungry and they smelled amazing! 😢",
        alibi: "Squeak! Um... I was just... uh... looking at the flowers! 🌸 Nothing else!"
      }
    }
  },

  // Mystery 2: Broken Toy
  broken_toy: {
    title: "The Broken Toy Mystery",
    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Someone broke Bunny's favorite toy! 😢 We need to find out what happened!",
      choices: [{ text: "Let's solve this! 🔍", action: "start" }]
    },

    locations: ['playroom', 'garden', 'bedroom', 'garage'],

    suspects: {
      bunny: {
        clues: {
          playroom: {
            id: "toy_piece_accident",
            name: "Broken Toy Piece",
            image: "broken_toy_piece.png",
            position: { bottom: "15%", left: "45%" },
            description: "A piece of the broken toy! There's white fur on it!"
          },
          garden: {
            id: "bunny_hiding_spot",
            name: "Toy Parts Hidden",
            image: "broken_toy_in_garden.png",
            position: { bottom: "20%", left: "60%" },
            description: "More toy parts hidden in the garden! Bunny tried to hide the evidence!"
          },
          bedroom: {
            id: "carrot_toy_clue",
            name: "Carrot Pieces",
            image: "carrot_pieces.png",
            position: { bottom: "10%", left: "30%" },
            description: "Carrot pieces near more toy fragments!"
          },
          garage: {
            id: "bunny_paw_on_tool",
            name: "Bunny Fur on Tools",
            image: "bunny_fur_white.png",
            position: { bottom: "25%", left: "70%" },
            description: "Bunny fur on the toolbox! Tried to fix it?"
          }
        },
        confession: "I... I was playing too rough! I didn't mean to break it! I'm so sorry! 😭",
        alibi: "I would never break my own toy! Someone else must have done it!"
      },

      cat: {
        clues: {
          playroom: {
            id: "scratched_toy",
            name: "Scratch Marks",
            image: "scratched_toy.png",
            position: { bottom: "15%", left: "45%" },
            description: "Deep scratch marks on the toy! Cat claws! 🐱"
          },
          garden: {
            id: "cat_fur_toy",
            name: "Cat Fur",
            image: "cat_fur_orange.png",
            position: { bottom: "20%", left: "60%" },
            description: "Orange cat fur stuck to toy pieces in the garden!"
          },
          bedroom: {
            id: "toy_under_bed",
            name: "Toy Under Bed",
            image: "toy_under_couch.png",
            position: { bottom: "10%", left: "30%" },
            description: "Part of the toy hidden under the bed! Cat's hiding spot!"
          },
          garage: {
            id: "cat_whisker",
            name: "Cat Whisker",
            image: "whisker.png",
            position: { bottom: "25%", left: "70%" },
            description: "A cat whisker near more toy pieces!"
          }
        },
        confession: "Meow... I was batting at it and it broke! I didn't mean to! 😿",
        alibi: "Meow! I was sleeping in the sun! I don't play with toys!"
      },

      dog: {
        clues: {
          playroom: {
            id: "chew_marks",
            name: "Chew Marks",
            image: "chew_marks_toy.png",
            position: { bottom: "15%", left: "45%" },
            description: "Tooth marks on the toy! Dog was chewing it! 🦴"
          },
          garden: {
            id: "toy_buried",
            name: "Buried Toy Pieces",
            image: "toy_in_backyard.png",
            position: { bottom: "20%", left: "60%" },
            description: "Dog buried the broken pieces in the garden!"
          },
          bedroom: {
            id: "dog_drool_toy",
            name: "Drool on Toy",
            image: "dog_drool_on_toy.png",
            position: { bottom: "10%", left: "30%" },
            description: "The toy is covered in dog drool!"
          },
          garage: {
            id: "dog_paw_large_toy",
            name: "Large Paw Prints",
            image: "dog_paw_large.png",
            position: { bottom: "25%", left: "70%" },
            description: "Dog's large paw prints all over the garage!"
          }
        },
        confession: "Woof... I thought it was MY toy! I'm sorry I broke it! 🐕",
        alibi: "Woof woof! I was playing with MY ball outside! Not other toys!"
      },

      mouse: {
        clues: {
          playroom: {
            id: "tiny_teeth_marks",
            name: "Tiny Teeth Marks",
            image: "tiny_teeth_marks.png",
            position: { bottom: "15%", left: "45%" },
            description: "Very tiny teeth marks! Mouse was nibbling the toy!"
          },
          garden: {
            id: "toy_mouse_hole",
            name: "Toy in Mouse Hole",
            image: "toy_in_mouse_hole.png",
            position: { bottom: "20%", left: "60%" },
            description: "Part of the toy is IN a mouse hole!"
          },
          bedroom: {
            id: "cheese_toy_clue",
            name: "Cheese Bits",
            image: "cheese_bits.png",
            position: { bottom: "10%", left: "30%" },
            description: "Cheese bits near the broken toy pieces!"
          },
          garage: {
            id: "small_toy_piece_mouse",
            name: "Tiny Toy Fragment",
            image: "small_toy_piece.png",
            position: { bottom: "25%", left: "70%" },
            description: "A piece small enough for Mouse to carry!"
          }
        },
        confession: "Squeak! I thought it was cheese-scented! I nibbled too hard! Sorry! 🐭",
        alibi: "Squeak squeak! I'm too small to break a toy! It wasn't me!"
      }
    }
  }

  // Add more mysteries here: missing_ball, paint_mess, hidden_present...
};

// ===================================
// GAME INITIALIZATION EXAMPLE
// ===================================

class DynamicMysteryGame {
  constructor() {
    this.currentMystery = null;
    this.currentCulprit = null;
    this.activeClues = {};
  }

  // Randomly select mystery and culprit
  startNewGame() {
    // Pick random mystery
    const mysteryKeys = Object.keys(mysteriesData);
    const randomMystery = mysteryKeys[Math.floor(Math.random() * mysteryKeys.length)];
    this.currentMystery = mysteriesData[randomMystery];

    // Pick random culprit
    const suspectKeys = Object.keys(this.currentMystery.suspects);
    this.currentCulprit = suspectKeys[Math.floor(Math.random() * suspectKeys.length)];

    // Load the clues for this specific culprit
    this.activeClues = this.currentMystery.suspects[this.currentCulprit].clues;

    console.log('🔍 New Mystery:', this.currentMystery.title);
    console.log('🎯 Culprit:', this.currentCulprit);
    console.log('📍 Active Clues:', this.activeClues);
  }

  // Get clue for specific location
  getClueForLocation(location) {
    return this.activeClues[location] || null;
  }

  // Check if accusation is correct
  checkAccusation(suspectId) {
    if (suspectId === this.currentCulprit) {
      const confession = this.currentMystery.suspects[this.currentCulprit].confession;
      return { correct: true, message: confession };
    } else {
      const wrongResponse = this.getWrongResponse(suspectId);
      return { correct: false, message: wrongResponse };
    }
  }

  // Get alibi for innocent suspect or confession for guilty
  getSuspectDialogue(suspectId, cluesFound) {
    const suspect = this.currentMystery.suspects[suspectId];

    if (suspectId === this.currentCulprit && cluesFound >= 2) {
      // Guilty and enough clues found
      return {
        text: suspect.confession,
        nervous: true
      };
    } else {
      // Innocent or not enough evidence yet
      return {
        text: suspect.alibi,
        nervous: false
      };
    }
  }

  getWrongResponse(suspectId) {
    // Generic wrong response based on clues
    return `That's not right! Look at the clues more carefully! The evidence doesn't match ${suspectId}!`;
  }
}

// ===================================
// USAGE EXAMPLE
// ===================================

// Initialize game
const game = new DynamicMysteryGame();
game.startNewGame();

// Example: Get clue for kitchen in current mystery
const kitchenClue = game.getClueForLocation('kitchen');
console.log('Kitchen Clue:', kitchenClue);

// Example: Check if player's accusation is correct
const result = game.checkAccusation('bunny');
console.log('Accusation Result:', result);

// Example: Get dialogue for a suspect
const dialogue = game.getSuspectDialogue('cat', 3);
console.log('Cat says:', dialogue);

// ===================================
// INTEGRATION WITH YOUR CURRENT CODE
// ===================================

// In your game.js, modify the init() function:
/*
init() {
  // ... existing code ...

  // NEW: Pick random mystery
  const mysteryKeys = Object.keys(mysteriesData);
  const randomMystery = mysteryKeys[Math.floor(Math.random() * mysteryKeys.length)];
  this.currentMystery = mysteriesData[randomMystery];

  // NEW: Pick random culprit for that mystery
  const suspectKeys = Object.keys(this.currentMystery.suspects);
  this.guiltySuspect = suspectKeys[Math.floor(Math.random() * suspectKeys.length)];

  // NEW: Load clues for this culprit
  this.activeClues = this.currentMystery.suspects[this.guiltySuspect].clues;

  console.log('Mystery:', this.currentMystery.title);
  console.log('Guilty:', this.guiltySuspect);
}
*/

// In your renderLocation() function, use active clues:
/*
renderLocation() {
  const location = this.currentLocation;

  // Render clue for this location (if exists for current culprit)
  const clue = this.activeClues[location];
  if (clue && !this.cluesFound.includes(clue.id)) {
    this.renderClue(clue);
  }
}
*/

// This structure gives you:
// ✅ Multiple mysteries
// ✅ Any suspect can be guilty
// ✅ Unique clues per culprit
// ✅ Easy to add new mysteries
// ✅ Infinite replayability!
