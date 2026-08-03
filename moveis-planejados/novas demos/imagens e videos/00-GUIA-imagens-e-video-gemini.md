# Guia — gerar imagens e frames de vídeo no Gemini

Método para produzir todo o material visual dos quatro sites demonstrativos de móveis planejados.
Vale para qualquer projeto futuro: muda o assunto, o método continua.

---

## Antes de tudo: o aviso que protege você

Estes quatro sites são **projetos demonstrativos**, com marcas e pessoas fictícias.
Ao mostrar para um cliente, diga isso. O rodapé de cada demo deve trazer:

> Projeto demonstrativo. Marca, textos, imagens e pessoas são fictícios, criados para demonstrar padrão de entrega.

Apresentar demo como cliente real quebra na hora em que o prospect pergunta "posso falar com esse cliente?". Demo assumido como demo convence do mesmo jeito — o que ele avalia é o acabamento.

Imagem de pessoa gerada por IA nunca deve aparecer como cliente ou depoimento real.

---

## Estrutura de pastas

Uma pasta por demo, sempre com os mesmos nomes de arquivo. Assim o HTML de um serve de base para o próximo.

```
demos-planejados/
├── atelie-verga/
│   ├── index.html
│   └── img/
│       ├── hero.jpg              1920×1080
│       ├── hero-mobile.jpg       1080×1350
│       ├── og.jpg                1200×630
│       ├── dono.jpg              1000×1250
│       ├── showroom-01.jpg       1600×900
│       ├── showroom-02.jpg       1600×900
│       ├── projeto-01.jpg        1200×900
│       ├── projeto-02.jpg        1200×900
│       ├── projeto-03.jpg        1200×900
│       ├── projeto-04.jpg        1200×900
│       ├── projeto-05.jpg        1200×900
│       ├── projeto-06.jpg        1200×900
│       ├── detalhe-01.jpg        1000×1000
│       ├── detalhe-02.jpg        1000×1000
│       ├── processo-01.jpg       1200×800
│       ├── processo-02.jpg       1200×800
│       └── video/
│           ├── frame-01.jpg      1920×1080
│           ├── frame-02.jpg      1920×1080
│           ├── frame-03.jpg      1920×1080
│           ├── frame-04.jpg      1920×1080
│           └── frame-05.jpg      1920×1080
│
├── casa-nobre/      (mesma estrutura)
├── medida-certa/    (mesma estrutura)
└── cozinha-viva/    (mesma estrutura)
```

---

## Tamanhos por seção e o porquê de cada um

| Arquivo | Tamanho | Onde entra | Cuidado |
|---|---|---|---|
| `hero.jpg` | **1920×1080** (16:9) | Fundo da primeira dobra, desktop | O texto fica por cima. O **terço central precisa ser escuro e sem detalhe**, ou o título some |
| `hero-mobile.jpg` | **1080×1350** (4:5) | Fundo do hero no celular | Vertical de verdade. Recortar 16:9 no celular corta o assunto |
| `og.jpg` | **1200×630** | Preview ao compartilhar o link | Assunto no centro, 100px de margem |
| `dono.jpg` | **1000×1250** (4:5) | Seção "quem faz" | Retrato, olhar na câmera, oficina desfocada ao fundo |
| `showroom-01/02.jpg` | **1600×900** | Localização e estrutura | Prova que existe lugar físico. É o que gera confiança em compra alta |
| `projeto-01..06.jpg` | **1200×900** (4:3) | Grade de portfólio | Todas na mesma proporção, senão a grade quebra |
| `detalhe-01/02.jpg` | **1000×1000** (1:1) | Acabamento, ferragem, textura | Close. Vende qualidade sem escrever "qualidade" |
| `processo-01/02.jpg` | **1200×800** (3:2) | Como funciona, bastidor | Medição, projeto 3D na tela, montagem |
| `video/frame-XX.jpg` | **1920×1080** | Sequência que simula vídeo | Mesma cena, câmera avançando |

**Peso.** Depois de gerar, comprima em squoosh.app ou tinypng.com. Hero abaixo de 250 KB, demais abaixo de 150 KB. Converta para **WebP** quando der e use `loading="lazy"` em tudo abaixo da primeira dobra.

Site de planejados morre de peso de imagem — e página lenta, em obra de R$ 30 mil, passa impressão de amadorismo.

---

## Como gerar no Gemini

### A fórmula do prompt

Todo prompt bom de interior tem seis blocos, nesta ordem:

```
[TIPO DE FOTO] + [ASSUNTO E MATERIAIS] + [AMBIENTE E CONTEXTO]
+ [LUZ] + [CÂMERA E LENTE] + [PROPORÇÃO E RESTRIÇÕES]
```

Aplicado:

```
Professional interior photography of a custom-built kitchen in warm
oak veneer with matte black hardware and a white quartz countertop,
in a contemporary Brazilian apartment. Soft natural light from a
large window on the left, late afternoon, warm tones. Shot on a
35mm lens at f/4, eye level, straight-on composition, shallow depth
of field in the background. 16:9 aspect ratio, photorealistic,
no text, no watermark, no people.
```

### Escreva em inglês

Modelos de imagem foram treinados majoritariamente em inglês. Português funciona, mas erra mais material e composição. Os prompts dos quatro briefings já estão em inglês.

### Restrições que evitam retrabalho

Cole sempre no fim:

```
no text, no letters, no logos, no watermark, no distorted furniture,
realistic proportions
```

Se houver pessoa:

```
natural candid expression, hands fully visible and correctly formed
```

Mão malformada é o erro mais comum e o mais fácil de notar.

### Consistência entre as imagens

O maior risco é o site virar colcha de retalhos: cada foto de uma casa, com paleta e luz diferentes. Três formas de evitar:

1. **Bloco de estilo fixo.** Cada briefing tem um trecho chamado *assinatura visual*. Cole em **todos** os prompts daquele demo, sem mudar uma palavra.
2. **Imagem de referência.** Gere a melhor primeiro, anexe no chat e peça: *"same house, same lighting, same color palette, now show the bedroom wardrobe"*.
3. **Uma conversa por demo.** Não misture os quatro no mesmo chat.

### Quando sair errado

| Problema | Acrescente ao prompt |
|---|---|
| Móvel com proporção estranha | `architecturally accurate, realistic cabinet proportions, straight lines` |
| Cara de render de videogame | `photorealistic, real photograph, subtle imperfections, natural materials` |
| Escuro ou estourado demais | `balanced exposure, soft shadows, no blown highlights` |
| Ambiente genérico | Acrescente contexto local: `Brazilian apartment, tropical plant, ceramic tile floor` |
| Texto inventado nas paredes | `no text, no signage, no lettering` — repita se persistir |

---

## A seção de vídeo do interior da loja

### Escolha técnica antes de gerar qualquer coisa

O Gemini gera **imagem**, não vídeo. Para dar sensação de vídeo existem três caminhos:

**Opção A — imagem única com movimento em CSS. É a que eu usaria no hero.**
Uma foto do showroom com zoom lento e contínuo. Parece vídeo, pesa 200 KB em vez de 8 MB, carrega instantâneo e não tem briga com autoplay.

```css
.hero-video{ position:absolute; inset:0; overflow:hidden; }
.hero-video img{
  width:100%; height:100%; object-fit:cover;
  animation: kenburns 24s ease-in-out infinite alternate;
}
@keyframes kenburns{
  from{ transform:scale(1)    translate(0,0); }
  to  { transform:scale(1.12) translate(-2%,-1.5%); }
}
@media (prefers-reduced-motion:reduce){ .hero-video img{ animation:none } }
```

**Opção B — sequência de frames em crossfade. Use na seção do showroom.**
Cinco imagens da mesma cena, câmera avançando, trocando a cada 5 segundos. Dá a sensação de um passeio pela loja. É para isso que servem os `video/frame-01..05.jpg`.

```css
.slideshow{ position:relative; aspect-ratio:16/9; overflow:hidden; border-radius:16px }
.slideshow img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; opacity:0; animation: passeio 25s infinite;
}
.slideshow img:nth-child(1){ animation-delay:0s }
.slideshow img:nth-child(2){ animation-delay:5s }
.slideshow img:nth-child(3){ animation-delay:10s }
.slideshow img:nth-child(4){ animation-delay:15s }
.slideshow img:nth-child(5){ animation-delay:20s }
@keyframes passeio{
  0%{opacity:0} 4%{opacity:1} 20%{opacity:1} 24%{opacity:0} 100%{opacity:0}
}
@media (prefers-reduced-motion:reduce){
  .slideshow img{ animation:none } .slideshow img:first-child{ opacity:1 }
}
```

**Opção C — vídeo de verdade.**
Não é o Gemini, é o **Veo** (Google AI Studio ou app Gemini nos planos que incluem). Clipes de 5 a 8 segundos, emendados. Só vale para a seção do meio da página. Nunca no hero: vídeo pesado na primeira dobra derruba conversão.

> Recomendação: **A no hero, B na seção do showroom.** Duas intensidades de movimento, sem carregar um megabyte de vídeo.

