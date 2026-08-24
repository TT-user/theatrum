# 30 posts — frases sobre pinturas texturizadas

Cada post é **um vídeo de 5s** (pintura a óleo animada) com uma frase queimada em Itim branco
e a assinatura `@explicologo` logo abaixo.

> Este arquivo é **gerado**. Edite `posts.json` / `copy.json` e rode `node build-md.js`.

## Regras da conta — valem para todo post novo

**1. Toda legenda termina com CTA de seguir.**
A última linha da legenda é sempre um convite para seguir `@explicologo`, separado por linha
em branco da linha de engajamento (salvar / comentar). São duas chamadas empilhadas: primeiro
a que pede a ação barata (salvar), depois a que pede o seguidor.
O CTA vive **na legenda**, nunca queimado na arte: a arte carrega só a frase e a assinatura.
O texto rotaciona entre estas variações para não ficar robótico:

- Se isso te fez respirar, siga @explicologo.
- Segue a página para receber essas frases no seu feed: @explicologo.
- Siga @explicologo para uma frase calma por dia.
- Siga @explicologo — aqui tem uma pausa dessas todo dia.

**2. Carrossel: só o primeiro slide é vídeo.**
Quando um post for carrossel, apenas o **slide 1** é o `.mp4` animado — ele é quem segura o
autoplay no feed. Os slides seguintes podem ser **imagem estática** (`.jpg`), o que corta
tempo de render e crédito de animação. Na prática: gere o vídeo só do slide de capa e monte
os demais direto do `overlay.js` sobre a pintura parada.

**3. Rodízio.** Nenhum pilar e nenhuma fórmula se repetem em posts consecutivos.
Uma variante surreal (astronauta) a cada dez — hoje nos posts 06, 16, 26.

## Estilo das imagens de fundo

**Ilustração cósmica em quadrinho.** Ilustração chapada de quadrinho sobre céu noturno preto pontilhado de estrelas. Traço de nanquim grosso, cores chapadas e poucas por quadro, grão de papel de risografia. Figura solitária de costas contemplando o cosmos, às vezes com um bicho ao lado.

> **Vale a partir do post 16.** Pintura a óleo texturizada em tela de linho, usada nos posts 01 a 15. Ver o commit anterior a esta troca se precisar reproduzir aqueles.

O arquivo `estilo.json` e a **fonte unica** do visual. `gen-imagens.ps1` (Higgsfield)
e `gen-imagens-gemini.mjs` (Gemini) montam o prompt a partir dele, e esta secao e
gerada dele. Para trocar o tipo de imagem de fundo, edite `estilo.json` e rode
`node build-md.js` — nunca edite prompt dentro de script, senao os dois geradores
saem de sincronia.

O prompt de cada post e montado nesta ordem:

```
Flat comic-book illustration, like a single graphic-novel panel. Bold confident black ink linework, screen-print and risograph feel.
{cena do post, vinda de posts.json}.
Solitary figure seen from behind, small in frame, face never visible, sitting or standing very still, drawn with heavy ink outlines and flat colour fills.
{paleta do pilar}.
No gradients and no soft shading: flat blocks of colour separated by clean ink lines.
Deep black night sky densely hand-stippled with small white stars of varying size, subtle paper grain and print texture, colours flat and slightly muted.
Wide open empty black sky in the {zona} third of the frame, stars only, no objects, reserved for text overlay.
Cosmic, quiet, contemplative, gently surreal, hopeful.
No text, no lettering, no watermark, no signature, no faces, no logos.
Vertical portrait composition.
```

A variante surreal troca a linha da figura por:

> A gently whimsical character seen from behind, face never visible, small in frame, sitting or standing very still, drawn with heavy ink outlines and flat colour fills.

Quando o gerador aceita referencia de imagem, vai junto uma arte ja aprovada do mesmo
pilar **e do estilo vigente** (id >= 16), mais esta trava. Arte do estilo antigo nunca
entra como referencia: puxaria a geracao de volta para ele.

> Match the ink line weight, flat colour handling, star field density and paper texture of the reference image. Do NOT copy its composition or subject.

**Paleta por pilar** — e o que faz a grade do perfil ler como uma conta so:

| Pilar | | Paleta |
|---|---|---|
| P1 | Paz e limites | Black sky and white stars, with flat accents of soft teal and pale grey |
| P2 | Recomeços | Black sky and white stars, with flat accents of crimson red and warm sand |
| P3 | Fé leve | Black sky and white stars, with flat accents of amber yellow and burnt orange |
| P4 | Amor-próprio | Black sky and white stars, with flat accents of emerald green and cobalt blue |

## Carrosséis montados

Slide 1 é vídeo, os demais saem em imagem estática. Cada carrossel cobre os quatro
pilares, então funciona sozinho fora da sequência do feed.

