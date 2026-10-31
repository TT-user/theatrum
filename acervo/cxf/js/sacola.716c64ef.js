// Sacola (padrão, seção 6): estado no localStorage, gaveta lateral, frete por CEP e barra de frete grátis.
// Guarda só SKU e quantidade. Nome e preço vêm do catálogo; o checkout manda só SKU e quantidade.
import { config, reais } from '/acervo/cxf/js/config.js';
import { catalogo, sku as acharSku } from '/acervo/cxf/js/catalogo.js';
import { pacote } from '/acervo/cxf/js/pacote.js';
import { foto } from '/acervo/cxf/js/foto.js';

const CHAVE = 'cxf-sacola';
const MAX = 20;
const ouvintes = new Set();
let itens = ler();

function ler() {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE));
    if (!Array.isArray(s)) return [];
    // sacolas salvas antes de a moagem sair: junta os itens do mesmo SKU
    const por = new Map();
    for (const i of s) if (i && i.sku && i.quantidade > 0) por.set(i.sku, Math.min(MAX, (por.get(i.sku) || 0) + i.quantidade));
    return [...por].map(([sku, quantidade]) => ({ sku, quantidade }));
  } catch { return []; }
}
function gravar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(itens)); } catch { /* sem armazenamento: vale só durante a visita */ }
  for (const f of ouvintes) f(itens);
}

export const quantidadeTotal = () => itens.reduce((s, i) => s + i.quantidade, 0);
export function aoMudar(f) { ouvintes.add(f); f(itens); }

// O 2º parâmetro (moagem) ficou de quando havia escolha de moagem; é ignorado.
export function adicionar(skuId, _moagem = null, quantidade = 1) {
  const i = itens.find((x) => x.sku === skuId);
  if (i) i.quantidade = Math.min(MAX, i.quantidade + quantidade);
  else itens.push({ sku: skuId, quantidade: Math.min(MAX, quantidade) });
  gravar();
}
function mudar(idx, delta) {
  const i = itens[idx]; if (!i) return;
  i.quantidade = Math.max(0, Math.min(MAX, i.quantidade + delta));
  if (!i.quantidade) itens.splice(idx, 1);
  gravar();
}
function remover(idx) { itens.splice(idx, 1); gravar(); }

const ph = (t) => `<span class="ph">${t}</span>`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Barra de frete grátis: só aparece quando a CXF definir os mínimos por estado
function barraFrete(subtotal, conhecido) {
  const limites = Object.values(config.frete?.gratisPorUF || {}).filter((v) => v != null).sort((a, b) => a - b);
  if (!limites.length) return `<p class="barra-frete">${ph('[regra de frete grátis por estado]')}</p>`;
  if (!conhecido) return '';
  const alvo = limites.find((l) => subtotal < l);
  const maior = limites[limites.length - 1];
  const pct = Math.min(100, (subtotal / maior) * 100);
  const msg = alvo ? `Faltam <b>${reais(alvo - subtotal)}</b> para o frete grátis${limites.length > 1 && alvo === limites[0] ? ' na sua região' : ''}.` : 'Você ganhou <b>frete grátis</b> no envio econômico.';
  return `<div class="barra-frete"><span>${msg}</span><div class="barra-frete__trilho"><i style="width:${pct}%"></i></div></div>`;
}

export async function desenhar(alvo) {
  await catalogo();
  // descarta o que saiu do catálogo
  const antes = itens.length;
  itens = itens.filter((i) => acharSku(i.sku));
  if (itens.length !== antes) gravar();

  if (!itens.length) {
    alvo.innerHTML = `<div class="sacola__vazia"><p>A sacola está vazia. Que tal começar por aqui:</p>
      <a class="btn btn--preto" href="/acervo/cxf/#vitrine" data-fecha>Ver o café</a>
      <a class="btn btn--linha" href="/acervo/cxf/kits">Ver os kits</a>
      <a class="btn btn--linha" href="/acervo/cxf/quiz">Não sei qual escolher</a></div>`;
    return;
  }
  let subtotal = 0, conhecido = true;
  const linhas = itens.map((i, k) => {
    const { item, variante } = acharSku(i.sku);
    const preco = variante.precoCentavos;
    if (preco == null) conhecido = false; else subtotal += preco * i.quantidade;
    return `<li>${foto(item, { sizes: '58px', alt: '' }) || pacote(item, variante)}
      <span><b>${esc(item.nome)}</b><small>${esc(variante.tamanho)}</small><small>${preco == null ? ph('[preço]') : reais(preco * i.quantidade)}</small></span>
      <span class="sacola__item-lado">
        <span class="qtd"><button type="button" data-q="-1" data-k="${k}" aria-label="Menos um ${esc(item.nome)}"><svg aria-hidden="true"><use href="#i-menos"/></svg></button><output aria-live="polite">${i.quantidade}</output><button type="button" data-q="1" data-k="${k}" aria-label="Mais um ${esc(item.nome)}"><svg aria-hidden="true"><use href="#i-mais"/></svg></button></span>
        <button type="button" class="sacola__remover" data-remover="${k}"><svg aria-hidden="true"><use href="#i-lixo"/></svg>Remover<span class="sr-only"> ${esc(item.nome)}</span></button>
      </span></li>`;
  }).join('');
  alvo.innerHTML = `<ul class="sacola__lista">${linhas}</ul>
    <div class="sacola__rodape">
      <form class="frete-cep" data-frete novalidate>
        <label class="sr-only" for="sacola-cep">CEP para calcular o frete</label>
        <input id="sacola-cep" inputmode="numeric" autocomplete="postal-code" placeholder="CEP para o frete" maxlength="9">
        <button class="btn btn--linha" type="submit">Calcular</button>
      </form>
      <p class="frete-res" data-frete-res aria-live="polite"></p>
      ${barraFrete(subtotal, conhecido)}
      <p class="sacola__total"><span>Subtotal</span>${conhecido ? `<b>${reais(subtotal)}</b>` : ph('[a CXF confirma os preços]')}</p>
      <a class="btn btn--preto btn--cheio" href="/acervo/cxf/carrinho">Revisar e finalizar</a>
      <p class="sacola__aviso">O mínimo do frete grátis conta depois do cupom, e o envio expresso é sempre cobrado.</p>
    </div>`;
}

// Liga os botões da gaveta (uma vez)
export function ligar(alvo) {
  alvo.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) { mudar(+q.dataset.k, +q.dataset.q); return; }
    const r = e.target.closest('[data-remover]');
    if (r) remover(+r.dataset.remover);
  });
  alvo.addEventListener('input', (e) => {
    if (e.target.id !== 'sacola-cep') return;
    const d = e.target.value.replace(/\D/g, '').slice(0, 8);
    e.target.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  });
  alvo.addEventListener('submit', (e) => {
    if (!e.target.matches('[data-frete]')) return;
    e.preventDefault();
    const cep = e.target.querySelector('input').value.replace(/\D/g, '');
    const res = alvo.querySelector('[data-frete-res]');
    if (cep.length !== 8) { res.textContent = 'Confira o CEP: são 8 números.'; return; }
    // A cotação pela Function calcularFrete entra na etapa 8 (Correios ou Melhor Envio)
    res.innerHTML = ph('[cotação de frete: etapa 8]');
  });
  aoMudar(() => { if (!alvo.closest('[hidden]')) desenhar(alvo); });
}
