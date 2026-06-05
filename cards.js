const RACE_DATA = {

  terran:     { name:'THE TERRAN ACCORD',      sub:'UNITED COLONIAL FEDERATION',     color:'#7ab8e8', avatar:'★',  avatarImg:'assets/avatars/terran.png',    quote:'"We are many worlds, one purpose."',            loreBg:'assets/lore_terran.png'     },

  crystallis: { name:'THE CRYSTALLIS',          sub:'SILICON LATTICE CIVILIZATION',   color:'#00ccff', avatar:'💎', avatarImg:'assets/avatars/crystallis.png', quote:'"You will fracture against us."',                loreBg:'assets/lore_crystallis.png' },

  mycos:      { name:'THE MYCOS DRIFT',         sub:'DISTRIBUTED FUNGAL INTELLIGENCE',color:'#9dcf6e', avatar:'🍄', avatarImg:'assets/avatars/mycos.png',      quote:'"We have already begun."',                      loreBg:'assets/lore_mycos.png'      },

  veil:       { name:'THE VEIL',                sub:'COHERENT LIGHT ENTITIES',        color:'#fff5a0', avatar:'✦',  avatarImg:'assets/avatars/veil.png',       quote:'"You cannot strike what you cannot see."',       loreBg:'assets/lore_veil.png'       },

  entropy:    { name:'THE ENTROPY CULT',        sub:'ANCIENT DECAY WORSHIPPERS',      color:'#c4723a', avatar:'☄',  avatarImg:'assets/avatars/entropy.png',    quote:'"Everything ends. We simply hasten it."',        loreBg:'assets/lore_entropy.png'    },

  brood:      { name:'THE BROOD SOVEREIGN',     sub:'INSECTOID HIVE-MIND',            color:'#88cc44', avatar:'🪲', avatarImg:'assets/avatars/brood.png',      quote:'"The Sovereign sees through ten thousand eyes."', loreBg:'assets/lore_brood.png'      },

  void:       { name:'THE VOID HUNTERS',        sub:'DARK MATTER PREDATORS',          color:'#9b59b6', avatar:'▪',  avatarImg:'assets/avatars/void.png',       quote:'"We come from the dark between stars."',         loreBg:'assets/lore_void.png'       },

  gas:        { name:'THE GAS NOMADS',          sub:'PLASMA STORM BEINGS',            color:'#ffd700', avatar:'⚡', avatarImg:'assets/avatars/gas.png',        quote:'"You have angered the storm."',                  loreBg:'assets/lore_gas.png'        },

  lithos:     { name:'THE LITHOS',              sub:'GEOLOGICAL ANCIENTS',            color:'#a0896a', avatar:'⬡',  avatarImg:'assets/avatars/lithos.png',     quote:'"We were here before your stars ignited."',      loreBg:'assets/lore_lithos.png'     },

  quantum:    { name:'THE QUANTUM THREAD',      sub:'SUPERPOSITION ENTITIES',         color:'#ff69b4', avatar:'◈',  avatarImg:'assets/avatars/quantum.png',    quote:'"We are all possibilities at once."',            loreBg:'assets/lore_quantum.png'    },

  choir:      { name:'THE CHOIR',               sub:'RESONANT FREQUENCY ENTITIES',    color:'#c8c8ff', avatar:'〜', avatarImg:'assets/avatars/choir.png',      quote:'"The note that breaks everything."',             loreBg:'assets/lore_choir.png'      },

};

// ── BROOD SOVEREIGN DECK ──────────────────────────────────────────

// Same design rule: strong attack direction = weak rear (S low on aggressive cards)

// Brood: hive anchors (T1) → warrior clusters (T2) → skimmers (T3) → The Sovereign (T4)

const BROOD_CARDS = [

  { id:'br_t1a', name:'HIVE NODE',       tier:'I',  tierLabel:'HIVE NODE',       zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null,          abilityText:'Basic Hive Node', art:'assets/cards/brood/hive-node.png' },

  { id:'br_t1b', name:'HIVE NODE',       tier:'I',  tierLabel:'HIVE NODE',       zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null,          abilityText:'Basic Hive Node', art:'assets/cards/brood/hive-node.png' },

  { id:'br_t1c', name:'HIVE NODE',       tier:'I',  tierLabel:'HIVE NODE',       zone:'t1_fan', edges:{n:7,s:2,e:5,w:5}, power:1, ability:null,          abilityText:'Basic Hive Node', art:'assets/cards/brood/hive-node.png' },

  { id:'br_t1d', name:'QUEEN CRADLE',    tier:'I',  tierLabel:'HIVE NODE',       zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null,   abilityText:'No special ability', art:'assets/cards/brood/queen-cradle.png' },

  { id:'br_t1e', name:'BROOD ANCHOR',    tier:'I',  tierLabel:'HIVE NODE',       zone:'t1_spread',  edges:{n:6,s:5,e:5,w:4}, power:2, ability:null,       abilityText:'No special ability', art:'assets/cards/brood/brood-anchor.png' },

  { id:'br_t2a', name:'WARRIOR CLUSTER', tier:'II', tierLabel:'WARRIOR CLUSTER', zone:'command',    edges:{n:6,s:3,e:5,w:6}, power:3, ability:'commander',   abilityText:'No special ability', art:'assets/cards/brood/warrior-cluster.png' },

  { id:'br_t2b', name:'SOLDIER MASS',    tier:'II', tierLabel:'WARRIOR CLUSTER', zone:'launch',     edges:{n:6,s:3,e:6,w:5}, power:3, ability:'laser_focus',       abilityText:'No special ability', art:'assets/cards/brood/soldier-mass.png' },

  { id:'br_t2c', name:'BIOMECH FLEET',   tier:'II', tierLabel:'WARRIOR CLUSTER', zone:'command',    edges:{n:4,s:3,e:8,w:5}, power:2, ability:'rush',       abilityText:'No special ability', art:'assets/cards/brood/biomech-fleet.png' },

  { id:'br_t3a', name:'SKIMMER',         tier:'III',tierLabel:'SKIMMER',         zone:'flanker',    edges:{n:8,s:3,e:5,w:5}, power:3, ability:'birthright',        abilityText:'No special ability', art:'assets/cards/brood/skimmer.png' },

  { id:'br_t3b', name:'VOID SKIMMER',    tier:'III',tierLabel:'SKIMMER',         zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'commander',        abilityText:'No special ability',          art:'assets/cards/brood/void-skimmer.png' },

  { id:'br_t3c', name:'LARVAE STRIKE',   tier:'III',tierLabel:'SKIMMER',         zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:2, ability:'laser_focus',         abilityText:'No special ability',    art:'assets/cards/brood/skimmer.png' },

  { id:'br_t4',  name:'THE SOVEREIGN',   tier:'IV', tierLabel:'SOVEREIGN',       zone:'dreadnaught',edges:{n:8,s:6,e:7,w:7}, power:4, ability:'rush',   abilityText:'No special ability', art:'assets/cards/brood/the-sovereign.png' },

  // Extra cards

  { id:'br_x1', name:'HIVE NODE',        tier:'I',  tierLabel:'HIVE NODE',       zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null,          abilityText:'Basic Hive Node', art:'assets/cards/brood/hive-node.png' },

  { id:'br_x2', name:'SWARM WING',       tier:'II', tierLabel:'WARRIOR CLUSTER', zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:3, ability:'birthright',       abilityText:'No special ability', art:'assets/cards/brood/biomech-fleet.png' },

  { id:'br_x3', name:'HIVE LANCE',       tier:'III',tierLabel:'SKIMMER',         zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:2, ability:'commander',        abilityText:'No special ability', art:'assets/cards/brood/void-skimmer.png' },

];

