# Projeto Theatrum

Site da Theatrum (usetheatrum.com.br): criação digital sob medida para pequenos
negócios no Brasil e no exterior, em português (principal) e inglês.
Posicionamento desde 06/10/2026 (proposta v2): site e landing page que
transformam visitante em cliente no WhatsApp, prontos para anúncio. Desde 16/10/2026,
condição de lançamento para os 10 primeiros clientes: entrada de R$ 990
(Essencial) e R$ 1.500 (Completo), cheios de R$ 1.500 e R$ 2.500. O que se
constrói vem primeiro (sites, landing pages, lojas virtuais, aplicativos e
sistemas web); Google Meu Negócio, tráfego pago, IA no WhatsApp e reativação
trazem gente até lá. Social media para Instagram é oferecido só como
complemento, com peso visual menor e dito abertamente que não é o forte.

> Este arquivo descreve **o que está no ar**, não um plano. Se o código e este
> arquivo divergirem, o código está certo e este arquivo está velho — conserte-o
> na mesma tarefa.

---

## Área de trabalho

Este arquivo mora em `.claude/CLAUDE.md`, e não na raiz, porque a raiz é
servida no domínio: até 03/10/2026 ele e o `PACOTE-COMPLETO.md` estavam
abertos em usetheatrum.com.br. `.claude/` e `interno/` têm `.htaccess`
negando acesso. **Documento interno nunca vai para a raiz nem para pasta
de página.**

Material de trabalho (clientes, propostas, PDFs, criativos, demos que
chegaram de fora) fica em `interno/`, mapeado em `interno/README.md`. Só
os documentos de processo de lá são versionados; o resto é ignorado.

**Todo site de cliente (prévia, demo ou site final) segue o padrão em
`.claude/padrao-sites.md`, importado aqui:** @padrao-sites.md
Quando o briefing pedir diferente, vale o briefing para aquele cliente.

Agentes em `.claude/agents/`: `revisor` (antes de todo push),
`previa-de-cliente`, `demo-de-segmento`, `proposta-comercial`,
`criativos` e `google-e-trafego`. O que cada um faz e por que não há
agente de IA no WhatsApp nem de reativação está em `interno/README.md`.

---

## Workflow de git (autorização permanente)

Após concluir cada tarefa/mudança lógica no código (não a cada Edit individual),
faça automaticamente:

1. `git add` dos arquivos relevantes
2. `git commit` com mensagem descritiva
3. `git push` direto para `origin/main`

Sem pedir confirmação a cada vez. Só pausar para confirmar em casos fora do
padrão: force-push, rebase, reset destrutivo, ou qualquer operação que reescreva
histórico já publicado.

**Cuidado com `git add` de pasta inteira.** Já levou junto arquivo bruto de vídeo
de vários MB mais de uma vez. Adicione caminhos explícitos e confira o
`--name-only` antes de commitar.

---

## Arquitetura técnica (o que restringe tudo abaixo)

- **Página única, arquivo único.** A home inteira é `index.html`, com CSS e JS
  embutidos. Não há componentes, não há empacotador, não há etapa de build.
  Instrução que fale em "bundle", "code splitting" ou "import dinâmico" não se
  aplica aqui.
- **Hospedagem Hostinger, servida direto do repositório.** O deploy é
  automático mas chega **em etapas**: o HTML primeiro, arquivos novos alguns
  minutos depois. Ao conferir uma publicação, imagem quebrada nos primeiros
  minutos costuma ser atraso de propagação, não erro.
- **Este repositório é publicado como site.** Um `.env` commitado aqui fica
  servido em texto puro no domínio. Chave de API só em arquivo que case com o
  `.gitignore` — inclusive cópias e backups (`.bak` **não** casa com `*.env`).
- **Dependências externas:** Google Fonts, GTM, gtag e o UET do Microsoft Ads
  (`bat.bing.com`, tag 187278315, autorizado em 02/10/2026) e o Web3Forms
  (`api.web3forms.com`, só no envio de formulário, desde 10/10/2026). O QR
  code usa o qrcode-generator (MIT) servido daqui, em `js/vendor/`, e só baixa
  quando alguém abre a opção do QR. Nenhuma outra. O GSAP saiu: custava 41 KB para cinco animações de entrada
  que o IntersectionObserver e o CSS já fazem. Não traga biblioteca de animação
  de volta.

### Orçamento de performance (regra permanente)

A home travava ao abrir e engasgava ao rolar. Depois do conserto ela abria com
DOM interativo em 2,1 s em 4G lento com CPU 4x. Medição de 10/10/2026 (servidor
local com gzip, terceiros de medição bloqueados, mediana de 3): DOM interativo
0,8 s, LCP 1,4 s, mas **~200 KB transferidos ao abrir** (o "10 KB" de antes não
se confirmou) e **2 tarefas longas (~290 ms) ao rolar**, que já existiam antes
da vitrine. As duas passam do teto e estão por investigar. Qualquer
mudança daqui para frente respeita isto:

| | teto |
|---|---|
| transferido ao abrir | 40 KB |
| DOM interativo (4G lento, CPU 4x) | 2,5 s |
| quadros acima de 16,7 ms ao rolar | 5% |
| tarefas longas durante a rolagem | 0 |

Três coisas que já custaram caro e não podem voltar: imagem servida em tamanho
maior do que aparece (o logo era 1024 px para exibir em 62), script de medição
no `<head>` (GTM e gtag custavam 3,9 s e 2,9 s de thread principal), e animação
infinita fora da tela. As seções abaixo da dobra usam `content-visibility:auto`
justamente para congelar o que não está à vista; por causa disso o navegador
rola por altura estimada, e há uma correção de âncora no fim do `index.html`
que não pode ser removida.

### A página é trilíngue — leia antes de escrever qualquer copy

Português, inglês e, desde 18/10/2026, espanhol (para México e Espanha:
"tú", espanhol neutro, preço continua em real). Há ~310 elementos com
`data-en` e `data-es` lado a lado, e o seletor de idioma (três bandeiras:
Brasil, EUA e Espanha, SVG em `<symbol>` no topo do `<body>`, no topo e no
menu do celular) troca o idioma **reescrevendo o `innerHTML`** de cada um.
Sem `data-es`, o elemento fica em português. O `<html lang>` vira `pt-BR`,
`en` ou `es`, e é isso que os componentes leem (`idioma()`), inclusive o
`js/leads.js` e o `js/consentimento.js`. As demos e o `/portfolio/` não têm
espanhol: com `theatrum-lang` = `es` eles abrem em português.

Duas consequências obrigatórias:

1. **Toda copy nova nasce nos três idiomas.** Texto sem `data-en`/`data-es`
   fica em português quando o visitante escolhe outro idioma. Componente com
   objeto de textos ganha a chave `es` junto da `en`.
2. **Componente interativo não pode viver dentro de um elemento com `data-en`.**
   A troca de idioma apaga o `innerHTML` e leva junto o estado e os listeners.
   Componente com estado guarda os próprios textos num objeto JS e se
   re-renderiza quando o idioma muda — nunca depende do `data-en`.

---

## Design system (tokens reais, conferidos no `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0B0A08` | fundo principal |
| `--bg-2` | `#100E0B` | fundo alternado |
| `--card` | `#1A1815` | cards escuros |
| `--accent` | `#E3B341` | dourado: destaques, CTAs, highlights |
| `--accent-soft` | `#F0D488` | dourado claro, hover |
| `--accent2` | `#8E1F2F` | carmim: acento secundário |
| `--cream` | `#F6F1E7` | seções claras |
| `--muted` | `#A39B8D` | parágrafo secundário |
| `--ink` | `#141210` | texto sobre fundo claro |
| `--danger` | `#D64545` | negativos e itens riscados |

Fontes: Plus Jakarta Sans 800 (títulos), Inter (corpo), JetBrains Mono
(rótulos), Instrument Serif (detalhe manuscrito). O Space Grotesk saiu: o
público é dono de negócio, não dev, e o espaçamento negativo apertado dele
atrapalhava a leitura. Com o Plus Jakarta, letter-spacing de título fica entre
-.005em e -.012em; mais que isso as letras encostam.

Leitura antes de estilo: corpo e lead em 16 a 18 px, menu em Inter 14,5 px sem
caixa-alta espaçada. O menu da home tem oito links (o último é Blog) e vira
hambúrguer abaixo de 1340 px: com menos que isso o CTA sai da tela. Link novo
no menu, meça de novo.

Rótulos de seção: minúsculo de verdade (sem `text-transform`), mono, no formato
`[nn] nome da seção`.

---

## Arquitetura de conversão

### A escada de compromisso

A página inteira existe para levar o visitante de degrau em degrau. O erro que
esta arquitetura corrige: durante muito tempo a página só oferecia o degrau 4.

| Degrau | O que o visitante faz | Atrito |
|---|---|---|
| 1 | vê a demonstração rodando | zero |
| 2 | usa a calculadora e vê o próprio número | zero, sem cadastro |
| 3 | pede o raio-x por escrito (negócio + WhatsApp) | baixo |
| 4 | diagnóstico ao vivo, 30 min | médio |
| 5 | proposta | alto |

**Regra permanente: nenhuma seção pode oferecer só o degrau 4.** Toda seção que
pede contato oferece um degrau mais baixo ao lado.

### Ordem das seções

A estrutura segue a de theds.com.br (hero com card de entrada à direita,
letreiro, serviços numerados, cases, como funciona, FAQ, "vamos conversar",
rodapé em colunas), adaptada à escada de compromisso.

