// Publica os posts de conta-frases no Instagram.
//
// Cada post sai como Reel quando existe o mp4 animado e como imagem de feed
// quando so existe o jpg estatico. O formato e deduzido do arquivo, nao
// escolhido na linha de comando: assim um post animado nunca sai como foto
// por engano.
//
//   node --env-file=$ENV postar-reels.js --checar
//   node --env-file=$ENV postar-reels.js 01
//   node --env-file=$ENV postar-reels.js 01 02 03
//   node --env-file=$ENV postar-reels.js --todos
//
// $ENV = ../../explicologo/.env  (fora deste repo). ATENCAO: ../MazyOS/.env
// existe mas e o token da conta @theatrum.br — o --checar barra a publicacao
// se voce usar ele por engano.
//
// Os vídeos precisam estar acessíveis publicamente: a Meta baixa o arquivo
// da URL, ela não aceita upload direto. Usamos o raw do GitHub.
//
// Registra cada publicação em publicados.json para nunca postar duas vezes
// o mesmo item, mesmo que o script seja rodado de novo.

const fs = require('node:fs');
const path = require('node:path');

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_ID = process.env.INSTAGRAM_USER_ID;
const API = 'https://graph.instagram.com/v21.0';

// As artes tem @explicologo queimado no video. Se o token apontar para outra
// conta, o post sai assinado com um handle que nao e o dono do perfil — entao
// o script confere o username antes de criar qualquer container.
const CONTA_ESPERADA = 'explicologo';

const BASE =
  'https://raw.githubusercontent.com/TT-user/theatrum/main/conta-frases/final/instagram';

const ROOT = __dirname;
const REGISTRO = path.join(ROOT, 'publicados.json');
const FINAL = path.join(ROOT, 'final', 'instagram');

// O mp4 manda: se a animacao existe, o post e Reel. Sem mp4 e com jpg, sai
// como imagem de feed. Sem nenhum dos dois, o post ainda nao esta pronto.
function midia(id) {
  if (fs.existsSync(path.join(FINAL, `${id}-4x5.mp4`))) {
    return { tipo: 'REELS', arquivo: `${id}-4x5.mp4`, url: `${BASE}/${id}-4x5.mp4` };
  }
  if (fs.existsSync(path.join(FINAL, `${id}-4x5.jpg`))) {
    return { tipo: 'IMAGE', arquivo: `${id}-4x5.jpg`, url: `${BASE}/${id}-4x5.jpg` };
  }
  return null;
}

const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'posts.json'), 'utf8'));
const copy = JSON.parse(fs.readFileSync(path.join(ROOT, 'copy.json'), 'utf8'));

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function lerRegistro() {
  try { return JSON.parse(fs.readFileSync(REGISTRO, 'utf8')); } catch (e) { return {}; }
}
function gravarRegistro(reg) {
  fs.writeFileSync(REGISTRO, JSON.stringify(reg, null, 2) + '\n', 'utf8');
}

async function api(caminho, corpo) {
  const url = `${API}/${caminho}`;
  const res = corpo
    ? await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...corpo, access_token: TOKEN }),
      })
    : await fetch(`${url}${url.includes('?') ? '&' : '?'}access_token=${TOKEN}`);
  const dados = await res.json();
  if (!res.ok || dados.error) {
    throw new Error(JSON.stringify(dados.error || dados));
  }
  return dados;
}

async function conferirConta() {
  const conta = await api(`${IG_ID}?fields=id,username,account_type,media_count`);
  const ok = conta.username.toLowerCase() === CONTA_ESPERADA;
  console.log(
    `conta      : @${conta.username} (${conta.account_type}, ${conta.media_count} posts)` +
      (ok ? '' : `  <-- ESPERADO @${CONTA_ESPERADA}`)
  );
  return { conta, ok };
}

