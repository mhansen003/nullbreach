// ── LEADERBOARD: Hall of Champions ──────────────────────────────────────────

const _LB_KEY = 'gz_lb_v1';

// One-time cleanup: remove the old demo seed entry (terran_vs_veil / MDH / +7)
// that earlier builds injected into localStorage on first view.
(function() {
  try {
    var _d = JSON.parse(localStorage.getItem(_LB_KEY) || '{}');
    var _e = _d['terran_vs_veil'];
    if (_e && _e.initials === 'MDH' && _e.delta === 7) {
      delete _d['terran_vs_veil'];
      localStorage.setItem(_LB_KEY, JSON.stringify(_d));
    }
  } catch(e) {}
})();

// ── Supabase config (single source: shared-data.js window.GZ_SB) ─────────────
const _SB_LB_URL = window.GZ_SB.url;
const _SB_LB_KEY = window.GZ_SB.key;
const _SB_LB_H = window.GZ_SB.headers;

// ── Modal registry glue (ui.js gzModalOpen/gzModalClose — game.html only) ────
// index.html does not load ui.js and has its own Escape chain that calls
// hideLeaderboard()/_lbSkipInitials() directly, so every call below is
// typeof-guarded: with no registry these are no-ops and nothing double-closes.
function _lbRegisterModal(el, closeFn) {
  if (typeof gzModalOpen !== 'function') return;
  // Tab switches rebuild #lbModal without closing it — drop stale entries first
  if (window._gzModalStack) {
    for (let i = window._gzModalStack.length - 1; i >= 0; i--) {
      const s = window._gzModalStack[i];
      if (s.el && s.el.id === el.id && !document.contains(s.el)) window._gzModalStack.splice(i, 1);
    }
  }
  gzModalOpen(el, closeFn);
}
// Returns true if the registry owned the element and closed it (closeFn ran).
function _lbCloseViaRegistry(el) {
  if (typeof gzModalClose !== 'function' || !window._gzModalStack) return false;
  if (!window._gzModalStack.some(s => s.el === el)) return false;
  return gzModalClose(el);
}

// ── Activity logging ──────────────────────────────────────────────────────────
function logGameEvent(event, data) {
  fetch(_SB_LB_URL + '/rest/v1/gz_events', {
    method: 'POST',
    headers: { ..._SB_LB_H, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ event, ...data })
  }).catch(() => {});
}

// POST a single entry to Supabase (fire-and-forget).
// Outbound values are clamped to exactly match the server-side RLS CHECKs in
// supabase/migration.sql: delta BETWEEN 1 AND 100, initials ~ '^[A-Z][A-Z-]{0,2}$',
// mode IN ('pve','pvp'). Anything that can't be made to pass is not sent.
function _sbSaveEntry(pFac, aFac, initials, delta, mode) {
  if (!_lbValidFaction(pFac) || !_lbValidFaction(aFac)) return;
  const d = _lbSanitizeDelta(delta);
  if (d === null) return;
  const inits = String(initials == null ? '' : initials).toUpperCase();
  if (!/^[A-Z][A-Z-]{0,2}$/.test(inits)) return; // server rejects e.g. '---'
  fetch(_SB_LB_URL + '/rest/v1/gz_leaderboard', {
    method: 'POST',
    headers: _SB_LB_H,
    body: JSON.stringify({ player_faction: pFac, ai_faction: aFac, initials: inits, delta: d, mode: _lbSanitizeMode(mode) })
  }).catch(() => {});
}

// Fetch best record per opponent for a given player faction from Supabase
function _sbFetchFaction(pFac, cb) {
  if (!_lbValidFaction(pFac)) return cb({});
  fetch(_SB_LB_URL + '/rest/v1/gz_leaderboard?player_faction=eq.' + encodeURIComponent(pFac) + '&select=ai_faction,initials,delta,mode&order=delta.desc', {
    headers: _SB_LB_H
  })
  .then(r => r.ok ? r.json() : [])
  .then(rows => {
    const best = {};
    (rows || []).forEach(row => {
      if (!row || typeof row !== 'object') return;
      // Sanitize at merge time: whitelist faction key, validate delta, scrub initials.
      if (!_lbValidFaction(row.ai_faction)) return;
      const delta = _lbSanitizeDelta(row.delta);
      if (delta === null) return; // discard rows with bogus deltas
      const initials = _lbSanitizeInitials(row.initials);
      if (!best[row.ai_faction] || delta > best[row.ai_faction].delta) {
        best[row.ai_faction] = { initials, delta, mode: _lbSanitizeMode(row.mode) };
      }
    });
    cb(best);
  })
  .catch(() => cb({}));
}

