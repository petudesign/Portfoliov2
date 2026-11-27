/* Home page interactions: floating scroll-up bar, case-link digit decode,
   product still reveals, and cursor-following hover previews. */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- floating scroll-up bar ---------- */
  (function () {
    const bar = document.querySelector('.top');
    if (!bar) return;
    const SHOW_AT = 380;
    let last = scrollY;
    const show = () => bar.classList.add('on');
    const hide = () => bar.classList.remove('on');

    const update = () => {
      const y = scrollY;
      const dy = y - last;
      if (y <= SHOW_AT) hide();
      else if (dy > 6) hide();
      else if (dy < -6) show();
      if (Math.abs(dy) > 6 || y <= SHOW_AT) last = y;
    };

    addEventListener('scroll', update, { passive: true });
    bar.addEventListener('focusin', () => {
      if (scrollY > SHOW_AT) show();
    });

    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let byHover = false;
      let dwell = 0;
      let py = scrollY;
      const hideHover = () => {
        byHover = false;
        hide();
      };
      addEventListener(
        'mousemove',
        (e) => {
          if (e.clientY <= 16 && scrollY > SHOW_AT && !bar.classList.contains('on')) {
            if (!dwell) {
              dwell = setTimeout(() => {
                dwell = 0;
                byHover = true;
                show();
                last = scrollY;
              }, 260);
            }
          } else {
            clearTimeout(dwell);
            dwell = 0;
            if (byHover && e.clientY > bar.getBoundingClientRect().bottom + 48) hideHover();
          }
        },
        { passive: true }
      );
      document.documentElement.addEventListener('mouseleave', () => {
        if (byHover) hideHover();
      });
      addEventListener(
        'scroll',
        () => {
          if (scrollY < py - 6) byHover = false;
          py = scrollY;
        },
        { passive: true }
      );
    }

    document.querySelectorAll('[data-to-top]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        hide();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      })
    );
  })();

  /* ---------- case-link digit decode ---------- */
  (function () {
    if (reduceMotion) return;
    const CH = '0123456789';
    document.querySelectorAll('.case-link').forEach((link) => {
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

  /* ---------- product stills reveal ---------- */
  (function () {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px' }
    );
    document.querySelectorAll('.shot').forEach((s) => {
      if (s.getBoundingClientRect().top > innerHeight) {
        s.classList.add('will-reveal');
        io.observe(s);
      }
    });
  })();

  /* ---------- hover preview card ---------- */
  (function () {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.querySelectorAll('[data-preview]').forEach((a) => {
      const srcs = (a.dataset.preview || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      if (!srcs.length) return;
      const isVideo = srcs.length === 1 && /\.(mp4|webm|mov)$/i.test(srcs[0]);
      const card = document.createElement('div');
      card.className = 'peek';
      card.setAttribute('aria-hidden', 'true');
      const frames = srcs.map((src, i) => {
        const m = document.createElement(isVideo ? 'video' : 'img');
        m.src = src;
        if (isVideo) {
          m.muted = true;
          m.loop = true;
          m.playsInline = true;
          m.preload = 'auto';
        } else {
          m.alt = '';
          m.decoding = 'async';
          m.loading = 'eager';
        }
        if (i === 0) m.classList.add('cur');
        card.append(m);
        return m;
      });
      document.body.append(card);

      let tx = 0,
        ty = 0,
        x = 0,
        y = 0,
        raf = 0,
        timer = 0,
        tick = 0,
        k = 0,
        on = false;

      const place = () => {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        card.style.setProperty('--x', x.toFixed(1) + 'px');
        card.style.setProperty('--y', y.toFixed(1) + 'px');
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 && on ? requestAnimationFrame(place) : 0;
      };

      const target = (e) => {
        const w = card.offsetWidth;
        const h = card.offsetHeight;
        tx = Math.min(e.clientX + 20, innerWidth - w - 12);
        ty = e.clientY + 22;
        if (ty + h > innerHeight - 12) ty = e.clientY - h - 16;
        if (on && !raf) raf = requestAnimationFrame(place);
      };

      const step = () => {
        frames.forEach((f) => f.classList.remove('prev'));
        frames[k].classList.replace('cur', 'prev');
        k = (k + 1) % frames.length;
        frames[k].classList.add('cur');
      };

      a.addEventListener('mouseenter', (e) => {
        target(e);
        x = tx;
        y = ty;
        place();
        clearTimeout(timer);
        timer = setTimeout(() => {
          on = true;
          card.classList.add('on');
          if (isVideo) {
            const p = frames[0].play();
            if (p && p.catch) p.catch(() => {});
          } else if (frames.length > 1) {
            clearInterval(tick);
            tick = setInterval(step, 700);
          }
        }, 120);
      });

      a.addEventListener('mousemove', target);
      a.addEventListener('mouseleave', () => {
        clearTimeout(timer);
        clearInterval(tick);
        on = false;
        card.classList.remove('on');
        if (isVideo) {
          setTimeout(() => {
            if (!on) frames[0].pause();
          }, 200);
        }
      });
    });
  })();
})();
