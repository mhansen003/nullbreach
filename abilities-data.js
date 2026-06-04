const RACE_ABILITY_NAMES = {


  terran:     { shield:'COLONIAL BULWARK', double_strike:'ACCORD BARRAGE', commander:'FLEET ADMIRAL', flank:'PINCER MANEUVER' },


  brood:      { spawn:'HIVE PULSE', sweep:'MANDIBLE LEVEL', rush:'ACID CHARGE', boost:"QUEEN'S FAVOR" },


  crystallis: { stonewall:'CRYSTAL FORTRESS', mirror:'REFRACTION', shield:'LATTICE WARD', density:'CRYSTAL DENSITY' },


  mycos:      { hat_trick:'MYCELIUM LINK', birthright:'SPORE BURST', echo:'MYCELIAL NETWORK', overwhelm:'MYCO SURGE' },


  veil:       { phantom:'PHASE SHIFT', flank:'AFTERIMAGE', edge_play:'LIGHT BEND', pierce:'PHOTON LANCE' },


  entropy:    { mirror:'ENTROPY REVERSAL', sweep:'RUST EQUALIZE', double_strike:'SECOND ROT', ambush:'CORROSIVE STRIKE' },


  void:       { sniper:'VOID LANCE', ambush:'DARK SURGE', rush:'DARK LUNGE', pierce:'EVENT HORIZON' },


  gas:        { edge_play:'STORM WRAP', overwhelm:'PLASMA SURGE', birthright:'STORM BIRTH', double_strike:'TWIN PLASMA' },


  lithos:     { stonewall:'TECTONIC HOLD', deciding_factor:'FAULT LINE', commander:'TECTONIC ARRAY', shield:'STONE SKIN' },


  quantum:    { flank:'PROBABILITY CASCADE', deciding_factor:'WAVE COLLAPSE', phantom:'SUPERPOSITION', sniper:'OBSERVER EFFECT' },


  choir:      { hat_trick:'RESONANT CHORD', overwhelm:'SONIC BOOM', boost:'HARMONIC PULSE', rush:'SONIC RUSH' },


};

const ABILITY_TEXT = {


  shield: 'Absorbs the first edge loss — activates once per game.',


  double_strike: 'When you win an edge comparison, the card one step further also takes half-damage.',


  commander: 'All adjacent same-tier friendly cards gain +2 to every edge when placed.',


  boost: 'All adjacent friendly cards gain +1 to every edge when placed.',


  sweep: 'On placement, all 4 edges normalize to the second-highest value on the card.',


  flank: 'After placing this card, take one extra turn immediately.',


  spawn: 'Adjacent Brood cards of the same tier gain +2 to every edge (hive sync).',


  rush: 'Can be placed next to any enemy card anywhere on the board.',


  cloak: 'Edges show as ? and are revealed only when this card fights its first battle.',


  pierce: 'Edge ties count as wins for this card instead of draws.',


  phantom: 'Can be freely placed in your home row or the row above it.',


  intimidate: 'Adjacent enemies lose 1 from their highest edge on placement.',


  mirror: 'When flanked by enemies on the same axis, those enemies swap their facing edges.',


  ambush: '2 random adjacent enemies each lose 1 from every edge on placement.',


  stonewall: 'This card and 2 adjacent enemies score 0 VP — purely positional.',


  sniper: 'Cancels the opposing home-row card in this column — it scores 0 VP.',


  birthright: 'At game start, a bonus Tier II card is added to your hand.',


  deciding_factor:'DECIDING FACTOR: Tied rows/cols tip +1 to your favor',


  echo: 'If you win both the row AND column containing this card, its power is doubled.',


  overwhelm: 'Win an edge comparison by 3 or more — and you also win the opposing axis.',


  density: 'This card contributes 1.5× its power to the row/column score.',


  hat_trick: 'Middle of a 3-card vertical line — distributes edge bonuses to the cards above and below.',


  edge_play: 'Placed on a board edge, this card wraps around to fight the card on the opposite side.',


};

const FACTION_ABILITY_POOLS = {


  terran:     ['shield','double_strike','commander','flank'],


  brood:      ['spawn','sweep','rush','boost'],


  crystallis: ['stonewall','mirror','shield','density'],


  mycos:      ['hat_trick','birthright','echo','overwhelm'],


  veil:       ['phantom','flank','edge_play','pierce'],


  entropy:    ['mirror','sweep','double_strike','ambush'],


  void:       ['sniper','ambush','rush','pierce'],


  gas:        ['edge_play','overwhelm','birthright','double_strike'],


  lithos:     ['stonewall','deciding_factor','commander','shield'],


  quantum:    ['flank','deciding_factor','phantom','sniper'],


  choir:      ['hat_trick','overwhelm','boost','cloak'],


  _default:   ['shield','double_strike','boost','sweep','pierce','flank'],


};

const ABILITY_ICONS = {


  double_strike:  { icon:'⚡⚡', color:'#ffdd00', label:'DOUBLE STRIKE'  },


  pierce:         { icon:'▶▶',  color:'#ff8844', label:'PIERCE'         },


  flank:          { icon:'↺↺',  color:'#ff9900', label:'FLANK'          },


  boost:          { icon:'⬆',   color:'#44ffcc', label:'BOOST'          },


  commander:      { icon:'★★',  color:'#ffcc00', label:'COMMANDER'      },


  surge:          { icon:'⚡+',  color:'#ff6600', label:'SURGE'          },


  shield:         { icon:'🛡',   color:'#aaaaff', label:'SHIELD'         },


  sweep:          { icon:'↔↕',  color:'#ff88ff', label:'SWEEP'          },


  phantom:        { icon:'◈',   color:'#88ffff', label:'PHANTOM'        },


  rush:           { icon:'▶!',  color:'#ff6644', label:'RUSH'           },


  cloak:          { icon:'?',   color:'#8888ff', label:'CLOAK'          },


  spawn:          { icon:'★★',  color:'#88cc44', label:'SPAWN'          },


  intimidate:     { icon:'↓↓',  color:'#ff6644', label:'INTIMIDATE'     },


  mirror:         { icon:'⇔',   color:'#cc44ff', label:'MIRROR'         },


  ambush:         { icon:'✕✕',  color:'#cc44ff', label:'AMBUSH'         },


  stonewall:      { icon:'▣',   color:'#6688aa', label:'STONEWALL'      },


  sniper:         { icon:'◎',   color:'#ff8800', label:'SNIPER'         },


  birthright:     { icon:'✦+',  color:'#ffaaff', label:'BIRTHRIGHT'     },


  deciding_factor:{ icon:'⚖',   color:'#ffdd88', label:'DECIDING FACTOR'},


  echo:           { icon:'◈◈',  color:'#c8c8ff', label:'ECHO'           },


  overwhelm:      { icon:'▲▲',  color:'#88cc44', label:'OVERWHELM'      },


  density:        { icon:'⬛+',  color:'#9b59b6', label:'DENSITY'        },


  hat_trick:      { icon:'↑↓↑', color:'#00ddff', label:'HAT TRICK'      },


  edge_play:      { icon:'↩↪',  color:'#ff55aa', label:'EDGE PLAY'      },


};
