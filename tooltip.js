function showAbilityZone(ability, _baseR, _baseC, _owner) {
  if (_zoneSuppressed) return;
  // Zone color: green=passive/buff, red=offensive
  const _passiveAbils = new Set(['shield','boost','commander','phantom','cloak','spawn','fortify','birthright','deciding_factor','lamb','density']);
  const abilCol = _passiveAbils.has(ability) ? '#44ff88' : (_owner==='ai' ? '#ff2244' : '#ff5533');
  // Use explicit position from placed card, or guess from nearest player card
  let baseR = (_baseR !== undefined) ? _baseR : 4;
  let baseC = (_baseC !== undefined) ? _baseC : 3;
  if (_baseR === undefined) {
    outer: for (let r = 4; r >= 0; r--) {
      for (let c = 0; c < 7; c++) {
        if (G.grid[r][c].owner === 'player') { baseR = r; baseC = Math.min(Math.max(c,1),5); break outer; }
      }
    }
  }
  const PATTERNS = {
    boost:          [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    commander:      [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    spawn:          [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    ambush:         [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    intimidate:     [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    fortify:        [{dr:0,dc:0},{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    revenge:        [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    laser_focus:    [{dr:-1,dc:0},{dr:-2,dc:0}],
    double_strike:  [{dr:-1,dc:0},{dr:-2,dc:0}],
    sniper:         [{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0},{dr:-4,dc:0}],
    lamb:           [{dr:0,dc:0}],
    overwhelm:      [{dr:-1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}],
    density:        [{dr:0,dc:0}],
    phantom:        [{dr:0,dc:0},{dr:-1,dc:0}],
    deciding_factor:[{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0},{dr:-4,dc:0}],
    cloak:          [{dr:0,dc:0}],
    home_invader:   [{dr:-1,dc:0},{dr:-2,dc:0},{dr:-3,dc:0},{dr:-4,dc:0}],
  };

  function mkOverlay(el) {
    const ov = document.createElement('div');
    ov.setAttribute('data-az','1');
    ov.style.cssText = 'position:absolute;inset:0;z-index:7;pointer-events:none;border-radius:3px;'
      + 'background:' + abilCol + '33;border:2px solid ' + abilCol + 'cc;'
      + 'box-shadow:inset 0 0 8px ' + abilCol + '22;';
    el.appendChild(ov);
  }

  if (ability === 'rush') {
    document.querySelectorAll('.cell.valid').forEach(mkOverlay);
    return;
  }
  if (ability === 'edge_play') {
    [0,6].forEach(c => {
      for (let r=0;r<5;r++) { const el=document.querySelector('.cell[data-r="'+r+'"][data-c="'+c+'"]'); if(el) mkOverlay(el); }
    });
    return;
  }

  const pattern = PATTERNS[ability];
  if (!pattern) return;
  pattern.forEach(({dr,dc}) => {
    const fwd = (_owner==='ai') ? -1 : 1;
    const r = baseR+(dr*fwd), c = baseC+dc;
    if (r<0||r>=5||c<0||c>=7) return;
    const el = document.querySelector('.cell[data-r="'+r+'"][data-c="'+c+'"]');
    if (el) mkOverlay(el);
  });
}

let _zoneSuppressed = false;

function clearAbilityZone() {
  document.querySelectorAll('[data-az]').forEach(el => el.remove());
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
    double_strike:  G([empty(),hit('E2'),empty(), empty(),e('E1'),empty(), empty(),y(),empty()]),
    flank:          `<div style="display:flex;align-items:center;gap:8px;">${y('★')}<span style="color:#00ffcc;font-size:14px;">→</span><div style="font-size:10px;color:#00ffcc;font-weight:600;">EXTRA TURN</div></div>`,
    rush:           G([empty(),e(),empty(), cell(YOU,YB,'★?',true,'0.7'),empty(),e(), empty(),empty(),cell(YOU,YB,'★?',true,'0.7')]),
    sniper:         G([zero('0'),empty(),empty(), empty(),empty(),empty(), y('★'),empty(),empty()]),
    ambush:         G([empty(),cell(EC,EB,'E',false,'','-1',EB),empty(), cell(EC,EB,'E',false,'','-1',EB),y('★'),e(), empty(),e(),empty()]),
    fortify:        G([empty(),`<div style="width:24px;height:20px;border-radius:2px;background:#001830;border:2px dashed #4488ff88;display:flex;align-items:center;justify-content:center;font-size:8px;color:#4488ff;">🔒</div>`,empty(),
                       `<div style="width:24px;height:20px;border-radius:2px;background:#001830;border:2px dashed #4488ff88;display:flex;align-items:center;justify-content:center;font-size:8px;color:#4488ff;">🔒</div>`,
                       `<div style="width:24px;height:20px;border-radius:2px;background:#0a2040;border:3px solid #4488ff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#4488ff;">★</div>`,
                       `<div style="width:24px;height:20px;border-radius:2px;background:#001830;border:2px dashed #4488ff88;display:flex;align-items:center;justify-content:center;font-size:8px;color:#4488ff;">🔒</div>`,
                       empty(),`<div style="width:24px;height:20px;border-radius:2px;background:#001830;border:2px dashed #4488ff88;display:flex;align-items:center;justify-content:center;font-size:8px;color:#4488ff;">🔒</div>`,empty()]),
    revenge:        G([empty(),empty(),empty(), e(),y('↩'),empty(), empty(),empty(),empty()]),
    laser_focus:    `<div style="display:flex;align-items:center;gap:8px;"><div style="color:#aaa;font-size:10px;">N+S+E+W</div><span style="color:#ff4400;font-size:14px;">→</span><div style="color:#ff4400;font-size:12px;font-weight:700;">N only</div></div>`,
    deciding_factor:`<div style="display:flex;align-items:center;gap:8px;"><div style="color:#aaa;font-size:13px;font-weight:600;">3=3</div><span style="color:#00ffcc;font-size:14px;">→</span><div style="color:#00ffcc;font-size:12px;font-weight:700;">WIN</div></div>`,
    home_invader:   G([empty(),y('★'),empty(), empty(),empty(),empty(), empty(),empty(),empty()]),
    edge_play:      G5([y('★'),empty(),empty(),empty(),e()]),
    birthright:     `<div style="display:flex;align-items:center;gap:6px;">${y('★')}<span style="color:#00ffcc;font-size:12px;">PLACE</span><span style="color:#ffaaff;font-size:14px;">→</span>${bonus('T2')}</div>`,
    boost:          G([empty(),cell(ALLY,AB,'A',false,'','+',YB),empty(), cell(ALLY,AB,'A',false,'','+',YB),y('★'),cell(ALLY,AB,'A',false,'','+',YB), empty(),cell(ALLY,AB,'A',false,'','+',YB),empty()]),
    commander:      G([empty(),cell(ALLY,AB,'T2',false,'','+2',YB),empty(), a('T1','0.3'),y('★'),cell(ALLY,AB,'T2',false,'','+2',YB), empty(),empty(),empty()]),
    surge:          `<div style="display:flex;align-items:center;gap:8px;"><div style="color:#ff4466;font-size:11px;">Losing</div><span style="color:#00ffcc;font-size:14px;">→</span>${y('+3')}</div>`,
    overwhelm:      G([empty(),cell(ALLY,YB,'E↑',false,'','✓',YB),empty(), e('E←'),y('★'),empty(), empty(),empty(),empty()]),
    lamb:           `<div style="display:flex;align-items:center;gap:8px;">${y('5')}<span style="color:#ffdd00;font-size:11px;">0 edges</span><span style="color:#ffdd00;font-size:12px;font-weight:700;">5 VP safe</span></div>`,
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


  const cardR = ROWS - 1; // player home row (bottom)


  const cardC = Math.floor(COLS / 2); // place in middle column for illustration


  const fwd = 1; // dr=-1 means "one row up/forward" for player, multiply by 1 to preserve direction





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


  html += `</div>


    <div style="display:flex;gap:10px;margin-top:5px;">


      <span style="font-size:9px;color:#ccc;">■ <span style="color:${tierCol}">this card</span></span>


      <span style="font-size:9px;color:#ccc;">■ <span style="color:#ffdd00">opens for next card</span></span>


    </div>


  </div>`;


  return html;


}

// Delayed tooltip for hand cards (2.5s) — instant for board


let _tipTimer = null;

function showTipDelayed(e, card) {


  clearTimeout(_tipTimer);


  _tipTimer = setTimeout(() => showTip(e, card), 2500);


}

function cancelTipDelay() {


  clearTimeout(_tipTimer);


  hideTip();


}

function showTip(e, card) {


  const tt      = document.getElementById('tooltip');


  const tierCol = TIER_COLORS[card.tier] || '#888';


  const abi      = card.ability ? (ABILITY_ICONS[card.ability] || {icon:'✦', color:tierCol, label:card.ability.toUpperCase()}) : null;


  const _iconSrc = card.raceId && card.ability ? `assets/abilities/${card.raceId}_${card.ability}.png` : '';


  const mod     = card.edgeMod;


  const _isCloaked = card.ability === 'cloak' && !card.cloakRevealed;
  const n  = _isCloaked ? '?' : card.edges.n + (mod?.n||0), s  = _isCloaked ? '?' : card.edges.s + (mod?.s||0);
  const e_ = _isCloaked ? '?' : card.edges.e + (mod?.e||0), w  = _isCloaked ? '?' : card.edges.w + (mod?.w||0);


  const tierNum = {'I':1,'II':2,'III':3,'IV':4}[card.tier] || 1;





  tt.style.setProperty('--tc',     tierCol);


  tt.style.setProperty('--tc-dim', tierCol + '55');


  tt.style.setProperty('--tc-glow',tierCol + '18');





  // Per-direction battle result — scan grid to find this card's position


  let _cardPos = null;


  if (typeof G !== 'undefined' && G.grid) {


    outer: for (let _r = 0; _r < 5; _r++)


      for (let _c = 0; _c < 7; _c++)


        if (G.grid[_r][_c].card === card) { _cardPos = {r:_r, c:_c, own:G.grid[_r][_c].owner}; break outer; }


  }


  const _dir = {n:null, s:null, e:null, w:null};


  if (_cardPos) {


    const {r:_r, c:_c, own:_own} = _cardPos;


    const _emy = _own === 'player' ? 'ai' : 'player';


    const _cmp = (my, their) => my > their ? 'W' : my < their ? 'L' : 'T';


    const _em  = (rr,cc) => G.grid[rr] && G.grid[rr][cc] && G.grid[rr][cc].owner === _emy && G.grid[rr][cc].owner !== 'hazard' && G.grid[rr][cc].card ? G.grid[rr][cc].card : null;


    const _ev  = (c, edge) => c.edges[edge] + (c.edgeMod?.[edge]||0);


    if (_em(_r-1,_c)) _dir.n = _cmp(n,    _ev(_em(_r-1,_c),'s'));


    if (_em(_r+1,_c)) _dir.s = _cmp(s,    _ev(_em(_r+1,_c),'n'));


    if (_em(_r,_c-1)) _dir.w = _cmp(w,    _ev(_em(_r,_c-1),'e'));


    if (_em(_r,_c+1)) _dir.e = _cmp(e_,   _ev(_em(_r,_c+1),'w'));


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





    <!-- Compact: image + title/VP/tier | compass | zone | ability -->


    <div style="display:flex;gap:10px;padding:10px 12px 8px;border-bottom:1px solid var(--tc-dim);">


      ${card.art ? `


      <div style="position:relative;flex-shrink:0;width:72px;height:94px;">


        <img src="${card.art}" style="width:100%;height:100%;object-fit:cover;object-position:top;border-radius:5px;border:1px solid var(--tc-dim);">


        <div style="position:absolute;inset:0;border-radius:5px;overflow:hidden;pointer-events:none;">


          <div style="position:absolute;width:100%;height:35%;background:linear-gradient(transparent,var(--tc-glow),transparent);animation:tipScan 3.5s ease-in-out infinite;"></div>


        </div>


      </div>` : ''}


      <div style="flex:1;display:flex;flex-direction:column;gap:5px;min-width:0;">


        <div style="font-family:'Orbitron',monospace;color:var(--tc);font-size:11px;letter-spacing:1px;font-weight:700;line-height:1.2;">${card.name}</div>


        <div style="display:flex;align-items:center;gap:7px;">


          <div style="width:36px;height:36px;border-radius:50%;border:2px solid var(--tc);display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px var(--tc-glow);flex-shrink:0;">


            <span style="font-size:17px;font-weight:bold;color:var(--tc);">${card.power}</span>


          </div>


          <div style="font-size:10px;color:#bbb;letter-spacing:1px;">VP</div>


        </div>


        <div style="display:flex;align-items:center;gap:3px;">


          <span style="font-size:10px;color:#bbb;margin-right:2px;">T</span>


          ${Array.from({length:tierNum},()=>`<div style="width:9px;height:9px;border-radius:50%;background:${tierCol};box-shadow:0 0 4px ${tierCol};"></div>`).join('')}


          ${Array.from({length:4-tierNum},()=>`<div style="width:9px;height:9px;border-radius:50%;border:1px solid #2a2a3a;"></div>`).join('')}


        </div>


      </div>


    </div>





    <div style="display:flex;padding:8px 12px;gap:8px;border-bottom:1px solid var(--tc-dim);">


      <div style="flex:1;">


        <div style="font-size:9px;letter-spacing:2px;color:#bbb;margin-bottom:4px;">ATTACK POWER</div>


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


      <div style="width:1px;background:var(--tc-dim);opacity:0.3;flex-shrink:0;"></div>


      <div style="flex:1;">


        <div style="font-size:8px;letter-spacing:2px;color:#ccc;margin-bottom:4px;">ZONE</div>


        ${card.zone ? buildZoneGrid(card) : `<div style="font-size:9px;color:#2a2a3a;">&#x2014;</div>`}


      </div>


    </div>





    <div style="padding:8px 12px 10px;">


      ${abi ? `


      <div style="border:1px solid #ffdd0044;border-radius:5px;padding:0;background:#ffdd0008;display:flex;flex-direction:row;gap:0;align-items:stretch;overflow:hidden;">


        ${_iconSrc ? `<img src="${_iconSrc}" style="width:72px;flex-shrink:0;object-fit:cover;object-position:center;align-self:stretch;display:block;border-right:1px solid #ffdd0033;background:#050510;border-radius:4px 0 0 4px;" onerror="this.style.display='none'">` : ''}


        <div style="flex:1;display:flex;flex-direction:column;gap:6px;padding:8px 10px;">


          <div style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:1px;color:#ffdd00;font-weight:700;display:flex;align-items:center;gap:6px;"><span class="ability-star" style="font-size:14px;flex-shrink:0;">★</span>${card.abilityLabel || abi.label}</div>


          <div style="font-size:10.5px;color:#ddd;line-height:1.5;margin-top:2px;">${card.abilityText}</div>
            ${buildAbilityVisual(card.ability) ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #ffdd0022;display:flex;justify-content:center;">${buildAbilityVisual(card.ability)}</div>` : ""}
        </div>
      </div>` : `


      <div style="font-size:10px;color:#333;letter-spacing:1px;font-style:italic;">No special ability</div>`}


    </div>





  </div>`;





  tt.style.display = 'block';


  // Right side, vertically centered


  const ttH = tt.offsetHeight || 360;
  tt.style.width  = '300px'; // reset from narrower battle tip
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


  document.getElementById('tooltip').style.display = 'none';


  document.getElementById('errorTip').style.display = 'none';


}

// Mobile: tap anywhere dismisses open tooltip


document.addEventListener('touchstart', () => hideTip(), { passive: true });
