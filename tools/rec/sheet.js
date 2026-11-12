// node sheet.js out.png w cols file...
const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core'); const fs = require('fs'); const path = require('path');
const [out, w, cols, ...files] = process.argv.slice(2);
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: (+w + 8) * +cols + 8, height: 400 } });
  const imgs = files.map(f => `<div style="position:relative"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${w}px;display:block"><b style="position:absolute;left:4px;top:2px;color:#ff0;background:#000a;font:13px sans-serif">${path.basename(f)}</b></div>`).join('');
  await p.setContent(`<body style="margin:0;background:#333;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;padding:8px">${imgs}</body>`);
  await p.waitForTimeout(300); await p.screenshot({ path: out, fullPage: true }); await b.close(); })();
