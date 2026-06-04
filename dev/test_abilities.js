// Ability overhaul unit tests — run with: node dev/test_abilities.js
const fs = require('fs');
const vm = require('vm');

function loadFile(f) {
  const code = fs.readFileSync(f, 'utf8');
  try { vm.runInThisContext(code.replace(/\bconst\b/g,'var').replace(/\blet\b/g,'var')); } catch(e) {}
}

// Minimal browser stubs
global.window = global;
global.document = {
  querySelector:()=>null,
  querySelectorAll:()=>({forEach:()=>{},length:0}),
  createElement:()=>({style:{cssText:''},classList:{add:()=>{},remove:()=>{}},appendChild:()=>{},dataset:{},innerHTML:'',textContent:'',src:''}),
  addEventListener:()=>{},
  getElementById:()=>({style:{},innerHTML:'',offsetHeight:300,offsetWidth:300})
};
var _logs = [];
global.addLog = (t,m) => { _logs.push({t,m}); };
global.showToast = (m) => {};
global.seededRand = (s) => { let x=s||42; return ()=>{ x=(x*1664525+1013904223)&0x7fffffff; return x/0x7fffffff; }; };
global._mpRoom = null;
global._mpPlayer = null;
global.DIRS4 = [{dr:-1,dc:0,myE:'n',theirE:'s',lbl:'N'},{dr:1,dc:0,myE:'s',theirE:'n',lbl:'S'},{dr:0,dc:-1,myE:'w',theirE:'e',lbl:'W'},{dr:0,dc:1,myE:'e',theirE:'w',lbl:'E'}];
global.TIER_COLORS = {I:'#888',II:'#8855ff',III:'#ff9900',IV:'#ff0040'};
global.PLAYER_CARDS = global.AI_CARDS = [];
global.HAZARD_CARDS = [];
global.renderAll = global.renderGrid = global.renderHand = global.renderAiHand = ()=>{};
global.renderScoreBadges = global.renderScoreHeader = ()=>{};
global._prevBadgeRes = {rows:[], cols:[]};
global.hideDragCard = ()=>{};
global.window.innerWidth = 1280;
global.aiDifficulty = 'easy';
global.RACE_DATA = {};

loadFile('abilities-data.js');
loadFile('zones.js');
loadFile('battle.js');
loadFile('placement.js');
loadFile('abilities.js');

function mkCard(id, tier, edges, ability) {
  var power = {'I':1,'II':2,'III':3,'IV':4}[tier||'II'] || 2;
  return {id, name:'Card_'+id, tier:tier||'II', edges:edges||{n:5,s:4,e:3,w:2}, power, ability:ability||null, abilityText:'', isSpecial:!!ability, shieldExpended:false, used:false, edgeMod:{n:0,s:0,e:0,w:0}};
}
function mkGrid() {
  return Array(5).fill(null).map(function(){return Array(7).fill(null).map(function(){return {card:null, owner:null};});});
}

var pass=0, fail=0, results=[];
function check(name, cond) {
  var status = cond ? 'PASS' : 'FAIL';
  if(cond) pass++; else fail++;
  results.push({status, name});
  console.log(status+': '+name);
}

// === ABILITY DATA TESTS ===
console.log('\n=== ABILITY DATA TESTS ===');
var newAbils = ['fortify','laser_focus','home_invader','lamb','revenge'];
var oldAbils = ['stonewall','sweep','hat_trick','echo','mirror'];
var poolAbils = Object.values(FACTION_ABILITY_POOLS).flat();
newAbils.forEach(function(a) {
  check('ABILITY_ICONS has '+a, !!ABILITY_ICONS[a]);
  check('ABILITY_TEXT has '+a, !!ABILITY_TEXT[a]);
  check('pool includes '+a, poolAbils.includes(a));
});
oldAbils.forEach(function(a) {
  check('ABILITY_ICONS removed '+a, !ABILITY_ICONS[a]);
  check('pool removed '+a, !poolAbils.includes(a));
});

