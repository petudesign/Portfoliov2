/* Pixel curtain: moving between pages, each case arrives through a dithered picture of its own subject that
   builds up in blocks and breaks apart to show the page. Also draws the faint screen static behind the content. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BG = '#101114', BLOCK = 32;
  const cellFor = (W) => (W < 600 ? 4 : 5);
  const TONE = { '': '#ff5a6e', 'Kelikamera AI': '#9cc8ff', 'Peluutin': '#86d98a', 'KorisLab': '#ff9b52', 'Helsinki Sports Map': '#6fd6c4', 'Havain': '#c7b6ff', 'S-hävikki': '#e8d36a', 'Tahti': '#f0a6d8' };

  /* ---------- the subjects, drawn in greys so the dither has real shapes ---------- */
  const g = (v) => `rgb(${v},${v},${v})`;
  const rng = (s) => () => (s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0, s / 4294967296);
  const ball = (x, cx, cy, r, hi = 240, lo = 40) => {
    const gr = x.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r);
    gr.addColorStop(0, g(hi)); gr.addColorStop(.7, g((hi + lo) / 2 | 0)); gr.addColorStop(1, g(lo));
    x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  };
  const DRAW = {
    ''(x, W, H) { // home: the red squiggle from the portrait as a lit ribbon
      x.fillStyle = g(14); x.fillRect(0, 0, W, H);
      const p = new Path2D(); p.moveTo(W * .08, H * .62); p.bezierCurveTo(W * .25, H * .18, W * .38, H * .2, W * .45, H * .5);
      p.bezierCurveTo(W * .52, H * .82, W * .66, H * .84, W * .72, H * .48); p.bezierCurveTo(W * .77, H * .2, W * .86, H * .22, W * .93, H * .4);
      x.lineCap = 'round'; x.lineJoin = 'round';
      x.strokeStyle = g(70); x.lineWidth = H * .15; x.stroke(p);
      x.strokeStyle = g(150); x.lineWidth = H * .1; x.stroke(p);
      x.save(); x.translate(-H * .012, -H * .018); x.strokeStyle = g(235); x.lineWidth = H * .035; x.stroke(p); x.restore();
    },
    'Kelikamera AI'(x, W, H) { // a winter road with a road weather camera on its mast
      const hz = H * .36; x.fillStyle = g(16); x.fillRect(0, 0, W, H);
      const P = (t, s) => { const y = hz + (H - hz) * t, half = W * (.015 + .62 * t); return [W * .52 + s * half, y]; };
      x.fillStyle = g(200); x.beginPath(); x.moveTo(0, hz + H * .02); x.lineTo(...P(0, -1)); x.lineTo(...P(1, -1)); x.lineTo(0, H); x.fill();
      x.beginPath(); x.moveTo(W, hz + H * .02); x.lineTo(...P(0, 1)); x.lineTo(...P(1, 1)); x.lineTo(W, H); x.fill();
      const road = x.createLinearGradient(0, hz, 0, H); road.addColorStop(0, g(60)); road.addColorStop(1, g(34)); x.fillStyle = road;
      x.beginPath(); x.moveTo(...P(0, -1)); x.lineTo(...P(0, 1)); x.lineTo(...P(1, 1)); x.lineTo(...P(1, -1)); x.fill();
      x.fillStyle = g(245);
      for (let k = 0; k < 9; k++) { const t0 = Math.pow(k / 9, 1.7), t1 = Math.pow((k + .45) / 9, 1.7), [a0, y0] = P(t0, 0), [a1, y1] = P(t1, 0), w0 = 1 + t0 * W * .012, w1 = 1 + t1 * W * .012;
        x.beginPath(); x.moveTo(a0 - w0, y0); x.lineTo(a0 + w0, y0); x.lineTo(a1 + w1, y1); x.lineTo(a1 - w1, y1); x.fill(); }
      x.strokeStyle = g(230); x.lineWidth = 3; [-.92, .92].forEach((s) => { x.beginPath(); x.moveTo(...P(0, s)); x.lineTo(...P(1, s)); x.stroke(); });
      const mx = W * .22; x.fillStyle = g(150); x.fillRect(mx, H * .12, W * .008, H * .62);
      x.fillStyle = g(230); x.fillRect(mx - W * .035, H * .12, W * .07, H * .055); x.fillStyle = g(60); x.beginPath(); x.arc(mx + W * .028, H * .148, H * .018, 0, 7); x.fill();
      const r = rng(5); x.fillStyle = g(250); for (let k = 0; k < 120; k++) { x.beginPath(); x.arc(r() * W, r() * H * .9, 1 + r() * 2.5, 0, 7); x.fill(); }
    },
    'KorisLab'(x, W, H) { // a basketball over the court
      const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, g(18)); bg.addColorStop(1, g(60)); x.fillStyle = bg; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) { x.fillStyle = g(i % 2 ? 46 : 58); x.fillRect(0, H * .72 + i * H * .04, W, H * .04); }
      const cx = W * .5, cy = H * .46, r = Math.min(W, H) * .34;
      x.fillStyle = 'rgba(0,0,0,.6)'; x.beginPath(); x.ellipse(cx + r * .1, H * .86, r * .9, r * .16, 0, 0, 7); x.fill();
      ball(x, cx, cy, r, 235, 35);
      x.strokeStyle = g(10); x.lineWidth = r * .045; x.lineCap = 'round';
      [[[cx, cy - r], [cx - r * .18, cy - r * .3], [cx - r * .18, cy + r * .3], [cx, cy + r]], [[cx - r, cy + r * .05], [cx - r * .3, cy + r * .22], [cx + r * .3, cy + r * .22], [cx + r, cy + r * .05]],
       [[cx - r * .62, cy - r * .78], [cx - r * .2, cy - r * .3], [cx - r * .2, cy + r * .3], [cx - r * .62, cy + r * .78]], [[cx + r * .62, cy - r * .78], [cx + r * .22, cy - r * .3], [cx + r * .22, cy + r * .3], [cx + r * .62, cy + r * .78]]]
        .forEach(([a, b, c, d]) => { x.beginPath(); x.moveTo(...a); x.bezierCurveTo(...b, ...c, ...d); x.stroke(); });
    },
    'Peluutin'(x, W, H) { // a pitch in perspective, a goal and a ball
      const hz = H * .3, sky = x.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, g(10)); sky.addColorStop(1, g(70)); x.fillStyle = sky; x.fillRect(0, 0, W, hz);
      const L = (t) => { const y = hz + (H - hz) * t * t, half = W * (.28 + 1.1 * t * t); return [y, W / 2 - half, W / 2 + half]; };
      for (let i = 0; i < 12; i++) { const [y0, a0, b0] = L(i / 12), [y1, a1, b1] = L((i + 1) / 12); x.fillStyle = g(i % 2 ? 96 : 128);
        x.beginPath(); x.moveTo(a0, y0); x.lineTo(b0, y0); x.lineTo(b1, y1); x.lineTo(a1, y1); x.fill(); }
      x.strokeStyle = g(245); x.lineWidth = 3;
      const side = (s) => { const [y0, a0, b0] = L(0), [y1, a1, b1] = L(1); x.beginPath(); x.moveTo(s ? b0 : a0, y0); x.lineTo(s ? b1 : a1, y1); x.stroke(); };
      side(0); side(1);
      const [yf, af, bf] = L(0); x.beginPath(); x.moveTo(af, yf); x.lineTo(bf, yf); x.stroke();
      const [ym] = L(.62); x.beginPath(); x.moveTo(0, ym); x.lineTo(W, ym); x.stroke();
      x.beginPath(); x.ellipse(W / 2, ym, W * .18, H * .07, 0, 0, 7); x.stroke();
      const [yb] = L(.12); x.beginPath(); x.moveTo(W / 2 - W * .16, yf); x.lineTo(W / 2 - W * .19, yb); x.lineTo(W / 2 + W * .19, yb); x.lineTo(W / 2 + W * .16, yf); x.stroke();
      x.lineWidth = 5; x.strokeRect(W / 2 - W * .07, yf - H * .07, W * .14, H * .07);
      const bx = W * .66, by = H * .8, br = Math.min(W, H) * .11;
      x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.ellipse(bx + br * .2, by + br * .95, br, br * .25, 0, 0, 7); x.fill();
      ball(x, bx, by, br, 250, 70); x.fillStyle = g(20);
      [[0, 0, .36], [-.62, -.35, .24], [.6, -.4, .24], [-.5, .58, .22], [.55, .55, .22]].forEach(([dx, dy, s]) => { const px = bx + dx * br, py = by + dy * br, rr = br * s;
        x.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; x.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); } x.fill(); });
    },
    'Helsinki Sports Map'(x, W, H) { // a map pin over the street grid and the shore
      x.fillStyle = g(38); x.fillRect(0, 0, W, H);
      x.fillStyle = g(20); x.beginPath(); x.moveTo(0, H * .7); x.bezierCurveTo(W * .3, H * .6, W * .35, H * .9, W * .6, H * .82); x.bezierCurveTo(W * .8, H * .76, W * .9, H * .95, W, H * .88); x.lineTo(W, H); x.lineTo(0, H); x.fill();
      x.strokeStyle = g(110); x.lineWidth = 6; for (let i = -3; i < 14; i++) { x.beginPath(); x.moveTo(i * W * .1, 0); x.lineTo(i * W * .1 + W * .25, H * .75); x.stroke(); }
      x.lineWidth = 3; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, i * H * .09); x.lineTo(W, i * H * .09 - H * .12); x.stroke(); }
      const cx = W * .5, top = H * .14, r = Math.min(W, H) * .2;
      x.fillStyle = 'rgba(0,0,0,.6)'; x.beginPath(); x.ellipse(cx + r * .3, top + r * 3.05, r * .55, r * .16, 0, 0, 7); x.fill();
      const gr = x.createRadialGradient(cx - r * .4, top + r * .6, r * .1, cx, top + r, r * 1.6); gr.addColorStop(0, g(250)); gr.addColorStop(1, g(60)); x.fillStyle = gr;
      x.beginPath(); x.arc(cx, top + r, r, Math.PI * .82, Math.PI * .18); x.quadraticCurveTo(cx + r * .45, top + r * 2.2, cx, top + r * 3);
      x.quadraticCurveTo(cx - r * .45, top + r * 2.2, cx - r * Math.cos(Math.PI * .18), top + r + r * Math.sin(Math.PI * .18)); x.fill();
      x.fillStyle = g(25); x.beginPath(); x.arc(cx, top + r, r * .38, 0, 7); x.fill();
    },
    'Havain'(x, W, H) { // a store shelf with products and shelf-edge labels
      x.fillStyle = g(26); x.fillRect(0, 0, W, H);
      const r = rng(3), rows = 3, sh = H / rows;
      for (let row = 0; row < rows; row++) {
        const base = (row + 1) * sh - sh * .16; let px = W * .03;
        while (px < W * .97) {
          const w = W * (.05 + r() * .07), h = sh * (.45 + r() * .35), n = 1 + (r() * 3 | 0), tone = 120 + (r() * 120 | 0);
          for (let k = 0; k < n && px < W * .97; k++) { const gr = x.createLinearGradient(px, 0, px + w, 0); gr.addColorStop(0, g(tone - 50)); gr.addColorStop(.35, g(tone)); gr.addColorStop(1, g(tone - 70));
            x.fillStyle = gr; x.fillRect(px, base - h, w - 4, h); x.fillStyle = g(Math.min(255, tone + 40)); x.fillRect(px + w * .15, base - h * .7, w * .6, h * .22); px += w; }
          x.fillStyle = g(240); const lw = Math.min(W * .07, w * 1.2); x.fillRect(px - lw - 6, base + sh * .03, lw, sh * .1);
          x.fillStyle = g(10); for (let b = 0; b < 14; b++) x.fillRect(px - lw - 6 + 4 + b * (lw - 8) / 14, base + sh * .05, r() < .5 ? 1.5 : 3, sh * .06);
          px += W * .012;
        }
        x.fillStyle = g(150); x.fillRect(0, base, W, sh * .03); x.fillStyle = g(70); x.fillRect(0, base + sh * .03, W, sh * .14);
      }
    },
    'S-hävikki'(x, W, H) { // milk cartons with date stamps, one with a round discount sticker
      x.fillStyle = g(22); x.fillRect(0, 0, W, H);
      x.fillStyle = g(120); x.fillRect(0, H * .8, W, H * .03); x.fillStyle = g(55); x.fillRect(0, H * .83, W, H * .17);
      const cw = W * .13, chh = H * .5;
      for (let i = 0; i < 5; i++) {
        const lx = W * .12 + i * cw * 1.25, top = H * .8 - chh;
        const gr = x.createLinearGradient(lx, 0, lx + cw, 0); gr.addColorStop(0, g(150)); gr.addColorStop(.4, g(225)); gr.addColorStop(1, g(120));
        x.fillStyle = gr; x.fillRect(lx, top, cw, chh);
        x.fillStyle = g(190); x.beginPath(); x.moveTo(lx, top); x.lineTo(lx + cw / 2, top - chh * .18); x.lineTo(lx + cw, top); x.fill();   // gable top
        x.fillStyle = g(40); x.fillRect(lx + cw * .15, top + chh * .55, cw * .7, chh * .08);                                            // date stamp
      }
      const sx = W * .12 + 3 * cw * 1.25 + cw * .5, sy = H * .4, sr = Math.min(W, H) * .11;
      ball(x, sx, sy, sr, 250, 160); x.fillStyle = g(20); x.font = `700 ${sr * .7}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('-60%', sx, sy);
    },
    'Tahti'(x, W, H) { // an open book, lines of text on both pages
      x.fillStyle = g(18); x.fillRect(0, 0, W, H);
      const cx = W / 2, top = H * .2, bot = H * .82, pw = W * .34;
      [-1, 1].forEach((s) => {
        const gr = x.createLinearGradient(cx, 0, cx + s * pw, 0); gr.addColorStop(0, g(150)); gr.addColorStop(.12, g(230)); gr.addColorStop(1, g(205));
        x.fillStyle = gr; x.beginPath(); x.moveTo(cx, top + H * .03); x.quadraticCurveTo(cx + s * pw * .5, top - H * .04, cx + s * pw, top);
        x.lineTo(cx + s * pw, bot); x.quadraticCurveTo(cx + s * pw * .5, bot - H * .04, cx, bot + H * .03); x.fill();
        x.fillStyle = g(60); const r = rng(s > 0 ? 7 : 4);
        for (let l = 0; l < 13; l++) { const y = top + H * .07 + l * (bot - top - H * .12) / 13, len = pw * (.55 + r() * .3); x.fillRect(s > 0 ? cx + pw * .1 : cx - pw * .1 - len, y, len, H * .012); }
      });
      x.fillStyle = g(250); x.fillRect(cx + pw * .1, top + H * .07 + 5 * (bot - top - H * .12) / 13 - H * .01, pw * .22, H * .032);   // the word being read
    },
  };

  /* ---------- dither and the finished picture ---------- */
  function dither(src, cols, rows) {
    const c = document.createElement('canvas'); c.width = cols; c.height = rows; const x = c.getContext('2d');
    const s = Math.max(cols / src.width, rows / src.height), w = src.width * s, h = src.height * s;
    x.filter = 'grayscale(1) contrast(1.15) brightness(.82)'; x.drawImage(src, (cols - w) / 2, (rows - h) / 2, w, h);
    const d = x.getImageData(0, 0, cols, rows).data, v = new Float32Array(cols * rows), out = new Uint8Array(cols * rows);
    for (let i = 0; i < v.length; i++) v[i] = d[i * 4];
    const add = (i, j, e) => { if (i >= 0 && i < cols && j < rows) v[j * cols + i] += e; };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {   // Atkinson
      const k = j * cols + i, on = v[k] > 128, e = (v[k] - (on ? 255 : 0)) / 8; out[k] = on ? 1 : 0;
      add(i + 1, j, e); add(i + 2, j, e); add(i - 1, j + 1, e); add(i, j + 1, e); add(i + 1, j + 1, e); add(i, j + 2, e);
    }
    return out;
  }
  function picture(label, W, H, dpr, lr) {
    const key = label in DRAW ? label : '', src = document.createElement('canvas'); src.width = 640; src.height = Math.round(640 * H / W);
    if (H > W * .8) {   // tall screens: draw the subject landscape and set it in the middle, slightly cropped at the sides
      const sub = document.createElement('canvas'); sub.width = 640; sub.height = 420; DRAW[key](sub.getContext('2d'), 640, 420);
      const s = src.getContext('2d'), w = 640 * 1.75, h = 420 * 1.75; s.fillStyle = g(14); s.fillRect(0, 0, src.width, src.height);
      s.drawImage(sub, (640 - w) / 2, (src.height - h) / 2 - src.height * .04, w, h);
    } else DRAW[key](src.getContext('2d'), src.width, src.height);
    const CELL = cellFor(W), cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL), bits = dither(src, cols, rows);
    const pic = document.createElement('canvas'); pic.width = W * dpr; pic.height = H * dpr; const p = pic.getContext('2d'); p.setTransform(dpr, 0, 0, dpr, 0, 0);
    p.fillStyle = BG; p.fillRect(0, 0, W, H); p.fillStyle = TONE[key];
    const r = rng(11);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (!bits[j * cols + i]) continue;
      const px = i * CELL + CELL / 2, py = j * CELL + CELL / 2;
      const ex = Math.hypot((px / W - .5) * 1.25, py / H - .5), edge = Math.min(1, Math.max(0, (.62 - ex) / .22));          // thins out towards the edges
      const dx = Math.max(lr.left - px, 0, px - lr.right), dy = Math.max(lr.top - py, 0, py - lr.bottom);
      const clear = Math.min(1, Math.max(0, (Math.hypot(dx, dy) - 6) / 46));                                                // and around the title
      if (r() > edge * clear) continue;
      p.globalAlpha = .55 + .4 * edge; p.fillRect(i * CELL, j * CELL, CELL - 1.2, CELL - 1.2);
    }
    p.globalAlpha = 1;
    return { pic, tone: TONE[key] };
  }

  /* ---------- the overlay ---------- */
  const css = document.createElement('style');
  css.textContent = `.pxc{position:fixed;inset:0;z-index:120}.pxc canvas{position:absolute;inset:0;width:100%;height:100%}
.pxc span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;font:600 clamp(44px,7vw,72px)/1 "Geist","Helvetica Neue",Arial,sans-serif;letter-spacing:-.05em;color:#eeeeeb;transition:opacity .18s}
.pxc span.off{opacity:0}
.crt{position:fixed;inset:0;z-index:-1;pointer-events:none}
.crt-noise{opacity:.01;background-size:220px 220px;image-rendering:pixelated}
.crt-lines{opacity:.01;background:repeating-linear-gradient(to bottom,#000 0 1px,transparent 1px 3px)}
.crt-vig{opacity:.5;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.65))}`;
  document.head.append(css);

  function overlay(label) {
    const el = document.createElement('div'); el.className = 'pxc'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<canvas></canvas><span></span>'; el.querySelector('span').textContent = label || 'Petteri Helttula';
    document.body.append(el);
    const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight, cv = el.querySelector('canvas'), cx = cv.getContext('2d');
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { pic, tone } = picture(label, W, H, dpr, el.querySelector('span').getBoundingClientRect());
    const bc = Math.ceil(W / BLOCK), br = Math.ceil(H / BLOCK), blocks = [];
    for (let j = 0; j < br; j++) for (let i = 0; i < bc; i++) blocks.push([i, j, Math.random()]);
    const put = ([i, j]) => cx.drawImage(pic, i * BLOCK * dpr, j * BLOCK * dpr, BLOCK * dpr, BLOCK * dpr, i * BLOCK, j * BLOCK, BLOCK, BLOCK);
    return { el, cx, pic, W, H, dpr, blocks, put, tone };
  }
  const run = (ms, step) => new Promise((res) => { const t0 = performance.now(); let last = 0;
    const f = (t) => { const k = Math.max(0, Math.min(1, (t - t0) / ms)); step(k, last); last = k; k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });

  /* leaving: blocks land over the current page (a few flash first), then the browser moves on */
  async function leave(label, href) {
    if (reduce) { location.href = href; return; }
    const o = overlay(label), flashed = [];
    o.el.querySelector('span').classList.add('off');
    o.blocks.sort((a, b) => a[2] - b[2]);
    await run(560, (k, last) => {
      flashed.splice(0).forEach(o.put);
      const a = Math.floor(last * o.blocks.length), b = Math.floor(k * o.blocks.length);
      for (let n = a; n < b; n++) { const bl = o.blocks[n];
        if (Math.random() < .07) { o.cx.fillStyle = Math.random() < .6 ? '#e5173f' : o.tone; o.cx.fillRect(bl[0] * BLOCK, bl[1] * BLOCK, BLOCK, BLOCK); flashed.push(bl); } else o.put(bl); }
      if (k > .55 && k < .7) { const y = (o.H * (.3 + Math.random() * .4)) | 0; o.cx.drawImage(o.pic, 0, y * o.dpr, o.W * o.dpr, 10 * o.dpr, 18, y, o.W, 10); }
    });
    o.blocks.forEach(o.put); o.el.querySelector('span').classList.remove('off');
    setTimeout(() => { location.href = href; }, 140);
  }

  /* arriving: the picture is already whole, holds for a moment with the title, then breaks apart */
  async function arrive(label, reveal) {
    const o = overlay(label); o.blocks.forEach(o.put); reveal();
    if (reduce) { setTimeout(() => o.el.remove(), 250); return; }
    await new Promise((r) => setTimeout(r, 380));
    o.el.querySelector('span').classList.add('off');
    o.blocks.sort(() => Math.random() - .5);
    await run(420, (k, last) => { const a = Math.floor(last * o.blocks.length), b = Math.floor(k * o.blocks.length);
      for (let n = a; n < b; n++) { const [i, j] = o.blocks[n]; o.cx.clearRect(i * BLOCK, j * BLOCK, BLOCK, BLOCK); } });
    o.el.remove();
  }
  addEventListener('pageshow', (e) => { if (e.persisted) document.querySelectorAll('.pxc').forEach((n) => n.remove()); });

  /* ---------- static behind the page: images, video and buttons cover it ---------- */
  function screen() {
    ['crt crt-noise', 'crt crt-lines', 'crt crt-vig'].forEach((c) => { const d = document.createElement('div'); d.className = c; d.setAttribute('aria-hidden', 'true'); document.body.prepend(d); });
    const n = document.querySelector('.crt-noise');
    const frames = Array.from({ length: 8 }, () => { const c = document.createElement('canvas'); c.width = c.height = 110; const x = c.getContext('2d'), d = x.createImageData(110, 110);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() < .5 ? 255 : Math.random() * 140; }
      x.putImageData(d, 0, 0); return c.toDataURL(); });
    let f = 0; const tick = () => { n.style.backgroundImage = `url(${frames[f = (f + 1) % frames.length]})`; n.style.backgroundPosition = `${Math.random() * 220 | 0}px ${Math.random() * 220 | 0}px`; };
    tick(); if (!reduce) setInterval(() => { if (!document.hidden) tick(); }, 83);
  }
  if (document.body) screen(); else addEventListener('DOMContentLoaded', screen, { once: true });

  window.PixelCurtain = { leave, arrive };
})();
