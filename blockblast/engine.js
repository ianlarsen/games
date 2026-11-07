/* Pure game rules, shared by the browser and regression tests. No dependencies. */
(function (root) {
  'use strict';
  const SIZE = 8;
  const SHAPES = [
    [[0,0]], [[0,0],[1,0]], [[0,0],[0,1]],
    [[0,0],[1,0],[2,0]], [[0,0],[0,1],[0,2]],
    [[0,0],[1,0],[2,0],[3,0]], [[0,0],[0,1],[0,2],[0,3]],
    [[0,0],[1,0],[2,0],[3,0],[4,0]], [[0,0],[0,1],[0,2],[0,3],[0,4]],
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],
    [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]],
    [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],
    [[0,0],[0,1],[1,1]], [[1,0],[0,1],[1,1]], [[0,0],[1,0],[0,1]], [[0,0],[1,0],[1,1]],
    [[0,0],[0,1],[0,2],[1,2]], [[1,0],[1,1],[0,2],[1,2]],
    [[0,0],[1,0],[0,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]],
    [[0,0],[1,0],[2,0],[1,1]], [[1,0],[0,1],[1,1],[2,1]],
    [[0,0],[0,1],[1,1],[0,2]], [[1,0],[0,1],[1,1],[1,2]],
    [[0,0],[1,0],[1,1],[2,1]], [[1,0],[2,0],[0,1],[1,1]],
    [[0,0],[0,1],[1,1],[1,2]], [[1,0],[0,1],[1,1],[0,2]],
    [[0,0],[0,1],[0,2],[1,2],[2,2]], [[2,0],[2,1],[0,2],[1,2],[2,2]],
    [[0,0],[1,0],[2,0],[0,1],[0,2]], [[0,0],[1,0],[2,0],[2,1],[2,2]],
    [[0,0],[1,1]], [[0,0],[1,1],[2,2]]
  ];
  const empty = () => Array(64).fill(0);
  const cells = p => SHAPES[p.shape];
  const dimensions = p => ({w: Math.max(...cells(p).map(c=>c[0]))+1, h: Math.max(...cells(p).map(c=>c[1]))+1});
  function random(s) { let t=s.seed+=0x6D2B79F5; s.seed >>>= 0; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }
  function canPlace(board,p,x,y) { return !!p && Number.isInteger(x) && Number.isInteger(y) && cells(p).every(([dx,dy])=>x+dx>=0&&x+dx<8&&y+dy>=0&&y+dy<8&&board[(y+dy)*8+x+dx]===0); }
  function fits(board,p) { for(let y=0;y<8;y++) for(let x=0;x<8;x++) if(canPlace(board,p,x,y)) return true; return false; }
  function lines(board) {
    const rows=[], cols=[];
    for(let i=0;i<8;i++) { if(board.slice(i*8,i*8+8).every(Boolean)) rows.push(i); if(Array.from({length:8},(_,j)=>board[j*8+i]).every(Boolean)) cols.push(i); }
    return {rows,cols,indices:[...new Set([...rows.flatMap(y=>Array.from({length:8},(_,x)=>y*8+x)),...cols.flatMap(x=>Array.from({length:8},(_,y)=>y*8+x))])]};
  }
  function deal(s) {
    s.tray=Array.from({length:3},()=>({shape:Math.floor(random(s)*SHAPES.length),color:1+Math.floor(random(s)*6)}));
    // Offer at least one playable piece on a new hand, without guaranteeing a solution.
    if(!s.tray.some(p=>fits(s.board,p))) { const available=SHAPES.map((_,shape)=>shape).filter(shape=>fits(s.board,{shape})); if(available.length) s.tray[0].shape=available[Math.floor(random(s)*available.length)]; }
    s.handCleared=false;
  }
  function create({mode='classic',level=1,seed=Date.now()>>>0}={}) {
    const s={version:1,mode,level,seed:seed>>>0,board:empty(),gems:empty(),tray:[],score:0,combo:0,handCleared:false,moves:0,cleared:0,collected:0,target:0,limit:0,status:'playing'};
    if(mode==='adventure') {
      s.limit=24+Math.min(level,12); s.target=4+Math.min(level,12);
      // Original, repeatable puzzle layouts. Never import proprietary level data.
      for(let y=2;y<8;y++) for(let x=0;x<8;x++) if(random(s)<.44) s.board[y*8+x]=1+Math.floor(random(s)*6);
      const filled=s.board.map((c,i)=>c?i:-1).filter(i=>i>=0);
      while(filled.length<s.target) {const i=Math.floor(random(s)*64);if(!s.board[i]){s.board[i]=1;filled.push(i);}}
      for(let i=0;i<s.target;i++) {const at=Math.floor(random(s)*filled.length);s.gems[filled.splice(at,1)[0]]=1;}
    } else {
      // Sparse opening board, matching the Android style of classic play.
      for(let i=0;i<10;i++){const at=32+Math.floor(random(s)*32);s.board[at]=1+Math.floor(random(s)*6);}
    }
    deal(s); return s;
  }
  function place(s,slot,x,y) {
    const p=s.tray[slot];
    if(s.status!=='playing'||!canPlace(s.board,p,x,y)) return null;
    const placed=cells(p).map(([dx,dy])=>(y+dy)*8+x+dx);
    placed.forEach(i=>s.board[i]=p.color);s.tray[slot]=null;s.moves++;
    const clear=lines(s.board), count=clear.rows.length+clear.cols.length;
    let points=placed.length, gems=0;
    if(count) {
      s.combo++;s.handCleared=true;s.cleared+=count;
      points+=10*count*count*s.combo;
      clear.indices.forEach(i=>{gems+=s.gems[i];s.gems[i]=0;s.board[i]=0;});
      s.collected+=gems;
    }
    const allClear=count>0&&s.board.every(c=>!c);
    if(allClear) points+=300;
    s.score+=points;
    if(s.tray.every(p=>!p)) {if(!s.handCleared)s.combo=0;deal(s);}
    if(s.mode==='adventure'&&s.collected>=s.target) s.status='won';
    else if((s.mode==='adventure'&&s.moves>=s.limit)||!s.tray.some(p=>p&&fits(s.board,p)))s.status='over';
    return {...clear,count,points,gems,placed,allClear};
  }
  function valid(s) {
    const ints=(a,max)=>Array.isArray(a)&&a.length===64&&a.every(v=>Number.isInteger(v)&&v>=0&&v<=max);
    const piece=p=>p===null||(p&&Number.isInteger(p.shape)&&p.shape>=0&&p.shape<SHAPES.length&&Number.isInteger(p.color)&&p.color>=1&&p.color<=6);
    return !!s&&s.version===1&&['classic','adventure'].includes(s.mode)&&['playing','over','won'].includes(s.status)&&ints(s.board,6)&&ints(s.gems,1)&&s.gems.every((g,i)=>!g||s.board[i])&&Array.isArray(s.tray)&&s.tray.length===3&&s.tray.every(piece)&&s.tray.some(Boolean)&&['seed','score','combo','moves','cleared','collected','target','limit','level'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0)&&s.level>=1&&typeof s.handCleared==='boolean'&&(s.mode!=='adventure'||(s.target>0&&s.limit>0));
  }
  const api={SIZE,SHAPES,empty,cells,dimensions,canPlace,fits,lines,create,place,valid};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BlockGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
