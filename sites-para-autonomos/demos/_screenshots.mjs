/* Gera os screenshots dos demos para os cards da página de anúncio.
   Uso: node _screenshots.mjs

   ATENÇÃO: o Chrome só exporta PNG, e PNG aqui custa ~1 MB por print.
   A página consome os arquivos .webp, então depois de rodar isto
   converta e apague os PNG:
     npx sharp-cli -i _prints/*-desktop.png -o _prints -f webp -q 72 resize 1000
   Sem esse passo os cards ficam sem capa.
   Sobe um servidor estático em /demos, abre cada demo no Chrome headless
   com ?limpo=1 (esconde a barra de demonstração) e salva o print. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SAIDA = path.join(AQUI, '_prints');
const PORTA = 8787;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(fs.existsSync);

const DEMOS = [
  { slug: 'nutri-infantil',      pagina: 'index.html' },
  { slug: 'nutri-clinica',       pagina: 'index.html' },
  { slug: 'nutri-usa',           pagina: 'index.html' },
  { slug: 'nutri-emagrecimento', pagina: 'index.html' },
];

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.avif': 'image/avif', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

const servidor = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const alvo = path.join(AQUI, rel);
  if (!alvo.startsWith(AQUI) || !fs.existsSync(alvo) || fs.statSync(alvo).isDirectory()) {
    res.writeHead(404).end('nao encontrado');
    return;
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(alvo).pipe(res);
});

function capturar(url, destino, largura, altura) {
  return new Promise((ok, falha) => {
    const p = spawn(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--no-sandbox', '--force-device-scale-factor=2',
      `--window-size=${largura},${altura}`,
      `--screenshot=${destino}`, '--virtual-time-budget=6000',
      url,
    ], { stdio: 'ignore' });
    p.on('exit', (c) => (fs.existsSync(destino) ? ok() : falha(new Error('chrome saiu ' + c))));
    p.on('error', falha);
  });
}

if (!CHROME) { console.error('Chrome/Edge nao encontrado.'); process.exit(1); }
fs.mkdirSync(SAIDA, { recursive: true });

await new Promise((r) => servidor.listen(PORTA, r));

for (const { slug, pagina } of DEMOS) {
  const url = `http://localhost:${PORTA}/${slug}/${pagina}?limpo=1`;

  const desktop = path.join(SAIDA, `${slug}-desktop.png`);
  await capturar(url, desktop, 1440, 900);
  console.log('  ✓', path.basename(desktop));

  const celular = path.join(SAIDA, `${slug}-mobile.png`);
  await capturar(url, celular, 390, 844);
  console.log('  ✓', path.basename(celular));
}

servidor.close();
console.log(`\nprints em ${SAIDA}`);
