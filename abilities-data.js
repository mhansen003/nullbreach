const RACE_ABILITY_NAMES = {

  terran:     { commander:'COMMANDER', flank:'FLANK', shield:'SHIELD', double_strike:'DOUBLE STRIKE' },

  brood:      { commander:'COMMANDER', laser_focus:'LASER FOCUS', rush:'RUSH', birthright:'BIRTHRIGHT' },

  crystallis: { density:'DENSITY', fortify:'FORTIFY', shield:'SHIELD', revenge:'REVENGE' },

  mycos:      { lamb:'LAMB', intimidate:'INTIMIDATE', home_invader:'HOME INVADER', birthright:'BIRTHRIGHT' },

  veil:       { flank:'FLANK', phantom:'PHANTOM', pierce:'PIERCE', cloak:'CLOAK' },

  entropy:    { lamb:'LAMB', laser_focus:'LASER FOCUS', intimidate:'INTIMIDATE', revenge:'REVENGE' },

  void:       { rush:'RUSH', pierce:'PIERCE', cloak:'CLOAK', sniper:'SNIPER' },

  gas:        { deciding_factor:'DECIDING FACTOR', rush:'RUSH', home_invader:'HOME INVADER', double_strike:'DOUBLE STRIKE' },

  lithos:     { deciding_factor:'DECIDING FACTOR', commander:'COMMANDER', fortify:'FORTIFY', shield:'SHIELD' },

  quantum:    { density:'DENSITY', flank:'FLANK', phantom:'PHANTOM', sniper:'SNIPER' },

  choir:      { commander:'COMMANDER', flank:'FLANK', cloak:'CLOAK', birthright:'BIRTHRIGHT' },

};

const ABILITY_TEXT = {

  lamb: '5 VP but zero on all battle values. Scores full power if uncontested; zero if any enemy is adjacent.',

  density: 'VP of this card is worth 1.5.',

  deciding_factor: 'When a row or column ends in a tie, this card tips the result in your favor.',

  commander: 'Adjacent friendly cards gain battle value on placement. Amount varies by faction (+1 or +2). Stacks.',

  laser_focus: 'Sums all four battle values into the enemy-facing side only. Zero on all other sides.',

  intimidate: 'Adjacent enemies lose 1 from their highest battle value on placement. Reactive: fires again when enemy places adjacent later.',

  flank: 'After placing this card, take one extra turn immediately.',

  rush: 'Can be placed next to ANY enemy card anywhere on the board, bypassing normal tier zone restrictions.',

  phantom: 'Can be freely placed in your home row or the row directly above it, plus normal adjacency cells.',

  home_invader: 'Can be placed directly on the opponent\'s home row, bypassing all tier restrictions.',

  fortify: 'Claims the forward cell on placement. Opponent cannot place there; you can.',

  shield: 'Absorbs the first battle loss. Sets shieldBlockH AND shieldBlockV simultaneously — one use per game.',

  pierce: 'Ties count as wins for this card instead of draws.',

  double_strike: 'When this card wins any battle, the card two steps beyond in that same direction also takes half-damage.',

  cloak: 'Battle values show as ? for each side until that specific side fights its first battle.',

  sniper: 'On placement, silences the highest-power opponent card on their home row. That card contributes 0 VP.',

  revenge: 'When this card loses a battle comparison, the winning enemy card permanently loses 1 VP (floor of 1).',

  birthright: 'On placement, a bonus Tier II card is added to your hand immediately.',

  boost: 'Adjacent friendly cards gain +1 to every battle value when placed.',

  spawn: 'Adjacent friendly cards gain +2 to every battle value when placed (hive sync).',

};

const FACTION_ABILITY_POOLS = {

  terran:     ['commander','flank','shield','double_strike'],

  brood:      ['commander','laser_focus','rush','birthright'],

  crystallis: ['density','fortify','shield','revenge'],

  mycos:      ['lamb','intimidate','home_invader','birthright'],

  veil:       ['flank','phantom','pierce','cloak'],

  entropy:    ['lamb','laser_focus','intimidate','revenge'],

  void:       ['rush','pierce','cloak','sniper'],

  gas:        ['deciding_factor','rush','home_invader','double_strike'],

  lithos:     ['deciding_factor','commander','fortify','shield'],

  quantum:    ['density','flank','phantom','sniper'],

  choir:      ['commander','flank','cloak','birthright'],

  _default:   ['shield','double_strike','commander','laser_focus','pierce','flank'],

};

const ABILITY_ICONS = {

  double_strike:  { icon:'⚡⚡', color:'#ffdd00', label:'DOUBLE STRIKE'  },

  pierce:         { icon:'▶▶',  color:'#ff8844', label:'PIERCE'         },

  flank:          { icon:'↺↺',  color:'#ff9900', label:'FLANK'          },

  boost:          { icon:'⬆',   color:'#44ffcc', label:'BOOST'          },

  commander:      { icon:'★★',  color:'#ffcc00', label:'COMMANDER'      },

  shield:         { icon:'🛡',   color:'#aaaaff', label:'SHIELD'         },

  fortify:        { icon:'⬡',   color:'#4488ff', label:'FORTIFY'        },

  phantom:        { icon:'◈',   color:'#88ffff', label:'PHANTOM'        },

  rush:           { icon:'▶!',  color:'#ff6644', label:'RUSH'           },

  cloak:          { icon:'?',   color:'#8888ff', label:'CLOAK'          },

  spawn:          { icon:'★★',  color:'#88cc44', label:'SPAWN'          },

  intimidate:     { icon:'↓↓',  color:'#ff4488', label:'INTIMIDATE'     },

  revenge:        { icon:'↩⚡',  color:'#ff4488', label:'REVENGE'        },

  laser_focus:    { icon:'◉',   color:'#ff4400', label:'LASER FOCUS'    },

  sniper:         { icon:'◎',   color:'#ff8800', label:'SNIPER'         },

  birthright:     { icon:'✦+',  color:'#ffaaff', label:'BIRTHRIGHT'     },

  deciding_factor:{ icon:'⚖',   color:'#ffdd88', label:'DECIDING FACTOR'},

  lamb:           { icon:'★',   color:'#ff2222', label:'LAMB'           },

  density:        { icon:'⬛+',  color:'#9b59b6', label:'DENSITY'        },

  home_invader:   { icon:'↑⚔',  color:'#ff0066', label:'HOME INVADER'   },

};
