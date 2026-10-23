// Comportamento comum a todas as páginas: painéis acessíveis, barra de aviso rotativa, busca,
// sacola e seletor rápido, WhatsApp de apoio e o formulário da newsletter.
import { config, linkWhatsApp, reais } from '/cxf/js/config.js';
import { catalogo } from '/cxf/js/catalogo.js';
import { pacote } from '/cxf/js/pacote.js';
import { foto } from '/cxf/js/foto.js';
import * as sacola from '/cxf/js/sacola.js';
import { montar as montarSeletor } from '/cxf/js/seletor.js';

document.documentElement.classList.add('js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- Painéis (seção 6): dialog, inert, foco preso, Esc e fundo escuro ---------- */
const veu = $('[data-veu]');
const fundo = () => $$('body > :not(.painel):not([data-veu]):not(script):not(.sprite)');
let aberto = null;
let voltaFoco = null;

export function abrir(id) {
  const p = document.getElementById(id);
  if (!p) return;
  if (aberto && aberto !== p) fechar(false);
  voltaFoco = voltaFoco || document.activeElement;
  p.hidden = false; p.inert = false;
  veu.hidden = false;
  for (const el of fundo()) el.inert = true;
  document.body.style.overflow = 'hidden';
  $$(`[aria-controls="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
  aberto = p;
  ($('[data-fecha]', p) || p).focus({ preventScroll: true });
}

export function fechar(devolverFoco = true) {
  if (!aberto) return;
  $$(`[aria-controls="${aberto.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
  aberto.hidden = true; aberto.inert = true;
  veu.hidden = true;
  for (const el of fundo()) el.inert = false;
  document.body.style.overflow = '';
  aberto = null;
  if (devolverFoco && voltaFoco?.focus) voltaFoco.focus({ preventScroll: true });
  voltaFoco = null;
}

veu.addEventListener('click', () => fechar());
addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (aberto) fechar(); else fechaBusca(); } });
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-abre]');
  if (a) { e.preventDefault(); abreSacolaOu(a.dataset.abre); return; }
  if (aberto && e.target.closest('[data-fecha]')) fechar(!e.target.closest('a'));
});

/* ---------- Sacola ---------- */
const alvoSacola = $('[data-sacola]');
sacola.ligar(alvoSacola);
async function abreSacolaOu(id) {
  if (id === 'painel-sacola') await sacola.desenhar(alvoSacola);
  abrir(id);
}
sacola.aoMudar(() => {
  const n = sacola.quantidadeTotal();
  for (const b of $$('[data-sacola-n]')) {
    b.textContent = n;
    b.classList.toggle('zero', !n);
    b.classList.remove('pulo'); void b.offsetWidth; b.classList.add('pulo');
  }
  for (const b of $$('.topo__sacola')) b.setAttribute('aria-label', `Abrir a sacola, ${n} ${n === 1 ? 'item' : 'itens'}`);
});

/* ---------- Seletor rápido e "adicionar" direto (itens sem moagem) ---------- */
const alvoSeletor = $('[data-seletor]');
document.addEventListener('click', async (e) => {
  const escolher = e.target.closest('[data-escolher]');
  if (escolher) {
    if (await montarSeletor(alvoSeletor, escolher.dataset.escolher)) abrir('painel-seletor');
    return;
  }
  const add = e.target.closest('[data-adicionar]');
  if (add) {
    sacola.adicionar(add.dataset.adicionar, null, 1);
    abreSacolaOu('painel-sacola');
  }
});
alvoSeletor.addEventListener('adicionado', () => abreSacolaOu('painel-sacola'));

/* ---------- Barra de aviso rotativa (~8 s), parada com movimento reduzido ---------- */
const avisos = $$('[data-aviso-item]');
if (avisos.length > 1 && !calmo) {
  let i = 0, pausa = false;
  const barra = $('[data-aviso]');
  barra.addEventListener('mouseenter', () => { pausa = true; });
  barra.addEventListener('mouseleave', () => { pausa = false; });
  barra.addEventListener('focusin', () => { pausa = true; });
  barra.addEventListener('focusout', () => { pausa = false; });
  setInterval(() => {
    if (pausa || document.hidden) return;
    avisos[i].hidden = true;
    i = (i + 1) % avisos.length;
    avisos[i].hidden = false;
  }, 8000);
}
// O pop-up de primeira compra é a etapa 12; até lá, o botão leva ao formulário da newsletter
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-abre-cupom]')) return;
  const f = $('#newsletter');
  if (f) { f.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth' }); $('input', f)?.focus({ preventScroll: true }); }
  else location.href = '/cxf/#newsletter';
});

