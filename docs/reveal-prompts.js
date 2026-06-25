// Banco de desafios de "revelação": o slide 1 mostra o desafio, o slide 2
// revela a resposta. Formato de carrossel que prende pelo swipe e provoca
// comentário ("comenta seu palpite antes de arrastar").
// label = etiqueta do tipo de desafio mostrada no cabeçalho.
const REVEAL_PROMPTS = [
  {
    label: 'Complete o versículo',
    prompt: 'O Senhor é o meu pastor, ______.',
    answer: 'nada me faltará',
    explanation: 'Salmos 23:1. Davi, que foi pastor, descreve o cuidado de Deus como o de um pastor pelas ovelhas.'
  },
  {
    label: 'Complete o versículo',
    prompt: 'Tudo posso ______ que me fortalece.',
    answer: 'naquele',
    explanation: 'Filipenses 4:13. Paulo escreveu isso preso, falando de contentamento em qualquer situação.'
  },
  {
    label: 'Verdadeiro ou falso',
    prompt: 'Davi enfrentou Golias usando uma espada.',
    answer: 'Falso',
    explanation: 'Davi venceu Golias com uma funda e uma pedra, sem espada na mão (1 Samuel 17:50).'
  },
  {
    label: 'Verdadeiro ou falso',
    prompt: 'Jesus chorou diante do túmulo de Lázaro.',
    answer: 'Verdadeiro',
    explanation: '"Jesus chorou" (João 11:35) é o versículo mais curto da Bíblia, e mostra sua compaixão.'
  },
  {
    label: 'Qual livro?',
    prompt: '"No princípio criou Deus os céus e a terra."',
    answer: 'Gênesis',
    explanation: 'Gênesis 1:1, o primeiro versículo da Bíblia, abre toda a narrativa da criação.'
  },
  {
    label: 'Qual livro?',
    prompt: '"O amor é paciente, o amor é bondoso."',
    answer: '1 Coríntios',
    explanation: '1 Coríntios 13:4, o famoso capítulo do amor escrito por Paulo.'
  },
  {
    label: 'Complete o versículo',
    prompt: 'Confia no Senhor de todo o seu coração e não se apoie ______.',
    answer: 'em seu próprio entendimento',
    explanation: 'Provérbios 3:5. Um convite a confiar em Deus além da própria lógica.'
  },
  {
    label: 'Verdadeiro ou falso',
    prompt: 'Foram três os reis magos que visitaram Jesus.',
    answer: 'Falso',
    explanation: 'A Bíblia fala em magos do oriente, mas não diz quantos eram. O número três vem da tradição, dos três presentes (Mateus 2:11).'
  }
];

module.exports = REVEAL_PROMPTS;
