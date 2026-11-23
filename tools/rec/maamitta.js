// Records Maamitta demo clip (1920x1200 VP9 WebM) + desktop & mobile stills from https://maamitta.pages.dev/
const { launch, record, OUT } = require('./lib');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.resolve(__dirname, '../../m');
fs.mkdirSync(TARGET_DIR, { recursive: true });

async function switchToEnglish(page) {
  await page.getByRole('button', { name: 'Kartta ja asetukset' }).click();
  await page.waitForTimeout(300);
  const enBtn = page.getByRole('button', { name: /^English$/i });
  if (await enBtn.isVisible()) {
    await enBtn.click();
    await page.waitForTimeout(300);
  }
  await page.getByRole('button', { name: /Map & settings|Kartta ja asetukset/i }).click();
  await page.waitForTimeout(300);
}

async function searchAndCenter(page, query) {
  const input = page.locator('input[type="search"]');
  await input.fill(query);
  await page.waitForTimeout(1000);
  const firstOpt = page.locator('.search-results button, .search-dropdown button, [role="option"]').first();
  if (await firstOpt.isVisible()) {
    await firstOpt.click();
  } else {
    await input.press('Enter');
  }
  await page.waitForTimeout(2200);
  // Clear search text so top bar stays clean
  const clearBtn = page.locator('.search-clear, button[aria-label*="Clear"], button[aria-label*="Tyhjennä"]').first();
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
  } else {
    await input.fill('');
  }
  await page.waitForTimeout(300);
}

async function scrollCalculatorToEstimate(page, smooth = true) {
  await page.evaluate((isSmooth) => {
    const scrollers = [...document.querySelectorAll('*')].filter(
      (el) => el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY !== 'visible'
    );
    const target = scrollers.find((el) => el.getBoundingClientRect().left > 500) || scrollers[scrollers.length - 1];
    if (target) target.scrollTo({ top: 690, behavior: isSmooth ? 'smooth' : 'instant' });
  }, smooth);
}

async function run() {
  // 1. Desktop (1280x800 @ 1.5x => 1920x1200)
  const { browser, page } = await launch({ width: 1280, height: 800, scale: 1.5 });
  await page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await switchToEnglish(page);
  await searchAndCenter(page, 'Pakilantie 60, Helsinki');

  const mapBox = await page.locator('.maplibregl-canvas').boundingBox();
  // Target the residential parcel to the left of Pakilantie road
  const px = mapBox.x + mapBox.width * 0.34;
  const py = mapBox.y + mapBox.height * 0.54;

  await record(page, 'maamitta-demo', async () => {
    await page.waitForTimeout(450);
    // Activate Pick tool
    await page.getByRole('button', { name: /Pick/i }).first().click();
    await page.waitForTimeout(350);
    // Move cursor onto the residential parcel and click
    await page.mouse.move(px, py, { steps: 14 });
    await page.waitForTimeout(180);
    await page.mouse.click(px, py);
    // Wait for MML parcel + building cutout to render
    await page.waitForTimeout(2400);
    // Center/fit the selected parcel nicely
    const fitBtn = page.getByRole('button', { name: /Fit|Center on selection|Keskitä valittuun/i }).first();
    if (await fitBtn.isVisible()) {
      await fitBtn.click();
      await page.waitForTimeout(900);
    }
    // Switch preset to Stone paving
    const paving = page.locator('.preset-btn').filter({ hasText: /Stone paving|Pihakiveys/i }).first();
    if (await paving.isVisible()) {
      await paving.click();
      await page.waitForTimeout(600);
    }
    // Smoothly scroll calculator to the itemized estimate & VAT total
    await scrollCalculatorToEstimate(page, true);
    await page.waitForTimeout(1500);
  }, { fps: 30, crf: 34 });

  // Capture crisp hero poster frame (parcel + building cutout + edge lengths + itemized estimate!)
  await page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-demo.jpg'), type: 'jpeg', quality: 88 });

  // Capture layers still: zoom out 2 steps so Topographic map is sharp, enable Soil map (GTK), open Map & settings
  const zoomOut = page.locator('.maplibregl-ctrl-zoom-out');
  await zoomOut.click();
  await page.waitForTimeout(450);
  await zoomOut.click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /Map & settings/i }).click();
  await page.waitForTimeout(350);
  const topoBtn = page.getByRole('button', { name: /Topographic map/i }).first();
  if (await topoBtn.isVisible()) {
    await topoBtn.click();
    await page.waitForTimeout(1200);
  }
  const soilBtn = page.getByRole('button', { name: /Soil map/i }).first();
  if (await soilBtn.isVisible()) {
    await soilBtn.click();
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-layers.jpg'), type: 'jpeg', quality: 88 });

  await browser.close();

  fs.copyFileSync(path.join(OUT, 'maamitta-demo.webm'), path.join(TARGET_DIR, 'maamitta-demo.webm'));

  // 2. Mobile stills (390x844 @ 2x => 780x1688)
  const mob = await launch({ width: 390, height: 844, scale: 2, mobile: true });
  await mob.page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
  await mob.page.waitForTimeout(1800);
  await switchToEnglish(mob.page);
  await searchAndCenter(mob.page, 'Pakilantie 60, Helsinki');

  // Click Pick tool (2nd chip in dock) and tap the house parcel
  await mob.page.locator('.tool-chip').nth(1).click();
  await mob.page.waitForTimeout(350);
  const mBox = await mob.page.locator('.maplibregl-canvas').boundingBox();
  await mob.page.mouse.click(mBox.x + mBox.width * 0.34, mBox.y + mBox.height * 0.54);
  await mob.page.waitForTimeout(2400);
  // Fit selection on mobile too
  const fitMob = mob.page.getByRole('button', { name: /Fit|Center on selection|Keskitä valittuun/i }).first();
  if (await fitMob.isVisible()) {
    await fitMob.click();
    await mob.page.waitForTimeout(1000);
  }
  await mob.page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-phone-map.jpg'), type: 'jpeg', quality: 88 });

  // Open Estimate bottom sheet on mobile and scroll to the itemized Estimate card
  const estBtn = mob.page.locator('.mobile-sheet-trigger');
  if (await estBtn.isVisible()) {
    await estBtn.click();
    await mob.page.waitForTimeout(600);
    const pavingM = mob.page.locator('.preset-btn').filter({ hasText: /Stone paving|Pihakiveys/i }).first();
    if (await pavingM.isVisible()) {
      await pavingM.click();
      await mob.page.waitForTimeout(450);
    }
    await scrollCalculatorToEstimate(mob.page, false);
    await mob.page.waitForTimeout(400);
  }
  await mob.page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-phone-sheet.jpg'), type: 'jpeg', quality: 88 });
  await mob.browser.close();

  console.log('Done! Files in m/:', fs.readdirSync(TARGET_DIR));
}

run().catch((e) => { console.error(e); process.exit(1); });
