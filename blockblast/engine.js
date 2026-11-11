/* Pure game rules, shared by the browser and regression tests. No dependencies. */
(function (root) {
  'use strict';
  const SIZE = 8;
  // Connected Classic pieces only. Keep these IDs stable for saved games.
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
    [[0,0],[1,0],[2,0],[0,1],[0,2]], [[0,0],[1,0],[2,0],[2,1],[2,2]]
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
  const BIT_COUNT=Array.from({length:256},(_,n)=>n.toString(2).replace(/0/g,'').length);
  // Precompute geometry once. A deal examines a small, fixed set of placements,
  // rather than an unbounded search that could stall touch input on an iPad.
  const PLACEMENTS=SHAPES.map(shape=>{
    const w=Math.max(...shape.map(c=>c[0]))+1,h=Math.max(...shape.map(c=>c[1]))+1,options=[];
    for(let y=0;y<=8-h;y++)for(let x=0;x<=8-w;x++){
      const masks=Array(8).fill(0),columns=Array(8).fill(0);
      for(const [dx,dy] of shape){masks[y+dy]|=1<<(x+dx);columns[x+dx]++;}
      options.push({x,y,masks,columns});
    }
    return options;
  });
  function deal(s) {
    // Build a witnessed three-move sequence on a private board, including
    // simultaneous line clears. The actual board, gems and score never change.
    let rows=Array.from({length:8},(_,y)=>s.board.slice(y*8,y*8+8).reduce((bits,c,x)=>bits|(c?1<<x:0),0));
    let gems=s.gems.map((g,i)=>g?i:-1).filter(i=>i>=0);
    const plan=[];
    for(let turn=0;turn<3;turn++){
      const rowCounts=rows.map(n=>BIT_COUNT[n]);
      const colCounts=Array.from({length:8},(_,x)=>rows.reduce((n,row)=>n+((row>>x)&1),0));
      const options=[];
      PLACEMENTS.forEach((placements,shape)=>{
        let best=null;
        for(const p of placements){
          if(p.masks.some((mask,y)=>mask&rows[y]))continue;
          let fullRows=0,fullCols=255,progress=0;
          for(let i=0;i<8;i++){
            const filled=rows[i]|p.masks[i],count=BIT_COUNT[filled];
            if(filled===255)fullRows|=1<<i;
            fullCols&=filled;
            progress+=count*count-rowCounts[i]*rowCounts[i];
            progress+=(colCounts[i]+p.columns[i])**2-colCounts[i]**2;
          }
          const clears=BIT_COUNT[fullRows]+BIT_COUNT[fullCols];
          const gemCount=gems.filter(i=>(fullRows&(1<<Math.floor(i/8)))||(fullCols&(1<<(i%8)))).length;
          // Prefer clears (especially Adventure gems), then moves that bring
          // existing rows/columns closer to completion. No custom shapes.
          const score=clears*120+gemCount*30+progress*.25+SHAPES[shape].length*1.5;
          if(!best||score>best.score||(score===best.score&&random(s)<.5))best={...p,shape,score,clears,fullRows,fullCols};
        }
        if(best)options.push(best);
      });
      // A valid playable board always has a single-cell option; a full board
      // has no legal move. Do not manufacture overlapping pieces in that case.
      if(!options.length){s.tray=[null,null,null];s.status='over';s.handCleared=false;return [];}
      const clearing=options.filter(p=>p.clears>0),available=clearing.length?clearing:options;
      const bestScore=Math.max(...available.map(p=>p.score));
      const pool=available.filter(p=>p.score>=bestScore-18);
      const weights=pool.map(p=>plan.some(step=>step.shape===p.shape)?.25:1);
      let draw=random(s)*weights.reduce((a,b)=>a+b,0),chosen=pool[pool.length-1];
      for(let i=0;i<pool.length;i++){draw-=weights[i];if(draw<0){chosen=pool[i];break;}}
      plan.push({shape:chosen.shape,x:chosen.x,y:chosen.y});
      rows=rows.map((row,y)=>chosen.fullRows&(1<<y)?0:(row|chosen.masks[y])&~chosen.fullCols);
      gems=gems.filter(i=>!(chosen.fullRows&(1<<Math.floor(i/8)))&&!(chosen.fullCols&(1<<(i%8))));
    }
    s.tray=plan.map(step=>({shape:step.shape,color:1+Math.floor(random(s)*6)}));
    // The solution order is deliberately not revealed by the tray order.
    for(let i=s.tray.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[s.tray[i],s.tray[j]]=[s.tray[j],s.tray[i]];}
    s.handCleared=false;
    return plan;
  }
  function create({mode='classic',level=1,seed=Date.now()>>>0}={}) {
    const s={version:2,mode,level,seed:seed>>>0,board:empty(),gems:empty(),tray:[],score:0,combo:0,handCleared:false,moves:0,cleared:0,collected:0,target:0,limit:0,status:'playing'};
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
    return !!s&&s.version===2&&['classic','adventure'].includes(s.mode)&&['playing','over','won'].includes(s.status)&&ints(s.board,6)&&ints(s.gems,1)&&s.gems.every((g,i)=>!g||s.board[i])&&Array.isArray(s.tray)&&s.tray.length===3&&s.tray.every(piece)&&s.tray.some(Boolean)&&['seed','score','combo','moves','cleared','collected','target','limit','level'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0)&&s.level>=1&&typeof s.handCleared==='boolean'&&(s.mode!=='adventure'||(s.target>0&&s.limit>0));
  }
  function restore(saved) {
    if(!saved || ![1,2].includes(saved.version)) return null;
    if(saved.version===2) return valid(saved)?saved:null;
    if(!Array.isArray(saved.tray) || saved.tray.length!==3) return null;
    // Retired IDs 33/34 were disconnected diagonals. Preserve the round and
    // replace only those slots with connected pieces, keeping a legal option.
    const retired=[];
    const s={...saved,version:2,tray:saved.tray.map((p,i)=>{
      if(p && (p.shape===33 || p.shape===34)) {
        retired.push(i);return {...p,shape:p.shape===33?1:3};
      }
      return p;
    })};
    if(!valid(s)) return null;
    for(const i of retired) {
      const p=s.tray[i];
      if(!fits(s.board,p)) {
        const size=cells(p).length;
        const replacement=SHAPES.findIndex((shape,id)=>shape.length===size&&fits(s.board,{shape:id}));
        p.shape=replacement>=0?replacement:0;
      }
    }
    return s;
  }
  const api={SIZE,SHAPES,empty,cells,dimensions,canPlace,fits,lines,deal,create,place,valid,restore};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BlockGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
