"""
All TODO patches — no randomize-abilities (user deciding separately).
Run from: cd C:\\GitHub\\nullbreach && python patch-all.py
"""

with open('game.html', 'r', encoding='utf-8') as f:
    g = f.read()

# ─────────────────────────────────────────────────────────────────────────────
# 1. ABILITY_ICONS: chain → flank
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  chain:          { icon:'🔗',  color:'#ff44ff', label:'CHAIN'          },",
    "  flank:          { icon:'↺↺',  color:'#ff9900', label:'FLANK'          },"
)

# ─────────────────────────────────────────────────────────────────────────────
# 2. ABILITY_TEXT + showToast (insert before ABILITY_ICONS)
# ─────────────────────────────────────────────────────────────────────────────
INSERT_BEFORE = '// Ability visual icons and colors for the tooltip'
INJECT = '''// Ability descriptions (for tooltip + future randomization)
const ABILITY_TEXT = {
  shield:        'SHIELD: First comparison loss blocked',
  double_strike: 'DOUBLE STRIKE: 2nd-depth win at half strength',
  commander:     'COMMANDER: Adjacent same-tier friendly cards +2 all edges',
  boost:         'BOOST: Adjacent friendly cards +1 all edges on placement',
  sweep:         'SWEEP: Contests all 4 adjacent cells on placement',
  flank:         'FLANK: After placing, take one extra turn immediately',
  rush:          'RUSH: Can be placed adjacent to any enemy card',
  pierce:        'PIERCE: Ties count as wins for this card',
};

// Brief toast notification (used by FLANK)
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

// Ability visual icons and colors for the tooltip'''

if 'const ABILITY_TEXT' not in g:
    g = g.replace(INSERT_BEFORE, INJECT)

# ─────────────────────────────────────────────────────────────────────────────
# 3. initGame: add _flankTriggered to state
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "    _prevEligibleIds: undefined, // reset for card pop tracking\n    log:          [],\n  };",
    "    _prevEligibleIds: undefined, // reset for card pop tracking\n    log:          [],\n    _flankTriggered: null,\n  };"
)

# ─────────────────────────────────────────────────────────────────────────────
# 4. Double Strike half-strength in computeBattleResults (H forward)
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    """            // DOUBLE STRIKE: also contest the cell beyond the beaten card
            if (cell.card.ability === 'double_strike' && c < 4) {
              const far = G.grid[r][c+2];
              if (far.card && far.owner !== cell.owner) {
                const me2 = me, them2 = (far.card.edges.w + (far.card.edgeMod?.w || 0));
                if (me2 > them2) { if (b[r][c+2].h !== 'win') b[r][c+2].h = 'lose'; }
              }
            }""",
    """            // DOUBLE STRIKE: 2nd-depth hit at HALF strength
            if (cell.card.ability === 'double_strike' && c < 5) {
              const far = G.grid[r][c+2];
              if (far.card && far.owner !== cell.owner) {
                const me2 = Math.max(1, Math.floor(me / 2));
                const them2 = (far.card.edges.w + (far.card.edgeMod?.w || 0));
                if (me2 > them2) { if (b[r][c+2].h !== 'win') b[r][c+2].h = 'lose'; }
              }
            }"""
)
# H reverse (east card double strikes west)
g = g.replace(
    """            if (east.card.ability === 'double_strike' && c > 0) {
              const far = G.grid[r][c-1];
              if (far.card && far.owner !== east.owner) {
                const me2 = them, them2 = (far.card.edges.e + (far.card.edgeMod?.e || 0));
                if (me2 > them2) { if (b[r][c-1].h !== 'win') b[r][c-1].h = 'lose'; }
              }
            }""",
    """            if (east.card.ability === 'double_strike' && c > 1) {
              const far = G.grid[r][c-1];
              if (far.card && far.owner !== east.owner) {
                const me2 = Math.max(1, Math.floor(them / 2));
                const them2 = (far.card.edges.e + (far.card.edgeMod?.e || 0));
                if (me2 > them2) { if (b[r][c-1].h !== 'win') b[r][c-1].h = 'lose'; }
              }
            }"""
)

