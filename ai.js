function animateAiCard(card, r, c, noTurnFlip = false) {

  const grid   = document.getElementById('grid');

  const target = grid?.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);

  // Source: AI avatar in the faction HUD (top-left), or top-center of viewport

  const srcEl  = document.getElementById('sbAiAvatar') ||

                 document.getElementById('fhAi');

  // Single completion path: placement + flank handling + turn flip.
  // Used by BOTH the animated branch and the no-DOM fallback so headless /
  // degraded environments get identical game flow.
  const _finish = () => {

    placeCard(card, r, c, 'ai');

    if (G._flankTriggered === 'ai' && !G.gameOver) {

      G._flankTriggered = null;

      if (_mpRoom && _mpPlayer) {

        // MP: the move's flank flag (noTurnFlip) is authoritative — the mover
        // only submits flank=true when it actually takes the extra turn.
        if (noTurnFlip) {
          addLog('ai', '↺ FLANK — opponent takes extra turn');
          mpStartPolling();
          return;
        }
        // Fizzled flank (opponent had no playable card): fall through to normal flip

      } else if (hasAnyMoves('ai')) {

        addLog('ai', '↺ FLANK — AI takes extra turn');

        setTimeout(aiTurn, 1000);

        return;

      } else {

        addLog('ai', '↺ FLANK — AI has no cards left, turn passes');

      }

    }

    if (!G.gameOver && !noTurnFlip) {

      G.turn = 'player';

      G._placeInFlight = false;   // player may act again

      renderScoreHeader();

      if (!hasAnyMoves('player')) {

        G.turn = 'ai';

        if (_mpRoom && _mpPlayer) {

          addLog('system', 'You have no valid moves: opponent continues');

          mpStartPolling();

        } else {

          addLog('system', 'You have no moves -- AI goes again');

          setTimeout(aiTurn, 1200);

        }

      }

    }

  };

  if (!target || !srcEl) { _finish(); return; }

  const src  = srcEl.getBoundingClientRect();

  const tgt  = target.getBoundingClientRect();

  const aCol = window.aiFactionColor || '#ff0080';

  // Start position: center of source element

  const startL = src.left + src.width  / 2 - tgt.width  / 2;

  const startT = src.top  + src.height / 2 - tgt.height / 2;

  const floater = document.createElement('div');

  floater.style.cssText = `

    position:fixed; z-index:9200; pointer-events:none;

    width:${tgt.width}px; height:${tgt.height}px;

    left:${startL}px; top:${startT}px;

    border-radius:6px;

    background:#050510 center/cover no-repeat;

    ${card.art ? `background-image:url('${typeof gzCardArt === 'function' ? gzCardArt(card.art) : card.art}');` : ''}

    border:2px solid ${aCol}99;

    box-shadow: 0 0 28px ${aCol}66, 0 8px 32px #000000cc;

    opacity:1;

    transition: left 0.42s cubic-bezier(0.4,0,0.2,1),

                top  0.42s cubic-bezier(0.4,0,0.2,1),

                opacity 0.18s ease;

  `;

  document.body.appendChild(floater);

  // Double rAF: first frame paints start pos; second starts the transition

  requestAnimationFrame(() => requestAnimationFrame(() => {

    floater.style.left = tgt.left + 'px';

    floater.style.top  = tgt.top  + 'px';

  }));

  // Fade out as it arrives, then place

  setTimeout(() => { floater.style.opacity = '0'; }, 360);

  setTimeout(() => {

    floater.remove();

    _finish();

  }, 580);

}

function animatePlayerCard(card, r, c, callback) {
  const grid   = document.getElementById('grid');
  const target = grid?.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  // On mobile the player hand bar is at the bottom: use that as the launch point
  const srcEl  = document.querySelector('.player-area') ||
                 document.getElementById('sbPlayerAvatar') ||
                 document.getElementById('fhPlayer');
  if (!target || !srcEl) { callback(); return; }

  const src  = srcEl.getBoundingClientRect();
  const tgt  = target.getBoundingClientRect();
  const pCol = window.playerFactionColor || '#00ffcc';

  const startL = src.left + src.width  / 2 - tgt.width  / 2;
  const startT = src.top  + src.height / 2 - tgt.height / 2;

  const floater = document.createElement('div');
  floater.style.cssText = `
    position:fixed; z-index:9200; pointer-events:none;
    width:${tgt.width}px; height:${tgt.height}px;
    left:${startL}px; top:${startT}px;
    border-radius:6px;
    background:#050510 center/cover no-repeat;
    ${card.art ? `background-image:url('${typeof gzCardArt === 'function' ? gzCardArt(card.art) : card.art}');` : ''}
    border:2px solid ${pCol}99;
    box-shadow: 0 0 28px ${pCol}66, 0 8px 32px #000000cc;
    opacity:1;
    transition: left 0.38s cubic-bezier(0.4,0,0.2,1),
                top  0.38s cubic-bezier(0.4,0,0.2,1),
                opacity 0.16s ease;
  `;
  document.body.appendChild(floater);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    floater.style.left = tgt.left + 'px';
    floater.style.top  = tgt.top  + 'px';
  }));

  setTimeout(() => { floater.style.opacity = '0'; }, 320);
  setTimeout(() => { floater.remove(); callback(); }, 520);
}

