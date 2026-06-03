"""Compact tooltip rebuild + score badge color fixes."""
with open('game.html', 'r', encoding='utf-8') as f:
    g = f.read()

# ── 1. Narrow tooltip width ──────────────────────────────────────────────────
g = g.replace(
    '.tooltip { width: 460px !important; max-width: min(460px,94vw) !important; }',
    '.tooltip { width: 260px !important; max-width: min(260px,94vw) !important; }'
)
print("Width narrowed to 260px")

# ── 2. Find and replace the tooltip innerHTML block ──────────────────────────
TITLE_MARKER = '    <!-- TITLE — large, full-width, centered -->'
ABILITY_END   = "      </div>`}\n    </div>\n\n  </div>`;"

start = g.find(TITLE_MARKER)
end   = g.find(ABILITY_END, start) + len(ABILITY_END)

if start == -1:
    print("ERROR: TITLE marker not found")
    exit(1)

print(f"Found tooltip block: {start} to {end}")

NEW_BODY = """    <!-- Compact: image + title/VP/tier | compass | zone | ability -->
    <div style="display:flex;gap:10px;padding:10px 12px 8px;border-bottom:1px solid var(--tc-dim);">
      ${card.art ? `
      <div style="position:relative;flex-shrink:0;width:72px;height:94px;">
        <img src="${card.art}" style="width:100%;height:100%;object-fit:cover;object-position:top;border-radius:5px;border:1px solid var(--tc-dim);">
        <div style="position:absolute;inset:0;border-radius:5px;overflow:hidden;pointer-events:none;">
          <div style="position:absolute;width:100%;height:35%;background:linear-gradient(transparent,var(--tc-glow),transparent);animation:tipScan 3.5s ease-in-out infinite;"></div>
        </div>
      </div>` : ''}
      <div style="flex:1;display:flex;flex-direction:column;gap:5px;min-width:0;">
        <div style="font-family:'Orbitron',monospace;color:var(--tc);font-size:11px;letter-spacing:1px;font-weight:700;line-height:1.2;">${card.name}</div>
        <div style="display:flex;align-items:center;gap:7px;">
          <div style="width:36px;height:36px;border-radius:50%;border:2px solid var(--tc);display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px var(--tc-glow);flex-shrink:0;">
            <span style="font-size:17px;font-weight:bold;color:var(--tc);">${card.power}</span>
          </div>
          <div style="font-size:8px;color:#555;letter-spacing:1px;">VP</div>
        </div>
        <div style="display:flex;align-items:center;gap:3px;">
          <span style="font-size:8px;color:#555;margin-right:2px;">T</span>
          ${Array.from({length:tierNum},()=>`<div style="width:9px;height:9px;border-radius:50%;background:${tierCol};box-shadow:0 0 4px ${tierCol};"></div>`).join('')}
          ${Array.from({length:4-tierNum},()=>`<div style="width:9px;height:9px;border-radius:50%;border:1px solid #2a2a3a;"></div>`).join('')}
        </div>
      </div>
    </div>

    <div style="display:flex;padding:8px 12px;gap:8px;border-bottom:1px solid var(--tc-dim);">
      <div style="flex:1;">
        <div style="font-size:8px;letter-spacing:2px;color:#555;margin-bottom:4px;">ATTACK POWER</div>
        <div style="position:relative;width:96px;height:96px;border:1px solid var(--tc-dim);border-radius:5px;background:#030310;">
          <div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:7px;color:#444;">N</div>
            <div style="font-size:18px;font-weight:bold;${nGlow}color:${nCol};line-height:1;">${n}</div>
          </div>
          <div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);text-align:center;">
            <div style="font-size:7px;color:#444;">S</div>
            <div style="font-size:18px;font-weight:bold;color:${sCol};line-height:1;">${s}</div>
          </div>
          <div style="position:absolute;left:3px;top:50%;transform:translateY(-50%);text-align:center;min-width:18px;">
            <div style="font-size:7px;color:#444;">W</div>
            <div style="font-size:18px;font-weight:bold;${wGlow}color:${wCol};line-height:1;">${w}</div>
          </div>
          <div style="position:absolute;right:3px;top:50%;transform:translateY(-50%);text-align:center;min-width:18px;">
            <div style="font-size:7px;color:#444;">E</div>
            <div style="font-size:18px;font-weight:bold;${wGlow}color:${eCol};line-height:1;">${e_}</div>
          </div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:var(--tc-dim);"></div>
        </div>
      </div>
      <div style="width:1px;background:var(--tc-dim);opacity:0.3;flex-shrink:0;"></div>
      <div style="flex:1;">
        <div style="font-size:8px;letter-spacing:2px;color:#555;margin-bottom:4px;">ZONE</div>
        ${card.zone ? buildZoneGrid(card) : `<div style="font-size:9px;color:#2a2a3a;">&#x2014;</div>`}
      </div>
    </div>

    <div style="padding:8px 12px 10px;">
      ${abi ? `
      <div style="border:1px solid #ffdd0044;border-radius:5px;padding:7px 10px;background:#ffdd0008;">
        <div style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:1px;color:#ffdd00;font-weight:700;margin-bottom:4px;">${abi.label}</div>
        <div style="font-size:11px;color:#ddd;line-height:1.5;">${card.abilityText}</div>
      </div>` : `
      <div style="font-size:10px;color:#333;letter-spacing:1px;font-style:italic;">No special ability</div>`}
    </div>

  </div>`;"""

