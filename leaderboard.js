// ── LEADERBOARD — localStorage-backed, works on both index.html and game.html ──

const _LB_KEY = 'gz_lb_v1';

const _LB_FACTIONS = {
  terran:     { name:'TERRAN ACCORD',   short:'TERRAN',     color:'#7ab8e8', img:'assets/avatars/terran.png'     },
  brood:      { name:'BROOD SOVEREIGN', short:'BROOD',      color:'#88cc44', img:'assets/avatars/brood.png'      },
  crystallis: { name:'THE CRYSTALLIS',  short:'CRYSTALLIS', color:'#00ccff', img:'assets/avatars/crystallis.png' },
  mycos:      { name:'MYCOS DRIFT',     short:'MYCOS',      color:'#9dcf6e', img:'assets/avatars/mycos.png'      },
  veil:       { name:'THE VEIL',        short:'VEIL',       color:'#fff5a0', img:'assets/avatars/veil.png'       },
  entropy:    { name:'ENTROPY CULT',    short:'ENTROPY',    color:'#c4723a', img:'assets/avatars/entropy.png'    },
  void:       { name:'VOID HUNTERS',    short:'VOID',       color:'#9b59b6', img:'assets/avatars/void.png'       },
  gas:        { name:'GAS NOMADS',      short:'GAS',        color:'#ffd700', img:'assets/avatars/gas.png'        },
  lithos:     { name:'THE LITHOS',      short:'LITHOS',     color:'#a0896a', img:'assets/avatars/lithos.png'     },
  quantum:    { name:'QUANTUM THREAD',  short:'QUANTUM',    color:'#ff69b4', img:'assets/avatars/quantum.png'    },
  choir:      { name:'THE CHOIR',       short:'CHOIR',      color:'#c8c8ff', img:'assets/avatars/choir.png'      },
};

const _LB_ORDER = ['terran','brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'];

// ── Storage ──────────────────────────────────────────────────────────────────

function _lbLoad() {
  try { return JSON.parse(localStorage.getItem(_LB_KEY) || '{}'); } catch(e) { return {}; }
}

function _lbSave(data) {
  try { localStorage.setItem(_LB_KEY, JSON.stringify(data)); } catch(e) {}
}

function _lbKey(pFac, aFac) { return pFac + '_vs_' + aFac; }

// ── Public: check after a player win ─────────────────────────────────────────

function checkLeaderboardRecord(playerFaction, aiFaction, playerVP, aiVP) {
  if (!playerFaction || !aiFaction || playerVP <= aiVP) return; // player must win
  const delta = playerVP - aiVP;
  const data  = _lbLoad();
  const key   = _lbKey(playerFaction, aiFaction);
  const existing = data[key];

  if (!existing || delta > (existing.delta || 0)) {
    // New record — prompt for initials
    setTimeout(() => showInitialsEntry(playerFaction, aiFaction, delta), 800);
  }
}

function saveLeaderboardEntry(playerFaction, aiFaction, initials, delta) {
  const data = _lbLoad();
  data[_lbKey(playerFaction, aiFaction)] = { initials: initials.toUpperCase(), delta };
  _lbSave(data);
}

// ── Initials Entry Modal ──────────────────────────────────────────────────────