async function conferirAmbiente() {
  const { ok } = await conferirConta();

  // so checa o que ja foi montado: os posts sem arte ainda estao na esteira
  // e nao sao erro, apenas nao entram na fila de publicacao.
  let faltando = 0;
  let semArte = 0;
  for (const p of posts) {
    const m = midia(p.id);
    if (!m) { semArte++; continue; }
    let estado;
    try {
      const r = await fetch(m.url, { method: 'HEAD' });
      estado = r.ok
        ? `${r.status} ${(Number(r.headers.get('content-length')) / 1024 / 1024).toFixed(1)} MB`
        : `${r.status} INACESSIVEL`;
      if (!r.ok) faltando++;
    } catch (e) { estado = 'ERRO ' + e.message; faltando++; }
    console.log(`${p.id} ${m.tipo.padEnd(5)}: ${estado}`);
  }
  if (semArte) console.log(`\n${semArte} post(s) ainda sem arte montada.`);
  if (faltando) {
    console.log(`\n${faltando} arquivo(s) sem URL publica. Faca commit e push de`);
    console.log('conta-frases/final/instagram/ antes de publicar.');
    process.exit(1);
  }
  if (!ok) {
    console.log(`\nO token nao e da conta @${CONTA_ESPERADA}. Publicacao bloqueada:`);
    console.log('os videos estao assinados com esse handle na propria arte.');
    process.exit(1);
  }
  console.log('\nambiente ok.');
}

// A legenda leva o texto do post; as hashtags vao no primeiro comentario,
// como manda o briefing.
function montarLegenda(id) {
  return copy[id].legenda;
}

async function esperarContainer(id) {
  // Video demora bem mais que imagem: o container so fica FINISHED depois
  // que a Meta baixa e transcodifica o arquivo.
  for (let i = 0; i < 60; i++) {
    const d = await api(`${id}?fields=status_code,status`);
    if (d.status_code === 'FINISHED') return;
    if (d.status_code === 'ERROR') throw new Error(`container falhou: ${d.status || ''}`);
    await dormir(5000);
  }
  throw new Error('timeout esperando o container ficar pronto');
}

async function comentar(mediaId, texto) {
  try {
    await api(`${mediaId}/comments`, { message: texto });
    return true;
  } catch (e) {
    console.log(`  aviso: nao consegui comentar as hashtags (${e.message})`);
    return false;
  }
}

async function publicarUm(p) {
  const reg = lerRegistro();
  if (reg[p.id]) {
    console.log(`${p.id}: ja publicado em ${reg[p.id].quando} (${reg[p.id].media_id}), pulando`);
    return;
  }

  const m = midia(p.id);
  if (!m) { console.log(`${p.id}: sem arte montada, pulando`); return; }

  console.log(`\n${p.id} [${m.tipo}] — "${p.frase_flat}"`);

  console.log('  criando container...');
  const container = await api(`${IG_ID}/media`, m.tipo === 'REELS'
    ? {
        media_type: 'REELS',
        video_url: m.url,
        caption: montarLegenda(p.id),
        share_to_feed: true,
      }
    : {
        image_url: m.url,
        caption: montarLegenda(p.id),
      });

  console.log(`  container ${container.id}, aguardando processamento...`);
  await esperarContainer(container.id);

  console.log('  publicando...');
  const pub = await api(`${IG_ID}/media_publish`, { creation_id: container.id });

  reg[p.id] = { media_id: pub.id, tipo: m.tipo, quando: new Date().toISOString() };
  gravarRegistro(reg);
  console.log(`  publicado: ${pub.id}`);

  const ok = await comentar(pub.id, copy[p.id].hashtags);
  if (ok) console.log('  hashtags no primeiro comentario');
}

async function main() {
  if (!TOKEN || !IG_ID) {
    console.error('Faltam INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_USER_ID no .env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  if (args.includes('--checar')) return conferirAmbiente();

  const ids = args.includes('--todos')
    ? posts.map((p) => p.id)
    : args.filter((a) => /^\d{2}$/.test(a));

  if (!ids.length) {
    console.error('Informe os ids (ex: 01 02) ou --todos. Use --checar para conferir antes.');
    process.exit(1);
  }

  const { ok } = await conferirConta();
  if (!ok && !args.includes('--forcar-conta')) {
    console.error(`\nToken de outra conta. Nada foi publicado. Ajuste o .env para @${CONTA_ESPERADA}`);
    console.error('ou rode com --forcar-conta se a publicacao cruzada for intencional.');
    process.exitCode = 1;
    return;
  }

  for (const id of ids) {
    const p = posts.find((x) => x.id === id);
    if (!p) { console.log(`${id}: nao existe em posts.json`); continue; }
    await publicarUm(p);
    if (ids.length > 1) await dormir(30000); // respiro entre publicacoes
  }
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
