// Cabral & Miranda: prévia. Contato em js/config.js; equipe, áreas, triagem, documentos e
// dúvidas em data/*.json (mudou um JSON, suba o V abaixo).
(function () {
  'use strict';

  var V = '1';
  var CM = window.CM || {};
  var raiz = document.documentElement;
  var still = /[?&]still=1\b/.test(location.search);
  var calmo = still || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  raiz.classList.add('js');
  if (still) raiz.classList.add('still');

  // ---------- utilidades ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ph(s) { return '<span class="ph">' + esc(s) + '</span>'; }
  // Texto com [colchete] vira placeholder amarelo. 'html' true deixa passar os links do próprio JSON.
  function txt(s, html) { return (html ? String(s) : esc(s)).replace(/\[([^\]]+)\]/g, function (m) { return '<span class="ph">' + m + '</span>'; }); }
  function zap(msg, numero) { return 'https://wa.me/' + (numero || CM.whatsappEscritorio) + '?text=' + encodeURIComponent(msg); }
  function foneTxt(n) { var d = String(n).replace(/^55/, ''); return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7); }
  function abreFora(a) { a.target = '_blank'; a.rel = 'noopener'; }
  function evento(nome, dados) {
    // Só no site oficial (CM.rastrear = true). Na prévia não sai nada.
    if (CM.rastrear && typeof window.gtag === 'function') window.gtag('event', nome, dados || {});
  }
  var OLA = 'Olá! Vim pelo site do Cabral & Miranda.';
  function olaPara(p) { return p ? 'Olá, ' + p.curto + '! Vim pelo site do Cabral & Miranda.' : OLA; }
  var FECHO = 'Gostaria de conversar sobre o meu caso.';

  // Ícones de linha fina (viewBox 24)
  var ICO = {
    casa: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/>',
    familia: '<circle cx="8" cy="6.5" r="2.4"/><circle cx="16" cy="6.5" r="2.4"/><circle cx="12" cy="13" r="1.8"/><path d="M3.8 20v-4.5A4.2 4.2 0 0 1 8 11.3c1 0 1.9.3 2.6.9M20.2 20v-4.5a4.2 4.2 0 0 0-4.2-4.2c-1 0-1.9.3-2.6.9M9 20v-1.7a3 3 0 0 1 6 0V20"/>',
    recibo: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    escudo: '<path d="M12 3 5 6v5.5c0 4.3 2.9 7.9 7 9.5 4.1-1.6 7-5.2 7-9.5V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    contrato: '<path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v4h4M9 12h6M9 15.5h4"/><path d="M8.5 19c1-1.2 1.8-1.2 2.4 0 .6 1 1.3 1 2.1-.2"/>',
    maleta: '<rect x="3" y="7.5" width="18" height="12" rx="1"/><path d="M9 7.5V5h6v2.5M3 12.5h18M10.5 12.5v2h3v-2"/>',
    colunas: '<path d="M3 9.5 12 4l9 5.5H3Z"/><path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8M3.5 20.5h17"/>',
    duvida: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.6M12 16.8h.01"/>',
    bussola: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>'
  };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[n] || ICO.duvida) + '</svg>'; }
  var ZAP_SVG = '<svg aria-hidden="true"><use href="#i-zap"/></svg>';
  var TIQUE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  function ini(p, grande) { return '<span class="ini' + (grande ? ' ini--g' : '') + '" aria-hidden="true"><span>' + esc(p.iniciais) + '</span></span>'; }

  // ---------- links fixos (antes de os dados chegarem já funcionam) ----------
  var FIXAS = {
    escritorio: OLA + '\n' + FECHO,
    duvida: OLA + '\nTenho uma dúvida antes de agendar:'
  };
  document.querySelectorAll('[data-zap]').forEach(function (a) {
    a.href = zap(FIXAS[a.dataset.zap] || FIXAS.escritorio); abreFora(a);
  });
  document.querySelectorAll('[data-zap-pessoa]').forEach(abreFora);

  // ---------- contato (config.js) ----------
  var dEnd = document.getElementById('d-endereco');
  if (dEnd) dEnd.innerHTML = esc(CM.endereco) + '<br>' + esc(CM.bairroCidade) + (CM.cep ? '<br>CEP ' + esc(CM.cep) : '');
  var dHor = document.getElementById('d-horario');
  if (dHor) dHor.innerHTML = CM.horario ? esc(CM.horario) : ph('[HORÁRIO]');
  var rEmail = document.getElementById('r-email');
  if (rEmail && CM.email) rEmail.innerHTML = '<a href="mailto:' + esc(CM.email) + '">' + esc(CM.email) + '</a>';
  var mapsBtn = document.getElementById('maps-btn'); if (mapsBtn && CM.mapsUrl) mapsBtn.href = CM.mapsUrl;
  var passo2 = document.getElementById('passo-2');
  if (passo2 && CM.atendimentoOnline === true) passo2.textContent = 'No escritório, em Espera Feliz, ou on-line, como preferir.';
  if (passo2 && CM.atendimentoOnline === false) passo2.textContent = 'No escritório, no Centro de Espera Feliz, no horário que combinar com você.';
  var ano = document.getElementById('ano'); if (ano) ano.textContent = new Date().getFullYear();

  // ---------- menu ----------
  var menuBtn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  function fechaMenu() { menu.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menu'); }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var abre = !menu.classList.contains('aberto');
      menu.classList.toggle('aberto', abre);
      menuBtn.setAttribute('aria-expanded', String(abre));
      menuBtn.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) fechaMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechaMenu(); });
  }
  // Menu acende a seção à vista
  if ('IntersectionObserver' in window) {
    var links = {};
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var DONO = { areas: 'areas', comecar: 'comecar', 'quem-somos': 'quem-somos', documentos: 'quem-somos', atendimento: 'atendimento', duvidas: 'atendimento', contato: 'contato' };
    var ioMenu = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        var dono = DONO[e.target.id]; if (dono && links[dono]) links[dono].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(DONO).forEach(function (id) { var s = document.getElementById(id); if (s) ioMenu.observe(s); });
  }

  // ---------- WhatsApp flutuante depois da primeira tela ----------
  var flutua = document.querySelector('.zap-flutua'), hero = document.getElementById('inicio');
  if (flutua && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { flutua.classList.toggle('ver', !es[0].isIntersecting); }).observe(hero);
  }

  // ---------- mapa só no clique ----------
  var mapaBtn = document.getElementById('mapa-btn');
  if (mapaBtn) mapaBtn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = CM.mapaEmbed; f.title = 'Mapa: Rua Ernesto Grillo, 54, Centro, Espera Feliz'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementById('mapa').innerHTML = ''; document.getElementById('mapa').appendChild(f);
  });

  // ---------- dados ----------
  function pega(nome) {
    return fetch('data/' + nome + '.json?v=' + V).then(function (r) { if (!r.ok) throw new Error(nome); return r.json(); });
  }
  Promise.all([pega('equipe'), pega('areas'), pega('triagem'), pega('documentos'), pega('faq')])
    .then(function (d) { monta(d[0].pessoas, d[1].itens, d[2].perguntas, d[3], d[4].itens); })
    .catch(function (e) {
      console.error('Não consegui carregar os dados da página:', e);
      var aviso = '<p class="carregando">Não consegui carregar esta parte. <a href="' + zap(FIXAS.escritorio) + '">Fale direto com o escritório no WhatsApp</a>.</p>';
      ['areas-grid', 'triagem', 'checklist'].forEach(function (id) { var el = document.getElementById(id); if (el) el.innerHTML = aviso; });
    });

  function monta(EQUIPE, AREAS, PERGUNTAS, DOCS, FAQ) {
    var pessoa = {}; EQUIPE.forEach(function (p) { pessoa[p.id] = p; });
    var area = {}; AREAS.forEach(function (a) { area[a.id] = a; });
    var porNumero = {}; EQUIPE.forEach(function (p) { porNumero[p.whatsapp] = p; });
    MZ.porNumero = porNumero;
    MZ.porCurto = {}; EQUIPE.forEach(function (p) { MZ.porCurto[p.curto] = p; });
    function oabTxt(p) { return 'OAB/MG ' + (p.oab ? esc(p.oab) : ph('[nº]')); }

    // Nomes com OAB (hero e rodapé) e botões por advogada
    EQUIPE.forEach(function (p) {
      document.querySelectorAll('[data-nome="' + p.id + '"] .ph, [data-nome-rodape="' + p.id + '"] .ph').forEach(function (s) {
        if (p.oab) s.outerHTML = esc(p.oab);
      });
      document.querySelectorAll('[data-zap-pessoa="' + p.id + '"]').forEach(function (a) {
        a.href = zap(olaPara(p) + '\n' + FECHO, p.whatsapp);
      });
    });

    // Atalhos
    var atalhos = document.getElementById('atalhos');
    atalhos.innerHTML = AREAS.map(function (a) { return '<a class="chip" href="#area-' + a.id + '">' + esc(a.nome) + '</a>'; }).join('');
    atalhos.addEventListener('click', function (e) {
      var c = e.target.closest('a'); if (!c) return;
      var alvo = document.querySelector(c.getAttribute('href')); if (!alvo) return;
      alvo.classList.remove('destaque'); void alvo.offsetWidth; alvo.classList.add('destaque');
    });

    // Cards das áreas + card-guia para quem não sabe
    var grid = document.getElementById('areas-grid');
    grid.innerHTML = AREAS.map(function (a) {
      var p = pessoa[a.advogada];
      var msg = olaPara(p) + '\n*Assunto:* ' + a.nome + '\n' + FECHO;
      return '<article class="area rev" id="area-' + a.id + '">' + ico(a.icone) +
        '<h3>' + esc(a.nome) + '</h3>' +
        '<p class="area__resumo">' + esc(a.resumo) + '</p>' +
        '<ul>' + a.situacoes.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        (a.revisarSituacoes ? '<span class="revisar">[REVISAR COM AS ADVOGADAS]</span>' : '') +
        '<p class="area__com">' + ini(p) + '<span>Com a <b>' + esc(p.curto) + '</b></span></p>' +
        '<a class="area__btn" href="' + zap(msg, p.whatsapp) + '" target="_blank" rel="noopener" data-area="' + a.id + '">Conversar sobre isso <span aria-hidden="true">→</span></a>' +
        '</article>';
    }).join('') +
      '<article class="area area--guia rev">' + ico('bussola') +
      '<h3>Não achou a sua situação?</h3>' +
      '<p>Responda três perguntas e veja com qual das advogadas falar. A mensagem já sai organizada.</p>' +
      '<a class="area__btn" href="#comecar">Fazer a triagem <span aria-hidden="true">→</span></a></article>';

    // Advogadas (Quem somos)
    var adv = document.getElementById('advogadas');
    adv.innerHTML = EQUIPE.map(function (p) {
      var foto = p.foto ? '<img src="' + esc(p.foto) + '" width="116" height="140" loading="lazy" alt="' + esc(p.nome) + '">'
        : ini(p, true);
      return '<article class="adv rev">' +
        '<div class="adv__foto">' + foto + '</div>' +
        '<div><h3>' + esc(p.nome) + '</h3>' +
        '<p class="adv__oab">' + oabTxt(p) + '</p>' +
        '<ul class="adv__areas">' + p.areas.map(function (id) { return '<li>' + esc(area[id] ? area[id].nome : id) + '</li>'; }).join('') + '</ul>' +
        '<p class="adv__form">' + (p.formacao ? esc(p.formacao) : ph('[FORMAÇÃO, PÓS-GRADUAÇÕES E TEMPO DE ADVOCACIA]')) + '</p>' +
        (p.foto ? '' : '<p class="adv__zap">' + ph('[FOTO INDIVIDUAL]') + '</p>') +
        '<a class="btn btn--verde" href="' + zap(olaPara(p) + '\n' + FECHO, p.whatsapp) + '" target="_blank" rel="noopener">' + ZAP_SVG + 'Falar com a ' + esc(p.curto) + '</a>' +
        (p.whatsappConfirmado ? '' : '<p class="adv__zap">WhatsApp ' + foneTxt(p.whatsapp) + ' ' + ph('[CONFIRMAR SE O NÚMERO É DELA]') + '</p>') +
        '</div></article>';
    }).join('');

    montaTriagem(PERGUNTAS, pessoa, area);
    montaChecklist(DOCS, AREAS, pessoa);

    // Dúvidas
    var faq = document.getElementById('faq');
    faq.innerHTML = FAQ.map(function (f) {
      return '<details id="' + esc(f.id) + '"><summary>' + esc(f.pergunta) + '</summary><div class="faq__r">' + txt(f.resposta, true) + '</div></details>';
    }).join('');
    if (location.hash) { var d = document.getElementById(location.hash.slice(1)); if (d && d.tagName === 'DETAILS') d.open = true; }

    revela();
  }

  // ---------- triagem "Por onde começar" ----------
  function montaTriagem(PERGUNTAS, pessoa, area) {
    var box = document.getElementById('triagem');
    var resp = [], passo = 0;
    var perguntas = PERGUNTAS.map(function (q) {
      var c = JSON.parse(JSON.stringify(q));
      c.opcoes = c.opcoes.filter(function (o) { return !(o.online && CM.atendimentoOnline === false); });
      return c;
    });

    function garanteVisivel() {
      var r = box.getBoundingClientRect();
      if (r.top < 70 || r.top > innerHeight * .6) box.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' });
    }

    function desenha() {
      if (passo >= perguntas.length) return resultado();
      var q = perguntas[passo];
      var pct = Math.round(passo / perguntas.length * 100);
      box.innerHTML =
        '<div class="tg__topo"><span>Pergunta ' + (passo + 1) + ' de ' + perguntas.length + '</span>' +
        (passo > 0 ? '<button type="button" class="tg__voltar" data-voltar>← Voltar</button>' : '') + '</div>' +
        '<div class="tg__barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progresso da triagem"><i style="width:' + pct + '%"></i></div>' +
        '<h3 class="tg__titulo" tabindex="-1">' + esc(q.titulo) + '</h3>' +
        '<p class="tg__explica">' + esc(q.explica) + '</p>' +
        '<div class="tg__opcoes">' + q.opcoes.map(function (o, i) {
          var marca = o.icone ? ico(o.icone) : '<span class="letra" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span>';
          var conf = (o.online && CM.atendimentoOnline == null) ? ph('[CONFIRMAR]') : '';
          return '<button type="button" class="tg__op" data-i="' + i + '">' + marca + '<span>' + esc(o.texto) + conf + '</span></button>';
        }).join('') + '</div>';
    }

    function resultado() {
      var a = resp[0].area ? area[resp[0].area] : null;
      var p = a ? pessoa[a.advogada] : null;
      var urgente = !!resp[1].urgente;
      var assunto = a ? a.nome : 'Não sei qual área';
      var msg = (p ? 'Olá, ' + p.curto + '! ' : 'Olá! ') + 'Fiz a triagem no site do Cabral & Miranda.' +
        (urgente ? '\n*É urgente.*' : '') +
        '\n*Assunto:* ' + assunto +
        '\n*Situação:* ' + resp[0].texto +
        '\n*Quando:* ' + resp[1].texto +
        '\n*Prefiro conversar:* ' + resp[2].texto +
        '\nGostaria de agendar uma conversa.';
      var numero = p ? p.whatsapp : CM.whatsappEscritorio;
      var quem = p ? (p.foto ? '<img src="' + esc(p.foto) + '" alt="">' : ini(p, true))
        : '<svg style="width:84px;height:74px;color:var(--ouro)" aria-hidden="true"><use href="#cm-marca"/></svg>';
      var rotuloBtn = p ? (urgente ? 'Falar agora com a ' + p.curto : 'Enviar para a ' + p.curto + ' no WhatsApp')
        : (urgente ? 'Falar agora com o escritório' : 'Enviar para o escritório no WhatsApp');
      var frase = a ? a.orientacao : 'As duas advogadas leem a sua mensagem e quem cuida do assunto responde.';

      box.innerHTML =
        '<div class="tg__topo"><span>Pronto</span><button type="button" class="tg__voltar" data-voltar>← Voltar</button></div>' +
        '<div class="tg__barra"><i style="width:100%"></i></div>' +
        '<div class="tg__res"><div class="tg__quem">' + quem + '</div><div>' +
        '<span class="tg__area">' + esc(assunto) + '</span>' +
        '<h3 tabindex="-1">' + (p ? 'Fale com a ' + esc(p.nome) : 'Fale com o escritório') + '</h3>' +
        (p ? '<p class="tg__oab">OAB/MG ' + (p.oab ? esc(p.oab) : ph('[nº]')) + '</p>' : '<p class="tg__oab">Dra. Lorraine e Dra. Alda</p>') +
        '<p class="tg__frase">' + esc(frase) + (a && a.revisar ? ' ' + ph('[REVISAR]') : '') + '</p>' +
        (urgente ? '<p class="tg__urgente">Em casos urgentes, chame no WhatsApp e informe que é urgente.</p>' : '') +
        '<ul class="tg__resumo"><li><b>Situação:</b> ' + esc(resp[0].texto) + '</li><li><b>Quando:</b> ' + esc(resp[1].texto) + '</li><li><b>Prefere:</b> ' + esc(resp[2].texto) + '</li></ul>' +
        '<div class="tg__acoes"><a class="btn btn--ouro" href="' + zap(msg, numero) + '" target="_blank" rel="noopener" data-triagem>' + ZAP_SVG + esc(rotuloBtn) + '</a>' +
        '<button type="button" class="tg__refazer" data-refazer>Refazer</button></div>' +
        '</div></div>' +
        '<p class="tg__aviso">Esta triagem só organiza o contato. A orientação jurídica é feita pela advogada.</p>';
      evento('triagem_concluida', { area: assunto, urgente: urgente });
    }

    box.addEventListener('click', function (e) {
      var op = e.target.closest('.tg__op');
      if (op) { resp[passo] = perguntas[passo].opcoes[+op.dataset.i]; passo++; desenha(); foca(); return; }
      if (e.target.closest('[data-voltar]')) { passo = Math.max(0, passo - 1); resp.length = passo; desenha(); foca(); return; }
      if (e.target.closest('[data-refazer]')) { passo = 0; resp = []; desenha(); foca(); }
    });
    function foca() { var t = box.querySelector('[tabindex="-1"]'); if (t) t.focus({ preventScroll: true }); garanteVisivel(); }
    desenha();
  }

  // ---------- checklist "O que levar na primeira conversa" ----------
  function montaChecklist(DOCS, AREAS, pessoa) {
    var box = document.getElementById('checklist');
    var atual = AREAS[0].id, marcados = {};
    var areasCom = AREAS.filter(function (a) { return DOCS.listas[a.id]; });

    function desenha() {
      var a = areasCom.filter(function (x) { return x.id === atual; })[0];
      var lista = DOCS.listas[atual];
      var m = marcados[atual] || (marcados[atual] = {});
      var feitos = lista.filter(function (_, i) { return m[i]; }).length;
      var p = pessoa[a.advogada];

      var paraMim = 'Lista do site do Cabral & Miranda\n*O que levar na primeira conversa: ' + a.nome + '*\n' +
        lista.map(function (d, i) { return (m[i] ? '✅ ' : '⬜ ') + d; }).join('\n') +
        '\n\nNão tem algum documento? Leve o que tiver.';
      var agendar = olaPara(p) + '\n*Assunto:* ' + a.nome + '\nJá separei os documentos da lista do site. Gostaria de agendar uma conversa.';

      box.innerHTML =
        '<div class="ck__chips" role="group" aria-label="Assunto">' + areasCom.map(function (x) {
          return '<button type="button" class="chip" data-area="' + x.id + '" aria-pressed="' + (x.id === atual) + '">' + esc(x.nome) + '</button>';
        }).join('') + '</div>' +
        '<h3 class="ck__titulo">' + esc(a.nome) + '</h3>' +
        '<p class="ck__sub">Com a ' + esc(p.curto) + '. Marque o que você já separou.' + (DOCS.revisado ? '' : ' ' + ph('[REVISAR COM AS ADVOGADAS]')) + '</p>' +
        '<ul class="ck__lista">' + lista.map(function (d, i) {
          return '<li><label class="ck__item"><input type="checkbox" data-i="' + i + '"' + (m[i] ? ' checked' : '') + '><span class="ck__caixa">' + TIQUE + '</span><span class="ck__txt">' + esc(d) + '</span></label></li>';
        }).join('') + '</ul>' +
        '<p class="ck__conta" aria-live="polite">' + feitos + ' de ' + lista.length + ' separados</p>' +
        '<div class="ck__acoes">' +
        '<a class="btn btn--claro-linha" href="https://wa.me/?text=' + encodeURIComponent(paraMim) + '" target="_blank" rel="noopener" data-para-mim>' + ZAP_SVG + 'Enviar esta lista para o meu WhatsApp</a>' +
        '<a class="btn btn--verde" href="' + zap(agendar, p.whatsapp) + '" target="_blank" rel="noopener">Já tenho os documentos, quero agendar</a>' +
        '</div>' +
        '<p class="ck__nota">Não tem algum documento? Tudo bem. Traga o que tiver: a gente orienta como conseguir o resto.</p>';
    }

    box.addEventListener('click', function (e) {
      var c = e.target.closest('.chip[data-area]');
      if (c) { atual = c.dataset.area; desenha(); var f = box.querySelector('.chip[aria-pressed="true"]'); if (f) f.focus(); }
    });
    box.addEventListener('change', function (e) {
      if (!e.target.matches('input[type=checkbox]')) return;
      marcados[atual][e.target.dataset.i] = e.target.checked;
      var i = e.target.dataset.i; desenha();
      var volta = box.querySelector('input[data-i="' + i + '"]'); if (volta) volta.focus();
    });
    desenha();
  }

  // ---------- entrada suave ----------
  function revela() {
    var els = document.querySelectorAll('.sec__topo, .quem__intro, .citacao, .passos li, .triagem, .checklist, .faq, .contato__in > *');
    els.forEach(function (el) { el.classList.add('rev'); });
    var todos = document.querySelectorAll('.rev');
    if (calmo || !('IntersectionObserver' in window)) { todos.forEach(function (el) { el.classList.add('ok'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    todos.forEach(function (el) { io.observe(el); });
  }

  // ---------- modal de WhatsApp no computador ----------
  // Celular abre o wa.me direto. No computador: (a) me chamem, (b) por e-mail, (c) abrir mesmo assim.
  var MZ = { porNumero: {}, porCurto: {} };
  var celular = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || innerWidth < 1024;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="wa.me/"]');
    if (!a || celular || innerWidth < 1024) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    var m = a.href.match(/wa\.me\/(\d+)\?text=([^#]*)/);
    if (!m) return; // lista para o próprio WhatsApp: passa direto
    e.preventDefault();
    abreModal(m[1], decodeURIComponent(m[2]), a);
  });

  var mz, voltaFoco;
  function abreModal(numero, texto, origem) {
    voltaFoco = origem;
    // Identifica a advogada pelo cumprimento da mensagem, não pelo número: o número do escritório
    // ainda é o mesmo de uma delas.
    var cumpr = (texto.match(/^Olá, (Dra\. [^!]+)!/) || [])[1];
    var p = cumpr ? MZ.porCurto[cumpr] : null;
    var assunto = (texto.match(/\*Assunto:\* ([^\n]+)/) || [])[1] || '';
    var quem = p ? 'a ' + p.curto : 'o escritório';
    var app = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
    var web = 'https://web.whatsapp.com/send?phone=' + numero + '&text=' + encodeURIComponent(texto);

    if (mz) mz.remove();
    mz = document.createElement('div');
    mz.className = 'mz'; mz.setAttribute('role', 'dialog'); mz.setAttribute('aria-modal', 'true'); mz.setAttribute('aria-labelledby', 'mz-t');
    mz.innerHTML =
      '<div class="mz__caixa">' +
      '<button type="button" class="mz__x" data-fecha aria-label="Fechar">×</button>' +
      '<h2 id="mz-t">Como prefere falar com ' + esc(quem) + '?</h2>' +
      '<p class="mz__sub">' + (assunto ? 'Assunto: <b>' + esc(assunto) + '</b>. ' : '') + 'Escolha o que for mais confortável.</p>' +
      '<div class="mz__op aberta" data-op="a"><button type="button" aria-expanded="true"><span class="letra">A</span><span>Prefere que te chamem no WhatsApp?<small>Deixe nome e número; a mensagem vem até você.</small></span></button>' +
      '<div class="mz__corpo"><form novalidate>' +
      '<label for="mz-an">Seu nome</label><input id="mz-an" name="nome" autocomplete="name" required>' +
      '<label for="mz-az">Seu WhatsApp</label><input id="mz-az" name="zap" inputmode="tel" autocomplete="tel" placeholder="(32) 90000-0000" required>' +
      '<input class="mz__oculto" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="btn btn--verde" type="submit">Quero que me chamem</button><div class="mz__res" aria-live="polite"></div></form></div></div>' +
      '<div class="mz__op" data-op="b"><button type="button" aria-expanded="false"><span class="letra">B</span><span>Prefere por e-mail?<small>A resposta do escritório chega no seu e-mail.</small></span></button>' +
      '<div class="mz__corpo"><form novalidate>' +
      '<label for="mz-bn">Seu nome</label><input id="mz-bn" name="nome" autocomplete="name" required>' +
      '<label for="mz-be">Seu e-mail</label><input id="mz-be" name="email" type="email" autocomplete="email" required>' +
      '<label for="mz-bm">Em poucas palavras, o assunto (opcional)</label><textarea id="mz-bm" name="mensagem"></textarea>' +
      '<input class="mz__oculto" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="btn btn--verde" type="submit">Enviar</button><div class="mz__res" aria-live="polite"></div></form></div></div>' +
      '<div class="mz__op" data-op="c"><button type="button" aria-expanded="false"><span class="letra">C</span><span>Abrir no WhatsApp mesmo assim<small>Pelo celular (QR code) ou pelo WhatsApp Web.</small></span></button>' +
      '<div class="mz__corpo"><div class="mz__qr"><div class="mz__qr-img" data-qr>QR</div><div>' +
      '<p>Aponte a câmera do celular para o código: a conversa abre com a mensagem pronta.</p>' +
      '<a class="btn btn--verde" href="' + esc(web) + '" target="_blank" rel="noopener">Abrir o WhatsApp Web</a>' +
      '<a class="btn btn--claro-linha" href="' + esc(app) + '" target="_blank" rel="noopener" data-direto>Abrir o aplicativo</a>' +
      '</div></div></div></div>' +
      '</div>';
    document.body.appendChild(mz);
    document.body.style.overflow = 'hidden';

    mz.addEventListener('click', function (e) {
      if (e.target === mz || e.target.closest('[data-fecha]')) return fechaModal();
      var cab = e.target.closest('.mz__op > button');
      if (cab) {
        mz.querySelectorAll('.mz__op').forEach(function (o) { o.classList.remove('aberta'); o.firstChild.setAttribute('aria-expanded', 'false'); });
        var op = cab.parentNode; op.classList.add('aberta'); cab.setAttribute('aria-expanded', 'true');
        if (op.dataset.op === 'c') desenhaQR(app); else { var i = op.querySelector('input'); if (i) i.focus(); }
      }
    });
    mz.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        var f = [].filter.call(mz.querySelectorAll('button, a, input:not([tabindex="-1"]), textarea'), function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });

    var fA = mz.querySelector('[data-op=a] form'), fB = mz.querySelector('[data-op=b] form');
    mascara(fA.querySelector('[name=zap]'));
    ligaForm(fA, 'Quero que me chamem no WhatsApp', p, function (v) { return v('nome') && v('zap').replace(/\D/g, '').length >= 10; },
      'Recebido. ' + (p ? 'A ' + p.curto : 'O escritório') + ' vai te chamar no WhatsApp.', numero, texto, app);
    ligaForm(fB, 'Prefiro resposta por e-mail', p, function (v) { return v('nome') && /\S+@\S+\.\S+/.test(v('email')); },
      'Recebido. A resposta chega no seu e-mail.', numero, texto, app);
    setTimeout(function () { fA.querySelector('input').focus(); }, 40);
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mz) fechaModal(); });
  function fechaModal() {
    if (!mz) return;
    mz.remove(); mz = null; document.body.style.overflow = '';
    if (voltaFoco) voltaFoco.focus();
  }

  function mascara(inp) {
    inp.addEventListener('input', function () {
      var d = inp.value.replace(/\D/g, '').slice(0, 11), s = d;
      if (d.length > 2) s = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) s = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      inp.value = s;
    });
  }

  function ligaForm(form, tipo, pessoa, valido, okTxt, numero, texto, app) {
    var res = form.querySelector('.mz__res');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      function v(n) { var el = form.querySelector('[name=' + n + ']'); return el ? el.value.trim() : ''; }
      if (form.querySelector('[name=botcheck]').value) return;
      if (!valido(v)) { res.innerHTML = '<p class="mz__msg">Confira os campos: falta o nome ou o contato está incompleto.</p>'; return; }
      if (!CM.web3formsKey) {
        res.innerHTML = '<p class="mz__msg">Prévia: aqui o pedido chegaria no e-mail do escritório. O envio liga quando o escritório tiver o formulário configurado. <a href="' + esc(app) + '" target="_blank" rel="noopener" data-direto>Abrir no WhatsApp</a></p>';
        return;
      }
      var botao = form.querySelector('[type=submit]'); botao.disabled = true; botao.textContent = 'Enviando…';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CM.web3formsKey,
          subject: '🔥 Novo lead – Cabral & Miranda – ' + v('nome'),
          from_name: 'Site Cabral & Miranda',
          tipo: tipo, nome: v('nome'), whatsapp: v('zap') || undefined, email: v('email') || undefined,
          assunto_escrito: v('mensagem') || undefined,
          para: pessoa ? pessoa.nome : 'Escritório',
          mensagem_do_botao: texto, pagina: location.href
        })
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (!j.success) throw new Error(j.message);
        form.innerHTML = '<p class="mz__msg">' + esc(okTxt) + '</p>';
        evento(tipo.indexOf('e-mail') > -1 ? 'lead_email' : 'lead_callback', {});
      }).catch(function () {
        botao.disabled = false; botao.textContent = 'Tentar de novo';
        res.innerHTML = '<p class="mz__msg">Não consegui enviar. <a href="' + esc(app) + '" target="_blank" rel="noopener" data-direto>Abra no WhatsApp</a> com a mensagem pronta.</p>';
      });
    });
  }

  var qrPromessa;
  function desenhaQR(link) {
    var alvo = mz && mz.querySelector('[data-qr]'); if (!alvo || alvo.dataset.feito) return;
    alvo.dataset.feito = '1';
    qrPromessa = qrPromessa || new Promise(function (ok, erro) {
      if (window.qrcode) return ok(window.qrcode);
      var s = document.createElement('script'); s.src = 'js/vendor/qrcode.min.js';
      s.onload = function () { ok(window.qrcode); }; s.onerror = erro; document.head.appendChild(s);
    });
    qrPromessa.then(function (qrcode) {
      var q = qrcode(0, 'M'); q.addData(link); q.make();
      alvo.innerHTML = '<img alt="QR code para abrir a conversa no WhatsApp" src="' + q.createDataURL(6, 0) + '">';
    }).catch(function () { alvo.textContent = 'QR indisponível'; });
  }
  // Links de dentro do modal abrem direto, sem reabrir o modal
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-direto]')) e.stopImmediatePropagation();
  }, true);
})();
