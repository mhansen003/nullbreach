// DECIDING FACTOR announcements: computeScores is pure (no logging/DOM), so the
// placement path diffs dfRows/dfCols between placements and fires the log +
// cell pulse exactly once, only when the DF-broken set actually changes.
function _gzAnnounceDfChanges(s) {
  const prevR = G._dfPrevRows || Array(5).fill(null);
  const prevC = G._dfPrevCols || Array(7).fill(null);
  const pulse = (rr) => {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      if (!G || !G.grid || !G.grid[rr]) return;
      for (let dc = 0; dc < 7; dc++) {
        const cell = G.grid[rr][dc];
        if (cell && cell.card && cell.card.ability === 'deciding_factor' && cell.owner === 'player') {
          const el = document.querySelector('.cell[data-r="'+rr+'"][data-c="'+dc+'"]');
          if (el) { el.classList.add('just-placed'); setTimeout(() => el.classList.remove('just-placed'), 600); }
        }
      }
    }, 100);
  };
  s.dfRows.forEach((res, ri) => {
    if (res && prevR[ri] !== res) {
      addLog('compare', 'DECIDING FACTOR: tie broken in row ' + (ri+1) + ' for ' + (res==='p' ? 'player' : 'AI'));
      if (res === 'p') pulse(ri);
    }
  });
  s.dfCols.forEach((res, ci) => {
    if (res && prevC[ci] !== res) {
      addLog('compare', 'DECIDING FACTOR: tie broken in column ' + (ci+1) + ' for ' + (res==='p' ? 'player' : 'AI'));
    }
  });
  G._dfPrevRows = s.dfRows.slice();
  G._dfPrevCols = s.dfCols.slice();
}

