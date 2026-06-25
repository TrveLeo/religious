const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const TRIVIA_QUESTIONS = require('../docs/trivia-questions.js');
const { dayOfYear, dateKey } = require('./lib/dates.js');
const { SIZE, baseBackground, drawHeader, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { HOOKS, CTAS, pickByDay } = require('./lib/engagement.js');
const { buildHashtags } = require('./lib/hashtags.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const LETTERS = ['A', 'B', 'C', 'D'];

function todayQuestion(date) {
  const index = dayOfYear(date) % TRIVIA_QUESTIONS.length;
  return TRIVIA_QUESTIONS[index];
}

function drawOptionBox(ctx, letter, text, x, y, width, height, highlight) {
  ctx.fillStyle = highlight ? '#6b8e23' : '#fffaf0';
  ctx.strokeStyle = highlight ? '#6b8e23' : '#e3cfa3';
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = highlight ? '#ffffff' : '#6b4226';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, x + 24, y + height / 2);

  ctx.fillStyle = highlight ? '#ffffff' : '#3e2c1c';
  ctx.font = '28px Georgia, serif';
  ctx.fillText(text, x + 70, y + height / 2);
  ctx.textBaseline = 'alphabetic';
}

function drawQuestionFrame(trivia) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, 'Trivia Bíblica', 'Você sabe a resposta?');

  ctx.fillStyle = '#4a3420';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.textAlign = 'center';
  const questionLines = wrapText(ctx, trivia.question, SIZE - 200);
  let y = 320;
  questionLines.forEach(line => {
    ctx.fillText(line, SIZE / 2, y);
    y += 48;
  });

  y += 40;
  const boxWidth = SIZE - 200;
  const boxHeight = 80;
  const boxX = (SIZE - boxWidth) / 2;
  trivia.options.forEach((option, i) => {
    drawOptionBox(ctx, LETTERS[i], option, boxX, y, boxWidth, boxHeight, false);
    y += boxHeight + 18;
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('Comenta sua resposta antes de arrastar', SIZE / 2, SIZE - 90);

  return canvas;
}

function drawAnswerFrame(trivia) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  drawHeader(ctx, 'Trivia Bíblica', 'Resposta');

  let y = 280;
  const boxWidth = SIZE - 200;
  const boxHeight = 80;
  const boxX = (SIZE - boxWidth) / 2;
  trivia.options.forEach((option, i) => {
    drawOptionBox(ctx, LETTERS[i], option, boxX, y, boxWidth, boxHeight, i === trivia.correctIndex);
    y += boxHeight + 18;
  });

  y += 50;
  ctx.fillStyle = '#4a3420';
  ctx.font = '28px Georgia, serif';
  ctx.textAlign = 'center';
  wrapText(ctx, trivia.explanation, SIZE - 180).forEach(line => {
    ctx.fillText(line, SIZE / 2, y);
    y += 38;
  });

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('Quer mais? Link na bio.', SIZE / 2, SIZE - 90);

  return canvas;
}

function buildCaption(trivia, date) {
  const dayIndex = dayOfYear(date);
  const hook = pickByDay(HOOKS, dayIndex + 5);
  const cta = pickByDay(CTAS, dayIndex + 4);

  return [
    hook,
    '',
    'Trivia Bíblica do dia',
    '',
    trivia.question,
    '',
    'Comenta sua resposta antes de arrastar pro lado e ver o gabarito.',
    '',
    cta,
    'Arrasta até o fim e veja como apoiar este projeto via Pix.',
    '',
    buildHashtags('trivia', dayIndex)
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const trivia = todayQuestion(date);

  const questionCanvas = drawQuestionFrame(trivia);
  const answerCanvas = drawAnswerFrame(trivia);
  const donationCanvas = await drawDonationCard();

  const frames = [questionCanvas, answerCanvas, donationCanvas];
  frames.forEach((canvas, i) => {
    const framePath = path.join(OUTPUT_DIR, `trivia-${key}-${i + 1}.png`);
    fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
    console.log(`Frame ${i + 1} gerado: ${framePath}`);
  });

  const captionPath = path.join(OUTPUT_DIR, `trivia-${key}.txt`);
  fs.writeFileSync(captionPath, buildCaption(trivia, date));
  console.log(`Legenda gerada: ${captionPath}`);
}

main();
