const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const fs = require('fs');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  for (const [i, o] of process.argv.slice(2).reduce((a, x, k, arr) => k % 2 ? a : [...a, [x, arr[k + 1]]], [])) {
    const ext = i.split('.').pop(); const d = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` + fs.readFileSync(i).toString('base64');
    const u = await p.evaluate(async (d) => { const im = new Image(); im.src = d; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/png'); }, d);
    fs.writeFileSync(o, Buffer.from(u.split(',')[1], 'base64')); }
  await b.close(); })();
