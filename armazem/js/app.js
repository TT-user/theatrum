// Sistema do Armazém Gerais Caparaó (demonstração). Rotas por hash, sem build.

import * as C from './calculo.js';
import * as D from './dados.js';
import { esc, R, SC, KG, data, dataHora, PERFIS, pode, doc, aviso, abrirModal, fecharModal, pedirMotivo, imprimir } from './ui.js';
import * as DOC from './docs.js';

D.carregar();
const app = document.getElementById('app');
const hoje = () => D.hojeISO();

// ---------- auxiliares ----------
const CATEGORIAS = {
  acerto: 'Acerto de café', adiantamento: 'Adiantamento', frete: 'Frete', honorarios: 'Honorários', boleto: 'Boleto',
  insumo: 'Nota de produtor / insumo', sacaria: 'Sacaria', taxas: 'Taxas / serviços', outros: 'Outros',
};
const FORMAS = ['PIX', 'TED', 'Boleto', 'Dinheiro', 'Cheque'];
const STATUS_ROM = { aberto: 'Aberto', classificado: 'Classificado', comprado: 'Comprado', cancelado: 'Cancelado' };
const STATUS_RV = { comprado: 'Comprado, a buscar', buscado: 'No armazém', pago: 'Pago', cancelado: 'Cancelado' };
const STATUS_LANC = { pendente: 'Pendente', parcial: 'Parcial', pago: 'Pago', cancelado: 'Cancelado' };

const selo = (st, txt) => `<span class="selo ${esc(st)}">${esc(txt || st)}</span>`;
const opts = (lista, sel, rot, val = (x) => x.id, vazio) =>
  (vazio !== undefined ? `<option value="">${esc(vazio)}</option>` : '') +
  lista.map((x) => `<option value="${esc(val(x))}" ${String(val(x)) === String(sel ?? '') ? 'selected' : ''}>${esc(rot(x))}</option>`).join('');
const pessoasOrdenadas = () => D.db.pessoas.filter((p) => p.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome));
const tiposAtivos = (incluir) => D.db.tipos.filter((t) => t.ativo || t.id === incluir);
const dlPessoas = () => `<datalist id="dl-pessoas">${pessoasOrdenadas().map((p) => `<option value="${esc(D.nomePessoa(p))}">`).join('')}</datalist>`;
const campoPessoa = (id, selId, rotulo, extra = '') =>
  `<label class="campo ${extra}"><span>${esc(rotulo)}</span><input id="${id}" list="dl-pessoas" value="${selId ? esc(D.nomePessoa(D.pessoa(selId))) : ''}" placeholder="Digite o nome ou o apelido" autocomplete="off"></label>`;
function lerPessoa(valor) {
  const v = String(valor || '').trim().toLowerCase();
  if (!v) return null;
  return D.db.pessoas.find((p) => D.nomePessoa(p).toLowerCase() === v)
    || D.db.pessoas.find((p) => p.nome.toLowerCase() === v || (p.apelido || '').toLowerCase() === v) || null;
}
const vencido = (l) => ['pendente', 'parcial'].includes(l.status) && l.vencimento && l.vencimento < hoje();
const aberto = (l) => C.emAberto(l, D.db.baixas);
function sacasKgCampos(prefixo, pesoDec = 0) {
  const { sacas, restoDec } = C.kgEmSacas(pesoDec, D.db.config.kgPorSaca);
  return `<div class="campo"><span>Sacas</span><input id="${prefixo}-sc" inputmode="numeric" value="${pesoDec ? sacas : ''}"></div>
    <div class="campo"><span>e quilos</span><input id="${prefixo}-kg" inputmode="decimal" value="${restoDec ? String(restoDec / 10).replace('.', ',') : ''}"></div>`;
}
const lerSacasKg = (cx, prefixo) => C.sacasEKgParaDec(cx.querySelector(`#${prefixo}-sc`).value || 0, cx.querySelector(`#${prefixo}-kg`).value, D.db.config.kgPorSaca);

function gravar(msg) { if (!D.salvar()) aviso('Não deu para guardar neste navegador (armazenamento cheio ou bloqueado).'); else if (msg) aviso(msg); }
function ir(rota) { if (location.hash === '#/' + rota) render(); else location.hash = '#/' + rota; }
function notaVista() { try { return !!localStorage.getItem('armazem-nota-demo'); } catch (e) { return false; } }
function bloqueado() { app.innerHTML = `<div class="cartao vazio"><h2>Sem acesso</h2><p>O perfil <b>${esc(PERFIS[D.db.usuario.perfil])}</b> não abre esta tela. Troque o perfil no topo para ver.</p></div>`; }

// ---------- anexos ----------
function anexosHtml(entidade, id) {
  const lista = D.db.anexos.filter((a) => a.entidade === entidade && a.entidadeId === id);
  return `<div class="cartao"><div class="cab" style="margin-bottom:8px"><h3>Anexos</h3><button class="btn peq" data-escrita data-anexar="${entidade}:${id}">Anexar arquivo</button></div>
    ${lista.length ? `<table><tbody>${lista.map((a) => `<tr><td>${esc(a.nome)}</td><td>${esc(a.tipo)}</td><td class="muted peq">${esc(a.descricao)}</td><td class="peq muted">${dataHora(a.em)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted peq" style="margin:0">Foto do romaneio em papel, nota de produtor, NF-e, boleto, comprovante.</p>'}
  </div>`;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-anexar]');
  if (!b) return;
  const [entidade, id] = b.dataset.anexar.split(':');
  abrirModal(`<h2>Anexar arquivo</h2>
    <div class="campos">
      <label class="campo largo"><span>Arquivo</span><input type="file" id="ax-arq" accept="image/*,application/pdf"></label>
      <label class="campo"><span>Tipo</span><select id="ax-tipo">${opts(['Foto do romaneio em papel', 'Nota fiscal de produtor', 'NF-e', 'Boleto', 'Comprovante de pagamento', 'Outro'], '', (x) => x, (x) => x)}</select></label>
      <label class="campo"><span>Descrição</span><input id="ax-desc"></label>
    </div>
    <p class="nota peq">Na demonstração só o nome do arquivo é registrado. No sistema final o arquivo vai para o armazenamento seguro, ligado a este registro.</p>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="ax-ok">Anexar</button></div>`,
  { aoAbrir: (cx) => cx.querySelector('#ax-ok').onclick = () => {
    const f = cx.querySelector('#ax-arq').files[0];
    if (!f) return aviso('Escolha um arquivo.');
    const a = { id: D.uid(), entidade, entidadeId: id, nome: f.name, tipo: cx.querySelector('#ax-tipo').value, descricao: cx.querySelector('#ax-desc').value, em: new Date().toISOString() };
    D.db.anexos.push(a); D.auditar('anexou', entidade, id, null, a.nome); gravar('Anexo registrado.'); fecharModal(); render();
  } });
});

// ---------- menu e roteador ----------
const MENU = [
  ['', 'Início', null], ['romaneios', 'Romaneios', 'romaneio'], ['estoque', 'Estoque', 'estoque'], ['rv', 'Caderno de RV', 'rv'],
  ['pendencias', 'Pendências', 'financeiro'], ['relacoes', 'Relação de pagamentos', 'financeiro'], ['pessoas', 'Pessoas', null],
  ['relatorios', 'Relatórios', null], ['config', 'Configurações', 'config'], ['auditoria', 'Auditoria', 'auditoria'],
];

const ROTAS = [
  [/^$/, inicio, null],
  [/^romaneios$/, romaneios, 'romaneio'],
  [/^romaneio\/novo$/, () => romaneioForm(null), 'romaneio'],
  [/^romaneio\/(\w+)$/, romaneioForm, 'romaneio'],
  [/^estoque$/, estoque, 'estoque'],
  [/^rv$/, rvLista, 'rv'],
  [/^rv\/novo$/, rvNovo, 'rv'],
  [/^rv\/(\w+)$/, rvVer, 'rv'],
  [/^pendencias$/, pendencias, 'financeiro'],
  [/^relacoes$/, relacoes, 'financeiro'],
  [/^relacao\/(\w+)$/, relacaoVer, 'financeiro'],
  [/^pessoas$/, pessoas, null],
  [/^pessoa\/(\w+)$/, pessoaVer, null],
  [/^relatorios$/, relatorios, null],
  [/^config$/, config, 'config'],
  [/^auditoria$/, auditoria, 'auditoria'],
];

