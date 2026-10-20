# Padrão Theatrum — regras para todo site de cliente

> Vale para todo site de cliente deste repositório (as pastas `aml/`, `inovar/`, `recanto/`, `fornari/`... na raiz). Mora em `.claude/padrao-sites.md`, e não na raiz, porque a raiz é servida no domínio; o `.claude/CLAUDE.md` importa este arquivo, então o Claude Code lê as regras em toda conversa sem precisar repetir nos prompts.
> Quando um briefing pedir algo diferente destas regras, vale o briefing para aquele cliente.
> **v3 (18/10/2026):** acrescenta os padrões de conversão da página (seção 4A), os sites com várias páginas (1A) e a loja com sacola (seção 9).
> **v4 (20/10/2026), depois da prévia da Canto dos Pássaros:** WhatsApp direto, sem modal (seção 4); QR de avaliação no rodapé (4A); fonte para cada fato (5); imagens e fontes já no limite (2); testes de fechamento (8); armadilhas conhecidas (10).

## 1. Estrutura e stack
- HTML + CSS + JS puro, sem framework. Cada cliente fica numa pasta própria:
  - `<slug>/index.html`
  - `<slug>/css/style.css`
  - `<slug>/js/main.js`
  - `<slug>/assets/`
  - `<slug>/data/`
- Caminhos sempre relativos, para funcionar em `usetheatrum.com.br/<slug>/` e depois no domínio do cliente sem mudar nada.
- Conteúdo que muda fica em `data/*.json` ou numa planilha do Google publicada como CSV. Isso vale para produtos, chalés, planos, preços, resultados, FAQ, unidades e WhatsApps. Nunca deixe valores fixos espalhados no HTML ou no JS: o site precisa crescer sem ser refeito.
- As configurações do cliente (WhatsApp, e-mail, IDs, chaves de formulário) ficam todas em `js/config.js`.

### 1A. Sites com várias páginas (catálogo, loja, institucional maior)
- **URLs amigáveis em pastas:** `/<categoria>/<item>/index.html`, por exemplo `/cafes/torra-escura/`. Nada de `produto.html?id=3`.
- **Páginas geradas de um único template:** um script Node (`npm run build`) gera uma página por item do `data/*.json`. Nunca escreva à mão 20 páginas de produto.
- **Header e rodapé iguais em todas as páginas**, vindos de um parcial que o build injeta.
- **Breadcrumb** no topo das páginas internas (`Início › Cafés › Torra escura`) e schema `BreadcrumbList`.
- **Nome de arquivo com hash** no build (`ui.6daa3c3d.js`), para o navegador nunca usar uma versão velha depois de uma atualização.
- **Um JS por responsabilidade**, carregado só nas páginas que precisam dele: `config.js`, `ui.js`, `carrinho.js`, `quiz.js`, `leads.js`, `analytics.js`.
- **Páginas de apoio sempre presentes:**
  - `/perguntas-frequentes`, com âncoras por pergunta (`#frete-quanto-custa`).
  - `/entrega-e-frete`.
  - `/trocas-e-devolucoes`.
  - `/contato`.
  - `/politica-de-privacidade`.
  - `/sobre`.

## 2. Mobile e performance
- Mobile-first. Testar em 375px, 768px e 1440px, sem rolagem horizontal.
- Botões e áreas de toque com no mínimo 48px. Texto com no mínimo 16px no celular.
- Imagens:
  - Em WebP, com `<picture>` e `srcset` em 2 ou 3 larguras (ex.: 320w, 640w, 960w).
  - Com `width` e `height` declarados, para a página não pular enquanto carrega.
  - Com lazy loading abaixo da primeira dobra.
  - No máximo ~150 KB por imagem de conteúdo. Já gere dentro do limite: comprima **a partir do original** e vá baixando a qualidade (76, 70, 64...) até caber. Nunca recomprima um WebP já gerado, porque cada passada piora a imagem.
  - Recorte na geração o que não é foto: texto gravado de story ("CHALÉ CANÁRIO"), selos e bordas de interface de print. Confira os recortes numa folha de contato antes de seguir.