# ─────────────────────────────────────────────────────────────────────────────
# 5. doComparisons: remove CHAIN, add half-strength DOUBLE STRIKE
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    """    // CHAIN: cascade comparison from adjacent cell
    if (card.ability==='chain' && iWin && depth===0) {
      addLog('compare', `CHAIN from ${card.name}...`);
      doComparisons(nr, nc, owner, target.card, depth+1);
    }

    // DOUBLE STRIKE: also compare one step further in same direction
    if (card.ability==='double_strike' && iWin) {
      const nr2=nr+d.dr, nc2=nc+d.dc;
      if (nr2>=0&&nr2<5&&nc2>=0&&nc2<6) {
        const t2 = G.grid[nr2][nc2];
        if (t2.card && t2.owner===enemy) {
          const mv2=mv, tv2=t2.card.edges[d.theirE];
          showFlash(nr,nc,nr2,nc2,mv2,tv2,mv2>tv2);
          addLog('compare', `DOUBLE STRIKE: ${mv2}${mv2>tv2?'>':'<='}${tv2} vs ${t2.card.name}`);
        }
      }
    }""",
    """    // DOUBLE STRIKE: contest 2nd cell at HALF strength
    if (card.ability==='double_strike' && iWin) {
      const nr2=nr+d.dr, nc2=nc+d.dc;
      if (nr2>=0&&nr2<5&&nc2>=0&&nc2<7) {
        const t2 = G.grid[nr2][nc2];
        if (t2.card && t2.owner===enemy) {
          const mv2=Math.max(1,Math.floor(mv/2)), tv2=t2.card.edges[d.theirE];
          showFlash(nr,nc,nr2,nc2,mv2,tv2,mv2>tv2);
          addLog('compare', `DOUBLE STRIKE (\\u00bd): ${mv2} vs ${tv2} → ${t2.card.name}`);
        }
      }
    }"""
)

# ─────────────────────────────────────────────────────────────────────────────
# 6. Card definitions: chain → flank
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace("ability:'chain',         abilityText:'CHAIN: Wins cascade to adjacent enemies'",
              "ability:'flank',         abilityText:'FLANK: After placing, take one extra turn immediately'")
g = g.replace("ability:'chain',  abilityText:'CHAIN: Win flashes cascade to next cell'",
              "ability:'flank',  abilityText:'FLANK: After placing, take one extra turn immediately'")

# Update abilityText for double_strike cards
g = g.replace("abilityText:'DOUBLE STRIKE: Comparison reaches 2 deep'",
              "abilityText:'DOUBLE STRIKE: 2nd-depth win at half strength'")
g = g.replace("abilityText:'DOUBLE STRIKE: Comparison reaches 2 deep'",
              "abilityText:'DOUBLE STRIKE: 2nd-depth win at half strength'")

# ─────────────────────────────────────────────────────────────────────────────
# 7. placeCard: set _flankTriggered flag
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  addLog(owner==='player'?'player':'ai',\n    `${owner==='player'?'YOU':'AI'} place ${card.name}[${card.tier}] at [${r},${c}]`);",
    "  addLog(owner==='player'?'player':'ai',\n    `${owner==='player'?'YOU':'AI'} place ${card.name}[${card.tier}] at [${r},${c}]`);\n  if (G) G._flankTriggered = (card.ability === 'flank') ? owner : null;"
)

# ─────────────────────────────────────────────────────────────────────────────
# 8. onCellClick: handle player FLANK extra turn
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  placeCard(G.selectedCard, r, c, 'player');\n  G.selectedCard = null;\n  hideDragCard();\n  document.body.style.cursor = 'default';\n  G.turn = 'ai';",
    """  placeCard(G.selectedCard, r, c, 'player');
  G.selectedCard = null;
  hideDragCard();
  document.body.style.cursor = 'default';
  if (G._flankTriggered === 'player') {
    G._flankTriggered = null;
    G.turn = 'player';
    showToast('\\u21BA FLANK \\u2014 EXTRA TURN!', '#ff9900');
    renderAll();
    return;
  }
  G.turn = 'ai';"""
)

