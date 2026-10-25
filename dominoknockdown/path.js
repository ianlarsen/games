// Pure path geometry shared by drawing, placement, and ride cameras.
export const SPACING = 0.72;
export const MAX_DOMINOES = 360;
export const LIMIT = { x: 23, z: 13.5 };
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

function segmentsIntersect(a,b,c,d) {
  const cross=(p,q,r)=>(q.x-p.x)*(r.z-p.z)-(q.z-p.z)*(r.x-p.x);
  return cross(a,b,c)*cross(a,b,d)<0 && cross(c,d,a)*cross(c,d,b)<0;
}

export function canAppend(points,p) {
  if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.abs(p.x)>LIMIT.x||Math.abs(p.z)>LIMIT.z) return 'Stay inside the drawing area on the floor.';
  if(!points.length) return '';
  const last=points.at(-1), step=distance(last,p);
  if(step<.23) return 'skip';
  let traveled=0;
  for(let i=points.length-2;i>=0;i--) {
    traveled+=distance(points[i],points[i+1]);
    if(traveled<2.3) continue;
    if(distance(points[i],p)<1.3 || segmentsIntersect(last,p,points[i],points[i+1])) return 'Give your path some space. No crossings.';
  }
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
