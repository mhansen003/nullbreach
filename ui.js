// ── GLOBAL MOUSE / KEYBOARD ───────────────────

document.addEventListener('mousemove', e => {

  if (G.selectedCard) {

    updateDragCard(e.clientX, e.clientY);

  }

});

// ── MODAL REGISTRY ─────────────────────────────
// Any modal opened through gzModalOpen gets document-level Escape handling
// (topmost closes first) and focus restore. game.html / leaderboard.js owners:
// wire your modals through window.gzModalOpen(el, closeFn) / window.gzModalClose().

window._gzModalStack = window._gzModalStack || [];

window.gzModalOpen = function(el, closeFn) {
  window._gzModalStack.push({ el, closeFn, prevFocus: document.activeElement });
  const focusable = el.querySelector('button, [href], input, select, textarea, [tabindex]');
  if (focusable) { try { focusable.focus(); } catch (e) {} }
};

window.gzModalClose = function(el) {
  const stack = window._gzModalStack;
  const idx = el ? stack.findIndex(m => m.el === el) : stack.length - 1;
  if (idx < 0) return false;
  const m = stack.splice(idx, 1)[0];
  try { if (m.closeFn) m.closeFn(); else m.el.remove(); } catch (e) {}
  if (m.prevFocus && document.contains(m.prevFocus)) { try { m.prevFocus.focus(); } catch (e) {} }
  return true;
};

// ── ESCAPE: close topmost modal → deselect card → toggle pause menu ─────────
// (F5 / Ctrl+R are no longer hijacked: the browser refreshes normally.)

document.addEventListener('keydown', e => {

  if (e.key !== 'Escape') return;

  // 1) A registered modal is open: close the topmost one
  if (window._gzModalStack.length > 0) { e.preventDefault(); gzModalClose(); return; }

  // 2) The in-game menu is open: close it
  const gm = document.getElementById('gameMenu');
  if (gm && gm.style.display && gm.style.display !== 'none') { closeMenu(); return; }

  // 3) A card is selected: deselect
  if (G.selectedCard) {
    G.selectedCard = null;
    hideDragCard();
    document.body.style.cursor = 'default';
    renderGrid();
    renderHand();
    return;
  }

  // 4) Nothing open: toggle the pause menu
  if (typeof G !== 'undefined' && !G.gameOver) showPauseModal();

});

// Click on a non-valid area (board background) deselects.
// Bubble phase + battle-chip early-return so chip taps never eat the selection.

