const { launch, OUT } = require('./lib'); const path = require('path');
(async () => {
  const { browser, page } = await launch({ width: 390, height: 844, scale: 1, mobile: true });
  await page.goto('http://localhost:8097/kelikamera/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  await page.locator('[data-mode=full]').click(); await page.waitForTimeout(800);
  for (const [n, sel] of [['scope', '.scope'], ['c5r', 'section[aria-labelledby=c5] .blocks > div:nth-child(3)'], ['c6a', 'section[aria-labelledby=c6a]'], ['pers', '.personas li:nth-child(2)'], ['c0', 'section[aria-labelledby=c0]']]) {
    await page.evaluate((s) => { const e = document.querySelector(s); scrollTo({ top: e.getBoundingClientRect().top + scrollY - 70, behavior: 'instant' }); }, sel);
    await page.waitForTimeout(2200); await page.screenshot({ path: path.join(OUT, `cm-${n}.png`) });
  }
  console.log(await page.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
