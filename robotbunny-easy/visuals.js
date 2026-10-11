// Shared image loading and periodic background rendering for the easy edition.
(function(global) {
  function bossImageKey(type, variation) {
    if(type==='chimiera'||variation==='plain')return type;
    return type+(variation==='spike'?'_armor_spike':'_armor');
  }
  function createImageLoader({assets,sources,makeImage=()=>new Image(),delay=ms=>new Promise(r=>setTimeout(r,ms))}) {
    const pending=new Map();
    async function load(key) {
      const cached=assets[key];
      if(cached?.complete&&cached.naturalWidth>0)return cached;
      if(pending.has(key))return pending.get(key);
      const source=sources[key];if(!source)throw new Error('Unknown artwork: '+key);
      const request=(async()=>{
        let lastError;
        for(let attempt=0;attempt<3;attempt++) {
          const image=makeImage();assets[key]=image;
          try {
            await new Promise((resolve,reject)=>{
              image.onload=()=>image.naturalWidth>0?resolve():reject(new Error('Empty image: '+key));
              image.onerror=()=>reject(new Error('Could not load artwork: '+key));
              image.src=source+(attempt?(source.includes('?')?'&':'?')+'retry='+attempt:'');
            });
            image.onload=null;image.onerror=null;return image;
          }catch(error){lastError=error;image.onload=null;image.onerror=null;if(attempt<2)await delay(250*(attempt+1));}
        }
        delete assets[key];throw lastError;
      })();
      pending.set(key,request);
      try{return await request;}finally{pending.delete(key);}
    }
    return {load};
  }
  function layout(width,height,imageWidth,imageHeight) {
    const scale=Math.max(width/imageWidth,height/imageHeight);
    const fullWidth=Math.ceil(imageWidth*scale),fullHeight=Math.ceil(imageHeight*scale);
    const overlap=Math.max(1,Math.min(Math.round(fullWidth*.16),240));
    return {fullWidth,fullHeight,overlap,period:fullWidth-overlap,y:Math.floor((height-fullHeight)/2)};
  }
  function createBackgroundRenderer(makeCanvas=()=>document.createElement('canvas')) {
    let cached=null,tile=null,geometry=null,viewport='';
    function clearCache(){cached=null;tile=null;geometry=null;viewport='';}
    function prepare(image,width,height) {
      if(cached===image&&viewport===width+'x'+height)return;
      geometry=layout(width,height,image.naturalWidth,image.naturalHeight);
      const {fullWidth,fullHeight,overlap,period}=geometry;
      tile=makeCanvas();tile.width=period;tile.height=fullHeight;
      const t=tile.getContext('2d');t.imageSmoothingEnabled=true;
      // Bake an opaque tile so transparent PNG pixels never reveal a previous level.
      t.fillStyle='#000';t.fillRect(0,0,period,fullHeight);
      t.drawImage(image,0,0,fullWidth,fullHeight);
      const strip=makeCanvas();strip.width=overlap;strip.height=fullHeight;
      const s=strip.getContext('2d');s.fillStyle='#000';s.fillRect(0,0,overlap,fullHeight);
      s.drawImage(image,-period,0,fullWidth,fullHeight);
      s.globalCompositeOperation='destination-in';
      const fade=s.createLinearGradient(0,0,overlap,0);fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');
      s.fillStyle=fade;s.fillRect(0,0,overlap,fullHeight);
      t.drawImage(strip,0,0);strip.width=0;strip.height=0;
      cached=image;viewport=width+'x'+height;
    }
    function draw(ctx,image,width,height,scroll) {
      ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);
      if(image?.complete&&image.naturalWidth>0){
        prepare(image,width,height);
        const offset=((scroll%geometry.period)+geometry.period)%geometry.period;
        // Integer tile positions prevent subpixel hairline gaps at repeat boundaries.
        for(let x=-Math.floor(offset);x<width;x+=geometry.period)ctx.drawImage(tile,x,geometry.y);
      }
      ctx.restore();
    }
    return {draw,clearCache};
  }
  global.RobotBunnyVisuals={bossImageKey,createImageLoader,layout,createBackgroundRenderer};
})(globalThis);
