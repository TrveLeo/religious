// Banco de "enquetes" de duas opções. Usado tanto no card de enquete do feed
// (pede o voto nos comentários) quanto no story A ou B (figurinha de enquete
// adicionada manualmente no app, já que a Graph API não posta sticker).
// theme = pergunta; a/b = as duas opções; tag = palavra curta pro voto.
const POLL_PROMPTS = [
  {
    theme: 'O que mais te aproxima de Deus?',
    a: 'Oração',
    b: 'Leitura da Palavra'
  },
  {
    theme: 'Sua fé cresce mais...',
    a: 'Nos momentos difíceis',
    b: 'Nos momentos de gratidão'
  },
  {
    theme: 'Qual versículo você levaria pra uma ilha?',
    a: 'Salmos 23',
    b: 'Filipenses 4:13'
  },
  {
    theme: 'Você ora mais...',
    a: 'De manhã',
    b: 'À noite'
  },
  {
    theme: 'O que te sustenta hoje?',
    a: 'Esperança',
    b: 'Gratidão'
  },
  {
    theme: 'Como você sente Deus mais perto?',
    a: 'No silêncio',
    b: 'Na adoração'
  },
  {
    theme: 'Onde você mais precisa de fé agora?',
    a: 'Família',
    b: 'Trabalho'
  },
  {
    theme: 'Seu jeito de adorar é mais...',
    a: 'Com música',
    b: 'Em oração quieta'
  }
];

module.exports = POLL_PROMPTS;
