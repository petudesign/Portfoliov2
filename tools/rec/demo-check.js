const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1900); await p.screenshot({ path: path.join(__dirname, 'out/demo-curtain.png') });
  await p.waitForTimeout(2200); await p.screenshot({ path: path.join(__dirname, 'out/demo-hero.png') });
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(2000); await p.screenshot({ path: path.join(__dirname, 'out/demo-foot.png') });
  console.log(await p.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth));
  await b.close(); })();
