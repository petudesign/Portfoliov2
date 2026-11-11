// Crops for the Kelikamera persona rows, from the live app (2x).
const { launch, OUT } = require('./lib'); const path = require('path');
const init = () => { let ml; Object.defineProperty(window, 'maplibregl', { configurable: true, get() { return ml; }, set(v) {
  const M = v.Map; v.Map = class extends M { constructor(...a) { super(...a); window.__map = this; } }; ml = v; } }); };
const o = (n) => path.join(OUT, n);
async function open(page) { await page.goto('https://petudesign.github.io/kelikamera/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'EN', exact: true }).first().click(); await page.waitForTimeout(1000); }
(async () => {
  const { browser, page } = await launch({ init, scale: 2 });
  await open(page);
  // 1. legend and the line that says what the project is for
  const panel = await page.locator('text=Colours are conditions').first().evaluate((el) => { let p = el; while (p && p.getBoundingClientRect().width < 300) p = p.parentElement; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  console.log('legend text', panel);
  await page.screenshot({ path: o('p-legend.png'), clip: { x: panel.x - 24, y: panel.y - 14, width: panel.w + 48, height: await page.locator('text=No measurement').first().evaluate((el, y0) => el.getBoundingClientRect().bottom + 22 - y0, panel.y - 14) } });
  // 2. ice beside dry on road 21
  const pair = await page.evaluate(() => { const m = window.__map; const fs = m.queryRenderedFeatures().filter(f => f.layer.id === 'cams');
    console.log('x');const ks={};fs.forEach(f=>ks[f.properties.k]=(ks[f.properties.k]||0)+1);window.__ks=ks;const ice = fs.filter(f => f.properties.k === 'jää/kuura'), dry = fs.filter(f => f.properties.k === 'kuiva');
    let best = null; for (const a of ice) for (const b of dry) { const d = Math.hypot((a.geometry.coordinates[0] - b.geometry.coordinates[0]) * Math.cos(a.geometry.coordinates[1] * Math.PI / 180), a.geometry.coordinates[1] - b.geometry.coordinates[1]);
      if (!best || d < best.d) best = { d, a: a.geometry.coordinates, b: b.geometry.coordinates }; }
    return best || {}; });
  console.log('pair', pair, await page.evaluate(() => window.__ks));
  await page.evaluate((p) => { const m = window.__map; const lo = [Math.min(p.a[0], p.b[0]), Math.min(p.a[1], p.b[1])], hi = [Math.max(p.a[0], p.b[0]), Math.max(p.a[1], p.b[1])];
    const cam = m.cameraForBounds([lo, hi], { padding: 60 }); m.jumpTo({ center: cam.center, zoom: Math.min(cam.zoom, 11) - 0.2 }); }, pair);
  await page.waitForTimeout(3500);
  const cv = await page.evaluate(() => { const r = window.__map.getCanvas().getBoundingClientRect(); return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; });
  await page.screenshot({ path: o('p-ice.png'), clip: { x: cv.cx - 200, y: cv.cy - 125, width: 400, height: 250 } });
  // 3. route summary, Turku to Oulu
  await open(page);
  await page.getByRole('tab').nth(1).click(); await page.waitForTimeout(500);
  for (const [ph, q] of [['e.g. Kamppi, Helsinki', 'Turku'], ['e.g. Levi', 'Oulu']]) {
    const c = page.getByPlaceholder(ph); await c.click(); await c.fill(q); await page.waitForTimeout(2000);
    await page.getByRole('option').first().click(); await page.waitForTimeout(1500);
  }
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(3000);
  const sum = await page.locator('text=traffic weather warning').first().evaluate((el) => { let p = el; for (let i = 0; i < 8 && p; i++) { if (p.getBoundingClientRect().height > 300) break; p = p.parentElement; } const r = p.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  console.log('summary', sum);
  await page.screenshot({ path: o('p-route.png'), clip: { x: sum.x, y: sum.y, width: sum.w, height: sum.h } });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
