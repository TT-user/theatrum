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
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function montarPrompt(p, temRef) {
  const fig = p.surreal
    ? 'Seen from behind, small in frame, face never visible, painted in loose confident brushstrokes.'
    : 'Solitary figure seen from behind, small in frame, face never visible, wearing a simple long coat, painted in loose confident brushstrokes.';
  const trava = temRef
    ? 'Match the painting style, brushwork, impasto texture and colour handling of the reference image. Do NOT copy its composition or subject.\n'
    : '';
  return `Textured oil painting on rough linen canvas, naive folk-art style.
${p.scene}.
${fig}
${p.palette}.
Soft diffused light, hazy horizon, no hard shadows.
Thick visible impasto texture, canvas weave showing through, subtle film grain, slightly desaturated, muted and dreamlike.
Wide open negative space in the ${p.text_zone} third of the frame, empty and low-contrast, reserved for text overlay.
Painterly, contemplative, quiet, melancholic but hopeful.
${trava}No text, no lettering, no watermark, no signature, no faces, no logos.
Vertical portrait composition.`;
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
