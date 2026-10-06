/* Prumo — demo. Configuração e comportamento geral da página. */

/* ===== CONFIGURAÇÃO =====
   Preencha os WhatsApps com DDI + DDD + número, só dígitos (ex.: "5532999999999").
   Enquanto estiver vazio, o link abre o WhatsApp com a mensagem pronta para a pessoa escolher o contato. */
window.PRUMO = {
  whatsGeral: '',
  unidades: {
    // mapa: coordenadas do pin, copiadas do link do Google Maps (o trecho !3d<lat>!4d<lng>).
    varginha:        { nome: 'Varginha',      whats: '', mapa: { lat: -21.5513, lng: -45.4303 } },
    'tres-coracoes': { nome: 'Três Corações', whats: '', mapa: { lat: -21.6946, lng: -45.2553 } },
    lavras:          { nome: 'Lavras',        whats: '', mapa: { lat: -21.2453, lng: -44.9997 } }
  },
  waLink: function (unidade, texto) {
    var u = this.unidades[unidade];
    var num = (u && u.whats) || this.whatsGeral || '';
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(texto || '');
  }
};

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- links de WhatsApp declarados no HTML ----- */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = PRUMO.waLink(a.getAttribute('data-wa'), a.getAttribute('data-msg'));
  });

  /* ----- mapas das unidades ----- */
  document.querySelectorAll('[data-unidade]').forEach(function (card) {
    var u = PRUMO.unidades[card.getAttribute('data-unidade')];
    var box = card.querySelector('.unit-map');
    if (!u || !u.mapa) {
      box.insertAdjacentHTML('beforeend', '<span class="map-ph ph">[LOCALIZAÇÃO]</span>');
      return;
    }
    var ll = u.mapa.lat + ',' + u.mapa.lng;
    box.classList.add('real');
    box.innerHTML = '<iframe title="Mapa da unidade ' + u.nome + '" src="https://maps.google.com/maps?q=' + ll + '&z=16&hl=pt-BR&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
    card.querySelector('dl').insertAdjacentHTML('afterend',
      '<a class="route" href="https://www.google.com/maps/dir/?api=1&destination=' + ll + '" target="_blank" rel="noopener">Como chegar →</a>');
  });

  /* ----- header ----- */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- destaque no menu da seção visível ----- */
  var navLinks = document.querySelectorAll('.nav a, .mobile-menu a:not(.btn)');
  var spySections = Array.prototype.map.call(document.querySelectorAll('.nav a'), function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  var spyTick = false;
  var spy = function () {
    spyTick = false;
    var line = window.innerHeight * 0.35;
    var atual = null;
    spySections.forEach(function (sec) { if (sec.getBoundingClientRect().top <= line) atual = sec.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = spySections[spySections.length - 1].id;
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + atual;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', function () { if (!spyTick) { spyTick = true; requestAnimationFrame(spy); } }, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ----- menu mobile ----- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mobile');
  var setMenu = function (open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ----- entrada das seções ----- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ----- contadores ----- */
  var fmt = function (n) { return n.toLocaleString('pt-BR'); };
  var runCounter = function (el) {
    var target = +el.getAttribute('data-count');
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = fmt(target) + suffix; return; }
    var dur = 1600, t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  };
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ----- simulação do atendimento no WhatsApp ----- */
  var roteiro = [
    { de: 'out', txt: 'Bom dia! Preciso agendar exame admissional para 2 funcionários' },
    { de: 'in',  txt: 'Bom dia! 😊 Sou o assistente virtual da Prumo. Em qual unidade fica melhor: Varginha, Três Corações ou Lavras?' },
    { de: 'out', txt: 'Lavras' },
    { de: 'in',  txt: 'Perfeito! Sua empresa já é cliente Prumo?' },
    { de: 'out', txt: 'Ainda não' },
    { de: 'in',  txt: 'Sem problema! Me passa o nome da empresa e a função dos funcionários que já encaminho para nossa equipe de Lavras com horários disponíveis. ✅' },
    { de: 'out', txt: 'Construtora Silva, função pedreiro' },
    { de: 'in',  txt: 'Anotado! Para pedreiro, também vale verificar o treinamento de NR-35 se houver trabalho em altura. Um especialista vai te chamar em instantes. 👷' }
  ];
  var waBody = document.getElementById('wa-body');
  var waStatus = document.querySelector('.wa-status');
  var replay = document.getElementById('wa-replay');
  var timers = [];
  var ticks = '<svg class="ticks" viewBox="0 0 16 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l3 3 6-7M6 8l1 1 6-7"/></svg>';
  var hora = function (i) {
    var d = new Date(); d.setHours(8, 41 + Math.floor(i / 2), 0);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  var esc = function (s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };
  var addBubble = function (m, i) {
    var b = document.createElement('div');
    b.className = 'bubble ' + m.de;
    b.innerHTML = esc(m.txt) + '<span class="meta">' + hora(i) + (m.de === 'out' ? ticks : '') + '</span>';
    waBody.appendChild(b);
    waBody.scrollTop = waBody.scrollHeight;
  };
  var playChat = function () {
    timers.forEach(clearTimeout); timers = [];
    waBody.innerHTML = '<span class="wa-day">HOJE</span>';
    replay.classList.remove('show');
    if (reduce) { roteiro.forEach(addBubble); replay.classList.add('show'); return; }
    var t = 500;
    roteiro.forEach(function (m, i) {
      if (m.de === 'in') {
        var typingAt = t;
        timers.push(setTimeout(function () {
          waStatus.textContent = 'digitando...';
          var ty = document.createElement('div');
          ty.className = 'bubble in typing'; ty.innerHTML = '<i></i><i></i><i></i>';
          waBody.appendChild(ty); waBody.scrollTop = waBody.scrollHeight;
        }, typingAt));
        t += Math.min(600 + m.txt.length * 10, 1700);
        timers.push(setTimeout(function () {
          var ty = waBody.querySelector('.typing'); if (ty) ty.remove();
          waStatus.textContent = 'online';
          addBubble(m, i);
        }, t));
      } else {
        t += 700;
        timers.push(setTimeout(function () { addBubble(m, i); }, t));
      }
      t += 450;
    });
    timers.push(setTimeout(function () { replay.classList.add('show'); }, t + 200));
  };
  if ('IntersectionObserver' in window) {
    var chatIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { playChat(); chatIO.disconnect(); }
    }, { threshold: 0.3 });
    chatIO.observe(document.querySelector('.phone'));
  } else { playChat(); }
  replay.addEventListener('click', playChat);

  /* ----- "Saiba mais" marca o serviço no formulário ----- */
  document.querySelectorAll('[data-servico]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-servico');
      var box = document.querySelector('#q-servicos input[value="' + v + '"]');
      if (box) box.checked = true;
    });
  });

  /* ----- formulário de orçamento → WhatsApp da unidade ----- */
  var form = document.getElementById('quote-form');
  var err = document.getElementById('q-error');
  var whatsInput = document.getElementById('q-whats');
  var maskPhone = function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      input.value = out;
    });
  };
  maskPhone(whatsInput);
  window.PRUMO.maskPhone = maskPhone;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var faltando = [];
    ['nome', 'empresa', 'cidade', 'funcionarios', 'whatsapp'].forEach(function (n) {
      var ok = f[n].value.trim() !== '' && (n !== 'whatsapp' || f[n].value.replace(/\D/g, '').length >= 10);
      f[n].setAttribute('aria-invalid', String(!ok));
      if (!ok) faltando.push(f[n]);
    });
    if (faltando.length) {
      err.textContent = 'Preencha os campos destacados para continuar.';
      faltando[0].focus();
      return;
    }
    err.textContent = '';
    var servicos = Array.prototype.map.call(form.querySelectorAll('input[name="servico"]:checked'), function (c) { return c.value; });
    var cidade = f.cidade.value;
    var msg = [
      '*Pedido de orçamento pelo site*',
      '',
      '*Nome:* ' + f.nome.value.trim(),
      '*Empresa:* ' + f.empresa.value.trim(),
      '*Unidade:* ' + PRUMO.unidades[cidade].nome,
      '*Funcionários:* ' + f.funcionarios.value,
      '*Interesse:* ' + (servicos.length ? servicos.join(', ') : 'Quero orientação'),
      '*WhatsApp:* ' + f.whatsapp.value.trim()
    ].join('\n');
    window.open(PRUMO.waLink(cidade, msg), '_blank', 'noopener');
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
