# GALACTIC ZERO — Card Overlay Specification
*Canonical reference for card layout, overlay structure, and art generation rules*

---

## Core Principle

**The art and the UI are completely separate layers.**

- The **art image** = a clean illustration with NO text, NO numbers, NO UI elements
- The **overlay** = HTML/CSS rendered on top of the art by the game engine
- This separation means art can be regenerated or swapped without touching game logic, and
  the overlay automatically inherits the correct race color, tier label, and data

---

## Card Anatomy — Overlay Layers

```
┌─[TIER LABEL]────────────────────────────┐
│                                          │
│            ┌──[ N ]──┐                  │
│            │         │                  │
│       [W]  │  ART    │  [E]             │
│            │  FILLS  │                  │
│            │  HERE   │                  │
│            └──[ S ]──┘                  │
│                                          │
│         ┌─────────────┐                 │
│         │  POWER: 4   │ ← large number  │
│         └─────────────┘                 │
│    CARD NAME                             │
│    ABILITY TAG  [⬡ PATTERN ICON]         │
└──────────────────────────────────────────┘
```

---

## Overlay Elements (rendered by HTML/CSS — NOT in image)

| Element | Position | Content | Style |
|---------|----------|---------|-------|
| **Tier badge** | Top-right corner | Race tier label (WORLD / FLEET / FIGHTER / DREADNAUGHT) | Small, race accent color, semi-transparent |
| **N edge** | Top center | North edge value (1–9) | Large bold, race accent color |
| **S edge** | Bottom center | South edge value (1–9) | Large bold, race accent color |
| **W edge** | Left center | West edge value (1–9) | Large bold, race accent color |
| **E edge** | Right center | East edge value (1–9) | Large bold, race accent color |
| **Power score** | Card center | Power value (1–4), large font | Largest element on card, race accent color |
| **Card name** | Below power | Card name string (COLONY WORLD, LANCE, etc.) | Small, race accent color, dimmed |
| **Ability tag** | Bottom-left | Ability short name (SHIELD, CHAIN, etc.) or blank | 7–8px, semi-transparent |
| **Pattern icon** | Bottom-right | Influence footprint miniature (see below) | 3×3 mini-grid, race accent color |

**Race accent color** = the color defined in each race's config (e.g. Crystallis = `#a8d8ff`, Terran = `#7ab8e8`)

---

## Influence Pattern Icon

Every card shows a small **3×3 grid icon** in the bottom-right corner indicating which cells it influences beyond just its touching edge.

The icon is a 3×3 pixel-art mini-grid where the **center cell = this card**, and highlighted cells = cells this card's ability affects.

| Ability | Pattern Shape | Icon Description |
|---------|--------------|------------------|
| `null` (basic) | Cross | Center + 4 cardinal cells lit |
| `double_strike` | Arrow | Two cells lit in one direction |
| `chain` | Cascade arrow | Center + one cell + one beyond |
| `sweep` | Full cross | Center + all 4 cardinal cells lit strongly |
| `flank` | Diagonal cross | Center + 4 diagonal cells lit |
| `side_swipe` | Horizontal bar | Center + left + right cells lit |
| `phantom` | Wide grid | All cells in own half lit (dashed) |
| `shield` | Shield outline | Center cell with border glow |
| `fortress` | Ring | Center + ring of adjacent cells (hollow) |
| `corrosive` | Star burst | Center + all 8 surrounding cells lit |
| `boost` | Soft cross | Center + 4 adjacent cells, soft glow |
| `commander` | Tiered cross | Same as sweep but with tier indicator |
| `ambush` | Question mark | Center cell with `?` symbol |
| `drain` | Arrow with minus | Directional with drain indicator |

---

## Card Image Art Requirements (for Nano Banana)

Apply these rules to **every** card art generation prompt:

### REQUIRED in every prompt:
```
NO text of any kind. NO numbers. NO UI elements. NO frames or borders.
NO ability labels. NO stat indicators. NO card name visible in art.
Subject occupies 80–90% of the frame.
Dark space background fills the remainder.
```

