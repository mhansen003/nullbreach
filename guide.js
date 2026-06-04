const GUIDE_PAGES = [


  {


    title: 'THE BATTLEFIELD',


    html: `


      <style>


/* 5-second loop timeline percentages:


   0-12%: blank (reset)    12-28%: card1 flies in    28-44%: adj1 appear


   44-58%: card2 flies in  58-72%: adj2 appear       72-90%: hold   90-100%: fade */


@keyframes g1c1{0%,12%{opacity:0;transform:translateY(18px) scale(0.85)}28%{opacity:1;transform:none}90%{opacity:1}100%{opacity:0}}


@keyframes g1c2{0%,44%{opacity:0;transform:translateY(18px) scale(0.85)}58%{opacity:1;transform:none}90%{opacity:1}100%{opacity:0}}


@keyframes g1ai{0%,5%{opacity:0}16%{opacity:1}90%{opacity:1}100%{opacity:0}}


@keyframes g1adj1{0%,28%{opacity:0}44%{opacity:1}90%{opacity:1}100%{opacity:0}}


@keyframes g1adj2{0%,58%{opacity:0}72%{opacity:1}90%{opacity:1}100%{opacity:0}}


@keyframes g1pink{0%,5%{opacity:0}16%{opacity:0.85}90%{opacity:0.85}100%{opacity:0}}


@keyframes g1pulse{0%,100%{border-color:#ffdd0055}50%{border-color:#ffdd00bb}}


</style>


<div style="text-align:center;margin-bottom:12px;">


  <div style="font-size:10px;color:#ff0080;letter-spacing:3px;margin-bottom:6px;font-family:'Orbitron',monospace;">OPPONENT</div>


  <div style="display:inline-grid;grid-template-columns:repeat(7,40px);grid-template-rows:repeat(3,52px);gap:3px;">





    <!-- ROW 0: AI home -->


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-bottom:2px solid #ff008033;border-radius:3px;"></div>


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-bottom:2px solid #ff008033;border-radius:3px;"></div>


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-bottom:2px solid #ff008033;border-radius:3px;"></div>


    <!-- col3: AI pink adj -->


    <div style="background:#ff008008;border:1px dashed #ff008044;border-bottom:2px solid #ff008033;border-radius:3px;animation:g1pink 5s ease infinite;"></div>


    <!-- col4: AI card -->


    <div style="background:linear-gradient(145deg,#1c0a0a,#150818);border:1px solid #ff008055;border-bottom:2px solid #ff0080;border-radius:3px;display:flex;align-items:center;justify-content:center;animation:g1ai 5s ease infinite;">


      <img src="assets/avatars/crystallis.png" style="width:22px;height:22px;border-radius:50%;object-fit:cover;object-position:top;opacity:0.9;">


    </div>


    <!-- col5: AI pink adj -->


    <div style="background:#ff008008;border:1px dashed #ff008044;border-bottom:2px solid #ff008033;border-radius:3px;animation:g1pink 5s ease infinite;"></div>


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-bottom:2px solid #ff008033;border-radius:3px;"></div>





    <!-- ROW 1: Battle zone -->


    <div style="background:#080810;border:1px dashed #151525;border-radius:3px;"></div>


    <!-- col1: adj2 after player card 2 -->


    <div style="background:#ffdd0008;border:1px dashed #ffdd0088;border-radius:3px;animation:g1adj2 5s ease infinite,g1pulse 1.4s ease infinite;"></div>


    <!-- col2: adj1 after player card 1 -->


    <div style="background:#ffdd0008;border:1px dashed #ffdd0088;border-radius:3px;animation:g1adj1 5s ease infinite,g1pulse 1.4s ease 0.3s infinite;"></div>


    <!-- col3: adj1 after player card 1 (N of card) -->


    <div style="background:#ffdd0008;border:1px dashed #ffdd0088;border-radius:3px;animation:g1adj1 5s ease infinite,g1pulse 1.4s ease 0.6s infinite;"></div>


    <!-- col4: AI pink adj (S of AI card) -->


    <div style="background:#ff008008;border:1px dashed #ff008044;border-radius:3px;animation:g1pink 5s ease infinite;"></div>


    <div style="background:#080810;border:1px dashed #151525;border-radius:3px;"></div>


    <div style="background:#080810;border:1px dashed #151525;border-radius:3px;"></div>





    <!-- ROW 2: Player home -->


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-top:2px solid #00ffcc33;border-radius:3px;"></div>


    <!-- col1: adj2 -->


    <div style="background:#ffdd0008;border:1px dashed #ffdd0088;border-top:2px solid #00ffcc33;border-radius:3px;animation:g1adj2 5s ease infinite,g1pulse 1.4s ease 0.2s infinite;"></div>


    <!-- col2: player card 2 (flies in) -->


    <div style="background:linear-gradient(145deg,#0a1c16,#08151e);border:1px solid #00ffcc55;border-top:2px solid #00ffcc;border-radius:3px;display:flex;align-items:center;justify-content:center;animation:g1c2 5s ease infinite;">


      <img src="assets/avatars/terran.png" style="width:22px;height:22px;border-radius:50%;object-fit:cover;object-position:top;opacity:0.9;">


    </div>


    <!-- col3: player card 1 -->


    <div style="background:linear-gradient(145deg,#0a1c16,#08151e);border:1px solid #00ffcc55;border-top:2px solid #00ffcc;border-radius:3px;display:flex;align-items:center;justify-content:center;animation:g1c1 5s ease infinite;">


      <img src="assets/avatars/terran.png" style="width:22px;height:22px;border-radius:50%;object-fit:cover;object-position:top;opacity:0.9;">


    </div>


    <!-- col4: adj1 -->


    <div style="background:#ffdd0008;border:1px dashed #ffdd0088;border-top:2px solid #00ffcc33;border-radius:3px;animation:g1adj1 5s ease infinite,g1pulse 1.4s ease 0.9s infinite;"></div>


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-top:2px solid #00ffcc33;border-radius:3px;"></div>


    <div style="background:#0a0a17;border:1px solid #1a1a2e;border-top:2px solid #00ffcc33;border-radius:3px;"></div>


  </div>


  <div style="font-size:10px;color:#00ffcc;letter-spacing:3px;margin-top:6px;font-family:'Orbitron',monospace;">YOU</div>


</div>


<div style="display:grid;grid-template-columns:1fr;gap:10px;max-width:460px;margin:0 auto;">


  <div style="background:#0a0a18;border-left:3px solid #00ffcc;border-radius:6px;padding:12px;">


    <div style="font-size:11px;color:#00ffcc;font-family:'Orbitron',monospace;letter-spacing:3px;margin-bottom:6px;">① STEP 1</div>


    <div style="font-size:14px;color:#e0d8f8;line-height:1.7;">Place a Tier I card on your home row to open the battle zone. The opponent does the same from the top.</div>


  </div>


  <div style="background:#0a0a18;border-left:3px solid #ffdd00;border-radius:6px;padding:12px;">


    <div style="font-size:11px;color:#ffdd00;font-family:'Orbitron',monospace;letter-spacing:3px;margin-bottom:6px;">② STEP 2</div>


    <div style="font-size:14px;color:#e0d8f8;line-height:1.7;"><span style="color:#ffdd00;">Yellow cells</span> unlock around each placed card. Your next card must go in one of those cells.</div>


  </div>


</div>


    `


  },


  {


    title: 'CARDS & SCORING',


    html: `


      <style>


@keyframes g2fly-l{0%{opacity:0;transform:translateX(-30px) scale(0.88)}100%{opacity:1;transform:none}}


@keyframes g2fly-r{0%{opacity:0;transform:translateX(30px) scale(0.88)}100%{opacity:1;transform:none}}


@keyframes g2glow{0%,100%{box-shadow:0 0 0 2px #ffffff44}50%{box-shadow:0 0 0 3px #ffffffaa,0 0 16px #ffffff44}}


@keyframes g2chip{0%{opacity:0;transform:scale(0.5)}100%{opacity:1;transform:scale(1)}}


@keyframes g2dp{0%{opacity:0;transform:translateY(5px)}100%{opacity:1;transform:none}}


@keyframes g2fade{0%{opacity:0}100%{opacity:1}}
@media(max-width:480px){
  .g2-battle-wrap{transform:scale(0.85);transform-origin:top center;margin-bottom:0!important;}
  .g2-desc{font-size:11px!important;max-width:100%!important;margin-top:2px!important;}
  .g2-scoring{flex-direction:column!important;align-items:center!important;gap:10px!important;}
  .g2-scoring-sep{display:none!important;}
  .g2-scoring-text{max-width:100%!important;padding:0 4px!important;font-size:11px!important;}
}


</style>





<!-- SECTION 1: Card Battle -->


<div class="g2-battle-wrap" style="text-align:center;margin-bottom:18px;">


  <div style="display:inline-flex;align-items:center;gap:0;">





    <!-- Player card -->


    <div style="position:relative;width:90px;height:119px;border-radius:5px;overflow:hidden;border:2px solid #00ffcc;background:#0a1c16;animation:g2fly-l 0.45s ease 0.3s both;">


      <img src="assets/cards/terran/t1_a.png" style="width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(1.3);">


      <span style="position:absolute;top:3px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.8);border-radius:50%;min-width:16px;text-align:center;padding:1px 2px;line-height:1.4;">6</span>


      <span style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.8);border-radius:50%;min-width:16px;text-align:center;padding:1px 2px;line-height:1.4;">2</span>


      <span style="position:absolute;left:3px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.8);border-radius:50%;min-width:16px;text-align:center;padding:1px 2px;line-height:1.4;">3</span>


      <span style="position:absolute;right:3px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.9);border-radius:50%;min-width:20px;text-align:center;padding:1px 2px;line-height:1.4;animation:g2glow 1.2s ease 1s infinite;box-shadow:0 0 0 2px #ffffff44;">6</span>


      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:17px;font-weight:bold;color:#fff;background:#000000cc;padding:2px 5px;border-radius:4px;line-height:1;">4</div>


    </div>





    <!-- Battle gap -->


    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:72px;flex-shrink:0;z-index:4;">


      <div style="display:flex;align-items:center;gap:3px;animation:g2dp 0.4s ease 1.0s both;">


        <span style="font-size:15px;font-weight:bold;color:#fff;">4</span>


        <span style="font-size:9px;color:#bbb;">vs</span>


        <span style="font-size:15px;font-weight:bold;color:#ffdd00;">3</span>


      </div>


      <div style="width:36px;height:36px;border-radius:50%;border:2px solid #00ffcc;background:#00ffcc18;display:flex;align-items:center;justify-content:center;animation:g2chip 0.35s ease 1.4s both;">


        <img src="assets/avatars/terran.png" style="width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:top;">


      </div>


      <div style="animation:g2dp 0.4s ease 1.7s both;text-align:center;">


        <div style="font-size:14px;font-weight:bold;color:#ffdd00;text-shadow:0 0 8px #ffdd0088;">+1 VP</div>


        <div style="font-size:8px;color:#aaa;letter-spacing:1px;">DELTA</div>


      </div>


    </div>





    <!-- AI card -->


    <div style="position:relative;width:90px;height:119px;border-radius:5px;overflow:hidden;border:2px solid #ff0080;background:#1c0a0a;animation:g2fly-r 0.45s ease 0.5s both;">


      <img src="assets/cards/crystallis/t1_a.png" style="width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(1.2);">


      <span style="position:absolute;top:3px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.8);border-radius:50%;min-width:16px;text-align:center;padding:1px 2px;line-height:1.4;">3</span>


      <span style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.8);border-radius:50%;min-width:16px;text-align:center;padding:1px 2px;line-height:1.4;">5</span>


      <span style="position:absolute;left:3px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.9);border-radius:50%;min-width:20px;text-align:center;padding:1px 2px;line-height:1.4;">4</span>


      <span style="position:absolute;right:3px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.8);border-radius:50%;min-width:16px;text-align:center;padding:1px 2px;line-height:1.4;">7</span>


      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:17px;font-weight:bold;color:#ffdd00;background:#000000cc;padding:2px 5px;border-radius:4px;line-height:1;">3</div>


    </div>


  </div>


  <div class="g2-desc" style="margin-top:10px;max-width:360px;text-align:center;font-size:13px;color:#ddd;line-height:1.7;">


    Each card has four edges: when cards are placed next to an enemy, the touching edges compete.


    The higher edge wins that direction, and the winning side earns the <strong>power difference</strong> as VP.


  </div>


</div>





<!-- SECTION 2: Row and Column scoring: single combined grid -->


<div class="g2-scoring" style="animation:g2fade 0.5s ease 2s both;display:flex;gap:20px;justify-content:center;align-items:flex-start;flex-wrap:wrap;">





  <!-- Combined rows + columns grid -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">

    <div style="display:flex;gap:2px;flex-direction:column;">

      <!-- Row 0: row scoring (enemy 2 vs player 5) + row badge on right -->
      <div style="display:flex;gap:2px;align-items:center;">
        <div style="width:36px;height:44px;border-radius:3px;background:#1c0a0a;border:2px solid #ff008066;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#ffdd00;">2</div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
        <div style="width:36px;height:44px;border-radius:3px;background:#0a1c16;border:2px solid #00ffcc55;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#fff;">5</div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
        <div style="margin-left:6px;display:flex;flex-direction:column;align-items:center;gap:2px;background:#00ffcc08;border:1px solid #00ffcc44;border-left:3px solid #00ffcc;border-radius:4px;padding:5px 8px;">
          <img src="assets/avatars/terran.png" style="width:20px;height:20px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #00ffcc;">
          <span style="font-size:14px;font-weight:bold;color:#00ffcc;line-height:1;text-shadow:0 0 8px #00ffcc;">+3</span>
          <span style="font-size:8px;color:#00ffcc88;letter-spacing:1px;font-family:'Orbitron',monospace;">ROW</span>
        </div>
      </div>

      <!-- Row 1: column cell (enemy 3) -->
      <div style="display:flex;gap:2px;">
        <div style="width:36px;height:44px;border-radius:3px;background:#1c0a0a;border:2px solid #ff008066;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#ffdd00;">3</div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
      </div>

      <!-- Row 2: column cell (player 6) -->
      <div style="display:flex;gap:2px;">
        <div style="width:36px;height:44px;border-radius:3px;background:#0a1c16;border:2px solid #00ffcc55;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#fff;">6</div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
        <div style="width:36px;height:44px;border-radius:3px;background:#080810;border:1px dashed #1a1a28;"></div>
      </div>

    </div>

    <!-- Col badge below first column + labels -->
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;background:#00ffcc08;border:1px solid #00ffcc44;border-top:3px solid #00ffcc;border-radius:4px;padding:5px 8px;width:36px;">
        <img src="assets/avatars/terran.png" style="width:20px;height:20px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #00ffcc;">
        <span style="font-size:14px;font-weight:bold;color:#00ffcc;text-shadow:0 0 8px #00ffcc;">+3</span>
        <span style="font-size:8px;color:#00ffcc88;letter-spacing:1px;font-family:'Orbitron',monospace;">COL</span>
      </div>
      <div style="font-size:12px;color:#ccc;line-height:1.8;">
        Row: 5 vs 2 = <span style="color:#00ffcc;font-weight:bold;">+3 VP</span><br>
        Col: 6 vs 3 = <span style="color:#00ffcc;font-weight:bold;">+3 VP</span>
      </div>
    </div>

  </div>


  <div class="g2-scoring-text" style="max-width:460px;margin:14px auto 0;text-align:center;font-size:13px;color:#ddd;line-height:1.8;">

    Every row (left to right) and every column (top to bottom) is scored separately.
    For each line the winner earns the difference in total power as VP: so controlling both rows and columns matters.

  </div>

  <div style="max-width:460px;margin:10px auto 0;background:#0a0a18;border-left:3px solid #ffdd00;border-radius:6px;padding:9px 14px;display:flex;align-items:center;gap:12px;">
    <div style="font-size:18px;flex-shrink:0;">🏆</div>
    <div style="font-size:12px;color:#e0d8f8;line-height:1.6;">
      All cards played → <span style="color:#ffdd00;font-weight:bold;">highest VP wins.</span>
      Control <span style="color:#ffdd00;font-weight:bold;">18+ cells</span> → instant win.
    </div>
  </div>





</div>


    `


  },


  {


    title: 'PLACEMENT & ABILITIES',


    html: `


      <style>


@keyframes g3fly{0%{opacity:0;transform:translateY(14px) scale(0.9)}100%{opacity:1;transform:none}}


@keyframes g3tip{0%{opacity:0;transform:translateX(10px)}100%{opacity:1;transform:none}}


</style>





<!-- Placement rules -->


<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">


  <div style="background:#0a0a18;border-left:3px solid #d0d0d0;border-radius:5px;padding:10px 12px;">


    <div style="font-size:10px;color:#d0d0d0;font-family:'Orbitron',monospace;letter-spacing:2px;margin-bottom:4px;">TIER I</div>


    <div style="font-size:13px;color:#ddd;line-height:1.6;">Home row only. Place first to open the battle zone.</div>


  </div>


  <div style="background:#0a0a18;border-left:3px solid #8855ff;border-radius:5px;padding:10px 12px;">


    <div style="font-size:10px;color:#8855ff;font-family:'Orbitron',monospace;letter-spacing:2px;margin-bottom:4px;">TIER II-IV</div>


    <div style="font-size:13px;color:#ddd;line-height:1.6;">Battle zone rows 1-3. Must be adjacent to a card you already played.</div>


  </div>


</div>





<!-- Two ability card examples -->
<div style="font-size:10px;letter-spacing:3px;color:#ccc;text-align:center;margin-bottom:14px;font-family:&apos;Orbitron&apos;,monospace;">SPECIAL ABILITIES: cards marked ★ carry a unique power</div>
<div style="display:flex;gap:24px;justify-content:center;align-items:flex-start;">
  <!-- Card 1: LAMB -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:180px;animation:g3fly 0.4s ease 0.3s both;">
    <div style="position:relative;width:114px;height:152px;border-radius:5px;overflow:hidden;border:2px solid #ffdd00;background:#0e0e08;box-shadow:0 0 18px #ffdd0033;">
      <img src="assets/cards/mycos/t2_a.png" style="width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(1.2);" onerror="this.style.background=&apos;#1a1a10&apos;">
      <span style="position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.88);border-radius:50%;min-width:20px;text-align:center;padding:1px 3px;">0</span>
      <span style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:14px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.88);border-radius:50%;min-width:20px;text-align:center;padding:1px 3px;">0</span>
      <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.88);border-radius:50%;min-width:20px;text-align:center;padding:1px 3px;">0</span>
      <span style="position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:14px;font-weight:bold;color:#ffdd00;background:rgba(0,0,0,0.88);border-radius:50%;min-width:20px;text-align:center;padding:1px 3px;">0</span>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:26px;font-weight:bold;color:#ffdd00;background:#000000dd;padding:3px 6px;border-radius:4px;line-height:1;text-shadow:0 0 12px #ffdd00;">5</div>
      <span class="ability-star" style="position:absolute;top:4px;right:4px;font-size:16px;z-index:5;pointer-events:none;">★</span>
    </div>
    <div style="background:#0d0d10;border:1px solid #ffdd0044;border-radius:8px;padding:12px;width:180px;box-sizing:border-box;animation:g3tip 0.4s ease 0.7s both;">
      <div style="font-family:Inter,sans-serif;">
        <div style="font-size:10px;color:#ffdd00;font-weight:700;letter-spacing:1px;margin-bottom:5px;">LAMB</div>
        <div style="font-size:11px;color:#ddd;line-height:1.6;">5 VP but zero edges. Scores full value if no enemy is adjacent. Scores nothing if attacked.</div>
      </div>
    </div>
  </div>
  <!-- Card 2: REVENGE -->
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:180px;animation:g3fly 0.4s ease 0.5s both;">
    <div style="position:relative;width:114px;height:152px;border-radius:5px;overflow:hidden;border:2px solid #ff4488;background:#160810;box-shadow:0 0 14px #ff448822;">
      <img src="assets/cards/crystallis/t2_b.png" style="width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(1.15);" onerror="this.style.background=&apos;#180818&apos;">
      <span style="position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.82);border-radius:50%;min-width:19px;text-align:center;padding:1px 3px;">5</span>
      <span style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.82);border-radius:50%;min-width:19px;text-align:center;padding:1px 3px;">3</span>
      <span style="position:absolute;left:4px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.82);border-radius:50%;min-width:19px;text-align:center;padding:1px 3px;">2</span>
      <span style="position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:bold;color:#fff;background:rgba(0,0,0,0.82);border-radius:50%;min-width:19px;text-align:center;padding:1px 3px;">4</span>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:22px;font-weight:bold;color:#fff;background:#000000cc;padding:3px 6px;border-radius:4px;line-height:1;">2</div>
      <span class="ability-star" style="position:absolute;top:4px;right:4px;font-size:16px;z-index:5;pointer-events:none;">★</span>
    </div>
    <div style="background:#0d0d10;border:1px solid #ff448844;border-radius:8px;padding:12px;width:180px;box-sizing:border-box;animation:g3tip 0.4s ease 0.9s both;">
      <div style="font-family:Inter,sans-serif;">
        <div style="font-size:10px;color:#ff4488;font-weight:700;letter-spacing:1px;margin-bottom:5px;">REVENGE</div>
        <div style="font-size:11px;color:#ddd;line-height:1.6;">When this card loses a battle, the winning enemy permanently loses 1 VP.</div>
      </div>
    </div>
  </div>
</div>
<div style="text-align:center;margin-top:14px;font-size:13px;color:#bbb;">The <span class="ability-star" style="font-size:13px;">★</span> marks a special ability. Hover in-game to see what it does.</div>


    `


  },


  {


    title: 'COSMIC HAZARDS',


    html: `


      <style>


@keyframes g4fade{0%{opacity:0}100%{opacity:1}}


@keyframes g4pulse{0%,100%{box-shadow:0 0 10px #ff440055,inset 0 0 6px #ff220022}
@keyframes hazardPulse2 { 0%,100%{opacity:0.55} 50%{opacity:1} }
50%{box-shadow:0 0 28px #ff660088,inset 0 0 16px #ff440033}}





/* Mobile layout CSS moved to main <head> style block */
</style>





<!-- Two real hazard cards side by side -->


<div style="display:flex;gap:14px;justify-content:center;margin-bottom:16px;animation:g4fade 0.5s ease 0.3s both;">





  <!-- Black Hole -->


  <div style="width:100px;height:132px;border-radius:6px;overflow:hidden;border:2px solid #ff660088;animation:g4pulse 2.5s ease infinite;position:relative;">


    <video autoplay loop muted playsinline preload="auto"


      poster="assets/cards/hazard/black_hole.png"


      style="width:100%;height:100%;object-fit:cover;object-position:center 60%;display:block;transform:scale(1.25);">


      <source src="assets/cards/hazard/black_hole.mp4" type="video/mp4">


    </video>


    <div style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:7px;color:#ff6600;font-family:'Orbitron',monospace;letter-spacing:1px;">⚠ BLACK HOLE</div>


  </div>





  <!-- Red Giant -->


  <div style="width:100px;height:132px;border-radius:6px;overflow:hidden;border:2px solid #ff660088;animation:g4pulse 2.5s ease 0.4s infinite;position:relative;">


    <video autoplay loop muted playsinline preload="auto"


      poster="assets/cards/hazard/red_giant.png"


      style="width:100%;height:100%;object-fit:cover;object-position:center 60%;display:block;transform:scale(1.25);">


      <source src="assets/cards/hazard/red_giant.mp4" type="video/mp4">


    </video>


    <div style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:7px;color:#ff6600;font-family:'Orbitron',monospace;letter-spacing:1px;">⚠ RED GIANT</div>


  </div>





</div>





<!-- Blast radius mini board -->


<div style="text-align:center;margin-bottom:12px;animation:g4fade 0.5s ease 0.6s both;">


  <div style="font-size:9px;letter-spacing:3px;color:#ff6600;font-family:'Orbitron',monospace;margin-bottom:10px;">BLAST RADIUS</div>


  <!-- 3×3 mini grid -->


  <div style="display:inline-grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(3,52px);gap:3px;position:relative;">


    <!-- Row 0 -->


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;"></div>


    <!-- N adjacent: orange blast from bottom -->


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;position:relative;">


      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,#ff660055 0%,#ff440022 42%,transparent 62%);border-radius:2px;"></div>


      <div style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);font-size:8px;color:#ff8800;font-weight:bold;white-space:nowrap;">-2 VP</div>


    </div>


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;"></div>





    <!-- Row 1: W adjacent | HAZARD | E adjacent -->


    <!-- W adjacent -->


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;position:relative;">


      <div style="position:absolute;inset:0;background:linear-gradient(to right,#ff660055 0%,#ff440022 42%,transparent 62%);border-radius:2px;"></div>


      <div style="position:absolute;right:3px;bottom:3px;font-size:8px;color:#ff8800;font-weight:bold;">-2 VP</div>


    </div>


    <!-- CENTER: hazard card (video) -->


    <div style="border-radius:4px;overflow:hidden;border:2px solid #ff660088;position:relative;animation:g4pulse 2.5s ease 0.8s infinite;">


      <video autoplay loop muted playsinline preload="auto"


        poster="assets/cards/hazard/plasma_pulse.png"


        style="width:100%;height:100%;object-fit:cover;object-position:center 60%;display:block;transform:scale(1.25);">


        <source src="assets/cards/hazard/plasma_pulse.mp4" type="video/mp4">


      </video>


    </div>


    <!-- E adjacent -->


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;position:relative;">


      <div style="position:absolute;inset:0;background:linear-gradient(to left,#ff660055 0%,#ff440022 42%,transparent 62%);border-radius:2px;"></div>


      <div style="position:absolute;left:3px;bottom:3px;font-size:8px;color:#ff8800;font-weight:bold;">-2 VP</div>


    </div>





    <!-- Row 2 -->


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;"></div>


    <!-- S adjacent: orange blast from top -->


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;position:relative;">


      <div style="position:absolute;inset:0;background:linear-gradient(to top,#ff660055 0%,#ff440022 42%,transparent 62%);border-radius:2px;"></div>


      <div style="position:absolute;top:3px;left:50%;transform:translateX(-50%);font-size:8px;color:#ff8800;font-weight:bold;white-space:nowrap;">-2 VP</div>


    </div>


    <div style="background:#080810;border:1px dashed #1a1a28;border-radius:3px;"></div>


  </div>


</div>





<div style="text-align:center;font-size:13px;color:#ddd;line-height:1.7;max-width:400px;margin:0 auto;animation:g4fade 0.5s ease 1s both;">


  Cosmic hazards appear at game start in the battle zone. Any card placed in the 4 adjacent cells loses <span style="color:#ff6600;font-weight:bold;">-2 VP</span> from its scoring contribution. Both sides are affected equally.


</div>


    `


  }


];

