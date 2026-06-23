const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const { SIZE, baseBackground } = require('./card-canvas.js');

const PIX_KEY = process.env.PIX_KEY || 'diariod777@gmail.com';
const QR_CODE_PATH = path.join(__dirname, '..', '..', 'docs', 'assets', 'pix-qrcode.png');

async function drawDonationCard() {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  baseBackground(ctx);

  const centerX = SIZE / 2;

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Apoie este trabalho', centerX, 160);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = '28px Georgia, serif';
  ctx.fillText('Se este conteúdo te abençoou,', centerX, 215);
  ctx.fillText('considere contribuir via Pix', centerX, 250);

  const qrImage = await loadImage(QR_CODE_PATH);
  const qrSize = 560;
  const qrX = centerX - qrSize / 2;
  const qrY = 300;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillText('Chave Pix (e-mail)', centerX, qrY + qrSize + 60);

  ctx.fillStyle = '#4a3420';
  ctx.font = '30px Georgia, serif';
  ctx.fillText(PIX_KEY, centerX, qrY + qrSize + 100);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('Toda contribuição ajuda a manter este projeto no ar.', centerX, SIZE - 70);

  return canvas;
}

module.exports = { drawDonationCard };
