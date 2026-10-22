// Mega Academia (Itajaí): contato e chaves num lugar só.
// null vira placeholder amarelo na prévia. Mudou este arquivo, suba o ?v= dele no index.html.
window.MEGA = {
  nome: 'Mega',
  marca: 'Mega Academia',
  siglaProtocolo: 'MEGA',
  // Telefone do perfil do Google, dos flyers e da fachada. A bio do Instagram tem um wa.me/message
  // (QADFUOTS5WOUP1) do mesmo número, que não aceita texto pronto: o site usa o número direto.
  whatsapp: '5547999812516',
  whatsappTexto: '(47) 99981-2516',
  telefone: '(47) 3248-2966', // fixo, do letreiro da fachada
  email: null,
  instagram: 'megaacademiaitajai',

  // Endereço do perfil do Google. Os flyers dizem "Av. Campos Novos, 1212": confirmar.
  endereco: 'Av. Campos Novos, 1206',
  bairro: 'São Vicente',
  cidade: 'Itajaí, SC',
  cep: '88309-650',
  cnpj: null,

  // Horário de funcionamento, uma linha por item. Do perfil do Google e da bio do Instagram (22/10/2026).
  horario: ['Segunda a sexta: 5h45 às 23h', 'Sábado: 9h às 12h e 14h às 17h', 'Domingo: fechado'],
  // Formas de pagamento (texto livre). Dos flyers: Pix, dinheiro e cartão em até 12x. null vira placeholder.
  pagamento: 'Pix, dinheiro e cartão (em até 12x, conforme o plano)',

  // Página "Fale conosco" (contato/): canal oficial de sugestões, elogios e reclamações.
  // web3formsKey: chave do Web3Forms no e-mail da academia. null = a prévia envia pelo WhatsApp.
  web3formsKey: null,
  // Prazo de resposta e horário de atendimento (texto livre). null vira placeholder.
  prazoResposta: null,      // ex.: 'até 2 dias úteis'
  horarioAtendimento: null, // ex.: 'segunda a sexta, das 8h às 18h'

  // Linha fina acima do topo. null esconde.
  aviso: null,

  // Perfil "Mega Academia" no Google Maps (ftid 0x94d8ccbe4ce21401:0x7006daebf9a6d0ce)
  placeId: 'ChIJARTiTL7M2JQRztCm-evaBnA',
  lat: -26.9119889,
  lng: -48.7010084,
  rotaUrl: 'https://www.google.com/maps/dir/?api=1&destination=-26.9119889,-48.7010084&destination_place_id=ChIJARTiTL7M2JQRztCm-evaBnA',
  mapaEmbed: 'https://maps.google.com/maps?q=-26.9119889,-48.7010084&z=17&output=embed'
};
window.SITE = window.MEGA;
