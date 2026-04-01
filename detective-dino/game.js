// Detective Dino - Main Game Engine

const Game = {
  // Game state
  currentLocation: 'kitchen',
  cluesFound: [],
  currentDialogue: null,
  gameStarted: false,
  guiltySuspect: null, // Will be randomly selected
  currentMystery: null, // Current mystery scenario
  currentMysteryData: null, // Mystery data from mysteriesData
  readingLevel: null, // beginner, intermediate, or advanced
  recentTouchTime: 0,
  tutorialSeen: false,
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
    tutorialNext: null
  },

  // Adapt text to reading level
  adaptText(originalText, context = 'general') {
    if (!this.readingLevel || this.readingLevel === 'advanced') {
      return originalText; // Advanced uses original text (5th grade)
    }

    let text = originalText;

    if (this.readingLevel === 'beginner') {
      // Beginner: 3-5 word sentences, 1st grade level, present tense
      // Simplify common patterns
      text = text.replace(/Oh no! Someone stole /g, '')
        .replace(/all the cookies from the cookie jar! 🍪 We need to find out who did it!/g, 'The cookies are gone! Who took them?')
        .replace(/Let's investigate! 🔍/g, 'Let\'s look!')
        .replace(/You found /g, '')
        .replace(/ stuck to the cookie jar!/g, ' on jar!')
        .replace(/ leading to /g, ' to ')
        .replace(/ heading back toward /g, ' to ')
        .replace(/Cookie crumbs with /g, 'Crumbs and ')
        .replace(/Cookies hidden /g, 'Cookies ')
        .replace(/ mixed in!/g, '!')
        .replace(/Look closer! 👀/g, 'Look!')
        .replace(/Add to notebook! 📓/g, 'Got it!')
        .replace(/Keep looking! 👍/g, 'Keep going!')
        .replace(/We need more clues before we can make an accusation! Keep investigating! 🔍/g, 'Find more clues!')
        .replace(/You seem nervous\.\.\. 🤔/g, 'You look worried!')
        .replace(/The truth comes out! ⚖️/g, 'I know now!')
        .replace(/Okay! ✅/g, 'OK!')
        .replace(/I was just\.\.\. uh\.\.\. /g, 'I ')
        .replace(/definitely wasn't /g, 'was not ')
        .replace(/I couldn't help it!/g, 'I did it!')
        .replace(/They smelled like /g, 'They smell like ')
        .replace(/somehow!/g, '!')
        .replace(/I'm so sorry!/g, 'I am sorry!')
        .replace(/I... I couldn't resist!/g, 'I took them!')
        .replace(/Forgive me!/g, 'Sorry!')
        .replace(/I prefer /g, 'I like ');

      // Shorten long sentences to 3-5 words
      if (text.length > 30 && !text.includes('!') && !text.includes('?')) {
        text = text.split('.')[0] + '!';
      }
    } else if (this.readingLevel === 'intermediate') {
      // Intermediate: up to 10 word sentences, 3rd grade level
      text = text.replace(/Oh no! Someone stole all the cookies from the cookie jar! 🍪 We need to find out who did it!/g, 'Someone took the cookies from the jar! We must find who did it!')
        .replace(/Let's investigate! 🔍/g, 'Let\'s find clues!')
        .replace(/You found /g, 'You see ')
        .replace(/I was just\.\.\. uh\.\.\. /g, 'I was ')
        .replace(/I couldn't help it!/g, 'I could not stop!')
        .replace(/I... I couldn't resist!/g, 'I could not resist!')
        .replace(/definitely wasn't/g, 'was not')
        .replace(/I prefer /g, 'I like ')
        .replace(/We need more clues before we can make an accusation! Keep investigating! 🔍/g, 'We need more clues first! Keep looking!');
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

    this.initKeyboardAccessibility();
    this.loadTutorialPreference();

    // Mobile optimizations
    this.initMobileOptimizations();

    console.log('Detective Dino initialized!');
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

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      // Force re-render after orientation change
      setTimeout(() => {
        this.renderLocation();
      }, 100);
    });

    // Prevent pull-to-refresh on mobile browsers
    document.body.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Fix viewport height on mobile browsers (accounting for address bar)
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
  },

  initKeyboardAccessibility() {
    const clickableCards = document.querySelectorAll('.level-card, .suspect-card');
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
    AudioManager.playClick();

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
    this.renderNavigation();

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

  // Render navigation buttons based on current mystery locations
  renderNavigation() {
    const nav = this.elements.navigation;
    nav.innerHTML = ''; // Clear existing buttons

    // Location name mapping (can expand this)
    const locationNames = {
      kitchen: { name: '🏠 Kitchen', emoji: '🏠' },
      backyard: { name: '🌳 Backyard', emoji: '🌳' },
      living_room: { name: '🛋️ Living Room', emoji: '🛋️' },
      park: { name: '🎠 Park', emoji: '🎠' },
      playroom: { name: '🎮 Playroom', emoji: '🎮' },
      garden: { name: '🌷 Garden', emoji: '🌷' },
      bedroom: { name: '🛏️ Bedroom', emoji: '🛏️' },
      garage: { name: '🚗 Garage', emoji: '🚗' },
      beach: { name: '🏖️ Beach', emoji: '🏖️' },
      sports_field: { name: '⚽ Sports Field', emoji: '⚽' },
      art_room: { name: '🎨 Art Room', emoji: '🎨' },
      hallway: { name: '🚪 Hallway', emoji: '🚪' },
      bathroom: { name: '🛁 Bathroom', emoji: '🛁' },
      closet: { name: '🧥 Closet', emoji: '🧥' },
      attic: { name: '📦 Attic', emoji: '📦' },
      basement: { name: '🧰 Basement', emoji: '🧰' }
    };

    // Create button for each location in this mystery
    this.currentMysteryData.locations.forEach(locationId => {
      const locationInfo = locationNames[locationId] || { name: locationId, emoji: '📍' };
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
    accuseBtn.textContent = '⚖️ Make Accusation!';
    accuseBtn.onclick = () => showAccusationScreen();
    nav.appendChild(accuseBtn);

    this.updateNavigationState();
  },

  updateNavigationState() {
    const locationButtons = this.elements.navigation.querySelectorAll('.nav-btn[data-location-id]');
    locationButtons.forEach((btn) => {
      const isCurrent = btn.dataset.locationId === this.currentLocation;
      btn.classList.toggle('active-location', isCurrent);
      btn.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
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
    const background = this.currentMysteryData.backgrounds[this.currentLocation];
    this.elements.background.className = background;

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
    const positions = [
      { bottom: "8%", left: "20%" },
      { bottom: "8%", left: "40%" },
      { bottom: "8%", left: "60%" },
      { bottom: "8%", left: "75%" }
    ];
    return positions[index] || { bottom: "8%", left: "50%" };
  },

  // Render character
  renderCharacter(char) {
    const charEl = document.createElement('div');
    charEl.className = char.id;
    charEl.style.bottom = char.position.bottom;
    charEl.style.left = char.position.left;
    charEl.title = char.name;
    charEl.tabIndex = 0;
    charEl.setAttribute('role', 'button');
    charEl.setAttribute('aria-label', `Talk to ${char.name}`);

    // Use actual character image instead of emoji
    const mood = this.getSuspectMood(char.id);
    const img = document.createElement('img');
    img.src = `images/characters/${char.id}_${mood}.png`;
    img.onerror = () => {
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

    // Object image mapping - add more as you create images
    const objectImages = {
      'cookie_jar': 'cookie_jar_empty.png',
      // Add these when you have images: 'ball': 'ball.png', 'couch': 'couch.png', 'flowers': 'flowers.png'
    };

    // Use actual image if available, otherwise use emoji
    if (objectImages[obj.id]) {
      const img = document.createElement('img');
      img.src = `images/objects/${objectImages[obj.id]}`;
      img.alt = obj.name;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
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

    // Use clue image (with fallback if image not available yet)
    const img = document.createElement('img');
    const imageName = clue.imageFallback || clue.image;
    img.src = `images/clues/${imageName}`;
    img.alt = clue.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
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
    const progressLine = remainingClues === 0
      ? 'You found all the clues! Time to solve the mystery!'
      : `${remainingClues} clue${remainingClues === 1 ? '' : 's'} left to find.`;

    // Show clue dialogue
    this.showDialogue('🔍 Clue Found!', `${clue.description} ${progressLine}`, [
      { text: remainingClues === 0 ? 'Make an accusation! ⚖️' : 'Add to notebook! 📓', action: 'close' }
    ]);

    // Re-render location to hide collected clue
    this.renderLocation();
  },

  // Show dialogue
  showDialogue(speaker, text, choices) {
    this.elements.speakerName.textContent = speaker;
    this.elements.dialogueText.textContent = this.adaptText(text);
    this.elements.dialogueChoices.innerHTML = '';

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = this.adaptText(choice.text);

      const handleChoice = () => {
        AudioManager.playClick();
        if (choice.action === 'close') {
          this.hideDialogue();
        } else if (choice.action === 'start') {
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
          clueItem.innerHTML = `
            <strong>🔍 ${clueInfo.name}</strong>
            <p>${clueInfo.description}</p>
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
      this.showDialogue('Detective Dino', 'We need more clues before we can make an accusation! Keep investigating! 🔍', [
        { text: `Find ${cluesNeeded} more clue${cluesNeeded === 1 ? '' : 's'}!`, action: 'close' }
      ]);
      return;
    }

    this.hideDialogue();
    this.hideNotebook();
    this.elements.gameScreen.classList.remove('active');
    this.elements.accusationScreen.classList.add('active');
  },

  // Hide accusation screen
  hideAccusationScreen() {
    AudioManager.playClick();
    this.elements.accusationScreen.classList.remove('active');
    this.elements.gameScreen.classList.add('active');
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
      this.showTryAgainScreen(wrongResponse);
    }
  },

  // Show win screen
  showWinScreen(suspectId) {
    this.elements.accusationScreen.classList.remove('active');
    this.elements.winScreen.classList.add('active');

    // Update win screen with correct suspect
    const suspect = this.currentMysteryData.suspects[suspectId];
    const culpritImg = this.elements.winScreen.querySelector('.culprit img');
    const culpritText = this.elements.winScreen.querySelector('.culprit > div');

    if (culpritImg) {
      culpritImg.src = `images/characters/${suspectId}_sad.png`;
      culpritImg.alt = suspect.name;
      culpritImg.className = `${suspectId} culprit`;
    }
    if (culpritText) {
      culpritText.textContent = `It was ${suspect.name}! ${suspect.confession}`;
    }
  },

  // Show try again screen
  showTryAgainScreen(message) {
    this.elements.accusationScreen.classList.remove('active');
    this.elements.tryAgainScreen.classList.add('active');

    // Update message
    const messageEl = this.elements.tryAgainScreen.querySelector('p.big-text');
    if (messageEl) {
      messageEl.textContent = message;
    }
  },

  // Hide try again screen
  hideTryAgainScreen() {
    AudioManager.playClick();
    this.elements.tryAgainScreen.classList.remove('active');
    this.elements.gameScreen.classList.add('active');
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
  console.log('Reading level selected:', level);

  // Select random mystery after level is chosen
  Game.selectRandomMystery();
  console.log('Mystery:', Game.currentMystery);
  console.log('Guilty suspect:', Game.guiltySuspect);

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
