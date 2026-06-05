function _applySnipe(card, r, c) {
  if (card._sniped) return;
  card._sniped = true;
  card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};
  card.edgeMod.n -= 2; card.edgeMod.s -= 2;
  card.edgeMod.e -= 2; card.edgeMod.w -= 2;
  // Visual flash on the cell
  const el = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if (el) {
    el.classList.add('ambush-hit');
    setTimeout(() => el.classList.remove('ambush-hit'), 900);
  }
}

// _applyMirror removed: mirror ability replaced by revenge

function applyPlacementAbility(card, r, c, owner) {

  const dirs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];

  const enemy = owner === 'player' ? 'ai' : 'player';

  // Ensure edgeMod is initialized on the placed card

  card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};

  // BOOST: adjacent friendly cards +1 all edges

  // COMMANDER: adjacent same-tier friendly cards +2 all edges

  // SPAWN (Brood): identical math to COMMANDER: Brood-unique name

  if (card.ability === 'boost' || card.ability === 'commander' || card.ability === 'spawn') {

    const bonus = (card.ability === 'commander' || card.ability === 'spawn') ? 2 : 1;

    dirs.forEach(({dr,dc}) => {

      const nr=r+dr, nc=c+dc;

      if (nr<0||nr>=5||nc<0||nc>=7) return;

      const nb = G.grid[nr][nc];

      if (nb.card && nb.owner === owner) {

        nb.card.edgeMod = nb.card.edgeMod || {n:0,s:0,e:0,w:0};

        nb.card.edgeMod.n += bonus; nb.card.edgeMod.s += bonus;

        nb.card.edgeMod.e += bonus; nb.card.edgeMod.w += bonus;

      }

    });

    if (card.ability === 'spawn') addLog('compare', `SPAWN: ${card.name} coordinates the hive: adjacent same-tier allies +2`);

  }

  // RETROACTIVE BUFF: if an adjacent friendly card is a commander/boost/spawn, buff this card
  dirs.forEach(({dr,dc}) => {
    const nr=r+dr, nc=c+dc;
    if (nr<0||nr>=5||nc<0||nc>=7) return;
    const nb = G.grid[nr][nc];
    if (!nb.card || nb.owner !== owner) return;
    if (nb.card.ability === 'commander' || nb.card.ability === 'spawn') {
      const bonus = 2;
      card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};
      card.edgeMod.n += bonus; card.edgeMod.s += bonus;
      card.edgeMod.e += bonus; card.edgeMod.w += bonus;
    } else if (nb.card.ability === 'boost') {
      card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};
      card.edgeMod.n += 1; card.edgeMod.s += 1;
      card.edgeMod.e += 1; card.edgeMod.w += 1;
    }
  });

  if (false) {

  }

  // LASER FOCUS: sums all 4 edges into the forward-facing edge only.
  // Player attacks north (row 0 direction) → concentrate into N.
  // AI cards are N↔S flipped in state.js → AI attacks south → concentrate into S.

  if (card.ability === 'laser_focus') {

    const total = card.edges.n + card.edges.s + card.edges.e + card.edges.w;

    card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};

    if (owner === 'ai') {
      card.edgeMod.s = total - card.edges.s;
      card.edgeMod.n = -card.edges.n;
      card.edgeMod.e = -card.edges.e;
      card.edgeMod.w = -card.edges.w;
      addLog('compare', `LASER FOCUS: ${card.name} concentrates all power forward: S=${total}`);
    } else {
      card.edgeMod.n = total - card.edges.n;
      card.edgeMod.s = -card.edges.s;
      card.edgeMod.e = -card.edges.e;
      card.edgeMod.w = -card.edges.w;
      addLog('compare', `LASER FOCUS: ${card.name} concentrates all power forward: N=${total}`);
    }

  }

  // INTIMIDATE: find adjacent enemies, reduce their highest edge by -1 via edgeMod

  if (card.ability === 'intimidate') {

    dirs.forEach(({dr,dc}) => {

      const nr=r+dr, nc=c+dc;

      if (nr<0||nr>=5||nc<0||nc>=7) return;

      const nb = G.grid[nr][nc];

      if (!nb.card || nb.owner === owner) return;

      nb.card.edgeMod = nb.card.edgeMod || {n:0,s:0,e:0,w:0};

      const effN = nb.card.edges.n + nb.card.edgeMod.n;

      const effS = nb.card.edges.s + nb.card.edgeMod.s;

      const effE = nb.card.edges.e + nb.card.edgeMod.e;

      const effW = nb.card.edges.w + nb.card.edgeMod.w;

      const max = Math.max(effN, effS, effE, effW);

      let edgeName = 'N';

      if (effN === max) { nb.card.edgeMod.n -= 1; edgeName = 'N'; }

      else if (effS === max) { nb.card.edgeMod.s -= 1; edgeName = 'S'; }

      else if (effE === max) { nb.card.edgeMod.e -= 1; edgeName = 'E'; }

      else { nb.card.edgeMod.w -= 1; edgeName = 'W'; }

      addLog('compare', `INTIMIDATE: ${nb.card.name} loses 1 from ${edgeName}`);

    });

  }

  // FORTIFY: claims the single forward cell (toward opponent home row = lower row index for player)
  if (card.ability === 'fortify') {
    // Forward = lower row index for player (attacks toward row 0), higher row index for ai (attacks toward row 4)
    const forwardDr = owner === 'player' ? -1 : 1;
    const nr = r + forwardDr, nc = c;
    if (nr >= 0 && nr < 5) {
      const tgt = G.grid[nr][nc];
      if (!tgt.card) {
        tgt.fortifiedBy = owner; // mark as reserved by this player
        addLog('compare', `FORTIFY: ${card.name} claims forward cell [${nr},${nc}]`);
      }
    }
  }

  // REVENGE: passive: triggers in battle scoring (see battle.js computeScores)

  // SNIPER: on placement, silence the highest-power card on the opponent's home row
  if (card.ability === 'sniper') {
    const homeRow = owner === 'player' ? 0 : 4; // opponent home row
    let bestCell = null, bestPower = -1;
    for (let sc = 0; sc < 7; sc++) {
      const tgt = G.grid[homeRow][sc];
      if (tgt.card && tgt.owner !== owner && !tgt.card._silenced) {
        const effP = tgt.card.power || 0;
        if (effP > bestPower) { bestPower = effP; bestCell = tgt; }
      }
    }
    if (bestCell) {
      bestCell.card._silenced = true;
      addLog('compare', `SNIPER: ${card.name} silences ${bestCell.card.name} — 0 VP for the rest of the game`);
      if (typeof showToast === 'function') showToast(`SNIPER: ${bestCell.card.name} silenced — 0 VP`);
    }
  }

  // HOME INVADER: placement rule handled in placement.js
  // Visual: briefly flash red glow on all cells in the opponent's home row when placed there
  if (card.ability === 'home_invader') {
    const opponentHomeRow = owner === 'player' ? 0 : 4;
    if (r === opponentHomeRow) {
      for (let hc = 0; hc < 7; hc++) {
        const hEl = document.querySelector(`.cell[data-r="${opponentHomeRow}"][data-c="${hc}"]`);
        if (hEl) {
          hEl.classList.add('ambush-hit');
          setTimeout(() => hEl.classList.remove('ambush-hit'), 900);
        }
      }
    }
  }

  // LAMB: stats set during assignRandomAbilities: no placement-time effect here

  // BIRTHRIGHT: on placement, add a bonus T2 card to hand
  if (card.ability === 'birthright') {
    if (owner === 'player') {
      const availableT2 = (window.__activeDeck || G.playerHand).filter(c =>
        c.tier === 'II' && !G.playerHand.some(h => h.id === c.id) && !c.used
      );
      if (availableT2.length > 0) {
        const src = availableT2[Math.floor(Math.random() * availableT2.length)];
        const bonus = {...src};
        bonus.id = bonus.id + '_br_' + Date.now();
        bonus.used = false; bonus.shieldExpended = false;
        bonus.edgeMod = {n:0,s:0,e:0,w:0};
        G.playerHand.push(bonus);
        addLog('player', `BIRTHRIGHT: ${card.name} grants a bonus card: ${bonus.name}`);
        if (typeof showToast === 'function') showToast(`BIRTHRIGHT: bonus card drawn`, '#ffaaff');
      }
    } else {
      // AI birthright: pick a random unused T2 from aiHand pool
      const aiAvail = G.aiHand.filter(c => c.tier === 'II' && !c.used);
      if (aiAvail.length > 0) {
        const src = aiAvail[Math.floor(Math.random() * aiAvail.length)];
        const bonus = {...src};
        bonus.id = bonus.id + '_br_' + Date.now();
        bonus.used = false; bonus.shieldExpended = false;
        bonus.edgeMod = {n:0,s:0,e:0,w:0};
        G.aiHand.push(bonus);
        addLog('compare', `BIRTHRIGHT: AI ${card.name} grants a bonus card: ${bonus.name}`);
      }
    }
  }

  // Update surge trigger state (used in computeBattleResults)

  if (!G.surgeTrigger) G.surgeTrigger = {player:false, ai:false};

  const s = computeScores();

  G.surgeTrigger.player = s.rowResults.filter(r=>r==='a').length > s.rowResults.filter(r=>r==='p').length;

  G.surgeTrigger.ai     = s.rowResults.filter(r=>r==='p').length > s.rowResults.filter(r=>r==='a').length;

}