### Image dimensions:
- **Aspect ratio**: 3:4 portrait (e.g. 300×400 or 600×800px)
- **Safe zone**: Keep the top 15% and bottom 25% of the image relatively clear
  of the main subject — this is where the overlay's edge values and name/ability
  text sit. The art can fill these zones but should not have focal detail there.

### What the safe zone means:
```
TOP 15%: edge-N value overlaid here → art can have background/sky detail, not the primary subject face
MIDDLE 70%: main subject fills here freely
BOTTOM 25%: power score + card name + ability + pattern icon overlaid here → art can have ground/base detail
```

### Master style string (append to every prompt):
```
cinematic sci-fi card illustration, dark void space background, painterly with hard-edge rendering,
subject occupies 80-90% of frame, dramatic volumetric lighting,
no text, no numbers, no UI elements, no humans, no borders, no frames.
```

---

## Card Rarity / Tier Visual Distinction

The overlay should visually distinguish tier through:

| Tier | Border style | Glow intensity | Power number size |
|------|-------------|----------------|-------------------|
| I (WORLD / COLONY / BASIC) | 1px solid, 20% opacity | Minimal glow | 18px |
| II (FLEET / BATTLE GROUP) | 1px solid, 40% opacity | Soft glow | 22px |
| III (FIGHTER / STRIKE CRAFT) | 2px solid, 70% opacity | Medium glow | 24px |
| IV (DREADNAUGHT / FLAGSHIP) | 2px solid, full opacity + animated pulse | Strong glow | 28px |

---

## Card States

| State | Visual change |
|-------|--------------|
| **In hand** | Full overlay visible, hover lifts card 10px |
| **Selected** | Glows brightly, attaches to cursor |
| **On board (owned)** | Border in race color, full overlay |
| **Valid placement cell** | Empty cell with yellow-green dashed border + `+` icon |
| **Post-comparison (won)** | Winning edge briefly highlights brighter |
| **Post-comparison (lost)** | Losing edge briefly dims |

---

## Overlay Color System

All overlay text and UI renders in **race accent color** at varying opacity levels:

| Element | Opacity |
|---------|---------|
| Edge values (N/S/E/W) | 100% |
| Power score | 100% |
| Card name | 60% |
| Tier badge | 40% |
| Ability tag | 55% |
| Pattern icon | 45% |
| Border | 60–100% depending on tier |

---

## Implementation Notes

**The game engine never modifies the art image.** The overlay is:
- Absolutely positioned `<span>` elements inside the card `<div>`
- Styled with the race's `color` from `RACES` config
- Power, edges, name, ability, tier all come from the card data object
- Pattern icon is rendered as a tiny inline SVG or CSS grid

**To add a new race:** supply the `color`, `tierLabels`, and card data array.
The overlay renders automatically — no art changes needed.

**To regenerate art:** provide the same prompts, same safe zone rules.
The overlay will fit any art that follows the spec.

---

## H/V Battle Scoring Mechanic

Each card fights in **two independent directions** every turn:

- **H battle** (horizontal / row) — compares East vs West edges with adjacent enemy cards
- **V battle** (vertical / column) — compares South vs North edges with adjacent enemy cards

### Rules per direction:
| Result | Condition | Effect |
|--------|-----------|--------|
| **WIN** | My edge > enemy's opposing edge | My power counts toward this row/col score |
| **LOSE** | My edge < enemy's opposing edge | My power does NOT count (shown as X on that edge) |
| **TIE** | My edge = enemy's opposing edge | BOTH cards are cancelled — neither power counts (X on both) |
| **UNCONTESTED** | No enemy adjacent in that direction | Power always counts (no battle on that side) |

### Visual indicators:
- **WIN direction**: edge value glows bright, contributes to row/col
- **LOSE direction**: edge value dims with a small `✗` marker
- **TIE direction**: both edges show `✗`, small horizontal bar between them in gap

