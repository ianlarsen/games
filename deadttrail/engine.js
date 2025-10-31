import { getScene } from './registry.js';

// Performance optimization: debounce rapid clicks/taps
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Lazy load images with timeout
function lazyLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      console.warn(`Image load timeout: ${src}`);
      reject(new Error(`Timeout loading ${src}`));
    }, 5000); // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = (err) => {
      clearTimeout(timeout);
      console.error(`Failed to load image: ${src}`, err);
      reject(err);
    };
    img.src = src;
  });
}

export function initEngine({ startScene }) {
  console.log('🎮 Initializing game engine with start scene:', startScene);

  const sceneEl = document.getElementById('scene');
  const dialogueBoxEl = document.getElementById('dialogue-box');
  const dialogueTextEl = document.getElementById('dialogue-text');
  const choicesBoxEl = document.getElementById('choices-box');
  const loadingScreen = document.getElementById('loading-screen');
  const loadingProgress = document.getElementById('loading-progress');

  console.log('📦 DOM elements loaded:', {
    sceneEl: !!sceneEl,
    dialogueBoxEl: !!dialogueBoxEl,
    loadingScreen: !!loadingScreen,
    loadingProgress: !!loadingProgress
  });

  const gameState = {
    currentScene: startScene,
    flags: {},
    selectedChoiceIndex: 0
  };
  window.gameState = gameState; // handy for console debugging

  // Haptic feedback for mobile devices
  function vibrate(pattern = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Update loading progress
  function updateLoadingProgress(percent) {
    if (loadingProgress) {
      loadingProgress.style.width = `${percent}%`;
    }
  }

  // Memory optimization: Clear old scene assets
  function clearSceneAssets() {
    sceneEl.innerHTML = '';
    // Force garbage collection hint
    if (window.gc) window.gc();
  }

  function showDialogue(dialogueData) {
    if (dialogueData.sfx && window.playSfx) window.playSfx(dialogueData.sfx, dialogueData.sfxVol ?? 0.7);

    dialogueTextEl.innerText = dialogueData.text || '';
    choicesBoxEl.innerHTML = '';

    const choices = dialogueData.choices || [];
    gameState.selectedChoiceIndex = 0;

    function selectChoice(index) {
      // Vibrate on selection change
      vibrate(5);

      const buttons = choicesBoxEl.querySelectorAll('.choice-btn');
      buttons.forEach((btn, i) => {
        if (i === index) {
          btn.style.background = '#555';
          btn.style.borderColor = '#777';
          btn.focus();
        } else {
          btn.style.background = '#333';
          btn.style.borderColor = '#555';
        }
      });
      gameState.selectedChoiceIndex = index;
    }

    function executeChoice(choice) {
      // Vibrate on selection
      vibrate(20);

      // Always play flip sound when making a choice
      if (window.playSfx) window.playSfx('flip', 0.6);

      // Play additional sfx if specified
      if (choice.sfx && window.playSfx && choice.sfx !== 'flip') {
        window.playSfx(choice.sfx, choice.sfxVol ?? 0.7);
      }

      if (choice.setFlag) gameState.flags[choice.setFlag] = true;

      if (choice.target) {
        gameState.currentScene = choice.target;
        dialogueBoxEl.style.display = 'none';
        renderScene();
      } else {
        dialogueBoxEl.style.display = 'none';
      }
    }

    choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.innerText = choice.text;
      btn.className = 'choice-btn';
      btn.onclick = () => executeChoice(choice);
      btn.dataset.choiceIndex = index;
      choicesBoxEl.appendChild(btn);
    });

    dialogueBoxEl.style.display = 'block';

    // Auto-select first choice
    if (choices.length > 0) {
      setTimeout(() => selectChoice(0), 100);
    }

    // Keyboard navigation for choices
    const keyHandler = (e) => {
      if (dialogueBoxEl.style.display !== 'block') return;

      const buttons = choicesBoxEl.querySelectorAll('.choice-btn');
      if (buttons.length === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (gameState.selectedChoiceIndex + 1) % buttons.length;
        selectChoice(nextIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (gameState.selectedChoiceIndex - 1 + buttons.length) % buttons.length;
        selectChoice(prevIndex);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        executeChoice(choices[gameState.selectedChoiceIndex]);
      }
    };

    // Remove old listener if it exists
    document.removeEventListener('keydown', gameState.keyHandler);
    gameState.keyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
  }

  async function renderScene() {
    console.log('🎬 Rendering scene:', gameState.currentScene);
    const data = getScene(gameState.currentScene);
    if (!data) {
      console.error('❌ Scene not found:', gameState.currentScene);
      if (loadingScreen) loadingScreen.style.display = 'none';
      return;
    }

    // Clear previous scene to free memory
    clearSceneAssets();

    // Show loading screen while assets load
    if (loadingScreen) loadingScreen.style.display = 'flex';
    updateLoadingProgress(10);

    try {
      // Calculate total assets to load
      const totalAssets = 1 + (data.characters?.length || 0) + (data.objects?.length || 0);
      let loadedAssets = 0;

      // Preload background image
      if (data.background) {
        try {
          await lazyLoadImage(data.background);
          loadedAssets++;
          updateLoadingProgress((loadedAssets / totalAssets) * 100);
        } catch (err) {
          console.warn(`Failed to load background: ${data.background}`, err);
          loadedAssets++;
          updateLoadingProgress((loadedAssets / totalAssets) * 100);
        }
      }

      // Preload all character and object images with progress tracking
      const imagePromises = [];
      (data.characters || []).forEach(c => {
        if (c.asset) {
          imagePromises.push(
            lazyLoadImage(c.asset).then(img => {
              loadedAssets++;
              updateLoadingProgress((loadedAssets / totalAssets) * 100);
              return img;
            }).catch(err => {
              console.warn(`Skipping failed character asset: ${c.asset}`, err);
              loadedAssets++;
              updateLoadingProgress((loadedAssets / totalAssets) * 100);
              return null;
            })
          );
        }
      });
      (data.objects || []).forEach(o => {
        if (o.asset) {
          imagePromises.push(
            lazyLoadImage(o.asset).then(img => {
              loadedAssets++;
              updateLoadingProgress((loadedAssets / totalAssets) * 100);
              return img;
            }).catch(err => {
              console.warn(`Skipping failed object asset: ${o.asset}`, err);
              loadedAssets++;
              updateLoadingProgress((loadedAssets / totalAssets) * 100);
              return null;
            })
          );
        }
      });

      await Promise.all(imagePromises);
      updateLoadingProgress(100);

      // Small delay to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 200));

      // Hide loading screen
      if (loadingScreen) loadingScreen.style.display = 'none';

      sceneEl.style.backgroundImage = `url('${data.background}')`;

      // Handle ambient sounds based on background
      if (data.background && data.background.includes('woods')) {
        if (window.playAmbient) window.playAmbient('forest', 0.25);
      } else {
        if (window.stopAmbient) window.stopAmbient();
      }

      // Check if any zombies are present
      let hasZombies = false;

      (data.characters || []).forEach(c => {
        const el = document.createElement('img');
        el.src = c.asset;
        el.className = 'character' + (c.flipped ? ' flipped' : '');
        el.style.bottom = c.bottom;
        el.style.left = c.left;
        el.style.width = c.width;
        el.dataset.interactionId = c.id;
        el.loading = 'lazy';
        sceneEl.appendChild(el);

        // Check if character is a zombie
        if (c.id && (c.id.includes('zombie') || c.asset.includes('zombie'))) {
          hasZombies = true;
        }
      });

      (data.objects || []).forEach(o => {
        const el = document.createElement('img');
        el.src = o.asset;
        el.className = 'object';
        el.style.bottom = o.bottom;
        el.style.left = o.left;
        el.style.width = o.width;
        el.dataset.interactionId = o.id;
        el.loading = 'lazy';
        sceneEl.appendChild(el);

        // Check if object is zombie-related
        if (o.id && (o.id.includes('zombie') || o.asset.includes('zombie'))) {
          hasZombies = true;
        }
      });

      // Play zombie sound if zombies are present
      if (hasZombies && window.playSfx) {
        window.playSfx('zombie', 0.5);
      }

      // Check if this is a game over scene and play death sound
      if (gameState.currentScene.includes('game_over') || gameState.currentScene.includes('gameover')) {
        if (window.playSfx) window.playSfx('dead', 0.7);
      }

      if (data.onLoad) showDialogue(data.onLoad);
    } catch (error) {
      console.error('Error loading scene assets:', error);
      if (loadingScreen) loadingScreen.style.display = 'none';
      // Continue anyway to show what we can
      sceneEl.innerHTML = '';
      if (data.background) {
        sceneEl.style.backgroundImage = `url('${data.background}')`;
      }
      if (data.onLoad) showDialogue(data.onLoad);
    }
  }

  // Handle both click and touch events with debouncing
  const handleInteraction = debounce((e) => {
    const id = e.target.dataset.interactionId;
    if (!id) return;

    // Prevent default touch behavior
    e.preventDefault();

    // Play flip sound when clicking on characters/objects
    if (window.playSfx) window.playSfx('flip', 0.6);

    const data = getScene(gameState.currentScene);
    const ix = data?.interactions?.[id];
    if (ix?.type === 'dialogue') showDialogue(ix);
  }, 200);

  // Add both click and touch listeners for better mobile support
  sceneEl.addEventListener('click', handleInteraction);
  sceneEl.addEventListener('touchend', handleInteraction, { passive: false });

  // Prevent double-tap zoom on mobile
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Handle orientation changes gracefully
  let orientationChangeTimeout;
  function handleOrientationChange() {
    // Clear existing timeout
    if (orientationChangeTimeout) {
      clearTimeout(orientationChangeTimeout);
    }

    // Show loading briefly during orientation change
    if (loadingScreen) loadingScreen.style.display = 'flex';
    updateLoadingProgress(50);

    // Debounce orientation changes (some devices fire multiple events)
    orientationChangeTimeout = setTimeout(() => {
      // Force layout recalculation
      window.dispatchEvent(new Event('resize'));

      // Hide loading screen
      if (loadingScreen) {
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 300);
      }

      // Provide haptic feedback
      vibrate(10);
    }, 300);
  }

  window.addEventListener('orientationchange', handleOrientationChange);
  // Also listen to resize for better support
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Adjust dialogue box height if needed
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    }, 150);
  });

  // Set initial viewport height
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);

  console.log('✅ Engine initialization complete, starting first render...');
  renderScene();
}
