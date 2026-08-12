# CERNE — Kit de prompts Higgsfield

**18 assets:** 1 vídeo hero + 1 poster + 16 imagens de grid + 1 fundo de CTA.
Os nomes de arquivo abaixo já são exatamente os que o `index.html` procura. Gere, renomeie e jogue na pasta — o site liga sozinho.

---

## 0 · Antes de começar

| Item | Valor |
|---|---|
| Modelo de imagem | **Higgsfield Soul** (fotorrealismo) |
| Modelo de vídeo | **Higgsfield DoP** (image-to-video com controle de câmera) |
| Proporção das imagens de grid | **4:3** |
| Proporção do hero / CTA | **16:9** |
| Qualidade | máxima disponível (upscale ligado) |
| Pessoas nas fotos | **nenhuma** — o site é sobre a madeira, não sobre gente |

**Regra de consistência:** gere primeiro a imagem `01-marcenaria-a`. Quando ela sair boa, salve como **Soul ID / referência de estilo** e aplique nas outras 16. Sem isso, cada foto vira de uma marcenaria diferente e o portfólio perde credibilidade.

---

## 1 · DNA visual — cole no fim de **toda** geração

```
Shot on Hasselblad H6D-100c, 50mm tilt-shift lens, f/5.6, architectural interior
photography for a design magazine. Low-key warm lighting: one dominant practical
source (late afternoon window light or a single warm linear LED), deep charcoal
shadows, no fill flash. Materials: quarter-sawn white oak and freijó with a
hand-rubbed matte lacquer, brushed brass hardware, honed stone. Muted desaturated
palette — warm browns, bone white, charcoal — with soft gold highlights on the
wood grain. Kodak Portra 400 color science, fine natural film grain, gentle
vignette. Immaculate joinery, perfectly aligned reveals and shadow gaps.
Empty of people. Editorial, restrained, expensive. 8K, ultra sharp.
```

## 2 · Negative prompt — cole em **toda** geração

```
people, human figure, hands, text, letters, watermark, logo, signage, clutter,
messy shelves, plastic sheen, glossy laminate, flat-pack furniture, IKEA look,
HDR halo, oversaturated colors, cool blue cast, fluorescent lighting, fisheye
distortion, warped lines, crooked verticals, misaligned panels, visible screws,
cartoon, illustration, 3D render look, CGI plastic, low resolution, blurry
```

---

## 3 · Vídeo do hero

### 3.1 · Frame base — gerar no Soul, 16:9

`hero-frame.png`

```
Wide interior of a dimly lit private library inside a 1950s São Paulo apartment.
Floor-to-ceiling quarter-sawn white oak bookshelves fill the entire frame, packed
with old cloth-bound books. A slim blackened-steel rolling ladder rests against
the shelves on the left. Tall casement window on the right, sheer curtain,
late afternoon sun raking across the wood at a low angle. Dust motes suspended
in the light shaft. Herringbone parquet floor. Everything two stops underexposed
except the sunlit strip on the shelves. Deep, quiet, cinematic.

+ [DNA VISUAL]
```

### 3.2 · Animar — Higgsfield DoP, image-to-video

Suba o `hero-frame.png` e configure:

| Campo | Valor |
|---|---|
| Motion / Camera | **Dolly In** — intensidade **Low** (o movimento tem que ser quase imperceptível) |
| Duração | **5 s** (gere 2–3 variações e escolha a mais estável) |
| Prompt de movimento | ver abaixo |

```
Extremely slow, steady dolly push-in on a tripod dolly. The camera advances only
a few centimeters over the whole shot. Dust motes drift lazily through the shaft
of afternoon light. The sunlit strip on the oak shelves creeps almost
imperceptibly. Nothing else moves. No cuts, no whip, no zoom, no parallax pop,
no camera shake. Locked, contemplative, cinematic. Seamless loop.
```

**Negative de movimento:**
```
fast motion, zoom punch, camera shake, handheld wobble, morphing geometry,
warping shelves, flickering light, people walking, objects appearing, text
```

> **Por quê tão lento:** o vídeo fica atrás de um título gigante e de um overlay escuro. Qualquer movimento perceptível rouba a leitura do headline e denuncia que é IA. Sutileza aqui é o que separa "premium" de "template".

### 3.3 · Poster (fallback e OG image)

Exporte o **primeiro frame** do vídeo final como `hero-poster.jpg` — assim não há salto visual enquanto o vídeo carrega. É esse arquivo que também vai pro compartilhamento no WhatsApp/LinkedIn.

