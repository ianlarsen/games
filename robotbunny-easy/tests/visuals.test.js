import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const sandbox=vm.createContext({Map,Promise,Error,Math});
vm.runInContext(fs.readFileSync(new URL('../visuals.js',import.meta.url),'utf8'),sandbox);
const {bossImageKey,createImageLoader,layout}=sandbox.RobotBunnyVisuals;
test('all ten boss variants reference artwork that exists',()=>{
 for(const type of ['squid','mantis','sal'])for(const variant of ['plain','armor','spike'])assert.ok(fs.existsSync(new URL('../public/images/'+bossImageKey(type,variant)+'.png',import.meta.url)));
 assert.equal(bossImageKey('squid','spike'),'squid_armor_spike');
 assert.ok(fs.existsSync(new URL('../public/images/'+bossImageKey('chimiera','plain')+'.png',import.meta.url)));
});
test('portrait and landscape art cover the full game viewport',()=>{
 for(const [w,h]of [[960,560],[844,390],[390,844]])for(const [iw,ih]of [[1536,1024],[1024,1536],[300,600]]){
  const g=layout(w,h,iw,ih);assert.ok(g.fullWidth>=w);assert.ok(g.fullHeight>=h);assert.ok(g.y<=0);assert.ok(g.y+g.fullHeight>=h);assert.ok(g.period>0);
 }
});
test('failed image retries and simultaneous requests share one load',async()=>{
 let attempts=0;const assets={};
 const loader=createImageLoader({assets,sources:{planet:'planet.png'},delay:async()=>{},makeImage:()=>({set src(value){attempts++;queueMicrotask(()=>{if(attempts<3)this.onerror();else{this.complete=true;this.naturalWidth=1024;this.onload();}});}})});
 const [a,b]=await Promise.all([loader.load('planet'),loader.load('planet')]);
 assert.equal(a,b);assert.equal(attempts,3);assert.equal(await loader.load('planet'),a);
});
test('exhausted image requests can retry later without a poisoned cache',async()=>{
 let fail=true;const assets={};const loader=createImageLoader({assets,sources:{planet:'planet.png'},delay:async()=>{},makeImage:()=>({set src(value){queueMicrotask(()=>{if(fail)this.onerror();else{this.complete=true;this.naturalWidth=100;this.onload();}});}})});
 await assert.rejects(loader.load('planet'));assert.equal(assets.planet,undefined);
 fail=false;assert.ok((await loader.load('planet')).naturalWidth>0);
});
