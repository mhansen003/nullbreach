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

function _applyMirror(mCard, mr, mc, mOwner) {
  if (mCard._mirrorSwaps) {
    mCard._mirrorSwaps.forEach(function(s) {
      s.tCard.edgeMod = s.tCard.edgeMod || {n:0,s:0,e:0,w:0};
      s.tCard.edgeMod[s.edge] -= s.delta;
    });
  }
  mCard._mirrorSwaps = [];
  const mN = (mr>0) ? G.grid[mr-1][mc] : null;
  const mS = (mr<4) ? G.grid[mr+1][mc] : null;
  const mW = (mc>0) ? G.grid[mr][mc-1] : null;
  const mE = (mc<6) ? G.grid[mr][mc+1] : null;
  const nEn = mN && mN.card && mN.owner !== mOwner;
  const sEn = mS && mS.card && mS.owner !== mOwner;
  const wEn = mW && mW.card && mW.owner !== mOwner;
  const eEn = mE && mE.card && mE.owner !== mOwner;
  if (nEn && sEn) {
    var nc = mN.card, sc = mS.card;
    nc.edgeMod = nc.edgeMod || {n:0,s:0,e:0,w:0};
    sc.edgeMod = sc.edgeMod || {n:0,s:0,e:0,w:0};
    var ncSeff = nc.edges.s + (nc.edgeMod.s||0);
    var scNeff = sc.edges.n + (sc.edgeMod.n||0);
    var dNC = (scNeff - nc.edges.s) - nc.edgeMod.s;
    var dSC = (ncSeff - sc.edges.n) - sc.edgeMod.n;
    nc.edgeMod.s += dNC; sc.edgeMod.n += dSC;
    mCard._mirrorSwaps.push({tCard:nc,edge:'s',delta:dNC},{tCard:sc,edge:'n',delta:dSC});
    addLog('compare', 'MIRROR — ' + nc.name + ' and ' + sc.name + ' edges reversed (V)');
  }
  if (wEn && eEn) {
    var wc = mW.card, ec = mE.card;
    wc.edgeMod = wc.edgeMod || {n:0,s:0,e:0,w:0};
    ec.edgeMod = ec.edgeMod || {n:0,s:0,e:0,w:0};
    var wcEeff = wc.edges.e + (wc.edgeMod.e||0);
    var ecWeff = ec.edges.w + (ec.edgeMod.w||0);
    var dWC = (ecWeff - wc.edges.e) - wc.edgeMod.e;
    var dEC = (wcEeff - ec.edges.w) - ec.edgeMod.w;
    wc.edgeMod.e += dWC; ec.edgeMod.w += dEC;
    mCard._mirrorSwaps.push({tCard:wc,edge:'e',delta:dWC},{tCard:ec,edge:'w',delta:dEC});
    addLog('compare', 'MIRROR — ' + wc.name + ' and ' + ec.name + ' edges reversed (H)');
  }
}

