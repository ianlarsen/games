// Pure path geometry shared by drawing, placement, and ride cameras.
export const SPACING = 0.72;
export const MAX_DOMINOES = 360;
export const LIMIT = { x: 60, z: 80 };
export const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);

export function smooth(points) {
  let out = points.map(p => ({...p}));
  for (let pass=0;pass<2 && out.length>2;pass++) {
    const next=[out[0]];
    for(let i=0;i<out.length-1;i++) {
      const a=out[i],b=out[i+1];
      next.push({x:a.x*.75+b.x*.25,z:a.z*.75+b.z*.25},{x:a.x*.25+b.x*.75,z:a.z*.25+b.z*.75});
    }
    next.push(out.at(-1)); out=next;
  }
  return out;
}

export function resample(points, spacing=SPACING) {
  if (!points.length) return [];
  const result=[{...points[0]}]; let left=spacing;
  for(let i=1;i<points.length;i++) {
    let a={...points[i-1]}, b=points[i], length=distance(a,b);
    while(length>=left && result.length<MAX_DOMINOES) {
      const t=left/length; a={x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};
      result.push(a); length=distance(a,b); left=spacing;
    }
    left-=length;
    if(result.length>=MAX_DOMINOES) break;
  }
  return result;
}

export function intersection(a,b,c,d) {
  const ux=b.x-a.x,uz=b.z-a.z,vx=d.x-c.x,vz=d.z-c.z;
  const det=ux*vz-uz*vx;
  if(Math.abs(det)<1e-8)return null;
  const t=((c.x-a.x)*vz-(c.z-a.z)*vx)/det;
  const u=((c.x-a.x)*uz-(c.z-a.z)*ux)/det;
  return t>=-1e-7&&t<=1+1e-7&&u>=-1e-7&&u<=1+1e-7?{t:Math.max(0,Math.min(1,t)),u:Math.max(0,Math.min(1,u))}:null;
}

export function canAppend(points,p) {
  if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.abs(p.x)>LIMIT.x||Math.abs(p.z)>LIMIT.z) return 'Stay inside the drawing area on the floor.';
  if(!points.length) return '';
  const last=points.at(-1), step=distance(last,p);
  if(step<.23) return 'skip';
  // Compare a broader tangent so little finger tremors do not reject a turn.
  let prior=points.length-2;
  while(prior>0 && distance(points[prior],last)<.9) prior--;
  if(prior>=0 && distance(points[prior],last)>.65) {
    const a=points[prior],dot=((last.x-a.x)*(p.x-last.x)+(last.z-a.z)*(p.z-last.z))/(distance(a,last)*step);
    if(dot<.25) return 'Make that turn a little wider.';
  }
  return '';
}

export function sampleSpiral() {
  const out=[];
  for(let i=0;i<=360;i++) {
    const t=i/360, angle=-Math.PI*.3+t*Math.PI*3.7, radius=12-9*t;
    out.push({x:Math.cos(angle)*radius*1.42,z:Math.sin(angle)*radius*.86});
  }
  return out;
}

export function prepare(points) { return resample(smooth(points)); }

