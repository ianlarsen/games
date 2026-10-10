/* Spacedash. Original procedural visuals; pinned Phaser 4.2.1. */
'use strict';
const ui = {
  status: document.querySelector('#status'), stats: document.querySelector('#stats'),
  title: document.querySelector('#overlay-title'), copy: document.querySelector('#overlay-copy'),
  play: document.querySelector('#play'), sound: document.querySelector('#sound'),
  pause: document.querySelector('#pause'), restart: document.querySelector('#restart'),
  dash: document.querySelector('#dash-button'), dashState: document.querySelector('#dash-state')
};
let scene, started = false, paused = false, muted = false, audio;
const input = SpaceInput.createInput(), touch = input.held, taps = input.taps;
const touchButtons = Array.from(document.querySelectorAll('[data-key]'));
function releaseInputs(){input.reset();touchButtons.forEach(b=>b.classList.remove('held'));scene?.input?.keyboard?.resetKeys();}
function tone(freq=440, duration=.1, type='sine', end=220) {
  if(muted || !audio || audio.state !== 'running') return;
  const o=audio.createOscillator(), g=audio.createGain(), t=audio.currentTime;
  o.type=type; o.frequency.setValueAtTime(freq,t); o.frequency.exponentialRampToValueAtTime(end,t+duration);
  g.gain.setValueAtTime(.045,t); g.gain.exponentialRampToValueAtTime(.001,t+duration);
  o.connect(g); g.connect(audio.destination); o.onended=()=>{o.disconnect();g.disconnect();};o.start(); o.stop(t+duration);
}
function unlockSound(){const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio ||= new AC();audio.resume().catch(()=>{});}}
function overlay(title,copy,button){releaseInputs();ui.title.textContent=title;ui.copy.textContent=copy;ui.play.textContent=button;document.body.classList.remove('playing');}
function togglePause(){if(!started || !scene || scene.won)return;releaseInputs();paused=!paused;ui.pause.textContent=paused?'Resume':'Pause';if(paused){scene.scene.pause();overlay('Take a breather.','Your run is paused. Tap Resume when you’re ready.','Resume');audio?.suspend().catch(()=>{});}else{unlockSound();scene.scene.resume();document.body.classList.add('playing');}}
function restart(){if(!scene)return;releaseInputs();unlockSound();started=true;paused=false;ui.pause.textContent='Pause';ui.pause.disabled=false;ui.restart.disabled=false;scene.scene.resume();scene.scene.restart();document.body.classList.add('playing');}
ui.play.onclick=()=>{if(!scene)return;unlockSound();if(paused){togglePause();return;}if(scene.won || !started)restart();document.body.classList.add('playing');};
ui.pause.onclick=togglePause;ui.restart.onclick=restart;
ui.sound.onclick=()=>{unlockSound();muted=!muted;ui.sound.textContent=`Sound: ${muted?'off':'on'}`;ui.sound.setAttribute('aria-pressed',String(!muted));};
document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyP')togglePause();if(e.code==='KeyM')ui.sound.click();if(e.code==='KeyR'&&started)restart();});
function background(){releaseInputs();if(started&&!paused&&!scene.won)togglePause();}
window.addEventListener('blur',background);
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});
window.addEventListener('pagehide',background);
touchButtons.forEach(button=>{
  const key=button.dataset.key;
  button.onpointerdown=e=>{e.preventDefault();if(!started||paused||scene.won)return;button.setPointerCapture(e.pointerId);input.down(e.pointerId,key);button.classList.add('held');unlockSound();};
  const release=e=>{input.up(e.pointerId);button.classList.toggle('held',touch[key]);};
  button.onpointerup=button.onpointercancel=button.onlostpointercapture=release;
  button.oncontextmenu=e=>e.preventDefault();
});
class Relay extends Phaser.Scene {
  constructor(){super('relay');}
  create(){
    scene=this;releaseInputs();this.won=false;this.count=0;this.shields=3;this.facing=1;this.jumps=0;this.dashUntil=0;this.dashReady=0;this.fireReady=0;this.safeUntil=0;this.checkpoint=100;this.lastGrounded=-Infinity;this.jumpBufferedUntil=0;this.wasGrounded=false;this.particleCount=0;
    const W=2600;this.physics.world.setBounds(0,-200,W,900);this.cameras.main.setBounds(0,0,W,540);
    this.cameras.main.setBackgroundColor('#0c172b');
    this.makeArt();
    const bg=this.add.graphics().setScrollFactor(.18);
    for(let i=0;i<85;i++){bg.fillStyle(i%3===0?0x64ffe0:0x6382a6,.45);bg.fillCircle((i*173)%3000,(i*97)%370, i%3===0?2:1);}
    const hills=this.add.graphics().setScrollFactor(.35);hills.fillStyle(0x12253e);
    for(let i=0;i<16;i++){hills.fillRect(i*200,250+(i%3)*30,120,300);hills.lineStyle(1,0x254361);hills.strokeRect(i*200,250+(i%3)*30,120,300);}
    this.add.text(40,55,'NEON OUTPOST',{fontFamily:'Segoe UI',fontSize:'36px',color:'#23435d'}).setScrollFactor(.5);
    this.platforms=this.physics.add.staticGroup();
    this.platforms.create(W/2,515,'ground').setDisplaySize(W,50).refreshBody();
    [[300,405,170],[555,325,160],[850,390,180],[1160,310,170],[1510,370,180],[1810,315,180],[2100,395,180],[2370,330,160]].forEach(([x,y,w])=>{this.platforms.create(x,y,'platform').setDisplaySize(w,20).refreshBody();});
    this.mover=this.physics.add.image(1320,430,'platform').setDisplaySize(150,20).setImmovable(true).setVelocityX(75);this.mover.body.setAllowGravity(false);
    this.add.text(1195,458,'MOVING PLATFORM',{fontSize:'12px',color:'#658aa2'});
    this.hazards=this.physics.add.staticGroup();
    [680,1000,1640,1960,2220].forEach(x=>{this.hazards.create(x,480,'spike').setSize(50,24).setOffset(7,8);});
    this.crystals=this.physics.add.staticGroup();
    [[300,365],[555,285],[850,350],[1160,270],[1510,330],[1810,275],[2100,355],[2370,290]].forEach(([x,y])=>{const c=this.crystals.create(x,y,'shard');this.tweens.add({targets:c,y:y-9,angle:10,duration:1000,yoyo:true,repeat:-1});});
    this.drones=this.physics.add.group({allowGravity:false});
    [[740,430],[1440,290],[1990,270]].forEach(([x,y])=>{const d=this.drones.create(x,y,'drone');d.originX=x;d.setSize(30,22);d.setVelocityX(70);});
    this.bullets=this.physics.add.group({allowGravity:false});
    this.player=this.physics.add.sprite(100,440,'bot0').setSize(24,38).setOffset(12,10).setCollideWorldBounds(true).setMaxVelocity(700,900);
    if(!this.anims.exists('run'))this.anims.create({key:'run',frames:[{key:'bot0'},{key:'bot1'},{key:'bot2'},{key:'bot1'}],frameRate:12,repeat:-1});
    this.physics.add.collider(this.player,this.platforms);
    this.physics.add.collider(this.player,this.mover);
    this.physics.add.overlap(this.player,this.crystals,(p,c)=>{this.burst(c.x,c.y,0x64ffe0,18);c.destroy();this.count++;tone(600+this.count*65,.15,'sine',1000);this.refreshUI();if(this.count===8){this.portal.setTint(0x64ffe0);ui.status.textContent='Relay charged! Reach the portal on the right.';}});
    this.physics.add.overlap(this.player,this.hazards,()=>this.hurt());
    this.physics.add.overlap(this.player,this.drones,(p,d)=>{if(this.time.now<this.dashUntil)this.destroyDrone(d);else this.hurt();});
    this.physics.add.overlap(this.bullets,this.drones,(b,d)=>{b.destroy();this.destroyDrone(d);});
    this.physics.add.collider(this.bullets,this.platforms,b=>b.destroy());
    this.portal=this.physics.add.staticImage(2520,445,'portal').setTint(0x52718c);
    this.tweens.add({targets:this.portal,alpha:.6,duration:850,yoyo:true,repeat:-1});
    this.physics.add.overlap(this.player,this.portal,()=>{if(this.count===8&&!this.won){this.won=true;this.player.setVelocity(0);this.physics.pause();ui.pause.disabled=true;this.burst(2520,440,0x64ffe0,50);tone(440,.5,'sine',1320);overlay('Relay restored.','All eight shards collected. Outpost powered up! Ready for another run?','Play again');}});
    [[100,'DOUBLE JUMP'],[460,'AIR DASH'],[800,'HOLD FIRE'],[1690,'COLLECT & EXPLORE'],[2410,'EXIT →']].forEach(([x,s])=>this.add.text(x,210,s,{fontSize:'14px',color:'#6f9eb1'}));
    this.cameras.main.startFollow(this.player,true,.09,.09);this.cameras.main.setDeadzone(Math.min(130,this.scale.width*.22),100);
    const view=document.querySelector('#game').getBoundingClientRect();this.cameras.main.setZoom(view.width>view.height&&view.height<320?1.25:1);
    this.keys=this.input.keyboard.addKeys({left:'A',right:'D',jump:'SPACE',up:'W',dash:'SHIFT',dashAlt:'K',fire:'J'});this.arrows=this.input.keyboard.createCursorKeys();
    this.refreshUI();ui.status.textContent='Collect 8 shards, then reach the portal.';ui.dashState.textContent='ready';ui.dash.classList.remove('cooldown');
    if(!started)this.physics.pause();
  }
  makeArt(){
    if(this.textures.exists('bot0'))return;
    const texture=(name,w,h,draw)=>{const g=this.make.graphics({x:0,y:0},false);draw(g);g.generateTexture(name,w,h);g.destroy();};
    for(let f=0;f<3;f++)texture('bot'+f,48,52,g=>{
      g.fillStyle(0x172e48);g.fillRoundedRect(9,8,30,32,8);g.lineStyle(2,0x64ffe0);g.strokeRoundedRect(9,8,30,32,8);
      g.fillStyle(0x64ffe0);g.fillRoundedRect(16,16,20,9,3);g.fillStyle(0x082334);g.fillRect(28,18,3,5);
      g.fillStyle(0x97bdd0);g.fillRect(13,40,f===1?8:6,f===1?7:11);g.fillRect(29,40,6,f===2?7:11);g.fillRect(3,24,6,12);
      g.fillStyle(0xffcb77);g.fillRect(21,29,6,4);
    });
    texture('platform',180,20,g=>{g.fillStyle(0x1d3c53);g.fillRect(0,0,180,20);g.fillStyle(0x64ffe0);g.fillRect(0,0,180,3);for(let i=10;i<180;i+=25){g.fillStyle(0x30566e);g.fillRect(i,10,12,3);}});
    texture('ground',128,50,g=>{g.fillStyle(0x142d43);g.fillRect(0,0,128,50);g.fillStyle(0x3c7088);g.fillRect(0,0,128,4);});
    texture('shard',24,32,g=>{g.fillStyle(0x64ffe0);g.fillTriangle(12,0,0,16,12,32);g.fillStyle(0xc6fff1);g.fillTriangle(12,0,24,16,12,32);});
    texture('spike',64,36,g=>{g.fillStyle(0xff5f7c);for(let i=0;i<3;i++)g.fillTriangle(i*21,36,i*21+10,4,i*21+21,36);});
    texture('drone',44,36,g=>{g.fillStyle(0x683955);g.fillRoundedRect(4,8,36,22,7);g.lineStyle(2,0xff718e);g.strokeRoundedRect(4,8,36,22,7);g.fillStyle(0xffcb77);g.fillRect(12,15,20,5);g.fillStyle(0xff718e);g.fillRect(0,0,44,3);});
    texture('portal',60,90,g=>{g.lineStyle(7,0xffffff);g.strokeRoundedRect(6,4,48,82,20);g.fillStyle(0xffffff,.15);g.fillRoundedRect(6,4,48,82,20);});
    texture('bullet',16,6,g=>{g.fillStyle(0xffcb77);g.fillRoundedRect(0,0,16,6,3);});
  }
  refreshUI(){ui.stats.textContent=`SHARDS ${this.count} / 8 · SHIELDS ${this.shields}`;}
  burst(x,y,color,n=10){n=Math.min(n,80-this.particleCount);for(let i=0;i<n;i++){this.particleCount++;const p=this.add.rectangle(x,y,Phaser.Math.Between(3,7),3,color).setDepth(8);const a=Math.random()*Math.PI*2,r=Phaser.Math.Between(25,85);this.tweens.add({targets:p,x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,alpha:0,angle:180,duration:Phaser.Math.Between(250,550),onComplete:()=>{this.particleCount--;p.destroy();}});}}
  destroyDrone(d){if(!d.active)return;this.burst(d.x,d.y,0xff718e,20);d.destroy();this.cameras.main.shake(110,.003);tone(160,.16,'sawtooth',45);}
  hurt(){if(this.time.now<this.safeUntil||this.won)return;this.shields--;this.refreshUI();this.burst(this.player.x,this.player.y,0xff718e,18);this.cameras.main.shake(200,.008);tone(180,.2,'sawtooth',50);if(this.shields<=0){this.scene.restart();return;}this.safeUntil=this.time.now+1500;this.dashUntil=0;this.player.body.setAllowGravity(true);this.player.setPosition(this.checkpoint,440).setVelocity(0);this.jumps=0;ui.status.textContent='Shield lost. Shards kept — try again!';}
  update(time){
    if(!started||this.won){this.player.setVelocityX(0);return;}
    const k=this.keys,p=this.player,ground=(p.body.blocked.down||p.body.touching.down)&&p.body.velocity.y>=0;
    if(ground){if(!this.wasGrounded)this.burst(p.x,p.y+22,0x9cc4d0,6);this.jumps=0;this.lastGrounded=time;if(p.y>440)this.checkpoint=Math.max(100,Math.floor(p.x/400)*400+100);}
    this.wasGrounded=ground;
    if(!ground&&this.jumps===0&&time-this.lastGrounded>100)this.jumps=1;
    const left=k.left.isDown||this.arrows.left.isDown||touch.left,right=k.right.isDown||this.arrows.right.isDown||touch.right;
    const jump=Phaser.Input.Keyboard.JustDown(k.jump)||Phaser.Input.Keyboard.JustDown(k.up)||Phaser.Input.Keyboard.JustDown(this.arrows.up)||taps.jump;
    const dash=Phaser.Input.Keyboard.JustDown(k.dash)||Phaser.Input.Keyboard.JustDown(k.dashAlt)||taps.dash;
    if(jump)this.jumpBufferedUntil=time+120;
    if(time>=this.dashUntil){p.body.setAllowGravity(true);p.setVelocityX((right?1:0)*245-(left?1:0)*245);if(left||right)this.facing=right?1:-1;
      if(time<this.jumpBufferedUntil&&this.jumps<2){this.jumpBufferedUntil=0;p.setVelocityY(this.jumps===0?-465:-430);this.jumps++;this.burst(p.x,p.y+20,0x64ffe0,10);tone(this.jumps===1?280:420,.12,'sine',650);}
      if(dash&&time>=this.dashReady){this.dashUntil=time+160;this.dashReady=time+700;p.body.setAllowGravity(false);p.setVelocity(this.facing*650,0);tone(700,.15,'triangle',100);}
    }else{if(Math.floor(time/25)!==this.lastTrail){this.lastTrail=Math.floor(time/25);this.burst(p.x,p.y,0x64ffe0,2);}}
    p.setFlipX(this.facing<0);p.setAlpha(time<this.safeUntil?(Math.floor(time/100)%2?.4:1):1);
    if(ground&&(left||right))p.play('run',true);else{p.anims.stop();p.setTexture('bot0');}
    if((k.fire.isDown||touch.fire||taps.fire)&&time>=this.fireReady){this.fireReady=time+230;const b=this.bullets.create(p.x+this.facing*25,p.y-3,'bullet').setVelocityX(this.facing*650);b.born=time;tone(750,.07,'square',240);}
    this.bullets.getChildren().forEach(b=>{if(time-b.born>1200)b.destroy();});
    this.drones.getChildren().forEach(d=>{if(d.x>d.originX+90)d.setVelocityX(-70);if(d.x<d.originX-90)d.setVelocityX(70);});
    if(this.mover.x>1400)this.mover.setVelocityX(-75);if(this.mover.x<1250)this.mover.setVelocityX(75);
    if(p.y>590)this.hurt();
    const cooldown=time<this.dashReady;ui.dash.classList.toggle('cooldown',cooldown);const dashLabel=cooldown?'charging':'ready';if(ui.dashState.textContent!==dashLabel)ui.dashState.textContent=dashLabel;
    input.consume();
  }
}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#0c172b',pixelArt:false,physics:{default:'arcade',arcade:{gravity:{y:1100},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Relay});
// Preserve the world's vertical scale while showing less world in portrait, more in landscape.
let resizeFrame;
function fitViewport(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{
  const r=document.querySelector('#game').getBoundingClientRect();if(r.width<1||r.height<1||!game.isBooted)return;
  const width=Math.max(240,Math.min(1920,Math.round(540*r.width/r.height)));
  if(game.scale.width!==width)game.scale.setGameSize(width,540);else game.scale.refresh();
  if(scene?.cameras?.main){scene.cameras.main.setSize(width,540);scene.cameras.main.setZoom(r.width>r.height&&r.height<320?1.25:1);scene.cameras.main.setDeadzone(Math.min(130,width*.22),100);}
});}
new ResizeObserver(fitViewport).observe(document.querySelector('#game'));
game.events.once('ready',fitViewport);window.addEventListener('resize',fitViewport);
window.visualViewport?.addEventListener('resize',fitViewport);
