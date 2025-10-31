import { assets } from './assets.js';

export default {
  'game_over_fight': {
    background: assets.abandoned_office,
    characters: [],
    objects: [],
    onLoad: { type:'dialogue', text:"You tried to fight a zombie bare-handed. It did not go well.", choices:[{ text:"Start Over", target:'office_start' }] }
  },
  'game_over_explosion': {
    background: assets.prison_interior,
    characters: [],
    objects: [],
    onLoad: {
      type:'dialogue',
      text:"You kicked the vending machine in frustration. It toppled over and exploded in a massive fireball, taking out the entire prison and everyone in it. Maybe don't kick mysterious vending machines during the apocalypse.",
      sfx: 'dead',
      choices:[{ text:"Start Over", target:'office_start' }]
    }
  },
};
