# NULL//BREACH — Ability Library

50 special powers available to assign to cards across all decks and tiers.
Each ability has a unique mechanical effect. Cards can have 0 or 1 ability.
Higher-tier cards tend to carry more impactful abilities.

---

## OFFENSIVE — Attack & Edge Modifiers

| # | Name | Code | Effect |
|---|------|------|--------|
| 1 | **SIDE SWIPE** | `side_swipe` | On placement, reduce adjacent enemy's E and W edges by 1 permanently |
| 2 | **DOUBLE STRIKE** | `double_strike` | Comparison reaches 2 cells deep in same direction |
| 3 | **PIERCE** | `pierce` | Ties go to you (normally ties = no result) |
| 4 | **SWEEP** | `sweep` | Contests all 4 adjacent cells simultaneously on placement |
| 5 | **FLANK** | `flank` | Also contests the 4 diagonal neighbors (not just cardinal) |
| 6 | **BACKSTAB** | `backstab` | On placement, reduce all adjacent enemy N edges by 1 permanently |
| 7 | **SUNDER** | `sunder` | When you win a comparison, the losing card's highest edge drops to 1 |
| 8 | **OVERLOAD** | `overload` | This card's edges +2 for this placement turn only |
| 9 | **DRAIN** | `drain` | When you win a comparison, reduce that card's best edge by 1 |
| 10 | **CORROSIVE** | `corrosive` | All adjacent enemy cards lose 1 from all edges after placement |

---

## DEFENSIVE — Protection & Resistance

| # | Name | Code | Effect |
|---|------|------|--------|
| 11 | **SHIELD** | `shield` | Ignores first comparison loss |
| 12 | **MIRROR** | `mirror` | When opponent wins a comparison against this card, their attacking edge drops by 2 |
| 13 | **REFLECT** | `reflect` | If opponent beats this card by 3+, their attacking card loses 1 from that edge permanently |
| 14 | **FORTRESS** | `fortress` | Cannot be compared while at least 2 adjacent friendly cards exist |
| 15 | **WARD** | `ward` | Enemy ability effects cannot target this card |
| 16 | **IMMOVABLE** | `immovable` | Cannot be affected by any ability — only direct edge comparison applies |
| 17 | **BASTION** | `bastion` | Adjacent friendly cards get +1 to their N and S edges |
| 18 | **AEGIS** | `aegis` | Adjacent friendly cards ignore their first comparison loss |

---

## MOBILITY — Placement & Movement

| # | Name | Code | Effect |
|---|------|------|--------|
| 19 | **PHANTOM** | `phantom` | Free placement in own half, no adjacency required |
| 20 | **LEAP** | `leap` | Can be placed up to 2 cells away from nearest friendly card |
| 21 | **RUSH** | `rush` | Can be placed in any cell adjacent to an enemy card (ignores own territory rule) |
| 22 | **RELOCATE** | `relocate` | After placement, can move to any adjacent empty cell once |
| 23 | **SWAP** | `swap` | After placement, swap positions with any other friendly card on the board |
| 24 | **PHASE** | `phase` | Can be placed in an occupied enemy cell — sends their card back to their hand |
| 25 | **AMBUSH** | `ambush` | Placed face-down, edges hidden until an enemy card is placed adjacent |
| 26 | **PORTAL** | `portal` | On placement, teleport one other friendly card to any cell adjacent to this one |

---

## SUPPORT — Buffing & Synergy

| # | Name | Code | Effect |
|---|------|------|--------|
| 27 | **CHAIN** | `chain` | Win cascades — each flipped cell re-evaluates its own adjacencies |
| 28 | **BOOST** | `boost` | Adjacent friendly cards +1 to all edges |
| 29 | **INSPIRE** | `inspire` | Adjacent friendly cards +1 to their single highest edge |
| 30 | **COMMANDER** | `commander` | Friendly cards of the same type adjacent to this get +2 to all edges |
| 31 | **RALLY** | `rally` | If any of your comparisons were lost this turn, all your cards get +1 edge |
| 32 | **EMPOWER** | `empower` | Choose one adjacent friendly card and give it +3 to its weakest edge |
| 33 | **SYNERGY** | `synergy` | Gets +1 to all edges for each adjacent friendly card on placement |
| 34 | **ORACLE** | `oracle` | Reveal the next 2 cards in AI's play order before your next turn |

