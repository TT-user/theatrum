/* Agrega Print: catálogo a partir de data/print.json, galeria com filtro e a gaveta de orçamento (seção 7.4). */
(function () {
  'use strict';
  var AG = window.AG, esc = AG.esc, txt = AG.txt;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function n2(i) { return (i + 1 < 10 ? '0' : '') + (i + 1); }
  function ico(nome) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + nome + '"/></svg>'; }
  var PRODUTOS = [];

  AG.dados('../data/print.json?v=1').then(function (d) {
    PRODUTOS = d.produtos;
    var el;

    if ((el = $('[data-render="produtos"]'))) el.innerHTML = d.produtos.map(function (p, i) {
      var img = p.foto
        ? '<img src="../' + esc(p.foto) + '" alt="' + esc(p.nome) + '" loading="lazy" width="400" height="300">'
        : '<img src="../assets/ilustra/' + esc(p.arte) + '.svg?v=1" alt="" loading="lazy" width="400" height="300">';
      return '<li class="produto rev"><div class="produto__arte">' + img + '</div>' +
        '<div class="produto__corpo"><span class="produto__ico">' + ico(p.icone) + '</span>' +
        '<h3 class="h3">' + esc(p.nome) + '</h3><p>' + esc(p.texto) + (p.pendente ? ' ' + txt(p.pendente) : '') + '</p>' +
        '<a class="btn btn--pri produto__btn" href="' + AG.wa('print', 'Olá, Agrega Print! Quero um orçamento: ' + p.nome + '.') + '" data-orcar="' + esc(p.id) + '">Orçar</a></div></li>';
    }).join('');

    if ((el = $('[data-render="passos"]'))) el.innerHTML = d.passos.map(function (p, i) {
      return '<li class="passo"><span class="passo__n">' + n2(i) + '</span>' +
        '<h3 class="h3">' + esc(p.titulo) + '</h3><p>' + (p.texto ? esc(p.texto) + ' ' : '') + (p.pendente ? txt(p.pendente) : '') + '</p></li>';
    }).join('');

    if ((el = $('[data-render="porque"]'))) el.innerHTML = d.porque.map(function (p, i) {
      return '<li class="rev"><span class="porque__ico">' + ico(p.icone) + '</span>' +
        '<h3 class="h3">' + esc(p.titulo) + '</h3><p>' + esc(p.texto) + (p.pendente ? ' ' + txt(p.pendente) : '') + '</p></li>';
    }).join('');

    galeria(d.categorias, d.trabalhos);
    opcoes(d.produtos);
    AG.faq($('[data-render="faq"]'), d.faq);
    AG.revelar();
  }).catch(function () {
    $$('[data-render]').forEach(function (el) { el.innerHTML = '<p class="falha">Não consegui carregar esta parte. Recarregue a página.</p>'; });
  });

  /* ---------- galeria "Feito aqui": filtro por chip e foto ampliada ---------- */
  var FOTOS = [];
  function galeria(cats, itens) {
    var filtros = $('[data-render="filtros"]'), lista = $('[data-render="trabalhos"]');
    if (!filtros || !lista) return;
    FOTOS = itens;
    lista.classList.toggle('galeria--vazia', !itens.some(function (t) { return t.src; }));
    filtros.innerHTML = ['Todos'].concat(cats).map(function (c, i) {
      return '<button type="button" class="filtro" aria-pressed="' + (i === 0) + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');
    lista.innerHTML = itens.map(function (t, i) {
      return t.src
        ? '<li class="galeria__item" data-cat="' + esc(t.categoria) + '"><button type="button" data-foto="' + i + '"><img src="../' + esc(t.src) + '" alt="' + esc(t.alt) + '" loading="lazy"></button></li>'
        : '<li class="galeria__item galeria__item--vazio" data-cat="' + esc(t.categoria) + '">' + ico('image') + '<span>' + esc(t.categoria) + '</span><span class="ph">[foto real: ' + esc(t.alt.toLowerCase()) + ']</span></li>';
    }).join('');
    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('.filtro');
      if (!b) return;
      $$('.filtro', filtros).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.galeria__item', lista).forEach(function (li) { li.hidden = b.dataset.cat !== 'Todos' && li.dataset.cat !== b.dataset.cat; });
    });
    lista.addEventListener('click', function (e) {
      var b = e.target.closest('[data-foto]');
      if (b) abreLuz(Number(b.dataset.foto), b);
    });
  }

  var luz = $('#luz'), luzVolta = null, luzAtual = 0;
  function visiveis() { return $$('.galeria__item:not([hidden]) [data-foto]').map(function (b) { return Number(b.dataset.foto); }); }
  function abreLuz(i, de) {
    luzAtual = i; luzVolta = de || luzVolta;
    var t = FOTOS[i];
    luz.innerHTML = '<figure><img src="../' + esc(t.src) + '" alt="' + esc(t.alt) + '"><figcaption>' + esc(t.alt) + '</figcaption></figure>' +
      '<button type="button" class="luz__n luz__n--a" aria-label="Foto anterior">' + ico('chevron-left') + '</button>' +
      '<button type="button" class="luz__n" aria-label="Próxima foto">' + ico('chevron-right') + '</button>' +
      '<button type="button" class="luz__x" aria-label="Fechar">' + ico('x') + '</button>';
    luz.hidden = false;
    $('.luz__x', luz).focus();
  }
  function fechaLuz() { luz.hidden = true; luz.innerHTML = ''; if (luzVolta) luzVolta.focus(); }
  function passaLuz(dir) {
    var v = visiveis(), k = v.indexOf(luzAtual);
    if (v.length) abreLuz(v[(k + dir + v.length) % v.length]);
  }
  if (luz) {
    luz.addEventListener('click', function (e) {
      if (e.target === luz || e.target.closest('.luz__x')) fechaLuz();
      else if (e.target.closest('.luz__n--a')) passaLuz(-1);
      else if (e.target.closest('.luz__n')) passaLuz(1);
    });
    luz.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fechaLuz();
      if (e.key === 'ArrowLeft') passaLuz(-1);
      if (e.key === 'ArrowRight') passaLuz(1);
    });
  }

  /* ---------- gaveta de orçamento ---------- */
  var gaveta = $('#gaveta'), form = $('#form-orcamento'), erro = $('#erro-orcamento');
  var etapa = 1, origem = null, fechando = 0;

  function opcoes(produtos) {
    var box = $('[data-render="opcoes"]');
    if (!box) return;
    box.innerHTML = produtos.map(function (p) {
      return '<label class="opcao-prod"><input type="radio" name="produto" value="' + esc(p.id) + '"><span>' + ico(p.icone) + esc(p.nome) + '</span></label>';
    }).join('');
  }
  function produto(id) { return PRODUTOS.filter(function (p) { return p.id === id; })[0]; }
  function escolhido() { var r = form.querySelector('[name=produto]:checked'); return r && produto(r.value); }

  function vaiPara(n) {
    etapa = n;
    $$('.etapa', form).forEach(function (f) { f.hidden = Number(f.dataset.etapa) !== n; });
    $('.gaveta__passo b', gaveta).textContent = n;
    gaveta.style.setProperty('--progresso', (n / 3 * 100) + '%');
    $('[data-voltar]', form).hidden = n === 1;
    $('[data-avancar]', form).hidden = n === 3;
    $('[data-enviar]', form).hidden = n !== 3;
    erro.hidden = true;
    var p = escolhido();
    if (p) $('[data-escolha]', form).textContent = p.nome;
    if (n === 3) $('[data-resumo]', form).innerHTML = resumo();
    var alvo = $('.etapa:not([hidden]) input, .etapa:not([hidden]) textarea', form);
    if (alvo && n > 1) alvo.focus({ preventScroll: true });
  }

  function valida() {
    if (etapa === 1 && !escolhido()) { mostraErro('Escolha um produto para continuar.'); return false; }
    if (etapa === 3 && !form.elements.nome.value.trim()) { mostraErro('Escreva o seu nome para a gráfica saber com quem fala.'); form.elements.nome.focus(); return false; }
    return true;
  }
  function mostraErro(m) { erro.textContent = m; erro.hidden = false; }

  function dataBr(v) { var p = v.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : v; }
  function linhas() {
    var f = form.elements, p = escolhido();
    var arte = (form.querySelector('[name=arte]:checked') || {}).value;
    var l = ['Olá, Agrega Print! Quero um orçamento:', '• *Produto:* ' + (p ? p.nome : '')];
    if (f.quantidade.value.trim()) l.push('• *Quantidade:* ' + f.quantidade.value.trim());
    if (f.medidas.value.trim()) l.push('• *Medidas:* ' + f.medidas.value.trim());
    if (arte) l.push('• *Arte:* ' + arte);
    if (f.prazo.value) l.push('• *Prazo:* ' + dataBr(f.prazo.value));
    if (f.obs.value.trim()) l.push('• *Observações:* ' + f.obs.value.trim());
    var quem = '*Nome:* ' + f.nome.value.trim();
    if (f.cidade.value.trim()) quem += ' | *Cidade:* ' + f.cidade.value.trim();
    l.push(quem);
    return l;
  }
  function resumo() {
    var l = linhas().slice(1, -1).map(function (s) { return '<li>' + esc(s.replace(/^• /, '').replace(/\*/g, '')) + '</li>'; });
    return '<p>Vai no pedido:</p><ul>' + l.join('') + '</ul>';
  }

  function focaveis() {
    return $$('button, a[href], input, textarea, select', $('.gaveta__painel', gaveta)).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }
  function abre(id, de) {
    clearTimeout(fechando);
    origem = de || document.activeElement;
    form.reset();
    var hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    form.elements.prazo.min = hoje.toISOString().slice(0, 10);
    var r = id && form.querySelector('[name=produto][value="' + id + '"]');
    if (r) r.checked = true;
    gaveta.hidden = false;
    AG.travar(true);
    requestAnimationFrame(function () { gaveta.classList.add('gaveta--aberta'); });
    vaiPara(r ? 2 : 1);
    if (!r) { var pri = form.querySelector('[name=produto]'); if (pri) pri.focus({ preventScroll: true }); }
    AG.track('quote_open', { product: id || '' });
  }
  function fecha() {
    gaveta.classList.remove('gaveta--aberta');
    AG.travar(false);
    fechando = setTimeout(function () { gaveta.hidden = true; }, AG.calmo() ? 0 : 320);
    if (origem && origem.focus) origem.focus({ preventScroll: true });
  }

  if (gaveta && form) {
    // todo botão de orçamento abre a gaveta; sem JavaScript, o mesmo link vai direto para o WhatsApp
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-orcar]');
      if (!b || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      abre(b.dataset.orcar || null, b);
    });
    gaveta.addEventListener('click', function (e) {
      if (e.target.closest('[data-fecha]')) fecha();
      var ir = e.target.closest('[data-ir]');
      if (ir) vaiPara(Number(ir.dataset.ir));
    });
    $('[data-avancar]', form).addEventListener('click', function () { if (valida()) vaiPara(etapa + 1); });
    $('[data-voltar]', form).addEventListener('click', function () { vaiPara(etapa - 1); });
    form.addEventListener('change', function (e) { if (e.target.name === 'produto') erro.hidden = true; });
    // Enter num campo avança em vez de enviar antes da hora
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && etapa < 3) { e.preventDefault(); if (valida()) vaiPara(etapa + 1); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (etapa < 3) { if (valida()) vaiPara(etapa + 1); return; }
      if (!valida()) return;
      var p = escolhido();
      AG.abrirWa('print', linhas().join('\n'), 'quote_send_whatsapp', { product: p ? p.id : '' });
    });
    gaveta.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); fecha(); return; }
      if (e.key !== 'Tab') return;
      var f = focaveis(); if (!f.length) return;
      var pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    });
  }
})();
