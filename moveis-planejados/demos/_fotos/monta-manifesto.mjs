/* Le os PROMPTS-HIGGSFIELD.md das demos cerne e moratta e escreve os
   manifestos no formato do gerar-gemini.mjs. Transcrever 64 prompts a
   mao seria a parte mais facil de errar do trabalho todo. */
import fs from 'node:fs';
import path from 'node:path';

/* Os prompts vivem aqui do lado, e nao numa pasta solta fora do repositorio:
   sem isso o script quebra na primeira vez que alguem clonar o projeto. */
const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const bloco = (t, i) => { const a = t.indexOf('```', i) + 3; const b = t.indexOf('```', a); return t.slice(a, b).trim().replace(/\s*\n\s*/g, ' '); };

/* ---------- CERNE ---------- */
{
  const t = fs.readFileSync(`${AQUI}/prompts-cerne.md`, 'utf8');
  const dna = bloco(t, t.indexOf('## 1 · DNA visual'));
  const linhas = [];
  const re = /\*\*`([a-z0-9.-]+\.(?:webp|jpg|png))`\*\*/g;
  let m;
  while ((m = re.exec(t))) {
    const nome = m[1];
    const p = bloco(t, m.index);
    if (!p || p.length < 40) continue;
    const asp = /hero|cta/.test(nome) ? '16:9' : '4:3';
    linhas.push(`${nome.replace(/\.(webp|jpg)$/, '.png')}|${asp}|n|${p} ${dna}`);
  }
  /* O poster do hero está descrito na seção 3.1 como "frame base" do vídeo,
     num formato de título diferente do resto, e por isso escapa da varredura
     acima. Ele importa mais que os outros: sem o mp4, é ele que É o hero. */
  const frame = bloco(t, t.indexOf('### 3.1 · Frame base'));
  if (frame) linhas.push(`hero-poster.png|16:9|n|${frame} ${dna}`);

  fs.writeFileSync(path.join(AQUI,'man-cerne.txt'), '# CERNE — gerado de PROMPTS-HIGGSFIELD.md\n' + linhas.join('\n') + '\n');
  console.log('cerne:', linhas.length, 'prompts');
  linhas.forEach(l => console.log('   ', l.split('|')[0], l.split('|')[1]));
}

/* ---------- MORATTA ---------- */
{
  const t = fs.readFileSync(`${AQUI}/prompts-moratta.md`, 'utf8');
  const estilo = bloco(t, t.indexOf('## 1. Bloco de estilo'));
  const linhas = [];

  /* linhas de tabela: | `img/x/y.jpg` | [formato] | prompt | */
  for (const l of t.split('\n')) {
    const m = l.match(/^\|\s*`(img\/[a-z0-9/_-]+\.jpg)`\s*\|(.*)\|\s*$/);
    if (!m) continue;
    const partes = m[2].split('|').map(s => s.trim());
    let asp = '1:1', prompt = partes[partes.length - 1];
    if (partes.length > 1 && /^\d+:\d+$/.test(partes[0])) asp = partes[0];
    else if (/ACABAMENTOS|acabamentos/.test(m[1])) asp = '4:3';
    prompt = prompt.replace(/^`|`$/g, '').replace(/\s*\+\s*`?\[STYLE\]`?/i, '');
    if (prompt.length < 30) continue;
    linhas.push(`${m[1]}|${asp}|n|${prompt}. ${estilo}`);
  }

  /* posters dos videos: ### `img/hero/hero-01.mp4` — poster `img/hero/hero-01.jpg` */
  const rv = /^### `(img\/[a-z0-9/_-]+\.mp4)` — poster `(img\/[a-z0-9/_-]+\.jpg)`/gm;
  let v;
  while ((v = rv.exec(t))) {
    const p = bloco(t, v.index);
    if (!p) continue;
    linhas.push(`${v[2]}|16:9|n|${p.replace(/^Start frame:?\s*/i, '')}. ${estilo}`);
  }

  fs.writeFileSync(path.join(AQUI,'man-moratta.txt'), '# MORATTA — gerado de PROMPTS-HIGGSFIELD.md\n' + linhas.join('\n') + '\n');
  console.log('\nmoratta:', linhas.length, 'prompts');
  const porAsp = {};
  linhas.forEach(l => { const a = l.split('|')[1]; porAsp[a] = (porAsp[a] || 0) + 1; });
  console.log('   aspectos:', JSON.stringify(porAsp));
}
