// Renderiza o bloco de texto (Itim, branco, centralizado, com sombra suave)
// como PNG transparente do tamanho da arte final. Segue a spec 5.2.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = 'c:/Users/mathe/Desktop/theatrum/conta-frases';
const FONT = `${ROOT}/fonts/Itim-Regular.ttf`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function block(text, size) {
  const ls = Math.round(size * 0.03 * 1024); // letter-spacing +3%
  return sharp({
    text: {
      text: `<span foreground="#FFFFFF" letter_spacing="${ls}">${esc(text)}</span>`,
      font: `Itim ${size}`,
      fontfile: FONT,
      rgba: true,
      align: 'center',
      dpi: 72,
      spacing: Math.round(size * 0.32), // line-height ~1.4
    },
  }).png().toBuffer();
}

// Maior corpo possivel que ainda respeita a margem de seguranca, minimo 58px.
async function fit(text, maxW, maxSize, minSize) {
  for (let s = maxSize; s >= minSize; s -= 2) {
    const buf = await block(text, s);
    const m = await sharp(buf).metadata();
    if (m.width <= maxW) return { buf, size: s, w: m.width, h: m.height };
  }
  const buf = await block(text, minSize);
  const m = await sharp(buf).metadata();
  return { buf, size: minSize, w: m.width, h: m.height };
}

async function render({ text, zone, W, H, margin, out }) {
  const maxW = W - margin * 2;
  const maxSize = Math.round(W / 1080 * 78);
  const minSize = Math.round(W / 1080 * 58);
  const { buf, size, w, h } = await fit(text, maxW, maxSize, minSize);

  // centro vertical do bloco conforme a zona de respiro
  const cy = zone === 'middle' ? H * 0.47 : H * 0.23;
  const left = Math.round((W - w) / 2);
  const top = Math.round(cy - h / 2);

  // sombra suave em duas camadas: um halo largo para descolar do fundo claro
  // e uma sombra curta 3px abaixo. Equivale a 0 2px 12px rgba(0,0,0,.35).
  const shade = async (blur, alpha) => sharp(buf)
    .tint('#000000')
    .blur(blur)
    .composite([{
      input: Buffer.from([0, 0, 0, alpha]), raw: { width: 1, height: 1, channels: 4 },
      tile: true, blend: 'dest-in',
    }])
    .png().toBuffer();

  const halo = await shade(14, 120);
  const shadow = await shade(6, 170);

  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: halo, left, top: top + 1 },
      { input: shadow, left, top: top + 3 },
      { input: buf, left, top },
    ])
    .png()
    .toFile(out);

  return { size, w, h, left, top };
}

(async () => {
  const posts = JSON.parse(fs.readFileSync(`${ROOT}/posts.json`, 'utf8'));
  const only = process.argv.slice(2);
  fs.mkdirSync(`${ROOT}/overlay`, { recursive: true });

  for (const p of posts) {
    if (only.length && !only.includes(p.id)) continue;
    const ig = await render({
      text: p.frase, zone: p.text_zone, W: 1080, H: 1350, margin: 120,
      out: `${ROOT}/overlay/${p.id}-4x5.png`,
    });
    const pin = await render({
      text: p.frase, zone: p.text_zone, W: 1000, H: 1500, margin: 110,
      out: `${ROOT}/overlay/${p.id}-2x3.png`,
    });
    console.log(`${p.id}: 4:5 ${ig.size}px (${ig.w}x${ig.h})  |  2:3 ${pin.size}px (${pin.w}x${pin.h})`);
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
