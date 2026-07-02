# GALACTIC ZERO — Card Interaction Catalog

Every way one card can defeat, damage, block, buff, debuff, or otherwise interact with another card, derived from the live engine (`battle.js`, `abilities.js`, `placement.js`, `turn.js`, `preview.js`, `state.js`) as of the current overhaul. This catalog is the foundation for giving each interaction a unique visual effect + sound. Battles compare **effective edges** (`base + edgeMod`, then the aggressive-difficulty AI ×1.1 buff, PvE only — `gzEffEdge`, battle.js:19-22 / gzAiBuffMult battle.js:13-16). **Pure ties are neutral** (no effect on either card — battle.js:138, 200) unless exactly one side has PIERCE. Per-cell win/loss **counters** on each axis are reduced to net `win/lose/tie/none` per axis (battle.js:216-240), so a card sandwiched between two enemies can win one battle and lose the other for a net wash. Removed abilities (boost, spawn, surge, overwhelm, edge_play, stonewall, ambush, mirror, …) are NOT cataloged — note that `render-overlays.js:32-48` (ambush) and `render-overlays.js:113-139` / `render-grid.js:105-107` (boost/spawn) still contain dead rendering branches for them.

## Shared DALL-E style clause

Every prompt below inlines this clause so each is copy-pasteable on its own. Referenced here once for consistency:

> **STYLE:** *stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark*

Palette anchors: board dark `#080810`, player cyan `#00ffcc`, enemy magenta `#ff0080`, gold accent `#ffd23f`. Prompts that represent owner-flippable effects (wins, buffs) use a **white-hot core with cool cyan falloff** — at runtime tint per owner with CSS `hue-rotate`/`sepia` filters or a canvas multiply pass (see Implementation notes).

## Summary table

| # | Interaction | ID | Category | Frequency |
|---|---|---|---|---|
| 1 | Battle win (horizontal) | `battle-win-h` | Core battle | common |
| 2 | Battle win (vertical) | `battle-win-v` | Core battle | common |
| 3 | Battle loss | `battle-loss` | Core battle | common |
| 4 | Pure tie | `battle-tie` | Core battle | uncommon |
| 5 | Pierce tie-break win | `pierce-tie-win` | Core battle | uncommon |
| 6 | Pierce vs pierce standoff | `pierce-standoff` | Core battle | rare |
| 7 | Net-neutral sandwich | `net-neutral-sandwich` | Core battle | uncommon |
| 8 | Quad sweep (wins all 4 adjacent battles) | `quad-sweep` | Core battle | rare |
| 9 | Shield block | `shield-block` | Defensive | uncommon |
| 10 | Shield already spent (loss counts) | `shield-spent-loss` | Defensive | uncommon |
| 11 | Shield absorbs a double-strike splash | `shield-blocks-splash` | Defensive | rare |
| 12 | Cloak edge reveal | `cloak-reveal` | Defensive | uncommon |
| 13 | Fortify claims a cell | `fortify-claim` | Defensive | uncommon |
| 14 | Fortify placement denial | `fortify-denial` | Defensive | uncommon |
| 15 | Double-strike splash hit (two victims) | `double-strike-splash-hit` | Offensive | uncommon |
| 16 | Double-strike splash repelled | `double-strike-splash-repelled` | Offensive | uncommon |
| 17 | Sniper silence | `sniper-silence` | Offensive | uncommon |
| 18 | Sniper fizzle | `sniper-fizzle` | Offensive | rare |
| 19 | Intimidate debuff (placement) | `intimidate-placement` | Offensive | uncommon |
| 20 | Intimidate reactive debuff | `intimidate-reactive` | Offensive | uncommon |
| 21 | Laser focus collapse | `laser-focus-collapse` | Offensive | uncommon |
| 22 | Revenge penalty | `revenge-penalty` | Attrition/aura | uncommon |
| 23 | Revenge stacked (multiple -1s) | `revenge-stacked` | Attrition/aura | rare |
| 24 | Lamb zeroed by adjacent enemy | `lamb-zeroed` | Attrition/aura | uncommon |
| 25 | Commander buff (both directions) | `commander-buff` | Attrition/aura | uncommon |
| 26 | Commander-empowered win | `commander-empowered-win` | Attrition/aura | rare |
| 27 | Density scoring bonus | `density-bonus` | Attrition/aura | uncommon |
| 28 | Flank extra turn | `flank-extra-turn` | Board/tempo | uncommon |
| 29 | Flank fizzle | `flank-fizzle` | Board/tempo | rare |
| 30 | Home invader drop | `home-invader-drop` | Board/tempo | uncommon |
| 31 | Rush deep strike | `rush-deep-strike` | Board/tempo | uncommon |
| 32 | Phantom home-row placement | `phantom-placement` | Board/tempo | uncommon |
| 33 | Birthright bonus card | `birthright-bonus` | Board/tempo | uncommon |
| 34 | Deciding factor tie-break | `deciding-factor-break` | Board/tempo | uncommon |
| 35 | Deciding factor nullified | `deciding-factor-nullify` | Board/tempo | rare |
| 36 | Hazard adjacency penalty | `hazard-adjacency` | Environmental | common |
| 37 | Hazard zeroes a card | `hazard-zeroed-card` | Environmental | rare |
| 38 | Hazard cell presence | `hazard-cell` | Environmental | common |

---

## Category 1 — Core battle outcomes

