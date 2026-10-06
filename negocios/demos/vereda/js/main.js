/* Vereda — demo. Configuração e comportamento geral da página. */

/* ===== CONFIGURAÇÃO =====
   WhatsApp com DDI + DDD + número, só dígitos. Vazio na demonstração. */
window.VEREDA = {
  whats: '',
  waLink: function (texto) {
    return 'https://wa.me/' + this.whats + '?text=' + encodeURIComponent(texto || '');
  }
};

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- links de WhatsApp declarados no HTML ----- */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = VEREDA.waLink(a.getAttribute('data-msg'));
  });

  /* ----- header ----- */
  var header = document.querySelector('.header');
  var waFloat = document.querySelector('.wa-float');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
    waFloat.classList.toggle('wait', window.innerWidth < 768 && window.scrollY < window.innerHeight * 0.7);
  };
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
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = 'contato';
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
    if (open) header.classList.add('scrolled'); else onScroll();
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

  /* ----- simulação do atendimento no WhatsApp ----- */
  var roteiro = [
    { de: 'out', txt: 'Boa noite, tenho um poço no sítio e falaram que preciso de documento. É verdade?' },
    { de: 'in',  txt: 'Boa noite! 🌱 Sou o assistente virtual da Vereda. Pode ser que sim, depende do uso. Sua propriedade fica no Espírito Santo ou em Minas Gerais?' },
    { de: 'out', txt: 'Minas, perto de Espera Feliz' },
    { de: 'in',  txt: 'Certo! A água do poço é usada para quê? Casa, criação, irrigação…?' },
    { de: 'out', txt: 'Irrigação do café e pro gado' },
    { de: 'in',  txt: 'Entendi. Nesse caso é bem provável que precise de outorga ou cadastro de uso da água. Sua propriedade já tem o CAR feito?' },
    { de: 'out', txt: 'Acho que não' },
    { de: 'in',  txt: 'Sem problema, a gente resolve os dois juntos. ✅ Já passei seu caso para um especialista, que vai te chamar amanhã cedo com os próximos passos. 👷‍♂️' }
  ];
  var waBody = document.getElementById('wa-body');
  var waStatus = document.querySelector('.wa-status');
  var replay = document.getElementById('wa-replay');
  var timers = [];
  var ticks = '<svg class="ticks" viewBox="0 0 16 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l3 3 6-7M6 8l1 1 6-7"/></svg>';
  var hora = function (i) {
    var m = 47 + Math.floor(i / 2);
    return '21:' + String(m).padStart(2, '0');
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
    waStatus.textContent = 'online';
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
        t += Math.min(700 + m.txt.length * 12, 2100);
        timers.push(setTimeout(function () {
          var ty = waBody.querySelector('.typing'); if (ty) ty.remove();
          waStatus.textContent = 'online';
          addBubble(m, i);
        }, t));
      } else {
        t += 900;
        timers.push(setTimeout(function () { addBubble(m, i); }, t));
      }
      t += 500;
    });
    timers.push(setTimeout(function () { replay.classList.add('show'); }, t + 200));
  };
  if ('IntersectionObserver' in window) {
    var chatIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { playChat(); chatIO.disconnect(); }
    }, { threshold: 0.35 });
    chatIO.observe(document.querySelector('.phone'));
  } else { playChat(); }
  replay.addEventListener('click', playChat);

  /* ----- "Saiba mais" marca o serviço no formulário ----- */
  document.querySelectorAll('[data-servico]').forEach(function (a) {
    a.addEventListener('click', function () {
      var box = document.querySelector('#c-servicos input[value="' + a.getAttribute('data-servico') + '"]');
      if (box) box.checked = true;
      var emp = document.querySelector('#contact-form input[name="perfil"][value="Empresa"]');
      if (emp) emp.checked = true;
    });
  });

  /* ----- máscara de telefone ----- */
  var maskPhone = function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 11);
      var out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 6) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      input.value = out;
    });
  };
  window.VEREDA.maskPhone = maskPhone;

  /* ----- formulário de contato → WhatsApp da Vereda ----- */
  var form = document.getElementById('contact-form');
  var err = document.getElementById('c-error');
  maskPhone(document.getElementById('c-whats'));

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var faltando = [];
    ['nome', 'cidade', 'uf', 'whatsapp'].forEach(function (n) {
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
    var msg = [
      '*Contato pelo site da Vereda*',
      '',
      '*Nome:* ' + f.nome.value.trim(),
      '*Sou:* ' + form.querySelector('input[name="perfil"]:checked').value,
      '*Cidade:* ' + f.cidade.value.trim() + ' / ' + f.uf.value,
      '*Interesse:* ' + (servicos.length ? servicos.join(', ') : 'Quero orientação'),
      '*WhatsApp:* ' + f.whatsapp.value.trim()
    ].join('\n');
    // TODO: enviar também para a planilha ou CRM da Vereda quando houver endpoint.
    window.open(VEREDA.waLink(msg), '_blank', 'noopener');
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
