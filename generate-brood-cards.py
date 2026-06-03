"""
GALACTIC ZERO — Brood Sovereign Card Art Generator
9 unique card art pieces for the Brood deck
"""
import requests, base64, os, time
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OUT_DIR = Path("C:/GitHub/nullbreach/assets/cards/brood")
OUT_DIR.mkdir(parents=True, exist_ok=True)

STYLE = (
    "cinematic sci-fi card illustration, dark void space background, "
    "painterly hard-edge rendering, subject occupies 85% of frame, "
    "dramatic volumetric lighting, no text, no numbers, no UI elements, "
    "no borders, no frames, no humans. "
    "Acid green-yellow palette, deep chitinous black, bioluminescent yellow-green accents. "
    "Insectoid anatomy, chitinous exoskeleton textures, biomechanical fusion, swarm density. "
    "DO NOT include: clean metal plating, geometric structures, warm amber tones, transparent forms."
)

CARDS = [
  {
    "id": "hive-node",
    "prompt": f"A planetary surface entirely covered in vast geometric hive architecture — hexagonal cell structures built from chitinous secretion covering every continent, massive spire-towers reaching into the atmosphere, viewed from low orbit; deep black-green chitinous surface with acid yellow-green bioluminescent grid lines running between cells, the planet visibly alive and growing. {STYLE}"
  },
  {
    "id": "queen-cradle",
    "prompt": f"The birthing chamber of the Brood Sovereign — a colossal egg-shaped structure the size of a moon, its surface covered in layers of chitinous exoskeleton plates like overlapping scales, interior bioluminescent yellow-green light visible through translucent patches in the shell; deep black-green carapace with acid yellow glow from within, surrounded by smaller attendant structures. {STYLE}"
  },
  {
    "id": "brood-anchor",
    "prompt": f"A massive chitinous anchor structure in space — a tangle of enormous organic tubes and struts made from hardened Brood secretion, connecting multiple hive-nodes like a space station grown rather than built; acid green bioluminescent light pulsing through the tube network, deep black carapace surface with yellow-green edge highlights. {STYLE}"
  },
  {
    "id": "warrior-cluster",
    "prompt": f"A formation of hundreds of Brood soldier-ships flying in perfect synchronized formation — each ship a single warrior-organism, their individual forms suggesting insects fused at the joints to form a super-organism shape; acid green-yellow bioluminescent markings across their black chitinous hulls, the formation creating an intimidating silhouette. {STYLE}"
  },
  {
    "id": "soldier-mass",
    "prompt": f"A single large Brood warship grown from fused soldier bodies — a biomechanical vessel whose hull is literally composed of thousands of armored Brood forms merged together, their individual limbs and carapace plates becoming hull panels and weapons; deep black-green biomechanical surface with yellow-green bioluminescent lines running between the fused bodies. {STYLE}"
  },
  {
    "id": "biomech-fleet",
    "prompt": f"Three Brood capital ships in close formation, each vessel shaped like an enormous flat-bodied insect — wide chitinous dorsal shell, multiple articulated hull-limbs extending laterally, compound visual-sensor arrays along the forward edge; deep black carapace with acid yellow-green bioluminescent crew-glow from ventral surface, flying in echelon formation. {STYLE}"
  },
  {
    "id": "skimmer",
    "prompt": f"A Brood fast-attack organism — a single long narrow insectoid fighter, its body like a dragonfly but in black chitinous armor plating, extremely fast-looking silhouette with swept compound wings locked back in a speed posture; acid yellow-green bioluminescent engine-glands at its rear thorax, forward claws extended, motion blur behind it. {STYLE}"
  },
  {
    "id": "void-skimmer",
    "prompt": f"An ambush-specialist Brood organism — broader and flatter than the standard Skimmer, adapted for concealment with a dorsal surface that absorbs light and a ventral surface covered in active bioluminescent camouflage patterns; mostly dark and hard to see, with acid green bioluminescent patterns suddenly visible as it activates for attack. {STYLE}"
  },
  {
    "id": "the-sovereign",
    "prompt": f"The Queen herself — an enormous insectoid entity the size of a dreadnaught, her body an evolved architectural form of layered chitinous plates covering a massive biomechanical thorax and abdomen, attended by swarms of smaller warriors visible as a seething halo around her; deep black carapace with acid green-yellow bioluminescent throne-markings, her compound eyes the most intensely illuminated feature — multiple and vast; overwhelming sense of biological authority. Subject fills frame completely. {STYLE}"
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
        out.write_bytes(base64.b64decode(url.split(",", 1)[1]))
        print(f"OK ({out.stat().st_size//1024}KB)")
        return True
    print("NO IMAGE")
    return False

if __name__ == "__main__":
    print(f"Generating {len(CARDS)} Brood Sovereign card art pieces...")
    ok = 0
    for i, card in enumerate(CARDS):
        print(f"[{i+1}/{len(CARDS)}]", end=" ")
        if generate(card): ok += 1
        if i < len(CARDS)-1: time.sleep(2)
    print(f"\nDone: {ok}/{len(CARDS)} — saved to {OUT_DIR}")