g = g[:start] + NEW_BODY + g[end:]
print("Tooltip body rebuilt compact")

# ── 3. Fix score badges: WIN=player color, LOSE=opponent color, TIE=grey ────
# Row badge: add a thin colored left-border showing result
OLD_ROW_STATE = """    if (p===0&&a===0) {
      badge.style.cssText = `background:#07070f;border:1px solid #111120;`;
    } else if (res==='p') {
      badge.style.cssText = `background:${pCol}08;border:1px solid ${pCol}55;`;
    } else if (res==='a') {
      badge.style.cssText = `background:${aCol}08;border:1px solid ${aCol}55;`;
    } else {
      badge.style.cssText = `background:#0d0c18;border:1px solid #221a33;`;
    }
    badge.innerHTML = rowBadgeHtml(p, a, res);"""

NEW_ROW_STATE = """    // WIN=player color border, LOSE=opponent color border, TIE=grey
    const rowWinCol  = res==='p' ? pCol : res==='a' ? aCol : '#333';
    const rowBg      = res==='p' ? pCol+'08' : res==='a' ? aCol+'08' : (p===0&&a===0)?'#07070f':'#0d0c18';
    const rowBorder  = res==='p' ? pCol+'55' : res==='a' ? aCol+'55' : (p===0&&a===0)?'#111120':'#221a33';
    badge.style.cssText = `background:${rowBg};border:1px solid ${rowBorder};border-left:3px solid ${rowWinCol};`;
    badge.innerHTML = rowBadgeHtml(p, a, res);"""

if OLD_ROW_STATE in g:
    g = g.replace(OLD_ROW_STATE, NEW_ROW_STATE)
    print("Row badge colors updated")
else:
    print("WARNING: row badge state not found")

# Col badge: same treatment with border-top
OLD_COL_STATE = """    if (p===0&&a===0) {
      badge.style.cssText = `background:#07070f;border:1px solid #111120;`;
    } else if (res==='p') {
      badge.style.cssText = `background:${pCol}08;border:1px solid ${pCol}55;`;
    } else if (res==='a') {
      badge.style.cssText = `background:${aCol}08;border:1px solid ${aCol}55;`;
    } else {
      badge.style.cssText = `background:#0d0c18;border:1px solid #221a33;`;
    }
    badge.innerHTML = colBadgeHtml(p, a, res);"""

NEW_COL_STATE = """    // WIN=player color top-border, LOSE=opponent color, TIE=grey
    const colWinCol  = res==='p' ? pCol : res==='a' ? aCol : '#333';
    const colBg      = res==='p' ? pCol+'08' : res==='a' ? aCol+'08' : (p===0&&a===0)?'#07070f':'#0d0c18';
    const colBorder  = res==='p' ? pCol+'55' : res==='a' ? aCol+'55' : (p===0&&a===0)?'#111120':'#221a33';
    badge.style.cssText = `background:${colBg};border:1px solid ${colBorder};border-top:3px solid ${colWinCol};`;
    badge.innerHTML = colBadgeHtml(p, a, res);"""

if OLD_COL_STATE in g:
    g = g.replace(OLD_COL_STATE, NEW_COL_STATE)
    print("Col badge colors updated")
else:
    print("WARNING: col badge state not found")

# Update height estimate
g = g.replace(
    "  const ttH = tt.offsetHeight || 480;",
    "  const ttH = tt.offsetHeight || 360;"
)

with open('game.html', 'w', encoding='utf-8') as f:
    f.write(g)
print("Done")
