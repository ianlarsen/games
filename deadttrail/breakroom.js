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
    onLoad: { type:'dialogue', text: "You find Ian, Justin, and Maggie in a debris-filled room. Something important is here.", choices: [
      { text: "Talk to everyone and investigate", target: 'breakroom_investigate' },
      { text: "Check the research papers", target: 'breakroom_concrete' },
      { text: "Talk to Ian about his powers", target: 'breakroom_ian_powers' }
    ] },
    interactions: {
      'ian': { type:'dialogue', text:"Ian: The walls remember things...", choices:[{ text:"What do you mean?", target:'breakroom_ian_powers' }, { text:"Let's focus", target:'breakroom_investigate' }] },
      'justin': { type:'dialogue', text:"Justin: Beetle-armor prototypes! Theoretically walker-proof.", choices:[{ text:"Tell me more", target:'breakroom_justin_tech' }, { text:"Later", target:'breakroom_investigate' }] },
      'maggie': { type:'dialogue', text:"Maggie: Your friend Ed made a joke. Glenn didn't appreciate it.", choices:[{ text:"I'll talk to him", target:'breakroom_ed_situation' }, { text:"Ed means well", target:'breakroom_investigate' }] },
      'concrete_research': { type:'dialogue', text:"Rob C. was experimenting with self-healing concrete!", choices:[{ text:"We have to tell Rick", target: 'walker_outbreak', sfx: 'ding' }, { text:"Study it more first", target:'breakroom_concrete' }] },
      'john': { type:'dialogue', text:"John: This research could change everything for us.", choices:[{ text:"Agreed", target:'breakroom_concrete' }] }
    }
  },

  'breakroom_ian_powers': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '35%', width: '11%' },
      { id: 'ian',    asset: assets.ian,    bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue', text: "Ian's eyes flash blue: \"I can sense them. The dead. Their memories, their pain... I think I can control them.\"", choices: [
      { text: "That's incredible. And terrifying.", target: 'breakroom_investigate' },
      { text: "We need to tell the others", target: 'walker_outbreak' }
    ] }
  },

  'breakroom_justin_tech': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'justin', asset: assets.justin, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue', text: "Justin: \"Biomimetic armor inspired by beetle exoskeletons. Light, flexible, but incredibly strong. Could save lives.\"", choices: [
      { text: "Can we make this work?", target: 'breakroom_investigate' },
      { text: "Let's focus on the concrete first", target: 'breakroom_concrete' }
    ] }
  },

  'breakroom_ed_situation': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'maggie', asset: assets.maggie, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue', text: "Maggie: \"He joked about fishing during dinner. Glenn lost family to the outbreak. It was... insensitive.\"", choices: [
      { text: "I'll make sure he apologizes", target: 'breakroom_investigate' },
      { text: "Everyone handles trauma differently", target: 'breakroom_investigate' }
    ] }
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
    },
    interactions: {
      'john': { type:'dialogue', text:"John: We should share this with Rick's group.", choices:[{ text:"Agreed", target:'walker_outbreak' }] },
      'justin': { type:'dialogue', text:"Justin: The applications are endless! We could rebuild society!", choices:[{ text:"One step at a time", target:'breakroom_concrete' }] },
      'concrete_research': { type:'dialogue', text:"Detailed notes on self-healing mechanisms.", choices:[{ text:"Study it", target:'breakroom_concrete' }, { text:"Bring it to Rick", target:'walker_outbreak' }] }
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
      choices: [
        { text: "We need to tell Rick about this!", target: 'walker_outbreak', sfx: 'ding' },
        { text: "Study it more carefully first", target: 'breakroom_deep_study' }
      ]
    },
    interactions: {
      'concrete_research': { type:'dialogue', text:"The formulas are complex but promising. Rob was a genius.", choices:[{ text:"Take notes", target:'breakroom_deep_study' }, { text:"Share with Rick", target:'walker_outbreak' }] }
    }
  },

  'breakroom_deep_study': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '35%', width: '11%' },
      { id: 'justin', asset: assets.justin, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    objects: [ { id: 'concrete_research', asset: assets.self_healing_concrete, bottom: '25%', left: '5%', width: '12%' } ],
    onLoad: { type:'dialogue',
      text: "You and Justin pore over the research. The concrete uses bacteria that produce limestone when exposed to water. Brilliant!",
      choices: [
        { text: "This could fortify the entire prison", target: 'walker_outbreak' },
        { text: "We need to test this first", target: 'walker_outbreak' }
      ]
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
      choices: [
        { text: "We have to fight together!", target: 'cliffhanger_ending' },
        { text: "Barricade the door!", target: 'walker_outbreak_barricade' }
      ]
    },
    interactions: {
      'rick': { type:'dialogue', text:"Rick: Form a line! Don't let them break through!", choices:[{ text:"Right behind you!", target:'cliffhanger_ending' }, { text:"We need to barricade!", target:'walker_outbreak_barricade' }] },
      'john': { type:'dialogue', text:"John: There's too many!", choices:[{ text:"Fight!", target:'cliffhanger_ending' }] },
      'zombie1': { type:'dialogue', text:"It lurches forward with a guttural moan.", choices:[{ text:"Back away", target:null }] },
      'zombie2': { type:'dialogue', text:"Another walker crashes through debris.", choices:[{ text:"Stay alert", target:null }] }
    }
  },

  'walker_outbreak_barricade': {
    background: assets.prison_interior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '25%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '50%', width: '15%', flipped: true },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '75%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "You help push furniture against the door. Dave uses his engineering knowledge to reinforce it. You bought yourselves time!",
      choices: [
        { text: "Regroup and plan", target: 'cliffhanger_ending' }
      ]
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
      choices: [
        { text: "Episode 2: The Governor arrives", target: 'governor_arrival' },
        { text: "Try to understand what happened to Ian", target: 'cliffhanger_ian_moment' }
      ]
    },
    interactions: {
      'ian': { type:'dialogue', text:"Ian's eyes glow with an otherworldly blue. He's connected to the dead now.", choices:[{ text:"What's happening to you?", target:'cliffhanger_ian_moment' }, { text:"Step back", target:null }] },
      'zombie3': { type:'dialogue', text:"The walker's eyes seem almost... aware.", choices:[{ text:"This isn't normal", target:'cliffhanger_ian_moment' }] }
    }
  },

  'cliffhanger_ian_moment': {
    background: assets.prison_interior,
    characters: [
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '40%', width: '11%', flipped: true },
      { id: 'john', asset: assets.john, bottom: '10%', left: '65%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "Ian: \"I can hear them. All of them. They're not mindless... they're trapped. Screaming.\"",
      choices: [
        { text: "Can you control them?", target: 'governor_arrival' },
        { text: "We need to get you somewhere safe", target: 'governor_arrival' }
      ]
    }
  },
};
