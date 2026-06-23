require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const GRAPH_API_VERSION = 'v21.0';
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function graphRequest(method, endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://graph.instagram.com/${GRAPH_API_VERSION}/${endpoint}`);
    const body = new URLSearchParams(params).toString();

    const options = {
      method,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    if (method === 'GET') url.search = body;

    const req = https.request(url, options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (res.statusCode >= 400) {
          reject(new Error(`Graph API error (${res.statusCode}): ${JSON.stringify(parsed)}`));
        } else {
          resolve(parsed);
        }
      });
    });

    req.on('error', reject);
    if (method !== 'GET') req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilReady(mediaId, attempts = 15, intervalMs = 4000) {
  for (let i = 0; i < attempts; i++) {
    const status = await graphRequest('GET', mediaId, {
      fields: 'status_code',
      access_token: IG_ACCESS_TOKEN
    });
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error(`Processamento da mídia falhou: ${JSON.stringify(status)}`);
    }
    await sleep(intervalMs);
  }
  throw new Error('Tempo esgotado esperando a mídia ficar pronta.');
}

async function publishTodayGame() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const dateKey = todayKey();
  const metaPath = path.join(OUTPUT_DIR, `game-${dateKey}.json`);
  const captionPath = path.join(OUTPUT_DIR, `game-${dateKey}.txt`);

  if (!fs.existsSync(metaPath) || !fs.existsSync(captionPath)) {
    throw new Error('Imagens/legenda do jogo de hoje não encontradas. Rode "npm run generate-game-images" antes.');
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const caption = fs.readFileSync(captionPath, 'utf-8');

  if (meta.frameCount === 1) {
    const imageUrl = `${SITE_BASE_URL}/output/game-${dateKey}-1.png`;
    console.log(`Publicando imagem única: ${imageUrl}`);
    const created = await graphRequest('POST', `${IG_USER_ID}/media`, {
      image_url: imageUrl,
      caption,
      access_token: IG_ACCESS_TOKEN
    });
    await waitUntilReady(created.id);
    const published = await graphRequest('POST', `${IG_USER_ID}/media_publish`, {
      creation_id: created.id,
      access_token: IG_ACCESS_TOKEN
    });
    console.log(`Publicado com sucesso! Post ID: ${published.id}`);
    return;
  }

  const childIds = [];
  for (let i = 1; i <= meta.frameCount; i++) {
    const imageUrl = `${SITE_BASE_URL}/output/game-${dateKey}-${i}.png`;
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
  await waitUntilReady(carousel.id);

  console.log('Publicando...');
  const published = await graphRequest('POST', `${IG_USER_ID}/media_publish`, {
    creation_id: carousel.id,
    access_token: IG_ACCESS_TOKEN
  });

  console.log(`Publicado com sucesso! Post ID: ${published.id}`);
}

publishTodayGame().catch(err => {
  console.error(err.message);
  process.exit(1);
});
