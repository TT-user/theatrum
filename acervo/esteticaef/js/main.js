// Clínica Estética Facial e Corporal: prévia. Contato em js/config.js; tratamentos, equipe,
// triagem, resultados e eventos em data/*.json (mudou um JSON, suba o V abaixo).
(function () {
  'use strict';

  var V = '1';
  var EF = window.EF || {};
  var raiz = document.documentElement;
  var still = /[?&]still=1\b/.test(location.search);
  var calmo = still || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  raiz.classList.add('js');
  if (still) raiz.classList.add('still');

  // ---------- utilidades ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ph(s) { return '<span class="ph">' + esc(s) + '</span>'; }
  function zap(msg, numero) { return 'https://wa.me/' + (numero || EF.whatsapp) + '?text=' + encodeURIComponent(msg); }
  var OLA = 'Olá! Vim pelo site da Clínica Estética 🤍';
  function msgAgendar(procedimento, profissional) {
    return OLA + (procedimento ? '\n*Procedimento:* ' + procedimento : '') +
      (profissional ? '\n*Profissional:* ' + profissional : '') + '\nGostaria de agendar uma avaliação.';
  }
  function abreFora(a) { a.target = '_blank'; a.rel = 'noopener'; }
  function evento(nome, dados) {
    // Só no site oficial (EF.rastrear = true). Na prévia não sai nada.
    if (EF.rastrear && typeof window.gtag === 'function') window.gtag('event', nome, dados || {});
  }

  // Ícones de linha fina (viewBox 24)
  var ICO = {
    rosto: '<path d="M12 3c-3.9 0-6.3 2.9-6.3 7.2 0 4.6 3 9.8 6.3 9.8s6.3-5.2 6.3-9.8C18.3 5.9 15.9 3 12 3Z"/><path d="M9.2 10.6h.01M14.8 10.6h.01M10.3 15.4c1 .6 2.4.6 3.4 0"/>',
    labios: '<path d="M3 12c2.2-2.6 4.6-4.3 6.4-4.3 1 0 1.8.6 2.6.6s1.6-.6 2.6-.6c1.8 0 4.2 1.7 6.4 4.3-2.3 3-5.5 4.6-9 4.6S5.3 15 3 12Z"/><path d="M3 12h18"/>',
    perfil: '<path d="M9 3c4.5 0 7.5 3 7.5 7.2l2 3.3-1.8.6v2.4c0 1.3-1 2.2-2.3 2.2h-1.6V21"/><path d="M9 3C6 3 4.5 6 4.5 9c0 2.6 1.3 4.4 2.5 5.5V21"/>',
    brilho: '<path d="M12 3.5 13.7 10l6.3 2-6.3 2L12 20.5 10.3 14 4 12l6.3-2L12 3.5Z"/><path d="M18.5 3.5v3M17 5h3"/>',
    sobrancelha: '<path d="M3 13c3-4.5 8.5-5.8 13-4.2 2 .7 3.5 1.8 5 3.4"/><path d="M8.5 16.5c1.6-1 4.5-1 6 0"/>',
    floco: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.5 4 12 5.6 14.5 4M9.5 20 12 18.4l2.5 1.6M4.5 10.2l2.6-.2-1.3-2.4M19.5 13.8l-2.6.2 1.3 2.4M4.5 13.8l2.6.2-1.3 2.4M19.5 10.2l-2.6-.2 1.3-2.4"/>',
    linhas: '<path d="M6 4c1.5 3.5 1.5 6.5 0 10M10.5 5c1.3 3.3 1.3 6.2 0 9.5M15 4.5c1.5 3.5 1.5 6.5 0 10M8 16.5c1 1.6 1.2 2.8 1 4.5M13 16.8c.9 1.4 1.1 2.6.9 4.2"/>',
    gota: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"/><path d="M9.3 14.5a2.8 2.8 0 0 0 2.7 2.8"/>',
    silhueta: '<path d="M9 3c-.6 2.6-.2 4.6 1 6.3-2.3 1.6-3.4 4-3 6.7.3 2 1.2 3.7 2.3 5M15 3c.6 2.6.2 4.6-1 6.3 2.3 1.6 3.4 4 3 6.7-.3 2-1.2 3.7-2.3 5"/>',
    video: '<rect x="3" y="7" width="12" height="10" rx="2"/><path d="m15 11 6-3.5v9L15 13"/>',
    duvida: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.6M12 16.8h.01"/>'
  };
  function ico(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[n] || ICO.brilho) + '</svg>'; }

  // ---------- links fixos de WhatsApp no HTML ----------
  var FIXAS = {
    padrao: OLA + '\nGostaria de agendar uma avaliação.',
    online: OLA + '\n*Procedimento:* Consulta online\nMoro em outra cidade e quero começar pela consulta online.',
    duvida: OLA + '\nTenho uma dúvida antes de agendar:'
  };
  document.querySelectorAll('[data-zap]').forEach(function (a) {
    a.href = zap(FIXAS[a.dataset.zap] || FIXAS.padrao); abreFora(a);
  });

  // ---------- contato (config.js) ----------
  var dEnd = document.getElementById('d-endereco');
  if (dEnd) dEnd.innerHTML = esc(EF.endereco) + '<br>' + esc(EF.esquina) + ' · ' + esc(EF.bairroCidade) + '<br>CEP ' + esc(EF.cep);
  var dZap = document.getElementById('d-zap'); if (dZap) dZap.textContent = EF.telefoneTexto;
  var dHor = document.getElementById('d-horario');
  if (dHor) dHor.innerHTML = EF.horario ? esc(EF.horario) : 'Segunda a partir das 9h · ' + ph('[horário completo e se abre aos sábados]');
  var mapsBtn = document.getElementById('maps-btn'); if (mapsBtn && EF.mapsUrl) mapsBtn.href = EF.mapsUrl;

  // ---------- dados ----------
  function pega(nome) {
    return fetch('data/' + nome + '.json?v=' + V).then(function (r) { if (!r.ok) throw new Error(nome); return r.json(); });
  }
  Promise.all([pega('equipe'), pega('tratamentos'), pega('triagem'), pega('resultados'), pega('eventos')])
    .then(function (d) { monta(d[0].pessoas, d[1].itens, d[2].perguntas, d[3].itens, d[4]); })
    .catch(function (e) {
      console.error('Não consegui carregar os dados da página:', e);
      var q = document.getElementById('quiz'); if (q) q.innerHTML = '<p class="quiz__carrega">Não consegui carregar as perguntas. <a href="' + zap(FIXAS.padrao) + '">Fale direto no WhatsApp</a>.</p>';
    });

  function monta(EQUIPE, TRATS, PERGUNTAS, RESULTADOS, EVENTOS) {
    var pessoa = {}; EQUIPE.forEach(function (p) { pessoa[p.id] = p; });
    var trat = {}; TRATS.forEach(function (t) { trat[t.id] = t; });

    function quemTxt(id) { return id === 'ambas' ? EQUIPE.map(function (p) { return p.curto; }).join(' ou ') : (pessoa[id] ? pessoa[id].curto : ''); }
    function quemNum(id) { return pessoa[id] ? pessoa[id].whatsapp : EF.whatsapp; }
    function rostos(id) {
      var lista = id === 'ambas' ? EQUIPE : (pessoa[id] ? [pessoa[id]] : []);
      return '<span class="rostos">' + lista.map(function (p) { return '<img src="assets/img/' + p.rosto + '.webp" width="120" height="120" alt="" loading="lazy">'; }).join('') + '</span>';
    }

    // ----- Tratamentos -----
    var elTrats = document.getElementById('trats');
    var CAT = { facial: 'Facial', corporal: 'Corporal', online: 'Online' };
    elTrats.innerHTML = TRATS.map(function (t) {
      var msg = msgAgendar(t.nome, quemTxt(t.profissional));
      return '<a class="trat' + (t.destaque ? ' trat--destaque' : '') + '" data-cat="' + esc(t.categoria) + '" href="' + zap(msg, quemNum(t.profissional)) + '" target="_blank" rel="noopener">' +
        '<span class="trat__ico">' + ico(t.icone) + '</span>' +
        '<span class="trat__cat">' + (CAT[t.categoria] || '') + '</span>' +
        '<h3>' + esc(t.nome) + '</h3>' +
        '<p>' + (t.revisar ? ph(t.descricao + ' [revisar]') : esc(t.descricao)) + '</p>' +
        '<p class="trat__quem">' + rostos(t.profissional) + 'Com ' + esc(quemTxt(t.profissional)) + '</p>' +
        '<span class="trat__cta">Agendar avaliação →</span></a>';
    }).join('');
    var fTrat = document.getElementById('filtro-trat');
    fTrat.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      fTrat.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var f = b.dataset.f;
      elTrats.querySelectorAll('.trat').forEach(function (c) { c.hidden = !!f && c.dataset.cat !== f; });
    });

    // ----- Equipe -----
    document.getElementById('lista-equipe').innerHTML = EQUIPE.map(function (p) {
      var msg = msgAgendar(null, p.curto);
      return '<article class="pessoa">' +
        '<div class="arco"><img loading="lazy" src="assets/img/' + p.foto + '-480.webp" srcset="assets/img/' + p.foto + '-480.webp 480w, assets/img/' + p.foto + '-' + p.fotoW + '.webp ' + p.fotoW + 'w" sizes="(min-width: 520px) 220px, 230px" width="' + p.fotoW + '" height="' + p.fotoH + '" alt="' + esc(p.nome) + ' na sala dela, na clínica"></div>' +
        '<div><h3 class="pessoa__nome">' + esc(p.nome) + '</h3>' +
        '<p class="pessoa__esp">' + esc(p.especialidade) + '</p>' +
        '<p class="pessoa__reg">' + (p.registro ? esc(p.registro) : ph('[registro profissional]')) + '</p>' +
        '<ul class="pessoa__lista">' + p.principais.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<p class="pessoa__sala">' + esc(p.sala) + '</p>' +
        '<a class="btn btn--cafe" href="' + zap(msg, p.whatsapp) + '" target="_blank" rel="noopener">Agendar com ' + esc(p.curto) + '</a></div>' +
        '<blockquote>' + (p.fraseRevisar ? ph(p.frase + ' [confirmar a frase]') : esc(p.frase)) + '</blockquote>' +
        '</article>';
    }).join('');

    // ----- Por onde começar (triagem) -----
    var elQuiz = document.getElementById('quiz');
    var resp = [];
    function desenha(foco) {
      var i = resp.length, total = PERGUNTAS.length, html;
      if (i < total) {
        var q = PERGUNTAS[i], comIcone = i === 0;
        html = '<div class="quiz__topo"><p class="quiz__passo">Pergunta ' + (i + 1) + ' de ' + total + '</p>' +
          (i ? '<button class="quiz__voltar" data-voltar>← voltar</button>' : '') + '</div>' +
          '<div class="quiz__barra"><i style="width:' + ((i + 1) / (total + 1) * 100) + '%"></i></div>' +
          '<div class="quiz__corpo"><h3>' + esc(q.titulo) + '</h3><div class="quiz__ops' + (comIcone ? '' : ' quiz__ops--lista') + '">' +
          q.opcoes.map(function (o, k) {
            return '<button class="quiz__op" data-k="' + k + '">' + (comIcone ? ico(o.icone) : '') + '<span>' + esc(o.texto) + '</span></button>';
          }).join('') + '</div></div>';
      } else {
        html = resultado();
      }
      elQuiz.innerHTML = html;
      if (foco) { var f = elQuiz.querySelector('.quiz__op, .btn'); if (f) f.focus({ preventScroll: true }); }
    }
    function resultado() {
      var o1 = PERGUNTAS[0].opcoes[resp[0]], o2 = PERGUNTAS[1].opcoes[resp[1]], o3 = PERGUNTAS[2].opcoes[resp[2]];
      var prof = o1.profissional, p = pessoa[prof];
      var nomeQuem = prof === 'ambas' ? EQUIPE.map(function (x) { return x.curto; }).join(' e ') : p.curto;
      var indicacao = o1.sugestao + ' com ' + nomeQuem;
      var msg = 'Olá! Fiz a triagem no site 🤍' +
        '\n*' + PERGUNTAS[0].rotulo + ':* ' + o1.texto +
        '\n*' + PERGUNTAS[1].rotulo + ':* ' + (o2.resposta || o2.texto) +
        '\n*' + PERGUNTAS[2].rotulo + ':* ' + (o3.resposta || o3.texto) +
        '\n*Indicação do site:* ' + indicacao +
        '\nPode me ajudar a agendar?';
      var notas = [o2.nota, o3.nota].filter(Boolean);
      var visual = prof === 'ambas'
        ? '<div>' + rostos('ambas') + '</div>'
        : '<div class="arco"><img src="assets/img/' + p.foto + '-480.webp" width="480" height="' + Math.round(p.fotoH * 480 / p.fotoW) + '" alt="' + esc(p.nome) + '"></div>';
      var botao = prof === 'ambas' ? 'Enviar para a clínica no WhatsApp' : 'Enviar para a ' + p.curto + ' no WhatsApp';
      evento('triagem_concluida', { procedimento: o1.sugestao, profissional: prof, modo: o3.modo });
      return '<div class="quiz__topo"><p class="quiz__passo">Seu ponto de partida</p></div>' +
        '<div class="quiz__barra"><i style="width:100%"></i></div>' +
        '<div class="quiz__corpo"><div class="quiz__res' + (prof === 'ambas' ? ' quiz__res--duas' : '') + '">' + visual +
        '<div><h3>' + (prof === 'ambas' ? 'Grazi e Amanda' : esc(p.nome)) + '</h3>' +
        '<p class="quiz__sug">' + esc(o1.sugestao) + '</p>' +
        '<p class="quiz__frase">' + (o1.revisar ? ph(o1.frase + ' [revisar]') : esc(o1.frase)) + '</p></div></div>' +
        (notas.length ? '<ul class="quiz__notas">' + notas.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="quiz__msg" aria-label="Mensagem que vai para o WhatsApp">' + esc(msg) + '</div>' +
        '<div class="quiz__fim"><a class="btn btn--cafe" href="' + zap(msg, quemNum(prof)) + '" target="_blank" rel="noopener">' + esc(botao) + '</a>' +
        '<button class="quiz__voltar" data-recomecar>↺ Refazer</button></div>' +
        '<p class="comecar__aviso" style="margin-top:18px">A indicação é só um ponto de partida. O plano final é definido na avaliação.</p></div>';
    }
    elQuiz.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-voltar')) resp.pop();
      else if (b.hasAttribute('data-recomecar')) resp = [];
      else if (b.dataset.k != null) resp.push(+b.dataset.k);
      else return;
      desenha(true);
      // No celular, a pergunta nova começa no topo do quadro
      var r = elQuiz.getBoundingClientRect();
      if (r.top < 70 || r.top > innerHeight * .5) elQuiz.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' });
    });
    desenha(false);

    // ----- Resultados (antes e depois) -----
    var elRes = document.getElementById('lista-res');
    var reais = RESULTADOS.filter(function (r) { return r.autorizado === true && r.imagemAntes && r.imagemDepois; });
    var exemplo = !reais.length;
    var itens = exemplo ? RESULTADOS : reais;
    if (exemplo) {
      // Sem foto autorizada ainda: o texto não pode prometer o que a vitrine não mostra
      document.getElementById('res-sub').innerHTML = 'Cada caso começa com avaliação. ' + ph('[aqui entram os antes e depois reais, com autorização de cada cliente]');
      document.getElementById('res-nota').innerHTML = 'Resultados variam de pessoa para pessoa. ' + ph('[confirmar se o conselho profissional delas permite antes e depois no site, e em quais condições]');
    }
    var SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    function lado(r, qual) {
      if (exemplo) return '<div class="cmp__exemplo">' + ph('[FOTO DE ' + qual.toUpperCase() + ' · com autorização da cliente]') + '</div>';
      return '<img loading="lazy" src="assets/resultados/' + esc(qual === 'antes' ? r.imagemAntes : r.imagemDepois) + '" alt="' + esc(r.procedimento) + ', ' + qual + '">';
    }
    elRes.innerHTML = itens.map(function (r, i) {
      var sess = r.sessoes ? r.sessoes + (r.sessoes > 1 ? ' sessões' : ' sessão') : null;
      var legenda = [r.legenda && /\[/.test(r.legenda) ? ph(r.legenda) : esc(r.legenda || ''), sess ? esc(sess) : (exemplo ? ph('[nº de sessões]') : ''), 'com ' + esc(quemTxt(r.profissional))].filter(Boolean).join(' · ');
      return '<figure class="res" data-cat="' + esc(r.categoria) + '" data-f="' + esc(r.filtro) + '">' +
        '<div class="cmp">' +
        '<div class="cmp__lado cmp__lado--antes">' + lado(r, 'antes') + '</div>' +
        '<div class="cmp__lado cmp__lado--depois">' + lado(r, 'depois') + '</div>' +
        '<span class="cmp__tag cmp__tag--antes">Antes</span><span class="cmp__tag cmp__tag--depois">Depois</span>' +
        '<span class="cmp__linha"></span><span class="cmp__puxador">' + SETA + '</span>' +
        '<input type="range" min="0" max="100" value="50" aria-label="Comparar antes e depois: ' + esc(r.procedimento) + '" id="cmp-' + i + '">' +
        '</div><figcaption><b>' + esc(r.procedimento) + '</b>' + legenda + '</figcaption></figure>';
    }).join('');

    // Filtros: Todos, Facial, Corporal e um por procedimento presente
    var fRes = document.getElementById('filtro-res');
    var vistos = {}, porProc = [];
    itens.forEach(function (r) { if (!vistos[r.filtro]) { vistos[r.filtro] = 1; porProc.push(r.filtro); } });
    var chips = [['Todos', '', ''], ['Facial', 'cat', 'facial'], ['Corporal', 'cat', 'corporal']].concat(porProc.map(function (f) {
      var t = trat[f]; return [t ? (t.curto || t.nome) : f, 'f', f];
    }));
    fRes.innerHTML = chips.map(function (c, i) {
      return '<button class="chip" aria-pressed="' + (i === 0) + '" data-tipo="' + c[1] + '" data-v="' + c[2] + '">' + esc(c[0]) + '</button>';
    }).join('');
    var resCta = document.getElementById('res-cta');
    function ctaRes(chip) {
      var tipo = chip ? chip.dataset.tipo : '', v = chip ? chip.dataset.v : '', msg;
      if (tipo === 'f' && trat[v]) msg = OLA + '\n*Procedimento:* ' + trat[v].nome + '\n*Profissional:* ' + quemTxt(trat[v].profissional) + '\nVi os resultados no site e quero avaliar o meu caso.';
      else if (tipo === 'cat') msg = OLA + '\n*Interesse:* tratamento ' + v + '\nVi os resultados no site e quero avaliar o meu caso.';
      else msg = OLA + '\nVi os resultados no site e quero avaliar o meu caso.';
      var num = tipo === 'f' && trat[v] ? quemNum(trat[v].profissional) : EF.whatsapp;
      resCta.href = zap(msg, num); abreFora(resCta);
    }
    ctaRes(null);
    fRes.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      fRes.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var tipo = b.dataset.tipo, v = b.dataset.v;
      elRes.querySelectorAll('.res').forEach(function (fig) {
        fig.hidden = tipo === 'cat' ? fig.dataset.cat !== v : tipo === 'f' ? fig.dataset.f !== v : false;
      });
      ctaRes(b);
    });

    // Comparador: arrasta com mouse ou dedo; teclado pelo range escondido
    elRes.querySelectorAll('.cmp').forEach(function (cmp) {
      var input = cmp.querySelector('input'), arrastando = false;
      function poe(pct) { pct = Math.max(0, Math.min(100, pct)); cmp.style.setProperty('--x', pct + '%'); input.value = Math.round(pct); }
      function pelo(e) { var r = cmp.getBoundingClientRect(); poe((e.clientX - r.left) / r.width * 100); }
      cmp.addEventListener('pointerdown', function (e) { arrastando = true; try { cmp.setPointerCapture(e.pointerId); } catch (_) {} pelo(e); });
      cmp.addEventListener('pointermove', function (e) { if (arrastando) pelo(e); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { cmp.addEventListener(t, function () { arrastando = false; }); });
      input.addEventListener('input', function () { poe(+input.value); });
    });

    // ----- Chá Autoestima -----
    var cha = EVENTOS && EVENTOS.chaAutoestima, elCha = document.getElementById('cha');
    if (cha && cha.ativo) {
      document.getElementById('cha-dados').innerHTML =
        '<li><b>Data</b>' + (cha.data ? esc(cha.data) : ph('[próxima data]')) + '</li>' +
        '<li><b>Local</b>' + (cha.local ? esc(cha.local) : ph('[local]')) + '</li>' +
        '<li><b>Vagas</b>' + (cha.vagas ? esc(cha.vagas) : ph('[vagas]')) + '</li>';
      var bCha = document.getElementById('cha-btn');
      bCha.href = zap('*Chá Autoestima*: quero garantir minha vaga para ' + (cha.data || 'a próxima edição') + '. Meu nome: ___');
      abreFora(bCha);
      elCha.hidden = false;
    } else if (elCha) {
      elCha.remove();
    }
  }

  // ---------- menu ----------
  var menu = document.getElementById('menu'), mb = document.getElementById('menu-btn');
  function fechaMenu() { menu.classList.remove('aberto'); mb.setAttribute('aria-expanded', 'false'); mb.setAttribute('aria-label', 'Abrir menu'); }
  mb.addEventListener('click', function () {
    var abre = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abre); mb.setAttribute('aria-expanded', abre); mb.setAttribute('aria-label', abre ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fechaMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aberto')) { fechaMenu(); mb.focus(); } });

  // Menu acende a seção que está na tela
  var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
  var secoes = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var noAr = {};
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { noAr[e.target.id] = e.isIntersecting; });
      var atual = null;
      secoes.forEach(function (s) { if (noAr[s.id] && !atual) atual = s.id; });
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + atual;
        a.classList.toggle('ativo', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secoes.forEach(function (s) { spy.observe(s); });

    // Letreiro só anda à vista
    var lt = document.getElementById('letreiro');
    if (lt && !still) new IntersectionObserver(function (es) { lt.classList.toggle('rodando', es[0].isIntersecting); }).observe(lt);

    // Entrada suave
    if (!calmo) {
      var alvos = document.querySelectorAll('.cab, .trats, .comecar, .equipe, .resultados, .vantagens, .galeria, .depoimentos, .premio, .online, .faq, .chegar, .final');
      var rev = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visivel'); rev.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      alvos.forEach(function (el) { el.classList.add('revela'); rev.observe(el); });
    }
  }

  // ---------- galeria ----------
  var fotos = Array.prototype.map.call(document.querySelectorAll('#galeria .g img'), function (img) {
    return { src: img.srcset.split(',').pop().trim().split(' ')[0], alt: img.alt };
  });
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lb-img'), atual = 0, origem = null;
  function mostra(i) { atual = (i + fotos.length) % fotos.length; lbImg.src = fotos[atual].src; lbImg.alt = fotos[atual].alt; }
  function fecha() { lb.hidden = true; document.body.style.overflow = ''; if (origem) origem.focus(); }
  document.getElementById('galeria').addEventListener('click', function (e) {
    var b = e.target.closest('.g'); if (!b) return;
    origem = b; mostra(+b.dataset.g); lb.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('lb-x').focus();
  });
  document.getElementById('lb-x').addEventListener('click', fecha);
  document.getElementById('lb-ant').addEventListener('click', function () { mostra(atual - 1); });
  document.getElementById('lb-prox').addEventListener('click', function () { mostra(atual + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecha(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowLeft') mostra(atual - 1);
    if (e.key === 'ArrowRight') mostra(atual + 1);
    if (e.key === 'Tab') {
      var bs = lb.querySelectorAll('button'), pri = bs[0], ult = bs[bs.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    }
  });

  // ---------- mapa só carrega no clique ----------
  document.getElementById('mapa-btn').addEventListener('click', function () {
    document.getElementById('mapa').innerHTML = '<iframe title="Mapa: Clínica Estética Facial e Corporal, Centro de Espera Feliz" src="' + esc(EF.mapaEmbed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
  });
})();
