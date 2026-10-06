# Projeto Theatrum

Site da Theatrum (usetheatrum.com.br): criação digital sob medida para pequenos
negócios no Brasil e no exterior, em português (principal) e inglês. O que se
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
  (`bat.bing.com`, tag 187278315, autorizado em 02/10/2026). Nenhuma outra. O GSAP saiu: custava 41 KB para cinco animações de entrada
  que o IntersectionObserver e o CSS já fazem. Não traga biblioteca de animação
  de volta.

### Orçamento de performance (regra permanente)

A home travava ao abrir e engasgava ao rolar. Depois do conserto ela transfere
**10 KB** e abre com DOM interativo em 2,1 s em 4G lento com CPU 4x. Qualquer
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

### A página é bilíngue — leia antes de escrever qualquer copy

Há ~259 elementos com atributo `data-en`, e o botão de idioma troca o idioma
**reescrevendo o `innerHTML`** de cada um deles.

Duas consequências obrigatórias:

1. **Toda copy nova nasce nos dois idiomas.** Texto sem `data-en` fica em
   português quando o visitante escolhe inglês.
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
caixa-alta espaçada.

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
[01] hero (+ letreiro)                 [02] o que fazemos
[03] dores e soluções (+ investimento)
[04] a calculadora                     [05] demonstração
[06] trabalhos                         [07] entregas (escondida até ter cliente)
[08] quem faz                          [09] como funciona + o raio-x
[10] FAQ                               [11] CTA final ("vamos conversar")
```

- **Hero:** título à esquerda com a palavra de destaque em serif itálico
  dourado; à direita um card (topo dourado, base escura) com três degraus:
  calculadora, sites no ar e WhatsApp.
- **`[02]` o que fazemos (`#servicos`):** três grupos em ordem de peso.
  "Para construir": três cards grandes e escuros (sites e landing pages, lojas
  virtuais, aplicativos e sistemas web). "Para trazer cliente": quatro cards
  brancos (Google Meu Negócio, tráfego pago, IA no WhatsApp, reativação); os
  dois primeiros têm "ver por quê" com `data-aba`, que abre a aba certa no
  `[03]`. Por último, uma faixa tracejada e discreta de social media, marcada
  "complemento".
- **`[03]` dores e soluções (`#problema`):** abas por canal (Google Meu
  Negócio, tráfego pago, site, atendimento). Cada painel põe "mal configurado:
  o prejuízo" ao lado de "bem configurado: o benefício" e fecha com "no longo
  prazo". Os botões das abas têm `data-en`, mas o estado mora no próprio botão;
  sem JS (e em `?still=1`) os quatro painéis aparecem empilhados. O preço vem
  logo abaixo, com o filtro de "é/não é para você". Os ids `#solucao` e
  `#investimento` continuam dentro dela.
- **`[06]` trabalhos:** três janelas de navegador desenhadas em CSS, sem
  imagem nenhuma, cada uma mostrando o sistema que roda dentro do demo. Os
  links levam `?de=home`.
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

### Mensagens do WhatsApp por origem do clique

Todo botão usa link `wa.me` direto, nunca widget de terceiro, e leva mensagem
diferente conforme de onde a pessoa clicou:

| Origem | Mensagem |
|---|---|
| hero | "Vim do site da Theatrum. Quero o raio-x do meu negócio." |
| o que fazemos | "Vim do site da Theatrum. Quero um site ou sistema para o meu negócio." |
| calculadora | "Vim do site. A calculadora deu R$ {N} por mês. Quero o plano." |
| demonstração | "Vi as demonstrações no site e quero isso rodando no meu negócio." |
| entregas | "Vi os sites que vocês entregaram. Quero um diagnóstico." |
| FAQ | "Tenho uma dúvida antes do diagnóstico:" |
| CTA final | "Quero meu diagnóstico gratuito." |
| pop-up de saída | "Vim do site da Theatrum. Quero o raio-x gratuito do meu negócio." + negócio, cidade e site/Instagram |

### Pop-up de saída (raio-x em menos de 24 h)

Abre quando a pessoa dá sinal de ir embora: no computador, o mouse saindo
pelo topo; no celular, subida rápida perto do topo depois de ler 40% da
página. Armado só depois de 8 s, uma vez por sessão (`theatrum-saida`), e
nunca para quem já clicou num CTA ou já pediu o raio-x (`theatrum-raiox` =
`enviado`). Tira da tela o card de 70% se ele estiver aberto, e depois dele o
card não volta. Textos num objeto JS (`SX`), não em `data-en`.

**Promete o raio-x em menos de 24 horas.** Essa promessa está publicada:
cada pedido precisa de resposta dentro do prazo.

Sem `ENDPOINT` (constante no topo do script da barra mobile), o envio abre
o WhatsApp com o pedido escrito e a tela diz "falta um toque", nunca
"recebido". Quando o endpoint existir, o formulário ganha o campo de
WhatsApp sozinho e passa a confirmar o recebimento.