```
[01] hero (+ letreiro)                 [02] trabalhos
[03] não é só um site                  [04] para quem fazemos
[05] o que fazemos                     [06] dores e soluções
[07] demonstração                      [08] a calculadora
[09] investimento                      [10] quem faz
[11] como funciona                     [12] FAQ
[13] CTA final ("vamos conversar")
```

Reordenada em 13/10/2026, depois de uma revisão do site lido como cliente:
a prova (trabalhos) vem logo depois do hero, e o preço só depois da
demonstração e da calculadora, em seção própria. A ordem segue ver que
funciona, ver que é para você, entender o que recebe, ver o próprio número,
ver o preço, conhecer quem faz. A seção `[09] entregas` está escondida e o
rótulo dela repete o `[09]`: quando ela voltar, renumere.

Palavra "sistema" ficou só onde é sistema mesmo (aplicativos e sistemas web,
o plano Sob medida). Para falar da oferta, é site, Google e anúncio: o CTA
final e o FAQ ainda vendiam "o seu sistema", da oferta antiga.

- **Hero:** título à esquerda com a palavra de destaque em serif itálico
  dourado, botões "Fazer diagnóstico gratuito" (WhatsApp) e "Ver projetos"
  (`#trabalhos`, logo abaixo) e três selos (prévia antes de pagar, no ar em 7 a
  10 dias úteis, tudo no seu nome: o que o site faz fica para o `[03]`); à direita um card (topo dourado, base escura)
  com três degraus: calculadora, planos e preços, e WhatsApp. Atrás do card,
  colada na direita e na altura da tela, a estátua de gravura de óculos
  dourados (`assets/img/hero/estatua-{480,816}.webp`, 40 e 119 KB): vem sobre
  preto e entra com `mix-blend-mode:screen`, então o preto some e o fundo do
  hero continua o mesmo. No computador o card desce (`align-self:end`) para
  o rosto ficar à vista; abaixo de 980 px ela fica a 22% atrás do texto,
  espelhada (olhando para o texto), com 62svh de altura e colada na direita.
  Por baixo de tudo, um vidro líquido sutil: fundo, grade e estátua ficam em
  `.hero-fundo`, que passa pelo filtro SVG `#hx-vidro` (ondulação larga,
  `scale` 16, `color-interpolation-filters="sRGB"`, senão o fundo escuro
  escurece e aparece um arco avermelhado); `.hero-vidro` só põe o brilho do
  topo. Estático de propósito: nada dentro de `.hero-fundo` pode animar,
  porque cada quadro refaria o filtro na tela inteira. `backdrop-filter`
  foi testado e deixava defeito de cor. Desde 13/10/2026, relâmpagos no
  fundo, em `.hero-raio`, camada própria fora do `.hero-fundo`, atrás do
  texto: uma descarga a cada 4 a 10 s, com o raio desenhado em SVG na hora
  (sem imagem) e um clarão em degradê, só a opacidade anima. No computador
  cai atrás da estátua (64 a 94% da largura), longe do título; no celular
  vai a 40% da intensidade porque passa atrás do texto. No máximo dois
  piscos por descarga (abaixo de 3 por segundo, por fotossensibilidade).
  Só roda com o hero à vista e a aba aberta; desligado com
  `prefers-reduced-motion` e `?still=1`.
- **`[03]` não é só um site (`#nao-e-so-um-site`):** quatro cards claros
  (rápido no celular, pronto para anúncio, texto que vende, cada contato
  avisado); "tudo no seu nome" saiu em 13/10/2026 porque já está no hero e no
  FAQ. O lead é o "no longo prazo" da antiga aba Site do `[06]` (o site é o
  único canal inteiramente seu). Sem CTA próprio. Sem jargão de ferramenta: o
  card de anúncio diz "você sabe qual anúncio, busca ou post trouxe cada
  contato", não GTM, GA4 e Pixel.
- **`[04]` para quem fazemos (`#para-quem`):** um card por nicho (advogados,
  clínicas, engenharia e arquitetura, consultorias, imobiliárias) mais o de
  reformulação. Cada card abre o WhatsApp com o nicho na mensagem e, onde há
  demo, tem "ver exemplo". Quando as páginas de nicho existirem, o card leva
  para elas.
- **`[05]` o que fazemos (`#servicos`):** título "O que a gente constrói, e o
  que leva cliente até lá" (não mais "tudo o que o seu negócio precisa").
  Três grupos em ordem de peso.
  "Para construir": três cards grandes e escuros (sites e landing pages, lojas
  virtuais, aplicativos e sistemas web). "Para trazer cliente": quatro cards
  brancos (Google Meu Negócio, tráfego pago, IA no WhatsApp, reativação); os
  dois primeiros têm "ver por quê" com `data-aba`, que abre a aba certa no
  `[06]`, logo abaixo. Por último, uma faixa tracejada e discreta de social media, marcada
  "complemento".
- **`[06]` dores e soluções (`#problema`):** abas por canal que traz cliente
  (Google Meu Negócio, tráfego pago, atendimento). A aba Site saiu em
  13/10/2026: repetia o `[03]` ponto por ponto. Cada painel põe "mal configurado:
  o prejuízo" ao lado de "bem configurado: o benefício" e fecha com "no longo
  prazo". Os botões das abas têm `data-en`, mas o estado mora no próprio botão;
  sem JS (e em `?still=1`) os três painéis aparecem empilhados. O id
  `#solucao` continua dentro dela.
- **`[09]` investimento (`#investimento`):** seção própria desde 13/10/2026,
  com fundo `--bg-2` para não emendar com a calculadora (os estilos `.inv` e
  `.pl-*` continuam no bloco do `[06]`). Desde 16/10/2026, condição de
  lançamento para os 10 primeiros clientes. **Todo preço da home sai do
  `data/precos.json`** (núcleo `window.TheatrumPrecos`, script "PREÇOS: um
  lugar só" antes do `[07]`; o `PADRAO` de lá é o mesmo JSON com zero vagas,
  para o primeiro desenho e para falha no fetch; o JSON só baixa quando o
  `[07]` ou o `[09]` chegam perto). O Matheus só mexe em `vagasPreenchidas`
  (passo a passo em `docs/como-atualizar-vagas.md`): de 0 a 2 vale o preço de
  lançamento (Essencial R$ 990, Completo R$ 1.500 ou 3x R$ 500, Sob medida a
  partir de R$ 2.500, manutenção R$ 97/mês), de 3 a 9 o intermediário
  (R$ 1.200, R$ 1.800, R$ 2.500, R$ 97), e em 10 voltam os cheios sem risco (R$ 1.500, R$ 2.500, a partir de
  R$ 4.900, R$ 197). O intermediário do Sob medida (R$ 2.500) não foi
  definido pelo Matheus: é o mesmo do lançamento até ele decidir. Cheio em
  `<del>`, novo em `<strong>`, com texto só para leitor de tela. No celular
  o Completo vem primeiro. Embaixo dos cards, só a faixa da manutenção
  (fidelidade de 12 meses). A faixa com o contador de vagas e a escada de
  preço, o "Por que esse preço?", a letra miúda (prazo, rodadas, fora do
  escopo) e a linha da gestão de tráfego saíram em 16/10/2026, a pedido;
  a gestão de tráfego segue no `[07]`. Tudo que tem número é
  desenhado pelo script do fim da seção (objeto `TX`, sem `data-en`); o HTML
  é o estado com zero vagas. O selo do Completo é "recomendado", não "mais
  escolhido": com zero cliente seria prova social inventada (o pedido de
  16/10/2026 dizia "Mais escolhido"; ficou "recomendado"). Cada card abre o
  WhatsApp citando plano e preço e dispara `plano_click`.
  Mudou valor de plano (não só as vagas)? Mude também o `PADRAO` e o HTML
  estático do `[09]`, que é o que aparece sem JS ou se o fetch falhar.
  Desde 18/10/2026 a moeda segue o idioma: real em português, dólar em
  inglês, euro em espanhol, **com os mesmos números** (R$ 990, US$ 990,
  990 €). Sem câmbio, a pedido: só o `fmt()` do núcleo troca o símbolo e o
  formato. Os R$ 697 da gestão de tráfego seguem a mesma regra
  (`data-pr-px="trafego"`), e a calculadora mostra a moeda do idioma.
  A mensagem de WhatsApp dos planos continua em português e em reais.
- **`[10]` quem faz (`#quem-faz`):** foto e texto do Matheus e, desde
  18/10/2026, o bloco "Um time de agentes de IA. Uma pessoa orquestrando."
  (`#qfTime`): o Matheus no topo ("orquestra e aprova") ligado por um trilho
  a cinco agentes de `.claude/agents/` com nome de cliente (sites e
  sistemas = `previa-de-cliente`, demonstrações, Google e tráfego, marketing
  e criativos = `criativos`, revisão = `revisor`). O de proposta comercial
  saiu em 18/10/2026, a pedido: não mostrar. Não há agente de marketing
  próprio; não invente card de agente que não existe. Agente novo ou
  removido lá, mude aqui. Um ponto dourado corre no trilho só com o bloco à vista,
  nunca com menos movimento ou `?still=1`.
