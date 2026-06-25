// Gera a imagem de preview (Open Graph) usada quando o site é compartilhado.
// Roda só quando precisar atualizar a arte: `node scripts/generate-og-image.js`.
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const W = 1200;
const H = 630;
const OUT = path.join(__dirname, '..', 'docs', 'assets', 'og-image.png');

function main() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#fdf6e3');
  grad.addColorStop(0.5, '#f2e2bd');
  grad.addColorStop(1, '#e8cf9e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b4226';
  ctx.font = 'bold 78px Georgia, serif';
  ctx.fillText('Devocional Diário', W / 2, H / 2 - 20);

  ctx.fillStyle = '#9c7a4e';
  ctx.font = 'italic 36px Georgia, serif';
  ctx.fillText('Versículo e reflexão bíblica, todos os dias', W / 2, H / 2 + 50);

  fs.writeFileSync(OUT, canvas.toBuffer('image/png'));
  console.log(`Imagem OG gerada: ${OUT}`);
}

if (require.main === module) main();

module.exports = { main };
