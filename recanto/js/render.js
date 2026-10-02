/* Recanto Alto Caparaó: monta chalés, extras, informações, FAQ, rodapé e
   schema.org a partir de data/*.json. Nenhum chalé, preço ou extra mora no
   HTML: adicionar um chalé é adicionar um bloco no chales.json. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };

  // Escapa o texto e pinta de amarelo o que estiver entre colchetes.
  function t(s) {
    if (s == null || s === '') return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\[[^\]]+\]/g, function (m) { return '<span class="ph">' + m + '</span>'; });
  }
  function attr(s) { return String(s == null ? '' : s).replace(/\[|\]/g, '').replace(/"/g, '&quot;'); }
  function brl(v, ph) {
    return typeof v === 'number'
      ? 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
      : 'R$ <span class="ph">' + (ph || '[VALOR]') + '</span>';
  }

  function foto(f, sizes, cls) {
    if (!f || f.pendente !== undefined) {
      return '<div class="g-ph ' + (cls || '') + '"><span>[FOTO] ' + t(f ? f.pendente : '') + '</span></div>';
    }
    var maior = f.larguras[f.larguras.length - 1];
    var srcset = f.larguras.map(function (w) { return f.base + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    return '<img src="' + f.base + '-' + maior + '.webp" srcset="' + srcset + '" sizes="' + sizes + '" width="' + f.largura +
      '" height="' + f.altura + '" loading="lazy" alt="' + attr(f.alt) + '">';
  }

  // Ícone de cada comodidade pelo nome, para o JSON continuar só com texto.
  var ICONES = [
    [/banheira|hidro/i, 'bath'], [/lareira/i, 'fire'], [/wi-?fi|internet/i, 'wifi'],
    [/cozinha|frigobar|cooktop/i, 'kitchen'], [/aquecedor|ar[- ]cond|climatiz/i, 'thermo'],
    [/varanda|deck|vista/i, 'deck'], [/cama|roupa|toalha/i, 'bed'], [/caf[eé]/i, 'coffee'],
    [/estaciona|garagem/i, 'road']
  ];
  function icone(nome) {
    for (var i = 0; i < ICONES.length; i++) if (ICONES[i][0].test(nome)) return ICONES[i][1];
    return 'check';
  }
  function ico(id, cls) { return '<svg class="ico ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }

  function aPartirDe(c) {
    var v = [c.diarias.semana, c.diarias.fimDeSemana, c.diarias.feriado].filter(function (x) { return typeof x === 'number'; });
    return v.length ? Math.min.apply(null, v) : null;
  }

  /* ---------- chalés ---------- */
  function renderChales(lista) {
    var box = $('#lista-chales');
    var ativos = lista.filter(function (c) { return c.status === 'ativo'; });
    box.setAttribute('data-n', lista.length);
    $('#qtd-chales').textContent = ativos.length === 1 ? 'Um chalé' : ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis'][ativos.length] + ' chalés';

    box.innerHTML = lista.map(function (c) {
      var breve = c.status === 'em-breve';
      var slides = c.fotos.map(function (f) {
        return '<figure class="g-slide">' + foto(f, '(min-width: 960px) 540px, 100vw') + '</figure>';
      }).join('');
      var amen = c.comodidades.map(function (a) { return '<li>' + ico(icone(a)) + '<span>' + t(a) + '</span></li>'; }).join('');
      var preco = aPartirDe(c);
      var foot = breve
        ? '<p class="price">abre em <strong>' + t(c.previsao || '[EM BREVE]') + '</strong></p>' +
          '<a class="btn btn-line" href="#" data-wa="Olá! Vim pelo site. Quero saber quando o novo chalé abrir reservas.">' + ico('bell') + 'Quero ser avisado</a>'
        : '<p class="price">a partir de <strong>' + brl(preco, '[DIÁRIA]') + '</strong> / noite</p>' +
          '<a class="btn btn-dark" href="#reservar" data-chale="' + c.id + '">Ver datas deste chalé</a>';
      return '<article class="chale' + (breve ? ' chale-breve' : '') + '">' +
        '<div class="gallery" data-gallery>' + (breve ? '<span class="selo">Em breve</span>' : '') +
          '<div class="g-track">' + slides + '</div><div class="g-dots" aria-hidden="true"></div></div>' +
        '<div class="chale-body">' +
          '<h3>' + t(c.nome) + '</h3>' +
          '<p class="chale-cap">' + ico('users') + 'Até ' + c.capacidade + (c.capacidade === 1 ? ' pessoa' : ' pessoas') + (c.cama ? ' · cama ' + t(c.cama) : '') + '</p>' +
          '<p class="chale-desc">' + t(c.descricaoCurta) + '</p>' +
          '<ul class="amen">' + amen + '</ul>' +
          (c.descricaoLonga ? '<details class="more"><summary>Sobre o chalé</summary><p>' + t(c.descricaoLonga) + '</p></details>' : '') +
          '<div class="chale-foot">' + foot + '</div>' +
        '</div></article>';
    }).join('');

    box.querySelectorAll('[data-gallery]').forEach(galeria);

    // Hóspedes da barra rápida vão até a maior capacidade entre os ativos.
    var max = Math.max.apply(null, ativos.map(function (c) { return c.capacidade; }).concat([2]));
    var sel = $('#qb-hosp');
    if (sel) {
      sel.innerHTML = '';
      for (var i = 1; i <= max; i++) sel.insertAdjacentHTML('beforeend', '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + i + (i === 1 ? ' pessoa' : ' pessoas') + '</option>');
    }
  }

  function galeria(g) {
    var track = g.querySelector('.g-track');
    var dots = g.querySelector('.g-dots');
    var n = track.children.length;
    if (n < 2) return;
    for (var i = 0; i < n; i++) dots.appendChild(document.createElement('i'));
    var marks = dots.children, raf;
    function update() {
      var idx = Math.round(track.scrollLeft / track.clientWidth);
      for (var j = 0; j < marks.length; j++) marks[j].classList.toggle('on', j === idx);
    }
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- extras ---------- */
  function renderExtras(lista) {
    $('#lista-extras').innerHTML = lista.map(function (e) {
      return '<article class="exp">' +
        '<div class="exp-img">' + foto(e.foto, '(min-width: 1080px) 300px, (min-width: 600px) 50vw, 100vw') + '</div>' +
        '<div class="exp-body"><h3>' + t(e.nome) + '</h3><p>' + t(e.descricao) + '</p>' +
          (e.aviso ? '<p class="exp-aviso">' + ico('clock') + '<span>' + t(e.aviso) + '</span></p>' : '') +
          '<p class="exp-price">' + brl(e.preco) + ' <small>' + t(e.cobranca) + '</small></p>' +
        '</div></article>';
    }).join('');
  }

  /* ---------- informações importantes ---------- */
  function renderInfo(info) {
    var sinal = typeof info.sinal.percentual === 'number'
      ? info.sinal.percentual + '% do valor total para confirmar a reserva.'
      : '[PERCENTUAL DO SINAL] do valor total para confirmar a reserva.';
    var blocos = [
      ['clock', 'Check-in e check-out',
        '<dl class="hours"><div><dt>Entrada</dt><dd>a partir das ' + t(info.checkin) + '</dd></div><div><dt>Saída</dt><dd>até as ' + t(info.checkout) + '</dd></div></dl>' +
        (info.checkinObs ? '<p>' + t(info.checkinObs) + '</p>' : '')],
      ['list', 'Incluso na diária', '<ul class="dots">' + info.inclusoNaDiaria.map(function (x) { return '<li>' + t(x) + '</li>'; }).join('') + '</ul>'],
      ['house', 'Regras da casa', '<dl class="rules">' + info.regras.map(function (r) { return '<div><dt>' + t(r.titulo) + '</dt><dd>' + t(r.texto) + '</dd></div>'; }).join('') + '</dl>'],
      ['card', 'Sinal e cancelamento', '<p>' + t(sinal) + ' ' + t(info.sinal.formas) + '</p><p>' + t(info.cancelamento) + '</p>'],
      ['wifi', 'Wi-Fi e sinal de celular', '<dl class="rules"><div><dt>Wi-Fi</dt><dd>' + t(info.conexao.wifi) + '</dd></div><div><dt>Celular</dt><dd>' + t(info.conexao.celular) + '</dd></div></dl>'],
      ['road', 'Estrada de acesso', '<p>' + t(info.estrada) + '</p>']
    ];
    $('#lista-info').innerHTML = blocos.map(function (b) {
      return '<article class="info">' + ico(b[0], 'ico-lg') + '<h3>' + b[1] + '</h3>' + b[2] + '</article>';
    }).join('');
  }

  function renderFaq(info) {
    $('#lista-faq').innerHTML = info.faq.map(function (f) {
      return '<details><summary>' + t(f.pergunta) + '</summary><p>' + t(f.resposta) + '</p></details>';
    }).join('');
  }

  function renderContato(info) {
    document.querySelectorAll('[data-info]').forEach(function (el) {
      var k = el.getAttribute('data-info');
      if (info[k] != null) el.innerHTML = t(info[k]);
    });
  }

  /* ---------- schema.org a partir dos dados ---------- */
  function renderSchema(info, chales) {
    var ativos = chales.filter(function (c) { return c.status === 'ativo'; });
    var precos = [];
    ativos.forEach(function (c) { ['semana', 'fimDeSemana', 'feriado'].forEach(function (k) { if (typeof c.diarias[k] === 'number') precos.push(c.diarias[k]); }); });
    var amen = {};
    ativos.forEach(function (c) { c.comodidades.forEach(function (a) { amen[a.replace(/\s*\[[^\]]*\]/g, '')] = 1; }); });
    var base = location.origin + location.pathname.replace(/index\.html$/, '');
    var s = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      '@id': base + '#recanto',
      name: info.nome,
      url: base,
      image: base + 'assets/og-recanto.jpg',
      description: 'Chalés A-frame privativos em Alto Caparaó (MG), com banheira, lareira e vista para a serra, a minutos do Parque Nacional do Caparaó.',
      address: { '@type': 'PostalAddress', streetAddress: info.endereco, addressLocality: info.cidade, addressRegion: info.uf, addressCountry: 'BR' },
      geo: { '@type': 'GeoCoordinates', latitude: info.coordenadas.lat, longitude: info.coordenadas.lng },
      hasMap: info.mapa,
      sameAs: ['https://www.instagram.com/' + info.instagram + '/'],
      checkinTime: info.checkin,
      checkoutTime: info.checkout,
      numberOfRooms: ativos.length,
      amenityFeature: Object.keys(amen).map(function (a) { return { '@type': 'LocationFeatureSpecification', name: a, value: true }; }),
      containsPlace: ativos.map(function (c) {
        return { '@type': 'Accommodation', name: c.nome, occupancy: { '@type': 'QuantitativeValue', maxValue: c.capacidade } };
      })
    };
    if (info.whatsapp) s.telephone = '+' + info.whatsapp;
    if (precos.length) s.priceRange = 'R$ ' + Math.min.apply(null, precos) + ' a R$ ' + Math.max.apply(null, precos) + ' por noite';
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(s);
    document.head.appendChild(el);
  }

  /* ---------- carga ---------- */
  // no-cache: o navegador revalida a cada visita, então a dona muda um preço
  // e ele aparece na hora, sem esperar o cache de 7 dias da Hostinger.
  function get(f) { return fetch('data/' + f, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(f); return r.json(); }); }

  Promise.all([get('chales.json'), get('extras.json'), get('info.json')]).then(function (d) {
    var chales = d[0].chales.slice().sort(function (a, b) { return a.ordem - b.ordem; });
    var extras = d[1].extras, info = d[2];
    window.recanto = { chales: chales, extras: extras, info: info };
    renderChales(chales);
    renderExtras(extras);
    renderInfo(info);
    renderFaq(info);
    renderContato(info);
    renderSchema(info, chales);
    document.dispatchEvent(new CustomEvent('recanto:dados', { detail: window.recanto }));
  }).catch(function (err) {
    console.error('Recanto: não carregou os dados', err);
    document.querySelectorAll('[data-render]').forEach(function (el) {
      el.innerHTML = '<p class="load-err">Não conseguimos carregar esta parte agora. Fale com a gente pelo WhatsApp.</p>';
    });
  });
})();
