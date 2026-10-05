'use strict';
(() => {
const D=window.ZANDS_DATA, $=s=>document.querySelector(s), app=$('#app');
const games=[
 ['paint-studio','Paint Studio','Make a masterpiece.','Paint, fill, and save your own pictures.','#f57672'],
 ['picture-remix','Picture Remix','Mix it. Match it.','Swap 16 tiles to rebuild a picture.','#f1bd24'],
 ['match-quest','Match Quest','Find the friends.','Turn over cards and discover pairs.','#a06bea'],
 ['number-quest','Number Quest','Take a number adventure.','Solve, compare, count, and put numbers in order.','#ed74b4'],
 ['pattern-beats','Pattern Beats','Listen. Remember. Play.','Repeat a growing musical pattern.','#eb8c43'],
 ['shape-builder','Shape Builder','Every piece belongs.','Move and rotate seven tangram pieces.','#36b5cd']
];
const help={
 'paint-studio':'Choose a blank canvas or coloring page. Brush draws; Eraser removes your brush strokes; Fill colors a region, or a connected area of your painting. Undo and Redo step through your changes. Save adds the picture to your own gallery. Tap a saved picture to download it.',
 'picture-remix':'Drag any tile onto any other tile to swap them. You can also tap one tile, then another. There is no empty space. Preview shows the whole picture. Hint marks a tile and where it belongs. Put all 16 tiles in their original places to win.',
 'match-quest':'Tap two cards. Matching pictures stay face up. Remember where the others are! Choose animals, space, or food, and six, eight, or twelve pairs. Find every pair to win.',
 'number-quest':'Choose Warm-Up, Adventure, or Challenge. Answer by tapping a stepping stone. Some rounds ask you to tap numbers from smallest to largest. You can try again after a mistake. Ten rounds earn a sticker. The optional timer adds a 90-second challenge.',
 'pattern-beats':'Tap Start, watch and listen, then repeat the pads in the same order. Each pad has its own shape, color, and sound. Every successful round adds another beat. Background music gets quieter during the sequence.',
 'shape-builder':'Choose an animal, house, or boat. Drag a piece close to its matching space: it turns and clicks into place! On a phone you can also tap a piece, then tap its space on the silhouette. Rotate changes the selected piece by 45 degrees. Hint lights up its destination. Guide shows all seven spaces.'
};
let current='home', profile='Zion', controller, cleanup=()=>{}, restart=()=>{}, toastTimer;
let store;
try{store=JSON.parse(localStorage.getItem('zands-play-v1')||'null');}catch{}
store=store||{player:'Zion',music:true,effects:true,players:{}};
profile=store.player==='Samaria'?'Samaria':'Zion';
for(const name of ['Zion','Samaria']) store.players[name]=Object.assign({art:[],design:null,progress:{},stickers:[]},store.players[name]);
const playerData=()=>store.players[profile];
function persist(){try{localStorage.setItem('zands-play-v1',JSON.stringify(store));return true;}catch{toast('The device is full. Download artwork to keep a copy.');return false;}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function title(s){return s.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function modal(html){$('#dialog-body').innerHTML=html;$('#dialog').showModal();}
function on(el,event,fn){if(typeof el==='string')el=$(el);if(el)el.addEventListener(event,fn,{signal:controller.signal});}
function button(id,label,cls=''){return `<button id="${id}" class="${cls}">${label}</button>`;}
function layout(id,toolbar,body){const g=games.find(x=>x[0]===id);app.innerHTML=`<div class="game-head"><div><div class="eyebrow">${profile}'s playtime</div><h1>${g[1]}</h1><p>${g[2]}</p></div>${button('restart','Start over')}</div><section class="surface"><div class="toolbar">${toolbar}</div>${body}</section>`;on('#restart','click',()=>{audio.fx('click');restart();});}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function rand(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function point(event,el,w,h){const r=el.getBoundingClientRect();return{x:(event.clientX-r.left)*w/r.width,y:(event.clientY-r.top)*h/r.height};}
function celebrate(message,id=current,score){audio.fx('win');const p=playerData();const entry=p.progress[id]||{wins:0};entry.wins++;if(score!=null)entry.best=Math.max(entry.best||0,score);p.progress[id]=entry;const rewards=['cat','rocket','star','planet','panda','rabbit','fox','moon','lion','turtle','bear','frog','penguin','owl','dog','mouse'];const sticker=rewards[p.stickers.length%rewards.length];if(!p.stickers.includes(sticker))p.stickers.push(sticker);persist();for(let i=0;i<36;i++){const e=document.createElement('i');e.className='confetti';e.style.left=Math.random()*100+'vw';e.style.top='0';e.style.background=['#ffce32','#f66fae','#319bff','#33c697'][i%4];e.style.animationDelay=Math.random()*.35+'s';document.body.append(e);setTimeout(()=>e.remove(),2400);}toast(message+' You earned a sticker!');}
const audio={music:null,unlocked:false,ducked:false,pool:new Set(),
 unlock(){if(!this.unlocked){this.unlocked=true;this.setMusic(current==='home'?'main-menu':current);}},
 setMusic(id){if(this.music){this.music.pause();this.music.src='';}this.music=null;if(!this.unlocked||!store.music)return;const a=new Audio(`assets/audio/music/${id}.mp3`);a.loop=true;a.volume=this.ducked?.025:.24;this.music=a;a.play().catch(()=>{});},
 duck(v){this.ducked=v;if(this.music)this.music.volume=v?.025:.24;},
 fx(name,pattern=false){if(!this.unlocked||!store.effects)return;const a=new Audio(`assets/audio/${pattern?'pattern-tones':'sfx'}/${name}.wav`);a.volume=.5;this.pool.add(a);const remove=()=>this.pool.delete(a);a.addEventListener('ended',remove,{once:true});a.play().catch(remove);},
 stopFX(){for(const a of this.pool)a.pause();this.pool.clear();}
};
document.addEventListener('pointerdown',()=>audio.unlock(),{once:true});
document.addEventListener('keydown',()=>audio.unlock(),{once:true});
function syncHeader(){$('#player').textContent=profile;$('#music').textContent=store.music?'Music on':'Music off';$('#effects').textContent=store.effects?'Sounds on':'Sounds off';$('#music').setAttribute('aria-pressed',String(store.music));$('#effects').setAttribute('aria-pressed',String(store.effects));}
$('#audio-settings').onclick=()=>{modal('<h2>Music and sounds</h2><p>Choose what you hear while you play.</p><div class="toolbar"><button id="modal-music"></button><button id="modal-effects"></button></div>');const update=()=>{$('#modal-music').textContent=store.music?'Music on':'Music off';$('#modal-effects').textContent=store.effects?'Sounds on':'Sounds off';};$('#modal-music').onclick=()=>{$('#music').click();update();};$('#modal-effects').onclick=()=>{$('#effects').click();update();};update();};$('#home').onclick=()=>navigate('home');$('#close-dialog').onclick=()=>$('#dialog').close();
$('#music').onclick=()=>{audio.unlock();store.music=!store.music;audio.setMusic(current==='home'?'main-menu':current);persist();syncHeader();};
$('#effects').onclick=()=>{store.effects=!store.effects;if(!store.effects)audio.stopFX();persist();syncHeader();};
$('#help').onclick=()=>modal(`<h2>${current==='home'?'Welcome to Z & S Play':games.find(x=>x[0]===current)[1]}</h2><p>${help[current]||'Pick your name, then choose a game. Your artwork, track designs, stickers, and scores save on this device. Music and Sounds have separate switches. Tap Main screen to choose a different game. Use Home to choose a different game.'}</p>`);
$('#player').onclick=()=>{modal('<h2>Who’s playing?</h2><p>Each player has their own artwork, designs, and rewards.</p><div class="player-choice"><button id="choose-zion">Zion</button><button id="choose-samaria">Samaria</button></div>');$('#choose-zion').onclick=()=>switchPlayer('Zion');$('#choose-samaria').onclick=()=>switchPlayer('Samaria');};
function switchPlayer(name){profile=name;store.player=name;persist();$('#dialog').close();syncHeader();navigate('home');}
function navigate(id){if(id!=='home'&&!games.some(g=>g[0]===id))id='home';cleanup();cleanup=()=>{};if(controller)controller.abort();controller=new AbortController();audio.stopFX();audio.duck(false);current=id;audio.setMusic(id==='home'?'main-menu':id);syncHeader();window.scrollTo(0,0);if(id==='home')home();else ({'paint-studio':paint,'picture-remix':remix,'match-quest':memory,'number-quest':numbers,'pattern-beats':beats,'shape-builder':shapes})[id]();}
document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.music?.pause();audio.stopFX();}else if(store.music&&audio.unlocked)audio.music?.play().catch(()=>{});});
function home(){const p=playerData();app.innerHTML=`<section class="welcome"><img src="assets/shared/branding/zands-logo.png" alt="Zion and Samaria with the approved Z and S logo"><div><div class="eyebrow">A little play. A big adventure.</div><h1>What will you play, ${profile}?</h1><p>Six ways to make, think, and explore.</p><div class="player-choice"><button id="pick-zion" class="${profile==='Zion'?'selected':''}">Zion</button><button id="pick-samaria" class="${profile==='Samaria'?'selected':''}">Samaria</button></div></div></section><section class="game-grid" aria-label="Choose a game">${games.map(g=>`<button class="game-card" data-game="${g[0]}" style="--accent:${g[4]}"><img src="assets/shared/menu/${g[0]}.svg" alt=""><strong>${g[1]}</strong><small>${g[3]}</small>${p.progress[g[0]]?`<small>${p.progress[g[0]].wins} ${p.progress[g[0]].wins===1?'celebration':'celebrations'}</small>`:''}</button>`).join('')}</section><div class="rewards"><span>${profile}'s sticker collection</span>${p.stickers.length?p.stickers.map(s=>`<img src="assets/shared/rewards/sticker-${s}.svg" alt="${s} sticker">`).join(''):'<span class="empty-reward">Finish a game or save a creation to earn your first sticker.</span>'}</div>`;on('#pick-zion','click',()=>switchPlayer('Zion'));on('#pick-samaria','click',()=>switchPlayer('Samaria'));document.querySelectorAll('[data-game]').forEach(b=>on(b,'click',()=>navigate(b.dataset.game)));}

function paint(){
 let color=D.palette[0].hex,tool='brush',size=12,page='',drawing=false,undo=[],redo=[],last;
 layout('paint-studio',`<label>Picture <select id="page"><option value="">Blank canvas</option>${Object.keys(D.pages).map(s=>`<option value="${s}">${title(s)}</option>`).join('')}</select></label>${button('paint-undo','Undo')}${button('paint-redo','Redo')}${button('paint-save','Save artwork','primary')}`,
 `<div class="split"><aside class="paint-tools"><div class="palette">${D.palette.map((c,i)=>`<button class="swatch ${i===0?'selected':''}" data-color="${c.hex}" aria-label="${c.name}" style="--color:${c.hex}"><span></span>${c.name}</button>`).join('')}</div><div class="toolbar" style="margin-top:12px">${button('brush','Brush','selected')}${button('eraser','Eraser')}${button('fill','Fill')}</div><label>Brush size <input id="brush-size" type="range" min="3" max="48" value="12" aria-label="Brush size"></label><p class="hint">Your art belongs to ${profile}. Try a coloring page, or start with a blank canvas.</p></aside><div><div id="paint-board" class="paint-board"><svg id="coloring" viewBox="0 0 800 800"></svg><canvas id="paint-canvas" width="800" height="800"></canvas></div><div id="gallery" class="gallery"></div></div></div>`);
 const canvas=$('#paint-canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),svg=$('#coloring');
 const snap=()=>({image:ctx.getImageData(0,0,800,800),svg:svg.innerHTML});
 function saveUndo(){undo.push(snap());if(undo.length>20)undo.shift();redo=[];sync();}
 function restore(s){ctx.putImageData(s.image,0,0);svg.innerHTML=s.svg;}
 function sync(){$('#paint-undo').disabled=!undo.length;$('#paint-redo').disabled=!redo.length;}
 function loadPage(){ctx.clearRect(0,0,800,800);svg.innerHTML=page?D.pages[page]:'';const inner=svg.firstElementChild;if(inner){inner.setAttribute('width','800');inner.setAttribute('height','800');inner.setAttribute('preserveAspectRatio','none');}undo=[];redo=[];sync();}
 function flood(p){const image=ctx.getImageData(0,0,800,800),a=image.data,x=Math.max(0,Math.min(799,Math.floor(p.x))),y=Math.max(0,Math.min(799,Math.floor(p.y))),i=(y*800+x)*4;const target=Array.from(a.slice(i,i+4)),rgb=color.match(/[a-f0-9]{2}/gi).map(h=>parseInt(h,16));if(target.every((v,j)=>v===[...rgb,255][j]))return;const stack=[y*800+x],seen=new Uint8Array(800*800);while(stack.length){const n=stack.pop();if(seen[n])continue;seen[n]=1;const k=n*4;if(!target.every((v,j)=>Math.abs(a[k+j]-v)<28))continue;a[k]=rgb[0];a[k+1]=rgb[1];a[k+2]=rgb[2];a[k+3]=255;const nx=n%800,ny=Math.floor(n/800);if(nx>0)stack.push(n-1);if(nx<799)stack.push(n+1);if(ny>0)stack.push(n-800);if(ny<799)stack.push(n+800);}ctx.putImageData(image,0,0);}
 function regionFill(e){canvas.style.pointerEvents='none';svg.style.pointerEvents='auto';svg.querySelectorAll('svg').forEach(s=>s.style.pointerEvents='auto');const target=document.elementFromPoint(e.clientX,e.clientY);if(target&&target.closest('[data-colorable]'))target.closest('[data-colorable]').setAttribute('fill',color);svg.querySelectorAll('svg').forEach(s=>s.style.pointerEvents='none');svg.style.pointerEvents='none';canvas.style.pointerEvents='auto';}
 function stroke(p){ctx.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,size/2,0,Math.PI*2);ctx.fill();last=p;ctx.globalCompositeOperation='source-over';}
 on(canvas,'pointerdown',e=>{e.preventDefault();saveUndo();const p=point(e,canvas,800,800);if(tool==='fill'){if(page)regionFill(e);else flood(p);audio.fx('paint-pop');return;}drawing=true;last=p;canvas.setPointerCapture(e.pointerId);stroke(p);});
 on(canvas,'pointermove',e=>{if(drawing)stroke(point(e,canvas,800,800));});
 on(canvas,'pointerup',()=>{drawing=false;});on(canvas,'pointercancel',()=>{drawing=false;});
 document.querySelectorAll('[data-color]').forEach(b=>on(b,'click',()=>{color=b.dataset.color;document.querySelectorAll('.swatch').forEach(x=>x.classList.toggle('selected',x===b));}));
 for(const t of ['brush','eraser','fill'])on('#'+t,'click',()=>{tool=t;for(const x of ['brush','eraser','fill'])$('#'+x).classList.toggle('selected',x===t);});
 on('#brush-size','input',e=>size=+e.target.value);on('#page','change',e=>{page=e.target.value;loadPage();});
 on('#paint-undo','click',()=>{if(undo.length){redo.push(snap());restore(undo.pop());sync();}});on('#paint-redo','click',()=>{if(redo.length){undo.push(snap());restore(redo.pop());sync();}});
 function gallery(){$('#gallery').innerHTML=playerData().art.map((a,i)=>`<div><button data-art="${i}" aria-label="Download saved artwork ${i+1}"><img src="${a}" alt="Saved artwork ${i+1}"></button><br><button data-delete-art="${i}">Remove</button></div>`).join('');document.querySelectorAll('[data-art]').forEach(b=>on(b,'click',()=>{const a=document.createElement('a');a.href=playerData().art[+b.dataset.art];a.download=`${profile}-art-${+b.dataset.art+1}.png`;a.click();}));document.querySelectorAll('[data-delete-art]').forEach(b=>on(b,'click',()=>{const i=+b.dataset.deleteArt;modal(`<h2>Remove this artwork?</h2><p>Download a copy first if you want to keep it.</p><img src="${playerData().art[i]}" alt="Artwork to remove">${button('confirm-remove-art','Remove artwork')}`);$('#confirm-remove-art').onclick=()=>{playerData().art.splice(i,1);persist();$('#dialog').close();gallery();};}));}
 on('#paint-save','click',async()=>{const out=document.createElement('canvas');out.width=800;out.height=800;const c=out.getContext('2d');c.fillStyle='white';c.fillRect(0,0,800,800);if(page){const xml=new XMLSerializer().serializeToString(svg);const img=new Image();const u=URL.createObjectURL(new Blob([xml],{type:'image/svg+xml'}));try{await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=u;});c.drawImage(img,0,0,800,800);}catch{toast('Could not save the coloring page. Try again.');URL.revokeObjectURL(u);return;}URL.revokeObjectURL(u);}c.drawImage(canvas,0,0);const art=playerData().art;if(art.length>=12){toast('Your gallery is full. Download a picture, then remove it to make room.');return;}art.push(out.toDataURL('image/png'));if(persist()){gallery();celebrate('Masterpiece saved!');}else art.pop();});
 restart=()=>{loadPage();toast('Fresh canvas!');};loadPage();gallery();
}

