/* Completa as 24 fotos do Morattá a partir do acervo das outras demos
   de planejados, enquanto a API do Gemini e o Higgsfield estão sem saldo.

   Cada linha diz de qual foto sai, que pedaço recortar e em que tamanho
   entra. Tudo vira preto e branco, que é a linguagem do Morattá, e a
   escolha foi pelo assunto: a foto do puxador cava vai no lugar do
   puxador cava, a gaveta de talheres no lugar da gaveta de talheres.
   O texto das páginas foi ajustado ao que cada foto mostra de verdade.

   Se um dia as fotos próprias forem geradas, o converter.mjs escreve por
   cima destas nos mesmos caminhos, e nenhuma linha de HTML muda.

   uso: node moratta-do-acervo.mjs            (a partir de _fotos/) */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const D = '..';                       /* moveis-planejados/demos */
const SAI = path.join(D, 'moratta');

/* destino | origem | largura x altura | foco (sharp position ou recorte x,y,w,h) */
const MAPA = [
  ['img/hero/hero-01.jpg',          'casa-nobre/img/video/frame-01.jpg',  1920, 1080, 'centre'],
  ['img/hero/hero-02.jpg',          'casa-nobre/img/hero.jpg',            1920, 1080, 'centre'],
  ['img/hero/hero-03.jpg',          'medida-certa/img/video/frame-02.jpg',1920, 1080, 'centre'],
  ['img/hero/hero-04.jpg',          'atelie-verga/img/video/frame-01.jpg',1920, 1080, 'centre'],

  ['img/cozinhas/sereno.jpg',       'medida-certa/img/hero.jpg',           800, 1000, 'centre'],
  ['img/cozinhas/fresta.jpg',       'cerne/assets/img/01-marcenaria-d.webp',800,1000, 'centre'],
  ['img/cozinhas/praca.jpg',        'cerne/assets/img/03-cozinhas-a.webp', 800, 1000, 'centre'],
  ['img/cozinhas/compacta.jpg',     'medida-certa/img/projeto-05.jpg',     800, 1000, 'right'],
  ['img/cozinhas/detalhe-puxador.jpg','casa-nobre/img/detalhe-01.jpg',     800, 1000, 'centre'],

  ['img/lancamento/onix-hero.jpg',  'casa-nobre/img/video/frame-03.jpg',  1920, 1080, 'centre'],
  ['img/lancamento/onix-capa.jpg',  'cerne/assets/img/03-cozinhas-b.webp',1200,  800, 'centre'],
  ['img/lancamento/onix-detalhe.jpg','moratta/img/cozinhas/onix.jpg',      800, 1000, [380, 120, 560, 700]],
  ['img/lancamento/modulo-01.jpg',  'casa-nobre/img/video/frame-03.jpg',   800, 1000, 'right'],
  ['img/lancamento/modulo-02.jpg',  'casa-nobre/img/og.jpg',               800, 1000, 'centre'],
  ['img/lancamento/modulo-03.jpg',  'cozinha-viva/img/detalhe-01.jpg',     800, 1000, 'centre'],
  ['img/lancamento/modulo-04.jpg',  'casa-nobre/img/detalhe-02.jpg',       800, 1000, 'centre'],
  ['img/lancamento/modulo-05.jpg',  'cerne/assets/img/04-arremates-a.webp',800, 1000, 'centre'],
  ['img/lancamento/modulo-06.jpg',  'cerne/assets/img/02-estantes-a.webp', 800, 1000, 'centre'],

  ['img/showroom/showroom-01.jpg',  'casa-nobre/img/video/frame-02.jpg',   800, 1000, 'centre'],
  ['img/lojista/loja-parceira.jpg', 'casa-nobre/img/video/frame-05.jpg',  1200,  800, 'centre'],

  ['img/video/institucional-capa.jpg','atelie-verga/img/video/frame-03.jpg',1920,1080, 'centre'],
  ['img/video/fabrica-capa.jpg',    'atelie-verga/img/video/frame-02.jpg',1920, 1080, 'centre'],
  ['img/video/onix-capa.jpg',       'cerne/assets/img/01-marcenaria-c.webp',1920,1080, 'centre'],

  ['img/og.jpg',                    'casa-nobre/img/video/frame-01.jpg',  1200,  630, 'centre'],
];

const TETO = (w) => (w >= 1900 ? 250 : 150) * 1024;

for (const [dest, orig, w, h, foco] of MAPA) {
  let img = sharp(path.join(D, orig));
  if (Array.isArray(foco)) {
    const [left, top, width, height] = foco;
    img = img.extract({ left, top, width, height });
  }
  img = img.resize(w, h, { fit: 'cover', position: Array.isArray(foco) ? 'centre' : foco })
           .grayscale().linear(1.06, -6).sharpen({ sigma: 0.5 });
  const base = await img.toBuffer();
  let q = 80, buf;
  do {
    buf = await sharp(base).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    q -= 5;
  } while (buf.length > TETO(w) && q > 45);
  const alvo = path.join(SAI, dest);
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.writeFileSync(alvo, buf);
  console.log(dest.padEnd(36), `${w}x${h}`, (buf.length / 1024 | 0) + ' KB', 'q' + (q + 5));
}
