"""
GALACTIC ZERO — Art Generator
Generates splash background + 11 race deck covers via OpenRouter Nano Banana
"""
import requests, json, base64, os, time
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1"
OUT_DIR  = Path(__file__).parent / "assets"
OUT_DIR.mkdir(exist_ok=True)

MODEL = "google/gemini-2.5-flash-image"

STYLE = (
    "cinematic sci-fi digital painting, dramatic volumetric lighting, "
    "dark space background, painterly hard-edge rendering, "
    "no text, no UI elements, no humans."
)

# ── IMAGE PROMPTS ─────────────────────────────────────────────────
IMAGES = [

  # 0 — Splash background (wide 16:9)
  {
    "id":   "splash",
    "size": "1792x1024",
    "prompt": (
      "Epic cinematic view of the galactic core from just above the galactic plane — "
      "a blazing white-gold spiral galaxy center surrounded by dense nebula clouds in deep "
      "purple and blue, millions of stars visible, spiral arms sweeping outward from the "
      "brilliant core, volumetric god-rays emanating from the center; "
      "in the extreme foreground barely visible a subtle geometric 5x5 grid of dim teal lines "
      "marks a strategic sector at the convergence point. "
      "Deep black space at frame edges fading to the brilliant galactic core. "
      + STYLE
    )
  },

  # 1 — Terran Accord
  {
    "id":   "deck_terran",
    "size": "768x1024",
    "prompt": (
      "A vast Terran Accord fleet in high orbit above a gleaming colony world — "
      "a dreadnaught flagship filling the upper third of the frame, its silver-white hull "
      "panels reflecting starlight, smaller destroyers and frigates arranged in disciplined "
      "formation below it; the blue-green colony planet curves across the bottom of the frame, "
      "city lights visible on the night-side terminator; steel blue thruster exhausts trace "
      "clean arcs against the black void. Military precision, human achievement, ordered power. "
      + STYLE
    )
  },

  # 2 — The Crystallis
  {
    "id":   "deck_crystallis",
    "size": "768x1024",
    "prompt": (
      "An enormous crystalline structure floating in deep space — a vast silicon lattice "
      "formation spanning the entire frame, towering geometric crystal spires of icy blue-white "
      "interlocked in perfect mathematical precision, prismatic light refracting through "
      "translucent facets into razor beams of spectral color; cold hard starlight from a distant "
      "sun casts sharp geometric shadows across every surface; a crystalline dreadnaught-scale "
      "vessel emerges from the formation's lower structure, indistinguishable from the lattice "
      "itself. Icy blue-white and silver palette, prismatic internal glow, no organic forms. "
      + STYLE
    )
  },

  # 3 — The Mycos Drift
  {
    "id":   "deck_mycos",
    "size": "768x1024",
    "prompt": (
      "A vast fungal intelligence spanning deep space — enormous bioluminescent mycelium "
      "networks visible as glowing purple-green filament threads connecting multiple bloom "
      "worlds, spore clouds drifting between them like nebulae; the largest bloom world "
      "dominates the center, its surface entirely covered in glowing hyphal networks visible "
      "from orbit, fruiting bodies rising like mountain ranges; amber spore rivers flow off "
      "its edges into the void. No geometric structure, pure organic expansion. "
      "Bioluminescent purple-green, deep violet void, amber spore glow. "
      + STYLE
    )
  },

  # 4 — The Veil
  {
    "id":   "deck_veil",
    "size": "768x1024",
    "prompt": (
      "Pure light beings visible only as interference — a massive convergence of coherent "
      "light entities creating complex waveform interference patterns across the entire frame; "
      "dozens of lens-halo forms overlapping, each a teardrop of gold-white coherent light "
      "radiating spectral interference rings; where they overlap the interference creates "
      "blinding white peaks and dark destructive nulls; the composition suggests an enormous "
      "fleet but shows only light and its patterns. "
      "Warm gold-white dominant, spectral rainbow at interference edges, deep black void. "
      + STYLE
    )
  },

  # 5 — The Entropy Cult
  {
    "id":   "deck_entropy",
    "size": "768x1024",
    "prompt": (
      "A dying red giant star mid-collapse surrounded by its ancient corroded fleet — "
      "the star's outer layers fragmenting into long amber-orange filaments, its shrinking "
      "core still blazing; a vast armada of corroded warships orbits in silhouette, their "
      "hulls entirely consumed by centuries of oxidation into beautiful amber-brown rust "
      "patina and copper-green corrosion blooms, yet still flying with absolute purpose; "
      "ember glow from their still-functional engines the only artificial light "
      "in an otherwise decaying scene. Gorgeous and terminal. "
      "Amber-orange palette, corroded copper-green, rust red, ember glow. "
      + STYLE
    )
  },

  # 6 — The Brood Sovereign
  {
    "id":   "deck_brood",
    "size": "768x1024",
    "prompt": (
      "The Brood Sovereign herself filling the frame — an insectoid entity the size of a "
      "dreadnaught, her body an evolved architectural form of layered chitinous plates, "
      "her compound eyes vast and multiple and blazing with acid yellow-green bioluminescent "
      "light; thousands of warrior-organisms form a seething halo around her, their individual "
      "forms suggesting insects but too numerous to resolve individually; her carapace is "
      "deep black with acid green bioluminescent throne-markings tracing every major "
      "structural plate. Biological authority, overwhelming scale. "
      "Acid green-yellow, deep chitinous black, bioluminescent yellow-green. "
      + STYLE
    )
  },

  # 7 — The Void Hunters
  {
    "id":   "deck_void",
    "size": "768x1024",
    "prompt": (
      "Near-total darkness — the Void Hunter fleet visible only as dark silhouettes "
      "passing in front of the Milky Way galactic plane; enormous angular predator forms "
      "occluding thousands of background stars, their presence felt more than seen; "
      "ultra-violet gravitational lensing traces the edges of the largest vessel in the "
      "center, a barely-visible ring of bent light the only indicator of its colossal scale; "
      "the image is almost entirely black with the violet edge-glow the only visual content. "
      "Maximum minimalism. Near total darkness, ultra-violet edge shimmer only. "
      + STYLE
    )
  },

  # 8 — The Gas Nomads
  {
    "id":   "deck_gas",
    "size": "768x1024",
    "prompt": (
      "A weaponized gas giant storm filling the entire frame — a planet-scale hurricane "
      "viewed from directly above, its spiral storm bands in deep gold-orange sweeping "
      "into a central eye blazing with concentrated plasma energy; multiple directed plasma "
      "jets extend from the eye in cardinal directions as weapons of planetary scale; "
      "electric yellow-white lightning discharge covers every storm band; the entire "
      "atmosphere is a single unified storm-organism alive with purpose. "
      "Electric gold-yellow dominant, deep orange plasma, electric blue lightning. "
      + STYLE
    )
  },

  # 9 — The Lithos
  {
    "id":   "deck_lithos",
    "size": "768x1024",
    "prompt": (
      "The Unmoved — an ancient stone dreadnaught so massive it fills the entire frame, "
      "a perfect sphere of the densest rock in the galaxy, its surface entirely covered "
      "in amber rune-carvings placed over billions of years, the rune network glowing "
      "faintly across every surface; geological strata visible in the rock, billions "
      "of years of compression in every visible layer; smaller stone vessels drift "
      "nearby, dwarfed by the central mass; deep void surrounds it. "
      "It has never moved. Nothing has ever moved it. "
      "Deep stone gray-brown, ancient ochre, amber rune glow. "
      + STYLE
    )
  },

  # 10 — The Quantum Thread
  {
    "id":   "deck_quantum",
    "size": "768x1024",
    "prompt": (
      "A Quantum Thread fleet in superposition — multiple overlapping ghost-images of "
      "the same armada at slightly different positions, each rendered at different opacity "
      "suggesting different probability of being real; three complete versions of the fleet "
      "overlap in pink, cyan, and gold tones, their edges soft and undefined; where "
      "all three overlap creates blinding white probability peaks; the background shows "
      "distorted star positions from the quantum uncertainty field radiating outward. "
      "Multiple simultaneous realities, beautiful and unresolvable. "
      "Probability pink, shifting cyan-teal, gold, multiple-exposure ghost layers. "
      + STYLE
    )
  },

  # 11 — The Choir
  {
    "id":   "deck_choir",
    "size": "768x1024",
    "prompt": (
      "The Dissonance — a catastrophic resonance event filling the entire frame with "
      "pure waveform visualization; all frequencies simultaneously present, their combined "
      "waveform creating a dense wall of interference approaching pure white at center; "
      "visible harmonic structure in the outer regions — organized silver-white wave "
      "patterns in the corners giving way to oscilloscope-green frequency chaos approaching "
      "the blinding center overload zone; mathematical beauty at the edge of destruction; "
      "no physical objects — only waveforms, frequencies, resonance patterns. "
      "Silver-white, oscilloscope green, frequency spectrum gradients. "
      + STYLE
    )
  },

]

