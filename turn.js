function placeCard(card, r, c, owner) {

  G.grid[r][c] = { card, owner };   // owner NEVER changes after this

  card.used = true;

  // Stop MP turn timer on placement
  if (typeof mpStopTurnTimer === 'function') mpStopTurnTimer();

  applyPlacementAbility(card, r, c, owner);
  fireReactiveAbilities(r, c, card, owner);  // opponent ability cards react
  // Immediately recompute all battle results so ability edgeMod changes are visible
  // before doComparisons and renderAll run. computeScores updates G.grid[r][c].battle.
  computeScores();

  // Play card placement sound for both players (AI slightly softer + delayed)

  if (owner === 'player') {

    playCardSfx();

  } else {

    setTimeout(() => {

      const sfx = document.getElementById('cardSfx');

      if (sfx && !_sfxMuted) { sfx.currentTime = 0; sfx.volume = 0.35 * _sfxVol; sfx.play().catch(()=>{}); }

    }, 400);

  }

  addLog(owner==='player'?'player':'ai',

    `${owner==='player'?'YOU':'AI'} place ${card.name}[${card.tier}] at [${r},${c}]`);

  if (G) G._flankTriggered = (card.ability === 'flank') ? owner : null;

  doComparisons(r, c, owner, card);

  renderAll();

  setTimeout(() => {

    const cells = document.querySelectorAll('.cell');

    if (cells[r*7+c]) cells[r*7+c].classList.add('just-placed');

  }, 10);

  checkWin();

}

