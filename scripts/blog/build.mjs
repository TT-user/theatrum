/* Build do blog: npm run build:blog
 *
 * Lê content/blog/*.md e escreve HTML estático em blog/:
 *   blog/index.html                     lista, com destaque e chips
 *   blog/<slug>/index.html              cada artigo
 *   blog/categoria/<categoria>/         uma página por categoria com artigo
 *   blog/img/<slug>/                    capa e imagens do artigo, em WebP
 *   blog/feed.xml                       RSS
 *   sitemap.xml (raiz)                  site principal + blog, com lastmod
 *
 * A pasta blog/ é toda deste script: página de artigo que não existe mais
 * em content/blog é apagada. A única exceção é blog/img/posts/, onde o
 * MazyOS publica os slides do carrossel do Instagram.
 *
 * Com erro no frontmatter, nada é escrito: a lista de erros sai no
 * terminal e o blog no ar continua como estava. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import * as yaml from 'js-yaml';
import sharp from 'sharp';
import { desenhaCapa, fecha as fechaNavegador } from './capa.mjs';
import * as M from './modelos.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTEUDO = path.join(RAIZ, 'content/blog');
const SAIDA = path.join(RAIZ, 'blog');
const CACHE = path.join(RAIZ, 'node_modules/.cache/blog-capas.json');
const SITE = M.SITE;
const PRESERVAR_IMG = new Set(['posts']);   /* slides do Instagram (MazyOS) */

/* páginas do site principal que entram no sitemap junto com o blog.
   Prévia de cliente, demo e página desativada ficam de fora (noindex). */
const PAGINAS_SITE = [
  ['/', 'index.html', '1.0'],
  ['/privacidade/', 'privacidade/index.html', '0.2'],
];

const erros = [];
const avisos = [];
const rel = (p) => path.relative(RAIZ, p).replace(/\\/g, '/');

/* ---------------------------------------------------------------- leitura */

function lePosts() {
  if (!fs.existsSync(CONTEUDO)) { erros.push('Pasta content/blog não existe.'); return []; }
  const arquivos = fs.readdirSync(CONTEUDO).filter((f) => f.endsWith('.md') && !f.startsWith('_') && f.toLowerCase() !== 'readme.md');
  const posts = [];
  for (const arq of arquivos) {
    const bruto = fs.readFileSync(path.join(CONTEUDO, arq), 'utf8').replace(/^﻿/, '');
    const m = bruto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    const onde = `content/blog/${arq}`;
    if (!m) { erros.push(`${onde}: falta o frontmatter (o bloco entre --- no topo).`); continue; }
    let fm;
    try { fm = yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) || {}; }
    catch (e) { erros.push(`${onde}: frontmatter com erro de digitação. ${e.message.split('\n')[0]}`); continue; }
    const post = valida(fm, onde, arq);
    if (!post) continue;
    post.corpoMd = m[2];
    post.arquivo = arq;
    posts.push(post);
  }
  const vistos = new Map();
  for (const p of posts) {
    if (vistos.has(p.slug)) erros.push(`slug "${p.slug}" repetido em ${vistos.get(p.slug)} e ${p.arquivo}.`);
    vistos.set(p.slug, p.arquivo);
  }
  return posts;
}

const DATA = /^\d{4}-\d{2}-\d{2}$/;

