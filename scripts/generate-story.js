const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const DEVOTIONALS = require('../docs/content.js');
const { dayOfYear, dateKey, capitalize } = require('./lib/dates.js');
const { wrapText } = require('./lib/card-canvas.js');

const WIDTH = 1080;
const HEIGHT = 1920;
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

function todayEntry() {
  const now = new Date();
  const index = dayOfYear(now) % DEVOTIONALS.length;
  return { entry: DEVOTIONALS[index], date: now };
}

function drawStory(entry, date) {
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
  let y = 320;

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Devocional Diário', centerX, y);

  y += 56;
  const dataStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText(capitalize(dataStr), centerX, y);

  y += 70;
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 90, y);
  ctx.lineTo(centerX + 90, y);
  ctx.stroke();

  y += 100;
  ctx.fillStyle = '#4a3420';
  ctx.font = 'italic 42px Georgia, serif';
  const maxWidth = WIDTH - 200;
  wrapText(ctx, `"${entry.verse}"`, maxWidth).forEach(line => {
    ctx.fillText(line, centerX, y);
    y += 56;
  });

  y += 30;
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText(entry.ref, centerX, y);

  y += 100;
  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText(entry.title, centerX, y);

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText('Confira o post completo', centerX, HEIGHT - 260);
  ctx.fillText('no feed agora mesmo', centerX, HEIGHT - 205);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText('Devocional completo no link da bio', centerX, HEIGHT - 130);

  return canvas;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const { entry, date } = todayEntry();
  const key = dateKey(date);
  const canvas = drawStory(entry, date);

  const storyPath = path.join(OUTPUT_DIR, `story-${key}.png`);
  fs.writeFileSync(storyPath, canvas.toBuffer('image/png'));
  console.log(`Story gerado: ${storyPath}`);
}

main();