// ═══════════════════════════════════════════════════════════════════════════
// AI BRAIN — one-ply move simulation + softmax selection.
//
// Difficulty = DECISION QUALITY (not stat cheats):
//   passive    — shallow heuristic, high temperature, no denial, no ability
//                reasoning, occasional deliberately-OK moves.
//   balanced   — full one-ply board simulation, moderate temperature,
//                contextual ability valuation.
//   aggressive — full simulation + player-best-reply threat denial, strong
//                ability synergy, low temperature. (The ×1.1 battle buff from
//                gzAiBuffMult is separate, established balance — unchanged.)
//
// The evaluator NEVER mutates G: it works on a lightweight snapshot of the
// grid. CLOAK fairness: the AI may not read unrevealed player cloak edges —
// it substitutes a tier-based expected value instead (the old AI cheated).
// PvE-only: aiTurn is never invoked in multiplayer (moves come from network).
// ═══════════════════════════════════════════════════════════════════════════

// Expected edge value per tier — used for cloak-hidden player edges.
// (Measured deck-wide averages: I 4.95, II 5.24, III 5.25, IV 7.00)
const _AI_EDGE_EV = { 'I': 5, 'II': 5.25, 'III': 5.25, 'IV': 7 };

const _AI_DIRS = [
  { dr:-1, dc:0, myE:'n', theirE:'s' },
  { dr: 1, dc:0, myE:'s', theirE:'n' },
  { dr: 0, dc:1, myE:'e', theirE:'w' },
  { dr: 0, dc:-1, myE:'w', theirE:'e' },
];

function _aiProfile() {
  const d = (typeof window !== 'undefined' && window.aiDifficulty) || 'balanced';
  if (d === 'passive')
    return { name:'passive', full:false, denial:false, ability:false,
             temp:3.5, topK:12, blunder:0.30, holdTax:0 };
  if (d === 'aggressive')
    return { name:'aggressive', full:true, denial:true, ability:true,
             temp:0.5, topK:4, blunder:0, holdTax:0.30 };
  return { name:'balanced', full:true, denial:false, ability:true,
           temp:0.8, topK:5, blunder:0.03, holdTax:0.30 };
}

// ── Faction AI personalities (PvE only — layered ON TOP of difficulty) ──────
// Difficulty controls decision QUALITY (simulation, denial, noise floor);
// personality biases WHAT the AI wants. Archetypes are derived from each
// faction's ability pool (FACTION_ABILITY_POOLS) + lore:
//
//   faction    | pool                                        | archetype
//   -----------+---------------------------------------------+---------------------------
//   lithos     | deciding_factor, commander, fortify, shield | DEFENSIVE (fortress)
//   crystallis | density, fortify, shield, revenge           | DEFENSIVE (bulwark)
//   entropy    | lamb, laser_focus, intimidate, revenge      | defensive-opportunist
//   terran     | commander, flank, shield, double_strike     | NEUTRAL (combined arms)
//   choir      | commander, flank, cloak, birthright         | neutral-supportive
//   quantum    | density, flank, phantom, sniper             | neutral-tricky
//   veil       | flank, phantom, pierce, cloak               | skirmisher (tempo)
//   mycos      | lamb, intimidate, home_invader, birthright  | offensive-opportunist
//   brood      | commander, laser_focus, rush, birthright    | OFFENSIVE (swarm)
//   gas        | deciding_factor, rush, home_invader, ds     | OFFENSIVE (raider)
//   void       | rush, pierce, cloak, sniper                 | OFFENSIVE (hunter)
//
// Knobs: aggression = value of contesting player-won lines; risk = tolerance
// for unsupported deep placements (scales overextension penalty inversely);
// invasion = rush/home_invader appetite; defense = home development +
// shield/fortify value; tempo = flank/extra-turn value; tempMod = softmax
// temperature multiplier (>1 = more erratic).
const FACTION_AI_PROFILES = {
  _default:   { aggression:1.00, risk:1.00, invasion:1.00, defense:1.00, tempo:1.00, tempMod:1.00 },
  terran:     { aggression:1.00, risk:1.00, invasion:1.00, defense:1.00, tempo:1.00, tempMod:1.00 },
  choir:      { aggression:0.95, risk:0.95, invasion:0.90, defense:1.10, tempo:1.10, tempMod:1.00 },
  quantum:    { aggression:1.00, risk:1.10, invasion:1.00, defense:0.95, tempo:1.15, tempMod:1.20 },
  lithos:     { aggression:0.80, risk:0.70, invasion:0.60, defense:1.50, tempo:0.90, tempMod:0.90 },
  crystallis: { aggression:0.85, risk:0.75, invasion:0.70, defense:1.40, tempo:0.90, tempMod:0.90 },
  entropy:    { aggression:0.95, risk:0.85, invasion:0.80, defense:1.20, tempo:1.00, tempMod:1.05 },
  veil:       { aggression:1.10, risk:1.20, invasion:1.10, defense:0.85, tempo:1.30, tempMod:1.25 },
  mycos:      { aggression:1.15, risk:1.10, invasion:1.35, defense:0.90, tempo:1.00, tempMod:1.00 },
  brood:      { aggression:1.25, risk:1.15, invasion:1.25, defense:0.85, tempo:1.15, tempMod:1.00 },
  gas:        { aggression:1.30, risk:1.25, invasion:1.50, defense:0.80, tempo:1.10, tempMod:1.00 },
  void:       { aggression:1.40, risk:1.35, invasion:1.50, defense:0.70, tempo:1.20, tempMod:0.95 },
};

