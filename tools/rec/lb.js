const { launch, OUT } = require('./lib'); const path = require('path');
(async () => { for (const [t, env] of [['d', { width: 1280, height: 800, scale: 1 }], ['m', { width: 390, height: 844, scale: 1, mobile: true }]]) {
  const { browser, page } = await launch(env);
  await page.goto('http://localhost:8097/kelikamera/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  await page.locator('[data-mode=full]').click(); await page.waitForTimeout(500);
  const img = page.locator('img[src="/kk/phone-slippery.jpg"]'); await img.scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await img.click(); await page.waitForTimeout(800);
  const r = await page.locator('.lb img').boundingBox(); console.log(t, r, env.height);
  await page.screenshot({ path: path.join(OUT, 'lb-' + t + '.png') }); await browser.close(); } })();
