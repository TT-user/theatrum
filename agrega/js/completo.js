/* Projeto Completo: combos de data/completo.json e o pedido mastigado no WhatsApp (seção 8). */
(function () {
  'use strict';
  var AG = window.AG, esc = AG.esc;
  var form = document.getElementById('form-completo');
  var erro = document.getElementById('erro-completo');
  var COMBOS = [];

  // enquanto a Agrega não decide quem recebe, o aviso fica à vista
  var aviso = document.querySelector('[data-numero-completo]');
  if (aviso) aviso.hidden = !!AG.whatsappProjetoCompleto;

  AG.dados('../data/completo.json?v=1').then(function (d) {
    COMBOS = d.combos;
    document.querySelector('[data-render="combos"]').innerHTML = d.combos.map(function (c, i) {
      return '<article class="combo rev"><h3 class="h3">' + esc(c.titulo) + '</h3>' +
        '<div class="combo__parte combo__parte--mkt"><span class="selo selo--mkt">Marketing</span><p>' + esc(c.marketing) + '</p></div>' +
        '<div class="combo__parte combo__parte--prt"><span class="selo selo--prt">Print</span><p>' + esc(c.print) + '</p></div>' +
        (c.preco ? '<p class="combo__preco">' + esc(c.preco) + '</p>' : '') +
        '<a class="btn btn--pri" href="#pedido" data-combo="' + esc(c.id) + '">Quero este combo</a></article>';
    }).join('');
    form.elements.combo.insertAdjacentHTML('beforeend', d.combos.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.titulo) + '</option>';
    }).join(''));
    AG.revelar();
  }).catch(function () {
    document.querySelector('[data-render="combos"]').innerHTML = '<p class="falha">Não consegui carregar os combos. Recarregue a página.</p>';
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-combo]');
    if (!b) return;
    form.elements.combo.value = b.dataset.combo;
    setTimeout(function () { form.elements.nome.focus({ preventScroll: true }); }, AG.calmo() ? 0 : 500);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, nome = f.nome.value.trim();
    if (!nome) { erro.hidden = false; f.nome.setAttribute('aria-invalid', 'true'); f.nome.focus(); return; }
    erro.hidden = true; f.nome.removeAttribute('aria-invalid');
    var combo = COMBOS.filter(function (c) { return c.id === f.combo.value; })[0];
    var l = ['Olá, Agrega! Quero um Projeto Completo (Marketing + Print).', '• *Combo:* ' + (combo ? combo.titulo : 'ainda não sei'), '• *Nome:* ' + nome];
    if (f.empresa.value.trim()) l.push('• *Empresa / Instagram:* ' + f.empresa.value.trim());
    if (f.obs.value.trim()) l.push('• *O que preciso:* ' + f.obs.value.trim());
    AG.abrirWa('completo', l.join('\n'), 'combo_request', { combo: combo ? combo.id : '' });
  });

})();
