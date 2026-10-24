/* Agrega Marketing: desenha as seções a partir de data/marketing.json e monta a mensagem da reunião. */
(function () {
  'use strict';
  var AG = window.AG, esc = AG.esc, txt = AG.txt;
  function $(s) { return document.querySelector(s); }
  function n2(i) { return (i + 1 < 10 ? '0' : '') + (i + 1); }

  AG.dados('../data/marketing.json?v=1').then(function (d) {
    var el;

    if ((el = $('[data-render="servicos"]'))) el.innerHTML = d.servicos.map(function (s, i) {
      return '<li class="servico rev" style="--i:' + (i % 3) + '"><span class="servico__n">' + n2(i) + '</span>' +
        '<h3 class="h3">' + esc(s.titulo) + '</h3><p>' + esc(s.texto) + (s.pendente ? ' ' + txt(s.pendente) : '') + '</p>' +
        '<p class="servico__quem"><span>quem cuida</span>' + esc(s.quem) + '</p></li>';
    }).join('');

    if ((el = $('[data-render="metodo"]'))) el.innerHTML = d.metodo.map(function (p, i) {
      return '<li class="passo rev" style="--i:' + i + '"><span class="passo__n">' + n2(i) + '</span>' +
        '<h3 class="h3">' + esc(p.titulo) + '</h3><p>' + esc(p.texto) + '</p></li>';
    }).join('');

    if ((el = $('[data-render="clientes"]'))) el.innerHTML = d.clientes.map(function (c, i) {
      return c && c.logo
        ? '<li class="logos__item rev" style="--i:' + i + '"><img src="../assets/img/clientes/' + esc(c.logo) + '" alt="' + esc(c.nome) + '" loading="lazy"></li>'
        : '<li class="logos__item logos__item--vazio rev" style="--i:' + i + '"><span class="ph">[logo do cliente]</span></li>';
    }).join('');

    if ((el = $('[data-render="cases"]'))) el.innerHTML = d.cases.map(function (c, i) {
      return '<article class="case rev" style="--i:' + i + '"><p class="case__marca">' + txt(c.marca, '[cliente, com autorização]') + '</p>' +
        '<dl><div><dt>Desafio</dt><dd>' + txt(c.desafio, '[o que o cliente precisava]') + '</dd></div>' +
        '<div><dt>O que foi feito</dt><dd>' + txt(c.feito, '[estratégia, conteúdo, anúncios]') + '</dd></div>' +
        '<div class="case__res"><dt>Resultado</dt><dd>' + txt(c.resultado, '[resultado em número, com a fonte]') + '</dd></div></dl></article>';
    }).join('');

    if ((el = $('[data-render="depoimentos"]'))) el.innerHTML = d.depoimentos.map(function (t, i) {
      return '<figure class="depo rev" style="--i:' + i + '"><span class="depo__aspas" aria-hidden="true">“</span>' +
        '<blockquote><p>' + esc(t.texto) + '</p></blockquote>' +
        '<figcaption><strong>' + esc(t.nome) + '</strong><span>' + esc(t.fonte) + ' <span class="ph">[autorização pendente]</span></span></figcaption></figure>';
    }).join('');

    if ((el = $('[data-render="time"]'))) el.innerHTML = d.time.map(function (p, i) {
      var nome = esc(p.nome) + ('sobrenome' in p ? ' <span class="ph">' + esc(p.sobrenome || '[sobrenome]') + '</span>' : '');
      return '<li class="pessoa rev" style="--i:' + (i % 5) + '">' +
        '<svg class="pessoa__letras" viewBox="0 -60 380 90" aria-hidden="true"><use href="#ag-palavra"/></svg>' +
        '<img class="pessoa__foto" src="../assets/img/time/' + esc(p.foto) + '.webp" alt="' + esc(p.nome) + ', ' + esc(p.cargo) + ' da Agrega" width="400" height="440" loading="lazy">' +
        '<p class="pessoa__cargo">' + esc(p.cargo).replace(' / ', '/<br>') + '</p>' +
        '<p class="pessoa__texto">' + esc(p.texto) + '</p>' +
        '<h3 class="pessoa__nome">' + nome + '</h3></li>';
    }).join('') +
      // o décimo lugar da grade fecha a conta: convite para a reunião
      '<li class="pessoa pessoa--convite rev" style="--i:4"><svg class="pessoa__selo" viewBox="0 0 200 200" aria-hidden="true"><use href="#ag-mkt"/></svg>' +
      '<div class="pessoa__convite"><p class="pessoa__chamada">Quer esse time cuidando da sua marca?</p><a class="btn btn--tinta" href="#contato">Agendar reunião</a></div></li>';

    AG.faq($('[data-render="faq"]'), d.faq);
    if (AG.tunel) AG.tunel(d.time);
    AG.revelar();
  }).catch(function () {
    document.querySelectorAll('[data-render]').forEach(function (el) {
      el.innerHTML = '<p class="falha">Não consegui carregar esta parte. Recarregue a página.</p>';
    });
  });

  /* ---------- CTA final: a mensagem sai pronta para o WhatsApp da Marketing ---------- */
  var form = document.getElementById('form-reuniao');
  var erro = document.getElementById('erro-reuniao');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var nome = f.nome.value.trim();
    if (!nome) { erro.hidden = false; f.nome.setAttribute('aria-invalid', 'true'); f.nome.focus(); return; }
    erro.hidden = true; f.nome.removeAttribute('aria-invalid');
    var objetivo = (form.querySelector('[name=objetivo]:checked') || {}).value;
    var verba = (form.querySelector('[name=verba]:checked') || {}).value;
    var linhas = ['Olá, Agrega! Quero agendar uma reunião.', '• *Nome:* ' + nome];
    if (f.empresa.value.trim()) linhas.push('• *Empresa / Instagram:* ' + f.empresa.value.trim());
    if (f.segmento.value.trim()) linhas.push('• *Segmento:* ' + f.segmento.value.trim());
    if (objetivo) linhas.push('• *Objetivo:* ' + objetivo);
    if (verba) linhas.push('• *Já investe em anúncios?* ' + verba);
    AG.abrirWa('marketing', linhas.join('\n'), 'meeting_request', { goal: objetivo || '', ad_budget: verba || '' });
  });

  /* ---------- podcast: sem link ainda, o botão avisa em vez de abrir um player vazio ---------- */
  var play = document.querySelector('[data-podcast]');
  if (play) play.addEventListener('click', function () {
    var url = AG.marketing.podcast;
    var tela = document.getElementById('podcast-tela');
    if (!url) { play.outerHTML = '<p class="podcast__aviso"><span class="ph">[falta o link do episódio: config.js → marketing.podcast]</span></p>'; return; }
    var f = document.createElement('iframe');
    f.src = url; f.title = 'Podcast da Agrega'; f.allow = 'autoplay; encrypted-media'; f.loading = 'lazy';
    tela.innerHTML = ''; tela.appendChild(f); tela.classList.add('podcast__tela--aberta');
  });
})();
