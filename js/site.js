/* Shared site interactions: email copy + live announcements, mouse-wheel smoothing,
   pixel-curtain navigation handoff, and viewport-aware video clips. */
(function () {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'helttula.petteri@gmail.com';
  const INTERNAL_ROUTE_RE =
    /^\/(korislab\/|peluutin\/|helsinki-sports-map\/|s-havikki\/|kelikamera\/|tahti\/|havain\/|maamitta\/)?$/;

  const safeSessionSet = (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  };

  /* ---------- email copy + toast + screen reader announcement ---------- */
  const toast = document.getElementById('toast');
  const live = document.getElementById('srLive');
  let toastTimer;
  let copyTimer;

  const say = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  };

  const announce = (msg) => {
    if (!live) return;
    live.textContent = '';
    setTimeout(() => {
      live.textContent = msg;
    }, 30);
  };

  const copyBtns = [
    document.getElementById('copyEmail'),
    ...document.querySelectorAll('[data-copy-email]'),
  ].filter(Boolean);

  copyBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      const done = () => {
        copyBtns.forEach((b) => b.classList.add('is-copied'));
        clearTimeout(copyTimer);
        copyTimer = setTimeout(
          () => copyBtns.forEach((b) => b.classList.remove('is-copied')),
          1800
        );
        announce('Email address copied');
      };
      const fail = () => {
        say(EMAIL);
        announce('Email: ' + EMAIL);
      };
      (navigator.clipboard ? navigator.clipboard.writeText(EMAIL) : Promise.reject()).then(
        done,
        fail
      );
    })
  );

  /* ---------- mouse-wheel smooth scrolling (desktop fine pointers only) ---------- */
  (function () {
    if (reduceMotion || !matchMedia('(pointer: fine)').matches) return;
    const se = () => document.scrollingElement || document.documentElement;
    let target = null;
    let raf = 0;
    let off = false;

    const stop = () => {
      target = null;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const step = () => {
      const el = se();
      const cur = el.scrollTop;
      const next = cur + (target - cur) * 0.2;
      el.scrollTop = Math.abs(target - next) < 0.5 ? target : next;
      if (el.scrollTop === cur && Math.abs(target - cur) > 1) {
        off = true;
        const t = target;
        stop();
        window.scrollBy(0, t - cur);
        return;
      }
      if (Math.abs(target - el.scrollTop) > 0.5) raf = requestAnimationFrame(step);
      else stop();
    };

    addEventListener(
      'wheel',
      (e) => {
        if (off || e.ctrlKey || e.metaKey || e.shiftKey || e.deltaX) return;
        const d =
          e.deltaMode === 1
            ? e.deltaY * 18
            : e.deltaMode === 2
              ? e.deltaY * innerHeight
              : e.deltaY;
        const isWheel =
          e.deltaMode !== 0 || (Math.abs(d) >= 50 && Number.isInteger(e.deltaY));
        if (!isWheel) {
          stop();
          return;
        }
        const el = se();
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 0) return;
        e.preventDefault();
        if (target === null) target = el.scrollTop;
        target = Math.max(0, Math.min(max, target + d));
        if (!raf) raf = requestAnimationFrame(step);
      },
      { passive: false }
    );

    ['keydown', 'pointerdown', 'touchstart'].forEach((ev) =>
      addEventListener(ev, stop, { passive: true })
    );

    document.querySelectorAll('a[href^="#"]:not([data-to-top])').forEach((a) =>
      a.addEventListener('click', (e) => {
        const raw = a.getAttribute('href') || '';
        if (raw.length < 2) return;
        let el = null;
        try {
          el = document.getElementById(decodeURIComponent(raw.slice(1)));
        } catch {
          return;
        }
        if (el) {
          e.preventDefault();
          stop();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
    );
  })();

  /* ---------- pixel curtain: leaving + prefetch ---------- */
  (function () {
    if (reduceMotion) return;
    const isInternal = (a) =>
      a &&
      !a.target &&
      a.origin === location.origin &&
      INTERNAL_ROUTE_RE.test(a.pathname) &&
      a.pathname !== location.pathname;

    document.addEventListener('click', (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!isInternal(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
        return;
      e.preventDefault();
      const label = a.dataset.curtain || '';
      safeSessionSet('curtain', label || ' ');
      if (window.PixelCurtain) window.PixelCurtain.leave(label, a.href);
      else location.href = a.href;
    });

    const prefetched = new Set();
    document.addEventListener(
      'pointerover',
      (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!isInternal(a) || prefetched.has(a.href)) return;
        prefetched.add(a.href);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = a.href;
        document.head.append(link);
      },
      { passive: true }
    );

    addEventListener('pageshow', (e) => {
      if (e.persisted) document.querySelectorAll('.curtain').forEach((n) => n.remove());
    });
  })();

  /* ---------- pixel curtain: arriving ---------- */
  (function () {
    const r = document.documentElement;
    if (!r.classList.contains('curtain-in')) return;
    try {
      history.scrollRestoration = 'manual';
    } catch {}

    const place = () => {
      let target = null;
      if (location.hash && location.hash.length > 1) {
        try {
          target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        } catch {}
      }
      if (target) {
        target.scrollIntoView({ block: 'start' });
      } else {
        (document.scrollingElement || document.documentElement).scrollTop = 0;
        window.scrollTo(0, 0);
      }
    };

    place();
    addEventListener('DOMContentLoaded', place, { once: true });
    addEventListener('load', place, { once: true });

    const label = (r.getAttribute('data-curtain') || '').trim();
    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      r.classList.remove('curtain-in', 'curtain-out');
    };
    const start = () => {
      if (window.PixelCurtain) window.PixelCurtain.arrive(label, reveal);
      else reveal();
    };
    if (document.readyState !== 'loading') start();
    else addEventListener('DOMContentLoaded', start, { once: true });
    setTimeout(reveal, 2500);
  })();

  /* ---------- viewport-aware video clips ---------- */
  (function () {
    const clips = [...document.querySelectorAll('video.clip')];
    if (!clips.length) return;
    const isHome = document.body && document.body.dataset.page === 'home';
    const icon = {
      pause:
        '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>',
      play:
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4a.8.8 0 0 0 1.2.7l8.4-5.2a.8.8 0 0 0 0-1.4L5.7 2.1a.8.8 0 0 0-1.2.7z"/></svg>',
    };

    clips.forEach((v) => {
      const box = v.closest('.clipbox');
      if (!box) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'clip-toggle';
      box.append(btn);

      const draw = () => {
        const paused = v.paused;
        btn.innerHTML = paused ? icon.play : icon.pause;
        btn.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
        btn.setAttribute('aria-pressed', String(paused && v.dataset.user === 'paused'));
      };

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (v.paused) {
          v.dataset.user = '';
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          v.dataset.user = 'paused';
          v.pause();
        }
      });

      v.addEventListener('play', draw);
      v.addEventListener('pause', draw);
      draw();
      if (reduceMotion) v.dataset.user = 'paused';
    });

    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) {
            if (v.dataset.user !== 'paused') {
              if (isHome) {
                clips.forEach((other) => {
                  if (other !== v && !other.paused) other.pause();
                });
              }
              const p = v.play();
              if (p && p.catch) p.catch(() => {});
            }
          } else {
            v.pause();
          }
        }),
      { threshold: isHome ? 0.45 : 0.35 }
    );
    clips.forEach((v) => io.observe(v));
  })();
})();
