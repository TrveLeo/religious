const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const DEVOTIONALS = require('../docs/content.js');
const TRIVIA_QUESTIONS = require('../docs/trivia-questions.js');
const REVEAL_PROMPTS = require('../docs/reveal-prompts.js');
const POLL_PROMPTS = require('../docs/poll-prompts.js');
const { dayOfYear, dateKey, capitalize } = require('./lib/dates.js');
const { wrapText } = require('./lib/card-canvas.js');
const { HOOKS, CTAS, pickByDay } = require('./lib/engagement.js');
const { buildHashtags } = require('./lib/hashtags.js');

const WIDTH = 1080;
const HEIGHT = 1920;
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const AUDIO_DIR = path.join(__dirname, '..', 'docs', 'assets', 'audio');
const SECONDS_PER_FRAME = 4;
const FADE_OUT_SECONDS = 1.5;

const TYPES = ['devotional', 'quote', 'trivia', 'reveal', 'impact', 'poll', 'weekly'];

const IMPACT_POINTS = [
  'Hospedagem e domínio do site, que ficam no ar todos os dias do ano.',
  'O tempo dedicado a escrever cada devocional com calma e cuidado.',
  'A manutenção dos jogos (Termo e Conexões) e das ferramentas usadas aqui.',
  'Pequenos custos de automação que ajudam a publicar todo santo dia.',
  'Melhorias na infraestrutura e a criação de uma newsletter.',
];

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function pickType(date) {
  const forced = process.env.REEL_TYPE;
  if (forced && TYPES.includes(forced)) return forced;
  return TYPES[dayOfYear(date) % TYPES.length];
}

// ── drawing helpers ──────────────────────────────────────────────────────────

function makeCanvas() {
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

  ctx.textAlign = 'center';
  return { canvas, ctx };
}

function drawText(ctx, text, font, color, y) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(text, WIDTH / 2, y);
}

function drawWrapped(ctx, text, font, color, startY, lineHeight) {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, text, WIDTH - 200);
  lines.forEach((l, i) => ctx.fillText(l, WIDTH / 2, startY + i * lineHeight));
  return lines.length;
}

function drawOptionBox(ctx, letter, text, y, highlight = false) {
  const bw = WIDTH - 240, bh = 120, bx = 120;
  ctx.fillStyle = highlight ? '#6b8e23' : '#fffaf0';
  ctx.strokeStyle = highlight ? '#6b8e23' : '#a0522d';
  ctx.lineWidth = 3;
  ctx.fillRect(bx, y, bw, bh);
  ctx.strokeRect(bx, y, bw, bh);
  ctx.fillStyle = highlight ? '#ffffff' : '#a0522d';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, bx + 36, y + bh / 2);
  ctx.fillStyle = highlight ? '#ffffff' : '#3e2c1c';
  ctx.font = '34px Georgia, serif';
  ctx.fillText(text, bx + 110, y + bh / 2);
  ctx.textBaseline = 'alphabetic';
}

// ── per-type frame builders ──────────────────────────────────────────────────

function framesDevotional(date) {
  const dayIndex = dayOfYear(date);
  const entry = DEVOTIONALS[dayIndex % DEVOTIONALS.length];
  const hook = pickByDay(HOOKS, dayIndex);

  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawText(ctx1, 'Devocional Diário', 'italic 34px Georgia, serif', '#9c7a4e', 220);
  drawWrapped(ctx1, hook, 'bold 56px Georgia, serif', '#4a3420', HEIGHT / 2 - 80, 64);

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  ctx2.font = 'italic 48px Georgia, serif';
  const vLines = wrapText(ctx2, `"${entry.verse}"`, WIDTH - 200);
  const lh = 64;
  const startY = HEIGHT / 2 - (vLines.length * lh) / 2 + lh / 2;
  ctx2.fillStyle = '#4a3420';
  ctx2.textAlign = 'center';
  vLines.forEach((l, i) => ctx2.fillText(l, WIDTH / 2, startY + i * lh));
  drawText(ctx2, entry.ref, 'bold 40px Georgia, serif', '#6b4226', startY + vLines.length * lh + 50);

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawWrapped(ctx3, entry.title, 'bold 52px Georgia, serif', '#4a3420', HEIGHT / 2 - 80, 64);
  drawText(ctx3, 'Devocional completo no link da bio', '30px Georgia, serif', '#9c7a4e', HEIGHT - 160);

  return [c1, c2, c3];
}

