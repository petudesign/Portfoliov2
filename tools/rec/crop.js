// node crop.js in.png out.jpg x y w h [quality]
const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const fs = require('fs'); const path = require('path');
const [inp, out, x, y, w, h, q = '0.86'] = process.argv.slice(2);
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  const data = 'data:image/png;base64,' + fs.readFileSync(inp).toString('base64');
  const url = await p.evaluate(async ([d, x, y, w, h, q]) => { const i = new Image(); i.src = d; await i.decode(); const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(i, x, y, w, h, 0, 0, w, h); return c.toDataURL('image/jpeg', q); }, [data, +x, +y, +w, +h, +q]);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close(); console.log(out, fs.statSync(out).size); })();
