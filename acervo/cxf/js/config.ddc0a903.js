// Regras públicas da loja, lidas do <script id="loja-config"> que o build grava em toda página
// (padrão, seção 3). Servem SÓ para exibir: o servidor recalcula preço, desconto e frete.
const el = document.getElementById('loja-config');
export const config = el ? JSON.parse(el.textContent) : {};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
// Todo valor da loja anda em centavos (inteiro); só vira reais na hora de mostrar
export function reais(centavos) { return BRL.format(centavos / 100); }


export function linkWhatsApp(texto = config.waText) {
  return 'https://wa.me/' + (config.whatsapp || '') + '?text=' + encodeURIComponent(texto || '');
}
