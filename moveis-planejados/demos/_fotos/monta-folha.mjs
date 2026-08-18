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

   Duas coisas que este script conserta na passagem:

   1. O bloco de estilo é idêntico nas 24 entradas. Repetido na
      folha, são 24 chances de colar errado e um arquivo ilegível.
      Sai uma vez só, no topo.

   2. Os prompts de movimento vieram escritos para o Higgsfield e
      trazem dois defeitos. Falam em "dolly", "slider" e "handheld"
      — e foi assim que um vídeo anterior nasceu com uma câmera em
      tripé dentro da cena, porque o modelo lê equipamento como
      objeto a desenhar. E mandam mover e não mover na mesma frase
      ("Slow dolly-in ... Locked-off cinematic feel"). Aqui viram
      descrição de movimento, sem nome de equipamento e sem a
      contradição.

   uso: node monta-folha.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const MANIFESTO = 'man-moratta.txt';
const DEMO = '../moratta';
const SAIDA = 'FOLHA-MORATTA.md';

/* frase de movimento de câmera = marca de que a entrada vira vídeo */
const MOVIMENTO = /((?:Slow|Lateral|Locked-off|Forward|Static|Gentle)[^.]*?\d+\s*seconds[^.]*)\./i;

/* onde começa o bloco de estilo comum a todos os prompts */
const ESTILO = 'black and white, high-key editorial';

/* ---------- movimento sem nome de equipamento ----------
   A ordem importa: as entradas mais específicas primeiro, senão
   uma regra curta ("push-in") consome o caso longo antes dele ser
   reconhecido. */
const TRADUCAO = [
  [/locked-off macro with a slight push-in/i,
   'the framing stays almost perfectly still and eases only a hair closer'],
  [/slow lateral dolly between the machines/i,
   'the view glides slowly sideways, passing between the machines'],
  [/slow pull-back revealing the whole room/i,
   'the view draws slowly backwards until the whole room is open in frame'],
  [/lateral slider move/i,
   'the view glides steadily sideways to the right'],
  [/slow push-in on the woman/i,
   'the view closes in slowly on the woman'],
  [/forward travelling/i,
   'the view moves slowly forward through the room'],
  [/slow dolly-in/i,
   'the view moves slowly forward, closing in on the scene'],
  [/subtle handheld float/i,
   'with a barely perceptible drift, as if the frame were breathing'],
  [/gentle handheld/i,
   'with a barely perceptible drift'],
];

/* fecho comum. A última cláusula é a lição direta do vídeo que
   veio com um tripé desenhado no meio da cena. */
const FECHO = 'Five seconds, one continuous shot, no cuts. ' +
  'No text, no logo, no watermark, and no camera or filming equipment visible in frame.';

function movimentoLimpo(frase) {
  let s = frase;
  for (const [de, para] of TRADUCAO) s = s.replace(de, para);
  /* sobrou "locked-off" numa frase que tem movimento? é a contradição */
  const temMovimento = /\b(moves|glides|draws|closes in|eases)\b/.test(s);
  if (temMovimento) s = s.replace(/,?\s*locked-off[^,.]*/ig, '');
  /* o tempo e a ausência de corte já estão no fecho */
  s = s.replace(/,?\s*\d+\s*seconds/i, '');
  s = s.replace(/,?\s*no cuts\b/ig, '');
  s = s.replace(/\s*,\s*,/g, ',').replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '');
  return s.charAt(0).toUpperCase() + s.slice(1) + '. ' + FECHO;
}

const linhas = fs.readFileSync(MANIFESTO, 'utf8').split('\n')
  .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [nome, aspecto, ref, ...resto] = l.split('|');
    return { nome, aspecto, prompt: resto.join('|') };
  });

/* o bloco de estilo, colhido do primeiro prompt que o traz */
let blocoEstilo = '';
for (const l of linhas) {
  const i = l.prompt.indexOf(ESTILO);
  if (i >= 0) { blocoEstilo = l.prompt.slice(i).trim(); break; }
}

const fotos = [], videos = [];

