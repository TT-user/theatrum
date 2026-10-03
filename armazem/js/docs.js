// Documentos para impressão / PDF, no formato que o armazém já usa no papel.

import * as C from './calculo.js';
import * as D from './dados.js';
import { esc, R, SC, KG, data, doc } from './ui.js';

const LOGO = 'assets/logo-400.png';

function cab(titulo, numero, sub = '') {
  return `<div class="cab-doc">
    <div style="display:flex;gap:10px;align-items:center"><img src="${LOGO}" alt="">
      <div><div style="font-weight:700;font-size:13px">${esc(titulo)}</div>${sub ? `<div class="via">${esc(sub)}</div>` : ''}</div></div>
    ${numero ? `<div class="num-doc">${esc(numero)}</div>` : ''}
  </div>`;
}

const rodape = () => `<div class="rodape-doc">Gerado em ${new Date().toLocaleString('pt-BR')} por ${esc(D.db.usuario.nome)}</div>`;

// ---------- romaneio (talão, 2 vias A5) ----------
export function talao(r, { previa = false } = {}) {
  const p = D.pessoa(r.pessoaId);
  const t = D.tipo(r.tipoId);
  const m = D.motorista(r.motoristaId);
  const linhas = [];
  const n = Math.max(20, r.itens.length);
  for (let i = 0; i < n; i++) {
    const it = r.itens[i] || {};
    linhas.push(`<tr><td class="num" style="width:22px;color:#777">${i + 1}</td><td>${esc(C.lerVolumes(it.volumes)?.texto ?? it.volumes ?? '')}</td><td class="num">${it.quilos ? KG(C.kgParaDec(it.quilos)) : ''}</td></tr>`);
  }
  const tot = r.totais;
  const via = (nome) => `<div class="folha folha-a5">
    ${cab('ROMANEIO DE ENTRADA', 'Nº ' + D.fmtNum(r.numero), nome)}
    ${r.status === 'cancelado' ? `<div style="border:2px solid #B3261E;color:#B3261E;font-weight:700;text-align:center;padding:4px;margin-bottom:6px">CANCELADO: ${esc(r.cancelMotivo)}</div>` : ''}
    <div class="camposdoc">
      <div><b>Data</b>${data(r.data)}</div><div><b>Pasta</b>${esc(r.pasta)}</div>
      <div style="grid-column:1/-1"><b>Produtor</b>${esc(D.nomePessoa(p))}</div>
      <div><b>Motorista</b>${esc(m?.nome || '')}</div><div><b>Destino</b>${r.destino === 'compra' ? 'Compra direta' : 'Guarda (depósito)'}</div>
      <div style="grid-column:1/-1"><b>Café</b>${esc(D.nomeTipo(t))}${r.umidade !== '' && r.umidade != null ? ` · umidade ${String(r.umidade).replace('.', ',')}%` : ''}</div>
    </div>
    <table><thead><tr><th></th><th>Volumes</th><th class="num">Quilos</th></tr></thead><tbody>${linhas.join('')}</tbody></table>
    <table style="margin-top:6px"><tbody>
      <tr><td>Volumes</td><td class="num">${tot.volumes}</td><td>Peso bruto</td><td class="num">${KG(tot.brutoDec)}</td></tr>
      <tr><td>Tara</td><td class="num">${KG(tot.taraDec)}</td><td>Desc. umidade</td><td class="num">${KG(tot.umidadeDec)}</td></tr>
      <tr><td colspan="2"><b>Peso líquido</b></td><td colspan="2" class="num"><b>${KG(tot.liquidoDec)} = ${SC(tot.liquidoDec)}</b></td></tr>
    </tbody></table>
    ${r.obs ? `<p style="margin:6px 0 0"><b>Obs.:</b> ${esc(r.obs)}</p>` : ''}
    ${r.nfNumero ? `<p style="margin:4px 0 0"><b>NF de produtor:</b> ${esc(r.nfNumero)}${r.nfSerie ? ' série ' + esc(r.nfSerie) : ''}</p>` : ''}
    <div class="assin"><div>Produtor</div><div>Armazém Gerais Caparaó</div></div>
    ${previa ? '' : rodape()}
  </div>`;
  if (previa) return via('Via do produtor');
  return via('Via do produtor') + '<div class="quebra"></div>' + via('Via do armazém');
}