function applyPlacementAbility(card, r, c, owner) {


  const dirs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];


  const enemy = owner === 'player' ? 'ai' : 'player';





  // Ensure edgeMod is initialized on the placed card


  card.edgeMod = card.edgeMod || {n:0,s:0,e:0,w:0};





  // BOOST: adjacent friendly cards +1 all edges


  // COMMANDER: adjacent same-tier friendly cards +2 all edges


  // SPAWN (Brood): identical math to COMMANDER — Brood-unique name


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


    if (card.ability === 'spawn') addLog('compare', `SPAWN: ${card.name} coordinates the hive — adjacent same-tier allies +2`);

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





  // SWEEP: normalise all edges to the 2nd highest edge value


  if (card.ability === 'sweep') {


    const base = card.edges;


    const existing = card.edgeMod || {n:0,s:0,e:0,w:0};


    const effN = base.n + existing.n, effS = base.s + existing.s;


    const effE = base.e + existing.e, effW = base.w + existing.w;


    const sorted = [effN, effS, effE, effW].sort((a,b) => b-a);


    const target = sorted[1];


    card.edgeMod = {


      n: target - base.n, s: target - base.s,


      e: target - base.e, w: target - base.w,


    };


    addLog('compare', `SWEEP: ${card.name} normalises all edges to ${target} (2nd highest was ${sorted[0]}→${target})`);


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


      addLog('compare', `INTIMIDATE — ${nb.card.name} loses 1 from ${edgeName}`);


    });


  }





  // MIRROR: sandwiched between enemies on same axis — swap their facing edges


  // MIRROR: _applyMirror is module-scope (see above applyPlacementAbility)
  if (card.ability === 'mirror') {
    _applyMirror(card, r, c, owner);
  }





  // AMBUSH: randomly pick up to 2 adjacent enemies, weaken all 4 edges -1


  if (card.ability === 'ambush') {
    card._ambushHitsRemaining = 2; // track remaining reactive uses
    const adjEnemies = [];


    dirs.forEach(({dr,dc}) => {


      const nr=r+dr, nc=c+dc;


      if (nr<0||nr>=5||nc<0||nc>=7) return;


      const nb = G.grid[nr][nc];


      if (nb.card && nb.owner !== owner) adjEnemies.push({r:nr, c:nc, card:nb.card});


    });


    // Shuffle and pick up to 2


    const _rng = window._mpSeed || Math.random;


    adjEnemies.sort(() => _rng() - 0.5);


    const targets = adjEnemies.slice(0, 2);


    const names = [];


    targets.forEach(({r:nr, c:nc, card:tc}) => {


      tc.edgeMod = tc.edgeMod || {n:0,s:0,e:0,w:0};


      tc.edgeMod.n -= 1; tc.edgeMod.s -= 1;


      tc.edgeMod.e -= 1; tc.edgeMod.w -= 1;


      names.push(tc.name);


      // Visual flash


      const cellEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);


      if (cellEl) {


        cellEl.classList.add('ambush-hit');


        setTimeout(() => cellEl.classList.remove('ambush-hit'), 850);


      }


    });


    if (targets.length === 0) { addLog('compare','AMBUSH — no adjacent enemies to weaken'); return; }


    if (names.length) addLog('compare', `AMBUSH — ${names.join(', ')} weakened`);


  }





  // STONEWALL: blocks first incoming battle loss (both axes) + suppresses 1 adjacent enemy V-loss
  if (card.ability === 'stonewall') {
    // Stonewall also suppresses 1 adjacent enemy's vertical wins this turn
    dirs.forEach(({dr,dc}) => {
      const nr=r+dr, nc=c+dc;
      if (nr<0||nr>=5||nc<0||nc>=7) return;
      const nb = G.grid[nr][nc];
      if (nb.card && nb.owner !== owner) {
        nb.card.stonewall_victim = true;
        const cellEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
        if (cellEl) { cellEl.classList.add('ambush-hit'); setTimeout(() => cellEl.classList.remove('ambush-hit'), 850); }
      }
    });
    addLog('compare', `STONEWALL — ${card.name} fortifies position, blocking all incoming attacks`);
  }





  // SNIPER: silence enemy home-row card in this column


  if (card.ability === 'sniper') {
    // Debuff all existing enemies in the same row
    for (let sc=0; sc<7; sc++) {
      if (sc === c) continue;
      const tgt = G.grid[r][sc];
      if (tgt.card && tgt.owner !== owner && !tgt.card._sniped) {
        _applySnipe(tgt.card, r, sc);
        addLog('compare', `SNIPER — ${card.name} locks onto ${tgt.card.name} at [${r},${sc}]`);
      }
    }
  }





  // HAT TRICK: middle of 3-card vertical line — spread N/S edges to flankers


  function _applyHatTrick(htCard, htR, htC, htOwner) {


    if (htCard._hatTrickApplied) return;


    if (htR < 1 || htR > 3) return;


    const northCell = G.grid[htR-1][htC];


    const southCell = G.grid[htR+1][htC];


    if (!northCell.card || northCell.owner !== htOwner) return;


    if (!southCell.card || southCell.owner !== htOwner) return;


    htCard._hatTrickApplied = true;


    const bonusN = Math.floor(htCard.edges.n / 3);


    northCell.card.edgeMod = northCell.card.edgeMod || {n:0,s:0,e:0,w:0};


    northCell.card.edgeMod.s += bonusN; northCell.card.edgeMod.e += bonusN; northCell.card.edgeMod.w += bonusN;


    const bonusS = Math.floor(htCard.edges.s / 3);


    southCell.card.edgeMod = southCell.card.edgeMod || {n:0,s:0,e:0,w:0};


    southCell.card.edgeMod.n += bonusS; southCell.card.edgeMod.e += bonusS; southCell.card.edgeMod.w += bonusS;


    addLog('compare', `HAT TRICK — formation bonus applied (+${bonusN}/${bonusS})`);


  }


  if (card.ability === 'hat_trick') _applyHatTrick(card, r, c, owner);


  // Retroactive: if this card completes a HAT_TRICK formation for an adjacent middle card


  [-1, 1].forEach(dr => {


    const nr = r + dr;


    if (nr < 0 || nr >= 5) return;


    const adj = G.grid[nr][c];


    if (adj.card && adj.card.ability === 'hat_trick' && adj.owner === owner) {


      _applyHatTrick(adj.card, nr, c, owner);


    }


  });





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

        // SNIPER: any enemy entering same row gets debuffed
        case 'sniper':
          if (r === newR && !newCard._sniped) {
            _applySnipe(newCard, newR, newC);
            addLog('compare', `SNIPER — ${aCard.name} locks onto ${newCard.name} entering row ${newR}`);
            // Persistent visual: mark cell as sniper-locked
            newCard._sniperLocked = true;
          }
          break;

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
            addLog('compare', `INTIMIDATE — ${aCard.name} weakens ${newCard.name}'s ${edgeName.toUpperCase()}`);
          }
          break;

        // AMBUSH: enemy enters adjacent → fires (limited uses)
        case 'ambush':
          if (dist === 1 && (aCard._ambushHitsRemaining ?? 2) > 0) {
            newCard.edgeMod = newCard.edgeMod || {n:0,s:0,e:0,w:0};
            newCard.edgeMod.n -= 1; newCard.edgeMod.s -= 1;
            newCard.edgeMod.e -= 1; newCard.edgeMod.w -= 1;
            aCard._ambushHitsRemaining = (aCard._ambushHitsRemaining ?? 2) - 1;
            const cellEl = document.querySelector(`.cell[data-r="${newR}"][data-c="${newC}"]`);
            if (cellEl) { cellEl.classList.add('ambush-hit'); setTimeout(()=>cellEl.classList.remove('ambush-hit'),900); }
            addLog('compare', `AMBUSH — ${aCard.name} strikes ${newCard.name} (${aCard._ambushHitsRemaining} charges left)`);
          }
          break;

        // MIRROR: enemy placed adjacent — re-evaluate sandwich
        case 'mirror':
          if (dist === 1) {
            _applyMirror(aCard, r, c, cell.owner);
          }
          break;
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





  chosen.forEach(card => {


    const ab = pool[Math.floor(_arng() * pool.length)];


    card.ability = ab;


    card.abilityText = (typeof ABILITY_TEXT !== 'undefined' && ABILITY_TEXT[ab]) || ab.toUpperCase();


    const _raceNames = RACE_ABILITY_NAMES[raceId] || {};


    card.abilityLabel = _raceNames[ab] || null;


    card.raceId = raceId;


    card.isSpecial = true;


  });


}
