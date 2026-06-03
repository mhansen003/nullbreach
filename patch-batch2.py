"""
Batch patch for TODO items 1-11 (excluding #4 race abilities — user will discuss separately)
Run from: cd C:\\GitHub\\nullbreach && python patch-batch2.py
"""
with open('game.html', 'r', encoding='utf-8') as f:
    g = f.read()

# ─────────────────────────────────────────────────────────────────────────────
# 1. TOOLTIP — bigger text, better proportions, match wireframe labels
# ─────────────────────────────────────────────────────────────────────────────
OLD_TIP = '''  tt.innerHTML = `
  <div class="tip-shine-layer"></div>
  <div class="tip-body">

    <!-- ① TITLE -->
    <div style="text-align:center;padding:10px 16px 8px;border-bottom:1px solid var(--tc-dim);">
      <div style="font-family:'Orbitron',monospace;color:var(--tc);font-size:14px;letter-spacing:2px;font-weight:700;">${card.name}</div>
    </div>

    <!-- ② IMAGE + VICTORY POINTS + TIER -->
    <div style="display:flex;gap:14px;padding:12px 16px 10px;">
      ${card.art ? `
      <div style="position:relative;flex-shrink:0;width:130px;height:150px;">
        <img src="${card.art}" style="width:100%;height:100%;object-fit:cover;object-position:top;border-radius:6px;border:2px solid var(--tc-dim);">
        <div style="position:absolute;inset:0;border-radius:6px;overflow:hidden;pointer-events:none;">
          <div style="position:absolute;width:100%;height:35%;background:linear-gradient(transparent,var(--tc-glow),transparent);animation:tipScan 3.5s ease-in-out infinite;"></div>
        </div>
      </div>` : ''}
      <div style="flex:1;display:flex;flex-direction:column;gap:12px;justify-content:center;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:11px;letter-spacing:2px;color:#aaa;">VICTORY PTS:</span>
          <div style="width:46px;height:46px;border-radius:50%;border:2px solid var(--tc);display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px var(--tc-glow);">
            <span style="font-size:22px;font-weight:bold;color:var(--tc);">${card.power}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          <span style="font-size:11px;letter-spacing:2px;color:#aaa;margin-right:3px;">TIER</span>
          ${Array.from({length:tierNum},()=>`<div style="width:12px;height:12px;border-radius:50%;background:${tierCol};box-shadow:0 0 6px ${tierCol};"></div>`).join('')}
          ${Array.from({length:4-tierNum},()=>`<div style="width:12px;height:12px;border-radius:50%;border:1px solid #2a2a3a;opacity:0.4;"></div>`).join('')}
        </div>
        <div style="font-size:8px;letter-spacing:2px;color:var(--tc-dim);">${card.tierLabel || card.tier}</div>
      </div>
    </div>

    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--tc-dim),transparent);margin:0 14px;"></div>

    <!-- ③ ATTACK POWER COMPASS  +  ZONE EXPANSION -->
    <div style="display:flex;padding:12px 16px;gap:0;">
      <div style="flex:1;">
        <div style="font-size:11px;letter-spacing:2px;color:#aaa;margin-bottom:8px;">ATTACK POWER</div>
        <div style="position:relative;width:120px;height:120px;border:1px solid var(--tc-dim);border-radius:6px;background:#040410;">
          <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:7px;color:#444;letter-spacing:1px;">N</div>
            <div style="font-size:21px;font-weight:bold;${nGlow}color:${nCol};line-height:1;">${n}</div>
          </div>
          <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:7px;color:#444;letter-spacing:1px;">S</div>
            <div style="font-size:21px;font-weight:bold;${nGlow}color:${sCol};line-height:1;">${s}</div>
          </div>
          <div style="position:absolute;left:5px;top:50%;transform:translateY(-50%);text-align:center;min-width:22px;">
            <div style="font-size:7px;color:#444;letter-spacing:1px;">W</div>
            <div style="font-size:21px;font-weight:bold;${wGlow}color:${wCol};line-height:1;">${w}</div>
          </div>
          <div style="position:absolute;right:5px;top:50%;transform:translateY(-50%);text-align:center;min-width:22px;">
            <div style="font-size:7px;color:#444;letter-spacing:1px;">E</div>
            <div style="font-size:21px;font-weight:bold;${wGlow}color:${eCol};line-height:1;">${e_}</div>
          </div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:5px;height:5px;border-radius:50%;background:var(--tc-dim);"></div>
        </div>
      </div>
      <div style="width:1px;background:var(--tc-dim);opacity:0.35;flex-shrink:0;margin:0 12px;"></div>
      <div style="flex:1;">
        <div style="font-size:11px;letter-spacing:2px;color:#aaa;margin-bottom:8px;">ZONE EXPANSION</div>
        ${card.zone ? buildZoneGrid(card) : `<div style="font-size:10px;color:#2a2a3a;">No expansion</div>`}
      </div>
    </div>

    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--tc-dim),transparent);margin:0 14px;"></div>

    <!-- ④ SPECIAL ABILITY / POWER — yellow standard, no emoji -->
    <div style="padding:10px 16px 12px;">
      ${abi ? `
      <div style="border:1px solid #ffdd0055;border-radius:6px;padding:10px 14px;background:#ffdd0008;">
        <div style="font-family:'Orbitron',monospace;font-size:12px;letter-spacing:2px;color:#ffdd00;font-weight:700;margin-bottom:6px;">${abi.label}</div>
        <div style="font-size:13px;color:#ffffff;line-height:1.7;letter-spacing:0.3px;">${card.abilityText}</div>
      </div>` : `
      <div style="border:1px solid #1a1a28;border-radius:6px;padding:10px 14px;">
        <div style="font-size:12px;color:#555;letter-spacing:1px;">No special ability — pure positioning</div>
      </div>`}
    </div>

  </div>`;'''

