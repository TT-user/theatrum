/* Inovar: "Chamar o veterinário". Formulário em 5 passos que vira mensagem no WhatsApp.
   Para quem vai cada tipo de pedido fica em data/config.json → rotas. */
(function () {
  'use strict';
  var I = window.Inovar;
  if (!I) return;

  var dlg = document.getElementById('agenda');
  var form = document.getElementById('agenda-form');
  var steps = form.querySelectorAll('.step');
  var nTxt = document.getElementById('agenda-n');
  var bar = document.getElementById('agenda-bar');
  var btVoltar = document.getElementById('agenda-voltar');
  var btProx = document.getElementById('agenda-prox');
  var btEnviar = document.getElementById('agenda-enviar');
  var erro = document.getElementById('agenda-err');
  var emerg = document.getElementById('emerg');
  var propCampos = document.getElementById('prop-campos');
  var destinoTxt = document.getElementById('agenda-destino');
  var total = steps.length;
  var atual = 1;

  function val(nome) {
    var el = form.elements[nome];
    if (!el) return '';
    if (el instanceof RadioNodeList || (el.length && el[0] && el[0].type === 'radio')) {
      var c = form.querySelector('input[name="' + nome + '"]:checked'); return c ? c.value : '';
    }
    return (el.value || '').trim();
  }

  function rotaAtual() {
    var r = I.config().rotas;
    if (val('servico') === 'Emergência') return { rota: r.emergencia };
    var onde = val('onde');
    if (onde.indexOf('loja-') === 0) return { rota: 'loja', loja: onde.slice(5) };
    return { rota: r.agendamento_na_propriedade };
  }

  function descreverDestino() {
    var r = rotaAtual(), cfg = I.config();
    if (r.rota === 'loja') return 'A mensagem vai para o WhatsApp da loja ' + I.lojaPorId(r.loja).nome + '.';
    var v = cfg.veterinarios.filter(function (x) { return x.id === r.rota; })[0];
    return v ? 'A mensagem vai para o WhatsApp do ' + v.curto + '.' : 'No próximo toque você escolhe com qual veterinário falar.';
  }

  function ir(n) {
    atual = n;
    steps.forEach(function (s) { s.hidden = +s.dataset.step !== n; });
    nTxt.textContent = 'Passo ' + n + ' de ' + total;
    bar.style.width = (n / total * 100) + '%';
    btVoltar.disabled = n === 1;
    btProx.hidden = n === total;
    btEnviar.hidden = n !== total;
    erro.hidden = true;
    if (n === total) destinoTxt.textContent = descreverDestino();
    var foco = steps[n - 1].querySelector('input:checked, input, textarea');
    if (foco && n > 1) foco.focus({ preventScroll: true });
    form.querySelector('.drawer-body').scrollTop = 0;
  }

  function validar(n) {
    if (n === 1 && !val('animal')) return 'Escolha o animal.';
    if (n === 2 && !val('servico')) return 'Escolha o serviço.';
    if (n === 3) {
      if (!val('onde')) return 'Escolha onde vai ser o atendimento.';
      if (val('onde') === 'propriedade' && !val('cidade')) return 'Diga a cidade da propriedade.';
    }
    if (n === 5 && !val('nome')) return 'Diga seu nome.';
    return '';
  }

  function mostrarErro(m) { erro.textContent = m; erro.hidden = !m; }

  btProx.addEventListener('click', function () {
    var m = validar(atual); if (m) return mostrarErro(m);
    ir(atual + 1);
  });
  btVoltar.addEventListener('click', function () { if (atual > 1) ir(atual - 1); });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'servico') emerg.hidden = e.target.value !== 'Emergência';
    if (e.target.name === 'onde') propCampos.hidden = e.target.value !== 'propriedade';
    if (e.target.name === 'onde' && e.target.value.indexOf('loja-') === 0) I.setLoja(e.target.value.slice(5));
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  function dataBr(iso) { var p = iso.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; }

  function mensagem(saudacao) {
    var onde = val('onde'), linhas = [];
    var emergencia = val('servico') === 'Emergência';
    linhas.push((saudacao ? 'Olá, ' + saudacao + '!' : 'Olá, Inovar!') + (emergencia ? ' É uma EMERGÊNCIA 🚨' : ' Quero agendar um atendimento veterinário 🩺'));
    linhas.push('*Serviço:* ' + val('servico'));
    linhas.push('*Animal:* ' + val('animal') + (val('quantos') ? ' (' + val('quantos') + (val('quantos') === '1' ? ' animal)' : ' animais)') : ''));
    if (onde === 'propriedade') {
      linhas.push('*Onde:* Na propriedade, ' + [val('cidade'), val('comunidade') && 'comunidade ' + val('comunidade'), val('referencia') && 'ref.: ' + val('referencia')].filter(Boolean).join(', '));
    } else {
      linhas.push('*Onde:* Na loja de ' + I.lojaPorId(onde.slice(5)).nome);
    }
    if (val('relato')) linhas.push('*O que está acontecendo:* ' + val('relato'));
    if (val('dia') || val('periodo')) linhas.push('*Melhor dia:* ' + [val('dia') && dataBr(val('dia')), val('periodo') && '(' + val('periodo') + ')'].filter(Boolean).join(' '));
    linhas.push('*Nome:* ' + val('nome'));
    if (val('whats')) linhas.push('*WhatsApp:* ' + val('whats'));
    return linhas.join('\n');
  }

  btEnviar.addEventListener('click', function () {
    var m = validar(atual); if (m) return mostrarErro(m);
    var r = rotaAtual();
    I.destino(r.rota, function (d) {
      I.abrirWa(d.numero, mensagem(d.tipo === 'vet' ? d.saudacao : ''));
      I.fechar(dlg);
    }, r.loja);
  });

  // Botões de emergência: WhatsApp direto dos dois veterinários
  I.pronto.then(function (cfg) {
    var box = document.getElementById('emerg-btns');
    cfg.veterinarios.forEach(function (v) {
      var a = document.createElement('a');
      a.className = 'btn btn-wa btn-block';
      a.target = '_blank'; a.rel = 'noopener';
      a.href = 'https://wa.me/' + v.whatsapp + '?text=' + encodeURIComponent('Olá, ' + v.curto + '! É uma emergência com um animal. Vim pelo site da Inovar.');
      a.innerHTML = '<svg class="ico"><use href="#i-wa"/></svg> ';
      a.appendChild(document.createTextNode(v.nome));
      box.appendChild(a);
    });
  });

  // Abrir a partir de qualquer botão [data-agendar="Serviço"] (e data-onde opcional)
  I.agendar = function (servico, onde) {
    form.reset();
    emerg.hidden = true; propCampos.hidden = true;
    if (servico) {
      var r = form.querySelector('input[name="servico"][value="' + servico + '"]');
      if (r) r.checked = true;
      emerg.hidden = servico !== 'Emergência';
    }
    if (onde) {
      var o = form.querySelector('input[name="onde"][value="' + onde + '"]');
      if (o) { o.checked = true; propCampos.hidden = onde !== 'propriedade'; }
    }
    ir(1);
    I.abrir(dlg);
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-agendar]'); if (!b) return;
    I.pronto.then(function () { I.agendar(b.dataset.agendar, b.dataset.onde); });
  });
})();
