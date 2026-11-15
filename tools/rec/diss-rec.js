const { launch, record } = require('./lib');
(async () => { const { browser, page } = await launch({ width: 1440, height: 900, scale: 1 });
  await page.goto('http://localhost:8097/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('a.case-link[href="/kelikamera/"]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(600);
  await record(page, 'curtain-dissolve', async () => {
    await page.waitForTimeout(500);
    await page.evaluate(() => { PixelCurtain.leave('Kelikamera AI', '#x'); }); await page.waitForTimeout(650);
    // stand-in for the page load: swap to the case page underneath, then arrive
    await page.evaluate(() => { const old = document.querySelector('.pxc'); scrollTo(0, 0); PixelCurtain.arrive('Kelikamera AI', () => {}); setTimeout(() => old.remove(), 30); });
    await page.waitForTimeout(1300);
  }, { fps: 60, crf: 30 });
  await browser.close(); })();
