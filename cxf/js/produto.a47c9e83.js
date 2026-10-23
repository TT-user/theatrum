// Página de café ou kit: galeria, tamanho, quantidade e "Adicionar à sacola" / "Comprar agora".
// O preço exibido vem do catálogo público; o servidor recalcula tudo no checkout (padrão, seção 8).
import { reais } from '/cxf/js/config.js';
import { catalogo, item as acharItem } from '/cxf/js/catalogo.js';
import { adicionar } from '/cxf/js/sacola.js';

const raiz = document.querySelector('[data-produto]');
if (raiz) {
  const form = raiz.querySelector('[data-compra]');
  const principal = raiz.querySelector('[data-galeria-principal]');
  const fontes = [...raiz.querySelector('template[data-galeria]').content.children];
  let qtd = 1;

  // Galeria: as miniaturas trocam a imagem grande
  raiz.addEventListener('click', (e) => {
    const m = e.target.closest('[data-mini]');
    if (!m) return;
    principal.innerHTML = fontes[+m.dataset.mini].innerHTML;
    raiz.querySelectorAll('[data-mini]').forEach((b) => { b.classList.toggle('ativo', b === m); b.setAttribute('aria-pressed', String(b === m)); });
  });

  async function atualizaPreco() {
    await catalogo();
    const it = acharItem(raiz.dataset.produto);
    const sku = form.variante?.value || form.querySelector('[name=variante]')?.value;
    const v = it?.variantes.find((x) => x.sku === sku);
    if (!v || v.precoCentavos == null) return; // sem preço: fica o placeholder que veio do build
    const ehKit = it.categoria === 'kits';
    raiz.querySelector('[data-produto-preco]').innerHTML =
      `${v.precoDeCentavos ? `<del><span class="sr-only">de </span>${reais(v.precoDeCentavos * qtd)}</del>` : ''}<b>${reais(v.precoCentavos * qtd)}</b><small>${ehKit ? 'preço fechado' : 'no Pix ou no cartão'}${qtd > 1 ? ` · ${qtd} unidades` : ''}</small>`;
  }

  form.addEventListener('change', atualizaPreco);
  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    qtd = Math.max(1, Math.min(20, qtd + +b.dataset.q));
    form.querySelector('[data-qtd]').textContent = qtd;
    atualizaPreco();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sku = form.querySelector('[name=variante]:checked, input[type=hidden][name=variante]').value;
    adicionar(sku, null, qtd);
    // "Comprar agora" e "Adicionar" abrem a sacola; o checkout (/carrinho) é a etapa 9
    document.querySelector('[data-abre="painel-sacola"]')?.click();
  });
}
