/* Chalés Pedra Alta (demo): monta chalés, extras, informações, FAQ, rodapé e
   schema.org a partir de data/*.json. Nenhum chalé, preço ou extra mora no
   HTML: adicionar um chalé é adicionar um bloco no chales.json. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  /* idioma: js/idioma-demo.js traduz o HTML; os dados vêm de data/en/ e o
     que é montado aqui com número no meio passa por T(pt, en) */
  var I = window.Idioma || { en: false, dados: function (u) { return u; } };
  function T(pt, en) { return I.en ? en : pt; }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }

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
      ? 'R$ ' + v.toLocaleString(I.en ? 'en-US' : 'pt-BR', { maximumFractionDigits: 2 })
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
    [/banheira|hidro|bathtub|tub/i, 'bath'], [/lareira|fireplace/i, 'fire'], [/wi-?fi|internet/i, 'wifi'],
    [/cozinha|frigobar|cooktop|kitchen/i, 'kitchen'], [/aquecedor|ar[- ]cond|climatiz|heater/i, 'thermo'],
    [/varanda|deck|vista|porch|view/i, 'deck'], [/cama|roupa|toalha|linen|towel/i, 'bed'], [/caf[eé]|coffee/i, 'coffee'],
    [/estaciona|garagem|parking/i, 'road']
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
  // status: "ativo" aparece e reserva; "pre-agendamento" aparece com selo e
  // o botão da lista dos primeiros; "oculto" não aparece (só conta para a
  // faixa de novos chalés). "em-breve" é o nome antigo de pre-agendamento.
  var EXTENSO = I.en ? ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'] : ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis'];
  var MSG_LISTA = T('Olá! Vim pelo site. Quero entrar na lista dos primeiros a reservar os novos chalés do Pedra Alta.',
    "Hi! I found you through the website. I'd like to join the early list to book Pedra Alta's new cabins.");
  function statusDe(c) { return c.status === 'em-breve' ? 'pre-agendamento' : c.status; }

  function renderChales(todos, info) {
    var box = $('#lista-chales');
    var lista = todos.filter(function (c) { return statusDe(c) !== 'oculto'; });
    var ativos = lista.filter(function (c) { return statusDe(c) === 'ativo'; });
    var ocultos = todos.filter(function (c) { return statusDe(c) === 'oculto'; });
    box.setAttribute('data-n', lista.length);
    $('#qtd-chales').textContent = ativos.length === 1 ? T('Um chalé', 'One cabin') : (EXTENSO[ativos.length] || ativos.length) + T(' chalés', ' cabins');

    box.innerHTML = lista.map(function (c) {
      var pre = statusDe(c) === 'pre-agendamento';
      var slides = c.fotos.map(function (f) {
        return '<figure class="g-slide">' + foto(f, '(min-width: 960px) 540px, 100vw') + '</figure>';
      }).join('');
      var amen = c.comodidades.map(function (a) { return '<li>' + ico(icone(a)) + '<span>' + t(a) + '</span></li>'; }).join('');
      var preco = aPartirDe(c);
      var foot = pre
        ? '<p class="price">' + T('abre em ', 'opens in ') + '<strong>' + t(c.previsao || '[PREVISÃO DE ABERTURA]') + '</strong></p>' +
          '<a class="btn btn-line" href="#" data-wa="' + attr(MSG_LISTA) + '">' + ico('bell') + T('Quero ser um dos primeiros', 'I want to be one of the first') + '</a>'
        : '<p class="price">' + T('a partir de ', 'from ') + '<strong>' + brl(preco, '[DIÁRIA]') + '</strong>' + T(' / noite', ' / night') + '</p>' +
          '<a class="btn btn-dark" href="#reservar" data-chale="' + c.id + '">' + T('Ver datas deste chalé', 'See dates for this cabin') + '</a>';
      return '<article class="chale' + (pre ? ' chale-breve' : '') + '">' +
        '<div class="gallery" data-gallery>' + (pre ? '<span class="selo">' + T('Pré-agendamento', 'Pre-booking') + '</span>' : '') +
          '<div class="g-track">' + slides + '</div><div class="g-dots" aria-hidden="true"></div></div>' +
        '<div class="chale-body">' +
          '<h3>' + t(c.nome) + '</h3>' +
          '<p class="chale-cap">' + ico('users') + T('Até ', 'Up to ') + plural(c.capacidade, T('pessoa', 'guest'), T('pessoas', 'guests')) + (c.cama ? T(' · cama ', ' · ') + t(c.cama) : '') + '</p>' +
          '<p class="chale-desc">' + t(c.descricaoCurta) + '</p>' +
          '<ul class="amen">' + amen + '</ul>' +
          (c.descricaoLonga ? '<details class="more"><summary>' + T('Sobre o chalé', 'About this cabin') + '</summary><p>' + t(c.descricaoLonga) + '</p></details>' : '') +
          '<div class="chale-foot">' + foot + '</div>' +
        '</div></article>';
    }).join('');

    // Faixa da lista dos primeiros: só enquanto houver chalé oculto.
    var faixa = $('#novos-chales');
    var cfg = info.novosChales || {};
    if (faixa && ocultos.length && cfg.mostrar !== false) {
      var n = ocultos.length;
      var titulo = n === 1 ? T('Mais um chalé <em>está chegando</em>', 'One more cabin <em>is on its way</em>')
        : EXTENSO[n] ? T('Mais ', '') + EXTENSO[n] + T(' chalés <em>estão chegando</em>', ' more cabins <em>are on their way</em>')
        : T('Novos chalés <em>estão chegando</em>', 'New cabins <em>are on their way</em>');
      if (!I.en && EXTENSO[n] && n > 1) titulo = 'Mais ' + EXTENSO[n].toLowerCase() + ' chalés <em>estão chegando</em>';
      faixa.innerHTML =
        '<div class="novos-tri" aria-hidden="true"><span></span><span></span></div>' +
        '<div class="novos-txt">' +
          '<p class="kicker">' + T('Em breve · ', 'Coming soon · ') + t(cfg.previsao || '[PREVISÃO DE ABERTURA]') + '</p>' +
          '<h3>' + titulo + '</h3>' +
          '<p>' + T('Entre na lista dos primeiros: vocês recebem as datas antes de abrirem para todo mundo e escolhem as suas primeiro.',
            'Join the early list: you get the dates before they open to everyone and pick yours first.') +
            (cfg.vantagem ? ' ' + t(cfg.vantagem) : '') + '</p>' +
        '</div>' +
        '<a class="btn btn-amber" href="#" data-wa="' + attr(MSG_LISTA) + '">' + ico('bell') + T('Quero ser um dos primeiros', 'I want to be one of the first') + '</a>';
      faixa.hidden = false;
    } else if (faixa) {
      faixa.hidden = true;
    }

    box.querySelectorAll('[data-gallery]').forEach(galeria);

    // Hóspedes da barra rápida vão até a maior capacidade entre os ativos.
    var max = Math.max.apply(null, ativos.map(function (c) { return c.capacidade; }).concat([2]));
    var sel = $('#qb-hosp');
    if (sel) {
      sel.innerHTML = '';
      for (var i = 1; i <= max; i++) sel.insertAdjacentHTML('beforeend', '<option value="' + i + '"' + (i === 2 ? ' selected' : '') + '>' + plural(i, T('pessoa', 'guest'), T('pessoas', 'guests')) + '</option>');
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
      ? info.sinal.percentual + T('% do valor total para confirmar a reserva.', '% of the total to confirm the booking.')
      : '[PERCENTUAL DO SINAL]' + T(' do valor total para confirmar a reserva.', ' of the total to confirm the booking.');
    var blocos = [
      ['clock', T('Check-in e check-out', 'Check-in and check-out'),
        '<dl class="hours"><div><dt>' + T('Entrada', 'Check-in') + '</dt><dd>' + T('a partir das ', 'from ') + t(info.checkin) + '</dd></div><div><dt>' + T('Saída', 'Check-out') + '</dt><dd>' + T('até as ', 'by ') + t(info.checkout) + '</dd></div></dl>' +
        (info.checkinObs ? '<p>' + t(info.checkinObs) + '</p>' : '')],
      ['list', T('Incluso na diária', 'Included in the nightly rate'), '<ul class="dots">' + info.inclusoNaDiaria.map(function (x) { return '<li>' + t(x) + '</li>'; }).join('') + '</ul>'],
      ['house', T('Regras da casa', 'House rules'), '<dl class="rules">' + info.regras.map(function (r) { return '<div><dt>' + t(r.titulo) + '</dt><dd>' + t(r.texto) + '</dd></div>'; }).join('') + '</dl>'],
      ['card', T('Sinal e cancelamento', 'Deposit and cancellation'), '<p>' + t(sinal) + ' ' + t(info.sinal.formas) + '</p><p>' + t(info.cancelamento) + '</p>'],
      ['wifi', T('Wi-Fi e sinal de celular', 'Wi-Fi and phone signal'), '<dl class="rules"><div><dt>Wi-Fi</dt><dd>' + t(info.conexao.wifi) + '</dd></div><div><dt>' + T('Celular', 'Mobile') + '</dt><dd>' + t(info.conexao.celular) + '</dd></div></dl>'],
      ['road', T('Estrada de acesso', 'Access road'), '<p>' + t(info.estrada) + '</p>']
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
    var ativos = chales.filter(function (c) { return statusDe(c) === 'ativo'; });
    var precos = [];
    ativos.forEach(function (c) { ['semana', 'fimDeSemana', 'feriado'].forEach(function (k) { if (typeof c.diarias[k] === 'number') precos.push(c.diarias[k]); }); });
    var amen = {};
    ativos.forEach(function (c) { c.comodidades.forEach(function (a) { amen[a.replace(/\s*\[[^\]]*\]/g, '')] = 1; }); });
    var base = location.origin + location.pathname.replace(/index\.html$/, '');
    var s = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      '@id': base + '#pedra-alta',
      name: info.nome,
      url: base,
      image: base + 'assets/og-pedra-alta.jpg',
      description: T('Chalés A-frame privativos em Gonçalves (MG), com banheira, lareira e vista para a Serra da Mantiqueira.',
        'Private A-frame cabins in Gonçalves (MG, Brazil), with a bathtub, fireplace and views of the Mantiqueira Mountains.'),
      address: { '@type': 'PostalAddress', streetAddress: info.endereco, addressLocality: info.cidade, addressRegion: info.uf, addressCountry: 'BR' },
      geo: { '@type': 'GeoCoordinates', latitude: info.coordenadas.lat, longitude: info.coordenadas.lng },
      hasMap: info.mapa,
            checkinTime: info.checkin,
      checkoutTime: info.checkout,
      numberOfRooms: ativos.length,
      amenityFeature: Object.keys(amen).map(function (a) { return { '@type': 'LocationFeatureSpecification', name: a, value: true }; }),
      containsPlace: ativos.map(function (c) {
        return { '@type': 'Accommodation', name: c.nome, occupancy: { '@type': 'QuantitativeValue', maxValue: c.capacidade } };
      })
    };
    if (info.whatsapp) s.telephone = '+' + info.whatsapp;
    if (precos.length) s.priceRange = 'R$ ' + Math.min.apply(null, precos) + T(' a R$ ', ' to R$ ') + Math.max.apply(null, precos) + T(' por noite', ' per night');
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(s);
    document.head.appendChild(el);
  }

  /* ---------- carga ---------- */
  // no-cache: o navegador revalida a cada visita, então a dona muda um preço
  // e ele aparece na hora, sem esperar o cache de 7 dias da Hostinger.
  function get(f) { return fetch(I.dados('data/' + f), { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(f); return r.json(); }); }

  Promise.all([get('chales.json'), get('extras.json'), get('info.json')]).then(function (d) {
    var chales = d[0].chales.slice().sort(function (a, b) { return a.ordem - b.ordem; });
    var extras = d[1].extras, info = d[2];
    window.pedraAlta = { chales: chales, extras: extras, info: info };
    renderChales(chales, info);
    renderExtras(extras);
    renderInfo(info);
    renderFaq(info);
    renderContato(info);
    renderSchema(info, chales);
    document.dispatchEvent(new CustomEvent('pedraAlta:dados', { detail: window.pedraAlta }));
  }).catch(function (err) {
    console.error('Pedra Alta: não carregou os dados', err);
    document.querySelectorAll('[data-render]').forEach(function (el) {
      el.innerHTML = '<p class="load-err">' + T('Não conseguimos carregar esta parte agora. Fale com a gente pelo WhatsApp.', "We couldn't load this part right now. Message us on WhatsApp.") + '</p>';
    });
  });
})();
