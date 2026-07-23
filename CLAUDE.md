# Projeto Theatrum — Landing Page

## Objetivo
Construir a landing page do projeto **Theatrum**, replicando a estrutura, o layout e o estilo visual do site de referência (`https://kassioteste02.netlify.app/` — Bellion Med), mas com identidade e conteúdo próprios do Theatrum.

> IMPORTANTE: replicar a **estrutura e o estilo**, não os textos. Todo o copy deve ser reescrito para o Theatrum. Onde o conteúdo ainda não foi definido, usar os placeholders `[PLACEHOLDER: ...]` indicados abaixo.

---

## Workflow de git (autorização permanente)
Após concluir cada tarefa/mudança lógica no código (não a cada Edit individual), faça automaticamente:
1. `git add` dos arquivos relevantes
2. `git commit` com mensagem descritiva
3. `git push` direto para `origin/main`

Sem pedir confirmação a cada vez — essa autorização já cobre o fluxo normal de push para main. Só pausar para confirmar em casos fora do padrão: force-push, rebase, reset destrutivo, ou qualquer operação que reescreva histórico já publicado.

---

## Stack sugerida
- HTML + CSS + JS vanilla (single page), ou Astro se preferir componentizar
- Sem frameworks pesados — a página de referência é leve e estática
- Fontes via Google Fonts
- Deploy alvo: Netlify

---

## Design System

### Cores — paleta teatral
A paleta segue a mesma lógica da referência (fundo escuro dominante + 1 cor de acento vibrante + seções claras intercaladas), mas com cores que remetem a **teatro**: preto de palco, dourado de holofote/spotlight, vermelho de cortina e marfim.

| Token | Valor aproximado | Uso |
|---|---|---|
| `--bg-dark` | `#0B0A08` (preto de palco, levemente quente) | Fundo principal (hero, seções escuras) |
| `--bg-card` | `#1A1815` – `#232019` | Cards escuros com borda sutil |
| `--bg-light` | `#F6F1E7` (marfim/creme) | Seções claras intercaladas |
| `--accent` | `#E3B341` (dourado holofote) | Destaques, highlights marca-texto, CTAs, ícones — substitui o verde-neon da referência |
| `--accent-2` | `#8E1F2F` (vermelho cortina/carmim) | Acento secundário: detalhes, hovers, sublinhados, o item em destaque de listas |
| `--text-primary` | `#FFFFFF` (dark) / `#141210` (light) | Títulos |
| `--text-muted` | `#A39B8D` (cinza quente) | Parágrafos secundários |
| `--danger` | `#D64545` | Números negativos / itens riscados (distinto do vermelho cortina) |

> **Mapeamento**: em todo este documento, onde estiver escrito "verde", "verde-neon" ou "highlight verde", ler como `--accent` (dourado). A seção de CTA final, que na referência é inteira verde-neon, aqui deve ser inteira **dourada** (texto escuro sobre dourado) — ou, como alternativa a testar, vermelho-cortina com texto marfim.

### Tipografia
- **Títulos**: sans-serif geométrica bold (ex.: Space Grotesk, Archivo ou similar), pesos 600–800, tamanhos grandes (clamp de ~2.5rem a 4.5rem no hero)
- **Corpo**: mesma família ou Inter, peso 400, cor muted
- **Labels/eyebrows**: monoespaçada (ex.: Space Mono / JetBrains Mono), uppercase, letter-spacing largo, tamanho pequeno, no formato `—— [01] NOME DA SEÇÃO`
- **Detalhe manuscrito**: uma frase em fonte script/itálica sublinhada como acento (usada uma vez, na seção de comparação)

### Padrões visuais recorrentes
- **Highlight marca-texto**: palavras-chave dos títulos com fundo verde-neon (`background: var(--accent)`) ou cor verde no texto
- **Numeração grande** nos cards: `01`, `02`, `03` em fonte display, verde ou branco translúcido
- **Cards escuros** com border-radius ~16px, borda `1px solid rgba(255,255,255,0.08)`, leve rotação em alguns (efeito "espalhado")
- **Ticker/marquee horizontal** com itens separados por `+` ou `✦`, rolagem infinita em CSS
- **Texto gigante de fundo** (watermark) atrás de seções escuras, cor quase igual ao fundo
- **Badges/microcopy** em mono uppercase abaixo dos CTAs (ex.: garantias, tempo de resposta)
- **Checklist**: ✓ verde para benefícios; itens riscados em vermelho na coluna de comparação
- Alternância de fundo entre seções: escuro → escuro → claro → escuro → claro → escuro → neon → escuro (footer)

