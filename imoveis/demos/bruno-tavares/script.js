/* ============================================================
   Bruno Tavares — comportamento da página
   O coração aqui é o sistema de busca: filtro, ordenação,
   favoritos e a mensagem de WhatsApp montada com os códigos.
   Tudo roda no navegador, sem servidor — num site real esta
   mesma tela lê a carteira de um painel, e só isso muda.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- carteira ----------
     Nove imóveis, que é o número que o texto da página promete.
     Se a lista e o texto discordarem, a página perde credibilidade
     na primeira conferida — e é o tipo de detalhe que o visitante
     confere justamente porque o site diz que a carteira é pequena. */
  var IMOVEIS = [
    { cod:'SM-104', tipo:'apartamento', fim:'venda',   bairro:'São Mateus', quartos:3, vagas:1, area:96,
      titulo:'Apartamento de 3 quartos com varanda', rua:'Rua Bernardo Mascarenhas',
      preco:690000, selo:'Novo na carteira', novo:1 },
    { cod:'BP-071', tipo:'casa', fim:'venda', bairro:'Bom Pastor', quartos:3, vagas:2, area:142,
      titulo:'Casa térrea com quintal e rua sem saída', rua:'Rua das Acácias',
      preco:540000, selo:'Aceita financiamento', novo:2 },
    { cod:'SM-118', tipo:'apartamento', fim:'locacao', bairro:'São Mateus', quartos:2, vagas:1, area:68,
      titulo:'Apartamento de 2 quartos, mobiliado', rua:'Rua Santa Rita',
      preco:2400, selo:'Mobiliado', novo:3 },
    { cod:'SM-121', tipo:'cobertura', fim:'venda', bairro:'São Mateus', quartos:4, vagas:2, area:210,
      titulo:'Cobertura duplex com terraço e churrasqueira', rua:'Rua Padre Café',
      preco:1150000, selo:'', novo:4 },
    { cod:'BP-083', tipo:'apartamento', fim:'venda', bairro:'Bom Pastor', quartos:2, vagas:1, area:74,
      titulo:'Apartamento de 2 quartos em prédio novo', rua:'Avenida Rio Branco',
      preco:415000, selo:'', novo:5 },
    { cod:'BP-090', tipo:'casa', fim:'locacao', bairro:'Bom Pastor', quartos:4, vagas:2, area:180,
      titulo:'Casa de 4 quartos com edícula nos fundos', rua:'Rua Doutor Dirceu',
      preco:4200, selo:'', novo:6 },
    { cod:'SM-096', tipo:'apartamento', fim:'venda', bairro:'São Mateus', quartos:1, vagas:0, area:42,
      titulo:'Studio reformado a 300 m do campus', rua:'Rua Espírito Santo',
      preco:265000, selo:'Bom para renda', novo:7 },
    { cod:'BP-064', tipo:'terreno', fim:'venda', bairro:'Bom Pastor', quartos:0, vagas:0, area:360,
      titulo:'Terreno plano de 360 m², murado e escriturado', rua:'Rua Ipiranga',
      preco:380000, selo:'', novo:8 },
    { cod:'SM-130', tipo:'apartamento', fim:'locacao', bairro:'São Mateus', quartos:3, vagas:1, area:88,
      titulo:'Apartamento de 3 quartos com dependência', rua:'Rua Marechal Deodoro',
      preco:3100, selo:'', novo:9 }
  ];

  var ZAP = '5532999990000';

  var grade = document.getElementById('grade');
  var form = document.getElementById('filtros');
  if (!grade || !form) return;

  var teto = document.getElementById('teto');
  var tetoRotulo = document.getElementById('tetoRotulo');
  var contagem = document.getElementById('contagem');
  var ordem = document.getElementById('ordem');
  var vazio = document.getElementById('vazio');
  var barraFav = document.getElementById('barraFav');
  var favCont = document.getElementById('favCont');
  var favCodigos = document.getElementById('favCodigos');
  var favZap = document.getElementById('favZap');
  var limpaFav = document.getElementById('limpaFav');

  var favoritos = [];

  /* ---------- formatação ----------
     Locação e venda mostram o preço em escalas muito diferentes
     (milhares contra centenas de milhares). Escrever "R$ 2.400/mês"
     junto de "R$ 690.000" sem a marcação do período faria o aluguel
     parecer um erro de digitação. */
  var moeda = new Intl.NumberFormat('pt-BR', {
    style:'currency', currency:'BRL', maximumFractionDigits:0
  });

  function precoTexto(im) {
    return moeda.format(im.preco) + (im.fim === 'locacao' ? '<small>por mês + encargos</small>' : '<small>à vista ou financiado</small>');
  }

  function specs(im) {
    var t = [];
    if (im.quartos) t.push(im.quartos + (im.quartos > 1 ? ' quartos' : ' quarto'));
    if (im.vagas) t.push(im.vagas + (im.vagas > 1 ? ' vagas' : ' vaga'));
    t.push(im.area + ' m²');
    return t.map(function (x) { return '<span>' + x + '</span>'; }).join('');
  }

  var CORACAO = '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.7 1.1-1a5.5 5.5 0 0 0 0-7.7z"/></svg>';

  function cartao(im) {
    var art = document.createElement('article');
    art.className = 'card';
    art.innerHTML =
      '<div class="card-topo">' +
        '<figure class="foto" data-ph="img/' + im.cod.toLowerCase() + '.jpg · 1200×900">' +
          '<img src="img/' + im.cod.toLowerCase() + '.jpg" alt="' + im.titulo + ' na ' + im.rua + '">' +
        '</figure>' +
        (im.selo ? '<span class="card-selo">' + im.selo + '</span>' : '') +
        '<button class="card-fav" type="button" aria-pressed="false" ' +
          'aria-label="Marcar o imóvel ' + im.cod + '">' + CORACAO + '</button>' +
      '</div>' +
      '<div class="card-corpo">' +
        '<span class="card-cod">' + im.cod + ' · ' + (im.fim === 'venda' ? 'Venda' : 'Locação') + '</span>' +
        '<h3>' + im.titulo + '</h3>' +
        '<p class="card-bairro">' + im.rua + ' · ' + im.bairro + '</p>' +
        '<div class="card-specs">' + specs(im) + '</div>' +
        '<p class="card-preco">' + precoTexto(im) + '</p>' +
      '</div>';

    var botao = art.querySelector('.card-fav');
    if (favoritos.indexOf(im.cod) > -1) {
      botao.classList.add('on');
      botao.setAttribute('aria-pressed', 'true');
    }
    botao.addEventListener('click', function () { alterna(im.cod, botao); });
    return art;
  }

  function alterna(cod, botao) {
    var i = favoritos.indexOf(cod);
    if (i > -1) favoritos.splice(i, 1); else favoritos.push(cod);
    botao.classList.toggle('on', i === -1);
    botao.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
    pintaFavoritos();
  }

  function pintaFavoritos() {
    if (!favoritos.length) { barraFav.hidden = true; return; }
    barraFav.hidden = false;
    favCont.textContent = favoritos.length;
    favCodigos.textContent = favoritos.join(' · ');
    var texto = 'Olá, Bruno! Separei ' + favoritos.length +
      (favoritos.length > 1 ? ' imóveis' : ' imóvel') + ' no seu site: ' +
      favoritos.join(', ') + '. Podemos conversar sobre eles?';
    favZap.setAttribute('href', 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(texto));
  }

  function filtra() {
    var d = new FormData(form);
    var fim = d.get('finalidade') || '';
    var tipo = d.get('tipo') || '';
    var bairro = d.get('bairro') || '';
    var quartos = parseInt(d.get('quartos') || '0', 10);
    var limite = parseInt(teto.value, 10);

    return IMOVEIS.filter(function (im) {
      if (fim && im.fim !== fim) return false;
      if (tipo && im.tipo !== tipo) return false;
      if (bairro && im.bairro !== bairro) return false;
      if (quartos && im.quartos < quartos) return false;
      /* o teto é de compra; aluguel tem outra escala e ficaria sempre
         dentro de qualquer limite, então o filtro só vale para venda */
      if (im.fim === 'venda' && im.preco > limite) return false;
      return true;
    });
  }

  function ordena(lista) {
    var modo = ordem.value;
    var c = lista.slice();
    if (modo === 'menor') c.sort(function (a, b) { return a.preco - b.preco; });
    else if (modo === 'maior') c.sort(function (a, b) { return b.preco - a.preco; });
    else if (modo === 'area') c.sort(function (a, b) { return b.area - a.area; });
    else c.sort(function (a, b) { return b.novo - a.novo; });
    return c;
  }

  function desenha() {
    var lista = ordena(filtra());
    grade.innerHTML = '';
    lista.forEach(function (im) { grade.appendChild(cartao(im)); });

    vazio.hidden = lista.length > 0;
    contagem.innerHTML = lista.length === IMOVEIS.length
      ? IMOVEIS.length + ' imóveis na carteira'
      : '<b>' + lista.length + '</b> de ' + IMOVEIS.length + (lista.length === 1 ? ' imóvel' : ' imóveis');

    tetoRotulo.textContent = moeda.format(parseInt(teto.value, 10));
  }

  form.addEventListener('change', desenha);
  form.addEventListener('input', desenha);
  ordem.addEventListener('change', desenha);
  /* o reset do formulário só limpa os campos depois do evento, então
     a releitura precisa esperar um tique — senão desenha com os
     valores antigos e a tela fica um passo atrás do que a pessoa vê */
  form.addEventListener('reset', function () { setTimeout(desenha, 0); });
  limpaFav.addEventListener('click', function () {
    favoritos = [];
    pintaFavoritos();
    desenha();
  });

  desenha();

  /* ---------- topo que ganha fundo ao rolar ---------- */
  var topo = document.querySelector('.topo');
  function vigiaTopo() { topo.classList.toggle('rolou', window.scrollY > 24); }
  vigiaTopo();
  window.addEventListener('scroll', vigiaTopo, { passive:true });

  /* ---------- menu do celular ---------- */
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

  /* ---------- whatsapp flutuante ----------
     Aparece só depois que a pessoa passou do hero: antes disso ela
     ainda não sabe o que é o site, e o botão vira só um obstáculo. */
  var zap = document.querySelector('.whatsapp-float');
  function vigiaZap() { zap.classList.toggle('on', window.scrollY > window.innerHeight * 0.6); }
  vigiaZap();
  window.addEventListener('scroll', vigiaZap, { passive:true });

  /* ---------- entrada ao rolar ---------- */
  var alvos = document.querySelectorAll('.cab, .destaque, .passos li, .vozes blockquote, .bairro-txt, .sobre-txt, .contato-cta');
  alvos.forEach(function (el) { el.classList.add('rv'); });
  if ('IntersectionObserver' in window) {
    var olho = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('vis'); }, i * 70);
        olho.unobserve(e.target);
      });
    }, { threshold:.18, rootMargin:'0px 0px -8% 0px' });
    alvos.forEach(function (el) { olho.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('vis'); });
  }
})();
