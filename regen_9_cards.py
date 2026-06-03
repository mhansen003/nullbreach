import os
import base64
import json
import urllib.request
import urllib.error
import time

def _load_env(path):
    env = {}
    try:
        with open(path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    except Exception:
        pass
    return env

_env = _load_env(r"C:\GitHub\the-claude-father\.env")
API_KEY = _env.get("OPENROUTER_API_KEY", os.environ.get("OPENROUTER_API_KEY", ""))
MODEL = "google/gemini-2.5-flash-image"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

PRIMARY_BASE = r"C:\GitHub\nullbreach\assets\cards"
DESKTOP_BASE = r"C:\Users\Mark Hansen\Desktop\new-race-cards"

SUFFIX = "Pure black deep space background. ABSOLUTELY NO white borders, NO white frames, NO white edges, NO light backgrounds. The image fills edge to edge with darkness."

def generate_image(prompt, out_path_primary, out_path_desktop):
    full_prompt = prompt + " " + SUFFIX
    print(f"\n  GENERATING: {os.path.basename(out_path_primary)}")
    print(f"    Prompt: {full_prompt[:100]}...")

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": full_prompt}],
        "modalities": ["image", "text"]
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/nullbreach",
            "X-Title": "GALACTIC ZERO Card Art"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ERROR HTTP {e.code}: {body[:400]}")
        return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False

    img_data = None
    choices = result.get("choices", [])
    if choices:
        msg = choices[0].get("message", {})
        images = msg.get("images", [])
        if isinstance(images, list) and images:
            img_entry = images[0]
            if isinstance(img_entry, dict):
                url_obj = img_entry.get("image_url", {})
                url = url_obj.get("url", "") if isinstance(url_obj, dict) else (url_obj if isinstance(url_obj, str) else "")
                if url.startswith("data:"):
                    img_data = base64.b64decode(url.split(",", 1)[1])
            elif isinstance(img_entry, str) and img_entry.startswith("data:"):
                img_data = base64.b64decode(img_entry.split(",", 1)[1])
        if img_data is None:
            content = msg.get("content", "")
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "image_url":
                        url = part.get("image_url", {}).get("url", "")
                        if url.startswith("data:"):
                            img_data = base64.b64decode(url.split(",", 1)[1])
                            break

    if img_data is None:
        print(f"  ERROR: No image in response. Keys: {list(result.keys())}")
        if choices:
            print(f"  Message keys: {list(choices[0].get('message', {}).keys())}")
            print(f"  Full response snippet: {json.dumps(result)[:500]}")
        return False

    os.makedirs(os.path.dirname(out_path_primary), exist_ok=True)
    os.makedirs(os.path.dirname(out_path_desktop), exist_ok=True)

    with open(out_path_primary, "wb") as f:
        f.write(img_data)
    with open(out_path_desktop, "wb") as f:
        f.write(img_data)

    size_kb = len(img_data) // 1024
    print(f"  SAVED: {size_kb} KB")
    print(f"    -> {out_path_primary}")
    print(f"    -> {out_path_desktop}")
    return True


def card(race, filename, prompt):
    p1 = os.path.join(PRIMARY_BASE, race, filename)
    p2 = os.path.join(DESKTOP_BASE, race, filename)
    return generate_image(prompt, p1, p2)


CARDS = [
    ("gas", "t1_b.png",
     "GALACTIC ZERO sci-fi card art. PLASMA NODE. A small golden plasma storm-cell entity floating in deep black space. Swirling plasma gas ball with electric sparks, yellow and gold ionic energy. Portrait orientation 512x680 fills frame completely. No text, no UI elements."),

    ("gas", "extra_a.png",
     "GALACTIC ZERO sci-fi card art. ION NODE. A compact golden ion storm cloud with more elongated crescent shape, different from a sphere. Golden yellow ionic energy with crackling arcs. Deep black space. Portrait orientation 512x680 fills frame. No text."),

    ("entropy", "t2_b.png",
     "GALACTIC ZERO sci-fi card art. RUST WING. A large rusted mechanical warship with spread wings and panels, copper and rust brown tones, visible gear mechanisms and decay. Steampunk aesthetic, mechanical entropy theme. Portrait orientation 512x680. No text. DEEP DARK BROWN-BLACK background only."),

    ("quantum", "t2_b.png",
     "GALACTIC ZERO sci-fi card art. QUBIT WING. A superposed quantum structure appearing in two places simultaneously, prismatic interference rings, teal and violet energy patterns, quantum mechanics visual theme. Portrait orientation 512x680 fills frame. No text."),

    ("quantum", "t3_a.png",
     "GALACTIC ZERO sci-fi card art. WAVEFORM LANCE. A quantum lance weapon in superposition, multiple overlapping waveform blades existing simultaneously, prismatic teal and violet energy collapse effect. Portrait orientation 512x680 fills frame. No text."),

    ("choir", "t1_c.png",
     "GALACTIC ZERO sci-fi card art. SONIC ANCHOR. A small crystalline resonance node structure emitting concentric sound wave rings outward in all directions. Blue and teal crystalline energy, sonic wave visualization. Portrait orientation 512x680 fills frame. No text. Dark background only, bright waves acceptable."),

    ("choir", "t2_a.png",
     "GALACTIC ZERO sci-fi card art. RESONANCE CHOIR. A larger choir resonance ship or structure with Y-shaped or arc form, multiple sound wave emitters radiating visible sonic waves. Blue-white energy on pure black space. Portrait orientation 512x680 fills frame. No text."),

    ("choir", "t2_c.png",
     "GALACTIC ZERO sci-fi card art. SONIC MASS. A dense mass of interlocked sound wave crystalline structures in flanker formation, blue-white crystalline sonic energy lattice. Portrait orientation 512x680 fills frame. No text."),

    ("choir", "t3_b.png",
     "GALACTIC ZERO sci-fi card art. TONE STRIKER. An elegant crystalline sonic lance in flanker position, striking with a sonic wave trail behind it, blue-white crystal structure. Portrait orientation 512x680 fills frame. No text."),
]

print("=== GALACTIC ZERO: Regenerating 9 cards with no-white-border prompts ===")

for i, (race, filename, prompt) in enumerate(CARDS):
    if i > 0:
        time.sleep(3)
    print(f"\n[{i+1}/9] {race}/{filename}")
    card(race, filename, prompt)

print("\n=== ALL 9 DONE ===")