// ── CRYSTALLIS DECK: Silicon Lattice Collective ──────────────────

// Theme: crystal shards (T1) → resonance arrays (T2) → prism lances (T3) → The Lattice (T4)

// Edge profile: W/E dominant (wide flanks), moderate N, weak S

const CRYSTALLIS_CARDS = [

  // T1: CRYSTAL SHARDS (sum 15-16, power 1): W/E dominant

  { id:'cr_t1a', name:'CRYSTAL SHARD',    tier:'I',  tierLabel:'CRYSTAL SHARD',    zone:'t1_fan', edges:{n:8,s:2,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/crystallis/t1_a.png' },

  { id:'cr_t1b', name:'SHARD CLUSTER',    tier:'I',  tierLabel:'CRYSTAL SHARD',    zone:'t1_fan', edges:{n:8,s:2,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/crystallis/t1_b.png' },

  { id:'cr_t1c', name:'SILICA NODE',      tier:'I',  tierLabel:'CRYSTAL SHARD',    zone:'t1_fan', edges:{n:7,s:2,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/crystallis/t1_c.png' },

  { id:'cr_t1d', name:'LATTICE WALL',     tier:'I',  tierLabel:'CRYSTAL SHARD',    zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/crystallis/t1_a.png' },

  { id:'cr_t1e', name:'CRYSTAL CORE',     tier:'I',  tierLabel:'CRYSTAL SHARD',    zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/crystallis/t1_c.png' },

  // T2: RESONANCE ARRAYS (sum 19-22, power 2): W/E dominant

  { id:'cr_t2a', name:'RESONANCE ARRAY',  tier:'II', tierLabel:'RESONANCE ARRAY',  zone:'command',    edges:{n:6,s:3,e:5,w:7}, power:2, ability:'density', abilityText:'No special ability', art:'assets/cards/crystallis/t2_a.png' },

  { id:'cr_t2b', name:'PRISM BATTERY',    tier:'II', tierLabel:'RESONANCE ARRAY',  zone:'launch',     edges:{n:7,s:3,e:4,w:7}, power:2, ability:'fortify', abilityText:'No special ability', art:'assets/cards/crystallis/t2_b.png' },

  { id:'cr_t2c', name:'REFRACTION RING',  tier:'II', tierLabel:'RESONANCE ARRAY',  zone:'command',    edges:{n:5,s:3,e:5,w:8}, power:2, ability:'shield', abilityText:'No special ability', art:'assets/cards/crystallis/t2_c.png' },

  // T3: PRISM LANCES (sum 19-22, power 3): W/E dominant

  { id:'cr_t3a', name:'PRISM LANCE',      tier:'III',tierLabel:'PRISM LANCE',      zone:'lance',      edges:{n:7,s:3,e:5,w:6}, power:3, ability:'revenge', abilityText:'No special ability', art:'assets/cards/crystallis/t3_a.png' },

  { id:'cr_t3b', name:'SHARD BLADE',      tier:'III',tierLabel:'PRISM LANCE',      zone:'flanker',    edges:{n:5,s:3,e:5,w:8}, power:3, ability:'density', abilityText:'No special ability', art:'assets/cards/crystallis/t3_b.png' },

  { id:'cr_t3c', name:'FACET STRIKE',     tier:'III',tierLabel:'PRISM LANCE',      zone:'lance',      edges:{n:5,s:5,e:5,w:6}, power:3, ability:'fortify', abilityText:'No special ability', art:'assets/cards/crystallis/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): W/E dominant flanks

  { id:'cr_t4',  name:'THE LATTICE',      tier:'IV', tierLabel:'LATTICE PRIME',    zone:'dreadnaught',edges:{n:7,s:5,e:7,w:9}, power:4, ability:'shield', abilityText:'No special ability', art:'assets/cards/crystallis/t4.png' },

  // EXTRAS

  { id:'cr_x1',  name:'SHARD SPIRE',      tier:'I',  tierLabel:'CRYSTAL SHARD',    zone:'t1_fan', edges:{n:5,s:5,e:5,w:6}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/crystallis/extra_a.png' },

  { id:'cr_x2',  name:'LENS BATTERY',     tier:'II', tierLabel:'RESONANCE ARRAY',  zone:'flanker',    edges:{n:5,s:3,e:4,w:9}, power:2, ability:'revenge', abilityText:'No special ability', art:'assets/cards/crystallis/t2_b.png' },

  { id:'cr_x3',  name:'CRYSTAL LANCE',    tier:'III',tierLabel:'PRISM LANCE',      zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'density', abilityText:'No special ability', art:'assets/cards/crystallis/t3_b.png' },

];

// ── MYCOS DECK: Fungal Bloom Collective ──────────────────────────

// Theme: spore anchors (T1) → mycelium webs (T2) → bloom surges (T3) → The Mycelord (T4)

// Edge profile: balanced all edges, notably good S (spreads backward too)

const MYCOS_CARDS = [

  // T1: SPORE ANCHORS (sum 15-16, power 1): balanced with strong S

  { id:'my_t1a', name:'SPORE ANCHOR',     tier:'I',  tierLabel:'SPORE ANCHOR',     zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/mycos/t1_a.png' },

  { id:'my_t1b', name:'FUNGAL GROWTH',    tier:'I',  tierLabel:'SPORE ANCHOR',     zone:'t1_fan', edges:{n:7,s:3,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/mycos/t1_b.png' },

  { id:'my_t1c', name:'BLOOM SEED',       tier:'I',  tierLabel:'SPORE ANCHOR',     zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/mycos/t1_c.png' },

  { id:'my_t1d', name:'MYCO WALL',        tier:'I',  tierLabel:'SPORE ANCHOR',     zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/mycos/t1_a.png' },

  { id:'my_t1e', name:'HYPHAE RING',      tier:'I',  tierLabel:'SPORE ANCHOR',     zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/mycos/t1_c.png' },

  // T2: MYCELIUM WEBS (sum 19-22, power 2): balanced with notable S

  { id:'my_t2a', name:'MYCELIUM WEB',     tier:'II', tierLabel:'MYCELIUM WEB',     zone:'command',    edges:{n:5,s:3,e:6,w:5}, power:2, ability:'lamb', abilityText:'No special ability', art:'assets/cards/mycos/t2_a.png' },

  { id:'my_t2b', name:'SPORE CLOUD',      tier:'II', tierLabel:'MYCELIUM WEB',     zone:'launch',     edges:{n:4,s:4,e:6,w:5}, power:2, ability:'intimidate', abilityText:'No special ability', art:'assets/cards/mycos/t2_b.png' },

  { id:'my_t2c', name:'TENDRIL SURGE',    tier:'II', tierLabel:'MYCELIUM WEB',     zone:'flanker',    edges:{n:3,s:3,e:8,w:5}, power:2, ability:'home_invader', abilityText:'No special ability', art:'assets/cards/mycos/t2_c.png' },

  // T3: BLOOM SURGES (sum 19-22, power 3): balanced with notable S

  { id:'my_t3a', name:'BLOOM SURGE',      tier:'III',tierLabel:'BLOOM SURGE',      zone:'lance',      edges:{n:7,s:3,e:6,w:5}, power:3, ability:'birthright', abilityText:'No special ability', art:'assets/cards/mycos/t3_a.png' },

  { id:'my_t3b', name:'SPORE STRIKER',    tier:'III',tierLabel:'BLOOM SURGE',      zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:3, ability:'lamb', abilityText:'No special ability', art:'assets/cards/mycos/t3_b.png' },

  { id:'my_t3c', name:'MOLD LANCE',       tier:'III',tierLabel:'BLOOM SURGE',      zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:3, ability:'intimidate', abilityText:'No special ability', art:'assets/cards/mycos/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): balanced across all

  { id:'my_t4',  name:'THE MYCELORD',     tier:'IV', tierLabel:'MYCELORD',         zone:'dreadnaught',edges:{n:8,s:6,e:7,w:7}, power:4, ability:'home_invader', abilityText:'No special ability', art:'assets/cards/mycos/t4.png' },

  // EXTRAS

  { id:'my_x1',  name:'FUNGAL NODE',      tier:'I',  tierLabel:'SPORE ANCHOR',     zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/mycos/extra_a.png' },

  { id:'my_x2',  name:'BLOOM BATTERY',    tier:'II', tierLabel:'MYCELIUM WEB',     zone:'command',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'birthright', abilityText:'No special ability', art:'assets/cards/mycos/t2_a.png' },

  { id:'my_x3',  name:'SPORE BLADE',      tier:'III',tierLabel:'BLOOM SURGE',      zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'lamb', abilityText:'No special ability', art:'assets/cards/mycos/t3_b.png' },

];

// ── VEIL DECK: Photon Veil Ascendancy ────────────────────────────

// Theme: light anchors (T1) → shimmer screens (T2) → null lances (T3) → The Refraction (T4)

// Edge profile: very high N (9s), very low S (1-2): glass cannon feast-or-famine

const VEIL_CARDS = [

  // T1: LIGHT ANCHORS (sum 15-16, power 1): extreme N, minimal S

  { id:'vl_t1a', name:'LIGHT ANCHOR',     tier:'I',  tierLabel:'LIGHT ANCHOR',     zone:'t1_fan', edges:{n:8,s:2,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/veil/t1_a.png' },

  { id:'vl_t1b', name:'PHASE NODE',       tier:'I',  tierLabel:'LIGHT ANCHOR',     zone:'t1_fan', edges:{n:8,s:2,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/veil/t1_b.png' },

  { id:'vl_t1c', name:'SHIMMER POINT',    tier:'I',  tierLabel:'LIGHT ANCHOR',     zone:'t1_fan', edges:{n:7,s:2,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/veil/t1_c.png' },

  { id:'vl_t1d', name:'VEIL WALL',        tier:'I',  tierLabel:'LIGHT ANCHOR',     zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/veil/t1_a.png' },

  { id:'vl_t1e', name:'PHOTON RING',      tier:'I',  tierLabel:'LIGHT ANCHOR',     zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/veil/t1_c.png' },

  // T2: SHIMMER SCREENS (sum 19-22, power 2): extreme N, minimal S

  { id:'vl_t2a', name:'SHIMMER SCREEN',   tier:'II', tierLabel:'SHIMMER SCREEN',   zone:'command',    edges:{n:9,s:3,e:5,w:6}, power:2, ability:'flank', abilityText:'No special ability', art:'assets/cards/veil/t2_a.png' },

  { id:'vl_t2b', name:'PHASE WING',       tier:'II', tierLabel:'SHIMMER SCREEN',   zone:'launch',     edges:{n:9,s:3,e:4,w:7}, power:2, ability:'phantom', abilityText:'No special ability', art:'assets/cards/veil/t2_b.png' },

  { id:'vl_t2c', name:'CLOAK ARRAY',      tier:'II', tierLabel:'SHIMMER SCREEN',   zone:'flanker',    edges:{n:7,s:3,e:4,w:9}, power:2, ability:'pierce', abilityText:'No special ability', art:'assets/cards/veil/t2_c.png' },

  // T3: NULL LANCES (sum 19-22, power 3): extreme N, near-zero S

  { id:'vl_t3a', name:'NULL LANCE',       tier:'III',tierLabel:'NULL LANCE',       zone:'lance',      edges:{n:7,s:3,e:5,w:6}, power:3, ability:'cloak', abilityText:'No special ability', art:'assets/cards/veil/t3_a.png' },

  { id:'vl_t3b', name:'BLINK STRIKER',    tier:'III',tierLabel:'NULL LANCE',       zone:'flanker',    edges:{n:5,s:3,e:4,w:9}, power:3, ability:'flank', abilityText:'No special ability', art:'assets/cards/veil/t3_b.png' },

  { id:'vl_t3c', name:'PHANTOM BLADE',    tier:'III',tierLabel:'NULL LANCE',       zone:'lance',      edges:{n:5,s:5,e:5,w:6}, power:3, ability:'phantom', abilityText:'No special ability', art:'assets/cards/veil/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): dominant N, fragile rear

  { id:'vl_t4',  name:'THE REFRACTION',   tier:'IV', tierLabel:'REFRACTION',       zone:'dreadnaught',edges:{n:7,s:6,e:7,w:8}, power:4, ability:'pierce', abilityText:'No special ability', art:'assets/cards/veil/t4.png' },

  // EXTRAS

  { id:'vl_x1',  name:'GLIMMER NODE',     tier:'I',  tierLabel:'LIGHT ANCHOR',     zone:'t1_fan', edges:{n:5,s:5,e:5,w:6}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/veil/extra_a.png' },

  { id:'vl_x2',  name:'PHASE BATTERY',    tier:'II', tierLabel:'SHIMMER SCREEN',   zone:'command',    edges:{n:5,s:3,e:4,w:9}, power:2, ability:'cloak', abilityText:'No special ability', art:'assets/cards/veil/t2_a.png' },

  { id:'vl_x3',  name:'GHOST LANCE',      tier:'III',tierLabel:'NULL LANCE',       zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'flank', abilityText:'No special ability', art:'assets/cards/veil/t3_b.png' },

];

// ── ENTROPY DECK: Decay Entropy Dominion ─────────────────────────

// Theme: rust anchors (T1) → corrode clusters (T2) → dissolution lances (T3) → The Collapse (T4)

// Edge profile: high S (strong backward/downward pressure), weak N: unusual/tricky decay race

const ENTROPY_CARDS = [

  // T1: RUST ANCHORS (sum 15-16, power 1): S dominant, weak N

  { id:'en_t1a', name:'RUST ANCHOR',      tier:'I',  tierLabel:'RUST ANCHOR',      zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/entropy/t1_a.png' },

  { id:'en_t1b', name:'DECAY NODE',       tier:'I',  tierLabel:'RUST ANCHOR',      zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/entropy/t1_b.png' },

  { id:'en_t1c', name:'CORRODE POINT',    tier:'I',  tierLabel:'RUST ANCHOR',      zone:'t1_fan', edges:{n:7,s:2,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/entropy/t1_c.png' },

  { id:'en_t1d', name:'ENTROPY WALL',     tier:'I',  tierLabel:'RUST ANCHOR',      zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/entropy/t1_a.png' },

  { id:'en_t1e', name:'DECAY RING',       tier:'I',  tierLabel:'RUST ANCHOR',      zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/entropy/t1_c.png' },

  // T2: CORRODE CLUSTERS (sum 19-22, power 2): S dominant, weak N

  { id:'en_t2a', name:'CORRODE CLUSTER',  tier:'II', tierLabel:'CORRODE CLUSTER',  zone:'command',    edges:{n:6,s:3,e:7,w:5}, power:2, ability:'lamb', abilityText:'No special ability', art:'assets/cards/entropy/t2_a.png' },

  { id:'en_t2b', name:'RUST SURGE',       tier:'II', tierLabel:'CORRODE CLUSTER',  zone:'launch',     edges:{n:7,s:3,e:6,w:5}, power:2, ability:'laser_focus', abilityText:'No special ability', art:'assets/cards/entropy/t2_b.png' },

  { id:'en_t2c', name:'BLIGHT MASS',      tier:'II', tierLabel:'CORRODE CLUSTER',  zone:'command',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'intimidate', abilityText:'No special ability', art:'assets/cards/entropy/t2_c.png' },

  // T3: DISSOLUTION LANCES (sum 19-22, power 3): S dominant, weak N

  { id:'en_t3a', name:'DISSOLUTION LANCE',tier:'III',tierLabel:'DISSOLUTION',      zone:'lance',      edges:{n:7,s:3,e:6,w:5}, power:3, ability:'revenge', abilityText:'No special ability', art:'assets/cards/entropy/t3_a.png' },

  { id:'en_t3b', name:'DECAY STRIKER',    tier:'III',tierLabel:'DISSOLUTION',      zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:3, ability:'lamb', abilityText:'No special ability', art:'assets/cards/entropy/t3_b.png' },

  { id:'en_t3c', name:'ENTROPY BLADE',    tier:'III',tierLabel:'DISSOLUTION',      zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:3, ability:'laser_focus', abilityText:'No special ability', art:'assets/cards/entropy/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): S dominant

  { id:'en_t4',  name:'THE COLLAPSE',     tier:'IV', tierLabel:'COLLAPSE',         zone:'dreadnaught',edges:{n:7,s:6,e:8,w:7}, power:4, ability:'intimidate', abilityText:'No special ability', art:'assets/cards/entropy/t4.png' },

  // EXTRAS

  { id:'en_x1',  name:'RUST NODE',        tier:'I',  tierLabel:'RUST ANCHOR',      zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/entropy/extra_a.png' },

  { id:'en_x2',  name:'BLIGHT BATTERY',   tier:'II', tierLabel:'CORRODE CLUSTER',  zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'revenge', abilityText:'No special ability', art:'assets/cards/entropy/t2_a.png' },

  { id:'en_x3',  name:'DECAY LANCE',      tier:'III',tierLabel:'DISSOLUTION',      zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'laser_focus', abilityText:'No special ability', art:'assets/cards/entropy/t3_b.png' },

];

// ── VOID DECK: Dark Matter Void Collective ────────────────────────

// Theme: null nodes (T1) → dark clusters (T2) → singularity lances (T3) → The Abyss (T4)

// Edge profile: extreme N (9s common), very low W: assassin knife-edge forward thrust

const VOID_CARDS = [

  // T1: NULL NODES (sum 15-16, power 1): extreme N, near-zero W

  { id:'vo_t1a', name:'NULL NODE',        tier:'I',  tierLabel:'NULL NODE',        zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/void/t1_a.png' },

  { id:'vo_t1b', name:'DARK SEED',        tier:'I',  tierLabel:'NULL NODE',        zone:'t1_fan', edges:{n:9,s:2,e:4,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/void/t1_b.png' },

  { id:'vo_t1c', name:'VOID ANCHOR',      tier:'I',  tierLabel:'NULL NODE',        zone:'t1_fan', edges:{n:8,s:2,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/void/t1_c.png' },

  { id:'vo_t1d', name:'EVENT WALL',       tier:'I',  tierLabel:'NULL NODE',        zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/void/t1_a.png' },

  { id:'vo_t1e', name:'GRAVITY RING',     tier:'I',  tierLabel:'NULL NODE',        zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/void/t1_c.png' },

  // T2: DARK CLUSTERS (sum 19-22, power 2): extreme N, very low W

  { id:'vo_t2a', name:'DARK CLUSTER',     tier:'II', tierLabel:'DARK CLUSTER',     zone:'command',    edges:{n:7,s:3,e:7,w:4}, power:2, ability:'rush', abilityText:'No special ability', art:'assets/cards/void/t2_a.png' },

  { id:'vo_t2b', name:'VOID WING',        tier:'II', tierLabel:'DARK CLUSTER',     zone:'launch',     edges:{n:7,s:3,e:6,w:5}, power:2, ability:'pierce', abilityText:'No special ability', art:'assets/cards/void/t2_b.png' },

  { id:'vo_t2c', name:'SHADOW MASS',      tier:'II', tierLabel:'DARK CLUSTER',     zone:'command',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'cloak', abilityText:'No special ability', art:'assets/cards/void/t2_c.png' },

  // T3: SINGULARITY LANCES (sum 19-22, power 3): extreme N, very low W

  { id:'vo_t3a', name:'SINGULARITY LANCE',tier:'III',tierLabel:'SINGULARITY',      zone:'lance',      edges:{n:7,s:3,e:7,w:4}, power:3, ability:'sniper', abilityText:'No special ability', art:'assets/cards/void/t3_a.png' },

  { id:'vo_t3b', name:'VOID STRIKER',     tier:'III',tierLabel:'SINGULARITY',      zone:'flanker',    edges:{n:5,s:3,e:9,w:4}, power:3, ability:'rush', abilityText:'No special ability', art:'assets/cards/void/t3_b.png' },

  { id:'vo_t3c', name:'DARK LANCE',       tier:'III',tierLabel:'SINGULARITY',      zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:3, ability:'pierce', abilityText:'No special ability', art:'assets/cards/void/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): extreme N, notable W gap

  { id:'vo_t4',  name:'THE ABYSS',        tier:'IV', tierLabel:'ABYSS',            zone:'dreadnaught',edges:{n:8,s:6,e:8,w:6}, power:4, ability:'cloak', abilityText:'No special ability', art:'assets/cards/void/t4.png' },

  // EXTRAS

  { id:'vo_x1',  name:'NULL SHARD',       tier:'I',  tierLabel:'NULL NODE',        zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/void/extra_a.png' },

  { id:'vo_x2',  name:'SHADOW BATTERY',   tier:'II', tierLabel:'DARK CLUSTER',     zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'sniper', abilityText:'No special ability', art:'assets/cards/void/t2_a.png' },

  { id:'vo_x3',  name:'VOID LANCE',       tier:'III',tierLabel:'SINGULARITY',      zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'rush', abilityText:'No special ability', art:'assets/cards/void/t3_b.png' },

];

// ── GAS DECK: Plasma Storm Sovereignty ───────────────────────────

// Theme: storm cells (T1) → plasma wings (T2) → tempest lances (T3) → The Maelstrom (T4)

// Edge profile: high N AND S (strong both vertically), weak E/W: volatile omni-vertical plasma

const GAS_CARDS = [

  // T1: STORM CELLS (sum 15-16, power 1): high N+S, weak E/W

  { id:'gs_t1a', name:'STORM CELL',       tier:'I',  tierLabel:'STORM CELL',       zone:'t1_fan', edges:{n:8,s:3,e:4,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/gas/t1_a.png' },

  { id:'gs_t1b', name:'PLASMA NODE',      tier:'I',  tierLabel:'STORM CELL',       zone:'t1_fan', edges:{n:8,s:3,e:4,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/gas/t1_b.png' },

  { id:'gs_t1c', name:'ION SEED',         tier:'I',  tierLabel:'STORM CELL',       zone:'t1_fan', edges:{n:7,s:3,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/gas/t1_c.png' },

  { id:'gs_t1d', name:'STORM WALL',       tier:'I',  tierLabel:'STORM CELL',       zone:'t1_thrust',       edges:{n:8,s:5,e:4,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/gas/t1_a.png' },

  { id:'gs_t1e', name:'PLASMA RING',      tier:'I',  tierLabel:'STORM CELL',       zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/gas/t1_c.png' },

  // T2: PLASMA WINGS (sum 19-22, power 2): high N+S, weak E/W

  { id:'gs_t2a', name:'PLASMA WING',      tier:'II', tierLabel:'PLASMA WING',      zone:'launch',     edges:{n:6,s:4,e:5,w:5}, power:2, ability:'deciding_factor', abilityText:'No special ability', art:'assets/cards/gas/t2_a.png' },

  { id:'gs_t2b', name:'ION SURGE',        tier:'II', tierLabel:'PLASMA WING',      zone:'command',    edges:{n:5,s:5,e:5,w:5}, power:2, ability:'rush', abilityText:'No special ability', art:'assets/cards/gas/t2_b.png' },

  { id:'gs_t2c', name:'STORM MASS',       tier:'II', tierLabel:'PLASMA WING',      zone:'flanker',    edges:{n:4,s:4,e:7,w:5}, power:2, ability:'home_invader', abilityText:'No special ability', art:'assets/cards/gas/t2_c.png' },

  // T3: TEMPEST LANCES (sum 19-22, power 3): high N+S, weak E/W

  { id:'gs_t3a', name:'TEMPEST LANCE',    tier:'III',tierLabel:'TEMPEST LANCE',    zone:'lance',      edges:{n:7,s:4,e:5,w:5}, power:3, ability:'double_strike', abilityText:'No special ability', art:'assets/cards/gas/t3_a.png' },

  { id:'gs_t3b', name:'GALE STRIKER',     tier:'III',tierLabel:'TEMPEST LANCE',    zone:'flanker',    edges:{n:5,s:4,e:7,w:5}, power:3, ability:'deciding_factor', abilityText:'No special ability', art:'assets/cards/gas/t3_b.png' },

  { id:'gs_t3c', name:'PLASMA BLADE',     tier:'III',tierLabel:'TEMPEST LANCE',    zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:3, ability:'rush', abilityText:'No special ability', art:'assets/cards/gas/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): strong N+S vertical axis

  { id:'gs_t4',  name:'THE MAELSTROM',    tier:'IV', tierLabel:'MAELSTROM',        zone:'dreadnaught',edges:{n:7,s:7,e:7,w:7}, power:4, ability:'home_invader', abilityText:'No special ability', art:'assets/cards/gas/t4.png' },

  // EXTRAS

  { id:'gs_x1',  name:'ION NODE',         tier:'I',  tierLabel:'STORM CELL',       zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/gas/extra_a.png' },

  { id:'gs_x2',  name:'STORM BATTERY',    tier:'II', tierLabel:'PLASMA WING',      zone:'command',    edges:{n:5,s:4,e:7,w:5}, power:2, ability:'double_strike', abilityText:'No special ability', art:'assets/cards/gas/t2_b.png' },

  { id:'gs_x3',  name:'GALE LANCE',       tier:'III',tierLabel:'TEMPEST LANCE',    zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'deciding_factor', abilityText:'No special ability', art:'assets/cards/gas/t3_b.png' },

];

// ── LITHOS DECK: Stone Geological Dominion ───────────────────────

// Theme: stone anchors (T1) → tectonic walls (T2) → seismic lances (T3): The Monolith (T4)

// Edge profile: very high W AND E (dominant flanks), moderate N, low S: geological fortress

const LITHOS_CARDS = [

  // T1: STONE ANCHORS (sum 15-16, power 1): W/E very high, moderate N, low S

  { id:'li_t1a', name:'STONE ANCHOR',     tier:'I',  tierLabel:'STONE ANCHOR',     zone:'t1_fan', edges:{n:8,s:2,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/lithos/t1_a.png' },

  { id:'li_t1b', name:'ROCK NODE',        tier:'I',  tierLabel:'STONE ANCHOR',     zone:'t1_fan', edges:{n:7,s:2,e:4,w:6}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/lithos/t1_b.png' },

  { id:'li_t1c', name:'BASALT POINT',     tier:'I',  tierLabel:'STONE ANCHOR',     zone:'t1_fan', edges:{n:8,s:2,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/lithos/t1_c.png' },

  { id:'li_t1d', name:'TECTONIC WALL',    tier:'I',  tierLabel:'STONE ANCHOR',     zone:'t1_thrust',       edges:{n:7,s:5,e:4,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/lithos/t1_a.png' },

  { id:'li_t1e', name:'GEODE RING',       tier:'I',  tierLabel:'STONE ANCHOR',     zone:'t1_spread',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/lithos/t1_c.png' },

  // T2: TECTONIC WALLS (sum 19-22, power 2): W/E very high, moderate N, low S

  { id:'li_t2a', name:'TECTONIC CLUSTER', tier:'II', tierLabel:'TECTONIC CLUSTER', zone:'command',    edges:{n:8,s:3,e:5,w:7}, power:2, ability:'deciding_factor', abilityText:'No special ability', art:'assets/cards/lithos/t2_a.png' },

  { id:'li_t2b', name:'QUAKE SURGE',      tier:'II', tierLabel:'TECTONIC CLUSTER', zone:'launch',     edges:{n:9,s:3,e:4,w:7}, power:2, ability:'commander', abilityText:'No special ability', art:'assets/cards/lithos/t2_b.png' },

  { id:'li_t2c', name:'BASALT MASS',      tier:'II', tierLabel:'TECTONIC CLUSTER', zone:'command',    edges:{n:7,s:3,e:4,w:9}, power:2, ability:'fortify', abilityText:'No special ability', art:'assets/cards/lithos/t2_c.png' },

  // T3: SEISMIC LANCES (sum 19-22, power 3): W/E very high, moderate N, low S

  { id:'li_t3a', name:'SEISMIC LANCE',    tier:'III',tierLabel:'SEISMIC LANCE',    zone:'lance',      edges:{n:7,s:3,e:5,w:6}, power:3, ability:'shield', abilityText:'No special ability', art:'assets/cards/lithos/t3_a.png' },

  { id:'li_t3b', name:'ROCK STRIKER',     tier:'III',tierLabel:'SEISMIC LANCE',    zone:'flanker',    edges:{n:5,s:3,e:4,w:9}, power:3, ability:'deciding_factor', abilityText:'No special ability', art:'assets/cards/lithos/t3_b.png' },

  { id:'li_t3c', name:'GRAVEL BLADE',     tier:'III',tierLabel:'SEISMIC LANCE',    zone:'lance',      edges:{n:5,s:5,e:4,w:7}, power:3, ability:'commander', abilityText:'No special ability', art:'assets/cards/lithos/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): dominant flanks, solid N, weak S

  { id:'li_t4',  name:'THE MONOLITH',     tier:'IV', tierLabel:'MONOLITH',         zone:'dreadnaught',edges:{n:7,s:6,e:6,w:9}, power:4, ability:'fortify', abilityText:'No special ability', art:'assets/cards/lithos/t4.png' },

  // EXTRAS

  { id:'li_x1',  name:'FLINT NODE',       tier:'I',  tierLabel:'STONE ANCHOR',     zone:'t1_fan', edges:{n:5,s:5,e:5,w:6}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/lithos/extra_a.png' },

  { id:'li_x2',  name:'SLATE BATTERY',    tier:'II', tierLabel:'TECTONIC CLUSTER', zone:'flanker',    edges:{n:5,s:3,e:4,w:9}, power:2, ability:'shield', abilityText:'No special ability', art:'assets/cards/lithos/t2_b.png' },

  { id:'li_x3',  name:'QUAKE LANCE',      tier:'III',tierLabel:'SEISMIC LANCE',    zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'deciding_factor', abilityText:'No special ability', art:'assets/cards/lithos/t3_b.png' },

];

// ── QUANTUM DECK: Superposition Quantum Syndicate ─────────────────

// Theme: probability nodes (T1) → superposed arrays (T2) → wave-collapse lances (T3) → The Observer (T4)

// Edge profile: all edges nearly equal (4-6 range): truly unpredictable, no dominant direction

const QUANTUM_CARDS = [

  // T1: PROBABILITY NODES (sum 15-16, power 1): all edges 3-5, tightly grouped

  { id:'qu_t1a', name:'PROBABILITY NODE', tier:'I',  tierLabel:'PROB NODE',        zone:'t1_fan', edges:{n:7,s:3,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/quantum/t1_a.png' },

  { id:'qu_t1b', name:'SUPERPOSED SEED',  tier:'I',  tierLabel:'PROB NODE',        zone:'t1_fan', edges:{n:7,s:3,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/quantum/t1_b.png' },

  { id:'qu_t1c', name:'QUBIT ANCHOR',     tier:'I',  tierLabel:'PROB NODE',        zone:'t1_fan', edges:{n:7,s:3,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/quantum/t1_c.png' },

  { id:'qu_t1d', name:'ENTANGLE WALL',    tier:'I',  tierLabel:'PROB NODE',        zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/quantum/t1_a.png' },

  { id:'qu_t1e', name:'SPIN RING',        tier:'I',  tierLabel:'PROB NODE',        zone:'t1_spread',  edges:{n:6,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/quantum/t1_c.png' },

  // T2: SUPERPOSED ARRAYS (sum 19-22, power 2): all edges 5-6, tightly grouped

  { id:'qu_t2a', name:'SUPERPOSED ARRAY', tier:'II', tierLabel:'SUPERPOSED ARRAY', zone:'command',    edges:{n:5,s:4,e:6,w:5}, power:2, ability:'density', abilityText:'No special ability', art:'assets/cards/quantum/t2_a.png' },

  { id:'qu_t2b', name:'QUBIT WING',       tier:'II', tierLabel:'SUPERPOSED ARRAY', zone:'launch',     edges:{n:5,s:4,e:5,w:6}, power:2, ability:'flank', abilityText:'No special ability', art:'assets/cards/quantum/t2_b.png' },

  { id:'qu_t2c', name:'ENTANGLE MASS',    tier:'II', tierLabel:'SUPERPOSED ARRAY', zone:'flanker',    edges:{n:4,s:4,e:7,w:5}, power:2, ability:'phantom', abilityText:'No special ability', art:'assets/cards/quantum/t2_c.png' },

  // T3: WAVE-COLLAPSE LANCES (sum 19-22, power 3): all edges 5-6, tightly grouped

  { id:'qu_t3a', name:'WAVEFORM LANCE',   tier:'III',tierLabel:'WAVEFORM LANCE',   zone:'lance',      edges:{n:6,s:4,e:6,w:5}, power:3, ability:'sniper', abilityText:'No special ability', art:'assets/cards/quantum/t3_a.png' },

  { id:'qu_t3b', name:'COLLAPSE STRIKER', tier:'III',tierLabel:'WAVEFORM LANCE',   zone:'flanker',    edges:{n:5,s:4,e:7,w:5}, power:3, ability:'density', abilityText:'No special ability', art:'assets/cards/quantum/t3_b.png' },

  { id:'qu_t3c', name:'QUBIT BLADE',      tier:'III',tierLabel:'WAVEFORM LANCE',   zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:3, ability:'flank', abilityText:'No special ability', art:'assets/cards/quantum/t3_b.png' },

  // T4: FLAGSHIP (sum 28, power 4): perfectly equal all directions

  { id:'qu_t4',  name:'THE OBSERVER',     tier:'IV', tierLabel:'OBSERVER',         zone:'dreadnaught',edges:{n:7,s:7,e:7,w:7}, power:4, ability:'phantom', abilityText:'No special ability', art:'assets/cards/quantum/t4.png' },

  // EXTRAS

  { id:'qu_x1',  name:'SPIN NODE',        tier:'I',  tierLabel:'PROB NODE',        zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/quantum/extra_a.png' },

  { id:'qu_x2',  name:'QUBIT BATTERY',    tier:'II', tierLabel:'SUPERPOSED ARRAY', zone:'command',    edges:{n:5,s:4,e:7,w:5}, power:2, ability:'sniper', abilityText:'No special ability', art:'assets/cards/quantum/t2_a.png' },

  { id:'qu_x3',  name:'COLLAPSE LANCE',   tier:'III',tierLabel:'WAVEFORM LANCE',   zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'density', abilityText:'No special ability', art:'assets/cards/quantum/t3_a.png' },

];

// ── CHOIR DECK: Sound Resonance Choir ────────────────────────────

// Theme: harmonic nodes (T1) → resonance choirs (T2) → sonic lances (T3) → The Crescendo (T4)

// Edge profile: high E specifically (right-flank dominant), moderate N and W, lower S

const CHOIR_CARDS = [

  // T1: HARMONIC NODES (sum 15-16, power 1): E dominant, moderate N/W, lower S

  { id:'ch_t1a', name:'HARMONIC NODE',    tier:'I',  tierLabel:'HARMONIC NODE',    zone:'t1_fan', edges:{n:8,s:2,e:6,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/choir/t1_a.png' },

  { id:'ch_t1b', name:'RESONANCE SEED',   tier:'I',  tierLabel:'HARMONIC NODE',    zone:'t1_fan', edges:{n:8,s:2,e:6,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/choir/t1_b.png' },

  { id:'ch_t1c', name:'SONIC ANCHOR',     tier:'I',  tierLabel:'HARMONIC NODE',    zone:'t1_fan', edges:{n:7,s:2,e:6,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/choir/t1_c.png' },

  { id:'ch_t1d', name:'TONE WALL',        tier:'I',  tierLabel:'HARMONIC NODE',    zone:'t1_thrust',       edges:{n:7,s:5,e:5,w:4}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/choir/t1_a.png' },

  { id:'ch_t1e', name:'CHOIR RING',       tier:'I',  tierLabel:'HARMONIC NODE',    zone:'t1_spread',  edges:{n:4,s:4,e:5,w:3}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/choir/t1_b.png' },

  // T2: RESONANCE CHOIRS (sum 19-22, power 2): E dominant, moderate N/W, lower S

  { id:'ch_t2a', name:'RESONANCE CHOIR',  tier:'II', tierLabel:'RESONANCE CHOIR',  zone:'command',    edges:{n:6,s:3,e:7,w:5}, power:2, ability:'commander', abilityText:'No special ability', art:'assets/cards/choir/t2_a.png' },

  { id:'ch_t2b', name:'HARMONIC SURGE',   tier:'II', tierLabel:'RESONANCE CHOIR',  zone:'launch',     edges:{n:7,s:3,e:6,w:5}, power:2, ability:'flank', abilityText:'No special ability', art:'assets/cards/choir/t2_b.png' },

  { id:'ch_t2c', name:'SONIC MASS',       tier:'II', tierLabel:'RESONANCE CHOIR',  zone:'flanker',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'cloak', abilityText:'No special ability', art:'assets/cards/choir/t2_c.png' },

  // T3: SONIC LANCES (sum 19-22, power 3): E dominant, moderate N/W, lower S

  { id:'ch_t3a', name:'SONIC LANCE',      tier:'III',tierLabel:'SONIC LANCE',      zone:'lance',      edges:{n:7,s:3,e:6,w:5}, power:3, ability:'birthright', abilityText:'No special ability', art:'assets/cards/choir/t3_a.png' },

  { id:'ch_t3b', name:'TONE STRIKER',     tier:'III',tierLabel:'SONIC LANCE',      zone:'flanker',    edges:{n:5,s:3,e:9,w:4}, power:3, ability:'commander', abilityText:'No special ability', art:'assets/cards/choir/t3_b.png' },

  { id:'ch_t3c', name:'DISCORD BLADE',    tier:'III',tierLabel:'SONIC LANCE',      zone:'lance',      edges:{n:5,s:5,e:6,w:5}, power:3, ability:'flank', abilityText:'No special ability', art:'assets/cards/choir/t3_a.png' },

  // T4: FLAGSHIP (sum 28, power 4): E dominant flanking resonance

  { id:'ch_t4',  name:'THE CRESCENDO',    tier:'IV', tierLabel:'CRESCENDO',        zone:'dreadnaught',edges:{n:7,s:6,e:9,w:6}, power:4, ability:'cloak', abilityText:'No special ability', art:'assets/cards/choir/t4.png' },

  // EXTRAS

  { id:'ch_x1',  name:'TONE NODE',        tier:'I',  tierLabel:'HARMONIC NODE',    zone:'t1_fan', edges:{n:5,s:5,e:6,w:5}, power:1, ability:null, abilityText:'No special ability', art:'assets/cards/choir/extra_a.png' },

  { id:'ch_x2',  name:'CHORD BATTERY',    tier:'II', tierLabel:'RESONANCE CHOIR',  zone:'command',    edges:{n:5,s:3,e:8,w:5}, power:2, ability:'birthright', abilityText:'No special ability', art:'assets/cards/choir/t2_b.png' },

  { id:'ch_x3',  name:'SONIC BLADE',      tier:'III',tierLabel:'SONIC LANCE',      zone:'lance',      edges:{n:3,s:8,e:5,w:5}, power:3, ability:'commander', abilityText:'No special ability', art:'assets/cards/choir/t3_b.png' },

];

// ── CARD DEFINITIONS: TERRAN ACCORD ─────────────────────────────

// Design rule: strong in attack direction = weak in opposite (rear S low on forward cards)

// N=forward toward enemy | S=rear weakness | E/W=flanks

const PLAYER_CARDS = [

  // T1: COLONY WORLDS (anchors; balanced but slight directional bias, rear always weak)

  { id:'ta_t1a', name:'COLONY WORLD A', tier:'I',  tierLabel:'COLONY WORLD', zone:'t1_fan',  edges:{n:8,s:2,e:5,w:4}, power:1, ability:null,            abilityText:'Basic Colony World', art:'assets/cards/terran/colony-world-a.png' },

  { id:'ta_t1b', name:'COLONY WORLD B', tier:'I',  tierLabel:'COLONY WORLD', zone:'t1_fan',  edges:{n:7,s:2,e:5,w:5}, power:1, ability:null,            abilityText:'Basic Colony World', art:'assets/cards/terran/colony-world-b.png' },

  { id:'ta_t1c', name:'COLONY WORLD C', tier:'I',  tierLabel:'COLONY WORLD', zone:'t1_fan',  edges:{n:8,s:2,e:5,w:4}, power:1, ability:null,            abilityText:'Basic Colony World', art:'assets/cards/terran/colony-world-c.png' },

  { id:'ta_t1d', name:'FRONTIER POST', tier:'I',  tierLabel:'COLONY WORLD', zone:'t1_thrust',        edges:{n:7,s:5,e:5,w:4}, power:1, ability:null,        abilityText:'No special ability', art:'assets/cards/terran/frontier-post.png' },

  { id:'ta_t1e', name:'SUPPLY HUB',    tier:'I',  tierLabel:'COLONY WORLD', zone:'t1_spread',   edges:{n:6,s:4,e:5,w:5}, power:2, ability:null,     abilityText:'No special ability', art:'assets/cards/terran/supply-hub.png' },

  // T2: BATTLE GROUPS

  { id:'ta_t2a', name:'BATTLE GROUP',  tier:'II', tierLabel:'BATTLE GROUP', zone:'command',     edges:{n:6,s:3,e:6,w:5}, power:3, ability:'commander',     abilityText:'No special ability', art:'assets/cards/terran/battle-group.png' },

  { id:'ta_t2b', name:'CARRIER WING',  tier:'II', tierLabel:'BATTLE GROUP', zone:'launch',      edges:{n:6,s:3,e:5,w:6}, power:3, ability:'flank', abilityText:'No special ability', art:'assets/cards/terran/carrier-wing.png' },

  { id:'ta_t2c', name:'STRIKE FORCE',  tier:'II', tierLabel:'BATTLE GROUP', zone:'lance',       edges:{n:4,s:3,e:8,w:5}, power:2, ability:'shield', abilityText:'No special ability', art:'assets/cards/terran/strike-force.png' },

  // T3: FIGHTERS

  { id:'ta_t3a', name:'INTERCEPTOR',   tier:'III',tierLabel:'STRIKE CRAFT', zone:'lance',       edges:{n:7,s:3,e:6,w:5}, power:3, ability:'double_strike', abilityText:'No special ability', art:'assets/cards/terran/interceptor.png' },

  { id:'ta_t3b', name:'FAST RUNNER',   tier:'III',tierLabel:'STRIKE CRAFT', zone:'flanker',     edges:{n:5,s:3,e:8,w:5}, power:2, ability:'commander',         abilityText:'No special ability', art:'assets/cards/terran/fast-runner.png' },

  { id:'ta_t3c', name:'FLANKER',       tier:'III',tierLabel:'STRIKE CRAFT', zone:'flanker',     edges:{n:5,s:5,e:6,w:5}, power:2, ability:'flank',        abilityText:'No special ability', art:'assets/cards/terran/flanker.png' },

  // T4: FLAGSHIP

  { id:'ta_t4',  name:'THE ACCORD',    tier:'IV', tierLabel:'DREADNAUGHT',  zone:'dreadnaught', edges:{n:7,s:6,e:8,w:7}, power:4, ability:'shield',         abilityText:'No special ability', art:'assets/cards/terran/the-accord.png' },

  // EXTRA

  { id:'ta_x1', name:'MINING COLONY', tier:'I',   tierLabel:'COLONY WORLD', zone:'t1_fan',  edges:{n:5,s:5,e:6,w:5}, power:1, ability:null,            abilityText:'Basic Colony World: pure foundation', art:'assets/cards/terran/colony-world-a.png' },

  { id:'ta_x2', name:'GUNSHIP WING',  tier:'II',  tierLabel:'BATTLE GROUP', zone:'command',     edges:{n:5,s:3,e:8,w:5}, power:3, ability:'double_strike',     abilityText:'No special ability', art:'assets/cards/terran/battle-group.png' },

  { id:'ta_x3', name:'GHOST RUNNER',  tier:'III', tierLabel:'STRIKE CRAFT', zone:'lance',       edges:{n:3,s:8,e:5,w:5}, power:2, ability:'commander',        abilityText:'No special ability', art:'assets/cards/terran/fast-runner.png' },

];

const AI_CARDS = [

  { id:'a1',  name:'FANG',    tier:'I',   edges:{n:6,s:5,e:5,w:6}, power:2, ability:null,            abilityText:'Basic card' },

  { id:'a2',  name:'FANG',    tier:'I',   edges:{n:6,s:5,e:4,w:7}, power:2, ability:null,            abilityText:'Basic card' },

  { id:'a3',  name:'FANG',    tier:'I',   edges:{n:5,s:4,e:5,w:4}, power:2, ability:null,            abilityText:'Basic card' },

  { id:'a4',  name:'TOWER',   tier:'I',   edges:{n:5,s:3,e:7,w:7}, power:1, ability:null,        abilityText:'Basic card' },

  { id:'a5',  name:'SHADE',   tier:'I',   edges:{n:6,s:3,e:5,w:6}, power:1, ability:null,       abilityText:'Basic card' },

  { id:'a6',  name:'CRUSH',   tier:'I',   edges:{n:6,s:4,e:6,w:7}, power:2, ability:null, abilityText:'Basic card' },

  { id:'a7',  name:'THORN',   tier:'I',   edges:{n:4,s:5,e:6,w:4}, power:2, ability:null,            abilityText:'Basic card' },

  { id:'a8',  name:'CLAW',    tier:'I',   edges:{n:7,s:3,e:5,w:7}, power:2, ability:null,            abilityText:'Basic card' },

  { id:'a9',  name:'BASTION', tier:'I',   edges:{n:6,s:7,e:4,w:4}, power:1, ability:null,            abilityText:'Basic card' },

  { id:'a10', name:'CLEAVE',  tier:'II',  edges:{n:6,s:7,e:7,w:8}, power:4, ability:null,         abilityText:'Basic card' },

  { id:'a11', name:'RAZOR',   tier:'II',  edges:{n:7,s:6,e:6,w:7}, power:4, ability:null,            abilityText:'High-power Tier II' },

  { id:'a12', name:'AEGIS',   tier:'II',  edges:{n:5,s:8,e:7,w:6}, power:3, ability:null,            abilityText:'High-power Tier II' },

  // Extra AI cards for 15-card deck

  { id:'a13', name:'SPORE',   tier:'I',   edges:{n:6,s:6,e:6,w:5}, power:1, ability:null,            abilityText:'Basic card' },

  { id:'a14', name:'SLASH',   tier:'III', edges:{n:7,s:3,e:8,w:3}, power:3, ability:null,        abilityText:'Basic card' },

  { id:'a15', name:'VENOM',   tier:'III', edges:{n:8,s:4,e:7,w:3}, power:2, ability:null,         abilityText:'Basic card' },

];

// ── COSMIC HAZARD CARDS: neutral obstacles (balanced + aggressive only) ──────

// These are placed on the board at game start. They don't fight edge battles.

// Any player or AI card adjacent to a hazard loses 2 from its effective power in VP scoring.

const HAZARD_CARDS = [

  { id:'hz_bh',  name:'BLACK HOLE',        video:'assets/cards/hazard/black_hole.mp4',        color:'#ff4400' },

  { id:'hz_pp',  name:'PLASMA PULSE',       video:'assets/cards/hazard/plasma_pulse.mp4',       color:'#4488ff' },

  { id:'hz_rg',  name:'RED GIANT',          video:'assets/cards/hazard/red_giant.mp4',          color:'#ff2200' },

  { id:'hz_psr', name:'PULSAR',             video:'assets/cards/hazard/pulsar.mp4',             color:'#88ddff' },

  { id:'hz_td',  name:'TIME DISPLACEMENT',  video:'assets/cards/hazard/time_displacement.mp4',  color:'#aa44ff' },

];
