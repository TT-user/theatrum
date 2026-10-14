/* Nerd Club: base comum a todas as páginas (WhatsApp, HUD, som, menu de pausa). */
(function () {
  'use strict';
  var NC = window.NC;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Placeholders vindos do config ---------- */
  document.querySelectorAll('[data-cfg]').forEach(function (el) {
    var v = NC[el.getAttribute('data-cfg')];
    if (v) el.textContent = v;
    else el.innerHTML = '<span class="ph">a confirmar</span>';
  });
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Medição: pronto para GA4 ou Plausible, sem tag nenhuma na prévia ---------- */
  function evento(nome, dados) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: nome }, dados));
    if (window.plausible) window.plausible(nome, { props: dados });
  }

  /* ---------- WhatsApp: todo link com data-zap="origem" e data-msg ---------- */
  function ligaZap(el) {
    el.href = window.whatsappLink(el.getAttribute('data-msg') || 'Olá Nerd Club! Vim pelo site.', el.getAttribute('data-numero'));
    el.target = '_blank';
    el.rel = 'noopener';
  }
  document.querySelectorAll('[data-zap]').forEach(ligaZap);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-zap]');
    if (!a) return;
    if (a.hasAttribute('data-msg')) a.href = window.whatsappLink(a.getAttribute('data-msg'), a.getAttribute('data-numero'));
    evento('whatsapp_click', { origem: a.getAttribute('data-zap') });
    som('coin');
  });
  window.NCzap = { liga: ligaZap, evento: evento };

  /* ---------- Som 8-bit: desligado por padrão, escolha guardada ---------- */
  var botaoSom = document.getElementById('som');
  var somLigado = false;
  try { somLigado = localStorage.getItem('nc-som') === '1'; } catch (e) {}
  var ctx = null;
  var NOTAS = {
    select: [[660, .05]],
    coin: [[988, .06], [1319, .12]],
    start: [[523, .07], [659, .07], [784, .07], [1047, .14]]
  };
  function som(tipo) {
    if (!somLigado || !NOTAS[tipo]) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime;
      NOTAS[tipo].forEach(function (n) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = n[0];
        g.gain.setValueAtTime(.05, t);
        g.gain.exponentialRampToValueAtTime(.001, t + n[1]);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + n[1]);
        t += n[1];
      });
    } catch (e) {}
  }
  window.NCsom = som;
  function mostraSom() {
    botaoSom.setAttribute('aria-pressed', somLigado ? 'true' : 'false');
    var t = botaoSom.querySelector('.hud__som-txt');
    if (t) t.textContent = somLigado ? 'ON' : 'OFF';
    botaoSom.title = somLigado ? 'Efeitos sonoros ligados' : 'Efeitos sonoros desligados';
  }
  if (botaoSom) {
    mostraSom();
    botaoSom.addEventListener('click', function () {
      somLigado = !somLigado;
      try { localStorage.setItem('nc-som', somLigado ? '1' : '0'); } catch (e) {}
      mostraSom();
      som('start');
    });
  }

  /* ---------- COINS: o visitante junta moeda explorando (não é número da loja) ---------- */
  var coinsEl = document.getElementById('coins');
  var coins = 0;
  function ganha(n) {
    coins += n;
    if (coinsEl) coinsEl.textContent = String(coins).padStart(4, '0');
  }
  window.NCcoins = ganha;
  if ('IntersectionObserver' in window) {
    var vistas = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        vistas.unobserve(en.target);
        ganha(10);
      });
    }, { threshold: .35 });
    document.querySelectorAll('main > section, footer').forEach(function (s) { vistas.observe(s); });
  }

  /* ---------- Menu de pausa ---------- */
  var pausa = document.getElementById('pausa');
  var abre = document.getElementById('abre-pausa');
  function abrePausa() {
    pausa.hidden = false;
    document.body.style.overflow = 'hidden';
    som('select');
    var primeiro = pausa.querySelector('button, a');
    if (primeiro) primeiro.focus();
  }
  function fechaPausa() {
    pausa.hidden = true;
    document.body.style.overflow = '';
    abre.focus({ preventScroll: true });
  }
  if (pausa && abre) {
    abre.addEventListener('click', abrePausa);
    pausa.addEventListener('click', function (e) {
      if (e.target === pausa || e.target.closest('[data-fecha-pausa]')) fechaPausa();
    });
    document.addEventListener('keydown', function (e) {
      if (pausa.hidden) return;
      if (e.key === 'Escape') { fechaPausa(); return; }
      // setas navegam entre as opções, como num menu de jogo
      var itens = Array.prototype.slice.call(pausa.querySelectorAll('button, a'));
      var i = itens.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prox = itens[(i + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length];
        prox.focus();
        som('select');
      } else if (e.key === 'Tab') {
        if (e.shiftKey && i === 0) { e.preventDefault(); itens[itens.length - 1].focus(); }
        else if (!e.shiftKey && i === itens.length - 1) { e.preventDefault(); itens[0].focus(); }
      }
    });
    // passou para tela grande com o menu aberto: fecha
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches && !pausa.hidden) fechaPausa(); });
  }

  /* ---------- Menu marca a seção que está na tela ----------
     Uma linha imaginária a 40% da altura da tela; a seção que ela cruza acende o link.
     Seções sem link próprio apontam para a vizinha (restauração faz parte da oficina). */
  var DONO = { restauracao: 'oficina', contato: 'visite' };
  var links = Array.prototype.slice.call(document.querySelectorAll('.hud__nav a[href^="#"], .pausa li a[href^="#"]'));
  function marca(id) {
    links.forEach(function (a) {
      if (id && a.getAttribute('href') === '#' + id && !a.hasAttribute('data-filtro')) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  if (links.length && 'IntersectionObserver' in window) {
    var espia = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) marca(DONO[en.target.id] || en.target.id);
      });
    }, { rootMargin: '-40% 0px -59% 0px' });
    document.querySelectorAll('main > section, footer').forEach(function (s) { espia.observe(s); });
  }

  if (reduz) document.documentElement.classList.add('sem-movimento');
})();