---

## SCORING — Point Manipulation

| # | Name | Code | Effect |
|---|------|------|--------|
| 35 | **MULTIPLIER** | `multiplier` | This card's score value counts double in its row AND column |
| 36 | **LEECH** | `leech` | When an adjacent enemy card scores for a row/col, steal 1pt from that total |
| 37 | **DOMINANCE** | `dominance` | If this card wins ALL its comparisons, its score value +3 |
| 38 | **TRIBUTE** | `tribute` | Immediately adds +2 pts to the row it is placed in |
| 39 | **ANCHOR SCORE** | `anchor_score` | Adjacent friendly cards score +1 in this row |
| 40 | **MOMENTUM** | `momentum` | Each full turn this card remains on the board, its score value +1 |
| 41 | **RIVALRY** | `rivalry` | Gets +1 score for each enemy card in the same row |

---

## CONDITIONAL — Reactive & Situational

| # | Name | Code | Effect |
|---|------|------|--------|
| 42 | **ADAPTIVE** | `adaptive` | This card's weakest edge copies the highest adjacent enemy edge on placement |
| 43 | **BERSERK** | `berserk` | Each time this card loses a comparison, its edges +1 permanently |
| 44 | **AMBUSH STRIKE** | `ambush_strike` | If placed adjacent to 2+ enemy cards, gets +2 to all edges |
| 45 | **SURGE** | `surge` | If you are losing more rows than AI at time of placement, this card gets +3 to all edges |
| 46 | **LAST STAND** | `last_stand` | If this is the only friendly card in its row, gets +4 to all edges |
| 47 | **VETERAN** | `veteran` | Gets +1 to all edges for each card already on the board when placed |
| 48 | **PREDATOR** | `predator` | Gets +2 to the edge facing the highest-scored adjacent enemy card |
| 49 | **SACRIFICE** | `sacrifice` | Remove one of your other cards from the board — this card gets +3 to all edges |
| 50 | **WILDCARD** | `wildcard` | Randomly gains one of 5 abilities when placed (unknown until played) |

---

## Ability Tier Guidelines

Higher-tier cards carry stronger or more complex abilities. General guidance:

| Tier | Suitable Abilities |
|------|--------------------|
| **I** | shield, phantom, double_strike, pierce, side_swipe, boost, inspire, leap, relocate, momentum, rivalry |
| **II** | chain, sweep, flank, backstab, sunder, drain, fortress, mirror, rush, swap, empower, synergy, multiplier, dominance, adaptive, berserk, ambush, ambush_strike, veteran |
| **III** | corrosive, reflect, ward, immovable, aegis, phase, portal, oracle, leech, tribute, anchor_score, surge, last_stand, predator, sacrifice |
| **A (Amplifier)** | wildcard, rally, commander + any applied as a global Protocol effect |

---

## Deck Archetype Affinity

| Archetype | Primary Abilities |
|-----------|------------------|
| **NETRUNNER** (starter/balanced) | shield, double_strike, phantom, chain, boost |
| **CORPORATE** | fortress, immovable, multiplier, aegis, bastion, anchor_score |
| **HACKER** | side_swipe, phase, ambush, drain, adaptive, oracle |
| **TECHNICIAN** | synergy, boost, commander, inspire, empower, chain |
| **GHOST OPS** | phantom, ambush, rush, leap, wildcard, berserk |
| **VIRAL** | corrosive, momentum, berserk, sweep, sunder, rivalry |

---

*Last updated: 2026-06-02*
*Source of truth: `C:\Users\Mark Hansen\Desktop\nullbreach-docs\abilities.md`*
