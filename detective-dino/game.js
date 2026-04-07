// Detective Dino - Main Game Engine

const Game = {
  // Game state
  currentLocation: 'kitchen',
  cluesFound: [],
  visitedLocations: new Set(),
  currentDialogue: null,
  gameStarted: false,
  guiltySuspect: null, // Will be randomly selected
  currentMystery: null, // Current mystery scenario
  currentMysteryData: null, // Mystery data from mysteriesData
  readingLevel: null, // beginner, intermediate, or advanced
  recentTouchTime: 0,
  tutorialSeen: false,
  debugLayoutEnabled: false,
  tutorialStep: 0,
  tutorialSteps: [
    {
      title: 'Welcome, Detective!',
      body: 'Visit every location and look closely for clues.'
    },
    {
      title: 'Talk and Investigate',
      body: 'Tap or click each suspect and object to collect information.'
    },
    {
      title: 'Solve the Case',
      body: 'Open your notebook, review clues, and accuse the culprit when ready.'
    }
  ],
  imageFallbackCache: {},
  _dinoMoodTimer: null,

  // DOM elements
  elements: {
    titleScreen: null,
    readingLevelScreen: null,
    gameScreen: null,
    sceneContainer: null,
    background: null,
    charactersLayer: null,
    objectsLayer: null,
    dialogueBox: null,
    speakerName: null,
    dialogueText: null,
    dialogueChoices: null,
    navigation: null,
    notebookOverlay: null,
    cluesList: null,
    clueCount: null,
    accusationScreen: null,
    winScreen: null,
    tryAgainScreen: null,
    tutorialOverlay: null,
    tutorialTitle: null,
    tutorialBody: null,
    tutorialProgress: null,
    tutorialBack: null,
    tutorialNext: null,
    dinoIcon: null
  },

  // Adapt text to reading level
  adaptText(originalText) {
    if (!this.readingLevel || this.readingLevel === 'advanced') {
      return originalText;
    }

    const text = originalText;

    // ─── BEGINNER (1st grade) ────────────────────────────────────────────
    if (this.readingLevel === 'beginner') {
      const B = {
        // ── Static game strings ──────────────────────────────────────────
        'We need more clues before we can make an accusation! Keep investigating! ': 'Find more clues first! ',
        'You found all the clues! Time to solve the mystery!': 'All clues found! ',
        'Think carefully, Detective Dino!': 'Who did it?',
        'Great detective work!': 'Great job! ',
        // Choice texts
        "Let's investigate! ": "Let's look! ",
        "Let's search! ": "Let's look! ",
        'We need to find clues! ': 'Find clues! ',
        'You seem nervous... ': 'Hmm! ',
        'The truth comes out! ': 'I knew it! ',
        'Suspicious... ': 'Hmm! ',
        'Hmm... ': 'Hmm! ',
        'Hmm... suspicious! ': 'Hmm! ',
        'Hmm, suspicious... ': 'Hmm! ',
        'Mystery solved! ': 'Got you! ',
        'Case closed! ': 'All done! ',
        'Case closed! ': 'All done! ',
        'Case solved! ': 'You got them! ',
        'Found it! ': 'You found it! ',
        'Found it! ': 'You found it! ',
        'Found the culprit! ': 'You got them! ',
        'Cat was here all day! ': 'Cat was here! ',
        'Cat was here! ': 'Cat was here! ',
        'Look closer! ': 'Look! ',
        'Interesting! ': 'Hmm! ',
        "That's a clue! ": 'A clue! ',
        'Keep looking! ': 'Keep looking! ',
        'Nice castle! ': 'Nice! ',
        "We'll find it! ": "Let's look! ",
        'What a mess! ': 'What a mess! ',
        'Good clue! ': 'A clue! ',
        'Check everywhere! ': 'Look! ',
        'Add to notebook! ': 'Got it! ',
        'Make an accusation! ': 'Who did it? ',
        'Thanks Bunny! ': 'Thanks! ',
        "Thanks Cat! ": 'Thanks! ',
        'Thanks Dog! ': 'Thanks! ',
        'Thanks Mouse! ': 'Thanks! ',
        "You're right! ": 'Okay! ',
        "You're right! ": 'Okay! ',
        'Good point! ': 'OK! ',
        'Got it! ': 'Got it! ',
        'Right! ': 'Right! ',
        'Okay! ': 'OK! ',
        'Okay! ': 'OK! ',
        'Really? ': 'Really? ',
        'Are you sure? ': 'Sure? ',
        'Tell the truth! ': 'Be honest! ',
        'Maybe... ': 'Hmm! ',
        'Maybe... ': 'Hmm! ',
        "We will! ": "Let's look! ",
        "We'll find it! ": "Let's look! ",
        'Hmm... ': 'Hmm! ',
        'Start Case!': 'Start!',
        // ── MYSTERY 1: Missing Cookies — intros & objects ─────────────────
        'Oh no! Someone stole all the cookies from the cookie jar!  We need to find out who did it!': 'Cookies are gone!  Who took them?',
        'The cookie jar is empty! All the cookies are gone! ': 'No cookies! All gone! ',
        "Dog's ball is still here. Dog was playing all day!": "Dog's ball is here.",
        "Cat's favorite napping spot. There's cat fur all over it!": 'Cat naps here! ',
        'Pretty flowers, but wait... there\'s something behind them!': 'Look behind the flowers! ',
        // ── MYSTERY 1: Clue descriptions ─────────────────────────────────
        'You found white bunny fur stuck to the cookie jar! ': 'White fur on the jar! ',
        'Carrot-shaped marks leading to the garden! How ironic! ': 'Carrot marks here! ',
        'Cookie crumbs with white fur mixed in! ': 'Crumbs and white fur! ',
        "Cookies hidden next to carrots in the garden! Bunny's secret stash! ": 'Cookies by the carrots! ',
        'Orange cat fur stuck to the cookie jar! ': 'Orange fur on the jar! ',
        'Cat paw prints heading back toward the house!': 'Cat prints here! ',
        'You found cookies hidden under the couch cushion! Cat\'s hiding spot! ': 'Cookies on the couch! ',
        'Fish bones near cookie crumbs! Cat was here recently!': 'Fish bones here! ',
        'Large muddy paw prints near the cookie jar! ': 'Big muddy prints! ',
        'Cookie crumbs leading to a digging spot!': 'Cookie crumbs here! ',
        'A puddle of drool! Dog was drooling over something tasty!': 'A wet drool puddle! ',
        'Cookies buried in the garden! Dog buried them like bones! ': 'Cookies in the dirt! ',
        "You found a tiny paw print! It's much smaller than everyone else's paws!": 'A tiny paw print! ',
        'You found tiny footprints! They lead toward the park!': 'Tiny prints here! ',
        'You found cookie crumbs! They lead toward the door!': 'Cookie crumbs here! ',
        'You found the cookies hidden behind the flowers!  And they have mouse-sized bites!': 'Cookies found! Tiny bites! ',
        // ── MYSTERY 1: Guilty suspect dialogues ──────────────────────────
        "Hi Detective! I... uh... love carrots! Yes, carrots!  I definitely wasn't near the cookies!": 'I love carrots!  Not cookies!',
        "Okay, okay! I couldn't help it! They smelled like carrots somehow! I'm so sorry! ": 'I took them! I am sorry! ',
        'Meow... I was sleeping! I prefer fish anyway...  *nervously licks paw*': 'I was asleep! Meow! ',
        "Fine! I wanted to try them! Fish gets boring sometimes! I'm sorry! ": 'I tried one! Sorry! ',
        'Woof! I was just playing! With my ball! Not cookies! Woof woof!  *tail wagging nervously*': 'I was playing! Woof! ',
        "Woof... okay, you got me! I buried them for later! I love burying things! Sorry! ": 'I buried them! Sorry! ',
        'Squeak! Um... I was just... uh... looking at the flowers!  Nothing else!': 'I saw the flowers! ',
        "Okay okay! I was hungry and the cookies smelled so good! I'm sorry! ": 'I was hungry! Sorry! ',
        // ── MYSTERY 1: Confessions ────────────────────────────────────────
        "I... I couldn't resist! The cookies smelled amazing and I was so hungry! Forgive me! ": 'I was so hungry! Sorry! ',
        "Meow... okay, I confess! I was curious about cookies! They looked so tasty! ": 'I took them! Sorry! ',
        "Woof woof! I couldn't help it! They smelled SO good! I wanted to bury them for later! ": 'They smelled good! Sorry! ',
        "Squeak! I confess! I was so hungry and they smelled amazing! Please forgive me! ": 'I was hungry! Sorry! ',
        // ── MYSTERY 1: Innocent dialogues ────────────────────────────────
        "Hi Detective! I love carrots, not cookies!  I was eating carrots all day!": 'I eat carrots!  Not cookies!',
        "See? My paws don't match those prints! I'm innocent! ": 'Not my prints! ',
        "Bunny loves carrots, not cookies! And the clues don't match Bunny! Try again! ": 'Not Bunny! Try again! ',
        "Meow! I was taking a nap on the couch all day!  Cookies make me sleepy.": 'I was asleep! Meow! ',
        "I prefer fish anyway!  Those clues aren't mine!": 'Not my clues! ',
        "Cat was napping all day! And Cat prefers fish! The evidence doesn't match! Try again! ": 'Not Cat! Try again! ',
        "Woof! I was playing with my ball all day!  I don't even like cookies!": 'I played all day! Woof! ',
        "Those aren't my prints! Mine are different! Woof! ": 'Not my prints! Woof! ',
        "Dog was playing outside all day! And the clues don't point to Dog! Try again! ": 'Not Dog! Try again! ',
        'Squeak squeak! I was just enjoying the flowers!  I\'m too small for cookies!': 'I am too small! ',
        "Those prints are too big to be mine! Check again! Squeak! ": 'Not my prints! Squeak! ',
        'Mouse is innocent! The evidence points elsewhere! Look more carefully! ': 'Not Mouse! Try again! ',
        // ── MYSTERY 2: Broken Toy — intros & objects ─────────────────────
        'Oh no! Someone broke the special toy!  We need to find out who did it!': 'A toy is broken!  Who did it?',
        'The toy box is messy! Someone was looking through it!': 'The toy box is messy!',
        'The bed looks normal. Nothing suspicious here!': 'The bed looks fine.',
        'The toolbox is open! Someone might have used the tools!': 'The toolbox is open!',
        // ── MYSTERY 2: Clue descriptions ─────────────────────────────────
        'White bunny fur stuck to the broken toy! ': 'White fur on toy! ',
        'A piece of the broken toy hidden in the garden! ': 'A toy piece here! ',
        'Carrot pieces near the bed! Bunny was here eating! ': 'Carrot pieces here! ',
        'More toy pieces with white fur! Bunny tried to fix it! ': 'Fur on toy pieces! ',
        'Orange cat fur on the broken toy! ': 'Orange fur on toy! ',
        'The toy piece was batted outside! Cats love to swat things! ': 'Toy piece outside! ',
        'Cat paw prints all around! Cat was running around! ': 'Cat prints here! ',
        'Cat pushed the toy under the shelf and it broke! ': 'Toy under the shelf! ',
        'Dog drool all over the broken toy! ': 'Drool on the toy! ',
        'Dog buried part of the toy like a bone! ': 'Toy piece buried! ',
        'Big muddy paw prints on the bed! Dog was here! ': 'Big prints on bed! ',
        'Toy piece with bite marks! Dog was chewing it! ': 'Bite marks here! ',
        'Tiny teeth marks on the toy! Mouse was nibbling! ': 'Tiny bite marks! ',
        'A tiny piece of toy! Mouse carried it here! ': 'A toy piece here! ',
        'Tiny mouse footprints everywhere! ': 'Tiny prints here! ',
        'Toy pieces near mouse hole! Mouse tried to take them home! ': 'Toy by mouse hole! ',
        // ── MYSTERY 2: Guilty dialogues ───────────────────────────────────
        'Hi! I... uh... was just playing carefully! Very carefully! ': 'I played nice! ',
        "Okay! I played too rough and it broke! I tried to fix it! I'm sorry! ": 'I broke it! Sorry! ',
        "Meow... I was just napping! I didn't touch any toys! ": 'I was asleep! ',
        "Fine! I was batting it around and it broke! I didn't mean to! ": 'I broke it! Sorry! ',
        'Woof! I was just playing fetch outside! Not with toys! ': 'I played outside! Woof! ',
        "Woof woof! Okay, I thought it was a chew toy! I'm sorry! ": 'I chewed it! Sorry! ',
        "Squeak! I was just looking! I didn't break anything! ": 'I just looked! ',
        'Squeak squeak! I wanted to use the pieces for my nest! Sorry! ': 'I took pieces! Sorry! ',
        // ── MYSTERY 2: Confessions ────────────────────────────────────────
        "I didn't mean to break it! I was just so excited to play! Please forgive me! ": 'I broke it! Sorry! ',
        "Meow... I'm sorry! It looked fun to play with! I got carried away! ": 'It was fun! Sorry! ',
        "Woof! I thought it was for me to chew! I didn't know it was special! ": 'I chewed it! Sorry! ',
        "Squeak! The toy pieces looked perfect for my home! I'm sorry I broke it! ": 'I broke it! Sorry! ',
        // ── MYSTERY 2: Innocent dialogues ────────────────────────────────
        'I was eating carrots in the garden all day! ': 'I ate carrots! ',
        "Those clues aren't mine! I'm innocent! ": 'Not my clues! ',
        "Bunny wasn't near the toy! The evidence points elsewhere! Try again! ": 'Not Bunny! Try again! ',
        "I was sleeping on the couch! I don't play with toys! ": 'I was asleep! ',
        "That's not my fur! Check again! ": 'Not my fur! ',
        "Cat was napping! The clues don't match! Try again! ": 'Not Cat! Try again! ',
        'I only play with my ball! Woof! ': 'I play ball! Woof! ',
        "Those aren't my paw prints! Woof! ": 'Not my prints! Woof! ',
        "Dog was playing outside! The evidence doesn't fit! Try again! ": 'Not Dog! Try again! ',
        "I'm too small to break toys! Squeak! ": 'I am too small! ',
        "That's not my evidence! Squeak! ": 'Not me! Squeak! ',
        'Mouse is innocent! Look at the clues again! Try again! ': 'Not Mouse! Try again! ',
        // ── MYSTERY 3: Missing Ball — intros & objects ────────────────────
        "Oh no! Dog's favorite ball is missing!  We need to find it!": 'The ball is gone!  Find it!',
        "Dog's house is empty! The ball isn't here!": 'Not here! Keep looking!',
        'A beautiful sandcastle! But no ball here!': 'No ball here! ',
        "The goal post is here, but where's the ball?": 'No ball here! ',
        // ── MYSTERY 3: Clue descriptions ─────────────────────────────────
        'Bunny tracks near where the ball was! ': 'Bunny tracks here! ',
        'White bunny fur in the grass! ': 'White fur here! ',
        'The ball buried next to carrots! Bunny hid it! ': 'Ball by the carrots! ',
        'Bunny was digging here! Looking for a place to hide the ball! ': 'Digging marks here! ',
        "Cat paw prints near the ball's spot! ": 'Cat prints here! ',
        'The ball is stuck in a tree! Cat must have batted it up there! ': 'Ball in the tree! ',
        'Cat paw prints in the sand! Cat was here! ': 'Cat prints in sand! ',
        'Orange cat fur on the grass! ': 'Orange fur here! ',
        'Dog was digging here! Fresh dirt everywhere! ': 'Fresh digging here! ',
        "Dog drool trail! Dog was carrying the ball! ": 'A drool trail! ',
        'The ball buried in the sand! Dog hid it here! ': 'Ball in the sand! ',
        'Muddy paw prints where the ball was! ': 'Muddy prints here! ',
        'Tiny mouse tracks near the ball! ': 'Tiny tracks here! ',
        'Tiny push marks! Mouse was rolling the ball! ': 'Push marks here! ',
        'The ball in a mouse hole! Mouse tried to take it home! ': 'Ball in a hole! ',
        'A trail showing where mouse rolled the ball! ': 'A trail here! ',
        // ── MYSTERY 3: Guilty dialogues ───────────────────────────────────
        "I don't like balls! I prefer carrots! ": 'I like carrots! ',
        "Okay! I wanted to play with it too! I hid it! Sorry! ": 'I hid it! Sorry! ',
        "Meow! I don't play with dog toys! Too energetic! ": 'Not my toy! Meow! ',
        "Fine! I was batting it around and it got stuck! Sorry! ": 'I lost it! Sorry! ',
        "Woof! My ball is missing! Help me find it! ": 'My ball is gone! Woof! ',
        "Woof woof! Oh! I buried it to save it for later! I forgot! ": 'I buried it! I forgot! ',
        "Squeak! I can't even lift a ball! Too small! ": 'Too heavy! Squeak! ',
        "Squeak! Okay, I rolled it away! It looked fun! Sorry! ": 'I rolled it! Sorry! ',
        // ── MYSTERY 3: Confessions ────────────────────────────────────────
        "I just wanted to play with the ball! I didn't mean to hide it for so long! ": 'I wanted to play! Sorry! ',
        "Meow... it was fun to bat around! I didn't mean to lose it! ": 'It was fun! Sorry! ',
        'Woof! I buried it for safekeeping and forgot where! Silly me! ': 'I buried it! Oops! ',
        "Squeak! I wanted a big ball for my home! I didn't think Dog would miss it! ": 'I wanted it! Sorry! ',
        // ── MYSTERY 3: Innocent dialogues ────────────────────────────────
        'I was eating carrots all day! ': 'I ate carrots! ',
        "I don't even like balls! Innocent! ": 'Not me! ',
        'Bunny prefers carrots to balls! Wrong suspect! Try again! ': 'Not Bunny! Try again! ',
        'I was napping! Meow! ': 'I was asleep! ',
        'Not my prints! Check again! ': 'Not my prints! ',
        "Cat was sleeping! The evidence doesn't match! Try again! ": 'Not Cat! Try again! ',
        "I love my ball! I wouldn't hide it! Woof! ": 'I love my ball! Woof! ',
        "Wait, those could be my prints... but I didn't hide it! Woof! ": 'Not me! Woof! ',
        "Dog is the victim here! Not the culprit! Try again! ": 'Not Dog! Try again! ',
        'Too heavy for me! Squeak! ': 'Too heavy! Squeak! ',
        "I'm innocent! Squeak! ": 'Not me! Squeak! ',
        'Mouse is too small! The evidence points elsewhere! Try again! ': 'Not Mouse! Try again! ',
        // ── MYSTERY 4: Paint Mess — intros & objects ─────────────────────
        'Oh no! Someone made a paint mess in the art room!  We need to find the culprit!': 'Paint is everywhere!  Who did it?',
        'The easel is knocked over! Paint is everywhere!': 'Paint everywhere! ',
        'The sink has paint in it! Someone tried to wash up!': 'Paint in the sink!',
        'The kitchen table is clean! No paint here!': 'No paint here! ',
        // ── MYSTERY 4: Clue descriptions ─────────────────────────────────
        'White bunny fur stuck in the wet paint! ': 'White fur in paint! ',
        'Bunny-sized paw prints in paint! ': 'Paw prints in paint! ',
        'White fur near the sink! Bunny was washing up! ': 'White fur by sink! ',
        'A carrot with paint on it! Bunny was eating while painting! ': 'Paint on a carrot! ',
        'Orange cat fur in the spilled paint! ': 'Orange fur in paint! ',
        'Cat paw prints in paint going down the hall! ': 'Paint prints here! ',
        'The sink water is orange from cat fur and paint! ': 'Orange water in sink! ',
        "Paint paw prints lead to cat's food bowl! ": 'Paint prints here! ',
        'Tail wag marks in the paint! Dog was excited! ': 'Tail marks in paint! ',
        'Big muddy paw prints with paint! Dog tracked it everywhere! ': 'Big prints in paint! ',
        'Paint all over the tub! Dog tried to wash off! ': 'Paint in the tub! ',
        "Dog's water bowl has paint in it! Dog rinsed paws here! ": 'Paint in dog bowl! ',
        'Tiny mouse tracks in the paint! ': 'Tiny tracks in paint! ',
        'Tiny paint paw prints down the hall! Mouse ran away! ': 'Tiny prints in hall! ',
        'Tiny mouse prints near the sink! Mouse tried to wash! ': 'Tiny prints by sink! ',
        'Paint marks near mouse hole! Mouse brought paint home! ': 'Paint by mouse hole! ',
        // ── MYSTERY 4: Guilty dialogues ───────────────────────────────────
        "I... uh... I was just eating carrots! Not painting! ": 'I ate carrots! ',
        "Okay! I wanted to paint and I bumped the easel! I'm sorry! ": 'I bumped it! Sorry! ',
        "Meow! I was sleeping! I don't like paint! ": 'I was asleep! ',
        'Fine! I jumped on the table and knocked the paint over! Sorry! ': 'I knocked it! Sorry! ',
        'Woof! I was playing outside! Not painting! ': 'I was outside! Woof! ',
        'Woof woof! I ran in excited and my tail knocked over the paint! Sorry! ': 'My tail did it! Sorry! ',
        "Squeak! I'm too small to make a big mess! ": 'I am so small! ',
        'Squeak squeak! I wanted to use the paint for decorating! I spilled it! ': 'I spilled it! Sorry! ',
        // ── MYSTERY 4: Confessions ────────────────────────────────────────
        "I wanted to make art too! But I'm clumsy and knocked everything over! ": 'I knocked it! Sorry! ',
        'Meow... I was curious about the shiny paint bottles! I knocked them over! ': 'I knocked them! Sorry! ',
        'Woof! I was too excited! My tail wagged too hard and knocked everything! ': 'My tail did it! Sorry! ',
        "Squeak! I wanted pretty colors for my home! I didn't mean to spill so much! ": 'I spilled it! Sorry! ',
        // ── MYSTERY 4: Innocent dialogues ────────────────────────────────
        'I was munching carrots in the garden! ': 'I ate carrots! ',
        "That's not my fur! I'm innocent! ": 'Not my fur! ',
        "Bunny was outside! The clues don't match! Try again! ": 'Not Bunny! Try again! ',
        "I don't like getting messy! Meow! ": 'I stay clean! ',
        "I stay clean! Not my prints! ": 'Not my prints! ',
        'Cat avoids messes! Wrong suspect! Try again! ': 'Not Cat! Try again! ',
        'I was playing outside all day! Woof! ': 'I played outside! Woof! ',
        "Those aren't my prints! Woof! ": 'Not my prints! Woof! ',
        "Dog was outdoors! The evidence doesn't fit! Try again! ": 'Not Dog! Try again! ',
        'Paint bottles are too big for me! Squeak! ': 'Too big! Squeak! ',
        "I'm innocent! Squeak! ": 'Not me! Squeak! ',
        'Mouse is too tiny! Look again! Try again! ': 'Not Mouse! Try again! ',
        // ── MYSTERY 5: Hidden Present — intros & objects ─────────────────
        'Oh no! Someone hid the birthday present as a prank!  We need to find it!': 'The present is lost!  Find it!',
        'The couch looks normal. Is the present under the cushions?': 'Look under the couch! ',
        'The shelf is messy! Someone was searching through it!': 'The shelf is messy!',
        'Old boxes everywhere! Perfect hiding spots!': 'Many big boxes here!',
        'Dark and dusty storage! Could the present be here?': 'Look in here! ',
        // ── MYSTERY 5: Clue descriptions ─────────────────────────────────
        "White bunny fur near where the present was! ": 'White fur here! ',
        'A carrot piece in the closet! Bunny was snacking here! ': 'Carrot in closet! ',
        'Bunny tracks lead to a box! ': 'Bunny tracks here! ',
        'The present hidden behind carrot boxes! Found it! ': 'Present found! ',
        'Orange cat fur on the couch! ': 'Orange fur here! ',
        'Cat knocked things off the shelf looking for hiding spots! ': 'Things fell here! ',
        'Cat paw prints in the dusty attic! ': 'Cat prints here! ',
        'The present on a high shelf! Only cat could jump that high! ': 'Present up high! ',
        'Excited scratch marks! Dog was very playful! ': 'Scratch marks here! ',
        'Dog nose prints on the closet door! Dog was sniffing! ': 'Dog nose prints! ',
        'Big dog paw prints in the attic! ': 'Big prints here! ',
        'The present partially buried! Dog tried to bury it like a bone! ': 'Present buried here! ',
        "Tiny mouse tracks near the present's spot! ": 'Tiny tracks here! ',
        'Tiny gnaw marks on boxes! Mouse was searching! ': 'Tiny bite marks! ',
        'A trail of tiny prints through the attic! ': 'Tiny trail here! ',
        'The present near a mouse hole! Mouse tried to drag it home! ': 'Present by hole! ',
        // ── MYSTERY 5: Guilty dialogues ───────────────────────────────────
        'Me? Hide a present? I was eating carrots! ': 'Not me! Carrots! ',
        "Okay! It was a prank! I was going to give it back! I promise! ": 'It was a joke! Sorry! ',
        "Meow! I don't play pranks! Too lazy! ": 'I was lazy! Meow! ',
        'Fine! I thought it would be funny to hide it! Sorry! ': 'I hid it! Sorry! ',
        "Woof! I love presents! I wouldn't hide it! ": 'I love gifts! Woof! ',
        "Woof woof! I wanted to keep it safe like my bones! Sorry! ": 'I kept it safe! Sorry! ',
        "Squeak! The present is too big for me to move! ": 'Too big! Squeak! ',
        'Squeak squeak! I wanted to see what was inside! I moved it! Sorry! ': 'I was curious! Sorry! ',
        // ── MYSTERY 5: Confessions ────────────────────────────────────────
        "It was just a funny joke! I didn't mean to worry everyone! ": 'It was a joke! Sorry! ',
        "Meow... I wanted to see everyone search for it! It was funny! ": 'I thought it funny! ',
        "Woof! I was protecting it! I didn't mean to hide it from everyone! ": 'I kept it safe! Sorry! ',
        "Squeak! I was so curious! I tried to open it early! I'm sorry! ": 'I was curious! Sorry! ',
        // ── MYSTERY 5: Innocent dialogues ────────────────────────────────
        'I was eating carrots outside! ': 'I ate carrots! ',
        "That's not my fur! I didn't do it! ": 'Not me! ',
        'Bunny was busy with carrots! Wrong suspect! Try again! ': 'Not Bunny! Try again! ',
        'I was napping all day! Meow! ': 'I was asleep! ',
        "Cat was sleeping! The clues don't match! Try again! ": 'Not Cat! Try again! ',
        "I love presents! I wouldn't hide them! Woof! ": 'I love gifts! Woof! ',
        "Those aren't my paws! Woof! ": 'Not my prints! Woof! ',
        "Dog loves presents too much to hide them! Try again! ": 'Not Dog! Try again! ',
        'Too heavy to move! Squeak! ': 'Too heavy! Squeak! ',
        'Mouse is too small! Look elsewhere! Try again! ': 'Not Mouse! Try again! ',
      };

      if (B[text] !== undefined) return B[text];

      // Generic fallback: strip stage directions, take first sentence, cap at 6 words
      let simplified = text.replace(/\*[^*]+\*/g, '').trim();
      const sentenceEnd = simplified.search(/[.!?]/);
      if (sentenceEnd !== -1) simplified = simplified.slice(0, sentenceEnd + 1);
      const words = simplified.split(/\s+/);
      if (words.length > 6) simplified = words.slice(0, 5).join(' ') + '!';
      return simplified || text;
    }

    // ─── INTERMEDIATE (3rd grade) ────────────────────────────────────────
    if (this.readingLevel === 'intermediate') {
      const I = {
        'Oh no! Someone stole all the cookies from the cookie jar!  We need to find out who did it!': 'Someone took all the cookies! We must find out who did it!',
        'Oh no! Someone broke the special toy!  We need to find out who did it!': 'Someone broke the toy! We need to find out who did it!',
        "Oh no! Dog's favorite ball is missing!  We need to find it!": "Dog's favorite ball is missing! Let's find it!",
        'Oh no! Someone made a paint mess in the art room!  We need to find the culprit!': 'Someone made a big paint mess! We need to find who did it!',
        'Oh no! Someone hid the birthday present as a prank!  We need to find it!': 'Someone hid the birthday present! We need to find it!',
        'We need more clues before we can make an accusation! Keep investigating! ': 'We need more clues before we accuse anyone! Keep looking!',
        "Woof! I was just playing! With my ball! Not cookies! Woof woof!  *tail wagging nervously*": "Woof! I was just playing with my ball! Not cookies! Woof!",
        "You found a tiny paw print! It's much smaller than everyone else's paws!": "You found a tiny paw print! It's smaller than anyone else's!",
        "You found the cookies hidden behind the flowers!  And they have mouse-sized bites!": "You found cookies hidden behind the flowers!  They have tiny bites!",
        "I... I couldn't resist! The cookies smelled amazing and I was so hungry! Forgive me! ": "I couldn't resist! The cookies smelled so good! I'm sorry! ",
        "Woof woof! I couldn't help it! They smelled SO good! I wanted to bury them for later! ": "Woof! I couldn't help it! They smelled so good! I'm sorry! ",
      };
      if (I[text] !== undefined) return I[text];
      return text;
    }

    return text;
  },

  // Initialize game
  init() {
    // Cache DOM elements
    this.elements.titleScreen = document.getElementById('title-screen');
    this.elements.readingLevelScreen = document.getElementById('reading-level-screen');
    this.elements.gameScreen = document.getElementById('game-screen');
    this.elements.sceneContainer = document.getElementById('scene-container');
    this.elements.background = document.getElementById('background');
    this.elements.charactersLayer = document.getElementById('characters-layer');
    this.elements.objectsLayer = document.getElementById('objects-layer');
    this.elements.dialogueBox = document.getElementById('dialogue-box');
    this.elements.speakerName = document.getElementById('speaker-name');
    this.elements.dialogueText = document.getElementById('dialogue-text');
    this.elements.dialogueChoices = document.getElementById('dialogue-choices');
    this.elements.navigation = document.getElementById('navigation');
    this.elements.notebookOverlay = document.getElementById('notebook-overlay');
    this.elements.cluesList = document.getElementById('clues-list');
    this.elements.clueCount = document.getElementById('clue-count');
    this.elements.accusationScreen = document.getElementById('accusation-screen');
    this.elements.winScreen = document.getElementById('win-screen');
    this.elements.tryAgainScreen = document.getElementById('try-again-screen');
    this.elements.tutorialOverlay = document.getElementById('tutorial-overlay');
    this.elements.tutorialTitle = document.getElementById('tutorial-title');
    this.elements.tutorialBody = document.getElementById('tutorial-body');
    this.elements.tutorialProgress = document.getElementById('tutorial-progress');
    this.elements.tutorialBack = document.getElementById('tutorial-back');
    this.elements.tutorialNext = document.getElementById('tutorial-next');
    this.elements.dinoIcon = document.getElementById('dino-nav-icon');

    this.initKeyboardAccessibility();
    this.loadTutorialPreference();
    this.initLayoutDebugToggle();

    // Mobile optimizations
    this.initMobileOptimizations();

  },

  // Select random mystery and culprit
  selectRandomMystery() {
    // Pick random mystery from mysteriesData
    const mysteryKeys = Object.keys(mysteriesData);
    this.currentMystery = mysteryKeys[Math.floor(Math.random() * mysteryKeys.length)];
    this.currentMysteryData = mysteriesData[this.currentMystery];

    // Pick random culprit for this mystery
    const suspectKeys = Object.keys(this.currentMysteryData.suspects);
    this.guiltySuspect = suspectKeys[Math.floor(Math.random() * suspectKeys.length)];

    // Set initial location to first location of this mystery
    this.currentLocation = this.currentMysteryData.locations[0];
  },

  // Initialize mobile optimizations
  initMobileOptimizations() {
    // Set --vh immediately so the first paint uses the real viewport height
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Prevent pinch zoom
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    // Handle orientation changes — re-render after the browser has settled
    const onOrientationChange = () => {
      setTimeout(() => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        if (this.gameStarted) {
          this.renderLocation();
        }
      }, 150);
    };
    window.addEventListener('orientationchange', onOrientationChange);
    // 'resize' fires on desktop and on Android where orientationchange is late
    window.addEventListener('resize', () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      if (this.gameStarted) {
        this.renderLocation();
      }
    });
  },

  initLayoutDebugToggle() {
    const params = new URLSearchParams(window.location.search);
    this.debugLayoutEnabled = params.get('debugLayout') === '1';
    this.applyDebugLayoutClass();

    document.addEventListener('keydown', (e) => {
      if (e.key && e.key.toLowerCase() === 'd') {
        this.debugLayoutEnabled = !this.debugLayoutEnabled;
        this.applyDebugLayoutClass();
      }
    });
  },

  applyDebugLayoutClass() {
    document.body.classList.toggle('debug-layout', this.debugLayoutEnabled);
  },

  initKeyboardAccessibility() {
    const clickableCards = document.querySelectorAll('.level-card');
    clickableCards.forEach((card) => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  },

  loadTutorialPreference() {
    try {
      this.tutorialSeen = localStorage.getItem('detective_dino_tutorial_seen') === 'true';
    } catch (err) {
      this.tutorialSeen = false;
    }
  },

  saveTutorialPreference() {
    try {
      localStorage.setItem('detective_dino_tutorial_seen', 'true');
    } catch (err) {
      // Ignore storage errors in restricted browser environments.
    }
  },

  // Start game
  start() {
    // Ensure mystery data exists even if start is called directly.
    if (!this.currentMysteryData) {
      this.selectRandomMystery();
    }

    if (!this.readingLevel) {
      this.readingLevel = 'advanced';
    }

    this.gameStarted = true;

    // Hide title and reading level screen, show game
    this.elements.titleScreen.classList.remove('active');
    this.elements.readingLevelScreen.classList.remove('active');
    this.elements.gameScreen.classList.add('active');

    // Render navigation buttons for this mystery
    this.visitedLocations = new Set([this.currentLocation]);
    this.renderNavigation();

    // Update top bar and browser tab with mystery title
    const titleEl = document.getElementById('mystery-title');
    if (titleEl) titleEl.textContent = this.currentMysteryData.title;
    document.title = `${this.currentMysteryData.title} — Detective Dino`;

    // Update static screen text to match reading level
    this._applyReadingLevelStaticText();
    this._updateLevelBtn();

    // Render the current location after mystery selection.
    this.renderLocation();
    this.updateClueCount();

    // Start background music
    AudioManager.playMusic();

    // Show intro dialogue from current mystery
    const intro = this.currentMysteryData.intro;
    this.showDialogue(intro.speaker, intro.text, intro.choices);

    if (!this.tutorialSeen) {
      this.showTutorial();
    }
  },

  // Apply reading-level-appropriate text to static UI elements
  _applyReadingLevelStaticText() {
    const isBeginner = this.readingLevel === 'beginner';
    const isIntermediate = this.readingLevel === 'intermediate';

    // Win screen static heading
    const winHeading = this.elements.winScreen.querySelector('p.big-text');
    if (winHeading) {
      winHeading.textContent = isBeginner ? 'Great job! ' : 'Great detective work!';
    }

    // Try-again screen headings
    const tryH1 = this.elements.tryAgainScreen.querySelector('h1');
    if (tryH1) {
      tryH1.textContent = isBeginner ? 'Oops! Try again! ' : 'Not Quite Right... ';
    }
    const tryBigText = this.elements.tryAgainScreen.querySelector('p.big-text');
    if (tryBigText) {
      tryBigText.textContent = isBeginner ? 'Keep looking! ' : 'Keep investigating, Detective!';
    }
    const tryHint = this.elements.tryAgainScreen.querySelector('p:not(.big-text)');
    if (tryHint) {
      tryHint.textContent = isBeginner ? 'Find more clues!' : 'Look for more clues in each location.';
    }
  },

  // Render navigation buttons based on current mystery locations
  renderNavigation() {
    const nav = this.elements.navigation;
    nav.innerHTML = ''; // Clear existing buttons

    // Location name mapping (can expand this)
    const locationNames = {
      kitchen: { name: ' Kitchen', emoji: '' },
      backyard: { name: ' Backyard', emoji: '' },
      living_room: { name: ' Living Room', emoji: '' },
      park: { name: ' Park', emoji: '' },
      playroom: { name: ' Playroom', emoji: '' },
      garden: { name: ' Garden', emoji: '' },
      bedroom: { name: ' Bedroom', emoji: '' },
      garage: { name: ' Garage', emoji: '' },
      beach: { name: ' Beach', emoji: '' },
      sports_field: { name: ' Sports Field', emoji: '' },
      art_room: { name: ' Art Room', emoji: '' },
      hallway: { name: ' Hallway', emoji: '' },
      bathroom: { name: ' Bathroom', emoji: '' },
      closet: { name: ' Closet', emoji: '' },
      attic: { name: ' Attic', emoji: '' },
      basement: { name: ' Basement', emoji: '' }
    };

    // Create button for each location in this mystery
    this.currentMysteryData.locations.forEach(locationId => {
      const locationInfo = locationNames[locationId] || { name: locationId, emoji: '' };
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.textContent = locationInfo.name;
      btn.dataset.locationId = locationId;
      btn.onclick = () => changeLocation(locationId);
      nav.appendChild(btn);
    });

    // Add accusation button
    const accuseBtn = document.createElement('button');
    accuseBtn.className = 'nav-btn accuse-btn';
    accuseBtn.textContent = ' Make Accusation!';
    accuseBtn.onclick = () => showAccusationScreen();
    nav.appendChild(accuseBtn);

    this.updateNavigationState();
  },

  updateNavigationState() {
    const culpritClues = this.currentMysteryData
      ? this.currentMysteryData.suspects[this.guiltySuspect]?.clues || {}
      : {};
    const cluesPerLocation = Object.fromEntries(
      Object.entries(culpritClues).map(([loc, clue]) => [loc, clue.id])
    );

    const locationButtons = this.elements.navigation.querySelectorAll('.nav-btn[data-location-id]');
    locationButtons.forEach((btn) => {
      const locId = btn.dataset.locationId;
      const isCurrent = locId === this.currentLocation;
      const wasVisited = this.visitedLocations.has(locId);
      const clueFound = cluesPerLocation[locId] && this.cluesFound.includes(cluesPerLocation[locId]);

      btn.classList.toggle('active-location', isCurrent);
      btn.setAttribute('aria-current', isCurrent ? 'true' : 'false');

      // Badge: clue-found star takes priority over visited check
      btn.classList.toggle('nav-clue-found', clueFound);
      btn.classList.toggle('nav-visited', wasVisited && !clueFound);
    });

    // Pulse the accuse button once all clues are found
    const totalClues = this.currentMysteryData ? this.currentMysteryData.locations.length : 4;
    const accuseBtn = this.elements.navigation.querySelector('.accuse-btn');
    if (accuseBtn) {
      accuseBtn.classList.toggle('pulse', this.cluesFound.length >= totalClues);
    }
  },

  showTutorial() {
    this.tutorialStep = 0;
    this.updateTutorialStep();
    this.elements.tutorialOverlay.classList.remove('hidden');
  },

  hideTutorial(markSeen = true) {
    this.elements.tutorialOverlay.classList.add('hidden');
    if (markSeen) {
      this.tutorialSeen = true;
      this.saveTutorialPreference();
    }
  },

  updateTutorialStep() {
    const stepData = this.tutorialSteps[this.tutorialStep];
    this.elements.tutorialTitle.textContent = stepData.title;
    this.elements.tutorialBody.textContent = stepData.body;
    this.elements.tutorialProgress.textContent = `Step ${this.tutorialStep + 1} of ${this.tutorialSteps.length}`;
    this.elements.tutorialBack.disabled = this.tutorialStep === 0;
    this.elements.tutorialNext.textContent = this.tutorialStep === this.tutorialSteps.length - 1 ? 'Start Case!' : 'Next';
  },

  nextTutorialStep() {
    if (this.tutorialStep >= this.tutorialSteps.length - 1) {
      this.hideTutorial(true);
      return;
    }

    this.tutorialStep += 1;
    this.updateTutorialStep();
  },

  previousTutorialStep() {
    if (this.tutorialStep === 0) {
      return;
    }

    this.tutorialStep -= 1;
    this.updateTutorialStep();
  },

  skipTutorial() {
    this.hideTutorial(true);
  },

  setDinoMood(mood) {
    if (!this.elements.dinoIcon) return;
    const moodFiles = {
      default: 'detective_dino.png',
      thinking: 'detective_dino_thinking.png',
      excited: 'detective_dino_excited.png',
      celebrating: 'detective_dino_celebrating.png'
    };
    this.elements.dinoIcon.src = `images/characters/${moodFiles[mood] || moodFiles.default}`;
  },

  bindTapInteraction(element, handler) {
    const wrappedHandler = (e) => {
      e.preventDefault();
      handler(e);
    };

    element.addEventListener('touchend', (e) => {
      this.recentTouchTime = Date.now();
      wrappedHandler(e);
    }, { passive: false });

    element.addEventListener('click', (e) => {
      if (Date.now() - this.recentTouchTime < 500) {
        return;
      }
      wrappedHandler(e);
    });
  },

  // Change location
  changeLocation(locationId) {
    AudioManager.playClick();
    this.currentLocation = locationId;
    this.visitedLocations.add(locationId);
    this.renderLocation();
    this.updateNavigationState();
    this.hideDialogue();
  },

  // Render current location
  renderLocation() {
    // Clear layers
    this.elements.charactersLayer.innerHTML = '';
    this.elements.objectsLayer.innerHTML = '';

    // Set background from mystery data
    // Set background image with runtime fallback in case an asset is missing.
    const background = this.currentMysteryData.backgrounds[this.currentLocation];
    this.setBackground(background);

    // Render all suspects as characters (they appear in all locations for now)
    const suspects = Object.keys(this.currentMysteryData.suspects);
    suspects.forEach((suspectId, index) => {
      const suspect = this.currentMysteryData.suspects[suspectId];
      const charData = {
        id: suspectId,
        name: suspect.name,
        emoji: suspect.emoji,
        position: this.getCharacterPosition(index, suspects.length)
      };
      this.renderCharacter(charData);
    });

    // Render objects for this location (if any)
    const objects = this.currentMysteryData.objects[this.currentLocation] || [];
    objects.forEach(obj => {
      this.renderObject(obj);
    });

    // Render clue for this location (based on guilty suspect)
    const culpritClues = this.currentMysteryData.suspects[this.guiltySuspect].clues;
    const clueForLocation = culpritClues[this.currentLocation];

    if (clueForLocation && !this.cluesFound.includes(clueForLocation.id)) {
      this.renderClue(clueForLocation);
    }
  },

  // Get character position based on index (spread them out)
  getCharacterPosition(index, total) {
    const isCompactMobile = this.isSmallPhoneViewport();
    const minLeft = isCompactMobile ? 2 : (this.isMobileViewport() ? 6 : 12);
    const maxLeft = isCompactMobile ? 74 : (this.isMobileViewport() ? 76 : 78);
    const bottom = this.isMobileViewport() ? '2%' : '3%';

    if (total <= 1) {
      return { bottom, left: `${Math.round((minLeft + maxLeft) / 2)}%` };
    }

    const step = (maxLeft - minLeft) / (total - 1);
    const left = minLeft + (step * index);
    return { bottom, left: `${Math.round(left)}%` };
  },

  setBackground(backgroundId) {
    const backgroundEl = this.elements.background;
    const imagePath = `images/backgrounds/${backgroundId}.png`;

    backgroundEl.className = '';
    backgroundEl.style.backgroundImage = `url('${imagePath}')`;
    backgroundEl.style.backgroundRepeat = 'no-repeat';
    backgroundEl.style.backgroundPosition = 'center 62%';
    backgroundEl.style.backgroundSize = 'cover';
    backgroundEl.style.backgroundColor = '#b9e6ff';

    if (this.imageFallbackCache[imagePath] === false) {
      backgroundEl.style.backgroundImage = 'none';
      return;
    }

    const probe = new Image();
    probe.onload = () => {
      this.imageFallbackCache[imagePath] = true;
    };
    probe.onerror = () => {
      this.imageFallbackCache[imagePath] = false;
      if (this.currentMysteryData && this.currentMysteryData.backgrounds[this.currentLocation] === backgroundId) {
        backgroundEl.style.backgroundImage = 'none';
      }
    };
    probe.src = imagePath;
  },

  isMobileViewport() {
    return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  },

  isSmallPhoneViewport() {
    return window.matchMedia('(max-width: 480px)').matches;
  },

  // Render character
  renderCharacter(char) {
    const charEl = document.createElement('div');
    charEl.className = `character ${char.id}`;
    charEl.style.bottom = char.position.bottom;
    charEl.style.left = char.position.left;
    charEl.title = char.name;
    charEl.tabIndex = 0;
    charEl.setAttribute('role', 'button');
    charEl.setAttribute('aria-label', `Talk to ${char.name}`);
    charEl.dataset.debugLabel = `character: ${char.name}`;

    // Use actual character image instead of emoji
    const mood = this.getSuspectMood(char.id);
    const img = document.createElement('img');
    img.src = `images/characters/${char.id}_${mood}.png`;
    img.onerror = () => {
      img.onerror = null;
      img.src = `images/characters/${char.id}_happy.png`;
    };
    img.alt = char.name;
    img.className = char.id;
    charEl.appendChild(img);

    const handleInteraction = () => {
      AudioManager.playClick();
      this.interactWithCharacter(char);
    };

    this.bindTapInteraction(charEl, handleInteraction);

    this.elements.charactersLayer.appendChild(charEl);
  },

  // Render object
  renderObject(obj) {
    const objEl = document.createElement('div');
    objEl.className = 'object';
    objEl.style.bottom = obj.position.bottom;
    objEl.style.left = obj.position.left;
    objEl.title = obj.name;
    objEl.tabIndex = 0;
    objEl.setAttribute('role', 'button');
    objEl.setAttribute('aria-label', `Inspect ${obj.name}`);
    objEl.dataset.debugLabel = `object: ${obj.name}`;

    // Object image mapping
    const objectImages = {
      'cookie_jar': 'cookie_jar_empty.png',
      'ball': 'ball.png',
      'couch': 'couch.png',
      'flowers': 'flowers_image.png',
      'toy_box': 'toy_box.png',
      'bed': 'bed.png',
      'toolbox': 'toolbox.png',
      'doghouse': 'doghouse.png',
      'sandcastle': 'sandcastle.png',
      'easel': 'easel.png',
      'sink': 'sink.png',
      'table': 'table_kitchen.png',
      'boxes': 'storage_boxes.png',
      'storage': 'storage_boxes.png',
      'shelf': 'bookshelf.png',
      'goal': 'basketball_hoop.png',
    };

    // Use actual image if available, otherwise use emoji
    if (objectImages[obj.id]) {
      const img = document.createElement('img');
      img.src = `images/objects/${objectImages[obj.id]}`;
      img.alt = obj.name;
      img.onerror = () => {
        img.onerror = null;
        img.remove();
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = obj.emoji;
        emojiSpan.style.fontSize = '3rem';
        objEl.appendChild(emojiSpan);
      };
      objEl.appendChild(img);
    } else {
      // Use emoji for objects without images
      const emojiSpan = document.createElement('span');
      emojiSpan.textContent = obj.emoji;
      emojiSpan.style.fontSize = '3rem';
      objEl.appendChild(emojiSpan);
    }

    const handleInteraction = () => {
      AudioManager.playClick();
      this.interactWithObject(obj);
    };

    this.bindTapInteraction(objEl, handleInteraction);

    this.elements.objectsLayer.appendChild(objEl);
  },

  // Render clue (with sparkle animation)
  renderClue(clue) {
    const clueEl = document.createElement('div');
    clueEl.className = 'object clue sparkle';
    clueEl.style.bottom = clue.position.bottom;
    clueEl.style.left = clue.position.left;
    clueEl.title = clue.name;
    clueEl.tabIndex = 0;
    clueEl.setAttribute('role', 'button');
    clueEl.setAttribute('aria-label', `Collect clue: ${clue.name}`);
    clueEl.dataset.debugLabel = `clue: ${clue.name}`;

    // Use clue image (with fallback if image not available yet)
    const img = document.createElement('img');
    const imageName = clue.imageFallback || clue.image;
    const primarySrc = `images/clues/${imageName}`;
    img.src = primarySrc;
    img.alt = clue.name;
    img.onerror = () => {
      img.onerror = null;
      img.src = 'images/clues/question_mark.png';
    };
    clueEl.appendChild(img);

    const handleClueInteraction = () => {
      AudioManager.playClue();
      AudioManager.playClueBeep(); // Backup sound
      this.collectClue(clue);
    };

    this.bindTapInteraction(clueEl, handleClueInteraction);

    this.elements.objectsLayer.appendChild(clueEl);
  },

  getSuspectMood(suspectId) {
    const totalClues = this.currentMysteryData ? this.currentMysteryData.locations.length : 4;
    const clueCount = this.cluesFound.length;

    if (suspectId === this.guiltySuspect) {
      if (clueCount >= totalClues - 1) {
        return 'guilty';
      }

      if (clueCount >= 2) {
        return 'nervous';
      }

      return 'happy';
    }

    return clueCount >= totalClues - 1 ? 'nervous' : 'happy';
  },

  // Interact with character
  interactWithCharacter(char) {
    const suspectId = char.id;
    let dialogue;

    // Check if this is the guilty suspect or innocent
    if (suspectId === this.guiltySuspect) {
      // Guilty suspect - use their special dialogue
      const guiltyData = this.currentMysteryData.suspects[suspectId].dialogue;

      if (this.cluesFound.length >= 2 && guiltyData.afterClue) {
        dialogue = guiltyData.afterClue;
      } else {
        dialogue = guiltyData.initial;
      }
    } else {
      // Innocent suspect - use innocent dialogue
      const innocentData = this.currentMysteryData.innocentDialogue[suspectId];

      if (this.cluesFound.length >= 2 && innocentData.afterClue) {
        dialogue = innocentData.afterClue;
      } else {
        dialogue = innocentData.initial;
      }
    }

    this.showDialogue(char.name, dialogue.text, dialogue.choices);
  },

  // Interact with object
  interactWithObject(obj) {
    this.showDialogue('Detective Dino', obj.dialogue.text, obj.dialogue.choices);
  },

  // Collect clue
  collectClue(clue) {
    if (this.cluesFound.includes(clue.id)) return;

    this.cluesFound.push(clue.id);
    this.updateClueCount();

    const totalClues = this.currentMysteryData.locations.length;
    const remainingClues = totalClues - this.cluesFound.length;
    const rawProgressLine = remainingClues === 0
      ? 'You found all the clues! Time to solve the mystery!'
      : `${remainingClues} clue${remainingClues === 1 ? '' : 's'} left to find.`;

    // Adapt description and progress independently so beginner text is clean
    const adaptedDesc = this.adaptText(clue.description);
    let adaptedProgress;
    if (this.readingLevel === 'beginner') {
      adaptedProgress = remainingClues === 0
        ? 'All clues found! '
        : `${remainingClues} more to find! `;
    } else if (this.readingLevel === 'intermediate') {
      adaptedProgress = remainingClues === 0
        ? 'Great! You found all the clues!'
        : rawProgressLine;
    } else {
      adaptedProgress = rawProgressLine;
    }

    // Show clue dialogue (text already adapted — pass true to skip re-adaptation)
    this.setDinoMood('excited');
    clearTimeout(this._dinoMoodTimer);
    this._dinoMoodTimer = setTimeout(() => this.setDinoMood('thinking'), 2500);
    this.showDialogue(' Clue Found!', `${adaptedDesc} ${adaptedProgress}`, [
      { text: remainingClues === 0 ? 'Make an accusation! ' : 'Add to notebook! ', action: remainingClues === 0 ? 'accuse' : 'close' }
    ], true);

    // Re-render location to hide collected clue
    this.renderLocation();
    this.updateNavigationState();
  },

  // Show dialogue
  showDialogue(speaker, text, choices, textIsAdapted = false) {
    this.elements.speakerName.textContent = speaker;
    this.elements.dialogueText.textContent = textIsAdapted ? text : this.adaptText(text);
    this.elements.dialogueChoices.innerHTML = '';

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = this.adaptText(choice.text);

      const handleChoice = () => {
        AudioManager.playClick();
        if (choice.action === 'accuse') {
          this.hideDialogue();
          this.showAccusationScreen();
        } else {
          this.hideDialogue();
        }
      };

      this.bindTapInteraction(btn, handleChoice);

      this.elements.dialogueChoices.appendChild(btn);
    });

    this.elements.dialogueBox.classList.remove('hidden');
  },

  // Hide dialogue
  hideDialogue() {
    this.elements.dialogueBox.classList.add('hidden');
  },

  // Update clue count
  updateClueCount() {
    // Count total clues for current mystery (one per location)
    const totalClues = this.currentMysteryData.locations.length;
    this.elements.clueCount.textContent = `${this.cluesFound.length}/${totalClues}`;
  },

  // Toggle notebook
  toggleNotebook() {
    AudioManager.playClick();
    const isHidden = this.elements.notebookOverlay.classList.contains('hidden');

    if (isHidden) {
      this.showNotebook();
    } else {
      this.hideNotebook();
    }
  },

  // Show notebook
  showNotebook() {
    this.elements.cluesList.innerHTML = '';

    if (this.cluesFound.length === 0) {
      this.elements.cluesList.innerHTML = '<p class="no-clues">Find clues by investigating each location!</p>';
    } else {
      // Get all clues from the guilty suspect's clue set
      const culpritClues = this.currentMysteryData.suspects[this.guiltySuspect].clues;

      this.cluesFound.forEach(clueId => {
        // Find the clue in the culprit's clues
        const clueInfo = Object.values(culpritClues).find(c => c.id === clueId);

        if (clueInfo) {
          const clueItem = document.createElement('div');
          clueItem.className = 'clue-item';
          const imageName = clueInfo.imageFallback || clueInfo.image || 'question_mark.png';
          clueItem.innerHTML = `
            <div class="clue-item-inner">
              <img src="images/clues/${imageName}" alt="${clueInfo.name}" class="clue-thumb" onerror="this.src='images/clues/question_mark.png'">
              <div>
                <strong> ${clueInfo.name}</strong>
                <p>${this.adaptText(clueInfo.description)}</p>
              </div>
            </div>
          `;
          this.elements.cluesList.appendChild(clueItem);
        }
      });
    }

    this.elements.notebookOverlay.classList.remove('hidden');
  },

  // Hide notebook
  hideNotebook() {
    this.elements.notebookOverlay.classList.add('hidden');
  },

  // Show accusation screen
  showAccusationScreen() {
    AudioManager.playClick();

    // Check if player has found at least 2 clues
    if (this.cluesFound.length < 2) {
      const cluesNeeded = 2 - this.cluesFound.length;
      this.showDialogue('Detective Dino', 'We need more clues before we can make an accusation! Keep investigating! ', [
        { text: `Find ${cluesNeeded} more clue${cluesNeeded === 1 ? '' : 's'}!`, action: 'close' }
      ]);
      return;
    }

    this.hideDialogue();
    this.hideNotebook();

    // Build accusation screen dynamically for this mystery
    const titleEl = document.getElementById('accusation-title');
    if (titleEl) titleEl.textContent = `Who did it? — ${this.currentMysteryData.title}`;

    const grid = document.getElementById('suspects-grid');
    grid.innerHTML = '';
    Object.entries(this.currentMysteryData.suspects).forEach(([suspectId, suspect]) => {
      const card = document.createElement('div');
      card.className = 'suspect-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Accuse ${suspect.name}`);
      card.innerHTML = `
        <div class="${suspectId} avatar">
          <img src="images/characters/${suspectId}_nervous.png" alt="${suspect.name}" class="${suspectId}">
        </div>
        <p>${suspect.name}</p>
      `;
      card.addEventListener('click', () => accuseSuspect(suspectId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accuseSuspect(suspectId); }
      });
      grid.appendChild(card);
    });

    this.elements.gameScreen.classList.remove('active');
    this.elements.accusationScreen.classList.add('active');
  },

  // Hide accusation screen
  hideAccusationScreen() {
    AudioManager.playClick();
    this.elements.accusationScreen.classList.remove('active');
    this.elements.gameScreen.classList.add('active');
    this.setDinoMood('thinking');
  },

  // Accuse suspect
  accuseSuspect(suspectId) {
    AudioManager.playClick();

    if (suspectId === this.guiltySuspect) {
      // CORRECT! Show win screen
      AudioManager.playCorrect();
      AudioManager.playWin();
      AudioManager.playCorrectBeep();
      AudioManager.playWinBeep();
      this.showWinScreen(suspectId);
    } else {
      // WRONG! Show try again with innocent suspect's wrong response
      AudioManager.playWrong();
      AudioManager.playWrongBeep();
      const wrongResponse = this.currentMysteryData.innocentDialogue[suspectId].wrongResponse;
      this.showTryAgainScreen(wrongResponse, suspectId);
    }
  },

  // Show win screen
  showWinScreen(suspectId) {
    this.elements.accusationScreen.classList.remove('active');
    this.elements.winScreen.classList.add('active');

    const suspect = this.currentMysteryData.suspects[suspectId];
    const culpritImg = this.elements.winScreen.querySelector('.culprit-img');
    const culpritText = this.elements.winScreen.querySelector('.culprit > div');

    if (culpritImg) {
      culpritImg.src = `images/characters/${suspectId}_guilty.png`;
      culpritImg.alt = suspect.name;
      culpritImg.className = 'culprit-img';
    }
    if (culpritText) {
      const confessionText = `It was ${suspect.name}! ${suspect.confession}`;
      culpritText.textContent = this.adaptText(confessionText);
    }
    const caseLineEl = document.getElementById('win-case-line');
    if (caseLineEl) {
      caseLineEl.textContent = this.readingLevel === 'beginner'
        ? 'Case closed! '
        : `You solved: ${this.currentMysteryData.title}! `;
    }
    // Update level button indicator
    this._updateLevelBtn();

    clearTimeout(this._dinoMoodTimer);
    this.setDinoMood('celebrating');
  },

  // Show try again screen
  showTryAgainScreen(message, suspectId) {
    this.elements.accusationScreen.classList.remove('active');
    this.elements.tryAgainScreen.classList.add('active');

    const suspectEl = document.getElementById('try-again-suspect');
    if (suspectEl) {
      suspectEl.innerHTML = suspectId
        ? `<img src="images/characters/${suspectId}_nervous.png" alt="${this.currentMysteryData.suspects[suspectId]?.name || suspectId}" class="try-again-suspect-img">`
        : '';
    }

    const messageEl = this.elements.tryAgainScreen.querySelector('p.big-text');
    if (messageEl) {
      messageEl.textContent = this.adaptText(message);
    }
  },

  // Update the level button indicator in the top bar
  _updateLevelBtn() {
    const indicator = document.getElementById('level-btn-indicator');
    if (!indicator) return;
    const map = { beginner: '\ud83d\udcd6\u2b50', intermediate: '\ud83d\udcd6\u2b50\u2b50', advanced: '\ud83d\udcd6\u2b50\u2b50\u2b50' };
    indicator.textContent = map[this.readingLevel] || '\ud83d\udcd6';
  },

  // Toggle in-game level select overlay
  toggleLevelSelect() {
    const overlay = document.getElementById('level-select-overlay');
    if (!overlay) return;
    AudioManager.playClick();
    if (overlay.classList.contains('hidden')) {
      overlay.querySelectorAll('.in-game-level-card').forEach(card => {
        card.classList.toggle('active-level', card.dataset.level === this.readingLevel);
      });
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  },

  // Change reading level mid-game without restarting
  changeLevelInGame(level) {
    AudioManager.playClick();
    this.readingLevel = level;
    this._applyReadingLevelStaticText();
    this._updateLevelBtn();
    document.getElementById('level-select-overlay')?.classList.add('hidden');
  },

  // Update the level button indicator in the top bar
  _updateLevelBtn() {
    const indicator = document.getElementById('level-btn-indicator');
    if (!indicator) return;
    const map = { beginner: '📖⭐', intermediate: '📖⭐⭐', advanced: '📖⭐⭐⭐' };
    indicator.textContent = map[this.readingLevel] || '📖';
  },

  // Toggle in-game level select overlay
  toggleLevelSelect() {
    const overlay = document.getElementById('level-select-overlay');
    if (!overlay) return;
    AudioManager.playClick();
    if (overlay.classList.contains('hidden')) {
      overlay.querySelectorAll('.in-game-level-card').forEach(card => {
        card.classList.toggle('active-level', card.dataset.level === this.readingLevel);
      });
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  },

  // Change reading level mid-game without restarting
  changeLevelInGame(level) {
    AudioManager.playClick();
    this.readingLevel = level;
    this._applyReadingLevelStaticText();
    this._updateLevelBtn();
    document.getElementById('level-select-overlay')?.classList.add('hidden');
  },

  // Hide try again screen
  hideTryAgainScreen() {
    AudioManager.playClick();
    this.elements.tryAgainScreen.classList.remove('active');
    this.elements.gameScreen.classList.add('active');
    this.setDinoMood('thinking');
  }
};

// Global functions (called from HTML onclick)
function showReadingLevelScreen() {
  AudioManager.playClick();
  document.getElementById('title-screen').classList.remove('active');
  document.getElementById('reading-level-screen').classList.add('active');
}

function selectReadingLevel(level) {
  AudioManager.playClick();
  Game.readingLevel = level;

  // Select random mystery after level is chosen
  Game.selectRandomMystery();

  // Start game
  Game.start();
}

function startGame() {
  Game.start();
}

function changeLocation(locationId) {
  Game.changeLocation(locationId);
}

function toggleNotebook() {
  Game.toggleNotebook();
}

function showAccusationScreen() {
  Game.showAccusationScreen();
}

function hideAccusationScreen() {
  Game.hideAccusationScreen();
}

function accuseSuspect(suspectId) {
  Game.accuseSuspect(suspectId);
}

function hideTryAgainScreen() {
  Game.hideTryAgainScreen();
}

function toggleLevelSelect() {
  Game.toggleLevelSelect();
}

function changeLevelInGame(level) {
  Game.changeLevelInGame(level);
}

function nextTutorialStep() {
  Game.nextTutorialStep();
}

function previousTutorialStep() {
  Game.previousTutorialStep();
}

function skipTutorial() {
  Game.skipTutorial();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
