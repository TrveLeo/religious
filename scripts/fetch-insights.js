require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { graphRequest } = require('./lib/graph-api.js');
const { dateKey } = require('./lib/dates.js');

const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'output');
const MEDIA_HISTORY_PATH = path.join(OUTPUT_DIR, 'insights-history.json');
const ACCOUNT_HISTORY_PATH = path.join(OUTPUT_DIR, 'account-insights-history.json');

// Campos do perfil disponíveis na Instagram API with Instagram Login.
const PROFILE_FIELDS = [
  'id',
  'username',
  'name',
  'biography',
  'followers_count',
  'follows_count',
  'media_count',
  'profile_picture_url',
  'website'
];

// Campos retornados por /media (e /stories).
const MEDIA_FIELDS = [
  'id',
  'caption',
  'media_type',
  'media_product_type',
  'timestamp',
  'like_count',
  'comments_count',
  'permalink',
  'media_url',
  'thumbnail_url'
];

// Métricas de mídia por tipo. A busca é resiliente: métrica indisponível
// para o tipo é simplesmente ignorada, sem derrubar a coleta.
const MEDIA_METRICS_BY_TYPE = {
  IMAGE: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions', 'views', 'profile_visits', 'profile_activity', 'follows'],
  VIDEO: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions', 'views', 'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time', 'profile_visits', 'profile_activity', 'follows'],
  CAROUSEL_ALBUM: ['reach', 'saved', 'likes', 'comments', 'shares', 'total_interactions', 'views', 'profile_visits', 'profile_activity', 'follows']
};
const STORY_METRICS = ['reach', 'replies', 'shares', 'total_interactions', 'navigation', 'profile_visits', 'profile_activity', 'follows', 'views'];

// Métricas de conta por grupo (metric_type uniforme dentro de cada grupo).
const ACCOUNT_TOTAL_METRICS = ['reach', 'views', 'accounts_engaged', 'total_interactions', 'likes', 'comments', 'saves', 'shares', 'replies', 'follows_and_unfollows', 'profile_links_taps', 'website_clicks', 'profile_views'];
const ACCOUNT_TIME_SERIES_METRICS = ['reach', 'follower_count'];
const ACCOUNT_DEMOGRAPHIC_METRICS = ['follower_demographics', 'engaged_audience_demographics', 'reached_audience_demographics'];
const DEMOGRAPHIC_BREAKDOWNS = ['age', 'gender', 'country', 'city'];

const RANGE_DAYS = 30;

function errSummary(err) {
  const match = /Graph API error \(\d+\): (.*)$/.exec(err.message);
  let detail = match ? match[1] : err.message;
  try {
    const parsed = JSON.parse(detail);
    detail = parsed.error?.error_user_msg || parsed.error?.message || detail;
  } catch (_) {
    // mantém a string original
  }
  return detail.length > 160 ? `${detail.slice(0, 160)}...` : detail;
}

// Converte a resposta de /insights num objeto simples nome -> valor.
// Lida com as três formas: values[] (série), value único e total_value
// (com ou sem breakdowns de demografia).
function parseInsights(data) {
  const out = {};
  for (const item of data || []) {
    if (item.total_value !== undefined) {
      out[item.name] = item.total_value.breakdowns ? item.total_value : (item.total_value.value ?? null);
    } else if (Array.isArray(item.values)) {
      out[item.name] = item.values.length > 1
        ? item.values.map(v => ({ value: v.value, end_time: v.end_time }))
        : (item.values[0]?.value ?? null);
    } else {
      out[item.name] = null;
    }
  }
  return out;
}

// Busca um lote de métricas. Se o lote falhar (uma métrica inválida derruba
// o request inteiro na Graph API), refaz métrica a métrica para capturar
// tudo que estiver disponível.
async function fetchInsightsBatch(endpoint, metrics, extraParams = {}) {
  try {
    const res = await graphRequest('GET', `${endpoint}/insights`, {
      metric: metrics.join(','),
      access_token: IG_ACCESS_TOKEN,
      ...extraParams
    });
    return parseInsights(res.data);
  } catch (_) {
    const out = {};
    for (const metric of metrics) {
      try {
        const res = await graphRequest('GET', `${endpoint}/insights`, {
          metric,
          access_token: IG_ACCESS_TOKEN,
          ...extraParams
        });
        Object.assign(out, parseInsights(res.data));
      } catch (err) {
        out[metric] = { error: errSummary(err) };
      }
    }
    return out;
  }
}

function unixRange(days) {
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86400;
  return { since: String(since), until: String(until) };
}

async function fetchProfile() {
  return graphRequest('GET', IG_USER_ID, {
    fields: PROFILE_FIELDS.join(','),
    access_token: IG_ACCESS_TOKEN
  });
}

