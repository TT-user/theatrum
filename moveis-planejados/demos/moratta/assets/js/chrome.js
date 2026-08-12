/* MORATTÁ — utilitários de navegação.
   Marca automaticamente o link da página atual e preenche [data-year],
   para que as cinco páginas não precisem de ajuste manual no menu. */
(function () {
  'use strict';

  var here = location.pathname.split('/').pop() || 'index.html';

  var mapa = {
    'colecao-cozinhas.html': 'colecao.html'  /* categoria acende "Ambientes" */
  };
  var alvo = mapa[here] || here;

  document.querySelectorAll('.nav__link').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('#')[0];
    if (href && href === alvo) a.setAttribute('aria-current', 'page');
  });

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
