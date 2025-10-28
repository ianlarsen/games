import { assets } from './assets.js';

export default {
  'prison_interior_welcome': {
    background: assets.prison_interior,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '20%', width: '15%', flipped: true },
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '35%', width: '11%', flipped: true },
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '5%', width: '15%', flipped: true },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '75%', width: '11%', flipped: true },
    ],
    onLoad: { type:'dialogue',
      text: "You step inside. The air is heavy with mistrust. A man with a crossbow gives you a hard stare.",
      choices: [{ text: "Let's find the rest of our group.", target: 'prison_yard_clash' }]
    },
    interactions: {
      'rick':  { type:'dialogue', text:"Rick: Follow the rules and you're welcome. Break them and you're out.", choices:[{ text:"Understood.", target:null }] },
      'carol': { type:'dialogue', text:"Carol: You all look hungry.", choices:[{ text:"We are.", target:null }] },
      'daryl': { type:'dialogue', text:"Daryl keeps cleaning his crossbow.", choices:[{ text:"Best not to bother him.", target:null }] }
      'john': { type:'dialogue', text:"Let's find the rest of our group.", target: 'prison_yard_clash' }] }
    }
  },

  'prison_yard_clash': {
    background: assets.prison_interior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '10%', width: '11%' },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '25%', width: '11%' },
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '45%', width: '11%' },
      { id: 'ed', asset: assets.ed, bottom: '10%', left: '65%', width: '15%', flipped: true },
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '85%', width: '15%' }
    ],
    objects: [
      { id: 'vending', asset: assets.vending_machine, bottom: '10%', left: '1%', width: '11%'}
    ],
    onLoad: { type:'dialogue',
      text: "You find the rest of your team. The tension between the two groups is palpable.",
      choices: [ { text: "Let's check the other cell block.", target: 'breakroom_discovery' } ]
    },
    interactions: {
      'dave':  { type:'dialogue', text:"Dave: They're hiding something.", choices:[{ text:"Stay cool, Dave.", target:null }] },
      'mac':   { type:'dialogue', text:"Mac: She's too soft for this world.", choices:[{ text:"She's a survivor, like us.", target:null }] },
      'ed':    { type:'dialogue', text:"Ed: Shame all this food went to waste!", choices:[{ text:"Ed, maybe not now.", target:null }] },
      'daryl': { type:'dialogue', text:"Daryl: Watch your mouth, Hashbrown.", choices:[{ text:"Yikes.", target:null }] }
    }
  },
};
