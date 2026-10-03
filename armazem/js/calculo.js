// Regras de cálculo do armazém. Funções puras, sem DOM, testadas em
// interno/clientes/armazem-caparao/testes/calculo.test.mjs.
//
// Unidades internas (nunca float para dinheiro ou peso):
//   peso  -> décimos de kg, inteiro   (197,5 kg = 1975)
//   valor -> centavos, inteiro        (R$ 850,00 = 85000)
//   sacas pagáveis -> inteiro na escala de 10^casas (3,28 sc com 2 casas = 328)

export const CONFIG_PADRAO = {
  kgPorSaca: 60,          // saca de café beneficiado
  taraPorSacoKg: 0,       // peso da sacaria descontado por volume
  arredondamento: 'truncar', // 'truncar' | 'arredondar'
  casasSacas: 2,
  tabelaUmidade: [        // acima de X% de umidade, desconta Y% do peso
    { acimaDe: 12, desconto: 1 },
    { acimaDe: 13, desconto: 2 },
    { acimaDe: 14, desconto: 3.5 },
  ],
};

// ---------- conversões de texto ----------

/** "197,5" | "197.5" | 197.5 -> 1975 (décimos de kg). Vazio -> 0. */
export function kgParaDec(v) {
  if (v === null || v === undefined || v === '') return 0;
  const s = String(v).trim().replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(s);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 10);
}

