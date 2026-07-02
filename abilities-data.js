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

  density: 'This card scores +2 bonus VP.',

  deciding_factor: 'When a row or column ends in a tie, your side wins that line and scores bonus VP equal to this card\'s power.',

  commander: '+2 to all battle values of adjacent friendly cards (all tiers), applied when either card is placed. Stacks.',

  laser_focus: 'Sums all four battle values into the enemy-facing side only. Zero on all other sides.',

  intimidate: 'Adjacent enemies lose 1 from their highest battle value on placement. Reactive: fires again when enemy places adjacent later.',

  flank: 'After placing this card, take one extra turn immediately.',

  rush: 'Can be placed next to ANY enemy card anywhere on the board, bypassing normal tier zone restrictions.',

  phantom: 'Can be freely placed in your home row or the row directly above it, plus normal adjacency cells.',

  home_invader: 'Can be placed directly on the opponent\'s home row, bypassing all tier restrictions.',

  fortify: 'Claims the forward cell on placement. Opponent cannot place there; you can.',

  shield: 'The first time this card would lose a battle, the loss is prevented. One use per game — after that the shield is spent.',

  pierce: 'Ties count as wins for this card instead of draws.',

  double_strike: 'When this card wins any battle, the card two steps beyond in that same direction also takes half-damage.',

  cloak: 'Battle values show as ? for each side until that specific side fights its first battle.',

  sniper: 'On placement, silences the highest-power opponent card on their home row. That card contributes 0 VP.',

  revenge: 'When this card loses a battle, the winning enemy card loses 1 VP for the rest of the game (revenge alone can\'t drop a card below 1 VP).',

  birthright: 'On placement, a copy of a random unused Tier II card from your hand is added to your hand immediately.',

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

  double_strike:  { icon:'⚡⚡', color:'#ffdd00', label:'DOUBLE STRIKE', img:'assets/abilities/double_strike.webp' },

  pierce:         { icon:'▶▶',  color:'#ff8844', label:'PIERCE', img:'assets/abilities/pierce.webp' },

  flank:          { icon:'↺↺',  color:'#ff9900', label:'FLANK', img:'assets/abilities/flank.webp' },

  commander:      { icon:'★★',  color:'#ffcc00', label:'COMMANDER', img:'assets/abilities/commander.webp' },

  shield:         { icon:'🛡',   color:'#aaaaff', label:'SHIELD', img:'assets/abilities/shield.webp' },

  fortify:        { icon:'⬡',   color:'#4488ff', label:'FORTIFY', img:'assets/abilities/fortify.webp' },

  phantom:        { icon:'◈',   color:'#88ffff', label:'PHANTOM', img:'assets/abilities/phantom.webp' },

  rush:           { icon:'▶!',  color:'#ff6644', label:'RUSH', img:'assets/abilities/rush.webp' },

  cloak:          { icon:'?',   color:'#8888ff', label:'CLOAK', img:'assets/abilities/cloak.webp' },

  intimidate:     { icon:'↓↓',  color:'#ff4488', label:'INTIMIDATE', img:'assets/abilities/intimidate.webp' },

  revenge:        { icon:'↩⚡',  color:'#ff4488', label:'REVENGE', img:'assets/abilities/revenge.webp' },

  laser_focus:    { icon:'◉',   color:'#ff4400', label:'LASER FOCUS', img:'assets/abilities/laser_focus.webp' },

  sniper:         { icon:'◎',   color:'#ff8800', label:'SNIPER', img:'assets/abilities/sniper.webp' },

  birthright:     { icon:'✦+',  color:'#ffaaff', label:'BIRTHRIGHT', img:'assets/abilities/birthright.webp' },

  deciding_factor:{ icon:'⚖',   color:'#ffdd88', label:'DECIDING FACTOR', img:'assets/abilities/deciding_factor.webp' },

  lamb:           { icon:'★',   color:'#ff2222', label:'LAMB', img:'assets/abilities/lamb.webp' },

  density:        { icon:'⬛+',  color:'#9b59b6', label:'DENSITY', img:'assets/abilities/density.webp' },

  home_invader:   { icon:'↑⚔',  color:'#ff0066', label:'HOME INVADER', img:'assets/abilities/home_invader.webp' },

};
