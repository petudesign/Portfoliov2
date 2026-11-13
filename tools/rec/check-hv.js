const { launch, OUT } = require('./lib'); const path = require('path');
(async () => { for (const [t, env, mode] of [['dt', { width: 1280, height: 900, scale: 1 }, 'tldr'], ['df', { width: 1280, height: 1400, scale: 1 }, 'full'], ['mf', { width: 390, height: 2400, scale: 1, mobile: true }, 'full']]) {
  const { browser, page } = await launch(env);
  await page.goto('http://localhost:8097/havain/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  await page.locator(`[data-mode=${mode}]`).click(); await page.waitForTimeout(600);
  await page.evaluate(() => { const e = document.getElementById('c6r'); scrollTo({ top: e.getBoundingClientRect().top + scrollY - 60, behavior: 'instant' }); }); await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, `hv-${t}.png`) }); console.log(t, await page.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth));
  await browser.close(); } })();