function valida(fm, onde, arq) {
  if (fm.draft === true || fm.rascunho === true) { avisos.push(`${onde}: rascunho, não publicado.`); return null; }
  const n = erros.length;
  const texto = (v) => (v == null ? '' : String(v).trim());
  const p = {
    title: texto(fm.title),
    description: texto(fm.description),
    slug: texto(fm.slug) || arq.replace(/\.md$/, ''),
    date: texto(fm.date),
    updated: texto(fm.updated) || texto(fm.date),
    category: texto(fm.category),
    tags: Array.isArray(fm.tags) ? fm.tags.map(texto).filter(Boolean) : (fm.tags ? [texto(fm.tags)] : []),
    cover: texto(fm.cover),
    coverAlt: texto(fm.coverAlt),
    cta: texto(fm.cta) || 'diagnostico',
    ctaTitulo: texto(fm.ctaTitulo),
    ctaTexto: texto(fm.ctaTexto),
    ctaBotao: texto(fm.ctaBotao),
    readingTime: fm.readingTime ? parseInt(fm.readingTime, 10) : 0,
    destaque: fm.destaque === true,
  };
  if (!p.title) erros.push(`${onde}: falta "title".`);
  if (!p.description) erros.push(`${onde}: falta "description".`);
  else if (p.description.length > 155) erros.push(`${onde}: "description" tem ${p.description.length} caracteres; o máximo é 155.`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) erros.push(`${onde}: "slug" só pode ter letras minúsculas sem acento, números e hífen (veio "${p.slug}").`);
  if (!DATA.test(p.date)) erros.push(`${onde}: "date" precisa ser no formato 2026-10-13 (veio "${p.date}").`);
  if (!DATA.test(p.updated)) erros.push(`${onde}: "updated" precisa ser no formato 2026-10-13 (veio "${p.updated}").`);
  else if (DATA.test(p.date) && p.updated < p.date) erros.push(`${onde}: "updated" (${p.updated}) é anterior a "date" (${p.date}).`);
  if (!M.CATEGORIAS[p.category]) erros.push(`${onde}: "category" precisa ser uma destas: ${Object.keys(M.CATEGORIAS).join(' | ')} (veio "${p.category}").`);
  if (!['diagnostico', 'planos'].includes(p.cta) && !/^\/[a-z0-9\-/]*$/.test(p.cta)) {
    erros.push(`${onde}: "cta" precisa ser diagnostico, planos ou o caminho de uma página, como /moveis-planejados/ (veio "${p.cta}").`);
  } else if (p.cta.startsWith('/')) {
    if (!p.cta.endsWith('/')) p.cta += '/';
    const pasta = path.join(RAIZ, p.cta);
    if (!fs.existsSync(path.join(pasta, 'index.html'))) erros.push(`${onde}: a página do "cta" (${p.cta}) não existe neste site.`);
    else if (/DESATIVADA/.test(fs.existsSync(path.join(pasta, '.htaccess')) ? fs.readFileSync(path.join(pasta, '.htaccess'), 'utf8') : '')) {
      erros.push(`${onde}: a página do "cta" (${p.cta}) está desativada (bloco DESATIVADA no .htaccess dela).`);
    }
  }
  if (p.title.length > 70) avisos.push(`${onde}: título com ${p.title.length} caracteres; o Google costuma cortar depois de uns 60.`);
  if (/—/.test(p.title + p.description + p.ctaTitulo + p.ctaTexto)) avisos.push(`${onde}: tem travessão (—) no título, descrição ou CTA; a regra da marca é não usar.`);
  return erros.length === n ? p : null;
}

/* ---------------------------------------------------------------- imagens */

const ehLocal = (href) => href && !/^(https?:)?\/\//i.test(href) && !href.startsWith('data:');

