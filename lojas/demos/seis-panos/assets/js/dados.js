/* =========================================================
   SEIS PANOS — base de produtos
   Fonte única do catálogo. Para trocar por bonés reais:
   edite este arquivo e ponha as fotos em img/produtos/<id>-1.jpg e -2.jpg
   ========================================================= */

const CATEGORIAS = [
  { id:'fitted',   nome:'Fitted 59',  desc:'aba reta, sem regulagem',  arquivo:'img/categorias/fitted.jpg' },
  { id:'snapback', nome:'Snapback',   desc:'ajuste no botão',           arquivo:'img/categorias/snapback.jpg' },
  { id:'trucker',  nome:'Trucker',    desc:'tela atrás, mais leve',     arquivo:'img/categorias/trucker.jpg' },
  { id:'dad',      nome:'Dad Hat',    desc:'aba curva, perfil baixo',   arquivo:'img/categorias/dad-hat.jpg' }
];

const TAMANHOS = ['7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4'];

const PRODUTOS = [
  { id:'areia-rubro', nome:'Fitted 59 · Areia Rubro', cat:'fitted', cor:'areia',
    preco:349.9, de:429.9, estoque:4, nota:4.9, avaliacoes:187, tag:'mais vendido',
    esgotados:['7','7 3/4'],
    resumo:'Coroa alta em areia, bordado rubro em alto relevo e aba com sticker original de fábrica.',
    detalhe:'Coroa estruturada de seis painéis, forro interno em cetim e viés de suor em algodão. O bordado é feito em ponto cheio, com contorno em fio mais grosso — o desenho não achata depois da lavagem. Sticker dourado na aba mantido no lugar, como veio.' },

  { id:'tie-dye-cosmos', nome:'Fitted 59 · Tie-Dye Cosmos', cat:'fitted', cor:'areia',
    preco:379.9, de:449.9, estoque:2, nota:5.0, avaliacoes:94, tag:'últimas peças',
    esgotados:['7','7 1/8','7 3/4'],
    resumo:'Patch tie-dye rosa e azul sobre base areia. Cada peça tem a mancha em posição diferente.',
    detalhe:'O patch é tingido em lote pequeno, então o desenho nunca se repete exatamente. Base em sarja de algodão pesado, aba plana com miolo firme que não amassa na mochila. Forro escuro para não marcar suor.' },

  { id:'trevo-neon', nome:'Fitted 59 · Trevo Neon', cat:'fitted', cor:'areia',
    preco:359.9, de:429.9, estoque:6, nota:4.8, avaliacoes:143, tag:'',
    esgotados:['7 3/4'],
    resumo:'Areia por fora, aba forrada em verde neon por baixo. O contraste aparece quando você olha de baixo.',
    detalhe:'Sarja de algodão em areia, bordado em preto sobre círculo branco e forro da aba em verde neon. É o modelo que mais sai para quem usa boné com a aba levantada.' },

  { id:'teal-montanha', nome:'Snapback · Teal Montanha', cat:'snapback', cor:'verde',
    preco:279.9, de:0, estoque:9, nota:4.7, avaliacoes:61, tag:'novo',
    esgotados:[],
    resumo:'Frente creme, aba e traseira em teal. Fecho snapback de sete pontos.',
    detalhe:'Modelo mais leve, coroa média, ideal para quem acha o fitted alto demais. O snapback de sete pontos permite ajuste fino e não deixa marca na testa.' },

  { id:'preto-onyx', nome:'Fitted 59 · Preto Onyx', cat:'fitted', cor:'preto',
    preco:329.9, de:389.9, estoque:11, nota:4.9, avaliacoes:224, tag:'',
    esgotados:['7'],
    resumo:'Preto sobre preto, bordado no mesmo tom. O coringa que combina com tudo.',
    detalhe:'Bordado tone-on-tone, visível só na luz certa. Sarja preta com tratamento anti-desbotamento — é o modelo que menos perde cor em uso diário.' },

  { id:'areia-malha', nome:'Trucker · Areia Malha', cat:'trucker', cor:'areia',
    preco:229.9, de:279.9, estoque:14, nota:4.6, avaliacoes:78, tag:'',
    esgotados:[],
    resumo:'Frente em sarja areia, traseira em tela. Feito para calor.',
    detalhe:'Tela de poliéster de trama aberta, espuma frontal firme que segura o formato e aba levemente curva. Pesa 42 g a menos que o fitted.' },

  { id:'off-white-dad', nome:'Dad Hat · Off-White', cat:'dad', cor:'creme',
    preco:189.9, de:0, estoque:18, nota:4.5, avaliacoes:52, tag:'',
    esgotados:[],
    resumo:'Perfil baixo, aba curva, fivela de metal atrás. O mais discreto da casa.',
    detalhe:'Algodão lavado, coroa desestruturada que amolda à cabeça em poucos usos. Fivela de metal escovado com passador. É o modelo de entrada, e o que mais volta em segunda compra.' },

  { id:'verde-musgo', nome:'Fitted 59 · Verde Musgo', cat:'fitted', cor:'verde',
    preco:349.9, de:0, estoque:5, nota:4.8, avaliacoes:66, tag:'',
    esgotados:['7','7 5/8'],
    resumo:'Musgo profundo com bordado creme. Coleção outono.',
    detalhe:'Tom fechado que puxa para o oliva na luz do dia. Bordado em creme para não sumir no escuro. Forro da aba na mesma cor da coroa.' },

  { id:'preto-lacre', nome:'Snapback · Preto Lacre', cat:'snapback', cor:'preto',
    preco:289.9, de:0, estoque:3, nota:5.0, avaliacoes:41, tag:'exclusivo',
    esgotados:[],
    resumo:'Edição fechada de 60 peças. Numerada por dentro.',
    detalhe:'Cada peça tem o número da edição bordado no viés interno. Preto fosco com detalhe em verde-limão no botão do snapback. Quando acabar, não volta.' },

  { id:'bordo-vintage', nome:'Fitted 59 · Bordô Vintage', cat:'fitted', cor:'vinho',
    preco:339.9, de:399.9, estoque:7, nota:4.7, avaliacoes:88, tag:'',
    esgotados:['7 3/4'],
    resumo:'Bordô lavado com aparência de peça de garimpo, direto de fábrica.',
    detalhe:'Recebe lavagem enzimática antes da costura, o que dá o aspecto puído sem enfraquecer o tecido. Bordado em off-white levemente encardido, de propósito.' },

  { id:'preto-branco', nome:'Trucker · Preto e Branco', cat:'trucker', cor:'preto',
    preco:239.9, de:0, estoque:12, nota:4.6, avaliacoes:57, tag:'',
    esgotados:[],
    resumo:'Frente preta, tela branca. O contraste clássico de trucker.',
    detalhe:'Costura aparente em branco na aba, tela branca de trama média e fecho snapback preto. Modelo com a maior taxa de recompra da loja.' },

  { id:'azul-marinho', nome:'Fitted 59 · Azul Marinho', cat:'fitted', cor:'azul',
    preco:349.9, de:0, estoque:8, nota:4.8, avaliacoes:112, tag:'',
    esgotados:['7'],
    resumo:'Marinho fechado com bordado branco. O mais formal dos fitted.',
    detalhe:'Azul profundo que não puxa para o roxo sob luz artificial. Bordado branco em ponto cheio e aba com forro cinza-claro.' }
];

