/* Recanto Alto Caparaó: comportamento da página. JS puro, sem dependências. */
(function () {
  'use strict';

  // O número vem de data/info.json (campo whatsapp). Vazio, o wa.me abre a
  // lista de contatos com a mensagem pronta.
  function waLink(msg) {
    var num = (window.recanto && window.recanto.info.whatsapp) || '';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  }

  // Delegado: vale também para os botões que o render.js monta depois.
  // O href é calculado no clique, quando o número já chegou do JSON.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-wa]');
    if (!a) return;
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

  /* ---------- destaque no menu da seção visível ---------- */
  // Considera todas as seções com id, não só as do menu: em "Datas especiais"
  // ou no FAQ nenhum item fica aceso, em vez de o anterior ficar preso.
  var navLinks = document.querySelectorAll('.menu a');
  var spySections = document.querySelectorAll('main section[id]');
  var spyTick = false;
  function spy() {
    spyTick = false;
    var line = window.innerHeight * 0.35;
    var atual = null;
    spySections.forEach(function (sec) { if (sec.getBoundingClientRect().top <= line) atual = sec.id; });
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + atual;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () { if (!spyTick) { spyTick = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);
  spy();

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

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-chale]');
    if (!a) return;
    window.recantoReserva.chale = a.getAttribute('data-chale');
    document.dispatchEvent(new CustomEvent('recanto:chale', { detail: window.recantoReserva }));
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

  /* ---------- como chegar: rota no mapa ---------- */
  // O mapa embutido do Google aceita origem e destino sem chave de API e
  // desenha o percurso com o trânsito do momento. A navegação com GPS, curva a
  // curva, fica no app do Google Maps (botão "Abrir no Google Maps").
  var frame = document.getElementById('mapa-frame');
  var mapa = document.getElementById('mapa');
  var status = document.getElementById('rota-status');
  var reset = document.getElementById('rota-reset');
  var gps = document.getElementById('rota-gps');
  var nav = document.getElementById('rota-nav');
  var mapaInicial = frame ? frame.src : '';

  function destino() {
    var info = window.recanto && window.recanto.info;
    if (info && info.rotaDestino) return info.rotaDestino;
    var c = (info && info.coordenadas) || { lat: -20.440611, lng: -41.890722 };
    return c.lat + ',' + c.lng;
  }
  function marcarCidade(origem) {
    document.querySelectorAll('[data-origem]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-origem') === origem ? 'true' : 'false');
    });
  }
  function mostrarRota(origem, rotulo) {
    frame.src = 'https://maps.google.com/maps?saddr=' + encodeURIComponent(origem) +
      '&daddr=' + encodeURIComponent(destino()) + '&output=embed&hl=pt-BR';
    nav.href = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(origem) +
      '&destination=' + encodeURIComponent(destino()) + '&travelmode=driving';
    mapa.classList.add('rota-on');
    reset.hidden = false;
    status.textContent = 'Caminho ' + rotulo + ', com o trânsito de agora. Para seguir com GPS, toque em "Abrir no Google Maps".';
    // No celular o mapa fica acima da lista: traz ele de volta à vista.
    if (mapa.getBoundingClientRect().top < 0 || mapa.getBoundingClientRect().bottom > window.innerHeight) {
      mapa.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (frame) {
    gps.addEventListener('click', function () {
      if (!navigator.geolocation) {
        status.textContent = 'Este navegador não informa a localização. Toque numa das cidades ou abra no Google Maps.';
        return;
      }
      status.textContent = 'Procurando onde vocês estão…';
      gps.disabled = true;
      navigator.geolocation.getCurrentPosition(function (pos) {
        gps.disabled = false;
        marcarCidade(null);
        mostrarRota(pos.coords.latitude.toFixed(5) + ',' + pos.coords.longitude.toFixed(5), 'a partir de onde vocês estão');
      }, function () {
        gps.disabled = false;
        status.textContent = 'Não conseguimos a sua localização. Toque numa das cidades ao lado ou abra no Google Maps.';
      }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
    });

    document.querySelectorAll('[data-origem]').forEach(function (b) {
      b.addEventListener('click', function () {
        var origem = b.getAttribute('data-origem');
        marcarCidade(origem);
        mostrarRota(origem, 'saindo de ' + b.querySelector('span').textContent);
      });
    });

    reset.addEventListener('click', function () {
      frame.src = mapaInicial;
      nav.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destino()) + '&travelmode=driving';
      mapa.classList.remove('rota-on');
      reset.hidden = true;
      status.textContent = '';
      marcarCidade(null);
    });
  }

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
