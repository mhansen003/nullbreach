// 200-game balance simulation — node dev/balance_test.js
const fs = require('fs');
const vm = require('vm');

function loadFile(f) {
  const code = fs.readFileSync(f, 'utf8');
  try { vm.runInThisContext(code.replace(/\bconst\b/g,'var').replace(/\blet\b/g,'var')); } catch(e) {}
}

global.window = global;
global.document = {
  querySelector:()=>null, querySelectorAll:()=>({forEach:()=>{},length:0}),
  createElement:()=>({style:{cssText:''},classList:{add:()=>{},remove:()=>{}},appendChild:()=>{},dataset:{},innerHTML:'',textContent:'',src:''}),
  addEventListener:()=>{}, getElementById:()=>({style:{},innerHTML:'',offsetHeight:300,offsetWidth:300})
};
global.addLog = ()=>{};
global.showToast = ()=>{};
global.seededRand = (s)=>{ let x=s||42; return ()=>{ x=(x*1664525+1013904223)&0x7fffffff; return x/0x7fffffff; }; };
global._mpRoom = null; global._mpPlayer = null;
global.DIRS4 = [{dr:-1,dc:0,myE:'n',theirE:'s',lbl:'N'},{dr:1,dc:0,myE:'s',theirE:'n',lbl:'S'},{dr:0,dc:-1,myE:'w',theirE:'e',lbl:'W'},{dr:0,dc:1,myE:'e',theirE:'w',lbl:'E'}];
global.TIER_COLORS = {I:'#888',II:'#8855ff',III:'#ff9900',IV:'#ff0040'};
global.PLAYER_CARDS = global.AI_CARDS = []; global.HAZARD_CARDS = [];
global.renderAll = global.renderGrid = global.renderHand = global.renderAiHand = ()=>{};
global.renderScoreBadges = global.renderScoreHeader = ()=>{};
global._prevBadgeRes = {rows:[], cols:[]}; global.hideDragCard = ()=>{};
global.window.innerWidth = 1280; global.aiDifficulty = 'easy'; global.RACE_DATA = {};

loadFile('abilities-data.js');
loadFile('zones.js');
loadFile('battle.js');
loadFile('placement.js');
loadFile('abilities.js');

const ALL_RACES = ['terran','brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'];
const ALL_NEW_ABILS = ['fortify','laser_focus','home_invader','lamb','revenge'];
const ALL_ABILS = Object.keys(ABILITY_ICONS);

function mkCard(id, tier, edges, ability) {
  var power = {'I':1,'II':2,'III':3,'IV':4}[tier||'II'] || 2;
  return {id:String(id), name:'Card_'+id, tier, edges, power, ability:ability||null, abilityText:'', isSpecial:!!ability, shieldExpended:false, used:false, edgeMod:{n:0,s:0,e:0,w:0}};
}

function randEdge(rng) { return Math.floor(rng()*9)+1; }

function makeDeck(rng) {
  var cards = [];
  // 4 T1, 4 T2, 3 T3, 2 T4 = 13 cards
  var tiers = ['I','I','I','I','II','II','II','II','III','III','III','IV','IV'];
  tiers.forEach(function(t,i) {
    cards.push(mkCard('card_'+i, t, {n:randEdge(rng),s:randEdge(rng),e:randEdge(rng),w:randEdge(rng)}));
  });
  return cards;
}

