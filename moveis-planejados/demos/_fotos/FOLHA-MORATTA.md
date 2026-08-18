# Morattá — folha de geração

Gerado por `monta-folha.mjs` a partir do `man-moratta.txt`. Só lista o que
**ainda não existe** em `../moratta/` — rode de novo a qualquer momento para
ver o que sobrou.

Todas as fotos entram no site em preto e branco: o CSS aplica
`filter:grayscale(1)` em `.ph img`. Se sair colorido, serve do mesmo jeito.
O recorte também é automático (`fit:cover`), então a proporção indicada é o
alvo ideal, não uma exigência.

## O estilo — colar uma vez, no começo da sessão

As 24 imagens partilham este bloco. No AI Studio ele entra em **System
instructions**; no Gemini, como primeira mensagem da conversa. Depois disso
basta colar a linha de cena de cada item.

```
Every image in this session follows the same look:
black and white, high-key editorial interior photography, soft diffused north light, deep blacks with retained shadow detail, matte finish, fine 35mm film grain, shot on a 24mm tilt-shift lens at f/8, perfectly vertical verticals, muted contrast, no color, no text, no logo, no watermark, photorealistic
```

> Se o gerador ignorar a instrução e devolver algo fora do estilo, cole o bloco
> junto da cena naquele item. É o único caso em que vale repetir.

---

## A · Fotos — 17 itens

**Onde:** Gemini (gemini.google.com) ou AI Studio (aistudio.google.com), no
navegador logado. Não gastam crédito do Flow.

**Depois de gerar:** salvar o arquivo dentro de `png-moratta/` com o nome
indicado. Pode ser solto na raiz da pasta e em qualquer extensão de imagem —
o conversor procura pelo nome e cuida de pasta, corte, tamanho e peso. Aí:
e rodar:

```
node converter.mjs man-moratta.txt png-moratta ../moratta
```

### A01 · `img/cozinhas/sereno.jpg`
**4:5** · salvar em `png-moratta/sereno.*` (qualquer extensão de imagem)

```
Kitchen in raw sand tones with reeded glass upper cabinet doors and a stone backsplash, soft and airy.
```

### A02 · `img/cozinhas/fresta.jpg`
**4:5** · salvar em `png-moratta/fresta.*` (qualquer extensão de imagem)

```
Kitchen with a full vertical slatted wall, a deep lit niche holding ceramics and a slim peninsula, strong graphic rhythm.
```

### A03 · `img/cozinhas/praca.jpg`
**4:5** · salvar em `png-moratta/praca.*` (qualquer extensão de imagem)

```
Kitchen built around a central island with a thick quartz countertop, four stools and a sculptural pendant lamp above.
```

### A04 · `img/cozinhas/compacta.jpg`
**4:5** · salvar em `png-moratta/compacta.*` (qualquer extensão de imagem)

```
Very small kitchen of six square metres, one continuous L-shaped run, tall slim pantry, everything integrated, apartment window at the end.
```

### A05 · `img/cozinhas/detalhe-puxador.jpg`
**4:5** · salvar em `png-moratta/detalhe-puxador.*` (qualquer extensão de imagem)

```
Extreme close-up of a recessed channel pull machined into the door profile of a matte lacquer front, a finger about to hook into the groove, raking light along the edge.
```

### A06 · `img/lancamento/onix-hero.jpg`
**16:9** · salvar em `png-moratta/onix-hero.*` (qualquer extensão de imagem)

```
Wide dark kitchen in ultra-matte black lacquer with walnut veneer, one strong shaft of light across the island, integrated LED under the wall units, cinematic and low key.
```

### A07 · `img/lancamento/onix-capa.jpg`
**3:2** · salvar em `png-moratta/img/lancamento/onix-capa.*` — **mantenha a subpasta**, este nome se repete

```
Three-quarter view of the same black lacquer and walnut kitchen, seen from the living room through a wide opening, evening light.
```

