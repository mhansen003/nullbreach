"""
GALACTIC ZERO — Terran Accord Card Art Generator
10 unique art pieces for the Terran starter deck
Model: google/gemini-2.5-flash-image via OpenRouter
"""
import requests, base64, os, time
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OUT_DIR = Path("C:/GitHub/nullbreach/assets/cards/terran")
OUT_DIR.mkdir(parents=True, exist_ok=True)

STYLE = (
    "cinematic sci-fi card illustration, dark void space background, "
    "painterly hard-edge rendering, subject occupies 85% of frame, "
    "dramatic volumetric lighting, no text, no numbers, no UI elements, "
    "no borders, no frames, no humans."
)

CARDS = [
  {
    "id": "colony-world",
    "prompt": f"A terraformed colony world from low orbit — the planet covered in city-grid lights visible from space on the night side, the day side showing structured continental terraforming grids in blue-green; a Terran orbital defense station visible in the near foreground, its hull panels gleaming silver-white with blue running lights, the planet curving beneath it. Military precision, human achievement, ordered power. Steel blue (#7ab8e8) and silver-white palette, blue engine glow. {STYLE}"
  },
  {
    "id": "frontier-post",
    "prompt": f"A military frontier outpost station at the edge of Terran space — a compact angular structure of silver-white hull plating and blue-lit docking modules, its defensive turrets visible as geometric protrusions, a single warship docked on one side; the station small but heavily fortified, deep void surrounding it with a distant star just visible. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "supply-hub",
    "prompt": f"A large Terran logistics hub station — a modular station built from standardized section blocks, its central ring slowly rotating for gravity, multiple docking arms extending with supply ships attached, blue-white running lights tracing its geometry; clean silver-white construction with orderly engineering precision. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "battle-group",
    "prompt": f"A Terran naval battle group in tight formation — a destroyer at center flanked by two frigates, their silver-white hulls with blue panel accent lighting, engines burning blue-white, all three ships angled slightly for dramatic perspective showing hull depth and weapons systems; disciplined military formation, deep void background. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "carrier-wing",
    "prompt": f"A Terran carrier ship deploying its fighter wing — a large flat-decked carrier vessel with an enormous flight deck, dozens of fighter craft launching in organized waves from bow launch bays, the fighters visible as small bright engine trails fanning out; silver-white carrier hull with active blue thruster array at stern, fighters trailing white-blue launch contrails. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "strike-force",
    "prompt": f"A coordinated Terran strike formation — four warships in a precise wedge attack formation, their forward weapons systems active and glowing blue-white, the formation cutting through void in a clear direction of attack; all ships showing the same silver-white hull with blue weapon charging indicators, the formation tight and purposeful. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "interceptor",
    "prompt": f"A single Terran interceptor at full burn — an extremely aerodynamic delta-wing fighter with a narrow fuselage, its forward sensor array pointed directly at the viewer from a dramatic low-angle perspective, engines burning brilliant blue-white; clean silver-white hull with minimal markings, designed entirely for speed and forward-facing firepower. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "fast-runner",
    "prompt": f"A Terran fast-attack craft built for flanking — a longer sleeker design than the interceptor, with a prominent asymmetric engine nacelle on its right side giving it lateral thrust capability, viewed from the side showing its speed silhouette; silver-white hull with a distinctive blue lateral engine streak, designed to be seen moving sideways in battle. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "flanker",
    "prompt": f"A Terran flanking interceptor viewed from a three-quarter forward angle — a swept-wing fighter with a split-nose targeting array and twin side-mounted engine pods, the design suggesting extreme lateral maneuverability; silver-white hull with blue targeting system glow at the forward sensor cluster, engine pods burning pale blue. Steel blue and silver-white palette. {STYLE}"
  },
  {
    "id": "the-accord",
    "prompt": f"The Terran Accord flagship — an impossibly large dreadnaught, its hull so long it dominates the entire frame from edge to edge, a modular command tower rising from its dorsal surface flanked by long spine-mounted weapons batteries; the ship communicates scale through a visible escort frigate barely 5% of the flagship's length visible at its bow; silver-white hull with blue command tower lighting, the vessel massive and deliberate. The subject fills the frame completely edge to edge. Steel blue and silver-white palette. {STYLE}"
  },
]

def generate(card):
    out = OUT_DIR / f"{card['id']}.png"
    if out.exists():
        print(f"  SKIP: {card['id']}")
        return True
    print(f"  [{card['id']}]...", end=" ", flush=True)
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json",
                 "HTTP-Referer": "https://zero.demo.pub", "X-Title": "Galactic Zero"},
        json={"model": "google/gemini-2.5-flash-image",
              "messages": [{"role": "user", "content": card["prompt"]}]},
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
    print(f"Generating {len(CARDS)} Terran card art pieces...")
    ok = 0
    for i, card in enumerate(CARDS):
        print(f"[{i+1}/{len(CARDS)}]", end=" ")
        if generate(card): ok += 1
        if i < len(CARDS)-1: time.sleep(2)
    print(f"\nDone: {ok}/{len(CARDS)} — saved to {OUT_DIR}")