document.addEventListener('click', e => {

  if (!G.selectedCard) return;

  const target = e.target;

  // Battle indicator chips handle their own clicks — never deselect from them
  if (target.closest && (target.closest('.bti') || target.closest('.bchip-active'))) return;

  // Only deselect if target is not a valid cell, not a hand card, not the drag card

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

});

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
    } else {
      ap.style.opacity = '1';
      ap.style.transform = 'none';
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

// ── SHARED CONFIRM MODAL ───────────────────────
// One helper for confirmDeckNav / confirmRestart / the pause menu.
// Buttons: { label, theme: 'confirm'|'danger'|'muted', onClick }.

function _gzConfirmModal(opts) {

  if (document.getElementById('gzConfirm')) return;

  const m = document.createElement('div');

  m.id = 'gzConfirm';

  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.setAttribute('aria-label', opts.title);

  m.style.cssText = `position:fixed;inset:0;z-index:150000;background:#000000bb;
    display:flex;align-items:center;justify-content:center;font-family:'Courier New',monospace;`;

  const box = document.createElement('div');

  box.style.cssText = `background:#0a0a18;border:1px solid #8855ffaa;border-radius:10px;
    padding:28px 36px;text-align:center;box-shadow:0 0 48px #8855ff22;min-width:280px;`;

  box.innerHTML = `
    <div style="font-family:'Orbitron',monospace;font-size:14px;letter-spacing:3px;color:#fff;margin-bottom:6px;">${opts.title}</div>
    <div style="font-size:10px;color:#555;letter-spacing:2px;margin-bottom:22px;">${opts.subtitle || ''}</div>`;

  const THEMES = {
    confirm: 'background:#0a1a14;border:1px solid #226644;color:#00ffcc;',
    danger:  'background:#1a0a2e;border:1px solid #6644aa;color:#aa88ff;',
    muted:   'background:transparent;border:1px solid #222233;color:#666;',
  };

  const row = document.createElement('div');

  row.style.cssText = opts.stack
    ? 'display:flex;flex-direction:column;gap:10px;'
    : 'display:flex;gap:12px;justify-content:center;';

  (opts.buttons || []).forEach(bd => {
    const b = document.createElement('button');
    b.textContent = bd.label;
    b.style.cssText = (THEMES[bd.theme] || THEMES.muted) +
      `font-family:inherit;font-size:11px;letter-spacing:2px;padding:9px 22px;
       cursor:pointer;border-radius:4px;` + (opts.stack ? 'width:100%;' : '');
    b.onclick = () => { gzModalClose(m); if (bd.onClick) bd.onClick(); };
    row.appendChild(b);
  });

  box.appendChild(row);

  m.appendChild(box);

  // Backdrop click closes (acts like cancel)
  m.addEventListener('click', e => { if (e.target === m) gzModalClose(m); });

  document.body.appendChild(m);

  gzModalOpen(m, () => m.remove());

}

function confirmDeckNav() {

  closeMenu();

  _gzConfirmModal({
    title: 'ABANDON BATTLE?',
    subtitle: 'Progress will be lost',
    buttons: [
      { label: 'LEAVE', theme: 'danger', onClick: goToMenu },
      { label: 'STAY',  theme: 'confirm' },
    ],
  });

}

function confirmRestart() {

  closeMenu();

  _gzConfirmModal({
    title: 'RESTART GAME?',
    subtitle: 'Current battle will be lost',
    buttons: [
      { label: 'CONFIRM', theme: 'confirm', onClick: () => initGame() },
      { label: 'CANCEL',  theme: 'danger' },
    ],
  });

}

function showPauseModal() {

  _gzConfirmModal({
    title: 'PAUSE',
    subtitle: 'WHAT WOULD YOU LIKE TO DO?',
    stack: true,
    buttons: [
      { label: '↺ RESTART BATTLE',       theme: 'confirm', onClick: () => initGame() },
      { label: '← BACK TO DECK SELECT',  theme: 'danger',  onClick: goToMenu },
      { label: 'RESUME',                 theme: 'muted' },
    ],
  });

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

// Global button click sound: plays for any button not already handled

document.addEventListener('click', ev => {

  const btn = ev.target.closest('button');

  if (btn) {

    const sfx = document.getElementById('selectSfx');

    if (sfx && !_sfxMuted) { sfx.currentTime = 0; sfx.volume = 0.4 * _sfxVol; sfx.play().catch(()=>{}); }

  }

}, true);

// NOTE: F5 / Ctrl+R are intentionally NOT intercepted anymore — the pause
// menu now lives on Escape (see the keydown handler above).

// ── Task 109: re-render when the 480px mobile/desktop boundary is crossed ────
// Debounced 250ms. Only re-renders when a game is active (G.grid) and never
// mid-placement-animation (G._placeInFlight) — deferred with a bounded retry.

(function() {

  let _lastMobile = window.innerWidth <= 480;

  let _resizeTimer = null;

  function _rerender(retries) {

    if (typeof G === 'undefined' || !G || !G.grid) return;

    if (G._placeInFlight) {
      if (retries > 0) setTimeout(() => _rerender(retries - 1), 300);
      return;
    }

    renderAll();

  }

  function _onBoundaryCheck(force) {

    const nowMobile = window.innerWidth <= 480;

    if (force || nowMobile !== _lastMobile) {
      _lastMobile = nowMobile;
      _rerender(10);
    }

  }

  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => _onBoundaryCheck(false), 250);
  });

  window.addEventListener('orientationchange', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => _onBoundaryCheck(true), 250);
  });

})();
