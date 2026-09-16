# Projeto Theatrum

Site da Theatrum (usetheatrum.com.br), agência de identidade digital para
pequenos negócios de serviço no Brasil e nos Estados Unidos.

> Este arquivo descreve **o que está no ar**, não um plano. Se o código e este
> arquivo divergirem, o código está certo e este arquivo está velho — conserte-o
> na mesma tarefa.

---

## Workflow de git (autorização permanente)

Após concluir cada tarefa/mudança lógica no código (não a cada Edit individual),
faça automaticamente:

1. `git add` dos arquivos relevantes
2. `git commit` com mensagem descritiva
3. `git push` direto para `origin/main`

Sem pedir confirmação a cada vez. Só pausar para confirmar em casos fora do
padrão: force-push, rebase, reset destrutivo, ou qualquer operação que reescreva
histórico já publicado.

**Cuidado com `git add` de pasta inteira.** Já levou junto arquivo bruto de vídeo
de vários MB mais de uma vez. Adicione caminhos explícitos e confira o
`--name-only` antes de commitar.

---

## Arquitetura técnica (o que restringe tudo abaixo)

- **Página única, arquivo único.** A home inteira é `index.html`, com CSS e JS
  embutidos. Não há componentes, não há empacotador, não há etapa de build.
  Instrução que fale em "bundle", "code splitting" ou "import dinâmico" não se
  aplica aqui.
- **Hospedagem Hostinger, servida direto do repositório.** O deploy é
  automático mas chega **em etapas**: o HTML primeiro, arquivos novos alguns
  minutos depois. Ao conferir uma publicação, imagem quebrada nos primeiros
  minutos costuma ser atraso de propagação, não erro.
- **Este repositório é publicado como site.** Um `.env` commitado aqui fica
  servido em texto puro no domínio. Chave de API só em arquivo que case com o
  `.gitignore` — inclusive cópias e backups (`.bak` **não** casa com `*.env`).
- **Dependências externas:** Google Fonts, GTM e gtag. Nenhuma outra, e é para
  continuar assim. O GSAP saiu: custava 41 KB para cinco animações de entrada
  que o IntersectionObserver e o CSS já fazem. Não traga biblioteca de animação
  de volta.

### Orçamento de performance (regra permanente)

A home travava ao abrir e engasgava ao rolar. Depois do conserto ela transfere
**10 KB** e abre com DOM interativo em 2,1 s em 4G lento com CPU 4x. Qualquer
mudança daqui para frente respeita isto:

| | teto |
|---|---|
| transferido ao abrir | 40 KB |
| DOM interativo (4G lento, CPU 4x) | 2,5 s |
| quadros acima de 16,7 ms ao rolar | 5% |
| tarefas longas durante a rolagem | 0 |

Três coisas que já custaram caro e não podem voltar: imagem servida em tamanho
maior do que aparece (o logo era 1024 px para exibir em 62), script de medição
no `<head>` (GTM e gtag custavam 3,9 s e 2,9 s de thread principal), e animação
infinita fora da tela. As seções abaixo da dobra usam `content-visibility:auto`
justamente para congelar o que não está à vista; por causa disso o navegador
rola por altura estimada, e há uma correção de âncora no fim do `index.html`
que não pode ser removida.

### A página é bilíngue — leia antes de escrever qualquer copy

Há ~277 elementos com atributo `data-en`, e o botão de idioma troca o idioma
**reescrevendo o `innerHTML`** de cada um deles.

Duas consequências obrigatórias:

1. **Toda copy nova nasce nos dois idiomas.** Texto sem `data-en` fica em
   português quando o visitante escolhe inglês.
2. **Componente interativo não pode viver dentro de um elemento com `data-en`.**
   A troca de idioma apaga o `innerHTML` e leva junto o estado e os listeners.
   Componente com estado guarda os próprios textos num objeto JS e se
   re-renderiza quando o idioma muda — nunca depende do `data-en`.

---

## Design system (tokens reais, conferidos no `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0B0A08` | fundo principal |
| `--bg-2` | `#100E0B` | fundo alternado |
| `--card` | `#1A1815` | cards escuros |
| `--accent` | `#E3B341` | dourado: destaques, CTAs, highlights |
| `--accent-soft` | `#F0D488` | dourado claro, hover |
| `--accent2` | `#8E1F2F` | carmim: acento secundário |
| `--cream` | `#F6F1E7` | seções claras |
| `--muted` | `#A39B8D` | parágrafo secundário |
| `--ink` | `#141210` | texto sobre fundo claro |
| `--danger` | `#D64545` | negativos e itens riscados |

