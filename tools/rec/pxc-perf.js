const { chromium } = require(process.env.PLAYWRIGHT_CORE_MODULE || 'playwright-core'); const path = require('path');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('ERR', p.url(), e.message));
  const watch = () => p.evaluate(() => { window.__gaps = []; window.__long = []; let last = performance.now();
    const f = (t) => { window.__gaps.push(t - last); last = t; if (window.__gaps.length < 90) requestAnimationFrame(f); }; requestAnimationFrame(f);
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: true }); } catch (e) {} });
  const report = (tag) => p.evaluate((tag) => { const g = window.__gaps.slice(1), s = [...g].sort((a, b) => a - b);
    return `${tag}: frames ${g.length}, median ${s[s.length >> 1].toFixed(1)} ms, worst ${s[s.length - 1].toFixed(1)} ms, long tasks ${JSON.stringify(window.__long)}`; }, tag);
  await p.goto('http://localhost:8097/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  await watch(); await p.evaluate(() => { PixelCurtain.leave('KorisLab', '#stay'); }); await p.waitForTimeout(700); console.log(await report('leave'));
  await p.screenshot({ path: path.join(__dirname, 'out/diss-mid.png') });
  // arrive: simulate coming from home
  await p.evaluate(() => sessionStorage.setItem('curtain', 'KorisLab'));
  await p.goto('http://localhost:8097/korislab/', { waitUntil: 'commit' }); await watch(); await p.waitForTimeout(1500); console.log(await report('arrive'));
  await b.close(); })();
