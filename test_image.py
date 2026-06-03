import os
import base64
import json
import urllib.request
import urllib.error

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
API_KEY = _env.get("OPENROUTER_API_KEY", "")
MODEL = "google/gemini-2.5-flash-image"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

payload = {
    "model": MODEL,
    "messages": [
        {
            "role": "user",
            "content": "small compact golden plasma node, sphere of contained ionic energy, sci-fi card art, dark space background, portrait orientation, no text"
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
        print("SUCCESS!")
        print("Keys:", list(result.keys()))
        choices = result.get("choices", [])
        if choices:
            msg = choices[0].get("message", {})
            print("Message keys:", list(msg.keys()))
            # Check images field
            images = msg.get("images", [])
            print("Images field:", type(images), len(images) if isinstance(images, list) else "not list")
            if isinstance(images, list) and images:
                img0 = images[0]
                print("First image type:", type(img0))
                if isinstance(img0, dict):
                    print("Image dict keys:", list(img0.keys()))
                    url = img0.get("image_url", {})
                    print("image_url type:", type(url))
                    if isinstance(url, dict):
                        print("image_url keys:", list(url.keys()))
                        u = url.get("url", "")
                        print("URL prefix:", u[:80])
                    elif isinstance(url, str):
                        print("image_url string prefix:", url[:80])
                elif isinstance(img0, str):
                    print("Image string prefix:", img0[:100])
            content = msg.get("content", "")
            print("Content type:", type(content))
            if isinstance(content, list):
                for i, part in enumerate(content):
                    print(f"Part {i}: type={part.get('type','?')}")
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")
    print(f"HTTP Error {e.code}: {body[:500]}")
except Exception as e:
    print(f"Error: {e}")
