{
  const gallery = document.querySelector('#gallery');
  document.documentElement.classList.add('story-preview');

  const hero = document.querySelector('.video-hero');
  const walk = gallery.querySelector('.walk');
  const film = gallery.querySelector('.walk-film');
  const canvas = gallery.querySelector('.walk-screen');
  const chapters = [...gallery.querySelectorAll('.walk-notes article')];
  const angles = [...gallery.querySelectorAll('.walk-angles a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 760px)');
  const short = matchMedia('(max-height: 480px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  let queued = false;
  let active = -1;
  let geometry;
  let measureNeeded = true;

  function measure() {
    const viewport = document.documentElement.clientHeight;
    const filmTop = parseFloat(getComputedStyle(film).top);
    const photoBottom = filmTop + canvas.offsetHeight;
    const focusLine = narrow.matches ? photoBottom + (viewport - photoBottom) * .5 : viewport * .56;
    const start = walk.getBoundingClientRect().top + scrollY - filmTop;
    const anchors = chapters.map(chapter => {
      const first = chapter.querySelector('.walk-place').getBoundingClientRect();
      const last = chapter.lastElementChild.getBoundingClientRect();
      return Math.max(start, scrollY + (first.top + last.bottom) * .5 - focusLine);
    });
    geometry = {anchors, heroHeight: Math.max(1, hero.offsetHeight)};
    measureNeeded = false;
  }

  function draw() {
    queued = false;
    if (reduced.matches || short.matches) return;
    if (measureNeeded) measure();
    const heroProgress = clamp(scrollY / geometry.heroHeight);
    if (!narrow.matches) {
      hero.style.setProperty('--hero-scale', String(1 + heroProgress * .065));
      hero.style.setProperty('--hero-drift', (heroProgress * 1.8) + '%');
    }
    const [first, second] = geometry.anchors;
    const position = clamp((scrollY - first) / Math.max(1, second - first));
    const fraction = clamp((position - .14) / .72);
    const dissolve = fraction * fraction * (3 - 2 * fraction);
    canvas.style.setProperty('--dissolve', String(dissolve));
    const zoom = narrow.matches ? .025 : .045;
    canvas.style.setProperty('--entry-scale', String(1 + position * zoom));
    canvas.style.setProperty('--court-scale', String(1 + (1 - dissolve) * zoom));
    const next = dissolve >= .5 ? 1 : 0;
    if (next !== active) {
      angles.forEach((link, i) => {
        if (i === next) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      active = next;
    }
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(draw); }
  }
  function updateGeometry() {
    measureNeeded = true;
    schedule();
  }
  for (const link of angles) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reduced.matches || short.matches) return;
      event.preventDefault();
      if (measureNeeded) measure();
      window.scrollTo({top: geometry.anchors[angles.indexOf(link)], behavior: 'smooth'});
    });
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', updateGeometry);
  reduced.addEventListener('change', updateGeometry);
  short.addEventListener('change', updateGeometry);
  const layoutObserver = new ResizeObserver(updateGeometry);
  for (const element of [document.body, hero, walk, film]) layoutObserver.observe(element);
  document.fonts.ready.then(updateGeometry);
  schedule();
}
