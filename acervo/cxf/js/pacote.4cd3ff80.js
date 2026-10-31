// Pacote da CXF desenhado em SVG (a embalagem preta com a etiqueta creme e a gravura da lavoura).
// Fica no lugar da foto enquanto a CXF não tem fotos de produto (fora do escopo).
// Módulo puro, sem DOM: o build (Node) e o navegador usam o mesmo arquivo.
// Os degradês #g-pacote e #g-sombra e os símbolos #cxf-simbolo/#cxf-logo vêm do sprite do layout.

const TORRAS = {
  clara: { nome: 'TORRA CLARA', cor: '#B98A55', n: 1 },
  media: { nome: 'TORRA MÉDIA', cor: '#7A4A26', n: 2 },
  intensa: { nome: 'TORRA INTENSA', cor: '#3B2417', n: 3 }
};
const GRAV = '/acervo/cxf/assets/img/gravura-480.webp';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function dentes() {
  let d = '';
  for (let x = 22; x < 178; x += 6) d += `L${x + 3} 9L${x + 6} 12`;
  return d;
}

// Um pacote em pé, viewBox 0 0 200 300
function saco(torra, peso) {
  const t = TORRAS[torra] || TORRAS.media;
  let pontos = '';
  for (let i = 0; i < 3; i++) {
    pontos += `<circle cx="${90 + i * 10}" cy="171" r="2.6" ${i < t.n ? 'fill="#141210"' : 'fill="none" stroke="#141210" stroke-width=".8"'}/>`;
  }
  return '<path d="M24 24h152q6 0 6 8l5 246q0 12-12 12H25q-12 0-12-12l5-246q0-8 6-8Z" fill="url(#g-pacote)"/>' +
    `<path d="M22 12h156v14H22Z" fill="#1d1b19"/><path d="M22 12${dentes()}V12Z" fill="#262321"/>` +
    '<circle cx="100" cy="52" r="6" fill="#0c0b0a" stroke="#2c2926" stroke-width="2"/>' +
    `<rect x="36" y="70" width="128" height="190" fill="#F2EBDD"/><rect x="36" y="70" width="128" height="5" fill="${t.cor}"/>` +
    '<rect x="40.5" y="79" width="119" height="176.5" fill="none" stroke="#141210" stroke-width=".7"/>' +
    '<use href="#cxf-logo" x="52" y="92" width="96" height="40" color="#141210"/>' +
    '<path d="M93 141h14" stroke="#141210" stroke-width=".7"/>' +
    `<text x="100" y="160" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="7.6" letter-spacing="1.8" fill="#141210">${t.nome}</text>${pontos}` +
    `<image href="${GRAV}" x="41" y="189" width="118" height="66" preserveAspectRatio="xMidYMax slice"/>` +
    `<text x="100" y="279" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="9" letter-spacing="1.5" fill="#B9AE9C">${esc(peso)}</text>`;
}

// Caixa de drip coffee
function caixaDrip() {
  return '<rect x="22" y="40" width="156" height="244" rx="4" fill="#F2EBDD"/><rect x="22" y="40" width="156" height="72" rx="4" fill="#141210"/><rect x="22" y="100" width="156" height="12" fill="#141210"/>' +
    '<text x="100" y="74" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="15" letter-spacing="2" fill="#F2EBDD">DRIP</text>' +
    '<text x="100" y="92" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="7.5" letter-spacing="3" fill="#B9AE9C">COFFEE</text>' +
    '<use href="#cxf-logo" x="50" y="124" width="100" height="42" color="#141210"/>' +
    '<text x="100" y="186" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="7.6" letter-spacing="1.8" fill="#141210">10 SACHÊS</text>' +
    `<image href="${GRAV}" x="26" y="200" width="148" height="80" preserveAspectRatio="xMidYMax slice"/>` +
    '<rect x="22" y="40" width="156" height="244" rx="4" fill="none" stroke="rgba(0,0,0,.12)"/>';
}

// Caixa de papelão da Caixa 5 kg
function caixa5kg() {
  return '<path d="M18 92 100 60l82 32v170l-82 32-82-32Z" fill="#C9A77A"/><path d="M100 124v170l82-32V92Z" fill="#B48F62"/><path d="M18 92 100 60l82 32-82 32Z" fill="#DCBF95"/>' +
    '<path d="M59 76 141 108" stroke="#a88457" stroke-width="6"/>' +
    '<g transform="matrix(.82 .32 0 1 26 132)"><rect width="78" height="96" fill="#F2EBDD"/><use href="#cxf-logo" x="8" y="12" width="62" height="26" color="#141210"/>' +
    '<text x="39" y="66" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="15" fill="#141210">5 KG</text>' +
    '<text x="39" y="80" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="5.6" letter-spacing="1.2" fill="#141210">10 x 500 g</text></g>';
}

const sombra = (w) => `<ellipse cx="${w / 2}" cy="292" rx="${w / 2 - 6}" ry="10" fill="url(#g-sombra)"/>`;
const svg = (w, dentro, rotulo) => `<svg viewBox="0 0 ${w} 306" class="pacote" ${rotulo ? `role="img" aria-label="${esc(rotulo)}"` : 'aria-hidden="true"'}>${sombra(w)}${dentro}</svg>`;
const aninha = (dentro, x, y, s) => `<svg x="${x}" y="${y}" width="${200 * s}" height="${300 * s}" viewBox="0 0 200 300" overflow="visible">${dentro}</svg>`;

// Vários pacotes lado a lado: o do meio na frente, os outros menores atrás
export function grupo(itens) {
  if (itens.length === 1) return svg(200, saco(itens[0][0], itens[0][1]));
  if (itens.length === 2) return svg(300, aninha(saco(itens[0][0], itens[0][1]), 0, 30, .9) + aninha(saco(itens[1][0], itens[1][1]), 116, 0, 1));
  const [a, b, c] = itens;
  return svg(364, aninha(saco(a[0], a[1]), 0, 48, .84) + aninha(saco(c[0], c[1]), 196, 48, .84) + aninha(saco(b[0], b[1]), 88, 0, 1));
}

// Desenho de um produto ou kit (e, opcionalmente, da variante escolhida)
export function pacote(item, variante) {
  if (item.torra === 'drip') return svg(200, caixaDrip());
  if (item.tipo === 'single') return svg(200, saco(item.torra, (variante || item.variantes[0]).tamanho));
  switch (item.slug) {
    case 'degustacao-3-torras': return grupo([['clara', '250 g'], ['media', '250 g'], ['intensa', '250 g']]);
    case 'dupla': {
      const t = variante ? { 'KIT-DUP-CLA': 'clara', 'KIT-DUP-INT': 'intensa' }[variante.sku] || 'media' : 'media';
      return grupo([[t, '500 g'], [t, '500 g']]);
    }
    case 'kit-mes': {
      const t = { 'KIT-MES-MED': ['media', 'media'], 'KIT-MES-INT': ['intensa', 'intensa'] }[variante?.sku] || ['media', 'intensa'];
      return grupo([[t[0], '500 g'], [t[1], '500 g'], [t[0], '500 g']]);
    }
    case 'caixa-5kg': return svg(200, caixa5kg());
    default: return grupo([['clara', '500 g'], ['intensa', '500 g'], ['media', '500 g']]);
  }
}
