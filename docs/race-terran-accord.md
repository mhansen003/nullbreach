# SECTOR ZERO — Race 11: THE TERRAN ACCORD

**Identity**: Humanity's unified colonial federation — 40 colony worlds, one military doctrine. No alien mystique, no ancient wisdom. They fight with discipline, numbers, and the one advantage that matters: they understand each other.
**Playstyle**: Balanced all-around edges. No extreme weaknesses, no single dominant trick. COMMANDER and BOOST reward tight cluster formations. The most readable deck — ideal as the "learn the game" starter race.
**Ability theme**: COMMANDER · BOOST · DOUBLE_STRIKE · SURGE · CHAIN

```js
{
  id: 'terran',
  name: 'THE TERRAN ACCORD',
  sub: 'UNITED COLONIAL FEDERATION',
  color: '#7ab8e8',
  tierLabels: {
    I:   'COLONY WORLD',
    II:  'BATTLE GROUP',
    III: 'STRIKE CRAFT',
    IV:  'DREADNAUGHT'
  },
  avatar: '★',
  quote: '"We are many worlds, one purpose."'
}
```

---

## Card Data

**Balance target**: Edge total ~248 | Standard tier distribution

```js
const TERRAN_CARDS = [
  // T1 — COLONY WORLD (5 cards)
  { id:'ta_t1a', race:'terran', name:'COLONY WORLD',  tier:'I',  tierLabel:'COLONY WORLD', edges:{n:4,s:5,e:5,w:4}, power:1, ability:null,           abilityText:'Basic Colony World' },
  { id:'ta_t1b', race:'terran', name:'COLONY WORLD',  tier:'I',  tierLabel:'COLONY WORLD', edges:{n:5,s:4,e:4,w:5}, power:1, ability:null,           abilityText:'Basic Colony World' },
  { id:'ta_t1c', race:'terran', name:'COLONY WORLD',  tier:'I',  tierLabel:'COLONY WORLD', edges:{n:5,s:5,e:4,w:4}, power:1, ability:null,           abilityText:'Basic Colony World' },
  { id:'ta_t1d', race:'terran', name:'FRONTIER POST', tier:'I',  tierLabel:'COLONY WORLD', edges:{n:6,s:5,e:4,w:4}, power:1, ability:'shield',        abilityText:'SHIELD: Ignores first comparison loss' },
  { id:'ta_t1e', race:'terran', name:'SUPPLY HUB',    tier:'I',  tierLabel:'COLONY WORLD', edges:{n:5,s:5,e:5,w:5}, power:2, ability:'boost',         abilityText:'BOOST: Adjacent friendly cards get +1 to all edges' },

  // T2 — BATTLE GROUP (3 cards)
  { id:'ta_t2a', race:'terran', name:'BATTLE GROUP',  tier:'II', tierLabel:'BATTLE GROUP', edges:{n:6,s:5,e:7,w:5}, power:3, ability:'commander',     abilityText:'COMMANDER: Adjacent friendly cards of same tier get +2 to all edges' },
  { id:'ta_t2b', race:'terran', name:'CARRIER WING',  tier:'II', tierLabel:'BATTLE GROUP', edges:{n:7,s:5,e:6,w:5}, power:3, ability:'boost',         abilityText:'BOOST: Adjacent friendly cards get +1 to all edges' },
  { id:'ta_t2c', race:'terran', name:'STRIKE FORCE',  tier:'II', tierLabel:'BATTLE GROUP', edges:{n:6,s:6,e:7,w:5}, power:2, ability:'double_strike', abilityText:'DOUBLE STRIKE: Comparison reaches 2 cells deep in same direction' },

  // T3 — STRIKE CRAFT (3 cards)
  { id:'ta_t3a', race:'terran', name:'INTERCEPTOR',   tier:'III',tierLabel:'STRIKE CRAFT', edges:{n:8,s:3,e:7,w:4}, power:3, ability:'double_strike', abilityText:'DOUBLE STRIKE: Comparison reaches 2 cells deep in same direction' },
  { id:'ta_t3b', race:'terran', name:'FAST RUNNER',   tier:'III',tierLabel:'STRIKE CRAFT', edges:{n:7,s:3,e:8,w:4}, power:2, ability:'surge',         abilityText:'SURGE: If losing more rows than opponent, gets +3 to all edges' },
  { id:'ta_t3c', race:'terran', name:'FLANKER',       tier:'III',tierLabel:'STRIKE CRAFT', edges:{n:7,s:3,e:7,w:4}, power:2, ability:'pierce',        abilityText:'PIERCE: Ties count as wins' },

  // T4 — DREADNAUGHT (1 card)
  { id:'ta_t4',  race:'terran', name:'THE ACCORD',    tier:'IV', tierLabel:'DREADNAUGHT',  edges:{n:8,s:8,e:8,w:7}, power:4, ability:'chain',         abilityText:'CHAIN: Win cascades — flipped card adjacencies re-evaluate' },
];
```

**Edge total**: ~248 | Balanced across all directions

---

