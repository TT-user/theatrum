/* Portal dividido (seção 5): o hover é CSS puro; aqui só o clique que expande,
   a mídia sob demanda, o parallax da Print, as setas do teclado e a volta pelo cache. */
(function () {
  'use strict';

  var portal = document.getElementById('portal');
  if (!portal) return;
  var lados = portal.querySelectorAll('.side');
  var reduz = matchMedia('(prefers-reduced-motion: reduce)');
  var computador = matchMedia('(hover: hover) and (min-width: 1024px)');
  var still = /[?&]still=1/.test(location.search);
  if (still) document.documentElement.classList.add('still');
  var track = (window.AG && window.AG.track) || function () {};

  /* clique: o lado escolhido toma a tela e a navegação começa no meio da expansão */
  portal.addEventListener('click', function (e) {
    var lado = e.target.closest('.side');
    if (!lado || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || reduz.matches || still) {
      if (lado) track('portal_choose_side', { side: lado.dataset.side });
      return;
    }
    e.preventDefault();
    if (portal.dataset.entering) return;
    portal.dataset.entering = lado.dataset.side;
    track('portal_choose_side', { side: lado.dataset.side });
    setTimeout(function () { location.href = lado.href; }, 450);
  });

  var ambos = portal.querySelector('.portal__both');
  if (ambos) ambos.addEventListener('click', function () { track('portal_both_click', {}); });

  /* voltar pelo navegador: a página pode voltar do cache ainda expandida */
  addEventListener('pageshow', function (e) { if (e.persisted) portal.dataset.entering = ''; });

  /* setas trocam o foco entre os lados */
  portal.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (!e.target.classList || !e.target.classList.contains('side')) return;
    e.preventDefault();
    (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? lados[0] : lados[1]).focus();
  });

  /* hover: mídia carrega no primeiro foco de cada lado; o evento sai uma vez por lado */
  var visto = {};
  function emFoco(lado) {
    var s = lado.dataset.side;
    if (!visto[s]) { visto[s] = 1; track('portal_hover_side', { side: s }); }
    if (!computador.matches) return;
    var img = lado.querySelector('img[data-src]');
    if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    prebusca();
  }
  lados.forEach(function (lado) {
    lado.addEventListener('pointerenter', function () { emFoco(lado); });
    lado.addEventListener('focus', function () { emFoco(lado); });
  });

  /* plano B para navegador sem Speculation Rules: prefetch comum no primeiro foco */
  var buscou = false;
  function prebusca() {
    if (buscou) return;
    buscou = true;
    if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) return;
    lados.forEach(function (lado) {
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.href = lado.href;
      document.head.appendChild(l);
    });
  }

  /* Print: as três peças seguem o cursor (±12 px), só no computador e com movimento */
  var prt = portal.querySelector('.side--prt');
  var quadro = 0, mx = 0, my = 0;
  prt.addEventListener('pointermove', function (e) {
    if (!computador.matches || reduz.matches) return;
    var r = prt.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - .5) * 2;
    my = ((e.clientY - r.top) / r.height - .5) * 2;
    if (!quadro) quadro = requestAnimationFrame(function () {
      quadro = 0;
      prt.style.setProperty('--mx', mx.toFixed(3));
      prt.style.setProperty('--my', my.toFixed(3));
    });
  });
  prt.addEventListener('pointerleave', function () { prt.style.setProperty('--mx', 0); prt.style.setProperty('--my', 0); });
})();