### A08 · `img/lancamento/onix-detalhe.jpg`
**4:5** · salvar em `png-moratta/onix-detalhe.*` (qualquer extensão de imagem)

```
Close-up of the junction between a matte black lacquer panel and a walnut veneer panel, a precise shadow gap between them, raking light.
```

### A09 · `img/lancamento/modulo-01.jpg`
**4:5** · salvar em `png-moratta/modulo-01.*` (qualquer extensão de imagem)

```
Open tall oven tower cabinet with a rear ventilation slot and a removable shelf, appliance bay empty, clean interior.
```

### A10 · `img/lancamento/modulo-02.jpg`
**4:5** · salvar em `png-moratta/modulo-02.*` (qualquer extensão de imagem)

```
Kitchen island with a countertop cantilevering thirty-five centimetres with no visible bracket, seen from a low angle.
```

### A11 · `img/lancamento/modulo-03.jpg`
**4:5** · salvar em `png-moratta/modulo-03.*` (qualquer extensão de imagem)

```
Open cutlery drawer with dividers machined directly into the panel, utensils perfectly aligned, seen from above at an angle.
```

### A12 · `img/lancamento/modulo-04.jpg`
**4:5** · salvar em `png-moratta/modulo-04.*` (qualquer extensão de imagem)

```
Corner cabinet with a swing-out carousel mechanism pulled halfway open, revealing pots stored in the dead angle.
```

### A13 · `img/lancamento/modulo-05.jpg`
**4:5** · salvar em `png-moratta/modulo-05.*` (qualquer extensão de imagem)

```
Acoustic slatted wall panel photographed at a sharp angle, mineral wool visible in the shadow gaps between the slats.
```

### A14 · `img/lancamento/modulo-06.jpg`
**4:5** · salvar em `png-moratta/modulo-06.*` (qualquer extensão de imagem)

```
Recessed niche with an LED strip inside an aluminium profile, no visible cable, casting an even glow on a stone back panel.
```

### A15 · `img/showroom/showroom-01.jpg`
**4:5** · salvar em `png-moratta/showroom-01.*` (qualquer extensão de imagem)

```
Central aisle of a large furniture showroom, complete kitchens and closets assembled on both sides, polished concrete floor, track lighting overhead, deep perspective, no people.
```

### A16 · `img/lojista/loja-parceira.jpg`
**3:2** · salvar em `png-moratta/loja-parceira.*` (qualquer extensão de imagem)

```
Street-level façade of a planned-furniture store at blue hour, a wide illuminated shop window showing an assembled kitchen inside, glass door, clean minimal signage band above with no readable text.
```

### A17 · `img/og.jpg`
**1:1** · salvar em `png-moratta/og.*` (qualquer extensão de imagem)

```
Wide hero-style kitchen with an island and vertical slatted panelling, generous empty space on the left third of the frame for a logo overlay.
```

---

## B · Vídeos — 7 itens, dois passos cada

Cada um destes vira **duas** entregas: a imagem de capa, que o site já usa
como poster, e o vídeo animado a partir dela.

**Passo 1 — a capa.** Mesmo caminho das fotos acima: gerar com o prompt de
cena, salvar em `png-moratta/`, rodar o `converter.mjs`.

**Passo 2 — o vídeo.** No Flow (labs.google/flow), modo **Frames to Video**:
subir a imagem do passo 1 como primeiro quadro e colar o prompt de movimento.
Baixar o mp4 para `video-moratta/` — não precisa renomear, basta o nome do
arquivo conter o alvo indicado no item. Depois:

```
node converter-video.mjs
```

> **Gere um só e olhe antes de fazer os sete.** Um vídeo anterior nasceu com
> uma câmera em tripé dentro da cena porque o prompt dizia "tripod dolly", e
> custou o retrabalho inteiro. Os prompts abaixo já saem sem nome de
> equipamento, mas a conferência de um antes dos sete continua valendo.

### B1 · `img/hero/hero-01.mp4`
capa (**16:9**): salvar em `png-moratta/hero-01.*` (qualquer extensão de imagem)
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`hero-01`

