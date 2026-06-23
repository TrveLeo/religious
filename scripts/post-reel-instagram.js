require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { dateKey } = require('./lib/dates.js');
const { graphRequest, waitUntilReady } = require('./lib/graph-api.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');

async function publishTodayReel() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const key = dateKey(new Date());
  const videoPath = path.join(OUTPUT_DIR, `reel-${key}.mp4`);
  const captionPath = path.join(OUTPUT_DIR, `reel-${key}.txt`);

  if (!fs.existsSync(videoPath) || !fs.existsSync(captionPath)) {
    throw new Error('Reel de hoje não encontrado. Rode "npm run generate-reel" antes.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  const videoUrl = `${SITE_BASE_URL}/output/reel-${key}.mp4`;

  console.log(`Criando reel a partir de: ${videoUrl}`);
  const created = await graphRequest('POST', `${IG_USER_ID}/media`, {
    video_url: videoUrl,
    media_type: 'REELS',
    caption,
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Reel criado: ${created.id}`);
  console.log('Aguardando processamento (vídeo demora mais que imagem)...');
  await waitUntilReady(created.id, IG_ACCESS_TOKEN, 30, 10000);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${IG_USER_ID}/media_publish`, {
    creation_id: created.id,
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Reel publicado com sucesso! Post ID: ${published.id}`);
}

publishTodayReel().catch(err => {
  console.error(err.message);
  process.exit(1);
});
