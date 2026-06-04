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

  const zoneHtml = card.zone ? buildZoneGrid(card) : '';

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

  content.innerHTML =
    // Header: close btn row
    '<div style="display:flex;justify-content:flex-end;margin-bottom:6px;">' +
      '<div onclick="hideMobileCardPanel()" style="cursor:pointer;width:24px;height:24px;border-radius:50%;background:#1a1a2c;border:1px solid ' + tierCol + '55;display:flex;align-items:center;justify-content:center;font-size:12px;color:#aaa;flex-shrink:0;" title="Close">✕</div>' +
    '</div>' +
    // Two-column header: art | name + tier + compass
    '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;">' +
      (card.art ? '<img src="' + card.art + '" style="width:56px;height:72px;object-fit:cover;object-position:top center;border-radius:5px;border:1px solid ' + tierCol + '55;flex-shrink:0;">' : '') +
      '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">' +
        '<div style="font-size:9px;font-family:\'Orbitron\',monospace;color:#ccc;line-height:1.3;font-weight:700;">' + (card.name || '') + '</div>' +
        '<div style="display:flex;align-items:center;gap:4px;">' +
          '<div style="display:flex;gap:2px;">' + dots + emptyDots + '</div>' +
          '<span style="font-size:7px;font-family:\'Courier New\',monospace;color:' + tierCol + ';">T' + card.tier + '</span>' +
        '</div>' +
        compassHtml +
      '</div>' +
    '</div>' +
    // Zone / placement grid
    (zoneHtml ?
      '<div style="border-top:1px solid #1a1a2888;padding-top:7px;margin-bottom:8px;">' +
        '<div style="font-size:7px;letter-spacing:2px;color:#555;font-family:\'Courier New\',monospace;margin-bottom:5px;">PLACEMENT ZONE</div>' +
        '<div style="overflow-x:auto;">' + zoneHtml + '</div>' +
      '</div>'
    : '') +
    // Ability section
    '<div style="border-top:1px solid #1a1a2888;padding-top:7px;">' +
    (abiInfo ?
      '<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">' +
        '<span style="font-size:12px;">' + abiIcon + '</span>' +
        '<span style="font-size:8px;font-family:\'Orbitron\',monospace;letter-spacing:1px;color:' + abiCol + ';font-weight:700;">' + abiLabel + '</span>' +
      '</div>' +
      '<div style="font-size:9px;color:#aaa;line-height:1.5;margin-bottom:' + (abiVisual ? '7px' : '0') + ';">' + abiDesc + '</div>' +
      (abiVisual ? '<div style="overflow-x:auto;padding-top:6px;border-top:1px solid #ffffff0a;">' + abiVisual + '</div>' : '')
    :
      '<div style="font-size:8px;color:#333;font-style:italic;font-family:\'Courier New\',monospace;">No special ability</div>'
    ) +
    '</div>';

  panel.style.borderColor = tierCol + '88';
  const tab = document.getElementById('mobileCardPanelTab');
  if (tab) {
    const isOpen = panel.classList.contains('open');
    tab.style.display = 'flex';
    tab.textContent = isOpen ? '▶' : '◀';
    tab.style.right = isOpen ? '195px' : '0';
    tab.style.borderColor = tierCol + '88';
    tab.style.background = tierCol + '33';
    tab.style.color = tierCol;
    tab.style.boxShadow = '-3px 0 14px ' + tierCol + '99';
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
    tab.style.right = '0';
    tab.textContent = '◀';
    tab.style.borderColor = _tc + '88';
    tab.style.background = _tc + '33';
    tab.style.color = _tc;
    tab.style.boxShadow = '-3px 0 14px ' + _tc + '99';
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
    if (tab) { tab.style.right = '195px'; tab.textContent = '▶'; }
  }
}
