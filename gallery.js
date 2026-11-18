const header = document.querySelector('.header');
const menu = document.querySelector('#mobile-nav');
const menuButton = document.querySelector('.menu-button');
const mobileHeader = matchMedia('(max-width:720px)');
const menuReducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
let menuOpen = false;
let menuAnimation = null;
let headerFrame = 0;
const compare = document.querySelector('.compare');
const handle = document.querySelector('#comparison');
let cut = 50;
let comparisonDrag = null;
let pendingCut = null;
let comparisonFrame = 0;

function showMenu(open) {
  open = open && mobileHeader.matches;
  if (menuOpen === open) return;
  const appearance = getComputedStyle(menu);
  const from = menu.hidden ? {opacity:0,transform:'translateY(-8px)'}
    : {opacity:appearance.opacity,transform:appearance.transform};
  menuAnimation?.cancel();
  menuAnimation = null;
  menuOpen = open;
  header.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  if (!open && (menu.contains(document.activeElement) || (!mobileHeader.matches && document.activeElement === menuButton))) {
    const target = mobileHeader.matches ? menuButton : header.querySelector('.brand');
    target.focus({preventScroll:true});
  }
  menu.inert = !open;
  if (menuReducedMotion.matches || !mobileHeader.matches) {
    menu.hidden = !open;
    return;
  }
  menu.hidden = false;
  const animation = menu.animate([from, {opacity:open ? 1 : 0,transform:open ? 'translateY(0)' : 'translateY(-8px)'}],
    {duration:open ? 240 : 170,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
  menuAnimation = animation;
  animation.finished.then(() => {
    if (menuAnimation !== animation) return;
    menu.hidden = !menuOpen;
    animation.cancel();
    menuAnimation = null;
  }).catch(() => {});
}

function setCut(value) {
  cut = Math.min(100, Math.max(0, value));
  const percent = Math.round(cut);
  compare.style.setProperty('--cut', cut.toFixed(3) + '%');
  compare.querySelector('.old').hidden = percent < 4;
  compare.querySelector('.new').hidden = percent > 96;
  handle.setAttribute('aria-valuenow', String(percent));
  handle.setAttribute('aria-valuetext', percent.toLocaleString('fa-IR') + ' درصد قبل از تعویض');
}
function drawCut() {
  comparisonFrame = 0;
  if (pendingCut === null) return;
  setCut(pendingCut);
  pendingCut = null;
}
handle.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  comparisonDrag = {id: event.pointerId, x: event.clientX, cut, width: compare.getBoundingClientRect().width};
  handle.setPointerCapture(event.pointerId);
  compare.classList.add('is-dragging');
});
function moveComparison(event) {
  if (!comparisonDrag || event.pointerId !== comparisonDrag.id) return;
  pendingCut = comparisonDrag.cut + (event.clientX - comparisonDrag.x) / comparisonDrag.width * 100;
  if (!comparisonFrame) comparisonFrame = requestAnimationFrame(drawCut);
}
function finishComparison(event) {
  if (!comparisonDrag || event.pointerId !== comparisonDrag.id) return;
  if (event.type === 'pointerup') moveComparison(event);
  cancelAnimationFrame(comparisonFrame);
  drawCut();
  comparisonDrag = null;
  compare.classList.remove('is-dragging');
  if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
}
handle.addEventListener('pointermove', moveComparison);
handle.addEventListener('pointerup', finishComparison);
handle.addEventListener('pointercancel', finishComparison);
handle.addEventListener('lostpointercapture', finishComparison);
handle.addEventListener('keydown', event => {
  const value = Number(handle.getAttribute('aria-valuenow'));
  const steps = {ArrowRight:value+1, ArrowLeft:value-1, ArrowUp:value+1, ArrowDown:value-1,
    PageUp:value+10, PageDown:value-10, Home:0, End:100};
  if (Object.hasOwn(steps, event.key)) {
    event.preventDefault();
    setCut(steps[event.key]);
  }
});

header.addEventListener('click', event => { if (event.target.closest('a')) showMenu(false); });
menuButton.addEventListener('click', () => showMenu(!menuOpen));
document.addEventListener('pointerdown', event => { if (!header.contains(event.target)) showMenu(false); });
document.addEventListener('focusin', event => { if (!header.contains(event.target)) showMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuOpen) {
    event.preventDefault();
    showMenu(false);
    menuButton.focus({preventScroll:true});
  }
});
mobileHeader.addEventListener('change', () => showMenu(false));
menuReducedMotion.addEventListener('change', () => {
  if (!menuReducedMotion.matches) return;
  menuAnimation?.cancel();
  menuAnimation = null;
  menu.hidden = !menuOpen;
});
function dockHeader() {
  headerFrame = 0;
  if (scrollY > 40) header.classList.add('docked');
  else if (scrollY < 12) header.classList.remove('docked');
}
window.addEventListener('scroll', () => {
  if (!headerFrame) headerFrame = requestAnimationFrame(dockHeader);
}, {passive:true});

setCut(50);
dockHeader();
