# Como atualizar os produtos do site

Dá para fazer pelo celular, numa planilha do Google. O site lê a planilha
sozinho: você muda lá e o site muda junto (pode levar alguns minutos).

## 1. A planilha

Cada linha é um produto. A primeira linha tem os nomes das colunas, exatamente assim:

| coluna | o que pôr | exemplo |
|---|---|---|
| id | um nome curto, sem espaço e sem repetir | sal-mineral-leite |
| nome | o nome que aparece no site | Sal mineral para gado de leite |
| categoria | uma das categorias abaixo | Nutrição animal |
| subcategoria | opcional | Sal mineral |
| marca | a marca | (nome da marca) |
| foto | link da foto (veja o passo 3) ou vazio | |
| descricao | uma frase curta | Mineralização diária do rebanho leiteiro. |
| apresentacao | tamanho ou embalagem | saco 30 kg |
| preco | preço, ou vazio para "Consultar preço" | 189,90 |
| destaque | sim ou não | sim |
| oferta_de | preço antigo, só se estiver em oferta | 209,90 |
| oferta_por | preço da oferta | 189,90 |
| exige_receita | sim ou não | não |

Categorias que já existem: **Nutrição animal**, **Saúde animal**, **Pet**,
**Ordenha e higiene**, **Silagem**, **Equipamentos e utilidades**. Se escrever
uma categoria nova, ela aparece sozinha como um novo botão de filtro.

## 2. Regras que o site segue

- **Preço vazio** mostra "Consultar preço". A pessoa ainda põe na lista.
- **Oferta**: preencha `oferta_de` e `oferta_por`. O produto entra em "Ofertas da semana".
  Para tirar da oferta, apague as duas células.
- **exige_receita = sim**: o site não mostra preço nem quantidade. Mostra o selo
  "Venda com orientação veterinária" e o botão "Consultar o veterinário".
- Para tirar um produto do site, apague a linha (ou deixe o nome vazio).

## 3. Fotos

Foto quadrada ou deitada, fundo limpo. Mande para a Theatrum que a gente
coloca no site e devolve o link para a coluna `foto`.

## 4. Ligar a planilha ao site (feito uma vez, pela Theatrum)

1. Na planilha: Arquivo → Compartilhar → Publicar na Web → escolha a aba →
   formato **CSV** → Publicar. Copie o link.
2. Em `data/config.json`, troque:
   ```json
   "catalogo": { "fonte": "planilha", "planilha_csv": "COLE O LINK AQUI" }
   ```
3. Enquanto `fonte` for `"json"`, o site usa o arquivo `data/produtos.json`.
