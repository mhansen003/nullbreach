// ── ACHIEVEMENT SYSTEM ────────────────────────────────────────────────────────

// ── Identity ──────────────────────────────────────────────────────────────────
function _getToken() {
  let t = localStorage.getItem('gz_player_token');
  if (!t) { t = crypto.randomUUID(); localStorage.setItem('gz_player_token', t); }
  return t;
}

// ── Storage helpers ───────────────────────────────────────────────────────────
function _loadAchievements() {
  try { return new Set(JSON.parse(localStorage.getItem('gz_achievements') || '[]')); }
  catch(e) { return new Set(); }
}
function _saveAchievements(set) {
  try { localStorage.setItem('gz_achievements', JSON.stringify([...set])); } catch(e) {}
}
function _loadStats() {
  try {
    return Object.assign({
      totalWins: 0, totalLosses: 0, totalDraws: 0,
      currentStreak: 0, bestStreak: 0,
      factionsWon: [], gamesPlayed: 0,
      decksOpened: [], loreViewed: false, loreFactionsViewed: [],
      exploreMode: false, exploreFactions: [],
      firstAbilityWinDone: false,
      gameStartTime: null
    }, JSON.parse(localStorage.getItem('gz_stats') || '{}'));
  } catch(e) {
    return { totalWins:0, totalLosses:0, totalDraws:0, currentStreak:0, bestStreak:0, factionsWon:[], gamesPlayed:0, decksOpened:[], loreViewed:false, loreFactionsViewed:[], exploreMode:false, exploreFactions:[], firstAbilityWinDone:false, gameStartTime:null };
  }
}
function _saveStats(stats) {
  try { localStorage.setItem('gz_stats', JSON.stringify(stats)); } catch(e) {}
}

