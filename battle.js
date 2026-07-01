// ── Shared effective-edge helpers ────────────────────────────────────────
// Single source of truth for battle math. Used by computeBattleResults,
// doComparisons (placement.js) and gzPreviewBattle (preview.js).

function _gzIsMp() {
  return !!((typeof _mpRoom !== 'undefined' && _mpRoom) ||
            (typeof _mpPlayer !== 'undefined' && _mpPlayer));
}

// Aggressive-difficulty AI buff: SYMMETRIC — applies to ALL of the AI card's
// battle edges (attack AND defense, horizontal AND vertical). PvE only:
// never applied in multiplayer (both clients would disagree on who is 'ai').
function gzAiBuffMult(owner) {
  return (owner === 'ai' && !_gzIsMp() &&
          typeof window !== 'undefined' && window.aiDifficulty === 'aggressive') ? 1.1 : 1;
}

// Effective battle value of one edge: base + edgeMod, then AI buff (rounded).
function gzEffEdge(card, owner, dir) {
  const v = card.edges[dir] + (card.edgeMod?.[dir] || 0);
  return Math.round(v * gzAiBuffMult(owner));
}

// SHIELD: absorbs exactly ONE losing battle per game. The first loss consumes
// the shield and records WHICH battle consumed it ('<defending edge>:<attacker id>')
// so that recomputes suppress only that same battle's loss — every other loss
// counts normally. shieldExpended stays accurate for the renderers.
function _gzShieldAbsorbs(card, battleKey) {
  if (card.ability !== 'shield') return false;
  if (!card.shieldConsumedBy) {
    card.shieldConsumedBy = battleKey;
    card.shieldExpended = true;
    return true;
  }
  return card.shieldConsumedBy === battleKey;
}

