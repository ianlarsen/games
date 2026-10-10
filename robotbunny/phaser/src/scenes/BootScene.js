import Phaser from 'phaser';
import biomeConfig from '../../../biome-config.json';
export class BootScene extends Phaser.Scene {
 constructor(){super('boot');}
 preload(){
  const base=new URL('../',document.baseURI).href;
  this.load.setBaseURL(base);
  for(const [key,file] of Object.entries({background:'moon-background',player:'robotbunny',ground:'ground',platform:'platform',coin:'coin',hopper:'hopper',flyer:'flyer',boss:'squid'})) this.load.image(key,'images/'+file+'.png');
  // Compiled into the script, so the bundled app needs no file:// JSON request.
  this.cache.json.add('biomes',biomeConfig);
  if(location.protocol!=='file:')for(const key of ['jump','laser','coin','hit','squish','boss-hit','flag'])this.load.audio(key,'sounds/'+key+'.mp3');
  this.failed=[];
  this.load.on('loaderror',file=>this.failed.push(file.key));
  this.load.on('progress',v=>this.game.events.emit('loading',Math.round(v*100)));
 }
 create(){
  const missing=['background','player','ground','platform','coin','hopper','flyer','boss'].filter(k=>!this.textures.exists(k));
  if(missing.length){this.game.events.emit('load-failed',missing);return;}
  this.scene.start('start');
 }
}
