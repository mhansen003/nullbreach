function renderGrid() {


  const el = document.getElementById('grid');


  el.innerHTML = '';


  const valid = (G.turn === 'player' && G.selectedCard)


    ? getValidPlacements('player', G.selectedCard) : [];





  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const cell = G.grid[r][c];


      const div  = document.createElement('div');


      div.className = 'cell';


      div.dataset.r = r; div.dataset.c = c;





      if (cell.card && cell.owner === 'hazard') {


        div.classList.add('hazard');


        div.style.overflow = 'hidden';


        div.style.cursor = 'default';


        const _hzCol = '#ff6600'; // consistent orange for all hazards


        const _hzPng = cell.card.video.replace('.mp4','.png');


        const _hzVid = cell.card.video;


        div.innerHTML = `


          <video autoplay loop muted playsinline preload="auto"


            poster="${_hzPng}"


            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 60%;display:block;transform:scale(1.25);z-index:0;pointer-events:none;">


            <source src="${_hzVid}" type="video/mp4">


          </video>


          <div style="position:absolute;inset:0;background:linear-gradient(transparent 50%,#ff440022);z-index:1;pointer-events:none;"></div>


          ${window.innerWidth > 480 ? `<div style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-family:'Orbitron',monospace;font-size:7px;letter-spacing:1px;color:#ff6600;text-shadow:0 0 6px #ff6600;z-index:2;">⚠ ${cell.card.name}</div>` : ''}


        `;


                div.style.border = '2px solid #ff660088';


        div.style.boxShadow = '0 0 18px #ff440066, inset 0 0 12px #ff220022';


        div.onmouseenter = () => {


          const tt = document.getElementById('tooltip');


          if (!tt) return;
          tt.style.width  = '220px';
          tt.style.right  = '16px'; tt.style.left = 'auto';
          tt.style.bottom = '16px'; tt.style.top  = 'auto';


          tt.style.setProperty('--tc','#ff6600');


          tt.style.setProperty('--tc-dim','#ff660044');


          tt.style.setProperty('--tc-glow','#ff440018');


          tt.innerHTML=`<div class="tip-body" style="padding:14px 16px;min-width:200px;">


            <div style="font-family:'Orbitron',monospace;font-size:13px;letter-spacing:2px;color:#ff6600;margin-bottom:8px;">⚠ ${cell.card.name}</div>


            <div style="font-size:12px;color:#cc4400;margin-bottom:6px;">COSMIC HAZARD</div>


            <div style="font-size:12px;color:#bbb;line-height:1.6;">Any card adjacent to this hazard loses <span style="color:#ff6600;font-weight:bold;">-2 VP</span> from its scoring contribution.</div>


            <div style="font-size:11px;color:#555;margin-top:8px;letter-spacing:1px;">Cannot be destroyed. Affects both sides.</div>


          </div>`;


          tt.style.display='block';


        };


        div.onmouseleave = hideTip;


        // If user already interacted, upgrade img to video immediately








      } else if (cell.card) {


        div.classList.add(cell.owner);


        div.style.backgroundImage = `url('${cell.card.art || ''}')`;


        div.style.backgroundSize = 'cover';


        div.style.backgroundPosition = 'center';


        div.style.filter = 'brightness(1.28)';


        // Border = faction color (whose card), dots = tier indicator


        const factionCol = cell.owner === 'player'


          ? (window.playerFactionColor || '#00ffcc')


          : (window.aiFactionColor     || '#ff0080');


        div.style.borderColor = factionCol;


        div.style.boxShadow = `0 0 10px ${factionCol}44`;


        const tierDotCol = TIER_COLORS[cell.card.tier] || '#888';


        const tierNum    = {'I':1,'II':2,'III':3,'IV':4}[cell.card.tier] || 1;


        const col = cell.owner === 'player' ? '#ffffff' : '#ffdd00';


        const bat = cell.battle || { h: 'none', v: 'none' };





        // CLOAK: show '?' if not yet revealed in battle


        const _cloaked = cell.card.ability === 'cloak' && !cell.card.cloakRevealed;


        // Edge: glow on winning direction, dim on losing


        const hLost = bat.h === 'lose' || bat.h === 'tie';


        const vLost = bat.v === 'lose' || bat.v === 'tie';


        const hAlpha = hLost ? 'aa' : 'ff';  // losing edges still readable


        const vAlpha = vLost ? 'aa' : 'ff';


        const hGlow  = hLost ? '' : `text-shadow:0 0 8px ${col},0 0 3px #000;`;


        const vGlow  = vLost ? '' : `text-shadow:0 0 8px ${col},0 0 3px #000;`;





        // Power dims if BOTH directions are lost


        const bothLost = hLost && vLost;


        const pwrColor = bothLost ? col + '44' : col;
        const _hzNear = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}].filter(({dr,dc})=>{const rr=r+dr,cc=c+dc;return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard';}).length;
        const _hzPen = _hzNear*2;





        div.innerHTML = `


          <span class="edge n" style="color:${_cloaked?'#8888ff':col+vAlpha};${_cloaked?'':''+vGlow}">${_cloaked?'?':cell.card.edges.n+(cell.card.edgeMod?.n||0)}</span>


          <span class="edge s" style="color:${_cloaked?'#8888ff':col+vAlpha};${_cloaked?'':''+vGlow}">${_cloaked?'?':cell.card.edges.s+(cell.card.edgeMod?.s||0)}</span>


          <span class="edge w" style="color:${_cloaked?'#8888ff':col+hAlpha};${_cloaked?'':''+hGlow}">${_cloaked?'?':cell.card.edges.w+(cell.card.edgeMod?.w||0)}</span>


          <span class="edge e" style="color:${_cloaked?'#8888ff':col+hAlpha};${_cloaked?'':''+hGlow}">${_cloaked?'?':cell.card.edges.e+(cell.card.edgeMod?.e||0)}</span>


          <!-- Tier indicator: text label on mobile, dots on desktop -->


          ${window.innerWidth <= 480
            ? `<div style="position:absolute;top:2px;left:2px;z-index:2;font-family:'Orbitron',monospace;font-size:6px;font-weight:700;letter-spacing:1px;color:${tierDotCol};text-shadow:0 0 4px ${tierDotCol}99;">T${tierNum}</div>`
            : `<div class="tier-dots">${Array.from({length: tierNum}, () => `<span class="tier-dot" style="background:${tierDotCol};color:${tierDotCol};"></span>`).join('')}</div>`}


          </div>


          <div class="cell-center">
            ${_hzPen>0?`<span style="font-size:9px;color:#ff6600;font-weight:bold;line-height:1;text-shadow:0 0 6px #ff440099;">-${_hzPen}</span>`:""}
            <span class="cell-power" style="color:${pwrColor}">${cell.card.power}</span>
          </div>


          ${cell.card.ability ? `<span class="ability-tag" style="color:${factionCol}88">${ab(cell.card.ability)}</span>` : ''}


          ${cell.card.ability && !cell.card.shieldExpended ? `<span class="ability-star" style="position:absolute;top:-4px;right:0px;z-index:6;font-size:28px;pointer-events:none;">\u2605</span>` : ''}


          ${cell.card.shieldExpended ? `<span style="position:absolute;top:3px;right:3px;z-index:5;font-size:11px;filter:drop-shadow(0 0 4px #aaaaff);pointer-events:none;">\uD83D\uDEE1</span>` : ''}


          ${cell.card._sniped||cell.card._sniperLocked ? `<div style='position:absolute;top:3px;right:3px;z-index:7;font-size:8px;color:#ff8800;text-shadow:0 0 6px #ff8800;pointer-events:none;' title='Sniper debuff -2 all edges'>🎯</div>` : ''}
          <img src="${cell.owner==='player'?(window.playerAvatarImg||''):(window.aiAvatarImg||'')}" style="position:absolute;bottom:3px;right:3px;width:18px;height:18px;border-radius:50%;object-fit:cover;object-position:top;border:1px solid ${factionCol}55;opacity:0.6;z-index:2;pointer-events:none;" onerror="this.style.display='none'">


          ${cell.card.stonewalled ? `<div style="position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:4px;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;letter-spacing:1px;color:#bbb;font-family:'Orbitron',monospace;background:#0a0a14;padding:2px 5px;border-radius:3px;border:1px solid #333;opacity:0.9;">0 VP</span></div>` : ''}


          ${cell.card.stonewall_victim ? `<div style="position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:4px;background:rgba(0,0,0,0.35);display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;"><span style="font-size:8px;letter-spacing:1px;color:#aaa;font-family:'Courier New',monospace;background:#0a0a14;padding:2px 4px;border-radius:3px;border:1px solid #2a2a2a;opacity:0.9;">BLOCKED</span></div>` : ''}
          ${(()=>{ const m=cell.card.edgeMod; const pen=(m?.n||0); return pen<0?`<div style="position:absolute;top:3px;left:3px;z-index:5;pointer-events:none;background:#880000cc;border:1px solid #ff444488;border-radius:3px;padding:1px 4px;font-size:9px;font-weight:bold;color:#ff8888;font-family:'Courier New',monospace;">${pen} edges</div>`:''; })()}


        `;





        // Orange hazard blast glow on cards adjacent to cosmic hazards


        if (cell.owner !== 'hazard') {


          [{dr:-1,dc:0,de:'n'},{dr:1,dc:0,de:'s'},{dr:0,dc:-1,de:'w'},{dr:0,dc:1,de:'e'}].forEach(({dr,dc,de}) => {


            const hr=r+dr, hc=c+dc;


            if (hr<0||hr>=5||hc<0||hc>=7||G.grid[hr][hc].owner!=='hazard') return;


            const gradDir = {n:'to bottom',s:'to top',w:'to right',e:'to left'}[de];


            const blast = document.createElement('div');


            blast.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:4px;background:linear-gradient(${gradDir},#ff660055 0%,#ff440022 35%,transparent 55%);animation:hazardPulse2 1.8s ease-in-out infinite;`;


            div.appendChild(blast);


          });


        }





        // Show tooltip on placed board cards (shows card info + buff status)


        div.onmouseenter = (ev) => {


          // Hazard warning overrides card tooltip for penalised cards


          const _hzNear = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]


            .filter(({dr,dc})=>{const hr=r+dr,hc=c+dc;return hr>=0&&hr<5&&hc>=0&&hc<7&&G.grid[hr][hc].owner==='hazard';}).length;


          if (_hzNear > 0) {


            const _cbuf={...cell.card}; if(cell.battle)_cbuf._bat=cell.battle; showTip(ev,_cbuf); if(cell.card.ability)showAbilityZone(cell.card.ability,r,c,cell.owner);


          } else {


            const cardWithBuf = {...cell.card};


            if (cell.battle) cardWithBuf._bat = cell.battle;


            showTip(ev, cardWithBuf);
            if (cell.card.ability) showAbilityZone(cell.card.ability, r, c, cell.owner);

          }


          // Yellow dotted lines on adjacent EMPTY cells — shows influence range for next placement
          [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}].forEach(({dr,dc}) => {
            const nr2 = r+dr, nc2 = c+dc;
            if (nr2<0||nr2>=5||nc2<0||nc2>=7) return;
            const adjEl = document.querySelector(`.cell[data-r="${nr2}"][data-c="${nc2}"]`);
            if (!adjEl) return;
            const g = G.grid[nr2][nc2];
            if (g.owner === 'hazard') return;
            if (g.card && g.owner === cell.owner) return; // skip friendly occupied
            // Enemy card: red dashed. Empty or neutral: yellow dashed.
            const _isEnemy = g.card && g.owner !== cell.owner;
            adjEl.style.outline = _isEnemy ? '2px dashed #ff555588' : '2px dashed #ffdd0088';
            adjEl.style.outlineOffset = '0px'; // outer edge of cell, not inset
          });


        };


        div.onmouseleave = () => {


          document.querySelectorAll('.cell[style*="dashed"]').forEach(el => { el.style.outline=''; el.style.outlineOffset=''; el.style.boxShadow=''; });
          hideTip();
          clearAbilityZone();
        };

        div.onclick = function() {
          if (window.innerWidth > 480) return;
          showMobileCardPanel(cell.card);
        };

      } else {


        div.classList.add('empty');


        // Tier indicator: row 4 = T1 home, rows 1-3 = T2+ battle zone, row 0 = AI home


        const _triHtml = r === 4


          ? `<div class="tri-dots"><span class="tri-d white"></span></div>`


          : r === 0


          ? `` // AI home — no player indicator


          : `<div class="tri-dots"><span class="tri-d green"></span><span class="tri-d green"></span><span class="tri-plus">+</span></div>`;


        div.innerHTML = _triHtml;


        // Orange hazard blast bleeds into adjacent empty cells


        const _emptyHzDirs = [{dr:-1,dc:0,de:'n'},{dr:1,dc:0,de:'s'},{dr:0,dc:-1,de:'w'},{dr:0,dc:1,de:'e'}]


          .filter(({dr,dc})=>{const hr=r+dr,hc=c+dc;return hr>=0&&hr<5&&hc>=0&&hc<7&&G.grid[hr][hc].owner==='hazard';});


        _emptyHzDirs.forEach(({de}) => {


          const gradDir = {n:'to bottom',s:'to top',w:'to right',e:'to left'}[de];


          const blast = document.createElement('div');


          blast.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:2;border-radius:3px;background:linear-gradient(${gradDir},#ff660055 0%,#ff440022 42%,transparent 62%);animation:hazardPulse2 1.8s ease-in-out infinite;`;


          div.appendChild(blast);


        });


        if (_emptyHzDirs.length > 0) {


          div.style.cursor = 'help';


          div.onmouseenter = ev => showErrorTip(ev, `⚠ HAZARD ZONE — placing here costs ${_emptyHzDirs.length * 2} VP`);


          div.onmouseleave = hideTip;


        }


        if (valid.some(v => v.r===r && v.c===c)) {


          div.classList.add('valid');

          // Highlight the previewed placement cell on mobile
          if (window.innerWidth <= 480 && G._previewCell && G._previewCell.r === r && G._previewCell.c === c) {
            div.style.border = '2px solid #00ffcccc';
            div.style.boxShadow = '0 0 14px #00ffcc66, inset 0 0 8px #00ffcc22';
            div.style.background = '#0e2a1e';
          }


          // Persistent hazard warning icon on valid cells bordering a hazard


          const _adjHz = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]


            .filter(({dr,dc})=>{const hr=r+dr,hc=c+dc;return hr>=0&&hr<5&&hc>=0&&hc<7&&G.grid[hr][hc].owner==='hazard';});


          if (_adjHz.length > 0) {


            const warnIcon = document.createElement('div');


            warnIcon.style.cssText = 'position:absolute;bottom:3px;right:3px;z-index:6;font-size:10px;color:#ff6600;pointer-events:none;filter:drop-shadow(0 0 3px #ff4400);';


            warnIcon.textContent = '⚠';


            div.appendChild(warnIcon);


          }


          div.onclick = () => onCellClick(r, c);


          div.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect='move'; });


          div.addEventListener('drop', e => { e.preventDefault(); if (G.selectedCard) onCellClick(r, c); });

          // Mobile: TAP hint (or CONFIRM for previewed cell)
          if (window.innerWidth <= 480 && G.selectedCard) {
            const isPrev = G._previewCell && G._previewCell.r === r && G._previewCell.c === c;
            const tapHint = document.createElement('div');
            if (isPrev) {
              tapHint.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Orbitron",monospace;font-size:6px;letter-spacing:1px;color:#00ffcc;pointer-events:none;z-index:6;animation:confirmPulse 0.7s ease-in-out infinite;text-shadow:0 0 8px #00ffcc;';
              tapHint.textContent = '✓ TAP';
            } else if (!G._previewCell) {
              tapHint.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:"Orbitron",monospace;font-size:7px;letter-spacing:1px;color:#ffffff99;pointer-events:none;z-index:5;animation:tapPulse 1s ease-in-out infinite;';
              tapHint.textContent = 'TAP';
            }
            if (tapHint.textContent) div.appendChild(tapHint);
          }

          // Zone preview + battle outcome preview on hover


          if (G.selectedCard) {


            const preview = getZonePreview(r, c, G.selectedCard, 'player');


            const _pRow = r, _pCol = c;


            div.onmouseenter = (ev) => {
              // Show selected card tooltip while looking for placement
              if (G.selectedCard) showTip(ev, G.selectedCard);


              // Zone expansion — yellow dots for future valid cells


              preview.forEach(({r: pr, c: pc}) => {


                const targetCell = document.querySelector(`.cell[data-r="${pr}"][data-c="${pc}"]`);


                if (targetCell && !targetCell.classList.contains('valid'))


                  targetCell.classList.add('future-valid');


              });


              // ── Battle outcome preview on adjacent enemy cells ──────────


              const card = G.selectedCard;


              const surgeB = (card.ability === 'surge' && G.surgeTrigger?.player) ? 3 : 0;


              const sweepB = (card.ability === 'sweep') ? 2 : 0;


              const dirs = [


                {dr:-1,dc:0,myE:'n',theirE:'s',lbl:'N'},


                {dr:1, dc:0,myE:'s',theirE:'n',lbl:'S'},


                {dr:0, dc:-1,myE:'w',theirE:'e',lbl:'W'},


                {dr:0, dc:1, myE:'e',theirE:'w',lbl:'E'},


              ];


              dirs.forEach(({dr,dc,myE,theirE,lbl}) => {


                const nr=_pRow+dr, nc=_pCol+dc;


                if (nr<0||nr>=5||nc<0||nc>=7) return;


                const adj = G.grid[nr][nc];


                if (!adj.card || adj.owner === 'player') return;


                const myVal   = card.edges[myE] + (card.edgeMod?.[myE]||0) + surgeB + sweepB;


                const theirVal= adj.card.edges[theirE] + (adj.card.edgeMod?.[theirE]||0);


                const pierceTie = card.ability === 'pierce' && myVal === theirVal;


                const result  = (myVal > theirVal || pierceTie) ? 'win' : myVal < theirVal ? 'lose' : 'tie';


                const adjEl   = document.querySelector(`.cell[data-r="${nr}"][data-c="${nc}"]`);


                if (!adjEl) return;


                adjEl.classList.add(`bpv-${result}`);


                // Inject floating badge showing edge values + result


                const badge = document.createElement('div');


                badge.dataset.bpv = '1';


                const col = result==='win'?'#00ff88':result==='lose'?'#ff3333':'#ffdd00';


                badge.style.cssText = `position:absolute;z-index:12;pointer-events:none;


                  background:#000000ee;border:1px solid ${col}88;border-radius:4px;


                  padding:3px 6px;display:flex;flex-direction:column;align-items:center;gap:1px;


                  font-family:'Courier New',monospace;`;


                // Badge on the FACING edge — side of enemy nearest the placement cell


                if (dr===1)       badge.style.cssText+=`top:4px;left:50%;transform:translateX(-50%);`;


                else if (dr===-1) badge.style.cssText+=`bottom:4px;left:50%;transform:translateX(-50%);`;


                else if (dc===1)  badge.style.cssText+=`left:4px;top:50%;transform:translateY(-50%);`;


                else              badge.style.cssText+=`right:4px;top:50%;transform:translateY(-50%);`;


                const labelCol = result==='tie'?'#ffee44':col; // bright yellow for TIE


                badge.innerHTML = `


                  <span style="font-size:10px;font-weight:bold;color:${labelCol};letter-spacing:1px;">${result.toUpperCase()}</span>


                  <span style="font-size:8px;color:${col}bb;">${myVal}v${theirVal}</span>`;


                adjEl.appendChild(badge);


              });


              // Hazard adjacency warning


              const _hzDirs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]


                .filter(({dr,dc})=>{const hr=_pRow+dr,hc=_pCol+dc;return hr>=0&&hr<5&&hc>=0&&hc<7&&G.grid[hr][hc].owner==='hazard';});


              if (_hzDirs.length > 0) {


                const wb = document.createElement('div');


                wb.dataset.bpv = '1';


                wb.style.cssText = 'position:absolute;z-index:14;top:4px;left:50%;transform:translateX(-50%);pointer-events:none;background:#1a0800;border:1px solid #ff660099;border-radius:4px;padding:3px 8px;font-family:\'Courier New\',monospace;white-space:nowrap;';


                wb.innerHTML = '<span style="font-size:9px;color:#ff8800;font-weight:bold;letter-spacing:1px;">⚠ HAZARD -2VP</span>';


                div.appendChild(wb);


                _hzDirs.forEach(({dr,dc})=>{


                  const hz=document.querySelector(`.cell[data-r="${_pRow+dr}"][data-c="${_pCol+dc}"]`);


                  if (hz) { hz.dataset.hzglow='1'; hz.style.boxShadow='0 0 36px #ff660099,inset 0 0 20px #ff440055'; }


                });


              }


            };


            div.onmouseleave = () => {
              hideTip();


              document.querySelectorAll('.cell.future-valid').forEach(el => el.classList.remove('future-valid'));


              document.querySelectorAll('.bpv-win,.bpv-lose,.bpv-tie').forEach(el => {


                el.classList.remove('bpv-win','bpv-lose','bpv-tie');


              });


              document.querySelectorAll('[data-bpv]').forEach(el => el.remove());


              document.querySelectorAll('[data-hzglow]').forEach(el => {


                el.removeAttribute('data-hzglow');


                el.style.boxShadow = '0 0 18px #ff440066, inset 0 0 12px #ff220022';


              });


            };


          }


        } else if (G.selectedCard) {


          // Show red tooltip explaining WHY this cell is invalid


          div.style.cursor = 'not-allowed';


          const _r = r, _c = c, _card = G.selectedCard;


          div.onmouseenter = ev => {


            const tier = _card.tier;


            let reason = 'No friendly card adjacent — place next to your cards';


            if (G.grid[_r]?.[_c]?.owner) {


              reason = 'Cell is occupied';


            } else if (tier === 'I' && _r !== 4) {


              reason = 'Tier I: your home row only (bottom row)';


            } else if (tier !== 'I' && _r === 4) {


              reason = 'Tier II+ cannot go in your home row';


            } else if (_r === 0) {


              reason = 'Enemy home row — no placement allowed here';


            } else if (tier !== 'I' && (_r === 4 || _r === 0)) {


              reason = 'Tier II+: battle zone only (rows 1–3)';


            }


            showErrorTip(ev, reason);


          };


          div.onmouseleave = hideTip;


        }


      }


      el.appendChild(div);


    }


  }





  // Passive ability zone glows on placed cards with spatial effects
  try { renderPassiveAbilityGlows(el); } catch(e) { console.error("Passive glow error:", e.message, e.stack); }

  // Battle comparison indicators in gaps
  renderBattleIndicators(el);


}

