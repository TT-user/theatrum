/* Aceno Marketing: desenha as seções a partir de data/marketing.json e monta a mensagem da reunião. */
(function () {
  'use strict';
  var AG = window.AG, esc = AG.esc, txt = AG.txt;
  function $(s) { return document.querySelector(s); }
  function n2(i) { return (i + 1 < 10 ? '0' : '') + (i + 1); }

  AG.dados('../data/marketing.json?v=1').then(function (d) {
    var el;

    if ((el = $('[data-render="servicos"]'))) el.innerHTML = d.servicos.map(function (s, i) {
      return '<li class="servico rev"><span class="servico__n">' + n2(i) + '</span>' +
        '<h3 class="h3">' + esc(s.titulo) + '</h3><p>' + esc(s.texto) + (s.pendente ? ' ' + txt(s.pendente) : '') + '</p>' +
        '<p class="servico__quem"><span>quem cuida</span>' + esc(s.quem) + '</p></li>';
    }).join('');

    if ((el = $('[data-render="metodo"]'))) el.innerHTML = d.metodo.map(function (p, i) {
      return '<li class="passo"><span class="passo__n">' + n2(i) + '</span>' +
        '<h3 class="h3">' + esc(p.titulo) + '</h3><p>' + esc(p.texto) + '</p></li>';
    }).join('');

    // clientes: letreiro com a lista duas vezes (a cópia só emenda a volta, escondida do leitor de tela)
    if ((el = $('[data-render="clientes"]'))) {
      var logos = d.clientes.map(function (c) {
        return '<li class="logos__item"><img src="../assets/img/clientes/' + esc(c.logo) + '" alt="' + esc(c.nome) + '" width="' + c.w + '" height="' + c.h + '" style="--h:' + c.h + 'px" loading="lazy" decoding="async"></li>';
      }).join('');
      el.innerHTML = '<ul class="logos__trilho" role="list">' + logos + '</ul>' +
        '<ul class="logos__trilho" aria-hidden="true">' + logos.replace(/alt="[^"]*"/g, 'alt=""') + '</ul>';
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
        el.classList.toggle('parado', !es[0].isIntersecting || document.hidden);
      }).observe(el);
    }

    if ((el = $('[data-render="cases"]'))) el.innerHTML = d.cases.map(function (c, i) {
      return '<article class="case rev"><p class="case__marca">' + txt(c.marca, '[cliente, com autorização]') + '</p>' +
        '<dl><div><dt>Desafio</dt><dd>' + txt(c.desafio, '[o que o cliente precisava]') + '</dd></div>' +
        '<div><dt>O que foi feito</dt><dd>' + txt(c.feito, '[estratégia, conteúdo, anúncios]') + '</dd></div>' +
        '<div class="case__res"><dt>Resultado</dt><dd>' + txt(c.resultado, '[resultado em número, com a fonte]') + '</dd></div></dl></article>';
    }).join('');

    if ((el = $('[data-render="depoimentos"]'))) el.innerHTML = d.depoimentos.map(function (t, i) {
      return '<figure class="depo rev"><span class="depo__aspas" aria-hidden="true">“</span>' +
        '<blockquote><p>' + esc(t.texto) + '</p></blockquote>' +
        '<figcaption><strong>' + esc(t.nome) + '</strong><span>' + esc(t.fonte) + '</span></figcaption></figure>';
    }).join('');

    if ((el = $('[data-render="time"]'))) el.innerHTML = d.time.map(function (p, i) {
      var nome = esc(p.nome) + ('sobrenome' in p ? ' <span class="ph">' + esc(p.sobrenome || '[sobrenome]') + '</span>' : '');
      // card limpo: foto, nome e cargo; o que a pessoa faz fica só para leitor de tela
      return '<li class="pessoa rev">' +
        '<div class="pessoa__moldura"><span class="pessoa__aro" aria-hidden="true"></span>' +
        '<div class="pessoa__recorte"><img src="../assets/img/time/' + esc(p.foto) + '-redondo.webp" alt="' + esc(p.nome) + ', ' + esc(p.cargo) + ' da Aceno" width="480" height="480" loading="lazy"></div></div>' +
        '<h3 class="pessoa__nome">' + nome + '</h3>' +
        '<p class="pessoa__cargo">' + esc(p.cargo) + '</p>' +
        '<p class="sr-only">' + esc(p.texto) + '</p></li>';
    }).join('') +
      // o décimo lugar da grade fecha a conta: convite para a reunião
      '<li class="pessoa pessoa--convite rev"><svg class="pessoa__selo" viewBox="0 0 200 200" aria-hidden="true"><use href="#ag-mkt"/></svg>' +
      '<div class="pessoa__convite"><p class="pessoa__chamada">Quer esse time cuidando da sua marca?</p><a class="btn btn--tinta" href="#contato">Agendar reunião</a></div></li>';

    AG.vitrine($('[data-render="videos"]'), d.videos, $('[data-vv-nav]'));
    AG.faq($('[data-render="faq"]'), d.faq);
    AG.revelar();
  }).catch(function () {
    document.querySelectorAll('[data-render]').forEach(function (el) {
      el.innerHTML = '<p class="falha">Não consegui carregar esta parte. Recarregue a página.</p>';
    });
  });

  /* ---------- selo do hero: o mouse inclina as camadas (só com mouse e com movimento) ---------- */
  var hero = document.getElementById('hero');
  var giro = hero && hero.querySelector('.simbolo__giro');
  if (giro && matchMedia('(hover: hover) and (pointer: fine)').matches && !AG.calmo()) {
    var quadro = 0, gx = 0, gy = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = giro.getBoundingClientRect();
      gx = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / r.width));
      gy = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / r.height));
      if (!quadro) quadro = requestAnimationFrame(function () {
        quadro = 0;
        giro.style.setProperty('--ry', (gx * 14).toFixed(2) + 'deg');
        giro.style.setProperty('--rx', (-gy * 14).toFixed(2) + 'deg');
      });
    });
    hero.addEventListener('pointerleave', function () { giro.style.setProperty('--ry', '0deg'); giro.style.setProperty('--rx', '0deg'); });
  }

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
    var linhas = ['Olá, Aceno! Quero agendar uma reunião.', '• *Nome:* ' + nome];
    if (f.empresa.value.trim()) linhas.push('• *Empresa / Instagram:* ' + f.empresa.value.trim());
    if (f.segmento.value.trim()) linhas.push('• *Segmento:* ' + f.segmento.value.trim());
    if (objetivo) linhas.push('• *Objetivo:* ' + objetivo);
    if (verba) linhas.push('• *Já investe em anúncios?* ' + verba);
    AG.abrirWa('marketing', linhas.join('\n'), 'meeting_request', { goal: objetivo || '', ad_budget: verba || '' });
  });
})();
