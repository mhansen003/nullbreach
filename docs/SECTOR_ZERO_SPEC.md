# SECTOR ZERO — Build Specification
*Card battle game built on the NULL//BREACH prototype engine*
*Version: 0.1 Design Spec*

---

## Overview

SECTOR ZERO is a 5×5 grid card battle game. Two players select an **alien race deck** from 10 options and fight for strategic control of a contested space sector.

**Win condition**: Dominate 6 or more of 10 lines (5 rows + 5 columns scored by combined card `power`).

**Lore**: SECTOR ZERO is a gravitational convergence point at the galactic core where 10 alien civilizations' expansion routes all collide. No one chose this conflict — the sector simply is, and every race that found it found each other.

- **Rows** = Transit Corridors (strategic movement)
- **Columns** = Resource Streams (economic dominance)

---

## Architecture Changes from NULL//BREACH

| Feature | NULL//BREACH | SECTOR ZERO |
|---------|-------------|-------------|
| Deck | Fixed (hardcoded) | Race selection screen before game |
| Tiers | 2 (I, II) | 4 (I–IV) |
| Tier display labels | Generic "I", "II" | Race-specific (see RACES config) |
| Player accent color | `#00ffcc` hardcoded | `race.color` from RACES config |
| AI accent color | `#ff0080` hardcoded | Opposing race color |
| Abilities implemented | 4 | 15+ (see Ability Reference) |
| Card count per deck | 12 | 12 (5 T1 + 3 T2 + 3 T3 + 1 T4) |
| Portrait labels | NETRUNNER_7 / SENTINEL-4 | Race name + race sub-label |

---

## Card Data Structure

```js
{
  id: 'cr_t1a',                 // race prefix + tier + variant letter
  race: 'crystallis',           // matches RACES key
  name: 'CRYSTAL CRADLE',       // displayed on card face
  tier: 'I',                    // I | II | III | IV
  tierLabel: 'WORLD',           // race-specific display label (from RACES.tierLabels)
  edges: { n:5, s:4, e:5, w:4 },
  power: 1,                     // contributes to row/col score
  ability: null,                // string key or null
  abilityText: 'Basic World card'
}
```

---

## Tier Distribution Per Deck (12 cards total)

| Tier | Default Label | Count | Role |
|------|--------------|-------|------|
| I    | WORLD        | 5     | Foundation anchors. 3 share a name (variant edges), 2 unique named. |
| II   | FLEET        | 3     | Mid-range combat. All unique names. |
| III  | FIGHTER      | 3     | Fast/directional. Spiky edge profiles (high one side, low others). |
| IV   | DREADNAUGHT  | 1     | Flagship. Highest power. Strongest ability. |

**Balance target**: Total edge sum per deck ≈ 230–260.
- T1: ~14–24 edges per card, power 1–2
- T2: ~22–29 edges per card, power 2–3
- T3: ~18–24 edges per card (directional), power 2–3
- T4: ~30–36 edges, power 3–4

> Note: Ability strength inversely offsets edge totals. MYCOS DRIFT runs low edges (~205 total) because CORROSIVE + CHAIN + DRAIN are extremely powerful. LITHOS runs high edges (~280) because IMMOVABLE/FORTRESS cards score low power. Playtesting will tune these.

---

## Race Configuration Object

```js
const RACES = {
  crystallis: {
    id: 'crystallis',
    name: 'THE CRYSTALLIS',
    sub: 'SILICON LATTICE CIVILIZATION',
    color: '#a8d8ff',
    tierLabels: { I:'WORLD', II:'FLEET', III:'FIGHTER', IV:'DREADNAUGHT' },
    avatar: '💎',
    quote: '"You will fracture against us."'
  },
  mycos: {
    id: 'mycos',
    name: 'THE MYCOS DRIFT',
    sub: 'DISTRIBUTED FUNGAL INTELLIGENCE',
    color: '#9dcf6e',
    tierLabels: { I:'BLOOM WORLD', II:'TENDRIL MASS', III:'SPORE BURST', IV:'FRUITING BODY' },
    avatar: '🍄',
    quote: '"We have already begun."'
  },
  veil: {
    id: 'veil',
    name: 'THE VEIL',
    sub: 'COHERENT LIGHT ENTITIES',
    color: '#fff5a0',
    tierLabels: { I:'NODE', II:'ARRAY', III:'SPIKE', IV:'CONVERGENCE' },
    avatar: '✦',
    quote: '"You cannot strike what you cannot see."'
  },
  entropy: {
    id: 'entropy',
    name: 'THE ENTROPY CULT',
    sub: 'ANCIENT DECAY WORSHIPPERS',
    color: '#c4723a',
    tierLabels: { I:'DYING STAR', II:'RUST ARMADA', III:'DECAY SEEKER', IV:'FINAL MASS' },
    avatar: '☄',
    quote: '"Everything ends. We simply hasten it."'
  },
  brood: {
    id: 'brood',
    name: 'THE BROOD SOVEREIGN',
    sub: 'INSECTOID HIVE-MIND',
    color: '#88cc44',
    tierLabels: { I:'HIVE NODE', II:'WARRIOR CLUSTER', III:'SKIMMER', IV:'SOVEREIGN' },
    avatar: '🪲',
    quote: '"The Sovereign sees through ten thousand eyes."'
  },
  void: {
    id: 'void',
    name: 'THE VOID HUNTERS',
    sub: 'DARK MATTER PREDATORS',
    color: '#9b59b6',
    tierLabels: { I:'SHADOW ANCHOR', II:'DARK RUNNER', III:'NULL BLADE', IV:'THE HUNGER' },
    avatar: '▪',
    quote: '"We come from the dark between stars."'
  },
  gas: {
    id: 'gas',
    name: 'THE GAS NOMADS',
    sub: 'PLASMA STORM BEINGS',
    color: '#ffd700',
    tierLabels: { I:'STORM PLANET', II:'TEMPEST WING', III:'ARC NODE', IV:'GREAT STORM' },
    avatar: '⚡',
    quote: '"You have angered the storm."'
  },
  lithos: {
    id: 'lithos',
    name: 'THE LITHOS',
    sub: 'GEOLOGICAL ANCIENTS',
    color: '#a0896a',
    tierLabels: { I:'ANCIENT CORE', II:'DRIFTING MASS', III:'STONE SHARD', IV:'THE UNMOVED' },
    avatar: '⬡',
    quote: '"We were here before your stars ignited."'
  },
  quantum: {
    id: 'quantum',
    name: 'THE QUANTUM THREAD',
    sub: 'SUPERPOSITION ENTITIES',
    color: '#ff69b4',
    tierLabels: { I:'PROBABILITY LOCUS', II:'WAVEFORM', III:'COLLAPSED STATE', IV:'THE OBSERVER' },
    avatar: '◈',
    quote: '"We are all possibilities at once."'
  },
  choir: {
    id: 'choir',
    name: 'THE CHOIR',
    sub: 'RESONANT FREQUENCY ENTITIES',
    color: '#c8c8ff',
    tierLabels: { I:'RESONANT', II:'WAVE FORMATION', III:'FREQUENCY SHARD', IV:'DISSONANCE' },
    avatar: '〜',
    quote: '"The note that breaks everything."'
  }
};
```

---

## Ability Reference Table

Implement each ability as a hook. Existing abilities carry over unchanged.

