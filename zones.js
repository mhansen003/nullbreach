// ── RENDERING ─────────────────────────────────

const GRID_ROWS = 5;  // playable rows

const GRID_COLS = 7;  // playable columns

const CS_W = 130;  // cell width + gap = 124 + 6

const CS_H = 158;  // cell height + gap = 152 + 6

const CS = CS_W;   // legacy alias for horizontal calc

const TIER_COLORS = { 'I':'#d0d0d0', 'II':'#44cc66', 'III':'#4488ff', 'IV':'#aa44ff' };

const ZONES = {

  // Tier 1 WORLDS: liberal, open territory in all directions

  wide_cross:  [{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:0,dc:-1},{dr:0,dc:1},{dr:1,dc:0},{dr:-2,dc:0}],

  // Supply hub: full ring around the card (most open)

  full_ring:   [{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:0,dc:-1},{dr:0,dc:1},{dr:1,dc:-1},{dr:1,dc:0},{dr:1,dc:1}],

  // Frontier post: holds ground, opens horizontal spread + 1 forward

  wall:        [{dr:-1,dc:0},{dr:0,dc:-1},{dr:0,dc:-2},{dr:0,dc:1},{dr:0,dc:2},{dr:1,dc:0}],

  // Battle group: opens wide front (2 wide × 2 deep forward)

  command:     [{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:-2,dc:0},{dr:-2,dc:-1},{dr:-2,dc:1}],

  // Carrier wing: forward lanes for fighters to launch through

  launch:      [{dr:-1,dc:0},{dr:-2,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:-3,dc:0}],

  // Strike force / interceptor: punches directly forward, 2 deep

  lance:       [{dr:-1,dc:0},{dr:-2,dc:0}],

  // Flanker / fast runner: forward + diagonals

  flanker:     [{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:-2,dc:0}],

  // Dreadnaught: expands everywhere, 2 deep in all directions

  dreadnaught: [{dr:-1,dc:0},{dr:-2,dc:0},{dr:0,dc:-1},{dr:0,dc:1},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:1,dc:0}],

  // T1 WORLD ZONES: upward only, no same-row adjacency
  // t1_fan: forward fan N+NE+NW + 2 deep straight (most common T1)
  t1_fan:       [{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:-2,dc:0}],

  // t1_thrust: spear 3 deep straight forward
  t1_thrust:    [{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0}],

  // t1_spread: wide forward arc 2 rows deep
  t1_spread:    [{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:-2,dc:-1},{dr:-2,dc:1}],

  // ── FACTION-UNIQUE ZONES ─────────────────────────────────────────

  // TERRAN: front_line — wide shallow line, 5 cells 1 row deep (military formation)
  front_line:   [{dr:-1,dc:-2},{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:-1,dc:2}],

  // BROOD: swarm_burst — forward fan + adjacent laterals, no backward (swarming spread)
  swarm_burst:  [{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:0,dc:-1},{dr:0,dc:1}],

  // CRYSTALLIS: lattice_arm — deep lateral reach + 1 forward (crystal structure)
  lattice_arm:  [{dr:0,dc:-2},{dr:0,dc:-1},{dr:0,dc:1},{dr:0,dc:2},{dr:-1,dc:0}],

  // VEIL: phase_step — diagonal-only 2 rows deep, no straight lines (phase shift)
  phase_step:   [{dr:-1,dc:-1},{dr:-1,dc:1},{dr:-2,dc:-2},{dr:-2,dc:2}],

  // ENTROPY: decay_bore — single column 4 rows deep (relentless forward decay)
  decay_bore:   [{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0},{dr:-4,dc:0}],

  // VOID: pincer_clamp — dual off-center columns 2 deep (void hunter pairs)
  pincer_clamp: [{dr:-1,dc:-1},{dr:-2,dc:-1},{dr:-1,dc:1},{dr:-2,dc:1}],

  // GAS: storm_wing — forward + wide lateral jump (plasma arc burst)
  storm_wing:   [{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:0,dc:-2},{dr:0,dc:2}],

  // LITHOS: bulwark — diagonal-laterals only, no straight forward (corner stones)
  bulwark:      [{dr:0,dc:-1},{dr:0,dc:1},{dr:-1,dc:-1},{dr:-1,dc:1}],

  // QUANTUM: scatter_field — alternating cells in row + laterals (superposition)
  scatter_field:[{dr:-1,dc:-2},{dr:-1,dc:0},{dr:-1,dc:2},{dr:0,dc:-1},{dr:0,dc:1}],

  // CHOIR: resonance_arc — curved arc 2 rows deep, no center at depth 2 (sound wave)
  resonance_arc:[{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:-2,dc:-1},{dr:-2,dc:1}],

  // ── EXTENDED PATTERNS ────────────────────────────────────────────

  // v_wing: carrier V-formation, fans out wider at depth 2 (wings, carriers, fleets)
  v_wing:       [{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1},{dr:-2,dc:-2},{dr:-2,dc:2}],

  // hammer: 5-wide strike front + single penetrating center 2 deep (battle groups, tectonic)
  hammer:       [{dr:-1,dc:-2},{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:-1,dc:2},{dr:-2,dc:0}],

  // deep_fan: 3-tier forward fan — flanker extended with 3rd row tip (fast movers, surges)
  deep_fan:     [{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:-2,dc:-1},{dr:-2,dc:1},{dr:-3,dc:0}],

  // trident: 3 parallel 2-deep prongs — left, center, right columns (strikes, surges)
  trident:      [{dr:-1,dc:-2},{dr:-2,dc:-2},{dr:-1,dc:0},{dr:-2,dc:0},{dr:-1,dc:2},{dr:-2,dc:2}],

};

const DIRS4 = [

  {dr:-1,dc:0,myE:'n',theirE:'s',lbl:'north'},

  {dr: 1,dc:0,myE:'s',theirE:'n',lbl:'south'},

  {dr: 0,dc:1,myE:'e',theirE:'w',lbl:'east'},

  {dr: 0,dc:-1,myE:'w',theirE:'e',lbl:'west'},

];
