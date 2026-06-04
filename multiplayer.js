// ── MULTIPLAYER ENGINE ────────────────────────────────────────────────────────


const _SB_URL = 'https://mstpkwxxhsspivtngfnm.supabase.co';


const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdHBrd3h4aHNzcGl2dG5nZm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTE2MTcsImV4cCI6MjA5NjAyNzYxN30.B0F-e_mGzv5kbjwOa2yw499OfsZ3qJDXdoyrCu2tNiI';


const _SB_H   = { 'apikey':_SB_KEY, 'Authorization':'Bearer '+_SB_KEY, 'Content-Type':'application/json' };

// Detect multiplayer params


const _mpParams = new URLSearchParams(window.location.search);


const _mpRoom   = _mpParams.get('room');


const _mpPlayer = parseInt(_mpParams.get('player') || '0'); // 1 or 2, 0 = single player


const _mpP2Fac  = _mpParams.get('p2faction') || ''; // P1 knows P2's faction from room


// P2: set P1's faction as the AI race so the correct deck loads


if (_mpPlayer === 2 && _mpParams.get('aifaction')) {


  sessionStorage.setItem('gz_ai_race', _mpParams.get('aifaction'));


}


// P1: set P2's faction as the AI race so the correct deck loads (and mpApplyMove finds cards)


if (_mpPlayer === 1 && _mpP2Fac) {


  sessionStorage.setItem('gz_ai_race', _mpP2Fac);


}





let _mpTurnNum  = 0;   // moves processed so far


let _mpPollInt  = null; // polling interval handle


let _mpMyTurn   = _mpPlayer === 1; // P1 goes first

function mpShowWaiting(show) {


  const ov = document.getElementById('mpWaitOverlay');


  if (ov) ov.style.display = show ? 'flex' : 'none';


}

async function mpSubmitMove(cardId, r, c, seed, isFlank = false) {


  const move = { player:_mpPlayer, turn:_mpTurnNum, cardId, r, c, seed };


  if (isFlank) move.flank = true;


  for (let attempt = 0; attempt < 3; attempt++) {


    try {


      const res = await fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}&select=moves`, { headers:_SB_H });


      const data = await res.json();


      const moves = (data[0]?.moves || []);


      // Idempotency: don't double-write if a retry already succeeded


      if (!moves.find(m => m.player === _mpPlayer && m.turn === _mpTurnNum)) {


        moves.push(move);


        const patch = await fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}`, {


          method:'PATCH', headers:_SB_H,


          body: JSON.stringify({ moves, updated_at: new Date().toISOString() })


        });


        if (!patch.ok) throw new Error('PATCH ' + patch.status);


      }


      _mpTurnNum++;


      return; // success


    } catch(e) {


      console.error(`MP: submit attempt ${attempt+1} failed`, e);


      if (attempt < 2) await new Promise(r => setTimeout(r, 800 * (attempt + 1)));


      else showToast('Move may not have saved — check connection', '#ff4422');


    }


  }


}

function mpFindCard(cardId, opponentFaction) {


  const allDecks = {


    terran:PLAYER_CARDS, brood:BROOD_CARDS, crystallis:CRYSTALLIS_CARDS,


    mycos:MYCOS_CARDS, veil:VEIL_CARDS, entropy:ENTROPY_CARDS,


    void:VOID_CARDS, gas:GAS_CARDS, lithos:LITHOS_CARDS,


    quantum:QUANTUM_CARDS, choir:CHOIR_CARDS


  };


  const deck = allDecks[opponentFaction] || [];


  return deck.find(c => c.id === cardId) || null;


}

