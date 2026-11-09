/* Anil · página única. Projetos, objetivos e artigos vêm de data/*.json. */
(function () {
  'use strict';

  var H = document.documentElement;
  var STILL = H.classList.contains('still');
  var MOV = H.classList.contains('anima');
  var CFG = window.ANIL || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CELULAR = matchMedia('(max-width: 900px)');
  var V = '?v=1';

  function wa(msg) { return 'https://wa.me/' + (CFG.whatsapp || '') + '?text=' + encodeURIComponent(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dois(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- entrada na rolagem ---------- */
  var vistos = 'IntersectionObserver' in window && MOV ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); vistos.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 }) : null;
  function observa(el) { if (vistos) vistos.observe(el); else el.classList.add('in'); }
  $$('[data-rv]').forEach(observa);

  /* ---------- topo, flutuantes e menu ativo ---------- */
  var topo = $('#topo'), waF = $('#wa-float'), sobe = $('#sobe');
  waF.classList.add('longe'); sobe.classList.add('longe');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { topo.classList.toggle('rolou', !es[0].isIntersecting); }).observe($('.previa'));
    /* WhatsApp e "voltar ao topo" aparecem depois da primeira tela e saem de cima do rodapé */
    var naTela = { hero: true, rodape: false };
    function flutua() {
      var longe = naTela.hero || naTela.rodape;
      waF.classList.toggle('longe', longe); sobe.classList.toggle('longe', longe);
    }
    new IntersectionObserver(function (es) { naTela.hero = es[0].isIntersecting; flutua(); }, { threshold: .35 }).observe($('.hero'));
    new IntersectionObserver(function (es) { naTela.rodape = es[0].isIntersecting; flutua(); }, { rootMargin: '0px 0px -60px 0px' }).observe($('.rodape'));
    /* o link do menu acende com a seção no meio da tela */
    var links = $$('.topo__nav a');
    var ioMenu = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) ioMenu.observe(s); });
  }
  sobe.addEventListener('click', function () { scrollTo({ top: 0, behavior: STILL || !MOV ? 'auto' : 'smooth' }); });

  /* menu do celular */
  var bMenu = $('.topo__menu'), menu = $('#menu');
  function menuAberto(sim) {
    menu.hidden = !sim; bMenu.setAttribute('aria-expanded', String(sim));
    document.body.classList.toggle('travado', sim);
  }
  bMenu.addEventListener('click', function () { menuAberto(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a, button')) menuAberto(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { menuAberto(false); bMenu.focus(); } });
  CELULAR.addEventListener('change', function () { if (!CELULAR.matches) menuAberto(false); });

  /* ---------- vídeo do hero: depois do load, só à vista e com a aba aberta ---------- */
  function videoHero() {
    var v = $('.hero__video');
    if (!v || STILL || !MOV) return;
    var c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g/.test(c.effectiveType || ''))) return;
    v.src = innerWidth < 760 ? v.dataset.srcM : v.dataset.src;
    v.addEventListener('playing', function () { v.classList.add('pronto'); }, { once: true });
    var visivel = false;
    function toca() { if (visivel && !document.hidden) v.play().catch(function () {}); else v.pause(); }
    new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; toca(); }).observe(v);
    document.addEventListener('visibilitychange', toca);
  }
  if (document.readyState === 'complete') videoHero(); else addEventListener('load', videoHero);

  /* ---------- parallax da faixa do estúdio ---------- */
  (function () {
    var faixa = $('.plx'), img = $('.plx__img');
    if (!faixa || !MOV) return;
    var vis = false, pedido = false;
    function anda() {
      pedido = false;
      var r = faixa.getBoundingClientRect();
      var p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2);
      img.style.transform = 'translate3d(0,' + (Math.max(-1, Math.min(1, p)) * 9).toFixed(2) + '%,0)';
    }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) anda(); }).observe(faixa);
    addEventListener('scroll', function () { if (vis && !pedido) { pedido = true; requestAnimationFrame(anda); } }, { passive: true });
  })();

  /* ---------- diálogos ---------- */
  var ultimoFoco = null;
  function abrir(d) {
    ultimoFoco = document.activeElement;
    d.showModal(); d.scrollTop = 0;
    document.body.classList.add('travado');
  }
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-fecha]')) d.close();
    });
    d.addEventListener('close', function () {
      document.body.classList.remove('travado');
      $$('video', d).forEach(function (v) { v.pause(); });
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    });
  });

  /* ---------- dados ---------- */
  function pega(nome) { return fetch('data/' + nome + '.json' + V).then(function (r) { if (!r.ok) throw new Error(nome); return r.json(); }); }

  /* ===== [03] projetos ===== */
  var P = null, filtro = 'Todos', todos = false;
  var grade = $('#grade'), bTodos = $('#ver-todos'), filtros = $('.filtros');
  function filtrados() { return filtro === 'Todos' ? P.projetos : P.projetos.filter(function (p) { return p.cats.indexOf(filtro) >= 0; }); }
  function capa(p, larg) { return 'assets/img/projetos/' + p.capa + '-' + larg + '.webp'; }
  function desenhaGrade(desde) {
    var l = filtrados();
    var n = todos ? l.length : Math.min(l.length, P.visiveis);
    grade.innerHTML = l.slice(0, n).map(function (p, i) {
      var anima = desde != null && i >= desde;
      return '<li class="proj' + (anima ? ' entra' : '') + '"' + (anima ? ' style="animation-delay:' + ((i - desde) * 70) + 'ms"' : '') + '>' +
        '<button type="button" data-id="' + p.id + '" aria-label="Abrir o projeto ' + esc(p.cliente) + '">' +
          '<img src="' + capa(p, 800) + '" srcset="' + capa(p, 480) + ' 480w, ' + capa(p, 800) + ' 800w" sizes="(max-width: 640px) 92vw, (max-width: 900px) 46vw, 31vw" width="800" height="772" alt="' + esc(p.alt) + '"' + (STILL ? '' : ' loading="lazy"') + ' decoding="async">' +
          (p.video ? '<span class="proj__play" aria-hidden="true"><svg><use href="#i-play"/></svg></span>' : '') +
          '<span class="proj__info" aria-hidden="true"><span class="proj__cats">' + esc(p.cats.join(' · ')) + '</span>' +
          '<span class="proj__nome">' + esc(p.cliente) + '</span>' +
          '<span class="proj__ver">Ver projeto <svg><use href="#i-seta"/></svg></span></span>' +
        '</button></li>';
    }).join('');
    bTodos.hidden = todos || l.length <= P.visiveis;
  }
  function desenhaFiltros() {
    filtros.innerHTML = ['Todos'].concat(P.categorias).map(function (c) {
      return '<button type="button" aria-pressed="' + (c === filtro) + '">' + esc(c) + '</button>';
    }).join('');
  }
  filtros.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.getAttribute('aria-pressed') === 'true') return;
    filtro = b.textContent; todos = false;
    $$('button', filtros).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    desenhaGrade(0);
  });
  bTodos.addEventListener('click', function () {
    todos = true; desenhaGrade(P.visiveis);
    var b = grade.children[P.visiveis] && $('button', grade.children[P.visiveis]);
    if (b) b.focus({ preventScroll: true });
  });

  /* projeto aberto */
  var caso = $('#caso'), lista = [], atual = 0;
  function preencheCaso() {
    var p = lista[atual];
    var m = $('#caso-midia');
    if (p.video) {
      /* controles sempre à vista: o filme roda em loop e precisa poder ser pausado */
      m.innerHTML = '<video src="assets/video/' + p.video + '.mp4' + V + '" poster="' + capa(p, 1100) + '" muted loop playsinline controls aria-label="Filme de lançamento da ' + esc(p.cliente) + '"></video>';
      if (MOV) { $('video', m).play().catch(function () {}); }
    } else {
      m.innerHTML = '<img src="' + capa(p, 1100) + '" srcset="' + capa(p, 800) + ' 800w, ' + capa(p, 1100) + ' 1100w" sizes="(max-width: 900px) 100vw, 580px" width="1100" height="1062" alt="' + esc(p.alt) + '">';
    }
    $('#caso-cats').textContent = p.cats.join(' · ');
    $('#caso-titulo').textContent = p.cliente;
    $('#caso-onde').textContent = p.onde;
    $('#caso-resumo').textContent = p.resumo;
    $('#caso-desafio').textContent = p.desafio;
    $('#caso-fizemos').textContent = p.fizemos;
    $('#caso-entregas').innerHTML = p.entregas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    $('#caso-cta').href = wa('Olá! Vi o projeto ' + p.cliente + ' no site da Anil e quero algo parecido para a minha marca.');
    $('#caso-pos').textContent = (atual + 1) + ' / ' + lista.length;
    caso.scrollTop = 0;
  }
  grade.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]');
    if (!b) return;
    lista = filtrados();
    atual = lista.findIndex(function (p) { return p.id === b.dataset.id; });
    preencheCaso(); abrir(caso);
  });
  /* o WhatsApp de dentro de uma janela fecha a janela: a conversa abre em outra aba e, na demonstração,
     o aviso do ../_demo.js (que mora no body) não fica escondido atrás da camada do showModal */
  $('#caso-cta').addEventListener('click', function () { caso.close(); });
  $('#orc-wa').addEventListener('click', function () { $('#orc').close(); });
  function passa(d) { atual = (atual + d + lista.length) % lista.length; preencheCaso(); }
  $$('[data-caso]', caso).forEach(function (b) { b.addEventListener('click', function () { passa(+b.dataset.caso); }); });
  caso.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') passa(1);
    if (e.key === 'ArrowLeft') passa(-1);
  });

  pega('projetos').then(function (d) { P = d; desenhaFiltros(); desenhaGrade(null); })
    .catch(function () { grade.innerHTML = '<li class="erro">Não consegui carregar os projetos. Recarregue a página.</li>'; });

  /* ===== [04] onde a sua marca precisa chegar ===== */
  var O = null, ativo = 0;
  var ulObj = $('#objetivos'), combo = $('#combo'), lado = $('#alcance-lado');
  function desenhaCombo(animar) {
    var o = O[ativo];
    combo.innerHTML =
      '<div class="combo__topo"><h3>' + esc(o.titulo) + '</h3><span class="combo__etq">Combinação ' + dois(ativo + 1) + '</span></div>' +
      '<p class="combo__tag">' + esc(o.tag) + '</p>' +
      '<p class="combo__txt">' + esc(o.texto) + '</p>' +
      '<p class="combo__inclui"><span>Aqui entram:</span> ' + o.inclui.map(function (s) { return '<em>' + esc(s) + '</em>'; }).join(' · ') + '</p>' +
      '<div class="combo__acoes"><a class="pilula" href="' + wa('Olá! Vim pelo site da Anil. Quero conversar sobre: ' + o.titulo + '.') + '" target="_blank" rel="noopener">Conversar sobre esta combinação</a>' +
      '<button type="button" class="combo__reset">Recomeçar</button></div>';
    combo.classList.remove('troca');
    if (animar) { void combo.offsetWidth; combo.classList.add('troca'); }
    posicionaCombo();
  }
  function posicionaCombo() {
    var alvo = CELULAR.matches ? ulObj.children[ativo] : lado;
    if (alvo && combo.parentNode !== alvo) alvo.appendChild(combo);
  }
  function desenhaObjetivos() {
    ulObj.innerHTML = O.map(function (o, i) {
      return '<li class="obj-item"><button type="button" class="obj" aria-pressed="' + (i === ativo) + '" aria-controls="combo">' +
        '<span class="obj__ponto" aria-hidden="true"></span><span>' + esc(o.titulo) + '</span>' +
        '<svg class="obj__x" aria-hidden="true"><use href="#i-x"/></svg></button></li>';
    }).join('');
  }
  function escolhe(i, animar) {
    ativo = i;
    $$('.obj', ulObj).forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
    desenhaCombo(animar);
  }
  ulObj.addEventListener('click', function (e) {
    var b = e.target.closest('.obj');
    if (!b) return;
    var i = $$('.obj', ulObj).indexOf(b);
    if (i !== ativo) escolhe(i, true);
  });
  combo.addEventListener('click', function (e) {
    if (!e.target.closest('.combo__reset')) return;
    escolhe(0, true);
    $('.obj', ulObj).focus();
  });
  CELULAR.addEventListener('change', function () { if (O) posicionaCombo(); });
  pega('objetivos').then(function (d) { O = d.objetivos; desenhaObjetivos(); desenhaCombo(false); }).catch(function () {});

  var bServ = $('#todos-servicos'), lServ = $('#lista-servicos');
  bServ.addEventListener('click', function () {
    var abre = lServ.hidden;
    lServ.hidden = !abre; bServ.setAttribute('aria-expanded', String(abre));
    bServ.firstChild.textContent = abre ? 'Esconder a lista de serviços ' : 'Ver todos os serviços ';
  });

  /* ===== [06] blog ===== */
  var CAPAS = {
    gota: '<circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="8"/><g transform="translate(10 12) scale(1)"><path fill="currentColor" d="M67.6 14.4Q66.7 36.8 70.9 56.3A21 21 0 1 1 36.1 42.3Q52.7 31.2 67.6 14.4Z"/></g>',
    anel: '<circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="60" cy="60" r="11" fill="currentColor"/>',
    meia: '<circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="8"/><path d="M14 60a46 46 0 0 0 92 0z" fill="currentColor"/><g transform="translate(31 9) scale(.58)"><path fill="currentColor" d="M67.6 14.4Q66.7 36.8 70.9 56.3A21 21 0 1 1 36.1 42.3Q52.7 31.2 67.6 14.4Z"/></g>'
  };
  var B = [], artigo = $('#artigo');
  pega('blog').then(function (d) {
    B = d.posts;
    var alvo = $('#posts');
    alvo.innerHTML = B.map(function (p, i) {
      return '<article class="post" data-rv>' +
        '<div class="post__capa" aria-hidden="true"><svg viewBox="0 0 120 120" style="color:var(--anil-luz)">' + (CAPAS[p.capa] || CAPAS.gota) + '</svg></div>' +
        '<div><p class="post__cat">' + esc(p.cat) + '</p><h3>' + esc(p.titulo) + '</h3>' +
        '<p class="post__ex">' + esc(p.resumo) + '</p>' +
        '<div class="post__pe"><span class="post__n">' + ('00' + (i + 1)).slice(-3) + '</span><i></i>' +
        '<button type="button" class="post__ler" data-post="' + i + '">Leia mais<span class="vh">: ' + esc(p.titulo) + '</span> <svg aria-hidden="true"><use href="#i-seta"/></svg></button></div></div>' +
        '</article>';
    }).join('');
    $$('[data-rv]', alvo).forEach(observa);
  }).catch(function () {});
  $('#posts').addEventListener('click', function (e) {
    var b = e.target.closest('[data-post]');
    if (!b) return;
    var p = B[+b.dataset.post];
    $('#artigo-cat').textContent = p.cat;
    $('#artigo-titulo').textContent = p.titulo;
    $('#artigo-meta').textContent = p.data + ' · ' + p.leitura + ' de leitura · por Anil';
    $('#artigo-corpo').innerHTML = p.corpo.map(function (t) {
      return t.indexOf('## ') === 0 ? '<h3>' + esc(t.slice(3)) + '</h3>' : '<p>' + esc(t) + '</p>';
    }).join('');
    abrir(artigo);
  });

  /* ===== orçamento ===== */
  var orc = $('#orc'), form = $('#orc-form'), ok = $('#orc-ok'), erro = $('#orc-erro'), chips = $('#orc-chips');
  chips.innerHTML = (CFG.servicosOrcamento || []).map(function (s) { return '<button type="button" aria-pressed="false">' + esc(s) + '</button>'; }).join('');
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  });
  /* o aviso de erro sai assim que a pessoa mexe no campo */
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') { e.target.removeAttribute('aria-invalid'); erro.textContent = ''; }
  });
  var tel = form.elements.whats;
  tel.addEventListener('input', function () {
    var d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6)
      : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2) : d;
  });
  $$('[data-orcamento]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (artigo.open) artigo.close();
      form.hidden = false; ok.hidden = true; erro.textContent = '';
      abrir(orc);
      setTimeout(function () { form.elements.nome.focus(); }, 60);
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, ruins = [];
    [['nome', f.nome.value.trim().length >= 2], ['empresa', f.empresa.value.trim().length >= 2],
     ['whats', /^\d{10,11}$/.test(f.whats.value.replace(/\D/g, ''))]].forEach(function (c) {
      f[c[0]].setAttribute('aria-invalid', String(!c[1]));
      if (!c[1]) ruins.push(f[c[0]]);
    });
    var quer = $$('[aria-pressed="true"]', chips).map(function (b) { return b.textContent; });
    if (ruins.length) {
      erro.textContent = ruins[0] === f.whats ? 'Confere o WhatsApp: DDD e número.' : 'Falta preencher ' + (ruins[0] === f.nome ? 'o seu nome.' : 'a empresa ou marca.');
      ruins[0].focus(); return;
    }
    erro.textContent = '';
    var nome = f.nome.value.trim();
    $('#orc-ok-titulo').textContent = 'Recebido, ' + nome.split(' ')[0] + '!';
    $('#orc-wa').href = wa('*Pedido de orçamento pelo site da Anil*\n*Nome:* ' + nome + '\n*Empresa:* ' + f.empresa.value.trim() +
      '\n*WhatsApp:* ' + f.whats.value + '\n*Precisa de:* ' + (quer.length ? quer.join(', ') : 'ainda não sei'));
    form.hidden = true; ok.hidden = false;
    $('#orc-ok-titulo').focus();
  });
  orc.addEventListener('close', function () {
    if (!ok.hidden) { form.reset(); $$('[aria-pressed]', chips).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
    $$('input', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
  });
})();
