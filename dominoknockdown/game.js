import * as THREE from './vendor/three.module.js';
import {groundTexture,buildDeck} from './surfaces.js';
import {prepare, distance, canAppend, presetPath, buildTrack, LIMIT, MAX_DOMINOES} from './path.js';

const $ = id => document.getElementById(id);
const canvas=$('scene'), stage=$('stage');
const KEY='dominoknockdown-v1';
let raw=[],placed=[],history=[],state='draw',view='ride',muted=false,surface='wood';
let gentle=matchMedia('(prefers-reduced-motion: reduce)').matches;
let pointer=null,strokeStart=0,fallTime=0,fallen=0,accumulated=0,paused=false,lastFrame=0;
let audio=null,noiseBuffer=null,savedHintTimer=0,needsSave=false,buildingAt=0;
let renderer,scene,camera,dominoes,markers,pathLine,floor,bridgeDeck,deckMaterial,sun;
let track={points:[],bridges:[]};
const floors={};
const dummy=new THREE.Object3D(), ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const hit=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),lookTarget=new THREE.Vector3();
const overPosition=new THREE.Vector3(),overLook=new THREE.Vector3();
const actualCameraLook=new THREE.Vector3();

try { init(); } catch(error) {
  console.error(error);
  $('error').hidden=false;
  $('error').textContent='The 3D tabletop could not start. Please open this game in an up-to-date Safari or Chrome browser with WebGL enabled, then reload.';
}

function init() {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.setClearColor('#bb946b');
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#bb946b',75,150);
  camera=new THREE.PerspectiveCamera(42,1,.1,180);
  scene.add(new THREE.HemisphereLight('#fffbed','#bac5ae',2.5));
  sun=new THREE.DirectionalLight('#fff3d5',3.1);sun.position.set(-15,30,10);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-28,right:28,top:24,bottom:-24,near:1,far:75});
  sun.shadow.bias=-.0005;sun.shadow.normalBias=.035;scene.add(sun);
  const wood=makeWoodTexture();
  floor=new THREE.Mesh(new THREE.PlaneGeometry(230,230),new THREE.MeshStandardMaterial({map:wood,roughness:.82}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.05;floor.receiveShadow=true;scene.add(floor);
  floors.wood=floor.material;
  for(const kind of ['stone','dirt','lava']) {
    const map=groundTexture(kind,renderer);
    floors[kind]=new THREE.MeshStandardMaterial({map,roughness:kind==='lava'?.75:.94,...(kind==='lava'?{emissiveMap:map,emissive:'#ff5a05',emissiveIntensity:.8}:{})});
  }
  const deckMap=groundTexture('stone',renderer);deckMap.repeat.set(1,1);
  deckMaterial=new THREE.MeshStandardMaterial({map:deckMap,color:'#b8b9af',roughness:.9,side:THREE.DoubleSide});
  // A single instanced draw batch keeps hundreds of dominoes inexpensive on iPad.
  const geometry=new THREE.BoxGeometry(.69,1.5,.24);geometry.translate(0,.75,0);
  const face=makeFaceTexture();
  const edge=new THREE.MeshStandardMaterial({color:'#151719',roughness:.45});
  const decorated=new THREE.MeshStandardMaterial({map:face,roughness:.48});
  dominoes=new THREE.InstancedMesh(geometry,[edge,edge,edge,edge,decorated,decorated],MAX_DOMINOES);
  dominoes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);dominoes.count=0;dominoes.castShadow=true;dominoes.receiveShadow=true;dominoes.frustumCulled=false;scene.add(dominoes);
  markers=new THREE.Group();scene.add(markers);
  const markerMat=new THREE.MeshBasicMaterial({color:'#3e7865',transparent:true,opacity:.75});
  for(let i=0;i<2;i++) {
    const ring=new THREE.Mesh(new THREE.RingGeometry(.32,.40,32),markerMat.clone());
    ring.rotation.x=-Math.PI/2;ring.position.y=.025;markers.add(ring);
  }
  restore();$('gentle').checked=gentle;$('surface').value=surface;
  resize();camera.position.copy(overPosition);actualCameraLook.copy(overLook);camera.lookAt(actualCameraLook);
  bind();updatePath();updateUI();renderer.setAnimationLoop(frame);
}

