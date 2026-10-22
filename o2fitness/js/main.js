// O2 Fitness Academia: prévia. Contato em js/config.js; modalidades, planos, espaço e dúvidas em
// data/*.json (mudou um JSON, suba o V abaixo).
(function () {
  var V = 2;
  var OLA = 'Olá! Vim pelo site da O2.';
  var still = /[?&]still=1/.test(location.search);
  var calmo = still || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) document.documentElement.classList.add('still');
  // Modo QA (print da página inteira): carrega tudo de uma vez
  function semLazy() { if (still) document.querySelectorAll('img[loading=lazy]').forEach(function (i) { i.loading = 'eager'; }); }
  semLazy();

  // ---------- utilidades ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ph(s) { return '<span class="ph">' + esc(s) + '</span>'; }
  // Texto com [colchete] vira placeholder amarelo
  function txt(s) { return esc(s).replace(/\[([^\]]+)\]/g, function (m) { return '<span class="ph">' + m + '</span>'; }); }
  function zap(msg) { return 'https://wa.me/' + O2.whatsapp + '?text=' + encodeURIComponent(msg); }
  function reais(n) { return n == null ? '[R$]' : 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // ---------- links fixos de WhatsApp ----------
  function ligaZap(raiz) {
    raiz.querySelectorAll('[data-zap]').forEach(function (a) {
      a.href = zap(a.getAttribute('data-zap'));
      a.target = '_blank'; a.rel = 'noopener';
    });
  }
  ligaZap(document);

  // ---------- config ----------
  document.getElementById('ano').textContent = new Date().getFullYear();
  if (O2.aviso) { var av = document.getElementById('aviso'); av.textContent = O2.aviso; av.hidden = false; }
  document.getElementById('o-horario').innerHTML = O2.horario ? O2.horario.map(esc).join('<br>') : ph('[horário de funcionamento: o Google mostra 6h às 22h na quarta; confirmar os outros dias]');
  document.getElementById('r-pag').innerHTML = 'Pagamento: ' + (O2.pagamento ? esc(O2.pagamento) : ph('[formas de pagamento]'));
  if (O2.cnpj) document.getElementById('r-cnpj').textContent = 'CNPJ ' + O2.cnpj;
  document.getElementById('rota').href = O2.rotaUrl;

  // ---------- menu ----------
  var topo = document.getElementById('topo');
  var menu = document.getElementById('menu'), menuBtn = document.getElementById('menu-btn');
  function fechaMenu() { menu.classList.remove('aberto'); topo.classList.remove('menu-aberto'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menu'); }
  menuBtn.addEventListener('click', function () {
    var abre = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abre); topo.classList.toggle('menu-aberto', abre);
    menuBtn.setAttribute('aria-expanded', String(abre)); menuBtn.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(); });

  // Menu acende a seção à vista
  if ('IntersectionObserver' in window) {
    var links = {};
    menu.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var ioMenu = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        if (links[e.target.id]) links[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['modalidades', 'planos', 'monte', 'equipe', 'espaco', 'porque', 'duvidas', 'como-chegar'].forEach(function (id) { ioMenu.observe(document.getElementById(id)); });
  }

  // ---------- selo girando e letreiro: só à vista e com a aba aberta ----------
  var giro = document.getElementById('giro'), letreiro = document.getElementById('letreiro');
  if (calmo) letreiro.classList.add('parado');
  else if ('IntersectionObserver' in window) {
    var vis = { giro: false, letreiro: false };
    function anima() {
      giro.classList.toggle('gira', vis.giro && !document.hidden);
      letreiro.classList.toggle('anda', vis.letreiro && !document.hidden);
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.isIntersecting; }); anima();
    }).observe(giro);
    new IntersectionObserver(function (es) { vis.letreiro = es[0].isIntersecting; anima(); }).observe(letreiro);
    document.addEventListener('visibilitychange', anima);
  }

  // ---------- WhatsApp flutuante depois da primeira tela ----------
  var flutua = document.getElementById('zap-flutua');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { flutua.classList.toggle('ver', !es[0].isIntersecting); }).observe(document.getElementById('hero'));
  else flutua.classList.add('ver');

  // ---------- mapa só no clique ----------
  document.getElementById('mapa-btn').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = O2.mapaEmbed; f.title = 'Mapa da O2 Fitness Academia'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementById('mapa').appendChild(f); this.remove();
  });

  // ---------- quiz "Por onde começar" (não depende dos JSON) ----------
  montaQuiz();

  // ---------- dados ----------
  function pega(nome) { return fetch('data/' + nome + '.json?v=' + V).then(function (r) { if (!r.ok) throw new Error(nome); return r.json(); }); }
  Promise.all([pega('modalidades'), pega('planos'), pega('espaco'), pega('faq')])
    .then(function (d) { montaMods(d[0].itens); montaPlanos(d[1]); montaGaleria(d[2].itens); montaFaq(d[3].perguntas); revela(); semLazy(); })
    .catch(function () {
      document.getElementById('planos-grid').innerHTML = '<p class="carregando">Não consegui carregar os planos. <a href="' + zap(OLA + ' Quero saber dos planos.') + '">Pergunte no WhatsApp</a>.</p>';
      revela();
    });

  // ---------- modalidades ----------
  function montaMods(itens) {
    var box = document.getElementById('mods');
    box.innerHTML = itens.map(function (m) {
      var href = m.ancora || zap(m.zap), fora = m.ancora ? '' : ' target="_blank" rel="noopener"';
      return '<article class="mod rev" id="mod-' + esc(m.id) + '">' +
        '<span class="mod__ico"><svg aria-hidden="true"><use href="#' + esc(m.icone) + '"/></svg></span>' +
        '<h3>' + esc(m.nome) + '</h3><p class="mod__linha">' + esc(m.linha) + '</p>' +
        '<p>' + txt(m.texto) + '</p>' +
        '<a class="link-seta" href="' + esc(href) + '"' + fora + '>' + esc(m.botao) + ' <svg aria-hidden="true"><use href="#i-seta"/></svg></a></article>';
    }).join('');
  }

  // ---------- planos ----------
  function montaPlanos(d) {
    var grid = document.getElementById('planos-grid');
    // Sem tabela ainda: estado vazio que vende (pedir a tabela ou responder as quatro perguntas)
    if (!d.grupos.length) {
      grid.classList.add('planos--vazio');
      grid.innerHTML = '<div class="planos__vazio">' +
        '<p class="planos__vazio-t">Tabela de planos</p>' +
        '<p>' + ph('[planos, frequências e valores da O2]') + '</p>' +
        '<p class="planos__vazio-s">Enquanto a tabela não está aqui, a O2 manda os valores pelo WhatsApp.</p>' +
        '<div class="planos__vazio-btns"><a class="btn btn--verde" href="' + zap(OLA + ' Quero a tabela de planos e valores.') + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-zap"/></svg>Pedir a tabela no WhatsApp</a>' +
        '<a class="btn btn--linha-claro" href="#monte">Não sei qual plano escolher</a></div></div>';
      return;
    }
    if (d.confirmar) document.getElementById('planos-fonte').hidden = false;
    grid.style.setProperty('--n', Math.min(d.grupos.length, 4));
    grid.classList.toggle('planos--3', d.grupos.length === 3);
    grid.innerHTML = d.grupos.map(function (g) {
      var cab = '<tr><th>' + esc(g.cabecalho || 'Frequência') + '</th>' + g.colunas.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
      var linhas = g.linhas.map(function (l) {
        return '<tr><td>' + esc(l.freq) + '</td>' + l.precos.map(function (p) { return '<td>' + txt(reais(p)) + '</td>'; }).join('') + '</tr>';
      }).join('');
      // Cada card tem as mesmas cinco partes (mesmo vazias): o CSS alinha uma com a outra entre os cards
      var selo = g.selo ? '<span class="plano__selo">' + esc(g.selo) + (d.confirmar ? ' ' + ph('[confirmar]') : '') + '</span>' : '';
      return '<article class="plano' + (g.destaque ? ' plano--destaque' : '') + '" id="plano-' + esc(g.id) + '">' + selo +
        '<div class="plano__cab"><h3>' + esc(g.nome) + '</h3><p class="plano__sub">' + esc(g.sub) + '</p></div>' +
        '<p class="plano__linha">' + esc(g.linha) + '</p>' +
        '<table class="tabela"><thead>' + cab + '</thead><tbody>' + linhas + '</tbody></table>' +
        (g.extra ? '<p class="plano__extra">' + esc(g.extra) + '</p>' : '<span></span>') +
        '<a class="btn ' + (g.destaque ? 'btn--preto' : 'btn--linha-claro') + ' btn--cheio" href="' + zap(OLA + ' Quero o plano ' + g.nome + ' (' + g.sub + ').') + '" target="_blank" rel="noopener">Quero esse plano</a></article>';
    }).join('');
  }

  // ---------- por onde começar ----------
  function montaQuiz() {
    var form = document.getElementById('quiz');
    var ORDEM = ['objetivo', 'nivel', 'hora', 'freq'];
    var ROTULO = { objetivo: 'Objetivo', nivel: 'Hoje', hora: 'Horário', freq: 'Frequência' };
    var Q = {}; form.querySelectorAll('.q').forEach(function (f) { Q[f.dataset.q] = f; });
    var res = document.getElementById('resultado');
    function val(nome) { var i = form.querySelector('input[name=' + nome + ']:checked'); return i ? i.value : null; }

    function atualiza() {
      // Uma pergunta aparece quando a anterior foi respondida
      var pronto = true;
      ORDEM.forEach(function (n, i) {
        if (i) Q[n].hidden = !val(ORDEM[i - 1]) && Q[n].hidden;
        if (!val(n)) pronto = false;
      });
      res.hidden = !pronto;
      if (!pronto) return;
      document.getElementById('res-lista').innerHTML = ORDEM.map(function (n) {
        return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span><b>' + ROTULO[n] + ':</b> ' + esc(val(n)) + '</span></li>';
      }).join('');
    }

    form.addEventListener('change', function () {
      atualiza();
      // Leva a próxima pergunta para a tela no celular
      var prox = [].slice.call(form.querySelectorAll('.q:not([hidden]), .resultado:not([hidden])')).filter(function (f) { return !f.querySelector('input:checked'); })[0];
      if (prox && innerWidth < 900 && prox.getBoundingClientRect().top > innerHeight * .75) prox.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'center' });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var linhas = ['Olá! Vim pelo site da O2 e quero começar a treinar.', ''];
      ORDEM.forEach(function (n) { linhas.push('*' + ROTULO[n] + ':* ' + val(n)); });
      if (nome) linhas.push('*Nome:* ' + nome);
      linhas.push('', 'Qual plano vocês indicam e quanto fica?');
      // Abre direto no WhatsApp, em qualquer aparelho
      window.open(zap(linhas.join('\n')), '_blank', 'noopener');
    });
  }

  // ---------- galeria + foto ampliada ----------
  var LISTA = [];
  function selo(f) { return f.tipo === 'projeto' ? '<span class="selo-projeto">Imagem do projeto</span>' : ''; }
  function montaGaleria(itens) {
    LISTA = itens;
    var gal = document.getElementById('galeria');
    gal.innerHTML = itens.map(function (f, i) {
      var srcset = f.larguras.map(function (w) { return 'assets/fotos/' + f.foto + '-' + w + '.webp ' + w + 'w'; }).join(', ');
      return '<button type="button" class="foto rev" data-i="' + i + '" aria-label="Ampliar: ' + esc(f.titulo) + '">' +
        '<img src="assets/fotos/' + f.foto + '-' + f.larguras[0] + '.webp" srcset="' + srcset + '" sizes="(min-width: 900px) ' + (i === 0 ? '40vw' : '30vw') + ', ' + (i === 0 ? '100vw' : '50vw') + '" width="' + f.w + '" height="' + f.h + '" loading="lazy" alt="' + esc(f.alt) + '">' +
        selo(f) + '<span class="foto__leg">' + esc(f.titulo) + '</span></button>';
    }).join('');
    gal.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) abreLuz(+b.dataset.i, b); });
  }
  var luz = document.getElementById('luz'), luzI = 0, luzVolta;
  function mostraLuz() {
    var f = LISTA[luzI], w = f.larguras[f.larguras.length - 1], img = luz.querySelector('img');
    img.src = 'assets/fotos/' + f.foto + '-' + w + '.webp'; img.alt = f.alt; img.width = f.w; img.height = f.h;
    luz.querySelector('figcaption').textContent = f.titulo + (f.tipo === 'projeto' ? ' · imagem do projeto' : '');
  }
  function abreLuz(i, origem) { luzI = i; luzVolta = origem; mostraLuz(); luz.hidden = false; document.body.style.overflow = 'hidden'; luz.querySelector('.luz__x').focus(); }
  function fechaLuz() { luz.hidden = true; document.body.style.overflow = ''; if (luzVolta) luzVolta.focus(); }
  function passa(d) { luzI = (luzI + d + LISTA.length) % LISTA.length; mostraLuz(); }
  luz.addEventListener('click', function (e) {
    var b = e.target.closest('[data-luz]');
    if (!b) { if (e.target === luz) fechaLuz(); return; }
    if (b.dataset.luz === 'x') return fechaLuz();
    passa(+b.dataset.luz);
  });
  document.addEventListener('keydown', function (e) {
    if (luz.hidden) return;
    if (e.key === 'Escape') fechaLuz();
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') passa(e.key === 'ArrowRight' ? 1 : -1);
  });
  var x0 = null;
  luz.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  luz.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) passa(dx < 0 ? 1 : -1);
  });

  // ---------- dúvidas ----------
  function montaFaq(PERGUNTAS) {
    function troca(s) {
      return s.replace('{horario}', O2.horario ? O2.horario.join(' · ') : '[horário de funcionamento: o Google mostra 6h às 22h na quarta; confirmar os outros dias]')
        .replace('{pagamento}', O2.pagamento || '[formas de pagamento: dinheiro, Pix, cartão?]');
    }
    var box = document.getElementById('faq');
    box.innerHTML = PERGUNTAS.map(function (q, i) {
      return '<details id="faq-' + esc(q.id) + '"' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.p) + '</summary><p>' + txt(troca(q.r)) + '</p></details>';
    }).join('');
    // Âncora do rodapé abre a pergunta
    function abreHash() { var d = location.hash && document.getElementById(location.hash.slice(1)); if (d && d.tagName === 'DETAILS') d.open = true; }
    addEventListener('hashchange', abreHash); abreHash();
  }

  // ---------- entrada suave ----------
  function revela() {
    var todos = document.querySelectorAll('.cab, .fatos li, .vozes > div, .monte__txt, .quiz, .cross__txt, .cross__foto, .onde__txt, .mapa, .rev');
    todos.forEach(function (el) { el.classList.add('rev'); });
    if (calmo || !('IntersectionObserver' in window)) { todos.forEach(function (el) { el.classList.add('ok'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ok'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    todos.forEach(function (el) { io.observe(el); });
  }
})();
