/* Recanto Alto Caparaó: comportamento da página. JS puro, sem dependências. */
(function () {
  'use strict';

  // TODO: número da pousada com DDI e DDD, só dígitos (ex.: '5532999999999').
  // Vazio, o wa.me abre a lista de contatos com a mensagem pronta.
  var WHATSAPP = '';

  function waLink(msg) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
  }

  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- header: transparente sobre o hero, sólido depois ---------- */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (e) {
      header.classList.toggle('solid', !e[0].isIntersecting);
    }, { rootMargin: '-120px 0px 0px 0px' }).observe(hero);
  } else {
    header.classList.add('solid');
  }

  /* ---------- menu do celular ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('open', open);
    if (open) header.classList.add('solid');
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- barra de reserva rápida ---------- */
  var qb = document.getElementById('quickbar');
  var inEl = document.getElementById('qb-in');
  var outEl = document.getElementById('qb-out');
  var hospEl = document.getElementById('qb-hosp');

  function iso(d) {
    var z = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  function addDays(s, n) { var d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); }
  function br(s) { return s.split('-').reverse().join('/'); }

  var hoje = iso(new Date());
  inEl.min = hoje;
  outEl.min = addDays(hoje, 1);
  inEl.addEventListener('change', function () {
    if (!inEl.value) return;
    outEl.min = addDays(inEl.value, 1);
    if (!outEl.value || outEl.value <= inEl.value) outEl.value = addDays(inEl.value, 2);
  });

  // Guarda a escolha para o motor de reserva (próxima etapa) ler ao montar.
  window.recantoReserva = {};

  qb.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!inEl.value) { inEl.focus(); inEl.showPicker && inEl.showPicker(); return; }
    if (!outEl.value || outEl.value <= inEl.value) { outEl.value = addDays(inEl.value, 2); }
    window.recantoReserva = { checkin: inEl.value, checkout: outEl.value, hospedes: +hospEl.value };
    try { sessionStorage.setItem('recanto-reserva', JSON.stringify(window.recantoReserva)); } catch (err) {}
    document.dispatchEvent(new CustomEvent('recanto:datas', { detail: window.recantoReserva }));
    mostrarResumo();
    document.getElementById('reservar').scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('[data-chale]').forEach(function (a) {
    a.addEventListener('click', function () {
      window.recantoReserva.chale = a.getAttribute('data-chale');
      document.dispatchEvent(new CustomEvent('recanto:chale', { detail: window.recantoReserva }));
    });
  });

  // Provisório até o motor existir: mostra as datas e oferece o WhatsApp.
  function mostrarResumo() {
    var r = window.recantoReserva, el = document.getElementById('booking-recap');
    if (!el || !r.checkin) return;
    var noites = Math.round((new Date(r.checkout) - new Date(r.checkin)) / 864e5);
    var msg = 'Olá! Vim pelo site e queria ver a disponibilidade de ' + br(r.checkin) + ' a ' + br(r.checkout) +
      ' (' + noites + (noites === 1 ? ' noite' : ' noites') + '), ' + r.hospedes + (r.hospedes === 1 ? ' pessoa.' : ' pessoas.');
    el.innerHTML = 'De <strong>' + br(r.checkin) + '</strong> a <strong>' + br(r.checkout) + '</strong>, ' +
      noites + (noites === 1 ? ' noite' : ' noites') + ', ' + r.hospedes + (r.hospedes === 1 ? ' pessoa' : ' pessoas') +
      '.<br><a class="btn btn-amber" target="_blank" rel="noopener" href="' + waLink(msg) + '">Consultar pelo WhatsApp</a>';
    el.hidden = false;
  }

  /* ---------- galerias dos chalés (swipe nativo + pontos) ---------- */
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var track = g.querySelector('.g-track');
    var slides = track.children;
    var dots = g.querySelector('.g-dots');
    for (var i = 0; i < slides.length; i++) dots.appendChild(document.createElement('i'));
    var marks = dots.children;
    function update() {
      var idx = Math.round(track.scrollLeft / track.clientWidth);
      for (var j = 0; j < marks.length; j++) marks[j].classList.toggle('on', j === idx);
    }
    var t;
    track.addEventListener('scroll', function () { cancelAnimationFrame(t); t = requestAnimationFrame(update); }, { passive: true });
    update();
  });

  /* ---------- carrossel de avaliações ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (c) {
    var track = c.querySelector('.r-track');
    c.querySelectorAll('.r-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var step = track.firstElementChild.getBoundingClientRect().width + 16;
        track.scrollBy({ left: step * +b.getAttribute('data-dir'), behavior: 'smooth' });
      });
    });
  });

  /* ---------- entrada suave ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
