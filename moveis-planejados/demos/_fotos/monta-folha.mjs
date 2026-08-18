/* ============================================================
   Monta a folha de trabalho da Morattá para os geradores de
   navegador (Gemini/AI Studio para as fotos, Flow para os vídeos).

   Lê o man-moratta.txt, descobre sozinho o que ainda falta no
   demo e separa em duas listas:
     · foto pura        -> gera e salva, acabou
     · quadro de vídeo  -> gera a imagem E depois anima no Flow

   O que distingue as duas é o próprio manifesto: as entradas de
   vídeo carregam uma frase de movimento de câmera ("Slow dolly-in,
   5 seconds") e o marcador [STYLE]. Ler isso do arquivo evita
   manter uma segunda lista à mão, que sempre diverge.

   uso: node monta-folha.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const MANIFESTO = 'man-moratta.txt';
const DEMO = '../moratta';
const SAIDA = 'FOLHA-MORATTA.md';

/* frase de movimento de câmera = marca de que a entrada vira vídeo */
const MOVIMENTO = /((?:Slow|Lateral|Locked-off|Forward|Static|Gentle)[^.]*?\d+\s*seconds[^.]*)\./i;

const linhas = fs.readFileSync(MANIFESTO, 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [nome, aspecto, ref, ...resto] = l.split('|');
    return { nome, aspecto, prompt: resto.join('|') };
  });

const fotos = [], videos = [];

for (const item of linhas) {
  /* já está no site? então não entra na folha */
  if (fs.existsSync(path.join(DEMO, item.nome))) continue;

  const mov = item.prompt.match(MOVIMENTO);
  /* limpa o prompt: tira o [STYLE] vazio e a frase de movimento,
     que no still só atrapalha (ela descreve o que a câmera faz) */
  let cena = item.prompt.replace(/\s*\[STYLE\]\.\s*/g, ' ').replace(/\s+/g, ' ').trim();
  if (mov) cena = cena.replace(mov[0], '').replace(/\s+/g, ' ').trim();

  const alvo = { ...item, cena, movimento: mov ? mov[1].trim() : null };
  (mov ? videos : fotos).push(alvo);
}

const png = (n) => 'png-moratta/' + n.replace(/\.jpg$/, '.png');

let md = `# Morattá — folha de geração\n\n`;
md += `Gerado por \`monta-folha.mjs\` a partir do \`man-moratta.txt\`. Só lista o que\n`;
md += `**ainda não existe** em \`../moratta/\` — rode de novo a qualquer momento para\n`;
md += `ver o que sobrou.\n\n`;
md += `Todas as fotos entram no site em preto e branco: o CSS aplica\n`;
md += `\`filter:grayscale(1)\` em \`.ph img\`. Se sair colorido, serve do mesmo jeito.\n`;
md += `O recorte também é automático (\`fit:cover\`), então a proporção indicada é o\n`;
md += `alvo ideal, não uma exigência.\n\n`;
md += `---\n\n## A · Fotos — ${fotos.length} itens\n\n`;
md += `**Onde:** Gemini (gemini.google.com) ou AI Studio (aistudio.google.com), no\n`;
md += `navegador logado. Não gastam crédito do Flow.\n\n`;
md += `**Depois de gerar:** salvar com o nome exato indicado, dentro de \`png-moratta/\`,\n`;
md += `e rodar:\n\n\`\`\`\nnode converter.mjs man-moratta.txt png-moratta ../moratta\n\`\`\`\n\n`;

fotos.forEach((f, i) => {
  md += `### A${String(i + 1).padStart(2, '0')} · \`${f.nome}\`\n`;
  md += `proporção **${f.aspecto}** · salvar como \`${png(f.nome)}\`\n\n`;
  md += `\`\`\`\n${f.cena}\n\`\`\`\n\n`;
});

md += `---\n\n## B · Vídeos — ${videos.length} itens, dois passos cada\n\n`;
md += `Cada um destes vira **duas** entregas: a imagem de capa (que o site já usa\n`;
md += `como poster) e o vídeo animado a partir dela.\n\n`;
md += `**Passo 1 — a capa.** Mesmo caminho das fotos acima: gerar com o prompt de\n`;
md += `cena, salvar em \`png-moratta/\`, rodar o \`converter.mjs\`.\n\n`;
md += `**Passo 2 — o vídeo.** No Flow (labs.google/flow), modo **Frames to Video**:\n`;
md += `subir a imagem do passo 1 como primeiro quadro e colar o prompt de movimento.\n`;
md += `Baixar o mp4 e salvar com o nome indicado em \`video-moratta/\`. Depois:\n\n`;
md += `\`\`\`\nnode converter-video.mjs\n\`\`\`\n\n`;

videos.forEach((v, i) => {
  const mp4 = v.nome.replace('-capa.jpg', '.mp4').replace(/\.jpg$/, '.mp4');
  md += `### B${i + 1} · \`${mp4}\`\n`;
  md += `capa: \`${v.nome}\` (${v.aspecto}) → salvar como \`${png(v.nome)}\`\n`;
  md += `vídeo: salvar como \`video-moratta/${path.basename(mp4)}\`\n\n`;
  md += `*Prompt da capa:*\n\n\`\`\`\n${v.cena}\n\`\`\`\n\n`;
  md += `*Prompt do movimento, no Flow:*\n\n\`\`\`\n${v.movimento}. Locked-off cinematic feel, no camera cuts, no text, no logo, no watermark.\n\`\`\`\n\n`;
});

fs.writeFileSync(SAIDA, md);
console.log(`  ${SAIDA}`);
console.log(`  ${fotos.length} fotos + ${videos.length} vídeos (com ${videos.length} capas) = ${fotos.length + videos.length} imagens`);
