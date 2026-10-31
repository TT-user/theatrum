// Camada de dados da demonstração. Tudo fica no localStorage deste navegador;
// na versão final isto vira o banco (Postgres) com o mesmo formato.
// Seed 100% fictício: nomes, CPFs e contas inventados.

import * as C from './calculo.js';

const CHAVE = 'armazem-caparao-demo-v1';

export let db = null;

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function hojeISO(desloc = 0) {
  const d = new Date();
  d.setDate(d.getDate() + desloc);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) { db = JSON.parse(bruto); if (db && db.versao === 1) return db; }
  } catch (e) { /* sem storage: segue com o seed em memória */ }
  db = criarSeed();
  salvar();
  return db;
}

export function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(db)); return true; }
  catch (e) { return false; }
}

export function restaurarExemplo() {
  const usuario = db?.usuario;
  db = criarSeed();
  if (usuario) db.usuario = usuario;
  salvar();
}

export function auditar(acao, entidade, entidadeId, antes, depois) {
  db.auditoria.unshift({
    id: uid(), em: new Date().toISOString(), usuario: db.usuario.nome, perfil: db.usuario.perfil,
    acao, entidade, entidadeId, antes: antes ?? null, depois: depois ?? null,
  });
  if (db.auditoria.length > 600) db.auditoria.length = 600;
}

// ---------- consultas ----------

export const pessoa = (id) => db.pessoas.find((p) => p.id === id);
export const tipo = (id) => db.tipos.find((t) => t.id === id);
export const motorista = (id) => db.motoristas.find((m) => m.id === id);
export const localBusca = (id) => db.locaisBusca.find((l) => l.id === id);
export const local = (id) => db.locais.find((l) => l.id === id);
export const contaPadrao = (pessoaId) =>
  db.contas.find((c) => c.pessoaId === pessoaId && c.padrao) || db.contas.find((c) => c.pessoaId === pessoaId);

export function nomeTipo(t) {
  if (!t) return '';
  return [t.especie, t.bebida, t.categoria].filter(Boolean).join(' · ');
}

export function nomePessoa(p, curto = false) {
  if (!p) return '(sem pessoa)';
  if (curto && p.apelido) return p.apelido;
  return p.apelido ? `${p.nome} (${p.apelido})` : p.nome;
}

export function saldoPessoa(pessoaId, tipoId) {
  return C.saldoMovimentos(db.movimentos.filter((m) => m.pessoaId === pessoaId && (!tipoId || m.tipoId === tipoId)));
}

export function baixasDe(lancId) { return db.baixas.filter((b) => b.lancamentoId === lancId && !b.estornada); }

export function atualizarStatusLanc(l) {
  if (l.status === 'cancelado') return;
  const aberto = C.emAberto(l, db.baixas);
  l.status = aberto <= 0 ? 'pago' : aberto < l.valorCentavos ? 'parcial' : 'pendente';
}

export function statusRV(rv) {
  if (rv.cancelado) return 'cancelado';
  const lancs = db.lancamentos.filter((l) => l.rvId === rv.id && l.sinal === 'credito' && l.status !== 'cancelado');
  if (lancs.length && lancs.every((l) => l.status === 'pago')) return 'pago';
  if (rv.buscado) return 'buscado';
  return 'comprado';
}

// ---------- seed ----------

