/* Nerd Club: o único arquivo que o dono precisa abrir para mudar contato,
   horário, redes e cupom. Campo em null vira placeholder amarelo na página:
   nunca preencha com chute, só com o que a loja confirmar. */
window.NC = {
  nome: 'Nerd Club',
  slogan: 'Restaurando memórias e criando novas histórias',

  // WhatsApp com DDI e DDD, só números
  zap: '5524998273443',
  zapIncubo: null, // a confirmar: a InCubo atende no mesmo número?

  endereco: {
    rua: 'R. Duque de Caxias, 77',
    complemento: 'Loja 42/43, dentro da galeria',
    bairro: 'Várzea',
    cidade: 'Teresópolis',
    uf: 'RJ',
    cep: '25953-390',
    geo: { lat: -22.4117774, lng: -42.9678887 }
  },
  horario: null, // ex.: 'Seg a sex 9h às 18h · Sáb 9h às 14h'
  cnpj: null,
  prazos: null, // ex.: 'limpeza em até 2 dias úteis; orçamento sem compromisso'

  instagram: 'lojanerdclub',
  instagramIncubo: 'incubocubo',
  shopee: 'https://shopee.com.br/shop/1194840850',

  // Easter egg (Fase 5). Sem cupom, o cheat mostra só a tela.
  cupom: null
};

/* Link de WhatsApp único do site. `origem` vai para a medição. */
window.whatsappLink = function (mensagem, numero) {
  return 'https://wa.me/' + (numero || window.NC.zap) + '?text=' + encodeURIComponent(mensagem);
};
