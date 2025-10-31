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
      choices: [
        { text: "We need to regroup!", target: 'john_jamaal_reconciliation' },
        { text: "Find the others first", target: 'episode3_search_party' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: Everyone stay calm. We'll find the others.", choices:[{ text:"Let's search", target:'episode3_search_party' }, { text:"Regroup here", target:'john_jamaal_reconciliation' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: We need a plan. Fast.", choices:[{ text:"Agreed", target:'john_jamaal_reconciliation' }] },
      'ed': { type:'dialogue', text:"Ed: At least we're still alive!", choices:[{ text:"Stay positive", target:null }] }
    }
  },

  'episode3_search_party': {
    background: assets.woods,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '40%', width: '11%' },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '60%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "You find Dave analyzing tracks. \"They went this way. Most of them anyway.\"",
      choices: [
        { text: "Lead the way", target: 'john_jamaal_reconciliation' },
        { text: "Check for stragglers", target: 'john_jamaal_reconciliation' }
      ]
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
      choices: [
        { text: "Brotherhood forged", target: 'dave_unity_analysis' },
        { text: "Let's find the others", target: 'dave_unity_analysis' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: I should have listened to you more.", choices:[{ text:"We're in this together", target:'dave_unity_analysis' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: No more ego. Just survival.", choices:[{ text:"Exactly", target:null }] }
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
      choices: [
        { text: "The data supports working together", target: 'mac_finds_purpose' },
        { text: "What's the plan?", target: 'mac_finds_purpose' }
      ]
    },
    interactions: {
      'dave': { type:'dialogue', text:"Dave: The probability of success increases exponentially with cooperation.", choices:[{ text:"Makes sense", target:null }] },
      'rick': { type:'dialogue', text:"Rick: We've all lost too much. Time to rebuild together.", choices:[{ text:"Agreed", target:'mac_finds_purpose' }] }
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
      choices: [
        { text: "We're stronger together", target: 'ian_full_power' },
        { text: "Check on Ian", target: 'ian_full_power' }
      ]
    },
    interactions: {
      'mac': { type:'dialogue', text:"Mac: I won't let anyone hurt them. Ever.", choices:[{ text:"That's the spirit", target:null }] },
      'carol': { type:'dialogue', text:"Carol: Thank you. We need people like you.", choices:[{ text:"We need each other", target:null }] },
      'maggie': { type:'dialogue', text:"Maggie: The kids need role models.", choices:[{ text:"You're right", target:null }] }
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
      choices: [
        { text: "This changes everything!", target: 'final_showdown_prep' },
        { text: "Can we trust this power?", target: 'ian_power_discussion' }
      ]
    },
    interactions: {
      'ian': { type:'dialogue', text:"Ian: I can feel them. They're not evil. Just... lost.", choices:[{ text:"Use this power wisely", target:'final_showdown_prep' }] },
      'zombie4': { type:'dialogue', text:"The walker stands perfectly still, awaiting commands.", choices:[{ text:"Incredible", target:null }] },
      'zombie5': { type:'dialogue', text:"Another controlled walker. Eyes vacant but obedient.", choices:[{ text:"This is our weapon", target:null }] },
      'zombie6': { type:'dialogue', text:"The third walker turns its head toward Ian.", choices:[{ text:"Amazing control", target:null }] }
    }
  },

  'ian_power_discussion': {
    background: assets.woods,
    characters: [
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "John: \"This power could save us or destroy us.\" Ian: \"I know. But I choose to use it for good.\"",
      choices: [
        { text: "I trust you", target: 'final_showdown_prep' },
        { text: "We'll watch over you", target: 'final_showdown_prep' }
      ]
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
      choices: [
        { text: "Let's end this!", target: 'final_showdown' },
        { text: "One last plan check", target: 'final_battle_strategy' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: This is it. Everything we've fought for.", choices:[{ text:"Let's do this", target:'final_showdown' }] },
      'rick': { type:'dialogue', text:"Rick: Together, we're unstoppable.", choices:[{ text:"Damn right", target:'final_showdown' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: After this, we rebuild. Better than before.", choices:[{ text:"I like it", target:null }] },
      'dave': { type:'dialogue', text:"Dave: The tactical advantage is ours.", choices:[{ text:"Good to hear", target:null }] },
      'mac': { type:'dialogue', text:"Mac: For everyone we've lost.", choices:[{ text:"For them", target:null }] }
    }
  },

  'final_battle_strategy': {
    background: assets.camp,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '30%', width: '14%' },
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '55%', width: '11%' },
      { id: 'ian', asset: assets.ian, bottom: '10%', left: '75%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "Rick outlines the plan. Dave calculates probabilities. Ian prepares his powers. Everything is ready.",
      choices: [
        { text: "Execute the plan", target: 'final_showdown' }
      ]
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
      choices: [
        { text: "Fight together!", target: 'ian_zombie_army' },
        { text: "Charge!", target: 'final_showdown_charge' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: For survival! For family!", choices:[{ text:"Charge!", target:'final_showdown_charge' }] },
      'rick': { type:'dialogue', text:"Rick: This ends now!", choices:[{ text:"Together!", target:'ian_zombie_army' }] },
      'daryl': { type:'dialogue', text:"Daryl readies his crossbow.", choices:[{ text:"Let's go!", target:null }] },
      'tyler': { type:'dialogue', text:"The Governor: \"You'll all die here!\"", choices:[{ text:"Not today!", target:'ian_zombie_army' }] },
      'spear': { type:'dialogue', text:"A makeshift spear weapon.", choices:[{ text:"Arm up", target:null }] }
    }
  },

  'final_showdown_charge': {
    background: assets.prison_exterior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '25%', width: '11%' },
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '45%', width: '14%' },
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '65%', width: '14%' }
    ],
    onLoad: { type:'dialogue',
      text: "You charge forward with fierce determination! The Governor's men fall back, unprepared for your unified assault!",
      sfx: 'horde',
      choices: [
        { text: "Press the advantage!", target: 'ian_zombie_army' }
      ]
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
      choices: [
        { text: "We're winning!", target: 'governor_defeated' },
        { text: "Push forward!", target: 'governor_defeated' }
      ]
    },
    interactions: {
      'ian': { type:'dialogue', text:"Ian: I can hold them! Keep pushing!", choices:[{ text:"You're amazing!", target:'governor_defeated' }] },
      'zombie1': { type:'dialogue', text:"The controlled walker attacks the Governor's men.", choices:[{ text:"Good!", target:null }] },
      'zombie2': { type:'dialogue', text:"Another walker follows Ian's commands perfectly.", choices:[{ text:"Incredible", target:null }] },
      'zombie_no_arm': { type:'dialogue', text:"Even damaged, it obeys Ian.", choices:[{ text:"Unstoppable", target:null }] }
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
      choices: [
        { text: "What now?", target: 'lattice_core_unity' },
        { text: "We rebuild", target: 'lattice_core_unity' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: We did it. Together.", choices:[{ text:"Celebrate", target:'lattice_core_unity' }] },
      'rick': { type:'dialogue', text:"Rick: This is just the beginning.", choices:[{ text:"A better beginning", target:'lattice_core_unity' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: Time to build that franchise.", choices:[{ text:"Ha! Maybe", target:null }] }
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
      choices: [
        { text: "We find a new home, together", target: 'jean_appears' },
        { text: "The future is bright", target: 'final_resolution' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: I never thought we'd make it this far.", choices:[{ text:"But we did", target:'final_resolution' }] },
      'rick': { type:'dialogue', text:"Rick: This is what humanity can be.", choices:[{ text:"Unity", target:null }] },
      'jamaal': { type:'dialogue', text:"Jamaal: We're not just survivors. We're builders.", choices:[{ text:"Yes", target:null }] },
      'dave': { type:'dialogue', text:"Dave: The data was right. Cooperation wins.", choices:[{ text:"Always", target:null }] },
      'mac': { type:'dialogue', text:"Mac: I found my purpose.", choices:[{ text:"We all did", target:null }] },
      'ian': { type:'dialogue', text:"Ian: The dead can finally rest.", choices:[{ text:"Peace", target:null }] }
    }
  },

  'jean_appears': {
    background: assets.cosmic_sky,
    characters: [
      { id: 'jean', asset: assets.jean, bottom: '40%', left: '45%', width: '14%' }
    ],
    onLoad: { type:'dialogue',
      text: "Jean appears high in the sky, watching over them. A silent observer. A god-like presence in the clouds.",
      choices: [
        { text: "The journey continues...", target: 'final_resolution' },
        { text: "Who... what is that?", target: 'jean_mystery' }
      ]
    },
    interactions: {
      'jean': { type:'dialogue', text:"Jean's gaze is knowing. Timeless. She smiles faintly.", choices:[{ text:"Thank you", target:'final_resolution' }] }
    }
  },

  'jean_mystery': {
    background: assets.cosmic_sky,
    characters: [
      { id: 'jean', asset: assets.jean, bottom: '40%', left: '45%', width: '14%' }
    ],
    onLoad: { type:'dialogue',
      text: "Jean's presence fills you with warmth. You understand: she's been watching all along. Guiding. Protecting. A guardian in the apocalypse.",
      choices: [
        { text: "Continue the journey", target: 'final_resolution' }
      ]
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
      choices: [
        { text: "THE END", target: 'office_start' },
        { text: "Savor this moment", target: 'final_epilogue' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: To new beginnings.", choices:[{ text:"Cheers", target:null }] },
      'rick': { type:'dialogue', text:"Rick: To family.", choices:[{ text:"To family", target:null }] },
      'jamaal': { type:'dialogue', text:"Jamaal: To survival and success.", choices:[{ text:"Here here", target:null }] },
      'carol': { type:'dialogue', text:"Carol: To hope.", choices:[{ text:"To hope", target:null }] },
      'final_meal': { type:'dialogue', text:"A humble meal, but it's the best you've had in years.", choices:[{ text:"Enjoy it", target:null }] }
    }
  },

  'final_epilogue': {
    background: assets.camp,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '45%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "John looks at his new family. The journey was hard, but worth it. Together, they'll build something better. The dead trail has led to new life.",
      choices: [
        { text: "THE END - Start Again", target: 'office_start' }
      ]
    }
  },
};
