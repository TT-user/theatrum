/* Agrega: o que o cliente muda sem mexer no resto do código.
   null vira placeholder amarelo na página. Fonte de cada dado em interno/clientes/agrega/README.md. */
window.AG = {
  dominio: null, // ex.: agrega.com.br

  marketing: {
    nome: 'Agrega Marketing',
    // destino do "Agende uma reunião" da bio do @somosagrega (bit.ly/somosagrega → página do Canva → wa.me)
    whatsapp: '5532999136731',
    whatsappTexto: '(32) 99913-6731',
    // telefone da ficha do Google: outro número, a confirmar qual fica no site
    telefone: '(32) 98413-7601',
    endereco: 'Praça Dr. José Augusto, 59, apto 201, Centro, Espera Feliz, MG, 36830‑000',
    horario: 'Segunda a sexta, das 8h30 às 18h',
    instagram: 'somosagrega',
    mapa: 'https://maps.google.com/?cid=15306134654430651699',
    podcast: null, // endereço de incorporação do episódio (YouTube /embed/... ou Spotify /embed/...)
    coordenadas: [-20.650607, -41.9089815]
  },

  print: {
    nome: 'Agrega Print',
    whatsapp: '5532984005156',
    whatsappTexto: '(32) 98400-5156',
    telefone: '(32) 98400-5156',
    endereco: 'Anel Rodoviário, BR-482, 77, Centro, Espera Feliz, MG, 36830‑000',
    horario: 'Segunda a sexta, das 8h às 18h',
    instagram: 'agrega.print',
    mapa: 'https://maps.google.com/?cid=16912747249296851981',
    coordenadas: [-20.6548999, -41.9050279]
  },

  // quem recebe os pedidos do Projeto Completo; enquanto null, vai para a Marketing
  whatsappProjetoCompleto: null,
  cnpj: null,

  // GA4 e Pixel só no site oficial, depois do aceite de cookies. Na prévia não sai nada.
  rastrear: false
};

/* eventos da seção 10 (portal_choose_side, quote_send_whatsapp...): com rastrear = false não saem */
window.AG.track = function (evento, dados) {
  if (!window.AG.rastrear) return;
  (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: evento }, dados || {}));
};
