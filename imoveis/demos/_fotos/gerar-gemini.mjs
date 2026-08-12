/* ============================================================
   Gerador de imagens pelo Gemini — Theatrum
   Lê os mesmos manifestos que o gerar.sh do Higgsfield usa, para
   não existirem duas listas de prompts que possam divergir.

   uso:
     GEMINI_API_KEY=... node gerar-gemini.mjs man-bruno.txt png-bruno
     GEMINI_API_KEY=... node gerar-gemini.mjs man-bruno.txt png-bruno gemini-2.5-flash-image

   manifesto: nome|aspecto|usa_ref(s/n)|prompt
   O campo usa_ref é ignorado aqui: nenhum destes manifestos usa
   imagem de referência. Fica no formato só para os dois geradores
   lerem o mesmo arquivo.

   Pula o que já existe, então rodar de novo depois de uma falha
   só refaz o que faltou — e não gasta cota com o que já saiu.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const CHAVE = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const [manifesto, destino, modelo = 'gemini-3-pro-image-preview'] = process.argv.slice(2);

if (!CHAVE) {
  console.error('Falta GEMINI_API_KEY no ambiente. Pegue em https://aistudio.google.com/apikey');
  process.exit(1);
}
if (!manifesto || !destino) {
  console.error('uso: node gerar-gemini.mjs <manifesto.txt> <pasta-destino> [modelo]');
  process.exit(1);
}

const PARALELO = 4;      // acima disso a API passa a devolver 429
const TENTATIVAS = 3;

fs.mkdirSync(destino, { recursive: true });

const linhas = fs.readFileSync(manifesto, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [nome, aspecto, , ...resto] = l.split('|');
    return { nome, aspecto, prompt: resto.join('|') };
  });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function uma({ nome, aspecto, prompt }) {
  const saida = path.join(destino, nome);
  if (fs.existsSync(saida) && fs.statSync(saida).size > 0) {
    console.log(`  JA EXISTE  ${nome}`);
    return true;
  }

  const corpo = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: aspecto },
    },
  };

  for (let t = 1; t <= TENTATIVAS; t++) {
    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE },
          body: JSON.stringify(corpo),
        }
      );

      if (!resposta.ok) {
        const texto = await resposta.text();
        /* 429 é cota por minuto: esperar resolve. 400 é o prompt ou o
           formato — insistir só queima tentativa, então sai na hora
           com a mensagem da API, que diz qual campo recusou. */
        if (resposta.status === 400 || resposta.status === 404) {
          console.log(`  FALHOU     ${nome}  ${resposta.status} ${texto.slice(0, 200)}`);
          return false;
        }
        throw new Error(`${resposta.status} ${texto.slice(0, 160)}`);
      }

      const dados = await resposta.json();
      const partes = dados?.candidates?.[0]?.content?.parts || [];
      const imagem = partes.find((p) => p.inlineData?.data);

      if (!imagem) {
        /* sem imagem e sem erro HTTP costuma ser filtro de conteúdo; o
           motivo vem em finishReason e vale imprimir para o prompt ser
           reescrito, como foi o caso da gaveta de facas nos planejados */
        const motivo = dados?.candidates?.[0]?.finishReason || 'sem finishReason';
        console.log(`  SEM IMAGEM ${nome}  (${motivo})`);
        return false;
      }

      fs.writeFileSync(saida, Buffer.from(imagem.inlineData.data, 'base64'));
      const kb = Math.round(fs.statSync(saida).size / 1024);
      console.log(`  OK         ${nome}  ${kb} KB`);
      return true;
    } catch (e) {
      if (t === TENTATIVAS) {
        console.log(`  FALHOU     ${nome}  ${e.message}`);
        return false;
      }
      await espera(t * 4000);
    }
  }
  return false;
}

console.log(`\n  ${manifesto} -> ${destino}  (${modelo})\n`);

let feitas = 0;
for (let i = 0; i < linhas.length; i += PARALELO) {
  const lote = linhas.slice(i, i + PARALELO);
  const r = await Promise.all(lote.map(uma));
  feitas += r.filter(Boolean).length;
}

console.log(`\n  ${feitas} de ${linhas.length} prontas em ${destino}\n`);
if (feitas < linhas.length) {
  console.log('  Rode de novo para refazer só o que faltou.\n');
}
