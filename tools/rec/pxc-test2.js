const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' });
  for (const [n, vp, label, mobile] of [['tahti', { width: 1280, height: 800 }, 'Tahti'], ['shav', { width: 1280, height: 800 }, 'S-hävikki'], ['mob', { width: 390, height: 844 }, 'Peluutin', true], ['mobkk', { width: 390, height: 844 }, 'Kelikamera AI', true]]) {
    const c = await b.newContext({ viewport: vp, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: 2 }); const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto('http://localhost:8097/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    await p.evaluate((l) => { PixelCurtain.leave(l, '/#x'); }, label); await p.waitForTimeout(650);
    await p.screenshot({ path: path.join(__dirname, 'out', 'pxc2-' + n + '.png') }); await c.close(); }
  await b.close(); })();
