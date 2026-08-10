// Publica os posts de conta-frases como Reels no Instagram.
//
//   node --env-file=../MazyOS/.env postar-reels.js --checar
//   node --env-file=../MazyOS/.env postar-reels.js 01
//   node --env-file=../MazyOS/.env postar-reels.js 01 02 03
//   node --env-file=../MazyOS/.env postar-reels.js --todos
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

const BASE_VIDEO =
  'https://raw.githubusercontent.com/TT-user/theatrum/main/conta-frases/final/instagram';

const ROOT = __dirname;
const REGISTRO = path.join(ROOT, 'publicados.json');

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

async function conferirAmbiente() {
  const conta = await api(`${IG_ID}?fields=id,username,account_type,media_count`);
  console.log(`conta      : @${conta.username} (${conta.account_type}, ${conta.media_count} posts)`);

  let faltando = 0;
  for (const p of posts) {
    const url = `${BASE_VIDEO}/${p.id}-4x5.mp4`;
    let estado;
    try {
      const r = await fetch(url, { method: 'HEAD' });
      estado = r.ok
        ? `${r.status} ${(Number(r.headers.get('content-length')) / 1024 / 1024).toFixed(1)} MB`
        : `${r.status} INACESSIVEL`;
      if (!r.ok) faltando++;
    } catch (e) { estado = 'ERRO ' + e.message; faltando++; }
    console.log(`video ${p.id}  : ${estado}`);
  }
  if (faltando) {
    console.log(`\n${faltando} video(s) sem URL publica. Faca commit e push de`);
    console.log('conta-frases/final/instagram/*.mp4 antes de publicar.');
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

  const videoUrl = `${BASE_VIDEO}/${p.id}-4x5.mp4`;
  console.log(`\n${p.id} — "${p.frase_flat}"`);

  console.log('  criando container...');
  const container = await api(`${IG_ID}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption: montarLegenda(p.id),
    share_to_feed: true,
  });

  console.log(`  container ${container.id}, aguardando processamento...`);
  await esperarContainer(container.id);

  console.log('  publicando...');
  const pub = await api(`${IG_ID}/media_publish`, { creation_id: container.id });

  reg[p.id] = { media_id: pub.id, quando: new Date().toISOString() };
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

  for (const id of ids) {
    const p = posts.find((x) => x.id === id);
    if (!p) { console.log(`${id}: nao existe em posts.json`); continue; }
    await publicarUm(p);
    if (ids.length > 1) await dormir(30000); // respiro entre publicacoes
  }
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