function fireReactiveAbilities(newR, newC, newCard, newOwner) {
  const enemy = newOwner === 'player' ? 'ai' : 'player';

  for (let r=0; r<5; r++) {
    for (let c=0; c<7; c++) {
      const cell = G.grid[r][c];
      if (!cell.card || !cell.card.ability) continue;
      if (cell.owner !== enemy) continue;  // only OPPONENT ability cards react
      if (r === newR && c === newC) continue;
      const aCard = cell.card;
      const dist  = Math.abs(r-newR) + Math.abs(c-newC);

      switch (aCard.ability) {

        // INTIMIDATE: enemy enters adjacent cell → lose 1 from highest edge
        case 'intimidate':
          if (dist === 1 && !newCard._intimidatedBy?.has(aCard)) {
            newCard.edgeMod = newCard.edgeMod || {n:0,s:0,e:0,w:0};
            const effN=newCard.edges.n+(newCard.edgeMod.n||0), effS=newCard.edges.s+(newCard.edgeMod.s||0);
            const effE=newCard.edges.e+(newCard.edgeMod.e||0), effW=newCard.edges.w+(newCard.edgeMod.w||0);
            const maxVal=Math.max(effN,effS,effE,effW);
            let edgeName='n';
            if(effN===maxVal) edgeName='n'; else if(effS===maxVal) edgeName='s';
            else if(effE===maxVal) edgeName='e'; else edgeName='w';
            newCard.edgeMod[edgeName] -= 1;
            newCard._intimidatedBy = newCard._intimidatedBy || new Set();
            newCard._intimidatedBy.add(aCard);
            addLog('compare', `INTIMIDATE: ${aCard.name} weakens ${newCard.name}'s ${edgeName.toUpperCase()}`);
          }
          break;

        // No additional reactive cases
      }
    }
  }
}

