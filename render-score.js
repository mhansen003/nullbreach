const _prevBadgeRes = { rows: Array(5).fill(null), cols: Array(7).fill(null) };
let _activeBadge = null;

// ── Score breakdown tooltip ────────────────────────────────────────────────
function _buildScoreBreakdown(axis, idx) {
  const s = computeScores();
  const pCol  = window.playerFactionColor || '#00ffcc';
  const aCol  = window.aiFactionColor    || '#ff0080';
  const pAvg  = window.playerAvatarImg   || '';
  const aAvg  = window.aiAvatarImg       || '';
  const pName = window.playerFactionName || 'YOU';
  const aName = window.aiFactionName     || 'OPP';

  const entries = [];
  const range = axis === 'row'
    ? Array.from({length:7},(_,i)=>({r:idx,c:i}))
    : Array.from({length:5},(_,i)=>({r:i,c:idx}));

  range.forEach(({r,c}) => {
    const cell = G.grid[r][c];
    if (!cell.card) return;
    if (cell.owner === 'hazard') { entries.push({hazard:true,name:cell.card.name||'HAZARD ZONE'}); return; }

    const isP   = cell.owner === 'player';
    const bat   = cell.battle || {h:'none',v:'none'};
    const axBat = axis === 'row' ? bat.h : bat.v;
    const mods  = [];
    let silenced = false;
    let _silenceReason = 'silenced';

    if (cell.card._silenced) silenced = true;

    // LAMB: 0 VP if any enemy is adjacent (mirrors battle.js computeScores logic)
    if (!silenced && cell.card.ability === 'lamb') {
      const _dirs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
      const _hasAdjEnemy = _dirs.some(({dr,dc}) => {
        const rr=r+dr, cc=c+dc;
        return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].card&&G.grid[rr][cc].owner!==cell.owner&&G.grid[rr][cc].owner!=='hazard';
      });
      if (_hasAdjEnemy) { silenced = true; _silenceReason = '🚫 enemy adjacent'; }
    }

    const adjHz   = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
      .filter(({dr,dc})=>{const rr=r+dr,cc=c+dc;return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard';}).length;
    const basePow = cell.card.ability === 'density' ? cell.card.power + 2 : cell.card.power;
    const _revPen = Math.min(cell.card._revengePenalty || 0, Math.max(0, basePow - 1));
    const effPow  = Math.max(0, basePow - adjHz*2 - _revPen);
    if (cell.card.ability === 'density') mods.push(`+2 VP`);
    if (adjHz > 0) mods.push(`−${adjHz*2} haz`);
    if (_revPen > 0) mods.push(`−${_revPen} revenge`);
    if (silenced)  mods.push(_silenceReason);

    const counts = !silenced && (axBat === 'win' || axBat === 'none');
    const vp = counts ? effPow : 0;

    entries.push({ isP, name:cell.card.name, tier:cell.card.tier,
      ability:cell.card.ability, axBat, vp, silenced, mods,
      fCol: isP ? pCol : aCol, avatar: isP ? pAvg : aAvg });
  });

  const tot    = axis === 'row' ? s.rows[idx]       : s.cols[idx];
  const result = axis === 'row' ? s.rowResults[idx] : s.colResults[idx];
  const label  = axis === 'row' ? `ROW ${idx+1}` : `COL ${idx+1}`;

  // Winner hero section
  const winAvg  = result==='p' ? pAvg  : result==='a' ? aAvg  : null;
  const winName = result==='p' ? pName : result==='a' ? aName : 'TIE';
  const winCol  = result==='p' ? pCol  : result==='a' ? aCol  : '#ffdd00';
  const heroHtml = `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0 12px;border-bottom:1px solid #ffffff0a;margin-bottom:8px;">
      ${winAvg ? `<img src="${winAvg}" alt="${winName}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${winCol};box-shadow:0 0 12px ${winCol}44;flex-shrink:0;">` : `<div style="width:44px;height:44px;border-radius:50%;background:#ffdd0022;border:2px solid #ffdd0066;display:flex;align-items:center;justify-content:center;font-size:18px;">⚖</div>`}
      <div>
        <div style="font-family:'Orbitron',monospace;font-size:12px;font-weight:700;color:${winCol};letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;">${winName}</div>
        <div style="font-size:10px;color:#ccd;letter-spacing:2px;margin-top:2px;">${result==='tie'?'ALL TIED':'WINS '+label}</div>
      </div>
      <div style="margin-left:auto;text-align:right;">
        <div style="font-size:11px;color:#ccd;letter-spacing:1px;">${pName} <span style="color:${pCol};font-weight:bold;">${tot?.p||0}</span></div>
        <div style="font-size:11px;color:#ccd;letter-spacing:1px;margin-top:2px;">${aName} <span style="color:${aCol};font-weight:bold;">${tot?.a||0}</span></div>
      </div>
    </div>`;

  // Card rows: clean and minimal
  const batIcon = b => b==='win'?'▲':b==='lose'?'▼':b==='tie'?'◆':'·';
  const batTxt  = b => b==='win'?'#44dd88':b==='lose'?'#dd4444':b==='tie'?'#ffdd00':'#888';

  const cardsHtml = entries.map(e => {
    if (e.hazard) return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #0f0f1a;opacity:0.6;"><span style="color:#ff8800;font-size:11px;">⚠ HAZARD</span></div>`;
    const icon = batIcon(e.axBat);
    const icol = batTxt(e.axBat);
    const abilTag = e.ability ? (e.silenced
      ? `<span style="font-size:9px;color:#555;letter-spacing:1px;text-decoration:line-through;"> · ${(ABILITY_ICONS[e.ability]||{label:e.ability}).label}</span>`
      : `<span style="font-size:9px;color:#aabbcc;letter-spacing:1px;"> · ${(ABILITY_ICONS[e.ability]||{label:e.ability}).label}</span>`) : '';
    const modTag  = e.mods.length ? `<span style="font-size:9px;color:#ffaa44;"> ${e.mods.join(', ')}</span>` : '';
    const _vpDisplay = e.ability === 'density' && e.vp > 0
      ? `${e.vp} <span style="font-size:9px;color:#aaff44;">+2</span>`
      : `${e.vp}`;
    // A card that contributes 0 VP (tie = won-one/lost-one, loss, silenced, or
    // hazard-zeroed) is NOT counted toward the line — dim the whole row so it's
    // visually clear it's eliminated, not just its number.
    const _dim = e.vp === 0;
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #0f0f1a;${_dim ? 'opacity:0.4;' : ''}">
        <img src="${e.avatar}" alt="" style="width:20px;height:20px;border-radius:50%;object-fit:cover;border:1px solid ${e.fCol}44;flex-shrink:0;${_dim ? 'filter:grayscale(0.85);' : ''}">
        <span style="flex:1;font-size:12px;color:${_dim ? '#888' : '#dde'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${_dim ? 'text-decoration:line-through;' : ''}">${e.name}${abilTag}</span>
        ${modTag}
        <span style="font-size:14px;color:${icol};flex-shrink:0;width:12px;text-align:center;">${icon}</span>
        <span style="font-size:13px;font-weight:bold;color:${e.vp>0?'#fff':'#888'};flex-shrink:0;width:36px;text-align:right;">${_vpDisplay} <span style="font-size:10px;color:#aaa;">VP</span></span>
      </div>`;
  }).join('');

  return heroHtml + (cardsHtml || `<div style="font-size:11px;color:#888;padding:4px 0;">No cards placed</div>`);
}

let _scoreTipEl = null;
function _showScoreTip(badge, axis, idx) {
  _hideScoreTip();
  const tip = document.createElement('div');
  tip.id = '_scoreTip';
  tip.style.cssText = `
    position:fixed;z-index:9999;pointer-events:none;
    bottom:120px;right:16px;left:auto;top:auto;
    background:#090912ee;border:1px solid #ffffff14;
    backdrop-filter:blur(14px);border-radius:10px;
    padding:12px 14px;width:280px;
    font-family:'Inter',system-ui,sans-serif;font-size:12px;color:#bbb;
    box-shadow:0 8px 40px #000c,0 0 0 1px #ffffff06;
  `;
  tip.innerHTML = _buildScoreBreakdown(axis, idx);
  document.body.appendChild(tip);
  _scoreTipEl = tip;
}
function _hideScoreTip() {
  if (_scoreTipEl) { _scoreTipEl.remove(); _scoreTipEl = null; }
}

// ── Row/col grid highlight: class toggles on #grid + cells; the .row-hl/
// .col-hl + .hl-target/.hl-cancel/.hl-hazard rules live in game.css (task 74).
function _gzShowGridHl(axis, idx, res) {
  _gzClearGridHl();
  const gridEl = document.getElementById('grid');
  if (!gridEl) return;
  const pCol = window.playerFactionColor || '#00ffcc';
  const aCol = window.aiFactionColor     || '#ff0080';
  const hlCol = res === 'p' ? pCol : res === 'a' ? aCol : '#ffffff';
  const batKey = axis === 'row' ? 'h' : 'v';

  gridEl.classList.add(axis === 'row' ? 'row-hl' : 'col-hl');

  gridEl.querySelectorAll('.cell').forEach(el => {
    const er = +el.dataset.r, ec = +el.dataset.c;
    if ((axis === 'row' ? er : ec) !== idx) return;
    el.classList.add('hl-target');
    const cell = G.grid[er] && G.grid[er][ec];
    if (!cell) return;
    if (cell.owner === 'hazard') { el.classList.add('hl-hazard'); return; }
    const bat = cell.card ? (cell.battle || {h:'none', v:'none'}) : null;
    const cancelled = bat && (bat[batKey] === 'tie' || bat[batKey] === 'lose');
    const hazardHit = cell.card && [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
      .some(({dr,dc}) => { const rr=er+dr, cc=ec+dc; return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard'; });
    if (cancelled || hazardHit) el.classList.add('hl-cancel');
  });

  // Frame overlay: union of the line's end-cell rects (correct on MP P2 + mobile)
  if (typeof gzCellRect === 'function') {
    const a = axis === 'row' ? gzCellRect(idx, 0) : gzCellRect(0, idx);
    const b = axis === 'row' ? gzCellRect(idx, 6) : gzCellRect(4, idx);
    if (a && b) {
      const left = Math.min(a.left, b.left), top = Math.min(a.top, b.top);
      const w = Math.max(a.left + a.width,  b.left + b.width)  - left;
      const h = Math.max(a.top  + a.height, b.top  + b.height) - top;
      const ov = document.createElement('div');
      ov.className = 'score-hl';
      ov.style.cssText = `position:absolute;pointer-events:none;z-index:8;top:${top}px;left:${left}px;width:${w}px;height:${h}px;border:3px solid ${hlCol}cc;border-radius:6px;box-shadow:0 0 22px ${hlCol}55,inset 0 0 10px ${hlCol}11;`;
      gridEl.appendChild(ov);
    }
  }
}

function _gzClearGridHl() {
  const gridEl = document.getElementById('grid');
  if (gridEl) gridEl.classList.remove('row-hl', 'col-hl');
  document.querySelectorAll('#grid .cell.hl-target, #grid .cell.hl-cancel, #grid .cell.hl-hazard')
    .forEach(el => el.classList.remove('hl-target', 'hl-cancel', 'hl-hazard'));
  document.querySelectorAll('.score-hl').forEach(el => el.remove());
}

// Create badge nodes once; later renders update them in place (keep DOM).
function _gzEnsureBadgeStrip(container, count, cls) {
  if (container._gzCount !== count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = cls;
      b.style.cursor = 'pointer';
      container.appendChild(b);
    }
    container._gzCount = count;
  }
  return Array.from(container.children);
}

function renderScoreBadges(_precomputed) {

  // Kill stale pinned tooltips before touching the strips
  if (typeof _hideScoreTip === 'function') _hideScoreTip();
  if (typeof hideTip === 'function') hideTip();

  const s = _precomputed || computeScores();

  // Update total score display

  const tP = document.getElementById('totalP');

  const tA = document.getElementById('totalA');

  const pLabel = window.playerFactionName || 'YOU';

  const aLabel = window.aiFactionName    || 'AI';

  if (tP) tP.textContent = `${pLabel}: ${s.pVP} VP`;

  if (tA) tA.textContent = `${aLabel}: ${s.aVP} VP`;

  const pAvatar = window.playerAvatarImg || `assets/avatars/${window.playerRaceId||'terran'}.png`;

  const aAvatar = window.aiAvatarImg    || `assets/avatars/${window.aiRaceId||'entropy'}.png`;

  const pCol    = window.playerFactionColor || '#00ffcc';

  const aCol    = window.aiFactionColor     || '#ff0080';

  // ── Score badge: show WINNER only prominently; loser = tiny "vs N" text ──

  // This eliminates confusion of "I see my avatar = I must be winning"

  function rowBadgeHtml(p, a, res, dfBroken) {

    if (p === 0 && a === 0) return `<span style="font-size:14px;color:#444466;letter-spacing:2px;pointer-events:none;">--</span>`;

    if (res === 'tie') return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none;">
        <span style="font-size:14px;font-weight:bold;color:#ffdd00;line-height:1;pointer-events:none;">${p}:${a}</span>
        <span style="font-size:8px;letter-spacing:2px;color:#ffdd00aa;pointer-events:none;">TIE</span>
      </div>`;

    const pWin = res === 'p';

    const wAvg = pWin ? pAvatar : aAvatar;

    const wScore = pWin ? p : a, lScore = pWin ? a : p;

    const delta = wScore - lScore;

    const wCol = pWin ? pCol : aCol;

    // DECIDING FACTOR: gold ≠ badge when this row was a tie that got broken
    const dfBadge = dfBroken ? `<span style="font-size:6px;letter-spacing:1px;color:#ffdd00;background:#2a2000;border:1px solid #ffdd0066;border-radius:2px;padding:0 2px;pointer-events:none;">≠ BROKEN</span>` : '';

    return `

      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;">

        <img src="${wAvg}" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;

          object-position:top;border:2px solid ${wCol};box-shadow:0 0 8px ${wCol}66;pointer-events:none;">

        <span style="font-size:20px;font-weight:bold;color:${wCol};line-height:1;

          text-shadow:0 0 8px ${wCol};pointer-events:none;">+${delta}</span>

        ${dfBadge}

      </div>`;

  }

  function colBadgeHtml(p, a, res, dfBroken) {

    if (p === 0 && a === 0) return `<span style="font-size:13px;color:#444466;letter-spacing:2px;pointer-events:none;">--</span>`;

    if (res === 'tie') return `<div style="pointer-events:none;text-align:center;">
      <span style="font-size:13px;font-weight:bold;color:#ffdd00;line-height:1;display:block;">${p}:${a}</span>
      <span style="font-size:8px;letter-spacing:2px;color:#ffdd00aa;display:block;">TIE</span></div>`;

    const pWin = res === 'p';

    const wAvg = pWin ? pAvatar : aAvatar;

    const wScore = pWin ? p : a, lScore = pWin ? a : p;

    const delta = wScore - lScore;

    const wCol = pWin ? pCol : aCol;

    // DECIDING FACTOR: gold ≠ badge when this col was a tie that got broken
    const dfBadge = dfBroken ? `<span style="font-size:6px;letter-spacing:0px;color:#ffdd00;background:#2a2000;border:1px solid #ffdd0066;border-radius:2px;padding:0 2px;pointer-events:none;">≠</span>` : '';

    return `

      <div style="display:flex;align-items:center;gap:5px;pointer-events:none;">

        <img src="${wAvg}" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;

          object-position:top;border:2px solid ${wCol};box-shadow:0 0 8px ${wCol}55;pointer-events:none;">

        <span style="font-size:18px;font-weight:bold;color:${wCol};line-height:1;

          text-shadow:0 0 8px ${wCol};pointer-events:none;">+${delta}</span>

        ${dfBadge}

      </div>`;

  }

  // Shared wiring for a badge: listeners attach ONCE; per-render state lives
  // in dataset so handlers always read the latest result.
  function _wireBadge(badge, axis, idx) {
    if (badge._gzWired) return;
    badge._gzWired = true;
    badge.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 480) return;
      document.body.style.cursor = 'default';
      _gzShowGridHl(axis, idx, badge.dataset.res);
      _showScoreTip(badge, axis, idx);
    });
    badge.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 480) return;
      _gzClearGridHl();
      _hideScoreTip();
    });
    badge.addEventListener('click', () => {
      if (window.innerWidth > 480) return;
      if (_activeBadge === badge) { _activeBadge = null; _gzClearGridHl(); }
      else { if (_activeBadge) _gzClearGridHl(); _activeBadge = badge; _gzShowGridHl(axis, idx, badge.dataset.res); }
    });
  }

  // Update a badge in place: only touch DOM when content/styling changed.
  function _updateBadge(badge, html, css, res, prevRes) {
    if (badge._gzHtml !== html) { badge.innerHTML = html; badge._gzHtml = html; }
    if (badge._gzCss !== css) { badge.style.cssText = css + 'cursor:pointer;'; badge._gzCss = css; }
    badge.dataset.res = res;
    // Flip animation when leadership changes between renders
    if (prevRes !== null && prevRes !== res && (res==='p'||res==='a') && (prevRes==='p'||prevRes==='a')) {
      badge.classList.add('badge-flip');
      setTimeout(() => badge.classList.remove('badge-flip'), 450);
    }
  }

  // ROW score badges: apply faction border color dynamically

  const rowEl = document.getElementById('rowScores');

  const _rowOrder = (typeof _mpPlayer !== 'undefined' && _mpPlayer === 2)
    ? [4,3,2,1,0] : [0,1,2,3,4];

  const rowBadges = _gzEnsureBadgeStrip(rowEl, 5, 'row-score-badge');

  _rowOrder.forEach((r, i) => {

    const badge = rowBadges[i];

    const {p,a} = s.rows[r];

    const res = s.rowResults[r];

    // WIN=player color border, LOSE=opponent color border, TIE=grey
    const rowWinCol  = res==='p' ? pCol : res==='a' ? aCol : '#333';
    const rowBorder  = res==='p' ? pCol+'55' : res==='a' ? aCol+'55' : (p===0&&a===0)?'#111120':'#221a33';
    const css = `background:#06060e;border:1px solid ${rowBorder};border-left:3px solid ${rowWinCol};`;

    _updateBadge(badge, rowBadgeHtml(p, a, res, s.dfRows && s.dfRows[r]), css, res, _prevBadgeRes.rows[r]);

    _prevBadgeRes.rows[r] = res;

    _wireBadge(badge, 'row', r);

  });

  // COL score badges: apply faction border color dynamically

  const colEl = document.getElementById('colScores');

  const _colOrder = (typeof _mpPlayer !== 'undefined' && _mpPlayer === 2)
    ? [6,5,4,3,2,1,0] : [0,1,2,3,4,5,6];

  const colBadges = _gzEnsureBadgeStrip(colEl, 7, 'col-score-badge');

  _colOrder.forEach((c, i) => {

    const badge = colBadges[i];

    const {p,a} = s.cols[c];

    const res = s.colResults[c];

    // WIN=player color top-border, LOSE=opponent color, TIE=grey
    const colWinCol  = res==='p' ? pCol : res==='a' ? aCol : '#333';
    const colBorder  = res==='p' ? pCol+'55' : res==='a' ? aCol+'55' : (p===0&&a===0)?'#111120':'#221a33';
    const css = `background:#06060e;border:1px solid ${colBorder};border-top:3px solid ${colWinCol};`;

    _updateBadge(badge, colBadgeHtml(p, a, res, s.dfCols && s.dfCols[c]), css, res, _prevBadgeRes.cols[c]);

    _prevBadgeRes.cols[c] = res;

    _wireBadge(badge, 'col', c);

  });

}

