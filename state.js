function loadAudioSettings() {
  try {
    const mv = localStorage.getItem('gz_musicVol');
    if (mv !== null) setVolume(Number(mv));

    const mm = localStorage.getItem('gz_musicMuted');
    if (mm === '1' && !musicMuted) toggleGameMusic();

    const sv = localStorage.getItem('gz_sfxVol');
    if (sv !== null) setSfxVolume(Number(sv));

    const sm = localStorage.getItem('gz_sfxMuted');
    if (sm === '1') { _sfxMuted = true; const btn=document.getElementById('sfxMuteBtn'); if(btn) btn.textContent='🔇 UNMUTE SFX'; }
  } catch(e) {}
}

function initGame() {


  const _hsfx=document.getElementById('hoverSfx'); if(_hsfx)_hsfx.load();


  G = {


    grid: Array(5).fill(null).map(() =>


      Array(7).fill(null).map(() => ({ card: null, owner: null }))


    ),


    playerHand: (window.__activeDeck || PLAYER_CARDS).map(c => {


      // Power = tier number globally


      const tierPow = {'I':1,'II':2,'III':3,'IV':4}[c.tier] || c.power;


      return {...c, power: tierPow, shieldExpended: false, used: false};


    }),


    aiHand: ((() => {


      const factionDecks = {


        terran: PLAYER_CARDS, brood: BROOD_CARDS,


        crystallis: CRYSTALLIS_CARDS, mycos: MYCOS_CARDS, veil: VEIL_CARDS,


        entropy: ENTROPY_CARDS, void: VOID_CARDS, gas: GAS_CARDS,


        lithos: LITHOS_CARDS, quantum: QUANTUM_CARDS, choir: CHOIR_CARDS


      };


      return factionDecks[window.aiRaceId] || AI_CARDS;


    })()).map(c => {


      const tierPow = {'I':1,'II':2,'III':3,'IV':4}[c.tier] || c.power;


      // Flip N↔S on faction decks used as AI — they attack downward (S faces player)


      const useFlip = ['terran','brood','crystallis','mycos','veil','entropy','void','gas','lithos','quantum','choir'].includes(window.aiRaceId);


      const edges = useFlip


        ? { n: c.edges.s, s: c.edges.n, e: c.edges.e, w: c.edges.w }


        : c.edges;


      return {...c, edges, power: tierPow, shieldExpended: false, used: false};


    }),


    turn:         'player',


    selectedCard: null,


    gameOver:     false,


    _prevEligibleIds: undefined, // reset for card pop tracking


    log:          [],


    _flankTriggered: null,

    _previewCell: null,





  };


  document.getElementById('overlay').classList.remove('show');


  hideDragCard();


  document.body.style.cursor = 'default';


  window._activeTier = undefined; // reset tier accordion to T1


  renderAll();


  _prevBadgeRes.rows = Array(5).fill(null);


  _prevBadgeRes.cols = Array(7).fill(null);


  // Assign 5 random abilities per deck (weighted toward higher tiers)


  const _pRace = window.playerRaceId || 'terran';


  const _aRace = window.aiRaceId     || 'entropy';


  assignRandomAbilities(G.playerHand, _pRace);


  assignRandomAbilities(G.aiHand,     _aRace);





  // Ensure all cards have edgeMod initialized


  G.playerHand.forEach(c => { if (!c.edgeMod) c.edgeMod = {n:0,s:0,e:0,w:0}; });


  G.aiHand.forEach(c => { if (!c.edgeMod) c.edgeMod = {n:0,s:0,e:0,w:0}; });





  // BIRTHRIGHT: if any player card has birthright ability, add bonus T2 unit


  if (G.playerHand.some(c => c.ability === 'birthright')) {


    const bonusCard = {


      id: 'birthright_bonus',


      name: 'BONUS UNIT',


      tier: 'II',


      tierLabel: 'BONUS',


      zone: 'wide_cross',


      edges: { n:4, s:3, e:4, w:4 },


      power: 2,


      ability: null,


      abilityText: 'Spawned by BIRTHRIGHT',


      art: G.playerHand.find(c => c.tier === 'II')?.art || '',


      shieldExpended: false,


      used: false,


      edgeMod: { n:0, s:0, e:0, w:0 },


      _isBirthrightBonus: true


    };


    G.playerHand.push(bonusCard);


    addLog('system', 'BIRTHRIGHT — bonus T2 unit added to your hand');


  }





  // Place cosmic hazard cards for balanced and aggressive games (1-2 random hazards)


  const _hazardDiff = window.aiDifficulty || 'balanced';


  if (_hazardDiff === 'balanced' || _hazardDiff === 'aggressive') {


    // In multiplayer use room ID as seed so both clients get identical hazards


    const _hzRng = (() => {


      if (!_mpRoom) return () => Math.random();


      let s = 0;


      for (const ch of _mpRoom) s = (s * 31 + ch.charCodeAt(0)) & 0x7fffffff;


      return seededRand(s);


    })();


    const _count = _hzRng() < 0.5 ? 1 : 2;


    // Deterministic Fisher-Yates shuffle


    const _shuffledH = [...HAZARD_CARDS];


    for (let _i = _shuffledH.length - 1; _i > 0; _i--) {


      const _j = Math.floor(_hzRng() * (_i + 1));


      [_shuffledH[_i], _shuffledH[_j]] = [_shuffledH[_j], _shuffledH[_i]];


    }


    let _placed = 0;


    const _tried = new Set();


    while (_placed < _count && _tried.size < 21) { // rows 1-3, cols 0-6 = 21 cells


      const _hr = 1 + Math.floor(_hzRng() * 3); // rows 1,2,3 (not home rows)


      const _hc = Math.floor(_hzRng() * 7);


      const _key = `${_hr},${_hc}`;


      if (_tried.has(_key)) continue;


      _tried.add(_key);


      if (!G.grid[_hr][_hc].card) {


        const _hz = _shuffledH[_placed];


        const _hzR = (_mpPlayer === 2) ? (4 - _hr) : _hr;
        G.grid[_hzR][_hc] = { card: { ..._hz, power:0, tier:'I', edges:{n:0,s:0,e:0,w:0}, edgeMod:{n:0,s:0,e:0,w:0}, used:false, isHazard:true }, owner:'hazard' };


        addLog('system', `⚠ ${_hz.name} emerged at [${_hr},${_hc}] — adjacent cards lose 2 VP`);


        _placed++;


      }


    }


  }





  // Re-render so hazard cells show immediately


  renderGrid();





  addLog('system', 'GAME START -- place from your home row');


  document.addEventListener('click', function _hzv() { document.querySelectorAll('.cell.hazard video').forEach(v=>v.play().catch(()=>{})); document.removeEventListener('click',_hzv); }, {once:true});


}

