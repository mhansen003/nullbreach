function renderPassiveAbilityGlows(el) {
  const ADJ4 = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];

  // ── Per-cell custom rendering ────────────────────────────────────────────
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = G.grid[r][c];
      if (!cell.card || cell.owner === 'hazard') continue;
      const card = cell.card;

      // NOTE: sniper has no passive zone — it is a one-time silence of the
      // highest-power opponent home-row card at placement time (_silenced);
      // the victim already shows the 0 VP silenced overlay in render-grid.js.

      // ── INTIMIDATE: red threat zone on adjacent cells ────────────────────
      if (card.ability === 'intimidate') {
        ADJ4.forEach(({dr,dc}) => {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=5||nc<0||nc>=7) return;
          const tgt = G.grid[nr][nc];
          if (tgt.card && tgt.owner === cell.owner) return;
          const tgtEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
          if (!tgtEl) return;
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#ff444422;border:1px solid #ff444444;`;
          tgtEl.appendChild(ov);
        });
      }

      // ── AMBUSH: red threat, dim if charges spent ─────────────────────────
      else if (card.ability === 'ambush') {
        const charges = card._ambushHitsRemaining ?? 2;
        if (charges <= 0) continue; // per-cell guard: spent ambush just skips this cell
        ADJ4.forEach(({dr,dc}) => {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=5||nc<0||nc>=7) return;
          const tgt = G.grid[nr][nc];
          if (tgt.card && tgt.owner === cell.owner) return;
          const tgtEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
          if (!tgtEl) return;
          const alpha = charges === 2 ? '33' : '18';
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#ff4444${alpha};border:1px dashed #ff444455;`;
          tgtEl.appendChild(ov);
        });
      }

      // ── FORTIFY: blue glow on self; dashed blue border on fortified empty cells ──
      else if (card.ability === 'fortify') {
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) {
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#4488ff18;border:2px solid #4488ff55;box-shadow:inset 0 0 12px #4488ff22;`;
          cellEl.appendChild(ov);
        }
      }

      // ── REVENGE: red pulsing border on revenge cards ──────────────────────
      else if (card.ability === 'revenge') {
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) {
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#ff448818;border:2px solid #ff448855;box-shadow:inset 0 0 10px #ff440022;animation:hazardPulse2 1.4s ease-in-out infinite;`;
          cellEl.appendChild(ov);
        }
        // Show red glow on adjacent enemy cells to signal revenge threat
        ADJ4.forEach(({dr,dc}) => {
          const nr=r+dr, nc=c+dc;
          if (nr<0||nr>=5||nc<0||nc>=7) return;
          const tgt = G.grid[nr][nc];
          if (!tgt.card || tgt.owner === cell.owner) return;
          const tgtEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
          if (!tgtEl) return;
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#ff448811;border:1px dashed #ff448844;`;
          tgtEl.appendChild(ov);
        });
      }

      // ── LAMB: golden shimmer on high-value zero-edge card ────────────────
      // Red pulse when an enemy is adjacent (ability invalidated)
      else if (card.ability === 'lamb') {
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) {
          const adjacentEnemies = ADJ4.filter(({dr,dc}) => {
            const nr=r+dr, nc=c+dc;
            if (nr<0||nr>=5||nc<0||nc>=7) return false;
            const tgt = G.grid[nr][nc];
            return tgt.card && tgt.owner !== cell.owner && tgt.owner !== 'hazard';
          });
          if (adjacentEnemies.length > 0) {
            // Enemy adjacent: red pulsing border — LAMB bonus is invalidated
            cellEl.classList.add('lamb-enemy-adjacent');
            const ov = document.createElement('div');
            ov.dataset.passiveZone = '1';
            ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#ff222211;`;
            cellEl.appendChild(ov);
          } else {
            // No enemy adjacent: golden shimmer — LAMB bonus is active
            const ov = document.createElement('div');
            ov.dataset.passiveZone = '1';
            ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#ffdd0015;border:2px solid #ffdd0044;box-shadow:inset 0 0 14px #ffdd0022;animation:hazardPulse2 2s ease-in-out infinite;`;
            cellEl.appendChild(ov);
          }
        }
      }

      // ── POSITIVE zone abilities: boost/commander/spawn ────────────────────
      else {
        const POSITIVE_ZONES = {
          boost:     { dirs:ADJ4, col:'#00ffcc', op:'0.18' },
          commander: { dirs:ADJ4, col:'#ffcc00', op:'0.18' },
          spawn:     { dirs:ADJ4, col:'#88cc44', op:'0.18' },
        };
        const zone = POSITIVE_ZONES[card.ability];
        if (!zone) continue;
        const GRAD_DIR = {'-1,0':'to bottom','1,0':'to top','0,-1':'to right','0,1':'to left'};
        zone.dirs.forEach(({dr,dc}) => {
          const _p2g = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
          const _fwd = (cell.owner==='ai') ? (_p2g ? 1 : -1) : (_p2g ? -1 : 1);
          const nr=r+(dr*_fwd), nc=c+dc;
          if (nr<0||nr>=5||nc<0||nc>=7) return;
          const tgt = G.grid[nr][nc];
          if (tgt.card && tgt.owner !== cell.owner) return;
          const tgtEl = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);
          if (!tgtEl) return;
          const gradDir = GRAD_DIR[`${dr},${dc}`] || 'center';
          const opHex = Math.round(parseFloat(zone.op)*255).toString(16).padStart(2,'0');
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:linear-gradient(${gradDir},${zone.col}${opHex} 0%,transparent 65%);border:1px solid ${zone.col}44;`;
          tgtEl.appendChild(ov);
        });
      }
    }
  }
}

function renderBattleIndicators(el) {

  const CHIP = 40; // chip diameter px

  const pAvg = window.playerAvatarImg || '';

  const aAvg = window.aiAvatarImg    || '';

  const pCol = window.playerFactionColor || '#00ffcc';

  const aCol = window.aiFactionColor     || '#ff0080';

  const pName= window.playerFactionName  || 'YOU';

  const aName= window.aiFactionName      || 'AI';

  const pairs = [

    { dr:0, dc:1, myE:'e', theirE:'w', axis:'h',

      label: (c) => `E → W`,

      // center in horizontal gap between col c and c+1
      chipX: (r,c) => { const m=_mobileDims(); return m ? c*m.sw+m.cw+m.gap/2-12 : c*CS_W+124+3-CHIP/2; },
      chipY: (r,c) => { const m=_mobileDims(); return m ? r*m.sh+m.ch/2-12 : r*CS_H+76-CHIP/2; } },

    { dr:1, dc:0, myE:'s', theirE:'n', axis:'v',

      label: (c) => `S → N`,

      // center in vertical gap between row r and r+1
      chipX: (r,c) => { const m=_mobileDims(); return m ? c*m.sw+m.cw/2-12 : c*CS_W+62-CHIP/2; },
      chipY: (r,c) => { const m=_mobileDims(); return m ? r*m.sh+m.ch+m.gap/2-12 : r*CS_H+152+3-CHIP/2; } },

  ];

  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {

    const cell = G.grid[r][c];

    if (!cell.card) continue;

    for (const d of pairs) {

      const nr = r+d.dr, nc = c+d.dc;

      if (nr<0||nr>=5||nc<0||nc>=7) continue;

      const nb = G.grid[nr][nc];

      if (!nb.card || nb.owner === cell.owner) continue;

      if (cell.owner === 'hazard' || nb.owner === 'hazard') continue;
      if (cell.card.isHazard || nb.card.isHazard) continue;

      // Recompute edge values with mods

      let mv = cell.card.edges[d.myE] + (cell.card.edgeMod?.[d.myE]||0);
      if (d.axis === 'h' && cell.owner === 'ai' && window.aiDifficulty === 'aggressive') {
        mv = Math.round(mv * 1.1);
      }

      let tv = nb.card.edges[d.theirE] + (nb.card.edgeMod?.[d.theirE]||0);

      // PIERCE tiebreak

      const pierce = cell.card.ability==='pierce', pierceThem = nb.card.ability==='pierce';

      const isTie = mv === tv && !pierce && !pierceThem;

      const iWin  = mv > tv || (mv===tv && pierce && !pierceThem);

      const winnerOwner = isTie ? null : iWin ? cell.owner : nb.owner;

      const winAvg  = winnerOwner==='player' ? pAvg : aAvg;

      const winCol  = winnerOwner==='player' ? pCol : aCol;

      const winName = winnerOwner==='player' ? pName : aName;

      const losName = winnerOwner==='player' ? aName : pName;

      const losAvg  = winnerOwner==='player' ? aAvg : pAvg;

      const cellName = cell.owner==='player' ? pName : aName;

      const nbName   = nb.owner==='player' ? pName : aName;

      const chip = document.createElement('div');

      chip.className = `bti ${isTie?'tie-chip':'win-chip'}`;

      // Build ability note for tooltip

      const abilities = [];

      if (cell.card.ability==='shield'&&cell.card.shieldExpended) abilities.push(`${cellName} SHIELD absorbed a loss`);

      if (nb.card.ability==='shield'&&nb.card.shieldExpended)     abilities.push(`${nbName} SHIELD absorbed a loss`);

      if (pierce&&mv===tv)    abilities.push(`${cellName} PIERCE: tie → win`);

      if (pierceThem&&mv===tv)abilities.push(`${nbName} PIERCE: tie → win`);

      if (cell.card.ability==='double_strike') abilities.push(`${cellName} DOUBLE STRIKE extends reach`);

      if (nb.card.ability==='double_strike')   abilities.push(`${nbName} DOUBLE STRIKE extends reach`);

      // Encode tooltip data as JSON in dataset

      const tipData = JSON.stringify({

        axis: d.axis, myE: d.myE, theirE: d.theirE,

        mv, tv, isTie, winName, losName, winCol, winAvg, losAvg,

        abilities, winnerOwner,

        pAvg, aAvg, pCol, aCol,

        cellName, nbName,

        cellOwner: cell.owner, nbOwner: nb.owner

      });

      chip.dataset.tip = tipData;
      chip.dataset.cr = r; chip.dataset.cc = c;
      chip.dataset.nr = r+d.dr; chip.dataset.nc = c+d.dc;

      const _mDims = _mobileDims();

      // Position from the ACTUAL cell DOM rects (gzCellRect): correct for the
      // MP P2 flipped board and any responsive cell size, no stride math.
      let x = d.chipX(r,c), y = d.chipY(r,c); // legacy stride fallback
      if (typeof gzCellRect === 'function') {
        const _ra = gzCellRect(r, c), _rb = gzCellRect(nr, nc);
        if (_ra && _rb) {
          const _sz = _mDims ? 24 : CHIP;
          x = (Math.min(_ra.left, _rb.left) + Math.max(_ra.left + _ra.width, _rb.left + _rb.width)) / 2 - _sz / 2;
          y = (Math.min(_ra.top,  _rb.top)  + Math.max(_ra.top  + _ra.height, _rb.top + _rb.height)) / 2 - _sz / 2;
        }
      }
      if (_mDims) {
        // Mobile: compact W/L/T text chips
        const mChipSz = 24;
        if (isTie) {
          chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${mChipSz}px;height:${mChipSz}px;z-index:22;background:#1a1a2a;border:1px solid #555;cursor:pointer;`;
          chip.innerHTML = `<span style="pointer-events:none;font-size:8px;font-weight:bold;font-family:'Courier New',monospace;color:#fff;">T</span>`;
        } else {
          const isPlayerWin = winnerOwner === 'player';
          const mCol = isPlayerWin ? '#00dd66' : '#ff3355';
          const mLbl = isPlayerWin ? 'W' : 'L';
          chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${mChipSz}px;height:${mChipSz}px;border:1.5px solid ${mCol};--wc:${mCol};background:${mCol}22;z-index:22;cursor:pointer;`;
          chip.innerHTML = `<span style="pointer-events:none;font-size:9px;font-weight:bold;font-family:'Courier New',monospace;color:${mCol};">${mLbl}</span>`;
        }
        chip.onclick = (ev) => {
          ev.stopPropagation();
          // Any new tap cancels the previous auto-hide timer so it can't
          // clobber a freshly opened tip / freshly toggled chip.
          clearTimeout(window._gzChipTimer);
          if (chip._active) {
            hideTip();
            chip._active = false;
            chip.classList.remove('bchip-active');
            return;
          }
          document.querySelectorAll('.bchip-active').forEach(c => { c._active = false; c.classList.remove('bchip-active'); });
          chip._active = true;
          chip.classList.add('bchip-active');
          const _d = JSON.parse(chip.dataset.tip);
          showBattleTip(ev, _d);
          window._gzChipTimer = setTimeout(() => {
            hideTip();
            // Class query survives re-render: clear whichever chip is active now
            document.querySelectorAll('.bchip-active').forEach(c => { c._active = false; c.classList.remove('bchip-active'); });
          }, 2800);
        };
      } else if (isTie) {

        chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${CHIP}px;height:${CHIP}px;z-index:22;`;

        chip.innerHTML = `<span style="pointer-events:none;font-size:9px;">TIE</span>`;

      } else {

        chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${CHIP}px;height:${CHIP}px;border:3px solid ${winCol};--wc:${winCol};background:${winCol}18;z-index:22;`;

        chip.innerHTML = `<img src="${winAvg}" alt="${winName} wins" style="width:${CHIP-6}px;height:${CHIP-6}px;border-radius:50%;object-fit:cover;object-position:top;pointer-events:none;">`;

      }

      chip.onmouseenter = (ev) => {
        const _d = JSON.parse(chip.dataset.tip);
        showBattleTip(ev, _d);
        if (!_d.isTie && _d.winnerOwner) {
          const _cr=+chip.dataset.cr,_cc=+chip.dataset.cc,_nr=+chip.dataset.nr,_nc=+chip.dataset.nc;
          const winOwner = _d.winnerOwner;
          [[_cr,_cc,_d.cellOwner],[_nr,_nc,_d.nbOwner]].forEach(([rr,cc,own])=>{
            const el=document.querySelector('.cell[data-r="'+rr+'"][data-c="'+cc+'"]');
            if(el) el.style.filter = (own===winOwner)?'brightness(1.15)':'brightness(0.3) saturate(0.2)';
          });

          // PIERCE: if winner won a tied edge comparison, flash loser cell white
          const _pierceTie = _d.abilities && _d.abilities.some(a => a.includes('PIERCE: tie'));
          if (_pierceTie) {
            const _losEl = _d.cellOwner === winOwner
              ? document.querySelector('.cell[data-r="'+_nr+'"][data-c="'+_nc+'"]')
              : document.querySelector('.cell[data-r="'+_cr+'"][data-c="'+_cc+'"]');
            if (_losEl) {
              const _flashOv = document.createElement('div');
              _flashOv.setAttribute('data-abil-flash','1');
              _flashOv.style.cssText = 'position:absolute;inset:0;z-index:9;pointer-events:none;background:#ffffff44;border:2px solid #ffffffcc;border-radius:3px;animation:hazardPulse2 0.6s ease-in-out 3;';
              _losEl.appendChild(_flashOv);
            }
          }

          // DOUBLE STRIKE: highlight the 2nd-target cell beyond the neighbor
          const _hasDS = _d.abilities && _d.abilities.some(a => a.includes('DOUBLE STRIKE'));
          if (_hasDS) {
            // Determine direction from chip positions
            const _dsDr = _nr - _cr, _dsDc = _nc - _cc;
            // Winner cell drives double strike
            const _dsWinR = _d.cellOwner === winOwner ? _cr : _nr;
            const _dsWinC = _d.cellOwner === winOwner ? _cc : _nc;
            const _ds2r = _dsWinR + _dsDr*2, _ds2c = _dsWinC + _dsDc*2;
            if (_ds2r >= 0 && _ds2r < 5 && _ds2c >= 0 && _ds2c < 7) {
              const _ds2El = document.querySelector('.cell[data-r="'+_ds2r+'"][data-c="'+_ds2c+'"]');
              if (_ds2El && G.grid[_ds2r][_ds2c].card && G.grid[_ds2r][_ds2c].owner !== winOwner) {
                const _dsOv = document.createElement('div');
                _dsOv.setAttribute('data-abil-flash','1');
                const _dsCol = winOwner === 'player' ? (window.playerFactionColor||'#00ffcc') : (window.aiFactionColor||'#ff0080');
                _dsOv.style.cssText = `position:absolute;inset:0;z-index:9;pointer-events:none;background:${_dsCol}22;border:2px dashed ${_dsCol}88;border-radius:3px;animation:hazardPulse2 0.8s ease-in-out 3;`;
                _ds2El.appendChild(_dsOv);
              }
            }
          }
        }
      };

      chip.onmouseleave = () => {
        hideTip();
        document.querySelectorAll('.cell').forEach(el=>{el.style.filter='';});
        document.querySelectorAll('[data-abil-flash]').forEach(el=>el.remove());
      };

      el.appendChild(chip);

    }

  }

}

function showBattleTip(e, d) {

  hideTip();

  const tt = document.getElementById('tooltip');

  tt.style.setProperty('--tc',     d.winCol || '#8855ff');

  tt.style.setProperty('--tc-dim', (d.winCol||'#8855ff') + '55');

  tt.style.setProperty('--tc-glow',(d.winCol||'#8855ff') + '22');

  if (d.cellOwner === 'hazard' || d.nbOwner === 'hazard') { hideTip(); return; }
  const dirLabel = d.axis==='h' ? 'HORIZONTAL BATTLE' : 'VERTICAL BATTLE';

  const edgeLabels = d.axis==='h' ? ['E','W'] : ['S','N'];

  const cIsP = d.cellOwner==='player';

  const cCol = cIsP ? d.pCol : d.aCol;

  const nCol = cIsP ? d.aCol : d.pCol;

  const diff = Math.abs(d.mv - d.tv);

  tt.innerHTML = `

  <div class="tip-shine-layer"></div>

  <div class="tip-body">

    <!-- Header -->

    <div style="display:flex;align-items:center;gap:8px;padding:10px 14px 8px;border-bottom:1px solid var(--tc-dim);">

      <span style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;color:var(--tc);font-weight:700;">${dirLabel}</span>

    </div>

    <!-- Comparison rows -->

    <div style="padding:6px 10px;display:flex;flex-direction:column;gap:4px;">

      <!-- Cell side -->

      <div style="display:flex;align-items:center;gap:8px;">

        <img src="${cIsP?d.pAvg:d.aAvg}" alt="${d.cellName}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:2px solid ${cCol};flex-shrink:0;">

        <span style="font-size:10px;color:${cCol};letter-spacing:1px;flex:1;">${d.cellName}</span>

        <span style="font-size:9px;color:#bbb;letter-spacing:1px;">${edgeLabels[0]}:</span>

        <span style="font-size:18px;font-weight:bold;color:${d.cellOwner===d.winnerOwner?cCol:'#778899'};

          ${d.cellOwner===d.winnerOwner?`text-shadow:0 0 8px ${cCol};`:''}">${d.mv}</span>

      </div>

      <!-- Neighbor side -->

      <div style="display:flex;align-items:center;gap:8px;">

        <img src="${cIsP?d.aAvg:d.pAvg}" alt="${d.nbName}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:2px solid ${nCol};flex-shrink:0;">

        <span style="font-size:10px;color:${nCol};letter-spacing:1px;flex:1;">${d.nbName}</span>

        <span style="font-size:9px;color:#bbb;letter-spacing:1px;">${edgeLabels[1]}:</span>

        <span style="font-size:18px;font-weight:bold;color:${d.nbOwner===d.winnerOwner?nCol:'#778899'};

          ${d.nbOwner===d.winnerOwner?`text-shadow:0 0 8px ${nCol};`:''}">${d.tv}</span>

      </div>

    </div>

    <!-- Result -->

    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--tc-dim),transparent);margin:0 12px;"></div>

    <div style="padding:6px 10px 8px;">

      ${d.isTie

        ? `<div style="font-size:11px;color:#bbb;letter-spacing:2px;text-align:center;">TIE: equal battle values</div>`

        : `<div style="display:flex;align-items:center;gap:8px;">

            <img src="${d.winAvg}" alt="" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1px solid ${d.winCol};">

            <span style="font-size:12px;font-weight:bold;color:${d.winCol};letter-spacing:1px;">${d.winName} WINS</span>

            <span style="font-size:10px;color:#bbb;margin-left:auto;">+${diff}</span>

          </div>`}

      ${d.abilities.length ? `

        <div style="margin-top:6px;border-top:1px solid #1a1a2a;padding-top:6px;display:flex;flex-direction:column;gap:3px;">

          ${d.abilities.map(a => `<div style="font-size:10px;color:#aa88ff;letter-spacing:0.5px;">⚡ ${a}</div>`).join('')}

        </div>` : ''}

    </div>

  </div>`;

  // Set final width + clear fixed-corner positioning BEFORE measuring,
  // otherwise offsetWidth/offsetHeight reflect the previous tooltip's box.
  tt.style.right  = 'auto';
  tt.style.bottom = 'auto';
  tt.style.width  = '220px'; // battle tips are narrower than card tips

  tt.style.display = 'block';

  const ttH = tt.offsetHeight || 220;

  const ttW = tt.offsetWidth  || 315;

  const spaceBelow = window.innerHeight - e.clientY;

  const top  = spaceBelow > ttH + 20 ? e.clientY + 14 : e.clientY - ttH - 14;

  const left = e.clientX + ttW + 20 > window.innerWidth ? e.clientX - ttW - 14 : e.clientX + 14;

  tt.style.top  = Math.max(8, top)  + 'px';
  tt.style.left = Math.max(8, left) + 'px';

}

function showFlash(r1, c1, r2, c2, myVal, theirVal, iWin) {

  const el  = document.getElementById('grid');

  // Position from actual cell rects (correct on mobile strides + MP P2 flip);
  // legacy desktop stride math kept as fallback.
  let midY = ((r1+r2)/2)*CS_H + 58;
  let midX = ((c1+c2)/2)*CS_W + 24;
  if (typeof gzCellRect === 'function') {
    const _a = gzCellRect(r1, c1), _b = gzCellRect(r2, c2);
    if (_a && _b) {
      // Approx flash box is ~80x20; offset so it centers on the shared edge.
      // (Cannot use transform: the flashFade keyframes animate transform.)
      midX = ((_a.left + _a.width/2) + (_b.left + _b.width/2)) / 2 - 40;
      midY = ((_a.top + _a.height/2) + (_b.top + _b.height/2)) / 2 - 10;
    }
  }

  const f   = document.createElement('div');

  f.className = 'flash';

  const col = iWin ? '#00ffcc' : '#ff4455';

  f.style.cssText = `top:${midY}px;left:${midX}px;color:${col};background:${col}22;border:1px solid ${col}44;`;

  f.textContent   = iWin ? `${myVal} > ${theirVal} WIN` : `${myVal} < ${theirVal} LOSE`;

  el.appendChild(f);

  setTimeout(() => f.remove(), 1900);

}