function renderScoreHeader(_precomputed) {

  const s = _precomputed || computeScores();

  const tag = document.getElementById('turnTag');

  if (tag) {

    const _isMp = typeof _mpRoom !== 'undefined' && _mpRoom;
    tag.textContent = G.turn==='player' ? 'YOUR TURN'
      : _isMp ? 'WAITING FOR OPPONENT...'
      : 'AI THINKING...';

    tag.className   = 'turn-tag ' + G.turn;

  }

  // Screen-reader announcements: turn changes + running battle score
  if (typeof gzAnnounce === 'function' && window._gzLastTurn !== G.turn) {
    window._gzLastTurn = G.turn;
    gzAnnounce(G.turn === 'player'
      ? `Your turn. Score: you ${s.pVP}, opponent ${s.aVP}.`
      : `Opponent's turn. Score: you ${s.pVP}, opponent ${s.aVP}.`);
  }

  const q = document.getElementById('aiQuote');

  if (q) {

    if (s.aVP > s.pVP+2) q.textContent = '"Predictable. You are nothing."';

    else if (s.pVP > s.aVP+2) q.textContent = '"Impossible... recalculating."';

    else q.textContent = '"Your breach ends here."';

  }

  // ── Score HUD (bottom-right): faction-colored ──────────────────

  const pCol = window.playerFactionColor || '#00ffcc';

  const aCol = window.aiFactionColor     || '#ff0080';

  const pAvg = window.playerAvatarImg    || '';

  const aAvg = window.aiAvatarImg        || '';

  let pNam = window.playerFactionName  || 'YOU';
  let aNam = window.aiFactionName      || 'AI';

  // In multiplayer, show player initials when available.
  // multiplayer.js declares `const _mpPlayer` (a global lexical binding, NOT
  // window._mpPlayer) derived from the ?player= URL param — read it the same
  // way, with the URL param as a belt-and-braces fallback.
  const _mpLocal = (typeof _mpPlayer !== 'undefined' && _mpPlayer)
    ? _mpPlayer
    : parseInt(new URLSearchParams(window.location.search).get('player') || '0', 10);
  if (_mpLocal === 1) {
    if (window._mpP1Initials && window._mpP1Initials !== '---') pNam = window._mpP1Initials;
    if (window._mpP2Initials && window._mpP2Initials !== '---') aNam = window._mpP2Initials;
  } else if (_mpLocal === 2) {
    if (window._mpP2Initials && window._mpP2Initials !== '---') pNam = window._mpP2Initials;
    if (window._mpP1Initials && window._mpP1Initials !== '---') aNam = window._mpP1Initials;
  }

  const pLeading = s.pVP > s.aVP;

  const aLeading = s.aVP > s.pVP;

  // ── FACTION HUD (fixed upper-right) ──────────────────

  const hud = document.getElementById('factionHUD');

  const fhAiEl  = document.getElementById('fhAi');

  const fhPEl   = document.getElementById('fhPlayer');

  const sbAiAv  = document.getElementById('sbAiAvatar');

  const sbAiNum = document.getElementById('sbAiNum');

  const sbAiName= document.getElementById('sbAiName');
  const sbAiAvEl= document.getElementById('sbAiAvatar');

  const sbAiLead= document.getElementById('sbAiLead');

  const sbPAv   = document.getElementById('sbPlayerAvatar');

  const sbPNum  = document.getElementById('sbPlayerNum');

  const sbPName = document.getElementById('sbPlayerName');

  const sbPLead = document.getElementById('sbPlayerLead');

  // AI faction row

  if (sbAiAv) { sbAiAv.src = aAvg; sbAiAv.style.borderColor = aLeading ? aCol : '#2a2a3a'; sbAiAv.style.boxShadow = aLeading ? `0 0 12px ${aCol}88` : 'none'; }

  if (sbAiNum) { sbAiNum.textContent = s.aVP; sbAiNum.style.color = aLeading ? aCol : '#ffffff'; sbAiNum.style.textShadow = aLeading ? `0 0 12px ${aCol}` : 'none'; }

  if (sbAiName) { sbAiName.textContent = aNam; sbAiName.style.color = aLeading ? aCol : aCol + 'bb'; }

  if (sbAiLead) { sbAiLead.textContent = aLeading ? 'IN THE LEAD' : ''; sbAiLead.style.color = aCol; }

  if (fhAiEl) { fhAiEl.style.background = aLeading ? aCol + '18' : 'transparent'; fhAiEl.style.boxShadow = aLeading ? `0 0 0 1px ${aCol}44` : 'none'; }

  // Player faction row

  if (sbPAv) { sbPAv.src = pAvg; sbPAv.style.borderColor = pLeading ? pCol : '#2a2a3a'; sbPAv.style.boxShadow = pLeading ? `0 0 12px ${pCol}88` : 'none'; }

  if (sbPNum) { sbPNum.textContent = s.pVP; sbPNum.style.color = pLeading ? pCol : '#ffffff'; sbPNum.style.textShadow = pLeading ? `0 0 12px ${pCol}` : 'none'; }

  if (sbPName) { sbPName.textContent = pNam; sbPName.style.color = pLeading ? pCol : pCol + 'bb'; }

  if (sbPLead) { sbPLead.textContent = pLeading ? 'IN THE LEAD' : ''; sbPLead.style.color = pCol; }

  if (fhPEl) { fhPEl.style.background = pLeading ? pCol + '18' : 'transparent'; fhPEl.style.boxShadow = pLeading ? `0 0 0 1px ${pCol}44` : 'none'; }

  // HUD outer glow

  if (hud) hud.style.borderColor = pLeading ? pCol+'33' : aLeading ? aCol+'33' : '#1a1a28';

}
