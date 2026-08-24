// Gera as pinturas pelo Gemini em vez do Higgsfield.
//
//   node --env-file=.env gen-imagens-gemini.mjs 16 17 18 19 20
//
// Passa uma pintura ja aprovada do MESMO pilar como referencia de estilo:
// sem isso o look muda de modelo para modelo e a grade do perfil perde a
// unidade. O prompt e o mesmo do gen-imagens.ps1, para as duas rotas
// (Higgsfield e Gemini) renderem a mesma coisa.
import fs from 'node:fs';

const ROOT = 'c:/Users/mathe/Desktop/theatrum/conta-frases';
const CHAVE = process.env.GEMINI_API_KEY;
const MODELO = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';
const TENTATIVAS = 4;

if (!CHAVE) { console.error('Falta GEMINI_API_KEY (use --env-file=.env)'); process.exit(1); }

const posts = JSON.parse(fs.readFileSync(`${ROOT}/posts.json`, 'utf8'));
const estilo = JSON.parse(fs.readFileSync(`${ROOT}/estilo.json`, 'utf8'));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function montarPrompt(p, temRef) {
  // O estilo nao mora aqui: mora em estilo.json, que o gen-imagens.ps1 e o
  // build-md.js leem tambem. Trocar o look e editar aquele arquivo.
  const e = estilo;
  return e.template
    .replace('{abertura}', e.abertura)
    .replace('{cena}', p.scene)
    .replace('{figura}', p.surreal ? e.figura.surreal : e.figura.padrao)
    .replace('{paleta}', p.palette || e.paletas[p.pilar])
    .replace('{luz}', e.luz)
    .replace('{materia}', e.materia)
    .replace('{respiro}', e.respiro.replace('{zona}', p.text_zone))
    .replace('{clima}', e.clima)
    .replace('{trava}', temRef ? e.trava_referencia + String.fromCharCode(10) : '')
    .replace('{negativos}', e.negativos)
    .replace('{enquadramento}', e.enquadramento);
}

function referencia(p) {
  const irmao = posts.find((o) => o.pilar === p.pilar && o.id !== p.id
    && fs.existsSync(`${ROOT}/img/${o.id}.png`));
  return irmao ? { id: irmao.id, b64: fs.readFileSync(`${ROOT}/img/${irmao.id}.png`).toString('base64') } : null;
}

async function uma(p) {
  const saida = `${ROOT}/img/${p.id}.png`;
  if (fs.existsSync(saida)) { console.log(`${p.id}: ja existe, pulando`); return true; }

  const ref = referencia(p);
  const partes = [{ text: montarPrompt(p, !!ref) }];
  if (ref) partes.push({ inline_data: { mime_type: 'image/png', data: ref.b64 } });

  const corpo = {
    contents: [{ parts: partes }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4' } },
  };

  for (let t = 1; t <= TENTATIVAS; t++) {
    console.log(`=== ${p.id} (${p.pilar})${ref ? ' ref=' + ref.id : ''} - tentativa ${t} ===`);
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE }, body: JSON.stringify(corpo) }
      );
      const dados = await r.json();
      if (!r.ok) {
        const msg = dados.error?.message || JSON.stringify(dados).slice(0, 200);
        console.log(`${p.id}: HTTP ${r.status} ${msg}`);
        // cota estourada nao melhora repetindo
        if (r.status === 429 && /quota|billing/i.test(msg)) { console.log('SALDO/COTA no Gemini, parando.'); process.exit(3); }
        if (t < TENTATIVAS) { await espera(10000 * t); continue; }
        return false;
      }
      const img = dados.candidates?.[0]?.content?.parts?.find((x) => x.inlineData || x.inline_data);
      const b64 = (img?.inlineData || img?.inline_data)?.data;
      if (!b64) { console.log(`${p.id}: resposta sem imagem`); if (t < TENTATIVAS) { await espera(5000); continue; } return false; }
      fs.writeFileSync(saida, Buffer.from(b64, 'base64'));
      console.log(`${p.id}: ok (${(fs.statSync(saida).size / 1024 / 1024).toFixed(1)} MB)`);
      return true;
    } catch (e) {
      console.log(`${p.id}: ${e.message}`);
      if (t < TENTATIVAS) await espera(10000 * t);
    }
  }
  return false;
}

const ids = process.argv.slice(2);
for (const id of ids) {
  const p = posts.find((x) => x.id === id);
  if (!p) { console.log(`${id}: nao existe em posts.json`); continue; }
  await uma(p);
}