---

## Estrutura da página (seção por seção)

### 1. Header (fixo, transparente sobre o hero)
- Logo à esquerda: **Theatrum**
- 1 link/CTA discreto à direita: `[PLACEHOLDER: CTA do header]`

### 2. Hero (fundo escuro)
- Eyebrow mono: `—— [01] ...`
- H1 grande com 1–2 palavras destacadas em verde: `[PLACEHOLDER: promessa principal do Theatrum]`
- Parágrafo de apoio com trechos em **bold**: `[PLACEHOLDER: subheadline]`
- Linha de "anti-métricas" riscadas em mono (opcional): `[PLACEHOLDER]`
- CTA primário (pill verde, texto escuro, seta →) + CTA secundário (ghost/outline)
- Microcopy mono abaixo do botão
- Faixa de 3 bullets de confiança em mono uppercase com marcadores verdes

### 3. Marquee duplo
- Linha 1 (fundo claro): itens grandes do que o Theatrum oferece, separados por `✦`
- Linha 2 (fundo escuro, menor): frases curtas de benefício separadas por `•`

### 4. Seção Problema (fundo escuro, watermark gigante atrás)
- Eyebrow: `—— [02] O PROBLEMA`
- H2 com destaque colorido: `[PLACEHOLDER: dor principal do público]`
- Parágrafo introdutório
- **3 cards numerados** (01/02/03), levemente rotacionados, cada um com título curto e descrição: `[PLACEHOLDER: 3 dores/vazamentos]`
- Faixa de comparação com 2 números lado a lado (bom em verde vs. ruim em vermelho) + card de texto explicativo: `[PLACEHOLDER: métrica de contraste]`

### 5. Seção Solução (fundo claro)
- Eyebrow: `—— [03] A SOLUÇÃO`
- H2 com palavra em highlight marca-texto verde
- **3 cards escuros** ("motores"/pilares), cada um com: label mono no topo, ícone, título, descrição, e rodapé mono amarrando ao problema que resolve: `[PLACEHOLDER: 3 pilares da solução]`
- Barra escura de fechamento: "os três juntos = `[PLACEHOLDER: nome do sistema]`" com destaque verde

### 6. Seção Como Funciona (fundo escuro)
- Eyebrow: `—— [04] COMO FUNCIONA`
- H2 com destaque verde
- **Timeline horizontal de 4 etapas**: círculos verdes numerados conectados por linha, cada etapa com título + sublabel mono + descrição curta: `[PLACEHOLDER: 4 etapas do processo]`

### 7. Seção Comparação (fundo claro)
- Eyebrow: `—— [05] A DIFERENÇA`
- H2 + frase em fonte manuscrita sublinhada como complemento
- **Duas colunas**:
  - Esquerda (o mercado comum): itens riscados em vermelho — `[PLACEHOLDER: o que os concorrentes fazem de errado]`
  - Direita (Theatrum): checklist ✓ verde — `[PLACEHOLDER: 8 entregas/benefícios]`

### 8. Seção Demonstração (fundo claro)
- Eyebrow: `—— [06] DEMONSTRAÇÃO`
- H2 com highlight marca-texto
- **Layout em duas colunas**: lista vertical de ~10 itens accordion/feature (ícone + título + descrição curta; um item em destaque com fundo escuro) à esquerda; **mockup de celular/produto** à direita mostrando o sistema em ação: `[PLACEHOLDER: features demonstráveis + tela do produto]`
- Botão "mostrar mais" mono + CTA verde ao final

