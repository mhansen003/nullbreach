// ── ABILITY SVG ICON MAP ──────────────────────────────────────────────────────
const _ABILITY_SVG_PATHS = {
  shield:         `<path d="M12 3L4 6.5V12c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6.5L12 3z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.08)"/>`,
  flank:          `<path d="M4 12a8 8 0 0 1 8-8" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 4l3 3-3 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 12a8 8 0 0 1-8 8" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 20l-3-3 3-3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  commander:      `<path d="M6 20l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 13l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  laser_focus:    `<path d="M6 10l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="9" y1="12" x2="9" y2="22" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="15" y1="12" x2="15" y2="22" stroke="white" stroke-width="2.5" stroke-linecap="round"/>`,
  rush:           `<path d="M5 12h14M13 6l6 6-6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  intimidate:     `<path d="M12 5v14M7 15l5 5 5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="8" x2="18" y2="8" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  phantom:        `<path d="M6 10a6 6 0 1 1 12 0v10l-2-2-2 2-2-2-2 2-2-2-2 2V10z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.08)"/><circle cx="10" cy="11" r="1.5" fill="white"/><circle cx="14" cy="11" r="1.5" fill="white"/>`,
  home_invader:   `<path d="M3 11l9-8 9 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="11" width="12" height="10" rx="1" stroke="white" stroke-width="2"/><rect x="10" y="16" width="4" height="5" rx="0.5" stroke="white" stroke-width="1.5"/>`,
  fortify:        `<path d="M4 20V8h3V5h2v3h4V5h2v3h3v12H4z" stroke="white" stroke-width="2" stroke-linejoin="round" fill="rgba(255,255,255,0.08)"/><rect x="9" y="13" width="6" height="7" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.1)"/>`,
  pierce:         `<path d="M5 12h14M16 7l5 5-5 5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="5" y1="12" x2="10" y2="12" stroke="white" stroke-width="2.5" stroke-dasharray="2 2"/>`,
  double_strike:  `<path d="M7 6l5 6-5 6M12 6l5 6-5 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  cloak:          `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  sniper:         `<circle cx="12" cy="12" r="7" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="white"/><line x1="12" y1="3" x2="12" y2="7" stroke="white" stroke-width="2"/><line x1="12" y1="17" x2="12" y2="21" stroke="white" stroke-width="2"/><line x1="3" y1="12" x2="7" y2="12" stroke="white" stroke-width="2"/><line x1="17" y1="12" x2="21" y2="12" stroke="white" stroke-width="2"/>`,
  deciding_factor:`<line x1="5" y1="9" x2="19" y2="9" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="15" x2="19" y2="15" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="4" y1="19" x2="20" y2="5" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
  density:        `<text x="12" y="16" text-anchor="middle" fill="white" font-size="11" font-family="monospace" font-weight="bold">x1.5</text>`,
  lamb:           `<circle cx="12" cy="12" r="9" stroke="#ff2222" stroke-width="2.5"/><line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="#ff2222" stroke-width="2.5" stroke-linecap="round"/>`,
  revenge:        `<path d="M18 8A8 8 0 0 0 6 8" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M6 8l-3-1 1 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><text x="12" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="700">-VP</text>`,
  birthright:     `<rect x="8" y="2" width="8" height="4" rx="1" stroke="white" stroke-width="1.5"/><rect x="5" y="6" width="14" height="16" rx="1" stroke="white" stroke-width="2"/><line x1="9" y1="11" x2="15" y2="11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="14" x2="15" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="17" x2="13" y2="17" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`,
  boost:          `<path d="M6 20l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 13l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  spawn:          `<path d="M6 20l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 13l6-6 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
};

function _getAbilitySvg(ability) {
  const paths = _ABILITY_SVG_PATHS[ability] || `<text x="12" y="16" text-anchor="middle" fill="white" font-size="9" font-weight="bold">${(ability||'').substring(0,3).toUpperCase()}</text>`;
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">${paths}</svg>`;
}

