/* Aplicação de 60 segundos: uma pergunta por tela, resposta pronta para o WhatsApp.
   Substitui o Linktree + Google Forms ANTES da venda. A anamnese completa fica
   para depois do pagamento. Nada daqui é guardado: só vai para o WhatsApp. */
(function () {
  var app = document.getElementById('app');
  if (!app) return;

  // ---------- Configuração (mexa aqui) ----------
  var PLANOS = {
    online: 'Consultoria Online',
    presencial: 'Plano Presencial'
  };
  // Regra do plano sugerido: quem vai treinar na Forja Academia vai para o presencial
  function planoSugerido(r) { return r.local === 'espaco' ? 'presencial' : 'online'; }

  var PERGUNTAS = [
    { id: 'objetivo', titulo: 'Qual é o seu objetivo principal?', opcoes: [
      ['emagrecer', 'Emagrecer'], ['massa', 'Ganhar massa muscular'], ['definir', 'Definir'], ['saude', 'Melhorar condicionamento e saúde']
    ] },
    { id: 'nivel', titulo: 'Como você está hoje com treino?', opcoes: [
      ['nunca', 'Nunca treinei'], ['asvezes', 'Treino às vezes'], ['menos1', 'Treino há menos de 1 ano'], ['mais1', 'Treino há mais de 1 ano']
    ] },
    { id: 'local', titulo: 'Onde você vai treinar?', opcoes: [
      ['academia', 'Academia'], ['casa', 'Em casa'], ['espaco', 'Na Forja Academia, presencial com o Caio']
    ] },
    { id: 'dias', titulo: 'Quantos dias por semana você consegue treinar?', opcoes: [
      ['2-3', '2 a 3'], ['4', '4'], ['5+', '5 ou mais']
    ] },
    { id: 'restricao', titulo: 'Tem alguma lesão, dor ou restrição que o Caio precisa saber?', nota: 'Não precisa contar detalhes aqui. Se tiver, a gente conversa no privado.', opcoes: [
      ['nao', 'Não'], ['sim', 'Sim, explico no WhatsApp']
    ] },
    { id: 'atrapalha', multi: true, titulo: 'O que mais te atrapalhou até hoje?', nota: 'Pode marcar mais de uma.', opcoes: [
      ['constancia', 'Falta de constância'], ['montar', 'Não sei montar treino'], ['alimentacao', 'Alimentação'], ['tempo', 'Falta de tempo'], ['desisti', 'Já desisti antes']
    ] },
    { id: 'contato', titulo: 'Pra fechar: como te chamo?', campos: true }
  ];

  var GRITOS = ['Boa! Bora pra próxima.', 'Fechou. Próxima.', 'Anotado.', 'Isso. Mais uma.', 'Quase lá.', 'Última, prometo.'];

  var DIAS = { '2-3': '2 a 3 dias', '4': '4 dias', '5+': '5 ou mais dias' };
  function caminho(r) {
    var d = DIAS[r.dias] || 'alguns dias';
    var base = {
      emagrecer: 'Para emagrecer treinando ' + d + ' na semana, o caminho é treino com o volume certo, aeróbico na medida e ajuste toda vez que o corpo acostumar. Sem dieta maluca.',
      massa: 'Para ganhar massa treinando ' + d + ' na semana, o caminho é progressão de carga bem programada e constância. A primeira o protocolo resolve; a segunda a gente constrói junto.',
      definir: 'Para definir treinando ' + d + ' na semana, o caminho é manter a força enquanto o percentual de gordura desce. Treino e aeróbico andam juntos no seu protocolo.',
      saude: 'Para ganhar condicionamento treinando ' + d + ' na semana, o caminho é começar no seu ritmo e subir a régua aos poucos, sem se machucar.'
    }[r.objetivo] || '';
    var extra = {
      nunca: ' Começar do zero tem vantagem: você aprende a execução certa desde o primeiro treino, com os vídeos do app.',
      asvezes: ' O que falta não é força de vontade, é um plano que caiba na sua semana e alguém cobrando.'
    }[r.nivel] || '';
    if (r.local === 'casa') extra += ' E dá para fazer tudo em casa: o treino é montado com o que você tem.';
    return base + extra;
  }

  // ---------- Estado ----------
  var r = { atrapalha: [] }, passo = 0, escolhido = null, mexeu = false, grito = '';

  function rotulo(p, v) {
    var o = PERGUNTAS.filter(function (q) { return q.id === p; })[0].opcoes;
    for (var i = 0; i < o.length; i++) if (o[i][0] === v) return o[i][1];
    return v;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function topoApp() {
    var total = PERGUNTAS.length;
    var pct = passo >= total ? 100 : Math.round((passo / total) * 100);
    return '<div class="app__topo">' +
      (passo > 0 && passo < total ? '<button type="button" class="app__voltar" data-acao="voltar" aria-label="Voltar para a pergunta anterior">‹ Voltar</button>' : '<span></span>') +
      '<span class="app__cont">' + (passo < total ? 'Pergunta ' + (passo + 1) + ' de ' + total : 'Pronto') + '</span>' +
      '</div>' +
      '<div class="app__barra" role="progressbar" aria-label="Progresso da aplicação" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>' +
      (escolhido ? '<p class="app__escolhido">Plano escolhido: <b>' + PLANOS[escolhido] + '</b> <button type="button" data-acao="tira-plano">trocar</button></p>' : '');
  }

  function render(direcao) {
    var html = topoApp();
    if (passo < PERGUNTAS.length) {
      var q = PERGUNTAS[passo];
      html += '<div class="app__passo ' + (direcao < 0 ? 'volta' : 'vai') + '">' +
        (grito ? '<p class="app__grito">' + grito + '</p>' : '') +
        '<h3 class="app__q" tabindex="-1">' + q.titulo + '</h3>' +
        (q.nota ? '<p class="app__nota">' + q.nota + '</p>' : '');
      if (q.campos) {
        html += '<form class="app__form" novalidate>' +
          '<label>Seu nome<input name="nome" autocomplete="given-name" required aria-describedby="app-erro" value="' + esc(r.nome || '') + '"></label>' +
          '<label>Sua cidade<input name="cidade" autocomplete="address-level2" value="' + esc(r.cidade || '') + '"></label>' +
          '<p class="app__erro" id="app-erro" hidden>Escreve seu nome para o Caio saber com quem está falando.</p>' +
          '<button class="btn btn--verde btn--grande" type="submit">Ver meu plano</button>' +
          '</form>';
      } else {
        html += '<div class="app__ops' + (q.multi ? ' app__ops--multi' : '') + '">' +
          q.opcoes.map(function (o) {
            var on = q.multi ? r.atrapalha.indexOf(o[0]) > -1 : r[q.id] === o[0];
            return '<button type="button" class="op' + (on ? ' on' : '') + '" data-v="' + o[0] + '"' + (q.multi ? ' aria-pressed="' + on + '"' : '') + '>' + o[1] + '</button>';
          }).join('') + '</div>';
        if (q.multi) html += '<button type="button" class="btn btn--verde app__seguir" data-acao="seguir"' + (r.atrapalha.length ? '' : ' disabled') + '>Continuar</button>';
      }
      html += '</div>';
    } else {
      html += resultado();
    }
    app.innerHTML = html;
    if (mexeu) {
      var foco = app.querySelector('.app__q, .app__res h3');
      if (foco) foco.focus({ preventScroll: true });
    }
  }

  function plano() { return escolhido || planoSugerido(r); }

  function mensagem() {
    var atr = r.atrapalha.map(function (v) { return rotulo('atrapalha', v); }).join(', ');
    return 'Fala, Caio! Fiz a aplicação no site 💪\n' +
      '*Nome:* ' + r.nome + (r.cidade ? ' - ' + r.cidade : '') + '\n' +
      '*Objetivo:* ' + rotulo('objetivo', r.objetivo) + '\n' +
      '*Nível:* ' + rotulo('nivel', r.nivel) + '\n' +
      '*Onde vou treinar:* ' + rotulo('local', r.local) + ' · ' + rotulo('dias', r.dias) + ' dias/semana\n' +
      '*Restrição:* ' + (r.restricao === 'sim' ? 'Sim, quero explicar' : 'Não') + '\n' +
      '*O que me atrapalha:* ' + atr + '\n' +
      '*' + (escolhido ? 'Plano escolhido' : 'Plano sugerido') + ':* ' + PLANOS[plano()];
  }

  function resultado() {
    var link = window.Valente ? Valente.zap(mensagem()) : '#';
    return '<div class="app__res vai">' +
      '<svg class="app__emb" aria-hidden="true"><use href="#emblema"/></svg>' +
      '<p class="app__olho">' + esc(r.nome.split(' ')[0]) + ', seu caminho é</p>' +
      '<h3 tabindex="-1">' + PLANOS[plano()] + '</h3>' +
      '<p class="app__caminho">' + caminho(r) + '</p>' +
      '<a class="btn btn--verde btn--grande app__zap" href="' + link + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-zap"/></svg>Falar com o Caio no WhatsApp</a>' +
      '<p class="app__miudo">Suas respostas vão prontas na mensagem. Nada fica guardado no site.</p>' +
      '<button type="button" class="app__refaz" data-acao="refaz">Refazer a aplicação</button>' +
      '</div>';
  }

  function avanca() {
    // o grito depende da pergunta, não da ordem dos cliques: "Última" sai sempre na última
    grito = passo < PERGUNTAS.length - 1 ? GRITOS[passo] : '';
    passo++; render(1);
  }

  app.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    mexeu = true;
    var acao = b.getAttribute('data-acao');
    if (acao === 'voltar') { grito = ''; passo--; render(-1); return; }
    if (acao === 'seguir') { avanca(); return; }
    if (acao === 'tira-plano') { escolhido = null; render(0); return; }
    if (acao === 'refaz') { r = { atrapalha: [] }; escolhido = null; passo = 0; grito = ''; render(-1); return; }
    var v = b.getAttribute('data-v'); if (!v) return;
    var q = PERGUNTAS[passo];
    if (q.multi) {
      var i = r.atrapalha.indexOf(v);
      if (i > -1) r.atrapalha.splice(i, 1); else r.atrapalha.push(v);
      b.classList.toggle('on'); b.setAttribute('aria-pressed', i < 0);
      app.querySelector('.app__seguir').disabled = !r.atrapalha.length;
      return;
    }
    r[q.id] = v;
    b.classList.add('on');
    setTimeout(avanca, 180); // deixa ver o toque antes de deslizar
  });

  app.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, nome = f.nome.value.trim();
    if (!nome) { f.querySelector('.app__erro').hidden = false; f.nome.setAttribute('aria-invalid', 'true'); f.nome.focus(); return; }
    r.nome = nome; r.cidade = f.cidade.value.trim();
    mexeu = true; grito = ''; passo++; render(1);
  });

  // Vindo de uma carta de resultado ou de um card de plano
  var OBJ = { emagrecimento: 'emagrecer', massa: 'massa' };
  window.Aplicacao = {
    preseleciona: function (o) {
      if (o.plano && PLANOS[o.plano]) escolhido = o.plano;
      if (o.objetivo && OBJ[o.objetivo]) {
        r.objetivo = OBJ[o.objetivo];
        if (passo === 0) { passo = 1; grito = 'Objetivo: ' + rotulo('objetivo', r.objetivo) + '. Bora.'; }
      }
      mexeu = true;
      render(1);
    }
  };

  render(1);
})();
