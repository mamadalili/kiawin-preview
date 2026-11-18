const workshop = document.querySelector('#workshop');
const windowScene = workshop.querySelector('#window-scene');
const operateWindow = workshop.querySelector('#operate-window');
const enquiryLink = workshop.querySelector('#ask-workshop');
const finishes = {
  graphite: {name: 'گرافیت', color: '#343332'},
  silver: {name: 'نقره‌ای', color: '#c0c0b9'},
  bronze: {name: 'برنز', color: '#866649'}
};
const openings = {hinged: 'لولایی', sliding: 'کشویی'};
const descriptions = {
  glass: 'دو جدارهٔ شیشه با فاصله از هم در قاب می‌نشینند. فضای بستهٔ بین آن‌ها به کاهش انتقال گرما کمک می‌کند.',
  frame: 'دیواره‌های آلومینیومی شکل قاب را نگه می‌دارند. لبه‌های مقطع محل نشستن شیشه و نوارهای آب‌بندی را مشخص می‌کنند.',
  break: 'تیغهٔ پلی‌آمید میان دو بخش آلومینیومی قرار می‌گیرد. این جداسازی مسیر مستقیم انتقال گرما از فلز را قطع می‌کند.'
};
let finish = 'graphite';
let opening = 'hinged';
const sash = workshop.querySelector('.moving-sash');
let operation = 0;

function markSelected(attribute, value) {
  for (const button of workshop.querySelectorAll('button[data-' + attribute + ']')) {
    button.setAttribute('aria-pressed', String(button.dataset[attribute] === value));
  }
}

function updateEnquiry() {
  const subject = 'استعلام پنجرهٔ آلومینیومی ترمال‌بریک';
  const body = 'سلام، برای پنجرهٔ آلومینیومی ترمال‌بریک با فریم ' + finishes[finish].name
    + ' و بازشوی ' + openings[opening] + ' درخواست مشاوره و استعلام دارم.';
  enquiryLink.href = 'mailto:info@kiawinco.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}

function setOpen(open) {
  windowScene.dataset.open = String(open);
  operateWindow.setAttribute('aria-pressed', String(open));
  operateWindow.textContent = open ? 'بستن پنجره' : 'باز کردن پنجره';
}

for (const button of workshop.querySelectorAll('button[data-mode]')) {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode;
    markSelected('mode', mode);
    for (const name of ['window', 'section']) {
      workshop.querySelector('#' + name + '-scene').hidden = name !== mode;
      workshop.querySelector('#' + name + '-controls').hidden = name !== mode;
    }
  });
}
for (const button of workshop.querySelectorAll('button[data-finish]')) {
  button.addEventListener('click', () => {
    finish = button.dataset.finish;
    markSelected('finish', finish);
    windowScene.style.setProperty('--metal', finishes[finish].color);
    updateEnquiry();
  });
}
for (const button of workshop.querySelectorAll('button[data-opening]')) {
  button.addEventListener('click', async () => {
    const request = ++operation;
    opening = button.dataset.opening;
    markSelected('opening', opening);
    updateEnquiry();
    if (windowScene.dataset.opening !== opening) {
      setOpen(false);
      // A sash changes its mechanism only once it is back inside the frame.
      await Promise.allSettled(sash.getAnimations().map(animation => animation.finished));
      if (request !== operation) return;
    }
    windowScene.dataset.opening = opening;
    setOpen(true);
  });
}
for (const button of workshop.querySelectorAll('button[data-part]')) {
  button.addEventListener('click', () => {
    const part = button.dataset.part;
    markSelected('part', part);
    workshop.querySelector('.part-detail').dataset.detail = part;
    workshop.querySelector('#part-description').textContent = descriptions[part];
  });
}
operateWindow.addEventListener('click', () => {
  ++operation;
  windowScene.dataset.opening = opening;
  setOpen(windowScene.dataset.open !== 'true');
});
updateEnquiry();
