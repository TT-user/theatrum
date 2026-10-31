// Pousada Canto dos Pássaros: prévia. Contato em js/config.js; chalés, espaços e dúvidas em
// data/*.json (mudou um JSON, suba o V abaixo).
(function () {
  var V = 2;
  var OLA = 'Olá! Vim pelo site da Pousada Canto dos Pássaros.';
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
  function zap(msg) { return 'https://wa.me/' + CP.whatsapp + '?text=' + encodeURIComponent(msg); }

  // ---------- links fixos de WhatsApp ----------
  document.querySelectorAll('[data-zap]').forEach(function (a) {
    a.href = zap(a.getAttribute('data-zap'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  // ---------- config ----------
  document.getElementById('ano').textContent = new Date().getFullYear();
  if (CP.aviso) { var av = document.getElementById('aviso'); av.textContent = CP.aviso; av.hidden = false; }
  document.getElementById('cafe-hora').innerHTML = CP.horarioCafe ? esc(CP.horarioCafe) : ph('[horário do café]');
  document.getElementById('diaria').innerHTML = 'Diárias a partir de ' + (CP.diariaAPartir ? '<b>' + esc(CP.diariaAPartir) + '</b>' : ph('[valor da diária]')) + ', com café da manhã.';
  if (CP.cnpj) document.getElementById('r-cnpj').textContent = 'CNPJ ' + CP.cnpj;
  document.getElementById('maps').href = CP.mapsUrl;

  // ---------- topo e menu ----------
  var topo = document.getElementById('topo');
  var hero = document.getElementById('hero');
  function topoSolido() { topo.classList.toggle('solido', scrollY > hero.offsetHeight - 90); }
  addEventListener('scroll', topoSolido, { passive: true }); topoSolido();

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
    ['chales', 'cafe', 'pousada', 'reservar', 'duvidas', 'onde'].forEach(function (id) { ioMenu.observe(document.getElementById(id)); });
  }

  // ---------- hero: fotos em fusão, só à vista e com a aba aberta ----------
  var fotos = [].slice.call(document.querySelectorAll('.hero__fotos img'));
  var LEGENDAS = ['Os chalés no sol da manhã', 'O caminho dos chalés', 'O lago e a casinha dos pássaros', 'O jardim à noite'];
  var legenda = document.getElementById('hero-legenda');
  var atual = 0, timer = null, heroVisivel = true;
  function proxima() {
    var n = (atual + 1) % fotos.length;
    if (!fotos[n].complete || !fotos[n].currentSrc) { fotos[n].onload = proxima; return; }
    fotos[atual].classList.remove('on'); fotos[n].classList.add('on'); atual = n;
    legenda.style.opacity = 0;
    setTimeout(function () { legenda.textContent = LEGENDAS[atual]; legenda.style.opacity = 1; }, 500);
  }
  function roda() { if (!timer && heroVisivel && !document.hidden) timer = setInterval(proxima, 6500); hero.classList.remove('parado'); }
  function para() { clearInterval(timer); timer = null; hero.classList.add('parado'); }
  if (!calmo) {
    addEventListener('load', function () {
      fotos.slice(1).forEach(function (img) { img.srcset = img.dataset.srcset; });
      roda();
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { heroVisivel = es[0].isIntersecting; heroVisivel ? roda() : para(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { document.hidden ? para() : roda(); });
  }

  // ---------- WhatsApp flutuante depois da primeira tela ----------
  var flutua = document.getElementById('zap-flutua');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { flutua.classList.toggle('ver', !es[0].isIntersecting); }).observe(hero);

  // ---------- mapa só no clique ----------
  document.getElementById('mapa-btn').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = CP.mapaEmbed; f.title = 'Mapa da Pousada Canto dos Pássaros'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    document.getElementById('mapa').appendChild(f); this.remove();
  });

  // ---------- dados ----------
  function pega(nome) { return fetch('data/' + nome + '.json?v=' + V).then(function (r) { if (!r.ok) throw new Error(nome); return r.json(); }); }
  Promise.all([pega('chales'), pega('espacos'), pega('faq')])
    .then(function (d) { montaChales(d[0]); montaGaleria(d[1].itens); montaFaq(d[2].perguntas); revela(); semLazy(); })
    .catch(function () {
      document.getElementById('chales-grid').innerHTML = '<p class="carregando">Não consegui carregar os chalés. <a href="' + zap(OLA + ' Quero saber dos chalés.') + '">Pergunte no WhatsApp</a>.</p>';
      revela();
    });

  function ave(cor) { return '<svg style="color:' + esc(cor) + '" aria-hidden="true"><use href="#i-passaro"/></svg>'; }

  function montaChales(d) {
    var grid = document.getElementById('chales-grid');
    grid.innerHTML = d.itens.map(function (c) {
      return '<article class="chale rev" id="chale-' + esc(c.id) + '">' +
        '<div class="chale__foto"><img src="assets/fotos/' + esc(c.foto) + '-' + c.largura + '.webp" width="' + c.largura + '" height="' + c.altura + '" loading="lazy" alt="' + esc(c.alt) + '">' +
        '<span class="chale__ave">' + ave(c.cor) + '</span></div>' +
        '<div class="chale__corpo"><p class="chale__rot">Chalé</p><h3>' + esc(c.nome) + '</h3>' +
        '<p class="chale__ave-txt">' + esc(c.passaro) + '</p>' +
        '<ul class="chale__info"><li><b>Acomoda:</b> ' + (c.capacidade ? esc(c.capacidade) : ph('[até ? pessoas]')) + '</li>' +
        '<li><b>Camas:</b> ' + (c.camas ? esc(c.camas) : ph('[casal + solteiro?]')) + '</li></ul>' +
        '<a class="btn btn--cedro" href="#reservar" data-escolhe="' + esc(c.nome) + '">Quero o ' + esc(c.nome) + '</a></div></article>';
    }).join('');
    var comum = document.createElement('ul');
    comum.className = 'comum'; comum.setAttribute('aria-label', 'Em todos os chalés');
    comum.innerHTML = d.comum.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    grid.after(comum);

    // Chips do simulador
    document.getElementById('chips-chale').insertAdjacentHTML('beforeend', d.itens.map(function (c) {
      return '<label class="chip"><input type="radio" name="chale" value="' + esc(c.nome) + '"><span>' + ave(c.cor) + esc(c.nome) + '</span></label>';
    }).join(''));
    // "Quero o Sabiá" desce para o simulador com o chalé marcado
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-escolhe]'); if (!b) return;
      var r = document.querySelector('#estadia input[name=chale][value="' + b.dataset.escolhe + '"]');
      if (r) r.checked = true;
    });
  }

  // ---------- galeria + lightbox ----------
  var LISTA = [];
  function montaGaleria(itens) {
    LISTA = itens;
    document.getElementById('galeria').innerHTML = itens.map(function (f, i) {
      var srcset = f.larguras.map(function (w) { return 'assets/fotos/' + f.foto + '-' + w + '.webp ' + w + 'w'; }).join(', ');
      return '<button type="button" class="foto foto--' + f.forma + ' rev" data-i="' + i + '" aria-label="Ampliar: ' + esc(f.titulo) + '">' +
        '<img src="assets/fotos/' + f.foto + '-' + f.larguras[0] + '.webp" srcset="' + srcset + '" sizes="(min-width: 900px) ' + (f.forma === 'largo' ? '50vw' : '25vw') + ', ' + (f.forma === 'largo' ? '100vw' : '50vw') + '" width="' + f.w + '" height="' + f.h + '" loading="lazy" alt="' + esc(f.alt) + '">' +
        '<span class="foto__leg"><b>' + esc(f.titulo) + '</b><span>' + txt(f.texto) + '</span></span></button>';
    }).join('');
    document.getElementById('galeria').addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]'); if (b) abreLuz(+b.dataset.i, b);
    });
  }
  var luz = document.getElementById('luz'), luzI = 0, luzVolta;
  function mostraLuz() {
    var f = LISTA[luzI], w = f.larguras[f.larguras.length - 1];
    var img = luz.querySelector('img');
    img.src = 'assets/fotos/' + f.foto + '-' + w + '.webp'; img.alt = f.alt; img.width = f.w; img.height = f.h;
    luz.querySelector('figcaption').innerHTML = esc(f.titulo) + ' · ' + txt(f.texto);
  }
  function abreLuz(i, origem) { luzI = i; luzVolta = origem; mostraLuz(); luz.hidden = false; document.body.style.overflow = 'hidden'; luz.querySelector('.luz__x').focus(); }
  function fechaLuz() { luz.hidden = true; document.body.style.overflow = ''; if (luzVolta) luzVolta.focus(); }
  luz.addEventListener('click', function (e) {
    var b = e.target.closest('[data-luz]');
    if (!b) { if (e.target === luz) fechaLuz(); return; }
    if (b.dataset.luz === 'x') return fechaLuz();
    luzI = (luzI + +b.dataset.luz + LISTA.length) % LISTA.length; mostraLuz();
  });
  document.addEventListener('keydown', function (e) {
    if (luz.hidden) return;
    if (e.key === 'Escape') fechaLuz();
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { luzI = (luzI + (e.key === 'ArrowRight' ? 1 : -1) + LISTA.length) % LISTA.length; mostraLuz(); }
  });
  // Arrastar no celular
  var x0 = null;
  luz.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  luz.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { luzI = (luzI + (dx < 0 ? 1 : -1) + LISTA.length) % LISTA.length; mostraLuz(); }
  });

  // ---------- dúvidas ----------
  function montaFaq(PERGUNTAS) {
    function troca(s) {
      return s.replace('{checkin}', CP.checkin || '[horário de entrada]').replace('{checkout}', CP.checkout || '[horário de saída]').replace('{cafe}', CP.horarioCafe || '[horário do café]');
    }
    document.getElementById('faq').innerHTML = PERGUNTAS.map(function (q, i) {
      return '<details id="faq-' + esc(q.id) + '"' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.p) + '</summary><p>' + txt(troca(q.r)) + '</p></details>';
    }).join('');
    // Âncora do rodapé abre a pergunta
    function abreHash() { var d = location.hash && document.getElementById(location.hash.slice(1)); if (d && d.tagName === 'DETAILS') d.open = true; }
    addEventListener('hashchange', abreHash); abreHash();
  }

  // ---------- monte sua estadia ----------
  var form = document.getElementById('estadia');
  var cheg = form.chegada, said = form.saida, noitesEl = document.getElementById('noites'), erro = document.getElementById('estadia-erro');
  var hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  var iso = hoje.toISOString().slice(0, 10);
  cheg.min = iso; said.min = iso;
  var SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function data(v) { var p = v.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function br(v) { var d = data(v); return SEM[d.getDay()] + ', ' + v.split('-').reverse().join('/'); }
  function noites() { return cheg.value && said.value ? Math.round((data(said.value) - data(cheg.value)) / 864e5) : 0; }
  function mostraNoites() {
    var n = noites();
    if (cheg.value) { var m = data(cheg.value); m.setDate(m.getDate() + 1); m.setMinutes(m.getMinutes() - m.getTimezoneOffset()); said.min = m.toISOString().slice(0, 10); }
    noitesEl.textContent = !cheg.value || !said.value ? 'Escolha as datas para ver quantas noites.' : n > 0 ? n + (n === 1 ? ' noite' : ' noites') + ', de ' + br(cheg.value) + ' a ' + br(said.value) + '.' : 'A saída precisa ser depois da chegada.';
  }
  cheg.addEventListener('change', function () { if (said.value && noites() <= 0) said.value = ''; mostraNoites(); if (!said.value && said.showPicker) try { said.showPicker(); } catch (e) {} });
  said.addEventListener('change', mostraNoites);

  var conta = { adultos: 2, criancas: 0 }, LIM = { adultos: [1, 10], criancas: [0, 8] };
  form.querySelectorAll('.cont').forEach(function (c) {
    var k = c.dataset.cont, out = c.querySelector('output');
    c.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      conta[k] = Math.min(LIM[k][1], Math.max(LIM[k][0], conta[k] + (b.hasAttribute('data-mais') ? 1 : -1)));
      out.textContent = conta[k];
      if (k === 'criancas') document.getElementById('idades').hidden = conta.criancas === 0;
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = noites();
    if (!cheg.value || !said.value) { erro.textContent = 'Escolha a data de chegada e a de saída.'; (cheg.value ? said : cheg).focus(); return; }
    if (n <= 0) { erro.textContent = 'A saída precisa ser depois da chegada.'; said.focus(); return; }
    erro.textContent = '';
    var pessoas = conta.adultos + (conta.adultos === 1 ? ' adulto' : ' adultos');
    if (conta.criancas) pessoas += ', ' + conta.criancas + (conta.criancas === 1 ? ' criança' : ' crianças') + (form.idades.value.trim() ? ' (' + form.idades.value.trim() + ')' : '');
    var linhas = [
      'Olá! Vim pelo site da Pousada Canto dos Pássaros e quero ver disponibilidade.', '',
      '*Chegada:* ' + br(cheg.value),
      '*Saída:* ' + br(said.value) + ' (' + n + (n === 1 ? ' noite' : ' noites') + ')',
      '*Pessoas:* ' + pessoas,
      '*Chalé:* ' + form.chale.value,
      '*Ocasião:* ' + form.ocasiao.value
    ];
    if (form.nome.value.trim()) linhas.push('*Nome:* ' + form.nome.value.trim());
    if (form.obs.value.trim()) linhas.push('*Observação:* ' + form.obs.value.trim());
    // Abre direto no WhatsApp, em qualquer aparelho
    window.open(zap(linhas.join('\n')), '_blank', 'noopener');
  });

  // ---------- entrada suave ----------
  function revela() {
    var todos = document.querySelectorAll('.cab, .dentro__f, .dentro__txt, .cafe__fotos, .cafe__txt, .prova, .reserva__txt, .estadia, .onde__txt, .mapa, .rev');
    todos.forEach(function (el) { el.classList.add('rev'); });
    if (calmo || !('IntersectionObserver' in window)) { todos.forEach(function (el) { el.classList.add('ok'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ok'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    todos.forEach(function (el) { io.observe(el); });
  }
})();
