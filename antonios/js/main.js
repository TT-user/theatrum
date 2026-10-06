/* ============================================================
   Antonio's Corretagem · comportamento da prévia
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

  /* WhatsApp: ainda não confirmado. Por enquanto vai o fixo do
     cartão CNPJ, que pode ou não ter WhatsApp Business.
     Trocar aqui quando o cliente passar o número certo. */
  var ZAP = '552134188474';
  function linkZap(texto) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(texto); }

  /* ---------- carteira de EXEMPLO ----------
     Nada aqui é imóvel da Antonio's: os cartões levam o selo
     amarelo "exemplo". No site oficial esta lista vem da carteira
     real (planilha, JSON ou o CRM que eles usarem). */
  var IMOVEIS = [
    { cod:'AC-101', tipo:'apartamento', fim:'venda', regiao:'Recreio', quartos:3, suites:1, banheiros:2, vagas:2, area:105,
      titulo:'Apartamento de 3 quartos a duas quadras da praia', perto:'perto da Praia do Recreio',
      preco:1150000, condominio:1350, iptu:310, novo:12, selo:'',
      desc:'Sala em dois ambientes com varanda, cozinha planejada e suíte com closet. Condomínio com piscina, academia e portaria 24 horas.' },
    { cod:'AC-102', tipo:'cobertura', fim:'venda', regiao:'Recreio', quartos:3, suites:2, banheiros:3, vagas:2, area:190,
      titulo:'Cobertura duplex com terraço, piscina e churrasqueira', perto:'perto da Av. das Américas',
      preco:1890000, condominio:1900, iptu:520, novo:11, selo:'Vista livre',
      desc:'Terraço inteiro descoberto no segundo piso, com piscina e churrasqueira. Duas suítes e uma vaga coberta extra.' },
    { cod:'AC-103', tipo:'casa', fim:'venda', regiao:'Recreio', quartos:4, suites:4, banheiros:5, vagas:4, area:360,
      titulo:'Casa em condomínio fechado, quatro suítes e piscina', perto:'condomínio fechado no Recreio',
      preco:2950000, condominio:1650, iptu:780, novo:10, selo:'Condomínio',
      desc:'Casa em dois pavimentos com área gourmet integrada à piscina, quatro suítes e escritório. Condomínio com segurança e área verde.' },
    { cod:'AC-104', tipo:'apartamento', fim:'venda', regiao:'Barra da Tijuca', quartos:4, suites:2, banheiros:4, vagas:3, area:168,
      titulo:'Apartamento de 4 quartos em condomínio-clube', perto:'perto do Jardim Oceânico',
      preco:2380000, condominio:2400, iptu:690, novo:9, selo:'',
      desc:'Planta ampla com dependência, varanda gourmet e vista para a área de lazer. Condomínio-clube com quadras, piscinas e espaço kids.' },
    { cod:'AC-105', tipo:'apartamento', fim:'venda', regiao:'Pontal e Macumba', quartos:2, suites:1, banheiros:2, vagas:1, area:72,
      titulo:'Apartamento de 2 quartos novo, nunca habitado', perto:'perto da Praia do Pontal',
      preco:690000, condominio:820, iptu:180, novo:8, selo:'Novo',
      desc:'Porcelanato na área toda, varanda e infraestrutura para ar-condicionado. Prédio de 2024 com lazer completo.' },
    { cod:'AC-106', tipo:'casa', fim:'venda', regiao:'Vargens', quartos:3, suites:3, banheiros:4, vagas:3, area:280,
      titulo:'Casa térrea com piscina cercada de verde', perto:'Vargem Grande',
      preco:1680000, condominio:600, iptu:410, novo:7, selo:'',
      desc:'Casa térrea em terreno de 900 m², integrada ao jardim. Silêncio de serra a dez minutos da praia.' },
    { cod:'AC-107', tipo:'apartamento', fim:'locacao', regiao:'Pontal e Macumba', quartos:2, suites:1, banheiros:2, vagas:1, area:80,
      titulo:'Apartamento de 2 quartos mobiliado, pronto para morar', perto:'a uma quadra da Praia da Macumba',
      preco:4200, condominio:950, iptu:150, novo:6, selo:'Mobiliado',
      desc:'Mobiliado e equipado, com varanda e armários em todos os cômodos. Aceita seguro-fiança.' },
    { cod:'AC-108', tipo:'sala', fim:'locacao', regiao:'Recreio', quartos:0, suites:0, banheiros:1, vagas:1, area:38,
      titulo:'Sala comercial em centro empresarial da Av. das Américas', perto:'Av. das Américas',
      preco:2600, condominio:780, iptu:120, novo:5, selo:'',
      desc:'Sala com banheiro privativo e vaga rotativa, em prédio com recepção e controle de acesso.' },
    { cod:'AC-109', tipo:'apartamento', fim:'locacao', regiao:'Barra da Tijuca', quartos:1, suites:1, banheiros:1, vagas:1, area:46,
      titulo:'Studio com serviços, ao lado do BRT', perto:'perto do Terminal Alvorada',
      preco:3300, condominio:900, iptu:110, novo:4, selo:'Mobiliado',
      desc:'Studio mobiliado em prédio com lavanderia, coworking e piscina na cobertura.' },
    { cod:'AC-110', tipo:'casa', fim:'locacao', regiao:'Recreio', quartos:4, suites:2, banheiros:4, vagas:3, area:300,
      titulo:'Casa duplex em condomínio com piscina e gourmet', perto:'condomínio fechado no Recreio',
      preco:12500, condominio:1400, iptu:620, novo:3, selo:'Condomínio',
      desc:'Casa duplex com piscina, área gourmet e quarto de hóspedes no térreo.' },
    { cod:'AC-111', tipo:'terreno', fim:'venda', regiao:'Vargens', quartos:0, suites:0, banheiros:0, vagas:0, area:600,
      titulo:'Terreno plano de 600 m² em condomínio', perto:'Vargem Pequena',
      preco:520000, condominio:450, iptu:160, novo:2, selo:'',
      desc:'Terreno plano e regular, pronto para construir, em condomínio com portaria e ruas asfaltadas.' },
    { cod:'AC-112', tipo:'apartamento', fim:'venda', regiao:'Barra da Tijuca', quartos:3, suites:1, banheiros:2, vagas:2, area:120,
      titulo:'Apartamento de 3 quartos com vista para a lagoa', perto:'perto da Lagoa de Marapendi',
      preco:1420000, condominio:1700, iptu:400, novo:1, selo:'Vista livre',
      desc:'Sala com janelão para a lagoa e a serra, cozinha aberta e suíte ampla. Andar alto, sol da manhã.' }
  ];

  var REGIOES = [
    { nome:'Recreio', foto:'reg-recreio-praia', txt:'Praia, ciclovia e condomínios novos. Onde fica o escritório.' },
    { nome:'Barra da Tijuca', foto:'reg-barra', txt:'Condomínios-clube, orla extensa e acesso fácil ao resto da cidade.' },
    { nome:'Pontal e Macumba', foto:'reg-pontal-macumba', txt:'O fim do Recreio: mar aberto, surfe e prédios baixos.' },
    { nome:'Vargens', foto:'reg-prainha', txt:'Casas e terrenos no verde, perto da Prainha e de Grumari.' }
  ];

  var TIPO_NOME = { apartamento:'Apartamento', cobertura:'Cobertura', casa:'Casa', sala:'Sala comercial', terreno:'Terreno' };
  var MAX_COMP = 3;
  var comparando = [];
  /* seis por vez: doze cartões empilhados no celular viram uma parede */
  var POR_VEZ = 6, mostrando = POR_VEZ;

  var moeda = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });
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
      op.textContent = nome;
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
    if (im.quartos) t.push('<span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-cama"/></svg>' + im.quartos + (im.quartos > 1 ? ' quartos' : ' quarto') + '</span>');
    if (im.vagas) t.push('<span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-carro"/></svg>' + im.vagas + (im.vagas > 1 ? ' vagas' : ' vaga') + '</span>');
    t.push('<span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-area"/></svg>' + im.area + ' m²</span>');
    return t.join('');
  }

  function precoHtml(im) {
    if (im.fim === 'locacao') return R(im.preco) + '<small>por mês · condomínio ' + R(im.condominio) + '</small>';
    return R(im.preco) + '<small>' + (im.condominio ? 'condomínio ' + R(im.condominio) + ' · IPTU ' + R(im.iptu) : 'IPTU ' + R(im.iptu)) + '</small>';
  }

  function cartao(im, i) {
    var art = document.createElement('article');
    var marcado = comparando.indexOf(im.cod) > -1;
    art.className = 'card' + (marcado ? ' comparando' : '');
    art.style.animationDelay = Math.min(i, 8) * 40 + 'ms';
    art.innerHTML =
      '<button type="button" class="card-foto" data-abre="' + im.cod + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + foto(im) + '" alt="" loading="lazy" width="960" height="720">' +
        '<span class="selo"><span class="s-' + im.fim + '">' + (im.fim === 'venda' ? 'Venda' : 'Aluguel') + '</span>' +
          (im.selo ? '<span>' + im.selo + '</span>' : '') + '</span>' +
        '<span class="exemplo">exemplo</span>' +
      '</button>' +
      '<div class="card-corpo">' +
        '<p class="card-regiao">' + TIPO_NOME[im.tipo] + ' · ' + im.regiao + '</p>' +
        '<h3><button type="button" data-abre="' + im.cod + '">' + im.titulo + '</button></h3>' +
        '<div class="specs">' + specsHtml(im) + '</div>' +
        '<p class="preco">' + precoHtml(im) + '</p>' +
      '</div>' +
      '<div class="card-acoes">' +
        '<label class="comparar"><input type="checkbox"' + (marcado ? ' checked' : '') +
          (!marcado && comparando.length >= MAX_COMP ? ' disabled' : '') + '>Comparar</label>' +
        '<button type="button" class="ver" data-abre="' + im.cod + '">Ver e simular →</button>' +
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
    $('#maisImoveis').textContent = 'Mostrar mais ' + Math.min(resta, POR_VEZ) + (Math.min(resta, POR_VEZ) === 1 ? ' imóvel' : ' imóveis');
    $('#vazio').hidden = lista.length > 0;
    $('#contagem').innerHTML = lista.length === IMOVEIS.length
      ? '<b>' + lista.length + '</b> imóveis'
      : '<b>' + lista.length + '</b> de ' + IMOVEIS.length + ' imóveis';
    $('#tetoTxt').textContent = +teto.value >= +teto.max ? 'sem limite' : R(+teto.value);
    $('#aluguelTxt').textContent = +tetoAluguel.value >= +tetoAluguel.max ? 'sem limite' : R(+tetoAluguel.value);
    var n = filtrosAtivos();
    $('#filtrosN').textContent = n ? n : '';
    $('#verResultado').textContent = 'Ver ' + lista.length + (lista.length === 1 ? ' imóvel' : ' imóveis');
    pintaComp();
  }

  function refiltra() { mostrando = POR_VEZ; desenha(); }
  form.addEventListener('input', refiltra);
  form.addEventListener('change', refiltra);
  ordem.addEventListener('change', refiltra);
  form.addEventListener('reset', function () { setTimeout(refiltra, 0); });
  $('#maisImoveis').addEventListener('click', function () { mostrando += POR_VEZ; desenha(); });
  $('#afrouxa').addEventListener('click', function () { form.reset(); setTimeout(desenha, 0); });
  $('#vazioZap').href = linkZap('Olá! Procuro um imóvel que não encontrei no site. Busco: ');
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
    b.textContent = comparando.length < 2 ? 'Marque mais um' : 'Comparar';
    $('#compZap').href = linkZap('Olá! Quero agendar visita nos imóveis ' + comparando.join(', ') + ' que vi no site.');
  }
  $('#limpaComp').addEventListener('click', function () { comparando = []; desenha(); });

  /* Melhor de cada linha em verde só quando "melhor" é objetivo
     (maior área, menor condomínio) e há um vencedor único. Preço
     fica sem marca: mais barato não é melhor entre imóveis diferentes. */
  function montaComp() {
    var itens = comparando.map(porCod);
    var linhas = [
      ['Valor', function (im) { return '<b>' + R(im.preco) + (im.fim === 'locacao' ? '/mês' : '') + '</b>'; }],
      ['Região', function (im) { return im.regiao; }],
      ['Área', function (im) { return im.area + ' m²'; }, function (im) { return im.area; }, 'max'],
      ['Quartos', function (im) { return im.quartos || 'não tem'; }, function (im) { return im.quartos; }, 'max'],
      ['Suítes', function (im) { return im.suites || 'não tem'; }, function (im) { return im.suites; }, 'max'],
      ['Vagas', function (im) { return im.vagas || 'não tem'; }, function (im) { return im.vagas; }, 'max'],
      ['Condomínio', function (im) { return R(im.condominio); }, function (im) { return im.condominio; }, 'min'],
      ['IPTU mensal', function (im) { return R(im.iptu); }, function (im) { return im.iptu; }, 'min'],
      ['Valor por m²', function (im) { return im.fim === 'venda' ? R(im.preco / im.area) : 'não se aplica'; }]
    ];
    var h = '<table class="comp-tab"><thead><tr><th></th>' + itens.map(function (im) {
      return '<th><img src="' + foto(im) + '" alt=""><b>' + im.titulo + '</b></th>';
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
      '<div class="g-foto"><img src="' + foto(im) + '" alt="' + im.titulo + '"><span class="exemplo">imóvel de exemplo</span></div>' +
      '<div class="g-corpo">' +
        '<p class="card-regiao">' + im.cod + ' · ' + TIPO_NOME[im.tipo] + ' · ' + im.regiao + ', ' + im.perto + '</p>' +
        '<h2 id="gTitulo">' + im.titulo + '</h2>' +
        '<p class="g-preco">' + R(im.preco) + (venda ? '' : ' <small>por mês</small>') + '</p>' +
        '<p class="g-custos">Condomínio ' + R(im.condominio) + ' · IPTU ' + R(im.iptu) + ' por mês</p>' +
        '<div class="g-specs">' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-area"/></svg><b>' + im.area + ' m²</b><span>área</span></div>' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-cama"/></svg><b>' + (im.quartos || 0) + '</b><span>' + (im.suites ? im.suites + (im.suites > 1 ? ' suítes' : ' suíte') : 'quartos') + '</span></div>' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-banho"/></svg><b>' + (im.banheiros || 0) + '</b><span>banheiros</span></div>' +
          '<div><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-carro"/></svg><b>' + (im.vagas || 0) + '</b><span>vagas</span></div>' +
        '</div>' +
        '<p class="g-desc">' + im.desc + '</p>' +
        (venda ? simuladorHtml(im) : aluguelHtml(im)) +
        '<div class="g-acoes">' +
          '<a class="btn btn-sol btn-g" target="_blank" rel="noopener" href="' +
            linkZap('Olá! Vi o imóvel ' + im.cod + ' no site (' + im.titulo + ') e quero agendar uma visita.') + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-zap"/></svg>Agendar visita</a>' +
          '<button type="button" class="btn btn-linha btn-g" id="gComp">' +
            (comparando.indexOf(im.cod) > -1 ? 'Tirar da comparação' : 'Comparar com outros') + '</button>' +
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
      gc.textContent = 'Comparação cheia (3)';
    }
    abreGaveta($('#gaveta'));
  }

  function aluguelHtml(im) {
    var total = im.preco + im.condominio + im.iptu;
    return '<div class="simula"><h3>Quanto sai por mês</h3>' +
      '<p>Aluguel, condomínio e IPTU somados, para você comparar com o seu orçamento.</p>' +
      '<div class="sim-res"><div><span>Total mensal</span><b>' + R(total) + '</b></div>' +
      '<div><span>Renda sugerida (3x o aluguel)</span><b>' + R(im.preco * 3) + '</b></div></div>' +
      '<p class="sim-nota">A exigência de renda e a garantia aceita variam por proprietário. <span class="ph">[confirmar as garantias aceitas]</span></p></div>';
  }

  function simuladorHtml(im) {
    return '<div class="simula" id="simula">' +
      '<h3>Simule o financiamento</h3>' +
      '<p>Mexa nos controles: a conta é feita com os números que você escolher.</p>' +
      '<div class="sim-linha"><label for="sEnt">Entrada <b id="sEntTxt"></b></label>' +
        '<input type="range" id="sEnt" min="20" max="80" step="5" value="30"></div>' +
      '<div class="sim-linha"><label for="sPrazo">Prazo <b id="sPrazoTxt"></b></label>' +
        '<input type="range" id="sPrazo" min="10" max="35" step="1" value="30"></div>' +
      '<div class="sim-linha"><label for="sTaxa">Juros ao ano</label>' +
        '<div class="sim-taxa"><input type="number" id="sTaxa" min="1" max="25" step="0.1" value="11.5" inputmode="decimal"><span>% a.a. · troque pela taxa do seu banco</span></div></div>' +
      '<div class="sim-res">' +
        '<div><span>Parcela estimada</span><b id="sParc"></b></div>' +
        '<div><span>Valor financiado</span><b id="sFin"></b></div>' +
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
      $('#sPrazoTxt').textContent = anos + ' anos';
      $('#sParc').textContent = R(parc);
      $('#sFin').textContent = R(fin);
      $('#sNota').innerHTML = 'Tabela Price, sem seguros e taxas do banco. Pela regra comum de comprometer até 30% da renda, ' +
        'a parcela pede renda familiar a partir de <b>' + R(parc / 0.3) + '</b>. Não é proposta de crédito.';
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
      '<span class="regiao-txt"><b class="regiao-nome">' + r.nome + '</b><span class="regiao-p">' + r.txt + '</span>' +
      '<em>' + (n ? 'Ver ' + n + (n > 1 ? ' imóveis' : ' imóvel') : 'Consultar') + ' →</em></span>';
    b.addEventListener('click', function () {
      if (!n) { window.open(linkZap('Olá! Procuro imóvel em ' + r.nome + '.'), '_blank', 'noopener'); return; }
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
  var OBJ = { vender:'vender', alugar:'alugar', avaliar:'saber quanto vale' };

  var andando = false;
  function vaiPara(p, foca) {
    passo = p;
    andando = false;
    telas.forEach(function (t, i) { t.classList.toggle('ativa', i === p); });
    $('#wzPasso').textContent = 'Passo ' + (p + 1) + ' de 4';
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
    var v = function (n) { var el = wz.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
    var nome = v('nome'), onde = v('onde'), area = v('area'), q = v('quartos'), hr = v('horario');
    var linhas = ['Olá! ' + (nome ? 'Sou ' + nome + '. ' : '') + 'Quero ' + (OBJ[resp.objetivo] || 'avaliar') + ' meu imóvel.'];
    var det = [resp.tipo ? resp.tipo.charAt(0).toUpperCase() + resp.tipo.slice(1) : ''];
    if (onde) det.push(onde);
    if (area) det.push('cerca de ' + area + ' m²');
    if (q && q !== '0') det.push(q + (q === '1' ? ' quarto' : ' quartos'));
    linhas.push(det.filter(Boolean).join(', ') + '.');
    if (hr) linhas.push('Prefiro conversar ' + hr + '.');
    var msg = linhas.join('\n');
    $('#wzMsg').textContent = msg;
    $('#wzEnvia').href = linkZap(msg);
  }
  $$('input,select', wz).forEach(function (el) { el.addEventListener('input', function () { if (passo === 3) montaMsg(); }); });

  /* ---------- mapa só quando pedido ----------
     O iframe do Google pesa mais que a página inteira; entra no
     clique, não no carregamento. */
  $('#mapaAbre').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Av. das Américas, 15015, Recreio dos Bandeirantes, Rio de Janeiro, RJ') + '&output=embed';
    f.title = 'Mapa do escritório da Antonio\'s na Av. das Américas';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    $('#mapa').innerHTML = '';
    $('#mapa').appendChild(f);
  });

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
  function rola() {
    var y = window.scrollY;
    topo.classList.toggle('rolou', y > 30);
    zapF.classList.toggle('on', y > window.innerHeight * .7);
  }
  rola();
  window.addEventListener('scroll', rola, { passive:true });

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
