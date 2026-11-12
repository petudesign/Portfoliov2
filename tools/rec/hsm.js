// HSM clips and stills. node hsm.js explore|route [dry]
const { launch, record, OUT } = require('./lib'); const path = require('path');
const init = () => { let ml; Object.defineProperty(window, 'maplibregl', { configurable: true, get() { return ml; }, set(v) {
  const M = v.Map; v.Map = class extends M { constructor(...a) { super(...a); window.__map = this; } }; ml = v; } }); };
const URL = 'https://helsinki-sports-map.vercel.app/';
const [step, dry] = process.argv.slice(2);
const shot = (p, n) => p.screenshot({ path: path.join(OUT, n) });
const run = async (page, name, fn) => dry ? fn() : record(page, name, fn);
(async () => {
  if (step === 'explore') {
    const { browser, page } = await launch({ init });
    await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'Only necessary' }).click(); await page.waitForTimeout(1200);
    console.log('map', await page.evaluate(() => !!window.__map));
    await run(page, 'h-explore', async () => {
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: 'Basketball', exact: true }).first().click();
      await page.waitForTimeout(1600); if (dry) await shot(page, 'hsm-e1.png');
      const K = JSON.parse(process.env.K || '[760,330]'); await page.mouse.move(K[0], K[1], { steps: 10 }); for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(110); }
      await page.waitForTimeout(3200); if (dry) await shot(page, 'hsm-e2.png');
      await page.getByRole('button', { name: /Brahenkenttä/ }).first().click();
      await page.waitForTimeout(3200); if (dry) await shot(page, 'hsm-e3.png');
    });
    if (!dry) await shot(page, 'hsm-explore-end.png');
    await browser.close();
  }
  if (step === 'route' || step === 'walk') {
    const { browser, page } = await launch({ width: 390, height: 844, scale: 2, mobile: true });
    await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'Only necessary' }).click(); await page.waitForTimeout(800);
    await page.getByPlaceholder(/Search/).fill('Aleksis Kiven peruskoulu'); await page.waitForTimeout(1800);
    await page.touchscreen.tap(179, 444); await page.waitForTimeout(2500);
    const go = async () => {
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: 'Directions' }).first().click(); await page.waitForTimeout(1300);
      const st = page.getByPlaceholder('Address or place in Helsinki'); await st.click(); await page.waitForTimeout(300);
      await st.pressSequentially('Helsinginkatu 2', { delay: 90 }); await page.waitForTimeout(1300);
      await page.getByRole('option').first().click(); await page.waitForTimeout(700);
      await page.getByRole('button', { name: 'Find route' }).click(); await page.waitForTimeout(3000);
      if (step === 'walk') return;
      await page.getByRole('button', { name: /5 min/ }).first().click(); await page.waitForTimeout(1500);
      await page.getByRole('button', { name: /6 min/ }).first().click(); await page.waitForTimeout(3200);
    };
    if (step === 'walk') { await go(); const cdp = await page.context().newCDPSession(page); const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] }); await tp('touchStart', 150, 560); for (let i = 1; i <= 12; i++) { await tp('touchMove', 150 + i * 2.6, 560 + i * 1); await page.waitForTimeout(16); } await tp('touchEnd'); await page.waitForTimeout(2500); await shot(page, 'h-route-walk-still.png'); }
    else { await run(page, 'h-route', go); await shot(page, 'h-route-end.png'); }
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
