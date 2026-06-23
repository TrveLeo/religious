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

    if (method === 'GET') {
      url.search = body;
    }

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

async function publishToday() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID || !SITE_BASE_URL) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID, SITE_BASE_URL');
  }

  const dateKey = todayKey();
  const devotionalImagePath = path.join(OUTPUT_DIR, `devocional-${dateKey}.png`);
  const donationImagePath = path.join(OUTPUT_DIR, `doacao-${dateKey}.png`);
  const captionPath = path.join(OUTPUT_DIR, `devocional-${dateKey}.txt`);

  if (!fs.existsSync(devotionalImagePath) || !fs.existsSync(donationImagePath) || !fs.existsSync(captionPath)) {
    throw new Error('Imagens/legenda do dia não encontradas. Rode "npm run generate-image" antes.');
  }

  const caption = fs.readFileSync(captionPath, 'utf-8');
  const devotionalImageUrl = `${SITE_BASE_URL}/output/devocional-${dateKey}.png`;
  const donationImageUrl = `${SITE_BASE_URL}/output/doacao-${dateKey}.png`;

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
