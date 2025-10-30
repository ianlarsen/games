import { assets } from './assets.js';

export default {
  'prison_interior_welcome': {
    background: assets.prison_interior,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '15%', width: '14%', flipped: true },
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '30%', width: '11%', flipped: true },
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '45%', width: '14%', flipped: true },
      { id: 'john', asset: assets.john, bottom: '10%', left: '65%', width: '11%', flipped: true },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '80%', width: '11%', flipped: true },
    ],
    onLoad: { type:'dialogue',
      text: "Inside the prison. The air is heavy with mistrust. Daryl's crossbow gleams in the dim light.",
      choices: [{ text: "Talk to Rick", target: 'prison_rick_rules' }]
    },
    interactions: {
      'rick':  { type:'dialogue', text:"Rick: You look like you've been through hell. We all have.", choices:[{ text:"Tell me about it.", target:'prison_rick_rules' }] },
      'carol': { type:'dialogue', text:"Carol: You all look hungry. I can get you something.", choices:[{ text:"We'd appreciate that.", target:null }] },
      'daryl': { type:'dialogue', text:"Daryl: (cleaning crossbow, not looking up)", choices:[{ text:"Best not to bother him.", target:null }] },
      'john':  { type:'dialogue', text:"John: We need to find the rest of our team.", choices:[{ text:"Let's look around.", target:'prison_yard_clash' }] }
    }
  },

  'prison_rick_rules': {
    background: assets.prison_interior,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '35%', width: '15%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Rick: \"Follow the rules and you're welcome. Break them and you're out. We've lost too many to take chances.\"",
      choices: [{ text: "Understood. What do you need from us?", target: 'prison_yard_clash' }]
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
