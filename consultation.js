const consultation = document.querySelector('#consultation');
const consultTitle = document.querySelector('#consult-title');
const consultContext = document.querySelector('#consult-context');
const consultEmail = document.querySelector('#consult-email');
const consultMotion = matchMedia('(prefers-reduced-motion:reduce)');
let returnFocus;
let consultAnimation = null;
let closingConsultation = false;
let backdropPress = false;

function finishClosingConsultation() {
  consultAnimation?.cancel();
  consultAnimation = null;
  closingConsultation = false;
  backdropPress = false;
  consultation.close();
}

function closeConsultation() {
  if (!consultation.open || closingConsultation) return;
  closingConsultation = true;
  const appearance = getComputedStyle(consultation);
  const from = {opacity:appearance.opacity,transform:appearance.transform};
  consultAnimation?.cancel();
  if (consultMotion.matches) {
    finishClosingConsultation();
    return;
  }
  consultAnimation = consultation.animate([from,{opacity:0,transform:'translateY(12px)'}],
    {duration:160,easing:'ease-in',fill:'forwards'});
  consultAnimation.finished.then(finishClosingConsultation).catch(() => {});
}

function outsideConsultation(event) {
  const bounds = consultation.getBoundingClientRect();
  return event.target === consultation && (event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom);
}

for (const link of document.querySelectorAll('[data-enquiry]')) {
  link.addEventListener('click', event => {
    if (!consultation.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    returnFocus = link;
    const type = link.dataset.enquiry;
    let title = 'تماس با کیاوین';
    let text = 'برای مشاوره دربارهٔ محصولات، با دفتر کیاوین تماس بگیرید یا ایمیل بنویسید.';
    let email = 'mailto:info@kiawinco.com';
    if (type === 'window') {
      title = 'استعلام پنجرهٔ انتخابی';
      const finish = document.querySelector('[data-finish][aria-pressed=true]').textContent.trim();
      const sash = document.querySelector('button[data-opening][aria-pressed=true]').textContent.trim();
      text = 'پنجرهٔ آلومینیومی ترمال‌بریک با فریم ' + finish + ' و بازشوی ' + sash;
      email = link.href;
    } else if (type === 'visit') {
      title = 'درخواست بازدید';
      text = 'برای هماهنگی بازدید و اندازه‌گیری پنجره‌های خانه، با دفتر کیاوین در ارتباط باشید.';
      email += '?subject=' + encodeURIComponent('درخواست بازدید برای تعویض پنجره');
    }
    consultTitle.textContent = title;
    consultContext.textContent = text;
    consultEmail.href = email;
    consultation.showModal();
    consultation.querySelector('.consult-body').scrollTop = 0;
    if (!consultMotion.matches) {
      consultAnimation = consultation.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:240,easing:'cubic-bezier(.2,.7,.2,1)'});
    }
  });
}
consultation.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  closeConsultation();
});
consultation.addEventListener('cancel', event => {
  event.preventDefault();
  closeConsultation();
});
consultation.addEventListener('pointerdown', event => { backdropPress = outsideConsultation(event); });
consultation.addEventListener('pointercancel', () => { backdropPress = false; });
consultation.addEventListener('click', event => {
  if (backdropPress && outsideConsultation(event)) closeConsultation();
  backdropPress = false;
});
consultation.addEventListener('close', () => {
  if (consultation.open) return;
  consultAnimation?.cancel();
  consultAnimation = null;
  closingConsultation = false;
  backdropPress = false;
  returnFocus?.focus({preventScroll:true});
});
consultMotion.addEventListener('change', () => {
  if (!consultMotion.matches) return;
  consultAnimation?.cancel();
  if (closingConsultation) finishClosingConsultation();
});
