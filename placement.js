function getValidPlacements(owner, card) {

  // P2 in multiplayer has home row 0 (mirrored), P1 and single-player = row 4
  const _p2mp = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
  const playerHomeRow = _p2mp ? 0 : 4;

  // PHANTOM: free placement in own 2 home rows PLUS any other valid adjacency cells
  if (card.ability === 'phantom') {
    const [minR, maxR] = owner === 'player'
      ? (_p2mp ? [0,1] : [3,4])
      : (_p2mp ? [3,4] : [0,1]);
    const seen = new Set();
    const cells = [];
    // Free home rows (2 rows) — still respects enemy FORTIFY claims
    for (let r = minR; r <= maxR; r++)
      for (let c = 0; c < 7; c++)
        if (!G.grid[r][c].card && !(G.grid[r][c].fortifiedBy && G.grid[r][c].fortifiedBy !== owner)) {
          const k=r+','+c; if(!seen.has(k)){seen.add(k);cells.push({r,c});}
        }
    // ALSO include normal adjacency placements anywhere on the board
    // (temporarily clear phantom ability to avoid recursion)
    const _ab = card.ability; card.ability = null;
    getValidPlacements(owner, card).forEach(({r,c})=>{ const k=r+','+c; if(!seen.has(k)){seen.add(k);cells.push({r,c});} });
    card.ability = _ab;
    return cells;

  }

  // P2 plays as 'player' but home is row 0; AI from P2's view (P1) has home row 4
  const homeRow = owner === 'player'
    ? (_p2mp ? 0 : 4)
    : (_p2mp ? 4 : 0);

  // fwd: zone dr=-1 means "toward enemy". P1 player: fwd=1 (no flip). P2 player: fwd=-1 (flip to expand toward row 4)
  const fwd     = owner === 'player'
    ? (_p2mp ? -1 : 1)
    : (_p2mp ? 1 : -1);

  const set     = new Set();

  // Home row is always available

  for (let c = 0; c < 7; c++)

    if (!G.grid[homeRow][c].card) set.add(`${homeRow},${c}`);

  // RUSH: cells adjacent to enemy cards bypass tier zone restrictions.
  // Collected separately: RUSH's normal home-row/zone-expansion cells still
  // obey the tier row limits — ONLY the enemy-adjacent cells bypass them.

  const rushSet = new Set();

  if (card.ability === 'rush') {

    const enemy = owner === 'player' ? 'ai' : 'player';

    for (let r = 0; r < 5; r++) {

      for (let c = 0; c < 7; c++) {

        if (G.grid[r][c].owner !== enemy || !G.grid[r][c].card) continue;

        [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}].forEach(({dr,dc}) => {

          const nr=r+dr, nc=c+dc;

          if (nr>=0&&nr<5&&nc>=0&&nc<7&&!G.grid[nr][nc].card) rushSet.add(`${nr},${nc}`);

        });

      }

    }

  }

  // Zone expansion from each placed friendly card

  for (let r = 0; r < 5; r++) {

    for (let c = 0; c < 7; c++) {

      const cell = G.grid[r][c];

      if (cell.owner !== owner || !cell.card) continue;

      const zoneKey   = cell.card.zone || 'wide_cross';

      const zoneOffsets = ZONES[zoneKey] || ZONES.wide_cross;

      for (const {dr, dc} of zoneOffsets) {

        // Mirror dr for player (forward = up = -1) vs AI (forward = down = +1)

        const nr = r + dr * fwd;

        const nc = c + dc;

        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7 && !G.grid[nr][nc].card)

          set.add(`${nr},${nc}`);

      }

    }

  }

  // Tier placement rules: symmetric, no side may enter the opponent's home row

  let minAllowed, maxAllowed;

  if (card.tier === 'I') {

    minAllowed = homeRow; maxAllowed = homeRow;

  } else {

    minAllowed = 1; maxAllowed = 3;

  }

  const validCells = [...set]

    .map(s => { const [r,c] = s.split(',').map(Number); return {r,c}; })

    .filter(({r,c}) => {
      if (r < minAllowed || r > maxAllowed) return false;
      const cell = G.grid[r][c];
      if (cell.fortifiedBy && cell.fortifiedBy !== owner) return false;
      return true;
    });

  // RUSH: enemy-adjacent cells bypass the tier row limits (but not FORTIFY)
  if (rushSet.size > 0) {
    const seenR = new Set(validCells.map(({r,c}) => r+','+c));
    rushSet.forEach(key => {
      if (seenR.has(key)) return;
      const [r,c] = key.split(',').map(Number);
      if (G.grid[r][c].fortifiedBy && G.grid[r][c].fortifiedBy !== owner) return;
      seenR.add(key);
      validCells.push({r,c});
    });
  }

  // HOME INVADER: also add opponent home row cells as valid (P2 mirror: opponent home = 4)
  if (card.ability === 'home_invader') {
    const enemyHomeRow = owner === 'player' ? (_p2mp ? 4 : 0) : (_p2mp ? 0 : 4);
    const seen = new Set(validCells.map(({r,c}) => r+','+c));
    for (let hc = 0; hc < 7; hc++) {
      const cell = G.grid[enemyHomeRow][hc];
      if (!cell.card && cell.owner !== 'hazard' && !(cell.fortifiedBy && cell.fortifiedBy !== owner)) {
        const key = enemyHomeRow+','+hc;
        if (!seen.has(key)) { seen.add(key); validCells.push({r: enemyHomeRow, c: hc}); }
      }
    }
  }

  return validCells;

}

