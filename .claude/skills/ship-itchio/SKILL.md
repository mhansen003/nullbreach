---
name: ship-itchio
description: Use when ready to package Galactic Zero for upload to itch.io. Builds a clean distribution ZIP from the current source, excluding dev tools, git history, and unused backup files.
---

# Ship to itch.io

Builds `C:\GitHub\galactic-zero-dist.zip` — ready to upload directly to itch.io as an HTML5 game.

## What gets included

- `index.html`, `game.html`, `game.css`
- All root `.js` files (including `demo-gate.js`)
- `assets/` folder (card art, audio, video, avatars, UI images)

## What gets excluded

- `dev/` — test harnesses and balance tools
- `docs/` — design specs
- `.git/`, `.vercel/`, `.superpowers/` — tooling artifacts
- `assets/void-horizon-original.mp3` — unused backup (saves ~5MB)

## Steps

1. Build ZIP directly with Python — no staging needed, Python's zipfile always uses forward slashes (avoids itch.io 403s from Windows backslash paths)
2. Report final ZIP path and size

## IMPORTANT: Use Python, not .NET ZipFile

.NET `ZipFile.CreateFromDirectory` on Windows stores paths with backslashes (`assets\file.png`).
itch.io's Linux CDN cannot resolve those paths → all assets return 403 Forbidden.
Python's `zipfile` module always uses forward slashes regardless of OS.

## Build command

```python
# Run with: python -c "..." or save to a .py file and run it
import zipfile, os

src = r'C:\GitHub\nullbreach'
out = r'C:\GitHub\galactic-zero-dist.zip'

root_files = ['index.html', 'game.html', 'game.css']
for f in os.listdir(src):
    if f.endswith('.js') and os.path.isfile(os.path.join(src, f)):
        root_files.append(f)

exclude_assets = {'void-horizon-original.mp3'}

count = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for f in root_files:
        path = os.path.join(src, f)
        if os.path.exists(path):
            zf.write(path, f)
            count += 1
    assets_dir = os.path.join(src, 'assets')
    for root, dirs, files in os.walk(assets_dir):
        for f in files:
            if f in exclude_assets:
                continue
            full = os.path.join(root, f)
            arcname = 'assets/' + os.path.relpath(full, assets_dir).replace(os.sep, '/')
            zf.write(full, arcname)
            count += 1

size_mb = os.path.getsize(out) / (1024*1024)
print(f'Done: {out} ({size_mb:.1f} MB, {count} files)')
```

## itch.io upload checklist

After running the above:

1. Go to itch.io → **Create new project**
2. Title: **GALACTIC ZERO**
3. Kind of project: **HTML**
4. Upload the ZIP → check **"This file will be played in the browser"**
5. Viewport: **1280 × 720** (check "fullscreen button" too)
6. Pricing: **Paid** → minimum $1
7. Publish

## Notes

- The ZIP is ~415 MB — itch.io limit is 1 GB, so no issue
- Support ask fires after the player's 10th card placement — AI moves don't count, shows once per session
- Modal uses the player's chosen faction color and avatar
- "KEEP PLAYING" dismisses the modal — game continues, ask won't show again this session
- "SUPPORT — $1" opens `https://mhansen003.itch.io/galactic-zero` (itch.io donation page) in a new tab
- itch.io HTML5 games are donation-only (no hard paywall) — this is the intended model
- Leaderboard and multiplayer still work from itch.io (plain HTTPS calls to Supabase)
