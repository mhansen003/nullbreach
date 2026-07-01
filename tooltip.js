function showAbilityZone(ability, _baseR, _baseC, _owner) {
  if (_zoneSuppressed) return;
  let baseR = (_baseR !== undefined) ? _baseR : 4;
  let baseC = (_baseC !== undefined) ? _baseC : 3;
  if (_baseR === undefined) {
    outer: for (let r = 4; r >= 0; r--) {
      for (let c = 0; c < 7; c++) {
        if (G.grid[r][c].owner === 'player') { baseR = r; baseC = Math.min(Math.max(c,1),5); break outer; }
      }
    }
  }
  const _p2 = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
  const fwd = (_owner === 'ai') ? (_p2 ? 1 : -1) : (_p2 ? -1 : 1);

  // 3-layer zone definitions (dr uses player-perspective: -1 = toward enemy)
  // influence: yellow dotted  buff: blue solid  aggressive: red solid
  const ZONE3 = {
    commander:      { inf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], agg:[] },
    laser_focus:    { inf:[{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0}], buf:[], agg:[{dr:-1,dc:0}] },
    intimidate:     { inf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[], agg:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}] },
    flank:          { inf:[{dr:0,dc:0}], buf:[{dr:0,dc:0}], agg:[] },
    phantom:        { inf:[{dr:0,dc:0},{dr:-1,dc:0}], buf:[{dr:0,dc:0},{dr:-1,dc:0}], agg:[] },
    home_invader:   { inf:[{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0},{dr:-4,dc:0}], buf:[], agg:[{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0},{dr:-4,dc:0}] },
    fortify:        { inf:[{dr:-1,dc:0}], buf:[{dr:-1,dc:0}], agg:[] },
    shield:         { inf:[{dr:0,dc:0}], buf:[{dr:0,dc:0}], agg:[] },
    pierce:         { inf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[], agg:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}] },
    double_strike:  { inf:[{dr:-1,dc:0},{dr:-2,dc:0}], buf:[], agg:[{dr:-2,dc:0}] },
    cloak:          { inf:[{dr:0,dc:0}], buf:[{dr:0,dc:0}], agg:[] },
    deciding_factor:{ inf:[{dr:0,dc:0}], buf:[{dr:0,dc:0}], agg:[] },
    density:        { inf:[{dr:0,dc:0}], buf:[{dr:0,dc:0}], agg:[] },
    lamb:           { inf:[{dr:0,dc:0},{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[{dr:0,dc:0}], agg:[] },
    revenge:        { inf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[], agg:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}] },
    birthright:     { inf:[{dr:0,dc:0}], buf:[{dr:0,dc:0}], agg:[] },
    spawn:          { inf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], agg:[] },
    boost:          { inf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], buf:[{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}], agg:[] },
  };

  function mkLayer(el, type) {
    const ov = document.createElement('div');
    ov.setAttribute('data-az','1');
    const styles = {
      inf: 'border:2px dotted #ffdd0099;background:#ffdd0008;',
      buf: 'border:2px solid #4488ffcc;background:#4488ff22;box-shadow:inset 0 0 8px #4488ff22;',
      agg: 'border:2px solid #ff4444cc;background:#ff444422;box-shadow:inset 0 0 8px #ff333322;',
    };
    ov.style.cssText = 'position:absolute;inset:0;z-index:7;pointer-events:none;border-radius:3px;' + (styles[type] || styles.inf);
    el.appendChild(ov);
  }

  if (ability === 'rush') {
    document.querySelectorAll('.cell.valid').forEach(el => mkLayer(el, 'agg'));
    return;
  }

  // SNIPER (real mechanic): on placement it silences the highest-power card on
  // the opponent's home row (one-time, engine flag _silenced). Highlight that
  // home row; mark any already-silenced victim in red.
  if (ability === 'sniper') {
    const homeRow = (_owner === 'player') ? (_p2 ? 4 : 0) : (_p2 ? 0 : 4);
    for (let hc = 0; hc < 7; hc++) {
      const el = document.querySelector(`.cell[data-r="${homeRow}"][data-c="${hc}"]`);
      if (!el) continue;
      const tgt = G.grid[homeRow][hc];
      mkLayer(el, (tgt.card && tgt.card._silenced) ? 'agg' : 'inf');
    }
    return;
  }

  const zones = ZONE3[ability];
  if (!zones) return;

  // Track which cells already have a layer to avoid stacking same-type
  const layered = new Map();
  const applyLayer = (offsets, type) => {
    offsets.forEach(({dr, dc}) => {
      const r = baseR + (dr * fwd), c = baseC + dc;
      if (r < 0 || r >= 5 || c < 0 || c >= 7) return;
      const el = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      if (!el) return;
      const key = `${r},${c},${type}`;
      if (!layered.has(key)) { mkLayer(el, type); layered.set(key, 1); }
    });
  };

  applyLayer(zones.inf, 'inf');
  applyLayer(zones.buf, 'buf');
  applyLayer(zones.agg, 'agg');
}

