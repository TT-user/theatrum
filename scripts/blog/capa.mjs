/* Capa automática dos artigos (1200 x 630, a medida do Open Graph).
 *
 * Para artigo sem "cover" no frontmatter, o build desenha uma capa na
 * identidade da Theatrum: fundo escuro, estátua de gravura à direita,
 * rótulo da categoria e o título. É uma página HTML fotografada pelo
 * Chrome instalado no computador (playwright-core, sem baixar navegador)
 * e convertida para WebP pelo sharp.
 *
 * Sem Chrome, a função devolve false e o build usa a capa padrão. */
import fs from 'node:fs';
import path from 'node:path';

const CHROMES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);

let navegador = null;

async function abre() {
  if (navegador) return navegador;
  const exe = CHROMES.find((c) => fs.existsSync(c));
  if (!exe) return null;
  const { chromium } = await import('playwright-core');
  navegador = await chromium.launch({ executablePath: exe });
  return navegador;
}

export async function fecha() {
  if (navegador) await navegador.close();
  navegador = null;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const dataUri = (arq) => `data:image/webp;base64,${fs.readFileSync(arq).toString('base64')}`;

function html({ titulo, categoria, raiz }) {
  const logo = dataUri(path.join(raiz, 'assets/img/logo.webp'));
  const estatua = dataUri(path.join(raiz, 'assets/img/hero/estatua-816.webp'));
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&family=JetBrains+Mono:wght@500;700&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0B0A08;color:#F6F1E7;position:relative}
.fundo{position:absolute;inset:0;background:
  radial-gradient(60% 75% at 82% 10%,rgba(227,179,65,.16) 0%,transparent 62%),
  radial-gradient(50% 60% at 0% 100%,rgba(142,31,47,.18) 0%,transparent 62%),
  linear-gradient(180deg,#14110C 0%,#0B0A08 100%)}
.grade{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
  background-size:60px 60px;-webkit-mask-image:radial-gradient(70% 80% at 75% 30%,#000 0%,transparent 75%)}
.estatua{position:absolute;right:-40px;top:0;height:100%;mix-blend-mode:screen;opacity:.62;
  -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 30%)}
.in{position:absolute;inset:0;padding:56px 64px;display:flex;flex-direction:column}
.marca{display:flex;align-items:center;gap:16px;font:700 22px 'JetBrains Mono',monospace;letter-spacing:.02em}
.marca img{width:56px;height:56px;border-radius:15px;border:1px solid rgba(255,255,255,.16)}
.marca span{color:#A39B8D;font-weight:500}
.cat{margin-top:auto;font:700 24px 'JetBrains Mono',monospace;color:#E3B341}
h1{font:800 64px/1.08 'Plus Jakarta Sans',sans-serif;letter-spacing:-.012em;max-width:800px;margin-top:18px}
.base{display:flex;align-items:center;gap:18px;margin-top:34px;font:500 20px 'JetBrains Mono',monospace;color:#A39B8D}
.base i{display:block;width:72px;height:3px;background:#E3B341;border-radius:2px}
</style></head><body>
<div class="fundo"></div><div class="grade"></div><img class="estatua" src="${estatua}">
<div class="in">
  <div class="marca"><img src="${logo}">Theatrum <span>/ blog</span></div>
  <div class="cat">[${esc(categoria.toLowerCase())}]</div>
  <h1 id="t">${esc(titulo)}</h1>
  <div class="base"><i></i>usetheatrum.com.br</div>
</div>
<script>
  /* título longo encolhe até caber em quatro linhas */
  document.fonts.ready.then(function(){
    var t=document.getElementById('t'), s=64;
    while (t.offsetHeight > s*1.08*4 + 2 && s > 38) { s -= 2; t.style.fontSize = s + 'px'; }
    while (t.offsetHeight > 300 && s > 38) { s -= 2; t.style.fontSize = s + 'px'; }
    document.body.setAttribute('data-pronto','1');
  });
</script>
</body></html>`;
}

/* Desenha a capa e devolve o PNG em Buffer, ou null sem Chrome. */
export async function desenhaCapa({ titulo, categoria, raiz }) {
  const nav = await abre();
  if (!nav) return null;
  const pagina = await nav.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  try {
    await pagina.setContent(html({ titulo, categoria, raiz }), { waitUntil: 'networkidle' });
    await pagina.waitForSelector('body[data-pronto]', { timeout: 15000 });
    return await pagina.screenshot({ type: 'png' });
  } finally {
    await pagina.close();
  }
}
