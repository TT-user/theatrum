// RAR Academia: prévia. Contato em js/config.js; planos, modalidades, espaço, dúvidas e a loja de
// suplementos em data/*.json (mudou um JSON, suba o V abaixo).
(function () {
  var V = 2;
  var OLA = 'Olá! Vim pelo site da RAR.';
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
  // Na mensagem do WhatsApp, o placeholder sai sem colchete de confirmação
  function limpo(s) { return String(s).replace(/\s*\[[^\]]+\]/g, ''); }
  function zap(msg) { return 'https://wa.me/' + RAR.whatsapp + '?text=' + encodeURIComponent(msg); }
  function reais(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }

  // ---------- links fixos de WhatsApp ----------
  function ligaZap(raiz) {
    raiz.querySelectorAll('[data-zap]').forEach(function (a) {
      a.href = zap(a.getAttribute('data-zap'));
      a.target = '_blank'; a.rel = 'noopener';
    });
  }
  ligaZap(document);

  // ---------- config ----------
  document.getElementById('ano').textContent = new Date().getFullYear();
  if (RAR.aviso) { var av = document.getElementById('aviso'); av.textContent = RAR.aviso; av.hidden = false; }
  document.getElementById('o-horario').innerHTML = RAR.horario ? RAR.horario.map(esc).join('<br>') : ph('[horário de funcionamento: dias e horas]');
  document.getElementById('r-pag').innerHTML = 'Pagamento: ' + (RAR.pagamento ? esc(RAR.pagamento) : ph('[formas de pagamento]'));
  if (RAR.cnpj) document.getElementById('r-cnpj').textContent = 'CNPJ ' + RAR.cnpj;
  document.getElementById('rota').href = RAR.rotaUrl;

  // ---------- menu ----------
  var topo = document.getElementById('topo');
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
    ['modalidades', 'planos', 'monte', 'tour', 'suplementos', 'espaco', 'porque', 'duvidas', 'como-chegar'].forEach(function (id) { ioMenu.observe(document.getElementById(id)); });
  }

  // ---------- selo girando e letreiro: só à vista e com a aba aberta ----------
  var giro = document.getElementById('giro'), letreiro = document.getElementById('letreiro');
  // Hero do computador ocupa a primeira tela inteira, com o letreiro colado embaixo: --acima é o que
  // fica em cima do hero (faixas e topo) mais o letreiro (o CSS usa só a partir de 1001 px)
  function medeAcima() {
    var h = document.getElementById('hero');
    document.documentElement.style.setProperty('--acima', Math.round(h.getBoundingClientRect().top + scrollY + letreiro.offsetHeight) + 'px');
  }
  medeAcima(); addEventListener('resize', medeAcima); addEventListener('load', medeAcima);
  if (calmo) letreiro.classList.add('parado');
  else if ('IntersectionObserver' in window) {
    var vis = { giro: false, letreiro: false };
    function anima() {
      giro.classList.toggle('gira', vis.giro && !document.hidden);
      letreiro.classList.toggle('anda', vis.letreiro && !document.hidden);
    }
    new IntersectionObserver(function (es) { vis.giro = es[0].isIntersecting; anima(); }).observe(giro);
    new IntersectionObserver(function (es) { vis.letreiro = es[0].isIntersecting; anima(); }).observe(letreiro);
    document.addEventListener('visibilitychange', anima);
  }

  // ---------- WhatsApp flutuante depois da primeira tela ----------
  var flutua = document.getElementById('zap-flutua');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { flutua.classList.toggle('ver', !es[0].isIntersecting); }).observe(document.getElementById('hero'));
  else flutua.classList.add('ver');

  // ---------- mapa e tour 360° só no clique ----------
  function iframe(src, titulo, onde) {
    var f = document.createElement('iframe');
    f.src = src; f.title = titulo; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    onde.appendChild(f); onde.classList.add('ativo');
  }
  document.getElementById('mapa-btn').addEventListener('click', function () { iframe(RAR.mapaEmbed, 'Mapa da RAR Academia', document.getElementById('mapa')); this.remove(); });
  document.getElementById('tour-btn').addEventListener('click', function () { iframe(RAR.tour360, 'Tour 360° da RAR Academia', document.getElementById('tour-tela')); this.remove(); });

  // ---------- dados ----------
  function pega(nome) { return fetch('data/' + nome + '.json?v=' + V).then(function (r) { if (!r.ok) throw new Error(nome); return r.json(); }); }
  Promise.all([pega('modalidades'), pega('planos'), pega('espaco'), pega('faq'), pega('suplementos')])
    .then(function (d) { montaMods(d[0].itens); montaPlanos(d[1]); montaQuiz(d[1]); montaGaleria(d[2].itens); montaFaq(d[3].perguntas); montaLoja(d[4]); revela(); semLazy(); })
    .catch(function (e) {
      document.getElementById('planos-grid').innerHTML = '<p class="carregando">Não consegui carregar os planos. <a href="' + zap(OLA + ' Quero saber dos planos.') + '">Pergunte no WhatsApp</a>.</p>';
      revela();
      if (window.console) console.error(e);
    });

  // ---------- modalidades ----------
  function montaMods(itens) {
    document.getElementById('mods').innerHTML = itens.map(function (m) {
      var href = m.ancora || zap(m.zap), fora = m.ancora ? '' : ' target="_blank" rel="noopener"';
      return '<article class="mod rev" id="mod-' + esc(m.id) + '">' +
        '<span class="mod__ico"><svg aria-hidden="true"><use href="#' + esc(m.icone) + '"/></svg></span>' +
        '<h3>' + esc(m.nome) + '</h3><p class="mod__linha">' + esc(m.linha) + '</p>' +
        '<p>' + txt(m.texto) + '</p>' +
        '<a class="link-seta" href="' + esc(href) + '"' + fora + '>' + esc(m.botao) + ' <svg aria-hidden="true"><use href="#i-seta"/></svg></a></article>';
    }).join('');
  }

  // ---------- planos ----------
  var P = {};
  // Preço do card: "3x R$ 180" ou "R$ 200"
  function precoPlano(p) { return (p.parcelas > 1 ? p.parcelas + 'x ' : '') + reais(p.valor); }
  function totalPlano(p) { return p.valor * (p.parcelas || 1); }
  function economia(p, d) {
    var m = P[d.mensal]; if (!m || p.parcelas < 2) return 0;
    return m.valor * p.parcelas - totalPlano(p);
  }
  function msgPlano(p) { return OLA + ' Quero ' + (/^plano/i.test(p.nome) ? 'o ' + p.nome.toLowerCase() : 'o plano ' + p.nome) + ' (' + precoPlano(p) + ').'; }

  function montaPlanos(d) {
    d.planos.forEach(function (p) { P[p.id] = p; });
    if (d.confirmar) document.getElementById('planos-fonte').hidden = false;
    // Cada card tem as mesmas cinco partes (mesmo vazias): o CSS alinha uma com a outra entre os cards
    document.getElementById('planos-grid').innerHTML = d.planos.filter(function (p) { return p.grupo === 'fixo'; }).map(function (p) {
      var eco = economia(p, d), extra;
      if (eco > 0) extra = '<p class="plano__extra">' + reais(totalPlano(p)) + ' no total: <b>' + reais(eco) + ' a menos</b> que ' + p.parcelas + ' meses no mensal.</p>';
      else if (p.id === d.mensal) extra = '<p class="plano__extra">Renova mês a mês.</p>';
      else extra = '<span></span>';
      var selo = p.selo ? '<span class="plano__selo">' + esc(p.selo) + '</span>' : '';
      return '<article class="plano' + (p.destaque ? ' plano--destaque' : '') + '" id="plano-' + esc(p.id) + '">' + selo +
        '<div class="plano__cab"><h3>' + esc(p.nome) + '</h3><p class="plano__sub">' + esc(p.sub) + '</p></div>' +
        '<p class="plano__linha">' + txt(p.linha) + '</p>' +
        '<p class="plano__preco"><b>' + esc(precoPlano(p)) + '</b><small>' + (p.parcelas > 1 ? reais(p.valor) + ' por mês' : 'por mês') + '</small></p>' +
        extra +
        '<a class="btn ' + (p.destaque ? 'btn--preto' : 'btn--linha-claro') + ' btn--cheio" href="' + zap(msgPlano(p)) + '" target="_blank" rel="noopener">Quero esse plano</a></article>';
    }).join('');

    // De passagem: semanal e diária lado a lado, com a conta de quando o semanal compensa
    var curtos = d.planos.filter(function (p) { return p.grupo === 'passagem'; });
    var sem = P.semanal, dia = P.diaria;
    var vira = sem && dia ? Math.ceil(sem.valor / dia.valor) : null;
    document.getElementById('passagem').innerHTML =
      '<div class="passagem__txt"><p class="rotulo">De passagem por Garopaba</p><h3>Férias, feriado <em>ou trabalho.</em></h3>' +
      '<p>Treine sem plano longo.' + (vira ? ' Com ' + vira + ' treinos na mesma semana, o semanal já empata com as diárias e cobre os outros dias.' : '') + '</p></div>' +
      '<ul class="passagem__lista">' + curtos.map(function (p) {
        var porDia = p.dias > 1 ? '<small>' + reais(Math.round(p.valor / p.dias * 100) / 100) + ' por dia</small>' : '<small>um dia de treino</small>';
        return '<li id="plano-' + esc(p.id) + '"><div><b>' + esc(p.nome) + '</b><span>' + txt(p.linha) + '</span></div>' +
          '<p class="passagem__preco">' + reais(p.valor) + porDia + '</p>' +
          '<a class="btn btn--amarelo" href="' + zap(msgPlano(p)) + '" target="_blank" rel="noopener">Quero a ' + esc(p.nome.toLowerCase()) + '</a></li>';
      }).join('') + '</ul>';
  }

  // ---------- monte seu plano ----------
  // As perguntas aparecem conforme as respostas; o resultado é o plano mais em conta da tabela.
  function montaQuiz(d) {
    var LETRAS = 'ABCDEF';
    var fixos = d.planos.filter(function (p) { return p.grupo === 'fixo' && p.id !== 'familia'; });
    var Q = [
      { id: 'onde', t: 'Você mora em Garopaba ou está de passagem?', dica: 'Quem está de passagem tem diária e semanal.', ops: [
        { v: 'mora', t: 'Moro aqui', s: 'ou vou ficar mais de um mês' }, { v: 'passagem', t: 'Estou de passagem', s: 'férias, feriado ou trabalho' }] },
      { id: 'quem', t: 'Vai treinar sozinho ou com a família?', dica: 'Para a família, tem plano próprio.', se: function (a) { return a.onde === 'mora'; }, ops: [
        { v: 'so', t: 'Sozinho' }, { v: 'familia', t: 'Com a família' }] },
      { id: 'tempo', t: 'Por quanto tempo quer fechar?', dica: 'Quanto mais tempo, menor a mensalidade.', se: function (a) { return a.quem === 'so'; },
        ops: fixos.map(function (p) { return { v: p.id, t: p.nome, s: precoPlano(p) + (p.parcelas > 1 ? '' : ' por mês') }; }) },
      { id: 'pessoas', t: 'Quantas pessoas vão treinar?', dica: 'Contando com você.', se: function (a) { return a.quem === 'familia'; }, ops: [
        { v: '2', t: '2 pessoas' }, { v: '3', t: '3 pessoas' }, { v: '4', t: '4 pessoas' }, { v: '5 ou mais', t: '5 ou mais' }] },
      { id: 'dias', t: 'Quantos dias vai treinar?', dica: 'O site faz a conta entre diária, semanal e mensal.', se: function (a) { return a.onde === 'passagem'; }, ops: [
        { v: '1', t: '1 dia' }, { v: '2', t: '2 dias' }, { v: '3-7', t: '3 a 7 dias', s: 'na mesma semana' }, { v: '8+', t: 'Mais de uma semana' }] }
    ];
    var form = document.getElementById('quiz'), box = document.getElementById('perguntas'), res = document.getElementById('resultado');
    box.innerHTML = Q.map(function (q) {
      return '<fieldset class="q" data-q="' + q.id + '"' + (q.se ? ' hidden' : '') + '><legend><span class="q__n">1</span>' + esc(q.t) + '</legend>' +
        '<p class="q__dica">' + esc(q.dica) + '</p><div class="opcoes opcoes--' + q.ops.length + '">' + q.ops.map(function (o, i) {
          return '<label class="op"><input type="radio" name="' + q.id + '" value="' + esc(o.v) + '"><span><b>' + LETRAS[i] + '</b>' + esc(o.t) + (o.s ? '<small>' + esc(o.s) + '</small>' : '') + '</span></label>';
        }).join('') + '</div></fieldset>';
    }).join('');

    function respostas() {
      var a = {};
      Q.forEach(function (q) {
        var f = box.querySelector('[data-q="' + q.id + '"]');
        var i = f.querySelector('input:checked');
        a[q.id] = !f.hidden && i ? i.value : null;
      });
      return a;
    }
    // Resultado: { plano, nome, preco, sub, conta, extra (linhas da mensagem) }
    function calcula(a) {
      if (a.tempo) {
        var p = P[a.tempo], eco = economia(p, d);
        return { nome: p.nome, preco: precoPlano(p), sub: p.parcelas > 1 ? reais(totalPlano(p)) + ' no total' : 'por mês',
          conta: eco > 0 ? 'São <b>' + reais(eco) + ' a menos</b> que ' + p.parcelas + ' meses no mensal (' + reais(P[d.mensal].valor) + ' por mês).' : 'Renova mês a mês. No semestral, a mensalidade cai para ' + reais(P.semestral.valor) + '.',
          msg: ['*Plano:* ' + p.nome + ' (' + p.sub + ')', '*Valor da tabela do site:* ' + precoPlano(p)] };
      }
      if (a.pessoas) {
        var f = P.familia;
        return { nome: f.nome + ' · ' + a.pessoas + (a.pessoas === '5 ou mais' ? ' pessoas' : ' pessoas'), preco: reais(f.valor), sub: 'valor da tabela',
          conta: 'A RAR confirma no WhatsApp como o plano vale para ' + (a.pessoas === '5 ou mais' ? '5 pessoas ou mais' : a.pessoas + ' pessoas') + '. ' + ph('[confirmar: valor por pessoa?]'),
          msg: ['*Plano:* ' + f.nome, '*Pessoas:* ' + a.pessoas, '*Valor da tabela do site:* ' + reais(f.valor)] };
      }
      if (a.dias) {
        var dia = P.diaria, sem = P.semanal, men = P[d.mensal];
        if (a.dias === '1') return { nome: 'Diária', preco: reais(dia.valor), sub: 'um dia', conta: 'Gostou e quer voltar? Com ' + Math.ceil(sem.valor / dia.valor) + ' dias, o semanal empata.', msg: ['*Plano:* Diária', '*Dias:* 1', '*Valor da tabela do site:* ' + reais(dia.valor)] };
        if (a.dias === '2') return { nome: '2 diárias', preco: reais(dia.valor * 2), sub: 'dois dias', conta: 'Duas diárias saem mais em conta que o semanal (' + reais(sem.valor) + ').', msg: ['*Plano:* 2 diárias', '*Dias:* 2', '*Valor da tabela do site:* ' + reais(dia.valor * 2)] };
        if (a.dias === '3-7') return { nome: 'Semanal', preco: reais(sem.valor), sub: 'sete dias', conta: 'Três diárias já dariam ' + reais(dia.valor * 3) + '. O semanal cobre os sete dias pelo mesmo valor.', msg: ['*Plano:* Semanal', '*Dias:* de 3 a 7, na mesma semana', '*Valor da tabela do site:* ' + reais(sem.valor)] };
        return { nome: 'Mensal', preco: reais(men.valor), sub: 'por mês', conta: 'Duas semanas no semanal dariam ' + reais(sem.valor * 2) + '. O mensal cobre o mês inteiro por ' + reais(men.valor) + '.', msg: ['*Plano:* Mensal', '*Tempo em Garopaba:* mais de uma semana', '*Valor da tabela do site:* ' + reais(men.valor)] };
      }
      return null;
    }

    var atual = null;
    function atualiza() {
      var a = respostas();
      Q.forEach(function (q) { if (q.se) box.querySelector('[data-q="' + q.id + '"]').hidden = !q.se(a); });
      a = respostas();
      // Numeração segue as perguntas à vista
      var n = 0; box.querySelectorAll('.q').forEach(function (f) { if (!f.hidden) f.querySelector('.q__n').textContent = ++n; });
      atual = calcula(a);
      res.hidden = !atual;
      if (!atual) return;
      document.getElementById('res-nome').textContent = atual.nome;
      document.getElementById('res-preco').innerHTML = esc(atual.preco) + '<small>' + esc(atual.sub) + '</small>';
      document.getElementById('res-conta').innerHTML = atual.conta;
      atual.origem = a.onde === 'passagem' ? 'Estou de passagem por Garopaba.' : (a.quem === 'familia' ? 'Quero treinar com a família.' : 'Moro em Garopaba.');
    }

    form.addEventListener('change', function (e) {
      // Trocou uma resposta de cima: limpa as de baixo
      var ordem = Q.map(function (q) { return q.id; }), i = ordem.indexOf(e.target.name);
      if (i > -1) ordem.slice(i + 1).forEach(function (id) { box.querySelectorAll('input[name="' + id + '"]').forEach(function (x) { x.checked = false; }); });
      atualiza();
      // Leva a próxima pergunta para a tela no celular
      var prox = [].slice.call(form.querySelectorAll('.q:not([hidden]), .resultado:not([hidden])')).filter(function (f) { return !f.querySelector('input:checked'); })[0];
      if (prox && innerWidth < 900 && prox.getBoundingClientRect().top > innerHeight * .75) prox.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'center' });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!atual) return;
      var nome = form.nome.value.trim();
      var linhas = ['Olá! Vim pelo site da RAR e montei meu plano. ' + atual.origem, ''].concat(atual.msg.map(limpo));
      if (nome) linhas.push('*Nome:* ' + nome);
      linhas.push('', 'Quero confirmar o valor e começar.');
      // Abre direto no WhatsApp, em qualquer aparelho
      window.open(zap(linhas.join('\n')), '_blank', 'noopener');
    });
  }

  // ---------- loja de suplementos ----------
  // Desenho do produto em SVG, pela forma ('tipo') e pela cor do rótulo
  function claro(hex) { var n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150; }
  function desenho(it) {
    var c = it.cor, t = claro(c) ? '#111' : '#fff', r = esc(it.rotulo), s;
    function rot(x, y, tam) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Archivo Largo, Arial Black, sans-serif" font-weight="800" font-size="' + tam + '" fill="' + t + '">' + r + '</text>'; }
    switch (it.tipo) {
      case 'pote': s = '<rect x="32" y="16" width="56" height="16" rx="4" fill="#2A2A2D"/><rect x="26" y="30" width="68" height="96" rx="12" fill="#151517"/><rect x="26" y="58" width="68" height="40" fill="' + c + '"/>' + rot(60, 84, 15); break;
      case 'pote-p': s = '<rect x="38" y="40" width="44" height="13" rx="4" fill="#2A2A2D"/><rect x="33" y="51" width="54" height="75" rx="10" fill="#151517"/><rect x="33" y="72" width="54" height="32" fill="' + c + '"/>' + rot(60, 93, 12); break;
      case 'garrafa': s = '<rect x="51" y="12" width="18" height="12" rx="3" fill="#2A2A2D"/><path d="M53 24h14v8l9 10v78a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8V42l9-10Z" fill="#151517" opacity=".9"/><rect x="44" y="64" width="32" height="34" fill="' + c + '"/>' + rot(60, 85, 10); break;
      case 'lata': s = '<rect x="40" y="22" width="40" height="104" rx="8" fill="' + c + '"/><rect x="42" y="20" width="36" height="7" rx="3" fill="#B9B9BE"/><rect x="42" y="121" width="36" height="7" rx="3" fill="#B9B9BE"/><text x="60" y="74" transform="rotate(-90 60 74)" text-anchor="middle" dominant-baseline="middle" font-family="Archivo Largo, Arial Black, sans-serif" font-weight="800" font-size="13" fill="' + t + '">' + r + '</text>'; break;
      case 'barra': s = '<g transform="rotate(-14 60 75)"><path d="M14 58l5 4-5 4 5 4-5 4 5 4-5 4h92l-5-4 5-4-5-4 5-4-5-4 5-4-5-4Z" fill="' + c + '"/><rect x="28" y="58" width="64" height="28" fill="#151517" opacity=".18"/>' + rot(60, 77, 11) + '</g>'; break;
      default: s = '<path d="M34 30h52l-3 92a6 6 0 0 1-6 6H43a6 6 0 0 1-6-6Z" fill="' + c + '"/><rect x="34" y="24" width="52" height="12" rx="2" fill="#151517"/>' + rot(60, 82, 13);
    }
    return '<svg viewBox="0 0 120 140" aria-hidden="true">' + s + '</svg>';
  }

  var CHAVE = 'rar-sacola';
  function lerSacola() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravaSacola(s) { try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch (e) { /* sem armazenamento: a sacola vale só durante a visita */ } }

  function montaLoja(d) {
    var ITENS = {}; d.itens.forEach(function (it) { ITENS[it.id] = it; });
    var sacola = lerSacola();
    // Só fica na sacola o que ainda existe no JSON
    Object.keys(sacola).forEach(function (id) { if (!ITENS[id] || !(sacola[id] > 0)) delete sacola[id]; });
    if (d.exemplo) document.getElementById('sup-exemplo').hidden = false;

    var chips = document.getElementById('chips'), prods = document.getElementById('prods');
    chips.innerHTML = [{ id: '', nome: 'Tudo' }].concat(d.categorias).map(function (c, i) {
      return '<button type="button" class="chip" data-cat="' + esc(c.id) + '" aria-pressed="' + (i === 0) + '">' + esc(c.nome) + '</button>';
    }).join('');
    function preco(it) { return it.preco == null ? ph('[preço]') : esc(reais(it.preco)); }

    function controle(it) {
      var q = sacola[it.id] || 0;
      if (!q) return '<button type="button" class="btn btn--amarelo btn--cheio" data-mais="' + esc(it.id) + '"><svg aria-hidden="true"><use href="#i-sacola"/></svg>Adicionar</button>';
      return '<div class="qtd" role="group" aria-label="Quantidade de ' + esc(it.nome) + '"><button type="button" data-menos="' + esc(it.id) + '" aria-label="Tirar um">−</button><span aria-live="polite">' + q + '</span><button type="button" data-mais="' + esc(it.id) + '" aria-label="Pôr mais um">+</button></div>';
    }
    function montaProds() {
      prods.innerHTML = d.itens.map(function (it) {
        return '<article class="prod rev" data-cat="' + esc(it.cat) + '" id="prod-' + esc(it.id) + '">' +
          '<div class="prod__img">' + desenho(it) + (d.exemplo ? '<span class="prod__ex">exemplo</span>' : '') + '</div>' +
          '<p class="prod__cat">' + esc((d.categorias.filter(function (c) { return c.id === it.cat; })[0] || {}).nome || '') + '</p>' +
          '<h3>' + esc(it.nome) + '</h3>' +
          '<p class="prod__marca">' + (it.marca ? esc(it.marca) : ph('[marca]')) + ' · ' + esc(it.tamanho).replace(/ (g|ml)\b/g, '&nbsp;$1') + '</p>' +
          '<p class="prod__linha">' + esc(it.linha) + '</p>' +
          '<p class="prod__preco">' + preco(it) + '</p>' +
          '<div class="prod__acao">' + controle(it) + '</div></article>';
      }).join('');
    }
    montaProds();

    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      filtra(b.dataset.cat);
    });
    function filtra(cat) {
      chips.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.cat === cat)); });
      prods.querySelectorAll('.prod').forEach(function (p) { p.hidden = !!cat && p.dataset.cat !== cat; });
    }

    var lista = document.getElementById('sacola-itens'), form = document.getElementById('sacola-form');
    function soma() {
      var ids = Object.keys(sacola), n = 0, total = 0, conhecido = true;
      ids.forEach(function (id) { n += sacola[id]; if (ITENS[id].preco == null) conhecido = false; else total += ITENS[id].preco * sacola[id]; });
      return { ids: ids, n: n, total: total, conhecido: conhecido };
    }
    function montaSacola() {
      var s = soma();
      document.getElementById('sacola-n').textContent = s.n;
      form.hidden = !s.n;
      if (!s.n) {
        // Estado vazio que vende: dois caminhos
        lista.innerHTML = '<div class="sacola__vazia"><p>A sacola está vazia. Escolha ao lado ou pergunte o que chegou na prateleira.</p>' +
          '<button type="button" class="link-seta" data-filtro="proteina">Ver as proteínas <svg aria-hidden="true"><use href="#i-seta"/></svg></button>' +
          '<a class="link-seta" href="' + zap(OLA + ' O que tem hoje na loja de suplementos da recepção?') + '" target="_blank" rel="noopener">Perguntar o que tem hoje <svg aria-hidden="true"><use href="#i-seta"/></svg></a></div>';
        return;
      }
      lista.innerHTML = '<ul class="sacola__lista">' + s.ids.map(function (id) {
        var it = ITENS[id];
        return '<li><span><b>' + esc(it.nome) + '</b><small>' + esc(it.tamanho) + ' · ' + (it.preco == null ? ph('[preço]') : esc(reais(it.preco * sacola[id]))) + '</small></span>' + controle(it) + '</li>';
      }).join('') + '</ul>';
      document.getElementById('sacola-total').innerHTML = s.conhecido ? 'Total: <b>' + esc(reais(s.total)) + '</b>' : 'Total: ' + ph('[a RAR confirma os preços]');
    }
    montaSacola();

    function muda(id, dq) {
      sacola[id] = Math.max(0, Math.min(20, (sacola[id] || 0) + dq));
      if (!sacola[id]) delete sacola[id];
      gravaSacola(sacola);
      var card = document.querySelector('#prod-' + id + ' .prod__acao');
      if (card) card.innerHTML = controle(ITENS[id]);
      montaSacola();
    }
    document.getElementById('suplementos').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mais], [data-menos], [data-filtro]'); if (!b) return;
      if (b.dataset.filtro) return filtra(b.dataset.filtro);
      muda(b.dataset.mais || b.dataset.menos, b.dataset.mais ? 1 : -1);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = soma(); if (!s.n) return;
      var obs = form.obs.value.trim(), nome = form.nome.value.trim(), quando = form.querySelector('input[name=quando]:checked').value;
      var linhas = ['Olá! Vim pelo site da RAR e quero separar na loja da recepção:', ''];
      s.ids.forEach(function (id) { var it = ITENS[id]; linhas.push('• ' + sacola[id] + 'x ' + it.nome + (it.marca ? ' ' + it.marca : '') + ' (' + it.tamanho + ')'); });
      linhas.push('');
      if (s.conhecido) linhas.push('*Total do site:* ' + reais(s.total));
      linhas.push('*Retirada:* ' + quando + ', na recepção');
      if (obs) linhas.push('*Observação:* ' + obs);
      if (nome) linhas.push('*Nome:* ' + nome);
      linhas.push('', 'Pode deixar separado?');
      window.open(zap(linhas.join('\n')), '_blank', 'noopener');
    });
  }

  // ---------- galeria + foto ampliada ----------
  var LISTA = [];
  function selo(f) { return f.tipo === 'projeto' ? '<span class="selo-projeto">Imagem do projeto</span>' : ''; }
  function montaGaleria(itens) {
    LISTA = itens;
    var gal = document.getElementById('galeria');
    gal.innerHTML = itens.map(function (f, i) {
      var srcset = f.larguras.map(function (w) { return 'assets/fotos/' + f.foto + '-' + w + '.webp ' + w + 'w'; }).join(', ');
      return '<button type="button" class="foto rev" data-i="' + i + '" aria-label="Ampliar: ' + esc(f.titulo) + '">' +
        '<img src="assets/fotos/' + f.foto + '-' + f.larguras[0] + '.webp" srcset="' + srcset + '" sizes="(min-width: 900px) ' + (i === 0 ? '40vw' : '30vw') + ', ' + (i === 0 ? '100vw' : '50vw') + '" width="' + f.w + '" height="' + f.h + '" loading="lazy" alt="' + esc(f.alt) + '">' +
        selo(f) + '<span class="foto__leg">' + esc(f.titulo) + '</span></button>';
    }).join('');
    gal.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) abreLuz(+b.dataset.i, b); });
  }
  var luz = document.getElementById('luz'), luzI = 0, luzVolta;
  function mostraLuz() {
    var f = LISTA[luzI], w = f.larguras[f.larguras.length - 1], img = luz.querySelector('img');
    img.src = 'assets/fotos/' + f.foto + '-' + w + '.webp'; img.alt = f.alt; img.width = f.w; img.height = f.h;
    luz.querySelector('figcaption').textContent = f.titulo + (f.tipo === 'projeto' ? ' · imagem do projeto' : '');
  }
  function abreLuz(i, origem) { luzI = i; luzVolta = origem; mostraLuz(); luz.hidden = false; document.body.style.overflow = 'hidden'; luz.querySelector('.luz__x').focus(); }
  function fechaLuz() { luz.hidden = true; document.body.style.overflow = ''; if (luzVolta) luzVolta.focus(); }
  function passa(d) { luzI = (luzI + d + LISTA.length) % LISTA.length; mostraLuz(); }
  luz.addEventListener('click', function (e) {
    var b = e.target.closest('[data-luz]');
    if (!b) { if (e.target === luz) fechaLuz(); return; }
    if (b.dataset.luz === 'x') return fechaLuz();
    passa(+b.dataset.luz);
  });
  document.addEventListener('keydown', function (e) {
    if (luz.hidden) return;
    if (e.key === 'Escape') fechaLuz();
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') passa(e.key === 'ArrowRight' ? 1 : -1);
  });
  var x0 = null;
  luz.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  luz.addEventListener('touchend', function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) passa(dx < 0 ? 1 : -1);
  });

  // ---------- dúvidas ----------
  function montaFaq(PERGUNTAS) {
    function troca(s) {
      return s.replace('{horario}', RAR.horario ? RAR.horario.join(' · ') : '[horário de funcionamento: dias e horas]')
        .replace('{pagamento}', RAR.pagamento || '[formas de pagamento: dinheiro, Pix, cartão?]');
    }
    document.getElementById('faq').innerHTML = PERGUNTAS.map(function (q, i) {
      return '<details id="faq-' + esc(q.id) + '"' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.p) + '</summary><p>' + txt(troca(q.r)) + '</p></details>';
    }).join('');
    // Âncora do rodapé abre a pergunta
    function abreHash() { var d = location.hash && document.getElementById(location.hash.slice(1)); if (d && d.tagName === 'DETAILS') d.open = true; }
    addEventListener('hashchange', abreHash); abreHash();
  }

  // ---------- entrada suave ----------
  function revela() {
    var todos = document.querySelectorAll('.cab, .fatos li, .vozes > div, .monte__txt, .quiz, .tour__txt, .tour__tela, .onde__txt, .mapa, .rev');
    todos.forEach(function (el) { el.classList.add('rev'); });
    if (calmo || !('IntersectionObserver' in window)) { todos.forEach(function (el) { el.classList.add('ok'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('ok'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    todos.forEach(function (el) { io.observe(el); });
  }
})();