function placeCard(card, r, c, owner) {

  G.grid[r][c] = { card, owner };   // owner NEVER changes after this

  card.used = true;

  // Stop MP turn timer on placement
  if (typeof mpStopTurnTimer === 'function') mpStopTurnTimer();

  applyPlacementAbility(card, r, c, owner);
  fireReactiveAbilities(r, c, card, owner);  // opponent ability cards react
  // Immediately recompute all battle results so ability edgeMod changes are visible
  // before doComparisons and renderAll run. computeScores updates G.grid[r][c].battle.
  const _sPlaced = computeScores();
  _gzAnnounceDfChanges(_sPlaced);

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

    // Select by data attributes — DOM order is REVERSED for P2 in multiplayer
    // (render-grid iterates rows [4..0] / cols [6..0]), so index math is wrong there.
    const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);

    if (cellEl) cellEl.classList.add('just-placed');

  }, 10);

  checkWin();

  if (typeof demoTrackMove === 'function') demoTrackMove(owner);

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

    if (!allDone) {
      // Deadlock: unused cards exist but neither side has valid placements
      if (hasAnyMoves('player') || hasAnyMoves('ai')) return;
      // Neither can move — fall through to show result
    }

  }

  G.gameOver = true;

  // Desktop shell (Steam/Electron): mark the match inactive (rich presence etc.)
  if (window.gzDesktop && typeof window.gzDesktop.setMatchActive === 'function')
    window.gzDesktop.setMatchActive(false);

  const _evS = computeScores();
  const _evWon = _evS.pVP > _evS.aVP, _evDraw = _evS.pVP === _evS.aVP;

  // ── Achievement check ──────────────────────────────────────────────────────
  const _newAchievs = typeof checkAchievements === 'function'
    ? checkAchievements({
        outcome: _evWon ? 'win' : _evDraw ? 'draw' : 'loss',
        pVP: _evS.pVP, aVP: _evS.aVP,
        pWins: _evS.pWins, aWins: _evS.aWins,
        playerFaction: window.playerRaceId,
        aiFaction: window.aiRaceId,
        grid: G.grid,
        rowResults: _evS.rowResults,
        colResults: _evS.colResults,
        dfRows: _evS.dfRows, dfCols: _evS.dfCols,
      })
    : [];

  if (typeof logGameEvent === 'function') logGameEvent('game_end', {
    player_faction: window.playerRaceId,
    ai_faction:     window.aiRaceId,
    difficulty:     window.aiDifficulty || 'balanced',
    mode:           _mpRoom ? 'pvp' : 'pve',
    outcome:        _evWon ? 'win' : _evDraw ? 'draw' : 'loss',
    player_vp:      _evS.pVP,
    ai_vp:          _evS.aVP
  });

  if (_mpRoom) {

    fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}`, {

      method:'PATCH', headers:_SB_H, body: JSON.stringify({ status:'done' })

    }).catch(()=>{});

  }

  const s = _evS;

  const overlay = document.getElementById('overlay');

  overlay.classList.add('show');

  const pWon = s.pVP > s.aVP, draw = s.pVP === s.aVP;

  // Leaderboard record check on player win (PvE and PvP)
  if (pWon && typeof checkLeaderboardRecord === 'function') {
    checkLeaderboardRecord(window.playerRaceId, window.aiRaceId, s.pVP, s.aVP, _mpRoom ? 'pvp' : 'pve');
  }

  const winCol2 = pWon ? (window.playerFactionColor||'#00ffcc') : draw ? '#888' : (window.aiFactionColor||'#ff0080');

  const winAv2  = pWon ? (window.playerAvatarImg||'') : (window.aiAvatarImg||'');

  const loseAv2 = pWon ? (window.aiAvatarImg||'') : (window.playerAvatarImg||'');

  const winNm2  = pWon ? (window.playerFactionName||'YOU') : (window.aiFactionName||'AI');

  const loseNm2 = pWon ? (window.aiFactionName||'AI') : (window.playerFactionName||'YOU');

  const winVP2  = pWon ? s.pVP : s.aVP;

  const loseVP2 = pWon ? s.aVP : s.pVP;

  // DRAW: symmetric layout, both avatars equal size (no broken empty <img src="">)
  const _pCol = window.playerFactionColor || '#00ffcc';
  const _aCol = window.aiFactionColor || '#ff0080';
  const _drawSide = (av, nm, col, vp) => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          ${av ? `<img src="${av}" style="width:84px;height:84px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${col}88;box-shadow:0 0 20px ${col}44;">` : ''}
          <span style="font-size:9px;letter-spacing:2px;color:${col};">${nm}</span>
          <span style="font-size:28px;font-weight:bold;color:${col};text-shadow:0 0 14px ${col};">${vp}</span>
          <span style="font-size:9px;letter-spacing:2px;color:${col}66;">VP</span>
        </div>`;

  const _duelHtml = draw ? `
      <div style="display:flex;align-items:center;gap:18px;">
        ${_drawSide(window.playerAvatarImg||'', window.playerFactionName||'YOU', _pCol, s.pVP)}
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <span style="font-size:11px;color:#666;letter-spacing:3px;">VS</span>
        </div>
        ${_drawSide(window.aiAvatarImg||'', window.aiFactionName||'AI', _aCol, s.aVP)}
      </div>` : `
      <div style="display:flex;align-items:center;gap:18px;">

        <!-- Winner -->

        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">

          ${winAv2 ? `<img src="${winAv2}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;object-position:top;border:3px solid ${winCol2};box-shadow:0 0 28px ${winCol2}66;">` : ''}

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

          ${loseAv2 ? `<img src="${loseAv2}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #555566;filter:grayscale(0.4);">` : ''}

          <span style="font-size:10px;letter-spacing:2px;color:#9999aa;">${loseNm2}</span>

          <span style="font-size:26px;font-weight:bold;color:#7777aa;">${loseVP2}</span>

          <span style="font-size:9px;letter-spacing:2px;color:#9999aa;">VP</span>

        </div>

      </div>`;

  overlay.innerHTML = `

    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:36px 44px;max-width:460px;">

      <div style="font-family:'Orbitron',monospace;font-size:20px;letter-spacing:5px;

        color:${pWon?'#00ffcc':draw?'#888':'#ff3344'};text-shadow:0 0 20px ${pWon?'#00ffcc33':draw?'#88888833':'#ff334433'};">

        ${pWon?'BREACH COMPLETE':draw?'STALEMATE':'BREACH FAILED'}

      </div>

      ${_duelHtml}

      <div style="height:1px;background:#1a1a28;width:100%;margin:4px 0;"></div>

      <div style="font-size:10px;color:#444;letter-spacing:2px;">

        ${s.pWins} ${s.pWins===1?"sector":"sectors"} won &nbsp;·&nbsp; ${s.aWins} to opponent

      </div>

      ${_newAchievs.length > 0 ? `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;background:#0a0a1a;border:1px solid #ffdd0033;border-radius:8px;padding:10px 18px;width:100%;box-sizing:border-box;">
        <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:3px;color:#ffdd00;text-shadow:0 0 10px #ffdd0055;">✦ ${_newAchievs.length} NEW ACHIEVEMENT${_newAchievs.length>1?'S':''} UNLOCKED ✦</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
          ${_newAchievs.map(id => {
            const a = (typeof ACHIEVEMENTS !== 'undefined' && ACHIEVEMENTS.find(x=>x.id===id)) || {name:id};
            return `<div title="${a.name}" style="position:relative;">
              <img src="badges-sm/${id}.webp" style="width:36px;height:36px;border-radius:6px;border:1px solid #ffdd0055;box-shadow:0 0 8px #ffdd0033;" onerror="this.style.display='none'">
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;justify-content:center;">

        ${_mpRoom
          ? `<button class="gz-endbtn primary" onclick="window.location.href=window.location.href"><span class="k">↺</span> NEW GAME</button>`
          : `<button class="gz-endbtn primary" onclick="initGame()"><span class="k">↺</span> REMATCH</button>`}

        <button class="gz-endbtn deck" onclick="goToMenu()"><span class="k">←</span> DECK SELECT</button>

        <button class="gz-endbtn score" onclick="typeof showLeaderboard==='function'&&showLeaderboard()"><span class="k">★</span> HIGH SCORES</button>

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

  // Battle outcome badges on adjacent enemy cells — delegated to the shared
  // preview engine (preview.js) so mobile and desktop show identical results.
  if (typeof window.gzPreviewBattle !== 'function') return;
  const _pv = window.gzPreviewBattle(card, r, c);
  const _frag = typeof window.gzRenderPreviewBadges === 'function' ? window.gzRenderPreviewBadges(_pv) : null;
  if (!_frag) return;
  const _dirOff = { n:{dr:-1,dc:0}, s:{dr:1,dc:0}, e:{dr:0,dc:1}, w:{dr:0,dc:-1} };
  Array.from(_frag.children).forEach(badge => {
    const d = badge.dataset.dir;
    const off = _dirOff[d];
    if (!off) return;
    const nr = r + off.dr, nc = c + off.dc;
    const adjEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
    if (!adjEl) return;
    const info = _pv[d];
    if (info && info.result) adjEl.classList.add(`bpv-${info.result}`);
    adjEl.appendChild(badge);
  });
}

function onCellClick(r, c) {

  // _placeInFlight: reject input while a placement is animating/resolving
  // (mobile double-tap race — two quick taps could place the same card twice)
  if (!G.selectedCard || G.turn !== 'player' || G.gameOver || G._placeInFlight) return;

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

  // Placement in flight: cleared wherever control returns to the player
  // (flank extra turn, AI-has-no-moves, or animateAiCard's turn flip in ai.js)
  G._placeInFlight = true;

  const _doPlace = () => {
    placeCard(_placedCard, r, c, 'player');

    if (G._flankTriggered === 'player') {
      G._flankTriggered = null;
      // FLANK fizzle guard: only grant the extra turn if the player actually
      // has an unused card AND a valid placement — otherwise the game would
      // soft-lock on the player's empty turn. Fizzled flank = normal turn pass.
      if (!G.gameOver && hasAnyMoves('player')) {
        G.turn = 'player';
        if (_mpRoom && _mpPlayer) {
          const _fSeed = Math.floor(Math.random() * 1000000);
          window._mpSeed = seededRand(_fSeed);
          // P2 submits mirrored coords so P1's mpApplyMove (4-r, col) gives correct position
          const _sr1 = (_mpPlayer===2) ? (4-r) : r;
          const _sc1 = (_mpPlayer===2) ? (6-c) : c;
          mpSubmitMove(_placedCardId || 'unknown', _sr1, _sc1, _fSeed, true);
          if (typeof window.mpStartTurnTimer === 'function') window.mpStartTurnTimer();
        }
        showToast('↺ FLANK: EXTRA TURN!', '#ff9900');
        renderAll();
        G._placeInFlight = false;
        return;
      }
      if (!G.gameOver) addLog('system', 'FLANK: no playable cards for the extra turn — turn passes');
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
      G._placeInFlight = false;
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
