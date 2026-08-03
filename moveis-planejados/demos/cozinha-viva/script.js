/* Cozinha Viva — comportamentos da página.
   O listener de erro de imagem (placeholder) mora no <head>:
   precisa estar registrado antes de qualquer <img> falhar. */
(function () {
  'use strict';

  /* topo ganha fundo ao rolar */
  var topo = document.querySelector('.topo');
  var marcaRolagem = function () {
    topo.classList.toggle('rolou', window.scrollY > 24);
  };
  marcaRolagem();
  window.addEventListener('scroll', marcaRolagem, { passive: true });

  /* menu do celular */
  var abre = document.querySelector('.abre-menu');
  var menu = document.querySelector('.menu');
  abre.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    abre.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('aberto');
      abre.setAttribute('aria-expanded', 'false');
    }
  });

  /* entrada ao rolar */
  var alvos = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    alvos.forEach(function (el) { el.classList.add('on'); });
    return;
  }
  var obs = new IntersectionObserver(function (linhas) {
    linhas.forEach(function (l) {
      if (!l.isIntersecting) return;
      l.target.classList.add('on');
      obs.unobserve(l.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  alvos.forEach(function (el, i) {
    el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
    obs.observe(el);
  });
})();
