/* Modelos HTML do blog. Topo, rodapé, medição e aviso de cookies seguem
 * os da home (index.html): mudou lá, confira aqui. O blog é só em
 * português, então não há data-en nem botão de idioma. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = 'https://usetheatrum.com.br';
const WA = '5532984762445';
const AUTOR = 'Matheus · Theatrum';
const CSS = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'estilo.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').trim();

export const CATEGORIAS = {
  'Dor do negócio': { slug: 'dor-do-negocio', desc: 'O que faz o seu negócio perder cliente sem você perceber, e como enxergar isso sozinho.' },
  'Decisão': { slug: 'decisao', desc: 'O que pesar antes de contratar um site, um anúncio ou uma agência.' },
  'Nicho': { slug: 'nicho', desc: 'Como site, Google e anúncio funcionam no seu tipo de negócio.' },
};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const wa = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dataLonga = (d) => { const [a, m, dia] = d.split('-'); return `${+dia} de ${MESES[m - 1]} de ${a}`; };
const dataCurta = (d) => { const [a, m, dia] = d.split('-'); return `${dia}/${m}/${a}`; };
const iso = (d) => `${d}T09:00:00-03:00`;
const SETA = '<svg class="seta" viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6h15M11 1l5 5-5 5"/></svg>';
const capa = (slug) => `/blog/img/${slug}/capa.webp`;
const capaOg = (slug) => `/blog/img/${slug}/capa-og.jpg`;   /* prévia de link: JPG, que todo app mostra */
const capaAlt = (p) => p.coverAlt || `Capa do artigo: ${p.title}`;

/* ---------------------------------------------------------------- partes comuns */

/* medição: igual ao <head> da home. GTM e gtag sobem no primeiro gesto ou
   no ocioso (no <head> eles travavam a página); o UET começa com anúncio
   negado e só recebe 'granted' de quem aceitou cookies. */
const MEDICAO = `<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','G-2LNND3QDPM');gtag('config','AW-18362682320');
(function(){var subiu=false;function sobe(){if(subiu)return;subiu=true;dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});
["https://www.googletagmanager.com/gtm.js?id=GTM-N247ZTJ5","https://www.googletagmanager.com/gtag/js?id=G-2LNND3QDPM"].forEach(function(src){var j=document.createElement("script");j.async=true;j.src=src;document.head.appendChild(j);});}
["pointerdown","touchstart","keydown","scroll"].forEach(function(ev){addEventListener(ev,sobe,{once:true,passive:true});});
addEventListener("load",function(){if(window.requestIdleCallback)requestIdleCallback(sobe,{timeout:6000});else setTimeout(sobe,3000);});})();
</script>
<!-- Microsoft Ads UET (tag 187278315) + consentimento, igual à home -->
<script>
window.uetq=window.uetq||[];window.uetq.push('consent','default',{'ad_storage':'denied'});
try{if(localStorage.getItem('theatrum-cookies')==='aceito')window.uetq.push('consent','update',{'ad_storage':'granted'});}catch(e){}
(function(){var subiu=false;function uet(){if(subiu)return;subiu=true;
(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"187278315", enableAutoSpaFix: true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","https://bat.bing.com/bat.js","uetq");}
["pointerdown","touchstart","keydown","scroll"].forEach(function(ev){addEventListener(ev,uet,{once:true,passive:true});});
addEventListener("load",function(){if(window.requestIdleCallback)requestIdleCallback(uet,{timeout:6000});else setTimeout(uet,3000);});})();
</script>`;

