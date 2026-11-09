// RAR Academia: contato e chaves num lugar só.
// null vira placeholder amarelo na prévia. Mudou este arquivo, suba o ?v= dele no index.html.
window.RAR = {
  nome: 'RAR',
  marca: 'RAR Academia',
  siglaProtocolo: 'RAR',
  // "Faça parte desta família!" do Linktree (linktr.ee/RARACADEMIA) leva a este número; é o mesmo telefone do perfil do Google
  whatsapp: '5548996143147',
  whatsappTexto: '(48) 99614-3147',
  telefone: '(48) 99614-3147',
  email: null,
  instagram: 'rar.academia',

  endereco: 'Rod. Abílio Manoel de Lima, km 7',
  bairro: 'Encantada',
  cidade: 'Garopaba, SC',
  cep: '88495-000',
  cnpj: null,

  // Story "Novo horário de funcionamento" (o Google confere: quinta, 6h às 22h, em 22/10/2026)
  horario: ['Segunda a sexta: 6h às 22h', 'Sábado: 9h às 15h', 'Domingo: 8h às 11h'],
  // Formas de pagamento aceitas (texto livre). null vira placeholder.
  pagamento: null,

  // Página "Fale conosco" (contato/): canal oficial de sugestões, elogios e reclamações.
  // web3formsKey: chave do Web3Forms no e-mail da academia. null = a prévia envia pelo WhatsApp.
  web3formsKey: null,
  prazoResposta: null,      // ex.: 'até 2 dias úteis'
  horarioAtendimento: null, // ex.: 'segunda a sexta, das 8h às 18h'

  // Linha fina acima do topo. null esconde.
  aviso: 'Aberta todos os dias: seg. a sex. 6h às 22h · sáb. 9h às 15h · dom. 8h às 11h',

  // Tour 360° publicado no perfil do Google (RD 360 Tour Virtual). O id é o "ik" do link do photosphere.
  tour360: 'https://www.google.com/maps/embed?pb=!4v1729600000000!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJQ1ozLWl5a3dF!2m2!1d-28.0710571!2d-48.6628739!3f301.77!4f0!5f0.78',

  // Coordenadas do perfil "RAR Academia" no Google Maps
  lat: -28.0710571,
  lng: -48.6628739,
  mapsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJbWaaTIXTJpURlFr3g9EC2rg',
  rotaUrl: 'https://www.google.com/maps/dir/?api=1&destination=-28.0710571,-48.6628739&destination_place_id=ChIJbWaaTIXTJpURlFr3g9EC2rg',
  mapaEmbed: 'https://maps.google.com/maps?q=-28.0710571,-48.6628739&z=16&output=embed'
};
window.SITE = window.RAR;