- **`[02]` trabalhos:** logo depois do hero desde 13/10/2026 (antes era o
  `[08]`). Desde 13/10/2026, os vinte e seis sites em quatro
  blocos (2x2 no computador, empilhados no celular), como espaço de anúncio:
  cada bloco passa um site por vez (troca em degradê, cada bloco defasado
  1,3 s do anterior) com "site para {tipo}", nome e selo "demonstração" ou
  "cliente real" embaixo. Sete sites nos dois primeiros blocos e seis nos
  outros (lista no objeto `VS`). Todo bloco dá a volta no mesmo tempo
  (`CICLO`, 7 x 5,2 s): o de sete segura cada site 5,2 s e o de seis, 6,1 s.
  Com tempo igual por site, blocos de tamanhos diferentes se desencontram e
  toda combinação acaba acontecendo. A ordem foi achada por busca
  (recozimento simulado, simulando o relógio) para dois blocos nunca
  mostrarem o mesmo tipo ao mesmo tempo, contando marcenaria (Ateliê Verga,
  Cerne) como tipo separado de planejados: mexeu na lista, rode a busca de
  novo. A Caparaó Solar saiu da vitrine em 13/10/2026, a pedido (a demo
  continua no ar). Imagens em `assets/img/vitrine/home/` a 480 e
  800 px por srcset (redução do `*-desktop.webp`, WebP q72); cada bloco só
  baixa a atual e a próxima quando ele mesmo chega perto da tela, e só troca
  à vista. Nada baixa ao abrir a página. Para no mouse; setas nas laterais
  da tela e bolinhas grandes (a atual vira pílula dourada) trocam na mão;
  sem rotação com `prefers-reduced-motion` e `?still=1`. Acima dos blocos,
  os tipos de negócio desses sites numa linha só de selos amarelos,
  centralizada (no celular ela rola de lado dentro dela mesma), sem botão
  (o `/portfolio/` está desativado). Embaixo dos blocos, desde 12/10/2026,
  um letreiro com os logos das 25 demos (`#marcas`, título centralizado
  "as marcas desses sites"; o selo "inventadas para demonstração" saiu em
  13/10/2026 a pedido, mas nunca chame de "parceiras": são marcas
  fictícias, e o lead da seção já diz "marcas inventadas"). Cada logo foi recortado do cabeçalho da própria demo
  e passado para um tom creme, em `assets/img/marcas/`: exibido entre 20
  e 40 px de altura (mais baixo quanto mais largo) e salvo a 2x disso
  (cerca de 80 KB no total, só baixa quando a seção chega perto). Para fora da
  tela, no mouse e no foco do teclado; sem movimento e em `?still=1`
  vira grade parada. Logo de demo mudou, refaça o recorte dela. Links das telas levam
  `?de=home`.
- **`[07]` demonstração (`#sistema`):** desde 11/10/2026, um sistema só que
  apresenta a proposta inteira, no lugar das 11 demos soltas de antes (que
  ainda tinham "faturamento crescendo" e "painel de metas", da oferta
  antiga). O visitante escolhe o nicho (os cinco do `[04]`) e acompanha um
  cliente fictício em cinco etapas: te encontram (Google e mapa), chegam no
  site, chamam no WhatsApp, não esfriam (retomada e reativação) e você
  acompanha (painel, tudo no seu nome). Ao lado de cada tela, "o que a
  Theatrum entrega aqui" com o preço daquela parte; **mudou preço no `[09]`,
  vem do `data/precos.json` pelo `precosPX()`.** Embaixo, a proposta em três linhas (Completo,
  manutenção, R$ 697/mês + verba; as duas primeiras desenhadas pelo mesmo núcleo), o CTA de WhatsApp e o degrau mais baixo
  (calculadora). Textos nos objetos `PX_N` e `PX_T`, redesenho na troca de
  idioma. A troca de etapa é a própria barra de progresso (animação CSS):
  pausa fora da tela e com aba escondida, e nada mais a para: desde
  13/10/2026 o mouse em cima não pausa e o clique numa etapa só pula para
  ela, e a passagem segue sozinha dali. Selo "exemplo" no topo: os nomes e conversas são
  ilustração, não prova social.
- Destaque em título (`.lm`) é serif itálico dourado (`#8A6412` nas seções
  claras), não mais marca-texto.
- O modo QA `?still=1` desliga animações e o `content-visibility`, para print
  da página inteira no Chrome headless.

### Regras de copy da marca

- Frases curtas. Segunda pessoa. Zero jargão de agência.
- **Número só entra com origem declarada.** Se veio do que o visitante digitou,
  o texto diz isso.
- **Nenhuma prova social inventada** — nem nome, nem print, nem nota, nem
  estatística de mercado sem fonte. Slot vazio é preferível a slot fabricado.
- Rótulo de seção em minúsculo com índice `[nn]`.
- Sem travessão (—) na copy publicada.
- Palavras proibidas no site e nos anúncios: "barato", "preço baixo",
  "promoção", "grátis" (vale "gratuito"), "a partir de R$ 99", "site em 24h".

### Mensagens do WhatsApp por origem do clique

Todo botão usa link `wa.me` direto, nunca widget de terceiro, e leva mensagem
diferente conforme de onde a pessoa clicou:

| Origem | Mensagem |
|---|---|
| hero (botão principal) | "Vim do site da Theatrum. Quero o diagnóstico gratuito." |
| hero (card) | "Vim do site da Theatrum. Quero o raio-x do meu negócio." |
| para quem fazemos | "Vim do site da Theatrum. Tenho {nicho} e quero um site que traga cliente." (reformulação: "Já tenho site, mas ele não traz cliente. Quero uma reformulação.") |
| o que fazemos | "Vim do site da Theatrum. Quero um site ou sistema para o meu negócio." |
| calculadora | "Vim do site. A calculadora deu R$ {N} por mês. Quero o plano." |
| demonstração | "Vi as demonstrações no site e quero isso rodando no meu negócio." |
| entregas | "Vi os sites que vocês entregaram. Quero um diagnóstico." |
| FAQ | "Tenho uma dúvida antes do diagnóstico:" |
| CTA final | "Quero meu diagnóstico gratuito." |
| investimento (cards) | "Olá! Vi a condição de lançamento e quero o plano {plano} ({preço})." (depois das 10 vagas: "Olá! Vim do site da Theatrum e quero o plano...") |
| blog (topo, menu e rodapé) | "Vim do blog da Theatrum. Quero o diagnóstico gratuito." |
| blog (CTA do artigo) | "Vim do blog da Theatrum, do artigo "{título}". Quero o diagnóstico gratuito." |

### WhatsApp no computador, formulários e pop-up de saída (`js/leads.js`)

Carregado em todas as páginas do site principal (as mesmas do UET). Desde
10/10/2026.

- **Celular** (user agent móvel, iPad incluído, ou tela abaixo de 1024 px):
  todo link de WhatsApp abre o `wa.me` direto.
- **Computador:** clique simples em link `wa.me`/`api.whatsapp.com` abre um
  modal em duas colunas, tudo à vista numa tela (desde 19/10/2026): à
  esquerda o formulário, com duas abas, diagnóstico por e-mail (nome,
  empresa, e-mail, site opcional; a aba aberta) e "me chamem no WhatsApp"
  (nome, empresa, WhatsApp com máscara); à direita o QR code do link
  clicado, o WhatsApp Web e o app. Abaixo de 760 px as colunas empilham.
  Ctrl/Cmd+clique passa direto.
- **Envio:** Web3Forms, chave em `ACCESS_KEY` no topo do `js/leads.js`
  (pública por desenho; o destino é o e-mail dono da chave, que não aparece
  no código). Assunto "🔥 Novo lead Theatrum – {nome} – {empresa}", com
  página e botão de origem, idioma, aparelho e gclid/utm. Honeypot
  `botcheck`. **Sem chave, não aparece formulário nenhum:** o modal mostra só
  a coluna do WhatsApp e o pop-up de saída não arma. Falha com chave mostra "não
  consegui enviar" e oferece o WhatsApp Web com os dados escritos.
- **Pop-up de saída:** só no computador, mouse saindo pelo topo, armado
  depois de 8 s, uma vez por visita (`sessionStorage` `theatrum-saida`) e
  nunca para quem já enviou formulário (`localStorage` `theatrum-lead` =
  `enviado`). Pede só o e-mail para "3 melhorias para o site da sua
  empresa". O antigo pop-up do raio-x em 24 h saiu.
- **Card do raio-x de 70% (home), "Não quer falar agora?":** usa o mesmo envio
  (`TheatrumLeads.enviar`) e não aparece mais depois que o pop-up de saída
  abriu. Desde 13/10/2026 não fica preso no canto: sai sozinho quando a
  pessoa rola mais de uma tela sem tocar nele e quando chega no CTA final ou
  no rodapé (cobria a coluna de contato). Quem clica num campo fica com ele
  até fechar. Saiu uma vez, não volta na visita.
- **Promessas publicadas, valem assim que a chave entrar:** o "me chame"
  diz "vou te chamar no WhatsApp em poucos minutos (horário comercial)";
  o diagnóstico por e-mail e as 3 melhorias do pop-up dizem que chegam no
  e-mail. Cada lead precisa ser atendido nesse ritmo.
- Textos num objeto JS, não em `data-en`; a caixa abre no idioma da página.

---

## Demais páginas do domínio

- `/portfolio/` — **desativada desde 13/10/2026:** o `.htaccess` da pasta manda
  para `/#trabalhos`, onde os vinte e seis passam em quatro blocos, e a
  home não linka mais para cá. Para reativar, apague o bloco "DESATIVADA" e
  volte os links "Trabalhos" e "Portfólio" da home para `portfolio/`. A
  página: a vitrine dos vinte e quatro sites, em cinco
  esteiras: planejados, nutrição, imóveis, negócios locais e, por último,
  lojas. Botão "Voltar para
  usetheatrum.com.br" no topo e no fim, levando a `../#trabalhos`; a home
  corrige a âncora de quem chega com `#secao` no endereço. Quem abre uma demo a partir daqui volta para cá: os links levam
  `?de=portfolio` e os seis `_demo.js` (imóveis, lojas, planejados, negócios, nutrição e solar) conhecem essa origem.
  Exceção: o card do Little Trees (cliente real, faixa de lojas) aponta para o
  site dele no ar, `littletrees-indol.vercel.app`, cujo código mora em repositório
  próprio (`Desktop/littletrees`), fora deste site.