// ── 80 Achievement definitions ─────────────────────────────────────────────────
const ACHIEVEMENTS = [
  // First events
  { id:'first_win',         name:'First Breach',          desc:'Win your first game.' },
  { id:'first_loss',        name:'First Defeat',          desc:'Lose your first game.' },
  { id:'first_tie',         name:'First Stalemate',       desc:'Draw your first game.' },
  { id:'deck_opened',       name:'Deck Commander',        desc:'Select and play a custom deck.' },
  { id:'ability_first',     name:'Ability Activated',     desc:'Win a game using a card with a special ability.' },

  // Win streaks
  { id:'win_3',             name:'Triple Threat',         desc:'Win 3 games in a row.' },
  { id:'win_5',             name:'Unstoppable',           desc:'Win 5 games in a row.' },
  { id:'win_10',            name:'Dominant Force',        desc:'Win 10 games in a row.' },
  { id:'win_25',            name:'Legendary Streak',      desc:'Win 25 games in a row.' },

  // Total wins
  { id:'wins_10',           name:'Veteran',               desc:'Win 10 games total.' },
  { id:'wins_25',           name:'Seasoned Commander',    desc:'Win 25 games total.' },
  { id:'wins_50',           name:'Battle-Hardened',       desc:'Win 50 games total.' },
  { id:'wins_100',          name:'Century Mark',          desc:'Win 100 games total.' },
  { id:'wins_500',          name:'Galactic Legend',       desc:'Win 500 games total.' },

  // VP milestones
  { id:'vp_sweep',          name:'Total Domination',      desc:'Win every row and column (12 sectors).' },
  { id:'vp_landslide',      name:'Landslide Victory',     desc:'Win by 20 or more VP.' },
  { id:'vp_shutout',        name:'Perfect Shutout',       desc:'Win with the AI scoring 0 VP.' },
  { id:'vp_comeback',       name:'Comeback Kid',          desc:'Win after trailing by 10+ VP at some point.' },
  { id:'vp_perfect_row',    name:'Perfect Row',           desc:'Win a row with maximum possible VP.' },
  { id:'vp_delta_king',     name:'Delta King',            desc:'Win by exactly 1 VP.' },

  // Faction wins
  { id:'faction_terran',    name:'Terran Triumphant',     desc:'Win a game playing as Terran Accord.' },
  { id:'faction_brood',     name:'Brood Sovereign',       desc:'Win a game playing as Brood Sovereign.' },
  { id:'faction_crystallis',name:'Crystal Clear',         desc:'Win a game playing as The Crystallis.' },
  { id:'faction_mycos',     name:'Mycos Drift',           desc:'Win a game playing as Mycos Drift.' },
  { id:'faction_veil',      name:'Behind the Veil',       desc:'Win a game playing as The Veil.' },
  { id:'faction_entropy',   name:'Entropy Rising',        desc:'Win a game playing as Entropy Cult.' },
  { id:'faction_void',      name:'Void Hunter',           desc:'Win a game playing as Void Hunters.' },
  { id:'faction_gas',       name:'Nomad Victory',         desc:'Win a game playing as Gas Nomads.' },
  { id:'faction_lithos',    name:'Stone Crusher',         desc:'Win a game playing as The Lithos.' },
  { id:'faction_quantum',   name:'Quantum Entangled',     desc:'Win a game playing as Quantum Thread.' },
  { id:'faction_choir',     name:'Choir of Champions',    desc:'Win a game playing as The Choir.' },

  // Ability-specific wins
  { id:'abil_commander',    name:'Commander\'s Order',    desc:'Win using a card with the Commander ability.' },
  { id:'abil_flank',        name:'Flanking Maneuver',     desc:'Win using a card with the Flank ability.' },
  { id:'abil_sniper',       name:'Precision Shot',        desc:'Win using a card with the Sniper ability.' },
  { id:'abil_shield',       name:'Shield Wall',           desc:'Win using a card with the Shield ability.' },
  { id:'abil_density',      name:'Dense Formation',       desc:'Win using a card with the Density ability.' },
  { id:'abil_rush',         name:'Rush Tactics',          desc:'Win using a card with the Rush ability.' },
  { id:'abil_phantom',      name:'Ghost Protocol',        desc:'Win using a card with the Phantom ability.' },
  { id:'abil_pierce',       name:'Piercing Strike',       desc:'Win using a card with the Pierce ability.' },
  { id:'abil_revenge',      name:'Vengeance Served',      desc:'Win using a card with the Revenge ability.' },
  { id:'abil_deciding',     name:'Deciding Factor',       desc:'Win using a card with the Deciding ability.' },
  { id:'abil_lamb',         name:'Sacrificial Lamb',      desc:'Win using a card with the Lamb ability.' },
  { id:'abil_intimidate',   name:'Intimidation Tactics',  desc:'Win using a card with the Intimidate ability.' },
  { id:'abil_fortify',      name:'Fortified Lines',       desc:'Win using a card with the Fortify ability.' },
  { id:'abil_laser',        name:'Laser Focus',           desc:'Win using a card with the Laser ability.' },
  { id:'abil_cloak',        name:'Shadow Operative',      desc:'Win using a card with the Cloak ability.' },
  { id:'abil_double',       name:'Double Strike',         desc:'Win using a card with the Double ability.' },
  { id:'abil_birthright',   name:'Born to Rule',          desc:'Win using a card with the Birthright ability.' },
  { id:'abil_home_invader', name:'Home Invader',          desc:'Win using a card with the Home Invader ability.' },

  // Play conditions
  { id:'play_tier4',        name:'Apex Predator',         desc:'Place a Tier IV card in battle.' },
  { id:'play_full_grid',    name:'Full Deployment',       desc:'Fill all 35 cells on the board.' },
  { id:'play_hazard_zero',  name:'Hazard Avoidance',      desc:'Win a game with a cosmic hazard on the board without placing any card next to it.' },
  { id:'play_all_abilities',name:'Ability Arsenal',       desc:'Win using cards with 5 different abilities.' },
  { id:'play_no_ability',   name:'Purist',                desc:'Win using only cards with no special ability.' },
  { id:'play_solo_win',     name:'Solo Victory',          desc:'Win with only 1 card placed.' },
  { id:'play_power_9',      name:'Maximum Power',         desc:'Place a card with power 9 in battle.' },
  { id:'play_comeback_2',   name:'Double Comeback',       desc:'Win 2 comeback games in a session.' },

  // AI-related
  { id:'ai_perfect',        name:'Flawless Victory',      desc:'Win without the AI ever leading in VP.' },
  { id:'ai_speed',          name:'Speed Runner',          desc:'Win a game in under 2 minutes.' },
  { id:'ai_endgame',        name:'Endgame Closer',        desc:'Win after the final card is placed.' },
  { id:'ai_underdog',       name:'Underdog',              desc:'Win after the AI led on victory points.' },

  // Collection/meta
  { id:'col_all_factions',  name:'Faction Master',        desc:'Win at least once with all 11 factions.' },
  { id:'col_lore_master',   name:'Lore Master',           desc:'Read the lore guide.' },
  { id:'col_deck_all',      name:'Full Arsenal',          desc:'Open all faction decks.' },
  { id:'col_streaks',       name:'Streak Hunter',         desc:'Reach a 5-win streak 3 times.' },
  { id:'col_explore',       name:'Explorer',              desc:'Play in Explorer mode.' },

  // Rare/hard
  { id:'rare_mirror',       name:'Mirror Match',          desc:'Win when both you and the AI played the same faction.' },
  { id:'rare_comeback_vp',  name:'VP Reversal',           desc:'Win after trailing by 15+ VP.' },
  { id:'rare_all_ties',     name:'Tiebreaker',            desc:'Win a game where every row started as a tie before deciding factor.' },
  { id:'rare_sniper_chain', name:'Sniper Chain',          desc:'Win using 3 or more Sniper cards.' },
  { id:'rare_no_loss',      name:'Untouchable',           desc:'Win without losing a single row or column.' },
  { id:'rare_deciding_both',name:'Double Decider',        desc:'Win two rows and two columns with deciding factor cards.' },
  { id:'rare_lamb_win',     name:'Lamb to the Slaughter', desc:'Win while having a Lamb card on the board.' },
  { id:'rare_full_silence', name:'Full Silence',          desc:'Win a game in which neither side placed a single ability card.' },
  { id:'rare_tier_staircase',name:'Tier Staircase',       desc:'Have one of each tier (I, II, III, IV) on the board at once.' },
  { id:'rare_all_rows',     name:'Row Dominator',         desc:'Win all 5 rows.' },
  { id:'rare_all_cols',     name:'Column Dominator',      desc:'Win all 7 columns.' },
  { id:'rare_hazard_pivot', name:'Hazard Pivot',          desc:'Win a game where an enemy card was weakened by an adjacent cosmic hazard.' },

  // Hidden
  { id:'hidden_first_day',  name:'???',                   desc:'Play your first game.' },
  { id:'hidden_night_owl',  name:'???',                   desc:'Play a game after midnight.' },
];

