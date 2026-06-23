const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const TERMO_WORDS = require('../docs/termo-words.js');
const CONEXO_SETS = require('../docs/conexo-words.js');
const { dayOfYear, dateKey, capitalize } = require('./lib/dates.js');
const { SIZE, baseBackground, drawHeader } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

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

function buildTermoCaption(date) {
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  return [
    'Termo Bíblico do dia',
    '',
    'Acompanhe a palavra de hoje sendo revelada, letra por letra.',
    'Quer tentar adivinhar antes de ver o resultado? Jogue a versão completa no link da bio.',
    '',
    `Termo de ${dataStr}.`,
    '',
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
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
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
    '',
    '#conexoes #jogodaspalavras #biblia #devocional #fe'
  ].join('\n');
}

function writeFrames(frames, key) {
  frames.forEach((canvas, i) => {
    const framePath = path.join(OUTPUT_DIR, `game-${key}-${i + 1}.png`);
    fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
    console.log(`Frame ${i + 1} gerado: ${framePath}`);
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const date = new Date();
  const key = dateKey(date);
  const isTermoDay = dayOfYear(date) % 2 === 0;

  const captionPath = path.join(OUTPUT_DIR, `game-${key}.txt`);
  const metaPath = path.join(OUTPUT_DIR, `game-${key}.json`);
  const donationCanvas = await drawDonationCard();

  if (isTermoDay) {
    const { frames } = generateTermoFrames(date);
    const allFrames = [...frames, donationCanvas];
    writeFrames(allFrames, key);
    fs.writeFileSync(captionPath, buildTermoCaption(date));
    fs.writeFileSync(metaPath, JSON.stringify({ type: 'termo', frameCount: allFrames.length }));
  } else {
    const setIndex = dayOfYear(date) % CONEXO_SETS.length;
    const canvas = drawConexoTeaser(CONEXO_SETS[setIndex]);
    const allFrames = [canvas, donationCanvas];
    writeFrames(allFrames, key);
    fs.writeFileSync(captionPath, buildConexoCaption(date));
    fs.writeFileSync(metaPath, JSON.stringify({ type: 'conexo', frameCount: allFrames.length }));
  }

  console.log(`Legenda gerada: ${captionPath}`);
}

main();