function _aiPersona() {
  const id = (typeof window !== 'undefined' && window.aiRaceId) || '_default';
  return FACTION_AI_PROFILES[id] || FACTION_AI_PROFILES._default;
}

// ── Snapshot: lightweight, non-mutating view of the board ──────────────────
// Cell: null | {owner:'hazard'} | {id,owner,tier,power,ability,silenced,
//               shieldKey,eff:{n,s,e,w}}  (eff = effective battle edges;
//               cloak-hidden player edges replaced by tier EV)
function _aiSnapshot() {
  const snap = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      const cell = G.grid[r][c];
      if (!cell.card) { row.push(null); continue; }
      if (cell.owner === 'hazard') { row.push({ owner:'hazard' }); continue; }
      const card = cell.card;
      const hiddenCloak = cell.owner === 'player' && card.ability === 'cloak';
      const eff = {};
      for (const d of ['n','s','e','w']) {
        if (hiddenCloak && !(card.cloakRevealed && card.cloakRevealed[d]))
          eff[d] = _AI_EDGE_EV[card.tier] || 5;   // may NOT peek — expected value
        else
          eff[d] = gzEffEdge(card, cell.owner, d);
      }
      row.push({
        id: card.id, owner: cell.owner, tier: card.tier,
        power: card.power, ability: card.ability,
        silenced: !!card._silenced,
        shieldKey: card.shieldConsumedBy || null,
        eff,
      });
    }
    snap.push(row);
  }
  return snap;
}

// -1 from the highest eff edge (INTIMIDATE tie-break order: n, s, e, w)
function _aiHitHighest(eff) {
  const mx = Math.max(eff.n, eff.s, eff.e, eff.w);
  if (eff.n === mx) { eff.n -= 1; return; }
  if (eff.s === mx) { eff.s -= 1; return; }
  if (eff.e === mx) { eff.e -= 1; return; }
  eff.w -= 1;
}

