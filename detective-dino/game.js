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

  // DOM elements
  elements: {
    titleScreen: null,
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
    tryAgainScreen: null
  },

  // Initialize game
  init() {
    // Cache DOM elements
    this.elements.titleScreen = document.getElementById('title-screen');
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

    // Mobile optimizations
    this.initMobileOptimizations();

    // Select random mystery
    this.selectRandomMystery();
    console.log('Detective Dino initialized!');
    console.log('Mystery:', this.currentMystery);
    console.log('Guilty suspect:', this.guiltySuspect);
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

  // Start game
  start() {
    AudioManager.playClick();
    this.gameStarted = true;

    // Hide title, show game
    this.elements.titleScreen.classList.remove('active');
    this.elements.gameScreen.classList.add('active');

    // Render navigation buttons for this mystery
    this.renderNavigation();

    // Start background music
    AudioManager.playMusic();

    // Show intro dialogue from current mystery
    const intro = this.currentMysteryData.intro;
    this.showDialogue(intro.speaker, intro.text, intro.choices);
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
      sports_field: { name: '⚽ Sports Field', emoji: '⚽' }
    };

    // Create button for each location in this mystery
    this.currentMysteryData.locations.forEach(locationId => {
      const locationInfo = locationNames[locationId] || { name: locationId, emoji: '📍' };
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.textContent = locationInfo.name;
      btn.onclick = () => changeLocation(locationId);
      nav.appendChild(btn);
    });

    // Add accusation button
    const accuseBtn = document.createElement('button');
    accuseBtn.className = 'nav-btn accuse-btn';
    accuseBtn.textContent = '⚖️ Make Accusation!';
    accuseBtn.onclick = () => showAccusationScreen();
    nav.appendChild(accuseBtn);
  },

  // Change location
  changeLocation(locationId) {
    AudioManager.playClick();
    this.currentLocation = locationId;
    this.renderLocation();
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
    charEl.className = 'character';
    charEl.style.bottom = char.position.bottom;
    charEl.style.left = char.position.left;
    charEl.title = char.name;

    // Use actual character image instead of emoji
    const img = document.createElement('img');
    img.src = `images/characters/${char.id}_happy.png`;
    img.alt = char.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    charEl.appendChild(img);

    const handleInteraction = (e) => {
      e.preventDefault();
      AudioManager.playClick();
      this.interactWithCharacter(char);
    };

    charEl.addEventListener('click', handleInteraction);
    charEl.addEventListener('touchend', handleInteraction, { passive: false });

    this.elements.charactersLayer.appendChild(charEl);
  },

  // Render object
  renderObject(obj) {
    const objEl = document.createElement('div');
    objEl.className = 'object';
    objEl.style.bottom = obj.position.bottom;
    objEl.style.left = obj.position.left;
    objEl.title = obj.name;

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

    const handleInteraction = (e) => {
      e.preventDefault();
      AudioManager.playClick();
      this.interactWithObject(obj);
    };

    objEl.addEventListener('click', handleInteraction);
    objEl.addEventListener('touchend', handleInteraction, { passive: false });

    this.elements.objectsLayer.appendChild(objEl);
  },

  // Render clue (with sparkle animation)
  renderClue(clue) {
    const clueEl = document.createElement('div');
    clueEl.className = 'object clue sparkle';
    clueEl.style.bottom = clue.position.bottom;
    clueEl.style.left = clue.position.left;
    clueEl.title = clue.name;

    // Use clue image (with fallback if image not available yet)
    const img = document.createElement('img');
    const imageName = clue.imageFallback || clue.image;
    img.src = `images/clues/${imageName}`;
    img.alt = clue.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    clueEl.appendChild(img);

    const handleClueInteraction = (e) => {
      e.preventDefault();
      AudioManager.playClue();
      AudioManager.playClueBeep(); // Backup sound
      this.collectClue(clue);
    };

    clueEl.addEventListener('click', handleClueInteraction);
    clueEl.addEventListener('touchend', handleClueInteraction, { passive: false });

    this.elements.objectsLayer.appendChild(clueEl);
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

    // Show clue dialogue
    this.showDialogue('🔍 Clue Found!', clue.description, [
      { text: 'Add to notebook! 📓', action: 'close' }
    ]);

    // Re-render location to hide collected clue
    this.renderLocation();
  },

  // Show dialogue
  showDialogue(speaker, text, choices) {
    this.elements.speakerName.textContent = speaker;
    this.elements.dialogueText.textContent = text;
    this.elements.dialogueChoices.innerHTML = '';

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;

      const handleChoice = (e) => {
        e.preventDefault();
        AudioManager.playClick();
        if (choice.action === 'close') {
          this.hideDialogue();
        } else if (choice.action === 'start') {
          this.hideDialogue();
        }
      };

      btn.addEventListener('click', handleChoice);
      btn.addEventListener('touchend', handleChoice, { passive: false });

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
      this.showDialogue('Detective Dino', 'We need more clues before we can make an accusation! Keep investigating! 🔍', [
        { text: 'Keep looking! 👍', action: 'close' }
      ]);
      return;
    }

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
    const culpritImg = this.elements.winScreen.querySelector('.culprit-image');
    const culpritText = this.elements.winScreen.querySelector('.culprit div');

    if (culpritImg) {
      culpritImg.src = `images/characters/${suspectId}_sad.png`;
      culpritImg.alt = suspect.name;
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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
  Game.renderLocation(); // Render initial location
});
