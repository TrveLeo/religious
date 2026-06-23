const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const TERMO_WORDS = require('../termo-words.js');
const CONEXO_SETS = require('../conexo-words.js');

const SIZE = 1080;
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function todayKey(date) {
  return date.toISOString().slice(0, 10);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function baseBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, '#fdf6e3');
  gradient.addColorStop(0.45, '#f2e2bd');
  gradient.addColorStop(1, '#e8cf9e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, SIZE - 80, SIZE - 80);
  ctx.strokeStyle = '#e3cfa3';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, SIZE - 112, SIZE - 112);
}

function drawHeader(ctx, title, subtitle) {
  const centerX = SIZE / 2;
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, centerX, 150);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText(subtitle, centerX, 195);
}

function seededRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function shuffledIndices(length, seed) {
  const random = seededRandom(seed);
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function drawTermoFrame(word, revealedPositions) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const allRevealed = revealedPositions.size === word.length;
  drawHeader(ctx, 'Termo Bíblico', allRevealed ? 'Palavra revelada!' : 'Revelando a palavra de hoje...');

  const cellSize = 130;
  const gap = 16;
  const totalWidth = word.length * cellSize + (word.length - 1) * gap;
  const startX = (SIZE - totalWidth) / 2;
  const y = 420;

  for (let i = 0; i < word.length; i++) {
    const x = startX + i * (cellSize + gap);
    const revealed = revealedPositions.has(i);

    ctx.fillStyle = revealed ? '#6b8e23' : '#fffaf0';
    ctx.strokeStyle = revealed ? '#6b8e23' : '#e3cfa3';
    ctx.lineWidth = 3;
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.strokeRect(x, y, cellSize, cellSize);

    if (revealed) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(word[i], x + cellSize / 2, y + cellSize / 2 + 4);
      ctx.textBaseline = 'alphabetic';
    }
  }

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Jogue a versão completa no link da bio', SIZE / 2, SIZE - 90);

  return canvas;
}

function generateTermoFrames(date) {
  const dayIndex = dayOfYear(date);
  const index = dayIndex % TERMO_WORDS.length;
  const word = TERMO_WORDS[index];
  const order = shuffledIndices(word.length, dayIndex + 1);

  const frames = [];
  const revealedPositions = new Set();
  for (let step = 0; step < word.length; step++) {
    revealedPositions.add(order[step]);
    frames.push(drawTermoFrame(word, new Set(revealedPositions)));
  }
  return { frames, word };
}

function drawConexoTeaser(set) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, 'Conexões Bíblicas', 'Agrupe as 16 palavras em 4 temas');

  const words = set.categories.flatMap(cat => cat.words);
  const cols = 4;
  const cellSize = 200;
  const gap = 14;
  const totalWidth = cols * cellSize + (cols - 1) * gap;
  const startX = (SIZE - totalWidth) / 2;
  const startY = 280;

  words.forEach((word, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cellSize + gap);
    const y = startY + row * (cellSize * 0.62 + gap);
    const h = cellSize * 0.62;

    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = '#e3cfa3';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, cellSize, h);
    ctx.strokeRect(x, y, cellSize, h);

    ctx.fillStyle = '#3e2c1c';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, x + cellSize / 2, y + h / 2);
    ctx.textBaseline = 'alphabetic';
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Jogue e descubra os grupos no link da bio', SIZE / 2, SIZE - 90);

  return canvas;
}

function buildTermoCaption(word, date) {
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  return [
    'Termo Bíblico do dia',
    '',
    `Acompanhe a palavra de hoje sendo revelada, letra por letra.`,
    `Quer tentar adivinhar antes de ver o resultado? Jogue a versão completa no link da bio.`,
    '',
    `Termo de ${dataStr}.`,
    '',
    '#termo #jogodaspalavras #biblia #devocional #fe'
  ].join('\n');
}

function buildConexoCaption(date) {
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  return [
    'Conexões Bíblicas do dia',
    '',
    '16 palavras, 4 grupos escondidos. Consegue encontrar a lógica de cada um?',
    'Sem dica por aqui, o desafio é todo seu. Jogue no link da bio.',
    '',
    `Conexões de ${dataStr}.`,
    '',
    '#conexoes #jogodaspalavras #biblia #devocional #fe'
  ].join('\n');
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const date = new Date();
  const dateKey = todayKey(date);
  const isTermoDay = dayOfYear(date) % 2 === 0;

  if (isTermoDay) {
    const { frames, word } = generateTermoFrames(date);
    frames.forEach((canvas, i) => {
      const framePath = path.join(OUTPUT_DIR, `game-${dateKey}-${i + 1}.png`);
      fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
      console.log(`Frame ${i + 1} gerado: ${framePath}`);
    });
    const captionPath = path.join(OUTPUT_DIR, `game-${dateKey}.txt`);
    fs.writeFileSync(captionPath, buildTermoCaption(word, date));
    const metaPath = path.join(OUTPUT_DIR, `game-${dateKey}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({ type: 'termo', frameCount: frames.length }));
    console.log(`Legenda gerada: ${captionPath}`);
  } else {
    const setIndex = dayOfYear(date) % CONEXO_SETS.length;
    const canvas = drawConexoTeaser(CONEXO_SETS[setIndex]);
    const imagePath = path.join(OUTPUT_DIR, `game-${dateKey}-1.png`);
    fs.writeFileSync(imagePath, canvas.toBuffer('image/png'));
    const captionPath = path.join(OUTPUT_DIR, `game-${dateKey}.txt`);
    fs.writeFileSync(captionPath, buildConexoCaption(date));
    const metaPath = path.join(OUTPUT_DIR, `game-${dateKey}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({ type: 'conexo', frameCount: 1 }));
    console.log(`Imagem gerada: ${imagePath}`);
    console.log(`Legenda gerada: ${captionPath}`);
  }
}

main();
