# Fotos das demos CERNE e Morattá

Os manifestos aqui **não foram escritos à mão**: o `monta-manifesto.mjs` lê
os `PROMPTS-HIGGSFIELD.md` que vieram junto com as duas demos e converte
para o formato do gerador. Transcrever 65 prompts na mão seria a parte mais
fácil de errar do trabalho todo — e, se algum dia os prompts originais
mudarem, é só rodar o script de novo.

## Situação

| Demo | Imagens | Estado |
|---|---|---|
| **CERNE** | 18 de 18 | **completa** |
| **Morattá** | 23 de 47 | falta gerar 24 |

O saldo da API do Gemini acabou no meio do lote do Morattá. Falta:

```
img/hero/hero-01.jpg … hero-04.jpg          (4 · capas do slider da home)
img/cozinhas/compacta · fresta · praca ·
             sereno · detalhe-puxador       (5)
img/lancamento/onix-hero · onix-capa ·
               onix-detalhe · modulo-01…06  (9)
img/showroom/showroom-01.jpg                (1)
img/lojista/loja-parceira.jpg               (1)
img/video/institucional-capa · fabrica-capa ·
          onix-capa                          (3)
img/og.jpg                                   (1)
```

Enquanto não existirem, o site mostra o bloco cinza com o nome do arquivo
escrito no meio — o próprio placeholder é o checklist. Nada quebra.

## Como retomar

Recarregue em https://ai.studio/projects e rode:

```bash
cd ../../../imoveis/demos/_fotos            # onde mora o gerador e o .env
D=../../../moveis-planejados/demos/_fotos
node gerar-gemini.mjs $D/man-moratta.txt $D/png-moratta
```

O gerador **pula o que já existe**, então só as 24 que faltam são geradas.
Se o saldo acabar de novo, ele para no primeiro erro em vez de tentar três
vezes cada uma contra um endpoint morto.

Depois converta:

```bash
cd ../../../moveis-planejados/demos/_fotos
node converter.mjs man-moratta.txt png-moratta ../moratta
```

## Os vídeos

Nenhum dos oito existe, e o Gemini não gera vídeo:

- `cerne/assets/video/hero-loop.mp4`
- `moratta/img/hero/hero-01.mp4` … `hero-04.mp4`
- `moratta/img/video/institucional.mp4`, `fabrica.mp4`, `onix.mp4`

A CERNE não sofre com isso: o `<video>` do hero tem `poster=`, e o poster
já está gerado — é ele que se vê. No Morattá, cada bloco de vídeo mostra a
sua capa `*-capa.jpg`, que também é imagem estática.

Os prompts de vídeo estão nos `PROMPTS-HIGGSFIELD.md` originais, em
`pedidos de novas demos/`, e valem para o Higgsfield.

## Depois de completar

Regere as capas da vitrine — hoje a do Morattá é cortada na grade de
ambientes justamente porque o slider do hero depende dos quatro vídeos que
ainda não existem. Com o hero pronto, vale rever se ele não vira a capa.
