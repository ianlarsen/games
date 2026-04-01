const grid = document.getElementById('isometric-grid');
const viewport = document.getElementById('game-viewport');
const uiLayer = document.getElementById('ui-layer');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileCloseBtn = document.getElementById('mobile-close-btn');
const menuBackdrop = document.getElementById('menu-backdrop');
const statusMsg = document.getElementById('status-msg');

const size = 40;
const TILE_PX = 60;
const SAVE_KEY = 'project-b-save-v1';

const zByType = {
    worker: 25,
    chicken: 15,
    tree: 18,
    mine: 12,
    house: 14,
    coop: 14,
    townhall: 20,
    tool: 40
};

const toolIcons = {
    chopping: '🪓',
    mining: '⛏️',
    building: '🏡',
    townhall: '🏛️',
    coop: '🐓',
    bridge: '🌉',
    training: '🎖️',
    catch: '🥚',
    planting: '🌱'
};

const entityIcons = {
    worker: '🧑‍🌾',
    chicken: '🐓',
    tree: '🌲',
    mine: '⛰️',
    house: '🏡',
    coop: '🛖',
    townhall: '🏛️'
};

let gameState = {
    ox: 100,
    wood: 80,
    gold: 0,
    workers: [],
    trees: [],
    chickens: [],
    buildings: [],
    queue: [],
    currentTool: 'move',
    townHalls: 0,
    popCap: 5,
    map: new Array(size * size).fill(0)
};

let statusClearTimer;

function buildDefaultMap() {
    const map = new Array(size * size).fill(0);
    for (let y = 0; y < size; y++) {
        map[y * size + 20] = 1;
    }
    return map;
}

function saveGame() {
    const data = {
        ox: gameState.ox,
        wood: gameState.wood,
        gold: gameState.gold,
        townHalls: gameState.townHalls,
        popCap: gameState.popCap,
        map: gameState.map,
        workers: gameState.workers.map(w => ({ gx: w.gx, gy: w.gy })),
        trees: gameState.trees.map(t => ({ gx: t.gx, gy: t.gy })),
        chickens: gameState.chickens.map(c => ({ gx: c.gx, gy: c.gy })),
        buildings: gameState.buildings.map(b => ({ gx: b.gx, gy: b.gy, type: b.type, hp: b.hp ?? null })),
        queue: gameState.queue.map(q => ({ type: q.type, gx: q.gx, gy: q.gy }))
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadSavedGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;

        const data = JSON.parse(raw);
        if (!Array.isArray(data.map) || data.map.length !== size * size) return null;
        if (!Array.isArray(data.workers) || !Array.isArray(data.trees) || !Array.isArray(data.chickens)) return null;
        if (!Array.isArray(data.buildings) || !Array.isArray(data.queue)) return null;

        return data;
    } catch {
        return null;
    }
}

function getIndex(gx, gy) {
    return gy * size + gx;
}

function inBounds(gx, gy) {
    return gx >= 0 && gy >= 0 && gx < size && gy < size;
}

function isRiver(gx, gy) {
    return gameState.map[getIndex(gx, gy)] === 1;
}

function isMine(gx, gy) {
    return gameState.map[getIndex(gx, gy)] === 2;
}

function hasTree(gx, gy) {
    return gameState.trees.some(t => t.gx === gx && t.gy === gy);
}

function hasChicken(gx, gy) {
    return gameState.chickens.some(c => c.gx === gx && c.gy === gy);
}

function hasWorker(gx, gy) {
    return gameState.workers.some(w => w.gx === gx && w.gy === gy);
}

function hasBuilding(gx, gy) {
    return gameState.buildings.some(b => b.gx === gx && b.gy === gy && b.type !== 'mine');
}

function hasMineBuilding(gx, gy) {
    return gameState.buildings.some(b => b.gx === gx && b.gy === gy && b.type === 'mine');
}

function isOccupied(gx, gy) {
    return hasTree(gx, gy) || hasChicken(gx, gy) || hasWorker(gx, gy) || hasBuilding(gx, gy) || hasMineBuilding(gx, gy);
}

function isOccupiedForPlacement(gx, gy, ignoreWorker) {
    const hasBlockingWorker = gameState.workers.some(w => w !== ignoreWorker && w.gx === gx && w.gy === gy);
    return hasTree(gx, gy) || hasChicken(gx, gy) || hasBlockingWorker || hasBuilding(gx, gy) || hasMineBuilding(gx, gy);
}

