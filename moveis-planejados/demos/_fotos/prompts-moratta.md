# Morattá — pacote de prompts Higgsfield

Todos os prompts em **inglês** (o Higgsfield responde melhor) e mapeados **1:1** com os arquivos que o site já procura. Gere, salve com o nome exato e jogue na pasta `moratta/img/...` — o placeholder some sozinho.

Enquanto um arquivo não existe, o site mostra um bloco cinza com o nome dele escrito no meio. Isso é proposital: serve de checklist visual.

---

## 1. Bloco de estilo (cole no fim de TODO prompt de imagem)

```
black and white, high-key editorial interior photography, soft diffused north light,
deep blacks with retained shadow detail, matte finish, fine 35mm film grain,
shot on a 24mm tilt-shift lens at f/8, perfectly vertical verticals, muted contrast,
no color, no text, no logo, no watermark, photorealistic
```

**Atalho:** abaixo esse bloco aparece como `[STYLE]`. Substitua na hora de colar.

## 2. Negative prompt (o mesmo para tudo)

```
color, saturated colors, text, letters, watermark, logo, signature, distorted geometry,
warped straight lines, fisheye, cluttered props, plastic look, oversharpened, HDR halo,
extra fingers, deformed hands, blurry, low resolution, cartoon, illustration, 3d render
```

## 3. Configuração no Higgsfield

| O que | Onde | Ajuste |
|---|---|---|
| Imagens | Higgsfield **Soul** (ou o modelo de imagem fotorreal disponível) | Qualidade máxima, sem upscale artístico |
| Vídeos | **Image-to-video**, usando a imagem gerada como *start frame* | 5 s, 1080p, movimento **baixo** |
| Câmera | Preset de câmera do Higgsfield | Indicado em cada prompt de vídeo |
| Consistência | Reaproveite a mesma seed dentro de cada bloco | Mantém a identidade entre os 11 ambientes |

**Ordem que economiza crédito:** gere primeiro a imagem estática, aprove, e só então transforme em vídeo. O frame inicial do vídeo já serve de poster (`*-capa.jpg` / `hero-0X.jpg`) — não precisa gerar o poster à parte.

---

# VÍDEOS (7)

## Slider da home — 16:9, 5 s, loop suave

### `img/hero/hero-01.mp4` — poster `img/hero/hero-01.jpg`
> **Câmera:** dolly-in lento
```
A large contemporary planned kitchen at golden hour, matte lacquer cabinetry and a floor-to-ceiling
vertical slatted panel behind a quartz island; a woman in a linen dress walks past the island in
soft motion blur while everything else stays perfectly still; warm rim light from a tall window on
the right; four upholstered stools in the foreground. Slow dolly-in, 5 seconds, subtle handheld float.
[STYLE]
```

### `img/hero/hero-02.mp4` — poster `img/hero/hero-02.jpg`
> **Câmera:** travelling lateral rasante (left-to-right slider)
```
Extreme close-up travelling along a matte black lacquer cabinet door with an integrated recessed
channel pull; raking light grazes the surface and reveals the velvet texture of the paint; the shot
slides right and reveals a walnut veneer panel meeting the black lacquer in a clean shadow gap.
Lateral slider move, 5 seconds, no cuts.
[STYLE]
```

### `img/hero/hero-03.mp4` — poster `img/hero/hero-03.jpg`
> **Câmera:** pull-back lento
```
A family of three in a warm living room at dusk: a father sits on the floor with a small child while
the mother leans on a floor-to-ceiling built-in shelving unit; a slatted wood panel and integrated
lighting glow behind them; window light falls from the left. Slow pull-back revealing the whole room,
5 seconds, gentle handheld.
[STYLE]
```

