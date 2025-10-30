import { assets } from './assets.js';

// Episode 3: "Lattice-Core Hope" - The Finale
export default {
  'episode3_scattered': {
    background: assets.woods,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '30%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '50%', width: '11%' },
      { id: 'ed', asset: assets.ed, bottom: '10%', left: '70%', width: '13%' }
    ],
    onLoad: { type:'dialogue',
      text: "The group scatters into the woods, fighting for survival. Ed: \"I somehow lost all my fishing gear!\"",
      choices: [{ text: "We need to regroup!", target: 'john_jamaal_reconciliation' }]
    }
  },

  'john_jamaal_reconciliation': {
    background: assets.woods,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '35%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "John and Jamaal have a heart-to-heart. John: \"We need to work together to survive.\" Jamaal: \"You're right. I'm with you.\"",
      choices: [{ text: "Brotherhood forged.", target: 'dave_unity_analysis' }]
    }
  },

  'dave_unity_analysis': {
    background: assets.woods,
    characters: [
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '40%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '65%', width: '14%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Dave: \"Using Orthogonal Random Beamforming, I've analyzed the team dynamics. Unity is our only path to survival.\"",
      choices: [{ text: "The data supports working together.", target: 'mac_finds_purpose' }]
    }
  },

  'mac_finds_purpose': {
    background: assets.camp,
    characters: [
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '30%', width: '11%' },
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '55%', width: '11%' },
      { id: 'maggie', asset: assets.maggie, bottom: '10%', left: '75%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "Mac finds renewed purpose protecting the younger members of Rick's group. She's found her cause.",
      choices: [{ text: "We're stronger together.", target: 'ian_full_power' }]
    }
  },

  'ian_full_power': {
    background: assets.woods,
    characters: [
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '40%', width: '11%' },
      { id: 'zombie4', asset: assets.zombie4, bottom: '10%', left: '15%', width: '13%' },
      { id: 'zombie5', asset: assets.zombie5, bottom: '10%', left: '65%', width: '13%' },
      { id: 'zombie6', asset: assets.zombie6, bottom: '10%', left: '85%', width: '13%' }
    ],
    onLoad: { type:'dialogue',
      text: "Ian masters his necromantic abilities. He raises an army of walkers, but shows he can control them for good!",
      choices: [{ text: "This changes everything!", target: 'final_showdown_prep' }]
    }
  },

  'final_showdown_prep': {
    background: assets.camp,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '15%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '30%', width: '14%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '50%', width: '11%' },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '65%', width: '11%' },
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '80%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "The two groups band together. John: \"We face the Governor as one unified team.\" Rick nods in agreement.",
      choices: [{ text: "Let's end this!", target: 'final_showdown' }]
    }
  },

  'final_showdown': {
    background: assets.prison_exterior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '10%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '25%', width: '14%' },
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '42%', width: '14%' },
      { id: 'tyler', asset: assets.tyler, bottom: '10%', left: '70%', width: '13%', flipped: true }
    ],
    objects: [
      { id: 'spear', asset: assets.spear, bottom: '30%', left: '85%', width: '8%' }
    ],
    onLoad: { type:'dialogue',
      text: "The final confrontation! The two groups face the Governor's forces with their combined strength!",
      sfx: 'horde',
      choices: [{ text: "Fight together!", target: 'ian_zombie_army' }]
    }
  },

  'ian_zombie_army': {
    background: assets.prison_exterior,
    characters: [
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '40%', width: '11%' },
      { id: 'zombie1', asset: assets.zombie1, bottom: '10%', left: '15%', width: '13%', flipped: true },
      { id: 'zombie2', asset: assets.zombie2, bottom: '10%', left: '65%', width: '13%', flipped: true },
      { id: 'zombie_no_arm', asset: assets.zombie_no_arm, bottom: '10%', left: '85%', width: '13%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Ian's zombie army turns the tide! The Governor's forces are overwhelmed by the controlled walkers!",
      sfx: 'horde',
      choices: [{ text: "We're winning!", target: 'governor_defeated' }]
    }
  },

  'governor_defeated': {
    background: assets.prison_exterior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '25%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '45%', width: '14%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '65%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "The Governor is defeated! The two groups have won through teamwork, trust, and unity.",
      choices: [{ text: "What now?", target: 'lattice_core_unity' }]
    }
  },

  'lattice_core_unity': {
    background: assets.camp,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '15%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '30%', width: '14%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '45%', width: '11%' },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '58%', width: '11%' },
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '71%', width: '11%' },
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '84%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "Dave: \"By the end, all teams have become like 'Lattice-Core Beam' - interconnected, stronger together.\"",
      choices: [{ text: "We find a new home, together.", target: 'jean_appears' }]
    }
  },

  'jean_appears': {
    background: assets.cosmic_sky,
    characters: [
      { id: 'jean', asset: assets.jean, bottom: '40%', left: '45%', width: '14%' }
    ],
    onLoad: { type:'dialogue',
      text: "Jean appears high in the sky, watching over them. A silent observer. A god-like presence in the clouds.",
      choices: [{ text: "The journey continues...", target: 'final_resolution' }]
    }
  },

  'final_resolution': {
    background: assets.camp,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '20%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '38%', width: '14%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '55%', width: '11%' },
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '70%', width: '11%' }
    ],
    objects: [
      { id: 'final_meal', asset: assets.final_meal, bottom: '35%', left: '40%', width: '20%' }
    ],
    onLoad: { type:'dialogue',
      text: "The groups share a meal. They've learned about trust, cooperation, and community. Together, they'll find a new home.",
      choices: [{ text: "THE END", target: 'office_start' }]
    }
  },
};
