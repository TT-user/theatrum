// CXF Café Especial: contato e chaves num lugar só.
// null vira placeholder amarelo na prévia. Mudou este arquivo, suba o ?v= dele no index.html.
window.CXF = {
  nome: 'CXF',
  marca: 'CXF Café Especial',

  // Número com DDI e DDD, só dígitos (ex.: '5532999999999'). null: a prévia abre o WhatsApp sem número.
  whatsapp: null,
  whatsappTexto: null,  // ex.: '(32) 99999-9999'
  email: null,
  instagram: null,      // sem @

  cidade: null,         // ex.: 'Alto Caparaó, MG'
  endereco: null,       // loja ou escritório onde dá para retirar o pedido
  cnpj: null,
  horario: null,        // ex.: 'Segunda a sexta, das 8h às 18h'

  // Linha fina acima do topo. null esconde.
  aviso: 'Café especial 100% arábica · pedido direto pelo WhatsApp · [condição de frete]',

  // Formas de pagamento oferecidas no fechamento do pedido
  pagamentos: ['Pix', 'Cartão de crédito', 'Boleto'],
  // Texto da garantia na página do café. null vira placeholder.
  garantia: null,       // ex.: 'Chegou avariado? Mande a foto no WhatsApp em até 48 h e a gente troca.'
  // Prazo e regiões de entrega (texto livre). null vira placeholder.
  entrega: null,

  // Web3Forms do e-mail da CXF (cópia de segurança dos pedidos). null: só WhatsApp.
  web3formsKey: null
};