let _zoneSuppressed = false;

function clearAbilityZone() {
  document.querySelectorAll('[data-az]').forEach(el => el.remove());
}

// Show card's zone property (placement territory influence) as dotted overlays.
// owner: 'player' (yellow) or 'ai' (red). cardR/cardC: exact board position if known.
function showCardZoneInfluence(card, cardR, cardC, owner) {
  if (_zoneSuppressed) return;
  const _p2mp = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
  const _owner = owner || 'player';
  // fwd: zone dr=-1 means "toward enemy". player attacks toward row 0 (+1 keeps dr=-1 = up).
  // AI attacks toward row 4, so fwd=-1 flips dr=-1 to +1 (downward).
  const fwd = _owner === 'ai'
    ? (_p2mp ? 1 : -1)
    : (_p2mp ? -1 : 1);
  let baseR, baseC;
  if (cardR !== undefined && cardC !== undefined) {
    baseR = cardR; baseC = cardC;
  } else {
    baseR = _p2mp ? 0 : 4; baseC = 3;
    if (_p2mp) {
      outer: for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
          if (G.grid[r][c].owner === 'player' && G.grid[r][c].card) { baseR = r; baseC = Math.min(Math.max(c,1),5); break outer; }
        }
      }
    } else {
      outer: for (let r = 4; r >= 0; r--) {
        for (let c = 0; c < 7; c++) {
          if (G.grid[r][c].owner === 'player' && G.grid[r][c].card) { baseR = r; baseC = Math.min(Math.max(c,1),5); break outer; }
        }
      }
    }
  }
  const col = _owner === 'ai' ? { border: '#ff4444cc', bg: '#ff222222' } : { border: '#ffdd00cc', bg: '#ffdd0022' };
  const offsets = (typeof ZONES !== 'undefined' && ZONES[card.zone || 'wide_cross']) || [];
  const seen = new Set();
  offsets.forEach(({dr, dc}) => {
    const r = baseR + (dr * fwd), c = baseC + dc;
    if (r < 0 || r >= 5 || c < 0 || c >= 7) return;
    const el = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!el) return;
    const key = `${r},${c}`;
    if (seen.has(key)) return;
    seen.add(key);
    const ov = document.createElement('div');
    ov.setAttribute('data-az', '1');
    ov.style.cssText = `position:absolute;inset:0;z-index:7;pointer-events:none;border-radius:3px;border:2px dotted ${col.border};background:${col.bg};`;
    el.appendChild(ov);
  });
}

function suppressZone(ms) {
  _zoneSuppressed = true;
  clearTimeout(window._zoneTimer);
  window._zoneTimer = setTimeout(() => { _zoneSuppressed = false; }, ms || 400);
}

