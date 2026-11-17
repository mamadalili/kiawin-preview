const header = document.querySelector('.header');
const menu = document.querySelector('#mobile-nav');
const menuButton = document.querySelector('.menu-button');
const compare = document.querySelector('.compare');
const handle = document.querySelector('#comparison');

function showMenu(open) {
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
}

function setCut(value) {
  const percent = Math.round(Math.min(100, Math.max(0, value)));
  compare.style.setProperty('--cut', percent + '%');
  compare.querySelector('.old').hidden = percent < 4;
  compare.querySelector('.new').hidden = percent > 96;
  handle.setAttribute('aria-valuenow', String(percent));
  handle.setAttribute('aria-valuetext', percent.toLocaleString('fa-IR') + ' درصد قبل از تعویض');
}
handle.addEventListener('pointerdown', event => {
  if (event.isPrimary && event.button === 0) handle.setPointerCapture(event.pointerId);
});
handle.addEventListener('pointermove', event => {
  if (!handle.hasPointerCapture(event.pointerId)) return;
  const bounds = compare.getBoundingClientRect();
  setCut((event.clientX - bounds.left) / bounds.width * 100);
});
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
