// Records a page through Chrome's screencast and encodes a constant-frame-rate VP9 WebM.
const { chromium } = require('/Users/petu/Documents/ChatGPT/Kharon/node_modules/playwright-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const FFMPEG = path.join(process.env.HOME, 'Library/Caches/ms-playwright/ffmpeg-1013/ffmpeg-mac');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
async function launch({ width = 1280, height = 800, scale = 1.5, mobile = false, init } = {}) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--hide-scrollbars', '--force-device-scale-factor=' + scale] });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile, colorScheme: 'dark', locale: 'en-GB' });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  return { browser, context, page };
}
async function record(page, name, action, { fps = 60, crf = 36 } = {}) {
  const cdp = await page.context().newCDPSession(page);
  const vp = page.viewportSize();
  const frames = [];
  cdp.on('Page.screencastFrame', async (f) => { frames.push({ t: f.metadata.timestamp, d: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {} });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: vp.width * 2, maxHeight: vp.height * 2, everyNthFrame: 1 });
  await page.waitForTimeout(300);
  const start = Date.now() / 1000;
  await action();
  const end = Date.now() / 1000;
  await page.waitForTimeout(200);
  await cdp.send('Page.stopScreencast');
  const n = Math.max(1, Math.round((end - start) * fps));
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', 'pipe:0',
    '-c:v', 'libvpx-vp9', '-crf', String(crf), '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an', path.join(OUT, name + '.webm')]);
  ff.setMaxListeners(0); let err = ''; ff.stderr.on('data', (d) => (err += d)); ff.stdin.on('error', () => {});
  const done = new Promise((res) => ff.on('close', res));
  let j = 0;
  for (let i = 0; i < n; i++) {
    const t = start + i / fps;
    while (j + 1 < frames.length && frames[j + 1].t <= t) j++;
    if (ff.exitCode !== null) break;
    if (!ff.stdin.write(Buffer.from(frames[j].d, 'base64'))) await new Promise((r) => { ff.stdin.once('drain', r); ff.once('close', r); });
  }
  ff.stdin.end();
  if (await done) throw new Error('ffmpeg ' + err);
  fs.writeFileSync(path.join(OUT, name + '-poster.jpg'), Buffer.from(frames[0].d, 'base64'));
  console.log(`${name}: ${(end - start).toFixed(1)}s, ${(fs.statSync(path.join(OUT, name + '.webm')).size / 1024).toFixed(0)} KB`);
}
module.exports = { launch, record, OUT };
