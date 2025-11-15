// Test that all image references in mysteries.js point to actual files
const fs = require('fs');
const path = require('path');

console.log('=== Testing Image References in mysteries.js ===\n');

// Load mysteries.js
const mysteriesContent = fs.readFileSync('mysteries.js', 'utf8');

// Create sandbox with window object
const sandbox = { console, window: {} };
const vm = require('vm');
vm.createContext(sandbox);
vm.runInContext(mysteriesContent, sandbox);

const mysteriesData = sandbox.window.mysteriesData;

let errors = 0;
let warnings = 0;

// Test all mysteries
const mysteryKeys = Object.keys(mysteriesData);
console.log(`Found ${mysteryKeys.length} mysteries: ${mysteryKeys.join(', ')}\n`);

for (const mysteryKey of mysteryKeys) {
  const mystery = mysteriesData[mysteryKey];
  console.log(`\n========== Testing Mystery: ${mystery.title} ==========`);

  // Test backgrounds
  console.log('\nTest 1: Checking background images...');
  for (const [locationName, backgroundName] of Object.entries(mystery.backgrounds)) {
    const backgroundPath = path.join('images', 'backgrounds', `${backgroundName}.png`);
    if (fs.existsSync(backgroundPath)) {
      console.log(`  ✓ ${locationName}: ${backgroundName}.png exists`);
    } else {
      console.log(`  ✗ ERROR: ${locationName}: ${backgroundName}.png NOT FOUND`);
      errors++;
    }
  }

  // Test clue images for each suspect
  console.log('\nTest 2: Checking clue images...');
  const suspects = ['bunny', 'cat', 'dog', 'mouse'];
  for (const suspectId of suspects) {
    const suspect = mystery.suspects[suspectId];
    console.log(`\n  ${suspect.name} (${suspectId}):`);

    for (const [location, clue] of Object.entries(suspect.clues)) {
      const cluePath = path.join('images', 'clues', clue.image);

      if (fs.existsSync(cluePath)) {
        console.log(`    ✓ ${location}: ${clue.image} exists`);
      } else {
        console.log(`    ✗ ERROR: ${location}: ${clue.image} NOT FOUND`);
        errors++;
      }

      // Check for imageFallback (should be removed)
      if (clue.imageFallback) {
        console.log(`    ⚠ WARNING: ${location} still has imageFallback: ${clue.imageFallback}`);
        warnings++;
      }
    }
  }
}

// Test character images
console.log('\nTest 3: Checking character images...');
const characterStates = ['happy', 'nervous', 'guilty', 'sad', 'celebrating'];
const characters = ['bunny', 'cat', 'dog', 'mouse', 'detective_dino'];

for (const character of characters) {
  for (const state of characterStates) {
    const charPath = path.join('images', 'characters', `${character}_${state}.png`);
    if (fs.existsSync(charPath)) {
      console.log(`  ✓ ${character}_${state}.png exists`);
    } else {
      // detective_dino might not have all states, so just info
      if (character === 'detective_dino') {
        console.log(`  ℹ ${character}_${state}.png not found (may not be needed)`);
      }
    }
  }
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n✓ ALL IMAGE REFERENCES ARE VALID!');
  process.exit(0);
} else if (errors === 0) {
  console.log('\n⚠ Tests passed but with warnings');
  process.exit(0);
} else {
  console.log('\n✗ TESTS FAILED - Fix missing images');
  process.exit(1);
}