function computeBattleResults() {

  // Use win/loss COUNTERS per axis: handles sandwiched cards correctly.

  // A card winning one V but losing another gets net=0 → no contribution (floor(½)).

  const b = Array(5).fill(null).map(() =>

    Array(7).fill(null).map(() => ({ hW:0, hL:0, vW:0, vL:0 }))

  );

  // REVENGE (idempotent): the penalty is rebuilt from scratch on every pass as
  // a pure function of the CURRENT board — a card gets exactly -1 per adjacent
  // enemy REVENGE card it beats. Cards never leave the board in this game, so
  // the penalty is effectively permanent, and repeated recomputes can no
  // longer compound it (old bug: counter += on every computeScores call).
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 7; c++)
      if (G.grid[r][c].card) G.grid[r][c].card._revengePenalty = 0;

  for (let r = 0; r < 5; r++) {

    for (let c = 0; c < 7; c++) {

      const cell = G.grid[r][c];

      if (!cell.card) continue;

      // H battle: this cell vs East neighbor

      if (c < 6) {

        const east = G.grid[r][c+1];

        if (east.card && east.owner !== cell.owner && cell.owner !== "hazard" && east.owner !== "hazard") {

          if (cell.card.ability === 'cloak') { cell.card.cloakRevealed = cell.card.cloakRevealed || {}; cell.card.cloakRevealed.e = true; }

          if (east.card.ability === 'cloak') { east.card.cloakRevealed = east.card.cloakRevealed || {}; east.card.cloakRevealed.w = true; }

          const me   = gzEffEdge(cell.card, cell.owner, 'e');

          const them = gzEffEdge(east.card, east.owner, 'w');

          const pierce = cell.card.ability === 'pierce';

          const pierceThem = east.card.ability === 'pierce';

          if (me > them || (me === them && pierce && !pierceThem)) {

            b[r][c].hW++;

            if (!_gzShieldAbsorbs(east.card, 'w:' + cell.card.id)) b[r][c+1].hL++;

            // REVENGE: east card loses H: penalize the cell card
            if (east.card.ability === 'revenge') cell.card._revengePenalty++;

            // DOUBLE STRIKE 2nd hit at half strength (skips hazards, respects shield)

            if (cell.card.ability === 'double_strike' && c < 5) {

              const far = G.grid[r][c+2];

              if (far.card && far.owner !== cell.owner && far.owner !== 'hazard') {

                const me2 = Math.max(1, Math.floor(me / 2));

                if (me2 > gzEffEdge(far.card, far.owner, 'w') &&
                    !_gzShieldAbsorbs(far.card, 'dsw:' + cell.card.id)) b[r][c+2].hL++;

              }

            }

          } else if (them > me || (me === them && pierceThem && !pierce)) {

            b[r][c+1].hW++;

            if (!_gzShieldAbsorbs(cell.card, 'e:' + east.card.id)) b[r][c].hL++;

            // REVENGE: cell loses H: penalize the east card
            if (cell.card.ability === 'revenge') east.card._revengePenalty++;

            if (east.card.ability === 'double_strike' && c > 0) {

              const far = G.grid[r][c-1];

              if (far.card && far.owner !== east.owner && far.owner !== 'hazard') {

                const me2 = Math.max(1, Math.floor(them / 2));

                if (me2 > gzEffEdge(far.card, far.owner, 'e') &&
                    !_gzShieldAbsorbs(far.card, 'dse:' + east.card.id)) b[r][c-1].hL++;

              }

            }

          }
          // else: pure tie — NO effect on either card (matches player-facing TIE)

        }

      }

      // V battle: this cell vs South neighbor

      if (r < 4) {

        const south = G.grid[r+1][c];

        if (south.card && south.owner !== cell.owner && cell.owner !== "hazard" && south.owner !== "hazard") {

          if (cell.card.ability === 'cloak')  { cell.card.cloakRevealed = cell.card.cloakRevealed || {}; cell.card.cloakRevealed.s = true; }

          if (south.card.ability === 'cloak') { south.card.cloakRevealed = south.card.cloakRevealed || {}; south.card.cloakRevealed.n = true; }

          const me   = gzEffEdge(cell.card, cell.owner, 's');

          const them = gzEffEdge(south.card, south.owner, 'n');

          const pierceCell  = cell.card.ability === 'pierce';
          const pierceSouth = south.card.ability === 'pierce';

          if (me > them || (me === them && pierceCell && !pierceSouth)) {

            b[r][c].vW++;

            if (!_gzShieldAbsorbs(south.card, 'n:' + cell.card.id)) b[r+1][c].vL++;

            if (south.card.ability === 'revenge') cell.card._revengePenalty++;

            // DOUBLE STRIKE downward at half strength (skips hazards, respects shield)
            if (cell.card.ability === 'double_strike' && r < 3) {
              const far = G.grid[r+2][c];
              if (far.card && far.owner !== cell.owner && far.owner !== 'hazard') {
                const me2 = Math.max(1, Math.floor(me / 2));
                if (me2 > gzEffEdge(far.card, far.owner, 'n') &&
                    !_gzShieldAbsorbs(far.card, 'dsn:' + cell.card.id)) b[r+2][c].vL++;
              }
            }

          } else if (me < them || (me === them && pierceSouth && !pierceCell)) {

            b[r+1][c].vW++;

            if (!_gzShieldAbsorbs(cell.card, 's:' + south.card.id)) b[r][c].vL++;

            if (cell.card.ability === 'revenge') south.card._revengePenalty++;

            // DOUBLE STRIKE upward at half strength (skips hazards, respects shield)
            if (south.card.ability === 'double_strike' && r > 0) {
              const far = G.grid[r-1][c];
              if (far.card && far.owner !== south.owner && far.owner !== 'hazard') {
                const me2 = Math.max(1, Math.floor(them / 2));
                if (me2 > gzEffEdge(far.card, far.owner, 's') &&
                    !_gzShieldAbsorbs(far.card, 'dss:' + south.card.id)) b[r-1][c].vL++;
              }
            }

          }
          // else: pure tie — NO effect on either card (matches player-facing TIE)

        }

      }

    }

  }

  // ── Derive h/v strings from net counters (net win rule) ──────────────

  // H: win if hW > hL; lose if hL > hW; tie if equal but > 0; none if both 0

  // V: same. Win one / lose one = tie = 0 contribution (floor of ½ power).

  for (let r = 0; r < 5; r++) {

    for (let c = 0; c < 7; c++) {

      const bb = b[r][c];

      bb.h = bb.hW > bb.hL ? 'win'

           : bb.hL > bb.hW ? 'lose'

           : (bb.hW > 0)   ? 'tie'

           : 'none';

      bb.v = bb.vW > bb.vL ? 'win'

           : bb.vL > bb.vW ? 'lose'

           : (bb.vW > 0)   ? 'tie'

           : 'none';

    }

  }

  return b;

}

