// ── LEADERBOARD: Hall of Champions ──────────────────────────────────────────

const _LB_KEY = 'gz_lb_v1';

// Seed demo entry so the leaderboard isn't entirely blank on first view
(function() {
  try {
    var _d = JSON.parse(localStorage.getItem(_LB_KEY) || '{}');
    if (!_d['terran_vs_veil']) {
      _d['terran_vs_veil'] = { initials: 'MDH', delta: 7 };
      localStorage.setItem(_LB_KEY, JSON.stringify(_d));
    }
  } catch(e) {}
})();

// ── Supabase config (anon/public key — safe to ship) ─────────────────────────
const _SB_LB_URL = 'https://mstpkwxxhsspivtngfnm.supabase.co';
const _SB_LB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdHBrd3h4aHNzcGl2dG5nZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTE2MTcsImV4cCI6MjA5NjAyNzYxN30.B0F-e_mGzv5kbjwOa2yw499OfsZ3qJDXdoyrCu2tNiI';
const _SB_LB_H = { 'apikey': _SB_LB_KEY, 'Authorization': 'Bearer ' + _SB_LB_KEY, 'Content-Type': 'application/json' };

// ── Activity logging ──────────────────────────────────────────────────────────
function logGameEvent(event, data) {
  fetch(_SB_LB_URL + '/rest/v1/gz_events', {
    method: 'POST',
    headers: { ..._SB_LB_H, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ event, ...data })
  }).catch(() => {});
}

// POST a single entry to Supabase (fire-and-forget)
function _sbSaveEntry(pFac, aFac, initials, delta, mode) {
  fetch(_SB_LB_URL + '/rest/v1/gz_leaderboard', {
    method: 'POST',
    headers: _SB_LB_H,
    body: JSON.stringify({ player_faction: pFac, ai_faction: aFac, initials, delta, mode: mode || 'pve' })
  }).catch(() => {});
}

// Fetch best record per opponent for a given player faction from Supabase
function _sbFetchFaction(pFac, cb) {
  fetch(_SB_LB_URL + '/rest/v1/gz_leaderboard?player_faction=eq.' + pFac + '&select=ai_faction,initials,delta,mode&order=delta.desc', {
    headers: _SB_LB_H
  })
  .then(r => r.ok ? r.json() : [])
  .then(rows => {
    const best = {};
    (rows || []).forEach(row => {
      if (!best[row.ai_faction] || row.delta > best[row.ai_faction].delta) {
        best[row.ai_faction] = { initials: row.initials, delta: row.delta, mode: row.mode };
      }
    });
    cb(best);
  })
  .catch(() => cb({}));
}

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

let _lbActiveFaction = 'terran'; // which player faction tab is active

// ── Storage ───────────────────────────────────────────────────────────────────
function _lbLoad() {
  try { return JSON.parse(localStorage.getItem(_LB_KEY) || '{}'); } catch(e) { return {}; }
}
function _lbSave(data) {
  try { localStorage.setItem(_LB_KEY, JSON.stringify(data)); } catch(e) {}
}
function _lbKey(p, a) { return p + '_vs_' + a; }

// ── Win hook ──────────────────────────────────────────────────────────────────
function checkLeaderboardRecord(playerFaction, aiFaction, playerVP, aiVP, mode) {
  if (!playerFaction || !aiFaction || playerVP <= aiVP) return;
  const delta    = playerVP - aiVP;
  const existing = _lbLoad()[_lbKey(playerFaction, aiFaction)];
  if (!existing || delta > (existing.delta || 0)) {
    setTimeout(() => showInitialsEntry(playerFaction, aiFaction, delta, mode || 'pve'), 800);
  }
}
function saveLeaderboardEntry(pFac, aFac, initials, delta, mode) {
  const data = _lbLoad();
  data[_lbKey(pFac, aFac)] = { initials: initials.toUpperCase(), delta, mode: mode || 'pve' };
  _lbSave(data);
  _sbSaveEntry(pFac, aFac, initials.toUpperCase(), delta, mode);
}

