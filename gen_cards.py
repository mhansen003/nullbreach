import os
import sys
import base64
import json
import urllib.request
import urllib.error
import time

# Load API key from .env file
def load_env(path):
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

_env = load_env(r"C:\GitHub\the-claude-father\.env")
API_KEY = _env.get("OPENROUTER_API_KEY", os.environ.get("OPENROUTER_API_KEY", ""))
MODEL = "google/gemini-2.5-flash-image"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

PRIMARY_BASE = r"C:\GitHub\nullbreach\assets\cards"
DESKTOP_BASE = r"C:\Users\Mark Hansen\Desktop\new-race-cards"

def generate_image(prompt, out_path_primary, out_path_desktop, overwrite=False):
    # Check if file exists and skip if not overwriting
    if not overwrite and os.path.exists(out_path_primary):
        print(f"  SKIP (exists): {out_path_primary}")
        return True

    print(f"  GENERATING: {os.path.basename(out_path_primary)}")
    print(f"    Prompt: {prompt[:80]}...")

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
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
        print(f"  ERROR HTTP {e.code}: {body[:300]}")
        return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False

    # Extract image from response
    # OpenRouter gemini-2.5-flash-image returns images in message.images[]
    img_data = None
    choices = result.get("choices", [])
    if choices:
        msg = choices[0].get("message", {})
        # Primary path: images field
        images = msg.get("images", [])
        if isinstance(images, list) and images:
            img_entry = images[0]
            if isinstance(img_entry, dict):
                url_obj = img_entry.get("image_url", {})
                if isinstance(url_obj, dict):
                    url = url_obj.get("url", "")
                elif isinstance(url_obj, str):
                    url = url_obj
                else:
                    url = ""
                if url.startswith("data:"):
                    b64 = url.split(",", 1)[1]
                    img_data = base64.b64decode(b64)
            elif isinstance(img_entry, str) and img_entry.startswith("data:"):
                b64 = img_entry.split(",", 1)[1]
                img_data = base64.b64decode(b64)
        # Fallback: content list
        if img_data is None:
            content = msg.get("content", "")
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "image_url":
                        url = part.get("image_url", {}).get("url", "")
                        if url.startswith("data:"):
                            b64 = url.split(",", 1)[1]
                            img_data = base64.b64decode(b64)
                            break

    if img_data is None:
        print(f"  ERROR: No image in response. Keys: {list(result.keys())}")
        if choices:
            msg = choices[0].get("message", {})
            print(f"  Message keys: {list(msg.keys())}")
        return False

    # Save to both locations
    os.makedirs(os.path.dirname(out_path_primary), exist_ok=True)
    os.makedirs(os.path.dirname(out_path_desktop), exist_ok=True)

    with open(out_path_primary, "wb") as f:
        f.write(img_data)
    with open(out_path_desktop, "wb") as f:
        f.write(img_data)

    size_kb = len(img_data) // 1024
    print(f"  SAVED: {size_kb}KB -> {out_path_primary}")
    return True


def card(race, filename, prompt, overwrite=False):
    p1 = os.path.join(PRIMARY_BASE, race, filename)
    p2 = os.path.join(DESKTOP_BASE, race, filename)
    return generate_image(prompt, p1, p2, overwrite=overwrite)


# ============================================================
# TASK 1: Regenerate 3 Gas cards
# ============================================================
print("\n=== TASK 1: Gas card regenerations ===")

time.sleep(1)
card("gas", "t1_b.png",
     "small compact golden plasma node, sphere of contained ionic energy, minimal lightning tendrils, sci-fi card art, dark space background, NOT a swirl, more like a contained glowing egg or core, portrait orientation fills frame, no text",
     overwrite=True)

time.sleep(2)
card("gas", "extra.png",
     "elongated plasma wing or crescent shape, golden-yellow energy with trailing sparks, like a flying plasma creature, sci-fi card art, dark background, portrait orientation fills frame, NOT a spiral or orb, no text",
     overwrite=True)

time.sleep(2)
card("gas", "t4.png",
     "massive planetary hurricane seen from above, enormous spiral storm system, golden plasma filling a planet's atmosphere, lightning visible across the entire storm system, ships silhouetted at the edges being pulled in, overwhelming scale, sci-fi card art, dark space background, portrait orientation fills frame, no text",
     overwrite=True)

# ============================================================
# TASK 2: Lithos missing cards
# ============================================================
print("\n=== TASK 2: Lithos cards ===")

time.sleep(2)
card("lithos", "t3_a.png",
     "massive seismic lance weapon made of floating stone shards, ancient geological weapon, amber glow between the stones, sci-fi card art, dark background, portrait fills frame, no text")

time.sleep(2)
card("lithos", "t3_b.png",
     "stone quake striker, angular obsidian plates forming a hammer-like weapon, golden geological energy, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("lithos", "t3_c.png",
     "basalt mass formation, cluster of sharp volcanic rock spires with amber energy veins, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("lithos", "t4.png",
     "THE MONOLITH enormous floating stone fortress, ancient geological titan, massive layered stone platform with amber glowing cracks running through it, overwhelming size, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("lithos", "extra_a.png",
     "small stone anchor node, a smooth river-stone glowing faintly amber, simple, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("lithos", "extra_b.png",
     "geological quake wing, flat layered stone plate with energy running along the edges, sci-fi card art, portrait fills frame, no text")

# ============================================================
# TASK 3: Quantum cards (all new)
# ============================================================
print("\n=== TASK 3: Quantum cards ===")