function head({ titulo, descricao, url, imagem, imagemAlt, tipo = 'website', extraMeta = '', jsonld = [] }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Gerado por scripts/blog/build.mjs a partir de content/blog. Não edite aqui: rode npm run build:blog. -->
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="theme-color" content="#0B0A08"/>
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}"/>
<link rel="canonical" href="${url}"/>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png"/>
<link rel="apple-touch-icon" href="/assets/img/logo-180.png"/>
<link rel="alternate" type="application/rss+xml" title="Blog Theatrum" href="${SITE}/blog/feed.xml"/>
<meta property="og:type" content="${tipo}"/>
<meta property="og:site_name" content="Theatrum"/>
<meta property="og:locale" content="pt_BR"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${esc(titulo)}"/>
<meta property="og:description" content="${esc(descricao)}"/>
<meta property="og:image" content="${imagem}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="${esc(imagemAlt)}"/>
${extraMeta}<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(titulo)}"/>
<meta name="twitter:description" content="${esc(descricao)}"/>
<meta name="twitter:image" content="${imagem}"/>
<meta name="twitter:image:alt" content="${esc(imagemAlt)}"/>
${jsonld.map((j) => `<script type="application/ld+json">${json(j)}</script>`).join('\n')}
${MEDICAO}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"/>
<style>
${CSS}
</style>
</head>`;
}

const NAV = [
  ['/#trabalhos', 'Trabalhos'],
  ['/#servicos', 'Serviços'],
  ['/#como-funciona', 'Como funciona'],
  ['/#investimento', 'Investimento'],
  ['/blog/', 'Blog'],
  ['/#faq', 'FAQ'],
];
const MSG_TOPO = 'Vim do blog da Theatrum. Quero o diagnóstico gratuito.';

function topo() {
  const itens = NAV.map(([h, t]) => `<a href="${h}"${h === '/blog/' ? ' aria-current="page"' : ''}>${t}</a>`);
  return `<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N247ZTJ5" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<nav class="site-nav" aria-label="Principal">
  <a class="brand" href="/"><span class="brand-chip"><img src="/assets/img/logo.webp" width="192" height="192" decoding="async" alt=""/></span><b>Theatrum</b></a>
  <ul class="nav-links">${itens.map((a) => `<li>${a}</li>`).join('')}</ul>
  <div class="nav-right">
    <a class="nav-cta" href="${wa(MSG_TOPO)}" target="_blank" rel="noopener" data-origem="blog-topo">Diagnóstico gratuito</a>
    <button class="nav-burger" id="navBurger" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
  </div>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="/">Início</a>${itens.join('')}
  <a class="mm-cta" href="${wa(MSG_TOPO)}" target="_blank" rel="noopener" data-origem="blog-menu">Diagnóstico gratuito</a>
</div>`;
}

function rodape() {
  return `<footer>
  <div class="ft">
    <div class="ft-sobre">
      <a class="brand" href="/"><span class="brand-chip"><img src="/assets/img/logo.webp" width="192" height="192" decoding="async" loading="lazy" alt=""/></span><b>Theatrum</b></a>
      <p>Sites, lojas, aplicativos e sistemas sob medida, com Google e tráfego pago para trazer cliente. Para negócios no Brasil e no exterior.</p>
    </div>
    <div>
      <h4>Serviços</h4>
      <ul>
        <li><a href="/#servicos">Sites e landing pages</a></li>
        <li><a href="/#servicos">Lojas virtuais</a></li>
        <li><a href="/#servicos">Aplicativos e sistemas</a></li>
        <li><a href="/#servicos">Google Meu Negócio</a></li>
        <li><a href="/#servicos">Tráfego pago</a></li>
        <li><a href="/#servicos">IA no WhatsApp</a></li>
      </ul>
    </div>
    <div>
      <h4>Trabalhos</h4>
      <ul>
        <li><a href="/#trabalhos">Portfólio</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>
    </div>
    <div>
      <h4>Contato</h4>
      <ul>
        <li><a href="${wa(MSG_TOPO)}" target="_blank" rel="noopener" data-origem="blog-rodape">WhatsApp</a></li>
        <li><a href="https://www.instagram.com/theatrum.br/" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="/#faq">Perguntas</a></li>
        <li><a href="/privacidade/">Privacidade</a></li>
        <li><a href="/blog/feed.xml">RSS do blog</a></li>
      </ul>
    </div>
  </div>
  <div class="ft-base"><span>Theatrum · sites, lojas, aplicativos, Google e tráfego pago. © 2026.</span><span>Responsável: Matheus Ananias de Souza · CNPJ 61.978.753/0001-60</span></div>