- No máximo 2 famílias de fonte. **Fontes auto-hospedadas** em `<slug>/fonts/`, com `@font-face` e `font-display: swap`. Uma família condensada para títulos pode ter um peso display à parte.
  - Fonte variável baixada do Google: fixe os eixos que não usa (`opsz`, por exemplo) e faça o subset para latim com o fontTools (`instancer` + `subset`). O Fraunces caiu de 67 para 28 KB.
  - **Renderize o itálico com "manhã", "toalha" e "kiwi" antes de usar.** Algumas fontes trazem letras "esquisitas" por padrão. O Fraunces itálico desenha o h com um gancho, que se lê "manĥã". O conserto foi apontar no `cmap` o h, o b e o k para as versões `.alt`.
- Animações curtas com IntersectionObserver, sempre respeitando `prefers-reduced-motion`.
- Vídeo na hero:
  - `autoplay muted playsinline` e `poster` com a imagem final.
  - Em MP4 H.264 e WebM, com até ~3 MB.
  - Versão vertical para o celular, quando o enquadramento pedir.
- Metas do Lighthouse no celular: Performance 90+ (85+ em sites com muitas fotos), Acessibilidade 95+ e SEO 95+.

## 3. Direção de arte
- A identidade vem do próprio cliente (logo, fachada, feed). As cores ficam em variáveis CSS no `:root`, com os hexadecimais nomeados.
- **Ritmo de fundos:** nunca use o mesmo fundo em todas as seções. Alterne entre o tom escuro da marca, uma seção clara (o off-white da paleta) e no máximo uma seção na cor principal sólida. Texturas (grão, pedra, papel) só leves, e nunca na página inteira. Organize em classes de tema (`.theme-dark`, `.theme-light`) aplicadas por seção, em vez de cores soltas em cada bloco.
- As transições entre seções usam cortes (diagonal, onda ou crista, conforme o tema) em vez de só linhas retas.
- Contraste WCAG AA em todo texto, principalmente sobre a cor principal.
- Elementos gráficos originais, desenhados em SVG. Referências de estilo servem de inspiração: não copie artes, logos, ilustrações nem textos de terceiros.
- Fotos: use as do cliente. Quando faltar, use um placeholder de banco gratuito marcado com `[TROCAR POR FOTO REAL]`.
- **Voz do dono:** quando o cliente aparece nos vídeos ou é a cara da marca, mostre isso na hero. Use o nome e a foto dele e uma frase que ele repete. É algo que nenhum concorrente copia.

## 4. Contato e conversão
- Todo link de WhatsApp usa `wa.me/<número>?text=<mensagem>` com uma mensagem pronta e contextual, que cita a página, o serviço, o produto ou o plano de onde a pessoa veio.
- **Mensagem "mastigada":** quando houver formulário, quiz, simulador ou sacola, a mensagem final chega no WhatsApp com os campos em negrito (`*Nome:*`, `*Objetivo:*`...).
- **WhatsApp direto, sem janela no meio (desde 20/10/2026, a pedido do Matheus):** todo botão de WhatsApp, inclusive o envio de simulador, quiz ou sacola, abre o `wa.me` direto, no celular e no computador. Nada de modal com QR code, "me chamem" ou e-mail entre o clique e a conversa. O modal de duas colunas fica só no site da própria Theatrum (`js/leads.js`).
- Os formulários enviam pelo **Web3Forms** (access key em `js/config.js`), com o assunto "🔥 Novo lead – <cliente> – <nome>" e a página de origem. No máximo 4 campos antes do contato; perguntas longas só depois da venda.
- O botão flutuante de WhatsApp aparece depois que a pessoa rola a primeira tela.

### 4A. Padrões de conversão da página (usar sempre que couberem)
- **Barra de aviso no topo:** uma linha fina acima do header com a oferta ou condição mais forte, como frete grátis, a próxima data livre ou uma vaga de lançamento. O texto vem do `data/info.json`, para o cliente trocar sem mexer no código.
- **Hero com dois botões:**
  - O principal leva à ação (comprar, agendar, reservar).
  - O secundário serve a quem ainda está decidindo ("Ver os kits", "Não sei qual escolher").
  - Logo abaixo, uma **faixa de confiança** com 3 ou 4 provas curtas em caixa alta: "100% arábica · loja física na BR-116 · enviamos para todo o Brasil · Pix, cartão ou boleto".
