function initializeCaseComparisons(root) {
 root.querySelectorAll('[data-comparison]').forEach(figure => {
  if (figure.dataset.comparisonReady) return;
  figure.dataset.comparisonReady = 'true';
  const frame = figure.querySelector('.case-comparison-frame');
  const input = figure.querySelector('input[type="range"]');
  function update(value) {
   const position = Math.max(0, Math.min(100, Math.round(value)));
   input.value = position;
   input.setAttribute('aria-valuetext', `${position}% before, ${100-position}% after`);
   frame.style.setProperty('--reveal', `${position}%`);
   frame.dataset.position = position;
   figure.querySelectorAll('[data-comparison-value]').forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.comparisonValue) === position));
   });
  }
  function updatePointer(event) {
   const bounds = frame.getBoundingClientRect();
   update((event.clientX - bounds.left) / bounds.width * 100);
  }
  input.addEventListener('input', () => update(input.value));
  input.addEventListener('pointerdown', event => {
   if (event.button !== 0 || !event.isPrimary) return;
   event.preventDefault();
   input.focus({preventScroll:true});
   input.setPointerCapture(event.pointerId);
   updatePointer(event);
  });
  input.addEventListener('pointermove', event => {
   if (input.hasPointerCapture(event.pointerId)) updatePointer(event);
  });
  input.addEventListener('pointerup', event => {
   if (input.hasPointerCapture(event.pointerId)) input.releasePointerCapture(event.pointerId);
  });
  figure.querySelectorAll('[data-comparison-value]').forEach(button => {
   button.addEventListener('click', () => update(Number(button.dataset.comparisonValue)));
  });
  update(input.value);
 });
}
