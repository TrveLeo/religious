const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const REVEAL_PROMPTS = require('../docs/reveal-prompts.js');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { SIZE, baseBackground, drawHeader, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { COMMENT_BAIT, SAVE_BAIT, pickByDay } = require('./lib/engagement.js');
const { buildHashtags } = require('./lib/hashtags.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

function todayPrompt(date) {
  const index = dayOfYear(date) % REVEAL_PROMPTS.length;
  return REVEAL_PROMPTS[index];
}

function drawChallengeFrame(item) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, item.label, 'Arrasta pro lado pra revelar');

  ctx.fillStyle = '#4a3420';
  ctx.font = 'italic 44px Georgia, serif';
  ctx.textAlign = 'center';
  let y = 440;
  wrapText(ctx, item.prompt, SIZE - 200).forEach(line => {
    ctx.fillText(line, SIZE / 2, y);
    y += 60;
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('Comenta seu palpite antes de arrastar', SIZE / 2, SIZE - 90);

  return canvas;
}

function drawRevealFrame(item) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, item.label, 'Resposta');

  ctx.fillStyle = '#6b8e23';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.textAlign = 'center';
  let y = 400;
  wrapText(ctx, item.answer, SIZE - 220).forEach(line => {
    ctx.fillText(line, SIZE / 2, y);
    y += 70;
  });

  y += 30;
  ctx.fillStyle = '#4a3420';
  ctx.font = '28px Georgia, serif';
  wrapText(ctx, item.explanation, SIZE - 200).forEach(line => {
    ctx.fillText(line, SIZE / 2, y);
    y += 40;
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('Acertou? Comenta aí', SIZE / 2, SIZE - 90);

  return canvas;
}

function buildCaption(item, date) {
  const dayIndex = dayOfYear(date);
  const commentBait = pickByDay(COMMENT_BAIT, dayIndex + 1);
  const saveBait = pickByDay(SAVE_BAIT, dayIndex + 1);

  return [
    `${item.label}: você consegue?`,
    '',
    item.prompt,
    '',
    'Comenta seu palpite antes de arrastar pro lado e ver a resposta.',
    '',
    commentBait,
    saveBait,
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
    '',
    buildHashtags('trivia', dayIndex)
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const item = todayPrompt(date);

  const frames = [drawChallengeFrame(item), drawRevealFrame(item), await drawDonationCard()];
  frames.forEach((canvas, i) => {
    const framePath = path.join(OUTPUT_DIR, `reveal-${key}-${i + 1}.png`);
    fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
    console.log(`Frame ${i + 1} gerado: ${framePath}`);
  });

  const captionPath = path.join(OUTPUT_DIR, `reveal-${key}.txt`);
  fs.writeFileSync(captionPath, buildCaption(item, date));
  console.log(`Legenda gerada: ${captionPath}`);
}

if (require.main === module) main();

module.exports = { buildCaption, todayPrompt };
