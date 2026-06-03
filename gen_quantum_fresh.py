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

PRIMARY_DIR = r"C:\GitHub\nullbreach\assets\cards\quantum"
DESKTOP_DIR = r"C:\Users\Mark Hansen\Desktop\new-race-cards\quantum"

SUFFIX = "Pure black deep space background, edge-to-edge. Absolutely no white borders or frames. Portrait orientation."

CARDS = [
    (
        "t1_a.png",
        "PROBABILITY NODE for a sci-fi trading card game. A glowing teal sine wave, a standing wave equation floating horizontally across black space. Looks like a physics waveform graph drawn in light. Multiple overlapping wave equations creating interference nodes at their intersections. Pale teal and blue-white glowing lines against pure black. No orbs, no spheres. Horizontal waveform composition centered in a portrait frame. Violet accents at interference maxima. Prismatic rainbow shimmer along the wave peaks. " + SUFFIX
    ),
    (
        "t1_b.png",
        "SUPERPOSED SEED for a sci-fi trading card game. Two small identical crystalline tetrahedra floating at opposite corners of a portrait frame — one at top-left, one at bottom-right. They glow with cool teal-blue light. A single ghostly thin thread of entanglement energy connects them diagonally across vast negative black space. The thread is faint violet with tiny prismatic sparkles along it. Minimal, sparse composition — two separate objects and a connecting line, surrounded by deep black. No central focus, no orbs. " + SUFFIX
    ),
    (
        "t1_c.png",
        "QUBIT ANCHOR for a sci-fi trading card game. A sharp angular 3D hexagonal wireframe lattice structure, like a quantum computer chip rendered in glowing electric-blue lines. The lattice has multiple hexagonal layers stacked and slightly offset, creating a 3D depth effect. All straight lines and sharp angles — geometric, technical, structured. Glowing electric blue and blue-white lines on pure black. No curves, no orbs, no organic shapes. The structure fills most of the frame. Subtle teal and violet grid lines in the background layer. " + SUFFIX
    ),
    (
        "t2_a.png",
        "SUPERPOSED ARRAY for a sci-fi trading card game. A cyclotron or particle accelerator ring structure viewed at a dramatic angle. A large mechanical teal ring — clearly an industrial device — with particle beams firing through it in multiple directions, leaving long prismatic trails of violet, blue-white, and teal. The ring has visible mechanical sections, bolts, conduit details. Clearly a machine, not an organic form. The particle beam trails arc and fade into black. " + SUFFIX
    ),
    (
        "t2_b.png",
        "QUBIT WING for a sci-fi trading card game. A Feynman diagram, a particle physics collision map made of light. Multiple straight and gently curved lines representing particle paths converge at a central vertex marked with a bright glowing dot, then branch outward into multiple trajectories. Each path is labeled-style with glowing teal or violet lines. Secondary vertices branch further. Looks exactly like a physics textbook particle collision diagram but rendered in glowing neon lines on pure black. No solid objects. Just lines and glowing vertex dots. " + SUFFIX
    ),
    (
        "t2_c.png",
        "ENTANGLE MASS for a sci-fi trading card game. A network graph of exactly 8 small geometric nodes — some small cubes, some small tetrahedra — each glowing with teal or violet light, distributed across the entire portrait frame. Bright energy lines connect them in a complex web pattern, like a molecular model or neural network but made of quantum energy. The nodes are spread apart with lots of black space between them. No central orb or focal mass. The connections form a graph structure, not a radial pattern. Prismatic rainbow shimmer on the connection lines. " + SUFFIX
    ),
    (
        "t3_a.png",
        "WAVEFORM LANCE for a sci-fi trading card game. A sharp vertical lance of focused light formed by multiple overlapping waveforms converging upward to a single sharp point at the top. At the bottom of the frame: chaotic multiple overlapping wave crests in violet, wide and turbulent. Moving upward the waves narrow and focus, gradient shifting from violet at bottom to teal to blue-white at the tip. The collapse of a wavefunction into a single focused beam. Vertical composition. The lance point pierces the top of the frame. " + SUFFIX
    ),
    (
        "t3_b.png",
        "COLLAPSE STRIKER for a sci-fi trading card game. A container or box split perfectly down the vertical center. The left half shows one quantum reality: a glowing teal crystalline cube inside. The right half shows the other quantum reality: pure void, empty black nothing, just faint violet mist. A sharp dividing line down the exact center of the frame. Schrodinger's cat concept. Surreal and unsettling. The box has faint teal geometric lines forming its walls. Left side lit with teal, right side swallowed by void. " + SUFFIX
    ),
    (
        "t4.png",
        "THE OBSERVER for a sci-fi trading card game. A massive cosmic eye filling the entire portrait frame, made of quantum energy. The iris is a swirling vortex of teal and violet quantum foam, with complex fractal detail — rings within rings, each shimmering with prismatic rainbow light. The pupil at the center is a perfect circle of absolute black, a void of infinite depth. The eye represents the act of quantum observation collapsing states. Large, imposing, slightly unsettling. The eye is the entire composition. No humanoid features, just the pure eye motif. Sclera replaced by deep black space with faint star points. " + SUFFIX
    ),
    (
        "extra_a.png",
        "SPIN NODE for a sci-fi trading card game. A particle collision event viewed from directly above. From a single bright central impact point, dozens of tiny glowing particle dots radiate outward in all directions — some teal, some violet, some white, some pale pink, some blue. The dots vary in size and brightness. Some leave short trailing streaks. No large central mass, no orb — just the explosion pattern of scattered glowing particle dots radiating from the impact point, surrounded by pure black. Like a bubble chamber photograph made of pure neon light. " + SUFFIX
    ),
]

def generate_image(prompt, filename):
    print(f"\n  GENERATING: {filename}")
    print(f"    Prompt: {prompt[:100]}...")

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
            "X-Title": "GALACTIC ZERO Card Art - Quantum Syndicate"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ERROR HTTP {e.code}: {body[:400]}")
        return False, 0
    except Exception as e:
        print(f"  ERROR: {e}")
        return False, 0

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
            # Print full message for debug
            print(f"  Full msg (truncated): {str(msg)[:500]}")
        return False, 0

    os.makedirs(PRIMARY_DIR, exist_ok=True)
    os.makedirs(DESKTOP_DIR, exist_ok=True)

    p1 = os.path.join(PRIMARY_DIR, filename)
    p2 = os.path.join(DESKTOP_DIR, filename)

    with open(p1, "wb") as f:
        f.write(img_data)
    with open(p2, "wb") as f:
        f.write(img_data)

    size_bytes = len(img_data)
    size_kb = size_bytes // 1024
    print(f"  SAVED: {size_kb}KB -> {p1}")
    print(f"  SAVED: {size_kb}KB -> {p2}")
    return True, size_bytes


print("=== QUANTUM SYNDICATE - COMPLETE FRESH SET (10 cards) ===")
print(f"API key loaded: {API_KEY[:8]}... (len={len(API_KEY)})")

results = []
for i, (filename, prompt) in enumerate(CARDS):
    if i > 0:
        time.sleep(3)
    ok, size = generate_image(prompt, filename)
    results.append((filename, ok, size))

print("\n=== RESULTS ===")
for filename, ok, size in results:
    status = "OK" if ok else "FAILED"
    size_kb = size // 1024 if size else 0
    print(f"  {filename}: {status} {size_kb}KB")

failed = [f for f, ok, _ in results if not ok]
if failed:
    print(f"\nFAILED: {failed}")
    sys.exit(1)
else:
    print("\nAll 10 images generated successfully.")
