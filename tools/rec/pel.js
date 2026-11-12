// Peluutin stills and clips with seeded demo data. node pel.js <step> [dry]
const { launch, record, OUT } = require('./lib'); const path = require('path'); const fs = require('fs'); const seed = require('./pel-seed');
const URL = 'https://peluutin.vercel.app/';
const [step, dry] = process.argv.slice(2);
const run = async (page, name, fn) => dry ? fn() : record(page, name, fn);
const shot = (p, n) => p.screenshot({ path: path.join(OUT, n) });
const btns = async (page) => (await page.getByRole('button').evaluateAll(es => es.map(e => (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()))).join(' | ');
async function open({ sport = 'football', theme = 'dark', side, phone, url = URL } = {}) {
  const data = seed({ sport, theme });
  const env = phone ? { width: 390, height: 844, scale: 2, mobile: true } : { width: 1280, height: 800, scale: 1.5 };
  const { browser, context, page } = await launch(env);
  await context.addInitScript(([d, side]) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.clear(); localStorage.setItem('vaihtopeli-teams', JSON.stringify(d.teams)); localStorage.setItem('peluutin-active-match', JSON.stringify({ [d.sport]: d.active }));
    localStorage.setItem('peluutin-exercise-draft-v1-' + d.active.teamId, JSON.stringify(d.draft)); localStorage.setItem('peluutin-sport', d.sport); localStorage.setItem('peluutin-theme', d.theme);
    localStorage.setItem('peluutin-analytics-consent-v2', 'denied'); if (side) localStorage.setItem('peluutin-exercise-tool-side', side); }, [data, side]);
  await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  return { browser, page };
}
(async () => {
  if (step === 'look-planner') {
    const { browser, page } = await open();
    console.log(await btns(page)); console.log((await page.getByRole('link').allInnerTexts()).join(' | ')); await shot(page, 'pl-0.png'); await page.getByText('Harjoitteet', { exact: true }).first().click(); await page.waitForTimeout(3000);
    await shot(page, 'pl-1.png'); console.log(await btns(page));
    await browser.close();
  }
  const planner = async (page, { names = true } = {}) => { await page.getByText('Harjoitteet', { exact: true }).first().click(); await page.waitForTimeout(2500);
    if (names) { await page.getByRole('button', { name: 'Näytä nimet' }).click(); await page.waitForTimeout(400); } };
  if (step === 'stills') {
    let o = await open(); await shot(o.page, 'match-football.png');
    await planner(o.page); await o.page.getByRole('button', { name: 'Aikajana' }).click(); await o.page.waitForTimeout(1500); await shot(o.page, 'planner-dark.png'); await o.browser.close();
    o = await open({ sport: 'futsal' }); await shot(o.page, 'match-futsal.png'); await o.browser.close();
    o = await open({ theme: 'light' }); await planner(o.page); await o.page.getByRole('button', { name: 'Aikajana' }).click(); await o.page.waitForTimeout(1500); await shot(o.page, 'planner-light.png'); await o.browser.close();
    o = await open(); await planner(o.page); await o.page.getByRole('button', { name: '2D' }).click(); await o.page.waitForTimeout(800);
    await o.page.getByRole('button', { name: 'Kenttä ja maalit' }).click(); await o.page.waitForTimeout(500); await o.page.getByRole('button', { name: 'Pelkkä nurmi' }).click(); await o.page.waitForTimeout(500); await o.page.locator('.exercise-tool-popover').getByRole('button', { name: 'Sulje' }).click(); await o.page.waitForTimeout(500);
    await o.page.getByRole('button', { name: 'Tasot' }).click(); await o.page.waitForTimeout(1200); await shot(o.page, 'planner-layers.png'); await o.browser.close();
    o = await open({ side: 'left' }); await planner(o.page); await o.page.getByRole('button', { name: 'Lisää elementtejä' }).click(); await o.page.waitForTimeout(1200); await shot(o.page, 'planner-left.png'); await o.browser.close();
  }
  if (step === 'look-phone') {
    const o = await open({ phone: true }); const page = o.page;
    await shot(page, 'ph-1.png'); console.log(await btns(page));
    await page.getByRole('button', { name: /Sisu/ }).first().click(); await page.waitForTimeout(1200); await shot(page, 'ph-2.png');
    console.log(await btns(page));
    await o.browser.close();
  }
  const ease = (page, dy, ms) => page.evaluate(([dy, ms]) => new Promise(r => { const y0 = scrollY, t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; scrollTo(0, y0 + dy * e); k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); }), [dy, ms]);
  const tapOn = async (page, loc) => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  if (step === 'sub') {
    const o = await open({ phone: true }); const page = o.page;
    await page.evaluate(() => { const h = [...document.querySelectorAll('h1,h2,h3,p,span,div')].find(e => e.children.length === 0 && e.textContent.trim() === 'Vaihtopenkki'); scrollTo(0, h.getBoundingClientRect().top + scrollY - 250); }); await page.waitForTimeout(800);
    await run(page, 'p-sub', async () => {
      await page.waitForTimeout(700); await tapOn(page, page.getByRole('button', { name: /Sisu/ }).first()); await page.waitForTimeout(1300);
      await ease(page, 420, 900); await page.waitForTimeout(700);
      await tapOn(page, page.getByRole('button', { name: /^Onni 11/ }).first()); await page.waitForTimeout(1200);
      await ease(page, -420, 900); await page.waitForTimeout(1400);
    });
    await o.browser.close();
  }
  if (step === 'scroll') {
    const o = await open({ phone: true }); const page = o.page;
    await run(page, 'p-scroll', async () => { await page.waitForTimeout(900); const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight); await ease(page, h, 5200); await page.waitForTimeout(1200); });
    await o.browser.close();
  }
  if (step === 'exercise') {
    const o = await open(); const page = o.page; await planner(page); await page.waitForTimeout(600);
    await run(page, 'p-exercise', async () => {
      await page.waitForTimeout(700); await page.getByRole('button', { name: 'Aikajana' }).click(); await page.waitForTimeout(900);
      await page.getByRole('button', { name: 'Toista' }).click(); await page.waitForTimeout(6500);
      await page.getByRole('button', { name: 'Sulje aikajana' }).click(); await page.waitForTimeout(700);
      await page.getByRole('button', { name: 'Toista' }).click(); await page.waitForTimeout(6500);
    });
    await o.browser.close();
  }
  if (step === 'thumb') {
    const { browser, page } = await launch({ width: 960, height: 600, scale: 2 });
    await page.goto(fs.readFileSync(path.join(OUT, 'share-url.txt'), 'utf8'), { waitUntil: 'networkidle' }); await page.waitForTimeout(3000); await page.getByRole('button', { name: 'Ei kiitos' }).click().catch(() => {}); await page.waitForTimeout(1200);
    const cb = await page.locator('canvas').first().boundingBox(); console.log(cb); const w = cb.width, h = Math.min(cb.height, w * .625);
    await page.screenshot({ path: path.join(OUT, 'drill-share.png'), clip: { x: 317, y: 200, width: 326, height: 204 } }); await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