let _guidePage = 0;

function guidePage(delta) {


  _guidePage = Math.max(0, Math.min(GUIDE_PAGES.length - 1, _guidePage + delta));


  renderGuide();


}

function renderGuide() {


  const p = GUIDE_PAGES[_guidePage];


  document.getElementById('guideTitle').textContent = p.title;


  document.getElementById('guidePageNum').textContent = `PAGE ${_guidePage+1} OF ${GUIDE_PAGES.length}`;


  document.getElementById('guideContent').innerHTML = p.html;


  document.getElementById('guidePrev').style.opacity = _guidePage === 0 ? '0.3' : '1';


  const nextBtn = document.getElementById('guideNext');


  if (_guidePage === GUIDE_PAGES.length - 1) {


    nextBtn.textContent = 'DONE ✓';


    nextBtn.onclick = closeGuide;


  } else {


    nextBtn.textContent = 'NEXT →';


    nextBtn.onclick = () => guidePage(1);


  }


}

function showGuide() {


  _guidePage = 0;


  renderGuide();


  const m = document.getElementById('guideModal');


  m.style.display = 'flex';


}

function closeGuide() {


  const m = document.getElementById('guideModal');


  m.style.display = 'none';


  if (document.getElementById('guideDontShow')?.checked) {


    localStorage.setItem('gz_guide_seen', '1');


  }


}

// Auto-show on first visit


window.addEventListener('load', () => {


  if (!localStorage.getItem('gz_guide_seen')) {


    setTimeout(showGuide, 800);


  }


});
