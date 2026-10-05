/* "Por onde começar?" — assistente de acolhimento.
   Não é diagnóstico nem teste. Nada é salvo nem enviado: tudo acontece no navegador. */
(function () {
  'use strict';

  var raiz = document.getElementById('poc');
  if (!raiz) return;
  var G = window.Gabi;
  var esc = G.esc, comPh = G.comPh;

  var perguntas = [], caminhos = {}, extras = {};
  var passo = -1;          // -1 abertura · 0..n-1 perguntas · n nome · n+1 resultado
  var resp = {};
  var nome = '';

  Promise.all([
    G.carregar('data/perguntas.json'),
    G.carregar('data/caminhos.json'),
    G.carregar('data/servicos.json')
  ]).then(function (r) {
    extras = r[2];
    perguntas = r[0].perguntas.map(function (p) {
      var c = Object.assign({}, p);
      c.opcoes = p.opcoes.filter(function (o) { return !o.requer || extras[o.requer] === true; });
      return c;
    });
    r[1].caminhos.forEach(function (c) { caminhos[c.id] = c; });
    render(false);
  }).catch(function (e) {
    console.warn(e);
    raiz.innerHTML = '<p>Não foi possível carregar agora. Fale direto com a Gabi: <a href="' + G.linkWhats('Olá, Gabi! Vim pelo seu site.') + '">WhatsApp</a>.</p>';
  });

  var total = function () { return perguntas.length + 1; }; // + nome

  function cvv() {
    return '<p class="poc__cvv">Se você está em um momento de crise, ligue <a href="tel:188">188 (CVV)</a>, 24h.</p>';
  }
  function progresso() {
    var atual = passo + 1;
    return '<div class="poc__progresso" aria-hidden="true"><span>' + atual + ' de ' + total() + '</span>' +
      '<div class="poc__barra"><span style="width:' + Math.round(atual / total() * 100) + '%"></span></div></div>';
  }

  function telaAbertura() {
    return '<div class="poc__intro centro">' +
      '<img src="assets/img/emblema.svg" width="48" height="48" alt="" style="margin:0 auto 18px">' +
      '<h2 tabindex="-1">Não sabe por onde <em>começar</em>?</h2>' +
      '<p>Responda 5 perguntas rápidas. Eu te mostro o caminho que mais combina com o seu momento. Depois, você decide se quer conversar.</p>' +
      '<p class="poc__mini">Leva menos de 1 minuto. Suas respostas não ficam salvas no site.</p>' +
      '<button type="button" class="btn btn--ouro" data-acao="comecar">Começar</button>' +
      '</div>';
  }

  function telaPergunta(p) {
    var multi = p.tipo === 'multipla';
    var sel = resp[p.id] || (multi ? [] : null);
    var cheio = multi && sel.length >= (p.max || 99);
    var ops = p.opcoes.map(function (o) {
      var marcado = multi ? sel.indexOf(o.id) > -1 : sel === o.id;
      return '<label class="opcao"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + p.id + '" value="' + o.id + '"' +
        (marcado ? ' checked' : '') + (cheio && !marcado ? ' disabled' : '') + '><span>' + esc(o.texto) + '</span></label>';
    }).join('');
    var ok = multi ? sel.length > 0 : !!sel;
    return progresso() +
      '<fieldset><legend tabindex="-1">' + esc(p.titulo) + '</legend>' +
      '<p class="poc__dica">' + esc(p.dica || '') + '</p>' +
      '<div class="poc__opcoes">' + ops + '</div></fieldset>' +
      nav(ok);
  }

  function telaNome() {
    return progresso() +
      '<fieldset><legend tabindex="-1">Como posso te chamar?</legend>' +
      '<p class="poc__dica">Opcional. Só o primeiro nome.</p>' +
      '<div class="poc__campo"><label for="poc-nome">Seu primeiro nome</label>' +
      '<input id="poc-nome" type="text" maxlength="30" autocomplete="given-name" placeholder="Ex.: Ana" value="' + esc(nome) + '"></div>' +
      '</fieldset>' + nav(true, 'Ver meu caminho');
  }

  function nav(ok, rotulo) {
    return '<div class="poc__nav">' +
      '<button type="button" class="poc__voltar" data-acao="voltar">← Voltar</button>' +
      '<button type="button" class="btn btn--ouro" data-acao="avancar"' + (ok ? '' : ' disabled') + '>' + (rotulo || 'Continuar') + '</button></div>';
  }

  function calcular() {
    var pts = { terapeutica: 0, reiki: 0, limpeza: 0, integrada: 0 };
    perguntas.forEach(function (p) {
      var v = resp[p.id]; if (!v) return;
      (Array.isArray(v) ? v : [v]).forEach(function (id) {
        var o = p.opcoes.filter(function (x) { return x.id === id; })[0];
        if (!o || !o.pesos) return;
        Object.keys(o.pesos).forEach(function (k) { pts[k] = (pts[k] || 0) + o.pesos[k]; });
      });
    });
    var max = Math.max.apply(null, Object.keys(pts).map(function (k) { return pts[k]; }));
    var top = Object.keys(pts).filter(function (k) { return pts[k] === max; });
    return (max === 0 || top.length > 1) ? 'integrada' : top[0];
  }

  function textoDe(pid) {
    var p = perguntas.filter(function (x) { return x.id === pid; })[0];
    var v = resp[pid]; if (!p || !v) return '';
    return (Array.isArray(v) ? v : [v]).map(function (id) {
      var o = p.opcoes.filter(function (x) { return x.id === id; })[0];
      return o ? (o.resposta || o.texto) : '';
    }).join('; ');
  }

  function mensagem(c) {
    return 'Olá, Gabi! 🌿 Vim pelo seu site e fiz o "Por onde começar".\n\n' +
      '*Nome:* ' + (nome || 'Prefiro contar na conversa') + '\n' +
      '*O que me trouxe:* ' + textoDe('motivo') + '\n' +
      '*Como prefiro ser cuidada:* ' + textoDe('cuidado') + '\n' +
      '*Caminho sugerido:* ' + c.titulo + '\n' +
      '*Formato:* ' + textoDe('formato') + '\n' +
      '*Melhor período:* ' + textoDe('periodo') + '\n' +
      '*Primeira vez:* ' + textoDe('experiencia') + '\n\n' +
      'Pode me contar como funciona e quais horários você tem?';
  }

  function telaResultado() {
    var c = caminhos[calcular()];
    var primeira = resp.experiencia === 'primeira';
    var msg = mensagem(c);
    raiz.setAttribute('data-caminho', c.id);
    raiz.setAttribute('data-mensagem', msg); // usado nos testes automatizados
    return '<div class="resultado">' +
      '<h2 tabindex="-1" class="poc__dica" style="font-size:22px;margin:0">Pronto. Olha o que eu sugiro para você' + (nome ? ', ' + esc(nome) : '') + ':</h2>' +
      '<div class="resultado__card">' +
        '<img src="assets/img/emblema.svg" width="44" height="44" alt="">' +
        '<p class="rotulo"><span class="fio"></span>O caminho que mais combina com você agora<span class="fio"></span></p>' +
        '<p class="resultado__nome">' + esc(c.titulo) + '</p>' +
        '<h3>' + c.titulo_html + '</h3>' +   /* titulo_html vem do JSON da própria cliente */
        '<p>' + esc(c.explicacao) + '</p>' +
        '<p class="resultado__info"><span>' + comPh(c.formato) + '</span><span>Duração: ' + comPh(c.duracao) + '</span><span>' + (c.valor ? comPh(c.valor) : 'Valor na conversa') + '</span></p>' +
        /* [CONFIRMAR SE A PRIMEIRA CONVERSA É GRATUITA — se não for, remover] */
        (primeira ? '<p class="resultado__primeira">Primeira vez? Fica tranquila: a Gabi explica tudo antes de começar.</p>' : '') +
        '<p class="resultado__aviso">Isso é só uma sugestão para começar. Na primeira conversa, a Gabi confirma com você o melhor caminho.</p>' +
        '<a class="btn btn--ouro" target="_blank" rel="noopener" href="' + G.linkWhats(msg) + '"><svg class="ic ic--btn" aria-hidden="true"><use href="#i-whats"/></svg>Enviar para a Gabi no WhatsApp</a>' +
      '</div>' +
      '<div class="resultado__links"><button type="button" data-acao="refazer">Refazer</button><a href="#atendimentos">Ver todos os atendimentos</a></div>' +
      '</div>';
  }

  function render(focar) {
    var html;
    if (passo < 0) html = telaAbertura();
    else if (passo < perguntas.length) html = telaPergunta(perguntas[passo]);
    else if (passo === perguntas.length) html = telaNome();
    else html = telaResultado();

    raiz.innerHTML = '<div class="poc__tela' + (G.reduzir ? '' : ' entrando') + '">' + html + '</div>' +
      cvv() + '<div class="sr-only" aria-live="polite" id="poc-anuncio" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></div>';

    if (passo > perguntas.length) {
      var c = caminhos[raiz.getAttribute('data-caminho')];
      setTimeout(function () { document.getElementById('poc-anuncio').textContent = 'Resultado: ' + c.titulo + '.'; }, 60);
    }
    if (focar) {
      var alvo = raiz.querySelector('legend, h2');
      if (alvo) alvo.focus({ preventScroll: true });
      var topo = raiz.getBoundingClientRect().top;
      if (topo < 60 || topo > window.innerHeight * 0.5) raiz.scrollIntoView({ behavior: G.reduzir ? 'auto' : 'smooth', block: 'start' });
    }
  }

  raiz.addEventListener('change', function (e) {
    var inp = e.target;
    if (passo < 0 || passo >= perguntas.length || !inp.name) return;
    var p = perguntas[passo];
    if (p.tipo === 'multipla') {
      var sel = Array.prototype.map.call(raiz.querySelectorAll('input[name="' + p.id + '"]:checked'), function (x) { return x.value; });
      resp[p.id] = sel;
      var cheio = sel.length >= (p.max || 99);
      raiz.querySelectorAll('input[name="' + p.id + '"]').forEach(function (x) { x.disabled = cheio && !x.checked; });
      raiz.querySelector('[data-acao="avancar"]').disabled = sel.length === 0;
    } else {
      resp[p.id] = inp.value;
      raiz.querySelector('[data-acao="avancar"]').disabled = false;
    }
  });

  raiz.addEventListener('input', function (e) {
    if (e.target.id === 'poc-nome') nome = e.target.value.trim().split(/\s+/)[0] || '';
  });
  raiz.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.id === 'poc-nome') { e.preventDefault(); passo++; render(true); }
  });

  raiz.addEventListener('click', function (e) {
    var b = e.target.closest('[data-acao]');
    if (!b || b.disabled) return;
    var a = b.getAttribute('data-acao');
    if (a === 'comecar') passo = 0;
    else if (a === 'avancar') passo++;
    else if (a === 'voltar') passo--;
    else if (a === 'refazer') { resp = {}; nome = ''; passo = 0; }
    render(true);
  });
})();
