const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const POLL_PROMPTS = require('../docs/poll-prompts.js');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { wrapText } = require('./lib/card-canvas.js');

const WIDTH = 1080;
const HEIGHT = 1920;
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

function todayPoll(date) {
  const index = dayOfYear(date) % POLL_PROMPTS.length;
  return POLL_PROMPTS[index];
}

function drawOption(ctx, letter, text, y) {
  const boxWidth = WIDTH - 240;
  const boxHeight = 180;
  const x = (WIDTH - boxWidth) / 2;

  ctx.fillStyle = '#fffaf0';
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 4;
  ctx.fillRect(x, y, boxWidth, boxHeight);
  ctx.strokeRect(x, y, boxWidth, boxHeight);

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x + 90, y + boxHeight / 2);

  ctx.fillStyle = '#3e2c1c';
  ctx.font = 'bold 46px Georgia, serif';
  wrapText(ctx, text, boxWidth - 220).forEach((line, i, arr) => {
    ctx.fillText(line, x + 90 + (boxWidth - 90) / 2, y + boxHeight / 2 - ((arr.length - 1) * 28) + i * 56);
  });
  ctx.textBaseline = 'alphabetic';
}

function drawStory(poll) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, '#fdf6e3');
  gradient.addColorStop(0.45, '#f2e2bd');
  gradient.addColorStop(1, '#e8cf9e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, WIDTH - 80, HEIGHT - 80);
  ctx.strokeStyle = '#e3cfa3';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, WIDTH - 112, HEIGHT - 112);

  const centerX = WIDTH / 2;

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('A ou B?', centerX, 360);

  ctx.fillStyle = '#4a3420';
  ctx.font = 'bold 48px Georgia, serif';
  let y = 520;
  wrapText(ctx, poll.theme, WIDTH - 220).forEach(line => {
    ctx.fillText(line, centerX, y);
    y += 64;
  });

  y += 80;
  drawOption(ctx, 'A', poll.a, y);
  drawOption(ctx, 'B', poll.b, y + 240);

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('Responde aqui', centerX, HEIGHT - 240);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText('Devocional completo no link da bio', centerX, HEIGHT - 150);

  return canvas;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const poll = todayPoll(date);
  const canvas = drawStory(poll);

  const storyPath = path.join(OUTPUT_DIR, `ab-story-${key}.jpg`);
  fs.writeFileSync(storyPath, canvas.toBuffer('image/jpeg', { quality: 0.92 }));
  console.log(`Story A/B gerado: ${storyPath}`);
  console.log('Dica: adicione a figurinha de enquete manualmente no app pra voto interativo (a Graph API não posta stickers).');
}

if (require.main === module) main();

module.exports = { todayPoll };
