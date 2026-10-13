/* Clã Valente: demonstração da Theatrum (negócio fictício) */
(function () {
  // Demonstração: sem número. O _demo.js da pasta neutraliza todo link de WhatsApp.
  var ZAP = '';
  function zap(msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); }
  window.Valente = { zap: zap };

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

  // Serra: névoa só anda à vista; camadas com parallax leve na rolagem
  var serraTopo = document.getElementById('serra-topo');
  if (serraTopo) {
    var camadas = [].slice.call(serraTopo.querySelectorAll('.serra-topo__c'));
    var fator = [26, 12, 0], serraVisivel = false, pedido = false;
    function parallax() {
      pedido = false;
      var r = serraTopo.getBoundingClientRect();
      var p = (r.top + r.height / 2) / innerHeight - .5; // -0.5 a 0.5 enquanto atravessa a tela
      camadas.forEach(function (c, i) { c.style.transform = 'translate3d(0,' + (p * fator[i]).toFixed(1) + 'px,0)'; });
    }
    new IntersectionObserver(function (e) {
      serraVisivel = e[0].isIntersecting;
      serraTopo.classList.toggle('anda', serraVisivel && !semMovimento);
    }).observe(serraTopo);
    if (!semMovimento) addEventListener('scroll', function () {
      if (serraVisivel && !pedido) { pedido = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  }

  // Brasas verdes subindo nas seções de fundo preto; cada grupo para fora da tela
  if (!semMovimento) {
    var brasaVista = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('anda', e.isIntersecting); });
    });
    document.querySelectorAll('.brasas').forEach(function (grupo) {
      var html = '';
      for (var b = 0; b < 22; b++) {
        var s = (2 + Math.random() * 3).toFixed(1);
        html += '<span class="brasa" style="--x:' + (Math.random() * 100).toFixed(1) + '%;--s:' + s + 'px;--t:' + (7 + Math.random() * 7).toFixed(1) + 's;--d:-' + (Math.random() * 14).toFixed(1) + 's;--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px"></span>';
      }
      grupo.innerHTML = html;
      var mede = function () { grupo.style.setProperty('--h', grupo.offsetHeight + 'px'); };
      mede(); addEventListener('resize', mede);
      brasaVista.observe(grupo);
    });
  }

  var ph = function (t) { return '<span class="ph">' + t + '</span>'; };

  // ---------- Contador ----------
  fetch('data/config.json?v=2').then(function (r) { return r.json(); }).then(function (c) {
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
      ? '<img src="' + r.arquivo + '" alt="Antes e depois de ' + (r.genero === 'f' ? 'uma aluna' : 'um aluno') + ' do Clã Valente, ' + CAT[r.categoria].toLowerCase() + '" width="281" height="350" loading="lazy" decoding="async">'
      : '<div class="carta__vazia"><span class="carta__ad">Antes <i></i> Depois</span>' + ph('[arte autorizada para o site]') + '</div>';
    return '<article class="carta" data-cat="' + r.categoria + '" data-gen="' + r.genero + '">' +
      '<div class="carta__moldura">' +
        '<svg class="carta__canto carta__canto--a"><use href="#emblema"/></svg>' +
        '<svg class="carta__canto carta__canto--b"><use href="#emblema"/></svg>' +
        '<span class="runas runas--lado carta__runas carta__runas--e" data-runas="CLA VALENTE"></span>' +
        '<span class="runas runas--lado carta__runas carta__runas--d" data-runas="CLA VALENTE"></span>' +
        '<p class="carta__cat">' + CAT[r.categoria] + '</p>' +
        '<div class="carta__arte">' + arte + '</div>' +
        '<h3 class="carta__nome">' + (r.nome || ph('[INICIAIS]')) + '</h3>' +
        (r.legenda === '' ? '' : '<p class="carta__leg">' + (r.legenda || ph('[-__ kg em __ meses]')) + '</p>') +
      '</div>' +
      '<a class="carta__cta" href="#aplicacao" data-objetivo="' + r.categoria + '">Quero um resultado assim</a>' +
    '</article>';
  }

  // Carrossel: uma carta por vez no centro, as vizinhas inclinadas dos lados
  var vis = [], atual = 0, timer = null, pausa = false, aVista = false, PASSA = 3200;
  var contagem = document.getElementById('res-cont');
  var largo = matchMedia('(min-width: 980px)');
  largo.addEventListener('change', function () { arruma(); });

  function arruma() {
    var n = vis.length;
    cartas.forEach(function (c) { if (c.hidden) c.style.cssText = ''; });
    vis.forEach(function (c, i) {
      var o = i - atual;
      if (o > n / 2) o -= n; else if (o < -n / 2) o += n; // dá a volta
      var a = Math.abs(o);
      c.style.setProperty('--o', o);
      c.style.setProperty('--a', Math.min(a, 3));
      c.style.zIndex = 20 - a;
      c.classList.toggle('ativa', o === 0);
      c.classList.toggle('longe', a > (largo.matches ? 3 : 2));
      c.setAttribute('aria-hidden', o !== 0);
      c.querySelectorAll('a').forEach(function (l) { l.tabIndex = o === 0 ? 0 : -1; });
    });
    if (contagem) contagem.textContent = n ? (atual + 1) + ' / ' + n : '';
  }
  function vai(d) { if (!vis.length) return; atual = (atual + d + vis.length) % vis.length; arruma(); }
  function roda() {
    clearInterval(timer); timer = null;
    if (semMovimento || pausa || !aVista || document.hidden || vis.length < 2) return;
    timer = setInterval(function () { vai(1); }, PASSA);
  }
  function filtra(f) {
    cartas.forEach(function (c) {
      c.hidden = !(f === 'todos' || c.getAttribute('data-cat') === f || c.getAttribute('data-gen') === f);
    });
    vis = cartas.filter(function (c) { return !c.hidden; });
    atual = 0; arruma(); roda();
  }

  fetch('data/resultados.json?v=2').then(function (r) { return r.json(); }).then(function (d) {
    baralho.innerHTML = d.resultados.map(carta).join('');
    cartas = [].slice.call(baralho.querySelectorAll('.carta'));
    if (window.Runas) Runas.todas(baralho);
    filtra('todos');
  }).catch(function () {
    baralho.innerHTML = '<p class="wrap">' + ph('[os resultados entram aqui]') + '</p>';
  });

  // Só passa sozinho à vista, com a aba aberta e sem mouse ou foco em cima
  new IntersectionObserver(function (e) { aVista = e[0].isIntersecting; roda(); }, { threshold: 0.3 }).observe(baralho);
  document.addEventListener('visibilitychange', roda);
  // Para só com o mouse sobre a carta da vez, ou com foco de teclado dentro do carrossel
  baralho.addEventListener('mouseover', function (e) {
    var sobre = !!e.target.closest('.carta.ativa');
    if (sobre !== pausa) { pausa = sobre; roda(); }
  });
  baralho.addEventListener('mouseleave', function () { if (pausa) { pausa = false; roda(); } });
  var palco = document.getElementById('resultados');
  palco.addEventListener('focusin', function (e) {
    if (e.target.matches(':focus-visible') && !e.target.closest('.palco__seta')) { pausa = true; roda(); }
  });
  palco.addEventListener('focusout', function () { pausa = false; roda(); });

  document.getElementById('res-ant').addEventListener('click', function () { vai(-1); roda(); });
  document.getElementById('res-prox').addEventListener('click', function () { vai(1); roda(); });
  // Arraste com o dedo ou o mouse: as cartas acompanham e encaixam na mais próxima
  var x0 = null, dx = 0, arrastou = false;
  function passoPx() {
    var larg = vis.length ? vis[atual].offsetWidth : 270;
    return largo.matches ? (innerWidth / 2 - larg * .25) / 3 : larg * .58;
  }
  baralho.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.target.closest('a')) return;
    x0 = e.clientX; dx = 0; arrastou = false;
    baralho.setPointerCapture(e.pointerId);
  });
  baralho.addEventListener('pointermove', function (e) {
    if (x0 === null) return;
    dx = e.clientX - x0;
    if (!arrastou && Math.abs(dx) > 6) { arrastou = true; baralho.classList.add('arrastando'); clearInterval(timer); }
    if (arrastou) baralho.style.setProperty('--d', (dx / passoPx()).toFixed(3));
  });
  function solta() {
    if (x0 === null) return;
    x0 = null; baralho.classList.remove('arrastando'); baralho.style.setProperty('--d', 0);
    if (arrastou) { var n = Math.round(-dx / passoPx()) || (Math.abs(dx) > 40 ? (dx < 0 ? 1 : -1) : 0); if (n) vai(n); }
    roda();
  }
  baralho.addEventListener('pointerup', solta);
  baralho.addEventListener('pointercancel', solta);
  baralho.addEventListener('click', function (e) {
    if (arrastou) { e.preventDefault(); arrastou = false; return; }
    var c = e.target.closest('.carta');
    if (!c || c.classList.contains('ativa')) return;
    e.preventDefault(); atual = vis.indexOf(c); arruma(); roda();
  });
  baralho.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { vai(1); roda(); }
    if (e.key === 'ArrowLeft') { vai(-1); roda(); }
  });

  document.getElementById('filtros').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    this.querySelectorAll('.chip').forEach(function (c) {
      var on = c === b; c.classList.toggle('ativo', on); c.setAttribute('aria-pressed', on);
    });
    filtra(b.getAttribute('data-filtro'));
  });

  // "Quero um resultado assim" e os cards de plano pré-preenchem a aplicação
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-objetivo],[data-plano]');
    if (!a || !window.Aplicacao) return;
    Aplicacao.preseleciona({ objetivo: a.getAttribute('data-objetivo'), plano: a.getAttribute('data-plano') });
  });
})();