| Carrossel | Slides | Capa (vídeo) | Pilares |
|---|---|---|---|
| A | 16 · 17 · 18 · 19 · 20 | 16 — Você vai se reconhecer de novo. | P1, P2, P3, P4 |
| B | 21 · 22 · 23 · 24 · 25 | 21 — Está tudo bem em não responder hoje. | P1, P2, P3, P4 |
| C | 26 · 27 · 28 · 29 · 30 | 26 — Todo começo é meio desajeitado. | P1, P2, P3, P4 |

Publicar: `node --env-file=$ENV postar-reels.js --carrossel A`

**Arquivos**
- `final/instagram/NN-4x5.mp4` — 1080×1350, publicar no feed
- `final/instagram/NN-4x5.jpg` — capa estática (thumbnail / slide de carrossel)
- `final/pinterest/NN-2x3.mp4` — 1000×1500, pin de vídeo
- `final/pinterest/NN-2x3.jpg` — pin estático

**Rodízio** — nenhum pilar repetido em sequência, nenhuma fórmula repetida em sequência:

| # | Pilar | Fórmula | Frase |
|---|---|---|---|
| 01 | P1 Paz e limites | F3 | Nem toda cobrança merece a sua resposta. |
| 02 | P2 Recomeços | F5 | Você não precisa de pressa para mudar. |
| 03 | P3 Fé leve | F2 | Tudo aquilo que é seu chegará inteiro. |
| 04 | P4 Amor-próprio | F1 | Escolha primeiro aquilo que te faz bem. |
| 05 | P1 Paz e limites | F6 | O silêncio guarda o que importa. |
| 06 | P2 Recomeços | F1 | Confie no ritmo do seu recomeço. |
| 07 | P3 Fé leve | F6 | A espera também faz parte do caminho. |
| 08 | P4 Amor-próprio | F5 | Você não precisa agradar para ser amado. |
| 09 | P1 Paz e limites | F4 | Está tudo bem em querer menos coisas. |
| 10 | P2 Recomeços | F2 | Dias mais leves virão sem aviso. |
| 11 | P3 Fé leve | F1 | Confie no que ainda não dá para ver. |
| 12 | P4 Amor-próprio | F3 | Nem toda opinião sobre você é verdade. |
| 13 | P1 Paz e limites | F5 | Você não precisa se explicar para dizer não. |
| 14 | P2 Recomeços | F6 | O recomeço não pede permissão. |
| 15 | P3 Fé leve | F4 | Está tudo bem em não ter todas as respostas. |
| 16 | P4 Amor-próprio | F2 | Você vai se reconhecer de novo. |
| 17 | P1 Paz e limites | F1 | Guarde um pedaço do dia para você. |
| 18 | P2 Recomeços | F3 | Nem todo recuo é derrota. |
| 19 | P3 Fé leve | F5 | Você não precisa entender agora para seguir. |
| 20 | P4 Amor-próprio | F6 | O seu valor não está em votação. |
| 21 | P1 Paz e limites | F4 | Está tudo bem em não responder hoje. |
| 22 | P2 Recomeços | F2 | Você vai olhar para trás com carinho. |
| 23 | P3 Fé leve | F1 | Deixe o tempo fazer a parte dele. |
| 24 | P4 Amor-próprio | F3 | Nem todo amor que cansa é amor. |
| 25 | P1 Paz e limites | F5 | Você não precisa de barulho para existir. |
| 26 | P2 Recomeços | F6 | Todo começo é meio desajeitado. |
| 27 | P3 Fé leve | F4 | Está tudo bem em confiar de novo. |
| 28 | P4 Amor-próprio | F2 | Vai chegar quem fica sem você pedir. |
| 29 | P1 Paz e limites | F1 | Respire antes de responder. |
| 30 | P2 Recomeços | F3 | Nem todo dia precisa render. |

---

## 01 · P1 · F3

**Frase:** Nem toda cobrança merece a sua resposta.

**Legenda**
> Tem gente que cobra rápido porque descobriu que você devolve rápido. A pressa é dela.
> Você pode ler, respirar e voltar quando estiver pronto — ou nem voltar.
> Guardar energia não é frieza, é cuidado com o que sobra do seu dia.
>
> Salve para lembrar disso na próxima mensagem que chegar cobrando.
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #frasesreflexivas #frasescurtas #paginasdecalma #limitessaudaveis #serenidade #frasesdepaz #calmaria

