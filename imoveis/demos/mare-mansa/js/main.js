/* ============================================================
   Maré Mansa Imóveis · demonstração (marca fictícia)
   Quatro peças que conversam entre si:
   1. busca do hero e cartões de região escrevem nos mesmos
      filtros do catálogo (um estado só, nunca dois discordando);
   2. catálogo com comparador de até três;
   3. gaveta do imóvel com simulador de financiamento;
   4. pedido de avaliação em quatro passos, que monta a
      mensagem do WhatsApp.
   ============================================================ */
(function () {
  'use strict';

  /* demonstração: sem número. Todo link de contato passa pelo _demo.js,
     que troca o destino por #demo-cta e mostra o aviso. */
  var ZAP = '';

  /* idioma: o js/idioma-demo.js traduz o HTML; o que este arquivo monta
     com número no meio passa por T(pt, en), e os imóveis têm campo en */
  var EN = !!(window.Idioma && window.Idioma.en);
  function T(pt, en) { return EN ? en : pt; }
  function L(o, k) { return EN && o.en && o.en[k] ? o.en[k] : o[k]; }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
  function linkZap(texto) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(texto); }

  /* ---------- carteira fictícia ----------
     Doze imóveis inventados, com fotos reaproveitadas das demos. */
  var IMOVEIS = [
    { cod:'MM-101', tipo:'apartamento', fim:'venda', regiao:'Recreio', quartos:3, suites:1, banheiros:2, vagas:2, area:105,
      titulo:'Apartamento de 3 quartos a duas quadras da praia', perto:'perto da Praia do Recreio',
      preco:1150000, condominio:1350, iptu:310, novo:12, selo:'',
      desc:'Sala em dois ambientes com varanda, cozinha planejada e suíte com closet. Condomínio com piscina, academia e portaria 24 horas.',
      en:{ titulo:'3-bedroom apartment two blocks from the beach', perto:'near Recreio Beach', desc:'Living room in two spaces with a balcony, custom kitchen and a master suite with walk-in closet. Building with pool, gym and 24-hour doorman.' } },
    { cod:'MM-102', tipo:'cobertura', fim:'venda', regiao:'Recreio', quartos:3, suites:2, banheiros:3, vagas:2, area:190,
      titulo:'Cobertura duplex com terraço, piscina e churrasqueira', perto:'perto da Av. das Américas',
      preco:1890000, condominio:1900, iptu:520, novo:11, selo:'Vista livre',
      desc:'Terraço inteiro descoberto no segundo piso, com piscina e churrasqueira. Duas suítes e uma vaga coberta extra.',
      en:{ titulo:'Duplex penthouse with terrace, pool and barbecue', perto:'near Avenida das Américas', desc:'An open-air terrace taking up the whole upper floor, with pool and barbecue. Two suites and an extra covered parking space.' } },
    { cod:'MM-103', tipo:'casa', fim:'venda', regiao:'Recreio', quartos:4, suites:4, banheiros:5, vagas:4, area:360,
      titulo:'Casa em condomínio fechado, quatro suítes e piscina', perto:'condomínio fechado no Recreio',
      preco:2950000, condominio:1650, iptu:780, novo:10, selo:'Condomínio',
      desc:'Casa em dois pavimentos com área gourmet integrada à piscina, quatro suítes e escritório. Condomínio com segurança e área verde.',
      en:{ titulo:'House in a gated community, four suites and pool', perto:'gated community in Recreio', desc:'Two-storey house with a gourmet area opening onto the pool, four suites and a study. Gated community with security and green space.' } },
    { cod:'MM-104', tipo:'apartamento', fim:'venda', regiao:'Barra da Tijuca', quartos:4, suites:2, banheiros:4, vagas:3, area:168,
      titulo:'Apartamento de 4 quartos em condomínio-clube', perto:'perto do Jardim Oceânico',
      preco:2380000, condominio:2400, iptu:690, novo:9, selo:'',
      desc:'Planta ampla com dependência, varanda gourmet e vista para a área de lazer. Condomínio-clube com quadras, piscinas e espaço kids.',
      en:{ titulo:'4-bedroom apartment in a resort-style condo', perto:'near Jardim Oceânico', desc:'Spacious layout with staff quarters, gourmet balcony and a view of the leisure area. Resort-style condo with courts, pools and a play area for kids.' } },
    { cod:'MM-105', tipo:'apartamento', fim:'venda', regiao:'Pontal e Macumba', quartos:2, suites:1, banheiros:2, vagas:1, area:72,
      titulo:'Apartamento de 2 quartos novo, nunca habitado', perto:'perto da Praia do Pontal',
      preco:690000, condominio:820, iptu:180, novo:8, selo:'Novo',
      desc:'Porcelanato na área toda, varanda e infraestrutura para ar-condicionado. Prédio de 2024 com lazer completo.',
      en:{ titulo:'Brand-new 2-bedroom apartment, never lived in', perto:'near Pontal Beach', desc:'Porcelain tile throughout, a balcony and wiring for air conditioning. Built in 2024, with full leisure facilities.' } },
    { cod:'MM-106', tipo:'casa', fim:'venda', regiao:'Vargens', quartos:3, suites:3, banheiros:4, vagas:3, area:280,
      titulo:'Casa térrea com piscina cercada de verde', perto:'Vargem Grande',
      preco:1680000, condominio:600, iptu:410, novo:7, selo:'',
      desc:'Casa térrea em terreno de 900 m², integrada ao jardim. Silêncio de serra a dez minutos da praia.',
      en:{ titulo:'Single-storey house with pool, surrounded by green', perto:'Vargem Grande', desc:'Single-storey house on a 900 m² lot, opening onto the garden. Mountain quiet ten minutes from the beach.' } },
    { cod:'MM-107', tipo:'apartamento', fim:'locacao', regiao:'Pontal e Macumba', quartos:2, suites:1, banheiros:2, vagas:1, area:80,
      titulo:'Apartamento de 2 quartos mobiliado, pronto para morar', perto:'a uma quadra da Praia da Macumba',
      preco:4200, condominio:950, iptu:150, novo:6, selo:'Mobiliado',
      desc:'Mobiliado e equipado, com varanda e armários em todos os cômodos. Aceita seguro-fiança.',
      en:{ titulo:'Furnished 2-bedroom apartment, ready to move in', perto:'one block from Macumba Beach', desc:'Furnished and equipped, with a balcony and built-in wardrobes in every room. Rent guarantee insurance accepted.' } },
    { cod:'MM-108', tipo:'sala', fim:'locacao', regiao:'Recreio', quartos:0, suites:0, banheiros:1, vagas:1, area:38,
      titulo:'Sala comercial em centro empresarial da Av. das Américas', perto:'Av. das Américas',
      preco:2600, condominio:780, iptu:120, novo:5, selo:'',
      desc:'Sala com banheiro privativo e vaga rotativa, em prédio com recepção e controle de acesso.',
      en:{ titulo:'Office unit in a business center on Avenida das Américas', perto:'Avenida das Américas', desc:'Office with a private bathroom and a shared parking space, in a building with reception and access control.' } },
    { cod:'MM-109', tipo:'apartamento', fim:'locacao', regiao:'Barra da Tijuca', quartos:1, suites:1, banheiros:1, vagas:1, area:46,
      titulo:'Studio com serviços, ao lado do BRT', perto:'perto do Terminal Alvorada',
      preco:3300, condominio:900, iptu:110, novo:4, selo:'Mobiliado',
      desc:'Studio mobiliado em prédio com lavanderia, coworking e piscina na cobertura.',
      en:{ titulo:'Serviced studio next to the BRT', perto:'near the Alvorada Terminal', desc:'Furnished studio in a building with laundry, coworking space and a rooftop pool.' } },
    { cod:'MM-110', tipo:'casa', fim:'locacao', regiao:'Recreio', quartos:4, suites:2, banheiros:4, vagas:3, area:300,
      titulo:'Casa duplex em condomínio com piscina e gourmet', perto:'condomínio fechado no Recreio',
      preco:12500, condominio:1400, iptu:620, novo:3, selo:'Condomínio',
      desc:'Casa duplex com piscina, área gourmet e quarto de hóspedes no térreo.',
      en:{ titulo:'Duplex house in a gated community with pool and gourmet area', perto:'gated community in Recreio', desc:'Duplex house with pool, gourmet area and a guest room on the ground floor.' } },
    { cod:'MM-111', tipo:'terreno', fim:'venda', regiao:'Vargens', quartos:0, suites:0, banheiros:0, vagas:0, area:600,
      titulo:'Terreno plano de 600 m² em condomínio', perto:'Vargem Pequena',
      preco:520000, condominio:450, iptu:160, novo:2, selo:'',
      desc:'Terreno plano e regular, pronto para construir, em condomínio com portaria e ruas asfaltadas.',
      en:{ titulo:'Flat 600 m² lot in a gated community', perto:'Vargem Pequena', desc:'Flat, regular lot, ready to build on, in a gated community with a gatehouse and paved streets.' } },
    { cod:'MM-112', tipo:'apartamento', fim:'venda', regiao:'Barra da Tijuca', quartos:3, suites:1, banheiros:2, vagas:2, area:120,
      titulo:'Apartamento de 3 quartos com vista para a lagoa', perto:'perto da Lagoa de Marapendi',
      preco:1420000, condominio:1700, iptu:400, novo:1, selo:'Vista livre',
      desc:'Sala com janelão para a lagoa e a serra, cozinha aberta e suíte ampla. Andar alto, sol da manhã.',
      en:{ titulo:'3-bedroom apartment overlooking the lagoon', perto:'near Marapendi Lagoon', desc:'Living room with a large window facing the lagoon and the mountains, open kitchen and a spacious suite. High floor, morning sun.' } }
  ];

  var REGIOES = [
    { nome:'Recreio', foto:'reg-recreio-praia', txt:'Praia, ciclovia e condomínios novos. Onde a Maré Mansa nasceu.',
      en:{ txt:'Beach, bike lane and new condos. Where Maré Mansa was born.' } },
    { nome:'Barra da Tijuca', foto:'reg-barra', txt:'Condomínios-clube, orla extensa e acesso fácil ao resto da cidade.',
      en:{ txt:'Resort-style condos, a long seafront and easy access to the rest of the city.' } },
    { nome:'Pontal e Macumba', foto:'reg-pontal-macumba', txt:'O fim do Recreio: mar aberto, surfe e prédios baixos.',
      en:{ nome:'Pontal and Macumba', txt:'The far end of Recreio: open sea, surf and low-rise buildings.' } },
    { nome:'Vargens', foto:'reg-prainha', txt:'Casas e terrenos no verde, perto da Prainha e de Grumari.',
      en:{ txt:'Houses and lots among the green, near Prainha and Grumari.' } }
  ];

  var TIPO_NOME = EN
    ? { apartamento:'Apartment', cobertura:'Penthouse', casa:'House', sala:'Office unit', terreno:'Lot' }
    : { apartamento:'Apartamento', cobertura:'Cobertura', casa:'Casa', sala:'Sala comercial', terreno:'Terreno' };
  var SELO_EN = { 'Vista livre':'Open view', 'Condomínio':'Gated', 'Novo':'New', 'Mobiliado':'Furnished' };
  /* o nome da região é o valor do filtro; só o que aparece na tela muda */
  var REGIAO_EN = { 'Pontal e Macumba':'Pontal and Macumba' };
  function regiaoNome(r) { return EN && REGIAO_EN[r] ? REGIAO_EN[r] : r; }
  var MAX_COMP = 3;
  var comparando = [];
  /* seis por vez: doze cartões empilhados no celular viram uma parede */
  var POR_VEZ = 6, mostrando = POR_VEZ;

  var moeda = new Intl.NumberFormat(EN ? 'en-US' : 'pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });
  var R = function (v) { return moeda.format(v); };
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function porCod(cod) { return IMOVEIS.filter(function (i) { return i.cod === cod; })[0]; }
  function foto(im) { return 'assets/img/' + im.cod.toLowerCase() + '.webp'; }

  /* ---------- links de WhatsApp com mensagem por origem ---------- */
  $$('[data-zap]').forEach(function (a) {
    a.href = linkZap(a.getAttribute('data-zap'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- regiões: só as que têm imóvel ---------- */
  var contaRegiao = IMOVEIS.reduce(function (m, im) { m[im.regiao] = (m[im.regiao] || 0) + 1; return m; }, {});
  Object.keys(contaRegiao).sort().forEach(function (nome) {
    $$('[data-regioes]').forEach(function (sel) {
      var op = document.createElement('option');
      op.value = nome;
      op.textContent = regiaoNome(nome);
      sel.appendChild(op);
    });
  });

  var grade = $('#grade');
  var form = $('#filtros');
  var teto = $('#teto');
  var tetoAluguel = $('#tetoAluguel');
  var ordem = $('#ordem');

  /* ---------- cartão ---------- */
  function specsHtml(im) {
    var t = [];
    if (im.quartos) t.push('<span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-cama"/></svg>' + plural(im.quartos, T('quarto', 'bedroom'), T('quartos', 'bedrooms')) + '</span>');
    if (im.vagas) t.push('<span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-carro"/></svg>' + plural(im.vagas, T('vaga', 'parking space'), T('vagas', 'parking spaces')) + '</span>');
    t.push('<span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-area"/></svg>' + im.area + ' m²</span>');
    return t.join('');
  }

  function precoHtml(im) {
    if (im.fim === 'locacao') return R(im.preco) + '<small>' + T('por mês · condomínio ', 'per month · HOA ') + R(im.condominio) + '</small>';
    return R(im.preco) + '<small>' + (im.condominio ? T('condomínio ', 'HOA ') + R(im.condominio) + T(' · IPTU ', ' · property tax ') + R(im.iptu) : T('IPTU ', 'property tax ') + R(im.iptu)) + '</small>';
  }

  function cartao(im, i) {
    var art = document.createElement('article');
    var marcado = comparando.indexOf(im.cod) > -1;
    art.className = 'card' + (marcado ? ' comparando' : '');
    art.style.animationDelay = Math.min(i, 8) * 40 + 'ms';
    art.innerHTML =
      '<button type="button" class="card-foto" data-abre="' + im.cod + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + foto(im) + '" alt="" loading="lazy" width="960" height="720">' +
        '<span class="selo"><span class="s-' + im.fim + '">' + (im.fim === 'venda' ? T('Venda', 'For sale') : T('Aluguel', 'For rent')) + '</span>' +
          (im.selo ? '<span>' + (EN ? SELO_EN[im.selo] || im.selo : im.selo) + '</span>' : '') + '</span>' +
        
      '</button>' +
      '<div class="card-corpo">' +
        '<p class="card-regiao">' + TIPO_NOME[im.tipo] + ' · ' + regiaoNome(im.regiao) + '</p>' +
        '<h3><button type="button" data-abre="' + im.cod + '">' + L(im, 'titulo') + '</button></h3>' +
        '<div class="specs">' + specsHtml(im) + '</div>' +
        '<p class="preco">' + precoHtml(im) + '</p>' +
      '</div>' +
      '<div class="card-acoes">' +
        '<label class="comparar"><input type="checkbox"' + (marcado ? ' checked' : '') +
          (!marcado && comparando.length >= MAX_COMP ? ' disabled' : '') + '>' + T('Comparar', 'Compare') + '</label>' +
        '<button type="button" class="ver" data-abre="' + im.cod + '">' + T('Ver e simular →', 'View and simulate →') + '</button>' +
      '</div>';
    $('.comparar input', art).addEventListener('change', function () { alternaComp(im.cod); });
    return art;
  }

  /* ---------- filtro ---------- */
  function valor(nome) {
    var el = form.querySelector('[name="' + nome + '"]:checked') || form.querySelector('[name="' + nome + '"]');
    return el ? el.value : '';
  }

  function filtra() {
    var fim = valor('fim'), tipo = valor('tipo'), regiao = valor('regiao');
    var q = +valor('quartos') || 0, v = +valor('vagas') || 0;
    var lim = +teto.value, limA = +tetoAluguel.value;
    return IMOVEIS.filter(function (im) {
      if (fim && im.fim !== fim) return false;
      if (tipo && im.tipo !== tipo) return false;
      if (regiao && im.regiao !== regiao) return false;
      if (q && im.quartos < q) return false;
      if (v && im.vagas < v) return false;
      if (im.fim === 'venda' && im.preco > lim) return false;
      if (im.fim === 'locacao' && im.preco > limA) return false;
      return true;
    });
  }

  function ordena(l) {
    var m = ordem.value, c = l.slice();
    c.sort(function (a, b) {
      if (m === 'menor') return a.preco - b.preco;
      if (m === 'maior') return b.preco - a.preco;
      if (m === 'area') return b.area - a.area;
      return b.novo - a.novo;
    });
    return c;
  }

  function filtrosAtivos() {
    var n = 0;
    ['fim', 'tipo', 'regiao', 'quartos', 'vagas'].forEach(function (k) { if (valor(k)) n++; });
    if (+teto.value < +teto.max) n++;
    if (+tetoAluguel.value < +tetoAluguel.max) n++;
    return n;
  }

  function desenha() {
    var lista = ordena(filtra());
    grade.innerHTML = '';
    lista.slice(0, mostrando).forEach(function (im, i) { grade.appendChild(cartao(im, i)); });
    var resta = lista.length - mostrando;
    $('#maisImoveis').hidden = resta <= 0;
    $('#maisImoveis').textContent = T('Mostrar mais ', 'Show ') + plural(Math.min(resta, POR_VEZ), T('imóvel', 'more property'), T('imóveis', 'more properties'));
    $('#vazio').hidden = lista.length > 0;
    $('#contagem').innerHTML = lista.length === IMOVEIS.length
      ? '<b>' + lista.length + '</b> ' + T('imóveis', 'properties')
      : '<b>' + lista.length + '</b> ' + T('de ', 'of ') + IMOVEIS.length + ' ' + T('imóveis', 'properties');
    $('#tetoTxt').textContent = +teto.value >= +teto.max ? T('sem limite', 'no limit') : R(+teto.value);
    $('#aluguelTxt').textContent = +tetoAluguel.value >= +tetoAluguel.max ? T('sem limite', 'no limit') : R(+tetoAluguel.value);
    var n = filtrosAtivos();
    $('#filtrosN').textContent = n ? n : '';
    $('#verResultado').textContent = T('Ver ', 'See ') + plural(lista.length, T('imóvel', 'property'), T('imóveis', 'properties'));
    pintaComp();
  }

  function refiltra() { mostrando = POR_VEZ; desenha(); }
  form.addEventListener('input', refiltra);
  form.addEventListener('change', refiltra);
  ordem.addEventListener('change', refiltra);
  form.addEventListener('reset', function () { setTimeout(refiltra, 0); });
  $('#maisImoveis').addEventListener('click', function () { mostrando += POR_VEZ; desenha(); });
  $('#afrouxa').addEventListener('click', function () { form.reset(); setTimeout(desenha, 0); });
  $('#vazioZap').href = linkZap(T('Olá! Procuro um imóvel que não encontrei no site. Busco: ', "Hi! I'm looking for a property I didn't find on the website. I'm after: "));
  $('#vazioZap').target = '_blank';

  /* abrir um imóvel pela foto, título ou "ver" */
  grade.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abre]');
    if (b) abreImovel(b.getAttribute('data-abre'));
  });

  /* ---------- filtros como folha no celular ---------- */
  var painel = $('#painel'), abreF = $('#abreFiltros');
  function filtrosAbertos(sim) {
    painel.classList.toggle('aberto', sim);
    abreF.setAttribute('aria-expanded', sim ? 'true' : 'false');
    document.body.style.overflow = sim ? 'hidden' : '';
  }
  abreF.addEventListener('click', function () { filtrosAbertos(true); $('#fechaFiltros').focus(); });
  $('#fechaFiltros').addEventListener('click', function () { filtrosAbertos(false); abreF.focus(); });
  $('#verResultado').addEventListener('click', function () {
    filtrosAbertos(false);
    $('#imoveis .resultados').scrollIntoView({ behavior:'smooth', block:'start' });
  });

  /* ---------- comparador ---------- */
  function alternaComp(cod) {
    var i = comparando.indexOf(cod);
    if (i > -1) comparando.splice(i, 1);
    else if (comparando.length < MAX_COMP) comparando.push(cod);
    desenha();
  }

  function pintaComp() {
    var barra = $('#barraComp');
    barra.hidden = !comparando.length;
    if (!comparando.length) return;
    $('#compN').textContent = comparando.length;
    $('#compMinis').innerHTML = comparando.map(function (c) { return '<img src="' + foto(porCod(c)) + '" alt="">'; }).join('');
    var b = $('#abreComp');
    b.disabled = comparando.length < 2;
    b.textContent = comparando.length < 2 ? T('Marque mais um', 'Pick one more') : T('Comparar', 'Compare');
    $('#compZap').href = linkZap(T('Olá! Quero agendar visita nos imóveis ', "Hi! I'd like to book viewings of properties ") + comparando.join(', ') + T(' que vi no site.', ' from the website.'));
  }
  $('#limpaComp').addEventListener('click', function () { comparando = []; desenha(); });

  /* Melhor de cada linha em verde só quando "melhor" é objetivo
     (maior área, menor condomínio) e há um vencedor único. Preço
     fica sem marca: mais barato não é melhor entre imóveis diferentes. */
  function montaComp() {
    var itens = comparando.map(porCod);
    var linhas = [
      [T('Valor', 'Price'), function (im) { return '<b>' + R(im.preco) + (im.fim === 'locacao' ? T('/mês', '/month') : '') + '</b>'; }],
      [T('Região', 'Area'), function (im) { return regiaoNome(im.regiao); }],
      [T('Área', 'Size'), function (im) { return im.area + ' m²'; }, function (im) { return im.area; }, 'max'],
      [T('Quartos', 'Bedrooms'), function (im) { return im.quartos || T('não tem', 'none'); }, function (im) { return im.quartos; }, 'max'],
      [T('Suítes', 'Suites'), function (im) { return im.suites || T('não tem', 'none'); }, function (im) { return im.suites; }, 'max'],
      [T('Vagas', 'Parking'), function (im) { return im.vagas || T('não tem', 'none'); }, function (im) { return im.vagas; }, 'max'],
      [T('Condomínio', 'HOA fee'), function (im) { return R(im.condominio); }, function (im) { return im.condominio; }, 'min'],
      [T('IPTU mensal', 'Monthly property tax'), function (im) { return R(im.iptu); }, function (im) { return im.iptu; }, 'min'],
      [T('Valor por m²', 'Price per m²'), function (im) { return im.fim === 'venda' ? R(im.preco / im.area) : T('não se aplica', 'not applicable'); }]
    ];
    var h = '<table class="comp-tab"><thead><tr><th></th>' + itens.map(function (im) {
      return '<th><img src="' + foto(im) + '" alt=""><b>' + L(im, 'titulo') + '</b></th>';
    }).join('') + '</tr></thead><tbody>';
    linhas.forEach(function (l) {
      var alvo = -1;
      if (l[2]) {
        var vals = itens.map(l[2]);
        var m = l[3] === 'max' ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
        if (vals.filter(function (v) { return v === m; }).length === 1) alvo = vals.indexOf(m);
      }
      h += '<tr><th>' + l[0] + '</th>' + itens.map(function (im, i) {
        return '<td' + (i === alvo ? ' class="comp-melhor"' : '') + '>' + l[1](im) + '</td>';
      }).join('') + '</tr>';
    });
    $('#compCorpo').innerHTML = h + '</tbody></table>';
  }

  /* ---------- gavetas (detalhe e comparação) ---------- */
  var ultimoFoco = null;
  function abreGaveta(g) {
    ultimoFoco = document.activeElement;
    g.hidden = false;
    document.body.style.overflow = 'hidden';
    var f = g.querySelector('.fecha');
    if (f) f.focus({ preventScroll:true });
  }
  function fechaGavetas() {
    $$('.gaveta').forEach(function (g) { g.hidden = true; });
    document.body.style.overflow = '';
    if (ultimoFoco) ultimoFoco.focus({ preventScroll:true });
  }
  $$('.gaveta').forEach(function (g) {
    g.addEventListener('click', function (e) { if (e.target.closest('[data-fecha]')) fechaGavetas(); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (painel.classList.contains('aberto')) filtrosAbertos(false);
    else if ($$('.gaveta').some(function (g) { return !g.hidden; })) fechaGavetas();
  });
  $('#abreComp').addEventListener('click', function () {
    if (comparando.length < 2) return;
    montaComp();
    abreGaveta($('#modalComp'));
  });

  /* ---------- detalhe do imóvel + simulador ----------
     Tabela Price com os números que a própria pessoa escolhe.
     A taxa vem preenchida com um valor de referência editável e
     o texto diz isso: nada aqui é proposta de banco. */
  function abreImovel(cod) {
    var im = porCod(cod);
    if (!im) return;
    var venda = im.fim === 'venda';
    var h =
      '<div class="g-foto"><img src="' + foto(im) + '" alt="' + L(im, 'titulo') + '"></div>' +
      '<div class="g-corpo">' +
        '<p class="card-regiao">' + im.cod + ' · ' + TIPO_NOME[im.tipo] + ' · ' + regiaoNome(im.regiao) + ', ' + L(im, 'perto') + '</p>' +
        '<h2 id="gTitulo">' + L(im, 'titulo') + '</h2>' +
        '<p class="g-preco">' + R(im.preco) + (venda ? '' : ' <small>' + T('por mês', 'per month') + '</small>') + '</p>' +
        '<p class="g-custos">' + T('Condomínio ', 'HOA ') + R(im.condominio) + T(' · IPTU ', ' · property tax ') + R(im.iptu) + T(' por mês', ' per month') + '</p>' +
        '<div class="g-specs">' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-area"/></svg><b>' + im.area + ' m²</b><span>' + T('área', 'size') + '</span></div>' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-cama"/></svg><b>' + (im.quartos || 0) + '</b><span>' + (im.suites ? plural(im.suites, T('suíte', 'suite'), T('suítes', 'suites')) : T('quartos', 'bedrooms')) + '</span></div>' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-banho"/></svg><b>' + (im.banheiros || 0) + '</b><span>' + T('banheiros', 'bathrooms') + '</span></div>' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-carro"/></svg><b>' + (im.vagas || 0) + '</b><span>' + T('vagas', 'parking') + '</span></div>' +
        '</div>' +
        '<p class="g-desc">' + L(im, 'desc') + '</p>' +
        (venda ? simuladorHtml(im) : aluguelHtml(im)) +
        '<div class="g-acoes">' +
          '<a class="btn btn-sol btn-g" target="_blank" rel="noopener" href="' +
            linkZap(T('Olá! Vi o imóvel ' + im.cod + ' no site (' + im.titulo + ') e quero agendar uma visita.',
              'Hi! I saw property ' + im.cod + ' on the website (' + L(im, 'titulo') + ") and I'd like to book a viewing.")) + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-zap"/></svg>' + T('Agendar visita', 'Book a viewing') + '</a>' +
          '<button type="button" class="btn btn-linha btn-g" id="gComp">' +
            (comparando.indexOf(im.cod) > -1 ? T('Tirar da comparação', 'Remove from comparison') : T('Comparar com outros', 'Compare with others')) + '</button>' +
        '</div>' +
      '</div>';
    $('#gCorpo').innerHTML = h;
    $('#gaveta .gaveta-caixa').scrollTop = 0;
    if (venda) ligaSimulador(im);
    var gc = $('#gComp');
    if (!comparando.length || comparando.indexOf(im.cod) > -1 || comparando.length < MAX_COMP) {
      gc.addEventListener('click', function () {
        alternaComp(im.cod);
        /* a grade foi redesenhada: o foco antigo não existe mais */
        ultimoFoco = comparando.length ? $('#abreComp') : null;
        fechaGavetas();
      });
    } else {
      gc.disabled = true;
      gc.textContent = T('Comparação cheia (3)', 'Comparison full (3)');
    }
    abreGaveta($('#gaveta'));
  }

  function aluguelHtml(im) {
    var total = im.preco + im.condominio + im.iptu;
    return '<div class="simula"><h3>' + T('Quanto sai por mês', 'What it costs per month') + '</h3>' +
      '<p>' + T('Aluguel, condomínio e IPTU somados, para você comparar com o seu orçamento.', 'Rent, HOA fee and property tax added up, so you can compare with your budget.') + '</p>' +
      '<div class="sim-res"><div><span>' + T('Total mensal', 'Monthly total') + '</span><b>' + R(total) + '</b></div>' +
      '<div><span>' + T('Renda sugerida (3x o aluguel)', 'Suggested income (3x the rent)') + '</span><b>' + R(im.preco * 3) + '</b></div></div>' +
      '<p class="sim-nota">' + T('A exigência de renda e a garantia aceita variam por proprietário. Aceitamos fiador, seguro-fiança e título de capitalização.',
        'Income requirements and accepted guarantees vary by owner. We accept a guarantor, rent guarantee insurance or a capitalization bond.') + '</p></div>';
  }

  function simuladorHtml(im) {
    return '<div class="simula" id="simula">' +
      '<h3>' + T('Simule o financiamento', 'Simulate the mortgage') + '</h3>' +
      '<p>' + T('Mexa nos controles: a conta é feita com os números que você escolher.', 'Move the controls: the math uses the numbers you choose.') + '</p>' +
      '<div class="sim-linha"><label for="sEnt">' + T('Entrada', 'Down payment') + ' <b id="sEntTxt"></b></label>' +
        '<input type="range" id="sEnt" min="20" max="80" step="5" value="30"></div>' +
      '<div class="sim-linha"><label for="sPrazo">' + T('Prazo', 'Term') + ' <b id="sPrazoTxt"></b></label>' +
        '<input type="range" id="sPrazo" min="10" max="35" step="1" value="30"></div>' +
      '<div class="sim-linha"><label for="sTaxa">' + T('Juros ao ano', 'Annual interest') + '</label>' +
        '<div class="sim-taxa"><input type="number" id="sTaxa" min="1" max="25" step="0.1" value="11.5" inputmode="decimal"><span>' + T('% a.a. · troque pela taxa do seu banco', "% a year · use your bank's rate") + '</span></div></div>' +
      '<div class="sim-res">' +
        '<div><span>' + T('Parcela estimada', 'Estimated payment') + '</span><b id="sParc"></b></div>' +
        '<div><span>' + T('Valor financiado', 'Amount financed') + '</span><b id="sFin"></b></div>' +
      '</div>' +
      '<p class="sim-nota" id="sNota"></p>' +
    '</div>';
  }

  function ligaSimulador(im) {
    var ent = $('#sEnt'), prazo = $('#sPrazo'), taxa = $('#sTaxa');
    function calc() {
      var pEnt = +ent.value / 100;
      var anos = +prazo.value;
      var aa = Math.max(0, parseFloat(String(taxa.value).replace(',', '.')) || 0) / 100;
      var fin = im.preco * (1 - pEnt);
      var n = anos * 12;
      var i = Math.pow(1 + aa, 1 / 12) - 1;
      var parc = i ? fin * i / (1 - Math.pow(1 + i, -n)) : fin / n;
      $('#sEntTxt').textContent = ent.value + '% · ' + R(im.preco * pEnt);
      $('#sPrazoTxt').textContent = anos + T(' anos', ' years');
      $('#sParc').textContent = R(parc);
      $('#sFin').textContent = R(fin);
      $('#sNota').innerHTML = T('Tabela Price, sem seguros e taxas do banco. Pela regra comum de comprometer até 30% da renda, ' +
        'a parcela pede renda familiar a partir de <b>' + R(parc / 0.3) + '</b>. Não é proposta de crédito.',
        "Fixed-payment (Price) table, without the bank's insurance and fees. Under the usual rule of spending up to 30% of income, " +
        'this payment calls for a household income from <b>' + R(parc / 0.3) + '</b>. This is not a credit offer.');
    }
    [ent, prazo, taxa].forEach(function (el) { el.addEventListener('input', calc); });
    calc();
  }

  /* ---------- busca do hero escreve no painel ---------- */
  var busca = $('#busca'), fimHero = 'venda';
  $$('.aba', busca).forEach(function (aba) {
    aba.addEventListener('click', function () {
      $$('.aba', busca).forEach(function (o) { o.classList.remove('ativa'); o.setAttribute('aria-pressed', 'false'); });
      aba.classList.add('ativa');
      aba.setAttribute('aria-pressed', 'true');
      fimHero = aba.dataset.fim;
    });
  });
  function marca(nome, v) {
    var r = form.querySelector('[name="' + nome + '"][value="' + v + '"]');
    if (r) r.checked = true;
  }
  /* o botão diz quantos imóveis a busca vai trazer e o campo
     escolhido fica tingido: a pessoa vê que mexer muda alguma coisa */
  function previaBusca() {
    var d = new FormData(busca), q = +(d.get('quartos') || 0);
    var n = IMOVEIS.filter(function (im) {
      return im.fim === fimHero && (!d.get('tipo') || im.tipo === d.get('tipo')) &&
        (!d.get('regiao') || im.regiao === d.get('regiao')) && (!q || im.quartos >= q);
    }).length;
    $('#buscaTxt').textContent = n ? T('Ver ', 'See ') + plural(n, T('imóvel', 'property'), T('imóveis', 'properties')) : T('Buscar', 'Search');
    $$('.cb select', busca).forEach(function (s) { s.closest('.cb').classList.toggle('preenchido', !!s.value); });
  }
  busca.addEventListener('change', previaBusca);
  $$('.aba', busca).forEach(function (a) { a.addEventListener('click', previaBusca); });
  previaBusca();

  busca.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(busca);
    form.reset();
    marca('fim', fimHero);
    form.querySelector('[name="tipo"]').value = d.get('tipo') || '';
    form.querySelector('[name="regiao"]').value = d.get('regiao') || '';
    marca('quartos', d.get('quartos') || '');
    refiltra();
    $('#imoveis').scrollIntoView({ behavior:'smooth', block:'start' });
  });

  /* ---------- cartões de região ---------- */
  var rg = $('#regioesGrade');
  REGIOES.forEach(function (r) {
    var alvo = r.filtro || r.nome;
    var n = contaRegiao[alvo] || 0;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'regiao';
    b.innerHTML = '<img src="assets/img/' + r.foto + '.webp" alt="" loading="lazy" width="900" height="1100">' +
      '<span class="regiao-txt"><b class="regiao-nome">' + L(r, 'nome') + '</b><span class="regiao-p">' + L(r, 'txt') + '</span>' +
      '<em>' + (n ? T('Ver ', 'See ') + plural(n, T('imóvel', 'property'), T('imóveis', 'properties')) : T('Consultar', 'Ask us')) + ' →</em></span>';
    b.addEventListener('click', function () {
      /* sem imóvel na região: no site de verdade abria o WhatsApp. Aqui
         passa por um link #demo-cta, que o _demo.js intercepta com o aviso */
      if (!n) { var aviso = document.createElement('a'); aviso.href = '#demo-cta'; document.body.appendChild(aviso); aviso.click(); aviso.remove(); return; }
      form.reset();
      form.querySelector('[name="regiao"]').value = alvo;
      refiltra();
      $('#imoveis').scrollIntoView({ behavior:'smooth', block:'start' });
    });
    rg.appendChild(b);
  });

  desenha();

  /* ---------- avaliação em quatro passos ---------- */
  var wz = $('#wizard');
  var telas = $$('.wz-tela', wz);
  var resp = {};
  var passo = 0;
  var OBJ = EN
    ? { vender:'sell', alugar:'rent out', avaliar:'get a valuation of' }
    : { vender:'vender', alugar:'alugar', avaliar:'saber quanto vale' };
  /* os valores dos botões e das pílulas são o texto da mensagem em português */
  var TIPO_MSG_EN = { 'apartamento':'apartment', 'cobertura':'penthouse', 'casa':'house',
    'casa em condomínio':'house in a gated community', 'sala comercial':'office unit', 'terreno':'lot' };
  var HORA_EN = { 'de manhã':'in the morning', 'à tarde':'in the afternoon', 'à noite':'in the evening' };

  var andando = false;
  function vaiPara(p, foca) {
    passo = p;
    andando = false;
    telas.forEach(function (t, i) { t.classList.toggle('ativa', i === p); });
    $('#wzPasso').textContent = T('Passo ', 'Step ') + (p + 1) + T(' de 4', ' of 4');
    $('#wzBarra').style.width = ((p + 1) * 25) + '%';
    $('#wzVolta').hidden = p === 0;
    if (p === 3) montaMsg();
    if (foca) telas[p].querySelector('h3').focus({ preventScroll:true });
  }

  $$('.opcoes', wz).forEach(function (grupo) {
    grupo.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      /* dois toques rápidos não podem pular uma tela */
      if (!b || andando) return;
      andando = true;
      $$('button', grupo).forEach(function (o) { o.classList.toggle('sel', o === b); });
      resp[grupo.dataset.campo] = b.dataset.v;
      setTimeout(function () { vaiPara(passo + 1, true); }, 180);
    });
  });
  $('[data-segue]', wz).addEventListener('click', function () { vaiPara(3, true); });
  $('#wzVolta').addEventListener('click', function () { vaiPara(Math.max(0, passo - 1), true); });

  function montaMsg() {
    var v = function (n) {
      var el = wz.querySelector('[name="' + n + '"]:checked') || wz.querySelector('[name="' + n + '"]:not([type=radio])');
      return el ? el.value.trim() : '';
    };
    var nome = v('nome'), onde = v('onde'), area = v('area'), q = v('quartos'), hr = v('horario');
    var tipo = EN ? TIPO_MSG_EN[resp.tipo] || resp.tipo : resp.tipo;
    var linhas = [T('Olá! ', 'Hi! ') + (nome ? T('Sou ', "I'm ") + nome + '. ' : '') + T('Quero ', 'I want to ') + (OBJ[resp.objetivo] || T('avaliar', 'value')) + T(' meu imóvel.', ' my property.')];
    var det = [tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : ''];
    if (onde) det.push(onde);
    if (area) det.push(T('cerca de ', 'about ') + area + ' m²');
    if (q && q !== '0') det.push(EN ? (q === '5 ou mais' ? '5 or more' : q) + (q === '1' ? ' bedroom' : ' bedrooms') : q + (q === '1' ? ' quarto' : ' quartos'));
    linhas.push(det.filter(Boolean).join(', ') + '.');
    if (hr) linhas.push(T('Prefiro conversar ' + hr + '.', "I'd rather talk " + (HORA_EN[hr] || hr) + '.'));
    var msg = linhas.join('\n');
    $('#wzMsg').textContent = msg;
    $('#wzEnvia').href = linkZap(msg);
  }
  ['input', 'change'].forEach(function (ev) { wz.addEventListener(ev, function () { if (passo === 3) montaMsg(); }); });


  /* ---------- vídeo do hero ----------
     Só carrega depois que a página está de pé, nunca para quem
     pediu menos movimento ou está economizando dados, e pausa
     quando sai da tela. O pôster já é o primeiro quadro, então a
     troca é invisível. */
  var video = $('.hero-video');
  var poupa = (navigator.connection && navigator.connection.saveData) ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (video && !poupa) {
    var carrega = function () {
      video.src = matchMedia('(max-width:700px) and (orientation:portrait)').matches ? video.dataset.srcM : video.dataset.src;
      video.addEventListener('playing', function () { video.classList.add('pronto'); }, { once:true });
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { var q = video.play(); if (q && q.catch) q.catch(function () {}); } else video.pause(); });
        }).observe(video);
      }
    };
    if (document.readyState === 'complete') setTimeout(carrega, 300);
    else window.addEventListener('load', function () { setTimeout(carrega, 300); });
  }

  /* ---------- topo, menu, WhatsApp flutuante ---------- */
  var topo = $('#topo'), zapF = $('.zap-flutua');
  /* menu acompanha a rolagem: a seção atual é a última cujo topo já
     passou de 35% da tela. Seções fora do menu (como funciona,
     depoimentos, dúvidas) apagam o destaque em vez de emprestar o
     de outra, para o menu nunca apontar para o lugar errado. */
  var links = $$('#menu a[href^="#"]');
  var secoes = $$('main > section[id]');
  var atual = null;
  function marcaMenu() {
    var linha = window.innerHeight * .35, id = null;
    secoes.forEach(function (s) { if (s.getBoundingClientRect().top <= linha) id = s.id; });
    /* no fim da página o contato pode não chegar à linha */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = secoes[secoes.length - 1].id;
    if (id === atual) return;
    atual = id;
    links.forEach(function (a) {
      var sim = a.getAttribute('href') === '#' + id;
      a.classList.toggle('atual', sim);
      if (sim) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  var pedido = false;
  function rola() {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(function () {
      pedido = false;
      var y = window.scrollY;
      topo.classList.toggle('rolou', y > 30);
      zapF.classList.toggle('on', y > window.innerHeight * .7);
      marcaMenu();
    });
  }
  rola();
  window.addEventListener('scroll', rola, { passive:true });
  window.addEventListener('resize', rola);

  var abre = $('.abre-menu'), menu = $('#menu');
  abre.addEventListener('click', function () {
    var a = menu.classList.toggle('aberto');
    abre.setAttribute('aria-expanded', a ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); abre.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- entrada ao rolar ---------- */
  var alvos = $$('.cab, .regiao, .passos li, .sobre-foto, .sobre-txt, .vozes blockquote, .wizard, .avaliar-txt, .contato-txt, .mapa, .faq details');
  if ('IntersectionObserver' in window) {
    alvos.forEach(function (el) { el.classList.add('rv'); });
    var olho = new IntersectionObserver(function (es) {
      es.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('vis'); }, i * 60);
        olho.unobserve(e.target);
      });
    }, { threshold:.12, rootMargin:'0px 0px -6% 0px' });
    alvos.forEach(function (el) { olho.observe(el); });
  }
})();
