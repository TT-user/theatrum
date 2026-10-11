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
| **Morattá** | 47 de 47 | **completa**, 24 delas tiradas do acervo (abaixo) |

O saldo da API do Gemini acabou no meio do lote do Morattá, e em 11/10/2026
o Gemini ainda dava 429 e o Higgsfield estava com 0 crédito. Para a demo
não ficar com bloco cinza, as 24 que faltavam saíram do acervo das outras
demos de planejados (CERNE, Casa Nobre, Ateliê Verga, Cozinha Viva, Medida
Certa), recortadas e passadas para preto e branco pelo
`moratta-do-acervo.mjs`. A escolha foi pelo assunto (a foto do puxador cava
no lugar do puxador cava), e o texto das páginas foi ajustado ao que cada
foto mostra: módulos 02, 04 e 06 da Ônix, linhas Sereno e Compacta e os
`alt`.

Se um dia as fotos próprias forem geradas, o caminho abaixo escreve por cima
destas nos mesmos arquivos. Aí vale reler os textos que foram ajustados.

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

Os prompts de vídeo estão em `prompts-cerne.md` e `prompts-moratta.md`,
aqui nesta pasta, e valem para o Higgsfield.

## Capa da vitrine

A capa do Morattá no portfólio (`assets/img/vitrine/moratta-desktop.webp`)
foi refeita em 11/10/2026 a partir do hero, que até então era bloco cinza
e por isso a capa mostrava a grade de ambientes.
