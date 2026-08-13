/* SEIS PANOS — gerador de imagens pelo Higgsfield Soul 2.0
   Uso: node gerar.mjs <manifesto.txt>

   Formato de cada linha do manifesto (| separa, # comenta):
     caminho/de/saida.jpg|aspecto|referencia_ou_-|prompt

   O caminho de saida e relativo a pasta seis-panos/. A referencia, quando
   existe, e outro arquivo ja gerado (o Soul aceita UMA so).

   Duas coisas que o plano free impoe e que ditam o desenho deste script:

   1. `concurrent_jobs_limit: 4`. Disparar tudo de uma vez devolve
      rate_limit_reached da quinta em diante, entao aqui rodam quatro
      trabalhadores em paralelo, cada um pegando o proximo item da fila
      assim que termina o seu. Enfileirar um a um seria quatro vezes mais
      lento; disparar todos de uma vez simplesmente nao funciona.

   2. O Soul falha sozinho de vez em quando, sem mensagem. A falha e
      estornada, entao repetir custa so tempo — daí as tentativas.

   Pula o que ja existe: rodar de novo depois de uma queda custa so o que
   falta. */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const exec = promisify(execFile);
/* fileURLToPath, e nao .pathname: a pasta tem espaco no nome e o pathname
   entrega "demo%206panos", que o fs nao encontra. */
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(AQUI, '..', 'seis-panos');

const PARALELO = 4;
const TENTATIVAS = 3;

/* No Windows o `higgsfield` do PATH e um .cmd, e o execFile nao executa
   .cmd sem shell — e passar prompts longos por shell convida a erro de
   aspas. Chamamos o .js do pacote direto pelo node. */
const CLI = path.join(process.env.APPDATA || '', 'npm', 'node_modules',
  '@higgsfield', 'cli', 'bin', 'higgsfield.js');

async function hf(args) {
  const { stdout } = await exec(process.execPath, [CLI, ...args], { maxBuffer: 1 << 24 });
  return stdout.trim().split('\n').pop().trim();
}

const manifesto = process.argv[2];
if (!manifesto) { console.error('uso: node gerar.mjs <manifesto.txt>'); process.exit(1); }

const fila = fs.readFileSync(path.resolve(AQUI, manifesto), 'utf8')
  .split('\n').map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [saida, aspecto, ref, ...resto] = l.split('|');
    return { saida, aspecto, ref: ref === '-' ? null : ref, prompt: resto.join('|') };
  })
  .filter((it) => {
    if (fs.existsSync(path.join(SITE, it.saida))) { console.log('[pula]', it.saida); return false; }
    return true;
  });

if (!fila.length) { console.log('nada a fazer'); process.exit(0); }
console.log(`${fila.length} a gerar, ${PARALELO} por vez\n`);

let proximo = 0, ok = 0, falhou = 0;

async function uma(it) {
  const destino = path.join(SITE, it.saida);
  const args = ['generate', 'create', 'text2image_soul_v2',
    '--aspect_ratio', it.aspecto, '--prompt', it.prompt];
  if (it.ref) {
    const refAbs = path.join(SITE, it.ref);
    if (!fs.existsSync(refAbs)) throw new Error('referencia ausente: ' + it.ref);
    args.push('--image-references', refAbs);
  }
  const id = await hf(args);
  const url = await hf(['generate', 'wait', id, '--timeout', '20m', '--interval', '10s', '-q']);
  if (!/^https:\/\//.test(url)) throw new Error(url);
  const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  /* o Soul devolve PNG de 2048px, que pesa alguns MB. A loja mira menos de
     250 KB por foto: sem converter, o site abre lento e a demo perde
     exatamente o que ela vende. */
  await sharp(bin).resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(destino);
  return Math.round(fs.statSync(destino).size / 1024);
}

async function trabalhador(n) {
  while (proximo < fila.length) {
    const it = fila[proximo++];
    let erro = null;
    for (let t = 1; t <= TENTATIVAS; t++) {
      try {
        const kb = await uma(it);
        console.log(`[ok] ${it.saida} ${kb} KB${t > 1 ? ` (tentativa ${t})` : ''}`);
        ok++; erro = null; break;
      } catch (e) {
        erro = String(e.stderr || e.message || e).slice(0, 140);
        if (t < TENTATIVAS) console.log(`[repete ${t + 1}/${TENTATIVAS}]`, it.saida);
      }
    }
    if (erro) { console.log('[FALHA]', it.saida, erro); falhou++; }
  }
}

await Promise.all(Array.from({ length: PARALELO }, (_, n) => trabalhador(n)));

console.log(`\n${ok} geradas, ${falhou} falharam`);
console.log(await hf(['account', 'status']));
