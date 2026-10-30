// Ordem da vitrine [02] da home (objeto VS do index.html): quatro blocos que trocam de site sozinhos.
// Confere, simulando o relógio, que dois blocos nunca mostram o mesmo tipo de negócio ao mesmo tempo
// e que nenhum bloco repete o tipo de um site para o seguinte.
//
//   node scripts/vitrine-ordem.mjs                    só confere a ordem que está no index.html
//   node scripts/vitrine-ordem.mjs --busca --fixo aceno --tamanhos 7,7,7,6 [--folga 0] [--vizinhos 1]
//                                                     procura uma ordem sem colisão (recozimento simulado)
//                                                     com "aceno" em primeiro no primeiro bloco e reescreve o VS
//   --arquivo outro.html                              trabalha numa cópia (para rodar buscas em paralelo)
//
// O relógio é o do script da vitrine: TEMPO = 5200 ms no bloco mais longo, CICLO = TEMPO x maior bloco,
// cada bloco segura cada site CICLO / tamanho e começa defasado b x TEMPO / 4. A troca é em degradê e
// espera a próxima imagem: com --folga N, cada site conta como visível N ms antes e depois da sua vez
// (a ordem de 13/10/2026 e a de 28/10/2026, com a Aceno, foram achadas sem folga; com 400 ms e um
// par em sequência a busca não fechou).
// Tipo: TIPOS abaixo; site que não está lá é tipo único (não colide com ninguém).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (n) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : null; };
const ARQ = arg('--arquivo') ? path.resolve(arg('--arquivo')) : path.join(RAIZ, 'index.html');
const TEMPO = 5200, PASSO = 50;
const TIPOS = {
  'seis-panos': 'loja', 'little-trees': 'loja',
  'bruno-tavares': 'imoveis', 'vista-imoveis': 'imoveis', 'reserva-aurora': 'imoveis', 'mare-mansa': 'imoveis', 'vertice': 'imoveis',
  'nutri-clinica': 'nutricao', 'nutri-usa': 'nutricao', 'beatriz-lemos': 'nutricao', 'lara-mendonca': 'nutricao',
  'nutri-infantil': 'nutricao', 'nutri-emagrecimento': 'nutricao',
  'cozinha-viva': 'planejados', 'moratta': 'planejados', 'casa-nobre': 'planejados', 'medida-certa': 'planejados',
  // marcenaria conta separado de planejados
  'atelie-verga': 'marcenaria', 'cerne': 'marcenaria',
};
const tipo = (img) => TIPOS[img] || img;

const FOLGA = Number(arg('--folga') ?? 0);