</footer>`;
}

/* menu do celular e blog_cta_click. O evento vai para GA4 e UET pelo
   TheatrumLeads.evento (js/leads.js), que só manda para quem aceitou
   cookies; o plano B repete a mesma regra se o leads.js não carregou.
   O whatsapp_click continua saindo do leads.js, como no resto do site. */
const JS_COMUM = `<script>
(function(){
  var b=document.getElementById('navBurger'),m=document.getElementById('mobileMenu');
  if(b&&m){b.addEventListener('click',function(){var a=m.classList.toggle('is-open');b.setAttribute('aria-expanded',a);b.setAttribute('aria-label',a?'Fechar menu':'Abrir menu');document.body.style.overflow=a?'hidden':'';});
    m.addEventListener('click',function(e){if(e.target.closest('a')){m.classList.remove('is-open');b.setAttribute('aria-expanded','false');document.body.style.overflow='';}});}
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-blog-cta]');if(!a)return;
    var p={origem:'blog-'+a.getAttribute('data-blog-cta'),cta:a.getAttribute('data-cta-tipo')||'',artigo:a.getAttribute('data-artigo')||''};
    if(window.TheatrumLeads&&TheatrumLeads.evento){TheatrumLeads.evento('blog_cta_click',p);return;}
    try{if(localStorage.getItem('theatrum-cookies')!=='aceito')return;}catch(x){return;}
    if(typeof gtag==='function')gtag('event','blog_cta_click',p);
    (window.uetq=window.uetq||[]).push('event','blog_cta_click',{event_label:p.origem});
  },true);
})();
</script>`;

const SCRIPTS_SITE = `<script src="/js/consentimento.js" defer></script>
<script src="/js/uet-eventos.js" defer></script>
<script src="/js/leads.js?v=2" defer></script>
</body>
</html>
`;

const ORG = { '@type': 'Organization', name: 'Theatrum', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/assets/img/logo-180.png`, width: 180, height: 180 } };
const migalhas = (itens) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: itens.map(([nome, url], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: url })),
});

/* imagem de capa: 640 px para a grade, 1200 px para tela larga e redes */
function imgCapa(p, { sizes, prioridade = false }) {
  return `<img src="/blog/img/${p.slug}/capa-640.webp" srcset="/blog/img/${p.slug}/capa-640.webp 640w, ${capa(p.slug)} 1200w" sizes="${sizes}" width="1200" height="630" alt="${esc(capaAlt(p))}" ${prioridade ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"/>`;
}

const metaPost = (p, { link = false } = {}) => `<div class="meta">${link
  ? `<a class="cat" href="/blog/categoria/${CATEGORIAS[p.category].slug}/">${esc(p.category)}</a>`
  : `<span class="cat">${esc(p.category)}</span>`}<span>${p.leitura} min de leitura</span></div>`;

function cartao(p) {
  return `<a class="card" href="/blog/${p.slug}/">
  ${imgCapa(p, { sizes: '(max-width: 700px) 100vw, 380px' })}
  <div class="txt">${metaPost(p)}<h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div>
</a>`;
}

/* ---------------------------------------------------------------- CTA do artigo */

/* Os três destinos do campo cta. O botão principal sempre vem com um
   degrau mais baixo ao lado (a calculadora, sem cadastro): regra da
   escada de compromisso, nenhuma oferta só de diagnóstico ao vivo. */
function infoCta(p) {
  if (p.cta === 'planos') return {
    tipo: 'planos', href: '/#investimento', wa: false,
    titulo: 'Quanto custa ter isso no seu negócio?',
    texto: 'Três planos com preço publicado no site. O diagnóstico gratuito diz qual serve para você.',
    botao: 'Ver planos e preços',
  };
  if (p.cta.startsWith('/')) return {
    tipo: 'nicho', href: p.cta, wa: false,
    titulo: 'Veja como isso fica no seu segmento',
    texto: 'Uma página feita para o seu tipo de negócio, com exemplos rodando e o que entra no projeto.',
    botao: 'Ver a página do segmento',
  };
  return {
    tipo: 'diagnostico', href: wa(`Vim do blog da Theatrum, do artigo "${p.title}". Quero o diagnóstico gratuito.`), wa: true,
    titulo: 'Quer saber o que falta no seu site?',
    texto: 'No diagnóstico gratuito a gente olha o seu site, o seu Google e o caminho até o seu WhatsApp, e mostra onde você perde cliente. Sem compromisso.',
    botao: 'Fazer diagnóstico gratuito',
  };
}

