// Renderiza a secao "Estilo das imagens de fundo" do PUBLICACAO.md a partir
// do estilo.json. Fica num modulo separado porque o texto tem cerca de codigo
// e chaves, que brigam com o template literal do build-md.js.
const CERCA = '```';

module.exports = function secaoEstilo(estilo, PILAR) {
  const esqueleto = estilo.template
    .replace('{abertura}', estilo.abertura)
    .replace('{cena}', '{cena do post, vinda de posts.json}')
    .replace('{figura}', estilo.figura.padrao)
    .replace('{paleta}', '{paleta do pilar}')
    .replace('{luz}', estilo.luz)
    .replace('{materia}', estilo.materia)
    .replace('{respiro}', estilo.respiro)
    .replace('{clima}', estilo.clima)
    .replace('{trava}', '')
    .replace('{negativos}', estilo.negativos)
    .replace('{enquadramento}', estilo.enquadramento);

  const linhas = [
    '## Estilo das imagens de fundo',
    '',
    '**' + estilo.nome + '.** ' + estilo.resumo,
    '',
    '> **Vale a partir do post ' + estilo.vale_a_partir_de + '.** ' + estilo.estilo_anterior,
    '',
    'O arquivo `estilo.json` e a **fonte unica** do visual. `gen-imagens.ps1` (Higgsfield)',
    'e `gen-imagens-gemini.mjs` (Gemini) montam o prompt a partir dele, e esta secao e',
    'gerada dele. Para trocar o tipo de imagem de fundo, edite `estilo.json` e rode',
    '`node build-md.js` — nunca edite prompt dentro de script, senao os dois geradores',
    'saem de sincronia.',
    '',
    'O prompt de cada post e montado nesta ordem:',
    '',
    CERCA,
    esqueleto,
    CERCA,
    '',
    'A variante surreal troca a linha da figura por:',
    '',
    '> ' + estilo.figura.surreal,
    '',
    'Quando o gerador aceita referencia de imagem, vai junto uma arte ja aprovada do mesmo',
    'pilar **e do estilo vigente** (id >= ' + estilo.vale_a_partir_de + '), mais esta trava. Arte do estilo antigo nunca',
    'entra como referencia: puxaria a geracao de volta para ele.',
    '',
    '> ' + estilo.trava_referencia,
    '',
    '**Paleta por pilar** — e o que faz a grade do perfil ler como uma conta so:',
    '',
    '| Pilar | | Paleta |',
    '|---|---|---|',
  ];

  for (const [k, v] of Object.entries(estilo.paletas)) {
    linhas.push('| ' + k + ' | ' + PILAR[k] + ' | ' + v + ' |');
  }

  return linhas.join('\n') + '\n';
};
