function initializeCaseVideos(root) {
 root.querySelectorAll('[data-case-video]').forEach(video => {
  // The player's own controls handle play and pause.
  video.muted = true;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {});
 });
}