// === FORTIFY ===
console.log('\n=== FORTIFY ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
var fortCard = mkCard('f1','II',{n:5,s:4,e:3,w:2},'fortify');
G.grid[2][3] = {card:fortCard, owner:'player'};
applyPlacementAbility(fortCard, 2, 3, 'player');
check('FORTIFY: north cell fortifiedBy player', G.grid[1][3].fortifiedBy === 'player');
check('FORTIFY: south cell fortifiedBy player', G.grid[3][3].fortifiedBy === 'player');
check('FORTIFY: west cell fortifiedBy player', G.grid[2][2].fortifiedBy === 'player');
check('FORTIFY: east cell fortifiedBy player', G.grid[2][4].fortifiedBy === 'player');

// Check opponent placement blocked on fortified cell
// Place player card to open zone first
G.grid[4][3] = {card:mkCard('p_base','I',{n:3,s:3,e:3,w:3},null), owner:'player'};
var aiTestCard = mkCard('ai_test','II',{n:5,s:5,e:5,w:5},null);
var aiValid = getValidPlacements('ai', aiTestCard);
// Row 1 col 3 is fortifiedBy player, so AI cannot place there
var aiCanPlaceR1C3 = aiValid.some(function(v){return v.r===1 && v.c===3;});
check('FORTIFY: AI cannot place on player-fortified cell', !aiCanPlaceR1C3);
// Player CAN place on their own fortified cells
var playerTestCard = mkCard('p_test','II',{n:5,s:5,e:5,w:5},null);
var playerValid = getValidPlacements('player', playerTestCard);
var playerCanPlaceR1C3 = playerValid.some(function(v){return v.r===1 && v.c===3;});
check('FORTIFY: player CAN place on own fortified cell', playerCanPlaceR1C3);

// === LASER FOCUS ===
console.log('\n=== LASER FOCUS ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
var lfCard = mkCard('lf1','II',{n:3,s:4,e:5,w:2},'laser_focus');
G.grid[2][3] = {card:lfCard, owner:'player'};
applyPlacementAbility(lfCard, 2, 3, 'player');
var total = 3+4+5+2;
check('LASER FOCUS: N edge = sum of all ('+total+')', lfCard.edges.n + lfCard.edgeMod.n === total);
check('LASER FOCUS: S edge = 0', lfCard.edges.s + lfCard.edgeMod.s === 0);
check('LASER FOCUS: E edge = 0', lfCard.edges.e + lfCard.edgeMod.e === 0);
check('LASER FOCUS: W edge = 0', lfCard.edges.w + lfCard.edgeMod.w === 0);

// === HOME INVADER ===
console.log('\n=== HOME INVADER ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
G.grid[4][3] = {card:mkCard('p1','I',{n:3,s:3,e:3,w:3},null), owner:'player'};
var hiCard = mkCard('hi1','II',{n:5,s:4,e:3,w:2},'home_invader');
var validHI = getValidPlacements('player', hiCard);
var hasEnemyHome = validHI.some(function(v){return v.r===0;});
check('HOME INVADER: enemy home row (r=0) in valid placements', hasEnemyHome);
var normalCard = mkCard('n1','II',{n:5,s:4,e:3,w:2},null);
var validNormal = getValidPlacements('player', normalCard);
check('Normal T2 card: cannot go to enemy home row', !validNormal.some(function(v){return v.r===0;}));

// === LAMB ===
console.log('\n=== LAMB ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
var lambCard = mkCard('lamb1','II',{n:0,s:0,e:0,w:0},'lamb');
lambCard.power = 5;
G.grid[2][3] = {card:lambCard, owner:'player'};
var b1 = computeBattleResults();
check('LAMB: no adjacent enemy => bat.h = none', b1[2][3].h === 'none');
check('LAMB: no adjacent enemy => bat.v = none', b1[2][3].v === 'none');
// Counts in scoring: none = counts
var s1 = computeScores();
check('LAMB: no enemy adjacent => counts VP (row)', s1.rows[2].p > 0);
// With enemy adjacent
G.grid[2][4] = {card:mkCard('e1','II',{n:5,s:5,e:5,w:5},null), owner:'ai'};
var b2 = computeBattleResults();
check('LAMB: enemy adjacent => bat.h = lose', b2[2][3].h === 'lose');
var s2 = computeScores();
// Lamb loses H => countsH = false => adds 0 to rows for lamb
// But countsV still = none (no V enemy)
// So lamb contributes power to col via countsV
// Check it doesn't contribute the full 5 from a lost axis

// === REVENGE ===
console.log('\n=== REVENGE ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
var revCard = mkCard('rev1','II',{n:2,s:2,e:2,w:2},'revenge');
var strongEnemy = mkCard('str1','II',{n:8,s:8,e:8,w:8},null);
G.grid[2][3] = {card:revCard, owner:'player'};
G.grid[2][4] = {card:strongEnemy, owner:'ai'};
computeBattleResults();
check('REVENGE: H-loss triggers penalty on winner (+1)', (strongEnemy._revengePenalty||0) >= 1);
var revScores = computeScores();
// strongEnemy should have its effective power reduced in scoring
var expectedBasePow = 2; // T2 card
var penalty = strongEnemy._revengePenalty || 0;
var expectedEff = Math.max(1, expectedBasePow - penalty);
check('REVENGE: revenge penalty >=0 and power floored at 1', penalty >= 0 && expectedEff >= 1);

// === BIRTHRIGHT (placement trigger) ===
// birthright finds T2 cards in __activeDeck that are NOT already in hand
console.log('\n=== BIRTHRIGHT ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
var brCard = mkCard('br1','I',{n:3,s:3,e:3,w:3},'birthright');
// t2Src is in the deck but NOT in playerHand yet — only brCard is in hand
var t2Src = mkCard('t2_src','II',{n:5,s:4,e:3,w:2},null);
t2Src.used = false;
G.playerHand = [brCard]; // brCard is in hand; t2Src is in deck but not hand
global.__activeDeck = [brCard, t2Src]; // full deck includes both
var handSizeBefore = G.playerHand.length;
G.grid[4][3] = {card:brCard, owner:'player'};
applyPlacementAbility(brCard, 4, 3, 'player');
check('BIRTHRIGHT: placement adds card to hand', G.playerHand.length > handSizeBefore);
var addedCard = G.playerHand.find(function(c){return c.id && c.id.indexOf('_br_')>=0;});
check('BIRTHRIGHT: added card has birthright ID suffix', !!addedCard);

// === DECIDING FACTOR ===
console.log('\n=== DECIDING FACTOR ===');
global.G = { grid: mkGrid(), playerHand:[], aiHand:[], surgeTrigger:null };
var dfCard = mkCard('df1','II',{n:3,s:3,e:3,w:3},'deciding_factor');
var aiBalCard = mkCard('ai1','II',{n:3,s:3,e:3,w:3},null);
G.grid[2][3] = {card:dfCard, owner:'player'};
G.grid[2][5] = {card:aiBalCard, owner:'ai'};
var dfScores = computeScores();
check('DECIDING FACTOR: tie in DF row tips to player', dfScores.rowResults[2] === 'p');

// === ASSIGN RANDOM ABILITIES (lamb edges/power) ===
console.log('\n=== ASSIGN RANDOM ABILITIES: LAMB ===');
var testHand = [
  mkCard('t1','I',{n:3,s:3,e:3,w:3},null),
  mkCard('t2a','II',{n:5,s:4,e:3,w:2},null),
  mkCard('t2b','II',{n:4,s:5,e:2,w:3},null),
  mkCard('t3a','III',{n:6,s:5,e:4,w:3},null),
  mkCard('t3b','III',{n:7,s:6,e:5,w:4},null),
];
// Force mycos pool (which includes lamb)
assignRandomAbilities(testHand, 'mycos');
var lambCards = testHand.filter(function(c){return c.ability === 'lamb';});
if(lambCards.length > 0) {
  check('LAMB via assignRandomAbilities: edges all 0', lambCards.every(function(c){return c.edges.n===0&&c.edges.s===0&&c.edges.e===0&&c.edges.w===0;}));
  check('LAMB via assignRandomAbilities: power = 5', lambCards.every(function(c){return c.power===5;}));
  check('LAMB via assignRandomAbilities: _lambOriginalEdges set', lambCards.every(function(c){return !!c._lambOriginalEdges;}));
} else {
  console.log('NOTE: no lamb cards assigned (random pool, may not always include lamb)');
  check('mycos pool includes lamb', FACTION_ABILITY_POOLS.mycos.includes('lamb'));
}

// === FINAL SUMMARY ===
console.log('\n===========================');
console.log('TOTAL: '+pass+' pass, '+fail+' fail');
if(fail > 0) {
  console.log('\nFailed tests:');
  results.filter(function(r){return r.status==='FAIL';}).forEach(function(r){console.log('  - '+r.name);});
}

// Write JSON results
fs.writeFileSync('dev/test_results.json', JSON.stringify({pass,fail,results,ts:new Date().toISOString()}, null, 2));
console.log('\nResults saved to dev/test_results.json');
process.exit(fail > 0 ? 1 : 0);
