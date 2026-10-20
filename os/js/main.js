(function () {
  var cfg = window.OS || {};

  function wa(msg) {
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  // WhatsApp com mensagem por origem do clique
  var flutuante = document.getElementById('wa-flutuante');
  flutuante.href = wa(cfg.mensagens.flutuante);
  document.getElementById('wa-rodape').href = wa(cfg.mensagens.rodape);
  [flutuante, document.getElementById('wa-rodape')].forEach(function (a) {
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Botão flutuante só depois da primeira tela
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (e) {
      flutuante.classList.toggle('visivel', !e[0].isIntersecting);
    }).observe(hero);
  } else {
    flutuante.classList.add('visivel');
  }

  // Checkout
  var checkout = document.getElementById('btn-checkout');
  if (cfg.checkoutUrl) {
    checkout.href = cfg.checkoutUrl;
  } else {
    checkout.addEventListener('click', function (ev) {
      ev.preventDefault();
      alert('Prévia: o link do checkout ainda não foi configurado (js/config.js).');
    });
  }

  // Entrada suave das seções
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduzir && 'IntersectionObserver' in window) {
    var alvos = document.querySelectorAll('.secao h2, .passos li, .cmds article, .card-claro, .oferta');
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('entrou');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    alvos.forEach(function (el) {
      el.classList.add('entra');
      io.observe(el);
    });
  }
})();
