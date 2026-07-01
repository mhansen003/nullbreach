const { chromium } = require('C:/Users/Mark Hansen/AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 630, height: 500 });

  const filePath = path.resolve(__dirname, 'cover-template.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'));

  // Wait for fonts + images to load
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: path.resolve(__dirname, '..', 'dev', 'cover-630x500.png'),
    clip: { x: 0, y: 0, width: 630, height: 500 }
  });

  await browser.close();
  console.log('Done: dev/cover-630x500.png');
})();
