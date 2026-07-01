// ── MULTIPLAYER ENGINE ────────────────────────────────────────────────────────

// Supabase config — single source: shared-data.js window.GZ_SB (loaded first)
const _SB_URL = window.GZ_SB.url;

const _SB_KEY = window.GZ_SB.key;

const _SB_H   = window.GZ_SB.headers;

// Detect multiplayer params

const _mpParams = new URLSearchParams(window.location.search);

const _mpRoom   = _mpParams.get('room');

const _mpPlayer = parseInt(_mpParams.get('player') || '0'); // 1 or 2, 0 = single player
window._mpPlayer = _mpPlayer; // exposed for render-score.js initials display

const _mpP2Fac  = _mpParams.get('p2faction') || ''; // P1 knows P2's faction from room

const _mpP1Initials = _mpParams.get('p1initials') || '';
const _mpP2Initials = _mpParams.get('p2initials') || '';
window._mpP1Initials = _mpP1Initials;
window._mpP2Initials = _mpP2Initials;

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

// ── 60-second turn timer ──────────────────────────────────────────────────────
// Countdown is computed from a wall-clock deadline (Date.now()), NOT from
// counting interval ticks: background tabs throttle timers, which used to
// stretch the 60s forfeit window indefinitely.
let _mpTimerInterval = null;
let _mpTimerDeadline = 0;
const _MP_TURN_MS = 60000;

function _mpTimerTick() {
  const msLeft = _mpTimerDeadline - Date.now();
  const secs   = Math.max(0, Math.ceil(msLeft / 1000));
  const bar    = document.getElementById('mpTimerBar');
  const count  = document.getElementById('mpTimerCount');
  const pct = Math.max(0, Math.min(100, msLeft / _MP_TURN_MS * 100));
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = secs > 30 ? '#00ffcc'
      : secs > 15 ? '#ffdd00' : '#ff4444';
  }
  if (count) {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, '0');
    count.textContent = m + ':' + s;
  }
  if (msLeft <= 0) {
    mpStopTurnTimer();
    if (typeof forfeitGame === 'function') forfeitGame();
  }
}

// Safe to call twice: any running timer is cleared first (no stacked
// intervals) and a fresh 60s deadline starts. Call from turn.js's flank
// branch to time the FLANK bonus turn.
function mpStartTurnTimer() {
  mpStopTurnTimer();
  _mpTimerDeadline = Date.now() + _MP_TURN_MS;
  const timer  = document.getElementById('mpTurnTimer');
  const banner = document.getElementById('mpTurnBanner');
  if (timer)  timer.style.display  = 'block';
  if (banner) banner.style.display = 'block';
  _mpTimerTick();
  _mpTimerInterval = setInterval(_mpTimerTick, 250);
}
window.mpStartTurnTimer = mpStartTurnTimer;

// Throttled tabs may not tick for a long time: re-check the deadline the
// moment the tab becomes visible again.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && _mpTimerInterval) _mpTimerTick();
});

function mpStopTurnTimer() {
  if (_mpTimerInterval) { clearInterval(_mpTimerInterval); _mpTimerInterval = null; }
  const timer  = document.getElementById('mpTurnTimer');
  const banner = document.getElementById('mpTurnBanner');
  if (timer)  timer.style.display  = 'none';
  if (banner) banner.style.display = 'none';
}

function mpShowWaiting(show) {

  const ov = document.getElementById('mpWaitOverlay');

  if (ov) ov.style.display = show ? 'flex' : 'none';

}

// ── Move submission ───────────────────────────────────────────────────────────
// Preferred path: atomic append via the gz_append_move Postgres function
// (see supabase/migration.sql) — the server locks the row, verifies the
// expected move index and appends, so two clients can never clobber each
// other's moves with a full-array PATCH.
// Fallback: the legacy read-modify-write PATCH, used ONLY while the RPC
// doesn't exist yet (404 = migration not applied).
let _mpRpcMissing = false;

async function _mpAppendMove(move) {

  if (!_mpRpcMissing) {

    const rpc = await fetch(`${_SB_URL}/rest/v1/rpc/gz_append_move`, {
      method:'POST', headers:_SB_H,
      body: JSON.stringify({ room_id:_mpRoom, move, expected_index:move.turn })
    });

    if (rpc.ok) return; // atomic append confirmed

    if (rpc.status === 404) {
      console.warn('MP: gz_append_move RPC not found — using legacy read-modify-write');
      _mpRpcMissing = true; // fall through to the legacy path below
    } else {
      throw new Error('RPC gz_append_move ' + rpc.status);
    }

  }

  // Legacy fallback (lossy under concurrent writes) — pre-migration only
  const res = await fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}&select=moves`, { headers:_SB_H });

  const data = await res.json();

  const moves = (data[0]?.moves || []);

  // Idempotency: don't double-write if a retry already succeeded
  if (!moves.find(m => m.player === move.player && m.turn === move.turn)) {

    moves.push(move);

    const patch = await fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}`, {
      method:'PATCH', headers:_SB_H,
      body: JSON.stringify({ moves, updated_at: new Date().toISOString() })
    });

    if (!patch.ok) throw new Error('PATCH ' + patch.status);

  }

}

