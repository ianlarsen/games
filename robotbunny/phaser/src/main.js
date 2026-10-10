import './styles.css';
import { createGame } from './game/createGame.js';
const controls={left:false,right:false,jump:false,shoot:false,jumpQueued:false,dashQueued:false};
const el=id=>document.getElementById(id),overlay=el('overlay');let ready=false,paused=false,won=false,playing=false;
const keyboard=new Set(),pointers=new Map();
function sync(){for(const key of ['left','right','jump','shoot'])controls[key]=keyboard.has(key)||[...pointers.values()].includes(key);}
function clear(){keyboard.clear();pointers.clear();for(const key of Object.keys(controls))controls[key]=false;document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
const bindings={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'shoot',ShiftLeft:'dash',ShiftRight:'dash'};
window.addEventListener('keydown',e=>{const key=bindings[e.code];if(key||e.code==='Escape')e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){togglePause();return;}if(e.code==='Enter'&&ready&&overlay.hidden===false){el('play').click();return;}if(!key||!playing||paused)return;keyboard.add(key);if(key==='jump'||key==='dash')controls[key+'Queued']=true;sync();});
window.addEventListener('keyup',e=>{keyboard.delete(bindings[e.code]);sync();});
for(const button of document.querySelectorAll('[data-control]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(!playing||paused)return;button.setPointerCapture(e.pointerId);const key=button.dataset.control;pointers.set(e.pointerId,key);button.classList.add('pressed');if(key==='jump'||key==='dash')controls[key+'Queued']=true;sync();});
 const release=e=>{pointers.delete(e.pointerId);button.classList.remove('pressed');sync();};for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);
}
const game=createGame({parent:'game-root',controlState:controls});game.sound.mute=true;
function show(title,message,label){el('title').textContent=title;el('message').textContent=message;el('play').textContent=label;overlay.hidden=false;}
game.events.on('loading',p=>el('message').textContent='Loading the moon… '+p+'%');
game.events.on('load-failed',names=>show('Assets unavailable','Missing '+names.join(', ')+'. Serve the robotbunny folder and keep images beside engine.','Reload'));
game.events.on('ready',()=>{ready=true;el('hud').textContent='Ready for launch';el('play').disabled=false;el('practice').disabled=false;show('Robot Bunny','Explore the moon, collect coins, and defeat its guardian.','Start run');});
game.events.on('playing',()=>{playing=true;paused=false;won=false;clear();overlay.hidden=true;el('pause').textContent='Pause';el('practice').hidden=true;});
game.events.on('hud',h=>{el('hud').textContent='Sector '+h.level+' · Score '+h.score+' · Lives '+h.lives+' · '+h.progress+'%'+(h.boss!==null?' · Boss '+h.boss:'');});
game.events.on('finished',data=>{playing=false;won=data.won;clear();show(data.title,data.message,data.label);el('practice').hidden=false;});
function start(practice=false,next=false){if(!ready)return;clear();paused=false;game.sound.resumeAll();const scene=game.scene.getScene('play');const data=next?{level:scene.level+1,score:scene.score,lives:Math.min(5,scene.lives+1)}:{practice};game.scene.stop('start');if(game.scene.isActive('play')||game.scene.isPaused('play')){game.scene.stop('play');}game.scene.start('play',data);}
el('play').addEventListener('click',()=>{if(paused){togglePause();return;}start(false,won);});el('practice').addEventListener('click',()=>start(true));el('restart').addEventListener('click',()=>start());
function togglePause(){if(!playing)return;clear();paused=!paused;el('pause').textContent=paused?'Resume':'Pause';if(paused){game.scene.pause('play');game.sound.pauseAll();show('Paused','Your run is safe. Resume when you’re ready.','Resume');el('practice').hidden=true;}else{game.scene.resume('play');game.sound.resumeAll();overlay.hidden=true;}}
el('pause').addEventListener('click',togglePause);el('sound').addEventListener('click',()=>{game.sound.mute=!game.sound.mute;el('sound').textContent=game.sound.mute?'Sound off':'Sound on';});
window.addEventListener('blur',()=>{clear();if(playing&&!paused)togglePause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();if(playing&&!paused)togglePause();}});
function resize(){const host=el('game-root'),r=host.getBoundingClientRect();if(r.height>0)game.scale.setGameSize(Math.max(280,Math.min(1600,560*r.width/r.height)),560);}
game.events.once('ready',resize);new ResizeObserver(resize).observe(el('game-root'));