let params = new URLSearchParams();
function render() {
  const bruto = location.hash.replace(/^#\/?/, '');
  const [rota, q] = bruto.split('?');
  params = new URLSearchParams(q || '');
  const base = rota.split('/')[0];
  document.getElementById('menu').innerHTML = MENU.filter(([, , perm]) => !perm || pode(perm))
    .map(([r, t]) => `<a href="#/${r}" class="${(base === r || (r === 'rv' && base === 'rv') || (r === 'romaneios' && base === 'romaneio') || (r === 'relacoes' && base === 'relacao') || (r === 'pessoas' && base === 'pessoa')) ? 'ativo' : ''}">${t}</a>`).join('');
  document.body.classList.toggle('so-escrita-oculto', !pode('escrita'));
  document.getElementById('perfil').value = D.db.usuario.perfil;
  for (const [re, fn, perm] of ROTAS) {
    const m = rota.match(re);
    if (m) { if (perm && !pode(perm)) return bloqueado(); fn(...m.slice(1)); return; }
  }
  app.innerHTML = '<div class="cartao vazio">Página não encontrada. <a href="#/">Voltar ao início</a></div>';
}
window.addEventListener('hashchange', () => { fecharModal(); render(); window.scrollTo(0, 0); });
document.getElementById('perfil').addEventListener('change', (e) => {
  D.db.usuario.perfil = e.target.value; D.auditar('trocou de perfil', 'usuário', '', null, PERFIS[e.target.value]); gravar(`Agora como ${PERFIS[e.target.value]}.`); render();
});

// =====================================================================
// INÍCIO
// =====================================================================
function inicio() {
  const db = D.db, h = hoje();
  const romHoje = db.romaneios.filter((r) => r.data === h && r.status !== 'cancelado');
  const kgHoje = romHoje.reduce((s, r) => s + r.totais.liquidoDec, 0);
  const guardado = db.pessoas.reduce((s, p) => s + Math.max(0, D.saldoPessoa(p.id)), 0);
  const aPagar = db.lancamentos.filter((l) => l.sinal === 'credito' && ['pendente', 'parcial'].includes(l.status) && l.vencimento <= h);
  const aBuscar = db.rvs.filter((r) => D.statusRV(r) === 'comprado');
  const semana = D.hojeISO(7);
  const proximos = db.lancamentos.filter((l) => ['pendente', 'parcial'].includes(l.status) && l.vencimento <= semana)
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  const atalhos = [
    ['romaneio/novo', 'Novo romaneio', 'Pesagem de entrada, no lugar do talão', 'romaneio', true],
    ['rv/novo', 'Nova compra (RV)', `Próximo RV: ${db.config.proxRV}`, 'rv'],
    ['estoque', 'Estoque', 'Café guardado por produtor', 'estoque'],
    ['pendencias', 'Pendências', 'Acertos, descontos e contas', 'financeiro'],
    ['relacoes', 'Relação de pagamentos', 'A lista do dia para o banco', 'financeiro'],
    ['pessoas', 'Buscar pessoa', 'Ficha, saldo e extrato', null],
  ].filter((a) => !a[3] || pode(a[3]));

  app.innerHTML = `
    <div class="cab"><div><h1>Bom dia</h1><p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${esc(PERFIS[db.usuario.perfil])}</p></div>
      <button class="btn" id="imp-resumo">Imprimir resumo do dia</button></div>
    ${notaVista() ? '' : `<div class="nota" style="margin-bottom:16px" id="nota-demo">
      <b>Isto é uma demonstração.</b> Pode lançar, dar baixa e imprimir à vontade: tudo fica só neste navegador, e os nomes são inventados.
      Troque o perfil no topo para ver o que cada pessoa da equipe enxerga. Para voltar ao começo: Configurações › Restaurar dados de exemplo.
      <button class="link" id="fechar-nota">Entendi</button></div>`}
    <div class="atalhos">${atalhos.map(([r, t, s, , p]) => `<a class="atalho ${p ? 'principal' : ''}" href="#/${r}"><strong>${t}</strong><span>${esc(s)}</span></a>`).join('')}</div>
    <div class="grade g4" style="margin-bottom:16px">
      <div class="kpi"><b>${romHoje.length}</b><span>romaneios hoje · ${SC(kgHoje)}</span></div>
      <div class="kpi"><b>${SC(guardado)}</b><span>café guardado de produtores</span></div>
      ${pode('financeiro') ? `<div class="kpi"><b>${R(aPagar.reduce((s, l) => s + aberto(l), 0))}</b><span>a pagar hoje e vencidos (${aPagar.length})</span></div>` : '<div class="kpi"><b>-</b><span>financeiro: só Financeiro e Administrador</span></div>'}
      <div class="kpi"><b>${aBuscar.length}</b><span>cafés comprados a buscar · ${SC(aBuscar.reduce((s, r) => s + r.pesoDec, 0))}</span></div>
    </div>
    <div class="grade g2">
      ${pode('financeiro') ? `<div class="cartao"><h2>Pagamentos até ${data(semana)}</h2>
        ${proximos.length ? `<div class="rolar"><table><thead><tr><th>Venc.</th><th>Favorecido</th><th>Ref.</th><th class="num">Em aberto</th></tr></thead><tbody>
        ${proximos.slice(0, 10).map((l) => `<tr><td class="${vencido(l) ? 'neg' : ''}">${data(l.vencimento)}</td><td>${esc(D.nomePessoa(D.pessoa(l.pessoaId), true))}</td><td>${esc(l.referencia)}</td><td class="num ${l.sinal === 'desconto' ? 'neg' : ''}">${l.sinal === 'desconto' ? '-' : ''}${R(aberto(l))}</td></tr>`).join('')}
        </tbody></table></div><p class="peq" style="margin:8px 0 0"><a href="#/pendencias">Ver todas as pendências</a></p>` : '<p class="muted">Nada vencendo nos próximos 7 dias.</p>'}</div>` : ''}
      <div class="cartao"><h2>Cafés comprados a buscar</h2>${tabelaABuscar(aBuscar)}</div>
      <div class="cartao"><h2>Últimos romaneios</h2>${tabelaRomaneios(db.romaneios.slice().sort((a, b) => b.numero - a.numero).slice(0, 6), true)}</div>
    </div>`;
  app.querySelector('#fechar-nota')?.addEventListener('click', () => { try { localStorage.setItem('armazem-nota-demo', '1'); } catch (e) { /* ok */ } app.querySelector('#nota-demo').remove(); });
  app.querySelector('#imp-resumo').onclick = () => imprimirResumoDia();
  ligarLinhas();
}

function tabelaABuscar(lista) {
  if (!lista.length) return '<p class="muted">Nenhum café comprado esperando busca.</p>';
  const grupos = {};
  lista.forEach((r) => { (grupos[r.localBuscaId || ''] ||= []).push(r); });
  return `<div class="rolar"><table><tbody>${Object.entries(grupos).map(([lid, rs]) => {
    const l = D.localBusca(lid);
    return `<tr class="grupo"><td colspan="3">${esc(l ? `${l.nome} · ${l.comunidade}, ${l.municipio}` : 'Sem local')}${l?.referencia ? `<div class="peq muted" style="font-weight:400">${esc(l.referencia)}</div>` : ''}</td></tr>` +
      rs.map((r) => `<tr class="clicavel" data-href="rv/${r.id}"><td>RV ${r.numero}</td><td>${esc(D.nomePessoa(D.pessoa(r.vendedorId), true))}</td><td class="num">${SC(r.pesoDec)}</td></tr>`).join('');
  }).join('')}</tbody></table></div>`;
}

function ligarLinhas(raiz = app) {
  raiz.querySelectorAll('tr[data-href]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('input,button,a,select')) ir(tr.dataset.href); }));
}

function imprimirResumoDia() {
  const db = D.db, h = hoje();
  const roms = db.romaneios.filter((r) => r.data === h);
  const rvs = db.rvs.filter((r) => r.dataCompra === h);
  const baixas = db.baixas.filter((b) => b.data === h && !b.estornada);
  const t = `<h3>Romaneios do dia</h3>${tabelaRomaneiosDoc(roms)}
    <h3 style="margin-top:12px">Compras (RV) do dia</h3>
    <table><thead><tr><th>RV</th><th>Vendedor</th><th>Café</th><th class="num">Quantidade</th><th class="num">Total</th></tr></thead><tbody>
    ${rvs.map((r) => `<tr><td>${r.numero}</td><td>${esc(D.nomePessoa(D.pessoa(r.vendedorId)))}</td><td>${esc(D.nomeTipo(D.tipo(r.tipoId)))}</td><td class="num">${SC(r.pesoDec)}</td><td class="num">${R(r.totalCentavos)}</td></tr>`).join('') || '<tr><td colspan="5">Nenhuma</td></tr>'}</tbody></table>
    <h3 style="margin-top:12px">Pagamentos feitos hoje</h3>
    <table><thead><tr><th>Favorecido</th><th>Ref.</th><th>Forma</th><th class="num">Valor</th></tr></thead><tbody>
    ${baixas.map((b) => { const l = db.lancamentos.find((x) => x.id === b.lancamentoId); return `<tr><td>${esc(D.nomePessoa(D.pessoa(l?.pessoaId)))}</td><td>${esc(l?.referencia)}</td><td>${esc(b.forma)}</td><td class="num">${l?.sinal === 'desconto' ? '-' : ''}${R(b.valorCentavos)}</td></tr>`; }).join('') || '<tr><td colspan="4">Nenhum</td></tr>'}</tbody></table>`;
  imprimir(DOC.relatorioDoc('RESUMO DO DIA', data(h), t), 'A4');
}

// =====================================================================
// ROMANEIOS
// =====================================================================
function tabelaRomaneios(lista, curta = false) {
  if (!lista.length) return '<div class="vazio">Nenhum romaneio encontrado.</div>';
  return `<div class="rolar"><table><thead><tr><th>Nº</th><th>Data</th><th>Produtor</th>${curta ? '' : '<th>Café</th><th class="num">Vol.</th>'}<th class="num">Peso líquido</th>${curta ? '' : '<th>Destino</th>'}<th>Status</th></tr></thead><tbody>
    ${lista.map((r) => `<tr class="clicavel ${r.status === 'cancelado' ? 'cancelado' : ''}" data-href="romaneio/${r.id}">
      <td class="num">${D.fmtNum(r.numero)}</td><td>${data(r.data)}</td><td>${esc(D.nomePessoa(D.pessoa(r.pessoaId), true))}</td>
      ${curta ? '' : `<td>${esc(D.nomeTipo(D.tipo(r.tipoId)) || '-')}</td><td class="num">${r.totais.volumes}</td>`}
      <td class="num">${SC(r.totais.liquidoDec)}</td>${curta ? '' : `<td>${r.destino === 'compra' ? 'Compra' : 'Guarda'}</td>`}
      <td>${selo(r.status, STATUS_ROM[r.status])}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function tabelaRomaneiosDoc(lista) {
  return `<table><thead><tr><th>Nº</th><th>Data</th><th>Produtor</th><th>Café</th><th class="num">Vol.</th><th class="num">Líquido</th><th class="num">Sacas</th><th>Status</th></tr></thead><tbody>
    ${lista.map((r) => `<tr><td>${D.fmtNum(r.numero)}</td><td>${data(r.data)}</td><td>${esc(D.nomePessoa(D.pessoa(r.pessoaId)))}</td><td>${esc(D.nomeTipo(D.tipo(r.tipoId)))}</td><td class="num">${r.totais.volumes}</td><td class="num">${KG(r.totais.liquidoDec)}</td><td class="num">${SC(r.totais.liquidoDec)}</td><td>${STATUS_ROM[r.status]}</td></tr>`).join('') || '<tr><td colspan="8">Nenhum</td></tr>'}
    </tbody><tfoot><tr><td colspan="5">Total (sem cancelados)</td><td class="num">${KG(lista.filter((r) => r.status !== 'cancelado').reduce((s, r) => s + r.totais.liquidoDec, 0))}</td><td class="num">${SC(lista.filter((r) => r.status !== 'cancelado').reduce((s, r) => s + r.totais.liquidoDec, 0))}</td><td></td></tr></tfoot></table>`;
}

function romaneios() {
  const f = { q: params.get('q') || '', de: params.get('de') || '', ate: params.get('ate') || '', st: params.get('st') || '' };
  let lista = D.db.romaneios.slice().sort((a, b) => b.numero - a.numero);
  if (f.q) { const q = f.q.toLowerCase(); lista = lista.filter((r) => String(r.numero).includes(q) || D.nomePessoa(D.pessoa(r.pessoaId)).toLowerCase().includes(q)); }
  if (f.de) lista = lista.filter((r) => r.data >= f.de);
  if (f.ate) lista = lista.filter((r) => r.data <= f.ate);
  if (f.st) lista = lista.filter((r) => r.status === f.st);
  app.innerHTML = `<div class="cab"><div><h1>Romaneios de entrada</h1><p>O talão, numerado e somado sozinho. Próximo número: <b>${D.fmtNum(D.db.config.proxRomaneio)}</b></p></div>
    <div class="acoes"><button class="btn" id="imp">Imprimir lista</button><a class="btn prim" data-escrita href="#/romaneio/novo">Novo romaneio</a></div></div>
    <div class="cartao"><form class="filtros" id="filtros">
      <label class="campo"><span>Buscar</span><input type="search" name="q" value="${esc(f.q)}" placeholder="número ou produtor"></label>
      <label class="campo"><span>De</span><input type="date" name="de" value="${f.de}"></label>
      <label class="campo"><span>Até</span><input type="date" name="ate" value="${f.ate}"></label>
      <label class="campo"><span>Status</span><select name="st">${opts(Object.entries(STATUS_ROM), f.st, (x) => x[1], (x) => x[0], 'Todos')}</select></label>
      <button class="btn">Filtrar</button></form>
      ${tabelaRomaneios(lista)}</div>`;
  ligarFiltros('romaneios');
  app.querySelector('#imp').onclick = () => imprimir(DOC.relatorioDoc('ROMANEIOS DO PERÍODO', `${f.de ? data(f.de) : 'início'} a ${f.ate ? data(f.ate) : 'hoje'}`, tabelaRomaneiosDoc(lista.slice().reverse())));
  ligarLinhas();
}
function ligarFiltros(rota) {
  const fm = app.querySelector('#filtros');
  fm.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    new FormData(fm).forEach((v, k) => { if (v) p.set(k, v); });
    location.hash = '#/' + rota + (p.toString() ? '?' + p : '');
  });
  fm.querySelectorAll('select, input[type=date]').forEach((el) => el.addEventListener('change', () => fm.requestSubmit()));
}

function romaneioForm(id) {
  const db = D.db, cfg = db.config;
  const existente = id ? db.romaneios.find((r) => r.id === id) : null;
  if (id && !existente) { app.innerHTML = '<div class="cartao vazio">Romaneio não encontrado.</div>'; return; }
  if (!id && !pode('escrita')) return bloqueado();
  const rvVinc = existente && db.rvs.find((v) => !v.cancelado && v.romaneioIds.includes(existente.id));
  const soLeitura = !pode('escrita') || (existente && (existente.status === 'cancelado' || rvVinc));
  const r = existente ? structuredClone(existente) : {
    numero: cfg.proxRomaneio, data: hoje(), pessoaId: params.get('pessoa') || '', motoristaId: '', pasta: '',
    itens: Array.from({ length: 20 }, () => ({ volumes: '', quilos: '' })), tipoId: '', umidade: '', aplicarUmidade: false,
    destino: 'guarda', localId: db.locais[0]?.id || '', obs: '', nfNumero: '', nfSerie: '', nfChave: '', nfEmissao: '', status: 'aberto',
  };
  while (r.itens.length < 20) r.itens.push({ volumes: '', quilos: '' });
  const dis = soLeitura ? 'disabled' : '';

  app.innerHTML = `${dlPessoas()}
    <div class="cab"><div><h1>${existente ? 'Romaneio' : 'Novo romaneio'} <span class="talao-num">Nº ${D.fmtNum(r.numero)}</span></h1>
      <p>${existente ? `${selo(r.status, STATUS_ROM[r.status])} ${rvVinc ? `· vinculado ao <a href="#/rv/${rvVinc.id}">RV ${rvVinc.numero}</a>` : ''} ${r.status === 'cancelado' ? '· ' + esc(r.cancelMotivo) : ''}` : 'Preencha como no talão. Os totais saem sozinhos.'}</p></div>
      <div class="acoes">
        ${existente ? `<button class="btn" id="imp">Imprimir 2 vias (A5)</button>` : ''}
        ${existente && existente.destino === 'compra' && !rvVinc && existente.status !== 'cancelado' && pode('rv') ? `<a class="btn ouro" data-escrita href="#/rv/novo?romaneio=${existente.id}">Registrar compra (RV)</a>` : ''}
        ${existente && !rvVinc && existente.status !== 'cancelado' ? '<button class="btn perigo" data-escrita id="cancelar">Cancelar romaneio</button>' : ''}
      </div></div>
    ${rvVinc && pode('escrita') ? '<p class="nota peq">Este romaneio já entrou numa compra (RV) e não pode mais ser alterado. Para corrigir, cancele o RV primeiro.</p>' : ''}
    <div class="talao">
      <form id="fr" autocomplete="off">
        <div class="cartao">
          <div class="campos">
            <label class="campo"><span>Data</span><input type="date" name="data" value="${r.data}" ${dis} required></label>
            ${campoPessoa('f-pessoa', r.pessoaId, 'Produtor', 'largo').replace('<input', `<input ${dis} required`)}
            <label class="campo"><span>Motorista</span><select name="motoristaId" ${dis}>${opts(db.motoristas, r.motoristaId, (m) => `${m.nome} ${m.placa ? '· ' + m.placa : ''}`, (m) => m.id, '-')}</select></label>
            <label class="campo"><span>Pasta</span><input name="pasta" value="${esc(r.pasta)}" ${dis}></label>
          </div>
        </div>
        <div class="cartao">
          <div class="cab" style="margin-bottom:8px"><h3>Volumes e quilos</h3><span class="peq muted">"3+F" = 3 sacas + fração</span></div>
          <div class="linhas-talao" id="linhas">
            <span></span><span class="lh">Volumes</span><span class="lh">Quilos</span>
            ${r.itens.map((it, i) => `<span class="ln">${i + 1}</span><input data-l="${i}" data-c="volumes" value="${esc(it.volumes)}" ${dis} inputmode="text" aria-label="Volumes linha ${i + 1}"><input data-l="${i}" data-c="quilos" value="${esc(it.quilos)}" ${dis} inputmode="decimal" aria-label="Quilos linha ${i + 1}">`).join('')}
          </div>
          ${soLeitura ? '' : '<button type="button" class="btn peq" id="mais-linha" style="margin-top:8px">+ linha</button>'}
          <div id="erros" style="margin-top:8px"></div>
          <div class="totais" id="totais" style="margin-top:12px"></div>
        </div>
        <div class="cartao"><h3>Classificação</h3>
          <div class="campos">
            <label class="campo largo"><span>Café</span><select name="tipoId" ${dis}>${opts(tiposAtivos(r.tipoId), r.tipoId, D.nomeTipo, (t) => t.id, 'Ainda não classificado')}</select></label>
            <label class="campo"><span>Umidade (%)</span><input name="umidade" inputmode="decimal" value="${esc(String(r.umidade ?? '').replace('.', ','))}" ${dis}></label>
            <label class="campo check" style="align-self:end"><input type="checkbox" name="aplicarUmidade" ${r.aplicarUmidade ? 'checked' : ''} ${dis}> <span style="font-weight:400">Descontar umidade do peso</span></label>
            <label class="campo largo"><span>Observações sobre o café</span><input name="obs" value="${esc(r.obs)}" placeholder="ex.: riozona muito úmido, café de rapa" ${dis}></label>
          </div>
          <div class="campo largo" style="margin-top:12px"><span>Destino</span>
            <div class="radio-linha">
              <label><input type="radio" name="destino" value="guarda" ${r.destino !== 'compra' ? 'checked' : ''} ${dis}> Guarda (depósito do produtor)</label>
              <label><input type="radio" name="destino" value="compra" ${r.destino === 'compra' ? 'checked' : ''} ${dis}> Compra direta</label>
            </div></div>
          <label class="campo" style="margin-top:12px;max-width:320px"><span>Onde ficou guardado</span><select name="localId" ${dis}>${opts(db.locais, r.localId, (l) => `${l.armazem} · ${l.pilha}`)}</select></label>
          <details style="margin-top:12px"><summary class="peq">Nota fiscal de produtor (opcional)</summary>
            <div class="campos" style="margin-top:8px">
              <label class="campo"><span>Nº da nota</span><input name="nfNumero" value="${esc(r.nfNumero)}" ${dis}></label>
              <label class="campo"><span>Série</span><input name="nfSerie" value="${esc(r.nfSerie)}" ${dis}></label>
              <label class="campo"><span>Emissão</span><input type="date" name="nfEmissao" value="${esc(r.nfEmissao)}" ${dis}></label>
              <label class="campo largo"><span>Chave NF-e</span><input name="nfChave" value="${esc(r.nfChave)}" ${dis} inputmode="numeric"></label>
            </div></details>
        </div>
        ${soLeitura ? '' : `<div class="acoes" style="margin-bottom:16px"><button class="btn prim" type="submit">${existente ? 'Salvar alterações' : 'Salvar romaneio'}</button>${existente ? '' : '<label class="check peq"><input type="checkbox" id="imprimir-depois" checked> imprimir as 2 vias ao salvar</label>'}</div>`}
      </form>
      <div class="previa" aria-label="Pré-visualização do talão"><div class="peq muted" style="margin-bottom:6px">Pré-visualização (via do produtor)</div><div id="previa" style="overflow:hidden"></div></div>
    </div>
    ${existente ? anexosHtml('romaneio', existente.id) : ''}`;

  const fr = app.querySelector('#fr');
  const ler = () => {
    const fd = new FormData(fr);
    r.data = fd.get('data') ?? r.data; r.motoristaId = fd.get('motoristaId') ?? r.motoristaId; r.pasta = fd.get('pasta') ?? r.pasta;
    r.tipoId = fd.get('tipoId') ?? r.tipoId; r.obs = fd.get('obs') ?? r.obs; r.destino = fd.get('destino') ?? r.destino; r.localId = fd.get('localId') ?? r.localId;
    const u = fd.get('umidade'); if (u !== null) r.umidade = u === '' ? '' : Number(String(u).replace(',', '.'));
    if (!soLeitura) r.aplicarUmidade = fd.get('aplicarUmidade') === 'on';
    ['nfNumero', 'nfSerie', 'nfEmissao', 'nfChave'].forEach((k) => { if (fd.get(k) !== null) r[k] = fd.get(k); });
    const p = lerPessoa(app.querySelector('#f-pessoa').value); r.pessoaId = p?.id || '';
    app.querySelectorAll('#linhas input').forEach((inp) => { r.itens[+inp.dataset.l][inp.dataset.c] = inp.value; });
  };
  const atualizar = () => {
    if (!soLeitura) ler();
    const t = C.totaisRomaneio(r.itens, { taraPorSacoKg: cfg.taraPorSacoKg, umidade: r.umidade, aplicarUmidade: r.aplicarUmidade, tabelaUmidade: cfg.tabelaUmidade });
    r.totais = t;
    app.querySelectorAll('#linhas input').forEach((inp) => {
      const v = inp.value;
      inp.classList.toggle('invalido', inp.dataset.c === 'volumes' ? (v && !C.lerVolumes(v)) : (v && !(C.kgParaDec(v) >= 0)));
    });
    app.querySelector('#erros').innerHTML = t.erros.length ? `<div class="erro">${t.erros.map(esc).join('<br>')}</div>` : '';
    app.querySelector('#totais').innerHTML = `
      <div><span>Volumes</span><b>${t.volumes}${t.fracoes ? ` (${t.cheias}+${t.fracoes}F)` : ''}</b></div>
      <div><span>Peso bruto</span><b>${KG(t.brutoDec)}</b></div>
      <div><span>Tara (${String(cfg.taraPorSacoKg).replace('.', ',')} kg/saco)</span><b>${KG(t.taraDec)}</b></div>
      ${t.umidadeDec ? `<div><span>Umidade (-${String(t.pctUmidade).replace('.', ',')}%)</span><b>${KG(t.umidadeDec)}</b></div>` : ''}
      <div class="destaque"><span>Peso líquido</span><b>${SC(t.liquidoDec)}</b><span>${KG(t.liquidoDec)}</span></div>`;
    app.querySelector('#previa').innerHTML = DOC.talao({ ...r, totais: t, status: r.status }, { previa: true });
    const prev = app.querySelector('#previa .folha');
    const w = app.querySelector('#previa').clientWidth;
    const escala = Math.min(1, w / prev.offsetWidth);
    prev.style.transform = `scale(${escala})`;
    app.querySelector('#previa').style.height = prev.offsetHeight * escala + 'px';
  };
  fr.addEventListener('input', atualizar);
  fr.addEventListener('change', atualizar);
  atualizar();
  app.querySelector('#mais-linha')?.addEventListener('click', () => {
    r.itens.push({ volumes: '', quilos: '' });
    const i = r.itens.length - 1;
    app.querySelector('#linhas').insertAdjacentHTML('beforeend', `<span class="ln">${i + 1}</span><input data-l="${i}" data-c="volumes" aria-label="Volumes linha ${i + 1}"><input data-l="${i}" data-c="quilos" inputmode="decimal" aria-label="Quilos linha ${i + 1}">`);
  });
  // Enter na linha pula para o próximo campo, como no papel
  app.querySelector('#linhas').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    e.preventDefault();
    const todos = [...app.querySelectorAll('#linhas input')];
    todos[todos.indexOf(e.target) + 1]?.focus();
  });
  app.querySelector('#imp')?.addEventListener('click', () => imprimir(DOC.talao(existente), 'A5'));
  app.querySelector('#cancelar')?.addEventListener('click', async () => {
    const motivo = await pedirMotivo(`Cancelar romaneio ${D.fmtNum(existente.numero)}`, 'O peso sai do saldo do produtor.');
    if (!motivo) return;
    existente.status = 'cancelado'; existente.cancelMotivo = motivo;
    db.movimentos.filter((m) => m.romaneioId === existente.id).forEach((m) => { m.cancelado = true; });
    D.auditar('cancelou', 'romaneio', existente.id, null, `Nº ${D.fmtNum(existente.numero)}: ${motivo}`);
    gravar('Romaneio cancelado.'); render();
  });

  fr.addEventListener('submit', (e) => {
    e.preventDefault();
    ler(); atualizar();
    const t = r.totais;
    const faltas = [];
    if (!r.pessoaId) faltas.push('Escolha o produtor da lista (cadastre antes em Pessoas, se for novo).');
    if (!t.liquidoDec) faltas.push('Lance pelo menos uma linha de quilos.');
    if (t.erros.length) faltas.push('Corrija as linhas marcadas em vermelho.');
    if (faltas.length) { app.querySelector('#erros').innerHTML = `<div class="erro">${faltas.map(esc).join('<br>')}</div>`; app.querySelector('#erros').scrollIntoView({ block: 'center' }); return; }
    const itens = r.itens.filter((it) => String(it.volumes).trim() || String(it.quilos).trim());
    const final = { ...r, itens, status: r.tipoId ? 'classificado' : 'aberto' };
    if (existente) {
      const antes = { pessoa: existente.pessoaId, liquido: existente.totais.liquidoDec, tipo: existente.tipoId };
      Object.assign(existente, final);
      const mov = db.movimentos.find((m) => m.romaneioId === existente.id && m.tipo === 'entrada');
      if (mov) Object.assign(mov, { data: existente.data, pessoaId: existente.pessoaId, tipoId: existente.tipoId, localId: existente.localId, pesoDec: t.liquidoDec });
      D.auditar('alterou', 'romaneio', existente.id, antes, { pessoa: existente.pessoaId, liquido: t.liquidoDec, tipo: existente.tipoId });
      gravar('Romaneio salvo.'); render();
    } else {
      final.id = D.uid(); final.numero = cfg.proxRomaneio++; final.criadoPor = db.usuario.nome; final.criadoEm = new Date().toISOString();
      db.romaneios.push(final);
      db.movimentos.push({ id: D.uid(), data: final.data, pessoaId: final.pessoaId, tipoId: final.tipoId, localId: final.localId, tipo: 'entrada', pesoDec: t.liquidoDec, romaneioId: final.id, rvId: '', motivo: `Romaneio ${D.fmtNum(final.numero)}`, criadoPor: db.usuario.nome });
      D.auditar('criou', 'romaneio', final.id, null, `Nº ${D.fmtNum(final.numero)} · ${SC(t.liquidoDec)}`);
      gravar(`Romaneio ${D.fmtNum(final.numero)} salvo.`);
      const imp = app.querySelector('#imprimir-depois')?.checked;
      ir('romaneio/' + final.id);
      if (imp) imprimir(DOC.talao(final), 'A5');
    }
  });
}

