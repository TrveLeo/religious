require('dotenv').config();
const DEVOTIONALS = require('../docs/content.js');
const { dayOfYear } = require('./lib/dates.js');
const { CTAS, pickByDay } = require('./lib/engagement.js');
const { graphRequest } = require('./lib/threads-api.js');

const THREADS_ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN;
const THREADS_USER_ID = process.env.THREADS_USER_ID;
const SITE_BASE_URL = process.env.SITE_BASE_URL;

const MAX_LENGTH = 480;

function todayEntry() {
  const now = new Date();
  const index = dayOfYear(now) % DEVOTIONALS.length;
  return { entry: DEVOTIONALS[index], date: now };
}

// Pega só a primeira frase do devocional como um resumo curto, em vez do
// texto longo usado na legenda do Instagram.
function firstSentence(text) {
  const cleaned = text.replace(/\n+/g, ' ').trim();
  const match = cleaned.match(/^.*?[.!?]/);
  return match ? match[0].trim() : cleaned;
}

function buildPostText(entry, date) {
  const verseLine = `"${entry.verse}"`;
  const refLine = entry.ref;
  const summary = firstSentence(entry.text);
  const cta = pickByDay(CTAS, dayOfYear(date));
  const linkLine = SITE_BASE_URL ? `Devocional completo no link da bio.` : '';

  const parts = [verseLine, refLine, summary, cta, linkLine].filter(Boolean);
  let post = parts.join('\n\n');

  if (post.length > MAX_LENGTH) {
    // Sem CTA, pra ficar dentro do limite.
    const partsNoCta = [verseLine, refLine, summary, linkLine].filter(Boolean);
    post = partsNoCta.join('\n\n');
  }

  if (post.length > MAX_LENGTH) {
    // Ainda assim grande: corta o resumo.
    const fixed = [verseLine, refLine].join('\n\n');
    const remaining = MAX_LENGTH - fixed.length - 2;
    const trimmedSummary = summary.slice(0, Math.max(remaining, 0)).trim();
    post = [fixed, trimmedSummary].filter(Boolean).join('\n\n');
  }

  return post.slice(0, MAX_LENGTH);
}

async function publishToday() {
  if (!THREADS_ACCESS_TOKEN || !THREADS_USER_ID) {
    throw new Error('Faltam variáveis no .env: THREADS_ACCESS_TOKEN, THREADS_USER_ID');
  }

  const { entry, date } = todayEntry();
  const text = buildPostText(entry, date);

  console.log('Texto do post:');
  console.log(text);
  console.log(`(${text.length} caracteres)`);

  console.log('Criando post no Threads...');
  const created = await graphRequest('POST', `${THREADS_USER_ID}/threads`, {
    media_type: 'TEXT',
    text,
    access_token: THREADS_ACCESS_TOKEN
  });

  console.log(`Post criado: ${created.id}`);
  console.log('Publicando...');
  const published = await graphRequest('POST', `${THREADS_USER_ID}/threads_publish`, {
    creation_id: created.id,
    access_token: THREADS_ACCESS_TOKEN
  });

  console.log(`Publicado com sucesso! Post ID: ${published.id}`);
}

module.exports = { buildPostText };

if (require.main === module) {
  publishToday().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
