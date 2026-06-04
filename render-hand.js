function renderHand() {
  clearAbilityZone(); suppressZone(400); // prevent mouseenter on rebuilt divs
  // rebuilding hand
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


  const inelByTier = {I:[],II:[],III:[],IV:[]};


  ineligible.forEach(c => (inelByTier[c.tier]=inelByTier[c.tier]||[]).push(c));





  // Auto-select lowest eligible tier; respect selected card's tier


  // undefined = first load; null = user explicitly collapsed; string = tier open
  const _isMobile = window.innerWidth <= 480;
  if (window._activeTier === undefined) {
    // Mobile auto-opens T1; desktop auto-selects lowest eligible tier
    window._activeTier = _isMobile ? 'I' : (['I','II','III','IV'].find(t=>byTier[t]?.length>0) || 'I');
  } else if (window._activeTier && !byTier[window._activeTier]?.length && !inelByTier[window._activeTier]?.length) {
    // Active tier completely empty: collapse on mobile, pick next on desktop
    window._activeTier = _isMobile ? null : (['I','II','III','IV'].find(t=>byTier[t]?.length>0) || null);
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


    div.style.borderColor = factionC;


    div.style.boxShadow   = isSel


      ? '0 0 22px ' + factionC + '88, 0 0 44px ' + factionC + '44'


      : '0 0 10px ' + factionC + '33';


    div.innerHTML =


      '<span class="hc-e-n" style="color:#ffffff">'+card.edges.n+'</span>' +


      '<span class="hc-e-s" style="color:#ffffff">'+card.edges.s+'</span>' +


      '<span class="hc-e-w" style="color:#ffffff">'+card.edges.w+'</span>' +


      '<span class="hc-e-e" style="color:#ffffff">'+card.edges.e+'</span>' +


      (window.innerWidth <= 480
        ? '<div style="position:absolute;top:3px;left:3px;z-index:2;font-family:\'Orbitron\',monospace;font-size:7px;font-weight:700;letter-spacing:1px;color:'+tCol+';text-shadow:0 0 4px '+tCol+'99;">T'+tdNum+'</div>'
        : '<div style="position:absolute;top:4px;left:4px;display:flex;gap:2px;z-index:2;">'+Array.from({length:tdNum},function(){return '<span style="width:5px;height:5px;border-radius:50%;background:'+tCol+';box-shadow:0 0 3px '+tCol+';display:inline-block;"></span>';}).join('')+'</div>') +


      (card.ability ? '<span class="ability-star" style="position:absolute;top:-4px;right:0px;font-size:28px;z-index:6;pointer-events:none;" title="'+ab(card.ability)+'">★</span>' : '') +


      '<div class="hc-center"><span class="hc-power-center" style="color:#ffffff">'+card.power+'</span></div>' +


      '';


    div.onclick      = function() { onCardSelect(card); };


    div.onmouseenter = function(e) { playHoverSfx(); showTip(e, card); };


    div.onmouseleave = hideTip;


    div.draggable    = true;


    div.addEventListener('dragstart', function(e) {


      onCardSelect(card);


      e.dataTransfer.effectAllowed = 'move';


      e.dataTransfer.setData('text/plain', card.id);


    });


    div.addEventListener('dragend', function() {


      // Clean up if drag was cancelled (ESC, drop outside board, etc.)


      setTimeout(() => {


        const ghost = document.getElementById('dragCard');


        if (ghost && ghost.style.display !== 'none' && !G.selectedCard) {


          ghost.style.display = 'none';


          document.body.style.cursor = 'default';


        }


      }, 50);


    });


    // Touch drag-and-drop: document-level listeners so renderHand() re-renders never break the gesture
    if (navigator.maxTouchPoints > 0) {
      div.addEventListener('touchstart', function(e) {
        if (G.turn !== 'player' || card.used) return;
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        const _id = t.identifier;
        const _sx = t.clientX, _sy = t.clientY;
        let _dragging = false, _done = false;

        function _move(e) {
          if (_done) return;
          const touch = Array.from(e.touches).find(tt => tt.identifier === _id);
          if (!touch) return;
          const dx = touch.clientX - _sx, dy = touch.clientY - _sy;
          const ax = Math.abs(dx), ay = Math.abs(dy);

          if (!_dragging) {
            if (ax > ay && ax > 8) { _done = true; _cleanup(); return; } // horizontal = deck scroll
            if (ay > 8) {
              _dragging = true;
              G.selectedCard = card; G._previewCell = null;
              document.body.style.cursor = 'none';
              playSelectSfx();
              showDragCard(card, touch.clientX, touch.clientY);
              showMobileCardPanel(card);
              renderGrid();
              setTimeout(function() { renderHand(); }, 0);
            }
          }
          if (_dragging) {
            updateDragCard(touch.clientX, touch.clientY);
            e.preventDefault();
            const _el = document.elementFromPoint(touch.clientX, touch.clientY);
            const _cell = _el && (_el.classList.contains('cell') ? _el : _el.closest && _el.closest('.cell'));
            if (_cell && _cell.classList.contains('valid') && _cell.dataset.r !== undefined) {
              const _hr = parseInt(_cell.dataset.r), _hc = parseInt(_cell.dataset.c);
              if (!G._previewCell || G._previewCell.r !== _hr || G._previewCell.c !== _hc) {
                applyMobileCellPreview(_hr, _hc, card);
              }
            }
          }
        }

        function _end(e) {
          if (_done && !_dragging) { _cleanup(); return; }
          const touch = Array.from(e.changedTouches).find(tt => tt.identifier === _id);
          if (!touch) return;
          if (_dragging) {
            hideDragCard();
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            const cellEl = el && (el.classList.contains('cell') ? el : el.closest && el.closest('.cell'));
            if (cellEl && cellEl.dataset.r !== undefined) {
              onCellClick(parseInt(cellEl.dataset.r), parseInt(cellEl.dataset.c));
            } else {
              G.selectedCard = null; G._previewCell = null;
              document.body.style.cursor = 'default';
              renderGrid(); renderHand();
            }
            e.preventDefault();
          } else {
            const dx = Math.abs(touch.clientX - _sx), dy = Math.abs(touch.clientY - _sy);
            if (dx < 12 && dy < 12) { onCardSelect(card); e.preventDefault(); }
          }
          _cleanup();
        }

        function _cancel() {
          if (_dragging) {
            hideDragCard();
            if (G.selectedCard === card) {
              G.selectedCard = null; G._previewCell = null;
              document.body.style.cursor = 'default';
              renderGrid(); renderHand();
            }
          }
          _cleanup();
        }

        function _cleanup() {
          _done = true;
          document.removeEventListener('touchmove', _move);
          document.removeEventListener('touchend', _end);
          document.removeEventListener('touchcancel', _cancel);
        }

        document.addEventListener('touchmove', _move, { passive: false });
        document.addEventListener('touchend', _end, { passive: false });
        document.addEventListener('touchcancel', _cancel, { passive: true });
      }, { passive: true });
    }


    return div;


  }





  // Build a collapsed stack thumbnail for a tier


  function buildStack(tier, cards, locked) {


    const tCol    = TIER_COLORS[tier] || '#888';


    const tNum    = TIER_ORDER[tier];


    const canOpen = cards.length > 0;


    // Shadow cards: 1 shadow for 2 cards, 2 shadows for 3+ cards


    const shadows = Math.min(Math.max(cards.length - 1, 0), 2);


    const stackW  = 122 + shadows * 9; // extra width for shadow peekout





    var wrap = document.createElement('div');


    wrap.style.cssText = 'position:relative;width:'+stackW+'px;height:148px;flex-shrink:0;cursor:'+(canOpen?'pointer':'default')+';transition:transform 0.15s;';





    // Shadow cards peek out to the RIGHT: creates physical stack look


    for (var i = shadows; i >= 1; i--) {


      var sh = document.createElement('div');


      sh.style.cssText = 'position:absolute;top:'+(i*3)+'px;left:'+(i*9)+'px;width:122px;height:148px;border-radius:6px;background:#0c0c1e;border:1px solid '+tCol+'44;box-shadow:inset 0 0 6px #00000088;';


      wrap.appendChild(sh);


    }





    // Front card: same format as real hand cards: art bg + tier dots top-left


    var front = document.createElement('div');


    var _fc = factionC || '#00ffcc';


    front.style.cssText = 'position:absolute;top:0;left:0;width:122px;height:148px;border-radius:6px;background-color:#10101e;background-size:cover;background-position:center top;border:1px solid '+(canOpen?_fc+'55':'#1a1a28')+';box-shadow:'+(canOpen?'0 0 10px '+_fc+'22':'none')+';overflow:hidden;transition:border-color 0.2s,box-shadow 0.2s,transform 0.15s;';





    if (cards[0] && cards[0].art) {


      front.style.backgroundImage = "url('"+cards[0].art+"')";


      front.style.backgroundSize  = 'cover';


      front.style.backgroundPosition = 'center top';


      front.style.filter = 'brightness(0.8)';


    }





    // Tier dots top-left: exact same format as hand cards


    var dots = Array.from({length:tNum}, function(){


      return '<span style="width:5px;height:5px;border-radius:50%;background:'+tCol+';box-shadow:0 0 3px '+tCol+';display:inline-block;"></span>';


    }).join('');





    front.innerHTML =


      '<div style="position:absolute;top:4px;left:4px;display:flex;gap:2px;z-index:2;">'+dots+'</div>' +


      (locked>0 ? '<div style="position:absolute;bottom:4px;right:4px;font-size:8px;color:#444;">+'+locked+'</div>' : '');





    wrap.appendChild(front);





    // Count pill floating to the right of the stack


    if (cards.length > 1) {


      var countPill = document.createElement('div');


      countPill.style.cssText = 'position:absolute;bottom:8px;right:-18px;background:#0a0a1a;border:1px solid '+_fc+'66;border-radius:10px;padding:2px 6px;font-size:11px;font-weight:bold;color:'+_fc+';font-family:\'Courier New\',monospace;z-index:5;white-space:nowrap;pointer-events:none;';


      countPill.textContent = '×' + cards.length;


      wrap.appendChild(countPill);


    }





    if (canOpen) {


      wrap.onmouseenter = function() {


        playHoverSfx();


        front.style.borderColor = _fc+'cc';


        front.style.boxShadow   = '0 0 20px '+_fc+'55';


        wrap.style.transform    = 'translateY(-5px)';


      };


      wrap.onmouseleave = function() {


        front.style.borderColor = _fc+'55';


        front.style.boxShadow   = '0 0 10px '+_fc+'22';


        wrap.style.transform    = '';


      };


      wrap.onclick = function() {


        window._activeTier = tier;


        playDeckExpandSfx();


        renderHand();


      };


      wrap.title = `TIER ${tier}: Click to expand (${cards.length} card${cards.length!==1?'s':''})`;


      wrap.onmouseenter = function(e) {


        front.style.borderColor = tCol+'aa';


        front.style.boxShadow   = '0 0 20px '+tCol+'55';


        wrap.style.transform    = 'translateY(-5px)';


        const tt = document.getElementById('tooltip');


        if (tt) {


          tt.style.width  = '160px'; // stack tips are compact
          tt.style.right  = '16px'; tt.style.left = 'auto';
          tt.style.bottom = '16px';
          tt.style.top    = 'auto';


          tt.style.setProperty('--tc', tCol);


          tt.style.setProperty('--tc-dim', tCol+'55');


          tt.style.setProperty('--tc-glow', tCol+'18');


          tt.innerHTML = `<div class="tip-body" style="padding:6px 10px;min-width:90px;">


            <div style="font-family:'Orbitron',monospace;font-size:12px;letter-spacing:2px;color:${tCol};margin-bottom:6px;">TIER ${tier}</div>


            <div style="font-size:11px;color:#aaa;">${cards.length} card${cards.length!==1?'s':''} available</div>


            <div style="font-size:10px;color:#999;margin-top:4px;letter-spacing:1px;">Click to expand</div>


          </div>`;


          tt.style.display = 'block';


        }


      };


      wrap.onmouseleave = function() {


        front.style.borderColor = tCol+'55';


        front.style.boxShadow   = '0 0 10px '+tCol+'22';


        wrap.style.transform    = '';


        hideTip();


      };


    }


    return wrap;


  }





  // ── MOBILE DECK: card cover thumbnails + expandable card tray ────────────
  if (window.innerWidth <= 480) {
    const _fc = factionC || '#00ffcc';

    const tray = document.createElement('div');
    tray.className = 'mobile-deck-expanded';

    const coversRow = document.createElement('div');
    coversRow.className = 'mobile-deck-covers';

    ['I','II','III','IV'].forEach(function(t) {
      const cards    = byTier[t] || [];
      const inelCards = inelByTier[t] || [];
      const locked   = inelCards.length;
      const total    = cards.length + locked;
      const tCol     = TIER_COLORS[t] || '#888';
      const tNum     = TIER_ORDER[t];
      const isAct    = window._activeTier === t;
      const hasAny   = total > 0;
      const onlyLocked = hasAny && cards.length === 0;

      const cover = document.createElement('div');
      cover.className = 'mobile-deck-cover' + (isAct ? ' active' : '');
      cover.style.cssText =
        'background-color:#0c0c1e;background-size:cover;background-position:center top;' +
        'border:2px solid ' + (hasAny ? (isAct ? _fc + 'cc' : onlyLocked ? '#3a3a50' : _fc + '44') : '#1a1a2866') + ';' +
        'box-shadow:' + (isAct ? '0 0 14px ' + _fc + '88' : hasAny && !onlyLocked ? '0 0 6px ' + _fc + '22' : 'none') + ';';

      // Use eligible art first, fall back to ineligible art, both get dimmed when locked/empty
      const artCard = cards[0] || inelCards[0];
      if (artCard && artCard.art) {
        cover.style.backgroundImage = "url('" + artCard.art + "')";
        cover.style.filter = isAct ? 'brightness(1)' : (onlyLocked ? 'brightness(0.3) saturate(0.2)' : !hasAny ? 'brightness(0.15) saturate(0)' : 'brightness(0.75)');
      } else if (!hasAny) {
        cover.style.filter = 'brightness(0.15)';
      }

      const dots = Array.from({length: tNum}, function() {
        return '<span style="width:4px;height:4px;border-radius:50%;background:' + tCol + ';box-shadow:0 0 3px ' + tCol + ';display:inline-block;"></span>';
      }).join('');

      const countHtml = hasAny
        ? '<div style="position:absolute;bottom:3px;right:3px;background:#0a0a1acc;border:1px solid ' + (onlyLocked ? '#3a3a50' : _fc + '66') + ';border-radius:8px;padding:1px 5px;font-size:9px;font-weight:bold;color:' + (onlyLocked ? '#555' : _fc) + ';font-family:\'Courier New\',monospace;">' +
            cards.length + (locked > 0 ? '<span style="opacity:0.45;font-size:7px;">+' + locked + '</span>' : '') +
          '</div>' +
          (onlyLocked ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:3;"><span style="font-size:14px;opacity:0.5;">🔒</span></div>' : '')
        : '<div style="position:absolute;inset:0;background:#00000066;border-radius:4px;z-index:3;"></div>';

      cover.innerHTML =
        '<div style="position:absolute;top:3px;left:3px;z-index:2;font-family:\'Orbitron\',monospace;font-size:8px;font-weight:700;letter-spacing:1px;color:' + tCol + ';text-shadow:0 0 5px ' + tCol + '99;">T' + tNum + '</div>' +
        countHtml;

      if (cards.length > 0) {
        cover.onclick = function() {
          playDeckExpandSfx();
          window._activeTier = (window._activeTier === t) ? null : t;
          renderHand();
        };
      }
      coversRow.appendChild(cover);

      if (isAct && cards.length > 0) {
        cards.forEach(function(card, idx) { tray.appendChild(buildCard(card, idx)); });
      }
    });

    // Zone indicator: right of covers, shows selected card's placement pattern
    if (G.selectedCard && G.selectedCard.zone) {
      const _card = G.selectedCard;
      const _tCol = TIER_COLORS[_card.tier] || '#888';
      const ROWS = 5, COLS = 7;
      const cardR = ROWS - 1, cardC = Math.floor(COLS / 2);
      const _zoneOffsets = (typeof ZONES !== 'undefined' && ZONES[_card.zone]) ? ZONES[_card.zone] : [];
      const _zoneCells = new Set();
      _zoneOffsets.forEach(function({dr, dc}) {
        const nr = cardR + dr, nc = cardC + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) _zoneCells.add(nr + ',' + nc);
      });
      let _gridHtml = '<div style="display:grid;grid-template-columns:repeat(7,9px);gap:1px;">';
      for (let _r = 0; _r < ROWS; _r++) {
        for (let _c = 0; _c < COLS; _c++) {
          const _isCard = _r === cardR && _c === cardC;
          const _isZone = _zoneCells.has(_r + ',' + _c);
          const _bg  = _isCard ? _tCol : _isZone ? '#ffdd0055' : '#0e0c18';
          const _bdr = _isCard ? 'none' : _isZone ? '1px solid #ffdd0099' : '1px solid #1a1428';
          _gridHtml += '<div style="width:9px;height:9px;border-radius:1px;background:' + _bg + ';border:' + _bdr + ';"></div>';
        }
      }
      _gridHtml += '</div>';
      const _zoneDiv = document.createElement('div');
      _zoneDiv.style.cssText = 'flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 8px 0 6px;gap:3px;border-left:1px solid #1a1a38;';
      _zoneDiv.innerHTML = '<div style="font-size:6px;letter-spacing:1px;color:#555;font-family:\'Courier New\',monospace;margin-bottom:1px;">ZONE</div>' + _gridHtml;
      coversRow.appendChild(_zoneDiv);
    }

    el.appendChild(tray);
    el.appendChild(coversRow);
    return;
  }

  // ── DESKTOP DECK ────────────────────────────────────────────────────────

  // Auto-expand when only 1 tier has eligible cards (no need for stacks)


  const tiersWithCards = ['I','II','III','IV'].filter(t => byTier[t]?.length > 0);


  const autoExpand = tiersWithCards.length <= 1;





  // Build the row: collapsed stacks + one expanded tier inline


  ['I','II','III','IV'].forEach(function(tier) {


    var cards  = byTier[tier]  || [];


    var locked = (inelByTier[tier] || []).length;


    if (cards.length === 0) return; // hide tiers until at least 1 card is eligible





    var isActive = window._activeTier === tier || autoExpand || cards.length === 1;


    var tCol     = TIER_COLORS[tier] || '#888';





    if (isActive && cards.length > 0) {


      if (false) {


        // (removed: single-card flat display: now always uses group wrapper)


      } else {


        // EXPANDED: wrap cards in a tier group with border/bg showing they're related


        var group = document.createElement('div');


        group.style.cssText = 'display:flex;gap:8px;align-items:flex-end;flex-shrink:0;' +


          'padding:8px 10px 6px 22px;border-radius:10px;' +


          'background:' + tCol + '08;' +


          'border:1px solid ' + tCol + '33;' +


          'box-shadow:0 0 12px ' + tCol + '11;' +


          'position:relative;';


        // Tier label: click to collapse back to stack


        var lbl = document.createElement('div');


        lbl.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:18px;display:flex;align-items:center;justify-content:center;writing-mode:vertical-lr;transform:rotate(180deg);font-size:6px;letter-spacing:2px;border-radius:10px 0 0 10px;background:' + tCol + '18;border-right:1px solid ' + tCol + '33;cursor:pointer;user-select:none;color:'+tCol+';font-family:\'Courier New\',monospace;border:1px solid '+tCol+'44;border-radius:3px;cursor:pointer;user-select:none;';


        lbl.textContent = tier;


        lbl.title = 'Click to collapse';


        lbl.onclick = function(e) { e.stopPropagation(); window._activeTier = null; renderHand(); };


        group.appendChild(lbl);





        cards.forEach(function(card, idx) {


          var div = buildCard(card, idx);


          // All hand cards use faction color: tier group gives context


          div.style.borderColor = factionC;


          div.style.boxShadow   = G.selectedCard===card


            ? '0 0 22px '+factionC+'88, 0 0 44px '+factionC+'44'


            : '0 0 12px '+factionC+'44, 0 0 0 1px '+factionC+'22';


          group.appendChild(div);


        });


        el.appendChild(group);


      }


    } else {


      // COLLAPSED: show as stacked thumbnail (single-card tiers always expanded above)


      el.appendChild(buildStack(tier, cards, locked));


    }


  });


}

