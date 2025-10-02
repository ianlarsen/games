// Dead Trail – Mobile-Friendly Episode 1
const $ = sel => document.querySelector(sel);
const canvas = $("#game"), ctx = canvas.getContext("2d");
const dlgBox = $("#dialogue"), dlgText = $("#dialogue-text");
const tooltip = $("#tooltip");
const heartsEl = $("#hearts"), invEl = $("#inventory");
const music = $("#music");

canvas.imageSmoothingEnabled = false;

let manifest, scene, current = null;
let keys = {}, images = new Map();
let talkOpen = false, talkQueue = [], talkIndex = 0;
let state = {
  sceneId: null, x: 0, y: 0, vx: 0, vy: 0, facing: 1,
  hp: 3, inventory: { cracker:0 },
  flags: { carol_trust:0 }, muted: false, iFrames: 0,
  attackCooldown: 0
};

// Mobile controls
let touchControls = {
  moveLeft: false,
  moveRight: false,
  interact: false,
  attack: false
};

// Roomba easter egg
let roombaGag = {
  x: -100, y: 0, vx: 2, sprite: null, 
  nextTrigger: Date.now() + Math.random() * 30000 + 20000,
  active: false, shown: false
};

// Audio system
let audioEnabled = false;
function playDialogueAudio(characterId, lineNum) {
  if (!audioEnabled) return;
  const audio = new Audio(`assets/audio/dialogue/${characterId}_${lineNum}.mp3`);
  audio.volume = 0.7;
  audio.play().catch(()=>{});
}

