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
      text: "Oh no! Someone stole all the cookies from the cookie jar!  We need to find out who did it!",
      choices: [{ text: "Let's investigate! ", action: "start" }]
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
          emoji: "",
          position: { bottom: "50%", left: "25%" },
          dialogue: {
            text: "The cookie jar is empty! All the cookies are gone! ",
            choices: [{ text: "We need to find clues! ", action: "close" }]
          }
        }
      ],
      backyard: [
        {
          id: "ball",
          name: "Ball",
          emoji: "",
          position: { bottom: "3%", left: "70%" },
          dialogue: {
            text: "Dog's ball is still here. Dog was playing all day!",
            choices: [{ text: "Okay! ", action: "close" }]
          }
        }
      ],
      living_room: [
        {
          id: "couch",
          name: "Couch",
          emoji: "",
          position: { bottom: "3%", left: "23%" },
          dialogue: {
            text: "Cat's favorite napping spot. There's cat fur all over it!",
            choices: [{ text: "Cat was here all day! ", action: "close" }]
          }
        }
      ],
      park: [
        {
          id: "flowers",
          name: "Flowers",
          emoji: "",
          position: { bottom: "3%", left: "23%" },
          dialogue: {
            text: "Pretty flowers, but wait... there's something behind them!",
            choices: [{ text: "Look closer! ", action: "close" }]
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
        emoji: "",

        // Clues that appear when Bunny is guilty
        clues: {
          kitchen: {
            id: "bunny_fur_jar",
            name: "White Fur on Jar",
            position: { bottom: "12%", left: "20%" },
            description: "You found white bunny fur stuck to the cookie jar! ",
            hint: "Bunny was near the cookie jar!",
            image: "bunny_fur_white.png"
          },
          backyard: {
            id: "carrot_prints",
            name: "Carrot-Shaped Prints",
            position: { bottom: "10%", left: "50%" },
            description: "Carrot-shaped marks leading to the garden! How ironic! ",
            hint: "These prints are bunny-sized!",
            image: "carrot_prints.png"
          },
          living_room: {
            id: "cookie_crumbs_bunny",
            name: "Cookie Crumbs",
            position: { bottom: "10%", left: "20%" },
            description: "Cookie crumbs with white fur mixed in! ",
            hint: "The thief dropped crumbs!",
            image: "cookie_crumbs.png"
          },
          park: {
            id: "cookies_with_carrots",
            name: "Cookies Hidden with Carrots",
            position: { bottom: "12%", left: "70%" },
            description: "Cookies hidden next to carrots in the garden! Bunny's secret stash! ",
            hint: "The cookies are here with carrots!",
            image: "cookies_with_carrots.png"
          }
        },

        // Dialogue when Bunny is guilty
        dialogue: {
          initial: {
            text: "Hi Detective! I... uh... love carrots! Yes, carrots!  I definitely wasn't near the cookies!",
            choices: [{ text: "You seem nervous... ", action: "close" }]
          },
          afterClue: {
            text: "Okay, okay! I couldn't help it! They smelled like carrots somehow! I'm so sorry! ",
            choices: [{ text: "The truth comes out! ", action: "close" }]
          }
        },

        confession: "I... I couldn't resist! The cookies smelled amazing and I was so hungry! Forgive me! ",
        wrongResponse: "" // Not used when they're guilty
      },

      // ========================================
      // CAT AS CULPRIT
      // ========================================
      cat: {
        name: "Cat",
        emoji: "",

        clues: {
          kitchen: {
            id: "cat_fur_jar",
            name: "Orange Cat Fur",
            position: { bottom: "12%", left: "18%" },
            description: "Orange cat fur stuck to the cookie jar! ",
            hint: "Cat was definitely here!",
            image: "cat_fur.png"
          },
          backyard: {
            id: "cat_paw_prints",
            name: "Cat Paw Prints",
            position: { bottom: "10%", left: "50%" },
            description: "Cat paw prints heading back toward the house!",
            hint: "Cat was walking around here!",
            image: "cat_paw_print.png"
          },
          living_room: {
            id: "cookies_under_cushion",
            name: "Cookies Under Cushion",
            position: { bottom: "18%", left: "68%" },
            description: "You found cookies hidden under the couch cushion! Cat's hiding spot! ",
            hint: "Cat hid them on the couch!",
            image: "cushion_cookies.png"
          },
          park: {
            id: "cat_fish_evidence",
            name: "Fish Bones",
            position: { bottom: "12%", left: "46%" },
            description: "Fish bones near cookie crumbs! Cat was here recently!",
            hint: "Cat likes fish... and cookies?",
            image: "fish_bones.png"
          }
        },

        dialogue: {
          initial: {
            text: "Meow... I was sleeping! I prefer fish anyway...  *nervously licks paw*",
            choices: [{ text: "Suspicious... ", action: "close" }]
          },
          afterClue: {
            text: "Fine! I wanted to try them! Fish gets boring sometimes! I'm sorry! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "Meow... okay, I confess! I was curious about cookies! They looked so tasty! ",
        wrongResponse: ""
      },

      // ========================================
      // DOG AS CULPRIT
      // ========================================
      dog: {
        name: "Dog",
        emoji: "",

        clues: {
          kitchen: {
            id: "muddy_paws_jar",
            name: "Muddy Paw Prints",
            position: { bottom: "10%", left: "46%" },
            description: "Large muddy paw prints near the cookie jar! ",
            hint: "Dog's paws are big and muddy!",
            image: "muddy_tracks.png"
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
            position: { bottom: "10%", left: "23%" },
            description: "A puddle of drool! Dog was drooling over something tasty!",
            hint: "Dog drools when excited about food!",
            image: "drool_puddle.png"
          },
          park: {
            id: "buried_cookies",
            name: "Buried Cookies",
            position: { bottom: "12%", left: "70%" },
            description: "Cookies buried in the garden! Dog buried them like bones! ",
            hint: "Dog buries favorite things!",
            image: "buried_cookies.png"
          }
        },

        dialogue: {
          initial: {
            text: "Woof! I was just playing! With my ball! Not cookies! Woof woof!  *tail wagging nervously*",
            choices: [{ text: "Hmm... ", action: "close" }]
          },
          afterClue: {
            text: "Woof... okay, you got me! I buried them for later! I love burying things! Sorry! ",
            choices: [{ text: "Case closed! ", action: "close" }]
          }
        },

        confession: "Woof woof! I couldn't help it! They smelled SO good! I wanted to bury them for later! ",
        wrongResponse: ""
      },

      // ========================================
      // MOUSE AS CULPRIT (Original)
      // ========================================
      mouse: {
        name: "Mouse",
        emoji: "",

        clues: {
          kitchen: {
            id: "tiny_paw_print",
            name: "Tiny Paw Print",
            position: { bottom: "10%", left: "46%" },
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
            position: { bottom: "12%", left: "70%" },
            description: "You found the cookies hidden behind the flowers!  And they have mouse-sized bites!",
            hint: "The cookies are here! Mouse must have hidden them!",
            image: "hidden_cookies.png" // HAVE THIS
          }
        },

        dialogue: {
          initial: {
            text: "Squeak! Um... I was just... uh... looking at the flowers!  Nothing else!",
            choices: [{ text: "Hmm... suspicious! ", action: "close" }]
          },
          afterClue: {
            text: "Okay okay! I was hungry and the cookies smelled so good! I'm sorry! ",
            choices: [{ text: "Case closed! ", action: "close" }]
          }
        },

        confession: "Squeak! I confess! I was so hungry and they smelled amazing! Please forgive me! ",
        wrongResponse: ""
      }
    },

    // Wrong responses for innocent suspects
    innocentDialogue: {
      bunny: {
        initial: {
          text: "Hi Detective! I love carrots, not cookies!  I was eating carrots all day!",
          choices: [{ text: "Thanks Bunny! ", action: "close" }]
        },
        afterClue: {
          text: "See? My paws don't match those prints! I'm innocent! ",
          choices: [{ text: "You're right! ", action: "close" }]
        },
        wrongResponse: "Bunny loves carrots, not cookies! And the clues don't match Bunny! Try again! "
      },
      cat: {
        initial: {
          text: "Meow! I was taking a nap on the couch all day!  Cookies make me sleepy.",
          choices: [{ text: "Thanks Cat! ", action: "close" }]
        },
        afterClue: {
          text: "I prefer fish anyway!  Those clues aren't mine!",
          choices: [{ text: "Got it! ", action: "close" }]
        },
        wrongResponse: "Cat was napping all day! And Cat prefers fish! The evidence doesn't match! Try again! "
      },
      dog: {
        initial: {
          text: "Woof! I was playing with my ball all day!  I don't even like cookies!",
          choices: [{ text: "Thanks Dog! ", action: "close" }]
        },
        afterClue: {
          text: "Those aren't my prints! Mine are different! Woof! ",
          choices: [{ text: "Good point! ", action: "close" }]
        },
        wrongResponse: "Dog was playing outside all day! And the clues don't point to Dog! Try again! "
      },
      mouse: {
        initial: {
          text: "Squeak squeak! I was just enjoying the flowers!  I'm too small for cookies!",
          choices: [{ text: "Thanks Mouse! ", action: "close" }]
        },
        afterClue: {
          text: "Those prints are too big to be mine! Check again! Squeak! ",
          choices: [{ text: "Hmm... ", action: "close" }]
        },
        wrongResponse: "Mouse is innocent! The evidence points elsewhere! Look more carefully! "
      }
    }
  },

  // ========================================
  // MYSTERY 2: THE BROKEN TOY
  // ========================================
  broken_toy: {
    id: 'broken_toy',
    title: "The Broken Toy Case",

    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Someone broke the special toy!  We need to find out who did it!",
      choices: [{ text: "Let's investigate! ", action: "start" }]
    },

    locations: ['playroom', 'garden', 'bedroom', 'garage'],

    backgrounds: {
      playroom: 'playroom',
      garden: 'garden',
      bedroom: 'bedroom',
      garage: 'garage'
    },

    objects: {
      playroom: [
        {
          id: "toy_box",
          name: "Toy Box",
          emoji: "",
          position: { bottom: "3%", left: "23%" },
          dialogue: {
            text: "The toy box is messy! Someone was looking through it!",
            choices: [{ text: "Interesting! ", action: "close" }]
          }
        }
      ],
      garden: [],
      bedroom: [
        {
          id: "bed",
          name: "Bed",
          emoji: "",
          position: { bottom: "3%", left: "70%" },
          dialogue: {
            text: "The bed looks normal. Nothing suspicious here!",
            choices: [{ text: "Okay! ", action: "close" }]
          }
        }
      ],
      garage: [
        {
          id: "toolbox",
          name: "Toolbox",
          emoji: "",
          position: { bottom: "3%", left: "70%" },
          dialogue: {
            text: "The toolbox is open! Someone might have used the tools!",
            choices: [{ text: "That's a clue! ", action: "close" }]
          }
        }
      ]
    },

    suspects: {
      bunny: {
        name: "Bunny",
        emoji: "",

        clues: {
          playroom: {
            id: "bunny_fur_toy",
            name: "White Fur on Toy",
            position: { bottom: "8%", left: "46%" },
            description: "White bunny fur stuck to the broken toy! ",
            hint: "Bunny was touching the toy!",
            image: "bunny_fur_white.png"
          },
          garden: {
            id: "broken_toy_garden",
            name: "Broken Toy Piece",
            position: { bottom: "15%", left: "46%" },
            description: "A piece of the broken toy hidden in the garden! ",
            hint: "Someone tried to hide the evidence!",
            image: "broken_toy_in_garden.png"
          },
          bedroom: {
            id: "carrot_pieces_bed",
            name: "Carrot Pieces",
            position: { bottom: "20%", left: "25%" },
            description: "Carrot pieces near the bed! Bunny was here eating! ",
            hint: "Bunny's favorite snack!",
            image: "carrot_pieces.png"
          },
          garage: {
            id: "toy_with_fur",
            name: "Toy with Bunny Fur",
            position: { bottom: "12%", left: "65%" },
            description: "More toy pieces with white fur! Bunny tried to fix it! ",
            hint: "Bunny felt guilty and tried to repair it!",
            image: "toy_with_bunny_fur.png"
          }
        },

        dialogue: {
          initial: {
            text: "Hi! I... uh... was just playing carefully! Very carefully! ",
            choices: [{ text: "Hmm, suspicious... ", action: "close" }]
          },
          afterClue: {
            text: "Okay! I played too rough and it broke! I tried to fix it! I'm sorry! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "I didn't mean to break it! I was just so excited to play! Please forgive me! ",
        wrongResponse: ""
      },

      cat: {
        name: "Cat",
        emoji: "",

        clues: {
          playroom: {
            id: "cat_fur_toy",
            name: "Orange Cat Fur",
            position: { bottom: "8%", left: "46%" },
            description: "Orange cat fur on the broken toy! ",
            hint: "Cat was playing with it!",
            image: "cat_fur.png"
          },
          garden: {
            id: "cat_toy_garden",
            name: "Toy Piece Outside",
            position: { bottom: "15%", left: "46%" },
            description: "The toy piece was batted outside! Cats love to swat things! ",
            hint: "Cat was playing rough!",
            image: "broken_toy_piece.png"
          },
          bedroom: {
            id: "cat_hiding_spot",
            name: "Cat Paw Prints",
            position: { bottom: "20%", left: "25%" },
            description: "Cat paw prints all around! Cat was running around! ",
            hint: "Cat was very active here!",
            image: "cat_paw_print.png"
          },
          garage: {
            id: "toy_under_shelf",
            name: "Toy Under Shelf",
            position: { bottom: "12%", left: "65%" },
            description: "Cat pushed the toy under the shelf and it broke! ",
            hint: "Cat was batting at it!",
            image: "broken_toy_piece.png"
          }
        },

        dialogue: {
          initial: {
            text: "Meow... I was just napping! I didn't touch any toys! ",
            choices: [{ text: "Really? ", action: "close" }]
          },
          afterClue: {
            text: "Fine! I was batting it around and it broke! I didn't mean to! ",
            choices: [{ text: "Case closed! ", action: "close" }]
          }
        },

        confession: "Meow... I'm sorry! It looked fun to play with! I got carried away! ",
        wrongResponse: ""
      },

      dog: {
        name: "Dog",
        emoji: "",

        clues: {
          playroom: {
            id: "dog_drool_toy",
            name: "Drool on Toy",
            position: { bottom: "8%", left: "46%" },
            description: "Dog drool all over the broken toy! ",
            hint: "Dog was chewing on it!",
            image: "drool_puddle.png"
          },
          garden: {
            id: "buried_toy_piece",
            name: "Buried Toy Piece",
            position: { bottom: "15%", left: "46%" },
            description: "Dog buried part of the toy like a bone! ",
            hint: "Dog buries everything!",
            image: "broken_toy_in_garden.png"
          },
          bedroom: {
            id: "muddy_paws_bed",
            name: "Muddy Paw Prints",
            position: { bottom: "20%", left: "25%" },
            description: "Big muddy paw prints on the bed! Dog was here! ",
            hint: "Dog tracked mud everywhere!",
            image: "muddy_tracks.png"
          },
          garage: {
            id: "chewed_toy",
            name: "Chewed Toy Piece",
            position: { bottom: "12%", left: "65%" },
            description: "Toy piece with bite marks! Dog was chewing it! ",
            hint: "Dog thought it was a chew toy!",
            image: "broken_toy_piece.png"
          }
        },

        dialogue: {
          initial: {
            text: "Woof! I was just playing fetch outside! Not with toys! ",
            choices: [{ text: "Are you sure? ", action: "close" }]
          },
          afterClue: {
            text: "Woof woof! Okay, I thought it was a chew toy! I'm sorry! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "Woof! I thought it was for me to chew! I didn't know it was special! ",
        wrongResponse: ""
      },

      mouse: {
        name: "Mouse",
        emoji: "",

        clues: {
          playroom: {
            id: "tiny_teeth_marks",
            name: "Tiny Teeth Marks",
            position: { bottom: "8%", left: "46%" },
            description: "Tiny teeth marks on the toy! Mouse was nibbling! ",
            hint: "Mouse chewed on it!",
            image: "paw_print.png"
          },
          garden: {
            id: "small_toy_piece",
            name: "Small Toy Piece",
            position: { bottom: "15%", left: "46%" },
            description: "A tiny piece of toy! Mouse carried it here! ",
            hint: "Mouse was moving the pieces!",
            image: "broken_toy_piece.png"
          },
          bedroom: {
            id: "mouse_nest",
            name: "Tiny Footprints",
            position: { bottom: "20%", left: "25%" },
            description: "Tiny mouse footprints everywhere! ",
            hint: "Mouse was very busy here!",
            image: "small_footprints.png"
          },
          garage: {
            id: "toy_in_hole",
            name: "Toy in Mouse Hole",
            position: { bottom: "12%", left: "65%" },
            description: "Toy pieces near mouse hole! Mouse tried to take them home! ",
            hint: "Mouse wanted the toy parts!",
            image: "broken_toy_piece.png"
          }
        },

        dialogue: {
          initial: {
            text: "Squeak! I was just looking! I didn't break anything! ",
            choices: [{ text: "Tell the truth! ", action: "close" }]
          },
          afterClue: {
            text: "Squeak squeak! I wanted to use the pieces for my nest! Sorry! ",
            choices: [{ text: "Case solved! ", action: "close" }]
          }
        },

        confession: "Squeak! The toy pieces looked perfect for my home! I'm sorry I broke it! ",
        wrongResponse: ""
      }
    },

    innocentDialogue: {
      bunny: {
        initial: {
          text: "I was eating carrots in the garden all day! ",
          choices: [{ text: "Thanks Bunny! ", action: "close" }]
        },
        afterClue: {
          text: "Those clues aren't mine! I'm innocent! ",
          choices: [{ text: "You're right! ", action: "close" }]
        },
        wrongResponse: "Bunny wasn't near the toy! The evidence points elsewhere! Try again! "
      },
      cat: {
        initial: {
          text: "I was sleeping on the couch! I don't play with toys! ",
          choices: [{ text: "Thanks Cat! ", action: "close" }]
        },
        afterClue: {
          text: "That's not my fur! Check again! ",
          choices: [{ text: "Got it! ", action: "close" }]
        },
        wrongResponse: "Cat was napping! The clues don't match! Try again! "
      },
      dog: {
        initial: {
          text: "I only play with my ball! Woof! ",
          choices: [{ text: "Thanks Dog! ", action: "close" }]
        },
        afterClue: {
          text: "Those aren't my paw prints! Woof! ",
          choices: [{ text: "Good point! ", action: "close" }]
        },
        wrongResponse: "Dog was playing outside! The evidence doesn't fit! Try again! "
      },
      mouse: {
        initial: {
          text: "I'm too small to break toys! Squeak! ",
          choices: [{ text: "Thanks Mouse! ", action: "close" }]
        },
        afterClue: {
          text: "That's not my evidence! Squeak! ",
          choices: [{ text: "Hmm... ", action: "close" }]
        },
        wrongResponse: "Mouse is innocent! Look at the clues again! Try again! "
      }
    }
  },

  // ========================================
  // MYSTERY 3: THE MISSING BALL
  // ========================================
  missing_ball: {
    id: 'missing_ball',
    title: "The Missing Ball Case",

    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Dog's favorite ball is missing!  We need to find it!",
      choices: [{ text: "Let's search! ", action: "start" }]
    },

    locations: ['backyard', 'park', 'beach', 'sports_field'],

    backgrounds: {
      backyard: 'backyard',
      park: 'park',
      beach: 'beach',
      sports_field: 'sports_field'
    },

    objects: {
      backyard: [
        {
          id: "doghouse",
          name: "Doghouse",
          emoji: "",
          position: { bottom: "3%", left: "65%" },
          dialogue: {
            text: "Dog's house is empty! The ball isn't here!",
            choices: [{ text: "Keep looking! ", action: "close" }]
          }
        }
      ],
      park: [],
      beach: [
        {
          id: "sandcastle",
          name: "Sandcastle",
          emoji: "",
          position: { bottom: "3%", left: "50%" },
          dialogue: {
            text: "A beautiful sandcastle! But no ball here!",
            choices: [{ text: "Nice castle! ", action: "close" }]
          }
        }
      ],
      sports_field: [
        {
          id: "goal",
          name: "Goal Post",
          emoji: "",
          position: { bottom: "3%", left: "23%" },
          dialogue: {
            text: "The goal post is here, but where's the ball?",
            choices: [{ text: "We'll find it! ", action: "close" }]
          }
        }
      ]
    },

    suspects: {
      bunny: {
        name: "Bunny",
        emoji: "",

        clues: {
          backyard: {
            id: "bunny_tracks",
            name: "Bunny Tracks",
            position: { bottom: "15%", left: "45%" },
            description: "Bunny tracks near where the ball was! ",
            hint: "Bunny was hopping around here!",
            image: "carrot_prints.png"
          },
          park: {
            id: "bunny_fur_grass",
            name: "White Fur",
            position: { bottom: "20%", left: "50%" },
            description: "White bunny fur in the grass! ",
            hint: "Bunny was playing here!",
            image: "bunny_fur_white.png"
          },
          beach: {
            id: "ball_buried_carrots",
            name: "Ball with Carrots",
            position: { bottom: "12%", left: "70%" },
            description: "The ball buried next to carrots! Bunny hid it! ",
            hint: "Bunny's secret hiding spot!",
            image: "hidden_cookies.png"
          },
          sports_field: {
            id: "bunny_digging",
            name: "Digging Marks",
            position: { bottom: "18%", left: "70%" },
            description: "Bunny was digging here! Looking for a place to hide the ball! ",
            hint: "Fresh digging marks!",
            image: "carrot_prints.png"
          }
        },

        dialogue: {
          initial: {
            text: "I don't like balls! I prefer carrots! ",
            choices: [{ text: "Suspicious... ", action: "close" }]
          },
          afterClue: {
            text: "Okay! I wanted to play with it too! I hid it! Sorry! ",
            choices: [{ text: "Found it! ", action: "close" }]
          }
        },

        confession: "I just wanted to play with the ball! I didn't mean to hide it for so long! ",
        wrongResponse: ""
      },

      cat: {
        name: "Cat",
        emoji: "",

        clues: {
          backyard: {
            id: "cat_paw_ball",
            name: "Cat Paw Prints",
            position: { bottom: "15%", left: "45%" },
            description: "Cat paw prints near the ball's spot! ",
            hint: "Cat was batting the ball!",
            image: "cat_paw_print.png"
          },
          park: {
            id: "ball_in_tree",
            name: "Ball in Tree",
            position: { bottom: "28%", left: "23%" },
            description: "The ball is stuck in a tree! Cat must have batted it up there! ",
            hint: "Only cat could get it that high!",
            image: "hidden_cookies.png"
          },
          beach: {
            id: "cat_tracks_sand",
            name: "Cat Prints in Sand",
            position: { bottom: "12%", left: "70%" },
            description: "Cat paw prints in the sand! Cat was here! ",
            hint: "Cat doesn't usually like sand!",
            image: "cat_paw_print.png"
          },
          sports_field: {
            id: "orange_fur",
            name: "Orange Fur",
            position: { bottom: "18%", left: "70%" },
            description: "Orange cat fur on the grass! ",
            hint: "Cat was playing here!",
            image: "cat_fur.png"
          }
        },

        dialogue: {
          initial: {
            text: "Meow! I don't play with dog toys! Too energetic! ",
            choices: [{ text: "Hmm... ", action: "close" }]
          },
          afterClue: {
            text: "Fine! I was batting it around and it got stuck! Sorry! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "Meow... it was fun to bat around! I didn't mean to lose it! ",
        wrongResponse: ""
      },

      dog: {
        name: "Dog",
        emoji: "",

        clues: {
          backyard: {
            id: "dog_digging",
            name: "Fresh Digging",
            position: { bottom: "15%", left: "45%" },
            description: "Dog was digging here! Fresh dirt everywhere! ",
            hint: "Dog buried something!",
            image: "muddy_tracks.png"
          },
          park: {
            id: "dog_drool_trail",
            name: "Drool Trail",
            position: { bottom: "20%", left: "50%" },
            description: "Dog drool trail! Dog was carrying the ball! ",
            hint: "Dog was very excited!",
            image: "drool_puddle.png"
          },
          beach: {
            id: "buried_ball",
            name: "Buried Ball",
            position: { bottom: "12%", left: "70%" },
            description: "The ball buried in the sand! Dog hid it here! ",
            hint: "Dog's favorite hiding trick!",
            image: "buried_cookies.png"
          },
          sports_field: {
            id: "muddy_ball_spot",
            name: "Muddy Area",
            position: { bottom: "18%", left: "70%" },
            description: "Muddy paw prints where the ball was! ",
            hint: "Dog was playing in the mud!",
            image: "muddy_tracks.png"
          }
        },

        dialogue: {
          initial: {
            text: "Woof! My ball is missing! Help me find it! ",
            choices: [{ text: "We will! ", action: "close" }]
          },
          afterClue: {
            text: "Woof woof! Oh! I buried it to save it for later! I forgot! ",
            choices: [{ text: "Found it! ", action: "close" }]
          }
        },

        confession: "Woof! I buried it for safekeeping and forgot where! Silly me! ",
        wrongResponse: ""
      },

      mouse: {
        name: "Mouse",
        emoji: "",

        clues: {
          backyard: {
            id: "tiny_tracks_ball",
            name: "Tiny Tracks",
            position: { bottom: "15%", left: "45%" },
            description: "Tiny mouse tracks near the ball! ",
            hint: "Mouse was trying to move it!",
            image: "small_footprints.png"
          },
          park: {
            id: "mouse_pushing",
            name: "Push Marks",
            position: { bottom: "20%", left: "50%" },
            description: "Tiny push marks! Mouse was rolling the ball! ",
            hint: "Mouse is surprisingly strong!",
            image: "small_footprints.png"
          },
          beach: {
            id: "ball_in_hole",
            name: "Ball in Hole",
            position: { bottom: "12%", left: "70%" },
            description: "The ball in a mouse hole! Mouse tried to take it home! ",
            hint: "The ball is too big for the hole!",
            image: "hidden_cookies.png"
          },
          sports_field: {
            id: "mouse_trail",
            name: "Mouse Trail",
            position: { bottom: "18%", left: "70%" },
            description: "A trail showing where mouse rolled the ball! ",
            hint: "Mouse worked very hard!",
            image: "paw_print.png"
          }
        },

        dialogue: {
          initial: {
            text: "Squeak! I can't even lift a ball! Too small! ",
            choices: [{ text: "Maybe... ", action: "close" }]
          },
          afterClue: {
            text: "Squeak! Okay, I rolled it away! It looked fun! Sorry! ",
            choices: [{ text: "Case closed! ", action: "close" }]
          }
        },

        confession: "Squeak! I wanted a big ball for my home! I didn't think Dog would miss it! ",
        wrongResponse: ""
      }
    },

    innocentDialogue: {
      bunny: {
        initial: {
          text: "I was eating carrots all day! ",
          choices: [{ text: "Thanks Bunny! ", action: "close" }]
        },
        afterClue: {
          text: "I don't even like balls! Innocent! ",
          choices: [{ text: "Right! ", action: "close" }]
        },
        wrongResponse: "Bunny prefers carrots to balls! Wrong suspect! Try again! "
      },
      cat: {
        initial: {
          text: "I was napping! Meow! ",
          choices: [{ text: "Thanks Cat! ", action: "close" }]
        },
        afterClue: {
          text: "Not my prints! Check again! ",
          choices: [{ text: "Okay! ", action: "close" }]
        },
        wrongResponse: "Cat was sleeping! The evidence doesn't match! Try again! "
      },
      dog: {
        initial: {
          text: "I love my ball! I wouldn't hide it! Woof! ",
          choices: [{ text: "Thanks Dog! ", action: "close" }]
        },
        afterClue: {
          text: "Wait, those could be my prints... but I didn't hide it! Woof! ",
          choices: [{ text: "Interesting! ", action: "close" }]
        },
        wrongResponse: "Dog is the victim here! Not the culprit! Try again! "
      },
      mouse: {
        initial: {
          text: "Too heavy for me! Squeak! ",
          choices: [{ text: "Thanks Mouse! ", action: "close" }]
        },
        afterClue: {
          text: "I'm innocent! Squeak! ",
          choices: [{ text: "Got it! ", action: "close" }]
        },
        wrongResponse: "Mouse is too small! The evidence points elsewhere! Try again! "
      }
    }
  },

  // ========================================
  // MYSTERY 4: THE PAINT MESS
  // ========================================
  paint_mess: {
    id: 'paint_mess',
    title: "The Paint Mess Case",

    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Someone made a paint mess in the art room!  We need to find the culprit!",
      choices: [{ text: "Let's investigate! ", action: "start" }]
    },

    locations: ['art_room', 'hallway', 'bathroom', 'kitchen'],

    backgrounds: {
      art_room: 'art_room',
      hallway: 'hallway',
      bathroom: 'bathroom',
      kitchen: 'kitchen'
    },

    objects: {
      art_room: [
        {
          id: "easel",
          name: "Easel",
          emoji: "",
          position: { bottom: "5%", left: "70%" },
          dialogue: {
            text: "The easel is knocked over! Paint is everywhere!",
            choices: [{ text: "What a mess! ", action: "close" }]
          }
        }
      ],
      hallway: [],
      bathroom: [
        {
          id: "sink",
          name: "Sink",
          emoji: "",
          position: { bottom: "20%", left: "50%" },
          dialogue: {
            text: "The sink has paint in it! Someone tried to wash up!",
            choices: [{ text: "Good clue! ", action: "close" }]
          }
        }
      ],
      kitchen: [
        {
          id: "table",
          name: "Table",
          emoji: "",
          position: { bottom: "15%", left: "70%" },
          dialogue: {
            text: "The kitchen table is clean! No paint here!",
            choices: [{ text: "Okay! ", action: "close" }]
          }
        }
      ]
    },

    suspects: {
      bunny: {
        name: "Bunny",
        emoji: "",

        clues: {
          art_room: {
            id: "white_fur_paint",
            name: "White Fur in Paint",
            position: { bottom: "8%", left: "50%" },
            description: "White bunny fur stuck in the wet paint! ",
            hint: "Bunny was in the paint!",
            image: "bunny_fur_white.png"
          },
          hallway: {
            id: "paint_paw_bunny",
            name: "Paint Paw Prints",
            position: { bottom: "15%", left: "45%" },
            description: "Bunny-sized paw prints in paint! ",
            hint: "Bunny walked through the paint!",
            image: "carrot_prints.png"
          },
          bathroom: {
            id: "bunny_washing",
            name: "White Fur by Sink",
            position: { bottom: "18%", left: "46%" },
            description: "White fur near the sink! Bunny was washing up! ",
            hint: "Bunny tried to clean off!",
            image: "bunny_fur_white.png"
          },
          kitchen: {
            id: "paint_carrot",
            name: "Paint on Carrot",
            position: { bottom: "20%", left: "46%" },
            description: "A carrot with paint on it! Bunny was eating while painting! ",
            hint: "Bunny's snack has paint!",
            image: "carrot_pieces.png"
          }
        },

        dialogue: {
          initial: {
            text: "I... uh... I was just eating carrots! Not painting! ",
            choices: [{ text: "Really? ", action: "close" }]
          },
          afterClue: {
            text: "Okay! I wanted to paint and I bumped the easel! I'm sorry! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "I wanted to make art too! But I'm clumsy and knocked everything over! ",
        wrongResponse: ""
      },

      cat: {
        name: "Cat",
        emoji: "",

        clues: {
          art_room: {
            id: "cat_fur_paint",
            name: "Orange Fur in Paint",
            position: { bottom: "8%", left: "50%" },
            description: "Orange cat fur in the spilled paint! ",
            hint: "Cat walked through it!",
            image: "cat_fur.png"
          },
          hallway: {
            id: "paint_paws_cat",
            name: "Cat Paint Prints",
            position: { bottom: "15%", left: "45%" },
            description: "Cat paw prints in paint going down the hall! ",
            hint: "Cat left a trail!",
            image: "cat_paw_print.png"
          },
          bathroom: {
            id: "paint_in_sink",
            name: "Orange Paint Water",
            position: { bottom: "18%", left: "46%" },
            description: "The sink water is orange from cat fur and paint! ",
            hint: "Cat tried to wash!",
            image: "cat_paw_print.png"
          },
          kitchen: {
            id: "cat_paint_trail",
            name: "Paint Trail",
            position: { bottom: "20%", left: "46%" },
            description: "Paint paw prints lead to cat's food bowl! ",
            hint: "Cat went straight to eat!",
            image: "cat_paw_print.png"
          }
        },

        dialogue: {
          initial: {
            text: "Meow! I was sleeping! I don't like paint! ",
            choices: [{ text: "Suspicious... ", action: "close" }]
          },
          afterClue: {
            text: "Fine! I jumped on the table and knocked the paint over! Sorry! ",
            choices: [{ text: "Case closed! ", action: "close" }]
          }
        },

        confession: "Meow... I was curious about the shiny paint bottles! I knocked them over! ",
        wrongResponse: ""
      },

      dog: {
        name: "Dog",
        emoji: "",

        clues: {
          art_room: {
            id: "tail_wag_paint",
            name: "Tail Marks in Paint",
            position: { bottom: "8%", left: "50%" },
            description: "Tail wag marks in the paint! Dog was excited! ",
            hint: "Dog's tail caused the mess!",
            image: "drool_puddle.png"
          },
          hallway: {
            id: "muddy_paint_paws",
            name: "Muddy Paint Paws",
            position: { bottom: "15%", left: "45%" },
            description: "Big muddy paw prints with paint! Dog tracked it everywhere! ",
            hint: "Dog has big paws!",
            image: "muddy_tracks.png"
          },
          bathroom: {
            id: "dog_washing",
            name: "Paint in Tub",
            position: { bottom: "18%", left: "46%" },
            description: "Paint all over the tub! Dog tried to wash off! ",
            hint: "Dog made more mess washing!",
            image: "drool_puddle.png"
          },
          kitchen: {
            id: "paint_water_bowl",
            name: "Paint in Water Bowl",
            position: { bottom: "20%", left: "46%" },
            description: "Dog's water bowl has paint in it! Dog rinsed paws here! ",
            hint: "Dog tried to clean up!",
            image: "drool_puddle.png"
          }
        },

        dialogue: {
          initial: {
            text: "Woof! I was playing outside! Not painting! ",
            choices: [{ text: "Hmm... ", action: "close" }]
          },
          afterClue: {
            text: "Woof woof! I ran in excited and my tail knocked over the paint! Sorry! ",
            choices: [{ text: "Found the culprit! ", action: "close" }]
          }
        },

        confession: "Woof! I was too excited! My tail wagged too hard and knocked everything! ",
        wrongResponse: ""
      },

      mouse: {
        name: "Mouse",
        emoji: "",

        clues: {
          art_room: {
            id: "tiny_paint_tracks",
            name: "Tiny Paint Tracks",
            position: { bottom: "8%", left: "50%" },
            description: "Tiny mouse tracks in the paint! ",
            hint: "Mouse walked through the mess!",
            image: "small_footprints.png"
          },
          hallway: {
            id: "small_paint_trail",
            name: "Small Paint Trail",
            position: { bottom: "15%", left: "45%" },
            description: "Tiny paint paw prints down the hall! Mouse ran away! ",
            hint: "Mouse left tiny marks!",
            image: "paw_print.png"
          },
          bathroom: {
            id: "mouse_paint_sink",
            name: "Tiny Prints by Sink",
            position: { bottom: "18%", left: "46%" },
            description: "Tiny mouse prints near the sink! Mouse tried to wash! ",
            hint: "Mouse wanted to clean up!",
            image: "small_footprints.png"
          },
          kitchen: {
            id: "paint_mouse_hole",
            name: "Paint by Mouse Hole",
            position: { bottom: "20%", left: "46%" },
            description: "Paint marks near mouse hole! Mouse brought paint home! ",
            hint: "Mouse tracked it everywhere!",
            image: "paw_print.png"
          }
        },

        dialogue: {
          initial: {
            text: "Squeak! I'm too small to make a big mess! ",
            choices: [{ text: "We'll see... ", action: "close" }]
          },
          afterClue: {
            text: "Squeak squeak! I wanted to use the paint for decorating! I spilled it! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "Squeak! I wanted pretty colors for my home! I didn't mean to spill so much! ",
        wrongResponse: ""
      }
    },

    innocentDialogue: {
      bunny: {
        initial: {
          text: "I was munching carrots in the garden! ",
          choices: [{ text: "Thanks Bunny! ", action: "close" }]
        },
        afterClue: {
          text: "That's not my fur! I'm innocent! ",
          choices: [{ text: "Right! ", action: "close" }]
        },
        wrongResponse: "Bunny was outside! The clues don't match! Try again! "
      },
      cat: {
        initial: {
          text: "I don't like getting messy! Meow! ",
          choices: [{ text: "Thanks Cat! ", action: "close" }]
        },
        afterClue: {
          text: "I stay clean! Not my prints! ",
          choices: [{ text: "Got it! ", action: "close" }]
        },
        wrongResponse: "Cat avoids messes! Wrong suspect! Try again! "
      },
      dog: {
        initial: {
          text: "I was playing outside all day! Woof! ",
          choices: [{ text: "Thanks Dog! ", action: "close" }]
        },
        afterClue: {
          text: "Those aren't my prints! Woof! ",
          choices: [{ text: "Okay! ", action: "close" }]
        },
        wrongResponse: "Dog was outdoors! The evidence doesn't fit! Try again! "
      },
      mouse: {
        initial: {
          text: "Paint bottles are too big for me! Squeak! ",
          choices: [{ text: "Thanks Mouse! ", action: "close" }]
        },
        afterClue: {
          text: "I'm innocent! Squeak! ",
          choices: [{ text: "Hmm... ", action: "close" }]
        },
        wrongResponse: "Mouse is too tiny! Look again! Try again! "
      }
    }
  },

  // ========================================
  // MYSTERY 5: THE HIDDEN BIRTHDAY PRESENT
  // ========================================
  hidden_present: {
    id: 'hidden_present',
    title: "The Hidden Present Case",

    intro: {
      speaker: "Detective Dino",
      text: "Oh no! Someone hid the birthday present as a prank!  We need to find it!",
      choices: [{ text: "Let's search! ", action: "start" }]
    },

    locations: ['living_room', 'closet', 'attic', 'basement'],

    backgrounds: {
      living_room: 'living_room',
      closet: 'closet',
      attic: 'attic',
      basement: 'basement'
    },

    objects: {
      living_room: [
        {
          id: "couch",
          name: "Couch",
          emoji: "",
          position: { bottom: "3%", left: "65%" },
          dialogue: {
            text: "The couch looks normal. Is the present under the cushions?",
            choices: [{ text: "Check everywhere! ", action: "close" }]
          }
        }
      ],
      closet: [
        {
          id: "shelf",
          name: "Shelf",
          emoji: "",
          position: { bottom: "40%", left: "50%" },
          dialogue: {
            text: "The shelf is messy! Someone was searching through it!",
            choices: [{ text: "Interesting! ", action: "close" }]
          }
        }
      ],
      attic: [
        {
          id: "boxes",
          name: "Boxes",
          emoji: "",
          position: { bottom: "5%", left: "70%" },
          dialogue: {
            text: "Old boxes everywhere! Perfect hiding spots!",
            choices: [{ text: "Let's search! ", action: "close" }]
          }
        }
      ],
      basement: [
        {
          id: "storage",
          name: "Storage Shelves",
          emoji: "",
          position: { bottom: "5%", left: "23%" },
          dialogue: {
            text: "Dark and dusty storage! Could the present be here?",
            choices: [{ text: "Keep looking! ", action: "close" }]
          }
        }
      ]
    },

    suspects: {
      bunny: {
        name: "Bunny",
        emoji: "",

        clues: {
          living_room: {
            id: "bunny_fur_present",
            name: "White Fur",
            position: { bottom: "20%", left: "70%" },
            description: "White bunny fur near where the present was! ",
            hint: "Bunny was here recently!",
            image: "bunny_fur_white.png"
          },
          closet: {
            id: "carrot_in_closet",
            name: "Carrot Piece",
            position: { bottom: "15%", left: "45%" },
            description: "A carrot piece in the closet! Bunny was snacking here! ",
            hint: "Bunny's favorite snack!",
            image: "carrot_pieces.png"
          },
          attic: {
            id: "bunny_hiding_spot",
            name: "Bunny Tracks",
            position: { bottom: "18%", left: "46%" },
            description: "Bunny tracks lead to a box! ",
            hint: "Bunny went to the attic!",
            image: "carrot_prints.png"
          },
          basement: {
            id: "present_with_carrots",
            name: "Present Hidden",
            position: { bottom: "22%", left: "50%" },
            description: "The present hidden behind carrot boxes! Found it! ",
            hint: "Bunny's clever hiding spot!",
            image: "hidden_cookies.png"
          }
        },

        dialogue: {
          initial: {
            text: "Me? Hide a present? I was eating carrots! ",
            choices: [{ text: "Suspicious... ", action: "close" }]
          },
          afterClue: {
            text: "Okay! It was a prank! I was going to give it back! I promise! ",
            choices: [{ text: "Found it! ", action: "close" }]
          }
        },

        confession: "It was just a funny joke! I didn't mean to worry everyone! ",
        wrongResponse: ""
      },

      cat: {
        name: "Cat",
        emoji: "",

        clues: {
          living_room: {
            id: "cat_fur_cushion",
            name: "Orange Fur",
            position: { bottom: "20%", left: "70%" },
            description: "Orange cat fur on the couch! ",
            hint: "Cat was lounging here!",
            image: "cat_fur.png"
          },
          closet: {
            id: "knocked_items",
            name: "Knocked Items",
            position: { bottom: "15%", left: "45%" },
            description: "Cat knocked things off the shelf looking for hiding spots! ",
            hint: "Classic cat behavior!",
            image: "cat_paw_print.png"
          },
          attic: {
            id: "cat_nap_spot",
            name: "Cat Paw Prints",
            position: { bottom: "18%", left: "46%" },
            description: "Cat paw prints in the dusty attic! ",
            hint: "Cat was exploring!",
            image: "cat_paw_print.png"
          },
          basement: {
            id: "present_on_shelf",
            name: "Present on High Shelf",
            position: { bottom: "28%", left: "70%" },
            description: "The present on a high shelf! Only cat could jump that high! ",
            hint: "Cat's jumping skills!",
            image: "hidden_cookies.png"
          }
        },

        dialogue: {
          initial: {
            text: "Meow! I don't play pranks! Too lazy! ",
            choices: [{ text: "Really? ", action: "close" }]
          },
          afterClue: {
            text: "Fine! I thought it would be funny to hide it! Sorry! ",
            choices: [{ text: "Mystery solved! ", action: "close" }]
          }
        },

        confession: "Meow... I wanted to see everyone search for it! It was funny! ",
        wrongResponse: ""
      },

      dog: {
        name: "Dog",
        emoji: "",

        clues: {
          living_room: {
            id: "excited_marks",
            name: "Scratches",
            position: { bottom: "20%", left: "70%" },
            description: "Excited scratch marks! Dog was very playful! ",
            hint: "Dog was excited!",
            image: "muddy_tracks.png"
          },
          closet: {
            id: "dog_nose_prints",
            name: "Nose Prints",
            position: { bottom: "15%", left: "45%" },
            description: "Dog nose prints on the closet door! Dog was sniffing! ",
            hint: "Dog's wet nose!",
            image: "drool_puddle.png"
          },
          attic: {
            id: "dog_paws_attic",
            name: "Big Paw Prints",
            position: { bottom: "18%", left: "46%" },
            description: "Big dog paw prints in the attic! ",
            hint: "Dog climbed up here!",
            image: "muddy_tracks.png"
          },
          basement: {
            id: "present_buried",
            name: "Present Buried",
            position: { bottom: "22%", left: "50%" },
            description: "The present partially buried! Dog tried to bury it like a bone! ",
            hint: "Dog's instinct!",
            image: "buried_cookies.png"
          }
        },

        dialogue: {
          initial: {
            text: "Woof! I love presents! I wouldn't hide it! ",
            choices: [{ text: "Hmm... ", action: "close" }]
          },
          afterClue: {
            text: "Woof woof! I wanted to keep it safe like my bones! Sorry! ",
            choices: [{ text: "Case closed! ", action: "close" }]
          }
        },

        confession: "Woof! I was protecting it! I didn't mean to hide it from everyone! ",
        wrongResponse: ""
      },

      mouse: {
        name: "Mouse",
        emoji: "",

        clues: {
          living_room: {
            id: "tiny_tracks_present",
            name: "Tiny Tracks",
            position: { bottom: "20%", left: "70%" },
            description: "Tiny mouse tracks near the present's spot! ",
            hint: "Mouse was investigating!",
            image: "small_footprints.png"
          },
          closet: {
            id: "gnaw_marks",
            name: "Gnaw Marks",
            position: { bottom: "15%", left: "45%" },
            description: "Tiny gnaw marks on boxes! Mouse was searching! ",
            hint: "Mouse teeth marks!",
            image: "paw_print.png"
          },
          attic: {
            id: "mouse_trail_attic",
            name: "Mouse Trail",
            position: { bottom: "18%", left: "46%" },
            description: "A trail of tiny prints through the attic! ",
            hint: "Mouse explored everywhere!",
            image: "small_footprints.png"
          },
          basement: {
            id: "present_in_hole",
            name: "Present by Hole",
            position: { bottom: "22%", left: "50%" },
            description: "The present near a mouse hole! Mouse tried to drag it home! ",
            hint: "Too big for mouse hole!",
            image: "hidden_cookies.png"
          }
        },

        dialogue: {
          initial: {
            text: "Squeak! The present is too big for me to move! ",
            choices: [{ text: "Maybe... ", action: "close" }]
          },
          afterClue: {
            text: "Squeak squeak! I wanted to see what was inside! I moved it! Sorry! ",
            choices: [{ text: "Found the culprit! ", action: "close" }]
          }
        },

        confession: "Squeak! I was so curious! I tried to open it early! I'm sorry! ",
        wrongResponse: ""
      }
    },

    innocentDialogue: {
      bunny: {
        initial: {
          text: "I was eating carrots outside! ",
          choices: [{ text: "Thanks Bunny! ", action: "close" }]
        },
        afterClue: {
          text: "That's not my fur! I didn't do it! ",
          choices: [{ text: "Right! ", action: "close" }]
        },
        wrongResponse: "Bunny was busy with carrots! Wrong suspect! Try again! "
      },
      cat: {
        initial: {
          text: "I was napping all day! Meow! ",
          choices: [{ text: "Thanks Cat! ", action: "close" }]
        },
        afterClue: {
          text: "Not my prints! Check again! ",
          choices: [{ text: "Okay! ", action: "close" }]
        },
        wrongResponse: "Cat was sleeping! The clues don't match! Try again! "
      },
      dog: {
        initial: {
          text: "I love presents! I wouldn't hide them! Woof! ",
          choices: [{ text: "Thanks Dog! ", action: "close" }]
        },
        afterClue: {
          text: "Those aren't my paws! Woof! ",
          choices: [{ text: "Got it! ", action: "close" }]
        },
        wrongResponse: "Dog loves presents too much to hide them! Try again! "
      },
      mouse: {
        initial: {
          text: "Too heavy to move! Squeak! ",
          choices: [{ text: "Thanks Mouse! ", action: "close" }]
        },
        afterClue: {
          text: "I'm innocent! Squeak! ",
          choices: [{ text: "Hmm... ", action: "close" }]
        },
        wrongResponse: "Mouse is too small! Look elsewhere! Try again! "
      }
    }
  }
};

// Make available globally
window.mysteriesData = mysteriesData;