// ── EMPTY CELL INFLUENCE TOOLTIP ─────────────────────────────────────────────
function showEmptyCellInfluenceTip(ev, r, c) {
  const influences = [];
  const dirs = [{dr:-1,dc:0,side:'N'},{dr:1,dc:0,side:'S'},{dr:0,dc:-1,side:'W'},{dr:0,dc:1,side:'E'}];
  const p2 = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;

  // Fortified?
  const cell = G.grid[r][c];
  if (cell.fortifiedBy) {
    const who = cell.fortifiedBy === 'player' ? 'Your' : 'Opponent\'s';
    influences.push({ color:'#4488ff', icon:'fortify', text: `${who} FORTIFY — this cell is claimed. ${cell.fortifiedBy === 'player' ? 'Only you can place here.' : 'You cannot place here.'}` });
  }

  // Scan adjacent cards
  dirs.forEach(({dr,dc}) => {
    const nr = r+dr, nc = c+dc;
    if (nr<0||nr>=5||nc<0||nc>=7) return;
    const nb = G.grid[nr][nc];
    if (!nb.card || nb.owner === 'hazard') return;
    const a = nb.card.ability;
    const isAlly = nb.owner === 'player';
    const isEnemy = nb.owner === 'ai';

    if (a === 'commander' || a === 'boost' || a === 'spawn') {
      const bonus = a === 'boost' ? '+1' : '+2';
      if (isAlly) influences.push({ color:'#44ff88', icon:a, text:`COMMANDER nearby — friendly card here gains ${bonus} to all battle values` });
    }
    if (a === 'intimidate') {
      if (isEnemy) influences.push({ color:'#ff5555', icon:'intimidate', text:'INTIMIDATE nearby — any card placed here by the enemy loses 1 from their highest battle value' });
      if (isAlly)  influences.push({ color:'#ff5555', icon:'intimidate', text:'INTIMIDATE (yours) — enemies placed adjacent to you here will lose 1 battle value' });
    }
    if (a === 'lamb' && isAlly) {
      influences.push({ color:'#ff2222', icon:'lamb', text:'LAMB nearby — placing an enemy adjacent to your LAMB card cancels its scoring bonus' });
    }
    if (a === 'revenge' && isEnemy) {
      influences.push({ color:'#ff4488', icon:'revenge', text:'REVENGE nearby — if you defeat this enemy card, you permanently lose 1 VP' });
    }
    if (a === 'double_strike' && isEnemy) {
      influences.push({ color:'#ffdd00', icon:'double_strike', text:'DOUBLE STRIKE range — a winning enemy here may deal secondary damage to the card 2 steps beyond' });
    }
    if (a === 'shield' && isEnemy) {
      influences.push({ color:'#aaaaff', icon:'shield', text:'SHIELD nearby — this enemy card will absorb its first battle loss' });
    }
    if (a === 'fortify' && isAlly) {
      influences.push({ color:'#4488ff', icon:'fortify', text:'FORTIFY nearby — placing here claims the forward cell, blocking enemies from that spot' });
    }
  });

  // Scan sniper in same column (for opponent home row context)
  if (r === 0) {
    for (let _r=1; _r<5; _r++) {
      const sc = G.grid[_r][c];
      if (sc.card && sc.owner === 'ai' && sc.card.ability === 'sniper') {
        influences.push({ color:'#ff8800', icon:'sniper', text:'SNIPER in column — this opponent card can silence the highest-power card on your home row' });
        break;
      }
    }
  }

  // Deciding factor in same row
  for (let _c=0; _c<7; _c++) {
    const dc = G.grid[r][_c];
    if (dc.card && dc.card.ability === 'deciding_factor') {
      const who = dc.owner === 'player' ? 'Your' : 'Opponent\'s';
      influences.push({ color:'#ffdd88', icon:'deciding_factor', text:`${who} DECIDING FACTOR in this row — tied result tips in their favor` });
      break;
    }
  }

  if (!influences.length) return;

  const tt = document.getElementById('tooltip');
  if (!tt) return;
  tt.style.width = '280px';
  tt.style.right = '16px'; tt.style.left = 'auto';
  tt.style.bottom = '16px'; tt.style.top = 'auto';

  const rows = influences.map(inf => `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid #ffffff08;">
      <div style="width:20px;height:20px;border-radius:4px;background:${inf.color}22;border:1px solid ${inf.color}55;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${_getAbilitySvg(inf.icon)}</div>
      <span style="font-size:11px;color:#dde;line-height:1.5;">${inf.text}</span>
    </div>`).join('');

  tt.innerHTML = `<div class="tip-body" style="padding:10px 12px;">
    <div style="font-size:9px;letter-spacing:2px;color:#7ab8e8;margin-bottom:6px;">CELL INFLUENCE</div>
    ${rows}
  </div>`;
  tt.style.display = 'block';
}

