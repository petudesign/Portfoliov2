const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core');
const fs = require('fs'), path = require('path');
const [url, outDir, fps = '60', secs = '4', only] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--hide-scrollbars', '--force-device-scale-factor=2'] });
  const p = await (await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })).newPage();
  await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(outDir, { recursive: true });
  const n = Math.round(+fps * +secs), list = only ? only.split(',').map(Number) : [...Array(n).keys()];
  for (const i of list) { await p.evaluate((t) => window.render(t), i / +fps); await p.screenshot({ path: path.join(outDir, 'f' + String(i).padStart(3, '0') + '.png') }); }
  await b.close(); console.log('frames', list.length);
})().catch((e) => { console.error(e); process.exit(1); });