async function fetchAccountInsights() {
  const { since, until } = unixRange(RANGE_DAYS);
  const account = { range_days: RANGE_DAYS, since, until };

  account.totals = await fetchInsightsBatch(IG_USER_ID, ACCOUNT_TOTAL_METRICS, {
    period: 'day',
    metric_type: 'total_value',
    since,
    until
  });

  account.time_series = await fetchInsightsBatch(IG_USER_ID, ACCOUNT_TIME_SERIES_METRICS, {
    period: 'day',
    metric_type: 'time_series',
    since,
    until
  });

  account.demographics = {};
  for (const metric of ACCOUNT_DEMOGRAPHIC_METRICS) {
    account.demographics[metric] = {};
    for (const breakdown of DEMOGRAPHIC_BREAKDOWNS) {
      const result = await fetchInsightsBatch(IG_USER_ID, [metric], {
        period: 'lifetime',
        metric_type: 'total_value',
        timeframe: 'last_30_days',
        breakdown
      });
      account.demographics[metric][breakdown] = result[metric] ?? null;
    }
  }

  return account;
}

async function fetchRecentMedia(limit = 25) {
  const result = await graphRequest('GET', `${IG_USER_ID}/media`, {
    fields: MEDIA_FIELDS.join(','),
    limit,
    access_token: IG_ACCESS_TOKEN
  });
  return result.data || [];
}

async function fetchStories() {
  try {
    const result = await graphRequest('GET', `${IG_USER_ID}/stories`, {
      fields: MEDIA_FIELDS.join(','),
      access_token: IG_ACCESS_TOKEN
    });
    return result.data || [];
  } catch (err) {
    console.error(`Falha ao buscar stories: ${errSummary(err)}`);
    return [];
  }
}

function metricsForMedia(item, isStory) {
  if (isStory) return STORY_METRICS;
  return MEDIA_METRICS_BY_TYPE[item.media_type] || MEDIA_METRICS_BY_TYPE.IMAGE;
}

function captionPreview(caption) {
  if (!caption) return '(sem legenda)';
  const firstLine = caption.split('\n')[0];
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}...` : firstLine;
}

function loadHistory(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveHistory(filePath, history) {
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
}

async function collectMedia(collectedAt) {
  const [media, stories] = await Promise.all([fetchRecentMedia(), fetchStories()]);
  const items = [
    ...media.map(m => ({ item: m, isStory: false })),
    ...stories.map(m => ({ item: m, isStory: true }))
  ];

  const history = loadHistory(MEDIA_HISTORY_PATH);
  let newEntries = 0;

  for (const { item, isStory } of items) {
    const insights = await fetchInsightsBatch(item.id, metricsForMedia(item, isStory));

    const entry = {
      id: item.id,
      timestamp: item.timestamp,
      media_type: item.media_type,
      media_product_type: item.media_product_type ?? null,
      is_story: isStory,
      caption_preview: captionPreview(item.caption),
      permalink: item.permalink ?? null,
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

    console.log(`${item.timestamp} | ${item.media_product_type || item.media_type}${isStory ? ' (story)' : ''} | ${captionPreview(item.caption)}`);
    console.log(`  curtidas: ${item.like_count ?? '-'} | comentários: ${item.comments_count ?? '-'} | alcance: ${insights?.reach ?? '-'} | views: ${insights?.views ?? '-'} | salvos: ${insights?.saved ?? '-'} | interações: ${insights?.total_interactions ?? '-'}`);
  }

  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  saveHistory(MEDIA_HISTORY_PATH, history);

  console.log(`\n${items.length} itens verificados (${newEntries} novos). Histórico de mídia em ${MEDIA_HISTORY_PATH}`);
}

async function collectAccount(collectedAt) {
  const [profile, insights] = await Promise.all([fetchProfile(), fetchAccountInsights()]);

  const snapshot = {
    collected_at: collectedAt,
    profile: {
      username: profile.username ?? null,
      name: profile.name ?? null,
      followers_count: profile.followers_count ?? null,
      follows_count: profile.follows_count ?? null,
      media_count: profile.media_count ?? null
    },
    insights
  };

  const history = loadHistory(ACCOUNT_HISTORY_PATH);
  const existingIndex = history.findIndex(h => h.collected_at === collectedAt);
  if (existingIndex >= 0) {
    history[existingIndex] = snapshot;
  } else {
    history.push(snapshot);
  }
  history.sort((a, b) => (a.collected_at < b.collected_at ? 1 : -1));
  saveHistory(ACCOUNT_HISTORY_PATH, history);

  console.log(`\nConta @${profile.username}: ${profile.followers_count} seguidores | ${profile.media_count} posts`);
  console.log(`  alcance 30d: ${insights.totals?.reach ?? '-'} | views 30d: ${insights.totals?.views ?? '-'} | contas engajadas: ${insights.totals?.accounts_engaged ?? '-'} | visitas perfil: ${insights.totals?.profile_views ?? '-'}`);
  console.log(`Snapshot de conta em ${ACCOUNT_HISTORY_PATH}`);
}

async function main() {
  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    throw new Error('Faltam variáveis no .env: IG_ACCESS_TOKEN, IG_USER_ID');
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const collectedAt = dateKey(new Date());

  await collectAccount(collectedAt);
  await collectMedia(collectedAt);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
