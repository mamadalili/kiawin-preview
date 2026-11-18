const header = document.querySelector('.header');
const menu = document.querySelector('#mobile-nav');
const menuButton = document.querySelector('.menu-button');
const compare = document.querySelector('.compare');
const handle = document.querySelector('#comparison');
let cut = 50;
let comparisonDrag = null;
let pendingCut = null;
let comparisonFrame = 0;

function showMenu(open) {
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
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

menu.addEventListener('click', event => { if (event.target.closest('a')) showMenu(false); });
menuButton.addEventListener('click', () => showMenu(menu.hidden));
document.addEventListener('click', event => { if (!header.contains(event.target)) showMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { showMenu(false); menuButton.focus(); }
});
matchMedia('(max-width:720px)').addEventListener('change', () => showMenu(false));
function dockHeader() { header.classList.toggle('docked', window.scrollY > 24); }
window.addEventListener('scroll', dockHeader, {passive:true});

setCut(50);
dockHeader();
