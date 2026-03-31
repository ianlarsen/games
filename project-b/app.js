const grid = document.getElementById('isometric-grid');
const viewport = document.getElementById('game-viewport');

const size = 40;
const TILE_PX = 60;

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
    building: '🏠',
    townhall: '🏛️',
    coop: '🛖',
    bridge: '🌉',
    training: '🎓',
    catch: '🕸️',
    planting: '🌱'
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

function canBuildAt(gx, gy) {
    return inBounds(gx, gy) && !isRiver(gx, gy) && !isOccupied(gx, gy);
}

function setEntityPosition(el, gx, gy, z) {
    el.style.transform = `translate3d(${gx * TILE_PX}px, ${gy * TILE_PX}px, ${z}px)`;
    el.style.zIndex = gy + 5 + Math.floor(z);
}

function createEntityElement(type, emoji) {
    const el = document.createElement('div');
    el.className = `entity ${type}`;
    el.innerHTML = `<span>${emoji}</span>`;
    return el;
}

function initWorld() {
    for (let y = 0; y < size; y++) {
        gameState.map[y * size + 20] = 1;
    }

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

    for (let i = 0; i < 400; i++) {
        const r = Math.floor(Math.random() * (size * size));
        const gx = r % size;
        const gy = Math.floor(r / size);

        if (!isRiver(gx, gy) && !isOccupied(gx, gy)) {
            createEntityAt('🌳', 'tree', gx, gy);
        }
    }

    for (let i = 0; i < 30; i++) {
        const r = Math.floor(Math.random() * (size * size));
        const gx = r % size;
        const gy = Math.floor(r / size);

        if (!isRiver(gx, gy) && !isOccupied(gx, gy)) {
            gameState.map[r] = 2;
            createEntityAt('🪨', 'mine', gx, gy);
        }
    }

    spawnWorker(18, 18);

    for (let c = 0; c < 10; c++) {
        spawnChicken();
    }

    viewport.scrollLeft = 850;
    viewport.scrollTop = 850;

    setTool('move');
    updateUI();
}

function setTool(tool) {
    gameState.currentTool = tool;

    document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));

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
    if ((tool === 'building' || tool === 'townhall' || tool === 'coop') && !canBuildAt(gx, gy)) return;

    gameState.queue.push({ type: tool, gx, gy });
    updateUI();
}

let isDown = false;
let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

viewport.addEventListener('mousedown', (e) => {
    if (gameState.currentTool !== 'move') return;
    isDown = true;
    startX = e.pageX - viewport.offsetLeft;
    startY = e.pageY - viewport.offsetTop;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
});

viewport.addEventListener('mouseleave', () => {
    isDown = false;
});

viewport.addEventListener('mouseup', () => {
    isDown = false;
});

viewport.addEventListener('mousemove', (e) => {
    if (!isDown || gameState.currentTool !== 'move') return;
    e.preventDefault();

    const x = e.pageX - viewport.offsetLeft;
    const y = e.pageY - viewport.offsetTop;

    viewport.scrollLeft = scrollLeft - (x - startX);
    viewport.scrollTop = scrollTop - (y - startY);
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
            }
        }

        else if (task.type === 'mining' && gameState.map[idx] === 2) {
            const mine = gameState.buildings.find(b => b.gx === task.gx && b.gy === task.gy && b.type === 'mine');
            if (mine) {
                mine.hp -= 1;
                gameState.gold += 5;

                if (mine.hp <= 0) {
                    mine.el.remove();
                    gameState.buildings = gameState.buildings.filter(b => b !== mine);
                    gameState.map[idx] = 0;
                }
            }
        }

        else if (task.type === 'building' && gameState.wood >= 25 && gameState.gold >= 5 && canBuildAt(task.gx, task.gy)) {
            gameState.wood -= 25;
            gameState.gold -= 5;
            createEntityAt('🏠', 'house', task.gx, task.gy);
            gameState.popCap += 3;
        }

        else if (task.type === 'catch') {
            const cIdx = gameState.chickens.findIndex(c => c.gx === task.gx && c.gy === task.gy);
            if (cIdx > -1) {
                gameState.chickens[cIdx].el.remove();
                gameState.chickens.splice(cIdx, 1);
                gameState.popCap += 1;
            }
        }

        else if (task.type === 'townhall' && gameState.wood >= 100 && canBuildAt(task.gx, task.gy)) {
            gameState.wood -= 100;
            createEntityAt('🏛️', 'townhall', task.gx, task.gy);
            gameState.townHalls++;
            gameState.popCap += 5;
        }

        else if (task.type === 'coop' && gameState.wood >= 40 && canBuildAt(task.gx, task.gy)) {
            gameState.wood -= 40;
            createEntityAt('🛖', 'coop', task.gx, task.gy);
            gameState.popCap += 2;
        }

        else if (task.type === 'training' && gameState.wood >= 50) {
            if (gameState.workers.length < gameState.popCap && !isRiver(task.gx, task.gy) && !hasBuilding(task.gx, task.gy)) {
                gameState.wood -= 50;
                spawnWorker(task.gx, task.gy);
            }
        }

        worker.busy = false;
        updateUI();
    }, 1200);
}

function processQueue() {
    if (gameState.queue.length === 0) return;
    const worker = gameState.workers.find(w => !w.busy);
    if (!worker) return;

    const task = gameState.queue.shift();
    executeTask(worker, task);
}

function spawnChicken() {
    for (let tries = 0; tries < 50; tries++) {
        const gx = Math.floor(Math.random() * size);
        const gy = Math.floor(Math.random() * size);

        if (!isRiver(gx, gy) && !isOccupied(gx, gy)) {
            const el = createEntityElement('chicken', '🐔');
            setEntityPosition(el, gx, gy, zByType.chicken);
            grid.appendChild(el);
            gameState.chickens.push({ el, gx, gy });
            return;
        }
    }
}

function createEntityAt(emoji, type, gx, gy) {
    const el = createEntityElement(type, emoji);
    setEntityPosition(el, gx, gy, zByType[type] ?? 10);
    grid.appendChild(el);

    if (type === 'tree') {
        gameState.trees.push({ el, gx, gy });
    } else if (type === 'mine') {
        gameState.buildings.push({ el, gx, gy, type: 'mine', hp: 3 });
    } else {
        gameState.buildings.push({ el, gx, gy, type });
    }
}

function spawnWorker(gx, gy) {
    const el = createEntityElement('worker', '👷');
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

initWorld();
gameLoop();