### Scoring:
```
Row score = sum of power values of cards that WON their H battle (or were uncontested)
Col score = sum of power values of cards that WON their V battle (or were uncontested)
```

A card can WIN horizontally and LOSE vertically — it contributes to its row but not its column.
Placement strategy: place cards where they win BOTH H and V for maximum contribution.

---

## Zone Expansion ("Adjacent Power") Mechanic

### Core Rule:
- **Home row is always free** — player can always place in row 4 (AI in row 0), no prerequisites
- **Every other row is LOCKED** unless at least one placed card's zone pattern opens it
- Standard "adjacent to any friendly card" is replaced by "within a specific card's zone"

This makes placement **restrictive and strategic** — you must plan which zones to open before you need them.

### Zone Patterns:

Each card has a `zone` property that defines the exact cells it opens for future placement. These cells light up in **yellow** when hovering the card over a valid placement.

```
Player advances UP (row 4→0). Zones shown relative to card position.
[▲] = direction toward enemy
```

| Zone type | Pattern | Opens | Strategic use |
|-----------|---------|-------|--------------|
| `cross` | `+ shape` | 1 cell in all 4 directions | Balanced — open any direction |
| `lance` | `↑↑ forward` | 2 cells directly forward | Penetrate deep into enemy territory |
| `wall` | `←←←↑→→→` | 3 horizontal + 1 forward | Claim a wide row without advancing much |
| `flanker` | `↖↑↗` | 1 forward + 2 diagonals | Surround and flank |
| `column` | `↑↑↑` | 3 cells forward in same column | Column domination path |
| `command` | `↖↑↗ + ↑↑` | 5 cells (wide front advance) | Commanding territorial expansion |
| `phantom` | `home half` | All cells in own 2 rows | Free placement — no zone needed |
| `dreadnaught` | `⊕ wide` | 2 cells in all 4 directions | Massive expansion, flagship power |

### Placement Resolution:
```
Valid cells for next card = HOME ROW
  UNION any cells opened by zone of already-placed friendly cards
```

### Visual (hover to preview):
- **Green cells**: where the currently selected card CAN be placed RIGHT NOW
- **Yellow cells**: cells that would become available for FUTURE cards if you place here

This preview lets players visualize their strategic options 1 move ahead.

### Zone on Card Face:
The influence pattern icon (3×3 mini-grid, bottom-right of card) shows the zone pattern visually.
Players learn to read the icon and plan accordingly.

### Implementation:
```javascript
// Zone definitions per card type
const ZONES = {
  cross:       [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
  lance:       [{dr:-1,dc:0},{dr:-2,dc:0}],
  wall:        [{dr:-1,dc:0},{dr:0,dc:-1},{dr:0,dc:-2},{dr:0,dc:-3},{dr:0,dc:1},{dr:0,dc:2},{dr:0,dc:3}],
  flanker:     [{dr:-1,dc:0},{dr:-1,dc:-1},{dr:-1,dc:1}],
  column:      [{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0}],
  command:     [{dr:-1,dc:-1},{dr:-1,dc:0},{dr:-1,dc:1},{dr:-2,dc:0}],
  dreadnaught: [{dr:-1,dc:0},{dr:-2,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1},{dr:0,dc:-2},{dr:0,dc:2}],
};
// Note: zones are mirrored for AI (dr directions flipped)

function getZoneOpenings(r, c, zoneType, owner) {
  const dirs = owner === 'player'
    ? ZONES[zoneType]
    : ZONES[zoneType].map(d => ({dr: -d.dr, dc: d.dc})); // AI mirrors vertically
  return dirs
    .map(d => ({r: r + d.dr, c: c + d.dc}))
    .filter(p => p.r >= 0 && p.r < 5 && p.c >= 0 && p.c < 5);
}
```

---

*Last updated: 2026-06-02*
*Source: `C:\GitHub\nullbreach\docs\card-overlay-spec.md`*
