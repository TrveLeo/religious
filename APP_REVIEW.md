# Submissão para o Meta App Review

Rascunho pronto para copiar e colar no formulário de App Review do Meta for Developers, referente à permissão `instagram_manage_comments`.

## Descrição de uso (use case description)

Cole isto no campo "Detailed Description" / descrição de caso de uso:

> O Devocional Diário é um projeto pessoal, sem fins comerciais, que publica conteúdo bíblico (versículos e devocionais diários, mais alguns jogos simples) em um site estático e em um perfil do Instagram. O app automatiza duas coisas: a publicação diária do conteúdo (imagens, carrossel e reels) e uma resposta automática simples para comentários que contenham a palavra "amém" (ou variações como "amem"). Quando alguém comenta "amém" em um post, o app responde com uma mensagem curta de agradecimento, como forma de engajamento com a comunidade que acompanha o perfil. Não há coleta, armazenamento ou venda de dados pessoais dos usuários que comentam: o texto do comentário é lido apenas no momento da resposta automática, para verificar se contém a palavra-gatilho, e descartado imediatamente depois. Não existe banco de dados de comentários nem de usuários. O projeto é mantido por uma única pessoa e não tem qualquer modelo comercial associado.

## Permissões solicitadas

**`instagram_manage_comments`**

Por quê precisamos:

- **Leitura do texto do comentário**: o webhook (`webhook/src/index.js`) recebe o evento `comments` do Instagram e precisa ler o campo `value.text` para verificar se o comentário contém "amém"/"amem"/"amen" (função `normalize` + `TRIGGER_WORDS`).
- **Postar uma resposta**: quando há correspondência, o app chama `POST /{comment_id}/replies` via Graph API (função `replyToComment`) para publicar uma resposta curta de agradecimento, escolhida entre 3 variações fixas (array `REPLIES`).

Não usamos a permissão para nenhuma outra finalidade (não moderamos, não ocultamos, não apagamos comentários de terceiros).

## Roteiro de screencast (screencast script)

Roteiro passo a passo para gravar o vídeo de demonstração exigido pelo App Review. Não é o vídeo final, é o guia para quem for gravar:

1. Abrir o perfil do Instagram do projeto e mostrar que é uma conta pública, com posts de conteúdo bíblico (versículos, devocionais, jogos).
2. Abrir um post recente (carrossel do devocional do dia) e mostrar a legenda, deixando claro o tom religioso e não comercial do conteúdo.
3. A partir de uma conta de teste (Instagram Tester configurada no app), comentar nesse post usando a palavra "amém" (pode ser "Amém! 🙏" ou similar).
4. Aguardar alguns segundos e atualizar a tela de comentários do post, mostrando a resposta automática aparecendo logo abaixo do comentário com "amém".
5. Opcional, mas recomendado: abrir o painel do Cloudflare Workers (aba "Logs" do worker `devocional-diario-webhook`) e mostrar o log do evento de webhook recebido e da chamada de resposta feita à Graph API, para reforçar que o fluxo é automático e server-side.
6. Repetir o comentário com a variação "amem" (sem acento) para mostrar que a normalização de texto funciona independente de acentuação.
7. Por fim, abrir a página de Política de Privacidade do site (`https://trveleo.github.io/religious/privacy.html`) e mostrar rapidamente a seção "Integração com o Instagram", que descreve exatamente esse comportamento de resposta automática.

## Política de Privacidade

A Política de Privacidade já está no ar e publicada via GitHub Pages:

**URL: https://trveleo.github.io/religious/privacy.html**

O conteúdo da página (`docs/privacy.html`) cobre:

- O que o site e o perfil fazem (projeto pessoal, sem fins comerciais, sem cadastro ou coleta de dados de visitantes).
- Como a integração com a API do Instagram é usada: publicação automática de conteúdo e resposta automática a comentários com "amém", sem armazenar ou compartilhar dados pessoais de quem comenta (o texto só é processado no momento da resposta, não fica salvo em banco de dados).
- Que o site não usa cookies, login ou rastreamento de visitantes.
- Um e-mail de contato para dúvidas sobre a política (`diariod777@gmail.com`).

Essa URL pode ser usada diretamente no campo "Privacy Policy URL" do formulário do App Review.
