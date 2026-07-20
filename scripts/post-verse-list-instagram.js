require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { graphRequest, waitUntilReady } = require('./lib/graph-api.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayVerseList() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const key = dateKey(new Date());
  const captionPath = path.join(OUTPUT_DIR, `verse-list-${key}.txt`);

  if (!fs.existsSync(captionPath)) {
    throw new Error(`Legenda não encontrada. Rode "npm run generate-verse-list" antes.`);
  }

  // 7 cards: capa (1) + 5 versos (2-6) + cta (7) + doação (8)
  const imageUrls = [
    ...Array.from({ length: 7 }, (_, i) => `${SITE_BASE_URL}/output/verse-list-${key}-${i + 1}.png`),
    `${SITE_BASE_URL}/output/doacao-verse-list-${key}.png`
  ];

  for (const url of imageUrls) {
    const filePath = path.join(OUTPUT_DIR, path.basename(url));
    if (!fs.existsSync(filePath)) {
      throw new Error(`Imagem não encontrada: ${filePath}`);
    }
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');

  console.log('Criando itens do carrossel...');
  const itemIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    console.log(`  Item ${i + 1}: ${url}`);
    const item = await graphRequest('POST', `${IG_USER_ID}/media`, {
      image_url: url,
      is_carousel_item: true,
      access_token: IG_ACCESS_TOKEN
    });
    itemIds.push(item.id);
  }

  console.log('Criando carrossel...');
  const carousel = await graphRequest('POST', `${IG_USER_ID}/media`, {
    media_type: 'CAROUSEL',
    caption,
    children: itemIds.join(','),
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

publishTodayVerseList().catch(err => {
  console.error(err.message);
  process.exit(1);
});
