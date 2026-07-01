// ── preview.js — shared battle-outcome preview API ──────────────────────────
// Single source of truth for "what happens if I place this card here" badges.
// Loaded after battle.js / abilities-data.js (game.html). Desktop hover
// preview (render-grid.js) and mobile tap preview (turn.js) both delegate here.
//
// window.gzPreviewBattle(card, r, c)
//   Simulates placing `card` (the local player's card — same owner assumption
//   as the legacy previews) at (r, c) WITHOUT mutating any game state.
//   Returns { n:{result,mine,theirs}, s:{...}, e:{...}, w:{...} } where:
//     result : 'win' | 'lose' | 'tie' | null
//              (null = no enemy that direction, OR the enemy edge is
//               cloak-hidden — distinguishable via theirs === '?')
//     mine   : my effective battle value on that edge (number)
//     theirs : enemy effective value (number), '?' when cloak-hidden per-edge,
//              or null when there is no adjacent enemy in that direction.
//   Includes: LASER FOCUS edge collapse the card would get on placement,
//   retroactive COMMANDER buff from adjacent friendly commanders, my
//   INTIMIDATE hit on each adjacent enemy, enemy INTIMIDATE reaction (-1 on my
//   highest edge per adjacent enemy intimidator), the aggressive-difficulty
//   AI x1.1 buff (PvE only, symmetric rule — see gzAiBuffMult in battle.js),
//   PIERCE on both sides (my pierce: tie->win; enemy pierce: tie->lose), and
//   the fixed tie semantics (pure tie = harmless).
//   Note on _silenced: silenced cards still fight battles at full strength
//   (silence only zeroes VP contribution) — preview mirrors the engine.
//
// window.gzRenderPreviewBadges(result)
//   Builds the same badge markup the desktop preview uses (render-grid.js) and
//   returns a DocumentFragment. One badge per direction that has an adjacent
//   enemy; each badge carries data-bpv="1" and data-dir="n|s|e|w" so the
//   renderer can append it to the correct adjacent cell. Badges are already
//   positioned on the FACING edge of the enemy cell (absolute inset styles).

