import * as THREE from './vendor/three.module.js';

export function groundTexture(kind,renderer) {
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  let seed=7919;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  if(kind==='lava') {
    // Periodic Voronoi crust creates irregular dark islands and glowing seams.
    const seeds=Array.from({length:64},()=>({x:random(),y:random()}));
    const pixels=x.createImageData(512,512);
    for(let py=0;py<512;py++)for(let px=0;px<512;px++) {
      const u=px/64,v=py/64,gx=Math.floor(u),gy=Math.floor(v);let first=Infinity,second=Infinity;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
        const ix=gx+dx,iy=gy+dy,p=seeds[((iy+8)%8)*8+(ix+8)%8];
        const d=(ix+p.x-u)**2+(iy+p.y-v)**2;
        if(d<first){second=first;first=d;}else if(d<second)second=d;
      }
      const gap=Math.sqrt(second)-Math.sqrt(first),heat=Math.max(0,1-gap/.095),noise=random()*12;
      const i=(py*512+px)*4;
      pixels.data[i]=30+noise+225*heat;
      pixels.data[i+1]=13+noise*.5+heat*(50+150*heat**3);
      pixels.data[i+2]=10+noise*.3+heat*12;
      pixels.data[i+3]=255;
    }
    x.putImageData(pixels,0,0);
  } else {
    x.fillStyle=kind==='dirt'?'#765037':'#8b8d89';x.fillRect(0,0,512,512);
    for(let i=0;i<22000;i++){const light=random()>.5;x.fillStyle=kind==='dirt'?(light?'#ac845b':'#4b3427'):(light?'#b0b3ad':'#5b605c');x.globalAlpha=.12+random()*.2;const r=.5+random()*2.5;x.fillRect(random()*512,random()*512,r,r);}
    x.globalAlpha=1;
    if(kind==='stone') {
      x.strokeStyle='#585e58';x.lineWidth=2;
      for(let row=0;row<4;row++){const y=row*128;x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke();for(let col=0;col<3;col++){const a=col*256+(row%2)*128;x.strokeRect(a,y,256,128);}}
    } else {
      for(let i=0;i<50;i++){x.fillStyle=i%2?'#987658':'#5b4b3c';x.beginPath();x.ellipse(random()*512,random()*512,2+random()*5,1+random()*3,random()*6,0,Math.PI*2);x.fill();}
    }
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='lava'?10:18,kind==='lava'?10:18);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}

// A continuous solid ribbon gives lava paths a stone ledge and raised sections
// a bridge deck. Geometry is built once per Ready, never during the cascade.
export function buildDeck(points,lava,material,halfWidth=.64) {
  const positions=[],uvs=[];
  const vertex=(p)=>{positions.push(p.x,p.y,p.z);uvs.push(p.x*.28,p.z*.28);};
  const tri=(a,b,c)=>{vertex(a);vertex(b);vertex(c);};
  const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
  const edges=points.map((p,i)=>{
    const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],length=Math.hypot(b.x-a.x,b.z-a.z)||1;
    const nx=-(b.z-a.z)/length*halfWidth,nz=(b.x-a.x)/length*halfWidth;
    return [{x:p.x+nx,y:p.y-.015,z:p.z+nz},{x:p.x-nx,y:p.y-.015,z:p.z-nz}];
  });
  for(let i=0;i<points.length-1;i++) {
    if(!lava&&points[i].y<.012&&points[i+1].y<.012)continue;
    const [a,b]=edges[i],[d,c]=edges[i+1],depth=lava?.48:.24;
    const low=p=>({...p,y:p.y-depth});
    quad(a,d,c,b);
    if(halfWidth<.1)continue; // Drawing strokes are flat ink, not solid ledges.
    quad(low(a),low(b),low(c),low(d));
    quad(a,low(a),low(d),d);quad(b,c,low(c),low(b));
    if(i===0||(!lava&&points[i-1].y<.012))quad(a,b,low(b),low(a));
    if(i===points.length-2||(!lava&&points[i+2].y<.012))quad(d,low(d),low(c),c);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='stone-ledges-and-bridges';return mesh;
}