---

## 4 · As 16 imagens do grid — 4:3 cada

Todas levam **[DNA VISUAL]** no fim e o **negative prompt** completo.

### Seção 01 · Marcenaria Arquitetônica

**`01-marcenaria-a.webp`** — *Casa Jardins*
```
Full-height quarter-sawn white oak wall paneling in a São Paulo townhouse hallway,
with a flush integrated passage portal — a hidden door whose grain runs
uninterrupted across the opening. Millimetric shadow gaps. Warm brass pull. A
single wall sconce grazing the panel to reveal the grain. Herringbone floor.
```

**`01-marcenaria-b.webp`** — *Higienópolis*
```
Custom library in a 1950s Higienópolis apartment: painted bone-white built-in
shelving from floor to ceiling around a marble fireplace, blackened-steel rolling
ladder on a brass rail. Books, a few ceramics, generous negative space. Tall
window on the right with soft afternoon light. Restrained, classical, lived-in.
```

**`01-marcenaria-c.webp`** — *Vila Nova Conceição*
```
Minimalist cantilevered oak millwork floating off a charcoal plaster wall in a
penthouse living room — a long horizontal volume with no visible support, warm
linear LED washing the wall beneath it. Concrete ceiling, floor-to-ceiling glass
on the left, São Paulo skyline blurred at dusk outside.
```

**`01-marcenaria-d.webp`** — *Alto de Pinheiros*
```
Slatted freijó wood feature wall in a modern Brazilian house, vertical battens
with recessed niches integrated into the rhythm. One niche holds a single ceramic
vessel. Warm grazing light from above. Polished concrete floor. Serene, tropical
modernist, Paulo Mendes da Rocha energy.
```

### Seção 02 · Estantes e Bibliotecas

**`02-estantes-a.webp`** — *Itaim Bibi*
```
Floor-to-ceiling oak bookshelf wall in a contemporary apartment, warm integrated
linear lighting under each shelf, styled with books and art objects at 60% fill.
Low charcoal sofa in the foreground, out of focus. Evening, lamps on.
```

**`02-estantes-b.webp`** — *Perdizes*
```
Long white floating shelves spanning an uninterrupted 4-meter wall with no visible
brackets, cantilevered from a hidden steel armature. Books and a few framed
photographs. Large window at the end of the run flooding the wall with soft
afternoon light. Precision, weightlessness.
```

**`02-estantes-c.webp`** — *Jardim Europa*
```
L-shaped corner library wrapping two walls of a large apartment, painted warm
bone white, brass rolling ladder, a deep window seat with a linen cushion in the
corner. Densely filled with books. Late afternoon, golden light pooling on the
floor. Warm, scholarly, inhabited.
```

**`02-estantes-d.webp`** — *Vila Madalena*
```
Built-in white media wall with a recessed television bay flanked by open oak
niches and closed cabinetry below, flush doors with push-to-open — no handles.
Warm cove lighting. Low-slung living room furniture partly in frame. Calm and
graphic.
```

### Seção 03 · Cozinhas

**`03-cozinhas-a.webp`** — *Jardim Paulista*
```
Custom kitchen in quarter-sawn white oak with a large honed Calacatta marble
island, brushed brass tapware, integrated appliances behind matching wood panels.
Warm pendant lights over the island. Morning light from a side window. Nothing on
the counters except a wooden bowl. Expensive restraint.
```

**`03-cozinhas-b.webp`** — *Brooklin*
```
Integrated kitchen with a slatted oak backsplash panel and the range hood
completely concealed inside the millwork above the cooktop. Dark stone counter,
warm under-cabinet lighting, tall cabinetry running flush to the ceiling.
Contemporary Brazilian apartment, evening.
```

**`03-cozinhas-c.webp`** — *Detalhe · puxador usinado*
```
Extreme close-up, macro detail: a solid oak drawer front with a machined
continuous finger-pull routed into the top edge, drawer pulled open 15cm showing
the dovetail joinery and a brass runner inside. Raking side light exaggerating
the grain and the crispness of the routed edge. Shallow depth of field.
```

**`03-cozinhas-d.webp`** — *Riviera de São Lourenço*
```
A hidden walk-in pantry revealed behind a floor-to-ceiling millwork panel that
has swung open — the panel's oak grain continues seamlessly with the closed wall
beside it. Warm light spilling out of the pantry into a darker kitchen. Coastal
house, sea light through a window at the edge of frame.
```

