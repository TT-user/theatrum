(function () {
  'use strict';

  // WhatsApp da THS (do Linktree deles)
  var ZAP = '5533984116320';
  function zap(msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); }

  document.querySelectorAll('[data-zap]').forEach(function (a) {
    a.href = zap(a.getAttribute('data-zap'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Menu do celular
  var menu = document.getElementById('menu');
  var menuBtn = document.getElementById('menu-btn');
  menuBtn.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    menuBtn.setAttribute('aria-expanded', aberto);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  // Galeria de obras
  var OBRAS = [
    { f: 'altura', w: 562, h: 546, c: 'estrutura', t: 'Montagem de estrutura metálica em altura' },
    { f: 'galpao-silos', w: 562, h: 556, c: 'galpao', t: 'Galpão com cobertura em arco e piso concluído' },
    { f: 'armadura', w: 562, h: 586, c: 'base', t: 'Armadura da sapata antes da concretagem' },
    { f: 'fachada', w: 562, h: 626, c: 'acabamento', t: 'Fachada comercial na reta final' },
    { f: 'escavadeira', w: 562, h: 656, c: 'base', t: 'Escavação da fundação' },
    { f: 'pilares', w: 516, h: 476, c: 'estrutura', t: 'Pilares e formas da estrutura' },
    { f: 'acabamento', w: 562, h: 506, c: 'acabamento', t: 'Área externa com acabamento entregue' },
    { f: 'contencao', w: 562, h: 536, c: 'base', t: 'Contenção e formas no subsolo' },
    { f: 'paredes-andaime', w: 562, h: 606, c: 'galpao', t: 'Paredes pré-moldadas do galpão' },
    { f: 'laje', w: 562, h: 480, c: 'estrutura', t: 'Armação da laje' },
    { f: 'bueiro-gabiao', w: 562, h: 526, c: 'base', t: 'Bueiro com gabião para drenagem' },
    { f: 'baldrame-galpao', w: 562, h: 496, c: 'galpao', t: 'Baldrames dentro do galpão' },
    { f: 'pilar-guindaste', w: 562, h: 500, c: 'estrutura', t: 'Içamento de pilar pré-moldado' },
    { f: 'arranque', w: 562, h: 342, c: 'base', t: 'Arranque do pilar na fundação' },
    { f: 'galpao-gabiao', w: 562, h: 314, c: 'galpao', t: 'Gabião no interior do galpão' },
    { f: 'eps-estrutura', w: 562, h: 360, c: 'estrutura', t: 'Obra em EPS com estrutura aparente' }
  ];
  var galeria = document.getElementById('galeria');
  var visiveis = OBRAS.slice();

  function desenhaGaleria(cat) {
    visiveis = OBRAS.filter(function (o) { return cat === 'todas' || o.c === cat; });
    galeria.innerHTML = visiveis.map(function (o, i) {
      return '<button type="button" data-i="' + i + '" aria-label="Ampliar: ' + o.t + '">' +
        '<img loading="lazy" src="assets/fotos/' + o.f + '.webp" width="' + o.w + '" height="' + o.h + '" alt="' + o.t + '">' +
        '<span>' + o.t + '</span></button>';
    }).join('');
  }
  desenhaGaleria('todas');

  document.getElementById('filtros').addEventListener('click', function (e) {
    var b = e.target.closest('.filtro');
    if (!b) return;
    document.querySelectorAll('.filtro').forEach(function (x) {
      var on = x === b;
      x.classList.toggle('on', on);
      x.setAttribute('aria-selected', on);
    });
    desenhaGaleria(b.getAttribute('data-f'));
  });

  // Lightbox
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var atual = 0, origem = null;
  function mostra(i) {
    atual = (i + visiveis.length) % visiveis.length;
    var o = visiveis[atual];
    lbImg.src = 'assets/fotos/' + o.f + '.webp';
    lbImg.alt = o.t;
    lbCap.textContent = o.t;
  }
  galeria.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    origem = b;
    mostra(+b.getAttribute('data-i'));
    lb.hidden = false;
    document.getElementById('lb-x').focus();
  });
  function fecha() { lb.hidden = true; if (origem) origem.focus(); }
  document.getElementById('lb-x').addEventListener('click', fecha);
  document.getElementById('lb-ant').addEventListener('click', function () { mostra(atual - 1); });
  document.getElementById('lb-prox').addEventListener('click', function () { mostra(atual + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecha(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowLeft') mostra(atual - 1);
    if (e.key === 'ArrowRight') mostra(atual + 1);
  });

  // Por onde começar: três perguntas que montam a mensagem do WhatsApp
  var PERGUNTAS = [
    { t: 'Que obra é?', ops: [
      ['Casa', 'residência, sobrado'], ['Comercial', 'loja, sala, prédio'],
      ['Galpão ou indústria', 'armazém, fábrica'], ['Rural', 'fazenda, terraplenagem, estrada']
    ] },
    { t: 'Em que pé está?', ops: [
      ['Só tenho o terreno', 'ainda não há projeto'], ['Já tenho o projeto', 'falta construir'],
      ['A obra já começou', 'ou está parada'], ['Reforma ou ampliação', 'de algo que já existe']
    ] },
    { t: 'Do que você precisa?', ops: [
      ['Projeto', 'arquitetônico, estrutural, instalações'], ['Administração', 'eu contrato, a THS gerencia'],
      ['Execução completa', 'do início à entrega'], ['Ainda não sei', 'quero uma orientação']
    ] }
  ];
  var quiz = document.getElementById('quiz');
  var resp = [];

  function barra(n) {
    var s = '';
    for (var i = 0; i < 3; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
    return '<div class="quiz__barra">' + s + '</div>';
  }

  function indicacao() {
    var fase = resp[1], quer = resp[2];
    if (quer === 'Ainda não sei') {
      if (fase === 'Só tenho o terreno') return 'Comece por uma <b>visita ao terreno</b>: é ela que diz o tamanho da fundação e o custo da terraplenagem.';
      if (fase === 'A obra já começou') return 'Comece por uma <b>vistoria da obra</b>: ver o que já foi feito antes de decidir o próximo passo.';
      return 'Comece por uma <b>conversa com o engenheiro</b>: em poucos minutos dá para saber se o caminho é projeto, administração ou execução.';
    }
    if (quer === 'Projeto' && fase === 'Já tenho o projeto') return 'Você já tem projeto: a THS pode <b>revisar e completar</b> o que faltar (estrutural, fundação, instalações) antes da obra.';
    if (quer === 'Administração') return 'Na <b>administração</b>, você contrata e paga direto; a THS cuida do cronograma, das compras e das equipes.';
    if (quer === 'Execução completa') return 'Na <b>execução completa</b>, a THS responde pela obra inteira, do canteiro à entrega das chaves.';
    return 'O <b>projeto</b> é onde a obra fica mais barata de mudar. Tudo o que for decidido agora não vira retrabalho depois.';
  }

  function render(passo) {
    if (passo < 3) {
      var p = PERGUNTAS[passo];
      quiz.innerHTML = '<p class="quiz__passo">Pergunta ' + (passo + 1) + ' de 3</p>' + barra(passo) +
        '<h3>' + p.t + '</h3><div class="quiz__ops">' +
        p.ops.map(function (o) { return '<button type="button" class="quiz__op" data-v="' + o[0] + '">' + o[0] + '<small>' + o[1] + '</small></button>'; }).join('') +
        '</div>' + (passo ? '<button type="button" class="quiz__voltar" data-voltar>← voltar</button>' : '');
      quiz.querySelectorAll('.quiz__op').forEach(function (b) {
        b.addEventListener('click', function () { resp[passo] = b.getAttribute('data-v'); render(passo + 1); });
      });
    } else {
      var msg = 'Olá! Vim pelo site da THS.\n' +
        '• Obra: ' + resp[0] + '\n' +
        '• Situação: ' + resp[1] + '\n' +
        '• Preciso de: ' + resp[2] + '\n' +
        'Pode me ajudar com um orçamento?';
      quiz.innerHTML = '<p class="quiz__passo">Pronto</p>' + barra(2) +
        '<h3>' + resp[0] + ' · ' + resp[2] + '</h3>' +
        '<div class="quiz__res">' + indicacao() + '</div>' +
        '<p class="quiz__msg">A mensagem já vai escrita: ' + resp[0].toLowerCase() + ', ' + resp[1].toLowerCase() + ', ' + resp[2].toLowerCase() + '.</p>' +
        '<a class="btn btn--laranja" target="_blank" rel="noopener" href="' + zap(msg) + '"><svg aria-hidden="true"><use href="#i-zap"/></svg>Enviar no WhatsApp</a>' +
        '<br><button type="button" class="quiz__voltar" data-recomeca>↺ responder de novo</button>';
      quiz.querySelector('[data-recomeca]').addEventListener('click', function () { resp = []; render(0); });
    }
    var v = quiz.querySelector('[data-voltar]');
    if (v) v.addEventListener('click', function () { render(passo - 1); });
  }
  render(0);

  // Mapa só carrega no clique
  document.getElementById('mapa-btn').addEventListener('click', function () {
    var m = document.getElementById('mapa');
    m.innerHTML = '<iframe title="Escritório da THS no mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' +
      encodeURIComponent('Rua Desembargador Alonso Starling, 220, Centro, Manhuaçu, MG') + '&output=embed"></iframe>';
  });

  // Menu destaca a seção à vista
  if ('IntersectionObserver' in window) {
    var links = {};
    menu.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.toggle('ativo', k === e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
