// Banco de versículos e devocionais. Adicione mais entradas livremente.
const DEVOTIONALS = [
  {
    verse: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    ref: "Jeremias 29:11",
    title: "Um futuro de esperança",
    text: "Deus conhece cada detalhe do nosso caminho. Mesmo quando não entendemos o presente, podemos confiar que Ele tem planos de bem para nós. Hoje, descanse na certeza de que você não caminha sozinho."
  },
  {
    verse: "Tudo posso naquele que me fortalece.",
    ref: "Filipenses 4:13",
    title: "Força além da nossa",
    text: "Nossas forças têm limite, mas a força de Deus não. Quando sentir que não vai conseguir, lembre-se de que a capacidade vem Dele, não de nós mesmos."
  },
  {
    verse: "O Senhor é o meu pastor, nada me faltará.",
    ref: "Salmos 23:1",
    title: "Provisão e cuidado",
    text: "Como um pastor cuida de suas ovelhas, Deus cuida de cada necessidade nossa. Confie que Ele provê no tempo certo, mesmo quando o caminho parece incerto."
  },
  {
    verse: "Confia no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.",
    ref: "Provérbios 3:5",
    title: "Confiança plena",
    text: "Nossa lógica é limitada, mas a sabedoria de Deus é infinita. Entregar o controle a Ele não é fraqueza, é sabedoria."
  },
  {
    verse: "Não andem ansiosos por coisa alguma; em tudo, porém, mediante oração e súplicas, com ações de graças, apresentem seus pedidos a Deus.",
    ref: "Filipenses 4:6",
    title: "Antídoto para a ansiedade",
    text: "A ansiedade cresce quando carregamos tudo sozinhos. Oração é o convite para entregar nossas cargas a quem realmente pode sustentá-las."
  },
  {
    verse: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    ref: "Mateus 11:28",
    title: "Descanso para a alma",
    text: "Jesus não pede que cheguemos perfeitos. Ele pede que cheguemos cansados, como estamos, para encontrarmos alívio Nele."
  },
  {
    verse: "Sede fortes e corajosos; não temas, nem te espantes, porque o Senhor teu Deus é contigo.",
    ref: "Josué 1:9",
    title: "Coragem para avançar",
    text: "O medo paralisa, mas a presença de Deus nos move adiante. Você não enfrenta os desafios de hoje sozinho."
  },
  {
    verse: "E sabemos que Deus faz todas as coisas cooperarem para o bem daqueles que o amam.",
    ref: "Romanos 8:28",
    title: "Propósito nas dificuldades",
    text: "Mesmo as situações mais difíceis podem ser usadas por Deus para um bem maior. Isso não diminui a dor, mas dá sentido à espera."
  },
  {
    verse: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
    ref: "Salmos 119:105",
    title: "Direção clara",
    text: "Quando o caminho parece escuro, a Palavra de Deus ilumina o próximo passo — não necessariamente todo o trajeto, mas o suficiente para seguirmos com fé."
  },
  {
    verse: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias.",
    ref: "Isaías 40:31",
    title: "Renovação na espera",
    text: "Esperar em Deus não é perda de tempo, é processo de renovação. Enquanto aguardamos, Ele nos fortalece para o que vem."
  },
  {
    verse: "O Senhor é a minha luz e a minha salvação; a quem temerei?",
    ref: "Salmos 27:1",
    title: "Sem espaço para o medo",
    text: "Quando Deus é nossa luz, as sombras perdem o poder de nos paralisar. Caminhe hoje com a confiança de quem sabe a quem pertence."
  },
  {
    verse: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.",
    ref: "1 Pedro 5:7",
    title: "Cuidado genuíno",
    text: "Deus não apenas tolera nossas preocupações, Ele as recebe com cuidado. Não há peso pequeno demais ou grande demais para Ele."
  },
  {
    verse: "Bem-aventurados os limpos de coração, porque eles verão a Deus.",
    ref: "Mateus 5:8",
    title: "Pureza de coração",
    text: "Mais do que aparências, Deus observa as intenções do coração. Busque hoje a sinceridade diante Dele, mesmo nas pequenas escolhas."
  },
  {
    verse: "Posso eu fazer alguma coisa de mim mesmo? Não, mas o Pai que está em mim, esse faz as obras.",
    ref: "João 14:10 (paráfrase)",
    title: "Dependência saudável",
    text: "Reconhecer nossa limitação não é fracasso, é abrir espaço para que Deus atue através de nós."
  },
  {
    verse: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.",
    ref: "Filipenses 4:4",
    title: "Alegria que não depende das circunstâncias",
    text: "A alegria do Senhor não nasce de tudo estar bem, mas de sabermos que Ele está no controle, independente do cenário."
  },
  {
    verse: "Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    ref: "Mateus 6:33",
    title: "Prioridades certas",
    text: "Quando colocamos Deus em primeiro lugar, as demais áreas da vida encontram seu devido lugar e medida."
  },
  {
    verse: "O Senhor é bom para os que esperam por ele, para a alma que o busca.",
    ref: "Lamentações 3:25",
    title: "Bondade na espera",
    text: "Buscar a Deus não é garantia de respostas imediatas, mas é certeza de que Sua bondade acompanha cada etapa da espera."
  },
  {
    verse: "Não vos vingueis a vós mesmos, amados, mas dai lugar à ira de Deus.",
    ref: "Romanos 12:19",
    title: "Liberdade do ressentimento",
    text: "Soltar a necessidade de vingança não é fraqueza, é confiar que a justiça de Deus é mais certa do que a nossa."
  },
  {
    verse: "Disse-lhes Jesus: Eu sou o caminho, e a verdade, e a vida.",
    ref: "João 14:6",
    title: "Um caminho certo",
    text: "Em meio a tantas direções possíveis, Jesus se apresenta como o caminho seguro. Seguir Nele é nunca caminhar perdido."
  },
  {
    verse: "Graças a Deus pelo seu dom inefável!",
    ref: "2 Coríntios 9:15",
    title: "Gratidão diária",
    text: "Antes de pedir, pare para agradecer. A gratidão muda a forma como vemos o dia que começa."
  },
  {
    verse: "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei e abrir-se-vos-á.",
    ref: "Mateus 7:7",
    title: "Persistência na oração",
    text: "Deus convida à persistência. Pedir, buscar e bater não são sinais de fé fraca, mas de confiança que continua."
  },
  {
    verse: "Como o cervo brama pelas correntes das águas, assim suspira a minha alma por ti, ó Deus.",
    ref: "Salmos 42:1",
    title: "Sede da alma",
    text: "Há uma sede que nada deste mundo satisfaz plenamente. Reserve hoje um tempo só para buscar a presença de Deus."
  },
  {
    verse: "Tudo quanto fizerdes, fazei-o de coração, como ao Senhor, e não como aos homens.",
    ref: "Colossenses 3:23",
    title: "Excelência com propósito",
    text: "Trabalhar com excelência não é para agradar pessoas, mas como expressão de gratidão e adoração a Deus."
  },
  {
    verse: "O coração do homem traça o seu caminho, mas o Senhor lhe dirige os passos.",
    ref: "Provérbios 16:9",
    title: "Planos e direção",
    text: "Podemos planejar, mas é Deus quem ordena os passos. Planeje com fé, e siga com flexibilidade para a direção Dele."
  },
  {
    verse: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo.",
    ref: "Salmos 23:4",
    title: "Companhia nos vales",
    text: "Os vales da vida não são evitáveis, mas não precisam ser enfrentados sozinhos. A presença de Deus transforma o medo em coragem."
  },
  {
    verse: "Amados, amemo-nos uns aos outros, porque o amor é de Deus.",
    ref: "1 João 4:7",
    title: "Amor que reflete a Deus",
    text: "Amar verdadeiramente é refletir a própria natureza de Deus. Cada gesto de amor genuíno é também um testemunho Dele."
  },
  {
    verse: "Não retires de mim o teu Espírito Santo.",
    ref: "Salmos 51:11",
    title: "Dependência do Espírito",
    text: "Nossa força para viver bem não vem de disciplina apenas, mas da presença constante do Espírito de Deus em nós."
  },
  {
    verse: "Tu me cingiste de força para a guerra; fizeste abaterem-se debaixo de mim os que se levantam contra mim.",
    ref: "Salmos 18:39",
    title: "Equipados para a batalha",
    text: "As lutas diárias não nos pegam desequipados quando caminhamos com Deus. Ele prepara antes de permitir o enfrentamento."
  },
  {
    verse: "E conhecereis a verdade, e a verdade vos libertará.",
    ref: "João 8:32",
    title: "Liberdade pela verdade",
    text: "Viver na verdade, mesmo quando dolorosa, é o caminho para a verdadeira liberdade. Mentiras prendem; a verdade liberta."
  },
  {
    verse: "Mas buscai primeiro o seu reino, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    ref: "Lucas 12:31",
    title: "O essencial em primeiro lugar",
    text: "Quando as prioridades estão certas, as preocupações secundárias encontram seu devido tamanho."
  },
  {
    verse: "Disse Deus: Não é bom que o homem esteja só.",
    ref: "Gênesis 2:18",
    title: "Feitos para comunidade",
    text: "Desde o princípio, Deus projetou-nos para viver em comunhão. Buscar e cultivar relacionamentos saudáveis é parte do propósito Dele."
  }
];