| Key | Name | Hook | Effect |
|-----|------|------|--------|
| `null` | — | — | Basic card, no ability |
| `shield` | SHIELD | onCompareLose | Ignores the first comparison loss (existing) |
| `phantom` | PHANTOM | getValidPlacements | Free placement anywhere in own 2 home rows, no adjacency required (existing) |
| `chain` | CHAIN | onCompareWin | Win cascades — winning card's adjacencies re-evaluate at depth+1 (existing) |
| `double_strike` | DOUBLE STRIKE | onCompareWin | On win, also compare one cell further in same direction (existing) |
| `pierce` | PIERCE | onCompare | Ties count as wins for this card (normally ties = no result) |
| `sweep` | SWEEP | onPlace | Contests all 4 adjacent enemy cards simultaneously on placement |
| `flank` | FLANK | onPlace | Also contests the 4 diagonal neighbors in addition to cardinals |
| `side_swipe` | SIDE SWIPE | onPlace | Reduce adjacent enemy E and W edges by 1 permanently |
| `sunder` | SUNDER | onCompareWin | On win, the losing card's highest edge drops to 1 permanently |
| `drain` | DRAIN | onCompareWin | On win, reduce that enemy card's highest edge by 1 permanently |
| `corrosive` | CORROSIVE | onPlace | All adjacent enemy cards lose 1 from all edges after placement |
| `mirror` | MIRROR | onCompareLose | When opponent wins a comparison against this card, their attacking edge -2 |
| `reflect` | REFLECT | onCompareLose | If opponent beats this card by 3+, their attacking edge loses 1 permanently |
| `shield_aura` | AEGIS | onPlace | Adjacent friendly cards ignore their first comparison loss (aegis variant — use key `aegis`) |
| `bastion` | BASTION | onPlace | Adjacent friendly cards get +1 to their N and S edges |
| `fortress` | FORTRESS | getComparisons | This card cannot be compared while 2+ adjacent friendly cards exist |
| `ward` | WARD | onTargeted | Enemy ability effects cannot target this card |
| `immovable` | IMMOVABLE | onTargeted | Cannot be affected by any ability — only direct edge comparison applies |
| `commander` | COMMANDER | onPlace | Friendly cards of the same tier adjacent to this card get +2 to all edges |
| `boost` | BOOST | onPlace | Adjacent friendly cards get +1 to all edges |
| `synergy` | SYNERGY | getEdges | This card gets +1 to all edges for each adjacent friendly card |
| `momentum` | MOMENTUM | onTurnEnd | Each turn this card remains on board, its power score value +1 |
| `overload` | OVERLOAD | onPlace | This card's edges +2 for this placement turn only |
| `berserk` | BERSERK | onCompareLose | Each time this card loses a comparison, its edges permanently +1 |
| `surge` | SURGE | getEdges | If you're currently losing more rows than opponent, this card gets +3 to all edges |
| `last_stand` | LAST STAND | getEdges | If this is the only friendly card in its row, gets +4 to all edges |
| `rally` | RALLY | onTurnEnd | If any of your comparisons were lost this turn, all your cards get +1 edge next turn |
| `oracle` | ORACLE | onPlace | Reveal the next 2 cards in AI's play order |
| `adaptive` | ADAPTIVE | getEdges | This card's weakest edge copies the highest edge of any adjacent enemy card |
| `rush` | RUSH | getValidPlacements | Can be placed in any cell adjacent to an enemy card, ignoring own territory rule |
| `phase` | PHASE | onPlace | Can be placed in an occupied enemy cell — sends their card back to their hand |
| `ambush` | AMBUSH | onPlace | Placed face-down; edges hidden until enemy card is placed adjacent |
| `ambush_strike` | AMBUSH STRIKE | getEdges | If placed adjacent to 2+ enemy cards, gets +2 to all edges |
| `sacrifice` | SACRIFICE | onPlace | Remove one of your other cards from board — this card gets +3 to all edges |
| `wildcard` | WILDCARD | onPlace | Randomly gains one of 5 random abilities when placed (unknown until played) |

---

## Race 1 — THE CRYSTALLIS

**Identity**: Silicon-lattice beings grown from asteroid fields. Everything built, not manufactured — grown. Defensive anchors, reflection punishment, impossible to erode.
**Playstyle**: Place a cluster, become terrain. Punish aggression. Hard to crack.
**Ability theme**: FORTRESS · BASTION · REFLECT · WARD

```js
const CRYSTALLIS_CARDS = [
  // T1 — WORLD (5 cards)
  { id:'cr_t1a', race:'crystallis', name:'CRYSTAL CRADLE',   tier:'I',  tierLabel:'WORLD',       edges:{n:5,s:4,e:5,w:4}, power:1, ability:null,           abilityText:'Basic World card' },
  { id:'cr_t1b', race:'crystallis', name:'CRYSTAL CRADLE',   tier:'I',  tierLabel:'WORLD',       edges:{n:4,s:5,e:4,w:5}, power:1, ability:null,           abilityText:'Basic World card' },
  { id:'cr_t1c', race:'crystallis', name:'CRYSTAL CRADLE',   tier:'I',  tierLabel:'WORLD',       edges:{n:5,s:5,e:4,w:4}, power:1, ability:null,           abilityText:'Basic World card' },
  { id:'cr_t1d', race:'crystallis', name:'PRISM MOON',       tier:'I',  tierLabel:'WORLD',       edges:{n:6,s:6,e:3,w:3}, power:1, ability:'shield',        abilityText:'SHIELD: Ignores first comparison loss' },
  { id:'cr_t1e', race:'crystallis', name:'LATTICE ANCHOR',   tier:'I',  tierLabel:'WORLD',       edges:{n:5,s:5,e:5,w:5}, power:2, ability:'bastion',       abilityText:'BASTION: Adjacent friendly cards get +1 to N and S edges' },
  // T2 — FLEET (3 cards)
  { id:'cr_t2a', race:'crystallis', name:'REFRACTION ARRAY', tier:'II', tierLabel:'FLEET',       edges:{n:6,s:5,e:7,w:5}, power:3, ability:'reflect',       abilityText:'REFLECT: If opponent beats this by 3+, their attacking edge -1 permanently' },
  { id:'cr_t2b', race:'crystallis', name:'SHARD FORMATION',  tier:'II', tierLabel:'FLEET',       edges:{n:7,s:6,e:5,w:6}, power:3, ability:'ward',          abilityText:'WARD: Enemy ability effects cannot target this card' },
  { id:'cr_t2c', race:'crystallis', name:'PRISMATIC WING',   tier:'II', tierLabel:'FLEET',       edges:{n:6,s:7,e:7,w:5}, power:2, ability:'bastion',       abilityText:'BASTION: Adjacent friendly cards get +1 to N and S edges' },
  // T3 — FIGHTER (3 cards)
  { id:'cr_t3a', race:'crystallis', name:'SHARD LANCE',      tier:'III',tierLabel:'FIGHTER',     edges:{n:8,s:3,e:5,w:4}, power:3, ability:'double_strike', abilityText:'DOUBLE STRIKE: Comparison reaches 2 cells deep in same direction' },
  { id:'cr_t3b', race:'crystallis', name:'CRYSTAL SEEKER',   tier:'III',tierLabel:'FIGHTER',     edges:{n:6,s:4,e:8,w:3}, power:2, ability:'pierce',        abilityText:'PIERCE: Ties count as wins' },
  { id:'cr_t3c', race:'crystallis', name:'PRISMATIC DART',   tier:'III',tierLabel:'FIGHTER',     edges:{n:7,s:4,e:7,w:3}, power:2, ability:'pierce',        abilityText:'PIERCE: Ties count as wins' },
  // T4 — DREADNAUGHT (1 card)
  { id:'cr_t4',  race:'crystallis', name:'THE MONOLITH',     tier:'IV', tierLabel:'DREADNAUGHT', edges:{n:8,s:8,e:7,w:7}, power:4, ability:'fortress',      abilityText:'FORTRESS: Cannot be compared while 2+ adjacent friendly cards exist' },
];
```

