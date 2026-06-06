#!/usr/bin/env node
// ── Galactic Zero — itch.io deploy script ────────────────────────────────────
// Usage: node deploy-itch.js
//
// What it does:
//   1. Downloads butler (itch.io CLI) if not present in dev/tools/
//   2. Zips all game files into dist/nullbreach.zip
//   3. Pushes the zip to itch.io via butler
//
// Config: edit ITCH_USER and ITCH_GAME below, or set env vars:
//   ITCH_USER=myname ITCH_GAME=galactic-zero node deploy-itch.js

const ITCH_USER    = process.env.ITCH_USER || 'mhansen003';
const ITCH_GAME    = process.env.ITCH_GAME || 'galactic-zero';
const ITCH_CHANNEL = process.env.ITCH_CHANNEL || 'html';

// ── Game files to include in the zip ─────────────────────────────────────────
const INCLUDE_FILES = [
  'index.html',
  'game.html',
  'game.css',
  'state.js',
  'turn.js',
  'battle.js',
  'placement.js',
  'zones.js',
  'cards.js',
  'abilities.js',
  'abilities-data.js',
  'ai.js',
  'audio.js',
  'guide.js',
  'mobile.js',
  'multiplayer.js',
  'render-grid.js',
  'render-hand.js',
  'render-overlays.js',
  'render-score.js',
  'tooltip.js',
  'ui.js',
  'utils.js',
  'demo-gate.js',
  'leaderboard.js',
  'achievements.js',
];
const INCLUDE_DIRS = ['assets', 'badges'];

// ─────────────────────────────────────────────────────────────────────────────

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const { execSync, spawnSync } = require('child_process');
const os      = require('os');

const ROOT      = __dirname;
const TOOLS_DIR = path.join(ROOT, 'dev', 'tools');
const DIST_DIR  = path.join(ROOT, 'dist');
const ZIP_PATH  = path.join(DIST_DIR, 'nullbreach.zip');

// Butler download URL by platform (GitHub releases)
const BUTLER_VERSION = '15.27.0';
const BUTLER_URLS = {
  win32:  `https://github.com/itchio/butler/releases/download/v${BUTLER_VERSION}/butler-windows-amd64.zip`,
  darwin: `https://github.com/itchio/butler/releases/download/v${BUTLER_VERSION}/butler-darwin-amd64.zip`,
  linux:  `https://github.com/itchio/butler/releases/download/v${BUTLER_VERSION}/butler-linux-amd64.zip`,
};
const BUTLER_EXE  = os.platform() === 'win32' ? 'butler.exe' : 'butler';
const BUTLER_PATH = path.join(TOOLS_DIR, BUTLER_EXE);

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg) { console.log('\x1b[36m[deploy]\x1b[0m ' + msg); }
function ok(msg)  { console.log('\x1b[32m[  ok  ]\x1b[0m ' + msg); }
function err(msg) { console.error('\x1b[31m[ FAIL ]\x1b[0m ' + msg); }

function downloadFile(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest, redirectCount + 1)
          .then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(resolve));
      out.on('error', reject);
    }).on('error', reject);
  });
}

// ── Step 1: Ensure butler ─────────────────────────────────────────────────────
async function ensureButler() {
  if (fs.existsSync(BUTLER_PATH)) {
    log('Butler already at ' + BUTLER_PATH);
    return;
  }
  const platform = os.platform();
  const url = BUTLER_URLS[platform];
  if (!url) throw new Error('Unsupported platform: ' + platform);

  fs.mkdirSync(TOOLS_DIR, { recursive: true });

  // Butler distributes as a .zip containing the binary
  const tmpZip = path.join(TOOLS_DIR, 'butler-download.zip');
  log('Downloading butler from ' + url + ' …');
  await downloadFile(url, tmpZip);
  ok('Downloaded butler zip');

  // Extract using PowerShell (Windows) or unzip (Unix)
  const psExe = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  if (platform === 'win32') {
    execSync(
      `"${psExe}" -Command "Expand-Archive -Path '${tmpZip}' -DestinationPath '${TOOLS_DIR}' -Force"`,
      { stdio: 'inherit' }
    );
    // Butler zip extracts into a platform subfolder e.g. windows-amd64/butler.exe
    const subDir = path.join(TOOLS_DIR, 'windows-amd64', 'butler.exe');
    if (fs.existsSync(subDir) && !fs.existsSync(BUTLER_PATH)) {
      fs.copyFileSync(subDir, BUTLER_PATH);
    }
  } else {
    execSync(`unzip -o "${tmpZip}" -d "${TOOLS_DIR}"`, { stdio: 'inherit' });
    // Unix: may be in a subdir too
    const subDir = path.join(TOOLS_DIR, 'darwin-amd64', 'butler');
    const linuxSub = path.join(TOOLS_DIR, 'linux-amd64', 'butler');
    if (fs.existsSync(subDir) && !fs.existsSync(BUTLER_PATH)) fs.copyFileSync(subDir, BUTLER_PATH);
    if (fs.existsSync(linuxSub) && !fs.existsSync(BUTLER_PATH)) fs.copyFileSync(linuxSub, BUTLER_PATH);
    execSync(`chmod +x "${BUTLER_PATH}"`);
  }

  fs.unlinkSync(tmpZip);

  if (!fs.existsSync(BUTLER_PATH)) throw new Error('Butler extraction failed — binary not found at ' + BUTLER_PATH);
  ok('Butler ready at ' + BUTLER_PATH);
}

