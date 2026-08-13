# SEIS PANOS — pacote de prompts Higgsfield

O trabalho aqui é diferente do site de móveis. Lá tudo era gerado do zero. Aqui **a foto do boné é sua** e a IA só constrói a cena em volta. Isso muda a ordem: primeiro os dois modelos fixos, depois a receita que você repete para cada boné que mandar no chat.

---

## 1. Como o Higgsfield deve ser usado neste projeto

| Etapa | Ferramenta | O que fazer |
|---|---|---|
| Modelos fixos | **Character / Soul** | Criar UMA personagem feminina e UM personagem masculino e salvar. Todas as fotos do site usam esses dois. |
| Boné no modelo | **Image-to-image com imagem de referência** | Subir a foto do seu boné como referência de produto e prompt descrevendo só a cena, nunca o boné. |
| Packshot | **nenhuma** | A foto `-1` de cada produto é a sua foto real, recortada em fundo creme. Não gere isso. |
| Cenas de campanha | **Soul** | Hero, lookbook, categorias e clientes. |

**A regra que faz ou quebra tudo:** quando a foto do boné entrar como referência, o prompt não pode descrever cor, patch ou bordado. Se você descrever, o modelo redesenha o boné e você perde a fidelidade do produto. Descreva só a pessoa, a luz e o fundo — e termine com a trava do item 3.

---

## 2. Os dois modelos (gere uma vez, use sempre)

### MODELO A — feminina · salvar como `modelo-a`
```
A young woman in her mid-twenties, natural beauty, long straight dark hair moving slightly
in the wind, minimal makeup, small gold hoop earrings and a thin gold chain, calm confident
expression looking slightly off camera. Wearing a sand-coloured ribbed turtleneck under a
beige utility jacket. Neutral studio lighting, plain background, front-facing reference shot,
shot on 85mm at f/2.8, photorealistic, sharp facial detail.
```

### MODELO B — masculino · salvar como `modelo-b`
```
A young man in his mid-twenties, short faded haircut and light beard, warm brown skin, calm
confident expression looking straight at camera. Wearing a beige ribbed turtleneck under a
sand-coloured overshirt. Neutral studio lighting, plain background, front-facing reference
shot, shot on 85mm at f/2.8, photorealistic, sharp facial detail.
```

Gere 3 ou 4 variações de cada, escolha a melhor e **salve como personagem**. Daqui pra frente é só chamar `modelo-a` / `modelo-b`. Se a plataforma não tiver personagem salvo, guarde a imagem aprovada e use como referência de rosto em toda geração.

---

## 3. Blocos que se repetem

### `[CENA]` — a atmosfera da sua referência
```
low-angle shot from below looking up, bright clear blue sky filling the background,
outdoor basketball court, the rim and net of a hoop entering the frame at the edge,
late afternoon sun, soft warm rim light on the skin, tonal beige and sand wardrobe,
shot on 35mm at f/2.0, shallow depth of field, editorial streetwear campaign,
warm muted colour grade, subtle film grain, photorealistic
```

### `[TRAVA]` — cole sempre que a foto do boné for referência
```
the cap is exactly the reference image, unchanged: same colour, same panel structure,
same front patch, same embroidery, same brim shape and same sticker on the brim.
Do not redesign, recolour or reinterpret the cap. Keep the brim perfectly flat and the
logo undistorted.
```

### `[NEG]` — negative prompt, o mesmo para tudo
```
text, letters, watermark, logo overlay, distorted hands, extra fingers, deformed face,
warped cap brim, curved brim, melted embroidery, blurred patch, plastic skin, oversharpened,
HDR halo, cluttered background, cars, crowd, low resolution, cartoon, illustration, 3d render
```

---

## 4. A RECEITA — 4 fotos por boné

Você manda a foto do boné no chat, eu devolvo o texto já com o nome preenchido. Mas a receita é sempre esta, e você pode rodar sozinho. Troque só `<BONÉ>` pelo nome do modelo.

Nomes de arquivo (o site já procura por eles):

```
img/produtos/<id>-1.jpg   packshot — sua foto, fundo creme, sem IA
img/produtos/<id>-2.jpg   modelo A vestindo
img/produtos/<id>-3.jpg   detalhe do produto
img/produtos/<id>-4.jpg   modelo B vestindo
```

O `<id>` é o mesmo que está em `assets/js/dados.js` (ex.: `areia-rubro`).

---

### Foto 2 — modelo A vestindo · **1:1** · referência: foto do boné + `modelo-a`
```
modelo-a wearing the cap, seen from a low angle from below, head slightly tilted, one hand
adjusting the brim, hair moving in the wind, looking off camera to the right. [CENA] [TRAVA]
```

### Foto 3 — detalhe · **1:1** · referência: foto do boné
```
Extreme close-up of the cap held in two hands against a clear blue sky, brim in the foreground
and slightly out of focus, front patch perfectly sharp, raking late-afternoon light across the
embroidery texture. No face in frame. [CENA] [TRAVA]
```

### Foto 4 — modelo B vestindo · **1:1** · referência: foto do boné + `modelo-b`
```
modelo-b wearing the cap straight and low on the forehead, seen from a low angle from below,
chin slightly raised, both hands in jacket pockets, looking straight at camera. [CENA] [TRAVA]
```

### Bônus — a foto que vende o unissex · **1:1 ou 4:5**
```
modelo-a and modelo-b standing shoulder to shoulder, both wearing the same cap model,
seen from a low angle from below, heads close together filling the upper frame, basketball
hoop entering the frame on the left. Both looking in slightly different directions.
[CENA] [TRAVA]
```

