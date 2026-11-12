const { launch, OUT } = require('./lib'); const path = require('path');
(async () => {
  const { browser, page } = await launch({ scale: 1 });
  await page.goto('https://helsinki-sports-map.vercel.app/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  const btns = await page.getByRole('button').allInnerTexts(); console.log(btns.slice(0, 60).join(' | '));
  await page.screenshot({ path: path.join(OUT, 'hsm-0.png') });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
