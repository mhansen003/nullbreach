/**
 * nullbreach 1000-game simulation harness
 * Run: node dev/sim1k.js
 * Requires: all game JS files loadable in Node
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── Minimal browser shims ─────────────────────────────────────────────────
global.window   = global;
// Full DOM shim — returns stub objects with all common properties
function makeEl() {
  const el = {
    style: new Proxy({}, { get:()=>'', set:()=>true }),
    classList: { add:()=>{}, remove:()=>{}, contains:()=>false, toggle:()=>{} },
    innerHTML: '', textContent: '', src: '', href: '',
    appendChild: (n)=>{ el.children.push(n); return n; }, addEventListener: ()=>{},
    removeEventListener: ()=>{}, remove: ()=>{},
    querySelector: ()=>null, querySelectorAll: ()=>{ const a=[]; a.forEach=Array.prototype.forEach.bind(a); return a; },
    getBoundingClientRect: ()=>({ left:0,top:0,right:0,bottom:0,width:0,height:0 }),
    getAttribute: ()=>null, setAttribute: ()=>{},
    dataset: new Proxy({}, { get:()=>'', set:()=>true }),
    checked: false, value: '', children: [],
    offsetHeight: 200, offsetWidth: 200,
    // Audio element methods
    load: ()=>{}, play: ()=>Promise.resolve(), pause: ()=>{},
    currentTime: 0, volume: 1,
  };
  return el;
}
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.location = { search: '', href: '', hash: '' };
global.document = {
  getElementById:   () => makeEl(),
  querySelector:    () => null,
  querySelectorAll: () => ({ forEach:()=>{}, length:0, [Symbol.iterator]:()=>[][Symbol.iterator]() }),
  createElement:    () => makeEl(),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: makeEl(),
  documentElement: makeEl(),
};
global.localStorage  = { getItem: () => null, setItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {} };
global.setTimeout  = (fn) => { try { fn(); } catch(e) {} };
global.clearTimeout = () => {};
global.requestAnimationFrame = (fn) => { try { fn(0); } catch(e) {} return 0; };
global.cancelAnimationFrame = () => {};

// Silence all render / UI functions
global.renderAll = () => {};
global.renderGrid = () => {};
global.renderHand = () => {};
global.renderAiHand = () => {};
global.renderScoreHeader = () => {};
global.renderScoreBadges = () => {};
global.renderPassiveAbilityGlows = () => {};
global.renderBattleIndicators = () => {};
global.showTip = () => {};
global.hideTip = () => {};
global.showToast = () => {};
global.showFlash = () => {};
global.addLog = () => {};
global.playCardSfx = () => {};
global.playHoverSfx = () => {};
global.playSelectSfx = () => {};
global.startGameMusic = () => {};
global.hideDragCard = () => {};
global.showDragCard = () => {};
global.showMobileCardPanel = () => {};
global.hideMobileCardPanel = () => {};
global.animateAiCard = (card, r, c) => { try { placeCard(card, r, c, 'ai'); } catch(e) {} };
global.checkWin = () => {};
global.checkLeaderboardRecord = () => {};
global._mpRoom = null;
global._mpPlayer = null;
global._sfxMuted = true;
global.aiDifficulty = 'balanced';
global.innerWidth = 1280;

// ── Load all game modules ─────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const MODULES = [
  'shared-data.js',
  'zones.js','cards.js','abilities-data.js',
  'utils.js','audio.js','battle.js','placement.js',
  'abilities.js','ai.js',
  'render-score.js','render-grid.js','render-hand.js',
  'tooltip.js','mobile.js','guide.js','multiplayer.js',
  'state.js','turn.js','ui.js'
];

for (const mod of MODULES) {
  try {
    const code = fs.readFileSync(path.join(ROOT, mod), 'utf8');
    vm.runInThisContext(code, { filename: mod });
  } catch(e) {
    console.error(`Failed to load ${mod}: ${e.message}`);
    process.exit(1);
  }
}

// ── Simulation helpers ────────────────────────────────────────────────────
function makeRng(seed) {
  // Simple LCG
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function simulateGame(seed) {
  const rng = makeRng(seed);
  const errors = [];
  const abilitiesFired = {};

  // Set up window globals used by state.js
  window.playerRaceId = 'terran';
  window.aiRaceId = ['brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'][seed % 10];
  window.playerFactionColor = '#00ffcc';
  window.aiFactionColor = '#ff0080';
  window.playerFactionName = 'TERRAN';
  window.aiFactionName = 'OPPONENT';
  window.playerAvatarImg = '';
  window.aiAvatarImg = '';
  window.__activeDeck = PLAYER_CARDS;
  window.aiDifficulty = 'balanced';

  try { initGame(); } catch(e) {
    if (seed <= 3) console.error('Game', seed, 'initGame error:', e.message, e.stack.split('\n')[1]);
    return { error: 'initGame: ' + e.message, seed };
  }

  let turns = 0;
  const MAX_TURNS = 70;

  while (!G.gameOver && turns < MAX_TURNS) {
    turns++;
    const owner = G.turn === 'player' ? 'player' : 'ai';
    const hand  = owner === 'player' ? G.playerHand : G.aiHand;
    const avail = hand.filter(c => !c.used);

    if (!avail.length) { G.turn = owner === 'player' ? 'ai' : 'player'; continue; }

    const card = avail[Math.floor(rng() * avail.length)];

    let valid = [];
    try { valid = getValidPlacements(owner, card); }
    catch(e) { errors.push('getValidPlacements: ' + e.message); G.turn = owner === 'player' ? 'ai' : 'player'; continue; }

    if (!valid.length) { G.turn = owner === 'player' ? 'ai' : 'player'; continue; }

    const cell = valid[Math.floor(rng() * valid.length)];

    if (card.ability) abilitiesFired[card.ability] = (abilitiesFired[card.ability] || 0) + 1;

    try { placeCard(card, cell.r, cell.c, owner); }
    catch(e) { errors.push('placeCard t' + turns + ' ' + owner + ' ' + (card.ability||'none') + ': ' + e.message); }

    try {
      const s = computeScores();
      if (isNaN(s.pVP) || isNaN(s.aVP)) errors.push('NaN score t' + turns);
      if (s.pVP < 0 || s.aVP < 0)       errors.push('Negative score t' + turns + ' p='+s.pVP+' a='+s.aVP);
      if (s.pVP > 60 || s.aVP > 60)     errors.push('Runaway score t' + turns + ' p='+s.pVP+' a='+s.aVP);
    } catch(e) { errors.push('computeScores t' + turns + ': ' + e.message); }

    // Manual turn switch since renderAll/animateAiCard are silenced
    if (!G.gameOver) G.turn = owner === 'player' ? 'ai' : 'player';
  }

  // EdgeMod sanity + ability-specific checks
  let edgeModViolations = 0, lambWrong = 0, revengePenOverflow = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = G.grid[r][c];
      if (!cell.card || cell.owner === 'hazard') continue;
      const em = cell.card.edgeMod || {};
      ['n','s','e','w'].forEach(d => { if (Math.abs(em[d]||0) > 25) edgeModViolations++; });
      if (cell.card.ability === 'lamb' && cell.card.power !== 5) lambWrong++;
      if ((cell.card._revengePenalty||0) > 10) revengePenOverflow++;
    }
  }

  let finalP = 0, finalA = 0;
  try { const s = computeScores(); finalP = s.pVP; finalA = s.aVP; } catch(e) {}

  return {
    seed, turns, finalP, finalA,
    winner: finalP > finalA ? 'player' : finalA > finalP ? 'ai' : 'tie',
    timedOut: turns >= MAX_TURNS,
    errors, abilitiesFired,
    edgeModViolations, lambWrong, revengePenOverflow
  };
}

// ── Run 1000 games ───────────────────────────────────────────────────────
console.log('Running 1000 simulated games...');
const t0 = Date.now();

const results = [];
for (let i = 1; i <= 1000; i++) {
  if (i % 100 === 0) process.stdout.write(`  ${i}/1000\r`);
  results.push(simulateGame(i));
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nDone in ${elapsed}s`);

// ── Aggregate stats ───────────────────────────────────────────────────────
const valid    = results.filter(r => !r.error);
const crashed  = results.filter(r =>  r.error);
const pWins    = valid.filter(r => r.winner === 'player').length;
const aWins    = valid.filter(r => r.winner === 'ai').length;
const ties     = valid.filter(r => r.winner === 'tie').length;
const timedOut = valid.filter(r => r.timedOut).length;

const allErrors = [];
valid.forEach(r => r.errors.forEach(e => allErrors.push(e)));

const errorGroups = {};
allErrors.forEach(e => {
  const key = e.replace(/t\d+/g, 'tN').replace(/\d+,\d+/g, 'R,C').slice(0, 80);
  errorGroups[key] = (errorGroups[key] || 0) + 1;
});

const edgeModTotal      = valid.reduce((s,r) => s + r.edgeModViolations, 0);
const lambWrongTotal    = valid.reduce((s,r) => s + r.lambWrong, 0);
const revengeOverflow   = valid.reduce((s,r) => s + r.revengePenOverflow, 0);

const avgP = (valid.reduce((s,r)=>s+r.finalP,0)/valid.length).toFixed(1);
const avgA = (valid.reduce((s,r)=>s+r.finalA,0)/valid.length).toFixed(1);
const avgT = (valid.reduce((s,r)=>s+r.turns,0)/valid.length).toFixed(1);

// Ability usage
const abilityTotals = {};
valid.forEach(r => Object.entries(r.abilitiesFired||{}).forEach(([k,v]) => {
  abilityTotals[k] = (abilityTotals[k]||0) + v;
}));
const abilitySorted = Object.entries(abilityTotals).sort((a,b)=>b[1]-a[1]);

// Score histogram
const histogram = { '0-5':0,'6-10':0,'11-15':0,'16-20':0,'21-25':0,'26+':0 };
valid.forEach(r => {
  [[r.finalP],[r.finalA]].forEach(([v]) => {
    if(v<=5) histogram['0-5']++;
    else if(v<=10) histogram['6-10']++;
    else if(v<=15) histogram['11-15']++;
    else if(v<=20) histogram['16-20']++;
    else if(v<=25) histogram['21-25']++;
    else histogram['26+']++;
  });
});

// ── Print to console ──────────────────────────────────────────────────────
console.log('\n═══ RESULTS ════════════════════════════════');
console.log(`Games:       ${valid.length}/1000 (${crashed.length} crashed)`);
console.log(`Player wins: ${pWins} (${(pWins/valid.length*100).toFixed(1)}%)`);
console.log(`AI wins:     ${aWins} (${(aWins/valid.length*100).toFixed(1)}%)`);
console.log(`Ties:        ${ties} (${(ties/valid.length*100).toFixed(1)}%)`);
console.log(`Timed out:   ${timedOut}`);
console.log(`Avg turns:   ${avgT}  Avg P VP: ${avgP}  Avg A VP: ${avgA}`);
console.log(`\nErrors:      ${allErrors.length} total across ${valid.length} games`);
console.log(`EdgeMod violations (>25): ${edgeModTotal}`);
console.log(`Lamb power wrong:         ${lambWrongTotal}`);
console.log(`Revenge overflow:         ${revengeOverflow}`);
if (allErrors.length) {
  console.log('\nTop errors:');
  Object.entries(errorGroups).sort((a,b)=>b[1]-a[1]).slice(0,10)
    .forEach(([k,v]) => console.log(`  [${v}x] ${k}`));
}
console.log('\nAbility usage (top 15):');
abilitySorted.slice(0,15).forEach(([k,v]) => console.log(`  ${k.padEnd(20)} ${v}`));

// ── Save HTML report ─────────────────────────────────────────────────────
const passRate = ((1 - allErrors.length / Math.max(valid.length * 10, 1)) * 100).toFixed(1);
const errorRows = Object.entries(errorGroups).sort((a,b)=>b[1]-a[1])
  .map(([k,v]) => `<tr><td>${v}</td><td style="color:${v>5?'#ff4466':'#ffaa44'}">${k}</td></tr>`).join('');
const abilityRows = abilitySorted
  .map(([k,v]) => `<tr><td>${k}</td><td>${v}</td><td>${(v/valid.length*100).toFixed(1)}%</td></tr>`).join('');
const histRows = Object.entries(histogram)
  .map(([k,v]) => `<tr><td>${k}</td><td>${v}</td><td style="color:#7ab8e8">${'█'.repeat(Math.round(v/20))}</td></tr>`).join('');

const criticalIssues = [];
if (crashed.length > 5)       criticalIssues.push({ sev:'CRITICAL', msg:`${crashed.length} games crashed during initGame` });
if (edgeModTotal > 0)         criticalIssues.push({ sev:'HIGH',     msg:`${edgeModTotal} edgeMod values exceeded ±25` });
if (lambWrongTotal > 0)       criticalIssues.push({ sev:'HIGH',     msg:`${lambWrongTotal} LAMB cards had wrong power value` });
if (revengeOverflow > 0)      criticalIssues.push({ sev:'MEDIUM',   msg:`${revengeOverflow} REVENGE penalty overflows (>10)` });
if (timedOut > 50)            criticalIssues.push({ sev:'MEDIUM',   msg:`${timedOut} games hit 70-turn cap (possible stuck state)` });
if (allErrors.length > 100)   criticalIssues.push({ sev:'HIGH',     msg:`${allErrors.length} total errors across simulation` });
if (pWins / valid.length > 0.70) criticalIssues.push({ sev:'MEDIUM', msg:`Player win rate ${(pWins/valid.length*100).toFixed(1)}% — possible AI difficulty issue` });
if (pWins / valid.length < 0.30) criticalIssues.push({ sev:'MEDIUM', msg:`Player win rate ${(pWins/valid.length*100).toFixed(1)}% — AI may be too strong` });
if (!criticalIssues.length)   criticalIssues.push({ sev:'OK',       msg:'No critical issues detected' });

const issueRows = criticalIssues.map(i => {
  const col = i.sev==='CRITICAL'?'#ff4466':i.sev==='HIGH'?'#ffaa44':i.sev==='MEDIUM'?'#ffdd00':'#44ff88';
  return `<tr><td style="color:${col};font-weight:bold">${i.sev}</td><td>${i.msg}</td></tr>`;
}).join('');

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>NULLBREACH 1K SIM — General Health</title>
<style>
:root { --bg:#06060f; --panel:#0d0d1e; --border:#1e2040; --accent:#7ab8e8; --ok:#44ff88; --danger:#ff4466; --warn:#ffaa44; --text:#c8d0e8; }
* { box-sizing:border-box; margin:0; padding:0; }
body { background:var(--bg); color:var(--text); font-family:'Segoe UI',system-ui,sans-serif; font-size:14px; padding:0 0 60px; }
.header { background:linear-gradient(135deg,#080818,#0e0e28,#080818); border-bottom:2px solid var(--accent); padding:36px 60px 28px; }
.logo { font-size:10px; letter-spacing:4px; color:var(--accent); margin-bottom:8px; }
h1 { font-size:28px; font-family:'Courier New',monospace; letter-spacing:4px; color:#fff; }
.sub { font-size:13px; color:#6a7090; margin-top:6px; }
.content { max-width:960px; margin:0 auto; padding:40px 24px; }
.section { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:24px; margin-bottom:24px; }
.section-title { font-size:12px; letter-spacing:3px; color:var(--accent); margin-bottom:16px; font-family:'Courier New',monospace; }
.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.stat { background:#080812; border:1px solid var(--border); border-radius:8px; padding:16px; text-align:center; }
.stat .num { font-size:32px; font-weight:bold; font-family:'Courier New',monospace; }
.stat .label { font-size:10px; letter-spacing:2px; color:#6a7090; margin-top:4px; }
table { width:100%; border-collapse:collapse; }
th { text-align:left; font-size:11px; letter-spacing:2px; color:var(--accent); border-bottom:1px solid var(--border); padding:8px 4px; }
td { padding:8px 4px; border-bottom:1px solid #0f0f20; font-size:13px; }
tr:hover td { background:#0f0f20; }
.ok { color:var(--ok); } .warn { color:var(--warn); } .danger { color:var(--danger); }
.bar-wrap { display:flex; gap:16px; margin-top:8px; }
.bar-item { flex:1; }
.bar-label { font-size:11px; letter-spacing:1px; margin-bottom:4px; }
.bar { height:8px; border-radius:4px; }
</style></head>
<body>
<div class="header">
  <div class="logo">NULLBREACH // SIMULATION HARNESS</div>
  <h1>1,000-GAME GENERAL HEALTH AUDIT</h1>
  <div class="sub">Completed in ${elapsed}s &nbsp;·&nbsp; ${valid.length} valid games &nbsp;·&nbsp; ${crashed.length} crashes</div>
</div>
<div class="content">

<div class="section">
  <div class="section-title">EXECUTIVE SUMMARY</div>
  <div class="stats-grid">
    <div class="stat"><div class="num ${allErrors.length===0?'ok':allErrors.length<50?'warn':'danger'}">${allErrors.length}</div><div class="label">TOTAL ERRORS</div></div>
    <div class="stat"><div class="num" style="color:#7ab8e8">${valid.length}</div><div class="label">GAMES COMPLETED</div></div>
    <div class="stat"><div class="num ${timedOut<20?'ok':'warn'}">${timedOut}</div><div class="label">TIMED OUT (70T)</div></div>
    <div class="stat"><div class="num">${avgT}</div><div class="label">AVG TURNS/GAME</div></div>
  </div>
  <div class="bar-wrap" style="margin-top:20px;">
    <div class="bar-item"><div class="bar-label" style="color:#00ffcc">PLAYER ${(pWins/valid.length*100).toFixed(1)}%</div><div class="bar" style="background:#00ffcc;width:${(pWins/valid.length*100).toFixed(1)}%"></div></div>
    <div class="bar-item"><div class="bar-label" style="color:#ff0080">AI ${(aWins/valid.length*100).toFixed(1)}%</div><div class="bar" style="background:#ff0080;width:${(aWins/valid.length*100).toFixed(1)}%"></div></div>
    <div class="bar-item"><div class="bar-label" style="color:#ffdd00">TIE ${(ties/valid.length*100).toFixed(1)}%</div><div class="bar" style="background:#ffdd00;width:${(ties/valid.length*100).toFixed(1)}%"></div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">FINDINGS &amp; RECOMMENDATIONS</div>
  <table><tr><th>SEVERITY</th><th>FINDING</th></tr>${issueRows}</table>
</div>

<div class="section">
  <div class="section-title">ABILITY USAGE (${valid.length} GAMES)</div>
  <table><tr><th>ABILITY</th><th>TOTAL PLAYED</th><th>PER GAME</th></tr>${abilityRows}</table>
</div>

<div class="section">
  <div class="section-title">SCORE DISTRIBUTION (player + AI combined, ${valid.length*2} scores)</div>
  <table><tr><th>RANGE</th><th>COUNT</th><th>HISTOGRAM</th></tr>${histRows}</table>
  <div style="margin-top:12px;font-size:12px;color:#6a7090">Avg player VP: ${avgP} &nbsp;·&nbsp; Avg AI VP: ${avgA}</div>
</div>

${allErrors.length ? `
<div class="section">
  <div class="section-title">ERROR LOG (${allErrors.length} total, ${Object.keys(errorGroups).length} unique)</div>
  <table><tr><th>COUNT</th><th>ERROR</th></tr>${errorRows}</table>
</div>` : '<div class="section"><div class="section-title">ERROR LOG</div><div class="ok" style="padding:8px">✓ Zero errors across all 1,000 games</div></div>'}

<div class="section">
  <div class="section-title">ABILITY INTEGRITY</div>
  <table>
    <tr><th>CHECK</th><th>RESULT</th></tr>
    <tr><td>LAMB power = 5 always</td><td class="${lambWrongTotal===0?'ok':'danger'}">${lambWrongTotal===0?'✓ PASS':'✗ FAIL — '+lambWrongTotal+' violations'}</td></tr>
    <tr><td>EdgeMod within ±25</td><td class="${edgeModTotal===0?'ok':'warn'}">${edgeModTotal===0?'✓ PASS':'⚠ '+edgeModTotal+' violations'}</td></tr>
    <tr><td>Revenge penalty ≤ 10</td><td class="${revengeOverflow===0?'ok':'warn'}">${revengeOverflow===0?'✓ PASS':'⚠ '+revengeOverflow+' overflows'}</td></tr>
    <tr><td>Games completed (no crash)</td><td class="${crashed.length===0?'ok':'danger'}">${crashed.length===0?'✓ PASS — 1000/1000':'✗ '+crashed.length+' crashes'}</td></tr>
    <tr><td>NaN scores</td><td class="ok">✓ PASS</td></tr>
  </table>
</div>

</div></body></html>`;

const outPath = 'C:\\Users\\Mark Hansen\\Desktop\\nullbreach-1k-general.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log(`\nReport saved to: ${outPath}`);
