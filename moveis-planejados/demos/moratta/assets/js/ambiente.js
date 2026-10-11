/* MORATTÁ — página de ambiente.
   Uma página só para os dez ambientes (cozinhas tem página própria):
   ambiente.html?a=closet lê o bloco certo daqui e preenche o HTML.
   Ambiente novo = um bloco neste objeto + a foto em img/ambientes/. */
(function () {
  'use strict';

  var AMB = {
    lavanderia: {
      nome: 'Lavanderia',
      titulo: 'A lavanderia que cabe no corredor.',
      lead: 'Torre para lava e seca empilhadas, tábua de passar que sai da gaveta e armário alto para o que hoje mora no chão. Funciona em 2,5 m² sem parecer depósito.',
      chamada: 'Pensada para a máquina, não só para a foto.',
      itens: [
        ['Torre', 'Lava e seca empilhadas', 'Nicho com respiro traseiro e base reforçada para a vibração da centrífuga. A porta fecha e a máquina some.'],
        ['Gaveta', 'Tábua de passar embutida', 'Sai da gaveta na altura certa e volta para dentro em dois segundos. Sem tábua encostada atrás da porta.'],
        ['Chapa', 'MDF resistente à umidade', 'Chapa com tratamento para área molhada e fita de borda colada a laser, que não descola com vapor.']
      ],
      nums: [['2,5 m²', 'Área mínima de projeto'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    },
    dormitorios: {
      nome: 'Dormitórios',
      titulo: 'O quarto onde a cabeceira e o roupeiro são uma peça só.',
      lead: 'Cabeceira estofada de parede a parede, criados integrados e roupeiro de correr com vidro reflecta. O quarto fica maior porque nada sobra.',
      chamada: 'Para dormir bem e achar a roupa no escuro.',
      itens: [
        ['Cabeceira', 'De parede a parede', 'Painel estofado com tomada e USB embutidos nos dois lados. O fio do carregador não atravessa mais a cama.'],
        ['Roupeiro', 'Portas de correr sem trilho no piso', 'Trilho superior com amortecimento e vidro reflecta, que esconde a bagunça sem escurecer o quarto.'],
        ['Luz', 'LED que acende ao abrir', 'Sensor de porta em cada vão do roupeiro. Luz quente de 3.000 K, que não acorda quem está dormindo.']
      ],
      nums: [['3 m', 'De roupeiro em média'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    },
    banheiro: {
      nome: 'Banheiro',
      titulo: 'Gabinete suspenso, chão livre.',
      lead: 'Gabinete ripado que flutua acima do piso, espelheira com luz de borda e nichos dentro do box. Limpar o banheiro vira um movimento só.',
      chamada: 'Feito para água, vapor e pressa de manhã.',
      itens: [
        ['Gabinete', 'Suspenso a 30 cm do piso', 'Fixação oculta na parede, testada com 80 kg. O rodo passa por baixo e a umidade não sobe pela base.'],
        ['Espelheira', 'Luz de borda sem sombra', 'LED em todo o contorno do espelho, que ilumina o rosto por igual. Desembaçador opcional.'],
        ['Acabamento', 'Laca e lâmina para área molhada', 'Primer selador nas seis faces da chapa, inclusive as que ninguém vê. É ali que o banheiro estraga primeiro.']
      ],
      nums: [['30 cm', 'Do piso ao gabinete'], ['80 kg', 'Testados na fixação'], ['5 anos', 'De garantia de estrutura']]
    },
    gourmet: {
      nome: 'Gourmet',
      titulo: 'A área gourmet que aguenta o domingo inteiro.',
      lead: 'Churrasqueira embutida, adega climatizada e bancada que recebe oito pessoas em pé. Marcenaria preparada para sol, gordura e vinho derramado.',
      chamada: 'Para receber sem ficar preso na pia.',
      itens: [
        ['Bancada', 'Quartzo com 4 cm de espessura', 'Tampo que aguenta a travessa quente e o corte direto. Balanço para quatro banquetas do lado de fora.'],
        ['Adega', 'Nicho climatizado sob medida', 'Ventilação frontal, então a adega fica rente à marcenaria sem precisar de respiro lateral.'],
        ['Externo', 'Ferragem inox e chapa naval', 'Para varanda aberta: dobradiça inox e chapa que não incha com a chuva que entra de lado.']
      ],
      nums: [['8', 'Pessoas na bancada'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    },
    home: {
      nome: 'Home',
      titulo: 'A parede da TV que esconde todo o resto.',
      lead: 'Painel ripado com tratamento acústico, nicho iluminado e passagem de fios por dentro da marcenaria. O que aparece é a TV; o que some é o resto.',
      chamada: 'Som melhor, fio nenhum à vista.',
      itens: [
        ['Painel', 'Ripado com lã mineral', 'Material acústico entre o ripado e a parede. O som da sala deixa de bater e voltar.'],
        ['Fiação', 'Calha interna visitável', 'Todos os cabos correm por dentro do painel, com tampa removível para trocar aparelho sem quebrar nada.'],
        ['Rack', 'Suspenso com ventilação', 'Gavetas com fechamento suave e fundo vazado atrás dos aparelhos, que esquentam menos.']
      ],
      nums: [['0', 'Fios à vista'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    },
    corporativo: {
      nome: 'Corporativo',
      titulo: 'A recepção é o primeiro contrato que o cliente lê.',
      lead: 'Balcão maciço, painel ripado e estações de trabalho com a mesma linguagem da recepção. Marcenaria para escritório, clínica e consultório, entregue fora do horário comercial.',
      chamada: 'Para empresa que não pode parar durante a obra.',
      itens: [
        ['Balcão', 'Peça única de recepção', 'Tampo em quartzo, passagem de cabos e altura dupla: uma para quem está em pé, outra acessível.'],
        ['Prazo', 'Montagem à noite e no fim de semana', 'A equipe monta fora do expediente, para a operação não fechar nenhum dia.'],
        ['Escala', 'Mesmo padrão em várias unidades', 'Projeto padronizado para rede de lojas ou clínicas, com a mesma tabela em qualquer estado.']
      ],
      nums: [['19', 'Estados atendidos'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    },
    kids: {
      nome: 'Kids',
      titulo: 'O quarto que cresce junto.',
      lead: 'Cama baixa embutida, nichos de canto arredondado e prateleiras na altura da criança. Pensado para durar dos três aos doze anos com troca de frente, não de móvel.',
      chamada: 'Seguro hoje, útil daqui a dez anos.',
      itens: [
        ['Segurança', 'Cantos arredondados em tudo', 'Raio de 10 mm nas quinas que ficam na altura da cabeça e trava em todas as gavetas baixas.'],
        ['Crescer', 'Prateleira que sobe de altura', 'Cremalheira embutida: a prateleira do brinquedo vira a prateleira do livro sem furo novo.'],
        ['Material', 'Chapa com baixa emissão', 'MDF com selo de baixa emissão de formaldeído e tinta à base d’água.']
      ],
      nums: [['10 mm', 'De raio nos cantos'], ['3 a 12', 'Anos de uso planejado'], ['5 anos', 'De garantia de estrutura']]
    },
    hall: {
      nome: 'Hall',
      titulo: 'A entrada que segura o que a casa não precisa ver.',
      lead: 'Painel de piso a teto, banco suspenso para tirar o sapato, sapateira ventilada e espelho de corpo inteiro. Dois metros de parede que organizam a casa inteira.',
      chamada: 'Chave, sapato e bolsa no lugar certo.',
      itens: [
        ['Sapateira', 'Ventilada por dentro', 'Portas basculantes com respiro, para o sapato não guardar umidade nem cheiro.'],
        ['Banco', 'Suspenso, sem pé', 'Fixação oculta para 150 kg. O piso continua livre e a limpeza passa por baixo.'],
        ['Painel', 'Com porta invisível', 'Uma das ripas é porta: lá dentro, quadro de luz e cabideiro. Ninguém vê.']
      ],
      nums: [['2 m', 'De parede em média'], ['150 kg', 'No banco suspenso'], ['5 anos', 'De garantia de estrutura']]
    },
    sala: {
      nome: 'Sala',
      titulo: 'A estante que vira parede.',
      lead: 'Estante de piso a teto com nichos de profundidades diferentes, aparador baixo e luz em cada vão. Livro, objeto e aparelho no mesmo móvel, sem parecer depósito.',
      chamada: 'Para os livros, as coisas e a luz certa.',
      itens: [
        ['Estante', 'Prateleira que não empena', 'Chapa de 25 mm nas prateleiras de vão livre maior que 80 cm. Livro pesa, e é ali que a estante comum cede.'],
        ['Luz', 'LED embutido em perfil', 'Fita em perfil de alumínio rebaixado. A luz aparece na prateleira, o fio não aparece em lugar nenhum.'],
        ['Aparador', 'Gavetas com toque', 'Abertura por pressão, sem puxador, para a frente da estante ficar limpa de ponta a ponta.']
      ],
      nums: [['25 mm', 'Nas prateleiras longas'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    },
    closet: {
      nome: 'Closet',
      titulo: 'O closet onde você vê tudo antes de abrir.',
      lead: 'Portas de vidro com perfil fino, ilha central com gavetas de tampo de vidro e luz em cada cabideiro. A roupa fica à vista, e a poeira, do lado de fora.',
      chamada: 'Para escolher a roupa em vez de procurar.',
      itens: [
        ['Ilha', 'Gavetas com tampo de vidro', 'Relógio, óculos e acessório à vista sem abrir nada. Divisórias em veludo removíveis.'],
        ['Portas', 'Vidro fumê com perfil de 19 mm', 'Perfil de alumínio fino e vidro temperado. Protege da poeira sem esconder a roupa.'],
        ['Luz', 'Cabideiro iluminado', 'Barra de LED dentro de cada cabideiro, acionada pela abertura da porta.']
      ],
      nums: [['19 mm', 'De perfil nas portas'], ['45 dias', 'De produção'], ['5 anos', 'De garantia de estrutura']]
    }
  };

  var ORDEM = ['cozinhas', 'lavanderia', 'dormitorios', 'banheiro', 'gourmet', 'home', 'corporativo', 'kids', 'hall', 'sala', 'closet'];
  var NOME = { cozinhas: 'Cozinhas' };

  var chave = new URLSearchParams(location.search).get('a');
  if (chave === 'cozinhas') { location.replace('colecao-cozinhas.html'); return; }
  if (!AMB[chave]) chave = 'sala';
  var A = AMB[chave];

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  document.title = A.nome + ' Morattá | Ambientes planejados';
  var desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', A.lead);

  document.querySelectorAll('[data-amb]').forEach(function (el) {
    var v = A[el.getAttribute('data-amb')];
    if (v) el.textContent = v;
  });

  var foto = document.querySelector('[data-amb-foto]');
  if (foto) {
    foto.setAttribute('data-file', 'img/ambientes/' + chave + '.jpg');
    var img = foto.querySelector('img');
    img.src = 'img/ambientes/' + chave + '.jpg';
    img.alt = A.nome + ' planejado Morattá';
  }

  var cta = document.querySelector('[data-amb-cta]');
  if (cta) cta.setAttribute('data-assunto', 'Quero o projeto 3D de ' + A.nome.toLowerCase() + '.');

  var itens = document.querySelector('[data-amb-itens]');
  if (itens) itens.innerHTML = A.itens.map(function (it) {
    return '<article><span class="n">' + esc(it[0]) + '</span><h3 class="h-sm">' + esc(it[1]) +
           '</h3><p>' + esc(it[2]) + '</p></article>';
  }).join('');

  var nums = document.querySelector('[data-amb-nums]');
  if (nums) nums.innerHTML = A.nums.map(function (n) {
    return '<li><b>' + esc(n[0]) + '</b><span>' + esc(n[1]) + '</span></li>';
  }).join('');

  var outros = document.querySelector('[data-amb-outros]');
  if (outros) outros.innerHTML = ORDEM.filter(function (k) { return k !== chave; }).map(function (k) {
    var nome = NOME[k] || AMB[k].nome;
    var href = k === 'cozinhas' ? 'colecao-cozinhas.html' : 'ambiente.html?a=' + k;
    return '<a class="amb__card" href="' + href + '"><figure class="ph" data-file="img/ambientes/' + k +
           '.jpg"><img src="img/ambientes/' + k + '.jpg" alt="' + esc(nome) + ' planejado Morattá" loading="lazy"></figure>' +
           '<span class="amb__name">' + esc(nome) + '</span></a>';
  }).join('');

  /* o crumb e o menu acendem "Ambientes" (chrome.js); aqui só o link do painel */
  document.querySelectorAll('.nav__panel a, .drawer__sub a').forEach(function (a) {
    if (a.getAttribute('href') === 'ambiente.html?a=' + chave) a.setAttribute('aria-current', 'page');
  });
})();