## Art Prompts (Nano Banana)

**Race Palette**: Military steel blue (#7ab8e8), silver-white hull plating, blue-white thruster glow, deep black void
**Atmosphere**: Disciplined military order, clean manufactured surfaces, recognizable human starship silhouettes
**Style anchors**: Hard-edge sci-fi illustration, metallic hull panel detail, blue-white engine thrust, conventional starship design language
**DO NOT include**: Alien architecture, organic forms, bioluminescence, energy beings, crystal, fungal matter

---

### COLONY WORLD · Terran / Colony World
A terraformed colony world from low orbit — a planet covered in city-grid lights visible from space on the night side, the day side showing structured continental terraforming grids in blue-green; a Terran orbital defense station visible in the near foreground, its hull panels gleaming silver-white with blue running lights, the planet curving beneath it. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 85% of frame. DO NOT: alien architecture, organic forms, warm amber tones, bioluminescence, crystal.

---

### FRONTIER POST · Terran / Colony World
A military frontier outpost station at the edge of Terran space — a compact angular structure of silver-white hull plating and blue-lit docking modules, its defensive turrets visible as geometric protrusions, a single warship docked on one side; the station small but heavily fortified, deep void surrounding it with a distant star just visible. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 85% of frame. DO NOT: alien design elements, organic shapes, warm amber, bioluminescence.

---

### SUPPLY HUB · Terran / Colony World
A large Terran logistics hub station — a modular station built from standardized section blocks, its central ring slowly rotating for gravity, multiple docking arms extending with supply ships attached, blue-white running lights tracing its geometry; clean silver-white construction with orderly engineering precision. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 85% of frame. DO NOT: alien forms, organic matter, warm palette primary, bioluminescence.

---

### BATTLE GROUP · Terran / Battle Group
A Terran naval battle group in formation — a destroyer at center flanked by two frigates in close escort formation, their silver-white hulls with blue panel accent lighting, engines burning blue-white, all three ships angled slightly for dramatic perspective showing hull depth and weapons systems; disciplined military formation. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 80% of frame. DO NOT: alien design, organic hull shapes, warm colors as primary, bioluminescence.

---

### CARRIER WING · Terran / Battle Group
A Terran carrier ship deploying its fighter wing — a large flat-decked carrier vessel with an enormous flight deck, dozens of fighter craft launching in organized waves from bow launch bays, the fighters visible as small bright engine trails fanning out from the carrier; silver-white carrier hull with active blue thruster array at stern, fighters trailing white-blue launch contrails. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 80% of frame. DO NOT: alien hull design, organic forms, warm amber, bioluminescence.

---

### STRIKE FORCE · Terran / Battle Group
A coordinated Terran strike formation — four warships in a precise wedge attack formation, their forward weapons systems active and glowing blue-white, the formation cutting through void in a clear direction of attack; all ships showing the same silver-white hull with blue weapon charging indicators, the formation tight and purposeful. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 80% of frame. DO NOT: alien design, organic hull, warm primary colors, bioluminescence.

---

### INTERCEPTOR · Terran / Strike Craft
A single Terran interceptor at full burn — an extremely aerodynamic delta-wing fighter with a narrow fuselage, its forward sensor array pointed directly at the viewer from a dramatic low-angle perspective, engines burning brilliant blue-white; clean silver-white hull with minimal markings, designed entirely for speed and forward-facing firepower. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 80% of frame. DO NOT: alien forms, organic hull shape, warm primary tones, bioluminescence.

---

### FAST RUNNER · Terran / Strike Craft
A Terran fast-attack craft built for flanking — a longer sleeker design than the interceptor, with a prominent asymmetric engine nacelle on its right side giving it lateral thrust capability, viewed from the side showing its speed silhouette; silver-white hull with a distinctive blue lateral engine streak, designed to be seen moving sideways in battle. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 80% of frame. DO NOT: alien design, organic forms, warm primary colors, symmetric engine layout.

---

### FLANKER · Terran / Strike Craft
A Terran flanking interceptor viewed from a three-quarter forward angle — a swept-wing fighter with a split-nose targeting array and twin side-mounted engine pods, the design suggesting extreme lateral maneuverability; silver-white hull with blue targeting system glow at the forward sensor cluster, engine pods burning pale blue. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject 80% of frame. DO NOT: alien ship design, organic hull surfaces, warm primary palette, bioluminescence.

---

### THE ACCORD · Terran / Dreadnaught
The Terran Accord flagship — an impossibly large dreadnaught, its hull so long it dominates the entire frame from edge to edge, a modular command tower rising from its dorsal surface flanked by long spine-mounted weapons batteries; the ship communicates scale through the visible size comparison of a small escort frigate barely 5% of the flagship's length visible at its bow; silver-white hull with blue command tower lighting, the vessel massive and deliberate. Cinematic sci-fi card illustration, dark void background, hard-edge military sci-fi rendering, subject fills frame edge to edge. DO NOT: alien design, organic hull forms, warm primary palette, bioluminescence, rounded hull shapes.
