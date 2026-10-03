# Área interna da Theatrum

O repositório é o site: tudo que é versionado fica servido em
usetheatrum.com.br. Esta pasta guarda o que é trabalho, não página. O
`.htaccess` daqui nega acesso pelo navegador, e o `.gitignore` deixa fora
do git tudo menos os documentos de processo.

```
interno/
  README.md               este mapa (versionado)
  PACOTE-COMPLETO.md      checklist de implantação por módulo (versionado)
  clientes/<cliente>/     briefing, README de pendências, prints, proposta e PDF
  comercial/              contrato modelo e o que vale para todo cliente
  marketing/              panfletos, criativos de anúncio (Microsoft Ads etc.)
  demos-em-producao/      demos que chegaram de fora e folhas de conferência de fotos
  arquivo/                cópias antigas que ainda não foram apagadas
```

Clientes hoje: `aml`, `engmais`, `inovar`, `recanto`, `armazem-caparao` (prévias no ar),
`patricia-sacramento` (proposta de 25/06/2026) e `nutri-cintia` (proposta
em HTML; a demo está em `/nutricao/demos/cintia-antunes/`, ainda fora do git).

## Fora desta pasta, de propósito

- `MazyOS/` e `Produto Digital/`: repositórios git próprios, ignorados aqui.
- `conta-frases/`: esteira do @explicologo, outro negócio. Fica no site
  porque a API do Instagram exige URL pública para a mídia.
- `site/astro-site/`: fonte do blog; a saída publicada é `blog/`.

## Agentes (`.claude/agents/`)

| Agente | Faz | Quando |
|---|---|---|
| `revisor` | confere vazamento, noindex, UET, bilíngue, copy e performance; só lê | antes de todo push |
| `previa-de-cliente` | prévia do site do cliente no molde AML/Recanto | cliente novo ou briefing novo |
| `demo-de-segmento` | demo fictícia da vitrine + manifesto de fotos | segmento novo ou foto faltando |
| `proposta-comercial` | proposta 1280x720 em HTML + PDF | lead pediu proposta |
| `criativos` | panfletos e imagens de anúncio em tamanho exato | divulgação |
| `google-e-trafego` | pacote do Google Meu Negócio, campanhas, relatório de CSV | Theatrum ou cliente em operação |

Sem agente, por enquanto:

- **IA no WhatsApp:** falta escolher a plataforma (o `PACOTE-COMPLETO.md`
  ainda diz `[DEFINIR]`). O agente vem depois da escolha, porque o
  trabalho inteiro depende dela.
- **Reativação:** depende da lista de contatos de um cliente real. Até lá,
  o `google-e-trafego` cobre a parte de mensagem.
- **Social media:** é complemento, não o forte, e a esteira do
  @explicologo já tem processo próprio.