function makeFaceTexture() {
  const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');
  x.fillStyle='#111416';x.fillRect(0,0,128,256);
  x.strokeStyle='#656968';x.lineWidth=2;x.beginPath();x.moveTo(13,128);x.lineTo(115,128);x.stroke();
  x.fillStyle='#fffef5';
  for(const [a,b] of [[34,38],[94,38],[64,65],[34,92],[94,92],[34,164],[94,164],[34,218],[94,218]]) {x.beginPath();x.arc(a,b,8,0,Math.PI*2);x.fill();}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
}

function makeWoodTexture() {
  const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');
  let seed=9137;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const tones=['#b88c60','#c0966a','#b18659','#c39a6e'];
  for(let col=0;col<4;col++) {
    const x=col*256;ctx.fillStyle=tones[col];ctx.fillRect(x,0,256,1024);
    // Long, irregular grain is drawn into the material rather than fetched remotely.
    for(let i=0;i<300;i++) {
      const gx=x+random()*256,phase=random()*Math.PI*2,amp=1+random()*5;
      ctx.strokeStyle=random()>.5?'rgba(79,46,23,.11)':'rgba(251,224,170,.15)';ctx.lineWidth=.4+random()*1.3;ctx.beginPath();
      for(let y=0;y<=1024;y+=8){const xx=gx+Math.sin(y/155+phase)*amp+Math.sin(y/57+phase)*.8;if(y===0)ctx.moveTo(xx,y);else ctx.lineTo(xx,y);}ctx.stroke();
    }
    ctx.fillStyle='rgba(63,39,20,.28)';ctx.fillRect(x,0,2,1024);ctx.fillStyle='rgba(255,234,195,.23)';ctx.fillRect(x+2,0,1,1024);
    for(const y of col%2?[256,768]:[0,512]){ctx.fillStyle='rgba(65,40,20,.30)';ctx.fillRect(x,y,256,2);ctx.fillStyle='rgba(255,232,191,.2)';ctx.fillRect(x,y+2,256,1);}
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(14,14);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}

function resize() {
  const w=stage.clientWidth,h=stage.clientHeight;
  renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();
  let cx=0,cz=0,spanX=32,spanZ=22;
  if(placed.length) {
    const xs=placed.map(p=>p.x),zs=placed.map(p=>p.z);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
    cx=(minX+maxX)/2;cz=(minZ+maxZ)/2;spanX=Math.max(20,maxX-minX+9);spanZ=Math.max(16,maxZ-minZ+10);
  }
  const d=state==='draw'?Math.max(39,spanX/(camera.aspect*.767)*1.1,spanZ/.767*1.1):Math.max(30,spanX/(camera.aspect*.65),spanZ/.50);
  overPosition.set(cx,d,cz+(state==='draw'?.001:d*.56));overLook.set(cx,0,cz);
  if(state!=='running'||view==='overhead'||gentle) {camera.position.copy(overPosition);actualCameraLook.copy(overLook);camera.lookAt(actualCameraLook);}

}

function bind() {
  new ResizeObserver(resize).observe(stage);
  canvas.addEventListener('pointerdown',onDown);
  canvas.addEventListener('pointermove',onMove);
  canvas.addEventListener('pointerup',onUp);
  canvas.addEventListener('pointercancel',onUp);
  canvas.addEventListener('lostpointercapture',onUp);
  $('surface').onchange=()=>{surface=$('surface').value;save();};
  $('preset').onchange=()=>{if($('preset').value)loadPreset($('preset').value);};
  $('undo').onclick=()=>{
    if(state!=='draw')return;
    const end=history.pop();raw=raw.slice(0,end??Math.max(0,raw.length-18));$('preset').value='';updatePath();save();
  };
  $('clear').onclick=()=>{raw=[];history=[];state='draw';placed=[];dominoes.count=0;$('preset').value='';updatePath();resize();save();};
  $('action').onclick=()=>{
    unlockAudio();
    if(state==='draw') ready();
    else if(state==='ready'||state==='done') go();
    else if(state==='running') {state='ready';fallTime=0;fallen=0;updateDominoes(0);updateUI();resize();hint('Stopped. Your dominoes are ready for another go.');}
  };
  $('edit').onclick=()=>{state='draw';dominoes.count=0;placed=prepare(raw);updatePath();resize();};
  $('ride').onclick=()=>setView('ride');$('overhead').onclick=()=>setView('overhead');
  $('sound').onclick=()=>{muted=!muted;unlockAudio();soundUI();save();};
  $('gentle').onchange=()=>{gentle=$('gentle').checked;if(gentle)setView('overhead');save();updateUI();};
  $('help').onclick=()=>{$('instructions').showModal();paused=true;};
  $('close-help').onclick=$('help-done').onclick=()=>{$('instructions').close();};
  $('instructions').addEventListener('close',()=>{paused=false;});
  document.addEventListener('visibilitychange',()=>{lastFrame=performance.now();if(document.hidden)save();});
  addEventListener('pagehide',save);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('error').hidden=false;$('error').textContent='The tabletop paused because graphics memory was released. Your path is saved. Reload to continue.';save();});
}

