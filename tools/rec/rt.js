const { launch } = require('./lib');
(async () => { const { browser, page } = await launch({ width: 1280, height: 800, scale: 1 });
  for (const p of ['korislab', 'kelikamera', 'peluutin', 'helsinki-sports-map', 'havain', 's-havikki', 'tahti']) {
    await page.goto(`http://localhost:8097/${p}/`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
    const cnt = await page.evaluate(() => { const main = document.querySelector('main'); const words = (full) => { const c = main.cloneNode(true);
        c.querySelectorAll('nav,script,style,.next,.mode-bar,svg,.toc,figure,.key,dl,.meta' + (full ? '' : ',.full')).forEach(e => e.remove()); return [...c.querySelectorAll('p,h1,h2,h3,li,blockquote')].filter(e => !e.querySelector('p,li')).map(e => e.textContent).join(' ').trim().split(/\s+/).length; };
      const lbl = [...document.querySelectorAll('[data-mode] small')].map(e => e.textContent); return [words(false), words(true), lbl.join('/')]; });
    console.log(p, cnt[0], cnt[1], 'tldr', Math.max(1, Math.round(cnt[0] / 238)), 'full', Math.max(1, Math.round(cnt[1] / 238)), 'now', cnt[2]);
  } await browser.close(); })();
