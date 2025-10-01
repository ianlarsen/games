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
  sceneId: null,
  x: 0, y: 0, vx: 0, vy: 0,
  facing: 1,
  hp: 3,
  inventory: { roomba:0, roomba_mod:0, cracker:0 },
  flags: { carol_trust:0 },
  muted: false
};

function loadJSON(u){ return fetch(u).then(r=>r.json()); }
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

// ---- input ----
window.addEventListener('keydown', e=>{ keys[e.key.toLowerCase()] = true; if(talkOpen && e.key.toLowerCase()==='e'){ nextDialogue(); }});
window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });

// ---- utils ----
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function rect(x,y,w,h){ return {x,y,w,h}; }
function hit(a,b){ return !(a.x+a.w<b.x || b.x+b.w<a.x || a.y+a.h<b.y || b.y+b.h<a.y); }

// ---- audio ----
$("#btn-mute").addEventListener('click',()=>{
  state.muted = !state.muted;
  music.muted = state.muted;
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
    state = JSON.parse(raw);
    gotoScene(state.sceneId, true);
  }catch{ newGame(); }
}
function newGame(){
  state = { sceneId: manifest.startScene, x:0,y:0,vx:0,vy:0,facing:1,hp:3, inventory:{roomba:0,roomba_mod:0,cracker:0}, flags:{carol_trust:0}, muted:false };
  gotoScene(manifest.startScene, true);
}

// ---- scene management ----
async function gotoScene(id, useSaved=false){
  scene = structuredClone(manifest.scenes[id]);
  state.sceneId = id;

  current = {
    bg: await loadImg(scene.bg),
    bounds: scene.bounds,
    player: { sprite: await loadImg(scene.player.sprite), x: useSaved?state.x:scene.player.x, y: useSaved?state.y:scene.player.y, w:0, h:0 },
    actors: [],
    items: [],
    doors: scene.doors || []
  };

  current.player.w = current.player.sprite.width;
  current.player.h = current.player.sprite.height;

  // actors
  for(const a of (scene.actors||[])){
    current.actors.push({
      id:a.id, x:a.x, y:a.y, talkable:!!a.talkable, ai:a.ai||null, speed:a.speed||0.8, alpha:a.alpha??1, ghost:!!a.ghost,
      w:0, h:0, sprite: await loadImg(a.sprite), onTalk:a.onTalk||null
    });
  }
  current.actors.forEach(a=>{ a.w=a.sprite.width; a.h=a.sprite.height; });

  // items
  for(const it of (scene.items||[])){
    current.items.push({ id:it.id, x:it.x, y:it.y, type:it.type, w:0, h:0, sprite: await loadImg(it.sprite) });
  }
  current.items.forEach(it=>{ it.w=it.sprite.width; it.h=it.sprite.height; });

  // music
  if(!state.muted){ music.volume = 0.5; music.play().catch(()=>{}); }

  saveGame();
}

// ---- dialogue ----
function showDialogue(lines){
  talkQueue = [...lines];
  talkIndex = 0;
  dlgText.textContent = talkQueue[talkIndex];
  dlgBox.classList.remove('hidden');
  talkOpen = true;
}
function parseDirective(line){
  // simple inline commands in levels.json dialogue
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
  // format: inventory.roomba>0  or flags.carol_trust>0
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
  // consume directives and conditionals
  while(talkIndex < talkQueue.length){
    let line = talkQueue[++talkIndex];
    if(line==null) break;
    if(line.startsWith('@if')){
      const cond = line.replace('@if','').trim();
      if(!evalIf(cond)){
        // skip to next non-directive or next @end trigger
        while(talkIndex < talkQueue.length && talkQueue[talkIndex] && talkQueue[talkIndex].startsWith('@') && !talkQueue[talkIndex].startsWith('@end')) talkIndex++;
      }
      continue;
    }
    if(parseDirective(line)) continue;
    dlgText.textContent = line;
    return;
  }
  dlgBox.classList.add('hidden'); talkOpen = false;
  saveGame();
}

// ---- UI updates ----
function drawBG(){
  // cover canvas while preserving aspect
  const bg = current.bg;
  const scale = Math.max(canvas.width/bg.width, canvas.height/bg.height);
  const bw = bg.width*scale, bh = bg.height*scale;
  ctx.drawImage(bg, (canvas.width-bw)/2, (canvas.height-bh)/2, bw, bh);
}
function drawSprite(img, x, y, flip=false, alpha=1){
  ctx.save(); ctx.globalAlpha = alpha;
  if(flip){ ctx.translate(x+img.width, y); ctx.scale(-1,1); ctx.drawImage(img, 0, 0); }
  else { ctx.drawImage(img, x, y); }
  ctx.restore();
}
function updateHUD(){
  heartsEl.textContent = "❤".repeat(state.hp);
  invEl.textContent = `Roombas: ${state.inventory.roomba + state.inventory.roomba_mod} • Crackers: ${state.inventory.cracker}`;
}

