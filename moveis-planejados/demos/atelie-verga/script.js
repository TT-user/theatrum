/* Ateliê Verga — comportamentos da página.
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

/* Filme do hero. Entra depois da foto, nunca antes dela.
   Sao cinco clipes de ambientes diferentes que tocam em sequencia e
   voltam ao primeiro. Dois <video> alternados fazem a troca por
   crossfade: um toca enquanto o outro ja carregou o proximo. Trocar o
   src de um elemento so pisca preto no meio do hero. Tambem por isso o
   carregamento e sob demanda: so dois clipes na fila, nunca os cinco. */
(function () {
  'use strict';
  var caixa = document.querySelector('.hero-filme');
  if (!caixa || !caixa.dataset.srcs) return;

  var conexao = navigator.connection || {};
  var economiza = conexao.saveData === true || /(^|-)2g$/.test(conexao.effectiveType || '');
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (economiza || menosMovimento || window.innerWidth < 760) return;

  var lista = caixa.dataset.srcs.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!lista.length) return;

  var CRUZA = 0.7; // segundos de sobreposicao, igual a transicao do CSS

  function novoVideo() {
    var v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-hidden', 'true');
    v.preload = 'auto';
    caixa.appendChild(v);
    return v;
  }

  function toca(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  var atual = novoVideo();
  var proximo = novoVideo();
  var i = 0;
  var trocando = false;

  function carrega(v, n) {
    v.src = lista[n % lista.length];
    v.load();
  }

  function troca() {
    if (trocando) return;
    trocando = true;
    i = (i + 1) % lista.length;

    proximo.classList.add('pronto');
    atual.classList.remove('pronto');
    toca(proximo);

    var saindo = atual;
    atual = proximo;
    proximo = saindo;

    setTimeout(function () {
      saindo.pause();
      carrega(saindo, i + 1); // ja deixa o seguinte na agulha
      trocando = false;
    }, CRUZA * 1000);
  }

  /* o 'ended' sozinho deixaria um respiro entre os clipes: a troca
     comeca CRUZA segundos antes do fim, e o 'ended' fica so de rede */
  function vigia() {
    if (!atual.duration || isNaN(atual.duration)) return;
    if (atual.currentTime >= atual.duration - CRUZA) troca();
  }

  [atual, proximo].forEach(function (v) {
    v.addEventListener('timeupdate', vigia);
    v.addEventListener('ended', troca);
  });

  function entra() {
    setTimeout(function () {
      atual.addEventListener('canplay', function () {
        atual.classList.add('pronto');
        document.querySelector('.hero').classList.add('com-filme');
        toca(atual);
        carrega(proximo, 1);
      }, { once: true });
      carrega(atual, 0);
    }, 500);
  }

  if (document.readyState === 'complete') entra();
  else window.addEventListener('load', entra);
})();

/* WhatsApp flutuante: entra quando o hero sai de cena. */
(function () {
  'use strict';
  var wa = document.querySelector('.whatsapp-float');
  if (!wa) return;
  function ver() {
    wa.classList.toggle('on', window.scrollY > window.innerHeight * 0.6);
  }
  ver();
  window.addEventListener('scroll', ver, { passive: true });
  window.addEventListener('resize', ver);
})();