---

## Race 2 — THE MYCOS DRIFT

**Identity**: A distributed mycorrhizal intelligence spanning solar systems. No central mind — just network. "Ships" are enormous spore-bearing organisms. Weak individually, exponential in mass.
**Playstyle**: Spread slowly, corrode everything. The longer they sit, the worse it gets for the opponent.
**Ability theme**: CORROSIVE · CHAIN · DRAIN · SYNERGY · MOMENTUM

```js
const MYCOS_CARDS = [
  // T1 — BLOOM WORLD (5 cards)
  { id:'my_t1a', race:'mycos', name:'BLOOM PLANET',    tier:'I',  tierLabel:'BLOOM WORLD',   edges:{n:4,s:3,e:4,w:3}, power:1, ability:null,       abilityText:'Basic Bloom World' },
  { id:'my_t1b', race:'mycos', name:'BLOOM PLANET',    tier:'I',  tierLabel:'BLOOM WORLD',   edges:{n:3,s:4,e:3,w:4}, power:1, ability:null,       abilityText:'Basic Bloom World' },
  { id:'my_t1c', race:'mycos', name:'BLOOM PLANET',    tier:'I',  tierLabel:'BLOOM WORLD',   edges:{n:4,s:4,e:3,w:3}, power:1, ability:null,       abilityText:'Basic Bloom World' },
  { id:'my_t1d', race:'mycos', name:'SPORE CRADLE',    tier:'I',  tierLabel:'BLOOM WORLD',   edges:{n:5,s:5,e:3,w:3}, power:1, ability:'momentum',  abilityText:'MOMENTUM: Each turn this card stays on board, its score value +1' },
  { id:'my_t1e', race:'mycos', name:'MYCEL ANCHOR',    tier:'I',  tierLabel:'BLOOM WORLD',   edges:{n:4,s:4,e:4,w:4}, power:2, ability:'synergy',   abilityText:'SYNERGY: Gets +1 to all edges for each adjacent friendly card' },
  // T2 — TENDRIL MASS (3 cards)
  { id:'my_t2a', race:'mycos', name:'TENDRIL SHIP',    tier:'II', tierLabel:'TENDRIL MASS',  edges:{n:5,s:5,e:5,w:5}, power:2, ability:'corrosive', abilityText:'CORROSIVE: All adjacent enemy cards lose 1 from all edges' },
  { id:'my_t2b', race:'mycos', name:'HYPHAL CLUSTER',  tier:'II', tierLabel:'TENDRIL MASS',  edges:{n:6,s:6,e:5,w:5}, power:3, ability:'chain',     abilityText:'CHAIN: Win cascades — flipped card adjacencies re-evaluate' },
  { id:'my_t2c', race:'mycos', name:'BLOOM CARRIER',   tier:'II', tierLabel:'TENDRIL MASS',  edges:{n:5,s:6,e:6,w:4}, power:2, ability:'synergy',   abilityText:'SYNERGY: Gets +1 to all edges for each adjacent friendly card' },
  // T3 — SPORE BURST (3 cards)
  { id:'my_t3a', race:'mycos', name:'SPORE CLOUD',     tier:'III',tierLabel:'SPORE BURST',   edges:{n:5,s:4,e:7,w:3}, power:2, ability:'corrosive', abilityText:'CORROSIVE: All adjacent enemy cards lose 1 from all edges' },
  { id:'my_t3b', race:'mycos', name:'CORDYCEPS LANCE', tier:'III',tierLabel:'SPORE BURST',   edges:{n:7,s:3,e:5,w:4}, power:3, ability:'drain',     abilityText:'DRAIN: On win, reduce enemy card\'s highest edge by 1 permanently' },
  { id:'my_t3c', race:'mycos', name:'BLOOM SEEKER',    tier:'III',tierLabel:'SPORE BURST',   edges:{n:6,s:4,e:6,w:4}, power:2, ability:'drain',     abilityText:'DRAIN: On win, reduce enemy card\'s highest edge by 1 permanently' },
  // T4 — FRUITING BODY (1 card)
  { id:'my_t4',  race:'mycos', name:'THE FRUITING BODY',tier:'IV',tierLabel:'FRUITING BODY', edges:{n:8,s:7,e:7,w:7}, power:4, ability:'chain',     abilityText:'CHAIN: Win cascades — flipped card adjacencies re-evaluate' },
];
```

---

## Race 3 — THE VEIL

**Identity**: Beings of coherent light who never fully solidify. Visible only when two waveforms cross. Cards look like oscilloscope readouts and interference patterns. Placement is unpredictable and deceptive.
**Playstyle**: Appear where you don't expect. Hit hard in one direction. Vanish and reposition.
**Ability theme**: PHANTOM · PHASE · AMBUSH · ADAPTIVE · ORACLE

```js
const VEIL_CARDS = [
  // T1 — NODE (5 cards)
  { id:'vl_t1a', race:'veil', name:'RESONANCE NODE',    tier:'I',  tierLabel:'NODE',        edges:{n:6,s:2,e:6,w:2}, power:1, ability:null,      abilityText:'Basic Node' },
  { id:'vl_t1b', race:'veil', name:'RESONANCE NODE',    tier:'I',  tierLabel:'NODE',        edges:{n:2,s:6,e:2,w:6}, power:1, ability:null,      abilityText:'Basic Node' },
  { id:'vl_t1c', race:'veil', name:'RESONANCE NODE',    tier:'I',  tierLabel:'NODE',        edges:{n:7,s:2,e:4,w:3}, power:1, ability:null,      abilityText:'Basic Node' },
  { id:'vl_t1d', race:'veil', name:'FOCAL POINT',       tier:'I',  tierLabel:'NODE',        edges:{n:7,s:2,e:5,w:2}, power:1, ability:'phantom',  abilityText:'PHANTOM: Free placement anywhere in own 2 home rows' },
  { id:'vl_t1e', race:'veil', name:'LIGHT ANCHOR',      tier:'I',  tierLabel:'NODE',        edges:{n:5,s:3,e:7,w:3}, power:2, ability:'adaptive', abilityText:'ADAPTIVE: Weakest edge copies highest adjacent enemy edge' },
  // T2 — ARRAY (3 cards)
  { id:'vl_t2a', race:'veil', name:'PHASE ARRAY',       tier:'II', tierLabel:'ARRAY',       edges:{n:7,s:3,e:7,w:5}, power:3, ability:'phase',    abilityText:'PHASE: Can be placed in enemy-occupied cell, sending their card back to hand' },
  { id:'vl_t2b', race:'veil', name:'INTERFERENCE FIELD',tier:'II', tierLabel:'ARRAY',       edges:{n:5,s:7,e:6,w:5}, power:2, ability:'ambush',   abilityText:'AMBUSH: Placed face-down; edges hidden until enemy card is placed adjacent' },
  { id:'vl_t2c', race:'veil', name:'HARMONIC LENS',     tier:'II', tierLabel:'ARRAY',       edges:{n:8,s:3,e:7,w:4}, power:3, ability:'oracle',   abilityText:'ORACLE: Reveal next 2 cards in AI play order' },
  // T3 — SPIKE (3 cards)
  { id:'vl_t3a', race:'veil', name:'COHERENCE SPIKE',   tier:'III',tierLabel:'SPIKE',       edges:{n:9,s:2,e:5,w:3}, power:3, ability:'rush',     abilityText:'RUSH: Can be placed adjacent to any enemy card, ignoring territory rule' },
  { id:'vl_t3b', race:'veil', name:'REFRACTED BLADE',   tier:'III',tierLabel:'SPIKE',       edges:{n:5,s:3,e:9,w:3}, power:2, ability:'pierce',   abilityText:'PIERCE: Ties count as wins' },
  { id:'vl_t3c', race:'veil', name:'PHASE NEEDLE',      tier:'III',tierLabel:'SPIKE',       edges:{n:7,s:3,e:7,w:3}, power:2, ability:'pierce',   abilityText:'PIERCE: Ties count as wins' },
  // T4 — CONVERGENCE (1 card)
  { id:'vl_t4',  race:'veil', name:'THE CONVERGENCE',   tier:'IV', tierLabel:'CONVERGENCE', edges:{n:9,s:8,e:7,w:7}, power:4, ability:'phase',    abilityText:'PHASE: Can be placed in enemy-occupied cell, sending their card back to hand' },
];
```

