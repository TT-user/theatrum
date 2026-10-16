/* Cabanas Vila Serena: prévia. Cabanas, galeria e informações vêm de
   data/*.json; o HTML só tem os contêineres e o estado com placeholder. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var ZAP = '5532998541677';
  function zap(msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); }

  // Escapa o texto e pinta de amarelo o que estiver entre colchetes.
  function t(s) {
    if (s == null || s === '') return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\[[^\]]+\]/g, function (m) { return '<span class="ph">' + m + '</span>'; });
  }
  function attr(s) { return String(s == null ? '' : s).replace(/\[|\]/g, '').replace(/"/g, '&quot;'); }

  function ligaZap(raiz) {
    (raiz || document).querySelectorAll('[data-zap]').forEach(function (a) {
      a.href = zap(a.getAttribute('data-zap'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  ligaZap();

  /* ---------- topo: transparente sobre o hero, grafite ao rolar ---------- */
  var topo = $('#topo');
  var barra = $('#demo-bar');
  var barH = barra ? barra.offsetHeight : 0;
  document.documentElement.style.setProperty('--bar-h', barH + 'px');
  function rolou() { topo.classList.toggle('solido', window.scrollY > barH + 10); }
  window.addEventListener('scroll', rolou, { passive: true });
  rolou();

  var menu = $('#menu'), menuBtn = $('#menu-btn');
  menuBtn.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', aberto);
    if (aberto) topo.classList.add('solido'); else rolou();
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  if ('IntersectionObserver' in window) {
    var links = {};
    menu.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.toggle('ativo', k === e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).concat('inicio', 'informacoes', 'obra').forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- mapa só no clique ---------- */
  $('#mapa-btn').addEventListener('click', function () {
    $('#mapa').innerHTML = '<iframe title="Cabanas Vila Serena no mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' +
      encodeURIComponent('Av. Vereador Inimá Novaes de Campos, 240, Alto Caparaó, MG, 36979-000') + '&output=embed"></iframe>';
  });

  /* ---------- carrossel das cabanas ---------- */
  var trilho = $('#trilho');
  function passo(dir) {
    var s = trilho.querySelector('.slide');
    if (s) trilho.scrollBy({ left: dir * (s.offsetWidth + 16), behavior: 'smooth' });
  }
  $('#seta-ant').addEventListener('click', function () { passo(-1); });
  $('#seta-prox').addEventListener('click', function () { passo(1); });
  trilho.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); passo(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); passo(1); }
  });

  function renderCarrossel(imgs) {
    // Fotos reais primeiro; áreas comuns ficam para o café e a galeria.
    var cabanas = imgs.filter(function (i) { return /^(fileira|cabana|porta)/.test(i.arquivo) || i.tipo === 'foto'; });
    cabanas.sort(function (a, b) { return (a.tipo === 'foto' ? 0 : 1) - (b.tipo === 'foto' ? 0 : 1); });
    trilho.innerHTML = cabanas.map(function (i) {
      var pasta = i.tipo === 'foto' ? 'assets/fotos/' : 'assets/renders/';
      return '<figure class="slide">' +
        '<img loading="lazy" src="' + pasta + i.arquivo + '-g.webp" srcset="' + pasta + i.arquivo + '-640.webp 640w, ' + pasta + i.arquivo + '-g.webp ' + i.w + 'w" sizes="(max-width: 1000px) 82vw, 860px" width="' + i.w + '" height="' + i.h + '" alt="' + attr(i.alt) + '">' +
        (i.tipo === 'render' ? '<span class="selo-render">Imagem ilustrativa do projeto</span>' : '') +
        '<figcaption>' + t(i.legenda) + '</figcaption></figure>';
    }).join('');
  }

  /* ---------- tipos de cabana ---------- */
  function renderCabanas(lista) {
    $('#lista-cabanas').innerHTML = lista.map(function (c) {
      var preco = typeof c.diariaDesde === 'number'
        ? 'a partir de <b>R$ ' + c.diariaDesde.toLocaleString('pt-BR') + '</b> a diária'
        : 'a partir de <b>R$ <span class="ph">[DIÁRIA]</span></b> a diária';
      var msg = 'Olá! Vim pelo site da Vila Serena e quero saber mais da cabana ' + attr(c.nome) + '.';
      return '<article class="tipo">' +
        '<div class="tipo__foto"><img loading="lazy" src="assets/renders/' + c.foto + '-640.webp" width="640" height="364" alt="Cabana A-frame da Vila Serena">' +
        '<span class="selo-render">Imagem ilustrativa do projeto</span></div>' +
        '<div class="tipo__txt"><h3>' + t(c.nome) + '</h3>' +
        '<p class="tipo__meta">Até ' + t(c.capacidade) + ' pessoas · ' + t(c.cama) + '</p>' +
        '<p>' + t(c.descricao) + '</p>' +
        '<ul>' + c.comodidades.map(function (x) { return '<li>' + t(x) + '</li>'; }).join('') + '</ul>' +
        '<p class="tipo__preco">' + preco + '</p>' +
        '<a class="btn btn--ambar" href="#lancamento">Quero reservar primeiro</a> ' +
        '</div></article>';
    }).join('');
  }

  /* ---------- informações, localização e obra ---------- */
  function caminho(o, k) { return k.split('.').reduce(function (a, p) { return a && a[p]; }, o); }

  function renderInfo(info) {
    document.querySelectorAll('[data-info]').forEach(function (el) {
      var v = caminho(info, el.getAttribute('data-info'));
      if (v != null && v !== '') el.innerHTML = t(v);
    });

    var blocos = [
      { h: 'Check-in e check-out', p: ['Entrada a partir de ' + info.checkin + ' · saída até ' + info.checkout, info.checkinObs] },
      { h: 'Mínimo de noites', p: [info.minimoNoites] },
      { h: 'Sinal', p: [info.sinal] },
      { h: 'Cancelamento', p: [info.cancelamento] }
    ].concat(info.regras.map(function (r) { return { h: r.titulo, p: [r.texto] }; }));
    $('#infos').innerHTML = blocos.map(function (b) {
      return '<div class="info"><h3>' + t(b.h) + '</h3>' + b.p.filter(Boolean).map(function (x) { return '<p>' + t(x) + '</p>'; }).join('') + '</div>';
    }).join('');

    $('#distancias').innerHTML = info.distancias.map(function (d) {
      return '<li><span>' + t(d.de) + '</span><span>' + t(d.km) + '</span></li>';
    }).join('');

    $('#perto').innerHTML = info.perto.map(function (p) {
      return '<article><h4>' + t(p.titulo) + '</h4><p>' + t(p.texto) + '</p></article>';
    }).join('');

    $('#linha-obra').innerHTML = info.obra.map(function (o) {
      return '<li' + (o.feito ? ' class="feito"' : '') + '><h3>' + t(o.etapa) + '</h3><p>' + t(o.texto) + '</p></li>';
    }).join('');
  }

  function json(u) { return fetch(u + '?v=1').then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }

  json('data/info.json').then(renderInfo).catch(function (e) { console.error(e); });
  json('data/cabanas.json').then(function (d) { renderCabanas(d.cabanas); }).catch(function (e) { console.error(e); });
  json('data/galeria.json').then(function (d) { renderCarrossel(d.imagens); }).catch(function (e) { console.error(e); });
})();
