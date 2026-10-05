/* Feixes de luz no fundo (adaptação em JS puro do "Beams Background").
   Uso: <section data-feixes="medio"> (sutil | medio | forte).
   Leve: desenha em baixa resolução (o desfoque do CSS esconde), pausa fora da tela
   e com a aba oculta, e fica estático com prefers-reduced-motion. */
(function () {
  'use strict';

  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ESCALA = 0.35;                      // resolução interna do canvas
  var OPACIDADE = { sutil: 0.7, medio: 0.85, forte: 1 };
  // Paleta da marca: dourado, âmbar e um vinho rosado
  var CORES = [
    { h: 40, s: 62, l: 64 }, { h: 36, s: 58, l: 60 }, { h: 44, s: 55, l: 70 },
    { h: 30, s: 50, l: 55 }, { h: 350, s: 55, l: 52 }
  ];

  function criarFeixe(w, h) {
    var cor = CORES[Math.floor(Math.random() * CORES.length)];
    return {
      x: Math.random() * w * 1.5 - w * 0.25,
      y: Math.random() * h * 1.5 - h * 0.25,
      largura: 30 + Math.random() * 60,
      comprimento: h * 2.5,
      angulo: -35 + Math.random() * 10,
      velocidade: 0.6 + Math.random() * 1.2,
      opacidade: 0.12 + Math.random() * 0.16,
      cor: cor,
      pulso: Math.random() * Math.PI * 2,
      ritmo: 0.02 + Math.random() * 0.03
    };
  }

  function iniciar(secao) {
    var canvas = document.createElement('canvas');
    canvas.className = 'feixes';
    canvas.setAttribute('aria-hidden', 'true');
    secao.insertBefore(canvas, secao.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var fator = OPACIDADE[secao.getAttribute('data-feixes')] || OPACIDADE.medio;
    var feixes = [], W = 0, H = 0, quadro = 0, visivel = false;

    function medir() {
      var r = secao.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * ESCALA);
      canvas.height = Math.round(H * ESCALA);
      ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
      var qtd = W < 700 ? 16 : 26;
      feixes = Array.from({ length: qtd }, function () { return criarFeixe(W, H); });
    }

    function reiniciar(f, i, total) {
      var coluna = i % 3, espaco = W / 3;
      f.y = H + 100;
      f.x = coluna * espaco + espaco / 2 + (Math.random() - 0.5) * espaco * 0.5;
      f.largura = 100 + Math.random() * 100;
      f.velocidade = 0.5 + Math.random() * 0.4;
      f.cor = CORES[i % CORES.length];
      f.opacidade = 0.2 + Math.random() * 0.1;
    }

    function desenhar(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angulo * Math.PI / 180);
      var a = f.opacidade * (0.8 + Math.sin(f.pulso) * 0.2) * fator;
      var c = f.cor.h + ',' + f.cor.s + '%,' + f.cor.l + '%,';
      var g = ctx.createLinearGradient(0, 0, 0, f.comprimento);
      g.addColorStop(0, 'hsla(' + c + '0)');
      g.addColorStop(0.1, 'hsla(' + c + (a * 0.5) + ')');
      g.addColorStop(0.4, 'hsla(' + c + a + ')');
      g.addColorStop(0.6, 'hsla(' + c + a + ')');
      g.addColorStop(0.9, 'hsla(' + c + (a * 0.5) + ')');
      g.addColorStop(1, 'hsla(' + c + '0)');
      ctx.fillStyle = g;
      ctx.fillRect(-f.largura / 2, 0, f.largura, f.comprimento);
      ctx.restore();
    }

    function passo(mover) {
      ctx.clearRect(0, 0, W, H);
      var total = feixes.length;
      feixes.forEach(function (f, i) {
        if (mover) {
          f.y -= f.velocidade;
          f.pulso += f.ritmo;
          if (f.y + f.comprimento < -100) reiniciar(f, i, total);
        }
        desenhar(f);
      });
    }

    function animar() {
      passo(true);
      quadro = requestAnimationFrame(animar);
    }
    function ligar() {
      if (reduzir || quadro || !visivel || document.hidden) return;
      quadro = requestAnimationFrame(animar);
    }
    function desligar() {
      if (quadro) cancelAnimationFrame(quadro);
      quadro = 0;
    }

    medir();
    passo(false); // primeiro quadro (e único, com movimento reduzido)

    var espera;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(function () { medir(); passo(false); }, 150);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) desligar(); else ligar();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (itens) {
        visivel = itens[0].isIntersecting;
        if (visivel) ligar(); else desligar();
      }).observe(secao);
    } else { visivel = true; ligar(); }
  }

  document.querySelectorAll('[data-feixes]').forEach(iniciar);
})();
