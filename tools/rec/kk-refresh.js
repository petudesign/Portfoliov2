// Refreshes all Kelikamera case study visuals from https://petudesign.github.io/kelikamera/
// Desktop at 1440x900 @ 4/3 (= 1920x1200) and mobile at 390x844 @ 2 (= 780x1688).
const { launch, record, OUT } = require('./lib');
const fs = require('fs');
const path = require('path');

const TARGET = path.resolve(__dirname, '../../kk');
const URL = 'https://petudesign.github.io/kelikamera/';

const init = () => {
  let ml;
  Object.defineProperty(window, 'maplibregl', {
    configurable: true,
    get() { return ml; },
    set(v) {
      const M = v.Map;
      v.Map = class extends M {
        constructor(...a) { super(...a); window.__map = this; }
      };
      ml = v;
    },
  });
};

async function openApp(page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => window.__map && window.__map.getLayer('cams') && window.__map.queryRenderedFeatures({ layers: ['cams'] }).length > 50,
    null,
    { timeout: 60000 }
  );
  await page.waitForTimeout(1600);
  const enBtn = page.getByRole('button', { name: 'EN', exact: true }).first();
  if (await enBtn.isVisible()) {
    await enBtn.click();
    await page.waitForTimeout(1000);
  }
}

async function flyAndOpen(page) {
  await page.evaluate(() => window.__map.flyTo({ center: [24.6, 60.9], zoom: 7.4, duration: 3200, essential: true }));
  await page.waitForTimeout(3600);
  const pt = await page.evaluate(() => {
    const m = window.__map;
    const c = m.project([24.46, 61.0]);
    const fs = m.queryRenderedFeatures([[c.x - 160, c.y - 160], [c.x + 160, c.y + 160]])
      .filter((f) => f.layer.id === 'cams' && f.properties.k !== 'ei mittausta');
    if (!fs.length) return null;
    const p = m.project(fs[0].geometry.coordinates);
    const r = m.getCanvas().getBoundingClientRect();
    return { x: r.left + p.x, y: r.top + p.y };
  });
  if (pt) {
    await page.mouse.move(pt.x, pt.y, { steps: 12 });
    await page.mouse.click(pt.x, pt.y);
  }
  await page.waitForTimeout(3200);
}

async function run() {
  // 1. Desktop overview, clip, camera still
  {
    const { browser, page } = await launch({ width: 1440, height: 900, scale: 4 / 3, init });
    await openApp(page);
    await page.screenshot({ path: path.join(TARGET, 'kartta-desktop.jpg'), type: 'jpeg', quality: 88 });

    await record(page, 'kk-map', async () => {
      await page.waitForTimeout(700);
      await flyAndOpen(page);
    }, { fps: 30, crf: 34 });

    await page.screenshot({ path: path.join(TARGET, 'kk-camera.jpg'), type: 'jpeg', quality: 88 });
    fs.copyFileSync(path.join(OUT, 'kk-map.webm'), path.join(TARGET, 'kk-map.webm'));
    fs.copyFileSync(path.join(OUT, 'kk-map-poster.jpg'), path.join(TARGET, 'kk-map.jpg'));
    await browser.close();
  }

  // 2. Desktop route search: Turku -> Oulu
  {
    const { browser, page } = await launch({ width: 1440, height: 900, scale: 4 / 3, init });
    await openApp(page);
    const routeTab = page.getByRole('tab').nth(1);
    if (await routeTab.isVisible()) {
      await routeTab.click();
      await page.waitForTimeout(500);
    }
    for (const [ph, q] of [['e.g. Kamppi, Helsinki', 'Turku'], ['e.g. Levi', 'Oulu']]) {
      const c = page.getByPlaceholder(ph);
      if (await c.isVisible()) {
        await c.click();
        await c.fill(q);
        await page.waitForTimeout(2000);
        const opt = page.getByRole('option').first();
        if (await opt.isVisible()) await opt.click();
        await page.waitForTimeout(1500);
      }
    }
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.waitForTimeout(3200);
    await page.screenshot({ path: path.join(TARGET, 'live-reitti-turku-oulu.jpg'), type: 'jpeg', quality: 88 });
    await browser.close();
  }

  // 3. Mobile stills (390x844 @ 2x => 780x1688): Getting slippery & Traffic weather warnings
  {
    const { browser, page } = await launch({ width: 390, height: 844, scale: 2, mobile: true, init });
    await openApp(page);
    // Log available tabs/buttons on mobile for diagnostics
    const mobBtns = await page.evaluate(() => [...document.querySelectorAll('button, [role="tab"]')].map(b => b.textContent.trim()).filter(Boolean).slice(0, 25));
    console.log('Mobile controls:', mobBtns);

    // Open Getting slippery tab/button
    const slipBtn = page.locator('button, [role="tab"]').filter({ hasText: /Slippery|Getting slippery/i }).first();
    if (await slipBtn.isVisible()) {
      await slipBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(TARGET, 'phone-slippery.jpg'), type: 'jpeg', quality: 88 });

    // Open Warnings tab/button
    const warnBtn = page.locator('button, [role="tab"]').filter({ hasText: /Warning/i }).first();
    if (await warnBtn.isVisible()) {
      await warnBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: path.join(TARGET, 'phone-warnings.jpg'), type: 'jpeg', quality: 88 });
    await browser.close();
  }

  console.log('Kelikamera refresh complete!');
}

run().catch((e) => { console.error(e); process.exit(1); });
