const { launch, OUT } = require('./lib'); const path = require('path');
(async () => { for (const [t, env, mode] of [['dt', { width: 1280, height: 900, scale: 1 }, 'tldr'], ['df', { width: 1280, height: 900, scale: 1 }, 'full'], ['mf', { width: 390, height: 1100, scale: 1, mobile: true }, 'full']]) {
  const { browser, page } = await launch(env); page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto('http://localhost:8097/kelikamera/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  await page.locator(`[data-mode=${mode}]`).click(); await page.waitForTimeout(600);
  for (const id of ['c2c', 'c6', 'c7']) { await page.evaluate((id) => { const e = document.getElementById(id); scrollTo({ top: e.getBoundingClientRect().top + scrollY - 60, behavior: 'instant' }); }, id); await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(OUT, `kn-${t}-${id}.png`) }); }
  console.log(t, await page.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth)); await browser.close(); } })();