---

## Race 4 — THE ENTROPY CULT

**Identity**: Ancient beings older than most stars who worship heat death. Beautiful decay — oxidized metals, crumbling magnificence, corroded titanium. They don't fear losing — they planned to lose. And to take everything with them.
**Playstyle**: Start strong. Degrade the entire board. Win by making everyone weaker, including themselves.
**Ability theme**: DRAIN · SUNDER · CORROSIVE · SACRIFICE · MIRROR

```js
const ENTROPY_CARDS = [
  // T1 — DYING STAR (5 cards)
  { id:'en_t1a', race:'entropy', name:'DYING STAR',      tier:'I',  tierLabel:'DYING STAR',   edges:{n:6,s:5,e:5,w:5}, power:1, ability:null,       abilityText:'Basic Dying Star' },
  { id:'en_t1b', race:'entropy', name:'DYING STAR',      tier:'I',  tierLabel:'DYING STAR',   edges:{n:5,s:6,e:5,w:5}, power:1, ability:null,       abilityText:'Basic Dying Star' },
  { id:'en_t1c', race:'entropy', name:'DYING STAR',      tier:'I',  tierLabel:'DYING STAR',   edges:{n:5,s:5,e:6,w:5}, power:1, ability:null,       abilityText:'Basic Dying Star' },
  { id:'en_t1d', race:'entropy', name:'RUST ANCHOR',     tier:'I',  tierLabel:'DYING STAR',   edges:{n:7,s:7,e:4,w:3}, power:1, ability:'mirror',    abilityText:'MIRROR: When opponent wins against this card, their attacking edge -2' },
  { id:'en_t1e', race:'entropy', name:'ENTROPY GATE',    tier:'I',  tierLabel:'DYING STAR',   edges:{n:5,s:5,e:5,w:5}, power:2, ability:'sunder',    abilityText:'SUNDER: On win, the losing card\'s highest edge drops to 1 permanently' },
  // T2 — RUST ARMADA (3 cards)
  { id:'en_t2a', race:'entropy', name:'RUST ARMADA',     tier:'II', tierLabel:'RUST ARMADA',  edges:{n:7,s:6,e:7,w:5}, power:3, ability:'drain',     abilityText:'DRAIN: On win, enemy card\'s highest edge -1 permanently' },
  { id:'en_t2b', race:'entropy', name:'OXIDIZED FLEET',  tier:'II', tierLabel:'RUST ARMADA',  edges:{n:6,s:7,e:6,w:6}, power:3, ability:'corrosive', abilityText:'CORROSIVE: All adjacent enemy cards lose 1 from all edges' },
  { id:'en_t2c', race:'entropy', name:'COLLAPSE ENGINE', tier:'II', tierLabel:'RUST ARMADA',  edges:{n:8,s:6,e:6,w:5}, power:2, ability:'sacrifice',  abilityText:'SACRIFICE: Remove one of your other cards — this card gets +3 to all edges' },
  // T3 — DECAY SEEKER (3 cards)
  { id:'en_t3a', race:'entropy', name:'DECAY SEEKER',    tier:'III',tierLabel:'DECAY SEEKER', edges:{n:8,s:4,e:6,w:4}, power:3, ability:'sunder',    abilityText:'SUNDER: On win, the losing card\'s highest edge drops to 1 permanently' },
  { id:'en_t3b', race:'entropy', name:'ENTROPY BLADE',   tier:'III',tierLabel:'DECAY SEEKER', edges:{n:7,s:4,e:8,w:4}, power:2, ability:'drain',     abilityText:'DRAIN: On win, enemy card\'s highest edge -1 permanently' },
  { id:'en_t3c', race:'entropy', name:'RUST DART',       tier:'III',tierLabel:'DECAY SEEKER', edges:{n:7,s:3,e:7,w:4}, power:2, ability:'drain',     abilityText:'DRAIN: On win, enemy card\'s highest edge -1 permanently' },
  // T4 — FINAL MASS (1 card)
  { id:'en_t4',  race:'entropy', name:'THE FINAL MASS',  tier:'IV', tierLabel:'FINAL MASS',   edges:{n:9,s:9,e:7,w:7}, power:4, ability:'sunder',    abilityText:'SUNDER: On win, the losing card\'s highest edge drops to 1 permanently' },
];
```

---

## Race 5 — THE BROOD SOVEREIGN

**Identity**: Insectoid hive-mind. Chitinous, biomechanical, grown from the bodies of predecessors. Ships are colonies of living bodies fused into hull-shapes. The Sovereign — always singular, always enormous — makes everything around her lethal.
**Playstyle**: Medium edges individually. Terrifying in clusters. Stack COMMANDER bonuses, then SWEEP everything.
**Ability theme**: COMMANDER · BOOST · SWEEP · AMBUSH_STRIKE · RUSH

