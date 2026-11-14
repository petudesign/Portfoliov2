// Kelikamera stills and clip at 1440x900 (x4/3 = 1920x1200), where the timeline clears both side panels.
const { launch, record, OUT } = require('./lib'); const path = require('path');
const init = () => { let ml; Object.defineProperty(window, 'maplibregl', { configurable: true, get() { return ml; }, set(v) {
  const M = v.Map; v.Map = class extends M { constructor(...a) { super(...a); window.__map = this; } }; ml = v; } }); };
const URL = 'https://petudesign.github.io/kelikamera/', step = process.argv[2] || 'look';
const env = { width: 1440, height: 900, scale: 4 / 3, init };
async function open(page) { await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__map && window.__map.getLayer('cams') && window.__map.queryRenderedFeatures({ layers: ['cams'] }).length > 50, null, { timeout: 60000 }); await page.waitForTimeout(1500); await page.getByRole('button', { name: 'EN', exact: true }).first().click(); await page.waitForTimeout(1000); }
const flyAndOpen = async (page) => {
  await page.evaluate(() => window.__map.flyTo({ center: [24.6, 60.9], zoom: 7.4, duration: 3200, essential: true })); await page.waitForTimeout(3600);
  const pt = await page.evaluate(() => { const m = window.__map, c = m.project([24.46, 61.0]);
    const fs = m.queryRenderedFeatures([[c.x - 120, c.y - 120], [c.x + 120, c.y + 120]]).filter((f) => f.layer.id === 'cams' && f.properties.k !== 'ei mittausta'); if (!fs.length) return null;
    const p = m.project(fs[0].geometry.coordinates); const r = m.getCanvas().getBoundingClientRect(); return { x: r.left + p.x, y: r.top + p.y }; });
  if (pt) { await page.mouse.move(pt.x, pt.y, { steps: 12 }); await page.mouse.click(pt.x, pt.y); }
  await page.waitForTimeout(3200);
};
(async () => {
  const { browser, page } = await launch(env);
  await open(page);
  if (step === 'look') { await page.screenshot({ path: path.join(OUT, 'kkw-overview.png') }); await flyAndOpen(page); await page.screenshot({ path: path.join(OUT, 'kkw-camera.png') }); }
  if (step === 'clip') { await record(page, 'kk-map', async () => { await page.waitForTimeout(700); await flyAndOpen(page); }); await page.screenshot({ path: path.join(OUT, 'kkw-camera.png') }); }
  if (step === 'route') {
    await page.getByRole('tab').nth(1).click(); await page.waitForTimeout(500);
    for (const [ph, q] of [['e.g. Kamppi, Helsinki', 'Turku'], ['e.g. Levi', 'Oulu']]) { const c = page.getByPlaceholder(ph); await c.click(); await c.fill(q); await page.waitForTimeout(2000); await page.getByRole('option').first().click(); await page.waitForTimeout(1500); }
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(3000); await page.screenshot({ path: path.join(OUT, 'kkw-route.png') });
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
