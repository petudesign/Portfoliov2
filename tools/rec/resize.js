const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const fs = require('fs');
const [i, o, w, h, q = '0.85'] = process.argv.slice(2);
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  const u = await p.evaluate(async ([d, w, h, q]) => { const im = new Image(); im.src = d; await im.decode(); const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, w, h); return c.toDataURL('image/jpeg', q); }, ['data:image/png;base64,' + fs.readFileSync(i).toString('base64'), +w, +h, +q]);
  fs.writeFileSync(o, Buffer.from(u.split(',')[1], 'base64')); await b.close(); console.log(o, fs.statSync(o).size); })();
