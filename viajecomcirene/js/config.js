// Agência Viaje com Cirene (Carangola, MG): tudo o que a agência muda sem mexer no resto do código.
// null vira placeholder amarelo na prévia. Viagens, avaliações e dúvidas ficam em data/*.json.
window.VC = {
  nome: 'Agência Viaje com Cirene',
  // WhatsApp dos stories, da bio e do perfil do Google: (32) 99810-4140
  whatsapp: '5532998104140',
  whatsappTexto: '(32) 99810-4140',
  instagram: 'https://www.instagram.com/viajecomcirene/',
  instagramTexto: '@viajecomcirene',
  facebook: 'https://www.facebook.com/ViajecomCirene',
  email: null,                 // o Linktree tem um botão de e-mail; pedir o endereço

  // Perfil do Google "EXCURSÃO CIRENE FREITAS - CARANGOLA" (conferido no Chrome em 02/11/2026)
  endereco: 'Av. Cap. Antônio Carlos de Souza, 529, Santa Maria, Carangola, MG, 36800-000',
  enderecoCurto: 'Av. Cap. Antônio Carlos de Souza, 529, Santa Maria',
  cidade: 'Carangola, MG',
  horario: ['Segunda a sexta, das 9h às 18h', 'Sábado e domingo, fechado'],
  lat: -20.7215964,
  lng: -42.0388804,
  rotaUrl: 'https://www.google.com/maps/dir/?api=1&destination=-20.7215964,-42.0388804',
  mapaEmbed: 'https://maps.google.com/maps?q=-20.7215964,-42.0388804&z=16&output=embed',
  googlePerfil: 'https://www.google.com/maps/place/?q=place_id:ChIJO_UThcx7uwARChzzsBh075Q',
  // ftid 0xbb7bcc8513f53b:0x94ef7418b0f31c0a, conferido em 02/11/2026 (título "EXCURSÃO CIRENE FREITAS - CARANGOLA")
  avaliarUrl: 'https://search.google.com/local/writereview?placeid=ChIJO_UThcx7uwARChzzsBh075Q',
  nota: '4,9',
  totalAvaliacoes: 50,

  cnpj: null,
  cadastur: null,              // agência de turismo precisa de cadastro no Cadastur (Ministério do Turismo)
  pontoEmbarque: null,         // de onde saem os ônibus e a que horas

  // Tudo o que o site rastreia fica desligado na prévia (sem tag nenhuma)
  rastrear: false
};