// ---- helpers ----
function loadJSON(u){ return fetch(u).then(r=>{ if(!r.ok) throw new Error(u+" "+r.status); return r.json(); }); }
function loadImg(src){
  if(images.has(src)) return images.get(src);
  const p = new Promise(res=>{
    const i = new Image();
    i.onload = ()=>res(i);
    i.onerror = ()=>{ 
      const c=document.createElement('canvas');
      c.width=32;c.height=32;
      const x=c.getContext('2d');
      x.fillStyle='#f00';
      x.fillRect(0,0,32,32);
      res(c); 
    };
    i.src = src;
  });
  images.set(src,p); return p;
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rect=(x,y,w,h)=>({x,y,w,h});
const hit=(a,b)=>!(a.x+a.w<b.x || b.x+b.w<a.x || a.y+a.h<b.y || b.y+b.h<a.y);

// ---- Mobile Touch Controls ----
function createMobileControls(){
  const controlsHTML = `
    <div id="mobile-controls" style="position: fixed; bottom: 20px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; pointer-events: none; z-index: 1000;">
      <div style="display: flex; gap: 10px; pointer-events: auto;">
        <button id="btn-left" style="width: 60px; height: 60px; font-size: 24px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: 2px solid #fff;">←</button>
        <button id="btn-right" style="width: 60px; height: 60px; font-size: 24px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: 2px solid #fff;">→</button>
      </div>
      <div style="display: flex; gap: 10px; pointer-events: auto;">
        <button id="btn-interact" style="width: 60px; height: 60px; font-size: 18px; border-radius: 50%; background: rgba(0,255,0,0.7); color: white; border: 2px solid #fff;">E</button>
        <button id="btn-attack" style="width: 60px; height: 60px; font-size: 18px; border-radius: 50%; background: rgba(255,0,0,0.7); color: white; border: 2px solid #fff;">⚔</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', controlsHTML);
  
  // Left button
  $('#btn-left').addEventListener('touchstart', (e)=>{e.preventDefault(); touchControls.moveLeft=true;});
  $('#btn-left').addEventListener('touchend', (e)=>{e.preventDefault(); touchControls.moveLeft=false;});
  $('#btn-left').addEventListener('mousedown', ()=>touchControls.moveLeft=true);
  $('#btn-left').addEventListener('mouseup', ()=>touchControls.moveLeft=false);
  
  // Right button
  $('#btn-right').addEventListener('touchstart', (e)=>{e.preventDefault(); touchControls.moveRight=true;});
  $('#btn-right').addEventListener('touchend', (e)=>{e.preventDefault(); touchControls.moveRight=false;});
  $('#btn-right').addEventListener('mousedown', ()=>touchControls.moveRight=true);
  $('#btn-right').addEventListener('mouseup', ()=>touchControls.moveRight=false);
  
  // Interact button
  $('#btn-interact').addEventListener('touchstart', (e)=>{e.preventDefault(); touchControls.interact=true; handleInteract();});
  $('#btn-interact').addEventListener('touchend', (e)=>{e.preventDefault(); touchControls.interact=false;});
  $('#btn-interact').addEventListener('click', ()=>handleInteract());
  
  // Attack button
  $('#btn-attack').addEventListener('touchstart', (e)=>{e.preventDefault(); touchControls.attack=true; attackZombies();});
  $('#btn-attack').addEventListener('touchend', (e)=>{e.preventDefault(); touchControls.attack=false;});
  $('#btn-attack').addEventListener('click', ()=>attackZombies());
}

// Canvas tap to interact with nearby NPCs/items
canvas.addEventListener('click', (e) => {
  if(talkOpen) return;
  const rect = canvas.getBoundingClientRect();
  const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  
  // Check if clicked near an actor
  for(const a of current.actors || []){
    if(!a.talkable) continue;
    const scale = 0.5;
    const ax = a.x;
    const ay = 580 - (a.h * scale);
    const aw = a.w * scale;
    const ah = a.h * scale;
    
    if(clickX >= ax && clickX <= ax + aw && clickY >= ay && clickY <= ay + ah){
      const d = Math.abs((a.x+a.w/2) - (state.x+current.player.w/2));
      if(d < 150){
        tryTalk();
        return;
      } else {
        toast("Too far away!");
      }
    }
  }
  
  // Check if clicked an item
  for(const it of current.items || []){
    const scale = 0.5;
    const ix = it.x;
    const iy = 580 - (it.h * scale);
    const iw = it.w * scale;
    const ih = it.h * scale;
    
    if(clickX >= ix && clickX <= ix + iw && clickY >= iy && clickY <= iy + ih){
      tryPickup();
      return;
    }
  }
});

function handleInteract(){
  if(talkOpen){
    nextDialogue();
  } else {
    if(tryTalk()){}
    else if(tryPickup()){}
    else if(tryDoor()){}
  }
}

// ---- input (keep keyboard for desktop) ----
window.addEventListener('keydown', e=>{ 
  keys[e.key.toLowerCase()] = true; 
  if(talkOpen && e.key.toLowerCase()==='e') nextDialogue(); 
});
window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });

// ---- audio UI ----
$("#btn-mute").addEventListener('click',()=>{
  state.muted = !state.muted; 
  music.muted = state.muted;
  audioEnabled = !state.muted;
  $("#btn-mute").textContent = state.muted ? "🔇" : "🔊";
  if(!state.muted && music.paused) music.play().catch(()=>{});
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) music.pause(); 
  else if(!state.muted) music.play().catch(()=>{});
});
$("#btn-new").onclick = ()=>newGame();
$("#btn-load").onclick = ()=>loadGame();

// ---- persistence ----
function saveGame(){ 
  localStorage.setItem('deadtrail_save', JSON.stringify(state)); 
}
function loadGame(){
  const raw = localStorage.getItem('deadtrail_save');
  if(!raw){ newGame(); return; }
  try{ 
    const loaded = JSON.parse(raw);
    state = { ...state, ...loaded };
    gotoScene(state.sceneId, true); 
  } catch{ 
    newGame(); 
  }
}
function newGame(){
  if(!manifest || !manifest.startScene){
    console.error("Cannot start new game - manifest not loaded");
    return;
  }
  state = { 
    sceneId: manifest.startScene, x:0,y:0,vx:0,vy:0,facing:1,hp:3,
    inventory:{cracker:0}, 
    flags:{carol_trust:0}, 
    muted:state.muted || false,
    iFrames: 0,
    attackCooldown: 0
  };
  gotoScene(manifest.startScene, false);
}

// ---- scene management ----
async function gotoScene(id, useSaved=false){
  if(!manifest || !manifest.scenes || !manifest.scenes[id]){
    console.error(`Scene ${id} not found in manifest`);
    return;
  }
  
  scene = structuredClone(manifest.scenes[id]);
  state.sceneId = id;

  current = {
    bg: await loadImg(scene.bg),
    bounds: scene.bounds,
    player: { 
      sprite: await loadImg(scene.player.sprite), 
      x: useSaved ? state.x : scene.player.x, 
      y: useSaved ? state.y : scene.player.y, 
      w:0, h:0 
    },
    actors: [], items: [], doors: scene.doors || []
  };
  current.player.w = current.player.sprite.width; 
  current.player.h = current.player.sprite.height;
  
  if(!useSaved){
    state.x = current.player.x;
    state.y = current.player.y;
  }

  for(const a of (scene.actors||[])){
    current.actors.push({
      id:a.id, x:a.x, y:a.y, talkable:!!a.talkable, ai:a.ai||null, speed:a.speed||0.8,
      alpha:a.alpha??1, ghost:!!a.ghost, w:0, h:0, hp: a.ai==='zombie' ? 3 : 999,
      sprite: await loadImg(a.sprite), onTalk:a.onTalk||null
    });
  }
  current.actors.forEach(a=>{ a.w=a.sprite.width; a.h=a.sprite.height; });

  for(const it of (scene.items||[])){
    current.items.push({ 
      id:it.id, x:it.x, y:it.y, type:it.type, w:0, h:0, 
      sprite: await loadImg(it.sprite) 
    });
  }
  current.items.forEach(it=>{ it.w=it.sprite.width; it.h=it.sprite.height; });

  if(!state.muted){ music.volume=0.5; music.play().catch(()=>{});  audioEnabled = true; }
  saveGame();
}

// ---- dialogue ----
let currentDialogueId = null;
let currentLineIndex = 0;

function showDialogue(lines, actorId){ 
  currentDialogueId = actorId;
  currentLineIndex = 0;
  talkQueue=[...lines]; 
  talkIndex=0; 
  dlgText.textContent=talkQueue[talkIndex]; 
  dlgBox.classList.remove('hidden'); 
  talkOpen=true;
  
  // Play first line audio
  if(actorId) playDialogueAudio(actorId, currentLineIndex);
}

function parseDirective(line){
  if(!line.startsWith('@')) return false;
  const parts = line.slice(1).split(' ');
  const cmd = parts[0];
  if(cmd==='flag'){ 
    state.flags[parts[1]] = (state.flags[parts[1]]||0) + parseInt(parts[2]); 
  }
  if(cmd==='give'){ 
    state.inventory[parts[1]] = (state.inventory[parts[1]]||0) + parseInt(parts[2]); 
  }
  if(cmd==='take'){ 
    state.inventory[parts[1]] = Math.max(0,(state.inventory[parts[1]]||0) - parseInt(parts[2])); 
  }
  if(cmd==='end'){ talkQueue = []; }
  return true;
}

function evalIf(expr){
  try{
    const [lhs,op,rhs] = expr.split(/(>=|<=|==|>|<)/);
    const val = lhs.split('.').reduce((o,k)=>o?.[k], state);
    const n = Number(rhs);
    if(op==='>') return val>n; 
    if(op==='>=') return val>=n; 
    if(op==='==') return val==n;
    if(op==='<') return val<n;  
    if(op==='<=') return val<=n;
  }catch{}
  return false;
}

function nextDialogue(){
  while(talkIndex < talkQueue.length){
    let line = talkQueue[++talkIndex];
    currentLineIndex++;
    if(line==null) break;
    if(line.startsWith('@if')){ 
      const cond=line.replace('@if','').trim(); 
      if(!evalIf(cond)){ 
        while(talkIndex<talkQueue.length && talkQueue[talkIndex] && 
              talkQueue[talkIndex].startsWith('@') && 
              !talkQueue[talkIndex].startsWith('@end')) talkIndex++; 
      } 
      continue; 
    }
    if(parseDirective(line)) continue;
    dlgText.textContent = line;
    if(currentDialogueId) playDialogueAudio(currentDialogueId, currentLineIndex);
    return;
  }
  dlgBox.classList.add('hidden'); 
  talkOpen=false;
  currentDialogueId = null;
  saveGame();
}

// ---- Roomba Easter Egg ----
function updateRoombaGag(){
  const now = Date.now();
  
  if(!roombaGag.active && now > roombaGag.nextTrigger){
    roombaGag.active = true;
    roombaGag.x = -100;
    roombaGag.y = 580 - 20;
    roombaGag.vx = 2 + Math.random() * 2;
    roombaGag.shown = false;
  }
  
  if(roombaGag.active){
    roombaGag.x += roombaGag.vx;
    
    if(!roombaGag.shown && roombaGag.x > 400){
      toast("ED: Damn robo vacuum!");
      playDialogueAudio('ed', 'roomba_gag');
      roombaGag.shown = true;
    }
    
    if(roombaGag.x > canvas.width + 100){
      roombaGag.active = false;
      roombaGag.nextTrigger = now + Math.random() * 30000 + 20000;
    }
  }
}

// ---- Combat System ----
function attackZombies(){
  if(state.attackCooldown > 0) return;
  
  const attackRange = 80;
  const scale = 0.5;
  
  let hitSomething = false;
  for(let i = current.actors.length - 1; i >= 0; i--){
    const a = current.actors[i];
    if(a.ai !== 'zombie') continue;
    
    const playerCenterX = state.x + (current.player.w * scale / 2);
    const zombieCenterX = a.x + (a.w * scale / 2);
    const distance = Math.abs(zombieCenterX - playerCenterX);
    
    const inFront = (state.facing > 0 && zombieCenterX > playerCenterX) || 
                    (state.facing < 0 && zombieCenterX < playerCenterX);
    
    if(distance < attackRange && inFront){
      a.hp--;
      toast("Hit! (" + a.hp + " HP left)");
      hitSomething = true;
      
      a.x += state.facing * 30;
      
      if(a.hp <= 0){
        current.actors.splice(i, 1);
        toast("Zombie defeated!");
      }
      
      state.attackCooldown = 30;
      break;
    }
  }
  
  if(!hitSomething && state.attackCooldown === 0){
    toast("Miss!");
    state.attackCooldown = 20;
  }
}

// ---- UI helpers ----
function drawBG(){
  if(!current || !current.bg) return;
  ctx.drawImage(current.bg, 0, 0, canvas.width, canvas.height);
}

function updateHUD(){
  heartsEl.textContent = "❤".repeat(state.hp);
  invEl.textContent = `Snacks: ${state.inventory.cracker}`;
}

// ---- gameplay loop ----
function step(){
  if(!scene || !current) return;
  
  if(state.attackCooldown > 0) state.attackCooldown--;
  
  if(!talkOpen){
    const L = keys['a'] || keys['arrowleft'] || touchControls.moveLeft;
    const R = keys['d'] || keys['arrowright'] || touchControls.moveRight;
    
    if(L){ state.vx=-3; state.facing=-1; } 
    else if(R){ state.vx=3; state.facing=1; } 
    else state.vx=0;
  }
  
  state.x = clamp(state.x + state.vx, current.bounds.left, 
                  current.bounds.right - current.player.w * 0.5);

  // Zombie AI
  for(const a of current.actors){
    if(a.ai==='zombie'){
      const dir = Math.sign((state.x - a.x));
      a.x += dir * a.speed;
      
      const playerScale = 0.5;
      const pr=rect(state.x, 580 - current.player.h * playerScale, 
                    current.player.w * playerScale, current.player.h * playerScale);
      const zr=rect(a.x, 580 - a.h * 0.5, a.w * 0.5, a.h * 0.5);
      if(hit(pr,zr)) hurtPlayer();
    }
  }
  
  updateRoombaGag();
}

function hurtPlayer(){
  if(state.iFrames>0) return;
  state.hp--; 
  state.iFrames=60;
  toast("Hit!");
  if(state.hp<=0){ 
    toast("Game Over");
    setTimeout(()=>newGame(), 2000);
    return; 
  }
}

function tryTalk(){
  for(const a of current.actors){
    if(!a.talkable) continue;
    const d = Math.abs((a.x+a.w/2) - (state.x+current.player.w/2));
    if(d<150){
      const lines=(a.onTalk||[]).flatMap(id=>manifest.dialogue[id]||[]);
      if(lines.length){ 
        showDialogue(lines, a.id); 
        return true; 
      }
    }
  }
  return false;
}

function tryPickup(){
  for(let i=current.items.length-1;i>=0;i--){
    const it=current.items[i];
    const pr = rect(state.x, 580 - current.player.h * 0.5, 
                    current.player.w * 0.5, current.player.h * 0.5);
    const ir = rect(it.x, 580 - it.h * 0.5, it.w * 0.5, it.h * 0.5);
    if(hit(pr, ir)){
      if(it.type==='cracker'){ 
        state.inventory.cracker++; 
        toast("Picked up Bioinspired Snack"); 
      }
      if(it.type==='save'){ 
        saveGame(); 
        toast("Game saved"); 
        return true; 
      }
      current.items.splice(i,1); 
      return true;
    }
  } 
  return false;
}

function tryDoor(){
  for(const d of (current.doors||[])){
    if(state.x > d.x && state.x < d.x + (d.w||50)){ 
      gotoScene(d.to); 
      toast(d.label||"→"); 
      return true; 
    }
  } 
  return false;
}

// ---- render ----
let toastTimer=0, toastText="";
function toast(t){ toastText=t; toastTimer=90; }

function draw(){
  if(!current) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBG();
  
  const groundY = 580;
  const scale = 0.5;
  
  // Draw items
  for(const it of current.items) {
    const itemY = groundY - (it.h * scale);
    ctx.drawImage(it.sprite, it.x, itemY, it.w * scale, it.h * scale);
  }
  
  // Draw roomba
  if(roombaGag.active && roombaGag.sprite){
    ctx.drawImage(roombaGag.sprite, roombaGag.x, groundY - 20, 48, 24);
  }
  
  // Draw actors
  for(const a of current.actors){
    const actorY = groundY - (a.h * scale);
    ctx.save();
    ctx.globalAlpha = a.alpha ?? 1;
    ctx.drawImage(a.sprite, a.x, actorY, a.w * scale, a.h * scale);
    ctx.restore();
  }
  
  // Draw player
  const playerY = groundY - (current.player.h * scale);
  ctx.save();
  if(state.facing < 0){
    ctx.translate(state.x + current.player.w * scale, playerY);
    ctx.scale(-1, 1);
    ctx.drawImage(current.player.sprite, 0, 0, current.player.w * scale, current.player.h * scale);
  } else {
    ctx.drawImage(current.player.sprite, state.x, playerY, 
                  current.player.w * scale, current.player.h * scale);
  }
  ctx.restore();
  
  // I-frames flash
  if(state.iFrames>0){ 
    if((state.iFrames%10)<5){ 
      ctx.globalAlpha=.4; 
      ctx.fillStyle='#f00'; 
      ctx.fillRect(state.x, playerY, current.player.w * scale, current.player.h * scale); 
      ctx.globalAlpha=1; 
    } 
    state.iFrames--; 
  }
  
  // Door labels
  for(const d of (current.doors||[])){
    if(d.label){ 
      ctx.strokeStyle="#000"; 
      ctx.lineWidth=3; 
      ctx.font="16px monospace"; 
      ctx.textBaseline="top"; 
      ctx.strokeText(d.label, d.x-10, groundY + 20); 
      ctx.fillStyle="#fff"; 
      ctx.fillText(d.label, d.x-10, groundY + 20); 
    }
  }
  
  // Toast notifications
  if(toastTimer>0){
    tooltip.classList.remove('hidden'); 
    tooltip.textContent=toastText;
    const r=canvas.getBoundingClientRect(); 
    tooltip.style.left=(r.left + canvas.clientWidth/2)+'px'; 
    tooltip.style.top=(r.top+80)+'px'; 
    toastTimer--;
  } else tooltip.classList.add('hidden');
  
  updateHUD();
}

// ---- main loop ----
let last=0; 
function loop(ts){ 
  const dt=(ts-last)/16.67; 
  last=ts; 
  step(dt); 
  draw(dt); 
  requestAnimationFrame(loop); 
}

// ---- robust levels loader ----
async function loadLevels(){
  try{ 
    return await loadJSON('levels.json'); 
  }
  catch(e){
    console.warn('levels.json not found, trying inline fallback');
    const tag=document.getElementById('levels-data');
    if(tag) {
      try {
        return JSON.parse(tag.textContent);
      } catch(parseErr) {
        console.error('Failed to parse inline levels-data:', parseErr);
      }
    }
    ctx.fillStyle='#111'; 
    ctx.fillRect(0,0,1280,720);
    ctx.fillStyle='#f55'; 
    ctx.font='20px monospace';
    ctx.fillText('Error: levels.json not found and no inline fallback.', 40, 60);
    ctx.fillText('Check console for details.', 40, 90);
    throw e;
  }
}

// ---- boot ----
(async function init(){
  try {
    manifest = await loadLevels();
    if(!manifest || !manifest.startScene){
      throw new Error("Invalid manifest - missing startScene");
    }
    
    roombaGag.sprite = await loadImg('assets/objects/roomba_side.png');
    
    createMobileControls();
    loadGame();
    requestAnimationFrame(loop);
  } catch(err) {
    console.error("Failed to initialize game:", err);
    ctx.fillStyle='#111'; 
    ctx.fillRect(0,0,1280,720);
    ctx.fillStyle='#f55'; 
    ctx.font='20px monospace';
    ctx.fillText('Failed to start game. Check console for details.', 40, 60);
  }
})();