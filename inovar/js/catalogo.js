/* Inovar: catálogo (vitrine) e "Minha lista", enviada para o WhatsApp da loja.
   Não é loja virtual: não há pagamento. A loja confirma preço, estoque e entrega. */
(function () {
  'use strict';
  var I = window.Inovar;
  if (!I) return;

  var ICONES = {
    'Nutrição animal': 'i-sack', 'Saúde animal': 'i-bottle', 'Pet': 'i-paw',
    'Ordenha e higiene': 'i-drop', 'Silagem': 'i-wheat', 'Equipamentos e utilidades': 'i-tool'
  };

  // ---------- Utilidades ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Texto entre colchetes vira placeholder amarelo
  function fmt(s) { return esc(s).replace(/\[[^\]]+\]/g, function (m) { return '<span class="ph">' + m + '</span>'; }); }
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function sim(v) { return v === true || /^(sim|s|true|1|x|yes)$/i.test(String(v == null ? '' : v).trim()); }
  function num(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') return v;
    var s = String(v).replace(/[R$\s]/g, '');
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function brl(n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

  // ---------- Fonte dos produtos: JSON local ou planilha do Google (CSV) ----------
  function lerCsv(txt) {
    var linhas = [], campo = '', linha = [], aspas = false;
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (aspas) {
        if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === ',') { linha.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && txt[i + 1] === '\n') i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = '';
      } else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    var cab = (linhas.shift() || []).map(function (h) { return semAcento(h).trim().replace(/\s+/g, '_'); });
    return linhas.filter(function (l) { return l.join('').trim(); }).map(function (l) {
      var o = {}; cab.forEach(function (h, k) { o[h] = (l[k] || '').trim(); }); return o;
    });
  }

  function normalizar(p, i) {
    return {
      id: p.id || 'p' + i,
      nome: p.nome || '',
      categoria: p.categoria || 'Outros',
      subcategoria: p.subcategoria || '',
      marca: p.marca || '',
      foto: p.foto || '',
      descricao: p.descricao || '',
      apresentacao: p.apresentacao || '',
      preco: num(p.preco),
      destaque: sim(p.destaque),
      ofertaDe: num(p.oferta_de),
      ofertaPor: num(p.oferta_por),
      receita: sim(p.exige_receita),
      exemplo: sim(p.exemplo)
    };
  }

  function getProdutos() {
    return I.pronto.then(function (cfg) {
      var c = cfg.catalogo || {};
      if (c.fonte === 'planilha' && c.planilha_csv) {
        return fetch(c.planilha_csv).then(function (r) { return r.text(); }).then(lerCsv);
      }
      return fetch('data/produtos.json').then(function (r) { return r.json(); });
    }).then(function (lista) { return lista.map(normalizar).filter(function (p) { return p.nome; }); });
  }
  I.getProdutos = getProdutos;

  // ---------- Estado ----------
  var produtos = [];
  var porId = {};
  var filtro = { categoria: 'Todos', busca: '' };
  var lista = I.guarda.ler('inovar.lista') || []; // [{id, qtd, nome, apresentacao}]
  var qtdCard = {};
  var LIMITE = 8;   // sem filtro, mostra os 8 primeiros e um botão para o resto
  var tudo = false;

  var grid = document.getElementById('cat-grid');
  var chips = document.getElementById('cat-chips');
  var busca = document.getElementById('cat-busca');
  var count = document.getElementById('cat-count');
  var ofertasBox = document.getElementById('cat-ofertas');
  var ofertasRow = document.getElementById('cat-ofertas-row');
  var fab = document.getElementById('fab-list');
  var fabN = document.getElementById('fab-count');

  // ---------- Card ----------
  function precoHtml(p) {
    if (p.ofertaPor != null) {
      return '<p class="prod-price">' + (p.ofertaDe != null ? '<s>' + brl(p.ofertaDe) + '</s>' : '') + brl(p.ofertaPor) + '</p>';
    }
    if (p.preco != null) return '<p class="prod-price">' + brl(p.preco) + '</p>';
    return '<p class="prod-price consultar">Consultar preço</p>';
  }

  function card(p) {
    var q = qtdCard[p.id] || 1;
    var img = p.foto
      ? '<img src="' + esc(p.foto) + '" alt="' + esc(p.nome) + '" loading="lazy" decoding="async" width="300" height="225">'
      : '<svg class="ico" aria-hidden="true"><use href="#' + (ICONES[p.categoria] || 'i-bag') + '"/></svg>';
    var tags = (p.ofertaPor != null ? '<span class="prod-tag tag-oferta">Oferta</span>' : '') +
      (p.exemplo ? '<span class="tag-ex">[EXEMPLO]</span>' : '');
    var meta = [p.apresentacao, p.marca].filter(Boolean).map(fmt).join(' · ');
    var acoes;
    if (p.receita) {
      acoes = '<span class="prod-rx"><svg class="ico" aria-hidden="true"><use href="#i-steth"/></svg> Venda com orientação veterinária</span>' +
        '<div class="prod-actions"><button type="button" class="btn btn-line btn-sm" data-rx="' + esc(p.id) + '">Consultar o veterinário</button></div>';
    } else {
      acoes = precoHtml(p) +
        '<div class="prod-actions">' +
        '<div class="qty" role="group" aria-label="Quantidade de ' + esc(p.nome) + '">' +
        '<button type="button" data-menos="' + esc(p.id) + '" aria-label="Diminuir"><svg class="ico"><use href="#i-minus"/></svg></button>' +
        '<span class="qty-n" aria-live="polite">' + q + '</span>' +
        '<button type="button" data-mais="' + esc(p.id) + '" aria-label="Aumentar"><svg class="ico"><use href="#i-plus"/></svg></button></div>' +
        '<button type="button" class="btn btn-primary btn-sm btn-add" data-add="' + esc(p.id) + '">Adicionar à lista</button></div>';
    }
    return '<article class="prod" data-id="' + esc(p.id) + '">' +
      '<div class="prod-img">' + img + tags + '</div>' +
      '<div class="prod-body"><h3 class="prod-name">' + fmt(p.nome) + '</h3>' +
      (meta ? '<p class="prod-meta">' + meta + '</p>' : '') +
      acoes + '</div></article>';
  }

  // ---------- Render ----------
  function categorias() {
    var vistas = [];
    produtos.forEach(function (p) { if (vistas.indexOf(p.categoria) < 0) vistas.push(p.categoria); });
    return ['Todos'].concat(vistas);
  }

  function renderChips() {
    chips.innerHTML = categorias().map(function (c) {
      var rot = c === 'Pet' ? 'Pet' : c;
      return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (c === filtro.categoria) + '">' + esc(rot) + '</button>';
    }).join('');
  }

  function visiveis() {
    var b = semAcento(filtro.busca).trim();
    return produtos.filter(function (p) {
      if (filtro.categoria !== 'Todos' && p.categoria !== filtro.categoria) return false;
      if (!b) return true;
      var alvo = semAcento([p.nome, p.categoria, p.subcategoria, p.marca, p.descricao, p.apresentacao].join(' '));
      return b.split(/\s+/).every(function (t) { return alvo.indexOf(t) > -1; });
    });
  }

  function renderGrid() {
    var vs = visiveis();
    var semFiltro = filtro.categoria === 'Todos' && !filtro.busca;
    var corte = semFiltro && !tudo && vs.length > LIMITE;
    grid.innerHTML = vs.length ? (corte ? vs.slice(0, LIMITE) : vs).map(card).join('') +
      (corte ? '<div class="cat-mais" style="grid-column:1/-1"><button type="button" class="btn btn-line" data-ver-tudo>Ver todos os ' + vs.length + ' produtos</button></div>' : '')
      : '<p class="empty">Não achamos esse produto aqui. A loja pode ter: <button type="button" class="btn btn-line btn-sm" data-pedir-busca>Perguntar no WhatsApp</button></p>';
    count.textContent = vs.length + (vs.length === 1 ? ' produto' : ' produtos') +
      (filtro.categoria !== 'Todos' ? ' em ' + filtro.categoria : '') + (filtro.busca ? ' para “' + filtro.busca + '”' : '');
    var ofertas = produtos.filter(function (p) { return p.ofertaPor != null && !p.receita; });
    ofertasBox.hidden = !(semFiltro && ofertas.length);
    if (!ofertasBox.hidden) ofertasRow.innerHTML = ofertas.map(card).join('');
    chips.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.cat === filtro.categoria); });
  }

  // Usado pelo calendário: filtra e leva até o catálogo
  I.filtrarCatalogo = function (categoria, termo) {
    filtro.categoria = categoria && categorias().indexOf(categoria) > -1 ? categoria : 'Todos';
    filtro.busca = termo || '';
    busca.value = filtro.busca;
    renderGrid();
    document.getElementById('produtos').scrollIntoView();
  };

  // ---------- Lista ----------
  function salvarLista() { I.guarda.gravar('inovar.lista', lista); }
  function totalItens() { return lista.reduce(function (s, i) { return s + i.qtd; }, 0); }
  function pintarFab(bump) {
    var n = totalItens();
    fab.hidden = n === 0;
    fabN.textContent = n;
    fab.setAttribute('aria-label', 'Minha lista, ' + n + (n === 1 ? ' item' : ' itens'));
    if (bump) { fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); }
  }

  function adicionar(id, qtd) {
    var p = porId[id]; if (!p) return;
    var item = lista.filter(function (i) { return i.id === id; })[0];
    if (item) item.qtd += qtd;
    else lista.push({ id: id, qtd: qtd, nome: p.nome, apresentacao: p.apresentacao });
    salvarLista(); pintarFab(true);
  }

  // Cliques no catálogo (grid e ofertas)
  function aoClicar(e) {
    var t = e.target.closest('button'); if (!t) return;
    var id;
    if ((id = t.dataset.mais) || (id = t.dataset.menos)) {
      var q = (qtdCard[id] || 1) + (t.dataset.mais ? 1 : -1);
      qtdCard[id] = Math.max(1, Math.min(999, q));
      document.querySelectorAll('.prod[data-id="' + id + '"] .qty-n').forEach(function (n) { n.textContent = qtdCard[id]; });
    } else if ((id = t.dataset.add)) {
      adicionar(id, qtdCard[id] || 1);
      qtdCard[id] = 1;
      document.querySelectorAll('.prod[data-id="' + id + '"]').forEach(function (c) {
        c.querySelector('.qty-n').textContent = 1;
        var b = c.querySelector('.btn-add');
        c.classList.add('added'); b.textContent = 'Na lista ✓';
        setTimeout(function () { c.classList.remove('added'); b.textContent = 'Adicionar à lista'; }, 1600);
      });
    } else if ((id = t.dataset.rx)) {
      var p = porId[id];
      I.destino(I.config().rotas.produto_com_receita, function (d) {
        I.abrirWa(d.numero, 'Olá, ' + d.saudacao + '! Vi no site da Inovar o produto *' + p.nome +
          (p.apresentacao ? ' (' + p.apresentacao + ')' : '') + '* e queria orientação sobre o uso.');
      });
    } else if (t.hasAttribute('data-ver-tudo')) {
      tudo = true; renderGrid();
    } else if (t.hasAttribute('data-pedir-busca')) {
      I.destino('loja', function (d) {
        I.abrirWa(d.numero, 'Olá, Inovar! Vocês têm ' + (filtro.busca || 'este produto') + '?');
      });
    }
  }
  grid.addEventListener('click', aoClicar);
  ofertasRow.addEventListener('click', aoClicar);

  chips.addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c) return;
    filtro.categoria = c.dataset.cat; renderGrid();
  });
  var tBusca;
  busca.addEventListener('input', function () {
    clearTimeout(tBusca);
    tBusca = setTimeout(function () { filtro.busca = busca.value; renderGrid(); }, 160);
  });

  // ---------- Drawer "Minha lista" ----------
  var dLista = document.getElementById('lista');
  var form = document.getElementById('lista-form');
  var ul = document.getElementById('lista-itens');
  var vazia = document.getElementById('lista-vazia');
  var erro = document.getElementById('lista-err');
  var entrega = document.getElementById('entrega-campos');

  function renderLista() {
    vazia.hidden = lista.length > 0;
    ul.innerHTML = lista.map(function (i, k) {
      return '<li class="li-item"><div><p class="li-name">' + fmt(i.nome) + '</p>' +
        (i.apresentacao ? '<p class="li-meta">' + fmt(i.apresentacao) + '</p>' : '') + '</div>' +
        '<div class="li-ctrl"><div class="qty" role="group" aria-label="Quantidade">' +
        '<button type="button" data-lmenos="' + k + '" aria-label="Diminuir"><svg class="ico"><use href="#i-minus"/></svg></button>' +
        '<span class="qty-n">' + i.qtd + '</span>' +
        '<button type="button" data-lmais="' + k + '" aria-label="Aumentar"><svg class="ico"><use href="#i-plus"/></svg></button></div>' +
        '<button type="button" class="li-rm" data-lrm="' + k + '"><svg class="ico"><use href="#i-trash"/></svg> Remover</button></div></li>';
    }).join('');
    var l = I.loja();
    form.querySelectorAll('input[name="loja"]').forEach(function (r) { r.checked = r.value === l; });
  }

  ul.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    var k;
    if ((k = t.dataset.lmais) != null) lista[k].qtd++;
    else if ((k = t.dataset.lmenos) != null) lista[k].qtd = Math.max(1, lista[k].qtd - 1);
    else if ((k = t.dataset.lrm) != null) lista.splice(+k, 1);
    salvarLista(); pintarFab(); renderLista();
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'receber') entrega.hidden = e.target.value !== 'entrega';
    if (e.target.name === 'loja') I.setLoja(e.target.value);
  });

  fab.addEventListener('click', function () { erro.hidden = true; renderLista(); I.abrir(dLista); });

  document.getElementById('lista-enviar').addEventListener('click', function () {
    var f = form.elements;
    var lojaId = (form.querySelector('input[name="loja"]:checked') || {}).value;
    var faltas = [];
    if (!lista.length) faltas.push('adicione pelo menos um produto');
    if (!lojaId) faltas.push('escolha a loja');
    if (!f.nome.value.trim()) faltas.push('diga seu nome');
    var receber = form.querySelector('input[name="receber"]:checked').value;
    if (receber === 'entrega' && !f.local.value.trim()) faltas.push('diga o endereço ou a propriedade');
    if (faltas.length) {
      erro.textContent = 'Falta pouco: ' + faltas.join(', ') + '.';
      erro.hidden = false; return;
    }
    erro.hidden = true;
    var loja = I.lojaPorId(lojaId);
    var linhas = ['Olá, Inovar! Quero fazer um pedido 🐄', '*Loja:* ' + loja.nome, '*Itens:*'];
    lista.forEach(function (i) { linhas.push('• ' + i.qtd + 'x ' + i.nome + (i.apresentacao ? ' – ' + i.apresentacao : '')); });
    linhas.push('*Receber:* ' + (receber === 'entrega'
      ? 'Entrega, ' + f.local.value.trim() + (f.comunidade.value.trim() ? ', comunidade ' + f.comunidade.value.trim() : '')
      : 'Retirar na loja'));
    linhas.push('*Nome:* ' + f.nome.value.trim());
    if (f.obs.value.trim()) linhas.push('*Obs.:* ' + f.obs.value.trim());
    I.abrirWa(loja.whatsapp, linhas.join('\n'));
    I.fechar(dLista);
  });

  // ---------- Início ----------
  pintarFab();
  getProdutos().then(function (ps) {
    produtos = ps;
    ps.forEach(function (p) { porId[p.id] = p; });
    // itens salvos de produtos que saíram do catálogo continuam na lista com o nome guardado
    renderChips(); renderGrid(); pintarFab();
  }).catch(function (e) {
    console.error('Inovar: catálogo não carregou', e);
    grid.innerHTML = '<p class="empty">Não conseguimos carregar os produtos agora. Peça direto no WhatsApp da loja.</p>';
  });
})();