- `/us/` — landing separada, só em inglês, para anúncios nos EUA e Reino Unido.
  Oferta reduzida: site US$ 500, site + Google Business Profile US$ 700.
  **Desativada desde 18/10/2026:** o `.htaccess` da pasta manda para a home
  (que tem inglês e espanhol), e o link "Theatrum US" saiu do rodapé da home
  e do blog e do sitemap. As demos abertas com `?de=us` ainda apontam para
  `/us/` e caem na home. Para reativar, apague o bloco "DESATIVADA", volte o
  link do rodapé (home e `scripts/blog/modelos.mjs`) e a linha em
  `PAGINAS_SITE` do `scripts/blog/build.mjs`.
- `/moveis-planejados/` — landing do segmento de planejados. **Desativada desde
  13/10/2026:** o `.htaccess` da pasta manda só a landing para a home; as seis
  demos em `demos/` seguem no ar (vitrine da home). O `_demo.js` de lá, sem
  `?de=`, devolve para a home. Saiu do rodapé da home e do blog e do sitemap.
  Para reativar, apague o bloco "DESATIVADA" e volte o link do rodapé e a
  linha em `PAGINAS_SITE` do `scripts/blog/build.mjs`.
- `/aml/` — prévia do site da AML (medicina e segurança do trabalho, Cataguases,
  Leopoldina e Muriaé), feita para vender o projeto. Cliente real, então leva
  `.htaccess` com noindex e os dados que faltam aparecem como placeholder
  amarelo, nunca inventados. Briefing, README de pendências e `netlify.toml`
  ficam em `interno/clientes/aml/`, fora do git.
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
  A versão de portfólio, com marca fictícia, está em `/negocios/demos/`.
- `/engmais/` — prévia do site da Eng+ (consultoria ambiental e segurança do
  trabalho, Dores do Rio Preto, ES e MG), no mesmo molde da AML: noindex,
  placeholder amarelo, diagnóstico em dois caminhos (produtor e empresa) e
  simulação de WhatsApp. Pendências em `interno/clientes/engmais/README.md`, fora do git.
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
  A versão de portfólio, com marca fictícia, está em `/negocios/demos/`.
- `/recanto/` — demo do site do Chalés Recanto Alto Caparaó (chalés A-frame,
  refúgio romântico), para vender o projeto. Mesmo padrão da AML: `.htaccess`
  com noindex, faixa de demonstração no topo e placeholder amarelo para todo
  dado que falta (qualquer texto entre colchetes nos JSON vira placeholder).
  **Tudo vem de dados:** chalés, extras, informações, FAQ, rodapé e o schema
  LodgingBusiness são montados pelo `js/render.js` a partir de
  `data/chales.json`, `data/extras.json` e `data/info.json`; o HTML só tem os
  contêineres. Chalé novo = bloco no `chales.json` + pasta em
  `assets/fotos/chale-N/`; o grid se ajusta de 1 a 4. Status: `ativo`,
  `pre-agendamento` (card com selo e "Quero ser um dos primeiros") ou `oculto`
  (não aparece; enquanto houver oculto, uma faixa convida para a lista dos
  primeiros, configurada em `novosChales` no `info.json`). Os chalés 3 e 4
  já estão no JSON como `oculto`. A cliente não quer pagamento nem sistema de
  reserva: `#reservar` ("Monte sua estadia") vai virar um simulador que manda o
  pedido pronto para o WhatsApp dela (próxima etapa do briefing v2).
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
  A versão de portfólio, com marca fictícia, está em `/negocios/demos/`.

- `/inovar/` — demo do site da Inovar Agroveterinária (agropecuária, farmácia e
  clínica veterinária, lojas em Dores do Rio Preto e Guaçuí, ES). Mesmo padrão:
  `.htaccess` com noindex, faixa de demonstração e placeholder amarelo. Produtos
  só informativos (categorias + "perguntar no WhatsApp"): o cliente pediu para
  tirar catálogo, lista de pedido e seletor de loja. Agendamento de veterinário
  em 5 passos e calendário do rebanho (setas e arraste, sem barra). Números e
  rotas em `data/config.json`; calendário em `data/calendario.json`, todo
  marcado para revisão dos veterinários. Pendências em `interno/clientes/inovar/README.md`,
  não commitada.
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
  A versão de portfólio, com marca fictícia, está em `/negocios/demos/`.

- `/armazem/` — demo do sistema de gestão do Armazém Gerais Caparaó (romaneio,
  estoque, caderno de RV, pendências, relação de pagamentos), para vender o
  projeto. É sistema, não site: roda no navegador em ES modules sem build, com
  dados no `localStorage` e seed fictício; PDF pela impressão do navegador.
  `.htaccess` com noindex, faixa de demonstração, sem UET. As regras de cálculo
  ficam puras em `js/calculo.js`, testadas em
  `interno/clientes/armazem-caparao/testes/` (fora do git). Fica como prévia leve de venda.
  O sistema de verdade (React + Vite + Supabase, especificação de 03/10/2026) está em repositório
  próprio, `Desktop/armazem-caparao`, fora deste site: o modo demonstração dele leva um Postgres
  inteiro para o navegador (~5,5 MB) e não serve como link de venda. Pendências em `interno/clientes/armazem-caparao/README.md`.
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.

- `/armazem-caparao/` — prévia do site institucional do mesmo cliente (o sistema é `/armazem/`),
  inspirada na estrutura da atlanticacoffee.com, mas para mercado interno: três caminhos (vender,
  guardar, comprar café), serviços tirados da operação real e placeholder amarelo para tudo que
  depende da entrevista. Contatos do cartão são reais; endereço, números e história não. `.htaccess`
  com noindex, sem UET. O roteiro da entrevista é um artifact privado no claude.ai (link em
  `interno/clientes/armazem-caparao/README.md`), que guarda as respostas para preencher a prévia.
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
- `/gabriela-carolina/` — prévia do site da Gabi (Gabriela Carolina: psicanálise, comportamento e
  Reiki, atendimento online; vende também os sprays e florais da Myano). Feita fora daqui e trazida
  em 05/10/2026. Mesmo padrão das outras prévias: `.htaccess` e meta com noindex, faixa de
  demonstração, sem UET, placeholder amarelo. Atendimentos, "Por onde começar?" (assistente de 5
  perguntas que monta a mensagem do WhatsApp), prints de depoimento em marquee e vitrine Myano vêm
  de `data/*.json`. Os prints são stories que ela mesma publicou; ainda falta autorização por
  escrito de cada cliente antes de virar site oficial. Prints originais e README do projeto em
  `interno/clientes/gabriela-carolina/`, fora do git.
  A versão de portfólio, com marca fictícia, é a Lívia Amaral, em `/negocios/demos/livia-amaral/`.
  O `css/style.css` daqui tem um `@media (min-width: 600px) {` sem fechar (linha 340) que deixa
  metade da página sem estilo abaixo de 600 px; corrigido na Lívia em 11/10/2026, não aqui.
  **Fora do ar desde 11/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
- `/bia-de-luca/` — prévia de redesenho do biadeluca.com.br (terapeuta vibracional quântica e
  palestrante, São Paulo, atende a distância), feita para prospecção em 05/10/2026. Conteúdo e
  fotos tirados do site atual dela, sem nada inventado; promessas de saúde suavizadas e aviso de
  terapia complementar. Mesmo padrão: `.htaccess` e meta com noindex, faixa de demonstração, sem
  UET, placeholder amarelo. "Por onde começar" e florais clicáveis montam a mensagem do WhatsApp.
  Pendências e argumentos de venda em `interno/clientes/bia-de-luca/README.md`, fora do git.
  **Fora do ar desde 06/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
- `/antonios/` — prévia do site da Antonio's Corretagem de Imóveis (Recreio dos Bandeirantes, RJ,
  CNPJ ativo há 18+ anos), feita para prospecção em 06/10/2026 no molde da demo Vista Imóveis,
  mas clara (areia, azul-petróleo, coral). Vídeo do hero montado em ffmpeg a partir de três fotos
  do Wikimedia Commons (Recreio, Barra, Rio do alto), com crédito no rodapé; o vídeo só carrega
  depois do `load` e pausa fora da tela. Catálogo com filtros, comparador e simulador Price na
  gaveta do imóvel, mas os doze imóveis são **exemplo** (selo amarelo, fotos reaproveitadas das
  demos de imóveis). Avaliação em quatro passos monta a mensagem do WhatsApp. O número do WhatsApp
  ainda é o fixo do CNPJ (`ZAP` no topo do `js/main.js`). Mesmo padrão: `.htaccess` e meta com
  noindex, faixa de demonstração, sem UET. Pendências em `interno/clientes/antonios/README.md`.
  A versão de portfólio, com marca fictícia, é a Maré Mansa, em `/imoveis/demos/mare-mansa/`.
  **Fora do ar desde 11/10/2026:** o `.htaccess` da pasta manda para a home;
  os arquivos continuam aqui. Para reativar, apague o bloco "DESATIVADA" dele.