NEW_TIP = '''  tt.innerHTML = `
  <div class="tip-shine-layer"></div>
  <div class="tip-body">

    <!-- TITLE — large, full-width, centered -->
    <div style="text-align:center;padding:12px 16px 10px;border-bottom:1px solid var(--tc-dim);">
      <div style="font-family:'Orbitron',monospace;color:var(--tc);font-size:16px;letter-spacing:3px;font-weight:900;">${card.name}</div>
    </div>

    <!-- IMAGE left | VICTORY POINTS + TIER right -->
    <div style="display:flex;gap:14px;padding:14px 16px 12px;align-items:flex-start;">
      ${card.art ? `
      <div style="position:relative;flex-shrink:0;width:150px;height:150px;">
        <img src="${card.art}" style="width:100%;height:100%;object-fit:cover;object-position:top;border-radius:8px;border:2px solid var(--tc-dim);">
        <div style="position:absolute;inset:0;border-radius:8px;overflow:hidden;pointer-events:none;">
          <div style="position:absolute;width:100%;height:35%;background:linear-gradient(transparent,var(--tc-glow),transparent);animation:tipScan 3.5s ease-in-out infinite;"></div>
        </div>
      </div>` : ''}
      <div style="flex:1;display:flex;flex-direction:column;gap:14px;padding-top:4px;">
        <!-- Victory Points -->
        <div>
          <div style="font-size:11px;letter-spacing:2px;color:#888;margin-bottom:8px;">VICTORY POINTS</div>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:54px;height:54px;border-radius:50%;border:2px solid var(--tc);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px var(--tc-glow),0 0 6px var(--tc-dim);">
              <span style="font-size:26px;font-weight:bold;color:var(--tc);line-height:1;">${card.power}</span>
            </div>
            <div style="font-size:10px;color:#555;letter-spacing:1px;">${{'I':'TIER ONE','II':'TIER TWO','III':'TIER THREE','IV':'TIER FOUR'}[card.tier]||card.tier}</div>
          </div>
        </div>
        <!-- Tier dots row -->
        <div>
          <div style="font-size:11px;letter-spacing:2px;color:#888;margin-bottom:6px;">TIER</div>
          <div style="display:flex;gap:7px;align-items:center;">
            ${Array.from({length:tierNum},()=>`<div style="width:16px;height:16px;border-radius:50%;background:${tierCol};box-shadow:0 0 8px ${tierCol};"></div>`).join('')}
            ${Array.from({length:4-tierNum},()=>`<div style="width:16px;height:16px;border-radius:50%;border:1px solid #2a2a3a;"></div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--tc-dim),transparent);margin:0 14px;"></div>

    <!-- ATTACK POWER compass | ADJACENT ALLOCATION zone -->
    <div style="display:flex;padding:14px 16px;gap:12px;">
      <!-- Compass box -->
      <div style="flex:1;">
        <div style="font-size:11px;letter-spacing:2px;color:#888;margin-bottom:10px;font-weight:bold;">ATTACK POWER</div>
        <div style="position:relative;width:130px;height:130px;border:1px solid var(--tc-dim);border-radius:8px;background:#030310;">
          <!-- N -->
          <div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:9px;color:#555;letter-spacing:1px;font-weight:bold;">N</div>
            <div style="font-size:24px;font-weight:bold;${nGlow}color:${nCol};line-height:1;">${n}</div>
          </div>
          <!-- S -->
          <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:9px;color:#555;letter-spacing:1px;font-weight:bold;">S</div>
            <div style="font-size:24px;font-weight:bold;color:${sCol};line-height:1;">${s}</div>
          </div>
          <!-- W -->
          <div style="position:absolute;left:7px;top:50%;transform:translateY(-50%);text-align:center;min-width:26px;">
            <div style="font-size:9px;color:#555;letter-spacing:1px;font-weight:bold;">W</div>
            <div style="font-size:24px;font-weight:bold;${wGlow}color:${wCol};line-height:1;">${w}</div>
          </div>
          <!-- E -->
          <div style="position:absolute;right:7px;top:50%;transform:translateY(-50%);text-align:center;min-width:26px;">
            <div style="font-size:9px;color:#555;letter-spacing:1px;font-weight:bold;">E</div>
            <div style="font-size:24px;font-weight:bold;${wGlow}color:${eCol};line-height:1;">${e_}</div>
          </div>
          <!-- Center dot -->
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;border-radius:50%;background:var(--tc-dim);"></div>
        </div>
      </div>
      <div style="width:1px;background:var(--tc-dim);opacity:0.3;flex-shrink:0;"></div>
      <!-- Zone grid -->
      <div style="flex:1;">
        <div style="font-size:11px;letter-spacing:2px;color:#888;margin-bottom:10px;font-weight:bold;">ADJ. ALLOCATION</div>
        ${card.zone ? buildZoneGrid(card) : `<div style="font-size:11px;color:#2a2a3a;">No expansion</div>`}
      </div>
    </div>

    <div style="height:1px;background:linear-gradient(90deg,transparent,var(--tc-dim),transparent);margin:0 14px;"></div>

    <!-- SPECIAL ABILITY / POWER -->
    <div style="padding:12px 16px 14px;">
      ${abi ? `
      <div style="border:1px solid #ffdd0066;border-radius:8px;padding:12px 14px;background:#ffdd000a;">
        <div style="font-family:'Orbitron',monospace;font-size:13px;letter-spacing:2px;color:#ffdd00;font-weight:700;margin-bottom:7px;">${abi.label}</div>
        <div style="font-style:italic;font-size:14px;color:#ffffff;line-height:1.7;letter-spacing:0.3px;">Special Ability / Power:&nbsp;${card.abilityText}</div>
      </div>` : `
      <div style="border:1px solid #1a1a28;border-radius:8px;padding:12px 14px;">
        <div style="font-style:italic;font-size:13px;color:#444;letter-spacing:1px;">No special ability — pure positioning card</div>
      </div>`}
    </div>

  </div>`;'''

