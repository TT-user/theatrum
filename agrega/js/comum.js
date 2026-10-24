/* Agrega: o que as páginas internas dividem (topo, menu, WhatsApp, mapa, entrada das seções, rodapé). */
(function () {
  'use strict';

  var AG = window.AG = window.AG || {};
  var raiz = document.documentElement;
  var still = /[?&]still=1/.test(location.search);
  var reduz = matchMedia('(prefers-reduced-motion: reduce)');
  AG.still = still;
  AG.calmo = function () { return still || reduz.matches; };
  if (still) raiz.classList.add('still');
  var track = AG.track || function () {};

  /* ---------- utilitários ---------- */
  AG.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  // null vira placeholder amarelo; dentro do texto, cada trecho "[...]" também
  AG.txt = function (v, falta) {
    if (v === null || v === undefined || v === '') return '<span class="ph">' + AG.esc(falta || '[a confirmar]') + '</span>';
    return AG.esc(v).replace(/\[[^\]]*\]/g, function (m) { return '<span class="ph">' + m + '</span>'; });
  };
  AG.valor = function (caminho) {
    return caminho.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, AG);
  };
  AG.numero = function (marca) {
    if (marca === 'completo') return AG.whatsappProjetoCompleto || (AG.marketing && AG.marketing.whatsapp);
    return AG[marca] && AG[marca].whatsapp;
  };
  AG.wa = function (marca, msg) {
    return 'https://wa.me/' + (AG.numero(marca) || '') + (msg ? '?text=' + encodeURIComponent(msg) : '');
  };
  AG.abrirWa = function (marca, msg, evento, dados) {
    track(evento || 'whatsapp_click', Object.assign({ brand: marca }, dados || {}));
    // com 'noopener' o window.open devolve null mesmo quando abre; por isso o opener é cortado à mão
    var w = window.open(AG.wa(marca, msg), '_blank');
    if (w) w.opener = null; else location.href = AG.wa(marca, msg);
  };

  /* ---------- dados do config.js no HTML ---------- */
  document.querySelectorAll('[data-ag]').forEach(function (el) {
    var v = AG.valor(el.dataset.ag);
    if (v === null) { el.className = 'ph'; el.textContent = el.textContent && /^\[/.test(el.textContent) ? el.textContent : '[a confirmar]'; }
    else if (v !== undefined) el.textContent = v;
  });
  // links de WhatsApp: número do config, mensagem do próprio link
  AG.ligarWa = function (raizEl) {
    (raizEl || document).querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = AG.wa(a.dataset.wa, a.dataset.msg);
      a.target = '_blank'; a.rel = 'noopener';
      if (a.dataset.ligado) return;
      a.dataset.ligado = 1;
      a.addEventListener('click', function () {
        track(a.dataset.flutua ? 'whatsapp_float_click' : 'whatsapp_click', { brand: a.dataset.wa });
      });
    });
  };
  AG.ligarWa();

  /* ---------- topo: transparente sobre o hero, sólido depois de 24 px ---------- */
  var topo = document.getElementById('topo');
  var hero = document.getElementById('hero');
  function medeAcima() {
    // padrão 2A: o hero ocupa a primeira tela inteira no computador
    if (hero) raiz.style.setProperty('--acima', Math.round(hero.getBoundingClientRect().top + scrollY) + 'px');
  }
  medeAcima();
  addEventListener('resize', medeAcima);
  addEventListener('load', medeAcima);
  var antes = -1;
  function rolou() {
    var y = scrollY > 24;
    if (y !== antes && topo) { topo.classList.toggle('topo--solido', y || topo.hasAttribute('data-solido')); antes = y; }
  }
  addEventListener('scroll', rolou, { passive: true });
  rolou();

  /* ---------- menu do celular ---------- */
  var botao = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  function fechaMenu() {
    if (!botao) return;
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
    topo.classList.remove('topo--aberto');
    document.body.style.overflow = '';
  }
  if (botao && menu) {
    botao.addEventListener('click', function () {
      var abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      topo.classList.toggle('topo--aberto', abrir);
      document.body.style.overflow = abrir ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && topo.classList.contains('topo--aberto')) { fechaMenu(); botao.focus(); } });
  }

  /* ---------- chave entre as marcas ---------- */
  document.querySelectorAll('[data-troca]').forEach(function (a) {
    a.addEventListener('click', function () {
      track('brand_switch', { from: raiz.dataset.brand, to: a.dataset.troca });
    });
  });

  /* ---------- entrada das seções: uma vez só ---------- */
  var io = 'IntersectionObserver' in window && !still ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  AG.revelar = function (raizEl) {
    (raizEl || document).querySelectorAll('.rev:not(.ok)').forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('ok');
    });
    if (still) (raizEl || document).querySelectorAll('img[loading=lazy]').forEach(function (i) { i.loading = 'eager'; });
  };
  AG.revelar();

  /* ---------- fundos que se mexem só com o hero à vista ---------- */
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { hero.classList.toggle('parado', !es[0].isIntersecting); }).observe(hero);
  }

  /* ---------- WhatsApp flutuante: depois de 30% da página, some no rodapé ---------- */
  var flutua = document.querySelector('.zap-flutua');
  var rodape = document.getElementById('rodape');
  var noRodape = false;
  function mostraFlutua() {
    var max = document.documentElement.scrollHeight - innerHeight;
    flutua.classList.toggle('zap-flutua--on', max > 0 && scrollY / max > .3 && !noRodape);
  }
  if (flutua) {
    if (rodape && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { noRodape = es[0].isIntersecting; mostraFlutua(); }).observe(rodape);
    }
    addEventListener('scroll', mostraFlutua, { passive: true });
    mostraFlutua();
  }

  /* ---------- mapa: o iframe do Google só carrega no clique ---------- */
  document.querySelectorAll('[data-mapa]').forEach(function (box) {
    var b = box.querySelector('button');
    if (!b) return;
    b.addEventListener('click', function () {
      var c = AG[box.dataset.mapa].coordenadas;
      var f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=' + c[0] + ',' + c[1] + '&z=17&output=embed';
      f.title = 'Mapa: ' + AG[box.dataset.mapa].nome;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.innerHTML = '';
      box.appendChild(f);
      box.classList.add('mapa--aberto');
    });
  });

  /* ---------- dúvidas a partir dos dados ---------- */
  AG.faq = function (el, itens) {
    if (!el || !itens) return;
    el.innerHTML = itens.map(function (f, i) {
      return '<details class="faq__item rev" style="--i:' + i + '"><summary>' + AG.esc(f.p) +
        '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></summary><div class="faq__r"><p>' +
        AG.txt(f.r, '[resposta da Agrega]') + '</p></div></details>';
    }).join('');
  };

  AG.dados = function (arquivo) {
    return fetch(arquivo).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  };
})();
