"""
Generate Steam store graphics for GALACTIC ZERO via OpenRouter.
Outputs to C:/Users/Mark Hansen/Desktop/Steam/

Assets generated:
  capsule-460x215.png      - Search result / store capsule
  library-capsule-600x900.png  - Steam library portrait
  library-hero-3840x1240.png   - Steam library wide background
  library-logo-650x248.png     - Steam library logo
  page-background-1438x810.png - Store page background
"""
import base64, json, os, sys, time
import urllib.request, urllib.error

OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "")  # set env var before running
MODEL = "openai/gpt-5.4-image-2"
OUT_DIR = r"C:\Users\Mark Hansen\Desktop\Steam"

ANTI_REQS = """
ABSOLUTE REQUIREMENTS — violating ANY of these makes the image unusable:
(1) NO text, letters, numbers, words, glyphs, runes, symbols, writing, or labels of any kind anywhere in the image.
(2) NO border, frame, outline, rounded corners, card-style edge, vignette-frame, or decorative border of any kind.
(3) NO white, grey, or solid-color padding, letterboxing, or pillarboxing around any edge.
(4) The artwork must bleed fully to all four edges with no padding whatsoever.
(5) Dark space background only — no light backgrounds, no white sky, no bright ambient light.
"""

ASSETS = [
    {
        "filename": "capsule-460x215.png",
        "size": "1792x1024",
        "prompt": f"""
Wide landscape capsule art for a sci-fi strategy card game called GALACTIC ZERO.
Composition: dramatic left-to-right confrontation across a glowing holographic battle grid floating in deep space.
Left side: a towering alien commander silhouette wreathed in dark organic tendrils (the Brood faction) facing right.
Right side: a crystalline luminous figure radiating cold blue-white light (Crystallis faction) facing left.
Center: a 5x7 glowing grid battlefield suspended in space between them, lit with purple and cyan energy lines.
Background: vast cosmic nebula in deep violet and midnight blue with thousands of tiny stars.
Lighting: dramatic rim lighting, volumetric glow from the grid, moody and cinematic.
Style: ultra-detailed sci-fi digital painting, dark atmosphere, epic scale.
{ANTI_REQS}
""",
    },
    {
        "filename": "library-capsule-600x900.png",
        "size": "1024x1792",
        "prompt": f"""
Tall vertical portrait poster art for a sci-fi strategy card game called GALACTIC ZERO.
Composition: epic vertical sci-fi movie poster style. A massive cosmic rift dominates the upper two-thirds —
swirling purple and blue galactic energy tears through dark space. Silhouettes of 5 distinct alien commanders
stand at the bottom, small against the cosmic scale: one organic and tentacled, one crystalline and geometric,
one glowing with entropic decay, one ethereal and translucent, one armored and technological.
They all face upward toward the rift. Foreground has a faintly glowing 5x7 grid on the ground between them.
The color palette is deep indigo, electric purple, cold cyan, and dark void black.
Style: cinematic sci-fi digital painting, ultra-detailed, dramatic scale contrast, moody lighting.
{ANTI_REQS}
""",
    },
    {
        "filename": "library-hero-3840x1240.png",
        "size": "1792x1024",
        "prompt": f"""
Ultra-wide panoramic hero banner art for a sci-fi strategy card game called GALACTIC ZERO.
Composition: sweeping cosmic panorama across a deep space battlefield.
A massive glowing grid battlefield (5 columns x 7 rows) is suspended horizontally across the center of the image,
glowing with purple and cyan energy lines. On either side of the grid, two opposing armies of alien silhouettes
face each other — left side: organic dark forms, crystalline shapes, glowing entities; right side: armored
mechanical forms, ethereal translucent beings, decay-wreathed figures.
Background: breathtaking cosmic nebula spanning the full width — deep purples, electric blues, gold starlight,
with a dense star field and distant galaxy arms visible.
Foreground: faint holographic card shapes drift upward from the grid.
Style: ultra-detailed cinematic sci-fi panoramic painting, epic scale, dark and majestic atmosphere.
{ANTI_REQS}
""",
    },
    {
        "filename": "library-logo-650x248.png",
        "size": "1792x1024",
        "prompt": f"""
Wide emblem / sigil art for a sci-fi strategy card game called GALACTIC ZERO.
Composition: a single powerful cosmic emblem centered in darkness. The emblem is a circular galaxy-shaped
sigil: an outer ring of 11 distinct alien faction symbols evenly spaced around a circle, each a different
glowing neon color (purple, cyan, gold, red, green, blue, orange, teal, white, violet, yellow-green).
At the center: a zero / void shape — a perfect circle of pure black space surrounded by a ring of condensed
galaxy energy, like a cosmic zero or black hole. Energy lines radiate outward from the center to each faction
symbol. The whole emblem floats against pure black space with subtle star dust.
Style: intricate sci-fi emblem design, glowing neon details, dark background, symmetrical, ultra-detailed.
{ANTI_REQS}
""",
    },
    {
        "filename": "page-background-1438x810.png",
        "size": "1792x1024",
        "prompt": f"""
Atmospheric background art for a sci-fi strategy card game store page.
Composition: a deep space environment seen from inside a vast alien space station observation deck.
The background (upper 60%) is a breathtaking view of a spiral galaxy arm — dense star clouds, glowing nebula
in purple, blue, and gold tones, swirling cosmic dust.
The foreground (lower 40%) is dark structural geometry — ancient alien architecture of stone and crystal,
faintly glowing circuitry etched into the floor, a partially visible holographic grid battlefield in the
mid-ground. The scene is moody and atmospheric, meant to sit behind store page text without competing.
Keep the center of the image relatively open and not too busy (text will overlay it).
Color palette: deep indigo, muted purple, cold blue, dark stone, faint neon accents.
Style: atmospheric sci-fi environmental concept art, moody, detailed at edges, open in center.
{ANTI_REQS}
""",
    },
]


def generate_asset(asset, key):
    out_path = os.path.join(OUT_DIR, asset["filename"])
    if os.path.exists(out_path):
        print(f"  Already exists, skipping: {asset['filename']}")
        return True

    print(f"  Generating: {asset['filename']} ({asset['size']})...")

    payload = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": asset["prompt"].strip()}],
        "size": asset["size"],
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://zero.demo.pub",
            "X-Title": "Galactic Zero Steam Assets",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()[:500]}")
        return False

    msg = body.get("choices", [{}])[0].get("message", {})
    images = msg.get("images") or []

    if not images:
        content = msg.get("content") or []
        if isinstance(content, list):
            images = [p for p in content if isinstance(p, dict) and p.get("type") == "image_url"]

    for img in images:
        url = img.get("image_url", {}).get("url", "") if isinstance(img, dict) else ""
        if url.startswith("data:image"):
            b64 = url.split(",", 1)[1]
            with open(out_path, "wb") as f:
                f.write(base64.b64decode(b64))
            print(f"  Saved: {out_path}")
            return True

    print(f"  No image in response for {asset['filename']}. Body preview:")
    print(json.dumps(body, indent=2)[:1000])
    return False


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Output: {OUT_DIR}\n")

    for i, asset in enumerate(ASSETS):
        print(f"[{i+1}/{len(ASSETS)}] {asset['filename']}")
        ok = generate_asset(asset, OPENROUTER_KEY)
        if not ok:
            print(f"  FAILED — skipping")
        if i < len(ASSETS) - 1:
            time.sleep(2)

    print("\nDone. Check your Desktop/Steam folder.")
