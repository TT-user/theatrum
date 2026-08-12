# Guia — imagens e vídeos no Higgsfield para os demos de planejados

Substitui o guia anterior de Gemini. A diferença central: agora os demos têm **vídeo de verdade**, não simulação por sequência de frames.

---

## Confirme isto ao abrir a plataforma

Não consegui verificar a interface atual antes de escrever. O fluxo abaixo vale de qualquer jeito, mas duas coisas mudam de nome entre versões e você confere em dois minutos:

1. **Como se chama a função de imagem para vídeo** (image-to-video, animate, ou similar) — é a peça central do método
2. **Quais presets de movimento de câmera existem** — eu descrevo o movimento em palavras; você escolhe o preset que corresponde

Se algum preset que eu cito não existir, use o mais próximo. O movimento importa, o nome não.

---

## O método, em uma frase

**Gere a imagem primeiro. Anime a imagem depois.**

Não peça vídeo direto do texto. Você perde o controle da paleta, e cada clipe sai de um universo visual diferente — o mesmo defeito de colcha de retalhos que a gente evitou nas fotos.

Fazendo imagem primeiro:

- Você aprova o quadro antes de gastar geração de vídeo, que é mais cara
- O vídeo herda exatamente a luz e a cor da foto
- O primeiro frame do vídeo vira o `poster` da tag `<video>`, então não existe piscada entre carregar a imagem e começar o movimento

As imagens você já tem prontas — os prompts do `prompts-demos.json` continuam valendo. Se preferir gerar tudo no Higgsfield, use os mesmos prompts: eles são agnósticos de ferramenta.

---

## O que cada demo precisa agora

A lista mudou. Saíram os cinco frames de vídeo, entraram três clipes.

```
demos-planejados/<slug>/
├── index.html
└── img/
    ├── hero.jpg              1920×1080   ← também é o poster do vídeo
    ├── hero-mobile.jpg       1080×1350
    ├── og.jpg                1200×630
    ├── dono.jpg              1000×1250
    ├── showroom-01.jpg       1600×900    ← primeiro frame do walkthrough
    ├── showroom-02.jpg       1600×900
    ├── projeto-01..06.jpg    1200×900
    ├── detalhe-01/02.jpg     1000×1000
    ├── processo-01/02.jpg    1200×800
    └── video/
        ├── hero.mp4          1920×1080 · 6s · loop  · ≤ 2,5 MB
        ├── hero.webm         mesma coisa em VP9
        ├── showroom.mp4      1920×1080 · 12s        · ≤ 6 MB
        ├── showroom.webm
        ├── showroom-poster.jpg
        └── detalhe.mp4       1080×1080 · 4s · loop  · ≤ 1,5 MB  (opcional)
```

**Três clipes por demo, doze no total.** Menos do que parecia, porque vídeo bom é curto.

---

## Os três clipes e para que serve cada um

### 1. `hero.mp4` — respiração, não passeio

Seis segundos, movimento quase imperceptível, em loop. A pessoa nem registra que é vídeo: registra que a página está viva.

**Movimento:** push-in lento, uns 8% de aproximação no total. Nada de pan, nada de órbita.
**Ponto de partida:** `hero.jpg`

Por que tão discreto: o hero tem o título por cima. Movimento forte compete com a leitura e derruba conversão. O trabalho do vídeo aqui é sensação de qualidade, não espetáculo.

### 2. `showroom.mp4` — o passeio de verdade

Doze segundos, câmera avançando pelo espaço. Este é o que substitui o crossfade de cinco frames e é o mais convincente dos três: mostra que a loja existe, tem tamanho e tem acabamento.

**Movimento:** dolly para frente, contínuo, velocidade de caminhada tranquila. Pode terminar com uma leve inclinação para cima.
**Ponto de partida:** `showroom-01.jpg`
**Este não roda sozinho.** Fica no meio da página com um play — quem clica está interessado, e aí vale carregar 6 MB.

### 3. `detalhe.mp4` — opcional, e forte

Quatro segundos, quadrado, loop: uma gaveta abrindo e fechando com amortecimento, ou uma porta de armário se fechando sozinha.

É o clipe que mais impressiona em produto de marcenaria, porque mostra o que a foto não consegue: o movimento suave da ferragem boa. Se for gerar só um extra, gere este.

**Ponto de partida:** `detalhe-02.jpg`

---

## Prompts de vídeo por demo

Todos partem de uma imagem. No campo de prompt, descreva **só o movimento** — a aparência já está definida pela imagem de origem. Prompt de aparência aqui atrapalha, porque briga com o que a imagem já mostra.

Sufixo para colar em todos:

```
Photorealistic, natural camera movement, no cuts, no transitions,
no text overlays, no people appearing, consistent lighting throughout.
```

### Ateliê Verga — marcenaria artesanal