- **Card de produto ou serviço com anatomia fixa:**
  - Selo opcional ("Escolha da casa", "Melhor custo por xícara").
  - Categoria e nome.
  - Uma linha sensorial ou de benefício (`cacau · caramelo · corpo denso`).
  - Opções (tamanhos, formatos).
  - Preço, forma de pagamento e **preço por unidade** (por 100 g, por sessão, por diária).
  - Dois botões: a ação ("Escolher moagem", "Agendar") e "Ver detalhes".
- **Seção "Por que <marca>":** 4 fatos verificáveis com número ou lugar ("Há mais de 7 anos", "Indicação Geográfica Matas de Minas", "Moído só depois do pedido"). Nunca use adjetivos soltos.
- **Manifesto:** um bloco curto, em frases quebradas, na voz do dono. Ele fecha a página antes do rodapé. É ótimo para marcas com história de lugar.
- **Quiz de recomendação:**
  - De 3 a 5 perguntas, com opções em letras (A, B, C...) e uma linha de explicação embaixo de cada pergunta ("Isso define a moagem").
  - "Sem cadastro para ver o resultado".
  - Termina num produto, num plano ou num profissional, com o botão de ação.
  - Na home ele é um link discreto ("Não sei qual escolher"), e o quiz tem página própria.
- **Captura em troca de benefício:** um cupom, um checklist ou uma lista de espera que "chega pelo WhatsApp". A pessoa deixa o nome e o WhatsApp; o site manda pelo Web3Forms e abre o WhatsApp com o pedido do cupom. Não use pop-up que abre sozinho na entrada: mostre o convite depois de 40% de rolagem ou na saída (no computador), no máximo uma vez a cada 7 dias.
- **Dúvida no lugar da dúvida:**
  - Cada página de produto ou serviço tem um botão "Tenho dúvida sobre esse <item>", que abre o WhatsApp citando o item.
  - O carrinho e a página do produto repetem as 4 ou 5 dúvidas mais comuns, com link para a resposta completa no FAQ (âncora).
- **Estado vazio que vende:** a sacola vazia, a busca sem resultado e o filtro sem itens sempre oferecem 2 ou 3 caminhos ("Ver cafés", "Ver kits", "Não sei qual escolher"). Nunca deixe uma tela que diga só "vazio".
- **Rodapé completo:**
  - Colunas de navegação.
  - Atalhos para as dúvidas mais buscadas (links de âncora do FAQ).
  - Formas de pagamento.
  - Endereço da loja física.
  - WhatsApp visível como texto.
  - CNPJ.
  - Políticas.
  - **QR de avaliação no Google** (sempre que o negócio tiver perfil no Maps): um cartão "Já [comprou/se hospedou/foi atendido] aqui?" com o QR, que também é link (no celular a pessoa toca em vez de escanear). Como fazer:
    - O link é `https://search.google.com/local/writereview?placeid=<Place ID>`.
    - O Place ID sai do `ftid` do link do Maps (`!1s0xAAAA:0xBBBB`): são os bytes `0a 12 09` + AAAA em 8 bytes little-endian + `11` + BBBB em 8 bytes little-endian, em base64 url-safe sem `=`. Começa com `ChIJ`.
    - Confira abrindo `https://www.google.com/maps/place/?q=place_id:<ID>` no Chrome (Playwright): o título precisa ser o nome do negócio. `curl` não serve, porque o Google só responde a navegador.
    - O QR é SVG embutido no HTML (sem biblioteca no site), com módulos escuros sobre fundo claro e margem de 2 módulos, mesmo em rodapé escuro. Gere com o `js/vendor/qrcode.min.js` da raiz, rodando em Node.
    - Depois do print, leia o QR com `cv2.QRCodeDetector` e confirme que dá o endereço certo.
    - Deixe um comentário no HTML com o `ftid` de origem e a data da conferência.

## 5. Prévias de prospecção (`usetheatrum.com.br/<slug>/`)
- Uma faixa fina no topo, fácil de remover: "Demonstração criada por Theatrum para <cliente>".
- **Nenhuma tag de rastreamento nas prévias** (UET, GA4, GTM, Pixel, Clarity). Rastreamento só no site final, com o consentimento do cliente.
- Os dados que faltam viram placeholders entre colchetes, destacados em amarelo na tela. Nunca invente endereços, telefones, preços, avaliações, números de clientes, registros profissionais nem prazos.
- **Cada fato publicado tem fonte anotada** no `interno/clientes/<slug>/README.md` (bio, story, post, cartão, perfil do Google). Foto não é fonte de regra:
  - Uma foto mostra o que aconteceu uma vez, não o que vale sempre. "Toalha em cisne na chegada" e "café servido no salão" saíram de foto e tiveram de ser retirados.
  - Não generalize uma comodidade para todos os quartos, chalés ou unidades porque ela aparece numa foto. O que não tem fonte vira placeholder.
  - Não escreva nada sobre os seguidores ou clientes do cliente ("é o assunto preferido de quem segue...").