### Seção 04 · Arremates Técnicos

**`04-arremates-a.webp`** — *Split embutido · Pinheiros*
```
A wall-mounted air-conditioning split unit fully concealed inside a bespoke oak
enclosure, with a fine horizontal louvered airflow grille integrated so precisely
into the slatted panel rhythm that it reads as decoration, not equipment. Warm
grazing light. Living room corner, minimal.
```

**`04-arremates-b.webp`** — *Quadro oculto · Moema*
```
An electrical panel hidden behind a flush push-to-open millwork door in a
hallway, shown half-open to reveal the neat breaker panel inside while the closed
half shows a perfectly continuous wood grain across the wall. Precision reveal
lines, no handles, no hinges visible.
```

**`04-arremates-c.webp`** — *Banco de janela · Pacaembu*
```
A built-in window seat under a tall casement window, oak bench with a linen
cushion, drawers below, and a discreet perforated ventilation grille in the
front apron. Bright but soft daylight, sheer curtain, plants outside. Calm,
generous, architectural.
```

**`04-arremates-d.webp`** — *Prumo contínuo · Jardins*
```
A corridor where the baseboard, door casing and wall panel all resolve into a
single continuous plane with a 6mm shadow gap running the entire length. Raking
light down the corridor exaggerating the perfect alignment. Almost abstract:
a study in lines. Deep perspective, dark, disciplined.
```

---

## 5 · Fundo do CTA — 16:9

**`cta-bg.webp`**
```
Wide, very dark workshop interior at night — a Brazilian marcenaria after hours.
Stacked oak boards, a workbench with hand planes and clamps, sawdust catching a
single overhead work lamp. Everything else falls to black. Atmospheric, quiet,
handmade. Deep shadow occupies 70% of the frame.

+ [DNA VISUAL]
```

> No site esse fundo aparece a **30% de opacidade** debaixo de um radial escuro. Gere bem escuro de propósito; imagem clara aqui estoura o contraste do título.

---

## 6 · Exportação e conversão

Depois de baixar do Higgsfield, converta antes de subir. O peso importa: o hero é a primeira coisa que carrega.

**Imagens → WebP** (alvo: 150–250 KB cada)
```bash
# uma de cada vez
cwebp -q 82 -resize 1600 0 01-marcenaria-a.png -o 01-marcenaria-a.webp

# ou tudo de uma vez (ImageMagick)
magick mogrify -format webp -quality 82 -resize 1600x *.png
```

**Vídeo → MP4 otimizado** (alvo: até 3 MB)
```bash
ffmpeg -i hero-raw.mp4 -an -c:v libx264 -crf 26 -preset slow \
  -vf "scale=1920:-2,fps=25" -movflags +faststart -pix_fmt yuv420p \
  hero-loop.mp4

# poster a partir do primeiro frame
ffmpeg -i hero-loop.mp4 -vframes 1 -q:v 3 hero-poster.jpg
```

`-an` remove o áudio (obrigatório: vídeo com som não dá autoplay em nenhum navegador).
`+faststart` faz o vídeo começar a tocar antes de baixar inteiro.

**Estrutura final:**
```
cerne/
├─ index.html
└─ assets/
   ├─ video/
   │  └─ hero-loop.mp4
   └─ img/
      ├─ hero-poster.jpg
      ├─ cta-bg.webp
      ├─ 01-marcenaria-a.webp … 01-marcenaria-d.webp
      ├─ 02-estantes-a.webp    … 02-estantes-d.webp
      ├─ 03-cozinhas-a.webp    … 03-cozinhas-d.webp
      └─ 04-arremates-a.webp   … 04-arremates-d.webp
```

---

## 7 · Checklist antes de publicar

- [ ] Soul ID aplicado nas 17 imagens (mesma marcenaria, mesma luz, mesma câmera)
- [ ] Nenhuma pessoa, nenhum texto, nenhuma logo em nenhum asset
- [ ] Linhas verticais retas — descarte tudo que tiver painel torto ou junta desalinhada
- [ ] Hero: movimento quase imperceptível, sem morphing na estante
- [ ] Todos os WebP abaixo de 250 KB, `hero-loop.mp4` abaixo de 3 MB
- [ ] `hero-poster.jpg` é o primeiro frame exato do vídeo
- [ ] Abriu no celular e o hero não pesou
- [ ] Rodapé mantém o aviso de marca fictícia (evita confusão com marcenaria real)