*1 · cena da capa:*

```
A large contemporary planned kitchen at golden hour, matte lacquer cabinetry and a floor-to-ceiling vertical slatted panel behind a quartz island; a woman in a linen dress walks past the island in soft motion blur while everything else stays perfectly still; warm rim light from a tall window on the right; four upholstered stools in the foreground.
```

*2 · movimento, no Flow:*

```
The view moves slowly forward, closing in on the scene, with a barely perceptible drift, as if the frame were breathing. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

### B2 · `img/hero/hero-02.mp4`
capa (**16:9**): salvar em `png-moratta/hero-02.*` (qualquer extensão de imagem)
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`hero-02`

*1 · cena da capa:*

```
Extreme close-up travelling along a matte black lacquer cabinet door with an integrated recessed channel pull; raking light grazes the surface and reveals the velvet texture of the paint; the shot slides right and reveals a walnut veneer panel meeting the black lacquer in a clean shadow gap.
```

*2 · movimento, no Flow:*

```
The view glides steadily sideways to the right. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

### B3 · `img/hero/hero-03.mp4`
capa (**16:9**): salvar em `png-moratta/hero-03.*` (qualquer extensão de imagem)
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`hero-03`

*1 · cena da capa:*

```
A family of three in a warm living room at dusk: a father sits on the floor with a small child while the mother leans on a floor-to-ceiling built-in shelving unit; a slatted wood panel and integrated lighting glow behind them; window light falls from the left.
```

*2 · movimento, no Flow:*

```
The view draws slowly backwards until the whole room is open in frame, with a barely perceptible drift. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

### B4 · `img/hero/hero-04.mp4`
capa (**16:9**): salvar em `png-moratta/hero-04.*` (qualquer extensão de imagem)
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`hero-04`

*1 · cena da capa:*

```
Interior of a modern furniture factory floor: a CNC beam saw cutting a large MDF panel, fine sawdust suspended in a shaft of skylight, stacked panels in racks receding into the depth of the hall, a worker in uniform and safety glasses watching the cut.
```

*2 · movimento, no Flow:*

```
The view glides slowly sideways, passing between the machines, industrial scale, no clutter. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

### B5 · `img/video/institucional.mp4`
capa (**16:9**): salvar em `png-moratta/institucional-capa.*` (qualquer extensão de imagem)
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`institucional`

*1 · cena da capa:*

```
Two founders on a factory floor, a woman in her fifties in a dark shirt and an older man beside her, mid-conversation, both smiling naturally; shallow depth of field, machinery softly out of focus behind them; documentary feel, not posed.
```

*2 · movimento, no Flow:*

```
The view closes in slowly on the woman. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

### B6 · `img/video/fabrica.mp4`
capa (**16:9**): salvar em `png-moratta/fabrica-capa.*` (qualquer extensão de imagem)
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`fabrica`

*1 · cena da capa:*

```
Macro shot of an automatic edge-banding machine applying a thin edge tape to a panel; the roller presses, a thin ribbon of melted adhesive glints, the panel slides forward on rubber wheels; steam and fine dust in the light beam.
```

*2 · movimento, no Flow:*

```
The framing stays almost perfectly still and eases only a hair closer. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

### B7 · `img/video/onix.mp4`
capa (**16:9**): salvar em `png-moratta/img/video/onix-capa.*` — **mantenha a subpasta**, este nome se repete
vídeo: salvar em `video-moratta/` — o nome do Flow serve, desde que contenha
`onix`

*1 · cena da capa:*

```
Travelling through a dark, elegant kitchen finished in matte black lacquer and walnut veneer; integrated LED strips glow under the wall units; a tall pantry door opens slowly on soft-close hinges revealing organised interior shelving.
```

*2 · movimento, no Flow:*

```
The view moves slowly forward through the room, cinematic, low key. Five seconds, one continuous shot, no cuts. No text, no logo, no watermark, and no camera or filming equipment visible in frame.
```