function criarSeed() {
  const d = (n) => hojeISO(n);
  const s = {
    versao: 1,
    usuario: { nome: 'Usuário da demonstração', perfil: 'admin' },
    config: {
      ...C.CONFIG_PADRAO,
      tabelaUmidade: C.CONFIG_PADRAO.tabelaUmidade.map((f) => ({ ...f })),
      proxRomaneio: 20268,
      proxRV: 6200,
      proxRelacao: 1,
    },
    pessoas: [], contas: [], parcerias: [], tipos: [], motoristas: [], locaisBusca: [], locais: [],
    romaneios: [], movimentos: [], rvs: [], lancamentos: [], baixas: [], relacoes: [], anexos: [], auditoria: [],
  };

  const P = (nome, apelido, doc, extra = {}) => {
    const p = { id: uid(), nome, apelido, doc, inscProdutor: '', telefone: '', endereco: '', obs: '', ativo: true, ...extra };
    s.pessoas.push(p); return p;
  };
  const conta = (p, c) => s.contas.push({ id: uid(), pessoaId: p.id, titular: p.nome, padrao: true, pixChave: '', pixTipo: '', ...c });

  const joao = P('João Batista Ferreira', 'Joãozinho da Serra', '000.111.222-01', { inscProdutor: '000.111.0001', telefone: '(32) 90000-0001', endereco: 'Sítio Boa Vista, córrego do Facão' });
  const ze = P('José Elias Campos', 'Zezé', '000.111.222-02', { telefone: '(32) 90000-0002', endereco: 'Fazenda Pedra Menina' });
  const antonio = P('Antônio Rufino Lopes', 'Tõe Ovo', '000.111.222-03', { telefone: '(32) 90000-0003', endereco: 'Sítio Água Limpa' });
  const maria = P('Maria Aparecida Souza', 'Cida', '000.111.222-04', { telefone: '(32) 90000-0004', endereco: 'Sítio Santa Luzia' });
  const geraldo = P('Geraldo Moreira Dutra', '', '000.111.222-05', { telefone: '(32) 90000-0005', obs: 'Meeiro do Zezé na Pedra Menina' });
  const benedito = P('Benedito Alves Pinto', 'Ditinho', '000.111.222-06', { telefone: '(32) 90000-0006', obs: 'Parceiro do Joãozinho, 40%' });
  const transp = P('Transportes Serra Azul Ltda (fictícia)', 'Frete Serra Azul', '00.000.000/0001-07', { obs: 'Fretes terceirizados' });
  const contab = P('Escritório Contábil Exemplo (fictício)', 'Contador', '00.000.000/0001-08', { obs: 'Honorários mensais' });
  const agro = P('Casa Agrícola Exemplo (fictícia)', 'Agrícola', '00.000.000/0001-09', { obs: 'Milho, sacaria' });

  conta(joao, { bancoNome: 'Sicoob', bancoCodigo: '756', agencia: '0000', conta: '10001-1', tipo: 'corrente', pixChave: '000.111.222-01', pixTipo: 'CPF' });
  conta(ze, { bancoNome: 'Banco do Brasil', bancoCodigo: '001', agencia: '0000-0', conta: '20002-2', tipo: 'corrente' });
  conta(antonio, { bancoNome: 'Caixa Econômica Federal', bancoCodigo: '104', agencia: '0000', conta: '30003-3', tipo: 'poupanca', pixChave: '(32) 90000-0003', pixTipo: 'Telefone' });
  conta(maria, { bancoNome: 'Sicoob', bancoCodigo: '756', agencia: '0000', conta: '40004-4', tipo: 'corrente' });
  conta(geraldo, { bancoNome: 'Bradesco', bancoCodigo: '237', agencia: '0000', conta: '50005-5', tipo: 'poupanca' });
  conta(benedito, { bancoNome: 'Sicoob', bancoCodigo: '756', agencia: '0000', conta: '60006-6', tipo: 'corrente', pixChave: 'ditinho@exemplo.com', pixTipo: 'E-mail' });
  conta(transp, { bancoNome: 'Banco do Brasil', bancoCodigo: '001', agencia: '0000-0', conta: '70007-7', tipo: 'corrente', pixChave: '00.000.000/0001-07', pixTipo: 'CNPJ' });
  conta(contab, { bancoNome: 'Itaú', bancoCodigo: '341', agencia: '0000', conta: '80008-8', tipo: 'corrente' });

  // percentual do PARCEIRO; o titular fica com o resto
  s.parcerias.push({ id: uid(), titularId: ze.id, parceiroId: geraldo.id, percentual: 50 });
  s.parcerias.push({ id: uid(), titularId: joao.id, parceiroId: benedito.id, percentual: 40 });

  const T = (especie, bebida, categoria) => { const t = { id: uid(), especie, bebida, categoria, ativo: true }; s.tipos.push(t); return t; };
  const tDuro = T('Arábica', 'Dura', 'Tipo 6');
  const tMole = T('Arábica', 'Mole', 'Tipo 6');
  const tRio = T('Arábica', 'Riada', 'Bica corrida');
  const tRiozona = T('Arábica', 'Riozona', 'Bica corrida');
  const tRapa = T('Arábica', 'Rio', 'Café de rapa/varrição');
  T('Arábica', 'Estritamente mole', 'Tipo 6');
  T('Arábica', 'Apenas mole', 'Tipo 7');
  T('Conilon', '', 'Bica corrida');

  const m1 = { id: uid(), nome: 'Marcos (fictício)', placa: 'AAA-0A00' };
  const m2 = { id: uid(), nome: 'Valdir (fictício)', placa: 'BBB-0B00' };
  s.motoristas.push(m1, m2);

  const l1 = { id: uid(), nome: 'Sítio Boa Vista', comunidade: 'Córrego do Facão', municipio: 'Caparaó-MG', referencia: 'depois da ponte, 2ª porteira' };
  const l2 = { id: uid(), nome: 'Fazenda Pedra Menina', comunidade: 'Pedra Menina', municipio: 'Dores do Rio Preto-ES', referencia: '' };
  const l3 = { id: uid(), nome: 'Sítio Água Limpa', comunidade: 'Água Limpa', municipio: 'Alto Caparaó-MG', referencia: 'estrada de terra, 6 km' };
  s.locaisBusca.push(l1, l2, l3);

  const a1 = { id: uid(), armazem: 'Armazém 1', pilha: 'Pilha A' };
  const a2 = { id: uid(), armazem: 'Armazém 1', pilha: 'Pilha B' };
  const a3 = { id: uid(), armazem: 'Armazém 2', pilha: 'Pilha C' };
  s.locais.push(a1, a2, a3);

  const cfg = s.config;
  const romaneio = (dia, p, mot, t, itens, extra = {}) => {
    const tot = C.totaisRomaneio(itens, { taraPorSacoKg: cfg.taraPorSacoKg });
    const r = {
      id: uid(), numero: cfg.proxRomaneio++, data: d(dia), pessoaId: p.id, motoristaId: mot?.id || '', pasta: '',
      itens, tipoId: t.id, umidade: '', aplicarUmidade: false, destino: 'guarda', localId: a1.id, totais: tot,
      obs: '', status: 'classificado', nfNumero: '', nfSerie: '', nfChave: '', nfEmissao: '',
      criadoPor: 'Seed', criadoEm: new Date().toISOString(), ...extra,
    };
    s.romaneios.push(r);
    s.movimentos.push({ id: uid(), data: r.data, pessoaId: p.id, tipoId: t.id, localId: r.localId, tipo: 'entrada', pesoDec: tot.liquidoDec, romaneioId: r.id, rvId: '', motivo: `Romaneio ${fmtNum(r.numero)}`, criadoPor: 'Seed' });
    return r;
  };
  const linhas = (n, kg) => Array.from({ length: n }, () => ({ volumes: '10', quilos: String(kg) }));

  const r1 = romaneio(-26, ze, m1, tDuro, linhas(9, 606), { pasta: '12' });
  romaneio(-22, joao, m2, tMole, [...linhas(4, 605), { volumes: '6+F', quilos: '402,5' }], { pasta: '12' });
  const r3 = romaneio(-19, antonio, m1, tRiozona, linhas(3, 604), { obs: 'riozona muito úmido', umidade: 13.8 });
  romaneio(-15, maria, m2, tDuro, linhas(5, 605), { pasta: '13' });
  const r5 = romaneio(-11, ze, m1, tRio, linhas(6, 603));
  romaneio(-8, joao, m1, tDuro, linhas(7, 606), { pasta: '13' });
  const r7 = romaneio(-6, antonio, m2, tRapa, [{ volumes: '8', quilos: '470' }], { obs: 'café de rapa', localId: a3.id });
  romaneio(-3, maria, m1, tMole, linhas(4, 604));
  const r9 = romaneio(-1, joao, m2, tDuro, linhas(2, 605), { status: 'aberto' });
  // o caso real do talão, com produtor fictício
  const r10 = romaneio(0, maria, m1, tDuro, [{ volumes: '3+F', quilos: '197,5' }], {
    obs: 'Conta a confirmar: no papel, 197,5 kg a R$ 850,00 deu R$ 2.788,00 (3,28 sc). Ver Configurações.',
    destino: 'compra',
  });
  s.romaneios.forEach((r, i) => { r.numero = 20268 + i; });
  cfg.proxRomaneio = 20278;
  s.movimentos.forEach((m) => { const r = s.romaneios.find((x) => x.id === m.romaneioId); if (r) m.motivo = `Romaneio ${fmtNum(r.numero)}`; });

  // ---------- RVs ----------
  const rv = (diaCompra, diaPag, vend, t, pesoDec, precoReais, opts = {}) => {
    const preco = Math.round(precoReais * 100);
    const total = C.valorCompra(pesoDec, preco, cfg);
    const parc = s.parcerias.filter((x) => x.titularId === vend.id);
    const partes = [{ pessoaId: vend.id, percentual: 100 - parc.reduce((a, x) => a + x.percentual, 0) }, ...parc.map((x) => ({ pessoaId: x.parceiroId, percentual: x.percentual }))];
    const partilhas = C.partilhar(total, partes);
    const r = {
      id: uid(), numero: cfg.proxRV++, vendedorId: vend.id, dataCompra: d(diaCompra), dataPagamento: d(diaPag),
      localBuscaId: opts.local?.id || '', tipoId: t.id, pesoDec, precoSacaCentavos: preco,
      sacasUnid: C.sacasPagaveis(pesoDec, cfg), totalCentavos: total, romaneioIds: opts.romaneios?.map((x) => x.id) || [],
      origem: opts.origem || 'saldo', buscado: opts.origem !== 'buscar' || !!opts.romaneios?.length,
      partilhas, obs: opts.obs || '', cancelado: false, criadoEm: new Date().toISOString(),
    };
    s.rvs.push(r);
    if (r.buscado) s.movimentos.push({ id: uid(), data: r.dataCompra, pessoaId: vend.id, tipoId: t.id, localId: a1.id, tipo: 'venda', pesoDec, romaneioId: '', rvId: r.id, motivo: `RV ${r.numero}`, criadoPor: 'Seed' });
    partilhas.forEach((p) => {
      const pct = partilhas.length > 1 ? ` (${String(p.percentual).replace('.', ',')}%)` : '';
      s.lancamentos.push({ id: uid(), data: r.dataCompra, vencimento: r.dataPagamento, pessoaId: p.pessoaId, categoria: 'acerto', referencia: `RV ${r.numero}` + pct, descricao: `${C.formatarSacas(pesoDec)} ${nomeTipo(t)} a ${C.formatarReais(preco)}/sc`, valorCentavos: p.valorCentavos, sinal: 'credito', status: 'pendente', rvId: r.id, romaneioId: '' });
    });
    return r;
  };
  const rvPago = rv(-24, -20, ze, tDuro, 30000, 1180, { romaneios: [r1], origem: 'romaneio' });
  rv(-18, 2, ze, tRio, 18090, 960, { romaneios: [r5], origem: 'romaneio' });
  rv(-17, 0, joao, tMole, 12000, 1320);
  rv(-9, 0, antonio, tRiozona, C.sacasEKgParaDec(30, '12'), 905, { romaneios: [r3], origem: 'romaneio', obs: 'riozona muito úmido' });
  rv(-5, 1, antonio, tRapa, 4700, 640, { romaneios: [r7], origem: 'romaneio' });
  rv(0, 0, maria, tDuro, 1975, 850, { romaneios: [r10], origem: 'romaneio', obs: 'No papel saiu R$ 2.788,00. Aqui segue a regra configurada.' });
  rv(-2, 5, joao, tDuro, C.sacasEKgParaDec(40, 0), 1190, { local: l1, origem: 'buscar', obs: 'buscar na quarta' });
  rv(-1, 7, ze, tMole, C.sacasEKgParaDec(25, 0), 1300, { local: l2, origem: 'buscar' });
  rv(0, 4, antonio, tDuro, C.sacasEKgParaDec(12, 0), 1175, { local: l3, origem: 'buscar' });
  void r9;

  // RV mais antigo já pago
  s.lancamentos.filter((l) => l.rvId === rvPago.id).forEach((l) => {
    const c = s.contas.find((x) => x.pessoaId === l.pessoaId);
    s.baixas.push({ id: uid(), lancamentoId: l.id, data: d(-20), valorCentavos: l.valorCentavos, forma: 'TED', contaId: c?.id || '', comprovante: '', relacaoId: '', criadoPor: 'Seed' });
    l.status = 'pago';
  });

  // ---------- pendências diversas (como na planilha) ----------
  const L = (dia, venc, p, categoria, referencia, descricao, reais, sinal = 'credito') =>
    s.lancamentos.push({ id: uid(), data: d(dia), vencimento: d(venc), pessoaId: p.id, categoria, referencia, descricao, valorCentavos: Math.round(reais * 100), sinal, status: 'pendente', rvId: '', romaneioId: '' });
  L(-12, -12, joao, 'adiantamento', 'Adiant.', 'Adiantamento em dinheiro', 2000, 'desconto');
  L(-10, -10, antonio, 'sacaria', 'Panha', 'Pegou 1.000 sacos de panha a R$ 1,80. DESCONTAR', 1800, 'desconto');
  L(-7, 3, transp, 'frete', 'NF 1021', '04 viagens fretes', 1640);
  L(-6, 0, contab, 'honorarios', 'Boleto', 'Honorários do mês', 1350);
  L(-4, 6, agro, 'insumo', 'Nota 3345', 'Nota de milho', 2870.4);
  L(-3, -1, ze, 'frete', 'Frete', 'Frete da busca descontado do vendedor', 220, 'desconto');
  L(-2, 9, contab, 'taxas', 'CAR', 'CAR do terreno', 480);

  s.anexos.push({ id: uid(), entidade: 'romaneio', entidadeId: r10.id, nome: 'foto-do-talao.jpg', tipo: 'Foto do romaneio em papel', descricao: 'exemplo: na demonstração o arquivo não é guardado', em: new Date().toISOString() });

  s.auditoria.push({ id: uid(), em: new Date().toISOString(), usuario: 'Sistema', perfil: 'admin', acao: 'criou', entidade: 'demonstração', entidadeId: '', antes: null, depois: 'dados de exemplo fictícios' });
  return s;
}

export function fmtNum(n) { return String(n).padStart(6, '0'); }
