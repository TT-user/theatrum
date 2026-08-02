// Icons (Lucide)
if (window.lucide) lucide.createIcons();
window.addEventListener('load', () => { if (window.lucide) lucide.createIcons(); });

// Reveal on scroll
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

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  question.addEventListener('click', () => {
    const isOpen = question.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach((q) => {
      q.setAttribute('aria-expanded', 'false');
      q.nextElementSibling.style.maxHeight = null;
    });

    if (!isOpen) {
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// Active nav link based on visible section
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

// ===== Bilingual toggle (EN default, PT via flag toggle — session only, no localStorage) =====
const WHATSAPP_NUMBER = '19735550142';
const WA_TEXT = {
  en: "Hi Camila! I'd like to book a consultation.",
  pt: 'Olá, Camila! Quero agendar uma consulta.'
};
const PAGE_META = {
  en: {
    title: document.title,
    desc: document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : ''
  },
  pt: {
    title: document.body.dataset.titlePt || document.title,
    desc: document.body.dataset.descPt || ''
  }
};

const translatableEls = document.querySelectorAll('[data-pt]');
translatableEls.forEach((el) => { el.dataset.en = el.innerHTML; });

const waLinks = document.querySelectorAll('.js-whatsapp');

function applyLang(lang) {
  translatableEls.forEach((el) => { el.innerHTML = el.dataset[lang]; });

  waLinks.forEach((link) => {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_TEXT[lang])}`;
  });

  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.title = PAGE_META[lang].title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && PAGE_META[lang].desc) metaDesc.setAttribute('content', PAGE_META[lang].desc);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('.faq-answer').forEach((answer) => {
    const question = answer.previousElementSibling;
    if (question && question.getAttribute('aria-expanded') === 'true') {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
}

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

waLinks.forEach((link) => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_TEXT.en)}`;
});
