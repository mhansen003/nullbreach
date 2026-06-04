function computeBattleResults() {


  // Use win/loss COUNTERS per axis — handles sandwiched cards correctly.


  // A card winning one V but losing another gets net=0 → no contribution (floor(½)).


  const b = Array(5).fill(null).map(() =>


    Array(7).fill(null).map(() => ({ hW:0, hL:0, vW:0, vL:0 }))


  );





  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const cell = G.grid[r][c];


      if (!cell.card) continue;





      // H battle: this cell vs East neighbor


      if (c < 6) {


        const east = G.grid[r][c+1];


        if (east.card && east.owner !== cell.owner && cell.owner !== "hazard" && east.owner !== "hazard") {


          const surgeBonus = (cell.card.ability === 'surge' && G.surgeTrigger?.[cell.owner]) ? 3 : 0;


          const _aiBuff = (window.aiDifficulty==='aggressive' && cell.owner==='ai') ? 1.1 : 1.0;


          if (cell.card.ability === 'cloak') cell.card.cloakRevealed = true;


          if (east.card.ability === 'cloak') east.card.cloakRevealed = true;


          const me = Math.round((cell.card.edges.e + (cell.card.edgeMod?.e || 0) + surgeBonus) * _aiBuff);


          const them = (east.card.edges.w + (east.card.edgeMod?.w || 0));


          const pierce = cell.card.ability === 'pierce';


          const pierceThem = east.card.ability === 'pierce';


          if (me > them || (me === them && pierce && !pierceThem)) {


            b[r][c].hW++;


            const hMargin = me - them;


            // OVERWHELM: H win by 3+ → bonus V win


            if (cell.card.ability === 'overwhelm' && hMargin >= 3) b[r][c].vW++;


            if ((east.card.ability === 'shield' || east.card.ability === 'stonewall') && !east.card.shieldExpended) {


              east.card.shieldExpended = true;


              east.card.shieldBlockH = true;
              east.card.shieldBlockV = true;


            }


            if (!east.card.shieldBlockH) b[r][c+1].hL++;


            // DOUBLE STRIKE 2nd hit at half strength


            if (cell.card.ability === 'double_strike' && c < 5) {


              const far = G.grid[r][c+2];


              if (far.card && far.owner !== cell.owner) {


                const me2 = Math.max(1, Math.floor(me / 2));


                if (me2 > (far.card.edges.w + (far.card.edgeMod?.w||0))) b[r][c+2].hL++;


              }


            }


          } else if (them > me || (me === them && pierceThem && !pierce)) {


            b[r][c+1].hW++;


            const hMargin = them - me;


            // OVERWHELM on east card


            if (east.card.ability === 'overwhelm' && hMargin >= 3) b[r][c+1].vW++;


            if ((cell.card.ability === 'shield' || cell.card.ability === 'stonewall') && !cell.card.shieldExpended) {


              cell.card.shieldExpended = true;


              cell.card.shieldBlockH = true;
              cell.card.shieldBlockV = true;


            }


            if (!cell.card.shieldBlockH) b[r][c].hL++;


            if (east.card.ability === 'double_strike' && c > 0) {


              const far = G.grid[r][c-1];


              if (far.card && far.owner !== east.owner) {


                const me2 = Math.max(1, Math.floor(them / 2));


                if (me2 > (far.card.edges.e + (far.card.edgeMod?.e||0))) b[r][c-1].hL++;


              }


            }


          } else { b[r][c].hL++; b[r][c+1].hL++; } // tie = neither wins


        }


      }





      // V battle: this cell vs South neighbor


      if (r < 4) {


        const south = G.grid[r+1][c];


        if (south.card && south.owner !== cell.owner && cell.owner !== "hazard" && south.owner !== "hazard") {


          if (cell.card.ability === 'cloak')  cell.card.cloakRevealed = true;


          if (south.card.ability === 'cloak') south.card.cloakRevealed = true;


          const surgeVBonus  = (cell.card.ability === 'surge'  && G.surgeTrigger?.[cell.owner])  ? 3 : 0;


          const surgeVBonusS = (south.card.ability === 'surge' && G.surgeTrigger?.[south.owner]) ? 3 : 0;


          const me = (cell.card.edges.s + (cell.card.edgeMod?.s || 0) + surgeVBonus);


          const them = (south.card.edges.n + (south.card.edgeMod?.n || 0) + surgeVBonusS);


          if (me > them) {


            b[r][c].vW++;


            const margin = me - them;


            // OVERWHELM: win by 3+ → bonus win on H axis too


            if (cell.card.ability === 'overwhelm' && margin >= 3) b[r][c].hW++;


            // SHIELD V: south card blocks first V loss — permanently


            if ((south.card.ability === 'shield' || south.card.ability === 'stonewall') && !south.card.shieldExpended) {


              south.card.shieldExpended = true;


              south.card.shieldBlockH = true;
              south.card.shieldBlockV = true;


            }


            if (!south.card.shieldBlockV) b[r+1][c].vL++;


            // DOUBLE STRIKE downward at half strength


            if (cell.card.ability === 'double_strike' && r < 3) {


              const far = G.grid[r+2][c];


              if (far.card && far.owner !== cell.owner) {


                const me2 = Math.max(1, Math.floor(me / 2));


                if (me2 > (far.card.edges.n + (far.card.edgeMod?.n||0))) b[r+2][c].vL++;


              }


            }


          } else if (me < them) {


            b[r+1][c].vW++;


            const margin = them - me;


            // OVERWHELM on south card


            if (south.card.ability === 'overwhelm' && margin >= 3) b[r+1][c].hW++;


            // SHIELD V: cell (north card) blocks first V loss — permanently


            if ((cell.card.ability === 'shield' || cell.card.ability === 'stonewall') && !cell.card.shieldExpended) {


              cell.card.shieldExpended = true;


              cell.card.shieldBlockH = true;
              cell.card.shieldBlockV = true;


            }


            if (!cell.card.shieldBlockV) b[r][c].vL++;


            // DOUBLE STRIKE upward at half strength


            if (south.card.ability === 'double_strike' && r > 0) {


              const far = G.grid[r-1][c];


              if (far.card && far.owner !== south.owner) {


                const me2 = Math.max(1, Math.floor(them / 2));


                if (me2 > (far.card.edges.s + (far.card.edgeMod?.s||0))) b[r-1][c].vL++;


              }


            }


          } else { b[r][c].vL++; b[r+1][c].vL++; } // tie = neither wins


        }


      }


    }


  }





  // ── EDGE PLAY: border cards fight opposite-edge enemies (wrap) ────────


  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const cell = G.grid[r][c];


      if (!cell.card || cell.card.ability !== 'edge_play') continue;


      const thisOwner = cell.owner;


      // West border: wrap fight with col 6


      // Far card gets no hL — the battle is invisible to it (non-local VP rule)


      if (c === 0) {


        const opp = G.grid[r][6];


        if (opp.card && opp.owner !== thisOwner) {


          const me = cell.card.edges.w + (cell.card.edgeMod?.w||0);


          const them = opp.card.edges.e + (opp.card.edgeMod?.e||0);


          if (me > them) { b[r][c].hW++; }           // edge_play wins, far card unaffected


          else if (me < them) { b[r][c].hL++; }      // edge_play loses, far card unaffected


        }


      }


      // East border: wrap fight with col 0


      if (c === 6) {


        const opp = G.grid[r][0];


        if (opp.card && opp.owner !== thisOwner) {


          const me = cell.card.edges.e + (cell.card.edgeMod?.e||0);


          const them = opp.card.edges.w + (opp.card.edgeMod?.w||0);


          if (me > them) { b[r][c].hW++; }


          else if (me < them) { b[r][c].hL++; }


        }


      }


      // North border: wrap fight with row 4


      if (r === 0) {


        const opp = G.grid[4][c];


        if (opp.card && opp.owner !== thisOwner) {


          const me = cell.card.edges.n + (cell.card.edgeMod?.n||0);


          const them = opp.card.edges.s + (opp.card.edgeMod?.s||0);


          if (me > them) { b[r][c].vW++; }


          else if (me < them) { b[r][c].vL++; }


        }


      }


      // South border: wrap fight with row 0


      if (r === 4) {


        const opp = G.grid[0][c];


        if (opp.card && opp.owner !== thisOwner) {


          const me = cell.card.edges.s + (cell.card.edgeMod?.s||0);


          const them = opp.card.edges.n + (opp.card.edgeMod?.n||0);


          if (me > them) { b[r][c].vW++; }


          else if (me < them) { b[r][c].vL++; }


        }


      }


    }


  }





  // ── Derive h/v strings from net counters (net win rule) ──────────────


  // H: win if hW > hL; lose if hL > hW; tie if equal but > 0; none if both 0


  // V: same. Win one / lose one = tie = 0 contribution (floor of ½ power).


  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const bb = b[r][c];


      bb.h = bb.hW > bb.hL ? 'win'


           : bb.hL > bb.hW ? 'lose'


           : (bb.hW > 0)   ? 'tie'


           : 'none';


      bb.v = bb.vW > bb.vL ? 'win'


           : bb.vL > bb.vW ? 'lose'


           : (bb.vW > 0)   ? 'tie'


           : 'none';


    }


  }


  return b;


}

