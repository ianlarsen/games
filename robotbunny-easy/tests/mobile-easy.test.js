import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../easy-mode.js',import.meta.url),'utf8'),context);
const easy=context.RobotBunnyEasy;
test('assisted jumps land at center in both directions despite frame rate and moving platforms',()=>{
 for(const hz of [30,60,120])for(const direction of [-1,1])for(const targetY of [160,280,400]){
  const p={x:500,y:336,w:40,h:64,onGround:true};
  const target={x:500+direction*320,y:targetY,w:130,type:'platform',crumble:true};
  const jump=easy.beginJump(p,target,direction,480);
  assert.equal(target.crumble,false);
  for(let n=0;n<hz*2;n++){target.y=targetY+Math.sin(n/hz)*20;if(easy.stepJump(p,jump,1/hz))break;}
  assert.equal(p.y+p.h,target.y);assert.equal(p.x+p.w/2,target.x+target.w/2);assert.ok(p.onGround);
 }
});
test('platform selection follows travel direction and skips fallen platforms',()=>{
 const p={x:500,y:336,w:40,h:64};
 const left={x:300,y:300,w:130,type:'platform'};
 const right={x:700,y:320,w:130,type:'platform'};
 assert.equal(easy.nextPlatform([left,right],p,1),right);
 assert.equal(easy.nextPlatform([left,right],p,-1),left);
 assert.equal(easy.nextPlatform([{...right,crumbleFalling:true}],p,1),null);
});
test('when platforms end, jumps land safely on the floor',()=>{
 const p={x:100,y:300,w:40,h:64,onGround:false};
 const jump=easy.beginJump(p,null,1,480);
 for(let n=0;n<100;n++)if(easy.stepJump(p,jump,1/60))break;
 assert.equal(p.y+p.h,480);assert.ok(p.onGround);
});
test('closest enemy or boss is targeted with constant laser speed',()=>{
 const enemy={x:300,y:300,w:40,h:40,health:2};
 const boss={x:100,y:100,w:100,h:100,health:10};
 const v=easy.aim({x:150,y:300},[enemy,boss],1,700);
 assert.equal(v.vx,0);assert.equal(v.vy,-700);
 assert.equal(easy.aim({x:150,y:300},[], -1,700).vx,-700);
});
test('published entry is playable HTML using local assets and classic scripts',()=>{
 const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('<canvas'));assert.ok(html.includes('src="easy-mode.js"'));
 assert.ok(html.includes('public/images/landing-logo.png'));assert.ok(!html.includes('type="module"'));
 new vm.Script(html.match(/<script>\s*([\s\S]*?)<\/script>/)[1]);
});