```js
const BROOD_CARDS = [
  // T1 — HIVE NODE (5 cards)
  { id:'br_t1a', race:'brood', name:'HIVE NODE',        tier:'I',  tierLabel:'HIVE NODE',        edges:{n:4,s:4,e:5,w:5}, power:1, ability:null,          abilityText:'Basic Hive Node' },
  { id:'br_t1b', race:'brood', name:'HIVE NODE',        tier:'I',  tierLabel:'HIVE NODE',        edges:{n:5,s:4,e:4,w:5}, power:1, ability:null,          abilityText:'Basic Hive Node' },
  { id:'br_t1c', race:'brood', name:'HIVE NODE',        tier:'I',  tierLabel:'HIVE NODE',        edges:{n:4,s:5,e:5,w:4}, power:1, ability:null,          abilityText:'Basic Hive Node' },
  { id:'br_t1d', race:'brood', name:'QUEEN CRADLE',     tier:'I',  tierLabel:'HIVE NODE',        edges:{n:3,s:3,e:5,w:5}, power:1, ability:'commander',    abilityText:'COMMANDER: Adjacent friendly cards of same tier get +2 to all edges' },
  { id:'br_t1e', race:'brood', name:'BROOD ANCHOR',     tier:'I',  tierLabel:'HIVE NODE',        edges:{n:5,s:5,e:5,w:5}, power:2, ability:'boost',        abilityText:'BOOST: Adjacent friendly cards get +1 to all edges' },
  // T2 — WARRIOR CLUSTER (3 cards)
  { id:'br_t2a', race:'brood', name:'WARRIOR CLUSTER',  tier:'II', tierLabel:'WARRIOR CLUSTER',  edges:{n:6,s:5,e:6,w:6}, power:3, ability:'commander',    abilityText:'COMMANDER: Adjacent friendly cards of same tier get +2 to all edges' },
  { id:'br_t2b', race:'brood', name:'SOLDIER MASS',     tier:'II', tierLabel:'WARRIOR CLUSTER',  edges:{n:5,s:6,e:7,w:5}, power:3, ability:'boost',        abilityText:'BOOST: Adjacent friendly cards get +1 to all edges' },
  { id:'br_t2c', race:'brood', name:'BIOMECH FLEET',    tier:'II', tierLabel:'WARRIOR CLUSTER',  edges:{n:7,s:5,e:6,w:6}, power:2, ability:'sweep',        abilityText:'SWEEP: Contests all 4 adjacent cells simultaneously on placement' },
  // T3 — SKIMMER (3 cards)
  { id:'br_t3a', race:'brood', name:'SKIMMER',          tier:'III',tierLabel:'SKIMMER',          edges:{n:6,s:4,e:8,w:4}, power:3, ability:'rush',         abilityText:'RUSH: Can be placed adjacent to any enemy card, ignoring territory rule' },
  { id:'br_t3b', race:'brood', name:'VOID SKIMMER',     tier:'III',tierLabel:'SKIMMER',          edges:{n:7,s:4,e:7,w:4}, power:2, ability:'ambush_strike', abilityText:'AMBUSH STRIKE: If placed adjacent to 2+ enemy cards, gets +2 to all edges' },
  { id:'br_t3c', race:'brood', name:'LARVAE STRIKE',    tier:'III',tierLabel:'SKIMMER',          edges:{n:6,s:3,e:7,w:4}, power:2, ability:'ambush_strike', abilityText:'AMBUSH STRIKE: If placed adjacent to 2+ enemy cards, gets +2 to all edges' },
  // T4 — SOVEREIGN (1 card)
  { id:'br_t4',  race:'brood', name:'THE SOVEREIGN',    tier:'IV', tierLabel:'SOVEREIGN',        edges:{n:8,s:8,e:7,w:7}, power:4, ability:'commander',    abilityText:'COMMANDER: Adjacent friendly cards of same tier get +2 to all edges' },
];
```

---

## Race 6 — THE VOID HUNTERS

**Identity**: From the space between galaxies — the true dark. No star, no planet, no home. Defined by absence. Cards are silhouettes — dark shapes against black, visible only by what they occlude. Ships absorb light.
**Playstyle**: Pure aggression. Go deep. Hit hard. Destroy the highest edges first. Win before the opponent establishes defense.
**Ability theme**: DOUBLE_STRIKE · SUNDER · PIERCE · FLANK · SIDE_SWIPE

```js
const VOID_CARDS = [
  // T1 — SHADOW ANCHOR (5 cards)
  { id:'vh_t1a', race:'void', name:'SHADOW ANCHOR',  tier:'I',  tierLabel:'SHADOW ANCHOR', edges:{n:7,s:3,e:7,w:3}, power:1, ability:null,          abilityText:'Basic Shadow Anchor' },
  { id:'vh_t1b', race:'void', name:'SHADOW ANCHOR',  tier:'I',  tierLabel:'SHADOW ANCHOR', edges:{n:3,s:7,e:3,w:7}, power:1, ability:null,          abilityText:'Basic Shadow Anchor' },
  { id:'vh_t1c', race:'void', name:'SHADOW ANCHOR',  tier:'I',  tierLabel:'SHADOW ANCHOR', edges:{n:7,s:3,e:3,w:7}, power:1, ability:null,          abilityText:'Basic Shadow Anchor' },
  { id:'vh_t1d', race:'void', name:'DARK MASS',      tier:'I',  tierLabel:'SHADOW ANCHOR', edges:{n:7,s:4,e:7,w:2}, power:1, ability:'sunder',       abilityText:'SUNDER: On win, the losing card\'s highest edge drops to 1 permanently' },
  { id:'vh_t1e', race:'void', name:'VOID GATE',      tier:'I',  tierLabel:'SHADOW ANCHOR', edges:{n:8,s:2,e:6,w:4}, power:2, ability:'pierce',       abilityText:'PIERCE: Ties count as wins' },
  // T2 — DARK RUNNER (3 cards)
  { id:'vh_t2a', race:'void', name:'DARK RUNNER',    tier:'II', tierLabel:'DARK RUNNER',   edges:{n:8,s:4,e:7,w:5}, power:3, ability:'double_strike', abilityText:'DOUBLE STRIKE: Comparison reaches 2 cells deep in same direction' },
  { id:'vh_t2b', race:'void', name:'NULL FLEET',     tier:'II', tierLabel:'DARK RUNNER',   edges:{n:7,s:5,e:8,w:5}, power:3, ability:'flank',        abilityText:'FLANK: Also contests 4 diagonal neighbors' },
  { id:'vh_t2c', race:'void', name:'ABSENCE WING',   tier:'II', tierLabel:'DARK RUNNER',   edges:{n:8,s:3,e:8,w:5}, power:2, ability:'side_swipe',   abilityText:'SIDE SWIPE: On placement, reduce adjacent enemy E and W edges by 1 permanently' },
  // T3 — NULL BLADE (3 cards)
  { id:'vh_t3a', race:'void', name:'NULL BLADE',     tier:'III',tierLabel:'NULL BLADE',    edges:{n:9,s:3,e:7,w:3}, power:3, ability:'double_strike', abilityText:'DOUBLE STRIKE: Comparison reaches 2 cells deep in same direction' },
  { id:'vh_t3b', race:'void', name:'VOID SPLINTER',  tier:'III',tierLabel:'NULL BLADE',    edges:{n:7,s:3,e:9,w:3}, power:2, ability:'pierce',       abilityText:'PIERCE: Ties count as wins' },
  { id:'vh_t3c', race:'void', name:'DARK DART',      tier:'III',tierLabel:'NULL BLADE',    edges:{n:8,s:3,e:7,w:4}, power:2, ability:'pierce',       abilityText:'PIERCE: Ties count as wins' },
  // T4 — THE HUNGER (1 card)
  { id:'vh_t4',  race:'void', name:'THE HUNGER',     tier:'IV', tierLabel:'THE HUNGER',    edges:{n:9,s:9,e:8,w:6}, power:4, ability:'sunder',       abilityText:'SUNDER: On win, the losing card\'s highest edge drops to 1 permanently' },
];
```

---

## Race 7 — THE GAS NOMADS

