// ── GALACTIC ZERO — card-interaction visual FX overlay layer ─────────────────
// Effects are short, black-background video sprites (Veo-generated) played with
// mix-blend-mode:screen so the black vanishes and only the neon energy shows —
// no alpha channel needed. Clips are compact (~40KB, ~1.4s) and lazy-loaded on
// first use. This is the shared foundation for every interaction effect; new
// clips are added to the FX registry and fired via window.gzFx(...).
(function () {
  const FX = {
    // id : { src, ms (lifetime), span ('h'|'v'|'cell'), pad (overshoot fraction) }
    'battle-win-h': { src: 'assets/fx/battle-win-h.mp4', ms: 1400, span: 'h', pad: 0.55 },
    'battle-win-v': { src: 'assets/fx/battle-win-v.mp4', ms: 1400, span: 'v', pad: 0.55 },
    'battle-loss':  { src: 'assets/fx/battle-loss.mp4',  ms: 1400, span: 'cell', pad: 0.5, noTint: true },
  };

  // Preload registered clips once (cheap: browser caches the file) after first idle.
  let _preloaded = false;
  function _preload() {
    if (_preloaded) return; _preloaded = true;
    Object.values(FX).forEach(def => { try { const l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'video'; l.href = def.src; document.head.appendChild(l); } catch (_) {} });
  }

  // gzFx(id, r1, c1, r2, c2, owner) — play an effect over one cell, or over the
  // union of two cells (directional effects). owner tints the clip (player=cyan
  // as authored, ai=magenta via hue-rotate).
  window.gzFx = function (id, r1, c1, r2, c2, owner) {
    try {
      const def = FX[id];
      if (!def) return;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (typeof gzCellRect !== 'function') return;
      const grid = document.getElementById('grid');
      if (!grid) return;
      const a = gzCellRect(r1, c1);
      if (!a) return;
      const b = (r2 != null && c2 != null) ? gzCellRect(r2, c2) : null;

      // Union rect over the involved cells (grid-relative coords, same space as showFlash).
      let L = a.left, T = a.top, R = a.left + a.width, Bt = a.top + a.height;
      if (b) { L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.left + b.width); Bt = Math.max(Bt, b.top + b.height); }
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
        `position:absolute;left:${(L - padX).toFixed(1)}px;top:${(T - padY).toFixed(1)}px;` +
        `width:${(w + padX * 2).toFixed(1)}px;height:${(h + padY * 2).toFixed(1)}px;` +
        `z-index:60;pointer-events:none;mix-blend-mode:screen;object-fit:contain;` + tint + flip;

      grid.appendChild(v);
      const kill = () => { try { v.pause(); } catch (_) {} v.remove(); };
      v.addEventListener('ended', kill);
      v.play().catch(() => {});
      setTimeout(kill, (def.ms || 1400) + 600); // safety net if 'ended' never fires
    } catch (_) {}
  };

  if (document.readyState !== 'loading') _preload();
  else document.addEventListener('DOMContentLoaded', _preload);
})();
