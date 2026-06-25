// Hashtags em camadas para crescimento orgânico.
//
// Por quê: usar sempre as mesmas 5-6 tags genéricas e gigantes
// (#biblia, #fe) faz uma conta pequena afundar — esses feeds rolam rápido
// demais e só contas grandes rankeiam. A estratégia aqui mistura camadas:
//   - ALWAYS: poucas tags de identidade, sempre presentes.
//   - BIG: alto volume, alcance grande mas competição alta (rotaciona).
//   - MEDIUM: volume médio, chance real de aparecer em "principais".
//   - NICHE: volume pequeno, onde conta nova consegue rankear de fato.
// Rotacionar por dia (1) varia o conjunto pra IG não ler como bloco repetido
// e (2) testa quais tags trazem alcance ao longo do tempo.

const ALWAYS = ['devocional', 'biblia', 'fe'];

const BIG = [
  'deus', 'jesus', 'versiculododia', 'jesuscristo', 'palavradedeus', 'gospel'
];

const MEDIUM = [
  'oracao', 'gratidao', 'cristao', 'evangelho', 'reflexao', 'esperanca',
  'vidacomcristo', 'mensagemdedeus', 'fenuncamorre', 'deusnocontrole',
  'palavradodia', 'cristaos'
];

const NICHE = [
  'devocionaldiario', 'versiculodiario', 'mensagemdefe', 'palavraviva',
  'reflexaododia', 'fecristã', 'momentocomdeus', 'cristaosnoinstagram',
  'inspiracaocrista', 'deusefiel', 'salmododia', 'graçadedeus'
];

// Tags específicas por tipo de conteúdo (sempre incluídas para o tipo).
const BY_CATEGORY = {
  devotional: ['devocionalcristao', 'reflexaobiblica'],
  quote: ['citacaobiblica', 'versiculo', 'frasescristas'],
  game: ['jogosbiblicos', 'quizbiblico', 'passatempocristao'],
  conexo: ['jogosbiblicos', 'desafiobiblico'],
  trivia: ['triviabiblica', 'quizbiblico', 'vocesabia'],
  impact: ['projetocristao', 'comunidadecrista'],
  reel: ['reels', 'reelscristaos', 'reelsdefe']
};

// Pega `count` itens de `pool` começando num deslocamento derivado do dia,
// de forma deterministica e circular (cobre o pool inteiro ao longo dos dias).
function rotateSlice(pool, dayIndex, count) {
  const start = (dayIndex % pool.length);
  const out = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    out.push(pool[(start + i) % pool.length]);
  }
  return out;
}

// Monta a linha de hashtags para um tipo de conteúdo num dado dia.
// Total fica em torno de 15-18 tags (IG permite até 30).
function buildHashtags(category, dayIndex) {
  const cat = BY_CATEGORY[category] || [];
  const tags = [
    ...ALWAYS,
    ...rotateSlice(BIG, dayIndex, 2),
    ...rotateSlice(MEDIUM, dayIndex, 5),
    ...rotateSlice(NICHE, dayIndex, 5),
    ...cat
  ];
  // Remove duplicatas preservando ordem.
  const seen = new Set();
  const unique = tags.filter(t => (seen.has(t) ? false : seen.add(t)));
  return unique.map(t => `#${t}`).join(' ');
}

module.exports = { buildHashtags };
