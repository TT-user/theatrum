# Fotos dos demos de imóveis

Os quatro sites estão prontos e funcionando. O que falta são as fotos:
**57 imagens e 5 vídeos**, que não couberam nos créditos disponíveis no
dia em que os demos foram construídos.

Enquanto os arquivos não existem, cada `<figure class="foto">` mostra um
placeholder listrado com o nome e o tamanho do arquivo que falta. Não é
erro: o `script` no `<head>` de cada página escuta o `error` da imagem e
marca `.sem-foto`. **Basta salvar o `.jpg` com o nome certo dentro de
`img/` que o placeholder some sozinho** — nenhuma linha de HTML muda.

## O que já existe

| Demo | Prontas |
|---|---|
| `vista-imoveis` | `hero.jpg`, `hero-mobile.jpg`, `og.jpg` |
| `vertice` | `hero.jpg`, `hero-mobile.jpg`, `og.jpg` |
| `bruno-tavares` | nenhuma |
| `reserva-aurora` | nenhuma |

## Conta dos créditos

| Item | Quantidade | Modelo | Créditos |
|---|---|---|---|
| Imagens | 57 | Nano Banana Pro (2 cada) | 114 |
| Vídeos do hero do Aurora | 5 | Kling 3.0 Turbo 3 s 720p (4,5 cada) | 22,5 |
| **Total** | | | **≈ 137** |

## Como gerar

Os manifestos deste diretório usam o mesmo formato do `gerar.sh` que
produziu as fotos dos demos de planejados:

```bash
# imagens — nome|aspecto|usa_ref(s/n)|prompt
bash gerar.sh man-bruno.txt   png-bruno   ""
bash gerar.sh man-vista.txt   png-vista   ""
bash gerar.sh man-aurora.txt  png-aurora  ""
bash gerar.sh man-vertice.txt png-vertice ""

# vídeos — pasta_png|saida.mp4|imagem_de_partida.jpg|prompt
bash gerar-video.sh man-video-aurora.txt
```

Depois converta os PNG de 2k para os JPG que os sites consomem, com o
teto de peso de sempre: **hero até 250 KB, o resto até 150 KB**. O
`converter.js` faz isso descendo a qualidade em passos até caber.

Os vídeos entram em `reserva-aurora/img/video/` com os nomes `hero-1.mp4`
a `hero-5.mp4`. O `data-srcs` do `<div class="hero-filme">` já aponta
para eles; o filme liga assim que o primeiro arquivo carregar de verdade.

## Cuidado com as capas da vitrine

As capas em `assets/img/vitrine/*.webp` são prints destes demos. Depois
de colocar as fotos, **gere os prints de novo**, senão a home continua
mostrando o placeholder listrado enquanto o site já está fotografado.

Nos demos `bruno-tavares` e `reserva-aurora` a capa foi cortada na seção
do sistema, e não no hero, justamente para não estampar placeholder na
home. Com as fotos no lugar, vale rever se o hero não vira a melhor capa.