// Persistent blocking error UI shown when a move can't be saved. A transient
// toast is not enough: an unsaved move means the two clients have silently
// desynced, so the game must not continue until the save is confirmed.
function _mpShowSubmitError(onRetry) {

  let ov = document.getElementById('mpSubmitErrorOverlay');

  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'mpSubmitErrorOverlay';
    ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:rgba(0,0,0,0.88);text-align:center;padding:20px;';
    ov.innerHTML = `
      <div style="font-family:'Orbitron',monospace;font-size:20px;letter-spacing:4px;color:#ff4466;text-shadow:0 0 20px #ff446688;">CONNECTION ERROR</div>
      <div style="font-family:'Courier New',monospace;font-size:13px;color:#cccccc;max-width:420px;line-height:1.6;">Your move could not be saved to the server.<br>Your opponent has NOT seen it yet.</div>
      <button id="mpSubmitRetryBtn" style="font-family:'Orbitron',monospace;font-size:14px;letter-spacing:3px;color:#00ffcc;background:none;border:1px solid #00ffcc88;border-radius:6px;padding:12px 34px;cursor:pointer;">RETRY</button>`;
    document.body.appendChild(ov);
  }

  ov.style.display = 'flex';

  const btn = document.getElementById('mpSubmitRetryBtn');

  if (btn) {
    btn.disabled = false;
    btn.textContent = 'RETRY';
    btn.onclick = () => { btn.disabled = true; btn.textContent = 'RETRYING...'; onRetry(); };
  }

}

function _mpHideSubmitError() {

  const ov = document.getElementById('mpSubmitErrorOverlay');

  if (ov) ov.style.display = 'none';

}

function mpSubmitMove(cardId, r, c, seed, isFlank = false) {

  const move = { player:_mpPlayer, turn:_mpTurnNum, cardId, r, c, seed };

  if (isFlank) move.flank = true;

  // Resolves ONLY once the move is confirmed saved. After 3 failed attempts a
  // full-screen blocking overlay with a RETRY button appears and the promise
  // stays pending, so the caller's .then() flow (turn.js) resumes as soon as
  // a manual retry succeeds — no more silent success after failure.
  return new Promise((resolve) => {

    const runAttempts = async () => {

      for (let attempt = 0; attempt < 3; attempt++) {

        try {

          await _mpAppendMove(move);

          _mpHideSubmitError();

          _mpTurnNum++;

          resolve();

          return; // success

        } catch(e) {

          console.error(`MP: submit attempt ${attempt+1} failed`, e);

          if (attempt < 2) await new Promise(r2 => setTimeout(r2, 800 * (attempt + 1)));

        }

      }

      // All retries failed — block the game until the save is confirmed.
      // The move was already made locally, so pause the forfeit timer.
      mpStopTurnTimer();

      _mpShowSubmitError(runAttempts);

    };

    runAttempts();

  });

}

function mpFindCard(cardId, opponentFaction) {

  // Faction → deck map lives in cards.js (window.GZ_DECKS)
  const allDecks = window.GZ_DECKS || {};

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

  // P2 has mirrored board: receiving P1's move needs NO row flip
  // (P1's row 4 = game row 4 on P2's board = P2's visual TOP with rows [4,3,2,1,0])
  const applyR = (_mpPlayer === 2) ? move.r : (4 - move.r);
  // Column also mirrors for a full 180° board flip
  const applyC = (_mpPlayer === 2) ? move.c : (6 - move.c);

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

      // Start 60s turn timer after flash
      setTimeout(() => { if (!G.gameOver && G.turn !== 'ai') mpStartTurnTimer(); }, 1500);

    }, 620);

  }

}

function mpStartPolling() {

  if (_mpPollInt) clearInterval(_mpPollInt);

  mpStopTurnTimer(); // stop timer when waiting for opponent
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

      addLog('system', '⚠ No opponent activity for 4 min: they may have disconnected');

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

      if (_mpPollErrors === 5)  showToast('Connection unstable: retrying...', '#ffaa22');

      if (_mpPollErrors >= 15) { // ~30s of failures

        clearInterval(_mpPollInt); _mpPollInt = null;

        addLog('system', 'Lost connection to server. Refresh the page to reconnect: the game will resume where it left off.');

        showToast('Connection lost: refresh to resume', '#ff4422');

      }

    }

  }, 2000);

}