# ─────────────────────────────────────────────────────────────────────────────
# 9. animateAiCard: handle AI FLANK extra turn
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  setTimeout(() => {\n    floater.remove();\n    placeCard(card, r, c, 'ai');\n  }, 580);",
    """  setTimeout(() => {
    floater.remove();
    placeCard(card, r, c, 'ai');
    if (G._flankTriggered === 'ai' && !G.gameOver) {
      G._flankTriggered = null;
      addLog('ai', '\\u21BA FLANK \\u2014 AI takes extra turn');
      setTimeout(aiTurn, 1000);
    }
  }, 580);"""
)

# ─────────────────────────────────────────────────────────────────────────────
# 10. Shield icon badge on expended-shield board cards
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "          ${cell.card.ability ? `<span class=\"ability-tag\" style=\"color:${factionCol}88\">${ab(cell.card.ability)}</span>` : ''}",
    "          ${cell.card.ability ? `<span class=\"ability-tag\" style=\"color:${factionCol}88\">${ab(cell.card.ability)}</span>` : ''}\n          ${cell.card.shieldExpended ? `<span style=\"position:absolute;top:3px;right:3px;z-index:5;font-size:11px;filter:drop-shadow(0 0 4px #aaaaff);pointer-events:none;\">\\uD83D\\uDEE1</span>` : ''}"
)

# ─────────────────────────────────────────────────────────────────────────────
# 11. renderHand: drag-and-drop on hand cards
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "    div.onclick       = () => onCardSelect(card);\n    div.onmouseenter  = e  => showTip(e, card);\n    div.onmouseleave  = hideTip;\n    el.appendChild(div);",
    """    div.onclick       = () => onCardSelect(card);
    div.onmouseenter  = e  => showTip(e, card);
    div.onmouseleave  = hideTip;
    div.draggable = true;
    div.addEventListener('dragstart', e => {
      onCardSelect(card);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id);
    });
    el.appendChild(div);"""
)

# ─────────────────────────────────────────────────────────────────────────────
# 12. renderGrid: drag-and-drop on valid cells
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "          div.classList.add('valid');\n          div.onclick = () => onCellClick(r, c);",
    "          div.classList.add('valid');\n          div.onclick = () => onCellClick(r, c);\n          div.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect='move'; });\n          div.addEventListener('drop', e => { e.preventDefault(); if (G.selectedCard) onCellClick(r, c); });"
)

# ─────────────────────────────────────────────────────────────────────────────
# 13. AI difficulty: read URL param in initRaceTheme
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  return { player, ai, raceId, aiRaceId };\n}",
    "  window.aiDifficulty = new URLSearchParams(window.location.search).get('difficulty') || 'balanced';\n  return { player, ai, raceId, aiRaceId };\n}"
)

# ─────────────────────────────────────────────────────────────────────────────
# 14. aiTurn: difficulty scoring
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "      score += r * 0.2 + (2.5-Math.abs(2.5-c)) * 0.1 + Math.random()*0.5;",
    """      const _diff = window.aiDifficulty || 'balanced';
      if (_diff === 'passive') {
        score -= r * 1.5;
        if (card.tier === 'III' || card.tier === 'IV') score -= 4;
      } else if (_diff === 'aggressive') {
        score += r * 2.0;
        if (card.tier === 'III') score += 2;
        if (card.tier === 'IV') score += 5;
      }
      score += r * 0.2 + (2.5-Math.abs(2.5-c)) * 0.1 + Math.random()*0.5;"""
)

