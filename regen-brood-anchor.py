"""
Regenerate brood-anchor.png with edge-to-edge composition fix.
Target: 400x533px portrait (same ratio as 108x144 in-game card).
Reads API key from OPENROUTER_API_KEY environment variable.
"""
import requests, base64, os, sys
from pathlib import Path

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
if not API_KEY:
    print("ERROR: OPENROUTER_API_KEY env var not set")
    sys.exit(1)

OUT_PATH = Path("C:/GitHub/nullbreach/assets/cards/brood/brood-anchor.png")

PROMPT = (
    "BROOD ANCHOR: massive alien insectoid anchor structure, bioluminescent green tendrils "
    "radiating outward from a central hive node, chitin armor plating, organic mechanical hybrid, "
    "dark space background, edge-to-edge composition filling the entire frame, "
    "sci-fi card game art, square crop safe zone, no empty space at top or bottom, "
    "portrait orientation 3:4 aspect ratio, subject fills full height and width of frame, "
    "acid green-yellow bioluminescent palette, deep chitinous black, insectoid anatomy, "
    "biomechanical fusion, dramatic volumetric lighting, no text, no UI elements, no borders"
)

print("Generating brood-anchor.png (400x533 portrait)...")

r = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://zero.demo.pub",
        "X-Title": "Galactic Zero"
    },
    json={
        "model": "google/gemini-2.5-flash-image",
        "messages": [{"role": "user", "content": PROMPT}]
    },
    timeout=180
)

print(f"Status: {r.status_code}")

if r.status_code != 200:
    print(f"FAIL: {r.text[:500]}")
    sys.exit(1)

data = r.json()
images = data["choices"][0]["message"].get("images", [])

if not images:
    # Try content field for data URI embedded in message parts
    content = data["choices"][0]["message"].get("content", "")
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict) and part.get("type") == "image_url":
                url = part["image_url"]["url"]
                if url.startswith("data:"):
                    raw = base64.b64decode(url.split(",", 1)[1])
                    OUT_PATH.write_bytes(raw)
                    print(f"OK (from content list) — {OUT_PATH.stat().st_size // 1024}KB")
                    sys.exit(0)
    print(f"NO IMAGE in response. Keys: {list(data['choices'][0]['message'].keys())}")
    print(f"Content snippet: {str(content)[:300]}")
    sys.exit(1)

url = images[0]["image_url"]["url"]
raw = base64.b64decode(url.split(",", 1)[1])
OUT_PATH.write_bytes(raw)
print(f"OK — saved {OUT_PATH.stat().st_size // 1024}KB to {OUT_PATH}")