function canBuildAt(gx, gy) {
    return inBounds(gx, gy) && !isRiver(gx, gy) && !isOccupied(gx, gy);
}

function canBuildAtForWorker(gx, gy, worker) {
    return inBounds(gx, gy) && !isRiver(gx, gy) && !isOccupiedForPlacement(gx, gy, worker);
}

function setStatus(message, tone = 'info') {
    if (!statusMsg) return;

    statusMsg.textContent = message;
    statusMsg.className = `status-message ${tone}`;

    clearTimeout(statusClearTimer);
    statusClearTimer = setTimeout(() => {
        statusMsg.textContent = '';
        statusMsg.className = 'status-message';
    }, 3200);
}

function getHouseFailureMessage(gx, gy) {
    if (!canBuildAt(gx, gy)) {
        return 'House needs an empty land tile.';
    }

    const missing = [];
    if (gameState.wood < 25) missing.push(`${25 - gameState.wood} more wood`);
    if (gameState.gold < 5) missing.push(`${5 - gameState.gold} more gold`);

    if (missing.length > 0) {
        return `Need ${missing.join(' and ')} to build a house.`;
    }

    return '';
}

function getTrainingFailureMessage(gx, gy) {
    if (!canBuildAt(gx, gy)) {
        return 'Training needs an empty land tile for the new worker.';
    }

    if (gameState.wood < 50) {
        return `Need ${50 - gameState.wood} more wood to train a worker.`;
    }

    if (gameState.workers.length >= gameState.popCap) {
        return 'Population cap reached. Build housing first.';
    }

    return '';
}

function setEntityPosition(el, gx, gy, z) {
    el.style.transform = `translate3d(${gx * TILE_PX}px, ${gy * TILE_PX}px, ${z}px)`;
    el.style.zIndex = gy + 5 + Math.floor(z);
}

function refreshQueueMarkers() {
    document.querySelectorAll('.queue-marker').forEach(el => el.remove());

    gameState.queue.forEach((task, idx) => {
        const marker = document.createElement('div');
        marker.className = 'queue-marker';
        marker.innerHTML = `<span>${idx + 1}</span>`;

        const markerX = (task.gx * TILE_PX) + TILE_PX - 12;
        const markerY = (task.gy * TILE_PX) + 6;
        marker.style.transform = `translate3d(${markerX}px, ${markerY}px, 48px)`;
        marker.style.zIndex = String(500 + idx);

        grid.appendChild(marker);
    });
}

function spawnFloatingText(gx, gy, text, tone = 'positive') {
    const el = document.createElement('div');
    el.className = `floating-text ${tone}`;
    el.innerHTML = `<span>${text}</span>`;
    setEntityPosition(el, gx, gy, 45);
    el.style.zIndex = String(700 + gy);
    grid.appendChild(el);
    setTimeout(() => el.remove(), 950);
}

function createEntityElement(type, emoji) {
    const el = document.createElement('div');
    el.className = `entity ${type}`;
    el.innerHTML = `<span>${emoji}</span>`;
    return el;
}