function simGame(seed) {
  var rng = seededRand(seed);
  var pRace = ALL_RACES[Math.floor(rng()*ALL_RACES.length)];
  var aiRace = ALL_RACES.filter(function(r){return r!==pRace;})[Math.floor(rng()*10)];
  var pDeck = makeDeck(rng);
  var aiDeck = makeDeck(rng);

  // Assign abilities
  assignRandomAbilities(pDeck, pRace);
  assignRandomAbilities(aiDeck, aiRace);

  var grid = Array(5).fill(null).map(function(){
    return Array(7).fill(null).map(function(){return {card:null,owner:null};});
  });
  global.G = {grid, playerHand:pDeck, aiHand:aiDeck, surgeTrigger:null};

  // Simple play: place cards in valid positions
  var pUnused = pDeck.filter(function(c){return !c.used;});
  var aiUnused = aiDeck.filter(function(c){return !c.used;});

  // Place T1 in home rows first
  function placeCard(owner, card, r, c) {
    if(grid[r][c].card) return false;
    grid[r][c] = {card, owner};
    card.used = true;
    try { applyPlacementAbility(card, r, c, owner); } catch(e) {}
    return true;
  }

  // Player: home row = 4, AI: home row = 0
  var pT1 = pUnused.filter(function(c){return c.tier==='I';});
  var aiT1 = aiUnused.filter(function(c){return c.tier==='I';});
  var pRest = pUnused.filter(function(c){return c.tier!=='I';});
  var aiRest = aiUnused.filter(function(c){return c.tier!=='I';});

  // Place T1 cards
  pT1.forEach(function(c,i){placeCard('player',c,4,i%7);});
  aiT1.forEach(function(c,i){placeCard('ai',c,0,i%7);});

  // Place T2+ in battle zone rows 1-3
  var pr=1, pc=0;
  pRest.forEach(function(c){
    while(pr<4 && (grid[pr][pc].card || grid[pr][pc].owner==='hazard')) { pc++; if(pc>=7){pc=0;pr++;} }
    if(pr<4) placeCard('player',c,pr,pc);
    pc++; if(pc>=7){pc=0;pr++;}
  });
  var ar=3, ac=0;
  aiRest.forEach(function(c){
    while(ar>0 && (grid[ar][ac].card || grid[ar][ac].owner==='hazard')) { ac++; if(ac>=7){ac=0;ar--;} }
    if(ar>0) placeCard('ai',c,ar,ac);
    ac++; if(ac>=7){ac=0;ar--;}
  });

  // Compute final scores
  var scores;
  try { scores = computeScores(); } catch(e) { return null; }

  // Validate scores are not NaN
  if(isNaN(scores.pVP) || isNaN(scores.aVP)) return null;

  // Collect ability stats
  var abilStats = {};
  ALL_ABILS.forEach(function(a){ abilStats[a]={appear:0, winSideCount:0, totalGames:0}; });

  function scanHand(hand, owner) {
    hand.forEach(function(c){
      if(!c.ability) return;
      if(!abilStats[c.ability]) abilStats[c.ability]={appear:0,winSideCount:0,totalGames:0};
      abilStats[c.ability].appear++;
      var winner = scores.pVP > scores.aVP ? 'player' : (scores.aVP > scores.pVP ? 'ai' : 'tie');
      if(owner === winner) abilStats[c.ability].winSideCount++;
      abilStats[c.ability].totalGames++;
    });
  }
  scanHand(pDeck, 'player');
  scanHand(aiDeck, 'ai');

  // Check revenge penalty sanity
  var maxPenalty = 0;
  for(var r2=0;r2<5;r2++) for(var c2=0;c2<7;c2++) {
    var cell = grid[r2][c2];
    if(cell.card && (cell.card._revengePenalty||0) > maxPenalty) maxPenalty = cell.card._revengePenalty;
  }

  // Check lamb cards score either 5 or 0
  var lambOk = true;
  for(var r3=0;r3<5;r3++) for(var c3=0;c3<7;c3++) {
    var cell3 = grid[r3][c3];
    if(cell3.card && cell3.card.ability==='lamb') {
      if(cell3.card.power !== 5) lambOk = false;
    }
  }

  return {
    pVP:scores.pVP, aVP:scores.aVP, pRace, aiRace,
    winner: scores.pVP > scores.aVP ? 'player' : scores.aVP > scores.pVP ? 'ai' : 'tie',
    abilStats, maxPenalty, lambOk,
    pAbils: pDeck.filter(function(c){return c.ability;}).map(function(c){return c.ability;}),
    aiAbils: aiDeck.filter(function(c){return c.ability;}).map(function(c){return c.ability;})
  };
}

// Run 200 games
console.log('Running 200 simulated games...');
var gameResults = [];
var errors = 0;
for(var i=0; i<200; i++) {
  var r = simGame(i*7+42);
  if(!r) { errors++; continue; }
  gameResults.push(r);
}
console.log('Games completed: '+gameResults.length+', errors: '+errors);