function buildAbilityVisual(ability) {
  const YOU  = '#0a1c16', YB = '#00ffcc', EC = '#1c0808', EB = '#ff4466';
  const ALLY = '#071510', AB = '#00ffcc44', EMP = '#080812', DB = '#1a1a28';
  const ZER  = '#111', ZB = '#444', BON = '#0a0a1c', BB = '#ffffff';
  function cell(bg, border, txt, dashed, op, badgeTxt, badgeCol) {
    const ds = dashed ? 'dashed' : 'solid';
    const opacity = op ? 'opacity:'+op+';' : '';
    let badge = '';
    if (badgeTxt) {
      badge = `<span style="position:absolute;top:-6px;right:-6px;width:13px;height:13px;border-radius:50%;background:#000;border:1px solid ${badgeCol};display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:${badgeCol};">${badgeTxt}</span>`;
    }
    return `<div style="width:26px;height:20px;border-radius:2px;background:${bg};border:2px ${ds} ${border};${opacity}position:relative;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:${border};">${txt}${badge}</div>`;
  }
  const e = (txt,op)       => cell(EC,EB,txt||'E',false,op||'');
  const y = (txt)           => cell(YOU,YB,txt||'★',false,'','','');
  const a = (txt,op)        => cell(ALLY,AB,txt||'A',false,op||'');
  const empty = ()           => cell(EMP,DB,'',true,'');
  const zero  = (txt)        => cell(ZER,ZB,txt||'0',true,'');
  const hit   = (txt)        => cell(EC,EB,txt||'E',true,'0.6');
  const bonus = (txt)        => cell(BON,BB,txt||'',false,'');

  const G = (cells) => `<div style="display:grid;grid-template-columns:repeat(3,26px);gap:2px;">${cells.join('')}</div>`;
  const G5= (cells) => `<div style="display:grid;grid-template-columns:repeat(5,22px);gap:2px;">${cells.join('')}</div>`;

  const patterns = {
    shield:         G([empty(),e(),empty(), empty(),y('🛡'),empty(), empty(),empty(),empty()]),
    double_strike:  `<div style="display:flex;flex-direction:column;gap:4px;"><div style="display:flex;align-items:center;gap:6px;">${y()}<span style="color:#ffdd00;font-size:11px;">→</span>${e('E1')}<span style="color:#ffdd00;font-size:11px;">→</span>${hit('E2')}</div><div style="display:flex;align-items:center;gap:6px;">${y()}<span style="color:#ffdd00;font-size:11px;">↑</span>${e('E1')}<span style="color:#ffdd00;font-size:11px;">↑</span>${hit('E2')}</div></div>`,
    flank:          `<div style="display:flex;align-items:center;gap:8px;">${y('★')}<span style="color:#00ffcc;font-size:14px;">→</span><div style="font-size:10px;color:#00ffcc;font-weight:600;">EXTRA TURN</div></div>`,
    rush:           G([empty(),e(),empty(), cell(YOU,YB,'★?',true,'0.7'),empty(),e(), empty(),empty(),cell(YOU,YB,'★?',true,'0.7')]),
    sniper:         `<div style="display:flex;align-items:center;gap:6px;">${y('★')}<span style="color:#ff8800;font-size:10px;">PLACE</span><span style="color:#ff8800;font-size:13px;">→</span>${hit('🎯')}<span style="color:#ff8800;font-size:9px;font-weight:700;line-height:1.3;">SILENCES top enemy<br>home-row card — 0 VP</span></div>`,
    fortify:        G([empty(),`<div style="width:24px;height:20px;border-radius:2px;background:#001830;border:2px dashed #4488ff88;display:flex;align-items:center;justify-content:center;font-size:8px;color:#4488ff;">🔒</div>`,empty(),
                       empty(),
                       `<div style="width:24px;height:20px;border-radius:2px;background:#0a2040;border:3px solid #4488ff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#4488ff;">★</div>`,
                       empty(),
                       empty(),empty(),empty()]),
    revenge:        G([empty(),e('↩−1'),empty(), e('↩−1'),y('★'),e('↩−1'), empty(),e('↩−1'),empty()]),
    laser_focus:    `<div style="display:flex;align-items:center;gap:8px;"><div style="color:#aaa;font-size:10px;">ALL SIDES</div><span style="color:#ff4400;font-size:14px;">→</span><div style="color:#ff4400;font-size:12px;font-weight:700;">FACING only</div></div>`,
    deciding_factor:`<div style="display:flex;align-items:center;gap:8px;"><div style="color:#aaa;font-size:13px;font-weight:600;">3=3</div><span style="color:#00ffcc;font-size:14px;">→</span><div style="color:#00ffcc;font-size:12px;font-weight:700;">WIN</div></div>`,
    home_invader:   G([e('?'),y('↑★'),e('?'), empty(),empty(),empty(), empty(),empty(),empty()]),
    birthright:     `<div style="display:flex;align-items:center;gap:6px;">${y('★')}<span style="color:#00ffcc;font-size:12px;">PLACE</span><span style="color:#ffaaff;font-size:14px;">→</span>${bonus('T2')}</div>`,
    boost:          G([empty(),cell(ALLY,AB,'A',false,'','+',YB),empty(), cell(ALLY,AB,'A',false,'','+',YB),y('★'),cell(ALLY,AB,'A',false,'','+',YB), empty(),cell(ALLY,AB,'A',false,'','+',YB),empty()]),
    commander:      G([empty(),cell(ALLY,AB,'T2',false,'','+2',YB),empty(), a('T1','0.3'),y('★'),cell(ALLY,AB,'T2',false,'','+2',YB), empty(),empty(),empty()]),
    lamb:           `<div style="display:flex;align-items:center;gap:8px;">${y('5')}<span style="color:#ffdd00;font-size:11px;">0 battle values</span><span style="color:#ffdd00;font-size:12px;font-weight:700;">5 VP safe</span></div>`,
    density:        `<div style="display:flex;align-items:center;gap:8px;">${y('4')}<span style="color:#00ffcc;font-size:14px;">→</span><div style="font-size:18px;font-weight:700;color:#00ffcc;">6 <span style="font-size:9px;color:#bbb;">VP</span></div></div>`,
    cloak:          G([empty(),empty(),empty(), e(),cell(YOU,YB,'????',false,''),empty(), empty(),empty(),empty()]),
    phantom:        G([empty(),empty(),empty(), cell(YOU,YB,'★?',true,'0.7'),cell(YOU,YB,'★?',true,'0.7'),cell(YOU,YB,'★?',true,'0.7'), a('','0.3'),a('','0.3'),a('','0.3')]),
    pierce:         `<div style="display:flex;align-items:center;gap:8px;"><div style="color:#fff;font-size:14px;font-weight:700;">6 vs 6</div><span style="color:#00ffcc;font-size:14px;">→</span><div style="color:#00ffcc;font-size:12px;font-weight:700;">WIN</div></div>`,
  };
  return patterns[ability] || '';
}

