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

// Provoca comentário: pergunta direta ou pedido de resposta nos comentários.
// O comentário pesa mais que o like no alcance do IG, então vale chamar
// explicitamente por ele.
const COMMENT_BAIT = [
  'Comenta "amém" se você crê nisso hoje.',
  'Marca quem precisa ler isso agora 👇',
  'Qual versículo te sustenta nos dias difíceis? Conta nos comentários.',
  'Responde nos comentários: do que você precisa que Deus cuide hoje?',
  'Comenta 🙏 se quer oração por isso.',
  'Concorda? Deixa seu "amém" aqui embaixo.',
  'Conta pra gente: onde você viu Deus agir essa semana?'
];

// Provoca salvar: enquadra o post como algo pra guardar e voltar depois.
// O save é o sinal mais forte de conteúdo "de valor" pro algoritmo.
const SAVE_BAIT = [
  'Salva esse post pra voltar quando precisar.',
  'Salva pra orar com isso durante a semana.',
  'Guarda esse post: é daqueles pra reler num dia difícil.',
  'Salva agora pra não esquecer dessa palavra.',
  'Dá um salvar pra ter sempre por perto.'
];

// Um único pedido forte por post, rotacionando entre os três sinais que o
// algoritmo mais valoriza (save > share > comment > like). Empilhar 3 CTAs
// na legenda diluía o pedido e a semana 1 fechou com 0 save/share/comment;
// um pedido só, claro, converte melhor. O tipo é deterministico pela data,
// então o relatório semanal consegue cruzar qual sinal cada post pediu.
const CTA_VARIANTS = [
  { type: 'save', text: 'Salva esse post pra reler num dia difícil. 🔖' },
  { type: 'comment', text: 'Comenta "amém" se essa palavra falou com você hoje. 🙏' },
  { type: 'share', text: 'Manda pra alguém que precisa ler isso agora. 💬' }
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
