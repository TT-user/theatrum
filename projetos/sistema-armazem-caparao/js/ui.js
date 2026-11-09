// Utilitários de interface: formatação, permissões por perfil, modal, aviso e impressão.

import * as C from './calculo.js';
import { db } from './dados.js';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const R = (c) => C.formatarReais(c || 0);
export const SC = (dec) => C.formatarSacas(dec || 0, db.config.kgPorSaca);
export const KG = (dec) => C.formatarKg(dec || 0);

export function data(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}
export function dataHora(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ---------- perfis ----------
export const PERFIS = {
  admin: 'Administrador',
  balanca: 'Balança / Recebimento',
  financeiro: 'Financeiro',
  consulta: 'Consulta',
};

const PERMISSOES = {
  admin: ['romaneio', 'estoque', 'rv', 'financeiro', 'sensivel', 'cadastro', 'config', 'auditoria', 'escrita'],
  balanca: ['romaneio', 'estoque', 'cadastro', 'escrita'],
  financeiro: ['rv', 'financeiro', 'sensivel', 'cadastro', 'estoque', 'escrita'],
  consulta: ['romaneio', 'estoque', 'rv', 'financeiro'],
};
export const pode = (o) => PERMISSOES[db.usuario.perfil]?.includes(o);

/** CPF/CNPJ só aparece para Administrador e Financeiro. */
export function doc(v) {
  if (!v) return '';
  if (pode('sensivel')) return esc(v);
  return esc(v.replace(/\d(?=.*\d{2})/g, '•'));
}

// ---------- aviso ----------
let tAviso;
export function aviso(msg) {
  const el = document.getElementById('aviso');
  el.textContent = msg;
  el.classList.add('ver');
  clearTimeout(tAviso);
  tAviso = setTimeout(() => el.classList.remove('ver'), 3200);
}

// ---------- modal ----------
let aoFecharModal = null;
export function abrirModal(html, { largo = false, aoAbrir, aoFechar } = {}) {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="modal-caixa ${largo ? 'largo' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false;
  aoFecharModal = aoFechar || null;
  const foco = m.querySelector('input:not([type=hidden]), select, textarea, button');
  foco?.focus();
  aoAbrir?.(m.firstElementChild);
  return m.firstElementChild;
}
export function fecharModal() {
  const m = document.getElementById('modal');
  m.hidden = true;
  m.innerHTML = '';
  aoFecharModal?.();
  aoFecharModal = null;
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.getElementById('modal').hidden) fecharModal(); });
document.addEventListener('click', (e) => {
  if (e.target.id === 'modal') fecharModal();
  if (e.target.closest('[data-fechar]')) fecharModal();
});

/** Pede um motivo (cancelamento/estorno). Resolve com o texto ou null. */
export function pedirMotivo(titulo, texto) {
  return new Promise((res) => {
    let ok = false;
    abrirModal(`
      <h2>${esc(titulo)}</h2>
      <p class="muted">${esc(texto)} Nada é apagado: o registro fica riscado, com o motivo e quem fez.</p>
      <label class="campo largo"><span>Motivo</span><textarea id="motivo" required></textarea></label>
      <div class="modal-rodape"><button class="btn" data-fechar>Voltar</button><button class="btn perigo" id="confirmar">Confirmar</button></div>`,
    {
      aoAbrir: (cx) => cx.querySelector('#confirmar').onclick = () => {
        const v = cx.querySelector('#motivo').value.trim();
        if (!v) { cx.querySelector('#motivo').focus(); return; }
        ok = true; fecharModal(); res(v);
      },
      aoFechar: () => { if (!ok) res(null); },
    });
  });
}

// ---------- impressão ----------
/** Põe o documento na área de impressão e abre o diálogo (Salvar como PDF). */
export function imprimir(html, tamanho = 'A4') {
  const area = document.getElementById('impressao');
  area.innerHTML = html;
  let st = document.getElementById('pagina-impressao');
  if (!st) { st = document.createElement('style'); st.id = 'pagina-impressao'; document.head.appendChild(st); }
  st.textContent = `@page { size: ${tamanho === 'A5' ? '148mm 210mm' : 'A4'}; margin: ${tamanho === 'A5' ? '8mm' : '12mm'}; }`;
  document.body.classList.add('imprimindo');
  const fim = () => { document.body.classList.remove('imprimindo'); window.removeEventListener('afterprint', fim); };
  window.addEventListener('afterprint', fim);
  // espera o logo carregar antes de abrir o diálogo
  const imgs = [...area.querySelectorAll('img')].filter((i) => !i.complete);
  Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))).then(() => setTimeout(() => window.print(), 50));
}