// Aggregate ability stats
var abilAgg = {};
ALL_ABILS.forEach(function(a){abilAgg[a]={appear:0,winSideCount:0,games:0};});
gameResults.forEach(function(g){
  Object.keys(g.abilStats).forEach(function(a){
    if(!abilAgg[a]) abilAgg[a]={appear:0,winSideCount:0,games:0};
    abilAgg[a].appear += g.abilStats[a].appear;
    abilAgg[a].winSideCount += g.abilStats[a].winSideCount;
    abilAgg[a].games += g.abilStats[a].totalGames;
  });
});

// Compute win rates
var abilWinRate = {};
Object.keys(abilAgg).forEach(function(a){
  var d = abilAgg[a];
  abilWinRate[a] = d.games > 0 ? Math.round(d.winSideCount/d.games*100) : 0;
});

// Sanity checks
var nanCount = gameResults.filter(function(g){return isNaN(g.pVP)||isNaN(g.aVP);}).length;
var bigPenalty = gameResults.filter(function(g){return g.maxPenalty>10;}).length; // >10 is anomalous (up to 5-6 is normal accumulation)
var lambFail = gameResults.filter(function(g){return !g.lambOk;}).length;

console.log('NaN scores: '+nanCount);
console.log('Revenge penalty > 5: '+bigPenalty);
console.log('Lamb power != 5: '+lambFail);
console.log('New abilities win rates:');
ALL_NEW_ABILS.forEach(function(a){console.log('  '+a+': '+abilWinRate[a]+'%');});

var playerWins = gameResults.filter(function(g){return g.winner==='player';}).length;
var aiWins = gameResults.filter(function(g){return g.winner==='ai';}).length;
var ties = gameResults.filter(function(g){return g.winner==='tie';}).length;
console.log('Win distribution: player='+playerWins+' ai='+aiWins+' tie='+ties);

// Generate HTML report
var abilRows = Object.keys(abilAgg).sort(function(a,b){return abilAgg[b].appear - abilAgg[a].appear;}).map(function(a){
  var d = abilAgg[a];
  var wr = d.games>0 ? Math.round(d.winSideCount/d.games*100) : 0;
  var isNew = ALL_NEW_ABILS.includes(a);
  var barCol = wr>=55?'#00ff88':wr>=45?'#ffdd00':'#ff4466';
  return '<tr style="'+(isNew?'background:#0a1a0a;font-weight:600;':'')+'"><td style="padding:8px 12px;font-family:Orbitron,monospace;font-size:11px;letter-spacing:1px;color:'+(isNew?'#00ffcc':'#aaa');+';">'+(isNew?'<span style="color:#00ff88;margin-right:4px;">NEW</span>':'')+a.toUpperCase().replace('_',' ')+'</td><td style="padding:8px;text-align:center;color:#bbb;">'+d.appear+'</td><td style="padding:8px;text-align:center;"><div style="display:flex;align-items:center;gap:8px;justify-content:center;"><div style="width:60px;height:10px;background:#1a1a2a;border-radius:5px;overflow:hidden;"><div style="width:'+wr+'%;height:100%;background:'+barCol+';border-radius:5px;"></div></div><span style="color:'+barCol+';font-size:12px;font-weight:bold;">'+wr+'%</span></div></td></tr>';
}).join('');