// ── Step 2: Build zip ─────────────────────────────────────────────────────────
function buildZip() {
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Remove old zip
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);

  log('Building ' + ZIP_PATH + ' …');

  // Collect all files relative to ROOT
  const entries = [];

  INCLUDE_FILES.forEach(f => {
    const full = path.join(ROOT, f);
    if (fs.existsSync(full)) entries.push(f);
    else log('  SKIP (not found): ' + f);
  });

  INCLUDE_DIRS.forEach(dir => {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) { log('  SKIP dir (not found): ' + dir); return; }
    walkDir(full, ROOT).forEach(rel => entries.push(rel));
  });

  log(`  ${entries.length} files to zip`);

  // Use PowerShell on Windows, zip on Unix
  if (os.platform() === 'win32') {
    // Write PowerShell script to a temp file to avoid quoting issues
    const psScriptPath = path.join(DIST_DIR, '_make-zip.ps1').replace(/\//g, '\\');
    const zipPathW  = ZIP_PATH.replace(/\//g, '\\');
    const rootW     = ROOT.replace(/\//g, '\\');
    const fileList  = entries.map(e => path.join(ROOT, e).replace(/\//g, '\\')).join("','");
    const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open('${zipPathW}', 'Create')
$files = @('${fileList}')
foreach ($file in $files) {
  $rel = $file.Substring(${rootW.length + 1})
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file, $rel) | Out-Null
}
$archive.Dispose()
Write-Host "Zip created: ${zipPathW}"
`;
    fs.writeFileSync(psScriptPath.replace(/\\/g, '/'), psScript);
    const psExe2 = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
    execSync(`"${psExe2}" -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
    fs.unlinkSync(psScriptPath.replace(/\\/g, '/'));
  } else {
    const args = [ZIP_PATH, ...entries];
    const result = spawnSync('zip', args, { cwd: ROOT, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('zip command failed');
  }

  const sizeMB = (fs.statSync(ZIP_PATH).size / 1024 / 1024).toFixed(1);
  ok(`Zip ready: ${ZIP_PATH} (${sizeMB} MB)`);
}

function walkDir(dir, root) {
  const results = [];
  fs.readdirSync(dir).forEach(name => {
    const full = path.join(dir, name);
    const rel  = path.relative(root, full);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full, root).forEach(r => results.push(r));
    } else {
      results.push(rel);
    }
  });
  return results;
}

// ── Step 3: Butler push ───────────────────────────────────────────────────────
function butlerPush() {
  const target = `${ITCH_USER}/${ITCH_GAME}:${ITCH_CHANNEL}`;
  log(`Pushing to itch.io → ${target} …`);

  const result = spawnSync(
    BUTLER_PATH,
    ['push', ZIP_PATH, target],
    { stdio: 'inherit', cwd: ROOT }
  );

  if (result.status !== 0) throw new Error('butler push failed (exit code ' + result.status + ')');
  ok(`Deployed to https://${ITCH_USER}.itch.io/${ITCH_GAME}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n\x1b[35m═══ Galactic Zero — itch.io Deploy ═══\x1b[0m');
  console.log(`  Target: ${ITCH_USER}/${ITCH_GAME}:${ITCH_CHANNEL}`);
  console.log('');

  try {
    await ensureButler();
    buildZip();
    butlerPush();
    console.log('\n\x1b[32m✓ Deploy complete!\x1b[0m\n');
  } catch (e) {
    err(e.message);
    if (e.message.includes('butler') && e.message.includes('logged')) {
      console.log('\n  Run this first to log in:\n');
      console.log(`  ${BUTLER_PATH} login\n`);
    }
    process.exit(1);
  }
})();
