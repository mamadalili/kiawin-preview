{
  const gallery = document.querySelector('#gallery');
  document.documentElement.classList.add('story-preview');

  const hero = document.querySelector('.video-hero');
  const canvas = gallery.querySelector('.walk-screen');
  const chapters = [...gallery.querySelectorAll('.walk-notes article')];
  const angles = [...gallery.querySelectorAll('.walk-angles a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 760px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  let queued = false;
  let active = -1;

  function readingCenter(bounds) {
    const photoOffset = narrow.matches ? canvas.offsetHeight * .5 : 0;
    return bounds.top + bounds.height * .5 + photoOffset;
  }

  function draw() {
    queued = false;
    if (reduced.matches) return;
    const heroProgress = clamp(scrollY / Math.max(1, hero.offsetHeight));
    hero.style.setProperty('--hero-scale', String(1 + heroProgress * .065));
    hero.style.setProperty('--hero-drift', (heroProgress * 1.8) + '%');
    const first = chapters[0].getBoundingClientRect();
    const second = chapters[1].getBoundingClientRect();
    const focusLine = innerHeight * (narrow.matches ? .78 : .56);
    const position = clamp((focusLine - readingCenter(first)) / (second.top - first.top));
    const fraction = clamp((position - .14) / .72);
    const dissolve = fraction * fraction * (3 - 2 * fraction);
    canvas.style.setProperty('--dissolve', String(dissolve));
    canvas.style.setProperty('--entry-scale', String(1 + position * .045));
    canvas.style.setProperty('--court-scale', String(1.045 - dissolve * .045));
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
  for (const link of angles) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const chapter = document.querySelector(link.hash);
      const bounds = chapter.getBoundingClientRect();
      const center = innerHeight * (narrow.matches ? .78 : .56);
      window.scrollTo({top: scrollY + readingCenter(bounds) - center, behavior: reduced.matches ? 'instant' : 'smooth'});
    });
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  document.fonts.ready.then(schedule);
  schedule();
}