---

## Demais páginas do domínio

- `/portfolio/` — a vitrine dos quinze sites, em página própria. Saiu da home
  porque custava 24 KB de HTML, script próprio e 484 KB de imagem que baixavam
  assim que alguém rolava até lá. Na home ficou só o convite, sem imagem
  nenhuma. Quem abre uma demo a partir daqui volta para cá: os links levam
  `?de=portfolio` e os três `_demo.js` conhecem essa origem.
- `/us/` — landing separada, só em inglês, para anúncios nos EUA e Reino Unido.
  Oferta reduzida: site US$ 500, site + Google Business Profile US$ 700.
- `/moveis-planejados/` — landing do segmento de planejados.
- `/aml/` — prévia do site da AML (medicina e segurança do trabalho, Cataguases,
  Leopoldina e Muriaé), feita para vender o projeto. Cliente real, então leva
  `.htaccess` com noindex e os dados que faltam aparecem como placeholder
  amarelo, nunca inventados. Briefing, README de pendências e `netlify.toml`
  ficam em `interno/clientes/aml/`, fora do git.
- `/engmais/` — prévia do site da Eng+ (consultoria ambiental e segurança do
  trabalho, Dores do Rio Preto, ES e MG), no mesmo molde da AML: noindex,
  placeholder amarelo, diagnóstico em dois caminhos (produtor e empresa) e
  simulação de WhatsApp. Pendências em `interno/clientes/engmais/README.md`, fora do git.
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

- `/inovar/` — demo do site da Inovar Agroveterinária (agropecuária, farmácia e
  clínica veterinária, lojas em Dores do Rio Preto e Guaçuí, ES). Mesmo padrão:
  `.htaccess` com noindex, faixa de demonstração e placeholder amarelo. Produtos
  só informativos (categorias + "perguntar no WhatsApp"): o cliente pediu para
  tirar catálogo, lista de pedido e seletor de loja. Agendamento de veterinário
  em 5 passos e calendário do rebanho (setas e arraste, sem barra). Números e
  rotas em `data/config.json`; calendário em `data/calendario.json`, todo
  marcado para revisão dos veterinários. Pendências em `interno/clientes/inovar/README.md`,
  não commitada.

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

### As demonstrações, uma pasta por área

| Pasta | Demos | Área |
|---|---|---|
| `/imoveis/demos/` | 4 | imobiliário |
| `/moveis-planejados/demos/` | 6 | móveis planejados |
| `/nutricao/demos/` | 4 | nutrição |
| `/lojas/demos/` | 1 | loja online |
| `/solar/demos/` | 1 | energia solar |

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
- `/blog` — saída do Astro em `site/astro-site/`. O que entra no `<head>` do
  blog vai no `BlogLayout.astro` (com `is:inline`) **e** nos quatro HTML já
  gerados em `blog/`, senão some no próximo build ou não chega ao ar.
- `/privacidade/` — política de privacidade (PT, com versão em inglês em
  `#en`), linkada no rodapé de todas as páginas do site principal. Tem botão
  para apagar a escolha de cookies.

### Microsoft Ads (UET) e consentimento

Só no site principal: home, `/portfolio/`, `/us/`, `/moveis-planejados/`,
`/privacidade/` e blog. **Nunca** nas prévias de cliente (`/aml`, `/engmais`,
`/inovar`, `/recanto`, `/gabriela-carolina`, `/bia-de-luca`, `/antonios` e as que vierem), nos `*/demos/` nem em `/conta-frases/`.

- No `<head>`: `consent default` com `ad_storage` negado, `update` para quem
  já aceitou (`localStorage` `theatrum-cookies` = `aceito`) e o snippet
  oficial, disparado no primeiro gesto ou no ocioso, como o GTM.
- `js/consentimento.js`: aviso de cookies (Aceitar, Recusar, Saiba mais).
- `js/uet-eventos.js`: `whatsapp_click` (link `wa.me`/`api.whatsapp.com` ou
  `data-whatsapp`) e `diagnostico_click` (`data-uet-diagnostico`, nos três
  "Ver quanto eu perco por mês" da home).
- O consentimento só controla o UET. GTM, gtag e Google Ads continuam
  rodando sem pedir.

---

## Pendências de conteúdo

1. Mínimo de verba de anúncio no bloco de investimento da seção `[03]` (ainda
   `R$ ___`). Implantação (a partir de R$ 1.500) e operação (a partir de
   R$ 197/mês) já estão no ar.
2. Autorização por escrito dos clientes antes de pôr nome, print e link na
   seção `[07] entregas`.
3. Endpoint para onde o formulário do raio-x envia os leads.
4. Política de contrato, para a resposta do FAQ.
5. Link real do LinkedIn (saiu do rodapé enquanto era `#`).
