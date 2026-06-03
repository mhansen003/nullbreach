# Ability Icons — Design Spec

**Date:** 2026-06-03  
**Status:** Approved

## Overview

Add a unique small square image to each race's 4 unique abilities — 44 icons total (11 races × 4 abilities). Icons appear in two places:

1. **Lore / deck-select page** (`index.html`) — 40×40 icon left of ability name inside each existing ability showcase card
2. **In-game card tooltip** (`game.html`) — 32×32 icon left of ability label inside the existing tooltip ability section

No structural changes to existing HTML layout. Icons are additive only.

---

## Races & Abilities (canonical)

Sourced from `RACES` array in `index.html` (display names) and `FACTION_ABILITY_POOLS` + `RACE_ABILITY_NAMES` in `game.html` (ability keys).

| Race ID | Ability 1 | Ability 2 | Ability 3 | Ability 4 |
|---------|-----------|-----------|-----------|-----------|
| terran | shield → COLONIAL BULWARK | double_strike → ACCORD BARRAGE | commander → FLEET ADMIRAL | flank → PINCER MANEUVER |
| crystallis | stonewall → CRYSTAL FORTRESS | mirror → REFRACTION | shield → LATTICE WARD | density → CRYSTAL DENSITY |
| mycos | hat_trick → MYCELIUM LINK | birthright → SPORE BURST | echo → MYCELIAL NETWORK | overwhelm → MYCO SURGE |
| veil | phantom → PHASE SHIFT | flank → AFTERIMAGE | edge_play → LIGHT BEND | pierce → PHOTON LANCE |
| entropy | mirror → ENTROPY REVERSAL | sweep → RUST EQUALIZE | double_strike → SECOND ROT | ambush → CORROSIVE STRIKE |
| brood | spawn → HIVE PULSE | sweep → MANDIBLE LEVEL | rush → ACID CHARGE | boost → QUEEN'S FAVOR |
| void | sniper → VOID LANCE | ambush → DARK SURGE | rush → DARK LUNGE | pierce → EVENT HORIZON |
| gas | edge_play → STORM WRAP | overwhelm → PLASMA SURGE | birthright → STORM BIRTH | double_strike → TWIN PLASMA |
| lithos | stonewall → TECTONIC HOLD | deciding_factor → FAULT LINE | commander → TECTONIC ARRAY | shield → STONE SKIN* |
| quantum | flank → PROBABILITY CASCADE | deciding_factor → WAVE COLLAPSE | phantom → SUPERPOSITION | sniper → OBSERVER EFFECT |
| choir | hat_trick → RESONANT CHORD | overwhelm → SONIC BOOM | boost → HARMONIC PULSE | rush → SONIC RUSH |

> **\*Note:** Lithos shield is called "STONE SKIN" in `game.html` `RACE_ABILITY_NAMES` but "MONOLITH MASS" in `index.html` `RACES`. The image file uses "STONE SKIN" (game canonical). The lore page display name will be updated to match during integration.

---

## Image Generation

**Script:** `generate-ability-icons.py`  
**Model:** `google/gemini-2.5-flash-image` (Nano Banana) via OpenRouter  
**API key:** `OPENROUTER_API_KEY` environment variable  
**Output size:** 128×128px square PNG

### Approach: Reference-image-guided

For each race, one existing card image (`assets/cards/[race]/t2_a.png`) is loaded as a base64 multimodal reference. This anchors the icon's visual style to the established art for that race.

**Prompt per icon:**
```
Using the exact visual style, color palette, and aesthetic of the reference image,
generate a single 128x128 square icon representing the ability "[DISPLAY NAME]"
for [RACE NAME] in a sci-fi card game.
The icon should feel like a badge or emblem — clear, symbolic, no text, no borders.
Context: [ABILITY_DESC text]
```

### Race → reference image

| Race | Reference |
|------|-----------|
| terran | assets/cards/terran/t2_a.png |
| crystallis | assets/cards/crystallis/t2_a.png |
| mycos | assets/cards/mycos/t2_a.png |
| veil | assets/cards/veil/t2_a.png |
| entropy | assets/cards/entropy/t2_a.png |
| brood | assets/cards/brood/t2_a.png |
| void | assets/cards/void/t2_a.png |
| gas | assets/cards/gas/t2_a.png |
| lithos | assets/cards/lithos/t2_a.png |
| quantum | assets/cards/quantum/t2_a.png |
| choir | assets/cards/choir/t2_a.png |

### File naming

`[raceid]_[abilitykey].png` — uses the generic ability key, not the display name, since `card.ability` provides the key at runtime.