### Battle win (horizontal)
- **Category**: Core battle / **ID**: `battle-win-h`
- **Trigger**: My effective E edge > their effective W edge (or the pierce tie-break) between horizontally adjacent enemy cards — battle.js:87-91 (west card wins) / battle.js:113-117 (east card wins). Effective edge math: gzEffEdge battle.js:19-22.
- **Who sees it when**: Recompute-derived (computeBattleResults runs on every computeScores), but the *player-facing moment* is the placement-time one-shot in `doComparisons` (placement.js:193-282, flash at 237). Persistent state afterward: net `battle.h === 'win'` on the cell (battle.js:222-228).
- **Current feedback**: `showFlash` text pill "`5 > 3 WIN`" in cyan for ~1.9s (render-overlays.js:530-562, .flash game.css:624); persistent winner-avatar chip in the cell gap with hover tooltip (renderBattleIndicators, render-overlays.js:144-396); winning edge value glows, losing edge dims (render-grid.js:290-296). Sound: none (only the generic card-place thunk, turn.js:53-67).
- **Proposed visual**: A horizontal energy lance that snaps from the winner's edge across the shared border into the loser's cell, ending in a small impact starburst on the loser (500ms). Owner-tinted (cyan/magenta).
- **Proposed sound**: sharp energy zap + short impact crack.
- **DALL-E prompt**: "Horizontal neon energy lance with a white-hot core and cool cyan falloff, streaking left to right and terminating in a small radial impact starburst, motion-streak particles trailing behind, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Battle win (vertical)
- **Category**: Core battle / **ID**: `battle-win-v`
- **Trigger**: My effective S edge > their effective N edge (or pierce tie-break) between vertically adjacent enemies — battle.js:163-167 (north card wins) / battle.js:181-185 (south card wins).
- **Who sees it when**: Same as `battle-win-h`; one-shot at placement via doComparisons (placement.js:237), persistent `battle.v === 'win'` (battle.js:230-236).
- **Current feedback**: Same flash pill + gap chip + edge glow as horizontal; the chip tooltip labels it "VERTICAL BATTLE" (render-overlays.js:411).
- **Proposed visual**: Same lance concept rotated 90° — a vertical energy spike driving downward (or upward) into the loser's cell with an impact bloom. Reuse the `battle-win-h` sprite rotated 90° at runtime; no separate asset needed unless art direction wants a distinct "slam" for vertical.
- **Proposed sound**: same zap family, pitched slightly lower than horizontal (subtle axis cue).
- **DALL-E prompt**: "Vertical neon energy spike with a white-hot core and cool cyan falloff, driving from top to bottom and terminating in a compact radial impact bloom, faint motion-streak particles above, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Battle loss
- **Category**: Core battle / **ID**: `battle-loss`
- **Trigger**: The mirror of a win: the beaten card's `hL`/`vL` counter increments (battle.js:91, 117, 167, 185) *unless* its shield absorbs it. A card whose net counters go negative renders `battle.h/v === 'lose'` (battle.js:222-236) and stops contributing VP on that axis (battle.js:275-277).
- **Who sees it when**: One-shot at placement (the red `showFlash` "3 < 5 LOSE" pill, placement.js:237 → render-overlays.js:556) + persistent dimmed edge / dimmed power text (render-grid.js:290-299: power dims fully only when BOTH axes are lost).
- **Current feedback**: Red flash pill, dimmed edge numbers, loser side grayed in chip hover (render-overlays.js:344). Sound: none.
- **Proposed visual**: A brief crack-and-flicker on the losing cell — a fractured glass shatter overlay in desaturated red that flickers twice then fades (450ms), clearly "damage received" rather than "attack fired".
- **Proposed sound**: dull sub-thud + brittle glass crackle.
- **DALL-E prompt**: "Fractured energy shatter burst, thin crimson and dark-red glass-like cracks radiating from center with small glowing shard particles scattering outward, dim smoky red afterglow, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Pure tie
- **Category**: Core battle / **ID**: `battle-tie`
- **Trigger**: Equal effective edges and neither (or both) cards have pierce — the engine does nothing to either card (fall-through comments battle.js:138, 200; preview semantics preview.js:138).
- **Who sees it when**: Placement-time flash (`doComparisons` logs `=` and shows a flash, placement.js:237-239) + persistent gray "TIE" chip in the gap (render-overlays.js:322-326) when a same-axis tie counter registered (`hW>0` with equal counts, battle.js:226).
- **Current feedback**: Gray TIE chip, "TIE: equal battle values" tooltip (render-overlays.js:481-483). Sound: none.
- **Proposed visual**: Two equal energy pulses meeting at the shared border and canceling — a small symmetric ripple ring at the cell boundary in neutral white-gold that dissipates without an impact (400ms). Reads as "stalemate, no harm".
- **Proposed sound**: soft dual chime, both notes the same pitch, quickly damped.
- **DALL-E prompt**: "Two identical soft energy ripples colliding head-on and canceling into a thin symmetric ring of pale white-gold light, perfectly balanced mirror composition, gentle dissipating shimmer, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Pierce tie-break win
- **Category**: Core battle / **ID**: `pierce-tie-win`
- **Trigger**: Equal effective edges AND exactly one side has `pierce` — the tie converts to a win for the piercer: battle.js:87 / 113 (H), battle.js:163 / 181 (V) (`me === them && pierce && !pierceThem`). Same rule in previews (preview.js:135-138) and display math (placement.js:216-217, render-overlays.js:214).
- **Who sees it when**: Resolves exactly like a win at placement time (one-shot), but the *reason* is only surfaced on chip hover afterward.
- **Current feedback**: Chip tooltip line "PIERCE: tie → win" (render-overlays.js:244-246) plus a white pulsing overlay on the loser cell while hovering the chip (render-overlays.js:347-359). Sound: none.
- **Proposed visual**: A thin needle-beam punching *through* the loser's cell (entry point → exit spark on the far edge), rendered in stark white with a faint cyan sheath — visually distinct from the broad win-lance: this one perforates. 500ms.
- **Proposed sound**: high-pitched piercing "shink" like a needle through metal, with brief ringing tail.
- **DALL-E prompt**: "Ultra-thin white needle beam piercing straight through the frame center with a tiny entry flare and a bright exit spark, faint cyan energy sheath around the needle, minimal clean penetration effect, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Pierce vs pierce standoff
- **Category**: Core battle / **ID**: `pierce-standoff`
- **Trigger**: Equal effective edges and BOTH cards have pierce — the pierce clauses cancel (`pierce && !pierceThem` false both ways, battle.js:87/113/163/181) and the battle falls through to the pure-tie no-op (battle.js:138, 200). Documented behavior: docs/abilities.md ("If both cards in a battle have PIERCE, the tie stays a harmless tie").
- **Who sees it when**: Placement-time one-shot moment; persistent gray TIE chip afterward.
- **Current feedback**: Identical to a plain tie — nothing distinguishes the double-pierce standoff. Sound: none.
- **Proposed visual**: Two opposing needle-beams meeting tip-to-tip at the shared border with a single bright contact spark and a tiny X-shaped flare, then both retract (500ms). A "blades locked" beat that rewards players who know the rule.
- **Proposed sound**: two overlapping metallic shings ending in a single clink.
- **DALL-E prompt**: "Two ultra-thin opposing needle beams meeting tip to tip at dead center, one pale cyan and one pale magenta, single bright white contact spark forming a tiny cross flare where they touch, taut symmetrical standoff, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Net-neutral sandwich
- **Category**: Core battle / **ID**: `net-neutral-sandwich`
- **Trigger**: A card wins one battle and loses another on the SAME axis in the same scoring pass — counters equalize (`hW === hL > 0` or `vW === vL > 0`) and the axis nets to `'tie'` (battle.js:222-236), so the card contributes nothing on that axis despite fighting twice.
- **Who sees it when**: Recompute-derived — it can appear or vanish whenever a later placement adds/flips a battle. Not a placement one-shot on the sandwiched card's own turn (it's usually caused by the OPPONENT's placement completing the sandwich).
- **Current feedback**: The individual chips still show one win and one loss; the net wash is only implied by the tie-dimmed edges (render-grid.js:290-296). Effectively invisible as a concept. Sound: none.
- **Proposed visual**: A brief "scales balancing" shimmer on the sandwiched cell: two small counter-rotating arcs (one cyan, one magenta) orbit the cell border once and fade to gray (600ms), fired only on the transition into net-tie.
- **Proposed sound**: rising note immediately answered by an equal falling note.
- **DALL-E prompt**: "Two thin counter-rotating semicircular energy arcs orbiting a common center, one glowing cyan and one glowing magenta, meeting and fading into a neutral gray shimmer ring, balanced circular composition, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Quad sweep (wins all 4 adjacent battles)
- **Category**: Core battle (compound) / **ID**: `quad-sweep`
- **Trigger**: A newly placed card wins every one of its (up to 4) adjacent battles — detectable in `doComparisons` (placement.js:199-280) by counting `iWin` across all enemy-adjacent directions and comparing to the number of enemies (≥2 enemies, all wins, no losses/ties). The engine has no special rule; this is a celebration-moment composite.
- **Who sees it when**: Placement-time one-shot only.
- **Current feedback**: Four separate win flashes; no combined moment. Sound: none.
- **Proposed visual**: After the individual lances resolve, a single shockwave ring erupts from the placed card and washes over all beaten neighbors, gold-rimmed with the owner's color core (700ms). Screen-space, centered on the hero cell.
- **Proposed sound**: layered quad-zap resolving into one deep triumphant boom with a shimmer tail.
- **DALL-E prompt**: "Powerful expanding circular shockwave ring with a molten gold rim and white-hot cyan core flash, four small directional burst flares at the cardinal points, dramatic radial energy explosion, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

