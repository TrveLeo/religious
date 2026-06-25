const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const DEVOTIONALS = require('../docs/content.js');
const { dayOfYear, dateKey, capitalize } = require('./lib/dates.js');
const { SIZE, baseBackground, drawFooter, drawEngagementBadge, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { HOOKS, CTAS, COMMENT_BAIT, SAVE_BAIT, pickByDay } = require('./lib/engagement.js');
const { buildHashtags } = require('./lib/hashtags.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

function todayEntry() {
  const now = new Date();
  const index = dayOfYear(now) % DEVOTIONALS.length;
  return { entry: DEVOTIONALS[index], date: now };
}

function drawDevotionalCard(entry, date) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;
  let y = 180;

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Devocional Diário', centerX, y);

  y += 50;
  const dataStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText(capitalize(dataStr), centerX, y);

  y += 50;
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 80, y);
  ctx.lineTo(centerX + 80, y);
  ctx.stroke();

  y += 80;
  ctx.fillStyle = '#4a3420';
  ctx.font = 'italic 38px Georgia, serif';
  const maxWidth = SIZE - 220;
  wrapText(ctx, `"${entry.verse}"`, maxWidth).forEach(line => {
    ctx.fillText(line, centerX, y);
    y += 50;
  });

  y += 20;
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillText(entry.ref, centerX, y);

  y += 90;
  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(entry.title, centerX, y);

  // CTA de engajamento na própria arte (não só na legenda): a maioria não
  // lê a legenda, então o pedido de comentar/salvar precisa estar na imagem.
  const dayIndex = dayOfYear(date);
  drawEngagementBadge(ctx, pickByDay(COMMENT_BAIT, dayIndex), pickByDay(SAVE_BAIT, dayIndex));

  drawFooter(ctx, 'Devocional completo no link da bio');

  return canvas;
}

function buildCaption(entry, date) {
  const dayIndex = dayOfYear(date);
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  const hook = pickByDay(HOOKS, dayIndex);
  const cta = pickByDay(CTAS, dayIndex);
  const commentBait = pickByDay(COMMENT_BAIT, dayIndex);
  const saveBait = pickByDay(SAVE_BAIT, dayIndex);

  return [
    hook,
    '',
    `${entry.title}`,
    '',
    `"${entry.verse}" (${entry.ref})`,
    '',
    entry.text,
    '',
    `Devocional de ${dataStr}.`,
    '',
    commentBait,
    saveBait,
    cta,
    'Arrasta para o lado e veja como apoiar este projeto via Pix.',
    'Chave Pix (e-mail): diariod777@gmail.com',
    '',
    buildHashtags('devotional', dayIndex)
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const { entry, date } = todayEntry();
  const key = dateKey(date);

  const devotionalCanvas = drawDevotionalCard(entry, date);
  const donationCanvas = await drawDonationCard();

  const imagePath = path.join(OUTPUT_DIR, `devocional-${key}.png`);
  const donationPath = path.join(OUTPUT_DIR, `doacao-${key}.png`);
  const captionPath = path.join(OUTPUT_DIR, `devocional-${key}.txt`);

  fs.writeFileSync(imagePath, devotionalCanvas.toBuffer('image/png'));
  fs.writeFileSync(donationPath, donationCanvas.toBuffer('image/png'));
  fs.writeFileSync(captionPath, buildCaption(entry, date));

  console.log(`Imagem 1 (devocional) gerada: ${imagePath}`);
  console.log(`Imagem 2 (doação) gerada: ${donationPath}`);
  console.log(`Legenda gerada: ${captionPath}`);
}

if (require.main === module) main();

module.exports = { buildCaption };
