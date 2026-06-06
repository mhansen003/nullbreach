function showMobileCardPanel(card) {
  if (window.innerWidth > 480) return;
  const panel = document.getElementById('mobileCardPanel');
  if (!panel) return;
  panel.style.display = 'block';
  const content = document.getElementById('mobileCardPanelContent');
  if (!content) return;

  const tierCol = TIER_COLORS[card.tier] || '#888';
  const tierNum = {'I':1,'II':2,'III':3,'IV':4}[card.tier] || 1;
  const _fc = window.playerFactionColor || '#00ffcc';
  const mod = card.edgeMod;
  const n = card.edges.n + (mod && mod.n || 0);
  const s = card.edges.s + (mod && mod.s || 0);
  const e = card.edges.e + (mod && mod.e || 0);
  const w = card.edges.w + (mod && mod.w || 0);

  const abiInfo = card.ability ? (ABILITY_ICONS[card.ability] || {icon:'✦', color: tierCol, label: card.ability.replace(/_/g,' ').toUpperCase()}) : null;
  const abiCol = abiInfo ? abiInfo.color : tierCol;
  const abiLabel = card.abilityLabel || (abiInfo ? abiInfo.label : '');
  const abiIcon = abiInfo ? abiInfo.icon : '';
  const abiDesc = card.abilityText || (abiInfo ? (ABILITY_TEXT[card.ability] || '') : '');
  const abiVisual = abiInfo ? buildAbilityVisual(card.ability) : '';

  const dots = Array.from({length: tierNum}, function() {
    return '<span style="width:5px;height:5px;border-radius:50%;background:' + tierCol + ';box-shadow:0 0 3px ' + tierCol + ';display:inline-block;"></span>';
  }).join('');

  const emptyDots = Array.from({length: 4 - tierNum}, function() {
    return '<span style="width:5px;height:5px;border-radius:50%;border:1px solid #2a2a3a;display:inline-block;"></span>';
  }).join('');

  // Compact compass HTML (3×3 grid, smaller cells)
  const compassHtml =
    '<div style="display:grid;grid-template-columns:repeat(3,28px);grid-template-rows:repeat(3,24px);gap:2px;">' +
      '<div></div>' +
      '<div style="text-align:center;background:#111;border:1px solid ' + tierCol + '44;border-radius:3px;font-size:13px;font-weight:bold;font-family:\'Courier New\',monospace;color:#ddd;display:flex;align-items:center;justify-content:center;">' + n + '</div>' +
      '<div></div>' +
      '<div style="text-align:center;background:#111;border:1px solid ' + tierCol + '44;border-radius:3px;font-size:13px;font-weight:bold;font-family:\'Courier New\',monospace;color:#ddd;display:flex;align-items:center;justify-content:center;">' + w + '</div>' +
      '<div style="text-align:center;background:#0a0a18;border:2px solid ' + _fc + '66;border-radius:4px;font-size:13px;font-weight:bold;font-family:\'Courier New\',monospace;color:' + _fc + ';display:flex;align-items:center;justify-content:center;">' + card.power + '</div>' +
      '<div style="text-align:center;background:#111;border:1px solid ' + tierCol + '44;border-radius:3px;font-size:13px;font-weight:bold;font-family:\'Courier New\',monospace;color:#ddd;display:flex;align-items:center;justify-content:center;">' + e + '</div>' +
      '<div></div>' +
      '<div style="text-align:center;background:#111;border:1px solid ' + tierCol + '44;border-radius:3px;font-size:13px;font-weight:bold;font-family:\'Courier New\',monospace;color:#ddd;display:flex;align-items:center;justify-content:center;">' + s + '</div>' +
      '<div></div>' +
    '</div>' +
    '<div style="font-size:7px;color:#333;font-family:\'Courier New\',monospace;display:flex;justify-content:space-between;padding:1px 3px 0;"><span>W</span><span>E</span></div>';

  // Battle result badges (same logic as desktop tooltip)
  let _cardPos = null;
  if (typeof G !== 'undefined' && G.grid) {
    outer: for (let _r = 0; _r < 5; _r++)
      for (let _c = 0; _c < 7; _c++)
        if (G.grid[_r][_c].card === card) { _cardPos = {r:_r, c:_c, own:G.grid[_r][_c].owner}; break outer; }
  }
  const _dir = {n:null, s:null, e:null, w:null};
  if (_cardPos) {
    const {r:_r, c:_c, own:_own} = _cardPos;
    const _emy = _own === 'player' ? 'ai' : 'player';
    const _cmp = function(my, their) { return my > their ? 'W' : my < their ? 'L' : 'T'; };
    const _em  = function(rr,cc) { return G.grid[rr] && G.grid[rr][cc] && G.grid[rr][cc].owner === _emy && G.grid[rr][cc].card ? G.grid[rr][cc].card : null; };
    const _ev  = function(c2, edge) { return c2.edges[edge] + (c2.edgeMod?.[edge]||0); };
    if (_em(_r-1,_c)) _dir.n = _cmp(n, _ev(_em(_r-1,_c),'s'));
    if (_em(_r+1,_c)) _dir.s = _cmp(s, _ev(_em(_r+1,_c),'n'));
    if (_em(_r,_c-1)) _dir.w = _cmp(w, _ev(_em(_r,_c-1),'e'));
    if (_em(_r,_c+1)) _dir.e = _cmp(e, _ev(_em(_r,_c+1),'w'));
  }
  function _mbadge(res) {
    if (!res) return '';
    const bc = res==='W'?'#00ffcc':res==='L'?'#ff4444':'#888';
    const lb = res==='W'?'WIN':res==='L'?'LOSE':'TIE';
    return '<div style="font-family:\'Orbitron\',monospace;font-size:7px;font-weight:700;color:'+bc+';background:'+bc+'22;border:1px solid '+bc+'99;border-radius:3px;padding:1px 4px;margin-top:1px;text-align:center;">'+lb+'</div>';
  }
  const _ec = function(res) { return res==='W'?'#00ffcc':res==='L'?'#ffffff44':'#ffffffcc'; };
  const nCol2 = _dir.n ? _ec(_dir.n) : '#ffffffcc';
  const sCol2 = _dir.s ? _ec(_dir.s) : '#ffffffcc';
  const wCol2 = _dir.w ? _ec(_dir.w) : '#ffffffcc';
  const eCol2 = _dir.e ? _ec(_dir.e) : '#ffffffcc';

  // Rich compass matching desktop tooltip layout
  const richCompass =
    '<div style="position:relative;width:110px;height:110px;border:1px solid ' + tierCol + '55;border-radius:6px;background:#030310;">' +
      // North
      '<div style="position:absolute;top:3px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;">' +
        '<div style="font-size:18px;font-weight:bold;color:'+nCol2+';line-height:1;">' + n + '</div>' +
        _mbadge(_dir.n) +
      '</div>' +
      // South
      '<div style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;">' +
        _mbadge(_dir.s) +
        '<div style="font-size:18px;font-weight:bold;color:'+sCol2+';line-height:1;">' + s + '</div>' +
      '</div>' +
      // West
      '<div style="position:absolute;left:3px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;min-width:22px;">' +
        '<div style="font-size:18px;font-weight:bold;color:'+wCol2+';line-height:1;">' + w + '</div>' +
        _mbadge(_dir.w) +
      '</div>' +
      // East
      '<div style="position:absolute;right:3px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;min-width:22px;">' +
        '<div style="font-size:18px;font-weight:bold;color:'+eCol2+';line-height:1;">' + e + '</div>' +
        _mbadge(_dir.e) +
      '</div>' +
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:' + tierCol + '55;"></div>' +
    '</div>';

  const svgIcon = (typeof _getAbilitySvg === 'function' && card.ability) ? _getAbilitySvg(card.ability) : '';

  content.innerHTML =
    // Drag handle + close
    '<div style="position:relative;display:flex;justify-content:center;align-items:center;height:22px;margin-bottom:8px;">' +
      '<div style="width:32px;height:3px;border-radius:2px;background:#333;"></div>' +
      '<div onclick="hideMobileCardPanel()" style="position:absolute;right:0;top:50%;transform:translateY(-50%);cursor:pointer;width:24px;height:24px;border-radius:50%;background:#1a1a2c;border:1px solid ' + tierCol + '55;display:flex;align-items:center;justify-content:center;font-size:12px;color:#aaa;">✕</div>' +
    '</div>' +
    // Header: art | name + VP + tier
    '<div style="display:flex;gap:10px;padding-bottom:10px;border-bottom:1px solid #ffffff10;margin-bottom:10px;align-items:flex-start;">' +
      (card.art ? '<img src="' + card.art + '" style="width:72px;height:94px;object-fit:cover;object-position:top;border-radius:6px;border:1px solid ' + tierCol + '55;flex-shrink:0;">' : '') +
      '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;justify-content:center;">' +
        '<div style="font-family:\'Orbitron\',monospace;font-size:12px;letter-spacing:1px;color:#fff;font-weight:700;line-height:1.3;">' + (card.name || '') + '</div>' +
        '<div style="display:flex;align-items:baseline;gap:4px;">' +
          '<span style="font-size:30px;font-weight:bold;color:' + tierCol + ';line-height:1;text-shadow:0 0 10px ' + tierCol + ';">' + card.power + '</span>' +
          '<span style="font-size:10px;color:#bbb;letter-spacing:2px;">VP</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:3px;">' +
          '<span style="font-size:8px;color:#aaa;letter-spacing:2px;">T</span>' +
          dots + emptyDots +
        '</div>' +
      '</div>' +
    '</div>' +
    // Battle power + Zone influence side by side
    '<div style="display:flex;gap:10px;padding-bottom:10px;border-bottom:1px solid #ffffff10;margin-bottom:10px;">' +
      '<div style="flex:1;">' +
        '<div style="font-size:8px;letter-spacing:2px;color:#bbb;margin-bottom:6px;">BATTLE POWER</div>' +
        richCompass +
      '</div>' +
      (card.zone ? (
        '<div style="flex:1;">' +
          '<div style="font-size:8px;letter-spacing:2px;color:#bbb;margin-bottom:6px;">INFLUENCE</div>' +
          (typeof buildZoneGrid === 'function' ? buildZoneGrid(card) : '') +
        '</div>'
      ) : '') +
    '</div>' +
    // Ability section
    (abiInfo ?
      '<div style="border:1px solid #ffffff14;border-radius:6px;padding:10px;background:#ffffff06;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
          (svgIcon ? '<div style="width:36px;height:36px;border-radius:7px;background:rgba(10,8,24,0.72);border:1px solid #ffffff1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:abilityPulse 2.5s ease-in-out infinite;">' + svgIcon + '</div>' : '') +
          '<span style="font-family:\'Orbitron\',monospace;font-size:11px;letter-spacing:1px;color:#fff;font-weight:700;">' + abiLabel + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#ddd;line-height:1.6;margin-bottom:' + (abiVisual ? '8px' : '0') + ';">' + abiDesc + '</div>' +
        (abiVisual ? '<div style="margin-top:2px;">' + abiVisual + '</div>' : '') +
      '</div>'
    :
      '<div style="font-size:10px;color:#444;letter-spacing:1px;font-style:italic;">No special ability</div>'
    );

  panel.style.borderColor = tierCol + '88';
  const tab = document.getElementById('mobileCardPanelTab');
  if (tab) {
    tab.style.display = 'flex';
    tab.textContent = panel.classList.contains('open') ? '▼' : '▲';
    tab.style.borderColor = tierCol + '88';
    tab.style.background = tierCol + '33';
    tab.style.color = tierCol;
    tab.style.boxShadow = '0 -3px 14px ' + tierCol + '99';
  }
}

