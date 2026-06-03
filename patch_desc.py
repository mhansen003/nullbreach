with open('index.html','r',encoding='utf-8') as f: t=f.read()

old_start = "const ABILITY_DESC = {"
old_end   = "};"
start = t.find(old_start)
end   = t.find(old_end, start) + len(old_end)

new_desc = """const ABILITY_DESC = {
  // TERRAN
  'COLONIAL BULWARK':      'The first edge comparison loss is permanently blocked in that direction',
  'ACCORD BARRAGE':        'Winning an edge fires a second hit at half strength — discipline strikes twice',
  'FLEET ADMIRAL':         'Adjacent same-tier friendly cards gain +2 to all edges on placement',
  'PINCER MANEUVER':       'After placing, take an immediate extra turn before the opponent responds',
  // BROOD
  'HIVE PULSE':            'Adjacent same-tier Brood cards gain +2 to all edges — hive coordination',
  'MANDIBLE LEVEL':        'All 4 edges normalize to the 2nd-highest value on placement — even spread',
  'ACID CHARGE':           'Can be placed adjacent to any enemy card anywhere, bypassing zone rules',
  "QUEEN'S FAVOR":         'Adjacent friendly cards of any tier gain +1 to all edges on placement',
  // CRYSTALLIS
  'CRYSTAL FORTRESS':      'This card = 0 VP. Two random adjacent enemies also contribute 0 VP',
  'REFRACTION':            'When 2+ enemies are adjacent, strongest and weakest facing edges swap',
  'LATTICE WARD':          'The first edge comparison loss is permanently blocked — crystal holds',
  'CRYSTAL DENSITY':       'This card counts as 1.5x power in VP — lattice mass wins lines',
  // MYCOS
  'MYCELIUM LINK':         'Middle of a vertical 3-card line: N/S edges distribute to flankers',
  'SPORE BURST':           'A weak bonus T2 card spawns into your hand at game start',
  'MYCELIAL NETWORK':      'If row AND column are both won, this card scores double VP',
  'MYCO TOXIN':            'Adjacent enemy cards each lose -1 from their highest edge permanently',
  // VEIL
  'PHASE SHIFT':           'Can be placed anywhere in own home 2 rows without zone restrictions',
  'AFTERIMAGE':            'After placing, take an immediate extra turn — light outruns darkness',
  'LIGHT BEND':            'If on a border cell, also competes against the opposite board edge card',
  'PHOTON LANCE':          'Tie results count as wins — light never draws, it passes through',
  // ENTROPY
  'ENTROPY REVERSAL':      'With 2+ adjacent enemies, strongest and weakest facing edges swap',
  'RUST EQUALIZE':         'All 4 edges normalize to the 2nd-highest value — corrosion levels all',
  'SECOND ROT':            'After winning an edge, fires a second hit at half strength',
  'CORROSIVE STRIKE':      'Two random adjacent enemies each lose -1 to all 4 edges permanently',
  // VOID
  'VOID LANCE':            'Silences the nearest enemy in this column — contributes 0 VP permanently',
  'DARK SURGE':            'Two random adjacent enemies each lose -1 to all 4 edges on placement',
  'DARK LUNGE':            'Can be placed adjacent to any enemy card anywhere, bypassing zone rules',
  'EVENT HORIZON':         'Tie results count as wins — the void consumes all uncertainty',
  // GAS
  'STORM WRAP':            'If on a border cell, also competes against the opposite board edge card',
  'PLASMA SURGE':          'Win by 3+ and both row AND column are claimed simultaneously',
  'STORM BIRTH':           'A weak bonus T2 card spawns into your hand at game start',
  'TWIN PLASMA':           'After winning an edge, fires a second hit at half strength',
  // LITHOS
  'TECTONIC HOLD':         'This card = 0 VP. Two random adjacent enemies also contribute 0 VP',
  'FAULT LINE':            'Tied rows or columns tip +1 in your favor — pressure breaks deadlocks',
  'TECTONIC ARRAY':        'Adjacent same-tier friendly cards gain +2 to all edges on placement',
  'MONOLITH MASS':         'This card counts as 1.5x power in VP — ancient mass wins lines',
  // QUANTUM
  'QUANTUM ENTANGLEMENT':  'If row AND column are both won, this card scores double VP',
  'WAVE COLLAPSE':         'Tied rows or columns tip +1 in your favor — state collapses for you',
  'SUPERPOSITION':         'Can be placed anywhere in own home 2 rows without zone restrictions',
  'OBSERVER EFFECT':       'Silences the nearest enemy in this column — observation = 0 VP',
  // CHOIR
  'RESONANT CHORD':        'Middle of a vertical 3-card line: N/S edges distribute to flankers',
  'SONIC BOOM':            'Win by 3+ and both row AND column are claimed simultaneously',
  'HARMONIC PULSE':        'Adjacent friendly cards of any tier gain +1 to all edges on placement',
  'DISSONANCE':            'Adjacent enemy cards each lose -1 from their highest edge permanently',
};"""

t = t[:start] + new_desc + t[end:]
with open('index.html','w',encoding='utf-8') as f: f.write(t)
print('Done')