Examples: `terran_shield.png`, `crystallis_stonewall.png`, `lithos_deciding_factor.png`

### Output locations

**Pre-approval (desktop review):**
```
C:\Users\Mark Hansen\Desktop\ability-icons\
  terran_shield.png
  terran_double_strike.png
  terran_commander.png
  terran_flank.png
  crystallis_stonewall.png
  ... (44 total)
```

**Post-approval (game assets):**
```
assets/abilities/
  terran_shield.png
  ... (44 total)
```

---

## Integration: Lore Page (`index.html`)

**Target:** `selectRace()` function, lines ~1194–1200 — the ability showcase card render loop.

**Current code:**
```js
ac.innerHTML = race.abilities.map(a => `
  <div class="ability-showcase" style="...">
    <div class="absc-title">${a}</div>
    <div class="absc-desc">${ABILITY_DESC[a] || '—'}</div>
  </div>
`).join('');
```

**Change:** Add a lookup constant `RACE_ABILITY_KEYS` (parallel to `RACE_ABILITY_NAMES` in game.html) mapping `raceId → abilityKey[]` in the same order as `race.abilities`. Use it to construct the `<img>` src.

```js
const RACE_ABILITY_KEYS = {
  terran:     ['shield','double_strike','commander','flank'],
  crystallis: ['stonewall','mirror','shield','density'],
  mycos:      ['hat_trick','birthright','echo','overwhelm'],
  veil:       ['phantom','flank','edge_play','pierce'],
  entropy:    ['mirror','sweep','double_strike','ambush'],
  brood:      ['spawn','sweep','rush','boost'],
  void:       ['sniper','ambush','rush','pierce'],
  gas:        ['edge_play','overwhelm','birthright','double_strike'],
  lithos:     ['stonewall','deciding_factor','commander','shield'],
  quantum:    ['flank','deciding_factor','phantom','sniper'],
  choir:      ['hat_trick','overwhelm','boost','rush'],
};
```

Then in the render loop:
```js
const keys = RACE_ABILITY_KEYS[race.id] || [];
ac.innerHTML = race.abilities.map((a, i) => {
  const key = keys[i];
  const iconSrc = key ? `assets/abilities/${race.id}_${key}.png` : '';
  return `
  <div class="ability-showcase" style="color:${race.color};border-color:${race.color}44;background:${race.color}08">
    <div class="absc-title" style="display:flex;align-items:center;gap:8px;">
      ${iconSrc ? `<img src="${iconSrc}" width="40" height="40" style="border-radius:3px;border:1px solid ${race.color}66;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
      ${a}
    </div>
    <div class="absc-desc">${ABILITY_DESC[a] || '—'}</div>
  </div>`;
}).join('');
```

---

## Integration: Game Tooltip (`game.html`)

**Target:** `showTip()` function — the ability section at line ~3802.

**Current code:**
```js
<div style="...color:#ffdd00;...">${card.abilityLabel || abi.label}</div>
```

**Required change 1 — store raceId on card:** In `assignRandomAbilities()` (line ~3641), add:
```js
card.raceId = raceId;
```

**Required change 2 — add icon to tooltip:**
```js
const iconSrc = card.raceId && card.ability
  ? `assets/abilities/${card.raceId}_${card.ability}.png`
  : '';
```

Then in the ability section HTML:
```js
<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
  ${iconSrc ? `<img src="${iconSrc}" width="32" height="32" style="border-radius:2px;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
  <div style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:1px;color:#ffdd00;font-weight:700;">${card.abilityLabel || abi.label}</div>
</div>
```

---

## Workflow

1. `python generate-ability-icons.py` → 44 images saved to `Desktop\ability-icons\`
2. User reviews and approves images on desktop
3. Copy approved images to `assets/abilities/`
4. Patch `index.html`: add `RACE_ABILITY_KEYS` constant + update ability card render loop
5. Patch `game.html`: add `card.raceId` in `assignRandomAbilities` + update tooltip HTML
6. Smoke-test: deck select page (all 11 races), hover cards in game

---

## File Summary

| File | Change |
|------|--------|
| `generate-ability-icons.py` | New — generates 44 icons via Nano Banana |
| `assets/abilities/*.png` | New — 44 icon images (post-approval) |
| `index.html` | Add `RACE_ABILITY_KEYS` constant; update ability card render loop |
| `game.html` | Add `card.raceId` in `assignRandomAbilities`; update tooltip HTML |

---

## Out of Scope

- Changing any existing HTML layout, card structure, or CSS
- Generating icons for generic (non-race-unique) abilities
- Animated icons
- Updating the "MONOLITH MASS" / "STONE SKIN" naming inconsistency beyond the note above