function hideMobileCardPanel() {
  const panel = document.getElementById('mobileCardPanel');
  if (!panel) return;
  panel.classList.remove('open');
  const tab = document.getElementById('mobileCardPanelTab');
  // Restore glow if a card is still selected; otherwise reset fully
  if (G.selectedCard && tab) {
    const _tc = TIER_COLORS[G.selectedCard.tier] || (window.playerFactionColor || '#00ffcc');
    tab.textContent = '▲';
    tab.style.borderColor = _tc + '88';
    tab.style.background = _tc + '33';
    tab.style.color = _tc;
    tab.style.boxShadow = '0 -3px 14px ' + _tc + '99';
  } else if (tab) {
    tab.style.display = 'none';
  }
  // clear content after slide-out animation only if no card selected
  setTimeout(function() {
    if (!panel.classList.contains('open') && !G.selectedCard) {
      const content = document.getElementById('mobileCardPanelContent');
      if (content) content.innerHTML = '';
      panel.style.borderColor = '';
    }
  }, 280);
}

function toggleMobileCardPanel() {
  const panel = document.getElementById('mobileCardPanel');
  if (!panel) return;
  const tab = document.getElementById('mobileCardPanelTab');
  const sfx = document.getElementById('swishSfx');
  if (sfx) { sfx.currentTime = 0; sfx.play().catch(() => {}); }
  if (panel.classList.contains('open')) {
    hideMobileCardPanel();
  } else {
    setTimeout(function() { panel.classList.add('open'); }, 10);
    if (tab) { tab.textContent = '▼'; }
  }
}
