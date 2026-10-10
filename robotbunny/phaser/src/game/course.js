export function makeCourse(level=1){
 let seed=(level*73856093)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const length=5600,platforms=[],coins=[],enemies=[];
 for(let x=480;x<length-900;x+=300){
  const y=330+Math.floor(random()*65),width=140+Math.floor(random()*50);
  platforms.push({x,y,width});
  for(let n=-1;n<=1;n++) coins.push({x:x+n*35,y:y-45});
  enemies.push({x:x+120,y:level>1&&random()<.3?280:448,flying:level>1&&random()<.3});
 }
 return {length,platforms,coins,enemies,bossX:length-370,arenaStart:length-780};
}
export const approach=(value,target,amount)=>value<target?Math.min(value+amount,target):Math.max(value-amount,target);
