function initializeCaseVideos(root) {
 root.querySelectorAll('[data-case-video]').forEach(video => {
  const toggle = video.closest('figure').querySelector('[data-video-toggle]');
  const update = () => { toggle.textContent = video.paused ? 'Play video' : 'Pause video'; };
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  toggle.addEventListener('click', () => {
   if (video.paused) video.play().catch(update);
   else video.pause();
  });
  video.muted = true;
  update();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(update);
 });
}