### 9. Seção Avaliações / Prova Social (fundo claro ou escuro, a definir)
- Eyebrow: `—— [07] AVALIAÇÕES`
- H2 com destaque verde: `[PLACEHOLDER: título de prova social]`
- **Badge de plataforma**: logo do Google (ícone "G" oficial em SVG) ao lado de nota média + estrelas (ex.: `4,9 ★★★★★ no Google`)
- **Cards de depoimento** (3–6, em grid ou carrossel): foto/inicial do avaliador, nome, estrelas em verde-neon, texto da avaliação, e o ícone do Google pequeno no canto indicando a origem: `[PLACEHOLDER: avaliações reais]`
- **TAREFA DE ASSETS — download de logos**: baixar os logos das plataformas de avaliação (Google e outras que forem usadas) em SVG e salvar em `/assets/logos/`:
  - Preferir fontes oficiais de marca (Google Brand Resource Center) ou o Simple Icons (`https://simpleicons.org/` — SVGs dos logos via CDN/download)
  - Usar o logo apenas como indicador de origem das avaliações, sem alterar cores/proporções do símbolo oficial
  - Otimizar os SVGs (remover metadados) antes de usar
- Nota: exibir o logo do Google somente junto de avaliações reais da plataforma — se ainda não houver, deixar a seção com placeholders claros para preencher depois

### 10. Seção FAQ (fundo escuro)
- Eyebrow: `—— [08] PERGUNTAS DIRETAS`
- H2 centralizado com destaque verde
- **Accordion** com 5 perguntas: `[PLACEHOLDER: objeções reais do público do Theatrum]`

### 11. CTA Final (fundo verde-neon inteiro — inversão total)
- Eyebrow mono escuro: `—— [09] O PRÓXIMO PASSO`
- H2 grande em texto escuro: `[PLACEHOLDER: pergunta/convite final]`
- Parágrafo curto
- CTA em pill **preta** com texto claro (inversão do CTA do hero)
- Microcopy mono abaixo

### 12. Footer (fundo escuro, compacto)
- Logo + tagline mono à esquerda, links (redes sociais, voltar ao topo) à direita
- Linha de copyright em mono

---

## Comportamentos/JS

### Fidelidade obrigatória nas animações
**Todos os elementos que se movem na página de referência devem ser replicados fielmente** — mesmo timing, easing, sequência e comportamento. Antes de codar, inspecionar o site de referência ao vivo (`https://kassioteste02.netlify.app/`) para observar cada animação em funcionamento. Elementos animados a reproduzir:

- **Simulação de conversa no WhatsApp** (mockup de celular da seção Demonstração): réplica fiel do comportamento — interface de chat estilo WhatsApp (header com foto, nome e status, fundo do chat, bolhas de mensagem), mensagens que aparecem em sequência automaticamente, indicador de "digitando...", horários nas bolhas, resposta de confirmação, e loop/reinício da sequência. Apenas o **conteúdo das mensagens** muda para o contexto do Theatrum (`[PLACEHOLDER: roteiro da conversa]`)
- **Marquees** (as duas linhas): mesma velocidade, direção e rolagem infinita sem "pulo" no loop
- **Animações de entrada** ao rolar (fade/slide) nas seções e cards, com o mesmo delay escalonado entre itens
- **Accordions** (FAQ e lista da demonstração): mesma transição de abrir/fechar
- **Hovers**: botões, cards e links com os mesmos efeitos de hover da referência
- Qualquer outro elemento em movimento identificado na inspeção (contadores, tickers, pulsos em ícones etc.)

### Demais comportamentos
- Marquee com animação CSS infinita (`@keyframes` translateX)
- Accordion do FAQ (abrir/fechar)
- Scroll suave nos links internos
- Header que ganha fundo sólido ao rolar (opcional)
- Animações de entrada sutis (fade/slide) via IntersectionObserver

## Responsividade
- Mobile-first; cards empilham em coluna
- Timeline de 4 etapas vira vertical no mobile
- Marquee mantém rolagem
- H1/H2 com `clamp()` para escalar

---

## Pendências de conteúdo (preencher antes ou durante o build)
1. O que é o Theatrum, público-alvo e promessa principal
2. As 3 dores do público (seção Problema)
3. Os 3 pilares da solução
4. As 4 etapas do processo
5. Lista de entregas (checklist) e comparativo com o mercado
6. Features da demonstração + qual tela/mockup mostrar
7. 5 perguntas do FAQ
8. CTAs (para onde apontam: WhatsApp? Formulário?)
9. Logo/identidade do Theatrum (ou usar wordmark tipográfico)
10. Avaliações reais para a seção de prova social (nome do avaliador, nota e texto) + quais plataformas além do Google entram