function renderPassiveAbilityGlows(el) {
  const ADJ4 = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];

  // ── Per-cell custom rendering ────────────────────────────────────────────
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = G.grid[r][c];
      if (!cell.card || cell.owner === 'hazard') continue;
      const card = cell.card;

      // ── SNIPER: amber pulse on entire row (except own cell) ──────────────
      if (card.ability === 'sniper') {
        for (let sc=0; sc<7; sc++) {
          if (sc === c) continue;
          const tgtCell = G.grid[r][sc];
          const tgtEl = document.querySelector(`.cell[data-r="${r}"][data-c="${sc}"]`);
          if (!tgtEl) continue;
          const isEnemy = tgtCell.owner !== cell.owner;
          const col = isEnemy ? '#ff8800' : '#ff880033';
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:${col}22;border-top:1px dashed ${col}66;border-bottom:1px dashed ${col}66;`;
          tgtEl.appendChild(ov);
          // SNIPER LOCK badge on sniped/locked enemy cards
          if (tgtCell.card && isEnemy && (tgtCell.card._sniped || tgtCell.card._sniperLocked)) {
            const badge = document.createElement('div');
            badge.dataset.passiveZone = '1';
            badge.style.cssText = `position:absolute;top:3px;left:50%;transform:translateX(-50%);z-index:8;pointer-events:none;background:#220800;border:1px solid #ff880099;border-radius:3px;padding:1px 5px;font-family:'Orbitron',monospace;font-size:7px;letter-spacing:1px;color:#ff8800;text-shadow:0 0 6px #ff8800;white-space:nowrap;`;
            badge.textContent = '🎯 LOCKED';
            tgtEl.appendChild(badge);
          }
        }
      }

      // ── INTIMIDATE: red threat zone on adjacent cells ────────────────────
      else if (card.ability === 'intimidate') {
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
        if (charges <= 0) break;
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

      // ── STONEWALL: blue/teal defensive glow on self ──────────────────────
      else if (card.ability === 'stonewall') {
        const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (cellEl) {
          const ov = document.createElement('div');
          ov.dataset.passiveZone = '1';
          ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:3px;background:#4488ff18;border:2px solid #4488ff55;box-shadow:inset 0 0 12px #4488ff22;`;
          cellEl.appendChild(ov);
        }
      }

      // ── POSITIVE zone abilities: boost/commander/spawn/hat_trick/mirror ──
      else {
        const POSITIVE_ZONES = {
          boost:     { dirs:ADJ4, col:'#00ffcc', op:'0.18' },
          commander: { dirs:ADJ4, col:'#ffcc00', op:'0.18' },
          spawn:     { dirs:ADJ4, col:'#88cc44', op:'0.18' },
          hat_trick: { dirs:[{dr:-1,dc:0},{dr:1,dc:0}], col:'#00ddff', op:'0.18' },
          mirror:    { dirs:[{dr:0,dc:-1},{dr:0,dc:1}], col:'#cc44ff', op:'0.22' },
        };
        const zone = POSITIVE_ZONES[card.ability];
        if (!zone) continue;
        const GRAD_DIR = {'-1,0':'to bottom','1,0':'to top','0,-1':'to right','0,1':'to left'};
        zone.dirs.forEach(({dr,dc}) => {
          const _fwd = (cell.owner==='ai') ? -1 : 1;
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
      chipX: (r,c) => { const m=_mobileDims(); return m ? c*m.sw+m.cw+m.gap/2-9 : c*CS_W+124+3-CHIP/2; },
      chipY: (r,c) => { const m=_mobileDims(); return m ? r*m.sh+m.ch/2-9 : r*CS_H+76-CHIP/2; } },


    { dr:1, dc:0, myE:'s', theirE:'n', axis:'v',


      label: (c) => `S → N`,


      // center in vertical gap between row r and r+1
      chipX: (r,c) => { const m=_mobileDims(); return m ? c*m.sw+m.cw/2-9 : c*CS_W+62-CHIP/2; },
      chipY: (r,c) => { const m=_mobileDims(); return m ? r*m.sh+m.ch+m.gap/2-9 : r*CS_H+152+3-CHIP/2; } },


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





      // Recompute edge values with mods + surge bonus


      const surgeBonus = (cell.card.ability==='surge' && G.surgeTrigger?.[cell.owner]) ? 3 : 0;


      const nbSurgeBonus = (nb.card.ability==='surge' && G.surgeTrigger?.[nb.owner]) ? 3 : 0;


      let mv = cell.card.edges[d.myE] + (cell.card.edgeMod?.[d.myE]||0) + surgeBonus;


      let tv = nb.card.edges[d.theirE] + (nb.card.edgeMod?.[d.theirE]||0) + nbSurgeBonus;





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


      const x = d.chipX(r,c), y = d.chipY(r,c);





      // Build ability note for tooltip


      const abilities = [];


      if (cell.card.ability==='shield'&&cell.card.shieldExpended) abilities.push(`${cellName} SHIELD absorbed a loss`);


      if (nb.card.ability==='shield'&&nb.card.shieldExpended)     abilities.push(`${nbName} SHIELD absorbed a loss`);


      if (surgeBonus)   abilities.push(`${cellName} SURGE +3`);


      if (nbSurgeBonus) abilities.push(`${nbName} SURGE +3`);


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
      if (_mDims) {
        // Mobile: compact W/L/T text chips
        const mChipSz = 18;
        if (isTie) {
          chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${mChipSz}px;height:${mChipSz}px;z-index:6;background:#1a1a2a;border:1px solid #555;cursor:pointer;`;
          chip.innerHTML = `<span style="pointer-events:none;font-size:8px;font-weight:bold;font-family:'Courier New',monospace;color:#fff;">T</span>`;
        } else {
          const isPlayerWin = winnerOwner === 'player';
          const mCol = isPlayerWin ? '#00dd66' : '#ff3355';
          const mLbl = isPlayerWin ? 'W' : 'L';
          chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${mChipSz}px;height:${mChipSz}px;border:2px solid ${mCol};--wc:${mCol};background:${mCol}22;z-index:6;cursor:pointer;`;
          chip.innerHTML = `<span style="pointer-events:none;font-size:9px;font-weight:bold;font-family:'Courier New',monospace;color:${mCol};">${mLbl}</span>`;
        }
        chip.onclick = (ev) => {
          ev.stopPropagation();
          const _d = JSON.parse(chip.dataset.tip);
          showBattleTip(ev, _d);
          setTimeout(hideTip, 2800);
        };
      } else if (isTie) {


        chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${CHIP}px;height:${CHIP}px;z-index:6;`;


        chip.innerHTML = `<span style="pointer-events:none;font-size:9px;">TIE</span>`;


      } else {


        chip.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${CHIP}px;height:${CHIP}px;border:3px solid ${winCol};--wc:${winCol};background:${winCol}18;z-index:6;`;


        chip.innerHTML = `<img src="${winAvg}" style="width:${CHIP-6}px;height:${CHIP-6}px;border-radius:50%;object-fit:cover;object-position:top;pointer-events:none;">`;


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
        }
      };


      chip.onmouseleave = () => {
        hideTip();
        document.querySelectorAll('.cell').forEach(el=>{el.style.filter='';});
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


        <img src="${cIsP?d.pAvg:d.aAvg}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:2px solid ${cCol};flex-shrink:0;">


        <span style="font-size:10px;color:${cCol};letter-spacing:1px;flex:1;">${d.cellName}</span>


        <span style="font-size:9px;color:#555;letter-spacing:1px;">${edgeLabels[0]}:</span>


        <span style="font-size:18px;font-weight:bold;color:${d.cellOwner===d.winnerOwner?cCol:'#444455'};


          ${d.cellOwner===d.winnerOwner?`text-shadow:0 0 8px ${cCol};`:''}">${d.mv}</span>


      </div>


      <!-- Neighbor side -->


      <div style="display:flex;align-items:center;gap:8px;">


        <img src="${cIsP?d.aAvg:d.pAvg}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:2px solid ${nCol};flex-shrink:0;">


        <span style="font-size:10px;color:${nCol};letter-spacing:1px;flex:1;">${d.nbName}</span>


        <span style="font-size:9px;color:#555;letter-spacing:1px;">${edgeLabels[1]}:</span>


        <span style="font-size:18px;font-weight:bold;color:${d.nbOwner===d.winnerOwner?nCol:'#444455'};


          ${d.nbOwner===d.winnerOwner?`text-shadow:0 0 8px ${nCol};`:''}">${d.tv}</span>


      </div>


    </div>


    <!-- Result -->


    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--tc-dim),transparent);margin:0 12px;"></div>


    <div style="padding:6px 10px 8px;">


      ${d.isTie


        ? `<div style="font-size:11px;color:#555;letter-spacing:2px;text-align:center;">TIE — no edge advantage</div>`


        : `<div style="display:flex;align-items:center;gap:8px;">


            <img src="${d.winAvg}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1px solid ${d.winCol};">


            <span style="font-size:12px;font-weight:bold;color:${d.winCol};letter-spacing:1px;">${d.winName} WINS</span>


            <span style="font-size:10px;color:#555;margin-left:auto;">+${diff}</span>


          </div>`}


      ${d.abilities.length ? `


        <div style="margin-top:6px;border-top:1px solid #1a1a2a;padding-top:6px;display:flex;flex-direction:column;gap:3px;">


          ${d.abilities.map(a => `<div style="font-size:10px;color:#aa88ff;letter-spacing:0.5px;">⚡ ${a}</div>`).join('')}


        </div>` : ''}


    </div>


  </div>`;





  tt.style.display = 'block';


  const ttH = tt.offsetHeight || 220;


  const ttW = tt.offsetWidth  || 315;


  const spaceBelow = window.innerHeight - e.clientY;


  const top  = spaceBelow > ttH + 20 ? e.clientY + 14 : e.clientY - ttH - 14;


  const left = e.clientX + ttW + 20 > window.innerWidth ? e.clientX - ttW - 14 : e.clientX + 14;


  // Clear fixed-corner positioning from card tooltip before cursor-follow
  tt.style.right  = 'auto';
  tt.style.bottom = 'auto';
  tt.style.width  = '220px'; // battle tips are narrower than card tips
  tt.style.top  = Math.max(8, top)  + 'px';
  tt.style.left = Math.max(8, left) + 'px';


}

function showFlash(r1, c1, r2, c2, myVal, theirVal, iWin) {


  const el  = document.getElementById('grid');


  const midY = ((r1+r2)/2)*CS_H + 58;


  const midX = ((c1+c2)/2)*CS_W + 24;


  const f   = document.createElement('div');


  f.className = 'flash';


  const col = iWin ? '#00ffcc' : '#ff4455';


  f.style.cssText = `top:${midY}px;left:${midX}px;color:${col};background:${col}22;border:1px solid ${col}44;`;


  f.textContent   = iWin ? `${myVal} > ${theirVal} WIN` : `${myVal} < ${theirVal} LOSE`;


  el.appendChild(f);


  setTimeout(() => f.remove(), 1900);


}
