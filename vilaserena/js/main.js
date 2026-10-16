/* Cabanas Vila Serena: prévia. Cabanas, galeria, dúvidas e a lista de
   espera vêm de data/*.json; o HTML só tem os contêineres e o estado com
   placeholder. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var ZAP = '5532998541677';
  function zap(msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); }

  // Escapa o texto e pinta de amarelo o que estiver entre colchetes.
  function t(s) {
    if (s == null || s === '') return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/\[[^\]]+\]/g, function (m) { return '<span class="ph">' + m + '</span>'; });
  }
  function attr(s) { return String(s == null ? '' : s).replace(/\[|\]/g, '').replace(/"/g, '&quot;'); }
  function temPh(s) { return /\[[^\]]+\]/.test(String(s || '')); }

  function ligaZap(raiz) {
    (raiz || document).querySelectorAll('[data-zap]').forEach(function (a) {
      a.href = zap(a.getAttribute('data-zap'));
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  ligaZap();

  /* ---------- topo ---------- */
  var topo = $('#topo');
  function rolou() { topo.classList.toggle('rolou', window.scrollY > 40); }
  window.addEventListener('scroll', rolou, { passive: true });
  rolou();

  var menu = $('#menu'), menuBtn = $('#menu-btn');
  function fechaMenu() { menu.classList.remove('aberto'); topo.classList.remove('aberto'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    topo.classList.toggle('aberto', aberto);
    menuBtn.setAttribute('aria-expanded', aberto);
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') fechaMenu(); });

  if ('IntersectionObserver' in window) {
    var links = {};
    menu.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) Object.keys(links).forEach(function (k) { links[k].classList.toggle('atual', k === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- vídeo do hero ----------
     Só carrega depois que a página está de pé, nunca para quem pediu menos
     movimento ou está economizando dados, e pausa fora da tela ou com a aba
     escondida. Começa na fileira, que é o pôster, então a troca não aparece. */
  var video = $('.hero-video');
  var poupa = (navigator.connection && navigator.connection.saveData) ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || /[?&]still=1/.test(location.search);
  if (video && !poupa) {
    var visivel = true;
    var toca = function () { if (visivel && !document.hidden) { var q = video.play(); if (q && q.catch) q.catch(function () {}); } else video.pause(); };
    var carrega = function () {
      video.src = matchMedia('(max-width: 700px) and (orientation: portrait)').matches ? video.dataset.srcM : video.dataset.src;
      video.addEventListener('playing', function () { video.classList.add('pronto'); }, { once: true });
      // O selo diz o que está na tela: render ou o lugar da foto. Cada trecho
      // dura 4,6 s com fusão de 1 s (passo de 3,6 s); a troca cai no meio da fusão.
      var ROTULOS = ['Imagem ilustrativa do projeto', 'Serra do Caparaó, perto do Pico da Bandeira',
        'Imagem ilustrativa do projeto', 'Pico da Bandeira ao amanhecer', 'Imagem ilustrativa do projeto',
        'Alto Caparaó, MG', 'Imagem ilustrativa do projeto', 'Pico da Bandeira'];
      var selo = $('.selo-hero'), atual = -1;
      video.addEventListener('timeupdate', function () {
        var i = Math.max(0, Math.floor((video.currentTime - 0.5) / 3.6)) % ROTULOS.length;
        if (i === atual) return;
        atual = i;
        selo.classList.add('trocando');
        setTimeout(function () { selo.textContent = ROTULOS[i]; selo.classList.remove('trocando'); }, 300);
      });
      toca();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; toca(); }).observe(video);
      }
      document.addEventListener('visibilitychange', toca);
    };
    if (document.readyState === 'complete') setTimeout(carrega, 300);
    else window.addEventListener('load', function () { setTimeout(carrega, 300); });
  }

  /* ---------- mapa só no clique ---------- */
  $('#mapa-btn').addEventListener('click', function () {
    $('#mapa').innerHTML = '<iframe title="Cabanas Vila Serena no mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' +
      encodeURIComponent('Av. Vereador Inimá Novaes de Campos, 240, Alto Caparaó, MG, 36979-000') + '&output=embed"></iframe>';
  });

  /* ---------- carrossel das cabanas ---------- */
  var trilho = $('#trilho');
  function posicoes() {
    var pad = parseFloat(getComputedStyle(trilho).paddingLeft) || 0;
    return [].map.call(trilho.querySelectorAll('.slide'), function (s) { return s.offsetLeft - pad; });
  }
  function maisPerto(x) {
    var pos = posicoes(), i = 0;
    pos.forEach(function (p, k) { if (Math.abs(p - x) < Math.abs(pos[i] - x)) i = k; });
    return i;
  }
  function vaiPara(i) {
    var pos = posicoes();
    i = Math.max(0, Math.min(pos.length - 1, i));
    trilho.scrollTo({ left: pos[i], behavior: 'smooth' });
  }
  $('#seta-ant').addEventListener('click', function () { vaiPara(maisPerto(trilho.scrollLeft) - 1); });
  $('#seta-prox').addEventListener('click', function () { vaiPara(maisPerto(trilho.scrollLeft) + 1); });
  trilho.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); vaiPara(maisPerto(trilho.scrollLeft) - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); vaiPara(maisPerto(trilho.scrollLeft) + 1); }
  });

  // Arrastar com o mouse (no toque o navegador já rola sozinho). O snap sai
  // durante o arraste e, ao soltar, o trilho vai para o slide mais perto,
  // um adiante ou atrás se o arraste passou de 60 px.
  var arr = null;
  trilho.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    arr = { x: e.clientX, ini: trilho.scrollLeft, dx: 0 };
    trilho.classList.add('arrastando');
    trilho.setPointerCapture(e.pointerId);
  });
  trilho.addEventListener('pointermove', function (e) {
    if (!arr) return;
    arr.dx = e.clientX - arr.x;
    trilho.scrollLeft = arr.ini - arr.dx;
  });
  function solta() {
    if (!arr) return;
    var i = maisPerto(arr.ini);
    if (arr.dx < -60) i++;
    if (arr.dx > 60) i--;
    var arrastou = Math.abs(arr.dx) > 5;
    arr = null;
    vaiPara(i);
    setTimeout(function () { trilho.classList.remove('arrastando'); }, 450);
    if (arrastou) trilho.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
  }
  trilho.addEventListener('pointerup', solta);
  trilho.addEventListener('pointercancel', solta);
  trilho.addEventListener('dragstart', function (e) { e.preventDefault(); });

  function renderCarrossel(imgs) {
    // Fotos reais primeiro; áreas comuns ficam para o café e "por dentro da vila".
    var lista = imgs.filter(function (i) { return /^(fileira|cabana|porta)/.test(i.arquivo) || i.tipo === 'foto'; });
    lista.sort(function (a, b) { return (a.tipo === 'foto' ? 0 : 1) - (b.tipo === 'foto' ? 0 : 1); });
    trilho.innerHTML = lista.map(function (i) {
      var pasta = i.tipo === 'foto' ? 'assets/fotos/' : 'assets/renders/';
      return '<figure class="slide">' +
        '<img loading="lazy" src="' + pasta + i.arquivo + '-g.webp" srcset="' + pasta + i.arquivo + '-640.webp 640w, ' + pasta + i.arquivo + '-g.webp ' + i.w + 'w" sizes="(max-width: 1000px) 84vw, 880px" width="' + i.w + '" height="' + i.h + '" alt="' + attr(i.alt) + '">' +
        (i.tipo === 'render' ? '<span class="selo-render">Imagem ilustrativa do projeto</span>' : '') +
        '<figcaption>' + t(i.legenda) + '</figcaption></figure>';
    }).join('');
  }

  /* ---------- acomodações: fotos, texto e comodidades com ícone ---------- */
  function renderCabanas(lista) {
    $('#lista-cabanas').innerHTML = lista.map(function (c) {
      var preco = typeof c.diariaDesde === 'number'
        ? 'a partir de<b>R$ ' + c.diariaDesde.toLocaleString('pt-BR') + '</b>a diária'
        : 'a partir de<b>R$ <span class="ph">[DIÁRIA]</span></b>a diária';
      var fotos = (c.fotos || []).slice(0, 2).map(function (f) {
        return '<figure><img loading="lazy" src="assets/renders/' + f + '-640.webp" width="640" height="364" alt="Cabana A-frame da Vila Serena">' +
          '<span class="selo-render">Imagem ilustrativa</span></figure>';
      }).join('');
      var comods = c.comodidades.map(function (x) {
        return '<li><svg aria-hidden="true"><use href="#c-' + x.icone + '"/></svg><span>' + t(x.nome) + '</span></li>';
      }).join('');
      return '<article class="acomod">' +
        '<div class="acomod-fotos">' + fotos + '</div>' +
        '<div class="acomod-corpo">' +
          '<p class="acomod-meta">Cabana A-frame · até ' + t(c.capacidade) + ' pessoas · ' + t(c.cama) + '</p>' +
          '<h3>' + t(c.nome) + '</h3>' +
          '<p class="acomod-desc">' + t(c.descricao) + '</p>' +
          '<ul class="comods">' + comods + '</ul>' +
          '<div class="acomod-pe"><p class="acomod-preco">' + preco + '</p>' +
          '<a class="btn btn-grafite" href="#lancamento">Quero reservar primeiro</a></div>' +
        '</div></article>';
    }).join('');
  }

  /* ---------- informações ---------- */
  function caminho(o, k) { return k.split('.').reduce(function (a, p) { return a && a[p]; }, o); }

  function renderInfo(info) {
    document.querySelectorAll('[data-info]').forEach(function (el) {
      var v = caminho(info, el.getAttribute('data-info'));
      if (v != null && v !== '') el.innerHTML = t(v);
    });

    var faq = [
      { p: 'Qual o horário de check-in e check-out?', r: 'Entrada a partir de ' + info.checkin + ' e saída até ' + info.checkout + '. ' + info.checkinObs },
      { p: 'Tem mínimo de noites?', r: info.minimoNoites },
      { p: 'Como funciona o sinal?', r: info.sinal },
      { p: 'E se eu precisar cancelar?', r: info.cancelamento }
    ].concat(info.regras.map(function (r) { return { p: r.titulo, r: r.texto }; }), info.duvidas || []);
    var nomes = { Pets: 'Posso levar meu pet?', 'Crianças': 'Crianças podem vir?', Visitas: 'Posso receber visitas?', 'Silêncio': 'Tem horário de silêncio?' };
    $('#faq').innerHTML = faq.map(function (f, i) {
      return '<details' + (i === 0 ? ' open' : '') + '><summary>' + t(nomes[f.p] || f.p) + '</summary><p>' + t(f.r) + '</p></details>';
    }).join('');

    $('#distancias').innerHTML = info.distancias.map(function (d) {
      return '<span><span>' + t(d.de) + '</span><span>' + t(d.km) + '</span></span>';
    }).join('');

    $('#perto').innerHTML = info.perto.map(function (p) {
      return '<article><h3>' + t(p.titulo) + '</h3><p>' + t(p.texto) + '</p></article>';
    }).join('');

    $('#linha-obra').innerHTML = info.obra.map(function (o, i) {
      return '<li' + (o.feito ? ' class="feito"' : '') + '><span>' + String(i + 1).padStart(2, '0') + (o.feito ? ' · feito' : '') + '</span><h3>' + t(o.etapa) + '</h3><p>' + t(o.texto) + '</p></li>';
    }).join('');

    montaEspera(info);
  }

  /* ---------- lista de espera: quatro passos que montam a mensagem ---------- */
  function montaEspera(info) {
    var mes = info.mesInauguracao;
    var cap = info.capacidadeMax;
    var PERGUNTAS = [
      { id: 'quando', t: 'Quando vocês pensam em vir?', ops: [
        { v: temPh(mes) ? 'Mês da inauguração' : mes, l: 'No mês da inauguração', s: mes },
        { v: 'Mês seguinte à inauguração', l: 'No mês seguinte' },
        { v: 'feriado', l: 'Num feriado', s: 'Escolha qual na próxima tela' },
        { v: 'Ainda não sei', l: 'Ainda não sei' }
      ] },
      { id: 'grupo', t: 'Quem vem?', ops: [
        { v: 'Casal', l: 'Casal' },
        { v: 'Casal com criança', l: 'Casal com criança' },
        { v: 'Amigos', l: 'Amigos', s: 'até ' + cap + ' pessoas' }
      ] },
      { id: 'ocasiao', t: 'Qual a ocasião?', ops: [
        { v: 'Descanso', l: 'Descanso' },
        { v: 'Aniversário', l: 'Aniversário' },
        { v: 'Lua de mel', l: 'Lua de mel' },
        { v: 'Pedido de casamento', l: 'Pedido de casamento' },
        { v: 'Outra', l: 'Outra' }
      ] }
    ];
    var feriados = info.feriados || [];
    var resp = {};
    var box = $('#espera');
    var passo = 0, escolhendoFeriado = false;

    function topoPasso(n) {
      return '<div class="passo-topo"><span>Passo ' + (n + 1) + ' de 4</span><span class="passo-barra"><i style="width:' + ((n + 1) * 25) + '%"></i></span></div>';
    }

    function render(foco) {
      var h;
      if (passo < 3) {
        var p = PERGUNTAS[passo];
        var ops = p.ops;
        var titulo = p.t;
        if (passo === 0 && escolhendoFeriado) {
          titulo = 'Qual feriado?';
          ops = feriados.map(function (f) { return { v: f, l: f }; });
        }
        h = topoPasso(passo) + '<h3>' + titulo + '</h3>' +
          '<div class="opcoes' + (ops.length > 5 ? ' opcoes-2' : '') + '">' +
          ops.map(function (o) {
            return '<button type="button" class="opcao' + (resp[p.id] === o.v ? ' marcada' : '') + '" aria-pressed="' + (resp[p.id] === o.v) + '" data-v="' + attr(o.v) + '">' +
              '<span>' + t(o.l) + (o.s ? '<small>' + t(o.s) + '</small>' : '') + '</span></button>';
          }).join('') + '</div>' +
          '<div class="passo-acoes">' + (passo || escolhendoFeriado ? '<button type="button" class="voltar" data-voltar>← voltar</button>' : '<span></span>') + '</div>';
      } else if (passo === 3) {
        h = topoPasso(3) + '<h3>Para quem a gente guarda o lugar?</h3>' +
          '<form class="campos" id="espera-form" novalidate>' +
          '<label>Nome<input name="nome" autocomplete="name" required value="' + attr(resp.nome) + '"></label>' +
          '<label>Cidade de onde vocês vêm<input name="cidade" autocomplete="address-level2" required value="' + attr(resp.cidade) + '"></label>' +
          '<p class="erro" id="espera-erro" role="alert"></p></form>' +
          '<div class="passo-acoes"><button type="button" class="voltar" data-voltar>← voltar</button>' +
          '<button type="submit" form="espera-form" class="btn btn-grafite">Ver a mensagem</button></div>';
      } else {
        var msg = 'Olá! Quero entrar na lista de espera das Cabanas Vila Serena 🏔️\n' +
          '*Quando:* ' + resp.quando + '\n' +
          '*Quem vem:* ' + resp.grupo + '\n' +
          '*Ocasião:* ' + resp.ocasiao + '\n' +
          '*Nome:* ' + resp.nome + ' · *Cidade:* ' + resp.cidade;
        h = '<div class="passo-topo"><span>Pronto para enviar</span><span class="passo-barra"><i style="width:100%"></i></span></div>' +
          '<h3>Falta só enviar.</h3>' +
          '<p class="passo-txt">Com a mensagem enviada, vocês entram na lista de espera da Vila Serena. Assim que as reservas abrirem, chamamos vocês primeiro.</p>' +
          '<ul class="resumo"><li><b>Quando:</b> ' + t(resp.quando) + '</li><li><b>Quem vem:</b> ' + t(resp.grupo) + '</li><li><b>Ocasião:</b> ' + t(resp.ocasiao) + '</li><li><b>Nome:</b> ' + t(resp.nome) + ' · ' + t(resp.cidade) + '</li></ul>' +
          (info.condicaoInauguracao ? '<p class="condicao">' + t(info.condicaoInauguracao) + '</p>' : '') +
          '<a class="btn btn-ambar btn-g" target="_blank" rel="noopener" href="' + zap(msg) + '"><svg aria-hidden="true"><use href="#i-zap"/></svg>Confirmar pelo WhatsApp</a>' +
          '<div class="passo-acoes"><button type="button" class="voltar" data-voltar>← corrigir</button><button type="button" class="voltar" data-recomeca>↺ recomeçar</button></div>';
      }
      box.innerHTML = h;

      box.querySelectorAll('.opcao').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-v');
          if (passo === 0 && !escolhendoFeriado && v === 'feriado') { escolhendoFeriado = true; render(true); return; }
          resp[PERGUNTAS[passo].id] = v;
          escolhendoFeriado = false;
          proximo();
        });
      });
      var v = box.querySelector('[data-voltar]');
      if (v) v.addEventListener('click', function () {
        if (escolhendoFeriado) escolhendoFeriado = false; else passo--;
        render(true);
      });
      var r = box.querySelector('[data-recomeca]');
      if (r) r.addEventListener('click', function () { resp = {}; passo = 0; render(true); });
      var f = box.querySelector('#espera-form');
      if (f) f.addEventListener('submit', function (e) {
        e.preventDefault();
        var nome = f.nome.value.trim(), cidade = f.cidade.value.trim();
        var erro = box.querySelector('#espera-erro');
        f.nome.setAttribute('aria-invalid', !nome);
        f.cidade.setAttribute('aria-invalid', !cidade);
        if (!nome) { erro.textContent = 'Escreva o nome de quem vai reservar.'; f.nome.focus(); return; }
        if (!cidade) { erro.textContent = 'Diga de que cidade vocês vêm.'; f.cidade.focus(); return; }
        resp.nome = nome; resp.cidade = cidade;
        passo = 4; render(true);
      });
      if (foco) { var alvo = box.querySelector('h3'); if (alvo) { alvo.setAttribute('tabindex', '-1'); alvo.focus({ preventScroll: true }); } }
    }
    function proximo() { passo++; render(true); }
    render(false);

  }

  function json(u) { return fetch(u + '?v=8').then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }

  json('data/info.json').then(renderInfo).catch(function (e) { console.error(e); });
  json('data/cabanas.json').then(function (d) { renderCabanas(d.cabanas); }).catch(function (e) { console.error(e); });
  json('data/galeria.json').then(function (d) { renderCarrossel(d.imagens); }).catch(function (e) { console.error(e); });
})();
