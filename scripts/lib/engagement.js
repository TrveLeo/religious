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

function pickByDay(list, dayIndex) {
  return list[dayIndex % list.length];
}

module.exports = { HOOKS, CTAS, pickByDay };
