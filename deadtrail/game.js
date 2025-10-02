// Dead Trail – compact side-view engine (no deps).
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
  hp: 3, inventory: { roomba:0, roomba_mod:0, cracker:0 },
  flags: { carol_trust:0 }, muted: false, iFrames: 0, thrown: null
};

// ---- helpers ----
function loadJSON(u){ return fetch(u).then(r=>{ if(!r.ok) throw new Error(u+" "+r.status); return r.json(); }); }
function loadImg(src){
  if(images.has(src)) return images.get(src);
  const p = new Promise(res=>{
    const i = new Image();
    i.onload = ()=>res(i);
    i.onerror = ()=>{ const c=document.createElement('canvas');c.width=32;c.height=32;const x=c.getContext('2d');x.fillStyle='#f00';x.fillRect(0,0,32,32);res(c); };
    i.src = src;
  });
  images.set(src,p); return p;
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rect=(x,y,w,h)=>({x,y,w,h});
const hit=(a,b)=>!(a.x+a.w<b.x || b.x+b.w<a.x || a.y+a.h<b.y || b.y+b.h<a.y);

// ---- input ----
window.addEventListener('keydown', e=>{ keys[e.key.toLowerCase()] = true; if(talkOpen && e.key.toLowerCase()==='e') nextDialogue(); });
window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });

// ---- audio UI ----
$("#btn-mute").addEventListener('click',()=>{
  state.muted = !state.muted; music.muted = state.muted;
  $("#btn-mute").textContent = state.muted ? "🔇" : "🔊";
  if(!state.muted && music.paused) music.play().catch(()=>{});
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) music.pause(); else if(!state.muted) music.play().catch(()=>{});
});
$("#btn-new").onclick = ()=>newGame();
$("#btn-load").onclick = ()=>loadGame();

// ---- persistence ----
function saveGame(){ localStorage.setItem('deadtrail_save', JSON.stringify(state)); }
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
    inventory:{roomba:0,roomba_mod:0,cracker:0}, 
    flags:{carol_trust:0}, 
    muted:state.muted || false,
    iFrames: 0,
    thrown: null
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
  
  // Initialize state position from current player if not using saved
  if(!useSaved){
    state.x = current.player.x;
    state.y = current.player.y;
  }

  for(const a of (scene.actors||[])){
    current.actors.push({
      id:a.id, x:a.x, y:a.y, talkable:!!a.talkable, ai:a.ai||null, speed:a.speed||0.8,
      alpha:a.alpha??1, ghost:!!a.ghost, w:0, h:0, sprite: await loadImg(a.sprite), onTalk:a.onTalk||null
    });
  }
  current.actors.forEach(a=>{ a.w=a.sprite.width; a.h=a.sprite.height; });

  for(const it of (scene.items||[])){
    current.items.push({ id:it.id, x:it.x, y:it.y, type:it.type, w:0, h:0, sprite: await loadImg(it.sprite) });
  }
  current.items.forEach(it=>{ it.w=it.sprite.width; it.h=it.sprite.height; });

  if(!state.muted){ music.volume=0.5; music.play().catch(()=>{}); }
  saveGame();
}

