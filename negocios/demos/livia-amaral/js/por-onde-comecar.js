/* "Por onde começar?" — assistente de acolhimento.
   Não é diagnóstico nem teste. Nada é salvo nem enviado: tudo acontece no navegador. */
(function () {
  'use strict';

  var raiz = document.getElementById('poc');
  if (!raiz) return;
  var G = window.Site;
  var esc = G.esc, comPh = G.comPh, T = G.T;

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
    raiz.innerHTML = '<p>' + T('Não foi possível carregar agora. Fale direto com a Lívia: ', "This couldn't load right now. Message Lívia directly: ") +
      '<a href="' + G.linkWhats(T('Olá, Lívia! Vim pelo seu site.', 'Hi, Lívia! I found you through your website.')) + '">WhatsApp</a>.</p>';
  });

  var total = function () { return perguntas.length + 1; }; // + nome

  function progresso() {
    var atual = passo + 1;
    return '<div class="poc__progresso" aria-hidden="true"><span>' + atual + T(' de ', ' of ') + total() + '</span>' +
      '<div class="poc__barra"><span style="width:' + Math.round(atual / total() * 100) + '%"></span></div></div>';
  }

  function telaAbertura() {
    var p1 = perguntas[0];
    var amostra = p1.opcoes.slice(0, 4).map(function (o) {
      return '<button type="button" class="poc__amostra-op" data-acao="pre" data-v="' + o.id + '">' + esc(o.texto) + '</button>';
    }).join('');
    return '<div class="poc__intro centro">' +
      '<p class="poc__selo"><span class="poc__pulso" aria-hidden="true"></span>' + T('Quiz interativo', 'Interactive quiz') + '</p>' +
      '<h2 tabindex="-1">' + T('Não sabe por onde <em>começar</em>?', 'Not sure where to <em>start</em>?') + '</h2>' +
      '<p class="poc__lead">' + T('Responda ' + perguntas.length + ' perguntas rápidas e veja o caminho que mais combina com o seu momento. Depois, você decide se quer conversar.',
        'Answer ' + perguntas.length + ' quick questions and see the path that best fits where you are right now. Then you decide whether you want to talk.') + '</p>' +
      '<ul class="poc__chips"><li>' + perguntas.length + T(' perguntas', ' questions') + '</li><li>' + T('menos de 1 minuto', 'under 1 minute') + '</li><li>' + T('resultado na hora', 'instant result') + '</li></ul>' +
      '<div class="poc__amostra">' +
        '<p class="poc__amostra-rot">' + T('Pergunta 1 · toque numa resposta para começar', 'Question 1 · tap an answer to start') + '</p>' +
        '<p class="poc__amostra-tit">' + esc(p1.titulo) + '</p>' +
        '<div class="poc__amostra-ops">' + amostra + '</div>' +
      '</div>' +
      '<button type="button" class="btn btn--ouro poc__comecar" data-acao="comecar">' + T('Começar o quiz', 'Start the quiz') + ' <span aria-hidden="true">→</span></button>' +
      '<p class="poc__mini">' + T('Suas respostas não ficam salvas no site.', 'Your answers are not saved on the site.') + '</p>' +
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
      '<fieldset><legend tabindex="-1">' + T('Como posso te chamar?', 'What should I call you?') + '</legend>' +
      '<p class="poc__dica">' + T('Opcional. Só o primeiro nome.', 'Optional. Just your first name.') + '</p>' +
      '<div class="poc__campo"><label for="poc-nome">' + T('Seu primeiro nome', 'Your first name') + '</label>' +
      '<input id="poc-nome" type="text" maxlength="30" autocomplete="given-name" placeholder="' + T('Ex.: Ana', 'E.g. Ana') + '" value="' + esc(nome) + '"></div>' +
      '</fieldset>' + nav(true, T('Ver meu caminho', 'See my path'));
  }

  function nav(ok, rotulo) {
    return '<div class="poc__nav">' +
      '<button type="button" class="poc__voltar" data-acao="voltar">' + T('← Voltar', '← Back') + '</button>' +
      '<button type="button" class="btn btn--ouro" data-acao="avancar"' + (ok ? '' : ' disabled') + '>' + (rotulo || T('Continuar', 'Continue')) + '</button></div>';
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
    return T('Olá, Lívia! 🌿 Vim pelo seu site e fiz o "Por onde começar".', 'Hi, Lívia! 🌿 I found you through your website and took the "Where to start" quiz.') + '\n\n' +
      T('*Nome:* ', '*Name:* ') + (nome || T('Prefiro contar na conversa', "I'll tell you in our chat")) + '\n' +
      T('*O que me trouxe:* ', '*What brought me here:* ') + textoDe('motivo') + '\n' +
      T('*Como prefiro ser cuidada:* ', '*How I prefer to be cared for:* ') + textoDe('cuidado') + '\n' +
      T('*Caminho sugerido:* ', '*Suggested path:* ') + c.titulo + '\n' +
      T('*Formato:* ', '*Format:* ') + textoDe('formato') + '\n' +
      T('*Melhor período:* ', '*Best time of day:* ') + textoDe('periodo') + '\n' +
      T('*Primeira vez:* ', '*First time:* ') + textoDe('experiencia') + '\n\n' +
      T('Pode me contar como funciona e quais horários você tem?', 'Could you tell me how it works and what times you have available?');
  }

  function telaResultado() {
    var c = caminhos[calcular()];
    var primeira = resp.experiencia === 'primeira';
    var msg = mensagem(c);
    raiz.setAttribute('data-caminho', c.id);
    raiz.setAttribute('data-mensagem', msg); // usado nos testes automatizados
    return '<div class="resultado">' +
      '<h2 tabindex="-1" class="poc__dica" style="font-size:22px;margin:0">' + T('Pronto. Olha o que eu sugiro para você', "Done. Here's what I suggest for you") + (nome ? ', ' + esc(nome) : '') + ':</h2>' +
      '<div class="resultado__card">' +
        '<img src="assets/img/emblema.svg" width="44" height="44" alt="">' +
        '<p class="rotulo"><span class="fio"></span>' + T('O caminho que mais combina com você agora', 'The path that fits you best right now') + '<span class="fio"></span></p>' +
        '<p class="resultado__nome">' + esc(c.titulo) + '</p>' +
        '<h3>' + c.titulo_html + '</h3>' +   /* titulo_html vem do JSON da demonstração */
        '<p>' + esc(c.explicacao) + '</p>' +
        '<p class="resultado__info"><span>' + comPh(c.formato) + '</span><span>' + T('Duração: ', 'Length: ') + comPh(c.duracao) + '</span><span>' + (c.valor ? comPh(c.valor) : T('Valor na conversa', 'Price shared in our chat')) + '</span></p>' +
        (primeira ? '<p class="resultado__primeira">' + T('Primeira vez? Fica tranquila: a Lívia explica tudo antes de começar.', 'First time? No worries: Lívia explains everything before you begin.') + '</p>' : '') +
        '<p class="resultado__aviso">' + T('Isso é só uma sugestão para começar. Na primeira conversa, a Lívia confirma com você o melhor caminho.', 'This is just a suggestion to get started. In your first chat, Lívia confirms the best path with you.') + '</p>' +
        '<a class="btn btn--ouro" target="_blank" rel="noopener" href="' + G.linkWhats(msg) + '"><svg class="ic ic--btn" aria-hidden="true"><use href="#i-whats"/></svg>' + T('Enviar para a Lívia no WhatsApp', 'Send to Lívia on WhatsApp') + '</a>' +
      '</div>' +
      '<div class="resultado__links"><button type="button" data-acao="refazer">' + T('Refazer', 'Start over') + '</button><a href="#atendimentos">' + T('Ver todos os atendimentos', 'See all services') + '</a></div>' +
      '</div>';
  }

  function render(focar) {
    var html;
    if (passo < 0) html = telaAbertura();
    else if (passo < perguntas.length) html = telaPergunta(perguntas[passo]);
    else if (passo === perguntas.length) html = telaNome();
    else html = telaResultado();

    raiz.innerHTML = '<div class="poc__tela' + (G.reduzir ? '' : ' entrando') + '">' + html + '</div>' +
      '<div class="sr-only" aria-live="polite" id="poc-anuncio" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></div>';

    if (passo > perguntas.length) {
      var c = caminhos[raiz.getAttribute('data-caminho')];
      setTimeout(function () { document.getElementById('poc-anuncio').textContent = T('Resultado: ', 'Result: ') + c.titulo + '.'; }, 60);
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
    else if (a === 'pre') { var p1 = perguntas[0]; resp[p1.id] = p1.tipo === 'multipla' ? [b.getAttribute('data-v')] : b.getAttribute('data-v'); passo = 0; }
    else if (a === 'avancar') passo++;
    else if (a === 'voltar') passo--;
    else if (a === 'refazer') { resp = {}; nome = ''; passo = 0; }
    render(true);
  });
})();