### `img/hero/hero-04.mp4` — poster `img/hero/hero-04.jpg`
> **Câmera:** dolly lateral entre as máquinas
```
Interior of a modern furniture factory floor: a CNC beam saw cutting a large MDF panel, fine sawdust
suspended in a shaft of skylight, stacked panels in racks receding into the depth of the hall,
a worker in uniform and safety glasses watching the cut. Slow lateral dolly between the machines,
5 seconds, industrial scale, no clutter.
[STYLE]
```

## Blocos de vídeo institucionais — 16:9, 5 s

### `img/video/institucional.mp4` — poster `img/video/institucional-capa.jpg`
```
Two founders on a factory floor, a woman in her fifties in a dark shirt and an older man beside her,
mid-conversation, both smiling naturally; shallow depth of field, machinery softly out of focus behind
them; documentary feel, not posed. Slow push-in on the woman, 5 seconds.
[STYLE]
```

### `img/video/fabrica.mp4` — poster `img/video/fabrica-capa.jpg`
```
Macro shot of an automatic edge-banding machine applying a thin edge tape to a panel; the roller
presses, a thin ribbon of melted adhesive glints, the panel slides forward on rubber wheels; steam
and fine dust in the light beam. Locked-off macro with a slight push-in, 5 seconds.
[STYLE]
```

### `img/video/onix.mp4` — poster `img/video/onix-capa.jpg`
```
Travelling through a dark, elegant kitchen finished in matte black lacquer and walnut veneer;
integrated LED strips glow under the wall units; a tall pantry door opens slowly on soft-close hinges
revealing organised interior shelving. Forward travelling, 5 seconds, cinematic, low key.
[STYLE]
```

---

# AMBIENTES — grid da home e da coleção (11 imagens, **1:1 quadrado**)

Gere os onze com a **mesma seed** e o mesmo bloco de estilo. É isso que faz a grade parecer uma coleção só.

| Arquivo | Prompt (+ `[STYLE]`) |
|---|---|
| `img/ambientes/cozinhas.jpg` | `Contemporary planned kitchen, quartz island, floor-to-ceiling vertical slatted panel, integrated under-cabinet lighting, no visible handles, empty and pristine, square composition` |
| `img/ambientes/lavanderia.jpg` | `Compact laundry room with a stacked washer and dryer tower behind matte cabinet doors, a folding counter, a slim pull-out ironing board, ceramic floor, square composition` |
| `img/ambientes/dormitorios.jpg` | `Main bedroom with a full-width upholstered headboard integrated into a wooden panel, floating nightstands, a sliding-door wardrobe running the whole wall, linen bedding, square composition` |
| `img/ambientes/banheiro.jpg` | `Bathroom with a wall-hung vanity in fluted wood, a backlit mirror cabinet, stone countertop, a single vessel basin, large-format tiles, square composition` |
| `img/ambientes/gourmet.jpg` | `Covered gourmet terrace with a built-in barbecue, a glass-front wine cabinet, quartz countertop, bar stools and a slatted ceiling, garden softly out of focus, square composition` |
| `img/ambientes/home.jpg` | `Home theatre wall with a slatted acoustic panel, floating shelves, a recessed niche with concealed lighting and no visible cables, a low sofa in the foreground, square composition` |
| `img/ambientes/corporativo.jpg` | `Corporate reception with a solid planned counter, a slatted wooden feature wall, indirect lighting, two designer armchairs, polished concrete floor, square composition` |
| `img/ambientes/kids.jpg` | `Child bedroom with a built-in low bed, rounded-corner open niches, a small study desk and a soft rug; no toys scattered, calm and tidy, square composition` |
| `img/ambientes/hall.jpg` | `Entry hall with a full-height panel, a floating bench, a tall mirror, a slim shoe cabinet and a pendant lamp, natural light from the side, square composition` |
| `img/ambientes/sala.jpg` | `Living room with a floor-to-ceiling built-in shelving unit, integrated lighting, a low sideboard, a linen sofa and a large window on the left, square composition` |
| `img/ambientes/closet.jpg` | `Open walk-in closet with a central island with glass-top drawers, glass-front wardrobe doors, integrated rail lighting, folded garments perfectly aligned, square composition` |