- **Condição comercial com as palavras da fonte.** Pagamento, sinal, prazo e garantia vão como o cliente escreveu. "50% do valor" não é "50% da diária".
- Afirmações legais, técnicas ou de saúde levam a marca `[REVISAR COM O CLIENTE]`.
- Antes e depois, depoimentos e fotos dos clientes do cliente só com autorização. Enquanto não houver autorização, use placeholder.
- Demos de portfólio com marca fictícia levam a faixa "Projeto conceito. Marca, números e dados são fictícios."
- `<meta name="robots" content="noindex, nofollow">` e fora do sitemap.

## 6. SEO e compartilhamento (obrigatório em todo site)
- `title` e `meta description` com o serviço ou produto e a cidade. No título das páginas internas: `<Item> · <Marca>`.
- Um único `h1` por página e `alt` descritivo em todas as imagens.
- schema.org em JSON-LD do tipo certo: LocalBusiness, MedicalBusiness, LodgingBusiness, Store, VeterinaryCare, ProfessionalService ou Person. Em loja, use `Product` com `Offer` (preço, disponibilidade) em cada página de produto, `BreadcrumbList` e `FAQPage` na página de dúvidas.
- **Imagem de prévia (Open Graph):**
  - Gere `<slug>/og-image-v1.jpg` com 1200 x 630 px, em JPG com menos de 300 KB, a partir de uma página HTML exportada com Playwright.
  - Antes do screenshot, rode `await page.evaluate(() => document.fonts.ready)` e confirme que todas as imagens carregaram.
  - Composição: uma foto ou visual forte de um lado e título curto + logo do outro, com margem de segurança de 60 px. O texto nunca pode ser da cor do fundo.
  - Tags no `<head>` com URLs absolutas (https):
    - `og:type`, `og:url`, `og:title`, `og:description`.
    - `og:image`, `og:image:width`, `og:image:height`, `og:image:type`.
    - `twitter:card` (summary_large_image) e `twitter:image`.
  - Ao trocar a imagem, **mude o nome do arquivo** (v1 → v2), porque o WhatsApp guarda a imagem antiga pelo endereço.
  - Mostre a imagem gerada antes de publicar.
  - Em loja, cada produto tem a sua própria imagem de prévia (a foto do produto).
- Favicon a partir do logo. `sitemap.xml` (gerado no build, com todas as páginas) e `robots.txt` no site final.

## 7. Site final (depois que o cliente fecha)
- Remova a faixa de demonstração e os placeholders.
- Instale o rastreamento contratado (GA4, GTM, Pixel do Meta, UET). Ele só carrega **depois do "Aceitar"** num aviso de cookies, e o site precisa ter a página `/privacidade`.
- Eventos padronizados em todos os sites:
  - `whatsapp_click`, `lead_callback`, `lead_email`, `form_submit`.
  - Quando houver: `diagnostico_concluido` / `aplicacao_concluida`, `quiz_concluido`.
  - Em loja: `add_to_cart`, `begin_checkout`, `pedido_whatsapp`, `cupom_pedido`.
- Domínio, Google Meu Negócio e contas de anúncio sempre em nome do cliente.

## 8. Fechamento de cada tarefa
Ao terminar qualquer etapa:
- Rode localmente e passe o endereço.
- Teste todos os caminhos de WhatsApp, os formulários e, em loja, a sacola do início ao fim. Confira o texto da mensagem que sai, decodificado, e não só se o link abre.
- **Teste automático com Playwright** antes de mostrar:
  - Print da página inteira em 1440 e em 375, com `?still=1`.
  - `document.documentElement.scrollWidth` igual à largura da tela.
  - Nenhum `pageerror`.
  - Olhe os prints em pedaços, seção por seção.
- Depois do push, confira o endereço no ar (`curl -w '%{http_code}'` na página, no CSS, no JS, nos JSON e na `og-image`) antes de dizer que o link está pronto para enviar.

