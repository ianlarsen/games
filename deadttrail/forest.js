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
      choices: [{ text: "A prison?", target: 'prison_approach' }]
    },
    interactions: {}
  },

  'prison_approach': {
    background: assets.prison_exterior,
    characters: [
      { id:'john', asset:assets.john, bottom:'5%', left:'25%', width:'11%', flipped:true },
      { id:'jamaal', asset:assets.jamaal, bottom:'5%', left:'40%', width:'11%', flipped:true }
    ],
    onLoad: { type:'dialogue',
      text:'A voice shouts from a guard tower: "Hold it right there! State your business!"',
      choices: [{ text: "\"We're survivors. Looking for shelter.\"", target:'prison_standoff' }]
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
      choices: [{ text: "Enter the prison.", target:'prison_interior_welcome' }]
    }
  },
};
