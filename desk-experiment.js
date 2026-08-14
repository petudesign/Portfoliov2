const screen = document.querySelector('.phone-screen');
const swipeCoach = document.querySelector('.swipe-coach');
const track = document.querySelector('.phone-track');
const slides = [...document.querySelectorAll('.phone-slide')];
const caseLink = document.querySelector('.case-link');
const videos = [...document.querySelectorAll('.phone-slide video')];
const dots = [...document.querySelectorAll('.project-dots i')];
const airpods = document.querySelector('.desk-object-airpods');
const airpodsTrigger = document.querySelector('.airpods-trigger');
const musicCard = document.querySelector('.desk-music-card');
const spotifyEmbed = document.querySelector('.spotify-embed');
const islandTime = document.querySelector('.island-time');
const phone = document.querySelector('.phone');
const scrap = document.querySelector('.desk-scrap');
const scrapTrigger = document.querySelector('.scrap-trigger');
const scrapNote = document.querySelector('.scrap-note');
const scrapClose = document.querySelector('.scrap-close');
const turnToggle = document.querySelector('.turn-toggle');
const deskScene = document.querySelector('.desk-scene');
const folderSection = document.querySelector('.folder-section');
const folderContent = document.querySelector('.folder-content');
const caseBook = document.querySelector('.case-book');
const caseBookTabs = [...document.querySelectorAll('.case-edge-tab[data-case-index]')];
const caseSpreads = [...document.querySelectorAll('.case-spread')];
const caseBookPrevious = document.querySelector('.case-book-previous');
const caseBookNext = document.querySelector('.case-book-next');
const caseBookCount = document.querySelector('.case-book-controls strong');
const aboutFolderLink = document.querySelector('[data-folder-case="3"]');
const projectsFolderLink = document.querySelector('[data-folder-case="0"]');
const folderDockTop = 72;
let activeProject = 0;
let spotifyController;
let spotifyApi;

const projectLinks = ['shavikki.html', 'tahti.html', 'flowmark.html'];

const formatPlaybackTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const createSpotifyPlayer = () => {
  if (!spotifyApi || !spotifyEmbed || spotifyController) return;
  spotifyApi.createController(spotifyEmbed, {
    uri: spotifyEmbed.dataset.uri,
    width: '100%',
    height: 152,
  }, (controller) => {
    spotifyController = controller;
    controller.addListener('ready', () => {
      if (airpods?.classList.contains('is-open')) phone.classList.add('is-music-ready');
    });
    controller.addListener('playback_update', ({ data }) => {
      islandTime.textContent = data.position > 0 ? formatPlaybackTime(data.position) : islandTime.dataset.idleLabel;
    });
  });
};

window.onSpotifyIframeApiReady = (iframeApi) => {
  spotifyApi = iframeApi;
  if (airpods?.classList.contains('is-open')) createSpotifyPlayer();
};

let swipeCoachTimer;
const dismissSwipeCoach = () => {
  window.clearTimeout(swipeCoachTimer);
  swipeCoach?.classList.remove('is-visible');
};
swipeCoachTimer = window.setTimeout(() => swipeCoach?.classList.add('is-visible'), 2000);

function setProject(nextProject) {
  activeProject = (nextProject + slides.length) % slides.length;
  track.style.transform = `translateX(-${activeProject * (100 / slides.length)}%)`;
  caseLink.href = projectLinks[activeProject];
  dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeProject));
  videos.forEach((video, index) => {
    if (index === activeProject) video.play().catch(() => {});
    else video.pause();
  });
}

let startX = null;
let dragging = false;
screen.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  dismissSwipeCoach();
  startX = event.clientX;
  dragging = true;
  screen.setPointerCapture(event.pointerId);
});
screen.addEventListener('pointermove', (event) => {
  if (!dragging || startX === null) return;
  if (Math.abs(event.clientX - startX) > 8) event.preventDefault();
});
screen.addEventListener('pointerup', (event) => {
  if (startX === null || !dragging) return;
  const distance = event.clientX - startX;
  if (Math.abs(distance) > 35) setProject(activeProject + (distance < 0 ? 1 : -1));
  startX = null;
  dragging = false;
});
screen.addEventListener('pointercancel', () => { startX = null; dragging = false; });
screen.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') dismissSwipeCoach();
  if (event.key === 'ArrowRight') setProject(activeProject + 1);
  if (event.key === 'ArrowLeft') setProject(activeProject - 1);
});

setProject(0);

airpodsTrigger?.addEventListener('click', () => {
  const isOpen = airpods.classList.toggle('is-open');
  airpodsTrigger.setAttribute('aria-expanded', String(isOpen));
  airpodsTrigger.querySelector('.visually-hidden').textContent = isOpen
    ? 'Close AirPods music easter egg'
    : 'Open AirPods music easter egg';
  musicCard.hidden = !isOpen;
  if (isOpen) createSpotifyPlayer();
  if (!isOpen) {
    spotifyController?.pause();
    islandTime.textContent = islandTime.dataset.idleLabel;
  }
  phone.classList.toggle('is-music-ready', isOpen);
});

scrapTrigger?.addEventListener('click', () => {
  scrap.classList.add('is-open');
  scrapTrigger.setAttribute('aria-expanded', 'true');
  scrapNote.hidden = false;
});

