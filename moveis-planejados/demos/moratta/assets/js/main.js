/* MORATTÁ — comportamentos do site (sem dependências) */
(function () {
  'use strict';

  /* ---- imagens ausentes viram placeholder com o nome do arquivo ---- */
  function armImages(scope) {
    (scope || document).querySelectorAll('.ph img, .ph video').forEach(function (el) {
      if (el.dataset.armed) return;
      el.dataset.armed = '1';
      el.addEventListener('error', function () { el.remove(); });
      if (el.tagName === 'IMG' && el.complete && el.naturalWidth === 0) el.remove();
    });
  }
  armImages();

  /* ---- vídeo entra sozinho quando o arquivo existir ----
     As figuras que viram filme já declaram o mp4 em data-file e já
     carregam a imagem de capa. Em vez de trocar o HTML no dia em que
     os vídeos ficarem prontos, a página tenta carregar o arquivo e só
     substitui a capa se ele responder. Enquanto não existir, ninguém
     vê erro: fica a foto, que é um poster legítimo.

     Só troca com o vídeo realmente pronto para tocar (canplay), e
     nunca com reduced-motion ligado — um loop de fundo é exatamente o
     tipo de movimento que essa preferência pede para não acontecer. */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.ph[data-file$=".mp4"]').forEach(function (fig) {
      var capa = fig.querySelector('img');
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.autoplay = true;
      v.playsInline = true; v.setAttribute('playsinline', '');
      v.setAttribute('aria-hidden', 'true');
      v.preload = 'metadata';
      if (capa) v.poster = capa.getAttribute('src');

      v.addEventListener('canplay', function () {
        if (v.dataset.trocado) return;
        v.dataset.trocado = '1';
        if (capa) capa.remove();
        fig.appendChild(v);
        var t = v.play();
        if (t && t.catch) t.catch(function () {});
      });
      /* arquivo ausente: descarta e a capa segue no lugar */
      v.addEventListener('error', function () { v.removeAttribute('src'); v.load(); });

      v.src = fig.getAttribute('data-file');
    });
  }

  /* ---- menu mobile ---- */
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.drawer a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    });
  }

  /* ---- slider do hero ---- */
  var hero = document.querySelector('[data-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero__dots button'));
    var i = 0, timer = null, DELAY = 6500;

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dots.forEach(function (d, k) {
        d.classList.toggle('is-on', k === i);
        d.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
    }
    function play() { stop(); timer = setInterval(function () { go(i + 1); }, DELAY); }
    function stop() { if (timer) clearInterval(timer); }

    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); play(); }); });
    var prev = hero.querySelector('.hero__arrow--prev');
    var next = hero.querySelector('.hero__arrow--next');
    if (prev) prev.addEventListener('click', function () { go(i - 1); play(); });
    if (next) next.addEventListener('click', function () { go(i + 1); play(); });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : play();
    });

    /* swipe */
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 46) go(dx < 0 ? i + 1 : i - 1);
      x0 = null; play();
    }, { passive: true });

    go(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) play();
  }

  /* ---- toggle de consentimento ---- */
  document.querySelectorAll('.switch').forEach(function (sw) {
    sw.setAttribute('role', 'switch');
    sw.setAttribute('tabindex', '0');
    sw.setAttribute('aria-checked', 'false');
    function toggle() {
      var on = sw.classList.toggle('is-on');
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
    }
    sw.addEventListener('click', toggle);
    sw.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    });
  });

  /* ---- formulários demonstrativos ---- */
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('[type=submit]');
      if (!btn) return;
      var original = btn.innerHTML;
      btn.innerHTML = 'Enviado ✓';
      setTimeout(function () { btn.innerHTML = original; f.reset(); }, 2600);
    });
  });

  /* ---- CTA que já diz o assunto ----
     "Quero ser lojista", "Agendar visita" e companhia levam ao mesmo
     formulário. Com data-assunto, a mensagem chega escrita: a pessoa
     só confere e envia. Não apaga o que ela já tiver digitado. */
  var msg = document.querySelector('#contato textarea');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-assunto]');
    if (!a || !msg) return;
    if (!msg.value || msg.dataset.auto === '1') {
      msg.value = a.getAttribute('data-assunto');
      msg.dataset.auto = '1';
    }
  });
  if (msg) msg.addEventListener('input', function () { msg.dataset.auto = ''; });

  /* ---- onde comprar ----
     Lojas fictícias, como todo o resto da demonstração. Por estado,
     o total da rede e as cidades em destaque; "agendar visita" leva a
     cidade para o formulário. Os totais somam as 240 lojas do texto. */
  var LOJAS = {
    PR: [31, [['Curitiba', 'Batel', 'Showroom da fábrica'], ['Londrina', 'Gleba Palhano'], ['Maringá', 'Zona 7'], ['Arapongas', 'Centro']]],
    SC: [22, [['Florianópolis', 'Agronômica'], ['Joinville', 'América'], ['Balneário Camboriú', 'Centro']]],
    RS: [19, [['Porto Alegre', 'Moinhos de Vento'], ['Caxias do Sul', 'Exposição'], ['Passo Fundo', 'Centro']]],
    SP: [46, [['São Paulo', 'Pinheiros'], ['São Paulo', 'Moema'], ['Campinas', 'Cambuí'], ['Ribeirão Preto', 'Jardim Botânico']]],
    RJ: [17, [['Rio de Janeiro', 'Barra da Tijuca'], ['Niterói', 'Icaraí'], ['Petrópolis', 'Centro']]],
    MG: [21, [['Belo Horizonte', 'Savassi'], ['Uberlândia', 'Santa Mônica'], ['Juiz de Fora', 'Cascatinha']]],
    ES: [7, [['Vitória', 'Praia do Canto'], ['Vila Velha', 'Itapuã']]],
    GO: [11, [['Goiânia', 'Setor Marista'], ['Anápolis', 'Jundiaí']]],
    DF: [9, [['Brasília', 'Asa Sul'], ['Brasília', 'Águas Claras']]],
    MS: [8, [['Campo Grande', 'Jardim dos Estados'], ['Dourados', 'Centro']]],
    MT: [7, [['Cuiabá', 'Goiabeiras'], ['Sinop', 'Setor Comercial']]],
    BA: [10, [['Salvador', 'Pituba'], ['Feira de Santana', 'Santa Mônica']]],
    PE: [8, [['Recife', 'Boa Viagem'], ['Caruaru', 'Maurício de Nassau']]],
    CE: [6, [['Fortaleza', 'Aldeota']]],
    PB: [4, [['João Pessoa', 'Manaíra']]],
    RN: [4, [['Natal', 'Petrópolis']]],
    SE: [3, [['Aracaju', 'Jardins']]],
    TO: [3, [['Palmas', 'Plano Diretor Sul']]],
    RO: [4, [['Porto Velho', 'Olaria']]]
  };
  var caixa = document.querySelector('[data-lojas]');
  if (caixa) {
    var ufs = caixa.querySelector('.lojas__uf');
    var resumo = caixa.querySelector('.lojas__resumo');
    var lista = caixa.querySelector('.lojas__lista');
    var cidade = document.querySelector('#contato [name="cidade"]');

    ufs.innerHTML = Object.keys(LOJAS).map(function (uf) {
      return '<button type="button" aria-pressed="false" data-uf="' + uf + '">' + uf + '</button>';
    }).join('');

    var mostra = function (uf) {
      var d = LOJAS[uf];
      ufs.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.uf === uf ? 'true' : 'false');
      });
      var fora = d[0] - d[1].length;
      resumo.textContent = d[0] + ' lojas Morattá em ' + uf +
        (fora > 0 ? '. Aqui, as ' + d[1].length + ' principais; as outras ' + fora + ' a gente indica pelo seu CEP.' : '.');
      lista.innerHTML = d[1].map(function (l) {
        return '<li><span class="lojas__tipo">' + (l[2] || 'Loja parceira') + '</span>' +
          '<b>Morattá ' + l[0] + '</b><span>' + l[1] + ' · ' + l[0] + ', ' + uf + '</span>' +
          '<a href="#contato" data-cidade="' + l[0] + ', ' + uf + '" data-assunto="Quero agendar uma visita à loja Morattá ' +
          l[0] + ' (' + l[1] + ').">Agendar visita</a></li>';
      }).join('');
    };
    ufs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-uf]');
      if (b) mostra(b.dataset.uf);
    });
    lista.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-cidade]');
      if (a && cidade && !cidade.value) cidade.value = a.dataset.cidade;
    });
    mostra('PR');
  }

  /* ---- reveal on scroll ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- header encolhe ao rolar ---- */
  var header = document.querySelector('.header');
  if (header) {
    var last = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 40 && last <= 40) header.style.boxShadow = '0 1px 0 rgba(255,255,255,.12)';
      if (y <= 40 && last > 40) header.style.boxShadow = 'none';
      last = y;
    }, { passive: true });
  }
})();
