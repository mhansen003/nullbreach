// ── LEADERBOARD — Hall of Champions ──────────────────────────────────────────

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

let _lbFilterFaction = null; // null = show all

// ── Storage ───────────────────────────────────────────────────────────────────
function _lbLoad() {
  try { return JSON.parse(localStorage.getItem(_LB_KEY) || '{}'); } catch(e) { return {}; }
}
function _lbSave(data) {
  try { localStorage.setItem(_LB_KEY, JSON.stringify(data)); } catch(e) {}
}
function _lbKey(p, a) { return p + '_vs_' + a; }

// ── Win hook ──────────────────────────────────────────────────────────────────
function checkLeaderboardRecord(playerFaction, aiFaction, playerVP, aiVP) {
  if (!playerFaction || !aiFaction || playerVP <= aiVP) return;
  const delta    = playerVP - aiVP;
  const existing = _lbLoad()[_lbKey(playerFaction, aiFaction)];
  if (!existing || delta > (existing.delta || 0)) {
    setTimeout(() => showInitialsEntry(playerFaction, aiFaction, delta), 800);
  }
}
function saveLeaderboardEntry(pFac, aFac, initials, delta) {
  const data = _lbLoad();
  data[_lbKey(pFac, aFac)] = { initials: initials.toUpperCase(), delta };
  _lbSave(data);
}