**Alt text:** Pintura a óleo texturizada de uma pessoa sentada de costas no alto de uma colina verde, olhando um mar azul calmo sob um céu creme com nuvens rosadas.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre limites e paz interior`
- Descrição: Nem toda cobrança merece a sua resposta. Frases curtas sobre limites, paz interior e o direito de responder no seu tempo. Ideal para quem procura reflexões calmas sobre energia e descanso mental.

---

## 02 · P2 · F5

**Frase:** Você não precisa de pressa para mudar.

**Legenda**
> Mudança de verdade quase nunca tem data marcada. Ela começa numa decisão pequena e vai se ajeitando.
> Se hoje o passo foi curto, ainda foi passo.
> O que atrapalha não é a lentidão, é a comparação com o ritmo de outra pessoa.
>
> Qual passo pequeno cabe no seu dia de hoje?
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #frasesdemudanca #frasesreflexivas #recomeco #paginasdecalma #frasescurtas #vidaleve #coragem

**Alt text:** Pintura a óleo texturizada de uma pessoa caminhando de costas por um píer de pedra estreito em direção a um mar cinza-esverdeado, com gaivotas ao redor e céu nublado.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases de recomeço e mudança`
- Descrição: Você não precisa de pressa para mudar. Frases de recomeço para quem está mudando de fase devagar. Reflexões curtas sobre coragem, tempo próprio e começar de novo sem cobrança.

---

## 03 · P3 · F2

**Frase:** Tudo aquilo que é seu chegará inteiro.

**Legenda**
> Existe uma diferença entre esperar parado e esperar confiando. A segunda cansa menos.
> O que é para ficar não chega pela metade, nem exige que você se quebre para caber.
> Enquanto isso, cuide do que já está aqui.
>
> Salve para os dias em que a dúvida bater.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #frasesreflexivas #confianca #paginasdecalma #frasescurtas #tempocerto #esperanca

**Alt text:** Pintura a óleo texturizada de uma figura minúscula em um vale escuro segurando uma estrela cadente por um fio de luz, sob um céu laranja queimado com rastros de cometa.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases de fé e do tempo certo`
- Descrição: Tudo aquilo que é seu chegará inteiro. Frases de fé e confiança para quem está esperando uma resposta. Reflexões sobre o tempo certo, entrega e paz na espera.

---

## 04 · P4 · F1

**Frase:** Escolha primeiro aquilo que te faz bem.

**Legenda**
> Colocar-se em primeiro lugar soa egoísta até você perceber quanto tempo passou escolhendo por último.
> Não é abandonar ninguém. É chegar inteiro nas pessoas que importam.
> Comece pelo simples: o que hoje te devolve energia em vez de tirar?
>
> Responde aqui embaixo, quero ler.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #frasesdeamorproprio #autocuidado #frasesreflexivas #paginasdecalma #frasescurtas #autoestima

**Alt text:** Pintura a óleo texturizada de uma pessoa caminhando de costas por uma encosta aberta em direção a uma luz quente distante, em tons de rosa empoeirado e terracota no fim da tarde.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases de amor próprio curtas`
- Descrição: Escolha primeiro aquilo que te faz bem. Frases de amor próprio e autocuidado para quem sempre se coloca por último. Reflexões curtas sobre autoestima e escolhas mais leves.

---

## 05 · P1 · F6

**Frase:** O silêncio guarda o que importa.

**Legenda**
> Nem toda conversa precisa acontecer. Nem toda opinião precisa ser dita.
> Tem coisa que só se organiza dentro da gente quando o barulho baixa.
> Ficar quieto não é perder a vez, é escolher onde gastar a voz.
>
> Salve para o próximo dia barulhento.
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #frasesdepaz #silencio #frasesreflexivas #paginasdecalma #calmaria #frasescurtas #descanso

**Alt text:** Pintura a óleo texturizada de uma pessoa sentada de costas na borda de um campo verde que desce até uma baía azul, sob um céu enorme e vazio em tons pastel.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre silêncio e calma`
- Descrição: O silêncio guarda o que importa. Frases de paz sobre silêncio, descanso e calma interior. Reflexões curtas para dias barulhentos e para quem precisa desacelerar a mente.

---

## 06 · P2 · F1 · surreal

**Frase:** Confie no ritmo do seu recomeço.

**Legenda**
> Recomeço não é apagar o que veio antes. É continuar com outro passo.
> Tem dia de andar rápido e dia de só ficar sentado olhando o mar — os dois contam.
> Ninguém recomeça no ritmo de ninguém.
>
> Em que fase você está agora?
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #recomeco #frasesdemudanca #frasesreflexivas #paginasdecalma #coragem #frasescurtas #vidaleve

**Alt text:** Pintura a óleo texturizada de um pequeno astronauta sentado sozinho de costas em um banco de madeira à beira de um mar cinza-esverdeado, sob céu nublado.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases para recomeçar do zero`
- Descrição: Confie no ritmo do seu recomeço. Frases para recomeçar do zero, mudar de fase e seguir no próprio ritmo. Reflexões curtas sobre coragem e paciência com o processo.

---