---

# ACABAMENTOS — faixa de três (5 imagens, **4:3**)

| Arquivo | Prompt (+ `[STYLE]`) |
|---|---|
| `img/acabamentos/grafite-bruto.jpg` | `Macro texture of a deep graphite matte lacquer panel under raking light, showing the fine velvet grain of the paint and a soft highlight along the top edge, filling the frame` |
| `img/acabamentos/areia-crua.jpg` | `Macro texture of a raw sand-toned textured MDF panel, visible fine wood-fibre relief, soft side light revealing the surface pattern, filling the frame` |
| `img/acabamentos/nogueira-viva.jpg` | `Macro texture of a book-matched walnut veneer panel, long continuous grain running diagonally, a satin sheen catching low light, filling the frame` |
| `img/acabamentos/onix-fosco.jpg` | `Macro texture of an ultra-matte black automotive-grade lacquer panel with a recessed channel pull cut into the edge, one sharp specular line along the groove, filling the frame` |
| `img/acabamentos/quartzo-bruto.jpg` | `Macro texture of a honed quartz countertop slab with faint mineral veining and a mitred edge, soft diffuse light, filling the frame` |

---

# PÁGINA A MORATTÁ (3 imagens)

| Arquivo | Formato | Prompt (+ `[STYLE]`) |
|---|---|---|
| `img/marca/marca-hero.jpg` | 16:9 | `Wide exterior of a large modern furniture factory at dawn, long horizontal volume with ribbon windows, loading docks with two trucks, empty asphalt yard, low mist, dramatic sky` |
| `img/marca/manifesto.jpg` | 4:5 | `A hand running along the edge of a matte lacquer cabinet door, feeling the laser-bonded edge band; extreme shallow depth of field, workshop softly out of focus behind` |
| `img/marca/fundadora.jpg` | 4:5 | `Environmental portrait of a woman architect in her early fifties standing on a factory floor, arms crossed, wearing a dark shirt, rolled drawings under one arm, machinery blurred behind her, natural light, confident and unposed` |

---

# PÁGINA COLEÇÃO (1 imagem)

| Arquivo | Formato | Prompt (+ `[STYLE]`) |
|---|---|---|
| `img/colecao/colecao-hero.jpg` | 16:9 | `Wide interior showing three planned environments visible at once through open doorways — a kitchen, a living room and a closet — all sharing the same cabinetry language, deep perspective down a corridor, natural light at the far end` |

---

# PÁGINA COZINHAS (8 imagens)

| Arquivo | Formato | Prompt (+ `[STYLE]`) |
|---|---|---|
| `img/cozinhas/cozinhas-hero.jpg` | 16:9 | `Wide shot of a large planned kitchen with a four-metre island, vertical slatted panelling, integrated lighting under every wall unit and a tall pantry wall, morning light from the left` |
| `img/cozinhas/onix.jpg` | 4:5 | `Kitchen in matte black lacquer with walnut veneer accents and a floating shelf lit from within, moody and low key` |
| `img/cozinhas/verga.jpg` | 4:5 | `Kitchen in natural wood veneer with a continuous recessed channel pull running across every drawer front, warm and calm` |
| `img/cozinhas/sereno.jpg` | 4:5 | `Kitchen in raw sand tones with reeded glass upper cabinet doors and a stone backsplash, soft and airy` |
| `img/cozinhas/fresta.jpg` | 4:5 | `Kitchen with a full vertical slatted wall, a deep lit niche holding ceramics and a slim peninsula, strong graphic rhythm` |
| `img/cozinhas/praca.jpg` | 4:5 | `Kitchen built around a central island with a thick quartz countertop, four stools and a sculptural pendant lamp above` |
| `img/cozinhas/compacta.jpg` | 4:5 | `Very small kitchen of six square metres, one continuous L-shaped run, tall slim pantry, everything integrated, apartment window at the end` |
| `img/cozinhas/detalhe-puxador.jpg` | 4:5 | `Extreme close-up of a recessed channel pull machined into the door profile of a matte lacquer front, a finger about to hook into the groove, raking light along the edge` |

