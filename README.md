# Devocional Diário

Site estático com versículo + devocional do dia, dois jogos bíblicos (Termo e Conexões), e automação que publica posts diários no Instagram.

## Estrutura

```
index.html, termo.html, conexo.html   páginas do site
style.css, termo.css, conexo.css      estilos
app.js, termo.js, conexo.js           lógica de cada página
content.js                            banco de devocionais (fonte única, usado pelo site e pelos scripts)
termo-words.js, conexo-words.js       bancos de palavras dos jogos (fonte única)
assets/                               imagens estáticas (ex: QR Code Pix)
output/                               imagens e legendas geradas diariamente (servidas via GitHub Pages)
scripts/                              automação Node (geração de imagem + publicação no Instagram)
  lib/                                código compartilhado entre os scripts
.github/workflows/                    GitHub Actions, rodam a automação todo dia
```

Todo conteúdo (`content.js`, `termo-words.js`, `conexo-words.js`) é compartilhado entre o site (browser) e os scripts (Node) através de `module.exports` condicional no fim de cada arquivo. Editar um desses arquivos atualiza tanto o site quanto os posts gerados.

## Automação do Instagram

Dois fluxos, em horários diferentes:

- **Devocional** (`post-daily.yml`, 08:00 BRT): gera card do versículo + card de doação (Pix), publica como carrossel.
- **Jogo** (`post-game.yml`, 15:00 BRT): alterna por dia. Dias pares publicam o Termo do dia sendo revelado letra por letra (carrossel), dias ímpares publicam o tabuleiro de Conexões do dia sem revelar os grupos.

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
