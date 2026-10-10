import Phaser from 'phaser';
import { makeCourse,approach } from '../game/course.js';
import { FileSounds } from '../game/fileSounds.js';
export class PlayScene extends Phaser.Scene {
 constructor(){super('play');}
 init(data={}){this.level=data.level||1;this.score=data.score||0;this.lives=data.lives||4;this.practice=!!data.practice;}
 create(){
  this.controls=this.registry.get('controlState');this.course=makeCourse(this.level);this.elapsed=0;this.finished=false;
  this.invincible=0;this.fireTimer=0;this.dashTimer=0;this.dashCooldown=0;this.jumpBuffer=0;this.coyote=0;this.airJump=true;this.facing=1;this.knockback=0;this.hudTime=0;this.bossAwake=false;
  this.physics.world.setBounds(0,-500,this.course.length,1700);
  const biomes=Object.values(this.cache.json.get('biomes')?.biomes||{}),biome=biomes[(this.level-1)%Math.max(1,biomes.length)];
  this.cameras.main.setBackgroundColor(biome?.colors?.bg||'#080f1d');
  // Share one texture between two images; avoid a world-sized canvas and POT tile texture.
  const source=this.textures.get('background').getSourceImage();this.backgroundWidth=560*source.width/source.height;
  this.backgrounds=[0,1].map(i=>this.add.image(i*this.backgroundWidth,0,'background').setOrigin(0).setDisplaySize(this.backgroundWidth,560).setAlpha(.65).setScrollFactor(0));
  this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!this.textures.exists('spark')){const g=this.make.graphics({x:0,y:0},false);g.fillStyle(0xffffff);g.fillRect(0,0,4,4);g.generateTexture('spark',4,4);g.destroy();}
  this.particles=this.add.particles(0,0,'spark',{emitting:false,lifespan:300,speed:{min:60,max:190},scale:{start:1.4,end:0},gravityY:300,maxParticles:48});
  this.ground=this.physics.add.staticGroup();this.platforms=this.physics.add.staticGroup();
  for(let x=0;x<this.course.length;x+=400){const width=Math.min(400,this.course.length-x);this.ground.create(x+width/2,520,'ground').setDisplaySize(width,80).refreshBody();}
  for(const p of this.course.platforms){const s=this.platforms.create(p.x,p.y+10,'platform').setDisplaySize(p.width,20).refreshBody();s.body.checkCollision.down=false;s.body.checkCollision.left=false;s.body.checkCollision.right=false;}
  this.coins=this.physics.add.staticGroup();for(const c of this.course.coins)this.coins.create(c.x,c.y,'coin').setDisplaySize(23,23).refreshBody();
  this.player=this.physics.add.image(this.practice?this.course.arenaStart+200:100,440,'spark').setDisplaySize(30,54).setVisible(false).setCollideWorldBounds(true);
  this.player.body.setSize(4,4);this.player.body.setMaxVelocity(800,1200);
  this.visual=this.add.image(this.player.x,467,'player').setOrigin(.5,1).setDisplaySize(38,69);
  this.physics.add.collider(this.player,this.ground);this.physics.add.collider(this.player,this.platforms,undefined,(p,s)=>p.body.velocity.y>=0&&p.body.prev.y+p.body.height<=s.body.top+10);
  this.enemies=this.physics.add.group({maxSize:32});
  for(const e of this.practice?[]:this.course.enemies){const enemy=this.enemies.create(e.x,e.flying?270:448,e.flying?'flyer':'hopper').setDisplaySize(e.flying?52:48,e.flying?35:30);enemy.body.setSize(enemy.width,enemy.height);enemy.body.setAllowGravity(!e.flying);enemy.home=e.x;enemy.flying=e.flying;enemy.phase=e.x%7;enemy.body.setVelocityX(-45-Math.min(this.level*6,60));}
  this.physics.add.collider(this.enemies,this.ground);
  this.lasers=this.physics.add.group({defaultKey:'spark',maxSize:32,allowGravity:false});
  this.orbs=this.physics.add.group({defaultKey:'spark',maxSize:24,allowGravity:false});
  this.boss=this.physics.add.image(this.course.bossX,425,'boss').setDisplaySize(115,98).setImmovable(true);this.boss.body.setAllowGravity(false);this.boss.maxHp=8+Math.min(this.level-1,8)*2;this.boss.hp=this.boss.maxHp;this.boss.attackTimer=1.5;this.boss.windup=0;
  this.bossLabel=this.add.text(this.course.bossX,315,'',{fontFamily:'system-ui',fontSize:'16px',color:'#b5efff'}).setOrigin(.5);
  this.add.text(this.course.arenaStart+80,200,'BOSS ARENA',{fontFamily:'system-ui',fontSize:'20px',color:'#9ee8f5'});
  this.physics.add.overlap(this.player,this.coins,(p,c)=>{if(!c.active)return;c.disableBody(true,true);this.score+=10;this.sfx('coin',.2);this.burst(c.x,c.y,0xffd479);});
  this.physics.add.overlap(this.player,this.enemies,(p,e)=>{if(!e.active||this.finished)return;if(p.body.velocity.y>60&&p.body.bottom<e.body.top+22){this.kill(e);p.body.setVelocityY(-540);this.airJump=true;}else if(this.dashTimer>0){this.kill(e);}else this.hurt(e.body.center.x);});
  this.physics.add.overlap(this.lasers,this.enemies,(l,e)=>{if(l.active&&e.active){l.disableBody(true,true);this.kill(e);}});
  this.physics.add.overlap(this.boss,this.lasers,(b,l)=>{if(l.active&&this.bossAwake&&!this.finished){l.disableBody(true,true);b.hp--;this.sfx('boss-hit',.25);this.burst(b.x,b.y,0x7be2ff);if(b.hp<=0)this.win();}});
  this.physics.add.overlap(this.player,this.boss,()=>{if(this.bossAwake&&!this.finished)this.hurt(this.boss.x);});
  this.physics.add.overlap(this.player,this.orbs,(p,o)=>{if(o.active){o.disableBody(true,true);this.hurt(o.x);}});
  this.physics.add.collider(this.lasers,this.ground,l=>l.disableBody(true,true));this.physics.add.collider(this.orbs,this.ground,o=>o.disableBody(true,true));
  this.physics.world.on('worldstep',this.fixedUpdate,this);
  this.fileSfx=location.protocol==='file:'?new FileSounds(new URL('../sounds/',document.baseURI)):null;
  this.sfxPools={};for(const key of ['jump','laser','coin','hit','squish','boss-hit','flag'])if(this.cache.audio.exists(key))this.sfxPools[key]=[this.sound.add(key),this.sound.add(key)];
  const onPause=()=>this.fileSfx?.stop();this.events.on('pause',onPause);
  this.events.once('shutdown',()=>{this.physics.world?.off('worldstep',this.fixedUpdate,this);this.events.off('pause',onPause);for(const pool of Object.values(this.sfxPools))for(const sound of pool)sound.destroy();this.fileSfx?.destroy();this.fileSfx=null;this.sfxPools={};});
  this.cameraX=this.player.x;this.game.events.emit('playing');this.publishHud();
 }
 sfx(key,volume=.35){if(this.sound.mute)return;if(this.fileSfx){this.fileSfx.play(key,volume);return;}if(this.sound.locked)return;const sound=this.sfxPools[key]?.find(s=>!s.isPlaying);if(sound)sound.play({volume});}
 burst(x,y,tint){this.particles.setParticleTint(tint);this.particles.explode(this.reducedMotion?3:8,x,y);}
 kill(e){this.burst(e.x,e.y,0x7be2ff);e.disableBody(true,true);this.score+=25;this.sfx('squish',.3);}
 hurt(sourceX){
  if(this.invincible>0||this.finished)return;
  this.lives--;this.invincible=1.1;this.knockback=.18;this.dashTimer=0;this.player.body.setVelocity(this.player.body.center.x<sourceX?-260:260,-360);this.sfx('hit');if(!this.reducedMotion)this.cameras.main.shake(100,.004);this.publishHud();
  if(this.lives<=0)this.finish('Run over','Score '+this.score+'. Jump over shots or dash through small enemies.','Try again');
 }
 projectile(group,x,y,vx,vy,tint,width,height){const shot=group.get(x,y,'spark');if(!shot)return;shot.enableBody(true,x,y,true,true);shot.setDisplaySize(width,height).setTint(tint);shot.body.setSize(4,4);shot.body.setAllowGravity(false);shot.body.setVelocity(vx,vy);shot.expires=this.elapsed+2;}
 fixedUpdate(dt){
  if(this.finished)return;
  this.elapsed+=dt;this.invincible=Math.max(0,this.invincible-dt);this.fireTimer-=dt;this.dashCooldown-=dt;this.knockback-=dt;this.dashTimer=Math.max(0,this.dashTimer-dt);
  const p=this.player.body,c=this.controls,grounded=p.blocked.down||p.touching.down;
  if(grounded){this.coyote=.12;this.airJump=true;}else this.coyote=Math.max(0,this.coyote-dt);
  if(c.jumpQueued){this.jumpBuffer=.15;c.jumpQueued=false;}else this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
  if(this.jumpBuffer>0&&(this.coyote>0||this.airJump)){const air=this.coyote<=0;p.setVelocityY(air?-610:-650);if(air)this.airJump=false;this.coyote=0;this.jumpBuffer=0;this.sfx('jump',.25);this.burst(p.center.x,p.bottom,0x7be2ff);}
  if(!c.jump&&p.velocity.y<-280)p.setVelocityY(approach(p.velocity.y,-280,2400*dt));
  const dir=Number(c.right)-Number(c.left);if(dir)this.facing=dir;
  if(c.dashQueued){if(this.dashCooldown<=0){this.dashTimer=.16;this.dashCooldown=.75;this.burst(p.center.x,p.center.y,0xb4f7ff);}c.dashQueued=false;}
  p.setAllowGravity(this.dashTimer<=0);
  if(this.dashTimer>0)p.setVelocity(this.facing*650,0);else if(this.knockback<=0)p.setVelocityX(approach(p.velocity.x,dir*300,(dir?2200:1900)*dt));
  if(c.shoot&&this.fireTimer<=0){this.fireTimer=.18;this.projectile(this.lasers,p.center.x+this.facing*23,p.center.y-4,this.facing*760,0,0x7be2ff,23,5);this.sfx('laser',.12);}
  for(const group of [this.lasers,this.orbs])for(const shot of group.getChildren()){if(shot.active&&(shot.expires<this.elapsed||shot.body.center.x<0||shot.body.center.x>this.course.length||shot.body.center.y>650))shot.disableBody(true,true);}
  for(const e of this.enemies.getChildren()){if(!e.active)continue;const x=e.body.center.x;if(x<e.home-95)e.body.setVelocityX(Math.abs(e.body.velocity.x));if(x>e.home+95)e.body.setVelocityX(-Math.abs(e.body.velocity.x));e.setFlipX(e.body.velocity.x>0);if(e.flying)e.body.setVelocityY(Math.cos(this.elapsed*2+e.phase)*35);}
  if(p.center.x>this.boss.x-Math.min(450,this.cameras.main.width*.75))this.bossAwake=true;
  if(this.bossAwake){
   const b=this.boss,phase=b.hp<=b.maxHp/2;b.attackTimer-=dt;
   if(b.attackTimer<=0&&b.windup<=0){b.windup=.45;b.setTint(0xffb07a);}
   if(b.windup>0){b.windup-=dt;if(b.windup<=0){const angle=Math.atan2(p.center.y-b.y,p.center.x-b.x);for(const spread of phase?[-.2,0,.2]:[0])this.projectile(this.orbs,b.x-45,b.y,Math.cos(angle+spread)*260,Math.sin(angle+spread)*260,0xff865e,16,16);b.clearTint();b.attackTimer=phase?1.05:1.65;}}
   b.body.setVelocityY(Math.cos(this.elapsed*1.3)*25);
  }
  if(p.center.y>700){p.reset(Math.max(100,p.center.x-100),400);this.hurt(p.center.x+1);}
  this.hudTime+=dt;if(this.hudTime>=.1){this.hudTime=0;this.publishHud();}
 }
 publishHud(){this.bossLabel.setText(this.bossAwake&&!this.finished?'BOSS '+this.boss.hp+'/'+this.boss.maxHp+(this.boss.hp<=this.boss.maxHp/2?' • ENRAGED':''):'');this.game.events.emit('hud',{level:this.level,score:this.score,lives:this.lives,progress:Math.min(100,Math.round(this.player.body.center.x/this.course.length*100)),boss:this.bossAwake?Math.max(0,this.boss.hp):null});}
 update(time,delta){
  if(!this.player)return;
  const p=this.player.body,grounded=p.blocked.down||p.touching.down;
  this.visual.setPosition(p.center.x,p.bottom+(grounded?Math.sin(time*.018)*Math.min(Math.abs(p.velocity.x)/100,2):0)).setFlipX(this.facing<0);
  this.visual.setDisplaySize(grounded?38:35,grounded?69:73).setAlpha(this.invincible>0?(Math.floor(this.elapsed*12)%2?.3:1):1);
  const target=p.center.x+this.facing*75;this.cameraX+= (target-this.cameraX)*(1-Math.exp(-9*Math.min(delta,100)/1000));
  const cam=this.cameras.main;cam.scrollX=Phaser.Math.Clamp(this.cameraX-cam.width/2,0,Math.max(0,this.course.length-cam.width));
  const offset=(cam.scrollX*.28)%this.backgroundWidth;for(let i=0;i<2;i++)this.backgrounds[i].x=i*this.backgroundWidth-offset;
  this.bossLabel.setPosition(this.boss.x,this.boss.y-75);
 }
 win(){if(this.finished)return;this.boss.disableBody(true,true);this.score+=250;this.sfx('flag',.5);this.burst(this.boss.x,this.boss.y,0xffd479);this.finish('Moon cleared!','Score '+this.score+'. Next sector brings a tougher boss and flying enemies.','Next sector',true);}
 finish(title,message,label,won=false){this.finished=true;this.physics.pause();try{const best=Number(localStorage.getItem('rb_phaser_best'))||0;localStorage.setItem('rb_phaser_best',String(Math.max(best,this.score)));}catch{}this.game.events.emit('finished',{title,message,label,won});this.publishHud();}
}
