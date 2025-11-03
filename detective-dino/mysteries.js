// Detective Dino - Dynamic Mystery System
// This file contains all mystery scenarios with support for any suspect being guilty

const mysteriesData = {
  // ========================================
  // MYSTERY 1: THE MISSING COOKIES
  // ========================================
  missing_cookies: {
    id: 'missing_cookies',
    title: "The Missing Cookie Case",

    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Someone stole all the cookies from the cookie jar! 🍪 We need to find out who did it!",
      choices: [{ text: "Let's investigate! 🔍", action: "start" }]
    },

    // Locations used in this mystery
    locations: ['kitchen', 'backyard', 'living_room', 'park'],

    // Background definitions
    backgrounds: {
      kitchen: 'kitchen',
      backyard: 'backyard',
      living_room: 'living_room',
      park: 'park'
    },

    // Objects that appear in locations (not clues, just interactive items)
    objects: {
      kitchen: [
        {
          id: "cookie_jar",
          name: "Cookie Jar",
          emoji: "🏺",
          position: { bottom: "50%", left: "25%" },
          dialogue: {
            text: "The cookie jar is empty! All the cookies are gone! 😱",
            choices: [{ text: "We need to find clues! 🔍", action: "close" }]
          }
        }
      ],
      backyard: [
        {
          id: "ball",
          name: "Ball",
          emoji: "⚽",
          position: { bottom: "12%", left: "70%" },
          dialogue: {
            text: "Dog's ball is still here. Dog was playing all day!",
            choices: [{ text: "Okay! ✅", action: "close" }]
          }
        }
      ],
      living_room: [
        {
          id: "couch",
          name: "Couch",
          emoji: "🛋️",
          position: { bottom: "15%", left: "65%" },
          dialogue: {
            text: "Cat's favorite napping spot. There's cat fur all over it!",
            choices: [{ text: "Cat was here all day! 💤", action: "close" }]
          }
        }
      ],
      park: [
        {
          id: "flowers",
          name: "Flowers",
          emoji: "🌻",
          position: { bottom: "15%", left: "70%" },
          dialogue: {
            text: "Pretty flowers, but wait... there's something behind them!",
            choices: [{ text: "Look closer! 👀", action: "close" }]
          }
        }
      ]
    },

    // Each suspect has unique clue sets and dialogue for when THEY are guilty
    suspects: {
      // ========================================
      // BUNNY AS CULPRIT
      // ========================================
      bunny: {
        name: "Bunny",
        emoji: "🐰",

        // Clues that appear when Bunny is guilty
        clues: {
          kitchen: {
            id: "bunny_fur_jar",
            name: "White Fur on Jar",
            position: { bottom: "45%", left: "30%" },
            description: "You found white bunny fur stuck to the cookie jar! 🐰",
            hint: "Bunny was near the cookie jar!",
            image: "bunny_fur_white.png", // NEW ASSET NEEDED
            imageFallback: "paw_print.png" // Use existing until new asset available
          },
          backyard: {
            id: "carrot_prints",
            name: "Carrot-Shaped Prints",
            position: { bottom: "10%", left: "50%" },
            description: "Carrot-shaped marks leading to the garden! How ironic! 🥕",
            hint: "These prints are bunny-sized!",
            image: "carrot_prints.png", // NEW ASSET NEEDED
            imageFallback: "small_footprints.png" // Use existing
          },
          living_room: {
            id: "cookie_crumbs_bunny",
            name: "Cookie Crumbs",
            position: { bottom: "10%", left: "20%" },
            description: "Cookie crumbs with white fur mixed in! 🍪",
            hint: "The thief dropped crumbs!",
            image: "cookie_crumbs.png" // HAVE THIS
          },
          park: {
            id: "cookies_with_carrots",
            name: "Cookies Hidden with Carrots",
            position: { bottom: "12%", left: "75%" },
            description: "Cookies hidden next to carrots in the garden! Bunny's secret stash! 🥕🍪",
            hint: "The cookies are here with carrots!",
            image: "cookies_with_carrots.png", // NEW ASSET NEEDED
            imageFallback: "hidden_cookies.png" // Use existing
          }
        },

        // Dialogue when Bunny is guilty
        dialogue: {
          initial: {
            text: "Hi Detective! I... uh... love carrots! Yes, carrots! 🥕 I definitely wasn't near the cookies!",
            choices: [{ text: "You seem nervous... 🤔", action: "close" }]
          },
          afterClue: {
            text: "Okay, okay! I couldn't help it! They smelled like carrots somehow! I'm so sorry! 😢",
            choices: [{ text: "The truth comes out! ⚖️", action: "close" }]
          }
        },

        confession: "I... I couldn't resist! The cookies smelled amazing and I was so hungry! Forgive me! 😭🍪",
        wrongResponse: "" // Not used when they're guilty
      },

      // ========================================
      // CAT AS CULPRIT
      // ========================================
      cat: {
        name: "Cat",
        emoji: "🐱",

        clues: {
          kitchen: {
            id: "cat_fur_jar",
            name: "Orange Cat Fur",
            position: { bottom: "48%", left: "28%" },
            description: "Orange cat fur stuck to the cookie jar! 🐱",
            hint: "Cat was definitely here!",
            image: "cat_fur_orange.png", // NEW ASSET NEEDED
            imageFallback: "paw_print.png"
          },
          backyard: {
            id: "cat_paw_prints",
            name: "Cat Paw Prints",
            position: { bottom: "10%", left: "50%" },
            description: "Cat paw prints heading back toward the house!",
            hint: "Cat was walking around here!",
            image: "cat_paw_print.png", // NEW ASSET NEEDED
            imageFallback: "small_footprints.png"
          },
          living_room: {
            id: "cookies_under_cushion",
            name: "Cookies Under Cushion",
            position: { bottom: "18%", left: "68%" },
            description: "You found cookies hidden under the couch cushion! Cat's hiding spot! 🍪",
            hint: "Cat hid them on the couch!",
            image: "cushion_cookies.png", // NEW ASSET NEEDED
            imageFallback: "hidden_cookies.png"
          },
          park: {
            id: "cat_fish_evidence",
            name: "Fish Bones",
            position: { bottom: "12%", left: "40%" },
            description: "Fish bones near cookie crumbs! Cat was here recently!",
            hint: "Cat likes fish... and cookies?",
            image: "fish_bones.png", // NEW ASSET NEEDED
            imageFallback: "cookie_crumbs.png"
          }
        },

        dialogue: {
          initial: {
            text: "Meow... I was sleeping! I prefer fish anyway... 😺 *nervously licks paw*",
            choices: [{ text: "Suspicious... 👀", action: "close" }]
          },
          afterClue: {
            text: "Fine! I wanted to try them! Fish gets boring sometimes! I'm sorry! 😿",
            choices: [{ text: "Mystery solved! 🎯", action: "close" }]
          }
        },

        confession: "Meow... okay, I confess! I was curious about cookies! They looked so tasty! 😿🍪",
        wrongResponse: ""
      },

      // ========================================
      // DOG AS CULPRIT
      // ========================================
      dog: {
        name: "Dog",
        emoji: "🐶",

        clues: {
          kitchen: {
            id: "muddy_paws_jar",
            name: "Muddy Paw Prints",
            position: { bottom: "10%", left: "40%" },
            description: "Large muddy paw prints near the cookie jar! 🐾",
            hint: "Dog's paws are big and muddy!",
            image: "muddy_tracks.png", // NEW ASSET NEEDED
            imageFallback: "paw_print.png"
          },
          backyard: {
            id: "cookie_crumbs_yard",
            name: "Cookie Crumbs Trail",
            position: { bottom: "10%", left: "50%" },
            description: "Cookie crumbs leading to a digging spot!",
            hint: "Someone dropped cookies here!",
            image: "cookie_crumbs.png" // HAVE THIS
          },
          living_room: {
            id: "dog_drool_puddle",
            name: "Drool Puddle",
            position: { bottom: "10%", left: "30%" },
            description: "A puddle of drool! Dog was drooling over something tasty!",
            hint: "Dog drools when excited about food!",
            image: "drool_puddle.png", // NEW ASSET NEEDED
            imageFallback: "cookie_crumbs.png"
          },
          park: {
            id: "buried_cookies",
            name: "Buried Cookies",
            position: { bottom: "12%", left: "70%" },
            description: "Cookies buried in the garden! Dog buried them like bones! 🦴🍪",
            hint: "Dog buries favorite things!",
            image: "buried_cookies.png", // NEW ASSET NEEDED
            imageFallback: "hidden_cookies.png"
          }
        },

        dialogue: {
          initial: {
            text: "Woof! I was just playing! With my ball! Not cookies! Woof woof! 🎾 *tail wagging nervously*",
            choices: [{ text: "Hmm... 🧐", action: "close" }]
          },
          afterClue: {
            text: "Woof... okay, you got me! I buried them for later! I love burying things! Sorry! 🐕",
            choices: [{ text: "Case closed! 📝", action: "close" }]
          }
        },

        confession: "Woof woof! I couldn't help it! They smelled SO good! I wanted to bury them for later! 🐕🍪",
        wrongResponse: ""
      },

      // ========================================
      // MOUSE AS CULPRIT (Original)
      // ========================================
      mouse: {
        name: "Mouse",
        emoji: "🐭",

        clues: {
          kitchen: {
            id: "tiny_paw_print",
            name: "Tiny Paw Print",
            position: { bottom: "10%", left: "40%" },
            description: "You found a tiny paw print! It's much smaller than everyone else's paws!",
            hint: "Someone with very small paws was here!",
            image: "paw_print.png" // HAVE THIS
          },
          backyard: {
            id: "small_footprints",
            name: "Small Footprints",
            position: { bottom: "10%", left: "50%" },
            description: "You found tiny footprints! They lead toward the park!",
            hint: "These prints are really small - smaller than all the other animals!",
            image: "small_footprints.png" // HAVE THIS
          },
          living_room: {
            id: "cookie_crumbs",
            name: "Cookie Crumbs",
            position: { bottom: "10%", left: "20%" },
            description: "You found cookie crumbs! They lead toward the door!",
            hint: "The cookie thief dropped crumbs while escaping!",
            image: "cookie_crumbs.png" // HAVE THIS
          },
          park: {
            id: "hidden_cookies",
            name: "Hidden Cookies",
            position: { bottom: "12%", left: "75%" },
            description: "You found the cookies hidden behind the flowers! 🍪 And they have mouse-sized bites!",
            hint: "The cookies are here! Mouse must have hidden them!",
            image: "hidden_cookies.png" // HAVE THIS
          }
        },

        dialogue: {
          initial: {
            text: "Squeak! Um... I was just... uh... looking at the flowers! 🌸 Nothing else!",
            choices: [{ text: "Hmm... suspicious! 🤨", action: "close" }]
          },
          afterClue: {
            text: "Okay okay! I was hungry and the cookies smelled so good! I'm sorry! 😢",
            choices: [{ text: "Case closed! ⚖️", action: "close" }]
          }
        },

        confession: "Squeak! I confess! I was so hungry and they smelled amazing! Please forgive me! 😢🍪",
        wrongResponse: ""
      }
    },

    // Wrong responses for innocent suspects
    innocentDialogue: {
      bunny: {
        initial: {
          text: "Hi Detective! I love carrots, not cookies! 🥕 I was eating carrots all day!",
          choices: [{ text: "Thanks Bunny! 👍", action: "close" }]
        },
        afterClue: {
          text: "See? My paws don't match those prints! I'm innocent! 🐰",
          choices: [{ text: "You're right! 🤔", action: "close" }]
        },
        wrongResponse: "Bunny loves carrots, not cookies! And the clues don't match Bunny! Try again! 🥕"
      },
      cat: {
        initial: {
          text: "Meow! I was taking a nap on the couch all day! 😺 Cookies make me sleepy.",
          choices: [{ text: "Thanks Cat! 😸", action: "close" }]
        },
        afterClue: {
          text: "I prefer fish anyway! 🐟 Those clues aren't mine!",
          choices: [{ text: "Got it! 👌", action: "close" }]
        },
        wrongResponse: "Cat was napping all day! And Cat prefers fish! The evidence doesn't match! Try again! 😺"
      },
      dog: {
        initial: {
          text: "Woof! I was playing with my ball all day! 🎾 I don't even like cookies!",
          choices: [{ text: "Thanks Dog! 🐕", action: "close" }]
        },
        afterClue: {
          text: "Those aren't my prints! Mine are different! Woof! 🐾",
          choices: [{ text: "Good point! 💡", action: "close" }]
        },
        wrongResponse: "Dog was playing outside all day! And the clues don't point to Dog! Try again! 🐕"
      },
      mouse: {
        initial: {
          text: "Squeak squeak! I was just enjoying the flowers! 🌸 I'm too small for cookies!",
          choices: [{ text: "Thanks Mouse! 🐭", action: "close" }]
        },
        afterClue: {
          text: "Those prints are too big to be mine! Check again! Squeak! 🐭",
          choices: [{ text: "Hmm... 🤔", action: "close" }]
        },
        wrongResponse: "Mouse is innocent! The evidence points elsewhere! Look more carefully! 🐭"
      }
    }
  }

  // Future mysteries can be added here:
  // broken_toy: { ... },
  // missing_ball: { ... },
  // etc.
};

// Make available globally
window.mysteriesData = mysteriesData;