function cta(p, onde) {
  const c = infoCta(p);
  const titulo = esc(p.ctaTitulo || c.titulo);
  const texto = esc(p.ctaTexto || c.texto);
  const botao = esc(p.ctaBotao || c.botao);
  const alvo = c.wa ? ` target="_blank" rel="noopener" data-origem="blog-${onde}"` : '';
  const btn = `<a class="btn btn-ouro" href="${esc(c.href)}"${alvo} data-blog-cta="${onde}" data-cta-tipo="${c.tipo}" data-artigo="${p.slug}">${botao} ${SETA}</a>`;
  const degrau = `<span class="sec">Prefere ver o seu número antes? <a href="/#calculadora" data-blog-cta="${onde}" data-cta-tipo="calculadora" data-artigo="${p.slug}">Use a calculadora</a>, sem cadastro.</span>`;
  if (onde === 'meio') {
    return `<aside class="cta-art curto" aria-label="Próximo passo"><div><span class="rotulo"><b>›</b> próximo passo</span><p class="cta-t">${titulo}</p></div><div class="acoes">${btn}</div>${degrau}</aside>`;
  }
  return `<aside class="cta-art" aria-label="Próximo passo"><span class="rotulo"><b>›</b> próximo passo</span><p class="cta-t">${titulo}</p><p>${texto}</p><div class="acoes">${btn}${degrau}</div></aside>`;
}

/* ---------------------------------------------------------------- artigo */

export function paginaArtigo(p, relacionados) {
  const url = `${SITE}/blog/${p.slug}/`;
  const imagem = `${SITE}${capaOg(p.slug)}`;
  const urlCat = `${SITE}/blog/categoria/${CATEGORIAS[p.category].slug}/`;

  /* CTA do meio: depois da seção do 2º H2, ou seja, logo antes do 3º.
     Com menos de 3 H2 ele não entra (ficaria colado no do fim). */
  let corpo = p.html;
  const h2 = [...corpo.matchAll(/<h2 id=/g)];
  if (h2.length >= 3) corpo = corpo.slice(0, h2[2].index) + cta(p, 'meio') + '\n' + corpo.slice(h2[2].index);

  const indice = p.titulos.length >= 2 ? `<details class="toc" id="indice" open>
  <summary>Neste artigo</summary>
  <ol>${p.titulos.map((t) => `<li><a href="#${t.id}">${esc(t.texto)}</a></li>`).join('')}</ol>
</details>` : '<div></div>';

  const textoPartilha = `${p.title} ${url}`;
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.title.slice(0, 110), description: p.description,
      image: { '@type': 'ImageObject', url: imagem, width: 1200, height: 630 },
      datePublished: iso(p.date), dateModified: iso(p.updated),
      author: { '@type': 'Person', name: 'Matheus', url: `${SITE}/` },
      publisher: ORG, mainEntityOfPage: { '@type': 'WebPage', '@id': url }, url,
      inLanguage: 'pt-BR', articleSection: p.category, keywords: p.tags.join(', '), wordCount: p.palavras,
    },
    migalhas([['Início', `${SITE}/`], ['Blog', `${SITE}/blog/`], [p.title, url]]),
  ];
  const extraMeta = `<meta property="article:published_time" content="${iso(p.date)}"/>
<meta property="article:modified_time" content="${iso(p.updated)}"/>
<meta property="article:author" content="${AUTOR}"/>
<meta property="article:section" content="${esc(p.category)}"/>
${p.tags.map((t) => `<meta property="article:tag" content="${esc(t)}"/>\n`).join('')}`;

  return `${head({ titulo: p.title, descricao: p.description, url, imagem, imagemAlt: capaAlt(p), tipo: 'article', extraMeta, jsonld })}
${topo()}
<main>
<header class="art-topo">
  <div class="wrap"><div class="in">
    <nav class="trilha" aria-label="Você está em"><a href="/">Início</a><span>›</span><a href="/blog/">Blog</a><span>›</span><a href="/blog/categoria/${CATEGORIAS[p.category].slug}/">${esc(p.category)}</a></nav>
    <a class="cat rotulo" href="/blog/categoria/${CATEGORIAS[p.category].slug}/">[${esc(p.category.toLowerCase())}]</a>
    <h1>${esc(p.title)}</h1>
    <p class="resumo">${esc(p.description)}</p>
    <div class="meta"><span class="autor">${AUTOR}</span><span>Atualizado em <time datetime="${p.updated}">${dataLonga(p.updated)}</time></span><span>${p.leitura} min de leitura</span></div>
  </div></div>
</header>
<div class="capa">${imgCapa(p, { sizes: '(max-width: 1000px) 100vw, 900px', prioridade: true })}</div>
<div class="leitura">
  <div class="leitura-grade">
    ${indice}
    <article class="prosa">
${corpo}
${cta(p, 'fim')}
      ${p.tags.length ? `<div class="tags" aria-label="Assuntos">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="partilha">
        <span class="rotulo">compartilhar</span>
        <a href="https://wa.me/?text=${encodeURIComponent(textoPartilha)}" target="_blank" rel="noopener" data-compartilhar><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>WhatsApp</a>
        <button type="button" id="copiaLink" data-url="${url}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg><span>Copiar link</span></button>
      </div>
    </article>
  </div>
