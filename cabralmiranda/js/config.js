// Cabral & Miranda: contato e chaves num lugar só.
// null vira placeholder amarelo na prévia. Mudou este arquivo, suba o ?v= dele no index.html.
window.CM = {
  // Os dois números da bio do Instagram. Falta confirmar qual é de cada advogada (data/equipe.json)
  // e qual atende o botão geral "Falar com o escritório".
  whatsappEscritorio: '5532991671553',
  whatsappEscritorioConfirmado: false,
  telefones: ['(32) 99167-1553', '(32) 98400-6251'],

  instagram: 'cabralmiranda.adv',
  email: null,

  endereco: 'Rua Ernesto Grillo, 54',
  bairroCidade: 'Centro, Espera Feliz, MG',
  cep: null,

  // Texto livre, ex.: 'Segunda a sexta, 8h às 18h'
  horario: null,
  // Atendem on-line? true, false ou null (a confirmar). Muda o texto da triagem, do passo 2 e das dúvidas.
  atendimentoOnline: null,

  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Ernesto+Grillo+54+Centro+Espera+Feliz+MG',
  mapaEmbed: 'https://maps.google.com/maps?q=Rua%20Ernesto%20Grillo%2054%2C%20Espera%20Feliz%20MG&z=17&output=embed',

  // Web3Forms do escritório (o e-mail de destino é o dono da chave). Sem chave, os formulários do
  // modal mostram o aviso de prévia e oferecem o WhatsApp.
  web3formsKey: null,

  // Medição (evento triagem_concluida e cliques). Desligada na prévia; ligar só no site oficial.
  rastrear: false
};
