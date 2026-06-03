# Ability Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 44 race-specific 128×128 ability icons via Nano Banana (OpenRouter), save them to `assets/abilities/`, and wire them into the lore page ability cards and in-game card tooltip.

**Architecture:** A Python generation script loads each race's existing card art as a style reference image, sends it alongside a text prompt to `google/gemini-2.5-flash-image` via OpenRouter, and saves the result as `[raceid]_[abilitykey].png`. After user approval on the desktop, `index.html` and `game.html` are patched to render the images additively alongside existing UI elements — no structural HTML changes.

**Tech Stack:** Python 3, `requests` library, OpenRouter API (`google/gemini-2.5-flash-image`), HTML/JS inline edits

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `generate-ability-icons.py` | Create | Generates all 44 icons to `Desktop\ability-icons\` |
| `assets/abilities/*.png` | Create (44 files) | Icon images, copied from desktop after approval |
| `index.html` | Modify lines ~988, ~1194 | Add `RACE_ABILITY_KEYS` constant; update ability card render |
| `game.html` | Modify lines ~3641, ~3802 | Store `card.raceId`; add icon img to tooltip |

---

## Task 1: Create the generation script

**Files:**
- Create: `generate-ability-icons.py`

- [ ] **Step 1: Create `generate-ability-icons.py`** with the complete content below

```python
import os
import base64
import time
import requests
from pathlib import Path

API_KEY  = os.environ.get('OPENROUTER_API_KEY', '')
MODEL    = 'google/gemini-2.5-flash-image'
REPO     = Path(__file__).parent
OUT_DIR  = Path(r'C:\Users\Mark Hansen\Desktop\ability-icons')

# (raceid, abilitykey, display_name, race_name, description)
ABILITIES = [
    # TERRAN
    ('terran','shield',         'COLONIAL BULWARK',   'THE TERRAN ACCORD',   'The first edge comparison loss is permanently blocked in that direction'),
    ('terran','double_strike',  'ACCORD BARRAGE',     'THE TERRAN ACCORD',   'Winning an edge fires a second hit at half strength — discipline strikes twice'),
    ('terran','commander',      'FLEET ADMIRAL',      'THE TERRAN ACCORD',   'Adjacent same-tier friendly cards gain +2 to all edges on placement'),
    ('terran','flank',          'PINCER MANEUVER',    'THE TERRAN ACCORD',   'After placing, take an immediate extra turn before the opponent responds'),
    # CRYSTALLIS
    ('crystallis','stonewall',  'CRYSTAL FORTRESS',   'THE CRYSTALLIS',      'This card = 0 VP. Two random adjacent enemies also contribute 0 VP'),
    ('crystallis','mirror',     'REFRACTION',         'THE CRYSTALLIS',      'When 2+ enemies are adjacent, strongest and weakest facing edges swap'),
    ('crystallis','shield',     'LATTICE WARD',       'THE CRYSTALLIS',      'The first edge comparison loss is permanently blocked — crystal holds'),
    ('crystallis','density',    'CRYSTAL DENSITY',    'THE CRYSTALLIS',      'This card counts as 1.5x power in VP — lattice mass wins lines'),
    # MYCOS
    ('mycos','hat_trick',       'MYCELIUM LINK',      'THE MYCOS DRIFT',     'Middle of a vertical 3-card line: N/S edges distribute to flankers'),
    ('mycos','birthright',      'SPORE BURST',        'THE MYCOS DRIFT',     'A weak bonus T2 card spawns into your hand at game start'),
    ('mycos','echo',            'MYCELIAL NETWORK',   'THE MYCOS DRIFT',     'If row AND column are both won, this card scores double VP'),
    ('mycos','overwhelm',       'MYCO SURGE',         'THE MYCOS DRIFT',     'Win by 3+ on one axis and both row and column are claimed simultaneously'),
    # VEIL
    ('veil','phantom',          'PHASE SHIFT',        'THE VEIL',            'Can be placed anywhere in own home 2 rows without zone restrictions'),
    ('veil','flank',            'AFTERIMAGE',         'THE VEIL',            'After placing, take an immediate extra turn — light outruns darkness'),
    ('veil','edge_play',        'LIGHT BEND',         'THE VEIL',            'If on a border cell, also competes against the opposite board edge card'),
    ('veil','pierce',           'PHOTON LANCE',       'THE VEIL',            'Tie results count as wins — light never draws, it passes through'),
    # ENTROPY
    ('entropy','mirror',        'ENTROPY REVERSAL',   'THE ENTROPY CULT',    'With 2+ adjacent enemies, strongest and weakest facing edges swap'),
    ('entropy','sweep',         'RUST EQUALIZE',      'THE ENTROPY CULT',    'All 4 edges normalize to the 2nd-highest value — corrosion levels all'),
    ('entropy','double_strike', 'SECOND ROT',         'THE ENTROPY CULT',    'After winning an edge, fires a second hit at half strength'),
    ('entropy','ambush',        'CORROSIVE STRIKE',   'THE ENTROPY CULT',    'Two random adjacent enemies each lose -1 to all 4 edges permanently'),
    # BROOD
    ('brood','spawn',           'HIVE PULSE',         'THE BROOD SOVEREIGN', 'Adjacent same-tier Brood cards gain +2 to all edges — hive coordination'),
    ('brood','sweep',           'MANDIBLE LEVEL',     'THE BROOD SOVEREIGN', 'All 4 edges normalize to the 2nd-highest value on placement — even spread'),
    ('brood','rush',            'ACID CHARGE',        'THE BROOD SOVEREIGN', 'Can be placed adjacent to any enemy card anywhere, bypassing zone rules'),
    ('brood','boost',           "QUEEN'S FAVOR",      'THE BROOD SOVEREIGN', 'Adjacent friendly cards of any tier gain +1 to all edges on placement'),
    # VOID
    ('void','sniper',           'VOID LANCE',         'THE VOID HUNTERS',    'Silences the nearest enemy in this column — contributes 0 VP permanently'),
    ('void','ambush',           'DARK SURGE',         'THE VOID HUNTERS',    'Two random adjacent enemies each lose -1 to all 4 edges on placement'),
    ('void','rush',             'DARK LUNGE',         'THE VOID HUNTERS',    'Can be placed adjacent to any enemy card anywhere, bypassing zone rules'),
    ('void','pierce',           'EVENT HORIZON',      'THE VOID HUNTERS',    'Tie results count as wins — the void consumes all uncertainty'),
    # GAS
    ('gas','edge_play',         'STORM WRAP',         'THE GAS NOMADS',      'If on a border cell, also competes against the opposite board edge card'),
    ('gas','overwhelm',         'PLASMA SURGE',       'THE GAS NOMADS',      'Win by 3+ and both row AND column are claimed simultaneously'),
    ('gas','birthright',        'STORM BIRTH',        'THE GAS NOMADS',      'A weak bonus T2 card spawns into your hand at game start'),
    ('gas','double_strike',     'TWIN PLASMA',        'THE GAS NOMADS',      'After winning an edge, fires a second hit at half strength'),
    # LITHOS
    ('lithos','stonewall',      'TECTONIC HOLD',      'THE LITHOS',          'This card = 0 VP. Two random adjacent enemies also contribute 0 VP'),
    ('lithos','deciding_factor','FAULT LINE',         'THE LITHOS',          'Tied rows or columns tip +1 in your favor — pressure breaks deadlocks'),
    ('lithos','commander',      'TECTONIC ARRAY',     'THE LITHOS',          'Adjacent same-tier friendly cards gain +2 to all edges on placement'),
    ('lithos','shield',         'STONE SKIN',         'THE LITHOS',          'This card counts as 1.5x power in VP — ancient mass wins lines'),
    # QUANTUM
    ('quantum','flank',          'PROBABILITY CASCADE','THE QUANTUM THREAD', 'After placing, take an immediate extra turn — probability collapses in your favor'),
    ('quantum','deciding_factor','WAVE COLLAPSE',     'THE QUANTUM THREAD',  'Tied rows or columns tip +1 in your favor — state collapses for you'),
    ('quantum','phantom',        'SUPERPOSITION',     'THE QUANTUM THREAD',  'Can be placed anywhere in own home 2 rows without zone restrictions'),
    ('quantum','sniper',         'OBSERVER EFFECT',   'THE QUANTUM THREAD',  'Silences the nearest enemy in this column — observation = 0 VP'),
    # CHOIR
    ('choir','hat_trick',        'RESONANT CHORD',    'THE CHOIR',           'Middle of a vertical 3-card line: N/S edges distribute to flankers'),
    ('choir','overwhelm',        'SONIC BOOM',        'THE CHOIR',           'Win by 3+ and both row AND column are claimed simultaneously'),
    ('choir','boost',            'HARMONIC PULSE',    'THE CHOIR',           'Adjacent friendly cards of any tier gain +1 to all edges on placement'),
    ('choir','rush',             'SONIC RUSH',        'THE CHOIR',           'Can be placed adjacent to any enemy card anywhere, bypassing zone rules'),
]


def load_ref_image(race_id):
    path = REPO / 'assets' / 'cards' / race_id / 't2_a.png'
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()


def generate_icon(race_id, ability_key, display_name, race_name, desc):
    ref_b64 = load_ref_image(race_id)
    prompt = (
        f"Using the exact visual style, color palette, and aesthetic of the reference image, "
        f"generate a single 128x128 square icon representing the ability \"{display_name}\" "
        f"for {race_name} in a sci-fi card game. "
        f"The icon should feel like a badge or emblem — clear, symbolic, no text, no borders. "
        f"Context: {desc}"
    )
    payload = {
        "model": MODEL,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ref_b64}"}},
                {"type": "text", "text": prompt},
            ]
        }],
        "modalities": ["image", "text"],
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=90,
    )
    resp.raise_for_status()
    result = resp.json()
    images = result['choices'][0]['message'].get('images', [])
    if not images:
        raise ValueError(f"No image returned for {race_id}_{ability_key}. Response: {result}")
    data_url = images[0]['image_url']['url']
    b64_data = data_url.split(',', 1)[1]
    return base64.b64decode(b64_data)


def main():
    if not API_KEY:
        print("ERROR: OPENROUTER_API_KEY environment variable is not set.")
        print("  Set it with:  $env:OPENROUTER_API_KEY='sk-or-...'")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Output: {OUT_DIR}")
    print(f"Total:  {len(ABILITIES)} icons\n")

    ok = fail = skip = 0
    for race_id, ability_key, display_name, race_name, desc in ABILITIES:
        filename = f"{race_id}_{ability_key}.png"
        out_path = OUT_DIR / filename
        if out_path.exists():
            print(f"  SKIP  {filename}")
            skip += 1
            continue
        print(f"  GEN   {filename} ...", end='', flush=True)
        try:
            img_bytes = generate_icon(race_id, ability_key, display_name, race_name, desc)
            out_path.write_bytes(img_bytes)
            print(f" done ({len(img_bytes)//1024}KB)")
            ok += 1
        except Exception as e:
            print(f" FAILED: {e}")
            fail += 1
        time.sleep(2)

    print(f"\nDone. ok={ok}  fail={fail}  skip={skip}")
    print(f"Review images at: {OUT_DIR}")


if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Verify the script exists**

```powershell
Test-Path "C:\GitHub\nullbreach\generate-ability-icons.py"
```
Expected: `True`

- [ ] **Step 3: Commit**

```powershell
cd C:\GitHub\nullbreach
git add generate-ability-icons.py
git commit -m "Add generate-ability-icons.py script (Nano Banana, OpenRouter)"
```

---

## Task 2: Run the generation script

**Files:**
- Read: `generate-ability-icons.py`
- Output: `C:\Users\Mark Hansen\Desktop\ability-icons\` (44 PNG files)

- [ ] **Step 1: Set the API key in your PowerShell session**

```powershell
$env:OPENROUTER_API_KEY = 'sk-or-v1-YOUR_KEY_HERE'
```

- [ ] **Step 2: Run the script**

```powershell
cd C:\GitHub\nullbreach
python generate-ability-icons.py
```

Expected output (partial):
```
Output: C:\Users\Mark Hansen\Desktop\ability-icons
Total:  44 icons

  GEN   terran_shield.png ... done (18KB)
  GEN   terran_double_strike.png ... done (21KB)
  ...
Done. ok=44  fail=0  skip=0
```

If any lines show `FAILED`, re-run the script — it skips already-generated files, so it is safe to re-run. Common cause of failure is a transient API timeout; the 2-second sleep between requests handles rate limiting.

- [ ] **Step 3: Verify count**

```powershell
(Get-ChildItem "C:\Users\Mark Hansen\Desktop\ability-icons\*.png").Count
```
Expected: `44`

- [ ] **Step 4: Open the folder and review the images**

```powershell
explorer "C:\Users\Mark Hansen\Desktop\ability-icons"
```

Review all 44 images. They should look like race-themed emblems/badges, no text. If any look wrong, delete the bad file(s) and re-run the script — it will regenerate only the missing ones.

---

## Task 3: Copy approved images to assets/

**Files:**
- Create: `assets/abilities/` directory
- Copy: 44 PNG files from desktop into `assets/abilities/`

> Complete this task only after reviewing and approving the images in Task 2.

- [ ] **Step 1: Create the assets/abilities/ directory**

```powershell
New-Item -ItemType Directory -Path "C:\GitHub\nullbreach\assets\abilities" -Force
```

- [ ] **Step 2: Copy all approved images**

```powershell
Copy-Item "C:\Users\Mark Hansen\Desktop\ability-icons\*.png" "C:\GitHub\nullbreach\assets\abilities\"
```

- [ ] **Step 3: Verify count**

```powershell
(Get-ChildItem "C:\GitHub\nullbreach\assets\abilities\*.png").Count
```
Expected: `44`

- [ ] **Step 4: Commit**

```powershell
cd C:\GitHub\nullbreach
git add assets/abilities/
git commit -m "Add 44 race ability icons to assets/abilities/"
```

---

## Task 4: Patch index.html — lore page ability cards

**Files:**
- Modify: `index.html` at line ~988 (after ABILITY_DESC) and lines ~1194–1200 (ability card render loop)

**Context:** The `ABILITY_DESC` constant ends at line 988 with `};`. The ability card render loop is inside `selectRace()` at lines ~1194–1200. The lithos entry in the `RACES` array at line ~901 still says `'MONOLITH MASS'` — we align it to `'STONE SKIN'` to match `game.html`.

- [ ] **Step 1: Add `RACE_ABILITY_KEYS` constant after `ABILITY_DESC`**

Find this exact text in `index.html` (end of ABILITY_DESC, line ~988):
```js
  'SONIC RUSH':            'Can be placed adjacent to any enemy card anywhere, bypassing zone rules',
};
```

Replace with:
```js
  'SONIC RUSH':            'Can be placed adjacent to any enemy card anywhere, bypassing zone rules',
};

const RACE_ABILITY_KEYS = {
  terran:     ['shield','double_strike','commander','flank'],
  crystallis: ['stonewall','mirror','shield','density'],
  mycos:      ['hat_trick','birthright','echo','overwhelm'],
  veil:       ['phantom','flank','edge_play','pierce'],
  entropy:    ['mirror','sweep','double_strike','ambush'],
  brood:      ['spawn','sweep','rush','boost'],
  void:       ['sniper','ambush','rush','pierce'],
  gas:        ['edge_play','overwhelm','birthright','double_strike'],
  lithos:     ['stonewall','deciding_factor','commander','shield'],
  quantum:    ['flank','deciding_factor','phantom','sniper'],
  choir:      ['hat_trick','overwhelm','boost','rush'],
};
```

- [ ] **Step 2: Update the ability card render loop in `selectRace()`**

Find this exact block in `index.html` (lines ~1194–1200):
```js
    const ac = document.getElementById('abilityCards');
    ac.innerHTML = race.abilities.map(a => `
      <div class="ability-showcase" style="color:${race.color};border-color:${race.color}44;background:${race.color}08">
        <div class="absc-title">${a}</div>
        <div class="absc-desc">${ABILITY_DESC[a] || '—'}</div>
      </div>
    `).join('');
```

Replace with:
```js
    const ac = document.getElementById('abilityCards');
    const _abilityKeys = RACE_ABILITY_KEYS[race.id] || [];
    ac.innerHTML = race.abilities.map((a, i) => {
      const _key = _abilityKeys[i];
      const _iconSrc = _key ? `assets/abilities/${race.id}_${_key}.png` : '';
      return `
      <div class="ability-showcase" style="color:${race.color};border-color:${race.color}44;background:${race.color}08">
        <div class="absc-title" style="display:flex;align-items:center;gap:8px;">
          ${_iconSrc ? `<img src="${_iconSrc}" width="40" height="40" style="border-radius:3px;border:1px solid ${race.color}66;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
          ${a}
        </div>
        <div class="absc-desc">${ABILITY_DESC[a] || '—'}</div>
      </div>`;
    }).join('');
```

- [ ] **Step 3: Fix lithos ability name in the RACES array**

Find this in `index.html` (line ~901, inside the lithos race entry):
```js
    abilities: ['TECTONIC HOLD', 'FAULT LINE', 'TECTONIC ARRAY', 'MONOLITH MASS'],
```

Replace with:
```js
    abilities: ['TECTONIC HOLD', 'FAULT LINE', 'TECTONIC ARRAY', 'STONE SKIN'],
```

Also update the `ABILITY_DESC` entry. Find:
```js
  'MONOLITH MASS':         'This card counts as 1.5x power in VP — ancient mass wins lines',
```

Replace with:
```js
  'STONE SKIN':            'This card counts as 1.5x power in VP — ancient mass wins lines',
```

- [ ] **Step 4: Open the deck select page and verify**

Open `index.html` in a browser (or your local dev server). Click each of the 11 races in the conveyor. Verify:
- Each ability card shows a 40×40 icon to the left of the ability name
- The icon matches the race's visual style
- Lithos shows "STONE SKIN" (not "MONOLITH MASS")
- No broken image icons appear (the `onerror` hides them if a file is missing)

- [ ] **Step 5: Commit**

```powershell
cd C:\GitHub\nullbreach
git add index.html
git commit -m "Add ability icons to lore page ability cards (index.html)"
```

---

## Task 5: Patch game.html — in-game card tooltip

**Files:**
- Modify: `game.html` at line ~3641 (`assignRandomAbilities`) and lines ~3801–3808 (`showTip` ability section)

- [ ] **Step 1: Store raceId on each card in `assignRandomAbilities`**

Find this exact block in `game.html` (lines ~3641–3649, inside the `chosen.forEach` callback):
```js
  chosen.forEach(card => {
    const ab = pool[Math.floor(Math.random() * pool.length)];
    card.ability = ab;
    card.abilityText = (typeof ABILITY_TEXT !== 'undefined' && ABILITY_TEXT[ab]) || ab.toUpperCase();
    // Custom race-specific ability label (shown in tooltip header and hand card tag)
    const _raceNames = RACE_ABILITY_NAMES[raceId] || {};
    card.abilityLabel = _raceNames[ab] || null; // e.g. "LATTICE WARD" for crystallis shield
    card.isSpecial = true;
  });
```

Replace with:
```js
  chosen.forEach(card => {
    const ab = pool[Math.floor(Math.random() * pool.length)];
    card.ability = ab;
    card.abilityText = (typeof ABILITY_TEXT !== 'undefined' && ABILITY_TEXT[ab]) || ab.toUpperCase();
    const _raceNames = RACE_ABILITY_NAMES[raceId] || {};
    card.abilityLabel = _raceNames[ab] || null;
    card.raceId = raceId;
    card.isSpecial = true;
  });
```

- [ ] **Step 2: Compute `_iconSrc` near where `abi` is defined in `showTip()`**

`abi` is defined at line ~3694. Find this exact line:
```js
  const abi     = card.ability ? (ABILITY_ICONS[card.ability] || {icon:'✦', color:tierCol, label:card.ability.toUpperCase()}) : null;
```

Replace with:
```js
  const abi      = card.ability ? (ABILITY_ICONS[card.ability] || {icon:'✦', color:tierCol, label:card.ability.toUpperCase()}) : null;
  const _iconSrc = card.raceId && card.ability ? `assets/abilities/${card.raceId}_${card.ability}.png` : '';
```

- [ ] **Step 3: Update the tooltip ability section HTML in `showTip()`**

Find this exact block in `game.html` (lines ~3801–3808):
```js
    <div style="padding:8px 12px 10px;">
      ${abi ? `
      <div style="border:1px solid #ffdd0044;border-radius:5px;padding:7px 10px;background:#ffdd0008;">
        <div style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:1px;color:#ffdd00;font-weight:700;margin-bottom:4px;">${card.abilityLabel || abi.label}</div>
        <div style="font-size:11px;color:#ddd;line-height:1.5;">${card.abilityText}</div>
      </div>` : `
      <div style="font-size:10px;color:#333;letter-spacing:1px;font-style:italic;">No special ability</div>`}
    </div>
```

Replace with:
```js
    <div style="padding:8px 12px 10px;">
      ${abi ? `
      <div style="border:1px solid #ffdd0044;border-radius:5px;padding:7px 10px;background:#ffdd0008;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          ${_iconSrc ? `<img src="${_iconSrc}" width="32" height="32" style="border-radius:2px;flex-shrink:0;" onerror="this.style.display='none'">` : ''}
          <div style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:1px;color:#ffdd00;font-weight:700;">${card.abilityLabel || abi.label}</div>
        </div>
        <div style="font-size:11px;color:#ddd;line-height:1.5;">${card.abilityText}</div>
      </div>` : `
      <div style="font-size:10px;color:#333;letter-spacing:1px;font-style:italic;">No special ability</div>`}
    </div>
```

- [ ] **Step 4: Open a game and verify the tooltip**

Open `index.html`, select any race, click "Launch Deck". In the game:
- Hover a card in your hand — wait ~2.5s for the tooltip to appear
- Verify the ability section shows a 32×32 icon to the left of the ability label
- Hover a card already placed on the board — tooltip should appear immediately with icon
- Verify the icon matches the race's art style

- [ ] **Step 5: Commit**

```powershell
cd C:\GitHub\nullbreach
git add game.html
git commit -m "Add ability icons to in-game card tooltip (game.html)"
```

---

## Task 6: Final smoke test

- [ ] **Step 1: Test all 11 races on lore page**

Open `index.html`. Click each race tile in the conveyor and confirm:
- All 4 ability cards show their icon (40×40, left of title)
- Icons are visually themed to the race
- No broken-image boxes visible

Races to check: terran, crystallis, mycos, veil, entropy, brood, void, gas, lithos, quantum, choir

- [ ] **Step 2: Test tooltip in-game for at least 3 races**

Launch a deck for terran, then void, then choir. In each game:
- Hover 3+ cards with abilities (cards tagged with ability in the hand)
- Confirm tooltip shows icon + label + description

- [ ] **Step 3: Confirm no regressions**

- Deck select carousel still scrolls and shows all races
- Clicking a race still loads its lore correctly
- Game still plays — cards place, abilities trigger, scoring works

- [ ] **Step 4: Final commit if clean**

```powershell
cd C:\GitHub\nullbreach
git status
```
If clean (all changes committed from Tasks 4 and 5), no action needed. Otherwise commit any outstanding changes.
