const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const DEVOTIONALS = require('../docs/content.js');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { SIZE, baseBackground, drawHeader, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { SAVE_BAIT, COMMENT_BAIT, pickByDay } = require('./lib/engagement.js');
const { buildHashtags } = require('./lib/hashtags.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Sete versículos da semana, rotacionando o banco semana a semana de forma
// deterministica (cada semana pega um bloco diferente).
function weekEntries(date) {
  const weekIndex = Math.floor(dayOfYear(date) / 7);
  const start = (weekIndex * 7) % DEVOTIONALS.length;
  const entries = [];
  for (let i = 0; i < 7; i++) {
    entries.push(DEVOTIONALS[(start + i) % DEVOTIONALS.length]);
  }
  return entries;
}

function drawPlanCard(entries) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, 'Plano da Semana', '7 versículos pra orar e meditar');

  let y = 290;
  entries.forEach((entry, i) => {
    ctx.fillStyle = '#a0522d';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${WEEKDAYS[i]}`, 130, y);

    ctx.fillStyle = '#4a3420';
    ctx.font = '28px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(entry.ref, SIZE - 130, y);

    y += 58;
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Salva e volta aqui todo dia', SIZE / 2, SIZE - 90);

  return canvas;
}

function buildCaption(entries, date) {
  const dayIndex = dayOfYear(date);
  const saveBait = pickByDay(SAVE_BAIT, dayIndex);
  const commentBait = pickByDay(COMMENT_BAIT, dayIndex + 2);
  const list = entries.map((e, i) => `${WEEKDAYS[i]}: ${e.ref}`);

  return [
    'Plano de leitura da semana 📖',
    '',
    'Um versículo por dia pra orar e meditar:',
    '',
    ...list,
    '',
    saveBait,
    commentBait,
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
    '',
    buildHashtags('devotional', dayIndex)
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const entries = weekEntries(date);

  const planCanvas = drawPlanCard(entries);
  const donationCanvas = await drawDonationCard();

  fs.writeFileSync(path.join(OUTPUT_DIR, `weekly-${key}-1.png`), planCanvas.toBuffer('image/png'));
  fs.writeFileSync(path.join(OUTPUT_DIR, `weekly-${key}-2.png`), donationCanvas.toBuffer('image/png'));
  fs.writeFileSync(path.join(OUTPUT_DIR, `weekly-${key}.txt`), buildCaption(entries, date));

  console.log(`Plano semanal gerado para ${key}`);
}

if (require.main === module) main();

module.exports = { buildCaption, weekEntries };
