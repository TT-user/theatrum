// Monta o post ESTATICO a partir da pintura parada, sem passar por video.
// Usa exatamente os mesmos cortes do montar.ps1 para que a moldura fique
// identica a dos posts animados: a pintura 3:4 vai para 1080x1440 e dali
// sai o 4:5 do feed (corte central, y=45) e o 2:3 do Pinterest (x=60).
//
//   node montar-estatico.js 11 12
const sharp = require('sharp');
const fs = require('fs');

const ROOT = 'c:/Users/mathe/Desktop/theatrum/conta-frases';

async function montar(id) {
  const src = `${ROOT}/img/${id}.png`;
  if (!fs.existsSync(src)) return console.log(`${id}: pintura ausente, pulando`);

  // base comum, na mesma escala que o video sai do Seedance
  const base = await sharp(src).resize(1080, 1440, { fit: 'cover' }).toBuffer();

  const ig = `${ROOT}/final/instagram/${id}-4x5.jpg`;
  await sharp(base)
    .extract({ left: 0, top: 45, width: 1080, height: 1350 })
    .composite([{ input: `${ROOT}/overlay/${id}-4x5.png` }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(ig);

  const pin = `${ROOT}/final/pinterest/${id}-2x3.jpg`;
  await sharp(base)
    .extract({ left: 60, top: 0, width: 960, height: 1440 })
    .resize(1000, 1500)
    .composite([{ input: `${ROOT}/overlay/${id}-2x3.png` }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(pin);

  const kb = (f) => Math.round(fs.statSync(f).size / 1024);
  console.log(`${id}: pronto (4:5 ${kb(ig)} KB + 2:3 ${kb(pin)} KB)`);
}

(async () => {
  const ids = process.argv.slice(2);
  if (!ids.length) return console.error('Informe os ids: node montar-estatico.js 11 12');
  fs.mkdirSync(`${ROOT}/final/instagram`, { recursive: true });
  fs.mkdirSync(`${ROOT}/final/pinterest`, { recursive: true });
  for (const id of ids) await montar(id);
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