- `/doctors/` — prévia do site da Doctors Odontologia Especializada (Arapiraca Garden Shopping,
  Arapiraca, AL), feita para prospecção em 12/10/2026 com as fotos da clínica e os cards da equipe
  que eles mesmos publicam (sete dentistas com CRO e a gerente). Paleta e tipografia (Jost) tiradas
  do banner deles: creme, dourado e grafite. Hero com a foto numa moldura em "D" (a marca deles),
  rostos da equipe num card e um marquee dourado de tratamentos, que só anda à vista
  (IntersectionObserver) e para com `prefers-reduced-motion`. O menu destaca a seção na tela.
  Cards da equipe entram em cascata e, no hover, sobem, dão zoom, ganham um brilho dourado e
  mostram o CRO (no celular o CRO fica sempre à vista). Atrás do site, um degradê dourado fixo
  (`body::before`) deriva devagar só com transform; seções claras são semitransparentes para
  ele aparecer.
  Tratamentos e equipe vêm dos objetos `TRATS` e
  `EQUIPE` do `js/main.js`; cada card e cada dentista abre o WhatsApp com mensagem própria, e o
  "Por onde começar" (três perguntas) indica o especialista e monta a mensagem. Avaliações são
  slot vazio, responsável técnico e EPAO do CRO-AL ficam como placeholder (o CFO exige no
  anúncio). O WhatsApp (`ZAP`) é o do link da bio; o banner mostra outro número, a confirmar.
  Mapa só carrega no clique. Marca d'água fixa no canto inferior esquerdo ("Site feito pela
  Theatrum", logo em `assets/img/theatrum-64.webp`) leva à home com
  `utm_source=previa&utm_medium=marca-dagua&utm_campaign=doctors`; sai na versão final. O
  servidor manda o navegador guardar CSS e JS por 7 dias: mudou um dos dois, sobe o `?v=` no
  `index.html`. Mesmo padrão: `.htaccess` e meta com noindex, faixa de prévia, sem
  UET. Fotos originais e pendências em `interno/clientes/doctors/`, fora do git.
  A versão de portfólio, com marca fictícia, é a Arco, em `/negocios/demos/arco/`.
- `/fornari/` — prévia da landing do Felipe Fornari (Team Fornari: treinador com consultoria
  online e presencial, sócio da Espaço Saúde em Caparaó, MG; presencial em Caparaó e Alto Caparaó), feita para prospecção em
  12/10/2026. Substitui o caminho bio → Linktree → Google Forms de 50 perguntas: o seguidor vê os
  resultados e faz uma aplicação de 7 perguntas (`js/aplicacao.js`, regras do plano no topo) que
  monta a mensagem do WhatsApp; a anamnese completa fica para depois do pagamento. Estética de
  guerreiro nórdico nas cores dele (preto-pedra, verde `#08A577`, neon `#2EE38A` em brilho e destaque, um toque
  de ouro), tudo em SVG próprio: emblema do clã, nós entrelaçados, barras com traços e marcas de
  inspiração rúnica desenhadas por `js/runas.js` (sem fonte extra), cartas de antes/depois em leque e a
  serra do Caparaó com o Pico da Bandeira no rodapé, com um atleta rompendo a pedra. **Nada de
  símbolo pagão** (Odin, Thor, Valknut, Mjölnir...): ele declara fé cristã. Por isso as
  marcas do `runas.js` não são letras do Futhark: tiwaz e ansuz são runas de deuses e a
  othala tem uso neonazista. Não troque por runas de verdade. Títulos em Bebas Neue (a fonte das artes dele), corpo em Inter. Fotos dele (retrato no
  hero, à direita no computador e no topo no celular; academia em "quem é") vêm de
  `assets/fotos/felipe/`, tiradas do Instagram dele para a prévia; os originais ficam em
  `interno/clientes/fornari/originais/`. As cartas de resultado são 14 artes de antes e depois recortadas dos posts dele
  (`assets/antes-depois/`), **autorizadas só para a prévia**: no site oficial, cada aluno
  precisa autorizar o uso no site. Elas passam num carrossel (carta da vez no centro, vizinhas
  inclinadas e girando em 3D, até a borda da tela no computador com degradê nas laterais;
  troca a cada 3,2 s só à vista, para só com o mouse sobre a carta do centro ou foco de
  teclado (pausar na seção inteira travava o carrossel); setas grandes nas laterais e
  arraste com dedo ou mouse, as cartas acompanhando), e as
  divisórias (contador e troca de seção) são uma linha fina que some nas bordas, com um
  losango no centro, paradas. Títulos de
  seção têm a barra ornamental só em cima. Fundos com ritmo (12/10/2026): sem textura de pedra;
  preto `#0A0B0A` com grão de filme fixo a 5%; hero com o retrato em duotone gerado em
  arquivo (`retrato-duo-*`, sem filtro na página); serra do Caparaó em três camadas com névoa
  depois do hero (parallax leve, só à vista); holofote verde e reflexo nas cartas; "três
  passos" em branco-osso; nó gigante a 4% atrás da aplicação; "quem é" sobre a foto da
  academia já desfocada em arquivo (`academia-blur.webp`, 4 KB); "seu arsenal" em verde
  sólido; 22 brasas em CSS em cada seção de fundo preto (resultados, aplicação, feedbacks,
  planos e dúvidas: `.tem-brasas`), paradas fora da tela; cortes diagonais de 3,5°
  (`.corte`) entre as seções escuras. Contraste conferido: o menor é 5,7:1. Fontes servidas
  daqui (`fonts/`, OFL) com preload: o Google Fonts custava a troca de fonte tardia e
  deixava a Performance em 85-88. Lighthouse mobile no ar: Performance 97-99,
  Acessibilidade 100 (SEO baixo é o noindex). Logos dele (monograma "FPe" e Team Fornari)
  recortadas de print, brancas em fundo transparente, em `assets/img/`: no topo só a Team
  Fornari; o monograma fica só no ícone da aba e na página de links (só o "FPe" do centro). Cartas e números vêm de `data/resultados.json`
  e `data/config.json`, com `null` virando placeholder. `ZAP` vazio no `js/main.js` e no
  `links/`. `/fornari/links/` substitui o Linktree. Mesmo padrão: `.htaccess` e meta com
  noindex, faixa de demonstração, sem UET, marca d'água com `utm_campaign=fornari` (`fornari-links` no `/links/`).
  CSS, JS e os `fetch` dos JSON com `?v=`: mudou um deles, sobe o número (o navegador
  segurava o `resultados.json` antigo e o carrossel aparecia com as cartas de exemplo). Pendências
  em `interno/clientes/fornari/README.md`, fora do git.
  Saiu do ar em 13/10/2026 e voltou no mesmo dia, a pedido (bloco "DESATIVADA"
  apagado do `.htaccess`; o noindex continua).
  A versão de portfólio, com marca fictícia, é o Clã Valente, em `/negocios/demos/cla-valente/`.