// Build a quick lookup map
const _ACHIEV_MAP = {};
ACHIEVEMENTS.forEach(a => { _ACHIEV_MAP[a.id] = a; });

// Badge path helper
function _badgePath(id) { return 'badges-sm/' + id + '.webp'; }

// ── Public API ─────────────────────────────────────────────────────────────────
function getUnlockedAchievements() { return _loadAchievements(); }

function unlockAchievement(id, opts) {
  if (!_ACHIEV_MAP[id]) return false;
  const unlocked = _loadAchievements();
  if (unlocked.has(id)) return false;
  unlocked.add(id);
  _saveAchievements(unlocked);
  // checkAchievements() batches: it passes deferSync and performs ONE upsert
  // after the whole pass instead of one per unlocked badge.
  if (!(opts && opts.deferSync)) _sbSyncPlayer();
  return true;
}

// ── Supabase sync (same project as leaderboard) ───────────────────────────────
// Prefers the gz_save_player / gz_get_player RPCs added in supabase/migration.sql
// (gz_players is RPC-only once RLS hardening is applied — direct table access by
// the anon role is revoked so tokens can never be enumerated). Falls back to the
// legacy direct table access while the migration hasn't been applied yet (404).
function _sbSyncPlayer() {
  if (typeof _SB_LB_URL === 'undefined') return;
  const token = _getToken();
  const achievements = [..._loadAchievements()];
  const stats = _loadStats();
  fetch(_SB_LB_URL + '/rest/v1/rpc/gz_save_player', {
    method: 'POST',
    headers: _SB_LB_H,
    body: JSON.stringify({ p_token: token, p_achievements: achievements, p_stats: stats })
  })
  .then(r => {
    if (r.status !== 404) return; // RPC handled it (or failed non-retryably)
    // Legacy fallback: direct upsert (pre-migration schema)
    return fetch(_SB_LB_URL + '/rest/v1/gz_players', {
      method: 'POST',
      headers: { ..._SB_LB_H, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ token, achievements, stats, last_seen: new Date().toISOString() })
    });
  })
  .catch(() => {});
}

