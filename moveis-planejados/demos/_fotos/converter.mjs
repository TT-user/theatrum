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

/* ---------- achar o arquivo de origem ----------
   O manifesto declara um caminho aninhado (img/cozinhas/sereno.jpg),
   mas navegador nenhum baixa assim: ele joga tudo achatado na pasta de
   downloads, com a extensão que o gerador escolheu. Exigir que a pessoa
   recrie oito pastas à mão e acerte a extensão é onde a leva se perde.

   Então: vale o caminho exato, vale o mesmo caminho com outra extensão
   de imagem, e vale o arquivo solto em qualquer lugar dentro da pasta
   de origem, contanto que o nome base seja o do manifesto.

   O que NÃO vale é adivinhar: onde dois itens partilham o nome base
   (onix-capa mora em lancamento/ e em video/), o conversor recusa e
   diz qual é a dúvida, em vez de escolher um e escrever no lugar
   errado — erro que só apareceria com o site publicado. */
const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function varrer(dir, achados = []) {
  if (!fs.existsSync(dir)) return achados;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varrer(p, achados);
    else if (EXTS.includes(path.extname(e.name).toLowerCase())) achados.push(p);
  }
  return achados;
}

const indice = new Map();
for (const p of varrer(origem)) {
  const base = path.basename(p, path.extname(p)).toLowerCase();
  if (!indice.has(base)) indice.set(base, []);
  indice.get(base).push(p);
}

/* nomes base que o manifesto repete em pastas diferentes */
const repetidos = new Set();
const vistos = new Set();
for (const { nome } of linhas) {
  const b = path.basename(nome, path.extname(nome)).toLowerCase();
  if (vistos.has(b)) repetidos.add(b);
  vistos.add(b);
}

function origemDe(nome) {
  const semExt = path.join(origem, nome).replace(/\.[^.]+$/, '');
  for (const e of EXTS) if (fs.existsSync(semExt + e)) return semExt + e;

  const base = path.basename(nome, path.extname(nome)).toLowerCase();
  if (repetidos.has(base)) return null;      // ambíguo por definição
  const cand = indice.get(base) || [];
  if (cand.length === 1) return cand[0];
  return null;
}

let total = 0, feitas = 0, faltando = [], ambiguos = [];

for (const { nome, aspecto } of linhas) {
  const entrada = origemDe(nome);
  if (!entrada) {
    const base = path.basename(nome, path.extname(nome)).toLowerCase();
    if (repetidos.has(base) && indice.has(base)) ambiguos.push(nome);
    else faltando.push(nome);
    continue;
  }

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
if (faltando.length) console.log(`  ainda sem origem (${faltando.length}): ${faltando.join(', ')}`);
if (ambiguos.length) {
  console.log(`\n  AMBIGUOS (${ambiguos.length}) — o nome base se repete no manifesto,`);
  console.log(`  entao o arquivo solto nao diz de qual item ele e. Ponha cada um na`);
  console.log(`  subpasta certa dentro de ${origem}/ e rode de novo:`);
  for (const n of ambiguos) console.log(`    ${n}`);
}
console.log('');
