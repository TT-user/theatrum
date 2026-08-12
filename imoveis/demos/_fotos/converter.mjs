/* ============================================================
   Converte os PNG gerados para os JPG que os demos consomem,
   no tamanho e no peso que a página aguenta.

   uso: node converter.mjs <pasta-png> <pasta-img-do-demo>
     node converter.mjs png-bruno ../bruno-tavares/img

   O teto de peso é o mesmo dos demos de planejados: hero até
   250 KB, o resto até 150 KB. A qualidade desce em passos até
   caber — fixar um número só faria foto de céu limpo sair com
   40 KB e foto de folhagem estourar o teto.

   Precisa do sharp:  npm i sharp
   ============================================================ */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [origem, destino] = process.argv.slice(2);
if (!origem || !destino) {
  console.error('uso: node converter.mjs <pasta-png> <pasta-img-do-demo>');
  process.exit(1);
}

/* largura, altura, teto em KB. A chave é o nome do arquivo sem
   extensão; o que não bate cai na regra por padrão de nome. */
const EXATOS = {
  'hero':        [1920, 1080, 250],
  'hero-mobile': [1080, 1350, 220],
  'og':          [1200,  630, 200],
  'sobre':       [1000, 1250, 150],
  'fachada':     [1000, 1250, 150],
  'bairro':      [1400, 1000, 150],
  'obra':        [1200,  900, 150],
  'entorno':     [1200,  900, 150],
};

/* o hero do Bruno é vertical: o texto fica à esquerda e a foto do
   corretor ocupa uma coluna 4:5 ao lado, e não o fundo inteiro */
if (/bruno/.test(origem)) EXATOS.hero = [1200, 1500, 250];

function alvoDe(nome) {
  const base = nome.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  if (EXATOS[base]) return EXATOS[base];
  if (/^equipe-/.test(base))   return [800, 1000, 150];
  if (/^lazer-/.test(base))    return [1000, 750, 150];
  if (/^planta-/.test(base))   return [1200, 900, 150];
  /* fichas de imóvel: sm-104, bp-071, vi-2041, v-118, r-04, imovel-01 */
  return [1200, 900, 150];
}

fs.mkdirSync(destino, { recursive: true });

const arquivos = fs.readdirSync(origem).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
let total = 0;

for (const nome of arquivos) {
  const [larg, alt, teto] = alvoDe(nome);
  const saida = path.join(destino, nome.replace(/\.(png|jpeg|webp)$/i, '.jpg'));

  let kb = 0;
  /* desce até 38: foto de rua arborizada, cheia de folha, não cabe no
     teto com qualidade alta — e o passo de 6 fecha em poucas voltas */
  for (let q = 86; q >= 38; q -= 6) {
    await sharp(path.join(origem, nome))
      /* position 'attention' corta pelo que a imagem tem de mais
         saliente; num recorte de fachada isso salva o prédio de sair
         pela metade quando o aspecto do PNG não bate com o do alvo */
      .resize(larg, alt, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: q, mozjpeg: true })
      .toFile(saida);
    kb = Math.round(fs.statSync(saida).size / 1024);
    if (kb <= teto) break;
  }

  total += kb;
  console.log(`  ${path.basename(saida).padEnd(20)} ${String(larg + '×' + alt).padEnd(11)} ${String(kb + ' KB').padStart(8)}${kb > teto ? '  ACIMA DO TETO' : ''}`);
}

console.log(`\n  ${arquivos.length} arquivos · ${Math.round(total / 1024 * 10) / 10} MB no total\n`);
