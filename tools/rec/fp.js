const { launch, OUT } = require('./lib'); const path = require('path');
(async () => { const { browser, page } = await launch({ width: 1280, height: 900, scale: 0.5 });
  await page.goto('http://localhost:8097/kelikamera/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.locator('[data-mode=tldr]').click(); await page.waitForTimeout(500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(250); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'kk-tldr.png'), fullPage: true }); console.log(h);
  await browser.close(); })();
