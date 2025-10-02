<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dead Trail – Episode 1 (Playable Slice)</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>Dead Trail</h1>
    <div id="hud">
      <span id="hearts">❤❤❤</span>
      <span id="inventory">Roombas: 0 • Crackers: 0</span>
      <span id="hint">WASD/←→ to move • E interact • Space throw • M music</span>
    </div>
  </header>

  <main>
    <canvas id="game" width="1280" height="720"></canvas>
    <div id="dialogue" class="hidden">
      <p id="dialogue-text"></p>
      <div id="dialogue-continue">Press E…</div>
    </div>
    <div id="tooltip" class="hidden"></div>
  </main>

  <footer>
    <button id="btn-new">New Game</button>
    <button id="btn-load">Load</button>
    <button id="btn-mute">🔊</button>
  </footer>

  <audio id="music" src="assets/audio/Forsaken_Walk.wav" loop preload="auto"></audio>

  <!-- Inline fallback for levels.json -->
  <script id="levels-data" type="application/json">
{
  "meta": { "title": "Episode 1 – Welcome to the Dungeon (Playable Slice)" },
  "startScene": "prison_yard",
  "scenes": {
    "prison_yard": {
      "bg": "assets/backgrounds/prison_interior.png",
      "bounds": { "left": 80, "right": 1180, "ground": 620 },
      "player": { "x": 160, "y": 560, "sprite": "assets/sprites/characters/john.png" },
      "actors": [
        { "id": "carol", "sprite": "assets/sprites/characters/carol.png", "x": 520, "y": 560, "talkable": true,
          "onTalk": ["carol_1", "carol_need"] },
        { "id": "jean", "sprite": "assets/sprites/characters/jean.png", "x": 1040, "y": 480, "alpha": 0.25, "ghost": true },
        { "id": "z1", "sprite": "assets/sprites/npc/zombie_no_arm.png", "x": 900, "y": 560, "ai": "zombie", "speed": 0.9 }
      ],
      "items": [
        { "id": "roomba", "sprite": "assets/objects/roomba_side.png", "x": 320, "y": 600, "type": "roomba" },
        { "id": "cracker", "sprite": "assets/objects/snack.png", "x": 740, "y": 600, "type": "cracker" }
      ],
      "doors": [
        { "to": "office", "x": 1180, "w": 60, "label": "Office →" }
      ]
    },

    "office": {
      "bg": "assets/backgrounds/office.png",
      "bounds": { "left": 80, "right": 1180, "ground": 620 },
      "player": { "x": 120, "y": 560, "sprite": "assets/sprites/characters/john.png" },
      "actors": [
        { "id": "ed", "sprite": "assets/sprites/characters/ed.png", "x": 380, "y": 580, "talkable": true, "onTalk": ["ed_roomba"] },
        { "id": "jamaal", "sprite": "assets/sprites/characters/jamaal.png", "x": 820, "y": 560, "talkable": true, "onTalk": ["jamaal_sideeye"] }
      ],
      "items": [
        { "id": "save", "sprite": "assets/objects/vending_machine.png", "x": 1040, "y": 540, "type": "save" },
        { "id": "fish", "sprite": "assets/objects/fish_swim_in_tank_with_crack.png", "x": 520, "y": 580, "type": "flavor" }
      ],
      "doors": [
        { "to": "prison_yard", "x": 80, "w": 60, "label": "← Yard" }
      ]
    }
  },

  "dialogue": {
    "carol_1": [
      "CAROL: …You came back.",
      "JOHN: We're holding the yard. Stay behind me if they push again."
    ],
    "carol_need": [
      "@if inventory.cracker>0",
      "CAROL: Is that… a cracker?",
      "JOHN: It's yours.",
      "CAROL: Thank you. It's just a cracker… but it's yours.",
      "@flag carol_trust +1",
      "@take cracker 1",
      "@end",

      "CAROL: I'm fine. Just… hungry."
    ],

    "ed_roomba": [
      "ED: You wanted defense? I'm building a vacuum army.",
      "ED: Find me a working Roomba and I'll tune it to knock a ghoul on its ass.",
      "@if inventory.roomba>0",
      "ED: Boom. Gimme that.",
      "@take roomba 1",
      "@give roomba_mod 1",
      "ED: Try the modded one. Frisbee rules.",
      "@end"
    ],

    "jamaal_sideeye": [
      "JAMAAL: Order. Sure. If you say so.",
      "JOHN: Keep your voice down. People are scared.",
      "JAMAAL: People need results, not speeches."
    ]
  }
}
  </script>

  <script src="game.js"></script>
</body>
</html>