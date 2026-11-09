// O2 Fitness Academia: contato e chaves num lugar só.
// null vira placeholder amarelo na prévia. Mudou este arquivo, suba o ?v= dele no index.html.
window.O2 = {
  nome: 'O2',
  marca: 'O2 Fitness Academia',
  siglaProtocolo: 'O2',
  // wa.me da bio do Instagram (@o2_fitness_academia); é o mesmo telefone do perfil do Google
  whatsapp: '5532984469695',
  whatsappTexto: '(32) 98446-9695',
  email: null,
  instagram: 'o2_fitness_academia',

  endereco: 'R. José Grillo, 140',
  bairro: 'Centro',
  cidade: 'Espera Feliz, MG',
  cep: '36830-000',
  cnpj: null,

  // Horário de funcionamento, texto livre, uma linha por item. null vira placeholder.
  // O Google mostrou "quarta-feira, 06:00 a 22:00" em 21/10/2026; os outros dias não abriram sem login.
  // ex.: ['Segunda a sexta: 6h às 22h', 'Sábado: 8h às 12h']
  horario: null,
  // Formas de pagamento aceitas (texto livre). null vira placeholder.
  pagamento: null,

  // Página "Fale conosco" (contato/): canal oficial de sugestões, elogios e reclamações.
  // web3formsKey: chave do Web3Forms no e-mail da academia. null = a prévia envia pelo WhatsApp.
  web3formsKey: null,
  // Prazo de resposta e horário de atendimento (texto livre). null vira placeholder.
  prazoResposta: null,      // ex.: 'até 2 dias úteis'
  horarioAtendimento: null, // ex.: 'segunda a sexta, das 8h às 18h'

  // Linha fina acima do topo. null esconde.
  aviso: null,

  // Perfil "O2 Fitness Academia" no Google Maps (ftid 0xbb9f4c3bcf27bd:0x993fae5d8e9e4878)
  placeId: 'ChIJvSfPO0yfuwAReEiejl2uP5k',
  lat: -20.6532771,
  lng: -41.908124,
  rotaUrl: 'https://www.google.com/maps/dir/?api=1&destination=-20.6532771,-41.908124&destination_place_id=ChIJvSfPO0yfuwAReEiejl2uP5k',
  mapaEmbed: 'https://maps.google.com/maps?q=-20.6532771,-41.908124&z=17&output=embed'
};
window.SITE = window.O2;