## 07 · P3 · F6

**Frase:** A espera também faz parte do caminho.

**Legenda**
> A gente trata a espera como tempo perdido, quando quase sempre é tempo de preparo.
> Nem todo avanço aparece no lado de fora.
> Se ainda não abriu, talvez você é que ainda esteja ficando pronto.
>
> Salve para quando a ansiedade apertar.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #frasesreflexivas #confianca #paginasdecalma #tempocerto #frasescurtas #paciencia

**Alt text:** Pintura a óleo texturizada de uma figura minúscula atravessando um vale escuro por uma trilha de luz dourada, sob rastros longos de cometas em um céu âmbar.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases sobre esperar o tempo certo`
- Descrição: A espera também faz parte do caminho. Frases sobre fé, paciência e esperar o tempo certo sem desistir. Reflexões curtas para fases de transição e ansiedade.

---

## 08 · P4 · F5

**Frase:** Você não precisa agradar para ser amado.

**Legenda**
> Quem só te procura quando você concorda não está com você, está com a sua concordância.
> Amor que exige performance cansa rápido e nunca enche.
> Existe gente que fica mesmo quando você discorda, e é dessa gente que vale cuidar.
>
> Salve e releia quando bater a vontade de agradar todo mundo.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #autoestima #frasesreflexivas #relacoessaudaveis #paginasdecalma #frasescurtas #autocuidado

**Alt text:** Pintura a óleo texturizada de duas figuras pequenas sentadas lado a lado de costas em uma encosta ampla no fim da tarde, com o céu quente ocupando quase todo o quadro.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases de autoestima e limites`
- Descrição: Você não precisa agradar para ser amado. Frases de autoestima sobre relações saudáveis, limites e parar de se anular. Reflexões curtas sobre amor próprio no dia a dia.

---

## 09 · P1 · F4

**Frase:** Está tudo bem em querer menos coisas.

**Legenda**
> Querer menos não é falta de ambição. Às vezes é o único jeito de conseguir descansar.
> Uma agenda com espaço vazio não está incompleta.
> Menos compromisso, menos barulho, menos conta para pagar — mais dia seu.
>
> O que você tiraria da sua semana se pudesse?
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #frasesdepaz #vidasimples #frasesreflexivas #paginasdecalma #descanso #frasescurtas #calmaria

**Alt text:** Pintura a óleo texturizada de uma pessoa deitada de costas em uma encosta verde acima de um mar azul parado, com uma árvore pequena ao lado e céu amplo.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre vida simples e paz`
- Descrição: Está tudo bem em querer menos coisas. Frases sobre vida simples, descanso e paz interior. Reflexões curtas para quem quer desacelerar e ter uma rotina mais leve.

---

## 10 · P2 · F2

**Frase:** Dias mais leves virão sem aviso.

**Legenda**
> Ninguém manda recado avisando que a fase mudou. Um dia você percebe que acordou diferente.
> Enquanto não chega, dá para preparar o terreno: dormir, comer, sair um pouco.
> A leveza costuma voltar pelo caminho mais banal.
>
> Salve para reler no dia em que isso parecer impossível.
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #esperanca #frasesreflexivas #recomeco #paginasdecalma #vidaleve #frasescurtas #frasesdeconforto

**Alt text:** Pintura a óleo texturizada de uma pessoa de costas no fim de um píer de pedra diante de um mar cinza-esverdeado, com uma abertura de luz pálida rompendo o céu nublado.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases de esperança e dias melhores`
- Descrição: Dias mais leves virão sem aviso. Frases de esperança para fases difíceis e dias pesados. Reflexões curtas sobre recomeço, conforto e confiança de que a fase passa.

---

## 11 · P3 · F1

**Frase:** Confie no que ainda não dá para ver.

**Legenda**
> Confiar é diferente de ter certeza. Certeza é o que a gente pede quando está com medo.
> Tem processo que só mostra o resultado no fim, e o meio é justamente a parte sem paisagem.
> Você não precisa enxergar o caminho inteiro para dar o próximo passo.
>
> Salve para os dias em que o escuro parecer grande demais.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #frasesreflexivas #confianca #paginasdecalma #frasescurtas #tempocerto #esperanca

