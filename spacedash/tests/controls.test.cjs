const test=require('node:test');
const assert=require('node:assert/strict');
const {createInput}=require('../js/controls.js');
test('moving, jumping and firing can be held by separate fingers',()=>{
  const input=createInput();input.down(1,'right');input.down(2,'jump');input.down(3,'fire');
  assert.equal(input.held.right,true);assert.equal(input.taps.jump,true);assert.equal(input.held.fire,true);
  input.consume();assert.equal(input.taps.jump,false);assert.equal(input.held.right,true);
  input.up(2);assert.equal(input.held.jump,false);assert.equal(input.held.fire,true);assert.equal(input.held.right,true);
  input.down(4,'jump');assert.equal(input.taps.jump,true);input.up(1);assert.equal(input.held.fire,true);assert.equal(input.held.right,false);
});
test('two pointers on one control do not cancel each other on release',()=>{
  const input=createInput();input.down(1,'left');input.down(2,'left');input.up(1);assert.equal(input.held.left,true);input.up(2);assert.equal(input.held.left,false);
});
test('interruption clears held inputs and queued actions; late release is harmless',()=>{
  const input=createInput();input.down(1,'right');input.down(2,'dash');input.down(3,'fire');input.reset();
  assert.equal(Object.values(input.held).some(Boolean),false);assert.equal(Object.values(input.taps).some(Boolean),false);
  input.up(1);input.down(4,'left');assert.equal(input.held.left,true);assert.equal(input.held.right,false);
});
