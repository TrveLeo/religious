require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { graphRequest } = require('./lib/graph-api.js');
const { dateKey } = require('./lib/dates.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const HISTORY_PATH = path.join(OUTPUT_DIR, 'insights-history.json');

const MEDIA_METRICS = ['reach', 'saved', 'shares', 'total_interactions'];

async function fetchRecentMedia(limit = 20) {
  const result = await graphRequest('GET', `${IG_USER_ID}/media`, {
    fields: 'id,caption,media_type,timestamp,like_count,comments_count,permalink',
    limit,
    access_token: IG_ACCESS_TOKEN
  });
  return result.data || [];
}

async function fetchMediaInsights(mediaId) {
  try {
    const result = await graphRequest('GET', `${mediaId}/insights`, {
      metric: MEDIA_METRICS.join(','),
      access_token: IG_ACCESS_TOKEN
    });
    const values = {};
    for (const item of result.data || []) {
      values[item.name] = item.values?.[0]?.value ?? null;
    }
    return values;
  } catch (err) {
    console.error(`Falha ao buscar insights de ${mediaId}: ${err.message}`);
    return null;
  }
}

function loadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

function captionPreview(caption) {
  if (!caption) return '(sem legenda)';
  const firstLine = caption.split('\n')[0];
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine;
}

async function main() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID');
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const media = await fetchRecentMedia();
  const history = loadHistory();
  const knownIds = new Set(history.map(entry => entry.id));

  const collectedAt = dateKey(new Date());
  let newEntries = 0;

  for (const item of media) {
    const insights = await fetchMediaInsights(item.id);

    const entry = {
      id: item.id,
      timestamp: item.timestamp,
      media_type: item.media_type,
      caption_preview: captionPreview(item.caption),
      permalink: item.permalink,
      like_count: item.like_count ?? null,
      comments_count: item.comments_count ?? null,
      insights,
      collected_at: collectedAt
    };

    const existingIndex = history.findIndex(h => h.id === item.id);
    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.push(entry);
      newEntries++;
    }

    console.log(`${item.timestamp} | ${item.media_type} | ${captionPreview(item.caption)}`);
    console.log(`  curtidas: ${item.like_count} | comentários: ${item.comments_count} | alcance: ${insights?.reach ?? '-'} | salvos: ${insights?.saved ?? '-'} | compartilhamentos: ${insights?.shares ?? '-'} | interações totais: ${insights?.total_interactions ?? '-'}`);
  }

  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  saveHistory(history);

  console.log(`\n${media.length} posts verificados (${newEntries} novos). Histórico salvo em ${HISTORY_PATH}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
