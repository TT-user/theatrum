/* ============================================================
   Converte os PNG gerados para os arquivos que as demos cerne e
   moratta procuram.

   uso: node converter.mjs <manifesto> <pasta-png> <pasta-do-demo>
     node converter.mjs man-cerne.txt   png-cerne   ../cerne/assets/img
     node converter.mjs man-moratta.txt png-moratta ../moratta

   Diferente do conversor das demos de imóveis, este lê o tamanho do
   próprio manifesto: a proporção já está declarada lá, e repetir a
   informação numa tabela à parte é convite para as duas divergirem.

   A extensão de saída vem do que o HTML pede — a cerne consome .webp
   no grid e .jpg no poster; a moratta é .jpg em tudo.

   Precisa do sharp:  npm i sharp
   ============================================================ */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [manifesto, origem, destino] = process.argv.slice(2);
if (!manifesto || !origem || !destino) {
  console.error('uso: node converter.mjs <manifesto> <pasta-png> <pasta-do-demo>');
  process.exit(1);
}

/* Lado maior por proporção. Foto de grid não precisa de 1920: ela nunca
   é desenhada com mais de ~600 px de largura na tela, e o dobro disso
   já cobre tela retina. Só o que ocupa a largura toda — hero e CTA —
   sobe para 1920. */
const LARGURA = { '16:9': 1920, '3:2': 1400, '4:3': 1200, '1:1': 1100, '4:5': 1000, '2:3': 1000 };
const TETO_HERO = 250, TETO_RESTO = 150;

function alvo(aspecto) {
  const [a, b] = aspecto.split(':').map(Number);
  const larg = LARGURA[aspecto] || 1200;
  return [larg, Math.round(larg * b / a)];
}

/* que extensão o site espera para este arquivo */
function saidaDe(nome) {
  if (/^img\//.test(nome)) return nome.replace(/\.png$/, '.jpg');   // moratta
  if (/^hero-poster/.test(nome)) return nome.replace(/\.png$/, '.jpg'); // cerne: OG e poster
  return nome.replace(/\.png$/, '.webp');                           // cerne: grid e CTA
}

const linhas = fs.readFileSync(manifesto, 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => { const [nome, aspecto] = l.split('|'); return { nome, aspecto }; });

let total = 0, feitas = 0, faltando = [];

for (const { nome, aspecto } of linhas) {
  const entrada = path.join(origem, nome);
  if (!fs.existsSync(entrada)) { faltando.push(nome); continue; }

  const rel = saidaDe(nome);
  const saida = path.join(destino, rel);
  fs.mkdirSync(path.dirname(saida), { recursive: true });

  const [larg, alt] = alvo(aspecto);
  const teto = /hero|cta/.test(nome) ? TETO_HERO : TETO_RESTO;
  const webp = saida.endsWith('.webp');

  let kb = 0;
  for (let q = 84; q >= 38; q -= 6) {
    const img = sharp(entrada).resize(larg, alt, { fit: 'cover', position: 'attention' });
    await (webp ? img.webp({ quality: q }) : img.jpeg({ quality: q, mozjpeg: true })).toFile(saida);
    kb = Math.round(fs.statSync(saida).size / 1024);
    if (kb <= teto) break;
  }

  total += kb; feitas++;
  console.log(`  ${rel.padEnd(34)} ${String(larg + '×' + alt).padEnd(11)} ${String(kb + ' KB').padStart(8)}${kb > teto ? '  ACIMA DO TETO' : ''}`);
}

console.log(`\n  ${feitas} arquivos · ${Math.round(total / 1024 * 10) / 10} MB`);
if (faltando.length) console.log(`  sem PNG ainda (${faltando.length}): ${faltando.join(', ')}\n`);