**Alt text:** Pintura a óleo texturizada de uma figura minúscula parada na entrada de um vale escuro, diante de um horizonte de luz dourada, sob rastros longos de cometa.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases de fé para quem está no escuro`
- Descrição: Confie no que ainda não dá para ver. Frases de fé e confiança para fases de incerteza. Reflexões curtas sobre seguir sem enxergar o caminho inteiro.

---

## 12 · P4 · F3

**Frase:** Nem toda opinião sobre você é verdade.

**Legenda**
> As pessoas te descrevem com o que elas conseguem enxergar — e quase sempre é pouco.
> O que dizem de você diz mais sobre o lugar de onde estão olhando.
> Você pode ouvir, agradecer e continuar sendo quem já sabia que era.
>
> Salve para a próxima vez que um comentário pesar.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #autoestima #frasesreflexivas #paginasdecalma #frasescurtas #autocuidado #frasesdeamorproprio

**Alt text:** Pintura a óleo texturizada de uma pessoa de costas em uma encosta aberta no fim da tarde, com o céu quente em rosa e terracota ocupando quase todo o quadro.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases de amor próprio sobre opinião alheia`
- Descrição: Nem toda opinião sobre você é verdade. Frases de amor próprio para quem se cobra com o julgamento dos outros. Reflexões curtas sobre autoestima e limites.

---

## 13 · P1 · F5

**Frase:** Você não precisa se explicar para dizer não.

**Legenda**
> Um não com parágrafo de justificativa vira uma negociação aberta.
> Quem respeita você aceita a resposta curta. Quem não aceita ia insistir de qualquer jeito.
> "Hoje não dá" é uma frase inteira.
>
> Salve para o próximo convite que não couber no seu dia.
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #limitessaudaveis #frasesdepaz #frasesreflexivas #paginasdecalma #frasescurtas #serenidade #calmaria

**Alt text:** Pintura a óleo texturizada de uma pessoa sentada de costas sob uma árvore larga no alto de uma colina verde, com um mar azul calmo lá embaixo e céu amplo.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre limites e dizer não`
- Descrição: Você não precisa se explicar para dizer não. Frases sobre limites saudáveis e o direito de recusar sem justificativa. Reflexões curtas sobre paz e energia.

---

## 14 · P2 · F6

**Frase:** O recomeço não pede permissão.

**Legenda**
> Ninguém vai te avisar que agora pode. Não existe essa autorização.
> Recomeço costuma começar meio torto, num dia comum, sem plateia.
> Você muda de direção e o mundo leva um tempo para reparar — tudo bem.
>
> Qual recomeço você está esperando permissão para começar?
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #recomeco #frasesdemudanca #frasesreflexivas #paginasdecalma #coragem #frasescurtas #vidaleve

**Alt text:** Pintura a óleo texturizada de uma pessoa de costas pisando a primeira pedra de um píer longo sobre um mar cinza-esverdeado, com gaivotas levantando voo sob céu nublado.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases de recomeço e coragem`
- Descrição: O recomeço não pede permissão. Frases de recomeço para quem está esperando o momento certo para mudar. Reflexões curtas sobre coragem e começar de novo.

---

## 15 · P3 · F4

**Frase:** Está tudo bem em não ter todas as respostas.

**Legenda**
> A gente aprendeu que dúvida é falha, quando quase sempre é só honestidade.
> Tem pergunta que só se responde vivendo mais um pouco.
> Não saber ainda não é o mesmo que estar perdido.
>
> Salve para quando cobrarem um plano pronto de você.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #frasesreflexivas #confianca #paginasdecalma #frasescurtas #paciencia #tempocerto

**Alt text:** Pintura a óleo texturizada de uma figura minúscula sentada em uma pedra dentro de um vale escuro, olhando um céu âmbar cortado por rastros lentos de cometa.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases sobre não ter todas as respostas`
- Descrição: Está tudo bem em não ter todas as respostas. Frases de fé e paciência para fases de dúvida. Reflexões curtas sobre confiar no processo sem ter tudo resolvido.

---

## 16 · P4 · F2 · surreal

**Frase:** Você vai se reconhecer de novo.

**Legenda**
> Tem época em que a gente olha no espelho e encontra alguém meio estranho.
> Não é perda. É travessia — e travessia mexe com o rosto da gente.
> A pessoa que você é continua aí, esperando o barulho baixar.
>
> Salve para reler quando você se sentir longe de si.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #autoestima #frasesreflexivas #paginasdecalma #frasescurtas #recomeco #autocuidado

**Alt text:** Ilustração de quadrinho em traço grosso: uma figura de capa sentada de costas em um asteroide, olhando um planeta distante subir, sob céu preto cheio de estrelas.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases para quando você se perde de si`
- Descrição: Você vai se reconhecer de novo. Frases de amor próprio para fases de travessia e reconstrução. Reflexões curtas sobre voltar para si mesmo com calma.

---

## 17 · P1 · F1

**Frase:** Guarde um pedaço do dia para você.

**Legenda**
> Se sobrar, não sobra. O tempo para você precisa ser marcado antes, igual compromisso.
> Não precisa ser uma hora. Quinze minutos sem tela e sem cobrança já mudam o dia.
> Descanso não é o prêmio depois de terminar tudo.
>
> Que pedaço do seu dia você consegue proteger amanhã?
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #frasesdepaz #autocuidado #frasesreflexivas #paginasdecalma #descanso #frasescurtas #calmaria

