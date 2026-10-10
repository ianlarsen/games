import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Music } from '../phaser/src/game/music.js';
import { FileSounds } from '../phaser/src/game/fileSounds.js';

class AudioStub {
  constructor() { this.src=''; this.paused=true; this.loads=0; this.plays=0; }
  pause(){this.paused=true;}
  play(){this.paused=false;this.plays++;return Promise.resolve();}
  load(){this.loads++;}
  removeAttribute(name){if(name==='src')this.src='';}
}
const music=new Music('https://example.test/music.mp3',()=>new AudioStub());
music.setActive(true);assert.equal(music.audio.src,'');assert.equal(music.audio.plays,0);
music.setEnabled(true);assert.equal(music.audio.plays,1);assert.equal(music.audio.preload,'none');
music.setActive(false);assert(music.audio.paused);
music.setEnabled(false);music.setActive(true);assert.equal(music.audio.plays,1);
music.destroy();assert.equal(music.audio.src,'');
const sounds=new FileSounds('file:///bundle/www/sounds/',()=>new AudioStub());
sounds.play('laser',.2);sounds.play('laser',.2);sounds.play('laser',.2);
assert.equal(sounds.pools.get('laser').length,2);
assert.equal(sounds.pools.get('laser').reduce((n,a)=>n+a.plays,0),2);
sounds.stop();assert(sounds.pools.get('laser').every(a=>a.paused));
sounds.destroy();assert.equal(sounds.pools.size,0);

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
function section(start,end){const a=script.indexOf(start),b=script.indexOf(end,a);assert(a>=0&&b>a);return script.slice(a,b);}
const maps=['imageSources','musicSources','sfxSources'].map(name=>section('  const '+name+' = {','  };')+'  };').join('\n');
const declarations=section('  const initialImageSources =','  let assetsLoaded');
const assetFunctions=section('  function assetLoaded()','  function fit()');
for(const protocol of ['https:','file:']){
 const loadedImages=[],createdAudio=[],ui={};let fetches=0;
 class ImageStub{set src(value){loadedImages.push(value);if(value)queueMicrotask(()=>this.onload?.());}}
 class LegacyAudio extends AudioStub{constructor(){super();createdAudio.push(this);}addEventListener(){}}
 const context=vm.createContext({console,location:{protocol},Image:ImageStub,Audio:LegacyAudio,queueMicrotask,
  document:{getElementById:id=>ui[id]||(ui[id]={style:{}})},
  fetch:()=>{fetches++;return Promise.resolve({arrayBuffer:()=>Promise.resolve(new ArrayBuffer(8))});}});
 vm.runInContext(maps+declarations+`let assetsLoaded=0,gameReady=false,_bgCacheKey='';const assets={},sfxArrayBuffers={},fileSfxPools={};const bundledFiles=location.protocol==='file:';`+assetFunctions+`loadAssets();globalThis.getState=()=>({assets,gameReady,initialImageSources,assetsLoaded,assetsToLoad,sfxArrayBuffers});globalThis.loadBackground=loadLevelBackground;`,context);
 await new Promise(resolve=>setImmediate(resolve));
 const state=context.getState();assert(state.gameReady,'Slow music must not block readiness');
 assert(!loadedImages.some(src=>/earth|mercury|neptune/.test(src)),'Future backgrounds should not load at startup');
 assert(createdAudio.every(a=>a.preload==='none'&&a.loads===0),'No eager long music downloads');
 assert.equal(fetches,protocol==='file:'?0:9);
 context.loadBackground(2);context.loadBackground(3);
 assert(!context.getState().assets.bg2);assert(context.getState().assets.bg3);
}
const frameFunction=section('  function frame(now) {','  // INITIALIZE');
for(const hz of [30,60,120]){
 let ticks=0,draws=0;
 const context=vm.createContext({Math,document:{hidden:false},update:()=>ticks++,draw:()=>draws++,requestAnimationFrame:()=>{}});
 vm.runInContext(`let last=0,accumulator=0;const fixedStep=1/60;let nextDraw=0,lastDraw=0,gameStarted=true,paused=false,renderRequested=true,smoothedFps=60,fpsUpdateTimer=0,fpsDisplayValue=60;`+frameFunction+'globalThis.step=frame;',context);
 for(let n=1;n<=hz*10;n++)context.step(n*1000/hz);
 assert(ticks>=599&&ticks<=600,'Simulation must retain 60 Hz at '+hz+' Hz');
 assert(draws<=601,'Rendering must not double on ProMotion');
 assert(draws>=Math.min(hz,60)*10-2,'Rendering must not unnecessarily skip frames');
 console.log(hz+' Hz input: '+ticks+' physics ticks, '+draws+' draws in 10 seconds');
}
const built=fs.readFileSync(new URL('../engine/index.html',import.meta.url),'utf8');
assert(!built.includes('type="module"'));assert(built.includes('<script defer'));
const entry=built.match(/src="(.+?\.js)"/)[1];
new vm.Script(fs.readFileSync(new URL('../engine/'+entry,import.meta.url),'utf8'));
console.log('PASS: lazy startup, bounded audio, music lifecycle, 30/60/120 Hz timing and classic bundled entry.');
