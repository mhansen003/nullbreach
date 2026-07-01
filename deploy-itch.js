#!/usr/bin/env node
// ── Galactic Zero — itch.io deploy script ────────────────────────────────────
// Usage: node deploy-itch.js [--dry-run]
//
// What it does:
//   1. Stages all game files into dist/stage/ (the repo working copy is never
//      modified) and rewrites the staged channel.js to GZ_CHANNEL='itch-demo'
//   2. Zips the staged files into dist/nullbreach.zip (forward-slash entries)
//   3. Downloads butler (itch.io CLI) if not present in dev/tools/
//   4. Pushes the zip to itch.io via butler
//
// --dry-run: stage + zip only — no butler download, no push.
//
// Config: edit ITCH_USER and ITCH_GAME below, or set env vars:
//   ITCH_USER=myname ITCH_GAME=galactic-zero node deploy-itch.js

const ITCH_USER    = process.env.ITCH_USER || 'mhansen003';
const ITCH_GAME    = process.env.ITCH_GAME || 'galactic-zero';
const ITCH_CHANNEL = process.env.ITCH_CHANNEL || 'html';
const DRY_RUN      = process.argv.includes('--dry-run');

// ── TOGGLE: exclude full-res card art (assets/cards, ~229 MB) from the zip ────
// The renderers (render-grid.js / render-hand.js / tooltip.js / mobile.js /
// ai.js via gzCardArt, plus guide.js and the index.html tier previews) all use
// the compressed assets/cards-sm webp set (~2 MB), so the full-res PNGs are
// dead weight in the web build. assets/cards/hazard/ is still shipped: the
// hazard cell videos (*.mp4) and guide posters only exist there.
// Set GZ_EXCLUDE_FULLRES_CARDS=0 to force the old full-payload behavior.
const EXCLUDE_FULLRES_CARDS = process.env.GZ_EXCLUDE_FULLRES_CARDS !== '0';

// ── Game files to include in the zip ─────────────────────────────────────────
const INCLUDE_FILES = [
  'index.html',
  'game.html',
  'game.css',
  'channel.js',
  'shared-data.js',
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
const INCLUDE_DIRS = ['assets', 'badges-sm']; // badges-sm: all runtime refs use the compressed set

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
const STAGE_DIR = path.join(DIST_DIR, 'stage');
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
      // Follow all common redirect codes (GitHub releases use 301/302, some
      // CDNs answer 303/307/308 which previously aborted the download).
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume(); // drain so the socket is released
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

// ── Step 2a: Collect files ────────────────────────────────────────────────────
function collectEntries() {
  const entries = [];
  const missing = [];

  INCLUDE_FILES.forEach(f => {
    const full = path.join(ROOT, f);
    if (fs.existsSync(full)) entries.push(f);
    else missing.push(f);
  });

  // A missing required file means a broken build — abort instead of shipping
  // a zip that silently lacks scripts.
  if (missing.length) {
    throw new Error('Required INCLUDE_FILES missing, build aborted: ' + missing.join(', '));
  }

  INCLUDE_DIRS.forEach(dir => {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) { log('  SKIP dir (not found): ' + dir); return; }
    walkDir(full, ROOT).forEach(rel => entries.push(rel));
  });

  // Optional payload trim (see EXCLUDE_FULLRES_CARDS toggle at the top).
  // Uses a trailing separator so assets/cards-sm is NOT excluded, and keeps
  // assets/cards/hazard/ (cell videos + guide posters have no -sm variant).
  if (EXCLUDE_FULLRES_CARDS) {
    const prefix = 'assets' + path.sep + 'cards' + path.sep;
    const keepPrefix = prefix + 'hazard' + path.sep;
    const before = entries.length;
    const kept = entries.filter(rel => !rel.startsWith(prefix) || rel.startsWith(keepPrefix));
    log(`  Excluding full-res card art: ${before - kept.length} files (assets/cards/, hazard kept)`);
    entries.length = 0;
    kept.forEach(e => entries.push(e));
  }

  return entries;
}

// ── Step 2b: Stage files (repo working copy is never touched) ─────────────────
function stageFiles(entries) {
  fs.rmSync(STAGE_DIR, { recursive: true, force: true });
  fs.mkdirSync(STAGE_DIR, { recursive: true });

  log('Staging ' + entries.length + ' files into ' + STAGE_DIR + ' …');
  entries.forEach(rel => {
    const src = path.join(ROOT, rel);
    const dst = path.join(STAGE_DIR, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  });

  // Rewrite the STAGED channel.js to the itch.io demo channel.
  const chPath = path.join(STAGE_DIR, 'channel.js');
  const chSrc  = fs.readFileSync(chPath, 'utf8');
  const chRe   = /window\.GZ_CHANNEL\s*=\s*'[^']*'/;
  if (!chRe.test(chSrc)) {
    throw new Error("channel.js: could not find the window.GZ_CHANNEL assignment to rewrite — build aborted");
  }
  fs.writeFileSync(chPath, chSrc.replace(chRe, "window.GZ_CHANNEL = 'itch-demo'"));
  ok("Staged channel.js rewritten to GZ_CHANNEL='itch-demo'");

  // The demo gate only activates on channel 'itch-demo', which requires
  // game.html to actually load channel.js (before demo-gate.js). Fail loudly
  // if the script tag is missing rather than shipping an ungated demo.
  const ghSrc = fs.readFileSync(path.join(STAGE_DIR, 'game.html'), 'utf8');
  if (!/<script[^>]*\bsrc=["']channel\.js["']/i.test(ghSrc)) {
    throw new Error('game.html does not include <script src="channel.js"></script> — '
      + 'the itch demo gate would never activate. Add the tag (before demo-gate.js) and rebuild.');
  }
  ok('Verified game.html loads channel.js');
}

// ── Step 2c: Build zip from the staged copy ───────────────────────────────────
function buildZip(entries) {
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Remove old zip
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);

  log('Building ' + ZIP_PATH + ' …');
  log(`  ${entries.length} files to zip`);

  // Use PowerShell on Windows, zip on Unix
  if (os.platform() === 'win32') {
    // Write PowerShell script to a temp file to avoid quoting issues
    const psScriptPath = path.join(DIST_DIR, '_make-zip.ps1').replace(/\//g, '\\');
    const zipPathW  = ZIP_PATH.replace(/\//g, '\\');
    const stageW    = STAGE_DIR.replace(/\//g, '\\');
    const fileList  = entries.map(e => path.join(STAGE_DIR, e).replace(/\//g, '\\')).join("','");
    // NOTE: zip entry names must use forward slashes — backslash entries make
    // itch.io's html player (and unix unzip) treat them as flat filenames.
    const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open('${zipPathW}', 'Create')
$files = @('${fileList}')
foreach ($file in $files) {
  $rel = $file.Substring(${stageW.length + 1}) -replace '\\\\', '/'
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
    const args = [ZIP_PATH, ...entries.map(e => e.split(path.sep).join('/'))];
    const result = spawnSync('zip', args, { cwd: STAGE_DIR, stdio: 'inherit' });
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
  console.log(`  Target: ${ITCH_USER}/${ITCH_GAME}:${ITCH_CHANNEL}` + (DRY_RUN ? '  (DRY RUN — no push)' : ''));
  console.log('');

  try {
    const entries = collectEntries();
    stageFiles(entries);
    buildZip(entries);
    if (DRY_RUN) {
      ok('Dry run complete — zip staged at ' + ZIP_PATH + ', nothing pushed.');
      console.log('');
      return;
    }
    await ensureButler();
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
