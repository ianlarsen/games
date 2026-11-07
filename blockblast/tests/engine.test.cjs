const assert = require('node:assert/strict');
const E = require('../engine.js');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function clean(){const s=E.create({seed:1});s.board=E.empty();s.gems=E.empty();s.tray=[{shape:0,color:1},{shape:0,color:2},{shape:0,color:3}];return s;}
test('all piece shapes have unique in-bounds nonnegative cells',()=>{for(const shape of E.SHAPES){assert.equal(new Set(shape.map(String)).size,shape.length);assert.ok(shape.every(([x,y])=>x>=0&&y>=0&&x<8&&y<8));}});
test('edges, collisions, fractions and illegal placement do not mutate state',()=>{let s=clean(),before=JSON.stringify(s);for(const [x,y]of [[-1,0],[8,0],[0,8],[.5,0]])assert.equal(E.place(s,0,x,y),null);assert.equal(JSON.stringify(s),before);s.board[0]=2;assert.equal(E.place(s,0,0,0),null);assert.equal(E.place(s,4,1,0),null);});
test('crossing row and column clear simultaneously, intersection once',()=>{const s=clean();for(let i=1;i<8;i++){s.board[i]=1;s.board[i*8]=2;}s.gems[1]=1;s.gems[8]=1;const r=E.place(s,0,0,0);assert.equal(r.count,2);assert.equal(r.indices.length,15);assert.equal(r.gems,2);assert.equal(s.collected,2);assert.ok(s.board.every(v=>!v));assert.equal(s.score,341);});
test('unused pieces persist and tray refills only after third placement',()=>{const s=clean();const p=s.tray[1];E.place(s,0,0,0);assert.equal(s.tray[0],null);assert.equal(s.tray[1],p);E.place(s,1,1,0);assert.equal(s.tray[1],null);E.place(s,2,2,0);assert.ok(s.tray.every(Boolean));});
test('combo survives a clearing hand and resets after an entire non-clearing hand',()=>{const s=clean();for(let i=0;i<7;i++)s.board[i]=1;E.place(s,0,7,0);E.place(s,1,0,0);E.place(s,2,1,0);assert.equal(s.combo,1);s.tray=[{shape:0,color:1},{shape:0,color:1},{shape:0,color:1}];E.place(s,0,2,0);E.place(s,1,3,0);E.place(s,2,4,0);assert.equal(s.combo,0);});
test('game ends only when none of the remaining pieces fits',()=>{const s=clean();s.board=Array(64).fill(1);for(let i=0;i<64;i++)if((Math.floor(i/8)+i%8)%2===0)s.board[i]=0;s.tray=[{shape:0,color:1},{shape:9,color:1},{shape:12,color:1}];E.place(s,0,0,0);assert.equal(s.status,'over');assert.equal(E.place(s,1,0,0),null);});
test('adventure win takes priority over move limit and advances only after target',()=>{const s=clean();s.mode='adventure';s.target=1;s.limit=1;for(let i=0;i<7;i++)s.board[i]=1;s.gems[0]=1;E.place(s,0,7,0);assert.equal(s.status,'won');});
test('adventure move limit ends unfinished round',()=>{const s=clean();s.mode='adventure';s.target=2;s.limit=1;E.place(s,0,0,0);assert.equal(s.status,'over');});
test('same seed gives same pieces and adventure layout',()=>{assert.deepEqual(E.create({mode:'adventure',level:7,seed:42}),E.create({mode:'adventure',level:7,seed:42}));});
test('reject damaged saves and accept JSON round trips',()=>{const s=clean();assert.ok(E.valid(JSON.parse(JSON.stringify(s))));assert.ok(!E.valid({...s,board:[1]}));assert.ok(!E.valid({...s,tray:[{shape:999,color:1},null,null]}));assert.ok(!E.valid({...s,score:-1}));assert.ok(!E.valid({...s,seed:NaN}));assert.ok(!E.valid({...s,gems:Array(64).fill(1)}));});
test('random legal play preserves invariants across 100 games',()=>{for(let seed=1;seed<=100;seed++){const s=E.create({seed,mode:seed%2?'classic':'adventure',level:1+seed%10});for(let turn=0;turn<100&&s.status==='playing';turn++){let placed=false;for(let slot=0;slot<3&&!placed;slot++)if(s.tray[slot])for(let y=0;y<8&&!placed;y++)for(let x=0;x<8&&!placed;x++)if(E.canPlace(s.board,s.tray[slot],x,y)){assert.ok(E.place(s,slot,x,y));placed=true;}assert.ok(placed);assert.ok(E.valid(s));assert.equal(E.lines(s.board).indices.length,0);assert.ok(s.board.every((c,i)=>c||!s.gems[i]));}}});
test('deal catalog contains only the connected Classic families',()=>{
  assert.equal(E.SHAPES.length,33);
  for(const shape of E.SHAPES){
    const pending=new Set(shape.map(([x,y])=>x+','+y)),queue=[shape[0]];
    pending.delete(shape[0].join(','));
    while(queue.length){const [x,y]=queue.shift();for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const key=(x+dx)+','+(y+dy);if(pending.delete(key))queue.push([x+dx,y+dy]);}}
    assert.equal(pending.size,0,'Every cell must connect along an edge');
    const n=shape.length;
    assert.ok([1,2,3,4,5,6,9].includes(n));
    if(n===5){const xs=new Set(shape.map(c=>c[0])),ys=new Set(shape.map(c=>c[1]));assert.ok(xs.size===1||ys.size===1||(xs.size===3&&ys.size===3));}
    if(n===6||n===9){const xs=new Set(shape.map(c=>c[0])),ys=new Set(shape.map(c=>c[1]));assert.equal(xs.size*ys.size,n);}
  }
});
test('old diagonal saves migrate without losing the round',()=>{
  const old=clean();old.version=1;old.score=1234;old.combo=4;old.tray=[{shape:33,color:2},null,{shape:34,color:5}];
  const before=JSON.stringify(old),s=E.restore(old);
  assert.ok(E.valid(s));assert.equal(s.version,2);assert.equal(s.score,1234);assert.equal(s.combo,4);assert.deepEqual(s.board,old.board);assert.equal(s.tray[1],null);
  assert.deepEqual(s.tray,[{shape:1,color:2},null,{shape:3,color:5}]);assert.equal(JSON.stringify(old),before);
});
test('migration retains a legal move on a fragmented board',()=>{
  const old=clean();old.version=1;old.board=Array.from({length:64},(_,i)=>(Math.floor(i/8)+i%8)%2?1:0);old.tray=[{shape:33,color:2},null,{shape:34,color:5}];
  const s=E.restore(old);assert.ok(E.valid(s));assert.ok(s.tray.filter(Boolean).every(p=>E.fits(s.board,p)));assert.ok(s.tray.filter(Boolean).every(p=>p.shape===0));
});
test('migration rejects invalid saves and preserves current saves',()=>{
  const s=clean();assert.equal(E.restore(s),s);assert.equal(E.restore({...s,version:99}),null);assert.equal(E.restore({...s,version:1,board:[0]}),null);assert.equal(E.restore({...s,version:1,tray:[{shape:999,color:1},null,null]}),null);
  assert.equal(E.restore({...s,tray:[{shape:33,color:1},null,null]}),null);
});
console.log(`${passed} tests passed`);
module.exports = {passed, simulatedGames:100};