function showInitialsEntry(playerFaction, aiFaction, delta) {
  const pFac = _LB_FACTIONS[playerFaction] || { name: playerFaction, color: '#00ffcc', img: '' };
  const aFac = _LB_FACTIONS[aiFaction]    || { name: aiFaction,    color: '#ff0080', img: '' };

  const el = document.createElement('div');
  el.id = 'lbInitialsOverlay';
  el.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    display:flex;align-items:center;justify-content:center;
    background:#000000cc;backdrop-filter:blur(6px);
  `;

  el.innerHTML = `
    <div style="
      background:linear-gradient(160deg,#0a0818,#06060e);
      border:1px solid #ffdd0055;border-radius:16px;
      padding:32px 36px;max-width:380px;width:90%;
      box-shadow:0 0 60px #ffdd0022,0 24px 80px #000000cc;
      text-align:center;font-family:'Courier New',monospace;
    ">
      <div style="font-size:11px;letter-spacing:4px;color:#ffdd00;font-family:'Orbitron',monospace;margin-bottom:6px;">✦ NEW RECORD ✦</div>
      <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:#fff;font-family:'Orbitron',monospace;margin-bottom:20px;">HALL OF CHAMPIONS</div>

      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <img src="${pFac.img}" style="width:48px;height:48px;border-radius:50%;border:2px solid ${pFac.color};object-fit:cover;object-position:top;">
          <div style="font-size:8px;letter-spacing:1px;color:${pFac.color};">${pFac.short}</div>
        </div>
        <div style="font-size:11px;color:#555;letter-spacing:2px;">VS</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <img src="${aFac.img}" style="width:48px;height:48px;border-radius:50%;border:2px solid ${aFac.color};object-fit:cover;object-position:top;">
          <div style="font-size:8px;letter-spacing:1px;color:${aFac.color};">${aFac.short}</div>
        </div>
      </div>

      <div style="font-size:11px;color:#ffdd00;letter-spacing:3px;margin-bottom:24px;">WIN BY +${delta} VP</div>

      <div style="font-size:9px;letter-spacing:3px;color:#888;margin-bottom:12px;">ENTER YOUR INITIALS</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:28px;">
        ${[0,1,2].map(i => `
          <input id="lbInit${i}" maxlength="1" type="text"
            style="
              width:56px;height:64px;text-align:center;
              background:#0a0a18;border:2px solid #ffdd0055;
              color:#ffdd00;font-size:32px;font-weight:700;
              font-family:'Orbitron',monospace;border-radius:8px;
              caret-color:transparent;text-transform:uppercase;
              outline:none;
            "
          >`).join('')}
      </div>

      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="_lbSkipInitials()" style="
          padding:10px 24px;border-radius:6px;cursor:pointer;
          background:transparent;border:1px solid #333355;color:#555577;
          font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;
        ">SKIP</button>
        <button onclick="_lbSubmitInitials('${playerFaction}','${aiFaction}',${delta})" style="
          padding:10px 28px;border-radius:6px;cursor:pointer;
          background:linear-gradient(135deg,#aa8800,#776600);
          border:1px solid #ffdd0077;color:#ffdd00;
          font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;
          box-shadow:0 0 18px #ffdd0033;
        ">SUBMIT</button>
      </div>
    </div>
  `;

  document.body.appendChild(el);

  // Wire up inputs: uppercase + auto-advance
  [0,1,2].forEach(i => {
    const inp = document.getElementById('lbInit' + i);
    if (!inp) return;
    if (i === 0) setTimeout(() => inp.focus(), 50);
    inp.addEventListener('input', function() {
      this.value = this.value.toUpperCase().replace(/[^A-Z]/g,'');
      if (this.value.length === 1 && i < 2) {
        document.getElementById('lbInit' + (i + 1))?.focus();
      }
    });
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && i > 0) {
        document.getElementById('lbInit' + (i - 1))?.focus();
      }
    });
    // Highlight focused input
    inp.addEventListener('focus',  function() { this.style.borderColor = '#ffdd00'; this.style.boxShadow = '0 0 14px #ffdd0055'; });
    inp.addEventListener('blur',   function() { this.style.borderColor = '#ffdd0055'; this.style.boxShadow = 'none'; });
  });
}

function _lbSkipInitials() {
  document.getElementById('lbInitialsOverlay')?.remove();
}

function _lbSubmitInitials(playerFaction, aiFaction, delta) {
  const a = document.getElementById('lbInit0')?.value || '-';
  const b = document.getElementById('lbInit1')?.value || '-';
  const c = document.getElementById('lbInit2')?.value || '-';
  const initials = (a + b + c).toUpperCase().padEnd(3, '-');
  saveLeaderboardEntry(playerFaction, aiFaction, initials, delta);
  document.getElementById('lbInitialsOverlay')?.remove();

  // Brief confirmation flash
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    z-index:100000;font-family:'Orbitron',monospace;font-size:18px;
    letter-spacing:4px;color:#ffdd00;text-shadow:0 0 20px #ffdd00;
    pointer-events:none;animation:lbFlash 1.2s ease forwards;
  `;
  flash.textContent = initials + ' · RECORDED';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1400);
}

// ── Leaderboard View Modal ────────────────────────────────────────────────────

function showLeaderboard() {
  if (document.getElementById('lbModal')) return;
  const data = _lbLoad();

  const modal = document.createElement('div');
  modal.id = 'lbModal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:99990;
    display:flex;flex-direction:column;
    background:#020208f8;backdrop-filter:blur(8px);
    overflow:hidden;
  `;

  // Build all 110 combo rows grouped by player faction
  let rowsHtml = '';
  _LB_ORDER.forEach(pId => {
    const pFac = _LB_FACTIONS[pId];
    rowsHtml += `
      <div style="
        display:flex;align-items:center;gap:10px;
        padding:6px 20px;background:${pFac.color}0a;
        border-left:3px solid ${pFac.color}66;
        position:sticky;top:0;z-index:2;backdrop-filter:blur(4px);
      ">
        <img src="${pFac.img}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;object-position:top;border:1px solid ${pFac.color}88;">
        <span style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:3px;color:${pFac.color};font-weight:700;">${pFac.name}</span>
        <span style="font-size:8px;color:#333355;letter-spacing:1px;">— AS PLAYER</span>
      </div>
    `;
    _LB_ORDER.filter(aId => aId !== pId).forEach(aId => {
      const aFac  = _LB_FACTIONS[aId];
      const entry = data[_lbKey(pId, aId)];
      const inits = entry?.initials || '---';
      const delta = entry?.delta    || null;
      const hasRecord = !!entry;

      rowsHtml += `
        <div style="
          display:flex;align-items:center;gap:0;
          padding:0 20px;height:44px;
          border-bottom:1px solid #0d0d1a;
          transition:background 0.15s;
          ${hasRecord ? 'background:#ffdd0006;' : ''}
        "
        onmouseenter="this.style.background='#ffffff08'"
        onmouseleave="this.style.background='${hasRecord ? '#ffdd0006' : 'transparent'}'">

          <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
            <img src="${pFac.img}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;object-position:top;border:1px solid ${pFac.color}66;flex-shrink:0;">
            <span style="font-size:9px;letter-spacing:1px;color:${pFac.color};font-family:'Courier New',monospace;overflow:hidden;white-space:nowrap;">${pFac.short}</span>
          </div>

          <div style="font-size:8px;color:#2a2a44;letter-spacing:2px;padding:0 10px;flex-shrink:0;">VS</div>

          <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
            <img src="${aFac.img}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;object-position:top;border:1px solid ${aFac.color}66;flex-shrink:0;">
            <span style="font-size:9px;letter-spacing:1px;color:${aFac.color};font-family:'Courier New',monospace;overflow:hidden;white-space:nowrap;">${aFac.short}</span>
          </div>

          <div style="
            width:52px;text-align:center;flex-shrink:0;
            font-family:'Orbitron',monospace;font-size:13px;font-weight:700;
            letter-spacing:2px;
            color:${hasRecord ? '#ffdd00' : '#1e1e30'};
            ${hasRecord ? 'text-shadow:0 0 10px #ffdd0066;' : ''}
          ">${inits}</div>

          <div style="
            width:64px;text-align:right;flex-shrink:0;
            font-family:'Courier New',monospace;font-size:11px;
            color:${hasRecord ? '#00ffcc' : '#1e1e30'};
            ${hasRecord ? 'text-shadow:0 0 8px #00ffcc55;' : ''}
          ">${delta !== null ? '+' + delta + ' VP' : '--'}</div>
        </div>
      `;
    });
  });

  modal.innerHTML = `
    <style>
      @keyframes lbFlash { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.8)} 20%{opacity:1;transform:translate(-50%,-50%) scale(1.05)} 70%{opacity:1} 100%{opacity:0;transform:translate(-50%,-50%) scale(1)} }
      @keyframes lbFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    </style>

    <!-- Banner -->
    <div style="position:relative;flex-shrink:0;overflow:hidden;height:min(200px,28vw);">
      <img src="assets/leaderboard-banner.png"
        style="width:100%;height:100%;object-fit:cover;object-position:center 40%;display:block;">
      <div style="position:absolute;inset:0;background:linear-gradient(transparent 30%,#020208ee 100%);pointer-events:none;"></div>
      <div style="position:absolute;bottom:16px;left:0;right:0;text-align:center;pointer-events:none;">
        <div style="font-family:'Orbitron',monospace;font-size:clamp(18px,4vw,32px);font-weight:900;letter-spacing:6px;color:#fff;text-shadow:0 0 30px #ffdd0077,0 2px 8px #000;">HALL OF CHAMPIONS</div>
        <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;color:#ffdd0099;margin-top:4px;">GALACTIC ZERO · FACTION RECORDS</div>
      </div>
      <button onclick="hideLeaderboard()" style="
        position:absolute;top:12px;right:12px;
        background:#000000aa;border:1px solid #ffffff22;border-radius:50%;
        width:36px;height:36px;cursor:pointer;
        color:#aaa;font-size:16px;display:flex;align-items:center;justify-content:center;
        transition:all 0.2s;
      "
      onmouseenter="this.style.background='#ffffff18';this.style.color='#fff'"
      onmouseleave="this.style.background='#000000aa';this.style.color='#aaa'">✕</button>
    </div>

    <!-- Column headers -->
    <div style="display:flex;align-items:center;gap:0;padding:8px 20px;border-bottom:1px solid #1a1a2a;flex-shrink:0;background:#020208;">
      <div style="flex:1;font-size:8px;letter-spacing:3px;color:#333355;font-family:'Courier New',monospace;">PLAYER FACTION</div>
      <div style="width:20px;"></div>
      <div style="flex:1;font-size:8px;letter-spacing:3px;color:#333355;font-family:'Courier New',monospace;">OPPONENT</div>
      <div style="width:52px;text-align:center;font-size:8px;letter-spacing:2px;color:#333355;font-family:'Courier New',monospace;">INITIALS</div>
      <div style="width:64px;text-align:right;font-size:8px;letter-spacing:2px;color:#333355;font-family:'Courier New',monospace;">WIN BY</div>
    </div>

    <!-- Scrollable rows -->
    <div style="flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:#1a1a38 transparent;">
      ${rowsHtml}
    </div>

    <!-- Footer -->
    <div style="flex-shrink:0;padding:10px 20px;border-top:1px solid #0d0d1a;background:#020208;display:flex;align-items:center;justify-content:space-between;">
      <div style="font-size:8px;letter-spacing:2px;color:#222238;font-family:'Courier New',monospace;">
        ${Object.keys(data).length} / 110 RECORDS SET
      </div>
      <button onclick="hideLeaderboard()" style="
        padding:8px 22px;border-radius:5px;cursor:pointer;
        background:transparent;border:1px solid #1a1a33;color:#444466;
        font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;
        transition:all 0.2s;
      "
      onmouseenter="this.style.borderColor='#8855ff';this.style.color='#aa88ff'"
      onmouseleave="this.style.borderColor='#1a1a33';this.style.color='#444466'">CLOSE</button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.animation = 'lbFadeIn 0.25s ease';

  // Close on backdrop click (outside the inner content)
  modal.addEventListener('click', function(e) {
    if (e.target === modal) hideLeaderboard();
  });
}

function hideLeaderboard() {
  const m = document.getElementById('lbModal');
  if (!m) return;
  m.style.opacity = '0';
  m.style.transition = 'opacity 0.18s';
  setTimeout(() => m.remove(), 200);
}
