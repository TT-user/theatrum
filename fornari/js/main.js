/* Team Fornari: prévia da Theatrum */
(function () {
  // WhatsApp do Felipe, só dígitos com DDI (ex.: 5532999999999).
  // [PREENCHER] Vazio, o wa.me abre o WhatsApp para a pessoa escolher o contato.
  var ZAP = '';
  function zap(msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); }
  window.Fornari = { zap: zap };

  var semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-zap]').forEach(function (a) {
    a.href = zap(a.getAttribute('data-zap'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  // Topo ganha fundo depois da primeira rolada; botão flutuante só depois do hero
  var topo = document.getElementById('topo');
  var flutua = document.getElementById('zap-flutua');
  var hero = document.getElementById('inicio');
  new IntersectionObserver(function (e) {
    var foraDoHero = !e[0].isIntersecting;
    flutua.classList.toggle('visivel', foraDoHero);
  }, { threshold: 0.15 }).observe(hero);
  var rolou = false;
  addEventListener('scroll', function () {
    var r = scrollY > 40;
    if (r !== rolou) { rolou = r; topo.classList.toggle('rolou', r); }
  }, { passive: true });

  // Entrada suave (fade + leve subida)
  var revela = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visto'); revela.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  function observa(raiz) { (raiz || document).querySelectorAll('.revela:not(.visto)').forEach(function (el) { revela.observe(el); }); }
  observa();

  // Rodapé: quando a serra entra na tela, a pedra estoura e o atleta sobe
  var serra = document.querySelector('.serra');
  new IntersectionObserver(function (e) {
    if (e[0].isIntersecting) serra.classList.add('estoura');
  }, { threshold: 0.35 }).observe(serra);

  var ph = function (t) { return '<span class="ph">' + t + '</span>'; };

  // ---------- Contador ----------
  fetch('data/config.json').then(function (r) { return r.json(); }).then(function (c) {
    var box = document.getElementById('contador');
    box.innerHTML = c.numeros.map(function (n, i) {
      var v = n.valor == null ? ph('[PREENCHER]') : '<b data-alvo="' + n.valor + '">' + (semMovimento ? n.valor.toLocaleString('pt-BR') : '0') + '</b>';
      return '<div class="num"><span class="num__v">' + (n.valor == null ? '' : n.prefixo) + v + (n.valor == null ? '' : n.sufixo) + '</span><span class="num__r">' + n.rotulo + '</span></div>';
    }).join('');
    if (semMovimento) return;
    new IntersectionObserver(function (e, o) {
      if (!e[0].isIntersecting) return;
      o.disconnect();
      box.querySelectorAll('[data-alvo]').forEach(function (b) {
        var alvo = +b.getAttribute('data-alvo'), t0 = performance.now();
        (function passo(t) {
          var k = Math.min(1, (t - t0) / 1400), v = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
          b.textContent = v.toLocaleString('pt-BR');
          if (k < 1) requestAnimationFrame(passo);
        })(t0);
      });
    }, { threshold: 0.5 }).observe(box);
  }).catch(function () {});

  // ---------- Resultados: cartas ----------
  var baralho = document.getElementById('baralho');
  var CAT = { emagrecimento: 'Emagrecimento', massa: 'Ganho de massa' };
  var cartas = [];

  function carta(r) {
    var arte = r.arquivo
      ? '<img src="' + r.arquivo + '" alt="Antes e depois' + (r.nome ? ' de ' + r.nome : '') + '" loading="lazy" decoding="async">'
      : '<div class="carta__vazia"><span class="carta__ad">Antes <i></i> Depois</span>' + ph('[arte autorizada para o site]') + '</div>';
    return '<article class="carta" data-cat="' + r.categoria + '" data-gen="' + r.genero + '">' +
      '<div class="carta__moldura">' +
        '<svg class="carta__canto carta__canto--a"><use href="#emblema"/></svg>' +
        '<svg class="carta__canto carta__canto--b"><use href="#emblema"/></svg>' +
        '<span class="runas runas--lado carta__runas carta__runas--e" data-runas="TEAM FORNARI"></span>' +
        '<span class="runas runas--lado carta__runas carta__runas--d" data-runas="TEAM FORNARI"></span>' +
        '<p class="carta__cat">' + CAT[r.categoria] + '</p>' +
        '<div class="carta__arte">' + arte + '</div>' +
        '<h3 class="carta__nome">' + (r.nome || ph('[INICIAIS]')) + '</h3>' +
        '<p class="carta__leg">' + (r.legenda || ph('[-__ kg em __ meses]')) + '</p>' +
      '</div>' +
      '<a class="carta__cta" href="#aplicacao" data-objetivo="' + r.categoria + '">Quero um resultado assim</a>' +
    '</article>';
  }

  function arruma() {
    // Leque no computador: cada carta visível ganha um ângulo a partir do centro
    var vis = cartas.filter(function (c) { return !c.hidden; });
    var meio = (vis.length - 1) / 2;
    vis.forEach(function (c, i) {
      c.style.setProperty('--giro', ((i - meio) * 5) + 'deg');
      c.style.setProperty('--desce', (Math.abs(i - meio) * 14) + 'px');
      c.style.zIndex = 10 - Math.round(Math.abs(i - meio));
      c.classList.toggle('primeira', i === 0);
    });
  }

  fetch('data/resultados.json').then(function (r) { return r.json(); }).then(function (d) {
    baralho.innerHTML = d.resultados.map(carta).join('');
    cartas = [].slice.call(baralho.querySelectorAll('.carta'));
    if (window.Runas) Runas.todas(baralho);
    arruma();
  }).catch(function () {
    baralho.innerHTML = '<p class="wrap">' + ph('[os resultados entram aqui]') + '</p>';
  });

  document.getElementById('filtros').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    var f = b.getAttribute('data-filtro');
    this.querySelectorAll('.chip').forEach(function (c) {
      var on = c === b; c.classList.toggle('ativo', on); c.setAttribute('aria-pressed', on);
    });
    cartas.forEach(function (c) {
      c.hidden = !(f === 'todos' || c.getAttribute('data-cat') === f || c.getAttribute('data-gen') === f);
    });
    arruma();
    baralho.scrollTo({ left: 0, behavior: semMovimento ? 'auto' : 'smooth' });
  });

  // "Quero um resultado assim" e os cards de plano pré-preenchem a aplicação
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-objetivo],[data-plano]');
    if (!a || !window.Aplicacao) return;
    Aplicacao.preseleciona({ objetivo: a.getAttribute('data-objetivo'), plano: a.getAttribute('data-plano') });
  });
})();
