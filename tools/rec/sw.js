const { launch } = require('./lib');
(async () => { for (const env of [{ width: 1280, height: 800, scale: 1 }, { width: 390, height: 844, scale: 1, mobile: true }]) {
  const { browser, page } = await launch(env);
  for (const u of ['http://localhost:8097/kelikamera/', 'https://www.petu.design/kelikamera/']) {
    await page.goto(u, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    await page.locator('[data-mode=full]').click(); await page.waitForTimeout(800);
    console.log(env.width, u.slice(0, 22), await page.evaluate(() => { const w = innerWidth; const bad = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > w + 1).slice(0, 4).map(e => e.tagName + '.' + e.className); return document.documentElement.scrollWidth + '/' + w + ' ' + bad.join(' ; '); }));
  }
  await browser.close(); } })();