function initWorld() {
    const saved = loadSavedGame();

    gameState = {
        ox: saved?.ox ?? 100,
        wood: saved?.wood ?? 80,
        gold: saved?.gold ?? 0,
        workers: [],
        trees: [],
        chickens: [],
        buildings: [],
        queue: saved?.queue ?? [],
        currentTool: 'move',
        townHalls: saved?.townHalls ?? 0,
        popCap: saved?.popCap ?? 5,
        map: saved?.map ?? buildDefaultMap()
    };

    const frag = document.createDocumentFragment();

    for (let i = 0; i < size * size; i++) {
        const gx = i % size;
        const gy = Math.floor(i / size);

        const tile = document.createElement('div');
        tile.className = 'tile' + (gameState.map[i] === 1 ? ' river' : '');
        tile.id = `t${i}`;
        tile.dataset.gx = gx;
        tile.dataset.gy = gy;
        tile.onclick = () => handleTileClick(gx, gy);
        frag.appendChild(tile);
    }

    grid.appendChild(frag);

    if (saved) {
        saved.trees.forEach(t => createEntityAt(entityIcons.tree, 'tree', t.gx, t.gy));
        saved.buildings.forEach(b => {
            if (b.type === 'mine') {
                createEntityAt(entityIcons.mine, 'mine', b.gx, b.gy, { hp: b.hp ?? 3 });
                return;
            }

            const icon = entityIcons[b.type] || '🏗️';
            createEntityAt(icon, b.type, b.gx, b.gy);
        });

        saved.workers.forEach(w => spawnWorker(w.gx, w.gy));
        saved.chickens.forEach(c => {
            const el = createEntityElement('chicken', entityIcons.chicken);
            setEntityPosition(el, c.gx, c.gy, zByType.chicken);
            grid.appendChild(el);
            gameState.chickens.push({ el, gx: c.gx, gy: c.gy });
        });

        setStatus('Save loaded.', 'success');
    } else {
        for (let i = 0; i < 400; i++) {
            const r = Math.floor(Math.random() * (size * size));
            const gx = r % size;
            const gy = Math.floor(r / size);

            if (!isRiver(gx, gy) && !isOccupied(gx, gy)) {
                createEntityAt(entityIcons.tree, 'tree', gx, gy);
            }
        }

        for (let i = 0; i < 30; i++) {
            const r = Math.floor(Math.random() * (size * size));
            const gx = r % size;
            const gy = Math.floor(r / size);

            if (!isRiver(gx, gy) && !isOccupied(gx, gy)) {
                gameState.map[r] = 2;
                createEntityAt(entityIcons.mine, 'mine', gx, gy);
            }
        }

        spawnWorker(18, 18);

        for (let c = 0; c < 10; c++) {
            spawnChicken();
        }

        setStatus('New world created.', 'success');
    }

    viewport.scrollLeft = 850;
    viewport.scrollTop = 850;

    setTool('move');
    refreshQueueMarkers();
    updateUI();
}

function setTool(tool) {
    gameState.currentTool = tool;

    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.getElementById(`btn-${tool}`);
    if (activeBtn) activeBtn.classList.add('active');

    viewport.className = tool === 'move' ? 'move-mode' : 'action-mode';
}

function handleTileClick(gx, gy) {
    if (!gameState.currentTool || gameState.currentTool === 'move') return;
    if (!inBounds(gx, gy)) return;

    const tool = gameState.currentTool;

    if (tool === 'chopping' && !hasTree(gx, gy)) return;
    if (tool === 'mining' && !isMine(gx, gy)) return;
    if (tool === 'catch' && !hasChicken(gx, gy)) return;

    if (tool === 'building') {
        const failure = getHouseFailureMessage(gx, gy);
        if (failure) {
            setStatus(failure, 'error');
            return;
        }
    }

    if (tool === 'training') {
        const failure = getTrainingFailureMessage(gx, gy);
        if (failure) {
            setStatus(failure, 'error');
            return;
        }
    }

    if ((tool === 'townhall' || tool === 'coop') && !canBuildAt(gx, gy)) return;

    gameState.queue.push({ type: tool, gx, gy });
    if (tool === 'building') setStatus('House queued.', 'success');
    if (tool === 'training') setStatus('Worker training queued.', 'success');
    refreshQueueMarkers();
    updateUI();

    if (window.innerWidth <= 780) {
        setMobileMenuOpen(false);
    }
}

let isDown = false;
let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;
let menuSwipeStartX = 0;
let menuSwipeStartY = 0;
let menuSwiping = false;

function setMobileMenuOpen(isOpen) {
    uiLayer.classList.toggle('collapsed', !isOpen);
    menuBackdrop.classList.toggle('visible', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

function beginDrag(clientX, clientY) {
    if (gameState.currentTool !== 'move') return;
    isDown = true;
    startX = clientX;
    startY = clientY;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
}

function moveDrag(clientX, clientY) {
    if (!isDown || gameState.currentTool !== 'move') return;
    viewport.scrollLeft = scrollLeft - (clientX - startX);
    viewport.scrollTop = scrollTop - (clientY - startY);
}

function endDrag() {
    isDown = false;
}

viewport.addEventListener('mousedown', (e) => {
    beginDrag(e.pageX, e.pageY);
});

viewport.addEventListener('mouseleave', () => {
    endDrag();
});

viewport.addEventListener('mouseup', () => {
    endDrag();
});

viewport.addEventListener('mousemove', (e) => {
    if (!isDown || gameState.currentTool !== 'move') return;
    e.preventDefault();
    moveDrag(e.pageX, e.pageY);
});

viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    beginDrag(e.clientX, e.clientY);
});

