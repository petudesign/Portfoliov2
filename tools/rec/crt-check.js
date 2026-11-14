const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); for (const [t, vp] of [['d', { width: 1280, height: 800 }], ['m', { width: 390, height: 844 }]]) { const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500); await p.screenshot({ path: path.join(__dirname, `out/crt-${t}.png`) });
  console.log(t, await p.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth)); await p.close(); }
  await b.close(); })();
