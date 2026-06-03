"""Generate the HTML balance report from balance_results.json"""

import json
import math

with open('balance_results.json') as f:
    data = json.load(f)

factions = data['factions']
faction_names = data['faction_names']
faction_colors = data['faction_colors']
final_rates = data['final_rates']
initial_rates = data['initial_rates']
pct_matrix = data['pct_matrix']
all_changes = data['all_changes']  # list of [iter, change_desc]
initial_std = data['initial_std']
final_std = data['final_std']
num_iterations = data['num_iterations']
iterations_detail = data['iterations_detail']

# Sort factions by final win rate (weakest to strongest)
sorted_factions = sorted(factions, key=lambda f: final_rates[f])

def get_status(pct):
    if pct < 43:
        return 'WEAK', '#ff4444'
    elif pct > 58:
        return 'STRONG', '#ff8800'
    else:
        return 'BALANCED', '#00cc88'

def cell_color(pct):
    if pct is None:
        return '#1a1a2a'
    if pct > 60:
        return '#004422'
    elif pct < 40:
        return '#330011'
    else:
        return '#1a1a2a'

def cell_text_color(pct):
    if pct is None:
        return '#444'
    if pct > 60:
        return '#00ff88'
    elif pct < 40:
        return '#ff4444'
    else:
        return '#ffcc55'

# Build changes by iteration
changes_by_iter = {}
for (it, change) in all_changes:
    if it not in changes_by_iter:
        changes_by_iter[it] = []
    changes_by_iter[it].append(change)

# Build changes by faction
changes_by_faction = {}
for (it, change) in all_changes:
    # Parse faction from "faction: CARD_NAME ..."
    parts = change.split(': ', 1)
    if len(parts) == 2:
        fk = parts[0]
        if fk not in changes_by_faction:
            changes_by_faction[fk] = []
        changes_by_faction[fk].append((it, change))

# Short labels for matrix header
short_names = {
    'terran': 'TERRAN',
    'brood': 'BROOD',
    'crystallis': 'CRYS',
    'mycos': 'MYCOS',
    'veil': 'VEIL',
    'entropy': 'ENTROPY',
    'void': 'VOID',
    'gas': 'GAS',
    'lithos': 'LITHOS',
    'quantum': 'QUANTUM',
    'choir': 'CHOIR',
}

html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GALACTIC ZERO - Balance Report</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: #06060f;
  color: #c8c8e0;
  font-family: 'Courier New', monospace;
  min-height: 100vh;
  overflow-x: hidden;
}

.page-bg {
  position: fixed; inset: 0; z-index: 0;
  background: radial-gradient(ellipse at 20% 20%, #0a0520 0%, #060610 40%, #060608 100%);
  pointer-events: none;
}
.stars {
  position: fixed; inset: 0; z-index: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, #ffffff22 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 10%, #ffffff18 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 70%, #ffffff15 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 80%, #ffffff20 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 40%, #ffffff12 0%, transparent 100%);
  pointer-events: none;
}

.container {
  position: relative; z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.header {
  text-align: center;
  margin-bottom: 60px;
  padding: 40px 20px 32px;
  border-bottom: 1px solid #8855ff22;
  position: relative;
}
.header::before {
  content: '';
  position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, #8855ff66, transparent);
}
.header-sub {
  font-size: 11px;
  letter-spacing: 6px;
  color: #5544aa;
  margin-bottom: 12px;
  text-transform: uppercase;
}
.header-title {
  font-family: 'Orbitron', monospace;
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 8px;
  color: #ffffff;
  text-shadow: 0 0 40px #8855ff66, 0 0 80px #8855ff22;
  line-height: 1.1;
}
.header-title span {
  color: #8855ff;
  text-shadow: 0 0 30px #8855ffaa;
}
.header-meta {
  margin-top: 14px;
  font-size: 11px;
  letter-spacing: 3px;
  color: #443366;
}

/* SECTION */
.section {
  margin-bottom: 60px;
}
.section-title {
  font-family: 'Orbitron', monospace;
  font-size: 16px;
  letter-spacing: 5px;
  color: #8855ff;
  padding-bottom: 12px;
  border-bottom: 1px solid #8855ff33;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: #8855ff;
  border-radius: 2px;
  box-shadow: 0 0 8px #8855ff;
}
.section-num {
  font-size: 10px;
  color: #443366;
  letter-spacing: 2px;
}

/* WIN RATE TABLE */
.win-table {
  width: 100%;
  border-collapse: collapse;
}
.win-table th {
  font-family: 'Orbitron', monospace;
  font-size: 9px;
  letter-spacing: 3px;
  color: #443366;
  padding: 8px 14px;
  text-align: left;
  border-bottom: 1px solid #1a1a2a;
}
.win-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #0e0e1e;
  font-size: 13px;
}
.win-table tr:hover td {
  background: #0e0e1e88;
}
.faction-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.faction-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px currentColor;
}
.faction-name {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  letter-spacing: 2px;
}
.rank-num {
  font-size: 11px;
  color: #333344;
  letter-spacing: 1px;
  min-width: 24px;
}

