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
    onLoad: { type:'dialogue', text: "You find Ian, Justin, and Maggie in a debris-filled room. Something important is here.", choices: [{ text: "Talk to everyone and investigate", target: 'breakroom_investigate' }] },
    interactions: {
      'ian': { type:'dialogue', text:"Ian: The walls remember things...", choices:[{ text:"Interesting...", target:'breakroom_investigate' }] },
      'justin': { type:'dialogue', text:"Justin: Beetle-armor prototypes! Theoretically walker-proof.", choices:[{ text:"Tell me more.", target:'breakroom_investigate' }] },
      'maggie': { type:'dialogue', text:"Maggie: Your friend Ed made a joke. Glenn didn't appreciate it.", choices:[{ text:"I'll talk to him.", target:'breakroom_investigate' }] },
      'concrete_research': { type:'dialogue', text:"Rob C. was experimenting with self-healing concrete!", choices:[{ text:"We have to tell Rick.", target: 'walker_outbreak', sfx: 'ding' }] }
    }
  },

  'breakroom_investigate': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '25%', width: '11%' },
      { id: 'justin', asset: assets.justin, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    objects: [ { id: 'concrete_research', asset: assets.self_healing_concrete, bottom: '15%', left: '75%', width: '10%' } ],
    onLoad: { type:'dialogue',
      text: "Justin and Jamaal connect over the bioinspired materials. This could change everything for the prison defenses.",
      choices: [
        { text: "Check the concrete research", target: 'breakroom_concrete' },
        { text: "Continue exploring", target: 'walker_outbreak' }
      ]
    }
  },

  'breakroom_concrete': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '35%', width: '11%' }
    ],
    objects: [ { id: 'concrete_research', asset: assets.self_healing_concrete, bottom: '25%', left: '60%', width: '15%' } ],
    onLoad: { type:'dialogue',
      text: "You examine Rob C.'s research. Self-healing concrete using bio-inspired materials. This could save lives...",
      choices: [{ text: "We need to tell Rick about this!", target: 'walker_outbreak', sfx: 'ding' }]
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
      text: "After a brutal fight, headlights approach in the distance... Ian kneels beside a walker. It whispers: 'Help...' His eyes turn blue.",
      choices: [{ text: "Episode 2: The Governor arrives", target: 'governor_arrival' }]
    },
    interactions: {
      'ian': { type:'dialogue', text:"Ian's eyes glow with an otherworldly blue. He's connected to the dead now.", choices:[{ text:"What's happening?", target:null }] }
    }
  },
};
