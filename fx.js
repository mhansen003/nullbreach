// ── GALACTIC ZERO — card-interaction visual FX overlay layer ─────────────────
// Effects are short, black-background video sprites (Veo-generated) played with
// mix-blend-mode:screen so the black vanishes and only the neon energy shows —
// no alpha channel needed. Clips are compact (~40KB, ~1.4s) and lazy-loaded on
// first use. This is the shared foundation for every interaction effect; new
// clips are added to the FX registry and fired via window.gzFx(...).
(function () {
  const FX = {
    // id : { src, ms (lifetime), span ('h'|'v'|'cell'), pad (overshoot fraction), sfx }
    'battle-win-h': { src: 'assets/fx/battle-win-h.mp4', ms: 1400, span: 'h', pad: 0.55, sfx: 'assets/fx/win.mp3' },
    'battle-win-v': { src: 'assets/fx/battle-win-v.mp4', ms: 1400, span: 'v', pad: 0.55, sfx: 'assets/fx/win.mp3' },
    'battle-loss':  { src: 'assets/fx/battle-loss.mp4',  ms: 1400, span: 'cell', pad: 0.5, noTint: true },
  };

  // Preload registered clips + sounds once (cheap: browser caches the file).
  let _preloaded = false;
  const _sfxCache = {};
  function _preload() {
    if (_preloaded) return; _preloaded = true;
    Object.values(FX).forEach(def => {
      try { const l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'video'; l.href = def.src; document.head.appendChild(l); } catch (_) {}
      if (def.sfx && !_sfxCache[def.sfx]) { try { const a = new Audio(def.sfx); a.preload = 'auto'; _sfxCache[def.sfx] = a; } catch (_) {} }
    });
  }

  // Play an effect sound, honoring the game's SFX mute/volume (audio.js globals).
  function _playSfx(src) {
    try {
      if (typeof _sfxMuted !== 'undefined' && _sfxMuted) return;
      const vol = (typeof _sfxVol !== 'undefined' ? _sfxVol : 1);
      const base = _sfxCache[src] || new Audio(src);
      const a = base.cloneNode ? base.cloneNode(true) : new Audio(src);  // fresh node so rapid wins can overlap
      a.volume = Math.max(0, Math.min(1, 0.7 * vol));
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch (_) {}
  }

  // Live viewport rect of a board cell (survives grid re-renders; MP-P2 safe
  // because it reads the actual on-screen position).
  function _cellVRect(r, c) {
    const el = document.querySelector(`#grid .cell[data-r="${r}"][data-c="${c}"]`);
    return el ? el.getBoundingClientRect() : null;
  }

  // gzFx(id, r1, c1, r2, c2, owner) — play an effect over one cell, or over the
  // union of two cells (directional effects). owner tints the clip (player=cyan
  // as authored, ai=magenta via hue-rotate).
  //
  // IMPORTANT: the video is fixed-positioned on <body>, NOT appended to #grid.
  // placeCard() calls renderAll() (which rebuilds #grid) on the same synchronous
  // tick right after firing an effect, so anything parented to #grid is wiped
  // instantly. document.body is never re-rendered, so the effect persists for
  // its full duration. Viewport coords (getBoundingClientRect + position:fixed)
  // keep it aligned to the cell regardless of grid rebuilds or the MP-P2 flip.
  window.gzFx = function (id, r1, c1, r2, c2, owner) {
    try {
      const def = FX[id];
      if (!def) return;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const a = _cellVRect(r1, c1);
      if (!a) return;
      const b = (r2 != null && c2 != null) ? _cellVRect(r2, c2) : null;

      // Union rect over the involved cells (viewport coords).
      let L = a.left, T = a.top, R = a.right, Bt = a.bottom;
      if (b) { L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); Bt = Math.max(Bt, b.bottom); }
      const w = R - L, h = Bt - T;
      const padX = w * (def.pad || 0.4), padY = h * (def.pad || 0.4);

      const v = document.createElement('video');
      v.src = def.src;
      v.muted = true; v.autoplay = true; v.loop = false;
      v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
      v.className = 'gz-fx';

      let tint = '';
      if (owner === 'ai' && !def.noTint) tint = 'filter:hue-rotate(150deg) saturate(1.2);'; // cyan → magenta
      // Directional clips face a default way; flip when the winner sits on the far side.
      let flip = '';
      if (def.span === 'h' && b && a.left > b.left) flip = 'transform:scaleX(-1);';        // winner to the right
      else if (def.span === 'v' && b && a.top > b.top) flip = 'transform:scaleY(-1);';     // winner below

      v.style.cssText =
        `position:fixed;left:${(L - padX).toFixed(1)}px;top:${(T - padY).toFixed(1)}px;` +
        `width:${(w + padX * 2).toFixed(1)}px;height:${(h + padY * 2).toFixed(1)}px;` +
        `z-index:9000;pointer-events:none;mix-blend-mode:screen;object-fit:contain;` + tint + flip;

      document.body.appendChild(v);
      if (def.sfx) _playSfx(def.sfx);              // win cue (respects SFX mute/volume)
      const kill = () => { try { v.pause(); } catch (_) {} v.remove(); };
      v.addEventListener('ended', kill);
      v.play().catch(() => {});
      setTimeout(kill, (def.ms || 1400) + 600); // safety net if 'ended' never fires
    } catch (_) {}
  };

  if (document.readyState !== 'loading') _preload();
  else document.addEventListener('DOMContentLoaded', _preload);
})();