// Merge a remote stats object into local stats without clobbering local
// progress: counters take Math.max, arrays are unioned, booleans are OR'd.
function _mergeRemoteStats(local, remote) {
  const merged = Object.assign({}, local);
  if (!remote || typeof remote !== 'object') return merged;
  const counters = ['totalWins','totalLosses','totalDraws','currentStreak','bestStreak','gamesPlayed','_streak5Count'];
  counters.forEach(k => {
    const r = Number(remote[k]);
    if (Number.isFinite(r)) merged[k] = Math.max(Number(local[k]) || 0, r);
  });
  const arrays = ['factionsWon','decksOpened','loreFactionsViewed','exploreFactions'];
  arrays.forEach(k => {
    const l = Array.isArray(local[k]) ? local[k] : [];
    const r = Array.isArray(remote[k]) ? remote[k] : [];
    merged[k] = [...new Set([...l, ...r])];
  });
  const bools = ['loreViewed','exploreMode','firstAbilityWinDone'];
  bools.forEach(k => { merged[k] = !!(local[k] || remote[k]); });
  return merged;
}

// On load: if local achievements are empty, try to pull from Supabase by token
(function _tryRestoreFromSupabase() {
  const unlocked = _loadAchievements();
  if (unlocked.size > 0) return; // already have local data
  if (typeof _SB_LB_URL === 'undefined') return;
  const token = _getToken();

  function _applyRow(row) {
    if (!row) return;
    if (Array.isArray(row.achievements) && row.achievements.length) {
      // Only accept known achievement ids from the network
      _saveAchievements(new Set(row.achievements.filter(id => _ACHIEV_MAP[id])));
    }
    if (row.stats && typeof row.stats === 'object') {
      _saveStats(_mergeRemoteStats(_loadStats(), row.stats));
    }
  }

  fetch(_SB_LB_URL + '/rest/v1/rpc/gz_get_player', {
    method: 'POST',
    headers: _SB_LB_H,
    body: JSON.stringify({ p_token: token })
  })
  .then(r => {
    if (r.status === 404) {
      // Legacy fallback: direct select (pre-migration schema)
      return fetch(_SB_LB_URL + '/rest/v1/gz_players?token=eq.' + encodeURIComponent(token) + '&select=achievements,stats', {
        headers: _SB_LB_H
      }).then(r2 => r2.ok ? r2.json() : []);
    }
    return r.ok ? r.json() : [];
  })
  .then(rows => { if (rows && rows.length) _applyRow(rows[0]); })
  .catch(() => {});
})();

// ── Session tracking ───────────────────────────────────────────────────────────
window._achievSessionUnlocks = window._achievSessionUnlocks || [];
window._achievComebacKCount   = window._achievComebacKCount || 0;
window._achievGameStart       = window._achievGameStart || null;