viewport.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') return;
    if (!isDown) return;
    e.preventDefault();
    moveDrag(e.clientX, e.clientY);
});

viewport.addEventListener('pointerup', () => {
    endDrag();
});

viewport.addEventListener('pointercancel', () => {
    endDrag();
});

mobileMenuToggle.addEventListener('click', () => {
    const isClosed = uiLayer.classList.contains('collapsed');
    setMobileMenuOpen(isClosed);
});

mobileCloseBtn.addEventListener('click', () => {
    setMobileMenuOpen(false);
});

menuBackdrop.addEventListener('click', () => {
    setMobileMenuOpen(false);
});

uiLayer.addEventListener('touchstart', (e) => {
    if (window.innerWidth > 780) return;
    if (uiLayer.classList.contains('collapsed')) return;

    const touch = e.changedTouches[0];
    menuSwipeStartX = touch.clientX;
    menuSwipeStartY = touch.clientY;
    menuSwiping = true;
}, { passive: true });

uiLayer.addEventListener('touchend', (e) => {
    if (!menuSwiping) return;
    menuSwiping = false;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - menuSwipeStartX;
    const dy = touch.clientY - menuSwipeStartY;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);

    if (isHorizontal && dx < -50) {
        setMobileMenuOpen(false);
    }
}, { passive: true });

window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!uiLayer.classList.contains('collapsed')) {
        setMobileMenuOpen(false);
    }
});

async function executeTask(worker, task) {
    worker.busy = true;
    worker.gx = task.gx;
    worker.gy = task.gy;
    setEntityPosition(worker.el, task.gx, task.gy, zByType.worker);

    const toolEl = createEntityElement('tool-entity', toolIcons[task.type] || '🛠️');
    setEntityPosition(toolEl, task.gx, task.gy, zByType.tool);
    toolEl.style.transform = `translate3d(${(task.gx * TILE_PX) + 10}px, ${(task.gy * TILE_PX) - 10}px, ${zByType.tool}px)`;
    toolEl.style.zIndex = task.gy + 100;
    grid.appendChild(toolEl);

    setTimeout(() => {
        const idx = getIndex(task.gx, task.gy);
        toolEl.remove();

        if (task.type === 'chopping') {
            const tIdx = gameState.trees.findIndex(t => t.gx === task.gx && t.gy === task.gy);
            if (tIdx > -1) {
                gameState.trees[tIdx].el.remove();
                gameState.trees.splice(tIdx, 1);
                gameState.wood += 10;
                spawnFloatingText(task.gx, task.gy, '+10 wood', 'positive');
            }
        }

        else if (task.type === 'mining' && gameState.map[idx] === 2) {
            const mine = gameState.buildings.find(b => b.gx === task.gx && b.gy === task.gy && b.type === 'mine');
            if (mine) {
                mine.hp -= 1;
                gameState.gold += 5;
                spawnFloatingText(task.gx, task.gy, '+5 gold', 'positive');

                if (mine.hp <= 0) {
                    mine.el.remove();
                    gameState.buildings = gameState.buildings.filter(b => b !== mine);
                    gameState.map[idx] = 0;
                }
            }
        }

        else if (task.type === 'building') {
            const missing = [];
            if (gameState.wood < 25) missing.push(`${25 - gameState.wood} wood`);
            if (gameState.gold < 5) missing.push(`${5 - gameState.gold} gold`);

            if (missing.length > 0) {
                setStatus(`House failed: need ${missing.join(' and ')}.`, 'error');
            } else if (!canBuildAtForWorker(task.gx, task.gy, worker)) {
                setStatus('House failed: tile is no longer free.', 'error');
            } else {
                gameState.wood -= 25;
                gameState.gold -= 5;
                createEntityAt(entityIcons.house, 'house', task.gx, task.gy);
                gameState.popCap += 3;
                spawnFloatingText(task.gx, task.gy, '-25 wood', 'negative');
                spawnFloatingText(task.gx, task.gy, '-5 gold', 'negative');
            }
        }

        else if (task.type === 'catch') {
            const cIdx = gameState.chickens.findIndex(c => c.gx === task.gx && c.gy === task.gy);
            if (cIdx > -1) {
                gameState.chickens[cIdx].el.remove();
                gameState.chickens.splice(cIdx, 1);
                gameState.popCap += 1;
                spawnFloatingText(task.gx, task.gy, '+1 cap', 'positive');
            }
        }

        else if (task.type === 'townhall' && gameState.wood >= 100 && canBuildAtForWorker(task.gx, task.gy, worker)) {
            gameState.wood -= 100;
            createEntityAt(entityIcons.townhall, 'townhall', task.gx, task.gy);
            gameState.townHalls++;
            gameState.popCap += 5;
            spawnFloatingText(task.gx, task.gy, '-100 wood', 'negative');
        }

        else if (task.type === 'coop' && gameState.wood >= 40 && canBuildAtForWorker(task.gx, task.gy, worker)) {
            gameState.wood -= 40;
            createEntityAt(entityIcons.coop, 'coop', task.gx, task.gy);
            gameState.popCap += 2;
            spawnFloatingText(task.gx, task.gy, '-40 wood', 'negative');
        }

        else if (task.type === 'training') {
            if (gameState.wood < 50) {
                setStatus(`Training failed: need ${50 - gameState.wood} more wood.`, 'error');
            } else if (gameState.workers.length >= gameState.popCap) {
                setStatus('Training failed: population cap reached. Build housing first.', 'error');
            } else if (!canBuildAtForWorker(task.gx, task.gy, worker)) {
                setStatus('Training failed: tile is no longer free.', 'error');
            } else {
                gameState.wood -= 50;
                spawnWorker(task.gx, task.gy);
                spawnFloatingText(task.gx, task.gy, '-50 wood', 'negative');
            }
        }

        worker.busy = false;
        saveGame();
        updateUI();
    }, 1200);
}