// ── Initials entry ────────────────────────────────────────────────────────────
function showInitialsEntry(playerFaction, aiFaction, delta) {
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
        <button onclick="_lbSubmitInitials('${playerFaction}','${aiFaction}',${delta})" style="padding:10px 28px;border-radius:6px;cursor:pointer;background:linear-gradient(135deg,#aa8800,#776600);border:1px solid #ffdd0077;color:#ffdd00;font-family:'Orbitron',monospace;font-size:11px;letter-spacing:2px;box-shadow:0 0 18px #ffdd0033;transition:all 0.2s;" onmouseenter="this.style.boxShadow='0 0 28px #ffdd0066'" onmouseleave="this.style.boxShadow='0 0 18px #ffdd0033'">SUBMIT</button>
      </div>
    </div>`;
  document.body.appendChild(el);

  [0,1,2].forEach(i => {
    const inp = document.getElementById('lbInit'+i);
    if (!inp) return;
    if (i===0) setTimeout(()=>inp.focus(),50);
    inp.addEventListener('input', function(){
      this.value = this.value.toUpperCase().replace(/[^A-Z]/g,'');
      if (this.value.length===1 && i<2) document.getElementById('lbInit'+(i+1))?.focus();
    });
    inp.addEventListener('keydown', function(e){
      if (e.key==='Backspace' && !this.value && i>0) document.getElementById('lbInit'+(i-1))?.focus();
    });
    inp.addEventListener('focus',  function(){ this.style.borderColor='#ffdd00'; this.style.boxShadow='0 0 14px #ffdd0055'; });
    inp.addEventListener('blur',   function(){ this.style.borderColor='#ffdd0044'; this.style.boxShadow='none'; });
  });
}
function _lbSkipInitials() { document.getElementById('lbInitialsOverlay')?.remove(); }
function _lbSubmitInitials(pFac, aFac, delta) {
  const a=document.getElementById('lbInit0')?.value||'-';
  const b=document.getElementById('lbInit1')?.value||'-';
  const c=document.getElementById('lbInit2')?.value||'-';
  const initials=(a+b+c).toUpperCase().padEnd(3,'-');
  saveLeaderboardEntry(pFac, aFac, initials, delta);
  document.getElementById('lbInitialsOverlay')?.remove();
  const flash=document.createElement('div');
  flash.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;font-family:"Orbitron",monospace;font-size:20px;letter-spacing:4px;color:#ffdd00;text-shadow:0 0 20px #ffdd00;pointer-events:none;transition:opacity 0.4s;';
  flash.textContent=initials+' · RECORDED';
  document.body.appendChild(flash);
  setTimeout(()=>{flash.style.opacity='0';},900);
  setTimeout(()=>flash.remove(),1400);
}

// ── Leaderboard modal ─────────────────────────────────────────────────────────
function showLeaderboard() {
  if (document.getElementById('lbModal')) return;
  _lbFilterFaction = null;
  _lbRenderModal();
}

function _lbRenderModal() {
  document.getElementById('lbModal')?.remove();
  const data   = _lbLoad();
  const total  = Object.keys(data).length;
  const filter = _lbFilterFaction;

  // Build cards
  const pairs = [];
  _LB_ORDER.forEach(pId => {
    _LB_ORDER.filter(aId=>aId!==pId).forEach(aId => {
      if (filter && pId !== filter) return;
      pairs.push({ pId, aId, entry: data[_lbKey(pId,aId)] || null });
    });
  });

  const cardsHtml = pairs.map(({pId,aId,entry}) => {
    const pF      = _LB_FACTIONS[pId];
    const aF      = _LB_FACTIONS[aId];
    const inits   = entry?.initials || '---';
    const delta   = entry?.delta    ?? null;
    const has     = !!entry;
    const glow    = has ? `box-shadow:0 0 0 1px ${pF.color}33,0 4px 24px ${pF.color}18;` : 'box-shadow:0 0 0 1px #1a1a2a;';

    return `<div style="background:#07070f;border-radius:10px;padding:14px 16px;${glow}transition:transform 0.15s,box-shadow 0.15s;cursor:default;"
      onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 0 0 1px ${pF.color}66,0 8px 32px ${pF.color}22'"
      onmouseleave="this.style.transform='';this.style.boxShadow='${has ? `0 0 0 1px ${pF.color}33,0 4px 24px ${pF.color}18` : '0 0 0 1px #1a1a2a'}'">

      <!-- Factions row -->
      <div style="display:flex;align-items:center;gap:0;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
          <img src="${pF.img}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${pF.color}88;flex-shrink:0;">
          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:1px;color:${pF.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${pF.short}</span>
        </div>
        <div style="font-size:9px;color:#2a2a44;letter-spacing:2px;padding:0 6px;flex-shrink:0;">VS</div>
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;justify-content:flex-end;">
          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:1px;color:${aF.color};overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align:right;">${aF.short}</span>
          <img src="${aF.img}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid ${aF.color}88;flex-shrink:0;">
        </div>
      </div>

      <!-- Record row -->
      <div style="border-top:1px solid #0d0d1a;padding-top:9px;display:flex;align-items:center;justify-content:space-between;">
        <div style="font-family:'Orbitron',monospace;font-size:${has?'18px':'13px'};font-weight:700;letter-spacing:3px;
          color:${has?'#ffdd00':'#2a2a3e'};
          ${has?'text-shadow:0 0 12px #ffdd0066;':''}">
          ${inits}
        </div>
        <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;
          color:${has?'#00ffcc':'#252535'};
          ${has?'text-shadow:0 0 8px #00ffcc44;':''}">
          ${delta!==null?'+'+delta+' VP':'--'}
        </div>
      </div>
    </div>`;
  }).join('');

  // Filter pills
  const pillsHtml = `
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;">
      <div onclick="_lbSetFilter(null)" style="
        padding:5px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;
        font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;transition:all 0.15s;
        ${!_lbFilterFaction?'background:#8855ff33;border:1px solid #8855ff88;color:#cc99ff;':'background:#0a0a18;border:1px solid #1a1a2a;color:#444466;'}
      ">ALL</div>
      ${_LB_ORDER.map(id=>{
        const f=_LB_FACTIONS[id];
        const active=_lbFilterFaction===id;
        return `<div onclick="_lbSetFilter('${id}')" style="
          display:flex;align-items:center;gap:5px;padding:4px 10px 4px 6px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:all 0.15s;
          ${active?`background:${f.color}22;border:1px solid ${f.color}88;`:'background:#0a0a18;border:1px solid #1a1a2a;'}
        ">
          <img src="${f.img}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;object-position:top;border:1px solid ${f.color}66;">
          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:1px;color:${active?f.color:'#444466'};">${f.short}</span>
        </div>`;
      }).join('')}
    </div>`;

  const modal = document.createElement('div');
  modal.id = 'lbModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99990;display:flex;flex-direction:column;background:#020208f8;backdrop-filter:blur(8px);overflow:hidden;';

  modal.innerHTML = `
    <style>
      #lbModal ::-webkit-scrollbar { width:4px; height:4px; }
      #lbModal ::-webkit-scrollbar-track { background:transparent; }
      #lbModal ::-webkit-scrollbar-thumb { background:#1a1a38; border-radius:2px; }
      @keyframes lbFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes lbFlash  { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.85)} 20%{opacity:1;transform:translate(-50%,-50%) scale(1.02)} 70%{opacity:1} 100%{opacity:0} }
    </style>

    <!-- Banner -->
    <div style="position:relative;flex-shrink:0;height:clamp(130px,18vw,220px);overflow:hidden;">
      <img src="assets/leaderboard-banner.png" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;display:block;">
      <div style="position:absolute;inset:0;background:linear-gradient(transparent 25%,#020208f0 100%);"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:18px;">
        <div style="font-family:'Orbitron',monospace;font-size:clamp(20px,3.5vw,38px);font-weight:900;letter-spacing:6px;color:#fff;text-shadow:0 0 40px #ffdd0077,0 2px 12px #000;">HALL OF CHAMPIONS</div>
        <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:5px;color:#ffdd0099;margin-top:5px;">GALACTIC ZERO · FACTION RECORDS</div>
      </div>
      <button onclick="hideLeaderboard()" style="position:absolute;top:12px;right:14px;background:#000000aa;border:1px solid #ffffff22;border-radius:50%;width:36px;height:36px;cursor:pointer;color:#888;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;line-height:1;"
        onmouseenter="this.style.background='#ffffff18';this.style.color='#fff'"
        onmouseleave="this.style.background='#000000aa';this.style.color='#888'">✕</button>
    </div>

    <!-- Stats + filter bar -->
    <div style="flex-shrink:0;padding:12px 20px 10px;border-bottom:1px solid #0d0d1a;background:#020208;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:#333355;">
          <span style="color:${total>0?'#ffdd00':'#333355'};font-size:11px;font-weight:700;">${total}</span>
          <span style="color:#222238;"> / 110 RECORDS SET</span>
        </div>
        <div style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:2px;color:#1e1e2e;">
          ${filter ? `SHOWING: <span style="color:${_LB_FACTIONS[filter]?.color||'#fff'}">${_LB_FACTIONS[filter]?.name||filter}</span>` : 'ALL MATCHUPS'}
        </div>
      </div>
      ${pillsHtml}
    </div>

    <!-- Card grid -->
    <div id="lbGrid" style="flex:1;overflow-y:auto;overflow-x:hidden;padding:16px 20px 24px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;animation:lbFadeIn 0.25s ease;">
        ${cardsHtml || '<div style="color:#222238;font-family:\'Courier New\',monospace;font-size:12px;letter-spacing:2px;grid-column:1/-1;text-align:center;padding:40px;">NO RECORDS YET</div>'}
      </div>
    </div>

    <!-- Footer -->
    <div style="flex-shrink:0;padding:10px 20px;border-top:1px solid #0d0d1a;background:#020208;display:flex;align-items:center;justify-content:flex-end;">
      <button onclick="hideLeaderboard()" style="padding:8px 24px;border-radius:5px;cursor:pointer;background:transparent;border:1px solid #1a1a33;color:#444466;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;transition:all 0.2s;"
        onmouseenter="this.style.borderColor='#8855ff';this.style.color='#aa88ff'"
        onmouseleave="this.style.borderColor='#1a1a33';this.style.color='#444466'">CLOSE</button>
    </div>`;

  document.body.appendChild(modal);
}

function _lbSetFilter(faction) {
  _lbFilterFaction = faction;
  _lbRenderModal();
}

function hideLeaderboard() {
  const m = document.getElementById('lbModal');
  if (!m) return;
  m.style.opacity='0'; m.style.transition='opacity 0.18s';
  setTimeout(()=>m.remove(), 200);
}