Fontes: Space Grotesk (títulos), Inter (corpo), JetBrains Mono (rótulos),
Instrument Serif (detalhe manuscrito).

Rótulos de seção: minúsculo, mono, no formato `[nn] nome da seção`.

---

## Arquitetura de conversão

### A escada de compromisso

A página inteira existe para levar o visitante de degrau em degrau. O erro que
esta arquitetura corrige: durante muito tempo a página só oferecia o degrau 4.

| Degrau | O que o visitante faz | Atrito |
|---|---|---|
| 1 | vê a demonstração rodando | zero |
| 2 | usa a calculadora e vê o próprio número | zero, sem cadastro |
| 3 | pede o raio-x por escrito (negócio + WhatsApp) | baixo |
| 4 | diagnóstico ao vivo, 30 min | médio |
| 5 | proposta | alto |

**Regra permanente: nenhuma seção pode oferecer só o degrau 4.** Toda seção que
pede contato oferece um degrau mais baixo ao lado.

### Ordem das seções

```
[01] hero            [02] o problema      [03] a calculadora
[04] a solução       [05] demonstração    [06] trabalhos
[07] entregas        [08] quem faz        [09] como funciona + o raio-x
[10] investimento    [11] FAQ             [12] CTA final
```

### Regras de copy da marca

- Frases curtas. Segunda pessoa. Zero jargão de agência.
- **Número só entra com origem declarada.** Se veio do que o visitante digitou,
  o texto diz isso.
- **Nenhuma prova social inventada** — nem nome, nem print, nem nota, nem
  estatística de mercado sem fonte. Slot vazio é preferível a slot fabricado.
- Rótulo de seção em minúsculo com índice `[nn]`.
- Sem travessão (—) na copy publicada.

### Mensagens do WhatsApp por origem do clique

Todo botão usa link `wa.me` direto, nunca widget de terceiro, e leva mensagem
diferente conforme de onde a pessoa clicou:

| Origem | Mensagem |
|---|---|
| hero | "Vim do site da Theatrum. Quero o raio-x do meu negócio." |
| calculadora | "Vim do site. A calculadora deu R$ {N} por mês. Quero o plano." |
| demonstração | "Vi as demonstrações no site e quero isso rodando no meu negócio." |
| entregas | "Vi os sites que vocês entregaram. Quero um diagnóstico." |
| FAQ | "Tenho uma dúvida antes do diagnóstico:" |
| CTA final | "Quero meu diagnóstico gratuito." |

---

## Demais páginas do domínio

- `/portfolio/` — a vitrine dos quinze sites, em página própria. Saiu da home
  porque custava 24 KB de HTML, script próprio e 484 KB de imagem que baixavam
  assim que alguém rolava até lá. Na home ficou só o convite, sem imagem
  nenhuma. Quem abre uma demo a partir daqui volta para cá: os links levam
  `?de=portfolio` e os três `_demo.js` conhecem essa origem.
- `/us/` — landing separada, só em inglês, para anúncios nos EUA e Reino Unido.
  Oferta reduzida: site US$ 500, site + Google Business Profile US$ 700.
- `/moveis-planejados/` — landing do segmento de planejados.
- `/imoveis/demos/`, `/moveis-planejados/demos/`, `/lojas/demos/` — sites de
  demonstração. Cada pasta tem um `_demo.js` que neutraliza links de contato e
  põe a barra de volta. O parâmetro `?de=` diz de onde a pessoa veio e decide
  para onde ela volta (inclusive de volta para `/us/`, em inglês).
- `/blog` — saída do Astro em `site/astro-site/`.

---

## Pendências de conteúdo

1. Valores da seção `[10] investimento`: faixa de implantação, de operação e
   mínimo de verba de anúncio. Sem eles a seção perde a função de filtro.
2. Autorização por escrito dos clientes antes de pôr nome, print e link na
   seção `[07] entregas`.
3. Endpoint para onde o formulário do raio-x envia os leads.
4. Política de contrato, para a resposta do FAQ.
5. Foto do Matheus para a seção `[08] quem faz`.
