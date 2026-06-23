require('dotenv').config();
const fs = require('fs');
const path = require('path');

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_KV_NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'click-stats.json');

const API_BASE = 'https://api.cloudflare.com/client/v4';

async function cloudflareRequest(url) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudflare API retornou ${response.status}: ${errorBody}`);
  }

  return response.json();
}

async function listClickKeys() {
  const url = `${API_BASE}/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/keys?prefix=clicks:`;
  const result = await cloudflareRequest(url);
  return (result.result || []).map(item => item.name);
}

async function getKeyValue(key) {
  const url = `${API_BASE}/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Falha ao buscar valor de ${key}: ${errorBody}`);
    return 0;
  }

  const text = await response.text();
  return parseInt(text, 10) || 0;
}

// Chaves no formato clicks:<kind>:<YYYY-MM-DD>, ex: clicks:bio:2026-06-23
function parseKey(key) {
  const parts = key.split(':');
  return { kind: parts[1], date: parts[2] };
}

async function main() {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_KV_NAMESPACE_ID) {
    throw new Error('Faltam variáveis no .env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_NAMESPACE_ID');
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const keys = await listClickKeys();
  const byDate = {};

  for (const key of keys) {
    const { kind, date } = parseKey(key);
    if (!kind || !date) continue;

    const value = await getKeyValue(key);

    if (!byDate[date]) byDate[date] = { date, bio: 0, pix: 0 };
    byDate[date][kind] = value;

    console.log(`${date} | ${kind} | ${value} cliques`);
  }

  const stats = Object.values(byDate).sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(stats, null, 2));

  const totalBio = stats.reduce((sum, day) => sum + (day.bio || 0), 0);
  const totalPix = stats.reduce((sum, day) => sum + (day.pix || 0), 0);

  console.log(`\n${stats.length} dias com dados (${totalBio} cliques no bio, ${totalPix} cliques no Pix no total). Salvo em ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