function buildZoneGrid(card) {

  // Build a 5-row × 6-col mini-grid showing which cells this card unlocks

  const ROWS = 5, COLS = 7;

  // For P2: home is row 0 (appears at visual bottom), zone expands toward row 4
  const _p2zone = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
  const cardR = _p2zone ? 0 : ROWS - 1; // P2 home = row 0, P1 home = row 4

  const cardC = Math.floor(COLS / 2); // place in middle column for illustration

  const fwd = _p2zone ? -1 : 1; // P2: dr=-1 flips to +1 (expand toward row 4)

  const zoneKey = card.zone || 'wide_cross';

  const zoneOffsets = ZONES[zoneKey] || ZONES.wide_cross;

  const zoneCells = new Set();

  for (const {dr, dc} of zoneOffsets) {

    const nr = cardR + dr * fwd, nc = cardC + dc;

    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) zoneCells.add(`${nr},${nc}`);

  }

  const tierCol = TIER_COLORS[card.tier] || '#888';

  let html = `<div>

    <div style="display:grid;grid-template-columns:repeat(${COLS},14px);gap:2px;">`;

  for (let r = 0; r < ROWS; r++) {

    for (let c = 0; c < COLS; c++) {

      let bg, border;

      if (r === cardR && c === cardC) {

        bg = tierCol; border = 'none'; // card position

      } else if (zoneCells.has(`${r},${c}`)) {

        bg = '#ffdd0055'; border = '1px solid #ffdd00'; // zone cells

      } else {

        bg = '#0e0c18'; border = '1px solid #1a1428'; // empty

      }

      html += `<div style="width:14px;height:14px;border-radius:2px;background:${bg};border:${border};"></div>`;

    }

  }

  html += `</div></div>`;

  return html;

}