// Call this at game start (state.js initGame)
function achievOnGameStart() {
  window._achievGameStart = Date.now();
  window._achievMidgameAiLead = false;
  window._achievMinPlayerVP = Infinity;
  window._achievMaxPlayerVP = -Infinity;
  window._achievMaxAiVP = -Infinity;
  window._achievMaxDeficit = 0;
}

// ── checkAchievements(gameData) ───────────────────────────────────────────────
// Called at game end. Returns array of newly unlocked IDs.
function checkAchievements(gameData) {
  const {
    outcome,         // 'win' | 'loss' | 'draw'
    pVP, aVP,
    pWins, aWins,    // lines won
    playerFaction, aiFaction,
    grid,
    rowResults, colResults,
    dfRows, dfCols,
  } = gameData;

  const pWon  = outcome === 'win';
  const draw  = outcome === 'draw';
  const lost  = outcome === 'loss';

  // Update stats
  const stats = _loadStats();
  stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;

  if (pWon) {
    stats.totalWins = (stats.totalWins || 0) + 1;
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.currentStreak);
    if (!stats.factionsWon) stats.factionsWon = [];
    if (playerFaction && !stats.factionsWon.includes(playerFaction)) stats.factionsWon.push(playerFaction);
    if (stats.currentStreak === 5) {
      stats._streak5Count = (stats._streak5Count || 0) + 1;
    }
  } else if (lost) {
    stats.totalLosses = (stats.totalLosses || 0) + 1;
    stats.currentStreak = 0;
  } else if (draw) {
    stats.totalDraws = (stats.totalDraws || 0) + 1;
    stats.currentStreak = 0;
  }
  _saveStats(stats);

  // Collect player's placed cards
  const playerCards = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = grid[r][c];
      if (cell && cell.card && cell.owner === 'player') playerCards.push(cell.card);
    }
  }
  // All placed cards (both sides)
  const allCards = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = grid[r][c];
      if (cell && cell.card) allCards.push(cell.card);
    }
  }

  // Hazard adjacency: hazard cells live in the grid with owner 'hazard' and
  // penalize orthogonally adjacent cards (see battle.js). Count how many
  // player/AI cards ended the game next to a hazard.
  const _HZ_DIRS = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
  let hazardCellCount = 0, playerCardsNearHazard = 0, aiCardsNearHazard = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const cell = grid[r][c];
      if (!cell || !cell.card || cell.owner === 'hazard') { if (cell && cell.owner === 'hazard') hazardCellCount++; continue; }
      const nearHazard = _HZ_DIRS.some(({dr,dc}) => {
        const rr = r + dr, cc = c + dc;
        return rr >= 0 && rr < 5 && cc >= 0 && cc < 7 && grid[rr][cc] && grid[rr][cc].owner === 'hazard';
      });
      if (!nearHazard) continue;
      if (cell.owner === 'player') playerCardsNearHazard++;
      else if (cell.owner === 'ai') aiCardsNearHazard++;
    }
  }

  const newlyUnlocked = [];
  function _check(id, condition) {
    // deferSync: one Supabase upsert for the whole pass (see end of function)
    if (condition && unlockAchievement(id, { deferSync: true })) newlyUnlocked.push(id);
  }

  // ── First events ──────────────────────────────────────────────────────────
  _check('first_win',  pWon  && stats.totalWins === 1);
  _check('first_loss', lost  && stats.totalLosses === 1);
  _check('first_tie',  draw  && stats.totalDraws === 1);

  // ability_first: unlocks on the FIRST win that used an ability card,
  // whenever that happens (latched via stats.firstAbilityWinDone — the old
  // "totalWins === 1" check made this unobtainable if the first-ever win
  // happened to use no ability cards).
  const playerAbilCards = playerCards.filter(c => c.ability);
  if (pWon && playerAbilCards.length > 0 && !stats.firstAbilityWinDone) {
    stats.firstAbilityWinDone = true;
    _saveStats(stats);
  }
  _check('ability_first', pWon && stats.firstAbilityWinDone);

  // ── Win streaks ───────────────────────────────────────────────────────────
  _check('win_3',  pWon && stats.currentStreak >= 3);
  _check('win_5',  pWon && stats.currentStreak >= 5);
  _check('win_10', pWon && stats.currentStreak >= 10);
  _check('win_25', pWon && stats.currentStreak >= 25);

  // ── Total wins ────────────────────────────────────────────────────────────
  _check('wins_10',  pWon && stats.totalWins >= 10);
  _check('wins_25',  pWon && stats.totalWins >= 25);
  _check('wins_50',  pWon && stats.totalWins >= 50);
  _check('wins_100', pWon && stats.totalWins >= 100);
  _check('wins_500', pWon && stats.totalWins >= 500);

  // ── VP milestones ─────────────────────────────────────────────────────────
  _check('vp_sweep',     pWon && pWins === 12);
  _check('vp_landslide', pWon && (pVP - aVP) >= 20);
  _check('vp_shutout',   pWon && aVP === 0);
  _check('vp_delta_king',pWon && (pVP - aVP) === 1);

  // vp_comeback: won after tracking a deficit
  const maxDeficit = window._achievMaxDeficit || 0;
  _check('vp_comeback', pWon && maxDeficit >= 10);

  // rare_comeback_vp
  _check('rare_comeback_vp', pWon && maxDeficit >= 15);

  // vp_perfect_row: any row where player won all 7 cells
  const _perfectRow = rowResults && rowResults.some((res, rIdx) => {
    if (res !== 'p') return false;
    let allPlayer = true;
    for (let c = 0; c < 7; c++) { if (!grid[rIdx]?.[c] || grid[rIdx][c].owner !== 'player') { allPlayer = false; break; } }
    return allPlayer;
  });
  _check('vp_perfect_row', pWon && _perfectRow);

  // ── Faction wins ──────────────────────────────────────────────────────────
  const _FACTIONS = ['terran','brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'];
  if (pWon && playerFaction && _FACTIONS.includes(playerFaction)) {
    _check('faction_' + playerFaction, true);
  }

  // ── Ability-specific wins ─────────────────────────────────────────────────
  if (pWon) {
    const _ABIL_IDS = ['commander','flank','sniper','shield','density','rush','phantom','pierce','revenge','deciding','lamb','intimidate','fortify','laser','cloak','double','birthright','home_invader'];
    const playerAbils = new Set(playerCards.map(c => c.ability).filter(Boolean));
    _ABIL_IDS.forEach(a => {
      _check('abil_' + a, playerAbils.has(a));
    });
  }

  // ── Play conditions ───────────────────────────────────────────────────────
  // play_tier4: any player card with tier 'IV'
  _check('play_tier4', playerCards.some(c => c.tier === 'IV'));

  // play_full_grid: all 35 cells occupied
  const filledCells = allCards.length;
  _check('play_full_grid', filledCells === 35);

  // play_power_9: any player card with power === 9
  _check('play_power_9', playerCards.some(c => c.power >= 9));

  // play_no_ability: won with no ability cards placed by the player
  _check('play_no_ability', pWon && playerCards.every(c => !c.ability));

  // rare_full_silence: won with zero ability cards placed by EITHER side
  // (strictly harder than play_no_ability, which only looks at the player's cards)
  _check('rare_full_silence', pWon && allCards.every(c => !c.ability));

  // play_all_abilities: won with 5+ different abilities
  const abilSet = new Set(playerCards.map(c => c.ability).filter(Boolean));
  _check('play_all_abilities', pWon && abilSet.size >= 5);

  // play_solo_win: won with only 1 player card placed
  _check('play_solo_win', pWon && playerCards.length === 1);

  // play_comeback_2: two comeback wins in session
  if (pWon && maxDeficit >= 10) {
    window._achievComebacKCount = (window._achievComebacKCount || 0) + 1;
  }
  _check('play_comeback_2', (window._achievComebacKCount || 0) >= 2);

  // play_hazard_zero: won a game that HAD a hazard on the board, with no
  // player card ending adjacent to it (hazards penalize adjacent cards)
  _check('play_hazard_zero', pWon && hazardCellCount > 0 && playerCardsNearHazard === 0);

  // ── AI-related ────────────────────────────────────────────────────────────
  // ai_perfect: won without AI ever leading in VP (tracked via window._achievMidgameAiLead)
  _check('ai_perfect', pWon && !window._achievMidgameAiLead);

  // ai_speed: won in under 2 minutes
  const gameDuration = window._achievGameStart ? (Date.now() - window._achievGameStart) : Infinity;
  _check('ai_speed', pWon && gameDuration < 120000);

  // ai_endgame: won after all cards are placed
  _check('ai_endgame', pWon && filledCells >= 34);

  // ai_underdog: won while AI had more cells at midgame
  _check('ai_underdog', pWon && window._achievMidgameAiLead === true);

  // ── Collection/meta ───────────────────────────────────────────────────────
  // col_all_factions: won with all 11 factions
  const fWon = stats.factionsWon || [];
  _check('col_all_factions', _FACTIONS.every(f => fWon.includes(f)));

  // col_streaks: reached 5-win streak 3 times
  _check('col_streaks', (stats._streak5Count || 0) >= 3);

  // col_explore: tracked separately via achievOnExplore()

  // col_lore_master: tracked separately via achievOnLore()

  // col_deck_all: tracked separately via achievOnDeckOpen()

  // ── Rare/hard ─────────────────────────────────────────────────────────────
  // rare_mirror: won when both sides played same faction
  _check('rare_mirror', pWon && playerFaction === aiFaction);

  // rare_all_ties: every row was a tie before deciding factor
  const allRowsTied = rowResults && dfRows && rowResults.every((res, i) => dfRows[i] !== null || res === 'tie');
  _check('rare_all_ties', pWon && allRowsTied);

  // rare_sniper_chain: 3+ sniper cards
  _check('rare_sniper_chain', pWon && playerCards.filter(c => c.ability === 'sniper').length >= 3);

  // rare_no_loss: won without losing any row or column
  _check('rare_no_loss', pWon && aWins === 0);

  // rare_deciding_both: won 2 rows AND 2 cols via deciding factor
  const dfRowWins = (dfRows || []).filter(d => d === 'p').length;
  const dfColWins = (dfCols || []).filter(d => d === 'p').length;
  _check('rare_deciding_both', pWon && dfRowWins >= 2 && dfColWins >= 2);

  // rare_lamb_win: won with a lamb card on the board
  _check('rare_lamb_win', pWon && playerCards.some(c => c.ability === 'lamb'));

  // rare_tier_staircase: one of each tier on board at once
  const tierSet = new Set(allCards.map(c => c.tier));
  _check('rare_tier_staircase', ['I','II','III','IV'].every(t => tierSet.has(t)));

  // rare_all_rows: won all 5 rows
  _check('rare_all_rows', pWon && rowResults && rowResults.every(r => r === 'p'));

  // rare_all_cols: won all 7 columns
  _check('rare_all_cols', pWon && colResults && colResults.every(c => c === 'p'));

  // rare_hazard_pivot: won a game in which at least one AI card ended adjacent
  // to a hazard (i.e. was weakened by its -2 penalty)
  _check('rare_hazard_pivot', pWon && aiCardsNearHazard > 0);

  // ── Hidden ────────────────────────────────────────────────────────────────
  const now = new Date();
  _check('hidden_night_owl', now.getHours() >= 0 && now.getHours() < 5);

  // hidden_first_day: first game ever played
  _check('hidden_first_day', stats.gamesPlayed === 1);

  // ── Record session unlocks ────────────────────────────────────────────────
  if (newlyUnlocked.length) {
    window._achievSessionUnlocks = (window._achievSessionUnlocks || []).concat(newlyUnlocked);
  }

  // Single batched Supabase upsert for the whole pass (stats always changed —
  // gamesPlayed — and every unlock above deferred its sync to here).
  _sbSyncPlayer();

  return newlyUnlocked;
}