- `/nerd-club/` — prévia do site da Nerd Club (loja de games, oficina de videogame e
  colecionáveis na Várzea, Teresópolis, RJ) com a InCubo (impressão 3D, marca parceira),
  para prospecção, desde 14/10/2026. O brief do cliente pedia Astro + Tailwind + Vercel;
  ficou estático no molde da casa, Astro só se ele fechar com domínio próprio. Conceito
  "INSERT COIN": fliperama synthwave (roxo `#5B1A9A`, fundo `#0B0820`, neon magenta,
  ciano e amarelo; a InCubo vira "Mundo 2" em azul `#2B3BFF` e vermelho `#E8232A`),
  Press Start 2P só em título curto e botão, VT323 em detalhe de tela, Inter no corpo,
  as três servidas daqui. Pixel art **só original**: os flyers deles usam Mario, Link e
  logos de console, o site não. Contato, horário e cupom em `js/config.js` (null vira
  placeholder) e um `whatsappLink()` só; vitrine, serviços, InCubo, avaliações e
  antes/depois em `data/*.json`, com `_leia` dizendo o que pode entrar. Os produtos são
  todos exemplo; antes/depois fica vazio até vir foto real. As avaliações são 5 reais do
  Google Maps (as que aparecem sem login, de 52, nota 5,0), texto igual ao original e
  sobrenome abreviado; horário também veio do perfil do Google. Sem `aggregateRating` no
  JSON-LD: o Google não aceita nota da própria empresa marcada no site dela (o "guia de
  limpeza" do Instagram tem "depois" de banco de imagem). Desbloqueio fora da prévia
  (`ativo: false`): os flyers prometem "jogos infinitos". O COINS do HUD é moeda que o
  visitante junta explorando, não número da loja. Em fases: 1 (base) e 2 (home)
  no ar; `/oficina`, `/loja` e `/incubo` vêm na 3, e até lá os cards e o menu levam
  às seções da home. A home: abertura de 1,7 s (uma vez por sessão, pulável, nunca com
  movimento reduzido nem em `?still=1`, que desliga tudo que se mexe), seleção de
  missão com setas do teclado e atributos tirados dos flyers (nada de "garantia", que
  ninguém confirmou; desde 16/10/2026 os cards da missão e os serviços da
  oficina são caixas de jogo amarelas, com canto em degrau feito por sombra, sem
  border-radius, e a da InCubo fica azul), diagnóstico rápido em `js/diagnostico.js` (montado por
  `[data-diagnostico]`, reaproveitável na `/oficina`; os serviços ao lado são blocos curtos em
  duas colunas, com `nomeCurto` e `curto` do `servicos.json`, e o texto longo fica para a
  `/oficina`; o prazo é uma linha só, `prazos` no `config.js`, placeholder enquanto `null`), antes/depois arrastável,
  vitrine em cartuchos, InCubo com o "warp" de entrada, high scores e mapa só no clique. O título do hero vai em linhas curtas e
  caixa-alta: em Press Start, frase longa em minúscula não se lê. O menu do topo e o de
  pausa acendem a seção à vista (`aria-current`; restauração conta como oficina, rodapé
  como visite) e o botão de som mostra ON/OFF. Oito moedas secretas (`[data-moeda]`,
  `js/moedas.js`) ficam nas faixas vazias entre as seções; quem clica descobre o jogo
  (aviso "1/8"), e quem junta todas abre a tela do cupom (`NC.cupom` no `config.js`,
  `codigo` e `beneficio`). Sem código, a tela mostra placeholder e não oferece WhatsApp,
  para ninguém pedir à loja um cupom que não existe. Progresso no `localStorage`
  `nc-moedas-secretas`; quem já juntou todas reabre o cupom clicando no COINS do topo.
  O Press Start tem as maiúsculas acentuadas, mas desenha pequenas e parecem minúsculas ("VOCê"):
  evite Ê e Ó em título de pixel. Não tem ★ ▶ ◀ ♥ (caem na fonte do sistema).
  Desde a auditoria de 14/10/2026 (`interno/clientes/nerd-club/auditoria-2026-10-14.md`):
  Lighthouse mobile 97 / acessibilidade 100 / CLS 0; SEO 100 numa cópia sem noindex. O
  CLS era o título do hero mudando de altura quando a fonte de pixel chegava: as fontes
  de reserva (`Pixel Reserva`, `Tela Reserva`, `Inter Reserva`) têm a largura medida das
  de verdade, não tire. O chão synthwave é um fundo fixo da página (`.fundo`), parado, e
  as seções têm fundo translúcido com bordas em degradê para ele aparecer entre elas.
  No celular, missões em 2x2, antes/depois em carrossel e categorias da InCubo em duas
  colunas. Cache no `.htaccess` da pasta; JSON fica em 1 hora porque o dono edita.
  No pé da Oficina, uma corrida de enfeite (`#corrida`): o Nerdinho, robozinho de pixel
  original, junta moedas fugindo de duas bolas de poeira, pega a ventoinha turbo e a
  poeira foge. Foi pedido "tipo Pac-Man" e saiu assim de propósito: Pac-Man é da Bandai
  Namco, e a mecânica pode, o personagem não. A poeira é bola redonda com fiapos e
  fica bege no susto: a primeira versão, de saia ondulada que ficava azul, era o fantasma. Ciclo de 16 s só em transform e opacidade,
  anda só à vista e com a aba aberta; as moedas são montadas no `home.js` com o atraso
  calculado pela largura (mudou o tempo no CSS, muda `CICLO` lá). Mesmo padrão: `.htaccess` e meta com noindex, faixa de prévia, sem UET,
  marca d'água com `utm_campaign=nerd-club`. Brief, prints e pendências em
  `interno/clientes/nerd-club/`, fora do git. A foto da fachada veio
  de um print que o Matheus mandou junto com o brief.

- `/ths/` — prévia do site da THS Engenharia e Construtora (projeto, administração e execução
  de obras, Manhuaçu, MG), feita para prospecção em 14/10/2026 a partir do Instagram
  (@engenhariaths: serviços e endereço na bio), do letreiro e do Linktree (WhatsApp, e-mail,
  Facebook). `og:image` em JPG (`assets/og.jpg`) por causa do WhatsApp. Base clara desde
  18/10/2026 (o preto do letreiro deixava o site escuro, a pedido): fundo `#F5F3EF` alternando com
  branco e areia, grafite `#26282C` só em "como trabalhamos", na faixa de prévia e no rodapé, e o
  laranja da marca (`#EE7A2A` em botão e faixa; `#C9601D` em título e `#B9541A` em texto
  pequeno sobre o claro). Mapa e "Abrir no Google Maps" pelas coordenadas do perfil THS
  Engenharia no Google (-20.2558808, -42.0346828), não pelo endereço, que punha o pino fora do
  lugar; as mesmas estão no `geo` do schema. No rodapé, desde 18/10/2026, um QR pequeno com "Avalie-nos" (a pedido: a seção
  "Já fez obra com a THS?" saiu), que também é link e leva ao formulário de avaliação do Google
  (`writereview?placeid=ChIJK2zChQwDuwARd71cV-XKYgs`, Place ID montado do `ftid` do perfil e
  conferido no Maps). Cartão de balcão A6 com o mesmo QR em
  `interno/clientes/ths/qr-avaliacao/`. No hero, desde 18/10/2026, um vídeo cobre o fundo da seção: três renders de
  uma casa (prints do Instagram deles, sem as setas do carrossel) com zoom lento e fusão, 10,8 s
  em loop. No computador, `assets/video/casa-largo.mp4` (1280x720): o render em pé, nítido,
  encostado à direita e o resto do quadro com a mesma imagem desfocada, sob um véu claro
  (`.hero__fundo::after`) que segura o texto à esquerda. Até 700 px, `casa.mp4` (640x800) em pé,
  embaixo do texto. Cada um tem o seu pôster como fundo do contêiner, e o vídeo só aparece
  (`.pronto`) quando já está tocando. Quadros no Pillow pelo
  `interno/clientes/ths/casa-102/build.py`; mudou o vídeo, sobe o `?v=` do `data-src`.
  Carrega depois do `load`, nunca com movimento reduzido, economia de dados ou `?still=1`, e
  pausa fora da tela. É render, então o rótulo diz "Projeto em 3D". No canto do hero, um selo
  redondo parado ("projeto · administração · execução" em volta da marca), ideia tirada do selo
  "padrão Loba" da loba.com.br, concorrente deles em Manhuaçu. Logo redesenhado
  em SVG (`#ths-marca` no próprio HTML e `favicon.svg`). Barlow e Barlow Condensed em caixa-alta,
  como nos posts deles, e os títulos são frases dos próprios posts. Seções: hero, números
  (placeholder), três serviços, sistema em EPS, "por onde começar" (três perguntas que montam a
  mensagem do WhatsApp), obras (galeria com filtro por etapa e lightbox, lista `OBRAS` no
  `js/main.js`; nomes dos destaques do Instagram), como trabalhamos, quem somos e contato (mapa
  só no clique). As 20 fotos em `assets/fotos/` são recortes dos prints do feed, sem texto nem
  logo, ampliados 2x: baixa resolução, pedir os originais para o site oficial. Mesmo padrão:
  `.htaccess` e meta com noindex, faixa de prévia, sem UET, placeholder amarelo, marca d'água
  com `utm_campaign=ths`. Prints e pendências em `interno/clientes/ths/`, fora do git.

- `/vilaserena/` — prévia do site das Cabanas Vila Serena (cabanas A-frame em construção em
  Alto Caparaó, MG, na mesma cidade do Recanto), desde 16/10/2026, a partir de um briefing em
  quatro etapas. **Divisão e visual copiados da demo Maré Mansa** (`/imoveis/demos/mare-mansa/`),
  a pedido: Fraunces, Inter e rótulo mono, hero com dois botões (o card branco de busca da Maré Mansa saiu: na Vila só repetia a lista de espera), faixa de fatos, cards
  altos de foto ("por dentro da Vila", no lugar das regiões), seção escura com passo a passo,
  quatro passos ligados (como reservar e obra), sobre (Café da Vila), dúvidas em sanfona e
  contato com mapa; as cores são as dos renders (grafite, madeira `#8A5426` no claro, âmbar nos
  botões) e o logo fica em Jost fino, como o letreiro. O card de cada cabana segue o da Pousada
  do Bezerra (concorrente): duas fotos, texto e uma fileira de comodidades com ícone desenhado
  aqui (`c-*` no HTML, nome em `icone` no `cabanas.json`). A lista de espera (etapa 2 do
  briefing) já existe: quatro passos que montam a mensagem do WhatsApp. A tela final diz "falta só enviar",
  não "vocês estão na lista", porque só entra quem envia. Sem campo de WhatsApp: a mensagem já
  sai do número da pessoa. Condição de inauguração só aparece se `condicaoInauguracao` tiver
  texto; o simulador de reserva (`modo: "reservas"`) ainda não existe. Todas as imagens são
  renders do projeto e levam o selo de imagem ilustrativa (a `og.jpg` também, gravado nela); um render tem o letreiro antigo
  "Vila da Serra chalés" e entra cortado: esse nome não aparece no site. Dúvidas, distâncias,
  por perto e obra vêm do `info.json`; colchete vira placeholder. Distâncias são estimativa
  marcada para confirmar. Carrossel arrasta com o mouse. O hero tem vídeo
  (`assets/video/hero.mp4`, 1280x720, e `hero-m.mp4`, 540x960 para celular em pé; ~2,6 MB e
  ~1,6 MB): renders alternados com quatro fotos da região do Wikimedia Commons (serra, Pico da
  Bandeira e uma rua de Alto Caparaó), créditos no rodapé. Começa e termina na fileira, que é o
  pôster. Cada quadro é gerado no Pillow com recorte fracionado, a 30 fps: o zoompan do
  ffmpeg arredonda o recorte para o pixel e o zoom lento tremia. Mudou o vídeo, sobe o `?v=` do
  `data-src`. Carrega depois do `load`, nunca com movimento reduzido, economia de dados ou
  `?still=1`, e pausa fora da tela. O vídeo não tem texto gravado (o corte do `cover` comia o
  rótulo): o selo do HTML troca de texto pelo tempo do vídeo (`ROTULOS` no `main.js`, passo de
  3,6 s); mudou a ordem ou a duração dos trechos, mude lá. Script do vídeo e fotos em
  `interno/clientes/vila-serena/video/`. "Como chegar" (menu e botão) tem bolinha vermelha
  pulsando, a pedido. O WhatsApp mora no `ZAP` do `main.js` e nos links do HTML, não no `info.json`. Mesmo padrão: `.htaccess` e meta com
  noindex, faixa de prévia, sem UET, marca d'água com `utm_campaign=vilaserena`. Renders
  originais e pendências em `interno/clientes/vila-serena/`, fora do git.

- `/esteticaef/` — prévia do site da Clínica Estética Facial e Corporal (Centro de Espera Feliz,
  MG; Grazi Santana no facial, Amanda Simiqueli no corporal; eleita a melhor clínica de estética
  da cidade em 2025), desde 16/10/2026, a partir de um briefing em quatro prompts. Estrutura da
  Arco/Doctors (hero com foto em arco e chip da equipe, letreiro, faixa de confiança,
  tratamentos, "por onde começar", equipe, resultados com a faixa do Chá Autoestima, clínica,
  avaliações e prêmio, consulta online, dúvidas, como chegar e CTA final), identidade tirada das fotos da
  clínica: off-white, greige, café `#3B302A`, nude `#C9A99A` e o dourado do espelho em arco
  (`#B08D57`, só em fio e ícone; texto dourado usa `#7D5F33`, e o taupe de texto é `#6E6155`,
  porque o `#8F8174` do briefing dá 3,4:1). Bodoni Moda e Jost servidas daqui (`fonts/`, OFL).
  Mármore da "A clínica" é SVG de turbulência no CSS, sem imagem. Tudo que a clínica muda fica
  em dados: contato e horário em `js/config.js` (null vira placeholder), tratamentos, equipe
  (com WhatsApp por profissional, hoje os dois iguais), triagem, antes e depois e o Chá
  Autoestima em `data/*.json`, com `_leia` em cada um. Triagem de três perguntas
  (`data/triagem.json`: opção → tratamento → profissional) monta a mensagem e manda para a
  profissional indicada. Antes e depois só mostra item com `autorizado: true` e as duas
  imagens; sem nenhum, a prévia mostra cards de exemplo sem foto, com o comparador
  funcionando. `eventos.json` com `ativo: false` remove a faixa do Chá. Fora do briefing, de
  propósito: o modal de WhatsApp da Theatrum (`js/leads.js`) não entra, porque mandaria lead
  da clínica para o e-mail da Theatrum; o `aggregateRating` também não (nota da própria
  empresa no schema, mesmo caso da Nerd Club); o evento `triagem_concluida` só sai com
  `EF.rastrear = true`, no site oficial. Os rostos do chip foram recortados do post
  "Atendimento online". OG em `assets/og-image-v1.jpg`. Mesmo padrão: `.htaccess` e meta com
  noindex, faixa de prévia, sem UET, placeholder amarelo, marca d'água com
  `utm_campaign=esteticaef`. Fotos originais e pendências em `interno/clientes/esteticaef/`,
  fora do git.

- `/bruno-chaves/` — prévia do site do Bruno Chaves (chaveiro, DDD 32, primo do Matheus),
  desde 18/10/2026, a partir do cartão, da fachada e de fotos de chave de carro entregue
  (Toro, Ram, Civic, Ford), que são as únicas imagens: ~300 px, pedir as originais. Página
  única pensada para a emergência no celular: barra fixa embaixo com "Ligar agora" (amarelo,
  maior) e WhatsApp; no computador ela flutua no canto. Título do hero é o slogan da vitrine
  dele ("Perdeu, quebrou ou esqueceu?"). Serviços em linguagem de quem tem o problema
  (`data/servicos.json`, tirados da placa; os urgentes têm "Ligar" ao lado), seção amarela de
  chave de carro com as fotos e um pedido de 4 perguntas que monta a mensagem mastigada,
  "por que chamar o Bruno", a loja e dúvidas (`data/faq.json`). Cores do cartão (amarelo
  `#FFD21F`, vermelho `#E23B1E` só em fundo e ícone, preto), Bebas Neue e Inter servidas
  daqui. Cidade, endereço, horário, plantão, tempo de chegada, CNPJ, pagamento, mapa e áreas
  ficam em `js/config.js` (null vira placeholder). A barra fixa fica à vista desde o topo, não só depois da primeira tela como pede o padrão: na emergência a pessoa liga na hora. Logo provisório em SVG (o mascote do
  cartão não foi redesenhado). Sem `js/leads.js`, mesmo motivo da `/esteticaef/`. Mesmo
  padrão: `.htaccess` e meta com noindex, faixa de prévia, sem UET, marca d'água com
  `utm_campaign=bruno-chaves`, OG em `og-image-v1.jpg`. Pendências em
  `interno/clientes/bruno-chaves/README.md`, fora do git.

- `/cabralmiranda/` — prévia do site do Cabral & Miranda (escritório de advocacia de duas sócias,
  Lorraine Cabral da Cunha e Alda Miranda, Rua Ernesto Grillo, 54, Centro de Espera Feliz, MG),
  desde 18/10/2026, a partir de um briefing em quatro prompts e do print do Instagram. **É
  publicidade de advocacia (Provimento 205/2021):** sem preço, "consulta gratuita", promessa de
  resultado, superlativo ou depoimento; frase que explica direito leva [REVISAR]. Verde-escuro
  `#12291F` e floresta `#1C3B2C` do logo, dourado `#C2A15F` do monograma (texto dourado pequeno
  sobre claro usa `#6E5426`, porque o `#8C6F35` do briefing dá 4,1:1), oliva só nos losangos do
  post do Dia do Advogado, pedra `#D9D6CF` da parede. Cinzel (títulos curtos; parágrafo longo vai em
  Lato, Cinzel só tem caixa-alta) e Lato servidas daqui. Monograma CM redesenhado em SVG
  (`#cm-marca`). Papel rasgado uma vez só, na entrada do "Quem somos". Áreas, triagem de três
  perguntas (área → advogada, "Não sei dizer" vai para o geral, "urgente" troca o botão),
  checklist de documentos por área (manda a lista para o próprio WhatsApp com `wa.me/?text=`) e
  dúvidas vêm de `data/*.json`; contato em `js/config.js`. **Qual número é de cada advogada não
  está confirmado** (provisório na ordem da bio) e nem quem está de vermelho ou de preto: por isso
  não há foto individual, e cards e triagem mostram as iniciais num losango. As três fotos são
  recortes do print, ampliados 2x. No computador, modal próprio de três opções (me chamem, e-mail,
  QR), com Web3Forms do escritório em `CM.web3formsKey`; sem chave, mostra o aviso de prévia. Sem
  `js/leads.js` da Theatrum, mesmo motivo da `/esteticaef/`. Mesmo padrão: `.htaccess` e meta com
  noindex, faixa de prévia, sem UET, marca d'água com `utm_campaign=cabralmiranda`, OG em
  `og-image-v1.jpg`. Briefing, print e pendências em `interno/clientes/cabralmiranda/`, fora do git.

### As demonstrações, uma pasta por área

| Pasta | Demos | Área |
|---|---|---|
| `/imoveis/demos/` | 5 | imobiliário |
| `/moveis-planejados/demos/` | 6 | móveis planejados |
| `/nutricao/demos/` | 6 | nutrição |
| `/lojas/demos/` | 1 | loja online |
| `/solar/demos/` | 1 | energia solar (no portfólio, dentro de "negócios locais") |
| `/negocios/demos/` | 7 | negócios locais |

A Maré Mansa (`/imoveis/demos/mare-mansa/`, desde 11/10/2026) é a prévia da
Antonio's refeita do mesmo jeito: nome, logo, paleta (azul atlântico e dourado
de areia), história, corretora, depoimentos, CRECI ("J-0000"), telefones e
e-mail fictícios; sem endereço de rua nem CNPJ, e o mapa mostra só o bairro.
O bairro (Recreio) ficou, porque o vídeo e as fotos são de lá e levam crédito
do Wikimedia no rodapé. Códigos dos imóveis em "MM-".

