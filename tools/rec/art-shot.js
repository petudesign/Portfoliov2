const { launch, OUT } = require('./lib'); const path = require('path'); const fs = require('fs');
(async () => { const { browser, page } = await launch({ width: 1440, height: 900, scale: 1 });
  page.on('pageerror', e => console.log('ERR', e.message));
  for (const mode of (process.argv[2] || 'dither,ascii,collage').split(',')) {
    await page.goto('http://localhost:8097/peluutin/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
    await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'art.js'), 'utf8') });
    await page.evaluate((m) => window.heroArt(m, { img: '/p/peluutin-planner-dark.webp', imgs: ['/p/peluutin-planner-dark.webp', '/p/peluutin-match-football.webp', '/v2/p-sub.jpg'] }), mode);
    await page.waitForTimeout(1200); await page.screenshot({ path: path.join(OUT, 'art-' + mode + '.png') });
  }
  await browser.close(); })();
