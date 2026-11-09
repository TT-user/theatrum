/* AML — diagnóstico "Sua empresa está em dia?"
   Tudo que é regra de negócio fica em DIAG_CONFIG. Para mudar pergunta, texto,
   limite do semáforo ou recomendação, edite só o objeto abaixo. */

var DIAG_CONFIG = {
  perguntas: [
    { id: 'func', titulo: 'Quantos funcionários com carteira assinada sua empresa tem?', tipo: 'single',
      opcoes: [['nenhum', 'Nenhum'], ['1-10', '1 a 10'], ['11-50', '11 a 50'], ['51-200', '51 a 200'], ['200+', 'Mais de 200']] },
    { id: 'ramo', titulo: 'Qual o ramo da empresa?', tipo: 'single',
      opcoes: [['comercio', 'Comércio'], ['servicos', 'Serviços e escritório'], ['industria', 'Indústria'], ['construcao', 'Construção civil'], ['saude', 'Saúde'], ['transporte', 'Transporte e logística'], ['agro', 'Agro'], ['outro', 'Outro']] },
    { id: 'agentes', titulo: 'Os funcionários ficam expostos a algum destes?', dica: 'Marque todos que se aplicam.', tipo: 'multi', exclusivo: 'nenhum',
      opcoes: [['ruido', 'Ruído'], ['quimicos', 'Produtos químicos'], ['biologicos', 'Agentes biológicos'], ['altura', 'Trabalho em altura'], ['eletricidade', 'Eletricidade'], ['maquinas', 'Máquinas e equipamentos'], ['calor', 'Calor'], ['nenhum', 'Nenhum deles']] },
    { id: 'pgr', titulo: 'Sua empresa tem PGR atualizado?', dica: 'Programa de Gerenciamento de Riscos, exigido pela NR-1.', tipo: 'single', conta: true,
      opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
    { id: 'aso', titulo: 'Os exames ocupacionais (ASO) dos funcionários estão em dia?', tipo: 'single', conta: true,
      opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
    { id: 'trein', titulo: 'Os treinamentos obrigatórios estão dentro da validade?', tipo: 'single', conta: true,
      opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei'], ['na', 'Não se aplica']] },
    { id: 'psico', titulo: 'Sua empresa já avaliou os riscos psicossociais conforme a NR-1?', dica: 'Estresse, sobrecarga, assédio.', tipo: 'single', conta: true,
      opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
    { id: 'esocial', titulo: 'Os eventos de SST do eSocial estão sendo enviados?', tipo: 'single', conta: true,
      opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] }
  ],

  /* Semáforo: conta quantos "Não" e "Não sei" há nas perguntas com conta: true. */
  semaforo: {
    verdeAte: 0,   // 0 pendências → Em dia
    amareloAte: 2, // 1 a 2 → Atenção; 3 ou mais → Risco alto
    textos: {
      g: { status: 'Em dia', titulo: 'Sua empresa parece estar em dia', texto: 'Pelas respostas, o básico está em ordem. Vale manter as revisões no calendário.' },
      y: { status: 'Atenção', titulo: 'Alguns pontos pedem atenção', texto: 'Encontramos {n} ponto(s) em aberto que convém resolver antes de uma fiscalização.' },
      r: { status: 'Risco alto', titulo: 'Sua empresa está exposta', texto: 'Encontramos {n} pontos em aberto. Isso expõe a empresa a autuação e a passivo trabalhista.' }
    }
  },

  riscos: {
    autuacao: 'Pode gerar autuação na fiscalização',
    passivo: 'Pode gerar passivo trabalhista',
    multa: 'Pode gerar multa e pendência no eSocial',
    manter: 'Manter revisado'
  },

  /* Recomendações: cada regra recebe as respostas (r) e devolve null ou um card.
     ok: true mostra o item em verde, como algo para manter. */
  regras: [
    function (r, h) {
      if (r.func === 'nenhum') return { ok: true, icone: 'i-users', titulo: 'Sem funcionários CLT, por enquanto',
        texto: 'As obrigações de saúde e segurança começam na primeira contratação. Vale planejar o PGR e o exame admissional antes dela.', risco: 'Planejar antes de contratar' };
      return null;
    },
    function (r, h) {
      if (r.func === 'nenhum') return null;
      var ok = r.pgr === 'sim';
      return { ok: ok, icone: 'i-shield', titulo: 'PGR (NR-1)',
        texto: ok ? 'O PGR precisa acompanhar a empresa: nova função, novo equipamento ou nova unidade pedem revisão.' : 'Obrigatório para quem tem funcionário CLT. Mapeia os riscos e define as medidas de controle.',
        risco: ok ? DIAG_CONFIG.riscos.manter : DIAG_CONFIG.riscos.autuacao };
    },
    function (r, h) {
      if (r.func === 'nenhum') return null;
      var ok = r.aso === 'sim';
      return { ok: ok, icone: 'i-steth', titulo: 'PCMSO e exames ocupacionais (ASO)',
        texto: ok ? 'Mantenha o calendário de periódicos e não esqueça admissional e demissional.' : 'O PCMSO define os exames de cada função. O ASO é exigido na admissão, nos periódicos, na demissão, no retorno e na mudança de função.',
        risco: ok ? DIAG_CONFIG.riscos.manter : DIAG_CONFIG.riscos.passivo };
    },
    function (r, h) {
      var insalubre = h('ruido') || h('quimicos') || h('biologicos') || h('calor');
      if (!insalubre) return null;
      return { icone: 'i-flask', titulo: 'LTCAT e laudo de insalubridade (LTIP)',
        texto: 'Há exposição a agentes que podem dar direito a adicional e a aposentadoria especial. O laudo diz o que se aplica' + (h('eletricidade') ? ', incluindo a periculosidade por eletricidade.' : '.'),
        risco: DIAG_CONFIG.riscos.passivo };
    },
    function (r, h) {
      var insalubre = h('ruido') || h('quimicos') || h('biologicos') || h('calor');
      if (!h('eletricidade') || insalubre) return null;
      return { icone: 'i-bolt', titulo: 'Avaliação de periculosidade (NR-16)',
        texto: 'Trabalho com eletricidade pode gerar direito a adicional de periculosidade. A avaliação técnica define se é o caso.',
        risco: DIAG_CONFIG.riscos.passivo };
    },
    function (r, h) {
      var nrs = [];
      if (h('eletricidade')) nrs.push('NR-10 (eletricidade)');
      if (h('altura')) nrs.push('NR-35 (trabalho em altura)');
      if (h('maquinas')) nrs.push('NR-12 (máquinas e equipamentos)');
      if (!nrs.length) return null;
      var ok = r.trein === 'sim';
      return { ok: ok, icone: 'i-helmet', titulo: 'Treinamentos ' + nrs.map(function (n) { return n.split(' ')[0]; }).join(', '),
        texto: (ok ? 'Fique de olho na reciclagem: ' : 'Pelos riscos marcados, a equipe precisa de: ') + nrs.join(', ') + '.',
        risco: ok ? DIAG_CONFIG.riscos.manter : DIAG_CONFIG.riscos.autuacao };
    },
    function (r, h) {
      var temNR = h('eletricidade') || h('altura') || h('maquinas');
      if (temNR || !(r.trein === 'nao' || r.trein === 'naosei')) return null;
      return { icone: 'i-helmet', titulo: 'Revisão dos treinamentos obrigatórios',
        texto: 'Levantamento de quais treinamentos cada função exige e de quais estão vencidos.',
        risco: DIAG_CONFIG.riscos.autuacao };
    },
    function (r, h) {
      if (!(r.psico === 'nao' || r.psico === 'naosei')) return null;
      return { icone: 'i-brain', titulo: 'Avaliação de riscos psicossociais (NR-1)',
        texto: 'Estresse, sobrecarga e assédio agora fazem parte do gerenciamento de riscos e precisam aparecer no PGR.',
        risco: DIAG_CONFIG.riscos.autuacao };
    },
    function (r, h) {
      if (!(r.esocial === 'nao' || r.esocial === 'naosei')) return null;
      return { icone: 'i-cloud', titulo: 'Regularização do eSocial SST',
        texto: 'Envio dos eventos S-2210 (CAT), S-2220 (exames) e S-2240 (condições ambientais), com conferência do que ficou para trás.',
        risco: DIAG_CONFIG.riscos.multa };
    },
    function (r, h) {
      var porRamo = {
        construcao: ['PGR de obra (NR-18)', 'Canteiro de obras tem regras próprias de gerenciamento de riscos.'],
        saude: ['Segurança em serviços de saúde (NR-32)', 'Estabelecimentos de saúde têm exigências específicas para a equipe.'],
        agro: ['Gestão de riscos no trabalho rural (NR-31)', 'O trabalho rural segue norma própria de segurança e saúde.']
      }[r.ramo];
      if (!porRamo || r.func === 'nenhum') return null;
      return { icone: 'i-alert', titulo: porRamo[0], texto: porRamo[1], risco: DIAG_CONFIG.riscos.autuacao };
    }
  ],

  aviso: 'Resultado orientativo. A definição exata depende de análise técnica da equipe AML.'
};

(function () {
  var root = document.getElementById('diag');
  if (!root) return;
  var C = DIAG_CONFIG;
  var N = C.perguntas.length;
  var state = { i: 0, r: {}, fase: 'quiz', lead: null, dir: '' };
  var tocou = false; // só move o foco depois que a pessoa interagiu

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ico = function (id) { return '<svg class="ico"><use href="#' + id + '"/></svg>'; };
  var labelOf = function (q, v) { var o = q.opcoes.filter(function (o) { return o[0] === v; })[0]; return o ? o[1] : v; };
  var tem = function (v) { return (state.r.agentes || []).indexOf(v) !== -1; };

  var pendencias = function () {
    return C.perguntas.filter(function (q) { return q.conta && (state.r[q.id] === 'nao' || state.r[q.id] === 'naosei'); }).length;
  };
  var nivel = function () {
    var n = pendencias();
    if (state.r.func === 'nenhum') return 'g';
    return n <= C.semaforo.verdeAte ? 'g' : n <= C.semaforo.amareloAte ? 'y' : 'r';
  };
  var recomendacoes = function () {
    return C.regras.map(function (fn) { return fn(state.r, tem); }).filter(Boolean)
      .sort(function (a, b) { return (a.ok ? 1 : 0) - (b.ok ? 1 : 0); });
  };

  var shell = function (progress, showBack, label, inner) {
    root.innerHTML =
      '<div class="diag-progress"><span style="width:' + progress + '%"></span></div>' +
      '<div class="diag-top"><button class="diag-back" type="button"' + (showBack ? '' : ' hidden') + '>' + ico('i-left') + 'Voltar</button><span>' + label + '</span></div>' +
      '<div class="diag-stage"><div class="diag-step ' + state.dir + '">' + inner + '</div></div>';
    var back = root.querySelector('.diag-back');
    back.addEventListener('click', voltar);
  };

  var focusTitle = function () {
    if (!tocou) return;
    var h = root.querySelector('[data-focus]');
    if (h) h.focus({ preventScroll: true });
  };

  var semaforoHTML = function () {
    var lv = nivel(), t = C.semaforo.textos[lv];
    return '<div class="semaforo">' +
      '<div class="lights" aria-hidden="true"><i class="r' + (lv === 'r' ? ' on' : '') + '"></i><i class="y' + (lv === 'y' ? ' on' : '') + '"></i><i class="g' + (lv === 'g' ? ' on' : '') + '"></i></div>' +
      '<div><span class="status ' + lv + '">' + t.status + '</span><h3>' + t.titulo + '</h3><p>' + t.texto.replace('{n}', pendencias()) + '</p></div></div>';
  };

  /* ----- pergunta ----- */
  var renderQuiz = function () {
    var q = C.perguntas[state.i];
    var multi = q.tipo === 'multi';
    var sel = state.r[q.id] || (multi ? [] : null);
    var opts = q.opcoes.map(function (o) {
      var on = multi ? sel.indexOf(o[0]) !== -1 : sel === o[0];
      return '<button type="button" class="diag-opt' + (multi ? ' multi' : '') + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><span class="box"></span>' + esc(o[1]) + '</button>';
    }).join('');
    var next = multi ? '<div class="diag-next"><button type="button" class="btn btn-red" data-next' + (sel.length ? '' : ' disabled') + '>Continuar ' + ico('i-arrow') + '</button></div>' : '';
    shell(Math.round(state.i / N * 100), state.i > 0, 'Pergunta ' + (state.i + 1) + ' de ' + N,
      '<h3 class="diag-q" tabindex="-1" data-focus>' + esc(q.titulo) + '</h3>' +
      (q.dica ? '<p class="diag-hint">' + esc(q.dica) + '</p>' : '<div style="height:12px"></div>') +
      '<div class="diag-options" role="group" aria-label="' + esc(q.titulo) + '">' + opts + '</div>' + next);

    root.querySelectorAll('.diag-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        if (!multi) {
          state.r[q.id] = v;
          root.querySelectorAll('.diag-opt').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          setTimeout(avancar, 220);
          return;
        }
        var arr = (state.r[q.id] || []).slice();
        if (v === q.exclusivo) arr = arr.indexOf(v) !== -1 ? [] : [v];
        else {
          arr = arr.filter(function (x) { return x !== q.exclusivo; });
          arr = arr.indexOf(v) !== -1 ? arr.filter(function (x) { return x !== v; }) : arr.concat(v);
        }
        state.r[q.id] = arr;
        root.querySelectorAll('.diag-opt').forEach(function (x) { x.setAttribute('aria-pressed', String(arr.indexOf(x.getAttribute('data-v')) !== -1)); });
        root.querySelector('[data-next]').disabled = !arr.length;
      });
    });
    var nb = root.querySelector('[data-next]');
    if (nb) nb.addEventListener('click', avancar);
    focusTitle();
  };

  /* ----- captura antes do resultado completo ----- */
  var renderGate = function () {
    var recs = recomendacoes().filter(function (x) { return !x.ok; }).length;
    var L = state.lead || {};
    shell(100, true, 'Quase lá',
      semaforoHTML() +
      '<form class="lead-form" novalidate>' +
        '<h3 tabindex="-1" data-focus>Receba seu diagnóstico completo</h3>' +
        '<p class="sub">' + (recs ? 'Separamos <strong>' + recs + ' ' + (recs === 1 ? 'item' : 'itens') + '</strong> que sua empresa provavelmente precisa, com o risco de cada um.' : 'Veja o que manter em dia e quando revisar.') + '</p>' +
        '<div class="field-row">' +
          '<div class="field"><label for="d-nome">Seu nome</label><input id="d-nome" name="nome" autocomplete="name" value="' + esc(L.nome || '') + '"></div>' +
          '<div class="field"><label for="d-empresa">Empresa</label><input id="d-empresa" name="empresa" autocomplete="organization" value="' + esc(L.empresa || '') + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label for="d-cidade">Cidade / unidade</label><select id="d-cidade" name="cidade"><option value="">Selecione</option>' +
            Object.keys(AML.unidades).map(function (k) { return '<option value="' + k + '"' + (L.cidade === k ? ' selected' : '') + '>' + AML.unidades[k].nome + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label for="d-whats">WhatsApp</label><input id="d-whats" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(32) 99999-9999" value="' + esc(L.whatsapp || '') + '"></div>' +
        '</div>' +
        '<p class="form-error" role="alert"></p>' +
        '<button class="btn btn-red btn-block" type="submit">Ver meu diagnóstico ' + ico('i-arrow') + '</button>' +
        '<p class="form-note">Seus dados ficam com a AML e são usados só para este atendimento (LGPD).</p>' +
      '</form>');

    var form = root.querySelector('form');
    AML.maskPhone(form.elements.whatsapp);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, bad = [];
      ['nome', 'empresa', 'cidade', 'whatsapp'].forEach(function (n) {
        var ok = f[n].value.trim() !== '' && (n !== 'whatsapp' || f[n].value.replace(/\D/g, '').length >= 10);
        f[n].setAttribute('aria-invalid', String(!ok));
        if (!ok) bad.push(f[n]);
      });
      if (bad.length) { form.querySelector('.form-error').textContent = 'Preencha os campos destacados para ver o resultado.'; bad[0].focus(); return; }
      state.lead = { nome: f.nome.value.trim(), empresa: f.empresa.value.trim(), cidade: f.cidade.value, whatsapp: f.whatsapp.value.trim() };
      // TODO: enviar state.lead + state.r para o CRM/planilha da AML quando houver endpoint.
      state.fase = 'result'; state.dir = ''; render(true);
    });
    focusTitle();
  };

  /* ----- resultado ----- */
  var mensagemWhats = function (recs) {
    var Q = function (id) { return C.perguntas.filter(function (q) { return q.id === id; })[0]; };
    var lv = nivel();
    var ag = (state.r.agentes || []).map(function (v) { return labelOf(Q('agentes'), v); }).join(', ');
    var pend = recs.filter(function (x) { return !x.ok; }).map(function (x) { return '• ' + x.titulo; });
    return [
      '*Diagnóstico pelo site da AML*',
      'Resultado: *' + C.semaforo.textos[lv].status + '*',
      '',
      '*Nome:* ' + state.lead.nome,
      '*Empresa:* ' + state.lead.empresa,
      '*Unidade:* ' + AML.unidades[state.lead.cidade].nome,
      '*WhatsApp:* ' + state.lead.whatsapp,
      '*Funcionários CLT:* ' + labelOf(Q('func'), state.r.func),
      '*Ramo:* ' + labelOf(Q('ramo'), state.r.ramo),
      '*Exposição:* ' + ag,
      '',
      pend.length ? '*O que apareceu como pendente:*\n' + pend.join('\n') : 'Nenhuma pendência apontada.',
      '',
      'Quero falar com um especialista.'
    ].join('\n');
  };

  var renderResult = function () {
    var recs = recomendacoes();
    var cards = recs.map(function (x, i) {
      return '<li class="rec' + (x.ok ? ' ok' : '') + '" style="animation-delay:' + (i * 70) + 'ms"><span class="badge">' + ico(x.ok ? 'i-check' : x.icone) + '</span><div><h4>' + esc(x.titulo) + '</h4><p>' + esc(x.texto) + '</p><span class="risk">' + esc(x.risco) + '</span></div></li>';
    }).join('');
    shell(100, false, 'Diagnóstico de ' + esc(state.lead.empresa),
      semaforoHTML() +
      '<h3 class="diag-q" style="font-size:20px" tabindex="-1" data-focus>O que sua empresa provavelmente precisa</h3>' +
      '<ul class="recs">' + cards + '</ul>' +
      '<p class="diag-disclaimer">' + esc(C.aviso) + '</p>' +
      '<div class="diag-actions">' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + AML.waLink(state.lead.cidade, mensagemWhats(recs)) + '">' + ico('i-wa') + 'Falar com um especialista</a>' +
        '<button type="button" class="diag-restart">Refazer o diagnóstico</button>' +
      '</div>');
    root.querySelector('.diag-restart').addEventListener('click', function () {
      state = { i: 0, r: {}, fase: 'quiz', lead: state.lead, dir: 'back' };
      render(true);
    });
    var h = root.querySelector('[data-focus]'); if (h) h.focus({ preventScroll: true });
  };

  var render = function (scroll) {
    if (state.fase === 'quiz') renderQuiz();
    else if (state.fase === 'gate') renderGate();
    else renderResult();
    if (scroll) {
      var top = root.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.5) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  function avancar() {
    tocou = true;
    state.dir = '';
    if (state.i < N - 1) { state.i++; render(false); }
    else { state.fase = 'gate'; render(true); }
    state.dir = '';
  }
  function voltar() {
    tocou = true;
    state.dir = 'back';
    if (state.fase === 'gate') state.fase = 'quiz';
    else if (state.i > 0) state.i--;
    render(false);
  }

  render(false);
})();
