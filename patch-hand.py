"""Rebuild renderHand with inline expandable card stacks matching the wireframe."""
with open('game.html', 'r', encoding='utf-8') as f:
    g = f.read()

# 1. Fix .hand-cards CSS back to horizontal row
OLD_CSS = """.hand-cards {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; width: 100%; max-width: 900px;
}
.hand-tier-tray {
  display: flex; gap: 8px; align-items: flex-end;
  overflow-x: auto; overflow-y: visible; flex-wrap: nowrap;
  max-width: 100%; padding: 4px 4px 6px;
  scrollbar-width: thin; scrollbar-color: #2a2a3a transparent;
  min-height: 152px; justify-content: center;
}
.hand-tier-tray::-webkit-scrollbar { height: 3px; }
.hand-tier-tray::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
.hand-tier-nav { display: flex; gap: 8px; align-items: center; }"""

NEW_CSS = """.hand-cards {
  display: flex; flex-direction: row; align-items: flex-end;
  gap: 14px; overflow-x: auto; overflow-y: visible;
  max-width: 100%; padding: 10px 4px 6px;
  scrollbar-width: thin; scrollbar-color: #2a2a3a transparent;
}
.hand-cards::-webkit-scrollbar { height: 3px; }
.hand-cards::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }"""

if OLD_CSS in g:
    g = g.replace(OLD_CSS, NEW_CSS)
    print("CSS updated")
else:
    print("WARNING: CSS not found")

# 2. Replace renderHand function
start = g.index('function renderHand() {')
end   = g.index('\nfunction renderAiHand()')
print(f"Replacing renderHand ({end-start} chars)")