---

# PÁGINA LANÇAMENTO — LINHA ÔNIX (9 imagens)

| Arquivo | Formato | Prompt (+ `[STYLE]`) |
|---|---|---|
| `img/lancamento/onix-hero.jpg` | 16:9 | `Wide dark kitchen in ultra-matte black lacquer with walnut veneer, one strong shaft of light across the island, integrated LED under the wall units, cinematic and low key` |
| `img/lancamento/onix-capa.jpg` | 3:2 | `Three-quarter view of the same black lacquer and walnut kitchen, seen from the living room through a wide opening, evening light` |
| `img/lancamento/onix-detalhe.jpg` | 4:5 | `Close-up of the junction between a matte black lacquer panel and a walnut veneer panel, a precise shadow gap between them, raking light` |
| `img/lancamento/modulo-01.jpg` | 4:5 | `Open tall oven tower cabinet with a rear ventilation slot and a removable shelf, appliance bay empty, clean interior` |
| `img/lancamento/modulo-02.jpg` | 4:5 | `Kitchen island with a countertop cantilevering thirty-five centimetres with no visible bracket, seen from a low angle` |
| `img/lancamento/modulo-03.jpg` | 4:5 | `Open cutlery drawer with dividers machined directly into the panel, utensils perfectly aligned, seen from above at an angle` |
| `img/lancamento/modulo-04.jpg` | 4:5 | `Corner cabinet with a swing-out carousel mechanism pulled halfway open, revealing pots stored in the dead angle` |
| `img/lancamento/modulo-05.jpg` | 4:5 | `Acoustic slatted wall panel photographed at a sharp angle, mineral wool visible in the shadow gaps between the slats` |
| `img/lancamento/modulo-06.jpg` | 4:5 | `Recessed niche with an LED strip inside an aluminium profile, no visible cable, casting an even glow on a stone back panel` |

---

# SHOWROOM, REDE E OG (3 imagens)

| Arquivo | Formato | Prompt (+ `[STYLE]`) |
|---|---|---|
| `img/showroom/showroom-01.jpg` | 4:5 | `Central aisle of a large furniture showroom, complete kitchens and closets assembled on both sides, polished concrete floor, track lighting overhead, deep perspective, no people` |
| `img/lojista/loja-parceira.jpg` | 3:2 | `Street-level façade of a planned-furniture store at blue hour, a wide illuminated shop window showing an assembled kitchen inside, glass door, clean minimal signage band above with no readable text` |
| `img/og.jpg` | 1200×630 | `Wide hero-style kitchen with an island and vertical slatted panelling, generous empty space on the left third of the frame for a logo overlay` |

---

## 4. Depois de gerar

1. Salve com o **nome exato** da tabela (minúsculas, com hífen, sem acento).
2. Comprima em `.webp` ou `.jpg` a 80 % — mire em **menos de 300 KB** por imagem e **menos de 3 MB** por vídeo.
3. Solte na pasta `moratta/img/<subpasta>/`.
4. Para os vídeos do slider: troque a `<figure class="ph slide__media">` por um `<video autoplay muted loop playsinline poster="...">` — o CSS já trata `video` igual a `img`, inclusive o filtro P&B.
5. Recarregue. Todo bloco cinza que sumir é um asset a menos na lista.

## 5. Se quiser fugir do P&B depois

O grayscale está aplicado por CSS (`filter: grayscale(1)` em `.ph img, .ph video`). Para ver a versão colorida sem regerar nada, basta remover essa linha do `assets/css/style.css`. Gere colorido, teste dos dois jeitos, decida com o site na frente.
