// dead trail storyboard viewer - fixed version
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const titleEl = document.getElementById('scene-title');
const captionEl = document.getElementById('caption');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const errorDisplay = document.getElementById('error-display');

let manifest = null;
let currentIndex = 0;
let imageCache = new Map();
let selectedLayer = 0;
let talkToggle = false;

// show errors to user
function showError(message) {
  console.error(message);
  errorDisplay.textContent = message;
  errorDisplay.style.display = 'block';
  setTimeout(() => {
    errorDisplay.style.display = 'none';
  }, 5000);
}

// load json
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`failed to load ${url}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    showError(`error loading scenes.json: ${error.message}`);
    throw error;
  }
}

// load image with caching
function loadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`loaded: ${src}`);
      resolve(img);
    };
    
    img.onerror = () => {
      console.error(`failed to load: ${src}`);
      // create red placeholder instead of failing
      const placeholder = document.createElement('canvas');
      placeholder.width = 100;
      placeholder.height = 100;
      const pctx = placeholder.getContext('2d');
      pctx.fillStyle = '#ff0000';
      pctx.fillRect(0, 0, 100, 100);
      pctx.fillStyle = '#ffffff';
      pctx.font = '12px monospace';
      pctx.fillText('missing', 10, 50);
      resolve(placeholder);
    };
    
    img.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

// preload scene images
async function preloadScene(scene) {
  const images = [scene.bg];
  if (scene.layers) {
    for (const layer of scene.layers) {
      images.push(layer.img);
      if (layer.mouth_open) images.push(layer.mouth_open);
    }
  }
  
  try {
    await Promise.all(images.map(loadImage));
  } catch (error) {
    console.warn('some images failed to load, using placeholders');
  }
}

// draw the current scene
async function drawScene(index) {
  const scene = manifest.scenes[index];
  if (!scene) {
    showError('scene not found');
    return;
  }

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    // draw background
    const bg = await loadImage(scene.bg);
    if (bg.width && bg.height) {
      // fit to canvas
      const scale = Math.max(canvas.width / bg.width, canvas.height / bg.height);
      const bw = bg.width * scale;
      const bh = bg.height * scale;
      const bx = (canvas.width - bw) / 2;
      const by = (canvas.height - bh) / 2;
      ctx.drawImage(bg, bx, by, bw, bh);
    }

    // draw layers
    if (scene.layers) {
      for (let i = 0; i < scene.layers.length; i++) {
        const layer = scene.layers[i];
        
        // check for mouth toggle
        let imgSrc = layer.img;
        if (talkToggle && layer.mouth_open) {
          imgSrc = layer.mouth_open;
        }
        
        const img = await loadImage(imgSrc);
        const scale = layer.scale || 1;
        const x = layer.x || 0;
        const y = layer.y || 0;
        const alpha = layer.alpha || 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (layer.flip) {
          // flip horizontally
          ctx.translate(x + img.width * scale, y);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
        } else {
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }

        // highlight selected layer
        if (i === selectedLayer) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#00ffff';
          const rectX = layer.flip ? 0 : x;
          const rectY = y;
          ctx.fillRect(rectX, rectY, img.width * scale, img.height * scale);
        }

        ctx.restore();
      }
    }

  } catch (error) {
    showError(`error drawing scene: ${error.message}`);
  }

  // update ui
  titleEl.textContent = `${index + 1}/${manifest.scenes.length} - ${scene.title}`;
  captionEl.textContent = scene.caption || '';
  
  // update button states
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === manifest.scenes.length - 1;
}

// navigate scenes
function navigate(delta) {
  const newIndex = currentIndex + delta;
  if (newIndex >= 0 && newIndex < manifest.scenes.length) {
    currentIndex = newIndex;
    selectedLayer = 0;
    drawScene(currentIndex);
  }
}

// keyboard controls
function handleKeyboard(event) {
  const scene = manifest?.scenes[currentIndex];
  if (!scene) return;

  switch(event.key) {
    case 'ArrowLeft':
      navigate(-1);
      break;
      
    case 'ArrowRight':
      navigate(1);
      break;
      
    case 'Tab':
      event.preventDefault();
      if (scene.layers && scene.layers.length > 0) {
        selectedLayer = (selectedLayer + 1) % scene.layers.length;
        drawScene(currentIndex);
      }
      break;
      
    case 'f':
    case 'F':
      if (scene.layers && scene.layers[selectedLayer]) {
        scene.layers[selectedLayer].flip = !scene.layers[selectedLayer].flip;
        drawScene(currentIndex);
      }
      break;
      
    case '+':
    case '=':
      if (scene.layers && scene.layers[selectedLayer]) {
        const layer = scene.layers[selectedLayer];
        layer.scale = (layer.scale || 1) * 1.1;
        drawScene(currentIndex);
      }
      break;
      
    case '-':
    case '_':
      if (scene.layers && scene.layers[selectedLayer]) {
        const layer = scene.layers[selectedLayer];
        layer.scale = (layer.scale || 1) / 1.1;
        drawScene(currentIndex);
      }
      break;
      
    case 'm':
    case 'M':
      talkToggle = !talkToggle;
      drawScene(currentIndex);
      break;
  }
}

// button clicks
prevBtn.addEventListener('click', () => navigate(-1));
nextBtn.addEventListener('click', () => navigate(1));

// keyboard events
window.addEventListener('keydown', handleKeyboard);

// start the app
async function init() {
  try {
    titleEl.textContent = 'loading scenes...';
    
    // load manifest
    manifest = await loadJSON('scenes.json');
    
    if (!manifest || !manifest.scenes || manifest.scenes.length === 0) {
      throw new Error('invalid or empty scenes.json');
    }
    
    console.log(`loaded ${manifest.scenes.length} scenes`);
    
    // preload first scene
    await preloadScene(manifest.scenes[0]);
    
    // draw first scene
    await drawScene(0);
    
    // preload other scenes in background
    setTimeout(() => {
      for (let i = 1; i < manifest.scenes.length; i++) {
        preloadScene(manifest.scenes[i]);
      }
    }, 100);
    
  } catch (error) {
    showError(`failed to initialize: ${error.message}`);
    titleEl.textContent = 'error loading scenes';
  }
}

// start when page loads
init();