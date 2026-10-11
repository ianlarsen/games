export function makeCourse(level=1){
 let seed=(level*73856093)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const length=5600,platforms=[{x:200,y:420,width:240}],coins=[],enemies=[];
 for(let x=460;x<length-900;x+=280){
  const y=360+Math.floor(random()*20),width=260;
  platforms.push({x,y,width});
  for(let n=-1;n<=1;n++) coins.push({x:x+n*35,y:y-45});
  enemies.push({x:x+120,y:level>1&&random()<.3?280:448,flying:level>1&&random()<.3});
 }
 return {length,platforms,coins,enemies,bossX:length-370,arenaStart:length-780};
}
export const approach=(value,target,amount)=>value<target?Math.min(value+amount,target):Math.max(value-amount,target);
