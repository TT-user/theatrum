/* MORATTÁ — comportamentos do site (sem dependências) */
(function () {
  'use strict';

  /* ---- imagens ausentes viram placeholder com o nome do arquivo ---- */
  function armImages(scope) {
    (scope || document).querySelectorAll('.ph img, .ph video').forEach(function (el) {
      if (el.dataset.armed) return;
      el.dataset.armed = '1';
      el.addEventListener('error', function () { el.remove(); });
      if (el.tagName === 'IMG' && el.complete && el.naturalWidth === 0) el.remove();
    });
  }
  armImages();

  /* ---- menu mobile ---- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.drawer a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    });
  }

  /* ---- slider do hero ---- */
  var hero = document.querySelector('[data-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero__dots button'));
    var i = 0, timer = null, DELAY = 6500;

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dots.forEach(function (d, k) {
        d.classList.toggle('is-on', k === i);
        d.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
    }
    function play() { stop(); timer = setInterval(function () { go(i + 1); }, DELAY); }
    function stop() { if (timer) clearInterval(timer); }

    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); play(); }); });
    var prev = hero.querySelector('.hero__arrow--prev');
    var next = hero.querySelector('.hero__arrow--next');
    if (prev) prev.addEventListener('click', function () { go(i - 1); play(); });
    if (next) next.addEventListener('click', function () { go(i + 1); play(); });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : play();
    });

    /* swipe */
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 46) go(dx < 0 ? i + 1 : i - 1);
      x0 = null; play();
    }, { passive: true });

    go(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) play();
  }

  /* ---- toggle de consentimento ---- */
  document.querySelectorAll('.switch').forEach(function (sw) {
    sw.setAttribute('role', 'switch');
    sw.setAttribute('tabindex', '0');
    sw.setAttribute('aria-checked', 'false');
    function toggle() {
      var on = sw.classList.toggle('is-on');
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
    }
    sw.addEventListener('click', toggle);
    sw.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    });
  });

  /* ---- formulários demonstrativos ---- */
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('[type=submit]');
      if (!btn) return;
      var original = btn.innerHTML;
      btn.innerHTML = 'Enviado ✓';
      setTimeout(function () { btn.innerHTML = original; f.reset(); }, 2600);
    });
  });

  /* ---- reveal on scroll ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- header encolhe ao rolar ---- */
  var header = document.querySelector('.header');
  if (header) {
    var last = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 40 && last <= 40) header.style.boxShadow = '0 1px 0 rgba(255,255,255,.12)';
      if (y <= 40 && last > 40) header.style.boxShadow = 'none';
      last = y;
    }, { passive: true });
  }
})();