function loadPreset(name) {
  if(state==='running')return;
  raw=presetPath(name);history=[0];state='draw';dominoes.count=0;
  $('preset').value=name;updatePath();resize();save();
}

function setView(next) {
  view=next;
  if(next==='ride'&&gentle)hint('Gentle motion keeps your view overhead. Turn it off to ride along.');
  updateUI();save();
}
function screenToWorld(event) {
  const r=canvas.getBoundingClientRect();mouse.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);
  ray.setFromCamera(mouse,camera);return ray.ray.intersectPlane(groundPlane,hit)?{x:hit.x,z:hit.z}:null;
}
function onDown(e) {
  if(state!=='draw'||pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;
  const p=screenToWorld(e);if(!p)return;
  if(raw.length&&distance(p,raw.at(-1))>2){hint('Continue from the end ring, or Clear to start a new path.');return;}
  if(!raw.length&&canAppend([],p)){hint('Start inside the floor’s corner marks.');return;}
  e.preventDefault();pointer=e.pointerId;strokeStart=raw.length;canvas.setPointerCapture(pointer);history.push(strokeStart);$('preset').value='';
  append(p);unlockAudio();
}
function onMove(e) {
  if(e.pointerId!==pointer||state!=='draw')return;
  e.preventDefault();
  const coalesced=e.getCoalescedEvents?.();const events=coalesced?.length?coalesced:[e];for(const ev of events) {const p=screenToWorld(ev);if(p)append(p);}
}
function append(p) {
  if(prepare(raw).length>=MAX_DOMINOES){hint('360 dominoes! Ready for a big chain reaction.');return;}
  // Interpolate fast strokes so crossing detection cannot jump over earlier sections.
  const last=raw.at(-1), steps=last?Math.max(1,Math.ceil(distance(last,p)/.32)):1;
  for(let i=1;i<=steps;i++) {
    const q=last?{x:last.x+(p.x-last.x)*i/steps,z:last.z+(p.z-last.z)*i/steps}:p;
    const issue=canAppend(raw,q);if(issue==='skip')continue;
    if(issue){hint(issue);return;}
    raw.push(q);
    if(prepare(raw).length>=MAX_DOMINOES)break;
  }
  updatePath();needsSave=true;
}
function onUp(e) {
  if(e.pointerId!==pointer)return;
  pointer=null;if(raw.length===strokeStart)history.pop();
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  save();
}

function updatePath() {
  clearTimeout(savedHintTimer);savedHintTimer=0;$('hint').classList.remove('temporary');
  const points=prepare(raw);placed=points;
  if(pathLine){scene.remove(pathLine);pathLine.geometry.dispose();pathLine.material.dispose();pathLine=null;}
  if(points.length>1) {
    pathLine=buildDeck(points.map(p=>({...p,y:.035})),true,new THREE.MeshBasicMaterial({color:'#000000'}),.045);scene.add(pathLine);
  }
  markers.visible=raw.length>0;
  if(raw.length){markers.children[0].position.set(raw[0].x,.025,raw[0].z);markers.children[1].position.set(raw.at(-1).x,.025,raw.at(-1).z);}
  updateUI();
}
function ready() {
  track=buildTrack(prepare(raw));placed=track.points;if(placed.length<5)return;
  if(bridgeDeck){scene.remove(bridgeDeck);bridgeDeck.geometry.dispose();}
  bridgeDeck=buildDeck(placed,surface==='lava',deckMaterial);scene.add(bridgeDeck);
  floor.material=floors[surface];floor.position.y=surface==='lava'?-.65:-.05;
  const xs=placed.map(p=>p.x),zs=placed.map(p=>p.z),cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;
  sun.position.set(cx-15,35,cz+10);sun.target.position.set(cx,0,cz);scene.add(sun.target);
  const span=Math.max(30,Math.max(...xs)-Math.min(...xs)+12,Math.max(...zs)-Math.min(...zs)+12);
  Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span});sun.shadow.camera.updateProjectionMatrix();
  state='ready';buildingAt=performance.now();fallTime=0;fallen=0;
  dominoes.count=placed.length;updateDominoes(0);updateUI();resize();save();
}
function go() {
  state='running';fallTime=0;fallen=0;accumulated=0;lastFrame=performance.now();
  if(gentle)view='overhead';updateDominoes(0);updateUI();
}
function updateDominoes(time) {
  const delay=gentle?.095:.052;
  for(let i=0;i<placed.length;i++) {
    const p=placed[i],a=placed[Math.max(0,i-1)],b=placed[Math.min(placed.length-1,i+1)];
    const t=Math.max(0,Math.min(1,(time-i*delay)/.29));
    const angle=(1-Math.pow(1-t,2))*1.40;
    const slope=Math.atan2((b.y||0)-(a.y||0),distance(a,b));
    dummy.position.set(p.x,.02+(p.y||0),p.z);dummy.rotation.set(angle-slope,Math.atan2(b.x-a.x,b.z-a.z),0,'YXZ');
    let scale=1;
    if(state==='ready'&&buildingAt)scale=Math.min(1,Math.max(.02,(performance.now()-buildingAt-i*1.3)/250));
    dummy.scale.setScalar(scale);dummy.updateMatrix();dominoes.setMatrixAt(i,dummy.matrix);
  }
  dominoes.instanceMatrix.needsUpdate=true;
}

