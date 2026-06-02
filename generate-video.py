"""
GALACTIC ZERO — Galaxy Loop Video via Veo 3.1 Fast
Uses extra_body.video with first_frame + last_frame for seamless loop
"""
import requests, base64, os, json
from pathlib import Path

API_KEY  = os.environ.get("OPENROUTER_API_KEY", "")
IMG_PATH = Path("C:/GitHub/nullbreach/assets/splash.png")
OUT_PATH = Path("C:/Users/Mark Hansen/Desktop/galactic-zero-loop.mp4")

b64 = base64.b64encode(IMG_PATH.read_bytes()).decode()
data_url = f"data:image/png;base64,{b64}"

print(f"Image: {IMG_PATH.stat().st_size//1024}KB")
print("Calling Veo 3.1 Fast (timeout 300s)...")

r = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://zero.demo.pub",
        "X-Title": "Galactic Zero"
    },
    json={
        "model": "google/veo-3.1-fast",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": (
                    "A majestic spiral galaxy slowly rotating around its bright central core. "
                    "Camera completely stationary — no zoom, no forward motion, no dolly. "
                    "Only the galaxy itself rotates, one slow full revolution. "
                    "Deep blue nebula, star fields, glowing spiral arms. "
                    "Cinematic, seamless loop, 8 seconds."
                )}
            ]
        }],
        "extra_body": {
            "video": {
                "duration_seconds": 8,
                "aspect_ratio": "16:9",
                "first_frame": data_url,
                "last_frame":  data_url
            }
        }
    },
    timeout=360
)

print(f"Status: {r.status_code}")
data = r.json()

if r.status_code != 200:
    print("ERROR:", json.dumps(data, indent=2)[:500])
else:
    msg = data["choices"][0]["message"]
    # Video URL can be in msg.video.url or msg.content
    video_url = None
    if isinstance(msg.get("video"), dict):
        video_url = msg["video"].get("url")
    elif isinstance(msg.get("content"), str) and msg["content"].startswith("http"):
        video_url = msg["content"]

    if video_url:
        print(f"Downloading from: {video_url[:80]}...")
        vr = requests.get(video_url, timeout=120)
        OUT_PATH.write_bytes(vr.content)
        print(f"SAVED: {OUT_PATH} ({OUT_PATH.stat().st_size//1024}KB)")
    else:
        print("Full response:")
        print(json.dumps(data, indent=2)[:1000])
