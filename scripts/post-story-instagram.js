require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { graphRequest, waitUntilReady } = require('./lib/graph-api.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayStory() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const key = dateKey(new Date());
  const storyPath = path.join(OUTPUT_DIR, `story-${key}.png`);

  if (!fs.existsSync(storyPath)) {
    throw new Error('Story de hoje não encontrado. Rode "npm run generate-story" antes.');
  }

  const imageUrl = `${SITE_BASE_URL}/output/story-${key}.png`;

  console.log(`Criando story a partir de: ${imageUrl}`);
  const created = await graphRequest('POST', `${IG_USER_ID}/media`, {
    image_url: imageUrl,
    media_type: 'STORIES',
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Story criado: ${created.id}`);
  console.log('Aguardando processamento...');
  await waitUntilReady(created.id, IG_ACCESS_TOKEN);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${IG_USER_ID}/media_publish`, {
    creation_id: created.id,
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Story publicado com sucesso! ID: ${published.id}`);
}

publishTodayStory().catch(err => {
  console.error(err.message);
  process.exit(1);
});