// Faction display data. Names/colors are sourced from the shared registry
// (window.GZ_FACTIONS in shared-data.js) when present; the literals below are
// the fallback so this file keeps working standalone.
const _LB_FACTIONS = (function() {
  const defs = {
    terran:     { name:'TERRAN ACCORD',   short:'TERRAN',     color:'#7ab8e8', img:'assets/avatars/terran.png'     },
    brood:      { name:'BROOD SOVEREIGN', short:'BROOD',      color:'#88cc44', img:'assets/avatars/brood.png'      },
    crystallis: { name:'THE CRYSTALLIS',  short:'CRYSTALLIS', color:'#00ccff', img:'assets/avatars/crystallis.png' },
    mycos:      { name:'MYCOS DRIFT',     short:'MYCOS',      color:'#9dcf6e', img:'assets/avatars/mycos.png'      },
    veil:       { name:'THE VEIL',        short:'VEIL',       color:'#fff5a0', img:'assets/avatars/veil.png'       },
    entropy:    { name:'ENTROPY CULT',    short:'ENTROPY',    color:'#c4723a', img:'assets/avatars/entropy.png'    },
    void:       { name:'VOID HUNTERS',    short:'VOID',       color:'#9b59b6', img:'assets/avatars/void.png'      },
    gas:        { name:'GAS NOMADS',      short:'GAS',        color:'#ffd700', img:'assets/avatars/gas.png'        },
    lithos:     { name:'THE LITHOS',      short:'LITHOS',     color:'#a0896a', img:'assets/avatars/lithos.png'     },
    quantum:    { name:'QUANTUM THREAD',  short:'QUANTUM',    color:'#ff69b4', img:'assets/avatars/quantum.png'    },
    choir:      { name:'THE CHOIR',       short:'CHOIR',      color:'#c8c8ff', img:'assets/avatars/choir.png'      },
  };
  const shared = (typeof window !== 'undefined' && window.GZ_FACTIONS) || {};
  Object.keys(defs).forEach(k => {
    const s = shared[k];
    if (!s) return;
    if (typeof s.name  === 'string' && s.name)  defs[k].name  = s.name;
    if (typeof s.color === 'string' && s.color) defs[k].color = s.color;
  });
  return defs;
})();
const _LB_ORDER = ['terran','brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'];

// ── Remote-data sanitizers ────────────────────────────────────────────────────
// Supabase rows are attacker-writable (shipped anon key), so every value that
// came from — or may have been merged from — the network is sanitized both at
// merge time and again at render time before touching innerHTML.
function _lbSanitizeInitials(v) {
  const s = String(v == null ? '' : v).toUpperCase();
  return /^[A-Z-]{1,3}$/.test(s) ? s : '???';
}
// Returns an integer delta in 1..100, or null (caller must discard the row).
function _lbSanitizeDelta(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < 1 || i > 100) return null;
  return i;
}
// Whitelist faction keys coming from remote rows / URL params.
function _lbValidFaction(k) {
  return typeof k === 'string' && Object.prototype.hasOwnProperty.call(_LB_FACTIONS, k);
}
function _lbSanitizeMode(m) { return m === 'pvp' ? 'pvp' : 'pve'; }

let _lbActiveFaction = 'terran'; // which player faction tab is active; 'achievements' for badge gallery

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
  // Faction ids can arrive via URL params in multiplayer — whitelist them
  // before they reach any innerHTML sink.
  if (!_lbValidFaction(playerFaction) || !_lbValidFaction(aiFaction)) return;
  const delta    = _lbSanitizeDelta(playerVP - aiVP);
  if (delta === null) return;
  const existing = _lbLoad()[_lbKey(playerFaction, aiFaction)];
  if (!existing || delta > (existing.delta || 0)) {
    setTimeout(() => showInitialsEntry(playerFaction, aiFaction, delta, mode || 'pve'), 800);
  }
}
function saveLeaderboardEntry(pFac, aFac, initials, delta, mode) {
  if (!_lbValidFaction(pFac) || !_lbValidFaction(aFac)) return;
  const d = _lbSanitizeDelta(delta);
  if (d === null) return;
  const inits = _lbSanitizeInitials(initials);
  const data = _lbLoad();
  data[_lbKey(pFac, aFac)] = { initials: inits, delta: d, mode: _lbSanitizeMode(mode) };
  _lbSave(data);
  _sbSaveEntry(pFac, aFac, inits, d, mode);
}

