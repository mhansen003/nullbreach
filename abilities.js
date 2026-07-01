

// _applyMirror removed: mirror ability replaced by revenge

function applyPlacementAbility(card, r, c, owner) {

  const dirs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];

  const enemy = owner === 'player' ? 'ai' : 'player';

  // Ensure edgeMod is initialized on the placed card

  card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};

  // COMMANDER: adjacent friendly cards +2 all edges (any tier). Stacks.

  if (card.ability === 'commander') {

    const bonus = 2;

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

  }

  // RETROACTIVE BUFF: if an adjacent friendly card is a commander, buff this card
  dirs.forEach(({dr,dc}) => {
    const nr=r+dr, nc=c+dc;
    if (nr<0||nr>=5||nc<0||nc>=7) return;
    const nb = G.grid[nr][nc];
    if (!nb.card || nb.owner !== owner) return;
    if (nb.card.ability === 'commander') {
      const bonus = 2;
      card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};
      card.edgeMod.n += bonus; card.edgeMod.s += bonus;
      card.edgeMod.e += bonus; card.edgeMod.w += bonus;
    }
  });

  // LASER FOCUS: sums all 4 edges into the forward-facing edge only.
  // Player attacks toward lower row (N). P2 in PvP is inverted — attacks toward higher row (S).
  // AI attacks S. P2's AI (opponent from P2's view) attacks N.

  if (card.ability === 'laser_focus') {

    const _p2 = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
    const total = card.edges.n + card.edges.s + card.edges.e + card.edges.w;
    card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};
    // forward edge: player=N normally, player=S for P2; ai=S normally, ai=N for P2
    const _fwdN = (owner === 'player') ? !_p2 : _p2;

    // ACCUMULATE (+=) so buffs already applied (e.g. commander retro-buff)
    // are preserved: base edges collapse into the forward side (fwd = total,
    // others = 0 base), while edgeMod bonuses stay additive on top.
    if (_fwdN) {
      card.edgeMod.n += total - card.edges.n;
      card.edgeMod.s += -card.edges.s;
      card.edgeMod.e += -card.edges.e;
      card.edgeMod.w += -card.edges.w;
      addLog('compare', `LASER FOCUS: ${card.name} concentrates forward: N=${total}`);
    } else {
      card.edgeMod.s += total - card.edges.s;
      card.edgeMod.n += -card.edges.n;
      card.edgeMod.e += -card.edges.e;
      card.edgeMod.w += -card.edges.w;
      addLog('compare', `LASER FOCUS: ${card.name} concentrates forward: S=${total}`);
    }

  }

  // INTIMIDATE: find adjacent enemies, reduce their highest edge by -1 via edgeMod

  if (card.ability === 'intimidate') {

    dirs.forEach(({dr,dc}) => {

      const nr=r+dr, nc=c+dc;

      if (nr<0||nr>=5||nc<0||nc>=7) return;

      const nb = G.grid[nr][nc];

      if (!nb.card || nb.owner === owner || nb.owner === 'hazard') return;

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

  // FORTIFY: claims the single forward cell. P2 mirror: player attacks toward row 4 (+1 not -1).
  if (card.ability === 'fortify') {
    const _p2f = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
    const forwardDr = (owner === 'player') ? (_p2f ? 1 : -1) : (_p2f ? -1 : 1);
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

  // SNIPER: silence highest-power card on opponent's home row. P2 mirror: player home=4, opponent=0 swaps.
  if (card.ability === 'sniper') {
    const _p2s = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
    const homeRow = (owner === 'player') ? (_p2s ? 4 : 0) : (_p2s ? 0 : 4); // opponent home row
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
    } else {
      // Fizzle: no un-silenced enemy card on their home row — tell the player
      addLog('compare', `SNIPER: ${card.name} finds no target on the enemy home row — shot wasted`);
      if (typeof showToast === 'function') showToast('SNIPER: no target — shot wasted', '#ff8800');
    }
  }

  // HOME INVADER: placement rule handled in placement.js
  // Visual: briefly flash red glow on all cells in the opponent's home row when placed there
  if (card.ability === 'home_invader') {
    const _p2hi = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
    const opponentHomeRow = owner === 'player' ? (_p2hi ? 4 : 0) : (_p2hi ? 0 : 4);
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

  // BIRTHRIGHT: on placement, add a copy of a random UNUSED Tier II card from
  // the owner's own hand (same semantics for player and AI).
  //
  // MP determinism: both clients hold mirrored hands (same static deck order,
  // same room-seeded abilities, same used flags), so the candidate list is
  // identical on both sides. The pick index and the clone id are derived from
  // room + source card id + number of cards on the board — values both clients
  // compute identically at this moment — so both clients create the SAME clone
  // with the SAME id.
  if (card.ability === 'birthright') {
    const hand  = owner === 'player' ? G.playerHand : G.aiHand;
    const avail = hand.filter(c => c.tier === 'II' && !c.used);
    if (avail.length > 0) {
      const _inMp = typeof _mpRoom !== 'undefined' && _mpRoom;
      const placedCount = G.grid.flat().filter(x => x.card).length;
      let idx;
      if (_inMp) {
        let h = 0;
        const seedStr = _mpRoom + '|' + card.id + '|' + placedCount;
        for (const ch of seedStr) h = (h * 31 + ch.charCodeAt(0)) & 0x7fffffff;
        idx = h % avail.length;
      } else {
        idx = Math.floor(Math.random() * avail.length);
      }
      const src = avail[idx];
      // Deep-copy edges/edgeMod so the clone never shares mutable state with its source
      const bonus = {
        ...src,
        id: src.id + '_br_' + placedCount,   // deterministic — identical on both MP clients
        edges: {...src.edges},
        edgeMod: {n:0,s:0,e:0,w:0},
        used: false, shieldExpended: false, shieldConsumedBy: null,
        _silenced: false, _revengePenalty: 0, cloakRevealed: null,
      };
      hand.push(bonus);
      // MP: register the clone in the owner's static faction deck so the remote
      // client's mpFindCard(cloneId) resolves if the clone is later placed.
      // Marked _brClone so initGame filters these out of future hands.
      if (_inMp && typeof window !== 'undefined') {
        const _decks = {
          terran:  typeof PLAYER_CARDS     !== 'undefined' ? PLAYER_CARDS     : null,
          brood:   typeof BROOD_CARDS      !== 'undefined' ? BROOD_CARDS      : null,
          crystallis: typeof CRYSTALLIS_CARDS !== 'undefined' ? CRYSTALLIS_CARDS : null,
          mycos:   typeof MYCOS_CARDS      !== 'undefined' ? MYCOS_CARDS      : null,
          veil:    typeof VEIL_CARDS       !== 'undefined' ? VEIL_CARDS       : null,
          entropy: typeof ENTROPY_CARDS    !== 'undefined' ? ENTROPY_CARDS    : null,
          void:    typeof VOID_CARDS       !== 'undefined' ? VOID_CARDS       : null,
          gas:     typeof GAS_CARDS        !== 'undefined' ? GAS_CARDS        : null,
          lithos:  typeof LITHOS_CARDS     !== 'undefined' ? LITHOS_CARDS     : null,
          quantum: typeof QUANTUM_CARDS    !== 'undefined' ? QUANTUM_CARDS    : null,
          choir:   typeof CHOIR_CARDS      !== 'undefined' ? CHOIR_CARDS      : null,
        };
        const fid  = owner === 'player' ? window.playerRaceId : window.aiRaceId;
        const deck = _decks[fid];
        if (deck && !deck.some(d => d.id === bonus.id)) {
          deck.push({...bonus, edges: {...bonus.edges}, edgeMod: {n:0,s:0,e:0,w:0}, _brClone: true});
        }
      }
      if (owner === 'player') {
        addLog('player', `BIRTHRIGHT: ${card.name} grants a bonus card: ${bonus.name}`);
        if (typeof showToast === 'function') showToast(`BIRTHRIGHT: bonus card drawn`, '#ffaaff');
      } else {
        addLog('compare', `BIRTHRIGHT: ${card.name} grants the opponent a bonus card: ${bonus.name}`);
      }
    }
  }

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
  // Uses the seeded Fisher-Yates (_fy) so both MP clients shuffle identically.
  const _shuffledPool = _fy(pool);
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
