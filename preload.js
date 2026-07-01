// ── DESKTOP PRELOAD ───────────────────────────────────────────────────────────
// Runs in the renderer with contextIsolation enabled. Exposes a minimal,
// safe API surface as window.gzDesktop. The web build never loads this file,
// so all game code must treat window.gzDesktop as optional.

const { contextBridge, ipcRenderer } = require('electron')

// Channel is decided by the main process and passed via additionalArguments.
// Values: 'steam' | 'itch' | 'dev'
function readChannel() {
  const arg = process.argv.find(a => a.indexOf('--gz-channel=') === 0)
  return arg ? arg.split('=')[1] : 'steam'
}

contextBridge.exposeInMainWorld('gzDesktop', {
  isDesktop: true,
  channel: readChannel(),

  // Log a renderer-side error to the main process (written to userData/logs).
  // payload: string or { message, source, line, col, stack }
  logError(payload) {
    try { ipcRenderer.send('gz:renderer-error', payload) } catch (e) { /* never throw */ }
  },

  // Tell the main process whether a match is in progress.
  // Controls the quit-confirmation dialog. Defaults to false if never called.
  setMatchActive(active) {
    try { ipcRenderer.send('gz:match-active', !!active) } catch (e) { /* never throw */ }
  }
})
