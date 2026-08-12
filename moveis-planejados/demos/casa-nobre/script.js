/* Casa Nobre — comportamentos da página.
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

/* Filme do hero. Entra depois da foto, nunca antes dela. */
(function () {
  'use strict';
  var caixa = document.querySelector('.hero-filme');
  if (!caixa || !caixa.dataset.src) return;

  var conexao = navigator.connection || {};
  var economiza = conexao.saveData === true || /(^|-)2g$/.test(conexao.effectiveType || '');
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (economiza || menosMovimento || window.innerWidth < 760) return;

  function entra() {
    setTimeout(function () {
      var v = document.createElement('video');
      v.muted = true;
      v.loop = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('aria-hidden', 'true');
      v.preload = 'auto';
      /* canplaythrough e o evento que mais falha em Safari e em conexao
         instavel. Escuto os tres que significam 'ja da para mostrar' e
         ainda confiro uma vez por segurança, senao o hero ficaria preso
         na foto sem ninguem perceber. */
      function mostra() {
        if (v.classList.contains('pronto')) return;
        v.classList.add('pronto');
        document.querySelector('.hero').classList.add('com-filme');
      }
      v.addEventListener('loadeddata', mostra);
      v.addEventListener('canplay', mostra);
      v.addEventListener('playing', mostra);
      setTimeout(function () { if (v.readyState >= 2) mostra(); }, 4000);
      v.src = caixa.dataset.src;
      caixa.appendChild(v);
      var toca = v.play();
      if (toca && toca.catch) toca.catch(function () {});
    }, 500);
  }

  if (document.readyState === 'complete') entra();
  else window.addEventListener('load', entra);
})();