---

## Category 2 — Defensive interactions

### Shield block
- **Category**: Defensive / **ID**: `shield-block`
- **Trigger**: A shield card's FIRST losing battle ever: `_gzShieldAbsorbs` (battle.js:28-36) sets `shieldConsumedBy = '<edge>:<attackerId>'` + `shieldExpended = true` and suppresses the loss counter. Consumption sites: battle.js:91, 117 (H), 167, 185 (V). Recomputes suppress only that same battle key (battle.js:35). Ties never consume it (ties never reach the loss branch).
- **Who sees it when**: State-transition one-shot (the recompute inside `placeCard`, turn.js:48, is where `shieldConsumedBy` first flips from null) — hook on that transition, not on every recompute. Persistent aftermath: expended badge.
- **Current feedback**: Log line "SHIELD absorbs the loss" + a neutral flash (doComparisons, placement.js:223-234); afterwards the ability badge dims/grayscales and a faded 🛡 appears top-right (render-grid.js:354, 356); chip tooltip notes "SHIELD absorbed a loss" (render-overlays.js:240-242); pre-battle the badge glows (render-grid.js:354). Sound: none.
- **Proposed visual**: A hexagonal energy barrier flashes into existence over the defender facing the attacker, catches the incoming lance with a bright ripple at the impact point, then shatters into dissolving hex fragments (700ms) — communicating both "blocked" and "used up".
- **Proposed sound**: metallic shing + low absorbing thud, ending with a faint glassy crumble.
- **DALL-E prompt**: "Glowing hexagonal-tile energy shield dome catching an impact, bright white ripple at the strike point spreading across pale blue hex cells, outer hexagons breaking apart into dissolving luminous fragments, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Shield already spent (loss counts)
- **Category**: Defensive / **ID**: `shield-spent-loss`
- **Trigger**: A shield card loses a DIFFERENT battle after its shield was consumed: `_gzShieldAbsorbs` returns false because `shieldConsumedBy` holds another battle key (battle.js:35) — the loss counts normally.
- **Who sees it when**: Placement-time one-shot (normal loss flash); the spent state is persistent (dimmed badge).
- **Current feedback**: Just the ordinary loss feedback; the only "spent" signal is the pre-existing grayscale badge + faded 🛡 (render-grid.js:354-356). Sound: none.
- **Proposed visual**: A ghost-outline of the hex barrier flickers for a frame and fails to materialize (broken, dark, sputtering) as the hit lands — a 300ms "shield offline" sputter layered under the normal `battle-loss` effect.
- **Proposed sound**: weak electrical sputter/fizzle immediately followed by the normal loss thud.
- **DALL-E prompt**: "Broken failing energy shield outline, dim gray-blue hexagonal dome fragmentary and glitching with sparse dying sparks and gaps in the lattice, weak sputtering glow, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Shield absorbs a double-strike splash
- **Category**: Defensive (compound) / **ID**: `shield-blocks-splash`
- **Trigger**: A double-strike splash hit would land but the far target's shield eats it — splash consumption keys `'dsw:'/'dse:'/'dsn:'/'dss:' + attackerId` at battle.js:107, 131, 177, 195. This CAN be the shield's one-and-only consumption.
- **Who sees it when**: State-transition one-shot at the attacker's placement (2 cells away from the attacker); persistent spent badge afterward.
- **Current feedback**: None specific — doComparisons' double-strike display (placement.js:258-278) shows the half-strength comparison flash but has no shield-absorb branch for the splash cell; the shield badge just turns gray after the recompute. Sound: none.
- **Proposed visual**: The `shield-block` hex-barrier effect but smaller and offset to the splash cell, catching a visibly thinner/split lance — pairing "half-strength projectile" with "barrier catch" (600ms).
- **Proposed sound**: softer shing + muffled thud (quieter echo of the main shield-block sound).
- **DALL-E prompt**: "Small hexagonal-tile energy shield catching a thin forked energy dart, modest white ripple at the contact point on pale blue hex cells, a few hex fragments flaking away, restrained compact deflection effect, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Cloak edge reveal
- **Category**: Defensive / **ID**: `cloak-reveal`
- **Trigger**: A cloak card's specific edge fights its first battle — `cloakRevealed.<edge> = true` set in computeBattleResults at battle.js:75-77 (H: e/w) and battle.js:152-154 (V: s/n). Until then the opponent sees `?` for that edge (render-grid.js:285-337) and previews show `??` (preview.js:114-117, render badge 'unknown' preview.js:154-181).
- **Who sees it when**: State-transition one-shot per edge (fires during the recompute of the placement that created the battle); revealed state is persistent.
- **Current feedback**: The `?` simply becomes a number; unrevealed edges pulse via `.cloak-hidden-edge` (render-grid.js:336, game.css:1556); preview badges show "??" in indigo. No reveal *moment*. Sound: none.
- **Proposed visual**: A de-cloaking shimmer on just that edge of the card: a vertical/horizontal sliver of static-distortion peels away like a curtain revealing the number beneath, indigo-to-white (500ms).
- **Proposed sound**: airy phase-shift whoosh with a soft digital "resolve" blip.
- **DALL-E prompt**: "Narrow curtain of shimmering indigo optical-camouflage static peeling away and dissolving into fine glittering pixels, revealing clear space behind, translucent refraction ripple at the peeling edge, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Fortify claims a cell
- **Category**: Defensive / **ID**: `fortify-claim`
- **Trigger**: On placing a FORTIFY card, the empty cell directly forward (toward the enemy; P2-mirrored) gets `fortifiedBy = owner` — abilities.js:131-142.
- **Who sees it when**: Placement-time one-shot (the claim moment) + persistent claimed state on the empty cell.
- **Current feedback**: Persistent dashed border + 🔒 icon on the claimed cell (render-grid.js:741-756), blue glow on the fortify card itself (render-overlays.js:51-59), empty-cell tooltip explains the claim (render-grid.js:90-93). No claim *moment*. Sound: none.
- **Proposed visual**: A translucent energy palisade slams down onto the claimed cell — vertical light-bars drop from above and lock into a low fence around the cell perimeter, blue (`#4488ff`) for player / red for enemy (600ms).
- **Proposed sound**: heavy pneumatic clunk + electric hum settling in.
- **DALL-E prompt**: "Square perimeter of short vertical light-bar pillars slamming down and locking into a low glowing energy fence, cool blue barrier light with small dust-of-light impact puffs at each pillar base, top-down slightly angled fortification, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Fortify placement denial
- **Category**: Defensive / **ID**: `fortify-denial`
- **Trigger**: An enemy card is prevented from being placed on a fortified cell: the validity filter drops it at placement.js:130 (normal cells), placement.js:140 (rush cells), placement.js:17 (phantom home rows), placement.js:152 (home invader). No ability bypasses an enemy fortify claim.
- **Who sees it when**: Persistent denial (the cell simply never lights up as valid); the *felt* moment is when a player with a selected card hovers/taps the locked cell.
- **Current feedback**: Cell never appears in the green valid set; lock-icon overlay on invalid cells when a card is selected (render-grid.js:632-668, generic reason tooltip); the fortify 🔒 marker (render-grid.js:741-756). Sound: none.
- **Proposed visual**: On hover-with-card (or tap on mobile) over a hostile fortified cell: the palisade flares bright and emits a short repulse ripple pushing outward from the border, denying entry (400ms).
- **Proposed sound**: negative two-tone buzz + force-field bounce.
- **DALL-E prompt**: "Glowing energy fence flaring bright with a repelling force-field ripple pushing outward, cold blue barrier light with a sharp white flash line where something was rejected, defensive repulse burst, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