# ── GENERATE ──────────────────────────────────────────────────────
def generate(item):
    out_path = OUT_DIR / f"{item['id']}.png"
    if out_path.exists():
        print(f"  SKIP (exists): {item['id']}")
        return True

    print(f"  Generating: {item['id']} ({item['size']}) ...", end=" ", flush=True)

    # Image models return image in message.images[], not message.content
    r = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://galacticzero.vercel.app",
            "X-Title": "Galactic Zero"
        },
        json={
            "model": MODEL,
            "messages": [{"role": "user", "content": item["prompt"]}]
        },
        timeout=120
    )

    if r.status_code != 200:
        print(f"FAILED {r.status_code}: {r.text[:200]}")
        return False

    data = r.json()
    try:
        msg = data["choices"][0]["message"]

        # Primary: images array with data URI
        images = msg.get("images") or []
        if images:
            url = images[0]["image_url"]["url"]
            if url.startswith("data:"):
                b64 = url.split(",", 1)[1]
                out_path.write_bytes(base64.b64decode(b64))
                print(f"SAVED ({out_path.stat().st_size // 1024}KB)")
                return True
            else:
                img_r = requests.get(url, timeout=60)
                out_path.write_bytes(img_r.content)
                print(f"SAVED from URL ({len(img_r.content)//1024}KB)")
                return True

        # Fallback: base64 in content string
        content = msg.get("content") or ""
        if "base64," in content:
            b64 = content.split("base64,", 1)[1].split('"')[0]
            out_path.write_bytes(base64.b64decode(b64))
            print(f"SAVED from content ({out_path.stat().st_size//1024}KB)")
            return True

        print(f"NO IMAGE in response — content: {str(content)[:100]}")
        return False

    except (KeyError, IndexError) as e:
        print(f"PARSE ERROR: {e} — {json.dumps(data)[:200]}")
        return False


if __name__ == "__main__":
    print(f"\nGALACTIC ZERO — Art Generation\n{'='*50}")
    print(f"Model:  {MODEL}")
    print(f"Output: {OUT_DIR}")
    print(f"Images: {len(IMAGES)}\n")

    success = 0
    for i, item in enumerate(IMAGES):
        print(f"[{i+1}/{len(IMAGES)}] {item['id']}")
        if generate(item):
            success += 1
        if i < len(IMAGES) - 1:
            time.sleep(2)  # brief pause between calls

    print(f"\n{'='*50}")
    print(f"Done: {success}/{len(IMAGES)} images generated")
    print(f"Assets saved to: {OUT_DIR}")