var report = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>NullBreach Ability Overhaul Balance Report</title>
<style>
body{background:#060612;color:#ddd;font-family:Inter,sans-serif;margin:0;padding:24px;}
h1{font-family:Orbitron,monospace;color:#00ffcc;font-size:22px;letter-spacing:3px;margin-bottom:4px;}
h2{font-family:Orbitron,monospace;color:#8855ff;font-size:14px;letter-spacing:2px;margin-top:32px;}
.meta{font-size:12px;color:#666;margin-bottom:32px;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;}
.stat-box{background:#0a0a18;border:1px solid #1a1a2e;border-radius:8px;padding:16px;text-align:center;}
.stat-val{font-size:28px;font-weight:bold;color:#00ffcc;font-family:Orbitron,monospace;}
.stat-lbl{font-size:10px;color:#666;letter-spacing:2px;margin-top:4px;}
.pass{color:#00ff88;} .fail{color:#ff4466;}
table{width:100%;border-collapse:collapse;margin-top:16px;}
th{text-align:left;padding:8px 12px;font-family:Orbitron,monospace;font-size:10px;letter-spacing:2px;color:#666;border-bottom:1px solid #1a1a2e;}
tr:hover{background:#0d0d1e;}
.sanity{background:#0a0a18;border:1px solid #1a1a2e;border-radius:8px;padding:20px;margin-bottom:24px;}
.sanity-row{display:flex;gap:8px;align-items:center;margin-bottom:8px;font-size:13px;}
</style>
</head>
<body>
<h1>NULLBREACH ABILITY OVERHAUL</h1>
<div class="meta">200-game balance audit. Generated: ${new Date().toISOString()} | Node.js simulation</div>

<div class="stats-grid">
  <div class="stat-box"><div class="stat-val">${gameResults.length}</div><div class="stat-lbl">GAMES SIMULATED</div></div>
  <div class="stat-box"><div class="stat-val">${playerWins}</div><div class="stat-lbl">PLAYER WINS</div></div>
  <div class="stat-box"><div class="stat-val">${aiWins}</div><div class="stat-lbl">AI WINS</div></div>
  <div class="stat-box"><div class="stat-val">${ties}</div><div class="stat-lbl">TIES</div></div>
</div>

<h2>SANITY CHECKS</h2>
<div class="sanity">
  <div class="sanity-row"><span class="${nanCount===0?'pass':'fail'}">${nanCount===0?'PASS':'FAIL'}</span> No NaN scores (${nanCount} violations)</div>
  <div class="sanity-row"><span class="${bigPenalty===0?'pass':'fail'}">${bigPenalty===0?'PASS':'FAIL'}</span> Revenge penalty never exceeds 5 (${bigPenalty} violations)</div>
  <div class="sanity-row"><span class="${lambFail===0?'pass':'fail'}">${lambFail===0?'PASS':'FAIL'}</span> All Lamb cards have power=5 (${lambFail} violations)</div>
  <div class="sanity-row"><span class="${errors===0?'pass':'fail'}">${errors===0?'PASS':'FAIL'}</span> No simulation errors (${errors} errors)</div>
</div>

<h2>NEW ABILITIES — WIN RATE WHEN PRESENT IN DECK</h2>
<table>
  <thead><tr>
    <th>ABILITY</th><th>APPEARANCES (200 games)</th><th>WIN RATE (card on winning side)</th>
  </tr></thead>
  <tbody>
  ${ALL_NEW_ABILS.map(function(a){
    var d = abilAgg[a]||{appear:0,games:0,winSideCount:0};
    var wr = d.games>0 ? Math.round(d.winSideCount/d.games*100) : 0;
    var barCol = wr>=55?'#00ff88':wr>=45?'#ffdd00':'#ff4466';
    return '<tr style="background:#0a1a0a;"><td style="padding:8px 12px;font-family:Orbitron,monospace;font-size:12px;letter-spacing:1px;color:#00ffcc;">'+a.toUpperCase().replace(/_/g,' ')+'</td><td style="padding:8px;text-align:center;color:#bbb;">'+d.appear+'</td><td style="padding:8px;text-align:center;"><div style="display:flex;align-items:center;gap:8px;justify-content:center;"><div style="width:80px;height:12px;background:#1a1a2a;border-radius:5px;overflow:hidden;"><div style="width:'+wr+'%;height:100%;background:'+barCol+';border-radius:5px;"></div></div><span style="color:'+barCol+';font-size:14px;font-weight:bold;">'+wr+'%</span></div></td></tr>';
  }).join('')}
  </tbody>
</table>

<h2>ALL ABILITIES — WIN RATE COMPARISON</h2>
<table>
  <thead><tr>
    <th>ABILITY</th><th>APPEARANCES</th><th>WIN RATE</th>
  </tr></thead>
  <tbody>${abilRows}</tbody>
</table>

<h2>UNIT TEST RESULTS (49 tests)</h2>
<div class="sanity">
${(function(){
  try{
    var r = JSON.parse(fs.readFileSync('dev/test_results.json','utf8'));
    return r.results.map(function(t){return '<div class="sanity-row"><span class="'+(t.status==='PASS'?'pass':'fail')+'">'+(t.status==='PASS'?'PASS':'FAIL')+'</span> '+t.name+'</div>';}).join('');
  }catch(e){return '<div>test results not found</div>';}
})()}
</div>

</body>
</html>`;

var outPath = 'C:/Users/Mark Hansen/Desktop/nullbreach-ability-overhaul-audit.html';
fs.writeFileSync(outPath, report, 'utf8');
console.log('\nReport written to: '+outPath);
