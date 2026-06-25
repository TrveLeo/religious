const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { publishCarousel, requireEnv } = require('./lib/publish.js');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const FRAME_COUNT = 3;

async function publishTodayReveal() {
  const { baseUrl } = requireEnv();
  const key = dateKey(new Date());

  const captionPath = path.join(OUTPUT_DIR, `reveal-${key}.txt`);
  for (let i = 1; i <= FRAME_COUNT; i++) {
    if (!fs.existsSync(path.join(OUTPUT_DIR, `reveal-${key}-${i}.png`))) {
      throw new Error('Imagens do desafio de hoje não encontradas. Rode "npm run generate-reveal" antes.');
    }
  }
  if (!fs.existsSync(captionPath)) {
    throw new Error('Legenda do desafio de hoje não encontrada.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  const urls = [];
  for (let i = 1; i <= FRAME_COUNT; i++) {
    urls.push(`${baseUrl}/output/reveal-${key}-${i}.png`);
  }

  await publishCarousel(urls, caption);
}

publishTodayReveal().catch(err => {
  console.error(err.message);
  process.exit(1);
});