if OLD_TIP in g:
    g = g.replace(OLD_TIP, NEW_TIP)
    print('Tooltip rebuilt')
else:
    print('WARNING: tooltip old string not found - skipping tooltip')

# Update tooltip width
g = g.replace(
    '.tooltip { width: 430px !important; max-width: 430px !important; }',
    '.tooltip { width: 460px !important; max-width: 460px !important; }'
)

# ─────────────────────────────────────────────────────────────────────────────
# 3. GAME-OVER MODAL — redesign overlay with winner/loser avatars
# ─────────────────────────────────────────────────────────────────────────────
OLD_OVERLAY = '''  if (s.pVP > s.aVP) {
    title.className = 'overlay-title win';
    title.textContent = 'BREACH COMPLETE';
    sub.textContent   = `${s.pVP} VP vs ${s.aVP} VP`;
  } else if (s.aVP > s.pVP) {
    title.className = 'overlay-title lose';
    title.textContent = 'BREACH FAILED';
    sub.textContent   = `AI wins ${s.aVP} VP vs your ${s.pVP} VP`;'''

NEW_OVERLAY = '''  const pWon = s.pVP > s.aVP, draw = s.pVP === s.aVP;
  const winCol2 = pWon ? (window.playerFactionColor||'#00ffcc') : draw ? '#888' : (window.aiFactionColor||'#ff0080');
  const winAv2  = pWon ? (window.playerAvatarImg||'') : draw ? '' : (window.aiAvatarImg||'');
  const loseAv2 = pWon ? (window.aiAvatarImg||'') : (window.playerAvatarImg||'');
  const winNm2  = pWon ? (window.playerFactionName||'YOU') : draw ? 'STALEMATE' : (window.aiFactionName||'AI');
  const loseNm2 = pWon ? (window.aiFactionName||'AI') : (window.playerFactionName||'YOU');
  const winVP2  = pWon ? s.pVP : s.aVP;
  const loseVP2 = pWon ? s.aVP : s.pVP;

  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:36px 44px;max-width:460px;">
      <div style="font-family:'Orbitron',monospace;font-size:20px;letter-spacing:5px;
        color:${winCol2};text-shadow:0 0 28px ${winCol2}88;">
        ${pWon?'BREACH COMPLETE':draw?'STALEMATE':'BREACH FAILED'}
      </div>
      <div style="display:flex;align-items:center;gap:18px;">
        <!-- Winner -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
          <img src="${winAv2}" style="width:96px;height:96px;border-radius:50%;object-fit:cover;
            object-position:top;border:3px solid ${winCol2};box-shadow:0 0 28px ${winCol2}66;">
          <span style="font-size:9px;letter-spacing:2px;color:${winCol2};">${winNm2}</span>
          <span style="font-size:32px;font-weight:bold;color:${winCol2};
            text-shadow:0 0 16px ${winCol2};">${winVP2}</span>
          <span style="font-size:9px;letter-spacing:2px;color:${winCol2}66;">VP</span>
        </div>
        <!-- VS -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
          <span style="font-size:11px;color:#222;letter-spacing:3px;">VS</span>
        </div>
        <!-- Loser -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;filter:grayscale(0.7);opacity:0.45;">
          <img src="${loseAv2}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;
            object-position:top;border:2px solid #444;">
          <span style="font-size:9px;letter-spacing:2px;color:#555;">${loseNm2}</span>
          <span style="font-size:22px;font-weight:bold;color:#555;">${loseVP2}</span>
          <span style="font-size:9px;letter-spacing:2px;color:#333;">VP</span>
        </div>
      </div>
      <div style="height:1px;background:#1a1a28;width:100%;margin:4px 0;"></div>
      <div style="font-size:10px;color:#444;letter-spacing:2px;">
        ${s.pWins} rows/cols won by you | ${s.aWins} by AI
      </div>
      <div style="display:flex;gap:14px;margin-top:4px;">
        <button onclick="initGame()" style="background:#0a1a14;border:1px solid #226644;color:#00ffcc;
          font-family:inherit;font-size:11px;letter-spacing:3px;padding:12px 28px;
          cursor:pointer;border-radius:5px;transition:all 0.2s;"
          onmouseenter="this.style.background='#0e2a1e'"
          onmouseleave="this.style.background='#0a1a14'">↺ REMATCH</button>
        <button onclick="goToMenu()" style="background:#1a0a2e;border:1px solid #6644aa;color:#aa88ff;
          font-family:inherit;font-size:11px;letter-spacing:3px;padding:12px 28px;
          cursor:pointer;border-radius:5px;transition:all 0.2s;"
          onmouseenter="this.style.background='#2a1040'"
          onmouseleave="this.style.background='#1a0a2e'">← DECK SELECT</button>
      </div>
    </div>`;
  overlay.classList.add('show');

  if (false && s.pVP > s.aVP) {
    title.className = 'overlay-title win';
    title.textContent = 'BREACH COMPLETE';
    sub.textContent   = `${s.pVP} VP vs ${s.aVP} VP`;
  } else if (false && s.aVP > s.pVP) {
    title.className = 'overlay-title lose';
    title.textContent = 'BREACH FAILED';
    sub.textContent   = `AI wins ${s.aVP} VP vs your ${s.pVP} VP`;'''

