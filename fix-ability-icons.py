"""
Fix problematic ability icons:
  1. PIL auto-crop solid-color border padding from all images
  2. Regenerate specific images that have embedded text or decorative frames
     (cropping can't fix those — they need new generation)

Run after generate-ability-icons.py has produced all 44 icons.
"""
import os
import base64
import time
import requests
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'Pillow', '-q'])
    from PIL import Image, ImageChops

API_KEY  = os.environ.get('OPENROUTER_API_KEY', '')
MODEL    = 'google/gemini-2.5-flash-image'
REPO     = Path(__file__).parent
ICON_DIR = Path(r'C:\Users\Mark Hansen\Desktop\ability-icons')

# ── Images that must be regenerated (text or decorative frame baked in) ──────
REGENERATE = [
    ('terran',   'shield',          'COLONIAL BULWARK',   'THE TERRAN ACCORD',
     'The first edge comparison loss is permanently blocked in that direction'),
    ('quantum',  'deciding_factor', 'WAVE COLLAPSE',      'THE QUANTUM THREAD',
     'Tied rows or columns tip +1 in your favor — state collapses for you'),
    ('entropy',  'sweep',           'RUST EQUALIZE',      'THE ENTROPY CULT',
     'All 4 edges normalize to the 2nd-highest value — corrosion levels all'),
    ('lithos',   'stonewall',       'TECTONIC HOLD',      'THE LITHOS',
     'This card = 0 VP. Two random adjacent enemies also contribute 0 VP'),
    ('crystallis','mirror',         'REFRACTION',         'THE CRYSTALLIS',
     'When 2+ enemies are adjacent, strongest and weakest facing edges swap'),
]


def trim_solid_border(path: Path) -> bool:
    """Remove solid-color border padding from a PNG. Returns True if image changed."""
    img = Image.open(path).convert('RGBA')
    # Get corner pixel as background color reference
    bg = img.getpixel((0, 0))
    # Create diff from background
    bg_img = Image.new('RGBA', img.size, bg)
    diff = ImageChops.difference(img, bg_img)
    bbox = diff.getbbox()
    if bbox is None:
        return False  # entirely one color — skip
    x0, y0, x1, y1 = bbox
    # Only crop if there's actual border padding (at least 4px on any side)
    w, h = img.size
    if x0 < 4 and y0 < 4 and x1 > w - 4 and y1 > h - 4:
        return False  # no significant border
    cropped = img.crop(bbox)
    # Save back as PNG
    cropped.save(path, 'PNG')
    return True


def load_ref_image(race_id: str) -> str:
    path = REPO / 'assets' / 'cards' / race_id / 't2_a.png'
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode()


def generate_icon(race_id, ability_key, display_name, race_name, desc) -> bytes:
    ref_b64 = load_ref_image(race_id)
    prompt = (
        f"Generate a single square icon for the ability \"{display_name}\" "
        f"for {race_name} in a sci-fi card game. "
        f"Match the color palette and visual aesthetic of the reference image. "
        f"The icon should be a clear, symbolic emblem or badge design. "
        f"STRICT REQUIREMENTS: "
        f"NO text, letters, numbers, or symbols of any kind anywhere in the image. "
        f"NO borders, frames, outlines, decorative edges, or card-like framing of any kind. "
        f"NO rounded corners or app-icon framing. "
        f"Pure dark or black background — the emblem floats on darkness. "
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
        raise ValueError(f"No image in response for {race_id}_{ability_key}. Body: {result}")
    data_url = images[0]['image_url']['url']
    b64_data = data_url.split(',', 1)[1]
    return base64.b64decode(b64_data)


def main():
    print("=== Phase 1: PIL border crop on all 44 icons ===\n")
    cropped = unchanged = 0
    for png in sorted(ICON_DIR.glob('*.png')):
        try:
            changed = trim_solid_border(png)
            if changed:
                print(f"  CROPPED  {png.name}")
                cropped += 1
            else:
                unchanged += 1
        except Exception as e:
            print(f"  ERROR    {png.name}: {e}")
    print(f"\nCrop done. cropped={cropped}  unchanged={unchanged}\n")

    print("=== Phase 2: Regenerate images with text or decorative frames ===\n")

    if not API_KEY:
        print("ERROR: OPENROUTER_API_KEY not set — skipping regeneration.")
        print("  Set it with:  $env:OPENROUTER_API_KEY='sk-or-...'")
        return

    ok = fail = 0
    for race_id, ability_key, display_name, race_name, desc in REGENERATE:
        filename = f"{race_id}_{ability_key}.png"
        out_path = ICON_DIR / filename
        print(f"  REGEN  {filename} ...", end='', flush=True)
        try:
            img_bytes = generate_icon(race_id, ability_key, display_name, race_name, desc)
            out_path.write_bytes(img_bytes)
            print(f" done ({len(img_bytes)//1024}KB)")
            ok += 1
        except Exception as e:
            print(f" FAILED: {e}")
            fail += 1
        time.sleep(2)

    print(f"\nRegeneration done. ok={ok}  fail={fail}")
    print(f"\nReview fixed images at: {ICON_DIR}")


if __name__ == '__main__':
    main()
