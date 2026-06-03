"""Fix multiple bugs in index.html and game.html"""

# === index.html fixes ===
with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# 1. Bump modal z-index to 99999 (fix: modal behind conveyor)
idx = idx.replace(
    'display:none;position:fixed;inset:0;z-index:2000;',
    'display:none;position:fixed;inset:0;z-index:99999;'
)

# 2. Fix lore background mask - start right at conveyor bottom, not 40px below
idx = idx.replace(
    'const fadeStart = clipTop + 40; // image only starts showing BELOW the conveyor',
    'const fadeStart = clipTop - 10; // blend starts right at conveyor bottom'
)

# 3. Use offsetLeft for conveyor measurement (not affected by CSS transform = no jerk)
idx = idx.replace(
    '  const a = tiles[0].getBoundingClientRect().left;\n  const b = tiles[TILE_COUNT].getBoundingClientRect().left;\n  CV_LOOP_PX = Math.abs(b - a);',
    '  const a = tiles[0].offsetLeft;\n  const b = tiles[TILE_COUNT].offsetLeft;\n  CV_LOOP_PX = Math.round(Math.abs(b - a));'
)

# 4. Round cvPos to prevent float drift jerk
idx = idx.replace(
    '    track.style.transform = `translateX(${-cvPos}px)`;',
    '    track.style.transform = `translateX(${-Math.round(cvPos)}px)`;'
)

# 5. Remove arrow from Launch Deck button, center text
idx = idx.replace('>LAUNCH DECK &#x2197;<', '>LAUNCH DECK<')

# 6. Add hover CSS for ability cards and lore panels
hover_css = '''
/* Hover pop effect on ability cards */
.ability-showcase {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s;
  cursor: default;
}
.ability-showcase:hover {
  transform: scale(1.025) translateY(-3px);
  box-shadow: 0 8px 28px currentColor;
  background: color-mix(in srgb, currentColor 15%, #000000aa) !important;
}

'''
idx = idx.replace('/* ── ANIMATIONS ── */', hover_css + '/* ── ANIMATIONS ── */')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)
print('index.html fixed')

# === game.html fixes ===
with open('game.html', 'r', encoding='utf-8') as f:
    g = f.read()

# 7. Load correct deck based on race URL param
g = g.replace(
    '    playerHand: PLAYER_CARDS.map(c => ({...c, shieldExpended: false, used: false})),',
    '''    // Dynamic deck loading: use the race selected on deck screen
    const _raceId = new URLSearchParams(window.location.search).get('race') || 'terran';
    const _RACE_DECKS = { terran: PLAYER_CARDS, brood: BROOD_CARDS };
    const _activeDeck = _RACE_DECKS[_raceId] || PLAYER_CARDS;
    playerHand: _activeDeck.map(c => ({...c, shieldExpended: false, used: false})),'''
)

with open('game.html', 'w', encoding='utf-8') as f:
    f.write(g)
print('game.html fixed')
print('All done')
