"""
GALACTIC ZERO — Race Avatar Generator
Square portrait-style images for each civilization
Used in: lore panel (deck select) + game board portrait area
"""
import requests, base64, os, time
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OUT_DIR = Path("C:/GitHub/nullbreach/assets/avatars")
OUT_DIR.mkdir(parents=True, exist_ok=True)

STYLE = "square format portrait, cinematic sci-fi, dramatic close-up, no text, no UI, no humans, painterly digital art, dark background, intense focal lighting."

AVATARS = [
  {"id":"terran",    "prompt": f"A Terran Accord military commander's helmet close-up — a sleek angular visor reflecting distant star fields, silver-white polished military alloy surface with blue LED accent lights along the brow, the visor completely opaque hiding any face, the helmet design communicating authority and precision. {STYLE}"},
  {"id":"crystallis","prompt": f"A Crystallis entity close-up — a crystalline geometric face-structure of interlocking quartz lattice, prismatic refractions of icy blue-white light fracturing through its faceted 'features', a central lens-like formation that functions as an eye glowing cold white, perfect symmetry, no organic tissue, pure silicon geometry. {STYLE}"},
  {"id":"mycos",     "prompt": f"A Mycos Drift presence close-up — a dense cluster of bioluminescent fungal filaments converging toward a central glowing amber-green node that functions as a collective eye, hyphal threads radiating outward like hair, the whole structure pulsing with distributed intelligence, purple-green bioluminescence. {STYLE}"},
  {"id":"veil",      "prompt": f"A Veil entity close-up — an interference pattern forming a barely-visible face shape, warm gold-white light waveforms crossing to create momentary constructive interference that suggests eyes and a forehead, the form shifting at the edges into spectral rainbow decomposition, more light than matter. {STYLE}"},
  {"id":"entropy",   "prompt": f"An Entropy Cult ceremonial mask close-up — an ancient corroded metal mask covered in centuries of oxidized amber-brown patina and copper-green corrosion, still worn with purpose, the eye-slits glowing faintly with ember light from within, the mask beautiful in its total decay. {STYLE}"},
  {"id":"brood",     "prompt": f"A Brood Sovereign close-up — enormous compound eyes filling the frame, each facet reflecting a different view of the battlefield, acid green-yellow bioluminescent glow emanating from between the eye facets, chitinous black carapace brow structure above, the intelligence visible in the multifaceted gaze. {STYLE}"},
  {"id":"void",      "prompt": f"A Void Hunter presence close-up — almost completely black, the entity defined only by the ultra-violet gravitational lensing ring tracing a vaguely head-shaped void against the faint star field behind it, two points of slightly brighter darkness suggesting eyes, maximum minimalism and dread. {STYLE}"},
  {"id":"gas",       "prompt": f"A Gas Nomad entity close-up — a self-sustaining plasma storm formation that has achieved a face-like configuration, gold-orange ionized gas swirling into eye-socket shapes with lightning discharge across the 'brow', the entire face in constant turbulent motion, no solid surface anywhere. {STYLE}"},
  {"id":"lithos",    "prompt": f"A Lithos face close-up — an ancient stone surface that has been very slowly worn by geological forces into a vaguely facial topography over billions of years, deep ochre and gray strata visible as 'features', amber rune-carvings glowing faintly where eyes would be, immovable and ancient. {STYLE}"},
  {"id":"quantum",   "prompt": f"A Quantum Thread entity close-up — three overlapping ghost-images of the same abstract face at slightly different positions and color temperatures (pink, cyan, gold), each version soft-edged and undefined, where they overlap creating white probability peaks, the 'real' face unresolvable. {STYLE}"},
  {"id":"choir",     "prompt": f"A Choir entity close-up — pure waveform visualization arranged into a face-like composition, oscilloscope traces forming eye arcs in silver-white, a standing wave interference pattern suggesting a nose and mouth in oscilloscope green, the entire face composed only of frequency visualizations on black. {STYLE}"},
]

def generate(item):
    out = OUT_DIR / f"{item['id']}.png"
    if out.exists():
        print(f"  SKIP: {item['id']}")
        return True
    print(f"  [{item['id']}]...", end=" ", flush=True)
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json",
                 "HTTP-Referer": "https://zero.demo.pub", "X-Title": "Galactic Zero"},
        json={"model": "google/gemini-2.5-flash-image",
              "messages": [{"role": "user", "content": item["prompt"]}]},
        timeout=120
    )
    if r.status_code != 200:
        print(f"FAIL {r.status_code}")
        return False
    images = r.json()["choices"][0]["message"].get("images", [])
    if images:
        url = images[0]["image_url"]["url"]
        b64 = url.split(",", 1)[1]
        out.write_bytes(base64.b64decode(b64))
        print(f"OK ({out.stat().st_size//1024}KB)")
        return True
    print("NO IMAGE")
    return False

if __name__ == "__main__":
    print(f"Generating {len(AVATARS)} race avatars...")
    ok = 0
    for i, item in enumerate(AVATARS):
        print(f"[{i+1}/{len(AVATARS)}]", end=" ")
        if generate(item): ok += 1
        if i < len(AVATARS)-1: time.sleep(2)
    print(f"\nDone: {ok}/{len(AVATARS)} — saved to {OUT_DIR}")
