# Pacote Completo — Módulos de Entrega

> Checklist operacional pra quando um cliente fechar o pacote completo prometido
> no site. Cada item aqui é uma promessa que já está no `index.html` (marquee,
> os 3 motores, "como funciona", a demo do sistema e o comparativo) — ou seja,
> o cliente pode cobrar exatamente isso. Serve como guia de implantação e como
> checklist de venda (o que entra / o que falta decidir antes de assinar).

**Como usar:** ao fechar um cliente, duplicar este arquivo com o nome dele
(`saidas/clientes/<nome>-pacote.md` no MazyOS) e ir marcando `[x]` por módulo
conforme a implantação avança.

---

## Visão geral — os 3 motores

| Motor | Vazamento que fecha | Módulos |
|---|---|---|
| 01 · Atrair | "ninguém te acha" | Site, Google Meu Negócio, Google Ads, SEO+IA |
| 02 · Converter | "o cliente esfria" | IA no WhatsApp, CRM de leads, follow-up, lembretes |
| 03 · Fidelizar | "ninguém volta" | Reativação, LinkedIn B2B, conteúdo automático |

Cruzando os três: **diagnóstico → implantação → operação → ajuste fino mensal**
(as 4 etapas do "como funciona").

---

## Módulo 1 — Atrair

### 1.1 Site profissional
- [ ] Site institucional multi-idioma no ar
- [ ] Domínio configurado e apontado
- [ ] Analytics + Pixel instalados
- **Insumos do cliente:** logo/identidade, fotos, textos-base pra aprovação, domínio (se já tiver)
- **Stack:** `[DEFINIR — não há ferramenta/CMS fixado ainda; hoje o próprio Theatrum é HTML/CSS/JS vanilla]`

### 1.2 Google Meu Negócio
- [ ] Perfil reivindicado/otimizado (categorias, horários, descrição, fotos)
- [ ] Rotina de posts (cadência a definir)
- [ ] Monitoramento e resposta a avaliações
- **Insumos do cliente:** acesso admin ao perfil (ou dados pra reivindicar)

### 1.3 Google Ads
- [ ] Estrutura de campanha + conversões configuradas
- [ ] Palavras-chave / públicos definidos
- [ ] Relatório mensal de CPL/CPA ligado a contato e orçamento (não curtida)
- **Insumos do cliente:** verba de mídia (separada do fee), acesso à conta de ads (ou criar uma)

### 1.4 SEO + IA
- [ ] Auditoria técnica inicial
- [ ] Otimização on-page + schema
- [ ] Conteúdo recorrente otimizado por IA
- **Stack:** `[DEFINIR — ferramenta de geração/otimização de conteúdo]`

---

## Módulo 2 — Converter

### 2.1 IA no WhatsApp (atendimento automático)
- [ ] Script/base de conhecimento do negócio carregado na IA
- [ ] Integração com o número de WhatsApp do cliente
- [ ] Teste de fluxo: dúvida → agendamento → confirmação
- **Promessa do site:** responde, tira dúvida e agenda, 24h — inclusive fora do horário
- **Stack:** `[DEFINIR — provedor de IA/WhatsApp Business API a escolher]`

### 2.2 CRM / leads organizados
- [ ] Pipeline de estágios (kanban) configurado
- [ ] Cada conversa do WhatsApp/formulário vira card automaticamente
- **Promessa do site:** "cada conversa vira card e anda sozinha até fechar"

### 2.3 Follow-up de orçamento parado
- [ ] Regra de disparo definida (ex.: X dias sem resposta)
- [ ] Mensagem de reativação do orçamento configurada
- **Promessa do site:** "orçamento parado volta a responder e vira receita"

### 2.4 Lembretes de agendamento
- [ ] Integração com a agenda do cliente
- [ ] Confirmação automática antes do atendimento
- **Promessa do site:** "agenda sem furo"

---

## Módulo 3 — Fidelizar

### 3.1 Esteira de reativação de clientes
- [ ] Segmentação da base (ex.: sem contato há 60/90/120 dias)
- [ ] Régua de mensagens de reativação configurada e automática
- **Promessa do site:** "meses depois do último contato, o sistema chama e ele volta" — reativação automática, sem ninguém precisar ligar

### 3.2 LinkedIn B2B
- [ ] Página/perfil otimizado (banner, posicionamento, sobre)
- [ ] Cadência de conteúdo definida
- **Insumos do cliente:** acesso admin à página (ou criar uma)

### 3.3 Conteúdo automático (Instagram/LinkedIn)
- [ ] Linha editorial + templates definidos
- [ ] 30 posts do mês criados e agendados de uma vez
- **Promessa do site:** contador "30 posts criados e agendados ✓" na demo

---

## Módulo 4 — Operação e Relatórios (transversal)

- [ ] **Diagnóstico** (pré-venda, gratuito): mapear vazamentos e o que custam
- [ ] **Implantação**: todos os módulos acima construídos e conectados
- [ ] **Operação contínua**: IA + tráfego rodando todo dia
- [ ] **Ajuste fino mensal**: relatório de contato/orçamento/faturamento + otimização
- [ ] **Painel de metas**: meta do mês visível e andando
- [ ] **Evolução de longo prazo**: comparativo antes/depois em 12 meses

---

## Antes de vender o pacote completo — o que falta decidir

Isso é a lista honesta de lacunas (nada aqui foi inventado, só sinalizado):

1. **Stack técnica** de cada módulo com `[DEFINIR]` acima — hoje o site vende a
   promessa, a ferramenta por trás ainda não está fixada
2. **Preço e escopo** de cada módulo — o que é setup único vs. mensalidade
3. **Insumos obrigatórios do cliente** por módulo (acessos, credenciais, verba
   de ads) — formalizar num onboarding/checklist de entrada
4. **SLA**: tempo de implantação ("primeiras semanas", conforme o FAQ do site)
   e tempo de resposta da IA
5. **Capacidade solo**: como fundador único sem equipe, definir quantos
   clientes em pacote completo dá pra operar em paralelo antes de saturar