// ---------- RV (comprovante A5) ----------
export function rvDoc(rv) {
  const v = D.pessoa(rv.vendedorId);
  const t = D.tipo(rv.tipoId);
  const lb = D.localBusca(rv.localBuscaId);
  const cfg = D.db.config;
  const roms = rv.romaneioIds.map((id) => D.db.romaneios.find((r) => r.id === id)).filter(Boolean);
  const descontos = D.db.lancamentos.filter((l) => l.rvId === rv.id && l.sinal === 'desconto' && l.status !== 'cancelado');
  return `<div class="folha folha-a5">
    ${cab('REGISTRO DE COMPRA DE CAFÉ', 'RV ' + rv.numero, 'Via do vendedor')}
    ${rv.cancelado ? `<div style="border:2px solid #B3261E;color:#B3261E;font-weight:700;text-align:center;padding:4px;margin-bottom:6px">CANCELADO: ${esc(rv.cancelMotivo)}</div>` : ''}
    <div class="camposdoc">
      <div style="grid-column:1/-1"><b>Vendedor</b>${esc(D.nomePessoa(v))}</div>
      <div><b>Data da compra</b>${data(rv.dataCompra)}</div><div><b>Data do pagamento</b>${data(rv.dataPagamento)}</div>
      <div style="grid-column:1/-1"><b>Café</b>${esc(D.nomeTipo(t))}</div>
      <div><b>Quantidade</b>${SC(rv.pesoDec)}</div><div><b>Peso</b>${KG(rv.pesoDec)}</div>
      <div><b>Sacas pagáveis</b>${C.formatarSacasDecimais(rv.sacasUnid, cfg.casasSacas)}</div><div><b>Valor da saca</b>${R(rv.precoSacaCentavos)}</div>
      <div style="grid-column:1/-1"><b>Local de busca</b>${lb ? esc(`${lb.nome}, ${lb.comunidade}, ${lb.municipio}`) : rv.origem === 'saldo' ? 'Café já guardado no armazém' : '-'}</div>
      ${roms.length ? `<div style="grid-column:1/-1"><b>Romaneios</b>${roms.map((r) => D.fmtNum(r.numero)).join(', ')}</div>` : ''}
    </div>
    <table><tbody>
      <tr><td><b>Total da compra</b></td><td class="num"><b>${R(rv.totalCentavos)}</b></td></tr>
      ${rv.partilhas.length > 1 ? rv.partilhas.map((p) => `<tr><td>Partilha: ${esc(D.nomePessoa(D.pessoa(p.pessoaId)))} (${String(p.percentual).replace('.', ',')}%)</td><td class="num">${R(p.valorCentavos)}</td></tr>`).join('') : ''}
      ${descontos.map((l) => `<tr><td>Desconto: ${esc(l.descricao)}</td><td class="num">-${R(l.valorCentavos)}</td></tr>`).join('')}
    </tbody></table>
    ${rv.obs ? `<p style="margin:6px 0 0"><b>Obs.:</b> ${esc(rv.obs)}</p>` : ''}
    <div class="assin"><div>Vendedor</div><div>Comprador</div></div>
    ${rodape()}
  </div>`;
}

// ---------- lista de pendências (A4) ----------
export function pendenciasDoc(grupos, titulo) {
  const linhas = grupos.map((g) => {
    const itens = g.lancs.map((l) => `<tr><td>${data(l.data)}</td><td>${esc(l.referencia)}</td><td>${esc(l.descricao)}</td><td>${data(l.vencimento)}</td><td class="num">${l.sinal === 'desconto' ? '-' : ''}${R(l.aberto)}</td></tr>`).join('');
    return `<tr><td colspan="5" style="padding-top:8px;font-weight:700;border-bottom:1px solid #555">${esc(D.nomePessoa(g.pessoa))}</td></tr>${itens}
      <tr><td colspan="4" style="text-align:right"><b>Total ${esc(g.pessoa?.apelido || g.pessoa?.nome || '')}</b></td><td class="num"><b>${R(g.liquido)}</b></td></tr>`;
  }).join('');
  const total = grupos.reduce((s, g) => s + g.liquido, 0);
  return `<div class="folha folha-a4">${cab('PENDÊNCIAS / ACERTOS', '', titulo)}
    <table><thead><tr><th>Data</th><th>Ref.</th><th>Descrição</th><th>Venc.</th><th class="num">Valor</th></tr></thead><tbody>${linhas}</tbody></table>
    <div class="total-geral">Total geral: ${R(total)}</div>${rodape()}</div>`;
}