// ── Initials entry ────────────────────────────────────────────────────────────
function showInitialsEntry(playerFaction, aiFaction, delta, mode) {
  // Whitelist everything that gets interpolated into markup below.
  if (!_lbValidFaction(playerFaction) || !_lbValidFaction(aiFaction)) return;
  delta = _lbSanitizeDelta(delta);
  if (delta === null) return;
  var _lbMode = _lbSanitizeMode(mode);
  const pF = _LB_FACTIONS[playerFaction];
  const aF = _LB_FACTIONS[aiFaction];

  const el = document.createElement('div');
  el.id = 'lbInitialsOverlay';
  el.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#000000cc;backdrop-filter:blur(6px);';
  el.innerHTML = `
    <style>@media(max-width:480px){.lb-init-card{padding:22px 18px!important}.lb-init-inp{width:48px!important;height:56px!important;font-size:26px!important}}</style>
    <div class="lb-init-card" style="background:linear-gradient(160deg,#0a0818,#06060e);border:1px solid #ffdd0055;border-radius:16px;padding:32px 36px;max-width:380px;width:90%;box-shadow:0 0 60px #ffdd0022,0 24px 80px #000c;text-align:center;font-family:'Courier New',monospace;">
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
        ${[0,1,2].map(i=>`<input id="lbInit${i}" maxlength="1" type="text" class="lb-init-inp" style="width:56px;height:64px;text-align:center;background:#0a0a18;border:2px solid #ffdd0044;color:#ffdd00;font-size:32px;font-weight:700;font-family:'Orbitron',monospace;border-radius:8px;caret-color:transparent;text-transform:uppercase;outline:none;">`).join('')}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="_lbSkipInitials()" style="padding:10px 24px;border-radius:6px;cursor:pointer;background:transparent;border:1px solid #222244;color:#444466;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;transition:all 0.2s;" onmouseenter="this.style.borderColor='#555577';this.style.color='#8888aa'" onmouseleave="this.style.borderColor='#222244';this.style.color='#444466'">SKIP</button>
        <button onclick="_lbSubmitInitials('${playerFaction}','${aiFaction}',${delta},'${_lbMode}')" style="padding:10px 28px;border-radius:6px;cursor:pointer;background:linear-gradient(135deg,#aa8800,#776600);border:1px solid #ffdd0077;color:#ffdd00;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;box-shadow:0 0 18px #ffdd0033;transition:all 0.2s;" onmouseenter="this.style.boxShadow='0 0 28px #ffdd0066'" onmouseleave="this.style.boxShadow='0 0 18px #ffdd0033'">SUBMIT</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  _lbRegisterModal(el, () => el.remove()); // Escape = skip (no save)

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
function _lbSkipInitials() {
  const ov = document.getElementById('lbInitialsOverlay');
  if (!ov) return;
  if (_lbCloseViaRegistry(ov)) return;
  ov.remove();
}
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
  if (ov && !_lbCloseViaRegistry(ov)) ov.parentNode.removeChild(ov);
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
    // Render-time sanitization: entries may have been merged from remote data
    // (or poisoned localStorage from an older build) — never trust them here.
    let entry   = data[_lbKey(pId, aId)];
    let delta   = entry ? _lbSanitizeDelta(entry.delta) : null;
    if (delta === null) entry = null; // discard rows with invalid deltas
    const has   = !!entry;
    const inits = has ? _lbSanitizeInitials(entry.initials) : 'AAA';
    const isPvP = has && _lbSanitizeMode(entry.mode) === 'pvp';

    return `
      <div class="lb-row" style="
        display:flex;align-items:center;gap:0;
        padding:0 24px;height:54px;
        border-bottom:1px solid #0a0a16;
        transition:background 0.12s;
        ${has ? `background:${aF.color}08;` : ''}
      "
      onmouseenter="this.style.background='${has ? aF.color+'14' : '#ffffff08'}'"
      onmouseleave="this.style.background='${has ? aF.color+'08' : 'transparent'}'">

        <!-- Opponent -->
        <div class="lb-opp-gap" style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
          <div class="lb-vs" style="font-size:10px;letter-spacing:2px;color:#778899;font-family:'Courier New',monospace;flex-shrink:0;width:20px;text-align:right;">vs</div>
          <img src="${aF.img}" class="lb-opp-img" style="width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${aF.color}${has?'cc':'55'};flex-shrink:0;${has?`box-shadow:0 0 12px ${aF.color}44;`:''}">
          <div class="lb-opp-name" style="font-family:'Orbitron',monospace;font-size:11px;letter-spacing:1px;color:${has?aF.color:'#aabbcc'};font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aF.short}</div>
        </div>

        <!-- Initials + mode badge -->
        <div class="lb-init-col" style="width:82px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;">
          <div class="lb-init-val" style="font-family:'Orbitron',monospace;font-weight:900;letter-spacing:3px;font-size:17px;color:${has?'#ffdd00':'#ffffff33'};${has?'text-shadow:0 0 12px #ffdd0055;':''}">${inits}</div>
          ${has ? `<div class="lb-init-badge" style="font-size:7px;letter-spacing:2px;font-family:'Courier New',monospace;padding:1px 5px;border-radius:3px;${isPvP?'color:#cc88ff;background:#8855ff18;border:1px solid #8855ff44;':'color:#00ffcc88;background:#00ffcc08;border:1px solid #00ffcc22;'}">${isPvP?'PvP':'PvE'}</div>` : ''}
        </div>

        <!-- Divider -->
        <div class="lb-divider" style="width:1px;height:28px;background:#0d0d1a;flex-shrink:0;margin:0 6px;"></div>

        <!-- Delta -->
        <div class="lb-delta-col" style="
          width:72px;text-align:right;flex-shrink:0;
          font-family:'Courier New',monospace;font-size:12px;letter-spacing:1px;
          color:${has?'#00ffcc':'#ffffff33'};
          ${has?'text-shadow:0 0 8px #00ffcc33;':''}
        ">${delta!==null?'+'+delta+' VP':'--'}</div>
      </div>`;
  }).join('');

  // Faction tab pills
  const _achivCount = typeof getUnlockedAchievements === 'function' ? getUnlockedAchievements().size : 0;
  const _achivTotal = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS.length : 80;
  const tabsHtml = _LB_ORDER.map(id => {
    const f      = _LB_FACTIONS[id];
    const active = id === pId;
    const recs   = _LB_ORDER.filter(a=>a!==id&&data[_lbKey(id,a)]).length;
    return `
      <div onclick="_lbSetTab('${id}')" class="lb-tab" style="
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
        <img src="${f.img}" class="${active?'lb-tab-img-a':'lb-tab-img'}" style="width:${active?'38px':'30px'};height:${active?'38px':'30px'};border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${active?f.color:f.color+'44'};transition:all 0.15s;${active?`box-shadow:0 0 14px ${f.color}55;`:''}">
        ${recs > 0 ? `<div style="font-size:8px;color:${active?f.color:'#aabbcc'};font-family:'Courier New',monospace;letter-spacing:1px;">${recs}/10</div>` : `<div style="font-size:8px;color:#445566;font-family:'Courier New',monospace;">-</div>`}
      </div>`;
  }).join('') + `
    <div onclick="_lbSetTab('achievements')" class="lb-tab" style="
      display:flex;flex-direction:column;align-items:center;gap:4px;
      padding:8px 10px;cursor:pointer;border-radius:8px;flex-shrink:0;
      transition:all 0.15s;border-bottom:2px solid transparent;"
    onmouseenter="this.style.background='#ffdd0011'"
    onmouseleave="this.style.background='transparent'"
    data-id="achievements">
      <div style="width:30px;height:30px;border-radius:50%;background:#ffdd0011;border:2px solid #ffdd0044;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all 0.15s;">✦</div>
      <div style="font-size:8px;color:#ffdd0088;font-family:'Courier New',monospace;letter-spacing:1px;">${_achivCount}/${_achivTotal}</div>
    </div>`;

  const modal = document.createElement('div');
  modal.id = 'lbModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:#000000bb;backdrop-filter:blur(8px);padding:20px;';

  modal.innerHTML = `<div id="lbInner" style="display:flex;flex-direction:column;width:100%;max-width:780px;height:100%;max-height:90vh;background:#020208;border:1px solid #1a1a2a;border-radius:14px;overflow:hidden;box-shadow:0 24px 80px #000000cc;">

    <style>
      #lbModal ::-webkit-scrollbar{width:4px;height:4px}
      #lbModal ::-webkit-scrollbar-track{background:transparent}
      #lbModal ::-webkit-scrollbar-thumb{background:#1a1a38;border-radius:2px}
      @keyframes lbFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:600px){
        #lbModal{padding:8px!important}
        #lbInner{border-radius:10px!important}
        .lb-tab{padding:5px 4px!important}
        .lb-tab-img{width:22px!important;height:22px!important}
        .lb-tab-img-a{width:28px!important;height:28px!important}
        .lb-fac-hdr{padding:8px 12px!important;gap:10px!important}
        .lb-fac-avatar{width:38px!important;height:38px!important}
        .lb-fac-name{font-size:11px!important;letter-spacing:1px!important}
        .lb-fac-sub{display:none!important}
        .lb-col-hdr{padding:5px 12px!important}
        .lb-col-init{width:60px!important;font-size:8px!important;letter-spacing:1px!important}
        .lb-col-delta{width:52px!important;font-size:8px!important;letter-spacing:1px!important}
        .lb-row{padding:0 12px!important;height:46px!important}
        .lb-vs{width:12px!important;font-size:8px!important;letter-spacing:0!important}
        .lb-opp-gap{gap:7px!important}
        .lb-opp-img{width:28px!important;height:28px!important}
        .lb-opp-name{font-size:9px!important;letter-spacing:0!important}
        .lb-init-col{width:60px!important}
        .lb-init-val{font-size:13px!important;letter-spacing:2px!important}
        .lb-init-badge{font-size:6px!important;padding:1px 3px!important}
        .lb-divider{display:none!important}
        .lb-delta-col{width:52px!important;font-size:11px!important}
      }
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
    <div class="lb-fac-hdr" style="flex-shrink:0;padding:14px 24px 12px;background:linear-gradient(90deg,${pF.color}14 0%,transparent 60%);border-bottom:1px solid ${pF.color}22;display:flex;align-items:center;gap:16px;">
      <img src="${pF.img}" class="lb-fac-avatar" style="width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${pF.color};box-shadow:0 0 20px ${pF.color}55;flex-shrink:0;">
      <div style="min-width:0;flex:1;">
        <div class="lb-fac-name" style="font-family:'Orbitron',monospace;font-size:14px;font-weight:900;letter-spacing:3px;color:${pF.color};text-shadow:0 0 16px ${pF.color}55;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pF.name}</div>
        <div class="lb-fac-sub" style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8899bb;margin-top:3px;">
          PLAYING AS THIS FACTION · ${facRecords} / 10 RECORDS SET
        </div>
      </div>
      <div style="flex-shrink:0;text-align:right;">
        <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:#778899;">TOTAL</div>
        <div style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;color:${total>0?'#ffdd00':'#aabbcc'};${total>0?'text-shadow:0 0 10px #ffdd0044;':''}">${total}<span style="font-size:10px;color:#778899;"> /110</span></div>
      </div>
    </div>

    <!-- Column labels -->
    <div class="lb-col-hdr" style="flex-shrink:0;display:flex;align-items:center;gap:0;padding:6px 24px;background:#020208;border-bottom:1px solid #0a0a16;">
      <div style="flex:1;font-size:10px;letter-spacing:3px;color:#aabbcc;font-family:'Courier New',monospace;">OPPONENT</div>
      <div class="lb-col-init" style="width:70px;text-align:center;font-size:10px;letter-spacing:2px;color:#aabbcc;font-family:'Courier New',monospace;">INITIALS</div>
      <div class="lb-divider" style="width:7px;"></div>
      <div class="lb-col-delta" style="width:72px;text-align:right;font-size:10px;letter-spacing:2px;color:#aabbcc;font-family:'Courier New',monospace;">WIN BY</div>
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
  _lbRegisterModal(modal, () => _lbDoHide(modal));

  // Scroll active faction tab into view (important on mobile where tabs overflow)
  setTimeout(() => {
    const activeTab = modal.querySelector(`[data-id="${pId}"]`);
    if (activeTab) activeTab.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
  }, 30);

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
      // Merge-time sanitization (defense in depth — _sbFetchFaction already
      // scrubbed, but nothing unvalidated may enter localStorage).
      if (!_lbValidFaction(aFac)) return;
      const delta = _lbSanitizeDelta(entry && entry.delta);
      if (delta === null) return;
      const k = _lbKey(_fetchFaction, aFac);
      if (!local[k] || delta > (_lbSanitizeDelta(local[k].delta) || 0)) {
        local[k] = { initials: _lbSanitizeInitials(entry.initials), delta, mode: _lbSanitizeMode(entry.mode) };
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
  if (id === 'achievements') {
    _lbRenderAchievementsPanel();
  } else {
    _lbRenderModal();
  }
}

