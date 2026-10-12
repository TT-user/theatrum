// Doctors Odontologia: prévia. Equipe e tratamentos vêm dos objetos abaixo.
(function () {
  'use strict';

  // Número tirado do link da bio do Instagram (contate.me/5582993993993). Confirmar com a clínica.
  var ZAP = '5582993993993';

  function zap(msg) { return 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg); }

  var EQUIPE = [
    { id: 'manuel', nome: 'Dr. Manuel Liberato', img: 'manuel-liberato', cro: 'CRO 4640', esp: ['Implantes'] },
    { id: 'sarah', nome: 'Dra. Sarah Lerner', img: 'sarah-lerner', cro: 'CRO 2903', esp: ['Lentes de contato dental', 'Facetas de porcelana'] },
    { id: 'allan', nome: 'Dr. Allan Márcio', img: 'allan-marcio', cro: 'CRO 4613-AL', esp: ['Ortodontia', 'Harmonização orofacial', 'Próteses'] },
    { id: 'klysciane', nome: 'Dra. Klysciane Ferreira', img: 'klysciane-ferreira', cro: 'CRO 4848-AL', esp: ['Ortodontia', 'Cirurgia oral menor'] },
    { id: 'carolina', nome: 'Dra. Carolina Brito', img: 'carolina-brito', cro: 'CRO-AL 4900', esp: ['Endodontia (canal)', 'Clínica geral'] },
    { id: 'mayara', nome: 'Dra. Mayara Lima', img: 'mayara-lima', cro: 'CRO-AL 4249', esp: ['Odontopediatria'] },
    { id: 'jessica', nome: 'Dra. Jéssica Mafra', img: 'jessica-mafra', cro: 'CRO-AL 4831', esp: ['Cirurgia oral menor'] },
    { id: 'aline', nome: 'Aline Resende', img: 'aline-resende', cro: '', esp: ['Gerente administrativa'], gestao: true }
  ];
  var porId = {};
  EQUIPE.forEach(function (p) { porId[p.id] = p; });

  var ICO = {
    implante: '<path d="M8 3h8l-1 5H9L8 3Zm1.5 7h5M9.5 13h5M10 16h4M11 19h2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    sorriso: '<path d="M4 10c2.5 5 13.5 5 16 0M7 12.2v2M10.5 13.2v2.2M13.5 13.2v2.2M17 12.2v2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    aparelho: '<path d="M3 12h18M6 9v6M10 9v6M14 9v6M18 9v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    rosto: '<path d="M12 3c-4 0-6.5 3-6.5 7.5S8.5 21 12 21s6.5-6 6.5-10.5S16 3 12 3Zm-2.5 8.5h.01M14.5 11.5h.01M10 16c1.2.8 2.8.8 4 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    canal: '<path d="M7 4c-2 0-3 2-2.5 4.5L6 15c.5 3 1.5 5 2.5 5s1.2-3 1.5-5h4c.3 2 .5 5 1.5 5s2-2 2.5-5l1.5-6.5C20 6 19 4 17 4c-1.8 0-2.6 1-5 1S8.8 4 7 4Zm5 1v8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    check: '<path d="M7 4c-2 0-3 2-2.5 4.5L6 15c.5 3 1.5 5 2.5 5s1.2-3 1.5-5h4c.3 2 .5 5 1.5 5s2-2 2.5-5l1.5-6.5C20 6 19 4 17 4c-1.8 0-2.6 1-5 1S8.8 4 7 4Zm2 5.5 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>',
    crianca: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 21c.8-4 3.6-6 7-6s6.2 2 7 6M10.5 8.5h.01M13.5 8.5h.01" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    cirurgia: '<path d="M5 19 15 9m0 0 2-5 3 3-5 2Zm-5 10-3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    protese: '<path d="M4 9c0 6 3.5 9 8 9s8-3 8-9M7 9v3M10.5 9v4M13.5 9v4M17 9v3M4 9h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    brilho: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  };

  var TRATS = [
    { id: 'implante', nome: 'Implantes', ico: 'implante', txt: 'Para repor o dente que falta com uma raiz fixa, sem dentadura solta.', quem: ['manuel'] },
    { id: 'lentes', nome: 'Lentes de contato e facetas', ico: 'sorriso', txt: 'Lâminas de porcelana que mudam cor, forma e tamanho dos dentes.', quem: ['sarah'] },
    { id: 'orto', nome: 'Aparelho (ortodontia)', ico: 'aparelho', txt: 'Para alinhar os dentes e acertar a mordida, em adulto e criança.', quem: ['allan', 'klysciane'] },
    { id: 'hof', nome: 'Harmonização orofacial', ico: 'rosto', txt: 'Equilíbrio do rosto e do sorriso, com quem conhece a boca por dentro.', quem: ['allan'] },
    { id: 'canal', nome: 'Tratamento de canal', ico: 'canal', txt: 'Para a dor que não passa, buscando manter o dente natural.', quem: ['carolina'] },
    { id: 'geral', nome: 'Clínica geral e check-up', ico: 'check', txt: 'Limpeza, restauração e a revisão de seis em seis meses.', quem: ['carolina'] },
    { id: 'kids', nome: 'Odontopediatria', ico: 'crianca', txt: 'Dentista de criança, para a visita ser tranquila desde a primeira.', quem: ['mayara'] },
    { id: 'cirurgia', nome: 'Siso e cirurgia oral', ico: 'cirurgia', txt: 'Extração de siso e pequenas cirurgias, com planejamento antes.', quem: ['jessica', 'klysciane'] },
    { id: 'protese', nome: 'Próteses fixas e removíveis', ico: 'protese', txt: 'Para voltar a mastigar e sorrir com segurança.', quem: ['allan'] },
    { id: 'clareamento', nome: 'Clareamento dental', ico: 'brilho', txt: 'Dentes mais claros, com acompanhamento do dentista.', quem: [] }
  ];
  var tratPorId = {};
  TRATS.forEach(function (t) { tratPorId[t.id] = t; });

  function nomes(ids) {
    var n = ids.map(function (id) { return porId[id].nome; });
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1] : n[0];
  }

  // Tratamentos
  var elTrats = document.getElementById('trats');
  elTrats.innerHTML = TRATS.map(function (t) {
    var quem = t.quem.length ? 'Com ' + nomes(t.quem) : '<span class="ph">[quem faz]</span>';
    var msg = 'Olá! Vim pelo site da Doctors e quero agendar uma avaliação de ' + t.nome.toLowerCase() + '.';
    return '<a class="trat" href="' + zap(msg) + '" target="_blank" rel="noopener">' +
      '<span class="trat__ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICO[t.ico] + '</svg></span>' +
      '<h3>' + t.nome + '</h3><p>' + t.txt + '</p>' +
      '<p class="trat__quem">' + quem + '</p><span class="trat__cta">Agendar avaliação →</span></a>';
  }).join('');

  // Equipe e filtros
  var elEquipe = document.getElementById('lista-equipe');
  elEquipe.innerHTML = EQUIPE.map(function (p) {
    var msg = p.gestao
      ? 'Olá, Aline! Vim pelo site da Doctors e tenho uma dúvida sobre agenda e pagamento.'
      : 'Olá! Vim pelo site da Doctors e quero agendar uma avaliação com ' + p.nome + '.';
    var rotulo = p.gestao ? 'Dúvidas de agenda e pagamento' : 'Agendar com ' + p.nome.split(' ').slice(0, 2).join(' ');
    return '<article class="pessoa" data-esp="' + p.esp.join('|') + '">' +
      '<img loading="lazy" src="assets/img/eq-' + p.img + '-420.webp" width="420" height="385" alt="' + p.nome + ', ' + p.esp.join(', ') + (p.cro ? ', ' + p.cro : '') + '">' +
      '<div class="pessoa__info"><div class="pessoa__tags">' + p.esp.map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div>' +
      '<a class="btn btn--linha" href="' + zap(msg) + '" target="_blank" rel="noopener">' + rotulo + '</a></div></article>';
  }).join('');

  var FILTROS = [
    ['Todos', ''], ['Implantes', 'Implantes'], ['Lentes e facetas', 'Lentes'], ['Ortodontia', 'Ortodontia'],
    ['Canal', 'Endodontia'], ['Crianças', 'Odontopediatria'], ['Cirurgia', 'Cirurgia'], ['Harmonização', 'Harmonização']
  ];
  var elFiltros = document.getElementById('filtros');
  elFiltros.innerHTML = FILTROS.map(function (f, i) {
    return '<button class="filtro" aria-pressed="' + (i === 0) + '" data-f="' + f[1] + '">' + f[0] + '</button>';
  }).join('');
  elFiltros.addEventListener('click', function (e) {
    var b = e.target.closest('.filtro'); if (!b) return;
    elFiltros.querySelectorAll('.filtro').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    var f = b.dataset.f;
    elEquipe.querySelectorAll('.pessoa').forEach(function (p) {
      p.hidden = !!f && p.dataset.esp.indexOf(f) === -1;
    });
  });

  // Por onde começar
  var PERGUNTAS = [
    { t: 'O que mais te incomoda hoje?', ops: [
      ['Estou com dor ou sensibilidade', 'canal'], ['Quero um sorriso mais bonito', 'lentes'],
      ['Meus dentes são tortos', 'orto'], ['Me falta dente', 'implante'],
      ['Preciso tirar o siso', 'cirurgia'], ['É para o meu filho', 'kids'],
      ['Quero só um check-up', 'geral'], ['Quero harmonizar o rosto', 'hof']
    ] },
    { t: 'Para quando você precisa?', ops: [
      ['É urgente, está doendo', 'É urgente, estou com dor.'], ['Nesta semana', 'Queria marcar ainda nesta semana.'],
      ['Sem pressa, quero planejar', 'Sem pressa, quero entender o tratamento com calma.']
    ] },
    { t: 'Qual período fica melhor?', ops: [
      ['Manhã', 'manhã'], ['Tarde', 'tarde'], ['Fim do dia', 'fim do dia']
    ] }
  ];
  var resp = [];
  var elQuiz = document.getElementById('quiz');

  function desenha() {
    var i = resp.length;
    if (i < PERGUNTAS.length) {
      var q = PERGUNTAS[i];
      elQuiz.innerHTML = '<p class="quiz__passo">Pergunta ' + (i + 1) + ' de ' + PERGUNTAS.length + '</p>' +
        '<div class="quiz__barra"><i style="width:' + ((i + 1) / (PERGUNTAS.length + 1) * 100) + '%"></i></div>' +
        '<h3>' + q.t + '</h3><div class="quiz__ops">' +
        q.ops.map(function (o, k) { return '<button class="quiz__op" data-k="' + k + '">' + o[0] + '</button>'; }).join('') +
        '</div>' + (i ? '<button class="quiz__voltar" data-voltar>← voltar</button>' : '');
      return;
    }
    var t = tratPorId[PERGUNTAS[0].ops[resp[0]][1]];
    var urg = PERGUNTAS[1].ops[resp[1]][1];
    var per = PERGUNTAS[2].ops[resp[2]][1];
    var p = porId[t.quem[0]];
    var msg = 'Olá! Vim pelo site da Doctors. Quero agendar uma avaliação de ' + t.nome.toLowerCase() +
      ' com ' + p.nome + '. ' + urg + ' Prefiro o período da ' + per + '.';
    if (per === 'fim do dia') msg = msg.replace('o período da fim do dia', 'o fim do dia');
    elQuiz.innerHTML = '<p class="quiz__passo">Seu caminho</p><div class="quiz__barra"><i style="width:100%"></i></div>' +
      '<div class="quiz__res"><img src="assets/img/eq-' + p.img + '-420.webp" width="420" height="385" alt="' + p.nome + '">' +
      '<div><h3>' + p.nome + '</h3><p class="esp">' + p.esp.join(' · ') + '</p>' +
      '<p>' + (t.quem.length > 1 ? 'Também atende: ' + nomes(t.quem.slice(1)) + '. ' : '') + 'A mensagem já vai pronta:</p></div></div>' +
      '<div class="quiz__msg">' + msg + '</div>' +
      '<a class="btn btn--ouro" href="' + zap(msg) + '" target="_blank" rel="noopener">Enviar no WhatsApp</a>' +
      '<br><button class="quiz__voltar" data-recomecar>↺ refazer</button>';
  }
  elQuiz.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-voltar')) resp.pop();
    else if (b.hasAttribute('data-recomecar')) resp = [];
    else if (b.dataset.k != null) resp.push(+b.dataset.k);
    else return;
    desenha();
    var f = elQuiz.querySelector('button'); if (f && resp.length) f.focus({ preventScroll: true });
  });
  desenha();

  // Links de WhatsApp fixos do HTML
  document.querySelectorAll('[data-zap]').forEach(function (a) {
    a.href = zap(a.dataset.zap); a.target = '_blank'; a.rel = 'noopener';
  });

  // Menu
  var menu = document.getElementById('menu'), mb = document.getElementById('menu-btn');
  mb.addEventListener('click', function () {
    var abre = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', abre); mb.setAttribute('aria-expanded', abre);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); mb.setAttribute('aria-expanded', 'false'); }
  });

  // Galeria
  var fotos = Array.prototype.map.call(document.querySelectorAll('#galeria .g img'), function (img) {
    var grande = img.srcset.split(',').pop().trim().split(' ')[0];
    return { src: grande, alt: img.alt };
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
    if (e.key === 'Tab') {
      var bs = lb.querySelectorAll('button'), pri = bs[0], ult = bs[bs.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    }
    if (e.key === 'ArrowLeft') mostra(atual - 1);
    if (e.key === 'ArrowRight') mostra(atual + 1);
  });

  // Mapa só carrega no clique
  document.getElementById('mapa-btn').addEventListener('click', function () {
    document.getElementById('mapa').innerHTML = '<iframe title="Mapa: Doctors Odontologia no Arapiraca Garden Shopping" ' +
      'src="https://maps.google.com/maps?q=Doctors%20Odontologia%20Arapiraca&ll=-9.7340015,-36.6553777&z=17&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
  });
})();