function origemDaImagem(href) {
  const limpo = decodeURI(href.split(/[?#]/)[0]);
  return limpo.startsWith('/') ? path.join(RAIZ, limpo) : path.join(CONTEUDO, limpo);
}

const maisNovo = (a, b) => !fs.existsSync(b) || fs.statSync(a).mtimeMs > fs.statSync(b).mtimeMs;

/* imagem do corpo do artigo: WebP em duas larguras, guardadas em blog/img/<slug>/ */
async function processaImagem(href, slug, onde) {
  const orig = origemDaImagem(href);
  if (!fs.existsSync(orig)) { erros.push(`${onde}: imagem não encontrada: ${href} (procurei em ${rel(orig)}).`); return null; }
  const base = path.basename(orig).replace(/\.[^.]+$/, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
  const pasta = path.join(SAIDA, 'img', slug);
  fs.mkdirSync(pasta, { recursive: true });
  const grande = path.join(pasta, `${base}.webp`);
  const media = path.join(pasta, `${base}-680.webp`);
  if (maisNovo(orig, grande)) {
    await sharp(orig).rotate().resize({ width: 1360, withoutEnlargement: true }).webp({ quality: 74 }).toFile(grande);
    await sharp(orig).rotate().resize({ width: 680, withoutEnlargement: true }).webp({ quality: 74 }).toFile(media);
  }
  const { width, height } = await sharp(grande).metadata();
  return { src: `/blog/img/${slug}/${base}.webp`, srcset: `/blog/img/${slug}/${base}-680.webp 680w, /blog/img/${slug}/${base}.webp ${width}w`, width, height };
}

const leCache = () => { try { return JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch { return {}; } };

/* capa: a do frontmatter, convertida; sem ela, a desenhada pelo capa.mjs */
async function processaCapa(post, cache) {
  const pasta = path.join(SAIDA, 'img', post.slug);
  fs.mkdirSync(pasta, { recursive: true });
  const grande = path.join(pasta, 'capa.webp');
  const pequena = path.join(pasta, 'capa-640.webp');
  const onde = `content/blog/${post.arquivo}`;
  const grava = async (entrada) => {
    await sharp(entrada).resize(1200, 630, { fit: 'cover', position: 'attention' }).webp({ quality: 78 }).toFile(grande);
    await sharp(entrada).resize(640, 336, { fit: 'cover', position: 'attention' }).webp({ quality: 74 }).toFile(pequena);
    /* JPG só para a prévia do link (og:image): WhatsApp e LinkedIn não mostram WebP com segurança */
    await sharp(entrada).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(pasta, 'capa-og.jpg'));
  };

  if (post.cover) {
    const orig = origemDaImagem(post.cover);
    if (!fs.existsSync(orig)) { erros.push(`${onde}: capa não encontrada: ${post.cover} (procurei em ${rel(orig)}).`); return; }
    const chave = `arquivo:${rel(orig)}:${fs.statSync(orig).mtimeMs}`;
    if (cache[post.slug] !== chave || !fs.existsSync(grande)) {
      const { width, height } = await sharp(orig).metadata();
      if (width < 1200 || height < 630) avisos.push(`${onde}: a capa tem ${width} x ${height}; o ideal é 1200 x 630 ou maior.`);
      await grava(orig);
      cache[post.slug] = chave;
    }
    return;
  }

  const chave = `auto:${post.title}:${post.category}`;
  if (cache[post.slug] === chave && fs.existsSync(grande) && fs.existsSync(path.join(pasta, 'capa-og.jpg'))) return;
  const png = await desenhaCapa({ titulo: post.title, categoria: post.category, raiz: RAIZ });
  if (png) { await grava(png); cache[post.slug] = chave; return; }
  if (!fs.existsSync(grande)) {
    avisos.push(`${onde}: não achei o Chrome para desenhar a capa; usei a capa padrão da marca.`);
    await grava(path.join(RAIZ, 'assets/img/hero/estatua-816.webp'));
  } else {
    avisos.push(`${onde}: não achei o Chrome; a capa antiga continua (o título pode ter mudado).`);
  }
}

/* ---------------------------------------------------------------- markdown */

const ancora = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'secao';

async function renderiza(post) {
  const onde = `content/blog/${post.arquivo}`;
  const imagens = new Map();
  const marked = new Marked({ gfm: true });
  const tokens = marked.lexer(post.corpoMd);

  const pendentes = [];
  marked.walkTokens(tokens, (t) => {
    if (t.type !== 'image') return;
    if (!t.text) avisos.push(`${onde}: imagem sem texto alternativo: ${t.href}. Escreva entre os colchetes o que ela mostra.`);
    if (ehLocal(t.href) && !imagens.has(t.href)) {
      imagens.set(t.href, null);
      pendentes.push(processaImagem(t.href, post.slug, onde).then((r) => imagens.set(t.href, r)));
    } else if (!ehLocal(t.href)) {
      avisos.push(`${onde}: imagem de fora do site (${t.href}); prefira salvar em content/blog/img/ para sair em WebP.`);
    }
  });
  await Promise.all(pendentes);

  const titulos = [];
  const usados = new Set();
  const img = (t) => {
    const r = imagens.get(t.href);
    const alt = M.esc(t.text || '');
    if (!r) return `<img src="${M.esc(t.href)}" alt="${alt}" loading="lazy" decoding="async">`;
    return `<img src="${r.src}" srcset="${r.srcset}" sizes="(max-width: 720px) 100vw, 680px" width="${r.width}" height="${r.height}" alt="${alt}" loading="lazy" decoding="async">`;
  };

  marked.use({
    renderer: {
      heading(t) {
        const html = this.parser.parseInline(t.tokens);
        if (t.depth === 1) avisos.push(`${onde}: "# ${t.text}" virou subtítulo (H2); o único H1 da página é o "title".`);
        const nivel = Math.max(2, t.depth);
        if (nivel !== 2) return `<h${nivel}>${html}</h${nivel}>\n`;
        let id = ancora(html);
        while (usados.has(id)) id += '-2';
        usados.add(id);
        titulos.push({ id, texto: html.replace(/<[^>]+>/g, '') });
        return `<h2 id="${id}">${html}</h2>\n`;
      },
      paragraph(t) {
        const so = t.tokens.filter((x) => !(x.type === 'text' && !x.text.trim()));
        if (so.length === 1 && so[0].type === 'image') {
          const i = so[0];
          return `<figure>${img(i)}${i.title ? `<figcaption>${M.esc(i.title)}</figcaption>` : ''}</figure>\n`;
        }
        return `<p>${this.parser.parseInline(t.tokens)}</p>\n`;
      },
      image(t) { return img(t); },
      link(t) {
        const texto = this.parser.parseInline(t.tokens);
        const href = M.esc(t.href);
        const titulo = t.title ? ` title="${M.esc(t.title)}"` : '';
        if (/wa\.me\/|api\.whatsapp\.com/i.test(t.href)) return `<a href="${href}"${titulo} target="_blank" rel="noopener" data-origem="blog-texto">${texto}</a>`;
        const externo = /^https?:\/\//i.test(t.href) && !t.href.startsWith(SITE);
        return `<a href="${href}"${titulo}${externo ? ' target="_blank" rel="noopener"' : ''}>${texto}</a>`;
      },
    },
  });

  const html = marked.parser(tokens);
  const palavras = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (titulos.length < 3) avisos.push(`${onde}: só ${titulos.length} subtítulo(s) "## "; o índice e o CTA do meio precisam de pelo menos 3.`);
  return { html, titulos, palavras, leitura: post.readingTime || Math.max(1, Math.ceil(palavras / 200)) };
}

/* ---------------------------------------------------------------- sitemap e feed */

function ultimaAlteracao(arquivo) {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', arquivo], { cwd: RAIZ, encoding: 'utf8' }).trim();
    if (d) return d;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

function sitemap(posts, categorias) {
  const urls = PAGINAS_SITE.map(([loc, arq, pri]) => ({ loc, lastmod: ultimaAlteracao(arq), pri }));
  const maisRecente = (lista) => lista.map((p) => p.updated).sort().pop();
  urls.push({ loc: '/blog/', lastmod: maisRecente(posts), pri: '0.8' });
  for (const [nome, lista] of categorias) urls.push({ loc: `/blog/categoria/${M.CATEGORIAS[nome].slug}/`, lastmod: maisRecente(lista), pri: '0.5' });
  for (const p of posts) urls.push({ loc: `/blog/${p.slug}/`, lastmod: p.updated, pri: '0.7' });
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por scripts/blog/build.mjs (npm run build:blog). Não edite à mão: a próxima publicação sobrescreve. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`;
}

/* ---------------------------------------------------------------- limpeza */

function limpaSaida(slugs) {
  if (!fs.existsSync(SAIDA)) return;
  for (const nome of fs.readdirSync(SAIDA)) {
    const p = path.join(SAIDA, nome);
    if (!fs.statSync(p).isDirectory()) continue;
    if (nome === 'img') {
      for (const sub of fs.readdirSync(p)) {
        if (!PRESERVAR_IMG.has(sub) && !slugs.has(sub) && fs.statSync(path.join(p, sub)).isDirectory()) {
          fs.rmSync(path.join(p, sub), { recursive: true });
          console.log(`  apagado  blog/img/${sub}/ (artigo saiu)`);
        }
      }
      continue;
    }
    if (nome === 'categoria') { fs.rmSync(p, { recursive: true }); continue; }
    if (!slugs.has(nome)) { fs.rmSync(p, { recursive: true }); console.log(`  apagado  blog/${nome}/ (artigo saiu)`); }
  }
}

function escreve(destino, conteudo) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo);
  console.log(`  escrito  ${rel(destino)}`);
}

/* ---------------------------------------------------------------- principal */

async function main() {
  console.log('Blog Theatrum: gerando…');
  const posts = lePosts();
  if (!posts.length && !erros.length) erros.push('Nenhum artigo publicável em content/blog.');
  if (erros.length) return falha();

  posts.sort((a, b) => (b.date + b.updated).localeCompare(a.date + a.updated));

  const cache = leCache();
  for (const p of posts) {
    Object.assign(p, await renderiza(p));
    await processaCapa(p, cache);
  }
  await fechaNavegador();
  if (erros.length) return falha();

  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));

  const categorias = new Map();
  for (const nome of Object.keys(M.CATEGORIAS)) {
    const lista = posts.filter((p) => p.category === nome);
    if (lista.length) categorias.set(nome, lista);
  }

  limpaSaida(new Set(posts.map((p) => p.slug)));

  for (const p of posts) {
    const mesma = posts.filter((o) => o !== p && o.category === p.category);
    const outras = posts.filter((o) => o !== p && o.category !== p.category);
    const relacionados = [...mesma, ...outras].slice(0, 3);
    escreve(path.join(SAIDA, p.slug, 'index.html'), M.paginaArtigo(p, relacionados));
  }
  escreve(path.join(SAIDA, 'index.html'), M.paginaLista({ posts, categorias }));
  for (const [nome, lista] of categorias) {
    escreve(path.join(SAIDA, 'categoria', M.CATEGORIAS[nome].slug, 'index.html'), M.paginaLista({ posts: lista, categorias, categoria: nome }));
  }
  escreve(path.join(SAIDA, 'feed.xml'), M.feed(posts, (p) => {
    const f = path.join(SAIDA, 'img', p.slug, 'capa-og.jpg');
    return fs.existsSync(f) ? fs.statSync(f).size : 0;
  }));
  escreve(path.join(RAIZ, 'sitemap.xml'), sitemap(posts, categorias));

  if (avisos.length) { console.log('\nAvisos (não impedem a publicação):'); avisos.forEach((a) => console.log(`  - ${a}`)); }
  console.log(`\nPronto: ${posts.length} artigo(s), ${categorias.size} categoria(s).`);
  console.log('Para conferir: npm run ver:blog  e abra http://localhost:4321/blog/');
}

function falha() {
  console.error('\nNada foi gerado. Corrija e rode de novo:');
  erros.forEach((e) => console.error(`  ✗ ${e}`));
  if (avisos.length) avisos.forEach((a) => console.error(`  - ${a}`));
  process.exitCode = 1;
  return fechaNavegador();
}

main().catch(async (e) => { console.error(e); await fechaNavegador(); process.exitCode = 1; });