function framesQuote(date) {
  const dayIndex = dayOfYear(date);
  const offset = Math.floor(DEVOTIONALS.length / 2);
  const entry = DEVOTIONALS[(dayIndex + offset) % DEVOTIONALS.length];
  const hook = pickByDay(HOOKS, dayIndex + 1);
  const cta = pickByDay(CTAS, dayIndex + 2);

  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawWrapped(ctx1, hook, 'bold 56px Georgia, serif', '#4a3420', HEIGHT / 2 - 80, 64);

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  drawText(ctx2, '“', 'bold 120px Georgia, serif', '#a0522d', 380);
  ctx2.font = 'italic 48px Georgia, serif';
  const qLines = wrapText(ctx2, entry.verse, WIDTH - 200);
  const lh = 64;
  const startY = HEIGHT / 2 - (qLines.length * lh) / 2 + lh / 2;
  ctx2.fillStyle = '#4a3420';
  ctx2.textAlign = 'center';
  qLines.forEach((l, i) => ctx2.fillText(l, WIDTH / 2, startY + i * lh));
  drawText(ctx2, entry.ref, 'bold 40px Georgia, serif', '#6b4226', startY + qLines.length * lh + 50);

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawWrapped(ctx3, cta, 'bold 48px Georgia, serif', '#4a3420', HEIGHT / 2 - 60, 64);
  drawText(ctx3, 'Devocional Diário no link da bio', '30px Georgia, serif', '#9c7a4e', HEIGHT - 160);

  return [c1, c2, c3];
}

function framesTrivia(date) {
  const dayIndex = dayOfYear(date);
  const trivia = TRIVIA_QUESTIONS[dayIndex % TRIVIA_QUESTIONS.length];

  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawText(ctx1, 'Trivia Bíblica', 'bold 44px Georgia, serif', '#6b4226', 200);
  drawText(ctx1, 'Você sabe responder?', 'italic 32px Georgia, serif', '#9c7a4e', 255);
  ctx1.font = 'bold 44px Georgia, serif';
  let y1 = 370;
  wrapText(ctx1, trivia.question, WIDTH - 200).forEach(l => {
    ctx1.fillStyle = '#4a3420'; ctx1.textAlign = 'center';
    ctx1.fillText(l, WIDTH / 2, y1); y1 += 58;
  });
  y1 += 30;
  trivia.options.slice(0, 2).forEach((opt, i) => {
    drawOptionBox(ctx1, OPTION_LETTERS[i], opt, y1 + i * 145);
  });

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  drawText(ctx2, 'Pense bem...', 'bold 60px Georgia, serif', '#4a3420', HEIGHT / 2 - 80);
  drawText(ctx2, 'Comenta sua resposta!', 'italic 42px Georgia, serif', '#9c7a4e', HEIGHT / 2);
  let y2 = HEIGHT / 2 + 120;
  trivia.options.slice(2).forEach((opt, i) => {
    drawOptionBox(ctx2, OPTION_LETTERS[i + 2], opt, y2 + i * 145);
  });

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawText(ctx3, 'Resposta', 'bold 44px Georgia, serif', '#6b4226', 200);
  const answerLabel = `${OPTION_LETTERS[trivia.correctIndex]}. ${trivia.options[trivia.correctIndex]}`;
  drawWrapped(ctx3, answerLabel, 'bold 52px Georgia, serif', '#6b8e23', HEIGHT / 2 - 100, 64);
  if (trivia.explanation) {
    drawWrapped(ctx3, trivia.explanation, 'italic 34px Georgia, serif', '#4a3420', HEIGHT / 2 + 80, 48);
  }

  return [c1, c2, c3];
}

function framesReveal(date) {
  const dayIndex = dayOfYear(date);
  const item = REVEAL_PROMPTS[dayIndex % REVEAL_PROMPTS.length];

  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawText(ctx1, item.label, 'bold 44px Georgia, serif', '#6b4226', 200);
  drawText(ctx1, 'Você saberia responder?', 'italic 32px Georgia, serif', '#9c7a4e', 255);
  drawWrapped(ctx1, item.prompt, 'italic 44px Georgia, serif', '#4a3420', HEIGHT / 2 - 60, 60);

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  drawText(ctx2, 'Comenta seu palpite!', 'bold 56px Georgia, serif', '#4a3420', HEIGHT / 2 - 60);
  drawText(ctx2, 'A resposta vem no próximo slide', 'italic 36px Georgia, serif', '#9c7a4e', HEIGHT / 2 + 20);

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawText(ctx3, 'Resposta', 'bold 44px Georgia, serif', '#6b4226', 200);
  drawWrapped(ctx3, item.answer, 'bold 52px Georgia, serif', '#6b8e23', HEIGHT / 2 - 100, 64);
  if (item.explanation) {
    drawWrapped(ctx3, item.explanation, 'italic 34px Georgia, serif', '#4a3420', HEIGHT / 2 + 80, 48);
  }

  return [c1, c2, c3];
}

