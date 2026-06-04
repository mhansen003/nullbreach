function _mobileDims() {
  if (window.innerWidth > 480) return null;
  return { cw:44, ch:52, gap:2, sw:46, sh:54 };
}

function hasPlacedTier(tier) {


  return G.playerHand.some(c =>


    c.tier === tier && c.used &&


    G.grid.flat().some(cell => cell.card?.id === c.id && cell.owner === 'player')


  );


}

function addLog(type, msg) {


  G.log.unshift({type, msg});


  document.getElementById('logEntries').innerHTML =


    G.log.slice(0,18).map(e=>`<div class="log-entry ${e.type}">${e.msg}</div>`).join('');


}

function ab(a) {


  return {


    shield:'SHD', phantom:'PHT', chain:'CHN', double_strike:'DBL',


    intimidate:'INT', mirror:'MRR', ambush:'AMB', stonewall:'STW',


    sniper:'SNP', birthright:'BRT', deciding_factor:'DF', echo:'ECH',


    overwhelm:'OVR', density:'DNS', hat_trick:'HAT', edge_play:'EPY',


    boost:'BST', commander:'CMD', sweep:'SWP', flank:'FLK',


    rush:'RSH', pierce:'PRC', spawn:'SPN', surge:'SRG'


  }[a] || (a ? a.slice(0,3).toUpperCase() : '');


}

function showToast(msg, color='#ffcc00', duration=1800) {


  const el = document.createElement('div');


  el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);


    z-index:200000;font-family:'Orbitron',monospace;font-size:16px;letter-spacing:4px;


    color:${color};text-shadow:0 0 20px ${color};background:#000000dd;


    padding:14px 28px;border:1px solid ${color}66;border-radius:8px;


    transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s;


    pointer-events:none;`;


  el.textContent = msg;


  document.body.appendChild(el);


  requestAnimationFrame(() => requestAnimationFrame(() => {


    el.style.transform = 'translate(-50%,-50%) scale(1)';


  }));


  setTimeout(() => {


    el.style.transition = 'opacity 0.3s'; el.style.opacity = '0';


    setTimeout(() => el.remove(), 300);


  }, duration);


}

function seededRand(seed) {


  let s = seed;


  return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };


}