function mpApplyMove(move) {


  // P1's opponent is P2 (p2faction param); P2's opponent is P1 (aifaction param)


  const opFaction = _mpPlayer === 1 ? _mpP2Fac : (_mpParams.get('aifaction') || window.aiRaceId);


  let card = mpFindCard(move.cardId, opFaction);


  if (!card) { console.warn('MP: card not found', move.cardId); return; }


  // Find the card in aiHand (it might have been modified by abilities/edgeMod)


  const handCard = G.aiHand.find(c => c.id === move.cardId && !c.used) || {...card, used:false, shieldExpended:false, edgeMod:{n:0,s:0,e:0,w:0}};


  // Use seeded random for AMBUSH/STONEWALL so both clients get same sides


  if (move.seed) window._mpSeed = seededRand(move.seed);


  const isFlank = move.flank === true;


  // Mirror row: opponent's home row (4) = our AI home row (0), battle zone rows invert


  const applyR = 4 - move.r;


  const applyC = move.c;


  // noTurnFlip=true: opponent has an extra FLANK turn, don't give control to this player yet


  animateAiCard(handCard, applyR, applyC, isFlank);


  _mpTurnNum++;


  if (isFlank) {


    // Keep G.turn as 'ai' and poll for opponent's extra-turn card


    setTimeout(() => { if (!G.gameOver) { G.turn = 'ai'; mpStartPolling(); } }, 620);


  } else {


    _mpMyTurn = true;


    // Flash "YOUR TURN" in the wait banner after the animation settles


    setTimeout(() => {


      const _ov = document.getElementById('mpWaitOverlay');


      if (!_ov || G.gameOver) return;


      const _orig = _ov.innerHTML;


      const _origBorder = _ov.style.borderColor;


      _ov.innerHTML = `<div style="font-family:'Orbitron',monospace;font-size:12px;letter-spacing:3px;color:#00ffcc;">▶ YOUR TURN</div>`;


      _ov.style.borderColor = '#00ffcc88';


      _ov.style.display = 'flex';


      setTimeout(() => { _ov.style.display = 'none'; _ov.innerHTML = _orig; _ov.style.borderColor = _origBorder; }, 1400);


    }, 620);


  }


}

function mpStartPolling() {


  if (_mpPollInt) clearInterval(_mpPollInt);


  mpShowWaiting(true);


  let _mpPollErrors = 0, _mpLastActivity = Date.now();


  _mpPollInt = setInterval(async () => {


    if (G.gameOver) { clearInterval(_mpPollInt); _mpPollInt = null; return; }


    // Pause inactivity clock while guide is open
    if (document.getElementById('guideModal')?.style.display !== 'none') {
      _mpLastActivity = Date.now();
    }

    // Stale warning: 4 minutes with no activity
    if (Date.now() - _mpLastActivity > 240000) {


      addLog('system', '⚠ No opponent activity for 4 min — they may have disconnected');


      _mpLastActivity = Date.now();


    }


    try {


      const res = await fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}&select=moves,status`, { headers:_SB_H });


      const data = await res.json();


      _mpPollErrors = 0; // reset on successful fetch


      if (!data[0]) return;


      if (data[0].status === 'done') { clearInterval(_mpPollInt); _mpPollInt = null; mpShowWaiting(false); return; }


      const moves = data[0].moves || [];


      if (moves.length > _mpTurnNum) {


        const nextMove = moves[_mpTurnNum];


        // Validate: must be opponent's move AND correct turn index


        if (nextMove.player !== _mpPlayer && nextMove.turn === _mpTurnNum) {


          clearInterval(_mpPollInt); _mpPollInt = null;


          _mpLastActivity = Date.now();


          mpShowWaiting(false);


          setTimeout(() => mpApplyMove(nextMove), 300);


        }


      }


    } catch(e) {


      _mpPollErrors++;


      console.warn(`MP poll error #${_mpPollErrors}`, e);


      if (_mpPollErrors === 5)  showToast('Connection unstable — retrying...', '#ffaa22');


      if (_mpPollErrors >= 15) { // ~30s of failures


        clearInterval(_mpPollInt); _mpPollInt = null;


        addLog('system', 'Lost connection to server. Please refresh to reconnect.');


        showToast('Connection lost — please refresh', '#ff4422');


      }


    }


  }, 2000);


}

// ── MULTIPLAYER HOOKS ─────────────────────────────────────────────────────────


if (_mpRoom && _mpPlayer) {


  // After game init, replace turn flow with MP version


  window.addEventListener('load', () => {
  loadAudioSettings();


    // P2 waits for P1's first move


    if (_mpPlayer === 2) {


      G.turn = 'ai'; // disable player input until P1 moves


      renderScoreHeader();


      mpStartPolling();


    }


  });


}