function checkWin() {

  if (G.gameOver) return;

  // Early win: majority of 35 cells (18+) controlled by one side

  let pCells = 0, aCells = 0;

  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {

    const cell = G.grid[r][c];

    if (cell.owner === 'player') pCells++;

    else if (cell.owner === 'ai') aCells++;

  }

  if (pCells >= 18 || aCells >= 18) {

    // fall through to show result

  } else {

    const allDone = G.playerHand.every(c=>c.used) && G.aiHand.every(c=>c.used);

    if (!allDone) return;

  }

  G.gameOver = true;

  if (_mpRoom) {

    fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}`, {

      method:'PATCH', headers:_SB_H, body: JSON.stringify({ status:'done' })

    }).catch(()=>{});

  }

  const s = computeScores();

  const overlay = document.getElementById('overlay');

  const title   = document.getElementById('overlayTitle');

  const sub     = document.getElementById('overlaySub');

  const bkdn    = document.getElementById('overlayBreakdown');

  overlay.classList.add('show');

  const pWon = s.pVP > s.aVP, draw = s.pVP === s.aVP;

  // Leaderboard record check on player win (PvE and PvP)
  if (pWon && typeof checkLeaderboardRecord === 'function') {
    checkLeaderboardRecord(window.playerRaceId, window.aiRaceId, s.pVP, s.aVP, _mpRoom ? 'pvp' : 'pve');
  }

  const winCol2 = pWon ? (window.playerFactionColor||'#00ffcc') : draw ? '#888' : (window.aiFactionColor||'#ff0080');

  const winAv2  = pWon ? (window.playerAvatarImg||'') : draw ? '' : (window.aiAvatarImg||'');

  const loseAv2 = pWon ? (window.aiAvatarImg||'') : (window.playerAvatarImg||'');

  const winNm2  = pWon ? (window.playerFactionName||'YOU') : draw ? 'STALEMATE' : (window.aiFactionName||'AI');

  const loseNm2 = pWon ? (window.aiFactionName||'AI') : (window.playerFactionName||'YOU');

  const winVP2  = pWon ? s.pVP : s.aVP;

  const loseVP2 = pWon ? s.aVP : s.pVP;

  overlay.innerHTML = `

    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:36px 44px;max-width:460px;">

      <div style="font-family:'Orbitron',monospace;font-size:20px;letter-spacing:5px;

        color:${pWon?'#00ffcc':draw?'#888':'#ff3344'};text-shadow:0 0 20px ${pWon?'#00ffcc33':draw?'#88888833':'#ff334433'};">

        ${pWon?'BREACH COMPLETE':draw?'STALEMATE':'BREACH FAILED'}

      </div>

      <div style="display:flex;align-items:center;gap:18px;">

        <!-- Winner -->

        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">

          <img src="${winAv2}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;

            object-position:top;border:3px solid ${winCol2};box-shadow:0 0 28px ${winCol2}66;">

          <span style="font-size:9px;letter-spacing:2px;color:${winCol2};">${winNm2}</span>

          <span style="font-size:32px;font-weight:bold;color:${winCol2};

            text-shadow:0 0 16px ${winCol2};">${winVP2}</span>

          <span style="font-size:9px;letter-spacing:2px;color:${winCol2}66;">VP</span>

        </div>

        <!-- VS -->

        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">

          <span style="font-size:11px;color:#666;letter-spacing:3px;">VS</span>

        </div>

        <!-- Loser: visible but clearly secondary -->

        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">

          <img src="${loseAv2}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;

            object-position:top;border:2px solid #555566;filter:grayscale(0.4);">

          <span style="font-size:10px;letter-spacing:2px;color:#9999aa;">${loseNm2}</span>

          <span style="font-size:26px;font-weight:bold;color:#7777aa;">${loseVP2}</span>

          <span style="font-size:9px;letter-spacing:2px;color:#9999aa;">VP</span>

        </div>

      </div>

      <div style="height:1px;background:#1a1a28;width:100%;margin:4px 0;"></div>

      <div style="font-size:10px;color:#444;letter-spacing:2px;">

        ${s.pWins} ${s.pWins===1?"sector":"sectors"} won &nbsp;·&nbsp; ${s.aWins} to opponent

      </div>

      <div style="display:flex;gap:14px;margin-top:4px;">

        ${_mpRoom
          ? `<button onclick="window.location.href=window.location.href" style="background:#0a1a14;border:1px solid #226644;color:#00ffcc;font-family:inherit;font-size:11px;letter-spacing:3px;padding:12px 28px;cursor:pointer;border-radius:5px;transition:all 0.2s;" onmouseenter="this.style.background='#0e2a1e'" onmouseleave="this.style.background='#0a1a14'">↺ NEW GAME</button>`
          : `<button onclick="initGame()" style="background:#0a1a14;border:1px solid #226644;color:#00ffcc;font-family:inherit;font-size:11px;letter-spacing:3px;padding:12px 28px;cursor:pointer;border-radius:5px;transition:all 0.2s;" onmouseenter="this.style.background='#0e2a1e'" onmouseleave="this.style.background='#0a1a14'">↺ REMATCH</button>`}

        <button onclick="goToMenu()" style="background:#1a0a2e;border:1px solid #6644aa;color:#aa88ff;

          font-family:inherit;font-size:11px;letter-spacing:3px;padding:12px 28px;

          cursor:pointer;border-radius:5px;transition:all 0.2s;"

          onmouseenter="this.style.background='#2a1040'"

          onmouseleave="this.style.background='#1a0a2e'">← DECK SELECT</button>

      </div>

    </div>`;

  overlay.classList.add('show'); // content already in innerHTML above

}

function onCardSelect(card) {
  clearAbilityZone(); suppressZone(300); // always clear zone when a card is clicked
  if (G.turn !== 'player' || G.gameOver) return;

  // Toggle off if already selected

  if (G.selectedCard === card) {

    G.selectedCard = null;
    G._previewCell = null;

    hideDragCard();
    hideMobileCardPanel();

    document.body.style.cursor = 'default';

  } else {

    playSelectSfx(); // ← plays alt-button-click when picking a card

    // Collapse the panel when switching cards so user manually re-opens for new card
    if (window.innerWidth <= 480) {
      const _panel = document.getElementById('mobileCardPanel');
      if (_panel && _panel.classList.contains('open')) {
        _panel.classList.remove('open');
        const _tab = document.getElementById('mobileCardPanelTab');
        if (_tab) { _tab.textContent = '▲'; }
      }
    }

    G.selectedCard = card;
    G._previewCell = null;

    // Drag ghost only on desktop — mobile uses explicit showDragCard inside the drag gesture
    if (window.innerWidth > 480) {
      document.body.style.cursor = 'none';
      showDragCard(card, -200, -200);
    }
    showMobileCardPanel(card);
    if (card.ability && window.innerWidth <= 480) setTimeout(() => showAbilityZone(card.ability), 320);

  }

  renderGrid();

  renderHand();

}

function applyMobileCellPreview(r, c, card) {
  G._previewCell = {r, c};
  clearAbilityZone();
  renderGrid();
  if (card.ability) showAbilityZone(card.ability, r, c);

  // Yellow future-valid zone cells
  getZonePreview(r, c, card, 'player').forEach(({r: pr, c: pc}) => {
    const el = document.querySelector(`.cell[data-r="${pr}"][data-c="${pc}"]`);
    if (el && !el.classList.contains('valid')) el.classList.add('future-valid');
  });

  // Battle outcome badges on adjacent enemy cells
  const _surgeB = (card.ability === 'surge' && G.surgeTrigger?.player) ? 3 : 0;
  const _sweepB = (card.ability === 'sweep') ? 2 : 0;
  [{dr:-1,dc:0,myE:'n',theirE:'s'},{dr:1,dc:0,myE:'s',theirE:'n'},{dr:0,dc:-1,myE:'w',theirE:'e'},{dr:0,dc:1,myE:'e',theirE:'w'}].forEach(({dr,dc,myE,theirE}) => {
    const nr=r+dr, nc=c+dc;
    if (nr<0||nr>=5||nc<0||nc>=7) return;
    const adj = G.grid[nr][nc];
    if (!adj.card || adj.owner === 'player') return;
    const myVal   = card.edges[myE] + (card.edgeMod?.[myE]||0) + _surgeB + _sweepB;
    const theirVal= adj.card.edges[theirE] + (adj.card.edgeMod?.[theirE]||0);
    const pierceTie = card.ability === 'pierce' && myVal === theirVal;
    const result  = (myVal > theirVal || pierceTie) ? 'win' : myVal < theirVal ? 'lose' : 'tie';
    const adjEl   = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
    if (!adjEl) return;
    adjEl.classList.add(`bpv-${result}`);
    const badge = document.createElement('div');
    badge.dataset.bpv = '1';
    const col = result==='win'?'#00ff88':result==='lose'?'#ff3333':'#ffdd00';
    badge.style.cssText = `position:absolute;z-index:12;pointer-events:none;background:#000000ee;border:1px solid ${col}88;border-radius:4px;padding:3px 6px;display:flex;flex-direction:column;align-items:center;gap:1px;font-family:'Courier New',monospace;`;
    if (dr===1)       badge.style.cssText += `top:4px;left:50%;transform:translateX(-50%);`;
    else if (dr===-1) badge.style.cssText += `bottom:4px;left:50%;transform:translateX(-50%);`;
    else if (dc===1)  badge.style.cssText += `left:4px;top:50%;transform:translateY(-50%);`;
    else              badge.style.cssText += `right:4px;top:50%;transform:translateY(-50%);`;
    const labelCol = result==='tie'?'#ffee44':col;
    badge.innerHTML = `<span style="font-size:10px;font-weight:bold;color:${labelCol};letter-spacing:1px;">${result.toUpperCase()}</span><span style="font-size:8px;color:${col}bb;">${myVal}v${theirVal}</span>`;
    adjEl.appendChild(badge);
  });
}

