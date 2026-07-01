const { chromium } = require('C:/Users/Mark Hansen/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:/Users/Mark Hansen/Desktop/Steam';
const DEV_DIR = path.resolve(__dirname);

const ASSETS = [
  {
    html: 'steam-capsule.html',
    out: 'capsule-460x215.png',
    w: 460, h: 215,
  },
  {
    html: 'steam-library-capsule.html',
    out: 'library-capsule-600x900.png',
    w: 600, h: 900,
  },
  {
    html: 'steam-hero.html',
    out: 'library-hero-1920x620.png',
    w: 1920, h: 620,
  },
  {
    html: 'steam-logo.html',
    out: 'library-logo-650x248.png',
    w: 650, h: 248,
  },
  {
    html: 'steam-page-bg.html',
    out: 'page-background-1438x810.png',
    w: 1438, h: 810,
  },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  for (const asset of ASSETS) {
    console.log(`Rendering: ${asset.out} (${asset.w}x${asset.h})`);
    const page = await browser.newPage();
    await page.setViewportSize({ width: asset.w, height: asset.h });

    const filePath = path.join(DEV_DIR, asset.html);
    await page.goto('file:///' + filePath.replace(/\\/g, '/'));
    await page.waitForTimeout(2500); // fonts + images

    await page.screenshot({
      path: path.join(OUT_DIR, asset.out),
      clip: { x: 0, y: 0, width: asset.w, height: asset.h },
    });

    await page.close();
    console.log(`  Saved: ${OUT_DIR}/${asset.out}`);
  }

  await browser.close();
  console.log('\nAll done. Check Desktop/Steam/');
})();
