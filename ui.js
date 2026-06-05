// ── GLOBAL MOUSE / KEYBOARD ───────────────────


document.addEventListener('mousemove', e => {


  if (G.selectedCard) {


    updateDragCard(e.clientX, e.clientY);


  }


});





document.addEventListener('keydown', e => {


  if (e.key === 'Escape' && G.selectedCard) {


    G.selectedCard = null;


    hideDragCard();


    document.body.style.cursor = 'default';


    renderGrid();


    renderHand();


  }


});





// Click on a non-valid area (board background) deselects


document.addEventListener('click', e => {


  if (!G.selectedCard) return;


  // Only deselect if target is not a valid cell, not a hand card, not the drag card


  const target = e.target;


  const isValidCell = target.closest && target.closest('.cell.valid');


  const isHandCard  = target.closest && target.closest('.hand-card');


  const isDragCard  = target.closest && target.closest('#dragCard');

  const isPanelUI   = target.closest && (target.closest('#mobileCardPanel') || target.closest('#mobileCardPanelTab'));

  if (!isValidCell && !isHandCard && !isDragCard && !isPanelUI) {


    G.selectedCard = null;


    hideDragCard();


    document.body.style.cursor = 'default';


    renderGrid();


    renderHand();


  }


}, true);


function forfeitGame() {
  if (!_mpRoom) return;
  G.gameOver = true;
  // Mark in DB that this player forfeited
  fetch(`${_SB_URL}/rest/v1/gz_rooms?id=eq.${_mpRoom}`, {
    method: 'PATCH',
    headers: _SB_H,
    body: JSON.stringify({ status: 'forfeited' })
  }).catch(() => {});
  // Show overlay with opponent winning
  checkWin();
}

function showForfeitBtn(show) {
  const btn = document.getElementById('forfeitBtn');
  if (btn) btn.style.display = show ? 'block' : 'none';
}

function toggleMenu() {


  const m = document.getElementById('gameMenu');


  const b = document.getElementById('menuBackdrop');


  const open = m && m.style.display !== 'none';


  if (m) m.style.display = open ? 'none' : 'block';


  if (b) b.style.display = open ? 'none' : 'block';


}

function closeMenu() {


  const m = document.getElementById('gameMenu');


  const b = document.getElementById('menuBackdrop');


  if (m) m.style.display = 'none';


  if (b) b.style.display = 'none';

  // Also close audio sub-panel
  _closeAudioPanel();

}

let _audioPanelOpen = false;
function _closeAudioPanel() {
  const ap = document.getElementById('audioPanel');
  const btn = document.getElementById('audioToggleBtn');
  if (!ap) return;
  if (window.innerWidth > 480) {
    ap.style.opacity = '0';
    ap.style.transform = 'translateX(8px)';
    setTimeout(() => { if (!_audioPanelOpen) ap.style.display = 'none'; }, 180);
  } else {
    ap.style.display = 'none';
  }
  _audioPanelOpen = false;
  if (btn) btn.querySelector('span:last-child').textContent = '◀';
}

function toggleAudioPanel() {
  const ap = document.getElementById('audioPanel');
  const btn = document.getElementById('audioToggleBtn');
  if (!ap) return;
  if (_audioPanelOpen) {
    _closeAudioPanel();
  } else {
    _audioPanelOpen = true;
    ap.style.display = 'block';
    if (window.innerWidth > 480) {
      requestAnimationFrame(() => {
        ap.style.opacity = '1';
        ap.style.transform = 'translateX(0)';
      });
    }
    if (btn) btn.querySelector('span:last-child').textContent = '▶';
  }
}

function updateMuteLabel() {


  const btn = document.getElementById('muteMenuBtn');


  if (btn) btn.textContent = musicMuted ? '🔇 UNMUTE' : '🔊 MUTE';


}

function goToMenu() {


  G.gameOver = true;


  window.location.href = 'index.html?screen=deck';


}

function goToMenuNow() { closeMenu(); goToMenu(); }

