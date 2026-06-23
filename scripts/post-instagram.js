require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { graphRequest, waitUntilReady } = require('./lib/graph-api.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

async function publishToday() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const key = dateKey(new Date());
  const devotionalImagePath = path.join(OUTPUT_DIR, `devocional-${key}.png`);
  const donationImagePath = path.join(OUTPUT_DIR, `doacao-${key}.png`);
  const captionPath = path.join(OUTPUT_DIR, `devocional-${key}.txt`);

  if (!fs.existsSync(devotionalImagePath) || !fs.existsSync(donationImagePath) || !fs.existsSync(captionPath)) {
    throw new Error('Imagens/legenda do dia não encontradas. Rode "npm run generate-image" antes.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  const devotionalImageUrl = `${SITE_BASE_URL}/output/devocional-${key}.png`;
  const donationImageUrl = `${SITE_BASE_URL}/output/doacao-${key}.png`;

  console.log(`Criando item 1 (devocional): ${devotionalImageUrl}`);
  const item1 = await graphRequest('POST', `${IG_USER_ID}/media`, {
    image_url: devotionalImageUrl,
    is_carousel_item: true,
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Criando item 2 (doação): ${donationImageUrl}`);
  const item2 = await graphRequest('POST', `${IG_USER_ID}/media`, {
    image_url: donationImageUrl,
    is_carousel_item: true,
    access_token: IG_ACCESS_TOKEN
  });

  console.log('Criando carrossel...');
  const carousel = await graphRequest('POST', `${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    caption,
    children: `${item1.id},${item2.id}`,
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

publishToday().catch(err => {
  console.error(err.message);
  process.exit(1);
});
