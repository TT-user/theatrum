/* Aceno: demonstração de agência fictícia (Marketing + Print), feita pela Theatrum.
   Marca, pessoas, endereços, telefones, números e depoimentos são inventados; as fotos são geradas por IA.
   Os links de WhatsApp caem no aviso de demonstração (../_demo.js), e o envio dos formulários também (demo: true). */
window.AG = {
  dominio: null,
  demo: true,

  marketing: {
    nome: 'Aceno Marketing',
    whatsapp: '5535900000000',
    whatsappTexto: '(35) 90000-0000',
    telefone: '(35) 90000-0000',
    endereco: 'Centro, Pouso Alegre, MG',
    horario: 'Segunda a sexta, das 9h às 18h',
    instagram: 'aceno.marketing',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Pouso+Alegre+MG',
    // só a cidade: a empresa não existe
    coordenadas: [-22.2302, -45.9363]
  },

  print: {
    nome: 'Aceno Print',
    whatsapp: '5535900000001',
    whatsappTexto: '(35) 90000-0001',
    telefone: '(35) 90000-0001',
    endereco: 'Região da rodoviária, Pouso Alegre, MG',
    horario: 'Segunda a sexta, das 8h às 18h; sábado, das 8h às 12h',
    instagram: 'aceno.print',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Pouso+Alegre+MG',
    coordenadas: [-22.2302, -45.9363]
  },

  whatsappProjetoCompleto: null,
  cnpj: null,

  rastrear: false
};

window.AG.track = function (evento, dados) {
  if (!window.AG.rastrear) return;
  (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: evento }, dados || {}));
};