.win-bar-wrap {
  width: 200px;
  height: 6px;
  background: #0e0e1e;
  border-radius: 3px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}
.win-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.win-pct {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  display: inline-block;
  min-width: 48px;
}
.status-badge {
  font-size: 9px;
  letter-spacing: 2px;
  padding: 2px 8px;
  border-radius: 2px;
  font-family: 'Orbitron', monospace;
}
.status-ok { color: #00cc88; background: #00cc8812; border: 1px solid #00cc8844; }
.status-weak { color: #ff4444; background: #ff444412; border: 1px solid #ff444444; }
.status-strong { color: #ff8800; background: #ff880012; border: 1px solid #ff880044; }

.initial-rate {
  font-size: 11px;
  color: #445;
  letter-spacing: 1px;
}

/* MATRIX */
.matrix-wrap {
  overflow-x: auto;
  border-radius: 6px;
}
.matrix-table {
  border-collapse: collapse;
  font-size: 11px;
  min-width: 900px;
}
.matrix-table th {
  font-family: 'Orbitron', monospace;
  font-size: 8px;
  letter-spacing: 2px;
  padding: 8px 6px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #11111e;
}
.matrix-table th.row-header {
  text-align: right;
  padding-right: 12px;
  min-width: 110px;
}
.matrix-table td {
  padding: 7px 6px;
  text-align: center;
  border: 1px solid #11111e;
  font-weight: bold;
  letter-spacing: 1px;
  min-width: 60px;
}
.matrix-table td.self {
  background: #1a1a2a;
  color: #333344;
  font-size: 16px;
}
.matrix-table td.row-label {
  font-family: 'Orbitron', monospace;
  font-size: 8px;
  letter-spacing: 2px;
  text-align: right;
  padding-right: 12px;
  white-space: nowrap;
  background: #060610;
  border-right: 2px solid #1a1a2e;
}
.matrix-corner {
  background: #060610 !important;
  font-family: 'Orbitron', monospace;
  font-size: 8px;
  letter-spacing: 2px;
  color: #333344;
  padding: 8px 12px !important;
  border-right: 2px solid #1a1a2e !important;
  border-bottom: 2px solid #1a1a2e !important;
}
.legend-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 14px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 1px;
  color: #556;
}
.legend-box {
  width: 16px; height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* CHANGES */
.changes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.change-card {
  background: #08080e;
  border: 1px solid #1a1a28;
  border-radius: 6px;
  padding: 16px;
}
.change-card-header {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #151524;
}
.change-item {
  font-size: 11px;
  color: #778;
  padding: 3px 0;
  letter-spacing: 0.5px;
}
.change-item .iter-tag {
  display: inline-block;
  font-size: 9px;
  letter-spacing: 2px;
  color: #8855ff;
  background: #8855ff15;
  border: 1px solid #8855ff33;
  padding: 1px 5px;
  border-radius: 2px;
  margin-right: 6px;
}
.change-item .edge-change {
  color: #00cc88;
}
.change-item .edge-nerf {
  color: #ff6644;
}
.no-changes {
  color: #334;
  font-size: 12px;
  letter-spacing: 2px;
  padding: 20px 0;
}

/* BALANCE SCORE */
.score-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.score-card {
  background: #08080e;
  border: 1px solid #1a1a28;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.score-card-val {
  font-family: 'Orbitron', monospace;
  font-size: 36px;
  font-weight: 900;
  letter-spacing: 2px;
  line-height: 1;
  margin: 8px 0;
}
.score-card-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: #445;
  margin-top: 6px;
}
.score-card-sub {
  font-size: 11px;
  color: #556;
  margin-top: 4px;
  letter-spacing: 1px;
}

.improvement-bar-wrap {
  background: #0a0a18;
  border: 1px solid #1a1a28;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}
.improvement-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: #445;
  margin-bottom: 10px;
}
.progress-bar {
  height: 12px;
  background: #111120;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}
.progress-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #8855ff, #00cc88);
  box-shadow: 0 0 10px #8855ff44;
}
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #556;
  letter-spacing: 1px;
}

.iter-timeline {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.iter-pill {
  background: #08080e;
  border: 1px solid #1a1a28;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 10px;
  letter-spacing: 2px;
  color: #8855ff;
  font-family: 'Orbitron', monospace;
}
.iter-pill.active {
  border-color: #8855ff66;
  background: #8855ff12;
}

.footer {
  text-align: center;
  padding: 40px 0 20px;
  font-size: 10px;
  letter-spacing: 3px;
  color: #222233;
  border-top: 1px solid #0e0e1e;
  margin-top: 60px;
}
</style>
</head>
<body>
<div class="page-bg"></div>
<div class="stars"></div>

<div class="container">

  <div class="header">
    <div class="header-sub">Simulation Analysis Report</div>
    <div class="header-title">GALACTIC ZERO<br><span>BALANCE REPORT</span></div>
    <div class="header-meta">1,100 SIMULATED GAMES &middot; 11 FACTIONS &middot; GREEDY AI HEURISTIC &middot; DELTA VP SCORING</div>
  </div>

'''

# ── SECTION 1: WIN RATE TABLE ─────────────────────────────────────────────────
html += '''
  <!-- SECTION 1: WIN RATE TABLE -->
  <div class="section">
    <div class="section-title">
      <span>WIN RATE TABLE</span>
      <span class="section-num">01 / 04</span>
    </div>
    <table class="win-table">
      <thead>
        <tr>
          <th style="width:40px">RANK</th>
          <th>FACTION</th>
          <th>WIN RATE (FINAL)</th>
          <th>INITIAL RATE</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
'''

for rank, f in enumerate(sorted_factions, 1):
    pct = final_rates[f]
    init_pct = initial_rates[f]
    color = faction_colors[f]
    status_text, status_color = get_status(pct)
    status_class = 'status-ok' if status_text == 'BALANCED' else ('status-weak' if status_text == 'WEAK' else 'status-strong')

    bar_color = status_color
    bar_pct = min(100, max(0, pct))

    delta = pct - init_pct
    delta_str = f"+{delta:.1f}%" if delta > 0 else f"{delta:.1f}%"
    delta_color = '#00cc88' if delta > 0 else ('#ff4444' if delta < 0 else '#556')

    html += f'''
        <tr>
          <td><span class="rank-num">#{rank}</span></td>
          <td>
            <div class="faction-cell">
              <span class="faction-dot" style="background:{color};color:{color};"></span>
              <span class="faction-name" style="color:{color}">{faction_names[f]}</span>
            </div>
          </td>
          <td>
            <span class="win-bar-wrap">
              <span class="win-bar-fill" style="width:{bar_pct}%;background:{bar_color};box-shadow:0 0 6px {bar_color}44;"></span>
            </span>
            <span class="win-pct" style="color:{bar_color}">{pct:.1f}%</span>
          </td>
          <td>
            <span class="initial-rate">{init_pct:.1f}%
              <span style="color:{delta_color};font-size:10px;margin-left:4px">({delta_str})</span>
            </span>
          </td>
          <td><span class="status-badge {status_class}">{status_text}</span></td>
        </tr>
'''

html += '''
      </tbody>
    </table>
  </div>
'''

# ── SECTION 2: FACTION VS FACTION MATRIX ──────────────────────────────────────
html += '''
  <!-- SECTION 2: FACTION VS FACTION MATRIX -->
  <div class="section">
    <div class="section-title">
      <span>FACTION VS FACTION MATRIX</span>
      <span class="section-num">02 / 04</span>
    </div>
    <p style="font-size:11px;color:#445;letter-spacing:1px;margin-bottom:16px;">
      Row faction plays as PLAYER, column faction plays as AI (N/S edges flipped).
      Cell shows win % of the row faction.
    </p>
    <div class="matrix-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="matrix-corner">vs</th>
'''

for f in sorted_factions:
    color = faction_colors[f]
    html += f'<th style="color:{color}">{short_names[f]}</th>\n'

html += '</tr>\n</thead>\n<tbody>\n'

for pf in sorted_factions:
    pf_color = faction_colors[pf]
    html += f'<tr><td class="row-label" style="color:{pf_color}">{short_names[pf]}</td>\n'
    for af in sorted_factions:
        if pf == af:
            html += '<td class="self">--</td>\n'
        else:
            val = pct_matrix[pf][af]
            bg = cell_color(val)
            tc = cell_text_color(val)
            html += f'<td style="background:{bg};color:{tc}">{val:.0f}%</td>\n'
    html += '</tr>\n'

html += '''
      </tbody>
      </table>
    </div>
    <div class="legend-row">
      <div class="legend-item">
        <span class="legend-box" style="background:#004422;border:1px solid #00ff8844;"></span>
        <span>DOMINANT (&gt;60%)</span>
      </div>
      <div class="legend-item">
        <span class="legend-box" style="background:#1a1a2a;border:1px solid #ffcc5544;"></span>
        <span>COMPETITIVE (40-60%)</span>
      </div>
      <div class="legend-item">
        <span class="legend-box" style="background:#330011;border:1px solid #ff444444;"></span>
        <span>UNFAVORABLE (&lt;40%)</span>
      </div>
      <div class="legend-item">
        <span class="legend-box" style="background:#1a1a2a;border:1px solid #33334488;"></span>
        <span>SELF-MATCH (--)</span>
      </div>
    </div>
  </div>
'''

# ── SECTION 3: WHAT CHANGED ────────────────────────────────────────────────────
html += '''
  <!-- SECTION 3: WHAT CHANGED -->
  <div class="section">
    <div class="section-title">
      <span>WHAT CHANGED</span>
      <span class="section-num">03 / 04</span>
    </div>
    <p style="font-size:11px;color:#445;letter-spacing:1px;margin-bottom:20px;">
      Edge adjustments made across ''' + str(num_iterations) + ''' iterations. Only outlier factions adjusted.
      Changes target N edges of T2/T3 cards (+1 buff for weak factions, -1 nerf for strong factions).
    </p>
'''

# Iteration timeline
html += '<div class="iter-timeline">\n'
html += '<span class="iter-pill">BASELINE</span>\n'
for it in range(1, num_iterations + 1):
    html += f'<span class="iter-pill active">ITER {it}</span>\n'
html += '</div>\n'

# Changes per faction
html += '<div class="changes-grid" style="margin-top:24px;">\n'
for f in sorted_factions:
    color = faction_colors[f]
    if f in changes_by_faction:
        changes = changes_by_faction[f]
        html += f'''
      <div class="change-card" style="border-color:{color}22;">
        <div class="change-card-header" style="color:{color}">{faction_names[f]}</div>
'''
        for (it, change) in changes:
            # Parse: "faction: CARD_NAME N +1 -> X" or "-1 -> X"
            desc = change.split(': ', 1)[1] if ': ' in change else change
            is_buff = '+1' in desc
            change_class = 'edge-change' if is_buff else 'edge-nerf'
            change_symbol = '+' if is_buff else ''
            html += f'''        <div class="change-item">
          <span class="iter-tag">ITER {it}</span>
          <span class="{change_class}">{desc}</span>
        </div>
'''
        html += '      </div>\n'
    else:
        html += f'''
      <div class="change-card" style="border-color:{color}22;">
        <div class="change-card-header" style="color:{color}">{faction_names[f]}</div>
        <div class="no-changes">NO CHANGES REQUIRED</div>
      </div>
'''

html += '</div>\n</div>\n'

# ── SECTION 4: BALANCE SCORE ────────────────────────────────────────────────────
improvement = initial_std - final_std
improvement_pct = (improvement / initial_std * 100) if initial_std > 0 else 0

in_range_count = sum(1 for f in factions if 43 <= final_rates[f] <= 58)

html += f'''
  <!-- SECTION 4: BALANCE SCORE -->
  <div class="section">
    <div class="section-title">
      <span>BALANCE SCORE</span>
      <span class="section-num">04 / 04</span>
    </div>

    <div class="score-cards">
      <div class="score-card">
        <div class="score-card-label">INITIAL STD DEV</div>
        <div class="score-card-val" style="color:#ff4444">{initial_std:.2f}%</div>
        <div class="score-card-sub">from 50% target</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">FINAL STD DEV</div>
        <div class="score-card-val" style="color:#00cc88">{final_std:.2f}%</div>
        <div class="score-card-sub">from 50% target</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">IMPROVEMENT</div>
        <div class="score-card-val" style="color:#8855ff">{improvement:.2f}%</div>
        <div class="score-card-sub">{improvement_pct:.0f}% reduction in variance</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">FACTIONS IN RANGE</div>
        <div class="score-card-val" style="color:#00cc88">{in_range_count}/{len(factions)}</div>
        <div class="score-card-sub">43% - 58% win rate</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">ITERATIONS USED</div>
        <div class="score-card-val" style="color:#ffcc55">{num_iterations}</div>
        <div class="score-card-sub">of 5 maximum</div>
      </div>
      <div class="score-card">
        <div class="score-card-label">TOTAL GAMES</div>
        <div class="score-card-val" style="color:#a8d8ff">1,100</div>
        <div class="score-card-sub">per iteration run</div>
      </div>
    </div>

    <div class="improvement-bar-wrap">
      <div class="improvement-label">VARIANCE REDUCTION PROGRESS</div>
'''

# Add iteration-by-iteration std devs
iter_stds = []
for it_data in iterations_detail:
    rates_pct = it_data['rates']
    std = math.sqrt(sum((v-50)**2 for v in rates_pct.values()) / len(rates_pct))
    iter_stds.append(std)

max_std = max(iter_stds) if iter_stds else 1
for idx, (it_data, std) in enumerate(zip(iterations_detail, iter_stds)):
    bar_w = (1 - std/max_std) * 100 if max_std > 0 else 0
    label = f"ITER {it_data['iter']}" if it_data['iter'] > 0 else "BASELINE"
    html += f'''
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span style="font-size:9px;letter-spacing:2px;color:#445;min-width:80px;">{label}</span>
        <div class="progress-bar" style="flex:1;">
          <div class="progress-fill" style="width:{bar_w:.1f}%"></div>
        </div>
        <span style="font-size:11px;color:#8855ff;min-width:50px;text-align:right;">{std:.2f}%</span>
      </div>
'''

html += '''
    </div>
  </div>

  <div class="footer">
    GALACTIC ZERO &middot; AUTOMATED BALANCE ANALYSIS &middot; 1,100 SIMULATED GAMES &middot; GREEDY AI HEURISTIC
  </div>

</div>
</body>
</html>
'''

# Write report
with open('balance-report.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Also write to Desktop
import os
desktop_path = os.path.join(os.path.expanduser('~'), 'Desktop', 'balance-report.html')
with open(desktop_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Report saved to:")
print(f"  C:\\GitHub\\nullbreach\\balance-report.html")
print(f"  {desktop_path}")