function updateUI() {
  const n=placed.length, drawing=state==='draw',running=state==='running';
  $('count').innerHTML=`${n} <small>DOMINO${n===1?'':'ES'}</small>`;
  document.body.dataset.mode=drawing?'draw':'build';
  floor.visible=!drawing;if(bridgeDeck)bridgeDeck.visible=!drawing;
  renderer.setClearColor(drawing?'#ffffff':surface==='lava'?'#521c0b':surface==='stone'?'#969a93':surface==='dirt'?'#765037':'#bb946b');
  scene.fog=drawing?null:new THREE.Fog(surface==='lava'?'#521c0b':surface==='stone'?'#969a93':surface==='dirt'?'#765037':'#bb946b',90,200);
  if(pathLine)pathLine.visible=drawing;markers.visible=false;
  $('action').disabled=drawing&&n<5;$('undo').disabled=!drawing||!raw.length;$('clear').disabled=!drawing||!raw.length;
  $('undo').hidden=!drawing;$('clear').hidden=!drawing;$('edit').hidden=drawing||running;
  const text={draw:'Ready',ready:'Go',running:'Stop',done:'Replay'};
  const icon={draw:'check',ready:'play',running:'stop',done:'replay'};
  $('action-text').textContent=text[state];$('action-icon').innerHTML=`<use href="#i-${icon[state]}"/>`;
  const selected=gentle?'overhead':view;
  for(const v of ['ride','overhead']){$(v).classList.toggle('selected',v===selected);$(v).setAttribute('aria-pressed',v===selected);}
  $('preset').disabled=running;$('surface').disabled=!drawing;
  $('finish').hidden=state!=='done';$('progress').hidden=!running;
  $('progress-fill').style.width='0%';canvas.style.cursor=drawing?'crosshair':'default';
  if(!savedHintTimer)$('hint').textContent=drawing?(n<5?(n?'Keep drawing. At least 5 dominoes make a chain.':'A little line starts something big.'):'Looking good. Keep drawing, or press Ready.'):
    state==='ready'?'All lined up. Give the first one a little push.':running?(gentle?'A gentler chain reaction. Enjoy the view.':selected==='ride'?'You’re just ahead of the fall. Enjoy the ride.':'Sit back and watch it all unfold.'):'One little line. One lovely chain reaction.';
}
function hint(text) {
  clearTimeout(savedHintTimer);$('hint').textContent=text;$('hint').classList.add('temporary');
  savedHintTimer=setTimeout(()=>{savedHintTimer=0;$('hint').classList.remove('temporary');updateUI();},2600);
}
function soundUI() {$('sound').setAttribute('aria-pressed',!muted);$('sound').setAttribute('aria-label',muted?'Turn sound on':'Turn sound off');}