// ── Simulate placing `card` at (r,c) for `owner` on a snapshot ──────────────
// Returns a NEW snapshot (copy-on-write rows/cells); input is never mutated.
// Models placement-time ability effects: commander (both directions),
// laser_focus, intimidate (given + received), sniper silencing.
function _aiApply(snap, card, r, c, owner) {
  const ns = snap.map(row => row.slice());
  const enemy = owner === 'player' ? 'ai' : 'player';
  const mult = gzAiBuffMult(owner);
  const em = {
    n: (card.edgeMod && card.edgeMod.n) || 0, s: (card.edgeMod && card.edgeMod.s) || 0,
    e: (card.edgeMod && card.edgeMod.e) || 0, w: (card.edgeMod && card.edgeMod.w) || 0,
  };

  // Retroactive COMMANDER buff from adjacent friendly commanders (+2 all)
  let selfBonus = 0;
  for (const d of _AI_DIRS) {
    const nr = r + d.dr, nc = c + d.dc;
    if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
    const nb = ns[nr][nc];
    if (nb && nb.owner === owner && nb.ability === 'commander') selfBonus += 2;
  }

  const eff = {};
  if (card.ability === 'laser_focus') {
    const total = card.edges.n + card.edges.s + card.edges.e + card.edges.w;
    const fwd = owner === 'ai' ? 's' : 'n';   // PvE orientation
    for (const d of ['n','s','e','w'])
      eff[d] = Math.round(((d === fwd ? total : 0) + em[d] + selfBonus) * mult);
  } else {
    for (const d of ['n','s','e','w'])
      eff[d] = Math.round((card.edges[d] + em[d] + selfBonus) * mult);
  }

  // Enemy INTIMIDATE reaction: each adjacent enemy intimidator strips 1
  for (const d of _AI_DIRS) {
    const nr = r + d.dr, nc = c + d.dc;
    if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
    const nb = ns[nr][nc];
    if (nb && nb.owner === enemy && nb.ability === 'intimidate') _aiHitHighest(eff);
  }

  ns[r][c] = {
    id: card.id, owner, tier: card.tier, power: card.power,
    ability: card.ability, silenced: false, shieldKey: null, eff,
  };

  // COMMANDER placed: adjacent friendlies +2 all edges (clone before edit)
  if (card.ability === 'commander') {
    for (const d of _AI_DIRS) {
      const nr = r + d.dr, nc = c + d.dc;
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
      const nb = ns[nr][nc];
      if (nb && nb.owner === owner && nb.owner !== 'hazard') {
        const b = 2 * gzAiBuffMult(nb.owner);
        ns[nr][nc] = { ...nb, eff: { n:nb.eff.n+b, s:nb.eff.s+b, e:nb.eff.e+b, w:nb.eff.w+b } };
      }
    }
  }

  // INTIMIDATE placed: adjacent enemies lose 1 from highest edge
  if (card.ability === 'intimidate') {
    for (const d of _AI_DIRS) {
      const nr = r + d.dr, nc = c + d.dc;
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
      const nb = ns[nr][nc];
      if (nb && nb.owner === enemy) {
        const ce = { ...nb.eff };
        _aiHitHighest(ce);
        ns[nr][nc] = { ...nb, eff: ce };
      }
    }
  }

  // SNIPER placed: silence highest-power enemy card on their home row
  if (card.ability === 'sniper') {
    const homeRow = owner === 'ai' ? 4 : 0;
    let bi = -1, bp = -1;
    for (let sc = 0; sc < 7; sc++) {
      const t = ns[homeRow][sc];
      if (t && t.owner === enemy && !t.silenced && t.power > bp) { bp = t.power; bi = sc; }
    }
    if (bi >= 0) ns[homeRow][bi] = { ...ns[homeRow][bi], silenced: true };
  }

  return ns;
}

