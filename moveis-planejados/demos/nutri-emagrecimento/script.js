// Ícones (Lucide)
if (window.lucide) lucide.createIcons();
window.addEventListener('load', () => { if (window.lucide) lucide.createIcons(); });

// Reveal ao rolar
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// Acordeão FAQ
document.querySelectorAll('.faq-item').forEach((item) => {
  const pergunta = item.querySelector('.faq-pergunta');
  const resposta = item.querySelector('.faq-resposta');

  pergunta.addEventListener('click', () => {
    const isOpen = pergunta.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-pergunta').forEach((p) => {
      p.setAttribute('aria-expanded', 'false');
      p.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      pergunta.setAttribute('aria-expanded', 'true');
      resposta.style.maxHeight = resposta.scrollHeight + 'px';
    }
  });
});

// Menu ativo conforme a seção visível
const navLinks = document.querySelectorAll('.main-nav a');
const sections = document.querySelectorAll('main section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.remove('active'));
      const activeLink = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));
