const consultation = document.querySelector('#consultation');
const consultTitle = document.querySelector('#consult-title');
const consultContext = document.querySelector('#consult-context');
const consultEmail = document.querySelector('#consult-email');
let returnFocus;

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
  });
}
consultation.addEventListener('click', event => {
  const bounds = consultation.getBoundingClientRect();
  if (event.target === consultation && (event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom)) consultation.close();
});
consultation.addEventListener('close', () => returnFocus?.focus({preventScroll:true}));
