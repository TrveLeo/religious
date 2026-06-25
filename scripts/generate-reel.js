const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const DEVOTIONALS = require('../docs/content.js');
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

function todayEntry(date) {
  const index = dayOfYear(date) % DEVOTIONALS.length;
  return DEVOTIONALS[index];
}

function baseBackground(ctx) {
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
}

function drawCenteredFrame({ topLabel, mainLines, mainFont, refLine, footer }) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;

  if (topLabel) {
    ctx.fillStyle = '#9c7a4e';
    ctx.font = 'italic 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(topLabel, centerX, 220);
  }

  ctx.fillStyle = '#4a3420';
  ctx.font = mainFont;
  ctx.textAlign = 'center';
  const lineHeight = 64;
  const totalHeight = mainLines.length * lineHeight;
  const startY = centerY - totalHeight / 2 + lineHeight / 2;
  mainLines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });

  if (refLine) {
    ctx.fillStyle = '#6b4226';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText(refLine, centerX, startY + mainLines.length * lineHeight + 50);
  }

  if (footer) {
    ctx.fillStyle = '#9c7a4e';
    ctx.font = '30px Georgia, serif';
    ctx.fillText(footer, centerX, HEIGHT - 160);
  }

  return canvas;
}

function buildFrames(entry, date) {
  const dayIndex = dayOfYear(date);
  const hook = pickByDay(HOOKS, dayIndex);

  const tmpCanvas = createCanvas(WIDTH, HEIGHT);
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.font = 'bold 56px Georgia, serif';

  const frame1 = drawCenteredFrame({
    topLabel: 'Devocional Diário',
    mainLines: wrapText(tmpCtx, hook, WIDTH - 200),
    mainFont: 'bold 56px Georgia, serif'
  });

  tmpCtx.font = 'italic 48px Georgia, serif';
  const frame2 = drawCenteredFrame({
    topLabel: null,
    mainLines: wrapText(tmpCtx, `"${entry.verse}"`, WIDTH - 200),
    mainFont: 'italic 48px Georgia, serif',
    refLine: entry.ref
  });

  tmpCtx.font = 'bold 52px Georgia, serif';
  const frame3 = drawCenteredFrame({
    topLabel: null,
    mainLines: wrapText(tmpCtx, entry.title, WIDTH - 200),
    mainFont: 'bold 52px Georgia, serif',
    footer: 'Devocional completo no link da bio'
  });

  return [frame1, frame2, frame3];
}

function pickAudioTrack(dayIndex) {
  if (!fs.existsSync(AUDIO_DIR)) return null;

  const tracks = fs.readdirSync(AUDIO_DIR)
    .filter(name => name.toLowerCase().endsWith('.mp3'))
    .sort();

  if (tracks.length === 0) return null;

  return path.join(AUDIO_DIR, pickByDay(tracks, dayIndex));
}

function assembleVideo(framePaths, outputPath, dayIndex) {
  const listPath = `${outputPath}.txt`;
  const listContent = framePaths
    .map(p => `file '${p}'\nduration ${SECONDS_PER_FRAME}`)
    .join('\n') + `\nfile '${framePaths[framePaths.length - 1]}'\n`;
  fs.writeFileSync(listPath, listContent);

  const totalDuration = framePaths.length * SECONDS_PER_FRAME;
  const audioTrack = pickAudioTrack(dayIndex);

  if (audioTrack) {
    const fadeStart = Math.max(0, totalDuration - FADE_OUT_SECONDS);
    execFileSync('ffmpeg', [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-stream_loop', '-1',
      '-i', audioTrack,
      '-vf', 'fps=30,format=yuv420p',
      '-af', `afade=t=out:st=${fadeStart}:d=${FADE_OUT_SECONDS}`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-shortest',
      outputPath
    ]);
  } else {
    execFileSync('ffmpeg', [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-vf', 'fps=30,format=yuv420p',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      outputPath
    ]);
  }

  fs.unlinkSync(listPath);
}

function buildCaption(entry, date) {
  const dayIndex = dayOfYear(date);
  const dataStr = capitalize(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
  const cta = pickByDay(CTAS, dayIndex + 6);

  return [
    pickByDay(HOOKS, dayIndex),
    '',
    entry.title,
    '',
    `"${entry.verse}" (${entry.ref})`,
    '',
    `Devocional de ${dataStr}. Confira o post completo no feed.`,
    '',
    cta,
    '',
    buildHashtags('reel', dayIndex)
  ].join('\n');
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);
  const entry = todayEntry(date);

  const frames = buildFrames(entry, date);
  const framePaths = frames.map((canvas, i) => {
    const framePath = path.join(OUTPUT_DIR, `reel-frame-${key}-${i + 1}.png`);
    fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
    return framePath;
  });

  const videoPath = path.join(OUTPUT_DIR, `reel-${key}.mp4`);
  assembleVideo(framePaths, videoPath, dayOfYear(date));

  framePaths.forEach(p => fs.unlinkSync(p));

  const captionPath = path.join(OUTPUT_DIR, `reel-${key}.txt`);
  fs.writeFileSync(captionPath, buildCaption(entry, date));

  console.log(`Reel gerado: ${videoPath}`);
  console.log(`Legenda gerada: ${captionPath}`);
}

main();
