/* Servidor local para conferir o blog antes de publicar: npm run ver:blog
 * Serve a pasta do site inteira, como o Hostinger, em http://localhost:4321.
 * Só para o seu computador; nada daqui vai para o ar. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORTA = Number(process.env.PORT) || 4321;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let arq = path.join(RAIZ, caminho);
  if (!arq.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(arq) && fs.statSync(arq).isDirectory()) {
    if (!caminho.endsWith('/')) { res.writeHead(301, { Location: caminho + '/' }).end(); return; }
    arq = path.join(arq, 'index.html');
  }
  if (!fs.existsSync(arq)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado: ' + caminho); return; }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(arq).pipe(res);
}).listen(PORTA, () => {
  console.log(`Site local em http://localhost:${PORTA}/`);
  console.log(`Blog:          http://localhost:${PORTA}/blog/`);
  console.log('Ctrl+C para parar.');
});