// ── Initials entry ────────────────────────────────────────────────────────────
function showInitialsEntry(playerFaction, aiFaction, delta, mode) {
  var _lbMode = mode || 'pve';
  const pF = _LB_FACTIONS[playerFaction] || { name:playerFaction, color:'#00ffcc', img:'' };
  const aF = _LB_FACTIONS[aiFaction]    || { name:aiFaction,    color:'#ff0080', img:'' };

  const el = document.createElement('div');
  el.id = 'lbInitialsOverlay';
  el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#000000cc;backdrop-filter:blur(6px);';
  el.innerHTML = `
    <div style="background:linear-gradient(160deg,#0a0818,#06060e);border:1px solid #ffdd0055;border-radius:16px;padding:32px 36px;max-width:380px;width:90%;box-shadow:0 0 60px #ffdd0022,0 24px 80px #000c;text-align:center;font-family:'Courier New',monospace;">
      <div style="font-size:10px;letter-spacing:4px;color:#ffdd00;font-family:'Orbitron',monospace;margin-bottom:4px;">✦ NEW RECORD ✦</div>
      <div style="font-size:22px;font-weight:900;letter-spacing:3px;color:#fff;font-family:'Orbitron',monospace;margin-bottom:20px;">HALL OF CHAMPIONS</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:8px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <img src="${pF.img}" style="width:52px;height:52px;border-radius:50%;border:2px solid ${pF.color};object-fit:cover;object-position:top;">
          <div style="font-size:8px;letter-spacing:1px;color:${pF.color};">${pF.short}</div>
        </div>
        <div style="font-size:11px;color:#444;letter-spacing:2px;padding-bottom:16px;">VS</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <img src="${aF.img}" style="width:52px;height:52px;border-radius:50%;border:2px solid ${aF.color};object-fit:cover;object-position:top;">
          <div style="font-size:8px;letter-spacing:1px;color:${aF.color};">${aF.short}</div>
        </div>
      </div>
      <div style="font-size:12px;color:#ffdd00;letter-spacing:3px;margin-bottom:24px;font-family:'Orbitron',monospace;">WIN BY +${delta} VP</div>
      <div style="font-size:9px;letter-spacing:3px;color:#666;margin-bottom:12px;">ENTER YOUR INITIALS</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:28px;">
        ${[0,1,2].map(i=>`<input id="lbInit${i}" maxlength="1" type="text" style="width:56px;height:64px;text-align:center;background:#0a0a18;border:2px solid #ffdd0044;color:#ffdd00;font-size:32px;font-weight:700;font-family:'Orbitron',monospace;border-radius:8px;caret-color:transparent;text-transform:uppercase;outline:none;">`).join('')}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="_lbSkipInitials()" style="padding:10px 24px;border-radius:6px;cursor:pointer;background:transparent;border:1px solid #222244;color:#444466;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;transition:all 0.2s;" onmouseenter="this.style.borderColor='#555577';this.style.color='#8888aa'" onmouseleave="this.style.borderColor='#222244';this.style.color='#444466'">SKIP</button>
        <button onclick="_lbSubmitInitials('${playerFaction}','${aiFaction}',${delta},'${_lbMode}')" style="padding:10px 28px;border-radius:6px;cursor:pointer;background:linear-gradient(135deg,#aa8800,#776600);border:1px solid #ffdd0077;color:#ffdd00;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;box-shadow:0 0 18px #ffdd0033;transition:all 0.2s;" onmouseenter="this.style.boxShadow='0 0 28px #ffdd0066'" onmouseleave="this.style.boxShadow='0 0 18px #ffdd0033'">SUBMIT</button>
      </div>
    </div>`;
  document.body.appendChild(el);

  [0,1,2].forEach(i => {
    const inp = document.getElementById('lbInit'+i);
    if (!inp) return;
    if (i===0) setTimeout(()=>{ inp.focus(); inp.select(); },50);
    inp.addEventListener('input', function(){
      this.value = this.value.toUpperCase().replace(/[^A-Z]/g,'');
      if (this.value.length===1 && i<2) {
        setTimeout(()=>{
          var next = document.getElementById('lbInit'+(i+1));
          if (next) { next.focus(); next.select(); }
        }, 0);
      }
    });
    inp.addEventListener('keydown', function(e){
      if (e.key==='Backspace' && !this.value && i>0) {
        setTimeout(()=>{ var prev=document.getElementById('lbInit'+(i-1)); if(prev){prev.focus();prev.select();} },0);
      }
    });
    inp.addEventListener('focus',  function(){ this.style.borderColor='#ffdd00'; this.style.boxShadow='0 0 14px #ffdd0055'; });
    inp.addEventListener('blur',   function(){ this.style.borderColor='#ffdd0044'; this.style.boxShadow='none'; });
  });
}
function _lbSkipInitials() { document.getElementById('lbInitialsOverlay')?.remove(); }
function _lbSubmitInitials(pFac, aFac, delta, mode) {
  try {
    var a=(document.getElementById('lbInit0')||{}).value||'-';
    var b=(document.getElementById('lbInit1')||{}).value||'-';
    var c=(document.getElementById('lbInit2')||{}).value||'-';
    var initials=(a+b+c).toUpperCase().padEnd(3,'-');
    saveLeaderboardEntry(pFac, aFac, initials, delta, mode);
  } catch(e) {}
  // Remove overlay first: always, even if save failed
  var ov = document.getElementById('lbInitialsOverlay');
  if (ov) ov.parentNode.removeChild(ov);
  var flash=document.createElement('div');
  flash.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;font-family:"Orbitron",monospace;font-size:20px;letter-spacing:4px;color:#ffdd00;text-shadow:0 0 20px #ffdd00;pointer-events:none;';
  flash.textContent=initials+' · RECORDED';
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),1400);
}