function computeScores() {


  const battles = computeBattleResults();


  // Store on grid for rendering


  for (let r = 0; r < 5; r++)


    for (let c = 0; c < 7; c++)


      if (G.grid[r][c].card) G.grid[r][c].battle = battles[r][c];





  const rows = Array(5).fill(null).map(() => ({ p:0, a:0 }));


  const cols = Array(7).fill(null).map(() => ({ p:0, a:0 }));





  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const cell = G.grid[r][c];


      if (!cell.card) continue;


      // STONEWALL: this card or victim contributes 0 VP


      if (cell.card.stonewalled || cell.card.stonewall_victim) continue;


      // SNIPER: sniped card contributes 0 VP


      if (cell.card.sniped) continue;


      const bat = battles[r][c];


      const countsH = bat.h === 'win' || bat.h === 'none';


      const countsV = bat.v === 'win' || bat.v === 'none';


      // DENSITY: 1.5x power


      const basePower = cell.card.ability === 'density'


        ? Math.ceil(cell.card.power * 1.5) : cell.card.power;


      // COSMIC HAZARD penalty: -2 per adjacent hazard card


      const _adjHazards = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]


        .filter(({dr,dc}) => { const rr=r+dr,cc=c+dc; return rr>=0&&rr<5&&cc>=0&&cc<7&&G.grid[rr][cc].owner==='hazard'; }).length;


      const effPower = Math.max(0, basePower - _adjHazards * 2);


      if (countsH) { if (cell.owner==='player') rows[r].p += effPower; else rows[r].a += effPower; }


      if (countsV) { if (cell.owner==='player') cols[c].p += effPower; else cols[c].a += effPower; }


    }


  }





  // Who wins each row/col (for badge coloring + chip display)


  let rowResults = rows.map(r => r.p > r.a ? 'p' : r.a > r.p ? 'a' : 'tie');


  let colResults = cols.map(c => c.p > c.a ? 'p' : c.a > c.p ? 'a' : 'tie');





  // DECIDING FACTOR: player ties become player wins


  for (let r = 0; r < 5; r++) {


    if (rowResults[r] === 'tie') {


      const hasDf = G.grid[r].some(cell => cell.card && cell.owner === 'player' && cell.card.ability === 'deciding_factor' && !cell.card.stonewalled && !cell.card.sniped);


      if (hasDf) { rowResults[r] = 'p'; continue; }


      const hasAiDfRow = G.grid[r].some(cell => cell.card && cell.owner === 'ai' && cell.card.ability === 'deciding_factor' && !cell.card.stonewalled && !cell.card.sniped);


      if (hasAiDfRow) rowResults[r] = 'a';


    }


  }


  for (let c = 0; c < 7; c++) {


    if (colResults[c] === 'tie') {


      let hasDf = false;


      for (let r = 0; r < 5; r++) {


        const cell = G.grid[r][c];


        if (cell.card && cell.owner === 'player' && cell.card.ability === 'deciding_factor' && !cell.card.stonewalled && !cell.card.sniped) { hasDf = true; break; }


      }


      if (hasDf) colResults[c] = 'p';


    // AI DECIDING_FACTOR


    let hasAiDf3 = false;


    for (let _r3=0; _r3<5; _r3++) {


      const _c2 = G.grid[_r3][c];


      if (_c2.card && _c2.owner==='ai' && _c2.card.ability==='deciding_factor' && !_c2.card.stonewalled && !_c2.card.sniped) hasAiDf3 = true;


    }


    if (hasAiDf3 && colResults[c]==='tie') colResults[c] = 'a';


    }


  }





  // Net VP scoring: winner earns (their power − loser power) for each line


  let pWins = 0, aWins = 0;


  rowResults.forEach(r => { if(r==='p')pWins++; if(r==='a')aWins++; });


  colResults.forEach(c => { if(c==='p')pWins++; if(c==='a')aWins++; });





  // Delta scoring: winner gets (their power - loser power) per line


  let pVP = 0, aVP = 0;


  rows.forEach((row, ri) => {


    const net = row.p - row.a;


    if (net > 0) pVP += net;


    else if (net < 0) aVP += (-net);


  });


  cols.forEach((col, ci) => {


    const net = col.p - col.a;


    if (net > 0) pVP += net;


    else if (net < 0) aVP += (-net);


  });





  // Snapshot results before DECIDING_FACTOR mutates them — ECHO must use raw wins


  const rawRowResults = rowResults.slice();


  const rawColResults = colResults.slice();





  // ECHO: player card with echo in a row AND col both won → count its power again


  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const cell = G.grid[r][c];


      if (!cell.card || cell.owner !== 'player' || cell.card.ability !== 'echo') continue;


      if (cell.card.stonewalled || cell.card.stonewall_victim || cell.card.sniped) continue;


      if (rawRowResults[r] === 'p' && rawColResults[c] === 'p') {


        pVP += cell.card.power; // count once more (double total)


      }


    }


  }


  // AI ECHO too


  for (let r = 0; r < 5; r++) {


    for (let c = 0; c < 7; c++) {


      const cell = G.grid[r][c];


      if (!cell.card || cell.owner !== 'ai' || cell.card.ability !== 'echo') continue;


      if (cell.card.stonewalled || cell.card.stonewall_victim || cell.card.sniped) continue;


      if (rawRowResults[r] === 'a' && rawColResults[c] === 'a') {


        aVP += cell.card.power;


      }


    }


  }





  return { rows, cols, rowResults, colResults, pWins, aWins, pVP, aVP };


}
