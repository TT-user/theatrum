/* CXF Café Especial: loja com sacola e pedido mastigado no WhatsApp (padrão Theatrum, loja nível 1).
   Catálogo em data/produtos.json, dúvidas em data/faq.json, contato em js/config.js. */
(function () {
  'use strict';
  var C = window.CXF || {};
  var V = '1'; // mudou um JSON, sobe este número
  var STILL = /[?&]still=1/.test(location.search);
  if (STILL) document.documentElement.classList.add('still');

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ph(s) { return '<span class="ph">' + esc(s) + '</span>'; }
  // Texto com [colchetes] vira placeholder amarelo
  function txt(s) { return esc(s).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>'); }
  function reais(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function zap(msg) { return 'https://wa.me/' + (C.whatsapp || '') + '?text=' + encodeURIComponent(msg); }
  function abreZap(msg) { window.open(zap(msg), '_blank', 'noopener'); }

  /* ---------- Configuração no HTML ---------- */
  $$('[data-cfg]').forEach(function (el) {
    var v = C[el.getAttribute('data-cfg')];
    if (v) el.textContent = el.getAttribute('data-cfg') === 'instagram' ? '@' + v : v;
    else el.innerHTML = ph(el.getAttribute('data-ph'));
  });
  if (C.aviso) { var av = $('#aviso'); av.innerHTML = txt(C.aviso); av.hidden = false; }
  $('#rodape-pagamento').textContent = (C.pagamentos || []).join(', ');

  var MSG = {
    topo: 'Olá! Vim do site da CXF e quero saber mais sobre os cafés.',
    rodape: 'Olá! Vim do site da CXF e quero saber mais sobre os cafés.',
    flutuante: 'Olá! Vim do site da CXF e quero saber mais sobre os cafés.',
    duvida: 'Olá! Tenho uma dúvida sobre os cafés da CXF:'
  };
  $$('[data-zap]').forEach(function (a) {
    a.href = zap(MSG[a.getAttribute('data-zap')] || MSG.topo);
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- Primeira tela do computador (padrão 2A) ---------- */
  var hero = $('#inicio');
  function medeAcima() { document.documentElement.style.setProperty('--acima', Math.round(hero.getBoundingClientRect().top + scrollY) + 'px'); }
  medeAcima(); addEventListener('resize', medeAcima); addEventListener('load', medeAcima);

  /* ---------- Menu do celular ---------- */
  var menu = $('#menu'), abreMenu = $('#abre-menu');
  abreMenu.addEventListener('click', function () {
    var ab = menu.classList.toggle('aberto');
    abreMenu.setAttribute('aria-expanded', ab);
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.classList.remove('aberto'); abreMenu.setAttribute('aria-expanded', 'false'); } });

  /* ---------- WhatsApp flutuante depois da primeira tela ---------- */
  var flut = $('.zap-flutua');
  function veFlut() { flut.classList.toggle('ve', scrollY > innerHeight * .8); }
  addEventListener('scroll', veFlut, { passive: true }); veFlut();

  /* ---------- Pacote desenhado (a embalagem da CXF em SVG) ---------- */
  var TORRAS = {
    clara: { nome: 'Torra clara', cor: '#B98A55', n: 1 },
    media: { nome: 'Torra média', cor: '#7A4A26', n: 2 },
    intensa: { nome: 'Torra intensa', cor: '#3B2417', n: 3 }
  };
  var GRAV = 'assets/img/gravura-480.webp';
  function pacoteG(torra, peso) {
    var t = TORRAS[torra] || TORRAS.media, dots = '';
    for (var i = 0; i < 3; i++) dots += '<circle cx="' + (90 + i * 10) + '" cy="171" r="2.6" ' + (i < t.n ? 'fill="#121110"' : 'fill="none" stroke="#121110" stroke-width=".8"') + '/>';
    return '<path d="M24 24h152q6 0 6 8l5 246q0 12-12 12H25q-12 0-12-12l5-246q0-8 6-8Z" fill="url(#g-pacote)"/>' +
      '<path d="M22 12h156v14H22Z" fill="#1d1b19"/><path d="M22 12' + dentes() + 'V12Z" fill="#262321"/>' +
      '<circle cx="100" cy="52" r="6" fill="#0c0b0a" stroke="#2c2926" stroke-width="2"/>' +
      '<rect x="36" y="70" width="128" height="190" fill="#F3F0E8"/><rect x="36" y="70" width="128" height="5" fill="' + t.cor + '"/>' +
      '<rect x="40.5" y="79" width="119" height="176.5" fill="none" stroke="#121110" stroke-width=".7"/>' +
      '<text x="100" y="95" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="7" letter-spacing="2.2" fill="#121110">CAFÉ ESPECIAL</text>' +
      '<path d="M93 100.5h14" stroke="#121110" stroke-width=".7"/>' +
      '<use href="#cxf-simbolo" x="57" y="108" width="31" height="36" color="#121110"/><use href="#cxf-letras" x="90" y="117" width="54" height="21" color="#121110"/>' +
      '<text x="100" y="161" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="7.6" letter-spacing="1.8" fill="#121110">' + t.nome.toUpperCase() + '</text>' + dots +
      '<image href="' + GRAV + '" x="41" y="189" width="118" height="66" preserveAspectRatio="xMidYMax slice"/>' +
      '<text x="100" y="279" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="9" letter-spacing="1.5" fill="#B5AE9F">' + esc(peso || '') + '</text>';
  }
  function dentes() { var d = ''; for (var x = 22; x < 178; x += 6) d += 'L' + (x + 3) + ' 9L' + (x + 6) + ' 12'; return d; }
  function dripG() {
    return '<rect x="22" y="40" width="156" height="244" rx="4" fill="#F3F0E8"/><rect x="22" y="40" width="156" height="72" rx="4" fill="#121110"/><rect x="22" y="100" width="156" height="12" fill="#121110"/>' +
      '<text x="100" y="74" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="15" letter-spacing="2" fill="#F3F0E8">DRIP</text>' +
      '<text x="100" y="92" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="7.5" letter-spacing="3" fill="#B5AE9F">COFFEE</text>' +
      '<use href="#cxf-simbolo" x="55" y="126" width="31" height="36" color="#121110"/><use href="#cxf-letras" x="88" y="135" width="56" height="22" color="#121110"/>' +
      '<text x="100" y="184" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="7.6" letter-spacing="1.8" fill="#121110">10 SACHÊS</text>' +
      '<image href="' + GRAV + '" x="26" y="200" width="148" height="80" preserveAspectRatio="xMidYMax slice"/>' +
      '<rect x="22" y="40" width="156" height="244" rx="4" fill="none" stroke="rgba(0,0,0,.12)"/>';
  }
  // Sombra no chão em degradê (drop-shadow no CSS deixava um retângulo claro sobre a gravura)
  function svgDe(inner, w) { w = w || 200; return '<svg viewBox="0 0 ' + w + ' 306" aria-hidden="true"><ellipse cx="' + w / 2 + '" cy="292" rx="' + (w / 2 - 6) + '" ry="10" fill="url(#g-sombra)"/>' + inner + '</svg>'; }
  function aninha(inner, x, y, s) { return '<svg x="' + x + '" y="' + y + '" width="' + 200 * s + '" height="' + 300 * s + '" viewBox="0 0 200 300" overflow="visible">' + inner + '</svg>'; }
  function trio(a, b, c, pa, pb, pc) {
    return svgDe(aninha(pacoteG(a, pa), 0, 48, .84) + aninha(pacoteG(c, pc), 196, 48, .84) + aninha(pacoteG(b, pb), 88, 0, 1), 364);
  }
  function pacote(p, tam) {
    if (p.torra === 'kit') return trio('clara', 'media', 'intensa', '250 g', '250 g', '250 g');
    if (p.torra === 'kit-media') return trio('media', 'media', 'media', '500 g', '500 g', '500 g');
    if (p.tipo === 'drip') return svgDe(dripG());
    return svgDe(pacoteG(p.torra, tam ? tam.nome : p.tamanhos[0].nome));
  }
  // Degradê do pacote, uma vez só, no sprite do topo
  $('svg[aria-hidden="true"]').insertAdjacentHTML('afterbegin', '<defs><linearGradient id="g-pacote" x1="0" x2="1"><stop offset="0" stop-color="#0d0c0b"/><stop offset=".22" stop-color="#2a2725"/><stop offset=".4" stop-color="#151413"/><stop offset=".85" stop-color="#121110"/><stop offset="1" stop-color="#050505"/></linearGradient><radialGradient id="g-sombra"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>');
  $('#hero-pacotes').innerHTML = trio('clara', 'media', 'intensa', '250 g', '500 g', '1 kg');

  /* ---------- Dados ---------- */
  var P = {}, LISTA = [], MOAGENS = [], MOAG = {};
  function carrega(u) { return fetch(u + '?v=' + V).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }

  function tamanhoDe(p, id) { return p.tamanhos.filter(function (t) { return t.id === id; })[0] || p.tamanhos[0]; }
  function temMoagem(p) { return p.tipo === 'graos-moido' || p.escolheMoagem; }
  function precoTxt(t) { return t.preco == null ? ph('[preço]') : '<b>' + reais(t.preco) + '</b>'; }
  function porUnidade(t) {
    if (t.preco == null) return '';
    if (t.unidades) return reais(t.preco / t.unidades) + ' por sachê';
    return reais(t.preco / t.gramas * 100) + ' a cada 100 g';
  }
  function precoBloco(t) {
    var u = porUnidade(t);
    return precoTxt(t) + (u ? '<small>' + u + '</small>' : '');
  }
  function opcoesMoagem(sel) {
    return MOAGENS.map(function (m) { return '<option value="' + m.id + '"' + (m.id === sel ? ' selected' : '') + '>' + esc(m.nome) + '</option>'; }).join('');
  }
  function seletorTamanho(p, nome, sel) {
    if (p.tamanhos.length < 2) return '<fieldset class="tamanhos"><legend>Tamanho</legend><label><input type="radio" name="' + nome + '" value="' + p.tamanhos[0].id + '" checked><span>' + esc(p.tamanhos[0].nome) + '</span></label></fieldset>';
    return '<fieldset class="tamanhos"><legend>Tamanho</legend>' + p.tamanhos.map(function (t, i) {
      return '<label><input type="radio" name="' + nome + '" value="' + t.id + '"' + ((sel ? t.id === sel : i === (p.tamanhos.length > 2 ? 1 : 0)) ? ' checked' : '') + '><span>' + esc(t.nome) + '</span></label>';
    }).join('') + '</fieldset>';
  }
  function seletorMoagem(p, sel) {
    if (!temMoagem(p)) return '';
    var m = MOAG[sel || 'coador'];
    return '<label class="seletor"><span>Moagem</span><select data-moagem>' + opcoesMoagem(sel || 'coador') + '</select><small data-dica>' + esc(m.dica) + '</small></label>';
  }
  function selos(p) {
    return '<span class="card__selos">' + (p.selo ? '<span class="selo">' + esc(p.selo) + '</span>' : '') + (p.exemplo ? '<span class="selo-exemplo">exemplo</span>' : '') + '</span>';
  }

  /* ---------- Cards ---------- */
  function card(p) {
    return '<article class="card" data-id="' + p.id + '" data-tipo="' + p.tipo + '">' +
      '<button type="button" class="card__foto" data-detalhe="' + p.id + '" aria-label="Ver detalhes do ' + esc(p.nome) + '">' + pacote(p) + selos(p) + '</button>' +
      '<p class="card__cat">' + esc(p.categoria) + '</p>' +
      '<h3 class="card__nome">' + esc(p.nome) + '</h3>' +
      '<p class="card__linha">' + esc(p.linha) + '</p>' +
      '<div class="card__opcoes">' + seletorTamanho(p, 'tam-' + p.id) + seletorMoagem(p) + '</div>' +
      '<p class="card__preco" data-preco></p>' +
      '<div class="card__botoes"><button type="button" class="btn btn--tinta" data-add><svg aria-hidden="true"><use href="#i-sacola"/></svg>Adicionar à sacola</button>' +
      '<button type="button" class="ver-detalhes" data-detalhe="' + p.id + '">Ver detalhes</button></div>' +
      '</article>';
  }
  function escolhaDe(box, p) {
    var r = $('input[type=radio]:checked', box), m = $('[data-moagem]', box);
    return { t: r ? r.value : p.tamanhos[0].id, m: m ? m.value : null };
  }
  function atualizaCard(box) {
    var p = P[box.getAttribute('data-id')], e = escolhaDe(box, p), t = tamanhoDe(p, e.t);
    $('[data-preco]', box).innerHTML = precoBloco(t);
    var pc = $('.card__foto svg', box);
    if (p.tipo === 'graos-moido') pc.outerHTML = pacote(p, t);
    var d = $('[data-dica]', box); if (d && e.m) d.textContent = MOAG[e.m].dica;
  }

  var grade = $('#produtos'), filtroAtual = 'todos';
  function montaCards() {
    grade.innerHTML = LISTA.map(card).join('');
    $$('.card', grade).forEach(atualizaCard);
    aplicaFiltro(filtroAtual);
  }
  grade.addEventListener('change', function (e) { var box = e.target.closest('.card'); if (box) atualizaCard(box); });
  grade.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (b) { var box = b.closest('.card'), p = P[box.getAttribute('data-id')], es = escolhaDe(box, p); adiciona(p.id, es.t, es.m, 1); }
  });

  function aplicaFiltro(f) {
    filtroAtual = f; var n = 0;
    $$('.chip[data-filtro]').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-filtro') === f); });
    $$('.card', grade).forEach(function (c) { var ok = f === 'todos' || c.getAttribute('data-tipo') === f; c.hidden = !ok; if (ok) n++; });
    var vz = $('.vazio', grade);
    if (!n && !vz) grade.insertAdjacentHTML('beforeend', '<div class="vazio"><p>Nada nesse filtro por enquanto.</p><div class="hero__botoes"><button type="button" class="btn btn--tinta" data-filtro="todos">Ver todos os cafés</button><a class="btn btn--linha" href="#escolher">Não sei qual escolher</a></div></div>');
    if (n && vz) vz.remove();
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-filtro]'); if (c) aplicaFiltro(c.getAttribute('data-filtro'));
    var l = e.target.closest('[data-filtro-link]'); if (l) aplicaFiltro(l.getAttribute('data-filtro-link'));
    var d = e.target.closest('[data-detalhe]'); if (d) { e.preventDefault(); abreDetalhe(d.getAttribute('data-detalhe'), true); }
  });

  /* ---------- Guia de moagem ---------- */
  function textura(id) {
    // Partículas em tamanho proporcional à moagem; sorteio fixo para o desenho não mudar a cada visita
    var cfg = { graos: [7, 9], prensa: [24, 3.4], coador: [46, 2.3], moka: [74, 1.7], espresso: [150, 1.05] }[id], s = 7, out = '';
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = 0; i < cfg[0]; i++) {
      var a = rnd() * 6.283, r = Math.sqrt(rnd()) * (30 - cfg[1]), x = 37 + Math.cos(a) * r, y = 37 + Math.sin(a) * r, cor = ['#7A4A26', '#5a361c', '#93613a'][i % 3];
      out += id === 'graos'
        ? '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + Math.round(rnd() * 180) + ')"><ellipse rx="6.2" ry="8.4" fill="' + cor + '"/><path d="M-1 -7c3 4-2 9 1 14" stroke="#2b1a0e" stroke-width="1.3" fill="none"/></g>'
        : '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (cfg[1] * (.75 + rnd() * .5)).toFixed(2) + '" fill="' + cor + '"/>';
    }
    return '<svg viewBox="0 0 74 74" aria-hidden="true">' + out + '</svg>';
  }
  function montaMoagem() {
    var ordem = ['graos', 'prensa', 'coador', 'moka', 'espresso'];
    $('#moagem-lista').innerHTML = ordem.map(function (id) {
      var m = MOAG[id]; return '<li>' + textura(id) + '<p><b>' + esc(m.nome) + '</b><span>' + esc(m.dica.charAt(0).toUpperCase() + m.dica.slice(1)) + '.</span></p></li>';
    }).join('');
  }

  /* ---------- Não sei qual escolher ---------- */
  var PERG = [
    { p: 'Como você faz café em casa?', dica: 'Isso define a moagem.', ops: [
      ['Coador de pano ou de papel', 'coador'], ['Máquina de espresso', 'espresso'], ['Prensa francesa', 'prensa'],
      ['Cafeteira italiana (moka)', 'moka'], ['Tenho moedor, quero em grãos', 'graos'], ['Quero praticidade: sem coador nem máquina', 'drip']] },
    { p: 'Como você gosta do café?', dica: 'Isso define a torra.', ops: [
      ['Suave e aromático, sem açúcar', 'clara'], ['Equilibrado: nem fraco, nem forte', 'media'],
      ['Forte e encorpado, muitas vezes com leite', 'intensa'], ['Ainda não sei: quero provar as três', 'kit']] },
    { p: 'Quanto café passa na sua casa?', dica: 'Isso define o tamanho, para o café acabar ainda fresco.', ops: [
      ['Uma ou duas xícaras por dia', '250'], ['Um bule por dia', '500'], ['A família toda, várias vezes ao dia', '1000']] }
  ];
  var LETRAS = 'ABCDEF', resp = [], qbox = $('#quiz');
  function quizPasso() {
    var i = resp.length;
    if (resp[0] === 'drip' || resp[1] === 'kit' || i === PERG.length) return quizResultado();
    var q = PERG[i];
    qbox.innerHTML = '<p class="quiz__passo"><span>Pergunta ' + (i + 1) + ' de ' + PERG.length + '</span>' + (i ? '<button type="button" class="quiz__voltar" data-volta>Voltar</button>' : '') + '</p>' +
      '<div class="quiz__barra"><i style="width:' + ((i + 1) / PERG.length * 100) + '%"></i></div>' +
      '<h3>' + esc(q.p) + '</h3><p class="quiz__dica">' + esc(q.dica) + '</p>' +
      '<div class="quiz__opcoes">' + q.ops.map(function (o, k) { return '<button type="button" class="quiz__op" data-resp="' + o[1] + '"><b>' + LETRAS[k] + '</b><span>' + esc(o[0]) + '</span></button>'; }).join('') + '</div>';
  }
  var indicado = null;
  function quizResultado() {
    var mo = resp[0], p, t, por;
    if (mo === 'drip') { p = P.drip; t = p.tamanhos[0].id; mo = null; por = 'Você pediu praticidade: o sachê encaixa na xícara e só pede água quente.'; }
    else if (resp[1] === 'kit') { p = P['kit-degustacao']; t = p.tamanhos[0].id; por = 'As três torras lado a lado, na moagem do seu método. Depois você já sabe qual pedir.'; }
    else {
      p = P['torra-' + resp[1]];
      var quer = +resp[2];
      // maior tamanho que não passa do que a casa consome
      t = p.tamanhos.filter(function (x) { return +x.gramas <= quer; }).pop() || p.tamanhos[0];
      t = t.id; por = TORRAS[resp[1]].nome + ' para quem gosta de café ' + { clara: 'suave e aromático', media: 'equilibrado', intensa: 'forte e encorpado' }[resp[1]] + ', no tamanho que acaba ainda fresco na sua casa.';
      if (quer === 1000 && t !== '1000') por += ' A torra clara vem até 500 g: peça dois.';
    }
    if (!p) return;
    indicado = { p: p.id, t: t, m: mo };
    var tm = tamanhoDe(p, t);
    qbox.innerHTML = '<p class="quiz__passo"><span>O seu café</span><button type="button" class="quiz__voltar" data-refaz>Refazer</button></p><div class="quiz__barra"><i style="width:100%"></i></div>' +
      '<div class="quiz__res">' + pacote(p, tm) + '<div><h3>' + esc(p.nome) + '</h3><p>' + esc(por) + '</p><ul>' +
      '<li><b>Tamanho:</b> ' + esc(tm.nome) + '</li>' + (mo ? '<li><b>Moagem:</b> ' + esc(MOAG[mo].nome.toLowerCase()) + '</li>' : '') +
      '<li><b>Preço:</b> ' + (tm.preco == null ? ph('[preço]') : esc(reais(tm.preco))) + '</li></ul></div></div>' +
      '<div class="quiz__acoes"><button type="button" class="btn btn--tinta" data-indicado><svg aria-hidden="true"><use href="#i-sacola"/></svg>Colocar na sacola</button><button type="button" class="btn btn--linha" data-detalhe="' + p.id + '">Ver detalhes</button></div>';
  }
  qbox.addEventListener('click', function (e) {
    var b = e.target.closest('[data-resp]');
    if (b) { resp.push(b.getAttribute('data-resp')); quizPasso(); return; }
    if (e.target.closest('[data-volta]')) { resp.pop(); quizPasso(); return; }
    if (e.target.closest('[data-refaz]')) { resp = []; quizPasso(); return; }
    if (e.target.closest('[data-indicado]') && indicado) adiciona(indicado.p, indicado.t, indicado.m, 1);
  });

  /* ---------- Gavetas ---------- */
  var veu = $('#veu'), gp = $('#gaveta-produto'), gs = $('#gaveta-sacola'), volta = null;
  function abreGaveta(g) {
    [gp, gs].forEach(function (x) { if (x !== g) x.hidden = true; });
    if (g.hidden) volta = document.activeElement;
    g.hidden = false; veu.hidden = false; document.body.style.overflow = 'hidden';
    var f = $('.gaveta__fecha', g); if (f) f.focus({ preventScroll: true });
  }
  function fechaGavetas() {
    gp.hidden = true; gs.hidden = true; veu.hidden = true; document.body.style.overflow = '';
    if (/^#cafe\//.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    if (volta && volta.focus) volta.focus({ preventScroll: true });
  }
  veu.addEventListener('click', fechaGavetas);
  $$('[data-fecha]').forEach(function (b) { b.addEventListener('click', fechaGavetas); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !veu.hidden) fechaGavetas(); });
  $$('[data-abre-sacola]').forEach(function (b) { b.addEventListener('click', function () { montaSacola(); abreGaveta(gs); }); });

  /* ---------- Página do café (gaveta) ---------- */
  var gpc = $('#gaveta-produto-corpo');
  function abreDetalhe(id, empurra) {
    var p = P[id]; if (!p) return;
    if (empurra && location.hash !== '#cafe/' + id) history.pushState(null, '', '#cafe/' + id);
    var outros = LISTA.filter(function (x) { return x.id !== id; }).slice(0, 3);
    gpc.innerHTML = '<div class="gp__foto">' + pacote(p) + selos(p) + '</div><div class="gp__corpo" data-id="' + p.id + '">' +
      '<p class="card__cat">' + esc(p.categoria) + '</p><h2 id="gp-nome">' + esc(p.nome) + '</h2><p class="card__linha">' + esc(p.linha) + '</p>' +
      '<p class="card__preco" data-preco></p>' +
      seletorTamanho(p, 'gp-tam') + seletorMoagem(p) +
      '<div class="gp__compra"><span class="qtd"><button type="button" data-q="-1" aria-label="Menos um">−</button><output data-qtd>1</output><button type="button" data-q="1" aria-label="Mais um">+</button></span>' +
      '<div class="gp__botoes"><button type="button" class="btn btn--tinta" data-gp-add="agora">Comprar agora</button><button type="button" class="btn btn--linha" data-gp-add>Adicionar à sacola</button></div></div>' +
      '<p class="gp__garantia">' + (C.garantia ? esc(C.garantia) : ph('[garantia: o que fazer se chegar avariado]')) + '</p>' +
      '<div class="gp__bloco"><h3>Sobre</h3><p>' + esc(p.sobre) + '</p></div>' +
      '<div class="gp__bloco"><h3>Para quem é</h3><p>' + esc(p.paraQuem) + '</p></div>' +
      (temMoagem(p) ? '<div class="gp__bloco"><h3>Como preparar</h3><p data-preparo></p></div>' : '<div class="gp__bloco"><h3>Como preparar</h3><p>Abra o sachê, encaixe as abas na borda da xícara e derrame a água quente devagar, em três vezes. Tire o sachê e pronto.</p></div>') +
      '<div class="gp__bloco"><h3>Entrega e pagamento</h3><p>' + (C.entrega ? esc(C.entrega) : ph('[regiões, frete e prazo]')) + '</p><p>' + esc((C.pagamentos || []).join(', ')) + ' ' + ph('[confirmar]') + '</p></div>' +
      '<a class="btn btn--linha gp__duvida" target="_blank" rel="noopener" data-gp-duvida><svg aria-hidden="true"><use href="#i-zap"/></svg>Tenho dúvida sobre esse café</a>' +
      '<div class="gp__bloco"><h3>Veja também</h3><p>' + outros.map(function (o) { return '<button type="button" class="ver-detalhes" data-detalhe="' + o.id + '">' + esc(o.nome) + '</button>'; }).join(' · ') + '</p></div>' +
      '</div>';
    atualizaDetalhe();
    abreGaveta(gp); gp.scrollTop = 0;
  }
  function atualizaDetalhe() {
    var box = $('.gp__corpo', gpc); if (!box) return;
    var p = P[box.getAttribute('data-id')], e = escolhaDe(box, p), t = tamanhoDe(p, e.t);
    $('[data-preco]', box).innerHTML = precoBloco(t);
    if (p.tipo === 'graos-moido') $('.gp__foto svg', gpc).outerHTML = pacote(p, t);
    var d = $('[data-dica]', box); if (d && e.m) d.textContent = MOAG[e.m].dica;
    var pr = $('[data-preparo]', box);
    if (pr && e.m) pr.textContent = e.m === 'graos' ? 'Moa só na hora de passar, na textura do seu método. Use cerca de 10 g de café (uma colher de sopa cheia) para cada 100 ml de água entre 90 e 96 °C.' : 'Moído ' + MOAG[e.m].dica.replace(/^textura de /, 'na textura de ') + '. Use cerca de 10 g de café (uma colher de sopa cheia) para cada 100 ml de água entre 90 e 96 °C.';
    $('[data-gp-duvida]', box).href = zap('Olá! Tenho uma dúvida sobre o ' + p.nome + ' (' + t.nome + '):');
  }
  gpc.addEventListener('change', atualizaDetalhe);
  gpc.addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), o = $('[data-qtd]', gpc);
    if (q) { o.textContent = Math.max(1, Math.min(20, +o.textContent + +q.getAttribute('data-q'))); return; }
    var a = e.target.closest('[data-gp-add]');
    if (a) {
      var box = $('.gp__corpo', gpc), p = P[box.getAttribute('data-id')], es = escolhaDe(box, p);
      adiciona(p.id, es.t, es.m, +o.textContent, a.getAttribute('data-gp-add') === 'agora');
    }
  });
  function rota() {
    var m = location.hash.match(/^#cafe\/([\w-]+)/);
    if (m && P[m[1]]) abreDetalhe(m[1], false);
    else if (!gp.hidden) { gp.hidden = true; veu.hidden = true; document.body.style.overflow = ''; }
    var alvo = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (alvo && alvo.tagName === 'DETAILS') alvo.open = true;
  }
  addEventListener('hashchange', rota);

  /* ---------- Sacola ---------- */
  var CHAVE = 'cxf-sacola';
  function lerSacola() { try { var s = JSON.parse(localStorage.getItem(CHAVE)); return Array.isArray(s) ? s : []; } catch (e) { return []; } }
  var memoria = null;
  function sacola() { return memoria || (memoria = lerSacola()); }
  function grava() { try { localStorage.setItem(CHAVE, JSON.stringify(memoria)); } catch (e) { /* sem armazenamento: a sacola vale só durante a visita */ } }
  function limpa() {
    // Só fica o que ainda existe no JSON; o preço vem sempre do JSON, nunca do navegador
    memoria = sacola().filter(function (i) { return P[i.p] && i.q > 0 && P[i.p].tamanhos.some(function (t) { return t.id === i.t; }); });
  }
  function adiciona(id, t, m, q, agora) {
    var p = P[id]; if (!temMoagem(p)) m = null;
    var s = sacola(), it = s.filter(function (i) { return i.p === id && i.t === t && i.m === m; })[0];
    if (it) it.q = Math.min(20, it.q + q); else s.push({ p: id, t: t, m: m, q: q });
    grava(); montaSacola(); pulo();
    abreGaveta(gs);
    if (agora) { var n = $('#sacola-form [name=nome]'); if (n) setTimeout(function () { n.focus(); }, 300); }
  }
  function contas() {
    var n = 0, total = 0, conhecido = true;
    sacola().forEach(function (i) { var t = tamanhoDe(P[i.p], i.t); n += i.q; if (t.preco == null) conhecido = false; else total += t.preco * i.q; });
    return { n: n, total: total, conhecido: conhecido };
  }
  function pulo() { var b = $('#sacola-n'); b.classList.remove('pulo'); void b.offsetWidth; b.classList.add('pulo'); }
  function descreve(i) { var p = P[i.p], t = tamanhoDe(p, i.t); return t.nome + (i.m ? ', ' + MOAG[i.m].nome.toLowerCase() : ''); }
  var lista = $('#sacola-itens'), form = $('#sacola-form');
  function montaSacola() {
    limpa();
    var s = sacola(), c = contas(), b = $('#sacola-n');
    b.textContent = c.n; b.classList.toggle('zero', !c.n);
    $('[data-abre-sacola]').setAttribute('aria-label', 'Abrir a sacola, ' + c.n + (c.n === 1 ? ' item' : ' itens'));
    form.hidden = !s.length;
    if (!s.length) {
      lista.innerHTML = '<div class="sacola__vazia"><p>A sacola está vazia.</p><a class="btn btn--tinta" href="#cafes" data-filtro-link="todos" data-fecha-e>Ver os cafés</a><a class="btn btn--linha" href="#cafes" data-filtro-link="kit" data-fecha-e>Ver os kits</a><a class="btn btn--linha" href="#escolher" data-fecha-e>Não sei qual escolher</a></div>';
      return;
    }
    lista.innerHTML = '<ul class="sacola__lista">' + s.map(function (i, k) {
      var p = P[i.p], t = tamanhoDe(p, i.t);
      return '<li>' + pacote(p, t) + '<span><b>' + esc(p.nome) + '</b><small>' + esc(descreve(i)) + '</small><small>' + (t.preco == null ? ph('[preço]') : esc(reais(t.preco * i.q))) + '</small></span>' +
        '<span class="qtd"><button type="button" data-sq="-1" data-k="' + k + '" aria-label="Menos um">−</button><output>' + i.q + '</output><button type="button" data-sq="1" data-k="' + k + '" aria-label="Mais um">+</button></span></li>';
    }).join('') + '</ul>';
    $('#sacola-total').innerHTML = '<span>Subtotal</span>' + (c.conhecido ? '<b>' + esc(reais(c.total)) + '</b>' : ph('[a CXF confirma os preços]'));
  }
  lista.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sq]');
    if (b) { var it = sacola()[+b.getAttribute('data-k')]; it.q = Math.max(0, Math.min(20, it.q + +b.getAttribute('data-sq'))); grava(); montaSacola(); return; }
    if (e.target.closest('[data-fecha-e]')) fechaGavetas();
  });
  $('#sacola-pagamento').innerHTML = (C.pagamentos || ['Pix']).map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
  var cep = form.elements.cep;
  cep.addEventListener('input', function () { var d = cep.value.replace(/\D/g, '').slice(0, 8); cep.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; });
  form.addEventListener('change', function () { $('#campo-cep').hidden = form.elements.receber.value !== 'entrega'; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, nome = f.nome.value.trim(), entrega = f.receber.value === 'entrega', d = f.cep.value.replace(/\D/g, '');
    if (!nome) { f.nome.focus(); return toast('Escreva o seu nome para a CXF saber de quem é o pedido.'); }
    if (entrega && d.length !== 8) { f.cep.focus(); return toast('Confira o CEP: são 8 números.'); }
    var c = contas();
    var linhas = ['Olá! Quero fazer um pedido pelo site da CXF.', '', '*Nome:* ' + nome, '*Itens:*'];
    sacola().forEach(function (i) { var t = tamanhoDe(P[i.p], i.t); linhas.push('• ' + i.q + 'x ' + P[i.p].nome + ', ' + descreve(i) + (t.preco == null ? '' : ' (' + reais(t.preco * i.q) + ')')); });
    linhas.push('*Subtotal:* ' + (c.conhecido ? reais(c.total) : 'a confirmar'));
    linhas.push('*Receber:* ' + (entrega ? 'entrega no CEP ' + f.cep.value : 'retirada com a CXF'));
    if (entrega) linhas.push('*Frete:* a calcular');
    linhas.push('*Pagamento:* ' + f.pagamento.value + ' (a confirmar)');
    var msg = linhas.join('\n');
    abreZap(msg);
    // Cópia de segurança por e-mail, quando houver chave
    if (C.web3formsKey) {
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: C.web3formsKey, subject: '🔥 Novo pedido – CXF – ' + nome, from_name: 'Site CXF', pagina: location.href, pedido: msg }) }).catch(function () {});
    }
  });

  /* ---------- Para empresas e presentes ---------- */
  var nf = $('#negocio-form');
  nf.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = nf.elements, nome = f.nome.value.trim();
    if (!nome) { f.nome.focus(); return toast('Escreva o seu nome.'); }
    abreZap(['Olá! Vim do site da CXF e quero café para o meu negócio.', '', '*Nome:* ' + nome, '*Empresa:* ' + (f.empresa.value.trim() || 'a informar'),
      '*Procura:* ' + f.procura.value, '*Quantidade:* ' + (f.volume.value.trim() || 'a informar')].join('\n'));
  });

  /* ---------- Aviso curto ---------- */
  var tt;
  function toast(s) { var t = $('#toast'); t.textContent = s; t.classList.add('ve'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('ve'); }, 2800); }

  /* ---------- Carrega ---------- */
  Promise.all([carrega('data/produtos.json'), carrega('data/faq.json')]).then(function (r) {
    MOAGENS = r[0].moagens; MOAGENS.forEach(function (m) { MOAG[m.id] = m; });
    LISTA = r[0].produtos; LISTA.forEach(function (p) { P[p.id] = p; });
    montaCards(); montaMoagem(); quizPasso(); montaSacola();
    $('#faq').innerHTML = r[1].duvidas.map(function (d) { return '<details id="' + d.id + '"><summary>' + esc(d.p) + '</summary><p>' + txt(d.r) + '</p></details>'; }).join('');
    rota();
  }).catch(function () {
    grade.innerHTML = '<div class="vazio"><p>Não consegui carregar os cafés agora. Peça direto no WhatsApp.</p><div class="hero__botoes"><a class="btn btn--tinta" href="' + zap(MSG.topo) + '" target="_blank" rel="noopener">Pedir no WhatsApp</a></div></div>';
  });
})();
