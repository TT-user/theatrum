/* Inovar: núcleo da página. Loja escolhida, WhatsApp, menus e diálogos.
   Os outros scripts usam window.Inovar depois que Inovar.pronto resolver. */
(function () {
  'use strict';

  // ---------- Armazenamento que não quebra (aba anônima, bloqueio) ----------
  var memoria = {};
  var guarda = {
    ler: function (k) {
      try { var v = localStorage.getItem(k); return v == null ? memoria[k] : JSON.parse(v); }
      catch (e) { return memoria[k]; }
    },
    gravar: function (k, v) {
      memoria[k] = v;
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* fica só em memória */ }
    }
  };

  var cfg = null;
  var ouvintesLoja = [];

  var pronto = fetch('data/config.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (c) { cfg = c; return c; });

  function lojaPorId(id) { return cfg && cfg.lojas.filter(function (l) { return l.id === id; })[0]; }
  function vetPorId(id) { return cfg && cfg.veterinarios.filter(function (v) { return v.id === id; })[0]; }

  function loja() { var id = guarda.ler('inovar.loja'); return lojaPorId(id) ? id : null; }
  function setLoja(id) {
    guarda.gravar('inovar.loja', id);
    ouvintesLoja.forEach(function (fn) { fn(id); });
  }

  function abrirWa(numero, texto) {
    var url = 'https://wa.me/' + numero + (texto ? '?text=' + encodeURIComponent(texto) : '');
    var w = window.open(url, '_blank');
    if (!w) location.href = url;
  }

  // ---------- Diálogos ----------
  function abrir(d) { if (!d.open) d.showModal(); }
  function fechar(d) { if (d.open) d.close(); }
  document.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) fechar(d); });
    d.querySelectorAll('[data-fechar]').forEach(function (b) { b.addEventListener('click', function () { fechar(d); }); });
  });

  // Escolher para quem enviar: opcoes = [{rotulo, sub, numero}], devolve via cb(opcao)
  var dEscolha = document.getElementById('escolha');
  function escolher(titulo, opcoes, cb) {
    document.getElementById('escolha-title').textContent = titulo;
    var box = document.getElementById('escolha-opts');
    box.innerHTML = '';
    opcoes.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-wa btn-block btn-lg';
      b.innerHTML = '<svg class="ico"><use href="#i-wa"/></svg> ';
      b.appendChild(document.createTextNode(o.rotulo));
      b.addEventListener('click', function () { fechar(dEscolha); cb(o); });
      box.appendChild(b);
    });
    abrir(dEscolha);
  }

  // Resolve uma rota do config: id de veterinário, 'loja' ou 'escolher'
  function destino(rota, cb, lojaId) {
    if (rota === 'loja') {
      var l = lojaPorId(lojaId || loja());
      if (l) return cb({ rotulo: 'Loja ' + l.nome, numero: l.whatsapp, tipo: 'loja', id: l.id });
      return escolher('Para qual loja?', cfg.lojas.map(function (x) {
        return { rotulo: 'Loja ' + x.nome, numero: x.whatsapp, tipo: 'loja', id: x.id };
      }), function (o) { setLoja(o.id); cb(o); });
    }
    var v = vetPorId(rota);
    if (v) return cb({ rotulo: v.curto, numero: v.whatsapp, tipo: 'vet', id: v.id, saudacao: v.curto });
    escolher('Com qual veterinário?', cfg.veterinarios.map(function (x) {
      return { rotulo: x.nome, numero: x.whatsapp, tipo: 'vet', id: x.id, saudacao: x.curto };
    }), cb);
  }

  // ---------- Header e menu ----------
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var aberto = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', aberto);
    burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // ---------- WhatsApp flutuante ----------
  var waBtn = document.getElementById('fab-wa-btn');
  var waMenu = document.getElementById('wa-menu');
  var vetToggle = waMenu.querySelector('.wa-vet-toggle');
  var waVets = document.getElementById('wa-vets');
  function waAbrir(sim) {
    waMenu.hidden = !sim;
    waBtn.setAttribute('aria-expanded', sim);
    waBtn.setAttribute('aria-label', sim ? 'Fechar opções de WhatsApp' : 'Abrir opções de WhatsApp');
  }
  waBtn.addEventListener('click', function () { waAbrir(waMenu.hidden); });
  document.querySelectorAll('[data-wa-menu]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); waAbrir(true); waMenu.querySelector('a').focus(); });
  });
  vetToggle.addEventListener('click', function () {
    waVets.hidden = !waVets.hidden;
    vetToggle.setAttribute('aria-expanded', !waVets.hidden);
  });
  document.addEventListener('click', function (e) {
    if (!waMenu.hidden && !e.target.closest('.fab-wa') && !e.target.closest('[data-wa-menu]')) waAbrir(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !waMenu.hidden) { waAbrir(false); waBtn.focus(); } });

  // ---------- Seletor de loja ----------
  var status = document.getElementById('store-status');
  var statusPadrao = status.innerHTML;
  function pintarLoja(id) {
    document.querySelectorAll('.store-btn').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.loja === id); });
    var l = lojaPorId(id);
    if (l) {
      status.innerHTML = '';
      status.append('Seus pedidos vão para a ');
      var s = document.createElement('strong'); s.textContent = 'loja ' + l.nome; status.append(s);
      status.append('. Toque na outra para trocar.');
    } else status.innerHTML = statusPadrao;
  }
  document.querySelectorAll('.store-btn').forEach(function (b) {
    b.addEventListener('click', function () { setLoja(b.dataset.loja); });
  });
  ouvintesLoja.push(pintarLoja);

  // ---------- Entrada discreta ----------
  var revs = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    revs.forEach(function (el) { io.observe(el); });
  } else revs.forEach(function (el) { el.classList.add('in'); });

  window.Inovar = {
    pronto: pronto,
    guarda: guarda,
    config: function () { return cfg; },
    loja: loja,
    setLoja: setLoja,
    onLoja: function (fn) { ouvintesLoja.push(fn); },
    lojaPorId: lojaPorId,
    abrirWa: abrirWa,
    abrir: abrir,
    fechar: fechar,
    escolher: escolher,
    destino: destino
  };

  pronto.then(function () { pintarLoja(loja()); })
    .catch(function (e) { console.error('Inovar: não carregou data/config.json', e); });
})();