function computeScores() {

  const battles = computeBattleResults();

  // Store on grid for rendering

  for (let r = 0; r < 5; r++)

    for (let c = 0; c < 7; c++)

      if (G.grid[r][c].card) G.grid[r][c].battle = battles[r][c];

  const rows = Array(5).fill(null).map(() => ({ p:0, a:0 }));

  const cols = Array(7).fill(null).map(() => ({ p:0, a:0 }));

  for (let r = 0; r < 5; r++) {

    for (let c = 0; c < 7; c++) {

      const cell = G.grid[r][c];

      if (!cell.card || cell.owner === 'hazard') continue;

      // SNIPER: sniped card contributes 0 VP


      const bat = battles[r][c];

      const countsH = bat.h === 'win' || bat.h === 'none';

      const countsV = bat.v === 'win' || bat.v === 'none';

      // DENSITY: +2 flat bonus power

      const basePower = cell.card.ability === 'density'

        ? cell.card.power + 2 : cell.card.power;

      // COSMIC HAZARD penalty: -2 per adjacent hazard card

      const _adjHazards = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]

        .filter(({dr,dc}) => { const rr=r+dr,cc=c+dc; return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard'; }).length;

      // SNIPER: silenced cards contribute 0 VP
      if (cell.card._silenced) continue;

      // LAMB: 0 VP if ANY enemy is adjacent (full bypass, not per-axis)
      if (cell.card.ability === 'lamb') {
        const _hasAdjEnemy = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
          .some(({dr,dc}) => { const rr=r+dr,cc=c+dc; return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].card&&G.grid[rr][cc].owner!==cell.owner&&G.grid[rr][cc].owner!=='hazard'; });
        if (_hasAdjEnemy) continue;
      }

      // REVENGE: cap penalty so revenge alone can't zero a card (floor 1 after revenge only)
      const _revPen = Math.min(cell.card._revengePenalty || 0, Math.max(0, basePower - 1));
      // Hazard CAN zero a card out — use floor 0 so tooltip and score agree
      const effPower = Math.max(0, basePower - _adjHazards * 2 - _revPen);

      if (countsH) { if (cell.owner==='player') rows[r].p += effPower; else rows[r].a += effPower; }

      if (countsV) { if (cell.owner==='player') cols[c].p += effPower; else cols[c].a += effPower; }

    }

  }

  // Who wins each row/col (for badge coloring + chip display)

  let rowResults = rows.map(r => r.p > r.a ? 'p' : r.a > r.p ? 'a' : 'tie');

  let colResults = cols.map(c => c.p > c.a ? 'p' : c.a > c.p ? 'a' : 'tie');

  // Snapshot BEFORE DECIDING FACTOR mutations (for dfRows/dfCols tracking)
  const rawRowResults = rowResults.slice();
  const rawColResults = colResults.slice();

  // DECIDING FACTOR: breaks ties — but if both sides have one in the same row/col they nullify each other.
  // RULE: a DF-decided line scores as if the DF owner had won it by the DF card's
  // power — the winner gains bonus VP equal to the (highest) DF card's power on
  // that line. This makes DF a real VP swing, not just badge coloring.
  // NOTE: computeScores is PURE (no logging / DOM). placeCard (turn.js)
  // announces DF changes by diffing dfRows/dfCols between placements.

  let dfBonusP = 0, dfBonusA = 0;

  const _dfPower = (cells, owner) => cells.reduce((mx, cell) =>
    (cell.card && cell.owner === owner && cell.card.ability === 'deciding_factor' && !cell.card._silenced)
      ? Math.max(mx, cell.card.power || 0) : mx, 0);

  for (let r = 0; r < 5; r++) {

    if (rowResults[r] === 'tie') {

      const pDf  = _dfPower(G.grid[r], 'player');
      const aiDf = _dfPower(G.grid[r], 'ai');

      if (pDf && aiDf) continue;          // both sides — nullified, stays tie
      if (pDf)  { rowResults[r] = 'p'; dfBonusP += pDf;  }
      else if (aiDf) { rowResults[r] = 'a'; dfBonusA += aiDf; }

    }

  }

  for (let c = 0; c < 7; c++) {

    if (colResults[c] === 'tie') {

      const colCells = Array(5).fill(null).map((_, r) => G.grid[r][c]);

      const pDf  = _dfPower(colCells, 'player');
      const aiDf = _dfPower(colCells, 'ai');

      if (pDf && aiDf) continue;          // nullified
      if (pDf)  { colResults[c] = 'p'; dfBonusP += pDf;  }
      else if (aiDf) { colResults[c] = 'a'; dfBonusA += aiDf; }

    }

  }

  // Net VP scoring: winner earns (their power − loser power) for each line

  let pWins = 0, aWins = 0;

  rowResults.forEach(r => { if(r==='p')pWins++; if(r==='a')aWins++; });

  colResults.forEach(c => { if(c==='p')pWins++; if(c==='a')aWins++; });

  // Delta scoring: winner gets (their power - loser power) per line

  let pVP = 0, aVP = 0;

  rows.forEach((row, ri) => {

    const net = row.p - row.a;

    if (net > 0) pVP += net;

    else if (net < 0) aVP += (-net);

  });

  cols.forEach((col, ci) => {

    const net = col.p - col.a;

    if (net > 0) pVP += net;

    else if (net < 0) aVP += (-net);

  });

  // DECIDING FACTOR bonus VP: tied lines score for the DF owner (see rule above)

  pVP += dfBonusP;

  aVP += dfBonusA;

  // Track which rows/cols were decided by DECIDING FACTOR (was a tie pre-DF, became a win post-DF)
  const dfRows = rowResults.map((res, r) => rawRowResults[r] === 'tie' && res !== 'tie' ? res : null);
  const dfCols = colResults.map((res, c) => rawColResults[c] === 'tie' && res !== 'tie' ? res : null);

  return { rows, cols, rowResults, colResults, pWins, aWins, pVP, aVP, dfRows, dfCols };

}
