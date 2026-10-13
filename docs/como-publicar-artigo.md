# Como publicar um artigo no blog

O blog fica em usetheatrum.com.br/blog. Cada artigo é um arquivo de texto
dentro de `content/blog/`. Um comando transforma esses arquivos nas páginas do
site. Depois é só conferir e publicar.

Você só precisa preparar o computador uma vez (passo 0). Depois disso, cada
artigo novo leva os passos 1 a 4.

---

## 0. Preparar o computador (só na primeira vez)

1. Instale o Node.js (versão 20 ou mais nova) em nodejs.org, se ainda não tiver.
2. Abra o terminal na pasta do site (`Desktop/theatrum`) e rode:

   ```
   npm install
   ```

   Isso baixa as ferramentas do blog. Leva um minuto.

O Google Chrome também precisa estar instalado: é ele que desenha a capa
automática do artigo.

---

## 1. Criar o arquivo do artigo

Crie um arquivo novo em `content/blog/`, com um nome curto, sem acento e com
hífen no lugar de espaço. Exemplo: `content/blog/quanto-custa-um-site.md`.

O arquivo começa com um bloco de informações entre duas linhas de `---`. Depois
vem o texto do artigo. Copie este modelo:

```
---
title: "Quanto custa um site que traz cliente"
description: "O que entra no preço de um site feito para vender, o que é custo de verdade e o que é enfeite."
slug: quanto-custa-um-site
date: 2026-10-20
updated: 2026-10-20
category: Decisão
tags:
  - preço de site
  - landing page
cta: planos
---

Primeiro parágrafo do artigo.

## Primeiro subtítulo

Texto...
```

O que cada campo quer dizer:

| Campo | O que pôr | Obrigatório |
|---|---|---|
| `title` | O título do artigo. Até uns 60 caracteres, senão o Google corta. | sim |
| `description` | O resumo que aparece no Google e na lista do blog. **Até 155 caracteres.** | sim |
| `slug` | O final do endereço: `usetheatrum.com.br/blog/quanto-custa-um-site/`. Só minúsculas, números e hífen. **Não mude depois de publicado**, senão o link antigo quebra. | não (sem ele, vale o nome do arquivo) |
| `date` | Dia em que o artigo foi publicado, no formato `2026-10-20`. | sim |
| `updated` | Dia da última revisão. Mudou o texto, atualize esta data. | não (sem ele, vale o `date`) |
| `category` | Uma destas, escrita igualzinho: `Dor do negócio`, `Decisão` ou `Nicho`. | sim |
| `tags` | Assuntos do artigo, um por linha, começando com `- `. | não |
| `cover` | Imagem de capa, se você tiver uma (veja o passo 2). | não |
| `coverAlt` | Descrição da capa para quem não enxerga a imagem. | não |
| `cta` | O convite do artigo: `diagnostico`, `planos` ou o endereço de uma página de nicho que esteja no ar (hoje não há nenhuma; página desativada o build recusa). | não (sem ele, vale `diagnostico`) |
| `ctaTitulo` | Frase do convite, adaptada ao assunto. Ex.: "Quer saber quanto custaria o seu?" | não |
| `ctaTexto` | Uma ou duas frases embaixo do título do convite. | não |
| `ctaBotao` | Texto do botão. | não |
| `readingTime` | Minutos de leitura. Se não puser, o build calcula. | não |
| `destaque` | `true` para este artigo ficar no topo do /blog. Sem nenhum marcado, o destaque é o mais recente. | não |
| `draft` | `true` para guardar o artigo como rascunho: ele não vai para o site. | não |

### Escrevendo o texto

O texto é Markdown, o mesmo jeito de escrever do WhatsApp com alguns extras:

- `## Subtítulo` cria um subtítulo. Eles montam o índice do artigo. **Use pelo
  menos 3**: o convite do meio do artigo entra logo antes do terceiro.
- Não use `# Título` (com um `#` só) no texto: o título já vem do `title`.
- `**negrito**`, `*itálico*`.
- Lista: cada linha começando com `- ` ou `1. `.
- Link: `[texto do link](https://endereço)`. Para outro artigo do blog:
  `[texto](/blog/slug-do-outro-artigo/)`.

Regras da marca que valem aqui também: frases curtas, falando com "você", sem
travessão (—), sem número que não diga de onde veio e sem depoimento ou
estatística inventada.

---

## 2. Imagens (opcional)

**Capa.** Se você não puser `cover`, o build desenha uma capa sozinho, com a
cara da Theatrum, a categoria e o título. Se quiser uma foto sua:

1. Salve a imagem em `content/blog/img/` (jpg, png ou webp, de preferência com
   1200 x 630 ou maior).
2. No topo do artigo: `cover: img/minha-foto.jpg` e
   `coverAlt: "O que a foto mostra"`.

O build corta para 1200 x 630 e converte para WebP sozinho.

**Imagem no meio do texto.** Salve em `content/blog/img/` e escreva, numa linha
sozinha:

```
![O que a imagem mostra, em uma frase](img/nome-da-imagem.jpg "Legenda opcional")
```

O texto entre colchetes é obrigatório na prática: é o que o Google e quem usa
leitor de tela "veem". O build converte para WebP e faz a imagem carregar só
quando a pessoa chega nela.

---

## 3. Gerar e conferir

No terminal, na pasta do site:

```
npm run build:blog
```

- Se aparecer **"Nada foi gerado"**, a lista embaixo diz o que corrigir (campo
  faltando, data no formato errado, descrição longa demais...). O blog no ar
  não é afetado. Corrija e rode de novo.
- Se aparecer **"Avisos"**, o blog foi gerado, mas vale olhar (título longo,
  imagem sem descrição...).

Para ver no navegador antes de publicar:

```
npm run ver:blog
```

E abra http://localhost:4321/blog/ . Confira:

- o artigo aparece na lista e na categoria certa;
- a capa ficou boa;
- os links funcionam;
- no celular (no Chrome, F12 e o ícone de celular) o texto lê bem.

Para parar o servidor, `Ctrl+C` no terminal.

---

## 4. Publicar

O site vai ao ar sozinho quando o que está no computador é enviado para o
GitHub. Pelo terminal:

```
git add content/blog blog sitemap.xml
git commit -m "Blog: novo artigo sobre quanto custa um site"
git push
```

Em alguns minutos o artigo está em `usetheatrum.com.br/blog/<slug>/`. Imagem
quebrada nos primeiros minutos costuma ser atraso da hospedagem, não erro:
espere e recarregue.

Se estiver trabalhando com o Claude Code, é só pedir "publica o artigo" que ele
faz os passos 3 e 4.

---

## Perguntas rápidas

**Quero corrigir um artigo já publicado.** Edite o `.md`, mude o `updated` para
a data de hoje, rode `npm run build:blog` e publique de novo.

**Quero tirar um artigo do ar.** Ponha `draft: true` no topo dele (ou apague o
arquivo), rode o build e publique. A página dele é apagada.

**O que mais o build atualiza?** A lista do /blog, as páginas de categoria, os
"artigos relacionados" de todos os artigos, o `sitemap.xml` (que o Google lê) e
o feed RSS em /blog/feed.xml. Por isso o `git add` leva `blog` e `sitemap.xml`
inteiros.

**Não mexa à mão nos arquivos dentro de `blog/`.** Eles são refeitos a cada
build e a mudança se perde. A exceção é `blog/img/posts/`, onde ficam os slides
do Instagram publicados pelo MazyOS.