(function () {

  const _DIRS = [
    { k: 'n', dr: -1, dc: 0, myE: 'n', theirE: 's' },
    { k: 'w', dr: 0, dc: -1, myE: 'w', theirE: 'e' },
    { k: 'e', dr: 0, dc: 1, myE: 'e', theirE: 'w' },
    { k: 's', dr: 1, dc: 0, myE: 's', theirE: 'n' },
  ];
  const _EDGES = ['n', 's', 'e', 'w'];

  // -1 from the highest effective edge of `eff`, replicating the tie-break
  // order used by INTIMIDATE in abilities.js (n, then s, then e, then w).
  function _hitHighest(eff) {
    const max = Math.max(eff.n, eff.s, eff.e, eff.w);
    if (eff.n === max) { eff.n -= 1; return; }
    if (eff.s === max) { eff.s -= 1; return; }
    if (eff.e === max) { eff.e -= 1; return; }
    eff.w -= 1;
  }

  window.gzPreviewBattle = function (card, r, c) {
    // Previews always run for the local acting player — same as the legacy
    // desktop/mobile previews (enemy cells = owner 'ai', hazards excluded).
    const out = {
      n: { result: null, mine: 0, theirs: null },
      s: { result: null, mine: 0, theirs: null },
      e: { result: null, mine: 0, theirs: null },
      w: { result: null, mine: 0, theirs: null },
    };
    if (!card || typeof G === 'undefined' || !G.grid) return out;

    // ── 1) Simulate the edgeMod my card would have after placement ────────
    const emod = {
      n: card.edgeMod?.n || 0, s: card.edgeMod?.s || 0,
      e: card.edgeMod?.e || 0, w: card.edgeMod?.w || 0,
    };

    // Retroactive COMMANDER buff from adjacent friendly commanders (+2 all, stacks)
    _DIRS.forEach(({ dr, dc }) => {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) return;
      const nb = G.grid[nr][nc];
      if (nb.card && nb.owner === 'player' && nb.card.ability === 'commander')
        _EDGES.forEach(d => { emod[d] += 2; });
    });

    // LASER FOCUS collapse (additive, matching the fixed += semantics)
    if (card.ability === 'laser_focus') {
      const _p2 = typeof _mpPlayer !== 'undefined' && _mpPlayer === 2;
      const fwd = _p2 ? 's' : 'n'; // player forward edge (P2 attacks toward row 4)
      const total = card.edges.n + card.edges.s + card.edges.e + card.edges.w;
      _EDGES.forEach(d => { emod[d] += (d === fwd ? total - card.edges[d] : -card.edges[d]); });
    }

    // Enemy INTIMIDATE reaction: each adjacent enemy intimidator strips 1 from
    // my (then-)highest edge, applied sequentially in grid scan order (N,W,E,S
    // neighbors = row-major), matching fireReactiveAbilities.
    const myEff = {
      n: card.edges.n + emod.n, s: card.edges.s + emod.s,
      e: card.edges.e + emod.e, w: card.edges.w + emod.w,
    };
    _DIRS.forEach(({ dr, dc }) => {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) return;
      const nb = G.grid[nr][nc];
      if (nb.card && nb.owner === 'ai' && nb.card.ability === 'intimidate')
        _hitHighest(myEff);
    });

    // ── 2) Resolve each adjacent enemy battle with engine math ────────────
    const pMe = card.ability === 'pierce';
    const buffFn = typeof gzAiBuffMult === 'function' ? gzAiBuffMult : () => 1;

    _DIRS.forEach(({ k, dr, dc, myE, theirE }) => {
      const nr = r + dr, nc = c + dc;
      out[k].mine = myEff[myE];
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 7) return;
      const adj = G.grid[nr][nc];
      if (!adj.card || adj.owner !== 'ai') return; // no enemy (or hazard/friendly)

      // CLOAK: that specific enemy edge is hidden until it has battled
      if (adj.card.ability === 'cloak' && !adj.card.cloakRevealed?.[theirE]) {
        out[k].theirs = '?';
        return; // result stays null
      }

      // Enemy effective edge: edgeMod, minus my INTIMIDATE hit on their
      // highest edge (as applyPlacementAbility would do), then the aggressive
      // AI buff (PvE only) — identical to gzEffEdge on the post-placement board.
      const theirEff = {
        n: adj.card.edges.n + (adj.card.edgeMod?.n || 0),
        s: adj.card.edges.s + (adj.card.edgeMod?.s || 0),
        e: adj.card.edges.e + (adj.card.edgeMod?.e || 0),
        w: adj.card.edges.w + (adj.card.edgeMod?.w || 0),
      };
      if (card.ability === 'intimidate') _hitHighest(theirEff);
      const theirs = Math.round(theirEff[theirE] * buffFn('ai'));

      const mine = myEff[myE];
      const pThem = adj.card.ability === 'pierce';

      out[k].theirs = theirs;
      out[k].result =
        (mine > theirs || (mine === theirs && pMe && !pThem)) ? 'win' :
        (theirs > mine || (mine === theirs && pThem && !pMe)) ? 'lose' :
        'tie'; // pure tie — harmless (fixed tie semantics)
    });

    return out;
  };

  // Badge builder — same markup as the desktop hover preview (render-grid.js).
  window.gzRenderPreviewBadges = function (result) {
    if (typeof document === 'undefined') return null;
    const frag = document.createDocumentFragment();
    if (!result) return frag;

    _DIRS.forEach(({ k, dr, dc }) => {
      const info = result[k];
      if (!info) return;
      const cloaked = info.theirs === '?';
      if (info.result === null && !cloaked) return; // no enemy that direction

      const res = cloaked ? 'unknown' : info.result;
      const badge = document.createElement('div');
      badge.dataset.bpv = '1';
      badge.dataset.dir = k;

      const col = res === 'win' ? '#00ff88'
                : res === 'lose' ? '#ff3333'
                : res === 'unknown' ? '#8888ff'
                : '#ffdd00';

      badge.style.cssText = `position:absolute;z-index:12;pointer-events:none;
        background:#000000ee;border:1px solid ${col}88;border-radius:4px;
        padding:3px 6px;display:flex;flex-direction:column;align-items:center;gap:1px;
        font-family:'Courier New',monospace;`;

      // Badge sits on the FACING edge: the side of the enemy cell nearest the
      // placement cell. dir 's' = enemy below me (dr=1) -> badge at its top, etc.
      if (dr === 1)       badge.style.cssText += 'top:4px;left:50%;transform:translateX(-50%);';
      else if (dr === -1) badge.style.cssText += 'bottom:4px;left:50%;transform:translateX(-50%);';
      else if (dc === 1)  badge.style.cssText += 'left:4px;top:50%;transform:translateY(-50%);';
      else                badge.style.cssText += 'right:4px;top:50%;transform:translateY(-50%);';

      const labelCol = res === 'tie' ? '#ffee44' : col;
      badge.innerHTML = `
        <span style="font-size:10px;font-weight:bold;color:${labelCol};letter-spacing:1px;">${res === 'unknown' ? '??' : res.toUpperCase()}</span>
        <span style="font-size:8px;color:${col}bb;">${info.mine}v${cloaked ? '?' : info.theirs}</span>`;

      frag.appendChild(badge);
    });

    return frag;
  };

})();