function confirmDeckNav() {


  closeMenu();


  const m = document.createElement('div');


  m.id = 'restartConfirm';


  m.style.cssText = `position:fixed;inset:0;z-index:150000;background:#000000bb;


    display:flex;align-items:center;justify-content:center;font-family:'Courier New',monospace;`;


  m.innerHTML = `


    <div style="background:#0a0a18;border:1px solid #8855ffaa;border-radius:10px;


      padding:28px 36px;text-align:center;box-shadow:0 0 48px #8855ff22;">


      <div style="font-family:'Orbitron',monospace;font-size:14px;letter-spacing:3px;color:#fff;margin-bottom:6px;">ABANDON BATTLE?</div>


      <div style="font-size:10px;color:#444;letter-spacing:2px;margin-bottom:22px;">Progress will be lost</div>


      <div style="display:flex;gap:12px;justify-content:center;">


        <button onclick="document.getElementById('restartConfirm').remove();goToMenu();"


          style="background:#1a0a2e;border:1px solid #6644aa;color:#aa88ff;


          font-family:inherit;font-size:11px;letter-spacing:2px;padding:9px 22px;


          cursor:pointer;border-radius:4px;">LEAVE</button>


        <button onclick="document.getElementById('restartConfirm').remove();"


          style="background:#0a1a14;border:1px solid #226644;color:#00ffcc;


          font-family:inherit;font-size:11px;letter-spacing:2px;padding:9px 22px;


          cursor:pointer;border-radius:4px;">STAY</button>


      </div>


    </div>`;


  document.body.appendChild(m);


}

function confirmRestart() {


  closeMenu();


  const m = document.createElement('div');


  m.id = 'restartConfirm';


  m.style.cssText = `position:fixed;inset:0;z-index:150000;background:#000000bb;


    display:flex;align-items:center;justify-content:center;font-family:'Courier New',monospace;`;


  m.innerHTML = `


    <div style="background:#0a0a18;border:1px solid #8855ffaa;border-radius:10px;


      padding:28px 36px;text-align:center;box-shadow:0 0 48px #8855ff22;">


      <div style="font-family:'Orbitron',monospace;font-size:14px;letter-spacing:3px;


        color:#fff;margin-bottom:6px;">RESTART GAME?</div>


      <div style="font-size:10px;color:#444;letter-spacing:2px;margin-bottom:22px;">


        Current battle will be lost</div>


      <div style="display:flex;gap:12px;justify-content:center;">


        <button onclick="document.getElementById('restartConfirm').remove();initGame();"


          style="background:#0a1a14;border:1px solid #226644;color:#00ffcc;


          font-family:inherit;font-size:11px;letter-spacing:2px;padding:9px 22px;


          cursor:pointer;border-radius:4px;transition:all 0.2s;"


          onmouseenter="this.style.background='#0e2a1e'"


          onmouseleave="this.style.background='#0a1a14'">CONFIRM</button>


        <button onclick="document.getElementById('restartConfirm').remove();"


          style="background:#1a0a2e;border:1px solid #443366;color:#8866aa;


          font-family:inherit;font-size:11px;letter-spacing:2px;padding:9px 22px;


          cursor:pointer;border-radius:4px;transition:all 0.2s;"


          onmouseenter="this.style.background='#2a1040'"


          onmouseleave="this.style.background='#1a0a2e'">CANCEL</button>


      </div>


    </div>`;


  document.body.appendChild(m);


}

function toggleGameMusic() {


  const audio = document.getElementById('bgTrack');


  const btn   = document.getElementById('gameMuteBtn');


  musicMuted = !musicMuted;


  audio.muted = musicMuted;


  if (btn) btn.textContent = musicMuted ? '🔇' : '🔊';


  if (!musicStarted && !musicMuted) startGameMusic();
  try { localStorage.setItem('gz_musicMuted', musicMuted ? '1' : '0'); } catch(e){}


}

