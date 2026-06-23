require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { graphRequest, waitUntilReady } = require('./lib/graph-api.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const FRAME_COUNT = 3;

async function publishTodayTrivia() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const key = dateKey(new Date());
  const captionPath = path.join(OUTPUT_DIR, `trivia-${key}.txt`);

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const framePath = path.join(OUTPUT_DIR, `trivia-${key}-${i}.png`);
    if (!fs.existsSync(framePath)) {
      throw new Error('Imagens da trivia de hoje não encontradas. Rode "npm run generate-trivia" antes.');
    }
  }
  if (!fs.existsSync(captionPath)) {
    throw new Error('Legenda da trivia de hoje não encontrada.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  const childIds = [];

  for (let i = 1; i <= FRAME_COUNT; i++) {
    const imageUrl = `${SITE_BASE_URL}/output/trivia-${key}-${i}.png`;
    console.log(`Criando item ${i}: ${imageUrl}`);
    const item = await graphRequest('POST', `${IG_USER_ID}/media`, {
      image_url: imageUrl,
      is_carousel_item: true,
      access_token: IG_ACCESS_TOKEN
    });
    childIds.push(item.id);
  }

  console.log('Criando carrossel...');
  const carousel = await graphRequest('POST', `${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    caption,
    children: childIds.join(','),
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Carrossel criado: ${carousel.id}`);
  console.log('Aguardando processamento...');
  await waitUntilReady(carousel.id, IG_ACCESS_TOKEN);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${IG_USER_ID}/media_publish`, {
    creation_id: carousel.id,
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Publicado com sucesso! Post ID: ${published.id}`);
}

publishTodayTrivia().catch(err => {
  console.error(err.message);
  process.exit(1);
});