scrapClose?.addEventListener('click', () => {
  scrap.classList.remove('is-open');
  scrapTrigger.setAttribute('aria-expanded', 'false');
  scrapNote.hidden = true;
  scrapTrigger.focus();
});

turnToggle?.addEventListener('click', () => {
  const isOrganized = deskScene.classList.toggle('is-organized');
  turnToggle.setAttribute('aria-pressed', String(isOrganized));
});

if (folderSection && deskScene) {
  let wasFolderDocked = false;

  const updateFolderDockState = () => {
    const isFolderDocked = folderSection.getBoundingClientRect().top <= folderDockTop + 1;
    folderSection.classList.toggle('is-docked', isFolderDocked);

    if (wasFolderDocked && !isFolderDocked && folderContent) folderContent.scrollTop = 0;
    wasFolderDocked = isFolderDocked;
  };

  window.addEventListener('scroll', updateFolderDockState, { passive: true });
  window.addEventListener('resize', updateFolderDockState);
  updateFolderDockState();

  const folderObserver = new IntersectionObserver(([entry]) => {
    deskScene.classList.toggle('is-folder-active', entry.isIntersecting);
  }, { rootMargin: '-35% 0px -15% 0px' });

  folderObserver.observe(folderSection);
}

if (caseBook && caseSpreads.length) {
  let activeCase = 0;
  let caseSwipeStartX = null;
  let caseWheelTotal = 0;
  let caseWheelLocked = false;

  const setActiveCase = (nextCase) => {
    activeCase = (nextCase + caseSpreads.length) % caseSpreads.length;
    caseBook.dataset.activeCase = String(activeCase);
    caseBookCount.textContent = String(activeCase + 1).padStart(2, '0');

    caseSpreads.forEach((spread, index) => {
      const distance = Math.abs(index - activeCase);
      spread.style.setProperty('--stack-distance', String(Math.max(1, distance)));
      spread.style.zIndex = String(caseSpreads.length - distance);
      spread.classList.toggle('is-current', index === activeCase);
      spread.classList.toggle('is-before', index < activeCase);
      spread.classList.toggle('is-after', index > activeCase);
      spread.querySelectorAll(':scope > .case-page').forEach((page) => {
        page.setAttribute('aria-hidden', String(index !== activeCase));
        page.inert = index !== activeCase;
      });
      spread.querySelectorAll('video').forEach((video) => index === activeCase ? video.play().catch(() => {}) : video.pause());
    });

    caseBookTabs.forEach((tab) => {
      const index = Number(tab.dataset.caseIndex);
      tab.setAttribute('aria-pressed', String(index === activeCase));
      tab.tabIndex = index === activeCase ? 0 : -1;
    });
    projectsFolderLink?.classList.toggle('is-active', activeCase < 3);
    aboutFolderLink?.classList.toggle('is-active', activeCase === 3);
  };

  caseBookTabs.forEach((tab) => tab.addEventListener('click', () => setActiveCase(Number(tab.dataset.caseIndex))));
  caseBookPrevious?.addEventListener('click', () => setActiveCase(activeCase - 1));
  caseBookNext?.addEventListener('click', () => setActiveCase(activeCase + 1));
  projectsFolderLink?.addEventListener('click', () => setActiveCase(0));
  aboutFolderLink?.addEventListener('click', (event) => {
    event.preventDefault();
    setActiveCase(3);
    folderSection?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  caseBook.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setActiveCase(activeCase + (event.key === 'ArrowRight' ? 1 : -1));
    caseBookTabs[activeCase]?.focus();
  });
  caseBook.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button, a')) return;
    caseSwipeStartX = event.clientX;
    caseBook.classList.add('is-dragging');
    caseBook.setPointerCapture(event.pointerId);
  });
  caseBook.addEventListener('pointermove', (event) => {
    if (caseSwipeStartX === null || Math.abs(event.clientX - caseSwipeStartX) < 6) return;
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
  });
  caseBook.addEventListener('pointerup', (event) => {
    if (caseSwipeStartX === null) return;
    const distance = event.clientX - caseSwipeStartX;
    if (Math.abs(distance) > 55) setActiveCase(activeCase + (distance < 0 ? 1 : -1));
    caseSwipeStartX = null;
    caseBook.classList.remove('is-dragging');
  });
  caseBook.addEventListener('pointercancel', () => {
    caseSwipeStartX = null;
    caseBook.classList.remove('is-dragging');
  });
  folderSection?.addEventListener('wheel', (event) => {
    if (!folderSection?.classList.contains('is-docked') || caseWheelLocked) return;
    if ((event.deltaY < 0 && activeCase === 0) || (event.deltaY > 0 && activeCase === caseSpreads.length - 1)) return;

    event.preventDefault();
    caseWheelTotal += event.deltaY;
    if (Math.abs(caseWheelTotal) < 48) return;

    setActiveCase(activeCase + (caseWheelTotal > 0 ? 1 : -1));
    caseWheelTotal = 0;
    caseWheelLocked = true;
    window.setTimeout(() => { caseWheelLocked = false; }, 560);
  }, { passive: false });

  setActiveCase(0);
}
