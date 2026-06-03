import os
import sys
import base64
import json
import urllib.request
import urllib.error
import time

# Load API key from env var or .env file
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
API_KEY = os.environ.get("OPENROUTER_API_KEY") or _env.get("OPENROUTER_API_KEY", "")
MODEL = "google/gemini-2.5-flash-image"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

PRIMARY_BASE = r"C:\GitHub\nullbreach\assets\cards"
DESKTOP_BASE = r"C:\Users\Mark Hansen\Desktop\new-race-cards"

def generate_image(prompt, out_path_primary, out_path_desktop):
    print(f"\n  GENERATING: {os.path.basename(out_path_primary)}")
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
            # Print raw for debugging
            print(f"  Raw message (first 500): {str(msg)[:500]}")
        return False

    # Save to both locations
    os.makedirs(os.path.dirname(out_path_primary), exist_ok=True)
    os.makedirs(os.path.dirname(out_path_desktop), exist_ok=True)

    with open(out_path_primary, "wb") as f:
        f.write(img_data)
    with open(out_path_desktop, "wb") as f:
        f.write(img_data)

    size_kb = len(img_data) // 1024
    print(f"  SAVED: {size_kb}KB")
    print(f"    -> {out_path_primary}")
    print(f"    -> {out_path_desktop}")
    return True


def card(race, filename, prompt):
    p1 = os.path.join(PRIMARY_BASE, race, filename)
    p2 = os.path.join(DESKTOP_BASE, race, filename)
    return generate_image(prompt, p1, p2)


print("=== Regenerating 4 white-border cards for GALACTIC ZERO ===")
print(f"API key present: {'YES' if API_KEY else 'NO'}")

# 1. void/t2_b.png — VOID CLUSTER
time.sleep(1)
card("void", "t2_b.png",
     "VOID CLUSTER sci-fi card art, a massive dark purple void-ship or cosmic horror entity drifting through absolute black space, swirling purple-black tentacles or void-tendrils consuming nearby stars, deep space fills the entire frame edge-to-edge with no borders no frames no white areas, pure black background with dark purple cosmic horror, portrait orientation 512x680, photorealistic digital painting, cinematic lighting")

time.sleep(3)

# 2. crystallis/t3_b.png — CRYSTAL STRIKER
card("crystallis", "t3_b.png",
     "CRYSTAL STRIKER sci-fi card art, a sharp lance or blade formation made entirely of translucent icy blue crystals pointing upward, multiple prismatic crystal shards forming a weapon-like spire, cold blue and cyan crystalline geometry, pure black deep space background filling entire frame edge-to-edge with no borders no frames no white areas no starburst rays, portrait orientation 512x680, photorealistic digital painting, cinematic cold lighting")

time.sleep(3)

# 3. entropy/t2_b.png — RUST WING
card("entropy", "t2_b.png",
     "RUST WING sci-fi card art, a rusted steampunk airship or mech-unit with massive corroded mechanical wings spread wide, iron and copper tones heavily oxidized with rust and verdigris, steam venting from pipes, bolts and rivets visible on decayed armor plating, dark brownish-black space background filling the entire frame edge-to-edge with no borders no frames no white areas, portrait orientation 512x680, gritty photorealistic digital painting")

time.sleep(3)

# 4. entropy/t1_a.png — DECAY ANCHOR
card("entropy", "t1_a.png",
     "DECAY ANCHOR sci-fi card art, a small rusted mechanical drone or anchor unit floating in space, compact corroded iron body with oxidized copper pipes and steam emitters, bolts and worn metal plating in rust-orange and dark brown, dark near-black space background filling entire frame edge-to-edge with no borders no frames no white areas, portrait orientation 512x680, gritty photorealistic digital painting, steampunk aesthetic")

print("\n=== DONE ===")
