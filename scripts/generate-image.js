const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const DEVOTIONALS = require('../content.js');

const SIZE = 1080;
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function todayEntry() {
  const now = new Date();
  const index = dayOfYear(now) % DEVOTIONALS.length;
  return { entry: DEVOTIONALS[index], date: now };
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCard(entry, date) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  // Fundo gradiente, mesma paleta do site
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, '#fdf6e3');
  gradient.addColorStop(0.45, '#f2e2bd');
  gradient.addColorStop(1, '#e8cf9e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Moldura decorativa
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, SIZE - 80, SIZE - 80);
  ctx.strokeStyle = '#e3cfa3';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, SIZE - 112, SIZE - 112);

  const centerX = SIZE / 2;
  let y = 180;

  // Título
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Devocional Diário', centerX, y);

  // Data
  y += 50;
  const dataStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText(capitalize(dataStr), centerX, y);

  // Linha decorativa
  y += 50;
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 80, y);
  ctx.lineTo(centerX + 80, y);
  ctx.stroke();

  // Versículo
  y += 80;
  ctx.fillStyle = '#4a3420';
  ctx.font = 'italic 38px Georgia, serif';
  const maxWidth = SIZE - 220;
  const verseLines = wrapText(ctx, `"${entry.verse}"`, maxWidth);
  verseLines.forEach(line => {
    ctx.fillText(line, centerX, y);
    y += 50;
  });

  // Referência
  y += 20;
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillText(entry.ref, centerX, y);

  // Título do devocional
  y += 90;
  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(entry.title, centerX, y);

  // Chamada para o site (texto completo fica na legenda do post)
  ctx.fillStyle = '#9c7a4e';
  ctx.font = '24px Georgia, serif';
  ctx.fillText('Devocional completo no link da bio', centerX, SIZE - 90);

  return canvas;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildCaption(entry, date) {
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  return [
    `${entry.title}`,
    '',
    `"${entry.verse}" (${entry.ref})`,
    '',
    entry.text,
    '',
    `Devocional de ${dataStr}.`,
    '',
    '#devocional #biblia #fe #deus #versiculododia #jesus'
  ].join('\n');
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const { entry, date } = todayEntry();
  const canvas = drawCard(entry, date);

  const dateKey = date.toISOString().slice(0, 10);
  const imagePath = path.join(OUTPUT_DIR, `devocional-${dateKey}.png`);
  const captionPath = path.join(OUTPUT_DIR, `devocional-${dateKey}.txt`);

  fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
  fs.writeFileSync(captionPath, buildCaption(entry, date));

  console.log(`Imagem gerada: ${imagePath}`);
  console.log(`Legenda gerada: ${captionPath}`);
}

main();
