const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('pageerror', e => console.log('ERR', p.url(), e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  const s = (n) => p.screenshot({ path: path.join(__dirname, 'out', 'pxc-' + n + '.png') });
  await p.goto('http://localhost:8097/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelector('a.case-link[href="/korislab/"]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('a.case-link[href="/korislab/"]').click());
  await p.waitForTimeout(300); await s('1-leaving');
  await p.waitForURL('**/korislab/'); await p.waitForTimeout(120); await s('2-arrived');
  await p.waitForTimeout(650); await s('3-breaking');
  await p.waitForTimeout(1200); await s('4-page');
  console.log('crt layers', await p.evaluate(() => document.querySelectorAll('.crt').length), 'overlay left', await p.evaluate(() => document.querySelectorAll('.pxc').length));
  // back to home from the case
  await p.evaluate(() => { const a = [...document.querySelectorAll('a')].find(a => a.getAttribute('href') === '/'); a.click(); });
  await p.waitForTimeout(450); await s('5-leaving-home');
  await p.waitForURL('http://localhost:8097/'); await p.waitForTimeout(200); await s('6-home-arrived');
  await b.close(); })();