// ── Auxiliary event hooks (called from index.html UI) ─────────────────────────
const _ACHIEV_FACTION_IDS = ['terran','brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'];

function _achievRecordUnlock(id) {
  if (unlockAchievement(id)) {
    window._achievSessionUnlocks = (window._achievSessionUnlocks || []).concat([id]);
    return true;
  }
  return false;
}

// Lore guide viewed (optionally for a specific faction). Persists both the
// legacy boolean and the per-faction viewed set; unlocks col_lore_master.
function achievOnLore(factionKey) {
  const stats = _loadStats();
  stats.loreViewed = true;
  if (!Array.isArray(stats.loreFactionsViewed)) stats.loreFactionsViewed = [];
  if (factionKey && _ACHIEV_FACTION_IDS.includes(factionKey) && !stats.loreFactionsViewed.includes(factionKey)) {
    stats.loreFactionsViewed.push(factionKey);
  }
  _saveStats(stats);
  _achievRecordUnlock('col_lore_master');
}

// Deck opened. deckId is optional — falls back to the currently selected
// faction so a bare achievOnDeckOpen() call still records progress.
// Unlocks deck_opened (first deck) and col_deck_all (all 11 factions).
function achievOnDeckOpen(deckId) {
  deckId = deckId || (typeof window !== 'undefined' && (window.selectedRace || window.playerRaceId)) || null;
  const stats = _loadStats();
  if (!Array.isArray(stats.decksOpened)) stats.decksOpened = [];
  if (deckId && _ACHIEV_FACTION_IDS.includes(deckId) && !stats.decksOpened.includes(deckId)) {
    stats.decksOpened.push(deckId);
  }
  _saveStats(stats);
  _achievRecordUnlock('deck_opened');
  if (_ACHIEV_FACTION_IDS.every(f => stats.decksOpened.includes(f))) {
    _achievRecordUnlock('col_deck_all');
  }
}

