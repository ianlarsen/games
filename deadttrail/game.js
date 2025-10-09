/*
 * Dead Trail – a lightweight, browser‑only prototype.
 *
 * This script implements a tiny state machine to drive the
 * Oregon Trail–inspired gameplay.  It loads images with
 * graceful fallbacks, presents events to the player, tracks
 * a simple ``trust`` resource and advances through a list of
 * pre‑defined events.  Add additional events to the ``events``
 * array to flesh out your story.
 */

// Grab the container element.  All UI will be rendered
// relative to this element.
const gameElement = document.getElementById('game');

// Game state.  You can expand this object with additional
// resources (food, ammo, etc.) as needed.
const gameState = {
  started: false,
  eventIndex: 0,
  resources: {
    trust: 0,
  },
};

/**
 * Create a simple placeholder graphic using the Canvas API.
 * The placeholder displays the provided label centered on a
 * dark rectangle.  This is used when an image fails to load.
 *
 * @param {string} label Text to display inside the placeholder.
 * @param {number} width Desired width of the placeholder.
 * @param {number} height Desired height of the placeholder.
 * @returns {HTMLCanvasElement} A canvas element containing the placeholder.
 */
function createPlaceholder(label, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // background
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, width, height);
  // border
  ctx.strokeStyle = '#666';
  ctx.strokeRect(0, 0, width - 1, height - 1);
  // label
  ctx.fillStyle = '#aaa';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, width / 2, height / 2);
  return canvas;
}

/**
 * Attempt to load an image from a path and fall back to a
 * generated placeholder if the load fails.  Returns a promise
 * that resolves to an HTMLImageElement or a canvas placeholder.
 *
 * @param {string} src Path to the image file (relative to ``index.html``).
 * @param {string} label A short description used on the placeholder.
 * @param {number} width Desired width of the image/placeholder.
+ * @param {number} height Desired height of the image/placeholder.
 * @returns {Promise<HTMLImageElement|HTMLCanvasElement>}
 */
function loadImageWithFallback(src, label, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    img.width = width;
    img.height = height;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(createPlaceholder(label, width, height));
    img.src = src;
  });
}

/**
 * Render the heads‑up display (HUD).  This shows the player's
 * current resources.  If the HUD doesn't exist yet it will
 * be created; otherwise its contents are updated.
 */
function renderHUD() {
  let hud = document.getElementById('hud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'hud';
    // Insert the HUD at the top of the game element.
    gameElement.prepend(hud);
  }
  const { trust } = gameState.resources;
  hud.textContent = `Trust: ${trust}`;
}

/**
 * Define the sequence of events for the prototype.  Each event
 * contains a prompt, a speaker/line pair, an optional image and
 * a set of choices.  Each choice specifies a label and a set
 * of effects applied to the game state when chosen.
 *
 * Feel free to extend this array with additional events from
 * your story bible.  Keep in mind that the trust resource is
 * just an example; you can add other metrics as you see fit.
 */
const events = [
  {
    prompt: 'A Roomba thunks the same wall.  Microwave dings somewhere.',
    speaker: 'Ed',
    line: 'At least the Roombas don’t eat people.',
    image: 'images/events/RoombaGag.png',
    choices: [
      { label: 'Let Ed tinker', effects: { trust: 1 } },
      { label: 'Ignore it', effects: { trust: -1 } },
    ],
  },
  {
    prompt: 'You catch a glint—Jamaal signalling toward the treeline.',
    speaker: 'John',
    line: 'We can argue about titles, or we can survive.',
    image: 'images/events/JamaalSignal.png',
    choices: [
      { label: 'Confront Jamaal', effects: { trust: -1 } },
      { label: 'Watch quietly', effects: { trust: 1 } },
    ],
  },
  // Add more events here as needed.
];

/**
 * Display the title screen.  From here the player can begin
 * their journey.  Starting the game resets the state and
 * advances to the first event.
 */
function showTitle() {
  gameElement.innerHTML = '';
  // Remove the HUD when returning to the title.
  const hud = document.getElementById('hud');
  if (hud) hud.remove();
  const title = document.createElement('h1');
  title.textContent = 'Dead Trail';
  const subtitle = document.createElement('p');
  subtitle.textContent = 'An Oregon Trail–style survival game';
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start Game';
  startBtn.onclick = () => {
    gameState.started = true;
    gameState.eventIndex = 0;
    gameState.resources.trust = 0;
    showNextEvent();
  };
  gameElement.appendChild(title);
  gameElement.appendChild(subtitle);
  gameElement.appendChild(startBtn);
}

/**
 * Advance to the next event or show the ending when the
 * sequence is exhausted.
 */
async function showNextEvent() {
  gameElement.innerHTML = '';
  renderHUD();
  if (gameState.eventIndex >= events.length) {
    // All events exhausted – simple ending for now.
    const endMsg = document.createElement('p');
    endMsg.textContent = 'The journey continues…';
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Restart';
    restartBtn.onclick = showTitle;
    gameElement.appendChild(endMsg);
    gameElement.appendChild(restartBtn);
    return;
  }
  const event = events[gameState.eventIndex];
  // Load the image with a graceful fallback.  Use a default
  // width/height; these can be tuned for your art.
  const media = await loadImageWithFallback(event.image, 'Event', 800, 360);
  const promptEl = document.createElement('p');
  promptEl.textContent = event.prompt;
  const lineEl = document.createElement('p');
  lineEl.textContent = `${event.speaker}: "${event.line}"`;

  const choicesContainer = document.createElement('div');
  choicesContainer.className = 'choices';
  event.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.textContent = choice.label;
    btn.onclick = () => {
      // Apply each effect in this choice.  Only numeric values
      // are supported in this simple example.
      Object.entries(choice.effects).forEach(([key, delta]) => {
        gameState.resources[key] = (gameState.resources[key] || 0) + delta;
      });
      gameState.eventIndex += 1;
      showNextEvent();
    };
    choicesContainer.appendChild(btn);
  });
  gameElement.appendChild(media);
  gameElement.appendChild(promptEl);
  gameElement.appendChild(lineEl);
  gameElement.appendChild(choicesContainer);
}

// Kick off the title screen when the script loads.
showTitle();