// ── Pure board evaluation on a snapshot ─────────────────────────────────────
// Mirrors computeBattleResults + computeScores (pierce/shield/double-strike/
// revenge/lamb/density/hazard/deciding-factor/silence + net-win-per-axis rule).
function _aiScore(snap) {
  const bt = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) row.push({ hW:0, hL:0, vW:0, vL:0 });
    bt.push(row);
  }
  const revPen = [];
  for (let r = 0; r < 5; r++) revPen.push([0,0,0,0,0,0,0]);

  // Local shield state (never touches real cards)
  const sKey = new Map();
  const absorbs = (cell, key) => {
    if (!cell || cell.ability !== 'shield') return false;
    let k = sKey.has(cell) ? sKey.get(cell) : cell.shieldKey;
    if (!k) { sKey.set(cell, key); return true; }
    return k === key;
  };

  const fight = (r, c, r2, c2, myE, theirE, dsKeyPrefix, dr, dc) => {
    const a = snap[r][c], b = snap[r2][c2];
    const me = a.eff[myE], them = b.eff[theirE];
    const pMe = a.ability === 'pierce', pThem = b.ability === 'pierce';
    const horiz = dr === 0;
    if (me > them || (me === them && pMe && !pThem)) {
      if (horiz) { bt[r][c].hW++; if (!absorbs(b, theirE + ':' + a.id)) bt[r2][c2].hL++; }
      else       { bt[r][c].vW++; if (!absorbs(b, theirE + ':' + a.id)) bt[r2][c2].vL++; }
      if (b.ability === 'revenge') revPen[r][c]++;
      // DOUBLE STRIKE second hit at half strength
      if (a.ability === 'double_strike') {
        const fr = r2 + dr, fc = c2 + dc;
        if (fr >= 0 && fr < 5 && fc >= 0 && fc < 7) {
          const far = snap[fr][fc];
          if (far && far.owner !== a.owner && far.owner !== 'hazard') {
            const me2 = Math.max(1, Math.floor(me / 2));
            if (me2 > far.eff[theirE] && !absorbs(far, 'ds' + theirE + ':' + a.id)) {
              if (horiz) bt[fr][fc].hL++; else bt[fr][fc].vL++;
            }
          }
        }
      }
      return;
    }
    if (them > me || (me === them && pThem && !pMe)) {
      if (horiz) { bt[r2][c2].hW++; if (!absorbs(a, myE + ':' + b.id)) bt[r][c].hL++; }
      else       { bt[r2][c2].vW++; if (!absorbs(a, myE + ':' + b.id)) bt[r][c].vL++; }
      if (a.ability === 'revenge') revPen[r2][c2]++;
      if (b.ability === 'double_strike') {
        const fr = r - dr, fc = c - dc;
        if (fr >= 0 && fr < 5 && fc >= 0 && fc < 7) {
          const far = snap[fr][fc];
          if (far && far.owner !== b.owner && far.owner !== 'hazard') {
            const me2 = Math.max(1, Math.floor(them / 2));
            if (me2 > far.eff[myE] && !absorbs(far, 'ds' + myE + ':' + b.id)) {
              if (horiz) bt[fr][fc].hL++; else bt[fr][fc].vL++;
            }
          }
        }
      }
    }
    // pure tie: no effect
  };

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = snap[r][c];
      if (!cell || cell.owner === 'hazard') continue;
      if (c < 6) {
        const east = snap[r][c+1];
        if (east && east.owner !== cell.owner && east.owner !== 'hazard')
          fight(r, c, r, c+1, 'e', 'w', 'ds', 0, 1);
      }
      if (r < 4) {
        const south = snap[r+1][c];
        if (south && south.owner !== cell.owner && south.owner !== 'hazard')
          fight(r, c, r+1, c, 's', 'n', 'ds', 1, 0);
      }
    }
  }

  // Row/col power sums (net-win-per-axis rule)
  const rows = [], cols = [];
  for (let r = 0; r < 5; r++) rows.push({ p:0, a:0 });
  for (let c = 0; c < 7; c++) cols.push({ p:0, a:0 });

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = snap[r][c];
      if (!cell || cell.owner === 'hazard' || cell.silenced) continue;

      if (cell.ability === 'lamb') {
        let adjEnemy = false;
        for (const d of _AI_DIRS) {
          const nr = r + d.dr, nc = c + d.dc;
          if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
          const nb = snap[nr][nc];
          if (nb && nb.owner !== cell.owner && nb.owner !== 'hazard') { adjEnemy = true; break; }
        }
        if (adjEnemy) continue;
      }

      const base = cell.ability === 'density' ? cell.power + 2 : cell.power;
      let adjHaz = 0;
      for (const d of _AI_DIRS) {
        const nr = r + d.dr, nc = c + d.dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7 && snap[nr][nc] && snap[nr][nc].owner === 'hazard') adjHaz++;
      }
      const rp = Math.min(revPen[r][c], Math.max(0, base - 1));
      const effPower = Math.max(0, base - adjHaz * 2 - rp);

      const b = bt[r][c];
      const countsH = b.hW > b.hL || (b.hW === 0 && b.hL === 0);
      const countsV = b.vW > b.vL || (b.vW === 0 && b.vL === 0);
      if (countsH) { if (cell.owner === 'player') rows[r].p += effPower; else rows[r].a += effPower; }
      if (countsV) { if (cell.owner === 'player') cols[c].p += effPower; else cols[c].a += effPower; }
    }
  }

  let pVP = 0, aVP = 0, pWins = 0, aWins = 0;
  const rowRes = [], colRes = [];
  rows.forEach(rr => {
    const net = rr.p - rr.a;
    if (net > 0) pVP += net; else if (net < 0) aVP += -net;
    rowRes.push(net > 0 ? 'p' : net < 0 ? 'a' : 'tie');
  });
  cols.forEach(cc => {
    const net = cc.p - cc.a;
    if (net > 0) pVP += net; else if (net < 0) aVP += -net;
    colRes.push(net > 0 ? 'p' : net < 0 ? 'a' : 'tie');
  });

  // DECIDING FACTOR tie-breaks (+bonus VP; both sides on one line = nullified)
  const dfPower = (cells, owner) => {
    let mx = 0;
    for (const cell of cells)
      if (cell && cell.owner === owner && cell.ability === 'deciding_factor' && !cell.silenced)
        mx = Math.max(mx, cell.power || 0);
    return mx;
  };
  for (let r = 0; r < 5; r++) {
    if (rowRes[r] !== 'tie') continue;
    const pDf = dfPower(snap[r], 'player'), aDf = dfPower(snap[r], 'ai');
    if (pDf && aDf) continue;
    if (pDf) { rowRes[r] = 'p'; pVP += pDf; }
    else if (aDf) { rowRes[r] = 'a'; aVP += aDf; }
  }
  for (let c = 0; c < 7; c++) {
    if (colRes[c] !== 'tie') continue;
    const colCells = [snap[0][c], snap[1][c], snap[2][c], snap[3][c], snap[4][c]];
    const pDf = dfPower(colCells, 'player'), aDf = dfPower(colCells, 'ai');
    if (pDf && aDf) continue;
    if (pDf) { colRes[c] = 'p'; pVP += pDf; }
    else if (aDf) { colRes[c] = 'a'; aVP += aDf; }
  }
  rowRes.forEach(x => { if (x === 'p') pWins++; else if (x === 'a') aWins++; });
  colRes.forEach(x => { if (x === 'p') pWins++; else if (x === 'a') aWins++; });

  return { pVP, aVP, pWins, aWins, rowRes, colRes };
}

