/* ============================================================
   Vértice — comportamento da página
   Dois sistemas:
   1. o cofre da carteira reservada (código libera imóveis fora do site)
   2. a agenda de visitas em três passos, com resumo ao lado
   ============================================================ */
(function () {
  'use strict';

  var ZAP = '5532966660000';

  /* ---------- carteira ----------
     Sete abertos e quatro reservados: exatamente o que o hero e o
     texto das seções prometem. Se os números discordarem, a página
     perde a credibilidade justamente onde ela mais precisa dela. */
  var ABERTOS = [
    { id:'V-118', local:'Alto dos Passos', titulo:'Casa modernista de 1974, restaurada',
      texto:'Projeto original preservado, com esquadrias de madeira refeitas e instalações novas. Terreno de 900 m² com mata nos fundos.',
      area:412, quartos:4, suites:3, vagas:4, preco:3200000 },
    { id:'V-121', local:'Cascatinha', titulo:'Casa em condomínio com vista para a serra',
      texto:'Térrea, planta em L voltada ao poente, piscina aquecida e casa de hóspedes independente.',
      area:368, quartos:4, suites:4, vagas:4, preco:2750000 },
    { id:'V-124', local:'Bom Pastor', titulo:'Cobertura duplex com 180 m² de terraço',
      texto:'Último andar de um prédio de oito unidades. Terraço com pergolado, ofurô e churrasqueira a lenha.',
      area:296, quartos:3, suites:3, vagas:3, preco:2380000 },
    { id:'V-127', local:'Granbery', titulo:'Apartamento de andar inteiro, 1 por andar',
      texto:'Prédio de 2019 com seis unidades. Living de 62 m², adega climatizada e vaga para quatro carros.',
      area:248, quartos:3, suites:3, vagas:4, preco:1980000 },
    { id:'V-131', local:'Estrada de Chapéu D’Uvas', titulo:'Sítio de 4,2 hectares com lago',
      texto:'Sede de 320 m² reformada em 2023, curral, pomar formado e nascente própria com outorga.',
      area:320, quartos:5, suites:2, vagas:6, preco:2650000 },
    { id:'V-134', local:'Alto dos Passos', titulo:'Casa de pedra e vidro, projeto assinado',
      texto:'Quatro pavimentos acompanhando o declive, elevador interno e laje técnica preparada para painel solar.',
      area:455, quartos:4, suites:4, vagas:5, preco:4100000 },
    { id:'V-138', local:'Centro', titulo:'Conjunto comercial de 420 m² em prédio histórico',
      texto:'Andar inteiro com pé-direito de 4,10 m, restaurado com aprovação do patrimônio. Renda atual de R$ 18 mil.',
      area:420, quartos:0, suites:0, vagas:6, preco:2900000 }
  ];

  var RESERVADOS = [
    { id:'R-04', local:'Cascatinha', titulo:'Casa de 620 m² em terreno de 3.000 m²',
      texto:'Venda por mudança de país. O proprietário pede que fotos internas não circulem e que a visita seja agendada com 48 horas.',
      area:620, quartos:5, suites:5, vagas:6, preco:5400000 },
    { id:'R-07', local:'Alto dos Passos', titulo:'Casarão de 1910 com projeto de restauro aprovado',
      texto:'Inventário em fase final. Acompanha o projeto executivo de restauro e o orçamento de duas construtoras.',
      area:540, quartos:6, suites:2, vagas:3, preco:2900000 },
    { id:'R-09', local:'Serra de Petrópolis', titulo:'Casa de campo com heliponto e 8 hectares',
      texto:'Fora de qualquer portal por decisão da família. Documentação completa disponível sob NDA.',
      area:710, quartos:6, suites:6, vagas:8, preco:8900000 },
    { id:'R-12', local:'Granbery', titulo:'Prédio inteiro de seis apartamentos, com renda',
      texto:'Venda em bloco por dissolução de sociedade. Rentabilidade atual de 0,62% ao mês, contratos em dia.',
      area:1180, quartos:0, suites:0, vagas:8, preco:6200000 }
  ];

  var moeda = new Intl.NumberFormat('pt-BR', {
    style:'currency', currency:'BRL', maximumFractionDigits:0
  });

  function specs(im) {
    var t = ['<span>' + im.area + ' m²</span>'];
    if (im.quartos) t.push('<span>' + im.quartos + ' quartos</span>');
    if (im.suites) t.push('<span>' + im.suites + ' suítes</span>');
    if (im.vagas) t.push('<span>' + im.vagas + ' vagas</span>');
    return t.join('');
  }

  function cartao(im, reservado) {
    var msg = 'Olá! Tenho interesse no imóvel ' + im.id + ' — ' + im.titulo + '.';
    return '<a class="imovel" href="https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg) + '">' +
      '<figure class="foto" data-ph="img/' + im.id.toLowerCase() + '.jpg · 1200×900">' +
        '<img src="img/' + im.id.toLowerCase() + '.jpg" alt="' + im.titulo + ' — ' + im.local + '">' +
      '</figure>' +
      '<div class="imovel-corpo">' +
        (reservado ? '<span class="imovel-selo reservado">Reservado · ' + im.id + '</span>'
                   : '<span class="imovel-local">' + im.local + ' · ' + im.id + '</span>') +
        '<h3>' + im.titulo + '</h3>' +
        '<p>' + im.texto + '</p>' +
        '<div class="imovel-specs">' + specs(im) + '</div>' +
        '<p class="imovel-preco">' + moeda.format(im.preco) + '</p>' +
      '</div>' +
    '</a>';
  }

  var carteiraGrade = document.getElementById('carteiraGrade');
  if (carteiraGrade) {
    carteiraGrade.innerHTML = ABERTOS.map(function (im) { return cartao(im, false); }).join('');
  }

  /* ============================================================
     Cofre da carteira reservada
     Num site real o código é conferido no servidor e os imóveis
     só descem depois disso. Aqui a lista já está na página, e a
     tela diz isso na dica — fingir segurança numa demonstração
     seria ensinar errado.
     ============================================================ */
  var CODIGOS = ['VERTICE26'];
  var porta = document.getElementById('cofrePorta');
  var dentro = document.getElementById('cofreDentro');
  var campoCodigo = document.getElementById('codigo');
  var erro = document.getElementById('cofreErro');
  var sair = document.getElementById('cofreSair');
  var reservadaGrade = document.getElementById('reservadaGrade');

  if (porta) {
    porta.addEventListener('submit', function (e) {
      e.preventDefault();
      var dado = (campoCodigo.value || '').trim().toUpperCase();
      if (CODIGOS.indexOf(dado) === -1) {
        erro.hidden = false;
        campoCodigo.focus();
        campoCodigo.select();
        return;
      }
      erro.hidden = true;
      reservadaGrade.innerHTML = RESERVADOS.map(function (im) { return cartao(im, true); }).join('');
      porta.hidden = true;
      dentro.hidden = false;
      dentro.scrollIntoView({ behavior:'smooth', block:'start' });
    });

    /* limpa o aviso assim que a pessoa recomeça a digitar: manter o
       erro na tela enquanto ela corrige é ruído */
    campoCodigo.addEventListener('input', function () { erro.hidden = true; });

    sair.addEventListener('click', function () {
      dentro.hidden = true;
      porta.hidden = false;
      campoCodigo.value = '';
      porta.scrollIntoView({ behavior:'smooth', block:'center' });
    });
  }

  /* ============================================================
     Agenda de visitas
     Três escolhas e um resumo. Os dias são calculados a partir de
     hoje, e não escritos à mão: uma agenda com data fixa envelhece
     e passa a mostrar dia que já passou.
     ============================================================ */
  var CORRETORES = { 'V-118':'Helena Prado', 'V-121':'Marcos Aleixo', 'V-124':'Helena Prado',
    'V-127':'Marcos Aleixo', 'V-131':'Marcos Aleixo', 'V-134':'Helena Prado', 'V-138':'Helena Prado' };
  var HORAS = ['09:00', '11:00', '14:00', '16:00', '18:00'];
  var DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var agendaImoveis = document.getElementById('agendaImoveis');
  var agendaDias = document.getElementById('agendaDias');
  var agendaHoras = document.getElementById('agendaHoras');
  var resumo = document.getElementById('agendaResumo');
  var resImovel = document.getElementById('resImovel');
  var resDia = document.getElementById('resDia');
  var resHora = document.getElementById('resHora');
  var resCorretor = document.getElementById('resCorretor');
  var resZap = document.getElementById('resZap');

  var escolha = { imovel:null, dia:null, hora:null };

  /* próximos seis dias úteis a partir de amanhã: visita no mesmo dia
     não dá tempo de avisar o proprietário */
  var dias = [];
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dias.length < 6) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) dias.push(new Date(d));
  }

  /* ocupação fictícia, mas estável: derivada da data e da hora, para
     o mesmo horário aparecer ocupado a cada recarga da página em vez
     de piscar aleatoriamente */
  function ocupado(data, hora) {
    var semente = data.getDate() * 7 + HORAS.indexOf(hora) * 3 + data.getMonth();
    return semente % 5 === 0;
  }

  function botao(classe, principal, secundario) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'opc ' + classe;
    b.innerHTML = '<strong>' + principal + '</strong><span>' + secundario + '</span>';
    return b;
  }

  if (agendaImoveis) {
    ABERTOS.forEach(function (im) {
      var b = botao('', im.local, im.id + ' · ' + im.area + ' m²');
      b.addEventListener('click', function () {
        escolha.imovel = im;
        marca(agendaImoveis, b);
        pintaHoras();
        atualiza();
      });
      agendaImoveis.appendChild(b);
    });

    dias.forEach(function (data) {
      var b = botao('dia', String(data.getDate()), DIAS_SEMANA[data.getDay()] + ' · ' + MESES[data.getMonth()]);
      b.addEventListener('click', function () {
        escolha.dia = data;
        escolha.hora = null;
        marca(agendaDias, b);
        pintaHoras();
        atualiza();
      });
      agendaDias.appendChild(b);
    });

    pintaHoras();
  }

  function marca(caixa, alvo) {
    caixa.querySelectorAll('.opc').forEach(function (o) { o.classList.remove('on'); });
    alvo.classList.add('on');
  }

  function pintaHoras() {
    agendaHoras.innerHTML = '';
    HORAS.forEach(function (h) {
      /* sem dia escolhido não há como saber o que está livre; os
         horários aparecem desligados em vez de sumirem, para a
         pessoa ver de saída que a agenda tem cinco janelas */
      var livre = escolha.dia ? !ocupado(escolha.dia, h) : false;
      var b = botao('hora', h, escolha.dia ? (livre ? 'livre' : 'ocupado') : 'escolha o dia');
      b.disabled = !livre;
      if (livre) {
        b.addEventListener('click', function () {
          escolha.hora = h;
          marca(agendaHoras, b);
          atualiza();
        });
      }
      if (escolha.hora === h) b.classList.add('on');
      agendaHoras.appendChild(b);
    });
  }

  function atualiza() {
    resImovel.textContent = escolha.imovel ? escolha.imovel.local + ' · ' + escolha.imovel.id : '—';
    resDia.textContent = escolha.dia
      ? DIAS_SEMANA[escolha.dia.getDay()] + ', ' + escolha.dia.getDate() + ' de ' + MESES[escolha.dia.getMonth()]
      : '—';
    resHora.textContent = escolha.hora || '—';
    resCorretor.textContent = escolha.imovel ? CORRETORES[escolha.imovel.id] : '—';

    var completo = escolha.imovel && escolha.dia && escolha.hora;
    resumo.classList.toggle('resumo-ok', !!completo);
    resZap.classList.toggle('btn-cheio', !!completo);
    resZap.classList.toggle('btn-vazio', !completo);

    if (completo) {
      resZap.textContent = 'Confirmar visita';
      var msg = 'Olá! Quero agendar uma visita ao imóvel ' + escolha.imovel.id + ' (' +
        escolha.imovel.local + '), ' + DIAS_SEMANA[escolha.dia.getDay()] + ' ' +
        escolha.dia.getDate() + '/' + (escolha.dia.getMonth() + 1) + ' às ' + escolha.hora +
        ', com ' + CORRETORES[escolha.imovel.id] + '.';
      resZap.setAttribute('href', 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg));
    } else {
      resZap.textContent = escolha.imovel
        ? (escolha.dia ? 'Escolha o horário' : 'Escolha o dia')
        : 'Escolha o imóvel';
      resZap.setAttribute('href', '#visita');
    }
  }

  if (resumo) atualiza();

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
  var alvos = document.querySelectorAll('.cab, .manifesto, .metodo li, .sobre-in > div, .contato-cartao, .cofre-porta');
  alvos.forEach(function (el) { el.classList.add('rv'); });
  if ('IntersectionObserver' in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('vis'); }, i * 80);
        olho.unobserve(e.target);
      });
    }, { threshold:.16, rootMargin:'0px 0px -8% 0px' });
    alvos.forEach(function (el) { olho.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('vis'); });
  }
})();
