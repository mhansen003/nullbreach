function getValidPlacements(owner, card) {


  // PHANTOM: free placement in own 2 home rows PLUS any other valid adjacency cells
  if (card.ability === 'phantom') {
    const [minR, maxR] = owner === 'player' ? [3,4] : [0,1];
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





  const homeRow = owner === 'player' ? 4 : 0;


  const fwd     = owner === 'player' ? 1 : -1; // zone dr=-1 means "forward toward enemy" for player, so multiply by 1; AI flips


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





  // RUSH bypasses tier zone restrictions: can go anywhere adjacent to an enemy


  // (still can't go into opponent home row)


  const enemyHome = owner === 'player' ? 0 : 4;


  if (card.ability === 'rush') {


    return [...set]


      .map(s => { const [r,c] = s.split(',').map(Number); return {r,c}; })


      .filter(({r,c}) => {
        if (r === enemyHome) return false;
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





    // Shield: absorbs first comparison


    if (target.card.ability==='shield' && !target.card.shieldExpended) {


      target.card.shieldExpended = true;


      addLog('shield', `${target.card.name} SHIELD absorbs comparison`);


      showFlash(r,c,nr,nc, card.edges[d.myE], target.card.edges[d.theirE], false);


      continue;


    }





    const mv = card.edges[d.myE], tv = target.card.edges[d.theirE];


    const iWin = mv > tv;


    showFlash(r, c, nr, nc, mv, tv, iWin);





    addLog('compare', `${card.name} ${mv}${iWin?'>':'<'}${tv} vs ${target.card.name} (${d.lbl})`);





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
