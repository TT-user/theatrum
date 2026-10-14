/* Nerd Club, home: seleção de missão, oficina, restauração, vitrine, InCubo, recordes e mapa.
   Os dados vêm de data/*.json; mudou um JSON, suba o V. */
(function () {
  'use strict';
  var V = '?v=3';
  var NC = window.NC;
  var still = document.documentElement.classList.contains('still');
  var reduz = still || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function json(nome) {
    return fetch('data/' + nome + '.json' + V).then(function (r) { return r.json(); });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  var PH = function (t) { return '<span class="ph">' + esc(t || 'a confirmar') + '</span>'; };
  function icone(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------- [2] Seleção de missão: setas andam, Enter entra ---------- */
  var grade = document.getElementById('missoes-grade');
  if (grade) {
    var cards = Array.prototype.slice.call(grade.querySelectorAll('.missao'));
    grade.addEventListener('keydown', function (e) {
      var i = cards.indexOf(document.activeElement);
      if (i < 0) return;
      var cols = Math.round(grade.offsetWidth / cards[0].offsetWidth) || 1;
      var d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (!d) return;
      var j = i + d;
      if (j < 0 || j >= cards.length) return;
      e.preventDefault();
      cards[j].focus();
    });
    cards.forEach(function (c) {
      c.addEventListener('focus', function () { if (window.NCsom) window.NCsom('select'); });
      c.addEventListener('mouseenter', function () { if (window.NCsom) window.NCsom('select'); });
    });
  }

  /* ---------- [3] Oficina: lista de power-ups ---------- */
  var ICONE_SERV = { controle: 'px-controle', cubo: 'px-cubo', bau: 'px-bau', chave: 'px-chave', ventoinha: 'px-estrela', chama: 'px-estrela', cadeado: 'px-bau' };
  json('servicos').then(function (d) {
    var ul = document.getElementById('powerups');
    if (!ul) return;
    ul.innerHTML = d.servicos.filter(function (s) { return s.ativo; }).map(function (s) {
      return '<li class="powerup">' + icone(ICONE_SERV[s.icone] || 'px-chave') +
        '<h3>' + esc(s.nomeCurto || s.nome) + '</h3><p>' + esc(s.curto || s.texto) + '</p></li>';
    }).join('');
  }).catch(function () {});

  /* ---------- [4] Restauração: antes e depois arrastável ---------- */
  function slider(c) {
    return '<figure class="caso">' +
      '<div class="caso__tela" style="--pos:50%">' +
        '<img src="' + esc(c.depois) + '" alt="' + esc(c.titulo) + ' depois da restauração" loading="lazy" decoding="async">' +
        '<img class="caso__antes" src="' + esc(c.antes) + '" alt="' + esc(c.titulo) + ' antes da restauração" loading="lazy" decoding="async">' +
        '<span class="caso__tag caso__tag--a">ANTES</span><span class="caso__tag caso__tag--d">DEPOIS</span>' +
        '<span class="caso__linha" aria-hidden="true"></span>' +
        '<input class="caso__range" type="range" min="0" max="100" value="50" aria-label="Comparar antes e depois de ' + esc(c.titulo) + '">' +
      '</div>' +
      '<figcaption><strong>' + esc(c.titulo) + '</strong> ' + esc(c.legenda) + '</figcaption></figure>';
  }
  function vazio(c) {
    return '<figure class="caso caso--vazio">' +
      '<div class="caso__tela"><span class="caso__slot">' + icone('px-chave') + 'ANTES · DEPOIS</span></div>' +
      '<figcaption><strong>' + (c.titulo ? esc(c.titulo) : PH('aparelho')) + '</strong> ' + PH('par de fotos reais da bancada') + '</figcaption></figure>';
  }
  json('antes-depois').then(function (d) {
    var box = document.getElementById('casos');
    if (!box) return;
    box.innerHTML = d.casos.map(function (c) { return c.antes && c.depois ? slider(c) : vazio(c); }).join('');
    box.addEventListener('input', function (e) {
      if (!e.target.classList.contains('caso__range')) return;
      e.target.parentNode.style.setProperty('--pos', e.target.value + '%');
    });
  }).catch(function () {});

  /* ---------- [5] Vitrine em destaque ---------- */
  var ICONE_CAT = { consoles: 'px-controle', jogos: 'px-cartucho', retro: 'px-cartucho', portateis: 'px-portatil', acessorios: 'px-fone', colecionaveis: 'px-estrela' };
  var SELO = { novo: 'NOVO', seminovo: 'SEMINOVO', retro: 'RETRÔ', ultima: 'ÚLTIMA UNIDADE' };
  var produtos = [];
  var trilho = document.getElementById('trilho');

  function cartucho(p) {
    // item de exemplo não manda pedido de produto que pode não existir
    var msg = p.exemplo ? 'Olá Nerd Club! Vim pelo site. O que tem de novidade na vitrine?' : 'Olá Nerd Club! Vim pelo site. Tenho interesse no ' + p.nome + '. Ainda tem?';
    var foto = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nome) + '" loading="lazy" decoding="async" width="320" height="240">'
      : '<span class="cart__sem">' + icone(ICONE_CAT[p.categoria] || 'px-cartucho') + '</span>';
    return '<li class="cart">' +
      '<div class="cart__rotulo">' + foto +
        '<span class="cart__selo cart__selo--' + esc(p.condicao) + '">' + (SELO[p.condicao] || '') + '</span>' +
        (p.exemplo ? '<span class="cart__exemplo ph">exemplo</span>' : '') +
      '</div>' +
      '<div class="cart__corpo"><h3>' + esc(p.nome) + '</h3>' +
        '<p class="cart__preco">' + (p.preco ? esc(p.preco) : 'consulte') + '</p>' +
        '<a class="btn btn--mini" href="' + window.whatsappLink(msg) + '" data-zap="produto" data-msg="' + esc(msg) + '">QUERO ESSE</a>' +
      '</div></li>';
  }
  function filtra(cat) {
    if (!trilho) return;
    var lista = produtos.filter(function (p) { return cat === 'destaque' ? p.destaque : p.categoria === cat; });
    trilho.innerHTML = lista.map(cartucho).join('') || '<li class="cart cart--vazio">' + PH('produtos desta categoria') + '</li>';
    trilho.querySelectorAll('[data-zap]').forEach(function (a) { if (window.NCzap) window.NCzap.liga(a); });
    document.querySelectorAll('.abas [data-cat]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === cat ? 'true' : 'false'); });
  }
  json('produtos').then(function (d) { produtos = d.produtos; filtra('destaque'); }).catch(function () {});
  document.querySelectorAll('.abas [data-cat]').forEach(function (b) {
    b.addEventListener('click', function () { filtra(b.getAttribute('data-cat')); if (trilho) trilho.scrollLeft = 0; if (window.NCsom) window.NCsom('select'); });
  });
  // "Loot lendário" no menu e no card de missão já chega com o filtro
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-filtro]');
    if (a) filtra(a.getAttribute('data-filtro'));
  });
  document.querySelectorAll('[data-rola]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!trilho) return;
      trilho.scrollBy({ left: Number(b.getAttribute('data-rola')) * trilho.clientWidth * .85, behavior: reduz ? 'auto' : 'smooth' });
    });
  });

  /* ---------- [6] InCubo: categorias e warp ---------- */
  json('incubo').then(function (d) {
    var ul = document.getElementById('cubos');
    if (!ul) return;
    ul.innerHTML = d.categorias.map(function (c) {
      return '<li class="cubo">' + icone('px-cubo') + '<h3>' + esc(c.nome) + '</h3><p>' + esc(c.texto) + '</p></li>';
    }).join('');
  }).catch(function () {});
  if (NC.zapIncubo) document.querySelectorAll('[data-incubo]').forEach(function (a) { a.setAttribute('data-numero', NC.zapIncubo); });
  var incubo = document.getElementById('incubo');
  if (incubo && 'IntersectionObserver' in window && !reduz) {
    incubo.classList.add('incubo--antes');
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      incubo.classList.add('incubo--warp');
      incubo.classList.remove('incubo--antes');
      if (window.NCsom) window.NCsom('coin');
    }, { rootMargin: '0px 0px -15% 0px' }); // topo entrou: dispara mesmo se a seção for mais alta que a tela
    io.observe(incubo);
  }

  /* ---------- [7] High scores ---------- */
  json('reviews').then(function (d) {
    var placar = document.getElementById('placar');
    if (placar) {
      var linhas = d.avaliacoes.map(function (r, i) {
        return '<tr><td class="placar__pos">' + (i + 1) + 'º</td><td>' + esc(r.nome) + '</td><td class="placar__nota"><span aria-hidden="true">' + '★'.repeat(r.nota) + '</span><span class="sr">' + r.nota + ' de 5</span></td><td>' + esc(r.trecho) + '</td></tr>';
      }).join('');
      if (!linhas) linhas = '<tr class="placar__vazio"><td class="placar__pos">1º</td><td colspan="3">' + PH('avaliações reais do Google, com autorização') + '</td></tr>';
      var busca = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Nerd Club Teresópolis');
      placar.innerHTML = '<table><caption class="sr">Avaliações de clientes no Google</caption><thead><tr><th>RANK</th><th>JOGADOR</th><th>NOTA</th><th>RECADO</th></tr></thead><tbody>' + linhas + '</tbody></table>' +
        '<a class="link-tela" href="' + busca + '" target="_blank" rel="noopener">ver e deixar avaliação no Google ▸</a>';
    }
    var cont = document.getElementById('contadores');
    if (cont) cont.innerHTML = d.contadores.map(function (c) {
      return '<li><span class="contador__v">' + (c.valor != null ? Number(c.valor).toLocaleString('pt-BR') : PH()) + '</span>' +
        '<span class="contador__r">' + esc(c.rotulo) + '</span>' + (c.fonte ? '<span class="contador__f">' + esc(c.fonte) + '</span>' : '') + '</li>';
    }).join('');
  }).catch(function () {});

  /* ---------- Corrida de enfeite: moedas somem quando o Nerdinho passa ---------- */
  var corrida = document.getElementById('corrida');
  var moedasBox = document.getElementById('corrida-moedas');
  if (corrida && moedasBox) {
    var CICLO = 16; // segundos, igual ao CSS
    var montaMoedas = function () {
      var W = corrida.clientWidth;
      var n = Math.max(6, Math.round(W / 52));
      var html = '';
      for (var i = 0; i < n; i++) {
        var p = .05 + (.83 * i) / (n - 1);
        var x = p * W;
        // o herói vai de -60px a (W - 56px) em 45% do ciclo; a frente dele (48px) apanha a moeda
        var f = Math.max(0, (x - 44 + 60) / (W - 56 + 60)) * .45;
        html += '<i class="corrida__moeda" style="left:' + (p * 100).toFixed(2) + '%;animation-delay:' + (f * CICLO).toFixed(2) + 's"></i>';
      }
      moedasBox.innerHTML = html;
    };
    var liga = function () {
    montaMoedas();
    if (!reduz) {
      var religa = function () {
        corrida.classList.remove('corrida--on');
        montaMoedas();
        void corrida.offsetWidth; // zera o relógio de todo mundo junto
        corrida.classList.add('corrida--on');
      };
      religa();
      var largura = corrida.clientWidth, tResize;
      window.addEventListener('resize', function () {
        clearTimeout(tResize);
        tResize = setTimeout(function () { if (corrida.clientWidth !== largura) { largura = corrida.clientWidth; religa(); } }, 200);
      });
      var visivel = false;
      var anda = function () { corrida.classList.toggle('anda', visivel && !document.hidden); };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; anda(); }).observe(corrida);
      }
      document.addEventListener('visibilitychange', anda);
    }
    };
    if ('IntersectionObserver' in window) {
      var perto = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        perto.disconnect();
        liga();
      }, { rootMargin: '400px 0px' });
      perto.observe(corrida);
    } else liga();
  }

  /* ---------- [8] Mapa só no clique ---------- */
  var abreMapa = document.getElementById('abre-mapa');
  if (abreMapa) abreMapa.addEventListener('click', function () {
    var g = NC.endereco.geo;
    var f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + g.lat + ',' + g.lng + '&z=17&output=embed';
    f.title = 'Mapa da Nerd Club em Teresópolis';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementById('mapa').replaceChildren(f);
  });
})();