// Explorer mode entered (optionally for a specific faction). Persists the
// visited-faction set; unlocks col_explore.
function achievOnExplore(factionKey) {
  const stats = _loadStats();
  stats.exploreMode = true;
  if (!Array.isArray(stats.exploreFactions)) stats.exploreFactions = [];
  if (factionKey && _ACHIEV_FACTION_IDS.includes(factionKey) && !stats.exploreFactions.includes(factionKey)) {
    stats.exploreFactions.push(factionKey);
  }
  _saveStats(stats);
  _achievRecordUnlock('col_explore');
}

// ── Midgame VP tracking (call from render-score.js or computeScores) ──────────
// Attach a watcher so vp_comeback / ai_underdog work correctly
(function _installVPWatcher() {
  // We patch lazily so we don't break initialization order
  window._achievVPWatchInstalled = false;
  function _installPatch() {
    if (window._achievVPWatchInstalled) return;
    if (typeof computeScores !== 'function') return;
    const __orig = computeScores;
    window.computeScores = function() {
      const result = __orig.apply(this, arguments);
      if (result && typeof result.pVP === 'number' && typeof result.aVP === 'number') {
        const deficit = result.aVP - result.pVP;
        if (deficit > 0) {
          window._achievMaxDeficit = Math.max(window._achievMaxDeficit || 0, deficit);
        }
        if (result.aVP > result.pVP) {
          window._achievMidgameAiLead = true;
        }
      }
      return result;
    };
    window._achievVPWatchInstalled = true;
  }
  // Try at load time; also schedule a retry after scripts settle
  _installPatch();
  setTimeout(_installPatch, 500);
  setTimeout(_installPatch, 1500);
})();
