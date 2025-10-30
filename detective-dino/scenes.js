// Detective Dino - Game Scenes and Data

const gameData = {
  // Story Introduction
  intro: {
    speaker: "Detective Dino",
    text: "Oh no! Someone stole all the cookies from the cookie jar! 🍪 We need to find out who did it!",
    choices: [
      { text: "Let's investigate! 🔍", action: "start" }
    ]
  },

  // Locations with characters, objects, and clues
  locations: {
    kitchen: {
      name: "Kitchen",
      background: "kitchen",
      description: "This is where the cookie jar was!",

      characters: [
        {
          id: "bunny",
          name: "Bunny",
          emoji: "🐰",
          position: { bottom: "8%", left: "65%" },
          dialogue: {
            initial: {
              text: "Hi Detective! I love carrots, not cookies! 🥕 I was eating carrots all day!",
              choices: [
                { text: "Thanks Bunny! 👍", action: "close" }
              ]
            },
            afterClue: {
              text: "See? My paws are too big to leave those tiny prints! 🐰",
              choices: [
                { text: "You're right! 🤔", action: "close" }
              ]
            }
          }
        }
      ],

      objects: [
        {
          id: "cookie_jar",
          name: "Cookie Jar",
          emoji: "🏺",
          position: { bottom: "50%", left: "25%" },
          dialogue: {
            text: "The cookie jar is empty! All the cookies are gone! 😱",
            choices: [
              { text: "We need to find clues! 🔍", action: "close" }
            ]
          }
        }
      ],

      clues: [
        {
          id: "tiny_paw_print",
          name: "Tiny Paw Print",
          emoji: "👣",
          position: { bottom: "10%", left: "40%" },
          found: false,
          description: "You found a tiny paw print! It's much smaller than Bunny's or Dog's paws!",
          hint: "Someone with very small paws was here!"
        }
      ]
    },

    backyard: {
      name: "Backyard",
      background: "backyard",
      description: "Let's check outside!",

      characters: [
        {
          id: "dog",
          name: "Dog",
          emoji: "🐶",
          position: { bottom: "8%", left: "20%" },
          dialogue: {
            initial: {
              text: "Woof! I was playing with my ball all day! 🎾 I don't even like cookies!",
              choices: [
                { text: "Thanks Dog! 🐕", action: "close" }
              ]
            },
            afterClue: {
              text: "Those aren't my footprints! Mine are much bigger! 🐾",
              choices: [
                { text: "Good point! 💡", action: "close" }
              ]
            }
          }
        }
      ],

      objects: [
        {
          id: "ball",
          name: "Ball",
          emoji: "⚽",
          position: { bottom: "12%", left: "70%" },
          dialogue: {
            text: "Dog's ball is still here. Dog was playing all day!",
            choices: [
              { text: "Okay! ✅", action: "close" }
            ]
          }
        }
      ],

      clues: [
        {
          id: "small_footprints",
          name: "Small Footprints",
          emoji: "🦶",
          position: { bottom: "10%", left: "50%" },
          found: false,
          description: "You found tiny footprints! They lead toward the park!",
          hint: "These prints are really small - smaller than all the other animals!"
        }
      ]
    },

    living_room: {
      name: "Living Room",
      background: "living_room",
      description: "Maybe there are clues in here!",

      characters: [
        {
          id: "cat",
          name: "Cat",
          emoji: "🐱",
          position: { bottom: "25%", left: "45%" },
          dialogue: {
            initial: {
              text: "Meow! I was taking a nap on the couch all day! 😺 Cookies make me sleepy.",
              choices: [
                { text: "Thanks Cat! 😸", action: "close" }
              ]
            },
            afterClue: {
              text: "I prefer fish anyway! 🐟 Those crumbs aren't mine!",
              choices: [
                { text: "Got it! 👌", action: "close" }
              ]
            }
          }
        }
      ],

      objects: [
        {
          id: "couch",
          name: "Couch",
          emoji: "🛋️",
          position: { bottom: "15%", left: "65%" },
          dialogue: {
            text: "Cat's favorite napping spot. There's cat fur all over it!",
            choices: [
              { text: "Cat was here all day! 💤", action: "close" }
            ]
          }
        }
      ],

      clues: [
        {
          id: "cookie_crumbs",
          name: "Cookie Crumbs",
          emoji: "🍪",
          position: { bottom: "10%", left: "20%" },
          found: false,
          description: "You found cookie crumbs! They lead toward the door!",
          hint: "The cookie thief dropped crumbs while escaping!"
        }
      ]
    },

    park: {
      name: "Park",
      background: "park",
      description: "The trail leads here!",

      characters: [
        {
          id: "mouse",
          name: "Mouse",
          emoji: "🐭",
          position: { bottom: "8%", left: "40%" },
          dialogue: {
            initial: {
              text: "Squeak! Um... I was just... uh... looking at the flowers! 🌸 Nothing else!",
              choices: [
                { text: "Hmm... suspicious! 🤨", action: "close" }
              ]
            },
            afterClue: {
              text: "Okay okay! I was hungry and the cookies smelled so good! I'm sorry! 😢",
              choices: [
                { text: "Case closed! ⚖️", action: "close" }
              ]
            }
          }
        }
      ],

      objects: [
        {
          id: "flowers",
          name: "Flowers",
          emoji: "🌻",
          position: { bottom: "15%", left: "70%" },
          dialogue: {
            text: "Pretty flowers, but wait... there's something behind them!",
            choices: [
              { text: "Look closer! 👀", action: "close" }
            ]
          }
        }
      ],

      clues: [
        {
          id: "hidden_cookies",
          name: "Hidden Cookies",
          emoji: "🍪",
          position: { bottom: "12%", left: "75%" },
          found: false,
          description: "You found the cookies hidden behind the flowers! 🍪 And they're mouse-sized bites!",
          hint: "The cookies are here! Mouse must have hidden them!"
        }
      ]
    }
  },

  // Suspect Information
  suspects: {
    bunny: {
      name: "Bunny",
      emoji: "🐰",
      wrongResponse: "Bunny loves carrots, not cookies! And Bunny's paws are too big! Try again! 🥕"
    },
    cat: {
      name: "Cat",
      emoji: "🐱",
      wrongResponse: "Cat was napping all day! And Cat prefers fish! Try again! 😺"
    },
    dog: {
      name: "Dog",
      emoji: "🐶",
      wrongResponse: "Dog was playing outside all day! And Dog's paws are too big! Try again! 🐕"
    },
    mouse: {
      name: "Mouse",
      emoji: "🐭",
      wrongResponse: "Mouse is too small to reach the cookie jar! Try again! 🐭"
    }
  },

  // Clue descriptions for notebook
  clueDescriptions: {
    tiny_paw_print: {
      title: "🔍 Tiny Paw Print",
      description: "Found in the kitchen near the cookie jar. Very small - much smaller than Bunny's or Dog's paws!"
    },
    small_footprints: {
      title: "🔍 Small Footprints",
      description: "Found in the backyard leading toward the park. These belong to someone very small!"
    },
    cookie_crumbs: {
      title: "🔍 Cookie Crumbs",
      description: "Found in the living room near the door. The thief dropped crumbs while running away!"
    },
    hidden_cookies: {
      title: "🔍 Hidden Cookies",
      description: "Found hidden behind flowers in the park! The cookies have small bite marks - perfect for a mouse!"
    }
  }
};

// Make gameData available globally
window.gameData = gameData;
