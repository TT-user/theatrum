/* =========================================================
   SEIS PANOS — motor da loja
   Carrinho persistente, render de produtos, filtros, countdown,
   drawer, toasts e checkout simulado. Sem dependências.
   ========================================================= */
(function () {
  'use strict';

  const FRETE_GRATIS = 399;
  const CUPONS = { 'PRIMEIRA10': 0.10, 'SEISPANOS15': 0.15, 'LACRE20': 0.20 };
  const CHAVE = 'seispanos-sacola';

  /* ---------------- utilidades ---------------- */
  const $ = (s, e) => (e || document).querySelector(s);
  const $$ = (s, e) => Array.prototype.slice.call((e || document).querySelectorAll(s));
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const prod = id => PRODUTOS.find(p => p.id === id);
  const qs = k => new URLSearchParams(location.search).get(k);

  function icone(nome, tam) {
    const t = tam || 18;
    const P = {
      sacola: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      x: '<path d="M6 6l12 12M18 6L6 18"/>',
      check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
      caminhao: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
      escudo: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
      troca: '<path d="M4 9h11a4 4 0 0 1 0 8h-3"/><path d="m7 6-3 3 3 3"/><path d="M20 15H9a4 4 0 0 1 0-8h3"/><path d="m17 18 3-3-3-3"/>',
      cartao: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
      coracao: '<path d="M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 4.5-7 9-7 9Z"/>',
      raio: '<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>',
      relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
      seta: '<path d="M5 12h13M13 6l6 6-6 6"/>',
      mais: '<path d="M12 5v14M5 12h14"/>'
    };
    return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[nome] || '') + '</svg>';
  }

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('on'));
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('on'), 2200);
  }

  function figura(arquivo, alt, classe) {
    return '<figure class="ph ' + (classe || '') + '" data-file="' + arquivo + '">' +
           '<img src="' + arquivo + '" alt="' + (alt || '').replace(/"/g, '') + '" loading="lazy"></figure>';
  }

  function armar(escopo) {
    $$('.ph img', escopo).forEach(el => {
      if (el.dataset.ok) return;
      el.dataset.ok = '1';
      el.addEventListener('error', () => el.remove());
      if (el.complete && el.naturalWidth === 0) el.remove();
    });
  }

  /* ---------------- sacola ---------------- */
  let sacola = [];
  try { sacola = JSON.parse(localStorage.getItem(CHAVE) || '[]'); } catch (e) { sacola = []; }

  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch (e) {} };
  const totalItens = () => sacola.reduce((s, i) => s + i.qtd, 0);
  const subtotal = () => sacola.reduce((s, i) => { const p = prod(i.id); return s + (p ? p.preco * i.qtd : 0); }, 0);

  window.SP = {
    get itens() { return sacola; },
    subtotal, brl, prod, figura, icone, armar, toast,
    FRETE_GRATIS, CUPONS,
    limpar() { sacola = []; salvar(); pintarSacola(); }
  };

  function addItem(id, tam, qtd) {
    const p = prod(id);
    if (!p) return;
    /* compra rápida cai no primeiro tamanho realmente disponível */
    const t = tam || TAMANHOS.find(x => p.esgotados.indexOf(x) === -1) || TAMANHOS[3];
    const achou = sacola.find(i => i.id === id && i.tam === t);
    if (achou) achou.qtd += (qtd || 1); else sacola.push({ id, tam: t, qtd: qtd || 1 });
    salvar(); pintarSacola();
    toast(p.nome.split('·').pop().trim() + ' na sacola');
    abrirSacola();
  }
  window.addItem = addItem;

  function mudarQtd(idx, delta) {
    sacola[idx].qtd += delta;
    if (sacola[idx].qtd < 1) sacola.splice(idx, 1);
    salvar(); pintarSacola();
  }
  function removerItem(idx) { sacola.splice(idx, 1); salvar(); pintarSacola(); toast('item removido'); }

  /* ---------------- drawer ---------------- */
  function montarDrawer() {
    if ($('.sacola')) return;
    const veu = document.createElement('div'); veu.className = 'veu';
    const d = document.createElement('aside');
    d.className = 'sacola'; d.setAttribute('aria-label', 'Sacola de compras');
    d.innerHTML =
      '<div class="sacola__top">' + icone('sacola', 20) + '<b>Sua sacola</b>' +
        '<button type="button" aria-label="Fechar sacola">' + icone('x', 20) + '</button></div>' +
      '<div class="frete"></div>' +
      '<div class="sacola__itens"></div>' +
      '<div class="sacola__base"></div>';
    document.body.appendChild(veu); document.body.appendChild(d);
    veu.addEventListener('click', fecharSacola);
    $('.sacola__top button', d).addEventListener('click', fecharSacola);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharSacola(); });
  }
  const abrirSacola = () => { montarDrawer(); $('.veu').classList.add('on'); $('.sacola').classList.add('on'); };
  const fecharSacola = () => { const v = $('.veu'), s = $('.sacola'); if (v) v.classList.remove('on'); if (s) s.classList.remove('on'); };
  window.abrirSacola = abrirSacola;

  function pintarSacola() {
    const n = totalItens();
    $$('.pino').forEach(p => { p.textContent = n; p.classList.toggle('on', n > 0); });

    const caixa = $('.sacola__itens');
    if (!caixa) return;

    if (!sacola.length) {
      caixa.innerHTML = '<div class="vazio"><b>Sacola vazia</b><p>Escolhe um boné e volta aqui.</p>' +
        '<a class="btn btn--ghost" href="catalogo.html">Ver catálogo</a></div>';
      $('.frete').innerHTML = '';
      $('.sacola__base').innerHTML = '';
      return;
    }

    caixa.innerHTML = sacola.map((i, k) => {
      const p = prod(i.id); if (!p) return '';
      return '<div class="item">' +
        '<div class="item__img">' + figura('img/produtos/' + p.id + '-1.jpg', p.nome) + '</div>' +
        '<div><b>' + p.nome + '</b><small>tam ' + i.tam + '</small>' +
          '<div class="qtd"><button type="button" data-menos="' + k + '" aria-label="Diminuir">–</button>' +
          '<span>' + i.qtd + '</span>' +
          '<button type="button" data-mais="' + k + '" aria-label="Aumentar">+</button></div></div>' +
        '<div class="item__dir"><b>' + brl(p.preco * i.qtd) + '</b>' +
          '<button type="button" class="lixo" data-tira="' + k + '">remover</button></div></div>';
    }).join('');

    const sub = subtotal();
    const falta = Math.max(0, FRETE_GRATIS - sub);
    $('.frete').innerHTML = falta > 0
      ? '<p>Faltam <b>' + brl(falta) + '</b> para o frete sair de graça</p>' +
        '<div class="barra"><i style="width:' + Math.min(100, (sub / FRETE_GRATIS) * 100).toFixed(0) + '%"></i></div>'
      : '<p>' + icone('check', 14) + ' <b>Frete grátis liberado</b> para todo o Brasil</p>' +
        '<div class="barra"><i style="width:100%"></i></div>';

    $('.sacola__base').innerHTML =
      '<div class="linha-total"><span>Subtotal</span><span>' + brl(sub) + '</span></div>' +
      '<div class="linha-total"><span>Frete</span><span>' + (falta > 0 ? 'a calcular' : 'grátis') + '</span></div>' +
      '<div class="linha-total linha-total--big"><span>Total</span><b>' + brl(sub) + '</b></div>' +
      '<a class="btn btn--lg btn--pulso" href="checkout.html">Finalizar compra ' + icone('seta', 16) + '</a>' +
      '<p style="text-align:center;font-size:11.5px;margin:12px 0 0;color:var(--cinza)">' +
      'ou <b style="color:var(--lima)">' + brl(sub * 0.9) + '</b> à vista no Pix</p>';

    armar(caixa);
  }

  document.addEventListener('click', e => {
    const menos = e.target.closest('[data-menos]'); if (menos) return mudarQtd(+menos.dataset.menos, -1);
    const mais = e.target.closest('[data-mais]'); if (mais) return mudarQtd(+mais.dataset.mais, 1);
    const tira = e.target.closest('[data-tira]'); if (tira) return removerItem(+tira.dataset.tira);
    if (e.target.closest('[data-abre-sacola]')) { e.preventDefault(); abrirSacola(); }
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addItem(add.dataset.add, add.dataset.tam, 1); }
    const fav = e.target.closest('.card__fav');
    if (fav) { e.preventDefault(); fav.classList.toggle('on'); toast(fav.classList.contains('on') ? 'salvo nos favoritos' : 'removido dos favoritos'); }
  });

  /* ---------------- cartão de produto ---------------- */
  function cartao(p) {
    const desconto = p.de ? Math.round((1 - p.preco / p.de) * 100) : 0;
    const tags =
      (p.tag ? '<span class="badge' + (p.tag === 'últimas peças' ? ' badge--alerta' : '') + '">' + p.tag + '</span>' : '') +
      (desconto ? '<span class="badge badge--preto">-' + desconto + '%</span>' : '');

    return '<article class="card">' +
      '<a class="card__media" href="produto.html?id=' + p.id + '" aria-label="' + p.nome + '">' +
        figura('img/produtos/' + p.id + '-1.jpg', p.nome, 'ph--claro ph--a') +
        figura('img/produtos/' + p.id + '-2.jpg', p.nome + ' em modelo', 'ph--claro ph--b') +
        '<div class="card__tags">' + tags + '</div>' +
        '<button type="button" class="card__fav" aria-label="Favoritar">' + icone('coracao', 17) + '</button>' +
        '<span class="card__rapido" data-add="' + p.id + '">' + icone('raio', 15) + ' compra rápida</span>' +
      '</a>' +
      '<div class="card__info">' +
        '<a class="card__nome" href="produto.html?id=' + p.id + '">' + p.nome + '</a>' +
        '<span class="card__meta">★ ' + p.nota.toFixed(1) + ' · ' + p.avaliacoes + ' avaliações</span>' +
        '<div class="card__preco"><b>' + brl(p.preco) + '</b>' + (p.de ? '<s>' + brl(p.de) + '</s>' : '') + '</div>' +
        '<span class="card__parc">12x de ' + brl(p.preco / 12) + ' sem juros</span>' +
        (p.estoque <= 6
          ? '<div class="card__estoque"><div class="barra"><i style="width:' + (p.estoque / 20 * 100) + '%"></i></div>' +
            '<small>restam ' + p.estoque + ' unidades</small></div>' : '') +
      '</div></article>';
  }
  window.cartao = cartao;

  function pintarGrades() {
    $$('[data-grade]').forEach(el => {
      const modo = el.dataset.grade;
      let lista = PRODUTOS.slice();
      if (modo === 'destaques') lista = lista.filter(p => p.tag).concat(lista.filter(p => !p.tag)).slice(0, 8);
      if (modo === 'drop') lista = DROP.itens.map(prod).filter(Boolean);
      if (modo === 'relacionados') {
        const atual = qs('id');
        lista = lista.filter(p => p.id !== atual).sort(() => Math.random() - .5).slice(0, 4);
      }
      const limite = +el.dataset.limite || 0;
      if (limite) lista = lista.slice(0, limite);
      el.innerHTML = lista.map(cartao).join('');
      armar(el);
    });
  }

  /* ---------------- categorias ---------------- */
  function pintarCategorias() {
    const el = $('[data-categorias]'); if (!el) return;
    el.innerHTML = CATEGORIAS.map(c =>
      '<a class="cat" href="catalogo.html?cat=' + c.id + '">' + figura(c.arquivo, c.nome) +
      '<span class="cat__t"><b>' + c.nome + '</b><span>' + c.desc + '</span></span></a>').join('');
    armar(el);
  }

  /* ---------------- depoimentos e FAQ ---------------- */
  function pintarDepoimentos() {
    const el = $('[data-depoimentos]'); if (!el) return;
    el.innerHTML = DEPOIMENTOS.map(d =>
      '<article class="depo"><div style="display:flex;align-items:center;gap:10px">' +
      '<span class="estrelas">' + '★'.repeat(d.nota) + '</span>' +
      '<span class="verificado">compra verificada</span></div>' +
      '<p>“' + d.texto + '”</p>' +
      '<div class="depo__quem"><div class="depo__foto">' + figura(d.foto, d.nome, 'ph--claro') + '</div>' +
      '<div><b>' + d.nome + '</b><small>' + d.local + '</small></div></div></article>').join('');
    armar(el);
  }

  function pintarFaq() {
    const el = $('[data-faq]'); if (!el) return;
    el.innerHTML = FAQ.map((f, i) =>
      '<details' + (i === 0 ? ' open' : '') + '><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>').join('');
  }

  /* ---------------- countdown ---------------- */
  function relogio() {
    const els = $$('[data-relogio]'); if (!els.length) return;
    const alvo = Date.now() + DROP.horas * 3600 * 1000;
    const desenha = () => {
      let s = Math.max(0, Math.floor((alvo - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      const bloco = (v, r) => '<div><b>' + String(v).padStart(2, '0') + '</b><span>' + r + '</span></div>';
      els.forEach(e => { e.innerHTML = bloco(d, 'dias') + bloco(h, 'hrs') + bloco(m, 'min') + bloco(s, 'seg'); });
    };
    desenha(); setInterval(desenha, 1000);
  }

  /* ---------------- header / menu ---------------- */
  function chrome() {
    const b = $('.burger');
    if (b) b.addEventListener('click', () => {
      const on = document.body.classList.toggle('menu-on');
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    $$('.menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-on')));

    const aqui = location.pathname.split('/').pop() || 'index.html';
    $$('.nav a').forEach(a => {
      const h = (a.getAttribute('href') || '').split('?')[0];
      if (h && h === aqui) a.setAttribute('aria-current', 'page');
    });
    $$('[data-ano]').forEach(e => e.textContent = new Date().getFullYear());
  }

  /* ---------------- reveal ---------------- */
  function reveal() {
    if (!('IntersectionObserver' in window)) return $$('.rv').forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(en => en.forEach(x => {
      if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
    }), { threshold: .05, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(e => io.observe(e));
  }

  /* ---------------- boot ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    chrome();
    pintarCategorias();
    pintarGrades();
    pintarDepoimentos();
    pintarFaq();
    relogio();
    montarDrawer();
    pintarSacola();
    armar(document);
    reveal();
    if (window.paginaPronta) window.paginaPronta();
  });
})();
