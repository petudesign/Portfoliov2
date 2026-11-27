/* 404 page interactions: email copy, digit decode on back link,
   and interactive 3D dotted globe canvas. */
(function () {
  const EMAIL = 'helttula.petteri@gmail.com';
  const toast = document.getElementById('toast');
  const copyBtn = document.getElementById('copyEmail');
  let ct;
  let tt;

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      (navigator.clipboard ? navigator.clipboard.writeText(EMAIL) : Promise.reject()).then(
        () => {
          copyBtn.classList.add('is-copied');
          clearTimeout(ct);
          ct = setTimeout(() => copyBtn.classList.remove('is-copied'), 1800);
        },
        () => {
          if (!toast) return;
          toast.textContent = EMAIL;
          toast.hidden = false;
          clearTimeout(tt);
          tt = setTimeout(() => {
            toast.hidden = true;
          }, 2600);
        }
      );
    });
  }

  const rp = document.getElementById('reqPath');
  if (rp && location.pathname && !/^\/404(\.html|\/)?$/.test(location.pathname)) {
    rp.textContent = 'PATH ' + location.pathname;
  }

  /* decode label from digits on hover/focus */
  (function () {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const CH = '0123456789';
    document.querySelectorAll('.back').forEach((link) => {
      const label = link.querySelector('.label');
      const scr = label && label.querySelector('.scr');
      const text = label && label.dataset.text;
      if (!label || !scr || !text) return;
      let raf = null;
      const run = () => {
        cancelAnimationFrame(raf);
        const start = performance.now();
        const dur = 360;
        label.classList.add('scrambling');
        const step = (t) => {
          const k = Math.min(1, (t - start) / dur);
          const done = Math.floor(k * text.length);
          let s = '';
          for (let i = 0; i < text.length; i++) {
            s += i < done || text[i] === ' ' ? text[i] : CH[(Math.random() * CH.length) | 0];
          }
          scr.textContent = s;
          if (k < 1) raf = requestAnimationFrame(step);
          else label.classList.remove('scrambling');
        };
        raf = requestAnimationFrame(step);
      };
      link.addEventListener('mouseenter', run);
      link.addEventListener('focus', run);
    });
  })();

  /* Black & white interactive 3D dotted globe (Natural Earth 110m landmask) */
  (function () {
    const c = document.getElementById('space');
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rng = (s) => () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0), s / 4294967296);

    const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const RLE =
      '!lHN!EzaOa!EpbCpBJ!EbIGOB0jGVFoI!CpXHwcKBF!BFI!CWDFFBEBTC2fH!BTG!CKCBBDCQBGKJyhEEB!BSD!CIFGDHDBSJx!BXFfHBF!CFIBEEEBCBGBGVo!BOHZZXJ!BmDVGBCXn!BMFaZ!CAKIDCFBFCDCHVk!BMEWhBFEFME!BcVCKDKBDVh!BMEMFBCExKHiCGGpVEDBDDQBBQi!BLFLFB5BIBLwMjMFGCVNeBBuJiHB!BYkZEJBFDPCEBFEEFKMDBbqQaEC!BoCJCM1FEGCCEBCCFGHPasVUBCGDDC!BvL!BWDDCJKVwZEBEXD!BwBDG!BRBCJMIURCdTDEFaC!BtDFE!BVKIBDKOPKaJFIG!CVDG!BXCEBJMNRJYMBMB!CSKDGBB!BJECCCHEBEMLWBaMB!CiP!BMICEBHEPJvND!CgBCN!BMPHVIvND!CNBPUSB1QJXDwOCHB!CDGKaJBCKuQJDD!BGOFDB!B8BEFEkHPtOLBF4DIECGG!B5QFnCBDSqPQ3ELIECB!B2QIkCZtLQ3EKDBFE!B4QJhDcvHS2FJEBCG!B2SHhBhxCXwEBEIDF!B7SG!BDDBwDXuECFG!CKBBMG!BFBCwCYtEBHC!CNBCMD!BL!BJBByHB!CRMC!BLCB!BFBCyED!CQBC!Bb8DCDF0!CTBD!Bc9EHw!CY!BeCB6IEx!CTBC!Be8BBCB6mBND!BYCD!Be!BC6gCEBLF!BXDC!Be!BA9PCOECDJD!BZED!Bd39FCKCECNKJD!BWGF!Bb39MFCBEDKNHE!BRIF!Bd39MFCCEDKCGEIDBB!BO!Brz!BDKHCEKCBBXB!BHBIJD!Bgy!BCKICFDCECYD!BFBCCDMC!BgvBB!BDKPCDECXE!BDGFKD!Bhw!BEINEFDDXD!BEBCEEID!Bjv!BGDFKLCFGB!BXFEGF!Bjv!BGDCNMCJ!BYGEDI!Bks!BISY!BXGCDH!Bqn!BIUY!BYJDBC!Bsm!BIZFEK!BaIC!Bxk!BJaDIDCC!BaIC!Bxk!BJ!CI!B8CBTCDFD!BJqBBBOB!BL!B8CBQND!BGuBOC!BJ!B9DBOOD!BEwBPC!BH!CBDBNODBC!BBwCPDBC!BC!CCCBNPC!BDyBOBBDCC9!CECCLSC90BPCDK0BC!CDCCK!BS1CVJyCC!CIJMCBE92CVJsBBFC!BRCzJJBID64BVJSFQBD!CSJGEJE53BUNPFPCC!BfCwKFEOE03CSOOHNCD!CVKBEBBJBCJx3DQPNJNBDJC!CMO!BJ4DORKLNND!COL!BJ5CLUKLOMD!CTL!BE5CKVIQMKD!CVK!BD!BGYHQNLB!CYH!BE!BDaHRMNB!CYF!BE9eHRMLBCC!CXEKE18FDXFSCCHNE!CYDHEBFBFt7BGZESCEELBBBDB!CZDCBDEBKv!BDZDBBRCEDLBDCBB!CaZt!BDZGQDQBFE!CcBBVt!BBdDRCVF!CfVt!BAeCSCOCGD!CfZrKFszDME!CnbqCMrvEBEKF!Cnb8nwEBDJF!Cnd7myHHH!Cne6k1HEKFCBC!Caf7j3FEKCFCC!Cah5i4FFJBCGCDB!CWk2h6FEICEIE!CUnzg8FEHBEKDBFJB!CErwe!BAFHDCBBCDCCBBMIB!CBtwd!BBDNDBBLLFBBB!CAvvb!BDCNCBBLBCKBCBBCB!CAvub!BEEBBXBDKHB!CAuuc!BFGZKKB!B8swb!BLDBCBBBBCDMECDKD!B5swb!BRCCCWDJD!B5rxc!BuCKC!B5pyc!BdCIB!CQoycHC!BSHED!CPnydHD!BRHED!CPnydGE!BMLFE!CQlxeFDBB!BLNEFUCM!BsjydEG!BKBBODFVBL!BvhybFH!BKZeB!BxgzZHG!BJa!CSgzYIF!BKb!CRf1WJF!BGgPC!B9f1XHG!BEjPC!B8e3WHF!BDBBj!CPb6WHF!BDm!COY9VIF!BDo!CMX!BATMB!BGn!CMX!BBS!BTo!CLX!BBS!BTo!CKY!BCR!BTo!CKX!BDQ!BVn!CKW!BFO!BWn!CKV!BHM!BXQBV!CLU!BIL!BYLIT!CLT!BJJ!BaKJDBO!CLPBD!BLC!BgFPDBMVC!BzQ!DJNWC!ByR!DJMXB!BxR!DLKYC!BwQ!DOCBDaF!BtM!DxE!BvM!DwBCC!BvJ!DXFWF!BvM!DWEWD!ByJ!DZCVE!ByK!DuF!BzI!DvF!BzJ!DxC!B1K!FnK!FoJ!CLD!DbI!FqIHBBC!FgG!FtBBBBD!FsH!FuD!ukC!FtB!FuD!DLB!ChE!B0HdCMFEGHBGH!CfD!BzNCCQ!BE!CVD!BtcI!BK!COK!BgGBfH!BU!CFDBG!BGFBLBsF!Bb!B9Oy!BSC!Bm!BaBDBYBDHw!C89DCCCBOHBMDBBCDOr!DB1PBKKnu!C6vCB!BRt!C9w!BPq!DGl!BXq!DLfED!BSbHH!DRfDK!BLZIN!DGz!BNGHEKP!DFr!BdX!DSt!BgE!Dip!FOKFBHT!En!BJD!cf';
    const MW = 360,
      MH = 180,
      LAND = new Uint8Array(MW * MH);
    for (let i = 0, idx = 0, val = 0; i < RLE.length; ) {
      let n;
      if (RLE[i] === '!') {
        n = ALPH.indexOf(RLE[i + 1]) * 62 + ALPH.indexOf(RLE[i + 2]);
        i += 3;
      } else {
        n = ALPH.indexOf(RLE[i]);
        i += 1;
      }
      if (val) LAND.fill(1, idx, idx + n);
      idx += n;
      val ^= 1;
    }

    function isLand(lat, lon) {
      const row = Math.max(0, Math.min(MH - 1, Math.floor(90 - lat)));
      const col = ((Math.floor(lon + 180) % MW) + MW) % MW;
      return LAND[row * MW + col] === 1;
    }

    const N = 6500;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = phi * i;
      const x = Math.sin(th) * rad;
      const z = Math.cos(th) * rad;
      const lat = (Math.asin(y) * 180) / Math.PI;
      const lon = (Math.atan2(x, z) * 180) / Math.PI;
      pts.push({ x, y, z, land: isLand(lat, lon) });
    }

    const hLat = (60.17 * Math.PI) / 180;
    const hLon = (24.94 * Math.PI) / 180;
    const hel = {
      x: Math.cos(hLat) * Math.sin(hLon),
      y: Math.sin(hLat),
      z: Math.cos(hLat) * Math.cos(hLon),
    };

    const r = rng(904);
    const stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({ x: r(), y: r(), s: 0.5 + r() * 1.25, a: 0.12 + r() * 0.46, tw: r() * 6.28 });
    }

    let meteor = null;
    let nextMeteor = 1.8;
    function spawnMeteor(t) {
      const startX = 0.22 + Math.random() * 0.66;
      const startY = 0.05 + Math.random() * 0.26;
      const ang = Math.PI * 0.74 + (Math.random() - 0.5) * 0.18;
      const speed = 0.46 + Math.random() * 0.18;
      meteor = {
        x: startX,
        y: startY,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        t0: t,
        dur: 0.95 + Math.random() * 0.3,
      };
    }

    const BASE_VEL = 0.00055;
    let rotY = -0.34;
    let rotX = 0.44;
    let velY = BASE_VEL;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    c.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      try {
        c.setPointerCapture(e.pointerId);
      } catch {}
    });
    c.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      rotY += dx * 0.0052;
      rotX = Math.max(-1.05, Math.min(1.05, rotX + dy * 0.0042));
      velY = dx * 0.0014;
      if (reduce) draw(0);
    });
    const endDrag = () => {
      dragging = false;
    };
    c.addEventListener('pointerup', endDrag);
    c.addEventListener('pointercancel', endDrag);

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;

    function resize() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = innerWidth;
      H = innerHeight;
      c.width = Math.floor(W * dpr);
      c.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw(0);
    }

    function draw(ms) {
      const t = reduce ? 0 : ms * 0.001;
      ctx.fillStyle = '#0e0f11';
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const twinkle = reduce ? 1 : 0.74 + 0.26 * Math.sin(t * 1.05 + st.tw);
        ctx.fillStyle = `rgba(238,238,235,${(st.a * twinkle).toFixed(3)})`;
        ctx.fillRect(st.x * W, st.y * H, st.s, st.s);
      }

      if (!reduce) {
        if (!meteor && t >= nextMeteor) spawnMeteor(t);
        if (meteor) {
          const p = (t - meteor.t0) / meteor.dur;
          if (p >= 1) {
            meteor = null;
            nextMeteor = t + 4.8 + Math.random() * 5.2;
          } else {
            const headX = (meteor.x + meteor.vx * p) * W;
            const headY = (meteor.y + meteor.vy * p) * H;
            const tailLen = 128 * (1 - p * 0.32);
            const norm = Math.hypot(meteor.vx, meteor.vy) || 1;
            const tailX = headX - (meteor.vx / norm) * tailLen;
            const tailY = headY - (meteor.vy / norm) * tailLen;
            const fade = Math.sin(p * Math.PI);
            const g = ctx.createLinearGradient(headX, headY, tailX, tailY);
            g.addColorStop(0, `rgba(255,255,255,${(0.95 * fade).toFixed(3)})`);
            g.addColorStop(0.28, `rgba(220,226,236,${(0.44 * fade).toFixed(3)})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(headX, headY);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${(0.96 * fade).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(headX, headY, 1.4, 0, 6.28);
            ctx.fill();
          }
        }
      }

      const isMob = W < 720;
      const R = isMob ? Math.min(W * 0.56, 225) : Math.min(W * 0.34, H * 0.56, 375);
      const cx = isMob ? W * 0.5 : W * 0.76;
      const cy = isMob ? H * 0.86 : H * 0.56;

      const halo = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.18, cx, cy, R * 1.26);
      halo.addColorStop(0, 'rgba(255,255,255,0.045)');
      halo.addColorStop(0.72, 'rgba(255,255,255,0.02)');
      halo.addColorStop(0.85, 'rgba(255,255,255,0.055)');
      halo.addColorStop(1, 'rgba(14,15,17,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.26, 0, 6.28);
      ctx.fill();

      const core = ctx.createRadialGradient(cx - R * 0.34, cy - R * 0.34, R * 0.06, cx, cy, R);
      core.addColorStop(0, '#181a1f');
      core.addColorStop(0.68, '#0c0d10');
      core.addColorStop(1, '#08090b');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 6.28);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 6.28);
      ctx.stroke();

      if (!dragging && !reduce) {
        rotY += velY;
        velY += (BASE_VEL - velY) * 0.028;
      }

      const cyR = Math.cos(rotY);
      const syR = Math.sin(rotY);
      const cxR = Math.cos(rotX);
      const sxR = Math.sin(rotX);

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const x1 = p.x * cyR + p.z * syR;
        const z1 = -p.x * syR + p.z * cyR;
        const y2 = p.y * cxR - z1 * sxR;
        const z2 = p.y * sxR + z1 * cxR;
        if (z2 < -0.04) continue;
        const depth = Math.max(0, Math.min(1, (z2 + 0.04) / 1.04));
        const sx = cx + x1 * R;
        const sy = cy - y2 * R;
        if (p.land) {
          const a = 0.2 + depth * 0.76;
          const rad = 0.72 + depth * 0.76;
          ctx.fillStyle = `rgba(245,245,242,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, rad, 0, 6.28);
          ctx.fill();
        } else {
          const a = 0.02 + depth * 0.065;
          ctx.fillStyle = `rgba(200,205,214,${a.toFixed(3)})`;
          ctx.fillRect(sx - 0.35, sy - 0.35, 0.7, 0.7);
        }
      }

      const hx1 = hel.x * cyR + hel.z * syR;
      const hz1 = -hel.x * syR + hel.z * cyR;
      const hy2 = hel.y * cxR - hz1 * sxR;
      const hz2 = hel.y * sxR + hz1 * cxR;
      if (hz2 > 0.06) {
        const hx = cx + hx1 * R;
        const hy = cy - hy2 * R;
        const vis = Math.min(1, (hz2 - 0.06) / 0.25);
        const p1 = reduce ? 0.4 : (t * 0.55) % 1;
        const p2 = reduce ? 0.8 : (t * 0.55 + 0.5) % 1;

        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 20);
        glow.addColorStop(0, `rgba(229,23,63,${(0.45 * vis).toFixed(3)})`);
        glow.addColorStop(1, 'rgba(229,23,63,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(hx, hy, 20, 0, 6.28);
        ctx.fill();

        [p1, p2].forEach((p) => {
          ctx.strokeStyle = `rgba(229,23,63,${((1 - p) * 0.65 * vis).toFixed(3)})`;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(hx, hy, 4 + p * 16, 0, 6.28);
          ctx.stroke();
        });

        ctx.fillStyle = `rgba(229,23,63,${vis.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 3.8, 0, 6.28);
        ctx.fill();
        ctx.fillStyle = `rgba(255,240,242,${(0.9 * vis).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 1.3, 0, 6.28);
        ctx.fill();

        const lx = hx + 14;
        const ly = hy - 14;
        ctx.strokeStyle = `rgba(240,105,124,${(0.65 * vis).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx + 4, hy - 4);
        ctx.lineTo(lx, ly);
        ctx.lineTo(lx + 10, ly);
        ctx.stroke();
        ctx.font = '500 10.5px "Geist Mono",ui-monospace,Menlo,monospace';
        ctx.fillStyle = `rgba(242,242,239,${(0.92 * vis).toFixed(3)})`;
        ctx.textBaseline = 'middle';
        ctx.fillText('HELSINKI', lx + 14, ly);
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    }

    resize();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!document.hidden && !reduce) raf = requestAnimationFrame(draw);
    });
    raf = requestAnimationFrame(draw);
  })();
})();