function renderAiHand() {


  for (let i = 0; i < 12; i++) {


    const el = document.getElementById(`fd${i}`);


    if (el && G.aiHand[i]) el.classList.toggle('used', G.aiHand[i].used);


  }


}

function showDragCard(card, x, y) {


  const dc = document.getElementById('dragCard');


  document.getElementById('dc-n').textContent = card.edges.n;


  document.getElementById('dc-s').textContent = card.edges.s;


  document.getElementById('dc-w').textContent = card.edges.w;


  document.getElementById('dc-e').textContent = card.edges.e;


  document.getElementById('dc-power').textContent = card.power;


  document.getElementById('dc-name').textContent = card.name;


  document.getElementById('dc-tier').textContent = card.tier;


  // Show card art on the drag card: feels like physically picking it up


  if (card.art) {


    dc.style.backgroundImage = `url('${card.art}')`;


    dc.style.backgroundSize  = 'cover';


    dc.style.backgroundPosition = 'center top';


    dc.style.backgroundColor = '#06050e';


  } else {


    dc.style.backgroundImage = '';


  }


  const tierCol = TIER_COLORS[card.tier] || '#888';


  dc.style.borderColor = tierCol;


  dc.style.boxShadow = `0 0 20px ${tierCol}88, 0 4px 20px #00000088`;


  dc.style.display = 'block';


  dc.style.left = (x + 6) + 'px';


  dc.style.top  = (y + 6) + 'px';


}

function updateDragCard(x, y) {


  const dc = document.getElementById('dragCard');


  if (dc.style.display !== 'none') {


    dc.style.left = (x + 6) + 'px';


    dc.style.top  = (y + 6) + 'px';


  }


}

function hideDragCard() {


  document.getElementById('dragCard').style.display = 'none';


}
