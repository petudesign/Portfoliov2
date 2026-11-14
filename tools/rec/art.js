// Sketches for a hero art layer. heroArt(mode, {img, imgs}) adds the layer behind a case page's intro.
window.heroArt = async function (mode, o) {
  const intro = document.querySelector('.intro'); intro.style.position = 'relative';
  const box = document.createElement('div'); box.className = 'hero-art hero-art-' + mode;
  const css = document.createElement('style');
  css.textContent = `.hero-art{position:absolute;z-index:-1;top:20px;right:calc(50% - 50vw);width:min(58vw,900px);height:620px;pointer-events:none;
    -webkit-mask-image:linear-gradient(to right,transparent 0,#000 38%,#000 92%,transparent 100%),linear-gradient(#000 70%,transparent);-webkit-mask-composite:source-in;
    mask-image:linear-gradient(to right,transparent 0,#000 38%,#000 92%,transparent 100%),linear-gradient(#000 70%,transparent);mask-composite:intersect}
  .hero-art canvas{display:block;width:100%;height:100%}`;
  document.head.append(css); intro.prepend(box);
  const W = box.clientWidth, H = box.clientHeight, dpr = devicePixelRatio || 1;
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });

  // sample the image to a grid, cover-fit, focused on fx,fy (0..1)
  const sample = (img, cols, rows, fx = .55, fy = .5) => {
    const c = document.createElement('canvas'); c.width = cols; c.height = rows; const x = c.getContext('2d');
    const s = Math.max(cols / img.width, rows / img.height) * (o.zoom || 1.25);
    const w = img.width * s, h = img.height * s; x.drawImage(img, (cols - w) * fx, (rows - h) * fy, w, h);
    return x.getImageData(0, 0, cols, rows).data;
  };
  const isRed = (r, g, b) => r > 150 && r > g * 1.6 && r > b * 1.5;

  if (mode === 'dither') {
    const img = await load(o.img), cell = 3, cols = Math.floor(W / cell), rows = Math.floor(H / cell);
    const d = sample(img, cols, rows);
    const B = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
    const c = document.createElement('canvas'); c.width = W * dpr; c.height = H * dpr; box.append(c); const x = c.getContext('2d'); x.scale(dpr, dpr);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
      const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255, t = (B[(j % 8) * 8 + (i % 8)] + .5) / 64;
      const lift = Math.min(1, L * 1.9);
      if (lift > t) { x.fillStyle = isRed(r, g, b) || (r > 200 && g > 90 && b < 90) ? '#e5173f' : 'rgba(238,238,235,.42)'; x.fillRect(i * cell, j * cell, cell - 1, cell - 1); }
    }
  }

  if (mode === 'ascii') {
    const img = await load(o.img), cw = 7, ch = 11, cols = Math.floor(W / cw), rows = Math.floor(H / ch);
    const d = sample(img, cols, rows), ramp = ' .,:;-~=+*xo#%@';
    const c = document.createElement('canvas'); c.width = W * dpr; c.height = H * dpr; box.append(c); const x = c.getContext('2d'); x.scale(dpr, dpr);
    x.font = '500 10px "Geist Mono", ui-monospace, monospace'; x.textBaseline = 'top';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
      const L = Math.min(1, ((0.299 * r + 0.587 * g + 0.114 * b) / 255) * 1.8), ch_ = ramp[Math.round(L * (ramp.length - 1))];
      if (ch_ === ' ') continue;
      x.fillStyle = isRed(r, g, b) || (r > 200 && g > 90 && b < 90) ? '#e5173f' : `rgba(238,238,235,${.18 + L * .5})`; x.fillText(ch_, i * cw, j * ch);
    }
  }

  if (mode === 'collage') {
    const rnd = ((s) => () => (s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0, s / 4294967296))(7);
    const torn = (n = 18) => { const p = []; for (let i = 0; i <= n; i++) p.push(`${(i / n * 100).toFixed(1)}% ${(rnd() * 3).toFixed(1)}%`);
      for (let i = n; i >= 0; i--) p.push(`${(i / n * 100).toFixed(1)}% ${(97 + rnd() * 3).toFixed(1)}%`); return `polygon(${p.join(',')})`; };
    box.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/></filter></svg>
      <div class="ht"></div>
      ${o.imgs.map((src, i) => `<div class="frag f${i}"><img src="${src}"></div>`).join('')}
      <svg class="brush" viewBox="0 0 400 140"><path filter="url(#rough)" d="M20 90 C 90 30, 170 40, 220 70 S 330 110, 385 40" /></svg>
      <svg class="scrib" viewBox="0 0 200 160"><path d="M20 120 C 60 20, 120 10, 150 60 C 170 95, 120 130, 90 100 C 60 70, 140 30, 185 40"/></svg>
      <span class="num n1">25:20</span><span class="num n2">2–1</span><span class="num n3">2–3–2</span>
      <i class="dot d1"></i><i class="dot d2"></i><i class="dot d3"></i><svg class="noise"><rect width="100%" height="100%" filter="url(#grain)"/></svg>`;
    css.textContent += `.hero-art-collage .frag{position:absolute;filter:saturate(.85) contrast(1.05);box-shadow:0 18px 40px rgba(0,0,0,.45)}
      .hero-art-collage .frag img{display:block;width:100%;height:100%;object-fit:cover}
      .f0{left:57%;top:60px;width:38%;height:200px;transform:rotate(-3deg);clip-path:${torn()}} .f0 img{object-position:40% 45%}
      .f1{left:66%;top:270px;width:30%;height:170px;transform:rotate(4deg);clip-path:${torn(12)}} .f1 img{object-position:50% 30%}
      .f2{left:56%;top:330px;width:14%;height:170px;transform:rotate(-6deg);clip-path:${torn(8)}} .f2 img{object-position:50% 50%}
      .ht{position:absolute;left:54%;top:190px;width:170px;height:170px;border-radius:50%;background:radial-gradient(circle,#e5173f 1.6px,transparent 2.2px) 0 0/9px 9px;opacity:.85}
      .brush{position:absolute;left:55%;top:150px;width:42%;overflow:visible;fill:none;stroke:#e5173f;stroke-width:22;stroke-linecap:round;opacity:.9;mix-blend-mode:screen}
      .scrib{position:absolute;left:82%;top:20px;width:16%;fill:none;stroke:#6f8cff;stroke-width:2.2;stroke-linecap:round;opacity:.9}
      .num{position:absolute;font:500 13px "Geist Mono",monospace;color:rgba(238,238,235,.55);letter-spacing:.02em}
      .n1{left:58%;top:36px}.n2{left:90%;top:250px}.n3{left:72%;top:470px}
      .dot{position:absolute;width:10px;height:10px;border-radius:50%;background:#eeeeeb}.d1{left:55%;top:300px}.d2{left:78%;top:30px}.d3{left:94%;top:430px}
      .noise{position:absolute;inset:0;width:100%;height:100%}`;
  }
};
