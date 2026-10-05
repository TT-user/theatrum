/* Gabriela Carolina — scripts gerais (sem rastreamento) */
(function () {
  'use strict';

  var WHATS = '5532999159675';
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  function linkWhats(msg) {
    return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Destaca [PLACEHOLDERS] com sublinhado tracejado
  function comPh(s) {
    return esc(s).replace(/\[[^\]]+\]/g, function (m) { return '<span class="ph">' + m + '</span>'; });
  }
  function carregar(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  window.Gabi = { linkWhats: linkWhats, esc: esc, comPh: comPh, carregar: carregar, reduzir: reduzir };

  /* Links de WhatsApp com mensagem pronta */
  function ligarWhats(raiz) {
    (raiz || document).querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = linkWhats(a.getAttribute('data-wa'));
    });
  }
  ligarWhats();

  /* Links ainda sem endereço (podcast) */
  document.querySelectorAll('[data-pendente]').forEach(function (a) {
    a.title = '[LINK DO PODCAST] aguardando a cliente';
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Faixa rolando do hero: duplica o grupo para o loop contínuo */
  document.querySelectorAll('.faixa__trilho').forEach(function (t) {
    if (reduzir) return;
    var copia = t.firstElementChild.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    t.appendChild(copia);
  });

  /* Menu mobile */
  var topo = document.getElementById('topo');
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  function posMenu() {
    document.documentElement.style.setProperty('--menu-top', topo.getBoundingClientRect().bottom + 'px');
  }
  function fechar() {
    menu.classList.remove('aberto');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menu');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', function () {
    var abrir = btn.getAttribute('aria-expanded') !== 'true';
    if (!abrir) return fechar();
    posMenu();
    menu.classList.add('aberto');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Fechar menu');
    document.body.style.overflow = 'hidden';
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('aberto')) { fechar(); btn.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1100) fechar(); });

  /* Seção atual em destaque no menu + barra de progresso */
  var linksMenu = Array.prototype.slice.call(menu.querySelectorAll('li a[href^="#"]'));
  var secoesMenu = linksMenu.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var marcador = menu.querySelector('.menu__marcador');
  var barra = document.querySelector('.topo__progresso span');
  var ativoAtual = null, agendado = false;

  function moverMarcador(a) {
    if (!marcador) return;
    if (!a || window.innerWidth < 1240) { marcador.classList.remove('on'); return; }
    var ul = marcador.parentNode.getBoundingClientRect(), r = a.getBoundingClientRect();
    marcador.style.transform = 'translateX(' + (r.left - ul.left) + 'px) scaleX(' + r.width + ')';
    marcador.classList.add('on');
  }
  function atualizarTopo() {
    agendado = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (barra) barra.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';

    // a seção "ativa" é a que cruza uma linha a 35% da tela, logo abaixo do cabeçalho
    var linha = topo.getBoundingClientRect().bottom + window.innerHeight * 0.35;
    var ativo = null;
    secoesMenu.forEach(function (s, i) {
      if (!s) return;
      var r = s.getBoundingClientRect();
      if (r.top <= linha && r.bottom > linha) ativo = linksMenu[i];
    });
    if (ativo !== ativoAtual) {
      linksMenu.forEach(function (a) {
        a.classList.toggle('ativo', a === ativo);
        if (a === ativo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      ativoAtual = ativo;
    }
    moverMarcador(ativo);
  }
  function agendarTopo() { if (!agendado) { agendado = true; requestAnimationFrame(atualizarTopo); } }
  window.addEventListener('scroll', agendarTopo, { passive: true });
  window.addEventListener('resize', agendarTopo);
  window.addEventListener('load', agendarTopo);
  atualizarTopo();

  /* Checklist "Para aproveitar melhor" */
  var checks = Array.prototype.slice.call(document.querySelectorAll('.check'));
  var status = document.querySelector('.aproveitar__status');
  function contar() {
    if (!status) return;
    var n = checks.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).length;
    status.innerHTML = n === checks.length ? 'Tudo pronto para a sua <span>sessão</span>.' : '<span>' + n + '</span> de ' + checks.length + ' prontos';
  }
  checks.forEach(function (c) {
    c.addEventListener('click', function () {
      c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
      contar();
    });
  });
  // Ao aparecer na tela, os itens vão se marcando um a um (uma vez só)
  var lista = document.querySelector('.checklist');
  if (lista && 'IntersectionObserver' in window) {
    var obsCheck = new IntersectionObserver(function (itens) {
      if (!itens[0].isIntersecting) return;
      obsCheck.disconnect();
      checks.forEach(function (c, i) {
        setTimeout(function () { c.setAttribute('aria-pressed', 'true'); contar(); }, reduzir ? 0 : 350 + i * 450);
      });
    }, { threshold: 0.5 });
    obsCheck.observe(lista);
  }

  /* Balão do WhatsApp: no celular (sem hover), aparece sozinho uma vez */
  var whats = document.querySelector('.whats-flutuante');
  if (whats && window.matchMedia('(hover: none)').matches) {
    setTimeout(function () {
      whats.classList.add('mostrar');
      setTimeout(function () { whats.classList.remove('mostrar'); }, 4500);
    }, 6000);
  }

  /* Animação de entrada */
  var observador = null;
  if (!reduzir && 'IntersectionObserver' in window) {
    observador = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add('visivel'); observador.unobserve(it.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  function revelar(raiz) {
    (raiz || document).querySelectorAll('.revelar:not(.visivel)').forEach(function (el) {
      if (observador) observador.observe(el); else el.classList.add('visivel');
    });
  }
  window.Gabi.revelar = revelar;
  window.Gabi.ligarWhats = ligarWhats;
  revelar();

  /* Atendimentos (data/servicos.json) */
  var icones = { escuta: 'i-escuta', maos: 'i-maos', lua: 'i-lua' };
  carregar('data/servicos.json').then(function (d) {
    window.Gabi.servicos = d;
    var html = d.servicos.map(function (s) {
      return '<article class="card revelar">' +
        '<svg class="ic" aria-hidden="true"><use href="#' + (icones[s.icone] || 'i-lotus') + '"/></svg>' +
        '<h3>' + esc(s.nome) + '</h3>' +
        '<p class="card__frase">' + esc(s.frase) + '</p>' +
        '<p class="card__txt">' + esc(s.para_quem) + ' ' + esc(s.como_funciona) + '</p>' +
        '<dl>' +
          '<div><dt>Formato</dt><dd>' + comPh(s.formato) + '</dd></div>' +
          '<div><dt>Duração</dt><dd>' + comPh(s.duracao) + '</dd></div>' +
          '<div><dt>Valor</dt><dd>' + (s.valor ? comPh(s.valor) : 'Valor na conversa') + '</dd></div>' +
        '</dl>' +
        '<a class="btn btn--contorno" target="_blank" rel="noopener" href="' + linkWhats(s.mensagem_whatsapp) + '">Quero saber mais</a>' +
      '</article>';
    }).join('');
    var alvo = document.getElementById('cards-servicos');
    alvo.innerHTML = html;
    revelar(alvo);
  }).catch(function (e) { console.warn(e); });

  /* Depoimentos em marquee (data/depoimentos.json) */
  var trilho = document.getElementById('marquee-trilho');
  var marquee = document.getElementById('marquee');
  var pausa = document.getElementById('marquee-pausa');
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbLeg = document.getElementById('lightbox-legenda');

  function itemPrint(dep, i, copia) {
    return '<button type="button" class="print" data-i="' + i + '"' + (copia ? ' tabindex="-1" aria-hidden="true"' : '') +
      ' aria-label="Ampliar depoimento: ' + esc(dep.contexto) + '">' +
      '<img src="' + esc(dep.imagem) + '" width="' + dep.largura + '" height="' + dep.altura + '" loading="lazy" decoding="async" alt="' + (copia ? '' : esc(dep.alt)) + '">' +
      '<span class="print__ctx">' + esc(dep.contexto) + '</span></button>';
  }
  carregar('data/depoimentos.json').then(function (d) {
    var lista = d.depoimentos.filter(function (x) { return x.autorizado === true; });
    if (!lista.length) { document.getElementById('depoimentos').hidden = true; return; }
    var html = lista.map(function (x, i) { return itemPrint(x, i, false); }).join('');
    // Sem movimento reduzido: duplica a fila para o loop contínuo
    if (!reduzir) html += lista.map(function (x, i) { return itemPrint(x, i, true); }).join('');
    trilho.innerHTML = html;
    trilho.style.setProperty('--marquee-dur', (lista.length * 9) + 's');

    trilho.addEventListener('click', function (e) {
      var b = e.target.closest('.print');
      if (!b) return;
      var dep = lista[+b.getAttribute('data-i')];
      lbImg.src = dep.imagem; lbImg.alt = dep.alt;
      lbImg.width = dep.largura; lbImg.height = dep.altura;
      lbLeg.textContent = dep.contexto;
      if (lightbox.showModal) lightbox.showModal(); else window.open(dep.imagem, '_blank');
    });
  }).catch(function (e) { console.warn(e); });

  pausa.addEventListener('click', function () {
    var p = marquee.classList.toggle('pausado');
    pausa.setAttribute('aria-pressed', String(p));
    pausa.textContent = p ? 'Continuar' : 'Pausar';
  });
  lightbox.querySelector('.lightbox__fechar').addEventListener('click', function () { lightbox.close(); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.close(); });

  /* Vitrine Myano (data/produtos.json) */
  function frascoSVG(cor, nome) {
    // Ilustração provisória do frasco — [TROCAR PELA FOTO DO PRODUTO]
    var n = esc(String(nome).replace(/\[[^\]]*\]\s*/g, '')).toUpperCase();
    return '<svg viewBox="0 0 200 250" role="img" aria-label="Ilustração do frasco ' + n + '">' +
      '<defs><linearGradient id="vd' + n.length + '" x1="0" x2="1"><stop offset="0" stop-color="#3a1608"/><stop offset=".45" stop-color="#7a3a14"/><stop offset="1" stop-color="#2a0f05"/></linearGradient></defs>' +
      '<ellipse cx="100" cy="226" rx="62" ry="8" fill="#000" opacity=".35"/>' +
      '<rect x="88" y="24" width="24" height="16" rx="3" fill="#1b1112"/>' +
      '<rect x="80" y="38" width="40" height="30" rx="4" fill="#120b0c"/>' +
      '<rect x="78" y="64" width="44" height="10" rx="2" fill="#1b1112"/>' +
      '<path d="M66 82c0-6 6-10 14-10h40c8 0 14 4 14 10v134c0 6-5 10-11 10H77c-6 0-11-4-11-10z" fill="url(#vd' + n.length + ')"/>' +
      '<rect x="70" y="112" width="60" height="84" rx="3" fill="' + esc(cor) + '"/>' +
      '<rect x="74" y="116" width="52" height="76" rx="2" fill="none" stroke="#C9A46A" stroke-width=".8" opacity=".8"/>' +
      '<text x="100" y="136" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="15" fill="#F3E9DC" letter-spacing="2">MYANO</text>' +
      '<text x="100" y="146" text-anchor="middle" font-family="Jost, sans-serif" font-size="4.6" fill="#E2C99A" letter-spacing="1.2">ESSÊNCIA QUÂNTICA</text>' +
      '<path d="M88 160c4 6 4 12 0 18M112 160c-4 6-4 12 0 18M100 156v24" stroke="#C9A46A" stroke-width=".8" fill="none"/>' +
      '<text x="100" y="188" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="7" fill="#F3E9DC">' + n + '</text>' +
      '<rect x="72" y="84" width="6" height="120" rx="3" fill="#fff" opacity=".08"/>' +
      '</svg>';
  }
  carregar('data/produtos.json').then(function (d) {
    var html = d.produtos.map(function (p) {
      var img = p.imagem
        ? '<img src="' + esc(p.imagem) + '" alt="' + esc(p.tipo + ' ' + p.nome) + '" loading="lazy" decoding="async">'
        : frascoSVG(p.cor_rotulo || '#5E1A22', p.nome);
      var msg = 'Olá, Gabi! Vim pelo site e tenho interesse no produto ' + p.nome.replace(/\[[^\]]*\]\s*/g, '') + ', da Myano. Pode me passar valor e prazo de envio?';
      return '<li class="produto revelar' + (p.placeholder ? ' produto--exemplo' : '') + '">' +
        '<div class="produto__img">' + (p.selo ? '<span class="produto__selo">' + esc(p.selo) + '</span>' : '') + img + '</div>' +
        '<div class="produto__corpo">' +
          '<p class="produto__tipo">' + esc(p.tipo) + '</p>' +
          '<h3>' + comPh(p.nome) + '</h3>' +
          '<p class="produto__frase">' + esc(p.frase) + '</p>' +
          '<p class="produto__desc">' + comPh(p.descricao) + '</p>' +
          '<div class="produto__rodape"><span>' + comPh(p.tamanho) + '</span><span class="produto__preco">' + (p.preco ? comPh(p.preco) : 'Preço na conversa') + '</span></div>' +
          '<a class="btn btn--myano" target="_blank" rel="noopener" href="' + linkWhats(msg) + '">Quero este</a>' +
        '</div></li>';
    }).join('');
    var alvo = document.getElementById('vitrine-lista');
    alvo.innerHTML = html;
    revelar(alvo);
  }).catch(function (e) { console.warn(e); });
})();
