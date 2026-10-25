import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare,resample,canAppend,distance,sampleSpiral,presetPath,SPACING,MAX_DOMINOES} from './path.js';

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
test('crossings cannot jump over a previous segment',()=>{
  const points=[{x:-4,z:0},{x:4,z:0},{x:6,z:3},{x:0,z:4},{x:0,z:2}];
  assert.match(canAppend(points,{x:0,z:-2}),/crossings/);
});
test('tight reversals and out of bounds points are rejected',()=>{
  assert.match(canAppend([{x:0,z:0},{x:1,z:0},{x:2,z:0}],{x:1.5,z:0}),/wider/);
  assert.match(canAppend([],{x:24,z:0}),/drawing area/);
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
