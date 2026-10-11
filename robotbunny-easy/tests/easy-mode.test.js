import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aimedVelocity, landingPlatform, assistedVelocity } from '../phaser/src/game/easyMode.js';
import { makeCourse } from '../phaser/src/game/course.js';
test('aim chooses nearest valid body, including sleeping boss, regardless of facing',()=>{
 const enemy={active:true,body:{enable:true,center:{x:300,y:0}}};
 const boss={active:true,hp:8,body:{enable:true,center:{x:0,y:100}}};
 assert.deepEqual(aimedVelocity({x:0,y:0},[enemy,boss],-1),{x:0,y:760});
 boss.hp=0;assert.deepEqual(aimedVelocity({x:0,y:0},[enemy,boss],-1),{x:760,y:0});
 enemy.body.enable=false;assert.deepEqual(aimedVelocity({x:0,y:0},[enemy,boss],-1),{x:-760,y:0});
});
test('diagonal aim retains speed; empty and coincident targets remain finite',()=>{
 const v=aimedVelocity({x:0,y:0},[{active:true,x:3,y:4}],1);
 assert.equal(Math.hypot(v.x,v.y),760);
 assert.deepEqual(aimedVelocity({x:0,y:0},[],1),{x:760,y:0});
 assert.deepEqual(aimedVelocity({x:0,y:0},[{active:true,x:0,y:0}],1),{x:760,y:0});
});
test('each easy course has reachable steps and small gaps across sectors',()=>{
 for(let level=1;level<=20;level++){
 const ps=makeCourse(level).platforms;
 assert.ok(480-ps[0].y<=100);
 for(let i=1;i<ps.length;i++){
 const a=ps[i-1],b=ps[i];assert.ok(b.x-a.x<=340);
 assert.ok(Math.abs(a.y-b.y)<=100);assert.ok(b.x-b.width/2-(a.x+a.width/2)<=20);
 assert.equal(landingPlatform(ps,a.x,a.y,1),b);
 }
 }
});
test('landing assistance stops at center and respects manual direction',()=>{
 const p={x:200,y:420,width:240};
 assert.equal(landingPlatform([p],100,480,1),p);
 assert.equal(landingPlatform([p],100,480,-1),null);
 assert.equal(landingPlatform([p],100,480,0),null);
 assert.equal(assistedVelocity(100,p,1),320);
 assert.equal(assistedVelocity(200,p,1),0);
});
