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
  // menu do celular e gaveta de orçamento: a página para embaixo (com o Lenis ligado, ele para junto)
  AG.lenis = null;
  AG.travar = function (sim) {
    document.body.style.overflow = sim ? 'hidden' : '';
    if (AG.lenis) { if (sim) AG.lenis.stop(); else AG.lenis.start(); }
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
    AG.travar(false);
  }
  if (botao && menu) {
    botao.addEventListener('click', function () {
      var abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      topo.classList.toggle('topo--aberto', abrir);
      AG.travar(abrir);
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

  /* ---------- movimento: GSAP, ScrollTrigger, SplitText e Lenis (só Marketing e Print carregam) ----------
     O <head> dessas páginas põe .anima, que esconde as entradas antes do primeiro quadro; quando o GSAP
     assume, quem esconde é ele e a classe sai. Sem as bibliotecas (Projeto Completo, privacidade, CDN
     fora do ar), com movimento reduzido ou em ?still=1, tudo aparece parado e a rolagem é a do navegador. */
  var G = window.gsap, ST = window.ScrollTrigger, SPLIT = window.SplitText;
  var mov = null; // a rodada com movimento: o gsap.matchMedia desfaz e refaz se a preferência mudar
  var largos = [], ctxLargo = null;
  var LIMPA = 'transform,opacity,visibility,transition';
  function semAnima() { raiz.classList.remove('anima'); }
  // o título só é quebrado em linhas com a fonte certa (com teto, para não segurar a página)
  var fontes = new Promise(function (ok) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ok);
    setTimeout(ok, 1500);
  });
  var ligado = false, refrescando = 0;
  function refresca() {
    if (!ligado) return;
    clearTimeout(refrescando);
    // o pin da trilha nasce depois dos gatilhos de baixo: ordena para todos contarem o espaço dele
    refrescando = setTimeout(function () { if (ST.sort) ST.sort(); ST.refresh(); }, 120);
  }

  // peças de um bloco com título, na ordem do documento (o que só embrulha o h2 é aberto)
  function partes(el) {
    var out = [];
    Array.prototype.forEach.call(el.children, function (c) {
      if (c.tagName !== 'H2' && c.querySelector('h2')) out = out.concat(partes(c));
      else out.push(c);
    });
    return out;
  }
  // bloco com h2: o título sobe linha a linha por trás de uma máscara; o resto entra com fade e 24 px
  function cabeca(el) {
    var pecas = partes(el), quebras = [];
    var tl = G.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onComplete: function () { quebras.forEach(function (s) { s.revert(); }); G.set(pecas, { clearProps: LIMPA }); G.set(el, { clearProps: 'opacity,visibility' }); }
    });
    pecas.forEach(function (p, i) {
      var quando = i ? '<0.14' : 0;
      if (p.tagName === 'H2' && SPLIT) {
        var s = SPLIT.create(p, { type: 'lines', mask: 'lines', linesClass: 'linha' });
        quebras.push(s);
        tl.from(s.lines, { yPercent: 125, duration: 1, ease: 'expo.out', stagger: .1 }, quando);
      } else {
        G.set(p, { transition: 'none' });
        tl.from(p, { opacity: 0, y: 24, duration: .7, ease: 'power3.out' }, quando);
      }
    });
    G.set(el, { opacity: 1 });
  }
  // cards e blocos sem título: fade e 24 px, em lote, um depois do outro. Só opacidade, nunca visibility:
  // o que ainda não entrou continua no Tab do teclado e no leitor de tela (o foco rola até ele e ele entra)
  function blocos(lista) {
    G.set(lista, { opacity: 0, y: 24, transition: 'none' });
    ST.batch(lista, {
      start: 'top 90%', once: true,
      onEnter: function (lote) {
        // num salto (link, Tab, Home/End), o que já ficou para trás aparece na hora e não segura a fila
        var vistos = lote.filter(function (e) { return e.getBoundingClientRect().bottom > 0; });
        var passados = lote.filter(function (e) { return vistos.indexOf(e) < 0; });
        if (passados.length) G.set(passados, { clearProps: LIMPA });
        if (vistos.length) G.to(vistos, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', stagger: Math.min(.08, .6 / vistos.length), overwrite: true, clearProps: LIMPA });
      }
    });
  }
  function prepara(raizEl) {
    var cabs = [], soltos = [], esta = mov;
    (raizEl || document).querySelectorAll('.rev, .faixa-cta__txt').forEach(function (el) {
      if (esta.feitos.has(el)) return;
      esta.feitos.add(el);
      (el.querySelector('h2') ? cabs : soltos).push(el);
    });
    if (soltos.length) blocos(soltos);
    if (cabs.length) {
      G.set(cabs, { opacity: 0 });
      fontes.then(function () {
        if (mov === esta) esta.ctx.add(function () { cabs.forEach(cabeca); });
        refresca();
      });
    }
  }
  // o que o JS desenha depois (serviços, time, produtos...) entra do mesmo jeito
  AG.revelar = function (raizEl) {
    if (still) (raizEl || document).querySelectorAll('img[loading=lazy]').forEach(function (i) { i.loading = 'eager'; });
    if (mov) mov.ctx.add(function () { prepara(raizEl); });
    if (trilhas) trilhas.ctx.add(montaTrilhas);
    refresca(); // a página cresceu: os gatilhos de baixo mudam de lugar
  };

  // contadores do hero: de 0 até o valor do data-count, com vírgula decimal ("5,0")
  function conta(el) {
    var final = el.textContent, alvo = el.dataset.count;
    var casas = (alvo.split(',')[1] || '').length;
    var fim = parseFloat(alvo.replace(/\./g, '').replace(',', '.'));
    if (isNaN(fim)) return;
    var fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    var o = { v: 0 }, w = el.getBoundingClientRect().width;
    function volta() { el.textContent = final; el.style.width = ''; }
    if (w) el.style.width = w + 'px'; // o texto ao lado não anda enquanto o número cresce
    el.textContent = fmt.format(0);
    G.to(o, {
      v: fim, duration: 1.6, delay: .2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: function () { el.textContent = fmt.format(o.v); },
      onComplete: volta
    });
    mov.limpa.push(volta);
  }

  // botão magnético: segue o mouse até 8 px e volta com mola; translate soma com o transform do hover
  function magnetico(b) {
    G.set(b, { '--mx': '0px', '--my': '0px' });
    b.classList.add('magnetico');
    function segue(e) {
      if (e.pointerType === 'touch') return;
      var r = b.getBoundingClientRect();
      var ax = parseFloat(G.getProperty(b, '--mx')) || 0, ay = parseFloat(G.getProperty(b, '--my')) || 0;
      var x = (e.clientX - (r.left - ax + r.width / 2)) / (r.width / 2) * 8;
      var y = (e.clientY - (r.top - ay + r.height / 2)) / (r.height / 2) * 8;
      var d = Math.hypot(x, y);
      if (d > 8) { x = x / d * 8; y = y / d * 8; }
      G.to(b, { '--mx': x + 'px', '--my': y + 'px', duration: .35, ease: 'power3.out', overwrite: 'auto' });
    }
    function solta() { G.to(b, { '--mx': '0px', '--my': '0px', duration: 1, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' }); }
    b.addEventListener('pointermove', segue);
    b.addEventListener('pointerleave', solta);
    return function () {
      b.removeEventListener('pointermove', segue);
      b.removeEventListener('pointerleave', solta);
      b.classList.remove('magnetico');
      b.style.removeProperty('--mx'); b.style.removeProperty('--my');
    };
  }

  // a seção presa pelo ScrollTrigger mora dentro de um .pin-spacer, que tem a altura dela mais a do pin
  function caixa(el) { var pai = el.parentNode; return pai && pai.classList && pai.classList.contains('pin-spacer') ? pai : el; }

  // scrollspy: o link do menu da seção que está no meio da tela ganha .is-ativo
  function scrollspy() {
    var links = {}, atual = null;
    document.querySelectorAll('.menu > a[href^="#"]:not(.btn)').forEach(function (a) { links[a.hash.slice(1)] = a; });
    function marca(id) {
      if (id === atual) return;
      atual = id;
      Object.keys(links).forEach(function (k) {
        links[k].classList.toggle('is-ativo', k === id);
        if (k === id) links[k].setAttribute('aria-current', 'true'); else links[k].removeAttribute('aria-current');
      });
    }
    document.querySelectorAll('main section[id]').forEach(function (s) {
      ST.create({
        // seção presa (passos): o fim soma o tempo do pin, para o item seguir aceso enquanto ela está fixa
        trigger: s, start: 'top center',
        end: function () {
          var r = s.getBoundingClientRect().bottom + scrollY - innerHeight / 2;
          var pin = ST.getAll().filter(function (t) { return t.pin === s; })[0];
          return pin ? r + pin.end - pin.start : r;
        },
        onToggle: function (self) { if (self.isActive) marca(s.id); else if (atual === s.id) marca(null); }
      });
    });
  }

  /* trilha dos passos (Método na Marketing, Como funciona na Print): a linha tracejada se desenha com a
     rolagem e cada círculo acende quando ela chega nele. Acima de 900 px a seção fica presa por uma tela
     (e ocupa a tela, senão sobraria faixa vazia); abaixo, sem pin, a linha desce na vertical. Sem
     movimento, o CSS já mostra tudo aceso. */
  var trilhas = null;
  function trilha(ol, largo) {
    var itens = [].slice.call(ol.querySelectorAll('.passo'));
    var secao = ol.closest('section');
    var marcos = [];
    function mede() {
      // onde cada círculo fica ao longo da linha (0 = começo, 1 = fim), lido do próprio CSS da linha
      var cs = getComputedStyle(ol, '::after'), r = ol.getBoundingClientRect();
      var ini = parseFloat(largo ? cs.left : cs.top) || 0, fimL = parseFloat(largo ? cs.right : cs.bottom) || 0;
      var tam = (largo ? r.width : r.height) - ini - fimL;
      marcos = itens.map(function (li) {
        var c = li.querySelector('.passo__n').getBoundingClientRect();
        var meio = largo ? c.left + c.width / 2 - r.left : c.top + c.height / 2 - r.top;
        return tam > 0 ? (meio - ini) / tam : 0;
      });
    }
    function acende(p) {
      itens.forEach(function (li, i) { li.classList.toggle('aceso', p >= marcos[i] - .01); });
    }
    ol.classList.add('trilha');
    var pin = null;
    if (largo && secao) {
      secao.classList.add('trilha-pin');
      pin = ST.create({ trigger: secao, start: 'top top', end: function () { return '+=' + innerHeight; }, pin: true, refreshPriority: 1 });
    }
    mede();
    G.fromTo(ol, { '--traco': 0 }, {
      '--traco': 1, ease: 'none',
      scrollTrigger: pin
        ? { trigger: secao, start: 'top top', end: function () { return pin.end; }, scrub: .5, refreshPriority: 1, onRefresh: mede }
        : { trigger: ol, start: 'top 70%', end: 'bottom 70%', scrub: .5, onRefresh: mede },
      onUpdate: function () { acende(this.progress()); }
    });
    acende(0);
    trilhas.desfaz.push(function () {
      ol.classList.remove('trilha');
      ol.style.removeProperty('--traco');
      itens.forEach(function (li) { li.classList.remove('aceso'); });
      if (secao) secao.classList.remove('trilha-pin');
    });
  }
  function montaTrilhas() {
    document.querySelectorAll('.passos').forEach(function (ol) {
      if (trilhas.feitas.has(ol) || !ol.querySelector('.passo')) return;
      trilhas.feitas.add(ol);
      trilha(ol, trilhas.largo);
    });
  }

  // pin e rolagem de lado só valem acima de 900 px: quem precisar registra aqui
  AG.noLargo = function (fn) { largos.push(fn); if (ctxLargo) ctxLargo.add(fn); };

  if (!G || !ST || still) semAnima();
  else {
    ligado = true;
    G.registerPlugin(ST);
    if (SPLIT) G.registerPlugin(SPLIT);
    var mm = AG.mm = G.matchMedia();
    mm.add({ mexe: '(prefers-reduced-motion: no-preference)', calmo: '(prefers-reduced-motion: reduce)' }, function (ctx) {
      if (!ctx.conditions.mexe) { semAnima(); return; }
      var esta = mov = { ctx: ctx, feitos: new WeakSet(), limpa: [] };
      var lenis = null, raf = null;
      if (window.Lenis) {
        // dentro da gaveta, da foto ampliada e do menu aberto, a roda rola o próprio painel
        lenis = AG.lenis = new window.Lenis({
          prevent: function (n) { return n.classList.contains('gaveta') || n.classList.contains('luz') || n.classList.contains('topo--aberto'); }
        });
        lenis.on('scroll', ST.update);
        raf = function (t) { lenis.raf(t * 1000); };
        G.ticker.add(raf);
        G.ticker.lagSmoothing(0);
        if (topo && topo.classList.contains('topo--aberto')) lenis.stop();
      }
      prepara(document);
      document.querySelectorAll('[data-count]').forEach(conta);
      semAnima();
      return function () {
        esta.limpa.forEach(function (f) { f(); });
        if (mov === esta) mov = null;
        if (lenis) { G.ticker.remove(raf); G.ticker.lagSmoothing(500, 33); lenis.destroy(); AG.lenis = null; }
      };
    });
    mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', function () {
      var desfaz = [];
      document.querySelectorAll('.btn--pri.btn--lg, .menu > .btn--pri').forEach(function (b) { desfaz.push(magnetico(b)); });
      return function () { desfaz.forEach(function (f) { f(); }); };
    });
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', function (ctx) {
      ctxLargo = ctx;
      largos.forEach(function (fn) { ctx.add(fn); });
      return function () { ctxLargo = null; };
    });
    mm.add({ largo: '(min-width: 901px) and (prefers-reduced-motion: no-preference)', estreito: '(max-width: 900px) and (prefers-reduced-motion: no-preference)' }, function (ctx) {
      var esta = trilhas = { ctx: ctx, largo: !!ctx.conditions.largo, feitas: new WeakSet(), desfaz: [] };
      montaTrilhas();
      refresca();
      return function () { esta.desfaz.forEach(function (f) { f(); }); if (trilhas === esta) trilhas = null; };
    });
    scrollspy();
  }
  if (still) AG.revelar();

  // links do menu: com o Lenis, a rolagem até a seção é a dele, descontando a altura do topo
  document.addEventListener('click', function (e) {
    if (!AG.lenis || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('pular') || a.hash.length < 2) return;
    var alvo = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (!alvo) return;
    e.preventDefault();
    var teclado = e.detail === 0;
    // destino em número: com o elemento, o Lenis já desconta o scroll-padding-top do CSS (topo + 16 px).
    // Seção presa (trilha dos passos): mira o começo do pin, para a linha começar do 01
    var y = caixa(alvo).getBoundingClientRect().top + AG.lenis.animatedScroll - (topo ? topo.offsetHeight : 0);
    AG.lenis.scrollTo(y, {
      force: true,
      onComplete: function () {
        // pelo teclado, o foco vai junto para a seção (como no salto do navegador)
        if (!teclado) return;
        if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
        alvo.focus({ preventScroll: true });
      }
    });
    if (location.hash !== a.hash) history.pushState(null, '', a.hash);
  });

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
      return '<details class="faq__item rev"><summary>' + AG.esc(f.p) +
        '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></summary><div class="faq__r"><p>' +
        AG.txt(f.r, '[resposta da Agrega]') + '</p></div></details>';
    }).join('');
  };

  AG.dados = function (arquivo) {
    return fetch(arquivo).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  };
})();