</div>
${relacionados.length ? `<section class="relacionados" aria-labelledby="rel-t">
  <div class="wrap">
    <span class="rotulo"><b>[+]</b> continue lendo</span>
    <h2 id="rel-t">Artigos relacionados</h2>
    <div class="grade">${relacionados.map(cartao).join('\n')}</div>
  </div>
</section>` : ''}
</main>
${rodape()}
${JS_COMUM}
<script>
(function(){
  /* índice: aberto no computador (coluna fixa), recolhido no celular */
  var t=document.getElementById('indice');
  if(t&&!matchMedia('(min-width:1140px)').matches)t.open=false;
  if(t&&'IntersectionObserver' in window){
    var links={};t.querySelectorAll('a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){t.querySelectorAll('a.ativo').forEach(function(a){a.classList.remove('ativo');});var a=links[e.target.id];if(a)a.classList.add('ativo');}});},{rootMargin:'-90px 0px -70% 0px'});
    document.querySelectorAll('.prosa h2[id]').forEach(function(h){io.observe(h);});
  }
  /* copiar link, com plano B para navegador sem clipboard */
  var c=document.getElementById('copiaLink');
  if(c)c.addEventListener('click',function(){
    var u=c.getAttribute('data-url'),s=c.querySelector('span');
    function ok(){s.textContent='Link copiado';setTimeout(function(){s.textContent='Copiar link';},2200);}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(u).then(ok,velho);}else velho();
    function velho(){var i=document.createElement('input');i.value=u;document.body.appendChild(i);i.select();try{document.execCommand('copy');ok();}catch(e){prompt('Copie o link:',u);}i.remove();}
  });
})();
</script>
${SCRIPTS_SITE}`;
}

/* ---------------------------------------------------------------- lista */

export function paginaLista({ posts, categorias, categoria }) {
  const naCategoria = Boolean(categoria);
  const url = naCategoria ? `${SITE}/blog/categoria/${CATEGORIAS[categoria].slug}/` : `${SITE}/blog/`;
  const titulo = naCategoria ? `${categoria}: artigos do Blog Theatrum` : 'Blog Theatrum: como transformar visita em cliente';
  const descricao = naCategoria
    ? `${CATEGORIAS[categoria].desc} Artigos do Blog Theatrum.`
    : 'Artigos curtos para dono de negócio: site, Google e anúncio que transformam visita em cliente no WhatsApp.';
  const destaque = naCategoria ? null : (posts.find((p) => p.destaque) || posts[0]);
  const resto = posts.filter((p) => p !== destaque);
  const total = [...categorias.values()].reduce((n, l) => n + l.length, 0);

  const chips = `<nav class="chips" aria-label="Categorias">
  <a class="chip" href="/blog/"${naCategoria ? '' : ' aria-current="page"'}>Todos <small>${total}</small></a>
  ${[...categorias].map(([nome, lista]) => `<a class="chip" href="/blog/categoria/${CATEGORIAS[nome].slug}/"${nome === categoria ? ' aria-current="page"' : ''}>${esc(nome)} <small>${lista.length}</small></a>`).join('\n  ')}
