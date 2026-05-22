/* Cat Match — find every cat of the chosen pose */

(() => {
  'use strict';

  const CAT_TYPES = [
    { id: 'sitting',     name: 'Sitting',      src: 'assets/cats/cat_01_sitting.png'     },
    { id: 'walking',     name: 'Walking',      src: 'assets/cats/cat_02_walking.png'     },
    { id: 'curled',      name: 'Curled',       src: 'assets/cats/cat_03_curled.png'      },
    { id: 'stretching',  name: 'Stretching',   src: 'assets/cats/cat_04_stretching.png'  },
    { id: 'lookingback', name: 'Looking Back', src: 'assets/cats/cat_05_lookingback.png' },
    { id: 'loaf',        name: 'Loaf',         src: 'assets/cats/cat_06_loaf.png'        },
    { id: 'pouncing',    name: 'Pouncing',     src: 'assets/cats/cat_07_pouncing.png'    },
    { id: 'grooming',    name: 'Grooming',     src: 'assets/cats/cat_08_grooming.png'    },
  ];

  const CAT_BOX = 80;
  const SCENE_PAD = 2;
  const TAP_HIT_PAD = 1.12;
  const SAVE_KEY = 'catmatch.settings.v1';

  const DEFAULT_LEVEL = {
    targetCount: 8,
    rotMax: 120,
  };

  function loadCatImages() {
    return Promise.all(
      CAT_TYPES.map(
        type =>
          new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
              type.image = img;
              type.aspect = img.naturalWidth / img.naturalHeight;
              resolve();
            };
            img.onerror = () => {
              console.warn('Failed to load cat image:', type.src);
              type.image = null;
              type.aspect = 1;
              resolve();
            };
            img.src = type.src;
          })
      )
    );
  }

  function spriteSize(type, scale = 1) {
    const aspect = type.aspect || 1;
    const box = CAT_BOX * scale;
    if (aspect >= 1) {
      return { w: box, h: box / aspect };
    }
    return { w: box * aspect, h: box };
  }

  function outerHalfExtents(type, scale, rotation) {
    const { w, h } = spriteSize(type, scale);
    const c = Math.abs(Math.cos(rotation));
    const s = Math.abs(Math.sin(rotation));
    return {
      hw: (c * w + s * h) / 2,
      hh: (s * w + c * h) / 2,
    };
  }

  const stage = document.getElementById('stage');
  const ctx = stage.getContext('2d');
  const refbar = document.getElementById('refbar');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayBody = document.getElementById('overlayBody');
  const overlayNext = document.getElementById('overlayNext');
  const newLevelBtn = document.getElementById('newLevel');
  const statusEl = document.getElementById('status');
  const catPicker = document.getElementById('catPicker');
  const catPickerBtn = document.getElementById('catPickerBtn');
  const catPickerMenu = document.getElementById('catPickerMenu');
  const catPickerThumb = document.getElementById('catPickerThumb');
  const catPickerName = document.getElementById('catPickerName');
  const sndTap = document.getElementById('snd-tap');
  const sndWin = document.getElementById('snd-win');

  function playTap() {
    if (!sndTap) return;
    sndTap.currentTime = 0;
    sndTap.play().catch(() => {});
  }

  function playWin() {
    if (!sndWin) return;
    sndWin.currentTime = 0;
    sndWin.play().catch(() => {});
  }

  const STATE = {
    width: 0,
    height: 0,
    dpr: 1,
    cats: [],
    level: null,
    mistaps: 0,
    catScale: 1.0,
    done: false,
    targetTypeId: 'sitting',
    pickerOpen: false,
  };

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 50));
  stage.addEventListener('pointerdown', onPointerDown, { passive: false });
  newLevelBtn.addEventListener('click', () => startLevel(buildLevel(STATE.targetTypeId)));
  overlayNext.addEventListener('click', () => startLevel(buildLevel(STATE.targetTypeId)));

  catPickerBtn.addEventListener('click', () => {
    setPickerOpen(!STATE.pickerOpen);
  });

  document.addEventListener('pointerdown', ev => {
    if (!STATE.pickerOpen) return;
    if (catPicker.contains(ev.target)) return;
    setPickerOpen(false);
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') setPickerOpen(false);
  });

  STATE.targetTypeId = loadSettings().lastTargetTypeId;
  resize();
  setStatus('Loading cats...');
  loadCatImages().then(() => {
    buildCatPicker();
    updatePickerDisplay(STATE.targetTypeId);
    startLevel(buildLevel(STATE.targetTypeId));
    loop();
  });

  function buildLevel(targetTypeId) {
    return {
      targetTypeId,
      targetCount: DEFAULT_LEVEL.targetCount,
      distractorCount: 0,
      rotMax: DEFAULT_LEVEL.rotMax,
    };
  }

  function levelForScreen(template) {
    const capacity = estimateSceneCapacity();
    const targetCount = Math.min(template.targetCount, capacity);
    return {
      ...template,
      targetCount,
      distractorCount: Math.max(0, capacity - targetCount),
    };
  }

  function estimateSceneCapacity() {
    if (STATE.width < 1 || STATE.height < 1) return 24;
    const pad = SCENE_PAD;
    const usableW = STATE.width - pad * 2;
    const usableH = STATE.height - pad * 2;
    let sumW = 0;
    let sumH = 0;
    for (const type of CAT_TYPES) {
      const { hw, hh } = outerHalfExtents(type, 1, Math.PI / 5);
      sumW += hw * 2;
      sumH += hh * 2;
    }
    const avgW = sumW / CAT_TYPES.length;
    const avgH = sumH / CAT_TYPES.length;
    const cols = Math.max(2, Math.floor(usableW / avgW));
    const rows = Math.max(2, Math.floor(usableH / avgH));
    return Math.max(12, cols * rows);
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { lastTargetTypeId: CAT_TYPES[0].id };
      const data = JSON.parse(raw);
      const valid = CAT_TYPES.some(t => t.id === data.lastTargetTypeId);
      return { lastTargetTypeId: valid ? data.lastTargetTypeId : CAT_TYPES[0].id };
    } catch {
      return { lastTargetTypeId: CAT_TYPES[0].id };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ lastTargetTypeId: STATE.targetTypeId })
      );
    } catch {
      /* ignore */
    }
  }

  function buildCatPicker() {
    catPickerMenu.innerHTML = '';
    for (const type of CAT_TYPES) {
      const li = document.createElement('li');
      li.className = 'cat-picker-option';
      li.role = 'option';
      li.dataset.typeId = type.id;
      li.setAttribute('aria-selected', type.id === STATE.targetTypeId ? 'true' : 'false');

      const img = document.createElement('img');
      img.src = type.src;
      img.alt = '';
      img.width = 44;
      img.height = 44;

      const label = document.createElement('span');
      label.className = 'cat-picker-option-name';
      label.textContent = type.name;

      li.append(img, label);
      li.addEventListener('click', () => selectCatType(type.id));
      catPickerMenu.appendChild(li);
    }
  }

  function selectCatType(typeId) {
    if (typeId === STATE.targetTypeId && !STATE.done) {
      setPickerOpen(false);
      return;
    }
    STATE.targetTypeId = typeId;
    saveSettings();
    updatePickerDisplay(typeId);
    setPickerOpen(false);
    startLevel(buildLevel(typeId));
  }

  function updatePickerDisplay(typeId) {
    const type = catType(typeId);
    if (!type) return;
    catPickerThumb.src = type.src;
    catPickerThumb.alt = type.name;
    catPickerName.textContent = type.name;
    catPickerMenu.querySelectorAll('.cat-picker-option').forEach(el => {
      const selected = el.dataset.typeId === typeId;
      el.setAttribute('aria-selected', selected ? 'true' : 'false');
      el.classList.toggle('is-selected', selected);
    });
  }

  function setPickerOpen(open) {
    STATE.pickerOpen = open;
    catPickerMenu.hidden = !open;
    catPickerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    catPicker.classList.toggle('is-open', open);
  }

  function startLevel(level) {
    level = levelForScreen(level);
    STATE.targetTypeId = level.targetTypeId;
    STATE.level = level;
    STATE.mistaps = 0;
    STATE.done = false;
    overlay.hidden = true;
    saveSettings();
    updatePickerDisplay(level.targetTypeId);

    const scale = 1;
    STATE.catScale = scale;
    STATE.cats = placeCats(level, scale);
    renderRefbar(level);
    const targetName = catType(level.targetTypeId).name;
    setStatus(`Find every ${targetName} cat. Tap only that pose.`);
  }

  function placeCats(level, scale) {
    const typeIds = [];
    for (let i = 0; i < level.targetCount; i++) typeIds.push(level.targetTypeId);
    for (let i = 0; i < level.distractorCount; i++) {
      typeIds.push(pickDistractorType(level.targetTypeId));
    }
    shuffle(typeIds);

    const pad = SCENE_PAD;
    const maxX = STATE.width - pad;
    let cursorX = pad;
    let cursorY = pad;
    let rowMaxH = 0;
    const list = [];

    for (const typeId of typeIds) {
      const type = catType(typeId);
      const rotDeg = randRange(-level.rotMax, level.rotMax);
      const rotation = (rotDeg * Math.PI) / 180;
      const { hw, hh } = outerHalfExtents(type, scale, rotation);
      const w = hw * 2;
      const h = hh * 2;

      if (cursorX + w > maxX && cursorX > pad) {
        cursorX = pad;
        cursorY += rowMaxH;
        rowMaxH = 0;
      }
      if (cursorY + h > STATE.height - pad) break;

      list.push({
        typeId,
        x: cursorX + hw,
        y: cursorY + hh,
        rotation,
        hw,
        hh,
        z: 0,
        scale,
        found: false,
      });

      cursorX += w;
      rowMaxH = Math.max(rowMaxH, h);
    }

    shuffle(list);
    list.forEach((c, i) => (c.z = i));
    return list;
  }

  function pickDistractorType(excludeId) {
    const others = CAT_TYPES.filter(t => t.id !== excludeId);
    return others[Math.floor(Math.random() * others.length)].id;
  }

  function loop() {
    render();
    requestAnimationFrame(loop);
  }

  function render() {
    ctx.clearRect(0, 0, stage.width, stage.height);
    const sorted = STATE.cats.slice().sort((a, b) => a.z - b.z);
    for (const cat of sorted) {
      drawWorldCat(ctx, cat);
    }
  }

  function drawWorldCat(ctx, cat) {
    const type = catType(cat.typeId);
    if (!type || !type.image) return;
    ctx.save();
    ctx.translate(cat.x, cat.y);
    ctx.rotate(cat.rotation);
    ctx.scale(cat.scale, cat.scale);
    drawCatSprite(ctx, type, cat.found);
    if (cat.found) {
      drawPawStamp(ctx);
    }
    ctx.restore();
  }

  function drawCatSprite(ctx, type, dim) {
    const { w, h } = spriteSize(type);
    if (dim) ctx.globalAlpha = 0.4;
    ctx.drawImage(type.image, -w / 2, -h / 2, w, h);
    if (dim) ctx.globalAlpha = 1;
  }

  function drawPawStamp(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#ff5a3d';
    ctx.strokeStyle = '#a23018';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const a = -1.3 + i * 0.6;
      const px = Math.cos(a) * 11;
      const py = -10 + Math.sin(a) * 5;
      ctx.beginPath();
      ctx.ellipse(px, py, 3.2, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderRefbar(level) {
    refbar.innerHTML = '';
    const type = catType(level.targetTypeId);
    const total = level.targetCount;
    const tile = document.createElement('div');
    tile.className = 'ref-tile';
    tile.dataset.typeId = type.id;

    const c = document.createElement('canvas');
    c.width = 88;
    c.height = 88;
    const cx = c.getContext('2d');
    if (type.image) {
      const { w, h } = spriteSize(type);
      const fit = Math.min(80 / w, 80 / h);
      const dw = w * fit;
      const dh = h * fit;
      cx.drawImage(type.image, (88 - dw) / 2, (88 - dh) / 2, dw, dh);
    }
    tile.appendChild(c);

    const nums = document.createElement('div');
    nums.className = 'nums';
    const found = document.createElement('div');
    found.className = 'found';
    found.textContent = `0/${total}`;
    const totalEl = document.createElement('div');
    totalEl.className = 'total';
    totalEl.textContent = type.name;
    nums.append(found, totalEl);
    tile.appendChild(nums);
    refbar.appendChild(tile);
    updateRefbar();
  }

  function updateRefbar() {
    const counts = countsByType();
    const tiles = refbar.querySelectorAll('.ref-tile');
    tiles.forEach(tile => {
      const id = tile.dataset.typeId;
      const c = counts[id] || { found: 0, total: 0 };
      tile.querySelector('.found').textContent = `${c.found}/${c.total}`;
      tile.classList.toggle('complete', c.total > 0 && c.found === c.total);
    });
  }

  function countsByType() {
    const targetId = STATE.level?.targetTypeId;
    const out = {};
    for (const cat of STATE.cats) {
      if (targetId && cat.typeId !== targetId) continue;
      const k = cat.typeId;
      if (!out[k]) out[k] = { found: 0, total: 0 };
      out[k].total++;
      if (cat.found) out[k].found++;
    }
    return out;
  }

  function onPointerDown(ev) {
    ev.preventDefault();
    if (STATE.done) return;
    const rect = stage.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (stage.width / rect.width) / STATE.dpr;
    const y = (ev.clientY - rect.top) * (stage.height / rect.height) / STATE.dpr;
    const hit = hitTest(x, y);
    if (hit && !hit.found) {
      if (hit.typeId !== STATE.level.targetTypeId) {
        STATE.mistaps++;
        flashStatus('Different cat — keep looking!');
        return;
      }
      hit.found = true;
      playTap();
      bringToFront(hit);
      updateRefbar();
      if (allFound()) finishLevel();
    } else if (!hit) {
      STATE.mistaps++;
      flashStatus('Not a cat.');
    }
  }

  function hitTest(x, y) {
    const sorted = STATE.cats.slice().sort((a, b) => b.z - a.z);
    for (const cat of sorted) {
      const type = catType(cat.typeId);
      if (!type) continue;
      const dx = x - cat.x;
      const dy = y - cat.y;
      const cos = Math.cos(-cat.rotation);
      const sin = Math.sin(-cat.rotation);
      const lx = (dx * cos - dy * sin) / cat.scale;
      const ly = (dx * sin + dy * cos) / cat.scale;
      const { w, h } = spriteSize(type);
      const a = (w / 2) * TAP_HIT_PAD;
      const b = (h / 2) * TAP_HIT_PAD;
      if ((lx * lx) / (a * a) + (ly * ly) / (b * b) <= 1) {
        return cat;
      }
    }
    return null;
  }

  function bringToFront(cat) {
    const maxZ = STATE.cats.reduce((m, c) => Math.max(m, c.z), 0);
    cat.z = maxZ + 1;
  }

  function allFound() {
    const targetId = STATE.level.targetTypeId;
    return STATE.cats
      .filter(c => c.typeId === targetId)
      .every(c => c.found);
  }

  function finishLevel() {
    STATE.done = true;
    const name = catType(STATE.level.targetTypeId).name;
    overlayTitle.textContent = 'All cats found!';
    overlayBody.textContent = `You found every ${name} cat.`;
    overlay.hidden = false;
    playWin();
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    STATE.dpr = dpr;
    const wrap = document.getElementById('stageWrap');
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    STATE.width = w;
    STATE.height = h;
    stage.width = w * dpr;
    stage.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (STATE.cats.length && STATE.level) {
      const level = levelForScreen(buildLevel(STATE.level.targetTypeId));
      STATE.level = level;
      const scale = 1;
      STATE.catScale = scale;
      const foundCount = countsByType()[level.targetTypeId]?.found || 0;
      STATE.cats = placeCats(level, scale);
      let need = foundCount;
      for (const c of STATE.cats) {
        if (need <= 0) break;
        if (c.typeId === level.targetTypeId) {
          c.found = true;
          need--;
        }
      }
      updateRefbar();
      if (allFound() && !STATE.done) finishLevel();
    }
  }

  function catType(id) {
    return CAT_TYPES.find(t => t.id === id);
  }

  function randRange(a, b) {
    return a + Math.random() * (b - a);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  let flashTimer = 0;
  function flashStatus(msg) {
    setStatus(msg);
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      const name = catType(STATE.level.targetTypeId).name;
      setStatus(`Find every ${name} cat. Tap only that pose.`);
    }, 900);
  }
})();