NEW_FN = r'''function renderHand() {
  const el = document.getElementById('handCards');
  el.innerHTML = '';
  const TIER_ORDER = {'I':1,'II':2,'III':3,'IV':4};
  const unplayed = G.playerHand.filter(c => !c.used)
    .sort((a,b) => (TIER_ORDER[a.tier]||9) - (TIER_ORDER[b.tier]||9));

  const eligible   = unplayed.filter(c => getValidPlacements('player', c).length > 0);
  const ineligible = unplayed.filter(c => getValidPlacements('player', c).length === 0);

  const eligibleNow = new Set(eligible.map(c => c.id));
  const prev = G._prevEligibleIds;
  const newlyEligible = (prev instanceof Set) ? eligible.filter(c => !prev.has(c.id)) : [];
  if (newlyEligible.length > 0 && prev instanceof Set) setTimeout(playCardPopSfx, 40);
  G._prevEligibleIds = eligibleNow;

  const factionC = window.playerFactionColor || '#00ffcc';

  const byTier = {I:[],II:[],III:[],IV:[]};
  eligible.forEach(c => (byTier[c.tier]=byTier[c.tier]||[]).push(c));
  const inelByTier = {I:0,II:0,III:0,IV:0};
  ineligible.forEach(c => inelByTier[c.tier]=(inelByTier[c.tier]||0)+1);

  // Auto-select lowest eligible tier; respect selected card's tier
  if (!window._activeTier || !byTier[window._activeTier]?.length) {
    window._activeTier = ['I','II','III','IV'].find(t=>byTier[t]?.length>0) || 'I';
  }
  if (G.selectedCard && G.selectedCard.tier) window._activeTier = G.selectedCard.tier;

  // Build a full-size hand card div
  function buildCard(card, idx) {
    const isNew = newlyEligible.some(c => c.id === card.id);
    const isSel = G.selectedCard === card;
    const tCol  = TIER_COLORS[card.tier] || '#888888';
    const tdNum = TIER_ORDER[card.tier] || 1;
    const div   = document.createElement('div');
    div.className = 'hand-card' + (isSel ? ' selected' : '');
    if (isNew) { div.classList.add('card-pop-in'); div.style.animationDelay = (idx*55)+'ms'; }
    if (card.art) div.style.backgroundImage = "url('" + card.art + "')";
    const ag = card.ability ? ', inset 0 0 24px #ff0000ee, inset 0 0 8px #ff0000cc' : '';
    div.style.borderColor = card.ability ? '#ff3333' : factionC;
    div.style.boxShadow   = isSel
      ? '0 0 22px ' + (card.ability?'#ff3333':factionC) + '88, 0 0 44px ' + (card.ability?'#ff3333':factionC) + '44' + ag
      : '0 0 10px ' + (card.ability?'#ff333344':factionC+'33') + ag;
    div.innerHTML =
      '<span class="hc-e-n" style="color:'+factionC+'">'+card.edges.n+'</span>' +
      '<span class="hc-e-s" style="color:'+factionC+'">'+card.edges.s+'</span>' +
      '<span class="hc-e-w" style="color:'+factionC+'">'+card.edges.w+'</span>' +
      '<span class="hc-e-e" style="color:'+factionC+'">'+card.edges.e+'</span>' +
      '<div style="position:absolute;top:4px;left:4px;display:flex;gap:2px;z-index:2;">' +
        Array.from({length:tdNum},function(){return '<span style="width:5px;height:5px;border-radius:50%;background:'+tCol+';box-shadow:0 0 3px '+tCol+';display:inline-block;"></span>';}).join('') +
      '</div>' +
      '<div class="hc-center"><span class="hc-power-center" style="color:'+factionC+'">'+card.power+'</span></div>' +
      (card.ability ? '<span class="hc-ability-tag" style="color:'+factionC+'">'+ab(card.ability)+'</span>' : '');
    div.onclick      = function() { onCardSelect(card); };
    div.onmouseenter = function(e) { showTip(e, card); };
    div.onmouseleave = hideTip;
    div.draggable    = true;
    div.addEventListener('dragstart', function(e) {
      onCardSelect(card);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id);
    });
    return div;
  }

  // Build a collapsed stack thumbnail for a tier
  function buildStack(tier, cards, locked) {
    const tCol    = TIER_COLORS[tier] || '#888';
    const tNum    = TIER_ORDER[tier];
    const canOpen = cards.length > 0;
    // Shadow cards: 1 shadow for 2 cards, 2 shadows for 3+ cards
    const shadows = Math.min(Math.max(cards.length - 1, 0), 2);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:106px;height:140px;flex-shrink:0;cursor:'+(canOpen?'pointer':'default')+';transition:transform 0.15s;';

    // Shadow offset cards
    for (var i = shadows; i >= 1; i--) {
      var sh = document.createElement('div');
      sh.style.cssText = 'position:absolute;top:'+(-i*5)+'px;left:'+(i*5)+'px;width:106px;height:140px;border-radius:6px;background:#0a0a1a;border:1px solid '+tCol+'22;opacity:'+(0.6-i*0.15)+';';
      wrap.appendChild(sh);
    }

    // Front card
    var front = document.createElement('div');
    front.style.cssText = 'position:absolute;top:0;left:0;width:106px;height:140px;border-radius:6px;background-color:#10101e;background-size:cover;background-position:center top;border:1px solid '+(canOpen?tCol+'55':'#1a1a28')+';box-shadow:'+(canOpen?'0 0 10px '+tCol+'22':'none')+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;transition:border-color 0.2s,box-shadow 0.2s,transform 0.15s;';

    if (cards[0] && cards[0].art) {
      front.style.backgroundImage = "url('"+cards[0].art+"')";
      front.style.backgroundBlendMode = 'luminosity';
      front.style.backgroundColor = '#08081888';
    }

    var dots = Array.from({length:tNum}, function(){
      return '<div style="width:9px;height:9px;border-radius:50%;background:'+(canOpen?tCol:'#2a2a3a')+';box-shadow:'+(canOpen?'0 0 6px '+tCol:'none')+'"></div>';
    }).join('');

    front.innerHTML =
      '<div style="display:flex;gap:4px;">'+dots+'</div>' +
      '<div style="font-family:\'Orbitron\',monospace;font-size:9px;letter-spacing:2px;color:'+(canOpen?tCol:'#2a2a3a')+';">TIER '+tier+'</div>' +
      '<div style="font-size:15px;font-weight:bold;color:'+(canOpen?'#ccc':'#333')+';font-family:\'Courier New\',monospace;">'+cards.length+'</div>' +
      (locked>0 ? '<div style="font-size:8px;color:#444;letter-spacing:1px;">+'+locked+' locked</div>' : '');

    wrap.appendChild(front);

    if (canOpen) {
      wrap.onmouseenter = function() {
        front.style.borderColor = tCol+'aa';
        front.style.boxShadow   = '0 0 20px '+tCol+'55';
        wrap.style.transform    = 'translateY(-5px)';
      };
      wrap.onmouseleave = function() {
        front.style.borderColor = tCol+'55';
        front.style.boxShadow   = '0 0 10px '+tCol+'22';
        wrap.style.transform    = '';
      };
      wrap.onclick = function() { window._activeTier = tier; renderHand(); };
    }
    return wrap;
  }

  // Build the row: collapsed stacks + one expanded tier inline
  ['I','II','III','IV'].forEach(function(tier) {
    var cards  = byTier[tier]  || [];
    var locked = inelByTier[tier] || 0;
    if (cards.length + locked === 0) return;

    var isActive = window._activeTier === tier;
    var tCol     = TIER_COLORS[tier] || '#888';

    if (isActive && cards.length > 0) {
      // EXPANDED: fan out all cards individually
      cards.forEach(function(card, idx) {
        var div = buildCard(card, idx);
        // Extra tier-color border to show this tier is active
        var ag2 = card.ability ? ', inset 0 0 24px #ff0000ee' : '';
        var borderC = card.ability ? '#ff3333' : tCol;
        div.style.borderColor = borderC;
        div.style.boxShadow   = G.selectedCard===card
          ? '0 0 22px '+borderC+'88, 0 0 44px '+borderC+'44'+ag2
          : '0 0 14px '+borderC+'66, 0 0 0 1px '+borderC+'44'+ag2;
        el.appendChild(div);
      });
    } else {
      // COLLAPSED: show as stacked thumbnail
      el.appendChild(buildStack(tier, cards, locked));
    }
  });
}'''

g = g[:start] + NEW_FN + g[end:]

with open('game.html', 'w', encoding='utf-8') as f:
    f.write(g)
print("renderHand rebuilt successfully")
