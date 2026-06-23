const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const { dateKey, dayOfYear } = require('./lib/dates.js');
const { SIZE, baseBackground, wrapText } = require('./lib/card-canvas.js');
const { drawDonationCard } = require('./lib/donation-card.js');
const { HOOKS, CTAS, pickByDay } = require('./lib/engagement.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

const POINTS = [
  'Hospedagem e domínio do site, que ficam no ar todos os dias do ano.',
  'O tempo dedicado a escrever cada devocional com calma e cuidado.',
  'A manutenção dos jogos (Termo e Conexões) e das ferramentas usadas aqui.',
  'Pequenos custos de automação que ajudam a publicar todo santo dia.'
];

function drawImpactCard() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Para onde vai sua contribuição', centerX, 150);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('Com transparência e gratidão', centerX, 195);

  ctx.textAlign = 'left';
  const leftX = 120;
  const maxWidth = SIZE - 240;
  let y = 290;

  POINTS.forEach((point) => {
    ctx.fillStyle = '#a0522d';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('•', leftX, y);

    ctx.fillStyle = '#4a3420';
    ctx.font = '32px Georgia, serif';
    const lines = wrapText(ctx, point, maxWidth - 50);
    lines.forEach((line, i) => {
      ctx.fillText(line, leftX + 45, y + i * 42);
    });

    y += lines.length * 42 + 45;
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('Não existe planilha bonita, só gente cuidando disso com carinho.', centerX, SIZE - 90);

  return canvas;
}

function buildCaption(date) {
  const dayIndex = dayOfYear(date);
  const hook = pickByDay(HOOKS, dayIndex + 7);
  const cta = pickByDay(CTAS, dayIndex + 5);

  return [
    hook,
    '',
    'Esse projeto não tem patrocínio nem propaganda. Ele se mantém com tempo e com a ajuda de quem quiser contribuir.',
    '',
    'Sua contribuição via Pix ajuda a manter o site no ar, os jogos funcionando e os devocionais sendo escritos todos os dias.',
    '',
    cta,
    'Arrasta até o fim e veja como apoiar via Pix, se Deus colocar isso no seu coração.',
    '',
    '#fe #biblia #devocional #apoie #comunidade'
  ].join('\n');
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const date = new Date();
  const key = dateKey(date);

  const impactCanvas = drawImpactCard();
  const donationCanvas = await drawDonationCard();

  const impactPath = path.join(OUTPUT_DIR, `impact-${key}-1.png`);
  const donationPath = path.join(OUTPUT_DIR, `impact-${key}-2.png`);
  const captionPath = path.join(OUTPUT_DIR, `impact-${key}.txt`);

  fs.writeFileSync(impactPath, impactCanvas.toBuffer('image/png'));
  fs.writeFileSync(donationPath, donationCanvas.toBuffer('image/png'));
  fs.writeFileSync(captionPath, buildCaption(date));

  console.log(`Card de impacto gerado: ${impactPath}`);
  console.log(`Card de doação gerado: ${donationPath}`);
  console.log(`Legenda gerada: ${captionPath}`);
}

main();