function renderGrid() {

  const el = document.getElementById('grid');

  // Save existing hazard video elements to prevent restart on re-render
  const _savedHzVideos = new Map();
  el.querySelectorAll('.cell.hazard').forEach(cellEl => {
    const vid = cellEl.querySelector('video');
    if (vid) _savedHzVideos.set(`${cellEl.dataset.r},${cellEl.dataset.c}`, { vid, time: vid.currentTime, paused: vid.paused });
  });

  el.innerHTML = '';

  const valid = (G.turn === 'player' && G.selectedCard)

    ? getValidPlacements('player', G.selectedCard) : [];

  const _p2view = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
  const _rows = _p2view ? [4,3,2,1,0] : [0,1,2,3,4];
  const _cols = _p2view ? [6,5,4,3,2,1,0] : [0,1,2,3,4,5,6];
  for (const r of _rows) {

    for (const c of _cols) {

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


        `;

                // Restore saved video element to prevent playback restart
        const _savedHz = _savedHzVideos.get(`${r},${c}`);
        if (_savedHz) {
          const existingVid = div.querySelector('video');
          if (existingVid) { div.replaceChild(_savedHz.vid, existingVid); }
          if (!_savedHz.paused) { _savedHz.vid.currentTime = _savedHz.time; _savedHz.vid.play().catch(()=>{}); }
        }

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

            <div style="font-size:11px;color:#bbb;margin-top:8px;letter-spacing:1px;">Cannot be destroyed. Affects both sides.</div>

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

        div.style.filter = 'brightness(1.6)';

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

        // CLOAK: per-edge reveal — only show edge value once that specific edge has been in battle
        const _cr = cell.card.ability === 'cloak' ? (cell.card.cloakRevealed || {}) : null;
        const _isCloak = !!_cr;

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

        // LASER FOCUS: determine the active (forward-facing) edge and dim others
        const _isLaserFocus = cell.card.ability === 'laser_focus';
        const _laserActiveEdge = _isLaserFocus ? (cell.owner === 'ai' ? 's' : 'n') : null;

        div.innerHTML = `

          ${['n','s','e','w'].map(edge => {
            const axAlpha = (edge==='e'||edge==='w') ? hAlpha : vAlpha;
            const axGlow  = (edge==='e'||edge==='w') ? hGlow  : vGlow;
            const cloakHidden = _isCloak && !_cr[edge];
            const mod = cell.card.edgeMod?.[edge] || 0;
            const edgeColor = cloakHidden ? '#8888ff' : mod > 0 ? '#44ff88' : mod < 0 ? '#ff5555' : col + axAlpha;
            const edgeGlow  = cloakHidden ? '' : mod > 0 ? 'text-shadow:0 0 6px #44ff8899;' : mod < 0 ? 'text-shadow:0 0 6px #ff555599;' : axGlow;
            const val = cloakHidden ? '?' : (cell.card.edges[edge] + mod);
            const modBadge = (!cloakHidden && mod !== 0) ? `<span style="position:absolute;font-size:7px;font-weight:900;color:${mod>0?'#44ff88':'#ff5555'};line-height:1;${edge==='n'?'top:-1px;right:-4px;':edge==='s'?'bottom:-1px;right:-4px;':edge==='w'?'top:-2px;left:-6px;':'top:-2px;right:-6px;'}">${mod>0?'+':''}${mod}</span>` : '';
            // LASER FOCUS: dim non-active edges
            const _laserDim = _isLaserFocus && edge !== _laserActiveEdge;
            const _laserStyle = _laserDim ? 'opacity:0.22;text-decoration:line-through;' : '';
            const _cloakClass = (cloakHidden && !_isLaserFocus) ? ' cloak-hidden-edge' : '';
            return `<span class="edge ${edge}${_cloakClass}" style="color:${edgeColor};${edgeGlow}${_laserStyle}">${val}</span>`;
          }).join('')}

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

          ${cell.card.ability ? `<div class="ability-badge" style="${cell.card.shieldExpended?'opacity:0.28;filter:grayscale(1);':''}${cell.card.ability==='shield'&&!cell.card.shieldExpended?'box-shadow:0 0 8px #aaaaff88;':''}">${_getAbilitySvg(cell.card.ability)}</div>` : ''}

          ${cell.card.shieldExpended ? `<span style="position:absolute;top:3px;right:3px;z-index:5;font-size:11px;filter:drop-shadow(0 0 4px #555577);opacity:0.45;pointer-events:none;">\uD83D\uDEE1</span>` : ''}

          ${cell.card._silenced ? `<div style='position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:4px;background:rgba(0,0,0,0.6);border:2px solid #ff880066;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;'><span style='font-size:16px;line-height:1;filter:drop-shadow(0 0 6px #ff8800);'>🎯</span><span style='font-size:7px;letter-spacing:1px;color:#ff8800;font-family:"Orbitron",monospace;background:#0a0a14;padding:1px 4px;border-radius:3px;border:1px solid #ff880066;opacity:0.9;'>0 VP</span></div>` : ''}
          ${(cell.card._sniped||cell.card._sniperLocked) && !cell.card._silenced ? `<div style='position:absolute;top:3px;right:3px;z-index:7;font-size:8px;color:#ff8800;text-shadow:0 0 6px #ff8800;pointer-events:none;' title='Sniper: -2 all battle values'>🎯</div>` : ''}
          ${cell.card._revengePenalty > 0 ? `<div style='position:absolute;top:${cell.card._sniped?'14':'3'}px;right:3px;z-index:7;font-size:8px;color:#ff4488;text-shadow:0 0 6px #ff4488;pointer-events:none;' title='Revenge penalty -${cell.card._revengePenalty} VP'>↩-${cell.card._revengePenalty}</div>` : ''}
          <img src="${cell.owner==='player'?(window.playerAvatarImg||''):(window.aiAvatarImg||'')}" style="position:absolute;bottom:3px;right:3px;width:18px;height:18px;border-radius:50%;object-fit:cover;object-position:top;border:1px solid ${factionCol}55;opacity:0.6;z-index:2;pointer-events:none;" onerror="this.style.display='none'">

          ${cell.card.stonewalled ? `<div style="position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:4px;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;letter-spacing:1px;color:#bbb;font-family:'Orbitron',monospace;background:#0a0a14;padding:2px 5px;border-radius:3px;border:1px solid #333;opacity:0.9;">0 VP</span></div>` : ''}

          ${cell.card.stonewall_victim ? `<div style="position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:4px;background:rgba(0,0,0,0.35);display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;"><span style="font-size:8px;letter-spacing:1px;color:#fff;font-family:'Courier New',monospace;background:#0a0a14;padding:2px 4px;border-radius:3px;border:1px solid #4488ff44;opacity:0.9;">BLOCKED</span></div>` : ''}
          ${(()=>{ const m=cell.card.edgeMod; const pen=(m?.n||0); return pen<0?`<div style="position:absolute;top:3px;left:3px;z-index:5;pointer-events:none;background:#880000cc;border:1px solid #ff444488;border-radius:3px;padding:1px 4px;font-size:9px;font-weight:bold;color:#ff8888;font-family:'Courier New',monospace;">${pen} edges</div>`:''; })()}

        `;

        // Orange hazard blast glow on cards adjacent to cosmic hazards

        if (cell.owner !== 'hazard') {

          [{dr:-1,dc:0,de:'n'},{dr:1,dc:0,de:'s'},{dr:0,dc:-1,de:'w'},{dr:0,dc:1,de:'e'}].forEach(({dr,dc,de}) => {

            const hr=r+dr, hc=c+dc;

            if (hr<0||hr>=5||hc<0||hc>=7||G.grid[hr][hc].owner!=='hazard') return;

            // P2's board is 180 rotated: gradient directions all invert
          const _gradMap = _p2view
            ? {n:'to top',s:'to bottom',w:'to left',e:'to right'}
            : {n:'to bottom',s:'to top',w:'to right',e:'to left'};
          const gradDir = _gradMap[de];

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

          // ability zone already shown via showAbilityZone (dotted overlays) — no future-valid needed for placed cards

        };

        div.onmouseleave = () => {
          document.querySelectorAll('.cell.future-valid').forEach(el => el.classList.remove('future-valid'));
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

          ? `` // AI home: no player indicator

          : `<div class="tri-dots"><span class="tri-d green"></span><span class="tri-d green"></span><span class="tri-plus">+</span></div>`;

        div.innerHTML = _triHtml;

        // Orange hazard blast bleeds into adjacent empty cells

        const _emptyHzDirs = [{dr:-1,dc:0,de:'n'},{dr:1,dc:0,de:'s'},{dr:0,dc:-1,de:'w'},{dr:0,dc:1,de:'e'}]

          .filter(({dr,dc})=>{const hr=r+dr,hc=c+dc;return hr>=0&&hr<5&&hc>=0&&hc<7&&G.grid[hr][hc].owner==='hazard';});

        _emptyHzDirs.forEach(({de}) => {

          const _emptyGradMap = _p2view
            ? {n:'to top',s:'to bottom',w:'to left',e:'to right'}
            : {n:'to bottom',s:'to top',w:'to right',e:'to left'};
          const gradDir = _emptyGradMap[de];

          const blast = document.createElement('div');

          blast.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:2;border-radius:3px;background:linear-gradient(${gradDir},#ff660055 0%,#ff440022 42%,transparent 62%);animation:hazardPulse2 1.8s ease-in-out infinite;`;

          div.appendChild(blast);

        });

        if (_emptyHzDirs.length > 0) {

          div.style.cursor = 'help';

          div.onmouseenter = ev => showErrorTip(ev, `⚠ HAZARD ZONE: placing here costs ${_emptyHzDirs.length * 2} VP`);

          div.onmouseleave = hideTip;

        }

        // Idle hover (no card selected): show influence tooltip
        if (!G.selectedCard && _emptyHzDirs.length === 0) {
          const _ir = r, _ic = c;
          div.onmouseenter = ev => showEmptyCellInfluenceTip(ev, _ir, _ic);
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

              // Zone expansion: yellow dots for future valid cells

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

                if (!adj.card || adj.owner === 'player' || adj.owner === 'hazard') return;

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

                // Badge on the FACING edge: side of enemy nearest the placement cell

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

          // Show lock icon — this cell cannot receive the selected card
          if (window.innerWidth > 480) {
            const lock = document.createElement('div');
            lock.style.cssText = [
              'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
              'width:16px;height:16px;pointer-events:none;z-index:3;opacity:0.22;',
              'border:2px solid #fff;border-radius:3px;border-top-left-radius:50%;border-top-right-radius:50%;',
              'border-bottom-left-radius:2px;border-bottom-right-radius:2px;background:transparent;',
              'box-shadow:inset 0 0 0 1.5px #fff'
            ].join('');
            div.appendChild(lock);
          }

          div.style.cursor = 'not-allowed';

          const _r = r, _c = c, _card = G.selectedCard;

          div.onmouseenter = ev => {

            const tier = _card.tier;

            let reason = 'No friendly card adjacent: place next to your cards';

            if (G.grid[_r]?.[_c]?.owner) {

              reason = 'Cell is occupied';

            } else if (tier === 'I' && _r !== 4) {

              reason = 'Tier I: your home row only (bottom row)';

            } else if (tier !== 'I' && _r === 4) {

              reason = 'Tier II+ cannot go in your home row';

            } else if (_r === 0) {

              reason = 'Enemy home row: no placement allowed here';

            } else if (tier !== 'I' && (_r === 4 || _r === 0)) {

              reason = 'Tier II+: battle zone only (rows 1-3)';

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
  // FORTIFY: show dashed border + lock icon on fortified empty cells
  for (let r=0; r<5; r++) for (let c=0; c<7; c++) {
    const cell = G.grid[r][c];
    if (!cell.fortifiedBy) continue;
    const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!cellEl) continue;
    const col = cell.fortifiedBy === 'player' ? '#4488ff' : '#ff4466';
    const ov = document.createElement('div');
    ov.dataset.passiveZone = '1';
    ov.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:2;border-radius:3px;border:2px dashed ${col}88;background:${col}11;`;
    const lk = document.createElement('div');
    lk.dataset.passiveZone = '1';
    lk.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;opacity:0.6;pointer-events:none;z-index:3;`;
    lk.textContent = '🔒';
    cellEl.appendChild(ov);
    cellEl.appendChild(lk);
  }

  try { renderPassiveAbilityGlows(el); } catch(e) { console.error("Passive glow error:", e.message, e.stack); }

  // Battle comparison indicators in gaps
  renderBattleIndicators(el);

}
