const { launch, OUT } = require('./lib'); const path = require('path');
(async () => {
  for (const [tag, env] of [['d', { width: 1280, height: 800, scale: 1 }], ['m', { width: 390, height: 844, scale: 1, mobile: true }]]) {
    const { browser, context, page } = await launch(env);
    await context.addInitScript(() => { try { sessionStorage.setItem('entrance-seen', '1'); localStorage.setItem('case-mode', 'full'); } catch {} });
    await page.goto('http://localhost:8097/kelikamera/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    await page.locator('[data-mode=full]').click(); await page.waitForTimeout(600);
    await page.addStyleTag({ content: '.reveal,.full,main *{opacity:1!important;transform:none!important;animation:none!important;transition:none!important} .mode-bar,header{position:static!important}' });
    for (const [n, sel] of [['scope', '.scope'], ['c5', 'section[aria-labelledby=c5]'], ['c4', 'section[aria-labelledby=c4]'], ['c6a', 'section[aria-labelledby=c6a]'], ['pers', '.personas'], ['c0', 'section[aria-labelledby=c0]']]) {
      const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
      await el.screenshot({ path: path.join(OUT, `chk-${tag}-${n}.png`) });
    }
    console.log(tag, await page.evaluate(() => document.documentElement.scrollWidth + '/' + innerWidth));
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
