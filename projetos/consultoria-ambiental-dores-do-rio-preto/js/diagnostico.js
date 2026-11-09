/* Eng+ — diagnóstico "Sua propriedade ou empresa está regularizada?"
   Toda regra de negócio fica em DIAG_CONFIG. Para mudar pergunta, texto, limite
   do semáforo ou recomendação, edite só o objeto abaixo.

   Pergunta:  id, curto (rótulo no resumo do WhatsApp), titulo, dica, tipo
              ('single' | 'multi'), opcoes [[valor, texto]], exclusivo (opção que
              desmarca as outras), ruim (respostas que contam como pendência no
              semáforo) e se (função: a pergunta só aparece quando devolve true).
   Regra:     função (r, tem) que devolve null ou um card
              { ok, icone, titulo, texto, risco, revisar }.
              ok: true mostra o item em verde, como algo para manter.
              revisar: true mostra a etiqueta [REVISAR COM A ENG+]. */

var DIAG_CONFIG = {
  perfil: {
    titulo: 'Você é…',
    opcoes: [
      ['produtor', 'Produtor rural', 'Sítio, fazenda, criação ou lavoura', 'i-barn'],
      ['empresa', 'Empresa ou empreendimento', 'Indústria, comércio, obra, saúde', 'i-factory']
    ]
  },

  caminhos: {
    produtor: [
      { id: 'car', curto: 'CAR', titulo: 'Sua propriedade tem CAR feito?', dica: 'Cadastro Ambiental Rural.', tipo: 'single', ruim: ['nao', 'naosei'],
        opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
      { id: 'agua', curto: 'Usa água', titulo: 'Você usa água de poço, nascente, rio ou represa?', dica: 'Para irrigação, criação ou para a casa.', tipo: 'single',
        opcoes: [['sim', 'Sim'], ['nao', 'Não']] },
      { id: 'outorga', curto: 'Outorga', titulo: 'Essa água tem outorga ou cadastro de uso?', tipo: 'single', ruim: ['nao', 'naosei'],
        se: function (r) { return r.agua === 'sim'; },
        opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
      { id: 'ativ', curto: 'Atividades', titulo: 'Quais atividades existem na propriedade?', dica: 'Marque todas que se aplicam.', tipo: 'multi', exclusivo: 'nenhuma',
        opcoes: [['porcos', 'Criação de porcos'], ['gado', 'Gado de leite ou corte'], ['cafe', 'Café ou lavoura'], ['aves', 'Avicultura'], ['peixe', 'Piscicultura ou tanques'], ['benef', 'Beneficiamento de produtos'], ['nenhuma', 'Nenhuma dessas']] },
      { id: 'moto', curto: 'Motosserra', titulo: 'Você tem ou usa motosserra?', tipo: 'single', ruim: ['sem'],
        opcoes: [['ok', 'Sim, regularizada'], ['sem', 'Sim, sem documento'], ['nao', 'Não']] },
      { id: 'app', curto: 'Mexer em córrego/mata', titulo: 'Precisa mexer em córrego, represa, mata ou área de preservação?', tipo: 'single', ruim: ['sim', 'naosei'],
        opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
      { id: 'multa', curto: 'Multa', titulo: 'Já recebeu alguma notificação ou multa ambiental?', tipo: 'single', ruim: ['sim'],
        opcoes: [['sim', 'Sim'], ['nao', 'Não']] }
    ],
    empresa: [
      { id: 'ramo', curto: 'Ramo', titulo: 'Qual o ramo da empresa?', tipo: 'single',
        opcoes: [['industria', 'Indústria'], ['comercio', 'Comércio'], ['construcao', 'Construção civil'], ['posto', 'Posto ou oficina'], ['saude', 'Saúde'], ['agro', 'Agroindústria'], ['outro', 'Outro']] },
      { id: 'lic', curto: 'Licença', titulo: 'Sua atividade tem licença ambiental?', tipo: 'single', ruim: ['vencendo', 'nao', 'naosei'],
        opcoes: [['valida', 'Sim, válida'], ['vencendo', 'Sim, vencendo ou vencida'], ['nao', 'Não'], ['naosei', 'Não sei se precisa']] },
      { id: 'cond', curto: 'Condicionantes', titulo: 'As condicionantes da licença estão sendo cumpridas e entregues?', dica: 'As obrigações e prazos que vêm escritos na licença.', tipo: 'single', ruim: ['nao', 'naosei'],
        se: function (r) { return r.lic === 'valida' || r.lic === 'vencendo'; },
        opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
      { id: 'res', curto: 'Resíduos', titulo: 'Sua empresa gera resíduos que precisam de plano de gerenciamento?', dica: 'Resíduos de obra, de saúde, oleosos, químicos ou em grande volume.', tipo: 'single', ruim: ['naosei'],
        opcoes: [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']] },
      { id: 'agua', curto: 'Poço ou captação', titulo: 'Usa água de poço ou capta água de rio?', tipo: 'single',
        opcoes: [['sim', 'Sim'], ['nao', 'Não']] },
      { id: 'func', curto: 'Funcionários CLT', titulo: 'Tem funcionários com carteira assinada?', tipo: 'single',
        opcoes: [['nenhum', 'Nenhum'], ['1-10', '1 a 10'], ['11-50', '11 a 50'], ['50+', 'Mais de 50']] },
      { id: 'multa', curto: 'Multa', titulo: 'Já recebeu notificação, auto de infração ou multa ambiental?', tipo: 'single', ruim: ['sim'],
        opcoes: [['sim', 'Sim'], ['nao', 'Não']] }
    ]
  },

  /* Semáforo: soma as respostas marcadas como "ruim" nas perguntas respondidas. */
  semaforo: {
    verdeAte: 0,   // 0 pendências → Regularizado
    amareloAte: 2, // 1 a 2 → Atenção; 3 ou mais → Risco alto
    textos: {
      g: { status: 'Regularizado', titulo: 'Tudo indica que você está em dia', texto: 'Pelas respostas, o básico está em ordem. Vale manter prazos e renovações no calendário.' },
      y: { status: 'Atenção', titulo: 'Alguns pontos pedem atenção', texto: 'Encontramos {n} ponto(s) em aberto. Melhor resolver antes de uma fiscalização ou de um pedido de financiamento.' },
      r: { status: 'Risco alto', titulo: 'Há risco de multa ou embargo', texto: 'Encontramos {n} pontos em aberto. Isso expõe a atividade a multa, embargo e problema com o banco.' }
    }
  },

  regras: {
    produtor: [
      function (r) {
        if (r.car === 'sim') return { ok: true, icone: 'i-map', titulo: 'CAR feito: mantenha atualizado', texto: 'Mudou a área, o dono ou o uso da terra? O cadastro precisa acompanhar.', risco: 'Manter em dia' };
        return { icone: 'i-map', titulo: 'Cadastro Ambiental Rural (CAR)', texto: r.car === 'naosei' ? 'A Eng+ consulta a situação da propriedade e faz ou corrige o cadastro.' : 'O registro da propriedade com as áreas de preservação e reserva legal. É a base de toda regularização rural.', risco: 'Pode travar o financiamento rural', revisar: true };
      },
      function (r) {
        if (r.agua !== 'sim') return null;
        if (r.outorga === 'sim') return { ok: true, icone: 'i-drop', titulo: 'Uso da água autorizado', texto: 'Confira a validade da outorga e se o volume usado continua o mesmo.', risco: 'Manter em dia' };
        return { icone: 'i-drop', titulo: 'Outorga de uso da água', texto: 'Captar água de poço, nascente, rio ou represa normalmente pede outorga, ou o cadastro de uso insignificante quando o volume é pequeno.', risco: 'Pode gerar multa e suspensão da captação', revisar: true };
      },
      function (r, tem) {
        if (!tem('porcos')) return null;
        return { icone: 'i-pig', titulo: 'Regularização da suinocultura e tratamento de efluentes', texto: 'A criação de porcos precisa de licença e de um sistema para tratar o dejeto antes de chegar ao solo e à água.', risco: 'Pode embargar a atividade', revisar: true };
      },
      function (r, tem) {
        var nomes = { gado: 'gado', cafe: 'café ou lavoura', aves: 'avicultura', peixe: 'tanques de peixe', benef: 'beneficiamento' };
        var marcadas = (r.ativ || []).filter(function (v) { return nomes[v]; }).map(function (v) { return nomes[v]; });
        if (!marcadas.length) return null;
        return { icone: 'i-license', titulo: 'Avaliação de licenciamento da atividade rural', texto: 'Dependendo do porte, ' + marcadas.join(', ') + ' pode precisar de licença ou de dispensa formal. A Eng+ confere o enquadramento.', risco: 'Pode gerar multa na fiscalização' };
      },
      function (r) {
        if (r.moto === 'sem') return { icone: 'i-saw', titulo: 'Regularização de motosserra', texto: 'A motosserra precisa de registro e licença de porte e uso no nome do dono.', risco: 'A motosserra pode ser apreendida', revisar: true };
        if (r.moto === 'ok') return { ok: true, icone: 'i-saw', titulo: 'Motosserra regularizada', texto: 'A licença tem validade. Vale conferir a data de renovação.', risco: 'Manter em dia', revisar: true };
        return null;
      },
      function (r) {
        if (r.app === 'nao') return null;
        return { icone: 'i-wave', titulo: 'Autorização ambiental antes de intervir', texto: 'Limpeza de córrego, barramento ou corte em mata e APP pedem autorização antes. Se já houve dano, o caminho é o PRAD.', risco: 'Intervir sem autorização é infração' };
      },
      function (r) {
        if (r.multa !== 'sim') return null;
        return { icone: 'i-fine', titulo: 'Defesa e possível redução da multa ambiental', texto: 'Um técnico analisa o auto, monta a defesa e busca reduzir ou converter a multa.', risco: 'A defesa tem prazo para ser apresentada', revisar: true };
      }
    ],
    empresa: [
      function (r) {
        if (r.lic === 'valida') return { ok: true, icone: 'i-license', titulo: 'Licença válida: renovação no prazo', texto: 'A renovação precisa ser pedida com antecedência ao vencimento. Bom deixar a data no calendário.', risco: 'Manter em dia', revisar: true };
        if (r.lic === 'vencendo') return { icone: 'i-license', titulo: 'Renovação da licença ambiental', texto: 'Licença vencendo ou vencida deixa a empresa operando de forma irregular. A Eng+ cuida do pedido de renovação.', risco: 'Pode gerar multa e interdição', revisar: true };
        return { icone: 'i-license', titulo: 'Licenciamento ambiental', texto: r.lic === 'naosei' ? 'Primeiro passo: confirmar se a sua atividade precisa de licença e de qual tipo.' : 'A Eng+ define o tipo de licença e conduz o processo no órgão ambiental.', risco: 'Pode gerar multa e interdição', revisar: true };
      },
      function (r) {
        if (!r.cond || r.cond === 'sim') return null;
        return { icone: 'i-chart', titulo: 'Acompanhamento e monitoramento de condicionantes', texto: 'Calendário de entregas, análises e relatórios exigidos pela licença.', risco: 'Pode levar à suspensão da licença', revisar: true };
      },
      function (r) {
        if (r.res === 'nao') return null;
        var plano = r.ramo === 'saude' ? 'PGRSS' : r.ramo === 'construcao' ? 'PGRCC' : 'PGRS';
        return { icone: 'i-recycle', titulo: 'Plano de gerenciamento de resíduos (' + plano + ')', texto: 'Como separar, guardar, transportar e destinar cada resíduo, com o registro que a fiscalização pede.', risco: 'Pode gerar multa' };
      },
      function (r) {
        if (r.ramo !== 'posto' && r.ramo !== 'agro') return null;
        return r.ramo === 'posto'
          ? { icone: 'i-drop', titulo: 'Efluente oleoso e caixa separadora', texto: 'Postos e oficinas precisam controlar o óleo que vai para a rede e o solo.', risco: 'Pode gerar multa e interdição', revisar: true }
          : { icone: 'i-drop', titulo: 'Tratamento de efluentes da agroindústria', texto: 'Água de lavagem e resíduos do processo precisam de tratamento antes do descarte.', risco: 'Pode gerar multa', revisar: true };
      },
      function (r) {
        if (r.agua !== 'sim') return null;
        return { icone: 'i-drop', titulo: 'Outorga de uso da água', texto: 'Poço ou captação em rio precisam de outorga ou cadastro de uso.', risco: 'Pode gerar multa', revisar: true };
      },
      function (r) {
        if (!r.func || r.func === 'nenhum') return null;
        return { icone: 'i-helmet', titulo: 'Segurança do trabalho e treinamentos', texto: r.func === '1-10' ? 'Mesmo com equipe pequena, prevenção e treinamento são obrigação do empregador.' : 'Gestão de riscos, treinamentos e palestras para uma equipe ' + (r.func === '50+' ? 'grande' : 'em crescimento') + '.', risco: 'Acidente sem prevenção vira passivo trabalhista' };
      },
      function (r) {
        if (r.multa !== 'sim') return null;
        return { icone: 'i-fine', titulo: 'Defesa e possível redução da multa ambiental', texto: 'Análise do auto de infração, defesa técnica e busca de redução ou conversão da multa.', risco: 'A defesa tem prazo para ser apresentada', revisar: true };
      }
    ]
  },

  aviso: 'Resultado orientativo. A definição exata depende de análise técnica da equipe Eng+.'
};

(function () {
  var root = document.getElementById('diag');
  if (!root) return;
  var C = DIAG_CONFIG;
  var state = { i: 0, r: {}, fase: 'quiz', lead: null, dir: '' };
  var tocou = false; // só move o foco depois que a pessoa interagiu

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ico = function (id) { return '<svg class="ico"><use href="#' + id + '"/></svg>'; };
  var tem = function (v) { return (state.r.ativ || []).indexOf(v) !== -1; };
  var labelOf = function (q, v) {
    if (Array.isArray(v)) return v.map(function (x) { return labelOf(q, x); }).join(', ');
    var o = q.opcoes.filter(function (o) { return o[0] === v; })[0]; return o ? o[1] : v;
  };

  /* perguntas ativas: a de perfil + as do caminho cuja condição passa */
  var ativas = function () {
    var cam = C.caminhos[state.r.perfil] || [];
    return [null].concat(cam.filter(function (q) { return !q.se || q.se(state.r); }));
  };
  var limparOcultas = function () {
    var cam = C.caminhos[state.r.perfil] || [];
    cam.forEach(function (q) { if (q.se && !q.se(state.r)) delete state.r[q.id]; });
  };

  var pendencias = function () {
    return ativas().filter(function (q) { return q && q.ruim && q.ruim.indexOf(state.r[q.id]) !== -1; }).length;
  };
  var nivel = function () {
    var n = pendencias();
    return n <= C.semaforo.verdeAte ? 'g' : n <= C.semaforo.amareloAte ? 'y' : 'r';
  };
  var recomendacoes = function () {
    return (C.regras[state.r.perfil] || []).map(function (fn) { return fn(state.r, tem); }).filter(Boolean)
      .sort(function (a, b) { return (a.ok ? 1 : 0) - (b.ok ? 1 : 0); });
  };

  var shell = function (progress, showBack, label, inner) {
    root.innerHTML =
      '<div class="diag-progress"><span style="width:' + progress + '%"></span></div>' +
      '<div class="diag-top"><button class="diag-back" type="button"' + (showBack ? '' : ' hidden') + '>' + ico('i-left') + 'Voltar</button><span>' + label + '</span></div>' +
      '<div class="diag-stage"><div class="diag-step ' + state.dir + '">' + inner + '</div></div>';
    root.querySelector('.diag-back').addEventListener('click', voltar);
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
    var lista = ativas();
    var N = state.r.perfil ? lista.length : 8;
    var q = lista[state.i];
    var label = 'Pergunta ' + (state.i + 1) + ' de ' + N;
    var progress = Math.round(state.i / N * 100);

    if (!q) { // pergunta 1: o perfil decide o caminho
      var P = C.perfil;
      var opts = P.opcoes.map(function (o) {
        return '<button type="button" class="diag-opt" data-v="' + o[0] + '" aria-pressed="' + (state.r.perfil === o[0]) + '"><span class="pi">' + ico(o[3]) + '</span><span>' + esc(o[1]) + '<small>' + esc(o[2]) + '</small></span></button>';
      }).join('');
      shell(progress, false, label,
        '<h3 class="diag-q" tabindex="-1" data-focus>' + esc(P.titulo) + '</h3><div class="diag-gap"></div>' +
        '<div class="diag-options diag-path" role="group" aria-label="' + esc(P.titulo) + '">' + opts + '</div>');
      root.querySelectorAll('.diag-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-v');
          if (state.r.perfil !== v) state.r = { perfil: v };
          root.querySelectorAll('.diag-opt').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          setTimeout(avancar, 220);
        });
      });
      focusTitle();
      return;
    }

    var multi = q.tipo === 'multi';
    var sel = state.r[q.id] || (multi ? [] : null);
    var opts2 = q.opcoes.map(function (o) {
      var on = multi ? sel.indexOf(o[0]) !== -1 : sel === o[0];
      return '<button type="button" class="diag-opt' + (multi ? ' multi' : '') + '" data-v="' + o[0] + '" aria-pressed="' + on + '"><span class="box"></span>' + esc(o[1]) + '</button>';
    }).join('');
    var next = multi ? '<div class="diag-next"><button type="button" class="btn btn-lime btn-block" data-next' + (sel.length ? '' : ' disabled') + '>Continuar ' + ico('i-arrow') + '</button></div>' : '';
    shell(progress, true, label,
      '<h3 class="diag-q" tabindex="-1" data-focus>' + esc(q.titulo) + '</h3>' +
      (q.dica ? '<p class="diag-hint">' + esc(q.dica) + '</p>' : '<div class="diag-gap"></div>') +
      '<div class="diag-options" role="group" aria-label="' + esc(q.titulo) + '">' + opts2 + '</div>' + next);

    root.querySelectorAll('.diag-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        if (!multi) {
          state.r[q.id] = v;
          limparOcultas();
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
    var ufs = ['ES', 'MG', 'Outro'];
    shell(100, true, 'Quase lá',
      semaforoHTML() +
      '<form class="lead-form" novalidate>' +
        '<h3 tabindex="-1" data-focus>Receba seu diagnóstico completo</h3>' +
        '<p class="sub">' + (recs ? 'Separamos <strong>' + recs + ' ' + (recs === 1 ? 'item' : 'itens') + '</strong> que você provavelmente precisa resolver, com o risco de cada um.' : 'Veja o que manter em dia e quando renovar.') + '</p>' +
        '<div class="field"><label for="d-nome">Seu nome</label><input id="d-nome" name="nome" autocomplete="name" value="' + esc(L.nome || '') + '"></div>' +
        '<div class="field-row">' +
          '<div class="field"><label for="d-cidade">Cidade</label><input id="d-cidade" name="cidade" autocomplete="address-level2" value="' + esc(L.cidade || '') + '"></div>' +
          '<div class="field small"><label for="d-uf">Estado</label><select id="d-uf" name="uf"><option value="">UF</option>' +
            ufs.map(function (u) { return '<option' + (L.uf === u ? ' selected' : '') + '>' + u + '</option>'; }).join('') +
          '</select></div>' +
        '</div>' +
        '<div class="field"><label for="d-whats">WhatsApp</label><input id="d-whats" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(28) 99999-9999" value="' + esc(L.whatsapp || '') + '"></div>' +
        '<p class="form-error" role="alert"></p>' +
        '<button class="btn btn-lime btn-block btn-lg" type="submit">Ver meu diagnóstico ' + ico('i-arrow') + '</button>' +
        '<p class="form-note">Seus dados vão só para a Eng+ e são usados apenas neste atendimento, conforme a LGPD.</p>' +
      '</form>');

    var form = root.querySelector('form');
    ENG.maskPhone(form.elements.whatsapp);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, bad = [];
      ['nome', 'cidade', 'uf', 'whatsapp'].forEach(function (n) {
        var ok = f[n].value.trim() !== '' && (n !== 'whatsapp' || f[n].value.replace(/\D/g, '').length >= 10);
        f[n].setAttribute('aria-invalid', String(!ok));
        if (!ok) bad.push(f[n]);
      });
      if (bad.length) { form.querySelector('.form-error').textContent = 'Preencha os campos destacados para ver o resultado.'; bad[0].focus(); return; }
      state.lead = { nome: f.nome.value.trim(), cidade: f.cidade.value.trim(), uf: f.uf.value, whatsapp: f.whatsapp.value.trim() };
      // TODO: enviar state.lead + state.r para a planilha ou CRM da Eng+ quando houver endpoint.
      state.fase = 'result'; state.dir = ''; render(true);
    });
    focusTitle();
  };

  /* ----- resultado ----- */
  var mensagemWhats = function (recs) {
    var lv = nivel();
    var respostas = ativas().filter(Boolean).map(function (q) { return '• ' + q.curto + ': ' + labelOf(q, state.r[q.id]); });
    var pend = recs.filter(function (x) { return !x.ok; }).map(function (x) { return '• ' + x.titulo; });
    return [
      '*Diagnóstico pelo site da Eng+*',
      'Resultado: *' + C.semaforo.textos[lv].status + '*',
      '',
      '*Nome:* ' + state.lead.nome,
      '*Perfil:* ' + (state.r.perfil === 'produtor' ? 'Produtor rural' : 'Empresa'),
      '*Cidade:* ' + state.lead.cidade + ' / ' + state.lead.uf,
      '*WhatsApp:* ' + state.lead.whatsapp,
      '',
      '*Respostas:*',
      respostas.join('\n'),
      '',
      pend.length ? '*O que apareceu para resolver:*\n' + pend.join('\n') : 'Nenhuma pendência apontada.',
      '',
      'Quero falar com um especialista.'
    ].join('\n');
  };

  var renderResult = function () {
    var recs = recomendacoes();
    var cards = recs.map(function (x, i) {
      return '<li class="rec' + (x.ok ? ' ok' : '') + '" style="animation-delay:' + (i * 70) + 'ms"><span class="badge">' + ico(x.ok ? 'i-check' : x.icone) + '</span><div><h4>' + esc(x.titulo) + '</h4><p>' + esc(x.texto) + '</p><span class="risk">' + esc(x.risco) + '</span>' + (x.revisar ? '<br><span class="revisar">[REVISAR COM A ENG+]</span>' : '') + '</div></li>';
    }).join('');
    var nome = state.lead.nome.split(' ')[0];
    shell(100, false, 'Diagnóstico de ' + esc(nome),
      semaforoHTML() +
      '<h3 class="diag-q" style="font-size:21px" tabindex="-1" data-focus>O que você provavelmente precisa</h3>' +
      '<ul class="recs">' + cards + '</ul>' +
      '<p class="diag-disclaimer">' + esc(C.aviso) + '</p>' +
      '<div class="diag-actions">' +
        '<a class="btn btn-wa btn-lg btn-block" target="_blank" rel="noopener" href="' + ENG.waLink(mensagemWhats(recs)) + '">' + ico('i-wa') + 'Falar com um especialista</a>' +
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
    if (state.i < ativas().length - 1) { state.i++; render(false); }
    else { state.fase = 'gate'; render(true); }
  }
  function voltar() {
    tocou = true;
    state.dir = 'back';
    if (state.fase === 'gate') state.fase = 'quiz';
    else if (state.i > 0) state.i--;
    render(false);
    state.dir = '';
  }

  render(false);
})();
