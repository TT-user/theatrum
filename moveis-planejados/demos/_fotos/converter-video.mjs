/* ============================================================
   Recebe os mp4 baixados do Flow e entrega para a demo Morattá.

   O Flow devolve arquivo pesado, com áudio e em 1080p. O site
   toca esses vídeos em loop, mudo, atrás de texto — nada disso
   serve. Aqui eles viram h264 720p sem faixa de áudio, na mesma
   ordem de grandeza dos vídeos que já estão no ar (~1 MB).

   O destino de cada arquivo sai do man-moratta.txt, não de uma
   tabela aqui dentro: as entradas de vídeo do manifesto já
   declaram o caminho da capa, e o mp4 mora ao lado dela.

   uso:
     1. salvar os downloads em video-moratta/ com o nome que a
        FOLHA-MORATTA.md indica (hero-01.mp4, fabrica.mp4, ...)
     2. node converter-video.mjs

   Roda quantas vezes quiser: pula o que já está convertido e no
   lugar, a menos que o bruto seja mais novo que a saída.
   ============================================================ */
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import fs from 'node:fs';
import path from 'node:path';

const MANIFESTO = 'man-moratta.txt';
const BRUTOS = 'video-moratta';
const DEMO = '../moratta';
const ALTURA = 720;

/* mesma marca de movimento do monta-folha.mjs: é o que separa,
   dentro do manifesto, um still de um quadro inicial de vídeo */
const MOVIMENTO = /(?:Slow|Lateral|Locked-off|Forward|Static|Gentle)[^.]*?\d+\s*seconds[^.]*\./i;

const destinos = fs.readFileSync(MANIFESTO, 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .filter((l) => MOVIMENTO.test(l))
  .map((l) => l.split('|')[0])
  .reduce((mapa, capa) => {
    /* img/video/fabrica-capa.jpg -> img/video/fabrica.mp4
       img/hero/hero-01.jpg       -> img/hero/hero-01.mp4   */
    const rel = capa.replace(/-capa\.jpg$/, '.mp4').replace(/\.jpg$/, '.mp4');
    mapa[path.basename(rel)] = rel;
    return mapa;
  }, {});

if (!fs.existsSync(BRUTOS)) {
  fs.mkdirSync(BRUTOS, { recursive: true });
  console.log(`  criei ${BRUTOS}/ — ponha os downloads do Flow aqui.`);
}

console.log(`\n  ${Object.keys(destinos).length} vídeos esperados pela demo\n`);

let feitos = 0, faltando = [];

for (const [arquivo, rel] of Object.entries(destinos)) {
  const bruto = path.join(BRUTOS, arquivo);
  const saida = path.join(DEMO, rel);

  if (!fs.existsSync(bruto)) { faltando.push(arquivo); continue; }
  if (fs.existsSync(saida) && fs.statSync(saida).mtimeMs >= fs.statSync(bruto).mtimeMs) {
    console.log(`  ${rel.padEnd(28)} já convertido`);
    continue;
  }

  fs.mkdirSync(path.dirname(saida), { recursive: true });
  /* crf 26 é o ponto onde estes planos lentos param de ganhar
     qualidade visível e só ganham peso; -an corta o áudio, que o
     site nunca toca; faststart põe o índice no começo do arquivo
     para o vídeo começar antes do download terminar */
  execFileSync(ffmpeg, [
    '-y', '-i', bruto,
    '-vf', `scale=-2:${ALTURA}`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an', saida
  ], { stdio: 'pipe' });

  const kb = Math.round(fs.statSync(saida).size / 1024);
  const antes = Math.round(fs.statSync(bruto).size / 1024);
  console.log(`  ${rel.padEnd(28)} ${String(antes + ' KB').padStart(9)} -> ${String(kb + ' KB').padStart(8)}`);
  feitos++;
}

console.log(`\n  ${feitos} convertidos`);
if (faltando.length) console.log(`  ainda sem mp4 (${faltando.length}): ${faltando.join(', ')}\n`);
