import { assets } from './assets.js';

export default {
  'game_over_fight': {
    background: assets.abandoned_office,
    characters: [],
    objects: [],
    onLoad: { type:'dialogue', text:"You tried to fight a zombie bare-handed. It did not go well.", choices:[{ text:"Start Over", target:'office_start' }] }
  },
};