quantum_t1_variations = [
    "quantum probability seed, small spectral orb showing multiple superposed states simultaneously, pink-violet quantum glow, prismatic rainbow interference concentric rings pattern, sci-fi card art, portrait fills frame, no text",
    "quantum probability seed, small spectral orb showing multiple superposed states simultaneously, pink-violet quantum glow, prismatic rainbow interference zigzag wave pattern, sci-fi card art, portrait fills frame, no text",
    "quantum probability seed, small spectral orb showing multiple superposed states simultaneously, pink-violet quantum glow, prismatic rainbow interference diamond lattice pattern, sci-fi card art, portrait fills frame, no text",
    "quantum probability seed, small spectral orb showing multiple superposed states simultaneously, pink-violet quantum glow, prismatic rainbow interference spiral arms pattern, sci-fi card art, portrait fills frame, no text",
    "quantum probability seed, small spectral orb showing multiple superposed states simultaneously, pink-violet quantum glow, prismatic rainbow interference hexagonal fractal pattern, sci-fi card art, portrait fills frame, no text",
]

for i, prompt in enumerate(quantum_t1_variations, 1):
    time.sleep(2)
    card("quantum", f"t1_{chr(96+i)}.png", prompt)

quantum_t2_variations = [
    "quantum thread weaver unit, double helix entangled energy streams in pink and spectral colors, complex interference pattern, sci-fi card art, portrait fills frame, no text",
    "quantum thread weaver unit, branching probability tree in pink and spectral colors, complex interference pattern, sci-fi card art, portrait fills frame, no text",
    "quantum thread weaver unit, quantum tunnel ring portal in pink and spectral colors, complex interference pattern, sci-fi card art, portrait fills frame, no text",
]

for i, prompt in enumerate(quantum_t2_variations, 1):
    time.sleep(2)
    card("quantum", f"t2_{chr(96+i)}.png", prompt)

time.sleep(2)
card("quantum", "t3_a.png",
     "quantum assassin blade made of probability waves, sharp angular energy construct that exists in multiple places at once, spectral and pink, multiple ghost images showing superposition, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("quantum", "t3_b.png",
     "quantum assassin blade made of probability waves, sharp angular energy construct that exists in multiple places at once, spectral and pink, splitting into parallel quantum states, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("quantum", "t4.png",
     "THE QUANTUM THREAD flagship enormous superposed mega-structure existing in multiple quantum states simultaneously, prismatic rainbow energy, overwhelming probability cascade, multiple overlapping ghostly ship forms, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("quantum", "extra_a.png",
     "quantum probability seed with slightly more complexity, medium spectral orb showing superposed states, pink-violet quantum glow, intricate prismatic rainbow interference patterns radiating outward, sci-fi card art, portrait fills frame, no text")

# ============================================================
# TASK 4: Choir cards (all new)
# ============================================================
print("\n=== TASK 4: Choir cards ===")

choir_t1_variations = [
    "resonant frequency seed, standing sound wave visualized as glowing blue-white energy rings arranged in concentric circles, harmonic interference pattern, sci-fi card art, dark background, portrait fills frame, no text",
    "resonant frequency seed, standing sound wave visualized as glowing blue-white energy in parallel wave crests, harmonic interference pattern, sci-fi card art, dark background, portrait fills frame, no text",
    "resonant frequency seed, standing sound wave visualized as glowing blue-white energy in radiating spoke pattern, harmonic interference pattern, sci-fi card art, dark background, portrait fills frame, no text",
    "resonant frequency seed, standing sound wave visualized as glowing blue-white energy in Lissajous figure shape, harmonic interference pattern, sci-fi card art, dark background, portrait fills frame, no text",
    "resonant frequency seed, standing sound wave visualized as glowing blue-white energy in figure-eight resonance, harmonic interference pattern, sci-fi card art, dark background, portrait fills frame, no text",
]

for i, prompt in enumerate(choir_t1_variations, 1):
    time.sleep(2)
    card("choir", f"t1_{chr(96+i)}.png", prompt)

choir_t2_variations = [
    "choir resonance wave unit, multiple interlocking sound wave arcs in blue-white forming a shield shape, complex harmonic structure, sci-fi card art, portrait fills frame, no text",
    "choir resonance wave unit, multiple interlocking sound wave arcs in blue-white forming a vortex column, complex harmonic structure, sci-fi card art, portrait fills frame, no text",
    "choir resonance wave unit, multiple interlocking sound wave arcs in blue-white forming overlapping interference nodes, complex harmonic structure, sci-fi card art, portrait fills frame, no text",
]

for i, prompt in enumerate(choir_t2_variations, 1):
    time.sleep(2)
    card("choir", f"t2_{chr(96+i)}.png", prompt)

time.sleep(2)
card("choir", "t3_a.png",
     "resonant shard, sharp crystalline sound waves forming a blade-like structure pointing upward, intense blue-white glow, high-frequency vibration visible around edges, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("choir", "t3_b.png",
     "resonant shard, sharp crystalline sound waves forming a jagged multi-blade structure, intense blue-white glow, standing wave interference visible between blades, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("choir", "t4.png",
     "THE CHOIR flagship massive resonance structure, planet-scale standing wave that shatters reality, overwhelming blue-white harmonic energy, continent-sized wave fronts colliding, shattered crystal fragments orbiting the core, sci-fi card art, portrait fills frame, no text")

time.sleep(2)
card("choir", "extra_a.png",
     "resonant frequency seed similar to T1, standing sound wave visualized as glowing blue-white energy rings with slightly added complexity, harmonic interference pattern with inner and outer resonance bands, sci-fi card art, dark background, portrait fills frame, no text")

print("\n=== ALL DONE ===")
