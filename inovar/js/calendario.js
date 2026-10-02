/* Inovar: calendário do rebanho, lido de data/calendario.json. O mês atual abre marcado. */
(function () {
  'use strict';
  var I = window.Inovar;
  var track = document.getElementById('cal-track');
  if (!I || !track) return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  fetch('data/calendario.json').then(function (r) { return r.json(); }).then(function (meses) {
    var agora = new Date().getMonth();
    track.innerHTML = meses.map(function (m, i) {
      var a = m.acao || {};
      var botao = a.tipo === 'agendar'
        ? '<button type="button" class="btn btn-line btn-sm" data-agendar="' + esc(a.servico) + '">' + esc(a.rotulo) + '</button>'
        : '<button type="button" class="btn btn-line btn-sm" data-cal-cat="' + esc(a.categoria || '') + '" data-cal-busca="' + esc(a.busca || '') + '">' + esc(a.rotulo || 'Ver produtos') + '</button>';
      return '<article class="cal-m' + (i === agora ? ' agora' : '') + '"' + (i === agora ? ' aria-current="date"' : '') + '>' +
        (i === agora ? '<span class="cal-agora">Este mês</span>' : '') +
        '<h3>' + esc(m.mes) + ' <span class="cal-est' + (m.estacao === 'seca' ? ' seca' : '') + '">' + esc(m.estacao) + '</span></h3>' +
        '<ul>' + m.itens.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        (m.revisar ? '<span class="ph">[REVISAR COM OS VETERINÁRIOS]</span>' : '') +
        botao + '</article>';
    }).join('');

    // Rola só a faixa (não a página) até o mês atual
    var atual = track.children[agora];
    if (atual) track.scrollLeft = atual.offsetLeft - track.firstElementChild.offsetLeft;
  }).catch(function (e) { console.error('Inovar: calendário não carregou', e); });

  track.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cal-cat]'); if (!b || !I.filtrarCatalogo) return;
    I.filtrarCatalogo(b.dataset.calCat, b.dataset.calBusca);
  });
})();
