import { getScene } from './registry.js';

export function initEngine({ startScene }) {
  const sceneEl = document.getElementById('scene');
  const dialogueBoxEl = document.getElementById('dialogue-box');
  const dialogueTextEl = document.getElementById('dialogue-text');
  const choicesBoxEl = document.getElementById('choices-box');

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

  function renderScene() {
    const data = getScene(gameState.currentScene);
    if (!data) { console.error('Scene not found:', gameState.currentScene); return; }

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
  }

  sceneEl.addEventListener('click', (e) => {
    const id = e.target.dataset.interactionId;
    if (!id) return;

    // Play flip sound when clicking on characters/objects
    if (window.playSfx) window.playSfx('flip', 0.6);

    const data = getScene(gameState.currentScene);
    const ix = data?.interactions?.[id];
    if (ix?.type === 'dialogue') showDialogue(ix);
  });

  renderScene();
}
