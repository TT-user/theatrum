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

/* A chave pode vir do ambiente ou de um .env aqui do lado. O arquivo é
   mais prático — a variável exportada some a cada terminal novo — e o
   .gitignore da raiz já barra o commit dele. */
const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const ENV = path.join(AQUI, '.env');
if (fs.existsSync(ENV)) {
  for (const linha of fs.readFileSync(ENV, 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const CHAVE = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const [manifesto, destino, modelo = 'gemini-3-pro-image-preview'] = process.argv.slice(2);

if (!CHAVE) {
  console.error('Falta a GEMINI_API_KEY.');
  console.error('Pegue em https://aistudio.google.com/apikey e salve em ' + ENV);
  console.error('no formato  GEMINI_API_KEY=AIza...');
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

/* vira true no primeiro 429 de saldo: os lotes seguintes nem saem */
let semSaldo = false;

/* A API só aceita esta lista fechada de proporções e recusa o pedido
   inteiro com 400 se pedirem outra. Como os manifestos são escritos à
   mão e nasceram para o Higgsfield, que aceita qualquer razão, aqui a
   proporção pedida cai na mais próxima em vez de derrubar a geração. */
const ACEITAS = ['1:1', '1:4', '1:8', '2:3', '3:2', '3:4', '4:1', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'];

function proporcao(pedida) {
  if (ACEITAS.includes(pedida)) return pedida;
  const [a, b] = pedida.split(':').map(Number);
  if (!a || !b) return '4:3';
  const alvo = a / b;
  const perto = ACEITAS.reduce((melhor, cand) => {
    const [x, y] = cand.split(':').map(Number);
    return Math.abs(x / y - alvo) < Math.abs(melhor.v - alvo) ? { c: cand, v: x / y } : melhor;
  }, { c: '4:3', v: 4 / 3 }).c;
  console.log(`  ajuste     ${pedida} nao existe na API, usando ${perto}`);
  return perto;
}

async function uma({ nome, aspecto, prompt }) {
  if (semSaldo) return false;
  const saida = path.join(destino, nome);
  if (fs.existsSync(saida) && fs.statSync(saida).size > 0) {
    console.log(`  JA EXISTE  ${nome}`);
    return true;
  }
  /* alguns manifestos usam o caminho do site como nome (img/ambientes/x.png)
     para o conversor saber onde cada arquivo vai; sem isto o write falha */
  fs.mkdirSync(path.dirname(saida), { recursive: true });

  const corpo = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: proporcao(aspecto) },
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
        /* 400 é o prompt ou o formato — insistir só queima tentativa, então
           sai na hora com a mensagem da API, que diz qual campo recusou. */
        if (resposta.status === 400 || resposta.status === 404) {
          console.log(`  FALHOU     ${nome}  ${resposta.status} ${texto.slice(0, 200)}`);
          return false;
        }
        /* Nem todo 429 é cota por minuto. Quando o saldo acaba, a API
           responde 429 com "credits are depleted", e aí esperar não
           resolve nunca: o lote inteiro tentaria três vezes cada um
           contra um endpoint morto. Abortar de uma vez deixa claro o
           que aconteceu e devolve o terminal em segundos. */
        if (resposta.status === 429 && /depleted|exceeded your current quota/i.test(texto)) {
          console.log(`\n  SALDO ACABOU na API do Gemini — parando aqui.`);
          console.log(`  Recarregue em https://ai.studio/projects e rode de novo:`);
          console.log(`  o que já foi gerado é pulado, e só o que falta é refeito.\n`);
          process.exitCode = 2;
          semSaldo = true;
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
  if (semSaldo) break;
}

console.log(`\n  ${feitas} de ${linhas.length} prontas em ${destino}\n`);
if (feitas < linhas.length) {
  console.log('  Rode de novo para refazer só o que faltou.\n');
}