if OLD_OVERLAY in g:
    g = g.replace(OLD_OVERLAY, NEW_OVERLAY)
    print('Game-over modal rebuilt')
else:
    print('WARNING: game-over old string not found')

# ─────────────────────────────────────────────────────────────────────────────
# 6. FIX AI CARD ANIMATION SOURCE POSITION
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  // Source: first unused face-down AI deck card, or fall back to AI avatar\n"
    "  const srcEl  = document.querySelector('.fd-card:not(.used)') ||\n"
    "                 document.querySelector('.ai-avatar');",
    "  // Source: AI avatar in the faction HUD (top-left), or top-center of viewport\n"
    "  const srcEl  = document.getElementById('sbAiAvatar') ||\n"
    "                 document.getElementById('fhAi');"
)
print('AI animation source fixed')

# ─────────────────────────────────────────────────────────────────────────────
# 7. ABILITY POOLS — add 9 new races (placeholder, same structure as terran)
# ─────────────────────────────────────────────────────────────────────────────
OLD_POOLS = """const FACTION_ABILITY_POOLS = {
  terran:   ['shield','double_strike','commander','flank'],
  brood:    ['commander','sweep','rush','boost'],
  _default: ['shield','double_strike','boost','sweep','pierce','flank'],
};"""

NEW_POOLS = """const FACTION_ABILITY_POOLS = {
  terran:     ['shield','double_strike','commander','flank'],
  brood:      ['commander','sweep','rush','boost'],
  // 9 new races — abilities will be finalized in race interview
  crystallis: ['shield','commander','pierce','boost'],
  mycos:      ['boost','sweep','rush','commander'],
  veil:       ['pierce','double_strike','flank','sweep'],
  entropy:    ['drain','sweep','shield','double_strike'],
  void:       ['double_strike','pierce','rush','flank'],
  gas:        ['surge','sweep','boost','flank'],
  lithos:     ['shield','commander','boost','pierce'],
  quantum:    ['pierce','double_strike','flank','rush'],
  choir:      ['sweep','boost','double_strike','commander'],
  _default:   ['shield','double_strike','boost','sweep','pierce','flank'],
};"""

