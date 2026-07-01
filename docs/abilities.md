# GALACTIC ZERO — Ability Library

The 18 abilities that actually ship. At game start each deck gets 5 special
cards (weighted toward higher tiers); their abilities are drawn from the
owning faction's 4-ability pool (every pool ability appears at least once).
A card has 0 or 1 ability. Source of truth for player-facing text:
`abilities-data.js` (ABILITY_TEXT); engine behavior: `battle.js`,
`abilities.js`, `placement.js`.

Faction pools:

| Faction | Pool |
|---|---|
| Terran | commander, flank, shield, double_strike |
| Brood | commander, laser_focus, rush, birthright |
| Crystallis | density, fortify, shield, revenge |
| Mycos | lamb, intimidate, home_invader, birthright |
| Veil | flank, phantom, pierce, cloak |
| Entropy | lamb, laser_focus, intimidate, revenge |
| Void | rush, pierce, cloak, sniper |
| Gas | deciding_factor, rush, home_invader, double_strike |
| Lithos | deciding_factor, commander, fortify, shield |
| Quantum | density, flank, phantom, sniper |
| Choir | commander, flank, cloak, birthright |

General battle rules the abilities interact with:

- A battle compares effective edge values: `base edge + edgeMod`, then the
  aggressive-difficulty AI buff (×1.1, rounded) on ALL of the AI card's edges
  — PvE only, never in multiplayer.
- **Ties are harmless**: an exact tie has no effect on either card (unless one
  side has PIERCE).
- Hazard cells never fight battles and are never targeted by abilities.

---

## COMMANDER (`commander`)
Pools: Terran, Brood, Lithos, Choir.
+2 to all four battle values of adjacent friendly cards, any tier. Applies
when either card is placed (placing the commander buffs existing neighbors;
placing a card next to an existing friendly commander buffs the new card
retroactively). Stacks with every other buff, including multiple commanders.

## FLANK (`flank`)
Pools: Terran, Veil, Quantum, Choir.
After placing this card, its owner immediately takes one extra turn — but only
if they have an unused card with at least one valid placement. If not, the
flank fizzles and the turn passes normally (no soft-lock).

## SHIELD (`shield`)
Pools: Terran, Crystallis, Lithos.
The first time this card would lose a battle, that loss is prevented. Exactly
one loss is ever absorbed (the engine remembers which specific battle consumed
the shield); every other loss — including DOUBLE STRIKE splash hits — counts
normally afterward. A tie never consumes the shield. One use per game.

## DOUBLE STRIKE (`double_strike`)
Pools: Terran, Gas.
When this card wins a battle, it also strikes the enemy card two cells beyond
in the same direction at half strength (minimum 1). The splash hit only lands
if half-strength beats that card's facing edge; it respects SHIELD and never
hits hazard cells.

## LASER FOCUS (`laser_focus`)
Pools: Brood, Entropy.
On placement, sums all four base battle values into the enemy-facing side;
the other three sides drop to 0 base. Buffs (e.g. COMMANDER) still apply
additively on top of the collapsed values. Facing side: toward the opponent's
home row (mirrored correctly for Player 2 in multiplayer).

## RUSH (`rush`)
Pools: Brood, Void, Gas.
May additionally be placed on any empty cell adjacent to an enemy card,
anywhere on the board — those cells bypass the tier row restrictions
(including the enemy home row). Its normal home-row / zone-expansion cells
still obey the usual tier rows. Never bypasses an enemy FORTIFY claim.

## BIRTHRIGHT (`birthright`)
Pools: Brood, Mycos, Choir.
On placement, adds a copy of a random unused Tier II card from the owner's own
hand to that hand (same rule for player and AI). The copy is a fully
independent card (own edges/state). In multiplayer both clients derive the
same pick and the same card id deterministically.

## DENSITY (`density`)
Pools: Crystallis, Quantum.
This card scores +2 bonus VP (added to its power in line scoring).

## FORTIFY (`fortify`)
Pools: Crystallis, Lithos.
On placement, claims the empty cell directly forward of this card (toward the
enemy). The opponent can never place there; the owner still can. Mirrored for
Player 2 in multiplayer.

## REVENGE (`revenge`)
Pools: Crystallis, Entropy.
Any enemy card that beats this card in a battle loses 1 VP for the rest of the
game (-1 per adjacent REVENGE card it beats). Revenge alone can never drop a
card below 1 VP (hazards still can). The penalty is recomputed from the
standing board every scoring pass — since cards never leave the board, it is
permanent in practice, and it can no longer compound on recomputes.

## LAMB (`lamb`)
Pools: Mycos, Entropy.
This card's battle values are all 0 and its power is set to 5. It scores the
full 5 VP if no enemy card is adjacent; it scores 0 VP if ANY enemy card is
adjacent (hazards don't count as enemies).

## INTIMIDATE (`intimidate`)
Pools: Mycos, Entropy.
On placement, each adjacent enemy card loses 1 from its highest effective
battle value. Reactive: when an enemy later places a card adjacent to this
one, that new card also loses 1 from its highest value (once per intimidator).
Never affects hazard cells.

## HOME INVADER (`home_invader`)
Pools: Mycos, Gas.
May be placed directly on any empty cell of the opponent's home row, bypassing
tier row restrictions (but not FORTIFY claims). Mirrored for Player 2 in
multiplayer.

## PHANTOM (`phantom`)
Pools: Veil, Quantum.
May be placed freely on any empty cell in the owner's two home rows, in
addition to all normal adjacency placements. Does not bypass enemy FORTIFY
claims.

## PIERCE (`pierce`)
Pools: Veil, Void.
Exact ties count as wins for this card (and as losses for the opponent). If
both cards in a battle have PIERCE, the tie stays a harmless tie.

## CLOAK (`cloak`)
Pools: Veil, Void, Choir.
Each of this card's battle values shows as `?` to the opponent until that
specific side fights its first battle, after which that side is revealed.
Placement previews show `??` against unrevealed sides.

## SNIPER (`sniper`)
Pools: Void, Quantum.
On placement, silences the highest-power enemy card currently on the
opponent's home row: that card contributes 0 VP for the rest of the game (it
still fights battles at full strength). If there is no target, the shot is
wasted (logged + toast). Mirrored for Player 2 in multiplayer.

## DECIDING FACTOR (`deciding_factor`)
Pools: Gas, Lithos.
When a row or column ends in an exact VP tie, the DF owner's side wins that
line and scores bonus VP equal to the DF card's power (highest DF power if
several). If both sides have a non-silenced DF card in the same line, they
nullify each other and the line stays tied. Silenced DF cards don't count.

---

### Removed / never-shipped abilities

`surge`, `sweep`, `overwhelm`, `edge_play`, `stonewall`, `ambush`, `boost`,
`spawn`, `mirror`, `chain`, `echo`, `hat_trick` and the rest of the old
50-ability catalog are NOT in any faction pool and their engine code has been
removed. Every ability listed above is assignable, and every assignable
ability has an engine handler, player text (ABILITY_TEXT) and icon
(ABILITY_ICONS).
