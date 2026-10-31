// Catálogo público (/acervo/cxf/dados/catalogo.json, gerado no build). Baixa uma vez só por página.
// Os preços daqui são só para mostrar: o servidor recalcula tudo no checkout (padrão, seção 8).
let promessa = null;
const porSku = new Map();
const porSlug = new Map();

export function catalogo() {
  promessa ||= fetch('/acervo/cxf/dados/catalogo.json')
    .then((r) => { if (!r.ok) throw new Error('catálogo'); return r.json(); })
    .then((c) => {
      for (const item of [...c.produtos, ...c.kits]) {
        porSlug.set(item.slug, item);
        for (const v of item.variantes) porSku.set(v.sku, { item, variante: v });
      }
      return c;
    });
  return promessa;
}

export const item = (slug) => porSlug.get(slug) || null;
export const sku = (s) => porSku.get(s) || null;