# ─────────────────────────────────────────────────────────────────────────────
# 15. Compact AI bar CSS
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "/* AI TOP BAR */\n.ai-area {\n  display: flex; align-items: center; gap: 14px;\n  padding: 7px 20px 4px;\n  flex-shrink: 0;\n  border-bottom: 1px solid #111120;\n}",
    "/* AI TOP BAR — compact floating strip */\n.ai-area {\n  display: flex; align-items: center; gap: 10px;\n  padding: 4px 14px;\n  flex-shrink: 0;\n  background: transparent;\n}"
)
g = g.replace(
    ".ai-portrait {\n  display: flex; align-items: center; gap: 10px;\n  background: #0e0e1e; border: 1px solid #ff008033;\n  border-radius: 5px; padding: 6px 12px; min-width: 185px;\n}",
    ".ai-portrait {\n  display: flex; align-items: center; gap: 8px;\n  background: #08080faa; border: 1px solid #ff008033;\n  border-radius: 6px; padding: 4px 10px;\n  backdrop-filter: blur(4px);\n}"
)
g = g.replace(
    ".ai-avatar {\n  width: 96px; height: 96px; flex-shrink: 0;\n  background: linear-gradient(135deg, #2a0d0d, #180a18);\n  border: 1px solid #ff008066; border-radius: 5px;\n  display: flex; align-items: center; justify-content: center; font-size: 36px;\n  overflow: hidden;\n}",
    ".ai-avatar {\n  width: 48px; height: 48px; flex-shrink: 0;\n  background: linear-gradient(135deg, #2a0d0d, #180a18);\n  border: 1px solid #ff008066; border-radius: 50%;\n  display: flex; align-items: center; justify-content: center; font-size: 20px;\n  overflow: hidden;\n}"
)
g = g.replace(
    ".ai-name  { color: #ff0080; font-size: 11px; letter-spacing: 2px; }\n.ai-sub   { color: #444; font-size: 8px; letter-spacing: 1px; margin-top: 2px; }\n.ai-quote { color: #333; font-size: 8px; font-style: italic; margin-top: 3px; }",
    ".ai-name  { color: #ff0080; font-size: 10px; letter-spacing: 1px; }\n.ai-sub   { display: none; }\n.ai-quote { display: none; }"
)

# ─────────────────────────────────────────────────────────────────────────────
# 16. Score inline with avatar — update sbAiBlock and sbPlayerBlock HTML
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    '    <div id="sbAiBlock" style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:64px;">\n'
    '      <img id="sbAiAvatar" src="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #333;transition:all 0.3s;">\n'
    '      <span id="sbAiNum"  style="font-size:26px;font-weight:bold;color:#333;line-height:1;transition:all 0.3s;">0</span>\n'
    '      <span id="sbAiName" style="font-size:7px;letter-spacing:1px;color:#222;white-space:nowrap;transition:color 0.3s;"></span>\n'
    '      <span id="sbAiLead" style="font-size:7px;letter-spacing:2px;min-height:10px;font-weight:bold;"></span>\n'
    '    </div>',
    '    <div id="sbAiBlock" style="display:flex;flex-direction:column;align-items:center;gap:2px;">\n'
    '      <div style="display:flex;align-items:center;gap:6px;">\n'
    '        <img id="sbAiAvatar" src="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #333;transition:all 0.3s;">\n'
    '        <span id="sbAiNum" style="font-size:26px;font-weight:bold;color:#333;line-height:1;transition:all 0.3s;">0</span>\n'
    '      </div>\n'
    '      <span id="sbAiName" style="font-size:7px;letter-spacing:1px;color:#222;white-space:nowrap;transition:color 0.3s;"></span>\n'
    '      <span id="sbAiLead" style="font-size:7px;letter-spacing:2px;min-height:10px;font-weight:bold;"></span>\n'
    '    </div>'
)
g = g.replace(
    '    <div id="sbPlayerBlock" style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:64px;">\n'
    '      <img id="sbPlayerAvatar" src="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #333;transition:all 0.3s;">\n'
    '      <span id="sbPlayerNum"  style="font-size:26px;font-weight:bold;color:#333;line-height:1;transition:all 0.3s;">0</span>\n'
    '      <span id="sbPlayerName" style="font-size:7px;letter-spacing:1px;color:#222;white-space:nowrap;transition:color 0.3s;"></span>\n'
    '      <span id="sbPlayerLead" style="font-size:7px;letter-spacing:2px;min-height:10px;font-weight:bold;"></span>\n'
    '    </div>',
    '    <div id="sbPlayerBlock" style="display:flex;flex-direction:column;align-items:center;gap:2px;">\n'
    '      <div style="display:flex;align-items:center;gap:6px;">\n'
    '        <img id="sbPlayerAvatar" src="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #333;transition:all 0.3s;">\n'
    '        <span id="sbPlayerNum" style="font-size:26px;font-weight:bold;color:#333;line-height:1;transition:all 0.3s;">0</span>\n'
    '      </div>\n'
    '      <span id="sbPlayerName" style="font-size:7px;letter-spacing:1px;color:#222;white-space:nowrap;transition:color 0.3s;"></span>\n'
    '      <span id="sbPlayerLead" style="font-size:7px;letter-spacing:2px;min-height:10px;font-weight:bold;"></span>\n'
    '    </div>'
)