---

## Category 3 — Offensive specials

### Double-strike splash hit (two victims)
- **Category**: Offensive / **ID**: `double-strike-splash-hit`
- **Trigger**: A double_strike card wins its direct battle AND the enemy card two cells beyond (same direction) loses to half the winner's strength (`Math.max(1, floor(me/2))` > their facing edge): battle.js:98-111 (E), 122-135 (W), 172-179 (S), 190-197 (N). Skips hazards (`far.owner !== 'hazard'`); respects shield. Because the splash only exists after a direct win, a landed splash always means BOTH targets took a loss this pass — the "double kill" moment.
- **Who sees it when**: Placement-time one-shot (the attacker's placement); persistent net-loss state on both victims afterward.
- **Current feedback**: doComparisons shows a second half-strength flash + log "DOUBLE STRIKE (½): …" (placement.js:258-278); chip hover later highlights the second target with a dashed pulse (render-overlays.js:361-380); empty-cell tooltip warns of DS range (render-grid.js:119-121). Sound: none.
- **Proposed visual**: The win-lance continues THROUGH the first victim and forks into a thinner second bolt that arcs into the far cell, with a smaller secondary impact flash — one continuous two-hit motion, 300ms then 300ms (staggered impacts are the signature).
- **Proposed sound**: zap-crack … echo-crack (same impact sound repeated quieter and higher, ~150ms later).
- **DALL-E prompt**: "Neon energy bolt striking a first impact point then continuing onward as a thinner forked bolt to a second smaller impact flash farther along the same line, two staggered radial bursts of decreasing size, white-hot cores with cyan falloff, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Double-strike splash repelled
- **Category**: Offensive / **ID**: `double-strike-splash-repelled`
- **Trigger**: The direct battle is won but the half-strength splash FAILS: `me2 <= gzEffEdge(far...)` — the condition at battle.js:106-107 / 130-131 / 176-177 / 194-195 evaluates false, so no `hL/vL` lands on the far cell. (doComparisons still displays the failed comparison, placement.js:266-273.)
- **Who sees it when**: Placement-time one-shot only — no persistent state results.
- **Current feedback**: A red half-strength flash "2 vs 5" via showFlash (placement.js:270). Sound: none.
- **Proposed visual**: The forked second bolt reaches the far cell but splashes harmlessly off a brief bright rim on the defender's facing edge and dissipates into sparks (400ms) — "the echo hit wasn't strong enough".
- **Proposed sound**: zap-crack … dull deflection "tink" with fizzle.
- **DALL-E prompt**: "Thin forked energy dart glancing off a bright glowing edge line and dissipating into scattered harmless sparks, deflected ricochet with a shallow angle, faint cyan bolt and warm white deflection rim, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Sniper silence
- **Category**: Offensive / **ID**: `sniper-silence`
- **Trigger**: On placing a SNIPER card: the highest-power un-silenced enemy card on the opponent's home row gets `_silenced = true` → contributes 0 VP forever (abilities.js:147-162; VP skip battle.js:292; excluded from DF battle.js:334). Silenced cards still FIGHT at full strength. Cannot hit hazards (home row never holds hazards; targets filtered by owner).
- **Who sees it when**: Placement-time one-shot (the shot) + persistent silenced overlay on the victim.
- **Current feedback**: Log + toast "SNIPER: <name> silenced — 0 VP" (abilities.js:160-161); persistent dark overlay with 🎯 and "0 VP" tag on the victim (render-grid.js:358); aria label notes it (render-grid.js:321). No shot animation. Sound: none.
- **Proposed visual**: A cross-board beat: a red targeting reticle blinks onto the victim's cell, contracts to a point, then a single instantaneous tracer line flashes from the sniper cell to the victim followed by a muzzle-flash impact and the overlay fading in (800ms total — the longest one-shot in the set, it deserves it).
- **Proposed sound**: brief lock-on beep-beep, then a suppressed railgun crack with a long faint echo.
- **DALL-E prompt**: "Glowing red-orange sniper targeting reticle of thin concentric rings and four tick marks contracting toward a bright center point with a small muzzle-flash burst, precise military holographic lock-on effect, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Sniper fizzle
- **Category**: Offensive / **ID**: `sniper-fizzle`
- **Trigger**: SNIPER placed with no un-silenced enemy card on the opponent's home row — shot wasted (abilities.js:163-166).
- **Who sees it when**: Placement-time one-shot only.
- **Current feedback**: Log + orange toast "SNIPER: no target — shot wasted" (abilities.js:165). Sound: none.
- **Proposed visual**: The same reticle appears over the empty enemy home row, sweeps briefly side to side, then glitches apart into static (600ms) — "no lock".
- **Proposed sound**: lock-on beep that bends downward into an error fizz.
- **DALL-E prompt**: "Red-orange holographic targeting reticle breaking apart into glitching static fragments and drifting scanline noise, failed lock-on dissolving, dim sparks falling from the broken rings, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Intimidate debuff (placement)
- **Category**: Offensive / **ID**: `intimidate-placement`
- **Trigger**: On placing an INTIMIDATE card, each adjacent enemy (not hazards) loses 1 from its highest *effective* edge via `edgeMod` (tie-break order N→S→E→W): abilities.js:90-128. Permanent for the game.
- **Who sees it when**: Placement-time one-shot per victim; persistent red-tinted edge number + mod badge afterward.
- **Current feedback**: Log per victim (abilities.js:124); debuffed edge renders red with a `-1` mini-badge (render-grid.js:329-332); persistent red threat-zone overlay on adjacent cells (render-overlays.js:16-29); previews account for it (preview.js:128). Sound: none.
- **Proposed visual**: A dark-red fear pulse radiates from the intimidator, and on each victim the specific debuffed edge number gets a downward-dragging red streak (like the digit is being pressed down), 500ms.
- **Proposed sound**: low menacing growl-sweep + a small descending pitch tick per victim.
- **DALL-E prompt**: "Ominous dark crimson fear shockwave radiating outward as jagged concentric rings with small downward-dragging red streaks at the rim, oppressive heavy energy pulse with black smoky falloff, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Intimidate reactive debuff
- **Category**: Offensive / **ID**: `intimidate-reactive`
- **Trigger**: An enemy card is placed adjacent to a standing INTIMIDATE card → the NEW card loses 1 from its highest effective edge, once per intimidator (`_intimidatedBy` set guard): fireReactiveAbilities, abilities.js:271-285 (invoked from placeCard, turn.js:45).
- **Who sees it when**: Placement-time one-shot on the victim's OWN placement (it happens to the card being placed — before its battles resolve); persistent red edge mod afterward.
- **Current feedback**: Log line only (abilities.js:283) + red edge rendering; the persistent threat zone (render-overlays.js:16-29) warned beforehand; empty-cell tooltip warns too (render-grid.js:109-111). Sound: none.
- **Proposed visual**: A short red tether-snap from the intimidator to the just-placed card: a claw-like arc lashes out, strikes the card's highest edge, and recoils (450ms) — directional, so the player knows WHICH neighbor taxed them.
- **Proposed sound**: quick whip-crack with a low bass tail.
- **DALL-E prompt**: "Single jagged crimson energy whip arc lashing diagonally across the frame and recoiling, sharp claw-like tip with a small red impact flick at the strike point, fast aggressive lash motion trails, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Laser focus collapse
- **Category**: Offensive / **ID**: `laser-focus-collapse`
- **Trigger**: On placement, all four base edges sum into the forward (enemy-facing) edge via accumulating edgeMod; other edges drop to 0 base (buffs stay additive on top): abilities.js:61-86 (P2-mirrored forward edge). Any battle the collapsed edge then fights is an ordinary win/loss — the "supercharged battle" is `battle-win-*` with an unusually large value; the unique moment is the collapse itself.
- **Who sees it when**: Placement-time one-shot; persistent rendering afterward (non-active edges dimmed/struck-through, render-grid.js:306-337).
- **Current feedback**: Log "LASER FOCUS: … concentrates forward: N=14" (abilities.js:77/83); persistent dimmed side edges with the forward edge full-strength. Sound: none.
- **Proposed visual**: Three thin light-streams drain from the side/back edges, spiral into the card center, and discharge as one thick charging beam-glow on the forward edge that overshoots slightly and settles (700ms). Feels like a capacitor charging.
- **Proposed sound**: three quick ascending suction whooshes converging into a bass-heavy charge-up hum.
- **DALL-E prompt**: "Three thin streams of luminous energy being drawn from the edges of the frame spiraling inward to a bright charging core, then concentrating into one thick intense beam glow pointing upward, charge-up convergence effect in hot white and electric teal, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

---

## Category 4 — Attrition / aura

### Revenge penalty
- **Category**: Attrition / **ID**: `revenge-penalty`
- **Trigger**: A card beats an adjacent enemy REVENGE card → the WINNER takes `_revengePenalty++` (-1 VP): battle.js:94, 120 (H), 169, 187 (V). Rebuilt idempotently from the standing board every pass (reset loop battle.js:55-57) — permanent in practice since cards never leave. Capped so revenge alone can't drop a card below 1 VP (battle.js:301-302); hazards can still zero it (battle.js:304).
- **Who sees it when**: Recompute-derived but stable; the felt moment is the placement that created the winning battle (either side's). Persistent `↩-N` badge afterward.
- **Current feedback**: Placement-time `ambush-hit` red flash on the penalized winner (doComparisons, placement.js:242-254; .ambush-hit game.css:660); persistent `↩-N` counter badge (render-grid.js:359); revenge card pulses red with dashed threat overlays on adjacent enemies (render-overlays.js:62-83); empty-cell warning (render-grid.js:116-118). Sound: none.
- **Proposed visual**: A spectral backlash: a thin blood-red wisp rises from the beaten revenge card, arcs back onto the winner, and sinks in as a briefly-glowing curse mark (600ms). Direction: FROM the loser TO the winner — inverted flow vs. every attack effect, which is the point.
- **Proposed sound**: reversed-reverb whoosh ending in a hollow gong tick.
- **DALL-E prompt**: "Thin spectral blood-red wisp of vengeful energy rising and arcing backward like a returning curse, sinking into a small glowing rune-like curse mark flare, reversed ghostly flow with trailing embers, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Revenge stacked (multiple -1s)
- **Category**: Attrition (compound) / **ID**: `revenge-stacked`
- **Trigger**: One card beats TWO or more adjacent revenge cards (or its `_revengePenalty` rises above 1 across passes) — the per-adjacency `-1` accumulates: same sites as `revenge-penalty`, counter compared > 1 (render badge shows `-N`, render-grid.js:359).
- **Who sees it when**: Recompute-derived transition (penalty count increases); persistent badge.
- **Current feedback**: Only the `↩-2` badge number changes. Sound: none.
- **Proposed visual**: The curse-mark effect doubled: two wisps converge from opposite sides and the sink-in mark burns brighter with a short lingering smolder (700ms).
- **Proposed sound**: two overlapping reversed whooshes + a heavier gong.
- **DALL-E prompt**: "Two spectral blood-red energy wisps converging from opposite sides into one bright smoldering curse-mark flare at center, heavier vengeful double-impact with lingering ember particles, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Lamb zeroed by adjacent enemy
- **Category**: Attrition / **ID**: `lamb-zeroed`
- **Trigger**: ANY enemy card (hazards excluded) sits adjacent to a LAMB card → the lamb contributes 0 VP (full scoring bypass, not per-axis): battle.js:295-299. Lamb stats were set at ability assignment (all edges 0, power 5 — abilities.js:379-383). Since cards never leave, the first adjacent enemy permanently kills the bonus.
- **Who sees it when**: Recompute-derived state transition (first enemy adjacency), typically at the ENEMY's placement; persistent red-pulse state afterward.
- **Current feedback**: Golden shimmer while safe → `.lamb-enemy-adjacent` red pulsing state when compromised (render-overlays.js:87-111; game.css:1549); empty-cell warning for the owner (render-grid.js:113-115). Sound: none.
- **Proposed visual**: The golden aura visibly breaks: the gold shimmer ring cracks like an eggshell, shards fall inward, and a dull red flicker replaces it (600ms). Fire once on the safe→compromised transition.
- **Proposed sound**: delicate chime cluster abruptly damped + soft cracking snap.
- **DALL-E prompt**: "Golden halo ring of soft radiant light cracking apart like a broken shell, gleaming gold shards falling inward and dimming into a faint dull red flicker, sacrificial broken-blessing effect, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Commander buff (both directions)
- **Category**: Aura / **ID**: `commander-buff`
- **Trigger**: (a) Placing a COMMANDER buffs each adjacent friendly card +2 all edges (abilities.js:17-41); (b) placing any friendly card next to a standing commander buffs the NEW card retroactively (abilities.js:43-55). Stacks with everything, including multiple commanders. Previews include it (preview.js:71-77).
- **Who sees it when**: Placement-time one-shot per buffed card; persistent green edge values + `+2` mini-badges afterward (render-grid.js:329-332).
- **Current feedback**: Green edge numbers with glow + mod badges; commander gold aura overlay on adjacent cells (render-overlays.js:113-139 legacy positive-zone path); empty-cell hint (render-grid.js:105-107). Sound: none.
- **Proposed visual**: A gold rally pulse from the commander washes over each buffed ally, where four small upward-ticking chevrons flare briefly at the card's edges (500ms). Warm, celebratory, clearly non-damage.
- **Proposed sound**: bright brass-like rally blip + soft power-up shimmer.
- **DALL-E prompt**: "Warm golden rally pulse ring with four small upward-pointing chevron flares at the cardinal edges, rising golden light motes, heroic empowering aura burst in gold and amber, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Commander-empowered win
- **Category**: Aura (compound) / **ID**: `commander-empowered-win`
- **Trigger**: A card wins a battle it would have LOST (or tied) without its commander edgeMod — i.e. `base < theirs` but `base + edgeMod > theirs`. Not a distinct engine branch; derivable at effect time by re-running the comparison with the commander portion of `edgeMod` stripped (buff applied at abilities.js:17-55, battle math battle.js:79-91).
- **Who sees it when**: Placement-time one-shot layered onto the normal win effect.
- **Current feedback**: None — indistinguishable from a normal win (the green edge number is the only clue). Sound: none.
- **Proposed visual**: The standard win-lance gains a gold spiral wrap along its length and the impact starburst blooms gold-rimmed — "the commander made the difference" (600ms).
- **Proposed sound**: the normal zap-crack with a short brass sting layered on top.
- **DALL-E prompt**: "Neon energy lance wrapped in a spiraling ribbon of golden light striking into a radial burst with a bright gold rim, white-hot core with cyan falloff and gold accents, empowered decisive strike, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Density scoring bonus
- **Category**: Aura / **ID**: `density-bonus`
- **Trigger**: A DENSITY card contributes `power + 2` to line scoring on every pass: battle.js:281-283. Passive and permanent from placement.
- **Who sees it when**: Persistent state from placement; the one-shot moment is its own placement.
- **Current feedback**: Only the `+2` ability icon (render-grid.js:17) and ability tag; no board moment. Sound: none.
- **Proposed visual**: On placement, a brief gravity-well ripple: space appears to bend inward around the card with two faint concentric compression rings pulling in, then a dense white-gold core glint remains for a beat (600ms).
- **Proposed sound**: deep sub-bass "whomp" with a resonant settling hum.
- **DALL-E prompt**: "Gravity-well compression effect, two faint concentric rings of bent light being pulled inward toward a small ultra-dense white-gold core glint, subtle space-distortion lensing, heavy massive presence, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

---

## Category 5 — Board / tempo

### Flank extra turn
- **Category**: Tempo / **ID**: `flank-extra-turn`
- **Trigger**: A FLANK card is placed → `G._flankTriggered = owner` (turn.js:73); if the owner still has a playable card the turn does NOT pass: player branch turn.js:434-454 (toast at 456), AI branch ai.js:20-42, MP authoritative flag ai.js:26-32.
- **Who sees it when**: Placement-time one-shot (turn-flow event, not tied to a victim cell).
- **Current feedback**: Orange toast "↺ FLANK: EXTRA TURN!" (turn.js:456) or log lines for AI (ai.js:29, 37). Sound: none.
- **Proposed visual**: A cyan-orange clock-skip flourish over the placed card: a circular arrow sweeps 360° around the cell border leaving a light trail, then snaps back to 12 o'clock with a flash (700ms). Optionally tint magenta when the AI flanks.
- **Proposed sound**: fast rewind zip ending in a bright "ready" ding.
- **DALL-E prompt**: "Circular sweeping arc of light tracing a full ring like a fast clock hand with a glowing motion trail, snapping to a bright flash point at the top of the ring, energetic orange and cyan time-skip flourish, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Flank fizzle
- **Category**: Tempo / **ID**: `flank-fizzle`
- **Trigger**: FLANK resolves but the owner has no unused card with a valid placement — extra turn skipped to avoid a soft-lock: player turn.js:439 + log turn.js:455; AI ai.js:43-47; MP mover-authoritative fizzle ai.js:33.
- **Who sees it when**: Placement-time one-shot.
- **Current feedback**: Log line only ("FLANK: no playable cards for the extra turn — turn passes"). Sound: none.
- **Proposed visual**: The clock-sweep starts, stutters at ~90°, and dissolves into gray sparks (500ms) — clearly the same effect failing.
- **Proposed sound**: rewind zip that pitch-bends down and dies in static.
- **DALL-E prompt**: "Circular arc of light beginning to sweep a ring then stuttering and breaking apart into dim gray sparks and fading static particles a quarter of the way around, failed interrupted time-skip effect in desaturated orange, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Home invader drop
- **Category**: Tempo / **ID**: `home-invader-drop`
- **Trigger**: A HOME_INVADER card is placed directly on the opponent's home row — placement rule adds enemy home-row cells to the valid set (placement.js:147-157, respects fortify + hazards); on landing there, a red flash runs across the whole invaded row (abilities.js:171-183).
- **Who sees it when**: Placement-time one-shot.
- **Current feedback**: `.ambush-hit` red glow on all 7 home-row cells for 900ms (abilities.js:176-180; game.css:660). Sound: none (generic place thunk only).
- **Proposed visual**: A drop-pod slam: the card streaks down with a vertical entry-burn trail and lands with a horizontal shockwave that ripples outward along the invaded row (700ms), replacing the flat row flash.
- **Proposed sound**: descending whistle + heavy slam with rolling rumble to both sides.
- **DALL-E prompt**: "Vertical atmospheric entry streak slamming into a ground point with a low wide horizontal shockwave ripple spreading to both sides, hot orange-red entry burn over a crimson ground pulse, dramatic drop-pod landing effect, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Rush deep strike
- **Category**: Tempo / **ID**: `rush-deep-strike`
- **Trigger**: A RUSH card is placed on a cell that is ONLY legal because it's adjacent to an enemy card (bypassing tier row limits, including the enemy home row): rush cell collection placement.js:51-75, merge past the tier filter placement.js:134-144 (fortify still blocks, placement.js:140). Detect at placement by checking the target cell against the non-rush valid set.
- **Who sees it when**: Placement-time one-shot.
- **Current feedback**: None specific — the card just appears deep in enemy territory (generic `just-placed` pulse, turn.js:79-87). Sound: none.
- **Proposed visual**: Afterimage dash: 2-3 fading ghost copies of the card blur in from the player's side and collapse into the cell with a speed-line burst (500ms) — communicates "it crossed the board in one move".
- **Proposed sound**: doppler dash whoosh with a sharp arrival snap.
- **DALL-E prompt**: "High-speed dash afterimage effect, three fading translucent ghost silhouettes of a rectangular energy panel blurring along a diagonal motion path and collapsing into a sharp arrival flash with radiating speed lines, aggressive cyan-white velocity burst, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Phantom home-row placement
- **Category**: Tempo / **ID**: `phantom-placement`
- **Trigger**: A PHANTOM card is placed on a cell that is only legal via its free two-home-rows rule (placement.js:8-27; still respects enemy fortify at :17). Detect like rush: target cell ∉ normal valid set.
- **Who sees it when**: Placement-time one-shot.
- **Current feedback**: None specific. Sound: none.
- **Proposed visual**: Materialization instead of movement: the card fades in from translucent violet static — a ghostly outline resolves into solid with a soft ectoplasmic wisp curling off (600ms). Distinct from rush's speed and home invader's slam.
- **Proposed sound**: airy ethereal phase-in hum, no impact.
- **DALL-E prompt**: "Ghostly violet apparition materializing from translucent drifting mist and fine static particles into a soft solid glow, wisps of pale purple ectoplasm curling away, ethereal phase-in effect with no impact, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Birthright bonus card
- **Category**: Tempo / **ID**: `birthright-bonus`
- **Trigger**: On placing a BIRTHRIGHT card, a copy of a random unused Tier II card from the owner's own hand is added to that hand (deterministic in MP): abilities.js:196-252 (clone built 213-220, hand push 221).
- **Who sees it when**: Placement-time one-shot; the effect target is the HAND, not a board cell.
- **Current feedback**: Log + pink toast "BIRTHRIGHT: bonus card drawn" (abilities.js:245-250); the new hand card triggers the newly-eligible card pop sound (render-hand.js:23 → playCardPopSfx, audio.js:195). Closest thing to an existing ability sound.
- **Proposed visual**: A gold-pink gift-spark arcs from the placed card down toward the hand tray and bursts into a small card-shaped glow that settles into the hand slot (700ms).
- **Proposed sound**: ascending sparkle arpeggio + soft card-flip snap (can layer over existing pop).
- **DALL-E prompt**: "Small radiant card-shaped glow being born from a burst of gold and pink sparks, trailing a gentle arc of glitter light, gift-like conjuration effect, warm celebratory glow, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Deciding factor tie-break
- **Category**: Tempo / **ID**: `deciding-factor-break`
- **Trigger**: A row/column ends the scoring pass in an exact VP tie and exactly one side has a non-silenced DECIDING_FACTOR card in that line → the line flips to that side and awards bonus VP equal to the DF card's power: rows battle.js:337-350, cols battle.js:352-367, helper battle.js:333-335 (silenced excluded at :334), bonus VP battle.js:401-405, dfRows/dfCols tracking battle.js:408-409.
- **Who sees it when**: Recompute-derived and can toggle on/off as later placements change line totals; the announced moment is diffed once per change in `_gzAnnounceDfChanges` (turn.js:4-33, called from placeCard turn.js:49).
- **Current feedback**: Log line "DECIDING FACTOR: tie broken in row N for player/AI" + `just-placed` pulse on the player's DF card (turn.js:20-30). Sound: none.
- **Proposed visual**: A gold judgment sweep along the whole decided line: a thin `#ffd23f` light-bar wipes across the row/col, and a balance-tipping glint flares on the DF card itself (700ms). Fire on each dfRows/dfCols transition, tinted by the winning side.
- **Proposed sound**: gavel knock + resolving major chord swell.
- **DALL-E prompt**: "Thin horizontal bar of brilliant golden light sweeping across the frame leaving a fading luminous trail, with one bright star-like glint flare tipping the bar at its origin point, decisive judgment sweep in rich gold, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Deciding factor nullified
- **Category**: Tempo / **ID**: `deciding-factor-nullify`
- **Trigger**: A tied line contains non-silenced DF cards from BOTH sides — they cancel and the line stays tied: battle.js:344 (rows), battle.js:361 (cols).
- **Who sees it when**: Recompute-derived; no announcement exists (the `continue` skips dfRows/dfCols so `_gzAnnounceDfChanges` never fires for it).
- **Current feedback**: None at all. Sound: none.
- **Proposed visual**: Two gold glints flare at the opposing DF cards, sweep toward each other along the line, collide mid-line and extinguish into gray smoke (700ms).
- **Proposed sound**: two gavel knocks in quick succession muted by a dampened thud.
- **DALL-E prompt**: "Two golden light glints sliding toward each other along a thin horizontal line and colliding at center, extinguishing into a small puff of neutral gray smoke with fading gold embers, mutual cancellation effect, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

---

## Category 6 — Environmental

### Hazard adjacency penalty
- **Category**: Environmental / **ID**: `hazard-adjacency`
- **Trigger**: A card orthogonally adjacent to a hazard cell loses 2 VP per adjacent hazard in line scoring: adjacency count battle.js:285-289, applied in `effPower` battle.js:304 (floor 0 — hazards CAN zero a card, unlike revenge). Hazards never fight battles (excluded battle.js:73, 150) and double-strike splash skips hazard targets (battle.js:102, 126, 174, 192).
- **Who sees it when**: Persistent from the moment a card is placed beside a hazard (or would-be: previews warn). One-shot moment = that placement.
- **Current feedback**: Extensive and passive: orange pulsing blast gradients bleeding into adjacent cells (render-grid.js:364-376 cards, 436-447 empty), `-2` marker next to power (render-grid.js:300-301, 348), ⚠ icons on valid cells (render-grid.js:477-481), hover warnings "placing here costs N VP" (render-grid.js:449-453) and "⚠ HAZARD -2VP" badge during card-drag hover (render-grid.js:599-613). Sound: none.
- **Proposed visual**: One-shot on placement beside a hazard: corrosive orange embers drift from the hazard side onto the card and etch a brief scorch flicker along that edge (600ms). The existing passive gradients remain the persistent layer.
- **Proposed sound**: sizzling corrosion hiss + faint geiger-style crackle.
- **DALL-E prompt**: "Drifting corrosive orange embers and ash particles blowing sideways across the frame, etching a glowing scorched burn line along one edge with heat-haze shimmer, hostile environmental corrosion effect in deep orange and red, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Hazard zeroes a card
- **Category**: Environmental (compound) / **ID**: `hazard-zeroed-card`
- **Trigger**: Hazard penalties (plus revenge) drive a card's effective power to 0: `Math.max(0, basePower - adjHazards*2 - revPen)` battle.js:304 — e.g. a Tier I (power 1) or a double-hazard-adjacent Tier II. The card still fights but scores nothing.
- **Who sees it when**: Recompute-derived state (usually permanent from placement); one-shot at the placement that caused it.
- **Current feedback**: Only the `-2`/`-4` marker and the dimmed power number math imply it; nothing says "this card is scoring zero". Sound: none.
- **Proposed visual**: A burnout beat: the card's center power glow gutters like a dying flame and is swallowed by creeping dark-orange char, leaving a cold gray core (600ms).
- **Proposed sound**: extinguishing hiss dropping into silence.
- **DALL-E prompt**: "Small central flame of light guttering and being swallowed by creeping dark charred tendrils from the edges, dying ember fading to a cold gray core with a last spark, burnout extinguish effect in dark orange and ash gray, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

### Hazard cell presence
- **Category**: Environmental / **ID**: `hazard-cell`
- **Trigger**: 1 hazard card is seeded at game start on balanced/aggressive difficulty into a random mid-board cell (rows 1-3), owner `'hazard'`, all edges/power 0: state.js:125-191 (placement 161-183, log :183). It occupies the cell for the whole game, blocks placement there, never battles, and cannot be destroyed.
- **Who sees it when**: Persistent ambient state from game start.
- **Current feedback**: The strongest visuals in the game today: looping video background in the cell (render-grid.js:219-233), orange border + glow (render-grid.js:236-237), hover tooltip (render-grid.js:239-256), pulsing blast gradients into neighbors. Sound: none (the video is muted).
- **Proposed visual**: Keep the video; add a once-per-game *emergence* overlay at game start — a violent orange rift tears open over the cell and settles into the looping video (900ms), synced with the existing log line.
- **Proposed sound**: deep spatial rumble + tearing static, then a low ambient loop could optionally persist at very low volume.
- **DALL-E prompt**: "Violent glowing rift tearing open in space, jagged orange and ember-red crack splitting outward with volcanic light spilling from the fissure and floating debris motes, dangerous anomaly emergence, stylized holographic sci-fi card-game VFX sprite, clean neon energy forms with volumetric glow and subtle chromatic bloom, single isolated effect centered on a pure black background for additive screen blending, square 1:1 composition, crisp edges fading to pure black, no text, no letters, no numbers, no symbols, no logos, no border, no frame, no vignette, no watermark"

---

## Implementation notes

### Hook points

| Effect group | Hook | Notes |
|---|---|---|
| `battle-win-*`, `battle-loss`, `battle-tie`, `pierce-*`, `double-strike-*`, `quad-sweep` | `doComparisons` (placement.js:193-282) | Already the display-only placement pass with per-direction `iWin/iLose` and the DS half-strength branch; replace/augment `showFlash` calls (placement.js:237, 270). Quad-sweep: tally results across the direction loop and fire after it. `commander-empowered-win`: re-run the comparison minus the commander share of `edgeMod` inside the `iWin` branch. |
| `shield-block`, `shield-blocks-splash` | Transition of `card.shieldConsumedBy` from null | computeScores runs inside `placeCard` (turn.js:48) BEFORE doComparisons — snapshot `shieldConsumedBy` values pre-placement in placeCard, diff after, and key the effect off the recorded battle key (`'e:id'` vs `'dsw:id'` distinguishes direct block from splash block). doComparisons already has display branches for the direct case (placement.js:223-234). |
| `shield-spent-loss` | doComparisons `iLose` branch where `card.ability==='shield' && shieldConsumedBy !== thisKey` | Purely cosmetic layer under `battle-loss`. |
| `cloak-reveal` | Diff `card.cloakRevealed` per edge across the placeCard recompute | Set at battle.js:75-77, 152-154; fire once per newly-true edge. |
| `fortify-claim` | `applyPlacementAbility` fortify branch (abilities.js:131-142) | One-shot at the claim log line. |
| `fortify-denial` | Hover/tap handler on non-valid cells (render-grid.js:632-668) when `cell.fortifiedBy && fortifiedBy !== 'player'` | Event-driven, repeatable. |
| `sniper-*`, `intimidate-placement`, `laser-focus-collapse`, `home-invader-drop`, `birthright-bonus` | `applyPlacementAbility` (abilities.js:5-254) at the respective branches | All already have log/toast lines to co-locate with. Home invader currently flashes rows at abilities.js:176-180 — replace. |
| `intimidate-reactive` | `fireReactiveAbilities` intimidate case (abilities.js:271-285) | Victim = the just-placed card; source cell known for directional lash. |
| `revenge-penalty` / `revenge-stacked` | Diff `_revengePenalty` per card across the placeCard recompute (reset battle.js:55-57 makes it a clean pure function) | doComparisons has the current ambush-hit flashes (placement.js:242-254) to replace. Stacked = new value > 1. |
| `lamb-zeroed` | Transition detection in the recompute: lamb had no adjacent enemy before this placement, has one now (battle.js:295-299 predicate) | renderPassiveAbilityGlows (render-overlays.js:87-111) already computes the adjacency — reuse. |
| `commander-buff` | Both commander branches in abilities.js (17-41, 43-55) | Fire per buffed card. |
| `density-bonus`, `rush-deep-strike`, `phantom-placement` | placeCard, immediately after `applyPlacementAbility` (turn.js:44) | Rush/phantom detection: compute `getValidPlacements` with `card.ability` temporarily nulled and check the target cell's absence (the phantom branch itself uses this trick, placement.js:22-24). |
| `flank-extra-turn` / `flank-fizzle` | turn.js:434-456 (player), ai.js:20-47 (AI) | Both branches already log/toast. |
| `deciding-factor-break` | `_gzAnnounceDfChanges` (turn.js:4-33) | Already diffs dfRows/dfCols exactly once per change. |
| `deciding-factor-nullify` | Extend computeScores to also return "nullified lines" (the `continue` at battle.js:344, 361), diff them in `_gzAnnounceDfChanges` | Currently invisible; needs the small engine return-value addition (keep computeScores pure — return data, announce in turn.js). |
| `hazard-adjacency`, `hazard-zeroed-card` | placeCard when the placed cell borders a hazard (adjacency test as in render-grid.js:300) / power-hits-zero diff | Passive layers already exist in render-grid/render-overlays. |
| `hazard-cell` emergence | initGame hazard placement (state.js:161-183) | Once per game. |

### Critical timing caveat
`computeScores`/`computeBattleResults` run MANY times (every renderAll — state.js:375; inside placeCard — turn.js:48; at game end — turn.js:135). All mutation-bearing states (`shieldConsumedBy`, `cloakRevealed`, `_revengePenalty`, `_silenced`, `edgeMod`) must drive effects via **before/after diffing around the single placeCard recompute**, never via "value is set" checks, or effects will re-fire on every recompute. The engine's own idempotency design (revenge reset battle.js:50-57, shield battle-key memory battle.js:28-36) makes diffing safe.

### Layering / z-index
Existing stack inside `#grid` cells: passive zone overlays z=1-3, silenced overlay z=4, badges z=5-7, pierce/DS hover flashes z=9, preview badges z=12, hazard warn z=14, battle chips z=22 (grid-level). Recommendation: render one-shot interaction sprites in a **dedicated grid-level effects layer at z-index 30** (above chips, below tooltips — #tooltip is fixed-position), positioned via the existing `gzCellRect(r,c)` helper (render-grid.js:43-47) so MP P2's 180°-flipped board and mobile strides are handled for free. Use `mix-blend-mode: screen` (sprites are on black) + CSS `hue-rotate` for owner tinting of the white/cyan-core sprites. Tag every node `data-fx="1"` and purge them in renderGrid's reuse cleanup (render-grid.js:701-708) alongside `[data-bpv]`/`[data-abil-flash]`.

### Simultaneity / stacking rules
A single placement can legitimately fire, in one resolution: laser-focus-collapse or commander-buff (self), intimidate-reactive (against it), up to 4 battle outcomes, pierce conversions, shield-block, double-strike splash + shield-blocks-splash, revenge-penalty, lamb-zeroed, deciding-factor-break/nullify, flank-extra-turn, and hazard-adjacency. Recommended sequencing:

1. **Placement-identity effects first** (rush/phantom/home-invader/laser-focus/density/commander buffs/intimidate both ways): 0-400ms, on/around the placed cell.
2. **Battle wave** staggered per direction N→W→E→S at ~120ms intervals (matches doComparisons loop order via DIRS4): win/loss/tie/pierce/shield effects per direction; DS splash chains +150ms after its direct hit.
3. **Consequence wave** (~500ms): revenge, lamb-zeroed, sniper (its victim is far away — give it the full 800ms beat alone), deciding-factor sweeps.
4. **Tempo toasts last** (flank, birthright) — they concern the NEXT action.

Cap concurrent sprites (suggest 6) and fall back to the simple flash for overflow; battles on opposite sides of the placed card never overlap spatially, so the main collision risk is quad-sweep (which intentionally replaces the four individual impacts' finale) and shield-block layering over battle-win at the same shared edge (render the shield on the defender's cell, the lance stops at the barrier — suppress the loser-side `battle-loss` shatter when a shield absorbed).

### Audio today
There are NO battle or ability sounds — only UI sounds: hover (audio.js:147), card place (159, reused softer+delayed for AI, turn.js:53-67), select click (171), deck expand (183), new-card pop (195, incidentally fires for birthright clones via render-hand.js:23), mobile swish (mobile.js:229), and the music playlist. Every "Proposed sound" above is net-new; route them through a small `playFxSfx(id)` helper honoring `_sfxMuted`/`_sfxVol` (audio.js:29-31) like the existing players.