// ---- dialogue ----
function showDialogue(lines){ talkQueue=[...lines]; talkIndex=0; dlgText.textContent=talkQueue[talkIndex]; dlgBox.classList.remove('hidden'); talkOpen=true; }
function parseDirective(line){
  if(!line.startsWith('@')) return false;
  const parts = line.slice(1).split(' ');
  const cmd = parts[0];
  if(cmd==='flag'){ state.flags[parts[1]] = (state.flags[parts[1]]||0) + parseInt(parts[2]); }
  if(cmd==='give'){ state.inventory[parts[1]] = (state.inventory[parts[1]]||0) + parseInt(parts[2]); }
  if(cmd==='take'){ state.inventory[parts[1]] = Math.max(0,(state.inventory[parts[1]]||0) - parseInt(parts[2])); }
  if(cmd==='end'){ talkQueue = []; }
  return true;
}
function evalIf(expr){
  try{
    const [lhs,op,rhs] = expr.split(/(>=|<=|==|>|<)/);
    const val = lhs.split('.').reduce((o,k)=>o?.[k], state);
    const n = Number(rhs);
    if(op==='>') return val>n; if(op==='>=') return val>=n; if(op==='==') return val==n;
    if(op==='<') return val<n;  if(op==='<=') return val<=n;
  }catch{}
  return false;
}
function nextDialogue(){
  while(talkIndex < talkQueue.length){
    let line = talkQueue[++talkIndex];
    if(line==null) break;
    if(line.startsWith('@if')){ const cond=line.replace('@if','').trim(); if(!evalIf(cond)){ while(talkIndex<talkQueue.length && talkQueue[talkIndex] && talkQueue[talkIndex].startsWith('@') && !talkQueue[talkIndex].startsWith('@end')) talkIndex++; } continue; }
    if(parseDirective(line)) continue;
    dlgText.textContent = line; return;
  }
  dlgBox.classList.add('hidden'); talkOpen=false; saveGame();
}