function showTip(e, card) {

  const tt      = document.getElementById('tooltip');

  const tierCol = '#ffffff';

  const abi      = card.ability ? (ABILITY_ICONS[card.ability] || {icon:'✦', color:tierCol, label:card.ability.toUpperCase()}) : null;

  const mod     = card.edgeMod;

  const tierNum = {'I':1,'II':2,'III':3,'IV':4}[card.tier] || 1;

  tt.style.setProperty('--tc',     tierCol);

  tt.style.setProperty('--tc-dim', tierCol + '55');

  tt.style.setProperty('--tc-glow',tierCol + '18');

  // Locate this card on the grid FIRST (needed for cloak owner check below).
  // Identity match preferred; id match keeps this working for spread copies.

  let _cardPos = null;

  if (typeof G !== 'undefined' && G.grid) {

    outer: for (let _r = 0; _r < 5; _r++)

      for (let _c = 0; _c < 7; _c++) {

        const _gc = G.grid[_r][_c].card;

        if (_gc && (_gc === card || (card.id && _gc.id === card.id))) { _cardPos = {r:_r, c:_c, own:G.grid[_r][_c].owner}; break outer; }

      }

  }

  // CLOAK: per-edge hiding, and ONLY for the opponent's cloak card.
  // The owner (local player) always sees their own card's true values —
  // hand cards and player-owned board cards are never masked.
  const _hideEdge = (edge) =>
    card.ability === 'cloak' && _cardPos && _cardPos.own === 'ai' &&
    !(card.cloakRevealed && card.cloakRevealed[edge]);

  const _edgeVal = (base, modVal) => {
    const eff = base + (modVal || 0);
    if (card.ability === 'laser_focus' && mod && eff <= 0) return '—';
    return eff;
  };
  const n  = _hideEdge('n') ? '?' : _edgeVal(card.edges.n, mod?.n);
  const s  = _hideEdge('s') ? '?' : _edgeVal(card.edges.s, mod?.s);
  const e_ = _hideEdge('e') ? '?' : _edgeVal(card.edges.e, mod?.e);
  const w  = _hideEdge('w') ? '?' : _edgeVal(card.edges.w, mod?.w);

  // Per-direction battle result badges — engine-consistent semantics:
  // pierce wins ties (one-sided), pure tie = no effect ('T'), symmetric
  // aggressive AI buff on all AI edges (battle.js gzEffEdge/gzAiBuffMult).

  const _dir = {n:null, s:null, e:null, w:null};

  if (_cardPos) {

    const {r:_r, c:_c, own:_own} = _cardPos;

    const _emy = _own === 'player' ? 'ai' : 'player';

    const _eff = (cd, owner, edge) => (typeof gzEffEdge === 'function')
      ? gzEffEdge(cd, owner, edge)
      : Math.round((cd.edges[edge] + (cd.edgeMod?.[edge]||0)) *
          ((window.aiDifficulty === 'aggressive' && owner === 'ai') ? 1.1 : 1));

    const _cmp = (my, their, myP, theirP) =>
      my > their ? 'W' : my < their ? 'L'
      : (myP && !theirP) ? 'W' : (theirP && !myP) ? 'L' : 'T';

    const _em  = (rr,cc) => G.grid[rr] && G.grid[rr][cc] && G.grid[rr][cc].owner === _emy && G.grid[rr][cc].card ? G.grid[rr][cc].card : null;

    const _myP = card.ability === 'pierce';

    const _nN = _em(_r-1,_c), _nS = _em(_r+1,_c), _nW = _em(_r,_c-1), _nE = _em(_r,_c+1);

    if (_nN) _dir.n = _cmp(_eff(card,_own,'n'), _eff(_nN,_emy,'s'), _myP, _nN.ability==='pierce');

    if (_nS) _dir.s = _cmp(_eff(card,_own,'s'), _eff(_nS,_emy,'n'), _myP, _nS.ability==='pierce');

    if (_nW) _dir.w = _cmp(_eff(card,_own,'w'), _eff(_nW,_emy,'e'), _myP, _nW.ability==='pierce');

    if (_nE) _dir.e = _cmp(_eff(card,_own,'e'), _eff(_nE,_emy,'w'), _myP, _nE.ability==='pierce');

    // Never leak a cloaked edge's outcome to the opponent
    ['n','s','e','w'].forEach(edge => { if (_hideEdge(edge)) _dir[edge] = null; });

  }

  function _badge(res) {

    if (!res) return '';

    const bc = res==='W'?'#00ffcc':res==='L'?'#ff4444':'#888888';

    const label = res==='W'?'WIN':res==='L'?'LOSE':'TIE';

    return `<div style="font-family:'Orbitron',monospace;font-size:8px;font-weight:700;letter-spacing:1px;color:${bc};background:${bc}22;border:1px solid ${bc}99;border-radius:3px;padding:1px 5px;margin-top:2px;text-shadow:0 0 6px ${bc};">${label}</div>`;

  }

  const _edgeCol = (res, col) => res==='W' ? col : res==='L' ? col+'44' : col+'99';

  const bat  = card._bat || { h:'none', v:'none' };

  const nCol = _dir.n ? _edgeCol(_dir.n, tierCol) : (bat.v==='win' ? tierCol : bat.v==='lose' ? tierCol+'44' : tierCol+'cc');

  const sCol = _dir.s ? _edgeCol(_dir.s, tierCol) : (bat.v==='win' ? tierCol : bat.v==='lose' ? tierCol+'44' : tierCol+'cc');

  const wCol = _dir.w ? _edgeCol(_dir.w, tierCol) : (bat.h==='win' ? tierCol : bat.h==='lose' ? tierCol+'44' : tierCol+'cc');

  const eCol = _dir.e ? _edgeCol(_dir.e, tierCol) : (bat.h==='win' ? tierCol : bat.h==='lose' ? tierCol+'44' : tierCol+'cc');

  const nGlow = (_dir.n==='W' || bat.v==='win') ? `text-shadow:0 0 8px ${tierCol};` : '';

  const wGlow = (_dir.w==='W' || bat.h==='win') ? `text-shadow:0 0 8px ${tierCol};` : '';

  tt.innerHTML = `

  <div class="tip-shine-layer"></div>

  <div class="tip-body">

    <!-- Header: card art + name/VP/tier -->
    <div style="display:flex;gap:12px;padding:12px 14px 10px;border-bottom:1px solid #ffffff10;">
      ${card.art ? `
      <div style="position:relative;flex-shrink:0;width:80px;height:104px;">
        <img src="${typeof gzCardArt === 'function' ? gzCardArt(card.art) : card.art}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:top;border-radius:6px;border:1px solid var(--tc-dim);">
        <div style="position:absolute;inset:0;border-radius:6px;overflow:hidden;pointer-events:none;">
          <div style="position:absolute;width:100%;height:35%;background:linear-gradient(transparent,var(--tc-glow),transparent);animation:tipScan 3.5s ease-in-out infinite;"></div>
        </div>
      </div>` : ''}
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;min-width:0;padding:2px 0;gap:6px;">
        <!-- Name -->
        <div style="font-family:'Orbitron',monospace;color:#fff;font-size:12px;letter-spacing:1px;font-weight:700;line-height:1.3;">${card.name}</div>
        <!-- VP + Tier on same row -->
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="display:flex;align-items:baseline;gap:4px;">
            <span style="font-size:28px;font-weight:bold;color:var(--tc);line-height:1;text-shadow:0 0 10px var(--tc);">${card.power}</span>
            <span style="font-size:10px;color:#bbb;letter-spacing:2px;">VP</span>
          </div>
          <div style="width:1px;height:18px;background:#ffffff14;flex-shrink:0;"></div>
          <div style="display:flex;align-items:center;gap:3px;">
            <span style="font-size:8px;color:#aaa;letter-spacing:2px;">T</span>
            ${Array.from({length:tierNum},()=>`<div style="width:9px;height:9px;border-radius:50%;background:${tierCol};box-shadow:0 0 4px ${tierCol};"></div>`).join('')}
            ${Array.from({length:4-tierNum},()=>`<div style="width:9px;height:9px;border-radius:50%;border:1px solid #222230;"></div>`).join('')}
          </div>
        </div>
      </div>

    </div>

    <div style="display:flex;padding:8px 12px;gap:8px;border-bottom:1px solid #ffffff10;">

      <div style="flex:1;">

        <div style="font-size:9px;letter-spacing:2px;color:#bbb;margin-bottom:4px;">BATTLE POWER</div>

        <div style="position:relative;width:96px;height:96px;border:1px solid var(--tc-dim);border-radius:5px;background:#030310;">

          <div style="position:absolute;top:3px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;">



            <div style="font-size:18px;font-weight:bold;${nGlow}color:${nCol};line-height:1;">${n}</div>

            ${_badge(_dir.n)}

          </div>

          <div style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;">

            ${_badge(_dir.s)}

            <div style="font-size:18px;font-weight:bold;color:${sCol};line-height:1;">${s}</div>



          </div>

          <div style="position:absolute;left:3px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;min-width:22px;">



            <div style="font-size:18px;font-weight:bold;${wGlow}color:${wCol};line-height:1;">${w}</div>

            ${_badge(_dir.w)}

          </div>

          <div style="position:absolute;right:3px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;min-width:22px;">



            <div style="font-size:18px;font-weight:bold;${wGlow}color:${eCol};line-height:1;">${e_}</div>

            ${_badge(_dir.e)}

          </div>

          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:var(--tc-dim);"></div>

        </div>

      </div>

      <div style="width:1px;background:#ffffff10;flex-shrink:0;"></div>

      <div style="flex:1;">

        <div style="font-size:9px;letter-spacing:2px;color:#bbb;margin-bottom:4px;">INFLUENCE</div>

        ${card.zone ? buildZoneGrid(card) : `<div style="font-size:9px;color:#2a2a3a;">&#x2014;</div>`}

      </div>

    </div>

    <div style="padding:8px 12px 10px;">

      ${abi ? `
      <div style="border:1px solid #ffffff14;border-radius:6px;padding:10px;background:#ffffff06;">
        <!-- Header: SVG ability icon + name -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:38px;height:38px;border-radius:7px;background:rgba(10,8,24,0.72);border:1px solid #ffffff1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:abilityPulse 2.5s ease-in-out infinite;">${typeof _getAbilitySvg === 'function' ? _getAbilitySvg(card.ability) : ''}</div>
          <div style="font-family:'Orbitron',monospace;font-size:11px;letter-spacing:1px;color:#fff;font-weight:700;line-height:1.2;">${card.abilityLabel || abi.label}</div>
        </div>
        <!-- Description + zone visual side by side -->
        <div style="font-size:11px;color:#ddd;line-height:1.6;margin-bottom:${buildAbilityVisual(card.ability)?'8px':'0'};">${card.abilityText}</div>
        ${buildAbilityVisual(card.ability) ? `<div style="margin-top:2px;">${buildAbilityVisual(card.ability)}</div>` : ''}
      </div>` : `
      <div style="font-size:10px;color:#444;letter-spacing:1px;font-style:italic;">No special ability</div>`}

    </div>

  </div>`;

  tt.style.display = 'block';

  // Right side, vertically centered

  const ttH = tt.offsetHeight || 360;
  tt.style.width  = '320px';
  tt.style.right  = '16px';
  tt.style.left   = 'auto';
  tt.style.bottom = '16px';

  tt.style.top    = 'auto';

}

function showErrorTip(e, reason) {

  hideTip();

  const et = document.getElementById('errorTip');

  et.innerHTML = `

    <div style="display:flex;align-items:center;gap:8px;padding:8px 12px 6px;border-bottom:1px solid #ff333322;">

      <span style="font-size:15px;filter:drop-shadow(0 0 5px #ff3333);">✗</span>

      <span style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#ff6666;font-weight:700;">INVALID PLACEMENT</span>

    </div>

    <div style="padding:8px 12px 10px;font-size:12px;color:#ffbbbb;letter-spacing:0.5px;line-height:1.7;">${reason}</div>`;

  et.style.display = 'block';

  const etH = et.offsetHeight || 60;

  const etW = et.offsetWidth  || 220;

  const spaceBelow = window.innerHeight - e.clientY;

  const top  = spaceBelow > etH + 20 ? e.clientY + 14 : e.clientY - etH - 14;

  const left = e.clientX + etW + 20 > window.innerWidth ? e.clientX - etW - 14 : e.clientX + 14;

  et.style.top  = Math.max(8, top)  + 'px';

  et.style.left = Math.max(8, left) + 'px';

}

function hideTip() {

  const _tt = document.getElementById('tooltip');

  if (_tt) _tt.style.display = 'none';

  const _et = document.getElementById('errorTip');

  if (_et) _et.style.display = 'none';

}

// Mobile: tap anywhere dismisses open tooltip

document.addEventListener('touchstart', () => hideTip(), { passive: true });
