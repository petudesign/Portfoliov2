const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(700); await p.screenshot({ path: path.join(__dirname, 'out/dz-1.png') });
  await p.waitForTimeout(450); await p.screenshot({ path: path.join(__dirname, 'out/dz-2.png') });
  await p.waitForTimeout(1500); await p.screenshot({ path: path.join(__dirname, 'out/dz-3.png') });
  await p.waitForTimeout(800); await p.click('[data-p="_"]'); await p.waitForTimeout(900); await p.screenshot({ path: path.join(__dirname, 'out/dz-4.png') });
  await b.close(); })();
