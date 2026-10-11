// Original-edition easy rules, kept separate from rendering and the original game.
(function(global) {
  const center = obj => ({ x: obj.x + (obj.w || 0) / 2, y: obj.y + (obj.h || 0) / 2 });
  function nextPlatform(platforms, player, direction) {
    const x = player.x + player.w / 2;
    return platforms.filter(p => p.type === 'platform' && !p.crumbleFalling &&
      (p.x + p.w / 2 - x) * direction > player.w / 2 && p.y < 500)
      .sort((a,b) => Math.abs(a.x + a.w/2-x) - Math.abs(b.x + b.w/2-x))[0] || null;
  }
  function beginJump(player, target, direction, floor) {
    const destination = target || { x: Math.max(0,player.x + direction * 250), y:floor, w:player.w };
    // A landing platform remains stable for this jump even in the ruins biome.
    if (target) { target.crumble=false; target.crumbleFalling=false; }
    const endX=destination.x+destination.w/2-player.w/2;
    return { target:destination, x:player.x, bottom:player.y+player.h, elapsed:0,
      duration:Math.max(.6,Math.min(1.2,Math.abs(endX-player.x)/360)),
      lift:Math.max(150,Math.abs(player.y+player.h-destination.y)+80) };
  }
  function stepJump(player, jump, dt) {
    jump.elapsed+=dt; const t=Math.min(1,jump.elapsed/jump.duration);
    const endX=jump.target.x+jump.target.w/2-player.w/2;
    player.x=jump.x+(endX-jump.x)*t;
    player.y=jump.bottom+(jump.target.y-jump.bottom)*t-4*jump.lift*t*(1-t)-player.h;
    player.vx=0;player.vy=t<.5?-1:t<1?1:0;
    if(t===1){player.y=jump.target.y-player.h;player.onGround=true;return true;}
    return false;
  }
  function aim(origin, targets, facing, speed) {
    let target=null,distance=Infinity;
    for(const candidate of targets){if(candidate.health<=0)continue;const c=center(candidate);const d=(c.x-origin.x)**2+(c.y-origin.y)**2;if(d<distance){distance=d;target=c;}}
    if(!target||distance===0)return {vx:facing*speed,vy:0};
    const d=Math.sqrt(distance);return {vx:(target.x-origin.x)/d*speed,vy:(target.y-origin.y)/d*speed};
  }
  global.RobotBunnyEasy={nextPlatform,beginJump,stepJump,aim};
})(globalThis);