function initRaceTheme() {


  const params   = new URLSearchParams(window.location.search);


  const raceId   = params.get('race') || 'terran';


  const allRaces = Object.keys(RACE_DATA);


  // Persist AI race across refreshes — only randomize on first visit or change deck


  let aiRaceId = sessionStorage.getItem('gz_ai_race');


  if (!aiRaceId || aiRaceId === raceId) {


    aiRaceId = allRaces.filter(r => r !== raceId)[Math.floor(Math.random() * (allRaces.length - 1))];


    sessionStorage.setItem('gz_ai_race', aiRaceId);


  }





  const player = RACE_DATA[raceId]   || RACE_DATA.terran;


  const ai     = RACE_DATA[aiRaceId] || RACE_DATA.entropy;





  // Apply lore backgrounds to fixed full-screen top/bottom divs


  const topBg = document.getElementById('game-top-bg');


  const botBg = document.getElementById('game-bottom-bg');


  if (topBg) { topBg.style.backgroundImage = `url('${ai.loreBg}')`; topBg.style.opacity = '0.95'; }


  if (botBg) { botBg.style.backgroundImage = `url('${player.loreBg}')`; botBg.style.opacity = '0.95'; }


  // Remove background from ai-area and player-area


  const aiBar = document.querySelector('.ai-area');


  const playerBar = document.querySelector('.player-area');


  if (aiBar) aiBar.style.backgroundImage = '';


  if (playerBar) playerBar.style.backgroundImage = '';





  // Panels removed — portraits live in ai-area/player-area headers





  // Update player color throughout


  const pColor = player.color;


  document.documentElement.style.setProperty('--player-color', pColor);





  // Update player portrait — avatar image + labels


  const pAvEl = document.querySelector('.player-avatar');


  if (pAvEl) {


    pAvEl.innerHTML = player.avatarImg


      ? `<img src="${player.avatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`


      : player.avatar;


    pAvEl.style.borderColor = player.color + '88';


  }


  const pNameEl = document.querySelector('.player-name');


  const pTitleEl = document.querySelector('.player-sub');


  if (pNameEl)  { pNameEl.textContent = player.name; pNameEl.style.color = player.color; }


  if (pTitleEl) pTitleEl.textContent = player.sub;





  const aiAvEl = document.querySelector('.ai-avatar');


  const aiNmEl = document.querySelector('.ai-name');


  const aiSubEl = document.querySelector('.ai-sub');


  if (aiAvEl) {


    // Use generated avatar portrait image if available


    aiAvEl.innerHTML = ai.avatarImg


      ? `<img src="${ai.avatarImg}" style="width:100%;height:100%;object-fit:cover;border-radius:2px;">`


      : ai.avatar;


    aiAvEl.style.borderColor = ai.color + '88';


  }


  if (aiNmEl)  { aiNmEl.textContent = ai.name; aiNmEl.style.color = ai.color; }


  if (aiSubEl) aiSubEl.textContent = ai.sub;


  const aiQuoteEl = document.getElementById('aiQuote');


  if (aiQuoteEl) aiQuoteEl.textContent = ai.quote;





  // Store short faction names (first 2 words) for score badge display


  const playerWords = player.name.replace(/^THE /, '').split(' ');


  const aiWords     = ai.name.replace(/^THE /, '').split(' ');


  window.playerFactionName  = playerWords.slice(0, 2).join(' ');


  window.aiFactionName      = aiWords.slice(0, 2).join(' ');


  window.playerRaceId       = raceId;


  window.aiRaceId           = aiRaceId;


  window.playerAvatarImg    = player.avatarImg || `assets/avatars/${raceId}.png`;


  window.aiAvatarImg        = ai.avatarImg     || `assets/avatars/${aiRaceId}.png`;





  // Safe zone bar colors — CSS custom properties on :root


  document.documentElement.style.setProperty('--player-safe-col', player.color + 'bb');


  document.documentElement.style.setProperty('--ai-safe-col',     ai.color     + 'bb');





  // Seed faction HUD immediately


  const sbAi = document.getElementById('sbAiAvatar');


  const sbPl = document.getElementById('sbPlayerAvatar');


  if (sbAi) sbAi.src = ai.avatarImg || `assets/avatars/${aiRaceId}.png`;


  if (sbPl) sbPl.src = player.avatarImg || `assets/avatars/${raceId}.png`;


  const sbAN = document.getElementById('sbAiName');


  const sbPN = document.getElementById('sbPlayerName');


  if (sbAN) { sbAN.textContent = aiWords.slice(0,2).join(' '); sbAN.style.color = ai.color+'bb'; }


  if (sbPN) { sbPN.textContent = playerWords.slice(0,2).join(' '); sbPN.style.color = player.color+'bb'; }





  // Update faction labels below avatars


  const aiFactionLbl = document.getElementById('aiFactionLabel');


  const playerFactionLbl = document.getElementById('playerFactionLabel');


  if (aiFactionLbl) { aiFactionLbl.textContent = window.aiFactionName; aiFactionLbl.style.color = ai.color + '88'; }


  if (playerFactionLbl) { playerFactionLbl.textContent = window.playerFactionName; playerFactionLbl.style.color = player.color + '88'; }





  // Store faction colors globally for use in renderGrid


  window.playerFactionColor = player.color;


  window.aiFactionColor     = ai.color;





  window.aiDifficulty = new URLSearchParams(window.location.search).get('difficulty') || 'balanced';


  return { player, ai, raceId, aiRaceId };


}

function renderAll() {


  const _s = computeScores();


  renderGrid();


  renderHand();


  renderScoreBadges(_s);


  renderScoreHeader(_s);


  renderAiHand();


}