**Alt text:** Ilustração de quadrinho: uma pessoa sentada de costas na borda de uma cratera, com uma garrafa térmica ao lado e um planeta com anéis baixo no horizonte, sob céu estrelado.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre descanso e autocuidado`
- Descrição: Guarde um pedaço do dia para você. Frases de paz sobre descanso, autocuidado e proteger o próprio tempo. Reflexões curtas para rotinas cheias.

---

## 18 · P2 · F3

**Frase:** Nem todo recuo é derrota.

**Legenda**
> Tem hora que voltar dois passos é o que evita o tombo lá na frente.
> Sair de algo que estava te consumindo não é desistir, é escolher outro caminho.
> O que parece recuo de fora costuma ser lucidez de dentro.
>
> Salve para quando te chamarem de desistente.
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #recomeco #frasesdemudanca #frasesreflexivas #paginasdecalma #coragem #frasescurtas #vidaleve

**Alt text:** Ilustração de quadrinho: uma pessoa descendo de costas uma encosta rochosa em uma lua, deixando pegadas, com um planeta vermelho ao longe no céu preto estrelado.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases sobre recuar e recomeçar`
- Descrição: Nem todo recuo é derrota. Frases de recomeço para quem precisou voltar atrás. Reflexões curtas sobre mudar de caminho sem culpa.

---

## 19 · P3 · F5

**Frase:** Você não precisa entender agora para seguir.

**Legenda**
> Entendimento quase sempre chega atrasado, depois que a fase passa.
> Se você esperar fazer sentido para dar o passo, vai ficar parado muito tempo.
> Dá para caminhar com a pergunta aberta.
>
> Salve para o dia em que nada estiver fazendo sentido.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #frasesreflexivas #confianca #paginasdecalma #frasescurtas #tempocerto #esperanca

**Alt text:** Ilustração de quadrinho: uma pessoa caminhando de costas por uma crista estreita de rocha flutuando no espaço, com uma única estrela brilhante à frente.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases para quando nada faz sentido`
- Descrição: Você não precisa entender agora para seguir. Frases de fé para fases confusas e de transição. Reflexões curtas sobre seguir mesmo sem respostas.

---

## 20 · P4 · F6

**Frase:** O seu valor não está em votação.

**Legenda**
> Não é a maioria que decide quanto você vale. Nunca foi.
> Quando a gente entrega essa conta para os outros, cada silêncio vira sentença.
> Você já vale antes da aprovação chegar — e continua valendo se ela não vier.
>
> Salve para o próximo dia de comparação.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #autoestima #frasesreflexivas #paginasdecalma #frasescurtas #autocuidado #frasesdeamorproprio

**Alt text:** Ilustração de quadrinho: uma pessoa de costas em pé numa planície vazia sob um campo de estrelas enorme, com um pequeno satélite cruzando o céu.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases de autoestima e aprovação`
- Descrição: O seu valor não está em votação. Frases de autoestima para quem depende da aprovação dos outros. Reflexões curtas sobre amor próprio e comparação.

---

## 21 · P1 · F4

**Frase:** Está tudo bem em não responder hoje.

**Legenda**
> A mensagem vai continuar lá amanhã. A sua paciência, talvez não.
> Responder no automático custa mais caro do que parece.
> Deixar para depois não é sumir, é chegar inteiro na conversa.
>
> Salve para a próxima notificação que chegar em hora ruim.
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #limitessaudaveis #frasesdepaz #frasesreflexivas #paginasdecalma #descanso #frasescurtas #serenidade

**Alt text:** Ilustração de quadrinho: uma pessoa deitada de costas sobre uma rocha lisa numa lua, mãos atrás da cabeça, sob um céu preto tomado de estrelas.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre responder no seu tempo`
- Descrição: Está tudo bem em não responder hoje. Frases de paz sobre limites, descanso mental e responder no próprio tempo. Reflexões curtas para dias cheios.

---

## 22 · P2 · F2

**Frase:** Você vai olhar para trás com carinho.

**Legenda**
> Esse trecho que hoje parece só cansaço vai virar história que você conta com orgulho.
> Não porque foi bonito, mas porque você atravessou.
> Daqui a um tempo, você vai ter uma ternura estranha por quem você é hoje.
>
> Salve para reler daqui a um ano.
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #esperanca #recomeco #frasesreflexivas #paginasdecalma #vidaleve #frasescurtas #frasesdeconforto

**Alt text:** Ilustração de quadrinho: uma pessoa sentada de costas na borda de uma cratera ao lado de um cachorro pequeno, os dois olhando a Terra azul minúscula ao longe.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases de esperança para fases difíceis`
- Descrição: Você vai olhar para trás com carinho. Frases de esperança e conforto para fases pesadas. Reflexões curtas sobre atravessar e seguir.