const html = fs.readFileSync(ARQ, 'utf8');
const ini = html.indexOf('const VS = [');
const fim = html.indexOf('\n  ];', ini);
if (ini < 0 || fim < 0) throw new Error('não achei o const VS no index.html');
const trecho = html.slice(ini, fim);
// cada site é uma linha {img:'...', ...}; guarda a linha inteira para reescrever sem mexer no texto
const blocos = [...trecho.matchAll(/\[\s*((?:\{img:[^\n]*\}\s*,?\s*)+)\]/g)]
  .map((m) => [...m[1].matchAll(/\{img:'([^']+)'[^\n]*?\}(?=\s*(?:,|$))/gm)].map((x) => ({ img: x[1], linha: x[0] })));

function colisao(lista) {
  const n = lista.map((l) => l.length), ciclo = TEMPO * Math.max(...n);
  // [início, fim) de cada site em dois ciclos, mais a abertura (o primeiro site fica desde o 0)
  const vezes = lista.map((l, b) => {
    const t = ciclo / l.length, fase = b * TEMPO / 4, v = [];
    for (let volta = 0; volta < 2; volta++)
      l.forEach((s, k) => v.push([fase + (volta * l.length + k) * t, fase + (volta * l.length + k + 1) * t, tipo(s.img)]));
    v.push([0, fase + t, tipo(l[0].img)]);
    return v;
  });
  let ruim = 0;
  for (let ms = 0; ms < 2 * ciclo; ms += PASSO) {
    const vistos = new Map();
    vezes.forEach((v, b) => v.forEach(([a, z, ti]) => {
      if (ms >= a - FOLGA && ms < z + FOLGA) {
        if (!vistos.has(ti)) vistos.set(ti, new Set());
        vistos.get(ti).add(b);
      }
    }));
    for (const s of vistos.values()) if (s.size > 1) ruim += s.size - 1;
  }
  return ruim * PASSO;
}

// dentro do bloco, o mesmo tipo em sequência (contando a volta do último para o primeiro) cansa
function vizinhos(lista) {
  return lista.reduce((n, l) => n + l.filter((s, k) => l.length > 1 && tipo(s.img) === tipo(l[(k + 1) % l.length].img)).length, 0);
}
// --vizinhos N aceita até N pares do mesmo tipo em sequência (a ordem de 13/10/2026 tinha 1): custo 0 = serve
const TOLERA = Number(arg('--vizinhos') || 0);
const custo = (l) => colisao(l) + 1000 * Math.max(0, vizinhos(l) - TOLERA);
const nomes = (l) => l.map((b) => b.map((s) => s.img).join(' '));
console.log('ordem atual:', blocos.map((b) => b.length).join('/'), 'sites; colisão', colisao(blocos), 'ms; mesmo tipo em sequência', vizinhos(blocos));

if (args.includes('--busca')) {
  const fixo = arg('--fixo');
  const tam = (arg('--tamanhos') || blocos.map((b) => b.length).join(',')).split(',').map(Number);
  let todos = blocos.flat();
  const extra = fixo && !todos.some((s) => s.img === fixo);
  if (extra) throw new Error(`"${fixo}" não está no VS: ponha a linha dele num bloco antes de buscar`);
  if (tam.reduce((a, b) => a + b, 0) !== todos.length) throw new Error(`tamanhos somam ${tam.reduce((a, b) => a + b, 0)}, há ${todos.length} sites`);
  const preso = fixo ? todos.find((s) => s.img === fixo) : null;
  const soltos = todos.filter((s) => s !== preso);
  const monta = (ordem) => { const l = []; let k = 0; tam.forEach((n, b) => { l.push(ordem.slice(k, k + n - (b === 0 && preso ? 1 : 0))); k += n - (b === 0 && preso ? 1 : 0); }); if (preso) l[0].unshift(preso); return l; };
  let melhor = null, menor = Infinity;
  for (let tentativa = 0; tentativa < Number(arg('--tentativas') || 30) && menor > 0; tentativa++) {
    let ordem = soltos.slice().sort(() => Math.random() - .5), atual = custo(monta(ordem)), temp = 3000;
    for (let i = 0; i < 25000 && atual > 0; i++, temp *= .99975) {
      const a = Math.floor(Math.random() * ordem.length), b = Math.floor(Math.random() * ordem.length);
      if (a === b) continue;
      [ordem[a], ordem[b]] = [ordem[b], ordem[a]];
      const c = custo(monta(ordem));
      if (c <= atual || Math.random() < Math.exp((atual - c) / temp)) atual = c;
      else [ordem[a], ordem[b]] = [ordem[b], ordem[a]];
    }
    if (atual < menor) { menor = atual; melhor = monta(ordem); }
    console.log('tentativa', tentativa + 1, 'custo', atual);
  }
  if (menor > 0) {
    console.log('não achei ordem que sirva (colisão', colisao(melhor), 'ms, em sequência', vizinhos(melhor) + '); nada foi gravado'); process.exit(1);
  }
  console.log('nova ordem:\n  ' + nomes(melhor).join('\n  '));
  const corpo = melhor.map((b) => '    [ ' + b.map((s) => s.linha).join(',\n      ') + ' ]').join(',\n');
  fs.writeFileSync(ARQ, html.slice(0, ini) + 'const VS = [\n' + corpo + html.slice(fim));
  console.log('index.html reescrito; colisão', colisao(melhor), 'ms; mesmo tipo em sequência', vizinhos(melhor));
}
