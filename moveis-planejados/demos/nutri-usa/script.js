document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
  }

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.btn)').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  if (banner) {
    if (!localStorage.getItem('cookieConsent')) {
      banner.hidden = false;
      setTimeout(() => banner.classList.add('visible'), 300);
    }
    const dismiss = (value) => {
      localStorage.setItem('cookieConsent', value);
      banner.classList.remove('visible');
      banner.addEventListener('transitionend', () => { banner.hidden = true; }, { once: true });
    };
    acceptBtn.addEventListener('click', () => dismiss('accepted'));
    declineBtn.addEventListener('click', () => dismiss('declined'));
  }
});