function assignRandomAbilities(hand, raceId) {

  hand.forEach(c => { c.ability = null; c.abilityText = 'No special ability'; c.isSpecial = false; });

  const pool = FACTION_ABILITY_POOLS[raceId] || FACTION_ABILITY_POOLS._default;

  // In multiplayer seed from room+faction so both clients assign identical abilities

  const _arng = (() => {

    if (typeof _mpRoom === 'undefined' || !_mpRoom) return () => Math.random();

    let s = 0;

    for (const ch of _mpRoom + raceId) s = (s * 31 + ch.charCodeAt(0)) & 0x7fffffff;

    return seededRand(s);

  })();

  const _fy = arr => {

    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(_arng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }

    return a;

  };

  const t1Cards    = _fy(hand.filter(c => c.tier === 'I'));

  const higherCards = hand.filter(c => c.tier !== 'I');

  const weighted = [];

  higherCards.forEach(c => {

    const w = {II:2, III:3, IV:5}[c.tier] || 2;

    for (let i = 0; i < w; i++) weighted.push(c);

  });

  const shuffledW = _fy(weighted);

  const chosen = new Set();

  for (const card of shuffledW) {

    if (chosen.size >= 4) break;

    chosen.add(card);

  }

  if (chosen.size < 5 && t1Cards.length > 0) chosen.add(t1Cards[0]);

  // Build an assignment list: all pool abilities in shuffled order first,
  // then random picks for any slots beyond pool size.
  // Guarantees every pool ability appears at least once before duplicates.
  const _shuffledPool = [...pool].sort(() => _arng() - 0.5);
  const _chosenArr = Array.from(chosen);
  const _assignments = _chosenArr.map((_, i) =>
    i < _shuffledPool.length
      ? _shuffledPool[i]
      : pool[Math.floor(_arng() * pool.length)]
  );

  _chosenArr.forEach((card, i) => {
    const ab = _assignments[i];

    card.ability = ab;

    card.abilityText = (typeof ABILITY_TEXT !== 'undefined' && ABILITY_TEXT[ab]) || ab.toUpperCase();

    const _raceNames = RACE_ABILITY_NAMES[raceId] || {};

    card.abilityLabel = _raceNames[ab] || null;

    card.raceId = raceId;

    card.isSpecial = true;

    // LAMB: zero all edges, set power to 5
    if (ab === 'lamb') {
      card._lambOriginalEdges = {...card.edges};
      card.edges = {n:0, s:0, e:0, w:0};
      card.power = 5;
    }

  });

}
