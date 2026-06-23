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
- **Reel** (`post-reel.yml`, quarta 16:00 BRT): slideshow em vídeo com o devocional do dia, formato vertical 9:16, via ffmpeg. Se houver faixas MP3 em `docs/assets/audio/`, uma delas é escolhida por rotação diária e mixada no vídeo (com fade out no final); sem faixas, o vídeo sai silencioso como antes.
- **Insights** (`fetch-insights.yml`, segunda 09:00 BRT): coleta métricas dos posts recentes via Graph API.

## Threads

Publica uma versão curta do devocional do dia também no Threads (o app de texto da Meta), reaproveitando o mesmo conteúdo de `docs/content.js`. É um produto e uma API separados do Instagram, então usa suas próprias credenciais (`THREADS_ACCESS_TOKEN` e `THREADS_USER_ID`), que **não** são as mesmas do Instagram (`IG_ACCESS_TOKEN`/`IG_USER_ID`).

O post é só texto: o versículo do dia, a referência, a primeira frase do devocional como resumo, uma chamada pra comentar/salvar (rotativa, igual ao Instagram) e um aviso de que o devocional completo está no link da bio. Tudo isso é montado para ficar bem abaixo do limite de caracteres do Threads (a lógica corta a chamada e depois o resumo, se precisar, pra nunca passar de ~480 caracteres).

Roda com:

```bash
npm run post-threads
```

Precisa, além das variáveis já listadas acima, de:

```
THREADS_ACCESS_TOKEN=...
THREADS_USER_ID=...
```

### Como conseguir essas credenciais (passo a passo)

Isso é uma configuração manual, feita uma vez fora do código, direto no painel da Meta. Veja como fazer:

1. Acesse [developers.facebook.com](https://developers.facebook.com/) e entre com a conta do Instagram/Facebook que administra o perfil do Threads.
2. Crie um app (ou use um já existente) em **Meus Apps → Criar app**, escolhendo o tipo voltado para uso com APIs do Threads.
3. Dentro do app, adicione o produto **Threads API** e siga o fluxo de autorização (login do Threads) para conceder as permissões `threads_basic` e `threads_content_publish` à conta que vai publicar.
4. Ao final do fluxo de autorização, a Meta vai te entregar um **token de acesso do Threads** (`THREADS_ACCESS_TOKEN`). Assim como o token do Instagram, ele tem validade limitada e precisa ser renovado de tempos em tempos no painel.
5. Pegue também o **ID de usuário do Threads** (`THREADS_USER_ID`) retornado nesse mesmo fluxo (ou consultando o endpoint `/me` da API com o token gerado).
6. Guarde os dois valores com cuidado e adicione no `.env` local (para testes) e em **Settings → Secrets and variables → Actions** do repositório (para produção, quando esse fluxo for ligado em um workflow).

Esse fluxo de publicação ainda não está conectado a nenhum GitHub Actions; por enquanto é só o script `post-threads.js`, disponível para rodar manualmente.

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

## Rastreamento de cliques

Hoje não existe nenhuma forma de saber se as pessoas realmente clicam no "link da bio" do Instagram (que aponta para `https://trveleo.github.io/religious/`) ou escaneiam o QR Code do Pix. Sem esse número, é impossível saber se uma doação baixa é um problema de alcance (pouca gente vendo o post) ou de conversão (gente vendo mas não clicando/doando).

`webhook-redirect/` contém um segundo Cloudflare Worker, separado do `webhook/` (aquele só responde a comentários com "amém"). Esse novo Worker funciona como um link intermediário: em vez de a bio do Instagram apontar direto para o site, ela passa a apontar para esse Worker, que conta o clique e aí sim redireciona para o destino final.

Rotas:

- `GET /bio` → soma 1 no contador do dia e redireciona para o site (`https://trveleo.github.io/religious/`).
- `GET /pix` → soma 1 no contador do dia e redireciona para a página do Pix. Hoje não existe uma página dedicada ao Pix em `docs/` (só a imagem do QR Code em `docs/assets/pix-qrcode.png`), então por enquanto `/pix` também redireciona para a home do site; isso está documentado em comentário no código (`webhook-redirect/src/index.js`) e pode ser ajustado facilmente se um dia existir uma página própria.
- Qualquer outro caminho → erro 404.

Os contadores ficam guardados num namespace do Cloudflare Workers KV (binding `CLICKS`), em chaves como `clicks:bio:2026-06-23` e `clicks:pix:2026-06-23` (um contador por dia, por tipo de clique).

### Como ativar isso (passo a passo, fora do código)

Essa parte é configuração manual na conta da Cloudflare, feita pelo dono do projeto. Não tem como o código fazer isso sozinho:

1. **Criar o namespace de KV**: dentro da pasta `webhook-redirect/`, rode `npx wrangler kv namespace create CLICKS`. A Cloudflare vai devolver um `id` (uma string longa).
2. **Colar o id no `wrangler.toml`**: abra `webhook-redirect/wrangler.toml` e substitua `"COLOQUE_O_ID_AQUI"` pelo `id` que apareceu no passo anterior.
3. **Fazer o deploy**: ainda dentro de `webhook-redirect/`, rode `npx wrangler deploy`. Isso vai publicar o Worker e mostrar a URL dele (algo como `devocional-diario-redirect.<subdomínio>.workers.dev`).
4. **Atualizar o link da bio no Instagram**: trocar o link que está na bio do perfil para apontar para `https://<url-do-worker>/bio` em vez de ir direto para `https://trveleo.github.io/religious/`. É esse link na bio que vai gerar a contagem.
5. **Gerar um token de API da Cloudflare com permissão de leitura de KV**: no painel da Cloudflare, em **Meu Perfil → Tokens de API**, criar um token com permissão de leitura ("Read") sobre Workers KV Storage. Esse token vai virar a variável `CLOUDFLARE_API_TOKEN` usada pelo script `fetch-click-stats.js` (junto com `CLOUDFLARE_ACCOUNT_ID`, o ID da conta Cloudflare, e `CLOUDFLARE_KV_NAMESPACE_ID`, o mesmo id criado no passo 1) para depois conseguir consultar quantos cliques aconteceram por dia.

Depois de tudo configurado, roda com:

```bash
npm run fetch-click-stats
```

Isso lê os contadores direto da Cloudflare e salva um resumo em `docs/output/click-stats.json`, com a contagem de cliques no bio e no Pix por dia.