function remix(){
 const names=Object.keys(D.pages);let picture=names[0],tiles=[],moves=0,selected=null,drag=null,won=false,hint=false;
 layout('picture-remix',`<label>Picture <select id="remix-picture">${names.map(s=>`<option value="${s}">${title(s)}</option>`).join('')}</select></label><span id="moves" class="stat">0 moves</span>${button('preview','Preview')}${button('remix-hint','Hint')}`,'<div id="remix-board" class="remix-board" aria-label="Four by four picture puzzle"></div>');
 const board=$('#remix-board');
 function draw(){board.innerHTML=tiles.map((v,i)=>`<button class="tile ${selected===i?'active':''}" data-slot="${i}" aria-label="Tile ${v+1} at position ${i+1}" style="background-image:url(assets/picture-remix/images/${picture}.svg);background-position:${v%4*100/3}% ${Math.floor(v/4)*100/3}%">${hint?`<span class="slot-number">Place ${i+1}</span><b>Tile ${v+1}</b>`:''}</button>`).join('');$('#moves').textContent=moves+' moves';}
 function swap(a,b){if(a===b||won)return;[tiles[a],tiles[b]]=[tiles[b],tiles[a]];moves++;selected=null;hint=false;audio.fx('place');draw();if(tiles.every((v,i)=>v===i)){won=true;celebrate(`Picture complete in ${moves} moves!`,'picture-remix',Math.max(1,100-moves));}}
 function begin(){tiles=shuffle(Array.from({length:16},(_,i)=>i));if(tiles.every((v,i)=>v===i))[tiles[0],tiles[1]]=[tiles[1],tiles[0]];moves=0;won=false;selected=null;hint=false;draw();}
 on(board,'pointerdown',e=>{const b=e.target.closest('[data-slot]');if(!b)return;drag={slot:+b.dataset.slot,x:e.clientX,y:e.clientY};b.setPointerCapture(e.pointerId);b.classList.add('active');});
 on(board,'pointerup',e=>{if(!drag)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]'),from=drag.slot,moved=Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>10;drag=null;if(target&&moved)swap(from,+target.dataset.slot);else if(selected!=null&&selected!==from)swap(selected,from);else{selected=selected===from?null:from;draw();}});
 on(board,'pointercancel',()=>{drag=null;draw();});
 on('#preview','click',()=>modal(`<h2>${title(picture)}</h2><img src="assets/picture-remix/images/${picture}.svg" alt="Complete puzzle picture">`));
 on('#remix-hint','click',()=>{hint=true;selected=tiles.findIndex((v,i)=>v!==i);draw();if(selected>=0)toast(`Tile ${tiles[selected]+1} belongs in position ${tiles[selected]+1}.`);});
 on('#remix-picture','change',e=>{picture=e.target.value;begin();});restart=begin;begin();
}

function memory(){
 const themes={animals:['bear','cat','dog','fox','frog','lion','mouse','owl','panda','penguin','rabbit','turtle'],space:['astronaut','comet','earth','galaxy','meteor','moon','planet','rocket','satellite','star','sun','ufo'],food:['apple','banana','carrot','cookie','cupcake','grapes','ice-cream','orange','pear','pizza','strawberry','watermelon']};
 let theme='animals',pairs=6,cards=[],open=[],matched=new Set(),locked=false,moves=0,epoch=0;
 layout('match-quest',`<label>Theme <select id="theme"><option>animals</option><option>space</option><option>food</option></select></label><label>Pairs <select id="pairs"><option>6</option><option>8</option><option>12</option></select></label><span id="memory-score" class="stat"></span>`,'<div id="memory-grid" class="memory-grid"></div>');
 const grid=$('#memory-grid');
 function draw(){grid.style.gridTemplateColumns=`repeat(${pairs===12?6:4},1fr)`;grid.innerHTML=cards.map((c,i)=>`<button class="memory-card ${open.includes(i)||matched.has(i)?'open':''} ${matched.has(i)?'matched':''}" data-card="${i}" aria-label="${open.includes(i)||matched.has(i)?title(c):'Face-down card '+(i+1)}" ${matched.has(i)?'disabled':''}><div class="inner"><div class="back"><img src="assets/match-quest/card-back.svg" alt=""></div><div class="front"><img src="assets/match-quest/cards/${theme}/${c}.svg" alt="${title(c)}"></div></div></button>`).join('');$('#memory-score').textContent=`${matched.size/2}/${pairs} pairs · ${moves} turns`;}
 function begin(){epoch++;cards=shuffle([...shuffle([...themes[theme]]).slice(0,pairs)].flatMap(c=>[c,c]));open=[];matched=new Set();moves=0;locked=false;draw();}
 on(grid,'click',e=>{const b=e.target.closest('[data-card]');if(!b||locked)return;const i=+b.dataset.card;if(matched.has(i)||open.includes(i))return;open.push(i);audio.fx('card-flip');draw();if(open.length===2){moves++;locked=true;const token=epoch;const same=cards[open[0]]===cards[open[1]];setTimeout(()=>{if(token!==epoch||current!=='match-quest')return;if(same){open.forEach(x=>matched.add(x));audio.fx('correct');}open=[];locked=false;draw();if(matched.size===cards.length)celebrate(`All ${pairs} pairs found!`,'match-quest',Math.max(1,100-moves));},same?420:950);}});
 on('#theme','change',e=>{theme=e.target.value;begin();});on('#pairs','change',e=>{pairs=+e.target.value;begin();});cleanup=()=>epoch++;restart=begin;begin();
}

function numbers(){
 const numberSignal=controller.signal;
 let level='Warm-Up',round=0,score=0,answer=null,choices=[],order=[],picked=[],mode='',timer=null,seconds=90,timed=false,active=true,epoch=0;
 layout('number-quest',`<label>Level <select id="number-level"><option>Warm-Up</option><option>Adventure</option><option>Challenge</option></select></label><label><input id="timed" type="checkbox">90-second challenge</label><span id="number-score" class="stat"></span><span id="number-timer" class="stat" hidden></span>`,'<div class="number-stage"><div id="number-prompt" class="hint"></div><div id="question" class="question"></div><div id="answers" class="answers"></div></div>');
 function stats(){$('#number-score').textContent=`Round ${Math.min(round+1,10)}/10 · ${score} stars`;$('#number-timer').hidden=!timed;$('#number-timer').textContent=seconds+' seconds';}
 function finish(expired=false){epoch++;active=false;clearInterval(timer);$('#answers').innerHTML=button('number-again','Play again','primary');$('#question').textContent=expired?'Time to take a breath!':'Adventure complete!';$('#number-prompt').textContent=`You collected ${score} stars.`;on('#number-again','click',begin);if(score>0)celebrate(`You collected ${score} stars!`,'number-quest',score);}
 function newQuestion(){if(round>=10){finish();return;}picked=[];active=true;const type=round%5;let text,prompt='Tap the stepping stone with the answer.';mode='answer';
 if(type===4){mode='order';const max=level==='Warm-Up'?20:level==='Adventure'?99:250;order=shuffle(Array.from({length:max},(_,i)=>i+1)).slice(0,4).sort((a,b)=>a-b);choices=shuffle([...order]);text='Smallest to largest';prompt='Tap all four numbers in order.';}
 else if(type===2){const max=level==='Warm-Up'?20:level==='Adventure'?99:500;const a=rand(1,max),b=rand(1,max);text=`${a}  ?  ${b}`;answer=a>b?'>':a<b?'<':'=';choices=['<','=','>'];prompt='Choose less than, equal to, or greater than.';}
 else if(type===3){const step=level==='Warm-Up'?rand(2,3):level==='Adventure'?[2,5,10][rand(0,2)]:[3,4,6,7,8][rand(0,4)],start=rand(0,5)*step;answer=start+3*step;text=`${start}, ${start+step}, ${start+2*step}, ?`;prompt='What comes next in the pattern?';choices=options(answer,step);}
 else if(level==='Challenge'){const a=rand(2,12),b=rand(2,10);if(type===0){answer=a*b;text=`${a} × ${b} = ?`;}else{answer=a;text=`${a*b} ÷ ${b} = ?`;}choices=options(answer,rand(1,6));}
 else {let a,b;if(level==='Warm-Up'){a=rand(1,19);b=rand(0,type===0?20-a:a);}else{a=rand(20,79);b=rand(10,type===0?99-a:a);}if(type===0){answer=a+b;text=`${a} + ${b} = ?`;}else if(level==='Adventure'&&round===6){answer=b;text=`${a} − ? = ${a-b}`;}else{answer=a-b;text=`${a} − ${b} = ?`;}choices=options(answer,rand(1,5));}
 $('#question').textContent=text;$('#number-prompt').textContent=prompt;$('#answers').innerHTML=choices.map((v,i)=>`<button class="answer" data-answer="${i}">${esc(v)}</button>`).join('');stats();}
 function options(a,step){const s=new Set([a,Math.max(0,a+step),Math.max(0,a-step),a+step*2]);while(s.size<4)s.add(rand(0,Math.max(20,a+20)));return shuffle([...s]);}
 on('#answers','click',e=>{const b=e.target.closest('[data-answer]');if(!b||!active||b.disabled)return;const v=choices[+b.dataset.answer],correct=mode==='order'?v===order[picked.length]:v===answer;if(!correct){b.classList.add('wrong');audio.fx('retry');toast('Try another stone. You can do it!');return;}b.classList.add('correct');b.disabled=true;audio.fx('correct');if(mode==='order'){picked.push(v);if(picked.length<4)return;}score++;round++;active=false;const token=epoch;setTimeout(()=>{if(!numberSignal.aborted&&token===epoch)newQuestion();},550);});
 function begin(){epoch++;clearInterval(timer);round=0;score=0;seconds=90;active=true;newQuestion();if(timed)timer=setInterval(()=>{if(document.hidden||$('#dialog').open)return;seconds--;stats();if(seconds<=0)finish(true);},1000);}
 on('#number-level','change',e=>{level=e.target.value;begin();});on('#timed','change',e=>{timed=e.target.checked;begin();});restart=begin;cleanup=()=>clearInterval(timer);begin();
}

function beats(){
 let sequence=[],entered=0,listening=false,playing=false,epoch=0,best=playerData().progress['pattern-beats']?.best||0;
 layout('pattern-beats',`${button('beats-start','Start','primary')}${button('beats-repeat','Hear again')}<span id="beats-score" class="stat">Best: ${best} beats</span>`, '<p id="beats-prompt" style="text-align:center">Watch the pattern, then make it yours.</p><div class="pads">'+[1,2,3,4].map(i=>`<button class="pad" data-pad="${i-1}" aria-label="${['Red circle','Blue square','Yellow triangle','Green star'][i-1]}"><img src="assets/pattern-beats/pads/pad-${i}.svg" alt=""></button>`).join('')+'</div>');
 const pads=[...document.querySelectorAll('[data-pad]')],wait=ms=>new Promise(r=>setTimeout(r,ms));
 async function flash(i,time=430){pads[i].classList.add('lit');audio.fx('pad-'+(i+1),true);await wait(time);pads[i].classList.remove('lit');}
 async function play(){const token=++epoch;listening=true;entered=0;audio.duck(true);$('#beats-repeat').disabled=true;$('#beats-prompt').textContent='Watch and listen…';await wait(650);for(const i of sequence){if(token!==epoch)return;await flash(i);await wait(160);}if(token!==epoch)return;audio.duck(false);listening=false;$('#beats-repeat').disabled=false;$('#beats-prompt').textContent=`Your turn! Repeat ${sequence.length} ${sequence.length===1?'beat':'beats'}.`;$('#beats-score').textContent=`${sequence.length} beats · Best: ${best}`;}
 function begin(){epoch++;playing=true;sequence=[rand(0,3)];play();}
 on('#beats-start','click',begin);on('#beats-repeat','click',()=>{if(playing&&!listening)play();});
 pads.forEach((p,i)=>on(p,'pointerdown',async()=>{if(!playing||listening)return;flash(i,240);if(sequence[entered]!==i){playing=false;epoch++;audio.duck(false);audio.fx('retry');$('#beats-prompt').textContent=`Good practice! You finished ${Math.max(0,sequence.length-1)} beats. Tap Start to try again.`;return;}entered++;if(entered===sequence.length){listening=true;const length=sequence.length;best=Math.max(best,length);if(length%4===0)celebrate(`${length} beats remembered!`,'pattern-beats',best);else {const entry=playerData().progress['pattern-beats']||{wins:0};entry.best=best;playerData().progress['pattern-beats']=entry;persist();audio.fx('correct');}$('#beats-prompt').textContent='Great rhythm! One more beat…';const token=epoch;await wait(950);if(token!==epoch||!playing)return;sequence.push(rand(0,3));play();}}));
 restart=begin;cleanup=()=>{epoch++;playing=false;audio.duck(false);};$('#beats-repeat').disabled=true;
}

function shapes(){
 const colors={'large-a':'#ef6460','large-b':'#f2a74e',medium:'#f5cd55','small-a':'#9abf65','small-b':'#63b893',square:'#55babe',parallelogram:'#689bea'};
 const labels={'large-a':'Big triangle 1','large-b':'Big triangle 2',medium:'Medium triangle','small-a':'Small triangle 1','small-b':'Small triangle 2',square:'Square',parallelogram:'Parallelogram'};
 let mobile=window.matchMedia('(max-width:700px)').matches,W=mobile?600:900,H=mobile?860:650;
 let puzzleIndex=0,pieces=[],selected=0,drag=null,showGuide=false,hintPiece=-1,won=false;
 const options=['Animals','Houses','Boats'].map(c=>`<optgroup label="${c}">${D.tangrams.map((p,i)=>p.category===c?`<option value="${i}">${p.name}</option>`:'').join('')}</optgroup>`).join('');
 layout('shape-builder',`<label>Build <select id="shape-puzzle">${options}</select></label>${button('rotate-left','Rotate left')}${button('rotate-right','Rotate right')}${button('shape-hint','Hint')}${button('shape-guide','Guide')}<span id="shape-score" class="stat">0/7 pieces</span>`, `<svg id="shape-board" class="shape-board" viewBox="0 0 ${W} ${H}" aria-label="Tangram puzzle"><g id="shape-target"></g><g id="shape-pieces"></g></svg><div id="piece-selector" class="piece-selector" aria-label="Select a tangram piece"></div><p class="hint">Drag close to its space to click into place. Or tap a piece, then tap its matching space.</p>`);
 const board=$('#shape-board'),target=$('#shape-target'),group=$('#shape-pieces');
 function sizeBoard(){board.setAttribute('viewBox',`0 0 ${W} ${H}`);board.style.aspectRatio=`${W} / ${H}`;board.style.width=mobile?'min(100%, calc(68vh * 600 / 860))':'100%';board.style.maxHeight='none';}
 sizeBoard();
 const centroid=p=>({x:p.reduce((a,v)=>a+v[0],0)/p.length,y:p.reduce((a,v)=>a+v[1],0)/p.length});
 const rotate=(v,a)=>{const r=a*Math.PI/180;return[v[0]*Math.cos(r)-v[1]*Math.sin(r),v[0]*Math.sin(r)+v[1]*Math.cos(r)];};
 const vertices=p=>p.local.map(v=>{const [x,y]=rotate(v,p.angle);return[x+p.x,y+p.y];});
 const targetPoints=p=>p.local.map(v=>[v[0]+p.tx,v[1]+p.ty]);
 const points=v=>v.map(x=>x.join(',')).join(' ');
 function draw(){
  target.innerHTML=pieces.map((p,i)=>`<polygon points="${points(targetPoints(p))}" fill="${showGuide?colors[p.id]:hintPiece===i?'#e5b759':'#353c58'}" stroke="${showGuide?'white':'#353c58'}" stroke-width="${showGuide?2:0}"/>`).join('');
  group.innerHTML=pieces.map((p,i)=>`<polygon class="shape-piece ${i===selected?'selected-piece':''} ${p.locked?'locked':''} ${p.flash?'just-snapped':''}" data-piece="${i}" points="${points(vertices(p))}" fill="${colors[p.id]}" aria-label="${labels[p.id]}"/>`).join('');
  $('#shape-score').textContent=pieces.filter(p=>p.locked).length+'/7 clicked in';
  $('#piece-selector').innerHTML=pieces.map((p,i)=>`<button data-select-piece="${i}" class="${i===selected?'selected':''}" style="--piece-color:${colors[p.id]}" ${p.locked?'disabled':''}><i></i>${labels[p.id]}</button>`).join('');
 }
 function begin(){
  const puzzle=D.tangrams[puzzleIndex],scale=mobile?Math.min(420/puzzle.viewBox[2],290/puzzle.viewBox[3]):Math.min(350/puzzle.viewBox[2],450/puzzle.viewBox[3]);
  const off=mobile?{x:(W-puzzle.viewBox[2]*scale)/2,y:35+(310-puzzle.viewBox[3]*scale)/2}:{x:480+(380-puzzle.viewBox[2]*scale)/2,y:75+(480-puzzle.viewBox[3]*scale)/2};
  pieces=puzzle.pieces.map((p,i)=>{const pts=p.targetVertices.map(v=>[v[0]*scale+off.x,v[1]*scale+off.y]),c=centroid(pts);const piece={id:p.piece,local:pts.map(v=>[v[0]-c.x,v[1]-c.y]),tx:c.x,ty:c.y,x:mobile?100+(i%3)*200:120+(i%2)*220,y:mobile?450+Math.floor(i/3)*155:140+Math.floor(i/2)*145,angle:rand(0,7)*45,locked:false,flash:false};const v=vertices(piece),xs=v.map(q=>q[0]),ys=v.map(q=>q[1]);piece.x+=Math.max(0,12-Math.min(...xs))-Math.max(0,Math.max(...xs)-(mobile?W-12:448));piece.y+=Math.max(0,(mobile?365:55)-Math.min(...ys))-Math.max(0,Math.max(...ys)-H+15);return piece;});
  selected=0;hintPiece=-1;showGuide=false;won=false;$('#shape-guide').classList.remove('selected');draw();
 }
 function snap(){const p=pieces[selected];if(!p||p.locked)return;const radius=mobile?65:45;if(Math.hypot(p.x-p.tx,p.y-p.ty)<radius){p.x=p.tx;p.y=p.ty;p.angle=0;p.locked=true;p.flash=true;hintPiece=-1;audio.fx('snap');if(pieces.every(p=>p.locked)&&!won){won=true;celebrate(`${D.tangrams[puzzleIndex].name} complete!`);}else toast('Click! A perfect fit.');}draw();}
 on('#piece-selector','click',e=>{const b=e.target.closest('[data-select-piece]');if(b){selected=+b.dataset.selectPiece;draw();}});
 on(board,'pointerdown',e=>{e.preventDefault();const q=point(e,board,W,H),el=e.target.closest('[data-piece]');if(el){const i=+el.dataset.piece;if(pieces[i].locked)return;selected=i;const p=pieces[i];drag={dx:q.x-p.x,dy:q.y-p.y};board.setPointerCapture(e.pointerId);draw();audio.fx('pickup');}else{const p=pieces[selected];if(p&&!p.locked&&Math.hypot(q.x-p.tx,q.y-p.ty)<(mobile?65:45)){p.x=q.x;p.y=q.y;snap();}}});
 on(board,'pointermove',e=>{if(!drag)return;const q=point(e,board,W,H),p=pieces[selected];p.x=Math.max(10,Math.min(W-10,q.x-drag.dx));p.y=Math.max(10,Math.min(H-10,q.y-drag.dy));draw();});
 on(board,'pointerup',()=>{if(drag){drag=null;snap();}});on(board,'pointercancel',()=>drag=null);
 function turn(n){const p=pieces[selected];if(p&&!p.locked){p.angle=(p.angle+n+360)%360;audio.fx('rotate');snap();}}
 on('#rotate-left','click',()=>turn(-45));on('#rotate-right','click',()=>turn(45));on('#shape-hint','click',()=>{if(pieces[selected]?.locked)selected=pieces.findIndex(p=>!p.locked);hintPiece=selected;draw();toast('The gold space is this pieceâ€™s destination.');});on('#shape-guide','click',()=>{showGuide=!showGuide;$('#shape-guide').classList.toggle('selected',showGuide);draw();});on('#shape-puzzle','change',e=>{puzzleIndex=+e.target.value;begin();});
 on(window,'resize',()=>{const next=window.matchMedia('(max-width:700px)').matches;if(next===mobile)return;const locked=pieces.map(p=>p.locked),finished=won;mobile=next;W=mobile?600:900;H=mobile?860:650;sizeBoard();begin();locked.forEach((value,i)=>{if(value){pieces[i].locked=true;pieces[i].x=pieces[i].tx;pieces[i].y=pieces[i].ty;pieces[i].angle=0;}});won=finished;selected=Math.max(0,pieces.findIndex(p=>!p.locked));draw();});
 restart=begin;begin();
}

window.ZANDS={navigate,get player(){return profile;},get data(){return store;}};
navigate('home');
})();