// Board value from the AI's perspective (VP-led; sector control as tiebreak)
function _aiValue(s) {
  return (s.aVP - s.pVP) + 0.6 * (s.aWins - s.pWins);
}

// ── Contextual ability valuation (balanced/aggressive only) ────────────────
// Value-based, not fixed priorities: the same ability scores differently
// depending on the board, so usage varies game to game. Negative values act
// as "hold the card" pressure when the ability would fizzle here.
function _aiAbilityContext(card, r, c, snap, availCount, pers) {
  if (!card.ability) return 0;
  pers = pers || FACTION_AI_PROFILES._default;
  let v = 0;
  const adj = [];
  for (const d of _AI_DIRS) {
    const nr = r + d.dr, nc = c + d.dc;
    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7) adj.push({ cell: snap[nr][nc], r: nr, c: nc });
  }
  const adjAllies  = adj.filter(x => x.cell && x.cell.owner === 'ai').length;
  const adjEnemies = adj.filter(x => x.cell && x.cell.owner === 'player').length;
  const adjEmpty   = adj.filter(x => !x.cell).length;

  switch (card.ability) {
    case 'sniper': {
      // Only valuable when a real home-row target exists — otherwise hold
      let target = false;
      for (let sc = 0; sc < 7; sc++) {
        const t = snap[4][sc];
        if (t && t.owner === 'player' && !t.silenced && t.power >= 2) { target = true; break; }
      }
      v += target ? 0.5 : -2.5;           // sim captures the silenced VP swing
      break;
    }
    case 'commander':
      // Sim captures buffs to existing allies; add future-ally potential
      v += adjAllies === 0 && adjEmpty === 0 ? -1.5 : adjEmpty * 0.3;
      break;
    case 'intimidate':
      if (adjEnemies === 0) v -= 1.2;     // fizzles with nobody to weaken
      break;
    case 'laser_focus':
      // Collapse is wasted if nothing is (or can come) in front
      if (r === 4 || (r < 4 && snap[r+1] && snap[r+1][c] && snap[r+1][c].owner === 'ai')) v -= 1.0;
      break;
    case 'fortify': {
      // Claims the forward cell — worth more when that cell is contested
      const fr = r + 1;
      if (fr < 5 && !snap[fr][c]) {
        let fv = 0.8;
        for (const d of _AI_DIRS) {
          const nr = fr + d.dr, nc = c + d.dc;
          if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7 && snap[nr][nc] && snap[nr][nc].owner === 'player') { fv += 0.7; break; }
        }
        v += fv * pers.defense;
      } else v -= 0.8;                    // nothing to claim
      break;
    }
    case 'flank':
      // Extra turn: tempo value scales with cards left to swing with
      v += availCount > 1 ? Math.min(3, 1.0 + 0.25 * (availCount - 1)) * pers.tempo : -1.0;
      break;
    case 'shield':
      // Best on exposed, contested placements (sim absorbs current losses)
      v += (adjEnemies > 0 ? 0.6 : (r >= 2 ? 0.3 : -0.4)) * pers.defense;
      break;
    case 'birthright': {
      // Bonus card only if an unused Tier II exists in hand
      const hasT2 = G.aiHand.some(x => x.tier === 'II' && !x.used && x !== card);
      v += hasT2 ? 1.2 : -1.0;
      break;
    }
    case 'cloak':
      v += r >= 2 ? 0.4 : 0;              // information denial up front
      break;
    case 'home_invader':
      if (r === 4) v += 0.5 * pers.invasion; // invasion VP swing is in the sim
      break;
    // rush/pierce/double_strike/revenge/density/lamb/deciding_factor/phantom:
    // fully captured by the board simulation — no fixed bonus
  }
  return v;
}

// Rough card strength — the "hold tax" makes strong cards demand strong spots
function _aiCardStrength(card) {
  const e = card.edges;
  return card.power + (e.n + e.s + e.e + e.w) / 8;
}

// ── Passive (beginner) shallow heuristic ───────────────────────────────────
function _aiShallowScore(card, r, c, s, snap, pers) {
  pers = pers || FACTION_AI_PROFILES._default;
  let score = 0;
  if (s.rowResults[r] !== 'a') score += 2;
  if (s.colResults[c] !== 'a') score += 2;
  let adjHaz = 0;
  for (const d of _AI_DIRS) {
    const nr = r + d.dr, nc = c + d.dc;
    if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
    const nb = snap[nr][nc];
    if (!nb) continue;
    if (nb.owner === 'hazard') { adjHaz++; continue; }
    if (nb.owner === 'player') {
      const mine = card.edges[d.myE];
      const theirs = nb.eff[d.theirE];       // cloak-safe (EV substituted)
      if (mine > theirs) score += 1.5 * pers.aggression;
      else if (mine < theirs) score -= 1.0;
    }
  }
  score -= adjHaz * 2.5;
  // Beginner stays home-side: almost never opens with a deep invasion
  score -= r * 0.9 * pers.defense;
  score += card.power * 0.25 + (2.5 - Math.abs(2.5 - c)) * 0.1;
  return score;
}

