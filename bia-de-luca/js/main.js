(function () {
  'use strict';

  var WA = '5511991821006';
  function linkWa(texto) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto); }

  // Todo link com data-wa vira wa.me com a mensagem da origem do clique
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = linkWa(a.getAttribute('data-wa'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Menu do celular
  var burger = document.querySelector('.topo__burger');
  var menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    burger.setAttribute('aria-expanded', aberto);
    burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('aberto'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // Por onde começar
  var CAMINHOS = [
    { id: 'corpo', sinal: 'i', rotulo: 'Saúde e energia',
      titulo: 'Começar por um mapa do seu corpo',
      tags: ['AO Scan', 'Quantec Pro'],
      texto: 'O AO Scan mostra em segundos como seu corpo está vibrando. Com esse mapa, o Quantec trabalha as frequências que faltam, a cada 3 horas, por 3 meses. Sempre como complemento ao seu médico, nunca no lugar dele.',
      msg: 'Olá, Bia! Vim pelo seu site. Quero cuidar da minha saúde e energia e pensei em começar pelo AO Scan.' },
    { id: 'emocoes', sinal: 'ii', rotulo: 'Ansiedade e emoções',
      titulo: 'Acalmar a frequência de dentro',
      tags: ['Quantec Pro', 'Floral Stress', 'Floral Sono', 'Floral Medo'],
      texto: 'O Quantec trabalha o tema a distância enquanto você segue a rotina. Os florais quânticos acompanham no dia a dia, gota a gota. Se você faz acompanhamento psicológico ou médico, continue: isso soma, não substitui.',
      msg: 'Olá, Bia! Vim pelo seu site. Ando com a cabeça e as emoções pesadas e quero ajuda.' },
    { id: 'amor', sinal: 'iii', rotulo: 'Relacionamentos',
      titulo: 'Mudar o que você atrai',
      tags: ['Quantec Pro', 'Floral Alma Gêmea', 'Floral Autoestima', 'Floral Comunicação'],
      texto: 'Relação reflete vibração. A gente trabalha a sua, para que o que chega até você seja diferente do que vinha chegando.',
      msg: 'Olá, Bia! Vim pelo seu site. Quero trabalhar a área dos relacionamentos.' },
    { id: 'prosperidade', sinal: 'iv', rotulo: 'Dinheiro e trabalho',
      titulo: 'Destravar a prosperidade',
      tags: ['Quantec Pro', 'Radiestesia', 'Floral Prosperidade e sucesso', 'Floral Abundância'],
      texto: 'Com o pêndulo encontramos o que trava. Com o Quantec e os florais, trocamos a frequência da escassez pela da abundância.',
      msg: 'Olá, Bia! Vim pelo seu site. Quero destravar a prosperidade e o trabalho.' },
    { id: 'animal', sinal: 'v', rotulo: 'Animal ou plantação',
      titulo: 'Cuidar de quem não fala',
      tags: ['Quantec Pro', 'a distância'],
      texto: 'O Quantec funciona a partir da foto, então atende animais e plantações onde estiverem, sem tirar ninguém de casa nem da terra.',
      msg: 'Olá, Bia! Vim pelo seu site. Quero tratar um animal (ou uma plantação) a distância.' },
    { id: 'empresa', sinal: 'vi', rotulo: 'Minha empresa',
      titulo: 'Mudar a vibração do negócio',
      tags: ['Quantec Pro para empresas', 'Palestra'],
      texto: 'Empresa também vibra: no ambiente, na equipe, no caixa. Dá para tratar o negócio a distância e levar a palestra para o time.',
      msg: 'Olá, Bia! Vim pelo seu site. Quero trabalhar a vibração da minha empresa.' }
  ];

  var opcoes = document.querySelector('.guia__opcoes');
  var resposta = document.querySelector('.guia__resposta');
  CAMINHOS.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.innerHTML = '<span>' + c.sinal + '</span>' + c.rotulo;
    b.addEventListener('click', function () { escolher(c, b); });
    opcoes.appendChild(b);
  });
  function escolher(c, botao) {
    opcoes.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === botao); });
    resposta.innerHTML =
      '<div class="entra"><h3>' + c.titulo + '</h3>' +
      '<ul class="tags">' + c.tags.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
      '<p>' + c.texto + '</p>' +
      '<a class="btn btn--violeta" target="_blank" rel="noopener" href="' + linkWa(c.msg) + '">Conversar sobre isso com a Bia</a></div>';
  }

  // Abas das terapias
  var abas = Array.prototype.slice.call(document.querySelectorAll('.abas [role="tab"]'));
  function ativar(aba, foco) {
    abas.forEach(function (t) {
      var sel = t === aba;
      t.setAttribute('aria-selected', sel);
      t.tabIndex = sel ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
    });
    if (foco) aba.focus();
  }
  abas.forEach(function (t, i) {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', function () { ativar(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); ativar(abas[(i + d + abas.length) % abas.length], true); }
    });
  });

  // Florais: escolher temas monta a mensagem
  var TEMAS = ['Prosperidade e sucesso', 'Autoestima', 'Abundância', 'Transformação', 'Foco e concentração',
    'Limpeza de crenças', 'Limpeza e proteção', 'Neutralizador', 'Alma Gêmea', 'Comunicação', "Ho'oponopono",
    'Medo', 'Sono', 'Libido Woman', 'Performance Man', 'Juventude', 'Detox total', 'Stress', 'Energia', 'Lipo Acelerador'];
  var chips = document.getElementById('chips');
  var ctaFlorais = document.getElementById('florais-cta');
  var escolhidos = [];
  TEMAS.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = t;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var i = escolhidos.indexOf(t);
      if (i < 0) escolhidos.push(t); else escolhidos.splice(i, 1);
      b.setAttribute('aria-pressed', i < 0);
      atualizarFlorais();
    });
    chips.appendChild(b);
  });
  function atualizarFlorais() {
    var n = escolhidos.length;
    ctaFlorais.textContent = n ? 'Pedir ' + (n === 1 ? 'o floral escolhido' : 'os ' + n + ' florais escolhidos') : 'Quero saber dos florais';
    ctaFlorais.href = linkWa(n
      ? 'Olá, Bia! Vim pelo seu site e quero os Florais Quânticos: ' + escolhidos.join(', ') + '.'
      : 'Olá, Bia! Vim pelo seu site e quero saber dos Florais Quânticos.');
  }
  ctaFlorais.target = '_blank';
  ctaFlorais.rel = 'noopener';
  atualizarFlorais();

  // Formulário: monta a mensagem e abre o WhatsApp
  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    if (!nome) { form.nome.setAttribute('aria-invalid', 'true'); form.nome.focus(); return; }
    form.nome.removeAttribute('aria-invalid');
    var txt = 'Olá, Bia! Meu nome é ' + nome + '. Vim pelo seu site (' + form.quem.value.toLowerCase() + ').';
    var msg = form.msg.value.trim();
    if (msg) txt += ' ' + msg;
    window.open(linkWa(txt), '_blank', 'noopener');
  });

  // Ondas e halo só animam quando estão na tela
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle('parado', !en.isIntersecting); });
    });
    document.querySelectorAll('.hero, .contato').forEach(function (s) { io.observe(s); });

    // Entrada suave ao rolar
    var alvos = document.querySelectorAll('.sec-cab, .difs__grid, .florais__grid, .historia__grid, .palestras__grid, .depo blockquote, .duvidas__grid, .contato__grid, .comecar__grid');
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io2.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    alvos.forEach(function (el) { el.classList.add('revela'); io2.observe(el); });
  }

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
