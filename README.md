# Devocional Diário

Site estático com versículo + devocional do dia, dois jogos bíblicos (Termo e Conexões), e automação que publica posts diários no Instagram.

## Estrutura

```
docs/                                  tudo que é servido pelo GitHub Pages (fonte do site em /docs)
  index.html, termo.html, conexo.html  páginas do site
  style.css, termo.css, conexo.css      estilos
  app.js, termo.js, conexo.js           lógica de cada página
  content.js                            banco de devocionais (fonte única, usado pelo site e pelos scripts)
  termo-words.js, conexo-words.js       bancos de palavras dos jogos (fonte única)
  assets/                               imagens estáticas (ex: QR Code Pix)
  output/                               imagens e legendas geradas diariamente
scripts/                                automação Node (geração de imagem + publicação no Instagram)
  lib/                                  código compartilhado entre os scripts
.github/workflows/                      GitHub Actions, rodam a automação todo dia
```

Todo conteúdo (`content.js`, `termo-words.js`, `conexo-words.js`) é compartilhado entre o site (browser) e os scripts (Node) através de `module.exports` condicional no fim de cada arquivo. Editar um desses arquivos atualiza tanto o site quanto os posts gerados.

## Automação do Instagram

Dois fluxos, em horários diferentes:

- **Devocional** (`post-daily.yml`, 08:00 BRT): gera card do versículo + card de doação (Pix), publica como carrossel, e publica um Story anunciando o post.
- **Secundário** (`post-game.yml`, 15:00 BRT): alterna por dia entre 4 tipos de conteúdo (dia do ano % 4): Termo sendo revelado letra por letra, tabuleiro de Conexões sem revelar grupos, card de citação minimalista, e trivia bíblica (pergunta + gabarito). Todos terminam com o card de doação.
- **Reel** (`post-reel.yml`, quarta 16:00 BRT): slideshow em vídeo (sem áudio por enquanto) com o devocional do dia, formato vertical 9:16, via ffmpeg.
- **Insights** (`fetch-insights.yml`, segunda 09:00 BRT): coleta métricas dos posts recentes via Graph API.

## Webhook de engajamento

`webhook/` contém um Cloudflare Worker que responde automaticamente a comentários com "amém"/"amem", via webhook do Instagram (campo `comments`). Hospedado em `devocional-diario-webhook.<subdomínio>.workers.dev`, fora do fluxo de deploy do GitHub Actions (deploy manual via `npx wrangler deploy` dentro de `webhook/`). Secrets (`IG_ACCESS_TOKEN`, `VERIFY_TOKEN`) configurados via `wrangler secret put`, não versionados.

Cada workflow: gera as imagens → comita no repo (para o GitHub Pages servir a URL pública) → espera o deploy → publica via Graph API.

### Rodar manualmente

```bash
npm install
npm run generate-image && npm run post-instagram
npm run generate-game-images && npm run post-game-instagram
```

Precisa de um `.env` (não versionado) com:

```
IG_ACCESS_TOKEN=...
IG_USER_ID=...
SITE_BASE_URL=https://usuario.github.io/repo
PIX_KEY=...
```

Em produção esses valores ficam em **Settings → Secrets and variables → Actions** do repositório.

### Observações

- O token gerado via login direto do Instagram expira em ~60 dias e precisa ser renovado manualmente no painel do Meta for Developers.
- O Termo do post revela a mesma palavra jogada no site no mesmo dia (decisão deliberada, sem defasagem).
