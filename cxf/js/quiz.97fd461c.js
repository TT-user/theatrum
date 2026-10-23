// Quiz "Qual é o meu café?": quantidade pelo consumo da casa.
// Conta: pessoas x xícaras por dia x gramas por xícara x 30 dias = gramas por mês (src/data/quiz.json).
import { reais, linkWhatsApp } from '/cxf/js/config.js';
import { catalogo, sku as acharSku } from '/cxf/js/catalogo.js';
import { foto } from '/cxf/js/foto.js';
import { pacote } from '/cxf/js/pacote.js';
import { adicionar } from '/cxf/js/sacola.js';

const caixa = document.querySelector('[data-quiz]');
const dados = JSON.parse(document.getElementById('quiz-dados')?.textContent || 'null');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const LETRAS = 'ABCDEF';
let resp = [];

function pergunta() {
  const i = resp.length;
  if (i === dados.perguntas.length) return resultado();
  const q = dados.perguntas[i];
  caixa.innerHTML = `<p class="quiz__passo"><span>Pergunta ${i + 1} de ${dados.perguntas.length}</span>${i ? '<button type="button" class="link" data-volta>Voltar</button>' : ''}</p>
    <div class="quiz__barra"><i style="width:${((i + 1) / dados.perguntas.length) * 100}%"></i></div>
    <h2>${esc(q.pergunta)}</h2><p class="quiz__dica">${esc(q.dica)}</p>
    <div class="quiz__opcoes">${q.opcoes.map((o, k) => `<button type="button" class="quiz__op" data-resp="${k}"><b>${LETRAS[k]}</b><span>${esc(o.texto)}</span></button>`).join('')}</div>`;
  caixa.querySelector('.quiz__op')?.focus({ preventScroll: true });
}

async function resultado() {
  await catalogo();
  const [pessoas, xic] = resp.map((k, i) => dados.perguntas[i].opcoes[k].valor);
  const xicMes = Math.round(pessoas * xic * 30);
  const gramas = xicMes * dados.gramasPorXicara;
  const faixa = dados.porGramasMes.find((f) => f.ate == null || gramas <= f.ate);
  const achado = acharSku(faixa.sku);
  if (!achado) { caixa.innerHTML = '<p>Não consegui montar a indicação agora.</p>'; return; }
  const { item, variante } = achado;
  const idx = dados.porGramasMes.indexOf(faixa);
  const menor = idx > 0 ? acharSku(dados.porGramasMes[idx - 1].sku) : null;
  const kg = gramas >= 1000 ? `${(gramas / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg` : `${gramas} g`;

  caixa.innerHTML = `<p class="quiz__passo"><span>O seu café</span><button type="button" class="link" data-refaz>Refazer</button></p>
    <div class="quiz__barra"><i style="width:100%"></i></div>
    <div class="quiz-res">
      <div class="quiz-res__foto">${foto(item, { sizes: '200px', alt: '' }) || pacote(item)}</div>
      <div>
        <h2>${esc(item.nome)}</h2>
        <p class="quiz-res__conta">A sua casa toma cerca de <b>${xicMes} xícaras por mês</b>, uns <b>${kg}</b> de café.</p>
        <ul class="quiz-res__lista">
          <li><span>Quantidade</span><b>${esc(variante.tamanho)}</b></li>
          <li><span>Preço</span><b>${variante.precoCentavos == null ? '<span class="ph">[preço]</span>' : reais(variante.precoCentavos)}</b></li>
        </ul>
        ${menor && menor.item !== item ? `<p class="quiz-res__alt">Prefere comprar menos de cada vez? <a href="/cxf/${menor.item.categoria}/${menor.item.slug}">${esc(menor.item.nome)}</a>.</p>` : ''}
      </div>
    </div>
    <div class="quiz-res__botoes">
      <button type="button" class="btn btn--preto" data-colocar><svg aria-hidden="true"><use href="#i-sacola"/></svg>Colocar na sacola</button>
      <a class="btn btn--linha" href="/cxf/${item.categoria}/${item.slug}">Ver detalhes</a>
      <a class="link" href="${linkWhatsApp('Olá! Fiz o quiz no site da CXF e quero uma dica.')}" target="_blank" rel="noopener">Pedir uma dica no WhatsApp</a>
    </div>`;
  caixa.querySelector('[data-colocar]').addEventListener('click', () => {
    adicionar(variante.sku, null, 1);
    document.querySelector('[data-abre="painel-sacola"]')?.click();
  });
  caixa.querySelector('h2')?.setAttribute('tabindex', '-1');
  caixa.querySelector('h2')?.focus({ preventScroll: true });
}

if (caixa && dados) {
  caixa.addEventListener('click', (e) => {
    const r = e.target.closest('[data-resp]');
    if (r) { resp.push(+r.dataset.resp); pergunta(); return; }
    if (e.target.closest('[data-volta]')) { resp.pop(); pergunta(); return; }
    if (e.target.closest('[data-refaz]')) { resp = []; pergunta(); }
  });
  pergunta();
}
