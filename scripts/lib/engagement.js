const HOOKS = [
  'Você já passou por um dia em que nada parecia fazer sentido?',
  'Tem alguma coisa pesando sobre você hoje?',
  'Já se pegou pensando que está enfrentando tudo sozinho?',
  'Alguma vez você já duvidou se Deus ainda estava prestando atenção em você?',
  'Hoje é daqueles dias que parecem maiores que sua fé?',
  'Já sentiu que precisava de um sinal pra continuar?',
  'Tem algo que você tem evitado encarar de frente?',
  'Já se perguntou se está esperando demais por uma resposta?'
];

const CTAS = [
  'Salva esse post pra reler quando precisar.',
  'Comenta aqui qual parte fez mais sentido pra você hoje.',
  'Manda esse post pra alguém que precisa ler isso agora.',
  'Se identificou? Deixa um "amém" nos comentários.',
  'Compartilha nos stories se isso tocou em você.',
  'Marca alguém que precisa ouvir essa palavra hoje.'
];

// Pergunta de baixo atrito: binária, escala emoji, ou fill-in-the-blank.
// Não exige reflexão longa — qualquer pessoa responde em 3 segundos.
const COMMENT_BAIT = [
  'Você ora mais de manhã ou à noite? Comenta aqui 👇',
  'Como está sua fé hoje? 🔥 forte / 🌱 crescendo / 🌧️ precisando de chuva',
  'Quando estou fraco, eu ____. Completa nos comentários.',
  'Deus já surpreendeu você essa semana? Conta aqui 👇',
  'Qual palavra nessa passagem mais falou com você hoje? Comenta.',
  'Dá pra marcar alguém que precisa dessa palavra agora? 👇',
  'Do que você está precisando que Deus cuide? Comenta uma palavra.'
];

// Âncora em situação concreta, não em "reler depois" genérico.
// Save acontece quando a pessoa visualiza o momento futuro em que vai precisar.
const SAVE_BAIT = [
  'Salva pra ter por perto quando a ansiedade apertar. 🔖',
  'Guarda esse post pra aquela madrugada difícil. 🔖',
  'Salva: você vai querer ter isso por perto na hora da decisão. 🔖',
  'Salva pra compartilhar com alguém que está passando por isso. 🔖',
  'Guarda aqui. É pra quando a fé tremer. 🔖'
];

// Um único pedido forte por post, rotacionando entre os três sinais que o
// algoritmo mais valoriza (save > share > comment > like). O tipo é
// determinístico pela data — o relatório semanal cruza pedido x resultado.
// 9 variantes (3 por tipo) dão mais diversidade sem quebrar a proporção.
const CTA_VARIANTS = [
  { type: 'save',    text: 'Salva esse post. Da próxima vez que a ansiedade apertar, você vai querer reler isso. 🔖' },
  { type: 'comment', text: 'Você ora mais de manhã ou à noite? Comenta aqui 👇' },
  { type: 'share',   text: 'Manda esse post no WhatsApp pra alguém que está passando por algo difícil agora. 💬' },
  { type: 'save',    text: 'Salva pra ter por perto quando a fé tremer. 🔖' },
  { type: 'comment', text: 'Como está sua fé hoje? 🔥 forte / 🌱 crescendo / 🌧️ precisando de chuva. Comenta.' },
  { type: 'share',   text: 'Pensa em alguém que está enfrentando algo difícil. Encaminha isso pra essa pessoa agora. 💬' },
  { type: 'save',    text: 'Guarda esse post: é pra quando vier aquela madrugada difícil. 🔖' },
  { type: 'comment', text: 'Quando estou fraco, eu ____. Completa essa frase nos comentários. 👇' },
  { type: 'share',   text: 'Tem alguém no grupo do WhatsApp que precisa ler isso hoje? Encaminha pra eles. 💬' }
];

function pickByDay(list, dayIndex) {
  return list[dayIndex % list.length];
}

// Retorna { type, text } — use .text na legenda/arte e .type pra A/B no relatório.
function pickCtaVariant(dayIndex) {
  return CTA_VARIANTS[dayIndex % CTA_VARIANTS.length];
}

// Reconstrói qual CTA um post pediu, a partir da data de publicação. Espelha
// pickCtaVariant para o relatório correlacionar tipo de pedido x resultado.
function ctaTypeForDayIndex(dayIndex) {
  return CTA_VARIANTS[dayIndex % CTA_VARIANTS.length].type;
}

module.exports = { HOOKS, CTAS, COMMENT_BAIT, SAVE_BAIT, CTA_VARIANTS, pickByDay, pickCtaVariant, ctaTypeForDayIndex };