if OLD_POOLS in g:
    g = g.replace(OLD_POOLS, NEW_POOLS)
    print('Faction ability pools updated for 9 races')
else:
    print('WARNING: old pools not found')

# ─────────────────────────────────────────────────────────────────────────────
# 8. MOBILE IMPROVEMENTS — better small-screen handling
# ─────────────────────────────────────────────────────────────────────────────
# Faction HUD — smaller on mobile
OLD_HUD_MOBILE = ""
# Add after the existing mobile section for tablet
MOBILE_HUD_CSS = """
/* ── FACTION HUD: smaller on mobile ── */
@media (max-width: 900px) {
  #factionHUD { top: 44px !important; min-width: 130px !important; padding: 5px 7px !important; }
  #factionHUD .bedge { font-size: 10px !important; }
  #sbAiNum, #sbPlayerNum { font-size: 18px !important; }
  #sbAiAvatar, #sbPlayerAvatar { width: 26px !important; height: 26px !important; }
  .tooltip { width: min(460px, 96vw) !important; max-width: 96vw !important; }
}
@media (max-width: 599px) {
  #factionHUD { position: fixed; top: auto !important; bottom: 4px; left: 4px; right: 4px;
    flex-direction: row !important; justify-content: space-around;
    border-radius: 8px; padding: 6px 10px !important; }
  #fhAi, #fhPlayer { flex-direction: row !important; gap: 8px; }
  #sbAiNum, #sbPlayerNum { font-size: 20px !important; }
  .hand-locked-badge { width: 30px !important; }
}"""

# Insert before the closing </style>
g = g.replace('html { -webkit-text-size-adjust: 100%; }\nbutton, [onclick] { touch-action: manipulation; }',
              'html { -webkit-text-size-adjust: 100%; }\nbutton, [onclick] { touch-action: manipulation; }' + MOBILE_HUD_CSS)
print('Mobile HUD styles added')

# ─────────────────────────────────────────────────────────────────────────────
# 11. TOOLTIP — fix width on very small screens
# ─────────────────────────────────────────────────────────────────────────────
g = g.replace(
    "  const ttH = tt.offsetHeight || 460;\n"
    "  const ttW = tt.offsetWidth  || 435;",
    "  const ttH = tt.offsetHeight || 480;\n"
    "  const ttW = Math.min(tt.offsetWidth || 460, window.innerWidth - 16);"
)
print('Tooltip width capped to viewport')

with open('game.html', 'w', encoding='utf-8') as f:
    f.write(g)
print('\n✓ game.html patched successfully')