---

## 23 · P3 · F1

**Frase:** Deixe o tempo fazer a parte dele.

**Legenda**
> Tem coisa que não se resolve com esforço, se resolve com prazo.
> A gente insiste em apressar o que só amadurece parado.
> Faça a sua parte e devolva o resto para o relógio.
>
> Salve para quando a vontade de forçar bater.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #frasesreflexivas #confianca #paginasdecalma #tempocerto #frasescurtas #paciencia

**Alt text:** Ilustração de quadrinho: uma pessoa sentada de costas ao lado de um relógio alto sozinho numa planície vazia, com planetas no céu preto estrelado.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases sobre paciência e tempo certo`
- Descrição: Deixe o tempo fazer a parte dele. Frases de fé e paciência para quem quer apressar o processo. Reflexões curtas sobre confiar no tempo certo.

---

## 24 · P4 · F3

**Frase:** Nem todo amor que cansa é amor.

**Legenda**
> Cuidado cansa às vezes. Mas se o cansaço virou a regra, vale olhar melhor.
> Amor que exige que você diminua para caber não está te querendo, está te ajustando.
> Existe vínculo que descansa a gente. Existe mesmo.
>
> Salve e releia com calma depois.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #relacoessaudaveis #autoestima #frasesreflexivas #paginasdecalma #frasescurtas #autocuidado

**Alt text:** Ilustração de quadrinho: uma pessoa caminhando de costas para longe de um conjunto de janelas acesas numa planície escura, com uma lua pálida à frente.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases sobre relações que cansam`
- Descrição: Nem todo amor que cansa é amor. Frases de amor próprio sobre relações saudáveis e vínculos que esgotam. Reflexões curtas sobre limites no afeto.

---

## 25 · P1 · F5

**Frase:** Você não precisa de barulho para existir.

**Legenda**
> Nem toda presença precisa ser anunciada. Tem gente que ocupa espaço sem fazer alarde.
> Ficar de fora de uma conversa não te apaga.
> A sua vida não precisa de plateia para estar acontecendo.
>
> Salve para os dias de comparação online.
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #frasesdepaz #silencio #frasesreflexivas #paginasdecalma #calmaria #frasescurtas #vidasimples

**Alt text:** Ilustração de quadrinho: uma pessoa de costas parada no meio de uma cratera ampla e vazia, com uma galáxia espiral girando no céu preto.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre silêncio e presença`
- Descrição: Você não precisa de barulho para existir. Frases de paz sobre silêncio, vida simples e presença discreta. Reflexões curtas para quem quer menos ruído.

---

## 26 · P2 · F6 · surreal

**Frase:** Todo começo é meio desajeitado.

**Legenda**
> A primeira versão de qualquer coisa é torta. Sempre foi.
> A gente compara o próprio começo com o meio do caminho dos outros e conclui que não serve.
> Desajeitado é como começo se parece por dentro.
>
> O que você começaria se pudesse fazer mal feito primeiro?
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #recomeco #frasesdemudanca #frasesreflexivas #paginasdecalma #coragem #frasescurtas #vidaleve

**Alt text:** Ilustração de quadrinho: um pequeno astronauta de costas na borda de uma cratera, com uma bandeira caída ao lado e um planeta distante subindo no céu estrelado.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases sobre começar do jeito que dá`
- Descrição: Todo começo é meio desajeitado. Frases de recomeço para quem trava no perfeccionismo. Reflexões curtas sobre começar torto e seguir.

---

## 27 · P3 · F4

**Frase:** Está tudo bem em confiar de novo.

**Legenda**
> Depois de levar um susto, a gente fecha. Faz sentido, foi proteção.
> Mas viver de portão trancado também cobra um preço, só que devagar.
> Confiar de novo não é esquecer. É escolher não carregar aquilo em toda relação nova.
>
> Salve para quando o medo de repetir aparecer.
>
> Segue a página para receber essas frases no seu feed: @explicologo.

**Hashtags (1º comentário):** #frasesdefe #confianca #frasesreflexivas #paginasdecalma #frasescurtas #esperanca #relacoessaudaveis

**Alt text:** Ilustração de quadrinho: uma pessoa sentada de costas numa rocha com as duas mãos abertas, faíscas subindo devagar para o campo de estrelas.

**Pinterest** — board *Fé e Confiança*
- Título: `Frases sobre confiar de novo`
- Descrição: Está tudo bem em confiar de novo. Frases de fé e confiança para quem se fechou depois de uma decepção. Reflexões curtas sobre reabrir com calma.

---

## 28 · P4 · F2

**Frase:** Vai chegar quem fica sem você pedir.