for (const item of linhas) {
  /* já está no site? então não entra na folha */
  if (fs.existsSync(path.join(DEMO, item.nome))) continue;

  const mov = item.prompt.match(MOVIMENTO);

  /* cena = prompt menos o estilo comum, menos o [STYLE] vazio,
     menos a frase de movimento (que descreve a câmera, não a cena) */
  let cena = item.prompt;
  const i = cena.indexOf(ESTILO);
  if (i >= 0) cena = cena.slice(0, i);
  cena = cena.replace(/\s*\[STYLE\]\.\s*/g, ' ');
  if (mov) cena = cena.replace(mov[0], '');
  cena = cena.replace(/\s+/g, ' ').replace(/\s*\.\s*\./g, '.').trim();

  const alvo = { ...item, cena, movimento: mov ? movimentoLimpo(mov[1].trim()) : null };
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

md += `## O estilo — colar uma vez, no começo da sessão\n\n`;
md += `As 24 imagens partilham este bloco. No AI Studio ele entra em **System\n`;
md += `instructions**; no Gemini, como primeira mensagem da conversa. Depois disso\n`;
md += `basta colar a linha de cena de cada item.\n\n`;
md += `\`\`\`\nEvery image in this session follows the same look:\n${blocoEstilo}\n\`\`\`\n\n`;
md += `> Se o gerador ignorar a instrução e devolver algo fora do estilo, cole o bloco\n`;
md += `> junto da cena naquele item. É o único caso em que vale repetir.\n\n`;

md += `---\n\n## A · Fotos — ${fotos.length} itens\n\n`;
md += `**Onde:** Gemini (gemini.google.com) ou AI Studio (aistudio.google.com), no\n`;
md += `navegador logado. Não gastam crédito do Flow.\n\n`;
md += `**Depois de gerar:** salvar com o nome exato indicado, dentro de \`png-moratta/\`,\n`;
md += `e rodar:\n\n\`\`\`\nnode converter.mjs man-moratta.txt png-moratta ../moratta\n\`\`\`\n\n`;

fotos.forEach((f, i) => {
  md += `### A${String(i + 1).padStart(2, '0')} · \`${f.nome}\`\n`;
  md += `**${f.aspecto}** · salvar como \`${png(f.nome)}\`\n\n`;
  md += `\`\`\`\n${f.cena}\n\`\`\`\n\n`;
});

md += `---\n\n## B · Vídeos — ${videos.length} itens, dois passos cada\n\n`;
md += `Cada um destes vira **duas** entregas: a imagem de capa, que o site já usa\n`;
md += `como poster, e o vídeo animado a partir dela.\n\n`;
md += `**Passo 1 — a capa.** Mesmo caminho das fotos acima: gerar com o prompt de\n`;
md += `cena, salvar em \`png-moratta/\`, rodar o \`converter.mjs\`.\n\n`;
md += `**Passo 2 — o vídeo.** No Flow (labs.google/flow), modo **Frames to Video**:\n`;
md += `subir a imagem do passo 1 como primeiro quadro e colar o prompt de movimento.\n`;
md += `Baixar o mp4 e salvar em \`video-moratta/\` com o nome indicado. Depois:\n\n`;
md += `\`\`\`\nnode converter-video.mjs\n\`\`\`\n\n`;
md += `> **Gere um só e olhe antes de fazer os sete.** Um vídeo anterior nasceu com\n`;
md += `> uma câmera em tripé dentro da cena porque o prompt dizia "tripod dolly", e\n`;
md += `> custou o retrabalho inteiro. Os prompts abaixo já saem sem nome de\n`;
md += `> equipamento, mas a conferência de um antes dos sete continua valendo.\n\n`;

videos.forEach((v, i) => {
  const mp4 = v.nome.replace('-capa.jpg', '.mp4').replace(/\.jpg$/, '.mp4');
  md += `### B${i + 1} · \`${mp4}\`\n`;
  md += `capa: \`${v.nome}\` (**${v.aspecto}**) → \`${png(v.nome)}\`\n`;
  md += `vídeo: → \`video-moratta/${path.basename(mp4)}\`\n\n`;
  md += `*1 · cena da capa:*\n\n\`\`\`\n${v.cena}\n\`\`\`\n\n`;
  md += `*2 · movimento, no Flow:*\n\n\`\`\`\n${v.movimento}\n\`\`\`\n\n`;
});

fs.writeFileSync(SAIDA, md);
console.log(`  ${SAIDA}`);
console.log(`  ${fotos.length} fotos + ${videos.length} vídeos (com ${videos.length} capas) = ${fotos.length + videos.length} imagens`);
console.log(`  bloco de estilo isolado: ${blocoEstilo.length} caracteres, agora uma vez só`);
