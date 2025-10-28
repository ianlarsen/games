import { assets } from './assets.js';

export default {
  'breakroom_discovery': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '15%', width: '11%' },
      { id: 'ian',    asset: assets.ian,    bottom: '10%', left: '40%', width: '11%', flipped: true },
      { id: 'justin', asset: assets.justin, bottom: '10%', left: '65%', width: '11%', flipped: true },
      { id: 'maggie', asset: assets.maggie, bottom: '10%', left: '85%', width: '11%', flipped: true },
    ],
    objects: [ { id: 'concrete_research', asset: assets.self_healing_concrete, bottom: '15%', left: '5%', width: '8%' } ],
    onLoad: { type:'dialogue', text: "You find Ian, Justin, and Maggie in a debris-filled room.", choices: [{ text: "What's going on here?", target: null }] },
    interactions: {
      'ian': { type:'dialogue', text:"Ian: The walls remember things...", choices:[{ text:"What are you talking about?", target:null }] },
      'justin': { type:'dialogue', text:"Justin: Beetle-armor prototypes! Theoretically walker-proof.", choices:[{ text:"Theoretically?", target:null }] },
      'maggie': { type:'dialogue', text:"Maggie: Your friend Ed made a joke. Glenn didn't appreciate it.", choices:[{ text:"I'll talk to him.", target:null }] },
      'concrete_research': { type:'dialogue', text:"Rob C. was experimenting with self-healing concrete!", choices:[{ text:"We have to tell Rick.", target: 'walker_outbreak', sfx: 'ding' }] }
    }
  },

  'walker_outbreak': {
    background: assets.prison_interior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '20%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '40%', width: '15%', flipped: true },
      { id: 'zombie1', asset: assets.zombie1, bottom: '10%', left: '65%', width: '20%', flipped: true },
      { id: 'zombie2', asset: assets.zombie2, bottom: '10%', left: '80%', width: '20%'},
    ],
    onLoad: { type:'dialogue',
      text: "A cell block door has been breached! Walkers pour in!",
      sfx: 'horde',
      choices: [{ text: "We have to fight together!", target: 'cliffhanger_ending' }]
    },
    interactions: {
      'rick': { type:'dialogue', text:"Rick: Form a line! Don't let them break through!", choices:[{ text:"Right behind you!", target:null }] }
    }
  },

  'cliffhanger_ending': {
    background: assets.prison_interior,
    characters: [
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '40%', width: '11%', flipped: true },
      { id: 'zombie3', asset: assets.zombie3, bottom: '10%', left: '55%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "After a brutal fight, headlights approach—the Governor... Ian kneels beside a walker. It whispers: 'Help...'",
      choices: [{ text: "To be continued...", target: 'office_start' }]
    },
    interactions: {}
  },
};