| Clipe | Prompt de movimento |
|---|---|
| `hero` | `Extremely slow, subtle push-in toward the wooden kitchen island. Dust particles drifting gently in the sunbeam. Everything else perfectly still.` |
| `showroom` | `Camera dollies slowly forward down the center of the workshop, passing stacked hardwood boards on the left and a workbench on the right, ending with a gentle tilt up toward the high windows.` |
| `detalhe` | `A solid wood drawer slides open smoothly on its own, pauses, then closes slowly with a soft-close motion. Camera perfectly static, macro framing.` |

### Casa Nobre — planejados alto padrão

| Clipe | Prompt de movimento |
|---|---|
| `hero` | `Extremely slow push-in toward the kitchen island, while the city lights beyond the window subtly shift in focus. Everything else still.` |
| `showroom` | `Camera dollies slowly forward through the showroom aisle, passing complete kitchen displays on both sides, ending facing the illuminated glass storefront at the far end.` |
| `detalhe` | `A drawer with a soft-close mechanism opens smoothly and closes slowly, revealing the interior finish. Camera static, macro framing.` |

### Medida Certa — apartamento compacto

| Clipe | Prompt de movimento |
|---|---|
| `hero` | `Very slow push-in toward the compact kitchen counter, sheer curtains moving almost imperceptibly in a light breeze. Bright and calm.` |
| `showroom` | `Camera moves slowly forward through the small store, passing the kitchen display on the left and the wardrobe display on the right, ending at the consultation desk.` |
| `detalhe` | `A white cabinet door closes slowly and silently with a soft-close hinge. Camera static, macro framing.` |

### Cozinha Viva — só cozinhas

| Clipe | Prompt de movimento |
|---|---|
| `hero` | `Extremely slow push-in toward the counter with herbs and cutting board, steam rising gently from a kettle in the background. Warm and quiet.` |
| `showroom` | `Camera dollies slowly forward through the atelier toward the working kitchen, passing the material samples wall, ending facing the stove.` |
| `detalhe` | `A kitchen drawer with a wooden cutlery organizer slides open smoothly, revealing neatly arranged utensils, then closes. Camera static, overhead macro framing.` |

---

## O que dá errado em vídeo gerado, e como evitar

| Problema | O que fazer |
|---|---|
| Móvel "derretendo" ou porta que muda de formato | Encurte a duração. Quatro segundos com movimento mínimo saem melhor que dez com movimento grande |
| Objeto aparecendo do nada no meio do clipe | Acrescente `nothing enters or leaves the frame` |
| Luz mudando de cor durante o clipe | `consistent lighting throughout, no lighting changes` |
| Pessoa surgindo | `no people at any point` |
| Corte ou transição inventada | `single continuous shot, no cuts` |
| Loop com salto visível | Escolha movimento simétrico ou trate no ffmpeg (adiante) |

Regra prática: **gere três versões do hero e escolha a melhor.** Vídeo tem muito mais variação entre tentativas do que imagem.

---

## Preparar os arquivos para a web

Vídeo direto da plataforma vem pesado demais para landing page. Passe tudo pelo ffmpeg.

**Instale:** `winget install ffmpeg` no Windows, ou baixe em ffmpeg.org

### Hero — leve ao máximo

```bash
ffmpeg -i original.mp4 -an -vf "scale=1920:-2,fps=24" ^
  -c:v libx264 -crf 28 -preset slow -profile:v main ^
  -movflags +faststart -pix_fmt yuv420p hero.mp4

ffmpeg -i original.mp4 -an -vf "scale=1920:-2,fps=24" ^
  -c:v libvpx-vp9 -crf 36 -b:v 0 hero.webm
```

`-an` remove o áudio: hero com som é motivo de fechar a aba, e o navegador bloqueia autoplay com áudio de qualquer forma.
`-movflags +faststart` faz o vídeo começar antes de baixar inteiro.

### Showroom — pode ser um pouco maior

```bash
ffmpeg -i original.mp4 -an -vf "scale=1920:-2,fps=30" ^
  -c:v libx264 -crf 24 -preset slow -movflags +faststart ^
  -pix_fmt yuv420p showroom.mp4

ffmpeg -i showroom.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 3 showroom-poster.jpg
```

### Loop sem salto

Se o hero pular ao reiniciar, faça ida e volta:

```bash
ffmpeg -i hero.mp4 -filter_complex "[0]reverse[r];[0][r]concat=n=2:v=1[out]" ^
  -map "[out]" -an -c:v libx264 -crf 28 -movflags +faststart hero-loop.mp4
```

Dobra a duração e o loop fica perfeito, porque o fim é igual ao começo.

### Confira o peso

```bash
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 hero.mp4
```

Alvos: hero até 2,5 MB, showroom até 6 MB. Acima disso, suba o `-crf` (número maior = arquivo menor).

---

## Aplicar nos demos

### Hero com vídeo