function processQueue() {
    if (gameState.queue.length === 0) return;
    const worker = gameState.workers.find(w => !w.busy);
    if (!worker) return;

    const task = gameState.queue.shift();
    refreshQueueMarkers();
    executeTask(worker, task);
}

function spawnChicken() {
    for (let tries = 0; tries < 50; tries++) {
        const gx = Math.floor(Math.random() * size);
        const gy = Math.floor(Math.random() * size);

        if (!isRiver(gx, gy) && !isOccupied(gx, gy)) {
            const el = createEntityElement('chicken', entityIcons.chicken);
            setEntityPosition(el, gx, gy, zByType.chicken);
            grid.appendChild(el);
            gameState.chickens.push({ el, gx, gy });
            return;
        }
    }
}

function createEntityAt(emoji, type, gx, gy, options = {}) {
    const el = createEntityElement(type, emoji);
    setEntityPosition(el, gx, gy, zByType[type] ?? 10);
    grid.appendChild(el);

    if (type === 'tree') {
        gameState.trees.push({ el, gx, gy });
    } else if (type === 'mine') {
        gameState.buildings.push({ el, gx, gy, type: 'mine', hp: options.hp ?? 3 });
    } else {
        gameState.buildings.push({ el, gx, gy, type });
    }
}

function spawnWorker(gx, gy) {
    const el = createEntityElement('worker', entityIcons.worker);
    setEntityPosition(el, gx, gy, zByType.worker);
    grid.appendChild(el);
    gameState.workers.push({ el, gx, gy, busy: false });
}

function updateUI() {
    document.getElementById('ox-val').innerText = Math.floor(gameState.ox);
    document.getElementById('wood-val').innerText = gameState.wood;
    document.getElementById('gold-val').innerText = gameState.gold;
    document.getElementById('pop-val').innerText = gameState.workers.length;
    document.getElementById('cap-val').innerText = gameState.popCap;
    document.getElementById('queue-val').innerText = gameState.queue.length;
    document.getElementById('hall-val').innerText = gameState.townHalls;
}

function gameLoop() {
    processQueue();

    const oxChange = (gameState.trees.length * 0.006) - (gameState.workers.length * 0.02);
    gameState.ox = Math.min(100, Math.max(0, gameState.ox + oxChange));

    if (gameState.ox <= 0) {
        alert('Game Over: Atmosphere Lost!');
        location.reload();
        return;
    }

    requestAnimationFrame(gameLoop);
}

setInterval(updateUI, 100);
setInterval(saveGame, 5000);

window.addEventListener('beforeunload', saveGame);

setMobileMenuOpen(window.innerWidth > 780);

initWorld();
gameLoop();