function framesImpact() {
  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawWrapped(ctx1, 'Para onde vai sua contribuição', 'bold 52px Georgia, serif', '#6b4226', HEIGHT / 2 - 120, 64);
  drawText(ctx1, 'Com transparência e gratidão', 'italic 36px Georgia, serif', '#9c7a4e', HEIGHT / 2 + 20);

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  drawText(ctx2, 'Seu apoio sustenta:', 'bold 44px Georgia, serif', '#6b4226', 200);
  let y = 300;
  IMPACT_POINTS.forEach(pt => {
    ctx2.fillStyle = '#a0522d';
    ctx2.font = 'bold 36px Georgia, serif';
    ctx2.textAlign = 'left';
    ctx2.fillText('•', 90, y);
    ctx2.fillStyle = '#3e2c1c';
    ctx2.font = '30px Georgia, serif';
    wrapText(ctx2, pt, WIDTH - 240).forEach(l => { ctx2.fillText(l, 130, y); y += 44; });
    y += 16;
  });

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawWrapped(ctx3, 'Contribua com o que puder', 'bold 52px Georgia, serif', '#6b4226', HEIGHT / 2 - 80, 64);
  drawText(ctx3, 'Link da bio', 'italic 42px Georgia, serif', '#9c7a4e', HEIGHT / 2);
  drawText(ctx3, 'Obrigado 🙏', '36px Georgia, serif', '#4a3420', HEIGHT / 2 + 80);

  return [c1, c2, c3];
}

function framesPoll(date) {
  const dayIndex = dayOfYear(date);
  const poll = POLL_PROMPTS[dayIndex % POLL_PROMPTS.length];

  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawText(ctx1, 'Enquete da Semana', 'bold 50px Georgia, serif', '#6b4226', 200);
  drawText(ctx1, 'Comenta sua resposta', 'italic 34px Georgia, serif', '#9c7a4e', 255);
  drawWrapped(ctx1, poll.theme, 'bold 46px Georgia, serif', '#4a3420', HEIGHT / 2 - 60, 60);

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  drawWrapped(ctx2, poll.theme, 'bold 40px Georgia, serif', '#4a3420', 200, 52);
  drawOptionBox(ctx2, 'A', poll.a, 420);
  drawOptionBox(ctx2, 'B', poll.b, 580);

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawText(ctx3, 'Comenta abaixo!', 'bold 56px Georgia, serif', '#4a3420', HEIGHT / 2 - 60);
  drawText(ctx3, 'A ou B — qual é a sua?', 'italic 42px Georgia, serif', '#9c7a4e', HEIGHT / 2 + 20);
  drawText(ctx3, 'Devocional Diário no link da bio', '30px Georgia, serif', '#9c7a4e', HEIGHT - 160);

  return [c1, c2, c3];
}

function framesWeekly(date) {
  const dayIndex = dayOfYear(date);
  const weekIndex = Math.floor(dayIndex / 7);
  const start = (weekIndex * 7) % DEVOTIONALS.length;
  const entries = Array.from({ length: 7 }, (_, i) => DEVOTIONALS[(start + i) % DEVOTIONALS.length]);

  const { canvas: c1, ctx: ctx1 } = makeCanvas();
  drawText(ctx1, 'Plano da Semana', 'bold 56px Georgia, serif', '#6b4226', HEIGHT / 2 - 80);
  drawText(ctx1, '7 versículos pra orar e meditar', 'italic 38px Georgia, serif', '#9c7a4e', HEIGHT / 2);
  drawText(ctx1, 'Salva para não perder', '32px Georgia, serif', '#a0522d', HEIGHT / 2 + 80);

  const { canvas: c2, ctx: ctx2 } = makeCanvas();
  drawText(ctx2, 'Plano da Semana', 'bold 40px Georgia, serif', '#6b4226', 180);
  let y = 270;
  entries.forEach((entry, i) => {
    ctx2.fillStyle = '#a0522d'; ctx2.font = 'bold 32px Georgia, serif'; ctx2.textAlign = 'left';
    ctx2.fillText(WEEKDAYS[i], 120, y);
    ctx2.fillStyle = '#4a3420'; ctx2.font = '30px Georgia, serif'; ctx2.textAlign = 'right';
    ctx2.fillText(entry.ref, WIDTH - 120, y);
    ctx2.strokeStyle = '#e3cfa3'; ctx2.lineWidth = 1;
    ctx2.beginPath(); ctx2.moveTo(120, y + 10); ctx2.lineTo(WIDTH - 120, y + 10); ctx2.stroke();
    y += 80;
  });

  const { canvas: c3, ctx: ctx3 } = makeCanvas();
  drawText(ctx3, 'Salva e volta aqui todo dia', 'bold 52px Georgia, serif', '#4a3420', HEIGHT / 2 - 60);
  drawText(ctx3, 'Devocional completo no link da bio', 'italic 36px Georgia, serif', '#9c7a4e', HEIGHT / 2 + 20);

  return [c1, c2, c3];
}

