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

    const isP  = cell.owner === 'player';
    const bat  = cell.battle || {h:'none',v:'none'};
    const axBat = axis === 'row' ? bat.h : bat.v;
    const notes = [];
    let silenced = false;

    if (cell.card.sniped)           { silenced = true; notes.push('🎯 SNIPED — silenced'); }
    else if (cell.card.stonewall_victim) { silenced = true; notes.push('⬛ STONEWALL — blocked'); }

    const adjHz = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
      .filter(({dr,dc})=>{const rr=r+dr,cc=c+dc;return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard';}).length;
    const basePow = cell.card.ability === 'density' ? Math.ceil(cell.card.power*1.5) : cell.card.power;
    const effPow  = Math.max(0, basePow - adjHz*2);

    if (cell.card.ability === 'density') notes.push(`DENSITY ×1.5 (${cell.card.power}→${basePow})`);
    if (adjHz > 0) notes.push(`HAZARD −${adjHz*2} VP`);
    if (cell.card.ability === 'echo') notes.push('ECHO — double if wins row+col');
    if (cell.card.ability === 'deciding_factor') notes.push('DECIDING FACTOR — breaks ties');

    const counts = !silenced && (axBat === 'win' || axBat === 'none');
    const vp = counts ? effPow : 0;

    entries.push({ isP, name:cell.card.name, tier:cell.card.tier, power:cell.card.power,
      ability:cell.card.ability, axBat, vp, silenced, notes,
      fCol: isP ? pCol : aCol, avatar: isP ? pAvg : aAvg });
  });

  const tot    = axis === 'row' ? s.rows[idx]       : s.cols[idx];
  const result = axis === 'row' ? s.rowResults[idx] : s.colResults[idx];
  const label  = axis === 'row' ? `ROW ${idx+1}` : `COL ${idx+1}`;

  const batLabel = b => b==='win'?'WIN':b==='lose'?'LOSE':b==='tie'?'TIE':'—';
  const batCol   = b => b==='win'?'#44ff88':b==='lose'?'#ff4444':b==='tie'?'#ffdd00':'#666';

  const rowsHtml = entries.map(e => {
    if (e.hazard) return `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #1a1a2a;opacity:0.7;">
        <div style="width:22px;height:22px;border-radius:4px;background:#ff660033;border:1px solid #ff660055;display:flex;align-items:center;justify-content:center;font-size:10px;">⚠</div>
        <span style="font-size:10px;color:#ff8800;letter-spacing:1px;">${e.name}</span>
      </div>`;
    const bc = batCol(e.axBat);
    const bl = batLabel(e.axBat);
    return `
      <div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #1a1a2a;">
        <img src="${e.avatar}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:1px solid ${e.fCol}55;flex-shrink:0;margin-top:1px;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-family:'Orbitron',monospace;font-size:10px;color:${e.fCol};letter-spacing:0.5px;">${e.name}</span>
            <span style="font-size:9px;color:#888;letter-spacing:1px;">T${{'I':1,'II':2,'III':3,'IV':4}[e.tier]||1}</span>
            ${e.ability?`<span style="font-size:8px;color:#ffdd0099;letter-spacing:1px;">${e.ability.toUpperCase()}</span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:3px;">
            <span style="font-size:11px;font-weight:bold;color:${bc};letter-spacing:2px;">${bl}</span>
            ${e.silenced
              ? `<span style="font-size:10px;color:#888;font-style:italic;">silenced → 0 VP</span>`
              : `<span style="font-size:13px;font-weight:bold;color:${e.vp>0?e.fCol:'#666'};">${e.vp} VP</span>`}
          </div>
          ${e.notes.length ? `<div style="margin-top:2px;">${e.notes.map(n=>`<div style="font-size:9px;color:#ffaa44;letter-spacing:0.5px;">· ${n}</div>`).join('')}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const resLabel = result==='p' ? `${pName} WINS` : result==='a' ? `${aName} WINS` : 'TIE';
  const resCol   = result==='p' ? pCol : result==='a' ? aCol : '#ffdd00';

  return `
    <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#888;margin-bottom:8px;">${label} BREAKDOWN</div>
    ${rowsHtml || '<div style="font-size:10px;color:#555;padding:4px 0;">No cards placed</div>'}
    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1a1a2a;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <img src="${pAvg}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1px solid ${pCol}55;">
          <span style="font-size:10px;color:${pCol};">${pName}</span>
        </div>
        <span style="font-size:16px;font-weight:bold;color:${pCol};">${tot?.p||0} VP</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <img src="${aAvg}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1px solid ${aCol}55;">
          <span style="font-size:10px;color:${aCol};">${aName}</span>
        </div>
        <span style="font-size:16px;font-weight:bold;color:${aCol};">${tot?.a||0} VP</span>
      </div>
      <div style="text-align:center;font-size:11px;font-weight:bold;color:${resCol};letter-spacing:2px;padding:4px 0;border:1px solid ${resCol}44;border-radius:4px;background:${resCol}11;">${resLabel}</div>
    </div>`;
}

let _scoreTipEl = null;
function _showScoreTip(badge, axis, idx) {
  _hideScoreTip();
  const tip = document.createElement('div');
  tip.id = '_scoreTip';
  tip.style.cssText = `
    position:fixed;z-index:9999;pointer-events:none;
    background:#08081688;border:1px solid #1a1a3a;
    backdrop-filter:blur(12px);border-radius:8px;
    padding:12px 14px;width:260px;
    font-family:'Courier New',monospace;font-size:11px;color:#ccc;
    box-shadow:0 4px 32px #000a,0 0 0 1px #ffffff08;
  `;
  tip.innerHTML = _buildScoreBreakdown(axis, idx);
  document.body.appendChild(tip);
  _scoreTipEl = tip;

  // Position: always on the right side of screen (same region as card tooltips)
  const rect = badge.getBoundingClientRect();
  tip.style.right = '16px';
  tip.style.left  = 'auto';
  const tipTop = Math.min(
    window.innerHeight - 20 - (tip.offsetHeight || 300),
    Math.max(8, rect.top - 20)
  );
  tip.style.top = tipTop + 'px';
}
function _hideScoreTip() {
  if (_scoreTipEl) { _scoreTipEl.remove(); _scoreTipEl = null; }
}

function renderScoreBadges(_precomputed) {


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





  function rowBadgeHtml(p, a, res) {


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


    return `


      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;">


        <img src="${wAvg}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;


          object-position:top;border:2px solid ${wCol};box-shadow:0 0 8px ${wCol}66;pointer-events:none;">


        <span style="font-size:20px;font-weight:bold;color:${wCol};line-height:1;


          text-shadow:0 0 8px ${wCol};pointer-events:none;">+${delta}</span>


      </div>`;


  }





  function colBadgeHtml(p, a, res) {


    if (p === 0 && a === 0) return `<span style="font-size:13px;color:#444466;letter-spacing:2px;pointer-events:none;">--</span>`;


    if (res === 'tie') return `<div style="pointer-events:none;text-align:center;">
      <span style="font-size:13px;font-weight:bold;color:#ffdd00;line-height:1;display:block;">${p}:${a}</span>
      <span style="font-size:8px;letter-spacing:2px;color:#ffdd00aa;display:block;">TIE</span></div>`;


    const pWin = res === 'p';


    const wAvg = pWin ? pAvatar : aAvatar;


    const wScore = pWin ? p : a, lScore = pWin ? a : p;


    const delta = wScore - lScore;


    const wCol = pWin ? pCol : aCol;


    return `


      <div style="display:flex;align-items:center;gap:5px;pointer-events:none;">


        <img src="${wAvg}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;


          object-position:top;border:2px solid ${wCol};box-shadow:0 0 8px ${wCol}55;pointer-events:none;">


        <span style="font-size:18px;font-weight:bold;color:${wCol};line-height:1;


          text-shadow:0 0 8px ${wCol};pointer-events:none;">+${delta}</span>


      </div>`;


  }





  // ROW score badges — apply faction border color dynamically


  const rowEl = document.getElementById('rowScores');


  rowEl.innerHTML = '';


  for (let r = 0; r < 5; r++) {


    const {p,a} = s.rows[r];


    const res = s.rowResults[r];


    const badge = document.createElement('div');


    badge.className = 'row-score-badge'; badge.style.cursor = 'pointer';


    // WIN=player color border, LOSE=opponent color border, TIE=grey


    const rowWinCol  = res==='p' ? pCol : res==='a' ? aCol : '#333';


    const rowBg      = res==='p' ? pCol+'08' : res==='a' ? aCol+'08' : (p===0&&a===0)?'#07070f':'#0d0c18';


    const rowBorder  = res==='p' ? pCol+'55' : res==='a' ? aCol+'55' : (p===0&&a===0)?'#111120':'#221a33';


    badge.style.cssText = `background:${rowBg};border:1px solid ${rowBorder};border-left:3px solid ${rowWinCol};`;


    badge.innerHTML = rowBadgeHtml(p, a, res);


    // Flip animation when leadership changes between renders


    const prevRes = _prevBadgeRes.rows[r];


    if (prevRes !== null && prevRes !== res && (res==='p'||res==='a') && (prevRes==='p'||prevRes==='a')) {


      badge.classList.add('badge-flip');


      setTimeout(() => badge.classList.remove('badge-flip'), 450);


    }


    _prevBadgeRes.rows[r] = res;


    const _rowHlCol = res==='p' ? pCol : res==='a' ? aCol : '#ffffff';


    const _showRowHl = () => {
      document.querySelectorAll('.cell').forEach(el => {
        const er = el.dataset.r;
        const ec = el.dataset.c;
        if (er == r) {
          const cell = G.grid[er][ec];
          const bat  = cell?.card ? (cell.battle || {h:'none',v:'none'}) : null;
          const cancelled = bat && (bat.h === 'tie' || bat.h === 'lose');
          const hazardHit = cell?.card && cell.owner !== 'hazard' && [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
            .some(({dr,dc}) => { const rr=+er+dr,cc=+ec+dc; return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard'; });
          el.style.outline = cell?.owner === 'hazard' ? '2px solid #ff660099' : 'none';
          el.style.filter  = (cancelled || hazardHit) ? 'brightness(0.4) saturate(0.2)' : 'brightness(1.1)';
          el.style.opacity = '1';
        } else { el.style.filter='brightness(0.38)'; el.style.opacity='0.5'; }
      });
      document.querySelectorAll('.score-hl').forEach(el=>el.remove());
      const gridEl = document.getElementById('grid');
      const ov = document.createElement('div');
      ov.className = 'score-hl';
      const m = _mobileDims();
      const gw = m ? (GRID_COLS*m.cw+(GRID_COLS-1)*m.gap) : (GRID_COLS*124+(GRID_COLS-1)*6);
      const ch_ = m ? m.ch : 152;
      const topY = m ? r*m.sh : r*CS_H;
      ov.style.cssText = `position:absolute;pointer-events:none;z-index:8;top:${topY}px;left:0;width:${gw}px;height:${ch_}px;border:3px solid ${_rowHlCol}cc;border-radius:6px;box-shadow:0 0 22px ${_rowHlCol}55,inset 0 0 10px ${_rowHlCol}11;`;
      gridEl.appendChild(ov);
    };
    const _clearRowHl = () => {
      document.querySelectorAll('.cell').forEach(el => { el.style.outline=''; el.style.filter=''; el.style.opacity=''; });
      document.querySelectorAll('.score-hl').forEach(el=>el.remove());
    };

    badge.addEventListener('mouseenter', () => { if (window.innerWidth > 480) { document.body.style.cursor='default'; _showRowHl(); _showScoreTip(badge,'row',r); } });
    badge.addEventListener('mouseleave', () => { if (window.innerWidth > 480) { _clearRowHl(); _hideScoreTip(); } });
    badge.addEventListener('click', () => {
      if (window.innerWidth > 480) return;
      if (_activeBadge === badge) { _activeBadge = null; _clearRowHl(); }
      else { if (_activeBadge) _clearRowHl(); _activeBadge = badge; _showRowHl(); }
    });


    rowEl.appendChild(badge);


  }





  // COL score badges — apply faction border color dynamically


  const colEl = document.getElementById('colScores');


  colEl.innerHTML = '';


  for (let c = 0; c < 7; c++) {


    const {p,a} = s.cols[c];


    const res = s.colResults[c];


    const badge = document.createElement('div');


    badge.className = 'col-score-badge'; badge.style.cursor = 'pointer';


    // WIN=player color top-border, LOSE=opponent color, TIE=grey


    const colWinCol  = res==='p' ? pCol : res==='a' ? aCol : '#333';


    const colBg      = res==='p' ? pCol+'08' : res==='a' ? aCol+'08' : (p===0&&a===0)?'#07070f':'#0d0c18';


    const colBorder  = res==='p' ? pCol+'55' : res==='a' ? aCol+'55' : (p===0&&a===0)?'#111120':'#221a33';


    badge.style.cssText = `background:${colBg};border:1px solid ${colBorder};border-top:3px solid ${colWinCol};`;


    badge.innerHTML = colBadgeHtml(p, a, res);


    const prevResC = _prevBadgeRes.cols[c];


    if (prevResC !== null && prevResC !== res && (res==='p'||res==='a') && (prevResC==='p'||prevResC==='a')) {


      badge.classList.add('badge-flip');


      setTimeout(() => badge.classList.remove('badge-flip'), 450);


    }


    _prevBadgeRes.cols[c] = res;


    const _colHlCol = res==='p' ? pCol : res==='a' ? aCol : '#ffffff';


    const _showColHl = () => {
      document.querySelectorAll('.cell').forEach(el => {
        const er = el.dataset.r;
        const ec = el.dataset.c;
        if (ec == c) {
          const cell = G.grid[er][ec];
          const bat  = cell?.card ? (cell.battle || {h:'none',v:'none'}) : null;
          const cancelled = bat && (bat.v === 'tie' || bat.v === 'lose');
          const hazardHit = cell?.card && cell.owner !== 'hazard' && [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
            .some(({dr,dc}) => { const rr=+er+dr,cc=+ec+dc; return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard'; });
          el.style.outline = cell?.owner === 'hazard' ? '2px solid #ff660099' : 'none';
          el.style.filter  = (cancelled || hazardHit) ? 'brightness(0.4) saturate(0.2)' : 'brightness(1.1)';
          el.style.opacity = '1';
        } else { el.style.filter='brightness(0.38)'; el.style.opacity='0.5'; }
      });
      document.querySelectorAll('.score-hl').forEach(el=>el.remove());
      const gridEl = document.getElementById('grid');
      const ov = document.createElement('div');
      ov.className = 'score-hl';
      const m = _mobileDims();
      const gh = m ? (GRID_ROWS*m.ch+(GRID_ROWS-1)*m.gap) : (GRID_ROWS*152+(GRID_ROWS-1)*6);
      const cw_ = m ? m.cw : 124;
      const leftX = m ? c*m.sw : c*CS_W;
      ov.style.cssText = `position:absolute;pointer-events:none;z-index:8;top:0;left:${leftX}px;width:${cw_}px;height:${gh}px;border:3px solid ${_colHlCol}cc;border-radius:6px;box-shadow:0 0 22px ${_colHlCol}55,inset 0 0 10px ${_colHlCol}11;`;
      gridEl.appendChild(ov);
    };
    const _clearColHl = () => {
      document.querySelectorAll('.cell').forEach(el => { el.style.outline=''; el.style.filter=''; el.style.opacity=''; });
      document.querySelectorAll('.score-hl').forEach(el=>el.remove());
    };

    badge.addEventListener('mouseenter', () => { if (window.innerWidth > 480) { document.body.style.cursor='default'; _showColHl(); _showScoreTip(badge,'col',c); } });
    badge.addEventListener('mouseleave', () => { if (window.innerWidth > 480) { _clearColHl(); _hideScoreTip(); } });
    badge.addEventListener('click', () => {
      if (window.innerWidth > 480) return;
      if (_activeBadge === badge) { _activeBadge = null; _clearColHl(); }
      else { if (_activeBadge) { document.querySelectorAll('.cell').forEach(el=>{el.style.outline='';el.style.filter='';el.style.opacity='';}); document.querySelectorAll('.score-hl').forEach(el=>el.remove()); } _activeBadge = badge; _showColHl(); }
    });


    colEl.appendChild(badge);


  }


}

function renderScoreHeader(_precomputed) {


  const s = _precomputed || computeScores();





  const tag = document.getElementById('turnTag');


  if (tag) {


    tag.textContent = G.turn==='player' ? 'YOUR TURN' : 'AI THINKING...';


    tag.className   = 'turn-tag ' + G.turn;


  }





  const q = document.getElementById('aiQuote');


  if (q) {


    if (s.aVP > s.pVP+2) q.textContent = '"Predictable. You are nothing."';


    else if (s.pVP > s.aVP+2) q.textContent = '"Impossible... recalculating."';


    else q.textContent = '"Your breach ends here."';


  }





  // ── Score HUD (bottom-right) — faction-colored ──────────────────


  const pCol = window.playerFactionColor || '#00ffcc';


  const aCol = window.aiFactionColor     || '#ff0080';


  const pAvg = window.playerAvatarImg    || '';


  const aAvg = window.aiAvatarImg        || '';


  const pNam = window.playerFactionName  || 'YOU';


  const aNam = window.aiFactionName      || 'AI';





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


  if (sbAiNum) { sbAiNum.textContent = s.aVP; sbAiNum.style.color = aLeading ? aCol : '#555566'; sbAiNum.style.textShadow = aLeading ? `0 0 12px ${aCol}` : 'none'; }


  if (sbAiName) { sbAiName.textContent = aNam; sbAiName.style.color = aLeading ? aCol : aCol + 'bb'; }


  if (sbAiLead) { sbAiLead.textContent = aLeading ? 'LEADS' : ''; sbAiLead.style.color = aCol; }


  if (fhAiEl) { fhAiEl.style.background = aLeading ? aCol + '18' : 'transparent'; fhAiEl.style.boxShadow = aLeading ? `0 0 0 1px ${aCol}44` : 'none'; }





  // Player faction row


  if (sbPAv) { sbPAv.src = pAvg; sbPAv.style.borderColor = pLeading ? pCol : '#2a2a3a'; sbPAv.style.boxShadow = pLeading ? `0 0 12px ${pCol}88` : 'none'; }


  if (sbPNum) { sbPNum.textContent = s.pVP; sbPNum.style.color = pLeading ? pCol : '#555566'; sbPNum.style.textShadow = pLeading ? `0 0 12px ${pCol}` : 'none'; }


  if (sbPName) { sbPName.textContent = pNam; sbPName.style.color = pLeading ? pCol : pCol + 'bb'; }


  if (sbPLead) { sbPLead.textContent = pLeading ? 'LEADS' : ''; sbPLead.style.color = pCol; }


  if (fhPEl) { fhPEl.style.background = pLeading ? pCol + '18' : 'transparent'; fhPEl.style.boxShadow = pLeading ? `0 0 0 1px ${pCol}44` : 'none'; }





  // HUD outer glow


  if (hud) hud.style.borderColor = pLeading ? pCol+'33' : aLeading ? aCol+'33' : '#1a1a28';


}
