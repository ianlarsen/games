import { assets } from './assets.js';

export default {
  // START
  'office_start': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '40%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%' }
    ],
    objects: [
      { id: 'filing_cabinet', asset: assets.filing_cabinet, bottom: '10%', left: '10%', width: '18%' },
      { id: 'microwave_obj',  asset: assets.microwave,      bottom: '40%', left: '80%', width: '12%' }
    ],
    onLoad: {
      type: 'dialogue',
      text: "John and his team scavenge in a deserted office building. Fluorescent lights flicker. The air reeks of decay.",
      choices: [
        { text: "Search the microwave",          target: 'office_microwave_investigate', sfx: 'ding' },
        { text: "Talk to Jamaal about supplies", target: 'office_talk_jamaal_airz' },
        { text: "Search the filing cabinet",     target: 'office_filing_cabinet_note' },
        { text: "Check the basement stairs",     target: 'office_corner_office_entry' }
      ]
    },
    interactions: {
      'john':   { type:'dialogue', text:"John: Stay sharp. Check everything—but don't be a hero.", choices:[{ text:"Got it.", target:null }] },
      'jamaal': { type:'dialogue', text:"Jamaal: This place gives me the creeps. But... there's opportunity here.", choices:[{ text:"Focus on survival first.", target:null }] },
      'microwave_obj': { type:'dialogue', text:"The microwave. That smell... it's familiar. And rancid.", choices:[
        { text:"Investigate it", target:'office_microwave_investigate', sfx: 'ding' },
        { text:"Better not", target:null }
      ]},
      'filing_cabinet': { type:'dialogue', text:"An old filing cabinet. Papers rustling inside?", choices:[
        { text:"Open it", target:'office_filing_cabinet_note' },
        { text:"Leave it", target:null }
      ] }
    }
  },

  'office_microwave_investigate': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '40%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%' }
    ],
    objects: [
      { id: 'microwave_obj',  asset: assets.microwave,      bottom: '40%', left: '80%', width: '12%' }
    ],
    onLoad: {
      type: 'dialogue',
      text: "As you approach the microwave, the smell hits you like a wave. Something moves inside...",
      choices: [
        { text: "Open it slowly", target: 'office_microwave_flashback' },
        { text: "Step back", target: 'office_start' }
      ]
    }
  },

  'office_microwave_flashback': {
    background: assets.breakroom_bg,
    characters: [
      { id: 'rob',  asset: assets.handsome_rob, bottom: '10%', left: '30%', width: '11%' },
      { id: 'mac',  asset: assets.mac, bottom: '10%', left: '60%', width: '11%' }
    ],
    objects: [
      { id: 'microwave_obj',  asset: assets.microwave,  bottom: '40%', left: '75%', width: '12%' },
      { id: 'fish_tank',      asset: assets.fish_tank,  bottom: '30%', left: '5%', width: '15%' }
    ],
    onLoad: {
      type: 'dialogue',
      text: "FLASHBACK: The office breakroom, before the apocalypse. Rob C. is microwaving fish. The smell is rancid.",
      choices: [
        { text: "Continue...", target: 'office_microwave_flashback_2' }
      ]
    },
    interactions: {
      'rob': { type:'dialogue', text:"Rob: \"Just my weekend catch! Fresh from the lake.\"", choices:[{ text:"...", target:null }] },
      'mac': { type:'dialogue', text:"Mac: \"Rob, that smell is awful!\"", choices:[{ text:"...", target:null }] }
    }
  },

  'office_microwave_flashback_2': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '35%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '55%', width: '11%' }
    ],
    objects: [
      { id: 'microwave_obj',  asset: assets.microwave,      bottom: '40%', left: '80%', width: '12%' }
    ],
    onLoad: {
      type: 'dialogue',
      text: "You snap back to reality. Mac's voice echoes: \"Yeah it is, at least that's just fish!\" The memory fades.",
      choices: [
        { text: "Open the microwave", target: 'office_microwave_open' },
        { text: "Walk away", target: 'office_start' }
      ]
    }
  },

  // MICROWAVE
  'office_microwave_open': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '45%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '65%', width: '11%' }
    ],
    objects: [
      { id: 'microwave_obj',  asset: assets.microwave,      bottom: '40%', left: '80%', width: '12%' },
      { id: 'filing_cabinet', asset: assets.filing_cabinet, bottom: '10%', left: '10%', width: '18%' }
    ],
    onLoad: {
      type: 'dialogue',
      text: "You crack the door. Inside: a fossilized burrito… and something that moves.",
      sfx: 'ding',
      choices: [
        { text: "Lean in and open it wide", target: 'zombie_surprise' },
        { text: "Throw the Roomba at it",   target: 'game_over_roomba', sfx:'roomba' },
        { text: "“Uh… help?”",             target: 'office_microwave_call_help' },
        { text: "Nope. Back away",         target: 'office_start' }
      ]
    },
    interactions: {
      'microwave_obj': { type:'dialogue', text:"Something thumps back. That’s… not how microwaves work.", choices:[
        { text:"Open wider",        target:'zombie_surprise' },
        { text:"Pitch the Roomba",  target:'game_over_roomba', sfx:'roomba' },
        { text:"Whisper for help",  target:'office_microwave_call_help' },
        { text:"Step away",         target:'office_start' }
      ]},
      'filing_cabinet': { type:'dialogue', text:"Now is a terrible time to file taxes.", choices:[{ text:"You’re right.", target:'office_start' }] }
    }
  },

  'game_over_roomba': {
    background: assets.abandoned_office,
    onLoad: { type: 'dialogue',
      text: "You yeet the Roomba. It ricochets off everything and your face. Fade to vacuum hum.",
      choices: [ { text: "Start Over", target: 'office_start' } ] },
    characters: [], objects: [], interactions: {}
  },

  'office_microwave_call_help': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '45%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '65%', width: '11%' },
      { id: 'jean',   asset: assets.jean,   bottom: '40%', left: '80%', width: '12%', flipped: true }
    ],
    onLoad: { type:'dialogue',
      text: "A woman’s eyes reflect in the glass. A faint ding echoes.",
      sfx: 'ding',
      choices: [
        { text:"Shake it off", target:'office_start' },
        { text:"Stare longer", target:'office_listen_whispers' }
      ]},
    interactions: {
      'jean': { type:'dialogue', text:"Jean’s reflection whispers: “Later.”", choices:[{ text:"Back away", target:'office_start' }] }
    }
  },

  'office_talk_jamaal_airz': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '45%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '65%', width: '11%' }
    ],
    objects: [
      { id: 'microwave_obj',  asset: assets.microwave,      bottom: '40%', left: '80%', width: '12%' },
      { id: 'filing_cabinet', asset: assets.filing_cabinet, bottom: '10%', left: '10%', width: '18%' }
    ],
    onLoad: {
      type:'dialogue',
      text: "Jamaal: \"AirZ. Zombie co-working. Premium tier: the corner without moans.\"",
      choices: [
        { text:"Please focus", target:'office_start' },
        { text:"…Amenities?",  target:'office_jamaal_amenities' }
      ]
    },
    interactions: {
      'jamaal': { type:'dialogue', text:"Hot desk, cold fear, hazardous microwave.", choices:[{ text:"Back to work", target:'office_start' }] },
      'john':   { type:'dialogue', text:"Pitch it after we're not on the menu.", choices:[{ text:"Yeah, okay", target:'office_start' }] },
      'microwave_obj': { type:'dialogue', text:"It hums like it remembers lunch.", choices:[
        { text:"Open it", target:'office_microwave_open', sfx: 'ding' },
        { text:"Leave it", target:'office_start' }
      ]},
      'filing_cabinet': { type:'dialogue', text:"Dust motes swirl.", choices:[
        { text:"Open it", target:'office_filing_cabinet_note' },
        { text:"Leave it", target:'office_start' }
      ]}
    }
  },

  'office_jamaal_amenities': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '35%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '60%', width: '11%', flipped: true }
    ],
    onLoad: {
      type:'dialogue',
      text: "Jamaal: \"Free coffee—if you can find it. Hot desk, cold fear, complimentary hazardous microwave.\"",
      choices: [
        { text:"You're impossible.", target:'office_start' },
        { text:"Maybe after we survive...", target:'office_start' }
      ]
    }
  },

  'office_filing_cabinet_note': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john',   asset: assets.john,   bottom: '10%', left: '45%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '65%', width: '11%' }
    ],
    objects: [ { id: 'filing_cabinet', asset: assets.filing_cabinet, bottom: '10%', left: '10%', width: '18%' } ],
    onLoad: {
      type:'dialogue',
      text: "A sticky note: *‘Jean sees you.’* Somewhere a microwave dings.",
      sfx: 'ding',
      choices: [
        { text:"Glance around nervously", target:'office_listen_whispers' },
        { text:"Crumple it and move on",  target:'office_start' }
      ]
    },
    interactions: {
      'filing_cabinet': { type:'dialogue', text:"The drawer echoes with distant laughter.", choices:[{ text:"Pretend you didn’t hear it", target:'office_start' }] },
      'jamaal': { type:'dialogue', text:"Jamaal: \"Is that a TikTok filter?\"", choices:[{ text:"Not now", target:'office_start' }] }
    }
  },

  'office_corner_office_entry': {
    background: assets.abandoned_office,
    characters: [
      { id:'john', asset:assets.john, bottom:'10%', left:'45%', width:'11%' },
      { id:'jamaal', asset:assets.jamaal, bottom:'10%', left:'65%', width:'11%' }
    ],
    onLoad: {
      type:'dialogue',
      text: "A narrow stairwell vanishes into dark. It smells like antiseptic and regret.",
      choices: [
        { text:"Descend the stairs", target:'hospital_basement' },
        { text:"Nope. Back to scavenging", target:'office_start' }
      ]
    },
    interactions: {
      'john':   { type:'dialogue', text:"Maybe there’s a med kit—or worse.", choices:[{ text:"Keep going", target:'hospital_basement' }, { text:"Turn back", target:'office_start' }] },
      'jamaal': { type:'dialogue', text:"Boutique clinic—cash only.", choices:[{ text:"Focus", target:'hospital_basement' }] }
    }
  },

  'hospital_basement': {
    background: assets.hospital,
    characters: [
      { id:'john', asset:assets.john, bottom:'10%', left:'45%', width:'11%' },
      { id:'jamaal', asset:assets.jamaal, bottom:'10%', left:'65%', width:'11%' }
    ],
    onLoad: {
      type:'dialogue',
      text: "Rust stains crawl up the walls. Something metallic drags across the floor.",
      choices: [
        { text:"Search the morgue drawers", target:'game_over_morgue' },
        { text:"Check the nurse’s desk",    target:'hospital_desk_badge' },
        { text:"Climb to the roof",         target:'hospital_roof' },
        { text:"Retreat to the office",     target:'office_start' }
      ]
    }
  },

  'game_over_morgue': {
    background: assets.hospital,
    characters: [], objects: [],
    onLoad: { type:'dialogue', text:"The tag reads *John Doe*. The body jerks and grabs your ankle. Darkness.", choices:[{ text:"Start Over", target:'office_start' }] }
  },

  'hospital_desk_badge': {
    background: assets.hospital,
    characters: [
      { id:'john', asset:assets.john, bottom:'10%', left:'45%', width:'11%' },
      { id:'jamaal', asset:assets.jamaal, bottom:'10%', left:'65%', width:'11%' }
    ],
    onLoad: { type:'dialogue',
      text: "You find an ID badge — *Dr. Rob C.* On the back: *Tunnel = Out*.",
      choices: [
        { text:"Follow the airflow through the tunnel", target:'hospital_tunnel_exit' },
        { text:"Pocket it and head upstairs", target:'hospital_roof' },
        { text:"Too creepy—go back", target:'office_start' }
      ]
    },
    interactions: {
      'jamaal': { type:'dialogue', text:"Dedicated… or in denial.", choices:[{ text:"Keep moving", target:'hospital_tunnel_exit' }] }
    }
  },

  'hospital_tunnel_exit': {
    background: assets.hospital,
    characters: [
      { id:'john', asset:assets.john, bottom:'10%', left:'45%', width:'11%' },
      { id:'jamaal', asset:assets.jamaal, bottom:'10%', left:'65%', width:'11%' }
    ],
    onLoad: { type:'dialogue',
      text:"A narrow service tunnel opens toward daylight and pine air.",
      choices: [
        { text:"Keep moving toward the trees", target:'forest_escape' },
        { text:"Look back one last time",      target:'hospital_basement' }
      ]
    }
  },

  'hospital_roof': {
    background: assets.hospital,
    characters: [
      { id:'john', asset:assets.john, bottom:'10%', left:'45%', width:'11%' },
      { id:'jamaal', asset:assets.jamaal, bottom:'10%', left:'65%', width:'11%' }
    ],
    onLoad: { type:'dialogue',
      text:"From the roof, the forest stretches like a dark ocean. A fence glints in the light.",
      choices: [
        { text:"Head toward the tree line", target:'forest_escape' },
        { text:"Second thoughts—go back",   target:'hospital_basement' }
      ]
    }
  },

  'office_listen_whispers': {
    background: assets.abandoned_office,
    characters: [
      { id:'john', asset:assets.john, bottom:'10%', left:'45%', width:'11%' },
      { id:'jamaal', asset:assets.jamaal, bottom:'10%', left:'65%', width:'11%' }
    ],
    onLoad: { type:'dialogue',
      text:"A soft voice rides the fluorescents: “You were never alone.”",
      sfx: 'ding',
      choices: [
        { text:"Shake it off",                 target:'office_start' },
        { text:"Follow the sound to microwave", target:'office_microwave_open' }
      ]
    }
  },

  // Microwave → Zombie
  'zombie_surprise': {
    background: assets.abandoned_office,
    characters: [
      { id: 'john', asset: assets.john, bottom: '10%', left: '30%', width: '11%' },
      { id: 'jamaal', asset: assets.jamaal, bottom: '10%', left: '55%', width: '11%' },
      { id: 'zombie_rob', asset: assets.zombie_rob, bottom: '10%', left: '75%', width: '14%', flipped: true }
    ],
    objects: [ { id: 'filing_cabinet', asset: assets.filing_cabinet, bottom: '10%', left: '32%', width: '18%' } ],
    onLoad: {
      type: 'dialogue',
      text: "A decaying corpse lurches toward you from a desk!",
      choices: [
        { text: "Fight!", target: 'game_over_fight' },
        { text: "Run for the service tunnel!", target: 'forest_escape' }
      ]
    },
    interactions: {
      'zombie_rob': { type: 'dialogue', text: "It's Rob C... or what's left of him.", choices: [{ text: "Back away.", target: null }] }
    }
  },
};
