// Captures Maamitta multi-zone workflow video (partial paving + 3.5 m driveway + quote items),
// real exported A4 PDF quote rendered to JPEG, and fixed 390px mobile stills.
const { launch, record, OUT } = require('./lib');
const { execSync } = require('child_process');
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
  const clearBtn = page.locator('.search-clear, button[aria-label*="Clear"], button[aria-label*="Tyhjennä"]').first();
  if (await clearBtn.isVisible()) {
    await clearBtn.click();
  } else {
    await input.fill('');
  }
  await page.waitForTimeout(300);
}

async function scrollPanel(page, top, smooth = true) {
  await page.evaluate(({ t, isSmooth }) => {
    const scrollers = [...document.querySelectorAll('*')].filter(
      (el) => el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY !== 'visible'
    );
    const target = scrollers.find((el) => el.getBoundingClientRect().left > 500) || scrollers[scrollers.length - 1];
    if (target) target.scrollTo({ top: t, behavior: isSmooth ? 'smooth' : 'instant' });
  }, { t: top, isSmooth: smooth });
}

async function run() {
  // 1. Desktop workflow clip + real PDF quote
  const { browser, context, page } = await launch({ width: 1280, height: 800, scale: 1.5 });
  await page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await switchToEnglish(page);
  await searchAndCenter(page, 'Pakilantie 60, Helsinki');

  const mapBox = await page.locator('.maplibregl-canvas').boundingBox();
  const pt = (rx, ry) => [mapBox.x + mapBox.width * rx, mapBox.y + mapBox.height * ry];

  await record(page, 'maamitta-workflow', async () => {
    await page.waitForTimeout(400);
    // Step A: Draw a partial front-yard polygon for stone paving
    await page.locator('.tool-chip', { hasText: /^Area$/ }).click();
    await page.waitForTimeout(300);
    const polyPts = [pt(0.24, 0.36), pt(0.35, 0.34), pt(0.37, 0.56), pt(0.26, 0.58)];
    for (const [x, y] of polyPts) {
      await page.mouse.move(x, y, { steps: 8 });
      await page.mouse.click(x, y);
      await page.waitForTimeout(220);
    }
    // Select Stone paving & add to quote
    const paving = page.locator('.preset-btn').filter({ hasText: /Stone paving/i }).first();
    await paving.click();
    await page.waitForTimeout(350);
    await scrollPanel(page, 620, true);
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Add to quote/i }).first().click();
    await page.waitForTimeout(700);

    // Step B: Draw a driveway centerline with Line tool and convert to 3.5 m wide corridor
    await page.locator('.tool-chip', { hasText: /^Line$/ }).click();
    await page.waitForTimeout(300);
    const linePts = [pt(0.45, 0.68), pt(0.36, 0.64), pt(0.28, 0.62)];
    for (const [x, y] of linePts) {
      await page.mouse.move(x, y, { steps: 8 });
      await page.mouse.click(x, y);
      await page.waitForTimeout(240);
    }
    await scrollPanel(page, 0, true);
    await page.waitForTimeout(550);
    const createCorridor = page.getByRole('button', { name: /Create 3\.5 m wide area|Create 3,5 m wide area/i }).first();
    if (await createCorridor.isVisible()) {
      await createCorridor.click();
      await page.waitForTimeout(800);
    }
    // Select Gravel / stone & add driveway to quote
    const gravel = page.locator('.preset-btn').filter({ hasText: /Gravel/i }).first();
    await gravel.click();
    await page.waitForTimeout(350);
    await scrollPanel(page, 650, true);
    await page.waitForTimeout(650);
    await page.getByRole('button', { name: /Add to quote/i }).first().click();
    await page.waitForTimeout(900);
    // Scroll down slightly so Quote items list + combined total are clearly visible
    await scrollPanel(page, 820, true);
    await page.waitForTimeout(1400);
  }, { fps: 30, crf: 34 });

  // Capture crisp workflow still (shows driveway corridor + Quote items multi-zone breakdown)
  await page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-workflow.jpg'), type: 'jpeg', quality: 88 });
  fs.copyFileSync(path.join(OUT, 'maamitta-workflow.webm'), path.join(TARGET_DIR, 'maamitta-workflow.webm'));

  // Step C: Fill quote details and download real PDF quote, then rasterize page 1 to m/maamitta-pdf.jpg
  await scrollPanel(page, 1200, false);
  await page.waitForTimeout(300);
  const titleInput = page.locator('input[placeholder*="Driveway"], input[placeholder*="sorastus"]').first();
  if (await titleInput.isVisible()) await titleInput.fill('Front yard paving & gravel driveway');
  const addrInput = page.locator('input[placeholder*="Example Street"], input[placeholder*="Esimerkkitie"]').first();
  if (await addrInput.isVisible()) await addrInput.fill('Pakilantie 60, Helsinki');
  const compInput = page.locator('input[placeholder*="Nordic"], input[placeholder*="Pihaurakointi"]').first();
  if (await compInput.isVisible()) await compInput.fill('Uudenmaan Pihakivi Oy');
  await page.waitForTimeout(250);

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20000 }),
    page.getByRole('button', { name: /Download PDF quote/i }).click(),
  ]);
  const pdfPath = path.join(OUT, 'maamitta-quote.pdf');
  await download.saveAs(pdfPath);
  console.log('Saved PDF:', pdfPath, fs.statSync(pdfPath).size, 'bytes');

  // Render PDF page 1 to PNG via macOS qlmanage, then convert to high-quality JPEG via sips
  execSync(`qlmanage -t -s 1800 -o "${OUT}" "${pdfPath}"`, { stdio: 'ignore' });
  const thumbPng = path.join(OUT, 'maamitta-quote.pdf.png');
  if (fs.existsSync(thumbPng)) {
    execSync(`sips -s format jpeg -s formatOptions 90 "${thumbPng}" --out "${path.join(TARGET_DIR, 'maamitta-pdf.jpg')}"`, { stdio: 'ignore' });
    console.log('Rendered PDF JPEG:', path.join(TARGET_DIR, 'maamitta-pdf.jpg'));
  }

  await browser.close();

  // 2. Fixed Mobile stills (390x844 @ 2x => 780x1688)
  const mob = await launch({ width: 390, height: 844, scale: 2, mobile: true });
  await mob.page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
  await mob.page.waitForTimeout(1800);
  await switchToEnglish(mob.page);
  await searchAndCenter(mob.page, 'Pakilantie 60, Helsinki');

  // Tap Pick tool and pick the residential parcel
  await mob.page.locator('.tool-chip').nth(1).click();
  await mob.page.waitForTimeout(350);
  const mBox = await mob.page.locator('.maplibregl-canvas').boundingBox();
  await mob.page.mouse.click(mBox.x + mBox.width * 0.34, mBox.y + mBox.height * 0.54);
  await mob.page.waitForTimeout(2400);
  const fitMob = mob.page.getByRole('button', { name: /Fit|Center on selection|Keskitä valittuun/i }).first();
  if (await fitMob.isVisible()) {
    await fitMob.click();
    await mob.page.waitForTimeout(1200);
  }
  await mob.page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-phone-map.jpg'), type: 'jpeg', quality: 88 });

  // Open Estimate sheet, switch to Stone paving, scroll to itemized Estimate card + Total
  const estBtn = mob.page.locator('.mobile-sheet-trigger');
  if (await estBtn.isVisible()) {
    await estBtn.click();
    await mob.page.waitForTimeout(650);
    const pavingM = mob.page.locator('.preset-btn').filter({ hasText: /Stone paving/i }).first();
    if (await pavingM.isVisible()) {
      await pavingM.click();
      await mob.page.waitForTimeout(450);
    }
    await scrollPanel(mob.page, 760, false);
    await mob.page.waitForTimeout(400);
  }
  await mob.page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-phone-sheet.jpg'), type: 'jpeg', quality: 88 });
  await mob.browser.close();

  console.log('Done! m/ files:', fs.readdirSync(TARGET_DIR));
}

run().catch((e) => { console.error(e); process.exit(1); });
