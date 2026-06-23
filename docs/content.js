// Banco de versículos e devocionais. Adicione mais entradas livremente.
const DEVOTIONALS = [
  {
    verse: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    ref: "Jeremias 29:11",
    title: "Um futuro de esperança",
    text: "Esse versículo foi escrito num momento de exílio, quando o povo de Israel vivia longe de casa e sem saber bem o que viria depois. Mesmo ali, Deus disse que tinha planos para eles, e não eram planos de destruição, e sim de paz.\n\nA gente costuma confundir o silêncio de Deus com ausência, e a demora com esquecimento. Mas talvez seja útil pensar diferente: o tempo de espera raramente é vazio. É mais um tempo de preparação que a gente só entende depois.\n\nSe você está num momento de incerteza hoje, vale lembrar que pensar em você não é algo pontual para Deus. Ele já está pensando no seu hoje e no que vem depois. Pode seguir com a confiança de quem sabe que essa história ainda não terminou."
  },
  {
    verse: "Tudo posso naquele que me fortalece.",
    ref: "Filipenses 4:13",
    title: "Força além da nossa",
    text: "Paulo escreveu essa frase na prisão, não num momento confortável ou de vitória. Isso muda bastante o peso do versículo: a força de que ele fala não depende de tudo estar bem.\n\nUsamos muito esse texto como motivação para conquistar coisas, mas o contexto original fala de contentamento em qualquer situação, tanto na escassez quanto na abundância. A força real não é a que garante vencer sempre, é a que sustenta mesmo quando a gente perde.\n\nQuando sentir que não dá mais, lembre que essa nunca foi a proposta. A promessa é que, naquele que nos fortalece, encontramos uma capacidade que não é nossa por natureza. Pode se apoiar Nele hoje, sem culpa por estar cansado."
  },
  {
    verse: "O Senhor é o meu pastor, nada me faltará.",
    ref: "Salmos 23:1",
    title: "Provisão e cuidado",
    text: "Davi escreveu esse salmo depois de já ter sido pastor de ovelhas, então ele sabia bem o que esse cuidado significava na prática. Guiar, proteger, alimentar e defender, mesmo quando as ovelhas nem percebem o perigo.\n\nDizer 'nada me faltará' não é prometer que tudo será fácil, é confiar que o necessário será suprido. As ovelhas não escolhem o caminho, elas confiam em quem as guia. Tem uma rendição boa nisso.\n\nSe hoje você está mais preocupado com o que falta, tente olhar um pouco para o que já recebeu até aqui. Provavelmente vai notar um padrão de cuidado que vem de antes de você mesmo perceber."
  },
  {
    verse: "Confia no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.",
    ref: "Provérbios 3:5",
    title: "Confiança plena",
    text: "Provérbios foi escrito como instrução prática para a vida, não como teoria distante. E esse versículo incomoda justamente porque pede algo contra nosso instinto: duvidar do próprio raciocínio.\n\nIsso não quer dizer abandonar a razão, mas reconhecer que ela tem limite. Nosso entendimento se forma com informação parcial, emoção do momento e experiências passadas, sempre incompletas. O conhecimento de Deus sobre nossa vida é completo.\n\nConfiar de todo coração é diferente de confiar com reserva. É entregar até a parte que insiste em controlar o resultado. Hoje, tente entregar uma decisão que você tem tentado resolver só na sua cabeça, não porque não consegue, mas como exercício de fé."
  },
  {
    verse: "Não andem ansiosos por coisa alguma; em tudo, porém, mediante oração e súplicas, com ações de graças, apresentem seus pedidos a Deus.",
    ref: "Filipenses 4:6",
    title: "Antídoto para a ansiedade",
    text: "O texto não diz que não teremos motivo para ansiedade, diz para não morarmos nela. Ansiedade é reação natural diante do desconhecido, o problema é quando ela se instala como casa.\n\nO caminho que Paulo propõe não é negar o problema, é orar com pedido específico, não só uma preocupação vaga jogada para o ar. Tem algo que ajuda em nomear exatamente o que aflige, em vez de carregar como peso sem forma.\n\nE um detalhe importante: a gratidão deve vir junto com o pedido, não esperar a resposta chegar primeiro. Agradecer no meio da incerteza é fé antecipando o cuidado. Tente hoje transformar uma preocupação solta num pedido concreto, falado ou escrito."
  },
  {
    verse: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    ref: "Mateus 11:28",
    title: "Descanso para a alma",
    text: "Jesus disse isso a uma multidão cansada de tentar cumprir regras religiosas impossíveis só para se sentir aceita por Deus.\n\nO convite não exige desempenho antes. Não é 'venham os que já resolveram a vida', é 'venham os cansados e oprimidos' exatamente como estão. Isso inverte a ideia de que precisamos nos arrumar antes de chegar perto de Deus.\n\nO descanso que Ele oferece não é deixar de trabalhar, é alívio do peso de carregar tudo por conta própria. Hoje, pense no que está pesando mais sobre você, e leve isso a Ele sem disfarçar, do jeito que está."
  },
  {
    verse: "Sede fortes e corajosos; não temas, nem te espantes, porque o Senhor teu Deus é contigo.",
    ref: "Josué 1:9",
    title: "Coragem para avançar",
    text: "Essas palavras foram ditas a Josué quando ele assumiu a liderança de todo um povo, logo depois da morte de Moisés. Era uma tarefa enorme, com riscos reais: guerra, território desconhecido, expectativa alta de todo lado.\n\nA coragem aqui não nasce da ausência de medo, nasce da presença de companhia. O texto não promete que não haverá motivo para temer, promete que Deus vai estar ali junto com o motivo.\n\nCoragem, na Bíblia, não é negar o risco, é decidir avançar mesmo com ele, porque você não está sozinho nisso. Se tem algo que você tem evitado por medo, vale perguntar: o que mudaria se você de fato acreditasse que não vai enfrentar isso sozinho?"
  },
  {
    verse: "E sabemos que Deus faz todas as coisas cooperarem para o bem daqueles que o amam.",
    ref: "Romanos 8:28",
    title: "Propósito nas dificuldades",
    text: "Esse versículo costuma ser citado fora de contexto, como se garantisse que tudo vai terminar bem nos nossos termos. Mas o capítulo inteiro fala de sofrimento real, de gemido, de uma criação esperando ser libertada.\n\n'Cooperar para o bem' não significa que cada coisa isolada é boa, significa que Deus vai tecendo, com o tempo, um propósito maior mesmo através das coisas dolorosas. Isso pede uma visão de longo prazo que a gente raramente tem no meio da dor.\n\nNão é resposta fácil para o sofrimento, é promessa de sentido que ainda vai aparecer. Se você está vivendo algo que não faz sentido agora, talvez ainda não seja a hora de entender, só de confiar que o processo continua."
  },
  {
    verse: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
    ref: "Salmos 119:105",
    title: "Direção clara",
    text: "Uma lâmpada antiga iluminava só alguns passos na frente, não o caminho inteiro até o destino. Essa imagem é proposital: a Palavra de Deus normalmente não mostra o futuro distante, orienta a decisão de agora.\n\nIsso explica por que muitas vezes não recebemos resposta para perguntas grandes, como o que vamos fazer nos próximos cinco anos, mas encontramos clareza suficiente para o próximo passo certo.\n\nSe você está esperando ver o caminho todo antes de andar, talvez esteja pedindo mais luz do que precisa hoje. Pergunte: qual é o próximo passo visível, mesmo que o resto ainda esteja no escuro?"
  },
  {
    verse: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias.",
    ref: "Isaías 40:31",
    title: "Renovação na espera",
    text: "O contexto desse versículo é um povo exausto, se perguntando se Deus ainda os via. A resposta de Isaías não é uma explicação filosófica, é uma promessa prática: esperar em Deus, de forma ativa, renova.\n\nVale notar a progressão da imagem: voar como águia, depois correr, depois andar sem cansar. A vida pede fôlego para os três ritmos, momentos de grande impulso, momentos de esforço constante e momentos de só continuar andando.\n\nEsperar no Senhor não é ficar parado, é uma postura de confiança que vai reabastecendo. Se você está numa fase de só 'andar sem cansar', isso também é vitória, e também é renovação."
  },
  {
    verse: "O Senhor é a minha luz e a minha salvação; a quem temerei?",
    ref: "Salmos 27:1",
    title: "Sem espaço para o medo",
    text: "Davi escreveu esse salmo provavelmente num período de perseguição real, não de ansiedade vaga. Havia inimigo concreto, ameaça concreta, e ainda assim a pergunta fica no ar: a quem temerei?\n\nIsso não é negar que o perigo existe, é reordenar prioridades: o que Deus representa pesa mais do que a ameaça presente. Luz, na Bíblia, costuma significar orientação e proteção no meio da escuridão, não a escuridão deixando de existir.\n\nHoje, pense no que mais tem causado medo em você, e tente colocar essa ameaça do lado da grandeza de quem você serve. A pergunta não é se o medo é real, é se ele é maior do que Deus."
  },
  {
    verse: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.",
    ref: "1 Pedro 5:7",
    title: "Cuidado genuíno",
    text: "Pedro escreve essa carta para cristãos perseguidos, vivendo sob pressão real. A ideia de 'lançar' sugere um gesto completo, não uma entrega parcial ou cheia de hesitação.\n\nO motivo dado não é 'porque você é forte o bastante para superar', é 'porque ele tem cuidado de vocês'. A base da entrega não está na nossa capacidade de soltar, está no caráter de quem recebe.\n\nÀs vezes seguramos a ansiedade porque, no fundo, duvidamos que alguém vá cuidar dela tão bem quanto a gente mesmo cuidaria. Esse versículo questiona essa crença. Hoje, escolha de propósito lançar uma preocupação específica, não porque ela desapareceu, mas porque agora ela pertence a outras mãos."
  },
  {
    verse: "Bem-aventurados os limpos de coração, porque eles verão a Deus.",
    ref: "Mateus 5:8",
    title: "Pureza de coração",
    text: "Esse versículo é parte do Sermão do Monte, onde Jesus redefine o que é ser bem-aventurado. Não é riqueza ou poder, são qualidades internas que o mundo geralmente não valoriza tanto.\n\n'Coração', na linguagem bíblica, não se refere só a sentimento, mas ao conjunto de intenções, vontade e caráter. Pureza de coração, então, não é perfeição emocional, é integridade na motivação. Fazer o certo pelo motivo certo, não pela aparência.\n\nA recompensa prometida, 'ver a Deus', sugere uma proximidade que se perde quando vivemos com intenção dupla. Hoje, observe não só suas ações, mas o porquê por trás delas. É ali que a pureza de coração realmente é testada."
  },
  {
    verse: "Posso eu fazer alguma coisa de mim mesmo? Não, mas o Pai que está em mim, esse faz as obras.",
    ref: "João 14:10 (paráfrase)",
    title: "Dependência saudável",
    text: "Jesus disse isso explicando sua relação com o Pai, uma dependência total, não como limitação, mas como fonte da sua autoridade e das suas obras. Se o próprio Filho de Deus vivia em dependência, isso diz algo sobre o modelo que somos chamados a seguir.\n\nNossa cultura valoriza muito a autossuficiência, mas a espiritualidade bíblica propõe o contrário: reconhecer que nossa capacidade real vem de uma fonte maior não é fraqueza, é estar alinhado com a verdade.\n\nIsso não tira esforço nem responsabilidade, só reposiciona de onde vem a força para exercer os dois. Hoje, antes de tentar resolver algo só com esforço próprio, pare e reconheça: o que estou tentando fazer sem reconhecer que dependo de Deus?"
  },
  {
    verse: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.",
    ref: "Filipenses 4:4",
    title: "Alegria que não depende das circunstâncias",
    text: "Esse versículo, igual ao de Filipenses 4:13, vem de uma carta escrita na prisão. Paulo não estava num momento de liberdade ou conforto, e ainda assim repete o chamado à alegria, de propósito, duas vezes.\n\nIsso sugere que a alegria bíblica não é sinônimo de felicidade por causa da circunstância, é uma disposição enraizada em algo estável: a relação com Deus, que não muda com o cenário de fora.\n\nNão é negar a dor nem fingir que tudo está bem. É decidir ancorar a alegria em algo que as circunstâncias não controlam. Hoje, tente nomear um motivo de alegria que não depende de nada estar resolvido."
  },
  {
    verse: "Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    ref: "Mateus 6:33",
    title: "Prioridades certas",
    text: "No contexto, Jesus falava sobre ansiedade com comida, roupa e necessidades básicas, preocupações bem concretas, não algo espiritual e distante. A resposta dele não é 'pare de se preocupar', é 'reordene suas prioridades'.\n\n'Buscar primeiro' implica uma ordem, não exclusividade. As outras coisas continuam importantes, só deixam de ser o centro. Quando o reino de Deus ocupa o primeiro lugar, o resto se ajusta, não desaparece.\n\nIsso é prático, não só teológico: as decisões de tempo, dinheiro e energia mostram o que a gente realmente busca primeiro. Hoje, olhe sua agenda e seus gastos como um espelho honesto das suas prioridades reais."
  },
  {
    verse: "O Senhor é bom para os que esperam por ele, para a alma que o busca.",
    ref: "Lamentações 3:25",
    title: "Bondade na espera",
    text: "Lamentações é, como o nome já diz, um livro de lamento, escrito no meio da destruição de Jerusalém. É notável que, mesmo nesse contexto de perda profunda, o autor consegue afirmar a bondade de Deus.\n\nIsso ensina algo sobre fé madura: ela não depende das circunstâncias confirmarem logo a bondade de Deus. A afirmação vem antes da resolução, não depois.\n\n'Esperar' e 'buscar' aqui são posturas ativas, não resignação passiva. Buscar a Deus no meio da dor já é, em si, um ato de esperança. Se você está numa fase de lamento, talvez a bondade de Deus ainda não esteja visível nas circunstâncias, mas pode ser declarada antes de ser vista."
  },
  {
    verse: "Não vos vingueis a vós mesmos, amados, mas dai lugar à ira de Deus.",
    ref: "Romanos 12:19",
    title: "Liberdade do ressentimento",
    text: "Paulo escreve isso numa parte sobre como viver em comunidade, principalmente diante de injustiças sofridas. A instrução não nega a dor causada por outros, mas muda o destino da resposta a ela.\n\n'Dar lugar à ira de Deus' não significa esperar que Deus puna com violência, significa confiar que existe uma justiça maior do que a que a gente consegue fazer com as próprias mãos. Vingança pessoal costuma alimentar o ciclo de dor, confiar na justiça de Deus permite soltar.\n\nIsso é mais difícil do que parece, porque a vingança às vezes parece a única forma de restaurar o senso de justiça. Hoje, se há alguém que você guarda ressentimento, pergunte: o que mudaria se eu confiasse que essa conta não precisa ser fechada por mim?"
  },
  {
    verse: "Disse-lhes Jesus: Eu sou o caminho, e a verdade, e a vida.",
    ref: "João 14:6",
    title: "Um caminho certo",
    text: "Jesus disse isso aos discípulos pouco antes de ser preso, num momento em que eles estavam confusos e ansiosos sobre o futuro, sem saber para onde Ele ia, nem como chegar lá.\n\nA resposta de Jesus não é um mapa detalhado, é uma identidade: Ele mesmo é o caminho. Isso muda a pergunta de 'qual é a direção certa' para 'em quem estou seguindo'.\n\nA gente costuma buscar certeza sobre o destino antes de dar o próximo passo. Mas a proposta bíblica é o contrário: seguir a pessoa certa garante o caminho certo, mesmo quando o destino ainda não está claro. Hoje, em vez de exigir clareza total sobre o futuro, pergunte se você está seguindo na direção certa."
  },
  {
    verse: "Graças a Deus pelo seu dom inefável!",
    ref: "2 Coríntios 9:15",
    title: "Gratidão diária",
    text: "Esse versículo encerra uma passagem sobre generosidade e doação na igreja primitiva. Paulo liga a generosidade humana a uma generosidade maior, a de Deus, que ele descreve como inefável, impossível de explicar totalmente em palavras.\n\nIsso sugere que a gratidão verdadeira nem sempre cabe em frases prontas. Às vezes, a resposta mais honesta diante da bondade de Deus é só reconhecer que ela passa do que conseguimos colocar em palavras.\n\nGratidão praticada com frequência muda como a gente vê o dia a dia, a gente passa a notar o que antes parecia invisível. Hoje, em vez de pedir algo, tente só nomear, baixinho ou em voz alta, algo bom que você normalmente nem agradece, por achar que é só o normal."
  },
  {
    verse: "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei e abrir-se-vos-á.",
    ref: "Mateus 7:7",
    title: "Persistência na oração",
    text: "O verbo original sugere continuidade: continuem pedindo, continuem buscando, continuem batendo. Não é um pedido único e pontual, é uma postura mantida com o tempo.\n\nIsso muda como entendemos a oração sem resposta imediata. Talvez não seja uma negação, e sim um processo ainda em andamento que pede persistência.\n\nA imagem de bater à porta também sugere relacionamento. Ninguém bate à porta de um desconhecido com a mesma expectativa de quem bate na porta de alguém que ama. Hoje, em vez de desistir de um pedido antigo, tente pensar nele como uma conversa contínua, não como algo já encerrado."
  },
  {
    verse: "Como o cervo brama pelas correntes das águas, assim suspira a minha alma por ti, ó Deus.",
    ref: "Salmos 42:1",
    title: "Sede da alma",
    text: "A imagem do cervo com sede, buscando água em terreno seco, é usada pelo salmista para descrever um estado interior de desespero espiritual, provavelmente escrito num período de exílio ou afastamento do templo.\n\nÉ uma confissão de necessidade, não de força. O salmista não descreve uma busca tranquila e organizada por Deus, mas uma urgência quase física, parecida com sede extrema.\n\nIsso ajuda a validar momentos de aridez espiritual, quando Deus parece distante e a alma sente falta de algo sem conseguir nomear bem o que é. Hoje, se você reconhece essa sede em si mesmo, não ignore. Pode ser, ao contrário do que parece, sinal de uma fé viva, não morta."
  },
  {
    verse: "Tudo quanto fizerdes, fazei-o de coração, como ao Senhor, e não como aos homens.",
    ref: "Colossenses 3:23",
    title: "Excelência com propósito",
    text: "Paulo escreve isso dentro de instruções para servos da época, pessoas em situação de trabalho forçado, sem escolha sobre suas tarefas. É marcante que, mesmo num contexto de injustiça estrutural, ele encontre uma forma de dar dignidade ao trabalho.\n\nA ideia não é trabalhar bem para impressionar chefe, é reorientar a motivação para algo maior do que a aprovação humana. Isso liberta o trabalho do peso de agradar pessoas que talvez nunca reconheçam o esforço.\n\nSe seu trabalho hoje parece invisível ou pouco valorizado, esse versículo oferece outra forma de ver: o reconhecimento que importa de verdade não depende de quem está olhando agora. Hoje, escolha uma tarefa rotineira e faça ela como ato de adoração, não só obrigação."
  },
  {
    verse: "O coração do homem traça o seu caminho, mas o Senhor lhe dirige os passos.",
    ref: "Provérbios 16:9",
    title: "Planos e direção",
    text: "Esse provérbio não desencoraja o planejamento, ele reconhece que planejar é natural e esperado. O que ele acrescenta é uma segunda camada: por mais que a gente planeje, existe uma direção maior agindo além do nosso controle total.\n\nIsso não é fatalismo, é uma convivência entre responsabilidade e confiança. A gente planeja com seriedade, mas mantém espaço para que os passos sejam ajustados.\n\nMuita frustração nasce quando tratamos nossos planos como garantia, em vez de intenção sujeita a mudança. Hoje, ao revisar seus planos, pergunte: estou disposto a deixar que os passos sejam reordenados, mesmo que isso signifique desvio da rota que tracei?"
  },
  {
    verse: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo.",
    ref: "Salmos 23:4",
    title: "Companhia nos vales",
    text: "Vale notar que o salmo não promete a ausência do vale, ele já assume que o vale vai existir. A frase começa com 'ainda que', reconhecendo a dificuldade extrema, não negando ela.\n\nO que muda a experiência do vale não é a remoção dele, é a presença de companhia ali dentro. 'Tu estás comigo' é a virada do versículo. O vale continua sombrio, mas deixa de ser solitário.\n\nIsso é consolo realista, não otimismo ingênuo. Hoje, se você está atravessando um vale de verdade, talvez a pergunta certa não seja 'quando isso vai acabar', e sim 'que sinais de companhia eu consigo reconhecer mesmo aqui dentro'."
  },
  {
    verse: "Amados, amemo-nos uns aos outros, porque o amor é de Deus.",
    ref: "1 João 4:7",
    title: "Amor que reflete a Deus",
    text: "João escreve essa carta para uma comunidade enfrentando divisões internas, onde a sinceridade da fé estava sendo questionada por causa de comportamentos contraditórios. A resposta dele não é doutrinária, é relacional: amem.\n\nA lógica do versículo importa: amar uns aos outros não é só um mandamento moral isolado, é consequência natural de conhecer de onde vem o amor. Se o amor vem de Deus, amar de verdade já é, de certa forma, prova de proximidade com Ele.\n\nIsso eleva o padrão: não é sobre simpatia ou afinidade natural, é sobre um amor que nasce de algo maior do que preferência pessoal. Hoje, pense em alguém com quem a convivência é difícil, e pense no que significaria amar essa pessoa como reflexo, não como sentimento espontâneo."
  },
  {
    verse: "Não retires de mim o teu Espírito Santo.",
    ref: "Salmos 51:11",
    title: "Dependência do Espírito",
    text: "Esse salmo foi escrito por Davi depois de um pecado grave, num momento de arrependimento profundo. O pedido não é só por perdão, é por permanência. Ele teme a possibilidade de viver sem a presença do Espírito.\n\nIsso mostra uma compreensão madura: Davi não confia na própria capacidade de se manter íntegro sozinho. Ele já tinha vivido o suficiente para saber que sua força moral, por si só, falha.\n\nNossa cultura valoriza disciplina e força de vontade como solução completa, mas a oração de Davi sugere algo diferente: transformação real de caráter depende de presença contínua, não só de esforço. Hoje, em vez de prometer fazer melhor por conta própria, peça presença renovada."
  },
  {
    verse: "Tu me cingiste de força para a guerra; fizeste abaterem-se debaixo de mim os que se levantam contra mim.",
    ref: "Salmos 18:39",
    title: "Equipados para a batalha",
    text: "Esse salmo é de Davi, num contexto de libertação militar real, não uma metáfora vaga, mas um relato de proteção concreta no meio de conflitos sérios.\n\nA frase 'tu me cingiste' descreve uma preparação anterior à batalha, não uma intervenção só no momento do conflito. Isso sugere que o preparo para enfrentar dificuldades muitas vezes é construído antes da gente perceber que vai precisar dele.\n\nOlhando para trás, é comum notar que recursos internos, como paciência, discernimento, resiliência, foram formados em períodos anteriores, sem propósito aparente naquele momento. Hoje, talvez você esteja sendo preparado para algo que ainda não enfrenta, e isso é parte do cuidado, não acaso."
  },
  {
    verse: "E conhecereis a verdade, e a verdade vos libertará.",
    ref: "João 8:32",
    title: "Liberdade pela verdade",
    text: "Jesus disse isso a pessoas que já se consideravam livres por herança religiosa, e reagiram com indignação à ideia de precisarem de liberdade. Isso mostra que a escravidão de que Ele falava não era física, era interior. Padrões de pensamento, negação, autoengano.\n\nA verdade que liberta muitas vezes incomoda antes de aliviar. Reconhecer uma realidade difícil, sobre si mesmo, sobre uma situação, sobre um relacionamento, costuma doer antes de trazer alívio.\n\nEvitar a verdade por medo do desconforto imediato só prolonga uma prisão silenciosa. Hoje, pergunte: existe alguma verdade que tenho evitado encarar só porque seria mais confortável continuar na mentira confortável?"
  },
  {
    verse: "Mas buscai primeiro o seu reino, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    ref: "Lucas 12:31",
    title: "O essencial em primeiro lugar",
    text: "Esse versículo aparece num discurso de Jesus sobre os pássaros e os lírios, que não trabalham nem fiam, mas são sustentados. O argumento não é contra o trabalho, é contra a ansiedade desproporcional sobre sobrevivência.\n\nA promessa de acrescentar sugere abundância como consequência, não como objetivo principal. Quando o reino de Deus ocupa o centro, as outras necessidades se ajustam de forma mais ordenada, não necessariamente mais fácil, mas mais ordenada.\n\nIsso desafia a ideia de que segurança vem primeiro do acúmulo e do planejamento, e só depois da fé. Hoje, observe: o que você está priorizando primeiro na prática, mesmo que diga acreditar em outra ordem?"
  },
  {
    verse: "Disse Deus: Não é bom que o homem esteja só.",
    ref: "Gênesis 2:18",
    title: "Feitos para comunidade",
    text: "Essa frase aparece logo depois da criação do homem, num contexto onde tudo que Deus tinha feito até então é chamado de bom. A solidão é a primeira coisa explicitamente chamada de 'não boa' nas Escrituras.\n\nIsso diz bastante: desde o começo, a comunhão não aparece como opcional ou secundária, é parte do projeto original de Deus para a humanidade. A gente não foi feito para autossuficiência relacional.\n\nEm uma cultura que costuma elogiar a independência, esse versículo lembra o contrário: buscar e cuidar de relacionamentos saudáveis não é fraqueza ou carência, é estar alinhado com o propósito original. Hoje, pense em investir tempo de verdade numa conexão que tem sido deixada de lado."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEVOTIONALS;
}
