/* Traços de inspiração rúnica, desenhados em SVG, sem fonte extra.
   NÃO são letras do Futhark: as runas de verdade carregam nomes de deuses
   (tiwaz, ansuz) e a othala tem uso neonazista. Aqui são marcas geométricas
   próprias; o texto do data-runas só decide a sequência e o comprimento.
   Uso: <span class="runas runas--lado" data-runas="CLA VALENTE"></span>
   --lado empilha na vertical; --linha escreve na horizontal. */
(function () {
  // Cada marca numa caixa de 10 x 20
  var M = [
    'M5 0v20M2 6h6M2 14h6',          // haste com duas barras
    'M5 0v20M1 10l4-4 4 4-4 4Z',      // haste atravessando losango
    'M2 0v20M8 0v20M2 10h6',          // duas hastes e ponte
    'M5 0v20M1 3l8 4M1 13l8 4',       // haste com dois cortes paralelos
    'M5 0v8M5 12v8M1 10h8',           // haste partida com travessa
    'M3 0v20M7 0v20M3 6l4 4-4 4',     // duas hastes e dente
    'M5 0v20M2 2h6M2 18h6'            // haste com tampas
  ];

  function desenha(el) {
    var txt = (el.getAttribute('data-runas') || '').toUpperCase();
    var vertical = el.classList.contains('runas--lado');
    var passo = vertical ? 28 : 16, espaco = vertical ? 14 : 10;
    var p = 0, d = '';
    for (var i = 0; i < txt.length; i++) {
      var c = txt.charCodeAt(i);
      if (txt[i] === ' ') { p += espaco; continue; }
      d += '<path transform="translate(' + (vertical ? '0 ' + p : p + ' 0') + ')" d="' + M[(c + i) % M.length] + '"/>';
      p += passo;
    }
    var w = vertical ? 10 : p, h = vertical ? p : 20;
    el.innerHTML = '<svg viewBox="-1 -1 ' + (w + 2) + ' ' + (h + 2) + '" width="' + (w + 2) + '" height="' + (h + 2) + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter" aria-hidden="true">' + d + '</svg>';
  }

  window.Runas = { desenha: desenha, todas: function (raiz) {
    (raiz || document).querySelectorAll('[data-runas]').forEach(desenha);
  } };
  window.Runas.todas();
})();
