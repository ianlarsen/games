import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare,resample,canAppend,distance,sampleSpiral,presetPath,buildTrack,intersection,SPACING,MAX_DOMINOES} from './path.js';

test('domino spacing stays uniform across uneven input segments',()=>{
  const result=resample([{x:0,z:0},{x:.12,z:0},{x:3,z:0},{x:3.1,z:0},{x:10,z:0}]);
  assert.equal(result.length,14);
  for(let i=1;i<result.length;i++)assert.ok(Math.abs(distance(result[i-1],result[i])-SPACING)<1e-8);
});
for(const name of ['spiral','switchback','circuit','maze','ribbon'])test(`${name} preset fits the floor, avoids collisions, and keeps its complete route`,()=>{
  const raw=presetPath(name),points=prepare(raw);
  assert.ok(points.length>=100&&points.length<MAX_DOMINOES,`${points.length} dominoes`);
  assert.ok(distance(points.at(-1),raw.at(-1))<SPACING,'preset end was not truncated');
  for(let i=0;i<points.length;i++){
    const a=points[i];assert.ok(Math.abs(a.x)<=23&&Math.abs(a.z)<=13.5);
    for(let j=i+5;j<points.length;j++)assert.ok(distance(a,points[j])>1.2,`${name}: segments ${i} and ${j} are too close`);
  }
});
test('freehand crossings are accepted',()=>{
  const points=[{x:-4,z:0},{x:4,z:0},{x:6,z:3},{x:0,z:4},{x:0,z:2}];
  assert.equal(canAppend(points,{x:0,z:-2}),'');
});
test('tight reversals and out of bounds points are rejected',()=>{
  assert.match(canAppend([{x:0,z:0},{x:1,z:0},{x:2,z:0}],{x:1.5,z:0}),/wider/);
  assert.match(canAppend([],{x:61,z:0}),/drawing area/);
  assert.match(canAppend([],{x:NaN,z:0}),/drawing area/);
});
test('empty and short paths remain safe, and the renderer budget is bounded',()=>{
  assert.deepEqual(prepare([]),[]);
  assert.equal(prepare([{x:0,z:0}]).length,1);
  assert.equal(resample([{x:0,z:0},{x:10000,z:0}]).length,MAX_DOMINOES);
});
test('sample spiral is on the tabletop and has gentle, well spaced turns',()=>{
  const points=prepare(sampleSpiral());assert.ok(points.length>100&&points.length<=MAX_DOMINOES);
  for(let i=0;i<points.length;i++){
    assert.ok(Math.abs(points[i].x)<=23&&Math.abs(points[i].z)<=13.5);
    if(i)assert.ok(distance(points[i],points[i-1])>.70);
    if(i>1){const a=points[i-2],b=points[i-1],c=points[i];const dot=((b.x-a.x)*(c.x-b.x)+(b.z-a.z)*(c.z-b.z))/(distance(a,b)*distance(b,c));assert.ok(dot>.90);}
  }
});

test('a figure eight gets an elevated bridge with clearance above the lower dominoes',()=>{
  const raw=Array.from({length:501},(_,i)=>{const t=-.7+Math.PI*2*i/500;return{x:14*Math.sin(t),z:8*Math.sin(2*t)};});
  const route=buildTrack(prepare(raw));assert.equal(route.bridges.length,1);
  for(const b of route.bridges){const a=route.points[b.earlier],c=route.points[b.earlier+1],d=route.points[b.later],e=route.points[b.later+1];const under=a.y+(c.y-a.y)*b.t,over=d.y+(e.y-d.y)*b.u;assert.ok(over-under>=2.3);}
  assert.ok(route.points.every(p=>Number.isFinite(p.y)&&p.y>=0));
  for(let i=1;i<route.points.length;i++)assert.ok(Math.abs(route.points[i].y-route.points[i-1].y)<.5,'ramps must change height gradually');
});
test('noncrossing presets stay on the ground and endpoint intersections are detected',()=>{
  assert.equal(buildTrack(prepare(presetPath('spiral'))).bridges.length,0);
  assert.ok(buildTrack(prepare(presetPath('spiral'))).points.every(p=>p.y===0));
  assert.ok(intersection({x:-2,z:0},{x:0,z:0},{x:0,z:-2},{x:0,z:2}));
});

test('multiple crossings preserve clearance and gradual ramps throughout the route',()=>{
  const raw=Array.from({length:1001},(_,i)=>{const t=-.37+2*Math.PI*i/1000;return{x:16*Math.sin(3*t),z:10*Math.sin(2*t)};});
  const route=buildTrack(prepare(raw)),p=route.points;assert.ok(route.bridges.length>=5);
  for(const b of route.bridges){const under=p[b.earlier].y*(1-b.t)+p[b.earlier+1].y*b.t,over=p[b.later].y*(1-b.u)+p[b.later+1].y*b.u;assert.ok(over-under>=2.3);}
  for(let i=1;i<p.length;i++)assert.ok(Math.abs(p[i].y-p[i-1].y)<.5);
});
