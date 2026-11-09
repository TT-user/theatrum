(function () {
  'use strict';
  var C = window.BC || {};
  var V = '?v=1'; // mudou um JSON, sobe o número

  // Texto entre colchetes vira placeholder amarelo
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function txt(s) { return esc(s).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>'); }

  function zap(msg) { return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg); }

  // Configurações: só troca o placeholder quando há valor
  document.querySelectorAll('[data-cfg]').forEach(function (el) {
    var v = C[el.getAttribute('data-cfg')];
    if (v) el.textContent = v;
  });
  if (C.ligar) document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = 'tel:' + C.ligar; });

  // WhatsApp com mensagem por origem
  function ligarZap(root) {
    root.querySelectorAll('[data-zap]').forEach(function (a) {
      a.href = zap(a.getAttribute('data-zap'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  ligarZap(document);

  // Mapa: só com link do perfil no Google; sem ele, leva à seção da loja
  var mapa = document.querySelector('[data-mapa]');
  if (mapa) {
    if (C.mapa) { mapa.href = C.mapa; mapa.target = '_blank'; mapa.rel = 'noopener'; }
    else { mapa.href = '#loja'; mapa.insertAdjacentHTML('beforeend', ' <span class="ph">[link do Maps]</span>'); }
  }

  // Áreas atendidas
  var areas = document.getElementById('areas');
  if (areas && C.areas && C.areas.length) {
    areas.innerHTML = C.areas.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('');
  }

  // Serviços
  var lista = document.getElementById('lista-servicos');
  fetch('data/servicos.json' + V).then(function (r) { return r.json(); }).then(function (d) {
    lista.innerHTML = d.servicos.map(function (s) {
      var msg = 'Vim pelo site. *Preciso de:* ' + s.pedido + '\n*Onde estou:* ';
      return '<article class="servico' + (s.urgente ? ' servico--urgente' : '') + '">' +
        '<span class="servico__ic"><svg aria-hidden="true"><use href="#' + esc(s.icone) + '"/></svg></span>' +
        '<div class="servico__txt"><h3>' + txt(s.titulo) + '</h3><p>' + txt(s.texto) + '</p></div>' +
        '<div class="servico__acoes">' +
          (s.link ? '<a class="btn btn--preto btn--peq" href="' + esc(s.link) + '">Montar o pedido</a>'
                  : '<a class="btn btn--preto btn--peq" href="#" data-zap="' + esc(msg) + '"><svg aria-hidden="true"><use href="#i-zap"/></svg>Chamar</a>') +
          (s.urgente ? '<a class="btn btn--linha btn--peq" href="tel:' + esc(C.ligar) + '"><svg aria-hidden="true"><use href="#i-fone"/></svg>Ligar</a>' : '') +
        '</div></article>';
    }).join('');
    ligarZap(lista);
  }).catch(function () {
    lista.innerHTML = '<p>Não consegui carregar os serviços. <a href="tel:' + esc(C.ligar) + '">Ligue para o Bruno</a>.</p>';
  });

  // Dúvidas
  var faq = document.getElementById('faq');
  fetch('data/faq.json' + V).then(function (r) { return r.json(); }).then(function (d) {
    faq.innerHTML = d.faq.map(function (f) {
      return '<details><summary>' + txt(f.p) + '</summary><p>' + txt(f.r) + '</p></details>';
    }).join('');
  }).catch(function () {});

  // Pedido de chave de carro: mensagem mastigada
  var form = document.getElementById('form-carro');
  var erro = document.getElementById('pedido-erro');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var faltam = [];
    var caso = form.querySelector('[name=caso]:checked');
    var tipo = form.querySelector('[name=tipo]:checked');
    var onde = form.querySelector('[name=onde]:checked');
    var carro = f.carro.value.trim();
    if (!caso) faltam.push('o que aconteceu');
    if (!tipo) faltam.push('como é a chave');
    if (!carro) faltam.push('qual é o carro');
    if (!onde) faltam.push('onde está o carro');
    if (faltam.length) {
      erro.querySelector('span').textContent = faltam.join(', ');
      erro.hidden = false;
      return;
    }
    erro.hidden = true;
    var msg = 'Olá, Bruno! Vim pelo site e preciso de uma chave de carro.\n\n' +
      '*Carro:* ' + carro + '\n' +
      '*O que aconteceu:* ' + caso.value + '\n' +
      '*Tipo de chave:* ' + tipo.value + '\n' +
      '*Onde está:* ' + onde.value;
    window.open(zap(msg), '_blank', 'noopener');
  });
})();
