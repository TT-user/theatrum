// Agência Viaje com Cirene (Carangola, MG): prévia. Contato em js/config.js; viagens, avaliações,
// dúvidas e o aviso do topo em data/*.json (mudou um JSON, suba o V abaixo).
// A viagem cujo fim já passou sai sozinha da agenda e vai para "Por onde a agenda já passou".
// Espanhol: o seletor PT · ES grava a escolha e recarrega com ?lang=. Os textos fixos e os do JS passam
// por t(), com o dicionário em js/es.js; os textos das viagens e das dúvidas vêm de data/es/ (preços e
// datas ficam só em data/viagens.json). As avaliações ficam no original, em português.
(function () {
  'use strict';
  // Em espanhol, o dicionário (js/es.js) baixa antes; se falhar, a página fica em português
  if (document.documentElement.lang === 'es' && !window.VC_ES) {
    var s = document.createElement('script'); s.src = 'js/es.js?v=3'; s.onload = s.onerror = inicia; document.head.appendChild(s);
  } else inicia();
  function inicia() {
  var V = 3;
  var C = window.VC;
  var raiz = document.documentElement;
  var ES = raiz.lang === 'es' && window.VC_ES ? window.VC_ES : null;
  var LANG = ES ? 'es' : 'pt';
  if (!ES) raiz.lang = 'pt-BR';
  var still = /[?&]still=1/.test(location.search);
  var calmo = still || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) raiz.classList.add('still');
  // ?hoje=AAAA-MM-DD finge outra data, para conferir como o site fica mais adiante
  var mHoje = /[?&]hoje=(\d{4}-\d{2}-\d{2})/.exec(location.search);
  var HOJE = mHoje ? data(mHoje[1]) : (function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  // ---------- tradução ----------
  function t(s) { return ES && ES.t[s] != null ? ES.t[s] : s; }
  // f('{n} dias', { n: 5 }): frase com número no meio
  function f(s, v) { return t(s).replace(/\{(\w+)\}/g, function (m, k) { return v[k]; }); }
  function traduzDOM() {
    if (!ES) return;
    document.title = t(document.title);
    var md = document.querySelector('meta[name=description]'); if (md) md.content = t(md.content);
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentNode.closest('script, style, svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var nos = []; while (w.nextNode()) nos.push(w.currentNode);
    nos.forEach(function (n) {
      var limpoN = n.nodeValue.replace(/\s+/g, ' ').trim();
      if (limpoN && ES.t[limpoN] != null) n.nodeValue = n.nodeValue.replace(/\S[\s\S]*\S|\S/, ES.t[limpoN]);
    });
    ['aria-label', 'alt', 'title', 'placeholder', 'data-zap'].forEach(function (a) {
      document.querySelectorAll('[' + a + ']').forEach(function (el) { var v = el.getAttribute(a); if (ES.t[v] != null) el.setAttribute(a, ES.t[v]); });
    });
  }
  traduzDOM();
  raiz.classList.remove('traduzindo');
  // Seletor PT · ES
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.lang === LANG ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (b.dataset.lang === LANG) return;
      try { localStorage.setItem('vc-idioma', b.dataset.lang); } catch (e) {}
      var q = location.search.replace(/[?&]lang=\w+/, '').replace(/^&/, '?');
      location.href = location.pathname + (q ? q + '&' : '?') + 'lang=' + b.dataset.lang;
    });
  });

  // ---------- utilidades ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ph(s) { return '<span class="ph">' + esc(s) + '</span>'; }
  // Texto com [colchete] vira placeholder amarelo
  function txt(s) { return esc(s).replace(/\[([^\]]+)\]/g, function (m) { return '<span class="ph">' + m + '</span>'; }); }
  function limpo(s) { return String(s).replace(/\s*\[[^\]]+\]/g, ''); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function zap(msg) { return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(msg); }
  function reais(n) {
    var inteiro = Math.round(n * 100) % 100 === 0;
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: inteiro ? 0 : 2, maximumFractionDigits: 2 });
  }
  function icone(tr) { return { onibus: 'i-onibus', aviao: 'i-aviao', navio: 'i-navio' }[tr] || 'i-cal'; }
  function svg(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function semLazy() { if (still) $$('img[loading=lazy]').forEach(function (i) { i.loading = 'eager'; }); }

  // ---------- datas ----------
  var MESES = ES ? ES.meses : ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MES3 = ES ? ES.mes3 : ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var SEMANA = ES ? ES.semana : ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var A = ES ? ' al ' : ' a ';
  function data(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dd(n) { return (n < 10 ? '0' : '') + n; }
  function dias(v) { return Math.round((data(v.fim) - data(v.inicio)) / 864e5) + 1; }
  function mesDe(v) { return v.inicio.slice(0, 7); }
  function passou(v) { return data(v.fim) < HOJE; }
  function periodoCurto(v) {
    var a = data(v.inicio), b = data(v.fim);
    if (a.getMonth() === b.getMonth()) return dd(a.getDate()) + A + dd(b.getDate()) + ' ' + MES3[b.getMonth()];
    return dd(a.getDate()) + ' ' + MES3[a.getMonth()] + A + dd(b.getDate()) + ' ' + MES3[b.getMonth()];
  }
  function periodoMsg(v) {
    var a = data(v.inicio), b = data(v.fim);
    var fim = dd(b.getDate()) + '/' + dd(b.getMonth() + 1) + '/' + b.getFullYear();
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return dd(a.getDate()) + A + fim;
    return dd(a.getDate()) + '/' + dd(a.getMonth() + 1) + (a.getFullYear() !== b.getFullYear() ? '/' + a.getFullYear() : '') + A + fim;
  }
  function periodoLongo(v) {
    var a = data(v.inicio), b = data(v.fim);
    return cap(SEMANA[a.getDay()]) + ', ' + a.getDate() + ' de ' + MESES[a.getMonth()] + (a.getFullYear() !== b.getFullYear() ? ' de ' + a.getFullYear() : '') +
      ',' + A + SEMANA[b.getDay()] + ', ' + b.getDate() + ' de ' + MESES[b.getMonth()] + ' de ' + b.getFullYear();
  }
  function nomeMes(chave, curto) {
    var a = +chave.slice(0, 4), m = +chave.slice(5, 7) - 1;
    if (curto) return MES3[m] + (a !== HOJE.getFullYear() ? '/' + String(a).slice(2) : '');
    return MESES[m] + ' de ' + a;
  }

  // ---------- preço: só o que o post da agência diz ----------
  function preco(v) {
    var p = v.preco || {}, o = { tem: false, nota: p.nota ? t(p.nota) : '', base: p.base ? t(p.base) : '' };
    var pt = p.parcelasTexto ? t(p.parcelasTexto) : '';
    if (p.valorParcela) {
      o.tem = true; o.rotulo = p.aPartirDe ? t('A partir de') : t('Em'); o.valor = f('{n}x de {v}', { n: p.parcelas, v: reais(p.valorParcela) });
      o.linha = p.descontoAVista ? f('À vista com {d}% de desconto', { d: p.descontoAVista }) : '';
      o.curto = (p.aPartirDe ? t('a partir de') + ' ' : '') + o.valor;
      o.total = p.parcelas * p.valorParcela;
    } else if (p.aVista) {
      o.tem = true; o.rotulo = t('À vista'); o.valor = reais(p.aVista);
      o.linha = p.parcelado ? t('ou') + ' ' + reais(p.parcelado) + ' ' + (pt || (p.parcelas ? f('em {n}x', { n: p.parcelas }) : t('parcelado'))) : o.nota;
      o.curto = reais(p.aVista) + ' ' + t('à vista');
    } else if (p.parcelado) {
      o.tem = true; o.rotulo = cap(pt || t('parcelado')); o.valor = reais(p.parcelado);
      // as duas contas abaixo não estão no story: o "dá" diz que é conta do site
      o.linha = p.descontoAVista ? f('{d}% de desconto à vista (dá {v})', { d: p.descontoAVista, v: reais(p.parcelado * (1 - p.descontoAVista / 100)) })
        : (p.parcelas ? f('Dá {n}x de {v}', { n: p.parcelas, v: reais(p.parcelado / p.parcelas) }) : '');
      o.curto = reais(p.parcelado) + ' ' + (pt || t('parcelado'));
    } else if (p.valor) {
      o.tem = true; o.rotulo = t('Valor publicado'); o.valor = reais(p.valor); o.linha = o.nota; o.curto = reais(p.valor);
    }
    return o;
  }
  function precoHTML(v) {
    var o = preco(v);
    if (v.status === 'encerrada') return '<div class="preco preco--encerrada"><small>' + t('Vagas encerradas para esta data') + '</small>' +
      (o.tem ? '<strong>' + o.valor + '</strong>' : '') + '<span>' + t('Entre na lista de espera') + '</span></div>';
    if (!o.tem) return '<div class="preco preco--consulte"><small>' + (v.inclui.length ? t('Roteiro completo e condições') : t('Roteiro e valor')) +
      '</small><strong>' + t('Valor no WhatsApp') + '</strong>' + (o.nota ? '<span>' + esc(o.nota) + '</span>' : '') + '</div>';
    return '<div class="preco"><small>' + esc(o.rotulo) + '</small><strong>' + o.valor + '</strong>' +
      (o.linha ? '<span>' + esc(o.linha) + '</span>' : '') + (o.base ? '<span>' + esc(cap(o.base)) + '</span>' : '') + '</div>';
  }

  // ---------- mensagens do WhatsApp ----------
  function valorPublicado(v) { var o = preco(v); return o.tem ? o.curto + (o.base ? ', ' + o.base : '') : ''; }
  function linhasViagem(v) { return '\n*' + t('Viagem') + ':* ' + v.titulo + '\n*' + t('Datas') + ':* ' + periodoMsg(v); }
  function msgCard(v) {
    if (v.status === 'encerrada') return t('Olá, Cirene! Vi no site que as vagas desta viagem encerraram e quero entrar na lista de espera:') + linhasViagem(v);
    if (!preco(v).tem) return t('Olá, Cirene! Vim pelo site e quero o roteiro completo e o valor desta viagem:') + linhasViagem(v);
    return t('Olá, Cirene! Vim pelo site e quero reservar esta viagem:') + linhasViagem(v) +
      '\n*' + t('Valor publicado') + ':* ' + valorPublicado(v) + '\n' + t('Ainda tem vaga?');
  }
  function acao(v) {
    if (v.status === 'encerrada') return '<a class="btn btn--marinho" href="' + esc(zap(msgCard(v))) + '" target="_blank" rel="noopener">' + t('Lista de espera') + '</a>';
    if (!preco(v).tem) return '<a class="btn btn--zap" href="' + esc(zap(msgCard(v))) + '" target="_blank" rel="noopener">' + svg('i-zap') + t('Pedir valor') + '</a>';
    return '<a class="btn btn--zap" href="' + esc(zap(msgCard(v))) + '" target="_blank" rel="noopener">' + svg('i-zap') + t('Quero reservar') + '</a>';
  }

  // ---------- imagens ----------
  function img(v, sizes, eager) {
    var b = 'assets/img/' + v.foto;
    return '<img src="' + b + '-480.webp" srcset="' + b + '-480.webp 480w, ' + b + '-800.webp 800w, ' + b + '-1040.webp 1040w" sizes="' + sizes +
      '" width="800" height="533" alt="' + esc(v.fotoAlt) + '"' + (eager || still ? '' : ' loading="lazy"') + ' decoding="async">';
  }

  // ---------- links fixos de WhatsApp ----------
  function ligaZap(raizEl) {
    $$('[data-zap]', raizEl).forEach(function (a) { a.href = zap(a.getAttribute('data-zap')); a.target = '_blank'; a.rel = 'noopener'; });
  }
  ligaZap(document);

  // ---------- config ----------
  $('#ano').textContent = new Date().getFullYear();
  $('#c-endereco').textContent = C.endereco;
  $('#c-horario').innerHTML = C.horario.map(function (h) { return esc(t(h)); }).join('<br>');
  $('#c-zap').textContent = C.whatsappTexto;
  $('#c-insta').href = C.instagram; $('#c-insta').textContent = C.instagramTexto;
  $('#rota').href = C.rotaUrl;
  $('#r-endereco').textContent = C.endereco;
  $('#r-email').innerHTML = 'E-mail: ' + (C.email ? '<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' : ph('[e-mail]'));
  $('#r-cnpj').innerHTML = C.cnpj ? 'CNPJ ' + esc(C.cnpj) : ph('[CNPJ]');
  $('#r-cadastur').innerHTML = C.cadastur ? 'Cadastur ' + esc(C.cadastur) : ph(t('[número do Cadastur]'));
  $('#ver-google').href = C.googlePerfil;
  $('#fato-nota').textContent = C.nota; $('#nota-n').textContent = C.nota;
  $('#fato-nota-txt').textContent = f('no Google, em {n} avaliações', { n: C.totalAvaliacoes });
  $('#nota-t').textContent = f('{n} avaliações no Google', { n: C.totalAvaliacoes });
  $('#nota-est').setAttribute('aria-label', f('{n} de 5 estrelas', { n: C.nota }));
  if (C.pontoEmbarque) $('#p-embarque').textContent = t('No dia, é só chegar ao ponto de embarque:') + ' ' + C.pontoEmbarque + '.';
  $('#avaliar').href = C.avaliarUrl;
  $('#r-avaliar').href = C.avaliarUrl;

  // ---------- topo, menu e medida do hero ----------
  var topo = $('#topo'), menu = $('#menu'), menuBtn = $('#menu-btn'), hero = $('#inicio');
  function medeAcima() {
    var acima = Math.round(hero.getBoundingClientRect().top + scrollY);
    raiz.style.setProperty('--acima', acima + 'px');
    raiz.style.setProperty('--topo-fim', Math.round(topo.getBoundingClientRect().bottom) + 'px');
  }
  medeAcima(); addEventListener('resize', medeAcima); addEventListener('load', medeAcima);
  addEventListener('scroll', function () { topo.classList.toggle('rolou', scrollY > 8); }, { passive: true });
  function menuAbre(abre) {
    medeAcima();
    menu.classList.toggle('abre', abre);
    menuBtn.setAttribute('aria-expanded', abre ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', abre ? t('Fechar o menu') : t('Abrir o menu'));
  }
  menuBtn.addEventListener('click', function () { menuAbre(!menu.classList.contains('abre')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) menuAbre(false); });

  // Menu acende a seção à vista
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('.menu > a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var espia = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var a = links[e.target.id]; if (!a) return;
        if (e.isIntersecting) { $$('.menu > a[aria-current]').forEach(function (x) { x.removeAttribute('aria-current'); }); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) espia.observe(s); });
  }

  // Barra do celular e WhatsApp flutuante: só depois da primeira tela
  var barra = $('#barra'), flutua = $('#zap-flutua');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var ver = !es[0].isIntersecting;
      barra.classList.toggle('ver', ver); flutua.classList.toggle('ver', ver); document.body.classList.toggle('barra-on', ver);
      if (ver) { barra.removeAttribute('inert'); flutua.removeAttribute('tabindex'); } else { barra.setAttribute('inert', ''); flutua.setAttribute('tabindex', '-1'); }
    }, { threshold: 0 }).observe(hero);
  }

  // Letreiro: anda só com o hero à vista e a aba aberta
  var letreiro = $('#letreiro');
  if (!calmo && 'IntersectionObserver' in window) {
    var letVisivel = false;
    var anda = function () { letreiro.classList.toggle('anda', letVisivel && !document.hidden); };
    new IntersectionObserver(function (es) { letVisivel = es[0].isIntersecting; anda(); }).observe(letreiro);
    document.addEventListener('visibilitychange', anda);
  }

  // Entrada ao rolar
  var revela = (!calmo && 'IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); revela.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function rv(sel) { if (!revela) return; $$(sel).forEach(function (el) { if (!el.classList.contains('rv')) { el.classList.add('rv'); revela.observe(el); } }); }
  rv('.cab, .passo, .porque li, .cirene__foto, .cirene__texto, .contato__info, .mapa, .quiz__intro, .duvidas__cab, .cta__in, .exterior');

  // Mapa só no clique
  $('#mapa-btn').addEventListener('click', function () {
    var fr = document.createElement('iframe');
    fr.src = C.mapaEmbed; fr.title = t('Mapa da Agência Viaje com Cirene em Carangola'); fr.loading = 'lazy'; fr.referrerPolicy = 'no-referrer-when-downgrade';
    $('#mapa').appendChild(fr);
    this.remove(); $('.mapa__pino').remove();
  });

  // ---------- dados ----------
  function pega(n) { return fetch('data/' + n + '.json?v=' + V).then(function (r) { if (!r.ok) throw new Error(n); return r.json(); }); }
  var TODAS = [], FUTURAS = [], POR_ID = {}, PROXIMA = null;
  var pedidos = [pega('viagens'), pega('info'), pega('avaliacoes'), pega('duvidas')];
  function talvez(n) { return pega(n).catch(function () { return null; }); }
  if (ES) pedidos.push(talvez('es/viagens'), talvez('es/info'), talvez('es/duvidas'));

  Promise.all(pedidos).then(function (d) {
    if (ES) {
      // Em espanhol, os textos de cada viagem vêm de data/es/viagens.json, pela id; preço e datas não mudam
      if (d[4]) d[0].viagens.forEach(function (v) { var tr = d[4].viagens[v.id]; if (tr) Object.keys(tr).forEach(function (k) { v[k] = tr[k]; }); });
      if (d[5]) { d[1].aviso = d[5].aviso; d[1].jaPassaram = d[5].jaPassaram; }
      if (d[6]) d[3] = d[6];
    }
    TODAS = d[0].viagens.slice().sort(function (a, b) { return a.inicio < b.inicio ? -1 : 1; });
    TODAS.forEach(function (v) { POR_ID[v.id] = v; });
    FUTURAS = TODAS.filter(function (v) { return !passou(v); });
    var prox = FUTURAS.filter(function (v) { return v.status !== 'encerrada' && data(v.inicio) >= HOJE; });
    PROXIMA = prox.length ? prox[0] : null;
    montaAviso(d[1]);
    montaPasse();
    montaExterior();
    montaFiltros();
    montaViagens();
    montaPassaram(d[1]);
    montaCreditos(d[1]);
    montaQuiz();
    montaAvaliacoes(d[2]);
    montaDuvidas(d[3]);
    semLazy();
    medeAcima();
    abrePeloEndereco();
  }).catch(function (e) {
    $('#lista-viagens').innerHTML = '<p class="vazio">' + t('Não deu para carregar as viagens agora. Fale com a agência:') + ' <a href="' + esc(zap(t('Olá, Cirene! Quero saber das próximas viagens.'))) + '">' + esc(C.whatsappTexto) + '</a></p>';
    if (window.console) console.error(e);
  });

  // ---------- aviso do topo ----------
  function montaAviso(info) {
    var a = info.aviso, el = $('#aviso');
    if (!a || !a.texto) return;
    var v = a.link && POR_ID[a.link];
    if (v && passou(v)) return;
    el.innerHTML = esc(a.texto) + (v ? '<b>' + t('Ver a viagem') + '</b>' : '');
    el.href = v ? '#v-' + v.id : '#viagens';
    el.hidden = false;
  }

  // ---------- hero: próxima saída e fatos ----------
  function montaPasse() {
    var passe = $('#passe');
    if (!PROXIMA) { passe.hidden = true; return; }
    var v = PROXIMA, a = data(v.inicio), b = data(v.fim), o = preco(v);
    passe.href = '#v-' + v.id;
    $('#passe-dest').textContent = v.titulo;
    $('#passe-lugar').textContent = v.lugar;
    $('#passe-ida').textContent = dd(a.getDate()) + ' ' + MES3[a.getMonth()];
    $('#passe-volta').textContent = dd(b.getDate()) + ' ' + MES3[b.getMonth()];
    $('#passe-dias').textContent = dias(v);
    $('.passe__topo use').setAttribute('href', '#' + icone(v.transporte));
    $('#passe-preco').innerHTML = o.tem ? '<b>' + o.valor + '</b> ' + esc(o.rotulo.toLowerCase()) : t('<b>Valor</b> no WhatsApp');
    var ultima = FUTURAS[FUTURAS.length - 1];
    $('#fato-n').textContent = FUTURAS.length;
    $('#fato-n-txt').textContent = f(FUTURAS.length === 1 ? 'viagem na agenda até {m}' : 'viagens na agenda até {m}', { m: nomeMes(mesDe(ultima)) });
  }

  // ---------- viagens para fora do Brasil (tag 'exterior') ----------
  function fora() { return FUTURAS.filter(function (v) { return v.tags.indexOf('exterior') >= 0 && v.status !== 'encerrada'; }); }
  function montaExterior() {
    var l = fora(), el = $('#exterior-txt');
    el.textContent = l.length ? t('Na agenda:') + ' ' + l.map(function (v) {
      return v.titulo + ' (' + periodoCurto(v) + (v.paises ? ', ' + t('passando por') + ' ' + v.paises.join(t(' e ')) : '') + ')';
    }).join('; ') + '.' : t('Nenhuma viagem para fora do Brasil na agenda agora.');
  }

  // ---------- viagens: filtros, cards e agenda ----------
  var estado = { tr: 'todas', mes: 'todos', vista: 'cards' };
  function confere(v) {
    if (estado.tr === 'todas') return true;
    if (estado.tr === 'exterior') return v.tags.indexOf('exterior') >= 0;
    return v.transporte === estado.tr;
  }
  function montaFiltros() {
    var trs = [['todas', 'Todas'], ['onibus', 'De ônibus'], ['aviao', 'De avião'], ['navio', 'Cruzeiro'], ['exterior', 'Fora do Brasil']].filter(function (x) {
      if (x[0] === 'todas') return true;
      if (x[0] === 'exterior') return FUTURAS.some(function (v) { return v.tags.indexOf('exterior') >= 0; });
      return FUTURAS.some(function (v) { return v.transporte === x[0]; });
    });
    $('#f-transporte').innerHTML = trs.map(function (x) {
      var ic = x[0] === 'exterior' ? 'i-pino' : icone(x[0]);
      return '<button type="button" class="chip" data-tr="' + x[0] + '" aria-pressed="' + (x[0] === estado.tr) + '">' + (x[0] !== 'todas' ? svg(ic) : '') + t(x[1]) + '</button>';
    }).join('');
    var meses = [];
    FUTURAS.forEach(function (v) { if (meses.indexOf(mesDe(v)) < 0) meses.push(mesDe(v)); });
    $('#f-mes').innerHTML = '<button type="button" class="chip" data-mes="todos" aria-pressed="true">' + t('Todos os meses') + '</button>' + meses.map(function (m) {
      return '<button type="button" class="chip" data-mes="' + m + '" aria-pressed="false">' + nomeMes(m, true) + '</button>';
    }).join('');
    $('#filtros').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tr) estado.tr = b.dataset.tr;
      else if (b.dataset.mes) estado.mes = b.dataset.mes;
      else if (b.dataset.vista) estado.vista = b.dataset.vista;
      $$('#filtros [data-tr]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.tr === estado.tr); });
      $$('#filtros [data-mes]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.mes === estado.mes); });
      $$('#filtros [data-vista]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.vista === estado.vista); });
      montaViagens();
    });
  }
  function filtradas() {
    return FUTURAS.filter(function (v) { return confere(v) && (estado.mes === 'todos' || mesDe(v) === estado.mes); });
  }
  function selos(v) {
    var s = [];
    if (v.selo) s.push(['', v.selo]);
    if (v.status === 'encerrada') s.push(['encerrada', t('Vagas encerradas')]);
    else if (v.status === 'vagas') s.push(['vagas', t('Ainda temos vagas')]);
    else if (PROXIMA && v.id === PROXIMA.id) s.push(['', t('Próxima saída')]);
    if (!s.length) return '';
    return '<span class="v__selos">' + s.map(function (x) { return '<span class="v__selo' + (x[0] ? ' v__selo--' + x[0] : '') + '">' + esc(x[1]) + '</span>'; }).join('') + '</span>';
  }
  function card(v) {
    return '<article class="v" id="v-' + v.id + '">' +
      '<figure class="v__foto">' + img(v, '(min-width: 1001px) 380px, (min-width: 641px) 46vw, 92vw') + selos(v) +
        '<span class="v__data">' + svg('i-cal') + periodoCurto(v) + '</span></figure>' +
      '<div class="v__nome"><p class="v__lugar">' + svg('i-pino') + esc(v.lugar) + '</p>' +
        '<h3 class="v__titulo"><button type="button" class="v__abre" data-abre="' + v.id + '">' + esc(v.titulo) + '</button></h3></div>' +
      '<p class="v__sub">' + txt(v.subtitulo) + '</p>' +
      '<ul class="v__meta"><li>' + svg(icone(v.transporte)) + txt(v.transporteTexto) + '</li><li>' + svg('i-cal') + f('{n} dias', { n: dias(v) }) + '</li></ul>' +
      '<div class="v__preco">' + precoHTML(v) + '</div>' +
      '<div class="v__btns">' + acao(v) + '<button type="button" class="btn btn--linha" data-abre="' + v.id + '">' + (v.inclui.length ? t('O que inclui') : t('Detalhes')) + '</button></div>' +
    '</article>';
  }
  function vazio() {
    return '<div class="vazio"><p>' + t('Nenhuma viagem da agenda com esse filtro.') + '</p>' +
      '<button type="button" class="btn btn--linha" data-limpa>' + t('Ver todas as viagens') + '</button>' +
      '<a class="btn btn--zap" href="' + esc(zap(t('Olá, Cirene! Vim pelo site e procuro uma viagem que não está na agenda. Vocês têm algo para:'))) + '" target="_blank" rel="noopener">' + svg('i-zap') + t('Perguntar para a Cirene') + '</a></div>';
  }
  function linhaAgenda(v) {
    var o = preco(v), dir;
    if (v.status === 'encerrada') dir = '<span class="tag tag--fim">' + t('Vagas encerradas') + '</span>';
    else if (v.status === 'vagas') dir = (o.tem ? o.valor + '<small>' + esc(o.rotulo.toLowerCase()) + '</small>' : '') + '<span class="tag">' + t('Ainda temos vagas') + '</span>';
    else dir = o.tem ? o.valor + '<small>' + esc(o.rotulo.toLowerCase()) + '</small>' : '<small>' + t('valor no WhatsApp') + '</small>';
    return '<button type="button" class="agenda__linha" data-abre="' + v.id + '">' +
      '<span class="agenda__data">' + periodoCurto(v) + '</span>' +
      '<span class="agenda__dest">' + esc(v.titulo) + '<small>' + esc(v.lugar) + ' · ' + esc(limpo(v.subtitulo)) + '</small></span>' +
      '<span class="agenda__tr">' + svg(icone(v.transporte)) + esc(limpo(v.transporteTexto) || t('A confirmar')) + '</span>' +
      '<span class="agenda__preco">' + dir + '</span>' + '<svg class="agenda__seta" aria-hidden="true"><use href="#i-seta"/></svg></button>';
  }
  function montaViagens() {
    var lista = filtradas(), cards = $('#lista-viagens'), agenda = $('#agenda');
    var emLista = estado.vista === 'lista';
    cards.hidden = emLista; agenda.hidden = !emLista;
    $('#arrasta-v').hidden = emLista || lista.length < 2;
    $('#arrasta-v span').textContent = f('Arraste para ver as {n} viagens', { n: lista.length });
    if (!emLista) {
      cards.innerHTML = lista.length ? lista.map(card).join('') : vazio();
    } else if (!lista.length) {
      agenda.innerHTML = vazio();
    } else {
      var html = '', mes = '';
      lista.forEach(function (v) {
        if (mesDe(v) !== mes) { mes = mesDe(v); var n = nomeMes(mes).split(' de '); html += '<div class="agenda__mes">' + n[0] + ' <span>' + n[1] + '</span></div>'; }
        html += linhaAgenda(v);
      });
      agenda.innerHTML = html;
    }
    var limpa = $('[data-limpa]');
    if (limpa) limpa.addEventListener('click', function () { estado.tr = 'todas'; estado.mes = 'todos'; $$('#filtros .chip').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.tr === 'todas' || x.dataset.mes === 'todos'); }); montaViagens(); });
    $('#v-status').textContent = f(lista.length === 1 ? '{n} viagem na lista' : '{n} viagens na lista', { n: lista.length });
    semLazy();
    rv('.v');
  }

  // ---------- por onde a agenda já passou e créditos ----------
  function montaPassaram(info) {
    var nomes = TODAS.filter(passou).map(function (v) { return v.titulo + ', ' + v.lugar; });
    info.jaPassaram.forEach(function (n) { if (nomes.indexOf(n) < 0) nomes.push(n); });
    $('#passaram').innerHTML = nomes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
  }
  function montaCreditos(info) {
    $('#creditos').innerHTML = t('Fotos dos destinos ilustrativas, do Wikimedia Commons:') + ' ' + info.creditos.map(function (c) {
      return esc(t(c.lugar)) + ', ' + t('por') + ' <a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.autor) + '</a> (' + esc(t(c.licenca)) + ')';
    }).join('; ') + '. ' + t('Emblema redesenhado a partir do logo da agência; ícone do WhatsApp do Simple Icons (CC0).');
  }

  // ---------- gaveta da viagem ----------
  var gaveta = $('#gaveta'), painel = $('.gaveta__painel'), gc = $('#g-conteudo'), ultimoFoco = null, VIAGEM = null;
  var NAO_SEI = t('Ainda não sei');
  function opcoesPagamento(v) {
    var p = v.preco || {};
    if (v.status === 'encerrada') return [];
    if (p.aVista && p.parcelado) return [t('À vista') + ' (' + reais(p.aVista) + ')', (p.parcelas ? f('Em {n}x', { n: p.parcelas }) : cap(p.parcelasTexto ? t(p.parcelasTexto) : t('parcelado'))) + ' (' + reais(p.parcelado) + ')'];
    if (p.parcelado && p.descontoAVista) return [f('À vista ({d}% de desconto)', { d: p.descontoAVista }), t('Parcelado')];
    if (p.valorParcela && p.descontoAVista) return [f('À vista ({d}% de desconto)', { d: p.descontoAVista }), f('Em {n}x', { n: p.parcelas })];
    return [];
  }
  function gavetaHTML(v) {
    var o = preco(v), pag = opcoesPagamento(v), enc = v.status === 'encerrada';
    var h = '<figure class="g__foto">' + img(v, '(min-width: 641px) 580px, 100vw', true) + selos(v) + '<span class="v__data">' + svg('i-cal') + periodoCurto(v) + '</span></figure>' +
      '<div class="g__corpo"><p class="v__lugar">' + svg('i-pino') + esc(v.lugar) + '</p>' +
      '<h2 id="g-titulo">' + esc(v.titulo) + '</h2><p class="g__sub">' + txt(v.subtitulo) + '</p>' +
      '<ul class="g__info"><li>' + svg('i-cal') + '<span>' + periodoLongo(v) + ' · ' + f('{n} dias', { n: dias(v) }) + '</span></li>' +
      '<li>' + svg(icone(v.transporte)) + '<span>' + txt(v.transporteTexto) + '</span></li></ul>';
    if (v.paradas) h += '<h3 class="g__h">' + t('Paradas do navio') + '</h3><ul class="g__paradas">' + v.paradas.map(function (p) { return '<li>' + svg('i-pino') + esc(p) + '</li>'; }).join('') + '</ul>';
    if (v.inclui.length) h += '<h3 class="g__h">' + t('O que inclui') + '</h3><ul class="g__inclui">' + v.inclui.map(function (i) { return '<li>' + svg('i-check') + '<span>' + txt(i) + '</span></li>'; }).join('') + '</ul>';
    else h += '<h3 class="g__h">' + t('O que inclui') + '</h3><p class="g__sub">' + ph(t('[Roteiro e o que está incluso: pedir para a agência]')) + ' ' + t('Enquanto isso, a Cirene manda tudo pelo WhatsApp.') + '</p>';
    h += '<div class="g__preco">' + precoHTML(v) + '</div>';
    if (v.parceria) h += '<p class="g__parceria">' + f('Pacote em parceria com a {p}.', { p: esc(v.parceria) }) + '</p>';
    h += '<form class="g__form" id="g-form" novalidate>' +
      '<fieldset class="g__campo"><legend>' + t('Quantas pessoas vão') + '</legend><div class="passo-n"><button type="button" data-n="-1" aria-label="' + t('Uma pessoa a menos') + '">−</button><output id="g-n" aria-live="polite">2</output><button type="button" data-n="1" aria-label="' + t('Uma pessoa a mais') + '">+</button></div></fieldset>';
    if (pag.length) h += '<fieldset class="g__campo"><legend>' + t('Como prefere pagar') + '</legend><div class="g__ops">' + pag.concat([NAO_SEI]).map(function (x, i) {
      return '<label><input type="radio" name="g-pag" value="' + esc(x) + '"' + (i === pag.length ? ' checked' : '') + '><span>' + esc(x) + '</span></label>';
    }).join('') + '</div></fieldset>';
    h += '<label class="g__campo"><span>' + t('Seu nome (opcional)') + '</span><input type="text" id="g-nome" autocomplete="name" maxlength="60"></label>' +
      '<p class="g__conta" id="g-conta" hidden></p>' +
      '<div class="g__acoes"><a class="btn ' + (enc ? 'btn--marinho' : 'btn--zap') + ' btn--g" id="g-enviar" target="_blank" rel="noopener">' + (enc ? '' : svg('i-zap')) +
        (enc ? t('Entrar na lista de espera') : (o.tem ? t('Quero reservar') : t('Pedir roteiro e valor'))) + '</a></div>' +
      '<div class="g__links"><a id="g-duvida" target="_blank" rel="noopener">' + svg('i-duvida') + t('Tenho dúvida sobre essa viagem') + '</a>' +
        '<a id="g-envia" target="_blank" rel="noopener">' + svg('i-envia') + t('Mandar para quem vai comigo') + '</a></div></form></div>';
    return h;
  }
  function atualizaGaveta() {
    var v = VIAGEM; if (!v) return;
    var n = +$('#g-n').value || +$('#g-n').textContent, o = preco(v), p = v.preco || {};
    var pagEl = $('input[name="g-pag"]:checked'), pag = pagEl && pagEl.value !== NAO_SEI ? pagEl.value : '';
    var nome = ($('#g-nome').value || '').trim();
    var conta = $('#g-conta');
    if (p.porPessoa && o.tem && v.status !== 'encerrada') {
      var tot;
      if (p.valorParcela) tot = f('a partir de {n}x de {v} ({t})', { n: p.parcelas, v: reais(n * p.valorParcela), t: reais(n * o.total) });
      else if (p.parcelado) tot = reais(n * p.parcelado) + ' ' + t('parcelado') + (p.descontoAVista ? ', ' + t('ou') + ' ' + reais(n * p.parcelado * (1 - p.descontoAVista / 100)) + ' ' + t('à vista') : '');
      conta.innerHTML = '<b>' + f(n === 1 ? '{n} pessoa:' : '{n} pessoas:', { n: n }) + '</b> ' + esc(tot) + '. ' +
        f('Conta feita com o valor por pessoa que a agência publicou, em {b}.', { b: esc(t(p.base).replace(/^(por pessoa|por persona),\s*/, '')) });
      conta.hidden = false;
    } else conta.hidden = true;
    var cab = v.status === 'encerrada' ? t('Olá, Cirene! Vi no site que as vagas desta viagem encerraram e quero entrar na lista de espera:')
      : (o.tem ? t('Olá, Cirene! Vim pelo site e quero reservar esta viagem:') : t('Olá, Cirene! Vim pelo site e quero o roteiro completo e o valor desta viagem:'));
    var m = cab + linhasViagem(v) + '\n*' + t('Pessoas') + ':* ' + n;
    if (pag) m += '\n*' + t('Pagamento') + ':* ' + pag;
    if (o.tem && v.status !== 'encerrada') m += '\n*' + t('Valor publicado') + ':* ' + valorPublicado(v);
    if (nome) m += '\n*' + t('Nome') + ':* ' + nome;
    $('#g-enviar').href = zap(m);
  }
  function abre(id, semHash) {
    var v = POR_ID[id]; if (!v) return;
    VIAGEM = v;
    if (gaveta.hidden) ultimoFoco = document.activeElement;
    gc.innerHTML = gavetaHTML(v);
    gaveta.hidden = false;
    document.body.classList.add('trava');
    requestAnimationFrame(function () { requestAnimationFrame(function () { gaveta.classList.add('abre'); }); });
    painel.scrollTop = 0;
    painel.focus({ preventScroll: true });
    if (!semHash) history.replaceState(null, '', '#v-' + id);
    $('#g-duvida').href = zap(f('Olá, Cirene! Tenho uma dúvida sobre a viagem {v} ({d}):', { v: v.titulo, d: periodoMsg(v) }));
    var url = location.href.split('#')[0].replace(/[?&](still|hoje)=[^&]*/g, '');
    $('#g-envia').href = 'https://wa.me/?text=' + encodeURIComponent(f('Olha essa viagem da Viaje com Cirene: {v}, de {d}.', { v: v.titulo, d: periodoMsg(v) }) + ' ' + url + '#v-' + v.id);
    $('#g-form').addEventListener('click', function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      var out = $('#g-n'), n = Math.max(1, Math.min(20, (+out.textContent) + (+b.dataset.n)));
      out.textContent = n; out.value = n; atualizaGaveta();
    });
    $('#g-form').addEventListener('input', atualizaGaveta);
    $('#g-form').addEventListener('change', atualizaGaveta);
    $('#g-form').addEventListener('submit', function (e) { e.preventDefault(); });
    $('#g-n').value = 2;
    atualizaGaveta();
    semLazy();
  }
  function fecha() {
    if (gaveta.hidden) return;
    gaveta.classList.remove('abre');
    document.body.classList.remove('trava');
    setTimeout(function () { gaveta.hidden = true; gc.innerHTML = ''; VIAGEM = null; }, calmo ? 0 : 340);
    if (/^#v-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
  }
  gaveta.addEventListener('click', function (e) { if (e.target.closest('[data-fecha]')) fecha(); });
  document.addEventListener('keydown', function (e) {
    if (gaveta.hidden) return;
    if (e.key === 'Escape') { fecha(); return; }
    if (e.key === 'Tab') {
      var fs = $$('a[href], button, input, [tabindex]:not([tabindex="-1"])', painel).filter(function (x) { return x.offsetParent !== null; });
      if (!fs.length) return;
      if (e.shiftKey && (document.activeElement === fs[0] || document.activeElement === painel)) { e.preventDefault(); fs[fs.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === fs[fs.length - 1]) { e.preventDefault(); fs[0].focus(); }
    }
  });
  // Qualquer [data-abre] ou link #v-<id> abre a gaveta
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abre]');
    if (b) { abre(b.dataset.abre); return; }
    var a = e.target.closest('a[href^="#v-"]');
    if (a) { e.preventDefault(); abre(a.getAttribute('href').slice(3)); return; }
    var q = e.target.closest('a[href^="#duvida-"]');
    if (q) { var d = document.getElementById(q.getAttribute('href').slice(1)); if (d) d.open = true; }
  });
  function abrePeloEndereco() {
    var h = location.hash;
    if (/^#v-/.test(h)) abre(h.slice(3), true);
    else if (/^#duvida-/.test(h)) { var d = document.getElementById(h.slice(1)); if (d) { d.open = true; d.scrollIntoView(); } }
  }
  addEventListener('hashchange', abrePeloEndereco);

  // ---------- Para onde eu vou? ----------
  var Q, resp = {}, passo = 0;
  function op(v, tx, s) { return { v: v, t: t(tx), s: s ? t(s) : '' }; }
  function montaQuiz() {
    var meses = [];
    FUTURAS.forEach(function (v) { if (v.status !== 'encerrada' && meses.indexOf(mesDe(v)) < 0) meses.push(mesDe(v)); });
    Q = [
      { k: 'tipo', p: t('Que viagem combina com você agora?'), d: t('Isso define o destino.'), ops: [
        op('praia', 'Praia e mar', 'Nordeste e o litoral do ES e do RJ'),
        op('natureza', 'Natureza e serra', 'Lagos, cachoeiras e montanha'),
        op('cidade', 'Cidade e história', 'Centro histórico e city tour'),
        op('natal', 'Clima de Natal', 'Luzes de Natal e friozinho da serra'),
        op('cruzeiro', 'Cruzeiro e exterior', fora().length ? 'Viagens para fora do Brasil' : 'Navegar e conhecer vários lugares'),
        op('tanto', 'Me mostre tudo', 'Ainda não decidi')] },
      { k: 'tr', p: t('Como você prefere ir?'), d: t('Isso muda o tempo de viagem e o valor.'), ops: [
        op('onibus', 'De ônibus', 'Leito e semi-leito'),
        op('aviao', 'De avião', 'Pacotes com aéreo'),
        op('navio', 'De navio', 'Cruzeiro'),
        op('tanto', 'Tanto faz', 'O que for melhor')] },
      { k: 'mes', p: t('Quando dá para você viajar?'), d: t('Os meses são os da agenda da agência.'), ops: meses.map(function (m) {
        var n = FUTURAS.filter(function (v) { return mesDe(v) === m && v.status !== 'encerrada'; }).length;
        return { v: m, t: cap(nomeMes(m)), s: f(n === 1 ? '{n} viagem na agenda' : '{n} viagens na agenda', { n: n }) };
      }).concat([op('tanto', 'Qualquer data', 'Sou flexível')]) },
      { k: 'n', p: t('Quantas pessoas vão?'), d: t('Para a Cirene já saber quantas vagas separar.'), ops: [
        op('1', 'Só eu'), op('2', '2 pessoas'), op('3', '3 pessoas'), op('4 ou mais', '4 ou mais', 'Família ou grupo')] }
    ];
    desenhaQuiz();
    $('#quiz').addEventListener('click', function (e) {
      var o = e.target.closest('[data-op]');
      if (o) { resp[Q[passo].k] = o.dataset.op; passo++; desenhaQuiz(true); return; }
      if (e.target.closest('[data-volta]')) { passo = Math.max(0, passo - 1); desenhaQuiz(true); return; }
      if (e.target.closest('[data-refaz]')) { resp = {}; passo = 0; desenhaQuiz(true); }
    });
  }
  function rotulo(k, v) { var q = Q.filter(function (x) { return x.k === k; })[0]; var o = q.ops.filter(function (x) { return x.v === v; })[0]; return o ? o.t : v; }
  function pontua(v, r) {
    if (v.status === 'encerrada') return -1;
    var s = 0;
    if (r.tipo === 'tanto') s += 1; else if (v.tags.indexOf(r.tipo) >= 0) s += 4; else return -1;
    if (r.tr === 'tanto') s += 1; else if (v.transporte === r.tr) s += 3; else if (v.transporte) return -1;
    if (r.mes === 'tanto') s += 1; else if (mesDe(v) === r.mes) s += 3; else s -= 2;
    return s;
  }
  function desenhaQuiz(foca) {
    var el = $('#quiz'), total = Q.length;
    if (passo < total) {
      var q = Q[passo];
      el.innerHTML = '<div class="quiz__barra" aria-hidden="true"><i style="width:' + Math.round(passo / total * 100) + '%"></i></div>' +
        '<p class="quiz__n">' + f('Pergunta {n} de {t}', { n: passo + 1, t: total }) + '</p>' +
        '<h3 class="quiz__p" tabindex="-1">' + esc(q.p) + '</h3><p class="quiz__dica">' + esc(q.d) + '</p>' +
        '<div class="quiz__ops">' + q.ops.map(function (o, i) {
          return '<button type="button" class="op" data-op="' + esc(o.v) + '" aria-pressed="' + (resp[q.k] === o.v) + '"><span class="op__l" aria-hidden="true">' + 'ABCDEFGH'.charAt(i) + '</span><span><b>' + esc(o.t) + '</b>' + (o.s ? '<small>' + esc(o.s) + '</small>' : '') + '</span></button>';
        }).join('') + '</div>' +
        '<div class="quiz__pe">' + (passo ? '<button type="button" class="quiz__volta" data-volta>' + t('Voltar') + '</button>' : '<span></span>') + '<span class="quiz__dica" style="margin:0">' + t('Sem cadastro') + '</span></div>';
    } else {
      var achou = FUTURAS.map(function (v) { return { v: v, s: pontua(v, resp) }; }).filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s || (a.v.inicio < b.v.inicio ? -1 : 1); }).slice(0, 3).map(function (x) { return x.v; });
      var m = t('Olá, Cirene! Fiz o "Para onde eu vou?" no site:') + '\n*' + t('Quero') + ':* ' + rotulo('tipo', resp.tipo) + '\n*' + t('Transporte') + ':* ' + rotulo('tr', resp.tr) +
        '\n*' + t('Quando') + ':* ' + rotulo('mes', resp.mes) + '\n*' + t('Pessoas') + ':* ' + rotulo('n', resp.n);
      if (achou.length) m += '\n*' + t('Viagens que o site indicou') + ':* ' + achou.map(function (v) { return v.titulo + ' (' + periodoMsg(v) + ')'; }).join('; ') + '\n' + t('Qual você indica?');
      else m += '\n' + t('Não achei na agenda. Vocês têm algo assim?');
      el.innerHTML = '<div class="quiz__barra" aria-hidden="true"><i style="width:100%"></i></div>' +
        '<p class="quiz__n">' + t('Pronto') + '</p><h3 class="quiz__p" tabindex="-1">' + (achou.length ? (achou.length === 1 ? t('Esta viagem combina com você') : t('Estas viagens combinam com você')) : t('Nenhuma viagem da agenda bate com tudo')) + '</h3>' +
        '<p class="quiz__dica">' + (achou.length ? t('Toque para ver o que inclui, ou mande tudo para a Cirene.') : t('Mande o que você procura para a Cirene e pergunte pelas próximas datas.')) + '</p>' +
        (achou.length ? '<div class="res__lista">' + achou.map(function (v) {
          var o = preco(v);
          return '<div class="res"><img src="assets/img/' + v.foto + '-480.webp" width="480" height="320" alt="" loading="lazy">' +
            '<span><b>' + esc(v.titulo) + '</b><small>' + periodoCurto(v) + ' · ' + (o.tem ? esc(o.curto) : t('valor no WhatsApp')) + '</small></span>' +
            '<button type="button" class="btn btn--linha" data-abre="' + v.id + '">' + t('Ver viagem') + '</button></div>';
        }).join('') + '</div>' : '') +
        '<div class="res__btns"><a class="btn btn--zap btn--g" href="' + esc(zap(m)) + '" target="_blank" rel="noopener">' + svg('i-zap') + t('Mandar para a Cirene') + '</a>' +
        '<button type="button" class="btn btn--linha" data-refaz>' + t('Refazer') + '</button></div>';
      semLazy();
    }
    if (foca) { var h = $('.quiz__p', el); if (h) h.focus({ preventScroll: true }); }
  }

  // ---------- avaliações (texto original, em português) ----------
  function montaAvaliacoes(d) {
    $('#assuntos').innerHTML = '<span>' + t('O que mais aparece') + '</span><ul style="display:contents">' + d.assuntos.map(function (a) {
      return '<li>' + esc(t(a.nome)) + ' <b>' + a.n + '</b></li>';
    }).join('') + '</ul>';
    $('#avals').innerHTML = d.avaliacoes.map(function (a, i) {
      var est = ''; for (var k = 1; k <= 5; k++) est += '<svg' + (k > a.estrelas ? ' class="apagada"' : '') + '><use href="#i-estrela"/></svg>';
      return '<article class="aval"><span class="aval__est" role="img" aria-label="' + f('{n} de 5 estrelas', { n: a.estrelas }) + '">' + est + '</span>' +
        '<p id="aval-' + i + '" lang="pt-BR">' + esc(a.curto || a.texto) + '</p>' +
        (a.curto ? '<button type="button" class="aval__mais" data-aval="' + i + '" aria-expanded="false" aria-controls="aval-' + i + '">' + t('Ler tudo') + '</button>' : '') +
        '<footer><span class="aval__ini" aria-hidden="true">' + esc(a.nome.charAt(0)) + '</span><span><b>' + esc(a.nome) + '</b><small>' + t('Avaliação no Google') + '</small></span></footer></article>';
    }).join('');
    $('#avals').addEventListener('click', function (e) {
      var b = e.target.closest('[data-aval]'); if (!b) return;
      var a = d.avaliacoes[+b.dataset.aval], p = $('#aval-' + b.dataset.aval), aberto = b.getAttribute('aria-expanded') === 'true';
      p.textContent = aberto ? a.curto : a.texto;
      b.setAttribute('aria-expanded', !aberto); b.textContent = aberto ? t('Ler tudo') : t('Ler menos');
    });
    if (ES) $('#avals').insertAdjacentHTML('beforebegin', '<p class="avals__orig">' + t('As avaliações estão no original, em português.') + '</p>');
    rv('.aval');
  }

  // ---------- dúvidas ----------
  function montaDuvidas(d) {
    $('#faq').innerHTML = d.duvidas.map(function (q) {
      return '<details id="duvida-' + esc(q.id) + '"><summary>' + esc(q.p) + '</summary><div>' + txt(q.r) + '</div></details>';
    }).join('');
  }
  }
})();