// =====================================================================
// ESTOQUE
// =====================================================================
function estoque() {
  const db = D.db;
  const f = { q: params.get('q') || '', tipo: params.get('tipo') || '' };
  const linhas = [];
  const porTipo = {};
  db.pessoas.forEach((p) => {
    const tipos = new Set(db.movimentos.filter((m) => m.pessoaId === p.id).map((m) => m.tipoId));
    tipos.forEach((tid) => {
      const s = D.saldoPessoa(p.id, tid);
      if (!s) return;
      porTipo[tid] = (porTipo[tid] || 0) + s;
      linhas.push({ p, tid, s });
    });
  });
  let vis = linhas;
  if (f.q) { const q = f.q.toLowerCase(); vis = vis.filter((l) => D.nomePessoa(l.p).toLowerCase().includes(q)); }
  if (f.tipo) vis = vis.filter((l) => l.tid === f.tipo);
  vis.sort((a, b) => a.p.nome.localeCompare(b.p.nome));
  const porLocal = {};
  db.movimentos.filter((m) => !m.cancelado).forEach((m) => {
    const sinal = ['entrada', 'transferencia_entrada', 'ajuste'].includes(m.tipo) ? 1 : -1;
    if (m.tipo.startsWith('transferencia')) return; // muda de dono, não de pilha
    if (m.tipo === 'venda') return; // vendido continua no armazém, agora do próprio armazém
    porLocal[m.localId] = (porLocal[m.localId] || 0) + sinal * m.pesoDec;
  });
  const total = linhas.reduce((s, l) => s + l.s, 0);
  const recentes = db.movimentos.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 25);

  app.innerHTML = `${dlPessoas()}<div class="cab"><div><h1>Estoque</h1><p>Café guardado de cada produtor. Comprado pelo armazém sai do saldo dele.</p></div>
    <div class="acoes"><button class="btn" id="imp">Imprimir saldo</button><button class="btn prim" data-escrita id="mov">Retirada, transferência ou ajuste</button></div></div>
    <div class="grade g4" style="margin-bottom:16px">
      <div class="kpi"><b>${SC(total)}</b><span>guardado de produtores · ${KG(total)}</span></div>
      ${Object.entries(porTipo).filter(([, s]) => s).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tid, s]) => `<div class="kpi"><b>${SC(s)}</b><span>${esc(D.nomeTipo(D.tipo(tid)) || 'Sem classificação')}</span></div>`).join('')}
    </div>
    <div class="cartao"><form class="filtros" id="filtros">
      <label class="campo"><span>Produtor</span><input type="search" name="q" value="${esc(f.q)}" placeholder="nome ou apelido"></label>
      <label class="campo"><span>Café</span><select name="tipo">${opts(db.tipos, f.tipo, D.nomeTipo, (t) => t.id, 'Todos')}</select></label>
      <button class="btn">Filtrar</button></form>
      ${vis.length ? `<div class="rolar"><table><thead><tr><th>Produtor</th><th>Café</th><th class="num">Saldo</th><th class="num">Quilos</th><th></th></tr></thead><tbody>
        ${vis.map((l) => `<tr class="clicavel" data-href="pessoa/${l.p.id}"><td>${esc(D.nomePessoa(l.p))}</td><td>${esc(D.nomeTipo(D.tipo(l.tid)) || 'Sem classificação')}</td><td class="num ${l.s < 0 ? 'neg' : ''}">${SC(l.s)}</td><td class="num">${KG(l.s)}</td><td class="num"><button class="btn peq" data-extrato="${l.p.id}">Extrato</button></td></tr>`).join('')}
      </tbody></table></div>` : '<div class="vazio">Nenhum saldo com esse filtro.</div>'}
    </div>
    <div class="grade g2">
      <div class="cartao"><h2>Por pilha</h2><p class="peq muted">Inclui o café já comprado pelo armazém.</p><table><tbody>
        ${db.locais.map((l) => `<tr><td>${esc(l.armazem)} · ${esc(l.pilha)}</td><td class="num">${SC(porLocal[l.id] || 0)}</td></tr>`).join('')}</tbody></table></div>
      <div class="cartao"><h2>Últimos movimentos</h2><div class="rolar"><table><tbody>
        ${recentes.map((m) => `<tr class="${m.cancelado ? 'cancelado' : ''}"><td>${data(m.data)}</td><td>${esc(DOC.TIPO_MOV[m.tipo])}</td><td>${esc(D.nomePessoa(D.pessoa(m.pessoaId), true))}</td><td class="peq muted">${esc(m.motivo)}</td><td class="num">${['entrada', 'transferencia_entrada'].includes(m.tipo) || (m.tipo === 'ajuste' && m.pesoDec > 0) ? '' : '-'}${SC(Math.abs(m.pesoDec))}</td></tr>`).join('')}
      </tbody></table></div></div>
    </div>`;
  ligarFiltros('estoque');
  ligarLinhas();
  app.querySelectorAll('[data-extrato]').forEach((b) => b.onclick = () => imprimir(DOC.extratoDoc(D.pessoa(b.dataset.extrato))));
  app.querySelector('#imp').onclick = () => imprimir(DOC.relatorioDoc('SALDO DE ESTOQUE POR PRODUTOR', data(hoje()),
    `<table><thead><tr><th>Produtor</th><th>Café</th><th class="num">Saldo</th><th class="num">Quilos</th></tr></thead><tbody>${vis.map((l) => `<tr><td>${esc(D.nomePessoa(l.p))}</td><td>${esc(D.nomeTipo(D.tipo(l.tid)))}</td><td class="num">${SC(l.s)}</td><td class="num">${KG(l.s)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td colspan="2">Total</td><td class="num">${SC(vis.reduce((s, l) => s + l.s, 0))}</td><td class="num">${KG(vis.reduce((s, l) => s + l.s, 0))}</td></tr></tfoot></table>`));
  app.querySelector('#mov').onclick = () => modalMovimento();
}

function modalMovimento() {
  const db = D.db;
  abrirModal(`${dlPessoas()}<h2>Movimentar estoque</h2>
    <div class="radio-linha" style="margin-bottom:12px">
      <label><input type="radio" name="mt" value="saida" checked> Retirada</label>
      <label><input type="radio" name="mt" value="transferencia"> Transferência</label>
      <label><input type="radio" name="mt" value="ajuste"> Ajuste (quebra / umidade)</label>
    </div>
    <div class="campos">
      ${campoPessoa('mv-p', '', 'Produtor (de quem sai)', 'largo')}
      <label class="campo largo"><span>Café</span><select id="mv-t">${opts(db.tipos, '', D.nomeTipo)}</select></label>
      ${sacasKgCampos('mv')}
      <label class="campo"><span>Data</span><input type="date" id="mv-d" value="${hoje()}"></label>
      <div id="mv-dest" class="campo largo" hidden>${campoPessoa('mv-p2', '', 'Para quem vai').replace(/<\/?label[^>]*>/g, '')}</div>
      <label class="campo largo" id="mv-sinal" hidden><span>Ajuste</span><select id="mv-s"><option value="-1">Tirar do saldo (quebra, umidade)</option><option value="1">Pôr no saldo (sobra)</option></select></label>
      <label class="campo largo"><span>Motivo</span><input id="mv-m" placeholder="obrigatório"></label>
    </div>
    <div id="mv-info" class="peq muted" style="margin-top:8px"></div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="mv-ok">Lançar</button></div>`,
  { aoAbrir: (cx) => {
    const tipoMov = () => cx.querySelector('[name=mt]:checked').value;
    const info = () => {
      cx.querySelector('#mv-dest').hidden = tipoMov() !== 'transferencia';
      cx.querySelector('#mv-sinal').hidden = tipoMov() !== 'ajuste';
      const p = lerPessoa(cx.querySelector('#mv-p').value);
      cx.querySelector('#mv-info').textContent = p ? `Saldo de ${D.nomePessoa(p, true)} neste café: ${SC(D.saldoPessoa(p.id, cx.querySelector('#mv-t').value))}` : '';
    };
    cx.addEventListener('input', info); cx.addEventListener('change', info);
    cx.querySelector('#mv-ok').onclick = () => {
      const p = lerPessoa(cx.querySelector('#mv-p').value);
      const tid = cx.querySelector('#mv-t').value;
      const peso = lerSacasKg(cx, 'mv');
      const motivo = cx.querySelector('#mv-m').value.trim();
      const dt = cx.querySelector('#mv-d').value;
      const tm = tipoMov();
      if (!p || !peso || !motivo) return aviso('Preencha produtor, quantidade e motivo.');
      const saldo = D.saldoPessoa(p.id, tid);
      const sai = tm !== 'ajuste' || cx.querySelector('#mv-s').value === '-1';
      if (sai && peso > saldo) return aviso(`Saldo insuficiente: ${D.nomePessoa(p, true)} tem ${SC(saldo)} desse café.`);
      const base = { data: dt, tipoId: tid, localId: db.locais[0]?.id || '', romaneioId: '', rvId: '', motivo, criadoPor: db.usuario.nome };
      if (tm === 'saida') db.movimentos.push({ id: D.uid(), ...base, pessoaId: p.id, tipo: 'saida', pesoDec: peso });
      if (tm === 'ajuste') db.movimentos.push({ id: D.uid(), ...base, pessoaId: p.id, tipo: 'ajuste', pesoDec: sai ? -peso : peso });
      if (tm === 'transferencia') {
        const p2 = lerPessoa(cx.querySelector('#mv-p2').value);
        if (!p2 || p2.id === p.id) return aviso('Escolha para quem vai o café.');
        db.movimentos.push({ id: D.uid(), ...base, pessoaId: p.id, tipo: 'transferencia_saida', pesoDec: peso, motivo: `${motivo} (para ${D.nomePessoa(p2, true)})` });
        db.movimentos.push({ id: D.uid(), ...base, pessoaId: p2.id, tipo: 'transferencia_entrada', pesoDec: peso, motivo: `${motivo} (de ${D.nomePessoa(p, true)})` });
      }
      D.auditar('lançou ' + DOC.TIPO_MOV[tm === 'transferencia' ? 'transferencia_saida' : tm].toLowerCase(), 'estoque', p.id, null, `${SC(peso)} · ${motivo}`);
      gravar('Movimento lançado.'); fecharModal(); render();
    };
  } });
}

// =====================================================================
// CADERNO DE RV
// =====================================================================
function rvLista() {
  const db = D.db;
  const f = { q: params.get('q') || '', de: params.get('de') || '', ate: params.get('ate') || '', st: params.get('st') || '', local: params.get('local') || '' };
  let lista = db.rvs.slice().sort((a, b) => b.numero - a.numero);
  if (f.q) { const q = f.q.toLowerCase(); lista = lista.filter((r) => String(r.numero).includes(q) || D.nomePessoa(D.pessoa(r.vendedorId)).toLowerCase().includes(q)); }
  if (f.de) lista = lista.filter((r) => r.dataCompra >= f.de);
  if (f.ate) lista = lista.filter((r) => r.dataCompra <= f.ate);
  if (f.st) lista = lista.filter((r) => D.statusRV(r) === f.st);
  if (f.local) lista = lista.filter((r) => r.localBuscaId === f.local);
  const aBuscar = db.rvs.filter((r) => D.statusRV(r) === 'comprado');
  app.innerHTML = `<div class="cab"><div><h1>Caderno de RV</h1><p>Cada café comprado, com número. Próximo RV: <b>${db.config.proxRV}</b></p></div>
    <div class="acoes"><button class="btn" id="imp">Imprimir caderno</button><a class="btn prim" data-escrita href="#/rv/novo">Nova compra</a></div></div>
    <div class="cartao"><form class="filtros" id="filtros">
      <label class="campo"><span>Buscar</span><input type="search" name="q" value="${esc(f.q)}" placeholder="nº do RV ou vendedor"></label>
      <label class="campo"><span>De</span><input type="date" name="de" value="${f.de}"></label>
      <label class="campo"><span>Até</span><input type="date" name="ate" value="${f.ate}"></label>
      <label class="campo"><span>Local de busca</span><select name="local">${opts(db.locaisBusca, f.local, (l) => l.nome, (l) => l.id, 'Todos')}</select></label>
      <label class="campo"><span>Status</span><select name="st">${opts(Object.entries(STATUS_RV), f.st, (x) => x[1], (x) => x[0], 'Todos')}</select></label>
      <button class="btn">Filtrar</button></form>
      ${lista.length ? `<div class="rolar"><table><thead><tr><th>RV</th><th>Compra</th><th>Vendedor</th><th>Café</th><th class="num">Quantidade</th><th class="num">Saca</th><th class="num">Total</th><th>Pagamento</th><th>Busca</th><th>Status</th></tr></thead><tbody>
        ${lista.map((r) => { const st = D.statusRV(r); const lb = D.localBusca(r.localBuscaId); return `<tr class="clicavel ${st === 'cancelado' ? 'cancelado' : ''}" data-href="rv/${r.id}">
          <td class="num"><b>${r.numero}</b></td><td>${data(r.dataCompra)}</td><td>${esc(D.nomePessoa(D.pessoa(r.vendedorId), true))}</td><td class="peq">${esc(D.nomeTipo(D.tipo(r.tipoId)))}</td>
          <td class="num">${SC(r.pesoDec)}</td><td class="num">${R(r.precoSacaCentavos)}</td><td class="num">${R(r.totalCentavos)}</td>
          <td>${data(r.dataPagamento)}</td><td class="peq">${esc(lb?.nome || (r.origem === 'saldo' ? 'no armazém' : '-'))}</td><td>${selo(st, STATUS_RV[st])}</td></tr>`; }).join('')}
      </tbody></table></div>` : '<div class="vazio">Nenhum RV com esse filtro.</div>'}
    </div>
    <div class="cartao"><h2>Cafés comprados a buscar</h2><p class="peq muted">Para organizar as viagens de frete.</p>${tabelaABuscar(aBuscar)}</div>`;
  ligarFiltros('rv');
  ligarLinhas();
  app.querySelector('#imp').onclick = () => imprimir(DOC.relatorioDoc('CADERNO DE RV', `${f.de ? data(f.de) : 'início'} a ${f.ate ? data(f.ate) : 'hoje'}`,
    `<table><thead><tr><th>RV</th><th>Vendedor</th><th>Compra</th><th>Pagamento</th><th class="num">Saca</th><th>Local de busca</th><th class="num">Quant.</th><th class="num">Total</th></tr></thead><tbody>
    ${lista.slice().reverse().map((r) => `<tr><td>${r.numero}</td><td>${esc(D.nomePessoa(D.pessoa(r.vendedorId)))}</td><td>${data(r.dataCompra)}</td><td>${data(r.dataPagamento)}</td><td class="num">${R(r.precoSacaCentavos)}</td><td>${esc(D.localBusca(r.localBuscaId)?.nome || '')}</td><td class="num">${SC(r.pesoDec)}</td><td class="num">${R(r.totalCentavos)}${r.cancelado ? ' (canc.)' : ''}</td></tr>`).join('')}</tbody></table>`));
}

function partesPadrao(vendedorId) {
  const parc = D.db.parcerias.filter((x) => x.titularId === vendedorId);
  return [{ pessoaId: vendedorId, percentual: 100 - parc.reduce((a, x) => a + Number(x.percentual), 0) }, ...parc.map((x) => ({ pessoaId: x.parceiroId, percentual: Number(x.percentual) }))];
}

function rvNovo() {
  if (!pode('escrita')) return bloqueado();
  const db = D.db, cfg = db.config;
  const romIni = params.get('romaneio') ? db.romaneios.find((r) => r.id === params.get('romaneio')) : null;
  const st = {
    vendedorId: romIni?.pessoaId || params.get('pessoa') || '', origem: romIni ? 'romaneio' : 'saldo', romaneioIds: romIni ? [romIni.id] : [],
    tipoId: romIni?.tipoId || '', partes: [], descontos: [],
  };
  if (st.vendedorId) st.partes = partesPadrao(st.vendedorId);
  const romsLivres = (pid) => db.romaneios.filter((r) => r.pessoaId === pid && r.status !== 'cancelado' && !db.rvs.some((v) => !v.cancelado && v.romaneioIds.includes(r.id)));

  app.innerHTML = `${dlPessoas()}<div class="cab"><div><h1>Nova compra <span class="talao-num">RV ${cfg.proxRV}</span></h1><p>O que ia no caderno, com a conta pronta.</p></div></div>
    <form id="fr" autocomplete="off">
    <div class="grade g2">
      <div>
        <div class="cartao"><div class="campos">
          ${campoPessoa('rv-v', st.vendedorId, 'Vendedor', 'largo')}
          <div id="rv-saldo" class="campo largo peq"></div>
          <label class="campo"><span>Data da compra</span><input type="date" id="rv-dc" value="${hoje()}"></label>
          <label class="campo"><span>Data do pagamento</span><input type="date" id="rv-dp" value="${hoje()}"></label>
        </div></div>
        <div class="cartao"><h3>De onde vem o café</h3>
          <div class="radio-linha" style="margin-bottom:12px">
            <label><input type="radio" name="origem" value="saldo" ${st.origem === 'saldo' ? 'checked' : ''}> Já está guardado aqui</label>
            <label><input type="radio" name="origem" value="romaneio" ${st.origem === 'romaneio' ? 'checked' : ''}> Romaneio já lançado</label>
            <label><input type="radio" name="origem" value="buscar" ${st.origem === 'buscar' ? 'checked' : ''}> Buscar no local</label>
          </div>
          <div id="rv-origem"></div>
        </div>
        <div class="cartao"><h3>Café e preço</h3><div class="campos">
          <label class="campo largo"><span>Café</span><select id="rv-t">${opts(tiposAtivos(st.tipoId), st.tipoId, D.nomeTipo, (t) => t.id, 'Escolha')}</select></label>
          ${sacasKgCampos('rv', romIni?.totais.liquidoDec || 0)}
          <label class="campo"><span>Valor da saca (R$)</span><input id="rv-preco" inputmode="decimal" placeholder="ex.: 1.180,00"></label>
          <label class="campo largo"><span>Observações</span><input id="rv-obs"></label>
        </div></div>
      </div>
      <div>
        <div class="cartao"><h3>Partilha / meação</h3><p class="peq muted" style="margin-top:0">Puxa as parcerias do cadastro. A diferença de centavo fica com o titular.</p>
          <div id="rv-partes"></div><button type="button" class="btn peq" id="rv-add-parte">+ parceiro</button></div>
        <div class="cartao"><h3>Descontos desta compra</h3><p class="peq muted" style="margin-top:0">Adiantamento, sacaria (panha), frete da busca. Os descontos que a pessoa já tem pendentes entram sozinhos no acerto.</p>
          <div id="rv-desc"></div><button type="button" class="btn peq" id="rv-add-desc">+ desconto</button></div>
        <div class="cartao" style="border-color:var(--verde)"><h3>Resumo</h3><div id="rv-resumo"></div>
          <div id="rv-erros" style="margin-top:8px"></div>
          <div class="acoes" style="margin-top:12px"><button class="btn prim" type="submit">Registrar RV ${cfg.proxRV}</button><label class="check peq"><input type="checkbox" id="rv-imp" checked> imprimir comprovante</label></div>
        </div>
      </div>
    </div></form>`;

  const fr = app.querySelector('#fr');
  const $ = (s) => app.querySelector(s);
  const desenharOrigem = () => {
    const v = lerPessoa($('#rv-v').value);
    const o = st.origem;
    if (o === 'saldo') $('#rv-origem').innerHTML = '<p class="peq muted" style="margin:0">O café sai do saldo guardado do vendedor na hora.</p>';
    if (o === 'romaneio') {
      const roms = v ? romsLivres(v.id) : [];
      $('#rv-origem').innerHTML = roms.length ? roms.map((r) => `<label class="check" style="padding:4px 0"><input type="checkbox" data-rom="${r.id}" ${st.romaneioIds.includes(r.id) ? 'checked' : ''}> Nº ${D.fmtNum(r.numero)} · ${data(r.data)} · ${SC(r.totais.liquidoDec)} · ${esc(D.nomeTipo(D.tipo(r.tipoId)))}</label>`).join('')
        : '<p class="peq muted" style="margin:0">Nenhum romaneio deste vendedor sem RV.</p>';
    }
    if (o === 'buscar') $('#rv-origem').innerHTML = `<div class="campos"><label class="campo largo"><span>Local de busca</span><select id="rv-lb">${opts(db.locaisBusca, '', (l) => `${l.nome} · ${l.comunidade}, ${l.municipio}`, (l) => l.id, 'Novo local…')}</select></label>
      <div id="rv-lb-novo" class="campos largo campo" style="display:grid">
        <label class="campo"><span>Nome do local</span><input id="lb-n" placeholder="Sítio, fazenda"></label>
        <label class="campo"><span>Comunidade</span><input id="lb-c"></label>
        <label class="campo"><span>Município</span><input id="lb-m"></label>
        <label class="campo"><span>Referência</span><input id="lb-r"></label></div></div>
      <p class="peq muted" style="margin:8px 0 0">Fica em "a buscar" até o romaneio da busca ser lançado.</p>`;
    const lb = $('#rv-lb');
    if (lb) { lb.value = db.locaisBusca[0]?.id || ''; const t = () => { $('#rv-lb-novo').style.display = lb.value ? 'none' : 'grid'; }; lb.onchange = t; t(); }
  };
  const desenharPartes = () => {
    $('#rv-partes').innerHTML = st.partes.map((p, i) => `<div class="campos" style="grid-template-columns:1fr 90px 40px;margin-bottom:6px;align-items:end">
      ${campoPessoa('pt-' + i, p.pessoaId, i === 0 ? 'Titular (vendedor)' : 'Parceiro').replace('<input', `<input data-parte="${i}" ${i === 0 ? 'disabled' : ''}`)}
      <label class="campo"><span>%</span><input data-pct="${i}" inputmode="decimal" value="${String(p.percentual).replace('.', ',')}" ${i === 0 ? 'disabled' : ''}></label>
      ${i === 0 ? '<span></span>' : `<button type="button" class="btn peq" data-tira-parte="${i}" aria-label="Tirar parceiro">×</button>`}</div>`).join('') || '<p class="peq muted">Escolha o vendedor.</p>';
  };
  const desenharDescontos = () => {
    $('#rv-desc').innerHTML = st.descontos.map((d, i) => `<div class="campos" style="grid-template-columns:130px 1fr 110px 40px;margin-bottom:6px;align-items:end">
      <label class="campo"><span>Tipo</span><select data-dcat="${i}">${opts(['adiantamento', 'sacaria', 'frete', 'outros'], d.categoria, (x) => CATEGORIAS[x], (x) => x)}</select></label>
      <label class="campo"><span>Descrição</span><input data-ddesc="${i}" value="${esc(d.descricao)}"></label>
      <label class="campo"><span>Valor</span><input data-dval="${i}" inputmode="decimal" value="${esc(d.valor)}"></label>
      <button type="button" class="btn peq" data-tira-desc="${i}" aria-label="Tirar desconto">×</button></div>`).join('');
  };
  const calcular = () => {
    const v = lerPessoa($('#rv-v').value);
    if (v && v.id !== st.vendedorId) {
      st.vendedorId = v.id; st.partes = partesPadrao(v.id); st.romaneioIds = []; desenharPartes(); desenharOrigem();
    }
    st.origem = fr.querySelector('[name=origem]:checked').value;
    app.querySelectorAll('[data-rom]').forEach((c) => { const on = c.checked; const i = st.romaneioIds.indexOf(c.dataset.rom); if (on && i < 0) st.romaneioIds.push(c.dataset.rom); if (!on && i >= 0) st.romaneioIds.splice(i, 1); });
    app.querySelectorAll('[data-pct]').forEach((inp) => { const i = +inp.dataset.pct; if (i > 0) st.partes[i].percentual = Number(inp.value.replace(',', '.')) || 0; });
    app.querySelectorAll('[data-parte]').forEach((inp) => { const i = +inp.dataset.parte; if (i > 0) st.partes[i].pessoaId = lerPessoa(inp.value)?.id || ''; });
    if (st.partes.length) st.partes[0].percentual = Math.round((100 - st.partes.slice(1).reduce((a, p) => a + p.percentual, 0)) * 100) / 100;
    const pct0 = app.querySelector('[data-pct="0"]'); if (pct0) pct0.value = String(st.partes[0].percentual).replace('.', ',');
    app.querySelectorAll('[data-dcat]').forEach((s) => { st.descontos[+s.dataset.dcat].categoria = s.value; });
    app.querySelectorAll('[data-ddesc]').forEach((s) => { st.descontos[+s.dataset.ddesc].descricao = s.value; });
    app.querySelectorAll('[data-dval]').forEach((s) => { st.descontos[+s.dataset.dval].valor = s.value; });
    st.tipoId = $('#rv-t').value;

    const saldo = v ? D.saldoPessoa(v.id, st.tipoId || undefined) : 0;
    $('#rv-saldo').innerHTML = v ? `Saldo guardado ${st.tipoId ? 'deste café' : 'total'}: <b>${SC(saldo)}</b>` : '';
    let peso = lerSacasKg(app, 'rv');
    if (st.origem === 'romaneio' && st.romaneioIds.length) {
      peso = st.romaneioIds.reduce((s, id) => s + (db.romaneios.find((r) => r.id === id)?.totais.liquidoDec || 0), 0);
      const { sacas, restoDec } = C.kgEmSacas(peso, cfg.kgPorSaca);
      $('#rv-sc').value = sacas; $('#rv-kg').value = restoDec ? String(restoDec / 10).replace('.', ',') : '';
      const r0 = db.romaneios.find((r) => r.id === st.romaneioIds[0]);
      if (!st.tipoId && r0?.tipoId) { $('#rv-t').value = r0.tipoId; st.tipoId = r0.tipoId; }
    }
    const preco = C.reaisParaCentavos($('#rv-preco').value);
    const total = Number.isFinite(preco) ? C.valorCompra(peso, preco, cfg) : 0;
    let partilhas = [];
    let erroPart = '';
    try { partilhas = st.partes.length ? C.partilhar(total, st.partes) : []; } catch (e) { erroPart = e.message; }
    const descs = st.descontos.map((d) => ({ ...d, cent: C.reaisParaCentavos(d.valor) || 0 }));
    const descPend = v ? db.lancamentos.filter((l) => l.pessoaId === v.id && l.sinal === 'desconto' && ['pendente', 'parcial'].includes(l.status)) : [];
    const totDesc = descs.reduce((s, d) => s + d.cent, 0) + descPend.reduce((s, l) => s + aberto(l), 0);
    const doTitular = partilhas[0]?.valorCentavos || 0;
    $('#rv-resumo').innerHTML = `<table><tbody>
      <tr><td>Quantidade</td><td class="num">${SC(peso)} · ${KG(peso)}</td></tr>
      <tr><td>Sacas pagáveis</td><td class="num">${C.formatarSacasDecimais(C.sacasPagaveis(peso, cfg), cfg.casasSacas)} <span class="peq muted">(${cfg.arredondamento}, ${cfg.casasSacas} casas)</span></td></tr>
      <tr><td><b>Total da compra</b></td><td class="num"><b>${R(total)}</b></td></tr>
      ${partilhas.length > 1 ? partilhas.map((p) => `<tr><td>${esc(D.nomePessoa(D.pessoa(p.pessoaId), true))} (${String(p.percentual).replace('.', ',')}%)</td><td class="num">${R(p.valorCentavos)}</td></tr>`).join('') : ''}
      ${descs.map((d) => `<tr><td>Desconto: ${esc(d.descricao || CATEGORIAS[d.categoria])}</td><td class="num neg">-${R(d.cent)}</td></tr>`).join('')}
      ${descPend.map((l) => `<tr><td>Pendente: ${esc(l.descricao)}</td><td class="num neg">-${R(aberto(l))}</td></tr>`).join('')}
      <tr class="subtotal"><td>Líquido para ${esc(v ? D.nomePessoa(v, true) : 'o vendedor')}</td><td class="num">${R(doTitular - totDesc)}</td></tr>
    </tbody></table>`;
    const errs = [];
    if (erroPart) errs.push(erroPart);
    if (st.origem === 'saldo' && v && peso > saldo) errs.push(`O vendedor tem ${SC(saldo)} guardado ${st.tipoId ? 'deste café' : ''}; a compra é de ${SC(peso)}.`);
    $('#rv-erros').innerHTML = errs.length ? `<div class="erro">${errs.map(esc).join('<br>')}</div>` : '';
    return { v, peso, preco, total, partilhas, descs, errs };
  };
  desenharOrigem(); desenharPartes(); desenharDescontos(); calcular();
  fr.addEventListener('input', calcular);
  fr.addEventListener('change', (e) => { if (e.target.name === 'origem') { st.origem = e.target.value; desenharOrigem(); } calcular(); });
  $('#rv-add-parte').onclick = () => { if (!st.partes.length) return aviso('Escolha o vendedor primeiro.'); st.partes.push({ pessoaId: '', percentual: 0 }); desenharPartes(); calcular(); };
  $('#rv-add-desc').onclick = () => { st.descontos.push({ categoria: 'sacaria', descricao: '', valor: '' }); desenharDescontos(); calcular(); };
  fr.addEventListener('click', (e) => {
    const tp = e.target.closest('[data-tira-parte]'); if (tp) { st.partes.splice(+tp.dataset.tiraParte, 1); desenharPartes(); calcular(); }
    const td = e.target.closest('[data-tira-desc]'); if (td) { st.descontos.splice(+td.dataset.tiraDesc, 1); desenharDescontos(); calcular(); }
  });

  fr.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = calcular();
    const faltas = [...c.errs];
    if (!c.v) faltas.push('Escolha o vendedor.');
    if (!st.tipoId) faltas.push('Escolha o café.');
    if (!c.peso) faltas.push('Informe a quantidade.');
    if (!c.preco || !Number.isFinite(c.preco)) faltas.push('Informe o valor da saca.');
    if (st.origem === 'romaneio' && !st.romaneioIds.length) faltas.push('Marque o romaneio.');
    if (st.partes.some((p) => !p.pessoaId)) faltas.push('Escolha a pessoa de cada parceiro.');
    if (c.descs.some((d) => !d.cent)) faltas.push('Desconto sem valor.');
    if (faltas.length) { $('#rv-erros').innerHTML = `<div class="erro">${faltas.map(esc).join('<br>')}</div>`; return; }
    let localBuscaId = '';
    if (st.origem === 'buscar') {
      localBuscaId = $('#rv-lb').value;
      if (!localBuscaId) {
        const nome = $('#lb-n').value.trim();
        if (!nome) { $('#rv-erros').innerHTML = '<div class="erro">Informe o local de busca.</div>'; return; }
        const lb = { id: D.uid(), nome, comunidade: $('#lb-c').value, municipio: $('#lb-m').value, referencia: $('#lb-r').value };
        db.locaisBusca.push(lb); localBuscaId = lb.id;
      }
    }
    const rv = {
      id: D.uid(), numero: cfg.proxRV++, vendedorId: c.v.id, dataCompra: $('#rv-dc').value, dataPagamento: $('#rv-dp').value,
      localBuscaId, tipoId: st.tipoId, pesoDec: c.peso, precoSacaCentavos: c.preco, sacasUnid: C.sacasPagaveis(c.peso, cfg), totalCentavos: c.total,
      romaneioIds: st.origem === 'romaneio' ? [...st.romaneioIds] : [], origem: st.origem, buscado: st.origem !== 'buscar',
      partilhas: c.partilhas, obs: $('#rv-obs').value, cancelado: false, criadoEm: new Date().toISOString(), criadoPor: db.usuario.nome,
    };
    db.rvs.push(rv);
    if (rv.buscado) db.movimentos.push({ id: D.uid(), data: rv.dataCompra, pessoaId: rv.vendedorId, tipoId: rv.tipoId, localId: db.locais[0]?.id || '', tipo: 'venda', pesoDec: rv.pesoDec, romaneioId: '', rvId: rv.id, motivo: `RV ${rv.numero}`, criadoPor: db.usuario.nome });
    rv.romaneioIds.forEach((id) => { const r = db.romaneios.find((x) => x.id === id); if (r) r.status = 'comprado'; });
    criarLancamentosRV(rv);
    c.descs.forEach((d) => db.lancamentos.push({ id: D.uid(), data: rv.dataCompra, vencimento: rv.dataPagamento, pessoaId: rv.vendedorId, categoria: d.categoria, referencia: `RV ${rv.numero}`, descricao: d.descricao || CATEGORIAS[d.categoria], valorCentavos: d.cent, sinal: 'desconto', status: 'pendente', rvId: rv.id, romaneioId: '' }));
    D.auditar('criou', 'RV', rv.id, null, `RV ${rv.numero} · ${SC(rv.pesoDec)} · ${R(rv.totalCentavos)}`);
    gravar(`RV ${rv.numero} registrado.`);
    const imp = $('#rv-imp').checked;
    ir('rv/' + rv.id);
    if (imp) imprimir(DOC.rvDoc(rv), 'A5');
  });
}

function criarLancamentosRV(rv) {
  const t = D.tipo(rv.tipoId);
  rv.partilhas.forEach((p) => {
    const pct = rv.partilhas.length > 1 ? ` (${String(p.percentual).replace('.', ',')}%)` : '';
    D.db.lancamentos.push({ id: D.uid(), data: rv.dataCompra, vencimento: rv.dataPagamento, pessoaId: p.pessoaId, categoria: 'acerto', referencia: `RV ${rv.numero}` + pct, descricao: `${SC(rv.pesoDec)} ${D.nomeTipo(t)} a ${R(rv.precoSacaCentavos)}/sc`, valorCentavos: p.valorCentavos, sinal: 'credito', status: 'pendente', rvId: rv.id, romaneioId: '' });
  });
}

function rvVer(id) {
  const db = D.db, cfg = db.config;
  const rv = db.rvs.find((r) => r.id === id);
  if (!rv) { app.innerHTML = '<div class="cartao vazio">RV não encontrado.</div>'; return; }
  const st = D.statusRV(rv);
  const lancs = db.lancamentos.filter((l) => l.rvId === rv.id);
  const temBaixa = lancs.some((l) => D.baixasDe(l.id).length);
  const lb = D.localBusca(rv.localBuscaId);
  const roms = rv.romaneioIds.map((x) => db.romaneios.find((r) => r.id === x)).filter(Boolean);
  app.innerHTML = `<div class="cab"><div><h1>RV ${rv.numero}</h1><p>${selo(st, STATUS_RV[st])} ${rv.cancelado ? '· ' + esc(rv.cancelMotivo) : ''}</p></div>
    <div class="acoes"><button class="btn" id="imp">Imprimir comprovante (A5)</button>
      ${st === 'comprado' ? '<button class="btn ouro" data-escrita id="busca">Registrar busca</button>' : ''}
      ${!rv.cancelado && !temBaixa ? '<button class="btn perigo" data-escrita id="cancelar">Cancelar RV</button>' : ''}</div></div>
    <div class="grade g2">
      <div class="cartao"><h2>Compra</h2><table><tbody>
        <tr><td>Vendedor</td><td><a href="#/pessoa/${rv.vendedorId}">${esc(D.nomePessoa(D.pessoa(rv.vendedorId)))}</a></td></tr>
        <tr><td>Data da compra</td><td>${data(rv.dataCompra)}</td></tr>
        <tr><td>Data do pagamento</td><td>${data(rv.dataPagamento)}</td></tr>
        <tr><td>Café</td><td>${esc(D.nomeTipo(D.tipo(rv.tipoId)))}</td></tr>
        <tr><td>Quantidade</td><td>${SC(rv.pesoDec)} · ${KG(rv.pesoDec)}</td></tr>
        <tr><td>Sacas pagáveis</td><td>${C.formatarSacasDecimais(rv.sacasUnid, cfg.casasSacas)}</td></tr>
        <tr><td>Valor da saca</td><td>${R(rv.precoSacaCentavos)}</td></tr>
        <tr><td><b>Total</b></td><td><b>${R(rv.totalCentavos)}</b></td></tr>
        <tr><td>Local de busca</td><td>${lb ? esc(`${lb.nome} · ${lb.comunidade}, ${lb.municipio}`) + (lb.referencia ? `<div class="peq muted">${esc(lb.referencia)}</div>` : '') : rv.origem === 'saldo' ? 'Já estava guardado no armazém' : '-'}</td></tr>
        <tr><td>Romaneios</td><td>${roms.map((r) => `<a href="#/romaneio/${r.id}">${D.fmtNum(r.numero)}</a>`).join(', ') || '-'}</td></tr>
        ${rv.obs ? `<tr><td>Obs.</td><td>${esc(rv.obs)}</td></tr>` : ''}
      </tbody></table></div>
      <div class="cartao"><h2>Lançamentos gerados</h2>
        ${pode('financeiro') ? `<table><thead><tr><th>Para</th><th>Ref.</th><th class="num">Valor</th><th>Status</th></tr></thead><tbody>
        ${lancs.map((l) => `<tr class="${l.status === 'cancelado' ? 'cancelado' : ''}"><td>${esc(D.nomePessoa(D.pessoa(l.pessoaId), true))}</td><td>${esc(l.referencia)}${l.sinal === 'desconto' ? ' · ' + esc(l.descricao) : ''}</td><td class="num ${l.sinal === 'desconto' ? 'neg' : ''}">${l.sinal === 'desconto' ? '-' : ''}${R(l.valorCentavos)}</td><td>${selo(l.status, STATUS_LANC[l.status])}</td></tr>`).join('')}
        </tbody></table><p class="peq" style="margin:8px 0 0"><a href="#/pendencias">Ir para pendências</a></p>` : '<p class="muted">Valores a pagar: só Financeiro e Administrador.</p>'}
      </div>
    </div>
    ${anexosHtml('rv', rv.id)}`;
  app.querySelector('#imp').onclick = () => imprimir(DOC.rvDoc(rv), 'A5');
  app.querySelector('#cancelar')?.addEventListener('click', async () => {
    const motivo = await pedirMotivo(`Cancelar RV ${rv.numero}`, 'Os lançamentos saem das pendências e o café volta ao saldo do vendedor.');
    if (!motivo) return;
    rv.cancelado = true; rv.cancelMotivo = motivo;
    lancs.forEach((l) => { l.status = 'cancelado'; l.cancelMotivo = `RV cancelado: ${motivo}`; });
    db.movimentos.filter((m) => m.rvId === rv.id).forEach((m) => { m.cancelado = true; });
    roms.forEach((r) => { if (r.status === 'comprado') r.status = r.tipoId ? 'classificado' : 'aberto'; });
    D.auditar('cancelou', 'RV', rv.id, null, `RV ${rv.numero}: ${motivo}`);
    gravar('RV cancelado.'); render();
  });
  app.querySelector('#busca')?.addEventListener('click', () => modalBusca(rv));
}

function modalBusca(rv) {
  const db = D.db, cfg = db.config;
  const roms = db.romaneios.filter((r) => r.pessoaId === rv.vendedorId && r.status !== 'cancelado' && !db.rvs.some((v) => !v.cancelado && v.romaneioIds.includes(r.id)));
  const semBaixa = db.lancamentos.filter((l) => l.rvId === rv.id).every((l) => !D.baixasDe(l.id).length);
  abrirModal(`<h2>Registrar busca do RV ${rv.numero}</h2>
    <p class="muted">Marque o romaneio da pesagem quando o café chegou. Se ainda não lançou, <a href="#/romaneio/novo?pessoa=${rv.vendedorId}">lance o romaneio</a> e volte aqui.</p>
    ${roms.length ? roms.map((r) => `<label class="check" style="padding:4px 0"><input type="checkbox" data-rom="${r.id}"> Nº ${D.fmtNum(r.numero)} · ${data(r.data)} · ${SC(r.totais.liquidoDec)}</label>`).join('') : '<p class="erro">Nenhum romaneio do vendedor sem RV.</p>'}
    ${semBaixa ? '<label class="check" style="margin-top:10px"><input type="checkbox" id="bs-peso" checked> Recalcular o valor pelo peso da balança</label>' : ''}
    <div id="bs-info" class="peq" style="margin-top:8px"></div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="bs-ok" ${roms.length ? '' : 'disabled'}>Confirmar busca</button></div>`,
  { aoAbrir: (cx) => {
    const sel = () => [...cx.querySelectorAll('[data-rom]:checked')].map((c) => db.romaneios.find((r) => r.id === c.dataset.rom));
    cx.addEventListener('change', () => {
      const peso = sel().reduce((s, r) => s + r.totais.liquidoDec, 0);
      cx.querySelector('#bs-info').innerHTML = peso ? `Comprado: ${SC(rv.pesoDec)} · Pesado: <b>${SC(peso)}</b> · Novo total: <b>${R(C.valorCompra(peso, rv.precoSacaCentavos, cfg))}</b>` : '';
    });
    cx.querySelector('#bs-ok').onclick = () => {
      const rs = sel();
      if (!rs.length) return aviso('Marque o romaneio.');
      const peso = rs.reduce((s, r) => s + r.totais.liquidoDec, 0);
      const antes = { peso: rv.pesoDec, total: rv.totalCentavos };
      rv.romaneioIds = rs.map((r) => r.id); rv.buscado = true;
      rs.forEach((r) => { r.status = 'comprado'; });
      if (cx.querySelector('#bs-peso')?.checked) {
        rv.pesoDec = peso; rv.sacasUnid = C.sacasPagaveis(peso, cfg); rv.totalCentavos = C.valorCompra(peso, rv.precoSacaCentavos, cfg);
        rv.partilhas = C.partilhar(rv.totalCentavos, rv.partilhas);
        db.lancamentos.filter((l) => l.rvId === rv.id && l.sinal === 'credito').forEach((l) => { l.status = 'cancelado'; l.cancelMotivo = 'Recalculado pelo peso da balança'; });
        criarLancamentosRV(rv);
      }
      db.movimentos.push({ id: D.uid(), data: hoje(), pessoaId: rv.vendedorId, tipoId: rv.tipoId, localId: rs[0].localId, tipo: 'venda', pesoDec: rv.pesoDec, romaneioId: '', rvId: rv.id, motivo: `RV ${rv.numero}`, criadoPor: db.usuario.nome });
      D.auditar('registrou busca', 'RV', rv.id, antes, { peso: rv.pesoDec, total: rv.totalCentavos, romaneios: rs.map((r) => r.numero) });
      gravar('Busca registrada.'); fecharModal(); render();
    };
  } });
}

// =====================================================================
// PENDÊNCIAS
// =====================================================================
function emRelacaoAberta(l) { return D.db.relacoes.find((r) => r.status === 'aberta' && r.itens.some((i) => i.lancamentoIds.includes(l.id))); }

function agruparPorPessoa(lista) {
  const g = {};
  lista.forEach((l) => { (g[l.pessoaId] ||= []).push(l); });
  return Object.entries(g).map(([pid, ls]) => {
    const itens = ls.map((l) => ({ ...l, aberto: ['pendente', 'parcial'].includes(l.status) ? aberto(l) : l.valorCentavos }));
    const liquido = itens.reduce((s, l) => s + (l.status === 'cancelado' ? 0 : (l.sinal === 'desconto' ? -l.aberto : l.aberto)), 0);
    return { pessoa: D.pessoa(pid), lancs: itens.sort((a, b) => a.vencimento.localeCompare(b.vencimento)), liquido };
  }).sort((a, b) => (a.pessoa?.nome || '').localeCompare(b.pessoa?.nome || ''));
}

function pendencias() {
  const db = D.db;
  const f = { st: params.get('st') ?? 'abertos', q: params.get('q') || '', cat: params.get('cat') || '', ate: params.get('ate') || '' };
  let lista = db.lancamentos.slice();
  if (f.st === 'abertos') lista = lista.filter((l) => ['pendente', 'parcial'].includes(l.status));
  else if (f.st === 'vencidos') lista = lista.filter(vencido);
  else if (f.st && f.st !== 'todos') lista = lista.filter((l) => l.status === f.st);
  if (f.q) { const q = f.q.toLowerCase(); lista = lista.filter((l) => D.nomePessoa(D.pessoa(l.pessoaId)).toLowerCase().includes(q) || l.referencia.toLowerCase().includes(q) || l.descricao.toLowerCase().includes(q)); }
  if (f.cat) lista = lista.filter((l) => l.categoria === f.cat);
  if (f.ate) lista = lista.filter((l) => l.vencimento <= f.ate);
  const grupos = agruparPorPessoa(lista);
  const escrita = pode('escrita');

  app.innerHTML = `${dlPessoas()}<div class="cab"><div><h1>Pendências e acertos</h1><p>A planilha, agrupada por pessoa. Desconto marcado aqui sai sozinho no próximo acerto.</p></div>
    <div class="acoes"><button class="btn" id="imp">Imprimir lista</button><button class="btn prim" data-escrita id="novo">Novo lançamento</button></div></div>
    <div class="cartao"><form class="filtros" id="filtros">
      <label class="campo"><span>Mostrar</span><select name="st">${opts([['abertos', 'Em aberto'], ['vencidos', 'Vencidos'], ['pago', 'Pagos'], ['cancelado', 'Cancelados'], ['todos', 'Todos']], f.st, (x) => x[1], (x) => x[0])}</select></label>
      <label class="campo"><span>Buscar</span><input type="search" name="q" value="${esc(f.q)}" placeholder="pessoa, RV, nota"></label>
      <label class="campo"><span>Categoria</span><select name="cat">${opts(Object.entries(CATEGORIAS), f.cat, (x) => x[1], (x) => x[0], 'Todas')}</select></label>
      <label class="campo"><span>Vence até</span><input type="date" name="ate" value="${f.ate}"></label>
      <button class="btn">Filtrar</button></form>
      <div class="acoes" id="barra-sel" style="margin-bottom:10px;${escrita ? '' : 'display:none'}">
        <span class="peq" id="sel-info">Marque os lançamentos a pagar.</span>
        <button class="btn peq ouro" id="gerar-rel" disabled>Gerar relação de pagamentos</button>
        <button class="btn peq" id="baixa-sel" disabled>Dar baixa nos marcados</button>
      </div>
      ${grupos.length ? `<div class="rolar"><table><thead><tr><th></th><th>Data</th><th>Ref.</th><th>Descrição</th><th>Venc.</th><th class="num">Valor</th><th class="num">Em aberto</th><th>Status</th><th></th></tr></thead><tbody>
      ${grupos.map((g) => {
        const podeMarcar = (l) => escrita && l.sinal === 'credito' && ['pendente', 'parcial'].includes(l.status) && !emRelacaoAberta(l);
        return `<tr class="grupo"><td>${g.lancs.some(podeMarcar) ? `<input type="checkbox" data-grupo="${g.pessoa?.id}" aria-label="Marcar todos de ${esc(g.pessoa?.nome)}">` : ''}</td><td colspan="8"><a href="#/pessoa/${g.pessoa?.id}">${esc(D.nomePessoa(g.pessoa))}</a></td></tr>` +
        g.lancs.map((l) => { const rel = emRelacaoAberta(l); return `<tr class="${l.status === 'cancelado' ? 'cancelado' : ''}">
          <td>${podeMarcar(l) ? `<input type="checkbox" data-sel="${l.id}" data-p="${l.pessoaId}" data-v="${l.aberto}" aria-label="Marcar">` : ''}</td>
          <td>${data(l.data)}</td><td>${esc(l.referencia)}</td><td>${esc(l.descricao)} <span class="peq muted">· ${esc(CATEGORIAS[l.categoria] || l.categoria)}</span>${l.sinal === 'desconto' && ['pendente', 'parcial'].includes(l.status) ? ' <span class="selo pendente">DESCONTAR</span>' : ''}${rel ? ` <a class="selo aberta" href="#/relacao/${rel.id}">na relação ${rel.numero}</a>` : ''}</td>
          <td class="${vencido(l) ? 'neg' : ''}">${data(l.vencimento)}</td>
          <td class="num ${l.sinal === 'desconto' ? 'neg' : ''}">${l.sinal === 'desconto' ? '-' : ''}${R(l.valorCentavos)}</td>
          <td class="num">${['pendente', 'parcial'].includes(l.status) ? (l.sinal === 'desconto' ? '-' : '') + R(l.aberto) : ''}</td>
          <td>${selo(vencido(l) ? 'vencido' : l.status, vencido(l) ? 'Vencido' : STATUS_LANC[l.status])}</td>
          <td class="num">${escrita && ['pendente', 'parcial'].includes(l.status) && !rel ? `<button class="btn peq" data-baixa="${l.id}">${l.sinal === 'desconto' ? 'Compensar' : 'Baixa'}</button> <button class="btn peq perigo" data-canc="${l.id}" aria-label="Cancelar lançamento">×</button>` : ''}</td></tr>`; }).join('') +
        `<tr class="subtotal"><td></td><td colspan="5">Total ${esc(g.pessoa?.apelido || g.pessoa?.nome || '')}${f.st === 'abertos' || f.st === 'vencidos' ? ' (créditos − descontos)' : ''}</td><td class="num">${R(g.liquido)}</td><td colspan="2"></td></tr>`;
      }).join('')}
      </tbody><tfoot><tr><td></td><td colspan="5">Total geral</td><td class="num">${R(grupos.reduce((s, g) => s + g.liquido, 0))}</td><td colspan="2"></td></tr></tfoot></table></div>` : '<div class="vazio">Nada com esse filtro.</div>'}
    </div>`;
  ligarFiltros('pendencias');
  app.querySelector('#imp').onclick = () => imprimir(DOC.pendenciasDoc(grupos, `${{ abertos: 'Em aberto', vencidos: 'Vencidos', pago: 'Pagos', cancelado: 'Cancelados', todos: 'Todos' }[f.st]} em ${data(hoje())}`));
  app.querySelector('#novo').onclick = () => modalLancamento();
  const atualizarSel = () => {
    const sel = [...app.querySelectorAll('[data-sel]:checked')];
    const soma = sel.reduce((s, c) => s + Number(c.dataset.v), 0);
    const pessoasSel = new Set(sel.map((c) => c.dataset.p)).size;
    app.querySelector('#sel-info').textContent = sel.length ? `${sel.length} marcados · ${pessoasSel} pessoa(s) · ${R(soma)}` : 'Marque os lançamentos a pagar.';
    app.querySelector('#gerar-rel').disabled = !sel.length;
    app.querySelector('#baixa-sel').disabled = !sel.length;
  };
  app.querySelectorAll('[data-grupo]').forEach((g) => g.addEventListener('change', () => { app.querySelectorAll(`[data-sel][data-p="${g.dataset.grupo}"]`).forEach((c) => { c.checked = g.checked; }); atualizarSel(); }));
  app.querySelectorAll('[data-sel]').forEach((c) => c.addEventListener('change', atualizarSel));
  const marcados = () => [...app.querySelectorAll('[data-sel]:checked')].map((c) => db.lancamentos.find((l) => l.id === c.dataset.sel));
  app.querySelector('#gerar-rel').onclick = () => modalGerarRelacao(marcados());
  app.querySelector('#baixa-sel').onclick = () => modalBaixa(marcados());
  app.querySelectorAll('[data-baixa]').forEach((b) => b.onclick = () => modalBaixa([db.lancamentos.find((l) => l.id === b.dataset.baixa)]));
  app.querySelectorAll('[data-canc]').forEach((b) => b.onclick = async () => {
    const l = db.lancamentos.find((x) => x.id === b.dataset.canc);
    const motivo = await pedirMotivo('Cancelar lançamento', `${l.referencia} · ${l.descricao} · ${R(l.valorCentavos)}.`);
    if (!motivo) return;
    l.status = 'cancelado'; l.cancelMotivo = motivo;
    D.auditar('cancelou', 'lançamento', l.id, null, `${l.referencia}: ${motivo}`);
    gravar('Lançamento cancelado.'); render();
  });
}

function modalLancamento(pessoaId = '') {
  abrirModal(`${dlPessoas()}<h2>Novo lançamento</h2>
    <div class="radio-linha" style="margin-bottom:12px">
      <label><input type="radio" name="sinal" value="credito" checked> A pagar para a pessoa</label>
      <label><input type="radio" name="sinal" value="desconto"> Descontar da pessoa</label>
    </div>
    <div class="campos">
      ${campoPessoa('ln-p', pessoaId, 'Favorecido / pessoa', 'largo')}
      <label class="campo"><span>Categoria</span><select id="ln-cat">${opts(Object.entries(CATEGORIAS), 'frete', (x) => x[1], (x) => x[0])}</select></label>
      <label class="campo"><span>Referência</span><input id="ln-ref" placeholder="RV, nota, boleto"></label>
      <label class="campo largo"><span>Descrição</span><input id="ln-desc" placeholder="ex.: 04 viagens fretes"></label>
      <label class="campo"><span>Valor (R$)</span><input id="ln-val" inputmode="decimal"></label>
      <label class="campo"><span>Data</span><input type="date" id="ln-d" value="${hoje()}"></label>
      <label class="campo"><span>Vencimento</span><input type="date" id="ln-v" value="${hoje()}"></label>
    </div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="ln-ok">Lançar</button></div>`,
  { aoAbrir: (cx) => cx.querySelector('#ln-ok').onclick = () => {
    const p = lerPessoa(cx.querySelector('#ln-p').value);
    const v = C.reaisParaCentavos(cx.querySelector('#ln-val').value);
    if (!p) return aviso('Escolha a pessoa (cadastre antes em Pessoas, se for nova).');
    if (!v || !Number.isFinite(v) || v < 0) return aviso('Informe o valor.');
    const l = { id: D.uid(), data: cx.querySelector('#ln-d').value, vencimento: cx.querySelector('#ln-v').value, pessoaId: p.id, categoria: cx.querySelector('#ln-cat').value, referencia: cx.querySelector('#ln-ref').value, descricao: cx.querySelector('#ln-desc').value, valorCentavos: v, sinal: cx.querySelector('[name=sinal]:checked').value, status: 'pendente', rvId: '', romaneioId: '' };
    D.db.lancamentos.push(l);
    D.auditar('lançou', 'lançamento', l.id, null, `${D.nomePessoa(p, true)} · ${l.sinal === 'desconto' ? '-' : ''}${R(v)} · ${l.descricao}`);
    gravar('Lançamento criado.'); fecharModal(); render();
  } });
}

function modalBaixa(lancs) {
  const db = D.db;
  const um = lancs.length === 1 ? lancs[0] : null;
  const contas = um ? db.contas.filter((c) => c.pessoaId === um.pessoaId) : [];
  const total = lancs.reduce((s, l) => s + aberto(l), 0);
  abrirModal(`<h2>${um?.sinal === 'desconto' ? 'Compensar desconto' : 'Dar baixa'}</h2>
    <p class="muted">${um ? `${esc(D.nomePessoa(D.pessoa(um.pessoaId), true))} · ${esc(um.referencia)} · em aberto ${R(aberto(um))}` : `${lancs.length} lançamentos · ${R(total)} (cada um pelo valor em aberto)`}</p>
    <div class="campos">
      <label class="campo"><span>Data do pagamento</span><input type="date" id="bx-d" value="${hoje()}"></label>
      ${um ? `<label class="campo"><span>Valor pago</span><input id="bx-v" inputmode="decimal" value="${(aberto(um) / 100).toFixed(2).replace('.', ',')}"><small>Menos que o total deixa o restante em aberto.</small></label>` : ''}
      <label class="campo"><span>Forma</span><select id="bx-f">${opts(um?.sinal === 'desconto' ? ['Compensação', ...FORMAS] : FORMAS, '', (x) => x, (x) => x)}</select></label>
      ${um && contas.length && pode('sensivel') ? `<label class="campo largo"><span>Conta usada</span><select id="bx-c">${opts(contas, D.contaPadrao(um.pessoaId)?.id, (c) => `${c.bancoNome} · ag ${c.agencia} · cc ${c.conta}${c.pixChave ? ' · PIX ' + c.pixChave : ''}`, (c) => c.id, '-')}</select></label>` : ''}
      <label class="campo largo"><span>Comprovante (opcional)</span><input type="file" id="bx-arq" accept="image/*,application/pdf"></label>
    </div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="bx-ok">Confirmar baixa</button></div>`,
  { aoAbrir: (cx) => cx.querySelector('#bx-ok').onclick = () => {
    const dt = cx.querySelector('#bx-d').value, forma = cx.querySelector('#bx-f').value;
    const arq = cx.querySelector('#bx-arq').files[0]?.name || '';
    for (const l of lancs) {
      const valor = um ? C.reaisParaCentavos(cx.querySelector('#bx-v').value) : aberto(l);
      if (!valor || !Number.isFinite(valor) || valor <= 0 || valor > aberto(l)) return aviso('Valor inválido: precisa ser maior que zero e até o valor em aberto.');
      db.baixas.push({ id: D.uid(), lancamentoId: l.id, data: dt, valorCentavos: valor, forma, contaId: cx.querySelector('#bx-c')?.value || D.contaPadrao(l.pessoaId)?.id || '', comprovante: arq, relacaoId: '', criadoPor: db.usuario.nome });
      D.atualizarStatusLanc(l);
      D.auditar('deu baixa', 'lançamento', l.id, null, `${l.referencia} · ${R(valor)} · ${forma}`);
      if (arq) db.anexos.push({ id: D.uid(), entidade: 'lancamento', entidadeId: l.id, nome: arq, tipo: 'Comprovante de pagamento', descricao: '', em: new Date().toISOString() });
    }
    gravar(lancs.length > 1 ? `${lancs.length} baixas registradas.` : 'Baixa registrada.'); fecharModal(); render();
  } });
}

// =====================================================================
// RELAÇÃO DE PAGAMENTOS
// =====================================================================
function modalGerarRelacao(creditos) {
  const db = D.db;
  const porPessoa = {};
  creditos.forEach((l) => { (porPessoa[l.pessoaId] ||= []).push(l); });
  const montar = (abater) => Object.entries(porPessoa).map(([pid, ls]) => {
    const descs = abater ? db.lancamentos.filter((l) => l.pessoaId === pid && l.sinal === 'desconto' && ['pendente', 'parcial'].includes(l.status) && !emRelacaoAberta(l)) : [];
    const cred = ls.reduce((s, l) => s + aberto(l), 0);
    const desc = descs.reduce((s, l) => s + aberto(l), 0);
    return { pessoaId: pid, creditos: ls, descontos: descs, cred, desc, valor: cred - desc, conta: D.contaPadrao(pid) };
  });
  abrirModal(`<h2>Relação para pagamentos</h2>
    <div class="campos"><label class="campo"><span>Data</span><input type="date" id="rl-d" value="${hoje()}"></label>
      <label class="campo check" style="align-self:end"><input type="checkbox" id="rl-ab" checked> <span style="font-weight:400">Abater os descontos pendentes de cada pessoa</span></label></div>
    <div id="rl-tab" class="rolar" style="margin-top:12px"></div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="rl-ok">Gerar relação</button></div>`,
  { largo: true, aoAbrir: (cx) => {
    const desenhar = () => {
      const itens = montar(cx.querySelector('#rl-ab').checked);
      cx.querySelector('#rl-tab').innerHTML = `<table><thead><tr><th>Favorecido</th><th>Conta / PIX</th><th class="num">Créditos</th><th class="num">Descontos</th><th class="num">A pagar</th></tr></thead><tbody>
        ${itens.map((i) => `<tr><td>${esc(D.nomePessoa(D.pessoa(i.pessoaId), true))}</td><td class="peq">${i.conta ? (pode('sensivel') ? esc(`${i.conta.bancoNome} ${i.conta.agencia}/${i.conta.conta}${i.conta.pixChave ? ' · PIX' : ''}`) : 'cadastrada') : '<span class="neg">sem conta</span>'}</td><td class="num">${R(i.cred)}</td><td class="num neg">${i.desc ? '-' + R(i.desc) : ''}</td><td class="num ${i.valor <= 0 ? 'neg' : ''}"><b>${R(i.valor)}</b>${i.valor <= 0 ? '<div class="peq">fica de fora</div>' : ''}</td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="4">Total</td><td class="num">${R(itens.filter((i) => i.valor > 0).reduce((s, i) => s + i.valor, 0))}</td></tr></tfoot></table>`;
      return itens;
    };
    cx.querySelector('#rl-ab').onchange = desenhar;
    desenhar();
    cx.querySelector('#rl-ok').onclick = () => {
      const itens = desenhar().filter((i) => i.valor > 0);
      if (!itens.length) return aviso('Nada a pagar: os descontos cobrem os créditos.');
      const rel = {
        id: D.uid(), numero: db.config.proxRelacao++, data: cx.querySelector('#rl-d').value, status: 'aberta',
        itens: itens.map((i) => ({ pessoaId: i.pessoaId, contaId: i.conta?.id || '', lancamentoIds: [...i.creditos, ...i.descontos].map((l) => l.id), valorCentavos: i.valor })),
      };
      rel.totalCentavos = rel.itens.reduce((s, i) => s + i.valorCentavos, 0);
      db.relacoes.push(rel);
      D.auditar('gerou', 'relação de pagamentos', rel.id, null, `Nº ${rel.numero} · ${R(rel.totalCentavos)}`);
      gravar(`Relação ${rel.numero} gerada.`); fecharModal(); ir('relacao/' + rel.id);
    };
  } });
}

