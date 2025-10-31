import { assets } from './assets.js';

export default {
  'forest_escape': {
    background: assets.woods,
    characters: [
      { id: 'john', asset: assets.john, bottom: '15%', left: '40%', width: '11%', flipped: true },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "You squeeze through a tunnel and stumble into a dense forest. A high chain-link fence looms ahead...",
      choices: [
        { text: "Head toward the fence", target: 'prison_approach' },
        { text: "Search the woods first", target: 'forest_exploration' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: We made it out. But we're not safe yet.", choices:[{ text:"What's that fence?", target:'prison_approach' }, { text:"Let's explore", target:'forest_exploration' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: I hear voices from that direction. Could be other survivors.", choices:[{ text:"Let's check it out", target:'prison_approach' }, { text:"Could be dangerous", target:'forest_exploration' }] }
    }
  },

  'forest_exploration': {
    background: assets.woods,
    characters: [
      { id: 'john', asset: assets.john, bottom: '15%', left: '40%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "You search the forest. Rustling in the bushes makes you freeze. Just a deer... for now.",
      choices: [
        { text: "Head to that prison fence", target: 'prison_approach' },
        { text: "Keep searching the woods", target: 'forest_dead_end' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: We can't stay in the woods forever. We need shelter.", choices:[{ text:"You're right", target:'prison_approach' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: That prison might have supplies. And people.", choices:[{ text:"Let's go", target:'prison_approach' }] }
    }
  },

  'forest_dead_end': {
    background: assets.woods,
    characters: [
      { id: 'john', asset: assets.john, bottom: '15%', left: '40%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%' }
    ],
    onLoad: { type:'dialogue',
      text: "The forest gets denser. You hear groans in the distance. This way leads nowhere good.",
      choices: [
        { text: "Go back to the fence", target: 'prison_approach' },
        { text: "Keep going deeper anyway", target: 'game_over_forest' }
      ]
    }
  },

  'game_over_forest': {
    background: assets.woods,
    characters: [],
    objects: [],
    onLoad: { type:'dialogue',
      text: "You venture deeper into the woods. Dozens of walkers emerge from the shadows. There's no escape.",
      sfx: 'horde',
      choices:[{ text:"Start Over", target:'office_start' }]
    }
  },

  'prison_approach': {
    background: assets.prison_exterior,
    characters: [
      { id:'john', asset:assets.john, bottom:'5%', left:'25%', width:'11%', flipped:true },
      { id:'jamaal', asset:assets.jamaal, bottom:'5%', left:'40%', width:'11%', flipped:true }
    ],
    onLoad: { type:'dialogue',
      text:'A voice shouts from a guard tower: "Hold it right there! State your business!"',
      choices: [
        { text: "\"We're survivors. Looking for shelter.\"", target:'prison_standoff' },
        { text: "\"We mean no harm. Please help us.\"", target:'prison_standoff_alternate' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John raises his hands: \"We're not armed. Just looking for safety.\"", choices:[{ text:"Let John talk", target:'prison_standoff' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: \"We have skills! We can contribute!\"", choices:[{ text:"Good thinking", target:'prison_standoff_alternate' }] }
    }
  },

  'prison_standoff': {
    background: assets.prison_exterior,
    characters: [
      { id:'john', asset:assets.john, bottom:'5%', left:'45%', width:'11%', flipped:true },
      { id:'jamaal', asset:assets.jamaal, bottom:'5%', left:'60%', width:'11%', flipped:true }
    ],
    onLoad: { type:'dialogue',
      text: "Another voice scoffs: \"Peace? Ain't seen much of that lately.\" After a tense moment: \"Alright. Come in. Slow and steady.\"",
      choices: [
        { text: "Enter the prison.", target:'prison_interior_welcome' },
        { text: "Ask about their situation first", target:'prison_standoff_questions' }
      ]
    },
    interactions: {
      'john': { type:'dialogue', text:"John: We should be cautious. But we need shelter.", choices:[{ text:"Go inside", target:'prison_interior_welcome' }, { text:"Ask questions", target:'prison_standoff_questions' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: They seem suspicious. But who isn't these days?", choices:[{ text:"Fair point", target:null }] }
    }
  },

  'prison_standoff_alternate': {
    background: assets.prison_exterior,
    characters: [
      { id:'john', asset:assets.john, bottom:'5%', left:'45%', width:'11%', flipped:true },
      { id:'jamaal', asset:assets.jamaal, bottom:'5%', left:'60%', width:'11%', flipped:true }
    ],
    onLoad: { type:'dialogue',
      text: "The voice softens slightly: \"Skills, huh? We could use help. But one wrong move and you're out.\"",
      choices: [
        { text: "\"Understood. We're grateful.\"", target:'prison_interior_welcome' },
        { text: "\"What kind of help do you need?\"", target:'prison_standoff_questions' }
      ]
    }
  },

  'prison_standoff_questions': {
    background: assets.prison_exterior,
    characters: [
      { id:'john', asset:assets.john, bottom:'5%', left:'45%', width:'11%', flipped:true },
      { id:'jamaal', asset:assets.jamaal, bottom:'5%', left:'60%', width:'11%', flipped:true }
    ],
    onLoad: { type:'dialogue',
      text: "\"We're managing. Walkers mostly stay outside. But supplies are tight and tensions are high. You coming in or not?\"",
      choices: [
        { text: "\"Yes, we're coming in.\"", target:'prison_interior_welcome' },
        { text: "\"Actually, we'll keep moving.\"", target:'forest_dead_end' }
      ]
    }
  },
};