with open('game.html', 'w', encoding='utf-8') as f:
    f.write(g)
print('game.html done')

# ─────────────────────────────────────────────────────────────────────────────
# index.html: difficulty selector + pass in URL
# ─────────────────────────────────────────────────────────────────────────────
with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

OLD_HDR = '  <div style="font-family:\'Orbitron\',monospace;font-size:20px;letter-spacing:5px;color:#fff;text-shadow:0 0 20px #8855ffaa;">SELECT YOUR OPPONENT</div>\n  <div style="font-size:10px;letter-spacing:3px;color:#554477;margin-bottom:4px;">CHOOSE WHO YOU WILL FACE AT SECTOR GZ-0</div>'
NEW_HDR = '''  <div style="font-family:'Orbitron',monospace;font-size:20px;letter-spacing:5px;color:#fff;text-shadow:0 0 20px #8855ffaa;">SELECT YOUR OPPONENT</div>
  <div style="font-size:10px;letter-spacing:3px;color:#554477;margin-bottom:8px;">CHOOSE WHO YOU WILL FACE AT SECTOR GZ-0</div>
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">
    <span style="font-size:9px;letter-spacing:2px;color:#443355;">DIFFICULTY:</span>
    <button id="diff-passive" onclick="setDiff('passive')" style="background:#0a0a18;border:1px solid #443355;color:#7755aa;font-family:inherit;font-size:9px;letter-spacing:2px;padding:6px 14px;cursor:pointer;border-radius:4px;transition:all 0.2s;">PASSIVE</button>
    <button id="diff-balanced" onclick="setDiff('balanced')" style="background:#1a0a2e;border:1px solid #8855ff;color:#aa88ff;font-family:inherit;font-size:9px;letter-spacing:2px;padding:6px 14px;cursor:pointer;border-radius:4px;transition:all 0.2s;">BALANCED</button>
    <button id="diff-aggressive" onclick="setDiff('aggressive')" style="background:#0a0a18;border:1px solid #443355;color:#7755aa;font-family:inherit;font-size:9px;letter-spacing:2px;padding:6px 14px;cursor:pointer;border-radius:4px;transition:all 0.2s;">AGGRESSIVE</button>
  </div>'''
idx = idx.replace(OLD_HDR, NEW_HDR)

OLD_LAUNCH = "function launchGame(opponentId) {\n  document.getElementById('opponentModal').style.display = 'none';\n  stopCivVoice();\n  // Pick opponent\n  const allRaceIds = RACES.map(r => r.id).filter(id => id !== selectedRace.id);\n  const aiId = opponentId === 'random'\n    ? allRaceIds[Math.floor(Math.random() * allRaceIds.length)]\n    : opponentId;"
NEW_LAUNCH = """let _selectedDifficulty = 'balanced';
function setDiff(d) {
  _selectedDifficulty = d;
  ['passive','balanced','aggressive'].forEach(k => {
    const btn = document.getElementById('diff-' + k);
    if (!btn) return;
    const a = k === d;
    btn.style.background   = a ? '#1a0a2e' : '#0a0a18';
    btn.style.borderColor  = a ? '#8855ff' : '#443355';
    btn.style.color        = a ? '#aa88ff' : '#7755aa';
  });
}
setTimeout(() => setDiff('balanced'), 0);

function launchGame(opponentId) {
  document.getElementById('opponentModal').style.display = 'none';
  stopCivVoice();
  const allRaceIds = RACES.map(r => r.id).filter(id => id !== selectedRace.id);
  const aiId = opponentId === 'random'
    ? allRaceIds[Math.floor(Math.random() * allRaceIds.length)]
    : opponentId;"""
idx = idx.replace(OLD_LAUNCH, NEW_LAUNCH)

idx = idx.replace(
    "  window.location.href = `game.html?race=${selectedRace.id}&ai=${aiId}`;",
    "  window.location.href = `game.html?race=${selectedRace.id}&ai=${aiId}&difficulty=${_selectedDifficulty}`;"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)
print('index.html done')
print('All patches applied.')
