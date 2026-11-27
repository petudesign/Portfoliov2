/* Render-blocking head init: handles pixel-curtain handoff and optional home entrance animation. */
(function () {
  const r = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DATA_PNG_RE = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/;
  const isHome = document.currentScript && document.currentScript.hasAttribute('data-entrance');

  let curtainLabel = null;
  let curtainImg = null;
  let entranceSeen = false;

  try {
    entranceSeen = Boolean(sessionStorage.getItem('entrance-seen'));
    curtainLabel = sessionStorage.getItem('curtain');
    curtainImg = sessionStorage.getItem('curtain-img');
    if (curtainLabel !== null) sessionStorage.removeItem('curtain');
    if (curtainImg !== null) sessionStorage.removeItem('curtain-img');
  } catch {
    if (isHome) r.classList.add('no-entrance');
  }

  if (isHome) {
    if (entranceSeen || curtainLabel !== null) {
      r.classList.add('no-entrance');
    } else {
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            r.classList.add('entrance-go');
            try {
              sessionStorage.setItem('entrance-seen', '1');
            } catch {}
          })
        );
      };
      const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      ready.then(start, start);
      setTimeout(start, 1500);
    }
  }

  if (curtainLabel !== null && !reduce) {
    r.classList.add('curtain-in');
    r.setAttribute('data-curtain', curtainLabel.trim());
    if (curtainImg && DATA_PNG_RE.test(curtainImg)) {
      r.style.setProperty('--curtain-img', 'url(' + curtainImg + ')');
    }
  }
})();
