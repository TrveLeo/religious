const SIZE = 1080;

const PALETTE = {
  border: '#a0522d',
  borderInner: '#e3cfa3',
  title: '#6b4226',
  subtitle: '#9c7a4e'
};

function baseBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, '#fdf6e3');
  gradient.addColorStop(0.45, '#f2e2bd');
  gradient.addColorStop(1, '#e8cf9e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = PALETTE.border;
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, SIZE - 80, SIZE - 80);
  ctx.strokeStyle = PALETTE.borderInner;
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, SIZE - 112, SIZE - 112);
}

function drawHeader(ctx, title, subtitle) {
  const centerX = SIZE / 2;
  ctx.fillStyle = PALETTE.title;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, centerX, 150);

  ctx.fillStyle = PALETTE.subtitle;
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText(subtitle, centerX, 195);
}

function drawFooter(ctx, text) {
  ctx.fillStyle = PALETTE.subtitle;
  ctx.font = '26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, SIZE / 2, SIZE - 90);
}

// O canvas não renderiza emoji colorido (vira glyph quebrado), então removemos
// os emojis ao desenhar na imagem. Nas legendas eles continuam.
function stripEmoji(text) {
  return text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
}

// Caixinha discreta com chamada pra comentar e salvar, desenhada acima do
// rodapé. Reaproveitada pelos cards quadrados (devocional, citação).
function drawEngagementBadge(ctx, commentBait, saveBait) {
  const centerX = SIZE / 2;
  const y = SIZE - 175;

  ctx.fillStyle = '#a0522d';
  ctx.font = 'bold 27px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(stripEmoji(commentBait), centerX, y);

  ctx.fillStyle = '#6b4226';
  ctx.font = 'italic 25px Georgia, serif';
  ctx.fillText(stripEmoji(saveBait), centerX, y + 38);
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

module.exports = { SIZE, PALETTE, baseBackground, drawHeader, drawFooter, drawEngagementBadge, stripEmoji, wrapText };