// ── Softmax pick over the top-K candidates ──────────────────────────────────
function _aiPickSoftmax(cands, temp, topK) {
  cands.sort((a, b) => b.score - a.score);
  const top = cands.slice(0, Math.max(1, topK));
  const mx = top[0].score;
  const t = Math.max(0.05, temp);
  const ws = top.map(x => Math.exp((x.score - mx) / t));
  let sum = 0;
  for (const w of ws) sum += w;
  let roll = Math.random() * sum;
  for (let i = 0; i < top.length; i++) {
    roll -= ws[i];
    if (roll <= 0) return top[i];
  }
  return top[0];
}

// ── Move selection ──────────────────────────────────────────────────────────
function _aiChooseMove(avail) {
  const prof = _aiProfile();
  const pers = _aiPersona();
  const snap = _aiSnapshot();

  const cands = [];
  for (const card of avail)
    for (const { r, c } of getValidPlacements('ai', card))
      cands.push({ card, r, c, score: 0 });
  if (!cands.length) return null;

  // Game phase = how many cards the AI has committed to the board
  let aiPlaced = 0;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++)
    if (G.grid[r][c].owner === 'ai') aiPlaced++;

  if (!prof.full) {
    // PASSIVE: shallow heuristic, no simulation, no denial
    const s = computeScores();   // pure — safe
    for (const cd of cands) cd.score = _aiShallowScore(cd.card, cd.r, cd.c, s, snap, pers);
  } else {
    // BALANCED/AGGRESSIVE: full one-ply simulation per candidate
    const sBefore = _aiScore(snap);
    const beforeVal = _aiValue(sBefore);
    // Personality: risk tolerance scales the overextension penalty inversely;
    // invasion appetite scales the early invasion-tool hold penalty inversely.
    const riskScale = Math.max(0.2, 2 - pers.risk);
    const invScale  = Math.max(0.7, 2 - pers.invasion);   // floored: even raiders respect early-game fragility
    for (const cd of cands) {
      const after = _aiApply(snap, cd.card, cd.r, cd.c, 'ai');
      const sAfter = _aiScore(after);
      cd.simVal = _aiValue(sAfter);

      // ── Game-phase shaping / overextension guard ─────────────────────────
      // Deep placements (toward the player's home) must earn their keep: a
      // lone card in enemy territory is one reply away from being flipped
      // off both its lines. "Concrete gain" = the move actually takes a
      // line from the player (or wins a new one) in the simulation.
      const lineGain = (sAfter.aWins - sBefore.aWins) + (sBefore.pWins - sAfter.pWins);
      const flipsLine = lineGain > 0;
      let support = 0, lanes = 0, vulnLanes = 0;
      const placedEff = after[cd.r][cd.c].eff;
      for (const d of _AI_DIRS) {
        const nr = cd.r + d.dr, nc = cd.c + d.dc;
        if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) continue;
        const nb = snap[nr][nc];
        if (nb && nb.owner === 'ai') support++;
        else if (!nb) {
          // empty cell = open retaliation lane; vulnerable if the player's
          // likely BEST attack edge (~7) beats the edge we present to it
          lanes++;
          if (placedEff[d.myE] < 7) vulnLanes++;
        }
      }
      let shape = 0;
      const invader = cd.card.ability === 'rush' || cd.card.ability === 'home_invader';

      // FRAGILITY HAIRCUT: a one-ply gain from an unsupported forward card is
      // easily reversed by the player's reply — discount the gain by how many
      // open lanes beat the card's facing edges. This is what stops the
      // "open with rush deep into enemy territory" habit while still allowing
      // it when the card genuinely holds (strong edges / support / no lanes).
      const deltaGain = cd.simVal - beforeVal;
      if (support === 0 && cd.r >= 2 && deltaGain > 0 && lanes > 0) {
        const frag = vulnLanes / 4;
        shape -= deltaGain * 0.9 * frag * Math.min(1.2, riskScale);
      }

      if (aiPlaced < 3) {
        // Early game: develop the home side; invasion tools are held for
        // when lines are actually contested (option value of rush's bypass).
        if (cd.r <= 1) shape += 0.6 * pers.defense;
        if (cd.r >= 2 && support === 0) shape -= (flipsLine ? 1.0 : 2.0) * (cd.r - 1) * riskScale;
        if (invader && cd.r >= 2) shape -= (flipsLine ? 2.5 : 4.0) * invScale;
      } else if (cd.r >= 3 && support === 0 && !flipsLine) {
        shape -= 0.8 * riskScale; // unsupported deep drop still needs a reason
      }

      // Personality aggression: value contesting lines the player currently owns
      shape += ((sBefore.rowRes[cd.r] === 'p' ? 1 : 0) + (sBefore.colRes[cd.c] === 'p' ? 1 : 0))
               * 1.0 * (pers.aggression - 1);
      // Personality style biases: offensive factions push forward and seek
      // contact; defensive factions keep formation (allies adjacent).
      let adjEnemy = 0;
      for (const d of _AI_DIRS) {
        const nr = cd.r + d.dr, nc = cd.c + d.dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7 &&
            snap[nr][nc] && snap[nr][nc].owner === 'player') adjEnemy++;
      }
      shape += (cd.r - 2) * 0.6 * (pers.aggression - 1);   // forward bias
      shape += adjEnemy * 0.6 * (pers.aggression - 1);      // contact bias
      shape += support * 0.4 * (pers.defense - 1);          // formation bias

      cd.score = cd.simVal + shape
        + (prof.ability ? _aiAbilityContext(cd.card, cd.r, cd.c, snap, avail.length, pers) : 0)
        - prof.holdTax * _aiCardStrength(cd.card);
      cd._after = after;
    }
  }

  // Opening variance: first 2 AI placements get extra temperature so games
  // don't all start identically (applies to every difficulty).
  // Personality temperature modifier: erratic factions pick more loosely.
  let temp = prof.temp * pers.tempMod, topK = prof.topK;
  if (aiPlaced < 2) { temp *= 2.5; topK += 6; }

  // AGGRESSIVE: THREAT DENIAL — evaluate the player's best reply to each of
  // the top candidates and prefer moves that preempt the player's swing.
  if (prof.denial) {
    cands.sort((a, b) => b.score - a.score);
    const top = cands.slice(0, aiPlaced < 2 ? 10 : 6);
    const pAvail = G.playerHand.filter(x => !x.used);
    const pMoves = [];
    for (const pc of pAvail) {
      let cells = [];
      try { cells = getValidPlacements('player', pc); } catch (e) {}
      if (cells.length) pMoves.push({ card: pc, cells });
    }
    let totalReplies = 0;
    for (const m of pMoves) totalReplies += m.cells.length;
    // Perf cap: subsample replies if the space is large
    const stride = Math.max(1, Math.ceil(totalReplies / 320));
    for (const cd of top) {
      let worst = Infinity, k = 0;
      for (const m of pMoves) {
        for (const cell of m.cells) {
          if (cell.r === cd.r && cell.c === cd.c) continue;
          if (stride > 1 && (k++ % stride) !== 0) continue;
          const v = _aiValue(_aiScore(_aiApply(cd._after, m.card, cell.r, cell.c, 'player')));
          if (v < worst) worst = v;
        }
      }
      if (worst < Infinity) cd.score += 0.5 * (worst - cd.simVal);
    }
    for (const cd of cands) delete cd._after;
    // Only the denial-adjusted top set competes (opening temp boost applies)
    return _aiPickSoftmax(top, temp, topK);
  }
  for (const cd of cands) delete cd._after;

  // PASSIVE blunder: occasionally play a merely-OK move (uniform over the
  // decent half of the candidate list)
  if (prof.blunder && Math.random() < prof.blunder) {
    cands.sort((a, b) => b.score - a.score);
    const pool = cands.slice(0, Math.max(2, Math.ceil(cands.length * 0.6)));
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return _aiPickSoftmax(cands, temp, topK);
}

function aiTurn() {

  const avail = G.aiHand.filter(c => !c.used);

  if (!avail.length) { checkWin(); return; }

  const _t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  let pick = null;
  try {
    pick = _aiChooseMove(avail);
  } catch (e) {
    // Brain failure must never stall the game — fall back to any legal move
    try { console.error('[AI] brain error, falling back:', e); } catch (_) {}
    for (const card of avail) {
      const cells = getValidPlacements('ai', card);
      if (cells.length) { pick = { card, ...cells[Math.floor(Math.random() * cells.length)] }; break; }
    }
  }

  G._aiLastMs = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - _t0;

  if (pick) {

    animateAiCard(pick.card, pick.r, pick.c);

    // Turn flip happens inside animateAiCard callback after card lands

  } else if (!G.gameOver) {

    // AI has cards but no valid placements — check for game end before handing turn back
    checkWin();
    if (!G.gameOver) {
      G.turn = 'player';
      G._placeInFlight = false;
      renderScoreHeader();
    }

  }

}