const DROP = {
  nome: 'Drop 03 · Quadra Norte',
  chamada: 'Seis modelos em areia, feitos para durar mais que a tendência.',
  itens: ['areia-rubro', 'tie-dye-cosmos', 'trevo-neon', 'teal-montanha', 'preto-lacre', 'verde-musgo'],
  /* o contador conta a partir de agora, para a demo nunca aparecer zerada */
  horas: 71.5
};

const DEPOIMENTOS = [
  { nome:'Lucas Ferrari', local:'São Paulo · SP', nota:5, foto:'img/social/cliente-01.jpg',
    texto:'Chegou em 6 dias com o lacre na aba intacto. Já tinha comprado importado antes e veio réplica. Aqui é original mesmo, dá pra ver na costura.' },
  { nome:'Amanda Reis', local:'Belo Horizonte · MG', nota:5, foto:'img/social/cliente-02.jpg',
    texto:'Comprei o tie-dye achando que ia ser grande demais pra mim. Peguei 7 1/4 pela tabela do site e ficou perfeito. Boné não tem gênero, gente.' },
  { nome:'Diego Nakamura', local:'Curitiba · PR', nota:5, foto:'img/social/cliente-03.jpg',
    texto:'Atendimento respondeu no sábado à noite. Troquei o tamanho sem custo e o novo chegou antes do prazo. Virei cliente.' }
];

const FAQ = [
  ['Como sei que o boné é original?',
   'Todo modelo sai com o sticker de fábrica na aba, a etiqueta interna com o código do lote e a nota fiscal de importação. Se qualquer um dos três estiver faltando, devolvemos o valor integral. Réplica não entra no estoque — nem para completar grade.'],
  ['Qual tamanho eu peço?',
   'Meça a circunferência da cabeça com uma fita métrica, dois dedos acima da orelha. 55 cm equivale a 7 (aprox.), 57 cm a 7 1/4, 58 cm a 7 3/8 e 59 cm a 7 1/2. Na dúvida entre dois, escolha o maior: fitted cede um pouco com o uso. A tabela completa está na página de cada produto.'],
  ['Boné importado é unissex mesmo?',
   'É. A numeração é por circunferência da cabeça, não por gênero. A mesma peça que serve num homem de 58 cm serve numa mulher de 58 cm. Todas as fotos do site mostram os modelos em pessoas diferentes justamente por isso.'],
  ['Quanto tempo demora a entrega?',
   'De 4 a 9 dias úteis para capitais e de 7 a 14 para o interior, com código de rastreio no mesmo dia da postagem. Pedidos aprovados até 14h saem no mesmo dia útil.'],
  ['Posso trocar se não servir?',
   'Pode, em até 30 dias, com a peça sem uso e com o sticker no lugar. A primeira troca por tamanho é por nossa conta, incluindo o frete de ida e volta.'],
  ['Como funciona o pagamento?',
   'Pix com 10% de desconto (aprovação na hora), cartão em até 12x sem juros a partir de R$ 300 ou boleto. O pedido só é separado depois da confirmação.']
];