// ── Leaderboard modal ─────────────────────────────────────────────────────────
function showLeaderboard() {
  if (document.getElementById('lbModal')) return;
  // Default to player's current faction if known, else first faction
  _lbActiveFaction = window.playerRaceId || 'terran';
  if (!_LB_FACTIONS[_lbActiveFaction]) _lbActiveFaction = 'terran';
  _lbRenderModal();
}

function _lbRenderModal(data) {
  document.getElementById('lbModal')?.remove();
  data = data || _lbLoad();
  const pId  = _lbActiveFaction;
  const pF   = _LB_FACTIONS[pId];
  const total = Object.keys(data).length;

  // Count records for active faction
  const facRecords = _LB_ORDER.filter(a=>a!==pId&&data[_lbKey(pId,a)]).length;

  // Opponent rows for active faction
  const opponents = _LB_ORDER.filter(aId => aId !== pId);
  const rowsHtml = opponents.map(aId => {
    const aF    = _LB_FACTIONS[aId];
    const entry = data[_lbKey(pId, aId)];
    const has   = !!entry;
    const inits = entry?.initials || 'AAA';
    const delta = entry?.delta    ?? null;
    const mode  = entry?.mode     || null;
    const isPvP = mode === 'pvp';

    return `
      <div style="
        display:flex;align-items:center;gap:0;
        padding:0 24px;height:54px;
        border-bottom:1px solid #0a0a16;
        transition:background 0.12s;
        ${has ? `background:${aF.color}08;` : ''}
      "
      onmouseenter="this.style.background='${has ? aF.color+'14' : '#ffffff08'}'"
      onmouseleave="this.style.background='${has ? aF.color+'08' : 'transparent'}'">

        <!-- Opponent -->
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
          <div style="font-size:10px;letter-spacing:2px;color:#778899;font-family:'Courier New',monospace;flex-shrink:0;width:20px;text-align:right;">vs</div>
          <img src="${aF.img}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${aF.color}${has?'cc':'55'};flex-shrink:0;${has?`box-shadow:0 0 12px ${aF.color}44;`:''}">
          <div style="font-family:'Orbitron',monospace;font-size:11px;letter-spacing:1px;color:${has?aF.color:'#aabbcc'};font-weight:700;">${aF.short}</div>
        </div>

        <!-- Initials + mode badge -->
        <div style="width:82px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;">
          <div style="font-family:'Orbitron',monospace;font-weight:900;letter-spacing:3px;font-size:17px;color:${has?'#ffdd00':'#ffffff33'};${has?'text-shadow:0 0 12px #ffdd0055;':''}">${inits}</div>
          ${has ? `<div style="font-size:7px;letter-spacing:2px;font-family:'Courier New',monospace;padding:1px 5px;border-radius:3px;${isPvP?'color:#cc88ff;background:#8855ff18;border:1px solid #8855ff44;':'color:#00ffcc88;background:#00ffcc08;border:1px solid #00ffcc22;'}">${isPvP?'PvP':'PvE'}</div>` : ''}
        </div>

        <!-- Divider -->
        <div style="width:1px;height:28px;background:#0d0d1a;flex-shrink:0;margin:0 6px;"></div>

        <!-- Delta -->
        <div style="
          width:72px;text-align:right;flex-shrink:0;
          font-family:'Courier New',monospace;font-size:12px;letter-spacing:1px;
          color:${has?'#00ffcc':'#ffffff33'};
          ${has?'text-shadow:0 0 8px #00ffcc33;':''}
        ">${delta!==null?'+'+delta+' VP':'--'}</div>
      </div>`;
  }).join('');

  // Faction tab pills
  const tabsHtml = _LB_ORDER.map(id => {
    const f      = _LB_FACTIONS[id];
    const active = id === pId;
    const recs   = _LB_ORDER.filter(a=>a!==id&&data[_lbKey(id,a)]).length;
    return `
      <div onclick="_lbSetTab('${id}')" style="
        display:flex;flex-direction:column;align-items:center;gap:4px;
        padding:8px 10px;cursor:pointer;border-radius:8px;flex-shrink:0;
        transition:all 0.15s;
        ${active
          ? `background:${f.color}22;border-bottom:2px solid ${f.color};`
          : 'border-bottom:2px solid transparent;'}
      "
      onmouseenter="if(this.dataset.id!=='${pId}')this.style.background='${f.color}11'"
      onmouseleave="if(this.dataset.id!=='${pId}')this.style.background='transparent'"
      data-id="${id}">
        <img src="${f.img}" style="width:${active?'38px':'30px'};height:${active?'38px':'30px'};border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${active?f.color:f.color+'44'};transition:all 0.15s;${active?`box-shadow:0 0 14px ${f.color}55;`:''}">
        ${recs > 0 ? `<div style="font-size:8px;color:${active?f.color:'#aabbcc'};font-family:'Courier New',monospace;letter-spacing:1px;">${recs}/10</div>` : `<div style="font-size:8px;color:#445566;font-family:'Courier New',monospace;">-</div>`}
      </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'lbModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:#000000bb;backdrop-filter:blur(8px);padding:20px;';

  modal.innerHTML = `<div id="lbInner" style="display:flex;flex-direction:column;width:100%;max-width:780px;height:100%;max-height:90vh;background:#020208;border:1px solid #1a1a2a;border-radius:14px;overflow:hidden;box-shadow:0 24px 80px #000000cc;">

    <style>
      #lbModal ::-webkit-scrollbar{width:4px;height:4px}
      #lbModal ::-webkit-scrollbar-track{background:transparent}
      #lbModal ::-webkit-scrollbar-thumb{background:#1a1a38;border-radius:2px}
      @keyframes lbFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    </style>

    <!-- Banner -->
    <div style="position:relative;flex-shrink:0;height:clamp(110px,15vw,190px);overflow:hidden;">
      <img src="assets/leaderboard-banner.png" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;display:block;">
      <div style="position:absolute;inset:0;background:linear-gradient(transparent 20%,#020208f2 100%);"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:14px;">
        <div style="font-family:'Orbitron',monospace;font-size:clamp(18px,3vw,34px);font-weight:900;letter-spacing:6px;color:#fff;text-shadow:0 0 40px #ffdd0077,0 2px 12px #000;">HALL OF CHAMPIONS</div>
        <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:5px;color:#ffdd0088;margin-top:4px;">GALACTIC ZERO · FACTION RECORDS</div>
      </div>
      <button onclick="hideLeaderboard()" style="position:absolute;top:10px;right:12px;background:#000000bb;border:1px solid #ffffff44;border-radius:50%;width:34px;height:34px;cursor:pointer;color:#fff;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;line-height:1;"
        onmouseenter="this.style.background='#ffffff22'"
        onmouseleave="this.style.background='#000000bb'">✕</button>
    </div>

    <!-- Faction tabs -->
    <div style="flex-shrink:0;border-bottom:1px solid #0d0d1a;background:#030310;overflow-x:auto;scrollbar-width:none;">
      <div style="display:flex;gap:2px;padding:6px 14px 0;min-width:max-content;">
        ${tabsHtml}
      </div>
    </div>

    <!-- Active faction header -->
    <div style="flex-shrink:0;padding:14px 24px 12px;background:linear-gradient(90deg,${pF.color}14 0%,transparent 60%);border-bottom:1px solid ${pF.color}22;display:flex;align-items:center;gap:16px;">
      <img src="${pF.img}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${pF.color};box-shadow:0 0 20px ${pF.color}55;flex-shrink:0;">
      <div>
        <div style="font-family:'Orbitron',monospace;font-size:14px;font-weight:900;letter-spacing:3px;color:${pF.color};text-shadow:0 0 16px ${pF.color}55;">${pF.name}</div>
        <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8899bb;margin-top:3px;">
          PLAYING AS THIS FACTION · ${facRecords} / 10 RECORDS SET
        </div>
      </div>
      <div style="margin-left:auto;text-align:right;">
        <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:#778899;">TOTAL</div>
        <div style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;color:${total>0?'#ffdd00':'#aabbcc'};${total>0?'text-shadow:0 0 10px #ffdd0044;':''}">${total}<span style="font-size:10px;color:#778899;"> /110</span></div>
      </div>
    </div>

    <!-- Column labels -->
    <div style="flex-shrink:0;display:flex;align-items:center;gap:0;padding:6px 24px;background:#020208;border-bottom:1px solid #0a0a16;">
      <div style="flex:1;font-size:10px;letter-spacing:3px;color:#aabbcc;font-family:'Courier New',monospace;">OPPONENT</div>
      <div style="width:70px;text-align:center;font-size:10px;letter-spacing:2px;color:#aabbcc;font-family:'Courier New',monospace;">INITIALS</div>
      <div style="width:7px;"></div>
      <div style="width:72px;text-align:right;font-size:10px;letter-spacing:2px;color:#aabbcc;font-family:'Courier New',monospace;">WIN BY</div>
    </div>

    <!-- Opponent rows -->
    <div style="flex:1;overflow-y:auto;overflow-x:hidden;animation:lbFadeIn 0.2s ease;">
      ${rowsHtml}
    </div>

    <!-- Footer -->
    <div style="flex-shrink:0;padding:10px 20px;border-top:1px solid #0a0a14;background:#020208;display:flex;align-items:center;justify-content:flex-end;">
      <button onclick="hideLeaderboard()" style="padding:10px 28px;border-radius:6px;cursor:pointer;background:transparent;border:1px solid #334466;color:#aabbdd;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;transition:all 0.2s;"
        onmouseenter="this.style.borderColor='#8855ff';this.style.color='#fff';this.style.background='#8855ff22'"
        onmouseleave="this.style.borderColor='#334466';this.style.color='#aabbdd';this.style.background='transparent'">✕ CLOSE</button>
    </div>
  </div>`;

  document.body.appendChild(modal);

  // Hide the mobile LAUNCH DECK bar while leaderboard is open
  const _lb = document.getElementById('mobileLaunchBar') || document.getElementById('desktopLaunchBar');
  if (_lb) _lb.style.display = 'none';

  // Background fetch from Supabase — merge in any better remote records and re-render if modal still open
  const _fetchFaction = pId;
  _sbFetchFaction(_fetchFaction, remote => {
    if (!Object.keys(remote).length) return;
    const local = _lbLoad();
    let changed = false;
    Object.entries(remote).forEach(([aFac, entry]) => {
      const k = _lbKey(_fetchFaction, aFac);
      if (!local[k] || entry.delta > (local[k].delta || 0)) {
        local[k] = { initials: entry.initials, delta: entry.delta, mode: entry.mode || 'pve' };
        changed = true;
      }
    });
    if (changed) {
      _lbSave(local);
      if (document.getElementById('lbModal') && _lbActiveFaction === _fetchFaction) _lbRenderModal(local);
    }
  });
}

function _lbSetTab(id) {
  _lbActiveFaction = id;
  _lbRenderModal();
}

function hideLeaderboard() {
  const m = document.getElementById('lbModal');
  if (!m) return;
  m.style.opacity='0'; m.style.transition='opacity 0.18s';
  setTimeout(()=>{
    m.remove();
    // Restore LAUNCH DECK bar
    const _lb = document.getElementById('mobileLaunchBar');
    if (_lb && window.selectedRace) _lb.style.display = 'block';
    const _dlb = document.getElementById('desktopLaunchBar');
    if (_dlb && window.selectedRace) _dlb.style.display = 'flex';
  }, 200);
}
