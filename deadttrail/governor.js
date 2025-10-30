import { assets } from './assets.js';

// Episode 2: "Prison Break (Down)" - Governor Arc
export default {
  'governor_arrival': {
    background: assets.prison_exterior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '25%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '45%', width: '14%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '70%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "The Governor's caravan approaches. Dust billows behind them. Rick steps forward to meet him.",
      choices: [{ text: "Stay alert", target: 'governor_meeting' }]
    }
  },

  'governor_meeting': {
    background: assets.prison_exterior,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '30%', width: '14%' },
      { id: 'tyler', asset: assets.tyler, bottom: '10%', left: '55%', width: '13%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Rick: \"We have a home and are building it.\" The Governor smiles darkly: \"A home is what you make it. This prison seems well equipped.\"",
      choices: [{ text: "This won't end well...", target: 'governor_inspection' }]
    }
  },

  'governor_inspection': {
    background: assets.prison_interior,
    characters: [
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '15%', width: '11%' },
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '35%', width: '11%' },
      { id: 'tyler', asset: assets.tyler, bottom: '10%', left: '65%', width: '13%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "The Governor's men inspect the prison. Dave whispers: \"I'm detecting heightened adrenaline... they're concealing something...\"",
      choices: [{ text: "Keep watching", target: 'governor_jamaal_scheme' }]
    },
    interactions: {
      'dave': { type:'dialogue', text:"Dave: They're hiding weapons. Or worse. The data doesn't lie.", choices:[{ text:"Stay calm.", target:null }] },
      'mac': { type:'dialogue', text:"Mac: I don't trust them. At all.", choices:[{ text:"Neither do I.", target:null }] }
    }
  },

  'governor_jamaal_scheme': {
    background: assets.prison_interior,
    characters: [
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '35%', width: '11%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Jamaal turns to John: \"This is what needs to happen if we'll ever get what we want. But I need your help.\"",
      choices: [
        { text: "What are you suggesting?", target: 'dave_strategic_plan' },
        { text: "I don't like where this is going.", target: 'dave_strategic_plan' }
      ]
    }
  },

  'dave_strategic_plan': {
    background: assets.prison_interior,
    characters: [
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '20%', width: '11%' },
      { id: 'maggie', asset: assets.maggie, bottom: '10%', left: '45%', width: '11%' }
    ],
    objects: [
      { id: 'concrete', asset: assets.self_healing_concrete, bottom: '15%', left: '70%', width: '12%' }
    ],
    onLoad: { type:'dialogue',
      text: "Dave: \"This is the only way that this works but they don't see it.\" Maggie: \"Maybe what we need is a new start.\"",
      choices: [{ text: "The best way to connect with people...", target: 'jason_appears' }]
    }
  },

  'jason_appears': {
    background: assets.prison_interior,
    characters: [
      { id: 'jason', asset: assets.jason, bottom: '10%', left: '30%', width: '11%' },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '60%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "Jason bursts in: \"Is anyone getting the most out of this lease? Why is it so darn hard!\" Dave: \"What a specimen.\"",
      choices: [{ text: "Who are you?", target: 'jason_introduction' }]
    },
    interactions: {
      'jason': { type:'dialogue', text:"Jason: Semi-professional Latin dancer, but most know me as the printer guy!", choices:[{ text:"Okay then...", target:null }] }
    }
  },

  'jason_introduction': {
    background: assets.prison_interior,
    characters: [
      { id: 'jason', asset: assets.jason, bottom: '10%', left: '40%', width: '11%' },
      { id: 'justin', asset: assets.justin, bottom: '10%', left: '65%', width: '11%' }
    ],
    objects: [
      { id: 'concrete', asset: assets.self_healing_concrete, bottom: '15%', left: '10%', width: '12%' }
    ],
    onLoad: { type:'dialogue',
      text: "Jason: \"Have you thought to use bioinspired concrete for the prison walls?\" Justin: \"That's exactly what I've been researching!\"",
      choices: [{ text: "This could help us survive.", target: 'ian_necromancy_growing' }]
    }
  },

  'ian_necromancy_growing': {
    background: assets.prison_interior,
    characters: [
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '40%', width: '11%' },
      { id: 'zombie3', asset: assets.zombie3, bottom: '10%', left: '70%', width: '14%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Ian approaches a walker: \"What makes you move? It's like you remember what you were but forgot everything...\" The walker stops mid-attack.",
      choices: [{ text: "Ian's controlling it?!", target: 'mac_carol_moment' }]
    }
  },

  'mac_carol_moment': {
    background: assets.prison_interior,
    characters: [
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '35%', width: '11%' },
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Mac to Carol: \"If there ever gets a point when they hurt you, let me know. I swear, I promise I will fix it.\"",
      choices: [{ text: "Something's changing in Mac...", target: 'ed_daryl_tension' }]
    }
  },

  'ed_daryl_tension': {
    background: assets.prison_interior,
    characters: [
      { id: 'ed', asset: assets.ed, bottom: '10%', left: '30%', width: '14%' },
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '65%', width: '14%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Ed: \"I got out of jury duty this week!\" Daryl: \"What are you even talking about?\" The tension is palpable.",
      choices: [{ text: "Ed needs to read the room...", target: 'john_despair' }]
    }
  },

  'john_despair': {
    background: assets.prison_interior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '45%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "FLASHBACK: HR calls John about Rob C.'s retirement. John slides down the wall. \"If everyone is dead, what does it matter?\"",
      choices: [{ text: "...", target: 'rick_intervention' }]
    }
  },

  'rick_intervention': {
    background: assets.prison_interior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '35%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '65%', width: '14%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Rick appears: \"We will not follow that path here!\" His conviction cuts through John's despair.",
      choices: [{ text: "Rick's right.", target: 'governor_assault' }]
    }
  },

  'governor_assault': {
    background: assets.prison_exterior,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '20%', width: '14%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '40%', width: '11%' },
      { id: 'tyler', asset: assets.tyler, bottom: '10%', left: '70%', width: '13%', flipped: true }
    ],
    objects: [
      { id: 'zombie_horde', asset: assets.zombie_horde, bottom: '5%', left: '85%', width: '12%' }
    ],
    onLoad: { type:'dialogue',
      text: "The Governor's voice pierces the chaos: \"It is over!\" An explosion rocks the prison. The groups scatter.",
      sfx: 'horde',
      choices: [{ text: "Run for the woods!", target: 'episode3_scattered' }]
    }
  },
};
