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
      choices: [
        { text: "Talk to Rick about the rules", target: 'prison_rick_rules' },
        { text: "Accept Carol's offer of food", target: 'prison_carol_food' },
        { text: "Search for your team", target: 'prison_yard_clash' }
      ]
    },
    interactions: {
      'rick':  { type:'dialogue', text:"Rick: You look like you've been through hell. We all have.", choices:[{ text:"What are the rules here?", target:'prison_rick_rules' }, { text:"We just need rest", target:null }] },
      'carol': { type:'dialogue', text:"Carol: You all look hungry. I can get you something.", choices:[{ text:"That would be wonderful", target:'prison_carol_food' }, { text:"We'll manage, thanks", target:null }] },
      'daryl': { type:'dialogue', text:"Daryl: (cleaning crossbow, not looking up)", choices:[{ text:"Best not to bother him", target:null }, { text:"Nice crossbow", target:'prison_daryl_talk' }] },
      'john':  { type:'dialogue', text:"John: We need to find the rest of our team.", choices:[{ text:"Let's look around", target:'prison_yard_clash' }, { text:"Give them space first", target:null }] },
      'jamaal': { type:'dialogue', text:"Jamaal: This place has good bones. Defensible.", choices:[{ text:"Always thinking business", target:null }] }
    }
  },

  'prison_carol_food': {
    background: assets.prison_interior,
    characters: [
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Carol brings you canned soup and water. \"It's not much, but it's safe. We test everything.\"",
      choices: [
        { text: "Thank you. This means a lot.", target: 'prison_yard_clash' },
        { text: "How long have you been here?", target: 'prison_carol_story' }
      ]
    }
  },

  'prison_carol_story': {
    background: assets.prison_interior,
    characters: [
      { id: 'carol', asset: assets.carol, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Carol: \"Since the beginning. Lost a lot of people. But we're still here. Still fighting.\"",
      choices: [
        { text: "We'll help however we can", target: 'prison_yard_clash' },
        { text: "That takes strength", target: 'prison_yard_clash' }
      ]
    }
  },

  'prison_daryl_talk': {
    background: assets.prison_interior,
    characters: [
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '40%', width: '14%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '65%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Daryl looks up briefly: \"It gets the job done. You know how to hunt?\"",
      choices: [
        { text: "Learning as I go", target: 'prison_yard_clash' },
        { text: "Not really my skillset", target: 'prison_yard_clash' }
      ]
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
      choices: [
        { text: "Understood. What do you need from us?", target: 'prison_yard_clash' },
        { text: "What are the specific rules?", target: 'prison_rick_detailed_rules' }
      ]
    },
    interactions: {
      'rick': { type:'dialogue', text:"Rick: We've survived this long by being careful. You'll do the same.", choices:[{ text:"Fair enough", target:'prison_yard_clash' }] },
      'john': { type:'dialogue', text:"John: We'll pull our weight. Promise.", choices:[{ text:"Let's find the team", target:'prison_yard_clash' }] }
    }
  },

  'prison_rick_detailed_rules': {
    background: assets.prison_interior,
    characters: [
      { id: 'rick', asset: assets.rick, bottom: '10%', left: '35%', width: '15%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Rick: \"No going outside alone. Share supplies. Protect each other. And if someone gets bit... you know what has to happen.\"",
      choices: [
        { text: "We can follow those rules", target: 'prison_yard_clash' },
        { text: "Harsh, but necessary", target: 'prison_yard_clash' }
      ]
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
      'john':  { type:'dialogue', text:"John: Let's not cause trouble. We should check the other cell block.", choices:[{ text:"You're right. Let's go.", target:'breakroom_discovery' }, { text:"Let's talk to everyone first", target:null }] },
      'dave':  { type:'dialogue', text:"Dave: They're hiding something. I can sense it.", choices:[{ text:"Stay cool, Dave", target:null }, { text:"What makes you say that?", target:'prison_dave_analysis' }] },
      'mac':   { type:'dialogue', text:"Mac: She's too soft for this world.", choices:[{ text:"She's a survivor, like us", target:null }, { text:"Everyone survives differently", target:'prison_mac_perspective' }] },
      'ed':    { type:'dialogue', text:"Ed: Shame all this food went to waste!", choices:[{ text:"Ed, maybe not now", target:null }, { text:"We'll find more", target:'prison_ed_optimism' }] },
      'daryl': { type:'dialogue', text:"Daryl: Watch your mouth, Hashbrown.", choices:[{ text:"Yikes", target:null }, { text:"Easy, we're all on the same side", target:'prison_daryl_tension' }] },
      'vending': { type:'dialogue', text:"An old vending machine. Still has snacks inside but it's stuck. You could try to force it open...", choices:[{ text:"Kick it!", target:'game_over_explosion' }, { text:"Leave it alone", target:null }, { text:"Try to open it carefully", target:'prison_vending_safe' }] }
    }
  },

  'prison_dave_analysis': {
    background: assets.prison_interior,
    characters: [
      { id: 'dave', asset: assets.dave, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Dave: \"Their body language. Defensive posturing. They're protecting something valuable. Or dangerous.\"",
      choices: [
        { text: "Keep your observations to yourself for now", target: 'prison_yard_clash' },
        { text: "We should investigate", target: 'breakroom_discovery' }
      ]
    }
  },

  'prison_mac_perspective': {
    background: assets.prison_interior,
    characters: [
      { id: 'mac', asset: assets.mac, bottom: '10%', left: '40%', width: '11%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Mac: \"You're right. I just... I worry about the vulnerable ones. Someone needs to protect them.\"",
      choices: [
        { text: "That's what makes you strong", target: 'prison_yard_clash' },
        { text: "We'll watch out for each other", target: 'breakroom_discovery' }
      ]
    }
  },

  'prison_ed_optimism': {
    background: assets.prison_interior,
    characters: [
      { id: 'ed', asset: assets.ed, bottom: '10%', left: '40%', width: '14%' },
      { id: 'john', asset: assets.john, bottom: '10%', left: '65%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Ed: \"That's the spirit! I know a great fishing spot about five miles north. Once things settle down...\"",
      choices: [
        { text: "Ed, focus on today", target: 'prison_yard_clash' },
        { text: "Tell me about it later", target: 'breakroom_discovery' }
      ]
    }
  },

  'prison_daryl_tension': {
    background: assets.prison_interior,
    characters: [
      { id: 'daryl', asset: assets.daryl, bottom: '10%', left: '40%', width: '14%' },
      { id: 'ed', asset: assets.ed, bottom: '10%', left: '70%', width: '14%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "Daryl glares but lowers his crossbow slightly. \"Your friend needs to learn when to shut up.\"",
      choices: [
        { text: "He's just trying to lighten the mood", target: 'prison_yard_clash' },
        { text: "I'll talk to him", target: 'breakroom_discovery' }
      ]
    }
  },

  'prison_vending_safe': {
    background: assets.prison_interior,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '40%', width: '11%' }
    ],
    objects: [
      { id: 'vending', asset: assets.vending_machine, bottom: '10%', left: '5%', width: '11%'}
    ],
    onLoad: { type:'dialogue',
      text: "You carefully work the vending machine's coin return and mechanism. A few chips and candy bars fall out. Small victory!",
      choices: [
        { text: "Share the snacks with the team", target: 'prison_yard_clash' },
        { text: "Pocket them and move on", target: 'breakroom_discovery' }
      ]
    }
  },
};