### Os cinco frames do passeio

Gere na mesma conversa, um após o outro, **anexando o frame anterior como referência**. Cole a *assinatura visual* do demo antes de cada prompt.

**frame-01 — entrada**
```
Professional interior photography, wide shot from the entrance of a
custom furniture showroom. Full kitchen displays on both sides,
polished concrete floor, warm track lighting overhead, large glass
storefront behind the camera letting in daylight. Empty of people.
Shot on 24mm lens, eye level, symmetrical composition.
16:9, photorealistic, no text, no logos, no watermark.
```

**frame-02 — avançando pelo corredor**
```
Same showroom, same lighting and palette as the previous image.
Camera has moved forward six steps down the central aisle. A wooden
kitchen island in the foreground on the right, a wardrobe display on
the left. 35mm lens, eye level, slight depth of field.
16:9, photorealistic, no text, no people.
```

**frame-03 — vitrine de cozinha**
```
Same showroom, same lighting. Camera facing a complete kitchen
display: cabinets, countertop, integrated appliances, undercabinet
lighting on. Styled with a bowl of fruit and a ceramic pitcher.
35mm lens, straight-on composition.
16:9, photorealistic, no text, no people.
```

**frame-04 — mesa de atendimento**
```
Same showroom, same lighting. Camera facing a consultation corner:
wooden table with two chairs, a large monitor showing an abstract 3D
furniture render, material samples and finish swatches on the table.
35mm lens, slightly elevated angle.
16:9, photorealistic, no readable text on the screen, no people.
```

**frame-05 — fundo do showroom**
```
Same showroom, same lighting. Camera at the back of the space looking
toward the entrance, the glass storefront glowing with afternoon
daylight in the distance. Displays on both sides in soft focus.
24mm lens, eye level.
16:9, photorealistic, no text, no logos, no people.
```

### Se quiser pessoa em cena

Troque `no people` por:

```
one person seen from behind, out of focus, walking away from the
camera, natural posture
```

Pessoa de costas e desfocada elimina o risco de rosto ou mão malformados e ainda dá escala ao ambiente.

---

## Frames alternativos para o hero com movimento

Gere estes três em 1920×1080 e escolha o melhor para o Ken Burns:

**hero-a — cozinha em luz de fim de tarde**
```
Professional interior photography of a modern custom kitchen, warm
wood cabinetry and stone countertop, golden late afternoon light
entering from a window on the right, long soft shadows. Wide
composition with generous empty space in the center-left for text
overlay, slightly darker in that area. 24mm lens, eye level.
16:9, photorealistic, cinematic, no text, no people, no logos.
```

**hero-b — oficina de marcenaria**
```
Professional photography inside a woodworking workshop, sawdust
suspended in a shaft of daylight, stacked oak boards, hand tools on
a workbench, warm tones, dark background. Center of the frame kept
dark and uncluttered for text overlay. 35mm lens, shallow depth of
field. 16:9, photorealistic, cinematic, no text, no people.
```

**hero-c — showroom à noite, vitrine iluminada**
```
Professional architectural photography of a custom furniture showroom
seen from inside at dusk, warm interior lighting, glass storefront
reflecting the blue evening sky, polished floor. Composition with a
dark uncluttered area in the middle for a headline.
24mm lens, eye level. 16:9, photorealistic, no text, no people.
```

---

## Checklist antes de usar as imagens

- [ ] Toda a grade de portfólio na mesma proporção
- [ ] Paleta e luz coerentes entre as fotos do mesmo demo
- [ ] Terço central do hero escuro o bastante para o título aparecer
- [ ] Nenhum texto ou logo inventado dentro das imagens
- [ ] Mãos e rostos corretos, se houver pessoa
- [ ] Comprimido: hero < 250 KB, demais < 150 KB
- [ ] `loading="lazy"` abaixo da primeira dobra
- [ ] `alt` descritivo em cada imagem
- [ ] Aviso de projeto demonstrativo no rodapé
- [ ] `prefers-reduced-motion` respeitado nas animações

---

## Ordem de trabalho

1. Abra **uma conversa dedicada** no Gemini para o demo
2. Gere o `hero.jpg` primeiro — ele define a paleta de todo o resto
3. Use o hero como referência anexada para showroom, projetos e detalhes
4. Gere os cinco frames de vídeo em sequência, encadeados
5. Comprima tudo
6. Só então monte o HTML

Gerar imagem depois do HTML pronto sempre dá retrabalho: você acaba adaptando a página à foto que saiu, em vez do contrário.
