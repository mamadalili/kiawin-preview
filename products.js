const categoryButtons = [...document.querySelectorAll('[data-category]')];
const productHeading = document.querySelector('#product-heading');
const productStatus = document.querySelector('#product-status');
const catalogMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const button of categoryButtons) {
  button.addEventListener('click', () => {
    const previous = categoryButtons.findIndex(option => option.getAttribute('aria-pressed') === 'true');
    const next = categoryButtons.indexOf(button);
    if (previous === next) return;
    for (const option of categoryButtons) {
      const active = option === button;
      option.setAttribute('aria-pressed', String(active));
      const panel = document.getElementById(option.getAttribute('aria-controls'));
      panel.hidden = !active;
      if (active) {
        panel.scrollLeft = 0;
        if (!catalogMotion.matches) {
          const offset = next > previous ? -14 : 14;
          panel.animate([{transform: 'translateX(' + offset + 'px)', opacity: .78},
            {transform: 'translateX(0)', opacity: 1}], {duration: 190, easing: 'ease-out'});
        }
      }
    }
    productHeading.textContent = 'محصولات ' + button.textContent.trim();
    productStatus.textContent = productHeading.textContent + ' نمایش داده شد.';
  });
}

for (const track of document.querySelectorAll('.product-track')) {
  let drag = null;
  let suppressClick = false;

  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || track.scrollWidth <= track.clientWidth) return;
    drag = {x: event.clientX, left: track.scrollLeft, id: event.pointerId};
  });
  track.addEventListener('pointermove', event => {
    if (!drag || !event.buttons || event.pointerId !== drag.id) return;
    const delta = event.clientX - drag.x;
    if (!track.classList.contains('dragging') && Math.abs(delta) < 6) return;
    track.classList.add('dragging');
    track.setPointerCapture(event.pointerId);
    track.scrollLeft = drag.left - delta;
  });
  function finishDrag() {
    drag = null;
    if (!track.classList.contains('dragging')) return;
    suppressClick = true;
    track.classList.remove('dragging');
    setTimeout(() => { suppressClick = false; }, 0);
  }
  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('lostpointercapture', finishDrag);
  track.addEventListener('pointerleave', () => { if (!track.classList.contains('dragging')) drag = null; });
  track.addEventListener('click', event => { if (suppressClick) event.preventDefault(); }, true);
  track.addEventListener('dragstart', event => event.preventDefault());
}
