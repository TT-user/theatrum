// Regenera PUBLICACAO.md a partir de posts.json + copy.json.
// O .md e derivado: nao edite a mao, edite os dados e rode `node build-md.js`.
const fs = require('fs');

const ROOT = 'c:/Users/mathe/Desktop/theatrum/conta-frases';
const posts = JSON.parse(fs.readFileSync(`${ROOT}/posts.json`, 'utf8'));
const copy = JSON.parse(fs.readFileSync(`${ROOT}/copy.json`, 'utf8'));

const PILAR = {
  P1: 'Paz e limites', P2: 'Recomeços', P3: 'Fé leve', P4: 'Amor-próprio',
};
const FORMULA = {
  F1: 'Imperativo suave', F2: 'Afirmação do universo', F3: 'Permissão para soltar',
  F4: 'Absolvição', F5: 'Dispensa de exigência', F6: 'Verdade curta',
};

const cita = (t) => t.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n');
const surreais = posts.filter((p) => p.surreal).map((p) => p.id);

// as variacoes de CTA nao ficam num script a parte: sao lidas do proprio copy,
// que e a fonte da verdade. Se alguem editar uma legenda, a lista acompanha.
const ctas = [...new Set(
  Object.values(copy)
    .map((c) => c.legenda.trimEnd().split('\n').pop().trim())
    .filter((l) => l.includes('@explicologo'))
)];

const cabecalho = `# ${posts.length} posts — frases sobre pinturas texturizadas

Cada post é **um vídeo de 5s** (pintura a óleo animada) com uma frase queimada em Itim branco
e a assinatura \`@explicologo\` logo abaixo.

> Este arquivo é **gerado**. Edite \`posts.json\` / \`copy.json\` e rode \`node build-md.js\`.

## Regras da conta — valem para todo post novo

**1. Toda legenda termina com CTA de seguir.**
A última linha da legenda é sempre um convite para seguir \`@explicologo\`, separado por linha
em branco da linha de engajamento (salvar / comentar). São duas chamadas empilhadas: primeiro
a que pede a ação barata (salvar), depois a que pede o seguidor.
O CTA vive **na legenda**, nunca queimado na arte: a arte carrega só a frase e a assinatura.
O texto rotaciona entre estas variações para não ficar robótico:

${ctas.map((c) => `- ${c}`).join('\n')}

**2. Carrossel: só o primeiro slide é vídeo.**
Quando um post for carrossel, apenas o **slide 1** é o \`.mp4\` animado — ele é quem segura o
autoplay no feed. Os slides seguintes podem ser **imagem estática** (\`.jpg\`), o que corta
tempo de render e crédito de animação. Na prática: gere o vídeo só do slide de capa e monte
os demais direto do \`overlay.js\` sobre a pintura parada.

**3. Rodízio.** Nenhum pilar e nenhuma fórmula se repetem em posts consecutivos.
Uma variante surreal (astronauta) a cada dez — hoje nos posts ${surreais.join(', ')}.

**Arquivos**
- \`final/instagram/NN-4x5.mp4\` — 1080×1350, publicar no feed
- \`final/instagram/NN-4x5.jpg\` — capa estática (thumbnail / slide de carrossel)
- \`final/pinterest/NN-2x3.mp4\` — 1000×1500, pin de vídeo
- \`final/pinterest/NN-2x3.jpg\` — pin estático

**Rodízio** — nenhum pilar repetido em sequência, nenhuma fórmula repetida em sequência:

| # | Pilar | Fórmula | Frase |
|---|---|---|---|
${posts.map((p) => `| ${p.id} | ${p.pilar} ${PILAR[p.pilar]} | ${p.formula} | ${p.frase_flat} |`).join('\n')}
`;

const secoes = posts.map((p) => {
  const c = copy[p.id];
  return `## ${p.id} · ${p.pilar} · ${p.formula}${p.surreal ? ' · surreal' : ''}

**Frase:** ${p.frase_flat}

**Legenda**
${cita(c.legenda)}

**Hashtags (1º comentário):** ${c.hashtags}

**Alt text:** ${c.alt}

**Pinterest** — board *${c.board}*
- Título: \`${c.pin_titulo}\`
- Descrição: ${c.pin_desc}`;
}).join('\n\n---\n\n');

const rodape = `## Cadência sugerida

**Instagram** — 5 posts por semana, na ordem crescente de id. A ordem já alterna os pilares.

**Pinterest** — não jogue tudo de uma vez. 3 a 5 pins por dia, sempre no board do pilar.
Repine os antigos em boards diferentes depois de algumas semanas — pin tem cauda longa.

## Regenerar / editar

\`\`\`powershell
# nova pintura de fundo de um post
.\\gen-imagens.ps1 -Only "03"
.\\baixar-imagens.ps1

# nova animacao
.\\gen-videos.ps1 -Only "03"
.\\baixar-videos.ps1

# mudou a frase em posts.json? re-renderize o texto e remonte
node overlay.js 03
.\\montar.ps1 -Only "03"

# mudou copy.json ou posts.json? regenere os derivados
node build-md.js
node build-page.js
\`\`\`

\`overlay.js\` e \`build-page.js\` dependem do \`sharp\`, que mora fora do repo:
rode com \`NODE_PATH\` apontando para o \`node_modules\` das ferramentas.

## Publicar

\`\`\`bash
# confere conta e URLs publicas antes de qualquer coisa
node --env-file=../../explicologo/.env postar-reels.js --checar
node --env-file=../../explicologo/.env postar-reels.js 06 07 08
\`\`\`

O token de \`@explicologo\` fica em \`Desktop/explicologo/.env\` (fora deste repo).
\`../MazyOS/.env\` é a conta \`@theatrum.br\` — o \`--checar\` barra a publicação cruzada.
Cada post publicado fica registrado em \`publicados.json\` e nunca sai duas vezes.
`;

fs.writeFileSync(`${ROOT}/PUBLICACAO.md`, `${cabecalho}\n---\n\n${secoes}\n\n---\n\n${rodape}`, 'utf8');
console.log(`PUBLICACAO.md: ${posts.length} posts`);
