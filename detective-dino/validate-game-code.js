// Comprehensive game code validation
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== Detective Dino - Code Validation ===\n');

let errorCount = 0;
let warningCount = 0;

function error(msg) {
  console.log(`✗ ERROR: ${msg}`);
  errorCount++;
}

function warn(msg) {
  console.log(`⚠ WARNING: ${msg}`);
  warningCount++;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
}

function info(msg) {
  console.log(`ℹ ${msg}`);
}

// Test 1: Load and validate mysteries.js
console.log('Test 1: Validating mysteries.js...');
try {
  const mysteriesCode = fs.readFileSync(path.join(__dirname, 'mysteries.js'), 'utf8');

  // Create a sandbox context with window object
  const sandbox = {
    console,
    window: {}
  };
  vm.createContext(sandbox);

  // Execute the code in sandbox
  vm.runInContext(mysteriesCode, sandbox);

  if (sandbox.mysteriesData || sandbox.window.mysteriesData) {
    const mysteriesData = sandbox.mysteriesData || sandbox.window.mysteriesData;
    pass('mysteriesData loaded successfully');

    // Validate structure
    const mysteries = mysteriesData;

    if (!mysteries.missing_cookies) {
      error('missing_cookies mystery not found');
    } else {
      pass('missing_cookies mystery exists');

      const mystery = mysteries.missing_cookies;

      // Check required properties
      if (!mystery.id) warn('Mystery missing id property');
      if (!mystery.title) warn('Mystery missing title property');
      if (!mystery.intro) warn('Mystery missing intro property');
      if (!mystery.locations) {
        error('Mystery missing locations array');
      } else {
        pass(`Mystery has ${mystery.locations.length} locations`);
      }

      if (!mystery.suspects) {
        error('Mystery missing suspects object');
      } else {
        const suspects = ['bunny', 'cat', 'dog', 'mouse'];
        let suspectCount = 0;

        suspects.forEach(suspect => {
          if (mystery.suspects[suspect]) {
            suspectCount++;

            const suspectData = mystery.suspects[suspect];

            // Check clues
            if (!suspectData.clues) {
              error(`${suspect} missing clues`);
            } else {
              const clueCount = Object.keys(suspectData.clues).length;
              if (clueCount === 4) {
                pass(`${suspect} has ${clueCount} clues`);
              } else {
                warn(`${suspect} has ${clueCount} clues (expected 4)`);
              }

              // Validate each clue
              Object.entries(suspectData.clues).forEach(([location, clue]) => {
                if (!clue.id) warn(`${suspect} clue in ${location} missing id`);
                if (!clue.name) warn(`${suspect} clue in ${location} missing name`);
                if (!clue.image && !clue.imageFallback) {
                  warn(`${suspect} clue in ${location} missing image`);
                }
                if (!clue.description) warn(`${suspect} clue in ${location} missing description`);
              });
            }

            // Check dialogue
            if (!suspectData.dialogue) {
              error(`${suspect} missing dialogue`);
            }

            // Check confession
            if (!suspectData.confession) {
              warn(`${suspect} missing confession`);
            }
          } else {
            error(`Suspect '${suspect}' not found`);
          }
        });

        pass(`All ${suspectCount}/4 suspects defined`);
      }

      // Check innocentDialogue
      if (!mystery.innocentDialogue) {
        error('Mystery missing innocentDialogue');
      } else {
        pass('innocentDialogue exists');
      }
    }
  } else {
    error('mysteriesData not found after loading');
  }
} catch (err) {
  error(`Failed to load mysteries.js: ${err.message}`);
}

// Test 2: Load and validate game.js structure
console.log('\nTest 2: Validating game.js structure...');
try {
  const gameCode = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');

  // Check for required methods
  const requiredMethods = [
    'init',
    'selectRandomMystery',
    'start',
    'renderLocation',
    'renderCharacter',
    'renderClue',
    'interactWithCharacter',
    'showDialogue',
    'accuseSuspect',
    'showWinScreen',
    'showTryAgainScreen',
    'toggleNotebook',
    'updateClueCount',
    'showNotebook'
  ];

  requiredMethods.forEach(method => {
    const regex = new RegExp(`${method}\\s*\\([^)]*\\)\\s*{`, 'g');
    if (regex.test(gameCode)) {
      pass(`Game.${method}() found`);
    } else {
      error(`Game.${method}() not found`);
    }
  });

  // Check for proper querySelector calls with new classes
  if (gameCode.includes('.culprit img')) {
    pass('Uses correct selector .culprit img');
  } else {
    warn('May not be using correct .culprit img selector');
  }

  // Check that old classes aren't used
  if (gameCode.includes('culprit-image') && !gameCode.includes('querySelector')) {
    warn('Old class name "culprit-image" found in code');
  }

} catch (err) {
  error(`Failed to validate game.js: ${err.message}`);
}

