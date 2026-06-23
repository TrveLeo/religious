require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { graphRequest, waitUntilReady } = require('./lib/graph-api.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayImpact() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const key = dateKey(new Date());
  const impactPath = path.join(OUTPUT_DIR, `impact-${key}-1.png`);
  const donationPath = path.join(OUTPUT_DIR, `impact-${key}-2.png`);
  const captionPath = path.join(OUTPUT_DIR, `impact-${key}.txt`);

  if (!fs.existsSync(impactPath) || !fs.existsSync(donationPath) || !fs.existsSync(captionPath)) {
    throw new Error('Imagens/legenda do card de impacto não encontradas. Rode "npm run generate-impact-card" antes.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  const impactImageUrl = `${SITE_BASE_URL}/output/impact-${key}-1.png`;
  const donationImageUrl = `${SITE_BASE_URL}/output/impact-${key}-2.png`;

  console.log(`Criando item 1 (impacto): ${impactImageUrl}`);
  const item1 = await graphRequest('POST', `${IG_USER_ID}/media`, {
    image_url: impactImageUrl,
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

publishTodayImpact().catch(err => {
  console.error(err.message);
  process.exit(1);
});