**Legenda**
> Existe gente que precisa ser convencida a ficar. Essa nunca fica de verdade.
> E existe gente que aparece e simplesmente permanece, sem cobrança nem cena.
> Você vai reconhecer pela leveza, não pelo esforço.
>
> Salve para lembrar de parar de insistir.
>
> Siga @explicologo para uma frase calma por dia.

**Hashtags (1º comentário):** #amorproprio #relacoessaudaveis #autoestima #frasesreflexivas #paginasdecalma #frasescurtas #esperanca

**Alt text:** Ilustração de quadrinho: duas figuras pequenas caminhando devagar uma em direção à outra numa planície escura, sob uma lua enorme, ainda distantes.

**Pinterest** — board *Amor-Próprio*
- Título: `Frases sobre quem fica de verdade`
- Descrição: Vai chegar quem fica sem você pedir. Frases de amor próprio sobre relações saudáveis e parar de insistir. Reflexões curtas sobre vínculos leves.

---

## 29 · P1 · F1

**Frase:** Respire antes de responder.

**Legenda**
> O primeiro impulso quase nunca é o melhor. Ele é só o mais rápido.
> Um minuto de silêncio já muda a frase que ia sair.
> Você não perde a razão por responder devagar — costuma ganhar.
>
> Salve para a próxima discussão que aparecer.
>
> Siga @explicologo — aqui tem uma pausa dessas todo dia.

**Hashtags (1º comentário):** #frasesdepaz #serenidade #frasesreflexivas #paginasdecalma #calmaria #frasescurtas #limitessaudaveis

**Alt text:** Ilustração de quadrinho: uma pessoa sentada de pernas cruzadas de costas na beira de um lago de cratera parado, sob um céu preto imenso e calmo.

**Pinterest** — board *Frases de Paz*
- Título: `Frases sobre calma antes de reagir`
- Descrição: Respire antes de responder. Frases de paz e serenidade sobre reagir com calma. Reflexões curtas para discussões e dias de estresse.

---

## 30 · P2 · F3

**Frase:** Nem todo dia precisa render.

**Legenda**
> Tem dia que a meta é atravessar, e atravessar já é bastante.
> Quem está recomeçando sente isso mais forte: cobra resultado no meio da reconstrução.
> Um dia parado não apaga o mês inteiro nem atrasa a sua virada.
>
> Salve para o próximo dia improdutivo — e não se cobre.
>
> Se isso te fez respirar, siga @explicologo.

**Hashtags (1º comentário):** #recomeco #descanso #frasesreflexivas #paginasdecalma #vidaleve #frasescurtas #frasesdemudanca

**Alt text:** Ilustração de quadrinho: uma pessoa sentada sozinha de costas num banco simples numa planície lunar vazia, com a Terra azul pequena baixa no céu.

**Pinterest** — board *Frases de Recomeço*
- Título: `Frases sobre dias que não rendem`
- Descrição: Nem todo dia precisa render. Frases sobre descanso e recomeço para quem se cobra produtividade. Reflexões curtas sobre dias improdutivos sem culpa.

---

## Cadência sugerida

**Instagram** — 5 posts por semana, na ordem crescente de id. A ordem já alterna os pilares.

**Pinterest** — não jogue tudo de uma vez. 3 a 5 pins por dia, sempre no board do pilar.
Repine os antigos em boards diferentes depois de algumas semanas — pin tem cauda longa.

## Regenerar / editar

```powershell
# nova pintura de fundo de um post
.\gen-imagens.ps1 -Only "03"
.\baixar-imagens.ps1

# nova animacao
.\gen-videos.ps1 -Only "03"
.\baixar-videos.ps1

# mudou a frase em posts.json? re-renderize o texto e remonte
node overlay.js 03
.\montar.ps1 -Only "03"

# rota alternativa: gerar a pintura pelo Gemini em vez do Higgsfield
# (exige faturamento ativo no projeto Google; o free tier da cota 0 para imagem)
node --env-file=.env gen-imagens-gemini.mjs 16 17 18

# mudou copy.json ou posts.json? regenere os derivados
node build-md.js
node build-page.js
```

`overlay.js` e `build-page.js` dependem do `sharp`, que mora fora do repo:
rode com `NODE_PATH` apontando para o `node_modules` das ferramentas.

## Publicar

```bash
# confere conta e URLs publicas antes de qualquer coisa
node --env-file=../../explicologo/.env postar-reels.js --checar
node --env-file=../../explicologo/.env postar-reels.js 06 07 08
```

O token de `@explicologo` fica em `Desktop/explicologo/.env` (fora deste repo).
`../MazyOS/.env` é a conta `@theatrum.br` — o `--checar` barra a publicação cruzada.
Cada post publicado fica registrado em `publicados.json` e nunca sai duas vezes.