function showRestartModal() {


  const m = document.createElement('div');


  m.id = 'restartModal';


  m.style.cssText = `


    position:fixed;inset:0;z-index:1000;


    background:#000000cc;backdrop-filter:blur(4px);


    display:flex;align-items:center;justify-content:center;


  `;


  m.innerHTML = `


    <div style="


      background:#07070fee;border:1px solid #8855ff55;border-radius:8px;


      padding:36px 48px;text-align:center;font-family:'Courier New',monospace;


      box-shadow:0 0 60px #8855ff33;


    ">


      <div style="font-family:'Orbitron',monospace;font-size:18px;letter-spacing:4px;color:#fff;margin-bottom:8px;">RESTART GAME?</div>


      <div style="font-size:11px;color:#555;letter-spacing:2px;margin-bottom:28px;">Current battle will be lost</div>


      <div style="display:flex;gap:16px;justify-content:center;">


        <button onclick="document.getElementById('restartModal').remove();initGame();" style="


          background:transparent;border:1px solid #00ffcc;color:#00ffcc;


          font-family:inherit;font-size:10px;letter-spacing:3px;


          padding:10px 28px;cursor:pointer;border-radius:3px;


          transition:all 0.2s;


        " onmouseenter="this.style.background='#00ffcc22'" onmouseleave="this.style.background='transparent'">


          ↺ NEW GAME


        </button>


        <button onclick="document.getElementById('restartModal').remove();" style="


          background:transparent;border:1px solid #443366;color:#7755aa;


          font-family:inherit;font-size:10px;letter-spacing:3px;


          padding:10px 28px;cursor:pointer;border-radius:3px;


          transition:all 0.2s;


        " onmouseenter="this.style.borderColor='#8855ff';this.style.color='#aa88ff'" onmouseleave="this.style.borderColor='#443366';this.style.color='#7755aa'">


          CANCEL


        </button>


      </div>


    </div>


  `;


  document.body.appendChild(m);


  // Also close on backdrop click


  m.addEventListener('click', e => { if (e.target === m) m.remove(); });


}

// Global button click sound: plays for any button not already handled


document.addEventListener('click', ev => {


  const btn = ev.target.closest('button');


  if (btn) {


    const sfx = document.getElementById('selectSfx');


    if (sfx && !_sfxMuted) { sfx.currentTime = 0; sfx.volume = 0.4 * _sfxVol; sfx.play().catch(()=>{}); }


  }


}, true);

// F5 / Ctrl+R → show options modal instead of hard refresh


document.addEventListener('keydown', e => {


  if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {


    e.preventDefault();


    if (document.getElementById('restartConfirm')) return; // already open


    const m = document.createElement('div');


    m.id = 'restartConfirm';


    m.style.cssText = `position:fixed;inset:0;z-index:150000;background:#000000bb;


      display:flex;align-items:center;justify-content:center;font-family:'Courier New',monospace;`;


    m.innerHTML = `


      <div style="background:#0a0a18;border:1px solid #8855ffaa;border-radius:10px;


        padding:28px 36px;text-align:center;box-shadow:0 0 48px #8855ff22;min-width:280px;">


        <div style="font-family:'Orbitron',monospace;font-size:14px;letter-spacing:3px;color:#fff;margin-bottom:6px;">PAUSE</div>


        <div style="font-size:10px;color:#444;letter-spacing:2px;margin-bottom:22px;">WHAT WOULD YOU LIKE TO DO?</div>


        <div style="display:flex;flex-direction:column;gap:10px;">


          <button onclick="document.getElementById('restartConfirm').remove();initGame();"


            style="background:#0a1a14;border:1px solid #226644;color:#00ffcc;


            font-family:inherit;font-size:11px;letter-spacing:2px;padding:10px;


            cursor:pointer;border-radius:4px;width:100%;">↺ RESTART BATTLE</button>


          <button onclick="document.getElementById('restartConfirm').remove();goToMenu();"


            style="background:#1a0a2e;border:1px solid #6644aa;color:#aa88ff;


            font-family:inherit;font-size:11px;letter-spacing:2px;padding:10px;


            cursor:pointer;border-radius:4px;width:100%;">← BACK TO DECK SELECT</button>


          <button onclick="document.getElementById('restartConfirm').remove();"


            style="background:transparent;border:1px solid #222233;color:#444;


            font-family:inherit;font-size:11px;letter-spacing:2px;padding:10px;


            cursor:pointer;border-radius:4px;width:100%;">CANCEL</button>


        </div>


      </div>`;


    document.body.appendChild(m);


  }


});