/* ---------- Busca com resultado ao digitar (nome, notas, torra) ---------- */
const busca = $('#busca');
const botaoBusca = $('[data-busca]');
const campo = $('[data-busca-campo]');
const res = $('[data-busca-res]');
const sem = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function fechaBusca() { if (busca.hidden) return; busca.hidden = true; botaoBusca.setAttribute('aria-expanded', 'false'); }
botaoBusca.addEventListener('click', async () => {
  if (!busca.hidden) return fechaBusca();
  busca.hidden = false; botaoBusca.setAttribute('aria-expanded', 'true'); campo.focus();
  await catalogo();
});
campo.addEventListener('input', async () => {
  const c = await catalogo();
  const q = sem(campo.value.trim());
  if (q.length < 2) { res.innerHTML = ''; return; }
  const achados = [...c.produtos, ...c.kits].filter((x) => sem(`${x.nome} ${x.notas} ${x.torra || ''} ${x.linha || ''} ${(x.etiquetas || []).join(' ')}`).includes(q)).slice(0, 6);
  res.innerHTML = achados.length
    ? achados.map((x) => {
      const p = x.variantes.map((v) => v.precoCentavos).filter((v) => v != null);
      return `<li><a href="/cxf/${x.categoria}/${x.slug}">${foto(x, { sizes: '54px', alt: '' }) || pacote(x)}<span><b>${esc(x.nome)}</b><small>${esc(x.notas)}${p.length ? ` · a partir de ${reais(Math.min(...p))}` : ''}</small></span></a></li>`;
    }).join('')
    : '<li class="busca__vazio">Nada com esse nome. Tente "média", "intensa", "kit" ou faça o <a href="/cxf/quiz">quiz</a>.</li>';
});

/* ---------- WhatsApp só como apoio (seção 0): dúvida, dica e Lista VIP ---------- */
for (const a of $$('[data-zap]')) {
  a.href = linkWhatsApp(a.dataset.zap || config.waText);
  a.target = '_blank';
  a.rel = 'noopener';
}
const flut = $('.zap-flutua');
const veFlut = () => flut?.classList.toggle('ve', scrollY > innerHeight * 0.8);
addEventListener('scroll', veFlut, { passive: true });
veFlut();

/* ---------- Avisos curtos ---------- */
let tt;
export function avisar(txt) {
  const t = $('[data-toast]');
  t.textContent = txt; t.classList.add('ve');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('ve'), 2800);
}

/* ---------- Newsletter: o envio (Function registrarLead + Brevo) é a etapa 12 ---------- */
const news = $('[data-newsletter]');
if (news) {
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('[data-newsletter-msg]', news);
    const email = news.email;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    email.setAttribute('aria-invalid', String(!ok));
    if (!ok) { msg.textContent = 'Confira o e-mail.'; email.focus(); return; }
    if (!news.consentimento.checked) { msg.textContent = 'Marque o aceite para receber o cupom.'; return; }
    if (news.site.value) return; // honeypot
    msg.innerHTML = '<span class="ph">[envio do cadastro e do cupom: etapa 12]</span>';
  });
}

/* ---------- Preferências de cookies: banner LGPD na etapa 16 ---------- */
document.addEventListener('click', (e) => { if (e.target.closest('[data-cookies]')) avisar('As preferências de cookies chegam junto com o banner LGPD.'); });

/* ---------- Seções que aparecem ao rolar (história e aromas) ---------- */
const revelar = $$('[data-revela]');
if (revelar.length) {
  if (calmo || !('IntersectionObserver' in window)) revelar.forEach((el) => el.classList.add('visto'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    revelar.forEach((el) => io.observe(el));
  }
}
