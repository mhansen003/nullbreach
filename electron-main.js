const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')

// ── CHANNEL / ENV ─────────────────────────────────────────────────────────────
// 'steam' | 'itch' | 'dev' — passed to the renderer via preload.js.
// Override per-build with GZ_CHANNEL (e.g. GZ_CHANNEL=itch for the itch build).
const GZ_CHANNEL = process.env.GZ_CHANNEL || (app.isPackaged ? 'steam' : 'dev')
const GZ_DEV = process.env.GZ_DEV === '1'

let win = null
let matchActive = false
let quitConfirmed = false

// ── LOGGING ───────────────────────────────────────────────────────────────────
function logToFile(tag, message) {
  try {
    const dir = path.join(app.getPath('userData'), 'logs')
    fs.mkdirSync(dir, { recursive: true })
    const line = '[' + new Date().toISOString() + '] [' + tag + '] ' + message + '\n'
    fs.appendFileSync(path.join(dir, 'main.log'), line)
  } catch (e) { /* the logger must never throw */ }
}

// ── CRASH HANDLING ────────────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  const detail = (err && err.stack) || String(err)
  logToFile('uncaughtException', detail)
  try {
    dialog.showErrorBox(
      'GALACTIC ZERO — Unexpected Error',
      'The game hit an unexpected error and needs to close.\n\n' +
      ((err && err.message) || String(err)) +
      '\n\nA log was written to:\n' + path.join(app.getPath('userData'), 'logs', 'main.log')
    )
  } catch (e) { /* dialog may be unavailable very early */ }
  app.exit(1)
})

function offerReload(title, detail) {
  if (!win || win.isDestroyed()) return
  const choice = dialog.showMessageBoxSync(win, {
    type: 'error',
    title: 'GALACTIC ZERO',
    message: title,
    detail: detail + '\n\nA log was written to:\n' + path.join(app.getPath('userData'), 'logs', 'main.log'),
    buttons: ['Reload Game', 'Quit'],
    defaultId: 0,
    cancelId: 0
  })
  if (choice === 0) {
    matchActive = false
    win.webContents.reload()
  } else {
    quitConfirmed = true
    app.quit()
  }
}

// ── WINDOW STATE PERSISTENCE ─────────────────────────────────────────────────
function windowStateFile() {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function loadWindowState() {
  try {
    const state = JSON.parse(fs.readFileSync(windowStateFile(), 'utf8'))
    if (state && state.bounds &&
        typeof state.bounds.width === 'number' &&
        typeof state.bounds.height === 'number') {
      return state
    }
  } catch (e) { /* first run or unreadable state — use defaults */ }
  return null
}

function saveWindowState() {
  if (!win || win.isDestroyed()) return
  try {
    const state = {
      bounds: win.getNormalBounds(),
      maximized: win.isMaximized(),
      fullscreen: win.isFullScreen()
    }
    fs.writeFileSync(windowStateFile(), JSON.stringify(state))
  } catch (e) {
    logToFile('window-state', 'save failed: ' + e.message)
  }
}

// ── MENU / ACCELERATORS ──────────────────────────────────────────────────────
// Replaces the default menu so Ctrl+W / Ctrl+R and friends do nothing.
// The menu bar stays hidden; only these accelerators remain active:
//   F11, Alt+Enter  → toggle fullscreen
//   Ctrl+Shift+I    → devtools, ONLY when GZ_DEV=1
function toggleFullscreen() {
  if (!win || win.isDestroyed()) return
  win.setFullScreen(!win.isFullScreen())
}

function installMenu() {
  const viewItems = [
    { label: 'Toggle Fullscreen', accelerator: 'F11', click: toggleFullscreen },
    { label: 'Toggle Fullscreen (Alt+Enter)', accelerator: 'Alt+Enter', click: toggleFullscreen }
  ]
  if (GZ_DEV) {
    viewItems.push({
      label: 'Toggle DevTools',
      accelerator: 'CmdOrCtrl+Shift+I',
      click: () => { if (win && !win.isDestroyed()) win.webContents.toggleDevTools() }
    })
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: 'View', submenu: viewItems }]))
}

// ── IPC (from preload.js) ────────────────────────────────────────────────────
ipcMain.on('gz:renderer-error', (event, payload) => {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload)
  logToFile('renderer', text)
})

ipcMain.on('gz:match-active', (event, active) => {
  matchActive = !!active
})

// ── WINDOW ───────────────────────────────────────────────────────────────────
function createWindow() {
  const saved = loadWindowState()

  win = new BrowserWindow({
    width: saved ? saved.bounds.width : 1280,
    height: saved ? saved.bounds.height : 800,
    x: saved ? saved.bounds.x : undefined,
    y: saved ? saved.bounds.y : undefined,
    minWidth: 1024,
    minHeight: 680,
    title: 'GALACTIC ZERO',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: ['--gz-channel=' + GZ_CHANNEL]
    }
  })

  win.setMenuBarVisibility(false)

  win.once('ready-to-show', () => {
    if (!saved) {
      win.maximize() // first run: start maximized
    } else if (saved.fullscreen) {
      win.setFullScreen(true)
    } else if (saved.maximized) {
      win.maximize()
    }
    win.show()
  })

  // External links → system browser; never spawn in-app windows
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // Never navigate the game window away from local files
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file:')) return
    event.preventDefault()
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
    }
  })

  // Renderer crash → log + offer reload
  win.webContents.on('render-process-gone', (event, details) => {
    logToFile('render-process-gone', JSON.stringify(details))
    offerReload('The game renderer stopped unexpectedly.', 'Reason: ' + (details && details.reason))
  })

  // Load failure → log + offer reload
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return // -3 = ERR_ABORTED (in-page navigations)
    logToFile('did-fail-load', errorCode + ' ' + errorDescription + ' ' + validatedURL)
    offerReload('The game failed to load.', errorDescription + ' (' + errorCode + ')')
  })

  // Quit confirmation — only when the game has flagged a match in progress
  win.on('close', (event) => {
    saveWindowState()
    if (matchActive && !quitConfirmed) {
      const choice = dialog.showMessageBoxSync(win, {
        type: 'question',
        title: 'GALACTIC ZERO',
        message: 'A match may be in progress.',
        detail: 'Are you sure you want to quit?',
        buttons: ['Quit', 'Keep Playing'],
        defaultId: 1,
        cancelId: 1
      })
      if (choice !== 0) {
        event.preventDefault()
        return
      }
      quitConfirmed = true
    }
  })

  win.on('closed', () => { win = null })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  installMenu()
  createWindow()
})

app.on('window-all-closed', () => app.quit())
