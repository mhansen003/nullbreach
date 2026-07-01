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

function aiTurn() {

  const avail = G.aiHand.filter(c => !c.used);

  if (!avail.length) { checkWin(); return; }

  let best = -Infinity, bestCard = null, bestR = -1, bestC = -1;

  // Board scores don't change while evaluating candidates — compute once,
  // not once per candidate cell (computeScores rebuilds all battle state).
  const s = computeScores();

  for (const card of avail) {

    for (const {r,c} of getValidPlacements('ai', card)) {

      let score = 0;

      if (s.rowResults[r] !== 'a') score += 2;

      if (s.colResults[c] !== 'a') score += 2;

      // Penalise hazard-adjacent placements (-2 effective VP each)

      const _adjHz = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]

        .filter(({dr,dc})=>{const hr=r+dr,hc=c+dc;return hr>=0&&hr<5&&hc>=0&&hc<7&&G.grid[hr][hc].owner==='hazard';}).length;

      score -= _adjHz * 2.5;

      for (const d of DIRS4) {

        const nr=r+d.dr, nc=c+d.dc;

        if (nr<0||nr>=5||nc<0||nc>=7) continue;

        const t = G.grid[nr][nc];

        if (t.card && t.owner==='player' && card.edges[d.myE] > t.card.edges[d.theirE])

          score += 1;

      }

      const _diff = window.aiDifficulty || 'balanced';

      if (_diff === 'passive') {

        score -= r * 1.5;

        if (card.tier === 'III' || card.tier === 'IV') score -= 4;

      } else if (_diff === 'aggressive') {

        score += r * 2.0;

        if (card.tier === 'III') score += 2;

        if (card.tier === 'IV') score += 5;

      }

      const _noise = _diff==='passive' ? Math.random()*5.0 : (_diff==='aggressive' ? Math.random()*1.5 : Math.random()*2.5);

      score += r * 0.2 + (2.5-Math.abs(2.5-c)) * 0.1 + _noise + card.power * 0.25;

      // Passive: occasionally force a random suboptimal pick

      if (_diff==='passive' && Math.random() < 0.25) score = Math.random() * 3;

      if (score > best) { best=score; bestCard=card; bestR=r; bestC=c; }

    }

  }

  if (bestCard && bestR >= 0) {

    animateAiCard(bestCard, bestR, bestC);

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