// Later visits pass above earlier visits. Stations measure distance along the path,
// so ramps and the camera follow the same elevated route as the dominoes.
export function buildTrack(input) {
  const points=input.map(p=>({...p,y:0})),stations=[0],crossings=[];
  for(let i=1;i<points.length;i++)stations.push(stations[i-1]+distance(points[i-1],points[i]));
  for(let later=0;later<points.length-1;later++)for(let earlier=0;earlier<later-5;earlier++) {
    const hit=intersection(points[earlier],points[earlier+1],points[later],points[later+1]);
    if(!hit)continue;
    const under=stations[earlier]+hit.t*distance(points[earlier],points[earlier+1]);
    const over=stations[later]+hit.u*distance(points[later],points[later+1]);
    if(crossings.some(c=>Math.abs(c.over-over)<1.1&&Math.abs(c.under-under)<1.1))continue;
    crossings.push({earlier,later,t:hit.t,u:hit.u,under,over});
  }
  const bridges=[];
  for(const c of crossings) {
    const lower=points[c.earlier].y*(1-c.t)+points[c.earlier+1].y*c.t;
    const height=lower+2.35,plateau=1.45,ramp=Math.max(5.5,height*2.8);
    const bridge={...c,height,halfLength:plateau+ramp};bridges.push(bridge);
    // Do not elevate the earlier branch of the same crossing.
    for(let i=c.earlier+2;i<points.length;i++) {
      const away=Math.abs(stations[i]-c.over);
      if(away>plateau+ramp)continue;
      const t=Math.max(0,Math.min(1,(away-plateau)/ramp));
      const y=height*(1-t*t*(3-2*t));points[i].y=Math.max(points[i].y,y);
    }
  }
  return {points,bridges,stations};
}

function roundedRoute(vertices, radius=1.5) {
  const out=[vertices[0]];
  const lineTo=p=>{const a=out.at(-1),n=Math.max(1,Math.ceil(distance(a,p)/.24));for(let j=1;j<=n;j++)out.push({x:a.x+(p.x-a.x)*j/n,z:a.z+(p.z-a.z)*j/n});};
  for(let i=1;i<vertices.length-1;i++) {
    const a=vertices[i-1],b=vertices[i],c=vertices[i+1];
    const r=Math.min(radius,distance(a,b)/3,distance(b,c)/3);
    const entry={x:b.x+(a.x-b.x)*r/distance(a,b),z:b.z+(a.z-b.z)*r/distance(a,b)};
    const exit={x:b.x+(c.x-b.x)*r/distance(b,c),z:b.z+(c.z-b.z)*r/distance(b,c)};
    lineTo(entry);
    for(let j=1;j<=16;j++){const t=j/16,u=1-t;out.push({x:u*u*entry.x+2*u*t*b.x+t*t*exit.x,z:u*u*entry.z+2*u*t*b.z+t*t*exit.z});}
  }
  lineTo(vertices.at(-1));return out;
}

export function presetPath(name) {
  if(name==='spiral')return sampleSpiral();
  if(name==='circuit')return roundedRoute([[-16,-10],[16,-10],[16,10],[-16,10],[-16,-6],[12,-6],[12,6],[-12,6],[-12,-2],[8,-2],[8,2],[-8,2]].map(([x,z])=>({x,z})),1.8);
  if(name==='maze')return roundedRoute([[-20,-10],[-8,-10],[-8,-3],[-16,-3],[-16,4],[-8,4],[-8,11],[0,11],[0,4],[8,4],[8,11],[20,11],[20,4],[14,4],[14,-3],[20,-3],[20,-11],[5,-11],[5,-4],[0,-4],[0,-11],[-3,-11],[-3,0],[4,0]].map(([x,z])=>({x,z})),1.3);
  const out=[];
  if(name==='switchback') {
    for(let row=0;row<7;row++) {
      const direction=row%2?-1:1,z=-10+row*3;
      for(let j=0;j<=110;j++)out.push({x:direction*(-15+30*j/110),z});
      if(row<6)for(let j=1;j<=36;j++){const a=j/36*Math.PI;out.push({x:direction*(15+1.5*Math.sin(a)),z:z+1.5*(1-Math.cos(a))});}
    }
    return out;
  }
  if(name==='ribbon') {
    for(let row=0;row<3;row++) {
      const direction=row%2?-1:1,z=-8+row*8;
      for(let j=0;j<=240;j++){const t=j/240;out.push({x:direction*(-18+36*t),z:z+2*Math.sin(6*Math.PI*t)});}
      if(row<2)for(let j=1;j<=50;j++){const a=j/50*Math.PI;out.push({x:direction*(18+3.5*Math.sin(a)),z:z+4*(1-Math.cos(a))});}
    }
    return out;
  }
  return [];
}
