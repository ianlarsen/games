// Simple test to check if game files load without errors
const fs = require('fs');
const path = require('path');

console.log('=== Detective Dino Game Test ===\n');

// Test 1: Check all required files exist
console.log('Test 1: Checking required files...');
const requiredFiles = [
  'index.html',
  'style.css',
  'game.js',
  'mysteries.js',
  'audio.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

// Test 2: Check critical image files
console.log('\nTest 2: Checking critical image files...');
const criticalImages = [
  'images/characters/detective_dino.png',
  'images/characters/bunny_happy.png',
  'images/characters/cat_happy.png',
  'images/characters/dog_happy.png',
  'images/characters/mouse_happy.png',
  'images/backgrounds/kitchen.png',
  'images/backgrounds/backyard.png',
  'images/backgrounds/living_room.png',
  'images/backgrounds/park.png'
];

let allImagesExist = true;
criticalImages.forEach(img => {
  const imgPath = path.join(__dirname, img);
  if (fs.existsSync(imgPath)) {
    console.log(`  ✓ ${img}`);
  } else {
    console.log(`  ✗ ${img} - MISSING!`);
    allImagesExist = false;
  }
});

// Test 3: Load and parse mysteries.js
console.log('\nTest 3: Testing mysteries.js...');
try {
  const mysteriesContent = fs.readFileSync(path.join(__dirname, 'mysteries.js'), 'utf8');

  // Check if mysteriesData is defined
  if (mysteriesContent.includes('const mysteriesData')) {
    console.log('  ✓ mysteriesData is defined');
  } else {
    console.log('  ✗ mysteriesData not found!');
  }

  // Check if missing_cookies mystery exists
  if (mysteriesContent.includes('missing_cookies:')) {
    console.log('  ✓ missing_cookies mystery exists');
  } else {
    console.log('  ✗ missing_cookies mystery not found!');
  }

  // Check if all suspects are defined
  const suspects = ['bunny', 'cat', 'dog', 'mouse'];
  suspects.forEach(suspect => {
    if (mysteriesContent.includes(`${suspect}:`)) {
      console.log(`  ✓ ${suspect} suspect defined`);
    } else {
      console.log(`  ✗ ${suspect} suspect not found!`);
    }
  });

} catch (err) {
  console.log(`  ✗ Error reading mysteries.js: ${err.message}`);
}

// Test 4: Check HTML structure
console.log('\nTest 4: Testing index.html structure...');
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  const requiredElements = [
    'id="title-screen"',
    'id="game-screen"',
    'id="scene-container"',
    'id="characters-layer"',
    'id="objects-layer"',
    'id="dialogue-box"',
    'id="navigation"',
    'id="notebook-overlay"',
    'id="accusation-screen"',
    'id="win-screen"',
    'id="try-again-screen"'
  ];

  requiredElements.forEach(elem => {
    if (htmlContent.includes(elem)) {
      console.log(`  ✓ ${elem} exists`);
    } else {
      console.log(`  ✗ ${elem} - MISSING!`);
    }
  });

  // Check script loading order
  console.log('\n  Script loading order:');
  const scriptOrder = [
    'mysteries.js',
    'audio.js',
    'game.js'
  ];

  let lastIndex = -1;
  let orderCorrect = true;
  scriptOrder.forEach(script => {
    const index = htmlContent.indexOf(`src="${script}"`);
    if (index > lastIndex) {
      console.log(`    ✓ ${script} (position: ${index})`);
      lastIndex = index;
    } else {
      console.log(`    ✗ ${script} - WRONG ORDER!`);
      orderCorrect = false;
    }
  });

} catch (err) {
  console.log(`  ✗ Error reading index.html: ${err.message}`);
}

// Test 5: Check for common CSS class issues
console.log('\nTest 5: Testing CSS classes...');
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

  // Check character classes in HTML
  const characterClasses = ['bunny', 'cat', 'dog', 'mouse', 'dino'];
  characterClasses.forEach(char => {
    if (htmlContent.includes(`class="${char}`) || htmlContent.includes(`class="${char} `)) {
      console.log(`  ✓ ${char} class found in HTML`);
    } else {
      console.log(`  ⚠ ${char} class not found in HTML (may be dynamically added)`);
    }
  });

  // Check avatar class
  if (htmlContent.includes('class="') && htmlContent.includes(' avatar')) {
    console.log('  ✓ avatar class found in HTML');
  }

  if (cssContent.includes('.avatar')) {
    console.log('  ✓ .avatar selector found in CSS');
  } else {
    console.log('  ✗ .avatar selector not found in CSS!');
  }

} catch (err) {
  console.log(`  ✗ Error: ${err.message}`);
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Files exist: ${allFilesExist ? '✓ PASS' : '✗ FAIL'}`);
console.log(`Images exist: ${allImagesExist ? '✓ PASS' : '✗ FAIL'}`);
console.log('\nTest complete! Check output above for any ✗ marks.');
