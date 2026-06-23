const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const DEVOTIONALS = require('../docs/content.js');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { SIZE, baseBackground, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { HOOKS, CTAS, pickByDay } = require('./lib/engagement.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

// Card de citação roda numa rotação separada da do devocional diário,
// pra não repetir o mesmo versículo no mesmo dia.
function todayEntry(date) {
  const offset = Math.floor(DEVOTIONALS.length / 2);
  const index = (dayOfYear(date) + offset) % DEVOTIONALS.length;
  return DEVOTIONALS[index];
}

function drawQuoteCard(entry) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;
  const centerY = SIZE / 2;

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 120px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('"', centerX, 260);

  ctx.fillStyle = '#4a3420';
  ctx.font = 'italic 50px Georgia, serif';
  const lines = wrapText(ctx, entry.verse, SIZE - 180);
  const lineHeight = 66;
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });

  const refY = startY + lines.length * lineHeight + 50;
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 70, refY - 35);
  ctx.lineTo(centerX + 70, refY - 35);
  ctx.stroke();

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText(entry.ref, centerX, refY);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('Devocional Diário no link da bio', centerX, SIZE - 90);

  return canvas;
}

function buildCaption(entry, date) {
  const dayIndex = dayOfYear(date);
  const hook = pickByDay(HOOKS, dayIndex + 3);
  const cta = pickByDay(CTAS, dayIndex + 2);

  return [
    hook,
    '',
    `"${entry.verse}"`,
    `${entry.ref}`,
    '',
    'Guarde essa palavra com você hoje.',
    '',
    cta,
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
    '',
    '#biblia #versiculo #fe #deus #citacao #devocional'
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const entry = todayEntry(date);

  const quoteCanvas = drawQuoteCard(entry);
  const donationCanvas = await drawDonationCard();

  const quotePath = path.join(OUTPUT_DIR, `quote-${key}-1.png`);
  const donationPath = path.join(OUTPUT_DIR, `quote-${key}-2.png`);
  const captionPath = path.join(OUTPUT_DIR, `quote-${key}.txt`);

  fs.writeFileSync(quotePath, quoteCanvas.toBuffer('image/png'));
  fs.writeFileSync(donationPath, donationCanvas.toBuffer('image/png'));
  fs.writeFileSync(captionPath, buildCaption(entry, date));

  console.log(`Card de citação gerado: ${quotePath}`);
  console.log(`Card de doação gerado: ${donationPath}`);
  console.log(`Legenda gerada: ${captionPath}`);
}

main();
