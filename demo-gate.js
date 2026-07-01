// ── SUPPORT ASK ───────────────────────────────────────────────────────────────
// Channel-aware demo gate. The soft support ask only appears on the itch.io
// browser demo (channel 'itch-demo'). Every other channel — web (live Vercel
// build), steam, itch desktop, dev — plays free and unlimited with no gate.
//
// Channel resolution priority:
//   1. window.gzDesktop.channel  — Electron preload ('steam' | 'itch' | 'dev')
//   2. window.GZ_CHANNEL         — channel.js global (web builds)
//   3. 'web'                     — safe default when neither is present

const DEMO_MOVE_LIMIT = 10;

let _demoMovesUsed = 0;
let _demoAsked = false; // show once per session only

function demoGetChannel() {
  try {
    if (window.gzDesktop && typeof window.gzDesktop.channel === 'string' && window.gzDesktop.channel) {
      return window.gzDesktop.channel;
    }
  } catch (e) { /* preload absent or blocked — fall through */ }
  if (typeof window.GZ_CHANNEL === 'string' && window.GZ_CHANNEL) return window.GZ_CHANNEL;
  return 'web';
}

function demoTrackMove(owner) {
  if (demoGetChannel() !== 'itch-demo') return;
  if (owner !== 'player' || _demoAsked) return;
  _demoMovesUsed++;
  if (_demoMovesUsed >= DEMO_MOVE_LIMIT) {
    _demoAsked = true;
    setTimeout(showSupportAsk, 600);
  }
}

function showSupportAsk() {
  if (document.getElementById('supportAskOverlay')) return;

  const factionColor = window.playerFactionColor || '#8855ff';
  const avatarSrc    = window.playerAvatarImg    || '';
  const factionName  = window.playerFactionName  || 'GALACTIC ZERO';

  // The itch.io support link must NEVER appear in the Steam build
  // (external store links violate Steam distribution rules).
  const showSupportLink = demoGetChannel() !== 'steam';

  const el = document.createElement('div');
  el.id = 'supportAskOverlay';
  el.style.cssText = [
    'position:fixed;inset:0;z-index:999999',
    'display:flex;align-items:center;justify-content:center',
    'background:#000000cc;backdrop-filter:blur(10px)',
    'font-family:"Share Tech Mono","Courier New",monospace',
  ].join(';');

  el.innerHTML = `
    <div style="
      background:linear-gradient(160deg,#08061a,#04030e);
      border:1px solid ${factionColor}55;
      border-radius:16px;
      padding:40px 44px 36px;
      max-width:420px;width:90%;
      text-align:center;
      box-shadow:0 0 60px ${factionColor}22,0 32px 80px #000c;
      position:relative;
    ">
      <!-- Corner accents -->
      <div style="position:absolute;top:12px;left:12px;width:18px;height:18px;border-top:1px solid ${factionColor}88;border-left:1px solid ${factionColor}88;"></div>
      <div style="position:absolute;top:12px;right:12px;width:18px;height:18px;border-top:1px solid ${factionColor}88;border-right:1px solid ${factionColor}88;"></div>
      <div style="position:absolute;bottom:12px;left:12px;width:18px;height:18px;border-bottom:1px solid ${factionColor}88;border-left:1px solid ${factionColor}88;"></div>
      <div style="position:absolute;bottom:12px;right:12px;width:18px;height:18px;border-bottom:1px solid ${factionColor}88;border-right:1px solid ${factionColor}88;"></div>

      <!-- Avatar -->
      ${avatarSrc ? `<img src="${avatarSrc}" style="width:72px;height:72px;border-radius:50%;border:2px solid ${factionColor};object-fit:cover;object-position:top;box-shadow:0 0 24px ${factionColor}66;margin-bottom:18px;">` : ''}

      <!-- Heading -->
      <div style="font-family:'Orbitron',monospace;font-size:11px;letter-spacing:6px;color:${factionColor};margin-bottom:8px;">ENJOYING THE GAME?</div>
      <div style="font-family:'Orbitron',monospace;font-size:26px;font-weight:900;letter-spacing:4px;color:#fff;text-shadow:0 0 30px ${factionColor}77;margin-bottom:20px;line-height:1.2;">GALACTIC<br>ZERO</div>

      <!-- Message -->
      <div style="font-size:13px;letter-spacing:0.3px;color:#ffffffcc;line-height:1.85;margin-bottom:28px;">
        You've played <span style="color:${factionColor};font-weight:bold;">${DEMO_MOVE_LIMIT} moves</span> as ${factionName}.<br>
        If you're having fun, a $1 donation helps keep<br>this game alive and growing.
      </div>

      <!-- Support button -->
      ${showSupportLink ? `<a href="https://mhansen003.itch.io/galactic-zero" target="_blank" style="
        display:block;
        font-family:'Orbitron',monospace;font-size:13px;letter-spacing:4px;
        padding:16px 0;border-radius:6px;margin-bottom:12px;
        border:2px solid ${factionColor};color:${factionColor};
        background:${factionColor}18;text-decoration:none;
        box-shadow:0 0 24px ${factionColor}44;
        transition:all 0.25s;
      "
      onmouseenter="this.style.background='${factionColor}33';this.style.boxShadow='0 0 40px ${factionColor}88'"
      onmouseleave="this.style.background='${factionColor}18';this.style.boxShadow='0 0 24px ${factionColor}44'">
        SUPPORT &mdash; $1
      </a>` : ''}

      <!-- Keep playing button -->
      <button onclick="document.getElementById('supportAskOverlay').remove()" style="
        display:block;width:100%;
        font-family:inherit;font-size:11px;letter-spacing:3px;
        padding:12px 0;border-radius:6px;
        border:1px solid #ffffff22;color:#ffffff88;
        background:transparent;cursor:pointer;
        transition:all 0.2s;
      "
      onmouseenter="this.style.borderColor='#ffffff55';this.style.color='#ffffffcc'"
      onmouseleave="this.style.borderColor='#ffffff22';this.style.color='#ffffff88'">
        KEEP PLAYING
      </button>
    </div>`;

  document.body.appendChild(el);
}
