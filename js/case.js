/* Shared case study interactions: TL;DR/Full mode switch, image lightbox,
   scroll reveals, floating top bar, chapter TOC rail, and stat counters. */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- TL;DR / Full case toggle ---------- */
  (function () {
    const btns = [...document.querySelectorAll('.mode button')];
    if (!btns.length) return;
    const thumb = document.querySelector('.mode .thumb');

    const place = () => {
      const b = btns.find((x) => x.getAttribute('aria-pressed') === 'true');
      if (!b || !thumb) return;
      thumb.style.setProperty('--x', b.offsetLeft + 'px');
      thumb.style.setProperty('--w', b.offsetWidth + 'px');
    };

    const anchor = () => {
      const chs = [...document.querySelectorAll('.ch')].filter((c) => c.offsetParent !== null);
      let a = null;
      for (const c of chs) {
        if (c.getBoundingClientRect().top <= 120) a = c;
      }
      return a;
    };

    const set = (m, save) => {
      const a = save && anchor();
      const before = a && a.getBoundingClientRect().top;
      document.body.classList.toggle('tldr', m === 'tldr');
      if (a) {
        const vis =
          a.offsetParent !== null
            ? a
            : [...document.querySelectorAll('.ch')]
                .filter(
                  (c) =>
                    c.offsetParent !== null &&
                    c.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING
                )
                .pop();
        if (vis) {
          const se = document.scrollingElement || document.documentElement;
          se.scrollTop += vis.getBoundingClientRect().top - (vis === a ? before : 120);
        }
      }
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
      place();
      if (save) {
        try {
          localStorage.setItem('case-mode', m);
        } catch {}
      }
    };

    const still = () => {
      if (!thumb) return;
      thumb.style.transition = 'none';
      place();
      thumb.getBoundingClientRect();
      thumb.style.transition = '';
    };

    still();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(still);
    addEventListener('resize', still);

    const bar = document.querySelector('.mode-bar');
    if (bar && 'IntersectionObserver' in window) {
      const s = document.createElement('div');
      s.style.cssText = 'height:1px;margin-top:-1px';
      bar.before(s);
      new IntersectionObserver(([e]) =>
        bar.classList.toggle('stuck', !e.isIntersecting && e.boundingClientRect.top < 0)
      ).observe(s);
    }

    let saved = null;
    try {
      saved = localStorage.getItem('case-mode');
    } catch {}
    if (saved === 'full') set('full');

    btns.forEach((b) => b.addEventListener('click', () => set(b.dataset.mode, true)));

    document.querySelectorAll('.key a[href^="#"]').forEach((a) =>
      a.addEventListener('click', () => {
        const href = a.getAttribute('href') || '';
        const t = href.length > 1 ? document.getElementById(href.slice(1)) : null;
        if (t && t.closest('.full')) set('full', true);
      })
    );
  })();

  /* ---------- image lightbox ---------- */
  (function () {
    let lb = null;
    let last = null;

    const close = () => {
      if (!lb) return;
      const el = lb;
      lb = null;
      el.classList.remove('open');
      setTimeout(() => el.remove(), reduceMotion ? 0 : 200);
      if (last) last.focus({ preventScroll: true });
    };

    document.querySelectorAll('img.zoom').forEach((img) => {
      const alt = img.alt || 'Image';
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Open larger: ' + alt);

      const open = () => {
        if (lb) {
          lb.remove();
          lb = null;
        }
        last = img;
        lb = document.createElement('div');
        lb.className = 'lb';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.setAttribute('aria-label', alt);
        lb.innerHTML = '<img alt=""><button type="button">Close</button>';
        const lbImg = lb.querySelector('img');
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = alt;
        lb.addEventListener('click', close);
        document.body.append(lb);
        setTimeout(() => {
          if (lb) lb.classList.add('open');
        }, 16);
        lb.querySelector('button').focus();
      };

      img.addEventListener('click', open);
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });

    addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab' && lb) {
        e.preventDefault();
        const btn = lb.querySelector('button');
        if (btn) btn.focus();
      }
    });
  })();

  /* ---------- scroll reveals ---------- */
  (function () {
    const els = [...document.querySelectorAll('.reveal')];
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((e) => {
      if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-in');
      else io.observe(e);
    });
  })();

  /* ---------- floating name bar ---------- */
  (function () {
    const bar = document.querySelector('.top');
    if (!bar) return;
    let last = scrollY;

    const update = () => {
      const y = scrollY;
      const dy = y - last;
      if (y < 80) {
        bar.classList.remove('float', 'away');
        document.documentElement.classList.remove('top-on');
      } else if (dy > 6) {
        bar.classList.add('away');
        document.documentElement.classList.remove('top-on');
      } else if (dy < -6) {
        bar.classList.add('float');
        bar.classList.remove('away');
        document.documentElement.classList.add('top-on');
      }
      if (Math.abs(dy) > 6 || y < 80) last = y;
    };

    addEventListener('scroll', update, { passive: true });
    bar.addEventListener('focusin', () => {
      bar.classList.remove('away');
      bar.classList.add('float');
      document.documentElement.classList.add('top-on');
    });

    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let byHover = false;
      const hide = () => {
        byHover = false;
        bar.classList.add('away');
        document.documentElement.classList.remove('top-on');
      };
      let dwell = 0;
      addEventListener(
        'mousemove',
        (e) => {
          const inZone =
            e.clientY <= 16 && !(e.target && e.target.closest && e.target.closest('.mode-bar'));
          if (inZone && scrollY >= 80 && bar.classList.contains('away')) {
            if (!dwell) {
              dwell = setTimeout(() => {
                dwell = 0;
                byHover = true;
                bar.classList.add('float');
                bar.classList.remove('away');
                document.documentElement.classList.add('top-on');
                last = scrollY;
              }, 260);
            }
          } else {
            clearTimeout(dwell);
            dwell = 0;
            if (byHover && e.clientY > bar.getBoundingClientRect().bottom + 48) hide();
          }
        },
        { passive: true }
      );
      document.documentElement.addEventListener('mouseleave', () => {
        if (byHover) hide();
      });
      let py = scrollY;
      addEventListener(
        'scroll',
        () => {
          if (scrollY < py - 6) byHover = false;
          py = scrollY;
        },
        { passive: true }
      );
    }
  })();

  /* ---------- chapter TOC rail ---------- */
  (function () {
    const chs = [...document.querySelectorAll('.ch')];
    if (!chs.length) return;
    const nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', 'Contents');
    const ol = document.createElement('ol');
    nav.append(ol);

    const items = chs
      .map((ch) => {
        const h = ch.querySelector('h2');
        if (!h) return null;
        const li = document.createElement('li');
        if (ch.closest('.full')) li.className = 'full';
        const a = document.createElement('a');
        a.href = '#' + (h.id || '');
        a.setAttribute('aria-label', h.textContent || '');
        const k = ol.children.length;
        a.innerHTML = '<span class="dot"></span><span class="t"></span>';
        a.querySelector('.t').textContent = h.textContent || '';
        li.style.setProperty('--k', k);
        li.append(a);
        ol.append(li);
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const y = ch.getBoundingClientRect().top + scrollY - 40;
          scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
        return { ch, a, li };
      })
      .filter(Boolean);

    if (!items.length) return;

    const mb = document.querySelector('.mode-bar');
    if (mb) mb.after(nav);
    else document.body.append(nav);

    const end = document.querySelector('.next');

    const near = () => {
      const vis = items.filter((it) => it.ch.offsetParent !== null);
      const i = vis.findIndex((it) => it.li.classList.contains('active'));
      items.forEach((it) => it.li.classList.remove('near1', 'near2'));
      if (i < 0) return;
      [
        [i - 1, 'near1'],
        [i + 1, 'near1'],
      ].forEach(([j, c]) => {
        if (vis[j]) vis[j].li.classList.add(c);
      });
    };

    const spy = () => {
      const mid = innerHeight * 0.35;
      let cur = null;
      for (const it of items) {
        if (it.ch.offsetParent === null) continue;
        if (it.ch.getBoundingClientRect().top <= mid) cur = it;
      }
      items.forEach((it) => {
        it.li.classList.toggle('active', it === cur);
        it.a.toggleAttribute('aria-current', it === cur);
      });
      near();
      const first = items.find((it) => it.ch.offsetParent !== null);
      const show =
        first &&
        first.ch.getBoundingClientRect().top < innerHeight * 0.6 &&
        (!end || end.getBoundingClientRect().top > innerHeight * 0.5);
      nav.classList.toggle(
        'on',
        Boolean(show) || nav.classList.contains('peek') || nav.matches(':hover,:focus-within')
      );
    };

    const fit = () => {
      if (nav.offsetParent === null && getComputedStyle(nav).display === 'none') return;
      const w = Math.max(...items.map((it) => it.a.querySelector('.t').scrollWidth));
      nav.style.setProperty('--cw', Math.ceil(w + 60) + 'px');
    };

    nav.addEventListener('mousemove', (e) => {
      items.forEach((it) => {
        const d = it.a.querySelector('.dot');
        if (it.li.classList.contains('active')) {
          d.style.removeProperty('--w');
          return;
        }
        const r = d.getBoundingClientRect();
        const rows = (r.top + r.height / 2 - e.clientY) / 28;
        d.style.setProperty('--w', (6 + 12 * Math.exp(-rows * rows)).toFixed(1) + 'px');
      });
    });

    nav.addEventListener('mouseleave', () => {
      items.forEach((it) => it.a.querySelector('.dot').style.removeProperty('--w'));
      spy();
    });

    nav.addEventListener('focusout', () => setTimeout(spy, 0));

    const peek = () => {
      if (getComputedStyle(nav).display === 'none') return;
      nav.classList.add('peek', 'on');
      const n = items.filter((it) => it.ch.offsetParent !== null).length;
      setTimeout(() => {
        nav.classList.remove('peek');
        spy();
      }, 260 + n * 55 + 1200);
    };

    setTimeout(peek, document.documentElement.classList.contains('curtain-in') ? 1100 : 500);
    addEventListener('scroll', spy, { passive: true });
    addEventListener('resize', () => {
      spy();
      fit();
    });
    document.querySelectorAll('.mode button').forEach((b) =>
      b.addEventListener('click', () => setTimeout(spy, 0))
    );
    spy();
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  })();

  /* ---------- stat counters ---------- */
  (function () {
    const els = [...document.querySelectorAll('[data-count]')];
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;
    const fmt = (n) => n.toLocaleString('en-US');

    els.forEach((el) => {
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = el.textContent;
      el.before(sr);
      el.setAttribute('aria-hidden', 'true');
    });

    els.forEach((el) => {
      el.style.display = getComputedStyle(el).display === 'inline' ? 'inline-block' : '';
      el.style.minWidth = el.getBoundingClientRect().width + 'px';
      el.textContent = '0';
    });

    const run = (el) => {
      const to = Number(el.dataset.count);
      if (!Number.isFinite(to)) return;
      const dur = 1400 + Math.min(600, Math.log10(to + 1) * 120);
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt(Math.round(to * e));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            io.unobserve(el);
            const li = el.closest('li');
            const ul = li && el.closest('ul');
            const idx = li && ul ? [...ul.children].indexOf(li) : 0;
            setTimeout(() => run(el), idx * 90);
          }
        }),
      { rootMargin: '0px 0px -12% 0px' }
    );
    els.forEach((el) => io.observe(el));
  })();
})();