// ── Achievements panel (replaces inner content without full re-render) ─────────
function _lbRenderAchievementsPanel() {
  // Full re-render with achievements view active
  document.getElementById('lbModal')?.remove();
  const unlocked = typeof getUnlockedAchievements === 'function' ? getUnlockedAchievements() : new Set();
  const allDefs   = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : [];
  const total     = allDefs.length;
  const count     = unlocked.size;
  const sessionNew = new Set(window._achievSessionUnlocks || []);

  // Tab pills (faction tabs + achievements tab)
  const data = _lbLoad();
  const tabsHtml = _LB_ORDER.map(id => {
    const f = _LB_FACTIONS[id];
    const recs = _LB_ORDER.filter(a=>a!==id&&data[_lbKey(id,a)]).length;
    return `
      <div onclick="_lbSetTab('${id}')" class="lb-tab" style="
        display:flex;flex-direction:column;align-items:center;gap:4px;
        padding:8px 10px;cursor:pointer;border-radius:8px;flex-shrink:0;
        transition:all 0.15s;border-bottom:2px solid transparent;"
      onmouseenter="this.style.background='${f.color}11'"
      onmouseleave="this.style.background='transparent'"
      data-id="${id}">
        <img src="${f.img}" class="lb-tab-img" style="width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${f.color}44;transition:all 0.15s;">
        ${recs > 0 ? `<div style="font-size:8px;color:#aabbcc;font-family:'Courier New',monospace;letter-spacing:1px;">${recs}/10</div>` : `<div style="font-size:8px;color:#445566;font-family:'Courier New',monospace;">-</div>`}
      </div>`;
  }).join('') + `
    <div onclick="_lbSetTab('achievements')" class="lb-tab" style="
      display:flex;flex-direction:column;align-items:center;gap:4px;
      padding:8px 10px;cursor:pointer;border-radius:8px;flex-shrink:0;
      transition:all 0.15s;background:#ffdd0022;border-bottom:2px solid #ffdd00;"
    data-id="achievements">
      <div style="width:30px;height:30px;border-radius:50%;background:#ffdd0022;border:2px solid #ffdd00;display:flex;align-items:center;justify-content:center;font-size:16px;">✦</div>
      <div style="font-size:8px;color:#ffdd00;font-family:'Courier New',monospace;letter-spacing:1px;">${count}/${total}</div>
    </div>`;

  // Badge grid
  const badgesHtml = allDefs.map(a => {
    const isUnlocked = unlocked.has(a.id);
    const isNew = sessionNew.has(a.id);
    const tooltipText = isUnlocked
      ? `<b>${a.name}</b><br>${a.desc}`
      : `<b>${a.name}</b><br>HOW TO UNLOCK:<br>${a.desc}`;
    return `
      <div class="lb-badge-cell" data-id="${a.id}"
        style="position:relative;width:56px;height:56px;flex-shrink:0;cursor:pointer;"
        onmouseenter="_lbShowBadgeTip(this,'${a.id}',${isUnlocked})"
        onmouseleave="_lbHideBadgeTip()"
        onclick="_lbBadgeClick(this,'${a.id}',${isUnlocked},event)">
        <img src="badges-sm/${a.id}.webp" alt="${a.name || a.id}"
          style="width:100%;height:100%;border-radius:8px;object-fit:cover;
            ${isUnlocked
              ? `border:2px solid ${isNew ? '#ffdd00' : '#00ffcc44'};
                 box-shadow:${isNew ? '0 0 12px #ffdd0077,0 0 24px #ffdd0033' : '0 0 8px #00ffcc33'};
                 ${isNew ? 'animation:lbBadgePulse 1.5s ease-in-out infinite;' : ''}`
              : 'filter:grayscale(1) brightness(0.35);border:2px solid #1a1a28;'}"
          onerror="this.style.background='#0a0a18';this.style.content='';this.alt='${a.id}'">
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
      @keyframes lbBadgePulse{0%,100%{box-shadow:0 0 12px #ffdd0077,0 0 24px #ffdd0033}50%{box-shadow:0 0 20px #ffdd00bb,0 0 40px #ffdd0066}}
      @media(max-width:600px){
        #lbModal{padding:8px!important}
        #lbInner{border-radius:10px!important}
        .lb-tab{padding:5px 4px!important}
        .lb-tab-img{width:22px!important;height:22px!important}
        .lb-badge-cell{width:44px!important;height:44px!important}
        .lb-badge-grid{gap:8px!important;padding:12px!important;justify-content:center!important}
      }
      @media(max-width:380px){
        .lb-badge-cell{width:38px!important;height:38px!important}
        .lb-badge-grid{gap:6px!important;padding:8px!important}
      }
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

    <!-- Tabs -->
    <div style="flex-shrink:0;border-bottom:1px solid #0d0d1a;background:#030310;overflow-x:auto;scrollbar-width:none;">
      <div style="display:flex;gap:2px;padding:6px 14px 0;min-width:max-content;">
        ${tabsHtml}
      </div>
    </div>

    <!-- Achievements header -->
    <div style="flex-shrink:0;padding:14px 24px 12px;background:linear-gradient(90deg,#ffdd0014 0%,transparent 60%);border-bottom:1px solid #ffdd0022;display:flex;align-items:center;gap:16px;">
      <div style="font-size:32px;line-height:1;">✦</div>
      <div style="flex:1;">
        <div style="font-family:'Orbitron',monospace;font-size:14px;font-weight:900;letter-spacing:3px;color:#ffdd00;text-shadow:0 0 16px #ffdd0055;">ACHIEVEMENTS</div>
        <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8899bb;margin-top:3px;">GALACTIC ZERO · UNLOCK HISTORY</div>
      </div>
      <div style="flex-shrink:0;text-align:right;">
        <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:#778899;">UNLOCKED</div>
        <div style="font-family:'Orbitron',monospace;font-size:18px;font-weight:700;color:${count>0?'#ffdd00':'#aabbcc'};${count>0?'text-shadow:0 0 10px #ffdd0044;':''}">${count}<span style="font-size:10px;color:#778899;"> /${total}</span></div>
      </div>
    </div>

    <!-- Badge grid -->
    <div style="flex:1;overflow-y:auto;overflow-x:hidden;animation:lbFadeIn 0.2s ease;">
      <div class="lb-badge-grid" style="display:flex;flex-wrap:wrap;gap:10px;padding:16px 20px;justify-content:flex-start;">
        ${badgesHtml}
      </div>
    </div>

    <!-- Tooltip container (positioned absolutely) -->
    <div id="lbBadgeTip" style="display:none;position:fixed;z-index:99999;background:#0a0a18ee;border:1px solid #ffdd0044;border-radius:8px;padding:8px 12px;font-family:'Courier New',monospace;font-size:11px;color:#eee;max-width:200px;line-height:1.5;pointer-events:none;box-shadow:0 4px 20px #000c;"></div>

    <!-- Footer -->
    <div style="flex-shrink:0;padding:10px 20px;border-top:1px solid #0a0a14;background:#020208;display:flex;align-items:center;justify-content:flex-end;">
      <button onclick="hideLeaderboard()" style="padding:10px 28px;border-radius:6px;cursor:pointer;background:transparent;border:1px solid #334466;color:#aabbdd;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;transition:all 0.2s;"
        onmouseenter="this.style.borderColor='#8855ff';this.style.color='#fff';this.style.background='#8855ff22'"
        onmouseleave="this.style.borderColor='#334466';this.style.color='#aabbdd';this.style.background='transparent'">✕ CLOSE</button>
    </div>
  </div>`;

  document.body.appendChild(modal);
  _lbRegisterModal(modal, () => _lbDoHide(modal));

  const _lb = document.getElementById('mobileLaunchBar') || document.getElementById('desktopLaunchBar');
  if (_lb) _lb.style.display = 'none';

  // Scroll achievements tab into view
  setTimeout(() => {
    const activeTab = modal.querySelector('[data-id="achievements"]');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
  }, 30);
}

function _lbBadgeTipContent(id, isUnlocked) {
  const allDefs = typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : [];
  const a = allDefs.find(x => x.id === id);
  if (!a) return '';
  const isHidden = a.id.startsWith('hidden') && !isUnlocked;
  return isUnlocked
    ? `<b style="color:#ffdd00;font-size:12px;">${a.name}</b><br><span style="color:#aabbcc;font-size:10px;">${a.desc}</span>`
    : `<b style="color:#667788;font-size:12px;">${isHidden ? '???' : a.name}</b><br><span style="color:#445566;font-size:10px;">HOW TO UNLOCK:<br>${isHidden ? '???' : a.desc}</span>`;
}

function _lbPositionTip(tip, el) {
  const rect = el.getBoundingClientRect();
  const margin = 8;
  tip.style.display = 'block';
  tip.style.visibility = 'hidden';
  // Measure after display
  requestAnimationFrame(() => {
    const tw = tip.offsetWidth || 200;
    const th = tip.offsetHeight || 60;
    let left = rect.left + (rect.width / 2) - tw / 2;
    if (left < margin) left = margin;
    if (left + tw > window.innerWidth - margin) left = window.innerWidth - margin - tw;
    const topAbove = rect.top - th - 6;
    const topBelow = rect.bottom + 6;
    tip.style.left = left + 'px';
    tip.style.top = (topAbove < margin ? topBelow : topAbove) + 'px';
    tip.style.visibility = 'visible';
  });
}

function _lbShowBadgeTip(el, id, isUnlocked) {
  // Hover-less devices are handled by tap/click; touch-capable laptops with a
  // mouse still get hover tips ('ontouchstart' would wrongly disable them).
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  const tip = document.getElementById('lbBadgeTip');
  if (!tip) return;
  tip.innerHTML = _lbBadgeTipContent(id, isUnlocked);
  _lbPositionTip(tip, el);
}

function _lbHideBadgeTip() {
  const tip = document.getElementById('lbBadgeTip');
  if (tip && !tip._pinned) tip.style.display = 'none';
}

let _lbTipPinnedId = null;
function _lbBadgeClick(el, id, isUnlocked, evt) {
  evt && evt.stopPropagation();
  const tip = document.getElementById('lbBadgeTip');
  if (!tip) return;
  if (_lbTipPinnedId === id) {
    // Second tap on same badge: dismiss
    tip.style.display = 'none';
    tip._pinned = false;
    _lbTipPinnedId = null;
    return;
  }
  tip.innerHTML = _lbBadgeTipContent(id, isUnlocked);
  tip._pinned = true;
  _lbTipPinnedId = id;
  _lbPositionTip(tip, el);
  // Dismiss if user taps elsewhere
  setTimeout(() => {
    const dismiss = (e) => {
      if (!el.contains(e.target)) {
        tip.style.display = 'none';
        tip._pinned = false;
        _lbTipPinnedId = null;
        document.removeEventListener('click', dismiss, { capture: true });
        document.removeEventListener('touchstart', dismiss, { capture: true });
      }
    };
    document.addEventListener('click', dismiss, { capture: true, once: true });
    document.addEventListener('touchstart', dismiss, { capture: true, once: true });
  }, 0);
}

function hideLeaderboard() {
  const m = document.getElementById('lbModal');
  if (!m) return;
  if (_lbCloseViaRegistry(m)) return; // registry invoked _lbDoHide already
  _lbDoHide(m);
}

// The actual close work — invoked via the modal registry (game.html) or
// directly (index.html). Never calls gzModalClose to avoid recursion.
function _lbDoHide(m) {
  if (!m || !document.contains(m)) return;
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
