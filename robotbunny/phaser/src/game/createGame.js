import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { StartScene } from '../scenes/StartScene.js';
import { PlayScene } from '../scenes/PlayScene.js';
export function createGame({parent,controlState}) {
 return new Phaser.Game({type:Phaser.AUTO,parent,width:960,height:560,backgroundColor:'#080f1d',roundPixels:true,
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  physics:{default:'arcade',arcade:{gravity:{y:1800},fixedStep:true,fps:60}},fps:{target:60,smoothStep:false},
  scene:[BootScene,StartScene,PlayScene],callbacks:{preBoot(game){game.registry.set('controlState',controlState);}}});
}