const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const POLL_PROMPTS = require('../docs/poll-prompts.js');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { SIZE, baseBackground, drawHeader, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { COMMENT_BAIT, pickByDay } = require('./lib/engagement.js');
const { buildHashtags } = require('./lib/hashtags.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

function todayPoll(date) {
  const index = dayOfYear(date) % POLL_PROMPTS.length;
  return POLL_PROMPTS[index];
}

function drawOption(ctx, letter, text, y) {
  const boxWidth = SIZE - 240;
  const boxHeight = 130;
  const x = (SIZE - boxWidth) / 2;

  ctx.fillStyle = '#fffaf0';
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.fillRect(x, y, boxWidth, boxHeight);
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x + 40, y + boxHeight / 2);

  ctx.fillStyle = '#3e2c1c';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText(text, x + 130, y + boxHeight / 2);
  ctx.textBaseline = 'alphabetic';
}

function drawPollCard(poll) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, 'Enquete da Semana', 'Comenta sua resposta');

  ctx.fillStyle = '#4a3420';
  ctx.font = 'bold 42px Georgia, serif';
  ctx.textAlign = 'center';
  let y = 320;
  wrapText(ctx, poll.theme, SIZE - 200).forEach(line => {
    ctx.fillText(line, SIZE / 2, y);
    y += 54;
  });

  y += 30;
  drawOption(ctx, 'A', poll.a, y);
  drawOption(ctx, 'B', poll.b, y + 170);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Comenta A ou B e diz o porquê', SIZE / 2, SIZE - 90);

  return canvas;
}

function buildCaption(poll, date) {
  const dayIndex = dayOfYear(date);
  const commentBait = pickByDay(COMMENT_BAIT, dayIndex);

  return [
    `Enquete da semana: ${poll.theme}`,
    '',
    `A) ${poll.a}`,
    `B) ${poll.b}`,
    '',
    'Comenta A ou B aqui embaixo e conta o porquê. Semana que vem trazemos o resultado.',
    '',
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
  const poll = todayPoll(date);

  const pollCanvas = drawPollCard(poll);
  const donationCanvas = await drawDonationCard();

  fs.writeFileSync(path.join(OUTPUT_DIR, `poll-${key}-1.png`), pollCanvas.toBuffer('image/png'));
  fs.writeFileSync(path.join(OUTPUT_DIR, `poll-${key}-2.png`), donationCanvas.toBuffer('image/png'));
  fs.writeFileSync(path.join(OUTPUT_DIR, `poll-${key}.txt`), buildCaption(poll, date));

  console.log(`Card de enquete gerado para ${key}`);
}

if (require.main === module) main();

module.exports = { buildCaption, todayPoll };