**Dica de crédito:** rode a foto 2 primeiro. Se o boné saiu fiel, o mesmo ajuste vale para 3 e 4. Se saiu deformado, reforce a `[TRAVA]` antes de gastar as outras três.

---

## 5. Cenas de campanha (gere uma vez cada)

| Arquivo | Formato | Prompt |
|---|---|---|
| `img/hero/hero-principal.jpg` | 16:9 | `modelo-a and modelo-b together, both holding caps in their hands at chest height and one wearing a cap, seen from a low angle from below, faces in the upper third, generous empty sky on the left side of the frame for the headline. Basketball hoop and backboard entering the frame on the far left. ` + `[CENA] [TRAVA]` |
| `img/lifestyle/unissex-duo.jpg` | 4:5 | `modelo-a and modelo-b side by side wearing the exact same cap model, heads tilted toward each other, seen from a low angle. Same wardrobe tone, different silhouettes. ` + `[CENA] [TRAVA]` |
| `img/drop/drop-hero.jpg` | 16:9 | `modelo-a and modelo-b on an outdoor court at golden hour, each holding two caps fanned out in one hand, low-angle shot, long shadows on the court floor, warmer light than the other shots. ` + `[CENA] [TRAVA]` |
| `img/drop/lookbook-01.jpg` | 4:5 | `Split composition: modelo-a on the left and modelo-b on the right, both wearing the same sand cap, shot from below against blue sky, symmetrical framing, editorial lookbook page. ` + `[CENA] [TRAVA]` |
| `img/og.jpg` | 1200×630 | `modelo-a and modelo-b from a low angle with caps, wide horizontal crop, large clean sky area on the left third for a logo overlay. ` + `[CENA] [TRAVA]` |

---

## 6. Categorias — 3:4

O site usa quatro cartões verticais. Aqui a foto do boné entra como referência só se você já tiver o modelo daquele formato.

| Arquivo | Prompt (+ `[CENA]` + `[NEG]`) |
|---|---|
| `img/categorias/fitted.jpg` | `modelo-b wearing a flat-brim fitted cap, tight vertical crop from chest up, seen from below, sticker still on the brim` |
| `img/categorias/snapback.jpg` | `modelo-a wearing a snapback cap, hand reaching back to adjust the plastic strap, tight vertical crop, seen from below` |
| `img/categorias/trucker.jpg` | `modelo-b wearing a trucker cap with mesh back, three-quarter view showing the mesh panel against the light, tight vertical crop` |
| `img/categorias/dad-hat.jpg` | `modelo-a wearing a low-profile curved-brim dad hat, relaxed posture, tight vertical crop, softer light` |

---

## 7. Prova social — 1:1, propositalmente imperfeitas

Estas **não** devem parecer campanha. Foto de cliente boa é foto de cliente ruim.

| Arquivo | Prompt (+ `[NEG]`) |
|---|---|
| `img/social/cliente-01.jpg` | `Casual smartphone selfie of a man in his thirties wearing a sand fitted cap, taken at arm's length in a apartment hallway with a mirror, slightly uneven framing, mixed indoor lighting, mild phone-camera noise, authentic user-generated photo, not a studio shot` |
| `img/social/cliente-02.jpg` | `Casual smartphone photo of a woman in her twenties wearing a tie-dye patch cap, standing on a city sidewalk at midday, slightly harsh sunlight, imperfect framing, authentic user-generated photo, not a studio shot` |
| `img/social/cliente-03.jpg` | `Casual smartphone photo of a man in his late twenties wearing a black cap, seated in a café, shallow phone-portrait-mode background, warm indoor light, authentic user-generated photo, not a studio shot` |

---

## 8. Vídeos (opcional, mas sobe muito a conversão do hero)

Formato 16:9, 5 s, movimento baixo. Use a imagem aprovada como *start frame*.

| Arquivo | Câmera | Prompt |
|---|---|---|
| `img/hero/hero-principal.mp4` | tilt-up lento | `Camera slowly tilts up from the court floor to the two models holding caps against the blue sky, hair moving in the wind, 5 seconds, no cuts` |
| `img/drop/drop-hero.mp4` | orbital curto | `Camera arcs slowly around the two models on the court at golden hour, caps in hand, long shadows sweeping, 5 seconds` |
| `img/produtos/<id>-gira.mp4` | giro do produto | `The cap rotates slowly 180 degrees on an invisible stand against a plain cream background, brim staying perfectly flat, even soft light, 5 seconds` |

---

## 9. Depois de gerar

1. Nomes exatos, minúsculas, com hífen, sem acento.
2. `.webp` ou `.jpg` a 80%. Mire em **menos de 250 KB** por foto de produto e **menos de 400 KB** no hero. Loja lenta perde venda antes de mostrar o boné.
3. Solte em `img/<subpasta>/`. O placeholder cinza some sozinho.
4. Packshot (`-1`) com fundo creme `#E9E2D4` — é a cor que o CSS já usa atrás do produto, então o recorte fica invisível.

## 10. Duas coisas a decidir antes de publicar

**Marcas reais.** O catálogo de demonstração usa nomes de cor e formato (`Fitted 59 · Areia Rubro`), sem time e sem marca. Isso é de propósito: mantém o portfólio limpo de marca registrada. Se você trocar por bonés de marca real nas fotos, o site continua funcionando — só saiba que aí a peça deixa de ser 100% fictícia.

**Escassez honesta.** Os contadores de estoque e o cronômetro do drop puxam de `dados.js` e do relógio do navegador. Numa loja real, ligue esses números ao estoque de verdade. Escassez inventada converte uma vez e queima a marca depois — e o texto do site inteiro foi escrito assumindo que os números são reais.