// ---- physics & AI ----
function step(dt){
  if(!scene) return;

  // movement (locked during dialogue)
  if(!talkOpen){
    const left = keys['a']||keys['arrowleft'];
    const right= keys['d']||keys['arrowright'];
    const onGround = true;

    if(left){ state.vx = -3; state.facing = -1; }
    else if(right){ state.vx = 3; state.facing = 1; }
    else { state.vx = 0; }

    if((keys[' ']||keys['spacebar']) && canThrow()){
      throwRoomba();
    }
  }

  // apply
  state.x = clamp((state.x||current.player.x) + state.vx, current.bounds.left, current.bounds.right - current.player.w);
  state.y = current.player.y; // flat ground for slice

  // interact (E)
  if((keys['e']) && !talkOpen){
    if(tryTalk()){}
    else if(tryPickup()){}
    else if(tryDoor()){}
  }

  // simple zombie AI
  for(const a of current.actors){
    if(a.ai==='zombie'){
      const dir = Math.sign((state.x - a.x));
      a.x += dir * a.speed * 2;
      // collision with player
      const pr = rect(state.x, state.y, current.player.w, current.player.h);
      const zr = rect(a.x, a.y, a.w, a.h);
      if(hit(pr,zr)) hurtPlayer();
    }
  }
}

function canThrow(){ return (state.inventory.roomba_mod>0 || state.inventory.roomba>0) && !state.thrown; }
function throwRoomba(){
  // spawn a temp projectile
  const modded = state.inventory.roomba_mod>0;
  if(modded) state.inventory.roomba_mod--; else state.inventory.roomba--;
  state.thrown = {
    x: state.x + current.player.w/2,
    y: state.y + current.player.h/3,
    vx: state.facing * 10,
    life: 120,
    sprite: images.get('assets/objects/roomba_side.png') || loadImg('assets/objects/roomba_side.png')
  };
}

function updateProjectile(){
  const p = state.thrown; if(!p) return;
  p.x += p.vx; p.life--;
  // hit any zombie
  for(const a of current.actors){
    if(a.ai==='zombie'){
      if(hit(rect(p.x,p.y,32,32), rect(a.x,a.y,a.w,a.h))){
        a.x += p.vx*2; a.speed = 0.3; // stun/knockback
        p.life = 0;
      }
    }
  }
  if(p.life<=0) state.thrown = null;
}

function hurtPlayer(){
  if(state.iFrames>0) return;
  state.hp--; state.iFrames = 60;
  if(state.hp<=0){ newGame(); return; }
}

function tryTalk(){
  // find nearest talkable actor within range
  for(const a of current.actors){
    if(!a.talkable) continue;
    const dist = Math.abs((a.x+ a.w/2) - (state.x + current.player.w/2));
    if(dist < 90){
      const blocks = (a.onTalk||[]).flatMap(id => manifest.dialogue[id] || []);
      if(blocks.length){ showDialogue(blocks); return true; }
    }
  }
  return false;
}
function tryPickup(){
  for(let i=current.items.length-1;i>=0;i--){
    const it=current.items[i];
    const pr=rect(state.x,state.y,current.player.w,current.player.h);
    const ir=rect(it.x,it.y,it.w,it.h);
    if(hit(pr,ir)){
      if(it.type==='roomba'){ state.inventory.roomba++; toast("Picked up Roomba"); }
      if(it.type==='cracker'){ state.inventory.cracker++; toast("Picked up Cracker"); }
      if(it.type==='save'){ saveGame(); toast("Game saved"); return true; }
      current.items.splice(i,1);
      return true;
    }
  }
  return false;
}
function tryDoor(){
  for(const d of (current.doors||[])){
    if(state.x > d.x && state.x < d.x + (d.w||50)){
      gotoScene(d.to); toast(d.label || "→");
      return true;
    }
  }
  return false;
}

// ---- rendering ----
let toastTimer=0, toastText="";
function toast(t){ toastText=t; toastTimer=90; }
function draw(dt){
  drawBG();

  // items
  for(const it of current.items) drawSprite(it.sprite, it.x, it.y);

  // actors
  for(const a of current.actors) drawSprite(a.sprite, a.x, a.y, false, a.alpha??1);

  // player
  drawSprite(current.player.sprite, state.x, state.y, state.facing<0, 1);
  if(state.iFrames>0){ // flash when hurt
    if((state.iFrames%10)<5) ctx.globalAlpha=.4, ctx.fillStyle='#f00',
      ctx.fillRect(state.x, state.y, current.player.w, current.player.h), ctx.globalAlpha=1;
    state.iFrames--;
  }

  // projectile
  if(state.thrown){
    const img = state.thrown.sprite instanceof Promise ? null : state.thrown.sprite;
    if(img) drawSprite(img, state.thrown.x, state.thrown.y);
  }

  // door labels
  ctx.fillStyle="rgba(0,0,0,.5)";
  ctx.font="16px monospace";
  ctx.strokeStyle="#000";
  ctx.lineWidth=3;
  ctx.textBaseline="top";
  for(const d of (current.doors||[])){
    if(d.label){ ctx.strokeText(d.label, d.x-10, 520); ctx.fillStyle="#fff"; ctx.fillText(d.label, d.x-10, 520); }
  }

  // tooltip / toasts
  if(toastTimer>0){
    tooltip.classList.remove('hidden');
    tooltip.textContent = toastText;
    tooltip.style.left = (canvas.getBoundingClientRect().left + canvas.clientWidth/2) + 'px';
    tooltip.style.top  = (canvas.getBoundingClientRect().top + 80) + 'px';
    toastTimer--;
  } else tooltip.classList.add('hidden');

  updateHUD();
}

// ---- main loop ----
let last=0;
function loop(ts){
  const dt = (ts-last)/16.67; last=ts;
  step(dt); updateProjectile(); draw(dt);
  requestAnimationFrame(loop);
}

// ---- boot ----
(async function init(){
  manifest = await loadJSON('levels.json');
  loadGame(); // will newGame() if no save
  requestAnimationFrame(loop);
})();