// Test 3: Validate HTML structure
console.log('\nTest 3: Validating index.html...');
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  // Check that scenes.js is not loaded
  if (htmlContent.includes('src="scenes.js"')) {
    error('index.html still references deprecated scenes.js');
  } else {
    pass('scenes.js reference removed');
  }

  // Check script order
  const mysteriesIndex = htmlContent.indexOf('src="mysteries.js"');
  const audioIndex = htmlContent.indexOf('src="audio.js"');
  const gameIndex = htmlContent.indexOf('src="game.js"');

  if (mysteriesIndex < audioIndex && audioIndex < gameIndex) {
    pass('Scripts loaded in correct order');
  } else {
    error('Scripts not in correct order (should be: mysteries.js, audio.js, game.js)');
  }

  // Check for new class names
  const newClasses = ['class="bunny avatar"', 'class="cat avatar"', 'class="dog avatar"', 'class="mouse avatar"', 'class="dino'];
  newClasses.forEach(cls => {
    if (htmlContent.includes(cls) || htmlContent.includes(cls.replace('avatar', 'icon')) || htmlContent.includes(cls.replace('avatar', 'title'))) {
      pass(`Found ${cls.split('"')[1]} class usage`);
    }
  });

  // Check for old deprecated classes
  if (htmlContent.includes('bunny-avatar') || htmlContent.includes('suspect-avatar')) {
    warn('Found deprecated class names (bunny-avatar or suspect-avatar)');
  }

} catch (err) {
  error(`Failed to validate index.html: ${err.message}`);
}

// Test 4: Validate CSS
console.log('\nTest 4: Validating style.css...');
try {
  const cssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

  // Check for new selectors
  if (cssContent.includes('.avatar')) {
    pass('.avatar selector found');
  } else {
    error('.avatar selector not found');
  }

  if (cssContent.includes('.dino.icon')) {
    pass('.dino.icon selector found');
  } else {
    warn('.dino.icon selector not found');
  }

  if (cssContent.includes('.culprit img')) {
    pass('.culprit img selector found');
  } else {
    warn('.culprit img selector not found');
  }

  // Check for old deprecated selectors
  if (cssContent.includes('.suspect-avatar') && !cssContent.includes('/* deprecated */')) {
    warn('.suspect-avatar selector found (should be .avatar)');
  }

  if (cssContent.includes('.culprit-image')) {
    warn('.culprit-image selector found (should be .culprit img)');
  }

} catch (err) {
  error(`Failed to validate style.css: ${err.message}`);
}

// Test 5: Check for common runtime issues
console.log('\nTest 5: Checking for common runtime issues...');

try {
  const gameCode = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');

  // Check for undefined variable references
  if (gameCode.includes('scenes.') || gameCode.includes('scenes[')) {
    error('Code references deprecated "scenes" variable');
  } else {
    pass('No references to deprecated scenes variable');
  }

  // Check that mysteriesData is used
  if (gameCode.includes('mysteriesData')) {
    pass('Code references mysteriesData');
  } else {
    error('Code does not reference mysteriesData');
  }

} catch (err) {
  error(`Failed runtime issue check: ${err.message}`);
}

// Summary
console.log('\n=== Validation Summary ===');
console.log(`Errors: ${errorCount}`);
console.log(`Warnings: ${warningCount}`);

if (errorCount === 0) {
  console.log('\n✓ ALL VALIDATION PASSED - Game code is ready!');
  process.exit(0);
} else {
  console.log(`\n✗ ${errorCount} ERROR(S) FOUND - Please fix before testing`);
  process.exit(1);
}
