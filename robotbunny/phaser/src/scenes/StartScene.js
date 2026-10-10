import Phaser from 'phaser';
export class StartScene extends Phaser.Scene {
 constructor(){super('start');}
 create(){const bg=this.add.image(0,0,'background').setAlpha(.6),bunny=this.add.image(0,0,'player').setDisplaySize(75,136);const layout=()=>{const w=this.scale.gameSize.width,h=this.scale.gameSize.height;bg.setPosition(w/2,h/2).setDisplaySize(Math.max(w,h*2.55),h);bunny.setPosition(w*.75,h*.7);};layout();this.scale.on('resize',layout);this.events.once('shutdown',()=>this.scale.off('resize',layout));this.game.events.emit('ready');}
}