function onCellClick(r, c) {

  if (!G.selectedCard || G.turn !== 'player' || G.gameOver) return;

  if (!getValidPlacements('player', G.selectedCard).some(v=>v.r===r&&v.c===c)) return;

  // Mobile 3-tap / drag: first tap (or drag hover) previews; second tap (or drop) confirms
  if (window.innerWidth <= 480) {
    const prev = G._previewCell;
    if (!prev || prev.r !== r || prev.c !== c) {
      applyMobileCellPreview(r, c, G.selectedCard);
      return;
    }
    // Second tap on same cell (or drop): confirm: fall through to placement
    G._previewCell = null;
  }

  const _placedCardId = G.selectedCard?.id;
  const _placedCard = G.selectedCard;
  G.selectedCard = null; hideDragCard(); hideMobileCardPanel();
  document.body.style.cursor = 'default';

  const _doPlace = () => {
    placeCard(_placedCard, r, c, 'player');

    if (G._flankTriggered === 'player') {
      G._flankTriggered = null;
      G.turn = 'player';
      if (_mpRoom && _mpPlayer) {
        const _fSeed = Math.floor(Math.random() * 1000000);
        window._mpSeed = seededRand(_fSeed);
        // P2 submits mirrored coords so P1's mpApplyMove (4-r, col) gives correct position
        const _sr1 = (_mpPlayer===2) ? (4-r) : r;
        const _sc1 = (_mpPlayer===2) ? (6-c) : c;
        mpSubmitMove(_placedCardId || 'unknown', _sr1, _sc1, _fSeed, true);
      }
      showToast('↺ FLANK: EXTRA TURN!', '#ff9900');
      renderAll();
      return;
    }

    G.turn = 'ai';
    renderScoreHeader();
    if (G.gameOver) return;

    if (_mpRoom && _mpPlayer) {
      const seed = Math.floor(Math.random() * 1000000);
      window._mpSeed = seededRand(seed);
      const _sr = (_mpPlayer===2) ? (4-r) : r;
      const _sc = (_mpPlayer===2) ? (6-c) : c;
      mpSubmitMove(_placedCardId || 'unknown', _sr, _sc, seed).then(() => {
        if (!G.gameOver) {
          const allUsed = G.playerHand.every(c=>c.used) && G.aiHand.every(c=>c.used);
          if (!allUsed) mpStartPolling();
          else checkWin();
        }
      });
      return;
    }

    if (!hasAnyMoves('ai')) {
      if (!hasAnyMoves('player')) { checkWin(); return; }
      G.turn = 'player';
      addLog('system', 'AI has no moves -- your turn again');
      renderScoreHeader();
      return;
    }

    if (!G.aiHand.every(c=>c.used))
      setTimeout(aiTurn, 1200);
    else
      checkWin();
  };

  if (window.innerWidth <= 480) { animatePlayerCard(_placedCard, r, c, _doPlace); return; }
  _doPlace();
}
