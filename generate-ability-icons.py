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
