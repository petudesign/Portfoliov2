const { launch, OUT } = require('./lib'); const path = require('path'); const seed = require('./pel-seed');
(async () => {
  const data = seed({ sport: process.argv[2] || 'football' });
  const init = (d) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.clear(); localStorage.setItem('vaihtopeli-teams', JSON.stringify(d.teams)); if (d.active) localStorage.setItem('peluutin-active-match', JSON.stringify({ [d.sport]: d.active }));
    localStorage.setItem('peluutin-exercise-draft-v1-' + d.active.teamId, JSON.stringify(d.draft)); localStorage.setItem('peluutin-sport', d.sport); localStorage.setItem('peluutin-theme', d.theme);
    localStorage.setItem('peluutin-analytics-consent-v2', 'denied'); };
  const { browser, context, page } = await launch({ width: 1440, height: 900, scale: 1 });
  await context.addInitScript(init, data);
  await page.goto('https://peluutin.vercel.app/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(OUT, 'pel-0.png') });
  console.log((await page.getByRole('button').evaluateAll(es => es.map(e => (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()))).join(' | ').slice(0, 1200));
  console.log(await page.evaluate(() => Object.keys(localStorage)));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