// ---- UI helpers ----
function drawBG(){
  if(!current || !current.bg) return;
  const bg=current.bg; const s=Math.max(canvas.width/bg.width, canvas.height/bg.height);
  const w=bg.width*s, h=bg.height*s; ctx.drawImage(bg,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
}
function drawSprite(img,x,y,flip=false,alpha=1){
  ctx.save(); ctx.globalAlpha=alpha;
  if(flip){ ctx.translate(x+img.width,y); ctx.scale(-1,1); ctx.drawImage(img,0,0); }
  else { ctx.drawImage(img,x,y); }
  ctx.restore();
}
function updateHUD(){
  heartsEl.textContent = "❤".repeat(state.hp);
  invEl.textContent = `Roombas: ${state.inventory.roomba + state.inventory.roomba_mod} • Crackers: ${state.inventory.cracker}`;
}

// ---- gameplay loop ----
function step(){
  if(!scene || !current) return;
  if(!talkOpen){
    const L=keys['a']||keys['arrowleft'], R=keys['d']||keys['arrowright'];
    if(L){ state.vx=-3; state.facing=-1; } else if(R){ state.vx=3; state.facing=1; } else state.vx=0;
    if((keys[' ']||keys['spacebar']) && canThrow()) throwRoomba();
  }
  state.x = clamp(state.x + state.vx, current.bounds.left, current.bounds.right - current.player.w);

  if(keys['e'] && !talkOpen){ if(tryTalk()){} else if(tryPickup()){} else if(tryDoor()){} }

  for(const a of current.actors){
    if(a.ai==='zombie'){
      const dir = Math.sign((state.x - a.x));
      a.x += dir * a.speed * 2;
      const pr=rect(state.x,state.y,current.player.w,current.player.h);
      const zr=rect(a.x,a.y,a.w,a.h);
      if(hit(pr,zr)) hurtPlayer();
    }
  }
}
function canThrow(){ return (state.inventory.roomba_mod>0 || state.inventory.roomba>0) && !state.thrown; }
function throwRoomba(){
  const mod = state.inventory.roomba_mod>0;
  if(mod) state.inventory.roomba_mod--; else state.inventory.roomba--;
  state.thrown = { x: state.x + current.player.w/2, y: state.y + current.player.h/3, vx: state.facing*10, life: 120, sprite: null };
  loadImg('assets/objects/roomba_side.png').then(img=>state.thrown && (state.thrown.sprite=img));
}
function updateProjectile(){
  const p=state.thrown; if(!p) return;
  p.x += p.vx; p.life--;
  for(const a of current.actors){
    if(a.ai==='zombie' && hit(rect(p.x,p.y,32,32), rect(a.x,a.y,a.w,a.h))){
      a.x += p.vx*2; a.speed=0.3; p.life=0;
    }
  }
  if(p.life<=0) state.thrown=null;
}
function hurtPlayer(){
  if(state.iFrames>0) return;
  state.hp--; state.iFrames=60;
  if(state.hp<=0){ newGame(); return; }
}
function tryTalk(){
  for(const a of current.actors){
    if(!a.talkable) continue;
    const d = Math.abs((a.x+a.w/2) - (state.x+current.player.w/2));
    if(d<90){
      const lines=(a.onTalk||[]).flatMap(id=>manifest.dialogue[id]||[]);
      if(lines.length){ showDialogue(lines); return true; }
    }
  }
  return false;
}
function tryPickup(){
  for(let i=current.items.length-1;i>=0;i--){
    const it=current.items[i];
    if(hit(rect(state.x,state.y,current.player.w,current.player.h), rect(it.x,it.y,it.w,it.h))){
      if(it.type==='roomba'){ state.inventory.roomba++; toast("Picked up Roomba"); }
      if(it.type==='cracker'){ state.inventory.cracker++; toast("Picked up Cracker"); }
      if(it.type==='save'){ saveGame(); toast("Game saved"); return true; }
      current.items.splice(i,1); return true;
    }
  } return false;
}
function tryDoor(){
  for(const d of (current.doors||[])){
    if(state.x > d.x && state.x < d.x + (d.w||50)){ gotoScene(d.to); toast(d.label||"→"); return true; }
  } return false;
}

// ---- render ----
let toastTimer=0, toastText="";
function toast(t){ toastText=t; toastTimer=90; }
function draw(){
  if(!current) return;
  
  drawBG();
  for(const it of current.items) drawSprite(it.sprite,it.x,it.y);
  for(const a of current.actors) drawSprite(a.sprite,a.x,a.y,false,a.alpha??1);
  drawSprite(current.player.sprite,state.x,state.y,state.facing<0,1);
  if(state.iFrames>0){ if((state.iFrames%10)<5){ ctx.globalAlpha=.4; ctx.fillStyle='#f00'; ctx.fillRect(state.x,state.y,current.player.w,current.player.h); ctx.globalAlpha=1; } state.iFrames--; }
  if(state.thrown && state.thrown.sprite) drawSprite(state.thrown.sprite,state.thrown.x,state.thrown.y);
  for(const d of (current.doors||[])){
    if(d.label){ ctx.strokeStyle="#000"; ctx.lineWidth=3; ctx.font="16px monospace"; ctx.textBaseline="top"; ctx.strokeText(d.label,d.x-10,520); ctx.fillStyle="#fff"; ctx.fillText(d.label,d.x-10,520); }
  }
  if(toastTimer>0){
    tooltip.classList.remove('hidden'); tooltip.textContent=toastText;
    const r=canvas.getBoundingClientRect(); tooltip.style.left=(r.left + canvas.clientWidth/2)+'px'; tooltip.style.top=(r.top+80)+'px'; toastTimer--;
  } else tooltip.classList.add('hidden');
  updateHUD();
}

// ---- main loop ----
let last=0; function loop(ts){ const dt=(ts-last)/16.67; last=ts; step(dt); updateProjectile(); draw(dt); requestAnimationFrame(loop); }

// ---- robust levels loader (with inline fallback + on-canvas error) ----
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
    ctx.fillStyle='#111'; ctx.fillRect(0,0,1280,720);
    ctx.fillStyle='#f55'; ctx.font='20px monospace';
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
    loadGame();            // starts game or newGame()
    requestAnimationFrame(loop);
  } catch(err) {
    console.error("Failed to initialize game:", err);
    ctx.fillStyle='#111'; ctx.fillRect(0,0,1280,720);
    ctx.fillStyle='#f55'; ctx.font='20px monospace';
    ctx.fillText('Failed to start game. Check console for details.', 40, 60);
  }
})();