</nav>`;

  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': naCategoria ? 'CollectionPage' : 'Blog',
      name: titulo, description: descricao, url, inLanguage: 'pt-BR', publisher: ORG,
      [naCategoria ? 'hasPart' : 'blogPost']: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}/blog/${p.slug}/`, datePublished: iso(p.date), dateModified: iso(p.updated) })),
    },
    migalhas(naCategoria
      ? [['Início', `${SITE}/`], ['Blog', `${SITE}/blog/`], [categoria, url]]
      : [['Início', `${SITE}/`], ['Blog', `${SITE}/blog/`]]),
  ];
  const imagem = `${SITE}${capaOg((destaque || posts[0]).slug)}`;

  return `${head({ titulo, descricao, url, imagem, imagemAlt: capaAlt(destaque || posts[0]), jsonld })}
${topo()}
<main>
<header class="blog-topo">
  <div class="wrap">
    ${naCategoria
      ? `<nav class="trilha" aria-label="Você está em"><a href="/">Início</a><span>›</span><a href="/blog/">Blog</a><span>›</span>${esc(categoria)}</nav>
    <span class="rotulo"><b>[blog]</b> categoria</span>
    <h1>${esc(categoria)}</h1>
    <p>${esc(CATEGORIAS[categoria].desc)}</p>`
      : `<span class="rotulo"><b>[blog]</b> theatrum</span>
    <h1>Como transformar visita em <span class="lm">cliente</span></h1>
    <p>Textos diretos para quem tem negócio e quer que o site, o Google e o anúncio virem conversa no WhatsApp.</p>`}
    ${chips}
  </div>
</header>
<div class="wrap">
${destaque ? `  <span class="rotulo"><b>[01]</b> em destaque</span>
  <a class="destaque" href="/blog/${destaque.slug}/">
    ${imgCapa(destaque, { sizes: '(max-width: 860px) 100vw, 640px', prioridade: true })}
    <div class="txt">${metaPost(destaque)}<h2>${esc(destaque.title)}</h2><p>${esc(destaque.description)}</p>
      <div class="meta" style="margin-top:16px"><span>Atualizado em ${dataCurta(destaque.updated)}</span></div></div>
  </a>` : ''}
${resto.length ? `  <div class="sec-titulo"><span class="rotulo"><b>[${naCategoria ? '01' : '02'}]</b> ${naCategoria ? 'artigos' : 'todos os artigos'}</span></div>
  <div class="grade">
${resto.map(cartao).join('\n')}
  </div>` : ''}
</div>
<section class="bloco-fim" aria-labelledby="fim-t">
  <div class="wrap">
    <div>
      <h2 id="fim-t">Quer saber o que falta no seu site? Faça o <span class="lm">diagnóstico gratuito</span></h2>
      <p>A gente olha o seu site, o seu Google e o caminho até o seu WhatsApp, e mostra onde você perde cliente.</p>
    </div>
    <div class="acoes">
      <a class="btn btn-escuro" href="/#diagnostico" data-blog-cta="lista" data-cta-tipo="diagnostico">Fazer diagnóstico gratuito ${SETA}</a>
      <span class="sec">Prefere ver o seu número antes? <a href="/#calculadora" data-blog-cta="lista" data-cta-tipo="calculadora">Use a calculadora</a>, sem cadastro.</span>
    </div>
  </div>
</section>
</main>
${rodape()}
${JS_COMUM}
${SCRIPTS_SITE}`;
}

/* ---------------------------------------------------------------- RSS */

const rfc822 = (d) => new Date(iso(d)).toUTCString();
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export function feed(posts, tamanhoCapa) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog Theatrum</title>
  <link>${SITE}/blog/</link>
  <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Como transformar visita em cliente: site, Google e anúncio para pequenos negócios.</description>
  <language>pt-BR</language>
  <lastBuildDate>${rfc822(posts.map((p) => p.updated).sort().pop())}</lastBuildDate>
${posts.map((p) => `  <item>
    <title>${cdata(p.title)}</title>
    <link>${SITE}/blog/${p.slug}/</link>
    <guid isPermaLink="true">${SITE}/blog/${p.slug}/</guid>
    <pubDate>${rfc822(p.date)}</pubDate>
    <category>${cdata(p.category)}</category>
    <description>${cdata(p.description)}</description>
    <enclosure url="${SITE}${capaOg(p.slug)}" length="${tamanhoCapa(p)}" type="image/jpeg"/>
  </item>`).join('\n')}
</channel>
</rss>
`;
}
