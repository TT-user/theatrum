/* ============================================================
   Reserva Aurora — comportamento da página
   Três sistemas, nesta ordem de importância:
   1. o espelho de unidades (grade de andares + ficha)
   2. o simulador de financiamento, alimentado pela unidade escolhida
   3. o filme do hero, que só liga se os mp4 existirem
   ============================================================ */
(function () {
  'use strict';

  /* ---------- o prédio ----------
     Uma torre, 12 andares, 4 posições por andar. As posições 01 e 04
     são o tipo A (2 quartos), as 02 e 03 são o tipo B (3 quartos), e o
     12º andar inteiro é cobertura.

     O status vem de uma tabela escrita à mão, uma linha por andar:
     D = disponível, R = reservado, V = vendido. Escrever assim, e não
     sortear, é o que permite o padrão realista de um lançamento em
     andamento — os andares baixos saem primeiro, os altos sobram. */
  var STATUS = {
    1:'VVVV',  2:'VVVV',  3:'VVRV',  4:'VVVD',
    5:'VDVV',  6:'DVVD',  7:'VDDV',  8:'DVRD',
    9:'DDVD', 10:'DRDD', 11:'DDDR', 12:'DRDD'
  };

  var TIPOS = {
    A:{ nome:'Tipo A · 2 quartos', area:68,  quartos:2, suites:1, vagas:1, varanda:'6,4 m²',  base:420000, porAndar:8000 },
    B:{ nome:'Tipo B · 3 quartos', area:86,  quartos:3, suites:1, vagas:1, varanda:'9,1 m²',  base:530000, porAndar:10000 },
    C:{ nome:'Cobertura · 3 quartos', area:104, quartos:3, suites:1, vagas:2, varanda:'terraço de 32 m²', base:880000, porAndar:0 }
  };

  var ROTULO = { D:'Disponível', R:'Reservado', V:'Vendido' };
  var CLASSE = { D:'disp', R:'res', V:'vend' };
  var ZAP = '5532977770000';

  var UNIDADES = [];
  for (var andar = 12; andar >= 1; andar--) {
    for (var pos = 1; pos <= 4; pos++) {
      var letra = andar === 12 ? 'C' : (pos === 1 || pos === 4 ? 'A' : 'B');
      var tipo = TIPOS[letra];
      UNIDADES.push({
        num: andar + '0' + pos,
        andar: andar,
        pos: pos,
        letra: letra,
        tipo: tipo,
        status: STATUS[andar].charAt(pos - 1),
        preco: tipo.base + (andar - 1) * tipo.porAndar
      });
    }
  }

  var moeda = new Intl.NumberFormat('pt-BR', {
    style:'currency', currency:'BRL', maximumFractionDigits:0
  });

  /* ---------- espelho ---------- */
  var espelho = document.getElementById('espelho');
  var escolhida = null;

  function doAndar(a) {
    return UNIDADES.filter(function (u) { return u.andar === a; });
  }

  if (espelho) {
    for (var a = 12; a >= 1; a--) {
      var linha = document.createElement('div');
      linha.className = 'andar';
      linha.setAttribute('role', 'row');
      linha.innerHTML = '<span class="andar-nome">' + (a === 12 ? 'cob.' : a + 'º') + '</span>';

      doAndar(a).forEach(function (u) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'unidade ' + CLASSE[u.status];
        b.setAttribute('role', 'gridcell');
        b.setAttribute('aria-label', 'Unidade ' + u.num + ', ' + u.tipo.nome + ', ' + ROTULO[u.status]);
        b.innerHTML = '<b>' + u.num + '</b><span>' + u.letra + '</span>';
        b.addEventListener('click', function () { escolhe(u, b); });
        linha.appendChild(b);
      });

      espelho.appendChild(linha);
    }
  }

  var fichaVazia = document.getElementById('fichaVazia');
  var fichaCorpo = document.getElementById('fichaCorpo');
  var fichaTag = document.getElementById('fichaTag');
  var fichaNum = document.getElementById('fichaNum');
  var fichaTipo = document.getElementById('fichaTipo');
  var fichaDados = document.getElementById('fichaDados');
  var fichaPreco = document.getElementById('fichaPreco');
  var fichaZap = document.getElementById('fichaZap');

  function escolhe(u, botao) {
    escolhida = u;
    document.querySelectorAll('.unidade.escolhida').forEach(function (o) { o.classList.remove('escolhida'); });
    botao.classList.add('escolhida');

    fichaVazia.hidden = true;
    fichaCorpo.hidden = false;
    fichaTag.textContent = ROTULO[u.status];
    fichaTag.className = 'ficha-tag ' + CLASSE[u.status];
    fichaNum.textContent = 'Unidade ' + u.num;
    fichaTipo.textContent = u.tipo.nome;

    fichaDados.innerHTML = [
      ['Andar', u.andar === 12 ? 'Cobertura' : u.andar + 'º andar'],
      ['Área privativa', u.tipo.area + ' m²'],
      ['Quartos', u.tipo.quartos + ' (sendo ' + u.tipo.suites + ' suíte)'],
      ['Vagas', u.tipo.vagas],
      ['Varanda', u.tipo.varanda],
      ['Posição', 'final ' + ('0' + u.pos).slice(-2)]
    ].map(function (l) {
      return '<div><dt>' + l[0] + '</dt><dd>' + l[1] + '</dd></div>';
    }).join('');

    /* unidade vendida não mostra preço: divulgar o valor de quem já
       comprou não serve a ninguém e atrapalha a negociação do resto */
    if (u.status === 'V') {
      fichaPreco.innerHTML = 'Vendida<small>fale conosco sobre unidades semelhantes</small>';
      fichaZap.textContent = 'Ver unidades parecidas';
    } else {
      fichaPreco.innerHTML = moeda.format(u.preco) +
        '<small>tabela de agosto de 2026 · valores sujeitos a reajuste pelo INCC</small>';
      fichaZap.textContent = u.status === 'R' ? 'Entrar na fila desta unidade' : 'Reservar esta unidade';
    }

    var msg = 'Olá! Vi a unidade ' + u.num + ' (' + u.tipo.nome + ', ' + u.tipo.area +
      ' m²) no site do Reserva Aurora. Podemos conversar?';
    fichaZap.setAttribute('href', 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg));

    /* a unidade escolhida trava o valor do simulador: é o que
       transforma dois blocos separados num sistema só */
    if (u.status !== 'V') travaValor(u);
  }

  /* ---------- simulador ---------- */
  var valor = document.getElementById('valor');
  var entrada = document.getElementById('entrada');
  var prazo = document.getElementById('prazo');
  var juros = document.getElementById('juros');
  var valorRotulo = document.getElementById('valorRotulo');
  var valorFonte = document.getElementById('valorFonte');
  var entradaRotulo = document.getElementById('entradaRotulo');
  var entradaValor = document.getElementById('entradaValor');
  var prazoRotulo = document.getElementById('prazoRotulo');
  var jurosRotulo = document.getElementById('jurosRotulo');
  var saidaParcela = document.getElementById('saidaParcela');
  var saidaEntrada = document.getElementById('saidaEntrada');
  var saidaFinanciado = document.getElementById('saidaFinanciado');
  var saidaTotal = document.getElementById('saidaTotal');
  var saidaRenda = document.getElementById('saidaRenda');
  var simZap = document.getElementById('simZap');

  function travaValor(u) {
    valor.value = Math.min(Math.max(u.preco, valor.min), valor.max);
    valorFonte.textContent = 'Valor da unidade ' + u.num + ', direto da tabela.';
    calcula();
  }

  /* Tabela Price: parcela fixa, juros sobre o saldo devedor.
     A taxa anunciada é anual e vira mensal pela equivalência
     composta — que é como o contrato calcula, e não dividindo
     por 12, que subestimaria a parcela. */
  function calcula() {
    var pv = parseInt(valor.value, 10);
    var pctEntrada = parseInt(entrada.value, 10);
    var n = parseInt(prazo.value, 10);
    var taxaAno = parseFloat(juros.value);

    var vEntrada = Math.round(pv * pctEntrada / 100);
    var financiado = pv - vEntrada;
    var i = Math.pow(1 + taxaAno / 100, 1 / 12) - 1;
    var parcela = financiado * i / (1 - Math.pow(1 + i, -n));
    var total = parcela * n + vEntrada;
    var renda = parcela / 0.30;

    valorRotulo.textContent = moeda.format(pv);
    entradaRotulo.textContent = pctEntrada + '%';
    entradaValor.textContent = moeda.format(vEntrada) + ' de entrada.';
    prazoRotulo.textContent = n + ' meses';
    jurosRotulo.textContent = taxaAno.toFixed(1).replace('.', ',') + '%';

    saidaParcela.textContent = moeda.format(parcela);
    saidaEntrada.textContent = moeda.format(vEntrada);
    saidaFinanciado.textContent = moeda.format(financiado);
    saidaTotal.textContent = moeda.format(total);
    saidaRenda.textContent = moeda.format(renda);

    var msg = 'Olá! Simulei no site do Reserva Aurora: imóvel de ' + moeda.format(pv) +
      ', entrada de ' + moeda.format(vEntrada) + ' (' + pctEntrada + '%), ' + n +
      ' meses a ' + taxaAno.toFixed(1).replace('.', ',') + '% ao ano — parcela de ' +
      moeda.format(parcela) + (escolhida ? '. Unidade ' + escolhida.num + '.' : '.');
    simZap.setAttribute('href', 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg));
  }

  if (valor) {
    [valor, entrada, prazo, juros].forEach(function (el) {
      el.addEventListener('input', calcula);
    });
    calcula();
  }

  /* ---------- contagem do hero sai da própria tabela ----------
     Se o espelho e o número do hero discordarem, a página perde a
     credibilidade na primeira conferida — e é justamente aqui que
     o visitante confere. */
  var heroDisp = document.getElementById('heroDisp');
  if (heroDisp) {
    heroDisp.textContent = UNIDADES.filter(function (u) { return u.status === 'D'; }).length;
  }

  /* ---------- abas das plantas ---------- */
  var abas = document.querySelectorAll('.aba-planta');
  abas.forEach(function (aba) {
    aba.addEventListener('click', function () {
      abas.forEach(function (o) {
        o.classList.remove('ativa');
        o.setAttribute('aria-selected', 'false');
        document.getElementById('planta-' + o.dataset.planta).hidden = true;
      });
      aba.classList.add('ativa');
      aba.setAttribute('aria-selected', 'true');
      document.getElementById('planta-' + aba.dataset.planta).hidden = false;
    });
  });

  /* ---------- topo, menu, whatsapp ---------- */
  var topo = document.querySelector('.topo');
  function vigiaTopo() { topo.classList.toggle('rolou', window.scrollY > 24); }
  vigiaTopo();
  window.addEventListener('scroll', vigiaTopo, { passive:true });

  var abre = document.querySelector('.abre-menu');
  var menu = document.querySelector('.menu');
  abre.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    abre.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('aberto');
      abre.setAttribute('aria-expanded', 'false');
    }
  });

  var zap = document.querySelector('.whatsapp-float');
  function vigiaZap() { zap.classList.toggle('on', window.scrollY > window.innerHeight * 0.6); }
  vigiaZap();
  window.addEventListener('scroll', vigiaZap, { passive:true });

  /* ---------- entrada ao rolar ---------- */
  var alvos = document.querySelectorAll('.cab, .empre-in > div, .lazer article, .obra-etapas, .local-in > div, .cadastro-cartao');
  alvos.forEach(function (el) { el.classList.add('rv'); });
  if ('IntersectionObserver' in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('vis'); }, i * 70);
        olho.unobserve(e.target);
      });
    }, { threshold:.16, rootMargin:'0px 0px -8% 0px' });
    alvos.forEach(function (el) { olho.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('vis'); });
  }

  /* ============================================================
     Filme do hero
     Sequência de clipes curtos que se cruzam em fade e voltam ao
     primeiro no fim. Dois elementos <video> alternam entre "o que
     está tocando" e "o que já está carregado esperando a vez".

     Só liga quando o primeiro arquivo carrega de verdade. Enquanto
     os mp4 não estiverem em img/video/, a foto do hero permanece
     e a página não muda em nada.
     ============================================================ */
  var caixa = document.querySelector('.hero-filme');
  if (!caixa || !caixa.dataset.srcs) return;

  var conexao = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var economiza = conexao && (conexao.saveData || /2g/.test(conexao.effectiveType || ''));
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* no celular o filme custa dados e bateria e ganha pouco: a tela é
     pequena demais para o movimento lento aparecer */
  if (economiza || menosMovimento || window.innerWidth < 760) return;

  var lista = caixa.dataset.srcs.split(',');
  var CRUZA = 0.7; // segundos de sobreposição, igual à transição do CSS
  var hero = document.querySelector('.hero');
  var i = 0, trocando = false;

  function novoVideo() {
    var v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    caixa.appendChild(v);
    return v;
  }

  var atual = novoVideo();
  var proximo = novoVideo();

  function carrega(v, indice) {
    v.src = lista[indice % lista.length];
    v.load();
  }

  function toca(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  function troca() {
    if (trocando) return;
    trocando = true;
    i = (i + 1) % lista.length;
    proximo.classList.add('pronto');
    atual.classList.remove('pronto');
    toca(proximo);
    var saindo = atual;
    atual = proximo;
    proximo = saindo;
    setTimeout(function () {
      saindo.pause();
      carrega(saindo, i + 1);
      trocando = false;
    }, CRUZA * 1000);
  }

  function vigia() {
    if (!atual.duration || isNaN(atual.duration)) return;
    if (atual.currentTime >= atual.duration - CRUZA) troca();
  }

  function comeca() {
    hero.classList.add('com-filme');
    atual.classList.add('pronto');
    toca(atual);
    carrega(proximo, 1);
    setInterval(vigia, 120);
  }

  /* o vídeo só assume a tela depois de ter dados suficientes; se o
     arquivo não existir, nada disso dispara e a foto fica */
  var ligou = false;
  ['loadeddata', 'canplay', 'playing'].forEach(function (ev) {
    atual.addEventListener(ev, function () {
      if (ligou) return;
      ligou = true;
      comeca();
    });
  });

  window.addEventListener('load', function () {
    setTimeout(function () { carrega(atual, 0); }, 500);
  });
})();
