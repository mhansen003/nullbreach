// ── BUILD CHANNEL ─────────────────────────────────────────────────────────────
// Declares which distribution channel this build belongs to.
//
// Valid values:
//   'web'       — live Vercel deployment (free, no gate)        ← default
//   'itch-demo' — itch.io browser demo (shows the support ask)
//   'itch'      — itch.io paid desktop download (no gate)
//   'steam'     — Steam desktop build (no gate, no itch links)
//   'dev'       — local development
//
// On desktop (Electron) the channel comes from preload.js as
// window.gzDesktop.channel and takes priority over this value —
// see demoGetChannel() in demo-gate.js. Deployment scripts for
// itch.io should rewrite the line below to 'itch-demo'.

window.GZ_CHANNEL = 'web';