// ---------- relação para pagamentos (A4) ----------
export function relacaoDoc(rel) {
  const [a, m, d] = rel.data.split('-');
  const itens = rel.itens.map((it) => {
    const p = D.pessoa(it.pessoaId);
    const c = D.db.contas.find((x) => x.id === it.contaId);
    const contaTxt = c
      ? `${c.pixChave ? `<div>PIX (${esc(c.pixTipo)}): ${esc(c.pixChave)}</div>` : ''}<div>CONTA: ${esc(c.conta)} &nbsp; AGÊNCIA: ${esc(c.agencia)} &nbsp; OPERAÇÃO: ${c.tipo === 'poupanca' ? 'POUPANÇA' : 'CORRENTE'}</div><div>BANCO: ${esc(c.bancoNome)} &nbsp; CÓDIGO: ${esc(c.bancoCodigo)}${c.titular && c.titular !== p?.nome ? ` &nbsp; TITULAR: ${esc(c.titular)}` : ''}</div>`
      : '<div style="color:#B3261E">SEM DADOS BANCÁRIOS CADASTRADOS</div>';
    return `<div class="rel-item">
      <div class="nome">${esc((p?.nome || '').toUpperCase())}</div>
      <div>CPF/CNPJ: ${doc(p?.doc)}</div>
      ${contaTxt}
      <div class="pont"><span>VALOR</span><span class="p"></span><b>${R(it.valorCentavos)}</b></div>
    </div>`;
  }).join('');
  return `<div class="folha folha-a4">${cab(`RELAÇÃO PARA PAGAMENTOS EM: ${d}-${m}-${a}`, 'Nº ' + rel.numero, rel.status === 'confirmada' ? 'Pagamentos confirmados' : 'Aguardando pagamento')}
    ${itens}
    <div class="total-geral">TOTAL GERAL: ${R(rel.totalCentavos)}</div>${rodape()}</div>`;
}

// ---------- extrato do produtor (A4) ----------
export function extratoDoc(p) {
  const movs = D.db.movimentos.filter((m) => m.pessoaId === p.id).sort((a, b) => a.data.localeCompare(b.data));
  let saldo = 0;
  const lm = movs.map((m) => {
    const sinal = ['entrada', 'transferencia_entrada'].includes(m.tipo) ? 1 : m.tipo === 'ajuste' ? 1 : -1;
    if (!m.cancelado) saldo += sinal * m.pesoDec;
    return `<tr style="${m.cancelado ? 'text-decoration:line-through;color:#888' : ''}"><td>${data(m.data)}</td><td>${esc(TIPO_MOV[m.tipo] || m.tipo)}</td><td>${esc(D.nomeTipo(D.tipo(m.tipoId)))}</td><td>${esc(m.motivo)}</td><td class="num">${sinal < 0 ? '-' : ''}${SC(m.pesoDec)}</td><td class="num">${SC(saldo)}</td></tr>`;
  }).join('');
  const lancs = D.db.lancamentos.filter((l) => l.pessoaId === p.id && l.status !== 'cancelado').sort((a, b) => a.data.localeCompare(b.data));
  const lf = lancs.map((l) => `<tr><td>${data(l.data)}</td><td>${esc(l.referencia)}</td><td>${esc(l.descricao)}</td><td>${esc(l.status)}</td><td class="num">${l.sinal === 'desconto' ? '-' : ''}${R(l.valorCentavos)}</td><td class="num">${R(C.emAberto(l, D.db.baixas) * (l.sinal === 'desconto' ? -1 : 1))}</td></tr>`).join('');
  const liq = C.liquidoAPagar(lancs, D.db.baixas);
  return `<div class="folha folha-a4">${cab('EXTRATO DO PRODUTOR', '', D.nomePessoa(p))}
    <h3 style="margin:8px 0 4px">Café (sacas de ${D.db.config.kgPorSaca} kg)</h3>
    <table><thead><tr><th>Data</th><th>Movimento</th><th>Café</th><th>Ref.</th><th class="num">Quantidade</th><th class="num">Saldo</th></tr></thead><tbody>${lm || '<tr><td colspan="6">Sem movimentos</td></tr>'}</tbody></table>
    <div class="total-geral">Saldo guardado: ${SC(saldo)} (${KG(saldo)})</div>
    <h3 style="margin:14px 0 4px">Financeiro</h3>
    <table><thead><tr><th>Data</th><th>Ref.</th><th>Descrição</th><th>Status</th><th class="num">Valor</th><th class="num">Em aberto</th></tr></thead><tbody>${lf || '<tr><td colspan="6">Sem lançamentos</td></tr>'}</tbody></table>
    <div class="total-geral">A receber: ${R(liq.creditos)} · Descontos: -${R(liq.descontos)} · Líquido: ${R(liq.liquido)}</div>
    ${rodape()}</div>`;
}

export const TIPO_MOV = {
  entrada: 'Entrada', saida: 'Retirada', venda: 'Venda (RV)', ajuste: 'Ajuste',
  transferencia_entrada: 'Transferência recebida', transferencia_saida: 'Transferência enviada',
};

/** Relatório genérico em A4. */
export function relatorioDoc(titulo, sub, tabela, extra = '') {
  return `<div class="folha folha-a4">${cab(titulo, '', sub)}${tabela}${extra}${rodape()}</div>`;
}
