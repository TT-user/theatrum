/* ============================================================
   Vista Imóveis — comportamento da página
   O sistema tem três partes que conversam entre si:
   a busca do hero, o painel de filtros e o comparador.
   A busca do hero não é um formulário à parte: ela escreve
   nos mesmos controles do painel e rola até o catálogo, para
   não existirem dois estados de filtro discordando na tela.
   ============================================================ */
(function () {
  'use strict';

  var IMOVEIS = [
    { cod:'VI-2041', tipo:'apartamento', fim:'venda', bairro:'Granbery', quartos:3, suites:1, vagas:2, area:112,
      titulo:'Apartamento de 3 quartos com suíte e varanda gourmet', rua:'Rua Braz Bernardino',
      preco:895000, condominio:720, iptu:290, ano:2018, novo:12, selo:'' },
    { cod:'VI-2038', tipo:'apartamento', fim:'venda', bairro:'São Mateus', quartos:2, suites:1, vagas:1, area:78,
      titulo:'Apartamento de 2 quartos reformado, andar alto', rua:'Rua Santa Rita',
      preco:565000, condominio:480, iptu:180, ano:2012, novo:11, selo:'Reformado' },
    { cod:'VI-2035', tipo:'casa', fim:'venda', bairro:'Bom Pastor', quartos:4, suites:2, vagas:3, area:246,
      titulo:'Casa de 4 quartos com piscina e área gourmet', rua:'Rua Doutor Dirceu',
      preco:1350000, condominio:0, iptu:520, ano:2009, novo:10, selo:'' },
    { cod:'VI-2033', tipo:'cobertura', fim:'venda', bairro:'Alto dos Passos', quartos:3, suites:1, vagas:2, area:186,
      titulo:'Cobertura duplex com terraço e vista para a serra', rua:'Rua Osório de Almeida',
      preco:1180000, condominio:940, iptu:410, ano:2015, novo:9, selo:'Vista livre' },
    { cod:'VI-2030', tipo:'apartamento', fim:'locacao', bairro:'Centro', quartos:2, suites:0, vagas:1, area:66,
      titulo:'Apartamento de 2 quartos a duas quadras da Halfeld', rua:'Rua Batista de Oliveira',
      preco:1900, condominio:410, iptu:120, ano:2005, novo:8, selo:'' },
    { cod:'VI-2028', tipo:'sala', fim:'locacao', bairro:'Centro', quartos:0, suites:0, vagas:1, area:44,
      titulo:'Sala comercial mobiliada em prédio com portaria 24h', rua:'Avenida Rio Branco',
      preco:1650, condominio:530, iptu:150, ano:2011, novo:7, selo:'Mobiliada' },
    { cod:'VI-2026', tipo:'casa', fim:'locacao', bairro:'Santa Helena', quartos:3, suites:1, vagas:2, area:168,
      titulo:'Casa de 3 quartos com quintal e edícula', rua:'Rua Padre Café',
      preco:3400, condominio:0, iptu:260, ano:2001, novo:6, selo:'' },
    { cod:'VI-2024', tipo:'apartamento', fim:'venda', bairro:'Santa Helena', quartos:3, suites:1, vagas:2, area:104,
      titulo:'Apartamento de 3 quartos em prédio de 2021', rua:'Rua Marechal Deodoro',
      preco:780000, condominio:640, iptu:250, ano:2021, novo:5, selo:'Novo' },
    { cod:'VI-2021', tipo:'apartamento', fim:'locacao', bairro:'Granbery', quartos:1, suites:0, vagas:1, area:38,
      titulo:'Studio mobiliado ao lado do campus', rua:'Rua Halfeld',
      preco:1450, condominio:390, iptu:90, ano:2019, novo:4, selo:'Mobiliado' },
    { cod:'VI-2018', tipo:'terreno', fim:'venda', bairro:'Cascatinha', quartos:0, suites:0, vagas:0, area:480,
      titulo:'Terreno plano de 480 m² em condomínio fechado', rua:'Estrada da Cascatinha',
      preco:420000, condominio:380, iptu:140, ano:0, novo:3, selo:'' },
    { cod:'VI-2015', tipo:'casa', fim:'venda', bairro:'Cascatinha', quartos:4, suites:3, vagas:4, area:320,
      titulo:'Casa em condomínio, quatro suítes e piscina aquecida', rua:'Estrada da Cascatinha',
      preco:1480000, condominio:890, iptu:680, ano:2017, novo:2, selo:'Condomínio fechado' },
    { cod:'VI-2011', tipo:'apartamento', fim:'locacao', bairro:'Alto dos Passos', quartos:3, suites:1, vagas:2, area:98,
      titulo:'Apartamento de 3 quartos com dependência completa', rua:'Rua Antônio Dias',
      preco:2800, condominio:610, iptu:210, ano:2008, novo:1, selo:'' }
  ];

  var ZAP = '5532988880000';
  var MAX_COMP = 3;

  var grade = document.getElementById('grade');
  var form = document.getElementById('filtros');
  if (!grade || !form) return;

  var teto = document.getElementById('teto');
  var tetoAluguel = document.getElementById('tetoAluguel');
  var tetoRotulo = document.getElementById('tetoRotulo');
  var aluguelRotulo = document.getElementById('aluguelRotulo');
  var contagem = document.getElementById('contagem');
  var ordem = document.getElementById('ordem');
  var vazio = document.getElementById('vazio');
  var afrouxa = document.getElementById('afrouxa');
  var barraComp = document.getElementById('barraComp');
  var compCont = document.getElementById('compCont');
  var compCodigos = document.getElementById('compCodigos');
  var limpaComp = document.getElementById('limpaComp');
  var abreComp = document.getElementById('abreComp');
  var modal = document.getElementById('modal');
  var modalCorpo = document.getElementById('modalCorpo');
  var compZap = document.getElementById('compZap');
  var buscaHero = document.getElementById('buscaHero');
  var bairroHero = document.getElementById('bairroHero');
  var bairroFiltro = document.getElementById('bairroFiltro');
  var bairrosGrade = document.getElementById('bairrosGrade');

  var comparando = [];

  var moeda = new Intl.NumberFormat('pt-BR', {
    style:'currency', currency:'BRL', maximumFractionDigits:0
  });

  /* ---------- bairros vêm da carteira, não de uma lista à mão ----------
     Assim a página nunca oferece um filtro de bairro sem imóvel dentro,
     e a contagem de cada bairro fecha com o que a grade mostra. */
  var BAIRROS = IMOVEIS.reduce(function (mapa, im) {
    mapa[im.bairro] = (mapa[im.bairro] || 0) + 1;
    return mapa;
  }, {});
  var NOMES = Object.keys(BAIRROS).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

  NOMES.forEach(function (nome) {
    [bairroHero, bairroFiltro].forEach(function (sel) {
      var op = document.createElement('option');
      op.value = nome;
      op.textContent = nome + ' (' + BAIRROS[nome] + ')';
      sel.appendChild(op);
    });
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'bairro-item';
    botao.innerHTML = '<strong>' + nome + '</strong><em>' + BAIRROS[nome] +
      (BAIRROS[nome] > 1 ? ' imóveis' : ' imóvel') + '</em>';
    botao.addEventListener('click', function () {
      bairroFiltro.value = nome;
      desenha();
      document.getElementById('catalogo').scrollIntoView({ behavior:'smooth', block:'start' });
    });
    bairrosGrade.appendChild(botao);
  });

  /* ---------- formatação ---------- */
  function precoTexto(im) {
    return moeda.format(im.preco) +
      (im.fim === 'locacao'
        ? '<small>por mês + R$ ' + im.condominio + ' de condomínio</small>'
        : '<small>' + (im.condominio ? 'condomínio R$ ' + im.condominio : 'sem condomínio') + '</small>');
  }

  function specs(im) {
    var t = [];
    if (im.quartos) t.push(im.quartos + (im.quartos > 1 ? ' quartos' : ' quarto'));
    if (im.suites) t.push(im.suites + (im.suites > 1 ? ' suítes' : ' suíte'));
    if (im.vagas) t.push(im.vagas + (im.vagas > 1 ? ' vagas' : ' vaga'));
    t.push(im.area + ' m²');
    return t.map(function (x) { return '<span>' + x + '</span>'; }).join('');
  }

  function cartao(im) {
    var art = document.createElement('article');
    art.className = 'card' + (comparando.indexOf(im.cod) > -1 ? ' comparando' : '');
    var msg = 'Olá! Tenho interesse no imóvel ' + im.cod + ' (' + im.titulo + '). Podemos agendar uma visita?';
    art.innerHTML =
      '<div class="card-topo">' +
        '<figure class="foto" data-ph="img/' + im.cod.toLowerCase() + '.jpg · 1200×900">' +
          '<img src="img/' + im.cod.toLowerCase() + '.jpg" alt="' + im.titulo + ' na ' + im.rua + '">' +
        '</figure>' +
        '<span class="card-selo ' + im.fim + '">' + (im.fim === 'venda' ? 'Venda' : 'Locação') +
          (im.selo ? ' · ' + im.selo : '') + '</span>' +
      '</div>' +
      '<div class="card-corpo">' +
        '<span class="card-cod">' + im.cod + '</span>' +
        '<h3>' + im.titulo + '</h3>' +
        '<p class="card-bairro">' + im.rua + ' · ' + im.bairro + '</p>' +
        '<div class="card-specs">' + specs(im) + '</div>' +
        '<p class="card-preco">' + precoTexto(im) + '</p>' +
      '</div>' +
      '<div class="card-acoes">' +
        '<label class="comparar"><input type="checkbox"><span>Comparar</span></label>' +
        '<a class="card-zap" href="https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg) + '">Agendar visita</a>' +
      '</div>';

    var caixa = art.querySelector('.comparar input');
    caixa.checked = comparando.indexOf(im.cod) > -1;
    /* trava os não marcados ao bater o teto: é mais honesto do que
       aceitar o clique e depois avisar que não deu */
    caixa.disabled = !caixa.checked && comparando.length >= MAX_COMP;
    caixa.addEventListener('change', function () { alternaComp(im.cod); });
    return art;
  }

  function alternaComp(cod) {
    var i = comparando.indexOf(cod);
    if (i > -1) comparando.splice(i, 1);
    else if (comparando.length < MAX_COMP) comparando.push(cod);
    desenha();
  }

  function pintaComp() {
    if (!comparando.length) { barraComp.hidden = true; return; }
    barraComp.hidden = false;
    compCont.textContent = comparando.length;
    compCodigos.textContent = comparando.join(' · ');
    abreComp.disabled = comparando.length < 2;
    abreComp.textContent = comparando.length < 2 ? 'Escolha mais um para comparar' : 'Comparar lado a lado';
    var texto = 'Olá! Quero agendar visita nos imóveis ' + comparando.join(', ') + '.';
    compZap.setAttribute('href', 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(texto));
  }

  /* ---------- comparação ----------
     A tabela marca em verde o melhor de cada linha quando "melhor"
     é objetivo: maior área, menos condomínio. Preço fica sem marca,
     porque mais barato não é melhor quando os imóveis são diferentes. */
  function montaComparacao() {
    var itens = comparando.map(function (cod) {
      return IMOVEIS.filter(function (im) { return im.cod === cod; })[0];
    });

    var linhas = [
      ['Código',      function (im) { return im.cod; }, null],
      ['Finalidade',  function (im) { return im.fim === 'venda' ? 'Venda' : 'Locação'; }, null],
      ['Valor',       function (im) { return '<b>' + moeda.format(im.preco) + (im.fim === 'locacao' ? '/mês' : '') + '</b>'; }, null],
      ['Bairro',      function (im) { return im.bairro; }, null],
      ['Endereço',    function (im) { return im.rua; }, null],
      ['Área',        function (im) { return im.area + ' m²'; }, 'maior'],
      ['Quartos',     function (im) { return im.quartos || '—'; }, 'maior'],
      ['Suítes',      function (im) { return im.suites || '—'; }, 'maior'],
      ['Vagas',       function (im) { return im.vagas || '—'; }, 'maior'],
      ['Condomínio',  function (im) { return im.condominio ? moeda.format(im.condominio) : 'não tem'; }, 'menor'],
      ['IPTU mensal', function (im) { return moeda.format(im.iptu); }, 'menor'],
      ['Ano',         function (im) { return im.ano || '—'; }, null]
    ];

    var numero = {
      'Área':        function (im) { return im.area; },
      'Quartos':     function (im) { return im.quartos; },
      'Suítes':      function (im) { return im.suites; },
      'Vagas':       function (im) { return im.vagas; },
      'Condomínio':  function (im) { return im.condominio; },
      'IPTU mensal': function (im) { return im.iptu; }
    };

    var html = '<table class="comp-tabela"><thead><tr><th></th>' +
      itens.map(function (im) { return '<th>' + im.titulo + '</th>'; }).join('') +
      '</tr></thead><tbody>';

    linhas.forEach(function (l) {
      var rotulo = l[0], valor = l[1], criterio = l[2];
      var destaque = -1;
      if (criterio && numero[rotulo]) {
        var vals = itens.map(numero[rotulo]);
        /* condomínio zero é "não tem", o melhor caso possível — e o
           Math.min já o escolhe naturalmente, sem tratamento especial */
        var alvo = criterio === 'maior' ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
        /* só destaca se houver um vencedor único: marcar todos de verde
           num empate não informa nada */
        if (vals.filter(function (v) { return v === alvo; }).length === 1) destaque = vals.indexOf(alvo);
      }
      html += '<tr><th>' + rotulo + '</th>' + itens.map(function (im, i) {
        return '<td' + (i === destaque ? ' class="comp-melhor"' : '') + '>' + valor(im) + '</td>';
      }).join('') + '</tr>';
    });

    html += '</tbody></table>';
    modalCorpo.innerHTML = html;
  }

  function abreModal() {
    if (comparando.length < 2) return;
    montaComparacao();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function fechaModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  abreComp.addEventListener('click', abreModal);
  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-fecha') || e.target.closest('[data-fecha]')) fechaModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) fechaModal();
  });
  limpaComp.addEventListener('click', function () { comparando = []; desenha(); });

  /* ---------- filtro ---------- */
  function valorDe(nome) {
    var el = form.querySelector('[name="' + nome + '"]:checked') || form.querySelector('[name="' + nome + '"]');
    return el ? el.value : '';
  }

  function filtra() {
    var fim = valorDe('fim');
    var tipo = valorDe('tipo');
    var bairro = bairroFiltro.value;
    var quartos = parseInt(valorDe('quartos') || '0', 10);
    var vagas = parseInt(valorDe('vagas') || '0', 10);
    var limite = parseInt(teto.value, 10);
    var limiteAluguel = parseInt(tetoAluguel.value, 10);

    return IMOVEIS.filter(function (im) {
      if (fim && im.fim !== fim) return false;
      if (tipo && im.tipo !== tipo) return false;
      if (bairro && im.bairro !== bairro) return false;
      if (quartos && im.quartos < quartos) return false;
      if (vagas && im.vagas < vagas) return false;
      if (im.fim === 'venda' && im.preco > limite) return false;
      if (im.fim === 'locacao' && im.preco > limiteAluguel) return false;
      return true;
    });
  }

  function ordena(lista) {
    var modo = ordem.value;
    var c = lista.slice();
    if (modo === 'menor') c.sort(function (a, b) { return a.preco - b.preco; });
    else if (modo === 'maior') c.sort(function (a, b) { return b.preco - a.preco; });
    else if (modo === 'area') c.sort(function (a, b) { return b.area - a.area; });
    else c.sort(function (a, b) { return b.novo - a.novo; });
    return c;
  }

  function desenha() {
    var lista = ordena(filtra());
    grade.innerHTML = '';
    lista.forEach(function (im) { grade.appendChild(cartao(im)); });

    vazio.hidden = lista.length > 0;
    contagem.innerHTML = lista.length === IMOVEIS.length
      ? IMOVEIS.length + ' imóveis'
      : '<b>' + lista.length + '</b> de ' + IMOVEIS.length + (lista.length === 1 ? ' imóvel' : ' imóveis');

    tetoRotulo.textContent = moeda.format(parseInt(teto.value, 10));
    aluguelRotulo.textContent = moeda.format(parseInt(tetoAluguel.value, 10));
    pintaComp();
  }

  form.addEventListener('change', desenha);
  form.addEventListener('input', desenha);
  ordem.addEventListener('change', desenha);
  form.addEventListener('reset', function () { setTimeout(desenha, 0); });
  afrouxa.addEventListener('click', function () {
    form.reset();
    setTimeout(desenha, 0);
  });

  /* ---------- busca do hero escreve no painel ---------- */
  var abas = buscaHero.querySelectorAll('.aba');
  var fimHero = 'venda';
  abas.forEach(function (aba) {
    aba.addEventListener('click', function () {
      abas.forEach(function (o) { o.classList.remove('ativa'); o.setAttribute('aria-selected', 'false'); });
      aba.classList.add('ativa');
      aba.setAttribute('aria-selected', 'true');
      fimHero = aba.dataset.fim;
    });
  });

  buscaHero.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(buscaHero);
    var radioFim = form.querySelector('[name="fim"][value="' + fimHero + '"]');
    if (radioFim) radioFim.checked = true;
    form.querySelector('[name="tipo"]').value = d.get('tipo') || '';
    bairroFiltro.value = d.get('bairro') || '';
    var q = d.get('quartos') || '';
    var radioQ = form.querySelector('[name="quartos"][value="' + q + '"]');
    if (radioQ) radioQ.checked = true;
    desenha();
    document.getElementById('catalogo').scrollIntoView({ behavior:'smooth', block:'start' });
  });

  desenha();

  /* ---------- topo, menu, whatsapp, entrada ---------- */
  var topo = document.querySelector('.topo');
  function vigiaTopo() { topo.classList.toggle('rolou', window.scrollY > 24); }
  vigiaTopo();
  window.addEventListener('scroll', vigiaTopo, { passive:true });

  var abre = document.querySelector('.abre-menu');
  var menu = document.querySelector('.menu');
  abre.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    abre.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('aberto');
      abre.setAttribute('aria-expanded', 'false');
    }
  });

  var zap = document.querySelector('.whatsapp-float');
  function vigiaZap() { zap.classList.toggle('on', window.scrollY > window.innerHeight * 0.6); }
  vigiaZap();
  window.addEventListener('scroll', vigiaZap, { passive:true });

  var alvos = document.querySelectorAll('.cab, .servicos article, .equipe article, .vozes blockquote, .contato-cartao');
  alvos.forEach(function (el) { el.classList.add('rv'); });
  if ('IntersectionObserver' in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('vis'); }, i * 70);
        olho.unobserve(e.target);
      });
    }, { threshold:.18, rootMargin:'0px 0px -8% 0px' });
    alvos.forEach(function (el) { olho.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('vis'); });
  }
})();