function relacoes() {
  const lista = D.db.relacoes.slice().sort((a, b) => b.numero - a.numero);
  app.innerHTML = `<div class="cab"><div><h1>Relação de pagamentos</h1><p>A lista do dia com os dados bancários, pronta para o banco. Gere a partir das <a href="#/pendencias">pendências</a>.</p></div></div>
    <div class="cartao">${lista.length ? `<div class="rolar"><table><thead><tr><th>Nº</th><th>Data</th><th>Pessoas</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>
      ${lista.map((r) => `<tr class="clicavel ${r.status === 'cancelada' ? 'cancelado' : ''}" data-href="relacao/${r.id}"><td>${r.numero}</td><td>${data(r.data)}</td><td>${r.itens.length}</td><td class="num">${R(r.totalCentavos)}</td><td>${selo(r.status, { aberta: 'Aguardando pagamento', confirmada: 'Paga', cancelada: 'Desfeita' }[r.status])}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="vazio">Nenhuma relação ainda. Vá em Pendências, marque o que vai pagar e clique em "Gerar relação de pagamentos".</div>'}</div>`;
  ligarLinhas();
}

function relacaoVer(id) {
  const db = D.db;
  const rel = db.relacoes.find((r) => r.id === id);
  if (!rel) { app.innerHTML = '<div class="cartao vazio">Relação não encontrada.</div>'; return; }
  app.innerHTML = `<div class="cab"><div><h1>Relação nº ${rel.numero}</h1><p>${selo(rel.status, { aberta: 'Aguardando pagamento', confirmada: 'Paga', cancelada: 'Desfeita' }[rel.status])} · ${rel.itens.length} pessoas · ${R(rel.totalCentavos)}</p></div>
    <div class="acoes"><button class="btn" id="imp">Imprimir / PDF (A4)</button>
    ${rel.status === 'aberta' ? '<button class="btn perigo" data-escrita id="desfazer">Desfazer</button><button class="btn prim" data-escrita id="confirmar">Confirmar pagamentos da relação</button>' : ''}</div></div>
    ${rel.status === 'aberta' ? '<p class="nota">Faça as transferências pelo banco e depois clique em <b>Confirmar pagamentos</b>: todos os lançamentos da relação recebem baixa de uma vez, e os descontos ficam compensados.</p>' : ''}
    <div class="cartao rolar"><div id="doc"></div></div>`;
  app.querySelector('#doc').innerHTML = DOC.relacaoDoc(rel);
  app.querySelector('#imp').onclick = () => imprimir(DOC.relacaoDoc(rel));
  app.querySelector('#desfazer')?.addEventListener('click', async () => {
    const motivo = await pedirMotivo(`Desfazer relação ${rel.numero}`, 'Os lançamentos voltam a ficar livres nas pendências.');
    if (!motivo) return;
    rel.status = 'cancelada'; rel.cancelMotivo = motivo;
    D.auditar('desfez', 'relação de pagamentos', rel.id, null, motivo); gravar('Relação desfeita.'); render();
  });
  app.querySelector('#confirmar')?.addEventListener('click', () => {
    abrirModal(`<h2>Confirmar pagamentos</h2><p>Dar baixa em todos os lançamentos da relação ${rel.numero} (${R(rel.totalCentavos)}), com data:</p>
      <label class="campo"><span>Data</span><input type="date" id="cf-d" value="${rel.data}"></label>
      <div class="modal-rodape"><button class="btn" data-fechar>Voltar</button><button class="btn prim" id="cf-ok">Confirmar</button></div>`,
    { aoAbrir: (cx) => cx.querySelector('#cf-ok').onclick = () => {
      const dt = cx.querySelector('#cf-d').value;
      rel.itens.forEach((it) => {
        const conta = db.contas.find((c) => c.id === it.contaId);
        it.lancamentoIds.forEach((lid) => {
          const l = db.lancamentos.find((x) => x.id === lid);
          if (!l || !['pendente', 'parcial'].includes(l.status)) return;
          const v = aberto(l);
          if (v <= 0) return;
          db.baixas.push({ id: D.uid(), lancamentoId: l.id, data: dt, valorCentavos: v, forma: l.sinal === 'desconto' ? 'Compensação' : conta?.pixChave ? 'PIX' : 'TED', contaId: it.contaId, comprovante: '', relacaoId: rel.id, criadoPor: db.usuario.nome });
          D.atualizarStatusLanc(l);
        });
      });
      rel.status = 'confirmada'; rel.confirmadaEm = dt;
      D.auditar('confirmou pagamentos', 'relação de pagamentos', rel.id, null, `Nº ${rel.numero} · ${R(rel.totalCentavos)}`);
      gravar('Pagamentos confirmados.'); fecharModal(); render();
    } });
  });
}

// =====================================================================
// PESSOAS
// =====================================================================
function pessoas() {
  const db = D.db;
  const q = (params.get('q') || '').toLowerCase();
  let lista = db.pessoas.slice().sort((a, b) => a.nome.localeCompare(b.nome));
  if (q) lista = lista.filter((p) => D.nomePessoa(p).toLowerCase().includes(q) || (pode('sensivel') && (p.doc || '').includes(q)));
  app.innerHTML = `<div class="cab"><div><h1>Pessoas</h1><p>Produtores, parceiros, fornecedores e prestadores.</p></div>
    <button class="btn prim" data-escrita id="nova">Nova pessoa</button></div>
    <div class="cartao"><form class="filtros" id="filtros"><label class="campo" style="max-width:none"><span>Buscar</span><input type="search" name="q" value="${esc(params.get('q') || '')}" placeholder="nome, apelido${pode('sensivel') ? ' ou CPF' : ''}" autofocus></label><button class="btn">Buscar</button></form>
    ${lista.length ? `<div class="rolar"><table><thead><tr><th>Nome</th><th>Apelido</th><th>CPF/CNPJ</th><th>Telefone</th><th class="num">Café guardado</th>${pode('financeiro') ? '<th class="num">A receber (líquido)</th>' : ''}</tr></thead><tbody>
    ${lista.map((p) => { const liq = C.liquidoAPagar(db.lancamentos.filter((l) => l.pessoaId === p.id), db.baixas).liquido; return `<tr class="clicavel" data-href="pessoa/${p.id}"><td>${esc(p.nome)}</td><td>${esc(p.apelido)}</td><td>${doc(p.doc)}</td><td>${esc(p.telefone)}</td><td class="num">${SC(D.saldoPessoa(p.id))}</td>${pode('financeiro') ? `<td class="num ${liq < 0 ? 'neg' : ''}">${liq ? R(liq) : ''}</td>` : ''}</tr>`; }).join('')}
    </tbody></table></div>` : '<div class="vazio">Ninguém encontrado.</div>'}</div>`;
  ligarFiltros('pessoas');
  ligarLinhas();
  app.querySelector('#nova').onclick = () => modalPessoa();
}

function modalPessoa(p) {
  const novo = !p;
  p = p || { nome: '', apelido: '', doc: '', inscProdutor: '', telefone: '', endereco: '', obs: '' };
  abrirModal(`<h2>${novo ? 'Nova pessoa' : 'Editar cadastro'}</h2>
    <div class="campos">
      <label class="campo largo"><span>Nome completo</span><input id="ps-nome" value="${esc(p.nome)}"></label>
      <label class="campo"><span>Apelido</span><input id="ps-ap" value="${esc(p.apelido)}" placeholder="como é chamado"></label>
      ${pode('sensivel') || novo ? `<label class="campo"><span>CPF / CNPJ</span><input id="ps-doc" value="${esc(p.doc)}" inputmode="numeric"></label>` : ''}
      <label class="campo"><span>Inscrição de produtor</span><input id="ps-ins" value="${esc(p.inscProdutor)}"></label>
      <label class="campo"><span>Telefone / WhatsApp</span><input id="ps-tel" value="${esc(p.telefone)}" inputmode="tel"></label>
      <label class="campo largo"><span>Endereço / propriedade</span><input id="ps-end" value="${esc(p.endereco)}"></label>
      <label class="campo largo"><span>Observações</span><textarea id="ps-obs">${esc(p.obs)}</textarea></label>
    </div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="ps-ok">Salvar</button></div>`,
  { aoAbrir: (cx) => cx.querySelector('#ps-ok').onclick = () => {
    const v = (s) => cx.querySelector(s)?.value.trim();
    if (!v('#ps-nome')) return aviso('Informe o nome.');
    const dados = { nome: v('#ps-nome'), apelido: v('#ps-ap'), inscProdutor: v('#ps-ins'), telefone: v('#ps-tel'), endereco: v('#ps-end'), obs: v('#ps-obs') };
    if (cx.querySelector('#ps-doc')) dados.doc = v('#ps-doc');
    if (novo) {
      const np = { id: D.uid(), doc: '', ativo: true, ...dados };
      D.db.pessoas.push(np); D.auditar('cadastrou', 'pessoa', np.id, null, np.nome); gravar('Pessoa cadastrada.'); fecharModal(); ir('pessoa/' + np.id);
    } else {
      const antes = { ...p }; Object.assign(p, dados); D.auditar('alterou', 'pessoa', p.id, { nome: antes.nome, apelido: antes.apelido }, { nome: p.nome, apelido: p.apelido }); gravar('Cadastro salvo.'); fecharModal(); render();
    }
  } });
}

function pessoaVer(id) {
  const db = D.db;
  const p = D.pessoa(id);
  if (!p) { app.innerHTML = '<div class="cartao vazio">Pessoa não encontrada.</div>'; return; }
  const contas = db.contas.filter((c) => c.pessoaId === id);
  const parcs = db.parcerias.filter((x) => x.titularId === id || x.parceiroId === id);
  const tipos = [...new Set(db.movimentos.filter((m) => m.pessoaId === id).map((m) => m.tipoId))];
  const lancs = db.lancamentos.filter((l) => l.pessoaId === id && ['pendente', 'parcial'].includes(l.status));
  const liq = C.liquidoAPagar(lancs, db.baixas);
  const roms = db.romaneios.filter((r) => r.pessoaId === id).sort((a, b) => b.numero - a.numero);
  const rvs = db.rvs.filter((r) => r.vendedorId === id).sort((a, b) => b.numero - a.numero);
  const escrita = pode('escrita');
  app.innerHTML = `${dlPessoas()}<div class="cab"><div><h1>${esc(p.nome)}</h1><p>${p.apelido ? `"${esc(p.apelido)}" · ` : ''}${doc(p.doc) || 'sem CPF/CNPJ'}${p.telefone ? ' · ' + esc(p.telefone) : ''}</p></div>
    <div class="acoes"><button class="btn" id="extrato">Extrato PDF</button>
      ${escrita && pode('romaneio') ? `<a class="btn" href="#/romaneio/novo?pessoa=${id}">Novo romaneio</a>` : ''}
      ${escrita && pode('rv') ? `<a class="btn ouro" href="#/rv/novo?pessoa=${id}">Nova compra (RV)</a>` : ''}
      ${escrita ? '<button class="btn" id="editar">Editar cadastro</button>' : ''}</div></div>
    <div class="grade g3" style="margin-bottom:16px">
      <div class="kpi"><b>${SC(D.saldoPessoa(id))}</b><span>café guardado</span></div>
      ${pode('financeiro') ? `<div class="kpi"><b>${R(liq.creditos)}</b><span>a receber</span></div><div class="kpi"><b class="${liq.liquido < 0 ? 'neg' : ''}">${R(liq.liquido)}</b><span>líquido (descontos de ${R(liq.descontos)})</span></div>` : ''}
    </div>
    <div class="grade g2">
      <div class="cartao"><h2>Café por tipo</h2>${tipos.length ? `<table><tbody>${tipos.map((t) => `<tr><td>${esc(D.nomeTipo(D.tipo(t)) || 'Sem classificação')}</td><td class="num">${SC(D.saldoPessoa(id, t))}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Sem movimentos.</p>'}
        ${p.endereco || p.inscProdutor || p.obs ? `<h3 style="margin-top:14px">Cadastro</h3><p class="peq" style="margin:0">${p.endereco ? esc(p.endereco) + '<br>' : ''}${p.inscProdutor ? 'Inscrição de produtor: ' + esc(p.inscProdutor) + '<br>' : ''}${esc(p.obs)}</p>` : ''}</div>
      <div class="cartao"><div class="cab" style="margin-bottom:8px"><h2>Parcerias / meação</h2>${escrita ? '<button class="btn peq" id="nova-parc">+ parceria</button>' : ''}</div>
        ${parcs.length ? `<table><tbody>${parcs.map((x) => x.titularId === id
          ? `<tr><td>Parceiro: <a href="#/pessoa/${x.parceiroId}">${esc(D.nomePessoa(D.pessoa(x.parceiroId), true))}</a></td><td class="num">${String(x.percentual).replace('.', ',')}% para o parceiro</td><td class="num">${escrita ? `<button class="btn peq perigo" data-tira-parc="${x.id}">Encerrar</button>` : ''}</td></tr>`
          : `<tr><td>Parceiro de <a href="#/pessoa/${x.titularId}">${esc(D.nomePessoa(D.pessoa(x.titularId), true))}</a></td><td class="num">${String(x.percentual).replace('.', ',')}%</td><td></td></tr>`).join('')}</tbody></table>` : '<p class="muted peq">Nenhuma. Quando houver, o RV divide o valor sozinho.</p>'}</div>
    </div>
    ${pode('sensivel') ? `<div class="cartao"><div class="cab" style="margin-bottom:8px"><h2>Dados bancários</h2>${escrita ? '<button class="btn peq" id="nova-conta">+ conta / PIX</button>' : ''}</div>
      ${contas.length ? `<div class="rolar"><table><thead><tr><th>Banco</th><th>Agência</th><th>Conta</th><th>Tipo</th><th>PIX</th><th>Titular</th><th></th></tr></thead><tbody>
      ${contas.map((c) => `<tr><td>${esc(c.bancoNome)} (${esc(c.bancoCodigo)})</td><td>${esc(c.agencia)}</td><td>${esc(c.conta)}</td><td>${c.tipo === 'poupanca' ? 'Poupança' : 'Corrente'}</td><td>${c.pixChave ? esc(c.pixTipo + ': ' + c.pixChave) : ''}</td><td>${esc(c.titular)}</td><td class="num">${c.padrao ? selo('pago', 'Padrão') : escrita ? `<button class="btn peq" data-padrao="${c.id}">Tornar padrão</button>` : ''}</td></tr>`).join('')}
      </tbody></table></div>` : '<p class="muted">Nenhuma conta. Sem conta, a relação de pagamentos sai com o aviso "sem dados bancários".</p>'}</div>`
    : '<div class="cartao"><p class="muted" style="margin:0">CPF e dados bancários aparecem só para Administrador e Financeiro (LGPD).</p></div>'}
    ${pode('financeiro') ? `<div class="cartao"><div class="cab" style="margin-bottom:8px"><h2>Pendências</h2>${escrita ? '<button class="btn peq" id="novo-lanc">+ lançamento</button>' : ''}</div>
      ${lancs.length ? `<div class="rolar"><table><tbody>${lancs.map((l) => `<tr><td>${data(l.vencimento)}</td><td>${esc(l.referencia)}</td><td>${esc(l.descricao)}</td><td class="num ${l.sinal === 'desconto' ? 'neg' : ''}">${l.sinal === 'desconto' ? '-' : ''}${R(aberto(l))}</td><td>${selo(vencido(l) ? 'vencido' : l.status, vencido(l) ? 'Vencido' : STATUS_LANC[l.status])}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nada em aberto.</p>'}</div>` : ''}
    <div class="grade g2">
      <div class="cartao"><h2>Romaneios</h2>${tabelaRomaneios(roms.slice(0, 10), true)}</div>
      <div class="cartao"><h2>Compras (RV)</h2>${rvs.length ? `<div class="rolar"><table><tbody>${rvs.map((r) => `<tr class="clicavel" data-href="rv/${r.id}"><td>RV ${r.numero}</td><td>${data(r.dataCompra)}</td><td class="num">${SC(r.pesoDec)}</td>${pode('financeiro') ? `<td class="num">${R(r.totalCentavos)}</td>` : ''}<td>${selo(D.statusRV(r), STATUS_RV[D.statusRV(r)])}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhuma.</p>'}</div>
    </div>
    ${anexosHtml('pessoa', id)}`;
  ligarLinhas();
  app.querySelector('#extrato').onclick = () => imprimir(DOC.extratoDoc(p));
  app.querySelector('#editar')?.addEventListener('click', () => modalPessoa(p));
  app.querySelector('#novo-lanc')?.addEventListener('click', () => modalLancamento(id));
  app.querySelectorAll('[data-padrao]').forEach((b) => b.onclick = () => { contas.forEach((c) => { c.padrao = c.id === b.dataset.padrao; }); D.auditar('alterou conta padrão', 'pessoa', id); gravar('Conta padrão alterada.'); render(); });
  app.querySelectorAll('[data-tira-parc]').forEach((b) => b.onclick = async () => {
    const motivo = await pedirMotivo('Encerrar parceria', 'Os RVs já registrados não mudam.');
    if (!motivo) return;
    const x = db.parcerias.find((y) => y.id === b.dataset.tiraParc);
    db.parcerias = db.parcerias.filter((y) => y !== x);
    D.auditar('encerrou parceria', 'pessoa', id, x, motivo); gravar('Parceria encerrada.'); render();
  });
  app.querySelector('#nova-parc')?.addEventListener('click', () => abrirModal(`${dlPessoas()}<h2>Nova parceria</h2><p class="muted">${esc(D.nomePessoa(p, true))} é o titular. Informe quanto vai para o parceiro.</p>
    <div class="campos">${campoPessoa('pc-p', '', 'Parceiro / meeiro', 'largo')}<label class="campo"><span>% do parceiro</span><input id="pc-pct" inputmode="decimal" placeholder="50"></label></div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="pc-ok">Salvar</button></div>`,
  { aoAbrir: (cx) => cx.querySelector('#pc-ok').onclick = () => {
    const q = lerPessoa(cx.querySelector('#pc-p').value);
    const pct = Number(cx.querySelector('#pc-pct').value.replace(',', '.'));
    const usado = db.parcerias.filter((x) => x.titularId === id).reduce((s, x) => s + Number(x.percentual), 0);
    if (!q || q.id === id) return aviso('Escolha o parceiro.');
    if (!(pct > 0 && pct + usado < 100)) return aviso(`Percentual inválido (já há ${usado}% com outros parceiros).`);
    const x = { id: D.uid(), titularId: id, parceiroId: q.id, percentual: pct };
    db.parcerias.push(x); D.auditar('criou parceria', 'pessoa', id, null, `${D.nomePessoa(q, true)} ${pct}%`); gravar('Parceria salva.'); fecharModal(); render();
  } }));
  app.querySelector('#nova-conta')?.addEventListener('click', () => abrirModal(`<h2>Nova conta / PIX</h2>
    <div class="campos">
      <label class="campo"><span>Banco</span><input id="cb-b" placeholder="Sicoob"></label>
      <label class="campo"><span>Código</span><input id="cb-c" inputmode="numeric" placeholder="756"></label>
      <label class="campo"><span>Agência</span><input id="cb-a"></label>
      <label class="campo"><span>Conta</span><input id="cb-n"></label>
      <label class="campo"><span>Tipo</span><select id="cb-t"><option value="corrente">Corrente</option><option value="poupanca">Poupança</option></select></label>
      <label class="campo"><span>Titular</span><input id="cb-ti" value="${esc(p.nome)}"></label>
      <label class="campo"><span>Tipo de chave PIX</span><select id="cb-pt"><option value="">-</option><option>CPF</option><option>CNPJ</option><option>Telefone</option><option>E-mail</option><option>Aleatória</option></select></label>
      <label class="campo"><span>Chave PIX</span><input id="cb-pk"></label>
      <label class="campo largo check"><input type="checkbox" id="cb-pd" ${contas.length ? '' : 'checked'}> <span style="font-weight:400">Usar como padrão nos pagamentos</span></label>
    </div>
    <div class="modal-rodape"><button class="btn" data-fechar>Cancelar</button><button class="btn prim" id="cb-ok">Salvar</button></div>`,
  { aoAbrir: (cx) => cx.querySelector('#cb-ok').onclick = () => {
    const v = (s) => cx.querySelector(s).value.trim();
    if (!(v('#cb-b') && v('#cb-n')) && !v('#cb-pk')) return aviso('Informe banco e conta, ou a chave PIX.');
    const c = { id: D.uid(), pessoaId: id, bancoNome: v('#cb-b'), bancoCodigo: v('#cb-c'), agencia: v('#cb-a'), conta: v('#cb-n'), tipo: v('#cb-t'), titular: v('#cb-ti'), pixTipo: v('#cb-pt'), pixChave: v('#cb-pk'), padrao: cx.querySelector('#cb-pd').checked };
    if (c.padrao) contas.forEach((x) => { x.padrao = false; });
    db.contas.push(c); D.auditar('cadastrou conta bancária', 'pessoa', id, null, c.bancoNome || 'PIX'); gravar('Conta salva.'); fecharModal(); render();
  } }));
}

// =====================================================================
// RELATÓRIOS
// =====================================================================
function relatorios() {
  const db = D.db;
  const de = params.get('de') || D.hojeISO(-30), ate = params.get('ate') || hoje();
  const noPer = (d) => d >= de && d <= ate;
  app.innerHTML = `<div class="cab"><div><h1>Relatórios</h1><p>Todos saem em PDF pelo "Salvar como PDF" da impressão.</p></div></div>
    <div class="cartao"><form class="filtros" id="filtros">
      <label class="campo"><span>De</span><input type="date" name="de" value="${de}"></label>
      <label class="campo"><span>Até</span><input type="date" name="ate" value="${ate}"></label><button class="btn">Aplicar</button></form></div>
    <div class="atalhos">
      ${pode('romaneio') ? '<button class="atalho" data-rel="rom"><strong>Romaneios do período</strong><span>Nº, produtor, café, peso</span></button><button class="atalho" data-rel="tipo"><strong>Entradas por tipo de café</strong><span>Somadas por bebida e tipo</span></button>' : ''}
      ${pode('estoque') ? '<button class="atalho" data-rel="estoque"><strong>Saldo de estoque por produtor</strong><span>Na data de hoje</span></button>' : ''}
      ${pode('financeiro') ? '<button class="atalho" data-rel="contas"><strong>Contas pagas e a pagar</strong><span>No período</span></button><button class="atalho" data-rel="cat"><strong>Pagamentos por categoria</strong><span>Fretes, honorários, acertos…</span></button>' : ''}
      <button class="atalho" data-rel="dia"><strong>Resumo do dia</strong><span>Para olhar no fim do expediente</span></button>
    </div>`;
  ligarFiltros('relatorios');
  const per = `${data(de)} a ${data(ate)}`;
  app.querySelectorAll('[data-rel]').forEach((b) => b.onclick = () => {
    const k = b.dataset.rel;
    if (k === 'dia') return imprimirResumoDia();
    if (k === 'rom') return imprimir(DOC.relatorioDoc('ROMANEIOS DO PERÍODO', per, tabelaRomaneiosDoc(db.romaneios.filter((r) => noPer(r.data)).sort((a, b) => a.numero - b.numero))));
    if (k === 'tipo') {
      const s = {};
      db.romaneios.filter((r) => noPer(r.data) && r.status !== 'cancelado').forEach((r) => { s[r.tipoId] = (s[r.tipoId] || 0) + r.totais.liquidoDec; });
      return imprimir(DOC.relatorioDoc('ENTRADAS POR TIPO DE CAFÉ', per, `<table><thead><tr><th>Café</th><th class="num">Sacas</th><th class="num">Quilos</th></tr></thead><tbody>${Object.entries(s).map(([t, v]) => `<tr><td>${esc(D.nomeTipo(D.tipo(t)) || 'Sem classificação')}</td><td class="num">${SC(v)}</td><td class="num">${KG(v)}</td></tr>`).join('')}</tbody></table>`));
    }
    if (k === 'estoque') { location.hash = '#/estoque'; return; }
    if (k === 'contas') {
      const pagas = db.baixas.filter((x) => noPer(x.data) && !x.estornada);
      const aPagar = db.lancamentos.filter((l) => ['pendente', 'parcial'].includes(l.status) && l.vencimento <= ate);
      return imprimir(DOC.relatorioDoc('CONTAS PAGAS E A PAGAR', per, `<h3>Pagas no período</h3><table><thead><tr><th>Data</th><th>Favorecido</th><th>Ref.</th><th>Forma</th><th class="num">Valor</th></tr></thead><tbody>
        ${pagas.map((x) => { const l = db.lancamentos.find((y) => y.id === x.lancamentoId); return `<tr><td>${data(x.data)}</td><td>${esc(D.nomePessoa(D.pessoa(l?.pessoaId)))}</td><td>${esc(l?.referencia)}</td><td>${esc(x.forma)}</td><td class="num">${l?.sinal === 'desconto' ? '-' : ''}${R(x.valorCentavos)}</td></tr>`; }).join('')}</tbody></table>
        <h3 style="margin-top:12px">A pagar (vencendo até ${data(ate)})</h3><table><thead><tr><th>Venc.</th><th>Favorecido</th><th>Ref.</th><th>Descrição</th><th class="num">Em aberto</th></tr></thead><tbody>
        ${aPagar.map((l) => `<tr><td>${data(l.vencimento)}</td><td>${esc(D.nomePessoa(D.pessoa(l.pessoaId)))}</td><td>${esc(l.referencia)}</td><td>${esc(l.descricao)}</td><td class="num">${l.sinal === 'desconto' ? '-' : ''}${R(aberto(l))}</td></tr>`).join('')}</tbody></table>`));
    }
    if (k === 'cat') {
      const s = {};
      db.baixas.filter((x) => noPer(x.data) && !x.estornada).forEach((x) => { const l = db.lancamentos.find((y) => y.id === x.lancamentoId); if (l?.sinal === 'credito') s[l.categoria] = (s[l.categoria] || 0) + x.valorCentavos; });
      return imprimir(DOC.relatorioDoc('PAGAMENTOS POR CATEGORIA', per, `<table><thead><tr><th>Categoria</th><th class="num">Pago</th></tr></thead><tbody>${Object.entries(s).map(([c, v]) => `<tr><td>${esc(CATEGORIAS[c] || c)}</td><td class="num">${R(v)}</td></tr>`).join('') || '<tr><td colspan="2">Nada pago no período</td></tr>'}</tbody><tfoot><tr><td>Total</td><td class="num">${R(Object.values(s).reduce((a, b) => a + b, 0))}</td></tr></tfoot></table>`));
    }
  });
}

// =====================================================================
// CONFIGURAÇÕES
// =====================================================================
function config() {
  const db = D.db, cfg = db.config;
  app.innerHTML = `<div class="cab"><div><h1>Configurações</h1><p>Regras de cálculo, numeração e tabelas.</p></div></div>
    <div class="grade g2">
      <div class="cartao"><h2>Regras de cálculo</h2>
        <div class="campos">
          <label class="campo"><span>Quilos por saca</span><input id="c-kg" inputmode="decimal" value="${String(cfg.kgPorSaca).replace('.', ',')}"></label>
          <label class="campo"><span>Tara por saco (kg)</span><input id="c-tara" inputmode="decimal" value="${String(cfg.taraPorSacoKg).replace('.', ',')}"></label>
          <label class="campo"><span>Sacas para pagamento</span><select id="c-arr"><option value="truncar" ${cfg.arredondamento === 'truncar' ? 'selected' : ''}>Truncar</option><option value="arredondar" ${cfg.arredondamento === 'arredondar' ? 'selected' : ''}>Arredondar</option></select></label>
          <label class="campo"><span>Casas decimais</span><select id="c-casas">${[0, 1, 2, 3, 4].map((n) => `<option ${cfg.casasSacas === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        </div>
        <h3 style="margin-top:16px">Desconto por umidade</h3>
        <div id="c-umid">${cfg.tabelaUmidade.map((f, i) => `<div class="campos" style="grid-template-columns:1fr 1fr 40px;margin-bottom:6px;align-items:end"><label class="campo"><span>Acima de (%)</span><input data-u-a="${i}" value="${String(f.acimaDe).replace('.', ',')}"></label><label class="campo"><span>Desconta do peso (%)</span><input data-u-d="${i}" value="${String(f.desconto).replace('.', ',')}"></label><button class="btn peq" data-u-x="${i}" aria-label="Tirar faixa">×</button></div>`).join('')}</div>
        <button class="btn peq" id="c-umid-mais">+ faixa</button>
        <div class="acoes" style="margin-top:16px"><button class="btn prim" id="c-salvar">Salvar regras</button></div>
        <p class="peq muted">Vale para os próximos romaneios e RVs. Os já registrados guardam o valor que tinham.</p>
      </div>
      <div class="cartao" style="border-color:#D8B000"><h2>Conta a confirmar com o armazém</h2>
        <p class="peq">Num talão: <b>197,5 kg</b> (3+F) a <b>R$ 850,00</b> a saca deu <b>R$ 2.788,00</b>, ou seja, 3,28 sacas. Pela conta simples (197,5 ÷ 60) seriam 3,29 sacas e R$ 2.796,50.</p>
        <div id="caso"></div>
        <p class="nota amarela peq">Hipótese que fecha certinho: tara de 0,175 kg por saco (4 volumes = 0,7 kg). Pode também ser desconto de umidade ou uma regra própria. <b>Precisa ser confirmada com o armazém antes do sistema valer.</b></p>
      </div>
    </div>
    <div class="grade g2">
      <div class="cartao"><h2>Numeração</h2><p class="peq muted">Continua de onde o talão e o caderno pararam.</p>
        <div class="campos">
          <label class="campo"><span>Próximo romaneio</span><input id="c-pr" inputmode="numeric" value="${cfg.proxRomaneio}"></label>
          <label class="campo"><span>Próximo RV</span><input id="c-prv" inputmode="numeric" value="${cfg.proxRV}"></label>
        </div><div class="acoes" style="margin-top:12px"><button class="btn" id="c-num">Salvar numeração</button></div></div>
      <div class="cartao"><h2>Tipos de café</h2>
        <table><tbody>${db.tipos.map((t) => `<tr class="${t.ativo ? '' : 'cancelado'}"><td>${esc(D.nomeTipo(t))}</td><td class="num"><button class="btn peq" data-tp="${t.id}">${t.ativo ? 'Desativar' : 'Ativar'}</button></td></tr>`).join('')}</tbody></table>
        <div class="campos" style="margin-top:10px;grid-template-columns:1fr 1fr 1fr auto;align-items:end">
          <label class="campo"><span>Espécie</span><select id="tp-e"><option>Arábica</option><option>Conilon</option></select></label>
          <label class="campo"><span>Bebida</span><input id="tp-b" list="bebidas"></label>
          <label class="campo"><span>Tipo / categoria</span><input id="tp-c" placeholder="Tipo 6, bica corrida…"></label>
          <button class="btn" id="tp-ok">Incluir</button></div>
        <datalist id="bebidas">${['Estritamente mole', 'Mole', 'Apenas mole', 'Dura', 'Riada', 'Rio', 'Riozona'].map((b) => `<option value="${b}">`).join('')}</datalist>
      </div>
    </div>
    <div class="grade g3">
      <div class="cartao"><h2>Armazéns e pilhas</h2><table><tbody>${db.locais.map((l) => `<tr><td>${esc(l.armazem)} · ${esc(l.pilha)}</td></tr>`).join('')}</tbody></table>
        <div class="campos" style="margin-top:8px"><input id="lo-a" placeholder="Armazém"><input id="lo-p" placeholder="Pilha / lote"></div><button class="btn peq" id="lo-ok" style="margin-top:6px">Incluir</button></div>
      <div class="cartao"><h2>Motoristas</h2><table><tbody>${db.motoristas.map((m) => `<tr><td>${esc(m.nome)}</td><td>${esc(m.placa)}</td></tr>`).join('')}</tbody></table>
        <div class="campos" style="margin-top:8px"><input id="mo-n" placeholder="Nome"><input id="mo-p" placeholder="Placa"></div><button class="btn peq" id="mo-ok" style="margin-top:6px">Incluir</button></div>
      <div class="cartao"><h2>Locais de busca</h2><table><tbody>${db.locaisBusca.map((l) => `<tr><td>${esc(l.nome)}<div class="peq muted">${esc(l.comunidade)}, ${esc(l.municipio)}</div></td></tr>`).join('')}</tbody></table>
        <p class="peq muted">Novos locais entram direto pela tela da compra.</p></div>
    </div>
    <div class="cartao"><h2>Dados da demonstração</h2>
      <div class="campos"><label class="campo"><span>Seu nome (aparece na auditoria e nos PDFs)</span><input id="c-user" value="${esc(db.usuario.nome)}"></label></div>
      <div class="acoes" style="margin-top:12px"><button class="btn" id="c-user-ok">Salvar nome</button><button class="btn perigo" id="c-reset">Restaurar dados de exemplo</button></div></div>`;
  const $ = (s) => app.querySelector(s);
  const num = (s) => Number(String($(s).value).replace(',', '.'));
  const desenharCaso = () => {
    const tmp = { ...cfg, kgPorSaca: num('#c-kg') || 60, taraPorSacoKg: num('#c-tara') || 0, arredondamento: $('#c-arr').value, casasSacas: +$('#c-casas').value };
    const t = C.totaisRomaneio([{ volumes: '3+F', quilos: '197,5' }], { taraPorSacoKg: tmp.taraPorSacoKg });
    const v = C.valorCompra(t.liquidoDec, 85000, tmp);
    $('#caso').innerHTML = `<div class="totais"><div><span>Peso líquido</span><b>${KG(t.liquidoDec)}</b></div><div><span>Sacas pagáveis</span><b>${C.formatarSacasDecimais(C.sacasPagaveis(t.liquidoDec, tmp), tmp.casasSacas)}</b></div>
      <div class="${v === 278800 ? 'destaque' : ''}"><span>Com as regras acima</span><b>${R(v)}</b><span>${v === 278800 ? 'bate com o talão' : `talão: R$ 2.788,00 (diferença ${R(v - 278800)})`}</span></div></div>`;
  };
  ['#c-kg', '#c-tara', '#c-arr', '#c-casas'].forEach((s) => $(s).addEventListener('input', desenharCaso));
  ['#c-arr', '#c-casas'].forEach((s) => $(s).addEventListener('change', desenharCaso));
  desenharCaso();
  const lerUmid = () => cfg.tabelaUmidade.forEach((f, i) => { f.acimaDe = Number(String($(`[data-u-a="${i}"]`).value).replace(',', '.')) || 0; f.desconto = Number(String($(`[data-u-d="${i}"]`).value).replace(',', '.')) || 0; });
  $('#c-umid-mais').onclick = () => { lerUmid(); cfg.tabelaUmidade.push({ acimaDe: 15, desconto: 5 }); gravar(); render(); };
  app.querySelectorAll('[data-u-x]').forEach((b) => b.onclick = () => { lerUmid(); cfg.tabelaUmidade.splice(+b.dataset.uX, 1); gravar(); render(); });
  $('#c-salvar').onclick = () => {
    const antes = { kgPorSaca: cfg.kgPorSaca, taraPorSacoKg: cfg.taraPorSacoKg, arredondamento: cfg.arredondamento, casasSacas: cfg.casasSacas };
    if (!(num('#c-kg') > 0) || !(num('#c-tara') >= 0)) return aviso('Valores inválidos.');
    lerUmid();
    Object.assign(cfg, { kgPorSaca: num('#c-kg'), taraPorSacoKg: num('#c-tara'), arredondamento: $('#c-arr').value, casasSacas: +$('#c-casas').value });
    cfg.tabelaUmidade.sort((a, b) => a.acimaDe - b.acimaDe);
    D.auditar('alterou regras de cálculo', 'configuração', '', antes, { kgPorSaca: cfg.kgPorSaca, taraPorSacoKg: cfg.taraPorSacoKg, arredondamento: cfg.arredondamento, casasSacas: cfg.casasSacas });
    gravar('Regras salvas.'); render();
  };
  $('#c-num').onclick = () => {
    const pr = parseInt($('#c-pr').value, 10), prv = parseInt($('#c-prv').value, 10);
    if (db.romaneios.some((r) => r.numero >= pr) || db.rvs.some((r) => r.numero >= prv)) return aviso('A numeração não pode voltar para um número já usado.');
    D.auditar('alterou numeração', 'configuração', '', { romaneio: cfg.proxRomaneio, rv: cfg.proxRV }, { romaneio: pr, rv: prv });
    cfg.proxRomaneio = pr; cfg.proxRV = prv; gravar('Numeração salva.'); render();
  };
  app.querySelectorAll('[data-tp]').forEach((b) => b.onclick = () => { const t = D.tipo(b.dataset.tp); t.ativo = !t.ativo; D.auditar(t.ativo ? 'ativou' : 'desativou', 'tipo de café', t.id, null, D.nomeTipo(t)); gravar(); render(); });
  $('#tp-ok').onclick = () => {
    if (!$('#tp-b').value.trim() && !$('#tp-c').value.trim()) return aviso('Informe a bebida ou o tipo.');
    const t = { id: D.uid(), especie: $('#tp-e').value, bebida: $('#tp-b').value.trim(), categoria: $('#tp-c').value.trim(), ativo: true };
    db.tipos.push(t); D.auditar('incluiu', 'tipo de café', t.id, null, D.nomeTipo(t)); gravar('Tipo incluído.'); render();
  };
  $('#lo-ok').onclick = () => { if (!$('#lo-a').value.trim()) return; db.locais.push({ id: D.uid(), armazem: $('#lo-a').value.trim(), pilha: $('#lo-p').value.trim() }); gravar('Local incluído.'); render(); };
  $('#mo-ok').onclick = () => { if (!$('#mo-n').value.trim()) return; db.motoristas.push({ id: D.uid(), nome: $('#mo-n').value.trim(), placa: $('#mo-p').value.trim() }); gravar('Motorista incluído.'); render(); };
  $('#c-user-ok').onclick = () => { db.usuario.nome = $('#c-user').value.trim() || 'Usuário da demonstração'; gravar('Nome salvo.'); };
  $('#c-reset').onclick = async () => {
    const m = await pedirMotivo('Restaurar dados de exemplo', 'Tudo o que foi lançado neste navegador volta ao exemplo inicial.');
    if (!m) return;
    D.restaurarExemplo(); aviso('Dados de exemplo restaurados.'); ir('');
  };
}

// =====================================================================
// AUDITORIA
// =====================================================================
function auditoria() {
  const fmt = (v) => v == null ? '' : typeof v === 'string' ? v : Object.entries(v).map(([k, x]) => `${k}: ${Array.isArray(x) ? x.join(', ') : typeof x === 'object' ? JSON.stringify(x) : x}`).join(' · ');
  app.innerHTML = `<div class="cab"><div><h1>Auditoria</h1><p>Quem fez o quê, e quando. Nada some daqui.</p></div></div>
    <div class="cartao rolar"><table><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Onde</th><th>Antes</th><th>Depois</th></tr></thead><tbody>
    ${D.db.auditoria.map((a) => `<tr><td class="peq">${dataHora(a.em)}</td><td>${esc(a.usuario)}<div class="peq muted">${esc(PERFIS[a.perfil] || '')}</div></td><td>${esc(a.acao)}</td><td>${esc(a.entidade)}</td><td class="peq muted">${esc(fmt(a.antes))}</td><td class="peq">${esc(fmt(a.depois))}</td></tr>`).join('')}
    </tbody></table></div>`;
}

render();