function buildFrames(type, date) {
  switch (type) {
    case 'devotional': return framesDevotional(date);
    case 'quote':      return framesQuote(date);
    case 'trivia':     return framesTrivia(date);
    case 'reveal':     return framesReveal(date);
    case 'impact':     return framesImpact();
    case 'poll':       return framesPoll(date);
    case 'weekly':     return framesWeekly(date);
    default:           return framesDevotional(date);
  }
}

// ── video assembly ───────────────────────────────────────────────────────────

function pickAudioTrack(dayIndex) {
  if (!fs.existsSync(AUDIO_DIR)) return null;
  const tracks = fs.readdirSync(AUDIO_DIR).filter(n => n.toLowerCase().endsWith('.mp3')).sort();
  if (!tracks.length) return null;
  return path.join(AUDIO_DIR, pickByDay(tracks, dayIndex));
}

function assembleVideo(framePaths, outputPath, dayIndex) {
  const listPath = `${outputPath}.txt`;
  const listContent = framePaths.map(p => `file '${p}'\nduration ${SECONDS_PER_FRAME}`).join('\n')
    + `\nfile '${framePaths[framePaths.length - 1]}'\n`;
  fs.writeFileSync(listPath, listContent);

  const totalDuration = framePaths.length * SECONDS_PER_FRAME;
  const audioTrack = pickAudioTrack(dayIndex);

  if (audioTrack) {
    const fadeStart = Math.max(0, totalDuration - FADE_OUT_SECONDS);
    execFileSync('ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
      '-stream_loop', '-1', '-i', audioTrack,
      '-vf', 'fps=30,format=yuv420p',
      '-af', `afade=t=out:st=${fadeStart}:d=${FADE_OUT_SECONDS}`,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', outputPath,
    ]);
  } else {
    execFileSync('ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0', '-i', listPath,
      '-vf', 'fps=30,format=yuv420p',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', outputPath,
    ]);
  }

  fs.unlinkSync(listPath);
}

// ── caption ──────────────────────────────────────────────────────────────────

function buildCaption(type, date) {
  const dayIndex = dayOfYear(date);
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  const hook = pickByDay(HOOKS, dayIndex + 2);
  const cta = pickByDay(CTAS, dayIndex + 4);

  const typeLabel = {
    devotional: 'Devocional do dia',
    quote:      'Versículo do dia',
    trivia:     'Trivia bíblica do dia',
    reveal:     'Desafio bíblico do dia',
    impact:     'Por que apoiar o Devocional Diário',
    poll:       'Enquete da semana',
    weekly:     'Plano de leitura da semana',
  }[type];

  return [
    hook,
    '',
    typeLabel,
    '',
    dataStr + '.',
    '',
    cta,
    '',
    buildHashtags('reel', dayIndex),
  ].join('\n');
}

// ── main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const dayIndex = dayOfYear(date);
  const type = pickType(date);

  console.log(`Tipo do reel: ${type}`);

  const frames = buildFrames(type, date);
  const framePaths = frames.map((canvas, i) => {
    const p = path.join(OUTPUT_DIR, `reel-frame-${key}-${i + 1}.png`);
    fs.writeFileSync(p, canvas.toBuffer('image/png'));
    return p;
  });

  const videoPath = path.join(OUTPUT_DIR, `reel-${key}.mp4`);
  assembleVideo(framePaths, videoPath, dayIndex);
  framePaths.forEach(p => fs.unlinkSync(p));

  const captionPath = path.join(OUTPUT_DIR, `reel-${key}.txt`);
  fs.writeFileSync(captionPath, buildCaption(type, date));

  console.log(`Reel gerado: ${videoPath}`);
  console.log(`Legenda gerada: ${captionPath}`);
}

main();
