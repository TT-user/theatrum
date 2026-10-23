// Foto de produto ou kit: <img> em WebP com srcset (padrão, seção 6). Item sem foto cai no
// pacote desenhado: quem chama faz `foto(x) || pacote(x)`. Sem import, porque o build (Node) também usa
// este arquivo e lá "/cxf/js/..." não resolve.

const LARGURAS = { cafes: [320, 600, 770], kits: [400, 800] };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Proporção (largura/altura) de cada arte, para o navegador reservar o espaço e a página não pular
const PROPORCAO = { 'torra-tradicional': 768 / 1397, 'kit-dupla': 800 / 814, 'kit-mes': 800 / 773, 'kit-familia': 800 / 657, 'kit-caixa': 800 / 610 };

export function foto(item, { sizes = '(min-width: 1000px) 30vw, 50vw', lazy = true, classe = 'foto', alt } = {}) {
  const base = item.imagens?.[0];
  if (!base) return '';
  const ls = LARGURAS[item.categoria] || LARGURAS.kits;
  const maior = ls[ls.length - 1];
  const w = maior;
  const h = Math.round(maior / (PROPORCAO[base] || 1));
  const src = (l) => `/cxf/assets/img/produtos/${base}-${l}.webp`;
  return `<img class="${classe}" src="${src(ls[1] || ls[0])}" srcset="${ls.map((l) => `${src(l)} ${l === 770 ? 768 : l}w`).join(', ')}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt ?? item.nome)}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>`;
}
