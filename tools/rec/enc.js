// node enc.js webp|jpeg quality in out [in out ...]
const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const fs = require('fs');
const [fmt, q, ...rest] = process.argv.slice(2);
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  for (let k = 0; k < rest.length; k += 2) { const i = rest[k], o = rest[k + 1]; const ext = i.split('.').pop();
    const u = await p.evaluate(async ([d, f, q]) => { const im = new Image(); im.src = d; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/' + f, q); }, [`data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,` + fs.readFileSync(i).toString('base64'), fmt, +q]);
    fs.writeFileSync(o, Buffer.from(u.split(',')[1], 'base64')); console.log(o, (fs.statSync(o).size / 1024 | 0) + 'KB'); }
  await b.close(); })();
