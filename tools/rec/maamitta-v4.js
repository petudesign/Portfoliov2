// Captures fresh Maamitta visuals after UI polish (b750372):
// 1. Hero clip + poster: Helsinki parcel pick on Satellite HD + automatic building subtraction + Sod / lawn
// 2. Workflow clip + poster + real PDF: Espoo yard on MML Aerial Orthophoto (distinct location & imagery!),
//    drawing a partial front-yard stone paving polygon + 3.5 m gravel driveway corridor into one quote
// 3. Mobile stills (390x844 @ 2x): refreshed map + swipeable calculator sheet
const { launch, record, OUT } = require('./lib');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.resolve(__dirname, '../../m');
fs.mkdirSync(TARGET_DIR, { recursive: true });

async function dismissBannerIfAny(page) {
  // Dismiss beta consent banner if visible so screenshots/videos stay clean
  const reject = page.locator('button').filter({ hasText: /Ei kiitos|No thanks|Decline|Sulje/i }).first();
  if (await reject.isVisible().catch(() => false)) {
    await reject.click();
    await page.waitForTimeout(250);
  }
}

async function switchToEnglish(page, baseMapName = null) {
  await page.getByRole('button', { name: 'Kartta ja asetukset' }).click();
  await page.waitForTimeout(300);
  const enBtn = page.getByRole('button', { name: /^English$/i });
  if (await enBtn.isVisible()) {
    await enBtn.click();
    await page.waitForTimeout(300);
  }
  if (baseMapName) {
    const bm = page.getByRole('button', { name: new RegExp(baseMapName, 'i') }).first();
    if (await bm.isVisible()) {
      await bm.click();
      await page.waitForTimeout(900);
    }
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
  await page.waitForTimeout(2400);
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

async function fillEnglishQuoteDetails(page, title, address, company = 'Uudenmaan Pihakivi Oy') {
  await scrollPanel(page, 1600, false);
  await page.waitForTimeout(250);
  const titleInput = page.locator('input[placeholder*="Driveway"], input[placeholder*="sorastus"]').first();
  if (await titleInput.isVisible()) await titleInput.fill(title);
  const addrInput = page.locator('input[placeholder*="Example Street"], input[placeholder*="Esimerkkitie"]').first();
  if (await addrInput.isVisible()) await addrInput.fill(address);
  const compInput = page.locator('input[placeholder*="Nordic"], input[placeholder*="Pihaurakointi"]').first();
  if (await compInput.isVisible()) await compInput.fill(company);
  await scrollPanel(page, 0, false);
  await page.waitForTimeout(250);
}

async function run() {
  // 1. Hero clip: Helsinki parcel pick on Satellite HD + automatic building subtraction + Sod / lawn
  {
    const { browser, page } = await launch({ width: 1280, height: 800, scale: 1.5 });
    await page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await dismissBannerIfAny(page);
    await switchToEnglish(page);
    await searchAndCenter(page, 'Pakilantie 60, Helsinki');
    await fillEnglishQuoteDetails(page, 'Yard sodding & lawn renovation', 'Pakilantie 60, Helsinki');

    const mapBox = await page.locator('.maplibregl-canvas').boundingBox();
    const px = mapBox.x + mapBox.width * 0.34;
    const py = mapBox.y + mapBox.height * 0.54;

    await record(page, 'maamitta-demo', async () => {
      await page.waitForTimeout(450);
      await page.locator('.tool-chip', { hasText: /^Pick$/ }).click();
      await page.waitForTimeout(350);
      await page.mouse.move(px, py, { steps: 14 });
      await page.waitForTimeout(180);
      await page.mouse.click(px, py);
      await page.waitForTimeout(2400);
      const fitBtn = page.getByRole('button', { name: /Fit|Center on selection/i }).first();
      if (await fitBtn.isVisible()) {
        await fitBtn.click();
        await page.waitForTimeout(900);
      }
      const sod = page.locator('.preset-btn').filter({ hasText: /Sod \/ lawn/i }).first();
      if (await sod.isVisible()) {
        await sod.click();
        await page.waitForTimeout(550);
      }
      await scrollPanel(page, 620, true);
      await page.waitForTimeout(1500);
    }, { fps: 30, crf: 34 });

    await page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-demo.jpg'), type: 'jpeg', quality: 88 });
    fs.copyFileSync(path.join(OUT, 'maamitta-demo.webm'), path.join(TARGET_DIR, 'maamitta-demo.webm'));
    await browser.close();
  }

  // 2. Workflow clip + real PDF: DISTINCT location (Westendintie 22, Espoo) on MML Aerial Orthophoto
  {
    const { browser, page } = await launch({ width: 1280, height: 800, scale: 1.5 });
    await page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    await dismissBannerIfAny(page);
    await switchToEnglish(page, 'Aerial orthophoto');
    await searchAndCenter(page, 'Westendintie 22, Espoo');
    await fillEnglishQuoteDetails(page, 'Front yard paving & gravel driveway', 'Westendintie 22, Espoo');

    const mapBox = await page.locator('.maplibregl-canvas').boundingBox();
    const pt = (rx, ry) => [mapBox.x + mapBox.width * rx, mapBox.y + mapBox.height * ry];

    await record(page, 'maamitta-workflow', async () => {
      await page.waitForTimeout(450);
      await page.locator('.tool-chip', { hasText: /^Area$/ }).click();
      await page.waitForTimeout(300);
      // Partial front-yard stone paving polygon
      const polyPts = [pt(0.42, 0.36), pt(0.56, 0.34), pt(0.58, 0.48), pt(0.44, 0.50)];
      for (const [x, y] of polyPts) {
        await page.mouse.move(x, y, { steps: 8 });
        await page.mouse.click(x, y);
        await page.waitForTimeout(220);
      }
      const paving = page.locator('.preset-btn').filter({ hasText: /Stone paving/i }).first();
      await paving.click();
      await page.waitForTimeout(350);
      await scrollPanel(page, 620, true);
      await page.waitForTimeout(550);
      await page.getByRole('button', { name: /Add to quote/i }).first().click();
      await page.waitForTimeout(700);

      // Trace a 3.5 m wide driveway centerline leading into the yard
      await page.locator('.tool-chip', { hasText: /^Line$/ }).click();
      await page.waitForTimeout(300);
      const linePts = [pt(0.32, 0.62), pt(0.45, 0.56), pt(0.58, 0.54)];
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
      const gravel = page.locator('.preset-btn').filter({ hasText: /Gravel/i }).first();
      await gravel.click();
      await page.waitForTimeout(350);
      await scrollPanel(page, 650, true);
      await page.waitForTimeout(600);
      await page.getByRole('button', { name: /Add to quote/i }).first().click();
      await page.waitForTimeout(900);
      await scrollPanel(page, 820, true);
      await page.waitForTimeout(1400);
    }, { fps: 30, crf: 34 });

    await page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-workflow.jpg'), type: 'jpeg', quality: 88 });
    fs.copyFileSync(path.join(OUT, 'maamitta-workflow.webm'), path.join(TARGET_DIR, 'maamitta-workflow.webm'));

    // Export real PDF
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.getByRole('button', { name: /Download PDF quote/i }).click(),
    ]);
    const pdfPath = path.join(OUT, 'maamitta-quote-v4.pdf');
    await download.saveAs(pdfPath);
    execSync(`qlmanage -t -s 1800 -o "${OUT}" "${pdfPath}"`, { stdio: 'ignore' });
    const thumbPng = path.join(OUT, 'maamitta-quote-v4.pdf.png');
    if (fs.existsSync(thumbPng)) {
      execSync(`sips -s format jpeg -s formatOptions 90 "${thumbPng}" --out "${path.join(TARGET_DIR, 'maamitta-pdf.jpg')}"`, { stdio: 'ignore' });
    }
    await browser.close();
  }

  // 3. Refreshed Mobile stills (390x844 @ 2x)
  {
    const mob = await launch({ width: 390, height: 844, scale: 2, mobile: true });
    await mob.page.goto('https://maamitta.pages.dev/', { waitUntil: 'networkidle' });
    await mob.page.waitForTimeout(1800);
    await dismissBannerIfAny(mob.page);
    await switchToEnglish(mob.page);
    await searchAndCenter(mob.page, 'Pakilantie 60, Helsinki');

    await mob.page.locator('.tool-chip').nth(1).click();
    await mob.page.waitForTimeout(350);
    const mBox = await mob.page.locator('.maplibregl-canvas').boundingBox();
    await mob.page.mouse.click(mBox.x + mBox.width * 0.34, mBox.y + mBox.height * 0.54);
    await mob.page.waitForTimeout(2400);
    const fitMob = mob.page.getByRole('button', { name: /Fit|Center on selection/i }).first();
    if (await fitMob.isVisible()) {
      await fitMob.click();
      await mob.page.waitForTimeout(1000);
    }
    await mob.page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-phone-map.jpg'), type: 'jpeg', quality: 88 });

    const estBtn = mob.page.locator('.mobile-sheet-trigger');
    if (await estBtn.isVisible()) {
      await estBtn.click();
      await mob.page.waitForTimeout(650);
      const sodM = mob.page.locator('.preset-btn').filter({ hasText: /Sod \/ lawn/i }).first();
      if (await sodM.isVisible()) {
        await sodM.click();
        await mob.page.waitForTimeout(450);
      }
      await scrollPanel(mob.page, 690, false);
      await mob.page.waitForTimeout(400);
    }
    await mob.page.screenshot({ path: path.join(TARGET_DIR, 'maamitta-phone-sheet.jpg'), type: 'jpeg', quality: 88 });
    await mob.browser.close();
  }

  console.log('Done v4!');
}

run().catch((e) => { console.error(e); process.exit(1); });
