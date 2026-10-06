/* Campo Vivo (demo): calendário do rebanho, lido de data/calendario.json. O mês atual abre marcado. */
(function () {
  'use strict';
  var I = window.CampoVivo;
  var track = document.getElementById('cal-track');
  if (!I || !track) return;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  fetch('data/calendario.json').then(function (r) { return r.json(); }).then(function (meses) {
    var agora = new Date().getMonth();
    track.innerHTML = meses.map(function (m, i) {
      var a = m.acao || {};
      var botao = a.tipo === 'agendar'
        ? '<button type="button" class="btn btn-line btn-sm" data-agendar="' + esc(a.servico) + '">' + esc(a.rotulo) + '</button>'
        : '<button type="button" class="btn btn-line btn-sm" data-cal-mes="' + esc(m.mes) + '" data-cal-texto="' + esc(a.texto || '') + '">' + esc(a.rotulo || 'Perguntar na loja') + '</button>';
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
    setas();
  }).catch(function (e) { console.error('Campo Vivo: calendário não carregou', e); });

  // ---------- Setas e arraste com o mouse ----------
  var prev = document.querySelector('.cal-prev');
  var next = document.querySelector('.cal-next');
  function passo() { var c = track.children[0], d = track.children[1]; return c && d ? d.offsetLeft - c.offsetLeft : track.clientWidth; }
  function setas() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
  }
  prev.addEventListener('click', function () { track.scrollBy({ left: -passo(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: passo(), behavior: 'smooth' }); });
  track.addEventListener('scroll', setas, { passive: true });
  window.addEventListener('resize', setas);

  var ini = null, moveu = false;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    ini = { x: e.clientX, left: track.scrollLeft }; moveu = false;
  });
  window.addEventListener('pointermove', function (e) {
    if (!ini) return;
    var dx = e.clientX - ini.x;
    if (!moveu && Math.abs(dx) > 5) { moveu = true; track.classList.add('arrastando'); }
    if (moveu) track.scrollLeft = ini.left - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!ini) return;
    ini = null;
    if (!moveu) return;
    // encaixa no mês mais próximo
    var p = passo(), alvo = Math.round(track.scrollLeft / p) * p;
    track.classList.remove('arrastando');
    track.scrollLeft = track.scrollLeft; // mantém a posição ao religar o snap
    track.scrollTo({ left: alvo, behavior: 'smooth' });
  });
  // um arraste não conta como clique no botão do mês
  track.addEventListener('click', function (e) { if (moveu) { e.stopPropagation(); e.preventDefault(); moveu = false; } }, true);
  track.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // Perguntar na loja: vai para a loja preferida ou a pessoa escolhe
  track.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cal-mes]'); if (!b) return;
    I.pronto.then(function () {
      I.destino('loja', function (d) {
        I.abrirWa(d.numero, 'Olá, Campo Vivo! Vi no calendário do rebanho do site (' + b.dataset.calMes + '). ' + b.dataset.calTexto);
      });
    });
  });
})();