**Identity**: Evolved in the upper atmospheres of gas giants — beings of ionized plasma held together by magnetic will. Ships are contained storms. Homeworld is a gas giant permanently wracked by hurricane. The Dreadnaught is a weaponized planetary storm.
**Playstyle**: Moderate base stats. Volatile and explosive. Get them cornered and they get dangerous. BERSERK rewards taking hits.
**Ability theme**: OVERLOAD · BERSERK · SURGE · LAST_STAND · RALLY

```js
const GAS_CARDS = [
  // T1 — STORM PLANET (5 cards)
  { id:'gs_t1a', race:'gas', name:'STORM PLANET',  tier:'I',  tierLabel:'STORM PLANET',  edges:{n:5,s:5,e:5,w:5}, power:1, ability:null,      abilityText:'Basic Storm Planet' },
  { id:'gs_t1b', race:'gas', name:'STORM PLANET',  tier:'I',  tierLabel:'STORM PLANET',  edges:{n:6,s:4,e:5,w:5}, power:1, ability:null,      abilityText:'Basic Storm Planet' },
  { id:'gs_t1c', race:'gas', name:'STORM PLANET',  tier:'I',  tierLabel:'STORM PLANET',  edges:{n:5,s:5,e:6,w:4}, power:1, ability:null,      abilityText:'Basic Storm Planet' },
  { id:'gs_t1d', race:'gas', name:'STORM CRADLE',  tier:'I',  tierLabel:'STORM PLANET',  edges:{n:4,s:4,e:6,w:6}, power:1, ability:'overload', abilityText:'OVERLOAD: This card\'s edges +2 for this placement turn only' },
  { id:'gs_t1e', race:'gas', name:'PLASMA ANCHOR', tier:'I',  tierLabel:'STORM PLANET',  edges:{n:5,s:5,e:5,w:5}, power:2, ability:'berserk',  abilityText:'BERSERK: Each comparison loss, edges permanently +1' },
  // T2 — TEMPEST WING (3 cards)
  { id:'gs_t2a', race:'gas', name:'TEMPEST WING',  tier:'II', tierLabel:'TEMPEST WING',  edges:{n:6,s:6,e:7,w:5}, power:3, ability:'surge',    abilityText:'SURGE: If losing more rows than opponent, gets +3 to all edges' },
  { id:'gs_t2b', race:'gas', name:'ARC FORMATION', tier:'II', tierLabel:'TEMPEST WING',  edges:{n:7,s:5,e:6,w:7}, power:3, ability:'overload', abilityText:'OVERLOAD: This card\'s edges +2 for this placement turn only' },
  { id:'gs_t2c', race:'gas', name:'STORM FLEET',   tier:'II', tierLabel:'TEMPEST WING',  edges:{n:6,s:7,e:7,w:5}, power:2, ability:'rally',    abilityText:'RALLY: If any comparison was lost this turn, all your cards +1 edge' },
  // T3 — ARC NODE (3 cards)
  { id:'gs_t3a', race:'gas', name:'ARC NODE',       tier:'III',tierLabel:'ARC NODE',     edges:{n:8,s:4,e:6,w:4}, power:3, ability:'berserk',   abilityText:'BERSERK: Each comparison loss, edges permanently +1' },
  { id:'gs_t3b', race:'gas', name:'LIGHTNING SHARD',tier:'III',tierLabel:'ARC NODE',     edges:{n:7,s:3,e:8,w:4}, power:2, ability:'last_stand', abilityText:'LAST STAND: If only friendly in its row, gets +4 to all edges' },
  { id:'gs_t3c', race:'gas', name:'STORM SEEKER',   tier:'III',tierLabel:'ARC NODE',     edges:{n:7,s:4,e:7,w:4}, power:2, ability:'berserk',   abilityText:'BERSERK: Each comparison loss, edges permanently +1' },
  // T4 — GREAT STORM (1 card)
  { id:'gs_t4',  race:'gas', name:'THE GREAT STORM',tier:'IV', tierLabel:'GREAT STORM',  edges:{n:8,s:8,e:8,w:7}, power:4, ability:'surge',     abilityText:'SURGE: If losing more rows than opponent, gets +3 to all edges' },
];
```

---

## Race 8 — THE LITHOS

**Identity**: Near-immortal beings thinking in geological time. A "fast decision" takes a decade. Ships are asteroids shaped over millennia. Homeworld is the most stable, ancient thing in the sector. Cannot be moved, disrupted, or eroded.
**Playstyle**: Extremely high edge values. Low power scores. Win by denying the opponent every comparison while scoring just enough to take lines. Control over aggression.
**Ability theme**: IMMOVABLE · FORTRESS · LAST_STAND · WARD

> **Balance note**: Lithos total edge sum (~280) is higher than other races because IMMOVABLE cards have power 1–2 vs typical 3–4. They dominate comparisons but score slowly. This is intentional — they are a "control denial" deck.

```js
const LITHOS_CARDS = [
  // T1 — ANCIENT CORE (5 cards)
  { id:'lt_t1a', race:'lithos', name:'ANCIENT CORE',   tier:'I',  tierLabel:'ANCIENT CORE',   edges:{n:7,s:7,e:5,w:5}, power:2, ability:null,       abilityText:'Basic Ancient Core' },
  { id:'lt_t1b', race:'lithos', name:'ANCIENT CORE',   tier:'I',  tierLabel:'ANCIENT CORE',   edges:{n:5,s:5,e:7,w:7}, power:2, ability:null,       abilityText:'Basic Ancient Core' },
  { id:'lt_t1c', race:'lithos', name:'ANCIENT CORE',   tier:'I',  tierLabel:'ANCIENT CORE',   edges:{n:7,s:6,e:5,w:6}, power:2, ability:null,       abilityText:'Basic Ancient Core' },
  { id:'lt_t1d', race:'lithos', name:'STONE CRADLE',   tier:'I',  tierLabel:'ANCIENT CORE',   edges:{n:8,s:8,e:4,w:4}, power:1, ability:'immovable', abilityText:'IMMOVABLE: Cannot be affected by any ability — only edge comparison' },
  { id:'lt_t1e', race:'lithos', name:'BEDROCK ANCHOR', tier:'I',  tierLabel:'ANCIENT CORE',   edges:{n:6,s:6,e:7,w:7}, power:2, ability:'fortress',  abilityText:'FORTRESS: Cannot be compared while 2+ adjacent friendly cards exist' },
  // T2 — DRIFTING MASS (3 cards)
  { id:'lt_t2a', race:'lithos', name:'DRIFTING MASS',  tier:'II', tierLabel:'DRIFTING MASS',  edges:{n:8,s:7,e:7,w:6}, power:3, ability:'ward',      abilityText:'WARD: Enemy ability effects cannot target this card' },
  { id:'lt_t2b', race:'lithos', name:'CARVED STONE',   tier:'II', tierLabel:'DRIFTING MASS',  edges:{n:7,s:8,e:8,w:6}, power:3, ability:'fortress',  abilityText:'FORTRESS: Cannot be compared while 2+ adjacent friendly cards exist' },
  { id:'lt_t2c', race:'lithos', name:'TECTONIC FLEET', tier:'II', tierLabel:'DRIFTING MASS',  edges:{n:9,s:7,e:7,w:6}, power:2, ability:'immovable', abilityText:'IMMOVABLE: Cannot be affected by any ability — only edge comparison' },
  // T3 — STONE SHARD (3 cards)
  { id:'lt_t3a', race:'lithos', name:'STONE SHARD',    tier:'III',tierLabel:'STONE SHARD',    edges:{n:9,s:4,e:7,w:4}, power:2, ability:'last_stand', abilityText:'LAST STAND: If only friendly in its row, gets +4 to all edges' },
  { id:'lt_t3b', race:'lithos', name:'RUNE SPLINTER',  tier:'III',tierLabel:'STONE SHARD',    edges:{n:7,s:4,e:9,w:4}, power:2, ability:'ward',       abilityText:'WARD: Enemy ability effects cannot target this card' },
  { id:'lt_t3c', race:'lithos', name:'STRATA LANCE',   tier:'III',tierLabel:'STONE SHARD',    edges:{n:8,s:4,e:8,w:4}, power:2, ability:'ward',       abilityText:'WARD: Enemy ability effects cannot target this card' },
  // T4 — THE UNMOVED (1 card)
  { id:'lt_t4',  race:'lithos', name:'THE UNMOVED',    tier:'IV', tierLabel:'THE UNMOVED',    edges:{n:9,s:9,e:8,w:8}, power:3, ability:'immovable',  abilityText:'IMMOVABLE: Cannot be affected by any ability — only edge comparison' },
];
```

