/* Diagnóstico rápido: caixa de diálogo de RPG em 3 passos que monta a mensagem do
   WhatsApp. Monta em todo [data-diagnostico="origem"] (home e /oficina). */
(function () {
  'use strict';

  // [rótulo do botão, como entra na frase]
  var EQUIP = [
    ['PS5', 'um PS5'], ['PS4', 'um PS4'], ['PS3', 'um PS3'], ['Xbox', 'um Xbox'],
    ['Switch', 'um Switch'], ['Portátil retrô', 'um portátil retrô'], ['Controle', 'um controle'],
    ['Celular', 'um celular'], ['PC', 'um PC']
  ];
  var PROB = [
    ['Superaquecendo', 'que está superaquecendo'],
    ['Barulho alto', 'fazendo barulho alto'],
    ['Não liga', 'que não liga'],
    ['Andando sozinho (drift)', 'com drift (andando sozinho)'],
    ['Sem imagem', 'sem imagem'],
    ['Limpeza preventiva', 'precisando de limpeza preventiva'],
    ['Outro', 'com outro problema']
  ];

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function monta(caixa) {
    var origem = caixa.getAttribute('data-diagnostico') || 'diagnostico';
    var escolha = { equip: null, prob: null, nome: '' };

    function cabeca(passo, fala) {
      caixa.innerHTML = '';
      var topo = el('div', 'dialogo__topo');
      topo.appendChild(el('span', 'dialogo__quem', 'DR. FRANKENSTEIN NERD'));
      topo.appendChild(el('span', 'dialogo__passo', passo ? 'PASSO ' + passo + '/3' : 'COMPLETO'));
      caixa.appendChild(topo);
      var p = el('p', 'dialogo__fala', fala);
      p.setAttribute('aria-live', 'polite');
      p.id = 'dg-' + origem + '-' + (passo || 'fim');
      caixa.appendChild(p);
      return p.id;
    }

    function opcoes(lista, aoEscolher, rotuloId) {
      var ul = el('ul', 'dialogo__ops');
      ul.setAttribute('aria-labelledby', rotuloId);
      lista.forEach(function (o, i) {
        var li = el('li');
        var b = el('button', 'dialogo__op', o[0]);
        b.type = 'button';
        b.addEventListener('click', function () { if (window.NCsom) window.NCsom('select'); aoEscolher(i); });
        li.appendChild(b);
        ul.appendChild(li);
      });
      caixa.appendChild(ul);
      return ul;
    }

    function voltar(acao) {
      var b = el('button', 'dialogo__voltar', '◀ voltar');
      b.type = 'button';
      b.addEventListener('click', acao);
      caixa.appendChild(b);
    }

    function foca(focar) {
      // só puxa o foco depois que a pessoa já interagiu, para não rolar a página ao abrir
      if (focar) { var f = caixa.querySelector('button, input'); if (f) f.focus({ preventScroll: true }); }
    }

    function passo1(focar) {
      var id = cabeca(1, 'Qual é o seu equipamento?');
      opcoes(EQUIP, function (i) { escolha.equip = i; passo2(true); }, id);
      foca(focar);
    }

    function passo2(focar) {
      var id = cabeca(2, 'Hmm, ' + EQUIP[escolha.equip][1] + '. O que está acontecendo?');
      opcoes(PROB, function (i) { escolha.prob = i; passo3(true); }, id);
      voltar(function () { passo1(true); });
      foca(focar);
    }

    function passo3(focar) {
      cabeca(3, 'Como posso te chamar? (opcional)');
      var form = el('form', 'dialogo__form');
      var rot = el('label', 'sr', 'Seu nome');
      rot.htmlFor = 'dg-nome-' + origem;
      var inp = el('input', 'dialogo__campo');
      inp.id = rot.htmlFor;
      inp.type = 'text';
      inp.autocomplete = 'given-name';
      inp.maxLength = 40;
      inp.placeholder = 'seu nome';
      inp.value = escolha.nome;
      var ok = el('button', 'btn btn--ciano', 'CONFIRMAR ▸');
      ok.type = 'submit';
      form.appendChild(rot); form.appendChild(inp); form.appendChild(ok);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        escolha.nome = inp.value.trim();
        if (window.NCsom) window.NCsom('start');
        fim(true);
      });
      caixa.appendChild(form);
      voltar(function () { passo2(true); });
      if (focar) inp.focus({ preventScroll: true });
    }

    function mensagem() {
      var m = 'Olá Nerd Club! Vim pelo site.';
      if (escolha.nome) m += ' Aqui é ' + escolha.nome + '.';
      m += ' Tenho ' + EQUIP[escolha.equip][1] + ' ' + PROB[escolha.prob][1] + '. Podem me passar um orçamento?';
      return m;
    }

    function fim(focar) {
      cabeca(0, 'MISSÃO ACEITA!');
      caixa.querySelector('.dialogo__fala').classList.add('dialogo__fala--ok');
      var resumo = el('p', 'dialogo__resumo');
      resumo.textContent = EQUIP[escolha.equip][0] + ' · ' + PROB[escolha.prob][0];
      caixa.appendChild(resumo);
      caixa.appendChild(el('p', 'dialogo__msg', '“' + mensagem() + '”'));
      var a = el('a', 'btn');
      a.setAttribute('data-zap', origem === 'home' ? 'diagnostico' : 'diagnostico-' + origem);
      a.setAttribute('data-msg', mensagem());
      a.innerHTML = '<svg aria-hidden="true"><use href="#i-zap"/></svg>MANDAR NO WHATSAPP';
      if (window.NCzap) window.NCzap.liga(a);
      caixa.appendChild(a);
      voltar(function () { escolha = { equip: null, prob: null, nome: escolha.nome }; passo1(true); });
      caixa.lastChild.textContent = '↺ recomeçar';
      if (focar) a.focus({ preventScroll: true });
      if (window.NCcoins) window.NCcoins(50);
    }

    passo1(false);
  }

  document.querySelectorAll('[data-diagnostico]').forEach(monta);
})();
