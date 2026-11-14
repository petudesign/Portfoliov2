const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path'); const fs = require('fs');
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/marks.json'), 'utf8'));
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1200, height: 750 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  const jobs = [
    ['ridge-kelikamera', { w: 1200, h: 750, sp: 4, every: 10, amp: 70, mark: M['Kelikamera AI'], scale: .55, cx: .5, cy: .52, blur: 14 }],
    ['ridge-peluutin', { w: 1200, h: 750, sp: 4, every: 10, amp: 60, mark: M['Peluutin'], scale: .62, cx: .5, cy: .52, blur: 12 }],
    ['ridge-portrait', { w: 1200, h: 750, sp: 4, every: 10, amp: 70, img: '/tools/rec/out/tile.jpg', key: [248, 244, 231], scale: .95, cx: .5, cy: .55 }],
  ];
  for (const [n, o] of jobs) { await p.goto('http://localhost:8097/tools/rec/ridge.html'); await p.evaluate((o) => window.ridge(o), o); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 'out', n + '.png') }); }
  await b.close(); })();