```html
<section class="hero">
  <div class="hero-media">
    <video autoplay muted loop playsinline preload="metadata"
           poster="img/hero.jpg" aria-hidden="true">
      <source src="img/video/hero.webm" type="video/webm">
      <source src="img/video/hero.mp4"  type="video/mp4">
    </video>
  </div>
  <div class="hero-shade"></div>
  <div class="wrap hero-conteudo">
    <!-- título, subtítulo, CTA -->
  </div>
</section>
```

```css
.hero{ position:relative; overflow:hidden; min-height:88vh; display:flex; align-items:center }
.hero-media{ position:absolute; inset:0; z-index:0 }
.hero-media video{ width:100%; height:100%; object-fit:cover; display:block }
.hero-shade{
  position:absolute; inset:0; z-index:1;
  background:linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.25) 100%);
}
.hero-conteudo{ position:relative; z-index:2 }

/* celular: não carrega vídeo, usa a foto vertical com zoom lento */
@media (max-width: 820px){
  .hero-media video{ display:none }
  .hero-media{
    background:url("img/hero-mobile.jpg") center/cover no-repeat;
    animation:kenburns 22s ease-in-out infinite alternate;
  }
}
@keyframes kenburns{ from{transform:scale(1)} to{transform:scale(1.1)} }

/* quem pediu menos movimento no sistema vê só a foto */
@media (prefers-reduced-motion: reduce){
  .hero-media video{ display:none }
  .hero-media{ background:url("img/hero.jpg") center/cover no-repeat; animation:none }
}
```

O bloco do celular é o mais importante da página inteira. A maior parte do seu tráfego é 4G — carregar 2,5 MB de vídeo ali custa segundos de espera e derruba mais conversão do que o vídeo agrega.

### Seção do showroom com vídeo sob demanda

```html
<section id="showroom">
  <div class="wrap">
    <span class="eyebrow">o showroom</span>
    <h2>Vê o espaço por dentro.</h2>
    <div class="player">
      <video controls preload="none" poster="img/video/showroom-poster.jpg">
        <source src="img/video/showroom.webm" type="video/webm">
        <source src="img/video/showroom.mp4"  type="video/mp4">
      </video>
    </div>
  </div>
</section>
```

```css
.player{ position:relative; aspect-ratio:16/9; border-radius:16px; overflow:hidden; margin-top:28px }
.player video{ width:100%; height:100%; object-fit:cover; display:block; background:#000 }
```

`preload="none"` é o detalhe que faz esse vídeo custar zero para quem não clica. Ele só baixa quando alguém aperta play — e quem aperta play já demonstrou interesse.

### Detalhe em loop, dentro da seção de acabamento

```html
<video autoplay muted loop playsinline preload="none"
       poster="img/detalhe-02.jpg" class="detalhe-loop" aria-hidden="true">
  <source src="img/video/detalhe.mp4" type="video/mp4">
</video>
```

```css
.detalhe-loop{ width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:12px; display:block }
@media (prefers-reduced-motion: reduce){ .detalhe-loop{ display:none } }
```

---

## O que muda nos quatro briefings

Nos arquivos `01-atelie-verga.md` até `04-cozinha-viva.md`, a seção que hoje diz **"seção de vídeo (crossfade dos 5 frames)"** passa a ser vídeo real. Substitua a linha por:

> Vídeo do walkthrough, `img/video/showroom.mp4`, com poster e `preload="none"`. Player com controles, não autoplay.

E na lista de imagens, **apague `video/frame-01` a `frame-05`**. Não são mais necessários — o `showroom-01.jpg` sozinho vira o ponto de partida do clipe.

O resto de cada briefing continua igual: copy, paleta, assinatura visual e prompts de foto seguem valendo.

---

## Ordem de trabalho

1. Gere ou reaproveite as **imagens** de um demo — hero primeiro, sempre
2. Aprove o `hero.jpg` e o `showroom-01.jpg`; são as duas bases dos vídeos
3. No Higgsfield, **imagem para vídeo** nos três clipes, com os prompts de movimento da tabela
4. Gere **três versões do hero** e fique com a melhor
5. Passe tudo pelo ffmpeg
6. Monte o HTML com os blocos acima
7. Teste no celular, em 4G real, não no wi-fi de casa

O passo 7 é o que mais pega. Página com vídeo abre linda no desktop com fibra e leva oito segundos no celular de quem está na loja — que é exatamente onde o seu prospect vai abrir para mostrar ao sócio.

---

## Checklist

- [ ] Hero em loop, sem áudio, com `poster` definido
- [ ] Celular não carrega o vídeo do hero
- [ ] `prefers-reduced-motion` respeitado nos três clipes
- [ ] Showroom com `preload="none"` e controles
- [ ] Hero ≤ 2,5 MB · showroom ≤ 6 MB
- [ ] `+faststart` aplicado em todos os mp4
- [ ] Loop sem salto visível
- [ ] Nenhuma pessoa, texto ou logo inventado dentro dos clipes
- [ ] Rodapé com o aviso de projeto demonstrativo
- [ ] Testado em 4G, não só no wi-fi