---

## Race 9 — THE QUANTUM THREAD

**Identity**: Beings that exist in superposition — multiple states simultaneously until observed. Their cards look different depending on what is adjacent. Ships are probability clouds. Homeworld exists in several places and none of them.
**Playstyle**: Everything is uncertain. WILDCARD fires unknown abilities. ADAPTIVE shapes to counter. ORACLE reads the future. Unpredictable and reactive.
**Ability theme**: WILDCARD · ADAPTIVE · ORACLE · AMBUSH · AMBUSH_STRIKE

```js
const QUANTUM_CARDS = [
  // T1 — PROBABILITY LOCUS (5 cards)
  { id:'qt_t1a', race:'quantum', name:'PROBABILITY LOCUS',    tier:'I',  tierLabel:'PROBABILITY LOCUS', edges:{n:5,s:5,e:5,w:5}, power:1, ability:null,          abilityText:'Basic Probability Locus' },
  { id:'qt_t1b', race:'quantum', name:'PROBABILITY LOCUS',    tier:'I',  tierLabel:'PROBABILITY LOCUS', edges:{n:3,s:7,e:6,w:4}, power:1, ability:null,          abilityText:'Basic Probability Locus' },
  { id:'qt_t1c', race:'quantum', name:'PROBABILITY LOCUS',    tier:'I',  tierLabel:'PROBABILITY LOCUS', edges:{n:6,s:4,e:3,w:7}, power:1, ability:null,          abilityText:'Basic Probability Locus' },
  { id:'qt_t1d', race:'quantum', name:'QUANTUM CRADLE',       tier:'I',  tierLabel:'PROBABILITY LOCUS', edges:{n:7,s:3,e:7,w:3}, power:1, ability:'wildcard',     abilityText:'WILDCARD: Randomly gains one of 5 abilities when placed' },
  { id:'qt_t1e', race:'quantum', name:'SUPERPOSITION ANCHOR', tier:'I',  tierLabel:'PROBABILITY LOCUS', edges:{n:4,s:6,e:6,w:4}, power:2, ability:'adaptive',     abilityText:'ADAPTIVE: Weakest edge copies highest adjacent enemy edge' },
  // T2 — WAVEFORM (3 cards)
  { id:'qt_t2a', race:'quantum', name:'WAVEFORM CLUSTER',     tier:'II', tierLabel:'WAVEFORM',          edges:{n:7,s:4,e:7,w:5}, power:3, ability:'oracle',       abilityText:'ORACLE: Reveal next 2 cards in AI play order' },
  { id:'qt_t2b', race:'quantum', name:'INTERFERENCE PATTERN', tier:'II', tierLabel:'WAVEFORM',          edges:{n:5,s:7,e:6,w:6}, power:3, ability:'adaptive',     abilityText:'ADAPTIVE: Weakest edge copies highest adjacent enemy edge' },
  { id:'qt_t2c', race:'quantum', name:'QUANTUM FLEET',        tier:'II', tierLabel:'WAVEFORM',          edges:{n:8,s:4,e:6,w:6}, power:2, ability:'wildcard',     abilityText:'WILDCARD: Randomly gains one of 5 abilities when placed' },
  // T3 — COLLAPSED STATE (3 cards)
  { id:'qt_t3a', race:'quantum', name:'COLLAPSED STATE',      tier:'III',tierLabel:'COLLAPSED STATE',   edges:{n:8,s:4,e:7,w:4}, power:3, ability:'ambush',       abilityText:'AMBUSH: Placed face-down; edges hidden until enemy placed adjacent' },
  { id:'qt_t3b', race:'quantum', name:'PROBABILITY SPIKE',    tier:'III',tierLabel:'COLLAPSED STATE',   edges:{n:7,s:3,e:8,w:4}, power:2, ability:'ambush_strike', abilityText:'AMBUSH STRIKE: Adjacent to 2+ enemies on placement, +2 to all edges' },
  { id:'qt_t3c', race:'quantum', name:'WAVE SEEKER',          tier:'III',tierLabel:'COLLAPSED STATE',   edges:{n:7,s:4,e:7,w:4}, power:2, ability:'ambush',       abilityText:'AMBUSH: Placed face-down; edges hidden until enemy placed adjacent' },
  // T4 — THE OBSERVER (1 card)
  { id:'qt_t4',  race:'quantum', name:'THE OBSERVER',         tier:'IV', tierLabel:'THE OBSERVER',      edges:{n:8,s:8,e:7,w:7}, power:4, ability:'wildcard',     abilityText:'WILDCARD: Randomly gains one of 5 abilities when placed' },
];
```

---

## Race 10 — THE CHOIR

**Identity**: No visible form. Beings of pure resonant frequency. Their existence is sound traveling through space. Cards look like oscilloscope waveforms and spectral frequency charts — no physical subject at all. Their attacks radiate outward — resonance doesn't pick targets.
**Playstyle**: Low direct edges. SWEEP and SIDE SWIPE punish dense boards. Devastating when the opponent has many adjacent cards. The more crowded the board, the stronger they become.
**Ability theme**: SWEEP · SIDE_SWIPE · FLANK · REFLECT · RALLY

