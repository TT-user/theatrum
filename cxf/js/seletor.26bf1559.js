// Seletor rápido (padrão, seção 6): tamanho em chips, moagem em radio com dica, quantidade e
// "Adicionar", que só libera depois de escolher a moagem. No celular vira bottom sheet (CSS).
import { config, reais, moagem } from '/cxf/js/config.js';
import { catalogo, item as acharItem } from '/cxf/js/catalogo.js';
import { pacote } from '/cxf/js/pacote.js';
import { foto } from '/cxf/js/foto.js';
import { adicionar } from '/cxf/js/sacola.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ph = (t) => `<span class="ph">${t}</span>`;

function opcoesDe(it, v) {
  if (it.categoria === 'kits' && it.moagemUnica) return (config.moagens || []).map((m) => m.id);
  return v.opcoes || [];
}

export async function montar(alvo, slug) {
  await catalogo();
  const it = acharItem(slug);
  if (!it) return false;
  const ehKit = it.categoria === 'kits';
  const vs = it.variantes;
  let v = !ehKit && vs.length > 2 ? vs[1] : vs[0]; // café abre no tamanho do meio, o mais comum
  let qtd = 1;

  alvo.innerHTML = `<div class="seletor">
      <div class="seletor__foto" data-sel-foto>${foto(it, { sizes: '220px', alt: '' }) || pacote(it, v)}</div>
      <form class="seletor__corpo" data-sel-form novalidate>
        <div>
          <h2 id="seletor-nome">${esc(it.nome)}</h2>
          <p class="seletor__notas">${esc(it.notas)}</p>
        </div>
        ${vs.length > 1 ? `<fieldset class="grupo-opcoes"><legend>${ehKit ? 'Escolha o kit' : 'Tamanho'}</legend><div class="chips">${vs.map((x) =>
          `<label class="chip"><input type="radio" name="variante" value="${x.sku}"${x === v ? ' checked' : ''}><span>${esc(x.tamanho)}</span></label>`).join('')}</div></fieldset>` : ''}
        <fieldset class="grupo-opcoes" data-sel-moagem>
          <legend>Moagem${ehKit ? ' (uma para o kit todo)' : ''}</legend>
          <div class="radios">${(config.moagens || []).filter((m) => opcoesDe(it, v).includes(m.id)).map((m) =>
            `<label class="radio"><input type="radio" name="moagem" value="${m.id}"><span><b>${esc(m.nome)}</b></span></label>`).join('')}</div>
        </fieldset>
        <div class="seletor__compra">
          <p class="seletor__preco" data-sel-preco aria-live="polite"></p>
          <span class="qtd"><button type="button" data-sel-q="-1" aria-label="Menos um"><svg aria-hidden="true"><use href="#i-menos"/></svg></button><output data-sel-qtd aria-live="polite">1</output><button type="button" data-sel-q="1" aria-label="Mais um"><svg aria-hidden="true"><use href="#i-mais"/></svg></button></span>
          <button class="btn btn--preto" type="submit" data-sel-add disabled><svg aria-hidden="true"><use href="#i-sacola"/></svg>Escolha a moagem</button>
        </div>
      </form>
    </div>`;

  const form = alvo.querySelector('[data-sel-form]');
  const botao = alvo.querySelector('[data-sel-add]');
  function atualiza() {
    const p = v.precoCentavos;
    alvo.querySelector('[data-sel-preco]').innerHTML = p == null
      ? `${ph('[preço]')}<small>${ehKit ? 'preço fechado' : 'no Pix ou no cartão'}</small>`
      : `${v.precoDeCentavos ? `<del><span class="sr-only">de </span>${reais(v.precoDeCentavos * qtd)}</del>` : ''}<b>${reais(p * qtd)}</b><small>${ehKit ? 'preço fechado' : 'no Pix ou no cartão'}</small>`;
    alvo.querySelector('[data-sel-qtd]').textContent = qtd;
    const m = form.moagem?.value;
    botao.disabled = !m;
    botao.lastChild.textContent = m ? 'Adicionar' : 'Escolha a moagem';
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'variante') {
      v = vs.find((x) => x.sku === e.target.value);
      alvo.querySelector('[data-sel-foto]').innerHTML = foto(it, { sizes: '220px', alt: '' }) || pacote(it, v);
    }
    atualiza();
  });
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sel-q]');
    if (b) { qtd = Math.max(1, Math.min(20, qtd + +b.dataset.selQ)); atualiza(); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const m = form.moagem?.value;
    if (!m) return;
    adicionar(v.sku, m, qtd);
    alvo.dispatchEvent(new CustomEvent('adicionado', { bubbles: true, detail: { nome: it.nome, moagem: moagem(m)?.nome } }));
  });
  atualiza();
  return true;
}
