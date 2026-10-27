/* Aceno Marketing: vitrine de vídeos (#conteudo-aceno), a partir de "videos" no data/marketing.json.
   Fileira de lado: no computador a seção fica presa e a rolagem passa os vídeos; no celular, com
   movimento reduzido ou em ?still=1, a fileira rola de lado no dedo. Só o vídeo mais perto do centro
   da tela toca e fica colorido; os outros param em cinza. Nada baixa ao abrir a página: o pôster entra
   a duas telas de distância e o vídeo a uma (no celular, a versão leve -m). Com movimento reduzido ou
   economia de dados, nenhum toca sozinho: o do centro ganha o botão de play. */
(function () {
  'use strict';
  var AG = window.AG, esc = AG.esc, txt = AG.txt;
  var PASTA = '../assets/video/';
  var conexao = navigator.connection || {};

  function minutos(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }

  function item(v, i) {
    var nome = (v.tipo || 'Vídeo') + (v.titulo ? ': ' + v.titulo : ' ' + (i + 1));
    var midia = v.arquivo
      ? '<video muted loop playsinline preload="none" disablepictureinpicture' +
          ' data-src="' + PASTA + esc(v.arquivo) + '.mp4" data-src-m="' + PASTA + esc(v.arquivo) + '-m.mp4"' +
          ' data-poster="' + PASTA + esc(v.arquivo) + '.webp" aria-label="' + esc(nome) + '"></video>' +
        '<button class="vv__play" type="button" aria-label="Tocar ' + esc(nome) + '"><svg class="ico"><use href="#i-play"/></svg></button>'
      : '<div class="vv__vazio"><span class="vv__vazio-ico"><svg class="ico"><use href="#i-play"/></svg></span>' +
          '<span class="ph">[' + esc((v.tipo || 'vídeo').toLowerCase()) + ': arquivo do vídeo]</span></div>';
    // o corte do podcast leva para o episódio inteiro (YouTube ou Spotify)
    var link = !('link' in v) ? ''
      : v.link ? ' <a class="vv__link" href="' + esc(v.link) + '" target="_blank" rel="noopener">Episódio completo<svg class="ico"><use href="#i-arrow-up-right"/></svg></a>'
      : ' ' + txt(null, '[link do episódio completo]');
    return '<li class="vv__item vv__item--' + (v.formato === 'horizontal' ? 'h' : 'v') + '">' +
      '<figure class="vv__fig">' +
        '<div class="vv__quadro">' +
          '<div class="vv__barra" aria-hidden="true"><span class="vv__pontos"><i></i><i></i><i></i></span>' +
            '<span class="vv__rotulo">' + esc(v.tipo || 'Vídeo') + ' · <span class="vv__dur">' + (v.duracao ? esc(v.duracao) : '–:––') + '</span></span></div>' +
          '<div class="vv__midia">' + midia + '</div>' +
        '</div>' +
        '<figcaption class="vv__legenda">' + txt(v.titulo, '[nome do vídeo]') + link + '</figcaption>' +
      '</figure></li>';
  }

  AG.vitrine = function (raiz, lista, nav) {
    if (!raiz || !lista || !lista.length) return;
    var secao = raiz.closest('section') || raiz;
    var leve = matchMedia('(max-width: 640px)').matches || !!conexao.saveData;
    // toca sozinho quando chega ao centro; sem isso, só no play
    var sozinho = !AG.calmo() && !conexao.saveData;

    raiz.innerHTML = '<div class="vv__janela"><ul class="vv__trilho" role="list">' + lista.map(item).join('') + '</ul></div>';
    var janela = raiz.querySelector('.vv__janela');
    var trilho = raiz.querySelector('.vv__trilho');
    var itens = [].slice.call(trilho.children).map(function (li, i) {
      return { li: li, v: li.querySelector('video'), fixa: !!lista[i].duracao, poster: false, fonte: false, parado: false, quer: false };
    });
    var contador = nav && nav.querySelector('[data-vv-conta]');
    var ativo = -1, quadro = 0, preso = false, st = null;

    /* ---------- arquivos: pôster e vídeo só perto da tela ---------- */
    function poePoster(it) {
      if (it.poster || !it.v) return;
      it.poster = true;
      it.v.poster = it.v.dataset.poster;
    }
    function carrega(it) {
      if (it.fonte || !it.v) return;
      it.fonte = true;
      poePoster(it);
      it.v.preload = 'metadata';
      it.v.src = leve && it.v.dataset.srcM ? it.v.dataset.srcM : it.v.dataset.src;
    }
    itens.forEach(function (it) {
      var v = it.v;
      if (!v) return;
      v.addEventListener('playing', function () { it.li.classList.add('tocando'); });
      v.addEventListener('pause', function () { it.li.classList.remove('tocando'); });
      v.addEventListener('loadedmetadata', function () {
        if (!it.fixa && isFinite(v.duration)) it.li.querySelector('.vv__dur').textContent = minutos(v.duration);
      });
      v.addEventListener('error', function () {
        // sem a versão leve, usa a do computador; sem nenhuma, avisa no próprio quadro
        var arquivo = function (u) { return u.split('?')[0].split('/').pop(); };
        if (arquivo(v.currentSrc || v.src) === arquivo(v.dataset.srcM)) {
          v.src = v.dataset.src;
          if (itens[ativo] === it) agenda();
          return;
        }
        it.li.classList.add('erro');
        var m = it.li.querySelector('.vv__midia');
        if (!m.querySelector('.vv__aviso')) m.insertAdjacentHTML('beforeend', '<span class="vv__aviso ph">[vídeo não encontrado: ' + esc(v.dataset.src.split('/').pop()) + ']</span>');
      });
    });
    // no modo QA o print precisa dos pôsteres
    if (AG.still) itens.forEach(poePoster);

    function toca(it) {
      if (!it.v || it.li.classList.contains('erro')) return;
      carrega(it);
      if (!it.v.paused) return;
      var p = it.v.play();
      if (p && p.catch) p.catch(function () { it.quer = false; it.parado = true; }); // navegador barrou: fica o botão de play
    }
    function para(it) { if (it && it.v && !it.v.paused) it.v.pause(); }

    function escolhe(i) {
      if (i === ativo) return;
      if (ativo > -1) { itens[ativo].li.classList.remove('ativo'); para(itens[ativo]); }
      ativo = i;
      var it = itens[i];
      it.li.classList.add('ativo');
      it.parado = false; it.quer = false;
      if (contador) contador.textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + itens.length).slice(-2);
    }

    /* ---------- a cada quadro de rolagem: quem está no centro, o que já pode baixar, quem toca ---------- */
    function atualiza() {
      quadro = 0;
      var W = innerWidth, H = innerHeight;
      var s = secao.getBoundingClientRect();
      if (s.bottom < -H || s.top > 2 * H) { if (ativo > -1) para(itens[ativo]); return; } // longe: nem mede
      var melhor = 0, menor = Infinity;
      itens.forEach(function (it, i) {
        var r = it.li.getBoundingClientRect();
        var fora = Math.max(0, r.left - W, -r.right); // distância de lado até a tela
        if (r.bottom > -H && r.top < 2 * H) {
          if (fora < 2 * W) poePoster(it);
          if (fora < W) carrega(it);
        }
        var d = Math.abs(r.left + r.width / 2 - W / 2);
        if (d < menor) { menor = d; melhor = i; }
      });
      escolhe(melhor);
      var it = itens[ativo];
      var aVista = s.top < H * .7 && s.bottom > H * .3 && !document.hidden;
      if (aVista && (sozinho ? !it.parado : it.quer)) toca(it); else para(it);
    }
    function agenda() { if (!quadro) quadro = requestAnimationFrame(atualiza); }

    /* ---------- margens: o primeiro e o último também chegam ao centro ---------- */
    function mede() {
      var w = janela.clientWidth;
      trilho.style.paddingLeft = Math.max(0, (w - itens[0].li.offsetWidth) / 2) + 'px';
      trilho.style.paddingRight = Math.max(0, (w - itens[itens.length - 1].li.offsetWidth) / 2) + 'px';
    }
    function distancia() { return Math.max(0, trilho.scrollWidth - janela.clientWidth); }

    /* ---------- ir até um vídeo (setas, clique num vídeo do lado) ---------- */
    function vai(i) {
      i = Math.max(0, Math.min(itens.length - 1, i));
      var li = itens[i].li;
      var meio = li.offsetLeft + li.offsetWidth / 2 - janela.clientWidth / 2;
      var suave = !AG.calmo();
      if (preso && st) {
        // presa: a rolagem da página move a fileira 1 para 1; acha o ponto em que esse vídeo fica no meio
        var d = distancia();
        var y = st.start + (d ? Math.max(0, Math.min(1, meio / d)) : 0) * (st.end - st.start);
        if (AG.lenis) AG.lenis.scrollTo(y, { duration: 1.1 });
        else scrollTo({ top: y, behavior: suave ? 'smooth' : 'auto' });
      } else {
        janela.scrollTo({ left: meio, behavior: suave ? 'smooth' : 'auto' });
      }
    }

    raiz.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var li = e.target.closest('.vv__item');
      if (!li) return;
      var i = itens.map(function (it) { return it.li; }).indexOf(li);
      var it = itens[i];
      if (i !== ativo) { vai(i); return; }
      if (!it.v || li.classList.contains('erro')) return;
      // no do centro, o clique toca e pausa (e a escolha vale até ele sair do centro)
      if (it.v.paused) { it.parado = false; it.quer = true; toca(it); }
      else { it.parado = true; it.quer = false; para(it); }
    });
    if (nav) nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-vv]');
      if (b) vai(ativo + (b.dataset.vv === 'prox' ? 1 : -1));
    });

    addEventListener('scroll', agenda, { passive: true });
    janela.addEventListener('scroll', agenda, { passive: true });
    addEventListener('resize', function () { mede(); agenda(); });
    document.addEventListener('visibilitychange', agenda);
    mede();
    escolhe(0); // o primeiro começa no meio (e colorido no print do ?still=1)

    /* ---------- computador com movimento: a seção fica presa enquanto a fileira passa ---------- */
    var G = window.gsap;
    if (AG.mm && G) AG.mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', function () {
      preso = true;
      secao.classList.add('vv-preso');
      janela.scrollLeft = 0;
      mede();
      var tw = G.to(trilho, {
        x: function () { return -distancia(); },
        ease: 'none',
        scrollTrigger: {
          trigger: secao, start: 'top top', end: function () { return '+=' + distancia(); },
          pin: true, scrub: .6, invalidateOnRefresh: true, onRefreshInit: mede
        },
        onUpdate: agenda
      });
      st = tw.scrollTrigger;
      return function () { preso = false; st = null; secao.classList.remove('vv-preso'); mede(); agenda(); };
    });

    agenda();
    addEventListener('load', function () { mede(); agenda(); });
  };
})();