/** "1.234,56" | "850" | "R$ 850,00" -> centavos. */
export function reaisParaCentavos(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return Math.round(v * 100);
  let s = String(v).replace(/[R$\s]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, ''); // 1.180 = mil cento e oitenta
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export function formatarReais(centavos) {
  const neg = centavos < 0;
  const abs = Math.abs(Math.round(centavos));
  const inteiro = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const cent = String(abs % 100).padStart(2, '0');
  return (neg ? '-' : '') + 'R$ ' + inteiro + ',' + cent;
}

export function formatarKg(dec) {
  const neg = dec < 0;
  const abs = Math.abs(dec);
  const inteiro = Math.floor(abs / 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const resto = abs % 10;
  return (neg ? '-' : '') + inteiro + (resto ? ',' + resto : '') + ' kg';
}

// ---------- sacas ----------

/** Décimos de kg -> { sacas, restoDec } (sacas cheias + resto em décimos de kg). */
export function kgEmSacas(pesoDec, kgPorSaca = 60) {
  const porSaca = Math.round(kgPorSaca * 10);
  const neg = pesoDec < 0;
  const abs = Math.abs(pesoDec);
  const sacas = Math.floor(abs / porSaca);
  const restoDec = abs % porSaca;
  return { sacas: neg ? -sacas : sacas, restoDec: neg ? -restoDec : restoDec };
}

/** 1975 -> "3 sc e 17,5 kg"; 1800 -> "3 sc"; 175 -> "17,5 kg". */
export function formatarSacas(pesoDec, kgPorSaca = 60) {
  if (!pesoDec) return '0 sc';
  const neg = pesoDec < 0;
  const { sacas, restoDec } = kgEmSacas(Math.abs(pesoDec), kgPorSaca);
  const partes = [];
  if (sacas) partes.push(sacas.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' sc');
  if (restoDec) partes.push(formatarKg(restoDec));
  return (neg ? '-' : '') + partes.join(' e ');
}

/** Sacas e quilos digitados -> décimos de kg. (93 sc, 20 kg) -> 56000 */
export function sacasEKgParaDec(sacas, kg, kgPorSaca = 60) {
  return Math.round((Number(sacas) || 0) * kgPorSaca * 10) + (kgParaDec(kg) || 0);
}

/**
 * Sacas pagáveis na escala de 10^casas, pela regra configurada.
 * 1975 dec, 60 kg, 2 casas, truncar -> 329 (3,29 sc).
 */
export function sacasPagaveis(pesoDec, cfg = CONFIG_PADRAO) {
  const casas = cfg.casasSacas ?? 2;
  const escala = 10 ** casas;
  const porSacaDec = Math.round((cfg.kgPorSaca ?? 60) * 10);
  // pesoDec * escala / porSacaDec, em inteiros
  const num = pesoDec * escala;
  if (cfg.arredondamento === 'arredondar') return Math.round(num / porSacaDec);
  return Math.trunc(num / porSacaDec);
}

export function formatarSacasDecimais(unidades, casas = 2) {
  return (unidades / 10 ** casas).toFixed(casas).replace('.', ',') + ' sc';
}

/** Valor = sacas pagáveis x preço por saca, em centavos. */
export function valorCompra(pesoDec, precoSacaCentavos, cfg = CONFIG_PADRAO) {
  const casas = cfg.casasSacas ?? 2;
  const unidades = sacasPagaveis(pesoDec, cfg);
  return Math.round((unidades * precoSacaCentavos) / 10 ** casas);
}

// ---------- romaneio ----------

/**
 * Lê o campo "volumes" do talão. Aceita "4", "3+F", "3 + f", "F".
 * -> { cheias, fracao, total, texto }  (null se inválido; vazio -> total 0)
 */
export function lerVolumes(v) {
  const s = String(v ?? '').trim().toUpperCase().replace(/\s/g, '');
  if (!s) return { cheias: 0, fracao: false, total: 0, texto: '' };
  let m = s.match(/^(\d+)$/);
  if (m) return { cheias: +m[1], fracao: false, total: +m[1], texto: m[1] };
  m = s.match(/^(\d+)\+F$/);
  if (m) return { cheias: +m[1], fracao: true, total: +m[1] + 1, texto: m[1] + '+F' };
  if (s === 'F') return { cheias: 0, fracao: true, total: 1, texto: 'F' };
  return null;
}

/** Desconto % de peso pela umidade, segundo a tabela (pega a maior faixa atingida). */
export function descontoUmidadePct(umidade, tabela = CONFIG_PADRAO.tabelaUmidade) {
  if (umidade === null || umidade === undefined || umidade === '' || !Number.isFinite(+umidade)) return 0;
  let pct = 0;
  for (const f of tabela) if (+umidade > f.acimaDe) pct = Math.max(pct, f.desconto);
  return pct;
}

/**
 * Totais do romaneio.
 * itens: [{ volumes: "3+F", quilos: "197,5" }]
 * opts: { taraPorSacoKg, umidade, aplicarUmidade, tabelaUmidade, kgPorSaca }
 */
export function totaisRomaneio(itens, opts = {}) {
  const cfg = { ...CONFIG_PADRAO, ...opts };
  let volumes = 0, brutoDec = 0, cheias = 0, fracoes = 0;
  const erros = [];
  itens.forEach((it, i) => {
    const vazio = !String(it.volumes ?? '').trim() && !String(it.quilos ?? '').trim();
    if (vazio) return;
    const v = lerVolumes(it.volumes);
    const kg = kgParaDec(it.quilos);
    if (!v) erros.push(`Linha ${i + 1}: volumes "${it.volumes}" não reconhecido (use 4, 3+F ou F)`);
    if (!Number.isFinite(kg) || kg < 0) erros.push(`Linha ${i + 1}: quilos inválido`);
    if (v) { volumes += v.total; cheias += v.cheias; fracoes += v.fracao ? 1 : 0; }
    if (Number.isFinite(kg) && kg > 0) brutoDec += kg;
  });
  const taraDec = Math.round(volumes * (cfg.taraPorSacoKg || 0) * 10);
  const aposTara = Math.max(0, brutoDec - taraDec);
  const pctUmid = cfg.aplicarUmidade ? descontoUmidadePct(cfg.umidade, cfg.tabelaUmidade) : 0;
  // desconto em décimos de kg, arredondado para baixo a favor do produtor
  const umidadeDec = Math.floor((aposTara * Math.round(pctUmid * 100)) / 10000);
  const liquidoDec = aposTara - umidadeDec;
  return { volumes, cheias, fracoes, brutoDec, taraDec, umidadeDec, pctUmidade: pctUmid, liquidoDec, erros };
}

// ---------- partilha e acerto ----------

/**
 * Divide o total entre as partes pelos percentuais.
 * partes: [{ pessoaId, percentual }]; a primeira é o titular.
 * A diferença de centavo vai para o titular.
 */
export function partilhar(totalCentavos, partes) {
  if (!partes.length) return [];
  const soma = partes.reduce((s, p) => s + Number(p.percentual), 0);
  if (Math.abs(soma - 100) > 0.0001) throw new Error(`Percentuais somam ${soma}%, e não 100%`);
  const res = partes.map((p) => ({
    ...p,
    valorCentavos: Math.floor((totalCentavos * Math.round(p.percentual * 100)) / 10000),
  }));
  const distribuido = res.reduce((s, p) => s + p.valorCentavos, 0);
  res[0].valorCentavos += totalCentavos - distribuido;
  return res;
}

/** Saldo do produtor em décimos de kg a partir dos movimentos de estoque. */
export function saldoMovimentos(movs) {
  let s = 0;
  for (const m of movs) {
    if (m.cancelado) continue;
    if (m.tipo === 'entrada' || m.tipo === 'transferencia_entrada') s += m.pesoDec;
    else if (m.tipo === 'saida' || m.tipo === 'venda' || m.tipo === 'transferencia_saida') s -= m.pesoDec;
    else if (m.tipo === 'ajuste') s += m.pesoDec; // ajuste já vem com sinal
  }
  return s;
}

/** Em aberto de um lançamento: valor menos as baixas. */
export function emAberto(lanc, baixas) {
  const pago = baixas.filter((b) => b.lancamentoId === lanc.id && !b.estornada).reduce((s, b) => s + b.valorCentavos, 0);
  return lanc.valorCentavos - pago;
}

/**
 * Valor líquido a pagar de uma pessoa = créditos em aberto − descontos em aberto.
 * lancs: lançamentos da pessoa (status pendente/parcial). Desconto tem sinal 'desconto'.
 */
export function liquidoAPagar(lancs, baixas = []) {
  let creditos = 0, descontos = 0;
  for (const l of lancs) {
    if (l.status === 'cancelado' || l.status === 'pago') continue;
    const aberto = emAberto(l, baixas);
    if (l.sinal === 'desconto') descontos += aberto; else creditos += aberto;
  }
  return { creditos, descontos, liquido: creditos - descontos };
}
