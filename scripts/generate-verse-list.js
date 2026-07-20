const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { SIZE, baseBackground, drawFooter, wrapText, stripEmoji } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { buildHashtags } = require('./lib/hashtags.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

const VERSE_LISTS = [
  {
    tema: 'ansiedade',
    titulo: '5 versículos para quando a ansiedade apertar',
    versos: [
      {
        ref: 'Filipenses 4:6-7',
        text: 'Não andeis ansiosos por coisa alguma; em tudo sejam conhecidas diante de Deus as vossas petições, pela oração e pela súplica, com ações de graças. E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e as vossas mentes em Cristo Jesus.',
        contexto: 'A instrução não é "não sinta ansiedade". É: traga tudo para Deus, com gratidão. A paz não é ausência de problemas — é uma guarda que excede o que a mente consegue processar.'
      },
      {
        ref: 'Mateus 6:34',
        text: 'Não vos preocupeis com o dia de amanhã, pois o amanhã trará os seus cuidados. A cada dia basta o seu mal.',
        contexto: 'Jesus não estava ignorando os problemas. Estava dizendo: você só tem hoje. Amanhã, quando chegar, terá graça pra ele também.'
      },
      {
        ref: '1 Pedro 5:7',
        text: 'Lançai sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.',
        contexto: 'O verbo é "lançar" — um ato ativo, não passivo. A ansiedade não some sozinha. Você a entrega intencionalmente a quem pode carregar.'
      },
      {
        ref: 'Salmos 94:19',
        text: 'Quando se multiplicam dentro de mim os pensamentos angustiantes, as tuas consolações alegram a minha alma.',
        contexto: 'O Salmo é honesto: os pensamentos se multiplicam mesmo. Mas Deus não espera você parar de pensar pra agir — ele age no meio do turbilhão.'
      },
      {
        ref: 'Isaías 41:10',
        text: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.',
        contexto: 'Deus não diz "não existe motivo para temer". Diz: "teme se quiser, mas eu estou aqui mesmo assim". A presença dele não depende do seu estado emocional.'
      }
    ]
  },
  {
    tema: 'cansaco',
    titulo: '5 versículos para quando você não tem mais forças',
    versos: [
      {
        ref: 'Isaías 40:29-31',
        text: 'Ele dá força ao cansado e multiplica as forças ao que não tem nenhum vigor. Os jovens se cansam e se fatigam; até os moços tropeçam. Mas os que esperam no Senhor renovam as suas forças, sobem com asas como águias, correm e não se cansam, caminham e não se fatigam.',
        contexto: 'O destinatário da promessa é o cansado, não o forte. Deus começa onde você termina.'
      },
      {
        ref: 'Mateus 11:28',
        text: 'Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.',
        contexto: 'O convite é para os esgotados. Não "melhore e venha", mas "venha esgotado".'
      },
      {
        ref: 'Gálatas 6:9',
        text: 'E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não desfalecermos.',
        contexto: 'O verbo "não desfalecermos" reconhece que o desânimo é real. Não é negação — é escolha consciente de continuar mesmo sentindo o cansaço.'
      },
      {
        ref: 'Salmos 23:2-3',
        text: 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma.',
        contexto: 'Deus não está sempre nos movendo rápido. Às vezes o cuidado dele é exatamente parar, descansar, respirar.'
      },
      {
        ref: '2 Coríntios 12:9',
        text: 'A minha graça te basta, porque o poder se aperfeiçoa na fraqueza.',
        contexto: 'Não é apesar da fraqueza, é na fraqueza. Quando você não tem mais nada, é quando ele tem mais espaço.'
      }
    ]
  },
  {
    tema: 'decisao',
    titulo: '5 versículos para quando você precisa de direção',
    versos: [
      {
        ref: 'Provérbios 3:5-6',
        text: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
        contexto: 'Não é pedir que Deus aprove o que você já decidiu. É reconhecê-lo antes — nos detalhes, nas dúvidas, no processo.'
      },
      {
        ref: 'Salmos 32:8',
        text: 'Eu te instruirei e te ensinarei o caminho que deves seguir; sobre ti fixarei os meus olhos.',
        contexto: 'Deus não só aponta o caminho — fica de olho. A instrução e a vigilância vêm juntas.'
      },
      {
        ref: 'Tiago 1:5',
        text: 'Se algum de vós necessita de sabedoria, peça-a a Deus, que a todos dá livremente e com generosidade, e lhe será concedida.',
        contexto: 'A condicional não é "se você for bom o suficiente". É só: se você precisar, peça. A generosidade de Deus não depende do seu merecimento.'
      },
      {
        ref: 'Isaías 30:21',
        text: 'Os teus ouvidos ouvirão atrás de ti uma palavra, dizendo: Este é o caminho, andai por ele; quando vos desviardes para a direita ou para a esquerda.',
        contexto: 'A voz vem quando você já começa a se desviar. Deus não guia só no início — ele corrige ao longo do caminho.'
      },
      {
        ref: 'Jeremias 29:11',
        text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar um futuro e uma esperança.',
        contexto: 'Dito a Israel exilado — numa situação que parecia sem saída. O plano de Deus existe mesmo quando você não consegue enxergá-lo.'
      }
    ]
  },
  {
    tema: 'solidao',
    titulo: '5 versículos para quando você se sente sozinho',
    versos: [
      {
        ref: 'Deuteronômio 31:8',
        text: 'O Senhor mesmo vai adiante de ti; ele será contigo, não te deixará, nem te desamparará; não temas, nem te espantes.',
        contexto: 'A presença de Deus antecede o seu caminho. Ele não chega junto com você — ele já está lá antes.'
      },
      {
        ref: 'Hebreus 13:5',
        text: 'Jamais te deixarei, nunca jamais te abandonarei.',
        contexto: 'No original grego há uma ênfase dupla: "de modo nenhum te deixarei, de modo algum te abandonarei". A repetição não é acidente — é promessa absoluta.'
      },
      {
        ref: 'Salmos 139:7-8',
        text: 'Para onde me ausentarei do teu Espírito? Para onde fugirei da tua face? Se subir ao céu, lá tu estás; se fizer a minha cama no além, também aí estás.',
        contexto: 'O Salmo está descobrindo que não é possível estar fora do alcance de Deus. Em nenhum lugar, nem nos mais sombrios, você está sozinho.'
      },
      {
        ref: 'João 16:32',
        text: 'Eis que vem a hora em que vos dispersareis... e me deixareis só. E contudo, não estou só, porque o Pai está comigo.',
        contexto: 'Jesus falou isso sabendo que os discípulos iam abandoná-lo horas depois. A solidão humana não é estranha a ele.'
      },
      {
        ref: 'Salmos 68:6',
        text: 'Deus faz habitar em família os que estavam sós.',
        contexto: 'A solidão não é destino final. Deus é o autor de pertencimento, não de isolamento.'
      }
    ]
  },
  {
    tema: 'gratidao',
    titulo: '5 versículos para cultivar gratidão',
    versos: [
      {
        ref: '1 Tessalonicenses 5:18',
        text: 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
        contexto: '"Em tudo" não significa "por tudo". Você pode dar graças em meio à dor sem fingir que a dor é boa.'
      },
      {
        ref: 'Salmos 100:4',
        text: 'Entrai pelas suas portas com ações de graças; nos seus átrios, com louvor; dai-lhe graças, bendizei o seu nome.',
        contexto: 'A gratidão é o idioma de quem entra na presença de Deus. Não pré-requisito — é o caminho.'
      },
      {
        ref: 'Colossenses 3:17',
        text: 'E tudo quanto fizerdes, seja em palavra ou em obra, fazei tudo em nome do Senhor Jesus, dando por meio dele graças a Deus Pai.',
        contexto: 'A gratidão não é reservada para os grandes momentos. Ela permeia os atos ordinários — até os que parecem pequenos demais.'
      },
      {
        ref: 'Salmos 107:1',
        text: 'Louvai ao Senhor, porque ele é bom; a sua benignidade dura para sempre.',
        contexto: 'O motivo da gratidão não é o que Deus fez hoje — é o que ele é. A bondade dele não flutua com as circunstâncias.'
      },
      {
        ref: 'Filipenses 4:11',
        text: 'Aprendi a estar contente em qualquer situação em que me encontre.',
        contexto: 'Paulo diz "aprendi" — contentamento é uma habilidade cultivada, não um temperamento natural. Você pode aprender isso também.'
      }
    ]
  },
  {
    tema: 'fe-em-crise',
    titulo: '5 versículos para quando a fé treme',
    versos: [
      {
        ref: 'Marcos 9:24',
        text: 'Imediatamente o pai do menino exclamou: Creio! Ajuda a minha incredulidade.',
        contexto: 'Esse homem foi honesto com Jesus sobre a própria fé: ela era incompleta. Jesus curou o filho mesmo assim. A fé imperfeita é suficiente.'
      },
      {
        ref: 'Salmos 22:1',
        text: 'Deus meu, Deus meu, por que me abandonaste? Por que te alongas do meu socorro, longe das palavras do meu bramido?',
        contexto: 'Esse é o Salmo que Jesus citou na cruz. Duvidar, questionar, sentir abandono — estava na oração de Jesus. Você está em boa companhia.'
      },
      {
        ref: 'Habacuque 3:17-18',
        text: 'Posto que a figueira não florescerá, nem haverá fruto na vide... todavia, me alegrei no Senhor.',
        contexto: 'Habacuque lista tudo que pode dar errado e ainda assim escolhe confiar. Fé robusta não nega a realidade — ela confia apesar dela.'
      },
      {
        ref: 'João 20:27',
        text: 'Disse a Tomé: Põe aqui o teu dedo e vê as minhas mãos; chega a tua mão e mete-a no meu lado; e não sejas incrédulo, mas crente.',
        contexto: 'Jesus não repreendeu Tomé pela dúvida — foi pessoalmente até ele e mostrou as evidências. Deus aguenta as suas perguntas.'
      },
      {
        ref: 'Romanos 8:38-39',
        text: 'Estou convencido de que nem a morte, nem a vida... nem qualquer outra criatura nos poderá separar do amor de Deus que está em Cristo Jesus nosso Senhor.',
        contexto: 'A lista inclui quase tudo que poderia nos separar. A conclusão é que nada consegue. Sua fé pode tremer; o amor de Deus, não.'
      }
    ]
  },
  {
    tema: 'recomeco',
    titulo: '5 versículos para quando você precisa recomeçar',
    versos: [
      {
        ref: 'Lamentações 3:22-23',
        text: 'As misericórdias do Senhor não têm fim; as suas compaixões não se esgotam. Renovam-se cada manhã; grande é a tua fidelidade.',
        contexto: 'Escrito no contexto da destruição de Jerusalém. Mesmo ali, a misericórdia se renova. Cada manhã é literalmente uma chance nova.'
      },
      {
        ref: '2 Coríntios 5:17',
        text: 'Assim que, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.',
        contexto: 'Não diz "algumas coisas foram melhoradas". Diz "nova criatura". O recomeço em Deus não é reforma — é criação.'
      },
      {
        ref: 'Isaías 43:18-19',
        text: 'Não vos lembreis das coisas passadas, nem considereis as antigas. Eis que faço coisa nova; agora sairá à luz. Por acaso, não a percebeis?',
        contexto: 'O apelo não é esquecer o passado — é abrir os olhos para o que está emergindo agora. Às vezes o novo já começou e você ainda está olhando para trás.'
      },
      {
        ref: 'Joel 2:25',
        text: 'Restituir-vos-ei os anos que o gafanhoto comeu.',
        contexto: 'A promessa é de restauração — não só do que vem depois, mas do que foi perdido antes. Deus também age no tempo passado.'
      },
      {
        ref: 'Filipenses 3:13-14',
        text: 'Mas uma coisa faço: esquecendo-me das coisas que ficaram para trás e avançando para as que estão diante de mim, prossigo para o alvo.',
        contexto: 'Paulo também teve passado do qual queria se distanciar. O recomeço não é ausência de história — é escolha de direção.'
      }
    ]
  }
];

function pickList(date) {
  return VERSE_LISTS[dayOfYear(date) % VERSE_LISTS.length];
}

function drawCoverCard(list) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Devocional Diário', centerX, 180);

  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 120, 210);
  ctx.lineTo(centerX + 120, 210);
  ctx.stroke();

  ctx.fillStyle = '#4a3420';
  ctx.font = 'bold 56px Georgia, serif';
  const titleLines = wrapText(ctx, stripEmoji(list.titulo), SIZE - 200);
  let y = 330;
  const lineH = 72;
  titleLines.forEach(line => {
    ctx.fillText(line, centerX, y);
    y += lineH;
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 36px Georgia, serif';
  ctx.fillText('Arrasta para ver os versículos', centerX, y + 60);

  drawFooter(ctx, 'Salva esse carrossel para ter sempre por perto');

  return canvas;
}

function drawVerseCard(verso, index) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${index} de 5`, centerX, 130);

  ctx.fillStyle = '#4a3420';
  ctx.font = 'italic 44px Georgia, serif';
  const verseLines = wrapText(ctx, `"${verso.text}"`, SIZE - 180);
  let y = 240;
  const verseLineH = 60;
  verseLines.forEach(line => {
    ctx.fillText(line, centerX, y);
    y += verseLineH;
  });

  y += 20;
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 80, y);
  ctx.lineTo(centerX + 80, y);
  ctx.stroke();

  y += 40;
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(verso.ref, centerX, y);

  y += 60;
  ctx.fillStyle = '#9c7a4e';
  ctx.font = '28px Georgia, serif';
  const ctxLines = wrapText(ctx, verso.contexto, SIZE - 200);
  ctxLines.forEach(line => {
    if (y < SIZE - 140) {
      ctx.fillText(line, centerX, y);
      y += 40;
    }
  });

  return canvas;
}

function drawCtaCard() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 80px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔖', centerX, 280);

  ctx.fillStyle = '#4a3420';
  ctx.font = 'bold 50px Georgia, serif';
  const line1 = wrapText(ctx, 'Salva esse carrossel', SIZE - 200);
  let y = 380;
  line1.forEach(line => {
    ctx.fillText(line, centerX, y);
    y += 64;
  });

  ctx.fillStyle = '#6b4226';
  ctx.font = '38px Georgia, serif';
  const line2 = wrapText(ctx, 'para ter esses versiculos quando precisar', SIZE - 200);
  line2.forEach(line => {
    ctx.fillText(stripEmoji(line), centerX, y);
    y += 52;
  });

  y += 30;
  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 32px Georgia, serif';
  ctx.fillText('Manda pra alguem que precisa agora', centerX, y);

  drawFooter(ctx, 'Devocional completo e oracao no link da bio');

  return canvas;
}

function buildCaption(list, date) {
  const dayIndex = dayOfYear(date);
  const verseLines = list.versos.map((v, i) => `${i + 1}. ${v.ref}`).join('\n');

  return [
    `${list.titulo} 🔖`,
    '',
    'Arrasta para ver cada um deles com contexto.',
    '',
    verseLines,
    '',
    'Salva esse carrossel para ter esses versículos por perto quando precisar.',
    'Manda no WhatsApp pra alguém que está passando por isso agora. 💬',
    '',
    '➡️ Devocional completo e oração: link na bio.',
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
    'Chave Pix (e-mail): diariod777@gmail.com',
    '',
    buildHashtags('verse-list', dayIndex)
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const list = pickList(date);

  const donationCanvas = await drawDonationCard();

  const coverCanvas = drawCoverCard(list);
  fs.writeFileSync(path.join(OUTPUT_DIR, `verse-list-${key}-1.png`), coverCanvas.toBuffer('image/png'));
  console.log(`Capa gerada: verse-list-${key}-1.png`);

  list.versos.forEach((verso, i) => {
    const canvas = drawVerseCard(verso, i + 1);
    fs.writeFileSync(path.join(OUTPUT_DIR, `verse-list-${key}-${i + 2}.png`), canvas.toBuffer('image/png'));
    console.log(`Card ${i + 1} gerado: verse-list-${key}-${i + 2}.png`);
  });

  const ctaCanvas = drawCtaCard();
  fs.writeFileSync(path.join(OUTPUT_DIR, `verse-list-${key}-7.png`), ctaCanvas.toBuffer('image/png'));
  console.log(`CTA gerado: verse-list-${key}-7.png`);

  fs.writeFileSync(path.join(OUTPUT_DIR, `doacao-verse-list-${key}.png`), donationCanvas.toBuffer('image/png'));

  const captionPath = path.join(OUTPUT_DIR, `verse-list-${key}.txt`);
  fs.writeFileSync(captionPath, buildCaption(list, date));
  console.log(`Legenda gerada: ${captionPath}`);
  console.log(`Tema: "${list.titulo}"`);
}

if (require.main === module) main();

module.exports = { buildCaption, pickList, VERSE_LISTS };
