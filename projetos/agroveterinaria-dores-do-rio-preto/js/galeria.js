/* Inovar: "Dia a dia vet". Seis fotos ou vídeos do Instagram.
   Para trocar: salve a foto em assets/fotos/ (WebP, uns 400 px) e preencha foto, alt e link.
   Item sem foto aparece como placeholder amarelo. */
(function () {
  'use strict';
  var GALERIA = [
    { foto: '', alt: '', link: '', legenda: '[FOTO DO DIA A DIA NO CAMPO]' },
    { foto: '', alt: '', link: '', legenda: '[FOTO DE VACINAÇÃO]' },
    { foto: '', alt: '', link: '', legenda: '[FOTO DA LOJA POR DENTRO]' },
    { foto: '', alt: '', link: '', legenda: '[VÍDEO DO INSTAGRAM]' },
    { foto: '', alt: '', link: '', legenda: '[FOTO DE ULTRASSOM]' },
    { foto: '', alt: '', link: '', legenda: '[FOTO DO SILOTRATO]' }
  ];

  var ul = document.getElementById('gal-grid');
  if (!ul) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  ul.innerHTML = GALERIA.map(function (g) {
    if (g.foto) {
      var img = '<img src="' + esc(g.foto) + '" alt="' + esc(g.alt) + '" width="400" height="400" loading="lazy" decoding="async">';
      return '<li>' + (g.link ? '<a href="' + esc(g.link) + '" target="_blank" rel="noopener">' + img + '</a>' : img) + '</li>';
    }
    return '<li><div class="gal-ph"><svg class="ico" aria-hidden="true"><use href="#i-ig"/></svg><span class="ph">' + esc(g.legenda) + '</span></div></li>';
  }).join('');
})();
