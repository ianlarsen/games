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

// Lazy load images
function lazyLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function initEngine({ startScene }) {
  const sceneEl = document.getElementById('scene');
  const dialogueBoxEl = document.getElementById('dialogue-box');
  const dialogueTextEl = document.getElementById('dialogue-text');
  const choicesBoxEl = document.getElementById('choices-box');
  const loadingScreen = document.getElementById('loading-screen');

  const gameState = {
    currentScene: startScene,
    flags: {}
  };
  window.gameState = gameState; // handy for console debugging

  function showDialogue(dialogueData) {
    if (dialogueData.sfx && window.playSfx) window.playSfx(dialogueData.sfx, dialogueData.sfxVol ?? 0.7);

    dialogueTextEl.innerText = dialogueData.text || '';
    choicesBoxEl.innerHTML = '';

    (dialogueData.choices || []).forEach(choice => {
      const btn = document.createElement('button');
      btn.innerText = choice.text;
      btn.className = 'choice-btn';
      btn.onclick = () => {
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
      };
      choicesBoxEl.appendChild(btn);
    });

    dialogueBoxEl.style.display = 'block';
  }

  async function renderScene() {
    const data = getScene(gameState.currentScene);
    if (!data) {
      console.error('Scene not found:', gameState.currentScene);
      if (loadingScreen) loadingScreen.style.display = 'none';
      return;
    }

    // Show loading screen while assets load
    if (loadingScreen) loadingScreen.style.display = 'flex';

    try {
      // Preload background image
      if (data.background) {
        await lazyLoadImage(data.background);
      }

      // Preload all character and object images
      const imagePromises = [];
      (data.characters || []).forEach(c => {
        if (c.asset) imagePromises.push(lazyLoadImage(c.asset));
      });
      (data.objects || []).forEach(o => {
        if (o.asset) imagePromises.push(lazyLoadImage(o.asset));
      });

      await Promise.all(imagePromises);

      // Hide loading screen
      if (loadingScreen) loadingScreen.style.display = 'none';

      sceneEl.innerHTML = '';
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

  renderScene();
}
