"""
Generate leaderboard banner via OpenRouter (google/gemini-2.5-flash-image).
Saves to assets/leaderboard-banner.png
"""
import base64, json, os, sys
import urllib.request, urllib.error

OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY", "")  # set env var before running
MODEL = "openai/gpt-5.4-image-2"
OUT   = os.path.join(os.path.dirname(__file__), "..", "assets", "leaderboard-banner.png")

PROMPT = """
Create a wide cinematic banner (landscape 16:4 ratio) for a sci-fi card game leaderboard screen.

Visual concept: a grand galactic arena viewed from above — ancient stone-and-crystal trophy pedestals
arranged in a row across the center, glowing with deep cyan, gold, and violet energy. Behind them,
a vast star field with distant nebulae in deep purple and midnight blue. In the foreground, ghostly
holographic faction shields shimmer at the base of each pedestal, each a different neon color.
Dramatic volumetric light beams shoot upward from the pedestals into a dark cosmic sky.
The overall mood is prestigious, competitive, cosmic — like a hall of champions among the stars.

ABSOLUTE REQUIREMENTS — violating any of these makes the image unusable:
(1) NO text, letters, numbers, words, glyphs, runes, symbols, or writing of any kind anywhere.
(2) NO border, frame, outline, rounded corners, card-style edge, or decorative border of any kind.
(3) NO white or solid-color padding around the edges.
(4) The artwork must extend fully to all four edges — no letterboxing, no padding.
(5) Pure dark space / black background only — no light background.
(6) Ultra-wide landscape crop only — no portrait or square framing.
"""

def generate():
    if os.path.exists(OUT):
        print(f"Already exists: {OUT}")
        return

    payload = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": PROMPT}],
        "size": "1792x1024",
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nullbreach.vercel.app",
            "X-Title": "Nullbreach Leaderboard Banner",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}")
        sys.exit(1)

    msg = body.get("choices", [{}])[0].get("message", {})

    # gpt-5.4-image-2 returns images in message.images list
    images = msg.get("images") or []
    if not images:
        # fallback: check content for image_url parts
        content = msg.get("content") or []
        if isinstance(content, list):
            images = [p for p in content if isinstance(p, dict) and p.get("type") == "image_url"]

    for img in images:
        url = img.get("image_url", {}).get("url", "") if isinstance(img, dict) else ""
        if url.startswith("data:image"):
            b64 = url.split(",", 1)[1]
            with open(OUT, "wb") as f:
                f.write(base64.b64decode(b64))
            print(f"Saved: {OUT}")
            return

    print("No image found in response. Full body:")
    print(json.dumps(body, indent=2)[:3000])

if __name__ == "__main__":
    generate()
