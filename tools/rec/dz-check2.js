const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(250); await p.screenshot({ path: path.join(__dirname, 'out/dzz-0.png') }); await p.waitForTimeout(1800);
  const names = ['KorisLab', 'Peluutin', 'Helsinki Sports Map', 'Havain', '_']; let n = 1;
  for (const nm of names) { await p.evaluate((nm) => { go(nm); }, nm); await p.waitForTimeout(900); await p.screenshot({ path: path.join(__dirname, `out/dzz-${n++}.png`) }); await p.waitForTimeout(1300); }
  await b.close(); })();