```js
const CHOIR_CARDS = [
  // T1 — RESONANT (5 cards)
  { id:'ch_t1a', race:'choir', name:'RESONANT',         tier:'I',  tierLabel:'RESONANT',        edges:{n:4,s:4,e:4,w:4}, power:1, ability:null,       abilityText:'Basic Resonant' },
  { id:'ch_t1b', race:'choir', name:'RESONANT',         tier:'I',  tierLabel:'RESONANT',        edges:{n:5,s:3,e:5,w:3}, power:1, ability:null,       abilityText:'Basic Resonant' },
  { id:'ch_t1c', race:'choir', name:'RESONANT',         tier:'I',  tierLabel:'RESONANT',        edges:{n:3,s:5,e:3,w:5}, power:1, ability:null,       abilityText:'Basic Resonant' },
  { id:'ch_t1d', race:'choir', name:'HARMONIC NODE',    tier:'I',  tierLabel:'RESONANT',        edges:{n:4,s:4,e:6,w:4}, power:1, ability:'side_swipe', abilityText:'SIDE SWIPE: On placement, reduce adjacent enemy E and W edges by 1 permanently' },
  { id:'ch_t1e', race:'choir', name:'CHORD ANCHOR',     tier:'I',  tierLabel:'RESONANT',        edges:{n:5,s:5,e:5,w:5}, power:2, ability:'rally',     abilityText:'RALLY: If any comparison was lost this turn, all your cards +1 edge' },
  // T2 — WAVE FORMATION (3 cards)
  { id:'ch_t2a', race:'choir', name:'WAVE FORMATION',   tier:'II', tierLabel:'WAVE FORMATION',  edges:{n:6,s:5,e:6,w:6}, power:3, ability:'sweep',     abilityText:'SWEEP: Contests all 4 adjacent cells simultaneously on placement' },
  { id:'ch_t2b', race:'choir', name:'HARMONIC FLEET',   tier:'II', tierLabel:'WAVE FORMATION',  edges:{n:5,s:6,e:7,w:5}, power:3, ability:'reflect',   abilityText:'REFLECT: If opponent beats this by 3+, their attacking edge -1 permanently' },
  { id:'ch_t2c', race:'choir', name:'RESONANCE ARRAY',  tier:'II', tierLabel:'WAVE FORMATION',  edges:{n:7,s:5,e:6,w:6}, power:2, ability:'sweep',     abilityText:'SWEEP: Contests all 4 adjacent cells simultaneously on placement' },
  // T3 — FREQUENCY SHARD (3 cards)
  { id:'ch_t3a', race:'choir', name:'FREQUENCY SHARD',  tier:'III',tierLabel:'FREQUENCY SHARD', edges:{n:7,s:3,e:7,w:3}, power:3, ability:'side_swipe', abilityText:'SIDE SWIPE: On placement, reduce adjacent enemy E and W edges by 1 permanently' },
  { id:'ch_t3b', race:'choir', name:'DISSONANT BLADE',  tier:'III',tierLabel:'FREQUENCY SHARD', edges:{n:6,s:3,e:8,w:3}, power:2, ability:'flank',     abilityText:'FLANK: Also contests 4 diagonal neighbors' },
  { id:'ch_t3c', race:'choir', name:'HARMONIC DART',    tier:'III',tierLabel:'FREQUENCY SHARD', edges:{n:7,s:4,e:7,w:4}, power:2, ability:'side_swipe', abilityText:'SIDE SWIPE: On placement, reduce adjacent enemy E and W edges by 1 permanently' },
  // T4 — DISSONANCE (1 card)
  { id:'ch_t4',  race:'choir', name:'THE DISSONANCE',   tier:'IV', tierLabel:'DISSONANCE',      edges:{n:8,s:7,e:7,w:7}, power:4, ability:'sweep',     abilityText:'SWEEP: Contests all 4 adjacent cells simultaneously on placement' },
];
```

---

## Deck Select Screen Notes

- Show 10 race tiles in a grid (2×5 or 5×2)
- Each tile: race `color` as border/glow, `avatar` emoji, `name`, `sub` label
- Hover state: brief ability theme preview (e.g. "FORTRESS · BASTION · REFLECT")
- Selected tile glows with race color, large pulse animation
- Start button appears after selection
- AI auto-selects a random different race each game (or selects based on counter-strategy later)
- Replace `NETRUNNER_7` portrait label with selected race `name`
- Replace `SENTINEL-4` / AI portrait with AI race `name`
- Player cards render with player race `color` (replaces `#00ffcc`)
- AI cards render with AI race `color` (replaces `#ff0080`)

---

## New Ability Implementation Notes

### Abilities requiring new `getValidPlacements` logic
- `rush`: Add all cells adjacent to any enemy card to valid set
- `phase`: All occupied enemy cells are valid placements (eject their card to AI hand)
- `phantom`: Existing — own home 2 rows, no adjacency (unchanged)

### Abilities requiring new `onPlace` hooks
- `sweep`: On place, run doComparisons for all 4 cardinal directions at once
- `flank`: On place, also run comparisons against 4 diagonal cells
- `side_swipe`: On place, find adjacent enemy cards and reduce their E and W edges by 1
- `corrosive`: On place, find all adjacent enemy cards and reduce ALL edges by 1
- `bastion`: On place, find adjacent friendly cards and add +1 to their N and S edges
- `boost`: On place, find adjacent friendly cards and add +1 to all edges
- `commander`: On place, find adjacent friendly cards of same tier, add +2 to all edges
- `overload`: Before comparisons on placement turn, temporarily add +2 to this card's edges

### Abilities requiring new `onCompareWin` hooks
- `sunder`: On win, set the losing card's `Math.max` edge to 1
- `drain`: On win, reduce the losing card's highest edge by 1
- `double_strike`: Existing (unchanged)
- `chain`: Existing (unchanged)

### Abilities requiring new `onCompareLose` hooks
- `berserk`: On loss, permanently +1 all edges of this card
- `mirror`: On loss, reduce the winning card's attacking edge by 2
- `reflect`: On loss by 3+, reduce the winning card's attacking edge by 1 permanently
- `shield`: Existing (unchanged)

### Abilities requiring `getEdges` computed overrides
- `synergy`: Count adjacent friendly cards, add that count to all edges before comparison
- `surge`: Check `pWins vs aWins`, add +3 if losing
- `last_stand`: Check if only friendly card in row, add +4 if true
- `adaptive`: Find highest adjacent enemy edge, copy it to this card's lowest edge
- `ambush_strike`: Count adjacent enemy cards, if 2+, add +2 to all edges

### Abilities with special rendering
- `ambush`: Card renders face-down (show `?` / race back pattern) until enemy card placed adjacent — then reveal
- `wildcard`: Random selection from pool: `[shield, chain, double_strike, pierce, berserk]` — reveal on placement
- `oracle`: Show a "preview" UI element over the AI's next 2 face-down cards
- `momentum`: Track `turnsOnBoard` per card, add to power during score calculation
- `immovable`: Set a flag — skip all ability targeting hooks for this card
- `ward`: Set a flag — skip destructive ability targeting hooks (allow comparison loss hooks)
- `fortress`: During comparison resolution, if 2+ adjacent friendlies, skip comparison

---

## Balance Notes

| Race | Edge Total | Power Profile | Counter-style |
|------|-----------|---------------|---------------|
| Crystallis | ~235 | Med edges, med power | Sunder/Drain decks erode their defense |
| Mycos Drift | ~205 | Low edges, high ability | Rush decks before CORROSIVE spreads |
| The Veil | ~218 | Spiky directional | Fortress decks absorb their one-directional hits |
| Entropy Cult | ~256 | High edges, decay | Ward/Immovable cards resist their drain/sunder |
| Brood Sovereign | ~234 | Med edges, cluster | Split them up — isolate and pick off individuals |
| Void Hunters | ~248 | Very high offence, weak defence | High defensive edge decks (Lithos) absorb their strikes |
| Gas Nomads | ~249 | Variable burst | Let them take losses early to trigger BERSERK, then swarm |
| Lithos | ~280 | Very high edges, low power | CORROSIVE/SUNDER ignores IMMOVABLE/FORTRESS |
| Quantum Thread | ~246 | Variable, reactive | Predictable decks (Crystallis) make ADAPTIVE weaker |
| The Choir | ~225 | Low edges, area resonance | Spread your cards out — don't cluster |
