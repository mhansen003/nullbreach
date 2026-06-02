"""
GALACTIC ZERO — Lore Background Generator
Wide atmospheric environment shots (16:9) for each race's lore panel
"""
import requests, json, base64, os, time
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1"
MODEL    = "google/gemini-2.5-flash-image"
OUT_DIR  = Path("C:/GitHub/nullbreach/assets")

STYLE = "cinematic wide angle sci-fi environment, dramatic atmospheric lighting, no text, no UI, no humans, painterly digital art, dark space mood."

IMAGES = [
  {"id":"lore_terran",    "prompt": f"Interior of a massive Terran Accord command station — vast curved screens displaying star charts and fleet formations, banks of control consoles glowing steel blue in a darkened chamber, clean angular architecture, multiple levels visible above, the scale overwhelming; steel blue and white lighting, no crew visible, only the technology. {STYLE}"},
  {"id":"lore_crystallis","prompt": f"Inside a vast crystalline void cavern in deep space — towering quartz spire formations rise from below and above, walls made entirely of interlocking crystal lattice, prismatic light fracturing in every direction creating rainbow corridors; icy blue-white palette, hard edge geometric shadows, a sense of infinite cold precision. {STYLE}"},
  {"id":"lore_mycos",     "prompt": f"Floating through a vast bioluminescent fungal network in space — enormous mycelium tendrils the width of rivers converging toward a glowing amber-green nexus node, spore particles drifting like snow, the perspective of being inside the organism looking toward the center; purple-green bioluminescent light, amber center glow, organic and vast. {STYLE}"},
  {"id":"lore_veil",      "prompt": f"Standing inside a corridor made entirely of coherent light interference — walls, floor, and ceiling formed from standing wave patterns in warm gold-white, the corridor stretching to infinity with perfect waveform geometry repeating endlessly, spectral rainbow banding where wave crests meet; warm gold and white, translucent, ethereal architectural space of light. {STYLE}"},
  {"id":"lore_entropy",   "prompt": f"Inside the ancient engine room of an Entropy Cult dreadnaught — impossibly vast corroded machinery still functioning, enormous rusted turbines slowly turning, steam and ember glow escaping from corrosion fractures in the hull, layers of oxidized patina building geological depth on every surface; amber-brown rust, copper-green corrosion, ember glow from cracks. {STYLE}"},
  {"id":"lore_brood",     "prompt": f"Deep inside a Brood Sovereign hive chamber — walls and ceiling formed from compacted Brood bodies creating hexagonal cell structures, acid green bioluminescent veins running between cells, the chamber stretching far in all directions with nested levels visible through openings, organic biomechanical architecture; deep black carapace with acid yellow-green bioluminescent lighting throughout. {STYLE}"},
  {"id":"lore_void",      "prompt": f"The intergalactic void between galaxy clusters — near total darkness with only the faintest suggestion of vast Void Hunter shapes occluding the distant galaxy wall behind them, a horizon of ultra-violet gravitational lensing tracing forms that are otherwise invisible, the overwhelming emptiness of the true dark; almost completely black, ultra-violet edge traces, barely visible forms, extreme minimalism. {STYLE}"},
  {"id":"lore_gas",       "prompt": f"Inside the eye of a planet-scale plasma storm — looking upward through the calm center of the hurricane toward a gold-white plasma sky, massive storm walls spiraling upward on all sides, electric lightning discharge running horizontally across the cloud walls, the atmosphere itself alive with energy; gold-orange plasma bands, electric yellow-white lightning, deep purple storm base. {STYLE}"},
  {"id":"lore_lithos",    "prompt": f"The surface of an ancient Lithos world — a vast cliff face of exposed geological strata stretching across the frame, billions of years of rock compression visible as horizontal bands of ochre and gray, amber rune-carvings glowing faintly where they were placed across the face over eons, a starfield visible above the cliff edge; deep stone gray-brown, ancient ochre strata, amber rune glow, cold starlight. {STYLE}"},
  {"id":"lore_quantum",   "prompt": f"A Quantum Thread space corridor in superposition — the same corridor photographed from the same position in three different quantum states simultaneously, each version slightly offset and rendered in different hues (pink, cyan, gold), the overlapping creates impossible geometry where probability peaks form bright white intersections; multiple-exposure aesthetic, pink-cyan-gold overlay layers, soft undefined edges, beautiful uncertainty. {STYLE}"},
  {"id":"lore_choir",     "prompt": f"A Choir resonance chamber — an architectural space defined entirely by waveform geometry, its walls and vault formed from three-dimensional standing wave patterns in silver-white, oscilloscope-green nodal lines tracing structural arches, the space widening into a vast nave where multiple frequency waves constructively interfere creating a blinding white altar-point at the far end; silver-white waveform architecture, oscilloscope green structural lines, pure frequency space. {STYLE}"},
]

def generate(item):
    out = OUT_DIR / f"{item['id']}.png"
    if out.exists():
        print(f"  SKIP: {item['id']}")
        return True
    print(f"  [{item['id']}]...", end=" ", flush=True)
    r = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json",
                 "HTTP-Referer": "https://zero.demo.pub", "X-Title": "Galactic Zero"},
        json={"model": MODEL, "messages": [{"role":"user","content":item["prompt"]}]},
        timeout=120
    )
    if r.status_code != 200:
        print(f"FAIL {r.status_code}")
        return False
    data = r.json()
    images = data["choices"][0]["message"].get("images", [])
    if images:
        url = images[0]["image_url"]["url"]
        b64 = url.split(",", 1)[1]
        out.write_bytes(base64.b64decode(b64))
        print(f"OK ({out.stat().st_size//1024}KB)")
        return True
    print("NO IMAGE")
    return False

if __name__ == "__main__":
    print(f"Generating {len(IMAGES)} lore backgrounds...")
    ok = 0
    for i, item in enumerate(IMAGES):
        print(f"[{i+1}/{len(IMAGES)}]", end=" ")
        if generate(item): ok += 1
        if i < len(IMAGES)-1: time.sleep(2)
    print(f"\nDone: {ok}/{len(IMAGES)}")
