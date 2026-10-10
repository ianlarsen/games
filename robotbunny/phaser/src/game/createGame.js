import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { StartScene } from '../scenes/StartScene.js';
import { PlayScene } from '../scenes/PlayScene.js';
export function createGame({parent,controlState}) {
 return new Phaser.Game({type:location.protocol==='file:'?Phaser.CANVAS:Phaser.AUTO,parent,width:960,height:560,backgroundColor:'#080f1d',roundPixels:true,
  render:{antialias:true,antialiasGL:false,batchSize:512,powerPreference:'default'},
  loader:{imageLoadType:'HTMLImageElement',crossOrigin:null,maxParallelDownloads:4},
  audio:{disableWebAudio:location.protocol==='file:'},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  // One FPS of scheduling tolerance avoids dropping 60 Hz frames to 30 Hz on jitter.
  physics:{default:'arcade',arcade:{gravity:{y:1800},fixedStep:true,fps:60}},fps:{target:60,limit:61,smoothStep:false},
  scene:[BootScene,StartScene,PlayScene],callbacks:{preBoot(game){game.registry.set('controlState',controlState);}}});
}
