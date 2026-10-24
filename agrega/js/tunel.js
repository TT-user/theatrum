/* Hero da Marketing: túnel em perspectiva com o time (o "perspective tunnel hero", refeito em JS puro).
   Os cards vêm do fundo até a câmera em loop; rolar a página acelera a viagem (sem prender a rodinha);
   o mouse move a câmera. Só transform e opacidade, só com o hero à vista e a aba aberta.
   Com movimento reduzido ou ?still=1 fica uma composição parada. */
(function () {
  'use strict';
  var AG = window.AG;

  AG.tunel = function (pessoas) {
    var hero = document.getElementById('hero');
    var palco = hero && hero.querySelector('.tunel');
    if (!palco || palco.dataset.pronto) return;
    palco.dataset.pronto = '1';

    var itens = pessoas.map(function (p) { return { foto: '../assets/img/time/' + p.foto + '.webp', nome: p.nome, cargo: p.cargo }; });
    itens.splice(5, 0, { foto: '../assets/img/escritorio-420.webp', nome: 'Escritório', cargo: 'Centro de Espera Feliz' });
    palco.innerHTML = itens.map(function (p) {
      return '<figure class="tunel__card"><img src="' + AG.esc(p.foto) + '" alt="" decoding="async">' +
        '<figcaption><b>' + AG.esc(p.nome) + '</b>' + AG.esc(p.cargo) + '</figcaption></figure>';
    }).join('');

    // ângulo de ouro: os cards se espalham em volta do título sem fila nem buraco
    var cards = Array.prototype.map.call(palco.children, function (el, i) {
      var a = i * 137.5 * Math.PI / 180;
      var cos = Math.cos(a);
      // no computador ninguém voa pelo meio: o cosseno é empurrado para as laterais, longe do texto
      return { el: el, cos: cos, lado: (cos < 0 ? -1 : 1) * (.55 + .45 * Math.abs(cos)), sin: Math.sin(a), rx: .3 + (i % 3) * .07, ry: .27 + (i % 2) * .08, rot: (i % 2 ? -1 : 1) * (3 + (i % 5) * 2) };
    });
    var N = cards.length, W = 0, H = 0, movel = false;

    function medir() {
      W = palco.clientWidth; H = palco.clientHeight; movel = W < 768;
      var cw = movel ? Math.max(104, Math.min(150, W * .3)) : Math.max(170, Math.min(250, W * .16));
      palco.style.perspective = (movel ? 900 : 1200) + 'px';
      palco.style.setProperty('--cw', cw.toFixed(0) + 'px');
    }
    // aparece no começo do caminho e some antes de passar pela câmera
    function opac(t) { return t < .18 ? t / .18 : t > .82 ? Math.max(0, (.98 - t) / .16) : 1; }

    var base = 0, px = 0, py = 0, alvoX = 0, alvoY = 0;
    function desenha() {
      var longe = movel ? -1200 : -1700, perto = movel ? 350 : 500, pan = movel ? 0 : 45;
      for (var i = 0; i < N; i++) {
        var c = cards[i], t = (base + i / N) % 1;
        var z = longe + (perto - longe) * t;
        var x = (movel ? c.cos : c.lado) * W * c.rx - px * pan, y = c.sin * H * c.ry - py * pan;
        c.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(0) + 'px) rotate(' + c.rot + 'deg)';
        c.el.style.opacity = opac(t).toFixed(3);
        c.el.style.zIndex = Math.floor(t * 10);
      }
    }

    medir();
    if (AG.calmo()) { base = .3; desenha(); palco.classList.add('tunel--parado'); return; }

    var DURACAO = 16; // segundos para um card ir do fundo até a câmera
    var quadro = 0, ultimo = 0, ultimoScroll = 0, visivel = true;
    function passo(agora) {
      quadro = 0;
      var dt = ultimo ? Math.min(.05, (agora - ultimo) / 1000) : 0;
      ultimo = agora;
      var dy = scrollY - ultimoScroll;
      ultimoScroll = scrollY;
      base = (base + dt / DURACAO + dy / Math.max(H, 1) * .35) % 1;
      if (base < 0) base += 1;
      px += (alvoX - px) * .06;
      py += (alvoY - py) * .06;
      desenha();
      liga();
    }
    function liga() {
      if (quadro || !visivel || document.hidden) return;
      if (!ultimo) ultimoScroll = scrollY;
      quadro = requestAnimationFrame(passo);
    }
    function desliga() {
      if (quadro) cancelAnimationFrame(quadro);
      quadro = 0; ultimo = 0;
    }

    desenha();
    addEventListener('resize', function () { medir(); desenha(); });
    new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) liga(); else desliga(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (document.hidden) desliga(); else liga(); });
    if (matchMedia('(hover: hover)').matches) {
      addEventListener('pointermove', function (e) {
        alvoX = e.clientX / innerWidth * 2 - 1;
        alvoY = e.clientY / innerHeight * 2 - 1;
      }, { passive: true });
    }
    liga();
  };
})();