A Lívia Amaral (`/negocios/demos/livia-amaral/`, desde 11/10/2026) é a prévia da
Gabriela Carolina refeita do mesmo jeito, e com mais cuidado, porque era o rosto
e a voz de uma pessoa: saíram a foto dela (no lugar, um cantinho de atendimento
do Wikimedia, CC BY 2.0, com crédito no rodapé), os prints de stories de
clientes reais (viraram cartões de mensagem gerados, com nomes e textos
inventados), os posts do Instagram dela, os lemas dela ("Comportamentos têm
histórias" e companhia), o schema com telefone e a Myano, marca real, que virou
a linha fictícia Lume, com os frascos desenhados pelo próprio main.js. Paleta
de vinho para verde-musgo. Links de Instagram e podcast caem no aviso de
demonstração.

As sete de `/negocios/demos/` são as prévias de cliente refeitas como
marca fictícia, para o portfólio: Prumo (da AML), Vereda (da Eng+), Pedra
Alta (do Recanto), Campo Vivo (da Inovar), Lívia Amaral (da Gabriela
Carolina), Clã Valente (do Felipe Fornari) e Arco (da Doctors). Nome, cidade, cores, logo,
fotos, telefones, depoimentos e números foram trocados; os WhatsApps ficam
vazios e não sobra placeholder. As prévias originais continuam intactas
nas pastas dos clientes. As fotos vêm do Wikimedia Commons, com autor e
licença no rodapé de cada demo: tirar o crédito quebra a licença.

O Clã Valente (`/negocios/demos/cla-valente/`, desde 13/10/2026) é o
`/fornari/` refeito: o treinador Caio Valente, da Forja Academia, em Juiz de
Fora; paleta trocada do verde para laranja de brasa. Ninguém real aparece:
o hero é uma mão com halter (Nenad Stojkovic, CC BY 2.0) e "quem vai te
treinar" mostra halteres (CC0), sem rosto no papel do treinador. Os doze
antes e depois são **ilustrados**, desenhados por parâmetro em
`interno/clientes/fornari/demo-fotos/artes.py` (fora do git), com nomes,
datas e pesos inventados; o rodapé diz isso. A logo é SVG no próprio HTML.
Instagram, mapa e e-mail são texto, não link; o WhatsApp cai no `_demo.js`.
A página de links (`links/`) não carrega o `_demo.js`: tem barra própria.

A Arco Odontologia (`/negocios/demos/arco/`, desde 13/10/2026) é o
`/doctors/` refeito: clínica no fictício Shopping Jardins do Vale, em
Petrolina, PE; paleta trocada do dourado para verde-azulado e areia, e a
moldura em "D" (marca da Doctors) virou um arco. **Todas as fotos são
geradas por IA**, pessoas e ambientes, e o rodapé diz isso: os sete
dentistas e a gerente têm nome inventado e CRO "CRO-PE 0000". Saíram do
FLUX.1-schnell (Hugging Face, cota anônima de poucas imagens) e do
Z-Image-Turbo no AI Horde (anônimo, fila de 10 a 15 min); Higgsfield e
Gemini estavam sem saldo. O nome do cliente não aparece em arquivo público
da demo. Avaliações e FAQ preenchidos com texto fictício, mapa mostra só a
cidade, Instagram é texto.

A Beatriz Lemos e a Lara Mendonça (`/nutricao/demos/beatriz-lemos/` e
`lara-mendonca/`, desde 13/10/2026) são prévias de nutricionistas reais
refeitas como marca fictícia: a Beatriz era a da Cíntia Antunes (proposta em
`interno/clientes/nutri-cintia/`), agora em Lavras, MG, verde-azulado e
terracota, monograma "BL" em SVG; a Lara era a da Isa Rodrigues, agora
nutricionista bariátrica no fictício Centro Clínico Alameda, em Campos dos
Goytacazes, RJ, ameixa e damasco. Só a nutricionista do hero tem rosto, gerado
por IA (Z-Image-Turbo no AI Horde); as outras fotos são mão, prato e
consultório, também por IA, e o rodapé diz isso. Os posts do Instagram da Lara
são cartões desenhados em HTML. CRN "0000", telefones "0000-0000", Instagram
é texto, mapa só da cidade. As prévias originais, com as fotos delas, estão
em `interno/clientes/nutri-cintia/previa-demos/` e
`interno/clientes/isa-rodrigues/previa/`, fora do git; nunca publique.

**Demos bilíngues (PT/EN), desde 11/10/2026:** Maré Mansa, Lívia Amaral e
Pedra Alta têm botão PT · EN no próprio topo, e o card delas no portfólio leva
o selo "PT/EN". Motor único em `js/idioma-demo.js` (raiz), carregado no
`<head>` com `data-dicionario="js/en.js"`. Em inglês ele baixa o `en.js` da
demo (dicionário: texto em português → inglês), traduz nós de texto e `alt`,
`aria-label`, `placeholder` e `title`, aplica `data-en` (frase com `<em>` no
meio) e `data-en-src` (imagem), e segue traduzindo o que o JS desenha depois.
Frase montada com número no meio fica no JS da demo, em `T(pt, en)`; os JSON
vêm de `data/en/` (`Idioma.dados`), com a mesma estrutura dos de português:
**mudou preço ou texto num, muda no outro.** Trocar de idioma recarrega a
página com `?lang=`. Ordem da escolha: `?lang`, a última troca feita numa
demo (`localStorage` `theatrum-demo-idioma`), `?de=us`, o idioma da home e do
portfólio (`theatrum-lang`), português. Os `_demo.js` de `/imoveis/` e
`/negocios/` falam inglês quando a demo está em inglês. Na Lívia, os cartões
de depoimento e os posts são imagens e têm versão `-en.webp`, gerada no mesmo
desenho. Para pôr outra demo em inglês: o `<script>` no head, o botão
`.idioma` com `data-idioma-troca`, o `en.js`, `T()` no JS e `data/en/`.

Cada pasta tem o próprio `_demo.js`, que neutraliza links de contato e põe a
barra de volta, e um `.htaccess` com `X-Robots-Tag: noindex`. **O noindex não é
detalhe:** são negócios fictícios, e indexados eles competem na busca com
clientes reais e alguém pode cair num consultório que não existe vindo do
Google.

O parâmetro `?de=` diz de onde a pessoa veio e decide para onde ela volta:
`portfolio`, `us` (em inglês), `home`, ou a landing do segmento onde ela
existir. Sem o parâmetro, o referrer é o plano B.

Os quatro demos de nutrição moravam em `/moveis-planejados/demos/` por herança,
de quando aquela esteira nasceu dentro da de planejados. Há um `RedirectMatch
301` no `.htaccess` de planejados cobrindo os endereços antigos; pode sair
quando não houver mais nada apontando para lá.
- `/blog` — gerado por `npm run build:blog` (`scripts/blog/`, Node com marked,
  js-yaml, sharp e playwright-core; dependências na raiz, `node_modules/` fora
  do git) a partir de `content/blog/*.md`, desde 13/10/2026. **Nunca edite o
  HTML de `blog/`:** o build refaz a pasta inteira e apaga a página de artigo
  que saiu do `content/`. Exceção: `blog/img/posts/`, slides do Instagram que o
  MazyOS publica (o `postar-instagram.js` busca as imagens por essa URL). Topo,
  rodapé, medição e CSS (embutido) ficam em `scripts/blog/modelos.mjs` e
  `estilo.css`: mudou o topo ou o rodapé da home, mude lá e rode o build. O
  build também escreve o `sitemap.xml` da raiz (páginas do site principal
  listadas em `PAGINAS_SITE` no `build.mjs`) e o `blog/feed.xml`. Capa sem
  `cover` é desenhada pelo Chrome instalado (`capa.mjs`); cada capa sai em WebP
  (1200 e 640) e em JPG só para o `og:image`, porque WhatsApp e LinkedIn não
  mostram WebP com segurança. CTA do artigo pelo campo `cta` (diagnostico,
  planos ou caminho de página de nicho), no meio (antes do 3º H2) e no fim,
  sempre com a calculadora ao lado. Categorias em `CATEGORIAS` no
  `modelos.mjs`; só ganha chip e página a que tem artigo. Só em português.
  Passo a passo para o Matheus em `docs/como-publicar-artigo.md`. `content/`,
  `docs/` e `scripts/` têm `.htaccess` negando acesso. O blog antigo em Astro
  (`site/astro-site/`) está aposentado e continua no git, com `site/.htaccess`
  negando acesso (apagar a pasta fica para o Matheus decidir); o `npm run
  deploy` de lá sobrescreveria `blog/`. Os três artigos dele migraram com as mesmas URLs.
- `/privacidade/` — política de privacidade (PT, com versão em inglês em
  `#en`), linkada no rodapé de todas as páginas do site principal. Tem botão
  para apagar a escolha de cookies.

### Microsoft Ads (UET) e consentimento

Só no site principal: home, `/portfolio/`, `/us/`, `/moveis-planejados/`,
`/privacidade/` e blog. **Nunca** nas prévias de cliente (`/aml`, `/engmais`,
`/inovar`, `/recanto`, `/gabriela-carolina`, `/bia-de-luca`, `/antonios`, `/doctors`, `/fornari`, `/nerd-club`, `/ths`, `/vilaserena`, `/esteticaef`, `/bruno-chaves`, `/cabralmiranda` e as que vierem), nos `*/demos/` nem em `/conta-frases/`.

- No `<head>`: `consent default` com `ad_storage` negado, `update` para quem
  já aceitou (`localStorage` `theatrum-cookies` = `aceito`) e o snippet
  oficial, disparado no primeiro gesto ou no ocioso, como o GTM.
- `js/consentimento.js`: aviso de cookies (Aceitar, Recusar, Saiba mais).
- Blog: `blog_cta_click` nos CTAs dos artigos e no bloco do fim do `/blog`
  (`data-blog-cta`), pelo `TheatrumLeads.evento`, com a mesma regra de
  consentimento. O compartilhar no WhatsApp leva `data-compartilhar`, que o
  `leads.js` deixa passar sem modal nem evento.
- `plano_click` (`data-plano` nos cards do `[09]`, com o plano e o `data-origem`
  do botão), pelo `TheatrumLeads.evento`, só com consentimento.
- `js/uet-eventos.js`: `diagnostico_click` (`data-uet-diagnostico`, nos três
  "Ver quanto eu perco por mês" da home).
- `js/leads.js`: `whatsapp_click` (qualquer abertura de WhatsApp; substituiu
  o antigo `clique_whatsapp`), `lead_callback` ("me chame" e card do raio-x)
  e `lead_email` (diagnóstico por e-mail e pop-up de saída). Vão para GA4 e
  UET **só para quem aceitou cookies**.
- Fora esses eventos, o consentimento só controla o UET. GTM, gtag e Google
  Ads continuam rodando sem pedir.

---

## Pendências de conteúdo

1. Preços de `/us/` e de `/moveis-planejados/` (as duas desativadas) ainda são os da oferta anterior.
2. Autorização por escrito dos clientes antes de pôr nome, print e link na
   seção `[09] entregas`.
3. (resolvida em 10/10/2026: chave do Web3Forms no `js/leads.js`, formulários ligados.)
4. Política de contrato. Desde 16/10/2026 a manutenção da condição de
   lançamento tem fidelidade de 12 meses, publicada no `[09]`. A pergunta "Fico preso em contrato?" saiu do FAQ
   em 13/10/2026 porque a resposta publicada era o lembrete interno
   "CONFIRMAR COM O MATHEUS"; volta quando a política existir (há um
   comentário no lugar dela no `index.html`).
5. Link real do LinkedIn (saiu do rodapé enquanto era `#`).
6. Home acima do orçamento de performance (medição de 10/10/2026): ~200 KB
   ao abrir (só o HTML em gzip tem 68 KB) e 2 tarefas longas de ~290 ms ao
   rolar. Já era assim antes da vitrine de trabalhos; falta achar a origem.