function getZonePreview(r, c, card, owner) {

  const zoneKey   = card.zone || 'wide_cross';

  const zoneOffsets = ZONES[zoneKey] || ZONES.wide_cross;

  // P2 in multiplayer expands toward row 4 (game coords), so mirror fwd.
  // The board renders reversed for P2, so it still LOOKS forward on screen.
  const _p2zp = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;

  const fwd = (owner === 'player' && _p2zp) ? -1 : 1;

  const cells = [];

  for (const {dr, dc} of zoneOffsets) {

    const nr = r + dr * fwd, nc = c + dc;

    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7 && !G.grid[nr][nc].card)

      cells.push({r: nr, c: nc});

  }

  return cells;

}

// DISPLAY-ONLY placement flashes. Mirrors computeBattleResults math exactly;
// never mutates card/shield state (computeScores already ran in placeCard).
function doComparisons(r, c, owner, card, depth=0) {

  if (depth > 3) return;

  const enemy = owner==='player'?'ai':'player';

  for (const d of DIRS4) {

    const nr=r+d.dr, nc=c+d.dc;

    if (nr<0||nr>=5||nc<0||nc>=7) continue;

    const target = G.grid[nr][nc];

    if (!target.card || target.owner !== enemy) continue;

    // Same effective-edge math as computeBattleResults (edgeMod + AI buff + pierce).
    const mv = gzEffEdge(card, owner, d.myE);
    const tv = gzEffEdge(target.card, target.owner, d.theirE);

    const pMe   = card.ability === 'pierce';
    const pThem = target.card.ability === 'pierce';

    const iWin  = mv > tv || (mv === tv && pMe && !pThem);
    const iLose = tv > mv || (mv === tv && pThem && !pMe);
    // pure tie: neither iWin nor iLose — harmless, never involves a shield

    // SHIELD display only: computeScores (runs before doComparisons in placeCard)
    // is the single authority for shield consumption. Show "absorbs" only for
    // the exact battle that consumed the shield — never on ties or won battles.
    if (iWin && target.card.ability==='shield' &&
        target.card.shieldConsumedBy === d.theirE + ':' + card.id) {
      addLog('shield', `${target.card.name} SHIELD absorbs the loss`);
      showFlash(r,c,nr,nc, mv, tv, false);
      continue;
    }

    if (iLose && card.ability==='shield' &&
        card.shieldConsumedBy === d.myE + ':' + target.card.id) {
      addLog('shield', `${card.name} SHIELD absorbs the loss`);
      showFlash(r,c,nr,nc, mv, tv, false);
      continue;
    }

    showFlash(r, c, nr, nc, mv, tv, iWin);

    // Cinematic VFX overlay for this battle (fx.js). Win fires directionally on
    // the winner→loser pair (owner-tinted); a loss fires on the just-placed card.
    if (typeof window.gzFx === 'function') {
      if (iWin) {
        window.gzFx((d.myE === 'e' || d.myE === 'w') ? 'battle-win-h' : 'battle-win-v', r, c, nr, nc, owner);
      } else if (iLose) {
        window.gzFx('battle-loss', r, c);
      } else if (mv === tv) {
        window.gzFx('battle-tie', r, c, nr, nc);   // pure tie: neutral gold standoff over both cells
      }
    }

    addLog('compare', `${card.name} ${mv}${iWin?'>':iLose?'<':'='}${tv} vs ${target.card.name} (${d.lbl})`);

    // REVENGE: target card has REVENGE and lost — flash the winner (it takes the -1 VP)
    if (iWin && target.card.ability === 'revenge') {
      setTimeout(() => {
        const _rvEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (_rvEl) { _rvEl.classList.add('ambush-hit'); setTimeout(()=>_rvEl.classList.remove('ambush-hit'),800); }
      }, 350);
    }
    // REVENGE: the placed REVENGE card lost — flash the winning target
    if (iLose && card.ability === 'revenge') {
      setTimeout(() => {
        const _rvEl2 = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
        if (_rvEl2) { _rvEl2.classList.add('ambush-hit'); setTimeout(()=>_rvEl2.classList.remove('ambush-hit'),800); }
      }, 350);
    }

    // DOUBLE STRIKE: contest 2nd cell at HALF strength

    if (card.ability==='double_strike' && iWin) {

      const nr2=nr+d.dr, nc2=nc+d.dc;

      if (nr2>=0&&nr2<5&&nc2>=0&&nc2<7) {

        const t2 = G.grid[nr2][nc2];

        if (t2.card && t2.owner===enemy) {

          const mv2=Math.max(1,Math.floor(mv/2)), tv2=gzEffEdge(t2.card, t2.owner, d.theirE);

          showFlash(nr,nc,nr2,nc2,mv2,tv2,mv2>tv2);

          addLog('compare', `DOUBLE STRIKE (\u00bd): ${mv2} vs ${tv2} → ${t2.card.name}`);

        }

      }

    }

  }

}

function hasAnyMoves(owner) {

  const hand = owner === 'player' ? G.playerHand : G.aiHand;

  return hand.filter(c => !c.used).some(card => getValidPlacements(owner, card).length > 0);

}