function unlockAudio() {
  if(muted)return;
  try {
    if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)();noiseBuffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*.035),audio.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*.18));}
    if(audio.state==='suspended')audio.resume().catch(()=>{});
  }catch{ /* Sound is optional; the tabletop remains playable. */ }
}
function clickSound(index) {
  if(muted||!audio||audio.state!=='running')return;
  const now=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain(),noise=audio.createBufferSource(),filter=audio.createBiquadFilter();
  osc.type='triangle';osc.frequency.setValueAtTime(620+(index%7)*45,now);osc.frequency.exponentialRampToValueAtTime(180,now+.045);
  gain.gain.setValueAtTime(.055,now);gain.gain.exponentialRampToValueAtTime(.001,now+.055);osc.connect(gain);gain.connect(audio.destination);osc.start(now);osc.stop(now+.06);
  noise.buffer=noiseBuffer;filter.type='highpass';filter.frequency.value=1800;noise.connect(filter);filter.connect(gain);noise.start(now);
  osc.onended=()=>{osc.disconnect();noise.disconnect();filter.disconnect();gain.disconnect();};
}

function pathAt(index) {
  const i=Math.floor(Math.max(0,index)),t=index-i;
  const a=placed[Math.min(i,placed.length-1)],b=placed[Math.min(i+1,placed.length-1)];
  if(!a)return {x:0,y:0,z:0};
  if(i>=placed.length-1){const previous=placed.at(-2)||a;return {y:a.y||0,x:a.x+(a.x-previous.x)*(index-(placed.length-1)),z:a.z+(a.z-previous.z)*(index-(placed.length-1))};}
  return {y:(a.y||0)+((b.y||0)-(a.y||0))*t,x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};
}
function frame(now) {
  const dt=Math.min((now-(lastFrame||now))/1000,.06);lastFrame=now;
  if(document.hidden)return;
  const running=state==='running';
  if(running&&!paused) {
    accumulated+=dt;const warmup=gentle||view==='overhead'?.35:1.1;
    fallTime=Math.max(0,accumulated-warmup);
    const delay=gentle?.095:.052;
    const next=Math.min(placed.length,Math.max(0,Math.floor(fallTime/delay)+((fallTime>0)?1:0)));
    // Play at most two impacts per frame after interruptions, avoiding an audio burst.
    if(next>fallen){for(let i=fallen;i<Math.min(next,fallen+2);i++)clickSound(i);fallen=next;}
    updateDominoes(fallTime);$('progress-fill').style.width=`${Math.min(100,fallen/placed.length*100)}%`;
    if(fallTime>(placed.length-1)*delay+1.3){state='done';$('result').textContent=`${placed.length} dominoes · ${((placed.length-1)*delay+.29).toFixed(1)} seconds of satisfaction`;updateUI();}
  } else if(state==='ready'&&now-buildingAt<1000)updateDominoes(0);

  const riding=state==='running'&&view==='ride'&&!gentle;
  if(riding) {
    const index=fallTime/.052,front=pathAt(index+7),target=pathAt(index-1);
    cameraTarget.set(front.x,3.2+(front.y||0),front.z);lookTarget.set(target.x,.85+(target.y||0),target.z);
  } else {cameraTarget.copy(overPosition);lookTarget.copy(overLook);}
  const amount=1-Math.exp(-dt*(riding?5:3));
  camera.position.lerp(cameraTarget,amount);actualCameraLook.lerp(lookTarget,amount);camera.lookAt(actualCameraLook);
  // Shadow maps and geometry are reused; only matrices move during the cascade.
  if(state==='draw'){camera.position.copy(overPosition);actualCameraLook.copy(overLook);camera.lookAt(actualCameraLook);}
  if(surface==='lava'&&!gentle)floors.lava.emissiveIntensity=.8+Math.sin(now*.0013)*.12;
  renderer.render(scene,camera);
  if(needsSave&&pointer===null){needsSave=false;save();}
}

function save() {
  try{localStorage.setItem(KEY,JSON.stringify({raw,view,muted,gentle,surface}));}catch{/* Storage may be unavailable in private or embedded browsing. */}
}
function restore() {
  try {
    const s=JSON.parse(localStorage.getItem(KEY));if(!s)return;
    if(Array.isArray(s.raw)&&s.raw.length<=1500&&s.raw.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.abs(p.x)<=LIMIT.x&&Math.abs(p.z)<=LIMIT.z))raw=s.raw;
    if(['ride','overhead'].includes(s.view))view=s.view;
    if(['wood','stone','lava','dirt'].includes(s.surface))surface=s.surface;
    muted=!!s.muted;gentle=gentle||!!s.gentle;history=raw.length?[0]:[];soundUI();
  }catch{/* A stale or unavailable save starts a fresh tabletop. */}
}