// ── RESUME / RECONNECT ────────────────────────────────────────────────────────

// mpApplyMove is for LIVE opponent moves only: it animates, flips turn state
// and assumes the move is the opponent's. Replay instead applies BOTH players'
// moves deterministically onto the fresh board via placeCard.
function mpReplayMove(mv) {

  const isMine = mv.player === _mpPlayer;

  // Coords are stored in the SUBMITTER's frame with P2 pre-mirroring (turn.js):
  //  - my own moves: invert my submit transform (P2 mirrored, P1 raw)
  //  - opponent moves: same transform as live mpApplyMove (P1 mirrors, P2 raw)
  let rr, cc;

  if (isMine) { rr = (_mpPlayer === 2) ? 4 - mv.r : mv.r; cc = (_mpPlayer === 2) ? 6 - mv.c : mv.c; }

  else        { rr = (_mpPlayer === 2) ? mv.r : 4 - mv.r; cc = (_mpPlayer === 2) ? mv.c : 6 - mv.c; }

  let handCard;

  if (isMine) {

    handCard = G.playerHand.find(c => c.id === mv.cardId && !c.used);

  } else {

    const opFaction = _mpPlayer === 1 ? _mpP2Fac : (_mpParams.get('aifaction') || window.aiRaceId);

    handCard = G.aiHand.find(c => c.id === mv.cardId && !c.used);

    if (!handCard) {
      const card = mpFindCard(mv.cardId, opFaction);
      if (card) handCard = {...card, used:false, shieldExpended:false, edgeMod:{n:0,s:0,e:0,w:0}};
    }

  }

  if (!handCard) { console.warn('MP: replay card not found', mv.cardId); return; }

  // Same seeded random as live play so AMBUSH/STONEWALL resolve identically
  if (mv.seed) window._mpSeed = seededRand(mv.seed);

  placeCard(handCard, rr, cc, isMine ? 'player' : 'ai');

}

function mpResumeGame(moves, status) {

  addLog('system', `Reconnected: restoring ${moves.length} move(s)`);

  moves.forEach(mv => mpReplayMove(mv));

  _mpTurnNum = moves.length;

  // A pending flank flag is re-derived by the NEXT placeCard before anything
  // reads it: clear the stale one so state matches live play post-flank.
  G._flankTriggered = null;

  if (typeof renderAll === 'function') renderAll();

  if (status === 'done' || status === 'forfeited') {
    if (!G.gameOver && typeof checkWin === 'function') checkWin();
    return;
  }

  if (G.gameOver) return;

  // Whose turn: the mover repeats on a flank move, otherwise it alternates
  const last = moves[moves.length - 1];

  let myTurn = last.flank === true ? (last.player === _mpPlayer) : (last.player !== _mpPlayer);

  // "No valid moves — opponent continues" isn't recorded in the history
  if (myTurn && typeof hasAnyMoves === 'function' && !hasAnyMoves('player')) myTurn = false;

  _mpMyTurn = myTurn;

  G.turn = myTurn ? 'player' : 'ai';

  renderScoreHeader();

  if (myTurn) {

    setTimeout(() => { if (!G.gameOver && G.turn === 'player') mpStartTurnTimer(); }, 600);

  } else {

    mpStartPolling();

  }

}

// ── MULTIPLAYER HOOKS ─────────────────────────────────────────────────────────

if (_mpRoom && _mpPlayer) {

  // After game init, replace turn flow with MP version

  window.addEventListener('load', async () => {
  loadAudioSettings();

    // Resume support: if the room already has moves (page refresh mid-game),
    // replay the full history onto the fresh board before doing anything else.
    let roomMoves = [], roomStatus = '';

    try {

      const res = await fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}&select=moves,status`, { headers:_SB_H });

      const data = await res.json();

      roomMoves  = (data[0] && data[0].moves)  || [];

      roomStatus = (data[0] && data[0].status) || '';

    } catch(e) { console.warn('MP: resume check failed — starting fresh', e); }

    if (roomMoves.length > 0) { mpResumeGame(roomMoves, roomStatus); return; }

    // Fresh game — P2 waits for P1's first move
    if (_mpPlayer === 2) {
      G.turn = 'ai';
      renderScoreHeader();
      mpStartPolling();
    } else {
      // P1 goes first — start their timer after a short delay
      setTimeout(() => { if (!G.gameOver) mpStartTurnTimer(); }, 1000);
    }

  });

}