## 10. Armadilhas que já custaram retrabalho (já comece evitando)
- **`[hidden]` perde para `display`.** Um `label { display: grid }` faz o campo escondido aparecer. Ponha `[hidden] { display: none !important; }` no reset de todo site.
- **Campo de data estoura no celular.** `input[type=date]` tem largura mínima própria. Use `min-width: 0` nele e `minmax(0, 1fr)` nas colunas da grade, senão a página rola para o lado em 375 px.
- **Placeholder dentro de rótulo herda o estilo.** O `.ph` precisa zerar `text-transform`, `letter-spacing`, `font-style` e a cor. Escreva os seletores de rótulo como filho direto (`li > span`), para não pegar o `.ph` que está dentro.
- **`?still=1` precisa carregar as imagens.** Com `loading="lazy"` o print da página inteira sai com buraco. No modo QA, troque todas para `eager`, inclusive as que o JS desenha depois dos JSON.
- **Galeria em grade não pode ter buraco.** Numa grade de 4 colunas com itens largos (2×1) e altos (1×2), os altos têm de vir aos pares. Escreva no `_leia` do JSON qual ordem fecha a grade.
- **Título claro sobre foto clara no celular.** O corte do `object-fit` muda no celular. Ajuste o `object-position` e use um degradê mais forte abaixo de 640 px. Confira no print de 375.
- **Botão com ícone dentro de foto ou mapa:** use `white-space: nowrap`, senão o texto quebra em duas linhas.
- Liste os placeholders, os itens `[REVISAR COM O CLIENTE]` e as sugestões para a versão final.

## 9. Loja com sacola (quando o briefing pedir venda de produto)

Existem dois níveis. O briefing diz qual usar. Na dúvida, comece pelo Nível 1.

**Nível 1: sacola → pedido no WhatsApp.** É o padrão para comércio local e não exige servidor.
- A sacola fica num **drawer lateral**, que abre ao adicionar um item, e também numa página `/carrinho`. O contador no ícone do header é atualizado ao vivo.
- O estado fica no `localStorage`, com try/catch. Se não der para salvar, a sacola funciona só durante a visita.
- Cada item guarda produto, variação (tamanho, moagem, cor), quantidade e preço unitário. O preço vem sempre do `data/produtos.json`, nunca do que foi salvo no navegador.
- **Página de produto:**
  - Galeria, nome, linha sensorial, preço e preço por unidade.
  - Seletor de tamanho e seletor da variação principal (ex.: moagem por método de preparo, com a explicação "textura de sal grosso").
  - Quantidade (− 1 +).
  - Botões "Comprar agora" (vai direto para a sacola) e "Adicionar à sacola".
  - Bloco de garantia ("Chegou avariado? Foto no WhatsApp em até 48 h").
  - Formas de pagamento.
  - Frete e prazo, com estimativa por CEP ou por região a partir de `data/frete.json`.
  - "Tenho dúvida sobre esse produto".
  - Seções "Sobre", "Para quem é" e "Como preparar ou usar".
  - Produtos relacionados.
- **Fechar pedido:**
  - O formulário curto pede nome, WhatsApp, CEP e "entrega ou retirada na loja".
  - Depois abre o WhatsApp com a mensagem mastigada: itens com variação e quantidade, subtotal, frete estimado ou "a calcular", total, forma de pagamento escolhida e endereço ou retirada.
  - O pedido também é enviado pelo Web3Forms, como cópia de segurança.
- **Cupom:** os códigos ficam em `data/cupons.json` (tipo, valor, validade, pedido mínimo). Avise que o desconto é confirmado pela loja no WhatsApp.

**Nível 2: pagamento no site (Pix, cartão, boleto).** É um projeto sob medida, com orçamento à parte.
- Use o Checkout Pro do Mercado Pago (ou o Pagar.me / Asaas, se o cliente já tiver conta), criando a preferência de pagamento numa função serverless (Netlify Functions ou o equivalente da hospedagem). Nunca coloque chave secreta no front.
- Calcule o frete pela API dos Correios ou do Melhor Envio na mesma função.
- Webhook de pagamento aprovado → e-mail para a loja e para o cliente, e mensagem pronta para a loja no WhatsApp.
- Página `/pedido/reenviar` para o cliente recuperar o link de pagamento ou o resumo do pedido.
- Antes de começar, confirme com o Matheus que a conta de pagamento está no nome do cliente.
