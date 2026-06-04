const RACE_ABILITY_NAMES = {


  terran:     { shield:'COLONIAL BULWARK', double_strike:'ACCORD BARRAGE', commander:'FLEET ADMIRAL', flank:'PINCER MANEUVER' },


  brood:      { spawn:'HIVE PULSE', laser_focus:'MANDIBLE FOCUS', rush:'ACID CHARGE', boost:"QUEEN'S FAVOR" },


  crystallis: { fortify:'CRYSTAL FORTRESS', revenge:'REFRACTION REVENGE', shield:'LATTICE WARD', density:'CRYSTAL DENSITY' },


  mycos:      { home_invader:'MYCELIUM LINK', birthright:'SPORE BURST', lamb:'MYCELIAL SACRIFICE', overwhelm:'MYCO SURGE' },


  veil:       { phantom:'PHASE SHIFT', flank:'AFTERIMAGE', edge_play:'LIGHT BEND', pierce:'PHOTON LANCE' },


  entropy:    { revenge:'ENTROPY REVERSAL', laser_focus:'RUST EQUALIZE', double_strike:'SECOND ROT', ambush:'CORROSIVE STRIKE' },


  void:       { sniper:'VOID LANCE', ambush:'DARK SURGE', rush:'DARK LUNGE', pierce:'EVENT HORIZON' },


  gas:        { edge_play:'STORM WRAP', overwhelm:'PLASMA SURGE', birthright:'STORM BIRTH', double_strike:'TWIN PLASMA' },


  lithos:     { fortify:'TECTONIC HOLD', deciding_factor:'FAULT LINE', commander:'TECTONIC ARRAY', shield:'STONE SKIN' },


  quantum:    { flank:'PROBABILITY CASCADE', deciding_factor:'WAVE COLLAPSE', phantom:'SUPERPOSITION', sniper:'OBSERVER EFFECT' },


  choir:      { home_invader:'RESONANT CHORD', overwhelm:'SONIC BOOM', boost:'HARMONIC PULSE', rush:'SONIC RUSH' },


};

const ABILITY_TEXT = {


  shield: 'Absorbs the first battle loss: activates once per game.',


  double_strike: 'Win a battle, and the card one step beyond also takes half-damage.',


  commander: 'All adjacent friendly cards gain +2 to every battle value when placed.',


  boost: 'All adjacent friendly cards gain +1 to every battle value when placed.',


  fortify: 'Claims all adjacent empty cells: opponents cannot place there.',


  flank: 'After placing this card, take one extra turn immediately.',


  spawn: 'Adjacent Brood cards gain +2 to every battle value (hive sync).',


  rush: 'Can be placed next to any enemy card anywhere on the board.',


  cloak: 'Edges show as ? and are revealed only when this card fights its first battle.',


  pierce: 'Edge ties count as wins for this card instead of draws.',


  phantom: 'Can be freely placed in your home row or the row above it.',


  intimidate: 'Adjacent enemies lose 1 from their highest battle value on placement.',


  revenge: 'When defeated in battle, the winning card permanently loses 1 VP.',


  ambush: '2 random adjacent enemies each lose 1 from every battle value on placement.',


  laser_focus: 'Combines all four battle values into the North facing. Zero on all other sides.',


  sniper: 'Cancels the opposing home-row card in this column: it scores 0 VP.',


  birthright: 'On placement, a bonus Tier II card is added to your hand.',


  deciding_factor:'When a row or column ends in a tie, this card tips the result in your favor.',


  lamb: '5 VP but zero edges. Scores full value uncontested, nothing if attacked.',


  overwhelm: 'Win a battle by 3 or more and you also win the opposing axis.',


  density: 'This card contributes 1.5× its power to the row/column score.',


  home_invader: 'Can be placed directly on the opponent\'s home row.',


  edge_play: 'Placed on a board edge, this card wraps around to fight the card on the opposite side.',


};

const FACTION_ABILITY_POOLS = {


  terran:     ['shield','double_strike','commander','flank'],


  brood:      ['spawn','laser_focus','rush','boost'],


  crystallis: ['fortify','revenge','shield','density'],


  mycos:      ['home_invader','birthright','lamb','overwhelm'],


  veil:       ['phantom','flank','edge_play','pierce'],


  entropy:    ['revenge','laser_focus','double_strike','ambush'],


  void:       ['sniper','ambush','rush','pierce'],


  gas:        ['edge_play','overwhelm','birthright','double_strike'],


  lithos:     ['fortify','deciding_factor','commander','shield'],


  quantum:    ['flank','deciding_factor','phantom','sniper'],


  choir:      ['home_invader','overwhelm','boost','cloak'],


  _default:   ['shield','double_strike','boost','laser_focus','pierce','flank'],


};

const ABILITY_ICONS = {


  double_strike:  { icon:'⚡⚡', color:'#ffdd00', label:'DOUBLE STRIKE'  },


  pierce:         { icon:'▶▶',  color:'#ff8844', label:'PIERCE'         },


  flank:          { icon:'↺↺',  color:'#ff9900', label:'FLANK'          },


  boost:          { icon:'⬆',   color:'#44ffcc', label:'BOOST'          },


  commander:      { icon:'★★',  color:'#ffcc00', label:'COMMANDER'      },


  surge:          { icon:'⚡+',  color:'#ff6600', label:'SURGE'          },


  shield:         { icon:'🛡',   color:'#aaaaff', label:'SHIELD'         },


  fortify:        { icon:'⬡',   color:'#4488ff', label:'FORTIFY'        },


  phantom:        { icon:'◈',   color:'#88ffff', label:'PHANTOM'        },


  rush:           { icon:'▶!',  color:'#ff6644', label:'RUSH'           },


  cloak:          { icon:'?',   color:'#8888ff', label:'CLOAK'          },


  spawn:          { icon:'★★',  color:'#88cc44', label:'SPAWN'          },


  intimidate:     { icon:'↓↓',  color:'#ff6644', label:'INTIMIDATE'     },


  revenge:        { icon:'↩⚡',  color:'#ff4488', label:'REVENGE'        },


  ambush:         { icon:'✕✕',  color:'#cc44ff', label:'AMBUSH'         },


  laser_focus:    { icon:'◉',   color:'#ff4400', label:'LASER FOCUS'    },


  sniper:         { icon:'◎',   color:'#ff8800', label:'SNIPER'         },


  birthright:     { icon:'✦+',  color:'#ffaaff', label:'BIRTHRIGHT'     },


  deciding_factor:{ icon:'⚖',   color:'#ffdd88', label:'DECIDING FACTOR'},


  lamb:           { icon:'★',   color:'#ffdd00', label:'LAMB'           },


  overwhelm:      { icon:'▲▲',  color:'#88cc44', label:'OVERWHELM'      },


  density:        { icon:'⬛+',  color:'#9b59b6', label:'DENSITY'        },


  home_invader:   { icon:'↑⚔',  color:'#ff0066', label:'HOME INVADER'   },


  edge_play:      { icon:'↩↪',  color:'#ff55aa', label:'EDGE PLAY'      },


};
