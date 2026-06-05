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
    // Free home rows (2 rows)
    for (let r = minR; r <= maxR; r++)
      for (let c = 0; c < 7; c++)
        if (!G.grid[r][c].card) { const k=r+','+c; if(!seen.has(k)){seen.add(k);cells.push({r,c});} }
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

  // RUSH: also add cells adjacent to enemy cards (aggressive placement bypass)

  if (card.ability === 'rush') {

    const enemy = owner === 'player' ? 'ai' : 'player';

    for (let r = 0; r < 5; r++) {

      for (let c = 0; c < 7; c++) {

        if (G.grid[r][c].owner !== enemy || !G.grid[r][c].card) continue;

        [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}].forEach(({dr,dc}) => {

          const nr=r+dr, nc=c+dc;

          if (nr>=0&&nr<5&&nc>=0&&nc<7&&!G.grid[nr][nc].card) set.add(`${nr},${nc}`);

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

  // RUSH bypasses all tier zone restrictions, including enemy home row

  if (card.ability === 'rush') {

    return [...set]

      .map(s => { const [r,c] = s.split(',').map(Number); return {r,c}; })

      .filter(({r,c}) => {
        const cell = G.grid[r][c];
        if (cell.fortifiedBy && cell.fortifiedBy !== owner) return false;
        return true;
      });

  }

  const validCells = [...set]

    .map(s => { const [r,c] = s.split(',').map(Number); return {r,c}; })

    .filter(({r,c}) => {
      if (r < minAllowed || r > maxAllowed) return false;
      const cell = G.grid[r][c];
      if (cell.fortifiedBy && cell.fortifiedBy !== owner) return false;
      return true;
    });

  // HOME INVADER: also add opponent home row cells as valid
  if (card.ability === 'home_invader') {
    const enemyHomeRow = owner === 'player' ? 0 : 4;
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

  const fwd = 1; // always show from player's viewing perspective (forward = upward in the mini-grid)

  const cells = [];

  for (const {dr, dc} of zoneOffsets) {

    const nr = r + dr * fwd, nc = c + dc;

    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 7 && !G.grid[nr][nc].card)

      cells.push({r: nr, c: nc});

  }

  return cells;

}

function doComparisons(r, c, owner, card, depth=0) {

  if (depth > 3) return;

  const enemy = owner==='player'?'ai':'player';

  for (const d of DIRS4) {

    const nr=r+d.dr, nc=c+d.dc;

    if (nr<0||nr>=5||nc<0||nc>=7) continue;

    const target = G.grid[nr][nc];

    if (!target.card || target.owner !== enemy) continue;

    const mv = card.edges[d.myE], tv = target.card.edges[d.theirE];

    const iWin = mv > tv;

    // Shield on target: only absorbs when attacker wins (target would lose)
    if (target.card.ability==='shield' && !target.card.shieldExpended && iWin) {
      target.card.shieldExpended = true;
      addLog('shield', `${target.card.name} SHIELD absorbs comparison`);
      showFlash(r,c,nr,nc, mv, tv, false);
      continue;
    }

    // Shield on placed card: absorbs when placed card would lose
    if (card.ability==='shield' && !card.shieldExpended && !iWin) {
      card.shieldExpended = true;
      addLog('shield', `${card.name} SHIELD absorbs comparison`);
      showFlash(r,c,nr,nc, mv, tv, false);
      continue;
    }

    showFlash(r, c, nr, nc, mv, tv, iWin);

    addLog('compare', `${card.name} ${mv}${iWin?'>':'<'}${tv} vs ${target.card.name} (${d.lbl})`);

    // REVENGE: if the target card has REVENGE and loses, flash the winning card orange
    if (!iWin && target.card.ability === 'revenge') {
      setTimeout(() => {
        const _rvEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (_rvEl) { _rvEl.classList.add('ambush-hit'); setTimeout(()=>_rvEl.classList.remove('ambush-hit'),800); }
      }, 350);
    }
    // REVENGE: if the placed card has REVENGE and loses to target, flash the target
    if (iWin && card.ability === 'revenge') {
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

          const mv2=Math.max(1,Math.floor(mv/2)), tv2=t2.card.edges[d.theirE];

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
