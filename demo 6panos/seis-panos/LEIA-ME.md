# SEIS PANOS — loja fictícia de bonés importados

Loja catálogo de alta conversão. Marca, paleta, estrutura e copy pensadas para o público de streetwear/hype no Brasil.

**Nome.** Seis painéis é o que forma um boné. É nome de quem entende do produto — cria pertencimento imediato em quem é do meio e curiosidade em quem não é.

**Paleta e por quê.**

| Cor | Uso | Gatilho |
|---|---|---|
| Preto `#0B0B0B` | fundo dominante | autoridade, deixa o produto ser a única cor da tela |
| Creme `#E9E2D4` | seções de respiro e fundo de produto | editorial, é a cor da própria referência que você mandou |
| Verde-limão `#C9FF3D` | **só** em CTA, badge e preço | contraste máximo contra preto — o olho vai direto no botão |

O limão nunca aparece em texto corrido. Ele é reservado para ação. É essa escassez de uso que faz o botão funcionar.

---

## Estrutura e os gatilhos de cada bloco

**Home** — barra de anúncio rolando (frete grátis, Pix 10%) · hero com prova social numérica · quatro selos de garantia (quebra de objeção antes de qualquer preço) · categorias por formato · mais vendidos com barra de estoque real · faixa unissex · drop com contador regressivo · depoimentos com selo de compra verificada · FAQ com as seis objeções · captura de e-mail com cupom.

**Catálogo** — filtros por formato, cor, tamanho, faixa de preço e situação; ordenação; chips removíveis; contador de resultados; tabela de medidas no rodapé (a maior objeção de boné é errar o número).

**Produto** — galeria com quatro fotos · desconto em % · preço no Pix e parcelado · seletor de tamanho que trava o botão se você não escolher · "X pessoas vendo agora" + estoque restante · CTA gigante com pulso · três micro-selos · combo "leve os dois e ganhe 12%" · abas com descrição, medidas, entrega e avaliações · relacionados · CTA fixo no mobile.

**Drop** — landing de lançamento com contador, conceito, as seis peças, lookbook unissex, três regras sem letra miúda e lista de espera com privilégio de 24h.

**Checkout simulado** — identificação, entrega com duas opções de frete, três formas de pagamento com recálculo ao vivo, cupom funcionando (`PRIMEIRA10`, `SEISPANOS15`, `LACRE20`), resumo fixo e tela de pedido confirmado.

O carrinho é persistente: você adiciona na home, navega, fecha a aba e ele continua lá.

---

## Arquivos

```
seis-panos/
├─ index.html              home
├─ catalogo.html           grade com filtros
├─ produto.html            lê ?id=  ·  ex: produto.html?id=areia-rubro
├─ drop.html               landing do Drop 03
├─ checkout.html           checkout simulado
├─ prompts.html            painel de prompts com gerador por boné
├─ PROMPTS-HIGGSFIELD.md   o mesmo conteúdo em markdown
└─ assets/
   ├─ css/style.css
   └─ js/dados.js          ← os 12 produtos ficam aqui
      js/loja.js           carrinho, filtros, drawer, contador
```

**Para trocar por bonés reais:** edite só `assets/js/dados.js`. Nome, preço, estoque, tamanhos esgotados, textos — tudo sai de lá. As páginas se redesenham sozinhas.

---

## O sistema de placeholder

Toda imagem está num bloco que mostra o nome exato do arquivo que falta. Você joga a foto na pasta e o placeholder some. O site é o próprio checklist.

Cada produto usa quatro arquivos: `img/produtos/<id>-1.jpg` a `-4.jpg`. O `-1` é a sua foto do boné em fundo creme; os outros três a IA gera.

---

## Fluxo com o Higgsfield

1. Abra `prompts.html`.
2. **Passo 1:** gere os dois modelos (uma mulher e um homem) e salve como personagem. Isso é o que mantém as mesmas pessoas no site inteiro.
3. Me mande a foto do boné aqui no chat.
4. **Passo 2:** digite o nome e o id do boné no gerador. Saem os quatro prompts com os nomes de arquivo prontos.
5. Suba a foto do boné como referência no Higgsfield e cole o prompt.

A regra que faz ou quebra: com a foto do boné como referência, **não descreva o boné no prompt**. Descreva só a pessoa, a luz e o fundo. A trava no fim do texto impede o modelo de redesenhar o produto.

---

## Duas coisas antes de publicar

**Marcas registradas.** O catálogo de demonstração usa nomes de cor e formato (`Fitted 59 · Areia Rubro`), sem time e sem marca. É de propósito, para o portfólio ficar limpo. Se trocar por bonés de marca real nas fotos, o site continua funcionando — mas a peça deixa de ser inteiramente fictícia.

**Escassez honesta.** Os contadores de estoque e o cronômetro do drop puxam de `dados.js` e do relógio do navegador. Numa loja real, ligue esses números ao estoque de verdade. A copy do site inteiro foi escrita assumindo que os números são reais — inclusive a regra 02 da página de drop, que diz isso em voz alta. Escassez inventada converte uma vez e queima a marca depois.
