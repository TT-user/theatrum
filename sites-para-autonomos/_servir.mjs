/* Sobe a página de conversão + os demos num servidor local.
   uso: node _servir.mjs   →   http://localhost:4321 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PORTA = 4321;
const PAGINA = 'index.html';

const TIPOS = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.webp':'image/webp', '.avif':'image/avif', '.ico':'image/x-icon', '.md':'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  if (rel === '') rel = PAGINA;                       // raiz abre a página de conversão
  let alvo = path.join(RAIZ, rel);

  if (!alvo.startsWith(RAIZ)) { res.writeHead(403).end('fora da pasta'); return; }
  if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) alvo = path.join(alvo, 'index.html');
  if (!fs.existsSync(alvo)) { res.writeHead(404).end('não encontrado: ' + rel); return; }

  res.writeHead(200, {
    'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(alvo).pipe(res);
}).listen(PORTA, () => {
  console.log(`\n  Página de conversão:  http://localhost:${PORTA}/`);
  console.log(`  Demos:                http://localhost:${PORTA}/demos/nutri-infantil/`);
  console.log(`                        http://localhost:${PORTA}/demos/nutri-emagrecimento/`);
  console.log(`                        http://localhost:${PORTA}/demos/nutri-clinica/`);
  console.log(`                        http://localhost:${PORTA}/demos/nutri-usa/`);
  console.log(`\n  Ctrl+C para parar.\n`);
});
